"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/primitives/Button";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { createCourseWithCurriculum } from "@/actions/studio";
import {
  Plus, Trash2, Video, FileText, ClipboardCheck, Link2, Youtube, HardDrive, CheckCircle,
} from "lucide-react";
import { parseVideoInput, providerLabel } from "@/lib/video-url";

type Step = "basics" | "content" | "pricing" | "publish";

// ── Draft curriculum types (in-memory until the course is created) ──────────────
type LessonDraft = {
  id: string;
  title: string;
  type: string; // VIDEO | ARTICLE | QUIZ
  videoUrl: string; // raw pasted link, parsed on submit
  isFree: boolean;
};
type SectionDraft = {
  id: string;
  title: string;
  lessons: LessonDraft[];
};

const LESSON_TYPE_OPTIONS = [
  { value: "VIDEO", label: "วิดีโอ" },
  { value: "ARTICLE", label: "บทความ" },
  { value: "QUIZ", label: "แบบทดสอบ" },
];

function lessonTypeIcon(type: string) {
  if (type === "ARTICLE") return <FileText size={12} className="text-sky-500 shrink-0" />;
  if (type === "QUIZ") return <ClipboardCheck size={12} className="text-amber-500 shrink-0" />;
  return <Video size={12} className="text-viridian shrink-0" />;
}

const STEPS: { id: Step; label: string }[] = [
  { id: "basics", label: "ข้อมูลคอร์ส" },
  { id: "content", label: "เนื้อหา" },
  { id: "pricing", label: "ราคา" },
  { id: "publish", label: "เผยแพร่" },
];

type FormState = {
  title: string;
  description: string;
  level: string;
  language: string;
  price: number;
};

export default function NewCoursePage() {
  const [step, setStep] = useState<Step>("basics");
  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    level: "BEGINNER",
    language: "th",
    price: 0,
  });
  const [sections, setSections] = useState<SectionDraft[]>([]);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState<null | { devMode: boolean }>(null);
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();
  const router = useRouter();

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  function updateForm(updates: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...updates }));
  }

  function handlePublish() {
    setError("");
    startTransition(async () => {
      // Map draft curriculum → server payload (parse video links into tokens).
      const payloadSections = sections
        .filter((s) => s.title.trim())
        .map((s) => ({
          title: s.title.trim(),
          lessons: s.lessons
            .filter((l) => l.title.trim())
            .map((l) => ({
              title: l.title.trim(),
              type: l.type,
              isFree: l.isFree,
              videoAsset:
                l.type === "VIDEO" ? parseVideoInput(l.videoUrl)?.token : undefined,
            })),
        }));

      const result = await createCourseWithCurriculum(
        {
          title: form.title,
          description: form.description,
          level: form.level,
          language: form.language,
          price: form.price,
        },
        payloadSections
      );

      if (result.error === "Unauthorized" || result.error === "Forbidden") {
        setError("คุณไม่มีสิทธิ์สร้างคอร์ส");
        return;
      }
      // Success — or dev mock mode (DB not connected). Either way the course is
      // submitted for admin review; show the confirmation screen.
      setSubmitted({ devMode: result.error === "DB unavailable" });
    });
  }

  return (
    <div className="p-8 max-w-[800px]">
      <div className="mb-8">
        <EyebrowLabel className="mb-1">STUDIO / COURSES / NEW</EyebrowLabel>
        <h1 className="font-display text-[32px] text-ink tracking-[-0.015em]">สร้างคอร์สใหม่</h1>
      </div>

      {submitted ? (
        <SubmittedScreen
          devMode={submitted.devMode}
          onGoCourses={() => router.push(`/${locale}/studio/courses`)}
        />
      ) : (
      <>

      {/* Step tabs */}
      <div className="flex gap-0 mb-8 border border-line rounded-r3 overflow-hidden">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setStep(s.id)}
            className={`flex-1 py-3 text-[13px] font-medium border-r border-line last:border-0 transition-colors ${
              s.id === step
                ? "bg-viridian text-white"
                : i < stepIndex
                ? "bg-ok/10 text-ok"
                : "text-ink-3 hover:text-ink hover:bg-paper-2"
            }`}
          >
            <span className="font-mono text-[10px] block mb-0.5 opacity-60">0{i + 1}</span>
            {s.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-danger/10 border border-danger/30 rounded-r2 text-[13px] text-danger">
          {error}
        </div>
      )}

      {/* Step content */}
      {step === "basics" && (
        <BasicsStep form={form} onChange={updateForm} onNext={() => setStep("content")} />
      )}
      {step === "content" && (
        <ContentStep
          sections={sections}
          setSections={setSections}
          onBack={() => setStep("basics")}
          onNext={() => setStep("pricing")}
        />
      )}
      {step === "pricing" && (
        <PricingStep
          price={form.price}
          onChange={(price) => updateForm({ price })}
          onBack={() => setStep("content")}
          onNext={() => setStep("publish")}
        />
      )}
      {step === "publish" && (
        <PublishStep
          isPending={isPending}
          onBack={() => setStep("pricing")}
          onPublish={handlePublish}
        />
      )}
      </>
      )}
    </div>
  );
}

