import type { ReactNode } from "react";

export type IconProps = {
  size?: number;
  filled?: boolean;
  className?: string;
};

function Svg({
  size = 24,
  className,
  strokeWidth = 2,
  children,
}: IconProps & { strokeWidth?: number; children: ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

export function BellIcon({ filled, ...props }: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"
        fill={filled ? "currentColor" : "none"}
      />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </Svg>
  );
}

export function SearchIcon({ filled, ...props }: IconProps) {
  return (
    <Svg {...props} strokeWidth={filled ? 3 : 2}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </Svg>
  );
}

export function PlayCircleIcon({ filled, ...props }: IconProps) {
  if (filled) {
    return (
      <Svg {...props} strokeWidth={0}>
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-2 6 6 4-6 4V8Z"
        />
      </Svg>
    );
  }
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="m10 8 6 4-6 4V8Z" />
    </Svg>
  );
}

export function DocumentIcon({ filled, ...props }: IconProps) {
  if (filled) {
    return (
      <Svg {...props} strokeWidth={0}>
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm2 10v2h8v-2H8Zm0 4v2h8v-2H8Z"
        />
      </Svg>
    );
  }
  return (
    <Svg {...props}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </Svg>
  );
}

export function BookmarkIcon({ filled, ...props }: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16Z"
        fill={filled ? "currentColor" : "none"}
      />
    </Svg>
  );
}

export function BarChartIcon({ filled, ...props }: IconProps) {
  const fill = filled ? "currentColor" : "none";
  return (
    <Svg {...props}>
      <rect x="3" y="13" width="4" height="8" rx="1" fill={fill} />
      <rect x="10" y="8" width="4" height="13" rx="1" fill={fill} />
      <rect x="17" y="3" width="4" height="18" rx="1" fill={fill} />
    </Svg>
  );
}

export function ClockIcon({ filled, ...props }: IconProps) {
  if (filled) {
    return (
      <Svg {...props} strokeWidth={0}>
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1 4h2v5.4l3.4 1.7-.9 1.8-4.5-2.3V6Z"
        />
      </Svg>
    );
  }
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </Svg>
  );
}

export function UserIcon({ filled, ...props }: IconProps) {
  const fill = filled ? "currentColor" : "none";
  return (
    <Svg {...props}>
      <circle cx="12" cy="7" r="4" fill={fill} />
      <path d="M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2Z" fill={fill} />
    </Svg>
  );
}

export function ChevronRightIcon({ filled, ...props }: IconProps) {
  return (
    <Svg {...props} strokeWidth={filled ? 2.5 : 2}>
      <path d="m9 18 6-6-6-6" />
    </Svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 12h16" />
      <path d="m14 6 6 6-6 6" />
    </Svg>
  );
}

export function StarIcon({ filled, ...props }: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5-5.9-3.1-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9Z"
        fill={filled ? "currentColor" : "none"}
      />
    </Svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m15 18-6-6 6-6" />
    </Svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m6 9 6 6 6-6" />
    </Svg>
  );
}

export function ExternalLinkIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </Svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      <path d="M12 15v2" />
    </Svg>
  );
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" />
    </Svg>
  );
}

export function FolderIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    </Svg>
  );
}

/* Open ring, three quarters drawn. */
export function ProgressRingIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 2a10 10 0 1 0 10 10" />
    </Svg>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="9" cy="8" r="4" />
      <path d="M2 21v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1" />
      <path d="M16 3.1a4 4 0 0 1 0 7.8" />
      <path d="M22 21v-1a5 5 0 0 0-3.5-4.8" />
    </Svg>
  );
}

/* Learning outcome icons, drawn with a thinner stroke for their larger size. */

export function LayersIcon(props: IconProps) {
  return (
    <Svg {...props} strokeWidth={1.5}>
      <path d="m12 3 9 5-9 5-9-5Z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 16 9 5 9-5" />
    </Svg>
  );
}

export function DatabaseIcon(props: IconProps) {
  return (
    <Svg {...props} strokeWidth={1.5}>
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
      <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
    </Svg>
  );
}

