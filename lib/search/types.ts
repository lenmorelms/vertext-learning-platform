import type { SanityImageSource } from "@sanity/image-url";

/** A lesson matched on its own topic. Every field comes from stored Sanity data. */
export type LessonResult = {
  kind: "lesson";
  id: string;
  title: string;
  slug: string;
  description: string | null;
  keyPoints: string[];
  moduleNumber: number;
  lessonNumber: number;
  moduleTitle: string;
  course: {
    id: string;
    title: string;
    slug: string;
    coverImage: SanityImageSource | null;
  };
};

export type SearchResult = LessonResult;

/** One line of the `/api/search` NDJSON stream. */
export type SearchEvent =
  | { type: "status"; stage: "searching" }
  | { type: "results"; results: SearchResult[]; courseCount: number }
  | { type: "error"; message: string };

export const QUERY_MIN_LENGTH = 2;
export const QUERY_MAX_LENGTH = 200;
