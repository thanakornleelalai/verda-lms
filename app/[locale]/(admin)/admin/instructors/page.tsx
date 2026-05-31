"use client";

export const dynamic = "force-dynamic";

import { useState, useTransition, useEffect } from "react";
import {
  CheckCircle, XCircle, Clock, User, ExternalLink, ChevronDown, ChevronUp,
  AlertCircle, Loader2, Globe, Linkedin,
} from "lucide-react";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { Button } from "@/components/primitives/Button";
import {
  getInstructorApplications,
  approveInstructorApplication,
  rejectInstructorApplication,
} from "@/actions/instructor-application";

type Application = {
  id: string;
  userId: string;
  status: string;
  fullName: string;
  email: string;
  headline: string;
  expertise: string;
  bio: string;
  experience: string;
  courseIdea: string;
  linkedIn?: string | null;
  website?: string | null;
  portfolio?: string | null;
  reviewNote?: string | null;
  createdAt: string;
};

const STATUS_CONFIG = {
  PENDING:  { label: "รอตรวจสอบ", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  APPROVED: { label: "อนุมัติแล้ว", color: "bg-ok/10 text-ok border-ok/20", icon: CheckCircle },
  REJECTED: { label: "ไม่อนุมัติ", color: "bg-danger/10 text-danger border-danger/20", icon: XCircle },
};

const FILTER_OPTIONS = [
  { value: "all", label: "ทั้งหมด" },
  { value: "PENDING", label: "รอตรวจสอบ" },
  { value: "APPROVED", label: "อนุมัติแล้ว" },
  { value: "REJECTED", label: "ไม่อนุมัติ" },
];

export default function AdminInstructorsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function showAlert(type: "ok" | "err", msg: string) {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 4000);
  }

  useEffect(() => {
    setLoading(true);
    getInstructorApplications(filter === "all" ? undefined : filter)
      .then((data) => setApps(data as Application[]))
      .catch(() => setApps([]))
      .finally(() => setLoading(false));
  }, [filter]);

  function handleApprove(id: string) {
    startTransition(async () => {
      const res = await approveInstructorApplication(id, reviewNote[id]);
      if (res.success) {
        setApps((prev) => prev.filter((a) => a.id !== id));
        showAlert("ok", "อนุมัติผู้สอนเรียบร้อย — role เปลี่ยนเป็น INSTRUCTOR แล้ว");
        setExpanded(null);
      } else {
        showAlert("err", res.error ?? "เกิดข้อผิดพลาด");
      }
    });
  }

  function handleReject(id: string) {
    const note = reviewNote[id]?.trim();
    if (!note) { showAlert("err", "กรุณากรอกเหตุผลที่ไม่อนุมัติ"); return; }
    startTransition(async () => {
      const res = await rejectInstructorApplication(id, note);
      if (res.success) {
        setApps((prev) => prev.filter((a) => a.id !== id));
        showAlert("ok", "ส่งผลการพิจารณาแล้ว");
        setExpanded(null);
      } else {
        showAlert("err", res.error ?? "เกิดข้อผิดพลาด");
      }
    });
  }

  const pending = apps.filter((a) => a.status === "PENDING").length;

  return (
    <div className="p-8 max-w-[1000px]">
      <div className="mb-8">
        <EyebrowLabel className="mb-1">ADMIN / INSTRUCTORS</EyebrowLabel>
        <h1 className="font-display text-[32px] text-ink tracking-[-0.015em]">ใบสมัครผู้สอน</h1>
        <p className="text-[14px] text-ink-3 mt-1">
          ตรวจสอบและอนุมัติผู้สมัครเป็น Instructor
          {pending > 0 && (
            <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-pill bg-amber-100 text-amber-700 text-[12px] font-semibold">
              <Clock size={11} /> {pending} รอตรวจสอบ
            </span>
          )}
        </p>
      </div>

      {alert && (
        <div className={`flex items-center gap-2 text-[13px] rounded-r2 px-4 py-2.5 mb-5 ${
          alert.type === "ok" ? "bg-ok/10 border border-ok/20 text-ok" : "bg-danger/5 border border-danger/20 text-danger"
        }`}>
          {alert.type === "ok" ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          {alert.msg}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTER_OPTIONS.map(({ value, label }) => (
          <button key={value} onClick={() => setFilter(value as typeof filter)}
            className={`px-4 py-1.5 rounded-pill text-[13px] border transition-colors ${
              filter === value ? "bg-viridian text-white border-viridian" : "border-line text-ink-3 hover:border-viridian-3 hover:text-ink"
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-ink-3 gap-2">
          <Loader2 size={18} className="animate-spin" />
          <span>กำลังโหลด...</span>
        </div>
      )}

      {/* Empty */}
      {!loading && apps.length === 0 && (
        <div className="text-center py-16 border border-dashed border-line rounded-r3">
          <User size={32} className="mx-auto mb-3 text-ink-4 opacity-40" />
          <p className="text-[14px] text-ink-3">
            {filter === "PENDING" ? "ไม่มีใบสมัครรอตรวจสอบ" : "ไม่พบข้อมูล"}
          </p>
        </div>
      )}

      {/* Application cards */}
      <div className="flex flex-col gap-3">
        {apps.map((app) => {
          const cfg = STATUS_CONFIG[app.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.PENDING;
          const StatusIcon = cfg.icon;
          const isOpen = expanded === app.id;
          return (
            <div key={app.id} className={`border rounded-r3 overflow-hidden transition-all ${
              app.status === "PENDING" ? "border-amber-200 bg-amber-50/30" : "border-line bg-paper-3"
            }`}>
              {/* Card header */}
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="w-10 h-10 rounded-full bg-viridian/10 flex items-center justify-center shrink-0">
                  <User size={16} className="text-viridian" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="font-semibold text-[15px] text-ink">{app.fullName}</p>
                    <span className={`inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-pill border uppercase ${cfg.color}`}>
                      <StatusIcon size={10} /> {cfg.label}
                    </span>
                  </div>
                  <p className="text-[13px] text-ink-3">{app.headline}</p>
                  <div className="flex items-center gap-3 mt-1 text-[12px] text-ink-4">
                    <span>{app.email}</span>
                    <span className="font-mono bg-paper-2 px-1.5 py-0.5 rounded text-[10px]">{app.expertise}</span>
                    <span>{new Date(app.createdAt).toLocaleDateString("th-TH")}</span>
                  </div>
                </div>
                <button onClick={() => setExpanded(isOpen ? null : app.id)}
                  className="flex items-center gap-1 text-[12px] text-ink-3 hover:text-ink transition-colors shrink-0 px-2 py-1">
                  {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  {isOpen ? "ซ่อน" : "ดูรายละเอียด"}
                </button>
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div className="border-t border-line/60 p-5 bg-paper flex flex-col gap-5">
                  <div className="grid grid-cols-2 gap-5">
                    <DetailBlock label="แนะนำตัว" value={app.bio} />
                    <DetailBlock label="ประสบการณ์" value={app.experience} />
                  </div>
                  <DetailBlock label="ไอเดียคอร์สแรก" value={app.courseIdea} />

                  {/* Links */}
                  {(app.linkedIn || app.website || app.portfolio) && (
                    <div className="flex flex-wrap gap-3">
                      {app.linkedIn && (
                        <a href={app.linkedIn.startsWith("http") ? app.linkedIn : `https://${app.linkedIn}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-[12px] text-sky-600 hover:underline">
                          <Linkedin size={13} /> LinkedIn
                        </a>
                      )}
                      {app.website && (
                        <a href={app.website.startsWith("http") ? app.website : `https://${app.website}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-[12px] text-viridian hover:underline">
                          <Globe size={13} /> Website
                        </a>
                      )}
                      {app.portfolio && (
                        <a href={app.portfolio.startsWith("http") ? app.portfolio : `https://${app.portfolio}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-[12px] text-ink-3 hover:underline">
                          <ExternalLink size={13} /> Portfolio
                        </a>
                      )}
                    </div>
                  )}

                  {/* Review note + actions (pending only) */}
                  {app.status === "PENDING" && (
                    <div className="border-t border-line pt-4 flex flex-col gap-3">
                      <div>
                        <label className="block text-[12px] font-medium text-ink mb-1.5">
                          หมายเหตุสำหรับผู้สมัคร (จำเป็นถ้าไม่อนุมัติ)
                        </label>
                        <textarea rows={2} className="input-base resize-none text-[13px] w-full"
                          placeholder="เช่น กรุณาเพิ่มรายละเอียดประสบการณ์ หรือแนะนำให้ปรับ course idea..."
                          value={reviewNote[app.id] ?? ""}
                          onChange={(e) => setReviewNote((prev) => ({ ...prev, [app.id]: e.target.value }))} />
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleReject(app.id)} disabled={isPending}
                          className="flex items-center gap-1.5 px-4 py-2 border border-line rounded-r2 text-[13px] text-ink-3 hover:border-danger hover:text-danger transition-colors disabled:opacity-50">
                          <XCircle size={14} /> ไม่อนุมัติ
                        </button>
                        <Button variant="primary" onClick={() => handleApprove(app.id)} disabled={isPending}
                          className="flex items-center gap-2">
                          {isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                          อนุมัติเป็น Instructor
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Approved / rejected note */}
                  {app.status !== "PENDING" && app.reviewNote && (
                    <div className="border-t border-line pt-3">
                      <p className="text-[12px] text-ink-4 font-mono mb-1">หมายเหตุ</p>
                      <p className="text-[13px] text-ink-2">{app.reviewNote}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-mono text-ink-4 uppercase tracking-wider mb-1.5">{label}</p>
      <p className="text-[13px] text-ink-2 font-thai leading-relaxed whitespace-pre-line">{value}</p>
    </div>
  );
}
