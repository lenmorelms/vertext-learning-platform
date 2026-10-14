import "server-only";

import { sanityFetch } from "./lib/fetch";
import {
  CATEGORIES_QUERY,
  COURSE_QUERY,
  COURSES_QUERY,
  FEATURED_COURSES_QUERY,
  INSTRUCTOR_QUERY,
  LESSON_QUERY,
  LESSON_SLUGS_QUERY,
  SEARCH_LESSONS_QUERY,
} from "./queries";
import type { LessonResult } from "@/lib/search/types";

/** Every course, for the catalog. */
export function getCourses() {
  return sanityFetch({
    query: COURSES_QUERY,
    tags: ["course", "lesson", "instructor", "category"],
  });
}

/** The three courses featured on the home page. */
export function getFeaturedCourses() {
  return sanityFetch({
    query: FEATURED_COURSES_QUERY,
    tags: ["course", "lesson"],
  });
}

/** One course with its module outline, or null when the slug matches nothing. */
export function getCourseBySlug(slug: string) {
  return sanityFetch({
    query: COURSE_QUERY,
    params: { slug },
    tags: ["course", "lesson", "instructor", "category"],
  });
}

/** One lesson with its parent course outline, or null when the slug matches nothing. */
export function getLessonBySlug(slug: string) {
  return sanityFetch({
    query: LESSON_QUERY,
    params: { slug },
    tags: ["lesson", "course", "instructor"],
  });
}

/** Every lesson slug, for prerendering lesson pages. */
export function getLessonSlugs() {
  return sanityFetch({ query: LESSON_SLUGS_QUERY, tags: ["lesson"] });
}

/** One instructor with their courses, or null when the slug matches nothing. */
export function getInstructorBySlug(slug: string) {
  return sanityFetch({
    query: INSTRUCTOR_QUERY,
    params: { slug },
    tags: ["instructor", "course", "lesson"],
  });
}

/**
 * Search result cards for the given lesson ids, in the same order. Ids that are
 * not lessons in a course are dropped, so a card is always backed by real data.
 */
export async function getSearchLessons(ids: string[]): Promise<LessonResult[]> {
  if (ids.length === 0) return [];
  const lessons = await sanityFetch({
    query: SEARCH_LESSONS_QUERY,
    params: { ids },
    tags: ["lesson", "course"],
  });
  const byId = new Map(lessons.map((lesson) => [lesson._id, lesson]));

  return ids.flatMap((id) => {
    const lesson = byId.get(id);
    if (!lesson?.course) return [];
    const position = getLessonPosition(lesson.course.modules, lesson._id);
    if (!position) return [];
    const { course } = lesson;

    return [
      {
        kind: "lesson" as const,
        id: lesson._id,
        title: lesson.title,
        slug: lesson.slug,
        description: lesson.summary,
        keyPoints: lesson.keyPoints ?? [],
        moduleNumber: position.moduleNumber,
        lessonNumber: position.lessonNumber,
        moduleTitle: course.modules?.[position.moduleNumber - 1]?.title ?? "",
        course: {
          id: course._id,
          title: course.title,
          slug: course.slug,
          coverImage: course.coverImage?.asset ? course.coverImage : null,
        },
      },
    ];
  });
}

export function getCategories() {
  return sanityFetch({ query: CATEGORIES_QUERY, tags: ["category"] });
}

type OutlineModule<Lesson> = { lessons: Lesson[] | null };

/**
 * Where a lesson sits in a course outline. Numbers are 1 based and derived from
 * order, so "Lesson 5.1" is `moduleNumber` 5 and `lessonNumber` 1. Previous and
 * next cross module boundaries. Returns null when the lesson is not in the outline.
 */
export function getLessonPosition<Lesson extends { _id: string }>(
  modules: OutlineModule<Lesson>[] | null | undefined,
  lessonId: string,
) {
  const ordered = (modules ?? []).flatMap((courseModule, moduleIndex) =>
    (courseModule.lessons ?? []).map((lesson, lessonIndex) => ({
      lesson,
      moduleNumber: moduleIndex + 1,
      lessonNumber: lessonIndex + 1,
    })),
  );
  const index = ordered.findIndex((entry) => entry.lesson._id === lessonId);
  if (index === -1) return null;

  return {
    moduleNumber: ordered[index].moduleNumber,
    lessonNumber: ordered[index].lessonNumber,
    moduleCount: (modules ?? []).length,
    previous: ordered[index - 1]?.lesson ?? null,
    next: ordered[index + 1]?.lesson ?? null,
  };
}
