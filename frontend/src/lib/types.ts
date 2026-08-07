export type UserRole = "Admin" | "Teacher" | "Student";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthResponse {
  userId: string;
  name: string;
  email: string;
  role: number;
  token: string;
  expiresAt: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface Class {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface Subject {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface ClassSubjectDto {
  id: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  classSubjectId: string;
  className: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  deadline: string;
  maxMarks: number;
  status: "Draft" | "Published";
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssignmentDto {
  title: string;
  description: string;
  classSubjectId: string;
  teacherId: string;
  deadline: string;
  maxMarks: number;
  status: "Draft" | "Published";
}

export interface UpdateAssignmentDto {
  title: string;
  description: string;
  classSubjectId: string;
  deadline: string;
  maxMarks: number;
  status: "Draft" | "Published";
}

export type SubmissionStatus = "Draft" | "Submitted" | "Late" | "Reviewed";

export interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  content: string;
  status: SubmissionStatus;
  marks: number | null;
  feedback: string | null;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GradeSubmissionDto {
  marks: number;
  feedback: string;
  status: SubmissionStatus;
}

export interface CreateSubmissionDto {
  assignmentId: string;
  studentId: string;
  content: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role: number;
}

export interface AssignTeacherDto {
  teacherId: string;
  classSubjectId: string;
}

export interface EnrollStudentDto {
  studentId: string;
  classId: string;
}

export interface CreateClassDto {
  name: string;
  description: string;
}

export interface UpdateClassDto {
  name: string;
  description: string;
}

export interface CreateSubjectDto {
  name: string;
  description: string;
}

export interface UpdateSubjectDto {
  name: string;
  description: string;
}
