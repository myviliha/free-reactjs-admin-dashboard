import { APEX_COLORS, type ApexSeries, apexBase, CHART_SPECS } from "@viliha/vui-core";

// Re-exported so the pages that already read these from here keep working: the options moved to
// `@viliha/vui-core` because the Vue edition draws from the same object (`PD-128`).
export { APEX_COLORS, type ApexSeries, apexBase };

import * as React from "react";

/**
 * ApexCharts, in its own chunk.
 *
 * **The reason changed with the framework, and the code is the same.** Under Next this was a guard:
 * `apexcharts` touches `window` while its module is being evaluated, and a static export died with
 * `ReferenceError: window is not defined` unless the import was deferred. There is no server here, so
 * that hazard is gone — and `React.lazy` still earns its place, because the library is the single
 * largest thing this demo ships. Deferring it keeps ~270kB gzipped out of the initial bundle for the
 * fourteen screens that draw no chart, and the dashboard paints its metrics, tables and chrome while
 * the chunk arrives.
 *
 * **The mount gate that used to wrap this is gone**, along with the hydration it existed for. It held
 * `mounted` in state and rendered the placeholder until an effect flipped it, so the server's markup
 * and the client's first render matched. With no server pass to match, it was one render's delay and a
 * second copy of what `Suspense` already does.
 *
 * One wrapper rather than a call per chart, because five copies of this reasoning is five places for
 * the next person to get it wrong.
 */
const LazyApexChart = React.lazy(() => import("react-apexcharts"));

/** The reserved box, so a card does not resize when the canvas arrives. */
function ChartPlaceholder({ height }: { height: number }) {
  return (
    <div
      className="w-full animate-pulse rounded-lg bg-muted/50"
      style={{ minHeight: height }}
      aria-hidden="true"
    />
  );
}

export function ApexChart(props: {
  /**
   * Which chart, by name, resolved from `CHART_SPECS` in `@viliha/vui-core`.
   *
   * **The name is the whole configuration**, and that is the point: the HTML edition's pages are this
   * markup with the framework stripped, so there is no component left to ask what to draw. The mount
   * point carries the name, `vui-charts.js` looks it up in the same registry, and a chart therefore
   * cannot differ between the editions by construction (`PD-147`). Passing type, height, series and
   * options here instead would be a second copy of every chart, one per edition.
   */
  name: keyof typeof CHART_SPECS;
}) {
  // `CHART_SPECS` is a `Record<string, ...>`, so the prop type promises nothing the compiler can
  // check: a typo used to reach the browser as "is not a function" from inside the chart. Named here
  // instead, which is the same failure with the chart's name in it.
  const spec = CHART_SPECS[props.name];
  if (!spec) throw new Error(`ApexChart: no chart named "${props.name}" in CHART_SPECS`);
  const { type, height, series, options, ariaLabel } = spec();

  return (
    // **No height on this box at all.** `height` pinned it and the chart overflowed; `minHeight`
    // stopped it collapsing and the chart still overflowed, because the number is not the box's
    // problem: Apex renders its own inner div with an inline height and draws axis labels below the
    // plot, so whatever this wrapper is told, the rendered block can be taller. A wrapper with no
    // height is exactly as tall as its content, which is the only version that cannot overlap the
    // card underneath. The placeholder carries the height instead, so the card still reserves space
    // while the library loads.
    // `role="img"` with a name, and the drawing itself hidden. The alternative is exposing Apex's
    // own SVG, which is axis ticks and nothing a reader can act on.
    <div className="w-full" role="img" aria-label={ariaLabel} data-vui-chart={props.name}>
      {/* The drawing is hidden on a wrapper this component owns, rather than by passing `aria-hidden`
          into `react-apexcharts` and trusting it to forward an unknown prop to its own div. */}
      <div aria-hidden="true">
        <React.Suspense fallback={<ChartPlaceholder height={height} />}>
          <LazyApexChart
            type={type}
            height={height}
            // biome-ignore lint/suspicious/noExplicitAny: Apex types `series` as a union its own
            // option builders do not satisfy; the two shapes it accepts are in this component's props.
            series={series as any}
            options={options}
          />
        </React.Suspense>
      </div>
    </div>
  );
}
