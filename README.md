# Assignment & Submission Management System

A role-based web application for schools and colleges to manage assignments, submissions, and grading. The system supports three user roles: **Admin**, **Teacher**, and **Student**, each with dedicated dashboards and API access.

## Features

- **Role-based authentication & authorization** — JWT-based login with Admin, Teacher, and Student roles
- **Admin dashboard** — Manage users, classes, subjects, class-subject links, teacher assignments, and student enrollments. View all assignments and submissions.
- **Teacher dashboard** — Create, update, and delete assignments. Assign assignments to specific class-subject combinations. View and grade student submissions with marks and feedback.
- **Student dashboard** — View published assignments for enrolled classes. Submit assignments and update submissions before the deadline. View submission status, marks, and teacher feedback.
- **Business rules enforced** — Draft/published assignment states, deadline enforcement (late submissions flagged), duplicate submission prevention, marks cannot exceed max marks.
- **API documentation** — Interactive Swagger UI at `/swagger` on the backend.
- **Unit tested** — 53 backend tests (xUnit) and 30 frontend tests (Jest + React Testing Library).

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Zod, Axios |
| **Backend** | ASP.NET Core Web API 10.0, C#, RESTful API, Swagger/OpenAPI |
| **Database** | PostgreSQL 18 |
| **Authentication** | JWT Tokens, role-based authorization |
| **Backend Tests** | xUnit + FluentAssertions (InMemory database) |
| **Frontend Tests** | Jest + React Testing Library |
| **ORM** | Entity Framework Core 10.0 |

## Project Structure

```
OnnorokomProjukti/
├── backend/
│   ├── AssignmentManagement.slnx
│   ├── AssignmentManagement/
│   │   ├── Controllers/
│   │   │   ├── AuthController.cs
│   │   │   ├── AdminController.cs
│   │   │   ├── TeacherController.cs
│   │   │   └── StudentController.cs
│   │   ├── Models/
│   │   │   ├── Entities/        (User, Class, Subject, ClassSubject, ClassStudent, TeacherClassSubject, Assignment, Submission)
│   │   │   └── DTOs/            (AuthDto, UserDto, ClassDto, SubjectDto, ClassSubjectDto, AssignmentDto, SubmissionDto)
│   │   ├── Services/
│   │   │   ├── IAuthService.cs
│   │   │   ├── AuthService.cs
│   │   │   └── DtoMapper.cs     (entity → DTO mapping)
│   │   ├── Data/
│   │   │   ├── AppDbContext.cs
│   │   │   ├── DbSeeder.cs
│   │   │   └── Migrations/      (EF Core migrations)
│   │   ├── GlobalUsings.cs
│   │   ├── Program.cs
│   │   └── appsettings.json
│   └── AssignmentManagement.Tests/
│       ├── AuthTests.cs
│       ├── AssignmentTests.cs
│       ├── SubmissionTests.cs
│       ├── AuthorizationTests.cs
│       ├── ApiWorkflowTests.cs
│       └── TestHelpers.cs
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── login/page.tsx
│       │   ├── admin/           (dashboard, classes, subjects, users, class-subjects, assignments, submissions)
│       │   ├── teacher/         (dashboard, assignments CRUD, submissions grading)
│       │   └── student/         (dashboard, assignments view, assignment detail with submit, submissions list)
│       ├── components/
│       │   ├── AuthProvider.tsx
│       │   ├── ProtectedRoute.tsx
│       │   └── DashboardLayout.tsx
│       ├── lib/
│       │   ├── api.ts           (Axios instance with JWT interceptor + getErrorMessage helper)
│       │   ├── auth.ts          (Cookie-based token management)
│       │   └── types.ts         (TypeScript interfaces)
│       └── __tests__/           (Frontend tests)
├── database/
│   ├── migrations.sql           (EF Core migration SQL)
│   └── seed_data.sql            (Raw SQL seed data)
├── plan.md
├── .gitignore
└── README.md
```

## Prerequisites

- [.NET 10.0+ SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/)
- [PostgreSQL 15+](https://www.postgresql.org/download/)
- npm or yarn

## Setup Instructions

### 1. Backend Setup

```bash
# Navigate to backend project
cd backend/AssignmentManagement

# Restore packages
dotnet restore

# Update database (applies migrations)
dotnet ef database update

# Run the API
dotnet run

# The API will be available at http://localhost:5000 (or per launchSettings.json)
# Swagger UI at http://localhost:5000/swagger
```

### 2. Frontend Setup

```bash
# Navigate to frontend project
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# The app will be available at http://localhost:3000
```

### 3. Database Setup

The backend uses Entity Framework Core migrations. The database is automatically created and seeded on application startup. To manually set up the PostgreSQL database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE USER asm_user WITH PASSWORD 'asm_pass';
CREATE DATABASE assignment_mgmt OWNER asm_user;
GRANT ALL PRIVILEGES ON DATABASE assignment_mgmt TO asm_user;
\c assignment_mgmt
GRANT ALL ON SCHEMA public TO asm_user;
```

The connection string in `appsettings.json`:
```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=assignment_mgmt;Username=asm_user;Password=asm_pass"
}
```

### 4. Frontend Environment

Create `.env.local` in the `frontend/` directory (already provided as `.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Running Tests

