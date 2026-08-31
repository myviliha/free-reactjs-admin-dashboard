"use client";

import * as React from "react";

import type { Crumb } from "./breadcrumbs";
import {
  PROFILE_SKELETON_BAR,
  PROFILE_SKELETON_BODY,
  PROFILE_SKELETON_CARD,
  PROFILE_SKELETON_ROOT,
} from "./class-variants";
import type { IconType, RecordField } from "./icon-type";
import { RecordForm } from "./record-form";

type RowId = string | number;

export interface ProfileFormProps<T extends { id: RowId }> {
  /** The record to show. `null` renders the loading skeleton. */
  data: T | null;
  /** Fields, grouped into sections with each field's `group` (any title). */
  fields: RecordField<T>[];
  /** Persist the edited record. Called on Save; the form returns to view mode. */
  onSave: (next: T) => void;
  /** Header/initials for the record. */
  getPrimary: (row: T) => {
    title: string;
    initials: string;
    subtitle?: string;
  };
  /** Collection/section title (breadcrumb parent + form heading). */
  title?: string;
  /** Singular noun used in the default breadcrumb ("Update {singular}"). */
  singular?: string;
  icon?: IconType;
  /** Intro text for the "About" info panel beside the form. */
  formDescription?: string;
  /** Section layout: 1 or 2 columns. Default 2. */
  columns?: 1 | 2;
  /** Pressed on Close/back in view mode (e.g. navigate away). */
  onExit?: () => void;
  /** Navigate Home from the breadcrumb. */
  onHome?: () => void;
  /** Breadcrumb override (defaults to Home › {title} › {record}). */
  crumbs?: Crumb[];
  /** Force the loading skeleton. Defaults to `data == null`. */
  loading?: boolean;
}

/**
 * A pre-designed profile page: a single record shown read-only, with an **Edit**
 * button that switches to edit mode with the standard **Cancel + Save** footer.
 * Feed it `fields` (grouped into sections via each field's `group`) and `data`;
 * it owns the view/edit toggle, reverts on Cancel, and shows a skeleton while
 * loading. Built on `RecordForm`, so it inherits the blue Save, section
 * separators, required marks and the info panel.
 *
 * ```tsx
 * import { ProfileForm } from "@viliha/vui-react/profile-form";
 * import { organizationProfileFields, getOrgPrimary } from "@viliha/vui-react/organization-profile";
 *
 * <ProfileForm data={org} fields={organizationProfileFields}
 *   getPrimary={getOrgPrimary} onSave={save} title="Organization" />
 * ```
 */
export function ProfileForm<T extends { id: RowId }>({
  data,
  fields,
  onSave,
  getPrimary,
  title = "Profile",
  singular = "profile",
  icon,
  formDescription,
  columns = 2,
  onExit,
  onHome,
  crumbs,
  loading,
}: ProfileFormProps<T>) {
  const [mode, setMode] = React.useState<"view" | "edit">("view");
  // Bumped on Save/Cancel to remount RecordForm so its buffered draft re-seeds
  // from the latest record — this is what makes Cancel revert.
  const [formKey, setFormKey] = React.useState(0);

  if ((loading ?? data == null) || !data) {
    return (
      <div className={PROFILE_SKELETON_ROOT}>
        <div className={PROFILE_SKELETON_BAR} />
        <div className={PROFILE_SKELETON_BODY}>
          <div className={PROFILE_SKELETON_CARD} />
        </div>
      </div>
    );
  }

  return (
    <RecordForm
      key={formKey}
      columns={columns}
      readOnly={mode === "view"}
      onEdit={() => setMode("edit")}
      fields={fields}
      row={data}
      title={title}
      singular={singular}
      icon={icon}
      getPrimary={getPrimary}
      formDescription={formDescription}
      onHome={onHome}
      crumbs={crumbs}
      onSave={(saved) => {
        onSave(saved);
        setMode("view");
        setFormKey((k) => k + 1);
      }}
      onCancel={() => {
        // Edit → Cancel reverts (remount); View → Close exits.
        if (mode === "edit") {
          setMode("view");
          setFormKey((k) => k + 1);
        } else {
          onExit?.();
        }
      }}
    />
  );
}
