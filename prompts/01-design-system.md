# 01 — Vertex Design System

## Goal

Turn `design/vertex-designsystem.png` into code: design tokens in Tailwind, the two brand fonts, and the small set of presentational UI primitives the reference shows (sections 01–13). Later page work (home, course, lesson, search) composes these instead of restyling.

## Skills and docs read

- `AGENTS.md` (sections 2, 3, 5, 6, 13, 14).
- `node_modules/next/dist/docs/01-app/01-getting-started/13-fonts.md` (`next/font/google`, variable fonts).
- `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md` (Tailwind v4, global CSS).
- No Sanity, Clerk, or search skills apply. This task has no data, auth, or server code.

## Code inspected

- `package.json`: Next 16.4.0, React 19.3.0, Tailwind v4 through `@tailwindcss/turbopack` (wired in `next.config.ts`, no PostCSS config).
- `app/globals.css`: scaffold tokens (`--background`, `--foreground`, Geist fonts, dark mode media query).
- `app/layout.tsx`: Geist and Geist Mono via `next/font/google`, default metadata.
- `app/page.tsx`: create-next-app placeholder.
- `tsconfig.json`: `@/*` maps to the repo root.
- No `components/`, `lib/`, or `prompts/` folders exist yet.

## Decisions and assumptions

