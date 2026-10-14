import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CourseContent } from "@/components/course/course-content";
import { LearningOutcomes } from "@/components/course/learning-outcomes";
import { ProgressCard } from "@/components/course/progress-card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { DecorativeBars } from "@/components/ui/decorative-bars";
import {
  ArrowRightIcon,
  BarChartIcon,
  BookmarkIcon,
  ClockIcon,
  DocumentIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { SiteHeader } from "@/components/ui/site-header";
import { capitalize, formatCompactCount, formatDuration } from "@/lib/format";
import { getCourseBySlug, getCourses } from "@/sanity/data";
import { urlFor } from "@/sanity/lib/image";

export async function generateStaticParams() {
  const courses = await getCourses();
  return courses.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/courses/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return {};
  return { title: `${course.title} · Vertex`, description: course.summary };
}

export default async function CoursePage({ params }: PageProps<"/courses/[slug]">) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const modules = course.modules ?? [];
  const firstLesson = modules.flatMap((courseModule) => courseModule.lessons ?? [])[0];
  const continueHref = firstLesson ? `/lessons/${firstLesson.slug}` : null;

  const meta = [
    { icon: <BarChartIcon size={18} />, label: capitalize(course.level) },
    { icon: <ClockIcon size={20} />, label: formatDuration(course.durationSeconds) },
    { icon: <DocumentIcon size={20} />, label: `${modules.length} modules` },
    ...(course.studentCount
      ? [{ icon: <UsersIcon size={20} />, label: `${formatCompactCount(course.studentCount)} students` }]
      : []),
  ];

  return (
    <div className="flex flex-1 flex-col bg-canvas bg-hatch">
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col border-x border-line bg-surface">
        <SiteHeader />
        <main className="relative flex flex-1 flex-col px-4 pt-8 pb-10 sm:px-8 lg:px-16 lg:pt-12 xl:px-20">
          <div className="absolute inset-x-0 bottom-0 opacity-60">
            <DecorativeBars className="h-32 lg:h-44" />
          </div>

          <div className="relative">
            <Breadcrumbs
              className="lg:[&_ol]:text-body-lg"
              items={[{ label: "All Courses", href: "/courses" }, { label: course.title }]}
            />

            <section className="mt-8 flex flex-col gap-8 lg:mt-14 lg:flex-row lg:items-start lg:gap-21">
              <div className="w-full max-w-[392px] shrink-0 overflow-hidden rounded-lg bg-neutral-900">
                {course.coverImage?.asset ? (
                  <Image
                    src={urlFor(course.coverImage).width(784).height(912).fit("crop").auto("format").url()}
                    alt={course.coverImage.alt ?? ""}
                    width={392}
                    height={456}
                    priority
                    className="aspect-[392/456] w-full object-cover"
                  />
                ) : (
                  <div aria-hidden="true" className="aspect-[392/456] w-full" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                {course.popular && (
                  <p className="inline-flex h-8 items-center rounded-sm border border-primary-200 bg-primary-100 px-3 text-small font-semibold tracking-[0.2em] text-primary-600 uppercase lg:h-9 lg:px-4">
                    Popular
                  </p>
                )}
                <h1 className="mt-6 font-display text-[40px] leading-[48px] font-normal tracking-tight text-neutral-900 sm:text-[52px] sm:leading-[60px] lg:mt-8 lg:text-[64px] lg:leading-[76px]">
                  {course.title}
                </h1>
                <p className="mt-5 max-w-[600px] text-body-lg leading-7 text-neutral-500 lg:mt-7 lg:text-heading-2 lg:leading-10 lg:font-normal">
                  {course.summary}
                </p>
                <ul className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-3 text-body text-neutral-500 lg:mt-10 lg:gap-x-11 lg:text-body-lg">
                  {meta.map((item) => (
                    <li key={item.label} className="inline-flex items-center gap-3 whitespace-nowrap">
                      <span className="text-neutral-700">{item.icon}</span>
                      {item.label}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap gap-4 lg:mt-10 lg:gap-6">
                  {continueHref && (
                    <Button href={continueHref} size="xl" icon={<ArrowRightIcon />} className="shadow-md">
                      Continue Learning
                    </Button>
                  )}
                  {/* Presentational only: bookmarks have no backend. */}
                  <Button variant="tertiary" size="xl">
                    <BookmarkIcon size={22} />
                    Bookmark
                  </Button>
                </div>
              </div>
            </section>

            {course.learningOutcomes && course.learningOutcomes.length > 0 && (
              <div className="mt-12 lg:mt-16">
                <LearningOutcomes outcomes={course.learningOutcomes} />
              </div>
            )}

            <div className="mt-12 lg:mt-14">
              <CourseContent modules={modules} durationSeconds={course.durationSeconds} />
            </div>
          </div>

          <ProgressCard
            continueHref={continueHref}
            className="sticky bottom-4 z-10 mt-10 lg:mt-12"
          />
        </main>
      </div>
    </div>
  );
}
