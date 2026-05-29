import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN" && role !== "SUPERADMIN") {
    redirect(`/${locale}/dashboard`);
  }

  return (
    <div className="min-h-screen bg-paper-2 flex">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
