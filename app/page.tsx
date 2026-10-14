import { CourseGrid } from "@/components/course/course-grid";
import { SearchShortcut } from "@/components/home/search-shortcut";
import { Button } from "@/components/ui/button";
import { DecorativeBars } from "@/components/ui/decorative-bars";
import { ArrowRightIcon, SearchIcon, StarIcon } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { SiteHeader } from "@/components/ui/site-header";
import { getFeaturedCourses } from "@/sanity/data";

const SEARCH_INPUT_ID = "home-search";

export default async function HomePage() {
  const courses = await getFeaturedCourses();

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
            <CourseGrid courses={courses} className="mt-8" />
          </section>

          <div className="mt-16 flex items-center gap-4 px-4 sm:gap-8 sm:px-8 lg:mt-20 lg:px-16 xl:px-20">
            <span aria-hidden="true" className="h-px flex-1 bg-line" />
            <p className="flex items-center gap-4 text-body-lg text-neutral-700 lg:text-heading-3 lg:font-normal">
              <StarIcon className="shrink-0 text-primary-500" />
              New courses and lessons added every week.
            </p>
            <span aria-hidden="true" className="h-px flex-1 bg-line" />
          </div>

          <DecorativeBars className="mt-auto h-40 lg:h-56" />
        </main>
      </div>
    </div>
  );
}
