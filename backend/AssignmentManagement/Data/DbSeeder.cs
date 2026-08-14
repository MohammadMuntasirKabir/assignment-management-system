using AssignmentManagement.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace AssignmentManagement.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        if (await context.Users.AnyAsync()) return;

        var adminPasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123");
        var teacherPasswordHash = BCrypt.Net.BCrypt.HashPassword("teacher123");
        var studentPasswordHash = BCrypt.Net.BCrypt.HashPassword("student123");

        var admin = new User
        {
            Id = Guid.NewGuid(),
            Name = "Admin User",
            Email = "admin@example.com",
            PasswordHash = adminPasswordHash,
            Role = UserRole.Admin,
            CreatedAt = DateTime.UtcNow
        };

        var teacherNames = new[]
        {
            "John Smith", "Jane Doe", "Michael Chen", "Sarah Lee",
            "David Kim", "Emma Watson", "Robert Brown", "Linda Park"
        };

        var teachers = teacherNames
            .Select((name, i) => new User
            {
                Id = Guid.NewGuid(),
                Name = name,
                Email = $"teacher{i + 1}@example.com",
                PasswordHash = teacherPasswordHash,
                Role = UserRole.Teacher,
                CreatedAt = DateTime.UtcNow
            })
            .ToArray();

        var studentNames = new[]
        {
            "Alice Johnson", "Bob Williams", "Charlie Brown", "Diana Prince", "Ethan Hunt",
            "Fiona Gallagher", "George Miller", "Hannah Baker", "Ivan Petrov", "Julia Roberts",
            "Kevin Hart", "Laura Croft", "Michael Scott", "Nina Dobrev", "Oscar Wilde",
            "Paula Patton", "Quincy Adams", "Rachel Green", "Sam Wilson", "Tina Fey",
            "Uma Thurman", "Victor Hugo", "Wendy Davis", "Xavier Stone", "Yara Shahidi",
            "Zack Morris", "Aaron Lewis", "Bella Swan", "Colin Farrell", "Dana Scully",
            "Eric Cartman", "Fatima Zahra", "Goku Son", "Harry Potter", "Iris West",
            "Jack Sparrow"
        };

        var students = studentNames
            .Select((name, i) => new User
            {
                Id = Guid.NewGuid(),
                Name = name,
                Email = $"student{i + 1}@example.com",
                PasswordHash = studentPasswordHash,
                Role = UserRole.Student,
                CreatedAt = DateTime.UtcNow
            })
            .ToArray();

        var classDefinitions = new[]
        {
            ("Class 6-A", "Grade 6, Section A"),
            ("Class 6-B", "Grade 6, Section B"),
            ("Class 7-A", "Grade 7, Section A"),
            ("Class 7-B", "Grade 7, Section B"),
            ("Class 8-A", "Grade 8, Section A"),
            ("Class 9-A", "Grade 9, Section A")
        };

        var classes = classDefinitions
            .Select(c => new Class
            {
                Id = Guid.NewGuid(),
                Name = c.Item1,
                Description = c.Item2,
                CreatedAt = DateTime.UtcNow
            })
            .ToArray();

        var subjectDefinitions = new[]
        {
            ("Bangla", "Bangla (Literature, Grammar, Composition)"),
            ("English", "English (Literature, Grammar, Composition)"),
            ("Mathematics", "Mathematics (Algebra, Geometry, Calculus)"),
            ("Science", "Science (Biology, Chemistry, Environment)"),
            ("Social Science", "Social Science (History, Geography, Civics)"),
            ("ICT", "ICT (Computer Fundamentals, Programming, Internet)"),
            ("Physics", "Physics (Mechanics, Thermodynamics, Waves)"),
            ("Chemistry", "Chemistry (Atoms, Bonding, Reactions)")
        };

        var subjects = subjectDefinitions
            .Select(s => new Subject
            {
                Id = Guid.NewGuid(),
                Name = s.Item1,
                Description = s.Item2,
                CreatedAt = DateTime.UtcNow
            })
            .ToArray();

        var classSubjects = new List<ClassSubject>();
        foreach (var cls in classes)
        {
            foreach (var subject in subjects)
            {
                classSubjects.Add(new ClassSubject
                {
                    Id = Guid.NewGuid(),
                    ClassId = cls.Id,
                    SubjectId = subject.Id,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        var teacherAssignments = new List<TeacherClassSubject>();
        for (int t = 0; t < teachers.Length; t++)
        {
            for (int i = 0; i < 6; i++)
            {
                var index = t * 6 + i;
                teacherAssignments.Add(new TeacherClassSubject
                {
                    Id = Guid.NewGuid(),
                    TeacherId = teachers[t].Id,
                    ClassSubjectId = classSubjects[index].Id,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        var classStudents = new List<ClassStudent>();
        for (int i = 0; i < students.Length; i++)
        {
            var assignedClasses = new HashSet<Guid>();
            int[] classOffsets = { i % classes.Length, (i / classes.Length) % classes.Length, (i + 5) % classes.Length };
            foreach (var offset in classOffsets)
            {
                if (assignedClasses.Add(classes[offset].Id))
                {
                    classStudents.Add(new ClassStudent
                    {
                        Id = Guid.NewGuid(),
                        ClassId = classes[offset].Id,
                        StudentId = students[i].Id,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }
        }

        var now = DateTime.UtcNow;
        var futureDate = now.AddDays(7);
        var pastDate = now.AddDays(-3);

        var assignments = new List<Assignment>();
        var counter = 0;
        foreach (var ta in teacherAssignments)
        {
            int assignmentCount = counter % 3 == 0 ? 2 : 1;
            var classSubject = classSubjects.First(cs => cs.Id == ta.ClassSubjectId);
            var className = classes.First(c => c.Id == classSubject.ClassId).Name;
            var subjectName = subjects.First(s => s.Id == classSubject.SubjectId).Name;

            for (int k = 0; k < assignmentCount; k++)
            {
                counter++;
                bool isPast = counter % 3 == 0;
                var deadline = isPast
                    ? pastDate.AddDays(-counter % 5)
                    : futureDate.AddDays((counter % 7) + 1).AddHours(counter % 12);

                assignments.Add(new Assignment
                {
                    Id = Guid.NewGuid(),
                    Title = $"Assignment {counter} – {subjectName} ({className})",
                    Description = $"Complete and submit the {subjectName} task for {className}. Follow the guidelines discussed in class and show all your work.",
                    ClassSubjectId = ta.ClassSubjectId,
                    TeacherId = ta.TeacherId,
                    Deadline = deadline,
                    MaxMarks = 20 + (counter * 7) % 80,
                    Status = counter % 10 == 0 ? AssignmentStatus.Draft : AssignmentStatus.Published,
                    CreatedAt = now.AddDays(-(counter % 10)),
                    UpdatedAt = now.AddDays(-(counter % 10))
                });
            }
        }

        var studentsByClass = classStudents
            .GroupBy(cs => cs.ClassId)
            .ToDictionary(g => g.Key, g => g.Select(x => x.StudentId).ToArray());

        var submissions = new List<Submission>();
        var submissionCounter = 0;
        foreach (var assignment in assignments.Where(a => a.Status == AssignmentStatus.Published))
        {
            var classSubject = classSubjects.First(cs => cs.Id == assignment.ClassSubjectId);
            if (!studentsByClass.TryGetValue(classSubject.ClassId, out var enrolledStudents)) continue;

            for (int s = 0; s < enrolledStudents.Length; s++)
            {
                if ((s + submissionCounter) % 2 != 0) continue;

                submissionCounter++;
                bool isLate = submissionCounter % 5 == 0;
                bool isReviewed = submissionCounter % 3 == 0;
                var status = isReviewed
                    ? SubmissionStatus.Reviewed
                    : isLate
                        ? SubmissionStatus.Late
                        : SubmissionStatus.Submitted;

                var submittedAt = assignment.Deadline > now
                    ? now.AddHours(-2)
                    : assignment.Deadline.AddMinutes(30);

                submissions.Add(new Submission
                {
                    Id = Guid.NewGuid(),
                    AssignmentId = assignment.Id,
                    StudentId = enrolledStudents[s],
                    Content = $"Student submission for {assignment.Title}. Includes the required work and notes.",
                    Status = status,
                    Marks = status == SubmissionStatus.Reviewed ? 60 + (submissionCounter * 3) % 40 : null,
                    Feedback = status == SubmissionStatus.Reviewed ? "Good effort. Review the key concepts before the next task." : null,
                    SubmittedAt = submittedAt,
                    CreatedAt = submittedAt,
                    UpdatedAt = submittedAt
                });
            }
        }

        context.Users.Add(admin);
        context.Users.AddRange(teachers);
        context.Users.AddRange(students);
        context.Classes.AddRange(classes);
        context.Subjects.AddRange(subjects);
        context.ClassSubjects.AddRange(classSubjects);
        context.TeacherClassSubjects.AddRange(teacherAssignments);
        context.ClassStudents.AddRange(classStudents);
        context.Assignments.AddRange(assignments);
        context.Submissions.AddRange(submissions);

        await context.SaveChangesAsync();
    }
}
