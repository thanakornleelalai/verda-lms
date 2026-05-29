"use client";

import { useState, useCallback, useTransition } from "react";
import Link from "next/link";
import MuxPlayer from "@mux/mux-player-react";
import {
  CheckCircle, ChevronRight, ChevronLeft,
  MessageSquare, FileText, Mic, BookOpen,
  Save, ClipboardCheck, Send, Lock,
  ArrowLeft, Play, LayoutList, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Course, Lesson, Section } from "@/types";
import { saveNote, createThread, createPost } from "@/actions/learn";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Tab = "notes" | "resources" | "qa" | "transcript";

export type ThreadWithPosts = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  user: { id: string; name: string; image: string | null };
  posts: {
    id: string;
    body: string;
    createdAt: string;
    user: { id: string; name: string; image: string | null };
  }[];
};

interface LessonPlayerProps {
  course: Course;
  currentLesson: Lesson;
  currentSection: Section;
  prevLesson: Lesson | null;
  nextLesson: Lesson | null;
  locale: string;
  userId: string;
  initialCompletedIds: string[];
  initialThreads?: ThreadWithPosts[];
  startTime?: number;
  enrolledAt?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: TopNav
// Provides "Back to Course" breadcrumb + course title + sidebar toggle.
//
// Routing logic:
//   The `slug` comes directly from the `course` prop (e.g. "ux-design-figma-masterclass").
//   We never parse the URL manually — the server page already resolved
//   the slug from the dynamic segment [slug] and passed it as course.slug,
//   so the "Back to Course" link is always correct:
//     /${locale}/courses/${course.slug}
// ─────────────────────────────────────────────────────────────────────────────
interface TopNavProps {
  locale: string;
  courseSlug: string;
  courseTitle: string;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

function TopNav({ locale, courseSlug, courseTitle, sidebarOpen, onToggleSidebar }: TopNavProps) {
  return (
    <div className="flex items-center justify-between px-5 py-3 bg-[#0E1612] border-b border-[#2A332E] shrink-0 z-10">
      {/* ── Left: Back-to-Course link ───────────────────────────────────── */}
      {/*
       * Dynamic URL: /${locale}/courses/${courseSlug}
       * courseSlug is derived from course.slug (server-resolved from [slug] param),
       * so this always points back to the correct course detail page.
       */}
      <Link
        href={`/${locale}/courses/${courseSlug}`}
        className="flex items-center gap-1.5 text-[13px] text-[#8A938E] hover:text-white transition-colors group"
      >
        <ArrowLeft
          size={15}
          className="group-hover:-translate-x-0.5 transition-transform duration-150"
        />
        <span className="hidden sm:inline">กลับไปยังคอร์ส</span>
        <span className="sm:hidden">กลับ</span>
      </Link>

      {/* ── Center: Course title ────────────────────────────────────────── */}
      <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#6E756F] hidden md:block truncate max-w-[360px]">
        {courseTitle}
      </p>

      {/* ── Right: Sidebar toggle ───────────────────────────────────────── */}
      <button
        onClick={onToggleSidebar}
        aria-label={sidebarOpen ? "ปิดเมนูคอร์ส" : "เปิดเมนูคอร์ส"}
        className="flex items-center gap-1.5 text-[13px] text-[#8A938E] hover:text-white transition-colors"
      >
        <LayoutList size={15} />
        <span className="hidden sm:inline">
          {sidebarOpen ? "ซ่อนเมนู" : "เมนูคอร์ส"}
        </span>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: VideoPlaceholder
// Shown when a VIDEO lesson has no Mux playbackId yet (e.g. content being processed).
// Uses the course's art gradient + monogram so it always matches the course brand.
// If a lesson later gains a playbackId, the MuxPlayer renders instead.
// ─────────────────────────────────────────────────────────────────────────────
interface VideoPlaceholderProps {
  courseArt?: string;
  courseMonogram?: string;
  lessonTitle: string;
}

function VideoPlaceholder({ courseArt, courseMonogram, lessonTitle }: VideoPlaceholderProps) {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden select-none"
      style={{
        background: courseArt ?? "linear-gradient(135deg, #0F5D4A 0%, #1A7A60 100%)",
      }}
    >
      {/* Diagonal stripe texture */}
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(255,255,255,0.15) 0 12px, transparent 12px 24px)",
        }}
      />

