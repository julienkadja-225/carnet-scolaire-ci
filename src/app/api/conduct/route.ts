import { NextRequest, NextResponse } from "next/server";
import { conductRepo } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { conductSchema } from "@/lib/validation";
import { DEFAULT_CONDUCT } from "@/lib/education";

export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const trimesterParam = request.nextUrl.searchParams.get("trimester");
  const trimester = trimesterParam ? Number(trimesterParam) : 1;

  const conduct = await conductRepo.find(currentUser.id, trimester);

  return NextResponse.json({
    conduct: conduct ?? { trimester, value: DEFAULT_CONDUCT, userId: currentUser.id },
  });
}

export async function PUT(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });

  const parsed = conductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides" },
      { status: 400 }
    );
  }

  const conduct = await conductRepo.upsert(currentUser.id, parsed.data.trimester, parsed.data.value);

  return NextResponse.json({ conduct });
}
