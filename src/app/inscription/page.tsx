import Link from "next/link";
import RegisterForm from "@/components/forms/RegisterForm";
import AuthLayout from "@/components/auth/AuthLayout";

export const metadata = { title: "Demande d'inscription — Carnet Scolaire CI" };

export default function InscriptionPage() {
  return (
    <AuthLayout
      title="Demande de création de compte"
      subtitle="Renseigne tes informations. Un administrateur devra valider ta demande avant que tu puisses te connecter."
      maxWidthClassName="max-w-lg"
      footer={
        <>
          Déjà un compte ?{" "}
          <Link href="/connexion" className="font-medium text-brand underline">
            Connecte-toi
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthLayout>
  );
}
