import { CheckCircle2, XCircle, AlertTriangle, Clock, Server, Database, Mail, CreditCard, Video, Zap } from "lucide-react";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";

export const dynamic = "force-dynamic";

type ServiceStatus = "ok" | "warn" | "error" | "unknown";

interface ServiceItem {
  name: string;
  description: string;
  status: ServiceStatus;
  latency?: string;
  note?: string;
  icon: typeof Server;
}

async function getSystemStatus(): Promise<ServiceItem[]> {
  const dbOk = !!process.env.DATABASE_URL;
  const stripeOk = !!process.env.STRIPE_SECRET_KEY;
  const omiseOk = !!process.env.OMISE_SECRET_KEY;
  const muxOk = !!process.env.MUX_TOKEN_ID && !!process.env.MUX_TOKEN_SECRET;
  const resendOk = !!process.env.RESEND_API_KEY;
  const kvOk = !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;
  const blobOk = !!process.env.BLOB_READ_WRITE_TOKEN;
  const googleOk = !!process.env.AUTH_GOOGLE_ID && !!process.env.AUTH_GOOGLE_SECRET;
  const authSecretOk = !!process.env.AUTH_SECRET;
  const inngestOk = !!process.env.INNGEST_EVENT_KEY;

  // Try DB ping
  let dbLatency = "—";
  let dbStatus: ServiceStatus = dbOk ? "warn" : "error";
  if (dbOk) {
    try {
      const start = Date.now();
      const { db } = await import("@/lib/db");
      await db.$queryRaw`SELECT 1`;
      dbLatency = `${Date.now() - start}ms`;
      dbStatus = "ok";
    } catch {
      dbStatus = "error";
    }
  }

  return [
    { name: "Database (Neon PostgreSQL)", description: "Primary data store", status: dbStatus, latency: dbLatency, note: dbOk ? (dbStatus === "ok" ? "Connected" : "Connection failed") : "DATABASE_URL not set", icon: Database },
    { name: "Auth Secret", description: "NextAuth JWT signing", status: authSecretOk ? "ok" : "error", note: authSecretOk ? "AUTH_SECRET set" : "AUTH_SECRET missing — sessions will not work", icon: Server },
    { name: "Stripe (Payment)", description: "Credit card payments", status: stripeOk ? "ok" : "warn", note: stripeOk ? "STRIPE_SECRET_KEY set" : "Not configured — mock mode active", icon: CreditCard },
    { name: "Omise (PromptPay)", description: "PromptPay QR payments", status: omiseOk ? "ok" : "warn", note: omiseOk ? "OMISE_SECRET_KEY set" : "Not configured — mock mode active", icon: CreditCard },
    { name: "Mux (Video)", description: "Video upload & playback", status: muxOk ? "ok" : "warn", note: muxOk ? "MUX_TOKEN set" : "Not configured — video upload unavailable", icon: Video },
    { name: "Resend (Email)", description: "Transactional emails", status: resendOk ? "ok" : "warn", note: resendOk ? "RESEND_API_KEY set" : "Not configured — emails will be logged only", icon: Mail },
    { name: "Vercel KV (Redis)", description: "Quiz timer, caching", status: kvOk ? "ok" : "warn", note: kvOk ? "KV_REST_API set" : "Not configured — in-memory fallback", icon: Zap },
    { name: "Vercel Blob", description: "File storage", status: blobOk ? "ok" : "warn", note: blobOk ? "BLOB_READ_WRITE_TOKEN set" : "Not configured — file upload unavailable", icon: Server },
    { name: "Google OAuth", description: "Google login", status: googleOk ? "ok" : "warn", note: googleOk ? "AUTH_GOOGLE credentials set" : "Not configured — Google login unavailable", icon: Server },
    { name: "Inngest", description: "Background jobs", status: inngestOk ? "ok" : "warn", note: inngestOk ? "INNGEST_EVENT_KEY set" : "Not configured — background jobs unavailable", icon: Zap },
  ];
}

const STATUS_CONFIG = {
  ok: { color: "text-ok", bg: "bg-ok/10", icon: CheckCircle2, label: "OK" },
  warn: { color: "text-warn", bg: "bg-warn/10", icon: AlertTriangle, label: "Warning" },
  error: { color: "text-danger", bg: "bg-danger/10", icon: XCircle, label: "Error" },
  unknown: { color: "text-ink-3", bg: "bg-paper-2", icon: Clock, label: "Unknown" },
};

