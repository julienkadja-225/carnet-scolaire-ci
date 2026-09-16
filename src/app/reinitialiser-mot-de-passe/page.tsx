import { Suspense } from "react";
import ResetPasswordForm from "@/components/forms/ResetPasswordForm";
import AuthLayout from "@/components/auth/AuthLayout";

export const metadata = { title: "Réinitialiser le mot de passe — Carnet Scolaire CI" };

export default function ReinitialiserMotDePassePage() {
  return (
    <AuthLayout
      title="Réinitialiser le mot de passe"
      subtitle="Choisis un nouveau mot de passe pour ton compte."
    >
      <Suspense fallback={<div className="text-sm text-foreground/50">Chargement...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
