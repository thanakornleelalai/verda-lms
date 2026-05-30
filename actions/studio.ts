"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { devAddCourse, devUpdateCourseStatus } from "@/lib/dev-store";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 80);
}

export async function createCourse(formData: {
  title: string;
  description: string;
  categoryId?: string;
  level: string;
  language: string;
  price: number;
}): Promise<{ courseId?: string; slug?: string; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const role = (session.user as { role?: string }).role;
  if (role !== "INSTRUCTOR" && role !== "ADMIN") return { error: "Forbidden" };

  const baseSlug = slugify(formData.title || "untitled-course");

  try {
    // Ensure slug uniqueness
    let slug = baseSlug;
    let suffix = 0;
    while (await db.course.findUnique({ where: { slug } })) {
      suffix++;
      slug = `${baseSlug}-${suffix}`;
    }

    const course = await db.course.create({
      data: {
        title: formData.title,
        description: formData.description,
        slug,
        level: formData.level as "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
        language: formData.language,
        price: formData.price,
        status: "DRAFT",
        instructorId: session.user.id,
        ...(formData.categoryId ? { categoryId: formData.categoryId } : {}),
      },
    });

    revalidatePath("/studio/courses");
    return { courseId: course.id, slug: course.slug };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "DB unavailable";
    return { error: msg };
  }
}