export default async function AdminSystemPage() {
  const services = await getSystemStatus();

  const okCount = services.filter((s) => s.status === "ok").length;
  const warnCount = services.filter((s) => s.status === "warn").length;
  const errCount = services.filter((s) => s.status === "error").length;

  const overallStatus: ServiceStatus =
    errCount > 0 ? "error" : warnCount > 0 ? "warn" : "ok";

  const CRON_JOBS = [
    { name: "Analytics Snapshot", schedule: "Daily 02:00 UTC", path: "/api/cron/analytics", status: "ok" as const },
    { name: "Email Reminders", schedule: "Daily 08:00 UTC", path: "/api/cron/reminders", status: "ok" as const },
  ];

  return (
    <div className="max-w-[900px] mx-auto px-8 py-8">
      <div className="mb-8">
        <EyebrowLabel className="mb-1">— SYSTEM</EyebrowLabel>
        <h1 className="font-display text-[32px] text-ink tracking-[-0.015em]">System Health</h1>
      </div>

      {/* Overall status */}
      <div className={`flex items-center gap-3 p-4 rounded-r3 border mb-8 ${STATUS_CONFIG[overallStatus].bg} border-current/20`}>
        {(() => { const Ic = STATUS_CONFIG[overallStatus].icon; return <Ic size={20} className={STATUS_CONFIG[overallStatus].color} />; })()}
        <div>
          <p className={`font-semibold text-[15px] ${STATUS_CONFIG[overallStatus].color}`}>
            {overallStatus === "ok" ? "ระบบทำงานปกติ" : overallStatus === "warn" ? "บางบริการยังไม่ได้ตั้งค่า" : "มีข้อผิดพลาดในระบบ"}
          </p>
          <p className="text-[12px] text-ink-3 font-mono">
            {okCount} OK · {warnCount} Warning · {errCount} Error · {services.length} services total
          </p>
        </div>
      </div>

      {/* Services grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
        {services.map((svc) => {
          const cfg = STATUS_CONFIG[svc.status];
          const Ic = cfg.icon;
          const SvcIcon = svc.icon;
          return (
            <div key={svc.name} className="bg-paper-3 border border-line rounded-r3 p-4">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-r2 flex items-center justify-center shrink-0 ${cfg.bg}`}>
                  <SvcIcon size={15} className={cfg.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-[13px] text-ink truncate">{svc.name}</p>
                    {svc.latency && svc.latency !== "—" && (
                      <span className="font-mono text-[10px] text-ink-4">{svc.latency}</span>
                    )}
                  </div>
                  <p className="text-[11px] text-ink-3 mb-1">{svc.description}</p>
                  {svc.note && (
                    <p className={`text-[11px] font-mono ${cfg.color}`}>{svc.note}</p>
                  )}
                </div>
                <div className="shrink-0">
                  <Ic size={16} className={cfg.color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cron jobs */}
      <div className="bg-paper-3 border border-line rounded-r3 p-6 mb-6">
        <h2 className="font-semibold text-[15px] text-ink mb-4 flex items-center gap-2">
          <Clock size={15} className="text-ink-3" /> Cron Jobs
        </h2>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-line">
              <th className="text-left py-2 text-[11px] text-ink-3 font-mono uppercase tracking-wider">Job</th>
              <th className="text-left py-2 text-[11px] text-ink-3 font-mono uppercase tracking-wider">Schedule</th>
              <th className="text-left py-2 text-[11px] text-ink-3 font-mono uppercase tracking-wider">Endpoint</th>
              <th className="text-right py-2 text-[11px] text-ink-3 font-mono uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {CRON_JOBS.map((job) => (
              <tr key={job.name} className="border-b border-line last:border-0">
                <td className="py-2.5 font-medium text-ink">{job.name}</td>
                <td className="py-2.5 font-mono text-ink-3 text-[12px]">{job.schedule}</td>
                <td className="py-2.5 font-mono text-ink-3 text-[11px]">{job.path}</td>
                <td className="py-2.5 text-right">
                  <span className="bg-ok/10 text-ok font-mono text-[10px] px-2 py-0.5 rounded-pill uppercase">Active</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* App info */}
      <div className="bg-paper-3 border border-line rounded-r3 p-6">
        <h2 className="font-semibold text-[15px] text-ink mb-4">App Info</h2>
        <div className="grid grid-cols-2 gap-3 text-[13px]">
          {[
            ["Platform", "VERDA LMS v1.0.0"],
            ["Framework", "Next.js 15 (App Router)"],
            ["Runtime", "Node.js / Vercel Edge"],
            ["Database ORM", "Prisma v6"],
            ["Auth", "NextAuth v5"],
            ["Deploy Region", "sin1 (Singapore)"],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between p-2.5 bg-paper-2 rounded-r2">
              <span className="text-ink-3">{k}</span>
              <span className="font-mono text-ink text-[12px]">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
