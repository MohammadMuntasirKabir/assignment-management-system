using System.IdentityModel.Tokens.Jwt;
using AssignmentManagement.Data;

namespace AssignmentManagement.Middleware;

public class ActiveUserMiddleware
{
    private readonly RequestDelegate _next;

    public ActiveUserMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, IServiceScopeFactory scopeFactory)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var userIdClaim = context.User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            if (Guid.TryParse(userIdClaim, out var userId))
            {
                using var scope = scopeFactory.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var user = await dbContext.Users.FindAsync(userId);
                if (user == null || !user.IsActive)
                {
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    await context.Response.WriteAsJsonAsync(new { message = "This account is no longer active." });
                    return;
                }
            }
        }

        await _next(context);
    }
}
