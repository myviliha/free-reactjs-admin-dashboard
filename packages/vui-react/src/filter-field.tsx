import * as React from "react";

import { FILTER_CONTROL, FILTER_GRID_ROOT, FILTER_LABEL, FILTER_ROW } from "./class-variants";
import { cn } from "./utils";

/**
 * The theme's filter layout — **two columns: label │ control, one row per
 * field**, with labels aligned across every row. This is the enforced default
 * for every filter panel; compose filters with these instead of hand-rolling a
 * layout, so the design principle can't be styled away.
 *
 * `RecordView`'s Filter panel renders its `filterable` fields with these, and
 * you can add your own rows via `RecordView`'s `filterExtras` prop (or build a
 * standalone panel):
 *
 * ```tsx
 * <FilterGrid>
 *   <FilterField label="Name"><Input … /></FilterField>
 *   <FilterField label="Country"><Select … /></FilterField>
 * </FilterGrid>
 * ```
 */
export function FilterGrid({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn(FILTER_GRID_ROOT, className)}>{children}</div>;
}

/**
 * One filter row: a label and its control side by side. **Must be a direct
 * child of {@link FilterGrid}** — it uses `display: contents` so the label and
 * control become the grid's own cells (column 1 = label, column 2 = control),
 * lining up across every row.
 */
export function FilterField({
  label,
  htmlFor,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  /** Extra classes on the control cell (column 2). */
  className?: string;
  children: React.ReactNode;
}) {
  return (
    // display:contents → label + control cell become direct FilterGrid cells.
    <div className={FILTER_ROW}>
      <label htmlFor={htmlFor} className={FILTER_LABEL}>
        {label}
      </label>
      <div className={cn(FILTER_CONTROL, className)}>{children}</div>
    </div>
  );
}
