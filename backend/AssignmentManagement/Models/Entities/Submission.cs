namespace AssignmentManagement.Models.Entities;

public class Submission
{
    public Guid Id { get; set; }
    public Guid AssignmentId { get; set; }
    public Assignment Assignment { get; set; } = null!;
    public Guid StudentId { get; set; }
    public User Student { get; set; } = null!;
    public string Content { get; set; } = string.Empty;
    public SubmissionStatus Status { get; set; }
    public decimal? Marks { get; set; }
    public string? Feedback { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public enum SubmissionStatus
{
    Draft,
    Submitted,
    Late,
    Reviewed
}
