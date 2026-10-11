import { cn } from "@/lib/cn";
import { CheckCircleIcon, LockIcon, PlayCircleIcon, ProgressRingIcon } from "./icons";

type StatusVariant = "in-progress" | "completed" | "now-playing" | "locked";

const labels: Record<StatusVariant, string> = {
  "in-progress": "In Progress",
  completed: "Completed",
  "now-playing": "Now Playing",
  locked: "Locked",
};

function StatusIcon({ variant }: { variant: StatusVariant }) {
  switch (variant) {
    case "in-progress":
      return <ProgressRingIcon size={20} className="text-primary-500" />;
    case "completed":
      return <CheckCircleIcon size={20} className="text-success-500" />;
    case "now-playing":
      return <PlayCircleIcon filled size={20} className="text-primary-500" />;
    case "locked":
      return <LockIcon size={20} className="text-neutral-700" />;
  }
}

export function Status({ variant, className }: { variant: StatusVariant; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-body text-neutral-700", className)}>
      <StatusIcon variant={variant} />
      {labels[variant]}
    </span>
  );
}
