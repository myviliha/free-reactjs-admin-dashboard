"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { ANCHOR_GAP, anchorPosition } from "./anchor-core";
import { Checkbox } from "./checkbox";
import {
  DROPDOWN_CONTENT,
  DROPDOWN_ITEM,
  DROPDOWN_ITEM_CHECK,
  DROPDOWN_ITEM_LABEL,
  DROPDOWN_LABEL,
  DROPDOWN_TRIGGER,
  DROPDOWN_TRIGGER_ACTIVE,
  DROPDOWN_TRIGGER_BARE,
  DROPDOWN_TRIGGER_IDLE,
} from "./class-variants";
import { StaticOverlays } from "./static-overlays";
import { cn } from "./utils";

/** Re-exported from its own module, which is where it lives now. */
export { StaticOverlays };

interface DropdownProps {
  label: string;
  icon?: React.ReactNode;
  align?: "start" | "end";
  /**
   * The panel's contents.
   *
   * A function receives a `close` callback. The click handler below closes on any `menuitem`, which
   * covers a list of actions and does not cover a panel with its own close button: the reference's
   * notification panel has an X in its header, and an X that does not dismiss is worse than no X.
   */
  children: React.ReactNode | ((close: () => void) => React.ReactNode);
  /** Accessible name for icon-only triggers (when label is empty). */
  ariaLabel?: string;
  /** Render the trigger as a compact toolbar button (default) or a plain one. */
  active?: boolean;
  /** Extra classes on the label text — e.g. `hidden sm:inline` to hide it on
   *  mobile so the trigger collapses to an icon-only button. */
  labelClassName?: string;
  /**
   * Replace the trigger's contents entirely.
   *
   * The default trigger is a toolbar button: an icon and a truncated label. An account menu is not
   * that. It is an avatar, a name and a chevron that turns, and a notification bell carries an
   * unread dot. Both still want everything this component already does (portalling out of a
   * scrolling ancestor, outside-click, Escape, flipping when it would run off the viewport), so the
   * trigger is a slot rather than a reason to write a second dropdown.
   *
   * `ariaLabel` is required alongside it: arbitrary trigger content has no reliable accessible name.
   *
   * A function receives the open state, because a trigger usually needs it: a chevron that does not
   * turn is worse than no chevron, and the caller cannot know when the panel opened otherwise.
   */
  trigger?: React.ReactNode | ((open: boolean) => React.ReactNode);
  /** Extra classes on the panel, for a menu that is not a list of plain items. */
  panelClassName?: string;
  /**
   * The gap between the trigger's bottom and the panel's top, in pixels.
   *
   * Defaults to `ANCHOR_GAP`. A control sitting in a fixed header wants the panel to begin at the
   * header's bottom edge, which is further than four pixels from a vertically centred trigger, and
   * how far is a fact about that header rather than about this component.
   */
  offset?: number;
  /**
   * Which side of the trigger the panel opens on. `"bottom"` by default.
   *
   * `"right"` is a flyout beside a control in a vertical rail, and it slides to fit near the bottom
   * edge rather than flipping above the trigger: a flyout has to stay visibly attached to the icon
   * that opened it, which in a rail with no labels is the whole affordance.
   */
  placement?: "bottom" | "right";
  /**
   * The trigger's native `title`, for a hover hint.
   *
   * `ariaLabel` names the control for assistive tech and is invisible to a mouse. In the collapsed
   * rail the icon is the only label there is, and the leaf rows beside it carry a `title`, so a group
   * trigger without one loses the hint its neighbours keep in the same column (`PD-118`).
   */
  title?: string;
  /** Whether the trigger renders as a button at all. A bare slot for an avatar row wants no chrome. */
  bare?: boolean;
  /**
   * The bare trigger's own classes.
   *
   * `bare` says "not a toolbar button"; it cannot also know what the caller's trigger *is*. A header
   * bell is a 44px circle and an account row is a borderless flex row, and both are bare.
   */
  triggerClassName?: string;
  /**
   * The id the static edition pairs this trigger with its panel by.
   *
   * Rendered as `data-vui-menu` on the trigger and used by `scripts/page-templates.mjs` to find the
   * panel that belongs to it. Inert everywhere else: nothing in React reads it.
   */
  staticId?: string;
}

