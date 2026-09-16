import Link from "next/link";
import ForgotPasswordForm from "@/components/forms/ForgotPasswordForm";
import AuthLayout from "@/components/auth/AuthLayout";

export const metadata = { title: "Mot de passe oublié — Carnet Scolaire CI" };

export default function MotDePasseOubliePage() {
  return (
    <AuthLayout
      title="Mot de passe oublié"
      subtitle="Indique ton adresse email, nous générerons un lien de réinitialisation."
      footer={
        <Link href="/connexion" className="font-medium text-brand underline">
          Revenir à la connexion
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
