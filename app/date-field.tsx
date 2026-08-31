"use client";

import { CalendarIcon } from "@radix-ui/react-icons";
import {
  cn,
  formatDayFirst as format,
  fromISODate,
  INPUT,
  isoToDayFirst,
  maskDayFirst,
  PICKER_ACTION,
  PICKER_ACTION_MUTED,
  PICKER_ACTION_PRIMARY,
  PICKER_FOOTER,
  toISODate,
} from "@viliha/vui-core";
import { Calendar } from "@viliha/vui-react/calendar";
import { Dropdown } from "@viliha/vui-react/dropdown-menu";
import * as React from "react";

// Re-exported: `calendar/page.tsx` reads it from here, and it now lives in the shared package so the
// Vue edition's date field speaks the same ISO on the wire (`PD-135`).
export { toISODate };

/**
 * A date field: our calendar in a popover, not a native `<input type="date">`.
 *
 * **Why not the native input, which is what the reference uses.** Two reasons, and they are the same
 * reason twice. Its picker panel cannot be styled at all, so the one surface a buyer cannot rebrand
 * would be the panel that opens out of their own form; the reference lives with a Chrome-grey
 * calendar in the middle of an otherwise designed product. And its `::-webkit-calendar-picker-
 * indicator` sits inline after the value rather than at the field's edge, which is why theirs hides
 * it with `display: none` and draws a second icon absolutely positioned on the right. Two icons, one
 * of them invisible, to place one glyph.
 *
 * So: a button that looks like a field, our `Calendar` inside a popover, and one icon that is real.
 * **The whole field opens it**, not just the icon, which is the thing a native date input gets wrong
 * and nobody expects.
 *
 * `INPUT` from the token layer rather than a copy of its classes, so this field is exactly as tall
 * as the text inputs beside it and follows them if the scale moves again (`PD-075`).
 */

/** `dd/mm/yyyy`, which is the format their placeholder promises. */

/** `YYYY-MM-DD` in local time. `toISOString` would shift the day for anyone east or west of UTC. */

/** Parse `YYYY-MM-DD` back, without letting the string be read as UTC midnight. */

export function DateField({
  id,
  value,
  onChange,
  min,
  "aria-invalid": invalid,
  "aria-describedby": describedBy,
}: {
  id: string;
  /** `YYYY-MM-DD`, or empty. The same shape a native date input gives, so callers are unchanged. */
  value: string;
  onChange: (value: string) => void;
  /** Earliest selectable date, as `YYYY-MM-DD`. */
  min?: string;
  /**
   * The standard ARIA props, spelled as ARIA spells them.
   *
   * A field wrapper wires validation by cloning its child with `aria-invalid` and
   * `aria-describedby`, so accepting those exact names means this control drops into the same
   * wrapper as an `Input` with nothing special written for it. Named `invalid`/`describedBy` they
   * would have been silently discarded, which is the worst kind of wrong: the markup looks wired
   * and announces nothing.
   */
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}) {
  const selected = value ? fromISODate(value) : undefined;
  const minDate = min ? fromISODate(min) : undefined;

  /**
   * What the input shows while it is being typed.
   *
   * Local, because a half-typed date is not a date: `07/03/20` has no ISO value to hand upward, and
   * pushing every keystroke through the parent would empty the field on the second character. The
   * effect below is the other direction, for when the calendar, Clear or Today set the value.
   */
  const [text, setText] = React.useState(() => isoToDayFirst(value));
  const [typedInvalid, setTypedInvalid] = React.useState(false);
  React.useEffect(() => {
    setText(isoToDayFirst(value));
    setTypedInvalid(false);
  }, [value]);

  function onType(event: React.ChangeEvent<HTMLInputElement>) {
    const masked = maskDayFirst(event.target.value);
    setText(masked.text);
    setTypedInvalid(masked.invalid);
    if (masked.iso) onChange(masked.iso);
    else if (masked.text === "") onChange("");
  }

  return (
    /*
     * Two ways in, which is the point (`PD-159`).
     *
     * **A picker alone is the wrong control for a date of birth**: reaching 1987 from a month grid is
     * dozens of clicks, and everyone already knows how to type it. So the field is a real text input
     * with a card-expiry mask, and the calendar is a button at its trailing edge.
     *
     * The `id` is on the visible input now. It used to sit on a hidden one beside a button, because a
     * button carries no value and a label cannot point at it; an input needs neither trick, and the
     * label now points at the thing a reader actually types into.
     */
    <div className="relative">
      <input
        id={id}
        type="text"
        // `numeric` rather than `tel`: the phone keypad is the right set of keys and the wrong
        // semantics, and `numeric` gets the same pad without claiming this is a phone number.
        inputMode="numeric"
        autoComplete="off"
        placeholder="dd/mm/yyyy"
        value={text}
        onChange={onType}
        aria-invalid={invalid || typedInvalid || undefined}
        aria-describedby={describedBy}
        className={cn(INPUT, "pr-12", (invalid || typedInvalid) && "border-destructive")}
      />
      {/* The calendar, at the trailing edge, inside the field rather than beside it. */}
      <span className="absolute inset-y-0 right-0 flex items-center pr-1.5">
        <Dropdown
          label=""
          ariaLabel={selected ? `Change date, currently ${format(selected)}` : "Choose a date"}
          align="end"
          staticId={`menu-${id}`}
          bare
          panelClassName="p-0"
          triggerClassName="flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          trigger={<CalendarIcon aria-hidden="true" className="size-5 shrink-0" />}
        >
          {(close) => (
            <div>
              <Calendar
                mode="single"
                selected={selected}
                // Opens on the month holding the value, or on this month when there is none, which is
                // what `DayPicker` does with no `defaultMonth` at all.
                defaultMonth={selected ?? minDate}
                disabled={minDate ? { before: minDate } : undefined}
                onSelect={(date) => {
                  // A date is one choice, so the panel closes on it. A range needs two and stays open,
                  // which is why `date-range.tsx` does not do this.
                  if (!date) return;
                  onChange(toISODate(date));
                  close();
                }}
              />
              {/*
            **Clear and Today**, which the native picker offers and a hand-rolled one usually forgets.
            They are the two things a reader wants that the grid cannot express: "no date" is not a
            cell, and "the day I mean is today" is a cell you have to go and find when the value has
            wandered off to another month.

            Clear is disabled with nothing to clear rather than hidden, because a control that appears
            and disappears under the cursor is worse than one that is plainly unavailable.
          */}
              <div className={PICKER_FOOTER}>
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    close();
                  }}
                  disabled={!value}
                  // Inert in React, which has the handler beside it. The static edition's picker script
                  // reads this rather than matching on the word "Clear" (`PD-158`).
                  data-vui-date-action="clear"
                  className={cn(PICKER_ACTION, PICKER_ACTION_MUTED)}
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    // Respect `min`: on the end-date field, "today" before the start is not a date this
                    // field may hold, and silently accepting it would make the form invalid on submit.
                    if (minDate && today < minDate) return;
                    onChange(toISODate(today));
                    close();
                  }}
                  data-vui-date-action="today"
                  className={cn(PICKER_ACTION, PICKER_ACTION_PRIMARY)}
                >
                  Today
                </button>
              </div>
            </div>
          )}
        </Dropdown>
      </span>
    </div>
  );
}
