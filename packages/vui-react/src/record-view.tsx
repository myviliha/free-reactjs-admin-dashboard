"use client";

/**
 * `RecordView`: the record workflow. A server-backed table with typed per-field
 * filters, saved column layout, bulk actions, import/export and an inline record
 * form.
 *
 * **Pro tier.** This is the one component the paid editions carry, decided on
 * 2026-08-17 (`Q-DT-01`). Everything it needs was moved out on the same day, so
 * this file may import from the free modules but no free module may import this
 * one. `tiers.test.ts` fails the build if that reverses.
 *
 * The re-export block below is back-compat, not architecture: this file used to be
 * where all of it lived, so dropping the names would break every consumer on a
 * minor version. They come out at `2.0.0`, with `template/`.
 *
 * See `odin/design/04-packaging/01-packaging-pipeline/task.md`.
 */

import * as React from "react";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import {
  DROPDOWN_TRIGGER,
  RECORD_MISSING,
  RV_ACTIONS_CELL,
  RV_ACTIONS_HEAD,
  RV_ACTIONS_HEAD_LABEL,
  RV_ADD_BUTTON,
  RV_ALIGN_BOX,
  RV_ALIGN_TEXT,
  RV_BULK_DELETE,
  RV_BULK_RESTORE,
  RV_CARD,
  RV_CELL_ACTION,
  RV_CELL_ACTIONS,
  RV_CELL_BUTTON,
  RV_CELL_CUSTOM,
  RV_CELL_EDITABLE,
  RV_CELL_FLUSH,
  RV_CELL_INPUT,
  RV_CELL_MULTI,
  RV_CELL_READ,
  RV_CLEAR_SELECTION,
  RV_CONFIRM_EMPHASIS,
  RV_CONTENT,
  RV_COPIED_ICON,
  RV_EMPTY,
  RV_FILE_INPUT,
  RV_FILTER_CHECK,
  RV_FILTER_CHECKS,
  RV_FILTER_FOOTER,
  RV_FILTER_GRID,
  RV_FILTER_INPUT,
  RV_FILTER_PANEL,
  RV_FULL_WIDTH,
  RV_GRIP,
  RV_GRIP_ICON,
  RV_GRIP_SPACER,
  RV_HEAD_CARET,
  RV_HEAD_CARET_IDLE,
  RV_HEAD_CELL,
  RV_HEAD_ICON,
  RV_HEAD_INNER,
  RV_HEAD_LABEL,
  RV_HEAD_SORTABLE,
  RV_HEADER,
  RV_HEADER_ACTIONS,
  RV_ICON,
  RV_ICON_EXPORT,
  RV_ICON_FILTER,
  RV_ICON_IMPORT,
  RV_ICON_LG,
  RV_ICON_MORE,
  RV_ICON_OPTIONS,
  RV_ICON_PAGE_SIZE,
  RV_ICON_SORT,
  RV_ICON_TITLE,
  RV_ICON_TRASH,
  RV_INITIALS,
  RV_INLINE_ROW,
  RV_KEYWORD_BODY,
  RV_KEYWORD_ICON,
  RV_KEYWORD_INPUT,
  RV_KEYWORD_WRAP,
  RV_LABEL_SM,
  RV_MENU,
  RV_MENU_ITEM,
  RV_MENU_ITEM_DESTRUCTIVE,
  RV_MENU_ITEM_RESTORE,
  RV_MENU_SEPARATOR,
  RV_NAME_BUTTON,
  RV_NAME_HEAD_BUTTON,
  RV_NAME_HEAD_STATIC,
  RV_PAGER,
  RV_PAGER_BUTTON,
  RV_PAGER_RANGE,
  RV_RESIZE_HANDLE,
  RV_ROW,
  RV_ROW_ACTION,
  RV_ROW_ACTION_DESTRUCTIVE,
  RV_ROW_ACTIONS,
  RV_ROW_ICON_DELETE,
  RV_ROW_ICON_EDIT,
  RV_ROW_ICON_RESTORE,
  RV_ROW_ICON_VIEW,
  RV_ROW_INERT,
  RV_SCROLL,
  RV_SELECT_CELL,
  RV_SHELL,
  RV_SKELETON_ACTIONS,
  RV_SKELETON_AVATAR,
  RV_SKELETON_CHECKBOX,
  RV_SKELETON_NAME,
  RV_SKELETON_VALUE,
  RV_SPACER_CELL,
  RV_SPACER_HEAD,
  RV_TABLE_HEADER,
  RV_TOOLBAR,
  RV_TOOLBAR_CONTROLS,
  RV_TOOLBAR_TITLE,
  RV_TRASH_TOGGLE_STATES,
  RV_TRUNCATE,
} from "./class-variants";
import { Combobox } from "./combobox";
import {
  type BehaviourConfig,
  type FormActionContext,
  type FormActionOutcome,
  type FormActionsConfig,
  type FormRow,
  type FormSection,
  type FormSlot,
  type IoAction,
  type IoActionsConfig,
  type IoContext,
  type SectionColumns,
  useResolved,
} from "./config";
import { ConfirmDialog } from "./confirm-dialog";
import { Dropdown, DropdownItem, DropdownLabel } from "./dropdown-menu";
import { FilterField, FilterGrid } from "./filter-field";
import { saveOutcome } from "./form-actions";
import {
  ArrowUpRight,
  CaretDown,
  CaretSort,
  CaretUp,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Copy as CopyPlus,
  Download,
  Eye,
  DragHandle as GripVertical,
  Sliders as ListFilter,
  MoreHorizontal,
  Edit as Pencil,
  Plus,
  Reset as Restore,
  Rows as Rows3,
  Search,
  Sliders as SlidersHorizontal,
  Trash as Trash2,
  Upload,
} from "./icons";
import { Input } from "./input";
import { usePageChrome, usePageTitle } from "./page-chrome";
import {
  AsyncFieldValue,
  clearRecordViewCache,
  DEFAULT_FIELD_ICON,
  emptyStateLabel,
  type FieldFilter,
  type FilterValues,
  type IconType,
  isAsyncLabeled,
  MissingValue,
  MultiFieldValue,
  type RecordField,
  type RowId,
  rvCacheGet,
  rvCacheSet,
  rvQueryKey,
  type ServerQuery,
  showEditActions,
  usePersistentState,
} from "./record-field";
import { RecordDetailPanel } from "./record-form";
import { RequiredMark } from "./required-mark";
import { Select } from "./select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";
import { defaultExportActions, defaultImportActions, resolveIoActions } from "./table-io-actions";
import { Tooltip } from "./tooltip";
import type { AsyncOptionSource } from "./use-async-options";
import { cn } from "./utils";

// Back-compat. Everything this file exported before the 2026-08-17 split still
// resolves from `@viliha/vui-react/record-view`, so no consumer had to change.
export type { Crumb } from "./breadcrumbs";
export type {
  BehaviourConfig,
  FormAction,
  FormActionContext,
  FormActionOutcome,
  FormActionsConfig,
  FormConfig,
  FormRow,
  FormSection,
  FormSlot,
  IoAction,
  IoActionsConfig,
  IoContext,
  SectionColumns,
  VuiConfig,
} from "./config";
export {
  PageChromeProvider,
  type PageMeta,
  usePageChrome,
  usePageTitle,
} from "./page-chrome";
export {
  clearRecordViewCache,
  emptyStateLabel,
  type FieldFilter,
  type FilterControl,
  type FilterValues,
  formatPhone,
  groupSlots,
  type IconType,
  isAsyncLabeled,
  MissingValue,
  type RecordField,
  type RvCacheEntry,
  rvCacheGet,
  rvCacheSet,
  rvQueryKey,
  type ServerQuery,
  type SortState,
  showEditActions,
  validateField,
} from "./record-field";
export {
  orderedGroups,
  orderedSections,
  RecordForm,
  RecordFormPanel,
  resolveFormRows,
} from "./record-form";
export type { AsyncOption } from "./use-async-options";

/**
 * The rules, from the one place both editions read them. `RV_*` are the fixed widths and the two
 * timings; the functions are what the table decides with them.
 */
import {
  type ColAlign,
  canSortField,
  clampPageSize,
  clientFilter,
  clientSort,
  clipCell,
  computeColumnAligns,
  fieldDefaultWidth,
  IDENTITY_COL,
  type IdentitySlot,
  nextSort,
  orderColumns,
  pageSizeOptions,
  paginate,
  pruneFilterValues,
  RV_ACTIONS_W,
  RV_CHECKBOX_W,
  RV_DEFAULT_TTL_MS,
  RV_MIN_LOADING_MS,
  RV_NAME_COL,
  RV_NAME_DEFAULT_W,
  RV_NUDGE_PX,
  RV_RESIZE_BASE_W,
  reorderRows,
  resizedWidth,
  resolveNameSortKey,
  totalColumnWidth,
} from "./record-view-core";

/**
 * **The arithmetic and the class strings both moved.** Every rule this table applies is
 * `@viliha/vui-core`'s `record-view-core`: how its columns are ordered and sized, what the keyword box
 * matches, which page is showing, which filter value a cascade invalidated. The Vue edition applies the
 * same ones rather than a second set that agrees today. What stays here is React, and the env reads: a
 * `process.env.NEXT_PUBLIC_*` expression means something different in each bundler, so each edition
 * reads its own and passes the value in (`D12`).
 */

// Keeping a page in memory across a remount is the same feature as keeping the
// page itself mounted, so it follows the same switch: with keep-alive off there
// is no cross-mount cache at all.
const RV_KEEP_ALIVE =
  process.env.NEXT_PUBLIC_KEEP_ALIVE_TABS !== "0" &&
  process.env.NEXT_PUBLIC_KEEP_ALIVE_TABS?.toLowerCase() !== "false";

// `process.env.NEXT_PUBLIC_*` is statically inlined by the consumer's bundler
// (Next / Vite) at build; declare its shape so this source type-checks on its
// own (the package ships without @types/node).
declare const process: { env: Record<string, string | undefined> };

// Default max characters a table cell shows before truncating with an ellipsis
// (+ hover tooltip). From env (inlined at build), fallback 25. Override per-view
// with `maxCellChars`, or per-field with `maxChars` (0 = never truncate).
const MAX_CELL_CHARS = (() => {
  const n = Number(process.env.NEXT_PUBLIC_MAX_CELL_CHARS);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 25;
})();

