"use client";

import { useMemo, useState } from "react";
import { useTrimesterData } from "./useTrimesterData";
import TrimesterTabs from "./TrimesterTabs";
import {
  academicAverage,
  buildSuggestions,
  simulateNewAverage,
  summarizeSubjects,
} from "@/lib/grades";
import { getMention, MENTIONS } from "@/lib/education";

export default function SuggestionsView() {
  const [trimester, setTrimester] = useState(1);
  const [target, setTarget] = useState(12);
  const { subjects, loading, error } = useTrimesterData(trimester);

  const summaries = useMemo(() => summarizeSubjects(subjects), [subjects]);
  const academic = academicAverage(summaries);
  const mention = academic !== null ? getMention(academic) : null;
  const suggestions = useMemo(
    () => buildSuggestions(summaries, academic, target),
    [summaries, academic, target]
  );

  const nextMention = mention
    ? MENTIONS.find((m) => m.min > mention.min && (academic ?? 0) < m.min)
    : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Conseils pour progresser</h1>
          <p className="mt-1 text-sm text-foreground/65">
            Priorise les matières qui ont le plus d&apos;impact sur ta moyenne générale.
          </p>
        </div>
        <TrimesterTabs value={trimester} onChange={setTrimester} />
      </div>

      {error && (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-10 text-sm text-foreground/50">Chargement...</p>
      ) : subjects.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-border bg-surface p-8 text-center text-sm text-foreground/65">
          Ajoute des matières et des notes pour recevoir des conseils personnalisés.
        </p>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center gap-4 rounded-xl border border-border bg-surface p-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-foreground/50">
                Moyenne actuelle
              </p>
              <p className="text-2xl font-bold text-brand-dark">
                {academic !== null ? academic.toFixed(2) : "—"} <span className="text-sm font-medium text-foreground/50">/20</span>
              </p>
            </div>
            {mention && (
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${mention.color}`}>
                {mention.label}
              </span>
            )}
            {nextMention && academic !== null && (
              <p className="text-sm text-foreground/65">
                Encore <span className="font-semibold">{(nextMention.min - academic).toFixed(2)} pt</span>{" "}
                pour atteindre « {nextMention.label} »
              </p>
            )}
            <div className="ml-auto flex items-center gap-2">
              <label className="text-sm text-foreground/60">Objectif :</label>
              <input
                type="number"
                min={0}
                max={20}
                step={0.5}
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
                className="w-20 rounded-md border border-border px-2 py-1 text-sm focus:border-brand focus:outline-none"
              />
              <span className="text-sm text-foreground/50">/20</span>
            </div>
          </div>

          {suggestions.length === 0 ? (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center text-sm text-emerald-800">
              Toutes tes matières notées atteignent déjà ton objectif de {target}/20. Continue
              ainsi ! 🎉
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <h2 className="text-sm font-semibold text-foreground/70">
                Priorités classées par impact sur ta moyenne générale
              </h2>
              {suggestions.map((s, idx) => {
                const simulatedFull = simulateNewAverage(summaries, s.subjectId, target);
                const simulatedHalf = simulateNewAverage(
                  summaries,
                  s.subjectId,
                  s.currentAverage + s.gapToGood / 2
                );
                return (
                  <div key={s.subjectId} className="rounded-xl border border-border bg-surface p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand-dark">
                          {idx + 1}
                        </span>
                        <span className="font-semibold">{s.subjectName}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            s.priority === "critique"
                              ? "bg-red-100 text-red-700"
                              : s.priority === "important"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {s.priority}
                        </span>
                      </div>
                      <span className="text-sm text-foreground/60">
                        Actuellement {s.currentAverage.toFixed(1)}/20 · coef. {s.coefficient}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-foreground/75">{s.message}</p>
                    <div className="mt-3 grid gap-2 text-xs text-foreground/60 sm:grid-cols-2">
                      <p>
                        Si tu progresses à mi-chemin ({(s.currentAverage + s.gapToGood / 2).toFixed(1)}
                        /20) : nouvelle moyenne générale ≈{" "}
                        <span className="font-semibold text-foreground">
                          {simulatedHalf !== null ? simulatedHalf.toFixed(2) : "—"}/20
                        </span>
                      </p>
                      <p>
                        Si tu atteins l&apos;objectif ({target}/20) : nouvelle moyenne générale ≈{" "}
                        <span className="font-semibold text-foreground">
                          {simulatedFull !== null ? simulatedFull.toFixed(2) : "—"}/20
                        </span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
