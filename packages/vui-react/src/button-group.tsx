import type { ReactNode } from "react";

import { BUTTON_GROUP, BUTTON_GROUP_VERTICAL } from "./class-variants";
import { cn } from "./utils";

/**
 * Buttons that read as one control (`PD-199`).
 *
 * **It joins, it does not restyle.** The children are ordinary `Button`s and keep their own variant
 * and size; this only removes the seam between them, so a group of outline buttons does not draw a
 * double border down the middle. Anything that changed how a button looks would be a second opinion
 * about buttons, and there is already one.
 *
 * `role="group"` and a name, because a row of buttons a screen reader reads one at a time has lost
 * the thing that made it a group.
 */
export function ButtonGroup({
  children,
  orientation = "horizontal",
  label,
  className,
}: {
  children: ReactNode;
  orientation?: "horizontal" | "vertical";
  /** Names the set. A group without one is three buttons that happen to touch. */
  label?: string;
  className?: string;
}) {
  /*
   * **`toolbar`, not `group`, and biome is what prompted the second look.**
   *
   * It flagged `role="group"` as something `fieldset` should be, and `fieldset` is wrong here: it
   * owns a set of form controls and drags a legend and form-reset semantics with it. But `group`
   * was not right either, and the tell was `aria-orientation`, which `group` does not support.
   *
   * `toolbar` is the role ARIA defines for exactly this: a collection of commonly used command
   * buttons in compact form. It supports the orientation, so the attribute is real rather than one
   * a screen reader silently ignores, which is worse than none because it reads as handled.
   */
  return (
    <div
      role="toolbar"
      aria-orientation={orientation}
      aria-label={label}
      className={cn(orientation === "vertical" ? BUTTON_GROUP_VERTICAL : BUTTON_GROUP, className)}
    >
      {children}
    </div>
  );
}
