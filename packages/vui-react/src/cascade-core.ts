/**
 * Walking a cascade, framework-free.
 *
 * A cascading picker is two pure functions over a tree: which options each level offers given the
 * path chosen so far, and what the new path is when one level changes. Both are the kind of logic
 * that drifts silently between editions, because getting "clear everything downstream" subtly wrong
 * looks like a stale option list rather than a broken component.
 */

/** A node in the cascade tree. Top-level nodes feed the first level; `children` feed the next. */
export interface CascadeNode {
  value: string;
  label: string;
  children?: CascadeNode[];
}

/** One named level of the cascade, for example Region, Country, State, City. */
export interface CascadeLevel {
  key: string;
  label: string;
  placeholder?: string;
}

export interface CascadeRow<L> {
  level: L;
  options: { value: string; label: string }[];
  /** Level 0 is always enabled; a deeper level needs its parent chosen. */
  enabled: boolean;
}

/** One row per level, walked down the currently-selected path. */
export function cascadeRows<L extends { key: string }>(
  levels: L[],
  items: CascadeNode[],
  value: string[],
): CascadeRow<L>[] {
  const out: CascadeRow<L>[] = [];
  let nodes = items;
  levels.forEach((level, i) => {
    out.push({
      level,
      options: nodes.map((n) => ({ value: n.value, label: n.label })),
      enabled: i === 0 || Boolean(value[i - 1]),
    });
    const selected = nodes.find((n) => n.value === value[i]);
    nodes = selected?.children ?? [];
  });
  return out;
}

/**
 * The path after choosing `next` at `levelIndex`, and the node at each step of it.
 *
 * **Keeps upstream, sets this level, drops everything downstream**, which is the whole point of a
 * cascade: a Country change cannot leave a City from the old country selected.
 */
export function cascadeSelect(
  items: CascadeNode[],
  value: string[],
  levelIndex: number,
  next: string,
): { path: string[]; nodes: CascadeNode[] } {
  const path = value.slice(0, levelIndex);
  path[levelIndex] = next;
  const nodes: CascadeNode[] = [];
  let pool = items;
  for (const step of path) {
    const node = pool.find((n) => n.value === step);
    if (!node) break;
    nodes.push(node);
    pool = node.children ?? [];
  }
  return { path, nodes };
}
