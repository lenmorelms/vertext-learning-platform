# 10 — Lesson `thumbnail` field and resource types

## Goal

Make the lesson schema match the seeded data, and the seeded data match the schema:

1. Rename the lesson image field from `poster` to `thumbnail`, so the 120 seeded thumbnails show up in the Studio and in queries.
2. Replace the invalid resource `type: "link"` (122 resources on 120 lessons) with valid schema values, so the Studio stops flagging them and the lesson page picks the right icon.

## Skills and docs read

- `AGENTS.md` (sections 2, 8, 12, 13).
- sanity-best-practices (schema, TypeGen) and sanity-migration: patch in place with a script and a transaction, check counts before and after, and keep the change idempotent.
- `prompts/04-sanity-content-model.md`, `prompts/05-seed-sanity.md`, `prompts/09-lesson-page.md`.

## Code and data inspected

- `studio/schemaTypes/documents/lesson.ts`: field `poster` (image with `alt`, hotspot), and preview `media: "poster"`.
- `sanity/queries.ts`: `LESSON_QUERY` selects `poster{...}`. Nothing else in `app/`, `components/`, `lib/` reads it.
- `studio/schemaTypes/objects/resource.ts`: `type` options are `documentation, guide, repository, article, download`.
- Live dataset: 0 drafts; 0 lessons with `poster`; 120 with `thumbnail.asset`; 120 lessons with a `link` resource.
- Seeded resources, all `type: "link"`, by title:
  - Official docs (`Next.js documentation`, `React documentation`, `React docs: Server Components`, `TypeScript handbook`, `Zod documentation`, `Claude API documentation`, `Sanity Context and content APIs`, `pandas documentation`, `PostgreSQL documentation`, `Kubernetes documentation`): 98 resources.
  - `AWS Architecture Center` (12) and `OWASP Top 10` (12): reference guides, not product docs.

## Decisions

1. **Rename in the schema, not the data.** The data already uses `thumbnail`, so renaming the field needs no content migration. The field keeps its title, description, hotspot, and `alt`. The preview uses `thumbnail`.
2. **Query.** `LESSON_QUERY` selects `thumbnail{ asset, alt, hotspot, crop }`. Regenerate `sanity.types.ts`.
3. **Resource types: fix the data, not the schema.** `link` describes every resource, so it carries no meaning as a type. Map by URL host:
   - `aws.amazon.com` and `owasp.org` → `guide` (24).
   - everything else → `documentation` (98).
   - Anything that does not match keeps its type and is reported, so nothing is guessed.
4. **Migration script** `studio/scripts/fix-resource-types.ts`, run with `npx sanity exec scripts/fix-resource-types.ts --with-user-token`. It reads lessons that have a `link` resource, builds one transaction of `set` patches on `resources[_key=="<key>"].type`, supports `--dry-run`, and is idempotent (a rerun finds 0 lessons). No token is written anywhere; it uses the CLI login.
5. **Seed file.** Update `studio/scripts/seed/seed.ndjson` with the same mapping (only the `type` values change, line order and other keys stay), so a re-import produces valid data. The `thumbnail` key there is already correct.
6. **Lesson page.** The resource tile icon logic (`repository` → GitHub, else document) stays as is; it now gets real types.
7. **Deploy.** `npm run deploy-schema` in `studio/` after the rename. The hosted Studio (`sanity deploy`) is still deferred to the search task, as agreed in prompt 04.

## Files to touch

| File | Change |
| --- | --- |
| `studio/schemaTypes/documents/lesson.ts` | `poster` → `thumbnail` (field + preview) |
| `studio/schema.json` | Re-extracted by TypeGen |
| `sanity/queries.ts` | `thumbnail` in `LESSON_QUERY` |
| `sanity.types.ts` | Regenerated |
| `studio/scripts/fix-resource-types.ts` | New. One-off migration |
| `studio/scripts/seed/seed.ndjson` | `link` → `documentation` / `guide` |

## Security considerations

- The migration runs locally through the authenticated Sanity CLI session (`--with-user-token`); no write token is added to the repo or to the web app.
- Writes only `resources[].type` on lesson documents in the private `production` dataset, in one transaction, so it either fully applies or not at all.
- No web app runtime change beyond a renamed projection field.

## Acceptance criteria

- Dataset: `count(*[_type=="lesson" && "link" in resources[].type]) == 0`; 98 `documentation` and 24 `guide` resources; 120 lessons still have `thumbnail.asset`.
- `seed.ndjson` has no `"type":"link"`, still 141 lines, and differs from before only in those values.
- `LESSON_QUERY` returns a non-null `thumbnail` for seeded lessons.
- Studio shows the lesson thumbnail in the document list and form, and no validation warning on resources.
- Type check, lint, and build pass. Schema deployed.

## Checks to run

1. `npx sanity exec scripts/fix-resource-types.ts --with-user-token -- --dry-run`, then without `--dry-run`, then again (expect 0).
2. GROQ counts from the acceptance criteria.
3. `npm run typegen` and `npm run deploy-schema` in `studio/`.
4. In the web root: `npx tsc --noEmit`, `npm run lint`, `npm run build`.

## Manual test steps

1. `cd studio && npm run dev`, open Lessons: each lesson shows its thumbnail in the list and in the Video tab.
2. Open a lesson's Content tab: resources show "Documentation" or "Guide", with no warning.
3. `npm run dev` in the root, open `/lessons/nextjs-app-router-in-depth-fetching-in-server-components`: the page renders as before.
4. Open a lesson from the cloud architecture or security course: its resource is a guide tile.
