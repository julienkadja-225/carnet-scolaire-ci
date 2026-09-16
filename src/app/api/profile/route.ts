import { NextRequest, NextResponse } from "next/server";
import { usersRepo } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { profileSchema } from "@/lib/validation";

export async function PATCH(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });

  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides" },
      { status: 400 }
    );
  }

  const updated = await usersRepo.updateProfile(currentUser.id, {
    fullName: parsed.data.fullName,
    classLevel: parsed.data.classLevel || null,
    series: parsed.data.series || null,
    school: parsed.data.school || null,
  });

  return NextResponse.json({
    message: "Profil mis à jour",
    user: {
      id: updated.id,
      fullName: updated.fullName,
      email: updated.email,
      role: updated.role,
      classLevel: updated.classLevel,
      series: updated.series,
      school: updated.school,
    },
  });
}
