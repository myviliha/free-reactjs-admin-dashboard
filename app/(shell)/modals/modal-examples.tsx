"use client";

import { cn } from "@viliha/vui-core";
import { Button } from "@viliha/vui-react/button";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@viliha/vui-react/dialog";
import { CheckCircle, Info, Warning } from "@viliha/vui-react/icons";
import { Input } from "@viliha/vui-react/input";
import { Label } from "@viliha/vui-react/label";
import * as React from "react";

import { Demo } from "../../page-shell";

/**
 * The five modal examples, on our `Dialog`.
 *
 * **This page is why the route exists at all.** The reference ships `/modals` and never links it from
 * its own sidebar, so its five best overlay examples are unreachable unless you type the address.
 * Ours is in the navigation, which is the whole of the fix.
 *
 * Every one of these is the library's `Dialog` rather than markup wearing its classes. That matters
 * more here than anywhere else on the site: focus trapping, the Escape handler, the scroll lock, the
 * backdrop blur and the corner close control are the parts of an overlay that are tedious to get
 * right and invisible when they are, and a demo that hand-rolls them is demonstrating a div.
 */

/** Every example needs the same two lines of state, and four of them needed four copies of it. */
function useModal(initial = false) {
  const [open, setOpen] = React.useState(initial);
  return { open, show: () => setOpen(true), hide: () => setOpen(false) };
}

/**
 * The one prop the static edition needs, and the reason it exists.
 *
 * **A closed `Dialog` renders `null`**, so the HTML edition's static export contained four buttons
 * and no panels: 114 controls across the demo announced a popup with nothing to open (`PD-158`).
 * The panels have to be in the export before the emitter can move them, and the cheapest honest way
 * to get them there is to render the same components once more with the modal already open, on a
 * build-only route that no reader visits.
 *
 * `initialOpen` is **only** set by `app/_overlays/page.tsx`. Nothing on `/modals` passes it, so the
 * page a reader sees is unchanged, and this is a prop rather than a second copy of the panel markup
 * because a panel written twice is two panels.
 */
export interface ModalExampleProps {
  initialOpen?: boolean;
}

/**
 * The id a trigger names and its panel answers to.
 *
 * The emitter matches `data-vui-open` on a button to `data-vui-overlay` on a panel and fails the
 * build when one has no other, so these strings are checked rather than trusted.
 */
export const MODAL_IDS = {
  default: "modal-default",
  centered: "modal-centered",
  form: "modal-form",
  fullscreen: "modal-fullscreen",
} as const;

/** The alert dialogs are one panel per tone, because a static page cannot swap one panel's content. */
export const alertModalId = (key: string) => `modal-alert-${key}`;

const LEAD =
  "Renewal is scheduled for 1 September. The invoice is raised seven days before the charge, so a change made today still applies to the next cycle.";

export function DefaultModal({ initialOpen }: ModalExampleProps = {}) {
  const modal = useModal(initialOpen);
  return (
    <Demo title="Default Modal">
      <Button variant="primary" size="lg" onClick={modal.show} data-vui-open={MODAL_IDS.default}>
        Open Modal
      </Button>
      <Dialog open={modal.open} onClose={modal.hide} label="Renewal" className="max-w-[600px]">
        {/* **`DialogHeader` and not a bare `DialogTitle`.** The title string carries type and no
            padding; the header is the band that supplies the inset, the rule under it and the corner
            the close control sits in. Using the title alone put the heading flush against the panel
            edge, which is what made this dialog look unlike every other one in the product. */}
        <DialogHeader>
          <DialogTitle>Confirm Renewal</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-5 text-sm leading-6 text-muted-foreground">
          <p>{LEAD}</p>
          <p>
            Nothing is charged until the renewal date, and the plan can be changed or cancelled at
            any point before it.
          </p>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" size="lg" onClick={modal.hide} data-vui-dismiss="">
            Close
          </Button>
          <Button variant="primary" size="lg" onClick={modal.hide} data-vui-dismiss="">
            Save Changes
          </Button>
        </DialogFooter>
      </Dialog>
    </Demo>
  );
}

