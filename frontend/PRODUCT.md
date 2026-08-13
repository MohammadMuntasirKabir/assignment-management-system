# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Students** — enrolled in classes; view published assignments, submit work before deadlines, see marks and feedback.
- **Teachers** — create and manage assignments for their class-subjects, grade submissions with marks and feedback.
- **Admins** — manage users (including changing roles), classes, subjects, class-subject links, teacher assignments, student enrollments; view all assignments and submissions.

## Product Purpose

A role-based web application for schools and colleges to manage assignments, submissions, and grading. Success means teachers and students can run an entire assignment cycle — create, publish, submit, grade, receive feedback — in one reliable, clearly role-scoped place.

## Positioning

A single-institution assignment workflow where every capability is scoped by role (Admin / Teacher / Student) and business rules are enforced by the system: draft vs. published assignments, deadline enforcement with late flags, one submission per assignment, and marks that never exceed the maximum.

## Operating Context

- Used daily by teachers and students on desktop and mobile browsers.
- JWT-based authentication; roles are fixed by the backend (self-registration always yields Student; Admins change roles).
- Assignments carry a deadline; submissions are text content (no file upload).
- Business rules: published-only visibility, deadline enforcement, duplicate-submission prevention, ownership checks for edits/grading.

## Capabilities and Constraints

- Authentication: login, public self-registration (defaults to Student, immediately usable), JWT with 24h expiry.
- Admin: full user CRUD including role changes; classes, subjects, class-subject links, teacher assignment, student enrollment; global views of assignments and submissions.
- Teacher: assignment CRUD on own class-subjects; grade own submissions.
- Student: view published assignments for enrolled classes, submit, update before deadline, view marks/feedback.
- No email notifications, no file uploads, no pagination on list endpoints. Single institution (no multi-tenancy).

## Brand Commitments

- Product name: Assignment Management System (readme reference "ASM"). No other visual brand commitments established.

## Evidence on Hand

- Seeded demo data (classes, subjects, assignments, submissions, users) from the backend seeder. Real seeded submissions exist for Algebra Problem Set 1 and English Essay Draft.

## Product Principles

1. Every capability is scoped and enforced by role — the backend is the source of truth, never the UI.
2. Trust through clarity: states (draft/published, submitted/late/reviewed), deadlines, and grades are always visible and legible.
3. Security first: self-registration can never escalate privileges; passwords are never stored or returned in plaintext.
4. The assignment cycle is short and obvious: publish → submit → grade → feedback.

## Accessibility & Inclusion

- The interface must be usable in dark or bright environments; focus states, contrast, and keyboard operation must hold for teachers and students of all ages.
