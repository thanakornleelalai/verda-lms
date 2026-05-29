import Link from "next/link";
import { CheckCircle, Zap, Crown, Infinity } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { Button } from "@/components/primitives/Button";

const PLANS = [
  {
    id: "monthly",
    icon: Zap,
    name: "รายเดือน",
    nameEn: "MONTHLY",
    price: 299,
    period: "/ เดือน",
    description: "เหมาะสำหรับผู้เรียนที่ต้องการทดลองก่อน",
    highlight: false,
    features: [
      "เข้าถึงคอร์สทั้งหมดกว่า 200+ คอร์ส",
      "ดาวน์โหลดเนื้อหาเพื่อเรียน offline",
      "ใบประกาศนียบัตรดิจิทัล",
      "Q&A กับผู้สอนได้ไม่จำกัด",
      "อัปเดตเนื้อหาคอร์สตลอดชีพ",
    ],
    cta: "เริ่มต้น ฿299/เดือน",
    ctaVariant: "ghost" as const,
  },
  {
    id: "yearly",
    icon: Crown,
    name: "รายปี",
    nameEn: "YEARLY",
    price: 2490,
    period: "/ ปี",
    description: "ประหยัดกว่า 30% เมื่อชำระรายปี",
    highlight: true,
    badge: "ยอดนิยม",
    features: [
      "เข้าถึงคอร์สทั้งหมดกว่า 200+ คอร์ส",
      "ดาวน์โหลดเนื้อหาเพื่อเรียน offline",
      "ใบประกาศนียบัตรดิจิทัล + PDF",
      "Q&A กับผู้สอนได้ไม่จำกัด",
      "อัปเดตเนื้อหาคอร์สตลอดชีพ",
      "เข้าร่วม Live Session ทุกเดือน",
      "Community Discord exclusive",
    ],
    cta: "เริ่มต้น ฿2,490/ปี",
    ctaVariant: "primary" as const,
  },
  {
    id: "lifetime",
    icon: Infinity,
    name: "ตลอดชีพ",
    nameEn: "LIFETIME",
    price: 4990,
    period: "ครั้งเดียว",
    description: "จ่ายครั้งเดียว เรียนได้ตลอดชีพ",
    highlight: false,
    features: [
      "เข้าถึงคอร์สทั้งหมดกว่า 200+ คอร์ส",
      "ดาวน์โหลดเนื้อหาเพื่อเรียน offline",
      "ใบประกาศนียบัตรดิจิทัล + PDF",
      "Q&A กับผู้สอนได้ไม่จำกัด",
      "อัปเดตเนื้อหาคอร์สตลอดชีพ",
      "เข้าร่วม Live Session ทุกเดือน",
      "Community Discord exclusive",
      "1:1 Mentoring session (1 ครั้ง)",
    ],
    cta: "ซื้อตลอดชีพ ฿4,990",
    ctaVariant: "ghost" as const,
  },
];

