import { NextRequest, NextResponse } from "next/server";
import { usersRepo, subjectsRepo, conductRepo } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { DEFAULT_CONDUCT } from "@/lib/education";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const currentUser = await getCurrentUser();
  if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = await params;
  const student = await usersRepo.findById(id);
  if (!student || student.role !== "STUDENT") {
    return NextResponse.json({ error: "Élève introuvable" }, { status: 404 });
  }

  const trimesters = await Promise.all(
    [1, 2, 3].map(async (trimester) => {
      const [subjects, conduct] = await Promise.all([
        subjectsRepo.listByUser(id, trimester),
        conductRepo.find(id, trimester),
      ]);
      return {
        trimester,
        subjects,
        conduct: conduct ?? { trimester, value: DEFAULT_CONDUCT, userId: id },
      };
    })
  );

  return NextResponse.json({
    student: {
      id: student.id,
      fullName: student.fullName,
      email: student.email,
      classLevel: student.classLevel,
      series: student.series,
      school: student.school,
    },
    trimesters,
  });
}
