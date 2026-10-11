# 02 — Vertex Home Page

## Goal

Turn `design/vertex-home.png` into the home route (`/`): the shared site header, the hero with the search field, the "All Courses" row of three course cards, the "added every week" strip, and the decorative orange bars at the bottom. It replaces the create-next-app placeholder in `app/page.tsx`.

## Skills and docs read

- `AGENTS.md` (sections 2, 3, 5, 7, 13, 14).
- `prompts/01-design-system.md`, for the tokens and primitives this page composes.
- `node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md` (SVG sources are served unoptimized automatically when `src` ends in `.svg`).
- No Sanity, Clerk, PostHog, or search skills apply. This task adds no data access, auth, analytics, or server code.

## Code inspected

- `app/page.tsx`: still the scaffold placeholder.
- `app/layout.tsx`: Inter and Playfair Display wired, `body` is a flex column.
- `app/globals.css`: `@theme` tokens (primary, neutral, type scale, radius, shadow).
- `components/ui/*`: `SiteNav`, `Logo`, `Button`, `Input`, `CourseCard`, icons. `cn` is a plain joiner, so conflicting utilities cannot be overridden through `className`.
- `app/design-system/page.tsx`: uses the warm surface colors `#F9F5F2`, `#FCF8F7`, `#F4EEEC` as arbitrary values.
- `design/vertex-course.png`: confirms the header (logo, Courses, My Learning, bell, avatar) is shared across pages.
- `package.json`: no Sanity, Clerk, or PostHog packages installed yet. The repo is still one Next.js app at the root.

## Decisions and assumptions

1. **Location.** Built in place at the repo root (`app/`, `components/`), same as prompt 01. The `web/` and `studio/` split stays a separate task.
2. **Scale.** The reference is a 1024px wide image whose content column is 964px. I map it to a 1440px column (`max-w-[1440px]`, per the user), with type sized at about 1.2x and snap sizes to the design tokens and the 4px grid where they are close. Values that the type scale does not cover (the 72px hero heading, the 96px search field) are set explicitly.
3. **Course data is placeholder.** Sanity does not exist yet, so the three courses from the reference (Next.js for Production, Docker Essentials, TypeScript Deep Dive) are a typed constant in `app/page.tsx`. The content model task replaces it with a server side Sanity fetch. Nothing else on the page is data.
4. **Course icons** are three local SVG files in `public/course-icons/`, rendered with `next/image`, matching the eventual shape (an image per course from Sanity).
5. **Header is a shared component** (`components/ui/site-header.tsx`): `SiteNav` plus a notifications bell and an avatar. The bell is presentational (AGENTS.md section 7). The avatar is a neutral placeholder circle with the user icon, because Clerk is not installed. The auth task swaps it for the Clerk user button. No portrait photo is added.
6. **Course card.** The home card (icon on top, serif title, divider, three meta items) differs from the design system's `CourseCard` (icon beside the text). The home image is the source of truth for this page, so `CourseCard` gets a `layout="stacked"` option and the existing horizontal layout stays the default, leaving `/design-system` unchanged.
7. **Small additions to primitives**, all backward compatible:
   - `Button`: an `xl` size (64px tall) for the hero call to action. Height moves from the base class into the size map.
   - `Input`: a `fieldSize="lg"` option (96px tall, larger icon, text, and shortcut hint) for the hero search field.
   - `SiteNav`: a `size="lg"` option (larger logo, 16px links) and tighter gaps below `sm`.
   - `icons.tsx`: `ArrowRightIcon` and `StarIcon`.
   - `globals.css`: the three warm surface colors become tokens (`canvas`, `surface`, `line`). `/design-system` keeps its arbitrary values.
8. **Search field behavior.** Search itself is a later task. The field is a plain GET form to `/search?q=…`, so it works without JavaScript and needs no rewrite later. A tiny client component focuses it on `⌘K` / `Ctrl+K`, because the reference shows that hint. No request, token, or LLM call is made from this page.
9. **Links.** Courses, Explore Courses, and View all courses go to `/courses`. My Learning goes to `/my-learning`. Cards go to `/courses/<slug>`. These routes and `/search` do not exist yet and return 404 until their tasks land.
10. **Decoration.** The diagonal hatch outside the column and the orange bars at the bottom are pure CSS, `aria-hidden`, and do not affect layout.
11. **Responsive.** Desktop matches the reference. Below `lg` the cards go to two columns, then one. The hero heading, subtitle, button, and search field scale down. The header links wrap under the logo on narrow screens. No horizontal scroll at 375px.

## Files to touch

