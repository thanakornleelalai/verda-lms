import { cn } from "@/lib/utils";

type TagVariant = "default" | "hot" | "new" | "gold" | "ink";

interface TagProps {
  variant?: TagVariant;
  className?: string;
  children: React.ReactNode;
}

const variantClass: Record<TagVariant, string> = {
  default: "bg-paper-2 text-ink-2",
  hot:     "bg-clay text-white",
  new:     "bg-viridian text-[#F5F0E1]",
  gold:    "bg-gold text-white",
  ink:     "bg-ink text-[#F5F0E1]",
};

export function Tag({ variant = "default", className, children }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-[10px] py-1",
        "font-mono text-[10px] tracking-[0.08em] uppercase rounded-pill",
        variantClass[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
