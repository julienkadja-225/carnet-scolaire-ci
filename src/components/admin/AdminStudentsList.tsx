"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminStudentDTO } from "@/lib/admin-types";
import { getClassLabel } from "@/lib/education";

const STATUS_LABELS: Record<AdminStudentDTO["status"], string> = {
  PENDING: "En attente",
  APPROVED: "Validé",
  REJECTED: "Rejeté",
};

const STATUS_COLORS: Record<AdminStudentDTO["status"], string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function AdminStudentsList() {
  const router = useRouter();
  const [students, setStudents] = useState<AdminStudentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/students");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Erreur de chargement");
        if (!ignore) setStudents(data.students);
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.classLevel ?? "").toLowerCase().includes(q)
    );
  }, [students, search]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-brand-dark">Élèves</h1>
      <p className="mt-1 text-sm text-foreground/65">
        Consulte le bulletin de chaque élève, par trimestre et sur l&apos;année.
      </p>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher par nom, email ou classe..."
        className="mt-6 w-full max-w-sm rounded-md border border-border px-3 py-1.5 text-sm focus:border-brand focus:outline-none"
      />

      {error && (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-10 text-sm text-foreground/50">Chargement...</p>
      ) : filtered.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-border bg-surface p-8 text-center text-sm text-foreground/65">
          Aucun élève ne correspond à cette recherche.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-foreground/50">
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Classe</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => router.push(`/admin/eleves/${s.id}`)}
                  className="cursor-pointer border-b border-border last:border-0 hover:bg-brand/5"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium">{s.fullName}</p>
                    <p className="text-xs text-foreground/50">{s.email}</p>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {getClassLabel(s.classLevel)}
                    {s.series ? ` · ${s.series}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${STATUS_COLORS[s.status]}`}>
                      {STATUS_LABELS[s.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs font-medium text-brand">
                    Voir le bulletin →
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