export async function createCourseWithCurriculum(
  formData: {
    title: string;
    description: string;
    categoryId?: string;
    level: string;
    language: string;
    price: number;
  },
  sections: Array<{
    title: string;
    lessons: Array<{
      title: string;
      type: string;
      videoAsset?: string;
      content?: string;
      isFree?: boolean;
      duration?: number;
      quizQuestions?: Array<{
        text: string;
        type: "SINGLE" | "MULTIPLE";
        order: number;
        options: Array<{ text: string; isCorrect: boolean; order: number }>;
      }>;
    }>;
  }>
): Promise<{ courseId?: string; slug?: string; status?: string; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const role = (session.user as { role?: string }).role;
  if (role !== "INSTRUCTOR" && role !== "ADMIN") return { error: "Forbidden" };

  const baseSlug = slugify(formData.title || "untitled-course");

  try {
    let slug = baseSlug;
    let suffix = 0;
    while (await db.course.findUnique({ where: { slug } })) {
      suffix++;
      slug = `${baseSlug}-${suffix}`;
    }

    // Instructors submit for admin review → status REVIEW (admins skip the queue).
    const isAdmin = role === "ADMIN";
    const course = await db.course.create({
      data: {
        title: formData.title,
        description: formData.description,
        slug,
        level: formData.level as "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
        language: formData.language,
        price: formData.price,
        status: isAdmin ? "DRAFT" : "REVIEW",
        instructorId: session.user.id,
        ...(formData.categoryId ? { categoryId: formData.categoryId } : {}),
      },
    });

    // Create sections + their lessons preserving authoring order.
    for (let si = 0; si < sections.length; si++) {
      const s = sections[si];
      const section = await db.section.create({
        data: { courseId: course.id, title: s.title, order: si + 1 },
      });
      for (let li = 0; li < s.lessons.length; li++) {
        const l = s.lessons[li];
        const dbLesson = await db.lesson.create({
          data: {
            sectionId: section.id,
            title: l.title,
            type: l.type as "VIDEO" | "TEXT" | "QUIZ" | "LIVE" | "ASSIGNMENT",
            order: li + 1,
            isFree: l.isFree ?? false,
            ...(l.videoAsset ? { videoAsset: l.videoAsset } : {}),
            ...(l.content ? { content: l.content } : {}),
            ...(l.duration ? { duration: l.duration } : {}),
          },
        });
        // Create quiz + questions if provided inline
        if (l.type === "QUIZ" && l.quizQuestions && l.quizQuestions.length > 0) {
          const quiz = await db.quiz.create({
            data: {
              lessonId: dbLesson.id,
              title: `แบบทดสอบ — ${l.title}`,
              passingScore: 70,
            },
          });
          for (const q of l.quizQuestions) {
            const question = await db.question.create({
              data: { quizId: quiz.id, text: q.text, type: q.type, order: q.order, points: 1 },
            });
            for (const opt of q.options) {
              await db.questionOption.create({
                data: { questionId: question.id, text: opt.text, isCorrect: opt.isCorrect, order: opt.order },
              });
            }
          }
        }
      }
    }

    revalidatePath("/studio/courses");
    revalidatePath("/admin/courses");
    return { courseId: course.id, slug: course.slug, status: course.status };
  } catch {
    // DB unavailable — store in-memory so the full flow still works in dev mode.
    const session2 = await auth();
    const isAdmin2 = (session2?.user as { role?: string } | null)?.role === "ADMIN";
    const newCourseId = `dev_${Date.now()}`;
    const newSlug = `${slugify(formData.title || "untitled")}-${Date.now().toString(36)}`;

    const devCourse = {
      id: newCourseId,
      tenantId: "ten_default",
      slug: newSlug,
      title: formData.title,
      description: formData.description ?? "",
      status: (isAdmin2 ? "DRAFT" : "REVIEW") as "DRAFT" | "REVIEW",
      price: formData.price,
      currency: "THB",
      level: (formData.level as "BEGINNER" | "INTERMEDIATE" | "ADVANCED"),
      language: formData.language,
      instructorId: session2?.user?.id ?? "usr_instructor_001",
      instructor: {
        id: session2?.user?.id ?? "usr_instructor_001",
        name: session2?.user?.name ?? "อาจารย์ผู้สอน",
        avatarUrl: (session2?.user as { image?: string } | null)?.image ?? undefined,
      },
      sections: sections.map((s, si) => ({
        id: `dev_sec_${newCourseId}_${si}`,
        courseId: newCourseId,
        title: s.title,
        order: si + 1,
        lessons: s.lessons.map((l, li) => ({
          id: `dev_les_${newCourseId}_${si}_${li}`,
          sectionId: `dev_sec_${newCourseId}_${si}`,
          title: l.title,
          order: li + 1,
          type: (l.type === "ARTICLE" ? "ARTICLE" : l.type === "QUIZ" ? "QUIZ" : "VIDEO") as "VIDEO" | "ARTICLE" | "QUIZ",
          isFree: l.isFree ?? false,
          videoAsset: l.videoAsset,
          content: l.content,
        })),
      })),
      totalDuration: 0,
      enrollmentCount: 0,
      rating: 0,
      ratingCount: 0,
      tags: [],
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    devAddCourse(devCourse);
    return { courseId: newCourseId, slug: newSlug, status: devCourse.status, error: "DB unavailable" };
  }
}

export async function devPublishCourse(courseId: string): Promise<{ error?: string }> {
  devUpdateCourseStatus(courseId, "PUBLISHED");
  revalidatePath("/admin/courses");
  revalidatePath("/admin/moderation");
  revalidatePath("/courses");
  return {};
}

export async function devRejectCourse(courseId: string): Promise<{ error?: string }> {
  devUpdateCourseStatus(courseId, "DRAFT");
  revalidatePath("/admin/courses");
  revalidatePath("/admin/moderation");
  return {};
}

export async function updateCourse(
  courseId: string,
  data: Partial<{
    title: string;
    description: string;
    longDescription: string;
    categoryId: string;
    level: string;
    language: string;
    price: number;
    thumbnail: string;
    monogram: string;
    art: string;
    tags: string[];
  }>
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true },
    });
    if (!course) return { error: "Not found" };
    const role = (session.user as { role?: string }).role;
    if (course.instructorId !== session.user.id && role !== "ADMIN") {
      return { error: "Forbidden" };
    }

    await db.course.update({
      where: { id: courseId },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.longDescription !== undefined ? { longDescription: data.longDescription } : {}),
        ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
        ...(data.level !== undefined ? { level: data.level as "BEGINNER" | "INTERMEDIATE" | "ADVANCED" } : {}),
        ...(data.language !== undefined ? { language: data.language } : {}),
        ...(data.price !== undefined ? { price: data.price } : {}),
        ...(data.thumbnail !== undefined ? { thumbnail: data.thumbnail } : {}),
        ...(data.monogram !== undefined ? { monogram: data.monogram } : {}),
        ...(data.art !== undefined ? { art: data.art } : {}),
        ...(data.tags !== undefined ? { tags: data.tags } : {}),
      },
    });

    revalidatePath(`/studio/courses/${courseId}`);
    return {};
  } catch {
    return { error: "DB unavailable" };
  }
}

