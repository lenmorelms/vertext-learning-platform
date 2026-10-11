import { Suspense } from "react";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Button } from "./button";
import { BellIcon } from "./icons";
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
        <div className="flex min-h-10 items-center gap-2 sm:gap-3 lg:min-h-14">
          {/* Auth state is request data, so it streams in behind a same size fallback. */}
          <Suspense fallback={<span className="size-10 rounded-full bg-neutral-100 lg:size-14" />}>
            <Show when="signed-out">
              <SignInButton>
                <Button variant="tertiary">Sign in</Button>
              </SignInButton>
              <SignUpButton>
                <Button>Sign up</Button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <UserButton
                appearance={{ elements: { userButtonAvatarBox: "size-10! lg:size-14!" } }}
              />
            </Show>
          </Suspense>
        </div>
      </div>
    </header>
  );
}