### Backend Tests

```bash
cd backend

dotnet test
```

Tests cover:
- Authentication (login, register, invalid credentials)
- Assignment business rules (create, update, delete, draft/published status)
- Submission workflows (submit before/after deadline, late status, grading, duplicate prevention)
- Role-based access verification (controller attribute reflection)
- API workflow tests (ownership, enrollment, visibility, marks limits, admin CRUD conflicts)

### Frontend Tests

```bash
cd frontend

npm test
```

Tests cover:
- Login form rendering and validation
- ProtectedRoute role-based access
- Auth context behavior (login/logout/state restore)
- Auth helpers (role mapping, cookie persistence)
- DashboardLayout per-role navigation

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | admin123 |
| Teacher | teacher1@example.com | teacher123 |
| Student | student1@example.com | student123 |

Additional seeded users:
- teacher2@example.com / teacher123
- student2@example.com through student5@example.com / student123

## API Documentation

Once the backend is running, the interactive API documentation is available at:
- **Swagger UI**: `http://localhost:5000/swagger`
- **OpenAPI JSON**: `http://localhost:5000/swagger/v1/swagger.json`

### Key API Endpoints

**Authentication:**
- `POST /api/auth/login` — Authenticate with email/password, returns JWT token

**Admin:**
- `GET /api/admin/users` — List all users
- `POST /api/admin/users` — Create a new user
- `PUT /api/admin/users/{id}` — Update a user
- `DELETE /api/admin/users/{id}` — Delete a user
- `GET/POST/PUT/DELETE /api/admin/classes` — Manage classes
- `GET/POST/PUT/DELETE /api/admin/subjects` — Manage subjects
- `GET/POST/DELETE /api/admin/class-subjects` — Manage class-subject links
- `POST /api/admin/assign-teacher` — Assign a teacher to a class-subject
- `POST /api/admin/enroll-student` — Enroll a student in a class
- `GET /api/admin/assignments` — View all assignments
- `GET /api/admin/submissions` — View all submissions

**Teacher:**
- `GET /api/teacher/assignments` — List own assignments
- `POST /api/teacher/assignments` — Create assignment
- `GET/PUT/DELETE /api/teacher/assignments/{id}` — Manage assignment
- `GET /api/teacher/submissions` — View submissions for own assignments
- `PUT /api/teacher/submissions/{id}/grade` — Grade a submission
- `PUT /api/teacher/submissions/{id}/status` — Change submission status
- `GET /api/teacher/class-subjects` — List class-subjects assigned to the current teacher

**Student:**
- `GET /api/student/assignments` — View assignments for enrolled classes
- `GET /api/student/assignments/{id}` — View assignment details
- `POST /api/student/submissions` — Submit an assignment
- `PUT /api/student/submissions/{id}` — Update submission (before deadline)
- `GET /api/student/submissions` — View own submissions

## Business Rules

1. **Role-based access** — Backend API enforces role authorization via `[Authorize(Roles = "...")]` attributes. Frontend redirects users based on role.
2. **Assignment status** — Assignments can be Draft or Published. Only published assignments are visible to students.
3. **Deadline enforcement** — Submissions after the deadline are created with "Late" status. Students cannot edit submissions after the deadline.
4. **Submission uniqueness** — Each student can only submit once per assignment (unique constraint + controller check).
5. **Grading** — Teachers can only grade submissions for their own assignments. Marks cannot exceed max marks.
6. **Assignment ownership** — Teachers can only edit/delete their own assignments.
7. **Multi-class enrollment** — Students can enroll in multiple classes and see assignments from all enrolled classes.

## Environment Configuration

### Backend (`appsettings.json`)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=assignment_mgmt;Username=asm_user;Password=asm_pass"
  },
  "JwtSettings": {
    "SecretKey": "REPLACE_WITH_SECURE_KEY_AT_LEAST_32_CHARS",
    "ExpiryMinutes": 1440,
    "Issuer": "AssignmentManagementAPI",
    "Audience": "AssignmentManagementClient"
  }
}
```

### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Note:** No real passwords, API keys, or secrets are committed to the repository. All sensitive values should be set via environment variables.

## Assumptions

1. Single institution — no multi-tenancy beyond Admin/Teacher/Student roles.
2. Email is the unique login identifier.
3. Late submissions are allowed (flagged with "Late" status).
4. Teachers can be assigned to multiple class+subject combinations.
5. Students can enroll in multiple classes.
6. JWT tokens expire after 24 hours (1440 minutes).

## Known Limitations

1. No email notification system for assignment deadlines (planned for future enhancement).
2. No pagination on list endpoints — all records are returned at once (suitable for small-scale deployments).
3. No file upload for submissions — students submit text content only.
4. No admin UI for assigning teachers to class-subjects or enrolling students (these can be done via API or by seeding data).

## License

© OnnoRokom Projukti Limited