| File | Change |
| --- | --- |
| `app/page.tsx` | Replace the placeholder with the home page |
| `app/globals.css` | Add `canvas`, `surface`, `line` color tokens |
| `components/ui/site-header.tsx` | New. Shared header: nav, bell, avatar placeholder |
| `components/ui/site-nav.tsx` | `size` option, responsive gaps |
| `components/ui/button.tsx` | `xl` size |
| `components/ui/input.tsx` | `fieldSize="lg"`, forwarded ref id for the shortcut |
| `components/ui/cards.tsx` | `CourseCard` `layout="stacked"` |
| `components/ui/icons.tsx` | `ArrowRightIcon`, `StarIcon` |
| `components/home/search-shortcut.tsx` | New. Client component, focuses the search field on `⌘K` / `Ctrl+K` |
| `public/course-icons/{nextjs,docker,typescript}.svg` | New. Course icons |

## Requirements

### Page frame

- Canvas `#F9F5F2` with a faint diagonal hatch. Centered column, max 1440px, surface `#FCF8F7`, 1px side borders `#F4EEEC`, full viewport height.

### Header

- 112px tall on desktop, 48px horizontal padding (64px from `xl`), bottom border.
- Left: logo, then Courses and My Learning. Neither is active on the home page.
- Right: bell icon button with an accessible label, then a 56px round avatar placeholder.

### Hero (centered)

- Pill label "INTELLIGENT LEARNING": uppercase, letter spaced, primary text on a primary tint with a primary border.
- Heading "Search your learning / in plain English." in Playfair Display, medium weight, 72px / 88px on desktop, two lines.
- Subtitle "Vertex understands what you want to learn and finds the exact lessons across all your courses." in Inter, 22px / 40px, neutral 500, two lines on desktop.
- Primary button "Explore Courses" with a trailing arrow, 64px tall, soft shadow.
- Search field: max 1112px wide (896px below `xl`), 96px tall, white, bordered, leading search icon, placeholder "Ask anything about your learning...", trailing `⌘ K` hint.
- A full width divider closes the hero.

### All Courses

- Row: serif "All Courses" heading on the left, "View all courses →" text link in primary on the right.
- Three equal cards: icon tile (88px), serif title, summary in neutral 500, then a divider and a meta row with level, duration, and module count, each with its icon.
  - Next.js for Production · "Build scalable, high-performance web applications with Next.js." · Intermediate · 18h 24m · 12 modules
  - Docker Essentials · "Containerize applications and streamline your development workflow." · Beginner · 10h 12m · 8 modules
  - TypeScript Deep Dive · "Go beyond the basics and write safer, more expressive code." · Intermediate · 14h 36m · 10 modules

### Closing strip and decoration

- A centered star icon and "New courses and lessons added every week." with a hairline rule on each side.
- Two clusters of vertical bars at the bottom of the column, fading from primary at the base to transparent at the top, with a gap between the clusters.

### General

- Match the reference for layout, spacing, type, color, and states. No restyling.
- Visible focus state on every interactive element. One `h1`. Decorative elements hidden from assistive tech.
- Server components throughout, except the one shortcut listener.

## Security considerations

- No tokens, env values, data access, or network calls are introduced. The browser still holds no secret and calls nothing.
- The search form only navigates to `/search?q=…`. The query is not rendered or evaluated on this page.
- Course icons are local, trusted SVG files served as static images through `<img>`, never inlined from user content.
- The avatar is a placeholder and reads no user data.

## Acceptance criteria

- `/` matches `design/vertex-home.png` side by side at desktop width: header, hero, search field, three cards, strip, bars.
- `/design-system` looks the same as before.
- `⌘K` / `Ctrl+K` focuses the search field. Submitting it navigates to `/search?q=<text>`.
- No horizontal scroll at 375px, and the cards stack in one column.
- Type check, lint, and production build pass.

## Checks to run

1. `npx tsc --noEmit`
2. `npm run lint`
3. `npm run build` (a route changed)
4. `npm run dev`, then load `/` and `/design-system`

## Manual test steps

1. Run `npm run dev`.
2. Open `http://localhost:3000/` and put `design/vertex-home.png` beside it. Compare the header, hero, search field, cards, strip, and bottom bars.
3. Press `Ctrl+K` (or `⌘K`). The search field takes focus with an orange border.
4. Type a query and press Enter. The URL becomes `/search?q=…` (a 404 for now).
5. Hover a course card and the Explore Courses button. Tab through the page and confirm a visible focus ring on every control.
6. Narrow the window to 375px. The header wraps, the cards stack, and nothing scrolls sideways.
7. Open `http://localhost:3000/design-system` and confirm it is unchanged.
