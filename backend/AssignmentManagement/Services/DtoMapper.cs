using AssignmentManagement.Models.DTOs;
using AssignmentManagement.Models.Entities;

namespace AssignmentManagement.Services;

public static class DtoMapper
{
    public static AssignmentResponseDto ToAssignment(Assignment a) => new()
    {
        Id = a.Id,
        Title = a.Title,
        Description = a.Description,
        ClassSubjectId = a.ClassSubjectId,
        ClassName = a.ClassSubject?.Class?.Name ?? string.Empty,
        SubjectName = a.ClassSubject?.Subject?.Name ?? string.Empty,
        TeacherId = a.TeacherId,
        TeacherName = a.Teacher?.Name ?? string.Empty,
        Deadline = a.Deadline,
        MaxMarks = a.MaxMarks,
        Status = a.Status,
        CreatedAt = a.CreatedAt,
        UpdatedAt = a.UpdatedAt
    };

    public static SubmissionResponseDto ToSubmission(Submission s) => new()
    {
        Id = s.Id,
        AssignmentId = s.AssignmentId,
        AssignmentTitle = s.Assignment?.Title ?? string.Empty,
        StudentId = s.StudentId,
        StudentName = s.Student?.Name ?? string.Empty,
        Content = s.Content,
        Status = s.Status,
        Marks = s.Marks,
        Feedback = s.Feedback,
        SubmittedAt = s.SubmittedAt,
        CreatedAt = s.CreatedAt,
        UpdatedAt = s.UpdatedAt
    };

    public static ClassSubjectDto ToClassSubject(ClassSubject cs) => new()
    {
        Id = cs.Id,
        ClassId = cs.ClassId,
        ClassName = cs.Class?.Name ?? string.Empty,
        SubjectId = cs.SubjectId,
        SubjectName = cs.Subject?.Name ?? string.Empty
    };

    public static TeacherAssignmentDto ToTeacherAssignment(TeacherClassSubject tcs) => new()
    {
        Id = tcs.Id,
        TeacherId = tcs.TeacherId,
        TeacherName = tcs.Teacher?.Name ?? string.Empty,
        ClassSubjectId = tcs.ClassSubjectId,
        ClassName = tcs.ClassSubject?.Class?.Name ?? string.Empty,
        SubjectName = tcs.ClassSubject?.Subject?.Name ?? string.Empty,
        CreatedAt = tcs.CreatedAt
    };

    public static StudentEnrollmentDto ToStudentEnrollment(ClassStudent cs) => new()
    {
        Id = cs.Id,
        StudentId = cs.StudentId,
        StudentName = cs.Student?.Name ?? string.Empty,
        ClassId = cs.ClassId,
        ClassName = cs.Class?.Name ?? string.Empty,
        CreatedAt = cs.CreatedAt
    };
}
