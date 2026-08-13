using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using AssignmentManagement.Controllers;
using AssignmentManagement.Models.DTOs;
using AssignmentManagement.Models.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Tests;

public class ApiWorkflowTests : IDisposable
{
    private readonly AppDbContext _context;
    private WorkflowData _data = null!;

    public ApiWorkflowTests()
    {
        _context = TestHelpers.CreateContext(Guid.NewGuid().ToString());
    }

    private async Task<WorkflowData> SetupAsync()
    {
        _data = await TestHelpers.SeedWorkflowDataAsync(_context);
        return _data;
    }

    private StudentController StudentAs(User student) =>
        TestHelpers.CreateStudentController(_context, student.Id);

    private TeacherController TeacherAs(User teacher) =>
        TestHelpers.CreateTeacherController(_context, teacher.Id);

    private static int StatusCodeOf(IActionResult? result) =>
        (result as ObjectResult)?.StatusCode ?? (result as StatusCodeResult)?.StatusCode ?? 0;

    // ---- Student workflow ----

    [Fact]
    public async Task Student_CanSubmitAssignment_BeforeDeadline()
    {
        var data = await SetupAsync();
        var controller = StudentAs(data.Student1);
        var dto = new CreateSubmissionDto
        {
            AssignmentId = data.PublishedAssignment.Id,
            StudentId = data.Student1.Id,
            Content = "My answer"
        };

        var result = await controller.CreateSubmission(dto);

        var created = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        var value = created.Value.Should().BeOfType<SubmissionResponseDto>().Subject;
        value.StudentId.Should().Be(data.Student1.Id);
        value.Status.Should().Be(SubmissionStatus.Submitted);
    }

