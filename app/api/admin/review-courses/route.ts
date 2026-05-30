import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { devGetReviewCourses } from "@/lib/dev-store";

export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user?.id || role !== "ADMIN") {
    return NextResponse.json({ courses: [] }, { status: 401 });
  }

  try {
    const dbCourses = await db.course.findMany({
      where: { status: "REVIEW" },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        level: true,
        price: true,
        currency: true,
        updatedAt: true,
        instructor: { select: { name: true, email: true } },
        _count: { select: { sections: true } },
        sections: {
          select: { _count: { select: { lessons: true } } },
        },
      },
    });

    const courses = dbCourses.map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      status: "REVIEW",
      level: c.level,
      price: c.price,
      currency: c.currency,
      updatedAt: c.updatedAt.toISOString(),
      instructor: {
        name: c.instructor?.name ?? "—",
        email: c.instructor?.email ?? null,
      },
      lessonCount: c.sections.reduce((n, s) => n + s._count.lessons, 0),
    }));

    return NextResponse.json({ courses });
  } catch {
    // DB unavailable — return courses from dev-store + mock REVIEW courses
    const { MOCK_COURSES } = await import("@/mock");
    const devCourses = devGetReviewCourses();
    const mockReview = MOCK_COURSES.filter((c) => c.status === "REVIEW");

    const all = [...devCourses, ...mockReview];
    const courses = all.map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      status: "REVIEW" as const,
      level: c.level,
      price: c.price,
      currency: c.currency,
      updatedAt: c.updatedAt ?? new Date().toISOString(),
      instructor: {
        name: c.instructor?.name ?? "—",
        email: null,
      },
      lessonCount: c.sections?.reduce((n: number, s) => n + (s.lessons?.length ?? 0), 0) ?? 0,
    }));

    return NextResponse.json({ courses });
  }
}
