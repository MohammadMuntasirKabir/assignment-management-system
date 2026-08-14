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
            Content = "My answer"
        };

        await controller.CreateSubmission(dto);
        var second = await controller.CreateSubmission(dto);

        second.Result.Should().BeOfType<ConflictObjectResult>();
    }

    [Fact]
    public async Task Student_SubmissionOwnerComesFromToken_NotFromDto()
    {
        var data = await SetupAsync();
        var controller = StudentAs(data.Student1);
        var dto = new CreateSubmissionDto
        {
            AssignmentId = data.PublishedAssignment.Id,
            Content = "My answer"
        };

        var result = await controller.CreateSubmission(dto);

        var created = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        var value = created.Value.Should().BeOfType<SubmissionResponseDto>().Subject;
        value.StudentId.Should().Be(data.Student1.Id);
    }

    [Fact]
    public async Task Student_CannotSubmit_WhenNotEnrolledInClass_ReturnsForbidden()
    {
        var data = await SetupAsync();
        var controller = StudentAs(data.Student1);
        var dto = new CreateSubmissionDto
        {
            AssignmentId = data.OtherTeacherAssignment.Id,
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
            Deadline = DateTime.UtcNow.AddDays(5),
            MaxMarks = 60,
            Status = AssignmentStatus.Draft
        });

        StatusCodeOf(result.Result).Should().Be(403);
    }

    [Fact]
    public async Task Teacher_AssignmentOwnerComesFromToken_NotFromDto()
    {
        var data = await SetupAsync();
        var controller = TeacherAs(data.Teacher1);

        var result = await controller.CreateAssignment(new CreateAssignmentDto
        {
            Title = "Token Identity",
            Description = "Description",
            ClassSubjectId = data.ClassSubject1.Id,
            Deadline = DateTime.UtcNow.AddDays(5),
            MaxMarks = 60,
            Status = AssignmentStatus.Draft
        });

        var ok = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        var created = (AssignmentResponseDto)ok.Value!;
        created.TeacherId.Should().Be(data.Teacher1.Id);
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
    public async Task Admin_CannotPromoteViaUpdate_ReturnsBadRequest()
    {
        var data = await SetupAsync();
        var controller = TestHelpers.CreateAdminController(_context);

        var result = await controller.UpdateUser(data.Teacher1.Id, new UpdateUserDto
        {
            Name = data.Teacher1.Name,
            Email = data.Teacher1.Email,
            Role = UserRole.Admin
        });

        StatusCodeOf(result).Should().Be(400);
    }

    [Fact]
    public async Task Admin_CannotCreateAdminAccount_ReturnsBadRequest()
    {
        var data = await SetupAsync();
        var controller = TestHelpers.CreateAdminController(_context);

        var result = await controller.CreateUser(new RegisterDto
        {
            Name = "Wannabe Admin",
            Email = "wannabe@example.com",
            Password = "password123",
            Role = UserRole.Admin
        });

        StatusCodeOf(result.Result).Should().Be(400);
        (await _context.Users.FirstOrDefaultAsync(u => u.Email == "wannabe@example.com"))
            .Should().BeNull();
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
    public async Task Admin_UpdateClassSubject_Works()
    {
        var data = await SetupAsync();
        var controller = TestHelpers.CreateAdminController(_context);
        var class2 = await _context.Classes.SingleAsync(c => c.Id != data.ClassSubject1.ClassId);

        var result = await controller.UpdateClassSubject(data.ClassSubject1.Id, new CreateClassSubjectDto
        {
            ClassId = class2.Id,
            SubjectId = data.ClassSubject1.SubjectId
        });

        var ok = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var dto = (ok.Value as ClassSubjectDto)!;
        dto.ClassId.Should().Be(class2.Id);
        dto.ClassName.Should().Be(class2.Name);
    }

    [Fact]
    public async Task Admin_UpdateClassSubject_Duplicate_ReturnsConflict()
    {
        var data = await SetupAsync();
        var controller = TestHelpers.CreateAdminController(_context);

        var result = await controller.UpdateClassSubject(data.ClassSubject1.Id, new CreateClassSubjectDto
        {
            ClassId = data.ClassSubject2.ClassId,
            SubjectId = data.ClassSubject2.SubjectId
        });

        result.Result.Should().BeOfType<ConflictObjectResult>();
    }

    [Fact]
    public async Task Admin_UpdateClassSubject_NotFound_Returns404()
    {
        await SetupAsync();
        var controller = TestHelpers.CreateAdminController(_context);
        var data = _data;

        var result = await controller.UpdateClassSubject(Guid.NewGuid(), new CreateClassSubjectDto
        {
            ClassId = data.ClassSubject1.ClassId,
            SubjectId = data.ClassSubject1.SubjectId
        });

        result.Result.Should().BeOfType<NotFoundObjectResult>();
    }

    [Fact]
    public async Task Admin_DeleteUser_Works()
    {
        await SetupAsync();
        var controller = TestHelpers.CreateAdminController(_context);

        var newUser = new User
        {
            Id = Guid.NewGuid(),
            Name = "Unreferenced User",
            Email = "unreferenced@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
            Role = UserRole.Student,
            CreatedAt = DateTime.UtcNow
        };
        _context.Users.Add(newUser);
        await _context.SaveChangesAsync();

        var result = await controller.DeleteUser(newUser.Id);

        result.Should().BeOfType<NoContentResult>();
        (await _context.Users.FindAsync(newUser.Id)).Should().BeNull();
    }

    [Fact]
    public async Task Admin_CannotDeleteReferencedUser_ReturnsBadRequest()
    {
        using var db = new SqliteTestDb();
        var now = DateTime.UtcNow;
        var admin = new User
        {
            Id = Guid.NewGuid(),
            Name = "Admin",
            Email = "admin@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
            Role = UserRole.Admin,
            CreatedAt = now
        };
        var teacher = new User
        {
            Id = Guid.NewGuid(),
            Name = "Referenced Teacher",
            Email = "refteacher@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("teacher123"),
            Role = UserRole.Teacher,
            CreatedAt = now
        };
        var classEntity = new Class { Id = Guid.NewGuid(), Name = "Class", Description = "", CreatedAt = now };
        var subject = new Subject { Id = Guid.NewGuid(), Name = "Subject", Description = "", CreatedAt = now };
        var classSubject = new ClassSubject
        {
            Id = Guid.NewGuid(),
            ClassId = classEntity.Id,
            SubjectId = subject.Id,
            CreatedAt = now
        };
        db.Context.Users.AddRange(admin, teacher);
        db.Context.Classes.Add(classEntity);
        db.Context.Subjects.Add(subject);
        db.Context.ClassSubjects.Add(classSubject);
        db.Context.TeacherClassSubjects.Add(new TeacherClassSubject
        {
            Id = Guid.NewGuid(),
            TeacherId = teacher.Id,
            ClassSubjectId = classSubject.Id,
            CreatedAt = now
        });
        await db.Context.SaveChangesAsync();
        db.Context.ChangeTracker.Clear();

        var controller = TestHelpers.CreateAdminController(db.Context);
        controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() };
        controller.ControllerContext.HttpContext.User = new ClaimsPrincipal(
            new ClaimsIdentity(new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, admin.Id.ToString())
            }, "test"));

        var result = await controller.DeleteUser(teacher.Id);

        result.Should().BeOfType<BadRequestObjectResult>();
        StatusCodeOf(result).Should().Be(400);
        (await db.Context.Users.FindAsync(teacher.Id)).Should().NotBeNull();
    }

    [Fact]
    public async Task Admin_CannotDeleteUserWithTrackedReferences_ReturnsBadRequest()
    {
        var data = await SetupAsync();
        var controller = TestHelpers.CreateAdminController(_context);
        controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() };
        controller.ControllerContext.HttpContext.User = new ClaimsPrincipal(
            new ClaimsIdentity(new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, data.Admin.Id.ToString())
            }, "test"));

        var result = await controller.DeleteUser(data.Teacher1.Id);

        result.Should().BeOfType<BadRequestObjectResult>();
        StatusCodeOf(result).Should().Be(400);
        (await _context.Users.FindAsync(data.Teacher1.Id)).Should().NotBeNull();
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
    public async Task Admin_Transfer_PromotesTargetAndDemotesSelf()
    {
        var data = await SetupAsync();
        var controller = TestHelpers.CreateAdminController(_context);
        controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() };
        controller.ControllerContext.HttpContext.User = new ClaimsPrincipal(
            new ClaimsIdentity(new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, data.Admin.Id.ToString())
            }, "test"));

        var result = await controller.TransferAdmin(new AdminTransferDto
        {
            TargetUserId = data.Teacher1.Id,
            SelfRole = UserRole.Teacher
        });

        var okResult = Assert.IsType<OkObjectResult>(result);
        okResult.StatusCode.Should().Be(200);

        var target = await _context.Users.FindAsync(data.Teacher1.Id);
        var caller = await _context.Users.FindAsync(data.Admin.Id);
        target!.Role.Should().Be(UserRole.Admin);
        caller!.Role.Should().Be(UserRole.Teacher);

        var admins = await _context.Users.CountAsync(u => u.Role == UserRole.Admin);
        admins.Should().Be(1, "there can only be one admin");

        var payload = Assert.IsType<AdminTransferResultDto>(okResult.Value);
        payload.DeletedSelf.Should().BeFalse();
        payload.Target.Id.Should().Be(data.Teacher1.Id);
        payload.Target.Role.Should().Be(UserRole.Admin);
        payload.CurrentSession.Should().NotBeNull();
        payload.CurrentSession!.Role.Should().Be(UserRole.Teacher);
        payload.CurrentSession.Token.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Admin_Transfer_DeleteSelf_PromotesTarget()
    {
        var data = await SetupAsync();
        var controller = TestHelpers.CreateAdminController(_context);
        controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() };
        controller.ControllerContext.HttpContext.User = new ClaimsPrincipal(
            new ClaimsIdentity(new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, data.Admin.Id.ToString())
            }, "test"));

        var result = await controller.TransferAdmin(new AdminTransferDto
        {
            TargetUserId = data.Teacher1.Id,
            DeleteSelf = true
        });

        Assert.IsType<OkObjectResult>(result).Should().NotBeNull();

        (await _context.Users.FindAsync(data.Admin.Id)).Should().BeNull();
        var target = await _context.Users.FindAsync(data.Teacher1.Id);
        target!.Role.Should().Be(UserRole.Admin);

        var admins = await _context.Users.CountAsync(u => u.Role == UserRole.Admin);
        admins.Should().Be(1, "there can only be one admin");
    }

    [Fact]
    public async Task Admin_Transfer_RequiresRoleOrDelete_ReturnsBadRequest()
    {
        var data = await SetupAsync();
        var controller = TestHelpers.CreateAdminController(_context);
        controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() };
        controller.ControllerContext.HttpContext.User = new ClaimsPrincipal(
            new ClaimsIdentity(new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, data.Admin.Id.ToString())
            }, "test"));

        var result = await controller.TransferAdmin(new AdminTransferDto
        {
            TargetUserId = data.Teacher1.Id
        });

        StatusCodeOf(result).Should().Be(400);
    }

    [Fact]
    public async Task Admin_Transfer_ToSelf_ReturnsBadRequest()
    {
        var data = await SetupAsync();
        var controller = TestHelpers.CreateAdminController(_context);
        controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() };
        controller.ControllerContext.HttpContext.User = new ClaimsPrincipal(
            new ClaimsIdentity(new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, data.Admin.Id.ToString())
            }, "test"));

        var result = await controller.TransferAdmin(new AdminTransferDto
        {
            TargetUserId = data.Admin.Id,
            DeleteSelf = true
        });

        StatusCodeOf(result).Should().Be(400);
    }

    [Fact]
    public async Task Admin_Transfer_ToExistingAdmin_ReturnsBadRequest()
    {
        var data = await SetupAsync();
        var secondAdmin = await _context.Users.FindAsync(data.Teacher1.Id);
        secondAdmin!.Role = UserRole.Admin;
        await _context.SaveChangesAsync();

        var controller = TestHelpers.CreateAdminController(_context);
        controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() };
        controller.ControllerContext.HttpContext.User = new ClaimsPrincipal(
            new ClaimsIdentity(new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, data.Admin.Id.ToString())
            }, "test"));

        var result = await controller.TransferAdmin(new AdminTransferDto
        {
            TargetUserId = data.Teacher1.Id,
            DeleteSelf = true
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

    // ---- Teacher assignments & enrollments (admin) ----

    [Fact]
    public async Task Admin_GetTeacherAssignments_ReturnsListWithNames()
    {
        var data = await SetupAsync();
        var controller = TestHelpers.CreateAdminController(_context);

        var result = await controller.GetTeacherAssignments();

        var ok = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var items = (ok.Value as IEnumerable<TeacherAssignmentDto>)!.ToList();
        items.Should().HaveCount(2);
        items.Should().ContainSingle(a => a.TeacherId == data.Teacher1.Id
            && a.ClassName == data.ClassSubject1.Class.Name
            && a.SubjectName == data.ClassSubject1.Subject.Name);
    }

    [Fact]
    public async Task Admin_AssignTeacher_ReturnsCreatedAssignment()
    {
        var data = await SetupAsync();
        var controller = TestHelpers.CreateAdminController(_context);

        var result = await controller.AssignTeacher(new AssignTeacherDto
        {
            TeacherId = data.Teacher2.Id,
            ClassSubjectId = data.ClassSubject1.Id
        });

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        var dto = (ok.Value as TeacherAssignmentDto)!;
        dto.TeacherId.Should().Be(data.Teacher2.Id);
        dto.TeacherName.Should().Be(data.Teacher2.Name);
        dto.ClassName.Should().Be(data.ClassSubject1.Class.Name);
        dto.SubjectName.Should().Be(data.ClassSubject1.Subject.Name);
    }

    [Fact]
    public async Task Admin_AssignTeacher_Duplicate_ReturnsConflict()
    {
        var data = await SetupAsync();
        var controller = TestHelpers.CreateAdminController(_context);

        var result = await controller.AssignTeacher(new AssignTeacherDto
        {
            TeacherId = data.Teacher1.Id,
            ClassSubjectId = data.ClassSubject1.Id
        });

        result.Should().BeOfType<ConflictObjectResult>();
    }

    [Fact]
    public async Task Admin_AssignTeacher_UnknownTeacher_ReturnsNotFound()
    {
        var data = await SetupAsync();
        var controller = TestHelpers.CreateAdminController(_context);

        var result = await controller.AssignTeacher(new AssignTeacherDto
        {
            TeacherId = Guid.NewGuid(),
            ClassSubjectId = data.ClassSubject1.Id
        });

        result.Should().BeOfType<NotFoundObjectResult>();
    }

    [Fact]
    public async Task Admin_AssignStudent_AsTeacher_ReturnsNotFound()
    {
        var data = await SetupAsync();
        var controller = TestHelpers.CreateAdminController(_context);

        var result = await controller.AssignTeacher(new AssignTeacherDto
        {
            TeacherId = data.Student1.Id,
            ClassSubjectId = data.ClassSubject1.Id
        });

        result.Should().BeOfType<NotFoundObjectResult>();
    }

    [Fact]
    public async Task Admin_DeleteTeacherAssignment_Works()
    {
        var data = await SetupAsync();
        var controller = TestHelpers.CreateAdminController(_context);
        var entity = await _context.TeacherClassSubjects.SingleAsync(tcs =>
            tcs.TeacherId == data.Teacher1.Id && tcs.ClassSubjectId == data.ClassSubject1.Id);

        var result = await controller.DeleteTeacherAssignment(entity.Id);

        result.Should().BeOfType<NoContentResult>();
        (await _context.TeacherClassSubjects.FindAsync(entity.Id)).Should().BeNull();
    }

    [Fact]
    public async Task Admin_DeleteTeacherAssignment_NotFound_Returns404()
    {
        await SetupAsync();
        var controller = TestHelpers.CreateAdminController(_context);

        var result = await controller.DeleteTeacherAssignment(Guid.NewGuid());

        result.Should().BeOfType<NotFoundObjectResult>();
    }

    [Fact]
    public async Task Admin_GetEnrollments_ReturnsListWithNames()
    {
        var data = await SetupAsync();
        var controller = TestHelpers.CreateAdminController(_context);

        var result = await controller.GetEnrollments();

        var ok = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var items = (ok.Value as IEnumerable<StudentEnrollmentDto>)!.ToList();
        items.Should().HaveCount(2);
        items.Should().ContainSingle(e => e.StudentId == data.Student1.Id
            && e.ClassName == data.Class1.Name);
    }

    [Fact]
    public async Task Admin_EnrollStudent_ReturnsCreatedEnrollment()
    {
        var data = await SetupAsync();
        var controller = TestHelpers.CreateAdminController(_context);

        var result = await controller.EnrollStudent(new EnrollStudentDto
        {
            StudentId = data.Student1.Id,
            ClassId = data.ClassSubject2.ClassId
        });

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        var dto = (ok.Value as StudentEnrollmentDto)!;
        dto.StudentId.Should().Be(data.Student1.Id);
        dto.StudentName.Should().Be(data.Student1.Name);
        dto.ClassId.Should().Be(data.ClassSubject2.ClassId);
    }

    [Fact]
    public async Task Admin_EnrollStudent_Duplicate_ReturnsConflict()
    {
        var data = await SetupAsync();
        var controller = TestHelpers.CreateAdminController(_context);

        var result = await controller.EnrollStudent(new EnrollStudentDto
        {
            StudentId = data.Student1.Id,
            ClassId = data.Class1.Id
        });

        result.Should().BeOfType<ConflictObjectResult>();
    }

    [Fact]
    public async Task Admin_EnrollStudent_UnknownStudent_ReturnsNotFound()
    {
        var data = await SetupAsync();
        var controller = TestHelpers.CreateAdminController(_context);

        var result = await controller.EnrollStudent(new EnrollStudentDto
        {
            StudentId = Guid.NewGuid(),
            ClassId = data.Class1.Id
        });

        result.Should().BeOfType<NotFoundObjectResult>();
    }

    [Fact]
    public async Task Admin_EnrollTeacher_AsStudent_ReturnsNotFound()
    {
        var data = await SetupAsync();
        var controller = TestHelpers.CreateAdminController(_context);

        var result = await controller.EnrollStudent(new EnrollStudentDto
        {
            StudentId = data.Teacher1.Id,
            ClassId = data.Class1.Id
        });

        result.Should().BeOfType<NotFoundObjectResult>();
    }

    [Fact]
    public async Task Admin_DeleteEnrollment_Works()
    {
        var data = await SetupAsync();
        var controller = TestHelpers.CreateAdminController(_context);
        var entity = await _context.ClassStudents.SingleAsync(cs =>
            cs.StudentId == data.Student1.Id && cs.ClassId == data.Class1.Id);

        var result = await controller.DeleteEnrollment(entity.Id);

        result.Should().BeOfType<NoContentResult>();
        (await _context.ClassStudents.FindAsync(entity.Id)).Should().BeNull();
    }

    [Fact]
    public async Task Admin_DeleteEnrollment_NotFound_Returns404()
    {
        await SetupAsync();
        var controller = TestHelpers.CreateAdminController(_context);

        var result = await controller.DeleteEnrollment(Guid.NewGuid());

        result.Should().BeOfType<NotFoundObjectResult>();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
