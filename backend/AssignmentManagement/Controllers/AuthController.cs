using AssignmentManagement.Models.DTOs;
using AssignmentManagement.Models.Entities;
using AssignmentManagement.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentManagement.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto dto)
    {
        var result = await _authService.LoginAsync(dto);
        if (result == null)
            return Unauthorized(new { message = "Invalid email or password" });

        return Ok(result);
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto dto)
    {
        // Public self-registration can never choose a privileged role.
        // Role changes are an admin-only operation.
        dto.Role = UserRole.Student;

        var result = await _authService.RegisterAsync(dto);
        if (result == null)
            return Conflict(new { message = "An account with this email already exists" });

        return Ok(result);
    }
}
