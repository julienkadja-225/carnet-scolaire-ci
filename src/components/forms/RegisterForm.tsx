"use client";

import { useState } from "react";
import Link from "next/link";
import { CLASS_LEVELS, SERIES_BY_LEVEL } from "@/lib/education";

export default function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [series, setSeries] = useState("");
  const [school, setSchool] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const availableSeries = SERIES_BY_LEVEL[classLevel] ?? [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          password,
          classLevel,
          series: series || undefined,
          school: school || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue.");
        return;
      }
      setSuccess(data.message);
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setClassLevel("");
      setSeries("");
      setSchool("");
    } catch {
      setError("Impossible de contacter le serveur. Réessaie plus tard.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="text-3xl">✅</p>
        <p className="mt-3 font-semibold text-emerald-800">{success}</p>
        <Link href="/connexion" className="mt-4 inline-block text-sm font-medium text-brand underline">
          Revenir à la page de connexion
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium">Nom complet</label>
        <input
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-brand focus:outline-none"
          placeholder="Ex : Kouassi Aya Grace"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Adresse email</label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-brand focus:outline-none"
          placeholder="toi@exemple.com"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Mot de passe</label>
          <input
            required
            type="password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Confirmer le mot de passe</label>
          <input
            required
            type="password"
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Classe</label>
          <select
            required
            value={classLevel}
            onChange={(e) => {
              setClassLevel(e.target.value);
              setSeries("");
            }}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-brand focus:outline-none"
          >
            <option value="">Sélectionner...</option>
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
        <label className="mb-1 block text-sm font-medium">Établissement (optionnel)</label>
        <input
          value={school}
          onChange={(e) => setSchool(e.target.value)}
          className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-brand focus:outline-none"
          placeholder="Ex : Lycée Moderne de Cocody"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
      >
        {loading ? "Envoi en cours..." : "Envoyer ma demande d'inscription"}
      </button>

      <p className="text-center text-xs text-foreground/60">
        Ta demande sera examinée par un administrateur avant l&apos;activation du compte.
      </p>
    </form>
  );
}
