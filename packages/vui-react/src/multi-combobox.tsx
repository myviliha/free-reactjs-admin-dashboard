"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  MULTI_COMBOBOX_CHEVRON,
  MULTI_COMBOBOX_PLACEHOLDER,
  MULTI_COMBOBOX_SKELETON,
  MULTI_COMBOBOX_STATES,
  MULTI_COMBOBOX_TAG,
  MULTI_COMBOBOX_TAG_LABEL,
  MULTI_COMBOBOX_TAG_REMOVE,
  MULTI_COMBOBOX_TAG_REMOVE_ICON,
  MULTI_COMBOBOX_TAGS,
  MULTI_COMBOBOX_TRIGGER,
  PICKER_ANCHOR,
  PICKER_EMPTY,
  PICKER_ERROR,
  PICKER_LIST,
  PICKER_OPTION,
  PICKER_OPTION_CHECK,
  PICKER_PANEL,
  PICKER_SEARCH_ICON,
  PICKER_SEARCH_INPUT,
  PICKER_SEARCH_ROW,
  PICKER_SPINNER,
  SELECT_ITEM_HIGHLIGHT,
} from "./class-variants";
import { Check, ChevronDown, Search, Spinner, Close as X } from "./icons";
import type { SelectOption } from "./select";
import { Skeleton } from "./skeleton";
import { StaticOverlays } from "./static-overlays";
import { type AsyncOptionSource, useAsyncOptions } from "./use-async-options";
import { cn } from "./utils";

export type { AsyncOption, AsyncOptionSource } from "./use-async-options";

type Placement = {
  left: number;
  width: number;
  top?: number;
  bottom?: number;
  maxHeight: number;
};

export interface MultiComboboxProps {
  /** Selected option values. */
  value: string[];
  onValueChange: (value: string[]) => void;
  /** Static options. Omit when using `source` (async). */
  options?: SelectOption[];
  /** Async source: lazy-load on open + debounced search, and batch-resolve the
   *  selected values' labels via its `resolveOptions`. Takes over from `options`. */
  source?: AsyncOptionSource;
  /** Invalidate the async cache + reload on next open (cascade parent change). */
  resetKey?: string;
  id?: string;
  ariaLabel?: string;
  disabled?: boolean;
  placeholder?: string;
  /** The id the static edition pairs this trigger with its panel by (`PD-158`). */
  staticId?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  loadingText?: string;
  errorText?: string;
  invalid?: boolean;
  className?: string;
}

/**
 * Searchable **multi-select**. Same portal-popover as {@link Combobox}, but holds
 * a SET of values rendered as removable chips; picking an option toggles it and
 * keeps the popover open. Pass a static `options` array or an async `source`
 * (fetch on open, debounced search, batch label-resolve of the selected values).
 * The value is a `string[]`. Keyboard: type to filter, ↑/↓ to move, Enter to
 * toggle, Esc to close.
 */