export async function publishCourse(courseId: string): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true, status: true },
    });
    if (!course) return { error: "Not found" };
    const role = (session.user as { role?: string }).role;
    if (course.instructorId !== session.user.id && role !== "ADMIN") {
      return { error: "Forbidden" };
    }

    await db.course.update({
      where: { id: courseId },
      data: { status: "PUBLISHED" },
    });

    revalidatePath(`/studio/courses`);
    revalidatePath(`/courses`);
    return {};
  } catch {
    return { error: "DB unavailable" };
  }
}

export async function unpublishCourse(courseId: string): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true },
    });
    if (!course) return { error: "Not found" };
    const role = (session.user as { role?: string }).role;
    if (course.instructorId !== session.user.id && role !== "ADMIN") {
      return { error: "Forbidden" };
    }

    await db.course.update({ where: { id: courseId }, data: { status: "DRAFT" } });
    revalidatePath(`/studio/courses`);
    return {};
  } catch {
    return { error: "DB unavailable" };
  }
}

export async function createSection(
  courseId: string,
  title: string
): Promise<{ sectionId?: string; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const count = await db.section.count({ where: { courseId } });
    const section = await db.section.create({
      data: { courseId, title, order: count + 1 },
    });
    revalidatePath(`/studio/courses/${courseId}`);
    return { sectionId: section.id };
  } catch {
    return { error: "DB unavailable" };
  }
}

export async function createLesson(
  sectionId: string,
  courseId: string,
  title: string,
  type: string = "VIDEO",
  /** Optional normalised video token ("yt:<id>" | "gd:<id>") set on creation. */
  videoAsset?: string
): Promise<{ lessonId?: string; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const count = await db.lesson.count({ where: { sectionId } });
    const lesson = await db.lesson.create({
      data: {
        sectionId,
        title,
        type: type as "VIDEO" | "TEXT" | "QUIZ" | "LIVE" | "ASSIGNMENT",
        order: count + 1,
        ...(videoAsset ? { videoAsset } : {}),
      },
    });
    revalidatePath(`/studio/courses/${courseId}`);
    return { lessonId: lesson.id };
  } catch {
    return { error: "DB unavailable" };
  }
}

export async function updateLesson(
  lessonId: string,
  courseId: string,
  data: Partial<{
    title: string;
    type: string;
    content: string;
    isFree: boolean;
    drip: number | null;
    duration: number;
    playbackId: string;
    videoAsset: string;
  }>
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await db.lesson.update({
      where: { id: lessonId },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.type !== undefined ? { type: data.type as "VIDEO" | "TEXT" | "QUIZ" | "LIVE" | "ASSIGNMENT" } : {}),
        ...(data.content !== undefined ? { content: data.content } : {}),
        ...(data.isFree !== undefined ? { isFree: data.isFree } : {}),
        ...(data.drip !== undefined ? { drip: data.drip } : {}),
        ...(data.duration !== undefined ? { duration: data.duration } : {}),
        ...(data.playbackId !== undefined ? { playbackId: data.playbackId } : {}),
        ...(data.videoAsset !== undefined ? { videoAsset: data.videoAsset } : {}),
      },
    });
    revalidatePath(`/studio/courses/${courseId}`);
    return {};
  } catch {
    return { error: "DB unavailable" };
  }
}

export async function deleteLesson(
  lessonId: string,
  courseId: string
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await db.lesson.delete({ where: { id: lessonId } });
    revalidatePath(`/studio/courses/${courseId}`);
    return {};
  } catch {
    return { error: "DB unavailable" };
  }
}

export async function reorderLessons(
  sectionId: string,
  courseId: string,
  orderedIds: string[]
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await Promise.all(
      orderedIds.map((id, idx) =>
        db.lesson.update({ where: { id }, data: { order: idx + 1 } })
      )
    );
    revalidatePath(`/studio/courses/${courseId}`);
    return {};
  } catch {
    return { error: "DB unavailable" };
  }
}

