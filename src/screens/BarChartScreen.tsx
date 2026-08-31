import { barChartOptions, cn, DT_FRAME } from "@viliha/vui-core";

import { ApexChart } from "../dashboard/apex";
import { Demo, PageHeader } from "../page-shell";

/**
 * The Bar chart, to the reference's measurements, plus the grouped variant it omits.
 *
 * **Their numbers, not approximations of them**: `columnWidth` 39%, a 5px radius applied to the
 * `end` of each column only so the base stays flat on the axis, 180px tall, one series, no legend,
 * and a transparent 4px stroke acting as the gap between columns.
 *
 * **Three cards where theirs has one.** A bar chart has three readings people actually need and
 * their page shows one: a single series, several series side by side, and several stacked to a total.
 * The data is the same twelve months throughout, so the three cards are a comparison of encodings
 * rather than three unrelated charts.
 */
const _MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function Wide({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn(DT_FRAME, "border-0")}>
      <div className="min-w-[1000px]">{children}</div>
    </div>
  );
}

export default function BarChartScreen() {
  const { bars, grouped, stacked } = barChartOptions();

  return (
    <>
      <PageHeader title="Bar Chart" />
      <Demo title="Bar Chart 1" description="One series across a year. Their measurements exactly.">
        <Wide>
          <ApexChart name="bar-single" />
        </Wide>
      </Demo>
      <Demo
        title="Bar Chart 2"
        description="Two series side by side, for comparing them month by month."
      >
        <Wide>
          <ApexChart name="bar-grouped" />
        </Wide>
      </Demo>
      <Demo
        title="Bar Chart 3"
        description="The same two stacked, for when the total is the number that matters."
      >
        <Wide>
          <ApexChart name="bar-stacked" />
        </Wide>
      </Demo>
    </>
  );
}
