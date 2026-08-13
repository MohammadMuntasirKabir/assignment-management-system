using AssignmentManagement.Models.DTOs;
using AssignmentManagement.Models.Entities;
using AssignmentManagement.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IAuthService _authService;

    public AdminController(AppDbContext context, IAuthService authService)
    {
        _context = context;
        _authService = authService;
    }

    // Users
    [HttpGet("users")]
    public async Task<ActionResult<IEnumerable<UserResponseDto>>> GetUsers()
    {
        var users = await _context.Users
            .OrderBy(u => u.Name)
            .Select(u => new UserResponseDto
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                Role = u.Role,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt
            })
            .ToListAsync();
        return Ok(users);
    }

    [HttpPost("users")]
    public async Task<ActionResult<UserResponseDto>> CreateUser([FromBody] RegisterDto dto)
    {
        var user = await _authService.CreateUserAsync(dto);
        if (user == null)
            return Conflict(new { message = "User with this email already exists" });

        return CreatedAtAction(nameof(GetUsers), new UserResponseDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        });
    }

    [HttpPut("users/{id:guid}")]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserDto dto)
    {
        var currentUserId = _authService.GetUserIdFromToken(User);
        if (id == currentUserId && dto.Role != UserRole.Admin)
            return BadRequest(new { message = "You cannot change your own admin role" });
        if (id == currentUserId && !dto.IsActive)
            return BadRequest(new { message = "You cannot deactivate your own account" });

        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound(new { message = "User not found" });

        var emailInUse = await _context.Users.AnyAsync(u => u.Email == dto.Email && u.Id != id);
        if (emailInUse)
            return Conflict(new { message = "Another user already uses this email" });

        user.Name = dto.Name;
        user.Email = dto.Email;
        user.Role = dto.Role;
        user.IsActive = dto.IsActive;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("users/{id:guid}")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var currentUserId = _authService.GetUserIdFromToken(User);
        if (id == currentUserId)
            return BadRequest(new { message = "You cannot delete your own account" });

        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound(new { message = "User not found" });

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // Classes
    [HttpGet("classes")]
    public async Task<ActionResult<IEnumerable<ClassResponseDto>>> GetClasses()
    {
        var classes = await _context.Classes
            .OrderBy(c => c.Name)
            .Select(c => new ClassResponseDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync();
        return Ok(classes);
    }

    [HttpPost("classes")]
    public async Task<ActionResult<ClassResponseDto>> CreateClass([FromBody] CreateClassDto dto)
    {
        var entity = new Class { Name = dto.Name, Description = dto.Description };
        _context.Classes.Add(entity);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetClasses), new ClassResponseDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            CreatedAt = entity.CreatedAt
        });
    }

    [HttpPut("classes/{id:guid}")]
    public async Task<IActionResult> UpdateClass(Guid id, [FromBody] UpdateClassDto dto)
    {
        var entity = await _context.Classes.FindAsync(id);
        if (entity == null)
            return NotFound(new { message = "Class not found" });

        entity.Name = dto.Name;
        entity.Description = dto.Description;
        entity.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("classes/{id:guid}")]
    public async Task<IActionResult> DeleteClass(Guid id)
    {
        var entity = await _context.Classes.FindAsync(id);
        if (entity == null)
            return NotFound(new { message = "Class not found" });

        _context.Classes.Remove(entity);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // Subjects
    [HttpGet("subjects")]
    public async Task<ActionResult<IEnumerable<SubjectResponseDto>>> GetSubjects()
    {
        var subjects = await _context.Subjects
            .OrderBy(s => s.Name)
            .Select(s => new SubjectResponseDto
            {
                Id = s.Id,
                Name = s.Name,
                Description = s.Description,
                CreatedAt = s.CreatedAt
            })
            .ToListAsync();
        return Ok(subjects);
    }

    [HttpPost("subjects")]
    public async Task<ActionResult<SubjectResponseDto>> CreateSubject([FromBody] CreateSubjectDto dto)
    {
        var entity = new Subject { Name = dto.Name, Description = dto.Description };
        _context.Subjects.Add(entity);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSubjects), new SubjectResponseDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            CreatedAt = entity.CreatedAt
        });
    }

    [HttpPut("subjects/{id:guid}")]
    public async Task<IActionResult> UpdateSubject(Guid id, [FromBody] UpdateSubjectDto dto)
    {
        var entity = await _context.Subjects.FindAsync(id);
        if (entity == null)
            return NotFound(new { message = "Subject not found" });

        entity.Name = dto.Name;
        entity.Description = dto.Description;
        entity.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("subjects/{id:guid}")]
    public async Task<IActionResult> DeleteSubject(Guid id)
    {
        var entity = await _context.Subjects.FindAsync(id);
        if (entity == null)
            return NotFound(new { message = "Subject not found" });

        _context.Subjects.Remove(entity);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // Class-Subject links
    [HttpGet("class-subjects")]
    public async Task<ActionResult<IEnumerable<ClassSubjectDto>>> GetClassSubjects()
    {
        var result = await _context.ClassSubjects
            .Include(cs => cs.Class)
            .Include(cs => cs.Subject)
            .OrderBy(cs => cs.Class.Name)
            .ThenBy(cs => cs.Subject.Name)
            .ToListAsync();
        return Ok(result.Select(DtoMapper.ToClassSubject));
    }

    [HttpPost("class-subjects")]
    public async Task<ActionResult<ClassSubjectDto>> CreateClassSubject([FromBody] CreateClassSubjectDto dto)
    {
        var classExists = await _context.Classes.AnyAsync(c => c.Id == dto.ClassId);
        if (!classExists)
            return NotFound(new { message = "Class not found" });

        var subjectExists = await _context.Subjects.AnyAsync(s => s.Id == dto.SubjectId);
        if (!subjectExists)
            return NotFound(new { message = "Subject not found" });

        var existing = await _context.ClassSubjects
            .FirstOrDefaultAsync(cs => cs.ClassId == dto.ClassId && cs.SubjectId == dto.SubjectId);
        if (existing != null)
            return Conflict(new { message = "This class-subject combination already exists" });

        var entity = new ClassSubject
        {
            Id = Guid.NewGuid(),
            ClassId = dto.ClassId,
            SubjectId = dto.SubjectId,
            CreatedAt = DateTime.UtcNow
        };
        _context.ClassSubjects.Add(entity);
        await _context.SaveChangesAsync();

        var result = await _context.ClassSubjects
            .Include(cs => cs.Class)
            .Include(cs => cs.Subject)
            .FirstAsync(cs => cs.Id == entity.Id);

        return CreatedAtAction(nameof(GetClassSubjects), DtoMapper.ToClassSubject(result));
    }

    [HttpDelete("class-subjects/{id:guid}")]
    public async Task<IActionResult> DeleteClassSubject(Guid id)
    {
        var entity = await _context.ClassSubjects.FindAsync(id);
        if (entity == null)
            return NotFound(new { message = "Class-subject link not found" });

        _context.ClassSubjects.Remove(entity);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // Assign teacher to class-subject
    [HttpPost("assign-teacher")]
    public async Task<IActionResult> AssignTeacher([FromBody] AssignTeacherDto dto)
    {
        var teacher = await _context.Users.FirstOrDefaultAsync(u => u.Id == dto.TeacherId && u.Role == UserRole.Teacher);
        if (teacher == null)
            return NotFound(new { message = "Teacher not found" });

        var classSubject = await _context.ClassSubjects.FindAsync(dto.ClassSubjectId);
        if (classSubject == null)
            return NotFound(new { message = "Class-subject not found" });

        var existing = await _context.TeacherClassSubjects
            .AnyAsync(tcs => tcs.TeacherId == dto.TeacherId && tcs.ClassSubjectId == dto.ClassSubjectId);
        if (existing)
            return Conflict(new { message = "Teacher is already assigned to this class-subject" });

        var teacherAssignment = new TeacherClassSubject
        {
            Id = Guid.NewGuid(),
            TeacherId = dto.TeacherId,
            ClassSubjectId = dto.ClassSubjectId,
            CreatedAt = DateTime.UtcNow
        };
        _context.TeacherClassSubjects.Add(teacherAssignment);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Teacher assigned successfully" });
    }

    // Enroll student in class
    [HttpPost("enroll-student")]
    public async Task<IActionResult> EnrollStudent([FromBody] EnrollStudentDto dto)
    {
        var student = await _context.Users.FirstOrDefaultAsync(u => u.Id == dto.StudentId && u.Role == UserRole.Student);
        if (student == null)
            return NotFound(new { message = "Student not found" });

        var classEntity = await _context.Classes.FindAsync(dto.ClassId);
        if (classEntity == null)
            return NotFound(new { message = "Class not found" });

        var existing = await _context.ClassStudents
            .AnyAsync(cs => cs.StudentId == dto.StudentId && cs.ClassId == dto.ClassId);
        if (existing)
            return Conflict(new { message = "Student is already enrolled in this class" });

        var classStudent = new ClassStudent
        {
            Id = Guid.NewGuid(),
            ClassId = dto.ClassId,
            StudentId = dto.StudentId,
            CreatedAt = DateTime.UtcNow
        };
        _context.ClassStudents.Add(classStudent);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Student enrolled successfully" });
    }

    // View all assignments (admin)
    [HttpGet("assignments")]
    public async Task<ActionResult<IEnumerable<AssignmentResponseDto>>> GetAllAssignments()
    {
        var assignments = await _context.Assignments
            .Include(a => a.ClassSubject)
                .ThenInclude(cs => cs.Class)
            .Include(a => a.ClassSubject)
                .ThenInclude(cs => cs.Subject)
            .Include(a => a.Teacher)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();
        return Ok(assignments.Select(DtoMapper.ToAssignment));
    }

    // View all submissions (admin)
    [HttpGet("submissions")]
    public async Task<ActionResult<IEnumerable<SubmissionResponseDto>>> GetAllSubmissions()
    {
        var submissions = await _context.Submissions
            .Include(s => s.Assignment)
            .Include(s => s.Student)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();
        return Ok(submissions.Select(DtoMapper.ToSubmission));
    }
}
