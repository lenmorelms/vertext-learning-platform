# 13 — Search: video moment results

## Goal

Complete the search page in `design/vertex-search.png` by adding **video results** next to the existing lesson results. A video result is a lesson's video matched at an exact second: the agent matches the video's chapters first, then its transcript chunks, and the card's `Watch from mm:ss` opens `/lessons/<slug>?t=<seconds>`, where the embed starts at that second. Lesson results, the header, search field, sort, and footer already exist (prompt 11) and stay as they are, apart from the shared changes below.

## Skills and docs read

- `AGENTS.md` sections 2, 3, 5, 7, 8, 10, 11, 12, 13.
- create-agent-with-sanity-context (`SKILL.md`, `references/nextjs-agent.md`) — the existing route already follows it (cached initial context, read only tools, step cap).
- dial-your-context — Context `instructions` stay short deltas; `groqFilter` controls which types the agent sees.
- shape-your-agent — not needed. No conversational reply.
- `prompts/11-intelligent-search.md`, `prompts/12-video-ingestion.md`.
- Next.js docs: no new routing or caching patterns. Existing route handler and page are reused.

## Code and data inspected

- `app/api/search/route.ts`, `lib/search/{agent,prompt,types}.ts`: the model returns `lessonIds` only; `getSearchLessons()` hydrates cards from trusted GROQ.
- `components/search/*`: `SearchResults` (stream, sort, states), `LessonResultCard`, `SearchFooter`, `SearchForm`.
- `components/ui/badge.tsx` already has `variant="video"`. Icons exist: `PlayCircleIcon`, `PlayIcon`, `DocumentIcon`, `FolderIcon`, `ChevronRightIcon`.
- `lib/video.ts`: `parseStartSeconds` clamps `?t=` on the lesson page, `getEmbedUrl` passes `start`. Playback from a second already works.
- Live dataset: 120 lessons (all with a `thumbnail` image), **119 `video` documents** (58 with chapters, 119 with chunks). One lesson has no video document: `lesson.practical-web-security-sql-injection` (`AOXMDbc11AE`). It can still appear as a lesson result.
- Context document `vertex-search`: `groqFilter` is `_type in ["course","lesson","instructor","category"]`, so the agent cannot see `video` yet.
- `.env.example` (uncommitted change) contains a real `OPENAI_API_KEY`. It is not in git history. `.env.local` has its own copy.

## Decisions and assumptions

1. **The model picks, the server shows and verifies.** The structured output becomes an ordered list:
   `results: [{ kind: "lesson", lessonId } | { kind: "video", lessonId, videoId, startSeconds }]` (max 60).
   The server keeps the model's order and hydrates every field from Sanity. A video result is kept only if:
   - the lesson exists in a course,
   - the `video` document exists and its `url` equals the lesson's `videoUrl` (so a video is always tied to the lesson that uses it), and
   - `startSeconds` is exactly one of that video's chapter or chunk `startSeconds`.
   If the video checks fail, the result is downgraded to a lesson result (the lesson itself was still matched). Nothing the model writes as text is rendered.
2. **One card per lesson.** Duplicates are merged by `lessonId`, keeping the best ranked entry. A video entry wins over a lesson entry for the same lesson, because it is more specific.
3. **Agent rules (system prompt and Context instructions, AGENTS.md section 11):**
   - Search both ways and merge: lessons on `title`, `keyPoints`, `pt::text(notes)`; video moments on `chapters[].label` first, then `chunks[].text` only for videos with no matching chapter.
   - Join: a lesson's video is `*[_type == "video" && url == ^.videoUrl][0]`. Videos are an internal lookup and are never results on their own.
   - Only fetch the matching entries, for example `chapters[label match "fetch*"][0..2]{ startSeconds, label }` and `chunks[text match "fetch*"][0..2]{ startSeconds, text }`. Never project whole `chunks` or `chapters` arrays.
   - Pick one moment per video: the best matching chapter, else the earliest strong chunk match.
   - Same tokenised wildcard OR matching and specificity ranking as before. Never invent an id or a second.
   - `MAX_STEPS` goes from 8 to 12 to leave room for the extra queries. `maxOutputTokens` stays 4000.
4. **Context document.** `groqFilter` becomes `_type in ["course","lesson","instructor","category","video"]`. `instructions` gain three short deltas: the `videoUrl`↔`url` join, chapters before chunks, and "never project whole `chunks`/`chapters`; slice the matches". Re-imported with `--replace`.
5. **Result data.** `VideoResult` in `lib/search/types.ts`: lesson fields shared with `LessonResult` (id, title, slug, description, module/lesson numbers, module title, course) plus `thumbnail` (lesson image), `durationSeconds` (lesson duration) and `startSeconds`. `SEARCH_LESSONS_QUERY` adds `videoUrl`, `thumbnail`, `duration`. A new `SEARCH_VIDEOS_QUERY` loads `*[_type == "video" && _id in $ids]{ _id, url, "starts": chapters[].startSeconds, "chunkStarts": chunks[].startSeconds }` (numbers only, never text). `getSearchLessons` is renamed `getSearchResults(picks)`.
6. **Video card (reference rows 1–3 and 6).**
   - Left: the lesson thumbnail at 16:9 (same 352px panel width as lesson cards), rounded, with a centred white play button and a dark time pill bottom right. The pill shows the **clip length** (lesson duration, `m:ss` / `h:mm:ss`), per AGENTS.md section 11. (In the mock it happens to equal the watch time.)
   - Right: course icon + name, `VIDEO` badge top right, title, 2-line description, then `Lesson 5.1 · [folder] Data Fetching & Caching` on the left and `[play circle] Watch from 12:45 ›` on the right in primary.
   - The whole card links to `/lessons/<slug>?t=<startSeconds>`. A `formatTimestamp(seconds)` helper goes in `lib/format.ts`.
   - Skeleton: the loading state alternates video and lesson skeletons.
