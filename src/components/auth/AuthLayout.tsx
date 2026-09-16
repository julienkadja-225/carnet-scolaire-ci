import Link from "next/link";
import type { ReactNode } from "react";

const FEATURES = [
  { icon: "📚", text: "Matières, coefficients et notes /20 ou /10" },
  { icon: "📊", text: "Moyennes automatiques, conduite et mentions" },
  { icon: "🎯", text: "Conseils personnalisés pour progresser" },
  { icon: "🛡️", text: "Comptes validés par ton administration" },
];

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  maxWidthClassName = "max-w-md",
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidthClassName?: string;
}) {
  return (
    <div className="flex min-h-[calc(100vh-57px)]">
      <div className="relative hidden w-[42%] flex-col justify-between overflow-hidden bg-brand-dark px-10 py-12 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 60% 70%, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <Link href="/" className="relative flex items-center gap-2 font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
            CS
          </span>
          <span className="text-lg">Carnet Scolaire CI</span>
        </Link>

        <div className="relative">
          <h2 className="text-3xl font-bold leading-snug">
            Pilote ta scolarité, trimestre après trimestre.
          </h2>
          <p className="mt-4 text-sm text-white/75">
            Un outil pensé pour le système éducatif ivoirien — du collège au lycée.
          </p>
          <ul className="mt-8 space-y-4">
            {FEATURES.map((f) => (
              <li key={f.text} className="flex items-center gap-3 text-sm text-white/85">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-base">
                  {f.icon}
                </span>
                {f.text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/50">
          Carnet Scolaire CI — Outil de suivi scolaire inspiré du système éducatif ivoirien.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className={`w-full ${maxWidthClassName}`}>
          <div className="mb-6 text-center lg:text-left">
            <h1 className="text-2xl font-bold text-brand-dark">{title}</h1>
            <p className="mt-2 text-sm text-foreground/65">{subtitle}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">{children}</div>
          {footer && <div className="mt-4 text-center text-sm text-foreground/65">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
