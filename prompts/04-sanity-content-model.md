# 04 — Sanity Content Model, Studio, and Read Data Layer

## Goal

Give Vertex its content backbone:

1. A standalone Sanity Studio workspace with the content model for course, module, lesson, instructor, and category.
2. A server only Sanity read client, a cached fetch helper, typed GROQ queries, and a small set of data functions the pages will call.

After this task an author can create and link content in the Studio, and server code can read it with full types. No page is wired to the data yet, and no video, search config, or progress type is added.

## Skills and docs read

- `AGENTS.md` (sections 2, 5, 6, 7, 8, 12, 13, 14).
- `.claude/skills/sanity-best-practices/SKILL.md` and its references: `project-structure.md`, `schema.md`, `nextjs.md`, `typegen.md`, `groq.md`, `studio-structure.md`, `image.md`.
- `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md` and `03-api-reference/04-functions/cacheTag.md`: with `cacheComponents: true`, data is cached with the `'use cache'` directive plus `cacheLife` and `cacheTag`.
- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`: `import 'server-only'` keeps a module out of client bundles.
- `prompts/03-clerk-auth.md`, decision 1: the app is built at the repo root and the `web/` move is a separate task.

## Code inspected

- `git status`: an **embedded** Studio scaffold sits uncommitted in the working tree: `app/studio/[[...tool]]/page.tsx`, root `sanity.config.ts`, root `sanity.cli.ts`, `sanity/env.ts`, `sanity/lib/{client,image,live}.ts`, `sanity/schemaTypes/index.ts` (empty), `sanity/structure.ts`. `package.json` gained `sanity`, `@sanity/vision`, `styled-components`, `next-sanity`, `@sanity/image-url`.
- That scaffold breaks AGENTS.md section 5 (no embedded Studio) and section 12 (its client has no token and assumes a public dataset).
- `package.json`: Next.js 16.4.0, React 19.3.0, `next-sanity` 13.3.4, `sanity` 5.31.2, `@sanity/client` 7.27.0, Sanity CLI 6.7.2, Node 24.
- `next.config.ts`: `cacheComponents: true`, `partialPrefetching: true`. No `images.remotePatterns`.
- `tsconfig.json` and `eslint.config.mjs`: both pick up every `.ts` file in the repo, so a `studio/` folder must be excluded from the root checks.
- `.gitignore`: `/node_modules` is root only, and `.env*` with only `!/.env.example` allowed.
- `.env.example`: Clerk names only. `.env.local` (names only, values not read): has `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET`, and no Sanity token.
- `app/page.tsx`: the catalog cards use placeholder content with the comment "until the catalog is read from Sanity".
- `design/vertex-home.png`, `vertex-course.png`, `vertex-lesson.png`: used to confirm which fields the pages need (level, total duration, module count, student count, popular badge, four learning outcomes with icons, module summaries and durations, lesson summary, key points, pro tip, resource cards).

## Decisions and assumptions

1. **Two workspaces, smallest move.** The Studio becomes a standalone workspace in `studio/` with its own `package.json`. The Next.js app stays at the repo root, as in prompts 01 to 03. Moving it into `web/` stays a separate task.
2. **The embedded scaffold is removed.** I delete `app/studio/`, root `sanity.config.ts`, root `sanity.cli.ts`, `sanity/structure.ts`, `sanity/schemaTypes/`, and `sanity/lib/live.ts`. These are uncommitted, so git cannot restore them. They are stock CLI output with an empty schema, and their useful parts are recreated in `studio/`.
3. **Root dependencies.** Keep `next-sanity` and `@sanity/image-url`. Remove `sanity`, `@sanity/vision`, and `styled-components` from the root, unless `next-sanity` lists one as a required peer, in which case that one stays. (Amended during the build: `next-sanity` 13 requires both `sanity` and `styled-components` as peers, so only `@sanity/vision` was removed.)
4. **Studio is created by hand, not with `npm create sanity`.** Same versions as the scaffold (`sanity` and `@sanity/vision` ^5.31.2), plus `@sanity/icons`, React 19, and `styled-components`. Plugins: `structureTool` and `visionTool`. No `@sanity/context` plugin in this task.
5. **Schema layout.** `studio/schemaTypes/documents/{course,lesson,instructor,category}.ts`, `studio/schemaTypes/objects/{module,learning-outcome,resource}.ts`, and `index.ts`. Every type uses `defineType`, `defineField`, `defineArrayMember`, and an icon from `@sanity/icons`. (Amended during the build: the installed `@sanity/icons` 3.8.0 has no per icon subpaths, so icons are imported from the package root.)
6. **Fields.** The relationships and named fields come from AGENTS.md section 8. My choices for the rest:
   - **category** — `title`, `slug`, `description` (text).
   - **instructor** — `name`, `slug`, `photo` (image, hotspot, alt), `expertise` (array of short strings), `bio` (plain text).
   - **lesson** — `title`, `slug`, `summary` (text, the line under the lesson title in the design, also the short description search will need), `videoUrl` (url, http or https), `poster` (image, hotspot, alt), `duration` (whole seconds, number), `freePreview` (boolean, default false), `studentCount` (number), `notes` (Portable Text: normal, h2, h3, quote, lists, bold, italic, code, links), `keyPoints` (array of strings), `proTip` (text, optional), `resources` (array of `resource`).
   - **resource** (object) — `type` (list: documentation, guide, repository, article, download), `title`, `description`, `url`.
   - **course** — `title`, `slug`, `summary` (text), `coverImage` (image, hotspot, alt; also used as the small course icon), `level` (radio list: beginner, intermediate, advanced), `price` (number in USD, 0 means free), `popular` (boolean, optional), `studentCount` (number), `learningOutcomes` (array of `learningOutcome`, up to 6), `instructor` (reference), `category` (reference), `modules` (array of `module`).
   - **learningOutcome** (object) — `icon` (list of keys: layers, database, gauge, cloud, code, shield, rocket, sparkles), `title`, `description`. The key is data. The course page task maps keys to drawn icons.
   - **module** (object, embedded in course) — `title`, `summary`, `lessons` (ordered array of references to lesson, unique).
7. **Derived, never stored.** Module and lesson numbers, module and course durations, and module and lesson counts are computed in GROQ or TypeScript from order and from `lesson.duration`. A lesson stores no parent, so its course comes from a reverse reference.
8. **Durations are seconds.** One integer field. Formatting to "1h 28m" belongs to the page tasks.
9. **Studio structure.** One simple list in authoring order: Courses, Lessons, Instructors, Categories.
10. **Web Sanity code lives in `sanity/` at the root**, where the scaffold already put it:
    - `sanity/env.ts` — project id, dataset, API version. No secrets.
    - `sanity/lib/client.ts` — `import 'server-only'`, `createClient` with `token: SANITY_API_READ_TOKEN`, `perspective: 'published'`, `useCdn: true`, and a clear error if the token is missing.
    - `sanity/lib/fetch.ts` — `sanityFetch({ query, params, tags })`, cached with `'use cache'`, `cacheLife('minutes')`, and `cacheTag(...tags)`.
    - `sanity/lib/image.ts` — `urlFor` (kept from the scaffold). Uses only the public project id and dataset.
    - `sanity/queries.ts` — every query wrapped in `defineQuery`, each with a unique name, always projected.
    - `sanity/data.ts` — `import 'server-only'`. `getCourses()`, `getCourseBySlug(slug)`, `getLessonBySlug(slug)`, `getInstructorBySlug(slug)`, `getCategories()`, plus one pure helper `getLessonPosition(course, lessonId)` that returns module number, lesson number, and previous and next lesson.
11. **Queries.**
    - Catalog: course card fields, category and instructor names, `moduleCount`, `lessonCount`, and `durationSeconds` summed from lesson durations.
    - Course by slug: all course fields, instructor, category, learning outcomes, and modules with `_key`, title, summary, summed duration, and each lesson's id, title, slug, duration, and free preview flag.
    - Lesson by slug: all lesson fields (notes as Portable Text), plus its course by reverse reference with the same module outline for the sidebar, level, and instructor.
    - Instructor by slug: instructor fields plus their courses by reverse reference.
    - Categories: title, slug, description.
12. **No Live Content API.** `defineLive` wants a browser token for live updates, which AGENTS.md forbids. Plain cached server fetches are enough. Content edits show up within the `minutes` cache window. A revalidation webhook can use the cache tags later and is not built here.
13. **TypeGen.** Configured in `studio/sanity.cli.ts`: reads queries from `../sanity/**/*.ts` and `../app/**/*.{ts,tsx}`, writes `../sanity.types.ts`, with `overloadClientMethods` on. `studio/schema.json` and `sanity.types.ts` are committed. A `typegen` script in `studio/package.json` runs extract then generate.
14. **Env.**
    - Web (`.env.local`, names added to `.env.example`): existing `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET`, new server only `SANITY_API_READ_TOKEN`, optional `NEXT_PUBLIC_SANITY_API_VERSION`.
    - Studio (`studio/.env`, with a committed `studio/.env.example`): `SANITY_STUDIO_PROJECT_ID` and `SANITY_STUDIO_DATASET`. I copy the two values from `.env.local` with a script that does not print them.
15. **Read token.** I create a Viewer token with the Sanity CLI and write it straight into `.env.local` without printing it. If the CLI is not logged in or the call fails, I ask you to run `npx sanity login`, or to create the token in Sanity Manage and paste it into `.env.local` yourself.
16. **Private dataset.** I check the dataset's visibility. If it is public, I switch it to private with `sanity dataset visibility set`. This is a change to your Sanity project that this approval covers.
17. **`next.config.ts`.** Add `images.remotePatterns` for `cdn.sanity.io` so `next/image` can load Sanity images when the pages arrive.
18. **No CORS origin is added.** The browser never calls Sanity.
19. **Deploys.** I run `sanity schema deploy`. `sanity deploy` (the hosted Studio, needed before the Context MCP works) asks for a public hostname, so I will ask you for one through the question panel when I reach that step. You can defer it to the search task.
20. **Out of scope.** Wiring the home page or any other page to the data, seed or sample content, video documents and ingestion, the agent context document, progress records and write tokens, draft mode and Visual Editing, revalidation webhooks, the `web/` move.

## Files to touch

| File | Change |
| --- | --- |
| `app/studio/`, `sanity.config.ts`, `sanity.cli.ts`, `sanity/structure.ts`, `sanity/schemaTypes/`, `sanity/lib/live.ts` | Delete (embedded scaffold) |
| `package.json`, `package-lock.json` | Remove Studio only dependencies from the root |
| `studio/package.json`, `studio/tsconfig.json`, `studio/.gitignore`, `studio/.env.example`, `studio/.env` | New. Standalone Studio workspace (`.env` is not committed) |
| `studio/sanity.config.ts`, `studio/sanity.cli.ts`, `studio/structure.ts` | New |
| `studio/schemaTypes/index.ts`, `documents/*.ts`, `objects/*.ts` | New. The content model |
| `studio/schema.json`, `sanity.types.ts` | Generated by TypeGen, committed |
| `sanity/env.ts`, `sanity/lib/image.ts` | Keep, light edits |
| `sanity/lib/client.ts` | Rewrite as the server only token client |
| `sanity/lib/fetch.ts`, `sanity/queries.ts`, `sanity/data.ts` | New |
| `next.config.ts` | Add the Sanity image remote pattern |
| `tsconfig.json`, `eslint.config.mjs` | Exclude `studio/` from the root checks |
| `.gitignore` | Allow `studio/.env.example` next to the root one |
| `.env.example` | Add the Sanity names |
| `.env.local` | Add `SANITY_API_READ_TOKEN`. Not committed, values never printed |
| `README.md` | Short section on running the Studio and TypeGen |

## Requirements

- The Studio runs on its own with `npm run dev` inside `studio/` and is not reachable from the Next.js app. `/studio` returns 404.
- The five content types exist with the relationships from AGENTS.md section 8: course references instructor and category, course embeds modules, module references lessons, lesson has no parent field.
- Required fields are validated: titles, slugs, course summary, level, instructor, category, lesson video URL and duration.
- Images have hotspot on and an `alt` field. (Amended during the build: a missing `alt` is a Studio warning written as a custom rule, not `required()`, so TypeGen's `--enforce-required-fields` does not type it as always present.)
- No stored module or lesson number, and no stored total duration or count.
- No markdown field anywhere. Lesson notes are Portable Text.
- Every query uses `defineQuery`, projects only needed fields, filters with `$params`, and includes `_key` on arrays.
- `sanity/lib/client.ts`, `sanity/lib/fetch.ts`, and `sanity/data.ts` import `server-only`.
- Missing documents return `null` from the data functions, so pages can call `notFound()`.
- Existing pages (`/`, `/design-system`, sign in, sign up) behave exactly as before.

## Security considerations

- `SANITY_API_READ_TOKEN` is read only in `sanity/lib/client.ts`, never prefixed with `NEXT_PUBLIC_`, never logged, never committed.
- The token is a Viewer token. No write token is created in this task.
- `server-only` makes a client component import of the client, the fetch helper, or the data functions fail the build.
- The dataset is private. Nothing reads content from the browser.
- Only the project id and dataset name are public, and they are needed for image URLs.
- All GROQ inputs go through `$params`. No string interpolation of user input into a query.
- I do not print the contents of `.env.local` or `studio/.env`.

## Acceptance criteria

- `npm run dev` in `studio/` opens a Studio listing Courses, Lessons, Instructors, and Categories, and each form shows the fields above.
- A course can be created with an instructor, a category, and a module that references lessons.
- `sanity.types.ts` exists and contains result types for all five queries.
- Each query runs against the live dataset with the read token and returns without a GROQ error (empty results are fine while there is no content).
- The same request without the token returns no content, confirming the dataset is private.
- Type check, lint, and production build pass at the root. The Studio builds.
- `git status` shows no env file with real values tracked.

## Checks to run

1. Root: `npm run build` (run first, it regenerates the route types in `.next` that the type check reads)
2. Root: `npx tsc --noEmit`
3. Root: `npm run lint`
4. Studio: `npx tsc --noEmit`
5. Studio: `npm run typegen` (schema extract plus TypeGen)
6. Studio: `npx sanity build`
7. Studio: `npx sanity schema deploy`
8. A one off script that runs the five queries against the live API with the token, and one request without it
9. Root: `npm run dev`, then load `/`, `/design-system`, and `/studio` (expect 404)

## Manual test steps

1. Run `cd studio` then `npm run dev`, and open `http://localhost:3333`. Sign in to Sanity if asked.
2. Create a Category and an Instructor, and publish both.
3. Create two Lessons with a title, slug, video URL, and duration, and publish both.
4. Create a Course. Pick the instructor and category, add one learning outcome, add a module, and add both lessons to it. Publish.
5. Open the Vision tool and run `*[_type == "course"]{title, "lessons": modules[].lessons[]->title}`. Your course and both lesson titles come back.
6. In a second terminal at the repo root, run `npm run dev` and open `http://localhost:3000/`. The home page looks the same as before.
7. Open `http://localhost:3000/studio`. You get a 404.
