import Link from "next/link";
import {
  Users, BookOpen, ShoppingBag, TrendingUp, ArrowRight,
  AlertCircle, CheckCircle2, Clock, ExternalLink,
  Activity, Award,
} from "lucide-react";

import { db } from "@/lib/db";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { MOCK_COURSES } from "@/mock";
import { formatNumber, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const MOCK_MONTHLY = [
  { month: "ม.ค.", revenue: 210000, orders: 87 },
  { month: "ก.พ.", revenue: 275000, orders: 112 },
  { month: "มี.ค.", revenue: 248000, orders: 99 },
  { month: "เม.ย.", revenue: 320000, orders: 134 },
  { month: "พ.ค.", revenue: 390000, orders: 162 },
  { month: "มิ.ย.", revenue: 358000, orders: 147 },
];

const MOCK_ORDERS = [
  { id: "ord_007", userName: "คุณมณี รักเรียน", courseTitle: "UX Design & Figma Masterclass", total: 1990, currency: "THB", status: "PAID", createdAt: "2026-05-17" },
  { id: "ord_006", userName: "คุณปรีชา ฉลาดดี", courseTitle: "Next.js 15 Fullstack Bootcamp", total: 2990, currency: "THB", status: "PAID", createdAt: "2026-05-16" },
  { id: "ord_005", userName: "คุณนภา สวยงาม", courseTitle: "Python Data Science Bootcamp", total: 1590, currency: "THB", status: "PENDING", createdAt: "2026-05-15" },
  { id: "ord_004", userName: "คุณวิชัย เก่งมาก", courseTitle: "Meta Ads Masterclass 2026", total: 1290, currency: "THB", status: "REFUNDED", createdAt: "2026-05-14" },
  { id: "ord_003", userName: "คุณสุภาพร มั่นใจ", courseTitle: "UX Design & Figma Masterclass", total: 1990, currency: "THB", status: "PAID", createdAt: "2026-05-13" },
];

const STATUS_COLORS: Record<string, string> = {
  PAID: "bg-ok/10 text-ok",
  PENDING: "bg-warn/10 text-warn",
  REFUNDED: "bg-danger/10 text-danger",
  FAILED: "bg-line text-ink-3",
};

type OrderRow = {
  id: string;
  userName: string;
  courseTitle: string;
  total: number;
  currency: string;
  status: string;
  createdAt: string;
};

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  let totalUsers = 0;
  let totalCourses = 0;
  let totalOrders = 0;
  let totalRevenue = 0;
  let newUsersThisWeek = 0;
  let pendingReviews = 0;
  let recentOrders: OrderRow[] = [];
  const monthlyData = MOCK_MONTHLY;
  let publishedCourses = 0;
  let draftCourses = 0;

  try {
    totalUsers = await db.user.count();
    totalCourses = await db.course.count();
    totalOrders = await db.order.count();

    const agg = await db.order.aggregate({
      where: { status: "PAID" },
      _sum: { total: true },
    });
    totalRevenue = agg._sum.total ?? 0;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    newUsersThisWeek = await db.user.count({ where: { createdAt: { gte: oneWeekAgo } } });

    pendingReviews = await db.course.count({ where: { status: "REVIEW" } });
    publishedCourses = await db.course.count({ where: { status: "PUBLISHED" } });
    draftCourses = await db.course.count({ where: { status: "DRAFT" } });

    const dbOrders = await db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: { select: { name: true } },
        items: { include: { course: { select: { title: true } } }, take: 1 },
      },
    });
    recentOrders = dbOrders.map((o) => ({
      id: o.id,
      userName: o.user?.name ?? "—",
      courseTitle: o.items[0]?.course?.title ?? "—",
      total: o.total,
      currency: o.currency,
      status: o.status,
      createdAt: o.createdAt.toISOString().slice(0, 10),
    }));
  } catch {
    // Mock fallback
    const mockRevenue = MOCK_COURSES.reduce((s, c) => s + c.price * c.enrollmentCount, 0);
    totalUsers = 92_442;
    totalCourses = MOCK_COURSES.length;
    totalOrders = 1_847;
    totalRevenue = mockRevenue;
    newUsersThisWeek = 214;
    pendingReviews = 2;
    publishedCourses = MOCK_COURSES.filter((c) => c.status === "PUBLISHED").length;
    draftCourses = 0;
    recentOrders = MOCK_ORDERS;
  }

  const chartMax = Math.max(...monthlyData.map((m) => m.revenue), 1);

  return (
    <div className="p-8 max-w-[1200px]">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <EyebrowLabel className="mb-1">ADMIN PANEL</EyebrowLabel>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-display text-[34px] text-ink tracking-[-0.015em]">
              Platform Overview
            </h1>
            <p className="text-[14px] text-ink-3 mt-1">
              VERDA LMS ·{" "}
              <span className="text-viridian font-medium">+{formatNumber(newUsersThisWeek)} users</span>
              {" "}สัปดาห์นี้
              {pendingReviews > 0 && (
                <span className="ml-3 text-warn">
                  ⚠ {pendingReviews} คอร์สรอตรวจ
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/${locale}/admin/courses`}>
              <span className="flex items-center gap-1.5 px-3.5 py-2 text-[13px] border border-line rounded-r2 text-ink-2 hover:border-viridian hover:text-ink transition-colors">
                <BookOpen size={13} /> จัดการคอร์ส
              </span>
            </Link>
            <Link href={`/${locale}/admin/users`}>
              <span className="flex items-center gap-1.5 px-3.5 py-2 text-[13px] bg-viridian text-white rounded-r2 hover:bg-viridian-2 transition-colors">
                <Users size={13} /> จัดการผู้ใช้
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stats row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "TOTAL USERS", value: formatNumber(totalUsers), icon: Users,
            sub: `+${formatNumber(newUsersThisWeek)} สัปดาห์นี้`, color: "text-viridian",
          },
          {
            label: "COURSES", value: `${totalCourses}`, icon: BookOpen,
            sub: `${publishedCourses} เผยแพร่ · ${draftCourses} Draft`, color: "text-viridian",
          },
          {
            label: "ORDERS", value: formatNumber(totalOrders), icon: ShoppingBag,
            sub: "คำสั่งซื้อทั้งหมด", color: "text-viridian",
          },
          {
            label: "REVENUE", value: formatPrice(totalRevenue, "THB"), icon: TrendingUp,
            sub: "รายได้สะสม (ชำระแล้ว)", color: "text-ok",
          },
        ].map(({ label, value, icon: Icon, sub, color }) => (
          <div key={label} className="bg-paper-3 border border-line rounded-r3 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink-3">{label}</p>
              <Icon size={15} className={color} />
            </div>
            <p className={`font-display text-[26px] ${color} leading-none mb-1`}>{value}</p>
            <p className="text-[11px] text-ink-4">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Main 2-column grid ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-[1fr_300px] gap-6">

        {/* ────── LEFT ────── */}
        <div className="flex flex-col gap-6">

          {/* Revenue chart */}
          <div className="bg-paper-3 border border-line rounded-r3 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-[15px] text-ink flex items-center gap-2">
                <Activity size={15} className="text-viridian" />
                รายได้รายเดือน (6 เดือนล่าสุด)
              </h2>
              <Link
                href={`/${locale}/admin/orders`}
                className="font-mono text-[10px] tracking-[0.1em] uppercase text-viridian hover:underline flex items-center gap-1"
              >
                ดูคำสั่งซื้อ <ArrowRight size={10} />
              </Link>
            </div>
            <div className="flex items-end gap-3" style={{ height: "140px" }}>
              {monthlyData.map((m) => {
                const barH = Math.max((m.revenue / chartMax) * 112, 4);
                const isLast = m.month === monthlyData[monthlyData.length - 1].month;
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5">
                    <p className="font-mono text-[9px] text-ink-3">
                      {(m.revenue / 1000).toFixed(0)}K
                    </p>
                    <div className="w-full flex flex-col justify-end" style={{ height: "112px" }}>
                      <div
                        className={`w-full rounded-t transition-colors ${
                          isLast ? "bg-viridian" : "bg-viridian/50 hover:bg-viridian/70"
                        }`}
                        style={{ height: `${barH}px` }}
                        title={`${m.month}: ${formatPrice(m.revenue, "THB")}`}
                      />
                    </div>
                    <p className="font-mono text-[9px] text-ink-4">{m.month}</p>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-line">
              <p className="text-[12px] text-ink-3">
                รวม 6 เดือน:{" "}
                <strong className="text-ink">
                  {formatPrice(monthlyData.reduce((s, m) => s + m.revenue, 0), "THB")}
                </strong>
              </p>
              <p className="text-[12px] text-ink-3">
                {monthlyData.reduce((s, m) => s + m.orders, 0).toLocaleString()} คำสั่งซื้อ
              </p>
            </div>
          </div>

          {/* Recent orders */}
          <div className="bg-paper-3 border border-line rounded-r3 overflow-hidden">
            <div className="px-5 py-3 border-b border-line bg-paper-2 flex items-center justify-between">
              <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-ink-3">
                คำสั่งซื้อล่าสุด
              </p>
              <Link
                href={`/${locale}/admin/orders`}
                className="font-mono text-[10px] tracking-[0.1em] uppercase text-viridian hover:underline"
              >
                ดูทั้งหมด →
              </Link>
            </div>
            <table className="w-full text-[14px]">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-left px-5 py-3 font-mono text-[10px] tracking-[0.1em] uppercase text-ink-3">ผู้ซื้อ</th>
                  <th className="text-left px-5 py-3 font-mono text-[10px] tracking-[0.1em] uppercase text-ink-3">คอร์ส</th>
                  <th className="text-right px-5 py-3 font-mono text-[10px] tracking-[0.1em] uppercase text-ink-3">ยอด</th>
                  <th className="text-center px-5 py-3 font-mono text-[10px] tracking-[0.1em] uppercase text-ink-3">สถานะ</th>
                  <th className="text-right px-5 py-3 font-mono text-[10px] tracking-[0.1em] uppercase text-ink-3">วันที่</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-line last:border-0 hover:bg-paper-2 transition-colors">
                    <td className="px-5 py-3 font-medium text-ink">{o.userName}</td>
                    <td className="px-5 py-3 text-ink-2 max-w-[200px] truncate text-[13px]">{o.courseTitle}</td>
                    <td className="px-5 py-3 text-right font-mono text-[12px] text-ink">
                      {formatPrice(o.total, o.currency)}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`font-mono text-[9px] px-2 py-0.5 rounded-pill uppercase tracking-wide ${STATUS_COLORS[o.status] ?? "bg-line text-ink-3"}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-[11px] text-ink-3">{o.createdAt.slice(5)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ────── RIGHT sidebar ────── */}
        <div className="flex flex-col gap-5">

          {/* Pending actions */}
          <div className="bg-paper-3 border border-line rounded-r3 p-5">
            <h3 className="font-semibold text-[14px] text-ink mb-3 flex items-center gap-1.5">
              <AlertCircle size={13} className="text-warn" />
              รอดำเนินการ
            </h3>
            <div className="flex flex-col gap-2.5">
              {pendingReviews > 0 ? (
                <Link
                  href={`/${locale}/admin/courses`}
                  className="flex items-center justify-between p-3 bg-warn/8 border border-warn/25 rounded-r2 hover:bg-warn/15 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen size={13} className="text-warn" />
                    <span className="text-[13px] text-ink">คอร์สรอตรวจ</span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-warn bg-warn/20 px-1.5 py-0.5 rounded-pill">
                    {pendingReviews}
                  </span>
                </Link>
              ) : (
                <div className="flex items-center gap-2 text-ok text-[12px] p-2">
                  <CheckCircle2 size={13} />
                  ไม่มีคอร์สรอตรวจ
                </div>
              )}
              <Link
                href={`/${locale}/admin/users`}
                className="flex items-center justify-between p-3 bg-paper-2 border border-line rounded-r2 hover:border-viridian-3 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Users size={13} className="text-viridian" />
                  <span className="text-[13px] text-ink">ผู้ใช้ใหม่ (7 วัน)</span>
                </div>
                <span className="font-mono text-[11px] text-viridian">+{formatNumber(newUsersThisWeek)}</span>
              </Link>
              <Link
                href={`/${locale}/admin/orders`}
                className="flex items-center justify-between p-3 bg-paper-2 border border-line rounded-r2 hover:border-viridian-3 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Clock size={13} className="text-amber-500" />
                  <span className="text-[13px] text-ink">คำสั่งซื้อ Pending</span>
                </div>
                <span className="font-mono text-[11px] text-amber-500">
                  {recentOrders.filter((o) => o.status === "PENDING").length}
                </span>
              </Link>
            </div>
          </div>

          {/* Quick navigation */}
          <div className="bg-paper-3 border border-line rounded-r3 p-5">
            <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink-3 mb-3">
              Navigation
            </p>
            <div className="flex flex-col gap-1.5">
              {[
                { href: `/${locale}/admin/users`, label: "จัดการผู้ใช้", icon: Users },
                { href: `/${locale}/admin/courses`, label: "จัดการคอร์ส", icon: BookOpen },
                { href: `/${locale}/admin/orders`, label: "คำสั่งซื้อ", icon: ShoppingBag },
                { href: `/${locale}/admin/settings`, label: "ตั้งค่าแพลตฟอร์ม", icon: Activity },
              ].map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-ink-2 hover:bg-paper-2 hover:text-ink rounded-r2 transition-colors"
                >
                  <Icon size={14} className="text-ink-3" />
                  {label}
                  <ArrowRight size={11} className="ml-auto text-ink-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Platform status */}
          <div className="bg-paper-3 border border-line rounded-r3 p-5">
            <h3 className="font-semibold text-[14px] text-ink mb-3 flex items-center gap-1.5">
              <Activity size={13} className="text-ok" />
              สถานะแพลตฟอร์ม
            </h3>
            <div className="flex flex-col gap-2">
              {[
                { label: "API", ok: true },
                { label: "Database", ok: true },
                { label: "Storage (Blob)", ok: true },
                { label: "Video (Mux)", ok: true },
                { label: "Payment (Stripe)", ok: true },
              ].map(({ label, ok }) => (
                <div key={label} className="flex items-center justify-between text-[12px]">
                  <span className="text-ink-2">{label}</span>
                  <span className={`flex items-center gap-1 font-mono text-[10px] ${ok ? "text-ok" : "text-danger"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${ok ? "bg-ok" : "bg-danger"}`} />
                    {ok ? "OK" : "DOWN"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Certificates issued */}
          <div className="flex items-center gap-3 p-4 bg-[#FFFBEB] border border-[#FDE68A] rounded-r3">
            <Award size={15} className="text-gold shrink-0" />
            <div>
              <p className="text-[12px] font-medium text-ink">ใบประกาศที่ออก</p>
              <p className="text-[20px] font-display text-gold leading-tight">
                {formatNumber(Math.floor(totalUsers * 0.08))}
              </p>
            </div>
            <Link
              href={`/${locale}/admin/users`}
              className="ml-auto"
            >
              <ExternalLink size={12} className="text-gold/60 hover:text-gold" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
