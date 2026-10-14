import { cn } from "@/lib/cn";

/* Left offset, width, and height, each as a percentage. */
const bars = [
  [0, 7.3, 47],
  [7.3, 6.2, 66],
  [13.5, 4.1, 82],
  [17.6, 6.2, 100],
  [23.8, 9.3, 71],
  [33.1, 5.2, 53],
  [49.3, 2.6, 32],
  [51.9, 9.3, 47],
  [61.2, 7.8, 63],
  [69, 5.2, 82],
  [74.2, 6.5, 100],
  [80.7, 5.4, 53],
  [86.1, 3.6, 71],
  [89.7, 10.3, 90],
];

/* Vertical bars fading from primary at the base to transparent at the top. */
export function DecorativeBars({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("relative overflow-hidden", className)}>
      {bars.map(([left, width, height]) => (
        <span
          key={left}
          className="absolute bottom-0 bg-linear-to-t from-primary-400/70 to-transparent"
          style={{ left: `${left}%`, width: `calc(${width}% + 1px)`, height: `${height}%` }}
        />
      ))}
    </div>
  );
}
