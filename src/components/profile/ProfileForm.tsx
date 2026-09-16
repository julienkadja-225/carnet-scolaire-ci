"use client";

import { useState } from "react";
import { CLASS_LEVELS, SERIES_BY_LEVEL } from "@/lib/education";

export interface ProfileUser {
  fullName: string;
  email: string;
  role: "STUDENT" | "ADMIN" | "SUPERADMIN";
  classLevel: string | null;
  series: string | null;
  school: string | null;
}

const ROLE_LABELS: Record<ProfileUser["role"], string> = {
  STUDENT: "Élève",
  ADMIN: "Administrateur",
  SUPERADMIN: "Super administrateur",
};

export default function ProfileForm({ user }: { user: ProfileUser }) {
  const [fullName, setFullName] = useState(user.fullName);
  const [classLevel, setClassLevel] = useState(user.classLevel ?? "");
  const [series, setSeries] = useState(user.series ?? "");
  const [school, setSchool] = useState(user.school ?? "");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isStudent = user.role === "STUDENT";
  const availableSeries = SERIES_BY_LEVEL[classLevel] ?? [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          classLevel: isStudent ? classLevel || undefined : undefined,
          series: isStudent ? series || undefined : undefined,
          school: isStudent ? school || undefined : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue.");
        return;
      }
      setSuccess("Profil mis à jour avec succès.");
    } catch {
      setError("Impossible de contacter le serveur. Réessaie plus tard.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium">Adresse email</label>
        <input
          disabled
          value={user.email}
          className="w-full rounded-md border border-border bg-black/5 px-3 py-2 text-sm text-foreground/60"
        />
        <p className="mt-1 text-xs text-foreground/45">L&apos;email ne peut pas être modifié.</p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Rôle</label>
        <input
          disabled
          value={ROLE_LABELS[user.role]}
          className="w-full rounded-md border border-border bg-black/5 px-3 py-2 text-sm text-foreground/60"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Nom complet</label>
        <input
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
      </div>

      {isStudent && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Classe</label>
              <select
                value={classLevel}
                onChange={(e) => {
                  setClassLevel(e.target.value);
                  setSeries("");
                }}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-brand focus:outline-none"
              >
                <option value="">Non renseignée</option>
                {CLASS_LEVELS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            {availableSeries.length > 0 && (
              <div>
                <label className="mb-1 block text-sm font-medium">Série</label>
                <select
                  value={series}
                  onChange={(e) => setSeries(e.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-brand focus:outline-none"
                >
                  <option value="">Sélectionner...</option>
                  {availableSeries.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Établissement</label>
            <input
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-brand focus:outline-none"
              placeholder="Ex : Lycée Moderne de Cocody"
            />
          </div>
        </>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
      >
        {loading ? "Enregistrement..." : "Enregistrer les modifications"}
      </button>
    </form>
  );
}
