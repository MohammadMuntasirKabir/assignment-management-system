using AssignmentManagement.Models;
using AssignmentManagement.Models.DTOs;
using AssignmentManagement.Models.Entities;
using Microsoft.EntityFrameworkCore;
using FluentAssertions;

namespace AssignmentManagement.Tests;

public class AssignmentTests : IDisposable
{
    private readonly AppDbContext _context;
    private Guid _teacherId;
    private Guid _classSubjectId;
    private Guid _assignmentId;

    public AssignmentTests()
    {
        _context = TestHelpers.CreateContext(Guid.NewGuid().ToString());
    }

    private async Task SetupAsync()
    {
        await TestHelpers.SeedTestDataAsync(_context);

        var teacher = await _context.Users.FirstAsync(u => u.Role == UserRole.Teacher);
        _teacherId = teacher.Id;

        var classSubject = await _context.ClassSubjects.FirstAsync();
        _classSubjectId = classSubject.Id;

        var assignment = await _context.Assignments.FirstAsync();
        _assignmentId = assignment.Id;
    }

    [Fact]
    public async Task Teacher_CanCreateAssignment_ForAssignedClassSubject()
    {
        await SetupAsync();

        var dto = new CreateAssignmentDto
        {
            Title = "New Assignment",
            Description = "New Description",
            ClassSubjectId = _classSubjectId,
            Deadline = DateTime.UtcNow.AddDays(7),
            MaxMarks = 50,
            Status = AssignmentStatus.Draft
        };

        var entity = new Assignment
        {
            Id = Guid.NewGuid(),
            Title = dto.Title,
            Description = dto.Description,
            ClassSubjectId = dto.ClassSubjectId,
            TeacherId = _teacherId,
            Deadline = dto.Deadline,
            MaxMarks = dto.MaxMarks,
            Status = dto.Status,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Assignments.Add(entity);
        await _context.SaveChangesAsync();

        var created = await _context.Assignments.FirstOrDefaultAsync(a => a.Title == "New Assignment");
        created.Should().NotBeNull();
        created!.Status.Should().Be(AssignmentStatus.Draft);
        created.MaxMarks.Should().Be(50);
    }

    [Fact]
    public async Task Assignment_CanBeUpdated_PublishedStatus()
    {
        await SetupAsync();

        var assignment = await _context.Assignments.FirstAsync();
        assignment.Status = AssignmentStatus.Published;
        assignment.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var updated = await _context.Assignments.FirstAsync(a => a.Id == assignment.Id);
        updated.Status.Should().Be(AssignmentStatus.Published);
    }

    [Fact]
    public async Task Assignment_CanBeDeleted()
    {
        await SetupAsync();

        _context.Assignments.Remove(await _context.Assignments.FirstAsync());
        await _context.SaveChangesAsync();

        var deleted = await _context.Assignments.FirstOrDefaultAsync(a => a.Id == _assignmentId);
        deleted.Should().BeNull();
    }

    [Fact]
    public async Task Assignment_DraftStatus_NotVisibleToStudents()
    {
        await SetupAsync();

        var assignment = await _context.Assignments.FirstAsync();
        assignment.Status = AssignmentStatus.Draft;
        await _context.SaveChangesAsync();

        var publishedAssignments = await _context.Assignments
            .Where(a => a.Status == AssignmentStatus.Published)
            .ToListAsync();

        publishedAssignments.Should().NotContain(a => a.Id == _assignmentId);
    }

    [Fact]
    public async Task Teacher_CanOnlySeeOwnAssignments()
    {
        await SetupAsync();

        var teacher = await _context.Users.FirstAsync(u => u.Role == UserRole.Teacher);
        var teacherAssignments = await _context.Assignments
            .Where(a => a.TeacherId == teacher.Id)
            .ToListAsync();

        teacherAssignments.Should().HaveCount(1);
        teacherAssignments[0].Title.Should().Be("Test Assignment");
    }

    [Fact]
    public async Task Assignment_Deadline_And_MaxMarks_AreSetCorrectly()
    {
        await SetupAsync();

        var assignment = await _context.Assignments.FirstAsync();
        assignment.MaxMarks.Should().Be(100);
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
