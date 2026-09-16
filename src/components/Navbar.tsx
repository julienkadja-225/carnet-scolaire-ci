"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export interface NavbarUser {
  fullName: string;
  role: "STUDENT" | "ADMIN" | "SUPERADMIN";
}

const ROLE_LABELS: Record<NavbarUser["role"], string> = {
  STUDENT: "Élève",
  ADMIN: "Administrateur",
  SUPERADMIN: "Super administrateur",
};

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return initials.join("") || "?";
}

export default function Navbar({ user }: { user: NavbarUser | null }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const homeHref = !user ? "/" : user.role === "STUDENT" ? "/dashboard" : "/admin";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href={homeHref} className="flex items-center gap-2 font-semibold text-brand-dark">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
            CS
          </span>
          <span className="hidden text-base sm:inline">Carnet Scolaire CI</span>
        </Link>

        <nav className="flex items-center gap-2 text-sm sm:gap-4">
          {!user && (
            <>
              <Link href="/connexion" className="rounded-md px-3 py-2 font-medium text-foreground hover:bg-black/5">
                Connexion
              </Link>
              <Link
                href="/inscription"
                className="rounded-md bg-brand px-3 py-2 font-medium text-white hover:bg-brand-dark"
              >
                Demande d&apos;inscription
              </Link>
            </>
          )}

          {user && user.role === "STUDENT" && (
            <>
              <Link href="/dashboard" className="rounded-md px-3 py-2 font-medium hover:bg-black/5">
                Tableau de bord
              </Link>
              <Link href="/dashboard/matieres" className="rounded-md px-3 py-2 font-medium hover:bg-black/5">
                Mes matières
              </Link>
              <Link href="/dashboard/suggestions" className="rounded-md px-3 py-2 font-medium hover:bg-black/5">
                Conseils
              </Link>
            </>
          )}

          {user && (user.role === "ADMIN" || user.role === "SUPERADMIN") && (
            <>
              <Link href="/admin" className="rounded-md px-3 py-2 font-medium hover:bg-black/5">
                Tableau de bord
              </Link>
              <Link href="/admin/demandes" className="rounded-md px-3 py-2 font-medium hover:bg-black/5">
                Demandes
              </Link>
              <Link href="/admin/utilisateurs" className="rounded-md px-3 py-2 font-medium hover:bg-black/5">
                Utilisateurs
              </Link>
            </>
          )}

          {user && (
            <div ref={menuRef} className="relative ml-2 border-l border-border pl-3">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-black/5"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white">
                  {initialsOf(user.fullName)}
                </span>
                <span className="hidden max-w-[9rem] truncate text-xs font-medium text-foreground/70 sm:inline">
                  {user.fullName}
                </span>
                <svg
                  className={`h-3.5 w-3.5 text-foreground/40 transition-transform ${menuOpen ? "rotate-180" : ""}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.08 1.04l-4.25 4.65a.75.75 0 01-1.08 0l-4.25-4.65a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-border bg-surface py-1 shadow-lg">
                  <div className="border-b border-border px-3 py-2">
                    <p className="truncate text-sm font-medium text-foreground">{user.fullName}</p>
                    <p className="text-xs text-foreground/50">{ROLE_LABELS[user.role]}</p>
                  </div>
                  <Link
                    href="/profil"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-sm hover:bg-black/5"
                  >
                    👤 Mon profil
                  </Link>
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    {loggingOut ? "Déconnexion..." : "🚪 Déconnexion"}
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
