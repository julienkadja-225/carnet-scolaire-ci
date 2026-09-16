import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import UIProvider from "@/components/ui/UIProvider";
import { getCurrentUser } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Carnet Scolaire CI — Suivi des notes et moyennes",
  description:
    "Application pour élèves ivoiriens : gestion des matières, coefficients, notes et moyennes, avec conseils personnalisés pour progresser.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <UIProvider>
          <Navbar
            user={
              user
                ? { fullName: user.fullName, role: user.role as "STUDENT" | "ADMIN" | "SUPERADMIN" }
                : null
            }
          />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border bg-surface py-6 text-center text-xs text-foreground/50">
            Carnet Scolaire CI — Outil de suivi scolaire inspiré du système éducatif ivoirien.
          </footer>
        </UIProvider>
      </body>
    </html>
  );
}
