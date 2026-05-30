"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="th">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#FAF8F1", color: "#0E1612" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ textAlign: "center", maxWidth: 420 }}>
            <p style={{ fontSize: 13, letterSpacing: "0.15em", textTransform: "uppercase", color: "#0F5D4A", marginBottom: 12 }}>
              VERDA
            </p>
            <h1 style={{ fontSize: 28, fontWeight: 600, margin: "0 0 8px" }}>เกิดข้อผิดพลาด</h1>
            <p style={{ fontSize: 14, color: "#5C6863", margin: "0 0 24px", lineHeight: 1.7 }}>
              ระบบพบปัญหาที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง
            </p>
            <button
              onClick={reset}
              style={{ padding: "11px 22px", background: "#0F5D4A", color: "#F5F0E1", border: 0, borderRadius: 999, fontSize: 14, cursor: "pointer" }}
            >
              ลองใหม่อีกครั้ง
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
