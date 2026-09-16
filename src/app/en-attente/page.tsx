export const metadata = { title: "Compte en attente — Carnet Scolaire CI" };

export default function EnAttentePage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-6">
      <p className="text-4xl">⏳</p>
      <h1 className="mt-4 text-xl font-bold text-brand-dark">
        Ton compte est en attente de validation
      </h1>
      <p className="mt-3 text-sm text-foreground/65">
        Un administrateur doit approuver ta demande avant que tu puisses accéder à ton espace.
        Reviens un peu plus tard.
      </p>
    </div>
  );
}
