namespace AssignmentManagement.Models.Entities;

public class TeacherClassSubject
{
    public Guid Id { get; set; }
    public Guid TeacherId { get; set; }
    public User Teacher { get; set; } = null!;
    public Guid ClassSubjectId { get; set; }
    public ClassSubject ClassSubject { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
