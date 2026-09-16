import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import ProfileForm from "@/components/profile/ProfileForm";
import ChangePasswordForm from "@/components/profile/ChangePasswordForm";

export const metadata = { title: "Mon profil — Carnet Scolaire CI" };

export default async function ProfilPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-brand-dark">Mon profil</h1>
      <p className="mt-1 text-sm text-foreground/65">
        Gère tes informations personnelles et ton mot de passe.
      </p>

      <div className="mt-8 rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-foreground">Informations personnelles</h2>
        <ProfileForm
          user={{
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            classLevel: user.classLevel,
            series: user.series,
            school: user.school,
          }}
        />
      </div>

      <div className="mt-6 rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-foreground">Mot de passe</h2>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
