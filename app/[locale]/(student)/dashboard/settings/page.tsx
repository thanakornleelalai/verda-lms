"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { User, Mail, Lock, Bell, Shield, CheckCircle, Camera } from "lucide-react";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { Button } from "@/components/primitives/Button";
import { Avatar } from "@/components/primitives/Avatar";

type Tab = "profile" | "password" | "notifications" | "privacy";

export default function StudentSettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(session?.user?.name ?? "");
  const [bio, setBio] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notifications, setNotifications] = useState({
    newLesson: true,
    quizReminder: true,
    newsletter: false,
    promotions: false,
  });

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    startTransition(async () => {
      await new Promise((r) => setTimeout(r, 600));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  const TABS: { id: Tab; label: string; icon: typeof User }[] = [
    { id: "profile", label: "โปรไฟล์", icon: User },
    { id: "password", label: "รหัสผ่าน", icon: Lock },
    { id: "notifications", label: "การแจ้งเตือน", icon: Bell },
    { id: "privacy", label: "ความเป็นส่วนตัว", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-paper">
      <div className="border-b border-line bg-paper-3">
        <div className="max-w-[900px] mx-auto px-8 py-6">
          <EyebrowLabel className="mb-1">DASHBOARD</EyebrowLabel>
          <h1 className="font-display text-[32px] text-ink tracking-[-0.015em]">ตั้งค่าบัญชี</h1>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-8 py-8">
        <div className="grid grid-cols-[200px_1fr] gap-8">
          {/* Tab nav */}
          <nav className="flex flex-col gap-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-r2 text-[14px] text-left transition-colors ${
                  activeTab === id
                    ? "bg-viridian text-white"
                    : "text-ink-2 hover:bg-paper-2 hover:text-ink"
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </nav>

          {/* Tab content */}
          <div className="bg-paper-3 border border-line rounded-r3 p-7">
            {saved && (
              <div className="flex items-center gap-2 text-ok text-[13px] bg-ok/10 border border-ok/20 rounded-r2 px-4 py-2.5 mb-5">
                <CheckCircle size={15} />
                บันทึกเรียบร้อยแล้ว
              </div>
            )}

            {activeTab === "profile" && (
              <form onSubmit={handleSave} className="flex flex-col gap-5">
                <h2 className="font-semibold text-[18px] text-ink mb-1">ข้อมูลส่วนตัว</h2>

                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar name={session?.user?.name ?? "U"} src={session?.user?.image ?? undefined} size="lg" />
                    <button
                      type="button"
                      className="absolute -bottom-1 -right-1 w-7 h-7 bg-viridian rounded-full flex items-center justify-center shadow-sm hover:bg-viridian-2 transition-colors"
                    >
                      <Camera size={13} className="text-white" />
                    </button>
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-ink">{session?.user?.name}</p>
                    <p className="text-[12px] text-ink-4 font-mono">{session?.user?.email}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-ink mb-1.5">ชื่อ-นามสกุล</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-line rounded-r2 px-3.5 h-[42px] text-[14px] font-thai bg-paper focus:outline-none focus:border-viridian transition-colors"
                    placeholder="ชื่อ นามสกุล"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-ink mb-1.5">
                    อีเมล
                    <span className="ml-2 font-mono text-[10px] text-ink-4 uppercase tracking-wider">(ไม่สามารถเปลี่ยนได้)</span>
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-4" />
                    <input
                      type="email"
                      value={session?.user?.email ?? ""}
                      disabled
                      className="w-full border border-line rounded-r2 pl-10 pr-3.5 h-[42px] text-[14px] bg-paper-2 text-ink-3 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-ink mb-1.5">แนะนำตัว</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    placeholder="เล่าให้ฟังสั้นๆ ว่าคุณสนใจเรียนรู้อะไรบ้าง..."
                    className="w-full border border-line rounded-r2 px-3.5 py-2.5 text-[14px] font-thai bg-paper focus:outline-none focus:border-viridian resize-none transition-colors"
                  />
                </div>

                <Button type="submit" variant="primary" className="w-fit" disabled={isPending}>
                  {isPending ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                </Button>
              </form>
            )}

            {activeTab === "password" && (
              <form onSubmit={handleSave} className="flex flex-col gap-5">
                <h2 className="font-semibold text-[18px] text-ink mb-1">เปลี่ยนรหัสผ่าน</h2>

                {[
                  { label: "รหัสผ่านปัจจุบัน", value: currentPassword, onChange: setCurrentPassword },
                  { label: "รหัสผ่านใหม่", value: newPassword, onChange: setNewPassword },
                  { label: "ยืนยันรหัสผ่านใหม่", value: confirmPassword, onChange: setConfirmPassword },
                ].map(({ label, value, onChange }) => (
                  <div key={label}>
                    <label className="block text-[13px] font-medium text-ink mb-1.5">{label}</label>
                    <input
                      type="password"
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                      minLength={label.includes("ใหม่") ? 8 : undefined}
                      className="w-full border border-line rounded-r2 px-3.5 h-[42px] text-[14px] bg-paper focus:outline-none focus:border-viridian transition-colors"
                    />
                  </div>
                ))}

                <p className="text-[12px] text-ink-4 font-thai">รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร</p>
                <Button type="submit" variant="primary" className="w-fit" disabled={isPending || !currentPassword || !newPassword || newPassword !== confirmPassword}>
                  {isPending ? "กำลังบันทึก..." : "เปลี่ยนรหัสผ่าน"}
                </Button>
              </form>
            )}

            {activeTab === "notifications" && (
              <form onSubmit={handleSave} className="flex flex-col gap-5">
                <h2 className="font-semibold text-[18px] text-ink mb-1">การแจ้งเตือน</h2>

                {[
                  { key: "newLesson" as const, label: "มีบทเรียนใหม่ในคอร์สที่ลงทะเบียน", desc: "แจ้งเมื่ออาจารย์เพิ่มเนื้อหาใหม่" },
                  { key: "quizReminder" as const, label: "เตือนทำ Quiz", desc: "เตือนเมื่อมี quiz ที่ยังไม่ได้ทำ" },
                  { key: "newsletter" as const, label: "จดหมายข่าว VERDA", desc: "คอร์สใหม่ บทความ และเคล็ดลับการเรียน" },
                  { key: "promotions" as const, label: "โปรโมชันและส่วนลด", desc: "รับข้อเสนอพิเศษจาก VERDA" },
                ].map(({ key, label, desc }) => (
                  <label key={key} className="flex items-start gap-3 cursor-pointer">
                    <div className="relative mt-0.5">
                      <input
                        type="checkbox"
                        checked={notifications[key]}
                        onChange={(e) => setNotifications((n) => ({ ...n, [key]: e.target.checked }))}
                        className="sr-only"
                      />
                      <div
                        className={`w-10 h-6 rounded-full transition-colors ${notifications[key] ? "bg-viridian" : "bg-line"}`}
                        onClick={() => setNotifications((n) => ({ ...n, [key]: !n[key] }))}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white shadow-sm absolute top-1 transition-all ${notifications[key] ? "left-5" : "left-1"}`} />
                      </div>
                    </div>
                    <div>
                      <p className="text-[14px] font-medium text-ink">{label}</p>
                      <p className="text-[12px] text-ink-3 font-thai">{desc}</p>
                    </div>
                  </label>
                ))}

                <Button type="submit" variant="primary" className="w-fit mt-2" disabled={isPending}>
                  {isPending ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
                </Button>
              </form>
            )}

            {activeTab === "privacy" && (
              <div className="flex flex-col gap-6">
                <h2 className="font-semibold text-[18px] text-ink mb-1">ความเป็นส่วนตัว</h2>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between p-4 bg-paper-2 rounded-r2 border border-line">
                    <div>
                      <p className="text-[14px] font-medium text-ink">แสดงโปรไฟล์สาธารณะ</p>
                      <p className="text-[12px] text-ink-3 font-thai">ผู้ใช้อื่นสามารถเห็นโปรไฟล์และคอร์สที่เรียนจบ</p>
                    </div>
                    <div className="w-10 h-6 bg-viridian rounded-full relative cursor-pointer">
                      <div className="w-4 h-4 rounded-full bg-white shadow-sm absolute top-1 left-5 transition-all" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-paper-2 rounded-r2 border border-line">
                    <div>
                      <p className="text-[14px] font-medium text-ink">แสดงใน Leaderboard</p>
                      <p className="text-[12px] text-ink-3 font-thai">ชื่อของคุณจะปรากฏในการจัดอันดับ</p>
                    </div>
                    <div className="w-10 h-6 bg-viridian rounded-full relative cursor-pointer">
                      <div className="w-4 h-4 rounded-full bg-white shadow-sm absolute top-1 left-5 transition-all" />
                    </div>
                  </div>
                </div>

                <div className="border-t border-line pt-6">
                  <h3 className="font-semibold text-[15px] text-danger mb-3">Danger Zone</h3>
                  <Button variant="ghost" className="border-danger/30 text-danger hover:bg-danger/5">
                    ลบบัญชีผู้ใช้
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
