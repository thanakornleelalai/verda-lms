import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { StudioSidebar } from "@/components/layout/StudioSidebar";

export default async function StudioLayout({
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
  if (role !== "INSTRUCTOR" && role !== "ADMIN") {
    redirect(`/${locale}/dashboard`);
  }

  return (
    <div className="min-h-screen bg-paper flex">
      <StudioSidebar />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
