import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import StudentBulletin from "@/components/admin/StudentBulletin";

export const metadata = { title: "Bulletin élève — Administration" };

interface PageParams {
  params: Promise<{ id: string }>;
}

export default async function AdminEleveBulletinPage({ params }: PageParams) {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  if (user.role !== "ADMIN" && user.role !== "SUPERADMIN") redirect("/dashboard");

  const { id } = await params;

  return <StudentBulletin studentId={id} />;
}
