namespace AssignmentManagement.Models.Entities;

public class ClassStudent
{
    public Guid Id { get; set; }
    public Guid ClassId { get; set; }
    public Class Class { get; set; } = null!;
    public Guid StudentId { get; set; }
    public User Student { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
