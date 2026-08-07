# Assignment & Submission Management System — Project Plan

## Project Overview
Build a role-based **Assignment & Submission Management System** for a school/college with three user roles: **Admin**, **Teacher**, and **Student**.

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Zod |
| Backend | ASP.NET Core Web API 8.0, C#, RESTful API, Swagger/OpenAPI |
| Database | PostgreSQL 18 |
| Auth | JWT-based authentication, role-based authorization |
| Backend Tests | xUnit + Moq |
| Frontend Tests | Jest + React Testing Library |

## Data Model
Entities: Users, Classes, Subjects, ClassSubjects (m2m), ClassStudents (m2m), TeacherClassSubjects (m2m), Assignments, Submissions

Key relationships:
- Classes ↔ Subjects (via ClassSubjects)
- Classes ↔ Students (via ClassStudents) — students can enroll in multiple classes
- Teachers ↔ ClassSubjects (via TeacherClassSubjects)
- Assignments → ClassSubject + Teacher
- Submissions → Assignment + Student

## API Endpoints
### Auth
- POST `/api/auth/login` — Authenticate, return JWT

### Admin
- All CRUD for Users, Classes, Subjects, ClassSubjects
- Assign teachers to class+subject
- Enroll students in classes
- View all assignments and submissions

### Teacher
- CRUD assignments (own only)
- View/list submissions for their assignments
- Grade submissions (marks + feedback)
- Change submission status

### Student
- View assignments for enrolled classes
- Submit assignments
- Update submissions before deadline
- View own submissions (status, marks, feedback)

## Frontend Structure
- `/app/api/auth/login/page.tsx`
- `/app/admin/` — dashboard, classes, subjects, users, assignments, submissions
- `/app/teacher/` — dashboard, assignments (CRUD), submissions (grading)
- `/app/student/` — dashboard, assignments (view), submissions (list/edit)
- `/app/components/` — AuthProvider, ProtectedRoute, RoleRoute, DashboardLayout
- `/app/lib/` — api.ts (axios), types.ts

## Backend Structure
- `/Controllers/` — AuthController, AdminController, TeacherController, StudentController
- `/Models/Entities/` — User, Class, Subject, ClassSubject, ClassStudent, TeacherClassSubject, Assignment, Submission
- `/Models/DTOs/` — AuthDto, ClassDto, SubjectDto, AssignmentDto, SubmissionDto
- `/Services/` — AuthService, AssignmentService, SubmissionService
- `/Data/` — AppDbContext, Migrations
- `/Middleware/` — JwtMiddleware, RoleMiddleware
- `/tests/` — AuthTests, AuthorizationTests, AssignmentTests, SubmissionTests

## Business Rules
1. Role-based access enforced at API level
2. Draft → Published: only published assignments visible to students
3. Deadline enforcement: submissions after deadline flagged as "Late"
4. Submission editing: allowed only before deadline
5. Assignment ownership: teachers can only edit/delete their own
6. Grading: teachers can only grade their own assignments' submissions
7. Students enroll in multiple classes; view assignments across all classes

## Implementation Phases
| Phase | Description | Duration |
|-------|-------------|----------|
| 0 | Environment setup (.NET SDK, git, PostgreSQL, project scaffold) | 1 day |
| 1 | Backend: EF Core, JWT, Swagger, DTOs, entities | 2-3 days |
| 2 | Backend: API endpoints (all roles) | 3-4 days |
| 3 | Database migrations + seed data | 1 day |
| 4 | Backend unit tests (xUnit, ~30 tests) | 1-2 days |
| 5 | Frontend: Next.js, Tailwind, Axios, Auth context | 1 day |
| 6 | Frontend: All pages & components | 4-5 days |
| 7 | Frontend tests (Jest + RTL, ~20 tests) | 1-2 days |
| 8 | Documentation (README, .env.example) + final testing | 1 day |

## Assumptions
1. Single institution (no multi-tenancy beyond roles)
2. Email is the unique login identifier
3. Late submissions are allowed (flagged "Late" status)
4. Teachers can be assigned to multiple class+subject combinations
5. Email notifications for deadlines (optional)

## Deliverables
- Git repository: frontend, backend, database migrations, tests
- README.md (overview, setup, DB setup, run instructions, test instructions, assumptions, limitations)
- .env.example (no real secrets)
- Demo credentials for all three roles
- API documentation via Swagger
