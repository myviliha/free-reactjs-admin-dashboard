/**
 * The shape of an icon component, in one free module.
 *
 * **It lived in `record-field.tsx` until 2026-08-24, and that file is Pro.** Four free families
 * imported it from there (`wizard`, `page-chrome`, `profile-form`, `organization-profile`), and so
 * did the starter template's app shell, which meant the free package could not compile without a
 * paid file. Packing the first React download is what found it: with only free files vendored, one
 * type-only import took the shell out and cascaded to seventy-six pages.
 *
 * A one-line React type is not a Pro asset. `record-field.tsx` re-exports it, so nothing that imports
 * it from there breaks.
 *
 * It cannot live in a `-core` module: those are framework-free by construction and this names
 * `React.ComponentType`.
 */
import type * as React from "react";

import type { RecordField as CoreRecordField } from "./record-field-core";

export type IconType = React.ComponentType<{ className?: string }>;

/**
 * The React flavour of a field description.
 *
 * The core declares `RecordField<T, Node, Icon>` so each edition fills the last two in; React fills
 * them with `ReactNode` and `IconType`. That alias lived in `record-field.tsx` too, so a free family
 * wanting a *typed* field list had to import a paid file for it. `record-field.tsx` re-exports both,
 * so nothing that imports them from there changes.
 */
export type RecordField<T> = CoreRecordField<T, React.ReactNode, IconType>;
