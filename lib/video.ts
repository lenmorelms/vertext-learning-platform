/*
 * Lesson video URLs to provider embeds. Only YouTube is supported: a provider
 * counts as supported once both transcript ingestion and playback exist for it.
 */

export type ParsedVideo = { provider: "youtube"; id: string };

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"]);

export function parseVideoUrl(videoUrl: string): ParsedVideo | null {
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

  return id && YOUTUBE_ID.test(id) ? { provider: "youtube", id } : null;
}

/** The provider's own player, starting at `startSeconds`. */
export function getEmbedUrl(video: ParsedVideo, startSeconds = 0) {
  const params = new URLSearchParams({ rel: "0", modestbranding: "1" });
  if (startSeconds > 0) params.set("start", String(startSeconds));
  return `https://www.youtube-nocookie.com/embed/${video.id}?${params}`;
}

/** A `?t=` value as whole seconds within the video, or 0 when it is not one. */
export function parseStartSeconds(value: string | string[] | undefined, durationSeconds: number) {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return 0;
  return Math.min(Number(value), Math.max(0, durationSeconds - 1));
}
