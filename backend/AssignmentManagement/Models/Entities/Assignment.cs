namespace AssignmentManagement.Models.Entities;

public class Assignment
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid ClassSubjectId { get; set; }
    public ClassSubject ClassSubject { get; set; } = null!;
    public Guid TeacherId { get; set; }
    public User Teacher { get; set; } = null!;
    public DateTime Deadline { get; set; }
    public decimal MaxMarks { get; set; }
    public AssignmentStatus Status { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Submission> Submissions { get; set; } = new List<Submission>();
}

public enum AssignmentStatus
{
    Draft,
    Published
}