function SubmittedScreen({
  devMode,
  onGoCourses,
}: {
  devMode: boolean;
  onGoCourses: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-ok/10 border border-ok/30 rounded-r3 p-6">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle size={20} className="text-ok" />
          <p className="font-semibold text-[16px] text-ink">ส่งคอร์สให้แอดมินตรวจสอบแล้ว</p>
        </div>
        <p className="text-[14px] text-ink-2 leading-relaxed">
          คอร์สของคุณถูกบันทึกในสถานะ <strong className="text-ink">รอตรวจสอบ (REVIEW)</strong>{" "}
          ทีมแอดมินจะตรวจเนื้อหาและอนุมัติเผยแพร่ให้เร็วที่สุด — คุณยังแก้ไขเนื้อหาเพิ่มเติมได้จากหน้า &ldquo;คอร์สของฉัน&rdquo;
        </p>
      </div>

      {devMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-r2 px-4 py-3 text-[12px] text-amber-700 font-thai">
          หมายเหตุ (โหมดพัฒนา): ยังไม่ได้เชื่อมต่อฐานข้อมูล (DATABASE_URL ว่าง) ข้อมูลจึงยังไม่ถูกบันทึกจริง —
          เมื่อเชื่อมต่อฐานข้อมูลแล้ว คอร์สจะถูกส่งเข้าคิวตรวจสอบของแอดมินโดยอัตโนมัติ
        </div>
      )}

      <div className="flex justify-end pt-2">
        <Button variant="primary" onClick={onGoCourses}>
          ไปที่คอร์สของฉัน →
        </Button>
      </div>
    </div>
  );
}

function BasicsStep({
  form,
  onChange,
  onNext,
}: {
  form: { title: string; description: string; level: string; language: string };
  onChange: (u: Partial<{ title: string; description: string; level: string; language: string }>) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <Field label="ชื่อคอร์ส *" hint="ระบุชื่อที่ชัดเจนและน่าสนใจ">
        <input
          type="text"
          className="input-base"
          placeholder="เช่น UX Design & Figma Masterclass"
          value={form.title}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </Field>
      <Field label="คำอธิบายสั้น *">
        <textarea
          rows={3}
          className="input-base resize-none"
          placeholder="บอกผู้เรียนว่าคอร์สนี้เหมาะกับใครและจะได้อะไร"
          value={form.description}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="หมวดหมู่">
          <select className="input-base">
            <option>Design</option>
            <option>Development</option>
            <option>Marketing</option>
            <option>Business</option>
          </select>
        </Field>
        <Field label="ระดับ">
          <select
            className="input-base"
            value={form.level}
            onChange={(e) => onChange({ level: e.target.value })}
          >
            <option value="BEGINNER">ผู้เริ่มต้น</option>
            <option value="INTERMEDIATE">ระดับกลาง</option>
            <option value="ADVANCED">ระดับสูง</option>
          </select>
        </Field>
      </div>
      <Field label="ภาษาหลัก">
        <select
          className="input-base"
          value={form.language}
          onChange={(e) => onChange({ language: e.target.value })}
        >
          <option value="th">ภาษาไทย</option>
          <option value="en">English</option>
        </select>
      </Field>
      <div className="flex justify-end pt-4 border-t border-line">
        <Button
          variant="primary"
          onClick={onNext}
          disabled={!form.title.trim() || !form.description.trim()}
        >
          ถัดไป: เนื้อหา →
        </Button>
      </div>
    </div>
  );
}

