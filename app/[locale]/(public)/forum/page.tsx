"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { Avatar } from "@/components/primitives/Avatar";
import { Button } from "@/components/primitives/Button";
import { MessageSquare, ChevronUp, CheckCircle, PenSquare } from "lucide-react";

const MOCK_THREADS = [
  {
    id: "t1",
    title: "วิธีสร้าง Persona ที่มีประสิทธิภาพ",
    courseTitle: "UX Design & Figma Masterclass",
    author: "วีรวัฒน์ ใจดี",
    replies: 5,
    votes: 12,
    solved: true,
    createdAt: "2 ชั่วโมงที่แล้ว",
  },
  {
    id: "t2",
    title: "ข้อแตกต่างระหว่าง Wireframe กับ Prototype",
    courseTitle: "UX Design & Figma Masterclass",
    author: "สมหญิง มีใจ",
    replies: 3,
    votes: 8,
    solved: false,
    createdAt: "5 ชั่วโมงที่แล้ว",
  },
  {
    id: "t3",
    title: "Next.js 15 มีอะไรใหม่บ้างครับ?",
    courseTitle: "Next.js 15 Fullstack Bootcamp",
    author: "ธนพล สมใจ",
    replies: 9,
    votes: 23,
    solved: true,
    createdAt: "1 วันที่แล้ว",
  },
  {
    id: "t4",
    title: "ควรใช้ Server Components หรือ Client Components?",
    courseTitle: "Next.js 15 Fullstack Bootcamp",
    author: "มนัสพงศ์ แจ่มใส",
    replies: 0,
    votes: 5,
    solved: false,
    createdAt: "3 วันที่แล้ว",
  },
  {
    id: "t5",
    title: "Gradient Descent ทำงานอย่างไร อธิบายแบบเข้าใจง่าย",
    courseTitle: "Machine Learning Specialization",
    author: "นุชนาท สุขใจ",
    replies: 7,
    votes: 31,
    solved: false,
    createdAt: "2 วันที่แล้ว",
  },
];

type FilterKey = "all" | "unanswered" | "solved" | "top";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "ทั้งหมด" },
  { key: "unanswered", label: "ยังไม่ได้ตอบ" },
  { key: "solved", label: "แก้ไขแล้ว" },
  { key: "top", label: "ถามมากสุด" },
];

export default function ForumPage() {
  const locale = useLocale();

  const [votes, setVotes] = useState<Record<string, number>>(
    Object.fromEntries(MOCK_THREADS.map((t) => [t.id, t.votes]))
  );
  const [voted, setVoted] = useState<Record<string, boolean>>({});
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  function handleVote(threadId: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (voted[threadId]) {
      setVotes((v) => ({ ...v, [threadId]: v[threadId] - 1 }));
      setVoted((v) => ({ ...v, [threadId]: false }));
    } else {
      setVotes((v) => ({ ...v, [threadId]: v[threadId] + 1 }));
      setVoted((v) => ({ ...v, [threadId]: true }));
    }
  }

  const filtered = MOCK_THREADS.filter((t) => {
    if (activeFilter === "unanswered") return t.replies === 0;
    if (activeFilter === "solved") return t.solved;
    return true;
  }).sort((a, b) => {
    if (activeFilter === "top") return b.votes - a.votes;
    return 0;
  });

  return (
    <div className="min-h-screen bg-paper">
      <TopBar />
      <main className="py-12">
        <Container>
          <div className="flex items-start justify-between mb-8">
            <div>
              <EyebrowLabel className="mb-2">COMMUNITY FORUM</EyebrowLabel>
              <h1 className="font-display text-[36px] text-ink tracking-[-0.015em]">ฟอรัม</h1>
              <p className="text-ink-3 mt-1 text-[14px]">ถามตอบและแลกเปลี่ยนกับชุมชนนักเรียน</p>
            </div>
            <Link href={`/${locale}/forum/new`}>
              <Button variant="primary" className="flex items-center gap-2">
                <PenSquare size={15} />
                ตั้งกระทู้ใหม่
              </Button>
            </Link>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {FILTERS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                className={`px-4 py-1.5 rounded-pill text-[13px] border transition-colors ${
                  activeFilter === key
                    ? "bg-viridian text-white border-viridian"
                    : "border-line text-ink-3 hover:border-viridian-3 hover:text-ink"
                }`}
              >
                {label}
                {key === "unanswered" && (
                  <span className="ml-1.5 font-mono text-[10px]">
                    ({MOCK_THREADS.filter((t) => t.replies === 0).length})
                  </span>
                )}
                {key === "solved" && (
                  <span className="ml-1.5 font-mono text-[10px]">
                    ({MOCK_THREADS.filter((t) => t.solved).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Thread list */}
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-ink-3">
              <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-[15px]">ไม่พบกระทู้ในหมวดนี้</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map((thread) => (
                <div
                  key={thread.id}
                  className="bg-paper-3 border border-line rounded-r3 p-5 flex items-center gap-4 hover:border-viridian-3 transition-colors"
                >
                  {/* Vote */}
                  <button
                    onClick={(e) => handleVote(thread.id, e)}
                    className={`flex flex-col items-center gap-1 text-center shrink-0 w-10 group transition-colors ${
                      voted[thread.id] ? "text-viridian" : "text-ink-3 hover:text-viridian"
                    }`}
                    aria-label="โหวต"
                  >
                    <ChevronUp size={16} className="transition-transform group-hover:scale-110" />
                    <span className="font-mono text-[12px]">{votes[thread.id]}</span>
                  </button>

                  {/* Content — navigate on click */}
                  <Link
                    href={`/${locale}/forum/${thread.id}`}
                    className="flex-1 min-w-0 flex items-center gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {thread.solved && (
                          <CheckCircle size={14} className="text-ok shrink-0" />
                        )}
                        <h3 className="font-semibold text-[15px] text-ink line-clamp-1">
                          {thread.title}
                        </h3>
                      </div>
                      <p className="text-[12px] text-ink-4">{thread.courseTitle}</p>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-4 shrink-0 text-[12px] text-ink-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={thread.author} size="xs" />
                        <span className="hidden sm:block">{thread.author}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MessageSquare size={12} />
                        {thread.replies}
                      </div>
                      <span className="hidden md:block">{thread.createdAt}</span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
}
