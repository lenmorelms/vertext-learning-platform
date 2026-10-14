import { getEmbedUrl, parseStartSeconds, parseVideoUrl } from "@/lib/video";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const frame = "aspect-video w-full overflow-hidden rounded-lg bg-neutral-900 shadow-lg";

/* Same size black frame, shown while the start second resolves. */
export function LessonVideoFrame() {
  return <div aria-hidden="true" className={frame} />;
}

/* The provider's own player, starting at `?t=<seconds>` when given. */
export async function LessonVideo({
  videoUrl,
  durationSeconds,
  title,
  searchParams,
}: {
  videoUrl: string;
  durationSeconds: number;
  title: string;
  searchParams: SearchParams;
}) {
  const video = parseVideoUrl(videoUrl);
  if (!video) {
    return (
      <div className={`${frame} flex items-center justify-center`}>
        <p className="text-body text-neutral-300">Video unavailable</p>
      </div>
    );
  }

  const { t } = await searchParams;
  const start = parseStartSeconds(t, durationSeconds);

  return (
    <div className={frame}>
      <iframe
        // Remount when the start second changes so the player seeks.
        key={start}
        src={getEmbedUrl(video, start)}
        title={`Video: ${title}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="size-full border-0"
      />
    </div>
  );
}