7. **Sort.** Unchanged options. Video and lesson results sort together (they share module and lesson numbers).
8. **Not built:** the completion check mark on lesson cards (no progress backend yet), PostHog `search performed` (PostHog not installed), course brand icons like the "N" or React logo (the course cover image is the icon, as in prompt 11).
9. **Housekeeping.** Blank `OPENAI_API_KEY=` in `.env.example` so the real key is never committed. The key stays in `.env.local`. You should still rotate it, since it sat in a tracked file's working copy.

## Files to touch

| File | Change |
| --- | --- |
| `lib/search/types.ts` | `VideoResult`, `SearchResult` union, shared base |
| `lib/search/agent.ts` | Output schema → `results[]` union, step cap 12, rename to `findSearchPicks` |
| `lib/search/prompt.ts` | Video moment rules |
| `sanity/queries.ts` | Extend `SEARCH_LESSONS_QUERY`, add `SEARCH_VIDEOS_QUERY` |
| `sanity/data.ts` | `getSearchResults(picks)` with verification, dedupe, downgrade |
| `sanity.types.ts` | Regenerated (`npm run typegen` in studio) |
| `app/api/search/route.ts` | Use the new agent output and hydrator |
| `components/search/video-result.tsx` | New. Video card and skeleton |
| `components/search/search-results.tsx` | Render by `kind`, mixed skeletons |
| `lib/format.ts` | `formatTimestamp` |
| `studio/scripts/context/agent-context.ndjson` | Filter adds `video`, new instructions |
| `.env.example` | Blank the OpenAI key |

## Requirements

- Video and lesson results in one ranked list, with the existing count, course count, and sort.
- Every second shown is a real chapter or chunk start of the lesson's own video. Every other field is stored lesson or course data.
- Desktop matches the reference rows. At 375px the thumbnail stacks above the text, with no horizontal scroll.
- No transcript text reaches the browser.

## Security considerations

- No new secrets or env vars. The read token, OpenAI key, and MCP URL stay server only.
- Model output is ids and integers, all re-checked on the server before anything renders. `startSeconds` is checked against the stored list, and the lesson page clamps `?t=` again.
- Adding `video` to the `groqFilter` exposes transcript text to the agent only (read only, server side). The prompt bounds projections so a whole transcript is never pulled into the context.
- Cost: the step cap rises to 12. `/api/search` is still public with no rate limit (open risk carried over from prompt 11).
- The real key is removed from `.env.example`.

## Acceptance criteria

1. "data fetching" returns a mix of `VIDEO` and `LESSON` cards, best first, with `Found N results across M courses`.
2. Each video card's `Watch from mm:ss` matches a chapter or chunk start in that lesson's video document (check in Vision), and clicking it opens the lesson with the video starting at that second.
3. A query that only appears in a transcript (for example a word spoken in a video but not in titles or notes) still returns a video result.
4. No lesson appears twice.
5. Sort reorders without a new request.
6. A fake pick (unit-level: a `startSeconds` not in the video, or a video whose URL differs from the lesson's) is downgraded to a lesson card, not shown with a fake time.
7. The `/api/search` response contains no transcript text.
8. No horizontal scroll at 375px.

## Checks to run

- Studio: `npx sanity dataset import scripts/context/agent-context.ndjson production --replace`, `npm run typegen`.
- Live MCP: `/initial-context` returns 200 and lists `video`.
- Web: `npx tsc --noEmit`, `npm run lint`, `npm run build`, then `npm run dev` and a live `POST /api/search` for "data fetching" and one transcript-only query, checking the NDJSON.

## Manual test steps

1. Restart `npm run dev` (the inline prompt and initial context are cached per process).
2. Open `http://localhost:3000/search?q=data+fetching`. Check the mix of video and lesson cards against the reference.
3. Click `Watch from …` on a video card. The lesson page opens and the video starts at that time.
4. In Studio Vision, run `*[_type=="video" && url == "<that lesson's videoUrl>"][0]{ chapters[]{startSeconds,label} }` and confirm the time is one of them (or a chunk start).
5. Change the sort, then go back to Most Relevant.
6. Search "zzqxv". The empty state and Browse all courses appear.
7. Resize to 375px. Video cards stack the thumbnail above the text.
