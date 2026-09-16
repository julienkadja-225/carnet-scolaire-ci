"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTrimesterData } from "./useTrimesterData";
import TrimesterTabs from "./TrimesterTabs";
import AnnualSummary from "./AnnualSummary";
import {
  academicAverage,
  generalAverageWithConduct,
  summarizeSubjects,
  buildSuggestions,
} from "@/lib/grades";
import { getMention, DEFAULT_CONDUCT } from "@/lib/education";

export default function DashboardOverview({ fullName }: { fullName: string }) {
  const [trimester, setTrimester] = useState(1);
  const { subjects, conduct, loading, error } = useTrimesterData(trimester);

  const summaries = useMemo(() => summarizeSubjects(subjects), [subjects]);
  const academic = useMemo(() => academicAverage(summaries), [summaries]);
  const conductValue = conduct?.value ?? DEFAULT_CONDUCT;
  const withConduct = generalAverageWithConduct(summaries, conductValue);
  const mention = academic !== null ? getMention(academic) : null;
  const suggestions = useMemo(() => buildSuggestions(summaries, academic), [summaries, academic]);

  const gradedCount = summaries.filter((s) => s.average !== null).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Bonjour {fullName.split(" ")[0]} 👋</h1>
          <p className="mt-1 text-sm text-foreground/65">Voici un aperçu de ta scolarité.</p>
        </div>
        <TrimesterTabs value={trimester} onChange={setTrimester} />
      </div>

      <AnnualSummary />

      {error && (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-10 text-sm text-foreground/50">Chargement...</p>
      ) : subjects.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-border bg-surface p-8 text-center">
          <p className="text-sm text-foreground/65">
            Tu n&apos;as pas encore ajouté de matière pour ce trimestre.
          </p>
          <Link
            href="/dashboard/matieres"
            className="mt-4 inline-block rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Ajouter mes matières
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Moyenne générale"
              value={academic !== null ? academic.toFixed(2) : "—"}
              suffix="/20"
              highlight
            />
            <StatCard
              label="Moyenne (avec conduite)"
              value={withConduct !== null ? withConduct.toFixed(2) : "—"}
              suffix="/20"
            />
            <StatCard label="Conduite" value={conductValue.toFixed(1)} suffix="/20" />
            <StatCard label="Matières notées" value={String(gradedCount)} suffix={`/ ${subjects.length}`} />
          </div>

          {mention && (
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-border bg-surface p-5">
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${mention.color}`}>
                {mention.label}
              </span>
              <p className="text-sm text-foreground/65">
                Appréciation basée sur ta moyenne générale académique de ce trimestre.
              </p>
            </div>
          )}

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface p-5">
              <h2 className="font-semibold text-foreground">Détail par matière</h2>
              <div className="mt-4 space-y-2">
                {summaries.map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium">{s.name}</span>
                      <span className="ml-2 text-xs text-foreground/50">coef. {s.coefficient}</span>
                    </div>
                    <span className="font-semibold">
                      {s.average !== null ? `${s.average.toFixed(2)} /20` : "Pas de note"}
                    </span>
                  </div>
                ))}
              </div>
              <Link
                href="/dashboard/matieres"
                className="mt-4 inline-block text-sm font-medium text-brand underline"
              >
                Gérer mes matières et mes notes →
              </Link>
            </div>

            <div className="rounded-xl border border-border bg-surface p-5">
              <h2 className="font-semibold text-foreground">Conseils rapides</h2>
              {suggestions.length === 0 ? (
                <p className="mt-3 text-sm text-foreground/65">
                  Bravo, toutes tes matières notées sont au-dessus de 12/20 🎉
                </p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {suggestions.slice(0, 3).map((s) => (
                    <li key={s.subjectId} className="text-sm">
                      <span
                        className={`mr-2 rounded-full px-2 py-0.5 text-xs font-semibold ${
                          s.priority === "critique"
                            ? "bg-red-100 text-red-700"
                            : s.priority === "important"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {s.priority}
                      </span>
                      {s.subjectName} — {s.currentAverage.toFixed(1)}/20
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href="/dashboard/suggestions"
                className="mt-4 inline-block text-sm font-medium text-brand underline"
              >
                Voir tous les conseils détaillés →
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  suffix,
  highlight,
}: {
  label: string;
  value: string;
  suffix: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        highlight ? "border-brand bg-brand/5" : "border-border bg-surface"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-foreground/50">{label}</p>
      <p className="mt-2 text-2xl font-bold text-brand-dark">
        {value}
        <span className="ml-1 text-sm font-medium text-foreground/50">{suffix}</span>
      </p>
    </div>
  );
}
