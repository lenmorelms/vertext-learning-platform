import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Badge } from "./badge";
import {
  BarChartIcon,
  ClockIcon,
  DocumentIcon,
  ExternalLinkIcon,
  FolderIcon,
  PlayCircleIcon,
} from "./icons";

const card = "flex flex-col rounded-md border border-neutral-200 bg-white p-5";
const title = "text-body-lg font-medium text-neutral-900";
const description = "text-body text-neutral-500";
const meta = "text-small text-neutral-500";
const action =
  "inline-flex items-center gap-2 rounded-xs text-body font-medium text-primary-500 hover:text-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400";

function Dot() {
  return <span aria-hidden="true">·</span>;
}

type CourseCardProps = {
  href: string;
  icon: ReactNode;
  title: string;
  summary: string;
  level: string;
  duration: string;
  moduleCount: number;
  className?: string;
};

export function CourseCard({
  href,
  icon,
  title: courseTitle,
  summary,
  level,
  duration,
  moduleCount,
  className,
}: CourseCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        card,
        "gap-8 transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400",
        className,
      )}
    >
      <div className="flex gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-black text-white">
          {icon}
        </span>
        <div className="flex flex-col gap-2">
          <h3 className={title}>{courseTitle}</h3>
          <p className={description}>{summary}</p>
        </div>
      </div>
      <div className={cn(meta, "mt-auto flex flex-wrap items-center gap-x-6 gap-y-2")}>
        <span className="inline-flex items-center gap-2">
          <BarChartIcon size={16} />
          {level}
        </span>
        <span className="inline-flex items-center gap-2">
          <ClockIcon size={16} />
          {duration}
        </span>
        <span className="inline-flex items-center gap-2">
          <FolderIcon size={16} />
          {moduleCount} modules
        </span>
      </div>
    </Link>
  );
}

type LessonCardProps = {
  href: string;
  title: string;
  description: string;
  className?: string;
};

export function VideoLessonCard({
  href,
  title: lessonTitle,
  description: text,
  lessonLabel,
  length,
  watchFrom,
  className,
}: LessonCardProps & { lessonLabel: string; length: string; watchFrom: string }) {
  return (
    <article className={cn(card, "gap-3", className)}>
      <Badge variant="video" className="self-start" />
      <h3 className={title}>{lessonTitle}</h3>
      <p className={description}>{text}</p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
        <span className={cn(meta, "inline-flex items-center gap-2")}>
          {lessonLabel}
          <Dot />
          {length}
        </span>
        <Link href={href} className={action}>
          <PlayCircleIcon size={18} />
          Watch from {watchFrom}
        </Link>
      </div>
    </article>
  );
}

export function LessonCard({
  href,
  title: lessonTitle,
  description: text,
  moduleLabel,
  className,
}: LessonCardProps & { moduleLabel: string }) {
  return (
    <article className={cn(card, "gap-3", className)}>
      <Badge variant="lesson" className="self-start" />
      <h3 className={title}>{lessonTitle}</h3>
      <p className={description}>{text}</p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
        <span className={meta}>{moduleLabel}</span>
        <Link href={href} className={action}>
          View lesson
          <ExternalLinkIcon size={18} />
        </Link>
      </div>
    </article>
  );
}

type ResourceCardProps = {
  href: string;
  title: string;
  description: string;
  type: string;
  size?: string;
  className?: string;
};

export function ResourceCard({
  href,
  title: resourceTitle,
  description: text,
  type,
  size,
  className,
}: ResourceCardProps) {
  return (
    <article className={cn(card, "gap-8", className)}>
      <div className="flex gap-4">
        <DocumentIcon size={32} className="shrink-0 text-neutral-900" />
        <div className="flex flex-col gap-2">
          <h3 className={title}>{resourceTitle}</h3>
          <p className={meta}>{text}</p>
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between gap-2">
        <span className={cn(meta, "inline-flex items-center gap-2")}>
          {type}
          {size && (
            <>
              <Dot />
              {size}
            </>
          )}
        </span>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${resourceTitle}`}
          className={action}
        >
          <ExternalLinkIcon size={18} />
        </a>
      </div>
    </article>
  );
}
