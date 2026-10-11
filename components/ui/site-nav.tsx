import Link from "next/link";
import { cn } from "@/lib/cn";
import { Logo } from "./logo";

type NavItem = { label: string; href: string; active?: boolean };

export function SiteNav({ items, className }: { items: NavItem[]; className?: string }) {
  return (
    <nav aria-label="Main" className={cn("flex flex-wrap items-center gap-x-16 gap-y-4", className)}>
      <Link
        href="/"
        aria-label="Vertex home"
        className="rounded-xs focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-400"
      >
        <Logo size={28} />
      </Link>
      <ul className="flex items-center gap-8">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "rounded-xs text-body font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-400",
                item.active ? "text-primary-500" : "text-neutral-900 hover:text-primary-500",
              )}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
