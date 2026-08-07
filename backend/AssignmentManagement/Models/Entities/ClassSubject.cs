namespace AssignmentManagement.Models.Entities;

public class ClassSubject
{
    public Guid Id { get; set; }
    public Guid ClassId { get; set; }
    public Class Class { get; set; } = null!;
    public Guid SubjectId { get; set; }
    public Subject Subject { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<TeacherClassSubject> TeacherClassSubjects { get; set; } = new List<TeacherClassSubject>();
    public ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
}