export function GaugeIcon(props: IconProps) {
  return (
    <Svg {...props} strokeWidth={1.5}>
      <path d="M5.6 19.4a9 9 0 1 1 12.8 0" />
      <path d="m12 14 3.5-4.5" />
      <circle cx="12" cy="14" r="1" />
      <path d="M12 5v1.5" />
      <path d="m6.3 8.3 1 1" />
      <path d="M4 14h1.5" />
      <path d="M18.5 14H20" />
    </Svg>
  );
}

export function CloudIcon(props: IconProps) {
  return (
    <Svg {...props} strokeWidth={1.5}>
      <path d="M17.5 19H7a5 5 0 1 1 1.1-9.9 6 6 0 0 1 11.4 2.4A3.8 3.8 0 0 1 17.5 19Z" />
    </Svg>
  );
}

export function CodeIcon(props: IconProps) {
  return (
    <Svg {...props} strokeWidth={1.5}>
      <path d="m8 7-5 5 5 5" />
      <path d="m16 7 5 5-5 5" />
      <path d="m14 4-4 16" />
    </Svg>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <Svg {...props} strokeWidth={1.5}>
      <path d="M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </Svg>
  );
}

export function RocketIcon(props: IconProps) {
  return (
    <Svg {...props} strokeWidth={1.5}>
      <path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.2 2.2 0 0 0-2.9-.1Z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.9A12.9 12.9 0 0 1 22 2c0 2.7-.8 7.5-6 11a22.4 22.4 0 0 1-4 2Z" />
      <path d="M9 12H4s.6-3 2-4c1.6-1.1 5 0 5 0" />
      <path d="M12 15v5s3-.6 4-2c1.1-1.6 0-5 0-5" />
    </Svg>
  );
}

export function SparklesIcon(props: IconProps) {
  return (
    <Svg {...props} strokeWidth={1.5}>
      <path d="M10 3 8.6 7.6a2 2 0 0 1-1.3 1.3L3 10.3l4.3 1.4a2 2 0 0 1 1.3 1.3L10 17.5l1.4-4.5a2 2 0 0 1 1.3-1.3l4.3-1.4-4.3-1.4a2 2 0 0 1-1.3-1.3Z" />
      <path d="M19 3v4" />
      <path d="M21 5h-4" />
      <path d="M18 17v4" />
      <path d="M20 19h-4" />
    </Svg>
  );
}

export function WorkflowIcon(props: IconProps) {
  return (
    <Svg {...props} strokeWidth={1.5}>
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="13" width="8" height="8" rx="2" />
      <path d="M7 11v4a2 2 0 0 0 2 2h4" />
    </Svg>
  );
}

export function PuzzleIcon(props: IconProps) {
  return (
    <Svg {...props} strokeWidth={1.5}>
      <path d="M15.4 4.4a1 1 0 0 0 1.7-.5 2.5 2.5 0 1 1 3 3 1 1 0 0 0-.5 1.7l1.7 1.7a2.4 2.4 0 0 1 0 3.4l-1.7 1.7a1 1 0 0 1-1.7-.5 2.5 2.5 0 1 0-3 3 1 1 0 0 1 .5 1.7l-1.7 1.7a2.4 2.4 0 0 1-3.4 0l-1.7-1.7a1 1 0 0 0-1.7.5 2.5 2.5 0 1 1-3-3 1 1 0 0 0 .5-1.7l-1.7-1.7a2.4 2.4 0 0 1 0-3.4l1.7-1.7a1 1 0 0 1 1.7.5 2.5 2.5 0 1 0 3-3 1 1 0 0 1-.5-1.7l1.7-1.7a2.4 2.4 0 0 1 3.4 0Z" />
    </Svg>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M20 12H4" />
      <path d="m10 6-6 6 6 6" />
    </Svg>
  );
}

/* Solid triangle, for play buttons. */
export function PlayIcon(props: IconProps) {
  return (
    <Svg {...props} strokeWidth={0}>
      <path fill="currentColor" d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
    </Svg>
  );
}

export function LightbulbIcon(props: IconProps) {
  return (
    <Svg {...props} strokeWidth={1.5}>
      <path d="M9 18h6" />
      <path d="M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.4.9 1 1 1.6l.1.5h4.8l.1-.5c.1-.6.4-1.2 1-1.6A6 6 0 0 0 12 3Z" />
      <path d="M12 1v-.5M4.2 4.2l-.7-.7M19.8 4.2l.7-.7M2 11h-.5M22 11h.5" />
    </Svg>
  );
}

export function GithubIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}
