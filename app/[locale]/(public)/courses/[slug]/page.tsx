import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Clock, Users, Star, ChevronDown, CheckCircle, Play, FileText, BookOpen, ClipboardCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCourses } from "@/lib/queries/courses";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/primitives/Button";
import { Tag } from "@/components/primitives/Tag";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { Avatar } from "@/components/primitives/Avatar";
import { CourseThumbnail } from "@/components/course/CourseThumbnail";
import { CourseGrid } from "@/components/course/CourseGrid";
import { CourseReviews } from "@/components/course/CourseReviews";
import { WishlistButton } from "@/components/course/WishlistButton";
import { AddToCartButton } from "@/components/course/AddToCartButton";
import { MOCK_COURSES, MOCK_ENROLLMENTS } from "@/mock";
import { formatPrice, formatDuration, formatNumber } from "@/lib/utils";
import { createFreeEnrollment } from "@/actions/enrollment";
import { getReviews, getQuestions } from "@/actions/reviews";
import type { Course } from "@/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = MOCK_COURSES.find((c) => c.slug === slug);
  if (!course) return {};
  return { title: course.title, description: course.description };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;

  const session = await auth();
  const userId = session?.user?.id;

  let course: Course | undefined = MOCK_COURSES.find((c) => c.slug === slug);
  let isEnrolled = false;

  try {
    const dbCourse = await db.course.findUnique({
      where: { slug },
      include: {
        instructor: { select: { id: true, name: true, image: true } },
        sections: {
          orderBy: { order: "asc" },
          include: { lessons: { orderBy: { order: "asc" } } },
        },
      },
    });

    if (!dbCourse) notFound();

    course = {
      id: dbCourse.id,
      tenantId: dbCourse.tenantId ?? "default",
      slug: dbCourse.slug,
      title: dbCourse.title,
      description: dbCourse.description ?? undefined,
      status: dbCourse.status as "PUBLISHED",
      price: dbCourse.price,
      currency: dbCourse.currency,
      level: dbCourse.level as "BEGINNER",
      language: dbCourse.language,
      instructorId: dbCourse.instructorId,
      instructor: {
        id: dbCourse.instructor.id,
        name: dbCourse.instructor.name ?? "Instructor",
        avatarUrl: dbCourse.instructor.image ?? undefined,
      },
      sections: dbCourse.sections.map((s) => ({
        id: s.id,
        courseId: s.courseId,
        title: s.title,
        order: s.order,
        lessons: s.lessons.map((l) => ({
          id: l.id,
          sectionId: l.sectionId,
          title: l.title,
          order: l.order,
          type: l.type as "VIDEO",
          duration: l.duration ?? undefined,
          isFree: l.isFree,
        })),
      })),
      totalDuration: dbCourse.totalDuration,
      enrollmentCount: dbCourse.enrollmentCount,
      rating: dbCourse.rating,
      ratingCount: dbCourse.ratingCount,
      tags: dbCourse.tags,
      updatedAt: dbCourse.updatedAt.toISOString(),
      art: dbCourse.art ?? undefined,
      monogram: dbCourse.monogram ?? undefined,
    };

    if (userId) {
      const enrollment = await db.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId: dbCourse.id } },
        select: { id: true },
      });
      isEnrolled = !!enrollment;
    }
  } catch {
    // DB unavailable — use mock
    if (!course) notFound();
    if (userId) {
      isEnrolled = MOCK_ENROLLMENTS.some(
        (e) => e.userId === userId && e.courseId === course!.id
      );
    }
  }

  if (!course) notFound();

  const firstLessonId = course.sections[0]?.lessons[0]?.id ?? "";

  // Related courses — from live DB (fallback to mock when DB unavailable)
  let related: Course[] = [];
  try {
    const { courses } = await getCourses({ pageSize: 8 });
    related = courses.filter((c) => c.id !== course!.id).slice(0, 4);
  } catch {
    related = [];
  }
  if (related.length === 0) {
    related = MOCK_COURSES.filter((c) => c.id !== course!.id).slice(0, 4);
  }
  const t = await getTranslations({ locale, namespace: "course" });
  const totalLessons = course.sections.reduce((s, sec) => s + sec.lessons.length, 0);
  const isFree = course.price === 0;

  async function handleFreeEnroll(formData: FormData) {
    "use server";
    const cId = formData.get("courseId") as string;
    const loc = formData.get("locale") as string;
    const sl = formData.get("slug") as string;
    await createFreeEnrollment(cId, loc, sl);
  }

  return (
    <div className="min-h-screen bg-paper">
      <TopBar />
      <main>
        {/* Hero band */}
        <div className="bg-ink py-12 border-b border-[#2A332E]">
          <Container>
            <div className="grid grid-cols-[1fr_340px] gap-12 items-start">
              {/* Left: course info */}
              <div className="flex flex-col gap-5">
                <EyebrowLabel className="text-[#6E756F]">{course.tags[0]}</EyebrowLabel>
                <h1 className="font-display text-[38px] text-white leading-[1.1] tracking-[-0.015em]">
                  {course.title}
                </h1>
                <p className="text-[15px] text-[#C9CDC8] leading-[1.6] max-w-[540px]">
                  {course.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-[13px] text-[#8A938E]">
                  <span className="flex items-center gap-1.5">
                    <Star size={13} className="fill-gold text-gold" />
                    <span className="text-white font-semibold">{course.rating.toFixed(1)}</span>
                    <span>({formatNumber(course.ratingCount)} รีวิว)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users size={13} />
                    {formatNumber(course.enrollmentCount)} {t("students")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} />
                    {formatDuration(course.totalDuration)}
                  </span>
                  <Tag
                    variant={course.level === "BEGINNER" ? "new" : course.level === "INTERMEDIATE" ? "default" : "hot"}
                  >
                    {t(`level.${course.level.toLowerCase() as "beginner" | "intermediate" | "advanced"}`)}
                  </Tag>
                </div>

                <div className="flex items-center gap-3">
                  <Avatar name={course.instructor.name} size="md" />
                  <div>
                    <p className="text-[12px] text-[#6E756F] font-mono uppercase tracking-wider">INSTRUCTOR</p>
                    <p className="text-white text-[14px] font-medium">{course.instructor.name}</p>
                  </div>
                </div>

                <p className="text-[12px] text-[#6E756F] font-mono">
                  {t("lastUpdated")} {new Date(course.updatedAt).toLocaleDateString("th-TH")}
                </p>
              </div>

              {/* Right: sticky buy box */}
              <div className="sticky top-24">
                <div className="bg-paper-3 border border-line rounded-r3 overflow-hidden shadow-lg">
                  <CourseThumbnail
                    title={course.title}
                    monogram={course.monogram}
                    art={course.art}
                    aspectRatio="16/9"
                  />
                  <div className="p-6 flex flex-col gap-4">
                    {isEnrolled ? (
                      <>
                        <div className="flex items-center gap-2 text-ok text-[13px] font-medium">
                          <CheckCircle size={15} /> ลงทะเบียนแล้ว
                        </div>
                        <Link href={`/${locale}/learn/${course.slug}/${firstLessonId}`}>
                          <Button variant="primary" size="lg" className="w-full justify-center">
                            เข้าเรียนเลย →
                          </Button>
                        </Link>
                      </>
                    ) : isFree ? (
                      <>
                        <div className="font-display text-[28px] text-ok">ฟรี!</div>
                        <form action={handleFreeEnroll}>
                          <input type="hidden" name="courseId" value={course.id} />
                          <input type="hidden" name="locale" value={locale} />
                          <input type="hidden" name="slug" value={course.slug} />
                          <Button variant="primary" size="lg" className="w-full justify-center" type="submit">
                            เรียนฟรีทันที →
                          </Button>
                        </form>
                        {!userId && (
                          <p className="text-[12px] text-ink-3 text-center">
                            <Link href={`/${locale}/login`} className="text-viridian hover:underline">เข้าสู่ระบบ</Link>{" "}
                            ก่อนลงทะเบียน
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="font-display text-[36px] text-viridian">
                          {formatPrice(course.price, course.currency)}
                        </div>
                        <Link href={`/${locale}/cart?course=${course.slug}`}>
                          <Button variant="primary" size="lg" className="w-full justify-center">
                            {t("enroll")}
                          </Button>
                        </Link>
                        <AddToCartButton slug={course.slug} className="w-full" />
                        <WishlistButton slug={course.slug} className="w-full justify-center" />
                      </>
                    )}

                    <ul className="text-[13px] text-ink-3 flex flex-col gap-2 pt-2 border-t border-line">
                      <li className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-ok" />
                        {formatDuration(course.totalDuration)} เนื้อหาวิดีโอ
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-ok" />
                        เข้าถึงได้ตลอดชีพ
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-ok" />
                        ใบประกาศนียบัตร PDF
                      </li>
                      {!isFree && (
                        <li className="flex items-center gap-2">
                          <CheckCircle size={14} className="text-ok" />
                          คืนเงินได้ใน 7 วัน
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </div>

        {/* Body */}
        <Container className="py-12">
          <div className="grid grid-cols-[1fr_340px] gap-12">
            <div className="flex flex-col gap-10">
              {/* What you'll learn — per-course outcomes (fallback to section titles) */}
              {(() => {
                const outcomes =
                  course.outcomes && course.outcomes.length > 0
                    ? course.outcomes
                    : course.sections.map((s) => s.title);
                if (outcomes.length === 0) return null;
                return (
                  <section>
                    <h2 className="font-semibold text-[20px] text-ink mb-4">สิ่งที่คุณจะได้เรียนรู้</h2>
                    <div className="grid grid-cols-2 gap-2.5">
                      {outcomes.map((item) => (
                        <div key={item} className="flex items-start gap-2 text-[14px] text-ink">
                          <CheckCircle size={15} className="text-ok mt-0.5 shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })()}

              {/* Curriculum */}
              <section>
                <h2 className="font-semibold text-[20px] text-ink mb-4">
                  เนื้อหาคอร์ส ({course.sections.length} หัวข้อ · {totalLessons} บทเรียน)
                </h2>
                <div className="border border-line rounded-r3 overflow-hidden">
                  {course.sections.map((section, si) => (
                    <details key={section.id} open={si === 0}>
                      <summary className="flex items-center justify-between px-5 py-4 bg-paper-2 cursor-pointer hover:bg-line-2 transition-colors list-none">
                        <div className="flex items-center gap-3">
                          <ChevronDown size={16} className="text-ink-3" />
                          <span className="font-medium text-[15px] text-ink">{section.title}</span>
                          <span className="text-[13px] text-ink-3">{section.lessons.length} บทเรียน</span>
                        </div>
                      </summary>
                      <ul>
                        {section.lessons.map((lesson) => (
                          <li
                            key={lesson.id}
                            className="flex items-center gap-3 px-5 py-3 border-t border-line text-[14px] text-ink-2"
                          >
                            {lesson.type === "QUIZ" ? (
                              <ClipboardCheck size={14} className="text-amber-500 shrink-0" />
                            ) : lesson.type === "ARTICLE" ? (
                              <FileText size={14} className="text-ink-3 shrink-0" />
                            ) : (
                              <Play size={14} className="text-ink-3 shrink-0" />
                            )}
                            <span className="flex-1">{lesson.title}</span>
                            {lesson.isFree && <Tag variant="new" className="text-[9px]">ตัวอย่าง</Tag>}
                            {lesson.type === "QUIZ" ? (
                              <span className="text-[11px] text-amber-500 font-mono">Quiz</span>
                            ) : lesson.duration ? (
                              <span className="text-[12px] text-ink-4 font-mono">
                                {Math.floor(lesson.duration / 60)} นาที
                              </span>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </details>
                  ))}
                </div>
              </section>

              {/* Instructor */}
              <section>
                <h2 className="font-semibold text-[20px] text-ink mb-4">เกี่ยวกับผู้สอน</h2>
                <div className="flex items-start gap-4 bg-paper-2 rounded-r3 p-5 border border-line">
                  <Avatar name={course.instructor.name} size="lg" />
                  <div>
                    <p className="font-semibold text-[16px] text-ink">{course.instructor.name}</p>
                    <p className="text-[13px] text-ink-3 mt-1">
                      ผู้เชี่ยวชาญด้าน {course.tags.join(", ")} · ประสบการณ์ 10+ ปี
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-[12px] text-ink-3">
                        <BookOpen size={12} /> {course.enrollmentCount.toLocaleString()} นักเรียน
                      </span>
                      <span className="flex items-center gap-1 text-[12px] text-ink-3">
                        <Star size={12} className="fill-gold text-gold" /> {course.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Reviews + Q&A */}
              <CourseReviews
                courseSlug={course.slug}
                initialReviews={await getReviews(course.slug)}
                initialQuestions={await getQuestions(course.slug)}
              />
            </div>

            <div className="hidden lg:block" />
          </div>
        </Container>

        {/* Related courses */}
        <div className="py-12 border-t border-line bg-viridian-wash">
          <Container>
            <EyebrowLabel className="mb-2">— MORE COURSES</EyebrowLabel>
            <h2 className="font-display text-[32px] tracking-[-0.015em] mb-6">คอร์สที่เกี่ยวข้อง</h2>
            <CourseGrid courses={related} columns={4} />
          </Container>
        </div>
      </main>
      <Footer />
    </div>
  );
}
