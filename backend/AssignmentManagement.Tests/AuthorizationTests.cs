using System.Reflection;
using AssignmentManagement.Controllers;
using Microsoft.AspNetCore.Authorization;

namespace AssignmentManagement.Tests;

public class AuthorizationTests
{
    [Fact]
    public void AdminController_RequiresAdminRole()
    {
        typeof(AdminController)
            .GetCustomAttribute<AuthorizeAttribute>()
            .Should().NotBeNull();
        typeof(AdminController)
            .GetCustomAttribute<AuthorizeAttribute>()!
            .Roles.Should().Be("Admin");
    }

    [Fact]
    public void TeacherController_RequiresTeacherRole()
    {
        typeof(TeacherController)
            .GetCustomAttribute<AuthorizeAttribute>()
            .Should().NotBeNull();
        typeof(TeacherController)
            .GetCustomAttribute<AuthorizeAttribute>()!
            .Roles.Should().Be("Teacher");
    }

    [Fact]
    public void StudentController_RequiresStudentRole()
    {
        typeof(StudentController)
            .GetCustomAttribute<AuthorizeAttribute>()
            .Should().NotBeNull();
        typeof(StudentController)
            .GetCustomAttribute<AuthorizeAttribute>()!
            .Roles.Should().Be("Student");
    }

    [Fact]
    public void LoginEndpoint_IsAnonymous()
    {
        var loginMethod = typeof(AuthController).GetMethod(nameof(AuthController.Login))!;
        loginMethod.GetCustomAttribute<AllowAnonymousAttribute>()
            .Should().NotBeNull();
    }

    [Fact]
    public void EveryAdminEndpoint_HasGuidRouteConstraint_ForIdBasedActions()
    {
        var actions = typeof(AdminController).GetMethods(BindingFlags.Public | BindingFlags.Instance)
            .Where(m => m.Name.Contains("ById", StringComparison.Ordinal) ||
                        m.GetParameters().Any(p => p.Name == "id"));

        actions.Should().NotBeEmpty();
        foreach (var action in actions)
        {
            var template = action.GetCustomAttributes<Microsoft.AspNetCore.Mvc.Routing.HttpMethodAttribute>()
                .Select(a => a.Template)
                .FirstOrDefault();
            template.Should().Contain("{id:guid}", $"{action.Name} should use a GUID route constraint");
        }
    }
}
