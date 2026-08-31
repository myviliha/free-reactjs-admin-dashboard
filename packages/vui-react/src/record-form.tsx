"use client";

/**
 * The record form and its detail panel: create, edit and view one record, plus the
 * section/row layout resolution that decides where its fields sit.
 *
 * **Free tier**, by decision on 2026-08-17: Pro is `RecordView` alone, the table
 * that talks to your server. Forms stay free, which is what keeps `ProfileForm`
 * and `OrganizationProfile` working.
 *
 * Split out of `record-view.tsx`. See
 * `odin/design/04-packaging/01-packaging-pipeline/task.md`.
 */

import * as React from "react";
import { Breadcrumbs, type Crumb } from "./breadcrumbs";
import { Button } from "./button";
import {
  FORM_BACKDROP,
  FORM_BACKDROP_STATES,
  FORM_CHECKBOX,
  FORM_CHECKBOX_ROW,
  FORM_CHECKBOX_TEXT,
  FORM_CLOSE_BUTTON,
  FORM_CLOSE_ICON,
  FORM_CONTROL_INVALID,
  FORM_CONTROL_WIDTH,
  FORM_DOC_BODY,
  FORM_DOC_ICON,
  FORM_DOC_INTRO,
  FORM_DOC_ITEM,
  FORM_DOC_LIST,
  FORM_DOC_PANEL,
  FORM_DOC_TERM,
  FORM_DOC_TEXT,
  FORM_DOC_TITLE,
  FORM_ERROR_SR,
  FORM_ERROR_TEXT,
  FORM_FIELD_CONTROL,
  FORM_FIELD_DL,
  FORM_FIELD_ICON,
  FORM_FIELD_INFO,
  FORM_FIELD_INFO_STATES,
  FORM_FIELD_LABEL,
  FORM_FIELD_ROW,
  FORM_PAGE,
  FORM_PAGE_BAR,
  FORM_PAGE_CARD,
  FORM_PAGE_MAIN,
  FORM_PAGE_ROW,
  FORM_PAGE_SCROLL,
  FORM_PAGE_WIDTH,
  FORM_PANEL,
  FORM_PANEL_BODY,
  FORM_PANEL_HEADER,
  FORM_PANEL_ICON,
  FORM_PANEL_ICON_CHIP,
  FORM_PANEL_STATES,
  FORM_PANEL_TITLE,
  FORM_PANEL_TITLE_EMPTY,
  FORM_READ_VALUE,
  FORM_ROW_GAP,
  FORM_SECTION,
  FORM_SECTION_DESC,
  FORM_SECTION_TITLE,
  FORM_SLOT_ROW,
  FORM_TEXTAREA,
  FORM_TEXTAREA_STATES,
} from "./class-variants";
import { Combobox } from "./combobox";
import {
  type BehaviourConfig,
  type FormAction,
  type FormActionContext,
  type FormActionOutcome,
  type FormActionsConfig,
  type FormRow,
  type FormSection,
  type FormSlot,
  type SectionColumns,
  useResolved,
} from "./config";
import { ConfirmDialog } from "./confirm-dialog";
import {
  actionRequiresValid,
  defaultFormActions,
  FormFooter,
  resolveFormActions,
  saveOutcome,
} from "./form-actions";
import { Info, Close as X } from "./icons";
import { Input } from "./input";
import { MultiCombobox } from "./multi-combobox";
import {
  AsyncFieldValue,
  clearPersisted,
  DEFAULT_FIELD_ICON,
  FIELD_GRID,
  formatPhone,
  groupSlots,
  type IconType,
  isAsyncLabeled,
  MissingValue,
  MultiFieldValue,
  type RecordField,
  ROW_GRID,
  type RowId,
  RULE,
  resetKeyOf,
  resolveOptions,
  usePersistentState,
  validateField,
} from "./record-field";
import { RequiredMark } from "./required-mark";
import { Select } from "./select";
import { Tooltip } from "./tooltip";
import { cn } from "./utils";

/**
 * The layout resolution moved to `record-layout-core.ts` on 2026-08-20, so both editions put a field in
 * the same section. **The public API is unchanged**: all three are re-exported here, which is where the
 * tests and every consumer import them.
 */
export { orderedGroups, orderedSections, resolveFormRows } from "./record-layout-core";

import { orderedSections, resolveFormRows } from "./record-layout-core";

