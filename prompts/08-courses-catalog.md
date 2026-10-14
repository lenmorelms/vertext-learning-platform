# 08 — All Courses page

## Goal

Add the catalog route `/courses`: a simple page listing every seeded course from Sanity. The user asked for it to be simple, and there is no reference image, so it reuses the home page's "All Courses" section look and nothing new is designed.

## Skills and docs read

- `AGENTS.md` (sections 3, 5, 7, 13, 14).
- `prompts/02-home-page.md`, `prompts/07-home-courses-from-sanity.md`.

## Code inspected

- `sanity/queries.ts` `COURSES_QUERY` + `getCourses()`: every course ordered by title with cover, summary, level, moduleCount, durationSeconds. No query change needed.
- `app/page.tsx`: the All Courses heading style and the card grid (stacked `CourseCard` with the cover as icon).
- `components/ui/site-header.tsx`: supports `active="courses"`.
- `components/ui/breadcrumbs.tsx`, `components/ui/decorative-bars.tsx`.

## Decisions and assumptions

1. **Layout.** Same frame as the other pages (canvas, 1440px column, `SiteHeader` with Courses active). Then the serif "All Courses" heading (`h1`), a one line count "10 courses", and the card grid (3 / 2 / 1 columns). Decorative bars at the bottom like the home page.
2. **Shared grid.** Move the home page's card grid into `components/course/course-grid.tsx` and use it on both pages, so the cards stay identical. The home page renders the same as now.
3. **All courses, ordered by title** (existing query). No filters, search, sorting, or pagination: "simple".
4. **Progress marks** on the catalog (AGENTS.md section 7) come with the progress task.
5. **Empty state.** If the dataset has no courses, show "No courses yet." instead of the grid.

## Files to touch

| File | Change |
| --- | --- |
| `app/courses/page.tsx` | New. Catalog page |
| `components/course/course-grid.tsx` | New. Grid of stacked course cards |
| `app/page.tsx` | Use `CourseGrid` (no visual change) |

## Security considerations

- Server component reads through the `server-only` data layer with the server only token. Only rendered HTML and `cdn.sanity.io` URLs reach the browser. No request input reaches a query.

## Acceptance criteria

- `/courses` lists all 10 seeded courses; each card opens its course page.
- The header's Courses link is active.
- `/` looks unchanged; "View all courses", "Explore Courses", and the course page's "All Courses" breadcrumb now resolve.
- Type check, lint, and build pass.

## Checks to run

1. `npx tsc --noEmit`
2. `npm run lint`
3. `npm run build`
4. Load `/courses` and `/` on the dev server

## Manual test steps

1. Open `http://localhost:3000/courses`. Ten course cards in a three column grid, Courses highlighted in the header.
2. Click a card: its course page opens. Click "All Courses" in the breadcrumb: back to the catalog.
3. From `/`, click "View all courses" and "Explore Courses": both land on `/courses`.
4. Narrow the window: two columns, then one.
