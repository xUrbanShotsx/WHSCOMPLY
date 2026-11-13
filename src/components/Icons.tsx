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
  grid: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.500" />
      <rect x="13" y="4" width="7" height="7" rx="1.500" />
      <rect x="4" y="13" width="7" height="7" rx="1.500" />
      <rect x="13" y="13" width="7" height="7" rx="1.500" />
    </>
  ),
  logout: (
    <path d="M10 4H6a2 2 0 00-2 2v12a2 2 0 002 2h4M15 8l4 4-4 4M19 12H9" />
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  settings: (
    <>
      <path d="M12.220 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.730l-.43.250a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.730.730l-.22.380a2 2 0 00.730 2.730l.15.1a2 2 0 011 1.720v.51a2 2 0 01-1 1.740l-.15.09a2 2 0 00-.73 2.730l.22.38a2 2 0 002.730.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.730V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.730l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.730-.73l.22-.39a2 2 0 00-.73-2.730l-.15-.08a2 2 0 01-1-1.740v-.5a2 2 0 011-1.740l.15-.09a2 2 0 00.73-2.730l-.22-.38a2 2 0 00-2.730-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.730V4a2 2 0 00-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.500" y="5" width="17" height="15.500" rx="2" />
      <path d="M3.500 10h17M8 3v4M16 3v4" />
    </>
  ),
  list: <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />,
  sparkle: (
    <>
      <path d="M12 3l1.900 5.100L19 10l-5.100 1.900L12 17l-1.900-5.100L5 10l5.100-1.900L12 3z" />
      <path d="M19 15l.8 2.200L22 18l-2.200.8L19 21l-.8-2.200L16 18l2.200-.8L19 15z" />
    </>
  ),
  home: <path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10" />,
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0014 0M12 18v3" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3.500L2.500 20h19L12 3.500z" />
      <path d="M12 10v4.500M12 17.500v.1" />
    </>
  ),
  clipboard: (
    <>
      <rect x="5" y="4.500" width="14" height="17" rx="2" />
      <path d="M9 4.500V3h6v1.500M9 11h6M9 15h4" />
    </>
  ),
  trash: <path d="M4 7h16M10 3h4M6 7l1 13h10l1-13M10 11v6M14 11v6" />,
  pencil: <path d="M4 20l1-4L16 5l3 3L8 19l-4 1zM14 7l3 3" />,
  flag: <path d="M5 21V4M5 4h11l-2 4 2 4H5" />,
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
