import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";

export const metadata = {
  title: "ข้อกำหนดการใช้งาน | VERDA",
  description: "ข้อกำหนดและเงื่อนไขการใช้งานแพลตฟอร์ม VERDA LMS",
};

const SECTIONS = [
  {
    title: "1. การยอมรับข้อกำหนด",
    body: "การเข้าใช้งานแพลตฟอร์ม VERDA ถือว่าคุณยอมรับข้อกำหนดและเงื่อนไขเหล่านี้ทั้งหมด หากไม่ยอมรับ กรุณางดใช้บริการ",
  },
  {
    title: "2. บัญชีผู้ใช้",
    body: "คุณต้องให้ข้อมูลที่ถูกต้องในการสมัครสมาชิก และรับผิดชอบในการรักษาความลับของรหัสผ่าน คุณต้องมีอายุอย่างน้อย 13 ปี หรือได้รับความยินยอมจากผู้ปกครอง",
  },
  {
    title: "3. การใช้งานเนื้อหา",
    body: "เนื้อหาคอร์สทั้งหมดเป็นลิขสิทธิ์ของ VERDA และผู้สอน อนุญาตให้ใช้เพื่อการเรียนรู้ส่วนบุคคลเท่านั้น ห้ามคัดลอก แจกจ่าย หรือนำไปใช้เชิงพาณิชย์โดยไม่ได้รับอนุญาต",
  },
  {
    title: "4. การชำระเงินและการคืนเงิน",
    body: "ค่าสมาชิกชำระล่วงหน้าตามแผนที่เลือก สมาชิกรายเดือนยกเลิกได้ทุกเมื่อ สมาชิกรายปีขอคืนเงินได้ภายใน 7 วันแรก คอร์ส On-site คืนเงิน 80% หากยกเลิกก่อนเริ่มเรียน 7 วัน",
  },
  {
    title: "5. ความรับผิดชอบของผู้ใช้",
    body: "ห้ามใช้แพลตฟอร์มในทางที่ผิดกฎหมาย ห้ามโพสต์เนื้อหาที่ไม่เหมาะสมในฟอรัม และห้ามพยายามเข้าถึงระบบโดยไม่ได้รับอนุญาต VERDA สงวนสิทธิ์ระงับบัญชีที่ละเมิด",
  },
  {
    title: "6. ใบประกาศนียบัตร",
    body: "ใบประกาศนียบัตรออกให้เมื่อเรียนจบและผ่านเกณฑ์ที่กำหนด ใบประกาศแสดงการสำเร็จหลักสูตรบน VERDA และสามารถตรวจสอบความถูกต้องได้ผ่าน QR Code",
  },
  {
    title: "7. ข้อจำกัดความรับผิด",
    body: "VERDA ให้บริการ 'ตามสภาพที่เป็น' เราพยายามรักษาคุณภาพและความต่อเนื่องของบริการ แต่ไม่รับประกันผลลัพธ์ทางอาชีพหรือรายได้จากการเรียน",
  },
  {
    title: "8. การเปลี่ยนแปลงข้อกำหนด",
    body: "เราอาจปรับปรุงข้อกำหนดเป็นครั้งคราว การใช้งานต่อหลังการเปลี่ยนแปลงถือเป็นการยอมรับข้อกำหนดใหม่",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-paper">
      <TopBar />
      <main>
        <section className="py-14 border-b border-line">
          <Container className="max-w-[720px]">
            <EyebrowLabel className="mb-3">— TERMS OF SERVICE</EyebrowLabel>
            <h1 className="font-display text-[40px] text-ink tracking-[-0.02em] leading-[1.15] mb-3">
              ข้อกำหนดการใช้งาน
            </h1>
            <p className="text-[14px] text-ink-3 font-thai">มีผลบังคับใช้ตั้งแต่ 1 มกราคม 2569</p>
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
                มีคำถามเกี่ยวกับข้อกำหนด? ติดต่อ{" "}
                <a href="mailto:legal@verda.co.th" className="text-viridian hover:underline">legal@verda.co.th</a>
              </p>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
