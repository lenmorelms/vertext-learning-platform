# 11 — Intelligent Search (lessons)

## Goal

Learners type a plain language query and get a full results page of ranked lesson cards, built from `design/vertex-search.png`. A server route connects to the Sanity Context MCP, gives the LLM the schema and the query rules, lets it write GROQ over courses and lessons, and streams the ranked results back. A client component renders the results page.

**Scope decision (from the user):** lesson results only. There is no video document schema or ingestion pipeline yet, so this task builds no video results, no video schema, and no transcript or chapter matching. The video card in the reference is left for the ingestion task.

## Skills and docs read

- `AGENTS.md` (sections 2, 3, 5, 6, 7, 10, 11, 12, 13, 14).
- create-agent-with-sanity-context: `SKILL.md`, `references/nextjs-agent.md`, `references/studio-setup.md`, reference route `ecommerce/app/src/app/api/chat/route.ts` (MCP over HTTP with a Bearer token, `/initial-context` fetched once and cached, `initial_context` tool excluded, `stopWhen(stepCountIs(n))`).
- dial-your-context: Instructions are short deltas the schema does not make obvious, plus a `groqFilter` scoping the visible types.
- shape-your-agent: not needed. There is no conversational reply, so tone and refusal style do not apply; the guardrails (grounded, lessons only) live in the system prompt.
- `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md` (POST handlers are never cached; `use cache` must live in a helper, not the handler body).
- `prompts/09-lesson-page.md` (`searchParams` read inside `<Suspense>` under Cache Components).

## Code and environment inspected

- `app/page.tsx`: the home search is already `<form action="/search">` with `name="q"`, using `Input fieldSize="lg"`, `SearchIcon`, hint `⌘ K`, and `SearchShortcut`. `/search` does not exist yet.
- `sanity/lib/client.ts`, `sanity/lib/fetch.ts`, `sanity/data.ts`: server only client with `SANITY_API_READ_TOKEN`, cached `sanityFetch`, and `getLessonPosition()` that derives module and lesson numbers from order.
- `sanity/queries.ts`: lesson summary falls back to the first notes paragraph; course is found by reverse reference.
- `components/ui/*`: `SiteHeader active="courses"`, `Input`, `Select`, `Badge variant="lesson"`, `Button`, icons (`SearchIcon`, `DocumentIcon`, `ExternalLinkIcon`, `ChevronRightIcon`, `ArrowRightIcon`, `ChevronDownIcon`). `cards.tsx` has design system `LessonCard`, but its layout differs from the search reference, so search gets its own result card.
- Studio: `sanity` 5.31. `@sanity/context` 2.2.0 needs `sanity ^6`, so per AGENTS.md section 12 the plugin is **not** installed and the Context document is created by import.
- Live MCP probe: `https://api.sanity.io/v2026-03-03/context/mcp/<project>/<dataset>` returns `STUDIO_NOT_DEPLOYED`. The Studio must be deployed before search can work.
- `.env.local` has no `OPENAI_API_KEY` and no MCP URL yet.
- Web deps: no `ai`, `@ai-sdk/openai`, `@ai-sdk/mcp`, or `zod`. Latest: `ai` 7.0.140, `@ai-sdk/openai` 4.0.93, `@ai-sdk/mcp` 2.0.74, `zod` 4.6.7.
- Seed: 10 courses and 120 lessons. Every lesson has a title, Portable Text notes, and 3 `keyPoints`.

## Decisions and assumptions

1. **The model picks, the server shows.** The LLM queries Sanity through the MCP `groq_query` tool and returns only an ordered list of lesson `_id`s, best first (Zod validated structured output). The server then loads those ids with its own trusted GROQ query through the existing read client and builds every card from that stored data. Titles, descriptions, key points, course names, and module numbers never come from model text, so nothing can be invented. Ids that are not real lessons in a course are dropped. Duplicates are removed.
2. **Route.** `POST /api/search` with JSON `{ query }`. Zod checks it: trimmed, 2 to 200 characters. The route:
   - fetches `<MCP_URL>/initial-context` once and caches it in module memory (prompt changes need a server restart, AGENTS.md section 12), and injects it into the system prompt;
   - opens the MCP client over HTTP with `Authorization: Bearer SANITY_API_READ_TOKEN`, and passes only `groq_query` and `schema_explorer` (drops `initial_context`);
   - runs the AI SDK with the OpenAI provider, a step cap (about 8), and a structured output schema `{ lessonIds: string[] }` (at most 60);
   - closes the MCP client in every path.
