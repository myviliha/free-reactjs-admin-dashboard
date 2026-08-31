"use client";

import * as React from "react";
import {
  PALETTE_EMPTY,
  PALETTE_GROUP,
  PALETTE_GROUP_LABEL,
  PALETTE_INPUT,
  PALETTE_ITEM,
  PALETTE_ITEM_HINT,
  PALETTE_ITEM_ICON,
  PALETTE_ITEM_LABEL,
  PALETTE_LIST,
  PALETTE_OVERLAY,
  PALETTE_PANEL,
  PALETTE_SEARCH_ICON,
  PALETTE_SEARCH_ROW,
} from "./class-variants";
import { filterActions, groupActions } from "./command-palette-core";
import { Kbd } from "./kbd";
import { cn } from "./utils";

/**
 * The search moved to `command-palette-core.ts` on 2026-08-20, so both editions match on the same
 * fields in the same order. Re-exported here for anyone who wants to filter a list the palette's way.
 */
export { filterActions, groupActions } from "./command-palette-core";

/**
 * A generic ⌘K-style command palette. Fully controlled and headless of any
 * router — the host owns the open state, supplies the `actions`, and each
 * action carries its own `onSelect` (navigate, open a modal, run a command…).
 *
 * ```tsx
 * const [open, setOpen] = useState(false);
 * <CommandPalette
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   actions={[
 *     { id: "home", label: "Home", group: "Go to", onSelect: () => router.push("/") },
 *   ]}
 * />
 * ```
 */
export type CommandAction = {
  /** Stable unique key. */
  id: string;
  label: string;
  /** Optional group heading; actions with the same group render together. */
  group?: string;
  /** Optional leading icon (anything that takes a `className`). */
  icon?: React.ComponentType<{ className?: string }>;
  /** Extra classes for the icon (e.g. a brand color). */
  iconClassName?: string;
  /** Extra text matched by the search, beyond `label` and `group`. */
  keywords?: string;
  /** Runs when the action is chosen (Enter or click). */
  onSelect: () => void;
};

export function CommandPalette({
  open,
  onClose,
  actions,
  placeholder = "Search…",
  emptyMessage,
}: {
  open: boolean;
  onClose: () => void;
  actions: CommandAction[];
  placeholder?: string;
  /** Message when the search matches nothing; `{q}` in the default is the query. */
  emptyMessage?: string;
}) {
  const [q, setQ] = React.useState("");
  const [active, setActive] = React.useState(0);
  const listRef = React.useRef<HTMLDivElement>(null);
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // On open: reset, focus the search, and close on an outside click.
  React.useEffect(() => {
    if (!open) return;
    setQ("");
    setActive(0);
    inputRef.current?.focus();
    const onDown = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, onClose]);

  const results = React.useMemo(() => filterActions(actions, q), [q, actions]);
  const groups = React.useMemo(() => groupActions(results), [results]);

  // Clamp the highlight if the result set shrank.
  React.useEffect(() => {
    setActive((i) => (i >= results.length ? Math.max(results.length - 1, 0) : i));
  }, [results.length]);

  // Keep the highlighted row scrolled into view.
  React.useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const run = React.useCallback(
    (a: CommandAction) => {
      onClose();
      a.onSelect();
    },
    [onClose],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const a = results[active];
      if (a) run(a);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  if (!open) return null;

  let flatIndex = -1;
  return (
    <div className={PALETTE_OVERLAY}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className={PALETTE_PANEL}
        style={{ "--vui-pop-origin": "top center" } as React.CSSProperties}
      >
        <div className={PALETTE_SEARCH_ROW}>
          <SearchGlyph />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            aria-label={placeholder}
            className={PALETTE_INPUT}
          />
          <Kbd className={PALETTE_SEARCH_ICON}>Esc</Kbd>
        </div>

        <div ref={listRef} className={PALETTE_LIST}>
          {results.length === 0 ? (
            <p className={PALETTE_EMPTY}>{emptyMessage ?? `No results for “${q}”.`}</p>
          ) : (
            groups.map(([group, items]) => (
              <div key={group || "_"} className={PALETTE_GROUP}>
                {group && <p className={PALETTE_GROUP_LABEL}>{group}</p>}
                {items.map((a) => {
                  flatIndex += 1;
                  const idx = flatIndex;
                  const Icon = a.icon;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      data-active={idx === active}
                      onMouseMove={() => setActive(idx)}
                      onClick={() => run(a)}
                      className={PALETTE_ITEM}
                    >
                      {Icon && (
                        <Icon
                          className={cn(
                            PALETTE_ITEM_ICON,
                            a.iconClassName ?? "text-muted-foreground",
                          )}
                        />
                      )}
                      <span className={PALETTE_ITEM_LABEL}>{a.label}</span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/** Inline magnifier so the palette carries no icon dependency. */
function SearchGlyph() {
  return (
    <svg
      viewBox="0 0 15 15"
      aria-hidden="true"
      className={PALETTE_ITEM_HINT}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    >
      <circle cx="6.5" cy="6.5" r="4" />
      <path d="M9.5 9.5 L13 13" strokeLinecap="round" />
    </svg>
  );
}
