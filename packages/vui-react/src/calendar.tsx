"use client";

import * as React from "react";
import { type DayButton, DayPicker, getDefaultClassNames } from "react-day-picker";

/**
 * Re-exported so a caller does not need react-day-picker as a direct dependency.
 *
 * `Calendar` forwards `DayPicker`'s props, so a range picker has to name `DateRange` to hold its own
 * state. Without this the consumer either adds the underlying package to its manifest, which puts an
 * implementation detail of this component into their dependency list, or retypes the shape and
 * loses the connection to what `onSelect` actually hands back. A component that takes a type should
 * be the thing that exposes it.
 */
export type { DateRange } from "react-day-picker";

import { Button, buttonVariants } from "./button";
import {
  CALENDAR_CAPTION,
  CALENDAR_CAPTION_LABEL_BASE,
  CALENDAR_CAPTION_LABEL_DROPDOWN,
  CALENDAR_CAPTION_LABEL_PLAIN,
  CALENDAR_CELL,
  CALENDAR_CELL_LEADING,
  CALENDAR_DAY,
  CALENDAR_DISABLED,
  CALENDAR_DROPDOWN,
  CALENDAR_DROPDOWN_ROOT,
  CALENDAR_DROPDOWNS,
  CALENDAR_FIT,
  CALENDAR_GRID,
  CALENDAR_HIDDEN,
  CALENDAR_MONTH,
  CALENDAR_MONTHS,
  CALENDAR_NAV,
  CALENDAR_NAV_BUTTON,
  CALENDAR_NAV_ICON,
  CALENDAR_OUTSIDE,
  CALENDAR_RANGE_END,
  CALENDAR_RANGE_MIDDLE,
  CALENDAR_RANGE_START,
  CALENDAR_ROOT,
  CALENDAR_TODAY,
  CALENDAR_WEEK,
  CALENDAR_WEEK_NUMBER,
  CALENDAR_WEEK_NUMBER_HEAD,
  CALENDAR_WEEKDAY,
  CALENDAR_WEEKDAY_HEAD,
  CALENDAR_WEEKDAYS,
} from "./class-variants";
import {
  ChevronDown as ChevronDownIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "./icons";
import { cn } from "./utils";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        CALENDAR_ROOT,
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className,
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) => date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn(CALENDAR_FIT, defaultClassNames.root),
        months: cn(CALENDAR_MONTHS, defaultClassNames.months),
        month: cn(CALENDAR_MONTH, defaultClassNames.month),
        nav: cn(CALENDAR_NAV, defaultClassNames.nav),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          CALENDAR_NAV_BUTTON,
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          CALENDAR_NAV_BUTTON,
          defaultClassNames.button_next,
        ),
        month_caption: cn(CALENDAR_CAPTION, defaultClassNames.month_caption),
        dropdowns: cn(CALENDAR_DROPDOWNS, defaultClassNames.dropdowns),
        dropdown_root: cn(CALENDAR_DROPDOWN_ROOT, defaultClassNames.dropdown_root),
        dropdown: cn(CALENDAR_DROPDOWN, defaultClassNames.dropdown),
        caption_label: cn(
          CALENDAR_CAPTION_LABEL_BASE,
          captionLayout === "label"
            ? CALENDAR_CAPTION_LABEL_PLAIN
            : CALENDAR_CAPTION_LABEL_DROPDOWN,
          defaultClassNames.caption_label,
        ),
        month_grid: cn(CALENDAR_GRID, defaultClassNames.month_grid),
        weekdays: cn(CALENDAR_WEEKDAYS, defaultClassNames.weekdays),
        weekday: cn(CALENDAR_WEEKDAY_HEAD, defaultClassNames.weekday),
        week: cn(CALENDAR_WEEK, defaultClassNames.week),
        week_number_header: cn(CALENDAR_WEEK_NUMBER_HEAD, defaultClassNames.week_number_header),
        week_number: cn(CALENDAR_WEEK_NUMBER, defaultClassNames.week_number),
        day: cn(
          CALENDAR_CELL,
          CALENDAR_CELL_LEADING[props.showWeekNumber ? "withWeekNumber" : "plain"],
          defaultClassNames.day,
        ),
        range_start: cn(CALENDAR_RANGE_START, defaultClassNames.range_start),
        range_middle: cn(CALENDAR_RANGE_MIDDLE, defaultClassNames.range_middle),
        range_end: cn(CALENDAR_RANGE_END, defaultClassNames.range_end),
        today: cn(CALENDAR_TODAY, defaultClassNames.today),
        outside: cn(CALENDAR_OUTSIDE, defaultClassNames.outside),
        disabled: cn(CALENDAR_DISABLED, defaultClassNames.disabled),
        hidden: cn(CALENDAR_HIDDEN, defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return <div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />;
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon
                className={cn("vui-icon-plain", CALENDAR_NAV_ICON, className)}
                {...props}
              />
            );
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("vui-icon-plain", CALENDAR_NAV_ICON, className)}
                {...props}
              />
            );
          }

          return (
            <ChevronDownIcon
              className={cn("vui-icon-plain", CALENDAR_NAV_ICON, className)}
              {...props}
            />
          );
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className={CALENDAR_WEEKDAY}>{children}</div>
            </td>
          );
        },
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(CALENDAR_DAY, defaultClassNames.day, className)}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
