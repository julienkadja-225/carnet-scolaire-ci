import { NextRequest, NextResponse } from "next/server";
import { gradesRepo } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  const grade = await gradesRepo.findByIdWithSubject(id);
  if (!grade || grade.subject.userId !== currentUser.id) {
    return NextResponse.json({ error: "Note introuvable" }, { status: 404 });
  }

  await gradesRepo.delete(id);
  return NextResponse.json({ message: "Note supprimée" });
}