3. **Streaming.** The route returns NDJSON lines: `{"type":"status","stage":"searching"}` when it starts and as tool calls run, then one `{"type":"results",...}` or `{"type":"error","message"}` line. The client shows a loading state until the results line arrives. A plain-language error is shown on failure. Internal error details are logged on the server only.
4. **System prompt (inline, `lib/search/prompt.ts`).** States the job (find every relevant lesson, ranked) and the critical rules, which are also repeated in the Context document (section 11):
   - Search lessons only. Courses, instructors, and categories may narrow or explain a match, but the output is lesson ids.
   - Match `title`, `keyPoints`, and `pt::text(notes)`. Never `match` on `notes` directly.
   - Tokenize: wildcard each keyword (`"fetch*"`) and OR the words. Never match the whole phrase as one pattern.
   - Rank by specificity: an exact concept in the title beats key points, which beat notes only. Use `score()` with `boost()` on title and `order(_score desc)`.
   - Return all relevant lessons, not a handful. Return an empty list when nothing fits. Never return an id that a query did not return.
   - No `text::semanticSimilarity()` (embeddings may be off).
   Backticks in the template literal are escaped.
5. **Context document.** `studio/scripts/context/agent-context.ndjson` with one `sanity.agentContext` document: `_id: "vertex-search"`, `name: "Vertex Search"`, `slug: vertex-search`, `groqFilter: _type in ["course", "lesson", "instructor", "category"]`, and short `instructions` (the deltas):
   - A lesson has no parent field. Get its course with `*[_type == "course" && references(^._id)][0]`.
   - Module and lesson numbers come from the order of `course.modules[]` and `modules[].lessons[]`. They are not stored.
   - `notes` is Portable Text. Text match it with `pt::text(notes)`.
   - The same match, ranking, and output rules as decision 4, in short form.
   It is imported with `npx sanity dataset import ... --replace` from `studio/`. The MCP URL uses the slug: `.../context/mcp/<project>/<dataset>/vertex-search`. A `video` type is added to the filter in the ingestion task.
