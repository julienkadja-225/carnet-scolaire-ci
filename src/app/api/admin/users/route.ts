import { NextRequest, NextResponse } from "next/server";
import { usersRepo } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { AccountStatus } from "@/lib/db-types";

export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const status = request.nextUrl.searchParams.get("status") as AccountStatus | null;

  const allUsers = await usersRepo.listAll(status ?? undefined);
  const users = allUsers.map((u) => ({
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    role: u.role,
    status: u.status,
    classLevel: u.classLevel,
    series: u.series,
    school: u.school,
    createdAt: u.createdAt,
    approvedAt: u.approvedAt,
  }));

  return NextResponse.json({ users });
}
