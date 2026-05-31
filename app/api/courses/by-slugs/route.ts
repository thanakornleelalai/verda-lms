import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { MOCK_COURSES } from "@/mock";

export const dynamic = "force-dynamic";

export type CartCourse = {
  id: string;
  slug: string;
  title: string;
  price: number;
  currency: string;
  monogram: string | null;
  art: string | null;
  instructorName: string;
};

/**
 * Resolve cart course slugs → summary objects.
 * GET /api/courses/by-slugs?slugs=slug-a,slug-b
 * Pulls from the live DB first, falls back to MOCK_COURSES when DB is unavailable.
 */
export async function GET(req: NextRequest) {
  const slugsParam = req.nextUrl.searchParams.get("slugs") ?? "";
  const slugs = slugsParam.split(",").map((s) => s.trim()).filter(Boolean);
  if (slugs.length === 0) return NextResponse.json({ courses: [] });

  try {
    const rows = await db.course.findMany({
      where: { slug: { in: slugs }, status: "PUBLISHED" },
      select: {
        id: true, slug: true, title: true, price: true, currency: true,
        monogram: true, art: true,
        instructor: { select: { name: true } },
      },
    });

    // Preserve the order the slugs were requested in
    const bySlug = new Map(rows.map((r) => [r.slug, r]));
    const courses: CartCourse[] = slugs
      .map((slug) => bySlug.get(slug))
      .filter((r): r is NonNullable<typeof r> => !!r)
      .map((r) => ({
        id: r.id, slug: r.slug, title: r.title, price: r.price, currency: r.currency,
        monogram: r.monogram, art: r.art,
        instructorName: r.instructor?.name ?? "ผู้สอน",
      }));

    return NextResponse.json({ courses });
  } catch {
    // DB unavailable — resolve from mock
    const courses: CartCourse[] = slugs
      .map((slug) => MOCK_COURSES.find((c) => c.slug === slug))
      .filter((c): c is (typeof MOCK_COURSES)[number] => !!c)
      .map((c) => ({
        id: c.id, slug: c.slug, title: c.title, price: c.price, currency: c.currency,
        monogram: c.monogram ?? null, art: c.art ?? null,
        instructorName: c.instructor.name,
      }));
    return NextResponse.json({ courses });
  }
}
