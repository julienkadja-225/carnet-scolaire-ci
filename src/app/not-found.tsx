import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center sm:px-6">
      <p className="text-4xl">🔍</p>
      <h1 className="mt-4 text-xl font-bold text-brand-dark">Page introuvable</h1>
      <p className="mt-3 text-sm text-foreground/65">
        Cette page n&apos;existe pas ou a été déplacée.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
