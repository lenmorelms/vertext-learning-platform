# 12 — Video Ingestion Pipeline (transcripts and chapters)

## Goal

Build the offline tooling that creates one `video` document per unique lesson video URL. Each document holds the video's table of contents (`chapters[]` of `{ startSeconds, label }`) and its transcript split into short timestamped pieces (`chunks[]` of `{ startSeconds, text }`). This is the data the video-moment search results will use later. It never runs in the request path.

**Out of scope:** search changes (video result cards, the Context `groqFilter`, prompt rules for chapters and chunks). Those land in the video-results search task, so the agent does not see `video` documents before it has the rules for querying them safely.

## Skills and docs read

- `AGENTS.md` sections 2, 5, 7, 8, 9, 12, 13, 14.
- sanity-best-practices: `SKILL.md` (global rules, video), `references/schema.md` (`defineField`, `defineArrayMember`, array `_key`s). The skill's "let Sanity generate `_id`" rule is overridden by AGENTS.md section 9, which asks for an id derived from the video URL, so re-runs are idempotent.
- `prompts/11-intelligent-search.md` (current search scope, Context document, Studio deploy).
- Next.js docs: not needed. No web code changes.

## Code and environment inspected

- `studio/schemaTypes/documents/lesson.ts`: `videoUrl` (url, required) and `duration` (seconds). No `video` type exists.
- `studio/schemaTypes/index.ts`, `studio/structure.ts`: types registered by array, structure lists Courses, Lessons, Instructors, Categories.
- `studio/scripts/fix-resource-types.ts`: the existing script pattern. `npx sanity exec <file> --with-user-token`, `getCliClient`, `--dry-run`, a transaction, and a printed summary.
- `lib/video.ts` (web): `parseVideoUrl` supports YouTube only (`watch`, `youtu.be`, `embed`, `shorts`, `live`) and validates the 11 character id. Playback exists only for YouTube.
- Seed: 120 lessons, 120 unique videos, all `https://www.youtube.com/watch?v=<id>`.
- Tooling: Node 24. No `yt-dlp` or `ffmpeg` installed.
- **Live probe** (two seed videos):
  - The public caption URL from the watch page returns HTTP 200 with an empty body (YouTube now gates it behind a PoToken).
  - The innertube `youtubei/v1/player` endpoint with the `ANDROID` client returns caption tracks whose `fmt=json3` URL returns the full transcript (about 78 KB for a 6 minute video). The same response includes `videoDetails.shortDescription`, `title`, and `lengthSeconds`.
  - Both descriptions contain YouTube style chapter lines (`00:00 Introduction ...`).

## Decisions and assumptions

1. **Providers.** YouTube only, because it is the only provider with playback (AGENTS.md section 9) and all content uses it. The code dispatches by provider through one small `fetchVideoSource(parsed)` function, so Vimeo and Bunny can be added later with their own fetcher and embed. A lesson URL that does not parse as YouTube is skipped and listed in the summary.
2. **Caption source.** The innertube `player` endpoint with the `ANDROID` client, no API key. Track choice: manual English, then auto generated English (`asr`), then any `en-*` track. No English track means the document is still written with chapters and `chunks: []`, and is listed in the summary. This is an unofficial endpoint (see Needs your attention). The YouTube Data API cannot download captions for videos you do not own, and `yt-dlp` is not installed, so this is the dependency-free option that works today.
3. **Chapters, in priority order:**
   1. Authored: `studio/scripts/videos/chapters.json`, `{ "<youtubeId>": [{ "startSeconds": 0, "label": "..." }] }`. Committed, starts as `{}`.
   2. Description: lines like `00:00 Intro`, `(1:02:03) Label`, `0:45 - Label`. YouTube's own rules apply: the first chapter is at 0, there are at least 3, start times ascend strictly, and each falls inside the video's length. If any rule fails, no chapters come from the description.
   3. None: `chapters: []`. Search then falls back to transcript chunks.
   Labels are trimmed, leading separators (`-`, `–`, `—`, `:`, `|`) are removed, and labels are capped at 120 characters.
