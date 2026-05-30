/**
 * In-memory store for dev/mock mode (DATABASE_URL is empty).
 *
 * Module-level state persists across requests within the same Node.js process.
 * On server restart the store resets — that's intentional for a demo environment.
 *
 * This store is ONLY used when DB is unavailable (try/catch fallbacks).
 * In production with a real DB, this file is never called.
 */
import type { Course } from "@/types";

// ─── Internal storage ─────────────────────────────────────────────────────────

const _courses: Course[] = [];

// ─── Public API ───────────────────────────────────────────────────────────────

export function devAddCourse(course: Course): void {
  // Prevent duplicates on hot-reload
  if (!_courses.find((c) => c.id === course.id)) {
    _courses.push(course);
  }
}

export function devGetCourses(): Course[] {
  return _courses;
}

export function devGetCourseBySlug(slug: string): Course | null {
  return _courses.find((c) => c.slug === slug) ?? null;
}

export function devGetCourseById(id: string): Course | null {
  return _courses.find((c) => c.id === id) ?? null;
}

export function devUpdateCourseStatus(
  id: string,
  status: "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED"
): boolean {
  const course = _courses.find((c) => c.id === id);
  if (!course) return false;
  course.status = status;
  return true;
}

export function devGetCoursesByInstructor(instructorId: string): Course[] {
  return _courses.filter((c) => c.instructorId === instructorId);
}

export function devGetReviewCourses(): Course[] {
  return _courses.filter((c) => c.status === "REVIEW");
}

export function devGetPublishedCourses(): Course[] {
  return _courses.filter((c) => c.status === "PUBLISHED");
}
