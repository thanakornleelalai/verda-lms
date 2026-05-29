"use client";

import { useState, useTransition, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/primitives/Button";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { upsertQuiz } from "@/actions/studio";
import {
  Plus,
  Trash2,
  CheckCircle,
  ChevronUp,
  ChevronDown,
  ClipboardCheck,
  ArrowLeft,
  GripVertical,
} from "lucide-react";
import { useParams } from "next/navigation";

type OptionDraft = {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
};

type QuestionDraft = {
  id: string;
  text: string;
  type: "SINGLE" | "MULTIPLE" | "TRUE_FALSE";
  order: number;
  points: number;
  options: OptionDraft[];
};

function newOption(order: number): OptionDraft {
  return { id: crypto.randomUUID(), text: "", isCorrect: false, order };
}

function newQuestion(order: number): QuestionDraft {
  return {
    id: crypto.randomUUID(),
    text: "",
    type: "SINGLE",
    order,
    points: 1,
    options: [
      newOption(1),
      newOption(2),
      newOption(3),
      newOption(4),
    ],
  };
}

export default function QuizBuilderPage() {
  const params = useParams();
  const locale = params.locale as string;
  const slug = params.slug as string;
  const lessonId = params.lessonId as string;

  const [title, setTitle] = useState("แบบทดสอบ");
  const [timeLimitSec, setTimeLimitSec] = useState<number | "">(600);
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState<QuestionDraft[]>([newQuestion(1)]);
  const [expandedQ, setExpandedQ] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [isPending, startTransition] = useTransition();

  function addQuestion() {
    const q = newQuestion(questions.length + 1);
    setQuestions((prev) => [...prev, q]);
    setExpandedQ((prev) => new Set([...prev, q.id]));
  }

  function removeQuestion(qId: string) {
    setQuestions((prev) =>
      prev
        .filter((q) => q.id !== qId)
        .map((q, i) => ({ ...q, order: i + 1 }))
    );
  }

  function updateQuestion(qId: string, patch: Partial<QuestionDraft>) {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        // When switching to TRUE_FALSE, replace options with ถูก/ผิด
        if (patch.type === "TRUE_FALSE") {
          return {
            ...q, ...patch,
            options: [
              { id: crypto.randomUUID(), text: "ถูก (True)", isCorrect: false, order: 1 },
              { id: crypto.randomUUID(), text: "ผิด (False)", isCorrect: false, order: 2 },
            ],
          };
        }
        // When switching FROM TRUE_FALSE back to MCQ, restore 4 options
        if ((patch.type === "SINGLE" || patch.type === "MULTIPLE") && q.type === "TRUE_FALSE") {
          return {
            ...q, ...patch,
            options: [newOption(1), newOption(2), newOption(3), newOption(4)],
          };
        }
        return { ...q, ...patch };
      })
    );
  }

  function updateOption(qId: string, oId: string, patch: Partial<OptionDraft>) {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        return {
          ...q,
          options: q.options.map((o) => (o.id === oId ? { ...o, ...patch } : o)),
        };
      })
    );
  }

  function toggleCorrect(qId: string, oId: string, type: "SINGLE" | "MULTIPLE") {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        return {
          ...q,
          options: q.options.map((o) => {
            if (type === "SINGLE") {
              return { ...o, isCorrect: o.id === oId };
            }
            return o.id === oId ? { ...o, isCorrect: !o.isCorrect } : o;
          }),
        };
      })
    );
  }

  function moveQuestion(qId: string, dir: -1 | 1) {
    setQuestions((prev) => {
      const idx = prev.findIndex((q) => q.id === qId);
      if (idx < 0) return prev;
      const next = [...prev];
      const swapIdx = idx + dir;
      if (swapIdx < 0 || swapIdx >= next.length) return prev;
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next.map((q, i) => ({ ...q, order: i + 1 }));
    });
  }

  const handleSave = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setSaved(false);
      setSaveError("");

      // Validate
      for (const q of questions) {
        if (!q.text.trim()) {
          setSaveError("กรุณากรอกข้อความคำถามให้ครบทุกข้อ");
          return;
        }
        const hasCorrect = q.options.some((o) => o.isCorrect);
        if (!hasCorrect) {
          setSaveError(`ข้อ ${q.order}: ยังไม่ได้เลือกคำตอบที่ถูกต้อง`);
          return;
        }
        for (const o of q.options) {
          if (!o.text.trim()) {
            setSaveError(`ข้อ ${q.order}: กรุณากรอกข้อความตัวเลือกให้ครบ`);
            return;
          }
        }
      }

      startTransition(async () => {
        const result = await upsertQuiz(lessonId, {
          title,
          timeLimitSec: timeLimitSec === "" ? null : Number(timeLimitSec),
          passingScore,
          questions: questions.map((q) => ({
            text: q.text,
            type: q.type,
            order: q.order,
            points: q.points,
            options: q.options.map((o) => ({
              text: o.text,
              isCorrect: o.isCorrect,
              order: o.order,
            })),
          })),
        });

        if (result.error) {
          setSaveError(result.error === "DB unavailable" ? "บันทึกลง mock สำเร็จ (DB ไม่พร้อม)" : result.error);
          if (result.error === "DB unavailable") setSaved(true);
        } else {
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
        }
      });
    },
    [title, timeLimitSec, passingScore, questions, lessonId]
  );

  const OPTION_LABELS = ["A", "B", "C", "D"];

  return (
    <div className="min-h-screen bg-paper">
      <div className="border-b border-line bg-paper-3">
        <div className="max-w-[860px] mx-auto px-8 py-5 flex items-center justify-between">
          <div>
            <Link
              href={`/${locale}/studio/courses/${slug}/edit`}
              className="inline-flex items-center gap-1.5 text-[12px] text-ink-3 hover:text-ink mb-2 transition-colors"
            >
              <ArrowLeft size={13} />
              กลับแก้ไขคอร์ส
            </Link>
            <div className="flex items-center gap-2">
              <EyebrowLabel>QUIZ BUILDER</EyebrowLabel>
            </div>
            <h1 className="font-display text-[26px] text-ink tracking-[-0.01em] mt-1">
              สร้าง / แก้ไขแบบทดสอบ
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {saved && (
              <span className="flex items-center gap-1.5 text-ok text-[13px]">
                <CheckCircle size={14} />
                บันทึกแล้ว
              </span>
            )}
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={isPending}
              className="flex items-center gap-2"
            >
              <ClipboardCheck size={15} />
              {isPending ? "กำลังบันทึก..." : "บันทึกแบบทดสอบ"}
            </Button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="max-w-[860px] mx-auto px-8 py-8">
        {saveError && (
          <div className="bg-danger/5 border border-danger/20 text-danger text-[13px] rounded-r2 px-4 py-2.5 mb-6">
            {saveError}
          </div>
        )}

        {/* Quiz settings */}
        <div className="bg-paper-3 border border-line rounded-r3 p-6 mb-8">
          <h2 className="font-semibold text-[16px] text-ink mb-5">ตั้งค่าแบบทดสอบ</h2>
          <div className="grid grid-cols-3 gap-5">
            <div className="col-span-3">
              <label className="block text-[13px] font-medium text-ink mb-1.5">ชื่อแบบทดสอบ</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-line rounded-r2 px-3.5 h-[40px] text-[14px] bg-paper focus:outline-none focus:border-viridian transition-colors"
                placeholder="เช่น แบบทดสอบท้ายบท 1"
                required
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-ink mb-1.5">
                เวลาจำกัด (วินาที)
              </label>
              <input
                type="number"
                value={timeLimitSec}
                onChange={(e) => setTimeLimitSec(e.target.value === "" ? "" : Number(e.target.value))}
                min={0}
                className="w-full border border-line rounded-r2 px-3.5 h-[40px] text-[14px] bg-paper focus:outline-none focus:border-viridian transition-colors"
                placeholder="เช่น 600 (ไม่กำหนด = 0)"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-ink mb-1.5">
                คะแนนผ่าน (%)
              </label>
              <input
                type="number"
                value={passingScore}
                onChange={(e) => setPassingScore(Number(e.target.value))}
                min={1}
                max={100}
                className="w-full border border-line rounded-r2 px-3.5 h-[40px] text-[14px] bg-paper focus:outline-none focus:border-viridian transition-colors"
              />
            </div>
            <div className="flex items-end">
              <p className="text-[12px] text-ink-4 font-thai leading-relaxed">
                {questions.length} ข้อ
                {timeLimitSec ? ` · ${Math.floor(Number(timeLimitSec) / 60)} นาที` : " · ไม่จำกัดเวลา"}
                {" · "}ผ่านที่ {passingScore}%
              </p>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="flex flex-col gap-4 mb-6">
          {questions.map((q, qIdx) => {
            const isExpanded = expandedQ.has(q.id);
            return (
              <div
                key={q.id}
                className="bg-paper-3 border border-line rounded-r3 overflow-hidden"
              >
                {/* Question header */}
                <div
                  className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-paper-2 transition-colors"
                  onClick={() =>
                    setExpandedQ((prev) => {
                      const next = new Set(prev);
                      if (next.has(q.id)) next.delete(q.id);
                      else next.add(q.id);
                      return next;
                    })
                  }
                >
                  <GripVertical size={15} className="text-ink-4 shrink-0" />
                  <span className="font-mono text-[11px] text-viridian bg-viridian/10 px-2 py-0.5 rounded shrink-0">
                    ข้อ {q.order}
                  </span>
                  <p className="flex-1 text-[14px] text-ink truncate min-w-0">
                    {q.text || <span className="text-ink-4">ยังไม่ได้กรอกคำถาม</span>}
                  </p>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); moveQuestion(q.id, -1); }}
                      disabled={qIdx === 0}
                      className="p-1 text-ink-3 hover:text-ink disabled:opacity-30 transition-colors"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); moveQuestion(q.id, 1); }}
                      disabled={qIdx === questions.length - 1}
                      className="p-1 text-ink-3 hover:text-ink disabled:opacity-30 transition-colors"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeQuestion(q.id); }}
                      className="p-1 text-ink-3 hover:text-danger transition-colors ml-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Question body */}
                {isExpanded && (
                  <div className="border-t border-line p-5">
                    <div className="flex gap-4 mb-4">
                      <div className="flex-1">
                        <label className="block text-[12px] font-medium text-ink mb-1.5">
                          คำถาม
                        </label>
                        <textarea
                          value={q.text}
                          onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                          rows={2}
                          placeholder="พิมพ์คำถามที่นี่..."
                          className="w-full border border-line rounded-r2 px-3.5 py-2.5 text-[14px] font-thai bg-paper focus:outline-none focus:border-viridian resize-none transition-colors"
                        />
                      </div>
                      <div className="shrink-0 w-[130px]">
                        <label className="block text-[12px] font-medium text-ink mb-1.5">
                          ประเภท
                        </label>
                        <select
                          value={q.type}
                          onChange={(e) =>
                            updateQuestion(q.id, {
                              type: e.target.value as "SINGLE" | "MULTIPLE" | "TRUE_FALSE",
                            })
                          }
                          className="w-full border border-line rounded-r2 px-3 h-[40px] text-[13px] bg-paper focus:outline-none focus:border-viridian"
                        >
                          <option value="SINGLE">เลือก 1 ข้อ</option>
                          <option value="MULTIPLE">หลายข้อ</option>
                          <option value="TRUE_FALSE">ถูก / ผิด</option>
                        </select>
                      </div>
                      <div className="shrink-0 w-[80px]">
                        <label className="block text-[12px] font-medium text-ink mb-1.5">
                          คะแนน
                        </label>
                        <input
                          type="number"
                          value={q.points}
                          min={1}
                          onChange={(e) => updateQuestion(q.id, { points: Number(e.target.value) })}
                          className="w-full border border-line rounded-r2 px-3 h-[40px] text-[13px] bg-paper focus:outline-none focus:border-viridian"
                        />
                      </div>
                    </div>

                    {/* Options */}
                    <div className="flex flex-col gap-2.5">
                      <p className="text-[12px] text-ink-3 font-mono uppercase tracking-wider">
                        {q.type === "TRUE_FALSE"
                          ? "ตัวเลือก — คลิกวงกลมเพื่อเลือกคำตอบที่ถูก"
                          : q.type === "SINGLE"
                          ? "ตัวเลือก — คลิกวงกลมเพื่อเลือกคำตอบที่ถูก"
                          : "ตัวเลือก — คลิกวงกลมได้หลายข้อ"}
                      </p>
                      {q.options.map((opt, oIdx) => (
                        <div key={opt.id} className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => toggleCorrect(q.id, opt.id, q.type === "MULTIPLE" ? "MULTIPLE" : "SINGLE")}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                              opt.isCorrect
                                ? "bg-ok border-ok text-white"
                                : "border-line text-transparent hover:border-ok/50"
                            }`}
                          >
                            <CheckCircle size={13} />
                          </button>
                          <span className="font-mono text-[11px] text-ink-3 w-5 shrink-0">
                            {OPTION_LABELS[oIdx]}
                          </span>
                          <input
                            type="text"
                            value={opt.text}
                            onChange={(e) =>
                              updateOption(q.id, opt.id, { text: e.target.value })
                            }
                            disabled={q.type === "TRUE_FALSE"}
                            placeholder={`ตัวเลือก ${OPTION_LABELS[oIdx]}`}
                            className="flex-1 border border-line rounded-r2 px-3.5 h-[38px] text-[13px] font-thai bg-paper focus:outline-none focus:border-viridian transition-colors disabled:bg-paper-2 disabled:text-ink-3"
                          />
                        </div>
                      ))}
                    </div>

                    {q.type === "MULTIPLE" && (
                      <p className="mt-3 text-[11px] text-ink-4 font-thai">
                        เลือกตัวเลือกที่ถูกได้มากกว่า 1 ข้อ — นักเรียนต้องเลือกให้ตรงทุกข้อจึงจะได้คะแนน
                      </p>
                    )}
                    {q.type === "TRUE_FALSE" && (
                      <p className="mt-3 text-[11px] text-ink-4 font-thai">
                        คำถามถูก/ผิด — เลือกคำตอบที่ถูกต้องด้วยการคลิกวงกลม
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add question */}
        <button
          type="button"
          onClick={addQuestion}
          className="w-full border-2 border-dashed border-line rounded-r3 py-4 flex items-center justify-center gap-2 text-[14px] text-ink-3 hover:border-viridian-3 hover:text-viridian transition-colors mb-8"
        >
          <Plus size={16} />
          เพิ่มคำถาม
        </button>

        <div className="flex items-center gap-4">
          <Button
            type="submit"
            variant="primary"
            disabled={isPending}
            className="flex items-center gap-2"
          >
            <ClipboardCheck size={15} />
            {isPending ? "กำลังบันทึก..." : "บันทึกแบบทดสอบ"}
          </Button>
          <Link
            href={`/${locale}/studio/courses/${slug}/edit`}
            className="text-[13px] text-ink-3 hover:text-ink transition-colors"
          >
            ยกเลิก
          </Link>
        </div>
      </form>
    </div>
  );
}
