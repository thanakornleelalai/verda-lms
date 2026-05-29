import { Sparkles } from "lucide-react";

const TOPICS = [
  "UX/UI Design", "Next.js", "Figma", "Python", "Digital Marketing",
  "Motion Design", "Product Management", "TypeScript", "Branding",
  "Content Creation", "SEO", "Prompt Engineering", "DevOps", "Data Viz",
];

/**
 * Infinite horizontal ticker of trending topics — pure-CSS marquee.
 * The track is duplicated so the loop is seamless. Respects
 * prefers-reduced-motion via the global guard in globals.css.
 */
export function TrendingMarquee() {
  return (
    <div className="relative overflow-hidden border-b border-line bg-paper-2 py-3.5">
      {/* edge fade masks */}
      <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-paper-2 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-paper-2 to-transparent pointer-events-none" />

      <div className="flex w-max animate-marquee gap-3 will-change-transform">
        {[0, 1].map((dup) => (
          <div key={dup} className="flex gap-3 shrink-0" aria-hidden={dup === 1}>
            {TOPICS.map((topic) => (
              <span
                key={`${dup}-${topic}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill bg-paper-3 border border-line text-[13px] text-ink-2 font-thai whitespace-nowrap"
              >
                <Sparkles size={12} className="text-viridian shrink-0" />
                {topic}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
