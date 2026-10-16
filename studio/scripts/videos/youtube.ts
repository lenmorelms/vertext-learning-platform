/**
 * YouTube source for the video ingestion pipeline: the video's title, length,
 * description, and an English caption track in json3 form.
 *
 * Captions come from the innertube `player` endpoint with the ANDROID client.
 * The watch page's own caption URLs return an empty body without a PoToken.
 * This endpoint is unofficial and may change; raw responses are cached on disk
 * so re-runs do not depend on it.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type Json3 = {
  events?: { tStartMs?: number; dDurationMs?: number; segs?: { utf8?: string }[] }[];
};

export type YouTubeSource = {
  id: string;
  title: string;
  durationSeconds: number;
  description: string;
  /** The chosen track's language code, or null when there is no English track. */
  captionLanguage: string | null;
  transcript: Json3 | null;
};

type CaptionTrack = { baseUrl: string; languageCode: string; kind?: string };

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"]);
const MAX_TRANSCRIPT_BYTES = 5 * 1024 * 1024;
const CACHE_DIR = path.join(process.cwd(), "scripts", "videos", ".cache");

/** Same rules as the web app's `parseVideoUrl` in `lib/video.ts`. */
export function parseYouTubeId(videoUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(videoUrl);
  } catch {
    return null;
  }
  if (!YOUTUBE_HOSTS.has(url.hostname)) return null;

  const id =
    url.hostname === "youtu.be"
      ? url.pathname.slice(1)
      : url.pathname === "/watch"
        ? url.searchParams.get("v")
        : url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1];

  return id && YOUTUBE_ID.test(id) ? id : null;
}

export function canonicalYouTubeUrl(id: string) {
  return `https://www.youtube.com/watch?v=${id}`;
}

/** Manual English, then auto-generated English, then any other English variant. */
function pickTrack(tracks: CaptionTrack[]) {
  const english = tracks.filter((t) => t.languageCode === "en" || t.languageCode.startsWith("en-"));
  return (
    english.find((t) => t.languageCode === "en" && t.kind !== "asr") ??
    english.find((t) => t.languageCode === "en") ??
    english.find((t) => t.kind !== "asr") ??
    english[0] ??
    null
  );
}

async function fetchFromYouTube(id: string): Promise<YouTubeSource> {
  const response = await fetch("https://www.youtube.com/youtubei/v1/player", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      context: {
        client: { clientName: "ANDROID", clientVersion: "20.10.38", androidSdkVersion: 30, hl: "en" },
      },
      videoId: id,
    }),
  });
  if (!response.ok) throw new Error(`player ${response.status}`);

  const player = await response.json();
  const status = player?.playabilityStatus?.status;
  if (status !== "OK") throw new Error(`playability ${status}: ${player?.playabilityStatus?.reason ?? ""}`);

  const details = player.videoDetails ?? {};
  const track = pickTrack(player?.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? []);

  let transcript: Json3 | null = null;
  if (track) {
    const url = new URL(track.baseUrl);
    url.searchParams.set("fmt", "json3");
    const captions = await fetch(url);
    if (!captions.ok) throw new Error(`captions ${captions.status}`);
    const body = await captions.text();
    if (body.length > MAX_TRANSCRIPT_BYTES) throw new Error(`captions too large (${body.length} bytes)`);
    if (body.length === 0) throw new Error("captions empty (blocked?)");
    transcript = JSON.parse(body) as Json3;
  }

  return {
    id,
    title: String(details.title ?? ""),
    durationSeconds: Number(details.lengthSeconds ?? 0),
    description: String(details.shortDescription ?? ""),
    captionLanguage: track?.languageCode ?? null,
    transcript,
  };
}

/**
 * The cached source, or a fresh fetch (one retry after 3s on failure).
 * `fetched` is false when the cache answered.
 */
export async function getYouTubeSource(id: string, { refresh = false } = {}) {
  const file = path.join(CACHE_DIR, `${id}.json`);
  if (!refresh) {
    try {
      return { source: JSON.parse(await readFile(file, "utf8")) as YouTubeSource, fetched: false };
    } catch {
      // Not cached yet.
    }
  }

  let source: YouTubeSource;
  try {
    source = await fetchFromYouTube(id);
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    source = await fetchFromYouTube(id);
  }

  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(file, JSON.stringify(source));
  return { source, fetched: true };
}
