"use client";

import { APEX_COLORS, type ApexSeries, apexBase, CHART_SPECS } from "@viliha/vui-core";

// Re-exported so the pages that already read these from here keep working: the options moved to
// `@viliha/vui-core` because the Vue edition draws from the same object (`PD-128`).
export { APEX_COLORS, type ApexSeries, apexBase };

import * as React from "react";

/**
 * ApexCharts, loaded in the browser and nowhere else.
 *
 * `apexcharts` touches `window` while its module is being evaluated, and `"use client"` does not stop
 * a module being evaluated during server rendering: it says where the component runs, not where the
 * import does. That is the same trap `jsvectormap` fell into (`PD-059`), and a static export dies with
 * `ReferenceError: window is not defined` without a guard.
 *
 * **`React.lazy` behind a mount gate, not `next/dynamic` with `ssr: false`, and the difference is a
 * whole page** (`Z-12`). `ssr: false` marks the route `BAILOUT_TO_CLIENT_SIDE_RENDERING`, which makes
 * Next skip server rendering for **everything on it**: the export becomes a loading shell, and the
 * HTML edition's page emitter classified `/`, `/bar-chart` and `/line-chart` as not static-safe, so the
 * free download had no dashboard and no charts. The dashboard is the download's entry page.
 *
 * `React.lazy` creates the wrapper without running the import, and the gate means the wrapper is never
 * rendered on the server, so the module is never evaluated there either. Same protection, and the rest
 * of the page renders: the static HTML now carries the metrics, the tables and the chrome, with the
 * placeholder where the canvas will be. The chart itself needs JavaScript in any edition, which is
 * what the placeholder is for rather than a defect it hides.
 *
 * One wrapper rather than a call per chart, because five copies of this reasoning is five places for
 * the next person to get it wrong.
 */
const LazyApexChart = React.lazy(() => import("react-apexcharts"));

/**
 * The reserved box, so a card does not resize when the canvas arrives.
 *
 * Rendered on the server, during hydration, and while the chunk downloads: the same element in all
 * three, which is what keeps the client's first paint identical to the server's.
 */
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
  const { type, height, series, options, ariaLabel } = CHART_SPECS[props.name]();
  /**
   * Mounted, and only then is the library asked for.
   *
   * `false` on the server and on the client's first render, so both produce the placeholder and
   * hydration matches; the effect flips it once, after which the lazy import runs in the browser
   * where `window` exists.
   */
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

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
      {mounted ? (
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
      ) : (
        <ChartPlaceholder height={height} />
      )}
    </div>
  );
}
