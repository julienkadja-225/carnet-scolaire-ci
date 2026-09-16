"use client";

import { useState } from "react";
import { useTrimesterData } from "./useTrimesterData";
import TrimesterTabs from "./TrimesterTabs";
import { subjectAverage } from "@/lib/grades";
import { GRADE_LABELS, SUGGESTED_SUBJECTS, DEFAULT_CONDUCT } from "@/lib/education";
import type { SubjectDTO } from "@/lib/types";
import { useUI } from "@/components/ui/UIProvider";

export default function SubjectsManager({ classLevel }: { classLevel: string | null }) {
  const [trimester, setTrimester] = useState(1);
  const { subjects, conduct, loading, error, refetch } = useTrimesterData(trimester);

  const suggested = classLevel ? SUGGESTED_SUBJECTS[classLevel] ?? [] : [];
  const existingNames = new Set(subjects.map((s) => s.name.toLowerCase()));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Mes matières et mes notes</h1>
          <p className="mt-1 text-sm text-foreground/65">
            Ajoute une matière avec son coefficient, puis enregistre tes notes au fur et à mesure.
          </p>
        </div>
        <TrimesterTabs value={trimester} onChange={setTrimester} />
      </div>

      {error && (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <AddSubjectForm trimester={trimester} onAdded={refetch} />

      {suggested.filter((s) => !existingNames.has(s.name.toLowerCase())).length > 0 && (
        <QuickAddSuggestions
          trimester={trimester}
          suggestions={suggested.filter((s) => !existingNames.has(s.name.toLowerCase()))}
          onAdded={refetch}
        />
      )}

      <ConductEditor trimester={trimester} currentValue={conduct?.value ?? DEFAULT_CONDUCT} onSaved={refetch} />

      <div className="mt-8 space-y-4">
        {loading ? (
          <p className="text-sm text-foreground/50">Chargement...</p>
        ) : subjects.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-surface p-8 text-center text-sm text-foreground/65">
            Aucune matière pour ce trimestre pour le moment.
          </p>
        ) : (
          subjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} onChanged={refetch} />
          ))
        )}
      </div>
    </div>
  );
}

function AddSubjectForm({ trimester, onAdded }: { trimester: number; onAdded: () => void }) {
  const [name, setName] = useState("");
  const [coefficient, setCoefficient] = useState(2);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, coefficient, trimester }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur");
        return;
      }
      setName("");
      setCoefficient(2);
      onAdded();
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-border bg-surface p-4"
    >
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
      <div className="flex-1 min-w-[180px]">
        <label className="mb-1 block text-xs font-medium text-foreground/60">Nom de la matière</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex : Mathématiques"
          className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
      </div>
      <div className="w-28">
        <label className="mb-1 block text-xs font-medium text-foreground/60">Coefficient</label>
        <input
          required
          type="number"
          min={1}
          max={20}
          value={coefficient}
          onChange={(e) => setCoefficient(Number(e.target.value))}
          className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
      >
        {loading ? "Ajout..." : "+ Ajouter la matière"}
      </button>
    </form>
  );
}

function QuickAddSuggestions({
  trimester,
  suggestions,
  onAdded,
}: {
  trimester: number;
  suggestions: { name: string; coefficient: number }[];
  onAdded: () => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);

  async function quickAdd(name: string, coefficient: number) {
    setBusy(name);
    try {
      await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, coefficient, trimester }),
      });
      onAdded();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mt-4">
      <p className="mb-2 text-xs font-medium text-foreground/50">
        Suggestions pour ta classe (clique pour ajouter) :
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s.name}
            onClick={() => quickAdd(s.name, s.coefficient)}
            disabled={busy === s.name}
            className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:bg-brand/10 disabled:opacity-50"
          >
            + {s.name} (coef. {s.coefficient})
          </button>
        ))}
      </div>
    </div>
  );
}

