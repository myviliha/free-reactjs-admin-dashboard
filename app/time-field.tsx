"use client";

import { ClockIcon } from "@radix-ui/react-icons";
import {
  cn,
  INPUT,
  maskTime,
  PICKER_ACTION,
  PICKER_ACTION_MUTED,
  PICKER_ACTION_PRIMARY,
  PICKER_FOOTER,
  partsToValue,
  TIME_COLUMN,
  TIME_HOURS,
  TIME_MERIDIEM,
  TIME_MINUTES,
  TIME_OPTION,
  TIME_OPTION_ACTIVE,
  TIME_PANEL,
  timeParts,
  toDisplayTime,
} from "@viliha/vui-core";
import { Dropdown } from "@viliha/vui-react/dropdown-menu";
import * as React from "react";

/**
 * A time field: our own panel behind a typed input, not `<input type="time">` (`PD-160`).
 *
 * **This page used to render the native control, and said so deliberately**: "a time is two numbers
 * with no calendar to theme, so the platform's own control is better than anything worth building
 * here." That reasoning does not survive being looked at. The browser's clock glyph sits inside the
 * field on its own terms, its panel arrives in the operating system's colours, and it lands directly
 * beside a date field that is entirely ours. In a theme sold on every surface being rebrandable, the
 * one control a buyer cannot restyle is the one that stands out.
 *
 * The shape is the date field's, deliberately, because two pickers on one page teaching two
 * conventions is worse than either convention: a real text input with a mask, an icon button at the
 * trailing edge, and a panel where filled means chosen.
 *
 * `HH:mm` on the wire and 12-hour on screen, which is the same split the date field makes between ISO
 * and `dd/mm/yyyy`. A 24-hour value sorts and reaches a server without anyone parsing "PM".
 */
/**
 * The three columns, and the reason they are their own component.
 *
 * **Each column scrolls its chosen row to the same line**, so the hour, the minute and the meridiem
 * read across as one time rather than three lookups. Without it every column sat where it happened
 * to be: `02`, `00` and `PM` chosen and none of them level with the others.
 *
 * The first option's own offset is the column's padding, so the maths needs no magic number and
 * survives that padding changing. It runs on mount, which is when the panel opens, because
 * `Dropdown` renders nothing until then.
 */
