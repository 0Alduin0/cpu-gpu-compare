const PATHS = {
  search: <><circle cx="8.75" cy="8.75" r="5.25" /><path d="M12.75 12.75 17 17" /></>,
  plus: <path d="M10 4.5v11M4.5 10h11" />,
  close: <path d="M5.5 5.5l9 9M14.5 5.5l-9 9" />,
  check: <path d="M4.5 10.5l3.5 3.5 7.5-8" />,
  arrowRight: <path d="M4 10h11.5M11 5.5 15.5 10 11 14.5" />,
  arrowLeft: <path d="M16 10H4.5M9 5.5 4.5 10 9 14.5" />,
  chevronDown: <path d="M6 8l4 4 4-4" />,
  chevronRight: <path d="M8 6l4 4-4 4" />,
  sortDown: <path d="M10 4v12M6 12l4 4 4-4" />,
  sortUp: <path d="M10 16V4M6 8l4-4 4 4" />,
  sortBoth: <><path d="M7 8l3-3.5L13 8" /><path d="M7 12l3 3.5 3-3.5" /></>,
  base: <><circle cx="10" cy="10" r="6" /><circle cx="10" cy="10" r="1.75" /></>,
  menu: <path d="M3.5 6h13M3.5 10h13M3.5 14h13" />,
  info: <><circle cx="10" cy="10" r="7" /><path d="M10 9v4.5M10 6.5v.01" /></>,
  reset: <><path d="M4.5 9A5.75 5.75 0 1 1 5.6 13.4" /><path d="M4.5 4.5V9H9" /></>,
  pause: <path d="M7.5 5v10M12.5 5v10" />,
  play: <path d="M6.5 5l8 5-8 5z" />,
  next: <path d="M5.5 5l6 5-6 5M14.5 5v10" />,
  swap: <><path d="M4 7h11.5M12.5 4l3 3-3 3" /><path d="M16 13H4.5M7.5 10l-3 3 3 3" /></>,
  sun: <><circle cx="10" cy="10" r="3.25" /><path d="M10 2.75v1.5M10 15.75v1.5M2.75 10h1.5M15.75 10h1.5M4.9 4.9l1.05 1.05M14.05 14.05l1.05 1.05M4.9 15.1l1.05-1.05M14.05 5.95l1.05-1.05" /></>,
  moon: <path d="M15.75 12.4A6.25 6.25 0 0 1 7.6 4.25a6.25 6.25 0 1 0 8.15 8.15Z" />,
  up: <path d="M10 15.5V5M5.75 9.25 10 5l4.25 4.25" />,
  down: <path d="M10 4.5V15M5.75 10.75 10 15l4.25-4.25" />,
  external: <><path d="M8 5H5.5A1.5 1.5 0 0 0 4 6.5v8A1.5 1.5 0 0 0 5.5 16h8a1.5 1.5 0 0 0 1.5-1.5V12" /><path d="M11 4h5v5M16 4l-7 7" /></>,
}

export default function Icon({ name, size = 20, className = '', title }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`flex-none ${className}`}
      aria-hidden={title ? undefined : 'true'}
      role={title ? 'img' : undefined}
    >
      {title && <title>{title}</title>}
      {PATHS[name]}
    </svg>
  )
}
