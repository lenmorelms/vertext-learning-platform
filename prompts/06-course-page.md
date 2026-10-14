# 06 — Course Page

## Goal

Turn `design/vertex-course.png` into the course detail route (`/courses/[slug]`), reading the seeded course from Sanity through the existing server only data layer. The page has the shared header, breadcrumbs, the hero (cover, popular pill, title, summary, meta row, Continue Learning and Bookmark), the "What you'll learn" grid, the "Course Content" module list, and the bottom progress bar.

## Skills and docs read

- `AGENTS.md` (sections 2, 3, 5, 7, 8, 12, 13, 14).
- `prompts/01-design-system.md`, `prompts/02-home-page.md` (scale rules and primitives), `prompts/04-sanity-content-model.md`, `prompts/05-seed-sanity.md`.
- sanity-best-practices: the existing `sanityFetch` + `defineQuery` + TypeGen setup already follows it. No query or schema change is needed.
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/dynamic-routes.md` (with Cache Components, use `generateStaticParams` so params are known at build; `params` is a Promise).

## Code inspected

- `sanity/queries.ts`: `COURSE_QUERY` already returns everything the page needs: title, summary, cover, level, popular, studentCount, learningOutcomes, instructor, moduleCount, durationSeconds, and modules with lesson outlines and per module duration.
- `sanity/data.ts`: `getCourseBySlug`, `getCourses`. `sanity/lib/image.ts`: `urlFor`. `sanity.types.ts`: `COURSE_QUERY_RESULT`.
- `next.config.ts`: `cacheComponents: true`, `cdn.sanity.io` allowed for `next/image`.
- `components/ui/*`: `SiteHeader`, `Breadcrumbs`, `Button` (primary, tertiary, `xl`), `ProgressBar`, icons (`BarChartIcon`, `ClockIcon`, `DocumentIcon`, `BookmarkIcon`, `ChevronDownIcon`, `ArrowRightIcon`). No icons for the outcome set or for students.
- `app/page.tsx`: page frame (canvas, hatch, 1440px column) and the decorative bars, which are inline there.
- Seed data (live dataset): 10 courses, each with 4 modules of 3 lessons, 4 learning outcomes. Covers are 1600×900 photos from picsum. Outcome icons used: `layers, workflow, gauge, rocket, shield, puzzle, code, sparkles`. `workflow` and `puzzle` are **not** in the schema's icon list.
- `design/vertex-lesson.png`: the lesson page breadcrumb is All Courses › course › module › lesson.

## Decisions and assumptions

1. **Route.** `app/courses/[slug]/page.tsx`, with `generateStaticParams` from `getCourses()` and `notFound()` for unknown slugs. `generateMetadata` sets title and description from the course.
2. **Lesson links** go to `/lessons/<lessonSlug>` (lesson slugs are unique, and the lesson derives its course by reverse reference). That route arrives with the lesson page task and 404s until then. "All Courses" links to `/courses` (catalog task, also 404 for now).
3. **Scale.** Same as the home page: the 1024px reference maps to the 1440px column, type at about 1.2x, snapped to tokens and the 4px grid.
4. **Header.** `SiteHeader` with no active link, as in the reference.
5. **Cover.** The Sanity cover rendered with `next/image` + `urlFor`, cropped to the reference's portrait-square box (respecting hotspot), rounded, with `alt` from the document.
6. **Meta row.** Level (capitalised), total duration (`18h 24m`), `N modules`, and `2.1k students` (compact count). Formatting helpers go in a new `lib/format.ts`.
7. **Learning outcomes.** Each outcome's `icon` string maps to a thin line icon in primary. New icons for `layers, database, gauge, cloud, code, shield, rocket, sparkles`, plus `workflow` and `puzzle` because the seed uses them. Unknown values fall back to `layers`. The grid is two columns on desktop.
8. **Course Content.** Header row shows `N modules • duration`. Each module is a row with its derived number, title, summary, duration, and a chevron. Rows are native `<details>`, so they expand without JavaScript to list that module's lessons (`Lesson 1.2`, title, duration, a "Free preview" label when flagged), each linking to the lesson. The first 6 modules show; when there are more, a "Show all N modules" button (small client component) reveals the rest. The seed has 4 modules per course, so the button will not appear with seeded data.
9. **Progress.** Progress tracking is a later task with no backend yet, so no percentage is invented. The bottom progress card renders for signed-in learners only (Clerk `Show`, inside Suspense) at **0% complete**. The progress task replaces that value. Signed-out visitors don't see the card.
10. **Continue Learning** (hero and progress card) links to the course's first lesson until resume position exists. The label matches the reference.
11. **Bookmark** is presentational, like the bell: a button with no behavior and no persistence. No backend exists for it, and AGENTS.md does not list bookmarks as a feature.
12. **Decorative bars.** Extract the bars from `app/page.tsx` into `components/ui/decorative-bars.tsx` and reuse them behind the progress card. The home page renders identically.
13. **Responsive.** Desktop matches the reference. Below `lg` the cover stacks above the text, outcomes go to one column, module durations stay right aligned, and the progress card stacks its parts. No horizontal scroll at 375px.
14. **No query, schema, or TypeGen changes.**

## Files to touch

| File | Change |
| --- | --- |
| `app/courses/[slug]/page.tsx` | New. Course page (server component), static params, metadata |
| `components/course/learning-outcomes.tsx` | New. "What you'll learn" grid with the icon map |
| `components/course/course-content.tsx` | New. Module list (server rendered `<details>` rows) |
| `components/course/show-all-modules.tsx` | New. Client toggle that reveals modules after the 6th |
| `components/course/progress-card.tsx` | New. Bottom progress card (signed-in only) |
| `components/ui/decorative-bars.tsx` | New. Bars extracted from the home page |
| `components/ui/icons.tsx` | Outcome icons, `UsersIcon` |
| `lib/format.ts` | New. `formatDuration`, `formatCompactCount`, `capitalize` |
| `app/page.tsx` | Use `DecorativeBars` (no visual change) |

## Requirements

### Frame and header

- Same canvas, hatch, and 1440px bordered column as the home page. `SiteHeader` at the top.

### Breadcrumbs

- "All Courses" (link to `/courses`) › course title (current page).

### Hero

- Left: cover image, about 392px wide, rounded corners.
- Right: "POPULAR" pill when `popular` is true (uppercase, letter spaced, primary text on primary tint, faint primary border), the `h1` course title in Playfair Display (about 64px on desktop), the summary in neutral 500 at about 22px / 40px, the meta row with icons (bar chart, clock, document, users), then the primary "Continue Learning →" button and the tertiary "Bookmark" button with a bookmark icon.

### What you'll learn

- A white, bordered, rounded panel with the serif heading "What you'll learn" and a 2×2 grid of outcome cards: icon on the left, serif title, description in neutral 500.

### Course Content

- Serif heading "Course Content" with `N modules • 18h 24m` on the right.
- A bordered, rounded list. Each row: a circled number, title in neutral 900, summary in neutral 500, duration, chevron (rotates when open). Expanded rows list lessons with label, title, duration, and free preview label, each a link.
- "Show all N modules ⌄" pill button centered on the list's bottom edge, only when there are more than 6 modules.

### Progress card

- Signed-in only. A white bordered card at the bottom: "Your Progress" label, "0% complete", a progress bar, and a primary "Continue Learning →" button. Decorative bars behind it at the column's bottom edge.

### General

- Match the reference for layout, spacing, type, color, and states. No restyling.
- One `h1`. Visible focus on all controls. Decorative elements `aria-hidden`.
- Server components throughout except the show-all toggle (and Clerk's own components).

## Security considerations

- All Sanity reads stay in server components through `sanity/data.ts` (`server-only`), using the server only read token. Nothing new reaches the browser except rendered HTML and the module outline passed to the toggle (titles, slugs, durations: public course content).
- Image URLs come from `cdn.sanity.io` via `urlFor`. No token in image URLs.
- The slug param is only used as a GROQ parameter (`$slug`), never interpolated into the query.
- No writes, no new env vars, no new API routes. Progress and bookmark do not persist anything.

## Acceptance criteria

- `/courses/nextjs-app-router-in-depth` renders the seeded course and matches `design/vertex-course.png` side by side at desktop width (with seeded text and 4 modules instead of the mock's 12).
- Every seeded course slug renders; an unknown slug returns the 404 page.
- Module rows expand to show their lessons with correct `Lesson M.L` labels and durations; durations add up to the header total.
- Popular pill shows only on popular courses. Outcome icons render for every seeded value, including `workflow` and `puzzle`.
- Signed out: no progress card. Signed in: progress card at 0%.
- `/` looks unchanged.
- No horizontal scroll at 375px.
- Type check, lint, and production build pass.

## Checks to run

1. `npx tsc --noEmit`
2. `npm run lint`
3. `npm run build` (new route)
4. `npm run dev`, load `/courses/nextjs-app-router-in-depth`, an unknown slug, and `/`

## Manual test steps

1. Run `npm run dev`.
2. Open `http://localhost:3000/courses/nextjs-app-router-in-depth` beside `design/vertex-course.png`. Compare breadcrumbs, hero, outcomes, and course content.
3. Click a module row. It expands to list three lessons labelled `Lesson N.1`–`N.3` with durations. Click again to collapse.
4. While signed out, confirm no progress card. Sign in and reload: the card shows "0% complete" and Continue Learning.
5. Hover Continue Learning: it points to `/lessons/<first-lesson-slug>` (404 until the lesson page task).
6. Open `/courses/react-performance-engineering` (not popular): no POPULAR pill.
7. Open `/courses/does-not-exist`: 404 page.
8. Narrow to 375px: cover stacks above the text, outcomes stack, nothing scrolls sideways.
9. Open `/` and confirm it is unchanged.
