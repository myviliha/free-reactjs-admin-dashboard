"use client";

import * as React from "react";
import { Button } from "./button";
import { FORM_ACTION_ICON, FORM_FOOTER, FORM_FOOTER_BAR } from "./class-variants";
import {
  type BehaviourConfig,
  type FormAction,
  type FormActionContext,
  type FormActionOutcome,
  type FormActionsConfig,
} from "./config";
import { ConfirmDialog } from "./confirm-dialog";
import {
  actionRequiresValid as coreActionRequiresValid,
  defaultFormActions as coreDefaultFormActions,
  resolveFormActions as coreResolveFormActions,
} from "./form-actions-core";
import { Check, Edit as Pencil, Close as X } from "./icons";

/**
 * The three decisions moved to `form-actions-core.ts` on 2026-08-20, once `config`'s contract was shared
 * and they could take their real types. **The public API is unchanged.**
 *
 * `saveOutcome` re-exports directly; the other two are three-line wrappers that **bind the icon generic
 * explicitly**. A review argued the wrappers were redundant because TypeScript infers `Icon` from the
 * `defaults` parameter. **Tried, and it does not here**: a direct re-export produces two errors in
 * `record-form.tsx`, where the argument arrives through a `FormActionsConfig` whose function member
 * makes the position contravariant. A wrapper rather than a cast, so the signature is checked rather
 * than asserted.
 */
export { saveOutcome } from "./form-actions-core";

/** The same binding `config.tsx` uses, declared locally rather than widening its public surface. */
type ReactIcon = React.ComponentType<{ className?: string }>;

export function resolveFormActions<T>(
  defaults: FormAction<T>[],
  config: FormActionsConfig<T> | undefined,
): FormAction<T>[] {
  return coreResolveFormActions<T, ReactIcon>(defaults, config);
}

export const actionRequiresValid = <T,>(action: FormAction<T>): boolean =>
  coreActionRequiresValid<T, ReactIcon>(action);

/**
 * The footer buttons the theme ships, with this edition's icons bound. **The list itself is
 * `@viliha/vui-core`'s**, so the ids, labels, variants and the which-action-commits rule are shared
 * rather than agreed by coincidence.
 */
export function defaultFormActions<T>(args: {
  readOnly: boolean;
  canEdit: boolean;
}): FormAction<T>[] {
  return coreDefaultFormActions<T, ReactIcon>({
    ...args,
    icons: { close: X, edit: Pencil, cancel: X, save: Check },
  });
}

/**
 * The form footer. Renders the resolved actions, keeps `align: "start"` ones on
 * the left, and owns the confirm dialog and the busy state while an async action
 * settles.
 *
 * `onAct` is wrapped by the caller (`run`), which is where validation and the
 * save path live — this component only decides what a click means.
 */
export function FormFooter<T>({
  actions,
  ctx,
  run,
  className,
}: {
  actions: FormAction<T>[];
  ctx: FormActionContext<T>;
  /** Perform one action: validate if it needs to, act, then close unless the
   *  action returned `false`. */
  run: (action: FormAction<T>) => void | Promise<void>;
  className?: string;
}) {
  const [confirming, setConfirming] = React.useState<FormAction<T> | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);

  const visible = actions.filter((a) => a.visible?.(ctx) ?? true);
  const start = visible.filter((a) => a.align === "start");
  const end = visible.filter((a) => a.align !== "start");

  const act = async (action: FormAction<T>) => {
    setBusy(action.id);
    try {
      await run(action);
    } finally {
      setBusy(null);
    }
  };

  const button = (action: FormAction<T>) => {
    const Icon = action.icon;
    return (
      <Button
        key={action.id}
        type="button"
        variant={action.variant}
        disabled={busy !== null || (action.disabled?.(ctx) ?? false)}
        onClick={() => (action.confirm ? setConfirming(action) : void act(action))}
      >
        {Icon && <Icon className={FORM_ACTION_ICON} />}
        {action.label}
      </Button>
    );
  };

  return (
    <>
      <div className={className ?? FORM_FOOTER_BAR}>
        {start.map(button)}
        <div className={FORM_FOOTER}>{end.map(button)}</div>
      </div>
      {confirming && (
        <ConfirmDialog
          open
          title={confirming.confirm!.title}
          description={confirming.confirm!.body}
          confirmLabel={confirming.confirm!.confirmLabel ?? confirming.label}
          destructive={confirming.variant === "destructive"}
          onConfirm={() => {
            const action = confirming;
            setConfirming(null);
            void act(action);
          }}
          onCancel={() => setConfirming(null)}
        />
      )}
    </>
  );
}
