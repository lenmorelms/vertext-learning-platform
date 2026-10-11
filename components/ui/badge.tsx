import { cn } from "@/lib/cn";

type BadgeVariant = "video" | "lesson" | "popular";

const variants: Record<BadgeVariant, string> = {
  video: "bg-primary-100 text-primary-600",
  lesson: "bg-accent-100 text-accent-600",
  popular: "bg-primary-100 text-primary-600",
};

const labels: Record<BadgeVariant, string> = {
  video: "Video",
  lesson: "Lesson",
  popular: "Popular",
};

export function Badge({ variant, className }: { variant: BadgeVariant; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-xs px-2 py-0.5 text-small font-semibold tracking-wider uppercase",
        variants[variant],
        className,
      )}
    >
      {labels[variant]}
    </span>
  );
}
