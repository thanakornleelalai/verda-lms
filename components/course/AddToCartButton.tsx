"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { ShoppingCart, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart";

interface Props {
  slug: string;
  /** "outline" secondary look (default) or "solid" primary */
  variant?: "outline" | "solid";
  className?: string;
}

export function AddToCartButton({ slug, variant = "outline", className }: Props) {
  const { has, add } = useCart();
  const locale = useLocale();
  const router = useRouter();
  const inCart = has(slug);
  const [justAdded, setJustAdded] = useState(false);

  function handleClick() {
    if (inCart) {
      router.push(`/${locale}/cart`);
      return;
    }
    add(slug);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  }

  const base =
    "inline-flex items-center justify-center gap-2 rounded-pill font-thai font-medium px-[18px] py-[11px] text-[14px] border transition-all duration-200 btn-depth";

  return (
    <button
      onClick={handleClick}
      aria-label={inCart ? "ไปที่ตะกร้า" : "เพิ่มลงตะกร้า"}
      className={cn(
        base,
        inCart
          ? "bg-viridian-wash border-viridian/30 text-viridian"
          : variant === "solid"
            ? "bg-viridian border-transparent text-[#F5F0E1] hover:bg-viridian-2"
            : "bg-paper-3 border-line text-ink hover:border-viridian hover:text-viridian",
        className
      )}
    >
      {justAdded ? (
        <><Check size={16} /> เพิ่มแล้ว!</>
      ) : inCart ? (
        <><ShoppingCart size={16} /> ดูในตะกร้า</>
      ) : (
        <><ShoppingCart size={16} /> เพิ่มลงตะกร้า</>
      )}
    </button>
  );
}
