"use client";

import { type ReactNode, useId, useState } from "react";
import { ChevronDownIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

/*
 * The "Module M of N" header and the outline under it. The outline starts
 * collapsed on mobile and open on desktop, from CSS alone, so server and client
 * render the same markup. The toggle flips whichever state the viewport shows.
 */
export function OutlineToggle({ label, children }: { label: string; children: ReactNode }) {
  const [toggled, setToggled] = useState(false);
  const id = useId();

  return (
    <>
      <button
        type="button"
        aria-controls={id}
        onClick={() => setToggled((value) => !value)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-body text-neutral-900 hover:bg-neutral-50/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-400 lg:text-body-lg"
      >
        {label}
        <ChevronDownIcon
          size={20}
          className={cn(
            "shrink-0 text-neutral-500 transition-transform",
            toggled ? "rotate-180 lg:rotate-0" : "lg:rotate-180",
          )}
        />
      </button>
      <div id={id} className={cn("border-t border-line", toggled ? "block lg:hidden" : "hidden lg:block")}>
        {children}
      </div>
    </>
  );
}
