import { cn, getInitials, nameToHue } from "@/lib/utils";
import Image from "next/image";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  name: string;
  src?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeClass: Record<AvatarSize, string> = {
  xs: "w-[22px] h-[22px] text-[11px]",
  sm: "w-[32px] h-[32px] text-[14px]",
  md: "w-[36px] h-[36px] text-[16px]",
  lg: "w-[48px] h-[48px] text-[20px]",
  xl: "w-[72px] h-[72px] text-[30px]",
};

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const hue = nameToHue(name);
  const bg = `hsl(${hue} 35% 32%)`;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full shrink-0 overflow-hidden",
        "font-display text-[#F5F0E1] select-none",
        sizeClass[size],
        className
      )}
      style={src ? undefined : { background: bg }}
      title={name}
    >
      {src ? (
        <Image src={src} alt={name} fill className="object-cover" />
      ) : (
        getInitials(name)
      )}
    </span>
  );
}
