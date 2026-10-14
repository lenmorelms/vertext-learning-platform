import Link from "next/link";
import { ChevronDownIcon } from "@/components/ui/icons";
import { formatDuration } from "@/lib/format";
import { ShowAllModules } from "./show-all-modules";

type OutlineLesson = { _id: string; title: string; slug: string; duration: number; freePreview: boolean | null };
type OutlineModule = {
  _key: string;
  title: string;
  summary: string | null;
  durationSeconds: number;
  lessons: OutlineLesson[] | null;
};

const VISIBLE_MODULES = 6;

function ModuleRow({ courseModule, number }: { courseModule: OutlineModule; number: number }) {
  return (
    <li>
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center gap-4 px-4 py-4 hover:bg-neutral-50/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-400 sm:gap-6 sm:px-6 lg:min-h-21 lg:px-6 [&::-webkit-details-marker]:hidden">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-line text-body-lg text-neutral-900 lg:size-13 lg:text-heading-3 lg:font-normal">
            {number}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-body-lg text-neutral-900 lg:text-heading-3 lg:font-normal">
              {courseModule.title}
            </span>
            {courseModule.summary && (
              <span className="mt-0.5 block text-body text-neutral-500 lg:text-body-lg">
                {courseModule.summary}
              </span>
            )}
          </span>
          <span className="shrink-0 text-body text-neutral-500 lg:text-body-lg">
            {formatDuration(courseModule.durationSeconds)}
          </span>
          <ChevronDownIcon
            size={22}
            className="shrink-0 text-neutral-700 transition-transform group-open:rotate-180 lg:ml-4"
          />
        </summary>
        <ul className="border-t border-line bg-neutral-50/40 py-2">
          {(courseModule.lessons ?? []).map((lesson, index) => (
            <li key={lesson._id}>
              <Link
                href={`/lessons/${lesson.slug}`}
                className="flex items-center gap-4 py-3 pr-4 pl-19 hover:bg-neutral-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-400 sm:pr-6 sm:pl-23 lg:pl-25"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-small text-neutral-500 lg:text-body">
                    Lesson {number}.{index + 1}
                  </span>
                  <span className="block text-body text-neutral-900 lg:text-body-lg">
                    {lesson.title}
                  </span>
                </span>
                {lesson.freePreview && (
                  <span className="shrink-0 text-small font-medium text-primary-500 lg:text-body">
                    Free preview
                  </span>
                )}
                <span className="shrink-0 text-body text-neutral-500 lg:text-body-lg">
                  {formatDuration(lesson.duration)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </details>
    </li>
  );
}

export function CourseContent({
  modules,
  durationSeconds,
}: {
  modules: OutlineModule[];
  durationSeconds: number;
}) {
  const rows = modules.map((courseModule, index) => (
    <ModuleRow key={courseModule._key} courseModule={courseModule} number={index + 1} />
  ));
  const hidden = rows.slice(VISIBLE_MODULES);

  return (
    <section aria-labelledby="course-content">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2
          id="course-content"
          className="font-display text-heading-1 font-normal text-neutral-900 lg:text-[28px] lg:leading-9"
        >
          Course Content
        </h2>
        <p className="flex items-center gap-3 text-body text-neutral-500 lg:text-body-lg">
          {modules.length} modules
          <span aria-hidden="true">•</span>
          {formatDuration(durationSeconds)}
        </p>
      </div>
      <div className="mt-6 lg:mt-8">
        <ShowAllModules
          visible={rows.slice(0, VISIBLE_MODULES)}
          hidden={hidden.length > 0 ? hidden : null}
          total={modules.length}
        />
      </div>
    </section>
  );
}
