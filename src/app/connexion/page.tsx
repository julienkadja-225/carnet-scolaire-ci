import { Suspense } from "react";
import Link from "next/link";
import LoginForm from "@/components/forms/LoginForm";
import AuthLayout from "@/components/auth/AuthLayout";

export const metadata = { title: "Connexion — Carnet Scolaire CI" };

export default function ConnexionPage() {
  return (
    <AuthLayout
      title="Connexion"
      subtitle="Accède à ton espace élève ou d'administration."
      footer={
        <>
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="font-medium text-brand underline">
            Fais ta demande d&apos;inscription
          </Link>
        </>
      }
    >
      <Suspense fallback={<div className="text-sm text-foreground/50">Chargement...</div>}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
