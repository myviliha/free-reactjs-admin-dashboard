"use client";

import { CalendarIcon } from "@radix-ui/react-icons";
import { DATE_RANGE_LABEL } from "@viliha/vui-core";
import { Calendar, type DateRange } from "@viliha/vui-react/calendar";
import { Dropdown } from "@viliha/vui-react/dropdown-menu";
import * as React from "react";

/**
 * The statistics card's date range, on the reference's chrome and our own calendar.
 *
 * **Their picker is flatpickr and this one is not, deliberately.** We already ship `Calendar`, which
 * is react-day-picker and already in the free tier, and it takes `mode="range"` because `Calendar`
 * forwards `DayPicker`'s props wholesale. Adding flatpickr would be a second date library in a free
 * download to do a thing the first one does, which is the trade refused for the charts until the dev
 * chose to drop Recharts outright rather than carry both.
 *
 * The chrome is theirs to the class: a 40px square on small screens where only the icon shows, 160px
 * from `lg` where the text does, the icon absolutely positioned and `pointer-events-none` so it
 * cannot swallow the click, and `rounded-lg border bg-white text-sm font-medium`.
 *
 * It stays a leading icon here, unlike `date-field.tsx` where the icon trails. That is theirs in both
 * cases and it is also right: this control collapses to the icon alone on a small screen, so the icon
 * is the label and belongs where a label goes, while a form field's icon is an affordance at the edge
 * you reach for.
 *
 * **The default range is set after mount, not during render.** It is "the last seven days", which is
 * read off the clock, and the server's clock and the browser's are not the same instant: rendering
 * it would be the hydration bug the calendar page already had. Until the effect runs the trigger
 * shows its placeholder, which is one frame.
 */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Their `dateFormat: "M d"`, so `Aug 18`. */
const short = (date: Date) => `${MONTHS[date.getMonth()]} ${date.getDate()}`;

function label(range: DateRange | undefined) {
  if (!range?.from) return "Select date range";
  if (!range.to || range.to.getTime() === range.from.getTime()) return short(range.from);
  return `${short(range.from)} to ${short(range.to)}`;
}

export function DateRangePicker() {
  const [range, setRange] = React.useState<DateRange | undefined>(undefined);

  React.useEffect(() => {
    const to = new Date();
    const from = new Date();
    // Their `sevenDaysAgo` is `today - 6`, so the window is seven days inclusive.
    from.setDate(to.getDate() - 6);
    setRange({ from, to });
  }, []);

  return (
    <Dropdown
      label=""
      ariaLabel={`Date range: ${label(range)}`}
      staticId="menu-date-range"
      align="end"
      // No `offset`: the default four pixels is right here. Seventeen is the distance from a
      // centred control to the bottom of the *header bar*, and this control sits in a card, where
      // the same number would leave the panel floating away from its trigger.
      bare
      triggerClassName="relative inline-flex size-10 items-center justify-center rounded-lg border border-border bg-card text-sm font-medium text-transparent lg:size-auto lg:justify-start lg:py-2 lg:pr-3 lg:pl-10 lg:text-foreground/80"
      panelClassName="p-0"
      trigger={
        <>
          <CalendarIcon
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 z-10 size-5 -translate-x-1/2 -translate-y-1/2 text-muted-foreground lg:left-3 lg:translate-x-0"
          />
          {/* `text-transparent` above hides this below `lg`, which is how theirs collapses to an
              icon without swapping elements or measuring anything. */}
          {/* `DATE_RANGE_LABEL` carries the width, and it is shared: the Vue demo renders the same
              label and had the same 104px, which is narrower than the "Select date range" the button
              reads before the range resolves (`PD-146`). */}
          <span className={DATE_RANGE_LABEL}>{label(range)}</span>
        </>
      }
    >
      <Calendar
        mode="range"
        numberOfMonths={1}
        selected={range}
        onSelect={setRange}
        defaultMonth={range?.from}
      />
    </Dropdown>
  );
}