4. **Chunking.** `json3` events (`tStartMs`, `segs[].utf8`) are cleaned: whitespace collapsed, newline-only events dropped, and bracketed noise such as `[Music]` and `[Applause]` removed. Events are grouped in order into chunks that close once they span at least 20 seconds, or reach 60 words, whichever comes first. `startSeconds` is the floor of the first event's start. Each chunk is short enough that a query returns only a few matching chunks per video (AGENTS.md section 12). The full transcript is never stored in one field.
5. **Document shape (`video`):**
   - `_id`: `video-youtube-<youtubeId>`, with any character outside `[A-Za-z0-9_-]` removed. No dots, because dots make Sanity treat the id as a path.
   - `provider` (`"youtube"`), `videoId`, `url` (canonical `https://www.youtube.com/watch?v=<id>`), `title` (the provider's title, for the Studio only), `durationSeconds`.
   - `chapters[]`: `{ _key, startSeconds, label }`. `chunks[]`: `{ _key, startSeconds, text }`. Keys are deterministic (`c<index>`, `t<index>`), so re-runs produce no needless diffs.
   - `chapterSource` (`authored`, `description`, or `none`) and `ingestedAt` (datetime). These help with debugging in the Studio.
   - **Lesson join:** a lesson's video is `*[_type == "video" && url == ^.videoUrl][0]`. Seed lesson URLs are already canonical. The script warns about any lesson whose `videoUrl` differs from the canonical form, so that join cannot silently miss.
6. **Schema.** `studio/schemaTypes/documents/video.ts` with every field `readOnly` and a description saying it is built by the pipeline. The preview shows the title, with the chapter and chunk counts as the subtitle. Registered in `index.ts`. In `structure.ts`, a "Videos (generated)" item goes below a divider. Typegen picks up the type for later search work.
7. **Script: `studio/scripts/ingest-videos.ts`**, run with `npx sanity exec scripts/ingest-videos.ts --with-user-token -- [flags]`:
   - Reads `*[_type == "lesson" && defined(videoUrl)]{ _id, videoUrl }` and dedupes by parsed video id.
   - For each video: fetches the source (with the raw response cached on disk, see 8), builds chapters and chunks, and builds the document.
   - Writes with `createOrReplace` in transactions of 10. This is idempotent: re-running replaces documents with the same content.
   - Flags: `--dry-run` (fetch and build, print a summary, write nothing), `--only <youtubeId>` (repeatable), `--refresh` (ignore the cache).
   - Fetches run one at a time with a 750 ms pause and one retry after 3 s on a network or 5xx error. A failure on one video is logged and the run continues.
   - Summary: lessons scanned, unique videos, written, chapter source counts, videos with no transcript, skipped URLs, non-canonical URLs, and failures. The exit code is 1 if any video failed.
   - Does not delete `video` documents whose lesson is gone. It lists them as orphans for a person to review.
8. **Cache.** `studio/scripts/videos/.cache/<youtubeId>.json` holds the raw player fields we use plus the json3 transcript. It is gitignored. It makes re-runs (after a chunking tweak, for example) quick and keeps them off YouTube.
9. **Module layout:**
   - `studio/scripts/videos/youtube.ts`: URL parsing (the same rules as `lib/video.ts`; the Studio cannot import from the web workspace, so the parser is duplicated in a few lines), the innertube fetch, track choice, and the cache.
   - `studio/scripts/videos/transcript.ts`: pure functions `parseDescriptionChapters`, `chunkTranscript`, `videoDocumentId`. No I/O.
   - `studio/scripts/ingest-videos.ts`: orchestration and Sanity writes.
10. **Deploys.** After the schema change: `npm run deploy-schema` and `npm run deploy` from `studio/`, so the Studio shows the type and the Context MCP keeps serving, then `npm run typegen`.

## Files to touch

| File | Change |
| --- | --- |
| `studio/schemaTypes/documents/video.ts` | New. `video` document type, read only |
| `studio/schemaTypes/index.ts` | Register `video` |
| `studio/structure.ts` | "Videos (generated)" list item |
| `studio/scripts/ingest-videos.ts` | New. Pipeline entry |
| `studio/scripts/videos/youtube.ts` | New. YouTube fetch, track choice, cache |
| `studio/scripts/videos/transcript.ts` | New. Chapter parsing, chunking, id |
| `studio/scripts/videos/chapters.json` | New. Authored chapter overrides, `{}` |
| `studio/schema.json`, `sanity.types.ts` | Regenerated by typegen |
| `.gitignore` | Add `/studio/scripts/videos/.cache/` |

No web workspace code changes.

## Requirements

- One `video` document per unique video, with an id derived from the URL. Re-runs are idempotent.
- `chapters[]` and `chunks[]` match the shapes in AGENTS.md section 8. No field holds the whole transcript.
- Chapters: authored first, then the description, then none.
- The pipeline is offline only. No web route or page imports it.
- Read only in the Studio. People edit chapters through `chapters.json`, not in the UI, so a re-run never overwrites a hand edit.

## Security considerations

- Writes use the developer's own CLI login (`--with-user-token`). No new token goes into env, and nothing reaches the web app or the browser.
- No YouTube API key is needed. Nothing secret is cached.
- Transcript and description text is untrusted. It is stored as plain strings, never run or rendered as HTML. A later search can query it, but the server still hydrates results from trusted lesson data.
- Response sizes are bounded: tracks over 5 MB are rejected, and labels and chunk text are capped.
- **Unrelated but urgent:** the uncommitted `.env.example` change contains what looks like a real `OPENAI_API_KEY`. `.env.example` is committed, so that key would be published. I will not touch it in this task. See Needs your attention.

## Acceptance criteria

1. `--dry-run` prints a summary for all 120 videos and writes nothing.
2. A full run creates 120 `video` documents. Re-running creates no duplicates, and the content is unchanged.
3. `*[_type == "video" && videoId == "9602Yzvd7ik"][0]{ chapterSource, "c": count(chapters), "t": count(chunks), chapters[0..2] }` shows `description`, at least 3 chapters starting at 0, and dozens of chunks.
4. Every chunk has an integer `startSeconds`, ascending, inside `durationSeconds`, and non-empty text of at most about 60 words.
5. A lesson-to-video join works: `*[_type == "lesson"][0]{ title, "v": *[_type == "video" && url == ^.videoUrl][0]._id }` returns an id.
6. A chunk match works: `*[_type == "video" && chunks[].text match "server*"]{ videoId, "hits": chunks[text match "server*"][0..2]{ startSeconds, text } }` returns a few hits per video, not whole arrays.
7. Adding an entry to `chapters.json` and re-running with `--only <id>` makes `chapterSource` `authored`.
8. The Studio shows "Videos (generated)" with read-only documents.

## Checks to run

- Studio: `npx tsc --noEmit`. Then the script: `--dry-run`, a full run, and a second full run to confirm idempotence. Then `npm run deploy-schema`, `npm run deploy`, and `npm run typegen`.
- Web: `npx tsc --noEmit` and `npm run lint` (typegen output changes). No build, because no routes, config, or server modules change.
- Live: the GROQ checks above through `npx sanity documents query`. The Context MCP `/initial-context` still returns 200 after the deploy.

## Manual test steps

1. From `studio/`: `npx sanity exec scripts/ingest-videos.ts --with-user-token -- --dry-run`. Read the summary.
2. `npx sanity exec scripts/ingest-videos.ts --with-user-token`. Wait for the run to finish (about 2 to 3 minutes).
3. `npm run dev` in `studio/`. Open "Videos (generated)" and open a document. Check that its chapters and chunks look right and that the fields are read only.
4. In Vision, run the queries from acceptance criteria 3, 5, and 6.
5. Add `"9602Yzvd7ik": [{ "startSeconds": 0, "label": "Intro" }, { "startSeconds": 60, "label": "Routes" }]` to `chapters.json`. Run with `-- --only 9602Yzvd7ik`. Check that `chapterSource` is `authored`. Then revert the file and re-run.
6. Run the full command again. The summary shows the same counts, and the cache means no new YouTube fetches.
