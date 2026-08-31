import type { ReactNode } from "react";

import { LIST_DIVIDED, LIST_ITEM, LIST_ROOT } from "./class-variants";
import { cn } from "./utils";

/**
 * A list, as a list (`PD-199`).
 *
 * **The whole value is the element.** Screens across this product draw stacks of rows as `div`s,
 * which look identical and tell a screen reader nothing: no count, no position, no way to jump
 * between items. `ul` and `li` carry all three for free, which is why this family is worth the file
 * it costs.
 *
 * Divided is the default because an undivided stack of rows is where the run-together starts, and a
 * caller who wants it plain says so.
 */
export function List({
  children,
  divided = true,
  className,
}: {
  children: ReactNode;
  divided?: boolean;
  className?: string;
}) {
  return <ul className={cn(LIST_ROOT, divided && LIST_DIVIDED, className)}>{children}</ul>;
}

export function ListItem({ children, className }: { children: ReactNode; className?: string }) {
  return <li className={cn(LIST_ITEM, className)}>{children}</li>;
}
