import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "ghost" | "quiet" | "dark";
type Size = "sm" | "default" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClass: Record<Variant, string> = {
  primary: "bg-viridian text-[#F5F0E1] hover:bg-viridian-2",
  ghost:   "bg-transparent text-ink border border-line hover:bg-paper-2 hover:border-ink-4",
  quiet:   "bg-paper-2 text-ink hover:bg-line-2",
  dark:    "bg-ink text-[#F5F0E1] hover:bg-ink-2",
};

const sizeClass: Record<Size, string> = {
  sm:      "px-[14px] py-[7px] text-[13px]",
  default: "px-[18px] py-[11px] text-[14px]",
  lg:      "px-[22px] py-[14px] text-[15px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "default", className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center gap-2 rounded-pill font-thai font-medium",
        "transition-all duration-150 ease-in whitespace-nowrap border border-transparent",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variantClass[variant],
        sizeClass[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
);
Button.displayName = "Button";
