"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Video, FileText, CheckCircle, Trash2, Youtube,
  HardDrive, Link2, Eye, Save, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { updateLesson, deleteLesson } from "@/actions/studio";
import { parseVideoInput, videoEmbedUrl, providerLabel } from "@/lib/video-url";

export type LessonEditorData = {
  id: string;
  title: string;
  type: string;
  content: string;
  /** Stored token: "yt:<id>" | "gd:<id>" | "" */
  videoAsset: string;
  isFree: boolean;
  durationMin: number;
  /** Days after enrollment before this lesson unlocks (0 = immediately) */
  dripDays: number;
};

type LessonType = "VIDEO" | "ARTICLE";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-ink mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-ink-4 mt-1.5 font-thai leading-relaxed">{hint}</p>}
    </div>
  );
}

export function LessonEditor({
  lesson,
  courseId,
  courseSlug,
  locale,
}: {
  lesson: LessonEditorData;
  courseId: string;
  courseSlug: string;
  locale: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  // Normalise non-video/article types (e.g. QUIZ/LIVE) into the two we edit here.
  const initialType: LessonType = lesson.type === "ARTICLE" ? "ARTICLE" : "VIDEO";

  const [type, setType] = useState<LessonType>(initialType);
  const [title, setTitle] = useState(lesson.title);
  const [content, setContent] = useState(lesson.content);
  const [videoUrl, setVideoUrl] = useState(lesson.videoAsset);
  const [isFree, setIsFree] = useState(lesson.isFree);
  const [durationMin, setDurationMin] = useState(lesson.durationMin);
  const [dripDays, setDripDays] = useState(lesson.dripDays);

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Live parse of the pasted video link.
  const parsedVideo = useMemo(() => parseVideoInput(videoUrl), [videoUrl]);
  const embedUrl = parsedVideo ? videoEmbedUrl(parsedVideo.token) : null;
  const videoUrlInvalid = videoUrl.trim().length > 0 && !parsedVideo;

  function handleSave() {
    setError("");
    setSaved(false);

    if (!title.trim()) {
      setError("กรุณากรอกชื่อบทเรียน");
      return;
    }
    if (type === "VIDEO" && videoUrlInvalid) {
      setError("ลิงก์วิดีโอไม่ถูกต้อง — รองรับเฉพาะ YouTube หรือ Google Drive");
      return;
    }

    startTransition(async () => {
      const result = await updateLesson(lesson.id, courseId, {
        title: title.trim(),
        type,
        content: type === "ARTICLE" ? content : "",
        // Persist the normalised token (or clear it when blank).
        videoAsset: type === "VIDEO" ? (parsedVideo?.token ?? "") : "",
        isFree,
        duration: Math.max(0, Math.round(durationMin)) * 60,
        drip: Math.max(0, Math.round(dripDays)) || null,
      });

      if (result.error && result.error !== "DB unavailable") {
        setError(result.error);
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!confirm("ต้องการลบบทเรียนนี้ใช่หรือไม่? การลบไม่สามารถย้อนกลับได้")) return;
    startDelete(async () => {
      await deleteLesson(lesson.id, courseId);
      router.push(`/${locale}/studio/courses/${courseSlug}/edit`);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 bg-danger/5 border border-danger/20 text-danger text-[13px] rounded-r2 px-4 py-2.5">
          <AlertCircle size={15} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Lesson type selector */}
      <div className="bg-paper-3 border border-line rounded-r3 p-6">
        <h2 className="font-semibold text-[16px] text-ink mb-4">ประเภทบทเรียน</h2>
        <div className="grid grid-cols-2 gap-3">
          {([
            { value: "VIDEO" as const, label: "วิดีโอ", desc: "YouTube หรือ Google Drive", icon: Video },
            { value: "ARTICLE" as const, label: "บทความ", desc: "เนื้อหาแบบข้อความ", icon: FileText },
          ]).map(({ value, label, desc, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setType(value)}
              className={`flex items-start gap-3 p-4 rounded-r2 border text-left transition-all ${
                type === value
                  ? "border-viridian bg-viridian-wash"
                  : "border-line bg-paper hover:border-ink-4"
              }`}
            >
              <Icon size={20} className={type === value ? "text-viridian shrink-0 mt-0.5" : "text-ink-3 shrink-0 mt-0.5"} />
              <div>
                <p className={`text-[14px] font-medium ${type === value ? "text-viridian" : "text-ink"}`}>{label}</p>
                <p className="text-[12px] text-ink-3 mt-0.5">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Lesson basics */}
      <div className="bg-paper-3 border border-line rounded-r3 p-6 flex flex-col gap-4">
        <h2 className="font-semibold text-[16px] text-ink">รายละเอียดบทเรียน</h2>
        <Field label="ชื่อบทเรียน">
          <input
            type="text"
            className="input-base"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="เช่น แนะนำการใช้งานเครื่องมือ"
          />
        </Field>
        <div className="grid grid-cols-3 gap-4">
          <Field label="ความยาว (นาที)" hint="ใส่ 0 ได้หากยังไม่ทราบ">
            <input
              type="number"
              min={0}
              className="input-base"
              value={durationMin}
              onChange={(e) => setDurationMin(Number(e.target.value))}
            />
          </Field>
          <Field label="Drip (วัน)" hint="0 = ดูได้ทันที, N = ปลดล็อกวันที่ N หลังลงทะเบียน">
            <input
              type="number"
              min={0}
              className="input-base"
              value={dripDays}
              onChange={(e) => setDripDays(Number(e.target.value))}
            />
          </Field>
          <Field label="การเข้าถึง">
            <button
              type="button"
              onClick={() => setIsFree((v) => !v)}
              className={`w-full h-[42px] rounded-r2 border flex items-center justify-center gap-2 text-[13px] font-medium transition-all ${
                isFree
                  ? "border-viridian/40 bg-viridian/10 text-viridian"
                  : "border-line bg-paper text-ink-3 hover:border-ink-4"
              }`}
            >
              <CheckCircle size={15} />
              {isFree ? "ดูฟรี (ตัวอย่าง)" : "เฉพาะผู้ลงทะเบียน"}
            </button>
          </Field>
        </div>
      </div>

      {/* Type-specific editor */}
      {type === "VIDEO" ? (
        <div className="bg-paper-3 border border-line rounded-r3 p-6 flex flex-col gap-4">
          <div>
            <h2 className="font-semibold text-[16px] text-ink">แหล่งวิดีโอ</h2>
            <p className="text-[13px] text-ink-3 mt-1">
              วางลิงก์จาก YouTube หรือ Google Drive — ระบบจะดึงวิดีโอมาแสดงให้อัตโนมัติ
            </p>
          </div>

          <Field
            label="ลิงก์วิดีโอ"
            hint="ตัวอย่าง: https://youtu.be/xxxx หรือ https://drive.google.com/file/d/xxxx/view (ตั้งค่าการแชร์เป็น “ทุกคนที่มีลิงก์”)"
          >
            <div className="relative">
              <Link2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-4" />
              <input
                type="text"
                className="input-base pl-9"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="วางลิงก์ YouTube หรือ Google Drive ที่นี่..."
              />
            </div>
          </Field>

          {/* Parse status */}
          {parsedVideo && (
            <div className="flex items-center gap-2 text-[12px] text-viridian">
              {parsedVideo.provider === "youtube" ? <Youtube size={14} /> : <HardDrive size={14} />}
              ตรวจพบวิดีโอจาก {providerLabel(parsedVideo.provider)} ✓
            </div>
          )}
          {videoUrlInvalid && (
            <div className="flex items-center gap-2 text-[12px] text-danger">
              <AlertCircle size={14} />
              ลิงก์ไม่ถูกต้อง — รองรับเฉพาะ YouTube และ Google Drive
            </div>
          )}

          {/* Live preview */}
          {embedUrl && (
            <div>
              <p className="flex items-center gap-1.5 text-[12px] text-ink-3 mb-2">
                <Eye size={13} /> ตัวอย่าง
              </p>
              <div className="rounded-r2 overflow-hidden border border-line bg-black" style={{ aspectRatio: "16/9" }}>
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  title="ตัวอย่างวิดีโอ"
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-paper-3 border border-line rounded-r3 p-6 flex flex-col gap-4">
          <div>
            <h2 className="font-semibold text-[16px] text-ink">เนื้อหาบทความ</h2>
            <p className="text-[13px] text-ink-3 mt-1">
              เขียนเนื้อหาบทเรียน — เว้นบรรทัดเพื่อขึ้นย่อหน้าใหม่
            </p>
          </div>
          <textarea
            rows={16}
            className="input-base resize-y font-thai leading-[1.8]"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="เริ่มเขียนเนื้อหาบทเรียนที่นี่..."
          />
          <p className="text-[11px] text-ink-4 font-mono">{content.length} ตัวอักษร</p>
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="inline-flex items-center gap-1.5 text-[13px] text-ink-3 hover:text-danger transition-colors disabled:opacity-50"
        >
          <Trash2 size={14} />
          {isDeleting ? "กำลังลบ..." : "ลบบทเรียน"}
        </button>

        <div className="flex items-center gap-4">
          {saved && (
            <span className="flex items-center gap-1.5 text-ok text-[13px]">
              <CheckCircle size={14} /> บันทึกแล้ว
            </span>
          )}
          <Link
            href={`/${locale}/studio/courses/${courseSlug}/edit`}
            className="text-[13px] text-ink-3 hover:text-ink transition-colors"
          >
            ยกเลิก
          </Link>
          <Button variant="primary" onClick={handleSave} disabled={isPending} className="flex items-center gap-2">
            <Save size={15} />
            {isPending ? "กำลังบันทึก..." : "บันทึกบทเรียน"}
          </Button>
        </div>
      </div>
    </div>
  );
}
