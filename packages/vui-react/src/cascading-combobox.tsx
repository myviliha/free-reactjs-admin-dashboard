"use client";

import * as React from "react";
import { type CascadeLevel, type CascadeNode, cascadeRows, cascadeSelect } from "./cascade-core";
import {
  CASCADE_LEVEL,
  CASCADE_LEVEL_IN_ROW,
  CASCADE_LEVEL_LABEL,
  CASCADE_ROOT_ROW,
  CASCADE_ROOT_STACKED,
} from "./class-variants";
import { Combobox } from "./combobox";
import { cn } from "./utils";

/**
 * The tree walk moved to `cascade-core.ts` on 2026-08-20, so both editions clear the same downstream
 * levels. The types are re-exported from here, which is where consumers import them.
 */
export type { CascadeLevel, CascadeNode } from "./cascade-core";

export interface CascadingComboboxProps {
  /** Ordered, named levels — one searchable Combobox is rendered per level. */
  levels: CascadeLevel[];
  /** Hierarchical data: root nodes = level 0; a node's `children` = the next level. */
  items: CascadeNode[];
  /** Selected path, one value per level (a shorter array = deeper levels unset). */
  value: string[];
  /** Fires with the new path and the resolved node at each step of it. */
  onValueChange: (value: string[], nodes: CascadeNode[]) => void;
  /** Stack the levels (default) or lay them out in a row. */
  orientation?: "vertical" | "horizontal";
  className?: string;
}

/**
 * Cascading combobox for **fixed, named levels** (Region → Country → State →
 * City). Renders one searchable {@link Combobox} per level; picking a level
 * narrows the next from the selected node's `children` and **clears everything
 * downstream**. A level stays disabled until its parent is chosen.
 *
 * ```tsx
 * <CascadingCombobox
 *   levels={[
 *     { key: "region", label: "Region" },
 *     { key: "country", label: "Country" },
 *     { key: "state", label: "State" },
 *     { key: "city", label: "City" },
 *   ]}
 *   items={LOCATIONS}
 *   value={path}
 *   onValueChange={setPath}
 * />
 * ```
 */
export function CascadingCombobox({
  levels,
  items,
  value,
  onValueChange,
  orientation = "vertical",
  className,
}: CascadingComboboxProps) {
  // One row per level, walked down the currently-selected path: its options and
  // whether it's enabled (level 0 always; deeper levels need their parent set).
  const rows = React.useMemo(() => cascadeRows(levels, items, value), [levels, items, value]);

  const handleSelect = (levelIndex: number, next: string) => {
    const { path, nodes } = cascadeSelect(items, value, levelIndex, next);
    onValueChange(path, nodes);
  };

  return (
    <div
      className={cn(
        orientation === "horizontal" ? CASCADE_ROOT_ROW : CASCADE_ROOT_STACKED,
        className,
      )}
    >
      {rows.map(({ level, options, enabled }, i) => {
        return (
          <div
            key={level.key}
            className={cn(CASCADE_LEVEL, orientation === "horizontal" && CASCADE_LEVEL_IN_ROW)}
          >
            <label htmlFor={level.key} className={CASCADE_LEVEL_LABEL}>
              {level.label}
            </label>
            <Combobox
              id={level.key}
              value={value[i] ?? ""}
              onValueChange={(next) => handleSelect(i, next)}
              options={options}
              ariaLabel={level.label}
              disabled={!enabled}
              placeholder={level.placeholder ?? `Select ${level.label.toLowerCase()}…`}
            />
          </div>
        );
      })}
    </div>
  );
}