      {/* Large monogram watermark */}
      {courseMonogram && (
        <span className="absolute inset-0 flex items-center justify-center font-display text-[110px] text-white/[0.08] italic pointer-events-none">
          {courseMonogram}
        </span>
      )}

      {/* Centred play-button circle */}
      <div className="relative z-10 flex flex-col items-center gap-5">
        <div className="w-[72px] h-[72px] rounded-full bg-white/15 border-2 border-white/30 flex items-center justify-center backdrop-blur-sm shadow-lg">
          <Play size={28} className="text-white translate-x-0.5" />
        </div>

        <div className="text-center">
          <p className="text-white/80 text-[14px] font-semibold font-thai">{lessonTitle}</p>
          <p className="text-white/35 text-[11px] font-mono tracking-[0.1em] uppercase mt-1">
            วิดีโอกำลังประมวลผล…
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: QuizCTAPanel
// Displayed between the lesson-controls bar and the tab panel when a QUIZ
// lesson exists after the current lesson within the same section.
//
// Routing logic for the CTA button:
//   /${locale}/learn/${courseSlug}/${quizLesson.id}
// The page.tsx for that route automatically redirects QUIZ lessons to the
// dedicated quiz runner: /${locale}/learn/${slug}/quiz/${lessonId}
// ─────────────────────────────────────────────────────────────────────────────
interface QuizCTAPanelProps {
  locale: string;
  courseSlug: string;
  quizLesson: Lesson;
  /** true  → quiz is the very next lesson in the course   */
  /** false → quiz exists later in the same section        */
  isNextImmediate: boolean;
  isCurrentComplete: boolean;
}

function QuizCTAPanel({
  locale,
  courseSlug,
  quizLesson,
  isNextImmediate,
  isCurrentComplete,
}: QuizCTAPanelProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-6 py-4 shrink-0 border-y transition-all",
        isCurrentComplete
          ? "bg-amber-500/15 border-amber-500/30"
          : "bg-amber-500/8 border-amber-500/15"
      )}
    >
      {/* Left — icon + description */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
            isCurrentComplete ? "bg-amber-500/30" : "bg-amber-500/15"
          )}
        >
          <ClipboardCheck
            size={18}
            className={isCurrentComplete ? "text-amber-300" : "text-amber-400/70"}
          />
        </div>
        <div className="min-w-0">
          <p className="text-white text-[14px] font-semibold truncate">
            {isNextImmediate
              ? isCurrentComplete
                ? "พร้อมทำแบบทดสอบ!"
                : "ถัดไป: แบบทดสอบ"
              : "แบบทดสอบในบทนี้"}
          </p>
          <p className="text-[#8A938E] text-[12px] mt-0.5 truncate">{quizLesson.title}</p>
        </div>
      </div>

      {/* Right — CTA button */}
      <Link
        href={`/${locale}/learn/${courseSlug}/${quizLesson.id}`}
        className={cn(
          "flex items-center gap-2 px-5 py-2.5 rounded-pill font-bold text-[13px] transition-all shrink-0 ml-4 whitespace-nowrap",
          isCurrentComplete
            ? "bg-amber-400 hover:bg-amber-300 text-amber-950 shadow-lg shadow-amber-500/20"
            : "bg-amber-500/20 hover:bg-amber-500/35 text-amber-300 border border-amber-500/30"
        )}
      >
        {isCurrentComplete && <Sparkles size={13} />}
        <ClipboardCheck size={13} />
        ทำแบบทดสอบ
      </Link>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component: LessonPlayer
// ─────────────────────────────────────────────────────────────────────────────

