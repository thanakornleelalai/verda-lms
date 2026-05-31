import { db } from "@/lib/db";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { formatNumber } from "@/lib/utils";
import { UserCheck, Search } from "lucide-react";

export const dynamic = "force-dynamic";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  _count?: { enrollments: number };
};

const ROLE_COLORS: Record<string, string> = {
  STUDENT: "bg-line text-ink-2",
  INSTRUCTOR: "bg-viridian/10 text-viridian",
  ADMIN: "bg-amber-400/10 text-amber-600",
  SUPERADMIN: "bg-danger/10 text-danger",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string }>;
}) {
  const { q = "", role: roleFilter = "" } = await searchParams;

  let users: UserRow[] = [];
  let total = 0;

  try {
    const dbUsers = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { enrollments: true } },
      },
    });
    total = await db.user.count();
    users = dbUsers.map((u) => ({
      id: u.id,
      name: u.name ?? "—",
      email: u.email ?? "—",
      role: u.role,
      createdAt: u.createdAt.toISOString().slice(0, 10),
      _count: u._count,
    }));
  } catch {
    users = [
      { id: "dev_admin_001", name: "Admin (Dev)", email: "admin@verda.dev", role: "ADMIN", createdAt: "2025-11-01" },
      { id: "dev_instructor_001", name: "Instructor (Dev)", email: "instructor@verda.dev", role: "INSTRUCTOR", createdAt: "2025-11-01" },
      { id: "usr_instructor_001", name: "คุณพิมพ์พร วัฒนากร", email: "pimchanok@example.com", role: "INSTRUCTOR", createdAt: "2025-11-01" },
      { id: "usr_instructor_002", name: "คุณธนพล สิทธิกุล", email: "thanaphol@example.com", role: "INSTRUCTOR", createdAt: "2025-12-10" },
      { id: "usr_student_001", name: "คุณสมชาย ทดสอบ", email: "demo@verda.dev", role: "STUDENT", createdAt: "2026-01-15" },
      { id: "dev_student_001", name: "Student (Dev)", email: "student@verda.dev", role: "STUDENT", createdAt: "2026-01-15" },
    ];
    total = 92_400;
  }

  // Client-side filter (mock mode) or server already filtered
  const filtered = users.filter((u) => {
    const matchQ =
      !q ||
      u.name.toLowerCase().includes(q.toLowerCase()) ||
      u.email.toLowerCase().includes(q.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchQ && matchRole;
  });

  const roles = ["STUDENT", "INSTRUCTOR", "ADMIN", "SUPERADMIN"];

  return (
    <div className="p-8 max-w-[1100px]">
      <div className="flex items-start justify-between mb-8">
        <div>
          <EyebrowLabel className="mb-1">ADMIN / USERS</EyebrowLabel>
          <h1 className="font-display text-[32px] text-ink tracking-[-0.015em]">จัดการผู้ใช้</h1>
          <p className="text-[14px] text-ink-3 mt-1">
            <strong className="text-ink">{formatNumber(total)}</strong> ผู้ใช้ทั้งหมด
            {filtered.length !== users.length && (
              <span className="ml-2 text-viridian">· แสดง {filtered.length} รายการ</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-paper-3 border border-line rounded-r3 px-4 py-3">
          <UserCheck size={18} className="text-viridian" />
          <div>
            <p className="font-mono text-[10px] text-ink-3 tracking-wide uppercase">Users</p>
            <p className="font-display text-[22px] text-viridian leading-tight">{formatNumber(total)}</p>
          </div>
        </div>
      </div>

      {/* Search + Role filter */}
      <form method="GET" className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative max-w-sm flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            className="input-base pl-9 text-[14px]"
            placeholder="ค้นหาด้วยชื่อหรืออีเมล..."
          />
        </div>
        <select
          name="role"
          defaultValue={roleFilter}
          className="input-base w-auto text-[14px]"
        >
          <option value="">บทบาททั้งหมด</option>
          {roles.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-viridian text-white text-[13px] rounded-pill hover:bg-viridian-2 transition-colors"
        >
          ค้นหา
        </button>
        {(q || roleFilter) && (
          <a
            href="?"
            className="text-[13px] text-ink-3 hover:text-ink transition-colors"
          >
            ล้างตัวกรอง
          </a>
        )}
      </form>

      <div className="bg-paper-3 border border-line rounded-r3 overflow-hidden">
        <div className="px-5 py-3 border-b border-line bg-paper-2">
          <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-ink-3">
            รายชื่อผู้ใช้ ({filtered.length} รายการที่แสดง)
          </p>
        </div>
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-ink-3 text-[14px]">ไม่พบผู้ใช้ที่ตรงกัน</div>
        ) : (
          <table className="w-full text-[14px]">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left px-5 py-3 font-mono text-[10px] tracking-[0.1em] uppercase text-ink-3">
                  ผู้ใช้
                </th>
                <th className="text-center px-5 py-3 font-mono text-[10px] tracking-[0.1em] uppercase text-ink-3">
                  บทบาท
                </th>
                <th className="text-right px-5 py-3 font-mono text-[10px] tracking-[0.1em] uppercase text-ink-3">
                  วันที่สมัคร
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-line last:border-0 hover:bg-paper-2 transition-colors"
                >
                  <td className="px-5 py-3">
                    <p className="font-medium text-ink">{u.name}</p>
                    <p className="text-[12px] text-ink-3">{u.email}</p>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span
                      className={`font-mono text-[10px] px-2 py-0.5 rounded-pill uppercase tracking-wide ${
                        ROLE_COLORS[u.role] ?? "bg-line text-ink-3"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-[12px] text-ink-3">
                    {u.createdAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