const FAQ = [
  {
    q: "สามารถยกเลิกได้เมื่อไหร่?",
    a: "สมาชิกรายเดือนสามารถยกเลิกได้ทุกเมื่อ โดยจะมีผลในรอบบิลถัดไป สมาชิกรายปีสามารถขอคืนเงินได้ภายใน 7 วันแรก",
  },
  {
    q: "คอร์สใหม่มีให้เรียนทันทีหรือไม่?",
    a: "ใช่ครับ เมื่อมีคอร์สใหม่เพิ่มเข้ามาในแพลตฟอร์ม สมาชิกทุกแผนจะสามารถเข้าถึงได้ทันทีโดยไม่เสียค่าใช้จ่ายเพิ่มเติม",
  },
  {
    q: "ชำระเงินด้วยอะไรได้บ้าง?",
    a: "รับบัตรเครดิต/เดบิต Visa, Mastercard และ PromptPay (QR Code) รองรับทุกธนาคารในไทย",
  },
  {
    q: "สำหรับองค์กรหรือบริษัทมีแผนพิเศษไหม?",
    a: "มีครับ แผน Enterprise เริ่มต้นที่ 10 ที่นั่ง พร้อม dashboard สำหรับผู้ดูแล ติดต่อทีมงานได้ที่ hello@verda.co.th",
  },
];

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-paper">
      <TopBar />
      <main>
        {/* Hero */}
        <section className="py-16 text-center border-b border-line">
          <Container>
            <EyebrowLabel className="mb-3">— PRICING</EyebrowLabel>
            <h1 className="font-display text-[48px] text-ink tracking-[-0.02em] leading-[1.1] mb-4">
              เรียนได้ทุกคอร์ส
              <br />
              <em className="not-italic text-viridian">ในราคาเดียว</em>
            </h1>
            <p className="text-[16px] text-ink-3 max-w-[480px] mx-auto font-thai leading-[1.7]">
              สมัครสมาชิกเพื่อเข้าถึงคอร์สทั้งหมดกว่า 200+ คอร์ส
              จากผู้เชี่ยวชาญที่ทำงานจริงในอุตสาหกรรม
            </p>
          </Container>
        </section>

        {/* Plans */}
        <section className="py-16">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[960px] mx-auto">
              {PLANS.map((plan) => {
                const Icon = plan.icon;
                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-r4 border p-8 flex flex-col ${
                      plan.highlight
                        ? "bg-ink border-[#2A332E] text-white shadow-xl scale-[1.02]"
                        : "bg-paper-3 border-line"
                    }`}
                  >
                    {"badge" in plan && plan.badge && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                        <span className="bg-viridian text-white font-mono text-[10px] px-3 py-1 rounded-pill tracking-[0.1em] uppercase">
                          {plan.badge}
                        </span>
                      </div>
                    )}

                    <div className={`w-10 h-10 rounded-r2 flex items-center justify-center mb-5 ${plan.highlight ? "bg-viridian/20" : "bg-viridian-wash"}`}>
                      <Icon size={18} className="text-viridian" />
                    </div>

                    <p className={`font-mono text-[10px] tracking-[0.15em] uppercase mb-1 ${plan.highlight ? "text-[#6E756F]" : "text-ink-3"}`}>
                      {plan.nameEn}
                    </p>
                    <h2 className={`font-display text-[22px] mb-1 ${plan.highlight ? "text-white" : "text-ink"}`}>
                      {plan.name}
                    </h2>
                    <p className={`text-[13px] mb-6 font-thai ${plan.highlight ? "text-[#8A938E]" : "text-ink-3"}`}>
                      {plan.description}
                    </p>

                    <div className="mb-6">
                      <span className={`font-display text-[44px] leading-none ${plan.highlight ? "text-viridian" : "text-ink"}`}>
                        ฿{plan.price.toLocaleString()}
                      </span>
                      <span className={`text-[14px] ml-1 ${plan.highlight ? "text-[#6E756F]" : "text-ink-3"}`}>
                        {plan.period}
                      </span>
                    </div>

                    <ul className="flex flex-col gap-2.5 mb-8 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-[13px] font-thai">
                          <CheckCircle size={14} className="text-viridian shrink-0 mt-0.5" />
                          <span className={plan.highlight ? "text-[#C9CDC8]" : "text-ink-2"}>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <Link href={`/${locale}/login?tab=signup`}>
                      <Button
                        variant={plan.highlight ? "primary" : plan.ctaVariant}
                        size="lg"
                        className="w-full justify-center"
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>

            <p className="text-center text-[13px] text-ink-3 mt-8 font-thai">
              ทุกแผนมีทดลองใช้งาน 7 วันฟรี · ไม่ต้องใส่บัตรเครดิต
            </p>
          </Container>
        </section>

        {/* Feature comparison */}
        <section className="py-12 bg-paper-2 border-t border-b border-line">
          <Container>
            <h2 className="font-display text-[32px] text-ink text-center mb-8 tracking-[-0.015em]">
              เปรียบเทียบแผน
            </h2>
            <div className="max-w-[760px] mx-auto overflow-x-auto rounded-r3 border border-line">
              <table className="w-full text-[14px]">
                <thead>
                  <tr className="border-b border-line">
                    <th className="text-left py-3 text-ink-3 font-mono text-[11px] uppercase tracking-wider w-[40%]">ฟีเจอร์</th>
                    <th className="text-center py-3 text-ink font-medium">รายเดือน</th>
                    <th className="text-center py-3 text-viridian font-semibold">รายปี</th>
                    <th className="text-center py-3 text-ink font-medium">ตลอดชีพ</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["200+ คอร์ส", true, true, true],
                    ["Offline download", true, true, true],
                    ["ใบประกาศ PDF", false, true, true],
                    ["Live Session", false, true, true],
                    ["Discord exclusive", false, true, true],
                    ["1:1 Mentoring", false, false, true],
                  ].map(([feature, m, y, l]) => (
                    <tr key={feature as string} className="border-b border-line last:border-0">
                      <td className="py-3 text-ink-2 font-thai">{feature as string}</td>
                      {[m, y, l].map((v, i) => (
                        <td key={i} className="py-3 text-center">
                          {v ? (
                            <CheckCircle size={16} className="text-ok mx-auto" />
                          ) : (
                            <span className="text-ink-4 text-[18px] leading-none">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Container>
        </section>

        {/* FAQ */}
        <section className="py-16">
          <Container>
            <h2 className="font-display text-[32px] text-ink text-center mb-10 tracking-[-0.015em]">
              คำถามที่พบบ่อย
            </h2>
            <div className="max-w-[640px] mx-auto flex flex-col gap-4">
              {FAQ.map((item) => (
                <div key={item.q} className="bg-paper-3 border border-line rounded-r3 p-5">
                  <h3 className="font-semibold text-[15px] text-ink mb-2">{item.q}</h3>
                  <p className="text-[14px] text-ink-3 leading-[1.7] font-thai">{item.a}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className="text-[14px] text-ink-3 mb-4">ยังมีข้อสงสัย?</p>
              <a href="mailto:hello@verda.co.th">
                <Button variant="ghost">ติดต่อทีมงาน →</Button>
              </a>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
