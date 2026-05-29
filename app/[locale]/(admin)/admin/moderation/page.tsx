"use client";

import { useState, useTransition } from "react";
import { Shield, Trash2, CheckCircle, XCircle, AlertCircle, MessageSquare, BookOpen } from "lucide-react";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { deletePost, approveCourse, rejectCourse } from "@/actions/admin";

type PostItem = {
  id: string;
  body: string;
  createdAt: string;
  thread: { title: string };
  user: { name: string | null; email: string | null };
  voteCount: number;
};

type CourseItem = {
  id: string;
  title: string;
  status: string;
  slug: string;
  level: string;
  instructor: { name: string | null; email: string | null };
  updatedAt: string;
};

const MOCK_POSTS: PostItem[] = [
  { id: "pst_001", body: "โปรโมทบริการภายนอก ซื้อสินค้าราคาถูกที่ spam-site.com !!!", createdAt: "2026-05-18", thread: { title: "ถามเรื่อง Component Library" }, user: { name: "Spammer User", email: "spam@test.com" }, voteCount: -5 },
  { id: "pst_002", body: "เนื้อหาไม่เหมาะสม ควรลบออก มีภาษาไม่สุภาพ", createdAt: "2026-05-17", thread: { title: "ปัญหา CSS Grid" }, user: { name: "Bad Actor", email: "bad@test.com" }, voteCount: -3 },
];

const MOCK_COURSES: CourseItem[] = [
  { id: "crs_review_001", title: "Python for Absolute Beginners 2026", status: "REVIEW", slug: "python-beginners-2026", level: "BEGINNER", instructor: { name: "คุณสมศักดิ์ สอนดี", email: "instructor2@verda.dev" }, updatedAt: "2026-05-15" },
  { id: "crs_review_002", title: "Advanced DevOps with Kubernetes", status: "REVIEW", slug: "devops-kubernetes-advanced", level: "ADVANCED", instructor: { name: "คุณเจษฎา ผู้เชี่ยวชาญ", email: "instructor3@verda.dev" }, updatedAt: "2026-05-14" },
];

type TabId = "posts" | "courses";

