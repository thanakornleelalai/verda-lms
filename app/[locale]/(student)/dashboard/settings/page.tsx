"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import { User, Mail, Lock, Bell, Shield, CheckCircle, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { Button } from "@/components/primitives/Button";
import { Avatar } from "@/components/primitives/Avatar";
import { updateProfile, changePassword, updateNotifications, deleteAccount } from "@/actions/user";
import { sendEmailVerification } from "@/actions/auth";

type Tab = "profile" | "password" | "notifications" | "privacy";

type AlertType = "success" | "error";
interface Alert { type: AlertType; message: string }

export default function StudentSettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [alert, setAlert] = useState<Alert | null>(null);
  const [isPending, startTransition] = useTransition();

  // Profile fields
  const [name, setName] = useState(session?.user?.name ?? "");
  const [bio, setBio] = useState("");
  const [headline, setHeadline] = useState("");
  const [website, setWebsite] = useState("");

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState({
    newLesson: true, quizReminder: true, newsletter: false, promotions: false,
  });

  // Delete account
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function showAlert(type: AlertType, message: string) {
    setAlert({ type, message });
    if (type === "success") setTimeout(() => setAlert(null), 3500);
  }

  // ── Profile save ────────────────────────────────────────────────────────────

  function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateProfile({ name, bio, headline, website });
      if (result.success) {
        showAlert("success", "บันทึกโปรไฟล์เรียบร้อยแล้ว");
        await updateSession({ name });
      } else {
        showAlert("error", result.error ?? "เกิดข้อผิดพลาด");
      }
    });
  }

  // ── Password save ───────────────────────────────────────────────────────────

  function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await changePassword({ currentPassword, newPassword, confirmPassword });
      if (result.success) {
        showAlert("success", "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว");
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      } else {
        showAlert("error", result.error ?? "เกิดข้อผิดพลาด");
      }
    });
  }

  // ── Notifications save ──────────────────────────────────────────────────────

  function handleNotificationSave(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateNotifications(notifications);
      if (result.success) showAlert("success", "บันทึกการตั้งค่าการแจ้งเตือนแล้ว");
      else showAlert("error", result.error ?? "เกิดข้อผิดพลาด");
    });
  }

  // ── Send email verification ─────────────────────────────────────────────────

  function handleSendVerification() {
    const email = session?.user?.email;
    if (!email) return;
    startTransition(async () => {
      const result = await sendEmailVerification(email);
      if (result.success) showAlert("success", "ส่งลิงก์ยืนยันไปยังอีเมลของคุณแล้ว");
      else showAlert("error", result.error ?? "เกิดข้อผิดพลาด");
    });
  }

  // ── Delete account ──────────────────────────────────────────────────────────

  function handleDeleteAccount() {
    if (!deletePassword) return;
    startTransition(async () => {
      const result = await deleteAccount(deletePassword);
      if (result.success) {
        showAlert("success", "ลบบัญชีเรียบร้อยแล้ว กำลังออกจากระบบ...");
        setTimeout(() => window.location.href = `/${locale}`, 2000);
      } else {
        showAlert("error", result.error ?? "เกิดข้อผิดพลาด");
      }
    });
  }

  // Password strength
  const pwStrength = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
  };
  const pwScore = Object.values(pwStrength).filter(Boolean).length;

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
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
          {/* Tab nav */}
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => { setActiveTab(id); setAlert(null); }}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-r2 text-[14px] text-left transition-colors whitespace-nowrap ${
                  activeTab === id ? "bg-viridian text-white" : "text-ink-2 hover:bg-paper-2 hover:text-ink"
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </nav>

          {/* Tab content */}
          <div className="bg-paper-3 border border-line rounded-r3 p-7">
            {/* Alert */}
            {alert && (
              <div className={`flex items-center gap-2 text-[13px] rounded-r2 px-4 py-2.5 mb-5 ${
                alert.type === "success"
                  ? "text-ok bg-ok/10 border border-ok/20"
                  : "text-danger bg-danger/5 border border-danger/20"
              }`}>
                {alert.type === "success" ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                {alert.message}
              </div>
            )}

            {/* ── Profile Tab ─────────────────────────────────────────────── */}
            {activeTab === "profile" && (
              <form onSubmit={handleProfileSave} className="flex flex-col gap-5">
                <h2 className="font-semibold text-[18px] text-ink mb-1">ข้อมูลส่วนตัว</h2>

                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <Avatar name={session?.user?.name ?? "U"} src={session?.user?.image ?? undefined} size="lg" />
                  <div>
                    <p className="text-[13px] font-medium text-ink">{session?.user?.name}</p>
                    <p className="text-[12px] text-ink-4 font-mono">{session?.user?.email}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-ink mb-1.5">ชื่อ-นามสกุล <span className="text-danger">*</span></label>
                  <input
                    type="text" required value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full border border-line rounded-r2 px-3.5 h-[42px] text-[14px] font-thai bg-paper focus:outline-none focus:border-viridian transition-colors"
                    placeholder="ชื่อ นามสกุล"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-[13px] font-medium text-ink mb-1.5">
                    อีเมล
                    <span className="font-mono text-[10px] text-ink-4 uppercase tracking-wider">(ไม่สามารถเปลี่ยนได้)</span>
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-4" />
                    <input type="email" value={session?.user?.email ?? ""} disabled
                      className="w-full border border-line rounded-r2 pl-10 pr-3.5 h-[42px] text-[14px] bg-paper-2 text-ink-3 cursor-not-allowed"
                    />
                  </div>
                  <button type="button" onClick={handleSendVerification}
                    className="mt-1.5 text-[12px] text-viridian hover:underline flex items-center gap-1">
                    ส่งลิงก์ยืนยันอีเมลอีกครั้ง
                  </button>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-ink mb-1.5">ตำแหน่ง / Headline</label>
                  <input
                    type="text" value={headline} onChange={(e) => setHeadline(e.target.value)}
                    placeholder="เช่น UX Designer | Freelancer"
                    className="w-full border border-line rounded-r2 px-3.5 h-[42px] text-[14px] bg-paper focus:outline-none focus:border-viridian transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-ink mb-1.5">แนะนำตัว</label>
                  <textarea
                    value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
                    placeholder="เล่าให้ฟังสั้นๆ ว่าคุณสนใจเรียนรู้อะไรบ้าง..."
                    className="w-full border border-line rounded-r2 px-3.5 py-2.5 text-[14px] font-thai bg-paper focus:outline-none focus:border-viridian resize-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-ink mb-1.5">Website</label>
                  <input
                    type="url" value={website} onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yoursite.com"
                    className="w-full border border-line rounded-r2 px-3.5 h-[42px] text-[14px] bg-paper focus:outline-none focus:border-viridian transition-colors"
                  />
                </div>

                <Button type="submit" variant="primary" className="w-fit gap-2" disabled={isPending}>
                  {isPending && <Loader2 size={14} className="animate-spin" />}
                  {isPending ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                </Button>
              </form>
            )}

            {/* ── Password Tab ─────────────────────────────────────────────── */}
            {activeTab === "password" && (
              <form onSubmit={handlePasswordSave} className="flex flex-col gap-5">
                <h2 className="font-semibold text-[18px] text-ink mb-1">เปลี่ยนรหัสผ่าน</h2>

                <div>
                  <label className="block text-[13px] font-medium text-ink mb-1.5">รหัสผ่านปัจจุบัน</label>
                  <div className="relative">
                    <input
                      type={showCurrent ? "text" : "password"} required value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full border border-line rounded-r2 px-3.5 pr-10 h-[42px] text-[14px] bg-paper focus:outline-none focus:border-viridian transition-colors"
                    />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-4 hover:text-ink">
                      {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-ink mb-1.5">รหัสผ่านใหม่</label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"} required value={newPassword} minLength={8}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full border border-line rounded-r2 px-3.5 pr-10 h-[42px] text-[14px] bg-paper focus:outline-none focus:border-viridian transition-colors"
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-4 hover:text-ink">
                      {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {newPassword && (
                    <div className="mt-2 flex gap-1">
                      {[1,2,3].map((i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full ${
                          i <= pwScore ? (pwScore >= 3 ? "bg-ok" : pwScore >= 2 ? "bg-warn" : "bg-danger") : "bg-line"
                        }`} />
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-ink mb-1.5">ยืนยันรหัสผ่านใหม่</label>
                  <input
                    type="password" required value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full border rounded-r2 px-3.5 h-[42px] text-[14px] bg-paper focus:outline-none transition-colors ${
                      confirmPassword && confirmPassword !== newPassword
                        ? "border-danger focus:border-danger"
                        : "border-line focus:border-viridian"
                    }`}
                  />
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p className="text-[12px] text-danger mt-1">รหัสผ่านไม่ตรงกัน</p>
                  )}
                </div>

                <p className="text-[12px] text-ink-4">รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร</p>

                <Button type="submit" variant="primary" className="w-fit gap-2"
                  disabled={isPending || !currentPassword || !newPassword || newPassword !== confirmPassword || newPassword.length < 8}>
                  {isPending && <Loader2 size={14} className="animate-spin" />}
                  {isPending ? "กำลังเปลี่ยน..." : "เปลี่ยนรหัสผ่าน"}
                </Button>
              </form>
            )}

            {/* ── Notifications Tab ─────────────────────────────────────────── */}
            {activeTab === "notifications" && (
              <form onSubmit={handleNotificationSave} className="flex flex-col gap-5">
                <h2 className="font-semibold text-[18px] text-ink mb-1">การแจ้งเตือน</h2>
                {([
                  { key: "newLesson" as const, label: "มีบทเรียนใหม่", desc: "แจ้งเมื่ออาจารย์เพิ่มเนื้อหาใหม่ในคอร์สที่ลงทะเบียน" },
                  { key: "quizReminder" as const, label: "เตือนทำ Quiz", desc: "เตือนเมื่อมี quiz ที่ยังไม่ได้ทำ" },
                  { key: "newsletter" as const, label: "จดหมายข่าว VERDA", desc: "คอร์สใหม่ บทความ และเคล็ดลับการเรียน" },
                  { key: "promotions" as const, label: "โปรโมชันและส่วนลด", desc: "รับข้อเสนอพิเศษจาก VERDA" },
                ]).map(({ key, label, desc }) => (
                  <label key={key} className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative mt-0.5 shrink-0">
                      <div
                        className={`w-10 h-6 rounded-full transition-colors cursor-pointer ${notifications[key] ? "bg-viridian" : "bg-line"}`}
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
                <Button type="submit" variant="primary" className="w-fit gap-2 mt-2" disabled={isPending}>
                  {isPending && <Loader2 size={14} className="animate-spin" />}
                  บันทึกการตั้งค่า
                </Button>
              </form>
            )}

            {/* ── Privacy Tab ───────────────────────────────────────────────── */}
            {activeTab === "privacy" && (
              <div className="flex flex-col gap-6">
                <h2 className="font-semibold text-[18px] text-ink mb-1">ความเป็นส่วนตัว</h2>

                {/* Privacy toggles */}
                {[
                  { label: "แสดงโปรไฟล์สาธารณะ", desc: "ผู้ใช้อื่นสามารถเห็นโปรไฟล์และคอร์สที่เรียนจบ" },
                  { label: "แสดงใน Leaderboard", desc: "ชื่อของคุณจะปรากฏในการจัดอันดับ" },
                ].map(({ label, desc }) => (
                  <div key={label} className="flex items-center justify-between p-4 bg-paper-2 rounded-r2 border border-line">
                    <div>
                      <p className="text-[14px] font-medium text-ink">{label}</p>
                      <p className="text-[12px] text-ink-3 font-thai">{desc}</p>
                    </div>
                    <div className="w-10 h-6 bg-viridian rounded-full relative cursor-pointer shrink-0">
                      <div className="w-4 h-4 rounded-full bg-white shadow-sm absolute top-1 left-5" />
                    </div>
                  </div>
                ))}

                {/* Danger zone */}
                <div className="border-t border-line pt-6">
                  <h3 className="font-semibold text-[15px] text-danger mb-3">Danger Zone</h3>
                  <p className="text-[13px] text-ink-3 font-thai mb-4">
                    การลบบัญชีจะลบข้อมูลทั้งหมดรวมถึงคอร์สที่ซื้อและใบประกาศ ไม่สามารถกู้คืนได้
                  </p>

                  {!showDeleteConfirm ? (
                    <Button
                      variant="ghost"
                      className="border-danger/30 text-danger hover:bg-danger/5"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      ลบบัญชีผู้ใช้
                    </Button>
                  ) : (
                    <div className="bg-danger/5 border border-danger/20 rounded-r2 p-4 flex flex-col gap-3">
                      <p className="text-[13px] font-medium text-danger">กรอกรหัสผ่านเพื่อยืนยัน</p>
                      <input
                        type="password" value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        placeholder="รหัสผ่านของคุณ"
                        className="w-full border border-danger/30 rounded-r2 px-3.5 h-[38px] text-[14px] bg-paper focus:outline-none focus:border-danger transition-colors"
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="ghost" size="sm"
                          className="border-danger/30 text-danger hover:bg-danger/10"
                          disabled={!deletePassword || isPending}
                          onClick={handleDeleteAccount}
                        >
                          {isPending ? "กำลังลบ..." : "ยืนยันการลบบัญชี"}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                          ยกเลิก
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
