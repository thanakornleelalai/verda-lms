import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { MOCK_COURSES, MOCK_INSTRUCTOR } from "@/mock";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { formatNumber } from "@/lib/utils";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

type StudentRow = {
  userId: string;
  name: string;
  email: string;
  courseTitle: string;
  enrolledAt: string;
  progress: number;
};

export default async function StudioStudentsPage() {
  const session = await auth();
  const userId = session?.user?.id ?? "";

  let students: StudentRow[] = [];
  let totalEnrollments = 0;

  try {
    const enrollments = await db.enrollment.findMany({
      where: { course: { instructorId: userId } },
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { title: true, id: true } },
      },
      orderBy: { enrolledAt: "desc" },
      take: 100,
    });

    totalEnrollments = enrollments.length;

    const progressMap = await db.userCourseProgress.findMany({
      where: {
        userId: { in: enrollments.map((e) => e.userId) },
        courseId: { in: enrollments.map((e) => e.courseId) },
      },
      select: { userId: true, courseId: true, progressPct: true },
    });
    const progressLookup = new Map(progressMap.map((p) => [`${p.userId}:${p.courseId}`, p.progressPct]));

    students = enrollments.map((e) => ({
      userId: e.user.id,
      name: e.user.name ?? "—",
      email: e.user.email ?? "—",
      courseTitle: e.course.title,
      enrolledAt: e.enrolledAt.toISOString().slice(0, 10),
      progress: progressLookup.get(`${e.userId}:${e.courseId}`) ?? 0,
    }));
  } catch {
    // Mock fallback
    const mockCourses = MOCK_COURSES.filter((c) => c.instructorId === MOCK_INSTRUCTOR.id);
    totalEnrollments = mockCourses.reduce((s, c) => s + c.enrollmentCount, 0);

    const MOCK_STUDENTS: StudentRow[] = [
      { userId: "usr_s1", name: "คุณสมชาย ทดสอบ", email: "demo@verda.dev", courseTitle: mockCourses[0]?.title ?? "—", enrolledAt: "2026-04-15", progress: 60 },
      { userId: "usr_s2", name: "คุณสุภาพร มั่นใจ", email: "supaporn@example.com", courseTitle: mockCourses[0]?.title ?? "—", enrolledAt: "2026-04-10", progress: 28 },
      { userId: "usr_s3", name: "คุณวิชัย เก่งมาก", email: "vichai@example.com", courseTitle: mockCourses[0]?.title ?? "—", enrolledAt: "2026-03-22", progress: 100 },
      { userId: "usr_s4", name: "คุณนภา สวยงาม", email: "napa@example.com", courseTitle: mockCourses[0]?.title ?? "—", enrolledAt: "2026-03-10", progress: 45 },
      { userId: "usr_s5", name: "คุณปรีชา ฉลาดดี", email: "preecha@example.com", courseTitle: mockCourses[0]?.title ?? "—", enrolledAt: "2026-02-28", progress: 80 },
    ];
    students = MOCK_STUDENTS;
  }

  return (
    <div className="p-8 max-w-[1100px]">
      <div className="flex items-start justify-between mb-8">
        <div>
          <EyebrowLabel className="mb-1">STUDIO / STUDENTS</EyebrowLabel>
          <h1 className="font-display text-[32px] text-ink tracking-[-0.015em]">ผู้เรียน</h1>
          <p className="text-[14px] text-ink-3 mt-1">
            <strong className="text-ink">{formatNumber(totalEnrollments)}</strong> การลงทะเบียนทั้งหมด
          </p>
        </div>
        <div className="flex items-center gap-2 bg-paper-3 border border-line rounded-r3 px-4 py-3">
          <Users size={18} className="text-viridian" />
          <div>
            <p className="font-mono text-[10px] text-ink-3 tracking-wide uppercase">นักเรียนทั้งหมด</p>
            <p className="font-display text-[22px] text-viridian leading-tight">{formatNumber(totalEnrollments)}</p>
          </div>
        </div>
      </div>

      <div className="bg-paper-3 border border-line rounded-r3 overflow-hidden">
        <div className="px-5 py-3 border-b border-line bg-paper-2 flex items-center gap-4">
          <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-ink-3">รายชื่อนักเรียนล่าสุด</p>
          <span className="text-[11px] text-ink-4">(แสดง {students.length} รายการ)</span>
        </div>
        {students.length === 0 ? (
          <div className="py-16 text-center text-ink-3 text-[14px]">ยังไม่มีผู้เรียนลงทะเบียน</div>
        ) : (
          <table className="w-full text-[14px]">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left px-5 py-3 font-mono text-[10px] tracking-[0.1em] uppercase text-ink-3">ชื่อ</th>
                <th className="text-left px-5 py-3 font-mono text-[10px] tracking-[0.1em] uppercase text-ink-3">คอร์ส</th>
                <th className="text-center px-5 py-3 font-mono text-[10px] tracking-[0.1em] uppercase text-ink-3">ความคืบหน้า</th>
                <th className="text-right px-5 py-3 font-mono text-[10px] tracking-[0.1em] uppercase text-ink-3">วันที่ลงทะเบียน</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.userId + s.courseTitle} className="border-b border-line last:border-0 hover:bg-paper-2 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium text-ink">{s.name}</p>
                    <p className="text-[12px] text-ink-3">{s.email}</p>
                  </td>
                  <td className="px-5 py-3 text-ink-2 max-w-[260px] truncate">{s.courseTitle}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-24 h-1.5 bg-line rounded-full overflow-hidden">
                        <div
                          className="h-full bg-viridian rounded-full transition-all"
                          style={{ width: `${s.progress}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] text-ink-3 w-8 text-right">{s.progress}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-[12px] text-ink-3">{s.enrolledAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
