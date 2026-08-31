"use client";

/**
 * The record vocabulary's React half: the hook, and the three small components that render one value.
 *
 * **The field description itself is no longer here.** `RecordField` and every rule that reads it moved
 * to `record-field-core.ts` for wave 6 of the Vue parity epic, and are re-exported below, so nothing
 * that imports from this file changed. `RecordField<T>` still means what it meant: the core declares
 * it with two type parameters for the values a framework owns, and this file binds them to
 * `React.ReactNode` and `IconType` once.
 *
 * The page cache moved too, to `record-cache-core.ts`, because it is module state and wants its own
 * module for the same reason the toast queue does.
 *
 * **Free tier.** Nothing here may import `./record-view`, which is the paid component, and
 * `tiers.test.ts` fails the build if it ever does. The dependency runs the other way:
 * `record-view.tsx` and `record-form.tsx` both read this.
 *
 * Split out of `record-view.tsx` on 2026-08-17. See
 * `odin/design/04-packaging/01-packaging-pipeline/task.md`.
 */

import * as React from "react";
import {
  RECORD_CHIP,
  RECORD_CHIP_MORE,
  RECORD_CHIP_ROW,
  RECORD_CHIPS_SKELETON,
  RECORD_MISSING,
  RECORD_VALUE_SKELETON,
} from "./class-variants";
import type { IconType, RecordField } from "./icon-type";
import { Circle } from "./icons";
import { resetKeyOf } from "./record-field-core";
import { Skeleton } from "./skeleton";
import { Tooltip } from "./tooltip";
import { type AsyncOption, type AsyncOptionSource, useAsyncOptions } from "./use-async-options";

/**
 * The three class strings the record workflow's layout is made of. They live in `class-variants.ts`
 * with every other one (`D3`), and keep these names here because `record-form.tsx` and
 * `record-view.tsx` have always imported them from this file.
 */
export {
  RECORD_FIELD_GRID as FIELD_GRID,
  RECORD_ROW_GRID as ROW_GRID,
  RECORD_RULE as RULE,
} from "./class-variants";
export {
  clearRecordViewCache,
  type RvCacheEntry,
  rvCacheGet,
  rvCacheSet,
  rvQueryKey,
} from "./record-cache-core";
/**
 * The record vocabulary, re-exported so this stays the import path it has always been. The types and
 * rules live in `record-field-core.ts` and are shared with every other edition.
 */
export {
  emptyStateLabel,
  type FieldFilter,
  type FieldGroup,
  type FieldRules,
  type FilterControl,
  type FilterValues,
  formatPhone,
  groupSlots,
  isAsyncLabeled,
  type RowId,
  resetKeyOf,
  resolveOptions,
  type ServerQuery,
  type SortState,
  showEditActions,
  validateField,
} from "./record-field-core";
// `use-async-options.ts` is a `.ts` file, and the package `exports` wildcard only maps
// `./*` to `./src/*.tsx`, so this is the reachable name for it. It used to live on
// `record-view.tsx`, which is now the paid module.
export type { AsyncOption } from "./use-async-options";

/** Fallback column-header icon so every column title shows an icon. */
export const DEFAULT_FIELD_ICON = Circle;

/**
 * The shape an icon has to satisfy, and **not** the shape a particular set happens to have.
 *
 * This was `typeof Circle`, which pinned the type to whichever set the slot resolved to. Swapping
 * `icons.tsx` to Lucide then failed to compile in `branches-table.tsx`, forty files away, because a
 * `Record<string, IconType>` built from one set could not satisfy a prop typed against the other.
 * `wizard.tsx` had already written the neutral form; this is the same line, kept once.
 */
// Both moved to `icon-type.ts`, a free module, because four free families and the starter
// template's app shell imported them from here and this file is Pro. Re-exported so no
// consumer's import changes.
export type { IconType, RecordField } from "./icon-type";

/**
 * A field description, with the two framework-owned values bound to React's. **This is an alias, not a
 * second declaration**: `render` returns a `ReactNode` and `icon` is a Radix icon component here,
 * while the Vue edition binds a `VNode` and a `Component` to the same core type.
 */

/**
 * `useState` that mirrors to `sessionStorage` under `key`, so a page's work
 * (table filters/sort/page, a form draft) survives leaving and returning — the
 * per-tab work-preservation behind the open-tabs strip. When `key` is undefined
 * it is a plain `useState`, so this is fully opt-in and backward compatible.
 * Restores on mount (client-only, so exported/SSR markup still matches) and
 * never clobbers stored data with the initial value.
 */
