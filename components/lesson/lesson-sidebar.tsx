import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Show } from "@clerk/nextjs";
import { ArrowLeftIcon, ChevronDownIcon, PlayIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { formatDuration } from "@/lib/format";
import type { LESSON_QUERY_RESULT } from "@/sanity.types";
import { urlFor } from "@/sanity/lib/image";
import { OutlineToggle } from "./outline-toggle";

type Course = NonNullable<NonNullable<LESSON_QUERY_RESULT>["course"]>;
type OutlineModule = NonNullable<Course["modules"]>[number];

const focusRing =
  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-400";

function ModuleNumber({ number, current }: { number: number; current?: boolean }) {
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full text-body lg:size-10 lg:text-body-lg",
        current ? "bg-primary-500 text-white" : "border border-neutral-200 bg-white text-neutral-900",
      )}
    >
      {number}
    </span>
  );
}

function ModuleHeading({ courseModule }: { courseModule: OutlineModule }) {
  return (
    <span className="min-w-0 flex-1">
      <span className="block text-body text-neutral-900 lg:text-body-lg">{courseModule.title}</span>
      <span className="mt-1 block text-small text-neutral-500 lg:text-body">
        {formatDuration(courseModule.durationSeconds)}
      </span>
    </span>
  );
}

/* The lessons of one module, on a thin rail of dots under the module number. */
function LessonList({
  courseModule,
  currentLessonId,
}: {
  courseModule: OutlineModule;
  currentLessonId: string;
}) {
  return (
    <ol className="relative pb-4 before:absolute before:top-5 before:bottom-10 before:left-[41px] before:w-px before:bg-neutral-200 lg:before:left-[43px]">
      {(courseModule.lessons ?? []).map((lesson) => {
        const isCurrent = lesson._id === currentLessonId;
        return (
          <li key={lesson._id} className="relative">
            <span
              aria-hidden="true"
              className={cn(
                "absolute top-[18px] left-[38px] size-[7px] rounded-full lg:left-10",
                isCurrent ? "bg-primary-500" : "border border-neutral-300 bg-surface",
              )}
            />
            {isCurrent ? (
              <div aria-current="page" className="flex items-center gap-3 py-2 pr-6 pl-[76px] lg:pl-20">
                <span className="min-w-0 flex-1">
                  <span className="block text-body text-neutral-900">{lesson.title}</span>
                  <span className="mt-1 block text-body text-primary-500">Now playing</span>
                </span>
                <span
                  aria-hidden="true"
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white"
                >
                  <PlayIcon size={14} className="translate-x-px" />
                </span>
              </div>
            ) : (
              <Link
                href={`/lessons/${lesson.slug}`}
                className={cn(
                  "block py-2 pr-6 pl-[76px] text-body text-neutral-500 hover:text-neutral-900 lg:pl-20",
                  focusRing,
                )}
              >
                <span className="block">{lesson.title}</span>
                <span className="mt-1 block">{formatDuration(lesson.duration)}</span>
              </Link>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function LessonSidebar({
  course,
  currentLessonId,
  moduleNumber,
}: {
  course: Course;
  currentLessonId: string;
  moduleNumber: number;
}) {
  const modules = course.modules ?? [];
  // Learner progress is not tracked yet, so signed-in learners see 0%.
  const percent = 0;

  return (
    <nav aria-label="Course outline" className="border-b border-line bg-surface lg:border-x">
      <div className="px-6 pt-8 pb-6 lg:pt-10">
        <Link
          href={`/courses/${course.slug}`}
          className="inline-flex items-center gap-3 rounded-xs text-body text-primary-500 hover:text-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400 lg:text-body-lg"
        >
          <ArrowLeftIcon size={18} />
          Back to course
        </Link>

        <div className="mt-8 flex items-center gap-5 lg:mt-10">
          <div className="size-16 shrink-0 overflow-hidden rounded-xs bg-neutral-900 lg:size-18">
            {course.coverImage?.asset && (
              <Image
                src={urlFor(course.coverImage).width(144).height(144).fit("crop").auto("format").url()}
                alt=""
                width={72}
                height={72}
                className="size-full object-cover"
              />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-body-lg text-neutral-900">{course.title}</p>
            <Suspense fallback={null}>
              <Show when="signed-in">
                <p className="mt-2 text-body text-neutral-500">{percent}% complete</p>
                <div
                  role="progressbar"
                  aria-valuenow={percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Course progress"
                  className="mt-2 h-1 w-24 overflow-hidden rounded-full bg-neutral-200"
                >
                  <div className="h-full bg-primary-500" style={{ width: `${percent}%` }} />
                </div>
              </Show>
            </Suspense>
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <OutlineToggle label={`Module ${moduleNumber} of ${modules.length}`}>
          <ol className="divide-y divide-line">
            {modules.map((courseModule, index) => {
              const number = index + 1;
              if (number === moduleNumber) {
                return (
                  <li key={courseModule._key} className="bg-primary-100/30">
                    <div className="flex items-center gap-4 px-6 pt-5 pb-3">
                      <ModuleNumber number={number} current />
                      <ModuleHeading courseModule={courseModule} />
                      <ChevronDownIcon size={20} className="shrink-0 rotate-180 text-neutral-500" />
                    </div>
                    <LessonList courseModule={courseModule} currentLessonId={currentLessonId} />
                  </li>
                );
              }
              return (
                <li key={courseModule._key}>
                  <details className="group">
                    <summary
                      className={cn(
                        "flex cursor-pointer list-none items-center gap-4 px-6 py-5 hover:bg-neutral-50/60 [&::-webkit-details-marker]:hidden",
                        focusRing,
                      )}
                    >
                      <ModuleNumber number={number} />
                      <ModuleHeading courseModule={courseModule} />
                      <ChevronDownIcon
                        size={20}
                        className="shrink-0 text-neutral-500 transition-transform group-open:rotate-180"
                      />
                    </summary>
                    <LessonList courseModule={courseModule} currentLessonId={currentLessonId} />
                  </details>
                </li>
              );
            })}
          </ol>
        </OutlineToggle>
      </div>
    </nav>
  );
}
