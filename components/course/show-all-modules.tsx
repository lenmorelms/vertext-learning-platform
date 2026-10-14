"use client";

import { type ReactNode, useState } from "react";
import { ChevronDownIcon } from "@/components/ui/icons";

/* Renders the module rows, holding back `hidden` until the learner asks for them. */
export function ShowAllModules({
  visible,
  hidden,
  total,
}: {
  visible: ReactNode;
  hidden: ReactNode;
  total: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasHidden = Boolean(hidden);

  return (
    <div className={hasHidden && !expanded ? "pb-7" : undefined}>
      <ol className="divide-y divide-line overflow-hidden rounded-md border border-line bg-white">
        {visible}
        {expanded && hidden}
      </ol>
      {hasHidden && !expanded && (
        <div className="-mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="inline-flex h-12 items-center gap-4 rounded-sm border border-line bg-white px-6 text-body-lg text-neutral-900 transition-colors hover:border-neutral-200 hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400 lg:h-14 lg:px-7 lg:text-heading-3 lg:font-normal"
          >
            Show all {total} modules
            <ChevronDownIcon size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
