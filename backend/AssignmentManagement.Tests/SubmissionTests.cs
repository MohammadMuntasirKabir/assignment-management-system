using AssignmentManagement.Models;
using AssignmentManagement.Models.DTOs;
using AssignmentManagement.Models.Entities;
using Microsoft.EntityFrameworkCore;
using FluentAssertions;

namespace AssignmentManagement.Tests;

public class SubmissionTests : IDisposable
{
    private readonly AppDbContext _context;

    public SubmissionTests()
    {
        _context = TestHelpers.CreateContext(Guid.NewGuid().ToString());
    }

    private async Task<(Assignment assignment, User student, User teacher, ClassSubject classSubject)> SetupAsync()
    {
        await TestHelpers.SeedTestDataAsync(_context);

        var teacher = await _context.Users.FirstAsync(u => u.Role == UserRole.Teacher);
        var student = await _context.Users.FirstAsync(u => u.Role == UserRole.Student);
        var classSubject = await _context.ClassSubjects.FirstAsync();

        var futureAssignment = new Assignment
        {
            Id = Guid.NewGuid(),
            Title = "Future Assignment",
            Description = "Due in the future",
            ClassSubjectId = classSubject.Id,
            TeacherId = teacher.Id,
            Deadline = DateTime.UtcNow.AddDays(7),
            MaxMarks = 100,
            Status = AssignmentStatus.Published,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var pastAssignment = new Assignment
        {
            Id = Guid.NewGuid(),
            Title = "Past Assignment",
            Description = "Already due",
            ClassSubjectId = classSubject.Id,
            TeacherId = teacher.Id,
            Deadline = DateTime.UtcNow.AddDays(-1),
            MaxMarks = 50,
            Status = AssignmentStatus.Published,
            CreatedAt = DateTime.UtcNow.AddDays(-5),
            UpdatedAt = DateTime.UtcNow.AddDays(-5)
        };

        await _context.Assignments.AddRangeAsync(futureAssignment, pastAssignment);
        await _context.SaveChangesAsync();

        return (futureAssignment, student, teacher, classSubject);
    }

    [Fact]
    public async Task Student_CanSubmitAssignment_BeforeDeadline()
    {
        var (assignment, student, _, _) = await SetupAsync();

        var submission = new Submission
        {
            Id = Guid.NewGuid(),
            AssignmentId = assignment.Id,
            StudentId = student.Id,
            Content = "This is my submission.",
            Status = SubmissionStatus.Submitted,
            SubmittedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Submissions.Add(submission);
        await _context.SaveChangesAsync();

        var result = await _context.Submissions.FirstAsync(s => s.AssignmentId == assignment.Id);
        result.Status.Should().Be(SubmissionStatus.Submitted);
        result.Content.Should().Be("This is my submission.");
    }

    [Fact]
    public async Task Student_LateSubmission_GetsLateStatus()
    {
        var (_, student, _, _) = await SetupAsync();
        var pastAssignment = await _context.Assignments.FirstAsync(a => a.Title == "Past Assignment");

        var submission = new Submission
        {
            Id = Guid.NewGuid(),
            AssignmentId = pastAssignment.Id,
            StudentId = student.Id,
            Content = "Late submission content.",
            Status = SubmissionStatus.Late,
            SubmittedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Submissions.Add(submission);
        await _context.SaveChangesAsync();

        var result = await _context.Submissions.FirstAsync(s => s.AssignmentId == pastAssignment.Id);
        result.Status.Should().Be(SubmissionStatus.Late);
    }

    [Fact]
    public async Task Student_CannotSubmitSameAssignmentTwice()
    {
        var (assignment, student, _, _) = await SetupAsync();

        var firstSubmission = new Submission
        {
            Id = Guid.NewGuid(),
            AssignmentId = assignment.Id,
            StudentId = student.Id,
            Content = "First submission.",
            Status = SubmissionStatus.Submitted,
            SubmittedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Submissions.Add(firstSubmission);
        await _context.SaveChangesAsync();

        var existing = await _context.Submissions
            .FirstOrDefaultAsync(s => s.AssignmentId == assignment.Id && s.StudentId == student.Id);

        existing.Should().NotBeNull();
        existing!.Id.Should().Be(firstSubmission.Id);
    }

    [Fact]
    public async Task Student_CanUpdateSubmission_BeforeDeadline()
    {
        var (assignment, student, _, _) = await SetupAsync();

        var submission = new Submission
        {
            Id = Guid.NewGuid(),
            AssignmentId = assignment.Id,
            StudentId = student.Id,
            Content = "Original content.",
            Status = SubmissionStatus.Submitted,
            SubmittedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Submissions.Add(submission);
        await _context.SaveChangesAsync();

        submission.Content = "Updated content.";
        submission.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var result = await _context.Submissions.FirstAsync(s => s.Id == submission.Id);
        result.Content.Should().Be("Updated content.");
    }

    [Fact]
    public async Task Teacher_CanGradeSubmission_WithMarksAndFeedback()
    {
        var (assignment, student, _, _) = await SetupAsync();

        var submission = new Submission
        {
            Id = Guid.NewGuid(),
            AssignmentId = assignment.Id,
            StudentId = student.Id,
            Content = "Student submission.",
            Status = SubmissionStatus.Submitted,
            SubmittedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Submissions.Add(submission);
        await _context.SaveChangesAsync();

        submission.Marks = 85;
        submission.Feedback = "Great job! Well done.";
        submission.Status = SubmissionStatus.Reviewed;
        submission.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var result = await _context.Submissions.FirstAsync(s => s.Id == submission.Id);
        result.Marks.Should().Be(85);
        result.Feedback.Should().Be("Great job! Well done.");
        result.Status.Should().Be(SubmissionStatus.Reviewed);
    }

    [Fact]
    public async Task Submission_PreventsDuplicateStudentAssignmentPair()
    {
        await TestHelpers.SeedTestDataAsync(_context);

        var student = await _context.Users.FirstAsync(u => u.Role == UserRole.Student);
        var assignment = await _context.Assignments.FirstAsync();

        var s1 = new Submission
        {
            Id = Guid.NewGuid(),
            AssignmentId = assignment.Id,
            StudentId = student.Id,
            Content = "Sub 1",
            Status = SubmissionStatus.Submitted,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Submissions.Add(s1);
        await _context.SaveChangesAsync();

        var existing = await _context.Submissions
            .FirstOrDefaultAsync(s => s.AssignmentId == assignment.Id && s.StudentId == student.Id);

        existing.Should().NotBeNull();
        existing!.Content.Should().Be("Sub 1");
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
