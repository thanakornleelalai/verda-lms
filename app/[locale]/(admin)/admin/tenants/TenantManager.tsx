"use client";

import { useState, useTransition } from "react";
import { Building2, Plus, Trash2, Globe, CheckCircle, AlertCircle, Percent } from "lucide-react";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { Button } from "@/components/primitives/Button";
import { createTenant, deleteTenant, type Tenant } from "@/actions/admin";

const PLAN_BADGE: Record<string, string> = {
  starter: "bg-paper-2 text-ink-3",
  business: "bg-blue-50 text-blue-600",
  enterprise: "bg-viridian/10 text-viridian",
};

const inputCls = "w-full border border-line rounded-r2 px-3.5 h-[40px] text-[14px] font-thai bg-paper focus:outline-none focus:border-viridian transition-colors";

export function TenantManager({ initial }: { initial: Tenant[] }) {
  const [tenants, setTenants] = useState(initial);
  const [pending, start] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [alert, setAlert] = useState<{ ok: boolean; msg: string } | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", domain: "", plan: "starter", revenueShare: 70 });

  function notify(ok: boolean, msg: string) {
    setAlert({ ok, msg });
    if (ok) setTimeout(() => setAlert(null), 3500);
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const r = await createTenant(form);
      if (r.success) {
        setTenants((prev) => [...prev, {
          id: `tnt_${Date.now().toString(36)}`,
          slug: form.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
          name: form.name, domain: form.domain || null, plan: form.plan,
          revenueShare: form.revenueShare, createdAt: new Date().toISOString(),
        }]);
        setForm({ name: "", slug: "", domain: "", plan: "starter", revenueShare: 70 });
        setShowForm(false);
        notify(true, "สร้าง tenant สำเร็จแล้ว");
      } else notify(false, r.error ?? "เกิดข้อผิดพลาด");
    });
  }

  function handleDelete(id: string) {
    if (!confirm("ลบ tenant นี้แน่ใจหรือไม่?")) return;
    start(async () => {
      const r = await deleteTenant(id);
      if (r.success) { setTenants((prev) => prev.filter((t) => t.id !== id)); notify(true, "ลบ tenant แล้ว"); }
      else notify(false, r.error ?? "เกิดข้อผิดพลาด");
    });
  }

  return (
    <div className="max-w-[900px] mx-auto px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <EyebrowLabel className="mb-1">— TENANTS</EyebrowLabel>
          <h1 className="font-display text-[32px] text-ink tracking-[-0.015em]">องค์กร / White-label</h1>
          <p className="text-[14px] text-ink-3 mt-1 font-thai">จัดการองค์กรพันธมิตรและส่วนแบ่งรายได้</p>
        </div>
        <Button variant="primary" className="gap-2" onClick={() => setShowForm(!showForm)}>
          <Plus size={15} />เพิ่มองค์กร
        </Button>
      </div>

      {alert && (
        <div className={`flex items-center gap-2 text-[13px] rounded-r2 px-4 py-2.5 mb-5 ${alert.ok ? "bg-ok/10 border border-ok/20 text-ok" : "bg-danger/5 border border-danger/20 text-danger"}`}>
          {alert.ok ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          {alert.msg}
        </div>
      )}

      {showForm && (
        <form onSubmit={save} className="bg-paper-3 border border-viridian/30 rounded-r3 p-6 mb-6">
          <h2 className="font-semibold text-[15px] text-ink mb-4">เพิ่มองค์กรใหม่</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-ink mb-1.5">ชื่อองค์กร *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-ink mb-1.5">Slug *</label>
              <input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="my-org" className={`${inputCls} font-mono`} />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-ink mb-1.5">Custom Domain</label>
              <input value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} placeholder="learn.example.com" className={`${inputCls} font-mono`} />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-ink mb-1.5">แผน</label>
              <select value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} className={inputCls}>
                <option value="starter">Starter</option>
                <option value="business">Business</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-ink mb-1.5">ส่วนแบ่งรายได้องค์กร (%)</label>
              <div className="relative">
                <Percent size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
                <input type="number" min={0} max={100} value={form.revenueShare}
                  onChange={(e) => setForm({ ...form, revenueShare: Number(e.target.value) })}
                  className={`${inputCls} pl-8`} />
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>ยกเลิก</Button>
            <Button type="submit" variant="primary" disabled={pending || !form.name.trim() || !form.slug.trim()}>
              {pending ? "กำลังสร้าง..." : "สร้างองค์กร"}
            </Button>
          </div>
        </form>
      )}

      <div className="stat-tile bg-paper-3 border border-line rounded-r3 overflow-hidden">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="border-b border-line bg-paper-2">
              <th className="text-left px-5 py-3 text-[11px] text-ink-3 font-mono uppercase tracking-wider">องค์กร</th>
              <th className="text-left px-4 py-3 text-[11px] text-ink-3 font-mono uppercase tracking-wider">Domain</th>
              <th className="text-center px-4 py-3 text-[11px] text-ink-3 font-mono uppercase tracking-wider">แผน</th>
              <th className="text-center px-4 py-3 text-[11px] text-ink-3 font-mono uppercase tracking-wider">ส่วนแบ่ง</th>
              <th className="w-10 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {tenants.map((t) => (
              <tr key={t.id} className="border-b border-line last:border-0 hover:bg-paper-2/40">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-r2 bg-viridian/10 flex items-center justify-center shrink-0">
                      <Building2 size={15} className="text-viridian" />
                    </div>
                    <div>
                      <p className="font-medium text-[14px] text-ink">{t.name}</p>
                      <p className="font-mono text-[11px] text-ink-4">/{t.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  {t.domain ? (
                    <span className="flex items-center gap-1.5 font-mono text-[12px] text-ink-2">
                      <Globe size={12} className="text-ink-4" />{t.domain}
                    </span>
                  ) : <span className="text-ink-4 text-[12px]">—</span>}
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span className={`font-mono text-[10px] px-2 py-0.5 rounded-pill uppercase ${PLAN_BADGE[t.plan] ?? PLAN_BADGE.starter}`}>{t.plan}</span>
                </td>
                <td className="px-4 py-3.5 text-center font-mono text-[13px] text-viridian tabular">{t.revenueShare}%</td>
                <td className="px-4 py-3.5 text-center">
                  {t.id !== "tnt_001" && (
                    <button onClick={() => handleDelete(t.id)} className="text-ink-4 hover:text-danger transition-colors p-1" title="ลบ">
                      <Trash2 size={14} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
