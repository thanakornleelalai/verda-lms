import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { MOCK_COURSES, MOCK_INSTRUCTOR } from "@/mock";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { CourseEditClient } from "./CourseEditClient";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CourseEditPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  const session = await auth();
  const userId = session?.user?.id ?? "";
  const role = (session?.user as { role?: string } | undefined)?.role ?? "";

  type CourseData = {
    id: string;
    title: string;
    description: string;
    level: string;
    language: string;
    price: number;
    status: string;
    thumbnailGradient?: string;
    sections: Array<{
      id: string;
      title: string;
      order: number;
      lessons: Array<{ id: string; title: string; type: string; isFree: boolean; duration?: number }>;
    }>;
  };

  let course: CourseData | null = null;

  try {
    const dbCourse = await db.course.findUnique({
      where: { slug },
      include: {
        sections: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
              select: { id: true, title: true, type: true, isFree: true, duration: true },
            },
          },
        },
      },
    });

    if (!dbCourse) {
      notFound();
    }

    if (dbCourse.instructorId !== userId && role !== "ADMIN") {
      notFound();
    }

    course = {
      id: dbCourse.id,
      title: dbCourse.title,
      description: dbCourse.description ?? "",
      level: dbCourse.level,
      language: dbCourse.language,
      price: dbCourse.price,
      status: dbCourse.status,
      thumbnailGradient: dbCourse.art ?? undefined,
      sections: dbCourse.sections.map((s) => ({
        id: s.id,
        title: s.title,
        order: s.order,
        lessons: s.lessons.map((l) => ({
          id: l.id,
          title: l.title,
          type: l.type,
          isFree: l.isFree,
          duration: l.duration ?? undefined,
        })),
      })),
    };
  } catch {
    // DB unavailable — fall back to mock
    const mock = MOCK_COURSES.find(
      (c) => c.slug === slug && (c.instructorId === MOCK_INSTRUCTOR.id || role === "ADMIN")
    );
    if (!mock) notFound();

    course = {
      id: mock.id,
      title: mock.title,
      description: mock.description ?? "",
      level: mock.level,
      language: mock.language,
      price: mock.price,
      status: mock.status,
      thumbnailGradient: mock.art ?? undefined,
      sections: mock.sections.map((s) => ({
        id: s.id,
        title: s.title,
        order: s.order,
        lessons: s.lessons.map((l) => ({
          id: l.id,
          title: l.title,
          type: l.type,
          isFree: l.isFree,
          duration: l.duration ?? undefined,
        })),
      })),
    };
  }

  return (
    <div className="p-8 max-w-[860px]">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Link href={`/${locale}/studio/courses`} className="flex items-center gap-1 text-[13px] text-ink-3 hover:text-ink transition-colors">
            <ChevronLeft size={14} /> คอร์สของฉัน
          </Link>
        </div>
        <EyebrowLabel className="mb-1">STUDIO / COURSES / EDIT</EyebrowLabel>
        <h1 className="font-display text-[32px] text-ink tracking-[-0.015em] line-clamp-1">{course.title}</h1>
      </div>

      <CourseEditClient course={course} />
    </div>
  );
}
