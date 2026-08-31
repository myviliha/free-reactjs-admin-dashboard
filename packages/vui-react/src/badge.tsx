import * as React from "react";

import {
  BADGE_BASE,
  BADGE_SIZES,
  BADGE_SOLID,
  BADGE_VARIANTS,
  type BadgeVariant,
} from "./class-variants";
import { cn } from "./utils";

export type { BadgeVariant };

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  /**
   * Paint the state's colour as the ground instead of a wash of it.
   *
   * A boolean rather than a second set of variant names, so there is one vocabulary of eight tones
   * and one switch, instead of sixteen names a reader has to keep straight. `outline` has no solid
   * form and is unaffected.
   */
  solid?: boolean;
  /** Omit to inherit the surrounding type size, which is what a badge in a table cell wants. */
  size?: keyof typeof BADGE_SIZES;
}

export function Badge({ className, variant = "default", solid, size, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        BADGE_BASE,
        (solid ? BADGE_SOLID : BADGE_VARIANTS)[variant],
        size && BADGE_SIZES[size],
        className,
      )}
      {...props}
    />
  );
}