    [Fact]
    public async Task Student_SubmitToUnpublishedAssignment_ReturnsBadRequest()
    {
        var data = await SetupAsync();
        var controller = StudentAs(data.Student1);
        var dto = new CreateSubmissionDto
        {
            AssignmentId = data.DraftAssignment.Id,
            StudentId = data.Student1.Id,
            Content = "My answer"
        };

        var result = await controller.CreateSubmission(dto);

        result.Result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task Student_CannotSubmitSameAssignmentTwice_ReturnsConflict()
    {
        var data = await SetupAsync();
        var controller = StudentAs(data.Student1);
        var dto = new CreateSubmissionDto
        {
            AssignmentId = data.PublishedAssignment.Id,
            StudentId = data.Student1.Id,
            Content = "My answer"
        };

        await controller.CreateSubmission(dto);
        var second = await controller.CreateSubmission(dto);

        second.Result.Should().BeOfType<ConflictObjectResult>();
    }

    [Fact]
    public async Task Student_CannotSubmitForAnotherStudent_ReturnsForbidden()
    {
        var data = await SetupAsync();
        var controller = StudentAs(data.Student1);
        var dto = new CreateSubmissionDto
        {
            AssignmentId = data.PublishedAssignment.Id,
            StudentId = data.Student2.Id,
            Content = "Impersonation attempt"
        };

        var result = await controller.CreateSubmission(dto);

        StatusCodeOf(result.Result).Should().Be(403);
    }

    [Fact]
    public async Task Student_CannotSubmit_WhenNotEnrolledInClass_ReturnsForbidden()
    {
        var data = await SetupAsync();
        var controller = StudentAs(data.Student1);
        var dto = new CreateSubmissionDto
        {
            AssignmentId = data.OtherTeacherAssignment.Id,
            StudentId = data.Student1.Id,
            Content = "My answer"
        };

        var result = await controller.CreateSubmission(dto);

        StatusCodeOf(result.Result).Should().Be(403);
    }

    [Fact]
    public async Task Student_LateSubmission_GetsLateStatus()
    {
        var data = await SetupAsync();
        var controller = StudentAs(data.Student1);
        var dto = new CreateSubmissionDto
        {
            AssignmentId = data.PastAssignment.Id,
            StudentId = data.Student1.Id,
            Content = "Late answer"
        };

        var result = await controller.CreateSubmission(dto);

        var created = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        var value = created.Value.Should().BeOfType<SubmissionResponseDto>().Subject;
        value.Status.Should().Be(SubmissionStatus.Late);
    }

    [Fact]
    public async Task Student_CanUpdateSubmission_BeforeDeadline()
    {
        var data = await SetupAsync();
        var controller = StudentAs(data.Student1);
        await controller.CreateSubmission(new CreateSubmissionDto
        {
            AssignmentId = data.PublishedAssignment.Id,
            StudentId = data.Student1.Id,
            Content = "Original"
        });

        var submissionId = await _context.Submissions
            .Where(s => s.AssignmentId == data.PublishedAssignment.Id && s.StudentId == data.Student1.Id)
            .Select(s => s.Id)
            .FirstAsync();

        var result = await controller.UpdateSubmission(submissionId, new UpdateSubmissionDto { Content = "Updated" });

        var ok = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var value = ok.Value.Should().BeOfType<SubmissionResponseDto>().Subject;
        value.Content.Should().Be("Updated");
    }

    [Fact]
    public async Task Student_CannotUpdateSubmission_AfterDeadline()
    {
        var data = await SetupAsync();
        var controller = StudentAs(data.Student1);
        await controller.CreateSubmission(new CreateSubmissionDto
        {
            AssignmentId = data.PastAssignment.Id,
            StudentId = data.Student1.Id,
            Content = "Late answer"
        });

        var submissionId = await _context.Submissions
            .Where(s => s.AssignmentId == data.PastAssignment.Id && s.StudentId == data.Student1.Id)
            .Select(s => s.Id)
            .FirstAsync();

        var result = await controller.UpdateSubmission(submissionId, new UpdateSubmissionDto { Content = "Too late" });

        result.Result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task Student_CannotUpdateSubmission_AfterReviewed()
    {
        var data = await SetupAsync();
        var studentController = StudentAs(data.Student1);
        await studentController.CreateSubmission(new CreateSubmissionDto
        {
            AssignmentId = data.PublishedAssignment.Id,
            StudentId = data.Student1.Id,
            Content = "My answer"
        });

        var submissionId = await _context.Submissions
            .Where(s => s.AssignmentId == data.PublishedAssignment.Id && s.StudentId == data.Student1.Id)
            .Select(s => s.Id)
            .FirstAsync();

        var teacherController = TeacherAs(data.Teacher1);
        await teacherController.GradeSubmission(submissionId, new GradeSubmissionDto
        {
            Marks = 85,
            Feedback = "Well done",
            Status = SubmissionStatus.Reviewed
        });

        var result = await studentController.UpdateSubmission(submissionId, new UpdateSubmissionDto { Content = "Rewrite" });

        result.Result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task Student_CannotViewAnotherStudentsSubmission_ReturnsForbidden()
    {
        var data = await SetupAsync();
        var other = StudentAs(data.Student2);
        await other.CreateSubmission(new CreateSubmissionDto
        {
            AssignmentId = data.OtherTeacherAssignment.Id,
            StudentId = data.Student2.Id,
            Content = "Student two answer"
        });

        var submissionId = await _context.Submissions
            .Where(s => s.AssignmentId == data.OtherTeacherAssignment.Id && s.StudentId == data.Student2.Id)
            .Select(s => s.Id)
            .FirstAsync();

        var controller = StudentAs(data.Student1);
        var result = await controller.GetSubmissionById(submissionId);

        StatusCodeOf(result.Result).Should().Be(403);
    }

    [Fact]
    public async Task Student_SeesOnlyPublishedAssignments_ForEnrolledClasses()
    {
        var data = await SetupAsync();
        var controller = StudentAs(data.Student1);

        var result = await controller.GetAssignmentsForStudent();

        var ok = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var assignments = ((IEnumerable<AssignmentResponseDto>)ok.Value!).ToList();
        assignments.Should().HaveCount(2);
        assignments.Select(a => a.Id).Should().Contain(data.PublishedAssignment.Id);
        assignments.Select(a => a.Id).Should().Contain(data.PastAssignment.Id);
        assignments.Select(a => a.Id).Should().NotContain(data.DraftAssignment.Id);
        assignments.Select(a => a.Id).Should().NotContain(data.OtherTeacherAssignment.Id);
    }

    // ---- Teacher workflow ----

    [Fact]
    public async Task Teacher_CanCreateAssignment_ForAssignedClassSubject()
    {
        var data = await SetupAsync();
        var controller = TeacherAs(data.Teacher1);

        var result = await controller.CreateAssignment(new CreateAssignmentDto
        {
            Title = "New Assignment",
            Description = "Description",
            ClassSubjectId = data.ClassSubject1.Id,
            TeacherId = data.Teacher1.Id,
            Deadline = DateTime.UtcNow.AddDays(5),
            MaxMarks = 60,
            Status = AssignmentStatus.Draft
        });

        result.Result.Should().BeOfType<CreatedAtActionResult>();
        var saved = await _context.Assignments.SingleAsync(a => a.Title == "New Assignment");
        saved.TeacherId.Should().Be(data.Teacher1.Id);
        saved.Status.Should().Be(AssignmentStatus.Draft);
    }

    [Fact]
    public async Task Teacher_CannotCreateAssignment_ForUnassignedClassSubject_ReturnsForbidden()
    {
        var data = await SetupAsync();
        var controller = TeacherAs(data.Teacher1);

        var result = await controller.CreateAssignment(new CreateAssignmentDto
        {
            Title = "Should Fail",
            Description = "Description",
            ClassSubjectId = data.ClassSubject2.Id,
            TeacherId = data.Teacher1.Id,
            Deadline = DateTime.UtcNow.AddDays(5),
            MaxMarks = 60,
            Status = AssignmentStatus.Draft
        });

        StatusCodeOf(result.Result).Should().Be(403);
    }

    [Fact]
    public async Task Teacher_CannotCreateAssignment_ForAnotherTeacher_ReturnsForbidden()
    {
        var data = await SetupAsync();
        var controller = TeacherAs(data.Teacher1);

        var result = await controller.CreateAssignment(new CreateAssignmentDto
        {
            Title = "Impersonation",
            Description = "Description",
            ClassSubjectId = data.ClassSubject1.Id,
            TeacherId = data.Teacher2.Id,
            Deadline = DateTime.UtcNow.AddDays(5),
            MaxMarks = 60,
            Status = AssignmentStatus.Draft
        });

        StatusCodeOf(result.Result).Should().Be(403);
    }

    [Fact]
    public async Task Teacher_CanOnlySeeOwnAssignments()
    {
        var data = await SetupAsync();
        var controller = TeacherAs(data.Teacher1);

        var result = await controller.GetMyAssignments();

        var ok = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var assignments = ((IEnumerable<AssignmentResponseDto>)ok.Value!).ToList();
        assignments.Select(a => a.Id).Should().NotContain(data.OtherTeacherAssignment.Id);
        assignments.Select(a => a.Id).Should().Contain(data.PublishedAssignment.Id);
    }

    [Fact]
    public async Task Teacher_CannotAccessAnotherTeachersAssignment_ReturnsForbidden()
    {
        var data = await SetupAsync();
        var controller = TeacherAs(data.Teacher1);

        var result = await controller.GetAssignmentById(data.OtherTeacherAssignment.Id);

        StatusCodeOf(result.Result).Should().Be(403);
    }

    [Fact]
    public async Task Teacher_CannotDeleteAnotherTeachersAssignment_ReturnsForbidden()
    {
        var data = await SetupAsync();
        var controller = TeacherAs(data.Teacher1);

        var result = await controller.DeleteAssignment(data.OtherTeacherAssignment.Id);

        StatusCodeOf(result).Should().Be(403);
    }

    [Fact]
    public async Task Teacher_SeesOnlyOwnClassSubjects()
    {
        var data = await SetupAsync();
        var controller = TeacherAs(data.Teacher1);

        var result = await controller.GetMyClassSubjects();

        var ok = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var classSubjects = ((IEnumerable<ClassSubjectDto>)ok.Value!).ToList();
        classSubjects.Should().HaveCount(1);
        classSubjects.Single().Id.Should().Be(data.ClassSubject1.Id);
    }

    [Fact]
    public async Task Teacher_CanGradeOwnSubmission()
    {
        var data = await SetupAsync();
        await StudentAs(data.Student1).CreateSubmission(new CreateSubmissionDto
        {
            AssignmentId = data.PublishedAssignment.Id,
            StudentId = data.Student1.Id,
            Content = "My answer"
        });

        var submissionId = await _context.Submissions
            .Where(s => s.AssignmentId == data.PublishedAssignment.Id && s.StudentId == data.Student1.Id)
            .Select(s => s.Id)
            .FirstAsync();

        var controller = TeacherAs(data.Teacher1);
        var result = await controller.GradeSubmission(submissionId, new GradeSubmissionDto
        {
            Marks = 85,
            Feedback = "Good work",
            Status = SubmissionStatus.Reviewed
        });

        var ok = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var value = ok.Value.Should().BeOfType<SubmissionResponseDto>().Subject;
        value.Marks.Should().Be(85);
        value.Feedback.Should().Be("Good work");
        value.Status.Should().Be(SubmissionStatus.Reviewed);
    }

    [Fact]
    public async Task Teacher_CannotGradeAnotherTeachersSubmission_ReturnsForbidden()
    {
        var data = await SetupAsync();
        await StudentAs(data.Student2).CreateSubmission(new CreateSubmissionDto
        {
            AssignmentId = data.OtherTeacherAssignment.Id,
            StudentId = data.Student2.Id,
            Content = "Student two answer"
        });

        var submissionId = await _context.Submissions
            .Where(s => s.AssignmentId == data.OtherTeacherAssignment.Id && s.StudentId == data.Student2.Id)
            .Select(s => s.Id)
            .FirstAsync();

        var controller = TeacherAs(data.Teacher1);
        var result = await controller.GradeSubmission(submissionId, new GradeSubmissionDto
        {
            Marks = 40,
            Feedback = "Not mine to grade",
            Status = SubmissionStatus.Reviewed
        });

        StatusCodeOf(result.Result).Should().Be(403);
    }

    [Fact]
    public async Task Teacher_Grade_MarksExceedingMax_ReturnsBadRequest()
    {
        var data = await SetupAsync();
        await StudentAs(data.Student1).CreateSubmission(new CreateSubmissionDto
        {
            AssignmentId = data.PublishedAssignment.Id,
            StudentId = data.Student1.Id,
            Content = "My answer"
        });

        var submissionId = await _context.Submissions
            .Where(s => s.AssignmentId == data.PublishedAssignment.Id && s.StudentId == data.Student1.Id)
            .Select(s => s.Id)
            .FirstAsync();

        var controller = TeacherAs(data.Teacher1);
        var result = await controller.GradeSubmission(submissionId, new GradeSubmissionDto
        {
            Marks = 101,
            Feedback = "Too many marks",
            Status = SubmissionStatus.Reviewed
        });

        result.Result.Should().BeOfType<BadRequestObjectResult>();
    }

    // ---- Admin workflow ----

    [Fact]
    public async Task Admin_CreateUser_ReturnsCreated()
    {
        var data = await SetupAsync();
        var controller = TestHelpers.CreateAdminController(_context);

        var result = await controller.CreateUser(new RegisterDto
        {
            Name = "New Student",
            Email = "newstudent@example.com",
            Password = "password123",
            Role = UserRole.Student
        });

        var created = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        var value = created.Value.Should().BeOfType<UserResponseDto>().Subject;
        value.Email.Should().Be("newstudent@example.com");
        value.Role.Should().Be(UserRole.Student);
    }

    [Fact]
    public async Task Admin_CreateDuplicateUser_ReturnsConflict()
    {
        var data = await SetupAsync();
        var controller = TestHelpers.CreateAdminController(_context);

        var result = await controller.CreateUser(new RegisterDto
        {
            Name = "Dup",
            Email = data.Admin.Email,
            Password = "password123",
            Role = UserRole.Student
        });

        result.Result.Should().BeOfType<ConflictObjectResult>();
    }

    [Fact]
    public async Task Admin_UpdateSubject_Works()
    {
        var data = await SetupAsync();
        var controller = TestHelpers.CreateAdminController(_context);

        var result = await controller.UpdateSubject(data.ClassSubject1.SubjectId, new UpdateSubjectDto
        {
            Name = "Advanced Mathematics",
            Description = "Updated"
        });

        result.Should().BeOfType<NoContentResult>();
        var updated = await _context.Subjects.FindAsync(data.ClassSubject1.SubjectId);
        updated!.Name.Should().Be("Advanced Mathematics");
    }

    [Fact]
    public async Task Admin_UpdateUser_Works()
    {
        var data = await SetupAsync();
        var controller = TestHelpers.CreateAdminController(_context);

        var result = await controller.UpdateUser(data.Teacher1.Id, new UpdateUserDto
        {
            Name = "Renamed Teacher",
            Email = data.Teacher1.Email,
            Role = UserRole.Teacher
        });

        result.Should().BeOfType<NoContentResult>();
        var updated = await _context.Users.FindAsync(data.Teacher1.Id);
        updated!.Name.Should().Be("Renamed Teacher");
    }

    [Fact]
    public async Task Admin_UpdateUser_CanDeactivate()
    {
        var data = await SetupAsync();
        var controller = TestHelpers.CreateAdminController(_context);

        var result = await controller.UpdateUser(data.Teacher1.Id, new UpdateUserDto
        {
            Name = data.Teacher1.Name,
            Email = data.Teacher1.Email,
            Role = UserRole.Teacher,
            IsActive = false
        });

        result.Should().BeOfType<NoContentResult>();
        var updated = await _context.Users.FindAsync(data.Teacher1.Id);
        updated!.IsActive.Should().BeFalse();
    }

    [Fact]
    public async Task Admin_CannotDeactivateSelf_ReturnsBadRequest()
    {
        var data = await SetupAsync();
        var controller = TestHelpers.CreateAdminController(_context);
        controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() };
        controller.ControllerContext.HttpContext.User = new ClaimsPrincipal(
            new ClaimsIdentity(new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, data.Admin.Id.ToString())
            }, "test"));

        var result = await controller.UpdateUser(data.Admin.Id, new UpdateUserDto
        {
            Name = data.Admin.Name,
            Email = data.Admin.Email,
            Role = UserRole.Admin,
            IsActive = false
        });

        StatusCodeOf(result).Should().Be(400);
    }

