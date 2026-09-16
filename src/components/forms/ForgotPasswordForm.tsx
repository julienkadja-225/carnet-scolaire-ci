"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [devResetLink, setDevResetLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setDevResetLink(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue.");
        return;
      }
      setMessage(data.message);
      if (data.devResetLink) setDevResetLink(data.devResetLink);
    } catch {
      setError("Impossible de contacter le serveur. Réessaie plus tard.");
    } finally {
      setLoading(false);
    }
  }

  if (message) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="text-3xl">📩</p>
        <p className="mt-3 font-semibold text-emerald-800">{message}</p>
        {devResetLink && (
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-left text-sm">
            <p className="font-medium text-amber-800">
              Aucun service d&apos;email n&apos;est configuré sur ce serveur de démonstration.
            </p>
            <p className="mt-1 text-amber-700">Voici ton lien de réinitialisation :</p>
            <Link href={devResetLink} className="mt-2 block break-all font-medium text-brand underline">
              {devResetLink}
            </Link>
          </div>
        )}
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

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
      >
        {loading ? "Envoi..." : "Envoyer le lien de réinitialisation"}
      </button>
    </form>
  );
}
