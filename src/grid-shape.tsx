/**
 * The corner grid ornament, shared by the not-found screen and the authentication panel.
 *
 * Theirs is `/images/shape/grid-01.svg`, placed twice and rotated once. This draws the same idea
 * inline: no file and no request, and the lines are `currentColor` at low opacity, so one component
 * serves a light page and a dark panel instead of needing a second asset for dark mode. It is masked
 * with a diagonal fade so the grid dissolves into the page rather than stopping at an edge.
 */
export function GridShape({ className, id }: { className?: string; id: string }) {
  const pattern = `grid-${id}`;
  const fade = `fade-${id}`;
  const mask = `mask-${id}`;
  return (
    <svg
      className={className}
      viewBox="0 0 540 254"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* Ids are per instance: two of these on one page with one id makes the second borrow the
            first's mask, and the shape silently disappears. */}
        <pattern id={pattern} width="45" height="45" patternUnits="userSpaceOnUse">
          <path d="M45 0H0V45" fill="none" stroke="currentColor" strokeWidth="1" />
        </pattern>
        <linearGradient id={fade} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="white" stopOpacity="0.9" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask id={mask}>
          <rect width="540" height="254" fill={`url(#${fade})`} />
        </mask>
      </defs>
      <rect width="540" height="254" fill={`url(#${pattern})`} mask={`url(#${mask})`} />
    </svg>
  );
}
