"use client";

import { useState, useTransition } from "react";
import { Ban, RotateCcw, ShieldCheck, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { adminSetUserSuspended } from "@/actions/user";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  suspended?: boolean;
  _count?: { enrollments: number };
};

const ROLE_COLORS: Record<string, string> = {
  STUDENT: "bg-line text-ink-2",
  INSTRUCTOR: "bg-viridian/10 text-viridian",
  ADMIN: "bg-amber-400/10 text-amber-600",
  SUPERADMIN: "bg-danger/10 text-danger",
};

export function UserListClient({ users: initial }: { users: UserRow[] }) {
  const [users, setUsers] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const [alert, setAlert] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  function notify(type: "ok" | "err", msg: string) {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 3500);
  }

  function toggleSuspend(u: UserRow) {
    const next = !u.suspended;
    if (next && !confirm(`ระงับการใช้งานบัญชี "${u.name}"?\n\nผู้ใช้จะเข้าสู่ระบบไม่ได้ และเนื้อหา/คอร์สจะถูกซ่อนจากเว็บไซต์`)) return;
    startTransition(async () => {
      const res = await adminSetUserSuspended(u.id, next);
      if (res.success) {
        setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, suspended: next } : x)));
        notify("ok", next ? `ระงับบัญชี "${u.name}" แล้ว` : `คืนสิทธิ์บัญชี "${u.name}" แล้ว`);
      } else {
        notify("err", res.error ?? "เกิดข้อผิดพลาด");
      }
    });
  }

  if (users.length === 0) {
    return <div className="py-12 text-center text-ink-3 text-[14px]">ไม่พบผู้ใช้ที่ตรงกัน</div>;
  }

  return (
    <>
      {alert && (
        <div className={`flex items-center gap-2 text-[13px] px-5 py-2.5 ${
          alert.type === "ok" ? "bg-ok/10 text-ok" : "bg-danger/5 text-danger"
        }`}>
          {alert.type === "ok" ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          {alert.msg}
        </div>
      )}
      <table className="w-full text-[14px]">
        <thead>
          <tr className="border-b border-line">
            <th className="text-left px-5 py-3 font-mono text-[10px] tracking-[0.1em] uppercase text-ink-3">ผู้ใช้</th>
            <th className="text-center px-5 py-3 font-mono text-[10px] tracking-[0.1em] uppercase text-ink-3">บทบาท</th>
            <th className="text-center px-5 py-3 font-mono text-[10px] tracking-[0.1em] uppercase text-ink-3">สถานะ</th>
            <th className="text-right px-5 py-3 font-mono text-[10px] tracking-[0.1em] uppercase text-ink-3">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const isAdmin = u.role === "ADMIN" || u.role === "SUPERADMIN";
            return (
              <tr key={u.id} className={`border-b border-line last:border-0 transition-colors ${
                u.suspended ? "bg-danger/5" : "hover:bg-paper-2"
              }`}>
                <td className="px-5 py-3">
                  <p className={`font-medium ${u.suspended ? "text-ink-3 line-through" : "text-ink"}`}>{u.name}</p>
                  <p className="text-[12px] text-ink-3">{u.email}</p>
                </td>
                <td className="px-5 py-3 text-center">
                  <span className={`font-mono text-[10px] px-2 py-0.5 rounded-pill uppercase tracking-wide ${ROLE_COLORS[u.role] ?? "bg-line text-ink-3"}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-3 text-center">
                  {u.suspended ? (
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-pill bg-danger/10 text-danger uppercase">
                      <Ban size={10} /> ระงับ
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-pill bg-ok/10 text-ok uppercase">
                      <CheckCircle size={10} /> ใช้งาน
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  {isAdmin ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-ink-4">
                      <ShieldCheck size={12} /> ผู้ดูแล
                    </span>
                  ) : (
                    <button
                      onClick={() => toggleSuspend(u)}
                      disabled={isPending}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-r2 text-[12px] border transition-colors disabled:opacity-50 ${
                        u.suspended
                          ? "border-ok/30 text-ok hover:bg-ok/10"
                          : "border-line text-ink-3 hover:border-danger hover:text-danger"
                      }`}
                    >
                      {isPending ? <Loader2 size={13} className="animate-spin" /> : u.suspended ? <RotateCcw size={13} /> : <Ban size={13} />}
                      {u.suspended ? "คืนสิทธิ์" : "ระงับ"}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
