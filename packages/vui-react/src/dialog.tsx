"use client";

import * as React from "react";
import {
  DIALOG_BODY,
  DIALOG_CLOSE,
  DIALOG_FOOTER,
  DIALOG_HEADER,
  DIALOG_OVERLAY,
  DIALOG_PANEL,
  DIALOG_TITLE,
} from "./class-variants";
import { cn } from "./utils";

/**
 * Sectioned modal dialog — the theme standard. It provides the shell (centered
 * panel, dimmed backdrop, entrance animation, Escape / backdrop-click to close)
 * and three bordered placeholders — `DialogHeader`, `DialogBody`, `DialogFooter`
 * — so a new dialog only needs to pass content into each. See `ConfirmDialog`
 * for a ready-made example built on top of these.
 *
 *   <Dialog open={open} onClose={close} label="Invite">
 *     <DialogHeader><DialogTitle>Invite teammate</DialogTitle></DialogHeader>
 *     <DialogBody>…form…</DialogBody>
 *     <DialogFooter><Button onClick={close}>Cancel</Button>…</DialogFooter>
 *   </Dialog>
 */
export function Dialog({
  open,
  onClose,
  label,
  className,
  children,
  /** Allow Escape / backdrop click to dismiss (default true). */
  dismissible = true,
  /**
   * The close control in the corner (default true).
   *
   * **Standard, not per caller.** Escape and a backdrop click already dismiss, and neither is
   * discoverable: a reader looking for the way out looks for an X. Every dialog in the product now
   * has one without asking, which is the only way it ends up on all of them. Turn it off for a
   * dialog that must be answered rather than dismissed, and pair that with `dismissible={false}`
   * or the X is the only thing missing rather than the only way out.
   */
  showClose = true,
}: {
  open: boolean;
  onClose: () => void;
  /** Accessible name for the dialog (aria-label). */
  label?: string;
  className?: string;
  children: React.ReactNode;
  dismissible?: boolean;
  showClose?: boolean;
}) {
  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open || !dismissible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, dismissible, onClose]);

  /**
   * Move focus in on open and put it back on close. `aria-modal` tells assistive tech the rest of
   * the page is inert; it does not move the caret, so without this a keyboard user opens the
   * dialog and is still standing on the button behind the backdrop.
   */
  React.useEffect(() => {
    if (!open) return;
    const returnTo = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    return () => returnTo?.focus?.();
  }, [open]);

  /**
   * Keep Tab inside the panel. Without it, Tab walks out of the dialog and into the controls
   * underneath the dim layer, which are visible, reachable and supposedly unavailable.
   */
  const onKeyDownTrap = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;
    /*
     * **Focus starts on the panel itself, which is neither the first child nor the last.**
     *
     * The effect above moves focus to `panelRef`, a `tabIndex={-1}` container, which is the right
     * thing to do. The wrap below only fired when the active element was already `first` or `last`,
     * so the very first `Shift+Tab` after opening fell through to the browser and walked backwards
     * **out of the dialog**, onto the trigger underneath the dim layer (`PD-178`).
     *
     * Found by `FT-855`, and worth recording as the shape of the finding: it failed on the reference
     * edition while Vue and Angular both passed, because their traps are Reka's and the CDK's. A case
     * that fails everywhere is a wrong case; one that fails only here is a defect here.
     */
    const active = document.activeElement;
    if (!(active instanceof HTMLElement) || ![...focusable].includes(active)) {
      e.preventDefault();
      (e.shiftKey ? last : first).focus();
      return;
    }
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  if (!open) return null;

  return (
    <div
      className={DIALOG_OVERLAY}
      // `mousedown`, not `click`. A click fires on the nearest common ancestor of press and
      // release, so selecting text in the panel and releasing past its edge fired on the overlay
      // and threw away everything the user had typed.
      onMouseDown={dismissible ? onClose : undefined}
    >
      <div
        ref={panelRef}
        role="dialog"
        // Names this element as the panel the static edition's emitter lifts, rather than leaving it
        // to be guessed at by role: guessing found the wrong node for the multi-select (`PD-165`).
        data-vui-panel=""
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={onKeyDownTrap}
        style={{ ["--vui-pop-origin" as string]: "center" }}
        className={cn(DIALOG_PANEL, className)}
      >
        {showClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className={DIALOG_CLOSE}
            /*
             * Inert here, load-bearing in the HTML edition.
             *
             * `vui.js` closes the nearest `<dialog>` when a `[data-vui-dismiss]` is clicked, and the
             * static edition wraps this panel in one. Nothing in React listens for it, so this costs
             * an attribute and saves the emitter guessing which button closes a panel from its
             * label (`PD-158`).
             */
            data-vui-dismiss=""
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="currentColor">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.04 16.54a1 1 0 1 0 1.42 1.42L12 13.41l4.54 4.55a1 1 0 0 0 1.42-1.42L13.41 12l4.55-4.54a1 1 0 0 0-1.42-1.42L12 10.59 7.46 6.04a1 1 0 0 0-1.42 1.42L10.59 12l-4.55 4.54Z"
              />
            </svg>
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

/** Bordered header section. */
export function DialogHeader({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn(DIALOG_HEADER, className)}>{children}</div>;
}

export function DialogTitle({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <h2 className={cn(DIALOG_TITLE, className)}>{children}</h2>;
}

/** Scrollable content section (capped so long content scrolls, not the page). */
export function DialogBody({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn(DIALOG_BODY, className)}>{children}</div>;
}

/** Bordered footer section — right-aligned actions by default. */
export function DialogFooter({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn(DIALOG_FOOTER, className)}>{children}</div>;
}
