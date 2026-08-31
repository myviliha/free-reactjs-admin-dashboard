import { FREE_UPGRADE } from "@viliha/vui-core";
import { Button } from "@viliha/vui-react/button";
import { Card, CardContent } from "@viliha/vui-react/card";

/**
 * The promo card at the foot of the sidebar.
 *
 * The reference ends its free sidebar with one, and it is the only place the free demo says out loud
 * that there is a paid tier. Leaving it out would make the free edition read as the whole product.
 *
 * The three strings come from `FREE_UPGRADE` because the Vue edition renders the same card, and the
 * body sentence carries a family count that would otherwise be a number written down twice.
 */
/**
 * Where "Upgrade to Pro" goes: the product site, not a route inside the demo.
 *
 * `FREE_UPGRADE.href` is `/signup`, which is the shared constant's default and is wrong here — the
 * demo's own sign-up screen is a *fixture*, so the one control in the shell that says there is a paid
 * tier pointed at a form that cannot sell anything. External, so it opens away from the demo, with
 * `noopener noreferrer`: without `noopener` the page we open gets a handle on this one through
 * `window.opener` and can navigate it, which is the reverse-tabnabbing hole.
 */
const UPGRADE_URL = "https://viliha.com";

export function UpgradeCard() {
  return (
    <Card className="mx-1 mt-6 bg-accent/40 text-center">
      <CardContent className="p-4">
        <p className="font-semibold tracking-tight">{FREE_UPGRADE.heading}</p>
        <p className="mt-2 text-sm text-muted-foreground">{FREE_UPGRADE.body}</p>
        <a
          href={UPGRADE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 block"
        >
          <Button variant="primary" className="w-full">
            {FREE_UPGRADE.cta}
          </Button>
        </a>
      </CardContent>
    </Card>
  );
}
