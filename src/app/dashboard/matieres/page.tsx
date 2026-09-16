import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import SubjectsManager from "@/components/dashboard/SubjectsManager";

export const metadata = { title: "Mes matières — Carnet Scolaire CI" };

export default async function MatieresPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  if (user.status !== "APPROVED") redirect("/en-attente");
  if (user.role !== "STUDENT") redirect("/admin");

  return <SubjectsManager classLevel={user.classLevel} />;
}
