"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { Avatar } from "@/components/primitives/Avatar";
import { Button } from "@/components/primitives/Button";
import { ChevronUp, CheckCircle, ArrowLeft, Send, MessageSquare } from "lucide-react";

// Mock thread data — replaced by DB query when available
const MOCK_THREAD = {
  id: "t1",
  title: "วิธีสร้าง Persona ที่มีประสิทธิภาพ",
  body: "สวัสดีครับ ผมกำลังเรียนคอร์ส UX Design แล้วสงสัยว่าการสร้าง Persona ที่ดีควรมีองค์ประกอบอะไรบ้าง และมีเทคนิคอะไรในการเก็บข้อมูลจาก user research มาสร้าง Persona ให้มีประสิทธิภาพครับ",
  courseTitle: "UX Design & Figma Masterclass",
  author: "วีรวัฒน์ ใจดี",
  votes: 12,
  solved: true,
  createdAt: "2 ชั่วโมงที่แล้ว",
  posts: [
    {
      id: "p1",
      body: "Persona ที่ดีควรมาจากข้อมูล user research จริงๆ ครับ ไม่ใช่แค่การคาดเดา องค์ประกอบหลักที่ควรมี ได้แก่: ข้อมูลประชากร (อายุ อาชีพ ระดับเทค), เป้าหมายและแรงจูงใจ, ความเจ็บปวดและปัญหา (Pain points), พฤติกรรมการใช้งาน และ Quote ที่ตัวแทน",
      author: "พิมพ์พร วัฒนากร",
      isInstructor: true,
      isAnswer: true,
      votes: 8,
      createdAt: "1 ชั่วโมงที่แล้ว",
    },
    {
      id: "p2",
      body: "ขอบคุณครับ แล้วถ้าเรายังไม่มีโอกาสทำ user interview จริงๆ ควรเริ่มจากตรงไหนดีครับ?",
      author: "วีรวัฒน์ ใจดี",
      isInstructor: false,
      isAnswer: false,
      votes: 3,
      createdAt: "45 นาทีที่แล้ว",
    },
    {
      id: "p3",
      body: "ถ้ายังไม่มี budget สำหรับ user research จริง ลองเริ่มด้วย secondary research ก่อนครับ เช่น อ่าน review ใน App Store, Reddit, หรือ forum ที่เกี่ยวข้อง แล้วค่อยๆ validate ด้วย guerrilla testing ก็ได้ครับ",
      author: "สมหญิง มีใจ",
      isInstructor: false,
      isAnswer: false,
      votes: 5,
      createdAt: "30 นาทีที่แล้ว",
    },
  ],
};

