import Link from "next/link";
import { getLocale } from "next-intl/server";
import { CheckCircle, BookOpen, ArrowRight, Download } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/primitives/Button";
import { CourseThumbnail } from "@/components/course/CourseThumbnail";
import { MOCK_COURSES } from "@/mock";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { completeOrder } from "@/actions/payment";
import { getCourseBySlug } from "@/lib/queries/courses";
import type { Course } from "@/types";

export const dynamic = "force-dynamic";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string; orderId?: string }>;
}) {
  const locale = await getLocale();
  const { courseId, orderId } = await searchParams;

  const session = await auth();

  // ── Finalize order → create enrollment(s) ──────────────────────────────────
  // โหมด mock (ไม่มี STRIPE_SECRET_KEY): Stripe webhook ไม่ทำงาน จึง finalize ที่นี่
  // โหมด Stripe จริง: webhook เป็นตัวหลัก เราย้ำเฉพาะตอน order = PAID แล้ว (กันการ enroll ฟรี)
  if (orderId && session?.user?.id) {
    if (!process.env.STRIPE_SECRET_KEY) {
      await completeOrder(orderId);
    } else {
      try {
        const ord = await db.order.findUnique({ where: { id: orderId }, select: { status: true, userId: true } });
        if (ord?.userId === session.user.id && ord.status === "PAID") {
          await completeOrder(orderId);
        }
      } catch { /* no DB */ }
    }
  }

  // ── Resolve purchased course (DB first, mock fallback) ─────────────────────
  let course: Course | null = null;
  try {
    if (courseId) {
      const dbCourse = await db.course.findUnique({ where: { id: courseId }, select: { slug: true } });
      if (dbCourse) course = await getCourseBySlug(dbCourse.slug);
    }
    if (!course && orderId) {
      const ord = await db.order.findUnique({ where: { id: orderId }, include: { items: { take: 1 } } });
      const cid = ord?.items[0]?.courseId;
      if (cid) {
        const c = await db.course.findUnique({ where: { id: cid }, select: { slug: true } });
        if (c) course = await getCourseBySlug(c.slug);
      }
    }
  } catch { /* DB unavailable — use mock */ }

  if (!course) {
    course = MOCK_COURSES.find((c) => c.id === courseId) ?? MOCK_COURSES[0];
  }

  const firstLessonId = course.sections[0]?.lessons[0]?.id ?? "";

  return (
    <div className="min-h-screen bg-paper">
      <TopBar />
      <main className="py-16">
        <Container className="max-w-[600px]">
          {/* Success icon */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 rounded-full bg-ok/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-ok" />
            </div>
            <h1 className="font-display text-[36px] text-ink tracking-[-0.015em] mb-2">
              ชำระเงินสำเร็จ!
            </h1>
            <p className="text-[15px] text-ink-3 font-thai">
              ขอบคุณที่ไว้วางใจ VERDA · คุณพร้อมเรียนได้ทันที
            </p>
            {orderId && (
              <p className="font-mono text-[12px] text-ink-4 mt-2">
                Order #{orderId}
              </p>
            )}
          </div>

          {/* Course card */}
          <div className="bg-paper-3 border border-line rounded-r3 overflow-hidden mb-6 flex gap-4 p-5">
            <div className="w-[120px] shrink-0 rounded-r2 overflow-hidden">
              <CourseThumbnail
                title={course.title}
                monogram={course.monogram}
                art={course.art}
                aspectRatio="16/9"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[10px] text-viridian uppercase tracking-[0.12em] mb-1">
                {course.tags[0]}
              </p>
              <h2 className="font-semibold text-[15px] text-ink leading-[1.3] mb-1">
                {course.title}
              </h2>
              <p className="text-[12px] text-ink-3">{course.instructor.name}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <CheckCircle size={13} className="text-ok" />
                <span className="text-[12px] text-ok font-medium">ลงทะเบียนแล้ว</span>
              </div>
            </div>
          </div>

          {/* Next steps */}
          <div className="bg-viridian-wash border border-viridian-tint rounded-r3 p-5 mb-8">
            <h3 className="font-semibold text-[14px] text-viridian mb-3">ขั้นตอนถัดไป</h3>
            <ul className="flex flex-col gap-2.5 text-[13px] text-ink-2 font-thai">
              <li className="flex items-center gap-2.5">
                <BookOpen size={14} className="text-viridian shrink-0" />
                เริ่มเรียนบทเรียนแรกได้เลย
              </li>
              <li className="flex items-center gap-2.5">
                <Download size={14} className="text-viridian shrink-0" />
                ดาวน์โหลดใบเสร็จรับเงินจากอีเมลของคุณ
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle size={14} className="text-viridian shrink-0" />
                เมื่อเรียนครบคอร์สจะได้รับใบประกาศอัตโนมัติ
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Link href={`/${locale}/learn/${course.slug}/${firstLessonId}`}>
              <Button variant="primary" size="lg" className="w-full justify-center">
                เริ่มเรียนทันที <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href={`/${locale}/dashboard`}>
              <Button variant="ghost" size="lg" className="w-full justify-center">
                ไปที่ Dashboard
              </Button>
            </Link>
          </div>
        </Container>
      </main>
    </div>
  );
}
