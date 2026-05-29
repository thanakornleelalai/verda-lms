import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { Avatar } from "@/components/primitives/Avatar";
import { formatNumber } from "@/lib/utils";

export const revalidate = 300;

const MOCK_LEADERS = [
  { rank: 1, name: "วีรวัฒน์ ใจดี", points: 8420, streak: 14, badge: "🏆" },
  { rank: 2, name: "สมหญิง มีใจ", points: 7890, streak: 10, badge: "🥈" },
  { rank: 3, name: "ธนพล สมใจ", points: 7340, streak: 7, badge: "🥉" },
  { rank: 4, name: "นภา สุขใส", points: 6210, streak: 5, badge: "" },
  { rank: 5, name: "กิตติ วงศ์ดี", points: 5890, streak: 3, badge: "" },
  { rank: 6, name: "พิมพ์ชนก ใหม่", points: 5340, streak: 2, badge: "" },
  { rank: 7, name: "อรอนงค์ สวยงาม", points: 4980, streak: 1, badge: "" },
  { rank: 8, name: "มานะ ทำดี", points: 4560, streak: 0, badge: "" },
];

const BADGES = [
  { slug: "first-lesson", name: "ก้าวแรก", icon: "👣", tier: "BRONZE", description: "เรียนบทเรียนแรก" },
  { slug: "streak-7", name: "นักสม่ำเสมอ", icon: "🔥", tier: "SILVER", description: "เรียน 7 วันติด" },
  { slug: "course-complete", name: "เรียนสำเร็จ", icon: "🎓", tier: "GOLD", description: "เรียนจบคอร์สแรก" },
  { slug: "top-10", name: "ท็อป 10", icon: "⭐", tier: "PLATINUM", description: "ติดอันดับ 10 อันดับแรก" },
];

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-paper">
      <TopBar />
      <main className="py-12">
        <Container>
          <EyebrowLabel className="mb-2">GAMIFICATION</EyebrowLabel>
          <h1 className="font-display text-[36px] text-ink tracking-[-0.015em] mb-8">กระดานอันดับ</h1>

          <div className="grid grid-cols-[1fr_320px] gap-8">
            {/* Leaderboard table */}
            <div>
              <div className="border border-line rounded-r3 overflow-hidden">
                <div className="bg-paper-2 px-5 py-3 border-b border-line grid grid-cols-[40px_1fr_100px_80px] gap-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3">#</p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3">นักเรียน</p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3 text-right">คะแนน</p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3 text-right">Streak</p>
                </div>
                {MOCK_LEADERS.map((user) => (
                  <div
                    key={user.rank}
                    className={`px-5 py-4 border-b border-line last:border-0 grid grid-cols-[40px_1fr_100px_80px] gap-3 items-center transition-colors hover:bg-paper-2 ${
                      user.rank <= 3 ? "bg-viridian-wash/50" : ""
                    }`}
                  >
                    <div className="font-mono text-[14px] font-bold text-ink-2">
                      {user.badge || `#${user.rank}`}
                    </div>
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} size="sm" />
                      <span className="font-medium text-[14px] text-ink">{user.name}</span>
                    </div>
                    <div className="text-right font-mono text-[14px] text-viridian font-semibold">
                      {formatNumber(user.points)}
                    </div>
                    <div className="text-right font-mono text-[13px] text-ink-3">
                      {user.streak > 0 ? `🔥 ${user.streak}` : "—"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Badges panel */}
            <div>
              <h2 className="font-semibold text-[16px] text-ink mb-4">Badges</h2>
              <div className="grid grid-cols-2 gap-3">
                {BADGES.map((badge) => (
                  <div
                    key={badge.slug}
                    className="bg-paper-3 border border-line rounded-r3 p-4 text-center hover:border-viridian-3 transition-colors"
                  >
                    <div className="text-[32px] mb-2">{badge.icon}</div>
                    <p className="font-semibold text-[13px] text-ink">{badge.name}</p>
                    <p className="text-[11px] text-ink-3 mt-1">{badge.description}</p>
                    <span className={`inline-block mt-2 font-mono text-[9px] px-2 py-0.5 rounded-pill uppercase tracking-wide ${
                      badge.tier === "PLATINUM" ? "bg-plum/10 text-plum"
                      : badge.tier === "GOLD" ? "bg-gold/10 text-gold"
                      : badge.tier === "SILVER" ? "bg-sage/20 text-ink-2"
                      : "bg-line text-ink-3"
                    }`}>
                      {badge.tier}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
