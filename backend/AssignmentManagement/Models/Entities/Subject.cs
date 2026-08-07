namespace AssignmentManagement.Models.Entities;

public class Subject
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<ClassSubject> ClassSubjects { get; set; } = new List<ClassSubject>();
}
