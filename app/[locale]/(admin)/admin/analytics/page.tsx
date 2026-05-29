import { getAnalyticsData } from "@/actions/admin";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { formatPrice, formatNumber } from "@/lib/utils";
import { TrendingUp, Users, ShoppingBag, BookOpen, Download } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params; // locale not needed — links handled by AdminSidebar
  const data = await getAnalyticsData();

  const maxRevenue = Math.max(...data.monthlyData.map((m) => m.revenue));
  const maxUsers = Math.max(...data.monthlyData.map((m) => m.newUsers));

  const totalMonthlyRevenue = data.monthlyData.reduce((s, m) => s + m.revenue, 0);
  const avgMonthlyRevenue = totalMonthlyRevenue / data.monthlyData.length;

  return (
    <div className="max-w-[1100px] mx-auto px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <EyebrowLabel className="mb-1">— ANALYTICS</EyebrowLabel>
          <h1 className="font-display text-[32px] text-ink tracking-[-0.015em]">
            Revenue & Growth
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {(["enrollments", "orders", "progress"] as const).map((type) => (
            <Link
              key={type}
              href={`/api/analytics/export?type=${type}`}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-line rounded-r2 text-[12px] text-ink-2 hover:border-viridian hover:text-viridian transition-colors bg-paper"
            >
              <Download size={12} />
              {type === "enrollments" ? "Enrollments" : type === "orders" ? "Orders" : "Progress"} CSV
            </Link>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "รายได้รวม (6 เดือน)", value: formatPrice(totalMonthlyRevenue * 100, "THB"), sub: `เฉลี่ย ${formatPrice(avgMonthlyRevenue * 100, "THB")}/เดือน`, icon: TrendingUp, color: "text-viridian" },
          { label: "ผู้ใช้ทั้งหมด", value: formatNumber(data.totalUsers), sub: `${formatNumber(data.monthlyData.at(-1)?.newUsers ?? 0)} ใหม่เดือนนี้`, icon: Users, color: "text-blue-500" },
          { label: "คำสั่งซื้อ", value: formatNumber(data.totalOrders), sub: `${formatNumber(data.monthlyData.at(-1)?.orders ?? 0)} เดือนนี้`, icon: ShoppingBag, color: "text-amber-500" },
          { label: "คอร์ส Published", value: formatNumber(data.totalCourses), sub: "active", icon: BookOpen, color: "text-ok" },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-paper-3 border border-line rounded-r3 p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[12px] text-ink-3 font-thai">{label}</p>
              <div className="w-8 h-8 rounded-r2 bg-paper-2 flex items-center justify-center">
                <Icon size={15} className={color} />
              </div>
            </div>
            <p className="font-display text-[26px] text-ink leading-none mb-1">{value}</p>
            <p className="text-[11px] text-ink-4">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-paper-3 border border-line rounded-r3 p-6">
          <h2 className="font-semibold text-[15px] text-ink mb-5">รายได้รายเดือน</h2>
          <div className="flex items-end gap-3 h-[180px]">
            {data.monthlyData.map((m) => {
              const pct = maxRevenue > 0 ? (m.revenue / maxRevenue) * 100 : 0;
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5">
                  <p className="font-mono text-[10px] text-ink-3 truncate">
                    {formatPrice(m.revenue * 100, "THB").replace("฿", "").trim()}
                  </p>
                  <div className="w-full relative flex items-end" style={{ height: "130px" }}>
                    <div
                      className="w-full bg-viridian rounded-t-r1 transition-all hover:bg-viridian/80"
                      style={{ height: `${Math.max(pct, 4)}%` }}
                      title={`${m.month}: ${formatPrice(m.revenue * 100, "THB")}`}
                    />
                  </div>
                  <p className="font-mono text-[10px] text-ink-3">{m.month}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* User Growth */}
        <div className="bg-paper-3 border border-line rounded-r3 p-6">
          <h2 className="font-semibold text-[15px] text-ink mb-5">ผู้ใช้ใหม่รายเดือน</h2>
          <div className="flex flex-col gap-2.5">
            {data.monthlyData.map((m) => {
              const pct = maxUsers > 0 ? (m.newUsers / maxUsers) * 100 : 0;
              return (
                <div key={m.month} className="flex items-center gap-2.5">
                  <span className="font-mono text-[10px] text-ink-3 w-8 shrink-0">{m.month}</span>
                  <div className="flex-1 h-5 bg-paper-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-400/70 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-ink-2 w-8 text-right">{m.newUsers}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Courses */}
      <div className="bg-paper-3 border border-line rounded-r3 p-6">
        <h2 className="font-semibold text-[15px] text-ink mb-5">คอร์สยอดนิยม (Top 5)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-[14px]">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left py-2.5 pr-4 text-[11px] text-ink-3 font-mono uppercase tracking-wider">#</th>
                <th className="text-left py-2.5 pr-4 text-[11px] text-ink-3 font-mono uppercase tracking-wider">คอร์ส</th>
                <th className="text-right py-2.5 pr-4 text-[11px] text-ink-3 font-mono uppercase tracking-wider">ลงทะเบียน</th>
                <th className="text-right py-2.5 pr-4 text-[11px] text-ink-3 font-mono uppercase tracking-wider">ราคา</th>
                <th className="text-right py-2.5 text-[11px] text-ink-3 font-mono uppercase tracking-wider">Rating</th>
              </tr>
            </thead>
            <tbody>
              {data.topCourses.map((c, i) => (
                <tr key={c.id} className="border-b border-line last:border-0 hover:bg-paper-2/50 transition-colors">
                  <td className="py-3 pr-4 font-mono text-[12px] text-ink-3">{i + 1}</td>
                  <td className="py-3 pr-4 font-thai text-ink font-medium">{c.title}</td>
                  <td className="py-3 pr-4 text-right font-mono text-[13px] text-ink-2">
                    {formatNumber(c.enrollmentCount)}
                  </td>
                  <td className="py-3 pr-4 text-right font-mono text-[13px] text-viridian">
                    {formatPrice(c.price, "THB")}
                  </td>
                  <td className="py-3 text-right">
                    <span className="font-mono text-[12px] text-amber-500">★ {c.rating.toFixed(1)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
