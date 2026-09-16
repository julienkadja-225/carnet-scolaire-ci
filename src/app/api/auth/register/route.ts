import { NextRequest, NextResponse } from "next/server";
import { usersRepo } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides" },
      { status: 400 }
    );
  }

  const { fullName, email, password, classLevel, series, school } = parsed.data;

  const existing = await usersRepo.findByEmail(email);
  if (existing) {
    return NextResponse.json(
      { error: "Un compte existe déjà avec cet email." },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);

  await usersRepo.create({
    fullName,
    email,
    passwordHash,
    classLevel,
    series: series || null,
    school: school || null,
    role: "STUDENT",
    status: "PENDING",
  });

  return NextResponse.json({
    message:
      "Ta demande de création de compte a bien été envoyée. Un administrateur doit la valider avant que tu puisses te connecter.",
  });
}
