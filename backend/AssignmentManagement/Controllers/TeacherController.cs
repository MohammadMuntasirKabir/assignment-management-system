using AssignmentManagement.Models.DTOs;
using AssignmentManagement.Models.Entities;
using AssignmentManagement.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Teacher")]
public class TeacherController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IAuthService _authService;

    public TeacherController(AppDbContext context, IAuthService authService)
    {
        _context = context;
        _authService = authService;
    }

    // GET: Class-subjects assigned to this teacher
    [HttpGet("class-subjects")]
    public async Task<ActionResult<IEnumerable<ClassSubjectDto>>> GetMyClassSubjects()
    {
        var teacherId = _authService.GetUserIdFromToken(User);
        var classSubjects = await _context.TeacherClassSubjects
            .Where(tcs => tcs.TeacherId == teacherId)
            .Include(tcs => tcs.ClassSubject)
                .ThenInclude(cs => cs.Class)
            .Include(tcs => tcs.ClassSubject)
                .ThenInclude(cs => cs.Subject)
            .OrderBy(tcs => tcs.ClassSubject.Class.Name)
            .ThenBy(tcs => tcs.ClassSubject.Subject.Name)
            .ToListAsync();

        return Ok(classSubjects.Select(tcs => DtoMapper.ToClassSubject(tcs.ClassSubject)));
    }

    // GET: List assignments created by this teacher
    [HttpGet("assignments")]
    public async Task<ActionResult<IEnumerable<AssignmentResponseDto>>> GetMyAssignments()
    {
        var teacherId = _authService.GetUserIdFromToken(User);
        var assignments = await _context.Assignments
            .Where(a => a.TeacherId == teacherId)
            .Include(a => a.ClassSubject)
                .ThenInclude(cs => cs.Class)
            .Include(a => a.ClassSubject)
                .ThenInclude(cs => cs.Subject)
            .Include(a => a.Teacher)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        return Ok(assignments.Select(DtoMapper.ToAssignment));
    }

    // POST: Create assignment (teacher must be assigned to the class-subject)
    [HttpPost("assignments")]
    public async Task<ActionResult<AssignmentResponseDto>> CreateAssignment([FromBody] CreateAssignmentDto dto)
    {
        var teacherId = _authService.GetUserIdFromToken(User);

        if (dto.TeacherId != teacherId)
            return Forbidden("You can only create assignments for yourself");

        if (dto.ClassSubjectId == Guid.Empty)
            return BadRequest(new { message = "A class-subject must be selected" });

        if (dto.Deadline == default)
            return BadRequest(new { message = "A deadline is required" });

        var isAssigned = await _context.TeacherClassSubjects
            .AnyAsync(tcs => tcs.TeacherId == teacherId && tcs.ClassSubjectId == dto.ClassSubjectId);
        if (!isAssigned)
            return Forbidden("You are not assigned to this class-subject");

        var assignment = new Assignment
        {
            Id = Guid.NewGuid(),
            Title = dto.Title,
            Description = dto.Description,
            ClassSubjectId = dto.ClassSubjectId,
            TeacherId = teacherId,
            Deadline = dto.Deadline,
            MaxMarks = dto.MaxMarks,
            Status = dto.Status,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.Assignments.Add(assignment);
        await _context.SaveChangesAsync();

        var result = await GetAssignmentEntityAsync(assignment.Id);
        return CreatedAtAction(nameof(GetAssignmentById), new { id = assignment.Id }, DtoMapper.ToAssignment(result!));
    }

    // GET: Assignment details
    [HttpGet("assignments/{id:guid}")]
    public async Task<ActionResult<AssignmentResponseDto>> GetAssignmentById(Guid id)
    {
        var teacherId = _authService.GetUserIdFromToken(User);
        var assignment = await GetAssignmentEntityAsync(id);
        if (assignment == null)
            return NotFound(new { message = "Assignment not found" });
        if (assignment.TeacherId != teacherId)
            return Forbidden("You do not own this assignment");

        return Ok(DtoMapper.ToAssignment(assignment));
    }

    // PUT: Update assignment
    [HttpPut("assignments/{id:guid}")]
    public async Task<ActionResult<AssignmentResponseDto>> UpdateAssignment(Guid id, [FromBody] UpdateAssignmentDto dto)
    {
        var teacherId = _authService.GetUserIdFromToken(User);
        var assignment = await _context.Assignments.FindAsync(id);
        if (assignment == null)
            return NotFound(new { message = "Assignment not found" });
        if (assignment.TeacherId != teacherId)
            return Forbidden("You do not own this assignment");

        if (dto.ClassSubjectId == Guid.Empty)
            return BadRequest(new { message = "A class-subject must be selected" });

        if (dto.Deadline == default)
            return BadRequest(new { message = "A deadline is required" });

        // Verify teacher is still assigned to the new class-subject if changed
        if (dto.ClassSubjectId != assignment.ClassSubjectId)
        {
            var isAssigned = await _context.TeacherClassSubjects
                .AnyAsync(tcs => tcs.TeacherId == teacherId && tcs.ClassSubjectId == dto.ClassSubjectId);
            if (!isAssigned)
                return Forbidden("You are not assigned to this class-subject");
        }

        assignment.Title = dto.Title;
        assignment.Description = dto.Description;
        assignment.ClassSubjectId = dto.ClassSubjectId;
        assignment.Deadline = dto.Deadline;
        assignment.MaxMarks = dto.MaxMarks;
        assignment.Status = dto.Status;
        assignment.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var result = await GetAssignmentEntityAsync(assignment.Id);
        return Ok(DtoMapper.ToAssignment(result!));
    }

    // DELETE: Delete assignment
    [HttpDelete("assignments/{id:guid}")]
    public async Task<IActionResult> DeleteAssignment(Guid id)
    {
        var teacherId = _authService.GetUserIdFromToken(User);
        var assignment = await _context.Assignments.FindAsync(id);
        if (assignment == null)
            return NotFound(new { message = "Assignment not found" });
        if (assignment.TeacherId != teacherId)
            return Forbidden("You do not own this assignment");

        _context.Assignments.Remove(assignment);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // GET: Submissions for this teacher's assignments
    [HttpGet("submissions")]
    public async Task<ActionResult<IEnumerable<SubmissionResponseDto>>> GetMyAssignmentSubmissions()
    {
        var teacherId = _authService.GetUserIdFromToken(User);
        var submissions = await _context.Submissions
            .Include(s => s.Assignment)
            .Include(s => s.Student)
            .Where(s => s.Assignment.TeacherId == teacherId)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

        return Ok(submissions.Select(DtoMapper.ToSubmission));
    }

    // GET: Specific submission details
    [HttpGet("submissions/{id:guid}")]
    public async Task<ActionResult<SubmissionResponseDto>> GetSubmissionById(Guid id)
    {
        var teacherId = _authService.GetUserIdFromToken(User);
        var submission = await GetSubmissionEntityAsync(id);
        if (submission == null)
            return NotFound(new { message = "Submission not found" });
        if (submission.Assignment.TeacherId != teacherId)
            return Forbidden("You do not have access to this submission");

        return Ok(DtoMapper.ToSubmission(submission));
    }

    // PUT: Grade a submission (marks + feedback)
    [HttpPut("submissions/{id:guid}/grade")]
    public async Task<ActionResult<SubmissionResponseDto>> GradeSubmission(Guid id, [FromBody] GradeSubmissionDto dto)
    {
        var teacherId = _authService.GetUserIdFromToken(User);
        var submission = await GetSubmissionEntityAsync(id);
        if (submission == null)
            return NotFound(new { message = "Submission not found" });
        if (submission.Assignment.TeacherId != teacherId)
            return Forbidden("You do not have access to this submission");

        if (dto.Marks > submission.Assignment.MaxMarks)
            return BadRequest(new { message = $"Marks exceed maximum ({submission.Assignment.MaxMarks})" });

        submission.Status = dto.Status;
        submission.Marks = dto.Marks;
        submission.Feedback = dto.Feedback;
        submission.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var result = await GetSubmissionEntityAsync(submission.Id);
        return Ok(DtoMapper.ToSubmission(result!));
    }

    // PUT: Change submission status
    [HttpPut("submissions/{id:guid}/status")]
    public async Task<ActionResult<SubmissionResponseDto>> ChangeSubmissionStatus(Guid id, [FromBody] ChangeStatusDto dto)
    {
        var teacherId = _authService.GetUserIdFromToken(User);
        var submission = await _context.Submissions
            .Include(s => s.Assignment)
            .FirstOrDefaultAsync(s => s.Id == id);
        if (submission == null)
            return NotFound(new { message = "Submission not found" });
        if (submission.Assignment.TeacherId != teacherId)
            return Forbidden("You do not have access to this submission");

        submission.Status = dto.Status;
        submission.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var result = await GetSubmissionEntityAsync(submission.Id);
        return Ok(DtoMapper.ToSubmission(result!));
    }

    private async Task<Assignment?> GetAssignmentEntityAsync(Guid id)
    {
        return await _context.Assignments
            .Include(a => a.ClassSubject)
                .ThenInclude(cs => cs.Class)
            .Include(a => a.ClassSubject)
                .ThenInclude(cs => cs.Subject)
            .Include(a => a.Teacher)
            .FirstOrDefaultAsync(a => a.Id == id);
    }

    private async Task<Submission?> GetSubmissionEntityAsync(Guid id)
    {
        return await _context.Submissions
            .Include(s => s.Assignment)
            .Include(s => s.Student)
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    private ObjectResult Forbidden(string message) =>
        StatusCode(StatusCodes.Status403Forbidden, new { message });
}
