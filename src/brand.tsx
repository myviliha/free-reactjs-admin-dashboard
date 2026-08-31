import { CaretSortIcon } from "@radix-ui/react-icons";
import { cn } from "@viliha/vui-core";

/**
 * The brand mark, then the wordmark.
 *
 * **The mark is the supplied `logo.png`, and it replaced a tinted tile.** The glyph used to be an
 * inline bar chart in a `bg-primary` square, which is the right shape for a mark drawn in one colour
 * and the wrong one for a full-colour logo: a tile behind an opaque 256px icon is a coloured edge
 * around something that already has its own. It also made the `inverted` prop meaningless, so that
 * prop is gone rather than left as a switch that changes nothing.
 *
 * Drawn here rather than imported. It is three rectangles, and a file plus an import for three
 * rectangles is more to read than the rectangles.
 */
export function Brand({
  compact = false,
  version = false,
  onBrand = false,
}: {
  compact?: boolean;
  /** The documentation layouts pair the wordmark with a version and a switcher (`PD-065`). */
  version?: boolean;
  /**
   * Sit the mark on a plate, for a **brand-coloured ground**.
   *
   * The logo is an app icon whose own tile is `#3e62e8` and `--brand` is `#266df0`, so on the
   * authentication panel the tile all but vanished and the white glyph floated on blue: legible, and
   * reading as a smudge rather than a logo. The plate is the conventional way an app icon is shown
   * against colour, and `bg-card` means it follows the theme instead of being a hardcoded white.
   *
   * Not a general "inverted": nothing here is inverted, and the last prop by that name was removed
   * for describing a tile that no longer existed.
   */
  onBrand?: boolean;
}) {
  return (
    <span className="flex items-center gap-3">
      {/* A plain `<img>` carrying its intrinsic size, so the row reserves the mark's space before
          the file lands. `next/image` used to do that and one more thing, `priority`; the honest
          replacement is `fetchPriority`, which is the attribute it set. */}
      {/* The intrinsic size is the file's own 512, with the rendered size set in CSS: declaring 36
          here would tell the browser the source is 36px and throw away the detail a retina screen
          asks for. No `rounded-*` either, because the artwork carries its own corner radius and a
          transparent margin outside it, so a second radius would clip inside the first. */}
      <img
        src="/images/logo.png"
        alt=""
        width={512}
        height={512}
        className={cn("size-9 shrink-0", onBrand && "size-11 rounded-xl bg-card p-1")}
        fetchPriority="high"
      />
      {!compact &&
        (version ? (
          <span className="flex min-w-0 flex-1 items-center gap-2">
            <span className="min-w-0">
              <span className="block truncate text-base font-bold tracking-tight">
                VuiAdmin Docs
              </span>
              <span className="block text-xs text-muted-foreground">v0.1.0-free</span>
            </span>
            {/* A switcher affordance, and it says so: the free demo ships one version, so a control
                that opened an empty menu would be worse than one that admits it is a placeholder. */}
            <CaretSortIcon
              className="ml-auto size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
          </span>
        ) : (
          <span className="text-xl font-bold tracking-tight">VuiAdmin</span>
        ))}
    </span>
  );
}
