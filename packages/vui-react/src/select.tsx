"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  COMBOBOX_CHEVRON,
  PICKER_EMPTY,
  PICKER_ERROR,
  PICKER_OPTION_CHECK,
  RECORD_VALUE_SKELETON,
  SELECT_CONTENT,
  SELECT_ITEM,
  SELECT_ITEM_ACTIVE,
  SELECT_ITEM_HIGHLIGHT,
  SELECT_PLACEHOLDER,
  SELECT_TRIGGER,
} from "./class-variants";
import { Check, ChevronDown, Spinner } from "./icons";
import { Skeleton } from "./skeleton";
import { StaticOverlays } from "./static-overlays";
import { type AsyncOptionSource, useAsyncOptions } from "./use-async-options";
import { cn } from "./utils";

export interface SelectOption {
  value: string;
  label: string;
}

type Placement = {
  left: number;
  width: number;
  top?: number;
  bottom?: number;
  maxHeight: number;
};

export interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  /** Static options. Omit when using `source` (async). */
  options?: SelectOption[];
  /** Async option source — loads on open (no search box; use `Combobox` for a
   *  searchable remote list). The set value's label resolves via one record. */
  source?: AsyncOptionSource;
  /** Changing this invalidates the async cache + reloads on next open. */
  resetKey?: string;
  id?: string;
  ariaLabel?: string;
  placeholder?: string;
  loadingText?: string;
  errorText?: string;
  /** Applied to the root (e.g. width in a flex row). */
  className?: string;
  /**
   * Declared, not spread. `FormControl` is a Radix `Slot.Root` that hands its child
   * `aria-invalid` and `aria-describedby`, and this component destructures its props with no rest
   * element, so both were being dropped on the floor: the trigger stayed grey while every other
   * field in the form went red, and the error text was announced to nobody. Naming them is what
   * makes `SELECT_TRIGGER`'s invalid variant reachable at all.
   */
  "aria-invalid"?: boolean | "true" | "false";
  "aria-describedby"?: string;
  /**
   * The id the static edition pairs this trigger with its list by.
   *
   * Rendered as `data-vui-menu` on the trigger, the same convention `Dropdown` uses, so one emitter
   * pass handles both. Inert everywhere else: nothing in React reads it (`PD-158`).
   */
  staticId?: string;
}

/**
 * Custom single-select styled to match the app (Input-like trigger + popover
 * list), replacing the native `<select>`. Click-to-open, outside-click/Escape
 * to close, checkmark on the active option. The list is rendered in a portal
 * with fixed positioning so it floats above any scrolling/overflow container
 * (forms, dialogs, the tab-kept pages) instead of being clipped. Pass static
 * `options`, or a `source` to load on open (for a searchable remote list use
 * {@link Combobox} instead).
 */
