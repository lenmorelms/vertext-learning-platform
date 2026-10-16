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

/** A lesson's video matched at a chapter or transcript chunk start. */
export type VideoResult = ResultBase & {
  kind: "video";
  thumbnail: SanityImageSource | null;
  durationSeconds: number;
  startSeconds: number;
};

export type SearchResult = LessonResult | VideoResult;

/** What the agent picks. The server verifies and hydrates each one. */
export type SearchPick =
  | { kind: "lesson"; lessonId: string }
  | { kind: "video"; lessonId: string; videoId: string; startSeconds: number };

/** One line of the `/api/search` NDJSON stream. */
export type SearchEvent =
  | { type: "status"; stage: "searching" }
  | { type: "results"; results: SearchResult[]; courseCount: number }
  | { type: "error"; message: string };

export const QUERY_MIN_LENGTH = 2;
export const QUERY_MAX_LENGTH = 200;
