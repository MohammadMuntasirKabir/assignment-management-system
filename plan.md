# Assignment & Submission Management System — Project Plan

## Project Overview
Build a role-based **Assignment & Submission Management System** for a school/college with three user roles: **Admin**, **Teacher**, and **Student**.

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, react-hook-form + Zod |
| Backend | ASP.NET Core Web API (.NET 10), C#, RESTful API, EF Core 10, Swagger/OpenAPI |
| Database | PostgreSQL 18 |
| Auth | JWT-based authentication, role-based authorization |
| Deployment | Docker + docker-compose (PostgreSQL, API, frontend) |
| Backend Tests | xUnit + Moq (84 tests) |
| Frontend Tests | Jest + React Testing Library (68 tests) |

## Data Model
Entities: Users, Classes, Subjects, ClassSubjects (m2m), ClassStudents (m2m), TeacherClassSubjects (m2m), Assignments, Submissions

Key relationships:
- Classes ↔ Subjects (via ClassSubjects)
- Classes ↔ Students (via ClassStudents) — students can enroll in multiple classes
- Teachers ↔ ClassSubjects (via TeacherClassSubjects)
- Assignments → ClassSubject + Teacher
- Submissions → Assignment + Student

Referential integrity: user-referencing foreign keys use `RESTRICT` (protects accounts referenced by assignments, submissions, teacher assignments, or enrollments); class/subject links cascade.

## API Endpoints
### Auth
- POST `/api/auth/login` — Authenticate, return JWT
- POST `/api/auth/register` — Self-register (default role: Student)

### Admin
- CRUD for Users, Classes, Subjects, ClassSubjects (paged list endpoints)
- Assign teachers to class+subject (`assign-teacher`), list + unassign
- Enroll students in classes (`enroll-student`), list + remove
- View all assignments and submissions (paged)
- Transfer the single admin role to another account

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
- `src/app/login/` — login page (react-hook-form + Zod validation)
- `src/app/register/` — registration page (default Student role)
- `src/app/admin/` — dashboard, classes, subjects, class-subjects, users, teacher-assignments, enrollments, assignments, submissions
- `src/app/teacher/` — dashboard, assignments (CRUD), submissions (grading)
- `src/app/student/` — dashboard, assignments (view), submissions (list/edit)
- `src/components/` — AuthProvider, ProtectedRoute, DashboardLayout, Pagination
- `src/lib/` — api.ts (axios), auth.ts (JWT cookie helpers), types.ts

## Backend Structure
- `Controllers/` — AuthController, AdminController, TeacherController, StudentController
- `Models/Entities/` — User, Class, Subject, ClassSubject, ClassStudent, TeacherClassSubject, Assignment, Submission
- `Models/DTOs/` — AuthDto, ClassDto, SubjectDto, AssignmentDto, SubmissionDto, UserDto, PagedResultDto
- `Services/` — AuthService, DtoMapper
- `Data/` — AppDbContext, DbSeeder, Migrations
- `AssignmentManagement.Tests/` — AuthTests, AuthorizationTests, AssignmentTests, SubmissionTests, ApiWorkflowTests

## Business Rules
1. Role-based access enforced at API level with JWT bearer auth
2. Draft → Published: only published assignments visible to students
3. Deadline enforcement: submissions after deadline flagged as "Late"
4. Submission editing: allowed only before deadline
5. Assignment ownership: teachers can only edit/delete their own
6. Grading: teachers can only grade their own assignments' submissions
7. Students enroll in multiple classes; view assignments across all classes
8. Exactly one admin account exists; role changes to admin go through a transfer flow

## Implementation Phases
| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Environment setup (.NET SDK, git, PostgreSQL, project scaffold) | Done |
| 1 | Backend: EF Core, JWT, Swagger, DTOs, entities | Done |
| 2 | Backend: API endpoints (all roles) | Done |
| 3 | Database migrations + seed data | Done |
| 4 | Backend unit tests (xUnit) | Done (84) |
| 5 | Frontend: Next.js, Tailwind, Axios, Auth context | Done |
| 6 | Frontend: All pages & components | Done |
| 7 | Frontend tests (Jest + RTL) | Done (68) |
| 8 | Documentation (README, .env.example) + final testing | Done |
| 9 | Docker packaging (docker-compose + Dockerfiles) | Done |

## Assumptions
1. Single institution (no multi-tenancy beyond roles)
2. Email is the unique login identifier
3. Late submissions are allowed (flagged "Late" status)
4. Teachers can be assigned to multiple class+subject combinations
5. Email notifications for deadlines (optional)

## Deliverables
- Git repository: frontend, backend, database migrations, tests
- README.md (overview, setup, DB setup, run instructions, test instructions, assumptions, limitations)
- docker-compose.yml + Dockerfiles for PostgreSQL, API, and frontend
- .env.example (no real secrets)
- Demo credentials for all three roles
- API documentation via Swagger
