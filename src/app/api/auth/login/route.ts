import { NextRequest, NextResponse } from "next/server";
import { usersRepo } from "@/lib/db";
import { verifyPassword, setSessionCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides" },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;

  const user = await usersRepo.findByEmail(email);
  if (!user) {
    return NextResponse.json({ error: "Email ou mot de passe incorrect." }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Email ou mot de passe incorrect." }, { status: 401 });
  }

  if (user.status === "PENDING") {
    return NextResponse.json(
      { error: "Ton compte est en attente de validation par un administrateur." },
      { status: 403 }
    );
  }

  if (user.status === "REJECTED") {
    return NextResponse.json(
      { error: "Ta demande de compte a été rejetée. Contacte un administrateur." },
      { status: 403 }
    );
  }

  await setSessionCookie({ userId: user.id, role: user.role, status: user.status });

  const redirectTo = user.role === "STUDENT" ? "/dashboard" : "/admin";

  return NextResponse.json({
    message: "Connexion réussie",
    redirectTo,
    role: user.role,
  });
}
