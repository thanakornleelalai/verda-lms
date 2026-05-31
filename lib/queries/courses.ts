import { db } from "@/lib/db";
import type { Course, CourseListResult } from "@/types";
import { MOCK_COURSES, MOCK_CATEGORIES } from "@/mock";
import { devGetCourses, devGetCourseBySlug } from "@/lib/dev-store";

type DbCourse = Awaited<ReturnType<typeof fetchCoursesFromDb>>[number];

type CoursesFilter = {
  query?: string;
  categorySlug?: string;
  level?: string;
  priceMax?: number;
  sort?: "popular" | "newest" | "price-asc" | "price-desc" | "rating";
  page?: number;
  pageSize?: number;
  instructorId?: string;
};

function buildWhere(filter?: CoursesFilter, instructorOnly = false) {
  return {
    // Public catalog: only published courses whose instructor is not suspended
    ...(instructorOnly ? {} : { status: "PUBLISHED" as const, instructor: { suspended: false } }),
    ...(filter?.query
      ? {
          OR: [
            { title: { contains: filter.query, mode: "insensitive" as const } },
            { description: { contains: filter.query, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(filter?.categorySlug ? { category: { slug: filter.categorySlug } } : {}),
    ...(filter?.level ? { level: filter.level as "BEGINNER" | "INTERMEDIATE" | "ADVANCED" } : {}),
    ...(filter?.priceMax !== undefined ? { price: { lte: filter.priceMax } } : {}),
    ...(filter?.instructorId ? { instructorId: filter.instructorId } : {}),
  };
}

function buildOrderBy(sort?: string) {
  switch (sort) {
    case "newest":
      return { createdAt: "desc" as const };
    case "price-asc":
      return { price: "asc" as const };
    case "price-desc":
      return { price: "desc" as const };
    case "rating":
      return { rating: "desc" as const };
    default:
      return { enrollmentCount: "desc" as const };
  }
}

async function fetchCoursesFromDb(filter?: CoursesFilter) {
  const pageSize = filter?.pageSize ?? 12;
  const page = filter?.page ?? 1;

  return db.course.findMany({
    where: buildWhere(filter),
    include: {
      instructor: { select: { id: true, name: true, image: true } },
      sections: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
    },
    orderBy: buildOrderBy(filter?.sort),
    take: pageSize,
    skip: (page - 1) * pageSize,
  });
}

function adaptDbCourse(c: DbCourse): Course {
  return {
    id: c.id,
    tenantId: c.tenantId ?? "default",
    slug: c.slug,
    title: c.title,
    description: c.description ?? undefined,
    thumbnail: c.thumbnail ?? undefined,
    status: c.status as Course["status"],
    price: c.price,
    currency: c.currency,
    level: c.level as Course["level"],
    language: c.language,
    instructorId: c.instructorId,
    instructor: {
      id: c.instructor.id,
      name: c.instructor.name ?? "Instructor",
      avatarUrl: c.instructor.image ?? undefined,
    },
    sections: c.sections.map((s) => ({
      id: s.id,
      courseId: s.courseId,
      title: s.title,
      order: s.order,
      lessons: s.lessons.map((l) => ({
        id: l.id,
        sectionId: l.sectionId,
        title: l.title,
        order: l.order,
        type: (l.type === "TEXT" ? "ARTICLE" : l.type) as Course["sections"][number]["lessons"][number]["type"],
        duration: l.duration ?? undefined,
        isFree: l.isFree,
        videoAsset: l.videoAsset ?? undefined,
        playbackId: l.playbackId ?? undefined,
        content: l.content ?? undefined,
        drip: l.drip ?? undefined,
      })),
    })),
    totalDuration: c.totalDuration,
    enrollmentCount: c.enrollmentCount,
    rating: c.rating,
    ratingCount: c.ratingCount,
    tags: c.tags,
    outcomes: c.outcomes ?? [],
    publishedAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    art: c.art ?? undefined,
    monogram: c.monogram ?? undefined,
  };
}

export async function getCourses(filter?: CoursesFilter): Promise<CourseListResult> {
  try {
    const pageSize = filter?.pageSize ?? 12;
    const page = filter?.page ?? 1;
    const rows = await fetchCoursesFromDb(filter);
    const total = await db.course.count({ where: buildWhere(filter) });
    return { courses: rows.map(adaptDbCourse), total, page, pageSize };
  } catch {
    // DB not available — fall back to mock + dev-store courses
    const allCourses = [
      ...MOCK_COURSES,
      // Include dev-store courses that are PUBLISHED (only show published in catalog)
      ...devGetCourses().filter((c) => c.status === "PUBLISHED"),
    ];

    let filtered = allCourses.filter((c) => {
      if (filter?.query) {
        const q = filter.query.toLowerCase();
        if (!c.title.toLowerCase().includes(q) && !c.description?.toLowerCase().includes(q)) return false;
      }
      if (filter?.categorySlug) {
        if (!c.tags.some((t) => t.toLowerCase() === filter.categorySlug)) return false;
      }
      if (filter?.level) {
        if (c.level !== filter.level) return false;
      }
      if (filter?.priceMax !== undefined) {
        if (c.price > filter.priceMax) return false;
      }
      return true;
    });

    // Sort mock data
    if (filter?.sort === "newest") {
      filtered = [...filtered].sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
    } else if (filter?.sort === "price-asc") {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (filter?.sort === "price-desc") {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    } else if (filter?.sort === "rating") {
      filtered = [...filtered].sort((a, b) => b.rating - a.rating);
    }

    return {
      courses: filtered,
      total: filtered.length,
      page: 1,
      pageSize: filtered.length,
    };
  }
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  try {
    const c = await db.course.findUnique({
      where: { slug, status: "PUBLISHED" },
      include: {
        instructor: { select: { id: true, name: true, image: true } },
        sections: {
          orderBy: { order: "asc" },
          include: { lessons: { orderBy: { order: "asc" } } },
        },
      },
    });
    if (!c) return null;
    return adaptDbCourse(c);
  } catch {
    // Check dev-store first (newly created courses), then mock
    return devGetCourseBySlug(slug) ?? MOCK_COURSES.find((c) => c.slug === slug) ?? null;
  }
}

type CategoryItem = { id: string; slug: string; label: string; icon?: string | null; count: number };

export async function getCategories(): Promise<CategoryItem[]> {
  try {
    return await db.category.findMany({ orderBy: { count: "desc" } });
  } catch {
    return MOCK_CATEGORIES.map((c) => ({ ...c, slug: c.id }));
  }
}

export async function getInstructorPublicProfile(slug: string) {
  try {
    const instructor = await db.user.findFirst({
      where: {
        OR: [{ id: slug }, { name: { equals: slug, mode: "insensitive" } }],
        role: { in: ["INSTRUCTOR", "ADMIN"] },
        suspended: false, // suspended instructors are not publicly visible
      },
      select: {
        id: true,
        name: true,
        image: true,
        bio: true,
        headline: true,
        website: true,
        courses: {
          where: { status: "PUBLISHED" },
          include: {
            instructor: { select: { id: true, name: true, image: true } },
            sections: {
              orderBy: { order: "asc" },
              include: { lessons: { orderBy: { order: "asc" } } },
            },
          },
          orderBy: { enrollmentCount: "desc" },
          take: 12,
        },
      },
    });
    if (!instructor) return null;
    return {
      id: instructor.id,
      name: instructor.name ?? "Instructor",
      image: instructor.image,
      bio: instructor.bio,
      headline: instructor.headline,
      website: instructor.website,
      courses: instructor.courses.map(adaptDbCourse),
    };
  } catch {
    return null;
  }
}