export function CenteredModal({ initialOpen }: ModalExampleProps = {}) {
  const modal = useModal(initialOpen);
  return (
    <Demo title="Vertically Centered Modal">
      <Button variant="primary" size="lg" onClick={modal.show} data-vui-open={MODAL_IDS.centered}>
        Open Modal
      </Button>
      {/* **The close control stays, and the reference dropping it here is the thing not to copy.**
          Four dialogs on one page, three with an X and one without, teaches a reader that the corner
          is unreliable: they look for it, do not find it, and stop trusting it on the three where it
          is. `Dialog`'s own doc reserves `showClose={false}` for a dialog that must be *answered*,
          paired with `dismissible={false}`, and this one is dismissible. */}
      <Dialog open={modal.open} onClose={modal.hide} label="All done" className="max-w-[507px]">
        <DialogHeader>
          <DialogTitle>Subscription Updated</DialogTitle>
        </DialogHeader>
        <DialogBody className="py-6 text-center">
          <span className="mx-auto mb-5 grid size-16 place-items-center rounded-full bg-success/10">
            <CheckCircle className="size-8 text-success" aria-hidden="true" />
          </span>
          <p className="text-sm leading-6 text-muted-foreground">
            The plan is updated and the receipt is on its way to the billing address on file.
          </p>
        </DialogBody>
        <DialogFooter className="justify-center">
          <Button variant="outline" size="lg" onClick={modal.hide} data-vui-dismiss="">
            Close
          </Button>
          <Button variant="primary" size="lg" onClick={modal.hide} data-vui-dismiss="">
            View Receipt
          </Button>
        </DialogFooter>
      </Dialog>
    </Demo>
  );
}

const FIELDS = [
  { id: "m-first", label: "First Name", placeholder: "Ada", type: "text" },
  { id: "m-last", label: "Last Name", placeholder: "Okafor", type: "text" },
  { id: "m-email", label: "Email Address", placeholder: "ada@example.com", type: "email" },
  { id: "m-phone", label: "Phone", placeholder: "+65 8000 0000", type: "tel" },
] as const;

export function FormModal({ initialOpen }: ModalExampleProps = {}) {
  const modal = useModal(initialOpen);
  return (
    <Demo title="Form In Modal">
      <Button variant="primary" size="lg" onClick={modal.show} data-vui-open={MODAL_IDS.form}>
        Open Modal
      </Button>
      <Dialog
        open={modal.open}
        onClose={modal.hide}
        label="Personal information"
        className="max-w-[584px]"
      >
        {/* A real `form` with a real submit, so Enter in any field does what a reader expects. Their
            version is a `form` with no `onSubmit` and a button that is not a submit, which means the
            keyboard does nothing. */}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            modal.hide();
          }}
        >
          <DialogHeader>
            <DialogTitle>Personal Information</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
              {FIELDS.map((field) => (
                <div key={field.id}>
                  <Label htmlFor={field.id} className="mb-1.5 block text-sm font-medium">
                    {field.label}
                  </Label>
                  <Input id={field.id} type={field.type} placeholder={field.placeholder} />
                </div>
              ))}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" size="lg" onClick={modal.hide} data-vui-dismiss="">
              Close
            </Button>
            <Button type="submit" variant="primary" size="lg">
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </Demo>
  );
}

export function FullScreenModal({ initialOpen }: ModalExampleProps = {}) {
  const modal = useModal(initialOpen);
  return (
    <Demo title="Full Screen Modal">
      <Button variant="primary" size="lg" onClick={modal.show} data-vui-open={MODAL_IDS.fullscreen}>
        Open Modal
      </Button>
      {/* Full bleed, so the panel's own max-width and radius are overridden rather than fought. */}
      <Dialog
        open={modal.open}
        onClose={modal.hide}
        label="Full screen"
        className="h-dvh w-screen max-w-none rounded-none"
      >
        <DialogHeader>
          <DialogTitle>Full Screen Modal</DialogTitle>
        </DialogHeader>
        <DialogBody className="grid h-full place-items-center text-center">
          <div>
            <p className="mx-auto max-w-md text-sm leading-6 text-muted-foreground">
              For the task that deserves the whole window: an import wizard, a diff, a document. The
              close control is still in the corner and Escape still works.
            </p>
            <Button
              variant="primary"
              size="lg"
              className="mt-8"
              onClick={modal.hide}
              data-vui-dismiss=""
            >
              Close
            </Button>
          </div>
        </DialogBody>
      </Dialog>
    </Demo>
  );
}

