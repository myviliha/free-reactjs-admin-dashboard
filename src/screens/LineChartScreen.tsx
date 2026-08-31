import { cn, DT_FRAME, lineChartOptions } from "@viliha/vui-core";

import { ApexChart } from "../dashboard/apex";
import { Demo, PageHeader } from "../page-shell";

/**
 * The Line chart, matching the reference's and then adding the variant it leaves out.
 *
 * **Two cards where theirs has one.** Their "Line Chart 1" is a two-series gradient area over twelve
 * months, and it is reproduced here to its own numbers: `straight` stroke at 2px, a fill fading from
 * 0.55 to nothing, 310px tall, no legend, y-axis grid lines only. The second card is the same data
 * as a plain smooth line with visible markers, which is the other half of what people mean by "line
 * chart" and is the shape you want when the values matter more than the trend.
 *
 * **Twelve months in a scrolling frame, not eight squeezed.** Theirs sets `min-w-[1000px]` inside an
 * overflow container so a year of labels stays legible on a laptop instead of collapsing to every
 * third month. Ours does the same, in `DT_FRAME`, which is the frame the tables use: one answer to
 * "a wide thing inside a card" rather than two.
 *
 * Every colour is a token, so the canvas retints with the theme. Apex resolves colour strings at
 * draw time, which is what makes `var(--primary)` work where a hex would freeze the chart to one
 * palette.
 */

/** A year of categories needs room; the frame scrolls rather than letting the labels collide. */
function Wide({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn(DT_FRAME, "border-0")}>
      <div className="min-w-[1000px]">{children}</div>
    </div>
  );
}

export default function LineChartScreen() {
  const { area, line } = lineChartOptions();

  return (
    <>
      <PageHeader title="Line Chart" />
      <Demo
        title="Line Chart 1"
        description="Two series over a year, as a gradient area. The trend is the subject."
      >
        <Wide>
          <ApexChart name="line-area" />
        </Wide>
      </Demo>
      <Demo
        title="Line Chart 2"
        description="The same data as a smooth line with markers, for when each month's value is the subject rather than the shape."
      >
        <Wide>
          <ApexChart name="line-plain" />
        </Wide>
      </Demo>
    </>
  );
}
