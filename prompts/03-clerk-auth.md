# 03 — Clerk Authentication

## Goal

Add Clerk authentication to Vertex with the Clerk CLI, linked to the existing Clerk application `app_3KXsalvyjehA09hih3r2l7fkr7y`. After this task a visitor can sign up, sign in, and see their account button in the shared header. Browsing stays public. Nothing else (progress, My Learning, analytics) is built here.

## Skills and docs read

- `AGENTS.md` (sections 2, 5, 6, 7, 12, 13, 14).
- The Clerk setup guide pasted by the user (CLI steps, matcher rule, critical rules).
- `.claude/skills/clerk-setup/SKILL.md`.
- `.claude/skills/clerk-nextjs-patterns/references/caching-auth.md`.
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`: in this Next.js version `middleware.ts` is deprecated and renamed to `proxy.ts`.
- `prompts/02-home-page.md`, decision 5: the header avatar is a placeholder that this task replaces.

## Code inspected

- `package.json`: Next.js 16.4.0, React 19.3.0, npm (`package-lock.json`). No `@clerk/*` package. No other auth provider, session code, or user records.
- No `proxy.ts`, `middleware.ts`, `components.json`, or `.env.example` at the root.
- `app/layout.tsx`: `<html>` and `<body>` with the two fonts, no providers.
- `components/ui/site-header.tsx`: bell button plus a neutral avatar placeholder with the comment "Placeholder until Clerk provides the signed in user."
- `components/ui/button.tsx`, `site-nav.tsx`: the primitives the signed out controls will reuse.
- `next.config.ts`: `cacheComponents: true` and `partialPrefetching: true` are on.
- `.gitignore`: `.env*` is ignored, which would also ignore `.env.example`.
- Environment: Clerk CLI 3.3.0 is installed globally. Node is v24.20.0.
- Environment files were not read, and will not be.

## Decisions and assumptions

1. **Location.** Built at the repo root, like prompts 01 and 02. The `web/` and `studio/` split stays a separate task.
2. **CLI flow.** `clerk update --yes`, then `clerk auth login`, then `clerk init --app app_3KXsalvyjehA09hih3r2l7fkr7y --no-skills`. `--no-skills` because the Clerk skills are already in this repo. No `--framework` or `--pm`, so detection picks Next.js and npm.
3. **Login needs you.** `clerk auth login` opens a browser. I run it and wait while you complete it. If it cannot open from my shell, I will ask you to run it in your own terminal.
4. **Init output is the baseline.** I keep what `clerk init` generates (SDK install, `ClerkProvider`, `proxy.ts`, any sign-in and sign-up routes, env keys) and only adjust it to fit this project and the rules below.
5. **`proxy.ts`, not `middleware.ts`.** If init writes `middleware.ts`, I rename it to `proxy.ts` per the Next.js 16 docs. The matcher includes `'/__clerk/:path*'` once, right after `'/(api|trpc)(.*)'`.
6. **What is protected.** Only `/my-learning` and its sub-paths, gated in `proxy.ts` with a path prefix check and `auth.protect()`. (Amended during the build: `createRouteMatcher` is deprecated in `@clerk/nextjs` 7.9, which now recommends an `auth.protect()` call in each protected page or route as well. The My Learning task must add that call in its page.) Everything else is public. The route does not exist yet, so signed out visitors are sent to sign in and signed in visitors get a 404 until its task lands. Later features add their own private routes here. Say so if you would rather protect nothing yet.
7. **`ClerkProvider` placement.** Inside `<body>`, wrapping `children`. The `<html>` and `<body>` classes stay as they are.
8. **Header controls.** In `SiteHeader`, the placeholder avatar becomes:
   - Signed in: Clerk `<UserButton />`, sized to match the placeholder (40px, 56px from `lg`), in the same position as the avatar in the design.
   - Signed out: "Sign in" (secondary or ghost style) and "Sign up" (primary) using the existing `Button` primitive inside `SignInButton` and `SignUpButton`.
   - The design only shows the signed in header, so the signed out pair has no reference. It reuses existing button styles and adds nothing new. The bell stays as it is.
9. **`cacheComponents` is on.** If the build reports uncached or request-time data outside a Suspense boundary because of the Clerk provider or header controls, I wrap the affected part in `<Suspense>` with a same-size fallback. I do not turn `cacheComponents` off.
10. **Sign-in surface.** Whatever init scaffolds (hosted pages or `app/sign-in`, `app/sign-up` routes) is used as is, with Clerk's default look. Styling Clerk components to the Vertex design is out of scope.
11. **Env.** Init writes the real keys to a local env file that stays ignored. I add a committed `.env.example` with empty `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` (plus any sign-in URL variables init adds), and a `!.env.example` line in `.gitignore`.
12. **Not using shadcn.** No `components.json`, so `@clerk/ui` and the shadcn theme are skipped.
13. **Out of scope.** Progress records, write tokens, My Learning content, webhooks, user sync to Sanity, organizations, and PostHog identify.

## Files to touch

| File | Change |
| --- | --- |
| `package.json`, `package-lock.json` | Add `@clerk/nextjs` (by `clerk init`) |
| `proxy.ts` | New. `clerkMiddleware`, protects `/my-learning`, matcher with `/__clerk/:path*` |
| `app/layout.tsx` | Wrap `children` in `ClerkProvider` inside `<body>` |
| `components/ui/site-header.tsx` | Replace the avatar placeholder with signed in and signed out controls |
| `app/sign-in/…`, `app/sign-up/…` | Only if `clerk init` generates them |
| `.env.example` | New. Canonical list of env names, no values |
| `.gitignore` | Allow `.env.example` |
| Local env file | Written by `clerk init`. Not committed, not read by me |

## Requirements

- Clerk CLI is up to date and authenticated before `clerk init` runs.
- The project is linked to `app_3KXsalvyjehA09hih3r2l7fkr7y`. No new Clerk application is created.
- `@clerk/nextjs` is the only Clerk package. No `@clerk/clerk-react`.
- `proxy.ts` exports `clerkMiddleware` as the default export, and its matcher skips Next.js internals and static files, and covers `'/(api|trpc)(.*)'` followed by `'/__clerk/:path*'`.
- Any server use of `auth()` is awaited.
- `/`, `/design-system`, and all other current routes load signed out with no redirect.
- The header shows Sign in and Sign up when signed out and the user button when signed in, with a visible focus state on each control, and no layout shift in the rest of the header.
- The home page and design system page look the same as before apart from the account control.

## Security considerations

- `CLERK_SECRET_KEY` stays server only. It is never imported into a client component, never prefixed with `NEXT_PUBLIC_`, and never printed or committed.
- Only `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` reaches the browser.
- Env files stay ignored by git. `.env.example` holds names only.
- Route protection lives in `proxy.ts`, not in client code. `<Show>` in the header is display only and is not treated as access control.
- No write token, progress write, or user data storage is introduced.
- I do not read or echo existing env files. I check key presence only through `clerk doctor`.

## Acceptance criteria

- `clerk doctor` reports no errors.
- Signed out: `/` shows Sign in and Sign up in the header. `/my-learning` redirects to sign in.
- Sign up with a new account works, and the user button appears in the header afterwards.
- Sign out from the user button returns the header to Sign in and Sign up.
- `git status` shows no env file with real keys staged or tracked.
- Type check, lint, and production build pass.

## Checks to run

1. `clerk doctor`
2. `npx tsc --noEmit`
3. `npm run lint`
4. `npm run build` (proxy, layout, and config-level code change)
5. `npm run dev`, then load `/` and `/design-system`

## Manual test steps

1. Run `npm run dev` and open `http://localhost:3000/`.
2. Confirm the header shows Sign in and Sign up on the right, next to the bell.
3. Click Sign up, create a test account, and finish verification.
4. Confirm you land back on the site and the header shows your profile button.
5. If a "Configure your application" callout appears, click it.
6. Open the profile button and sign out. The header returns to Sign in and Sign up.
7. While signed out, open `http://localhost:3000/my-learning`. You are sent to sign in.
8. Open `http://localhost:3000/design-system` and confirm it is unchanged.
