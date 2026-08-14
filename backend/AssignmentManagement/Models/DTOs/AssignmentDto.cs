using System.ComponentModel.DataAnnotations;
using AssignmentManagement.Models.Entities;

namespace AssignmentManagement.Models.DTOs;

public class CreateAssignmentDto
{
    [Required(ErrorMessage = "Title is required")]
    [MaxLength(200, ErrorMessage = "Title cannot exceed 200 characters")]
    public string Title { get; set; } = string.Empty;

    [MaxLength(5000, ErrorMessage = "Description cannot exceed 5000 characters")]
    public string Description { get; set; } = string.Empty;

    public Guid ClassSubjectId { get; set; }

    public DateTime Deadline { get; set; }

    [Range(0.01, 1000000, ErrorMessage = "Max marks must be greater than zero")]
    public decimal MaxMarks { get; set; }

    [EnumDataType(typeof(AssignmentStatus), ErrorMessage = "Invalid assignment status")]
    public AssignmentStatus Status { get; set; } = AssignmentStatus.Draft;
}

public class UpdateAssignmentDto
{
    [Required(ErrorMessage = "Title is required")]
    [MaxLength(200, ErrorMessage = "Title cannot exceed 200 characters")]
    public string Title { get; set; } = string.Empty;

    [MaxLength(5000, ErrorMessage = "Description cannot exceed 5000 characters")]
    public string Description { get; set; } = string.Empty;

    public Guid ClassSubjectId { get; set; }

    public DateTime Deadline { get; set; }

    [Range(0.01, 1000000, ErrorMessage = "Max marks must be greater than zero")]
    public decimal MaxMarks { get; set; }

    [EnumDataType(typeof(AssignmentStatus), ErrorMessage = "Invalid assignment status")]
    public AssignmentStatus Status { get; set; }
}

public class AssignmentResponseDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid ClassSubjectId { get; set; }
    public string ClassName { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public Guid TeacherId { get; set; }
    public string TeacherName { get; set; } = string.Empty;
    public DateTime Deadline { get; set; }
    public decimal MaxMarks { get; set; }
    public AssignmentStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
