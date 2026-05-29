/**
 * Role-dispatch redirect — server component
 * Called after every login (credentials + OAuth) to route the user
 * to the correct panel based on their role.
 *
 * ADMIN / SUPERADMIN  →  /[locale]/admin
 * INSTRUCTOR          →  /[locale]/studio
 * STUDENT (default)   →  /[locale]/dashboard
 */
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function RoleRedirectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  const role = (session.user as { role?: string }).role ?? "STUDENT";

  if (role === "ADMIN" || role === "SUPERADMIN") {
    redirect(`/${locale}/admin`);
  }

  if (role === "INSTRUCTOR") {
    redirect(`/${locale}/studio`);
  }

  redirect(`/${locale}/dashboard`);
}
