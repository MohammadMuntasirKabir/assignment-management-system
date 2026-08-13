using AssignmentManagement.Controllers;
using AssignmentManagement.Models;
using AssignmentManagement.Models.DTOs;
using AssignmentManagement.Models.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Tests;

public class AuthTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly AuthService _authService;
    private readonly JwtSettings _jwtSettings;

    public AuthTests()
    {
        _context = TestHelpers.CreateContext(Guid.NewGuid().ToString());
        _jwtSettings = new JwtSettings
        {
            SecretKey = "THIS_SHOULD_BE_REPLACED_WITH_A_SECURE_KEY_IN_PRODUCTION_USE_AT_LEAST_32_CHARS",
            ExpiryMinutes = 60,
            Issuer = "TestIssuer",
            Audience = "TestAudience"
        };
        var options = Options.Create(_jwtSettings);
        _authService = new AuthService(_context, options);
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsToken()
    {
        await TestHelpers.SeedTestDataAsync(_context);

        var dto = new LoginDto { Email = "admin@example.com", Password = "admin123" };
        var result = await _authService.LoginAsync(dto);

        result.Should().NotBeNull();
        result!.Name.Should().Be("Admin User");
        result.Email.Should().Be("admin@example.com");
        result.Role.Should().Be(UserRole.Admin);
        result.Token.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Login_WithInvalidEmail_ReturnsNull()
    {
        await TestHelpers.SeedTestDataAsync(_context);

        var dto = new LoginDto { Email = "nonexistent@example.com", Password = "admin123" };
        var result = await _authService.LoginAsync(dto);

        result.Should().BeNull();
    }

    [Fact]
    public async Task Login_WithInvalidPassword_ReturnsNull()
    {
        await TestHelpers.SeedTestDataAsync(_context);

        var dto = new LoginDto { Email = "admin@example.com", Password = "wrongpassword" };
        var result = await _authService.LoginAsync(dto);

        result.Should().BeNull();
    }

    [Fact]
    public async Task Login_DeactivatedUser_ReturnsNull()
    {
        await TestHelpers.SeedTestDataAsync(_context);

        var teacher = await _context.Users.FirstAsync(u => u.Email == "teacher@example.com");
        teacher.IsActive = false;
        await _context.SaveChangesAsync();

        var dto = new LoginDto { Email = "teacher@example.com", Password = "teacher123" };
        var result = await _authService.LoginAsync(dto);

        result.Should().BeNull();
    }

    [Fact]
    public async Task Register_WithValidData_ReturnsToken()
    {
        var dto = new RegisterDto
        {
            Name = "New User",
            Email = "newuser@example.com",
            Password = "password123",
            Role = UserRole.Student
        };
        var result = await _authService.RegisterAsync(dto);

        result.Should().NotBeNull();
        result!.Email.Should().Be("newuser@example.com");
        result.Role.Should().Be(UserRole.Student);
        result.Token.Should().NotBeEmpty();
    }

    [Fact]
    public async Task Register_WithDuplicateEmail_ReturnsNull()
    {
        await TestHelpers.SeedTestDataAsync(_context);

        var dto = new RegisterDto
        {
            Name = "Duplicate User",
            Email = "admin@example.com",
            Password = "password123",
            Role = UserRole.Student
        };
        var result = await _authService.RegisterAsync(dto);

        result.Should().BeNull();
    }

    [Fact]
    public async Task Login_TeacherCredentials_Works()
    {
        await TestHelpers.SeedTestDataAsync(_context);

        var dto = new LoginDto { Email = "teacher@example.com", Password = "teacher123" };
        var result = await _authService.LoginAsync(dto);

        result.Should().NotBeNull();
        result!.Role.Should().Be(UserRole.Teacher);
    }

    [Fact]
    public async Task Login_StudentCredentials_Works()
    {
        await TestHelpers.SeedTestDataAsync(_context);

        var dto = new LoginDto { Email = "student@example.com", Password = "student123" };
        var result = await _authService.LoginAsync(dto);

        result.Should().NotBeNull();
        result!.Role.Should().Be(UserRole.Student);
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}

public class AuthControllerTests
{
    [Fact]
    public async Task Register_PublicEndpoint_ForcesStudentRole()
    {
        RegisterDto? captured = null;
        var service = new CapturingAuthService(dto => { captured = dto; return new AuthResponseDto(); });
        var controller = new AuthController(service);

        var result = await controller.Register(new RegisterDto
        {
            Name = "Escalation Attempt",
            Email = "attacker@example.com",
            Password = "password123",
            Role = UserRole.Admin
        });

        captured.Should().NotBeNull();
        captured!.Role.Should().Be(UserRole.Student, "public registration must never escalate privileges");
        result.Result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task Register_PublicEndpoint_DuplicateEmail_ReturnsConflict()
    {
        var service = new CapturingAuthService(_ => null);
        var controller = new AuthController(service);

        var result = await controller.Register(new RegisterDto
        {
            Name = "Duplicate",
            Email = "existing@example.com",
            Password = "password123",
            Role = UserRole.Student
        });

        result.Result.Should().BeOfType<ConflictObjectResult>();
    }

    [Fact]
    public async Task Login_DeactivatedAccount_ReturnsForbidden()
    {
        var service = new CapturingAuthService(_ => null, UserStatus.Inactive);
        var controller = new AuthController(service);

        var result = await controller.Login(new LoginDto
        {
            Email = "user@example.com",
            Password = "password123"
        });

        var statusResult = Assert.IsType<ObjectResult>(result.Result);
        statusResult.StatusCode.Should().Be(StatusCodes.Status403Forbidden);
    }

    private class CapturingAuthService : IAuthService
    {
        private readonly Func<RegisterDto, AuthResponseDto?> _onRegister;
        private readonly UserStatus? _status;

        public CapturingAuthService(Func<RegisterDto, AuthResponseDto?> onRegister, UserStatus? status = null)
        {
            _onRegister = onRegister;
            _status = status;
        }

        public Task<AuthResponseDto?> LoginAsync(LoginDto dto) => Task.FromResult<AuthResponseDto?>(null);

        public Task<AuthResponseDto?> RegisterAsync(RegisterDto dto)
            => Task.FromResult(_onRegister(dto));

        public Task<User?> CreateUserAsync(RegisterDto dto) => Task.FromResult<User?>(null);

        public Task<UserStatus> GetUserStatusAsync(string email) => Task.FromResult(_status ?? UserStatus.NotFound);

        public Guid GetUserIdFromToken(System.Security.Claims.ClaimsPrincipal user) => Guid.Empty;

        public UserRole GetUserRoleFromToken(System.Security.Claims.ClaimsPrincipal user) => UserRole.Student;
    }
}