export function LessonPlayer({
  course,
  currentLesson,
  currentSection,
  prevLesson,
  nextLesson,
  locale,
  userId,
  initialCompletedIds,
  initialThreads = [],
  startTime,
  enrolledAt,
}: LessonPlayerProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("notes");
  const [completedIds, setCompletedIds] = useState<Set<string>>(
    new Set(initialCompletedIds)
  );
  const [notes, setNotes] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const [isSavingNote, startNoteSave] = useTransition();
  const [threads, setThreads] = useState<ThreadWithPosts[]>(initialThreads);
  const [qaText, setQaText] = useState("");
  const [isPostingQa, startPostingQa] = useTransition();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  // ── Completion tracking ────────────────────────────────────────────────────
  const isCurrentComplete = completedIds.has(currentLesson.id);

  const markComplete = useCallback(async () => {
    if (!currentLesson || completedIds.has(currentLesson.id)) return;
    setCompletedIds((s) => new Set([...s, currentLesson.id]));
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/progress",
        JSON.stringify({
          userId,
          courseId: course.id,
          lessonId: currentLesson.id,
          progressPct: 100,
        })
      );
    }
  }, [currentLesson, completedIds, userId, course.id]);

  const handleTimeUpdate = useCallback(
    (pct: number) => {
      if (pct >= 90 && !completedIds.has(currentLesson.id)) {
        markComplete();
      }
    },
    [completedIds, currentLesson.id, markComplete]
  );

  // ── Quiz detection ─────────────────────────────────────────────────────────
  // Find the next QUIZ lesson after the current lesson within the same section.
  // We sort by `order` to guarantee correct sequencing.
  const nextQuizInSection: Lesson | null =
    currentSection.lessons
      .filter((l) => l.order > currentLesson.order && l.type === "QUIZ")
      .sort((a, b) => a.order - b.order)[0] ?? null;

  // Prefer the immediately-next lesson if it's a quiz; otherwise fall back to
  // any quiz further ahead in the same section.
  const quizLesson: Lesson | null =
    nextLesson?.type === "QUIZ" ? nextLesson : nextQuizInSection;

  // Used to differentiate CTA label: "ถัดไป" vs "บทนี้"
  const isQuizNextImmediate = nextLesson?.type === "QUIZ";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-ink overflow-hidden">

      {/* ════════════════════════════════════════════════════════════════════
          MAIN CONTENT COLUMN
          ════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── 1. Top navigation bar ──────────────────────────────────────── */}
        <TopNav
          locale={locale}
          courseSlug={course.slug}
          courseTitle={course.title}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((o) => !o)}
        />

        {/* ── 2. Video / article area ────────────────────────────────────── */}
        <div
          className="relative bg-black flex-shrink-0"
          style={{ aspectRatio: "16/9", maxHeight: "60vh" }}
        >
          {currentLesson.type === "ARTICLE" ? (
            /* ── Article reader ──────────────────────────────────────── */
            <div className="w-full h-full overflow-auto bg-[#111816]">
              <div className="max-w-[700px] mx-auto px-8 py-6">
                <span className="font-mono text-[10px] text-[#6E756F] tracking-[0.12em] uppercase">
                  ARTICLE
                </span>
                <h2 className="text-white font-semibold text-[18px] mt-2 mb-5">
                  {currentLesson.title}
                </h2>
                {currentLesson.content ? (
                  <div className="text-[15px] leading-[1.8] text-[#C9CDC8] whitespace-pre-line font-thai">
                    {currentLesson.content}
                  </div>
                ) : (
                  <p className="text-[#6E756F] text-[14px] italic">
                    ไม่มีเนื้อหาสำหรับบทเรียนนี้
                  </p>
                )}
              </div>
            </div>
          ) : currentLesson.videoAsset?.startsWith("yt:") ? (
            /* ── YouTube embed ───────────────────────────────────────── */
            <iframe
              key={currentLesson.id}
              src={`https://www.youtube.com/embed/${currentLesson.videoAsset.slice(3)}?rel=0&modestbranding=1`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title={currentLesson.title}
            />
          ) : currentLesson.playbackId ? (
            /* ── Mux video player ────────────────────────────────────── */
            <MuxPlayer
              streamType="on-demand"
              playbackId={currentLesson.playbackId}
              startTime={startTime}
              style={{ width: "100%", height: "100%" }}
              onTimeUpdate={(e) => {
                const video = e.currentTarget as HTMLVideoElement & {
                  duration?: number;
                  currentTime?: number;
                };
                if (video.duration && video.currentTime) {
                  handleTimeUpdate((video.currentTime / video.duration) * 100);
                }
              }}
            />
          ) : (
            /* ── Placeholder when no video source ───────────────────── */
            <VideoPlaceholder
              courseArt={course.art}
              courseMonogram={course.monogram}
              lessonTitle={currentLesson.title}
            />
          )}
        </div>

        {/* ── 3. Lesson info + prev / next controls ─────────────────────── */}
        <div className="bg-[#1c2421] border-b border-[#2A332E] px-6 py-4 flex items-center justify-between gap-4 shrink-0">
          <div className="min-w-0">
            <p className="font-mono text-[10px] text-[#6E756F] tracking-[0.1em] uppercase truncate">
              {currentSection.title} · {course.title}
            </p>
            <h1 className="text-white font-semibold text-[16px] truncate mt-0.5">
              {currentLesson.title}
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {prevLesson && (
              <Link
                href={`/${locale}/learn/${course.slug}/${prevLesson.id}`}
                className="flex items-center gap-1 text-[13px] text-[#8A938E] hover:text-white transition-colors"
              >
                <ChevronLeft size={15} />
                ก่อนหน้า
              </Link>
            )}

            <button
              onClick={markComplete}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-pill text-[13px] border transition-all",
                isCurrentComplete
                  ? "bg-ok/20 border-ok/30 text-ok"
                  : "border-[#3A4842] text-[#8A938E] hover:border-ok/50 hover:text-ok"
              )}
            >
              <CheckCircle size={14} />
              {isCurrentComplete ? "เรียนแล้ว" : "ทำเครื่องหมาย"}
            </button>

            {nextLesson && nextLesson.type !== "QUIZ" && (
              <Link
                href={`/${locale}/learn/${course.slug}/${nextLesson.id}`}
                className="flex items-center gap-1 px-4 py-2 bg-viridian hover:bg-viridian-2 text-white text-[13px] rounded-pill transition-colors"
              >
                ถัดไป <ChevronRight size={15} />
              </Link>
            )}
          </div>
        </div>

        {/* ── 4. Take Quiz CTA ───────────────────────────────────────────── */}
        {/*
         * Render the QuizCTAPanel whenever there is a QUIZ lesson ahead in
         * the current section. The panel becomes more prominent (brighter amber)
         * once the user has marked the current lesson complete.
         */}
        {quizLesson && (
          <QuizCTAPanel
            locale={locale}
            courseSlug={course.slug}
            quizLesson={quizLesson}
            isNextImmediate={isQuizNextImmediate}
            isCurrentComplete={isCurrentComplete}
          />
        )}

        {/* ── 5. Tab panel (notes / resources / transcript / Q&A) ───────── */}
        <div className="flex-1 overflow-hidden flex flex-col bg-paper">
          <div className="flex border-b border-line bg-paper-2 shrink-0">
            {(
              [
                { id: "notes" as Tab, label: "โน้ต", icon: FileText },
                { id: "resources" as Tab, label: "ไฟล์แนบ", icon: BookOpen },
                { id: "transcript" as Tab, label: "Transcript", icon: Mic },
                { id: "qa" as Tab, label: "Q&A", icon: MessageSquare },
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-3 text-[13px] border-b-2 transition-colors",
                  activeTab === id
                    ? "border-viridian text-viridian font-medium"
                    : "border-transparent text-ink-3 hover:text-ink"
                )}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-auto p-6">
            {/* ── Notes tab ───────────────────────────────────────────── */}
            {activeTab === "notes" && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[13px] text-ink-3">บันทึกส่วนตัวของคุณ</p>
                  {noteSaved && (
                    <span className="text-[11px] text-ok font-mono">บันทึกแล้ว ✓</span>
                  )}
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value);
                    setNoteSaved(false);
                  }}
                  rows={8}
                  placeholder="จดโน้ตที่นี่..."
                  className="w-full border border-line rounded-r2 p-4 text-[14px] font-thai bg-paper-3 focus:outline-none focus:border-viridian resize-none"
                />
                <button
                  onClick={() => {
                    startNoteSave(async () => {
                      await saveNote(currentLesson.id, notes);
                      setNoteSaved(true);
                    });
                  }}
                  disabled={isSavingNote || !notes.trim()}
                  className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-viridian text-white text-[13px] rounded-pill hover:bg-viridian-2 disabled:opacity-50 transition-colors"
                >
                  <Save size={13} />
                  {isSavingNote ? "กำลังบันทึก..." : "บันทึกโน้ต"}
                </button>
              </div>
            )}

            {/* ── Resources tab ────────────────────────────────────────── */}
            {activeTab === "resources" && (
              <div className="text-[13px] text-ink-3 py-8 text-center">
                ไม่มีไฟล์แนบในบทเรียนนี้
              </div>
            )}

            {/* ── Transcript tab ───────────────────────────────────────── */}
            {activeTab === "transcript" && (
              <div className="text-[14px] text-ink-4 italic text-center py-8">
                Transcript กำลังประมวลผล...
              </div>
            )}

            {/* ── Q&A tab ─────────────────────────────────────────────── */}
            {activeTab === "qa" && (
              <div className="flex flex-col gap-5">
                <div>
                  <textarea
                    value={qaText}
                    onChange={(e) => setQaText(e.target.value)}
                    rows={3}
                    placeholder="ถามคำถามเกี่ยวกับบทเรียนนี้..."
                    className="w-full border border-line rounded-r2 p-4 text-[14px] font-thai bg-paper-3 focus:outline-none focus:border-viridian resize-none mb-2"
                  />
                  <button
                    disabled={isPostingQa || !qaText.trim()}
                    onClick={() => {
                      const text = qaText.trim();
                      if (!text) return;
                      startPostingQa(async () => {
                        const res = await createThread({
                          courseId: course.id,
                          lessonId: currentLesson.id,
                          title: text.slice(0, 120),
                          body: text,
                        });
                        if ("threadId" in res && res.threadId) {
                          setThreads((prev) => [
                            {
                              id: res.threadId!,
                              title: text.slice(0, 120),
                              body: text,
                              createdAt: new Date().toISOString(),
                              user: { id: userId, name: "คุณ", image: null },
                              posts: [],
                            },
                            ...prev,
                          ]);
                        }
                        setQaText("");
                      });
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-viridian text-white text-[13px] rounded-pill hover:bg-viridian-2 disabled:opacity-50 transition-colors"
                  >
                    <Send size={13} />
                    {isPostingQa ? "กำลังส่ง..." : "ส่งคำถาม"}
                  </button>
                </div>

                {threads.length === 0 ? (
                  <p className="text-[13px] text-ink-4 text-center py-6">
                    ยังไม่มีคำถาม — เป็นคนแรกที่ถาม!
                  </p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {threads.map((thread) => (
                      <div
                        key={thread.id}
                        className="border border-line rounded-r3 overflow-hidden"
                      >
                        <div className="px-4 py-3 bg-paper-2">
                          <p className="text-[14px] font-medium text-ink">{thread.body}</p>
                          <p className="text-[11px] text-ink-4 mt-1 font-mono">
                            {thread.user.name} ·{" "}
                            {new Date(thread.createdAt).toLocaleDateString("th-TH")}
                          </p>
                        </div>
                        {thread.posts.length > 0 && (
                          <div className="px-4 py-2 flex flex-col gap-2 border-t border-line">
                            {thread.posts.map((post) => (
                              <div key={post.id} className="text-[13px]">
                                <span className="font-medium text-ink">
                                  {post.user.name}:{" "}
                                </span>
                                <span className="text-ink-2">{post.body}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="px-4 py-2 border-t border-line">
                          {replyingTo === thread.id ? (
                            <div className="flex gap-2">
                              <input
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="ตอบกลับ..."
                                className="flex-1 border border-line rounded-r2 px-3 py-1.5 text-[13px] bg-paper-3 focus:outline-none focus:border-viridian"
                              />
                              <button
                                disabled={!replyText.trim()}
                                onClick={() => {
                                  const text = replyText.trim();
                                  if (!text) return;
                                  startPostingQa(async () => {
                                    const res = await createPost(thread.id, text);
                                    if ("postId" in res) {
                                      setThreads((prev) =>
                                        prev.map((t) =>
                                          t.id === thread.id
                                            ? {
                                                ...t,
                                                posts: [
                                                  ...t.posts,
                                                  {
                                                    id: res.postId!,
                                                    body: text,
                                                    createdAt: new Date().toISOString(),
                                                    user: {
                                                      id: userId,
                                                      name: "คุณ",
                                                      image: null,
                                                    },
                                                  },
                                                ],
                                              }
                                            : t
                                        )
                                      );
                                    }
                                    setReplyText("");
                                    setReplyingTo(null);
                                  });
                                }}
                                className="px-3 py-1.5 bg-viridian text-white text-[12px] rounded-pill hover:bg-viridian-2 disabled:opacity-50"
                              >
                                ส่ง
                              </button>
                              <button
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyText("");
                                }}
                                className="px-3 py-1.5 text-[12px] text-ink-3 hover:text-ink"
                              >
                                ยกเลิก
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setReplyingTo(thread.id);
                                setReplyText("");
                              }}
                              className="text-[12px] text-viridian hover:underline"
                            >
                              ตอบกลับ
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          CURRICULUM SIDEBAR
          ════════════════════════════════════════════════════════════════════ */}
      <aside
        className={cn(
          "bg-[#1c2421] border-l border-[#2A332E] flex flex-col transition-all duration-200 overflow-hidden shrink-0",
          sidebarOpen ? "w-[300px]" : "w-0"
        )}
      >
        <div className="px-5 py-4 border-b border-[#2A332E] flex items-center justify-between shrink-0">
          <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-[#6E756F]">
            CURRICULUM
          </p>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-[#6E756F] hover:text-white text-[18px] leading-none"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {course.sections.map((section) => (
            <div key={section.id}>
              <div className="px-5 py-3 border-b border-[#2A332E]">
                <p className="font-semibold text-[13px] text-white">{section.title}</p>
                <p className="text-[11px] text-[#6E756F] mt-0.5">
                  {section.lessons.length} บทเรียน
                </p>
              </div>

              {section.lessons.map((lesson) => {
                const isActive = lesson.id === currentLesson.id;
                const isDone = completedIds.has(lesson.id);
                const isLocked =
                  !isDone &&
                  (lesson.drip ?? 0) > 0 &&
                  !!enrolledAt &&
                  Date.now() <
                    new Date(enrolledAt).getTime() +
                      (lesson.drip ?? 0) * 86_400_000;
                const dripDay = lesson.drip ?? 0;

                const rowContent = (
                  <>
                    <span
                      className={cn(
                        "w-4 h-4 rounded-full border shrink-0 flex items-center justify-center",
                        isDone
                          ? "bg-ok border-ok"
                          : isActive
                          ? "border-viridian-3"
                          : "border-[#3A4842]"
                      )}
                    >
                      {isDone && <CheckCircle size={12} className="text-white" />}
                    </span>

                    {isLocked ? (
                      <Lock size={11} className="shrink-0 text-[#6E756F] mt-0.5" />
                    ) : lesson.type === "ARTICLE" ? (
                      <FileText size={11} className="shrink-0 text-[#6E756F] mt-0.5" />
                    ) : lesson.type === "QUIZ" ? (
                      <ClipboardCheck size={11} className="shrink-0 text-amber-400/80 mt-0.5" />
                    ) : null}

                    <span className="flex-1 line-clamp-2 leading-snug">{lesson.title}</span>

                    {isLocked ? (
                      <span className="font-mono text-[9px] text-[#6E756F] shrink-0">
                        วันที่ {dripDay}
                      </span>
                    ) : lesson.type === "QUIZ" ? (
                      <span className="font-mono text-[9px] text-amber-400/70 shrink-0 uppercase tracking-wider">
                        Quiz
                      </span>
                    ) : lesson.duration ? (
                      <span className="font-mono text-[10px] text-[#6E756F] shrink-0">
                        {Math.floor(lesson.duration / 60)}m
                      </span>
                    ) : null}
                  </>
                );

                if (isLocked) {
                  return (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-3 px-5 py-3 border-b border-[#232a26] text-[13px] text-[#4A534D] cursor-not-allowed opacity-60"
                      title={`ปลดล็อกหลังจากวันที่ ${dripDay} ของการเรียน`}
                    >
                      {rowContent}
                    </div>
                  );
                }

                return (
                  <Link
                    key={lesson.id}
                    href={`/${locale}/learn/${course.slug}/${lesson.id}`}
                    className={cn(
                      "flex items-center gap-3 px-5 py-3 border-b border-[#232a26] text-[13px] transition-colors",
                      isActive
                        ? "bg-viridian/20 text-white"
                        : "text-[#8A938E] hover:bg-[#232a26] hover:text-white"
                    )}
                  >
                    {rowContent}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
