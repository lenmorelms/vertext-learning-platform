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
  SEARCH_MOMENTS_QUERY,
} from "./queries";
import { pickMoment, toTermParams } from "@/lib/search/moments";
import type { SearchPick, SearchResult } from "@/lib/search/types";

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
 * Search result cards for the agent's picks, in the same order. Every field is
 * loaded here, and nothing the model wrote is shown. Lessons not in a course are
 * dropped and each lesson appears once. For a video pick the server resolves the
 * second from the lesson's own video in two stages, the best matching chapter,
 * else the best matching transcript chunk. With no match it is a lesson result.
 */
export async function getSearchResults(
  picks: SearchPick[],
  terms: string[],
): Promise<SearchResult[]> {
  if (picks.length === 0) return [];

  // A video pick outranks a lesson pick for the same lesson: it is more specific.
  const byLesson = new Map<string, SearchPick>();
  for (const pick of picks) {
    const seen = byLesson.get(pick.lessonId);
    if (!seen || (seen.kind === "lesson" && pick.kind === "video")) byLesson.set(pick.lessonId, pick);
  }
  const lessonIds = [...byLesson.keys()];
  const videoLessonIds = lessonIds.filter((id) => byLesson.get(id)?.kind === "video");
  const termParams = toTermParams(terms);

  const [lessons, moments] = await Promise.all([
    sanityFetch({ query: SEARCH_LESSONS_QUERY, params: { ids: lessonIds }, tags: ["lesson", "course"] }),
    termParams && videoLessonIds.length > 0
      ? sanityFetch({
          query: SEARCH_MOMENTS_QUERY,
          params: { ids: videoLessonIds, ...termParams },
          tags: ["lesson", "video"],
        })
      : Promise.resolve([]),
  ]);
  const lessonById = new Map(lessons.map((lesson) => [lesson._id, lesson]));
  const momentByLesson = new Map(
    moments.map((entry) => [
      entry._id,
      entry.video ? pickMoment(entry.video.chapters ?? [], entry.video.chunks ?? [], terms) : null,
    ]),
  );

  return lessonIds.flatMap((id): SearchResult[] => {
    const lesson = lessonById.get(id);
    if (!lesson?.course) return [];
    const position = getLessonPosition(lesson.course.modules, lesson._id);
    if (!position) return [];
    const { course } = lesson;

    const base = {
      id: lesson._id,
      title: lesson.title,
      slug: lesson.slug,
      description: lesson.summary,
      moduleNumber: position.moduleNumber,
      lessonNumber: position.lessonNumber,
      moduleTitle: course.modules?.[position.moduleNumber - 1]?.title ?? "",
      course: {
        id: course._id,
        title: course.title,
        slug: course.slug,
        coverImage: course.coverImage?.asset ? course.coverImage : null,
      },
    };

    const moment = momentByLesson.get(id);
    if (moment) {
      return [
        {
          ...base,
          kind: "video",
          thumbnail: lesson.thumbnail?.asset ? lesson.thumbnail : null,
          durationSeconds: lesson.duration,
          startSeconds: moment.startSeconds,
          momentSource: moment.source,
        },
      ];
    }

    return [{ ...base, kind: "lesson", keyPoints: lesson.keyPoints ?? [] }];
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
