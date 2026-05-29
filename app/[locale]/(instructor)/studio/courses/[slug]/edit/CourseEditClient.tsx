"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/primitives/Button";
import {
  updateCourse,
  createSection,
  createLesson,
  publishCourse,
  unpublishCourse,
} from "@/actions/studio";
import { ChevronDown, ChevronRight, Plus, Video, FileText, ClipboardCheck } from "lucide-react";
import { CourseThumbnailPicker } from "@/components/studio/CourseThumbnailPicker";
import { updateCourseThumbnail } from "@/actions/studio";

type LessonRow = { id: string; title: string; type: string; isFree: boolean; duration?: number };
type SectionRow = { id: string; title: string; order: number; lessons: LessonRow[] };
type CourseData = {
  id: string;
  title: string;
  description: string;
  level: string;
  language: string;
  price: number;
  status: string;
  sections: SectionRow[];
  thumbnailGradient?: string;
};

function lessonIcon(type: string) {
  if (type === "ARTICLE") return <FileText size={12} className="text-sky-400 shrink-0" />;
  if (type === "QUIZ") return <ClipboardCheck size={12} className="text-amber-400 shrink-0" />;
  return <Video size={12} className="text-viridian shrink-0" />;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-ink mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export function CourseEditClient({ course }: { course: CourseData }) {
  const params = useParams();
  const locale = (params.locale as string) || "th";
  const courseSlug = (params.slug as string) || "";
  const [status, setStatus] = useState(course.status);
  const [sections, setSections] = useState<SectionRow[]>(course.sections);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(course.sections.map((s) => s.id)));
  const [form, setForm] = useState({
    title: course.title,
    description: course.description,
    level: course.level,
    language: course.language,
    price: course.price,
  });
  const [saved, setSaved] = useState(false);
  const [metaError, setMetaError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [gradient, setGradient] = useState(course.thumbnailGradient ?? "linear-gradient(135deg,#0F5D4A 0%,#1A7A60 100%)");
  const [thumbSaved, setThumbSaved] = useState(false);

  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [addingSection, setAddingSection] = useState(false);
  const [newLessonTitles, setNewLessonTitles] = useState<Record<string, string>>({});
  const [addingLessonFor, setAddingLessonFor] = useState<string | null>(null);

  function handleSaveMetadata() {
    setMetaError("");
    setSaved(false);
    startTransition(async () => {
      const result = await updateCourse(course.id, {
        title: form.title,
        description: form.description,
        level: form.level,
        language: form.language,
        price: form.price,
      });
      if (result.error) setMetaError(result.error);
      else setSaved(true);
    });
  }

  function handleGradientSave(value: string) {
    setGradient(value);
    setThumbSaved(false);
    startTransition(async () => {
      await updateCourseThumbnail(course.id, value);
      setThumbSaved(true);
    });
  }

  function handlePublishToggle() {
    startTransition(async () => {
      if (status === "PUBLISHED") {
        await unpublishCourse(course.id);
        setStatus("DRAFT");
      } else {
        await publishCourse(course.id);
        setStatus("PUBLISHED");
      }
    });
  }

  function handleAddSection() {
    const title = newSectionTitle.trim();
    if (!title) return;
    startTransition(async () => {
      const result = await createSection(course.id, title);
      if (!result.error && result.sectionId) {
        const newSection: SectionRow = { id: result.sectionId, title, order: sections.length + 1, lessons: [] };
        setSections((prev) => [...prev, newSection]);
        setExpanded((prev) => new Set([...prev, result.sectionId!]));
        setNewSectionTitle("");
        setAddingSection(false);
      }
    });
  }

  function handleAddLesson(sectionId: string) {
    const title = (newLessonTitles[sectionId] ?? "").trim();
    if (!title) return;
    startTransition(async () => {
      const result = await createLesson(sectionId, course.id, title, "VIDEO");
      if (!result.error && result.lessonId) {
        setSections((prev) =>
          prev.map((s) =>
            s.id === sectionId
              ? { ...s, lessons: [...s.lessons, { id: result.lessonId!, title, type: "VIDEO", isFree: false }] }
              : s
          )
        );
        setNewLessonTitles((prev) => ({ ...prev, [sectionId]: "" }));
        setAddingLessonFor(null);
      }
    });
  }

  function toggleSection(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      {/* Metadata */}
      <div className="bg-paper-3 border border-line rounded-r3 p-6">
        <h2 className="font-semibold text-[16px] text-ink mb-5">ข้อมูลคอร์ส</h2>
        {saved && <p className="text-[12px] text-ok mb-3">บันทึกเรียบร้อย ✓</p>}
        {metaError && <p className="text-[12px] text-danger mb-3">{metaError}</p>}
        <div className="flex flex-col gap-4">
          <Field label="ชื่อคอร์ส">
            <input
              type="text"
              className="input-base"
              value={form.title}
              onChange={(e) => { setForm((f) => ({ ...f, title: e.target.value })); setSaved(false); }}
            />
          </Field>
          <Field label="คำอธิบายสั้น">
            <textarea
              rows={3}
              className="input-base resize-none"
              value={form.description}
              onChange={(e) => { setForm((f) => ({ ...f, description: e.target.value })); setSaved(false); }}
            />
          </Field>
          <div className="grid grid-cols-3 gap-4">
            <Field label="ระดับ">
              <select className="input-base" value={form.level} onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}>
                <option value="BEGINNER">ผู้เริ่มต้น</option>
                <option value="INTERMEDIATE">ระดับกลาง</option>
                <option value="ADVANCED">ระดับสูง</option>
              </select>
            </Field>
            <Field label="ภาษา">
              <select className="input-base" value={form.language} onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}>
                <option value="th">ภาษาไทย</option>
                <option value="en">English</option>
              </select>
            </Field>
            <Field label="ราคา (THB)">
              <input
                type="number"
                className="input-base"
                value={form.price}
                min={0}
                onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
              />
            </Field>
          </div>
          <div className="flex justify-end pt-2">
            <Button variant="primary" onClick={handleSaveMetadata} disabled={isPending}>
              {isPending ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </div>
        </div>
      </div>

      {/* Thumbnail */}
      <div className="bg-paper-3 border border-line rounded-r3 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[16px] text-ink">ภาพปกคอร์ส</h2>
          {thumbSaved && <p className="text-[12px] text-ok">บันทึกเรียบร้อย ✓</p>}
        </div>
        <CourseThumbnailPicker
          currentGradient={gradient}
          onGradientChange={handleGradientSave}
          saving={isPending}
        />
      </div>

      {/* Curriculum */}
      <div className="bg-paper-3 border border-line rounded-r3 overflow-hidden">
        <div className="px-6 py-4 border-b border-line flex items-center justify-between">
          <h2 className="font-semibold text-[16px] text-ink">เนื้อหาคอร์ส</h2>
          <Button variant="ghost" size="sm" onClick={() => setAddingSection(true)} disabled={addingSection || isPending}>
            <Plus size={14} className="mr-1" /> เพิ่มหัวข้อ
          </Button>
        </div>

        {sections.length === 0 && !addingSection && (
          <div className="p-10 text-center text-ink-3 text-[14px]">
            ยังไม่มีหัวข้อ — กด &ldquo;เพิ่มหัวข้อ&rdquo; เพื่อเริ่ม
          </div>
        )}

        {sections.map((section, si) => (
          <div key={section.id} className="border-b border-line last:border-0">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center gap-3 px-6 py-3 hover:bg-paper-2 transition-colors text-left"
            >
              {expanded.has(section.id) ? <ChevronDown size={15} className="text-ink-3" /> : <ChevronRight size={15} className="text-ink-3" />}
              <span className="font-mono text-[10px] text-ink-3 w-5 shrink-0">{si + 1}</span>
              <span className="font-medium text-[14px] text-ink">{section.title}</span>
              <span className="ml-auto text-[11px] text-ink-3 shrink-0">{section.lessons.length} บทเรียน</span>
            </button>

            {expanded.has(section.id) && (
              <div className="pb-2 bg-paper-2/40">
                {section.lessons.map((lesson, li) => (
                  <div key={lesson.id} className="flex items-center gap-3 px-8 py-2.5 border-t border-line/40">
                    <span className="font-mono text-[10px] text-ink-4 w-4 shrink-0">{li + 1}</span>
                    {lessonIcon(lesson.type)}
                    <span className="text-[13px] text-ink flex-1 truncate">{lesson.title}</span>
                    {lesson.isFree && (
                      <span className="font-mono text-[9px] text-viridian bg-viridian/10 px-1.5 py-0.5 rounded-pill shrink-0">FREE</span>
                    )}
                    {lesson.duration && (
                      <span className="font-mono text-[10px] text-ink-4 shrink-0">{Math.floor(lesson.duration / 60)}m</span>
                    )}
                    {lesson.type === "QUIZ" && (
                      <Link
                        href={`/${locale}/studio/courses/${courseSlug}/quiz/${lesson.id}`}
                        className="font-mono text-[9px] text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-pill shrink-0 hover:bg-amber-100 transition-colors"
                      >
                        แก้ Quiz
                      </Link>
                    )}
                  </div>
                ))}

                {addingLessonFor === section.id ? (
                  <div className="flex items-center gap-2 px-8 py-2.5 border-t border-line/40">
                    <input
                      autoFocus
                      type="text"
                      className="input-base text-[13px] flex-1 py-1.5"
                      placeholder="ชื่อบทเรียน..."
                      value={newLessonTitles[section.id] ?? ""}
                      onChange={(e) => setNewLessonTitles((prev) => ({ ...prev, [section.id]: e.target.value }))}
                      onKeyDown={(e) => e.key === "Enter" && handleAddLesson(section.id)}
                    />
                    <Button variant="primary" size="sm" onClick={() => handleAddLesson(section.id)} disabled={isPending}>
                      เพิ่ม
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setAddingLessonFor(null)}>
                      ยกเลิก
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingLessonFor(section.id)}
                    className="flex items-center gap-2 px-8 py-2.5 border-t border-line/40 w-full text-[12px] text-ink-3 hover:text-viridian transition-colors"
                  >
                    <Plus size={12} /> เพิ่มบทเรียน
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {addingSection && (
          <div className="flex items-center gap-2 px-6 py-3 border-t border-line">
            <input
              autoFocus
              type="text"
              className="input-base text-[13px] flex-1 py-1.5"
              placeholder="ชื่อหัวข้อใหม่..."
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddSection()}
            />
            <Button variant="primary" size="sm" onClick={handleAddSection} disabled={isPending}>
              เพิ่ม
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setAddingSection(false); setNewSectionTitle(""); }}>
              ยกเลิก
            </Button>
          </div>
        )}
      </div>

      {/* Publish toggle */}
      <div className="bg-paper-3 border border-line rounded-r3 p-6 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-semibold text-[15px] text-ink">สถานะการเผยแพร่</h2>
            <span className={`font-mono text-[10px] px-2 py-0.5 rounded-pill uppercase tracking-wide ${
              status === "PUBLISHED" ? "bg-ok/10 text-ok" : "bg-warn/10 text-warn"
            }`}>
              {status}
            </span>
          </div>
          <p className="text-[13px] text-ink-3">
            {status === "PUBLISHED"
              ? "คอร์สกำลังเผยแพร่อยู่ — ผู้เรียนสามารถค้นหาและลงทะเบียนได้"
              : "คอร์สอยู่ในสถานะ Draft — ยังไม่เผยแพร่สู่สาธารณะ"}
          </p>
        </div>
        <Button
          variant={status === "PUBLISHED" ? "ghost" : "primary"}
          onClick={handlePublishToggle}
          disabled={isPending}
        >
          {status === "PUBLISHED" ? "ยกเลิกการเผยแพร่" : "เผยแพร่คอร์ส"}
        </Button>
      </div>
    </div>
  );
}
