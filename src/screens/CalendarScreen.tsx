import type { DateSelectArg, EventClickArg, EventContentArg, EventInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { TrashIcon } from "@radix-ui/react-icons";
import {
  CALENDAR_LEVEL_RING,
  cn,
  FULLCALENDAR_ADD_LABEL,
  FULLCALENDAR_BASE,
  todayISO,
} from "@viliha/vui-core";
import { Button } from "@viliha/vui-react/button";
import { Card } from "@viliha/vui-react/card";
import { Dialog } from "@viliha/vui-react/dialog";
import { Input } from "@viliha/vui-react/input";
import { Label } from "@viliha/vui-react/label";
import * as React from "react";
import { DateField } from "../date-field";

import { PageHeader } from "../page-shell";

/**
 * The calendar, on FullCalendar as the reference has it.
 *
 * **This is a scheduler, not a date picker.** An earlier note in `PD-058` said the reference's free
 * calendar was the latter and its Pro tier carried the scheduler; reading their repository says
 * otherwise. FullCalendar is in the **free** edition's manifest, in the Next one and the HTML one
 * both, and `calendar.html` renders `<div id="calendar">` with an event modal beside it. So the free
 * tier gets the scheduler, and that correction is the reason this page is a rewrite rather than a
 * restyle.
 *
 * Five packages, all pinned to one major: FullCalendar splits its plugins per view and refuses to
 * run when `core` and a plugin disagree, which the first install did (`core` resolved to 7 and the
 * plugins to 6).
 *
 * Its own DOM is styled from `app/calendar.css`, because there is no `className` to hand a day cell
 * or a toolbar button; that file is their `.fc-*` block with our tokens substituted throughout.
 */
const LEVELS = {
  Danger: "danger",
  Success: "success",
  Primary: "primary",
  Warning: "warning",
} as const;

type Level = keyof typeof LEVELS;

interface CalendarEvent extends EventInput {
  extendedProps: { calendar: Level };
}

/** `YYYY-MM-DD`, which is what both FullCalendar and `<input type="date">` want. */
const day = (offsetDays: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split("T")[0] as string;
};

/**
 * The ring colour per level.
 *
 * A `border-*` rather than a `bg-*`, because the selected swatch is a six-pixel border closing over
 * a pale centre: that is their donut, and drawing it as a border means the centre dot needs no
 * separate colour to sit on.
 */

export default function CalendarScreen() {
  /**
   * The seed events are dated relative to today, and they are the initial state.
   *
   * They were built in an effect: `new Date()` during render is two different instants on the server
   * and in the browser, which is the hydration defect this app was bitten by twice, and the trade was
   * an empty calendar for one frame. There is no server render here, so the frame is not owed.
   */
  const [events, setEvents] = React.useState<CalendarEvent[]>(() => [
    { id: "1", title: "Event Conf.", start: day(0), extendedProps: { calendar: "Danger" } },
    { id: "2", title: "Meeting", start: day(1), extendedProps: { calendar: "Success" } },
    { id: "3", title: "Workshop", start: day(2), end: day(3), extendedProps: { calendar: "Primary" } },
  ]);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<CalendarEvent | null>(null);
  const [title, setTitle] = React.useState("");
  /* Both fields open on today. This was set on mount, so a static export could not bake a build
     date (`PD-159`); with nothing prerendered the clock is read in the initialiser instead. */
  const [start, setStart] = React.useState(todayISO);
  const [end, setEnd] = React.useState(todayISO);
  const [level, setLevel] = React.useState<Level>("Primary");
  /** Errors appear on submit, not while the reader is still typing the first field. */
  const [submitted, setSubmitted] = React.useState(false);

  const reset = () => {
    setEditing(null);
    setTitle("");
    setStart("");
    setEnd("");
    setLevel("Primary");
    setSubmitted(false);
  };

  const openBlank = () => {
    reset();
    setOpen(true);
  };

  const onSelect = (info: DateSelectArg) => {
    reset();
    setStart(info.startStr);
    setEnd(info.endStr || info.startStr);
    setOpen(true);
  };

  const onEventClick = (info: EventClickArg) => {
    const event = info.event;
    setEditing(event as unknown as CalendarEvent);
    setTitle(event.title);
    setStart(event.start?.toISOString().split("T")[0] ?? "");
    setEnd(event.end?.toISOString().split("T")[0] ?? "");
    setLevel((event.extendedProps.calendar as Level) ?? "Primary");
    setOpen(true);
  };

  /**
   * What is wrong with the form, or nothing.
   *
   * **Their version validates nothing at all.** An empty title creates a blank pill on the grid, a
   * missing start date creates an event with no position, and an end before the start is accepted
   * and drawn backwards. Derived rather than stored, so it cannot go stale against the fields it
   * describes, and only shown once the reader has touched the form: an error beside a field nobody
   * has filled in yet is an accusation.
   */
  const errors = {
    title: title.trim() ? undefined : "Give the event a name.",
    end: end && start && end < start ? "The end cannot be before the start." : undefined,
  };
  const valid = !errors.title && !errors.end && Boolean(start);

  const remove = () => {
    if (!editing) return;
    setEvents((current) => current.filter((event) => event.id !== editing.id));
    setOpen(false);
    reset();
  };

  const save = () => {
    setSubmitted(true);
    if (!valid) return;
    const next: CalendarEvent = {
      id: editing?.id ?? String(Date.now()),
      title,
      start,
      end: end || undefined,
      allDay: true,
      extendedProps: { calendar: level },
    };
    setEvents((current) =>
      editing
        ? current.map((event) => (event.id === editing.id ? next : event))
        : [...current, next],
    );
    setOpen(false);
    reset();
  };

  return (
    <>
      <PageHeader title="Calendar" />
      <Card className="overflow-hidden">
        {/* `data-vui-calendar` names the mount for the edition with no framework: the HTML export is
            this markup with React removed, so `vui-calendar.js` finds this element and draws the same
            calendar from the same shared config (`PD-149`). Inert here. */}
        <div className="custom-calendar" data-vui-calendar="">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            {...FULLCALENDAR_BASE}
            events={events}
            select={onSelect}
            eventClick={onEventClick}
            eventContent={renderEvent}
            customButtons={{ addEventButton: { text: FULLCALENDAR_ADD_LABEL, click: openBlank } }}
          />
        </div>
      </Card>

      {/*
        **Their panel, not our default dialog.** The close control is `Dialog`'s own since `PD-079`,
        so it is no longer written here. `Dialog` supplies the behaviour that matters here
        (the overlay, Escape, the focus trap, the scroll lock) and its own look is a bordered
        header/body/footer with tinted bars. Theirs is one soft panel: `rounded-3xl`, `max-w-[700px]`,
        `p-6 lg:p-10`, and no dividers at all. So the parts are not used and the sections are plain
        markup with their spacing; `twMerge` lets the radius and width here win over the defaults.
      */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        label={editing ? "Edit event" : "Add event"}
        className="max-w-[700px] rounded-3xl p-6 lg:p-10"
      >
        <div className="vui-scroll max-h-[80vh] overflow-y-auto px-2">
          <div>
            {/* One title, not two. Theirs reads "Add / Edit Event" in both states, which is the
                better call: the dialog is the same form either way, and a heading that changes under
                you as you click an existing event is a heading you have to re-read. */}
            <h5 className="mb-2 text-xl font-semibold lg:text-2xl">Add / Edit Event</h5>
            <p className="text-sm text-muted-foreground">
              Plan your next big moment: schedule or edit an event to stay on track
            </p>
          </div>

          <div className="mt-8 space-y-6">
            <ModalField
              label="Event Title"
              htmlFor="event-title"
              required
              error={submitted ? errors.title : undefined}
            >
              <Input
                id="event-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Event name"
              />
            </ModalField>

            <fieldset>
              {/*
                A real `fieldset` with a `legend`. Four inputs answering one question are a group,
                and a screen reader only says so if the markup does; theirs uses a loose `label`.
              */}
              <legend className="mb-4 block text-sm font-medium">Event Color</legend>
              <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                {(Object.keys(LEVELS) as Level[]).map((name) => {
                  const active = level === name;
                  return (
                    <label
                      key={name}
                      className="flex cursor-pointer items-center gap-2 text-sm text-foreground/80"
                    >
                      <input
                        type="radio"
                        name="event-level"
                        value={name}
                        checked={active}
                        onChange={() => setLevel(name)}
                        className="peer sr-only"
                      />
                      {/*
                        **The swatch shows the colour it selects.** Theirs is their donut radio in the
                        brand blue for all four, so the one control on the form whose job is to pick a
                        colour is the one that does not show you any. This keeps their mechanic, a
                        thick ring closing over a pale centre, and draws it in the level's own colour:
                        the same interaction, carrying the information it was missing.

                        The ring lives on the swatch because the real input is `sr-only`, and a focus
                        ring on an off-screen element is a focus ring nobody sees.
                      */}
                      <span
                        aria-hidden="true"
                        className={cn(
                          "grid size-5 place-items-center rounded-full border border-border transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
                          /*
                           * **State in CSS, not in a ternary** (`PD-190`). The swatch used to be
                           * styled from `active`, which is React state and therefore resolved once,
                           * at build time, for the exported editions. All four swatches were baked
                           * thick and coloured there, so the one control whose job is to show which
                           * colour you picked showed all of them picked. `peer-checked:` reads the
                           * real input, which every edition has and a static page keeps, so the
                           * control also responds to a click without any script at all.
                           */
                          "peer-checked:border-[6px]",
                          CALENDAR_LEVEL_RING[name],
                        )}
                      >
                        <span
                          className={cn(
                            "size-1.5 rounded-full bg-card opacity-0 transition-opacity peer-checked:opacity-100",
                          )}
                        />
                      </span>
                      {name}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <ModalField
              label="Enter Start Date"
              htmlFor="event-start"
              required
              error={submitted && !start ? "Pick a start date." : undefined}
            >
              <DateField id="event-start" value={start} onChange={setStart} />
            </ModalField>

            <ModalField
              label="Enter End Date"
              htmlFor="event-end"
              error={submitted ? errors.end : undefined}
            >
              {/* `min` greys out every day before the start in the calendar itself, so the
                  impossible choice is not offered rather than being refused after the fact. */}
              <DateField id="event-end" value={end} onChange={setEnd} min={start || undefined} />
            </ModalField>
          </div>

          {/* Full width and stacked below `sm`, as theirs is: two half-width buttons on a phone are
              two buttons nobody can hit. */}
          {/*
            `size="lg"` on all three: it is the size that matches `INPUT`'s height, so the footer
            lines up with the fields above it rather than sitting a few pixels shorter.

            **Delete only exists while editing, and it sits apart from the other two.** Theirs has no
            way to remove an event at all, so a mis-click on the grid leaves a pill on the calendar
            forever. It is on the left with `sm:mr-auto` because a destructive action next to the
            confirm action is a mis-click waiting to happen.

            Nothing here is disabled. A disabled confirm button is a button that will not say why, so
            it stays live and `save` shows the reasons instead.
          */}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {editing ? (
              <Button
                variant="ghost"
                className="w-full text-destructive sm:mr-auto sm:w-auto"
                onClick={remove}
              >
                <TrashIcon />
                Delete Event
              </Button>
            ) : null}
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
            <Button variant="primary" size="lg" className="w-full sm:w-auto" onClick={save}>
              {editing ? "Update Changes" : "Add Event"}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}

/**
 * An event pill: a coloured bar, the time if there is one, then the title.
 *
 * The class carries the level so `calendar.css` can tint it, which is how the reference does it too:
 * FullCalendar gives no other hook for per-event styling that survives its own re-renders.
 */
function renderEvent(info: EventContentArg) {
  const level = String(info.event.extendedProps.calendar ?? "Primary").toLowerCase();
  return (
    <div className={`event-fc-color fc-event-main flex fc-bg-${level}`}>
      <div className="fc-daygrid-event-dot" />
      <div className="fc-event-time">{info.timeText}</div>
      <div className="fc-event-title">{info.event.title}</div>
    </div>
  );
}

/**
 * One stacked field, at the reference's measurements.
 *
 * **Not `Field` from the package.** That one is a two-column grid row, label in column one and
 * control in column two, and its own doc says it must be a direct child of `FieldGrid`. Used loose
 * in a stacked form it lays its label out as a grid cell with no grid, which is what made this form
 * look unorganised. Their form is label above control throughout.
 *
 * Measured from their markup: `mb-1.5` between label and control, `text-sm font-medium` on the
 * label. The error and hint occupy the same line so the form does not jump when one replaces the
 * other, and `aria-describedby` points at whichever is showing.
 */
function ModalField({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  const messageId = `${htmlFor}-message`;
  const message = error ?? hint;
  return (
    <div>
      <Label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-0.5 text-destructive">
            *
          </span>
        ) : null}
      </Label>
      {React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        "aria-invalid": error ? true : undefined,
        "aria-describedby": message ? messageId : undefined,
      })}
      {/* Rendered only when there is something to say. Reserving a blank line under every field
          would keep the form from jumping on a failed submit, but it also adds four rows of height
          the reference does not have, and the rhythm is the thing being matched here. The shift
          happens once, after a submit that was going to be corrected anyway. */}
      {message ? (
        <p
          id={messageId}
          className={cn("mt-1.5 text-xs", error ? "text-destructive" : "text-muted-foreground")}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