function ConductEditor({
  trimester,
  currentValue,
  onSaved,
}: {
  trimester: number;
  currentValue: number;
  onSaved: () => void;
}) {
  const [value, setValue] = useState(currentValue);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await fetch("/api/conduct", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trimester, value }),
      });
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 3000);
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface p-4">
      <label className="text-sm font-medium text-foreground/70">Note de conduite (/20)</label>
      <input
        type="number"
        min={0}
        max={20}
        step={0.5}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-24 rounded-md border border-border px-3 py-1.5 text-sm focus:border-brand focus:outline-none"
      />
      <button
        onClick={save}
        disabled={saving}
        className="rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-black/5 disabled:opacity-50"
      >
        {saving ? "..." : "Enregistrer"}
      </button>
      {justSaved && <span className="text-xs text-emerald-600">Enregistré ✓</span>}
      <span className="text-xs text-foreground/45">Par défaut : 18/20</span>
    </div>
  );
}

function SubjectCard({ subject, onChanged }: { subject: SubjectDTO; onChanged: () => void }) {
  const { confirm } = useUI();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const average = subjectAverage(subject);

  async function handleDeleteSubject() {
    const ok = await confirm(`Supprimer la matière "${subject.name}" et toutes ses notes ?`, {
      title: "Supprimer la matière",
      confirmLabel: "Supprimer",
      danger: true,
    });
    if (!ok) return;
    setDeleting(true);
    try {
      await fetch(`/api/subjects/${subject.id}`, { method: "DELETE" });
      onChanged();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <button onClick={() => setOpen((o) => !o)} className="flex-1 text-left">
          <span className="font-semibold text-foreground">{subject.name}</span>
          <span className="ml-2 text-xs text-foreground/50">
            coef. {subject.coefficient} · {subject.grades.length} note
            {subject.grades.length > 1 ? "s" : ""}
          </span>
        </button>
        <span className="text-lg font-bold text-brand-dark">
          {average !== null ? `${average.toFixed(2)} /20` : "—"}
        </span>
        <button
          onClick={() => setOpen((o) => !o)}
          className="text-sm text-brand underline"
        >
          {open ? "Fermer" : "Détails"}
        </button>
        <button
          onClick={handleDeleteSubject}
          disabled={deleting}
          className="text-sm text-red-600 hover:underline disabled:opacity-50"
        >
          Supprimer
        </button>
      </div>

      {open && (
        <div className="border-t border-border p-4">
          <GradesList grades={subject.grades} onChanged={onChanged} />
          <AddGradeForm subjectId={subject.id} onAdded={onChanged} />
        </div>
      )}
    </div>
  );
}

function GradesList({
  grades,
  onChanged,
}: {
  grades: SubjectDTO["grades"];
  onChanged: () => void;
}) {
  async function handleDelete(id: string) {
    await fetch(`/api/grades/${id}`, { method: "DELETE" });
    onChanged();
  }

  if (grades.length === 0) {
    return <p className="text-sm text-foreground/50">Pas encore de note pour cette matière.</p>;
  }

  return (
    <ul className="space-y-2">
      {grades.map((g) => (
        <li key={g.id} className="flex items-center justify-between text-sm">
          <span>
            {g.label} — <span className="font-medium">{g.value}</span> / {g.scale}
          </span>
          <button onClick={() => handleDelete(g.id)} className="text-xs text-red-600 hover:underline">
            Retirer
          </button>
        </li>
      ))}
    </ul>
  );
}

function AddGradeForm({ subjectId, onAdded }: { subjectId: string; onAdded: () => void }) {
  const [label, setLabel] = useState<string>(GRADE_LABELS[0]);
  const [value, setValue] = useState<number>(10);
  const [scale, setScale] = useState<10 | 20>(20);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectId, label, value, scale }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur");
        return;
      }
      setValue(10);
      onAdded();
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-wrap items-end gap-3 border-t border-border pt-4">
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
      <div>
        <label className="mb-1 block text-xs font-medium text-foreground/60">Type</label>
        <select
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-brand focus:outline-none"
        >
          {GRADE_LABELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>
      <div className="w-24">
        <label className="mb-1 block text-xs font-medium text-foreground/60">Note</label>
        <input
          type="number"
          min={0}
          max={scale}
          step={0.25}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
      </div>
      <div className="w-24">
        <label className="mb-1 block text-xs font-medium text-foreground/60">Barème</label>
        <select
          value={scale}
          onChange={(e) => setScale(Number(e.target.value) as 10 | 20)}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-brand focus:outline-none"
        >
          <option value={20}>/20</option>
          <option value={10}>/10</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
      >
        {loading ? "..." : "+ Ajouter la note"}
      </button>
    </form>
  );
}
