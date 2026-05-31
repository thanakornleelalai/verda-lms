import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CourseReviewForm } from "@/components/learn/CourseReviewForm";

export const dynamic = "force-dynamic";

async function getCourseInfo(slug: string): Promise<{ title: string; instructorName: string } | null> {
  try {
    const { db } = await import("@/lib/db");
    const course = await db.course.findUnique({
      where: { slug },
      select: {
        title: true,
        instructor: { select: { name: true } },
      },
    });
    if (course) {
      return {
        title: course.title,
        instructorName: course.instructor?.name ?? "ผู้สอน",
      };
    }
  } catch {
    // fall through to mock
  }

  // Mock fallback
  const MOCK: Record<string, { title: string; instructorName: string }> = {
    "ux-design-figma-masterclass": {
      title: "UX Design & Figma Masterclass",
      instructorName: "คุณพิมพ์พร วัฒนากร",
    },
    "financial-planning-for-freelancers": {
      title: "Financial Planning for Freelancers",
      instructorName: "ธนพล สิทธิกุล",
    },
    "python-data-science": {
      title: "Python for Data Science",
      instructorName: "ดร. สุวิทย์ เจริญศิลป์",
    },
    "react-next-fullstack": {
      title: "React & Next.js Full-Stack",
      instructorName: "อภิวัฒน์ ดิจิทัล",
    },
  };

  return MOCK[slug] ?? { title: slug, instructorName: "ผู้สอน" };
}

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/login`);

  const course = await getCourseInfo(slug);

  if (!course) {
    redirect(`/${locale}/dashboard/certificates`);
  }

  return (
    <CourseReviewForm
      courseSlug={slug}
      courseTitle={course.title}
      instructorName={course.instructorName}
      locale={locale}
    />
  );
}
