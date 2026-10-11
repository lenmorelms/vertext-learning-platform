import Image from "next/image";
import { SearchShortcut } from "@/components/home/search-shortcut";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/ui/cards";
import { ArrowRightIcon, SearchIcon, StarIcon } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { SiteHeader } from "@/components/ui/site-header";

const SEARCH_INPUT_ID = "home-search";

/* Placeholder content until the catalog is read from Sanity. */
const courses = [
  {
    slug: "nextjs-for-production",
    icon: "/course-icons/nextjs.svg",
    title: "Next.js for Production",
    summary: "Build scalable, high-performance web applications with Next.js.",
    level: "Intermediate",
    duration: "18h 24m",
    moduleCount: 12,
  },
  {
    slug: "docker-essentials",
    icon: "/course-icons/docker.svg",
    title: "Docker Essentials",
    summary: "Containerize applications and streamline your development workflow.",
    level: "Beginner",
    duration: "10h 12m",
    moduleCount: 8,
  },
  {
    slug: "typescript-deep-dive",
    icon: "/course-icons/typescript.svg",
    title: "TypeScript Deep Dive",
    summary: "Go beyond the basics and write safer, more expressive code.",
    level: "Intermediate",
    duration: "14h 36m",
    moduleCount: 10,
  },
];

/* Decorative bars: left offset, width, and height, each as a percentage. */
const bars = [
  [0, 7.3, 47],
  [7.3, 6.2, 66],
  [13.5, 4.1, 82],
  [17.6, 6.2, 100],
  [23.8, 9.3, 71],
  [33.1, 5.2, 53],
  [49.3, 2.6, 32],
  [51.9, 9.3, 47],
  [61.2, 7.8, 63],
  [69, 5.2, 82],
  [74.2, 6.5, 100],
  [80.7, 5.4, 53],
  [86.1, 3.6, 71],
  [89.7, 10.3, 90],
];

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col bg-canvas bg-hatch">
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col border-x border-line bg-surface">
        <SiteHeader />
        <main className="flex flex-1 flex-col">
          <section className="flex flex-col items-center border-b border-line px-4 py-12 text-center sm:px-8 lg:pt-20 lg:pb-16">
            <p className="inline-flex h-11 items-center rounded-sm border border-primary-200 bg-primary-100 px-5 text-small font-semibold tracking-[0.2em] text-primary-600 uppercase">
              Intelligent Learning
            </p>
            <h1 className="mt-8 font-display text-[40px] leading-[48px] font-medium tracking-tight text-neutral-900 sm:text-[56px] sm:leading-[68px] lg:mt-10 lg:text-[72px] lg:leading-[88px]">
              Search your learning <br className="hidden sm:block" />
              in plain English.
            </h1>
            <p className="mt-6 max-w-[560px] text-heading-3 font-normal text-balance text-neutral-500 lg:mt-8 lg:text-heading-2 lg:leading-10">
              Vertex understands what you want to learn and finds the exact lessons across all your
              courses.
            </p>
            <Button
              href="/courses"
              size="xl"
              icon={<ArrowRightIcon />}
              className="mt-10 shadow-md lg:mt-12"
            >
              Explore Courses
            </Button>
            <form action="/search" role="search" className="mt-10 w-full max-w-[896px] lg:mt-12 xl:max-w-[1112px]">
              <Input
                id={SEARCH_INPUT_ID}
                name="q"
                type="search"
                fieldSize="lg"
                aria-label="Search your learning"
                placeholder="Ask anything about your learning..."
                icon={<SearchIcon size={28} />}
                hint="⌘ K"
              />
            </form>
            <SearchShortcut targetId={SEARCH_INPUT_ID} />
          </section>

          <section
            aria-labelledby="all-courses"
            className="px-4 pt-12 sm:px-8 lg:px-16 lg:pt-16 xl:px-20"
          >
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <h2
                id="all-courses"
                className="font-display text-heading-1 font-medium text-neutral-900 lg:text-[32px] lg:leading-10"
              >
                All Courses
              </h2>
              <Button
                variant="text"
                size="lg"
                href="/courses"
                icon={<ArrowRightIcon size={20} />}
              >
                View all courses
              </Button>
            </div>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6">
              {courses.map((course) => (
                <li key={course.slug} className="flex">
                  <CourseCard
                    layout="stacked"
                    className="flex-1"
                    href={`/courses/${course.slug}`}
                    icon={<Image src={course.icon} alt="" width={88} height={88} />}
                    title={course.title}
                    summary={course.summary}
                    level={course.level}
                    duration={course.duration}
                    moduleCount={course.moduleCount}
                  />
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-16 flex items-center gap-4 px-4 sm:gap-8 sm:px-8 lg:mt-20 lg:px-16 xl:px-20">
            <span aria-hidden="true" className="h-px flex-1 bg-line" />
            <p className="flex items-center gap-4 text-body-lg text-neutral-700 lg:text-heading-3 lg:font-normal">
              <StarIcon className="shrink-0 text-primary-500" />
              New courses and lessons added every week.
            </p>
            <span aria-hidden="true" className="h-px flex-1 bg-line" />
          </div>

          <div aria-hidden="true" className="relative mt-auto h-40 overflow-hidden lg:h-56">
            {bars.map(([left, width, height]) => (
              <span
                key={left}
                className="absolute bottom-0 bg-linear-to-t from-primary-400/70 to-transparent"
                style={{ left: `${left}%`, width: `calc(${width}% + 1px)`, height: `${height}%` }}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
