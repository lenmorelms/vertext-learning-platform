/**
 * Pure helpers for the video ingestion pipeline: chapters from a description,
 * a json3 transcript as short timestamped chunks, and the document id.
 */
import type { Json3 } from "./youtube";

export type Chapter = { _key: string; startSeconds: number; label: string };
export type Chunk = { _key: string; startSeconds: number; text: string };

const MAX_LABEL = 120;
const CHUNK_MIN_SECONDS = 20;
const CHUNK_MAX_WORDS = 60;

/** `video-<provider>-<id>`, keeping only characters Sanity accepts in ids (no dots). */
export function videoDocumentId(provider: string, id: string) {
  return `video-${provider}-${id}`.replace(/[^A-Za-z0-9_-]/g, "");
}

function toSeconds(stamp: string) {
  return stamp.split(":").reduce((total, part) => total * 60 + Number(part), 0);
}

// "00:00 Intro", "(1:02:03) Label", "0:45 - Label", "[12:30] | Label"
const CHAPTER_LINE = /^\s*[[(]?((?:\d{1,2}:)?\d{1,2}:\d{2})[\])]?\s*[-–—:|]*\s*(.+?)\s*$/;

/**
 * Chapters as YouTube itself reads them from a description: the first at 0,
 * at least three, strictly ascending, all inside the video. Otherwise none.
 */
export function parseDescriptionChapters(description: string, durationSeconds: number): Chapter[] {
  const chapters: Chapter[] = [];
  for (const line of description.split(/\r?\n/)) {
    const match = line.match(CHAPTER_LINE);
    if (!match) continue;
    const label = match[2].replace(/^[-–—:|\s]+/, "").slice(0, MAX_LABEL).trim();
    if (!label) continue;
    chapters.push({ _key: `c${chapters.length}`, startSeconds: toSeconds(match[1]), label });
  }

  const valid =
    chapters.length >= 3 &&
    chapters[0].startSeconds === 0 &&
    chapters.every((c, i) => i === 0 || c.startSeconds > chapters[i - 1].startSeconds) &&
    (durationSeconds <= 0 || chapters.every((c) => c.startSeconds < durationSeconds));

  return valid ? chapters : [];
}

/** Authored chapters from `chapters.json`, sorted, keyed, and with labels trimmed. */
export function normalizeChapters(chapters: { startSeconds: number; label: string }[]): Chapter[] {
  return [...chapters]
    .filter((c) => Number.isFinite(c.startSeconds) && c.startSeconds >= 0 && c.label?.trim())
    .sort((a, b) => a.startSeconds - b.startSeconds)
    .map((c, i) => ({
      _key: `c${i}`,
      startSeconds: Math.floor(c.startSeconds),
      label: c.label.trim().slice(0, MAX_LABEL),
    }));
}

function cleanText(text: string) {
  return text
    .replace(/\[[^\]]*\]/g, " ") // [Music], [Applause]
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Caption events grouped in order into chunks that close once they span at
 * least 20 seconds or reach 60 words. Each chunk starts at its first event.
 */
export function chunkTranscript(transcript: Json3 | null): Chunk[] {
  const chunks: Chunk[] = [];
  let start = -1;
  let words: string[] = [];

  const close = () => {
    if (words.length > 0) chunks.push({ _key: `t${chunks.length}`, startSeconds: start, text: words.join(" ") });
    start = -1;
    words = [];
  };

  for (const event of transcript?.events ?? []) {
    if (!event.segs || event.tStartMs === undefined) continue;
    const text = cleanText(event.segs.map((s) => s.utf8 ?? "").join(""));
    if (!text) continue;

    const seconds = Math.floor(event.tStartMs / 1000);
    if (start >= 0 && seconds - start >= CHUNK_MIN_SECONDS) close();
    if (start < 0) start = seconds;

    for (const word of text.split(" ")) {
      words.push(word);
      if (words.length >= CHUNK_MAX_WORDS) {
        close();
        start = seconds;
      }
    }
  }
  close();
  return chunks;
}
