"use client";

import { useEffect, useState } from "react";
import type { AdminUserDTO } from "@/lib/admin-types";
import { getClassLabel } from "@/lib/education";
import { useUI } from "@/components/ui/UIProvider";

export default function AdminRequests() {
  const { toast } = useUI();
  const [users, setUsers] = useState<AdminUserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/users?status=PENDING");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Erreur de chargement");
        if (!ignore) setUsers(data.users);
      } catch (e) {
        if (!ignore) setError(e instanceof Error ? e.message : "Erreur inconnue");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  async function handleAction(id: string, action: "approve" | "reject") {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast(data.error ?? "Erreur", "error");
        return;
      }
      toast(action === "approve" ? "Compte validé" : "Compte rejeté", "success");
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-brand-dark">Demandes de création de compte</h1>
      <p className="mt-1 text-sm text-foreground/65">
        Valide ou rejette les demandes d&apos;inscription des élèves.
      </p>

      {error && (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-10 text-sm text-foreground/50">Chargement...</p>
      ) : users.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-border bg-surface p-8 text-center text-sm text-foreground/65">
          Aucune demande en attente pour le moment.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4"
            >
              <div>
                <p className="font-semibold text-foreground">{u.fullName}</p>
                <p className="text-sm text-foreground/60">{u.email}</p>
                <p className="mt-1 text-xs text-foreground/50">
                  {getClassLabel(u.classLevel)}
                  {u.series ? ` · ${u.series}` : ""}
                  {u.school ? ` · ${u.school}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAction(u.id, "approve")}
                  disabled={busyId === u.id}
                  className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  Valider
                </button>
                <button
                  onClick={() => handleAction(u.id, "reject")}
                  disabled={busyId === u.id}
                  className="rounded-md border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  Rejeter
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
