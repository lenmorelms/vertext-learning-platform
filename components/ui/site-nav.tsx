import Link from "next/link";
import { cn } from "@/lib/cn";
import { Logo } from "./logo";

type NavItem = { label: string; href: string; active?: boolean };
type Size = "md" | "lg";

const logoSizes: Record<Size, number> = { md: 28, lg: 36 };
const linkSizes: Record<Size, string> = { md: "text-body", lg: "text-body-lg" };

export function SiteNav({
  items,
  size = "md",
  className,
}: {
  items: NavItem[];
  size?: Size;
  className?: string;
}) {
  return (
    <nav
      aria-label="Main"
      className={cn("flex flex-wrap items-center gap-x-6 gap-y-4 sm:gap-x-16", className)}
    >
      <Link
        href="/"
        aria-label="Vertex home"
        className="rounded-xs focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-400"
      >
        <Logo size={logoSizes[size]} />
      </Link>
      <ul className="flex items-center gap-5 sm:gap-8">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "rounded-xs font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-400",
                linkSizes[size],
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
