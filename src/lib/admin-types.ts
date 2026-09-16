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
