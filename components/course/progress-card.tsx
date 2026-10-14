import { Suspense } from "react";
import { Show } from "@clerk/nextjs";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "@/components/ui/icons";
import { ProgressBar } from "@/components/ui/progress-bar";

/* Signed-in learners only. Shows 0% until learner progress tracking is wired in. */
export function ProgressCard({
  continueHref,
  className,
}: {
  continueHref: string | null;
  className?: string;
}) {
  const percent = 0;

  return (
    <Suspense fallback={null}>
      <Show when="signed-in">
        <div
          className={cn(
            "flex flex-col gap-5 rounded-md border border-line bg-white/95 px-5 py-5 shadow-md backdrop-blur-sm sm:flex-row sm:items-center sm:gap-10 lg:px-8",
            className,
          )}
        >
          <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-12">
            <p className="shrink-0 text-body text-neutral-500 lg:text-body-lg">
              Your Progress
              <span className="mt-1 block text-body-lg text-neutral-900 lg:text-heading-3 lg:font-normal">
                {percent}% complete
              </span>
            </p>
            <ProgressBar value={percent} showLabel={false} className="w-full max-w-[392px]" />
          </div>
          {continueHref && (
            <Button href={continueHref} size="xl" icon={<ArrowRightIcon />} className="shadow-md">
              Continue Learning
            </Button>
          )}
        </div>
      </Show>
    </Suspense>
  );
}
