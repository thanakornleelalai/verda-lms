import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Container } from "./Container";

export function Footer() {
  const t = useTranslations("footer");
  const locale = useLocale();

  return (
    <footer className="mt-20 bg-ink text-[#C9CDC8] pt-[60px] pb-[30px]">
      <Container>
        {/* Grid */}
        <div className="grid grid-cols-[1.4fr_repeat(4,1fr)] gap-10 mb-[60px]">
          {/* Brand col */}
          <div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="font-display text-[26px] text-white tracking-[-0.02em]">
                VERDA
              </span>
              <span className="w-[8px] h-[8px] rounded-full bg-viridian-3 inline-block translate-y-[-2px]" />
            </div>
            <p className="text-[13px] leading-relaxed max-w-[200px]">{t("tagline")}</p>
          </div>

          {/* Company */}
          <div>
            <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-[#6E756F] mb-[14px]">
              COMPANY
            </p>
            <ul className="flex flex-col gap-2">
              {[
                { key: "about", href: "/about" },
                { key: "blog", href: "/blog" },
                { key: "careers", href: "/careers" },
                { key: "press", href: "/press" },
              ].map(({ key, href }) => (
                <li key={key}>
                  <Link href={`/${locale}${href}`} className="text-[13px] hover:text-white transition-colors">
                    {t(key as "about" | "blog" | "careers" | "press")}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Teach */}
          <div>
            <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-[#6E756F] mb-[14px]">
              TEACH
            </p>
            <ul className="flex flex-col gap-2">
              {[
                { key: "instructors", href: "/studio" },
                { key: "affiliate", href: "/affiliate" },
              ].map(({ key, href }) => (
                <li key={key}>
                  <Link href={`/${locale}${href}`} className="text-[13px] hover:text-white transition-colors">
                    {t(key as "instructors" | "affiliate")}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Learn */}
          <div>
            <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-[#6E756F] mb-[14px]">
              LEARN
            </p>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href={`/${locale}/courses`} className="text-[13px] hover:text-white transition-colors">
                  {t("courses")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-[#6E756F] mb-[14px]">
              SUPPORT
            </p>
            <ul className="flex flex-col gap-2">
              {[
                { key: "help", href: "/help" },
                { key: "privacy", href: "/privacy" },
                { key: "terms", href: "/terms" },
              ].map(({ key, href }) => (
                <li key={key}>
                  <Link href={`/${locale}${href}`} className="text-[13px] hover:text-white transition-colors">
                    {t(key as "help" | "privacy" | "terms")}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-[22px] border-t border-[#2A332E] flex justify-between items-center font-mono text-[12px] text-[#6E756F]">
          <span>{t("copyright")}</span>
          <div className="flex items-center gap-4">
            <span>🇹🇭 ภาษาไทย</span>
            <span>฿ THB</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
