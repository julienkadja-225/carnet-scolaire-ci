import { NextRequest, NextResponse } from "next/server";
import { gradesRepo, subjectsRepo } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { gradeSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });

  const parsed = gradeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides" },
      { status: 400 }
    );
  }

  const subject = await subjectsRepo.findById(parsed.data.subjectId);
  if (!subject || subject.userId !== currentUser.id) {
    return NextResponse.json({ error: "Matière introuvable" }, { status: 404 });
  }

  const grade = await gradesRepo.create({
    subjectId: parsed.data.subjectId,
    label: parsed.data.label,
    value: parsed.data.value,
    scale: parsed.data.scale,
  });

  return NextResponse.json({ grade });
}
