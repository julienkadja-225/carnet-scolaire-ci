import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

const FEATURES = [
  {
    title: "Demande de compte encadrée",
    description:
      "Chaque élève s'inscrit avec sa classe et son établissement. Un administrateur ou super administrateur valide la demande avant tout accès.",
    icon: "🛡️",
  },
  {
    title: "Matières & coefficients",
    description:
      "Ajoute tes matières par trimestre avec leur coefficient, comme sur ton relevé de notes officiel.",
    icon: "📚",
  },
  {
    title: "Notes sur 20 ou sur 10",
    description:
      "Enregistre interrogations, devoirs et compositions dans le barème utilisé par ton enseignant : l'application convertit tout automatiquement.",
    icon: "📝",
  },
  {
    title: "Moyennes automatiques",
    description:
      "Moyenne par matière, moyenne générale pondérée par les coefficients, et note de conduite par défaut à 18/20.",
    icon: "📊",
  },
  {
    title: "Conseils personnalisés",
    description:
      "L'application identifie les matières qui pèsent le plus sur ta moyenne générale et te propose un plan d'action concret.",
    icon: "🎯",
  },
  {
    title: "Adapté au système ivoirien",
    description:
      "Niveaux du collège et du lycée (6ème à Terminale), séries A1/A2/C/D, trimestres et appréciations conformes aux bulletins de Côte d'Ivoire.",
    icon: "🇨🇮",
  },
];

export default async function Home() {
  const user = await getCurrentUser();
  if (user) {
    redirect(user.role === "STUDENT" ? "/dashboard" : "/admin");
  }

  return (
    <div>
      <section className="border-b border-border bg-gradient-to-b from-brand/5 to-transparent">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="max-w-2xl">
            <span className="inline-block rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand-dark">
              Pensé pour les élèves de Côte d&apos;Ivoire
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-brand-dark sm:text-5xl">
              Suis tes notes, comprends ta moyenne, progresse chaque trimestre.
            </h1>
            <p className="mt-5 text-base text-foreground/70 sm:text-lg">
              Carnet Scolaire CI aide les collégiens et lycéens à enregistrer leurs notes par
              matière, à calculer leur moyenne générale avec les coefficients, et à recevoir des
              conseils concrets pour progresser — le tout validé par l&apos;administration de
              l&apos;établissement.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/inscription"
                className="rounded-md bg-accent px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90"
              >
                Créer ma demande de compte
              </Link>
              <Link
                href="/connexion"
                className="rounded-md border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground hover:bg-black/5"
              >
                J&apos;ai déjà un compte
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-2xl font-bold text-brand-dark">
          Tout ce qu&apos;il te faut pour piloter ta scolarité
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-surface p-6 shadow-sm">
              <div className="text-2xl">{f.icon}</div>
              <h3 className="mt-3 font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-foreground/65">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-brand-dark py-14 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold">Comment ça marche ?</h2>
          <div className="mt-8 grid gap-6 text-left sm:grid-cols-3">
            <div>
              <div className="text-3xl font-bold text-accent">1</div>
              <p className="mt-2 text-sm text-white/80">
                Tu remplis le formulaire de demande d&apos;inscription avec ta classe et ton
                établissement.
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">2</div>
              <p className="mt-2 text-sm text-white/80">
                Un administrateur valide ton compte depuis son espace de gestion.
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">3</div>
              <p className="mt-2 text-sm text-white/80">
                Tu te connectes, ajoutes tes matières et tes notes, et suis ta progression.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
