import type { Metadata } from "next";
import { CourseGrid } from "@/components/course/course-grid";
import { DecorativeBars } from "@/components/ui/decorative-bars";
import { SiteHeader } from "@/components/ui/site-header";
import { getCourses } from "@/sanity/data";

export const metadata: Metadata = {
  title: "All Courses · Vertex",
  description: "Browse every Vertex course.",
};

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <div className="flex flex-1 flex-col bg-canvas bg-hatch">
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col border-x border-line bg-surface">
        <SiteHeader active="courses" />
        <main className="flex flex-1 flex-col">
          <section className="px-4 pt-12 pb-16 sm:px-8 lg:px-16 lg:pt-16 xl:px-20">
            <h1 className="font-display text-heading-1 font-medium text-neutral-900 lg:text-[32px] lg:leading-10">
              All Courses
            </h1>
            <p className="mt-2 text-body-lg text-neutral-500">
              {courses.length} {courses.length === 1 ? "course" : "courses"}
            </p>
            {courses.length > 0 ? (
              <CourseGrid courses={courses} className="mt-8" />
            ) : (
              <p className="mt-8 text-body-lg text-neutral-500">No courses yet.</p>
            )}
          </section>

          <DecorativeBars className="mt-auto h-40 lg:h-56" />
        </main>
      </div>
    </div>
  );
}
