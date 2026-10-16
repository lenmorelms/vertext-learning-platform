import Image from "next/image";
import Link from "next/link";
import type { SanityImageSource } from "@sanity/image-url";
import { Badge } from "@/components/ui/badge";
import { ChevronRightIcon, DocumentIcon, ExternalLinkIcon } from "@/components/ui/icons";
import type { LessonResult } from "@/lib/search/types";
import { urlFor } from "@/sanity/lib/image";

export function CourseIcon({ image, size }: { image: SanityImageSource | null; size: number }) {
  if (!image) return <DocumentIcon size={size} className="shrink-0 text-neutral-700" />;
  return (
    <Image
      src={urlFor(image).width(size * 2).height(size * 2).fit("crop").auto("format").url()}
      alt=""
      width={size}
      height={size}
      className="shrink-0 rounded-xs object-cover"
      style={{ width: size, height: size }}
    />
  );
}

export function LessonResultCard({ result }: { result: LessonResult }) {
  return (
    <Link
      href={`/lessons/${result.slug}`}
      aria-label={`${result.title}, ${result.course.title}, Module ${result.moduleNumber}. View lesson`}
      className="group flex flex-col gap-5 rounded-lg border border-line bg-white p-4 transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400 sm:p-5 md:flex-row md:gap-10"
    >
      <div className="flex gap-5 rounded-md border border-line bg-neutral-50 p-5 md:min-h-[160px] md:w-[352px] md:shrink-0">
        <CourseIcon image={result.course.coverImage} size={28} />
        {result.keyPoints.length > 0 && (
          <ul className="flex flex-col gap-2 pt-0.5 text-body text-neutral-700">
            {result.keyPoints.map((point) => (
              <li key={point} className="flex gap-2.5">
                <span aria-hidden="true">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-4">
          <p className="flex min-w-0 items-center gap-3 text-body text-neutral-700">
            <CourseIcon image={result.course.coverImage} size={28} />
            <span className="truncate">{result.course.title}</span>
          </p>
          <Badge variant="lesson" className="shrink-0 px-2.5 py-1" />
        </div>
        <h2 className="mt-2 text-xl leading-7 font-medium text-neutral-900 group-hover:text-primary-600">
          {result.title}
        </h2>
        <div className="mt-2 flex flex-1 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
          <div className="min-w-0 max-w-[480px]">
            {result.description && (
              <p className="line-clamp-2 text-body leading-[22px] text-neutral-500">
                {result.description}
              </p>
            )}
            <p className="mt-1.5 text-body text-neutral-500">Module {result.moduleNumber}</p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-4 pb-6 text-body font-medium text-primary-500 group-hover:text-primary-600 max-sm:pb-0">
            View lesson
            <span className="inline-flex items-center gap-3">
              <ExternalLinkIcon size={18} />
              <ChevronRightIcon size={18} />
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

export function LessonResultSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex animate-pulse flex-col gap-5 rounded-lg border border-line bg-white p-4 sm:p-5 md:flex-row md:gap-10"
    >
      <div className="h-[120px] rounded-md bg-neutral-100 md:h-[160px] md:w-[352px] md:shrink-0" />
      <div className="flex flex-1 flex-col gap-3 pt-1">
        <div className="h-5 w-40 rounded-xs bg-neutral-100" />
        <div className="h-6 w-2/3 rounded-xs bg-neutral-100" />
        <div className="h-4 w-full max-w-[480px] rounded-xs bg-neutral-100" />
        <div className="h-4 w-24 rounded-xs bg-neutral-100" />
      </div>
    </div>
  );
}
