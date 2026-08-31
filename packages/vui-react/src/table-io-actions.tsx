"use client";

import type { IoAction, IoActionsConfig } from "./config";
import type {
  IoAction as CoreIoAction,
  IoActionsConfig as CoreIoActionsConfig,
} from "./config-core";
import { Code, FileText, Reader, Table as SheetIcon } from "./icons";
import {
  defaultExportActions as coreExportActions,
  defaultImportActions as coreImportActions,
  resolveIoActions as coreResolveIoActions,
  type IoIcons,
} from "./table-io-actions-core";

export type { IoIcons } from "./table-io-actions-core";

/**
 * The Import and Export menus the theme ships, with this edition's icons bound.
 *
 * **The lists themselves are `@viliha/vui-core`'s**, so the ids, labels, accepts and handlers are shared
 * rather than agreed by coincidence. Read the docblock there for what they do and when to point them at
 * your API instead.
 */

type ReactIcon = IoAction<unknown>["icon"];

const ICONS: IoIcons<NonNullable<ReactIcon>> = {
  csv: FileText,
  excel: SheetIcon,
  json: Code,
  pdf: Reader,
};

/** Export: CSV, Excel, JSON, and PDF via the print dialog. */
export function defaultExportActions<T>(): IoAction<T>[] {
  return coreExportActions<T, NonNullable<ReactIcon>>(ICONS);
}

/** Import: read a CSV or JSON file in the browser and put the rows into the table. */
export function defaultImportActions<T extends { id: string | number }>(
  makeEmptyRow: (() => T) | undefined,
  nextId: () => string | number,
): IoAction<T>[] {
  return coreImportActions<T, NonNullable<ReactIcon>>(makeEmptyRow, nextId, ICONS);
}

export type { IoActionsConfig };

/**
 * Apply a host's config to a shipped list: an array replaces, a function edits. Bound to this
 * edition's icon type, so a host reading `action.icon` back out gets a component rather than `unknown`
 * which is the leaves-only mistake wave 5's review found.
 */
export function resolveIoActions<T>(
  defaults: IoAction<T>[],
  config: IoActionsConfig<T> | undefined,
): IoAction<T>[] {
  // The two casts cross one boundary: `./config`'s `IoAction<T>` is the core type with this edition's
  // icon already bound, so the shapes are identical and only the arity of the alias differs.
  return coreResolveIoActions<T, NonNullable<ReactIcon>>(
    defaults as CoreIoAction<T, NonNullable<ReactIcon>>[],
    config as CoreIoActionsConfig<T, NonNullable<ReactIcon>> | undefined,
  ) as IoAction<T>[];
}
