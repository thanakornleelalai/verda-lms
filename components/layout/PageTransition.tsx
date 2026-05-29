"use client";

import { usePathname } from "next/navigation";

/**
 * Re-triggers a fade-up entrance animation on every route change by keying
 * the wrapper on the current pathname. Respects prefers-reduced-motion via
 * the global guard in globals.css.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="anim-fade-up">
      {children}
    </div>
  );
}