/**
 * The four state dialogs.
 *
 * Their version paints a decorative starburst behind each icon and its buttons are raw
 * `bg-success-500` markup. Ours is a tinted disc in the state's own token and real `Button`s, which
 * is both fewer moving parts and the only version that survives a retheme.
 */
const ALERTS = [
  {
    key: "success",
    label: "Success Alert",
    heading: "Payment Received",
    body: "Invoice INV-2043 has been settled in full. A receipt is on its way.",
    icon: CheckCircle,
    tint: "bg-success/10",
    ink: "text-success",
    button: "bg-success text-success-foreground hover:bg-success/90",
  },
  {
    key: "info",
    label: "Info Alert",
    heading: "Export Ready",
    body: "Your 12,480 row export finished and is available for the next seven days.",
    icon: Info,
    tint: "bg-info/10",
    ink: "text-info",
    button: "bg-info text-info-foreground hover:bg-info/90",
  },
  {
    key: "warning",
    label: "Warning Alert",
    heading: "Card Expiring Soon",
    body: "The card ending 4242 expires next month. Update it to avoid a failed renewal.",
    icon: Warning,
    tint: "bg-warning/10",
    ink: "text-warning",
    button: "bg-warning text-warning-foreground hover:bg-warning/90",
  },
  {
    key: "error",
    label: "Danger Alert",
    heading: "Delete This Workspace",
    body: "Every project, member and invoice in it goes too. This cannot be undone.",
    icon: Warning,
    tint: "bg-destructive/10",
    ink: "text-destructive",
    button: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  },
] as const;

export function AlertModals({ initialKey }: { initialKey?: string } = {}) {
  const [shown, setShown] = React.useState<string | null>(initialKey ?? null);
  const active = ALERTS.find((alert) => alert.key === shown);

  return (
    <Demo title="Modal Based Alerts">
      <div className="flex flex-wrap items-center gap-3">
        {ALERTS.map((alert) => (
          <Button
            key={alert.key}
            size="lg"
            variant="primary"
            className={cn("border-transparent shadow-none", alert.button)}
            onClick={() => setShown(alert.key)}
            // One panel per tone in the static edition: a page with no JavaScript cannot swap one
            // panel's contents, so each trigger names its own.
            data-vui-open={alertModalId(alert.key)}
          >
            {alert.label}
          </Button>
        ))}
      </div>
      {/* **One dialog, not four.** Only one can be open at a time, so four mounted overlays each
          holding their own boolean is four chances for two to be open at once. The open one is
          derived from which key is set. */}
      <Dialog
        open={active !== undefined}
        onClose={() => setShown(null)}
        label={active?.heading ?? "Alert"}
        className="max-w-[600px]"
      >
        {active ? (
          <>
            <DialogHeader>
              <DialogTitle>{active.heading}</DialogTitle>
            </DialogHeader>
            <DialogBody className="py-6 text-center">
              <span
                className={cn(
                  "mx-auto mb-6 grid size-20 place-items-center rounded-full",
                  active.tint,
                )}
              >
                <active.icon className={cn("size-10", active.ink)} aria-hidden="true" />
              </span>
              <p className="mx-auto max-w-sm text-sm leading-6 text-muted-foreground">
                {active.body}
              </p>
            </DialogBody>
            <DialogFooter className="justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShown(null)}
                data-vui-dismiss=""
              >
                Close
              </Button>
              <Button
                size="lg"
                variant="primary"
                className={cn("border-transparent shadow-none", active.button)}
                onClick={() => setShown(null)}
                data-vui-dismiss=""
              >
                {active.key === "error" ? "Delete Anyway" : "Got It"}
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </Dialog>
    </Demo>
  );
}
