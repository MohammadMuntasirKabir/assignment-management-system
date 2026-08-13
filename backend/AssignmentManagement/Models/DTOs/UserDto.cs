using System.ComponentModel.DataAnnotations;
using AssignmentManagement.Models.Entities;

namespace AssignmentManagement.Models.DTOs;

public class UserResponseDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public bool IsActive { get; set; } = true;
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

    public bool IsActive { get; set; } = true;
}

public enum UserStatus
{
    Active,
    Inactive,
    NotFound
}
