namespace AssignmentManagement.Models.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<TeacherClassSubject> TeacherClassSubjects { get; set; } = new List<TeacherClassSubject>();
    public ICollection<ClassStudent> ClassStudents { get; set; } = new List<ClassStudent>();
    public ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
    public ICollection<Submission> Submissions { get; set; } = new List<Submission>();
}

public enum UserRole
{
    Admin,
    Teacher,
    Student
}
