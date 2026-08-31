import { ALERT_VARIANTS } from "@viliha/vui-core";
import { Alert, AlertDescription, AlertTitle } from "@viliha/vui-react/alert";
import { CheckCircle, Info, Warning } from "@viliha/vui-react/icons";

import { Demo, PageHeader } from "../../page-shell";

export const metadata = { title: "Alerts" };

/**
 * Every alert state, one card each, derived from the component rather than listed here.
 *
 * **This page showed two of four until 2026-08-24, and said why in a comment.** The theme contract
 * carried `destructive` and no `success`, `warning` or `info`, so painting the other three would have
 * meant `text-emerald-500` in the one file all six editions render from: a page that looked complete
 * hiding a colour a buyer could not theme. `PD-066` made the three into tokens, so the honest version
 * of this page is now the complete one.
 *
 * **Five cards where the reference has four**, because `default` is a real state here: an alert with
 * no colour, for the notice that is neither good news nor bad. Theirs has no such variant, so a
 * neutral message has to borrow `info` and say something it does not mean.
 *
 * Each card carries the pair the reference does, one with a link and one without, because the link is
 * the part that changes the layout and is worth seeing beside the version without it.
 */
const STATES = Object.keys(ALERT_VARIANTS) as (keyof typeof ALERT_VARIANTS)[];

const COPY = {
  default: {
    card: "Default Alert",
    icon: <Info />,
    title: "Scheduled Maintenance",
    body: "The dashboard is read-only between 02:00 and 03:00 UTC on Sunday.",
    link: "Read the notice",
  },
  success: {
    card: "Success Alert",
    icon: <CheckCircle />,
    title: "Payment Received",
    body: "Invoice INV-2043 has been settled in full.",
    link: "View the invoice",
  },
  warning: {
    card: "Warning Alert",
    icon: <Warning />,
    title: "Card Expiring Soon",
    body: "The card ending 4242 expires next month. Update it to avoid a failed renewal.",
    link: "Update payment method",
  },
  destructive: {
    card: "Error Alert",
    icon: <Warning />,
    title: "Payment Failed",
    body: "The card was declined. Try another payment method to keep the subscription active.",
    link: "Try another card",
  },
  info: {
    card: "Info Alert",
    icon: <Info />,
    title: "Export Ready",
    body: "Your 12,480 row export finished and is available for the next seven days.",
    link: "Download the export",
  },
} as const;

export default function AlertsPage() {
  return (
    <>
      <PageHeader title="Alerts" />
      {STATES.map((state) => {
        const copy = COPY[state];
        return (
          <Demo key={state} title={copy.card}>
            <div className="space-y-4">
              <Alert variant={state}>
                {copy.icon}
                <AlertTitle>{copy.title}</AlertTitle>
                <AlertDescription>
                  {copy.body}
                  {/* Their link sits under the message at `mt-3`, underlined, in the muted colour:
                      a secondary action rather than a second sentence. */}
                  <a
                    href="/basic-tables"
                    className="mt-3 inline-block font-medium underline underline-offset-2"
                  >
                    {copy.link}
                  </a>
                </AlertDescription>
              </Alert>
              <Alert variant={state}>
                {copy.icon}
                <AlertTitle>{copy.title}</AlertTitle>
                <AlertDescription>{copy.body}</AlertDescription>
              </Alert>
            </div>
          </Demo>
        );
      })}
    </>
  );
}
