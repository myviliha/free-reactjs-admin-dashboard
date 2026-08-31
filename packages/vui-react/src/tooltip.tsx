"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { TOOLTIP_CONTENT } from "./class-variants";
import { cn } from "./utils";

type ResolvedSide = "top" | "bottom";
type Placement = { left: number; top: number; side: ResolvedSide };

/**
 * Lightweight tooltip, rendered in a portal with fixed positioning so it floats
 * above any scroll/overflow container. No dependency.
 *
 * It uses the same surface as every other floating thing in the package:
 * `bg-popover` with a border and a shadow. shadcn's tooltip is a dark bubble,
 * which reads as a different design system sitting on top of this one, so it
 * was brought in line. One surface for menus, popovers, selects and tooltips is
 * what makes them look like parts of the same product.
 *
 * `side` defaults to `"auto"`: it prefers **bottom** and flips to **top** only
 * when there isn't room below (e.g. the last rows of a table, near the footer).
 * Pass `"top"`/`"bottom"` to force a side.
 */
export function Tooltip({
  content,
  children,
  className,
  delay = 300,
  side = "auto",
}: {
  content: React.ReactNode;
  /** The trigger — wrapped in an inline element that carries hover/focus. */
  children: React.ReactNode;
  /** Applied to the inline trigger wrapper (e.g. `truncate` for a table cell). */
  className?: string;
  /** Hover open delay in ms. */
  delay?: number;
  /** `"auto"` (default) = prefer bottom, flip to top near the viewport bottom. */
  side?: "top" | "bottom" | "auto";
}) {
  const [pos, setPos] = React.useState<Placement | null>(null);
  const ref = React.useRef<HTMLSpanElement>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const place = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    // Prefer bottom; flip to top only when there isn't room below.
    const resolved: ResolvedSide =
      side === "auto" ? (window.innerHeight - r.bottom < 96 ? "top" : "bottom") : side;
    setPos({
      left: r.left + r.width / 2,
      top: resolved === "bottom" ? r.bottom + 8 : r.top - 8,
      side: resolved,
    });
  }, [side]);

  const open = React.useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(place, delay);
  }, [place, delay]);
  const close = React.useCallback(() => {
    clearTimeout(timer.current);
    setPos(null);
  }, []);

  const tipId = React.useId();

  React.useEffect(() => () => clearTimeout(timer.current), []);

  /**
   * Escape dismisses it. A tooltip opened by keyboard focus otherwise has no way to be got rid of
   * short of moving focus away, which is exactly what a user reading the hint is not doing.
   */
  React.useEffect(() => {
    if (!pos) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [pos, close]);
  React.useEffect(() => {
    if (!pos) return;
    window.addEventListener("scroll", close, true);
    return () => window.removeEventListener("scroll", close, true);
  }, [pos, close]);

  return (
    <span
      ref={ref}
      // Without this the bubble is a `role="tooltip"` in a portal that nothing points at, so a
      // screen reader never reads it and the hint is decoration for sighted users only.
      aria-describedby={pos ? tipId : undefined}
      onMouseEnter={open}
      onMouseLeave={close}
      onFocus={open}
      onBlur={close}
      className={className}
    >
      {children}
      {pos &&
        typeof document !== "undefined" &&
        createPortal(
          // Outer: fixed positioning (transform centers/anchors it). Inner: the
          // animated bubble (opacity only, so it doesn't fight the transform).
          <div
            style={{
              position: "fixed",
              left: pos.left,
              top: pos.top,
              transform: pos.side === "bottom" ? "translateX(-50%)" : "translate(-50%, -100%)",
            }}
            className="pointer-events-none z-[220]"
          >
            <div id={tipId} role="tooltip" className={TOOLTIP_CONTENT}>
              {content}
              <span
                aria-hidden="true"
                className={cn(
                  // The arrow is the same surface, with the two edges facing
                  // the viewer bordered so it reads as part of the bubble.
                  "absolute left-1/2 size-2 -translate-x-1/2 rotate-45 border-border bg-popover",
                  // Border only on the two edges pointing away from the bubble,
                  // so the arrow continues its outline instead of drawing a
                  // line across the middle.
                  pos.side === "bottom"
                    ? "-top-1 border-l border-t"
                    : "-bottom-1 border-b border-r",
                )}
              />
            </div>
          </div>,
          document.body,
        )}
    </span>
  );
}
