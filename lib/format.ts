/** Seconds as "18h 24m", "2h", or "45m". */
export function formatDuration(seconds: number) {
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

/** A display count as "2.1k", "12k", or "940". */
export function formatCompactCount(count: number) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  })
    .format(count)
    .toLowerCase();
}

export function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** A display count with separators, as "3,426". */
export function formatCount(count: number) {
  return new Intl.NumberFormat("en").format(count);
}

/** Seconds as a video timestamp: "6:41", "12:45", or "1:02:03". */
export function formatTimestamp(seconds: number) {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = String(total % 60).padStart(2, "0");
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, "0")}:${secs}` : `${minutes}:${secs}`;
}
