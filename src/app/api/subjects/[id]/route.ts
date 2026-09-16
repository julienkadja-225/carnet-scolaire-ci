import { NextRequest, NextResponse } from "next/server";
import { subjectsRepo } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  const subject = await subjectsRepo.findById(id);
  if (!subject || subject.userId !== currentUser.id) {
    return NextResponse.json({ error: "Matière introuvable" }, { status: 404 });
  }

  await subjectsRepo.delete(id);
  return NextResponse.json({ message: "Matière supprimée" });
}
