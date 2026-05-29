import { inngest } from "./client";

export const flushProgress = inngest.createFunction(
  { id: "flush-progress", triggers: [{ event: "course/progress.updated" }] },
  async ({ event }: { event: { data: unknown } }) => {
    const data = event.data as { userId?: string; courseId?: string; lessonId?: string; progressPct?: number };
    console.log("flush-progress", data);
    // TODO: db.userCourseProgress.upsert(...)
  }
);

export const generateCertificate = inngest.createFunction(
  { id: "generate-certificate", triggers: [{ event: "course/completed" }] },
  async ({ event }: { event: { data: unknown } }) => {
    const data = event.data as { userId?: string; courseId?: string };
    console.log("generate-certificate", data);
    // TODO: generate PDF, upload to Blob, save certificate record
  }
);

export const sendLessonReminder = inngest.createFunction(
  { id: "send-lesson-reminder", triggers: [{ cron: "0 9 * * 1" }] },
  async () => {
    console.log("send-lesson-reminder cron fired");
    // TODO: query inactive students, send reminder emails via Resend
  }
);

export const nightlyAnalytics = inngest.createFunction(
  { id: "nightly-analytics", triggers: [{ cron: "0 2 * * *" }] },
  async () => {
    console.log("nightly-analytics cron fired");
    // TODO: aggregate analytics events → AnalyticsSnapshot
  }
);
