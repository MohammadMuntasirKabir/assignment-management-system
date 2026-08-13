CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

START TRANSACTION;
CREATE TABLE "Classes" (
    "Id" uuid NOT NULL,
    "Name" text NOT NULL,
    "Description" text NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    CONSTRAINT "PK_Classes" PRIMARY KEY ("Id")
);

CREATE TABLE "Subjects" (
    "Id" uuid NOT NULL,
    "Name" text NOT NULL,
    "Description" text NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    CONSTRAINT "PK_Subjects" PRIMARY KEY ("Id")
);

CREATE TABLE "Users" (
    "Id" uuid NOT NULL,
    "Name" text NOT NULL,
    "Email" text NOT NULL,
    "PasswordHash" text NOT NULL,
    "Role" text NOT NULL,
    "IsActive" boolean NOT NULL DEFAULT TRUE,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    CONSTRAINT "PK_Users" PRIMARY KEY ("Id")
);

CREATE TABLE "ClassSubjects" (
    "Id" uuid NOT NULL,
    "ClassId" uuid NOT NULL,
    "SubjectId" uuid NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_ClassSubjects" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_ClassSubjects_Classes_ClassId" FOREIGN KEY ("ClassId") REFERENCES "Classes" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_ClassSubjects_Subjects_SubjectId" FOREIGN KEY ("SubjectId") REFERENCES "Subjects" ("Id") ON DELETE CASCADE
);

CREATE TABLE "ClassStudents" (
    "Id" uuid NOT NULL,
    "ClassId" uuid NOT NULL,
    "StudentId" uuid NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_ClassStudents" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_ClassStudents_Classes_ClassId" FOREIGN KEY ("ClassId") REFERENCES "Classes" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_ClassStudents_Users_StudentId" FOREIGN KEY ("StudentId") REFERENCES "Users" ("Id") ON DELETE CASCADE
);

CREATE TABLE "Assignments" (
    "Id" uuid NOT NULL,
    "Title" text NOT NULL,
    "Description" text NOT NULL,
    "ClassSubjectId" uuid NOT NULL,
    "TeacherId" uuid NOT NULL,
    "Deadline" timestamp with time zone NOT NULL,
    "MaxMarks" numeric NOT NULL,
    "Status" text NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Assignments" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Assignments_ClassSubjects_ClassSubjectId" FOREIGN KEY ("ClassSubjectId") REFERENCES "ClassSubjects" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_Assignments_Users_TeacherId" FOREIGN KEY ("TeacherId") REFERENCES "Users" ("Id") ON DELETE CASCADE
);

CREATE TABLE "TeacherClassSubjects" (
    "Id" uuid NOT NULL,
    "TeacherId" uuid NOT NULL,
    "ClassSubjectId" uuid NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_TeacherClassSubjects" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_TeacherClassSubjects_ClassSubjects_ClassSubjectId" FOREIGN KEY ("ClassSubjectId") REFERENCES "ClassSubjects" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_TeacherClassSubjects_Users_TeacherId" FOREIGN KEY ("TeacherId") REFERENCES "Users" ("Id") ON DELETE CASCADE
);

CREATE TABLE "Submissions" (
    "Id" uuid NOT NULL,
    "AssignmentId" uuid NOT NULL,
    "StudentId" uuid NOT NULL,
    "Content" text NOT NULL,
    "Status" text NOT NULL,
    "Marks" numeric,
    "Feedback" text,
    "SubmittedAt" timestamp with time zone,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Submissions" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Submissions_Assignments_AssignmentId" FOREIGN KEY ("AssignmentId") REFERENCES "Assignments" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_Submissions_Users_StudentId" FOREIGN KEY ("StudentId") REFERENCES "Users" ("Id") ON DELETE CASCADE
);

CREATE INDEX "IX_Assignments_ClassSubjectId" ON "Assignments" ("ClassSubjectId");

CREATE INDEX "IX_Assignments_TeacherId" ON "Assignments" ("TeacherId");

CREATE UNIQUE INDEX "IX_ClassStudents_ClassId_StudentId" ON "ClassStudents" ("ClassId", "StudentId");

CREATE INDEX "IX_ClassStudents_StudentId" ON "ClassStudents" ("StudentId");

CREATE INDEX "IX_ClassSubjects_ClassId" ON "ClassSubjects" ("ClassId");

CREATE INDEX "IX_ClassSubjects_SubjectId" ON "ClassSubjects" ("SubjectId");

CREATE UNIQUE INDEX "IX_Submissions_AssignmentId_StudentId" ON "Submissions" ("AssignmentId", "StudentId");

CREATE INDEX "IX_Submissions_StudentId" ON "Submissions" ("StudentId");

CREATE INDEX "IX_TeacherClassSubjects_ClassSubjectId" ON "TeacherClassSubjects" ("ClassSubjectId");

CREATE UNIQUE INDEX "IX_TeacherClassSubjects_TeacherId_ClassSubjectId" ON "TeacherClassSubjects" ("TeacherId", "ClassSubjectId");

CREATE UNIQUE INDEX "IX_Users_Email" ON "Users" ("Email");

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260803150647_InitialCreate', '10.0.10');

COMMIT;

