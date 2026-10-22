# 14 — Two stage timestamp resolution and on site timestamped playback

## Goal

Make the "chapters first, then transcript" rule a guarantee instead of a request. Today the model picks the second for a video result and the server only checks that the second exists in the video (prompt 13). After this change the **server** picks the second, always in two stages: the best matching chapter, and only when no chapter matches, the best matching transcript chunk. The model only decides which lessons are relevant, their order, and whether each one is a video or a lesson result.

On the playback side, a result card already opens `/lessons/<slug>?t=<seconds>`. The embedded YouTube player now **starts playing** at that second (autoplay plus the provider's `start` param), so the learner lands on the moment instead of a paused poster. Playback stays on the site in the provider's own player.

## Skills and docs read

- `AGENTS.md` sections 2, 5, 7, 8, 9, 10, 11, 12, 13.
- create-agent-with-sanity-context (`SKILL.md`): cached initial context, read only tools. The route already follows it, and nothing changes there.
- dial-your-context: Context `instructions` stay short deltas. One rule changes (the model no longer returns seconds).
- shape-your-agent: not needed. There is no conversational reply.
- `prompts/12-video-ingestion.md`, `prompts/13-search-video-results.md`.
- Next.js docs: no new routing or caching patterns. The lesson page already reads `searchParams` inside `Suspense`.

## Code and data inspected

- `lib/search/agent.ts`: output is `results[]` of `{ kind, lessonId, videoId, startSeconds }`, with 12 steps and 4000 output tokens.
- `lib/search/prompt.ts`: the model is told to pick one moment per video, chapter first.
- `sanity/data.ts` `getSearchResults`: dedupes by lesson, then keeps a video pick only if `video.url === lesson.videoUrl` and `startSeconds` is in `chapterStarts ∪ chunkStarts`. It cannot tell whether a chunk was chosen while a chapter matched.
- `sanity/queries.ts`: `SEARCH_LESSONS_QUERY` and `SEARCH_VIDEOS_QUERY` (start seconds only).
- `lib/video.ts` `getEmbedUrl` (sets `start`), `parseStartSeconds` (clamps to the lesson duration). `components/lesson/lesson-video.tsx` remounts the iframe on `key={start}`.
- `components/search/video-result.tsx`: the card links to `?t=<startSeconds>`. No UI change is needed. `design/vertex-search.png` and `design/vertex-lesson.png` show no new elements.
- Live dataset: 119 `video` docs, 58 with chapters. Every lesson's `duration` matches its video's `durationSeconds` (0 mismatches), so clamping `?t=` to the lesson duration is correct. For `fetch*`, 2 videos match on chapter labels and 28 more match only in the transcript.

## Decisions and assumptions

1. **Who decides what.**
   - The model returns `{ results: [{ kind: "lesson" | "video", lessonId }], terms: string[] }`. `kind: "video"` means "this lesson's video covers the topic". The model no longer returns `videoId` or `startSeconds`.
   - The server resolves the moment for every `kind: "video"` result. If it finds none, the result becomes a lesson result. `kind: "lesson"` results stay lesson results, which keeps the reference's mix of cards.
2. **Match terms** (`lib/search/moments.ts`, pure, no I/O):
   - Query keywords, built on the server: lowercase, split on anything outside `[a-z0-9]`, drop a short stopword list (how, do, i, the, a, an, to, in, of, for, with, and, or, learn, about, what, is, use, using), and drop tokens under 2 characters.
   - Plus the model's `terms` (the stems it searched with, such as `auth` for "authentication"), cleaned the same way.
   - Deduped and capped at 8. Each term is matched as a prefix wildcard (`fetch*`). If no terms remain, there is no moment and the result is a lesson result.
3. **Two stage resolution.**
   - One GROQ query loads, per picked lesson, its video by `url == ^.videoUrl` and **only the matching entries**: `chapters[label match $t0 || … || label match $t7]{ startSeconds, label }` and `chunks[text match $t0 || … || text match $t7][0...40]{ startSeconds, text }`. GROQ `match` against an array of patterns means AND, so the OR is spelled out over 8 fixed parameter slots. Unused slots repeat `$t0`, so the query string stays static and TypeGen still types it. Terms are always parameters and never spliced into the query.
   - The server scores each entry by the number of distinct terms it contains, using the same token prefix rule as GROQ.
   - **Stage 1:** if any chapter scores at least 1, the highest scoring chapter wins, and the earliest wins a tie. **Stage 2:** only when no chapter matched, the same rule over the chunks. **None:** lesson result.
   - The result carries `momentSource: "chapter" | "transcript"`. It is in the NDJSON for testing and is not rendered.
4. **Transcript text never leaves the server.** Matched chunk text is read only inside `getSearchResults` to score. The response carries only `startSeconds` and `momentSource`. Each video is capped at 40 matched chunks, so a whole transcript is never loaded.
5. **Order and dedupe.** Results keep the model's order, with one card per lesson. A `video` entry still beats a `lesson` entry for the same lesson.
6. **Prompt changes.**
   - Inline system prompt: the model finds lessons both ways (title, keyPoints, and notes, plus video chapters, then the transcript), returns `kind` per lesson, and returns `terms`. It is told the server picks the second, so it must not try to choose one. The critical rules stay: the join, chapters before chunks, sliced projections only, wildcard OR, rank by specificity, and grounding.
   - Context document: the "Results are lessons, of two kinds" bullet drops `videoId, startSeconds`, and one delta is added: "The server picks the second; return kind and the terms you matched." The `groqFilter` is unchanged. It is re-imported with `--replace`.
   - `MAX_STEPS` stays at 12, and `maxOutputTokens` stays at 4000. Output is now smaller.
7. **Playback.**
   - `getEmbedUrl(video, start)` adds `autoplay=1` when `start > 0`. The `start` param is unchanged, and the iframe already allows `autoplay`.
   - If the browser blocks autoplay, YouTube shows its own play button, still cued to `start`. Nothing breaks.
   - With no `?t=`, the page behaves as it does today (no autoplay).
   - The existing remount on `key={start}` keeps seeking working when a new `?t=` arrives during client side navigation.
   - No custom player, no YouTube IFrame API, and no link out to YouTube.
8. **Not changed:** the card UI, sort, count, empty state, the lesson page layout, the ingestion pipeline, and the providers (still YouTube only, per AGENTS.md section 9).
9. **Removed:** `SEARCH_VIDEOS_QUERY` and the "second must be in the starts list" check. Both are replaced by server side resolution, which by construction only produces real chapter or chunk starts from the lesson's own video.

## Files to touch

| File | Change |
| --- | --- |
| `lib/search/moments.ts` | New. `buildMatchTerms(query, modelTerms)`, `toTermParams(terms)`, `pickMoment(chapters, chunks, terms)` |
| `lib/search/agent.ts` | Output schema `{ results: [{ kind, lessonId }], terms }`. `findSearchPicks` returns `{ picks, terms }` |
| `lib/search/types.ts` | `SearchPick` simplified. `VideoResult.momentSource` |
| `lib/search/prompt.ts` | Server picks the second, return `terms` |
| `sanity/queries.ts` | `SEARCH_LESSONS_QUERY` gains the matched `moment` projection (8 term slots). Remove `SEARCH_VIDEOS_QUERY` |
| `sanity/data.ts` | `getSearchResults(picks, terms)` runs the two stage resolution |
| `app/api/search/route.ts` | Build terms from the query and the model, then pass them on |
| `lib/video.ts` | `autoplay=1` when `start > 0` |
| `sanity.types.ts` | Regenerated (`npm run typegen` in `studio/`) |
| `studio/scripts/context/agent-context.ndjson` | Updated instructions |

## Requirements

- Every video result's second is a chapter start of the lesson's own video when any chapter matches the terms. Otherwise it is a transcript chunk start. Never anything else.
- A `kind: "video"` pick whose video has no match, no video document, or a URL that differs from the lesson's becomes a lesson card.
- No transcript or chapter text appears in the `/api/search` response.
- The query string is static. Search terms are always GROQ parameters.
- A deep link `?t=N` opens the lesson page with the embed playing from N, or cued at N if autoplay is blocked.

## Security considerations

- No new env vars or secrets. The read token, OpenAI key, and MCP URL stay server only.
- Model output is now ids, an enum, and short terms. Terms are cleaned to `[a-z0-9]`, capped in length (40) and count (8), and passed only as GROQ params, so there is no query injection.
- Server side transcript reads are bounded (40 matched chunks per video, at most 60 lessons).
- `?t=` is still validated as digits and clamped to the lesson duration before it reaches the embed URL.
- Autoplay uses the provider's own param in the existing sandbox-free YouTube iframe. No new origins.
- Open risk carried over: `/api/search` has no rate limit.

## Acceptance criteria

1. Searching "data fetching" returns video and lesson cards. Every video card with `momentSource: "chapter"` in the NDJSON has a second equal to a chapter start whose label contains `data*` or `fetch*`.
2. For a lesson whose video has a matching chapter, the second is never a chunk start (`momentSource` is `chapter`).
3. A transcript only query still returns video cards, with `momentSource: "transcript"`.
4. Unit check on `pickMoment`: matching chapters win over chunks, a higher term count wins, the earliest wins a tie, and with no match it returns null.
5. The `/api/search` response contains no `text` or `label` fields.
6. Clicking `Watch from m:ss` opens the lesson page and the video plays from that second. Without `?t=`, the video does not autoplay.
7. No lesson appears twice. Sort and the count are unchanged.

## Checks to run

- Studio: `npx sanity dataset import scripts/context/agent-context.ndjson production --replace`, then `npm run typegen`.
- Unit: a scratch Node script (outside the repo) that exercises `pickMoment` and `buildMatchTerms` with the cases in acceptance criterion 4.
- Live: the GROQ moment query against the dataset for "data fetching" lesson ids. `/initial-context` returns 200.
- Web: `npx tsc --noEmit`, `npm run lint`, `npm run build`, then `npm run dev` and a live `POST /api/search` for "data fetching" and one transcript only query, checking the NDJSON for `momentSource` and the absence of text.

## Manual test steps

1. Restart `npm run dev`. The inline prompt and initial context are cached per process.
2. Open `http://localhost:3000/search?q=data+fetching`. The cards look as before.
3. In DevTools, open Network, then `search`, then Response. Video results show `startSeconds` and `momentSource`, and there is no transcript text.
4. For one `chapter` result, run this in Studio Vision: `*[_type=="video" && url == *[_type=="lesson" && slug.current=="<slug>"][0].videoUrl][0].chapters`. Check that the second is a chapter whose label contains one of the words.
5. Click `Watch from …`. The lesson page opens and the video plays from that time. If the browser blocks autoplay, press play and it starts at that time.
6. Open the same lesson without `?t=`. The video is paused at the start.
7. Search a word that is only spoken in videos (for example "hydration"). The video cards show `momentSource: "transcript"`.
8. Search "zzqxv". The empty state appears.