export async function getInstructorCourses(): Promise<{
  courses: Array<{
    id: string;
    slug: string;
    title: string;
    description: string;
    status: string;
    level: string;
    price: number;
    currency: string;
    enrollmentCount: number;
    rating: number;
    ratingCount: number;
    monogram: string | null;
    art: string | null;
    sections: Array<{ id: string; title: string; lessons: Array<{ id: string; title: string }> }>;
  }>;
  error?: string;
}> {
  const session = await auth();
  if (!session?.user?.id) return { courses: [], error: "Unauthorized" };

  try {
    const courses = await db.course.findMany({
      where: { instructorId: session.user.id },
      include: {
        sections: {
          orderBy: { order: "asc" },
          include: { lessons: { orderBy: { order: "asc" }, select: { id: true, title: true } } },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return {
      courses: courses.map((c) => ({
        id: c.id,
        slug: c.slug,
        title: c.title,
        description: c.description,
        status: c.status,
        level: c.level,
        price: c.price,
        currency: c.currency,
        enrollmentCount: c.enrollmentCount,
        rating: c.rating,
        ratingCount: c.ratingCount,
        monogram: c.monogram,
        art: c.art,
        sections: c.sections.map((s) => ({
          id: s.id,
          title: s.title,
          lessons: s.lessons,
        })),
      })),
    };
  } catch {
    return { courses: [], error: "DB unavailable" };
  }
}

export async function deleteCourse(courseId: string): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true },
    });
    if (!course) return { error: "Not found" };
    const role = (session.user as { role?: string }).role;
    if (course.instructorId !== session.user.id && role !== "ADMIN") {
      return { error: "Forbidden" };
    }
    await db.course.delete({ where: { id: courseId } });
    revalidatePath("/studio/courses");
    return {};
  } catch {
    return { error: "DB unavailable" };
  }
}

export async function redirectToStudio(locale: string) {
  redirect(`/${locale}/studio/courses`);
}

// ── Quiz Builder ──────────────────────────────────────────────────────────────

type QuestionInput = {
  id?: string;
  text: string;
  type: "SINGLE" | "MULTIPLE" | "TRUE_FALSE";
  order: number;
  points: number;
  options: { id?: string; text: string; isCorrect: boolean; order: number }[];
};

export async function upsertQuiz(
  lessonId: string,
  data: {
    title: string;
    timeLimitSec: number | null;
    passingScore: number;
    questions: QuestionInput[];
  }
): Promise<{ quizId?: string; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const role = (session.user as { role?: string }).role;
  if (role !== "INSTRUCTOR" && role !== "ADMIN") return { error: "Forbidden" };

  try {
    // Upsert the quiz record
    const existing = await db.quiz.findFirst({ where: { lessonId }, select: { id: true } });
    let quizId: string;

    if (existing) {
      await db.quiz.update({
        where: { id: existing.id },
        data: {
          title: data.title,
          timeLimitSec: data.timeLimitSec,
          passingScore: data.passingScore,
        },
      });
      quizId = existing.id;
      // Delete old questions and re-create (simpler than diffing)
      await db.question.deleteMany({ where: { quizId } });
    } else {
      const quiz = await db.quiz.create({
        data: {
          lessonId,
          title: data.title,
          timeLimitSec: data.timeLimitSec,
          passingScore: data.passingScore,
        },
      });
      quizId = quiz.id;
    }

    // Create questions + options
    for (const q of data.questions) {
      const question = await db.question.create({
        data: {
          quizId,
          text: q.text,
          type: q.type,
          order: q.order,
          points: q.points,
        },
      });
      for (const o of q.options) {
        await db.questionOption.create({
          data: {
            questionId: question.id,
            text: o.text,
            isCorrect: o.isCorrect,
            order: o.order,
          },
        });
      }
    }

    revalidatePath(`/studio`);
    return { quizId };
  } catch {
    return { error: "DB unavailable" };
  }
}

export async function updateInstructorProfile(data: {
  name?: string;
  bio?: string;
  image?: string;
}): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await db.user.update({
      where: { id: session.user.id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.bio !== undefined ? { bio: data.bio } : {}),
        ...(data.image !== undefined ? { image: data.image } : {}),
      },
    });
    revalidatePath("/studio/settings");
    return {};
  } catch {
    return { error: "DB unavailable" };
  }
}

export async function updateCourseThumbnail(
  courseId: string,
  gradient: string
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await db.course.update({
      where: { id: courseId },
      data: { art: gradient },
    });
    revalidatePath(`/studio/courses`);
    return {};
  } catch {
    return { error: "DB unavailable" };
  }
}
