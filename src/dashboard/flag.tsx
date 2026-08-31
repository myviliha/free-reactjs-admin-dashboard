/**
 * Circular country flags, drawn.
 *
 * The reference shows each country as a round flag icon. An emoji flag is not that: macOS renders it
 * as a small rectangle, so clipping it to a circle crops the design rather than filling one, and
 * Windows Chrome does not render regional-indicator pairs as flags at all.
 *
 * These are a handful of rects inside a clipped circle, which costs no asset, no request and no
 * licence, and it scales cleanly. Two are all the free demo's fixture needs; a third is a `case`.
 */
const FLAGS = {
  usa: (
    <>
      <rect width="20" height="20" fill="#b22234" />
      {[1, 3, 5, 7, 9].map((row) => (
        <rect key={row} y={row * 2} width="20" height="2" fill="#fff" />
      ))}
      <rect width="10" height="10" fill="#3c3b6e" />
    </>
  ),
  france: (
    <>
      <rect width="6.67" height="20" fill="#002395" />
      <rect x="6.67" width="6.67" height="20" fill="#fff" />
      <rect x="13.34" width="6.67" height="20" fill="#ed2939" />
    </>
  ),
} as const;

export type FlagName = keyof typeof FLAGS;

export function Flag({ name, className }: { name: FlagName; className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={className}
      // Decorative: the country's name is the text right beside it, so announcing "flag of France"
      // next to the word France is the same fact twice.
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <clipPath id={`flag-${name}`}>
          <circle cx="10" cy="10" r="10" />
        </clipPath>
      </defs>
      <g clipPath={`url(#flag-${name})`}>{FLAGS[name]}</g>
    </svg>
  );
}
