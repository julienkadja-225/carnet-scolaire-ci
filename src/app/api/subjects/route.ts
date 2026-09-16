import { NextRequest, NextResponse } from "next/server";
import { subjectsRepo } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { subjectSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const trimesterParam = request.nextUrl.searchParams.get("trimester");
  const trimester = trimesterParam ? Number(trimesterParam) : undefined;

  const subjects = await subjectsRepo.listByUser(currentUser.id, trimester);

  return NextResponse.json({ subjects });
}

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (currentUser.status !== "APPROVED") {
    return NextResponse.json({ error: "Compte non validé" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });

  const parsed = subjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides" },
      { status: 400 }
    );
  }

  const existing = await subjectsRepo.findByUserTrimesterName(
    currentUser.id,
    parsed.data.trimester,
    parsed.data.name
  );
  if (existing) {
    return NextResponse.json(
      { error: "Cette matière existe déjà pour ce trimestre." },
      { status: 409 }
    );
  }

  const subject = await subjectsRepo.create({
    userId: currentUser.id,
    name: parsed.data.name,
    coefficient: parsed.data.coefficient,
    trimester: parsed.data.trimester,
  });

  return NextResponse.json({ subject });
}
