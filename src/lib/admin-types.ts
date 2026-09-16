export interface AdminUserDTO {
  id: string;
  fullName: string;
  email: string;
  role: "STUDENT" | "ADMIN" | "SUPERADMIN";
  status: "PENDING" | "APPROVED" | "REJECTED";
  classLevel: string | null;
  series: string | null;
  school: string | null;
  createdAt: string;
  approvedAt: string | null;
}

export interface AdminStudentDTO {
  id: string;
  fullName: string;
  email: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  classLevel: string | null;
  series: string | null;
  school: string | null;
}

export interface StudentReportDTO {
  student: {
    id: string;
    fullName: string;
    email: string;
    classLevel: string | null;
    series: string | null;
    school: string | null;
  };
  trimesters: {
    trimester: number;
    subjects: import("./types").SubjectDTO[];
    conduct: import("./types").ConductDTO;
  }[];
}
