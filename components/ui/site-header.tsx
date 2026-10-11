import { BellIcon, UserIcon } from "./icons";
import { SiteNav } from "./site-nav";

type Section = "courses" | "my-learning";

export function SiteHeader({ active }: { active?: Section }) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-line px-4 py-4 sm:px-8 lg:h-28 lg:px-12 lg:py-0 xl:px-16">
      <SiteNav
        size="lg"
        className="min-w-0 flex-1"
        items={[
          { label: "Courses", href: "/courses", active: active === "courses" },
          { label: "My Learning", href: "/my-learning", active: active === "my-learning" },
        ]}
      />
      <div className="flex shrink-0 items-center gap-4 sm:gap-6">
        <button
          type="button"
          aria-label="Notifications"
          className="rounded-full p-1 text-neutral-900 hover:text-primary-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400"
        >
          <BellIcon size={26} />
        </button>
        {/* Placeholder until Clerk provides the signed in user. */}
        <span
          role="img"
          aria-label="Account"
          className="flex size-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 lg:size-14"
        >
          <UserIcon />
        </span>
      </div>
    </header>
  );
}
