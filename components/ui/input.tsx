import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type InputProps = ComponentProps<"input"> & {
  icon?: ReactNode;
  hint?: ReactNode;
};

export function Input({ icon, hint, className, ...props }: InputProps) {
  return (
    <label
      className={cn(
        "flex h-11 items-center gap-3 rounded-md border border-neutral-200 bg-white px-4 transition-colors focus-within:border-primary-400",
        className,
      )}
    >
      {icon && <span className="shrink-0 text-neutral-700">{icon}</span>}
      <input
        className="min-w-0 flex-1 bg-transparent text-body text-neutral-900 outline-none placeholder:text-neutral-500"
        {...props}
      />
      {hint && (
        <kbd className="shrink-0 rounded-sm border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-sans text-small font-medium text-neutral-700">
          {hint}
        </kbd>
      )}
    </label>
  );
}
