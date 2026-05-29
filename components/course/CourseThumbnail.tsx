import { cn } from "@/lib/utils";
import Image from "next/image";

interface CourseThumbnailProps {
  title: string;
  monogram?: string;
  art?: string;
  thumbnail?: string;
  className?: string;
  aspectRatio?: "16/10" | "16/9";
  /** When true, inner content scales up on group-hover/card — used by CourseCard */
  zoom?: boolean;
}

export function CourseThumbnail({
  title,
  monogram,
  art,
  thumbnail,
  className,
  aspectRatio = "16/10",
  zoom = false,
}: CourseThumbnailProps) {
  const style = art ? { background: art } : undefined;

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-paper-2",
        aspectRatio === "16/10" ? "aspect-[16/10]" : "aspect-video",
        className
      )}
    >
      {/* Zoom wrapper — scales on group-hover/card when zoom=true */}
      <div
        className={cn(
          "absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
          zoom && "group-hover/card:scale-105"
        )}
        style={!thumbnail ? style : undefined}
      >
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={title}
            fill
            className="object-cover"
          />
        ) : (
          <>
            {/* Diagonal stripe texture */}
            <div
              className="absolute inset-0 opacity-[0.15]"
              style={{
                background:
                  "repeating-linear-gradient(135deg, rgba(255,255,255,0.15) 0 10px, transparent 10px 22px)",
              }}
            />
            {/* Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            {/* Monogram */}
            {monogram && (
              <span className="absolute inset-0 flex items-center justify-center font-display text-[56px] text-white/25 italic select-none">
                {monogram}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
