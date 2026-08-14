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
    public const string TokenCookieName = "asm_token";

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
            return Unauthorized(ApiErrors.Unauthorized("Invalid email or password"));

        SetTokenCookie(result.Token, result.ExpiresAt);
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
            return Conflict(ApiErrors.Conflict("An account with this email already exists"));

        SetTokenCookie(result.Token, result.ExpiresAt);
        return Ok(result);
    }

    [HttpPost("logout")]
    [AllowAnonymous]
    public IActionResult Logout()
    {
        Response.Cookies.Delete(TokenCookieName);
        return NoContent();
    }

    private void SetTokenCookie(string token, DateTime expiresAt)
    {
        Response.Cookies.Append(TokenCookieName, token, new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Strict,
            Expires = expiresAt
        });
    }
}
