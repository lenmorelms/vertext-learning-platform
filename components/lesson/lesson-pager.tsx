import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/ui/icons";
import { formatDuration } from "@/lib/format";

type PagerLesson = { title: string; slug: string; duration: number } | null;

function Caption({ lesson, align }: { lesson: NonNullable<PagerLesson>; align: "left" | "right" }) {
  return (
    <p className={`hidden min-w-0 text-body text-neutral-500 sm:block ${align === "right" ? "text-right" : ""}`}>
      <span className="block truncate">{lesson.title}</span>
      <span className="mt-1 block">{formatDuration(lesson.duration)}</span>
    </p>
  );
}

/* Previous and next lesson, across module boundaries. */
export function LessonPager({ previous, next }: { previous: PagerLesson; next: PagerLesson }) {
  return (
    <nav
      aria-label="Lesson navigation"
      className="flex items-center justify-between gap-4 border-t border-line px-4 py-6 sm:px-8 lg:px-8 lg:py-7"
    >
      <div className="flex min-w-0 items-center gap-4 lg:gap-8">
        {previous && (
          <>
            <Button
              href={`/lessons/${previous.slug}`}
              variant="tertiary"
              size="lg"
              className="h-12 shrink-0 gap-2 px-4 sm:h-13 sm:gap-4 sm:px-6"
            >
              <ArrowLeftIcon size={18} />
              Previous Lesson
            </Button>
            <Caption lesson={previous} align="left" />
          </>
        )}
      </div>
      <div className="flex min-w-0 items-center gap-4 lg:gap-8">
        {next && (
          <>
            <Caption lesson={next} align="right" />
            <Button
              href={`/lessons/${next.slug}`}
              size="lg"
              icon={<ArrowRightIcon size={18} />}
              className="h-12 shrink-0 gap-2 px-4 sm:h-13 sm:gap-4 sm:px-6 shadow-md"
            >
              Next Lesson
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}
