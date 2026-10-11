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