interface DetailPanelProps<T extends { id: RowId }> {
  fields: RecordField<T>[];
  /** Initial values; the panel edits a local buffered copy until Save. */
  row: T;
  singular: string;
  icon?: IconType;
  getPrimary: (row: T) => {
    title: string;
    initials: string;
    subtitle?: string;
  };
  /** Read-only (View) vs editable (Edit / Add). */
  readOnly?: boolean;
  /** Switch a read-only panel into edit mode. */
  onEdit?: () => void;
  /** Commit the buffered draft to the table. `then` carries the acting
   *  button's `after`, so "Save & New" can hand the form a blank record. */
  onSave: (row: T, then?: FormActionOutcome) => void;
  /** Discard the draft (and drop the row if it was never saved). */
  onCancel: () => void;
  /** "panel" = slide-over (default); "page" = full-page form. */
  layout?: "panel" | "page";
  /** Full-page form column count. Default 1. */
  columns?: 1 | 2;
  /** New (unsaved) record — drives the "Create new …" breadcrumb. */
  isNew?: boolean;
  /** Plural collection title (e.g. "Organizations") — the clickable parent crumb. */
  title?: string;
  /** Navigate to Home from the breadcrumb. */
  onHome?: () => void;
  /** Intro text for the documentation panel. */
  formDescription?: string;
  /** Persist the in-progress draft under this key (e.g. the route), so a
   *  half-filled form survives leaving and returning via the open-tabs strip. */
  persistKey?: string;
  /** Footer buttons. An array replaces Cancel + Save (or Close + Edit in view
   *  mode); a function receives those defaults so you can add, reorder or swap
   *  one without restating the rest. Falls back to `VuiProvider`'s
   *  `form.actions`, then to the shipped pair. */
  formActions?: FormActionsConfig<T>;
  /** Replace the whole footer. The array covers almost everything, so reach for
   *  this only when it genuinely can't express the layout you need. */
  renderFooter?: (ctx: FormActionContext<T>) => React.ReactNode;
  /** Your own content between the fields — a callout, a preview, a custom pair
   *  of controls. Each slot renders as a full-width row inside its section. */
  formSlots?: FormSlot<T>[];
  /** Behaviour, already resolved by the table so a per-table prop reaches the
   *  form as well as the rows. */
  behaviour?: BehaviourConfig;
  /** The form's rows: which sections sit side by side on each one. Up to three
   *  per row stay readable. */
  formRows?: FormRow[];
  /** @deprecated Since 1.59. Use `rows`. */
  sectionColumns?: SectionColumns;
  /** Section metadata (order, description) when you aren't declaring `rows`. */
  sections?: FormSection[];
  /** Page-form breadcrumb override (fully configurable). When set, these crumbs
   *  replace the default `Home › {title} › Create/Update {singular}` — so you can
   *  add parents ("Access") or rename the last crumb ("New Role"). Build each
   *  crumb as `{ label, onClick? }`; the last one is the current page. */
  crumbs?: Crumb[];
}

