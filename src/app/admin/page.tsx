import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const metadata = { title: "Tableau de bord — Administration" };

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  if (user.role !== "ADMIN" && user.role !== "SUPERADMIN") redirect("/dashboard");

  return <AdminDashboard canManageRoles={user.role === "SUPERADMIN"} />;
}
