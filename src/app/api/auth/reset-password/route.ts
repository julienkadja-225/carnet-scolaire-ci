import { NextRequest, NextResponse } from "next/server";
import { usersRepo, passwordResetRepo } from "@/lib/db";
import { hashPassword, hashResetToken } from "@/lib/auth";
import { resetPasswordSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });

  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides" },
      { status: 400 }
    );
  }

  const tokenHash = hashResetToken(parsed.data.token);
  const resetToken = await passwordResetRepo.findValidByTokenHash(tokenHash);
  if (!resetToken) {
    return NextResponse.json(
      { error: "Ce lien de réinitialisation est invalide ou a expiré." },
      { status: 400 }
    );
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await usersRepo.updatePassword(resetToken.userId, passwordHash);
  await passwordResetRepo.markUsed(resetToken.id);
  await passwordResetRepo.invalidateAllForUser(resetToken.userId);

  return NextResponse.json({ message: "Mot de passe réinitialisé avec succès." });
}
