import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type FieldSize = "md" | "tall" | "lg";

type InputProps = ComponentProps<"input"> & {
  icon?: ReactNode;
  hint?: ReactNode;
  fieldSize?: FieldSize;
};

const fields: Record<FieldSize, string> = {
  md: "h-11 gap-3 px-4",
  tall: "h-14 gap-4 px-5 shadow-sm sm:h-16 sm:px-6",
  lg: "h-16 gap-4 px-5 shadow-sm sm:h-24 sm:gap-5 sm:px-8",
};

const texts: Record<FieldSize, string> = {
  md: "text-body",
  tall: "text-body-lg",
  lg: "text-body-lg sm:text-heading-2 sm:font-normal",
};

const hints: Record<FieldSize, string> = {
  md: "px-1.5 py-0.5 text-small",
  tall: "hidden px-2.5 py-1 text-body sm:block",
  lg: "hidden text-body-lg sm:block sm:px-4 sm:py-3",
};

export function Input({ icon, hint, fieldSize = "md", className, ...props }: InputProps) {
  return (
    <label
      className={cn(
        "flex items-center rounded-md border border-neutral-200 bg-white transition-colors focus-within:border-primary-400",
        fields[fieldSize],
        className,
      )}
    >
      {icon && <span className="shrink-0 text-neutral-700">{icon}</span>}
      <input
        className={cn(
          "min-w-0 flex-1 bg-transparent text-neutral-900 outline-none placeholder:text-neutral-500",
          texts[fieldSize],
        )}
        {...props}
      />
      {hint && (
        <kbd
          className={cn(
            "shrink-0 rounded-sm border border-neutral-200 bg-neutral-50 font-sans font-medium text-neutral-700",
            hints[fieldSize],
          )}
        >
          {hint}
        </kbd>
      )}
    </label>
  );
}
