/**
 * One-off: replace the seed's invalid resource type "link" with a schema value.
 *
 *   npx sanity exec scripts/fix-resource-types.ts --with-user-token -- --dry-run
 *   npx sanity exec scripts/fix-resource-types.ts --with-user-token
 *
 * Idempotent: a second run finds nothing to change.
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2026-10-11" });
const dryRun = process.argv.includes("--dry-run");

// Reference guides rather than product documentation.
const GUIDE_HOSTS = new Set(["aws.amazon.com", "owasp.org"]);

export function resourceTypeFor(url: string) {
  try {
    return GUIDE_HOSTS.has(new URL(url).hostname) ? "guide" : "documentation";
  } catch {
    return null;
  }
}

type Lesson = { _id: string; resources: { _key: string; type: string; url: string }[] };

async function run() {
  const lessons = await client.fetch<Lesson[]>(
    `*[_type == "lesson" && "link" in resources[].type]{ _id, resources[]{ _key, type, url } }`,
  );

  const transaction = client.transaction();
  const counts: Record<string, number> = {};
  const skipped: string[] = [];

  for (const lesson of lessons) {
    const set: Record<string, string> = {};
    for (const resource of lesson.resources) {
      if (resource.type !== "link") continue;
      const type = resourceTypeFor(resource.url);
      if (!type) {
        skipped.push(`${lesson._id} ${resource._key} ${resource.url}`);
        continue;
      }
      set[`resources[_key=="${resource._key}"].type`] = type;
      counts[type] = (counts[type] ?? 0) + 1;
    }
    if (Object.keys(set).length > 0) transaction.patch(lesson._id, (patch) => patch.set(set));
  }

  console.log(`Lessons with "link" resources: ${lessons.length}`);
  console.log("New types:", counts);
  if (skipped.length > 0) console.log("Skipped (unparseable url):", skipped);

  if (dryRun || lessons.length === 0) {
    console.log(dryRun ? "Dry run, nothing written." : "Nothing to do.");
    return;
  }
  const result = await transaction.commit();
  console.log(`Committed transaction ${result.transactionId}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
