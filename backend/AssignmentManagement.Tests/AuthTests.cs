using AssignmentManagement.Models;
using AssignmentManagement.Models.DTOs;
using Microsoft.Extensions.Options;
using FluentAssertions;

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