// Rows-per-page defaults, from env (inlined at build). DEFAULT is the initial
// page size; MAX is the ceiling the page-size selector won't exceed. In `manual`
// / `fetcher` mode the DATA LAYER must independently clamp its returned page to
// MAX — the client's requested size can't be trusted. Override per-view with
// `defaultPageSize` / `maxPageSize`.
const DEFAULT_PAGE_SIZE = (() => {
  const n = Number(process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 25;
})();
const MAX_PAGE_SIZE = (() => {
  const n = Number(process.env.NEXT_PUBLIC_MAX_PAGE_SIZE);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : Infinity;
})();

// User column resizing (drag a header's right edge to widen a column). On by
// default so long values in a narrow column are always reachable; from env
// (inlined at build) — set NEXT_PUBLIC_RESIZABLE_COLUMNS=0 (or false) to turn it
// off globally. Override per-view with the `resizableColumns` prop.
const RESIZABLE_COLUMNS = (() => {
  const v = process.env.NEXT_PUBLIC_RESIZABLE_COLUMNS;
  return v !== "0" && v !== "false";
})();

interface RecordViewProps<T extends { id: RowId }> {
  title: string;
  singular: string;
  icon?: IconType;
  fields: RecordField<T>[];
  /** Seed rows for a client-managed table. Optional — omit in `fetcher`/`manual`
   *  mode (the server owns the data) or for a read-only list. Defaults to `[]`. */
  initialData?: T[];
  /** Factory for a blank row, used by the Add action. Omit it (and `onCreate`)
   *  for a read-only list — the "+ New" button is then hidden. */
  makeEmptyRow?: () => T;
  getPrimary: (row: T) => {
    title: string;
    initials: string;
    subtitle?: string;
  };
  /** Add/Edit form presentation: "panel" slide-over (default) or "page" full-page. */
  formMode?: "panel" | "page";
  /** Full-page form column count (page mode only). Default 1. */
  formColumns?: 1 | 2;
  /** Navigate to Home from the page-form breadcrumb (e.g. router.push). */
  onHome?: () => void;
  /** Intro text for the page-form documentation panel ("about this form"). */
  formDescription?: string;
  /** Controlled rows. When set, RecordView renders these and reports edits via
   *  onDataChange instead of holding rows in internal state. */
  data?: T[];
  /** Receives the next rows array after an add, edit, delete or restore.
   *
   *  In `manual`/`fetcher` mode this is your persist hook, and **returning a
   *  promise matters**: RecordView waits for it before reloading, so the reload
   *  sees your write instead of racing it. Return nothing and the reload fires
   *  immediately, which is only right when you persist elsewhere. */
  onDataChange?: (rows: T[]) => void | Promise<void>;
  /** When set, the "add" button calls this (e.g. navigate to a create route)
   *  instead of opening the built-in form. */
  onCreate?: () => void;
  /** When set, opening/editing a row navigates (e.g. to an edit route) instead
   *  of opening the built-in overlay form. */
  onView?: (id: RowId) => void;
  onEdit?: (id: RowId) => void;
  /** Notified whenever the Add / View / Edit form opens, so you can lazily load
   *  field data (e.g. FK/combobox option catalogs) only when a user actually
   *  opens a form — not on every table mount. Pure notification: it does **not**
   *  suppress the form (unlike `onCreate`/`onView`/`onEdit`, which redirect). In
   *  panel mode `row` is the record being opened (the fresh draft for "create");
   *  in page mode it fires alongside the redirect for symmetry. */
  onFormOpen?: (mode: "create" | "edit" | "view", row?: T) => void;
  /** Persist this view's filter / sort / page under this key (e.g. the route),
   *  so the work survives leaving and returning via the open-tabs strip. */
  persistKey?: string;
  /** Allow dragging a column's right edge to resize it. Defaults to
   *  `NEXT_PUBLIC_RESIZABLE_COLUMNS` (on unless set to `0`/`false`), so a long
   *  value in a narrow column is always reachable. Set `false` to force
   *  auto-sizing with no resize handle. */
  resizableColumns?: boolean;
  /** Called from the Filter panel's Search (and Clear) when fields are
   *  `filterable`. Receives the collected per-field values; run your own query
   *  or client-side filtering here. In per-field mode the panel does not match
   *  rows itself, so the behavior is entirely yours. */
  onFilter?: (values: FilterValues<T>) => void;
  /** Show animated skeleton rows instead of the table body while data loads
   *  from the server (an initial fetch or a filter/refetch). Set it around your
   *  async load; the toolbar stays usable. */
  loading?: boolean;
  /** Server-side mode. When `true`, RecordView does NOT filter, sort, or
   *  paginate `data` — it renders `data` as the current page verbatim and reports
   *  query state via `onQueryChange`, so your backend does the work. Pair with
   *  `rowCount` (for totals), `loading`, and `onQueryChange`. Default `false`
   *  (everything client-side). */
  manual?: boolean;
  /** Total row count on the server — drives the pagination footer and page count
   *  in `manual` mode (RecordView can't infer it from a single page of `data`). */
  rowCount?: number;
  /** Server mode: called with the full query whenever page, page size, sort, or
   *  the keyword changes (and on the per-field Filter Search/Clear). Fetch and
   *  update `data` + `rowCount` + `loading` in response. Fires once on mount for
   *  the initial load; debounce inside if keyword changes are chatty. */
  onQueryChange?: (query: ServerQuery<T>) => void;
  /** Server data source. Providing it turns on `manual` and hands RecordView
   *  ownership of the read path: it calls this on every query change and manages
   *  `data` / `rowCount` / `loading` + caching itself — so you don't wire those
   *  or `onQueryChange`. Return the current page plus the server total. The
   *  `signal` aborts superseded requests. Mutually exclusive with the
   *  consumer-managed props above (if both are set, `fetcher` wins). */
  fetcher?: (query: ServerQuery<T>, signal: AbortSignal) => Promise<{ rows: T[]; total: number }>;
  /** Namespaces the `fetcher` response cache (like `persistKey`). Responses are
   *  cached per query and survive remounts / tab switches, so returning to a tab
   *  is instant with no refetch. Omit → no caching (always refetch). */
  cacheKey?: string;
  /** `fetcher` cache tuning, or `false` to never cache a page.
   *
   *  A cached page is only ever used to paint instantly: the server is asked on
   *  every query regardless and its answer replaces what was shown, so the
   *  cache can't serve stale data as final. `ttlMs` bounds how old a page may
   *  be to be painted at all (default 60s; older shows the shimmer instead).
   *  Default `{ max: 50, ttlMs: 60000 }`. Ignored when keep-alive tabs are off. */
  cache?: false | { max?: number; ttlMs?: number };
  /** Called when a `fetcher` request rejects (non-abort). RecordView keeps the
   *  previously loaded data and clears the loading state. */
  onError?: (error: unknown, query: ServerQuery<T>) => void;
  /** Max characters any table cell shows before truncating to one line with an
   *  ellipsis + hover tooltip (long text never wraps). Defaults to
   *  `NEXT_PUBLIC_MAX_CELL_CHARS` (or 25). Per-field `maxChars` overrides it. */
  maxCellChars?: number;
  /** Initial rows per page. Defaults to `NEXT_PUBLIC_DEFAULT_PAGE_SIZE` (or 25),
   *  clamped to `maxPageSize`. */
  defaultPageSize?: number;
  /** Ceiling for the page-size selector (options above it are hidden). Defaults
   *  to `NEXT_PUBLIC_MAX_PAGE_SIZE` (or unbounded). In server mode the data layer
   *  must enforce this too — the client's requested size isn't trusted. */
  maxPageSize?: number;
  /** Header for the leading identity column. Default "Name" — set e.g. "Title"
   *  for tables whose identity is a title field (regions, roles, …). */
  nameLabel?: string;
  /** Field key the identity column sorts by, so its header toggles sort + shows a
   *  caret like other columns. Defaults to the first `hideInTable` field marked
   *  `sortable` (the field that drives `getPrimary`). Unset + none found → the
   *  identity header stays static. */
  nameSortKey?: Extract<keyof T, string>;
  /** Where the leading identity (Name/Title) column sits among the field columns.
   *  `"first"` (default) | `"last"` | `"hidden"` (no identity column), or a number
   *  = how many field columns come before it (e.g. `1` → Region, Title, Code).
   *  Lets the app order reference tables like Country/State/City freely. */
  identityColumn?: number | "first" | "last" | "hidden";
  /** Toolbar feature toggles — each defaults to **on**, so leaving them unset
   *  keeps the full toolbar. Set one to `false` to remove that control.
   *  `filter` / `sort` / `pagination` are standard; `import` / `export` are the
   *  ones you'll typically turn off per page. */
  /** Show the Import (CSV/JSON/Excel) menu. Default `true`. */
  showImport?: boolean;
  /** What the Import menu offers. An array replaces the shipped entries, a
   *  function receives them so you can add to them. Point an `onAct` at your
   *  API to upload the file and let the server do the work. Falls back to
   *  `VuiProvider`'s `table.importActions`. */
  importActions?: IoActionsConfig<T>;
  /** What the Export menu offers, same shape. Use `ctx.query` to ask your API
   *  for everything that matches rather than the page on screen. */
  exportActions?: IoActionsConfig<T>;
  /** Show the Export (CSV/Excel/JSON/PDF) menu. Default `true`. */
  showExport?: boolean;
  /** Show the "+ {singular}" add button (still also requires `onCreate` or
   *  `makeEmptyRow`). Default `true`. */
  showAdd?: boolean;
  /** The add/edit form's rows: which sections sit side by side on each one.
   *  `formRows={[{ sections: [{ group: "Customer" }, { group: "Delivery" }] }, …]}`
   *  puts two on the top row; the next row can hold three. Up to three per row
   *  stay readable. Omit and every section gets a full-width row. */
  formRows?: FormRow[];
  /** @deprecated Since 1.59. Use `formRows`, which lets each row hold a different
   *  number of sections instead of one count for the whole form. */
  sectionColumns?: SectionColumns;
  /** Section metadata (order, description) when you aren't declaring rows. */
  sections?: FormSection[];
  /** Behaviour overrides for this table only: what a row click does, whether
   *  delete confirms, how long the saved-row highlight lasts, and so on. Falls
   *  back to `VuiProvider`'s `behaviour`, then to the shipped defaults. */
  behaviour?: BehaviourConfig;
  /** Footer buttons for the add/edit/view form. An array replaces Cancel + Save
   *  (or Close + Edit in view mode); a function receives those defaults so you
   *  can add, reorder or swap one without restating the rest:
   *  `formActions={(d) => [...d, saveAndNew]}`. Falls back to `VuiProvider`'s
   *  `form.actions`, then to the shipped pair. */
  formActions?: FormActionsConfig<T>;
  /** Replace the form footer outright. The array covers almost everything, so
   *  reach for this only when it genuinely can't express what you need. */
  renderFooter?: (ctx: FormActionContext<T>) => React.ReactNode;
  /** Your own content between the form's fields — a callout, a preview, a pair
   *  of custom controls. Each slot renders as a full-width row inside its
   *  section, so it inherits the card, separators and padding. */
  formSlots?: FormSlot<T>[];
  /** Show the row Edit (pencil) action and the Edit button on the view panel.
   *  Defaults to whether any field is `editable`, so a read-only list (every
   *  field `editable: false`) gets no Edit affordance instead of one that opens
   *  an empty form. Set `false` to hide it on an otherwise editable table. */
  showEdit?: boolean;
  /** Show the Filter panel. Default `true`. */
  showFilter?: boolean;
  /** Extra rows to add to the Filter panel. Compose with `FilterField`
   *  (from `@viliha/vui-react/filter-field`) so they inherit the two-column
   *  label │ control layout; render inside the same grid, below the
   *  `filterable` fields. Their state and matching are yours to manage. */
  filterExtras?: React.ReactNode;
  /** Show the Sort menu. Default `true`. */
  showSort?: boolean;
  /** Show the pagination footer. When `false` in client mode, all rows render
   *  (no page slicing). Default `true`. */
  showPagination?: boolean;
  /** Show row selection — the checkbox column, bulk Actions, and Clear
   *  selection. `false` also removes drag-to-reorder (it shares the leading
   *  column). Default `true`. */
  showSelection?: boolean;
  /** Show a **Trash** toggle in the header (left of the Filter control). Off by
   *  default. Enabling it lets RecordView switch the SAME table between live and
   *  soft-deleted rows. RecordView is display-only here — it never decides what
   *  "deleted" means; the host supplies the trashed rows (`trashedData` in client
   *  mode, or the `trash: true` query in `manual`/`fetcher` mode) and persists
   *  restores via `onRestore`. */
  showTrash?: boolean;
  /** Soft-deleted rows shown while Trash is active in **client mode** (`data` +
   *  `onDataChange`). Omit in `manual`/`fetcher` mode — there the host returns
   *  trashed rows for the `trash: true` query instead. */
  trashedData?: T[];
  /** Restore rows from Trash — one row (its Restore icon) or the current
   *  selection (bulk "Restore N selected"), after a confirm. The HOST persists
   *  the restore via its own API; RecordView clears the selection and refetches
   *  (`manual`) / expects the host to drop the rows from `trashedData` (client),
   *  so they leave Trash and return to Live. Providing this prop is what enables
   *  the Restore actions. Mirrors how `onDataChange` surfaces delete. */
  onRestore?: (rows: T[]) => void | Promise<void>;
}

export function RecordView<T extends { id: RowId }>({
  title,
  singular,
  icon: TitleIcon,
  fields,
  initialData = [],
  makeEmptyRow,
  getPrimary,
  formMode = "panel",
  formColumns = 1,
  onHome,
  formDescription,
  data,
  onDataChange,
  onCreate,
  onView,
  onEdit,
  onFormOpen,
  persistKey,
  resizableColumns = RESIZABLE_COLUMNS,
  onFilter,
  loading = false,
  manual = false,
  rowCount,
  onQueryChange,
  fetcher,
  cacheKey,
  cache,
  onError,
  maxCellChars = MAX_CELL_CHARS,
  defaultPageSize = DEFAULT_PAGE_SIZE,
  maxPageSize = MAX_PAGE_SIZE,
  nameLabel = "Name",
  nameSortKey,
  identityColumn = "first",
  showImport = true,
  showExport = true,
  importActions,
  exportActions,
  showAdd = true,
  formRows,
  sectionColumns,
  sections,
  behaviour: behaviourProp,
  formActions,
  renderFooter,
  formSlots,
  showEdit,
  showFilter = true,
  filterExtras,
  showSort = true,
  showPagination = true,
  showSelection = true,
  showTrash = false,
  trashedData,
  onRestore,
}: RecordViewProps<T>) {
  const behaviour = useResolved("behaviour", behaviourProp) ?? {};
  // No editable field means the Edit form would open empty, so the affordance
  // is hidden unless the host asks for it explicitly.
  const canEdit = showEditActions(fields, showEdit);
  const { titleLeading } = usePageChrome();
  // Surface the page title/icon in the app's global top bar.
  usePageTitle(title, TitleIcon);
  // Rows: `fetcher`-owned (server), controlled (data + onDataChange), or held
  // internally. `fetcher` implies manual mode.
  const fetching = fetcher !== undefined;
  const isManual = manual || fetching;
  const [internalRows, setInternalRows] = React.useState<T[]>(initialData);
  // Latest internal rows, so a mutation can compute the next array without
  // taking `internalRows` as a dependency (which would rebuild `setRows`).
  const internalRef = React.useRef<T[]>(internalRows);
  internalRef.current = internalRows;
  const controlled = data !== undefined;

  // Fetcher-managed state (only used when `fetcher` is set).
  const [fetchedData, setFetchedData] = React.useState<T[]>([]);
  // Latest fetched rows, so a mutation can compute the next array without
  // taking `fetchedData` as a dependency (which would rebuild `setRows`).
  const fetchedRef = React.useRef<T[]>(fetchedData);
  fetchedRef.current = fetchedData;
  const [fetchedTotal, setFetchedTotal] = React.useState(0);
  const [fetchedLoading, setFetchedLoading] = React.useState(fetching);
  const reqIdRef = React.useRef(0);
  const abortRef = React.useRef<AbortController | null>(null);
  const queryRef = React.useRef<ServerQuery<T> | null>(null);
  // Caching is off when the host says so, and when keep-alive is off: both mean
  // "don't hold this page in memory between visits".
  const caching = cache !== false && RV_KEEP_ALIVE;
  const ttlMs = (cache === false ? 0 : cache?.ttlMs) ?? RV_DEFAULT_TTL_MS;
  const cacheMax = (cache === false ? 0 : cache?.max) ?? 50;

  const runFetch = React.useCallback(
    (q: ServerQuery<T>, opts?: { background?: boolean }) => {
      if (!fetcher) return;
      const id = ++reqIdRef.current;
      const started = Date.now();
      // Set when a cached page was painted, so the revalidation that follows
      // replaces it the moment it lands instead of waiting out the shimmer's
      // minimum: there is no shimmer to hold.
      let painted = false;
      // Reveal the data, but hold the shimmer for a consistent minimum so a
      // cache hit (served from memory, no server call) looks the same as a real
      // fetch — same animation every time, never a confusing blank flash.
      const commit = (rows: T[], total: number) => {
        const apply = () => {
          if (id !== reqIdRef.current) return; // superseded
          setFetchedData(rows);
          setFetchedTotal(total);
          setFetchedLoading(false);
        };
        const wait = RV_MIN_LOADING_MS - (Date.now() - started);
        if (opts?.background || painted || wait <= 0) apply();
        else window.setTimeout(apply, wait);
      };

      // A hit paints straight away so there's no blank flash, and then the
      // request goes out anyway. Never `return` here: that was the bug that let
      // a table show the same rows for the life of the page.
      if (!opts?.background && caching && cacheKey) {
        const hit = rvCacheGet(cacheKey, rvQueryKey(q), ttlMs);
        if (hit) {
          setFetchedData(hit.rows as T[]);
          setFetchedTotal(hit.total);
          setFetchedLoading(false);
          painted = true;
        }
      }
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      // Already showing something: revalidate quietly rather than shimmering
      // over data the user is reading.
      if (!opts?.background && !painted) setFetchedLoading(true);
      fetcher(q, controller.signal)
        .then((res) => {
          if (id !== reqIdRef.current) return; // superseded
          if (caching && cacheKey)
            rvCacheSet(
              cacheKey,
              rvQueryKey(q),
              { rows: res.rows, total: res.total, at: Date.now() },
              cacheMax,
            );
          commit(res.rows, res.total);
        })
        .catch((err) => {
          if (controller.signal.aborted || id !== reqIdRef.current) return;
          setFetchedLoading(false);
          onError?.(err, q);
        });
    },
    [fetcher, cacheKey, caching, ttlMs, cacheMax, onError],
  );
  // Abort any in-flight request on unmount.
  React.useEffect(() => () => abortRef.current?.abort(), []);

  // Trash view: show soft-deleted rows instead of live ones. Display-only — the
  // host supplies them via `trashedData` (client) or the `trash: true` query
  // (manual/fetcher, where the host swaps `data`/the fetch result).
  const [trash, setTrash] = React.useState(false);
  const rows = fetching
    ? fetchedData
    : trash && trashedData !== undefined
      ? trashedData
      : controlled
        ? data
        : internalRows;
  /**
   * Update the rows we render without treating it as a data change: no
   * `onDataChange`, no cache invalidation, no refetch. Opening a blank Add form
   * and throwing that draft away are not mutations, and routing them through the
   * mutation path made a server-backed table refetch immediately, which returned
   * a page without the draft in it and closed the form the user had just opened.
   */
  const setRowsLocal = React.useCallback(
    (updater: React.SetStateAction<T[]>) => {
      if (fetching) {
        setFetchedData((prev) =>
          typeof updater === "function" ? (updater as (p: T[]) => T[])(prev) : updater,
        );
        return;
      }
      if (controlled) {
        const next =
          typeof updater === "function" ? (updater as (prev: T[]) => T[])(data as T[]) : updater;
        onDataChange?.(next); // the host holds the rows; it must hold the draft
        return;
      }
      setInternalRows(updater);
    },
    [fetching, controlled, data, onDataChange],
  );

  const setRows = React.useCallback(
    (updater: React.SetStateAction<T[]>) => {
      const apply = (prev: T[]) =>
        typeof updater === "function" ? (updater as (p: T[]) => T[])(prev) : updater;
      /** Reload after the host's write lands. Reloading first would race the
       *  POST/PATCH and repaint pre-write rows, which is why a save looked
       *  lost. A host that returns nothing keeps the old, immediate reload. */
      const afterWrite = (written: void | Promise<void>, reload: () => void) => {
        if (written && typeof written.then === "function") {
          void written.then(reload, (err: unknown) => {
            if (queryRef.current) onError?.(err, queryRef.current);
            reload(); // the optimistic row didn't persist; show server truth
          });
        } else {
          reload();
        }
      };
      if (fetching) {
        // Optimistic local update, then invalidate the cache and reload the
        // current query in the background so the table reflects server truth.
        const next = apply(fetchedRef.current);
        setFetchedData(next);
        afterWrite(onDataChange?.(next), () => {
          if (cacheKey) clearRecordViewCache(cacheKey);
          if (queryRef.current) runFetch(queryRef.current, { background: true });
        });
        return;
      }
      if (isManual && !controlled) {
        // Server mode where the host owns the fetch: mutate locally so the row
        // is there immediately, then re-emit the query so the host reloads the
        // page it just wrote. Only a host that returns a promise from
        // `onDataChange` gets that reload — without one there is nothing to
        // wait for, and reloading would race a write we can't see.
        const next = apply(internalRef.current);
        setInternalRows(next);
        const written = onDataChange?.(next);
        if (written && typeof written.then === "function") {
          afterWrite(written, () => {
            if (queryRef.current) onQueryChange?.(queryRef.current);
          });
        }
        return;
      }
      if (controlled) {
        onDataChange?.(apply(data as T[]));
      } else {
        setInternalRows(updater);
      }
    },
    [
      fetching,
      isManual,
      cacheKey,
      runFetch,
      controlled,
      data,
      onDataChange,
      onQueryChange,
      onError,
    ],
  );
  // Manual (server) mode without the controlled `data` prop feeds each page
  // through `initialData` and refetches via `onQueryChange`. Re-sync the internal
  // copy whenever that seed changes so a post-mutation reload (create/edit/delete)
  // or a narrowed filter replaces the stranded optimistic rows — otherwise the
  // grid keeps showing stale rows until a manual reload. Controlled mode reads
  // `data` live; client mode keeps its rows (local edits own them).
  React.useEffect(() => {
    if (isManual && !controlled) setInternalRows(initialData);
  }, [isManual, controlled, initialData]);
  const [filter, setFilter] = usePersistentState(
    persistKey ? `${persistKey}::filter` : undefined,
    "",
  );
  // Per-field Filter-panel values (opt-in via `field.filterable`). Kept apart
  // from the single-keyword `filter`; persisted like the rest of the view.
  const [filterValues, setFilterValues] = usePersistentState<FilterValues<T>>(
    persistKey ? `${persistKey}::filterValues` : undefined,
    {},
  );
  const [sort, setSort] = usePersistentState<{
    key: string;
    dir: "asc" | "desc";
  } | null>(persistKey ? `${persistKey}::sort` : undefined, null);
  const [hidden, setHidden] = React.useState<Set<string>>(new Set());
  const [selected, setSelected] = React.useState<Set<RowId>>(new Set());
  const [editing, setEditing] = React.useState<{
    id: RowId;
    key: string;
  } | null>(null);
  const [draft, setDraft] = React.useState("");
  const [activeId, setActiveId] = React.useState<RowId | null>(null);
  // A row created via "add" but not yet saved — Cancel/close removes it.
  const [newRowId, setNewRowId] = React.useState<RowId | null>(null);
  /** The unsaved record an open Add form is editing, kept outside `rows` so a
   *  refetch can't take it away mid-edit. */
  const [draftRow, setDraftRow] = React.useState<T | null>(null);
  // Row pending delete confirmation.
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<RowId | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);
  // Restore-from-Trash confirms (single row id / current selection), mirroring delete.
  const [confirmRestoreId, setConfirmRestoreId] = React.useState<RowId | null>(null);
  const [bulkRestoreOpen, setBulkRestoreOpen] = React.useState(false);
  // Whether the detail panel opened read-only (View) or editable (Edit / Add).
  const [panelReadOnly, setPanelReadOnly] = React.useState(false);
  const [page, setPage] = usePersistentState(persistKey ? `${persistKey}::page` : undefined, 1);
  // Page-size selector options: never above `maxPageSize` (guard against an
  // empty list if the ceiling is below the smallest preset).
  const pageSizes = React.useMemo(() => pageSizeOptions(maxPageSize), [maxPageSize]);
  const [pageSize, setPageSize] = React.useState<number>(() =>
    clampPageSize(defaultPageSize, maxPageSize),
  );
  const [flashId, setFlashId] = React.useState<RowId | null>(null);
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);
  const [dragId, setDragId] = React.useState<RowId | null>(null);
  const [dragOverId, setDragOverId] = React.useState<RowId | null>(null);
  const [menu, setMenu] = React.useState<{
    id: RowId;
    x: number;
    y: number;
  } | null>(null);
  // Empty by default: columns auto-size to their header text via CSS (`w-max`).
  // A key is only set once the user drags a column's resize handle.
  const [colWidths, setColWidths] = React.useState<Record<string, number>>({});

  const inputRef = React.useRef<HTMLInputElement>(null);
  const nextId = React.useRef(1_000_000);
  React.useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  React.useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(null);
    };
    window.addEventListener("mousedown", close);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", close);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  const tableFields = fields.filter((f) => !f.hideInTable);
  const visibleFields = tableFields.filter((f) => !hidden.has(f.key));
  // Column order: field columns with the identity (Name/Title) column inserted
  // at `identityColumn` (or hidden). `IDENTITY_COL` marks the identity slot so
  // the header, skeleton, and body rows all render in one consistent order.
  const orderedCols = orderColumns(visibleFields, identityColumn) as (
    | RecordField<T>
    | IdentitySlot
  )[];
  // Sorting is decoupled from column visibility: a field is sortable when its
  // `sortable` flag says so, else it falls back to "is a visible column".
  const canSort = (f: RecordField<T>) => canSortField(f);
  // Fields offered in the Sort dropdown (may include hidden-but-sortable fields
  // and exclude visible-but-unsortable ones).
  const sortFields = fields.filter(canSort);
  // Field the identity column sorts by (its header toggles + shows a caret).
  // Explicit `nameSortKey`, else the first hidden field marked sortable (the one
  // that drives getPrimary). Undefined → identity header stays static.
  const nameSortKeyResolved = resolveNameSortKey(fields, nameSortKey);
  // Fields opted into per-field filtering. Non-empty → the Filter panel renders
  // a control per field instead of the single keyword box.
  const filterFields = fields.filter((f) => f.filterable);

  // The primary "Name" column renders the record's name field, which is hidden
  // as a regular column (hideInTable) because it shows here. Mirror its
  // required mark so a mandatory name shows `*` like every other column.
  // ponytail: name field = a required hideInTable field (the app convention).
  const nameRequired = fields.some((f) => f.hideInTable && f.required);

  const totalWidth = totalColumnWidth({ visibleFields, widths: colWidths, showSelection });

  const resizeHandle = (col: string, label: string) =>
    !resizableColumns ? null : (
      <button
        type="button"
        aria-label={`Resize ${label} column`}
        title="Drag to resize"
        onMouseDown={(e) => startResize(col, e)}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            nudgeColumn(col, -1);
          }
          if (e.key === "ArrowRight") {
            e.preventDefault();
            nudgeColumn(col, 1);
          }
        }}
        className={RV_RESIZE_HANDLE}
      />
    );

  const processed = React.useMemo(() => {
    // Server mode: `rows` is already the filtered/sorted current page — render it verbatim.
    if (isManual) return rows;
    return clientSort(
      clientFilter(rows, filter, fields, (row) => getPrimary(row).title),
      sort,
    );
  }, [isManual, rows, filter, sort, fields, getPrimary]);

  // A refetch (a mutation elsewhere, a tab refocus, a poll) replaces `rows`
  // with what the server returned, which never contains an unsaved draft. Fall
  // back to the draft we're holding so an open Add form survives it.
  const activeRow =
    rows.find((r) => r.id === activeId) ??
    (activeId != null && activeId === newRowId ? draftRow : null) ??
    null;
  const deleteTarget =
    confirmDeleteId != null ? (rows.find((r) => r.id === confirmDeleteId) ?? null) : null;

  // Pagination (derived; `page` is clamped so it never points past the last page).
  // Server mode: totals come from `rowCount`, and `data` is already this page —
  // so render it whole (no slice) and size the range to what the server returned.
  const total = isManual
    ? fetching
      ? fetchedTotal
      : (rowCount ?? processed.length)
    : processed.length;
  const {
    totalPages,
    page: safePage,
    rangeStart,
    rangeEnd,
    rows: paged,
  } = paginate({ rows: processed, page, pageSize, total, manual: isManual, showPagination });
  // Loading state comes from the fetcher when it owns the data.
  const effectiveLoading = fetching ? fetchedLoading : loading;
  // Keep the current query fresh for post-mutation background refetches.
  queryRef.current = {
    page: safePage,
    pageSize,
    sort,
    search: filter,
    filters: filterValues,
    trash,
  };

  // Reset to the first page when the filter, page size, or Trash view changes.
  React.useEffect(() => {
    setPage(1);
  }, [filter, pageSize, trash, setPage]);

  // Switching between Live and Trash clears the selection (it doesn't carry
  // across views) and closes any open detail panel.
  React.useEffect(() => {
    setSelected(new Set());
    setActiveId(null);
  }, [trash]);

  // Server mode: report the query so the consumer can fetch. Fires on page,
  // size, sort, and keyword changes (and once on mount for the initial load).
  // Per-field filters emit via the Filter panel's Search/Clear instead, so they
  // apply on demand, not per keystroke. `filterValues` is read fresh here but
  // deliberately left out of the deps for that reason.
  React.useEffect(() => {
    if (!isManual) return;
    const query: ServerQuery<T> = {
      page: safePage,
      pageSize,
      sort,
      search: filter,
      filters: filterValues,
      trash,
    };
    // `fetcher` owns the fetch; otherwise hand the query to the consumer.
    if (fetching) runFetch(query);
    else onQueryChange?.(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isManual, fetching, safePage, pageSize, sort, filter, trash, onQueryChange, runFetch]);

  // Cascading filter options: when the values change, drop any filter value no
  // longer valid once its options recompute (e.g. changing Region invalidates a
  // Country filter). Only function-options filters cascade. Strings clear; multi
  // (checkbox) arrays keep the still-valid entries.
  React.useEffect(() => {
    const next = pruneFilterValues(fields, filterValues);
    if (next) setFilterValues(next);
  }, [filterValues, fields, setFilterValues]);

  function startEdit(row: T, key: string) {
    setEditing({ id: row.id, key });
    setDraft(String(row[key as keyof T] ?? ""));
  }
  function commit() {
    if (!editing) return;
    setRows((prev) =>
      prev.map((row) => (row.id === editing.id ? { ...row, [editing.key]: draft } : row)),
    );
    setEditing(null);
  }
  function startResize(key: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startW = colWidths[key] ?? RV_RESIZE_BASE_W;
    const onMove = (ev: MouseEvent) => {
      setColWidths((prev) => ({ ...prev, [key]: resizedWidth(startW, ev.clientX - startX) }));
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
  }
  function nudgeColumn(key: string, dir: -1 | 1) {
    setColWidths((prev) => ({ ...prev, [key]: resizedWidth(prev[key], dir * RV_NUDGE_PX) }));
  }
  function toggleSort(key: string) {
    setSort((prev) => nextSort(prev, key));
  }
  function toggleHidden(key: string) {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }
  function toggleSelect(id: RowId) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleSelectAll() {
    setSelected((prev) =>
      prev.size === processed.length ? new Set() : new Set(processed.map((r) => r.id)),
    );
  }
  /** Bulk-set a choice field on every selected row (keeps the selection). */
  function bulkSetField(key: keyof T, value: string) {
    setRows((prev) => prev.map((r) => (selected.has(r.id) ? ({ ...r, [key]: value } as T) : r)));
  }
  /** Delete every selected row, then clear the selection. */
  function bulkDelete() {
    setRows((prev) => prev.filter((r) => !selected.has(r.id)));
    if (activeId != null && selected.has(activeId)) setActiveId(null);
    setSelected(new Set());
    setBulkDeleteOpen(false);
  }
  function addRow() {
    // Routed create: delegate to the caller (e.g. navigate to /new).
    if (onCreate) {
      onFormOpen?.("create");
      onCreate();
      return;
    }
    if (!makeEmptyRow) return; // read-only list — nothing to create
    const row = { ...makeEmptyRow(), id: nextId.current++ };
    onFormOpen?.("create", row);
    // Prepend so the new record is immediately visible at the top…
    setRowsLocal((prev) => [row, ...prev]);
    setDraftRow(row);
    setPage(1);
    setPanelReadOnly(false);
    setActiveId(row.id);
    setNewRowId(row.id);
  }
  /** Open the detail panel read-only (View). */
  function openView(id: RowId) {
    onFormOpen?.("view", rows.find((r) => r.id === id) ?? undefined);
    if (onView) {
      onView(id);
      return;
    }
    setPanelReadOnly(true);
    setActiveId(id);
  }
  /** Open the detail panel editable (Edit). */
  function openEdit(id: RowId) {
    onFormOpen?.("edit", rows.find((r) => r.id === id) ?? undefined);
    if (onEdit) {
      onEdit(id);
      return;
    }
    setPanelReadOnly(false);
    setActiveId(id);
  }
  /** Commit the form's buffered draft back into the table. `then` comes from the
   *  action that saved (Save closes, "Save & New" opens a blank row); without
   *  one it follows `behaviour.closeOnSave`. */
  function saveForm(updated: T, then?: FormActionOutcome) {
    setDraftRow(null);
    setRows((prev) =>
      // A refetch while the form was open can have dropped the draft; put the
      // saved record back rather than losing what was just typed.
      prev.some((r) => r.id === updated.id)
        ? prev.map((r) => (r.id === updated.id ? updated : r))
        : [updated, ...prev],
    );
    // Flash the saved row so the change is unmistakable.
    const flashMs = behaviour.flashMs ?? 1600;
    if (flashMs > 0) {
      setFlashId(updated.id);
      window.setTimeout(() => {
        setFlashId((current) => (current === updated.id ? null : current));
      }, flashMs);
    }
    setNewRowId(null);
    const outcome = saveOutcome(then, behaviour);
    if (outcome === "close") setActiveId(null);
    // "new" hands the form straight to a fresh record, so a run of entries
    // never goes back to the table in between.
    else if (outcome === "new") addRow();
  }
  /** Discard the form; drop the row entirely if it was never saved. */
  function cancelForm() {
    if (activeId != null && activeId === newRowId) {
      setRowsLocal((prev) => prev.filter((r) => r.id !== activeId));
    }
    setDraftRow(null);
    setNewRowId(null);
    setActiveId(null);
  }

  const importRef = React.useRef<HTMLInputElement>(null);
  // The action waiting on a file: one picker, reused by whichever asked.
  const pendingImport = React.useRef<IoAction<T> | null>(null);
  const tableConfig = useResolved("table", undefined) ?? {};

  /** What an Import or Export action gets to work with. Built per use, so it
   *  always describes what is on screen right now. */
  const ioContext = (file?: File): IoContext<T> => ({
    rows: processed,
    columns: fields.map((f) => ({ key: f.key, label: f.label })),
    title,
    query: queryRef.current ?? undefined,
    file,
    applyRows: (imported) => {
      setRows((prev) => [...imported, ...prev]);
      setPage(1);
    },
    refetch: () => {
      if (cacheKey) clearRecordViewCache(cacheKey);
      if (queryRef.current) runFetch(queryRef.current, { background: true });
    },
  });

  const exportMenu = resolveIoActions<T>(
    defaultExportActions<T>(),
    exportActions ?? (tableConfig.exportActions as IoActionsConfig<T>),
  );
  const importMenu = resolveIoActions<T>(
    defaultImportActions<T>(makeEmptyRow, () => nextId.current++),
    importActions ?? (tableConfig.importActions as IoActionsConfig<T>),
  );

  /** Run one action, opening the file picker first when it asked for a file. */
  function runIo(action: IoAction<T>) {
    if (action.pickFile) {
      pendingImport.current = action;
      if (importRef.current) {
        importRef.current.accept = action.accept ?? "";
        importRef.current.click();
      }
      return;
    }
    void action.onAct(ioContext());
  }

  async function onImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    const action = pendingImport.current;
    pendingImport.current = null;
    if (file && action) await action.onAct(ioContext(file));
  }

  /** What a click on the row's name does. `none` leaves the name inert, for a
   *  table where opening a record is not the point. */
  const rowClick = behaviour.rowClick ?? "view";
  function openRow(id: RowId) {
    if (rowClick === "view") openView(id);
    else if (rowClick === "edit") openEdit(id);
  }
  /** Delete, asking first unless the app turned the confirm off. */
  function requestDelete(id: RowId) {
    if (behaviour.confirmDelete ?? true) setConfirmDeleteId(id);
    else deleteRow(id);
  }
  function deleteRow(id: RowId) {
    setRows((prev) => prev.filter((row) => row.id !== id));
    setSelected((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    if (activeId === id) setActiveId(null);
  }
  /** Restore rows from Trash. The host persists via `onRestore`; RecordView
   *  clears the selection and (in fetcher mode) refetches, so the rows leave the
   *  Trash view. Client-mode hosts drop them from `trashedData`. */
  function restore(ids: RowId[]) {
    const set = new Set(ids);
    const toRestore = rows.filter((r) => set.has(r.id));
    if (toRestore.length) void onRestore?.(toRestore);
    setSelected(new Set());
    if (fetching) {
      if (cacheKey) clearRecordViewCache(cacheKey);
      if (queryRef.current) runFetch(queryRef.current, { background: true });
    }
    setConfirmRestoreId(null);
    setBulkRestoreOpen(false);
  }
  function duplicateRow(id: RowId) {
    const copyId = nextId.current++;
    setRows((prev) => {
      const index = prev.findIndex((row) => row.id === id);
      if (index < 0) return prev;
      const original = prev[index];
      if (!original) return prev;
      const next = [...prev];
      next.splice(index + 1, 0, { ...original, id: copyId } as T);
      return next;
    });
    setActiveId(copyId);
  }
  function reorder(sourceId: RowId, targetId: RowId) {
    if (sourceId === targetId) return;
    // Manual ordering only makes sense without an active sort.
    setSort(null);
    setRows((prev) => reorderRows(prev, sourceId, targetId));
  }
  async function copyValue(key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey((current) => (current === key ? null : current)), 1200);
    } catch {
      // Clipboard unavailable (insecure context / denied) — no-op.
    }
  }

  const allSelected = processed.length > 0 && selected.size === processed.length;
  // Choice fields power the "Set …" bulk actions, and only editable ones: a
  // field the form won't let you change shouldn't be writable in bulk either.
  // Static arrays only — bulk "Set {label}" has no single draft to resolve a
  // function-options field against.
  const bulkFields = fields.filter(
    (f) => f.editable && Array.isArray(f.options) && f.options.length > 0,
  );
  // Per-column alignment (auto: numbers + short codes center).
  const columnAligns = React.useMemo(
    () => computeColumnAligns(fields, initialData),
    [fields, initialData],
  );
  const alignOf = (key: string): ColAlign => columnAligns[key] ?? "left";

  function renderCellValue(row: T, field: RecordField<T>) {
    const isEditing = editing?.id === row.id && editing.key === field.key;
    if (field.render) {
      // Clip to the column box so a wide custom cell (e.g. a long status badge)
      // never bleeds into the next column. Widen it by dragging the header edge
      // (resizableColumns) or set the field's `width`.
      return (
        <div className={cn(RV_CELL_CUSTOM, RV_ALIGN_TEXT[alignOf(field.key)])}>
          {field.render(row)}
        </div>
      );
    }
    if (isEditing) {
      return (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") setEditing(null);
          }}
          aria-label={`Edit ${field.label}`}
          className={cn(RV_CELL_INPUT, RV_ALIGN_TEXT[alignOf(field.key)])}
        />
      );
    }
    const value = String(row[field.key] ?? "");
    // For a choice field, show the option's friendly label (e.g. SYSTEM →
    // "System") while the cell stays editable — no `render`, no read-only.
    const display =
      field.displayValue?.(row) ??
      (field.input === "checkbox"
        ? row[field.key]
          ? "Yes"
          : "No"
        : Array.isArray(field.options)
          ? (field.options.find((o) => o.value === value)?.label ?? value)
          : value);
    const clip = clipCell(display, field.maxChars ?? maxCellChars);
    // Async-id fields resolve their label for the read cell (the edit control
    // already resolves its own). Everything else uses the clipped text + tooltip.
    const readContent = field.displayValue ? (
      <span className={RV_TRUNCATE}>{clip.text || <MissingValue />}</span>
    ) : field.multiple ? (
      <span className={RV_CELL_MULTI}>
        <MultiFieldValue
          field={field}
          values={Array.isArray(row[field.key]) ? (row[field.key] as string[]) : []}
          row={row}
        />
      </span>
    ) : isAsyncLabeled(field) && value ? (
      <span className={RV_TRUNCATE}>
        <AsyncFieldValue field={field} value={value} values={row} />
      </span>
    ) : clip.full ? (
      <Tooltip content={clip.full} className={RV_TRUNCATE}>
        {clip.text}
      </Tooltip>
    ) : (
      <span className={RV_TRUNCATE}>{clip.text || <span className={RECORD_MISSING}>—</span>}</span>
    );
    const cellKey = `${row.id}:${field.key}`;
    const hoverActions =
      field.editable || (field.copyable && value) ? (
        <span className={RV_CELL_ACTIONS}>
          {field.copyable && value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                void copyValue(cellKey, value);
              }}
              aria-label={`Copy ${field.label}`}
              title={`Copy ${field.label}`}
              className={RV_CELL_ACTION}
            >
              {copiedKey === cellKey ? (
                <Check className={RV_COPIED_ICON} />
              ) : (
                <Copy className={RV_ICON} />
              )}
            </button>
          )}
          {field.editable && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                startEdit(row, field.key);
              }}
              aria-label={`Edit ${field.label}`}
              title={`Edit ${field.label}`}
              className={RV_CELL_ACTION}
            >
              <Pencil className={RV_ICON} />
            </button>
          )}
        </span>
      ) : null;

    if (field.editable) {
      return (
        <div className={RV_CELL_EDITABLE}>
          <button
            type="button"
            onClick={() => startEdit(row, field.key)}
            className={cn(RV_CELL_BUTTON, RV_ALIGN_BOX[alignOf(field.key)])}
          >
            {readContent}
          </button>
          {hoverActions}
        </div>
      );
    }
    return (
      <div className={cn(RV_CELL_READ, RV_ALIGN_BOX[alignOf(field.key)])}>
        {readContent}
        {hoverActions}
      </div>
    );
  }

  // Full-page form mode: replace the table chrome entirely while adding/editing
  // (this also hides the import/export/add actions, which live in that chrome).
  if (formMode === "page" && activeRow) {
    return (
      <RecordDetailPanel
        layout="page"
        columns={formColumns}
        isNew={activeId === newRowId}
        title={title}
        onHome={onHome}
        formDescription={formDescription}
        fields={fields}
        row={activeRow}
        singular={singular}
        icon={TitleIcon}
        getPrimary={getPrimary}
        readOnly={panelReadOnly}
        onEdit={canEdit ? () => setPanelReadOnly(false) : undefined}
        onSave={saveForm}
        onCancel={cancelForm}
        formActions={formActions}
        renderFooter={renderFooter}
        formSlots={formSlots}
        behaviour={behaviour}
        formRows={formRows}
        sectionColumns={sectionColumns}
        sections={sections}
      />
    );
  }

  return (
    <div className={RV_SHELL}>
      {/* Header — title/icon now live in the global top bar; this row holds the
          per-record actions (add / import / export). */}
      <div className={RV_HEADER}>
        <div className={RV_INLINE_ROW}>{titleLeading}</div>
        <div className={RV_HEADER_ACTIONS}>
          {showImport && importMenu.length > 0 && (
            <>
              <input
                ref={importRef}
                type="file"
                onChange={onImportFile}
                className={RV_FILE_INPUT}
                aria-hidden="true"
              />
              <Dropdown
                label="Import"
                labelClassName={RV_LABEL_SM}
                icon={<Upload className={RV_ICON_IMPORT} />}
                align="end"
              >
                <DropdownLabel>Import from</DropdownLabel>
                {importMenu
                  .filter((a) => a.visible?.(ioContext()) ?? true)
                  .map((action) => (
                    <DropdownItem key={action.id} onSelect={() => runIo(action)}>
                      <span className={RV_INLINE_ROW}>
                        {action.icon && <action.icon className={RV_ICON} />}
                        {action.label}
                      </span>
                    </DropdownItem>
                  ))}
              </Dropdown>
            </>
          )}

          {showExport && exportMenu.length > 0 && (
            <Dropdown
              label="Export"
              labelClassName={RV_LABEL_SM}
              icon={<Download className={RV_ICON_EXPORT} />}
              align="end"
            >
              <DropdownLabel>Export as</DropdownLabel>
              {exportMenu
                .filter((a) => a.visible?.(ioContext()) ?? true)
                .map((action) => (
                  <DropdownItem key={action.id} onSelect={() => runIo(action)}>
                    <span className={RV_INLINE_ROW}>
                      {action.icon && <action.icon className={RV_ICON} />}
                      {action.label}
                    </span>
                  </DropdownItem>
                ))}
            </Dropdown>
          )}

          <Dropdown
            label=""
            ariaLabel="More actions"
            icon={<MoreHorizontal className={RV_ICON_MORE} />}
            align="end"
          >
            {showSelection && (
              <DropdownItem onSelect={() => setSelected(new Set())}>Clear selection</DropdownItem>
            )}
            <DropdownItem onSelect={() => setHidden(new Set())}>Show all columns</DropdownItem>
          </Dropdown>

          {showAdd && (onCreate || makeEmptyRow) && !trash && (
            <Button variant="primary" size="sm" onClick={addRow} className={RV_ADD_BUTTON}>
              <Plus className={RV_ICON_LG} />
              <span className={RV_LABEL_SM}>{singular}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Content — padded, bordered card (matches the settings-page layout) */}
      <div className={RV_CONTENT}>
        <div className={RV_CARD}>
          {/* Sub-toolbar */}
          <div className={RV_TOOLBAR}>
            <div className={RV_INLINE_ROW}>
              <ListFilter className={RV_ICON_TITLE} />
              {selected.size > 0 ? (
                <span className={RV_INLINE_ROW}>
                  <span className={RV_TOOLBAR_TITLE}>{selected.size} selected</span>
                  <button
                    type="button"
                    onClick={() => setSelected(new Set())}
                    className={RV_CLEAR_SELECTION}
                  >
                    Clear
                  </button>
                </span>
              ) : (
                <span className={RV_TOOLBAR_TITLE}>
                  {trash ? `Trash · ${title}` : `All ${title}`}
                </span>
              )}
            </div>
            <div className={RV_TOOLBAR_CONTROLS}>
              {/* Bulk actions — mirror the Options dropdown; shown only with a selection. */}
              {selected.size > 0 && (
                <Dropdown label="Actions" icon={<MoreHorizontal className={RV_ICON_EXPORT} />}>
                  <DropdownLabel>{selected.size} selected</DropdownLabel>
                  {trash ? (
                    // Trash view: restore is the only bulk action.
                    onRestore && (
                      <DropdownItem onSelect={() => setBulkRestoreOpen(true)}>
                        <span className={RV_BULK_RESTORE}>
                          <Restore className={RV_ICON} /> Restore {selected.size} selected
                        </span>
                      </DropdownItem>
                    )
                  ) : (
                    <>
                      {bulkFields.map((f) => (
                        <React.Fragment key={f.key}>
                          <DropdownLabel>Set {f.label}</DropdownLabel>
                          {(Array.isArray(f.options) ? f.options : []).map((o) => (
                            <DropdownItem
                              key={o.value}
                              onSelect={() => bulkSetField(f.key, o.value)}
                            >
                              {o.label}
                            </DropdownItem>
                          ))}
                        </React.Fragment>
                      ))}
                      <DropdownItem onSelect={() => setBulkDeleteOpen(true)}>
                        <span className={RV_BULK_DELETE}>
                          <Trash2 className={RV_ICON} /> Delete {selected.size} selected
                        </span>
                      </DropdownItem>
                    </>
                  )}
                </Dropdown>
              )}
              {showTrash && (
                <button
                  type="button"
                  onClick={() => setTrash((t) => !t)}
                  aria-pressed={trash}
                  aria-label={trash ? "Show live records" : "Show Trash"}
                  className={cn(DROPDOWN_TRIGGER, RV_TRASH_TOGGLE_STATES[trash ? "on" : "off"])}
                >
                  <Trash2 className={RV_ICON_TRASH} />
                  <span className={RV_TRUNCATE}>Trash</span>
                </button>
              )}
              {showFilter && (
                <Dropdown label="Filter" icon={<ListFilter className={RV_ICON_FILTER} />}>
                  {filterFields.length > 0 || filterExtras ? (
                    // Per-field mode: a labeled control per `filterable` field (plus
                    // any `filterExtras`), and Search / Clear. The panel only gathers
                    // values — matching is the consumer's job via `onFilter`.
                    <>
                      <div className={RV_FILTER_PANEL}>
                        {/* Header: static, full-width separator (from DropdownLabel). */}
                        <DropdownLabel>Filter</DropdownLabel>
                        {/* Content: the only scrolling region. FilterGrid enforces the
                      theme default — two columns: label │ control, one row per
                      field, labels aligned across every row. */}
                        <FilterGrid className={RV_FILTER_GRID}>
                          {filterFields.map((f) => {
                            const cfg: FieldFilter<T> =
                              typeof f.filterable === "object" ? f.filterable : {};
                            const control = cfg.control ?? "text";
                            const label = cfg.label ?? f.label;
                            // Options: cfg's static array or function of the current
                            // filter values (cascading); fall back to the field's static
                            // options (a draft-function can't resolve here).
                            const opts =
                              typeof cfg.options === "function"
                                ? cfg.options(filterValues)
                                : (cfg.options ?? (Array.isArray(f.options) ? f.options : []));
                            const raw = filterValues[f.key];
                            const setVal = (v: string | string[]) =>
                              setFilterValues((prev) => ({
                                ...prev,
                                [f.key]: v,
                              }));
                            // Async filter options: lazy-load on open instead of `opts`.
                            const asyncProps: {
                              source: AsyncOptionSource;
                              resetKey: string;
                            } | null = cfg.loadOptions
                              ? {
                                  source: {
                                    loadOptions: ({ search, signal }) =>
                                      cfg.loadOptions!({
                                        search,
                                        signal,
                                        values: filterValues,
                                      }),
                                    resolveOption: cfg.resolveOption,
                                  },
                                  resetKey: (cfg.dependsOn ?? [])
                                    .map((k) => String(filterValues[k] ?? ""))
                                    .join(" "),
                                }
                              : null;
                            return (
                              // One row per field via FilterField (label │ control).
                              <FilterField key={f.key} label={label}>
                                {control === "combobox" ? (
                                  <Combobox
                                    value={typeof raw === "string" ? raw : ""}
                                    onValueChange={setVal}
                                    {...(asyncProps ?? { options: opts })}
                                    ariaLabel={label}
                                    placeholder={cfg.placeholder ?? `Any ${label.toLowerCase()}`}
                                    className={RV_FULL_WIDTH}
                                  />
                                ) : control === "select" ? (
                                  <Select
                                    value={typeof raw === "string" ? raw : ""}
                                    onValueChange={setVal}
                                    {...(asyncProps ?? { options: opts })}
                                    ariaLabel={label}
                                    placeholder={cfg.placeholder ?? `Any ${label.toLowerCase()}`}
                                    className={RV_FULL_WIDTH}
                                  />
                                ) : control === "checkbox" ? (
                                  <div className={RV_FILTER_CHECKS}>
                                    {opts.map((o) => {
                                      const arr = Array.isArray(raw) ? raw : [];
                                      const on = arr.includes(o.value);
                                      return (
                                        <label key={o.value} className={RV_FILTER_CHECK}>
                                          <input
                                            type="checkbox"
                                            checked={on}
                                            onChange={() =>
                                              setVal(
                                                on
                                                  ? arr.filter((v) => v !== o.value)
                                                  : [...arr, o.value],
                                              )
                                            }
                                          />
                                          {o.label}
                                        </label>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <Input
                                    type={
                                      control === "number"
                                        ? "number"
                                        : control === "date"
                                          ? "date"
                                          : "text"
                                    }
                                    value={typeof raw === "string" ? raw : ""}
                                    onChange={(e) => setVal(e.target.value)}
                                    placeholder={cfg.placeholder ?? "Contains…"}
                                    aria-label={label}
                                    className={RV_FILTER_INPUT}
                                  />
                                )}
                              </FilterField>
                            );
                          })}
                          {/* Consumer-added rows — compose with <FilterField> so they
                      inherit the same two-column layout. */}
                          {filterExtras}
                        </FilterGrid>
                        {/* Footer: static, full-width top border, compact buttons. */}
                        <div className={RV_FILTER_FOOTER}>
                          <Button
                            size="sm"
                            onClick={() => {
                              setFilterValues({});
                              onFilter?.({});
                              setPage(1);
                              const q: ServerQuery<T> = {
                                page: 1,
                                pageSize,
                                sort,
                                search: filter,
                                filters: {},
                                trash,
                              };
                              if (fetching) runFetch(q);
                              else if (manual) onQueryChange?.(q);
                            }}
                          >
                            Clear
                          </Button>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => {
                              onFilter?.(filterValues);
                              setPage(1);
                              const q: ServerQuery<T> = {
                                page: 1,
                                pageSize,
                                sort,
                                search: filter,
                                filters: filterValues,
                                trash,
                              };
                              if (fetching) runFetch(q);
                              else if (manual) onQueryChange?.(q);
                            }}
                          >
                            <Search className={RV_ICON} />
                            Search
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <DropdownLabel>Filter by keyword</DropdownLabel>
                      <div className={RV_KEYWORD_BODY}>
                        <div className={RV_KEYWORD_WRAP}>
                          <Search className={RV_KEYWORD_ICON} />
                          <Input
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            placeholder="Contains…"
                            aria-label="Filter"
                            className={RV_KEYWORD_INPUT}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </Dropdown>
              )}

              {showSort && (
                <Dropdown label="Sort" icon={<CaretSort className={RV_ICON_SORT} />}>
                  <DropdownLabel>Sort by</DropdownLabel>
                  {sortFields.map((f) => (
                    <DropdownItem
                      key={f.key}
                      onSelect={() => toggleSort(f.key)}
                      icon={
                        sort?.key === f.key ? (
                          sort.dir === "asc" ? (
                            <CaretUp className={RV_ICON} />
                          ) : (
                            <CaretDown className={RV_ICON} />
                          )
                        ) : undefined
                      }
                    >
                      {f.label}
                    </DropdownItem>
                  ))}
                  {sort && <DropdownItem onSelect={() => setSort(null)}>Clear sort</DropdownItem>}
                </Dropdown>
              )}

              <Dropdown
                label="Options"
                icon={<SlidersHorizontal className={RV_ICON_OPTIONS} />}
                align="end"
              >
                <DropdownLabel>Visible columns</DropdownLabel>
                {tableFields.map((f) => (
                  <DropdownItem
                    key={f.key}
                    checked={!hidden.has(f.key)}
                    onSelect={() => toggleHidden(f.key)}
                  >
                    {f.label}
                  </DropdownItem>
                ))}
              </Dropdown>

              {/* Pagination */}
              {showPagination && (
                <div className={RV_PAGER}>
                  <Dropdown
                    label={`${pageSize} / page`}
                    icon={<Rows3 className={RV_ICON_PAGE_SIZE} />}
                    align="end"
                  >
                    <DropdownLabel>Rows per page</DropdownLabel>
                    {pageSizes.map((n: number) => (
                      <DropdownItem
                        key={n}
                        checked={pageSize === n}
                        onSelect={() => setPageSize(n)}
                      >
                        {n} per page
                      </DropdownItem>
                    ))}
                  </Dropdown>
                  <span className={RV_PAGER_RANGE}>
                    {rangeStart}–{rangeEnd} of {total}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage <= 1}
                    aria-label="Previous page"
                    className={RV_PAGER_BUTTON}
                  >
                    <ChevronLeft className={RV_ICON_LG} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage >= totalPages}
                    aria-label="Next page"
                    className={RV_PAGER_BUTTON}
                  >
                    <ChevronRight className={RV_ICON_LG} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Table. `vui-scroll` keeps both bars visible: a table wider than
              its container otherwise just looks like it ends. */}
          <div className={RV_SCROLL}>
            <Table style={{ minWidth: totalWidth, tableLayout: "auto" }} className={RV_FULL_WIDTH}>
              <TableHeader className={RV_TABLE_HEADER}>
                <TableRow className={RV_ROW_INERT}>
                  {showSelection && (
                    <TableHead style={{ width: RV_CHECKBOX_W }} className={RV_CELL_FLUSH}>
                      <div className={RV_SELECT_CELL}>
                        {/* Spacer matching the row drag-grip slot so this checkbox
                        lines up vertically with the row checkboxes below. */}
                        <span aria-hidden="true" className={RV_GRIP_SPACER} />
                        <Checkbox
                          checked={allSelected}
                          onChange={toggleSelectAll}
                          aria-label="Select all"
                        />
                      </div>
                    </TableHead>
                  )}
                  {orderedCols.map((col) => {
                    if (col === IDENTITY_COL) {
                      const IdIcon = TitleIcon ?? DEFAULT_FIELD_ICON;
                      const inner = (
                        <>
                          <IdIcon className={RV_HEAD_ICON} />
                          <span className={RV_HEAD_LABEL}>
                            {nameLabel}
                            {nameRequired && <RequiredMark />}
                          </span>
                          {nameSortKeyResolved &&
                            (sort?.key === nameSortKeyResolved ? (
                              sort.dir === "asc" ? (
                                <CaretUp className={RV_HEAD_CARET} />
                              ) : (
                                <CaretDown className={RV_HEAD_CARET} />
                              )
                            ) : (
                              <CaretSort className={RV_HEAD_CARET_IDLE} />
                            ))}
                        </>
                      );
                      return (
                        <TableHead
                          key="__identity"
                          className={RV_HEAD_CELL}
                          style={{ width: colWidths[RV_NAME_COL] }}
                        >
                          {nameSortKeyResolved ? (
                            <button
                              type="button"
                              onClick={() => toggleSort(nameSortKeyResolved)}
                              className={RV_NAME_HEAD_BUTTON}
                            >
                              {inner}
                            </button>
                          ) : (
                            <span className={RV_NAME_HEAD_STATIC}>{inner}</span>
                          )}
                          {resizeHandle(RV_NAME_COL, nameLabel)}
                        </TableHead>
                      );
                    }
                    const f = col;
                    const HeadIcon = f.icon ?? DEFAULT_FIELD_ICON;
                    const sortable = canSort(f);
                    const headInner = (
                      <>
                        <HeadIcon className={RV_HEAD_ICON} />
                        <span className={RV_HEAD_LABEL}>
                          {f.label}
                          {f.required && <RequiredMark />}
                        </span>
                        {/* Sortable columns always show an indicator: a muted
                        up/down caret by default, a solid caret for the active
                        direction (up = ascending, down = descending). */}
                        {sortable &&
                          (sort?.key === f.key ? (
                            sort.dir === "asc" ? (
                              <CaretUp className={RV_HEAD_CARET} />
                            ) : (
                              <CaretDown className={RV_HEAD_CARET} />
                            )
                          ) : (
                            <CaretSort className={RV_HEAD_CARET_IDLE} />
                          ))}
                      </>
                    );
                    const headClass = cn(RV_HEAD_INNER, RV_ALIGN_BOX[alignOf(f.key)]);
                    return (
                      <TableHead
                        key={f.key}
                        className={RV_HEAD_CELL}
                        style={{ width: colWidths[f.key] }}
                      >
                        {sortable ? (
                          <button
                            type="button"
                            onClick={() => toggleSort(f.key)}
                            className={cn(headClass, RV_HEAD_SORTABLE)}
                          >
                            {headInner}
                          </button>
                        ) : (
                          // Not sortable: a static label, no toggle / hover affordance.
                          <span className={headClass}>{headInner}</span>
                        )}
                        {resizeHandle(f.key, f.label)}
                      </TableHead>
                    );
                  })}
                  {/* Flex spacer absorbs leftover width so data columns keep their
                  natural size AND the Actions column stays pinned to the right
                  edge. Borderless so no stray divider shows in the gap. */}
                  <TableHead aria-hidden="true" className={RV_SPACER_HEAD} />
                  <TableHead style={{ width: RV_ACTIONS_W }} className={RV_ACTIONS_HEAD}>
                    <span className={RV_ACTIONS_HEAD_LABEL}>Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {effectiveLoading ? (
                  // Animated skeleton rows while data loads from the server.
                  Array.from({ length: Math.min(pageSize, 8) }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`} className={RV_ROW_INERT}>
                      <TableCell style={{ width: RV_CHECKBOX_W }}>
                        <div className={RV_SKELETON_CHECKBOX} />
                      </TableCell>
                      {orderedCols.map((col) =>
                        col === IDENTITY_COL ? (
                          <TableCell key="__identity" style={{ width: colWidths[RV_NAME_COL] }}>
                            <div className={RV_INLINE_ROW}>
                              <div className={RV_SKELETON_AVATAR} />
                              <div className={RV_SKELETON_NAME} />
                            </div>
                          </TableCell>
                        ) : (
                          <TableCell key={col.key} style={{ width: colWidths[col.key] }}>
                            <div className={RV_SKELETON_VALUE} />
                          </TableCell>
                        ),
                      )}
                      <TableCell aria-hidden="true" className={RV_SPACER_CELL} />
                      <TableCell style={{ width: RV_ACTIONS_W }}>
                        <div className={RV_SKELETON_ACTIONS} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : processed.length ? (
                  paged.map((row) => {
                    const primary = getPrimary(row);
                    const nameClip = clipCell(primary.title, maxCellChars);
                    return (
                      <TableRow
                        key={row.id}
                        data-active={row.id === activeId}
                        data-flash={row.id === flashId}
                        data-dragover={row.id === dragOverId && dragId !== row.id}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setMenu({ id: row.id, x: e.clientX, y: e.clientY });
                        }}
                        onDragOver={(e) => {
                          if (dragId === null) return;
                          e.preventDefault();
                          e.dataTransfer.dropEffect = "move";
                          setDragOverId(row.id);
                        }}
                        onDrop={(e) => {
                          if (dragId === null) return;
                          e.preventDefault();
                          reorder(dragId, row.id);
                          setDragId(null);
                          setDragOverId(null);
                        }}
                        className={RV_ROW}
                      >
                        {showSelection && (
                          <TableCell className={RV_CELL_FLUSH} style={{ width: RV_CHECKBOX_W }}>
                            <div className={RV_SELECT_CELL}>
                              {/* Drag grip — always visible in a light color (so the
                              reorder affordance is discoverable), darkening on
                              hover. Inline before the checkbox; plain glyph (no
                              icon-chip border) so it doesn't read as a box. */}
                              <div
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.effectAllowed = "move";
                                  e.dataTransfer.setData("text/plain", String(row.id));
                                  setDragId(row.id);
                                }}
                                onDragEnd={() => {
                                  setDragId(null);
                                  setDragOverId(null);
                                }}
                                aria-label={`Drag ${primary.title || singular} to reorder`}
                                title="Drag to reorder"
                                className={RV_GRIP}
                              >
                                <GripVertical className={RV_GRIP_ICON} />
                              </div>
                              <Checkbox
                                checked={selected.has(row.id)}
                                onChange={() => toggleSelect(row.id)}
                                aria-label={`Select ${primary.title}`}
                              />
                            </div>
                          </TableCell>
                        )}
                        {orderedCols.map((col) =>
                          col === IDENTITY_COL ? (
                            <TableCell
                              key="__identity"
                              className={RV_CELL_FLUSH}
                              style={{
                                maxWidth: colWidths[RV_NAME_COL] ?? RV_NAME_DEFAULT_W,
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => openRow(row.id)}
                                disabled={rowClick === "none"}
                                className={RV_NAME_BUTTON}
                              >
                                <span className={RV_INITIALS}>{primary.initials}</span>
                                {nameClip.full ? (
                                  <Tooltip content={nameClip.full} className={RV_TRUNCATE}>
                                    {nameClip.text}
                                  </Tooltip>
                                ) : (
                                  <span className={RV_TRUNCATE}>{nameClip.text || "—"}</span>
                                )}
                              </button>
                            </TableCell>
                          ) : (
                            <TableCell
                              key={col.key}
                              className={RV_CELL_FLUSH}
                              style={{
                                maxWidth: colWidths[col.key] ?? fieldDefaultWidth(col),
                              }}
                            >
                              {renderCellValue(row, col)}
                            </TableCell>
                          ),
                        )}
                        <TableCell aria-hidden="true" className={RV_SPACER_HEAD} />
                        <TableCell className={RV_ACTIONS_CELL} style={{ width: RV_ACTIONS_W }}>
                          <div className={RV_ROW_ACTIONS}>
                            <button
                              type="button"
                              onClick={() => openView(row.id)}
                              aria-label={`View ${primary.title || singular}`}
                              title="View"
                              className={RV_ROW_ACTION}
                            >
                              <Eye className={RV_ROW_ICON_VIEW} />
                            </button>
                            {!trash && canEdit && (
                              <button
                                type="button"
                                onClick={() => openEdit(row.id)}
                                aria-label={`Edit ${primary.title || singular}`}
                                title="Edit"
                                className={RV_ROW_ACTION}
                              >
                                <Pencil className={RV_ROW_ICON_EDIT} />
                              </button>
                            )}
                            {trash ? (
                              onRestore && (
                                <button
                                  type="button"
                                  onClick={() => setConfirmRestoreId(row.id)}
                                  aria-label={`Restore ${primary.title || singular}`}
                                  title="Restore"
                                  className={RV_ROW_ACTION}
                                >
                                  <Restore className={RV_ROW_ICON_RESTORE} />
                                </button>
                              )
                            ) : (
                              <button
                                type="button"
                                onClick={() => requestDelete(row.id)}
                                aria-label={`Delete ${primary.title || singular}`}
                                title="Delete"
                                className={RV_ROW_ACTION_DESTRUCTIVE}
                              >
                                <Trash2 className={RV_ROW_ICON_DELETE} />
                              </button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow className={RV_ROW_INERT}>
                    <TableCell
                      colSpan={orderedCols.length + (showSelection ? 3 : 2)}
                      className={RV_EMPTY}
                    >
                      {emptyStateLabel(filter, filterValues)}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Record detail panel */}
      {activeRow && (
        <RecordDetailPanel
          /**
           * **`isNew` was missing here and the page layout above passes it**, so a brand-new unsaved
           * record reported `mode: "edit"` to a host's `formActions` in a slide-over and
           * `mode: "create"` on a full page. Found by porting this component: the Vue edition passed it
           * in both, which made the same config object behave two ways across editions, and the port is
           * the version that was right.
           */
          isNew={activeId === newRowId}
          fields={fields}
          row={activeRow}
          singular={singular}
          icon={TitleIcon}
          getPrimary={getPrimary}
          readOnly={panelReadOnly}
          onEdit={canEdit ? () => setPanelReadOnly(false) : undefined}
          onSave={saveForm}
          onCancel={cancelForm}
          formActions={formActions}
          renderFooter={renderFooter}
          formSlots={formSlots}
          behaviour={behaviour}
          formRows={formRows}
          sectionColumns={sectionColumns}
          sections={sections}
        />
      )}

      {menu && (
        <div
          role="menu"
          aria-label="Record actions"
          tabIndex={-1}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            top: Math.min(menu.y, window.innerHeight - 140),
            left: Math.min(menu.x, window.innerWidth - 200),
          }}
          className={RV_MENU}
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              openView(menu.id);
              setMenu(null);
            }}
            className={RV_MENU_ITEM}
          >
            <ArrowUpRight className={RV_ICON} />
            Open record
          </button>
          {!trash && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                duplicateRow(menu.id);
                setMenu(null);
              }}
              className={RV_MENU_ITEM}
            >
              <CopyPlus className={RV_ICON} />
              Duplicate
            </button>
          )}
          <div className={RV_MENU_SEPARATOR} />
          {trash ? (
            onRestore && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setConfirmRestoreId(menu.id);
                  setMenu(null);
                }}
                className={RV_MENU_ITEM_RESTORE}
              >
                <Restore className={RV_ICON} />
                Restore
              </button>
            )
          ) : (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                requestDelete(menu.id);
                setMenu(null);
              }}
              className={RV_MENU_ITEM_DESTRUCTIVE}
            >
              <Trash2 className={RV_ICON} />
              Delete
            </button>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmDeleteId != null}
        title={`Delete ${singular.toLowerCase()}?`}
        description={
          <>
            This permanently removes{" "}
            <span className={RV_CONFIRM_EMPHASIS}>
              {deleteTarget ? getPrimary(deleteTarget).title || "this record" : "this record"}
            </span>
            . This can’t be undone.
          </>
        }
        destructive
        confirmLabel="Delete"
        onConfirm={() => {
          if (confirmDeleteId != null) deleteRow(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
        onCancel={() => setConfirmDeleteId(null)}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        title={`Delete ${selected.size} ${
          selected.size === 1 ? singular.toLowerCase() : `${title.toLowerCase()}`
        }?`}
        description={
          <>
            This permanently removes the{" "}
            <span className={RV_CONFIRM_EMPHASIS}>{selected.size} selected</span> record
            {selected.size === 1 ? "" : "s"}. This can’t be undone.
          </>
        }
        destructive
        confirmLabel="Delete"
        onConfirm={bulkDelete}
        onCancel={() => setBulkDeleteOpen(false)}
      />

      <ConfirmDialog
        open={confirmRestoreId != null}
        title={`Restore ${singular.toLowerCase()}?`}
        description={
          <>
            This returns{" "}
            <span className={RV_CONFIRM_EMPHASIS}>
              {(() => {
                const t = rows.find((r) => r.id === confirmRestoreId);
                return t ? getPrimary(t).title || "this record" : "this record";
              })()}
            </span>{" "}
            to the live list.
          </>
        }
        confirmLabel="Restore"
        onConfirm={() => {
          if (confirmRestoreId != null) restore([confirmRestoreId]);
        }}
        onCancel={() => setConfirmRestoreId(null)}
      />

      <ConfirmDialog
        open={bulkRestoreOpen}
        title={`Restore ${selected.size} ${
          selected.size === 1 ? singular.toLowerCase() : title.toLowerCase()
        }?`}
        description={
          <>
            This returns the <span className={RV_CONFIRM_EMPHASIS}>{selected.size} selected</span>{" "}
            record
            {selected.size === 1 ? "" : "s"} to the live list.
          </>
        }
        confirmLabel="Restore"
        onConfirm={() => restore([...selected])}
        onCancel={() => setBulkRestoreOpen(false)}
      />
    </div>
  );
}
