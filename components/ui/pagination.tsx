import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

type PaginationProps = {
  page: number;
  pageCount: number;
  hrefFor: (page: number) => string;
  className?: string;
};

const cell =
  "inline-flex size-9 items-center justify-center rounded-sm text-body font-medium text-neutral-700";
const interactive =
  "hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400";

/* First, last, and the pages around the current one, with gaps marked by null. */
function pageList(page: number, pageCount: number) {
  const wanted = new Set([1, pageCount, page - 1, page, page + 1]);
  if (page <= 2) wanted.add(3);
  if (page >= pageCount - 1) wanted.add(pageCount - 2);

  const pages = [...wanted].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);
  const list: (number | null)[] = [];
  pages.forEach((p, index) => {
    if (index > 0 && p - pages[index - 1] > 1) list.push(null);
    list.push(p);
  });
  return list;
}

function Arrow({
  href,
  label,
  children,
}: {
  href: string | null;
  label: string;
  children: ReactNode;
}) {
  if (!href) {
    return (
      <span aria-hidden="true" className={cn(cell, "text-neutral-300")}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} aria-label={label} className={cn(cell, interactive)}>
      {children}
    </Link>
  );
}

export function Pagination({ page, pageCount, hrefFor, className }: PaginationProps) {
  return (
    <nav aria-label="Pagination" className={className}>
      <ul className="flex items-center gap-2">
        <li>
          <Arrow href={page > 1 ? hrefFor(page - 1) : null} label="Previous page">
            <ChevronLeftIcon size={18} />
          </Arrow>
        </li>
        {pageList(page, pageCount).map((p, index) =>
          p === null ? (
            <li key={`gap-${index}`} aria-hidden="true" className={cell}>
              …
            </li>
          ) : (
            <li key={p}>
              <Link
                href={hrefFor(p)}
                aria-label={`Page ${p}`}
                aria-current={p === page ? "page" : undefined}
                className={cn(
                  cell,
                  interactive,
                  p === page && "border border-primary-400 bg-white text-primary-500",
                )}
              >
                {p}
              </Link>
            </li>
          ),
        )}
        <li>
          <Arrow href={page < pageCount ? hrefFor(page + 1) : null} label="Next page">
            <ChevronRightIcon size={18} />
          </Arrow>
        </li>
      </ul>
    </nav>
  );
}
