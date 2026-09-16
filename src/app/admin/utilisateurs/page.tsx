import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AdminUsersList from "@/components/admin/AdminUsersList";

export const metadata = { title: "Utilisateurs — Administration" };

export default async function AdminUtilisateursPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  if (user.role !== "ADMIN" && user.role !== "SUPERADMIN") redirect("/dashboard");

  return <AdminUsersList canManageRoles={user.role === "SUPERADMIN"} />;
}
