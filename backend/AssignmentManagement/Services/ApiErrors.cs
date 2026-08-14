using Microsoft.AspNetCore.Mvc;

namespace AssignmentManagement.Services;

public static class ApiErrors
{
    public static ProblemDetails New(int status, string message)
    {
        var title = status switch
        {
            StatusCodes.Status400BadRequest => "Bad Request",
            StatusCodes.Status401Unauthorized => "Unauthorized",
            StatusCodes.Status403Forbidden => "Forbidden",
            StatusCodes.Status404NotFound => "Not Found",
            StatusCodes.Status409Conflict => "Conflict",
            _ => "Error"
        };

        return new ProblemDetails
        {
            Status = status,
            Title = title,
            Detail = message,
            Extensions = { ["message"] = message }
        };
    }

    public static ProblemDetails BadRequest(string message) => New(StatusCodes.Status400BadRequest, message);
    public static ProblemDetails Unauthorized(string message) => New(StatusCodes.Status401Unauthorized, message);
    public static ProblemDetails Forbidden(string message) => New(StatusCodes.Status403Forbidden, message);
    public static ProblemDetails NotFound(string message) => New(StatusCodes.Status404NotFound, message);
    public static ProblemDetails Conflict(string message) => New(StatusCodes.Status409Conflict, message);
}
