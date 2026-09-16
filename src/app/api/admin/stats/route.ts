import { NextResponse } from "next/server";
import { statsRepo } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const [totals, usersByRoleAndStatus, studentsByClassLevel, registrationsByMonth, averageBySubject] =
    await Promise.all([
      statsRepo.totals(),
      statsRepo.usersByRoleAndStatus(),
      statsRepo.studentsByClassLevel(),
      statsRepo.registrationsByMonth(6),
      statsRepo.averageBySubjectName(8),
    ]);

  const pendingCount =
    usersByRoleAndStatus.find((r) => r.status === "PENDING")?.count ?? 0;
  const approvedCount = usersByRoleAndStatus
    .filter((r) => r.status === "APPROVED")
    .reduce((sum, r) => sum + r.count, 0);
  const rejectedCount =
    usersByRoleAndStatus.find((r) => r.status === "REJECTED")?.count ?? 0;

  return NextResponse.json({
    totals,
    statusBreakdown: { pending: pendingCount, approved: approvedCount, rejected: rejectedCount },
    studentsByClassLevel,
    registrationsByMonth,
    averageBySubject,
  });
}