6. **Studio deploy.** Context needs a deployed Studio. I run `npx sanity deploy` from `studio/`, then `npx sanity schema deploy`. Deploy asks for a hostname the first time. I add `studioHost` to `sanity.cli.ts`, read from `SANITY_STUDIO_HOSTNAME` (added to `studio/.env.example`). **You choose the hostname** (it becomes `<hostname>.sanity.studio` and must be globally unique). If deploy needs an interactive login, I stop and tell you the command.
7. **Result data (server, `sanity/queries.ts` `SEARCH_LESSONS_QUERY`).** For `_id in $ids`: lesson `_id`, title, slug, summary (same coalesce as `LESSON_QUERY`), keyPoints, and the parent course: `_id`, title, slug, coverImage, and `modules[]{ title, "lessonIds": lessons[]._ref }`. In TypeScript, the server derives the module number and lesson number, keeps the model's order, and computes `courseCount` (distinct courses). Fetched through `sanityFetch` (cached, tags `lesson`, `course`).
8. **Page.** `app/search/page.tsx`, `SiteHeader active="courses"` (Courses is orange in the reference). It reads `q` from `searchParams` inside `<Suspense>` and renders the client `SearchResults` keyed by the query. Metadata title: `Search · Vertex`.
9. **Results UI (match the reference).**
   - Header: "SEARCH RESULTS" pill, serif `Results for "<q>"` with the quoted query in primary, and `Found N results across M courses` (singular forms handled).
   - Search field: `Input` (md size, styled to the reference's height), GET form to `/search`, prefilled with `q`, `⌘ K` hint, `SearchShortcut`.
   - Row: `N results` on the left, sort `Select` on the right. Options: **Most Relevant** (default, the model's order), **Course (A–Z)** (course title, then module and lesson order), and **Lesson order** (module and lesson number within each course). Sorting happens on the client and does not run a new search.
   - Lesson card, as in the reference rows 4–5. The left panel shows the lesson's key points as a bulleted list, and its top icon is the course cover image (falls back to `DocumentIcon`). The right side shows the course icon and name, the `LESSON` badge at top right, the title, a short description (summary, 2-line clamp), and `Module N` below. Action: `View lesson` + external link icon + chevron, linking to `/lessons/<slug>`. The whole card is a link target.
   - Footer card: "Can't find what you're looking for?" with `Browse all courses →` to `/courses`.
   - States: loading (skeleton cards), empty (`No results for "<q>"` plus the browse-all card), error (message plus a retry button), and no query (heading `Search your learning` plus the field and the browse-all card, no API call).
   - All results are rendered (no cap, no pagination).
10. **Not built (and why).**
    - Video results, the `VIDEO` badge, `Watch from`, and the thumbnail panel: user scope decision.
    - The completion check on lesson cards: there is no progress data yet.
    - PostHog `search performed`: PostHog is not installed yet.
    - Conversation Insights: needs the `@sanity/context` plugin, which does not support Sanity 5.
11. **Model.** `OPENAI_MODEL` env, with a default. During implementation I check the current OpenAI model ids in the installed `@ai-sdk/openai` types and pick a fast tool-calling one. I note the pick in the report.

## Files to touch

| File | Change |
| --- | --- |
| `package.json` / lockfile | Add `ai`, `@ai-sdk/openai`, `@ai-sdk/mcp`, `zod` |
| `.env.example` | Add `OPENAI_API_KEY`, `OPENAI_MODEL`, `SANITY_CONTEXT_MCP_URL` (server only, commented) |
| `app/api/search/route.ts` | New. Validates input, runs the agent, hydrates, streams NDJSON |
| `lib/search/agent.ts` | New, server only. MCP client, cached initial context, LLM call, returns ordered ids |
| `lib/search/prompt.ts` | New, server only. Inline system prompt |
| `lib/search/types.ts` | New. Shared result and stream event types (no server imports) |
| `sanity/queries.ts` | Add `SEARCH_LESSONS_QUERY` |
| `sanity/data.ts` | Add `getSearchLessons(ids)` that returns cards in the given order |
| `sanity.types.ts` | Regenerated by typegen |
| `app/search/page.tsx` | New. Search page shell |
| `components/search/search-results.tsx` | New, client. Fetches the stream, sort, states |
| `components/search/lesson-result.tsx` | New. Lesson result card |
| `components/search/search-footer.tsx` | New. "Can't find what you're looking for?" card |
| `studio/scripts/context/agent-context.ndjson` | New. Context document |
| `studio/sanity.cli.ts`, `studio/.env.example` | `studioHost` from `SANITY_STUDIO_HOSTNAME` |

## Requirements

- The browser never sees the read token, the OpenAI key, or the MCP URL. It only calls `/api/search`.
- Every displayed field comes from Sanity data loaded on the server. The model contributes only ids and order.
- Return all relevant lessons, ranked. Show a count and course count. The sort defaults to Most Relevant.
- The desktop layout matches the reference (lesson rows, header, search field, count and sort row, footer card). It is responsive down to 375px: cards stack the key points panel above the text, there is no horizontal scroll, and side gutters are 16px.
- Reuse `SiteHeader`, `Input`, `Select`, `Badge`, `Button`, icons, `urlFor`, and the frame pattern from the other pages.

## Security considerations

- Secrets are server only: `OPENAI_API_KEY` and `SANITY_API_READ_TOKEN` are used only in `lib/search/agent.ts` and `sanity/lib/client.ts`, both `server-only`. No `NEXT_PUBLIC_` prefix.
- The MCP token is the existing Viewer token (read only). The Context `groqFilter` also limits the agent to content types.
- Prompt injection through the query cannot leak data or write anything. Tools are read only. The output is ids only, and those ids are re-checked against `_type == "lesson"` with a parent course before anything renders.
- Input limits: 2 to 200 characters, a step cap, an output cap of 60 ids, and a max output token limit. These bound cost per request.
- **Open risk:** `/api/search` is public and every call costs LLM tokens. There is no rate limiting in this task (no store exists for it). Flagged for you.
- Errors returned to the browser are generic. Details are logged only on the server.

## Acceptance criteria

1. Submitting "data fetching" from the home page opens `/search?q=data+fetching`, shows a loading state, then shows ranked lesson cards with `Found N results across M courses` and `N results`.
2. Results whose title contains the concept rank above results that only mention it in notes.
3. Every card's course, title, description, key points, and `Module N` match the lesson in Studio, and `View lesson` opens `/lessons/<slug>`.
4. Changing the sort reorders the cards without a new network request. Most Relevant restores the original order.
5. A nonsense query (for example "zzqxv") shows the empty state with Browse all courses.
6. `/search` with no `q` shows the search field and makes no API call.
7. `curl -X POST /api/search` with `{ "query": "a" }` returns 400. With a valid query it streams NDJSON ending in a `results` line.
8. No token or key appears in the client bundle or the network responses.
9. The layout has no horizontal scroll at 375px.

## Checks to run

- Web: `npx tsc --noEmit`, `npm run lint`, `npm run build`, and `npm run dev` with a live query.
- Studio: `npx sanity deploy`, `npx sanity schema deploy`, `npx sanity dataset import scripts/context/agent-context.ndjson <dataset> --replace`, and `npm run typegen`.
- Live MCP: `tools/list` and `/initial-context` against the slug URL return 200. Then a real search through `/api/search` returns results.
- Grep `.next/static` for the token and key values: no matches.

## Manual test steps

1. Add to `.env.local`: `OPENAI_API_KEY=<key>`, and `SANITY_CONTEXT_MCP_URL=https://api.sanity.io/v2026-03-03/context/mcp/<projectId>/<dataset>/vertex-search`. Optionally add `OPENAI_MODEL`.
2. Add `SANITY_STUDIO_HOSTNAME=<your-unique-name>` to `studio/.env`.
3. `npm run dev`, then open `http://localhost:3000`.
4. Type "data fetching" in the home search and press Enter. Check the header, the count, and the ranked lesson cards.
5. Open the sort and try each option. Then return to Most Relevant.
6. Click `View lesson` on a card. It opens that lesson page.
7. Search "zzqxv". The empty state and Browse all courses appear.
8. Open `/search` with no query. Only the field and the browse card appear.
9. Resize to 375px wide. The cards stack and the page has no horizontal scroll.
10. In Studio (deployed URL) or via import, edit the Context document instructions. The next search uses them without a restart. Inline prompt changes need a restart.
