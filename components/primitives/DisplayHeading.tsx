import { cn } from "@/lib/utils";

type HeadingLevel = "h1" | "h2" | "h3" | "h4";

interface DisplayHeadingProps {
  as?: HeadingLevel;
  children: React.ReactNode;
  className?: string;
}

const sizeClass: Record<HeadingLevel, string> = {
  h1: "text-[44px]",
  h2: "text-[38px]",
  h3: "text-[22px]",
  h4: "text-[17px]",
};

export function DisplayHeading({ as: Tag = "h2", children, className }: DisplayHeadingProps) {
  return (
    <Tag
      className={cn(
        "font-display font-normal tracking-[-0.015em] leading-[1.05] m-0",
        sizeClass[Tag],
        className
      )}
    >
      {children}
    </Tag>
  );
}
