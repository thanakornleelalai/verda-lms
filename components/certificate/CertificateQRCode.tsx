interface Props {
  certId: string;
  size?: number;
  className?: string;
}

export function CertificateQRCode({ certId, size = 120, className = "" }: Props) {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const verifyUrl = `${base}/th/certificate/verify/${certId}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size * 2}x${size * 2}&data=${encodeURIComponent(verifyUrl)}&color=1A2320&bgcolor=F7F5EF&margin=8`;

  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={qrUrl}
        alt="QR Code สำหรับยืนยันใบประกาศ"
        width={size}
        height={size}
        className="rounded-r2 border border-line"
        style={{ imageRendering: "pixelated" }}
      />
      <p className="font-mono text-[9px] tracking-[0.08em] uppercase text-ink-4 text-center">
        สแกนยืนยัน
      </p>
    </div>
  );
}
