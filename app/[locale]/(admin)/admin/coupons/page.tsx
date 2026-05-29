"use client";

import { useState, useTransition } from "react";
import { Tag, Plus, Trash2, CheckCircle, AlertCircle, Percent, Calendar, Users } from "lucide-react";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { Button } from "@/components/primitives/Button";
import { createCoupon, deleteCoupon } from "@/actions/admin";

// Mock initial data — in real app fetched server-side
type CouponRow = { id: string; code: string; discountPct: number; maxUses: number | null; usedCount: number; expiresAt: string | null };

const INITIAL_COUPONS: CouponRow[] = [
  { id: "cp1", code: "VERDA15", discountPct: 15, maxUses: 1000, usedCount: 234, expiresAt: "2027-12-31" },
  { id: "cp2", code: "VERDA20", discountPct: 20, maxUses: 500, usedCount: 87, expiresAt: "2027-06-30" },
  { id: "cp3", code: "WELCOME10", discountPct: 10, maxUses: null, usedCount: 412, expiresAt: null },
];

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponRow[]>(INITIAL_COUPONS);
  const [isPending, startTransition] = useTransition();
  const [alert, setAlert] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [code, setCode] = useState("");
  const [discountPct, setDiscountPct] = useState(10);
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  function showAlert(type: "ok" | "err", msg: string) {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 3500);
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await createCoupon({
        code,
        discountPct,
        maxUses: maxUses ? Number(maxUses) : undefined,
        expiresAt: expiresAt || undefined,
      });
      if (result.success) {
        setCoupons((prev) => [...prev, {
          id: `cp_${Date.now()}`,
          code: code.toUpperCase(),
          discountPct,
          maxUses: maxUses ? Number(maxUses) : null,
          usedCount: 0,
          expiresAt: expiresAt || null,
        }]);
        setCode(""); setDiscountPct(10); setMaxUses(""); setExpiresAt("");
        setShowForm(false);
        showAlert("ok", `สร้างโค้ด ${code.toUpperCase()} สำเร็จแล้ว`);
      } else {
        showAlert("err", result.error ?? "เกิดข้อผิดพลาด");
      }
    });
  }

  function handleDelete(code: string) {
    if (!confirm(`ลบโค้ด ${code} แน่ใจหรือไม่?`)) return;
    startTransition(async () => {
      const result = await deleteCoupon(code);
      if (result.success) {
        setCoupons((prev) => prev.filter((c) => c.code !== code));
        showAlert("ok", `ลบโค้ด ${code} แล้ว`);
      } else {
        showAlert("err", result.error ?? "เกิดข้อผิดพลาด");
      }
    });
  }

  const isExpired = (exp: string | null) => exp ? new Date(exp) < new Date() : false;

  return (
    <div className="max-w-[900px] mx-auto px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <EyebrowLabel className="mb-1">— COUPONS</EyebrowLabel>
          <h1 className="font-display text-[32px] text-ink tracking-[-0.015em]">โค้ดส่วนลด</h1>
        </div>
        <Button variant="primary" className="gap-2" onClick={() => setShowForm(!showForm)}>
          <Plus size={15} />
          สร้างโค้ดใหม่
        </Button>
      </div>

      {/* Alert */}
      {alert && (
        <div className={`flex items-center gap-2 text-[13px] rounded-r2 px-4 py-2.5 mb-5 ${alert.type === "ok" ? "bg-ok/10 border border-ok/20 text-ok" : "bg-danger/5 border border-danger/20 text-danger"}`}>
          {alert.type === "ok" ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          {alert.msg}
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="bg-paper-3 border border-viridian/30 rounded-r3 p-6 mb-6">
          <h2 className="font-semibold text-[15px] text-ink mb-4">สร้างโค้ดส่วนลดใหม่</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-ink mb-1.5">โค้ด <span className="text-danger">*</span></label>
              <input
                required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="เช่น SUMMER30"
                className="w-full border border-line rounded-r2 px-3.5 h-[40px] text-[14px] font-mono bg-paper focus:outline-none focus:border-viridian uppercase"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-ink mb-1.5">ส่วนลด (%) <span className="text-danger">*</span></label>
              <div className="relative">
                <Percent size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
                <input
                  type="number" required min={1} max={100} value={discountPct}
                  onChange={(e) => setDiscountPct(Number(e.target.value))}
                  className="w-full border border-line rounded-r2 pl-8 pr-3.5 h-[40px] text-[14px] bg-paper focus:outline-none focus:border-viridian"
                />
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-ink mb-1.5">จำกัดจำนวนใช้งาน</label>
              <div className="relative">
                <Users size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
                <input
                  type="number" min={1} value={maxUses} onChange={(e) => setMaxUses(e.target.value)}
                  placeholder="ไม่จำกัด"
                  className="w-full border border-line rounded-r2 pl-8 pr-3.5 h-[40px] text-[14px] bg-paper focus:outline-none focus:border-viridian"
                />
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-ink mb-1.5">วันหมดอายุ</label>
              <div className="relative">
                <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
                <input
                  type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                  className="w-full border border-line rounded-r2 pl-8 pr-3.5 h-[40px] text-[14px] bg-paper focus:outline-none focus:border-viridian"
                />
              </div>
            </div>
            <div className="col-span-2 flex gap-2 justify-end">
              <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>ยกเลิก</Button>
              <Button variant="primary" type="submit" disabled={isPending || !code.trim()}>
                {isPending ? "กำลังสร้าง..." : "สร้างโค้ด"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Coupon list */}
      <div className="stat-tile bg-paper-3 border border-line rounded-r3 overflow-hidden">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="border-b border-line bg-paper-2">
              <th className="text-left px-5 py-3 text-[11px] text-ink-3 font-mono uppercase tracking-wider">โค้ด</th>
              <th className="text-center px-4 py-3 text-[11px] text-ink-3 font-mono uppercase tracking-wider">ส่วนลด</th>
              <th className="text-center px-4 py-3 text-[11px] text-ink-3 font-mono uppercase tracking-wider">ใช้แล้ว / สูงสุด</th>
              <th className="text-center px-4 py-3 text-[11px] text-ink-3 font-mono uppercase tracking-wider">หมดอายุ</th>
              <th className="text-center px-4 py-3 text-[11px] text-ink-3 font-mono uppercase tracking-wider">สถานะ</th>
              <th className="w-10 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => {
              const expired = isExpired(c.expiresAt);
              const full = c.maxUses !== null && c.usedCount >= c.maxUses;
              const pctUsed = c.maxUses ? Math.round((c.usedCount / c.maxUses) * 100) : 0;

              return (
                <tr key={c.id} className="border-b border-line last:border-0 hover:bg-paper-2/40">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <Tag size={13} className="text-viridian" />
                      <span className="font-mono font-medium text-[14px] text-ink">{c.code}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="font-mono text-[15px] font-semibold text-viridian">{c.discountPct}%</span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <div>
                      <p className="font-mono text-[13px] text-ink">
                        {c.usedCount.toLocaleString()} / {c.maxUses?.toLocaleString() ?? "∞"}
                      </p>
                      {c.maxUses && (
                        <div className="mt-1 h-1 bg-line rounded-full overflow-hidden w-20 mx-auto">
                          <div className={`h-full rounded-full ${pctUsed > 80 ? "bg-danger" : "bg-viridian"}`} style={{ width: `${pctUsed}%` }} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center font-mono text-[12px] text-ink-3">
                    {c.expiresAt ? (
                      <span className={expired ? "text-danger" : ""}>{c.expiresAt}</span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {expired ? (
                      <span className="bg-line text-ink-3 font-mono text-[10px] px-2 py-0.5 rounded-pill uppercase">หมดอายุ</span>
                    ) : full ? (
                      <span className="bg-danger/10 text-danger font-mono text-[10px] px-2 py-0.5 rounded-pill uppercase">เต็ม</span>
                    ) : (
                      <span className="bg-ok/10 text-ok font-mono text-[10px] px-2 py-0.5 rounded-pill uppercase">Active</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <button onClick={() => handleDelete(c.code)} className="text-ink-4 hover:text-danger transition-colors p-1" title="ลบโค้ด">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
