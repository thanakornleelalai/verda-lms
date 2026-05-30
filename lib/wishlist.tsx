"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "verda-wishlist";

interface WishlistContextValue {
  items: string[];                 // course slugs
  has: (slug: string) => boolean;
  toggle: (slug: string) => void;
  remove: (slug: string) => void;
  clear: () => void;
  count: number;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  // Persist on change (after hydration to avoid clobbering)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      // Notify other tabs/components
      window.dispatchEvent(new CustomEvent("verda-wishlist-change"));
    } catch { /* ignore */ }
  }, [items, hydrated]);

  // Sync across tabs
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY && e.newValue) {
        try { setItems(JSON.parse(e.newValue)); } catch { /* ignore */ }
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const has = useCallback((slug: string) => items.includes(slug), [items]);
  const toggle = useCallback((slug: string) => {
    setItems((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  }, []);
  const remove = useCallback((slug: string) => setItems((prev) => prev.filter((s) => s !== slug)), []);
  const clear = useCallback(() => setItems([]), []);

  return (
    <WishlistContext.Provider value={{ items, has, toggle, remove, clear, count: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    // Graceful fallback when used outside provider (SSR safety)
    return { items: [], has: () => false, toggle: () => {}, remove: () => {}, clear: () => {}, count: 0 };
  }
  return ctx;
}