function TimeColumns({
  parts,
  onChoose,
  onOpen,
}: {
  parts: { hour: string; minute: string; meridiem: string };
  onChoose: (next: Partial<{ hour: string; minute: string; meridiem: string }>) => void;
  onOpen: () => void;
}) {
  const box = React.useRef<HTMLDivElement>(null);
  // Mount is open, because `Dropdown` renders nothing until then.
  // biome-ignore lint/correctness/useExhaustiveDependencies: on mount only, which is the open event
  React.useEffect(() => onOpen(), []);
  React.useEffect(() => {
    for (const column of box.current?.querySelectorAll<HTMLElement>('[role="listbox"]') ?? []) {
      const chosen = column.querySelector<HTMLElement>('[aria-selected="true"]');
      const first = column.querySelector<HTMLElement>('[role="option"]');
      if (chosen && first) column.scrollTop = chosen.offsetTop - first.offsetTop;
    }
  }, [parts.hour, parts.minute, parts.meridiem]);

  return (
    <div ref={box} className={TIME_PANEL}>
      {(
        [
          ["hour", TIME_HOURS, parts.hour],
          ["minute", TIME_MINUTES, parts.minute],
          ["meridiem", TIME_MERIDIEM, parts.meridiem],
        ] as const
      ).map(([part, options, active]) => (
        <div key={part} className={TIME_COLUMN} role="listbox" aria-label={part}>
          {options.map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={option === active}
              data-vui-time={part}
              data-vui-time-value={option}
              onClick={() => onChoose({ [part]: option })}
              className={cn(TIME_OPTION, option === active && TIME_OPTION_ACTIVE)}
            >
              {option}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

export function TimeField({
  id,
  value,
  onChange,
  "aria-invalid": invalid,
  "aria-describedby": describedBy,
}: {
  id: string;
  /** `HH:mm`, 24-hour, or empty. */
  value: string;
  onChange: (value: string) => void;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}) {
  const [text, setText] = React.useState(() => toDisplayTime(value));
  const [typedInvalid, setTypedInvalid] = React.useState(false);
  React.useEffect(() => {
    setText(toDisplayTime(value));
    setTypedInvalid(false);
  }, [value]);

  const parts = timeParts(value);

  /**
   * What the columns are showing, before it is committed (`PD-163`).
   *
   * **Every column click used to write straight to the field**, so choosing an hour set a time nobody
   * had finished picking and the minute they wanted next arrived as a second edit. Scrolling three
   * columns is one decision, so it gets one confirmation: the draft moves as they scroll and `Set`
   * is what makes it the value.
   *
   * Seeded from the field, and re-seeded whenever the field changes, so opening the panel a second
   * time starts from what is actually there rather than from an abandoned draft.
   */
  const [draft, setDraft] = React.useState(parts);
  React.useEffect(() => setDraft(timeParts(value)), [value]);

  /**
   * A draft that was never confirmed does not survive the panel closing.
   *
   * **Re-seeding on `value` alone was not enough**, and driving it is what showed that: picking an
   * hour, pressing Escape and reopening showed the abandoned pick rather than the time still in the
   * field, because closing without `Set` changes no value and so fired no effect. The panel's own
   * mount is the event that matters, and `Dropdown` renders its children only while open, so this
   * runs exactly when the panel appears.
   */
  const reseed = React.useCallback(() => setDraft(timeParts(value)), [value]);

  function onType(event: React.ChangeEvent<HTMLInputElement>) {
    const masked = maskTime(event.target.value);
    setText(masked.text);
    setTypedInvalid(masked.invalid);
    if (masked.value) onChange(masked.value);
    else if (masked.text === "") onChange("");
  }

  /** Choosing one column keeps the other two. Nothing reaches the field until `Set`. */
  const choose = (next: Partial<{ hour: string; minute: string; meridiem: string }>) =>
    setDraft((current) => ({
      hour: next.hour ?? current.hour ?? "12",
      minute: next.minute ?? current.minute ?? "00",
      meridiem: next.meridiem ?? current.meridiem ?? "AM",
    }));

  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="hh:mm AM"
        value={text}
        onChange={onType}
        aria-invalid={invalid || typedInvalid || undefined}
        aria-describedby={describedBy}
        className={cn(INPUT, "pr-12", (invalid || typedInvalid) && "border-destructive")}
      />
      <span className="absolute inset-y-0 right-0 flex items-center pr-1.5">
        <Dropdown
          label=""
          ariaLabel={value ? `Change time, currently ${toDisplayTime(value)}` : "Choose a time"}
          align="end"
          staticId={`menu-${id}`}
          bare
          panelClassName="p-0"
          triggerClassName="flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          trigger={<ClockIcon aria-hidden="true" className="size-5 shrink-0" />}
        >
          {(close) => (
            <div>
              <TimeColumns parts={draft} onChoose={choose} onOpen={reseed} />
              {/*
                **Clear and Set**, and the reason the panel needed them.

                Three columns is one decision made in three moves, so writing the field on every move
                means a reader watches it change into times they never meant. `Set` is the moment they
                are finished; `Clear` is disabled with nothing to clear, rather than hidden, because a
                control that appears and disappears under the cursor is worse than one plainly
                unavailable. The date field's footer reads the same way for the same reason.
              */}
              <div className={PICKER_FOOTER}>
                <button
                  type="button"
                  disabled={!value}
                  data-vui-time-action="clear"
                  onClick={() => {
                    onChange("");
                    close();
                  }}
                  className={cn(PICKER_ACTION, PICKER_ACTION_MUTED)}
                >
                  Clear
                </button>
                <button
                  type="button"
                  data-vui-time-action="set"
                  onClick={() => {
                    onChange(
                      partsToValue(
                        draft.hour || "12",
                        draft.minute || "00",
                        draft.meridiem || "AM",
                      ),
                    );
                    close();
                  }}
                  className={cn(PICKER_ACTION, PICKER_ACTION_PRIMARY)}
                >
                  Set
                </button>
              </div>
            </div>
          )}
        </Dropdown>
      </span>
    </div>
  );
}
