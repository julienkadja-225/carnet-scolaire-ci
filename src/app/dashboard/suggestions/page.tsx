import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import SuggestionsView from "@/components/dashboard/SuggestionsView";

export const metadata = { title: "Conseils — Carnet Scolaire CI" };

export default async function SuggestionsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  if (user.status !== "APPROVED") redirect("/en-attente");
  if (user.role !== "STUDENT") redirect("/admin");

  return <SuggestionsView />;
}
