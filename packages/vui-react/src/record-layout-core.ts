/**
 * Where a record's fields sit, framework-free.
 *
 * These three decide the form's shape: which groups exist and in what order, which sections render, and
 * how the sections fall into rows. **A divergence here puts a field in the wrong section**, and no markup
 * or class assertion would see it, because both editions would be rendering correct markup for different
 * layouts.
 *
 * A field is only read for its `group`, so the array is structural while `T` stays the **row** type it
 * always was: callers write `orderedGroups<Row>(fields)`, and constraining `T` to the field shape broke
 * them. The distinction is easy to lose and a test caught it.
 */
import type { FormRow, FormSection, SectionColumns } from "./config-core";

/** The part of a field these functions read. A real `RecordField` carries far more. */
export interface GroupedField {
  group?: string;
}

/** Distinct field groups in first-appearance order (ungrouped → "General"). */
export function orderedGroups<T>(fields: readonly GroupedField[]): string[] {
  const seen: string[] = [];
  for (const f of fields) {
    const g = f.group ?? "General";
    if (!seen.includes(g)) seen.push(g);
  }
  return seen;
}

/**
 * The sections to render, in order. Declared sections come first in the order
 * you wrote them; any group that only exists on the fields is appended, so
 * adding a field with a new group never makes it disappear.
 *
 * Exported for testing.
 */
export function orderedSections<T>(
  fields: readonly GroupedField[],
  declared: FormSection[] | undefined,
): FormSection[] {
  const groups = orderedGroups(fields);
  if (!declared?.length) return groups.map((group) => ({ group }));
  const named = new Set(declared.map((d) => d.group));
  return [
    ...declared.filter((d) => groups.includes(d.group)),
    ...groups.filter((g) => !named.has(g)).map((group) => ({ group })),
  ];
}

/**
 * The form's rows, whichever way the host described them.
 *
 * `rows` is the way: each row names the sections that sit on it, so the top row
 * can hold two and the next three. A section with no fields is dropped, and a
 * group nobody placed gets a row of its own at the end rather than vanishing.
 *
 * Without `rows`, the deprecated `sectionColumns` path chunks the sections into
 * rows of that many, which is the old flow-and-wrap behaviour. Without either,
 * every section is its own full-width row.
 *
 * Exported for testing.
 */
export function resolveFormRows<T>(
  fields: readonly GroupedField[],
  rows: FormRow[] | undefined,
  sections: FormSection[] | undefined,
  sectionColumns: SectionColumns | undefined,
): FormRow[] {
  const groups = new Set(orderedGroups(fields));
  const has = (s: FormSection) => groups.has(s.group);

  if (rows?.length) {
    const placed = new Set<string>();
    const out: FormRow[] = [];
    for (const row of rows) {
      const kept = row.sections.filter((s) => {
        if (!has(s) || placed.has(s.group)) return false;
        placed.add(s.group);
        return true;
      });
      if (kept.length) out.push({ sections: kept });
    }
    for (const group of groups) if (!placed.has(group)) out.push({ sections: [{ group }] });
    return out;
  }

  const ordered = orderedSections(fields, sections);
  const perRow = sectionColumns ?? 1;
  if (perRow === 1) return ordered.map((s) => ({ sections: [s] }));
  const out: FormRow[] = [];
  for (let i = 0; i < ordered.length; i += perRow)
    out.push({ sections: ordered.slice(i, i + perRow) });
  return out;
}
