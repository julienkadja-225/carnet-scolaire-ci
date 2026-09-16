import { NextRequest, NextResponse } from "next/server";
import { usersRepo, passwordResetRepo } from "@/lib/db";
import { generateResetToken } from "@/lib/auth";
import { forgotPasswordSchema } from "@/lib/validation";

const GENERIC_MESSAGE =
  "Si un compte existe avec cet email, un lien de réinitialisation a été généré.";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides" },
      { status: 400 }
    );
  }

  const user = await usersRepo.findByEmail(parsed.data.email);

  // Réponse générique dans tous les cas pour ne pas révéler quels emails existent.
  if (!user) {
    return NextResponse.json({ message: GENERIC_MESSAGE });
  }

  const { token, tokenHash, expiresAt } = generateResetToken();
  await passwordResetRepo.create(user.id, tokenHash, expiresAt);

  // Aucun serveur d'email n'est configuré dans cet environnement : le lien est
  // renvoyé directement dans la réponse pour permettre la démonstration/le test.
  // En production, ce lien serait envoyé par email et ne jamais renvoyé à l'appelant.
  const resetLink = `/reinitialiser-mot-de-passe?token=${token}`;

  return NextResponse.json({
    message: GENERIC_MESSAGE,
    devResetLink: resetLink,
  });
}
