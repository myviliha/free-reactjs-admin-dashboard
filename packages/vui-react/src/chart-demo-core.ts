/**
 * The rows every edition's chart example draws (`PD-022`).
 *
 * **One list, because the family's whole claim is that a chart definition is framework-neutral.**
 * `tanstack-chart.tsx` says so and the docs page repeats it, and yet the first version of the two
 * gallery examples retyped the same four rows in `packages/react/gallery/family-examples.tsx` and
 * `apps/web/vuejs/src/gallery-examples.ts`. Nothing compared them: changing February in one left
 * both galleries drawing four points and the same twenty-one SVG shapes, so a parity check by shape
 * count passed while the two editions showed different revenue.
 *
 * The *definition* cannot live here, because `defineChart` is `@tanstack/charts`' own API and this
 * module is framework-free by construction (`packages/core/scripts/build.mjs` fails the build on a
 * framework import). The data can, and the data is the part that was diverging. Same split as
 * `demo-icon-paths.ts`: the shared thing is what crosses the boundary, and each edition binds it
 * with its own library call.
 */
export interface ChartDemoPoint {
  month: string;
  revenue: number;
}

/** Four months, rising then dipping, so a line has a shape rather than a slope. */
export const CHART_DEMO_ROWS: readonly ChartDemoPoint[] = [
  { month: "Jan", revenue: 42_000 },
  { month: "Feb", revenue: 58_000 },
  { month: "Mar", revenue: 76_000 },
  { month: "Apr", revenue: 61_000 },
];

/** The accessible name both editions give the chart, so a screen reader hears the same thing. */
export const CHART_DEMO_LABEL = "Revenue by month";

/* ── The charts screen (`PD-036`) ─────────────────────────────────────────────
 *
 * **The data and the captions are shared; the chart construction is not, and cannot be.** Recharts
 * is React-only and is React's answer to charting; TanStack Charts is the cross-framework one and is
 * what the Vue edition draws with. So `/charts` is the one screen in this set that is a rebuild
 * rather than a port, and the honest shared surface is exactly the part a reader compares: the
 * numbers on the axes and the words above them.
 *
 * A retyped fixture here would be two demos claiming different revenue for the same month, which is
 * the failure `chart-demo-core.ts` was created for one card at a time.
 */

export interface RevenuePoint {
  month: string;
  revenue: number;
  expenses: number;
}

export const CHART_REVENUE: readonly RevenuePoint[] = [
  { month: "Jan", revenue: 18_600, expenses: 12_400 },
  { month: "Feb", revenue: 30_500, expenses: 13_900 },
  { month: "Mar", revenue: 23_700, expenses: 9_800 },
  { month: "Apr", revenue: 27_300, expenses: 15_200 },
  { month: "May", revenue: 41_900, expenses: 18_100 },
  { month: "Jun", revenue: 38_400, expenses: 16_700 },
];

export const CHART_DEALS: readonly { stage: string; deals: number }[] = [
  { stage: "Lead", deals: 42 },
  { stage: "Qualified", deals: 31 },
  { stage: "Proposal", deals: 24 },
  { stage: "Negotiation", deals: 15 },
  { stage: "Won", deals: 9 },
];

/**
 * Traffic by source, each with its palette slot.
 *
 * `var(--chart-N)` rather than a hex: `theme.css` maps the tokens onto those names, so a chart
 * follows light mode, dark mode and a per-tenant brand with no colour prop anywhere.
 */
export const CHART_TRAFFIC: readonly { name: string; value: number; color: string }[] = [
  { name: "Direct", value: 4_200, color: "var(--chart-1)" },
  { name: "Referral", value: 3_100, color: "var(--chart-2)" },
  { name: "Organic", value: 5_400, color: "var(--chart-3)" },
  { name: "Social", value: 2_200, color: "var(--chart-4)" },
  { name: "Email", value: 1_600, color: "var(--chart-5)" },
];

/** The four cards, in order, with the caption under each title. */
export const CHART_CARDS = [
  { id: "area", title: "Revenue vs. expenses", description: "Last 6 months" },
  { id: "bar", title: "Deals by stage", description: "Current pipeline" },
  { id: "line", title: "Trend", description: "Revenue vs. expenses over time" },
  { id: "pie", title: "Traffic sources", description: "Sessions this month" },
] as const;

/** Which palette slot each series takes, so the two editions colour the same series alike. */
export const CHART_SERIES_COLOR = {
  areaRevenue: "var(--chart-1)",
  areaExpenses: "var(--chart-3)",
  barDeals: "var(--chart-2)",
  lineRevenue: "var(--chart-1)",
  lineExpenses: "var(--chart-4)",
} as const;
