import { CheckCircleIcon, DocumentIcon, ExternalLinkIcon, GithubIcon, LightbulbIcon } from "@/components/ui/icons";
import type { LESSON_QUERY_RESULT } from "@/sanity.types";

type Lesson = NonNullable<LESSON_QUERY_RESULT>;
type Resource = NonNullable<Lesson["resources"]>[number];

const heading = "font-display text-heading-2 font-normal text-neutral-900 lg:text-[22px] lg:leading-8";

function ResourceTile({ resource }: { resource: Resource }) {
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-4 rounded-sm border border-line bg-white p-5 transition-colors hover:border-neutral-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-xs border border-line text-neutral-700">
        {resource.type === "repository" ? <GithubIcon size={20} /> : <DocumentIcon size={18} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-body font-medium text-neutral-900">{resource.title}</span>
        {resource.description && (
          <span className="mt-2 block text-small leading-5 text-neutral-500">{resource.description}</span>
        )}
      </span>
      <ExternalLinkIcon
        size={16}
        className="mt-5 shrink-0 self-start text-neutral-500 group-hover:text-primary-500"
      />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

/* The "Lesson Content" tab: overview, key points, pro tip, and resources. */
export function LessonContent({ lesson }: { lesson: Lesson }) {
  const keyPoints = lesson.keyPoints ?? [];
  const resources = lesson.resources ?? [];

  return (
    <div className="pt-8 lg:pt-10">
      {lesson.summary && (
        <section className="border-b border-line pb-8 sm:px-6 lg:pb-10">
          <h2 className={heading}>Overview</h2>
          <p className="mt-5 max-w-[720px] text-body leading-7 text-neutral-500 lg:text-body-lg lg:leading-8">
            {lesson.summary}
          </p>
        </section>
      )}

      {keyPoints.length > 0 && (
        <section className="pt-8 sm:px-6 lg:pt-10">
          <h2 className="text-body-lg font-medium text-neutral-900">In this lesson you will:</h2>
          <ul className="mt-6 space-y-4">
            {keyPoints.map((point) => (
              <li key={point} className="flex items-start gap-4 text-body text-neutral-700 lg:text-body-lg">
                <CheckCircleIcon size={20} className="mt-0.5 shrink-0 text-primary-500" />
                {point}
              </li>
            ))}
          </ul>
        </section>
      )}

      {lesson.proTip && (
        <aside className="mt-8 flex gap-4 rounded-sm border border-primary-200/60 bg-primary-100/50 p-5 sm:mx-6 lg:mt-10 lg:p-6">
          <LightbulbIcon size={26} className="shrink-0 text-primary-500" />
          <div>
            <p className="font-display text-heading-3 font-normal text-neutral-900">Pro Tip</p>
            <p className="mt-2 text-body leading-6 text-neutral-500">{lesson.proTip}</p>
          </div>
        </aside>
      )}

      {resources.length > 0 && (
        <section className="mt-8 border-t border-line pt-8 sm:px-6 lg:mt-10 lg:pt-10">
          <h2 className={heading}>Resources</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {resources.map((resource) => (
              <li key={resource._key} className="flex">
                <ResourceTile resource={resource} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
