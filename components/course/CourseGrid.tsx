import { cn } from "@/lib/utils";
import type { Course } from "@/types";
import { CourseCard } from "./CourseCard";

interface CourseGridProps {
  courses: Course[];
  columns?: 2 | 3 | 4;
  className?: string;
}

const colClass: Record<2 | 3 | 4, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
};

const badgeMap: Record<number, "hot" | "new" | "bestseller" | undefined> = {
  0: "bestseller",
  1: "hot",
  2: "new",
};

export function CourseGrid({ courses, columns = 4, className }: CourseGridProps) {
  return (
    <div className={cn("grid gap-[22px]", colClass[columns], className)}>
      {courses.map((course, i) => (
        <CourseCard
          key={course.id}
          course={course}
          showBadge={badgeMap[i]}
          index={i}
        />
      ))}
    </div>
  );
}
