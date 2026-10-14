import { PortableText, type PortableTextComponents } from "next-sanity";
import type { LESSON_QUERY_RESULT } from "@/sanity.types";

type Notes = NonNullable<NonNullable<LESSON_QUERY_RESULT>["notes"]>;

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="text-body leading-7 text-neutral-500 lg:text-body-lg lg:leading-8">{children}</p>,
    h2: ({ children }) => (
      <h2 className="pt-4 font-display text-heading-2 font-normal text-neutral-900 lg:text-[22px] lg:leading-8">
        {children}
      </h2>
    ),
    h3: ({ children }) => <h3 className="pt-2 text-body-lg font-medium text-neutral-900">{children}</h3>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-primary-300 pl-4 text-body text-neutral-700 italic lg:text-body-lg">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc space-y-2 pl-6 marker:text-primary-500">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal space-y-2 pl-6 marker:text-primary-500">{children}</ol>,
  },
  listItem: ({ children }) => <li className="pl-1 text-body leading-7 text-neutral-500 lg:text-body-lg">{children}</li>,
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-neutral-900">{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    code: ({ children }) => (
      <code className="rounded-xs bg-neutral-100 px-1.5 py-0.5 font-mono text-[0.9em] text-neutral-900">{children}</code>
    ),
    link: ({ children, value }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary-500 underline underline-offset-2 hover:text-primary-600"
      >
        {children}
      </a>
    ),
  },
};

/* The "Notes" tab: the lesson's written notes from Sanity. */
export function LessonNotes({ notes }: { notes: Notes | null }) {
  return (
    <div className="space-y-5 pt-8 sm:px-6 lg:pt-10">
      {notes && notes.length > 0 ? (
        <PortableText value={notes} components={components} />
      ) : (
        <p className="text-body text-neutral-500">This lesson has no notes yet.</p>
      )}
    </div>
  );
}
