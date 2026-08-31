import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import { DASHBOARD_ORDERS } from "@viliha/vui-core";
import { Avatar, AvatarFallback, AvatarImage } from "@viliha/vui-react/avatar";
import { Badge } from "@viliha/vui-react/badge";
import { Button } from "@viliha/vui-react/button";
import { Card, CardHeader, CardTitle } from "@viliha/vui-react/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@viliha/vui-react/table";

/**
 * Recent orders.
 *
 * Column order is the reference's: Products, Category, Price, Status.
 *
 * **The thumbnail degrades rather than breaks.** `AvatarImage` removes itself when its `src` fails
 * to load, and whatever is under it shows through, so a row renders the photograph when
 * `public/products/` holds one and the product's initials when it does not. That is not a
 * convenience: these five are product photographs, so unlike MIT-licensed code they carry
 * third-party rights into anything built on this download. A buyer who deletes the folder gets a
 * table that still looks deliberate rather than five broken-image glyphs.
 *
 * `webp` at 100 by 100, which is what the reference ships: the whole set is under four kilobytes.
 */

const TONE = { Delivered: "success", Pending: "warning", Canceled: "destructive" } as const;

const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("");

export function RecentOrders() {
  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Recent Orders</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <MixerHorizontalIcon />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            See all
          </Button>
        </div>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Products</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {DASHBOARD_ORDERS.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="size-[50px] shrink-0 rounded-lg bg-muted">
                    <AvatarImage
                      src={`/products/${order.image}.webp`}
                      alt=""
                      className="rounded-lg object-contain p-1"
                    />
                    <AvatarFallback className="rounded-lg text-xs">
                      {initials(order.product)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{order.product}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.variants} {order.variants === 1 ? "Variant" : "Variants"}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{order.category}</TableCell>
              <TableCell className="tabular-nums">{order.price}</TableCell>
              <TableCell>
                <Badge variant={TONE[order.status as keyof typeof TONE]}>{order.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
