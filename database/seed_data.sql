-- ============================================================
-- Assignment & Submission Management System
-- Optional raw SQL seed data (PostgreSQL)
--
-- NOTE: The application auto-seeds equivalent demo data on startup
-- via `DbSeeder.cs` (it uses randomized UUIDs and BCrypt password
-- hashes). Use this script only for manual provisioning. Each
-- PasswordHash below is a placeholder and MUST be replaced with a
-- real BCrypt hash (e.g. generated via BCrypt.Net) before use.
-- ============================================================

BEGIN;

-- Users
INSERT INTO "Users" ("Id", "Name", "Email", "PasswordHash", "Role", "CreatedAt") VALUES
  ('00000000-0000-0000-0000-000000000001', 'Admin User',  'admin@example.com',  'REPLACE_WITH_BCRYPT_HASH', 'Admin',   NOW()),
  ('00000000-0000-0000-0000-000000000002', 'John Smith',  'teacher1@example.com','REPLACE_WITH_BCRYPT_HASH', 'Teacher', NOW()),
  ('00000000-0000-0000-0000-000000000003', 'Jane Doe',    'teacher2@example.com','REPLACE_WITH_BCRYPT_HASH', 'Teacher', NOW()),
  ('00000000-0000-0000-0000-000000000004', 'Alice Johnson','student1@example.com','REPLACE_WITH_BCRYPT_HASH','Student', NOW()),
  ('00000000-0000-0000-0000-000000000005', 'Bob Williams','student2@example.com','REPLACE_WITH_BCRYPT_HASH', 'Student', NOW()),
  ('00000000-0000-0000-0000-000000000006', 'Charlie Brown','student3@example.com','REPLACE_WITH_BCRYPT_HASH','Student', NOW()),
  ('00000000-0000-0000-0000-000000000007', 'Diana Prince','student4@example.com','REPLACE_WITH_BCRYPT_HASH', 'Student', NOW()),
  ('00000000-0000-0000-0000-000000000008', 'Ethan Hunt',  'student5@example.com','REPLACE_WITH_BCRYPT_HASH', 'Student', NOW());

-- Classes
INSERT INTO "Classes" ("Id", "Name", "Description", "CreatedAt") VALUES
  ('10000000-0000-0000-0000-000000000001', 'Class 10-A', 'Grade 10, Section A', NOW()),
  ('10000000-0000-0000-0000-000000000002', 'Class 10-B', 'Grade 10, Section B', NOW()),
  ('10000000-0000-0000-0000-000000000003', 'Class 9-A',  'Grade 9, Section A',  NOW());

-- Subjects
INSERT INTO "Subjects" ("Id", "Name", "Description", "CreatedAt") VALUES
  ('20000000-0000-0000-0000-000000000001', 'Mathematics', 'Mathematics (Algebra, Geometry, Calculus)', NOW()),
  ('20000000-0000-0000-0000-000000000002', 'Physics',     'Physics (Mechanics, Thermodynamics, Waves)', NOW()),
  ('20000000-0000-0000-0000-000000000003', 'English',     'English (Literature, Grammar, Composition)', NOW());

-- Class-Subject links
INSERT INTO "ClassSubjects" ("Id", "ClassId", "SubjectId", "CreatedAt") VALUES
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', NOW()),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', NOW()),
  ('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', NOW()),
  ('30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', NOW());

-- Teacher -> Class-Subject assignments
INSERT INTO "TeacherClassSubjects" ("Id", "TeacherId", "ClassSubjectId", "CreatedAt") VALUES
  ('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', NOW()),
  ('40000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003', NOW()),
  ('40000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', NOW()),
  ('40000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000004', NOW());

-- Student enrollments: all 5 in Class 10-A, students 1-3 in Class 10-B, students 4-5 in Class 9-A
INSERT INTO "ClassStudents" ("Id", "ClassId", "StudentId", "CreatedAt") VALUES
  ('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', NOW()),
  ('50000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', NOW()),
  ('50000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000006', NOW()),
  ('50000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000007', NOW()),
  ('50000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000008', NOW()),
  ('50000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', NOW()),
  ('50000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', NOW()),
  ('50000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000006', NOW()),
  ('50000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000007', NOW()),
  ('50000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000008', NOW());

-- Assignments
INSERT INTO "Assignments" ("Id", "Title", "Description", "ClassSubjectId", "TeacherId", "Deadline", "MaxMarks", "Status", "CreatedAt", "UpdatedAt") VALUES
  ('60000000-0000-0000-0000-000000000001', 'Algebra Problem Set 1',
   'Solve the following algebra problems: linear equations, quadratic equations, and systems of equations. Show all your work.',
   '30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', NOW() + INTERVAL '7 days', 100, 'Published', NOW(), NOW()),
  ('60000000-0000-0000-0000-000000000002', 'Physics Lab Report',
   'Write a lab report on the optics experiment conducted in class. Include hypothesis, method, results, and conclusion.',
   '30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', NOW() + INTERVAL '3 days', 50, 'Published', NOW(), NOW()),
  ('60000000-0000-0000-0000-000000000003', 'English Essay Draft',
   'Write a 500-word essay on ''The Importance of Education''. This is a draft submission.',
   '30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', NOW() - INTERVAL '2 days', 30, 'Published', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days');

-- Submissions
INSERT INTO "Submissions" ("Id", "AssignmentId", "StudentId", "Content", "Status", "Marks", "Feedback", "SubmittedAt", "CreatedAt", "UpdatedAt") VALUES
  ('70000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004',
   'Student submission content for Algebra Problem Set 1.', 'Submitted', 85, 'Good work on the linear equations. Review quadratic formula.',
   NOW() + INTERVAL '6 days', NOW() + INTERVAL '6 days', NOW() + INTERVAL '6 days'),
  ('70000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005',
   'Student submission content for Algebra Problem Set 1.', 'Submitted', 85, 'Good work on the linear equations. Review quadratic formula.',
   NOW() + INTERVAL '6 days', NOW() + INTERVAL '6 days', NOW() + INTERVAL '6 days'),
  ('70000000-0000-0000-0000-000000000003', '60000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000007',
   'Student submission content for English Essay Draft.', 'Late', NULL, NULL,
   NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');

COMMIT;
