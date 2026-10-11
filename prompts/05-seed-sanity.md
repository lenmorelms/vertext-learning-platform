# 05 Seed Sanity from the provided seed files

## Goal

Load the provided seed content into the Sanity dataset with the Sanity CLI import, then verify the document counts. Generate no new content and leave both seed files byte for byte unchanged.

## Skills read

- `AGENTS.md` (sections 2, 8, 9, 12, 13)
- sanity-best-practices is not needed beyond the CLI import; no schema, GROQ, or code changes are made.

## What I inspected

- `studio/scripts/seed/seed.ndjson`: 141 lines, 141 unique `_id`s, 0 parse errors, 0 drafts.
  - 6 `category`, 5 `instructor`, 10 `course`, 120 `lesson`.
  - 140 references, all resolve to ids inside the file.
  - 135 `_sanityAsset` image markers (`image@https://...`) for instructor photos, course covers, and lesson thumbnails. The CLI downloads and uploads these during import.
  - Field names match the deployed schema in `studio/schemaTypes` (`category`, `instructor`, `course`, `lesson`, plus `module`, `learningOutcome`, `resource` objects).
- `studio/scripts/seed/videos.json`: an object of 120 entries keyed by lesson slug, each `{ id, title, channel, duration, query }` describing the YouTube video picked for that lesson. It is not a set of Sanity documents and cannot be passed to `sanity dataset import`.
  - All 120 keys match a lesson slug, and all 120 lesson `videoUrl` values already contain the matching video id. Its content is therefore already carried into the dataset through `seed.ndjson`.
- `studio/.env`: project `6hua1jt0`, dataset `production`.
- Sanity CLI `6.7.2`, logged in, `production` is the only dataset.
- Live dataset today: 0 documents, 0 image assets.

## Decisions and assumptions

- Import only `seed.ndjson`. `videos.json` is the source list for the later transcript and chapter ingestion (AGENTS.md section 9), and there is no `video` schema type yet, so nothing is created from it now. It is used here only as a cross check on lesson `videoUrl`s.
- Plain import with no `--replace` or `--missing`, since the dataset is empty. If the import is interrupted partway, rerun with `--replace` so it is idempotent on the same ids.
- No tokens added to the repo. The CLI uses the existing login session.
- No files are created or changed besides this prompt. The seed files are read only inputs, confirmed by comparing SHA-256 hashes before and after.

## Files touched

- `prompts/05-seed-sanity.md` (this file). Nothing else.

## Requirements

1. Record SHA-256 of both seed files.
2. From `studio/`, run `npx sanity dataset import scripts/seed/seed.ndjson production`.
3. Query the dataset and compare counts with the file.
4. Recompute the hashes and confirm they are unchanged.

## Security

- Writes go to the private `production` dataset of project `6hua1jt0` through the authenticated CLI session only.
- No token is written to disk, logged, or exposed to the web app.
- The import fetches images from `i.ytimg.com` and `picsum.photos` (plus any other hosts named in the file's asset markers) and stores them as Sanity assets.

## Acceptance criteria

- Counts in the dataset: 6 `category`, 5 `instructor`, 10 `course`, 120 `lesson`, 141 content documents in total.
- Every one of the 141 seed `_id`s exists in the dataset.
- One `sanity.imageAsset` per unique asset source URL in the file, and no image field left without an asset reference.
- 0 broken references.
- 120 lessons with a `videoUrl`, each matching its `videos.json` entry.
- Seed file hashes identical before and after.

## Checks

- `npx sanity documents query` for counts by type, missing ids, images without assets, and dangling references.
- No type check, lint, or build: no code, routes, or config change.

## Manual test steps

1. `cd studio && npm run dev`, open the Studio, and confirm Courses, Lessons, Instructors, and Categories are populated.
2. Open a course and confirm its modules list lessons and the cover image renders.
3. Open a lesson and confirm the thumbnail, video URL, notes, key points, and resources are filled.
4. In Vision, run `count(*[_type == "lesson"])` and expect `120`.
