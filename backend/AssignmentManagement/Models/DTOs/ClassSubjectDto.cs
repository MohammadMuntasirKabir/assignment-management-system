namespace AssignmentManagement.Models.DTOs;

public class ClassSubjectDto
{
    public Guid Id { get; set; }
    public Guid ClassId { get; set; }
    public string ClassName { get; set; } = string.Empty;
    public Guid SubjectId { get; set; }
    public string SubjectName { get; set; } = string.Empty;
}

public class CreateClassSubjectDto
{
    public Guid ClassId { get; set; }
    public Guid SubjectId { get; set; }
}

public class AssignTeacherDto
{
    public Guid TeacherId { get; set; }
    public Guid ClassSubjectId { get; set; }
}

public class EnrollStudentDto
{
    public Guid StudentId { get; set; }
    public Guid ClassId { get; set; }
}

public class TeacherAssignmentDto
{
    public Guid Id { get; set; }
    public Guid TeacherId { get; set; }
    public string TeacherName { get; set; } = string.Empty;
    public Guid ClassSubjectId { get; set; }
    public string ClassName { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class StudentEnrollmentDto
{
    public Guid Id { get; set; }
    public Guid StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public Guid ClassId { get; set; }
    public string ClassName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
