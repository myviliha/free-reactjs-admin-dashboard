"use client";

import * as React from "react";

import {
  type AsyncOption,
  batch,
  mergeOptions,
  asValues as norm,
  share,
} from "./async-options-core";

/**
 * The request discipline moved to `async-options-core.ts` on 2026-08-20: `share`, `batch` and the
 * merge rule are what a second edition would otherwise reimplement, and getting them subtly wrong
 * costs requests rather than failing a test. **The public API is unchanged**, including the two
 * helpers this file has always exported for its own tests.
 */
export type { AsyncOption, AsyncOptionBase } from "./async-options-core";
export { batch, mergeOptions, share } from "./async-options-core";

/**
 * An async option source for a picker (Combobox / Select). Declaring this lets a
 * control fetch its options **on demand** instead of receiving a fully-loaded
 * static `options` array — so a table of rows never eager-loads its reference
 * catalogs just to render.
 */
export interface AsyncOptionSource {
  /**
   * Lazy option source. Called once when the control first OPENS (`search: ""`),
   * then debounced on each keystroke (`search`: current text). Abort superseded
   * requests via `signal`. The empty-search result is cached for the control's
   * lifetime; a `resetKey` change (cascading) invalidates it.
   */
  loadOptions: (args: { search: string; signal: AbortSignal }) => Promise<AsyncOption[]>;
  /**
   * Resolve the label for an ALREADY-SET value without loading the full list —
   * used in edit/view and for a preselected default. Called once per distinct
   * value; the result is merged so the collapsed control shows the right label
   * having fetched exactly one record.
   */
  resolveOption?: (value: string) => Promise<AsyncOption | null>;
  /**
   * Batch companion to `resolveOption` for multi-select: resolve the labels for
   * ALL currently-set values in one call (never load the whole list). Preferred
   * over `resolveOption` when set — the missing values are resolved together.
   */
  resolveOptions?: (values: string[]) => Promise<AsyncOption[]>;
}

export interface AsyncOptionsState {
  /** Options to render (the empty-search list, or current search results), with
   *  any resolved set-value option merged in so its label always shows. */
  options: AsyncOption[];
  loading: boolean;
  /** A set value's label is still being resolved. Show a skeleton rather than
   *  the raw id: the id is meaningless to a reader. Once this is `false` and no
   *  option matched, the value genuinely has no label. */
  resolving: boolean;
  error: boolean;
  /** Retry the current load (for the in-dropdown error state). */
  reload: () => void;
}

/**
 * Engine behind async pickers. Fetches nothing until `open`; loads the list on
 * first open, debounced-reloads on `search`, resolves a set `value`'s label via
 * `resolveOption` (one record — never the whole list), and drops its cache when
 * `resetKey` changes (cascading `dependsOn`). Pass no `source` and it's inert, so
 * a control can support both static and async options with one code path.
 *
 * The source is held in a ref, so callers may rebuild the `source` object every
 * render (RecordView does, to inject the live draft) without triggering refetches
 * — only `open` / `search` / `resetKey` / `value` drive loads.
 */
export function useAsyncOptions(args: {
  source?: AsyncOptionSource;
  open: boolean;
  search: string;
  value?: string | string[];
  /** Changing this clears the cache + forces a reload on next open (cascades). */
  resetKey?: string;
  debounceMs?: number;
}): AsyncOptionsState {
  const { source, open, search, value, resetKey, debounceMs = 250 } = args;

  const sourceRef = React.useRef(source);
  sourceRef.current = source;
  const hasSource = !!source;
  const hasResolve = !!(source?.resolveOption || source?.resolveOptions);

  const [base, setBase] = React.useState<AsyncOption[]>([]); // empty-search cache
  const [results, setResults] = React.useState<AsyncOption[] | null>(null); // active search
  const [resolved, setResolved] = React.useState<Record<string, AsyncOption>>({});
  const resolvedRef = React.useRef(resolved);
  resolvedRef.current = resolved;
  const [loading, setLoading] = React.useState(false);
  // True from the first paint when there's a value to resolve, so a read cell
  // shows a skeleton instead of flashing the id (or "no label") first.
  const [resolving, setResolving] = React.useState(() => hasResolve && norm(value).length > 0);
  const [error, setError] = React.useState(false);
  const [nonce, setNonce] = React.useState(0);
  const baseLoaded = React.useRef(false);

  const q = search.trim();
  const valueKey = norm(value).join("\u0000");

  // Cascade parent changed → forget everything; next open reloads.
  React.useEffect(() => {
    baseLoaded.current = false;
    setBase([]);
    setResults(null);
    setResolved({});
  }, [resetKey]);

  // Resolve labels for already-set value(s) without loading the full list —
  // batched via `resolveOptions` when present, else one record each.
  React.useEffect(() => {
    if (!hasResolve) return setResolving(false);
    const src = sourceRef.current!;
    const missing = norm(value).filter((v) => !resolvedRef.current[v]);
    if (!missing.length) return setResolving(false);
    let live = true;
    setResolving(true);
    // One request per source rather than per value: `batch` gathers this
    // tick's ids into a single `resolveOptions` call, and `share` collapses
    // identical `resolveOption` calls that are already in flight.
    const resolveAll = src.resolveOptions;
    const resolved: Promise<AsyncOption[]> = resolveAll
      ? batch(resolveAll, missing)
      : Promise.all(
          missing.map((v) =>
            share(src.resolveOption!, JSON.stringify([resetKey, v]), () =>
              src.resolveOption!(v)
                .then((o) => (o ? [o] : []))
                .catch(() => []),
            ),
          ),
        ).then((os) => os.flat());
    void resolved.then((opts) => {
      if (!live) return;
      setResolving(false);
      if (!opts.length) return;
      setResolved((prev) => {
        const next = { ...prev };
        for (const o of opts) next[String(o.value)] = o;
        return next;
      });
    });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasResolve, valueKey, resetKey]);

  // Load on open (empty search, cached once) / search (debounced) while open.
  React.useEffect(() => {
    if (!hasSource || !open) return;
    if (!q && baseLoaded.current) {
      setResults(null); // back to the cached full list, no refetch
      return;
    }
    const ctrl = new AbortController();
    let live = true;
    setLoading(true);
    setError(false);
    const t = setTimeout(
      () => {
        sourceRef
          .current!.loadOptions({ search: q, signal: ctrl.signal })
          .then((opts) => {
            if (!live) return;
            if (q) setResults(opts);
            else {
              setBase(opts);
              setResults(null);
              baseLoaded.current = true;
            }
            setLoading(false);
          })
          .catch((e: unknown) => {
            if (!live || (e instanceof DOMException && e.name === "AbortError")) return;
            setError(true);
            setLoading(false);
          });
      },
      q ? debounceMs : 0,
    );
    return () => {
      live = false;
      ctrl.abort();
      clearTimeout(t);
    };
  }, [hasSource, open, q, nonce, resetKey, debounceMs]);

  const options = React.useMemo(
    () => (hasSource ? mergeOptions({ search: q, results, base, resolved }) : []),
    [hasSource, q, results, base, resolved],
  );

  const reload = React.useCallback(() => {
    baseLoaded.current = false;
    setNonce((n) => n + 1);
  }, []);

  return { options, loading, resolving, error, reload };
}
