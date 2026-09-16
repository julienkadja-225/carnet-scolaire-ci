import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import DashboardOverview from "@/components/dashboard/DashboardOverview";

export const metadata = { title: "Tableau de bord — Carnet Scolaire CI" };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  if (user.status !== "APPROVED") redirect("/en-attente");
  if (user.role !== "STUDENT") redirect("/admin");

  return <DashboardOverview fullName={user.fullName} />;
}
