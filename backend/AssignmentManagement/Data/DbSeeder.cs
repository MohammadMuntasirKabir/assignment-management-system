using AssignmentManagement.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        if (await context.Users.AnyAsync()) return;

        var adminPasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123");
        var teacher1PasswordHash = BCrypt.Net.BCrypt.HashPassword("teacher123");
        var teacher2PasswordHash = BCrypt.Net.BCrypt.HashPassword("teacher123");
        var student1PasswordHash = BCrypt.Net.BCrypt.HashPassword("student123");
        var student2PasswordHash = BCrypt.Net.BCrypt.HashPassword("student123");
        var student3PasswordHash = BCrypt.Net.BCrypt.HashPassword("student123");
        var student4PasswordHash = BCrypt.Net.BCrypt.HashPassword("student123");
        var student5PasswordHash = BCrypt.Net.BCrypt.HashPassword("student123");

        var admin = new User
        {
            Id = Guid.NewGuid(),
            Name = "Admin User",
            Email = "admin@example.com",
            PasswordHash = adminPasswordHash,
            Role = UserRole.Admin,
            CreatedAt = DateTime.UtcNow
        };

        var teacher1 = new User
        {
            Id = Guid.NewGuid(),
            Name = "John Smith",
            Email = "teacher1@example.com",
            PasswordHash = teacher1PasswordHash,
            Role = UserRole.Teacher,
            CreatedAt = DateTime.UtcNow
        };

        var teacher2 = new User
        {
            Id = Guid.NewGuid(),
            Name = "Jane Doe",
            Email = "teacher2@example.com",
            PasswordHash = teacher2PasswordHash,
            Role = UserRole.Teacher,
            CreatedAt = DateTime.UtcNow
        };

        var students = new[]
        {
            new User
            {
                Id = Guid.NewGuid(),
                Name = "Alice Johnson",
                Email = "student1@example.com",
                PasswordHash = student1PasswordHash,
                Role = UserRole.Student,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Id = Guid.NewGuid(),
                Name = "Bob Williams",
                Email = "student2@example.com",
                PasswordHash = student2PasswordHash,
                Role = UserRole.Student,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Id = Guid.NewGuid(),
                Name = "Charlie Brown",
                Email = "student3@example.com",
                PasswordHash = student3PasswordHash,
                Role = UserRole.Student,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Id = Guid.NewGuid(),
                Name = "Diana Prince",
                Email = "student4@example.com",
                PasswordHash = student4PasswordHash,
                Role = UserRole.Student,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Id = Guid.NewGuid(),
                Name = "Ethan Hunt",
                Email = "student5@example.com",
                PasswordHash = student5PasswordHash,
                Role = UserRole.Student,
                CreatedAt = DateTime.UtcNow
            }
        };

        var mathClass = new Class
        {
            Id = Guid.NewGuid(),
            Name = "Class 10-A",
            Description = "Grade 10, Section A",
            CreatedAt = DateTime.UtcNow
        };

        var scienceClass = new Class
        {
            Id = Guid.NewGuid(),
            Name = "Class 10-B",
            Description = "Grade 10, Section B",
            CreatedAt = DateTime.UtcNow
        };

        var englishClass = new Class
        {
            Id = Guid.NewGuid(),
            Name = "Class 9-A",
            Description = "Grade 9, Section A",
            CreatedAt = DateTime.UtcNow
        };

        var mathSubject = new Subject
        {
            Id = Guid.NewGuid(),
            Name = "Mathematics",
            Description = "Mathematics (Algebra, Geometry, Calculus)",
            CreatedAt = DateTime.UtcNow
        };

        var physicsSubject = new Subject
        {
            Id = Guid.NewGuid(),
            Name = "Physics",
            Description = "Physics (Mechanics, Thermodynamics, Waves)",
            CreatedAt = DateTime.UtcNow
        };

        var englishSubject = new Subject
        {
            Id = Guid.NewGuid(),
            Name = "English",
            Description = "English (Literature, Grammar, Composition)",
            CreatedAt = DateTime.UtcNow
        };

        var mathScienceClassSubject = new ClassSubject
        {
            Id = Guid.NewGuid(),
            ClassId = mathClass.Id,
            SubjectId = mathSubject.Id,
            CreatedAt = DateTime.UtcNow
        };

        var scienceClassSubject = new ClassSubject
        {
            Id = Guid.NewGuid(),
            ClassId = scienceClass.Id,
            SubjectId = physicsSubject.Id,
            CreatedAt = DateTime.UtcNow
        };

        var mathClassSubjectSubject = new ClassSubject
        {
            Id = Guid.NewGuid(),
            ClassId = mathClass.Id,
            SubjectId = physicsSubject.Id,
            CreatedAt = DateTime.UtcNow
        };

        var englishClassSubject = new ClassSubject
        {
            Id = Guid.NewGuid(),
            ClassId = englishClass.Id,
            SubjectId = englishSubject.Id,
            CreatedAt = DateTime.UtcNow
        };

        var teacherAssignments = new[]
        {
            new TeacherClassSubject
            {
                Id = Guid.NewGuid(),
                TeacherId = teacher1.Id,
                ClassSubjectId = mathScienceClassSubject.Id,
                CreatedAt = DateTime.UtcNow
            },
            new TeacherClassSubject
            {
                Id = Guid.NewGuid(),
                TeacherId = teacher1.Id,
                ClassSubjectId = mathClassSubjectSubject.Id,
                CreatedAt = DateTime.UtcNow
            },
            new TeacherClassSubject
            {
                Id = Guid.NewGuid(),
                TeacherId = teacher2.Id,
                ClassSubjectId = scienceClassSubject.Id,
                CreatedAt = DateTime.UtcNow
            },
            new TeacherClassSubject
            {
                Id = Guid.NewGuid(),
                TeacherId = teacher2.Id,
                ClassSubjectId = englishClassSubject.Id,
                CreatedAt = DateTime.UtcNow
            }
        };

        // Enroll students in classes (students can enroll in multiple classes)
        var classStudents = new List<ClassStudent>();

        // All 5 students in mathClass (Class 10-A)
        for (int i = 0; i < 5; i++)
        {
            classStudents.Add(new ClassStudent
            {
                Id = Guid.NewGuid(),
                ClassId = mathClass.Id,
                StudentId = students[i].Id,
                CreatedAt = DateTime.UtcNow
            });
        }

        // Students 0,1,2 in scienceClass (Class 10-B)
        for (int i = 0; i < 3; i++)
        {
            classStudents.Add(new ClassStudent
            {
                Id = Guid.NewGuid(),
                ClassId = scienceClass.Id,
                StudentId = students[i].Id,
                CreatedAt = DateTime.UtcNow
            });
        }

        // Students 3,4 in englishClass (Class 9-A)
        for (int i = 3; i < 5; i++)
        {
            classStudents.Add(new ClassStudent
            {
                Id = Guid.NewGuid(),
                ClassId = englishClass.Id,
                StudentId = students[i].Id,
                CreatedAt = DateTime.UtcNow
            });
        }

        var futureDate = DateTime.UtcNow.AddDays(7);
        var pastDate = DateTime.UtcNow.AddDays(-2);

        var assignments = new[]
        {
            new Assignment
            {
                Id = Guid.NewGuid(),
                Title = "Algebra Problem Set 1",
                Description = "Solve the following algebra problems: linear equations, quadratic equations, and systems of equations. Show all your work.",
                ClassSubjectId = mathScienceClassSubject.Id,
                TeacherId = teacher1.Id,
                Deadline = futureDate.AddHours(23),
                MaxMarks = 100,
                Status = AssignmentStatus.Published,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Assignment
            {
                Id = Guid.NewGuid(),
                Title = "Physics Lab Report",
                Description = "Write a lab report on the optics experiment conducted in class. Include hypothesis, method, results, and conclusion.",
                ClassSubjectId = scienceClassSubject.Id,
                TeacherId = teacher2.Id,
                Deadline = futureDate.AddDays(3).AddHours(14),
                MaxMarks = 50,
                Status = AssignmentStatus.Published,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Assignment
            {
                Id = Guid.NewGuid(),
                Title = "English Essay Draft",
                Description = "Write a 500-word essay on 'The Importance of Education'. This is a draft submission.",
                ClassSubjectId = englishClassSubject.Id,
                TeacherId = teacher2.Id,
                Deadline = pastDate,
                MaxMarks = 30,
                Status = AssignmentStatus.Published,
                CreatedAt = DateTime.UtcNow.AddDays(-5),
                UpdatedAt = DateTime.UtcNow.AddDays(-5)
            }
        };

        var submissions = new List<Submission>();
        var studentInMathClass = students.Take(5).ToArray();
        var studentInScienceClass = students.Take(3).ToArray();
        var studentInEnglishClass = students.Skip(3).Take(2).ToArray();

        foreach (var assignment in assignments)
        {
            if (assignment.Title == "Algebra Problem Set 1")
            {
                foreach (var student in studentInMathClass.Take(2))
                {
                    submissions.Add(new Submission
                    {
                        Id = Guid.NewGuid(),
                        AssignmentId = assignment.Id,
                        StudentId = student.Id,
                        Content = "Student submission content for Algebra Problem Set 1.",
                        Status = SubmissionStatus.Submitted,
                        Marks = 85,
                        Feedback = "Good work on the linear equations. Review quadratic formula.",
                        SubmittedAt = DateTime.UtcNow.AddDays(6),
                        CreatedAt = DateTime.UtcNow.AddDays(6),
                        UpdatedAt = DateTime.UtcNow.AddDays(6)
                    });
                }
            }
            else if (assignment.Title == "English Essay Draft")
            {
                foreach (var student in studentInEnglishClass.Take(1))
                {
                    submissions.Add(new Submission
                    {
                        Id = Guid.NewGuid(),
                        AssignmentId = assignment.Id,
                        StudentId = student.Id,
                        Content = "Student submission content for English Essay Draft.",
                        Status = SubmissionStatus.Late,
                        SubmittedAt = DateTime.UtcNow.AddDays(-1),
                        CreatedAt = DateTime.UtcNow.AddDays(-1),
                        UpdatedAt = DateTime.UtcNow.AddDays(-1)
                    });
                }
            }
        }

        context.Users.AddRange(admin, teacher1, teacher2);
        context.Users.AddRange(students);
        context.Classes.AddRange(mathClass, scienceClass, englishClass);
        context.Subjects.AddRange(mathSubject, physicsSubject, englishSubject);
        context.ClassSubjects.AddRange(
            mathScienceClassSubject, scienceClassSubject, mathClassSubjectSubject, englishClassSubject);
        context.TeacherClassSubjects.AddRange(teacherAssignments);
        context.ClassStudents.AddRange(classStudents);
        context.Assignments.AddRange(assignments);
        context.Submissions.AddRange(submissions);

        await context.SaveChangesAsync();
    }
}