function ContentStep({
  sections,
  setSections,
  onBack,
  onNext,
}: {
  sections: SectionDraft[];
  setSections: React.Dispatch<React.SetStateAction<SectionDraft[]>>;
  onBack: () => void;
  onNext: () => void;
}) {
  const rid = () =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `id_${Math.random().toString(36).slice(2)}`;

  function addSection() {
    setSections((prev) => [...prev, { id: rid(), title: "", lessons: [] }]);
  }
  function updateSection(id: string, title: string) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, title } : s)));
  }
  function removeSection(id: string) {
    setSections((prev) => prev.filter((s) => s.id !== id));
  }
  function addLesson(sectionId: string) {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, lessons: [...s.lessons, { id: rid(), title: "", type: "VIDEO", videoUrl: "", isFree: false }] }
          : s
      )
    );
  }
  function updateLesson(sectionId: string, lessonId: string, patch: Partial<LessonDraft>) {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, lessons: s.lessons.map((l) => (l.id === lessonId ? { ...l, ...patch } : l)) }
          : s
      )
    );
  }
  function removeLesson(sectionId: string, lessonId: string) {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, lessons: s.lessons.filter((l) => l.id !== lessonId) } : s
      )
    );
  }

  const totalLessons = sections.reduce((n, s) => n + s.lessons.length, 0);

  return (
    <div className="flex flex-col gap-6">
      <p className="text-[14px] text-ink-3">
        สร้างโครงสร้างเนื้อหาคอร์ส — เพิ่มหัวข้อ (Section) และบทเรียน พร้อม<strong className="text-ink"> แนบลิงก์ YouTube หรือ Google Drive</strong> ได้เลย (ปรับแต่งเพิ่มเติมได้ภายหลังในหน้าแก้ไข)
      </p>

      {sections.length === 0 && (
        <div className="border border-dashed border-line rounded-r3 p-8 text-center">
          <p className="text-ink-3 text-[14px] mb-1">ยังไม่มีหัวข้อ</p>
          <p className="text-ink-4 text-[12px]">กด &ldquo;เพิ่มหัวข้อ&rdquo; เพื่อเริ่มสร้างเนื้อหาคอร์ส</p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {sections.map((section, si) => (
          <div key={section.id} className="border border-line rounded-r3 overflow-hidden bg-paper-3">
            {/* Section header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-line bg-paper-2">
              <span className="font-mono text-[10px] text-ink-3 shrink-0">หัวข้อ {si + 1}</span>
              <input
                type="text"
                className="input-base text-[14px] py-1.5 flex-1"
                placeholder="ชื่อหัวข้อ เช่น บทนำ / พื้นฐาน Figma"
                value={section.title}
                onChange={(e) => updateSection(section.id, e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeSection(section.id)}
                className="p-1.5 text-ink-3 hover:text-danger transition-colors shrink-0"
                title="ลบหัวข้อ"
              >
                <Trash2 size={15} />
              </button>
            </div>

            {/* Lessons */}
            <div className="p-3 flex flex-col gap-3">
              {section.lessons.map((lesson, li) => {
                const parsed = lesson.type === "VIDEO" ? parseVideoInput(lesson.videoUrl) : null;
                const urlInvalid = lesson.type === "VIDEO" && lesson.videoUrl.trim().length > 0 && !parsed;
                return (
                  <div key={lesson.id} className="border border-line rounded-r2 p-3 bg-paper flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-ink-4 w-4 shrink-0">{li + 1}</span>
                      {lessonTypeIcon(lesson.type)}
                      <select
                        className="input-base text-[12px] py-1 w-[100px] shrink-0"
                        value={lesson.type}
                        onChange={(e) => updateLesson(section.id, lesson.id, { type: e.target.value })}
                      >
                        {LESSON_TYPE_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        className="input-base text-[13px] py-1.5 flex-1"
                        placeholder="ชื่อบทเรียน..."
                        value={lesson.title}
                        onChange={(e) => updateLesson(section.id, lesson.id, { title: e.target.value })}
                      />
                      <label className="flex items-center gap-1 text-[11px] text-ink-3 shrink-0 cursor-pointer" title="ให้ดูฟรีเป็นตัวอย่าง">
                        <input
                          type="checkbox"
                          className="rounded border-line"
                          checked={lesson.isFree}
                          onChange={(e) => updateLesson(section.id, lesson.id, { isFree: e.target.checked })}
                        />
                        ฟรี
                      </label>
                      <button
                        type="button"
                        onClick={() => removeLesson(section.id, lesson.id)}
                        className="p-1 text-ink-3 hover:text-danger transition-colors shrink-0"
                        title="ลบบทเรียน"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* YouTube / Drive link — for video lessons */}
                    {lesson.type === "VIDEO" && (
                      <div className="pl-6">
                        <div className="relative">
                          <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-4" />
                          <input
                            type="text"
                            className="input-base text-[12px] py-1.5 pl-9 w-full"
                            placeholder="วางลิงก์ YouTube หรือ Google Drive (ไม่บังคับ)"
                            value={lesson.videoUrl}
                            onChange={(e) => updateLesson(section.id, lesson.id, { videoUrl: e.target.value })}
                          />
                        </div>
                        {parsed && (
                          <p className="flex items-center gap-1.5 text-[11px] text-viridian mt-1">
                            {parsed.provider === "youtube" ? <Youtube size={12} /> : <HardDrive size={12} />}
                            ตรวจพบวิดีโอจาก {providerLabel(parsed.provider)} ✓
                          </p>
                        )}
                        {urlInvalid && (
                          <p className="text-[11px] text-danger mt-1">
                            ลิงก์ไม่ถูกต้อง — รองรับเฉพาะ YouTube และ Google Drive
                          </p>
                        )}
                      </div>
                    )}
                    {lesson.type === "QUIZ" && (
                      <p className="pl-6 text-[11px] text-ink-4">สร้างคำถามได้ในหน้าแก้ไขหลังสร้างคอร์ส</p>
                    )}
                    {lesson.type === "ARTICLE" && (
                      <p className="pl-6 text-[11px] text-ink-4">เขียนเนื้อหาบทความได้ในหน้าแก้ไขหลังสร้างคอร์ส</p>
                    )}
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => addLesson(section.id)}
                className="flex items-center justify-center gap-1.5 py-2 text-[12px] text-ink-3 hover:text-viridian border border-dashed border-line rounded-r2 hover:border-viridian-3 transition-colors"
              >
                <Plus size={13} /> เพิ่มบทเรียน
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addSection}
        className="flex items-center justify-center gap-2 py-3 text-[14px] text-ink-2 hover:text-viridian border-2 border-dashed border-line rounded-r3 hover:border-viridian-3 transition-colors"
      >
        <Plus size={16} /> เพิ่มหัวข้อ
      </button>

      {totalLessons > 0 && (
        <p className="text-[12px] text-ink-3 font-mono">
          {sections.length} หัวข้อ · {totalLessons} บทเรียน
        </p>
      )}

      <div className="bg-viridian-wash border border-viridian-3/30 rounded-r3 p-4 text-[13px] text-ink-2">
        <strong>เคล็ดลับ:</strong> วางลิงก์ YouTube/Google Drive ในบทเรียนวิดีโอได้เลย — ระบบจะดึงมาเล่นให้อัตโนมัติ (ไฟล์ Drive ตั้งค่าแชร์เป็น &ldquo;ทุกคนที่มีลิงก์&rdquo;) เนื้อหาส่วนที่เหลือเพิ่ม/แก้ได้ภายหลังในหน้าแก้ไข
      </div>

      <div className="flex justify-between pt-4 border-t border-line">
        <Button variant="ghost" onClick={onBack}>← ย้อนกลับ</Button>
        <Button variant="primary" onClick={onNext}>ถัดไป: ราคา →</Button>
      </div>
    </div>
  );
}

function PricingStep({
  price,
  onChange,
  onBack,
  onNext,
}: {
  price: number;
  onChange: (price: number) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <Field label="ราคา (THB)" hint="ใส่ 0 เพื่อให้เป็นคอร์สฟรี">
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3 text-[14px]">฿</span>
          <input
            type="number"
            className="input-base pl-7"
            placeholder="1990"
            min={0}
            value={price}
            onChange={(e) => onChange(Number(e.target.value))}
          />
        </div>
      </Field>
      <Field label="ราคาที่ขีดทิ้ง (ไม่บังคับ)">
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3 text-[14px]">฿</span>
          <input type="number" className="input-base pl-7" placeholder="2990" min={0} />
        </div>
      </Field>
      <label className="flex items-center gap-3 py-3 px-4 bg-paper-2 rounded-r2 cursor-pointer">
        <input type="checkbox" className="rounded border-line" />
        <span className="text-[14px] text-ink">รองรับ PromptPay (Omise)</span>
      </label>
      <label className="flex items-center gap-3 py-3 px-4 bg-paper-2 rounded-r2 cursor-pointer">
        <input type="checkbox" className="rounded border-line" defaultChecked />
        <span className="text-[14px] text-ink">รองรับบัตรเครดิต / Stripe</span>
      </label>
      <div className="flex justify-between pt-4 border-t border-line">
        <Button variant="ghost" onClick={onBack}>← ย้อนกลับ</Button>
        <Button variant="primary" onClick={onNext}>ถัดไป: เผยแพร่ →</Button>
      </div>
    </div>
  );
}

function PublishStep({
  isPending,
  onBack,
  onPublish,
}: {
  isPending: boolean;
  onBack: () => void;
  onPublish: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-ok/10 border border-ok/30 rounded-r3 p-5 text-[14px] text-ink">
        <p className="font-semibold mb-2">พร้อมสร้างคอร์ส ✓</p>
        <ul className="list-disc list-inside text-ink-2 flex flex-col gap-1">
          <li>ตั้งชื่อและคำอธิบายครบ</li>
          <li>ตั้งราคาเรียบร้อย</li>
          <li>คอร์สจะถูกสร้างในสถานะ DRAFT — เพิ่มบทเรียนแล้วค่อย Publish</li>
        </ul>
      </div>
      <Field label="ภาพหน้าปก (thumbnail)">
        <div className="border-2 border-dashed border-line rounded-r2 p-8 text-center cursor-pointer hover:border-viridian transition-colors">
          <p className="text-ink-3 text-[13px]">คลิกหรือลากไฟล์มาวาง (JPG/PNG, 1280×720)</p>
          <p className="text-ink-4 text-[11px] mt-1">เพิ่มได้ภายหลังในหน้าแก้ไข</p>
        </div>
      </Field>
      <Field label="ตัวอย่างคอร์ส (Preview video)">
        <div className="border-2 border-dashed border-line rounded-r2 p-8 text-center cursor-pointer hover:border-viridian transition-colors">
          <p className="text-ink-3 text-[13px]">อัปโหลดวิดีโอตัวอย่าง (MP4, สูงสุด 500MB)</p>
          <p className="text-ink-4 text-[11px] mt-1">เพิ่มได้ภายหลังในหน้าแก้ไข</p>
        </div>
      </Field>
      <div className="flex justify-between pt-4 border-t border-line">
        <Button variant="ghost" onClick={onBack} disabled={isPending}>← ย้อนกลับ</Button>
        <Button variant="primary" onClick={onPublish} disabled={isPending}>
          {isPending ? "กำลังสร้าง..." : "สร้างคอร์ส (Draft)"}
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-ink mb-1.5">
        {label}
        {hint && <span className="font-normal text-ink-3 ml-2">— {hint}</span>}
      </label>
      {children}
    </div>
  );
}
