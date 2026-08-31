"use client";

import { ArrowDownIcon, ArrowUpIcon, DotsVerticalIcon } from "@radix-ui/react-icons";
import {
  FREE_DASHBOARD_CARD_TITLE,
  MONTHLY_SALES,
  monthlySalesOptions,
  monthlyTargetOptions,
  STATISTICS,
  statisticsOptions,
} from "@viliha/vui-core";

import { Badge } from "@viliha/vui-react/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@viliha/vui-react/card";
import { Dropdown, DropdownItem } from "@viliha/vui-react/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@viliha/vui-react/tabs";
import * as React from "react";

import { ApexChart, apexBase } from "./apex";
import { DateRangePicker } from "./date-range";

/** The reference's own series, so the two dashboards can be held side by side. */

/**
 * The two series, in the brand colour rather than the chart palette.
 *
 * `--chart-1` is orange in this theme and `--chart-2` teal, so the dashboard drew an orange bar
 * chart under a blue sidebar and read as two products. The reference draws its whole dashboard in
 * one brand hue, and so does this: `--primary` is the brand every button and control already uses, and
 * the second series is the same hue mixed toward the card so the pair still separates. Both retint
 * with the theme, which a hex would not.
 */
const _CONFIG = {
  sales: { label: "Sales", color: "var(--primary)" },
  revenue: {
    label: "Revenue",
    color: "color-mix(in oklab, var(--primary) 45%, var(--card))",
  },
};

/**
 * A dashboard card: `Card` and its parts, plus the overflow menu the reference puts on each one.
 *
 * The menu is `Dropdown` from the package rather than three dots that do nothing. An affordance that
 * looks interactive and is not is the thing a demo should least often ship, because it is the first
 * thing a reader clicks.
 */
