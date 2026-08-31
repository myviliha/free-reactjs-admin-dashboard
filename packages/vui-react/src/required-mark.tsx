import { REQUIRED_MARK } from "./class-variants";

/**
 * Required-field marker — a small asterisk drawn as an inline SVG (viewBox, not
 * width=15) so it isn't wrapped by the global icon-chip rule. Use next to a
 * label to mark a mandatory field, consistently across tables and forms.
 */
export function RequiredMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      className={REQUIRED_MARK}
      aria-label="required"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5.5" y1="8.5" x2="18.5" y2="15.5" />
      <line x1="18.5" y1="8.5" x2="5.5" y2="15.5" />
    </svg>
  );
}
