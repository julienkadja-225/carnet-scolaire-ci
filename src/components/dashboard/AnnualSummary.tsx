"use client";

import { useMemo } from "react";
import { useYearData } from "./useYearData";
import { academicAverage, annualAverage, summarizeSubjects } from "@/lib/grades";
import { getMention } from "@/lib/education";

const TRIMESTER_LABELS: Record<number, string> = {
  1: "1er Trim.",
  2: "2ème Trim.",
  3: "3ème Trim.",
};

export default function AnnualSummary() {
  const { data, loading, error } = useYearData();

  const trimesterAverages = useMemo(
    () =>
      data.map((t) => ({
        trimester: t.trimester,
        average: academicAverage(summarizeSubjects(t.subjects)),
      })),
    [data]
  );

  const annual = useMemo(
    () => annualAverage(trimesterAverages.map((t) => t.average)),
    [trimesterAverages]
  );

  const mention = annual !== null ? getMention(annual) : null;
  const hasAnyData = trimesterAverages.some((t) => t.average !== null);

  if (loading) {
    return (
      <div className="mt-6 rounded-xl border border-border bg-surface p-5">
        <p className="text-sm text-foreground/50">Chargement de la moyenne annuelle...</p>
      </div>
    );
  }

  if (error || !hasAnyData) return null;

  return (
    <div className="mt-6 rounded-xl border border-brand/30 bg-brand/5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold text-brand-dark">Moyenne annuelle</h2>
        {mention && (
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${mention.color}`}>
            {mention.label}
          </span>
        )}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {trimesterAverages.map((t) => (
          <div key={t.trimester} className="rounded-lg border border-border bg-surface p-3 text-center">
            <p className="text-xs text-foreground/50">{TRIMESTER_LABELS[t.trimester]}</p>
            <p className="mt-1 text-lg font-bold text-foreground">
              {t.average !== null ? t.average.toFixed(2) : "—"}
            </p>
          </div>
        ))}
        <div className="rounded-lg border border-brand bg-brand/10 p-3 text-center">
          <p className="text-xs font-medium text-brand-dark">Année</p>
          <p className="mt-1 text-lg font-bold text-brand-dark">
            {annual !== null ? annual.toFixed(2) : "—"}
          </p>
        </div>
      </div>
      <p className="mt-3 text-xs text-foreground/50">
        Moyenne simple des trimestres renseignés (chaque trimestre compte à parts égales).
      </p>
    </div>
  );
}
