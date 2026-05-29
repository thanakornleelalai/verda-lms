import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";

export const metadata = {
  title: "นโยบายความเป็นส่วนตัว | VERDA",
  description: "นโยบายความเป็นส่วนตัวของ VERDA LMS ตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)",
};

const SECTIONS = [
  {
    title: "1. ข้อมูลที่เราเก็บรวบรวม",
    body: "เราเก็บข้อมูลที่คุณให้โดยตรง เช่น ชื่อ อีเมล เบอร์โทรศัพท์ และข้อมูลการชำระเงิน รวมถึงข้อมูลการใช้งาน เช่น คอร์สที่เรียน ความคืบหน้า และคะแนนแบบทดสอบ เพื่อมอบประสบการณ์การเรียนที่ดีที่สุด",
  },
  {
    title: "2. วิธีที่เราใช้ข้อมูล",
    body: "เราใช้ข้อมูลของคุณเพื่อให้บริการแพลตฟอร์ม ออกใบประกาศนียบัตร ประมวลผลการชำระเงิน ส่งการแจ้งเตือนที่เกี่ยวข้อง และพัฒนาคุณภาพคอร์ส เราไม่ขายข้อมูลส่วนบุคคลของคุณให้บุคคลที่สาม",
  },
  {
    title: "3. การแบ่งปันข้อมูล",
    body: "เราอาจแบ่งปันข้อมูลกับผู้ให้บริการที่จำเป็น เช่น ระบบชำระเงิน (Stripe, Omise) ระบบวิดีโอ (Mux) และระบบอีเมล (Resend) โดยผู้ให้บริการเหล่านี้ผูกพันตามข้อตกลงการคุ้มครองข้อมูล",
  },
  {
    title: "4. สิทธิของเจ้าของข้อมูล (PDPA)",
    body: "ตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 คุณมีสิทธิเข้าถึง แก้ไข ลบ และขอโอนย้ายข้อมูลของคุณ รวมถึงสิทธิคัดค้านการประมวลผล ติดต่อเราได้ที่ privacy@verda.co.th",
  },
  {
    title: "5. การรักษาความปลอดภัย",
    body: "เราเข้ารหัสข้อมูลที่ละเอียดอ่อน (เช่น รหัสผ่านด้วย bcrypt) ใช้การเชื่อมต่อที่ปลอดภัย (HTTPS) และจำกัดการเข้าถึงข้อมูลเฉพาะเจ้าหน้าที่ที่จำเป็น",
  },
  {
    title: "6. คุกกี้",
    body: "เราใช้คุกกี้เพื่อจดจำการเข้าสู่ระบบ การตั้งค่าภาษา และวิเคราะห์การใช้งานเพื่อพัฒนาบริการ คุณสามารถจัดการคุกกี้ได้ผ่านการตั้งค่าเบราว์เซอร์",
  },
  {
    title: "7. การเปลี่ยนแปลงนโยบาย",
    body: "เราอาจปรับปรุงนโยบายนี้เป็นครั้งคราว การเปลี่ยนแปลงที่สำคัญจะแจ้งให้ทราบผ่านอีเมลหรือประกาศบนแพลตฟอร์ม",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-paper">
      <TopBar />
      <main>
        <section className="py-14 border-b border-line">
          <Container className="max-w-[720px]">
            <EyebrowLabel className="mb-3">— PRIVACY POLICY</EyebrowLabel>
            <h1 className="font-display text-[40px] text-ink tracking-[-0.02em] leading-[1.15] mb-3">
              นโยบายความเป็นส่วนตัว
            </h1>
            <p className="text-[14px] text-ink-3 font-thai">
              มีผลบังคับใช้ตั้งแต่ 1 มกราคม 2569 · สอดคล้องกับ พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)
            </p>
          </Container>
        </section>

        <section className="py-12">
          <Container className="max-w-[720px]">
            <div className="flex flex-col gap-8">
              {SECTIONS.map((s) => (
                <div key={s.title}>
                  <h2 className="font-semibold text-[18px] text-ink mb-2">{s.title}</h2>
                  <p className="text-[15px] text-ink-2 font-thai leading-[1.9]">{s.body}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 p-5 bg-paper-2 border border-line rounded-r3">
              <p className="text-[14px] text-ink-2 font-thai leading-[1.7]">
                มีคำถามเกี่ยวกับความเป็นส่วนตัว? ติดต่อเจ้าหน้าที่คุ้มครองข้อมูล (DPO) ได้ที่{" "}
                <a href="mailto:privacy@verda.co.th" className="text-viridian hover:underline">privacy@verda.co.th</a>
              </p>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
