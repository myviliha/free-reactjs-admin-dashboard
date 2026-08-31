"use client";

/**
 * The free data table: an array in, a sortable, searchable, paginated table out.
 *
 * It is deliberately **not** a small `RecordView`. That component talks to a server over
 * `ServerQuery`, edits records, imports and exports, and runs bulk actions; this one renders data
 * you already have in memory. The line is a table versus a data workflow, and it is drawn in
 * `odin/design/03-design-system/01-data-table/task.md`.
 *
 * No table engine is imported. `@tanstack/react-table` was refused for this table, and the React
 * package advertises "0 runtime dependencies added", so client-side filter, sort and page are the
 * three pure functions below. The column API is still shaped like TanStack's, because that is the
 * shape people arrive knowing.
 */

import * as React from "react";

import { Button } from "./button";
import { Checkbox } from "./checkbox";
import {
  DT_ALIGN,
  DT_EMPTY,
  DT_FOOTER,
  DT_FRAME,
  DT_HEAD_ROW,
  DT_PAGER,
  DT_PAGER_GAP,
  DT_ROOT,
  DT_ROW_CLICKABLE,
  DT_ROW_SELECTED,
  DT_SEARCH,
  DT_SELECT_HEAD,
  DT_SKELETON_CELL,
  DT_SORT_BUTTON,
  DT_SORT_MARK,
  DT_SORT_MARK_STATES,
  DT_TOOLBAR,
  DT_TOOLBAR_END,
} from "./class-variants";
import { Dropdown, DropdownItem } from "./dropdown-menu";
import { Input } from "./input";
import { Skeleton } from "./skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { cn } from "./utils";

/** What a column can sort and search on. Anything richer belongs in `cell`, not here. */
export type { CellValue, DataField, DataSort, SortDirection } from "./data-table-core";
export { asText, columnValue, filterRows, pageList, pageRows, sortRows } from "./data-table-core";

import type { CellValue, DataField, DataSort, SortDirection } from "./data-table-core";
import { asText, columnValue, filterRows, pageList, pageRows, sortRows } from "./data-table-core";

/**
 * A column as React renders it: the shared field, plus the parts that are markup.
 *
 * The logic moved to `data-table-core.ts` on 2026-08-19 so every framework edition shares one
 * implementation rather than four that have to agree. Everything it exports is re-exported above,
 * so `@viliha/vui-react/data-table` is unchanged for every consumer.
 */
export interface DataColumn<T> extends DataField<T> {
  header: React.ReactNode;
  /** What the cell renders. Defaults to the raw value as text. */
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: "start" | "center" | "end";
  /** Applied to both the header cell and every body cell in the column. */
  className?: string;
  /** Starts hidden. Still listed in the columns menu, so it can be switched on. */
  hidden?: boolean;
}

export interface DataTableProps<T> {
  data: readonly T[];
  columns: readonly DataColumn<T>[];
  /**
   * A stable identity per row, used for selection.
   *
   * Defaults to the array index, which is correct for data that does not reorder underneath the
   * user and wrong for data that does. Pass the real id when there is one.
   */
  rowId?: (row: T, index: number) => string;
  caption?: string;
  /** One box searching every visible column. `true` takes the default placeholder. */
  search?: boolean | { placeholder?: string };
  /** Rows per page. Omit, or pass 0, for no pagination. */
  pageSize?: number;
  /** A checkbox column, with select-all across the current page. */
  selectable?: boolean;
  onSelectionChange?: (rows: T[]) => void;
  /** The show/hide menu. */
  columnToggle?: boolean;
  defaultSort?: DataSort;
  loading?: boolean;
  /** What an empty table says. A search that matches nothing says so instead. */
  empty?: React.ReactNode;
  onRowClick?: (row: T) => void;
  /** Extra controls, to the right of the toolbar. */
  toolbar?: React.ReactNode;
  className?: string;
}

/* ------------------------------------------------------------------ *
 * The component
 * ------------------------------------------------------------------ */

