import { SPINNER } from "./class-variants";
import { Spinner as SpinnerIcon } from "./icons";
import { cn } from "./utils";

/**
 * A busy indicator (`PD-199`).
 *
 * **The icon already existed**, in the slot with both bindings, so this draws no new SVG. What it
 * adds is the part a spinner gets wrong: it is a **status**, not decoration. Without
 * `role="status"` a screen reader is told nothing is happening while the page waits, and without a
 * label it is told something is happening but not what.
 *
 * `motion-reduce` is on the class as well as the global clamp in `theme.css`, because a spinner is
 * the one animation somebody with vestibular sensitivity meets on every slow request.
 */
const SIZES = { sm: "size-4", md: "size-5", lg: "size-8" } as const;

export function Spinner({
  size = "md",
  label = "Loading",
  className,
}: {
  size?: keyof typeof SIZES;
  /** Read out instead of the shape. "Loading" is the honest default. */
  label?: string;
  className?: string;
}) {
  return (
    <span role="status" aria-live="polite" className="inline-flex items-center gap-2">
      <SpinnerIcon className={cn(SPINNER, SIZES[size], className)} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
