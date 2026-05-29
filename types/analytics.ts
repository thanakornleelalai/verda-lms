export type ProgressEventType =
  | "LESSON_START"
  | "PROGRESS_25"
  | "PROGRESS_50"
  | "PROGRESS_75"
  | "LESSON_COMPLETE"
  | "REWATCH"
  | "SEEK";

export interface ProgressEvent {
  id: string;
  userId: string;
  lessonId: string;
  type: ProgressEventType;
  position?: number;
  createdAt: string;
}

export interface AnalyticsSnapshot {
  id: string;
  tenantId: string;
  date: string;
  enrollmentCount: number;
  completionCount: number;
  revenueThb: number;
  activeUsers: number;
  newUsers: number;
}

export interface InstructorKPI {
  totalRevenue: number;
  monthRevenue: number;
  totalStudents: number;
  avgRating: number;
  completionRate: number;
  dropOffLesson?: string;
}
