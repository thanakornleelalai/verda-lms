"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "verda-cart";

interface CartContextValue {
  items: string[];                 // course slugs
  has: (slug: string) => boolean;
  add: (slug: string) => void;
  remove: (slug: string) => void;
  clear: () => void;
  count: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
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
  const add = useCallback((slug: string) => {
    setItems((prev) => (prev.includes(slug) ? prev : [...prev, slug]));
  }, []);
  const remove = useCallback((slug: string) => setItems((prev) => prev.filter((s) => s !== slug)), []);
  const clear = useCallback(() => setItems([]), []);

  return (
    <CartContext.Provider value={{ items, has, add, remove, clear, count: items.length }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    return { items: [], has: () => false, add: () => {}, remove: () => {}, clear: () => {}, count: 0 };
  }
  return ctx;
}
