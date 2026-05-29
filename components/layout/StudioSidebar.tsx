"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { LayoutDashboard, BookOpen, BarChart2, Settings, Users, LogOut, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import { ThemeCustomizer } from "@/components/theme/ThemeCustomizer";

const NAV = [
  { href: "/studio", label: "Dashboard", icon: LayoutDashboard },
  { href: "/studio/courses", label: "Courses", icon: BookOpen },
  { href: "/studio/students", label: "Students", icon: Users },
  { href: "/studio/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/studio/settings", label: "Settings", icon: Settings },
];

export function StudioSidebar() {
  const pathname = usePathname();
  const locale = useLocale();
  const { data: session } = useSession();

  return (
    <aside className="w-[220px] shrink-0 bg-ink h-screen flex flex-col sticky top-0">
      <div className="px-6 py-5 border-b border-[#2A332E]">
        <Link href={`/${locale}`} className="flex items-baseline gap-1.5">
          <span className="font-display text-[22px] text-white tracking-[-0.02em]">VERDA</span>
          <span className="w-[6px] h-[6px] rounded-full bg-viridian inline-block translate-y-[-1px]" />
        </Link>
        <p className="font-mono text-[10px] text-[#6E756F] tracking-[0.12em] uppercase mt-1">
          INSTRUCTOR STUDIO
        </p>
      </div>

      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const full = `/${locale}${href}`;
          const active = pathname === full || (href !== "/studio" && pathname.startsWith(full));
          return (
            <Link
              key={href}
              href={full}
              className={cn(
                "nav-item flex items-center gap-3 px-3 py-2.5 rounded-r2 text-[14px] mb-0.5",
                active
                  ? "nav-item-active bg-viridian text-white shadow-sm"
                  : "text-[#8A938E] hover:text-white hover:bg-[#1c2421]"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-[#2A332E] flex flex-col gap-1">
        {session?.user && (
          <div className="px-3 py-2 mb-1">
            <p className="text-[12px] font-medium text-white truncate">{session.user.name}</p>
            <p className="text-[10px] text-[#6E756F] truncate font-mono">{session.user.email}</p>
          </div>
        )}
        <div className="flex items-center gap-2 px-3 py-1">
          <ThemeCustomizer placement="top-left" />
          <span className="text-[12px] text-[#8A938E]">ธีม & สี</span>
        </div>
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 px-3 py-2 text-[13px] text-[#6E756F] hover:text-white transition-colors rounded-r2"
        >
          <ExternalLink size={13} />
          ดูหน้าเว็บ
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
          className="flex items-center gap-2 px-3 py-2 text-[13px] text-red-400 hover:text-red-300 hover:bg-[#1c2421] transition-colors rounded-r2 w-full text-left"
        >
          <LogOut size={13} />
          ออกจากระบบ
        </button>
      </div>
    </aside>
  );
}
