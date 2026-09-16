import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AdminRequests from "@/components/admin/AdminRequests";

export const metadata = { title: "Demandes en attente — Administration" };

export default async function AdminDemandesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  if (user.role !== "ADMIN" && user.role !== "SUPERADMIN") redirect("/dashboard");

  return <AdminRequests />;
}