1. **Location.** The repo is still a single Next.js app at the root, not yet the two workspaces from AGENTS.md section 5. I build in place (`app/`, `components/`). Splitting into `web/` and `studio/` is a separate task and will be a plain move.
2. **Tokens live in `app/globals.css`** in a Tailwind v4 `@theme` block, so they become utilities (`bg-primary-500`, `text-heading-1`, `rounded-md`, `shadow-lg`). No JS token file.
3. **Light only.** The reference has no dark theme, so the scaffold's `prefers-color-scheme: dark` block is removed.
4. **Radius and shadow override Tailwind's defaults** with the reference values, so `rounded-md` means 12px everywhere. Spacing needs no change: the 4px base unit is already Tailwind's default.
5. **Fonts.** Playfair Display (display styles) and Inter (everything else) through `next/font/google` as variable fonts, exposed as `font-display` and `font-sans`. Geist is removed.
6. **Icons are local inline SVGs** (`components/ui/icons.tsx`), 24x24 grid, 2px stroke, round caps, with the outline and filled sets shown in section 06, plus the few extra glyphs the buttons, cards, and status rows need. No icon dependency is added, because AGENTS.md section 6 lists none.
7. **Components are presentational server components** taking plain props. No data fetching, no client state, no `"use client"`. Select is a styled native `<select>`. Pagination and breadcrumbs render links.
8. **Colors outside the palette** that the reference still uses (primary hover shade, the Lesson badge's blue tint, the Completed green) are sampled from the image and added as a few named tokens. The image is 1024px wide, so these are close approximations.
9. **Logo** is recreated as an inline SVG mark plus the "Vertex" wordmark, matched by eye to the reference.
10. **A `/design-system` preview route** renders every token and component in the reference's layout, as the surface for visual comparison. It is not linked from anywhere and can be deleted later.
11. `app/page.tsx` is left alone. The home page has its own reference image and its own task.

## Files to touch

| File | Change |
| --- | --- |
| `app/globals.css` | Replace scaffold tokens with the `@theme` tokens below, base body styles |
| `app/layout.tsx` | Swap Geist for Inter and Playfair Display, set Vertex metadata |
| `lib/cn.ts` | New. Tiny class name joiner |
| `components/ui/icons.tsx` | New. Icon set |
| `components/ui/logo.tsx` | New. Vertex mark and wordmark |
| `components/ui/button.tsx` | New. Primary, secondary, tertiary, text variants |
| `components/ui/input.tsx` | New. Search / text input with leading icon and shortcut hint |
| `components/ui/select.tsx` | New. Styled native select |
| `components/ui/badge.tsx` | New. Video, lesson, popular |
| `components/ui/status.tsx` | New. In progress, completed, now playing, locked |
| `components/ui/progress-bar.tsx` | New. Bar with percent label |
| `components/ui/cards.tsx` | New. Course, lesson (video), lesson (lesson), resource |
| `components/ui/breadcrumbs.tsx` | New |
| `components/ui/pagination.tsx` | New |
| `components/ui/site-nav.tsx` | New. Logo plus nav links with active state |
| `app/design-system/page.tsx` | New. Preview route |

## Requirements

### Tokens

- **Primary:** 500 `#F97316`, 400 `#FB923C`, 300 `#FDBA74`, 200 `#FED7AA`, 100 `#FFEEE5`.
- **Neutral:** 900 `#0F172A`, 700 `#334155`, 500 `#64748B`, 300 `#CBD5E1`, 200 `#E2E8F0`, 100 `#F1F5F9`, 50 `#FAFAFC`, white `#FFFFFF`.
- **Type scale** (size / line height, weight, font):
  - Display 1: 48 / 56, bold, Playfair Display
  - Display 2: 36 / 44, bold, Playfair Display
  - Heading 1: 28 / 36, semibold, Inter
  - Heading 2: 22 / 30, semibold, Inter
  - Heading 3: 18 / 26, medium, Inter
  - Body Large: 16 / 24, regular, Inter
  - Body: 14 / 20, regular, Inter
  - Small: 12 / 16, regular, Inter
- **Spacing:** 4, 8, 12, 16, 24, 32, 40, 48, 64 px on the 4px base (Tailwind `1, 2, 3, 4, 6, 8, 10, 12, 16`).
- **Radius:** xs 4, sm 8, md 12, lg 16, xl 24, full.
- **Shadows** on `rgba(15, 23, 42, a)`: sm `0 1px 2px 0` a 0.05, md `0 4px 12px -2px` a 0.08, lg `0 12px 24px -4px` a 0.10, xl `0 20px 40px -8px` a 0.12.

### Components

- **Button:** height 44px, radius 12px, Inter medium 14–16px, horizontal padding 16px (lg) or 12px (md). Variants primary (solid orange, white text), secondary (orange outline and text), tertiary (neutral outline, dark text, trailing icon), text (orange text, trailing icon). States default, hover, disabled, matching the reference grid. Renders a `<button>`, or a link when given `href`.
- **Input:** height 44px, radius 12px, 1px `#E2E8F0` border, 16px horizontal padding, focus border `#FB923C`. Optional leading icon and trailing shortcut hint.
- **Select:** same field spec, trailing chevron.
- **Badge:** uppercase, letter spaced, small, tinted background. Video and popular in primary, lesson in the sampled blue tint.
- **Status:** icon plus label for in progress, completed, now playing, locked.
- **Progress bar:** neutral track, primary fill, "35% complete" label, with `role="progressbar"` and aria values.
- **Cards:** course (icon tile, title, summary, level / duration / module count meta), lesson video (badge, title, description, lesson label and length, "Watch from mm:ss"), lesson (badge, title, description, module label, "View lesson"), resource (file icon, title, description, type and size, open link).
- **Navigation:** logo, links with the active link in primary; breadcrumbs with chevron separators; pagination with previous / next, numbered pages, ellipsis, and an outlined current page.
- **Icons:** bell, search, play circle, document, bookmark, bar chart, clock, user, chevron right, in outline and filled, `currentColor`, sized by prop.

### General

- Match the reference exactly for layout, spacing, type, color, and states. No restyling.
- The preview page is responsive: section grids stack to one column on mobile, the desktop layout matches the reference.
- Focus states are visible on every interactive element. Icon-only controls carry an accessible label.

## Security considerations

- No tokens, env values, data access, or network calls are introduced. Nothing here crosses a server and client boundary.
- Fonts are self-hosted by `next/font`, so the browser makes no request to Google.
- Link components that open a new tab set `rel="noopener noreferrer"`.

## Acceptance criteria

- Every color, type, radius, and shadow token above exists as a Tailwind utility and resolves to the listed value.
- Playfair Display and Inter load with no layout shift, and Geist is gone.
- `/design-system` shows sections 01–13 and matches the reference side by side at desktop width.
- Buttons show the correct default, hover, and disabled styles in all four variants.
- The input border turns `#FB923C` on focus.
- The page has no horizontal scroll at 375px wide.
- Type check, lint, and production build pass.

## Checks to run

1. `npx tsc --noEmit`
2. `npm run lint`
3. `npm run build` (layout and a new route change)
4. `npm run dev`, then load `/design-system`

## Manual test steps

1. Run `npm run dev`.
2. Open `http://localhost:3000/design-system`.
3. Put `design/vertex-designsystem.png` beside it and compare each numbered section.
4. Hover each button variant, and confirm the disabled row does not react.
5. Click into the search input and confirm the orange focus border.
6. Tab through the page and confirm a visible focus ring on every control.
7. Narrow the window to 375px and confirm sections stack with no horizontal scroll.
8. Open `http://localhost:3000/` and confirm the placeholder home page still renders.
