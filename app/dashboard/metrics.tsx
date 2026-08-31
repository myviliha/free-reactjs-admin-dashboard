import { ArrowDownIcon, ArrowUpIcon, BoxIcon, PersonIcon } from "@radix-ui/react-icons";
import { DASHBOARD_METRICS } from "@viliha/vui-core";
import { Badge } from "@viliha/vui-react/badge";
import { Card, CardContent } from "@viliha/vui-react/card";

/**
 * The two headline tiles: customers and orders.
 *
 * `Card` and `Badge` from the package rather than divs wearing their classes, which is the demo's
 * job: a reader who likes this tile can find the two components that drew it.
 *
 * The reference's figures verbatim. A demo that invents its own numbers cannot be held beside the
 * thing it is matching.
 */
/** The icon each metric names, resolved to a component here so the fixture stays framework-free. */
const ICONS: Record<string, typeof PersonIcon> = { users: PersonIcon, box: BoxIcon };

export function EcommerceMetrics() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {DASHBOARD_METRICS.map(({ label, value, delta, up, icon }) => {
        const Icon = ICONS[icon] ?? BoxIcon;
        return (
          <Card key={label}>
            <CardContent className="p-5 md:p-6">
              <span className="grid size-12 place-items-center rounded-xl bg-accent">
                <Icon className="size-6 text-foreground/80" />
              </span>
              <div className="mt-5 flex items-end justify-between gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  {/* Measured: `text-title-sm font-bold`, which is 30px on a 38px line. `text-2xl` is
                    24px, and the headline figure is the one number on the card. */}
                  <h4 className="mt-2 text-[30px] font-bold leading-[38px] tracking-tight tabular-nums">
                    {value}
                  </h4>
                </div>
                {/*
                The arrow carries the direction and the colour reinforces it, rather than the colour
                carrying it alone: red and green are the two most common forms of colour blindness.
              */}
                <Badge variant={up ? "success" : "destructive"} className="rounded-full">
                  {up ? <ArrowUpIcon /> : <ArrowDownIcon />}
                  {delta}
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
