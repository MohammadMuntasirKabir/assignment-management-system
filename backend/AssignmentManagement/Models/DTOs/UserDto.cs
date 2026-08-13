using System.ComponentModel.DataAnnotations;
using AssignmentManagement.Models.Entities;

namespace AssignmentManagement.Models.DTOs;

public class UserResponseDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UpdateUserDto
{
    [Required(ErrorMessage = "Name is required")]
    [MaxLength(100, ErrorMessage = "Name cannot exceed 100 characters")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email address")]
    [MaxLength(200)]
    public string Email { get; set; } = string.Empty;

    [EnumDataType(typeof(UserRole), ErrorMessage = "Invalid role")]
    public UserRole Role { get; set; } = UserRole.Student;
}

public class AdminTransferDto
{
    [Required(ErrorMessage = "Target account is required")]
    public Guid TargetUserId { get; set; }

    [EnumDataType(typeof(UserRole), ErrorMessage = "Invalid role")]
    public UserRole? SelfRole { get; set; }

    public bool DeleteSelf { get; set; }
}

public class AdminTransferResultDto
{
    public UserResponseDto Target { get; set; } = new();
    public AuthResponseDto? CurrentSession { get; set; }
    public bool DeletedSelf { get; set; }
}
