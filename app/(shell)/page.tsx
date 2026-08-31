import { MonthlySalesChart, MonthlyTarget, StatisticsChart } from "../dashboard/charts";
import { DemographicCard } from "../dashboard/demographic";
import { EcommerceMetrics } from "../dashboard/metrics";
import { RecentOrders } from "../dashboard/recent-orders";

export const metadata = { title: "Ecommerce Dashboard" };

/**
 * The ecommerce dashboard, on the reference's own grid.
 *
 * Twelve columns, and the 7/5 split at `xl` is theirs: the metrics and the sales chart stack in one
 * seven-column stack beside the target gauge, statistics runs full width, and the demographic card
 * and recent orders take the 5/7 split back. Below `xl` everything is full width.
 *
 * The free tier carries **one** dashboard. The other seven verticals are the paid tier's, which is
 * the same split the reference makes.
 *
 * **It lives in the `(shell)` group like every other page.** It used to sit at `app/page.tsx` and
 * mount `<Shell>` itself, which was a second shell outside the group's layout: harmless while the
 * shell was stateless, and the moment a provider went above it the dashboard was the one page
 * without one. A route group does not appear in the URL, so this is still `/`.
 */
export default function DashboardPage() {
  return (
    <>
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics />
          <MonthlySalesChart />
        </div>
        <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget />
        </div>
        <div className="col-span-12">
          <StatisticsChart />
        </div>
        <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div>
        <div className="col-span-12 xl:col-span-7">
          <RecentOrders />
        </div>
      </div>
    </>
  );
}
