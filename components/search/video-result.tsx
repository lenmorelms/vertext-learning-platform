import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRightIcon,
  DocumentIcon,
  FolderIcon,
  PlayCircleIcon,
  PlayIcon,
} from "@/components/ui/icons";
import { formatTimestamp } from "@/lib/format";
import type { VideoResult } from "@/lib/search/types";
import { urlFor } from "@/sanity/lib/image";
import { CourseIcon } from "./lesson-result";

export function VideoResultCard({ result }: { result: VideoResult }) {
  const watchFrom = formatTimestamp(result.startSeconds);
  const lessonLabel = `Lesson ${result.moduleNumber}.${result.lessonNumber}`;

  return (
    <Link
      href={`/lessons/${result.slug}?t=${result.startSeconds}`}
      aria-label={`${result.title}, ${result.course.title}, ${lessonLabel}. Watch from ${watchFrom}`}
      className="group flex flex-col gap-5 rounded-lg border border-line bg-white p-4 transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400 sm:p-5 md:flex-row md:gap-10"
    >
      <div className="relative aspect-video overflow-hidden rounded-md bg-neutral-900 md:aspect-auto md:h-[180px] md:w-[352px] md:shrink-0">
        {result.thumbnail && (
          <Image
            src={urlFor(result.thumbnail).width(704).height(360).fit("crop").auto("format").url()}
            alt=""
            fill
            sizes="(min-width: 768px) 352px, 100vw"
            className="object-cover"
          />
        )}
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-white text-neutral-900 shadow-md transition-transform group-hover:scale-105">
            <PlayIcon size={22} className="translate-x-px" />
          </span>
        </span>
        <span className="absolute right-3 bottom-3 rounded-sm bg-neutral-900/85 px-2 py-0.5 text-body font-medium text-white tabular-nums">
          {formatTimestamp(result.durationSeconds)}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-4">
          <p className="flex min-w-0 items-center gap-3 text-body text-neutral-700">
            <CourseIcon image={result.course.coverImage} size={28} />
            <span className="truncate">{result.course.title}</span>
          </p>
          <Badge variant="video" className="shrink-0 px-2.5 py-1" />
        </div>
        <h2 className="mt-2 text-xl leading-7 font-medium text-neutral-900 group-hover:text-primary-600">
          {result.title}
        </h2>
        {result.description && (
          <p className="mt-2 line-clamp-2 max-w-[480px] text-body leading-[22px] text-neutral-500">
            {result.description}
          </p>
        )}
        <div className="mt-auto flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <p className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1 text-body text-neutral-500">
            <span className="inline-flex items-center gap-2">
              <DocumentIcon size={18} className="shrink-0" />
              {lessonLabel}
            </span>
            {result.moduleTitle && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex min-w-0 items-center gap-2">
                  <FolderIcon size={18} className="shrink-0" />
                  <span className="truncate">{result.moduleTitle}</span>
                </span>
              </>
            )}
          </p>
          <span className="inline-flex shrink-0 items-center gap-2 text-body font-medium text-primary-500 group-hover:text-primary-600">
            <PlayCircleIcon size={20} />
            Watch from {watchFrom}
            <ChevronRightIcon size={18} className="ml-2" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function VideoResultSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex animate-pulse flex-col gap-5 rounded-lg border border-line bg-white p-4 sm:p-5 md:flex-row md:gap-10"
    >
      <div className="aspect-video rounded-md bg-neutral-100 md:aspect-auto md:h-[180px] md:w-[352px] md:shrink-0" />
      <div className="flex flex-1 flex-col gap-3 pt-1">
        <div className="h-5 w-40 rounded-xs bg-neutral-100" />
        <div className="h-6 w-2/3 rounded-xs bg-neutral-100" />
        <div className="h-4 w-full max-w-[480px] rounded-xs bg-neutral-100" />
        <div className="mt-auto h-4 w-56 rounded-xs bg-neutral-100" />
      </div>
    </div>
  );
}
