import Link from "next/link";
import { CheckCircle2, XCircle, Mail } from "lucide-react";
import { verifyEmailToken } from "@/actions/auth";
import { Button } from "@/components/primitives/Button";

interface Props {
  params: Promise<{ token: string; locale: string }>;
  searchParams: Promise<{ email?: string }>;
}

export const dynamic = "force-dynamic";

export default async function VerifyEmailPage({ params, searchParams }: Props) {
  const { token, locale } = await params;
  const { email = "" } = await searchParams;

  const result = await verifyEmailToken(token, email);

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4">
      <div className="w-full max-w-[420px]">
        {/* Brand */}
        <Link href={`/${locale}`} className="flex items-baseline gap-2 mb-10 justify-center">
          <span className="font-display text-[32px] tracking-[-0.02em] text-ink">VERDA</span>
          <span className="w-[10px] h-[10px] rounded-full bg-viridian inline-block translate-y-[-2px]" />
        </Link>

        <div className="bg-paper-3 border border-line rounded-r4 p-[40px] text-center">
          {result.success ? (
            <>
              <div className="w-16 h-16 rounded-full bg-ok/10 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 size={32} className="text-ok" />
              </div>
              <h1 className="font-display text-[26px] text-ink mb-3">ยืนยันอีเมลสำเร็จ!</h1>
              <p className="text-[14px] text-ink-3 font-thai leading-[1.7] mb-6">
                {email && (
                  <>
                    อีเมล <span className="font-medium text-ink">{email}</span>
                    <br />
                  </>
                )}
                ได้รับการยืนยันเรียบร้อยแล้ว
              </p>
              <Link href={`/${locale}/dashboard`}>
                <Button variant="primary" className="w-full justify-center">
                  ไปที่ Dashboard
                </Button>
              </Link>
              <Link
                href={`/${locale}/login`}
                className="block mt-3 text-[13px] text-ink-3 hover:text-ink"
              >
                หรือเข้าสู่ระบบ
              </Link>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-5">
                <XCircle size={32} className="text-danger" />
              </div>
              <h1 className="font-display text-[26px] text-ink mb-3">ลิงก์ไม่ถูกต้อง</h1>
              <p className="text-[14px] text-ink-3 font-thai leading-[1.7] mb-2">
                {result.error ?? "ลิงก์ยืนยันอีเมลไม่ถูกต้องหรือหมดอายุแล้ว"}
              </p>
              <p className="text-[13px] text-ink-4 mb-6">
                ลิงก์มีอายุ 24 ชั่วโมงนับจากที่ขอ
              </p>
              <Link href={`/${locale}/dashboard/settings`}>
                <Button variant="primary" className="w-full justify-center gap-2">
                  <Mail size={15} />
                  ขอลิงก์ยืนยันใหม่
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
