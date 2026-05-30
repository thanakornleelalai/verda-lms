import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

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
    // DB unavailable — return empty list (graceful dev-mode degradation)
    return NextResponse.json({ courses: [] });
  }
}
