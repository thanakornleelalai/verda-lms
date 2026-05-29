"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { LayoutDashboard, Users, BookOpen, ShoppingBag, Settings, LogOut, ExternalLink, Award, TrendingUp, Tag, Bell, Shield, Server, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import { ThemeCustomizer } from "@/components/theme/ThemeCustomizer";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Analytics", icon: TrendingUp },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/certificates", label: "Certificates", icon: Award },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/announcements", label: "Announcements", icon: Bell },
  { href: "/admin/content", label: "Content", icon: FileText },
  { href: "/admin/moderation", label: "Moderation", icon: Shield },
  { href: "/admin/system", label: "System", icon: Server },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const locale = useLocale();
  const { data: session } = useSession();

  return (
    <aside className="w-[220px] shrink-0 bg-paper-3 border-r border-line flex flex-col h-screen sticky top-0">
      <div className="px-6 py-5 border-b border-line">
        <Link href={`/${locale}`} className="flex items-baseline gap-1.5">
          <span className="font-display text-[20px] text-ink tracking-[-0.02em]">VERDA</span>
          <span className="w-[6px] h-[6px] rounded-full bg-viridian inline-block translate-y-[-1px]" />
        </Link>
        <p className="font-mono text-[9px] text-ink-3 tracking-[0.12em] uppercase mt-1">ADMIN PANEL</p>
      </div>

      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const full = `/${locale}${href}`;
          const active = pathname === full || (href !== "/admin" && pathname.startsWith(full));
          return (
            <Link
              key={href}
              href={full}
              className={cn(
                "nav-item flex items-center gap-3 px-3 py-2.5 rounded-r2 text-[14px] mb-0.5",
                active ? "nav-item-active bg-viridian text-white shadow-sm" : "text-ink-2 hover:bg-paper-2 hover:text-ink"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-line flex flex-col gap-1">
        {session?.user && (
          <div className="px-3 py-2 mb-1">
            <p className="text-[12px] font-medium text-ink truncate">{session.user.name}</p>
            <p className="text-[10px] text-ink-4 truncate font-mono">{session.user.email}</p>
          </div>
        )}
        <div className="flex items-center gap-2 px-3 py-1">
          <ThemeCustomizer placement="top-left" />
          <span className="text-[12px] text-ink-3">ธีม & สี</span>
        </div>
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 px-3 py-2 text-[13px] text-ink-3 hover:text-ink transition-colors rounded-r2"
        >
          <ExternalLink size={13} />
          ดูหน้าเว็บ
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
          className="flex items-center gap-2 px-3 py-2 text-[13px] text-danger hover:bg-danger/5 transition-colors rounded-r2 w-full text-left"
        >
          <LogOut size={13} />
          ออกจากระบบ
        </button>
      </div>
    </aside>
  );
}
