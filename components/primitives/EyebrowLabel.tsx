import { cn } from "@/lib/utils";

interface EyebrowLabelProps {
  children: React.ReactNode;
  className?: string;
  prefix?: boolean;
}

export function EyebrowLabel({ children, className, prefix = true }: EyebrowLabelProps) {
  return (
    <p
      className={cn(
        "font-mono text-[11px] tracking-[0.12em] uppercase text-ink-3",
        className
      )}
    >
      {prefix && <span className="mr-1">—</span>}
      {children}
    </p>
  );
}
