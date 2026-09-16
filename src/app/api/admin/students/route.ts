import { NextResponse } from "next/server";
import { usersRepo } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const allUsers = await usersRepo.listAll();
  const students = allUsers
    .filter((u) => u.role === "STUDENT")
    .map((u) => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      status: u.status,
      classLevel: u.classLevel,
      series: u.series,
      school: u.school,
    }));

  return NextResponse.json({ students });
}
