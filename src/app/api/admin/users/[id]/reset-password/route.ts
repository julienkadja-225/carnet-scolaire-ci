import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { usersRepo, passwordResetRepo } from "@/lib/db";
import { getCurrentUser, hashPassword } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

function generateTemporaryPassword(): string {
  // Lisible et facile à communiquer à l'oral : 8 caractères alphanumériques.
  return randomBytes(6).toString("base64url").slice(0, 8);
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  const currentUser = await getCurrentUser();
  if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = await params;
  const targetUser = await usersRepo.findById(id);
  if (!targetUser) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);
  await usersRepo.updatePassword(id, passwordHash);
  await passwordResetRepo.invalidateAllForUser(id);

  return NextResponse.json({
    message: "Mot de passe temporaire généré. Communique-le à l'utilisateur en toute sécurité.",
    temporaryPassword,
  });
}
