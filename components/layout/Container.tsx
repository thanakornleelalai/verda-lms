import { cn } from "@/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "main" | "header" | "footer" | "nav";
}

export function Container({ children, className, as: Tag = "div" }: ContainerProps) {
  return (
    <Tag className={cn("max-w-container mx-auto px-8", className)}>
      {children}
    </Tag>
  );
}