export function RecordDetailPanel<T extends { id: RowId }>({
  fields,
  row,
  singular,
  icon: TitleIcon,
  getPrimary,
  readOnly = false,
  onEdit,
  onSave,
  onCancel,
  layout = "panel",
  columns = 1,
  isNew = false,
  title,
  onHome,
  formDescription,
  persistKey,
  formActions,
  renderFooter,
  formSlots,
  behaviour: behaviourProp,
  formRows: formRowsProp,
  sectionColumns,
  sections,
  crumbs,
}: DetailPanelProps<T>) {
  const formConfig = useResolved("form", undefined) ?? {};
  // Two settings decide the whole form: how many columns the fields flow
  // across, and whether each label sits beside its control or above it.
  // Errors highlight the control's border and live on the field's info icon by
  // default: a line of red text under a control pushes the rest of the form
  // down while someone is still typing in it.
  const errorDisplay = formConfig.errorDisplay ?? "tooltip";
  const layoutRows = resolveFormRows(
    fields,
    formRowsProp,
    sections,
    // `formColumns={2}` (page forms, pre-1.59) meant two sections to a row;
    // keep honouring it rather than letting a deprecated prop go quietly dead.
    sectionColumns ??
      formConfig.sectionColumns ??
      (layout === "page" && columns === 2 ? 2 : undefined),
  );
  const behaviour = useResolved("behaviour", behaviourProp) ?? {};
  const draftKey = persistKey ? `${persistKey}::draft` : undefined;
  const [draft, setDraft] = usePersistentState<T>(draftKey, row);
  // Reset the buffered form only when a *genuinely different* record is opened.
  // Tracking the last id (not a "first run" flag) is StrictMode-safe: the dev
  // double-invoke sees the same id and won't wipe a restored / in-progress draft.
  const lastRowId = React.useRef(row.id);
  React.useEffect(() => {
    if (lastRowId.current === row.id) return;
    lastRowId.current = row.id;
    setDraft(row);
  }, [row, setDraft]);

  // Cascading options: after the draft changes, clear any choice field whose
  // value is no longer valid once its options recompute (e.g. changing Region
  // drops a now-invalid Country). Only function-options fields cascade; static
  // ones never invalidate. Settles in one pass — cleared values are "" and skip.
  React.useEffect(() => {
    const stale = fields.filter((f) => {
      if (typeof f.options !== "function") return false;
      const v = draft[f.key as keyof T];
      if (v == null || v === "") return false;
      return !f.options(draft).some((o) => o.value === String(v));
    });
    if (stale.length === 0) return;
    setDraft((d) => {
      let next = d;
      for (const f of stale) next = { ...next, [f.key]: "" };
      return next;
    });
  }, [draft, fields, setDraft]);

  const primary = getPrimary(draft);
  const HeaderIcon = TitleIcon ?? DEFAULT_FIELD_ICON;

  // Field validation: key → inline error message. Rules run on blur + before
  // Save; once a field has errored it re-checks live as you type (clears when
  // fixed). Save is blocked while the map is non-empty.
  const [errors, setErrors] = React.useState<Map<string, string>>(new Map());
  React.useEffect(() => {
    setErrors(new Map());
  }, [row.id]);

  // Fields whose rules run here (editable, non-custom-render).
  const editableFields = React.useMemo(
    () => fields.filter((f) => f.editable && !f.render),
    [fields],
  );

  /** Run one field's rules against `next` and set/clear its inline error. */
  const validateOne = React.useCallback((field: RecordField<T>, next: T): string | undefined => {
    const msg = validateField(field, String(next[field.key as keyof T] ?? ""), next);
    setErrors((prev) => {
      const cur = prev.get(field.key);
      if (cur === msg || (!cur && !msg)) return prev;
      const m = new Map(prev);
      if (msg) m.set(field.key, msg);
      else m.delete(field.key);
      return m;
    });
    return msg;
  }, []);

  const setField = (key: keyof T, value: string | boolean | string[]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    // Live-clear: re-check a field that's already showing an error as it changes.
    if (errors.has(key as string)) {
      const field = fields.find((f) => f.key === (key as string));
      if (field) validateOne(field, { ...draft, [key]: value } as T);
    }
  };

  const blurField = (field: RecordField<T>) => validateOne(field, draft);

  // Play the exit animation, then run the actual close/save when it ends.
  const [closing, setClosing] = React.useState(false);
  const pending = React.useRef<(() => void) | null>(null);
  const requestClose = (action: () => void) => {
    pending.current = action;
    setClosing(true);
  };
  // The page layout has no slide-out animation — run the action immediately.
  const dismiss = (action: () => void) => (layout === "page" ? action() : requestClose(action));

  /** Trim flagged fields, then validate everything. Returns the cleaned draft,
   *  or `null` when a field fails — the messages are already inline by then. */
  const validateDraft = (): T | null => {
    let next = draft;
    for (const f of editableFields) {
      if (!f.trim) continue;
      const v = String(next[f.key as keyof T] ?? "");
      if (v.trim() !== v) next = { ...next, [f.key]: v.trim() } as T;
    }
    const found = new Map<string, string>();
    for (const f of editableFields) {
      const msg = validateField(f, String(next[f.key as keyof T] ?? ""), next);
      if (msg) found.set(f.key, msg);
    }
    setDraft(next); // reflect trims whether or not the save proceeds
    if (found.size > 0) {
      setErrors(found); // block Save; show every message inline
      return null;
    }
    setErrors(new Map());
    return next;
  };

  // Cancel/close discards the draft too, so it doesn't reappear next visit.
  const [confirmDiscard, setConfirmDiscard] = React.useState(false);
  const discard = () => {
    clearPersisted(draftKey);
    dismiss(onCancel);
  };
  const handleCancel = () => {
    // Only ask when there is something to lose, and only when the app opted in.
    if (
      (behaviour.confirmDiscardWhenDirty ?? false) &&
      !readOnly &&
      JSON.stringify(draft) !== JSON.stringify(row)
    ) {
      setConfirmDiscard(true);
      return;
    }
    discard();
  };

  // Grouped field sections — shared by the slide-over and full-page layouts.
  const slotRow = (slot: FormSlot<T>) => (
    // A slot takes both columns: it isn't a label │ control pair.
    <div key={`slot:${slot.id}`} className={cn(FORM_SLOT_ROW, RULE)}>
      {slot.render(actionCtx)}
    </div>
  );

  /** The message for a field, while editing. */
  const fieldError = (f: RecordField<T>) => (readOnly ? undefined : errors.get(f.key));

  const formBody = layoutRows.map((row, rowIndex) => (
    <div
      key={`row-${rowIndex}`}
      className={cn(
        ROW_GRID[Math.min(row.sections.length, 3) as 1 | 2 | 3],
        rowIndex > 0 && FORM_ROW_GAP,
      )}
    >
      {row.sections.map((section) => {
        const group = section.group;
        const groupFields = fields.filter((f) => (f.group ?? "General") === group);
        if (groupFields.length === 0) return null;
        const slots = groupSlots(fields, formSlots, group);
        return (
          <section key={group} className={FORM_SECTION}>
            <h3 className={FORM_SECTION_TITLE}>{group}</h3>
            {section.description && <p className={FORM_SECTION_DESC}>{section.description}</p>}
            {/* Two columns, one field per row: `[i] Label *` then the control.
              Hairlines between them so the grid reads at a glance. */}
            <dl className={cn(FORM_FIELD_DL, FIELD_GRID)}>
              {groupFields.flatMap((f) => [
                // Label, icon, required mark and control share one baseline —
                // vertically centered. ponytail: a wrapped textarea grows down and
                // the label centers against it; acceptable for the single-line norm.
                // `items-stretch` so the column rule runs the full height of the
                // row; the label centres itself inside its own cell.
                <div key={f.key} className={cn(FORM_FIELD_ROW, RULE)}>
                  <dt className={cn(FORM_FIELD_LABEL, RULE)}>
                    {/* One icon, two jobs: the field's help text, and its
                      error when it has one. Help lives on the label so it's
                      there in a slide-over, where the Info panel isn't. */}
                    {(f.description || fieldError(f)) && (
                      <Tooltip content={fieldError(f) ?? f.description ?? ""}>
                        <Info
                          aria-label={
                            fieldError(f) ? `${f.label}: ${fieldError(f)}` : `About ${f.label}`
                          }
                          className={cn(
                            FORM_FIELD_INFO,
                            FORM_FIELD_INFO_STATES[fieldError(f) ? "error" : "help"],
                          )}
                        />
                      </Tooltip>
                    )}
                    {f.icon && <f.icon className={FORM_FIELD_ICON} />}
                    {f.label}
                    {f.required && <RequiredMark />}
                  </dt>
                  <dd className={FORM_FIELD_CONTROL}>
                    {/* `render` is the read-only view; the edit control (a custom
                      `renderInput` or a built-in `input:"checkbox"`) wins while
                      editing, so a field can show a badge/preview in view and
                      still be edited (e.g. a HQ badge in the table + a checkbox in
                      the form). */}
                    {f.render &&
                    !(!readOnly && f.editable && (f.renderInput || f.input === "checkbox")) ? (
                      <div>{f.render(draft)}</div>
                    ) : !readOnly && f.editable ? (
                      f.renderInput ? (
                        // Consumer-supplied control (checkbox, radio, custom widget).
                        f.renderInput({
                          value: String(draft[f.key as keyof T] ?? ""),
                          onChange: (v) => setField(f.key as keyof T, v),
                          field: f,
                          invalid: errors.has(f.key),
                        })
                      ) : f.options || f.loadOptions ? (
                        f.multiple ? (
                          <MultiCombobox
                            value={
                              Array.isArray(draft[f.key as keyof T])
                                ? (draft[f.key as keyof T] as string[])
                                : []
                            }
                            onValueChange={(v) => setField(f.key as keyof T, v)}
                            {...(f.loadOptions
                              ? {
                                  source: {
                                    loadOptions: ({ search, signal }) =>
                                      f.loadOptions!({
                                        search,
                                        signal,
                                        values: draft,
                                      }),
                                    resolveOptions: f.resolveOptions,
                                    resolveOption: f.resolveOption,
                                  },
                                  resetKey: resetKeyOf(f, draft),
                                }
                              : { options: resolveOptions(f.options, draft) })}
                            ariaLabel={f.label}
                            placeholder={`Select ${f.label.toLowerCase()}…`}
                            invalid={errors.has(f.key)}
                            className={FORM_CONTROL_WIDTH}
                          />
                        ) : f.input === "combobox" ? (
                          <Combobox
                            value={String(draft[f.key as keyof T] ?? "")}
                            onValueChange={(v) => setField(f.key as keyof T, v)}
                            {...(f.loadOptions
                              ? {
                                  source: {
                                    loadOptions: ({ search, signal }) =>
                                      f.loadOptions!({
                                        search,
                                        signal,
                                        values: draft,
                                      }),
                                    resolveOption: f.resolveOption,
                                  },
                                  resetKey: resetKeyOf(f, draft),
                                }
                              : { options: resolveOptions(f.options, draft) })}
                            ariaLabel={f.label}
                            placeholder={`Select ${f.label.toLowerCase()}…`}
                            className={FORM_CONTROL_WIDTH}
                          />
                        ) : (
                          <Select
                            value={String(draft[f.key as keyof T] ?? "")}
                            onValueChange={(v) => setField(f.key as keyof T, v)}
                            {...(f.loadOptions
                              ? {
                                  source: {
                                    loadOptions: ({ search, signal }) =>
                                      f.loadOptions!({
                                        search,
                                        signal,
                                        values: draft,
                                      }),
                                    resolveOption: f.resolveOption,
                                  },
                                  resetKey: resetKeyOf(f, draft),
                                }
                              : { options: resolveOptions(f.options, draft) })}
                            ariaLabel={f.label}
                            placeholder={`Select ${f.label.toLowerCase()}…`}
                            className={FORM_CONTROL_WIDTH}
                          />
                        )
                      ) : f.input === "checkbox" ? (
                        <label className={FORM_CHECKBOX_ROW}>
                          <input
                            type="checkbox"
                            checked={Boolean(draft[f.key as keyof T])}
                            onChange={(e) => setField(f.key as keyof T, e.target.checked)}
                            aria-label={f.label}
                            className={FORM_CHECKBOX}
                          />
                          <span className={FORM_CHECKBOX_TEXT}>
                            {draft[f.key as keyof T] ? "Yes" : "No"}
                          </span>
                        </label>
                      ) : f.input === "number" || f.input === "date" ? (
                        <Input
                          type={f.input}
                          value={String(draft[f.key as keyof T] ?? "")}
                          onChange={(e) => setField(f.key as keyof T, e.target.value)}
                          onBlur={() => blurField(f)}
                          aria-label={f.label}
                          aria-invalid={errors.has(f.key) || undefined}
                          className={cn(
                            FORM_CONTROL_WIDTH,
                            errors.has(f.key) && FORM_CONTROL_INVALID,
                          )}
                        />
                      ) : (
                        <textarea
                          value={String(draft[f.key as keyof T] ?? "")}
                          onChange={(e) =>
                            setField(
                              f.key as keyof T,
                              f.format === "phone" ? formatPhone(e.target.value) : e.target.value,
                            )
                          }
                          onBlur={() => blurField(f)}
                          aria-label={f.label}
                          aria-invalid={errors.has(f.key) || undefined}
                          placeholder={`Add ${f.label.toLowerCase()}`}
                          rows={1}
                          // field-sizing grows the box to fit long/wrapped text
                          className={cn(
                            FORM_TEXTAREA,
                            FORM_TEXTAREA_STATES[errors.has(f.key) ? "invalid" : "valid"],
                          )}
                        />
                      )
                    ) : (
                      <span className={FORM_READ_VALUE}>
                        {(() => {
                          // The host already has the label in the row: no resolve.
                          if (f.displayValue) return f.displayValue(draft) || <MissingValue />;
                          if (f.input === "checkbox") return draft[f.key as keyof T] ? "Yes" : "No";
                          if (f.multiple)
                            return (
                              <MultiFieldValue
                                field={f}
                                values={
                                  Array.isArray(draft[f.key as keyof T])
                                    ? (draft[f.key as keyof T] as string[])
                                    : []
                                }
                                row={draft}
                              />
                            );
                          const raw = String(draft[f.key as keyof T] ?? "");
                          if (!raw) return <MissingValue />;
                          // Async id → resolved label; static options → their label;
                          // otherwise the raw value.
                          if (isAsyncLabeled(f))
                            return <AsyncFieldValue field={f} value={raw} values={draft} />;
                          if (Array.isArray(f.options))
                            return f.options.find((o) => o.value === raw)?.label ?? raw;
                          return raw;
                        })()}
                      </span>
                    )}
                    {fieldError(f) &&
                      // Default: the border is already red and the message is
                      // on the icon, so nothing here moves the layout. A colour
                      // and a hover aren't available to everyone, so the text
                      // still reaches assistive tech.
                      (errorDisplay === "text" ? (
                        <p className={FORM_ERROR_TEXT}>{fieldError(f)}</p>
                      ) : (
                        <span role="alert" className={FORM_ERROR_SR}>
                          {fieldError(f)}
                        </span>
                      ))}
                  </dd>
                </div>,
                // Anything the host put after this field.
                ...(slots.get(f.key) ?? []).map(slotRow),
              ])}
              {/* Slots with no `after` close out the section. */}
              {(slots.get("") ?? []).map(slotRow)}
            </dl>
          </section>
        );
      })}
    </div>
  ));

  // Footer actions. The shipped pair (Cancel + Save, or Close + Edit while
  // viewing) are ordinary actions, so a host's `formActions` starts from them.
  const actionCtx: FormActionContext<T> = {
    mode: readOnly ? "view" : isNew ? "create" : "edit",
    row: draft,
    dirty: JSON.stringify(draft) !== JSON.stringify(row),
    valid: errors.size === 0,
    errors,
    close: handleCancel,
    reset: () => {
      setDraft(row);
      setErrors(new Map());
    },
    edit: onEdit,
  };
  const actions = resolveFormActions<T>(
    defaultFormActions<T>({ readOnly, canEdit: Boolean(onEdit) }),
    formActions ?? (formConfig.actions as FormActionsConfig<T> | undefined),
  );
  /**
   * Run one action. The rule, in one sentence: an action closes the form when it
   * finishes unless it returns `false`, and an action that validates (primary,
   * by default) commits the draft through `onSave` on the way out.
   *
   * That is why the shipped Save has an empty `onAct` — committing is this
   * function's job, so any action a host marks `requiresValid` saves the same
   * way, with the same validation and the same discarded draft.
   */
  const runAction = async (action: FormAction<T>) => {
    const validated = actionRequiresValid(action) ? validateDraft() : draft;
    if (!validated) return; // invalid: messages are inline, form stays open
    const keepOpen = await action.onAct({ ...actionCtx, row: validated });
    if (keepOpen === false) return; // the action handled its own outcome
    if (actionRequiresValid(action)) {
      clearPersisted(draftKey); // work committed — drop the saved draft
      const outcome = saveOutcome(action.after, behaviour);
      // Only a closing save plays the slide-out; staying open would animate the
      // panel away and straight back in.
      if (outcome === "close") dismiss(() => onSave(validated, outcome));
      else onSave(validated, outcome);
    } else {
      handleCancel(); // closes without committing (Delete, Archive, …)
    }
  };
  const formFooter = (
    <>
      {renderFooter ? (
        renderFooter(actionCtx)
      ) : (
        <FormFooter actions={actions} ctx={actionCtx} run={runAction} />
      )}
      <ConfirmDialog
        open={confirmDiscard}
        title={`Discard your changes to this ${singular.toLowerCase()}?`}
        description="What you have typed will be lost."
        confirmLabel="Discard"
        destructive
        onConfirm={() => {
          setConfirmDiscard(false);
          discard();
        }}
        onCancel={() => setConfirmDiscard(false)}
      />
    </>
  );

  // Full-page form: breadcrumb header → scrollable single column → fixed actions.
  if (layout === "page") {
    const crumb = readOnly
      ? primary.title || `View ${singular.toLowerCase()}`
      : isNew
        ? `Create new ${singular.toLowerCase()}`
        : `Update ${singular.toLowerCase()}`;
    // AWS-style documentation column: an intro plus per-field help text.
    const documentedFields = fields.filter((f) => f.description);
    const docPanel =
      formDescription || documentedFields.length > 0 ? (
        <aside aria-label={`${title ?? singular} help`} className={FORM_DOC_PANEL}>
          <div className={FORM_DOC_BODY}>
            <div className={FORM_DOC_INTRO}>
              <h2 className={FORM_DOC_TITLE}>
                <Info className={FORM_DOC_ICON} />
                About {title ?? singular}
              </h2>
              {formDescription && <p className={FORM_DOC_TEXT}>{formDescription}</p>}
            </div>
            {documentedFields.length > 0 && (
              <dl className={FORM_DOC_LIST}>
                {documentedFields.map((f) => (
                  <div key={f.key} className={FORM_DOC_ITEM}>
                    <dt className={FORM_DOC_TERM}>{f.label}</dt>
                    <dd className={FORM_DOC_TEXT}>{f.description}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </aside>
      ) : null;
    return (
      <div className={FORM_PAGE}>
        {/* Breadcrumb — the shared Breadcrumbs component (consistent app-wide). */}
        <div className={FORM_PAGE_BAR}>
          <Breadcrumbs
            onBack={onCancel}
            crumbs={
              crumbs ??
              ([
                ...(onHome ? [{ label: "Home", onClick: onHome }] : []),
                { label: title ?? singular, onClick: onCancel },
                { label: crumb },
              ] as Crumb[])
            }
          />
        </div>
        {/* Content — form card (left) + optional documentation panel (right). */}
        <div className={FORM_PAGE_MAIN}>
          <div className={FORM_PAGE_ROW}>
            {/* Padded, bordered card — matches the datatable content container. */}
            <div className={FORM_PAGE_CARD}>
              <div className={FORM_PAGE_SCROLL}>
                {/* The section grid. `sectionColumns` is the setting; the
                    older `columns` (page forms only) still widens a
                    single-column form to two, so nothing existing moves. */}
                {/* Rows lay themselves out; this only bounds the width. */}
                <div className={FORM_PAGE_WIDTH}>{formBody}</div>
              </div>
              {formFooter}
            </div>
            {docPanel}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Dimmed backdrop — click to close. */}
      <div
        className={cn(FORM_BACKDROP, FORM_BACKDROP_STATES[closing ? "out" : "in"])}
        onClick={handleCancel}
        aria-hidden="true"
      />
      <aside
        aria-label={`${singular} form`}
        className={cn(
          // Auto-size to content: wide enough for the longest label + control on
          // one line, clamped so it never gets too narrow or wider than the viewport.
          FORM_PANEL,
          FORM_PANEL_STATES[closing ? "out" : "in"],
        )}
        onAnimationEnd={(e) => {
          if (e.target === e.currentTarget && closing && pending.current) {
            const run = pending.current;
            pending.current = null;
            run();
          }
        }}
      >
        {/* Header — icon + title (placeholder when new); matches the page header. */}
        <div className={FORM_PANEL_HEADER}>
          <span className={FORM_PANEL_ICON_CHIP}>
            <HeaderIcon className={FORM_PANEL_ICON} />
          </span>
          <span className={cn(FORM_PANEL_TITLE, !primary.title && FORM_PANEL_TITLE_EMPTY)}>
            {primary.title || `New ${singular}`}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            aria-label="Close"
            className={FORM_CLOSE_BUTTON}
          >
            <X className={FORM_CLOSE_ICON} />
          </Button>
        </div>

        {/* Body — the section grid, one bordered card per field group. */}
        <div className={FORM_PANEL_BODY}>{formBody}</div>

        {formFooter}
      </aside>
    </>
  );
}

/**
 * Standalone full-page record form for a dedicated route (e.g. `/…/new`).
 * Wraps the page layout of the detail panel so the same form/breadcrumb/doc
 * chrome is reused outside the table.
 */
export function RecordForm<T extends { id: RowId }>(props: Omit<DetailPanelProps<T>, "layout">) {
  return <RecordDetailPanel layout="page" {...props} />;
}

/**
 * Standalone **slide-over** record form — the standard Add / Edit / View panel
 * used outside a table (e.g. on a Kanban board). Same overlay, `fields`-driven
 * layout, blue Save, header/body/footer separators, and auto-width as the
 * add/edit panel `RecordView` opens. Feed it a `fields` array; never hand-roll
 * an add/edit form.
 */
export function RecordFormPanel<T extends { id: RowId }>(
  props: Omit<DetailPanelProps<T>, "layout">,
) {
  return <RecordDetailPanel layout="panel" {...props} />;
}
