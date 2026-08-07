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
