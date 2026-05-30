"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/lib/wishlist";

interface Props {
  slug: string;
  /** "full" = pill button with label, "icon" = circular icon only */
  variant?: "full" | "icon";
  className?: string;
}

export function WishlistButton({ slug, variant = "full", className }: Props) {
  const { has, toggle } = useWishlist();
  const active = has(slug);

  if (variant === "icon") {
    return (
      <button
        onClick={() => toggle(slug)}
        aria-label={active ? "นำออกจากรายการที่ถูกใจ" : "บันทึกคอร์สที่ถูกใจ"}
        aria-pressed={active}
        className={cn(
          "w-11 h-11 rounded-full flex items-center justify-center border transition-all duration-200 hover:scale-105 active:scale-95",
          active ? "bg-red-50 border-red-200" : "bg-paper-3 border-line hover:border-red-200",
          className
        )}
      >
        <Heart size={18} className={active ? "fill-red-500 text-red-500" : "text-ink-3"} />
      </button>
    );
  }

  return (
    <button
      onClick={() => toggle(slug)}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-pill font-thai font-medium px-[18px] py-[11px] text-[14px] border transition-all duration-200 btn-depth",
        active
          ? "bg-red-50 border-red-200 text-red-600"
          : "bg-paper-3 border-line text-ink hover:border-red-200 hover:text-red-500",
        className
      )}
    >
      <Heart size={16} className={cn("transition-colors", active && "fill-red-500 text-red-500")} />
      {active ? "บันทึกแล้ว" : "บันทึกที่ถูกใจ"}
    </button>
  );
}
