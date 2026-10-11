import Link from "next/link";
import { cn } from "@/lib/cn";
import { ChevronRightIcon } from "./icons";

type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-x-3 gap-y-1 text-body text-neutral-500">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label} className="inline-flex items-center gap-3">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className={cn(
                    "rounded-xs hover:text-neutral-900",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400",
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined}>{item.label}</span>
              )}
              {!isLast && <ChevronRightIcon size={16} />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
