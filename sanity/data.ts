import "server-only";

import { sanityFetch } from "./lib/fetch";
import {
  CATEGORIES_QUERY,
  COURSE_QUERY,
  COURSES_QUERY,
  INSTRUCTOR_QUERY,
  LESSON_QUERY,
} from "./queries";

/** Every course, for the catalog. */
export function getCourses() {
  return sanityFetch({
    query: COURSES_QUERY,
    tags: ["course", "lesson", "instructor", "category"],
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

/** One instructor with their courses, or null when the slug matches nothing. */
export function getInstructorBySlug(slug: string) {
  return sanityFetch({
    query: INSTRUCTOR_QUERY,
    params: { slug },
    tags: ["instructor", "course", "lesson"],
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