export function MultiCombobox({
  value,
  onValueChange,
  options,
  source,
  resetKey,
  id,
  ariaLabel,
  disabled = false,
  placeholder = "Select…",
  staticId,
  searchPlaceholder = "Search…",
  emptyText = "No matches",
  loadingText = "Loading…",
  errorText = "Couldn't load — retry",
  invalid = false,
  className,
}: MultiComboboxProps) {
  const staticOpen = React.useContext(StaticOverlays);
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const [pos, setPos] = React.useState<Placement | null>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const isAsync = !!source;
  const async = useAsyncOptions({ source, open, search: query, value, resetKey });

  const list = React.useMemo(() => {
    if (isAsync) return async.options;
    const opts = options ?? [];
    const q = query.trim().toLowerCase();
    return q ? opts.filter((o) => o.label.toLowerCase().includes(q)) : opts;
  }, [isAsync, async.options, options, query]);

  // Selected values → labels (from resolved/static options). A value with no
  // label yet shimmers and then reads "—": the stored id is never shown.
  const pool = React.useMemo(
    () => (isAsync ? async.options : (options ?? [])),
    [isAsync, async.options, options],
  );
  const labelOf = React.useCallback((v: string) => pool.find((o) => o.value === v)?.label, [pool]);

  const place = React.useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const below = window.innerHeight - r.bottom;
    const above = r.top;
    const openUp = below < 280 && above > below;
    setPos({
      left: r.left,
      width: r.width,
      top: openUp ? undefined : r.bottom + 4,
      bottom: openUp ? window.innerHeight - r.top + 4 : undefined,
      maxHeight: Math.min(300, (openUp ? above : below) - 8),
    });
  }, []);

  React.useLayoutEffect(() => {
    if (!open) return;
    place();
    const reflow = () => place();
    window.addEventListener("scroll", reflow, true);
    window.addEventListener("resize", reflow);
    return () => {
      window.removeEventListener("scroll", reflow, true);
      window.removeEventListener("resize", reflow);
    };
  }, [open, place]);

  React.useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    const t = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(t);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t) || listRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  React.useEffect(() => {
    setActive((i) => Math.min(i, Math.max(0, list.length - 1)));
  }, [list.length]);

  const toggle = (v: string) => {
    onValueChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, list.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const o = list[active];
      if (o) toggle(o.value);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "Backspace" && !query && value.length) {
      // Backspace on an empty query removes the last chip.
      onValueChange(value.slice(0, -1));
    }
  };

  const showLoading = isAsync && async.loading && list.length === 0;
  const showError = isAsync && async.error && !async.loading;

  /** The panel's contents, shared by the measured path and the static one. */
  const panelBody = (
    <>
      <div className={PICKER_SEARCH_ROW}>
        <Search className={PICKER_SEARCH_ICON} />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={searchPlaceholder}
          aria-label={ariaLabel ? `Search ${ariaLabel}` : "Search"}
          className={PICKER_SEARCH_INPUT}
        />
        {isAsync && async.loading && <Spinner className={PICKER_SPINNER} />}
      </div>
      <div
        role="listbox"
        aria-multiselectable="true"
        aria-label={ariaLabel}
        className={PICKER_LIST}
      >
        {showLoading ? (
          <div className={PICKER_EMPTY}>{loadingText}</div>
        ) : showError ? (
          <button type="button" onClick={async.reload} className={PICKER_ERROR}>
            {errorText}
          </button>
        ) : list.length === 0 ? (
          <div className={PICKER_EMPTY}>{emptyText}</div>
        ) : (
          list.map((o, i) => {
            const isSelected = value.includes(o.value);
            return (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActive(i)}
                onClick={() => toggle(o.value)}
                className={cn(
                  PICKER_OPTION,
                  i === active && SELECT_ITEM_HIGHLIGHT,
                  isSelected && "bg-accent/60",
                )}
              >
                <span className={MULTI_COMBOBOX_TAG_LABEL}>{o.label}</span>
                {isSelected && <Check className={PICKER_OPTION_CHECK} />}
              </button>
            );
          })
        )}
      </div>
    </>
  );

  return (
    <div className={cn(PICKER_ANCHOR, className)} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        aria-haspopup="listbox"
        data-vui-menu={staticId}
        aria-expanded={open}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(MULTI_COMBOBOX_TRIGGER, MULTI_COMBOBOX_STATES[invalid ? "invalid" : "valid"])}
      >
        <span className={MULTI_COMBOBOX_TAGS}>
          {value.length === 0 ? (
            <span className={MULTI_COMBOBOX_PLACEHOLDER}>{placeholder}</span>
          ) : (
            value.map((v) => (
              <span key={v} className={MULTI_COMBOBOX_TAG}>
                <span className={MULTI_COMBOBOX_TAG_LABEL}>
                  {labelOf(v) ??
                    (async.resolving ? <Skeleton className={MULTI_COMBOBOX_SKELETON} /> : "—")}
                </span>
                <span
                  role="button"
                  tabIndex={-1}
                  aria-label={`Remove ${labelOf(v) ?? "selection"}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(v);
                  }}
                  className={MULTI_COMBOBOX_TAG_REMOVE}
                >
                  <X className={MULTI_COMBOBOX_TAG_REMOVE_ICON} />
                </span>
              </span>
            ))
          )}
        </span>
        <ChevronDown
          className={cn(MULTI_COMBOBOX_CHEVRON, open && "rotate-180")}
          style={{ marginTop: 2 }}
          aria-hidden="true"
        />
      </button>
      {/*
        The panel, rendered once and placed by whichever path is in play.

        The portal below cannot be server-rendered: it is gated on `open`, on a `pos` from a layout
        effect and on `typeof document`, so a static export produced a trigger announcing a listbox
        and no list (`PD-158`). `StaticOverlays` renders it in flow, anchored by the wrapper that is
        already `relative`.
      */}
      {staticOpen ? (
        <div
          data-vui-panel=""
          className={cn("absolute top-full left-0 z-[200] w-full", PICKER_PANEL)}
        >
          {panelBody}
        </div>
      ) : null}
      {!staticOpen &&
        open &&
        pos &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={listRef}
            style={{
              position: "fixed",
              left: pos.left,
              width: pos.width,
              top: pos.top,
              bottom: pos.bottom,
              maxHeight: pos.maxHeight,
            }}
            className={PICKER_PANEL}
          >
            {panelBody}
          </div>,
          document.body,
        )}
    </div>
  );
}
