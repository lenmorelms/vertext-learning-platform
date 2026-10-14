import { z } from "zod";

import { findLessonIds } from "@/lib/search/agent";
import {
  QUERY_MAX_LENGTH,
  QUERY_MIN_LENGTH,
  type SearchEvent,
} from "@/lib/search/types";
import { getSearchLessons } from "@/sanity/data";

const requestSchema = z.object({
  query: z.string().trim().min(QUERY_MIN_LENGTH).max(QUERY_MAX_LENGTH),
});

/**
 * Runs the search agent and streams NDJSON: status lines while it works, then
 * one results or error line. The browser never talks to the MCP or the LLM.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: `Enter a search between ${QUERY_MIN_LENGTH} and ${QUERY_MAX_LENGTH} characters.` },
      { status: 400 },
    );
  }
  const { query } = parsed.data;

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: SearchEvent) =>
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));

      send({ type: "status", stage: "searching" });
      try {
        const ids = await findLessonIds(query, {
          onToolCall: () => send({ type: "status", stage: "searching" }),
        });
        const results = await getSearchLessons(ids);
        const courseCount = new Set(results.map((result) => result.course.id)).size;
        send({ type: "results", results, courseCount });
      } catch (error) {
        console.error("[search] failed", error);
        send({ type: "error", message: "Search is unavailable right now. Please try again." });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
