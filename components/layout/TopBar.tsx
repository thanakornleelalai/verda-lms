"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Search, ShoppingCart, X, LogOut, LayoutDashboard, Clapperboard, ShieldCheck } from "lucide-react";
import { ThemeCustomizer } from "@/components/theme/ThemeCustomizer";
import { FontSizeControl } from "@/components/home/FontSizeControl";
import { useState, useRef, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/primitives/Avatar";
import { Button } from "@/components/primitives/Button";
import { Container } from "./Container";

export function TopBar() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [promoVisible, setPromoVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<{ slug: string; title: string; level: string }[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const user = session?.user;
  const role = (user as { role?: string } | undefined)?.role ?? "STUDENT";
  const loading = status === "loading";

  // Debounced suggestion fetch
  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setSuggestions([]); return; }
    try {
      const { MOCK_COURSES } = await import("@/mock/courses");
      const lower = q.toLowerCase();
      const results = MOCK_COURSES
        .filter((c) => c.title.toLowerCase().includes(lower) || c.description?.toLowerCase().includes(lower))
        .slice(0, 5)
        .map((c) => ({ slug: c.slug, title: c.title, level: c.level }));
      setSuggestions(results);
    } catch { setSuggestions([]); }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => fetchSuggestions(searchQuery), 250);
    return () => clearTimeout(id);
  }, [searchQuery, fetchSuggestions]);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSuggestionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ⌘K / Ctrl+K keyboard shortcut to focus search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
      if (e.key === "Escape") {
        setSuggestionsOpen(false);
        searchInputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = searchQuery.trim();
    setSuggestionsOpen(false);
    if (q) router.push(`/${locale}/search?q=${encodeURIComponent(q)}`);
  }

  function handleSuggestionClick(slug: string) {
    setSuggestionsOpen(false);
    setSearchQuery("");
    router.push(`/${locale}/courses/${slug}`);
  }

  async function handleLogout() {
    setMenuOpen(false);
    await signOut({ callbackUrl: `/${locale}` });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper">
      {/* Promo strip */}
      {promoVisible && (
        <div className="bg-viridian text-[#F5F0E1] text-[13px] font-thai px-8 py-[9px] flex items-center justify-between gap-3">
          <span>{t("promo.text")}</span>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href={`/${locale}/courses`}
              className="font-mono text-[11px] tracking-[0.1em] uppercase px-3 py-1 border border-[rgba(245,240,225,0.4)] rounded-pill hover:bg-white/10 transition-colors"
            >
              {t("promo.cta")}
            </Link>
            <button
              onClick={() => setPromoVisible(false)}
              className="opacity-70 hover:opacity-100"
              aria-label="Close"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Main nav */}
      <Container className="flex items-center gap-7 py-4">
        {/* Brand */}
        <Link href={`/${locale}`} className="flex items-baseline gap-2 shrink-0">
          <span className="font-display text-[28px] tracking-[-0.02em] text-ink">
            VERDA
          </span>
          <span className="w-[9px] h-[9px] rounded-full bg-viridian inline-block translate-y-[-2px]" />
          <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-ink-3 ml-0.5">
            LMS
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-[22px] text-[14px] text-ink-2">
          <Link href={`/${locale}/courses`} className="hover:text-viridian transition-colors">
            {t("nav.browse")}
          </Link>
          <Link href={`/${locale}/instructors`} className="hover:text-viridian transition-colors">
            {t("nav.instructors")}
          </Link>
          <Link href={`/${locale}/pricing`} className="hover:text-viridian transition-colors">
            {t("nav.pricing")}
          </Link>
        </nav>

        {/* Search form */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-[380px]">
          <form
            onSubmit={handleSearch}
            className="flex items-center bg-paper-3 border border-line rounded-pill px-4 py-2 gap-2.5"
          >
            <Search size={15} className="text-ink-3 shrink-0" />
            <input
              ref={searchInputRef}
              type="search"
              name="q"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSuggestionsOpen(true); }}
              onFocus={() => { if (suggestions.length > 0) setSuggestionsOpen(true); }}
              placeholder={t("nav.search")}
              className="flex-1 bg-transparent border-0 outline-none font-thai text-[14px] text-ink placeholder:text-ink-3"
            />
            <kbd className="font-mono text-[11px] text-ink-4 bg-paper-2 px-1.5 py-0.5 rounded-r2 border border-line">
              ⌘K
            </kbd>
          </form>

          {/* Suggestions dropdown */}
          {suggestionsOpen && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-paper border border-line rounded-r3 shadow-lg z-50 overflow-hidden">
              {suggestions.map((s) => (
                <button
                  key={s.slug}
                  onClick={() => handleSuggestionClick(s.slug)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-paper-2 transition-colors text-left"
                >
                  <Search size={13} className="text-ink-4 shrink-0" />
                  <span className="text-[14px] text-ink flex-1 truncate">{s.title}</span>
                  <span className="font-mono text-[10px] text-ink-4 shrink-0">{s.level}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          {/* Font size control */}
          <FontSizeControl />

          {/* Theme & color customizer */}
          <ThemeCustomizer />

          {/* Cart */}
          <Link
            href={`/${locale}/cart`}
            className="relative w-[38px] h-[38px] rounded-full inline-flex items-center justify-center text-ink-2 hover:bg-paper-2 transition-colors"
          >
            <ShoppingCart size={18} />
          </Link>

          {loading ? (
            <div className="w-[38px] h-[38px] rounded-full bg-paper-2 animate-pulse ml-2" />
          ) : user ? (
            <div className="relative ml-2">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="focus:outline-none focus:ring-2 focus:ring-viridian focus:ring-offset-2 rounded-full"
                aria-label="User menu"
              >
                <Avatar name={user.name ?? "?"} src={user.image ?? undefined} size="md" />
              </button>

              {menuOpen && (
                <>
                  {/* Backdrop */}
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  {/* Dropdown */}
                  <div className="absolute right-0 top-[calc(100%+8px)] z-20 bg-paper border border-line rounded-r3 shadow-lg w-[220px] py-1 overflow-hidden">
                    {/* User info header */}
                    <div className="px-4 py-2.5 border-b border-line">
                      <p className="text-[13px] font-medium text-ink truncate">{user.name}</p>
                      <p className="text-[11px] text-ink-3 truncate">{user.email}</p>
                      {role !== "STUDENT" && (
                        <span className="mt-1 inline-block font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-viridian/10 text-viridian">
                          {role === "ADMIN" || role === "SUPERADMIN" ? "Admin" : "Instructor"}
                        </span>
                      )}
                    </div>

                    {/* ADMIN / SUPERADMIN — Admin Panel only */}
                    {(role === "ADMIN" || role === "SUPERADMIN") && (
                      <Link
                        href={`/${locale}/admin`}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-[14px] text-ink hover:bg-paper-2 transition-colors"
                      >
                        <ShieldCheck size={15} className="text-viridian" />
                        Admin Panel
                      </Link>
                    )}

                    {/* INSTRUCTOR — Studio only (no student dashboard) */}
                    {role === "INSTRUCTOR" && (
                      <Link
                        href={`/${locale}/studio`}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-[14px] text-ink hover:bg-paper-2 transition-colors"
                      >
                        <Clapperboard size={15} className="text-amber-500" />
                        Instructor Studio
                      </Link>
                    )}

                    {/* STUDENT — Student dashboard only */}
                    {role === "STUDENT" && (
                      <Link
                        href={`/${locale}/dashboard`}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-[14px] text-ink hover:bg-paper-2 transition-colors"
                      >
                        <LayoutDashboard size={15} className="text-ink-3" />
                        แดชบอร์ด
                      </Link>
                    )}

                    <div className="border-t border-line my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[14px] text-danger hover:bg-paper-2 transition-colors"
                    >
                      <LogOut size={15} />
                      ออกจากระบบ
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Link href={`/${locale}/login`}>
                <Button variant="ghost" size="sm">
                  {t("nav.login")}
                </Button>
              </Link>
              <Link href={`/${locale}/login?tab=signup`}>
                <Button variant="primary" size="sm">
                  {t("nav.signup")}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </Container>
    </header>
  );
}
