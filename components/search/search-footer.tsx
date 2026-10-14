import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { ArrowRightIcon, SearchIcon } from "@/components/ui/icons";

/* "Can't find what you're looking for?" card that points to the full catalog. */
export function SearchFooter({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 rounded-lg border border-primary-100 bg-primary-100/40 p-5 sm:flex-row sm:items-center sm:gap-6 sm:px-8 sm:py-6",
        className,
      )}
    >
      <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-500">
        <SearchIcon size={28} />
      </span>
      <div className="flex-1">
        <p className="text-body-lg font-medium text-neutral-900">Can&rsquo;t find what you&rsquo;re looking for?</p>
        <p className="mt-1 text-body text-neutral-500">
          Try different keywords or browse our full course catalog.
        </p>
      </div>
      <Button
        href="/courses"
        variant="secondary"
        size="lg"
        icon={<ArrowRightIcon size={18} />}
        className="self-start sm:self-auto"
      >
        Browse all courses
      </Button>
    </div>
  );
}
