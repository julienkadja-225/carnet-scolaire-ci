import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AdminStudentsList from "@/components/admin/AdminStudentsList";

export const metadata = { title: "Élèves — Administration" };

export default async function AdminElevesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  if (user.role !== "ADMIN" && user.role !== "SUPERADMIN") redirect("/dashboard");

  return <AdminStudentsList />;
}
