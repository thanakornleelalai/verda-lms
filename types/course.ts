export type CourseStatus = "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED";
export type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type LessonType = "VIDEO" | "PDF" | "ARTICLE" | "SCORM" | "LIVE" | "QUIZ";

export interface Course {
  id: string;
  tenantId: string;
  slug: string;
  title: string;
  description?: string;
  thumbnail?: string;
  status: CourseStatus;
  price: number;
  currency: string;
  level: CourseLevel;
  language: string;
  instructorId: string;
  instructor: CourseInstructor;
  sections: Section[];
  totalDuration: number;
  enrollmentCount: number;
  rating: number;
  ratingCount: number;
  tags: string[];
  publishedAt?: string;
  updatedAt: string;
  /** CSS gradient art + monogram for thumbnail placeholder */
  art?: string;
  monogram?: string;
}

export interface CourseInstructor {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface Section {
  id: string;
  courseId: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  sectionId: string;
  title: string;
  order: number;
  type: LessonType;
  duration?: number;
  isFree: boolean;
  availableAt?: string;
  videoAsset?: string;
  playbackId?: string;
  content?: string;
  drip?: number;
}

export interface CourseFilter {
  query?: string;
  category?: string;
  level?: CourseLevel;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  language?: string;
  sort?: "popular" | "newest" | "price-asc" | "price-desc" | "rating";
  page?: number;
  pageSize?: number;
}

export interface CourseListResult {
  courses: Course[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  course: Course;
  enrolledAt: string;
  expiresAt?: string;
  progress: number;
  lastLessonId?: string;
}

export interface UserCourseProgress {
  userId: string;
  courseId: string;
  completionPercent: number;
  lastLessonId?: string;
  lastPosition?: number;
  totalTimeSpent: number;
  completedAt?: string;
}