export default function ForumThreadPage() {
  const locale = useLocale();
  const [threadVotes, setThreadVotes] = useState(MOCK_THREAD.votes);
  const [threadVoted, setThreadVoted] = useState(false);
  const [postVotes, setPostVotes] = useState<Record<string, number>>(
    Object.fromEntries(MOCK_THREAD.posts.map((p) => [p.id, p.votes]))
  );
  const [postVoted, setPostVoted] = useState<Record<string, boolean>>({});
  const [replyText, setReplyText] = useState("");
  const [posts, setPosts] = useState(MOCK_THREAD.posts);
  const [isPending, startTransition] = useTransition();

  function toggleThreadVote() {
    if (threadVoted) {
      setThreadVotes((v) => v - 1);
      setThreadVoted(false);
    } else {
      setThreadVotes((v) => v + 1);
      setThreadVoted(true);
    }
  }

  function togglePostVote(postId: string) {
    if (postVoted[postId]) {
      setPostVotes((v) => ({ ...v, [postId]: v[postId] - 1 }));
      setPostVoted((v) => ({ ...v, [postId]: false }));
    } else {
      setPostVotes((v) => ({ ...v, [postId]: v[postId] + 1 }));
      setPostVoted((v) => ({ ...v, [postId]: true }));
    }
  }

  function handleReply(e: React.FormEvent) {
    e.preventDefault();
    const text = replyText.trim();
    if (!text) return;
    startTransition(async () => {
      // In production: call createPost() Server Action
      setPosts((prev) => [
        ...prev,
        {
          id: `p${Date.now()}`,
          body: text,
          author: "คุณ",
          isInstructor: false,
          isAnswer: false,
          votes: 0,
          createdAt: "เมื่อสักครู่",
        },
      ]);
      setReplyText("");
    });
  }

  return (
    <div className="min-h-screen bg-paper">
      <TopBar />
      <main className="py-10">
        <Container className="max-w-[820px]">
          {/* Breadcrumb */}
          <Link
            href={`/${locale}/forum`}
            className="inline-flex items-center gap-1.5 text-[13px] text-ink-3 hover:text-ink transition-colors mb-6"
          >
            <ArrowLeft size={14} />
            กลับสู่ฟอรัม
          </Link>

          {/* Thread */}
          <div className="bg-paper-3 border border-line rounded-r3 overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex items-start gap-4">
                {/* Vote */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <button
                    onClick={toggleThreadVote}
                    className={`p-1.5 rounded-r2 transition-colors ${
                      threadVoted ? "text-viridian bg-viridian/10" : "text-ink-3 hover:text-viridian hover:bg-viridian/5"
                    }`}
                  >
                    <ChevronUp size={20} />
                  </button>
                  <span className="font-mono text-[13px] font-semibold text-ink">{threadVotes}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {MOCK_THREAD.solved && (
                      <span className="inline-flex items-center gap-1 bg-ok/10 text-ok text-[11px] font-mono px-2 py-0.5 rounded-pill uppercase tracking-wider">
                        <CheckCircle size={11} /> แก้ไขแล้ว
                      </span>
                    )}
                    <span className="font-mono text-[11px] text-viridian uppercase tracking-wider px-2 py-0.5 bg-viridian/10 rounded-pill">
                      {MOCK_THREAD.courseTitle}
                    </span>
                  </div>
                  <h1 className="font-semibold text-[22px] text-ink leading-[1.3] mb-3">{MOCK_THREAD.title}</h1>
                  <p className="text-[15px] text-ink-2 leading-[1.8] font-thai">{MOCK_THREAD.body}</p>

                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-line">
                    <Avatar name={MOCK_THREAD.author} size="sm" />
                    <div>
                      <span className="text-[13px] font-medium text-ink">{MOCK_THREAD.author}</span>
                      <span className="text-[12px] text-ink-4 ml-2 font-mono">{MOCK_THREAD.createdAt}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Replies */}
          <div className="mb-4 flex items-center gap-2">
            <MessageSquare size={16} className="text-ink-3" />
            <span className="text-[14px] font-medium text-ink">{posts.length} คำตอบ</span>
          </div>

          <div className="flex flex-col gap-4 mb-8">
            {posts.map((post) => (
              <div
                key={post.id}
                className={`rounded-r3 border overflow-hidden ${
                  post.isAnswer ? "border-ok/40 bg-ok/5" : "border-line bg-paper-3"
                }`}
              >
                {post.isAnswer && (
                  <div className="bg-ok/10 px-5 py-2 border-b border-ok/20 flex items-center gap-1.5">
                    <CheckCircle size={13} className="text-ok" />
                    <span className="text-[12px] text-ok font-mono uppercase tracking-wider">คำตอบที่ดีที่สุด</span>
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Vote */}
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <button
                        onClick={() => togglePostVote(post.id)}
                        className={`p-1 rounded-r2 transition-colors ${
                          postVoted[post.id] ? "text-viridian bg-viridian/10" : "text-ink-3 hover:text-viridian hover:bg-viridian/5"
                        }`}
                      >
                        <ChevronUp size={16} />
                      </button>
                      <span className="font-mono text-[12px] text-ink">{postVotes[post.id] ?? 0}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] text-ink-2 leading-[1.8] font-thai mb-4">{post.body}</p>
                      <div className="flex items-center gap-2">
                        <Avatar name={post.author} size="xs" />
                        <span className="text-[12px] font-medium text-ink">{post.author}</span>
                        {post.isInstructor && (
                          <span className="font-mono text-[9px] bg-viridian/10 text-viridian px-2 py-0.5 rounded-pill uppercase tracking-wider">
                            Instructor
                          </span>
                        )}
                        <span className="text-[11px] text-ink-4 font-mono">{post.createdAt}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Reply form */}
          <div className="bg-paper-3 border border-line rounded-r3 p-5">
            <h3 className="font-semibold text-[15px] text-ink mb-4">ตอบคำถาม</h3>
            <form onSubmit={handleReply}>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
                placeholder="แชร์ความรู้หรือประสบการณ์ของคุณ..."
                className="w-full border border-line rounded-r2 p-4 text-[14px] font-thai bg-paper focus:outline-none focus:border-viridian resize-none mb-3"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  className="flex items-center gap-2"
                  disabled={isPending || !replyText.trim()}
                >
                  <Send size={14} />
                  {isPending ? "กำลังส่ง..." : "ส่งคำตอบ"}
                </Button>
              </div>
            </form>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
