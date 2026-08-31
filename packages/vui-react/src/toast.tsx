"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  TOAST_ACTION,
  TOAST_BODY,
  TOAST_CARD,
  TOAST_DESCRIPTION,
  TOAST_DISMISS,
  TOAST_DISMISS_ICON,
  TOAST_ICON,
  TOAST_ICON_STATES,
  TOAST_REGION,
  TOAST_TITLE,
} from "./class-variants";
import {
  CheckCircle as CheckCircledIcon,
  Close as Cross2Icon,
  CloseCircle as CrossCircledIcon,
  Warning as ExclamationTriangleIcon,
} from "./icons";
import * as store from "./toast-core";
import { cn } from "./utils";

/**
 * The store moved to `toast-core.ts` on 2026-08-20, so both editions share one implementation, one
 * id-allocation rule and one duration default. **Not one queue**: the module is copied into
 * `@viliha/vui-core`, so each edition has its own instance, which is right because an app uses one
 * edition. **The public API is unchanged**: `toast`, `dismissToast` and the
 * types are re-exported from here, which is where every consumer already imports them.
 */
export type { ToastAction, ToastVariant } from "./toast-core";
export { dismissToast, TOAST_DURATION } from "./toast-core";

/** A description is a `ReactNode` in this edition; the store treats it as opaque. */
export type ToastOptions = store.ToastOptions<React.ReactNode>;
export type ToastFn = store.ToastFn<React.ReactNode>;
type ToastItem = store.ToastItem<React.ReactNode>;

/**
 * **The narrowing happens here, once.** The store accepts any description because it never looks at
 * one; this edition renders it, so `description` has to be a `ReactNode` or the portal throws on
 * something it cannot render. Binding the type rather than re-exporting it is what keeps
 * `toast.error("failed", { description: caughtError })` a compile error, which it was before the
 * store moved.
 */
export const toast: ToastFn = store.toast;

const VARIANT_ICON = {
  success: CheckCircledIcon,
  error: CrossCircledIcon,
  warning: ExclamationTriangleIcon,
  default: null,
} as const;

function ToastCard({ t }: { t: ToastItem }) {
  const variant = t.variant ?? "default";
  const Icon = VARIANT_ICON[variant];
  return (
    <div
      role="status"
      aria-live={variant === "error" ? "assertive" : "polite"}
      className={TOAST_CARD}
    >
      {Icon && <Icon className={cn(TOAST_ICON, TOAST_ICON_STATES[variant])} />}
      <div className={TOAST_BODY}>
        <p className={TOAST_TITLE}>{t.title}</p>
        {t.description !== undefined && t.description !== "" && (
          <p className={TOAST_DESCRIPTION}>{t.description}</p>
        )}
      </div>
      {t.action && (
        <button
          type="button"
          onClick={() => {
            t.action!.onClick();
            store.dismissToast(t.id);
          }}
          className={TOAST_ACTION}
        >
          {t.action.label}
        </button>
      )}
      <button
        type="button"
        onClick={() => store.dismissToast(t.id)}
        aria-label="Dismiss"
        className={TOAST_DISMISS}
      >
        <Cross2Icon className={TOAST_DISMISS_ICON} />
      </button>
    </div>
  );
}

/**
 * Mount once (e.g. in the root layout). Renders the toast stack (bottom-right)
 * in a portal above everything. Trigger toasts from anywhere with `toast(...)`.
 */
export function Toaster() {
  const list = React.useSyncExternalStore(
    store.subscribeToasts,
    () => store.getToasts<React.ReactNode>(),
    () => store.getToasts<React.ReactNode>(),
  );
  // Render nothing until mounted, so the FIRST client render matches the
  // server's `null` (a bare `typeof document` check doesn't — `document` exists
  // during hydration, so the portal would appear on the client only → mismatch).
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(
    <div role="region" aria-label="Notifications" className={TOAST_REGION}>
      {list.map((t) => (
        <ToastCard key={t.id} t={t} />
      ))}
    </div>,
    document.body,
  );
}
