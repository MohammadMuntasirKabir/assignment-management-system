using System.ComponentModel.DataAnnotations;
using AssignmentManagement.Models.Entities;

namespace AssignmentManagement.Models.DTOs;

public class CreateSubmissionDto
{
    public Guid AssignmentId { get; set; }

    public Guid StudentId { get; set; }

    [Required(ErrorMessage = "Submission content is required")]
    [MaxLength(20000, ErrorMessage = "Submission cannot exceed 20000 characters")]
    public string Content { get; set; } = string.Empty;
}

public class UpdateSubmissionDto
{
    [Required(ErrorMessage = "Submission content is required")]
    [MaxLength(20000, ErrorMessage = "Submission cannot exceed 20000 characters")]
    public string Content { get; set; } = string.Empty;
}

public class GradeSubmissionDto
{
    [Range(0, 1000000, ErrorMessage = "Marks cannot be negative")]
    public decimal Marks { get; set; }

    [MaxLength(2000, ErrorMessage = "Feedback cannot exceed 2000 characters")]
    public string Feedback { get; set; } = string.Empty;

    [EnumDataType(typeof(SubmissionStatus), ErrorMessage = "Invalid submission status")]
    public SubmissionStatus Status { get; set; } = SubmissionStatus.Reviewed;
}

public class SubmissionResponseDto
{
    public Guid Id { get; set; }
    public Guid AssignmentId { get; set; }
    public string AssignmentTitle { get; set; } = string.Empty;
    public Guid StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public SubmissionStatus Status { get; set; }
    public decimal? Marks { get; set; }
    public string? Feedback { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class ChangeStatusDto
{
    [EnumDataType(typeof(SubmissionStatus), ErrorMessage = "Invalid submission status")]
    public SubmissionStatus Status { get; set; }
}
