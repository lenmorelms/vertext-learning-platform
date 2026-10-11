import { cn } from "@/lib/cn";

export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={(size * 34) / 40}
      viewBox="0 0 40 34"
      aria-hidden="true"
      className={cn("text-primary-500", className)}
    >
      <path
        fill="currentColor"
        d="M2 2h17.4l-1.5 7.5H13L20 21l7-11.5h-7.1L21.4 2H38L20 32Z"
      />
    </svg>
  );
}

export function Logo({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 text-neutral-900", className)}>
      <LogoMark size={size} />
      <span
        className="font-sans font-semibold tracking-tight"
        style={{ fontSize: size * 0.75, lineHeight: 1 }}
      >
        Vertex
      </span>
    </span>
  );
}