/** Minimal click-to-open menu with outside-click + Escape to close. */
export function Dropdown({
  label,
  icon,
  align = "start",
  children,
  ariaLabel,
  active,
  labelClassName,
  trigger,
  panelClassName,
  bare,
  triggerClassName,
  staticId,
  offset,
  placement = "bottom",
  title,
}: DropdownProps) {
  const staticOpen = React.useContext(StaticOverlays);
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  // The menu is portalled to the body and positioned against the trigger.
  // Rendered in place it was clipped by any scrolling ancestor (a form's scroll
  // region, a section card) and sat under the slide-over, so it was either
  // invisible or unclickable exactly where it mattered.
  const [pos, setPos] = React.useState<{
    top: number;
    left?: number;
    right?: number;
  } | null>(null);

  React.useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      // The sum lives in anchor-core so the Angular edition places its menus the same way rather
      // than re-deriving it from this file's comment (`PD-049`).
      const { top, left, right } = anchorPosition(
        r,
        { width: window.innerWidth, height: window.innerHeight },
        {
          align,
          placement,
          panelHeight: menuRef.current?.offsetHeight ?? 0,
          panelWidth: menuRef.current?.offsetWidth ?? 0,
          gap: offset,
        },
      );
      setPos({ top, left, right });
    };
    place();
    /**
     * A second pass once the panel exists, because the first one cannot measure it.
     *
     * The portal is gated on `open && pos`, so on the pass that computes `pos` the menu is not in the
     * document and `offsetHeight` is 0. `anchorPosition` reads that as "no opinion" and skips both the
     * upward flip and the rail flyout's vertical clamp, and nothing re-ran to correct it: the effect's
     * deps do not change when the node mounts. The docblock in `anchor-core.ts` promises "the second
     * pass corrects it once the element can measure itself", and **there was no second pass**, so a
     * menu near the bottom of the viewport simply hung off it. Found by opening a seven-item rail
     * flyout at 820px (`PD-117`).
     *
     * One frame, not a loop: `place` only sets state, and after the panel is mounted its height stops
     * changing.
     */
    const frame = requestAnimationFrame(place);
    const reflow = () => place();
    window.addEventListener("scroll", reflow, true);
    window.addEventListener("resize", reflow);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", reflow, true);
      window.removeEventListener("resize", reflow);
    };
  }, [open, align, offset, placement]);

  React.useEffect(() => {
    if (!open) return;
    function onDocMouseDown(event: MouseEvent) {
      const target = event.target as Node;
      // The menu is outside `ref` now (it's portalled), so check it too.
      if (!ref.current?.contains(target) && !menuRef.current?.contains(target)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // No `data-slot` on this wrapper: it exists to position the trigger, and the Vue edition has no
  // equivalent because Reka portals instead. Marking an implementation detail as a component makes
  // `check:parity` report a difference that is correct in both editions.
  return (
    <div className="relative" ref={ref}>
      <button
        ref={triggerRef}
        data-slot="dropdown-menu-trigger"
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        data-vui-menu={staticId}
        aria-label={ariaLabel ?? label}
        title={title}
        className={
          bare
            ? cn(DROPDOWN_TRIGGER_BARE, triggerClassName)
            : cn(DROPDOWN_TRIGGER, active ? DROPDOWN_TRIGGER_ACTIVE : DROPDOWN_TRIGGER_IDLE)
        }
      >
        {(typeof trigger === "function" ? trigger(open) : trigger) ?? (
          <>
            {icon}
            {label && <span className={cn("truncate", labelClassName)}>{label}</span>}
          </>
        )}
      </button>
      {/*
        The static edition's panel: open, in flow, anchored by the `relative` wrapper above.

        `absolute` rather than `fixed`, so no measurement is needed and no script has to reimplement
        `anchorPosition`. `align` becomes an edge and the offset becomes a margin, which is the same
        two decisions the measured path makes, expressed in CSS (`PD-158`).
      */}
      {staticOpen ? (
        <div
          data-slot="dropdown-menu-content"
          data-vui-panel=""
          role="menu"
          aria-label={ariaLabel ?? label}
          className={cn(
            "absolute top-full",
            align === "end" ? "right-0" : "left-0",
            DROPDOWN_CONTENT,
            panelClassName,
          )}
          style={{ marginTop: offset ?? ANCHOR_GAP }}
        >
          {typeof children === "function" ? children(() => undefined) : children}
        </div>
      ) : null}
      {!staticOpen &&
        open &&
        pos &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            data-slot="dropdown-menu-content"
            role="menu"
            aria-label={ariaLabel ?? label}
            style={{ top: pos.top, left: pos.left, right: pos.right }}
            className={cn("fixed", DROPDOWN_CONTENT, panelClassName)}
            // An action item closes the menu; a checkable one does not, because the whole point of
            // a column toggle is ticking several without reopening. `data-keep-open` is set by
            // `DropdownItem` itself, so a caller never has to know the rule.
            onClick={(e) => {
              const item = (e.target as HTMLElement).closest("[role^='menuitem']");
              if (item && !item.hasAttribute("data-keep-open")) setOpen(false);
            }}
          >
            {typeof children === "function" ? children(() => setOpen(false)) : children}
          </div>,
          document.body,
        )}
    </div>
  );
}

interface DropdownItemProps {
  children: React.ReactNode;
  onSelect?: () => void;
  checked?: boolean;
  icon?: React.ReactNode;
  /**
   * The action exists here but cannot be taken right now.
   *
   * `aria-disabled` and not just `disabled`, and the button stays focusable, because a menu item
   * removed from the tab order is an item a keyboard reader never learns about: they arrow past a
   * gap and are told nothing. This way it is announced, its `title` explains why, and the click
   * does nothing.
   */
  disabled?: boolean;
  /** Why it is unavailable. Pair it with `disabled` rather than leaving a reader to guess. */
  title?: string;
}

export function DropdownItem({
  children,
  onSelect,
  checked,
  icon,
  disabled,
  title,
}: DropdownItemProps) {
  // `menuitemcheckbox` was hardcoded, so an action item announced as "check box, not checked".
  // The presence of `checked` is what decides which of the two this is.
  const checkable = checked !== undefined;
  return (
    <button
      data-slot="dropdown-menu-item"
      type="button"
      role={checkable ? "menuitemcheckbox" : "menuitem"}
      aria-checked={checked}
      data-keep-open={checkable ? "" : undefined}
      aria-disabled={disabled || undefined}
      title={title}
      onClick={disabled ? undefined : onSelect}
      className={DROPDOWN_ITEM}
    >
      <span className={DROPDOWN_ITEM_LABEL}>{children}</span>
      {icon}
      {checked !== undefined && (
        <Checkbox
          checked={checked}
          readOnly
          tabIndex={-1}
          aria-hidden="true"
          className={DROPDOWN_ITEM_CHECK}
        />
      )}
    </button>
  );
}

export function DropdownLabel({ children }: { children: React.ReactNode }) {
  return (
    <p data-slot="dropdown-menu-label" className={DROPDOWN_LABEL}>
      {children}
    </p>
  );
}
