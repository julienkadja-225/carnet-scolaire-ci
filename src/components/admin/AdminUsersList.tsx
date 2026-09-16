"use client";

import { useEffect, useMemo, useState } from "react";
import type { AdminUserDTO } from "@/lib/admin-types";
import { getClassLabel } from "@/lib/education";
import { useUI } from "@/components/ui/UIProvider";

const STATUS_LABELS: Record<AdminUserDTO["status"], string> = {
  PENDING: "En attente",
  APPROVED: "Validé",
  REJECTED: "Rejeté",
};

const STATUS_COLORS: Record<AdminUserDTO["status"], string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
};

const ROLE_LABELS: Record<AdminUserDTO["role"], string> = {
  STUDENT: "Élève",
  ADMIN: "Administrateur",
  SUPERADMIN: "Super administrateur",
};

export default function AdminUsersList({ canManageRoles }: { canManageRoles: boolean }) {
  const { toast, confirm } = useUI();
  const [users, setUsers] = useState<AdminUserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | AdminUserDTO["status"]>("ALL");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [tempPasswordInfo, setTempPasswordInfo] = useState<{ name: string; password: string } | null>(
    null
  );

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data.users ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/users");
        const data = await res.json();
        if (!ignore) setUsers(data.users ?? []);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  async function handleRoleChange(id: string, role: "ADMIN" | "STUDENT") {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setRole", role }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "Erreur", "error");
        return;
      }
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function handleResetPassword(user: AdminUserDTO) {
    const ok = await confirm(`Générer un nouveau mot de passe temporaire pour ${user.fullName} ?`, {
      title: "Réinitialiser le mot de passe",
      confirmLabel: "Générer",
    });
    if (!ok) return;
    setBusyId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/reset-password`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "Erreur", "error");
        return;
      }
      setTempPasswordInfo({ name: user.fullName, password: data.temporaryPassword });
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(user: AdminUserDTO) {
    const ok = await confirm(`Supprimer définitivement le compte de ${user.fullName} ?`, {
      title: "Supprimer le compte",
      confirmLabel: "Supprimer",
      danger: true,
    });
    if (!ok) return;
    setBusyId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "Erreur", "error");
        return;
      }
      toast("Compte supprimé", "success");
      await load();
    } finally {
      setBusyId(null);
    }
  }

  const filtered = useMemo(() => {
    const byStatus = filter === "ALL" ? users : users.filter((u) => u.status === filter);
    const q = search.trim().toLowerCase();
    if (!q) return byStatus;
    return byStatus.filter(
      (u) => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [users, filter, search]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-brand-dark">Utilisateurs</h1>
      <p className="mt-1 text-sm text-foreground/65">
        Vue d&apos;ensemble des comptes élèves et administrateurs.
      </p>

      {tempPasswordInfo && (
        <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p>
            Nouveau mot de passe temporaire pour <strong>{tempPasswordInfo.name}</strong> :{" "}
            <code className="rounded bg-white px-2 py-0.5 font-mono">{tempPasswordInfo.password}</code>
          </p>
          <p className="mt-1 text-xs">
            Communique-le en toute sécurité — il ne sera plus affiché après avoir quitté cette page.
          </p>
          <button
            onClick={() => setTempPasswordInfo(null)}
            className="mt-2 text-xs font-medium underline"
          >
            Fermer
          </button>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex gap-2 text-sm">
          {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 font-medium ${
                filter === f ? "bg-brand text-white" : "border border-border hover:bg-black/5"
              }`}
            >
              {f === "ALL" ? "Tous" : STATUS_LABELS[f]}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou email..."
          className="ml-auto w-full max-w-xs rounded-md border border-border px-3 py-1.5 text-sm focus:border-brand focus:outline-none"
        />
      </div>

      {loading ? (
        <p className="mt-10 text-sm text-foreground/50">Chargement...</p>
      ) : filtered.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-border bg-surface p-8 text-center text-sm text-foreground/65">
          Aucun utilisateur ne correspond à cette recherche.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-foreground/50">
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Classe</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Rôle</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{u.fullName}</p>
                    <p className="text-xs text-foreground/50">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {getClassLabel(u.classLevel)}
                    {u.series ? ` · ${u.series}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${STATUS_COLORS[u.status]}`}>
                      {STATUS_LABELS[u.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">{ROLE_LABELS[u.role]}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {u.role !== "SUPERADMIN" && canManageRoles && (
                        <button
                          onClick={() =>
                            handleRoleChange(u.id, u.role === "STUDENT" ? "ADMIN" : "STUDENT")
                          }
                          disabled={busyId === u.id}
                          className="rounded-md border border-border px-2 py-1 text-xs font-medium hover:bg-black/5 disabled:opacity-50"
                        >
                          {u.role === "STUDENT" ? "Promouvoir admin" : "Rétrograder élève"}
                        </button>
                      )}
                      {u.role !== "SUPERADMIN" && u.status === "APPROVED" && (
                        <button
                          onClick={() => handleResetPassword(u)}
                          disabled={busyId === u.id}
                          className="rounded-md border border-border px-2 py-1 text-xs font-medium hover:bg-black/5 disabled:opacity-50"
                        >
                          Réinitialiser mot de passe
                        </button>
                      )}
                      {u.status === "REJECTED" && (
                        <button
                          onClick={() => handleDelete(u)}
                          disabled={busyId === u.id}
                          className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          Supprimer
                        </button>
                      )}
                      {u.role === "SUPERADMIN" && (
                        <span className="text-xs text-foreground/40">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
