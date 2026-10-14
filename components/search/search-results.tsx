"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type { SearchEvent, SearchResult } from "@/lib/search/types";
import { LessonResultCard, LessonResultSkeleton } from "./lesson-result";
import { SearchFooter } from "./search-footer";
import { SearchForm } from "./search-form";

type Sort = "relevance" | "course" | "order";

type State =
  | { status: "loading" }
  | { status: "done"; results: SearchResult[]; courseCount: number }
  | { status: "error"; message: string };

const sorts: { value: Sort; label: string }[] = [
  { value: "relevance", label: "Most Relevant" },
  { value: "course", label: "Course (A–Z)" },
  { value: "order", label: "Lesson order" },
];

function byLessonOrder(a: SearchResult, b: SearchResult) {
  return a.moduleNumber - b.moduleNumber || a.lessonNumber - b.lessonNumber;
}

function sortResults(results: SearchResult[], sort: Sort) {
  if (sort === "relevance") return results;
  return [...results].sort((a, b) =>
    sort === "course"
      ? a.course.title.localeCompare(b.course.title) || byLessonOrder(a, b)
      : byLessonOrder(a, b) || a.course.title.localeCompare(b.course.title),
  );
}

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

/** Reads the NDJSON stream from /api/search until a results or error line. */
async function runSearch(query: string, signal: AbortSignal): Promise<State> {
  const response = await fetch("/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
    signal,
  });
  if (!response.ok || !response.body) {
    const body = await response.json().catch(() => null);
    return { status: "error", message: body?.error ?? "Search is unavailable right now. Please try again." };
  }

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.trim()) continue;
      const event = JSON.parse(line) as SearchEvent;
      if (event.type === "results") {
        return { status: "done", results: event.results, courseCount: event.courseCount };
      }
      if (event.type === "error") return { status: "error", message: event.message };
    }
  }
  return { status: "error", message: "Search ended unexpectedly. Please try again." };
}

export function SearchResults({ query }: { query: string }) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [sort, setSort] = useState<Sort>("relevance");

  useEffect(() => {
    const controller = new AbortController();
    runSearch(query, controller.signal)
      .then(setState)
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        console.error(error);
        setState({ status: "error", message: "Search is unavailable right now. Please try again." });
      });
    return () => controller.abort();
  }, [query, attempt]);

  const sorted = useMemo(
    () => (state.status === "done" ? sortResults(state.results, sort) : []),
    [state, sort],
  );

  const summary =
    state.status === "loading"
      ? "Searching every course…"
      : state.status === "done"
        ? `Found ${plural(state.results.length, "result")} across ${plural(state.courseCount, "course")}`
        : "Something went wrong";

  return (
    <>
      <section className="flex flex-col items-center text-center">
        <p className="inline-flex h-7 items-center rounded-sm bg-primary-100 px-3 text-small font-semibold tracking-[0.12em] text-primary-600 uppercase">
          Search results
        </p>
        <h1 className="mt-5 font-display text-[36px] leading-[44px] font-medium tracking-tight text-neutral-900 sm:text-[44px] sm:leading-[54px] lg:text-[52px] lg:leading-[64px]">
          Results for <span className="text-primary-500">&ldquo;{query}&rdquo;</span>
        </h1>
        <p aria-live="polite" className="mt-3 text-body-lg text-neutral-500 lg:text-heading-3 lg:font-normal">
          {summary}
        </p>
        <SearchForm query={query} className="mt-8 w-full max-w-[936px]" />
      </section>

      <section aria-label="Results" className="mt-8 lg:mt-6">
        {state.status === "loading" && (
          <div aria-busy="true" className="flex flex-col gap-3">
            <span className="sr-only">Loading results</span>
            {Array.from({ length: 3 }, (_, index) => (
              <LessonResultSkeleton key={index} />
            ))}
          </div>
        )}

        {state.status === "error" && (
          <div className="flex flex-col items-center gap-4 rounded-lg border border-line bg-white px-5 py-12 text-center">
            <p className="text-body-lg text-neutral-700">{state.message}</p>
            <Button
              variant="tertiary"
              onClick={() => {
                setState({ status: "loading" });
                setAttempt((count) => count + 1);
              }}
            >
              Try again
            </Button>
          </div>
        )}

        {state.status === "done" && state.results.length === 0 && (
          <p className="rounded-lg border border-line bg-white px-5 py-12 text-center text-body-lg text-neutral-700">
            No results for &ldquo;{query}&rdquo;.
          </p>
        )}

        {state.status === "done" && state.results.length > 0 && (
          <>
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-heading-3 font-medium text-neutral-900">
                {plural(state.results.length, "result")}
              </h2>
              <label className="flex items-center">
                <span className="sr-only">Sort results</span>
                <Select
                  value={sort}
                  onChange={(event) => setSort(event.target.value as Sort)}
                  className="w-[180px] sm:w-[212px]"
                >
                  {sorts.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </label>
            </div>
            <ol className="mt-4 flex flex-col gap-3">
              {sorted.map((result) => (
                <li key={result.id}>
                  <LessonResultCard result={result} />
                </li>
              ))}
            </ol>
          </>
        )}

        {state.status !== "loading" && <SearchFooter className="mt-3" />}
      </section>
    </>
  );
}
