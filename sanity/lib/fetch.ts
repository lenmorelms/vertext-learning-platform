import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import type { QueryParams } from "next-sanity";

import { client } from "./client";

/**
 * Cached read from Sanity. Tags name the document types a query depends on, so
 * a later webhook can revalidate them. Until then, edits appear within minutes.
 */
export async function sanityFetch<const Query extends string>({
  query,
  params = {},
  tags,
}: {
  query: Query;
  params?: QueryParams;
  tags: string[];
}) {
  "use cache";
  cacheLife("minutes");
  cacheTag(...tags);

  return client.fetch(query, params);
}
