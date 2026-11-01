import type { ReactNode } from "react";

const paths: Record<string, ReactNode> = {
  shield: (
    <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3zM9 12l2 2 4-4" />
  ),
  file: (
    <>
      <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </>
  ),
  id: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="11" r="2" />
      <path d="M6 16c.5-1.5 1.6-2 3-2s2.500.5 3 2M15 10h3M15 14h3" />
    </>
  ),
  scale: (
    <path d="M12 4v16M6 20h12M5 7h14M5 7l-3 7a3 3 0 006 0L5 7zm14 0l-3 7a3 3 0 006 0l-3-7z" />
  ),
  bell: <path d="M6 9a6 6 0 1112 0c0 6 2 7 2 7H4s2-1 2-7zM10 20a2 2 0 004 0" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  check: <path d="M5 12.500l4.500 4.500L19 7" />,
  building: (
    <>
      <path d="M4 21V5a1 1 0 011-1h9a1 1 0 011 1v16M15 10h4a1 1 0 011 1v10M2 21h20" />
      <path d="M8 8h3M8 12h3M8 16h3" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.500" />
      <path d="M2.500 20c.5-3.500 3-5.500 6.500-5.500s6 2 6.500 5.500M16 5a3.500 3.500 0 010 7M18 14.500c2 .6 3.200 2.500 3.500 5.500" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="7.500" r="3.500" />
      <path d="M5 20c.6-3.500 3.200-5.500 7-5.500s6.400 2 7 5.500" />
    </>
  ),
  store: (
    <>
      <path d="M4 10V20h16V10M3 10l2-6h14l2 6a3 3 0 01-6 0 3 3 0 01-6 0 3 3 0 01-6 0z" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.500" />
      <path d="M16 16l4.500 4.500" />
    </>
  ),
  download: <path d="M12 4v11M7 11l5 5 5-5M5 20h14" />,
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 018 0v3" />
    </>
  ),
  clip: (
    <path d="M20 11l-8 8a5 5 0 01-7-7l8.500-8.500a3.500 3.500 0 015 5L10 17a2 2 0 01-3-3l7.500-7.500" />
  ),
  home: <path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  book: (
    <path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2V5zM4 19a2 2 0 012-2h13" />
  ),
};

export type IconName = keyof typeof paths;

export function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
