"use client";

import { useState, useTransition } from "react";
import { Star, MessageCircle, CheckCircle, AlertCircle, Send, HelpCircle } from "lucide-react";
import { Avatar } from "@/components/primitives/Avatar";
import { Button } from "@/components/primitives/Button";
import { addReview, askQuestion, type CourseReview, type CourseQuestion } from "@/actions/reviews";

function timeAgo(iso: string): string {
  return new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
}

function StarRow({ value, onChange, size = 26 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  const [hover, setHover] = useState(0);
  const active = hover || value;
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s} type="button" disabled={!onChange}
          onClick={() => onChange?.(s)}
          onMouseEnter={() => onChange && setHover(s)}
          onMouseLeave={() => setHover(0)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
          aria-label={`${s} ดาว`}
        >
          <Star size={size} className={s <= active ? "fill-gold text-gold" : "fill-paper-2 text-line"} />
        </button>
      ))}
    </div>
  );
}

interface Props {
  courseSlug: string;
  initialReviews: CourseReview[];
  initialQuestions: CourseQuestion[];
}

type Tab = "reviews" | "qa";

export function CourseReviews({ courseSlug, initialReviews, initialQuestions }: Props) {
  const [tab, setTab] = useState<Tab>("reviews");
  const [reviews, setReviews] = useState(initialReviews);
  const [questions, setQuestions] = useState(initialQuestions);
  const [pending, start] = useTransition();
  const [alert, setAlert] = useState<{ ok: boolean; msg: string } | null>(null);

  // Review form
  const [courseRating, setCourseRating] = useState(0);
  const [instructorRating, setInstructorRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Question form
  const [question, setQuestion] = useState("");

  function notify(ok: boolean, msg: string) {
    setAlert({ ok, msg });
    if (ok) setTimeout(() => setAlert(null), 3500);
  }

  function submitReview(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const r = await addReview({ courseSlug, courseRating, instructorRating, comment });
      if (r.success) {
        setReviews((prev) => [{
          id: `tmp_${Date.now()}`, courseSlug, userName: "คุณ", courseRating, instructorRating,
          comment: comment.trim(), createdAt: new Date().toISOString(),
        }, ...prev]);
        setCourseRating(0); setInstructorRating(0); setComment(""); setShowReviewForm(false);
        notify(true, "ขอบคุณสำหรับรีวิว!");
      } else notify(false, r.error ?? "เกิดข้อผิดพลาด");
    });
  }

  function submitQuestion(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const r = await askQuestion({ courseSlug, question });
      if (r.success) {
        setQuestions((prev) => [{
          id: `tmp_${Date.now()}`, courseSlug, userName: "คุณ", question: question.trim(),
          createdAt: new Date().toISOString(),
        }, ...prev]);
        setQuestion("");
        notify(true, "ส่งคำถามแล้ว — ผู้สอนจะตอบเร็ว ๆ นี้");
      } else notify(false, r.error ?? "เกิดข้อผิดพลาด");
    });
  }

  const avgCourse = reviews.length ? (reviews.reduce((s, r) => s + r.courseRating, 0) / reviews.length).toFixed(1) : "—";
  const avgInstructor = reviews.length ? (reviews.reduce((s, r) => s + r.instructorRating, 0) / reviews.length).toFixed(1) : "—";

  return (
    <section>
      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-line">
        {([
          { id: "reviews" as const, label: "รีวิว", icon: Star, count: reviews.length },
          { id: "qa" as const, label: "ถาม-ตอบ", icon: HelpCircle, count: questions.length },
        ]).map(({ id, label, icon: Icon, count }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-[14px] font-medium border-b-2 -mb-px transition-colors ${
              tab === id ? "border-viridian text-viridian" : "border-transparent text-ink-3 hover:text-ink"
            }`}>
            <Icon size={15} /> {label}
            <span className="font-mono text-[11px] text-ink-4">({count})</span>
          </button>
        ))}
      </div>

      {alert && (
        <div className={`flex items-center gap-2 text-[13px] rounded-r2 px-4 py-2.5 mb-4 ${alert.ok ? "bg-ok/10 border border-ok/20 text-ok" : "bg-danger/5 border border-danger/20 text-danger"}`}>
          {alert.ok ? <CheckCircle size={14} /> : <AlertCircle size={14} />}{alert.msg}
        </div>
      )}

      {/* ── REVIEWS TAB ── */}
      {tab === "reviews" && (
        <div>
          {/* Summary + write button */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-[11px] text-ink-4 font-mono uppercase tracking-wider mb-0.5">คอร์ส</p>
                <div className="flex items-center gap-1.5">
                  <Star size={16} className="fill-gold text-gold" />
                  <span className="font-display text-[24px] text-ink leading-none tabular">{avgCourse}</span>
                </div>
              </div>
              <div>
                <p className="text-[11px] text-ink-4 font-mono uppercase tracking-wider mb-0.5">ผู้สอน</p>
                <div className="flex items-center gap-1.5">
                  <Star size={16} className="fill-gold text-gold" />
                  <span className="font-display text-[24px] text-ink leading-none tabular">{avgInstructor}</span>
                </div>
              </div>
              <p className="text-[13px] text-ink-3">{reviews.length} รีวิว</p>
            </div>
            <Button variant="ghost" className="gap-2" onClick={() => setShowReviewForm((s) => !s)}>
              <MessageCircle size={15} /> เขียนรีวิว
            </Button>
          </div>

          {/* Write review form */}
          {showReviewForm && (
            <form onSubmit={submitReview} className="bg-paper-3 border border-viridian/30 rounded-r3 p-5 mb-6">
              <div className="grid sm:grid-cols-2 gap-5 mb-4">
                <div>
                  <p className="text-[13px] font-medium text-ink mb-2">ให้คะแนนคอร์ส</p>
                  <StarRow value={courseRating} onChange={setCourseRating} />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-ink mb-2">ให้คะแนนผู้สอน</p>
                  <StarRow value={instructorRating} onChange={setInstructorRating} />
                </div>
              </div>
              <textarea
                value={comment} onChange={(e) => setComment(e.target.value)} rows={3}
                placeholder="เล่าประสบการณ์การเรียนของคุณ..."
                className="w-full border border-line rounded-r2 px-3.5 py-2.5 text-[14px] font-thai bg-paper focus:outline-none focus:border-viridian resize-none mb-3"
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowReviewForm(false)}>ยกเลิก</Button>
                <Button type="submit" size="sm" disabled={pending || !courseRating || !instructorRating || !comment.trim()}>
                  {pending ? "กำลังส่ง..." : "ส่งรีวิว"}
                </Button>
              </div>
            </form>
          )}

          {/* Review list */}
          <div className="flex flex-col gap-4">
            {reviews.length === 0 && <p className="text-[14px] text-ink-4 py-8 text-center">ยังไม่มีรีวิว — เป็นคนแรกที่รีวิวคอร์สนี้!</p>}
            {reviews.map((r) => (
              <div key={r.id} className="bg-paper-3 border border-line rounded-r3 p-5">
                <div className="flex items-start justify-between gap-4 mb-2.5">
                  <div className="flex items-center gap-3">
                    <Avatar name={r.userName} size="sm" />
                    <div>
                      <p className="font-medium text-[14px] text-ink">{r.userName}</p>
                      <p className="text-[11px] text-ink-4 font-mono">{timeAgo(r.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="flex items-center gap-1 text-[12px] text-ink-3">
                      <Star size={12} className="fill-gold text-gold" /> คอร์ส <span className="tabular font-medium text-ink">{r.courseRating}</span>
                    </span>
                    <span className="flex items-center gap-1 text-[12px] text-ink-3">
                      <Star size={12} className="fill-gold text-gold" /> ผู้สอน <span className="tabular font-medium text-ink">{r.instructorRating}</span>
                    </span>
                  </div>
                </div>
                <p className="text-[14px] text-ink-2 leading-[1.7] font-thai">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Q&A TAB ── */}
      {tab === "qa" && (
        <div>
          {/* Ask form */}
          <form onSubmit={submitQuestion} className="flex gap-2 mb-6">
            <input
              value={question} onChange={(e) => setQuestion(e.target.value)}
              placeholder="สอบถามข้อสงสัยเกี่ยวกับคอร์สนี้..."
              className="flex-1 border border-line rounded-pill px-4 h-[42px] text-[14px] font-thai bg-paper-3 focus:outline-none focus:border-viridian"
            />
            <Button type="submit" disabled={pending || question.trim().length < 5} className="gap-1.5">
              <Send size={14} /> ถาม
            </Button>
          </form>

          {/* Question list */}
          <div className="flex flex-col gap-4">
            {questions.length === 0 && <p className="text-[14px] text-ink-4 py-8 text-center">ยังไม่มีคำถาม — ถามได้เลย ผู้สอนพร้อมตอบ!</p>}
            {questions.map((q) => (
              <div key={q.id} className="bg-paper-3 border border-line rounded-r3 p-5">
                <div className="flex items-start gap-3">
                  <Avatar name={q.userName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-[14px] text-ink">{q.userName}</p>
                      <p className="text-[11px] text-ink-4 font-mono">{timeAgo(q.createdAt)}</p>
                    </div>
                    <p className="text-[14px] text-ink-2 font-thai mt-1">{q.question}</p>

                    {q.answer ? (
                      <div className="mt-3 pl-3 border-l-2 border-viridian/40 bg-viridian-wash/50 rounded-r2 p-3">
                        <p className="flex items-center gap-1.5 text-[12px] font-medium text-viridian mb-1">
                          <CheckCircle size={12} /> {q.answeredBy ?? "ผู้สอน"} ตอบ
                        </p>
                        <p className="text-[13px] text-ink-2 font-thai">{q.answer}</p>
                      </div>
                    ) : (
                      <p className="mt-2 text-[12px] text-ink-4 italic">รอผู้สอนตอบ...</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
