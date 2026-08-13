# Assignment & Submission Management System — Frontend

The Next.js (App Router) frontend for the role-based **Assignment & Submission Management System**. It provides separate interfaces for **Admin**, **Teacher**, and **Student** roles, backed by the ASP.NET Core Web API in `../backend`.

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS
- react-hook-form + Zod (form validation)
- Axios (API client with JWT interceptor)
- Jest + React Testing Library (tests)

## Getting Started

```bash
npm install

# Start the development server
npm run dev
# App runs at http://localhost:3000
```

## Environment

Create `.env.local` (see `.env.example`):

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

The backend must be running first — see the root `../README.md` for backend and database setup.

## Running Tests

```bash
npm test
```

## Project Layout

```
src/
├── app/
│   ├── login/          # Sign in (Zod + react-hook-form validation)
│   ├── register/       # Student registration (Zod + react-hook-form)
│   ├── admin/          # Users, classes, subjects, class-subjects, assignments, submissions
│   ├── teacher/        # Assignments CRUD, submissions grading
│   ├── student/        # Assignments view/submit, submissions list
│   └── globals.css     # Design tokens and shared styles
├── components/         # AuthProvider, ProtectedRoute, DashboardLayout
└── lib/                # api.ts (axios), auth.ts (cookies), types.ts
```

Each page directory contains a `__tests__` folder with its component tests.