export default function AdminModerationPage() {
  const [activeTab, setActiveTab] = useState<TabId>("posts");
  const [posts, setPosts] = useState<PostItem[]>(MOCK_POSTS);
  const [courses, setCourses] = useState<CourseItem[]>(MOCK_COURSES);
  const [isPending, startTransition] = useTransition();
  const [alert, setAlert] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  function showAlert(type: "ok" | "err", msg: string) {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 3500);
  }

  function handleDeletePost(id: string) {
    if (!confirm("ลบโพสต์นี้แน่ใจหรือไม่?")) return;
    startTransition(async () => {
      const res = await deletePost(id);
      if (res.success) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        showAlert("ok", "ลบโพสต์แล้ว");
      } else showAlert("err", res.error ?? "เกิดข้อผิดพลาด");
    });
  }

  function handleApproveCourse(id: string) {
    startTransition(async () => {
      const res = await approveCourse(id);
      if (res.success) {
        setCourses((prev) => prev.filter((c) => c.id !== id));
        showAlert("ok", "อนุมัติคอร์สแล้ว");
      } else showAlert("err", res.error ?? "เกิดข้อผิดพลาด");
    });
  }

  function handleRejectCourse(id: string) {
    startTransition(async () => {
      const res = await rejectCourse(id);
      if (res.success) {
        setCourses((prev) => prev.filter((c) => c.id !== id));
        showAlert("ok", "ส่งคืนคอร์สให้ผู้สอนแล้ว");
      } else showAlert("err", res.error ?? "เกิดข้อผิดพลาด");
    });
  }

  const tabs: { id: TabId; label: string; count: number; icon: typeof Shield }[] = [
    { id: "posts", label: "โพสต์ที่น่าสงสัย", count: posts.length, icon: MessageSquare },
    { id: "courses", label: "คอร์สรอตรวจสอบ", count: courses.length, icon: BookOpen },
  ];

  return (
    <div className="max-w-[900px] mx-auto px-8 py-8">
      <div className="mb-8">
        <EyebrowLabel className="mb-1">— MODERATION</EyebrowLabel>
        <h1 className="font-display text-[32px] text-ink tracking-[-0.015em]">Content Moderation</h1>
      </div>

      {alert && (
        <div className={`flex items-center gap-2 text-[13px] rounded-r2 px-4 py-2.5 mb-5 ${alert.type === "ok" ? "bg-ok/10 border border-ok/20 text-ok" : "bg-danger/5 border border-danger/20 text-danger"}`}>
          {alert.type === "ok" ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          {alert.msg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map(({ id, label, count, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-r2 text-[13px] font-medium transition-colors ${activeTab === id ? "bg-viridian text-white" : "bg-paper-3 border border-line text-ink-2 hover:border-viridian/40"}`}>
            <Icon size={14} />
            {label}
            {count > 0 && (
              <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold ${activeTab === id ? "bg-white/20 text-white" : "bg-danger text-white"}`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Posts tab */}
      {activeTab === "posts" && (
        <div className="flex flex-col gap-3">
          {posts.length === 0 && (
            <div className="text-center py-12 text-ink-3">
              <Shield size={32} className="mx-auto mb-3 opacity-30" />
              <p>ไม่มีโพสต์ที่ต้องตรวจสอบ</p>
            </div>
          )}
          {posts.map((post) => (
            <div key={post.id} className="bg-paper-3 border border-line rounded-r3 p-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-danger/10 flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquare size={14} className="text-danger" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[11px] bg-danger/10 text-danger px-2 py-0.5 rounded">โหวต {post.voteCount}</span>
                    <span className="text-[12px] text-ink-3">ใน &quot;{post.thread.title}&quot;</span>
                  </div>
                  <p className="text-[14px] text-ink font-thai mb-2 line-clamp-2">{post.body}</p>
                  <div className="flex items-center gap-3 text-[12px] text-ink-4">
                    <span>{post.user.name}</span>
                    <span>{post.user.email}</span>
                    <span>{post.createdAt}</span>
                  </div>
                </div>
                <button onClick={() => handleDeletePost(post.id)} disabled={isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-danger/10 text-danger border border-danger/20 rounded-r2 text-[12px] font-medium hover:bg-danger/20 transition-colors disabled:opacity-50">
                  <Trash2 size={13} />ลบโพสต์
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Courses tab */}
      {activeTab === "courses" && (
        <div className="flex flex-col gap-3">
          {courses.length === 0 && (
            <div className="text-center py-12 text-ink-3">
              <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
              <p>ไม่มีคอร์สที่รอตรวจสอบ</p>
            </div>
          )}
          {courses.map((course) => (
            <div key={course.id} className="bg-paper-3 border border-line rounded-r3 p-5">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-r2 bg-warn/10 flex items-center justify-center shrink-0 mt-0.5">
                  <BookOpen size={14} className="text-warn" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-[15px] text-ink">{course.title}</p>
                    <span className="font-mono text-[10px] bg-warn/10 text-warn px-2 py-0.5 rounded-pill uppercase">{course.level}</span>
                  </div>
                  <p className="text-[13px] text-ink-3">
                    ผู้สอน: {course.instructor.name} · {course.instructor.email}
                  </p>
                  <p className="font-mono text-[11px] text-ink-4 mt-0.5">ส่งตรวจเมื่อ {course.updatedAt}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleRejectCourse(course.id)} disabled={isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-line rounded-r2 text-[12px] text-ink-2 hover:border-danger hover:text-danger transition-colors disabled:opacity-50">
                    <XCircle size={13} />ส่งคืน
                  </button>
                  <button onClick={() => handleApproveCourse(course.id)} disabled={isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-ok text-white rounded-r2 text-[12px] font-medium hover:bg-ok/90 transition-colors disabled:opacity-50">
                    <CheckCircle size={13} />อนุมัติ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