export function usePersistentState<T>(
  key: string | undefined,
  initial: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = React.useState<T>(initial);
  // Stable reference to the seeded value. The writer skips it by identity (not a
  // first-write flag) so the write is StrictMode-safe: dev double-invokes the
  // write effect while `state` is still `initial`, and a flag flips on the first
  // pass so the second pass would persist `initial` OVER a draft the restore
  // effect is about to bring back. Comparing to this ref never writes `initial`,
  // so it can't clobber the stored draft.
  const initialRef = React.useRef(initial);
  /**
   * **And once it has diverged, it stays writable.** The identity comparison alone is not enough: with
   * a `""` seed, a user who typed and then cleared the field is back at the seed by identity, so the
   * write was skipped and storage kept the text they had just deleted — the next mount restored it.
   * This flips on the first real write and never flips back, so the StrictMode pass above is still
   * protected (nothing has diverged yet, so nothing is written) and a clear is persisted.
   */
  const diverged = React.useRef(false);
  React.useEffect(() => {
    if (!key) return;
    try {
      const raw = sessionStorage.getItem(key);
      if (raw !== null) setState(JSON.parse(raw) as T);
    } catch {
      // ignore malformed storage
    }
  }, [key]);
  React.useEffect(() => {
    if (!key) return;
    // Nothing to save while still the untouched seed; only a restore or a user
    // edit diverges `state` from it, and both should persist.
    if (!diverged.current && state === initialRef.current) return;
    diverged.current = true;
    try {
      sessionStorage.setItem(key, JSON.stringify(state));
    } catch {
      // ignore storage failures (private mode, quota)
    }
  }, [key, state]);
  return [state, setState];
}

/** Drop a persisted key — e.g. once a form Save/Cancel discards its draft. */
export function clearPersisted(key: string | undefined) {
  if (!key) return;
  try {
    sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
}

/** Read-mode label for an async-id field. Resolves the set value's label via
 *  `resolveOption` (one record, never the whole list) and renders it, showing a
 *  skeleton until it lands — never the raw id, which means nothing to a reader.
 *  A value that resolves to nothing reads "Unknown" (the id stays in the
 *  tooltip). Used wherever a value is *shown* (form read rows, detail panels,
 *  table cells) — the edit control already resolves its own label. */
export function AsyncFieldValue<T>({
  field,
  value,
  values,
}: {
  field: RecordField<T>;
  value: string;
  values: Partial<T>;
}) {
  // Rebuilt each render (the hook holds it in a ref, so this never refetches);
  // `open: false` means `loadOptions` is never called — only `resolveOption` runs.
  const source = React.useMemo<AsyncOptionSource>(
    () => ({
      loadOptions: ({ search, signal }) => field.loadOptions!({ search, signal, values }),
      // With `resolveOptions`, every cell of this column that paints in the same
      // tick is resolved by one call instead of one call each.
      resolveOptions: field.resolveOptions,
      resolveOption: field.resolveOption,
    }),
    [field, values],
  );
  const resetKey = resetKeyOf(field, values);
  // One resolveOption per distinct value: identical in-flight requests are
  // shared inside the hook, so N cells on the same id cost one round trip.
  const { options, resolving } = useAsyncOptions({
    source,
    open: false,
    search: "",
    value,
    resetKey,
  });
  const label = options.find((o) => o.value === value)?.label;
  if (label !== undefined) return <>{label}</>;
  if (resolving) return <Skeleton className={RECORD_VALUE_SKELETON} />;
  return <MissingValue />;
}

/** Nothing to show: an empty value, or a reference whose label never resolved
 *  (deleted record, failed request). Both are missing data, so both read the
 *  same. The id is never shown — it isn't a value a reader can use. */
export function MissingValue() {
  return <span className={RECORD_MISSING}>—</span>;
}

/** Read display for a `multiple` field: resolves each value's label (batch via
 *  the field's `resolveOptions`, or static `options`) and shows up to
 *  `maxChipsInCell` chips, then "+N" with the full list in a tooltip. */
export function MultiFieldValue<T>({
  field,
  values,
  row,
}: {
  field: RecordField<T>;
  values: string[];
  row: Partial<T>;
}) {
  const source = React.useMemo<AsyncOptionSource | undefined>(
    () =>
      field.loadOptions
        ? {
            loadOptions: ({ search, signal }) =>
              field.loadOptions!({ search, signal, values: row }),
            resolveOptions: field.resolveOptions,
            resolveOption: field.resolveOption,
          }
        : undefined,
    [field, row],
  );
  const resetKey = resetKeyOf(field, row);
  const { options, resolving } = useAsyncOptions({
    source,
    open: false,
    search: "",
    value: values,
    resetKey,
  });
  const staticOpts = Array.isArray(field.options) ? field.options : [];
  const labelOf = (v: string) =>
    options.find((o) => o.value === v)?.label ?? staticOpts.find((o) => o.value === v)?.label;
  const resolvedLabels = values.map(labelOf);
  if (!values.length) return <MissingValue />;
  // Same rule as the single value: a skeleton until the labels land, never ids.
  if (resolving && resolvedLabels.some((l) => l === undefined))
    return <Skeleton className={RECORD_CHIPS_SKELETON} />;
  // A value that never resolved is dropped rather than shown as an id.
  const labels = resolvedLabels.filter((l): l is string => l !== undefined);
  if (!labels.length) return <MissingValue />;
  const max = field.maxChipsInCell ?? 3;
  const shown = labels.slice(0, max);
  const extra = labels.length - shown.length;
  const chip = RECORD_CHIP;
  return (
    <span className={RECORD_CHIP_ROW}>
      {shown.map((l, i) => (
        <span key={i} className={chip}>
          {l}
        </span>
      ))}
      {extra > 0 && (
        <Tooltip content={labels.join(", ")}>
          <span className={RECORD_CHIP_MORE}>+{extra}</span>
        </Tooltip>
      )}
    </span>
  );
}