function Panel({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    // `flex-col` so the target card can push its footer strip to the bottom with `mt-auto`.
    //
    // **`h-full` is gone.** It stretched every card to its grid row's height, and the row is as tall
    // as the tallest thing in it, so Monthly Sales grew a hundred and fifty pixels of nothing under
    // its x-axis to match the target card beside it. A card is as tall as what is in it; the grid
    // can have a ragged edge, which the reference's does too.
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div>
          {/* The reference's card titles are larger and heavier than the body, and its descriptions
              are a step smaller. `CardTitle` sets weight and not size, so the size comes from
              `FREE_DASHBOARD_CARD_TITLE`, the one definition every edition of this style reads (`PD-207`).
              It was this file's own literal, and three other editions had copied it. */}
          <CardTitle className={FREE_DASHBOARD_CARD_TITLE}>{title}</CardTitle>
          {description ? (
            <CardDescription className="mt-1 text-sm">{description}</CardDescription>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {actions}
          <CardMenu title={title} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">{children}</CardContent>
    </Card>
  );
}

/** The id the static edition pairs a card's menu trigger with its panel by (`PD-158`). */
export const cardMenuId = (title: string) =>
  `menu-card-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

/**
 * The three-dot menu every dashboard card carries.
 *
 * **`demographic.tsx` had its own copy of these two items**, which is a menu written twice and
 * therefore two menus. It matters more than usual here: the static edition renders this panel once on
 * its build route and the emitter places that markup beside every trigger, so a second copy would be
 * a panel that silently stops matching the card it opens from.
 *
 * `plainIcon` is the one real difference between the two call sites. Radix glyphs are 15px and
 * `theme.css` chips anything that size, which put a bordered box around a three-dot menu.
 */
export function CardMenu({ title, plainIcon }: { title: string; plainIcon?: boolean }) {
  return (
    <Dropdown
      label=""
      ariaLabel={`${title} options`}
      align="end"
      staticId={cardMenuId(title)}
      icon={<DotsVerticalIcon className={plainIcon ? "vui-icon-plain" : undefined} />}
    >
      <DropdownItem>View more</DropdownItem>
      <DropdownItem>Export</DropdownItem>
    </Dropdown>
  );
}

/**
 * Monthly sales.
 *
 * Thin columns on a faint grid, which is the difference between a series of measurements and a
 * block of colour. `columnWidth` is the knob Apex gives for it; Recharts wanted a `barSize` in
 * pixels, which stops being thin the moment the card is narrow.
 */
export function MonthlySalesChart() {
  const _options = monthlySalesOptions(MONTHLY_SALES.map((row) => row.month));

  return (
    <Panel title="Monthly Sales">
      <ApexChart name="monthly-sales" />
    </Panel>
  );
}

/**
 * The three ranges, each with its own series.
 *
 * The segmented control used to switch a value nothing read, so all three tabs drew the same twelve
 * months: a control that looks interactive and is not is the first thing a reader clicks and the
 * first thing that disappoints them. Quarterly and Annually now aggregate the monthly figures rather
 * than being invented separately, so the three views agree with each other by construction: switch
 * to Annually and the total is the same money.
 */
const QUARTERS = ["Q1", "Q2", "Q3", "Q4"] as const;

const sum = (rows: typeof STATISTICS, key: "sales" | "revenue") =>
  rows.reduce((total, row) => total + row[key], 0);

const RANGES = {
  monthly: { label: "Monthly", data: STATISTICS },
  quarterly: {
    label: "Quarterly",
    data: QUARTERS.map((month, i) => {
      const slice = STATISTICS.slice(i * 3, i * 3 + 3);
      return { month, sales: sum(slice, "sales"), revenue: sum(slice, "revenue") };
    }),
  },
  annually: {
    label: "Annually",
    // Three years, with the fixture's own totals as the latest: a single-point line is not a chart.
    data: [
      { month: "2024", sales: 1720, revenue: 610 },
      { month: "2025", sales: 1980, revenue: 780 },
      {
        month: "2026",
        sales: sum(STATISTICS, "sales"),
        revenue: sum(STATISTICS, "revenue"),
      },
    ],
  },
} as const;

type RangeKey = keyof typeof RANGES;

/**
 * Statistics.
 *
 * **Gradient fills and a thin stroke**, which is what separates the reference's chart from ours: a
 * flat 15% wash under a default-weight line reads as a filled shape, and a stroke over a fade reads
 * as a trend. The gradients are defined per series against the series' own colour, so they follow
 * the theme rather than pinning a blue.
 *
 * **The chart is keyed by range.** Recharts animates a mount, not a data swap, so without the key
 * the series jumps to its new shape and the tab that caused it looks broken. Keyed, each switch
 * replays the draw, which is the animation the control is promising.
 */
export function StatisticsChart() {
  const [range, setRange] = React.useState<RangeKey>("monthly");
  const rows = RANGES[range].data;
  const _base = apexBase();

  const _options = statisticsOptions(rows.map((row) => row.month));

  return (
    <Panel
      title="Statistics"
      description="Target you've set for each month"
      actions={
        <div className="flex items-center gap-3 sm:justify-end">
          <Tabs value={range} onValueChange={(value) => setRange(value as RangeKey)}>
            <TabsList>
              {(Object.keys(RANGES) as RangeKey[]).map((key) => (
                <TabsTrigger key={key} value={key}>
                  {RANGES[key].label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          {/* A real range picker, not the disabled button that stood here. Their chrome, our
              calendar: see `date-range.tsx` for why it is not flatpickr. */}
          <DateRangePicker />
        </div>
      }
    >
      {/*
        **The zoom is the library's now.** `use-zoom-window.ts` existed because Recharts has no
        pinch or pan and the reference has both; Apex ships them, so forty lines of wheel and touch
        handling and its own clamped index pair are deleted rather than kept beside a library that
        does the same thing. `chart.id` changes with the range, which is what makes Apex redraw and
        replay its animation on a tab switch instead of morphing in place.
      */}
      <ApexChart name="statistics" />
    </Panel>
  );
}

const _TARGET = 75.55;

const FOOTER = [
  { label: "Target", value: "$20K", up: false },
  { label: "Revenue", value: "$20K", up: true },
  { label: "Today", value: "$20K", up: true },
];

/**
 * The monthly target gauge, on ApexCharts' own `radialBar`.
 *
 * This was a Recharts `RadialBarChart` and it was never going to match. Recharts scales a radial to
 * its data unless you add a `PolarAngleAxis` with a domain, draws the arc inside the box's padding
 * so a half gauge comes out small, and gives no way to put the value in the ring: the figure had to
 * be an absolutely positioned overlay guessed into place, and it kept landing on the stroke.
 * `radialBar` is one plot option for each of those: `startAngle`/`endAngle` for the half, `hollow`
 * for the band thickness, `sparkline` to drop the padding so the arc fills its card, and
 * `dataLabels.value` to render the number in the middle where it belongs.
 */
export function MonthlyTarget() {
  const _options = monthlyTargetOptions();

  return (
    <Panel title="Monthly Target" description="Target you've set for each month">
      <div className="relative">
        <ApexChart name="monthly-target" />
        {/* The badge is ours: Apex renders one value label and this is a second thing under it. */}
        <div className="pointer-events-none absolute inset-x-0 top-[152px] flex justify-center">
          <Badge variant="success" className="rounded-full">
            +10%
          </Badge>
        </div>
      </div>
      <p className="mx-auto -mt-8 max-w-[21rem] text-center text-sm text-muted-foreground">
        You earn $3287 today, it's higher than last month. Keep up your good work!
      </p>
      {/*
        **Full bleed, not an inset panel.** The reference's footer is the card's own bottom edge: the
        tint runs to the border and the corners round with the card. Ours sat in a rounded box with
        card padding around it, which reads as a fourth block of content rather than a footer. The
        negative margins undo `CardContent`'s padding, which is what lets a child reach the edge
        without the card having to know about it.
      */}
      <div className="-mx-5 -mb-5 mt-auto grid grid-cols-3 divide-x divide-border rounded-b-[var(--vui-card-radius)] bg-muted/50 px-4 py-5 text-center">
        {FOOTER.map((item) => (
          <div key={item.label}>
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className="mt-1.5 flex items-center justify-center gap-1 font-semibold tabular-nums">
              {item.value}
              {item.up ? (
                <ArrowUpIcon className="size-3.5 text-success" />
              ) : (
                <ArrowDownIcon className="size-3.5 text-destructive" />
              )}
            </p>
          </div>
        ))}
      </div>
    </Panel>
  );
}
