import { db } from "@/lib/db";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { formatNumber, formatPrice } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";

export const dynamic = "force-dynamic";

type OrderRow = {
  id: string;
  userName: string;
  userEmail: string;
  courseTitle: string;
  total: number;
  currency: string;
  status: string;
  createdAt: string;
};

const MOCK_ORDERS: OrderRow[] = [
  { id: "ord_001", userName: "คุณสมชาย ทดสอบ", userEmail: "demo@verda.dev", courseTitle: "UX Design & Figma Masterclass", total: 1990, currency: "THB", status: "PAID", createdAt: "2026-04-15" },
  { id: "ord_002", userName: "คุณสุภาพร มั่นใจ", userEmail: "supaporn@example.com", courseTitle: "Next.js 15 Fullstack Bootcamp", total: 2990, currency: "THB", status: "PAID", createdAt: "2026-04-14" },
  { id: "ord_003", userName: "คุณวิชัย เก่งมาก", userEmail: "vichai@example.com", courseTitle: "UX Design & Figma Masterclass", total: 1990, currency: "THB", status: "PAID", createdAt: "2026-04-13" },
  { id: "ord_004", userName: "คุณนภา สวยงาม", userEmail: "napa@example.com", courseTitle: "Python for Data Science", total: 3490, currency: "THB", status: "REFUNDED", createdAt: "2026-04-12" },
  { id: "ord_005", userName: "คุณปรีชา ฉลาดดี", userEmail: "preecha@example.com", courseTitle: "Next.js 15 Fullstack Bootcamp", total: 2990, currency: "THB", status: "PENDING", createdAt: "2026-04-12" },
  { id: "ord_006", userName: "คุณมณี รักเรียน", userEmail: "manee@example.com", courseTitle: "Digital Marketing Masterclass", total: 1490, currency: "THB", status: "PAID", createdAt: "2026-04-11" },
  { id: "ord_007", userName: "คุณภูริช อินทรดี", userEmail: "phurit@example.com", courseTitle: "UX Design & Figma Masterclass", total: 1990, currency: "THB", status: "PAID", createdAt: "2026-04-10" },
];

const STATUS_COLORS: Record<string, string> = {
  PAID: "bg-ok/10 text-ok",
  PENDING: "bg-warn/10 text-warn",
  REFUNDED: "bg-danger/10 text-danger",
  FAILED: "bg-line text-ink-3",
};

export default async function AdminOrdersPage() {
  let orders: OrderRow[] = [];
  let total = 0;
  let revenue = 0;

  try {
    const dbOrders = await db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { course: { select: { title: true } } }, take: 1 },
      },
    });
    total = await db.order.count();
    const agg = await db.order.aggregate({ where: { status: "PAID" }, _sum: { total: true } });
    revenue = agg._sum.total ?? 0;
    orders = dbOrders.map((o) => ({
      id: o.id,
      userName: o.user?.name ?? "—",
      userEmail: o.user?.email ?? "—",
      courseTitle: o.items[0]?.course?.title ?? "—",
      total: o.total,
      currency: o.currency,
      status: o.status,
      createdAt: o.createdAt.toISOString().slice(0, 10),
    }));
  } catch {
    orders = MOCK_ORDERS;
    total = 1847;
    revenue = MOCK_ORDERS.filter((o) => o.status === "PAID").reduce((s, o) => s + o.total, 0);
  }

  const paidCount = orders.filter((o) => o.status === "PAID").length;

  return (
    <div className="p-8 max-w-[1100px]">
      <div className="flex items-start justify-between mb-8">
        <div>
          <EyebrowLabel className="mb-1">ADMIN / ORDERS</EyebrowLabel>
          <h1 className="font-display text-[32px] text-ink tracking-[-0.015em]">คำสั่งซื้อ</h1>
          <p className="text-[14px] text-ink-3 mt-1">
            <strong className="text-ink">{formatNumber(total)}</strong> รายการทั้งหมด
          </p>
        </div>
        <div className="flex items-center gap-2 bg-paper-3 border border-line rounded-r3 px-4 py-3">
          <ShoppingBag size={18} className="text-viridian" />
          <div>
            <p className="font-mono text-[10px] text-ink-3 tracking-wide uppercase">รายได้ (แสดง)</p>
            <p className="font-display text-[22px] text-viridian leading-tight">{formatPrice(revenue, "THB")}</p>
          </div>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "รายการทั้งหมด", value: formatNumber(total), cls: "" },
          { label: "ชำระแล้ว", value: String(paidCount), cls: "text-ok" },
          { label: "รายได้รวม", value: formatPrice(revenue, "THB"), cls: "text-viridian" },
        ].map(({ label, value, cls }) => (
          <div key={label} className="bg-paper-3 border border-line rounded-r3 px-5 py-4">
            <p className="font-mono text-[10px] text-ink-3 tracking-[0.1em] uppercase mb-1">{label}</p>
            <p className={`font-display text-[24px] leading-tight ${cls || "text-ink"}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-paper-3 border border-line rounded-r3 overflow-hidden">
        <div className="px-5 py-3 border-b border-line bg-paper-2">
          <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-ink-3">
            รายการล่าสุด ({orders.length} รายการที่แสดง)
          </p>
        </div>
        <table className="w-full text-[14px]">
          <thead>
            <tr className="border-b border-line">
              <th className="text-left px-5 py-3 font-mono text-[10px] tracking-[0.1em] uppercase text-ink-3">ผู้ซื้อ</th>
              <th className="text-left px-5 py-3 font-mono text-[10px] tracking-[0.1em] uppercase text-ink-3">คอร์ส</th>
              <th className="text-right px-5 py-3 font-mono text-[10px] tracking-[0.1em] uppercase text-ink-3">ยอดเงิน</th>
              <th className="text-center px-5 py-3 font-mono text-[10px] tracking-[0.1em] uppercase text-ink-3">สถานะ</th>
              <th className="text-right px-5 py-3 font-mono text-[10px] tracking-[0.1em] uppercase text-ink-3">วันที่</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-line last:border-0 hover:bg-paper-2 transition-colors">
                <td className="px-5 py-3">
                  <p className="font-medium text-ink">{o.userName}</p>
                  <p className="text-[12px] text-ink-3">{o.userEmail}</p>
                </td>
                <td className="px-5 py-3 text-ink-2 max-w-[220px] truncate">{o.courseTitle}</td>
                <td className="px-5 py-3 text-right font-mono text-[13px] text-ink">
                  {formatPrice(o.total, o.currency)}
                </td>
                <td className="px-5 py-3 text-center">
                  <span className={`font-mono text-[10px] px-2 py-0.5 rounded-pill uppercase tracking-wide ${STATUS_COLORS[o.status] ?? "bg-line text-ink-3"}`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-right font-mono text-[12px] text-ink-3">{o.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
