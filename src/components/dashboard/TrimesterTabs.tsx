"use client";

import { TRIMESTERS } from "@/lib/education";

export default function TrimesterTabs({
  value,
  onChange,
}: {
  value: number;
  onChange: (t: number) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-surface p-1 text-sm">
      {TRIMESTERS.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={`rounded-md px-3 py-1.5 font-medium transition ${
            value === t.value ? "bg-brand text-white" : "text-foreground/70 hover:bg-black/5"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
