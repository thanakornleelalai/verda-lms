import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import {
  flushProgress,
  generateCertificate,
  sendLessonReminder,
  nightlyAnalytics,
} from "@/lib/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [flushProgress, generateCertificate, sendLessonReminder, nightlyAnalytics],
});
