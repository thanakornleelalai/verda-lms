import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center gap-6 text-center px-4">
      <div className="font-display text-[80px] text-viridian leading-none">404</div>
      <h1 className="font-semibold text-[24px] text-ink">ไม่พบหน้าที่คุณต้องการ</h1>
      <p className="text-[15px] text-ink-3 max-w-[340px]">
        หน้าที่คุณกำลังมองหาอาจถูกย้าย ลบ หรือไม่เคยมีอยู่
      </p>
      <Link
        href="/th"
        className="inline-flex items-center gap-2 bg-viridian text-[#F5F0E1] px-5 py-2.5 rounded-pill text-[14px] font-medium hover:bg-viridian-2 transition-colors"
      >
        กลับหน้าหลัก
      </Link>
    </div>
  );
}
