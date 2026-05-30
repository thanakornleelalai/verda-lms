export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { MOCK_COURSES } from "@/mock";
import { WishlistClient, type WishlistCourse } from "./WishlistClient";

export const metadata = { title: "คอร์สที่ถูกใจ | VERDA" };

export default async function WishlistPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const allCourses: WishlistCourse[] = MOCK_COURSES.map((c) => ({
    slug: c.slug,
    title: c.title,
    instructor: c.instructor?.name ?? "ผู้สอน",
    rating: c.rating ?? 0,
    ratingCount: c.ratingCount ?? 0,
    enrollmentCount: c.enrollmentCount ?? 0,
    price: c.price ?? 0,
    currency: c.currency ?? "THB",
    level: c.level ?? "BEGINNER",
    art: c.art ?? "linear-gradient(135deg, #0F5D4A 0%, #1A7A60 100%)",
    monogram: c.monogram ?? c.title.slice(0, 2).toUpperCase(),
    tag: c.tags?.[0] ?? "คอร์ส",
  }));

  return (
    <div className="min-h-screen bg-paper">
      <TopBar />
      <main>
        <Container className="py-10 max-w-[920px]">
          <Link href={`/${locale}/dashboard`} className="inline-flex items-center gap-1.5 text-[13px] text-ink-3 hover:text-ink mb-4">
            <ArrowLeft size={14} /> กลับหน้าแดชบอร์ด
          </Link>
          <EyebrowLabel className="mb-1">— WISHLIST</EyebrowLabel>
          <h1 className="font-display text-[38px] tracking-[-0.015em] text-ink mb-8">คอร์สที่ถูกใจ</h1>

          <WishlistClient allCourses={allCourses} />
        </Container>
      </main>
      <Footer />
    </div>
  );
}
