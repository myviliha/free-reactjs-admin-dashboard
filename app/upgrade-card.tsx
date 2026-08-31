import { FREE_UPGRADE } from "@viliha/vui-core";
import { Button } from "@viliha/vui-react/button";
import { Card, CardContent } from "@viliha/vui-react/card";
import Link from "next/link";

/**
 * The promo card at the foot of the sidebar.
 *
 * The reference ends its free sidebar with one, and it is the only place the free demo says out loud
 * that there is a paid tier. Leaving it out would make the free edition read as the whole product.
 *
 * The three strings come from `FREE_UPGRADE` because the Vue edition renders the same card, and the
 * body sentence carries a family count that would otherwise be a number written down twice.
 */
export function UpgradeCard() {
  return (
    <Card className="mx-1 mt-6 bg-accent/40 text-center">
      <CardContent className="p-4">
        <p className="font-semibold tracking-tight">{FREE_UPGRADE.heading}</p>
        <p className="mt-2 text-sm text-muted-foreground">{FREE_UPGRADE.body}</p>
        <Link href={FREE_UPGRADE.href} className="mt-4 block">
          <Button variant="primary" className="w-full">
            {FREE_UPGRADE.cta}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
