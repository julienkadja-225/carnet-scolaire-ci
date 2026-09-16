export type Role = "STUDENT" | "ADMIN" | "SUPERADMIN";
export type AccountStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface UserRow {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: Role;
  status: AccountStatus;
  classLevel: string | null;
  series: string | null;
  school: string | null;
  createdAt: string;
  approvedAt: string | null;
  approvedById: string | null;
  rejectedReason: string | null;
}

export interface SubjectRow {
  id: string;
  userId: string;
  name: string;
  coefficient: number;
  trimester: number;
  createdAt: string;
}

export interface GradeRow {
  id: string;
  subjectId: string;
  label: string;
  value: number;
  scale: number;
  createdAt: string;
}

export interface ConductRow {
  id: string;
  userId: string;
  trimester: number;
  value: number;
  updatedAt: string;
}

export interface SubjectWithGrades extends SubjectRow {
  grades: GradeRow[];
}

export interface GradeWithSubject extends GradeRow {
  subject: SubjectRow;
}

export interface PasswordResetRow {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
}
