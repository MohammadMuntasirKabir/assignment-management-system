using AssignmentManagement.Models.DTOs;
using AssignmentManagement.Models.Entities;
using AssignmentManagement.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Student")]
public class StudentController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IAuthService _authService;

    public StudentController(AppDbContext context, IAuthService authService)
    {
        _context = context;
        _authService = authService;
    }

    // GET: Assignments for this student's classes (published only)
    [HttpGet("assignments")]
    public async Task<ActionResult<IEnumerable<AssignmentResponseDto>>> GetAssignmentsForStudent()
    {
        var studentId = _authService.GetUserIdFromToken(User);
        var studentClassIds = await GetStudentClassIdsAsync(studentId);

        var assignments = await _context.Assignments
            .Where(a => studentClassIds.Contains(a.ClassSubject.Class.Id))
            .Where(a => a.Status == AssignmentStatus.Published)
            .Include(a => a.ClassSubject)
                .ThenInclude(cs => cs.Class)
            .Include(a => a.ClassSubject)
                .ThenInclude(cs => cs.Subject)
            .Include(a => a.Teacher)
            .AsNoTracking()
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        return Ok(assignments.Select(DtoMapper.ToAssignment));
    }

    // GET: Assignment details (published, enrolled class only)
    [HttpGet("assignments/{id:guid}")]
    public async Task<ActionResult<AssignmentResponseDto>> GetAssignmentById(Guid id)
    {
        var studentId = _authService.GetUserIdFromToken(User);
        var studentClassIds = await GetStudentClassIdsAsync(studentId);

        var assignment = await _context.Assignments
            .Include(a => a.ClassSubject)
                .ThenInclude(cs => cs.Class)
            .Include(a => a.ClassSubject)
                .ThenInclude(cs => cs.Subject)
            .Include(a => a.Teacher)
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == id);
        if (assignment == null || assignment.Status != AssignmentStatus.Published)
            return NotFound(ApiErrors.NotFound("Assignment not found"));
        if (!studentClassIds.Contains(assignment.ClassSubject.Class.Id))
            return Forbidden(ApiErrors.Forbidden("This assignment is not for your class"));

        return Ok(DtoMapper.ToAssignment(assignment));
    }

    // GET: Own submissions
    [HttpGet("submissions")]
    public async Task<ActionResult<IEnumerable<SubmissionResponseDto>>> GetMySubmissions()
    {
        var studentId = _authService.GetUserIdFromToken(User);
        var submissions = await _context.Submissions
            .Include(s => s.Assignment)
            .Include(s => s.Student)
            .AsNoTracking()
            .Where(s => s.StudentId == studentId)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

        return Ok(submissions.Select(DtoMapper.ToSubmission));
    }

    // GET: Specific submission
    [HttpGet("submissions/{id:guid}")]
    public async Task<ActionResult<SubmissionResponseDto>> GetSubmissionById(Guid id)
    {
        var studentId = _authService.GetUserIdFromToken(User);
        var submission = await _context.Submissions
            .Include(s => s.Assignment)
            .Include(s => s.Student)
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == id);
        if (submission == null)
            return NotFound(ApiErrors.NotFound("Submission not found"));
        if (submission.StudentId != studentId)
            return Forbidden(ApiErrors.Forbidden("This is not your submission"));

        return Ok(DtoMapper.ToSubmission(submission));
    }

    // POST: Submit an assignment
    [HttpPost("submissions")]
    public async Task<ActionResult<SubmissionResponseDto>> CreateSubmission([FromBody] CreateSubmissionDto dto)
    {
        var studentId = _authService.GetUserIdFromToken(User);

        var assignment = await _context.Assignments
            .Include(a => a.ClassSubject)
                .ThenInclude(cs => cs.Class)
            .FirstOrDefaultAsync(a => a.Id == dto.AssignmentId);
        if (assignment == null)
            return NotFound(ApiErrors.NotFound("Assignment not found"));
        if (assignment.Status != AssignmentStatus.Published)
            return BadRequest(ApiErrors.BadRequest("Assignment is not published"));

        // Verify student is enrolled in the class
        var isEnrolled = await _context.ClassStudents
            .AnyAsync(cs => cs.StudentId == studentId && cs.ClassId == assignment.ClassSubject.Class.Id);
        if (!isEnrolled)
            return Forbidden(ApiErrors.Forbidden("You are not enrolled in this class"));

        // Check if a submission already exists
        var existing = await _context.Submissions
            .FirstOrDefaultAsync(s => s.AssignmentId == dto.AssignmentId && s.StudentId == studentId);
        if (existing != null)
            return Conflict(ApiErrors.Conflict("You have already submitted this assignment"));

        var submission = new Submission
        {
            Id = Guid.NewGuid(),
            AssignmentId = dto.AssignmentId,
            StudentId = studentId,
            Content = dto.Content,
            Status = DateTime.UtcNow > assignment.Deadline ? SubmissionStatus.Late : SubmissionStatus.Submitted,
            SubmittedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.Submissions.Add(submission);
        await _context.SaveChangesAsync();

        var result = await GetSubmissionDtoAsync(submission.Id);
        return CreatedAtAction(nameof(GetSubmissionById), new { id = submission.Id }, result);
    }

    // PUT: Update submission before deadline
    [HttpPut("submissions/{id:guid}")]
    public async Task<ActionResult<SubmissionResponseDto>> UpdateSubmission(Guid id, [FromBody] UpdateSubmissionDto dto)
    {
        var studentId = _authService.GetUserIdFromToken(User);
        var submission = await _context.Submissions
            .Include(s => s.Assignment)
            .FirstOrDefaultAsync(s => s.Id == id);
        if (submission == null)
            return NotFound(ApiErrors.NotFound("Submission not found"));
        if (submission.StudentId != studentId)
            return Forbidden(ApiErrors.Forbidden("This is not your submission"));

        // Only allow editing if before deadline and not yet reviewed
        if (DateTime.UtcNow > submission.Assignment.Deadline)
            return BadRequest(ApiErrors.BadRequest("Cannot edit submission after deadline"));
        if (submission.Status == SubmissionStatus.Reviewed)
            return BadRequest(ApiErrors.BadRequest("Cannot edit submission after it has been reviewed"));

        submission.Content = dto.Content;
        submission.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var result = await GetSubmissionDtoAsync(submission.Id);
        return Ok(result);
    }

    private async Task<List<Guid>> GetStudentClassIdsAsync(Guid studentId)
    {
        return await _context.ClassStudents
            .Where(cs => cs.StudentId == studentId)
            .Select(cs => cs.ClassId)
            .ToListAsync();
    }

    private async Task<SubmissionResponseDto?> GetSubmissionDtoAsync(Guid id)
    {
        var submission = await _context.Submissions
            .Include(s => s.Assignment)
            .Include(s => s.Student)
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == id);
        return submission == null ? null : DtoMapper.ToSubmission(submission);
    }

    private ObjectResult Forbidden(ProblemDetails problem) =>
        StatusCode(StatusCodes.Status403Forbidden, problem);
}
