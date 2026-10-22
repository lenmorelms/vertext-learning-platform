import type { SanityImageSource } from "@sanity/image-url";

/** Fields every result card shares. Every field comes from stored Sanity data. */
type ResultBase = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
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

/** A lesson matched on its own topic. */
export type LessonResult = ResultBase & {
  kind: "lesson";
  keyPoints: string[];
};

/** A lesson's video matched at a chapter start, or a transcript chunk start when no chapter matched. */
export type VideoResult = ResultBase & {
  kind: "video";
  thumbnail: SanityImageSource | null;
  durationSeconds: number;
  startSeconds: number;
  /** Which stage found the second. Not rendered. */
  momentSource: "chapter" | "transcript";
};

export type SearchResult = LessonResult | VideoResult;

/**
 * What the agent picks. "video" means the lesson's video covers the topic; the
 * server resolves the second itself and hydrates every field.
 */
export type SearchPick = { kind: "lesson" | "video"; lessonId: string };

/** One line of the `/api/search` NDJSON stream. */
export type SearchEvent =
  | { type: "status"; stage: "searching" }
  | { type: "results"; results: SearchResult[]; courseCount: number }
  | { type: "error"; message: string };

export const QUERY_MIN_LENGTH = 2;
export const QUERY_MAX_LENGTH = 200;
