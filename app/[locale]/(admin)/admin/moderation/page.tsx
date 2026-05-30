"use client";

import { useState, useTransition, useEffect } from "react";
import { Shield, Trash2, CheckCircle, XCircle, AlertCircle, MessageSquare, BookOpen, Clock, Loader2 } from "lucide-react";
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
  price: number;
  currency: string;
  instructor: { name: string | null; email: string | null };
  updatedAt: string;
  lessonCount: number;
};

const MOCK_POSTS: PostItem[] = [
  { id: "pst_001", body: "โปรโมทบริการภายนอก ซื้อสินค้าราคาถูกที่ spam-site.com !!!", createdAt: "2026-05-18", thread: { title: "ถามเรื่อง Component Library" }, user: { name: "Spammer User", email: "spam@test.com" }, voteCount: -5 },
  { id: "pst_002", body: "เนื้อหาไม่เหมาะสม ควรลบออก มีภาษาไม่สุภาพ", createdAt: "2026-05-17", thread: { title: "ปัญหา CSS Grid" }, user: { name: "Bad Actor", email: "bad@test.com" }, voteCount: -3 },
];

type TabId = "courses" | "posts";

export default function AdminModerationPage() {
  const [activeTab, setActiveTab] = useState<TabId>("courses");
  const [posts, setPosts] = useState<PostItem[]>(MOCK_POSTS);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [alert, setAlert] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  function showAlert(type: "ok" | "err", msg: string) {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 3500);
  }

  // Fetch REVIEW courses from the server action
  useEffect(() => {
    fetch("/api/admin/review-courses")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.courses)) setCourses(data.courses);
      })
      .catch(() => {/* DB unavailable — stays empty */})
      .finally(() => setLoadingCourses(false));
  }, []);

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

  function handleApprove(id: string, title: string) {
    startTransition(async () => {
      const res = await approveCourse(id);
      if (res.success) {
        setCourses((prev) => prev.filter((c) => c.id !== id));
        showAlert("ok", `อนุมัติ "${title}" แล้ว — เผยแพร่สู่สาธารณะ`);
      } else showAlert("err", res.error ?? "เกิดข้อผิดพลาด");
    });
  }

  function handleReject(id: string, title: string) {
    startTransition(async () => {
      const res = await rejectCourse(id);
      if (res.success) {
        setCourses((prev) => prev.filter((c) => c.id !== id));
        showAlert("ok", `ส่งคืน "${title}" ให้ผู้สอนแก้ไขแล้ว`);
      } else showAlert("err", res.error ?? "เกิดข้อผิดพลาด");
    });
  }

  const tabs: { id: TabId; label: string; count: number; icon: typeof Shield }[] = [
    { id: "courses", label: "คอร์สรอตรวจสอบ", count: courses.length, icon: BookOpen },
    { id: "posts", label: "โพสต์ที่น่าสงสัย", count: posts.length, icon: MessageSquare },
  ];

  return (
    <div className="max-w-[900px] mx-auto px-8 py-8">
      <div className="mb-8">
        <EyebrowLabel className="mb-1">— MODERATION</EyebrowLabel>
        <h1 className="font-display text-[32px] text-ink tracking-[-0.015em]">Content Moderation</h1>
        <p className="text-[14px] text-ink-3 mt-1">ตรวจสอบและอนุมัติคอร์สจากอาจารย์ผู้สอน</p>
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
              <span className={`min-w-5 h-5 px-1.5 rounded-full text-[11px] flex items-center justify-center font-bold ${activeTab === id ? "bg-white/20 text-white" : "bg-danger text-white"}`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Courses tab */}
      {activeTab === "courses" && (
        <div className="flex flex-col gap-3">
          {loadingCourses && (
            <div className="flex items-center justify-center py-12 text-ink-3 gap-2">
              <Loader2 size={18} className="animate-spin" />
              <span>กำลังโหลด...</span>
            </div>
          )}

          {!loadingCourses && courses.length === 0 && (
            <div className="text-center py-12 text-ink-3 border border-dashed border-line rounded-r3">
              <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-[14px]">ไม่มีคอร์สรอตรวจสอบ</p>
              <p className="text-[12px] mt-1 text-ink-4">เมื่ออาจารย์สร้างคอร์สใหม่ จะปรากฏที่นี่</p>
            </div>
          )}

          {courses.map((course) => (
            <div key={course.id} className="bg-paper-3 border border-sky-200 rounded-r3 p-5">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-r2 bg-sky-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock size={16} className="text-sky-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-semibold text-[15px] text-ink">{course.title}</p>
                    <span className="font-mono text-[10px] bg-warn/10 text-warn px-2 py-0.5 rounded-pill uppercase">{course.level}</span>
                    {course.lessonCount > 0 && (
                      <span className="font-mono text-[10px] bg-viridian/10 text-viridian px-2 py-0.5 rounded-pill">
                        {course.lessonCount} บทเรียน
                      </span>
                    )}
                    <span className="font-mono text-[10px] bg-paper-2 text-ink-3 px-2 py-0.5 rounded-pill">
                      {course.price === 0 ? "ฟรี" : `฿${course.price.toLocaleString()}`}
                    </span>
                  </div>
                  <p className="text-[13px] text-ink-3">
                    ผู้สอน: <strong className="text-ink">{course.instructor.name}</strong>
                    {course.instructor.email && (
                      <span className="text-ink-4 ml-1">· {course.instructor.email}</span>
                    )}
                  </p>
                  <p className="font-mono text-[11px] text-ink-4 mt-0.5">
                    ส่งตรวจเมื่อ {new Date(course.updatedAt).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleReject(course.id, course.title)}
                    disabled={isPending}
                    className="flex items-center gap-1.5 px-3 py-2 border border-line rounded-r2 text-[12px] text-ink-2 hover:border-danger hover:text-danger transition-colors disabled:opacity-50"
                  >
                    <XCircle size={14} /> ส่งคืน
                  </button>
                  <button
                    onClick={() => handleApprove(course.id, course.title)}
                    disabled={isPending}
                    className="flex items-center gap-1.5 px-3 py-2 bg-ok text-white rounded-r2 text-[12px] font-medium hover:bg-ok/90 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle size={14} /> อนุมัติเผยแพร่
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Posts tab */}
      {activeTab === "posts" && (
        <div className="flex flex-col gap-3">
          {posts.length === 0 && (
            <div className="text-center py-12 text-ink-3 border border-dashed border-line rounded-r3">
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
                    <span className="font-mono text-[11px] bg-danger/10 text-danger px-2 py-0.5 rounded">
                      โหวต {post.voteCount}
                    </span>
                    <span className="text-[12px] text-ink-3">ใน &quot;{post.thread.title}&quot;</span>
                  </div>
                  <p className="text-[14px] text-ink font-thai mb-2 line-clamp-2">{post.body}</p>
                  <div className="flex items-center gap-3 text-[12px] text-ink-4">
                    <span>{post.user.name}</span>
                    <span>{post.user.email}</span>
                    <span>{post.createdAt}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeletePost(post.id)}
                  disabled={isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-danger/10 text-danger border border-danger/20 rounded-r2 text-[12px] font-medium hover:bg-danger/20 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={13} /> ลบโพสต์
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