    [Fact]
    public async Task Admin_CreateClassSubject_Duplicate_ReturnsConflict()
    {
        var data = await SetupAsync();
        var controller = TestHelpers.CreateAdminController(_context);

        var result = await controller.CreateClassSubject(new CreateClassSubjectDto
        {
            ClassId = data.ClassSubject1.ClassId,
            SubjectId = data.ClassSubject1.SubjectId
        });

        result.Result.Should().BeOfType<ConflictObjectResult>();
    }

    [Fact]
    public async Task Admin_DeleteUser_Works()
    {
        var data = await SetupAsync();
        var controller = TestHelpers.CreateAdminController(_context);

        var result = await controller.DeleteUser(data.Teacher2.Id);

        result.Should().BeOfType<NoContentResult>();
        (await _context.Users.FindAsync(data.Teacher2.Id)).Should().BeNull();
    }

    [Fact]
    public async Task Admin_CannotDemoteSelf_ReturnsBadRequest()
    {
        var data = await SetupAsync();
        var controller = TestHelpers.CreateAdminController(_context);
        controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() };
        controller.ControllerContext.HttpContext.User = new ClaimsPrincipal(
            new ClaimsIdentity(new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, data.Admin.Id.ToString())
            }, "test"));

        var result = await controller.UpdateUser(data.Admin.Id, new UpdateUserDto
        {
            Name = data.Admin.Name,
            Email = data.Admin.Email,
            Role = UserRole.Teacher
        });

        StatusCodeOf(result).Should().Be(400);
    }

    [Fact]
    public async Task Admin_CannotDeleteSelf_ReturnsBadRequest()
    {
        var data = await SetupAsync();
        var controller = TestHelpers.CreateAdminController(_context);
        controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() };
        controller.ControllerContext.HttpContext.User = new ClaimsPrincipal(
            new ClaimsIdentity(new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, data.Admin.Id.ToString())
            }, "test"));

        var result = await controller.DeleteUser(data.Admin.Id);

        StatusCodeOf(result).Should().Be(400);
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
