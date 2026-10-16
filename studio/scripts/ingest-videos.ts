/**
 * Offline: build one `video` document per unique lesson video, with chapters
 * (the table of contents) and the transcript in short timestamped chunks.
 *
 *   npx sanity exec scripts/ingest-videos.ts --with-user-token -- --dry-run
 *   npx sanity exec scripts/ingest-videos.ts --with-user-token
 *   npx sanity exec scripts/ingest-videos.ts --with-user-token -- --only <youtubeId> --refresh
 *
 * Chapters: scripts/videos/chapters.json first, then the description, then none.
 * Idempotent: documents are keyed by video id and replaced on each run.
 * Provider responses are cached in scripts/videos/.cache (`--refresh` skips it).
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getCliClient } from "sanity/cli";

import { type Chapter, chunkTranscript, normalizeChapters, parseDescriptionChapters, videoDocumentId } from "./videos/transcript";
import { canonicalYouTubeUrl, getYouTubeSource, parseYouTubeId } from "./videos/youtube";

const client = getCliClient({ apiVersion: "2026-10-11" });

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const refresh = args.includes("--refresh");
const only = new Set(args.flatMap((arg, i) => (arg === "--only" && args[i + 1] ? [args[i + 1]] : [])));

const PAUSE_MS = 750;
const BATCH_SIZE = 10;

type AuthoredChapters = Record<string, { startSeconds: number; label: string }[]>;

/** Supported providers. Add Vimeo or Bunny here once their playback exists too. */
function parseVideo(videoUrl: string) {
  const id = parseYouTubeId(videoUrl);
  return id ? { provider: "youtube" as const, id, url: canonicalYouTubeUrl(id) } : null;
}

async function run() {
  const authored = JSON.parse(
    await readFile(path.join(process.cwd(), "scripts", "videos", "chapters.json"), "utf8"),
  ) as AuthoredChapters;

  const lessons = await client.fetch<{ _id: string; videoUrl: string }[]>(
    `*[_type == "lesson" && defined(videoUrl) && !(_id in path("drafts.**"))]{ _id, videoUrl }`,
  );

  const videos = new Map<string, NonNullable<ReturnType<typeof parseVideo>>>();
  const skipped: string[] = [];
  const nonCanonical: string[] = [];
  for (const lesson of lessons) {
    const video = parseVideo(lesson.videoUrl);
    if (!video) {
      skipped.push(`${lesson._id} ${lesson.videoUrl}`);
      continue;
    }
    if (video.url !== lesson.videoUrl) nonCanonical.push(`${lesson._id} ${lesson.videoUrl} -> ${video.url}`);
    if (only.size === 0 || only.has(video.id)) videos.set(video.id, video);
  }

  const documents = [];
  const chapterSources = { authored: 0, description: 0, none: 0 };
  const noTranscript: string[] = [];
  const failures: string[] = [];
  let fetches = 0;

  for (const video of videos.values()) {
    try {
      const { source, fetched } = await getYouTubeSource(video.id, { refresh });
      if (fetched) {
        fetches++;
        await new Promise((resolve) => setTimeout(resolve, PAUSE_MS));
      }

      let chapters: Chapter[] = authored[video.id] ? normalizeChapters(authored[video.id]) : [];
      let chapterSource: keyof typeof chapterSources = "authored";
      if (chapters.length === 0) {
        chapters = parseDescriptionChapters(source.description, source.durationSeconds);
        chapterSource = chapters.length > 0 ? "description" : "none";
      }
      chapterSources[chapterSource]++;

      const chunks = chunkTranscript(source.transcript);
      if (chunks.length === 0) noTranscript.push(video.id);

      documents.push({
        _id: videoDocumentId(video.provider, video.id),
        _type: "video",
        title: source.title,
        provider: video.provider,
        videoId: video.id,
        url: video.url,
        durationSeconds: source.durationSeconds,
        chapters: chapters.map((c) => ({ _type: "chapter", ...c })),
        chunks: chunks.map((c) => ({ _type: "chunk", ...c })),
        chapterSource,
        ingestedAt: new Date().toISOString(),
      });
      console.log(`${video.id}  ${chapterSource.padEnd(11)} ${chapters.length} chapters  ${chunks.length} chunks`);
    } catch (error) {
      failures.push(`${video.id} ${error instanceof Error ? error.message : String(error)}`);
      console.error(`${video.id}  failed: ${failures.at(-1)}`);
    }
  }

  const lessonVideoIds = new Set(lessons.map((l) => parseVideo(l.videoUrl)?.id).filter(Boolean));
  const existing = await client.fetch<{ _id: string; videoId: string }[]>(`*[_type == "video"]{ _id, videoId }`);
  const orphans = existing.filter((v) => !lessonVideoIds.has(v.videoId)).map((v) => v._id);

  console.log("\nSummary");
  console.log(`  Lessons scanned:     ${lessons.length}`);
  console.log(`  Videos processed:    ${videos.size}  (fetched from provider: ${fetches})`);
  console.log(`  Documents built:     ${documents.length}`);
  console.log("  Chapter sources:    ", chapterSources);
  if (noTranscript.length > 0) console.log("  No transcript:      ", noTranscript);
  if (skipped.length > 0) console.log("  Skipped (unsupported url):", skipped);
  if (nonCanonical.length > 0) console.log("  Non-canonical lesson urls (join on url will miss):", nonCanonical);
  if (orphans.length > 0) console.log("  Orphan video documents (no lesson uses them):", orphans);
  if (failures.length > 0) console.log("  Failures:           ", failures);

  if (dryRun) {
    console.log("\nDry run, nothing written.");
  } else {
    for (let i = 0; i < documents.length; i += BATCH_SIZE) {
      const transaction = client.transaction();
      for (const doc of documents.slice(i, i + BATCH_SIZE)) transaction.createOrReplace(doc);
      await transaction.commit({ visibility: "async" });
    }
    console.log(`\nWrote ${documents.length} video documents.`);
  }

  if (failures.length > 0) process.exit(1);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
