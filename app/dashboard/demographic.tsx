import { DotsVerticalIcon } from "@radix-ui/react-icons";
import { DASHBOARD_COUNTRIES } from "@viliha/vui-core";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@viliha/vui-react/card";
import { Progress } from "@viliha/vui-react/progress";
import { CardMenu } from "./charts";

import { Flag, type FlagName } from "./flag";
import { WorldMap } from "./world-map";

/**
 * Customers by country: the map, then the figures.
 *
 * The map is `jsvectormap` on the dev's call (`PD-059`), and it is **decorative**: it is
 * `aria-hidden`, and every number it encodes is in the list below it, which is not. A map that is the
 * only place a figure appears is a figure a screen reader cannot reach.
 *
 * The bars are the `Progress` component, not a div with a width. That is the demo's job, and it also
 * means these bars announce their value, which a styled div does not.
 *
 * The flags are drawn rather than emoji: see `flag.tsx` for why an emoji flag cannot be a circle.
 */

export function DemographicCard() {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div>
          {/* Same scale as every other card's header. `CardTitle` sets weight and not size, so
              without these two the title and its description came out the same size. */}
          <CardTitle className="text-lg font-semibold">Customers Demographic</CardTitle>
          <CardDescription className="mt-1 text-sm">
            Number of customers based on country
          </CardDescription>
        </div>
        {/* The same menu the chart cards carry, from one source rather than a second copy. */}
        <CardMenu title="Demographic" plainIcon />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Their panel is `rounded-2xl border bg-gray-50` with the map bled to its edges: they pad
            it and then cancel the padding with `-mx-4 -my-6` on the map. No padding is the same
            result without the double negative. `--muted` is this theme's `gray-50`. */}
        <div className="overflow-hidden rounded-2xl border border-border bg-muted">
          <WorldMap />
        </div>
        {/* The rows get their own spacing. On `CardContent` it also spaced the map, so tightening
            the rows pulled the map up with them. */}
        <div className="space-y-5">
          {DASHBOARD_COUNTRIES.map((country) => (
            <div key={country.name} className="flex items-center gap-3">
              <Flag name={country.flag} className="size-8 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{country.name}</p>
                <p className="text-xs text-muted-foreground tabular-nums">
                  {country.customers.toLocaleString()} Customers
                </p>
              </div>
              <div className="flex w-40 shrink-0 items-center gap-3">
                <Progress
                  value={country.share}
                  className="flex-1"
                  aria-label={`${country.name} share of customers`}
                />
                <span className="w-10 text-right font-semibold tabular-nums">{country.share}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