export function Select({
  value,
  onValueChange,
  options,
  source,
  resetKey,
  id,
  ariaLabel,
  placeholder = "Select…",
  loadingText = "Loading…",
  errorText = "Couldn't load — retry",
  className,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  staticId,
}: SelectProps) {
  const staticOpen = React.useContext(StaticOverlays);
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState<Placement | null>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  const isAsync = !!source;
  const async = useAsyncOptions({ source, open, search: "", value, resetKey });
  const list = isAsync ? async.options : (options ?? []);

  const place = React.useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const below = window.innerHeight - r.bottom;
    const above = r.top;
    // Flip up when there isn't room below and there's more room above.
    const openUp = below < 240 && above > below;
    setPos({
      left: r.left,
      width: r.width,
      top: openUp ? undefined : r.bottom + 4,
      bottom: openUp ? window.innerHeight - r.top + 4 : undefined,
      maxHeight: Math.min(240, (openUp ? above : below) - 8),
    });
  }, []);

  React.useLayoutEffect(() => {
    if (!open) return;
    place();
    const reflow = () => place();
    // capture: catch scrolls inside any ancestor container, not just the window
    window.addEventListener("scroll", reflow, true);
    window.addEventListener("resize", reflow);
    return () => {
      window.removeEventListener("scroll", reflow, true);
      window.removeEventListener("resize", reflow);
    };
  }, [open, place]);

  React.useEffect(() => {
    if (!open) {
      setHighlight(-1);
      return;
    }
    setHighlight(list.findIndex((o) => o.value === value));
  }, [open, list, value]);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t) || listRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  /**
   * The keyboard highlight. **Focus never leaves the trigger**: the list is portalled to
   * `document.body`, so moving focus into it would put the options after every other field on the
   * page in tab order, and a user tabbing out of the trigger would leave a fixed-position listbox
   * floating over whatever they typed next. The `aria-activedescendant` pattern keeps one focus
   * point and lets the trigger's own blur close the list.
   */
  const [highlight, setHighlight] = React.useState(-1);

  const listId = React.useId();
  const optionId = (i: number) => `${listId}-option-${i}`;

  /**
   * Keyboard operation, which the Radix select this replaced had for free. Without it the control
   * opened on Enter and then did nothing: no way to move, choose, or dismiss without a mouse.
   */
  const onTriggerKeyDown = (e: React.KeyboardEvent) => {
    const move = (to: number) => {
      e.preventDefault();
      if (!open) setOpen(true);
      if (list.length > 0) setHighlight(((to % list.length) + list.length) % list.length);
    };
    switch (e.key) {
      case "ArrowDown":
        return move(open ? highlight + 1 : Math.max(0, highlight));
      case "ArrowUp":
        return move(open ? highlight - 1 : Math.max(0, highlight));
      case "Home":
        return open && move(0);
      case "End":
        return open && move(list.length - 1);
      case "Enter":
      case " ":
        e.preventDefault();
        if (!open) return setOpen(true);
        if (list[highlight]) {
          onValueChange(list[highlight].value);
          setOpen(false);
        }
        return;
      case "Escape":
        // Handled by the document listener too, but stop it bubbling out of a dialog that would
        // also close on Escape: dismissing the list should not dismiss the form around it.
        if (open) e.stopPropagation();
        return setOpen(false);
      case "Tab":
        return setOpen(false);
    }
  };

  const selected = list.find((o) => o.value === value);
  // A set value whose async label hasn't landed shimmers: showing the id would
  // be meaningless, and the placeholder would read as "nothing selected".
  const resolvingLabel = Boolean(value) && !selected && async.resolving;
  const showLoading = isAsync && async.loading && list.length === 0;
  const showError = isAsync && async.error && !async.loading;

  /** The list's contents, shared by the measured path and the static one. */
  const listBody = (
    <>
      {showLoading ? (
        <div className={PICKER_EMPTY}>{loadingText}</div>
      ) : showError ? (
        <button type="button" onClick={async.reload} className={PICKER_ERROR}>
          {errorText}
        </button>
      ) : list.length === 0 ? (
        <div className={PICKER_EMPTY}>{placeholder}</div>
      ) : (
        list.map((o, i) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              id={optionId(i)}
              type="button"
              role="option"
              tabIndex={-1}
              aria-selected={active}
              // The trigger holds focus for the whole interaction. Without this the
              // mousedown blurs it, the blur handler closes the list, and the click never
              // lands on an option that is no longer there.
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setHighlight(i)}
              onClick={() => {
                onValueChange(o.value);
                setOpen(false);
              }}
              className={cn(
                SELECT_ITEM,
                active && SELECT_ITEM_ACTIVE,
                i === highlight && SELECT_ITEM_HIGHLIGHT,
              )}
            >
              <span className="truncate">{o.label}</span>
              {active && <Check className={PICKER_OPTION_CHECK} />}
            </button>
          );
        })
      )}
    </>
  );

  return (
    <div className={cn("relative", className)} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        data-vui-menu={staticId}
        aria-label={ariaLabel}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open && highlight >= 0 ? optionId(highlight) : undefined}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onTriggerKeyDown}
        onBlur={() => setOpen(false)}
        className={cn(SELECT_TRIGGER)}
      >
        {resolvingLabel ? (
          <Skeleton className={RECORD_VALUE_SKELETON} />
        ) : (
          <span className={cn("truncate", !selected && SELECT_PLACEHOLDER)}>
            {selected ? selected.label : placeholder}
          </span>
        )}
        {isAsync && async.loading ? (
          <Spinner
            className="size-3.5 shrink-0 animate-spin text-muted-foreground"
            aria-hidden="true"
          />
        ) : (
          <ChevronDown className={cn(COMBOBOX_CHEVRON, open && "rotate-180")} aria-hidden="true" />
        )}
      </button>
      {/*
        The list, rendered once and placed by whichever path is in play.

        **The static path exists because none of this can be server-rendered.** The portal below is
        gated on `open`, on a `pos` from a layout effect and on `typeof document`, so a static export
        produced a trigger announcing a listbox and no list at all (`PD-158`). `StaticOverlays`
        renders it in flow instead, anchored by the wrapper that is already `relative`, which needs no
        measurement.

        One `listBody`, not two: a list written twice is two lists, and this one carries loading,
        error, empty and option states that would drift apart.
      */}
      {staticOpen ? (
        <div
          data-slot="select-content"
          data-vui-panel=""
          role="listbox"
          aria-label={ariaLabel}
          tabIndex={-1}
          className={cn("absolute top-full left-0 z-[200] w-full", SELECT_CONTENT)}
        >
          {listBody}
        </div>
      ) : null}
      {!staticOpen &&
        open &&
        pos &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={listRef}
            data-slot="select-content"
            id={listId}
            role="listbox"
            aria-label={ariaLabel}
            tabIndex={-1}
            style={{
              position: "fixed",
              left: pos.left,
              width: pos.width,
              top: pos.top,
              bottom: pos.bottom,
              maxHeight: pos.maxHeight,
            }}
            className={SELECT_CONTENT}
          >
            {listBody}
          </div>,
          document.body,
        )}
    </div>
  );
}
