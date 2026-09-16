import { NextRequest, NextResponse } from "next/server";
import { usersRepo } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const currentUser = await getCurrentUser();
  if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body.action !== "string") {
    return NextResponse.json({ error: "Action manquante" }, { status: 400 });
  }

  const targetUser = await usersRepo.findById(id);
  if (!targetUser) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  if (body.action === "approve") {
    const updated = await usersRepo.approve(id, currentUser.id);
    return NextResponse.json({ message: "Compte validé", user: updated });
  }

  if (body.action === "reject") {
    const updated = await usersRepo.reject(id, typeof body.reason === "string" ? body.reason : null);
    return NextResponse.json({ message: "Compte rejeté", user: updated });
  }

  if (body.action === "setRole") {
    if (currentUser.role !== "SUPERADMIN") {
      return NextResponse.json(
        { error: "Seul un super administrateur peut changer les rôles." },
        { status: 403 }
      );
    }
    if (body.role !== "ADMIN" && body.role !== "STUDENT") {
      return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
    }
    if (targetUser.role === "SUPERADMIN") {
      return NextResponse.json(
        { error: "Impossible de modifier le rôle d'un super administrateur." },
        { status: 400 }
      );
    }
    const updated = await usersRepo.setRole(id, body.role);
    return NextResponse.json({ message: "Rôle mis à jour", user: updated });
  }

  return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const currentUser = await getCurrentUser();
  if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = await params;
  const targetUser = await usersRepo.findById(id);
  if (!targetUser) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }
  if (targetUser.status !== "REJECTED") {
    return NextResponse.json(
      { error: "Seuls les comptes rejetés peuvent être supprimés définitivement." },
      { status: 400 }
    );
  }

  await usersRepo.delete(id);
  return NextResponse.json({ message: "Compte supprimé" });
}
