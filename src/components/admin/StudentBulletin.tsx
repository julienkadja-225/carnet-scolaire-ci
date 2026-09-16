"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { StudentReportDTO } from "@/lib/admin-types";
import {
  academicAverage,
  annualAverage,
  generalAverageWithConduct,
  subjectAverage,
  summarizeSubjects,
} from "@/lib/grades";
import { DEFAULT_CONDUCT, getClassLabel, getMention } from "@/lib/education";

const TRIMESTER_LABELS: Record<number, string> = {
  1: "1er Trimestre",
  2: "2ème Trimestre",
  3: "3ème Trimestre",
};

type ViewMode = 1 | 2 | 3 | "annual";

export default function StudentBulletin({ studentId }: { studentId: string }) {
  const [report, setReport] = useState<StudentReportDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>(1);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/students/${studentId}/report`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Erreur de chargement");
        if (!ignore) setReport(data);
      } catch (e) {
        if (!ignore) setError(e instanceof Error ? e.message : "Erreur inconnue");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [studentId]);

  const trimesterAcademicAverages = useMemo(() => {
    if (!report) return [null, null, null] as (number | null)[];
    return report.trimesters.map((t) => academicAverage(summarizeSubjects(t.subjects)));
  }, [report]);

  const annual = useMemo(() => annualAverage(trimesterAcademicAverages), [trimesterAcademicAverages]);

  const annualSubjectRows = useMemo(() => {
    if (!report) return [];
    const map = new Map<
      string,
      { name: string; coefficient: number; perTrimester: (number | null)[] }
    >();
    report.trimesters.forEach((t, idx) => {
      t.subjects.forEach((s) => {
        const key = s.name.trim().toLowerCase();
        if (!map.has(key)) {
          map.set(key, { name: s.name, coefficient: s.coefficient, perTrimester: [null, null, null] });
        }
        const entry = map.get(key) as {
          name: string;
          coefficient: number;
          perTrimester: (number | null)[];
        };
        entry.coefficient = s.coefficient;
        entry.perTrimester[idx] = subjectAverage(s);
      });
    });
    return Array.from(map.values()).map((e) => ({
      ...e,
      annual: annualAverage(e.perTrimester),
    }));
  }, [report]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <p className="text-sm text-foreground/50">Chargement du bulletin...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error ?? "Bulletin introuvable."}
        </div>
        <Link href="/admin/eleves" className="mt-4 inline-block text-sm font-medium text-brand underline">
          ← Retour à la liste des élèves
        </Link>
      </div>
    );
  }

  const { student } = report;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link href="/admin/eleves" className="text-sm font-medium text-brand underline">
        ← Retour à la liste des élèves
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">{student.fullName}</h1>
          <p className="mt-1 text-sm text-foreground/65">
            {getClassLabel(student.classLevel)}
            {student.series ? ` · Série ${student.series}` : ""}
            {student.school ? ` · ${student.school}` : ""}
            {" · "}
            {student.email}
          </p>
        </div>

        <div className="inline-flex flex-wrap rounded-lg border border-border bg-surface p-1 text-sm">
          {[1, 2, 3].map((t) => (
            <button
              key={t}
              onClick={() => setView(t as ViewMode)}
              className={`rounded-md px-3 py-1.5 font-medium transition ${
                view === t ? "bg-brand text-white" : "text-foreground/70 hover:bg-black/5"
              }`}
            >
              {TRIMESTER_LABELS[t]}
            </button>
          ))}
          <button
            onClick={() => setView("annual")}
            className={`rounded-md px-3 py-1.5 font-medium transition ${
              view === "annual" ? "bg-brand text-white" : "text-foreground/70 hover:bg-black/5"
            }`}
          >
            Bulletin annuel
          </button>
        </div>
      </div>

      {view !== "annual" ? (
        <TrimesterBulletin
          trimester={view}
          subjects={report.trimesters[view - 1].subjects}
          conduct={report.trimesters[view - 1].conduct.value}
        />
      ) : (
        <AnnualBulletin
          trimesterAverages={trimesterAcademicAverages}
          annual={annual}
          subjectRows={annualSubjectRows}
        />
      )}
    </div>
  );
}

function TrimesterBulletin({
  trimester,
  subjects,
  conduct,
}: {
  trimester: number;
  subjects: StudentReportDTO["trimesters"][number]["subjects"];
  conduct: number;
}) {
  const summaries = summarizeSubjects(subjects);
  const academic = academicAverage(summaries);
  const withConduct = generalAverageWithConduct(summaries, conduct ?? DEFAULT_CONDUCT);
  const mention = academic !== null ? getMention(academic) : null;

  return (
    <div className="mt-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Moyenne générale" value={academic} highlight />
        <StatCard label="Moyenne (avec conduite)" value={withConduct} />
        <StatCard label="Conduite" value={conduct} decimals={1} />
        <StatCard label="Matières notées" value={summaries.filter((s) => s.average !== null).length} suffix={`/ ${summaries.length}`} raw />
      </div>

      {mention && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${mention.color}`}>
            {mention.label}
          </span>
          <p className="text-sm text-foreground/65">
            Appréciation basée sur la moyenne générale académique de {TRIMESTER_LABELS[trimester]}.
          </p>
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase text-foreground/50">
              <th className="px-4 py-3">Matière</th>
              <th className="px-4 py-3">Coef.</th>
              <th className="px-4 py-3">Notes</th>
              <th className="px-4 py-3 text-right">Moyenne</th>
            </tr>
          </thead>
          <tbody>
            {subjects.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-foreground/50">
                  Aucune matière renseignée pour ce trimestre.
                </td>
              </tr>
            ) : (
              subjects.map((s) => {
                const avg = subjectAverage(s);
                return (
                  <tr key={s.id} className="border-b border-border last:border-0 align-top">
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3">{s.coefficient}</td>
                    <td className="px-4 py-3 text-xs text-foreground/65">
                      {s.grades.length === 0
                        ? "—"
                        : s.grades
                            .map((g) => `${g.label} : ${g.value}/${g.scale}`)
                            .join(" · ")}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {avg !== null ? `${avg.toFixed(2)}/20` : "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AnnualBulletin({
  trimesterAverages,
  annual,
  subjectRows,
}: {
  trimesterAverages: (number | null)[];
  annual: number | null;
  subjectRows: { name: string; coefficient: number; perTrimester: (number | null)[]; annual: number | null }[];
}) {
  const mention = annual !== null ? getMention(annual) : null;

  return (
    <div className="mt-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="1er Trim." value={trimesterAverages[0]} />
        <StatCard label="2ème Trim." value={trimesterAverages[1]} />
        <StatCard label="3ème Trim." value={trimesterAverages[2]} />
        <StatCard label="Moyenne annuelle" value={annual} highlight />
      </div>

      {mention && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${mention.color}`}>
            {mention.label}
          </span>
          <p className="text-sm text-foreground/65">
            Appréciation basée sur la moyenne annuelle (moyenne simple des trimestres renseignés).
          </p>
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase text-foreground/50">
              <th className="px-4 py-3">Matière</th>
              <th className="px-4 py-3">Coef.</th>
              <th className="px-4 py-3 text-right">T1</th>
              <th className="px-4 py-3 text-right">T2</th>
              <th className="px-4 py-3 text-right">T3</th>
              <th className="px-4 py-3 text-right">Annuel</th>
            </tr>
          </thead>
          <tbody>
            {subjectRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-foreground/50">
                  Aucune matière renseignée sur l&apos;année.
                </td>
              </tr>
            ) : (
              subjectRows.map((row) => (
                <tr key={row.name} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{row.name}</td>
                  <td className="px-4 py-3">{row.coefficient}</td>
                  {row.perTrimester.map((v, i) => (
                    <td key={i} className="px-4 py-3 text-right text-foreground/70">
                      {v !== null ? v.toFixed(2) : "—"}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right font-semibold">
                    {row.annual !== null ? row.annual.toFixed(2) : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  suffix = "/20",
  highlight,
  decimals = 2,
  raw,
}: {
  label: string;
  value: number | null;
  suffix?: string;
  highlight?: boolean;
  decimals?: number;
  raw?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? "border-brand bg-brand/5" : "border-border bg-surface"}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-foreground/50">{label}</p>
      <p className="mt-2 text-xl font-bold text-brand-dark">
        {value === null ? "—" : raw ? value : value.toFixed(decimals)}
        <span className="ml-1 text-sm font-medium text-foreground/50">{suffix}</span>
      </p>
    </div>
  );
}
