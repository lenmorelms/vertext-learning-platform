import Image from "next/image";
import type { SanityImageSource } from "@sanity/image-url";
import { CourseCard } from "@/components/ui/cards";
import { cn } from "@/lib/cn";
import { capitalize, formatDuration } from "@/lib/format";
import { urlFor } from "@/sanity/lib/image";

type GridCourse = {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  coverImage: (SanityImageSource & { asset: unknown }) | null;
  level: string;
  moduleCount: number | null;
  durationSeconds: number;
};

export function CourseGrid({ courses, className }: { courses: GridCourse[]; className?: string }) {
  return (
    <ul className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6", className)}>
      {courses.map((course) => (
        <li key={course._id} className="flex">
          <CourseCard
            layout="stacked"
            className="flex-1"
            href={`/courses/${course.slug}`}
            icon={
              course.coverImage?.asset ? (
                <Image
                  src={urlFor(course.coverImage).width(176).height(176).fit("crop").auto("format").url()}
                  alt=""
                  width={88}
                  height={88}
                  className="size-22 rounded-sm object-cover"
                />
              ) : (
                <span className="size-22 rounded-sm bg-neutral-100" />
              )
            }
            title={course.title}
            summary={course.summary}
            level={capitalize(course.level)}
            duration={formatDuration(course.durationSeconds)}
            moduleCount={course.moduleCount ?? 0}
          />
        </li>
      ))}
    </ul>
  );
}
