import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { MOCK_COURSES, MOCK_INSTRUCTOR } from "@/mock";
import { formatNumber, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const MOCK_MONTHLY = [
  { month: "ม.ค.", revenue: 48000, students: 24 },
  { month: "ก.พ.", revenue: 62000, students: 31 },
  { month: "มี.ค.", revenue: 55000, students: 28 },
  { month: "เม.ย.", revenue: 78000, students: 39 },
  { month: "พ.ค.", revenue: 91000, students: 46 },
  { month: "มิ.ย.", revenue: 84000, students: 42 },
];

const maxRevenue = Math.max(...MOCK_MONTHLY.map((m) => m.revenue));

export default function StudioAnalyticsPage() {
  const myCourses = MOCK_COURSES.filter((c) => c.instructor.id === MOCK_INSTRUCTOR.id);
  const totalRevenue = myCourses.reduce((s, c) => s + c.price * c.enrollmentCount, 0);
  const totalStudents = myCourses.reduce((s, c) => s + c.enrollmentCount, 0);

  return (
    <div className="p-8 max-w-[1100px]">
      <div className="mb-8">
        <EyebrowLabel className="mb-1">STUDIO / ANALYTICS</EyebrowLabel>
        <h1 className="font-display text-[32px] text-ink tracking-[-0.015em]">Analytics</h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-paper-3 border border-line rounded-r3 p-5">
          <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink-3 mb-2">รายได้รวม</p>
          <p className="font-display text-[32px] text-viridian">{formatPrice(totalRevenue, "THB")}</p>
        </div>
        <div className="bg-paper-3 border border-line rounded-r3 p-5">
          <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink-3 mb-2">นักเรียนทั้งหมด</p>
          <p className="font-display text-[32px] text-viridian">{formatNumber(totalStudents)}</p>
        </div>
        <div className="bg-paper-3 border border-line rounded-r3 p-5">
          <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink-3 mb-2">อัตราเรียนจบ</p>
          <p className="font-display text-[32px] text-viridian">68%</p>
        </div>
      </div>

      {/* Revenue chart (simple bar chart) */}
      <div className="bg-paper-3 border border-line rounded-r3 p-6 mb-8">
        <h2 className="font-semibold text-[16px] text-ink mb-6">รายได้รายเดือน</h2>
        <div className="flex items-end gap-3 h-[160px]">
          {MOCK_MONTHLY.map((m) => (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
              <p className="font-mono text-[10px] text-ink-3">{formatPrice(m.revenue, "THB").replace("฿", "")}</p>
              <div
                className="w-full bg-viridian/20 rounded-t-r1 relative overflow-hidden"
                style={{ height: `${(m.revenue / maxRevenue) * 120}px` }}
              >
                <div
                  className="absolute bottom-0 left-0 right-0 bg-viridian rounded-t-r1"
                  style={{ height: "100%" }}
                />
              </div>
              <p className="font-mono text-[10px] text-ink-3">{m.month}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Course breakdown */}
      <div>
        <h2 className="font-semibold text-[16px] text-ink mb-4">สรุปตามคอร์ส</h2>
        <div className="border border-line rounded-r3 overflow-hidden">
          <table className="w-full text-[14px]">
            <thead>
              <tr className="bg-paper-2 border-b border-line">
                <th className="text-left px-5 py-3 font-mono text-[10px] tracking-[0.1em] uppercase text-ink-3">คอร์ส</th>
                <th className="text-right px-5 py-3 font-mono text-[10px] tracking-[0.1em] uppercase text-ink-3">นักเรียน</th>
                <th className="text-right px-5 py-3 font-mono text-[10px] tracking-[0.1em] uppercase text-ink-3">รายได้</th>
                <th className="text-right px-5 py-3 font-mono text-[10px] tracking-[0.1em] uppercase text-ink-3">Completion</th>
              </tr>
            </thead>
            <tbody>
              {myCourses.map((course) => (
                <tr key={course.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-4 font-medium text-ink">{course.title}</td>
                  <td className="px-5 py-4 text-right text-ink-2">{formatNumber(course.enrollmentCount)}</td>
                  <td className="px-5 py-4 text-right font-mono text-[13px]">
                    {formatPrice(course.price * course.enrollmentCount, course.currency)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 bg-line rounded-full overflow-hidden">
                        <div className="h-full bg-viridian rounded-full" style={{ width: "68%" }} />
                      </div>
                      <span className="text-[12px] text-ink-3">68%</span>
                    </div>
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
