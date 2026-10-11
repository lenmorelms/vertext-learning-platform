import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { ChevronDownIcon } from "./icons";

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <span className={cn("relative block", className)}>
      <select
        className="h-11 w-full appearance-none rounded-md border border-neutral-200 bg-white pr-11 pl-4 text-body font-medium text-neutral-900 outline-none transition-colors focus:border-primary-400"
        {...props}
      >
        {children}
      </select>
      <ChevronDownIcon
        size={20}
        className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-neutral-700"
      />
    </span>
  );
}
