"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  COMBOBOX_CHEVRON,
  COMBOBOX_SKELETON,
  COMBOBOX_TRIGGER,
  COMBOBOX_VALUE,
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
import { Check, ChevronDown, Search, Spinner } from "./icons";
import type { SelectOption } from "./select";
import { Skeleton } from "./skeleton";
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

export interface ComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  /** Static options. Omit when using `source` (async). */
  options?: SelectOption[];
  /** Async option source (lazy load on open + debounced search). Takes over from
   *  `options`; the list is fetched on demand, never on mount. */
  source?: AsyncOptionSource;
  /** Changing this invalidates the async cache + reloads on next open — wire it
   *  to a cascade parent (e.g. the selected Region for a Country picker). */
  resetKey?: string;
  id?: string;
  ariaLabel?: string;
  /** Disable the control (trigger inert, popover can't open). */
  disabled?: boolean;
  placeholder?: string;
  /** Placeholder for the filter input. */
  searchPlaceholder?: string;
  /** Shown when the query matches nothing. */
  emptyText?: string;
  /** Shown in the dropdown while an async load is in flight. */
  loadingText?: string;
  /** Shown in the dropdown when an async load fails (click to retry). */
  errorText?: string;
  /** Applied to the root (e.g. width in a flex row). */
  className?: string;
}

/**
 * Searchable single-select. Same trigger + portal-popover as {@link Select}, but
 * the popover leads with a filter input that type-narrows the options, so it
 * scales to long lists (an FK / country picker) where a plain Select doesn't.
 * Pass a static `options` array, or a `source` for async lazy loading (fetch on
 * open, debounced server search, single-record label resolve). Keyboard: type to
 * filter, ↑/↓ to move, Enter to pick, Esc to close.
 */
export function Combobox({
  value,
  onValueChange,
  options,
  source,
  resetKey,
  id,
  ariaLabel,
  disabled = false,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyText = "No matches",
  loadingText = "Loading…",
  errorText = "Couldn't load — retry",
  className,
}: ComboboxProps) {
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

  // Async: the server already applied the search, so render as-is. Static: filter
  // client-side by the query.
  const list = React.useMemo(() => {
    if (isAsync) return async.options;
    const opts = options ?? [];
    const q = query.trim().toLowerCase();
    return q ? opts.filter((o) => o.label.toLowerCase().includes(q)) : opts;
  }, [isAsync, async.options, options, query]);

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

  // Reset the query + focus the input each time it opens.
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

  // Keep the active index in range as the list shrinks/grows.
  React.useEffect(() => {
    setActive((i) => Math.min(i, Math.max(0, list.length - 1)));
  }, [list.length]);

  // Selected label: from the (async-resolved or static) options. While an async
  // label is still resolving the trigger shimmers — it never shows the raw id,
  // and it never shows the placeholder, which would read as "nothing selected".
  const pool = isAsync ? async.options : (options ?? []);
  const selected = pool.find((o) => o.value === value);
  const resolvingLabel = Boolean(value) && !selected && async.resolving;
  const commit = (v: string) => {
    onValueChange(v);
    setOpen(false);
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
      if (o) commit(o.value);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  const showLoading = isAsync && async.loading && list.length === 0;
  const showError = isAsync && async.error && !async.loading;

  return (
    <div className={cn(PICKER_ANCHOR, className)} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(COMBOBOX_TRIGGER)}
      >
        {resolvingLabel ? (
          <Skeleton className={COMBOBOX_SKELETON} />
        ) : (
          <span className={cn(COMBOBOX_VALUE, !selected && "text-muted-foreground")}>
            {selected ? selected.label : placeholder}
          </span>
        )}
        <ChevronDown className={cn(COMBOBOX_CHEVRON, open && "rotate-180")} aria-hidden="true" />
      </button>
      {open &&
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
            <div role="listbox" aria-label={ariaLabel} className={PICKER_LIST}>
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
                  const isSelected = o.value === value;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => commit(o.value)}
                      className={cn(
                        PICKER_OPTION,
                        i === active && SELECT_ITEM_HIGHLIGHT,
                        isSelected && "bg-accent/60",
                      )}
                    >
                      <span className={COMBOBOX_VALUE}>{o.label}</span>
                      {isSelected && <Check className={PICKER_OPTION_CHECK} />}
                    </button>
                  );
                })
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
