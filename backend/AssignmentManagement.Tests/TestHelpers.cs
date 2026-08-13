using System.Security.Claims;
using AssignmentManagement.Controllers;
using AssignmentManagement.Models.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AssignmentManagement.Models.Entities;
using Microsoft.Data.Sqlite;

namespace AssignmentManagement.Tests;

public static class TestHelpers
{
    public static AppDbContext CreateContext(string dbName = "TestDb")
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;

        return new AppDbContext(options);
    }

    public static IAuthService CreateAuthService(AppDbContext context)
    {
        var settings = new JwtSettings
        {
            SecretKey = "THIS_IS_A_TEST_SECRET_KEY_THAT_IS_AT_LEAST_32_CHARACTERS_LONG",
            ExpiryMinutes = 60,
            Issuer = "TestIssuer",
            Audience = "TestAudience"
        };
        return new AuthService(context, Microsoft.Extensions.Options.Options.Create(settings));
    }

    public static TeacherController CreateTeacherController(AppDbContext context, Guid userId)
        => new(context, new FakeAuthService(userId));

    public static StudentController CreateStudentController(AppDbContext context, Guid userId)
        => new(context, new FakeAuthService(userId));

    public static AdminController CreateAdminController(AppDbContext context)
        => new(context, CreateAuthService(context));

    public static async Task SeedTestDataAsync(AppDbContext context)
    {
        var admin = new User
        {
            Id = Guid.NewGuid(),
            Name = "Admin User",
            Email = "admin@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
            Role = UserRole.Admin,
            CreatedAt = DateTime.UtcNow
        };

        var teacher = new User
        {
            Id = Guid.NewGuid(),
            Name = "Test Teacher",
            Email = "teacher@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("teacher123"),
            Role = UserRole.Teacher,
            CreatedAt = DateTime.UtcNow
        };

        var student = new User
        {
            Id = Guid.NewGuid(),
            Name = "Test Student",
            Email = "student@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("student123"),
            Role = UserRole.Student,
            CreatedAt = DateTime.UtcNow
        };

        var cls = new Class
        {
            Id = Guid.NewGuid(),
            Name = "Test Class",
            Description = "Test Description",
            CreatedAt = DateTime.UtcNow
        };

        var subject = new Subject
        {
            Id = Guid.NewGuid(),
            Name = "Test Subject",
            Description = "Subject Description",
            CreatedAt = DateTime.UtcNow
        };

        var classSubject = new ClassSubject
        {
            Id = Guid.NewGuid(),
            ClassId = cls.Id,
            SubjectId = subject.Id,
            CreatedAt = DateTime.UtcNow
        };

        var teacherAssignment = new TeacherClassSubject
        {
            Id = Guid.NewGuid(),
            TeacherId = teacher.Id,
            ClassSubjectId = classSubject.Id,
            CreatedAt = DateTime.UtcNow
        };

        var classStudent = new ClassStudent
        {
            Id = Guid.NewGuid(),
            ClassId = cls.Id,
            StudentId = student.Id,
            CreatedAt = DateTime.UtcNow
        };

        var assignment = new Assignment
        {
            Id = Guid.NewGuid(),
            Title = "Test Assignment",
            Description = "Test Description",
            ClassSubjectId = classSubject.Id,
            TeacherId = teacher.Id,
            Deadline = DateTime.UtcNow.AddDays(7),
            MaxMarks = 100,
            Status = AssignmentStatus.Published,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await context.Users.AddRangeAsync(admin, teacher, student);
        await context.Classes.AddAsync(cls);
        await context.Subjects.AddAsync(subject);
        await context.ClassSubjects.AddAsync(classSubject);
        await context.TeacherClassSubjects.AddAsync(teacherAssignment);
        await context.ClassStudents.AddAsync(classStudent);
        await context.Assignments.AddAsync(assignment);
        await context.SaveChangesAsync();
    }

    public static async Task<WorkflowData> SeedWorkflowDataAsync(AppDbContext context)
    {
        var admin = new User
        {
            Id = Guid.NewGuid(),
            Name = "Admin User",
            Email = "admin@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
            Role = UserRole.Admin,
            CreatedAt = DateTime.UtcNow
        };

        var teacher1 = new User
        {
            Id = Guid.NewGuid(),
            Name = "Teacher One",
            Email = "teacher1@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("teacher123"),
            Role = UserRole.Teacher,
            CreatedAt = DateTime.UtcNow
        };

        var teacher2 = new User
        {
            Id = Guid.NewGuid(),
            Name = "Teacher Two",
            Email = "teacher2@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("teacher123"),
            Role = UserRole.Teacher,
            CreatedAt = DateTime.UtcNow
        };

        var student1 = new User
        {
            Id = Guid.NewGuid(),
            Name = "Student One",
            Email = "student1@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("student123"),
            Role = UserRole.Student,
            CreatedAt = DateTime.UtcNow
        };

        var student2 = new User
        {
            Id = Guid.NewGuid(),
            Name = "Student Two",
            Email = "student2@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("student123"),
            Role = UserRole.Student,
            CreatedAt = DateTime.UtcNow
        };

        var class1 = new Class
        {
            Id = Guid.NewGuid(),
            Name = "Class A",
            Description = "First class",
            CreatedAt = DateTime.UtcNow
        };

        var class2 = new Class
        {
            Id = Guid.NewGuid(),
            Name = "Class B",
            Description = "Second class",
            CreatedAt = DateTime.UtcNow
        };

        var math = new Subject
        {
            Id = Guid.NewGuid(),
            Name = "Mathematics",
            Description = "Math",
            CreatedAt = DateTime.UtcNow
        };

        var physics = new Subject
        {
            Id = Guid.NewGuid(),
            Name = "Physics",
            Description = "Physics",
            CreatedAt = DateTime.UtcNow
        };

        var cs1 = new ClassSubject
        {
            Id = Guid.NewGuid(),
            ClassId = class1.Id,
            SubjectId = math.Id,
            CreatedAt = DateTime.UtcNow
        };

        var cs2 = new ClassSubject
        {
            Id = Guid.NewGuid(),
            ClassId = class2.Id,
            SubjectId = physics.Id,
            CreatedAt = DateTime.UtcNow
        };

        var publishedAssignment = new Assignment
        {
            Id = Guid.NewGuid(),
            Title = "Published Assignment",
            Description = "Published",
            ClassSubjectId = cs1.Id,
            TeacherId = teacher1.Id,
            Deadline = DateTime.UtcNow.AddDays(7),
            MaxMarks = 100,
            Status = AssignmentStatus.Published,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var draftAssignment = new Assignment
        {
            Id = Guid.NewGuid(),
            Title = "Draft Assignment",
            Description = "Draft",
            ClassSubjectId = cs1.Id,
            TeacherId = teacher1.Id,
            Deadline = DateTime.UtcNow.AddDays(7),
            MaxMarks = 100,
            Status = AssignmentStatus.Draft,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var pastAssignment = new Assignment
        {
            Id = Guid.NewGuid(),
            Title = "Past Deadline Assignment",
            Description = "Already due",
            ClassSubjectId = cs1.Id,
            TeacherId = teacher1.Id,
            Deadline = DateTime.UtcNow.AddDays(-1),
            MaxMarks = 100,
            Status = AssignmentStatus.Published,
            CreatedAt = DateTime.UtcNow.AddDays(-5),
            UpdatedAt = DateTime.UtcNow.AddDays(-5)
        };

        var otherTeacherAssignment = new Assignment
        {
            Id = Guid.NewGuid(),
            Title = "Other Teacher Assignment",
            Description = "Belongs to teacher2",
            ClassSubjectId = cs2.Id,
            TeacherId = teacher2.Id,
            Deadline = DateTime.UtcNow.AddDays(7),
            MaxMarks = 50,
            Status = AssignmentStatus.Published,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var now = DateTime.UtcNow;

        await context.Users.AddRangeAsync(admin, teacher1, teacher2, student1, student2);
        await context.Classes.AddRangeAsync(class1, class2);
        await context.Subjects.AddRangeAsync(math, physics);
        await context.ClassSubjects.AddRangeAsync(cs1, cs2);
        await context.TeacherClassSubjects.AddRangeAsync(
            new TeacherClassSubject { Id = Guid.NewGuid(), TeacherId = teacher1.Id, ClassSubjectId = cs1.Id, CreatedAt = now },
            new TeacherClassSubject { Id = Guid.NewGuid(), TeacherId = teacher2.Id, ClassSubjectId = cs2.Id, CreatedAt = now });
        await context.ClassStudents.AddRangeAsync(
            new ClassStudent { Id = Guid.NewGuid(), ClassId = class1.Id, StudentId = student1.Id, CreatedAt = now },
            new ClassStudent { Id = Guid.NewGuid(), ClassId = class2.Id, StudentId = student2.Id, CreatedAt = now });
        await context.Assignments.AddRangeAsync(
            publishedAssignment, draftAssignment, pastAssignment, otherTeacherAssignment);
        await context.SaveChangesAsync();

        return new WorkflowData
        {
            Admin = admin,
            Teacher1 = teacher1,
            Teacher2 = teacher2,
            Student1 = student1,
            Student2 = student2,
            ClassSubject1 = cs1,
            ClassSubject2 = cs2,
            Class1 = class1,
            PublishedAssignment = publishedAssignment,
            DraftAssignment = draftAssignment,
            PastAssignment = pastAssignment,
            OtherTeacherAssignment = otherTeacherAssignment
        };
    }
}

public class WorkflowData
{
    public User Admin { get; set; } = null!;
    public User Teacher1 { get; set; } = null!;
    public User Teacher2 { get; set; } = null!;
    public User Student1 { get; set; } = null!;
    public User Student2 { get; set; } = null!;
    public ClassSubject ClassSubject1 { get; set; } = null!;
    public ClassSubject ClassSubject2 { get; set; } = null!;
    public Class Class1 { get; set; } = null!;
    public Assignment PublishedAssignment { get; set; } = null!;
    public Assignment DraftAssignment { get; set; } = null!;
    public Assignment PastAssignment { get; set; } = null!;
    public Assignment OtherTeacherAssignment { get; set; } = null!;
}

public class FakeAuthService : IAuthService
{
    private readonly Guid _userId;

    public FakeAuthService(Guid userId)
    {
        _userId = userId;
    }

    public Task<AuthResponseDto?> LoginAsync(LoginDto dto) => Task.FromResult<AuthResponseDto?>(null);

    public Task<AuthResponseDto?> RegisterAsync(RegisterDto dto) => Task.FromResult<AuthResponseDto?>(null);

    public Task<User?> CreateUserAsync(RegisterDto dto) => Task.FromResult<User?>(null);

    public AuthResponseDto BuildAuthResponse(User user) => new();

    public Guid GetUserIdFromToken(ClaimsPrincipal user) => _userId;

    public UserRole GetUserRoleFromToken(ClaimsPrincipal user) => UserRole.Student;
}

public sealed class SqliteTestDb : IDisposable
{
    public SqliteConnection Connection { get; } = new("DataSource=:memory:");
    public AppDbContext Context { get; }

    public SqliteTestDb()
    {
        Connection.Open();
        using var cmd = Connection.CreateCommand();
        cmd.CommandText = "PRAGMA foreign_keys = ON;";
        cmd.ExecuteNonQuery();

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(Connection)
            .Options;
        Context = new AppDbContext(options);
        Context.Database.EnsureCreated();
    }

    public void Dispose()
    {
        Context.Dispose();
        Connection.Dispose();
    }
}
