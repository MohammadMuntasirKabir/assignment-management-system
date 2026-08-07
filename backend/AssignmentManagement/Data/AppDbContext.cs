using Microsoft.EntityFrameworkCore;
using AssignmentManagement.Models.Entities;

namespace AssignmentManagement.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Class> Classes => Set<Class>();
    public DbSet<Subject> Subjects => Set<Subject>();
    public DbSet<ClassSubject> ClassSubjects => Set<ClassSubject>();
    public DbSet<ClassStudent> ClassStudents => Set<ClassStudent>();
    public DbSet<TeacherClassSubject> TeacherClassSubjects => Set<TeacherClassSubject>();
    public DbSet<Assignment> Assignments => Set<Assignment>();
    public DbSet<Submission> Submissions => Set<Submission>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.Role).HasConversion<string>();
        });

        modelBuilder.Entity<ClassSubject>(entity =>
        {
            entity.HasOne(cs => cs.Class)
                .WithMany(c => c.ClassSubjects)
                .HasForeignKey(cs => cs.ClassId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(cs => cs.Subject)
                .WithMany(s => s.ClassSubjects)
                .HasForeignKey(cs => cs.SubjectId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ClassStudent>(entity =>
        {
            entity.HasOne(cs => cs.Class)
                .WithMany(c => c.ClassStudents)
                .HasForeignKey(cs => cs.ClassId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(cs => cs.Student)
                .WithMany(u => u.ClassStudents)
                .HasForeignKey(cs => cs.StudentId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(cs => new { cs.ClassId, cs.StudentId }).IsUnique();
        });

        modelBuilder.Entity<TeacherClassSubject>(entity =>
        {
            entity.HasOne(tcs => tcs.Teacher)
                .WithMany(u => u.TeacherClassSubjects)
                .HasForeignKey(tcs => tcs.TeacherId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(tcs => tcs.ClassSubject)
                .WithMany(cs => cs.TeacherClassSubjects)
                .HasForeignKey(tcs => tcs.ClassSubjectId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(tcs => new { tcs.TeacherId, tcs.ClassSubjectId }).IsUnique();
        });

        modelBuilder.Entity<Assignment>(entity =>
        {
            entity.HasOne(a => a.ClassSubject)
                .WithMany(cs => cs.Assignments)
                .HasForeignKey(a => a.ClassSubjectId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(a => a.Teacher)
                .WithMany(u => u.Assignments)
                .HasForeignKey(a => a.TeacherId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(a => a.Status).HasConversion<string>();
        });

        modelBuilder.Entity<Submission>(entity =>
        {
            entity.HasOne(s => s.Assignment)
                .WithMany(a => a.Submissions)
                .HasForeignKey(s => s.AssignmentId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(s => s.Student)
                .WithMany(u => u.Submissions)
                .HasForeignKey(s => s.StudentId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(s => s.Status).HasConversion<string>();

            entity.HasIndex(s => new { s.AssignmentId, s.StudentId }).IsUnique();
        });
    }
}