function SortMark({ direction }: { direction: SortDirection | null }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={cn(DT_SORT_MARK, DT_SORT_MARK_STATES[direction ? "active" : "idle"])}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direction !== "desc" && <path d="M5 6.5 8 3.5l3 3" />}
      {direction !== "asc" && <path d="M5 9.5 8 12.5l3-3" />}
    </svg>
  );
}

export function DataTable<T>({
  data,
  columns,
  rowId,
  caption,
  search,
  pageSize = 0,
  selectable,
  onSelectionChange,
  columnToggle,
  defaultSort,
  loading,
  empty = "No data.",
  onRowClick,
  toolbar,
  className,
}: DataTableProps<T>) {
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<DataSort | null>(defaultSort ?? null);
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<ReadonlySet<string>>(() => new Set());
  const [hidden, setHidden] = React.useState<ReadonlySet<string>>(
    () => new Set(columns.filter((c) => c.hidden).map((c) => c.key)),
  );

  const identify = React.useCallback(
    (row: T, index: number) => (rowId ? rowId(row, index) : String(index)),
    [rowId],
  );

  const visible = React.useMemo(() => columns.filter((c) => !hidden.has(c.key)), [columns, hidden]);

  const filtered = React.useMemo(() => filterRows(data, visible, query), [data, visible, query]);
  const sorted = React.useMemo(() => sortRows(filtered, columns, sort), [filtered, columns, sort]);
  const view = React.useMemo(() => pageRows(sorted, page, pageSize), [sorted, page, pageSize]);

  // Identity is resolved once, against the source array, and then looked up by row reference.
  // ponytail: two rows that are the same object collide, and so would their React keys; pass
  // `rowId` when the data has a real id, which is the case this is here to serve.
  const { idOf, rowsById } = React.useMemo(() => {
    const byRow = new Map<T, string>();
    const byId = new Map<string, T>();
    data.forEach((row, index) => {
      const id = identify(row, index);
      byRow.set(row, id);
      byId.set(id, row);
    });
    return { idOf: (row: T) => byRow.get(row) ?? "", rowsById: byId };
  }, [data, identify]);

  const commit = (next: Set<string>) => {
    setSelected(next);
    onSelectionChange?.([...next].flatMap((id) => (rowsById.has(id) ? [rowsById.get(id)!] : [])));
  };

  // Selection ids for the rows currently on screen, which is what select-all acts on.
  const pageIds = view.rows.map((row) => idOf(row));
  const allOnPage = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const someOnPage = pageIds.some((id) => selected.has(id));

  const selectAllRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = someOnPage && !allOnPage;
  }, [someOnPage, allOnPage]);

  const toggleSort = (key: string) => {
    setPage(1);
    setSort((current) => {
      if (current?.key !== key) return { key, direction: "asc" };
      if (current.direction === "asc") return { key, direction: "desc" };
      return null; // Third click returns the data to its authored order, which often means something.
    });
  };

  const searchable = Boolean(search);
  const placeholder = (typeof search === "object" && search.placeholder) || "Search all columns...";
  const columnCount = visible.length + (selectable ? 1 : 0);
  const showToolbar = searchable || columnToggle || Boolean(toolbar);

  return (
    <div className={cn(DT_ROOT, className)}>
      {showToolbar && (
        <div className={DT_TOOLBAR}>
          {searchable && (
            <Input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder={placeholder}
              aria-label={placeholder}
              className={DT_SEARCH}
            />
          )}
          <div className={DT_TOOLBAR_END}>
            {toolbar}
            {columnToggle && (
              <Dropdown label="Columns" align="end">
                {columns.map((column) => (
                  <DropdownItem
                    key={column.key}
                    checked={!hidden.has(column.key)}
                    onSelect={() =>
                      setHidden((current) => {
                        const next = new Set(current);
                        // The last visible column cannot be hidden: an empty table is a bug report.
                        if (next.has(column.key)) next.delete(column.key);
                        else if (visible.length > 1) next.add(column.key);
                        return next;
                      })
                    }
                  >
                    {typeof column.header === "string" ? column.header : column.key}
                  </DropdownItem>
                ))}
              </Dropdown>
            )}
          </div>
        </div>
      )}

      <div className={DT_FRAME}>
        <Table>
          {caption && <TableCaption>{caption}</TableCaption>}
          <TableHeader>
            <TableRow className={DT_HEAD_ROW}>
              {selectable && (
                <TableHead className={DT_SELECT_HEAD}>
                  <Checkbox
                    ref={selectAllRef}
                    checked={allOnPage}
                    onChange={() => {
                      const next = new Set(selected);
                      pageIds.forEach((id) => (allOnPage ? next.delete(id) : next.add(id)));
                      commit(next);
                    }}
                    aria-label={allOnPage ? "Clear selection" : "Select all rows on this page"}
                  />
                </TableHead>
              )}
              {visible.map((column) => {
                const active = sort?.key === column.key ? sort.direction : null;
                return (
                  <TableHead
                    key={column.key}
                    className={cn(DT_ALIGN[column.align ?? "start"], column.className)}
                    aria-sort={active ? (active === "asc" ? "ascending" : "descending") : "none"}
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column.key)}
                        className={DT_SORT_BUTTON}
                      >
                        {column.header}
                        <SortMark direction={active} />
                      </button>
                    ) : (
                      column.header
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: pageSize || 5 }, (_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  {Array.from({ length: columnCount }, (_unused, cell) => (
                    <TableCell key={cell}>
                      <Skeleton className={DT_SKELETON_CELL} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : view.rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnCount} className={DT_EMPTY}>
                  {query ? `No rows match "${query}".` : empty}
                </TableCell>
              </TableRow>
            ) : (
              view.rows.map((row) => {
                const id = idOf(row);
                return (
                  <TableRow
                    key={id}
                    data-state={selected.has(id) ? "selected" : undefined}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(
                      selected.has(id) && DT_ROW_SELECTED,
                      onRowClick && DT_ROW_CLICKABLE,
                    )}
                  >
                    {selectable && (
                      <TableCell onClick={(event) => event.stopPropagation()}>
                        <Checkbox
                          checked={selected.has(id)}
                          onChange={() => {
                            const next = new Set(selected);
                            if (next.has(id)) next.delete(id);
                            else next.add(id);
                            commit(next);
                          }}
                          aria-label="Select row"
                        />
                      </TableCell>
                    )}
                    {visible.map((column) => (
                      <TableCell
                        key={column.key}
                        className={cn(DT_ALIGN[column.align ?? "start"], column.className)}
                      >
                        {column.cell ? column.cell(row) : asText(columnValue(column, row))}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {(selectable || view.pageCount > 1) && (
        <div className={DT_FOOTER}>
          <p>
            {selectable
              ? `${selected.size} of ${sorted.length} row${sorted.length === 1 ? "" : "s"} selected`
              : `${sorted.length} row${sorted.length === 1 ? "" : "s"}`}
          </p>
          {view.pageCount > 1 && (
            <nav aria-label="Pagination" className={DT_PAGER}>
              <Button
                size="sm"
                variant="outline"
                disabled={view.page <= 1}
                onClick={() => setPage(view.page - 1)}
              >
                Previous
              </Button>
              {pageList(view.page, view.pageCount).map((entry, index, all) =>
                entry === "gap" ? (
                  // Keyed by the page it follows, so the two gaps stay distinct without an index.
                  <span
                    key={`gap-after-${all[index - 1]}`}
                    className={DT_PAGER_GAP}
                    aria-hidden="true"
                  >
                    ...
                  </span>
                ) : (
                  <Button
                    key={entry}
                    size="sm"
                    variant={entry === view.page ? "primary" : "ghost"}
                    aria-current={entry === view.page ? "page" : undefined}
                    onClick={() => setPage(entry)}
                  >
                    {entry}
                  </Button>
                ),
              )}
              <Button
                size="sm"
                variant="outline"
                disabled={view.page >= view.pageCount}
                onClick={() => setPage(view.page + 1)}
              >
                Next
              </Button>
            </nav>
          )}
        </div>
      )}
    </div>
  );
}
