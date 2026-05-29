"use client";

import { useState, useTransition } from "react";
import { Bell, Plus, Trash2, Eye, EyeOff, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { Button } from "@/components/primitives/Button";
import { createAnnouncement, toggleAnnouncement, deleteAnnouncement } from "@/actions/admin";
import type { Announcement } from "@/actions/admin";

const INITIAL: Announcement[] = [
  {
    id: "ann_001",
    title: "ยินดีต้อนรับสู่ VERDA LMS v1.0",
    body: "แพลตฟอร์มเรียนออนไลน์ของเราพร้อมให้บริการแล้ว!",
    type: "success",
    active: true,
    createdAt: new Date("2026-05-01").toISOString(),
    expiresAt: null,
  },
];

const TYPE_CONFIG = {
  info: { label: "ข้อมูล", icon: Info, color: "bg-blue-50 border-blue-200 text-blue-700" },
  success: { label: "สำเร็จ", icon: CheckCircle, color: "bg-ok/10 border-ok/20 text-ok" },
  warn: { label: "แจ้งเตือน", icon: AlertTriangle, color: "bg-warn/10 border-warn/20 text-warn" },
  danger: { label: "สำคัญ", icon: AlertCircle, color: "bg-danger/10 border-danger/20 text-danger" },
} as const;

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>(INITIAL);
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [alert, setAlert] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState<Announcement["type"]>("info");
  const [expiresAt, setExpiresAt] = useState("");

  function showAlert(t: "ok" | "err", msg: string) {
    setAlert({ type: t, msg });
    setTimeout(() => setAlert(null), 3500);
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await createAnnouncement({ title, body, type, expiresAt: expiresAt || undefined });
      if (result.success) {
        const newItem: Announcement = {
          id: `ann_${Date.now()}`,
          title, body, type, active: true,
          createdAt: new Date().toISOString(),
          expiresAt: expiresAt || null,
        };
        setItems((prev) => [newItem, ...prev]);
        setTitle(""); setBody(""); setType("info"); setExpiresAt("");
        setShowForm(false);
        showAlert("ok", "สร้างประกาศสำเร็จแล้ว");
      } else {
        showAlert("err", result.error ?? "เกิดข้อผิดพลาด");
      }
    });
  }

  function handleToggle(id: string) {
    startTransition(async () => {
      await toggleAnnouncement(id);
      setItems((prev) => prev.map((a) => a.id === id ? { ...a, active: !a.active } : a));
    });
  }

  function handleDelete(id: string) {
    if (!confirm("ลบประกาศนี้แน่ใจหรือไม่?")) return;
    startTransition(async () => {
      await deleteAnnouncement(id);
      setItems((prev) => prev.filter((a) => a.id !== id));
      showAlert("ok", "ลบประกาศแล้ว");
    });
  }

  return (
    <div className="max-w-[860px] mx-auto px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <EyebrowLabel className="mb-1">— ANNOUNCEMENTS</EyebrowLabel>
          <h1 className="font-display text-[32px] text-ink tracking-[-0.015em]">ประกาศแพลตฟอร์ม</h1>
          <p className="text-[14px] text-ink-3 mt-1 font-thai">แสดงใน TopBar ให้ผู้ใช้ทุกคนเห็น</p>
        </div>
        <Button variant="primary" className="gap-2" onClick={() => setShowForm(!showForm)}>
          <Plus size={15} />สร้างประกาศ
        </Button>
      </div>

      {alert && (
        <div className={`flex items-center gap-2 text-[13px] rounded-r2 px-4 py-2.5 mb-5 ${alert.type === "ok" ? "bg-ok/10 border border-ok/20 text-ok" : "bg-danger/5 border border-danger/20 text-danger"}`}>
          {alert.type === "ok" ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          {alert.msg}
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="bg-paper-3 border border-viridian/30 rounded-r3 p-6 mb-6">
          <h2 className="font-semibold text-[15px] text-ink mb-4">สร้างประกาศใหม่</h2>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-medium text-ink mb-1.5">หัวข้อ *</label>
                <input required value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="หัวข้อประกาศ" className="w-full border border-line rounded-r2 px-3.5 h-[40px] text-[14px] font-thai bg-paper focus:outline-none focus:border-viridian" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-ink mb-1.5">ประเภท</label>
                  <select value={type} onChange={(e) => setType(e.target.value as Announcement["type"])}
                    className="w-full border border-line rounded-r2 px-3 h-[40px] text-[13px] bg-paper focus:outline-none focus:border-viridian">
                    {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-ink mb-1.5">หมดอายุ</label>
                  <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)}
                    min={new Date().toISOString().slice(0, 10)}
                    className="w-full border border-line rounded-r2 px-3 h-[40px] text-[13px] bg-paper focus:outline-none focus:border-viridian" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-ink mb-1.5">เนื้อหา *</label>
              <textarea required value={body} onChange={(e) => setBody(e.target.value)} rows={2}
                placeholder="เนื้อหาของประกาศ..."
                className="w-full border border-line rounded-r2 px-3.5 py-2.5 text-[14px] font-thai bg-paper focus:outline-none focus:border-viridian resize-none" />
            </div>

            {/* Preview */}
            {title && body && (
              <div className={`p-3.5 border rounded-r2 flex items-start gap-3 ${TYPE_CONFIG[type].color}`}>
                {(() => { const Ic = TYPE_CONFIG[type].icon; return <Ic size={15} className="shrink-0 mt-0.5" />; })()}
                <div>
                  <p className="font-semibold text-[13px]">{title}</p>
                  <p className="text-[12px] opacity-80 mt-0.5">{body}</p>
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>ยกเลิก</Button>
              <Button variant="primary" type="submit" disabled={isPending || !title || !body}>
                {isPending ? "กำลังสร้าง..." : "สร้างประกาศ"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="flex flex-col gap-3">
        {items.length === 0 && (
          <div className="text-center py-12 text-ink-3">
            <Bell size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-[14px]">ยังไม่มีประกาศ</p>
          </div>
        )}
        {items.map((ann) => {
          const cfg = TYPE_CONFIG[ann.type];
          const Ic = cfg.icon;
          return (
            <div key={ann.id} className={`border rounded-r3 p-4 ${ann.active ? "bg-paper-3" : "bg-paper-2 opacity-60"}`}>
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-r2 flex items-center justify-center shrink-0 ${cfg.color}`}>
                  <Ic size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-[14px] text-ink">{ann.title}</p>
                    <span className={`font-mono text-[9px] px-2 py-0.5 rounded-pill uppercase ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    {!ann.active && (
                      <span className="font-mono text-[9px] px-2 py-0.5 rounded-pill bg-line text-ink-3 uppercase">ซ่อน</span>
                    )}
                  </div>
                  <p className="text-[13px] text-ink-2 font-thai">{ann.body}</p>
                  <p className="font-mono text-[10px] text-ink-4 mt-1.5">
                    {new Date(ann.createdAt).toLocaleDateString("th-TH")}
                    {ann.expiresAt && ` · หมดอายุ ${new Date(ann.expiresAt).toLocaleDateString("th-TH")}`}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleToggle(ann.id)} className="w-8 h-8 rounded-r2 flex items-center justify-center text-ink-3 hover:bg-paper-2 transition-colors" title={ann.active ? "ซ่อน" : "แสดง"}>
                    {ann.active ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button onClick={() => handleDelete(ann.id)} className="w-8 h-8 rounded-r2 flex items-center justify-center text-ink-3 hover:text-danger hover:bg-danger/5 transition-colors" title="ลบ">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
