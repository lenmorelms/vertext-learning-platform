import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LessonContent } from "@/components/lesson/lesson-content";
import { LessonNotes } from "@/components/lesson/lesson-notes";
import { LessonPager } from "@/components/lesson/lesson-pager";
import { LessonSidebar } from "@/components/lesson/lesson-sidebar";
import { LessonTabs } from "@/components/lesson/lesson-tabs";
import { LessonVideo, LessonVideoFrame } from "@/components/lesson/lesson-video";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { BarChartIcon, BookmarkIcon, ClockIcon, UsersIcon } from "@/components/ui/icons";
import { SiteHeader } from "@/components/ui/site-header";
import { capitalize, formatCount, formatDuration } from "@/lib/format";
import { getLessonBySlug, getLessonPosition, getLessonSlugs } from "@/sanity/data";

export async function generateStaticParams() {
  const slugs = await getLessonSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/lessons/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const lesson = await getLessonBySlug(slug);
  if (!lesson) return {};
  return {
    title: lesson.course ? `${lesson.title} · ${lesson.course.title} · Vertex` : `${lesson.title} · Vertex`,
    description: lesson.summary,
  };
}

export default async function LessonPage({ params, searchParams }: PageProps<"/lessons/[slug]">) {
  const { slug } = await params;
  const lesson = await getLessonBySlug(slug);
  if (!lesson?.course) notFound();
  const { course } = lesson;
  const position = getLessonPosition(course.modules, lesson._id);
  if (!position) notFound();

  const courseModule = course.modules?.[position.moduleNumber - 1];
  const courseHref = `/courses/${course.slug}`;

  const meta = [
    { icon: <ClockIcon size={18} />, label: formatDuration(lesson.duration) },
    { icon: <BarChartIcon size={16} />, label: capitalize(course.level) },
    ...(lesson.studentCount
      ? [{ icon: <UsersIcon size={18} />, label: `${formatCount(lesson.studentCount)} students` }]
      : []),
  ];

  return (
    <div className="flex flex-1 flex-col bg-canvas bg-hatch">
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col border-x border-line bg-surface">
        <SiteHeader />
        <div className="flex flex-1 flex-col lg:flex-row lg:pl-5">
          <aside className="lg:w-[360px] lg:shrink-0 xl:w-[376px]">
            <LessonSidebar
              course={course}
              currentLessonId={lesson._id}
              moduleNumber={position.moduleNumber}
            />
          </aside>

          <main className="min-w-0 flex-1 px-4 pt-8 pb-12 sm:px-8 lg:px-12 lg:pt-10 xl:px-12">
            <Breadcrumbs
              items={[
                { label: "All Courses", href: "/courses" },
                { label: course.title, href: courseHref },
                ...(courseModule ? [{ label: courseModule.title, href: courseHref }] : []),
                { label: lesson.title },
              ]}
            />

            <p className="mt-10 inline-flex h-7 items-center rounded-xs bg-primary-100 px-2.5 text-small font-semibold tracking-[0.12em] text-primary-600 uppercase lg:mt-12">
              Lesson {position.moduleNumber}.{position.lessonNumber}
            </p>

            <div className="mt-5 flex items-start justify-between gap-6">
              <h1 className="font-display text-[32px] leading-10 font-normal tracking-tight text-neutral-900 sm:text-[40px] sm:leading-[48px] lg:text-[48px] lg:leading-[58px]">
                {lesson.title}
              </h1>
              {/* Presentational only: bookmarks have no backend. */}
              <button
                type="button"
                aria-label="Bookmark lesson"
                className="flex size-12 shrink-0 items-center justify-center rounded-sm border border-neutral-200 bg-white text-primary-500 hover:border-neutral-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400 lg:size-13"
              >
                <BookmarkIcon size={22} />
              </button>
            </div>

            {lesson.summary && (
              <p className="mt-5 max-w-[640px] text-body-lg leading-8 text-neutral-500 lg:text-heading-3 lg:leading-9 lg:font-normal">
                {lesson.summary}
              </p>
            )}

            <ul className="mt-7 flex flex-wrap items-center gap-x-10 gap-y-3 text-body text-neutral-500">
              {meta.map((item) => (
                <li key={item.label} className="inline-flex items-center gap-3 whitespace-nowrap">
                  <span className="text-neutral-700">{item.icon}</span>
                  {item.label}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Suspense fallback={<LessonVideoFrame />}>
                <LessonVideo
                  videoUrl={lesson.videoUrl}
                  durationSeconds={lesson.duration}
                  title={lesson.title}
                  searchParams={searchParams}
                />
              </Suspense>
            </div>

            <div className="mt-10 lg:mt-12">
              <LessonTabs
                tabs={[
                  { label: "Lesson Content", content: <LessonContent lesson={lesson} /> },
                  { label: "Notes", content: <LessonNotes notes={lesson.notes} /> },
                ]}
              />
            </div>
          </main>
        </div>
        <LessonPager previous={position.previous} next={position.next} />
      </div>
    </div>
  );
}
