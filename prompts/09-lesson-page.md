# 09 — Lesson Page

## Goal

Turn `design/vertex-lesson.png` into the lesson route (`/lessons/[slug]`), reading the seeded lesson and its parent course from Sanity through the existing server only data layer, with the lesson's video playing on the page in the provider's own embed. A `?t=<seconds>` query param starts the video at that second (the search results task will link here with it).

## Skills and docs read

- `AGENTS.md` (sections 2, 3, 5, 7, 8, 9, 11, 12, 13, 14).
- `prompts/01-design-system.md`, `prompts/06-course-page.md` (scale rules, frame, progress placeholder decisions), `prompts/05-seed-sanity.md`.
- sanity-best-practices: `defineQuery` + TypeGen already in place; Portable Text renders with `PortableText` from `next-sanity` and custom components.
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md` (`searchParams` is a Promise) and `01-getting-started/08-caching.md` (with Cache Components, a component that reads `searchParams` must sit inside `<Suspense>`; pass the promise down so the rest of the page stays in the static shell).

## Code inspected

- `sanity/queries.ts`: `LESSON_QUERY` exists. It returns the lesson fields, notes, key points, pro tip, resources, and the parent course (reverse reference) with its module outline, instructor, and level.
- `sanity/data.ts`: `getLessonBySlug` and `getLessonPosition` (module and lesson numbers, previous and next across modules) already exist.
- `app/courses/[slug]/page.tsx`: frame, `generateStaticParams`, metadata, and the "signed-in only, 0% until progress exists" pattern (`ProgressCard`). Lesson links already point to `/lessons/<slug>`.
- `components/ui/*`: `SiteHeader`, `Breadcrumbs`, `Button`, `ProgressBar`, icons (`ClockIcon`, `BarChartIcon`, `UsersIcon`, `BookmarkIcon`, `ChevronDownIcon`, `CheckCircleIcon`, `ExternalLinkIcon`, `DocumentIcon`, `ArrowRightIcon`, `PlayCircleIcon`). `ResourceCard` exists but its layout (type label row) differs from the lesson reference, so the lesson gets its own resource tile.
- `lib/format.ts`: `formatDuration`.
- Seed data (`studio/scripts/seed/seed.ndjson`, imported live):
  - 120 lessons, all `videoUrl`s are `https://www.youtube.com/watch?v=<id>`.
  - **No lesson has `summary`.** Notes are always: intro paragraph, `h2` "What this lesson covers", 3 bullets (same text as `keyPoints`), outro paragraph.
  - 34 of 120 lessons have a `proTip`. Each lesson has 1–2 resources, all with `type: "link"`, which is **not** in the schema's type list.
  - The image field is stored as `thumbnail`, but the schema and query call it `poster`, so `poster` is always null. The lesson page does not need it (the YouTube embed shows its own poster).

## Decisions and assumptions

1. **Route.** `app/lessons/[slug]/page.tsx` with `generateStaticParams` (every lesson slug, via a new small `LESSON_SLUGS_QUERY` and `getLessonSlugs()`), `generateMetadata`, and `notFound()` for an unknown slug or a lesson with no parent course.
2. **Query change (small).** In `LESSON_QUERY`:
   - `summary` becomes `coalesce(summary, pt::text(notes[style == "normal" && !defined(listItem)][0]))`, so the subtitle and Overview show the lesson's first notes paragraph when no summary is authored. Stored data only, nothing invented.
   - No module field is added: the module comes from `getLessonPosition` over the outline.
   - Regenerate types with `npm run typegen` in `studio/`.
3. **Video.** A server component `LessonVideo` parses `videoUrl` in `lib/video.ts` into `{ provider: "youtube", id }` and renders a `youtube-nocookie.com/embed/<id>?start=<t>&rel=0&modestbranding=1` iframe in a 16:9 black rounded frame, with `allowFullScreen` and a `title`. Only YouTube is parsed: the seed is all YouTube, and AGENTS.md section 9 says a provider is not supported until ingestion and playback both exist. Any other URL shows a quiet "Video unavailable" panel in the same frame. The controls in the reference are the provider's own player chrome; no custom player is built.
4. **Start second.** `?t=` is read in `LessonVideo` from the page's `searchParams` promise, inside `<Suspense>` whose fallback is the same black frame, so the rest of the page prerenders. `t` must parse as a non-negative integer and is clamped to the lesson duration; anything else is ignored.
5. **Tabs.** "Lesson Content" (default) and "Notes". Both panels are server rendered and passed to a tiny client `LessonTabs` (ARIA tablist, arrow keys switch). AGENTS.md lists the Notes tab as presentational with no backend of its own, so **Notes renders the lesson's stored Portable Text `notes`** (h2, h3, paragraphs, bullet/number lists, strong, em, code, links opening in a new tab). Lesson Content shows Overview (the summary from decision 2), "In this lesson you will:" (`keyPoints`), Pro Tip (only when set), and Resources.
6. **Resources.** A tile per resource: icon (GitHub mark for `repository`, document icon for everything else, including the seed's `link`), title, description, external link icon. The whole tile is a link with `target="_blank" rel="noopener noreferrer"`. Grid of 3 on desktop, 2 on tablet, 1 on mobile.
7. **Sidebar (course outline).**
   - "← Back to course" → `/courses/<courseSlug>`.
   - Course card: course cover (square crop) + title. Progress line ("N% complete" + mini bar) shows for signed-in learners only, at **0%**, same as the course page, until the progress task.
   - "Module M of N" header, then every module as a row: circled number, title, duration. The current module is open (primary filled number) and lists its lessons: current lesson has a filled primary dot, primary "Now playing", and a filled play button; others have hollow dots and durations and link to their lesson. Other modules are native `<details>` that expand to their lessons, with a chevron.
   - **No completion checks** (modules 1–4 in the reference): there is no progress data yet, so completed modules show the chevron like the rest. The progress task adds checks.
8. **Header block.** "LESSON M.L" pill (primary tint, as in the reference), serif `h1` title, bookmark icon button (presentational, no behavior, same as the course page), summary, meta row: lesson duration, course level, `N students` with the full number (`3,426`) from the lesson's `studentCount` (hidden when absent).
9. **Breadcrumbs.** All Courses (`/courses`) › course title (`/courses/<slug>`) › module title (`/courses/<slug>`) › lesson title (current).
10. **Bottom bar.** "← Previous Lesson" (tertiary) with the previous lesson's title and duration, and "Next Lesson →" (primary) with the next lesson's title and duration, from `getLessonPosition` (crosses module boundaries). Each side hides at the start or end of the course.
11. **Responsive.** Desktop matches the reference (sidebar ~360px left, content right, bottom bar full width). Below `lg`: the sidebar sits above the content; back link and course card stay visible, and the "Module M of N" header becomes a toggle that collapses the outline (collapsed by default on mobile, open on desktop, via a small client `OutlineToggle` using `hidden lg:block` classes so there is no hydration mismatch). Bottom bar keeps both buttons, hides the lesson titles below `sm`. No horizontal scroll at 375px.
12. **Header.** `SiteHeader` with no active link, as in the reference.
13. **Not in scope:** progress writes, resume position, completion marks, bookmarks, PostHog events, poster/thumbnail naming fix, Vimeo/Bunny.

## Files to touch

| File | Change |
| --- | --- |
| `app/lessons/[slug]/page.tsx` | New. Lesson page, static params, metadata |
| `components/lesson/lesson-sidebar.tsx` | New. Back link, course card, module outline |
| `components/lesson/outline-toggle.tsx` | New. Client toggle for the outline on mobile |
| `components/lesson/lesson-video.tsx` | New. Provider embed with start second |
| `components/lesson/lesson-tabs.tsx` | New. Client tablist |
| `components/lesson/lesson-content.tsx` | New. Overview, key points, pro tip, resources |
| `components/lesson/lesson-notes.tsx` | New. Portable Text renderer for notes |
| `components/lesson/lesson-pager.tsx` | New. Previous / next bar |
| `components/ui/icons.tsx` | `PlayIcon`, `LightbulbIcon`, `GithubIcon`, `ArrowLeftIcon` |
| `lib/video.ts` | New. Video URL parser and embed URL builder |
| `lib/format.ts` | `formatCount` (full number with separators) |
| `sanity/queries.ts` | `summary` fallback in `LESSON_QUERY`, new `LESSON_SLUGS_QUERY` |
| `sanity/data.ts` | `getLessonSlugs()` |
| `sanity.types.ts` | Regenerated by TypeGen |

## Requirements

### Frame
- Same canvas, hatch, and 1440px bordered column as the other pages. `SiteHeader` on top. Below it, a two column area: sidebar with a right border, content on the right. The pager spans the full width at the bottom with a top border.

### Sidebar
- As decision 7. Rows separated by hairlines (`border-line`), the current module on a faint warm tint. Number circles: neutral outline; current module filled primary with white text. Lesson dots connected by a thin vertical line.

### Content
- Breadcrumbs, "LESSON M.L" pill, title (Playfair Display, ~44px desktop), bookmark icon button aligned right, summary in neutral 500, meta row with icons.
- Video: 16:9, black, rounded (`rounded-lg`), full content width.
- Tabs underlined: active tab primary text with a primary bottom border; inactive neutral 500.
- Overview: serif heading, paragraph in neutral 500, hairline divider. Key points: primary outline check circle + text. Pro Tip: warm tinted bordered box with a primary lightbulb icon, "Pro Tip" title, text. Resources: serif heading + tiles.

### General
- Match the reference for layout, spacing, type, color, and states. No restyling.
- One `h1`. Visible focus on all controls. Decorative icons `aria-hidden`. The iframe has a descriptive `title`.
- Server components throughout except `LessonTabs`, `OutlineToggle`, and Clerk's own components.

## Security considerations

- All Sanity reads stay server side through `sanity/data.ts` (`server-only`) with the server only read token. The browser receives rendered HTML only (plus the tab and toggle state).
- The slug is passed only as a GROQ parameter. `?t=` is parsed to an integer and clamped before it reaches the embed URL; the video id is validated with a strict pattern (`^[A-Za-z0-9_-]{11}$`) so no stored or user text is interpolated into the iframe `src` unchecked.
- Embed uses `youtube-nocookie.com`; iframe gets `referrerPolicy="strict-origin-when-cross-origin"` and a minimal `allow` list.
- Resource and notes links come from Sanity (schema restricts to http/https/mailto) and open with `rel="noopener noreferrer"`.
- No writes, no new env vars, no API routes.

## Acceptance criteria

- `/lessons/nextjs-app-router-in-depth-fetching-in-server-components` renders the seeded lesson and matches `design/vertex-lesson.png` side by side at desktop width (seeded text and 4 modules instead of the mock's 12; no completion checks).
- The YouTube video plays inside the page. `?t=90` starts it at 1:30. `?t=abc` and `?t=-5` play from the start.
- Every seeded lesson slug renders; an unknown slug returns 404.
- Labels are correct (`Lesson M.L`, "Module M of N"); previous / next cross module boundaries and hide at the course's first and last lesson.
- Notes tab shows the formatted notes; Lesson Content shows key points, pro tip only where set, and resources that open in a new tab.
- Signed out: no progress line in the sidebar card. Signed in: 0% complete.
- At 375px: sidebar above content with the outline collapsed and toggleable, no horizontal scroll.
- Type check, lint, and production build pass.

## Checks to run

1. `cd studio && npm run typegen`
2. `npx tsc --noEmit`
3. `npm run lint`
4. `npm run build` (new route, query change)
5. `npm run dev`, load a lesson, the same lesson with `?t=90`, an unknown slug

## Manual test steps

1. Run `npm run dev`.
2. Open `http://localhost:3000/lessons/nextjs-app-router-in-depth-fetching-in-server-components` beside `design/vertex-lesson.png`. Compare sidebar, header, video, tabs, and pager.
3. Press play: the video plays in the page without leaving the site.
4. Open the same URL with `?t=90`: playback starts at 1:30.
5. Click "Notes": the formatted notes appear. Click "Lesson Content" to return. Use the arrow keys on the tabs.
6. Click a resource tile: it opens in a new tab.
7. Click "Next Lesson" through the end of a module: it moves into the next module and the sidebar opens that module. On the course's last lesson, "Next Lesson" is gone.
8. In the sidebar, expand another module and click one of its lessons.
9. Signed out, the course card shows no progress; sign in and reload to see "0% complete".
10. Open `/lessons/does-not-exist`: 404 page.
11. Narrow to 375px: outline collapsed under "Module M of N"; tap to expand; nothing scrolls sideways.
