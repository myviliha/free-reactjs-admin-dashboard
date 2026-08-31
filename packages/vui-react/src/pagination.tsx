"use client";

import { Button } from "./button";
import { DT_PAGER, DT_PAGER_GAP } from "./class-variants";
import { pageList } from "./data-table-core";

/**
 * A pager, extracted rather than written (`PD-198`).
 *
 * **This markup existed twice before it existed once.** `data-table.tsx` drew it inline, and
 * `apps/web/free-react`'s `basic-tables/tables.tsx` drew it again by hand. Two copies of a control
 * whose whole difficulty is the gap arithmetic is how `FT-876` came to exist: stepping from page 3
 * with Next has to land on the next page the pager actually **draws**, not on 4, because the list
 * between them is elided.
 *
 * So this takes the logic that already works. `pageList` in `data-table-core.ts` decides which
 * numbers appear and where the gaps fall, and `DT_PAGER` and `DT_PAGER_GAP` are the classes the data
 * table already uses. Nothing here is a new opinion about how a pager looks or counts.
 *
 * The reference ships this as its own screen, which is why it becomes a family rather than staying
 * a detail of one component.
 */
export interface PaginationProps {
  /** The current page, counting from one. */
  page: number;
  /** How many pages there are. A pager for a single page renders nothing. */
  pageCount: number;
  onPageChange: (page: number) => void;
  /**
   * Names the control for a screen reader.
   *
   * A page has more than one pager often enough that "Pagination" alone stops being an answer to
   * "which one", so the caller says.
   */
  label?: string;
  className?: string;
}

export function Pagination({
  page,
  pageCount,
  onPageChange,
  label = "Pagination",
  className,
}: PaginationProps) {
  // One page is not a choice, and a control offering no choice is furniture.
  if (pageCount <= 1) return null;

  return (
    <nav aria-label={label} className={className ?? DT_PAGER}>
      <Button
        size="sm"
        variant="outline"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </Button>
      {pageList(page, pageCount).map((entry, index, all) =>
        entry === "gap" ? (
          // Keyed by the page it follows, so two gaps stay distinct without leaning on the index.
          <span key={`gap-after-${all[index - 1]}`} className={DT_PAGER_GAP} aria-hidden="true">
            ...
          </span>
        ) : (
          <Button
            key={entry}
            size="sm"
            variant={entry === page ? "primary" : "ghost"}
            aria-current={entry === page ? "page" : undefined}
            onClick={() => onPageChange(entry)}
          >
            {entry}
          </Button>
        ),
      )}
      <Button
        size="sm"
        variant="outline"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </nav>
  );
}
