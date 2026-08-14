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

    private const string UserReferencedDeleteMessage =
        "Cannot delete this account while it is still assigned to classes, assignments, or submissions. Remove those links first.";

    public AdminController(AppDbContext context, IAuthService authService)
    {
        _context = context;
        _authService = authService;
    }

    // Users
    [HttpGet("users")]
    public async Task<ActionResult<PagedResult<UserResponseDto>>> GetUsers(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _context.Users.AsNoTracking();
        var total = await query.CountAsync();

        var users = await query
            .OrderBy(u => u.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new UserResponseDto
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                Role = u.Role,
                CreatedAt = u.CreatedAt
            })
            .ToListAsync();

        return Ok(new PagedResult<UserResponseDto>
        {
            Items = users,
            Total = total,
            Page = page,
            PageSize = pageSize
        });
    }

    [HttpGet("users/{id:guid}")]
    public async Task<ActionResult<UserResponseDto>> GetUserById(Guid id)
    {
        var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id);
        if (user == null)
            return NotFound(ApiErrors.NotFound("User not found"));
        return Ok(DtoMapper.ToUser(user));
    }

    [HttpPost("users")]
    public async Task<ActionResult<UserResponseDto>> CreateUser([FromBody] RegisterDto dto)
    {
        if (dto.Role == UserRole.Admin)
            return BadRequest(ApiErrors.BadRequest("There can only be one admin. Select an existing account to take over the admin role instead."));

        var user = await _authService.CreateUserAsync(dto);
        if (user == null)
            return Conflict(ApiErrors.Conflict("User with this email already exists"));

        return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, DtoMapper.ToUser(user));
    }

    [HttpPut("users/{id:guid}")]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserDto dto)
    {
        var currentUserId = _authService.GetUserIdFromToken(User);
        if (id == currentUserId && dto.Role != UserRole.Admin)
            return BadRequest(ApiErrors.BadRequest("You cannot change your own role. Transfer the admin role to another account instead."));
        if (id != currentUserId && dto.Role == UserRole.Admin)
            return BadRequest(ApiErrors.BadRequest("There can only be one admin. Use the admin transfer option to select a new admin."));

        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound(ApiErrors.NotFound("User not found"));

        var normalizedEmail = dto.Email.Trim().ToLowerInvariant();
        var emailInUse = await _context.Users.AnyAsync(u => u.Email == normalizedEmail && u.Id != id);
        if (emailInUse)
            return Conflict(ApiErrors.Conflict("Another user already uses this email"));

        user.Name = dto.Name;
        user.Email = normalizedEmail;
        user.Role = dto.Role;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("users/{id:guid}")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var currentUserId = _authService.GetUserIdFromToken(User);
        if (id == currentUserId)
            return BadRequest(ApiErrors.BadRequest("You cannot delete your own account"));

        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound(ApiErrors.NotFound("User not found"));

        var hasReferences = await _context.TeacherClassSubjects.AnyAsync(tcs => tcs.TeacherId == id)
            || await _context.ClassStudents.AnyAsync(cs => cs.StudentId == id)
            || await _context.Assignments.AnyAsync(a => a.TeacherId == id)
            || await _context.Submissions.AnyAsync(s => s.StudentId == id);
        if (hasReferences)
            return BadRequest(ApiErrors.BadRequest(UserReferencedDeleteMessage));

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("transfer-admin")]
    public async Task<IActionResult> TransferAdmin([FromBody] AdminTransferDto dto)
    {
        var currentUserId = _authService.GetUserIdFromToken(User);
        if (dto.TargetUserId == currentUserId)
            return BadRequest(ApiErrors.BadRequest("You cannot select yourself as the new admin"));

        var target = await _context.Users.FindAsync(dto.TargetUserId);
        if (target == null)
            return NotFound(ApiErrors.NotFound("Target account not found"));
        if (target.Role == UserRole.Admin)
            return BadRequest(ApiErrors.BadRequest("That account is already the admin"));

        var current = await _context.Users.FindAsync(currentUserId);
        if (current == null || current.Role != UserRole.Admin)
            return BadRequest(ApiErrors.BadRequest("Only the admin can transfer the admin role"));

        var demotingSelf = !dto.DeleteSelf && dto.SelfRole.HasValue && dto.SelfRole.Value != UserRole.Admin;
        if (!dto.DeleteSelf && !demotingSelf)
            return BadRequest(ApiErrors.BadRequest("After selecting a new admin, choose a new role for your account or delete it"));

        target.Role = UserRole.Admin;
        target.UpdatedAt = DateTime.UtcNow;

        AuthResponseDto? demotedSession = null;
        if (dto.DeleteSelf)
        {
            var hasReferences = await _context.TeacherClassSubjects.AnyAsync(tcs => tcs.TeacherId == currentUserId)
                || await _context.Assignments.AnyAsync(a => a.TeacherId == currentUserId);
            if (hasReferences)
                return BadRequest(ApiErrors.BadRequest("Cannot delete your account while it still owns classes or assignments. Choose a new role instead, or transfer that work first."));

            _context.Users.Remove(current);
        }
        else
        {
            current.Role = dto.SelfRole!.Value;
            current.UpdatedAt = DateTime.UtcNow;
            demotedSession = _authService.BuildAuthResponse(current);
        }

        await _context.SaveChangesAsync();

        return Ok(new AdminTransferResultDto
        {
            Target = DtoMapper.ToUser(target),
            CurrentSession = demotedSession,
            DeletedSelf = dto.DeleteSelf
        });
    }

    // Classes
    [HttpGet("classes")]
    public async Task<ActionResult<IEnumerable<ClassResponseDto>>> GetClasses()
    {
        var classes = await _context.Classes
            .AsNoTracking()
            .OrderBy(c => c.Name)
            .ToListAsync();
        return Ok(classes.Select(DtoMapper.ToClass));
    }

    [HttpGet("classes/{id:guid}")]
    public async Task<ActionResult<ClassResponseDto>> GetClassById(Guid id)
    {
        var entity = await _context.Classes.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id);
        if (entity == null)
            return NotFound(ApiErrors.NotFound("Class not found"));
        return Ok(DtoMapper.ToClass(entity));
    }

    [HttpPost("classes")]
    public async Task<ActionResult<ClassResponseDto>> CreateClass([FromBody] CreateClassDto dto)
    {
        var entity = new Class { Name = dto.Name, Description = dto.Description };
        _context.Classes.Add(entity);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetClassById), new { id = entity.Id }, DtoMapper.ToClass(entity));
    }

    [HttpPut("classes/{id:guid}")]
    public async Task<IActionResult> UpdateClass(Guid id, [FromBody] UpdateClassDto dto)
    {
        var entity = await _context.Classes.FindAsync(id);
        if (entity == null)
            return NotFound(ApiErrors.NotFound("Class not found"));

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
            return NotFound(ApiErrors.NotFound("Class not found"));

        var hasReferences = await _context.ClassSubjects.AnyAsync(cs => cs.ClassId == id)
            || await _context.ClassStudents.AnyAsync(cs => cs.ClassId == id);
        if (hasReferences)
            return BadRequest(ApiErrors.BadRequest(
                "Cannot delete this class while it is still linked to subjects or enrolled students. Remove those links first."));

        _context.Classes.Remove(entity);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // Subjects
    [HttpGet("subjects")]
    public async Task<ActionResult<IEnumerable<SubjectResponseDto>>> GetSubjects()
    {
        var subjects = await _context.Subjects
            .AsNoTracking()
            .OrderBy(s => s.Name)
            .ToListAsync();
        return Ok(subjects.Select(DtoMapper.ToSubject));
    }

    [HttpGet("subjects/{id:guid}")]
    public async Task<ActionResult<SubjectResponseDto>> GetSubjectById(Guid id)
    {
        var entity = await _context.Subjects.AsNoTracking().FirstOrDefaultAsync(s => s.Id == id);
        if (entity == null)
            return NotFound(ApiErrors.NotFound("Subject not found"));
        return Ok(DtoMapper.ToSubject(entity));
    }

    [HttpPost("subjects")]
    public async Task<ActionResult<SubjectResponseDto>> CreateSubject([FromBody] CreateSubjectDto dto)
    {
        var entity = new Subject { Name = dto.Name, Description = dto.Description };
        _context.Subjects.Add(entity);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSubjectById), new { id = entity.Id }, DtoMapper.ToSubject(entity));
    }

    [HttpPut("subjects/{id:guid}")]
    public async Task<IActionResult> UpdateSubject(Guid id, [FromBody] UpdateSubjectDto dto)
    {
        var entity = await _context.Subjects.FindAsync(id);
        if (entity == null)
            return NotFound(ApiErrors.NotFound("Subject not found"));

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
            return NotFound(ApiErrors.NotFound("Subject not found"));

        var hasReferences = await _context.ClassSubjects.AnyAsync(cs => cs.SubjectId == id);
        if (hasReferences)
            return BadRequest(ApiErrors.BadRequest(
                "Cannot delete this subject while it is still linked to classes. Remove those links first."));

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
            .AsNoTracking()
            .OrderBy(cs => cs.Class!.Name)
            .ThenBy(cs => cs.Subject!.Name)
            .ToListAsync();
        return Ok(result.Select(DtoMapper.ToClassSubject));
    }

    [HttpGet("class-subjects/{id:guid}")]
    public async Task<ActionResult<ClassSubjectDto>> GetClassSubjectById(Guid id)
    {
        var entity = await _context.ClassSubjects
            .Include(cs => cs.Class)
            .Include(cs => cs.Subject)
            .AsNoTracking()
            .FirstOrDefaultAsync(cs => cs.Id == id);
        if (entity == null)
            return NotFound(ApiErrors.NotFound("Class-subject link not found"));
        return Ok(DtoMapper.ToClassSubject(entity));
    }

    [HttpPost("class-subjects")]
    public async Task<ActionResult<ClassSubjectDto>> CreateClassSubject([FromBody] CreateClassSubjectDto dto)
    {
        var classExists = await _context.Classes.AnyAsync(c => c.Id == dto.ClassId);
        if (!classExists)
            return NotFound(ApiErrors.NotFound("Class not found"));

        var subjectExists = await _context.Subjects.AnyAsync(s => s.Id == dto.SubjectId);
        if (!subjectExists)
            return NotFound(ApiErrors.NotFound("Subject not found"));

        var existing = await _context.ClassSubjects
            .FirstOrDefaultAsync(cs => cs.ClassId == dto.ClassId && cs.SubjectId == dto.SubjectId);
        if (existing != null)
            return Conflict(ApiErrors.Conflict("This class-subject combination already exists"));

        var entity = new ClassSubject
        {
            Id = Guid.NewGuid(),
            ClassId = dto.ClassId,
            SubjectId = dto.SubjectId,
            CreatedAt = DateTime.UtcNow
        };
        _context.ClassSubjects.Add(entity);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetClassSubjectById), new { id = entity.Id }, DtoMapper.ToClassSubject(entity));
    }

    [HttpDelete("class-subjects/{id:guid}")]
    public async Task<IActionResult> DeleteClassSubject(Guid id)
    {
        var entity = await _context.ClassSubjects.FindAsync(id);
        if (entity == null)
            return NotFound(ApiErrors.NotFound("Class-subject link not found"));

        var hasReferences = await _context.TeacherClassSubjects.AnyAsync(tcs => tcs.ClassSubjectId == id)
            || await _context.Assignments.AnyAsync(a => a.ClassSubjectId == id);
        if (hasReferences)
            return BadRequest(ApiErrors.BadRequest(
                "Cannot delete this class-subject link while teachers are assigned to it or assignments exist for it. Remove those first."));

        _context.ClassSubjects.Remove(entity);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("class-subjects/{id:guid}")]
    public async Task<ActionResult<ClassSubjectDto>> UpdateClassSubject(Guid id, [FromBody] CreateClassSubjectDto dto)
    {
        var entity = await _context.ClassSubjects
            .Include(cs => cs.Class)
            .Include(cs => cs.Subject)
            .FirstOrDefaultAsync(cs => cs.Id == id);
        if (entity == null)
            return NotFound(ApiErrors.NotFound("Class-subject link not found"));

        var classExists = await _context.Classes.AnyAsync(c => c.Id == dto.ClassId);
        if (!classExists)
            return NotFound(ApiErrors.NotFound("Class not found"));

        var subjectExists = await _context.Subjects.AnyAsync(s => s.Id == dto.SubjectId);
        if (!subjectExists)
            return NotFound(ApiErrors.NotFound("Subject not found"));

        var existing = await _context.ClassSubjects
            .FirstOrDefaultAsync(cs => cs.Id != id && cs.ClassId == dto.ClassId && cs.SubjectId == dto.SubjectId);
        if (existing != null)
            return Conflict(ApiErrors.Conflict("This class-subject combination already exists"));

        entity.ClassId = dto.ClassId;
        entity.SubjectId = dto.SubjectId;
        await _context.SaveChangesAsync();

        var result = await _context.ClassSubjects
            .Include(cs => cs.Class)
            .Include(cs => cs.Subject)
            .FirstAsync(cs => cs.Id == id);

        return Ok(DtoMapper.ToClassSubject(result));
    }

    // Assign teacher to class-subject
    [HttpPost("assign-teacher")]
    public async Task<IActionResult> AssignTeacher([FromBody] AssignTeacherDto dto)
    {
        var teacher = await _context.Users.FirstOrDefaultAsync(u => u.Id == dto.TeacherId && u.Role == UserRole.Teacher);
        if (teacher == null)
            return NotFound(ApiErrors.NotFound("Teacher not found"));

        var classSubject = await _context.ClassSubjects.FindAsync(dto.ClassSubjectId);
        if (classSubject == null)
            return NotFound(ApiErrors.NotFound("Class-subject not found"));

        var existing = await _context.TeacherClassSubjects
            .AnyAsync(tcs => tcs.TeacherId == dto.TeacherId && tcs.ClassSubjectId == dto.ClassSubjectId);
        if (existing)
            return Conflict(ApiErrors.Conflict("Teacher is already assigned to this class-subject"));

        var teacherAssignment = new TeacherClassSubject
        {
            Id = Guid.NewGuid(),
            TeacherId = dto.TeacherId,
            ClassSubjectId = dto.ClassSubjectId,
            CreatedAt = DateTime.UtcNow
        };
        _context.TeacherClassSubjects.Add(teacherAssignment);
        await _context.SaveChangesAsync();

        var result = await _context.TeacherClassSubjects
            .Include(tcs => tcs.Teacher)
            .Include(tcs => tcs.ClassSubject)
                .ThenInclude(cs => cs.Class)
            .Include(tcs => tcs.ClassSubject)
                .ThenInclude(cs => cs.Subject)
            .FirstAsync(tcs => tcs.Id == teacherAssignment.Id);

        return Ok(DtoMapper.ToTeacherAssignment(result));
    }

    // View all teacher-class-subject assignments (admin)
    [HttpGet("teacher-assignments")]
    public async Task<ActionResult<IEnumerable<TeacherAssignmentDto>>> GetTeacherAssignments()
    {
        var assignments = await _context.TeacherClassSubjects
            .Include(tcs => tcs.Teacher)
            .Include(tcs => tcs.ClassSubject)
                .ThenInclude(cs => cs.Class)
            .Include(tcs => tcs.ClassSubject)
                .ThenInclude(cs => cs.Subject)
            .AsNoTracking()
            .OrderBy(tcs => tcs.Teacher!.Name)
            .ThenBy(tcs => tcs.ClassSubject!.Class!.Name)
            .ThenBy(tcs => tcs.ClassSubject!.Subject!.Name)
            .ToListAsync();
        return Ok(assignments.Select(DtoMapper.ToTeacherAssignment));
    }

    [HttpDelete("teacher-assignments/{id:guid}")]
    public async Task<IActionResult> DeleteTeacherAssignment(Guid id)
    {
        var entity = await _context.TeacherClassSubjects.FindAsync(id);
        if (entity == null)
            return NotFound(ApiErrors.NotFound("Teacher assignment not found"));

        _context.TeacherClassSubjects.Remove(entity);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // Enroll student in class
    [HttpPost("enroll-student")]
    public async Task<IActionResult> EnrollStudent([FromBody] EnrollStudentDto dto)
    {
        var student = await _context.Users.FirstOrDefaultAsync(u => u.Id == dto.StudentId && u.Role == UserRole.Student);
        if (student == null)
            return NotFound(ApiErrors.NotFound("Student not found"));

        var classEntity = await _context.Classes.FindAsync(dto.ClassId);
        if (classEntity == null)
            return NotFound(ApiErrors.NotFound("Class not found"));

        var existing = await _context.ClassStudents
            .AnyAsync(cs => cs.StudentId == dto.StudentId && cs.ClassId == dto.ClassId);
        if (existing)
            return Conflict(ApiErrors.Conflict("Student is already enrolled in this class"));

        var classStudent = new ClassStudent
        {
            Id = Guid.NewGuid(),
            ClassId = dto.ClassId,
            StudentId = dto.StudentId,
            CreatedAt = DateTime.UtcNow
        };
        _context.ClassStudents.Add(classStudent);
        await _context.SaveChangesAsync();

        var result = await _context.ClassStudents
            .Include(cs => cs.Student)
            .Include(cs => cs.Class)
            .FirstAsync(cs => cs.Id == classStudent.Id);

        return Ok(DtoMapper.ToStudentEnrollment(result));
    }

    // View all student enrollments (admin)
    [HttpGet("enrollments")]
    public async Task<ActionResult<IEnumerable<StudentEnrollmentDto>>> GetEnrollments()
    {
        var enrollments = await _context.ClassStudents
            .Include(cs => cs.Student)
            .Include(cs => cs.Class)
            .AsNoTracking()
            .OrderBy(cs => cs.Student!.Name)
            .ThenBy(cs => cs.Class!.Name)
            .ToListAsync();
        return Ok(enrollments.Select(DtoMapper.ToStudentEnrollment));
    }

    [HttpDelete("enrollments/{id:guid}")]
    public async Task<IActionResult> DeleteEnrollment(Guid id)
    {
        var entity = await _context.ClassStudents.FindAsync(id);
        if (entity == null)
            return NotFound(ApiErrors.NotFound("Enrollment not found"));

        _context.ClassStudents.Remove(entity);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // View all assignments (admin)
    [HttpGet("assignments")]
    public async Task<ActionResult<PagedResult<AssignmentResponseDto>>> GetAllAssignments(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _context.Assignments
            .Include(a => a.ClassSubject)
                .ThenInclude(cs => cs.Class)
            .Include(a => a.ClassSubject)
                .ThenInclude(cs => cs.Subject)
            .Include(a => a.Teacher)
            .AsNoTracking();

        var total = await query.CountAsync();

        var assignments = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new PagedResult<AssignmentResponseDto>
        {
            Items = assignments.Select(DtoMapper.ToAssignment).ToList(),
            Total = total,
            Page = page,
            PageSize = pageSize
        });
    }

    // View all submissions (admin)
    [HttpGet("submissions")]
    public async Task<ActionResult<PagedResult<SubmissionResponseDto>>> GetAllSubmissions(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _context.Submissions
            .Include(s => s.Assignment)
            .Include(s => s.Student)
            .AsNoTracking();

        var total = await query.CountAsync();

        var submissions = await query
            .OrderByDescending(s => s.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new PagedResult<SubmissionResponseDto>
        {
            Items = submissions.Select(DtoMapper.ToSubmission).ToList(),
            Total = total,
            Page = page,
            PageSize = pageSize
        });
    }
}
