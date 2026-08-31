"use client";

import * as React from "react";
import {
  STATUS_FIELD_ICON,
  STATUS_FIELD_ICON_SIZE,
  STATUS_FIELD_MESSAGE,
  STATUS_FIELD_PAD,
  STATUS_FIELD_STATE,
  STATUS_FIELD_TONE,
  STATUS_FIELD_WRAP,
} from "./class-variants";
import { CheckCircle, Info } from "./icons";
import { Tooltip } from "./tooltip";
import { cn } from "./utils";

export type FieldState = "error" | "success";

/**
 * A control whose validation state is an icon inside it, and whose message is a tooltip on that icon.
 *
 * **The house convention, not one page's choice.** A field says what is wrong through the icon and
 * never through helper text under it or a toast. Text under a field pushes the rest of the form down
 * the moment it appears, so a form jumps under the reader's hands exactly when they are trying to
 * fix something. A toast puts the explanation of one field somewhere else on the screen and then
 * removes it on a timer, which asks the reader to remember it.
 *
 * **A tooltip alone would be worse than either**, and this is the part that makes the convention
 * safe: hover reaches neither a keyboard nor a touch screen. So the message is also rendered
 * visually hidden and pointed at by `aria-describedby`, which means a screen reader announces it
 * with the field whether or not anything is hovered, and the tooltip is the sighted-mouse
 * shortcut rather than the only route to it.
 *
 * The control keeps its own `className` and `onChange`: this clones it to add the state, and merges
 * rather than replaces.
 */
export function StatusField({
  state,
  message,
  messageBelow,
  children,
  className,
}: {
  /** Omit for a field with nothing to say. */
  state?: FieldState;
  /** Required whenever `state` is set: a coloured border with no explanation is a dead end. */
  message?: string;
  /**
   * Also print the message under the control, in the state's colour.
   *
   * Off by default, which is the house convention: the icon carries it and the form does not move.
   * On for the case where the message has to be read without being sought, a sign-up form's one
   * blocking field being the usual one, and it is worth the reflow there because the reader has
   * nowhere else to go.
   *
   * Either way the words exist once. With this on, `aria-describedby` points at the visible
   * paragraph rather than at a hidden copy, so nothing is announced twice.
   */
  messageBelow?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const messageId = React.useId();
  // From the slot, never from an icon set directly: `check:icons` enforces that, and the reason is
  // that the set is one thing a buyer can change and a direct import quietly opts out of it.
  const Icon = state === "success" ? CheckCircle : Info;

  const el = React.isValidElement(children)
    ? (children as React.ReactElement<{ className?: string; "aria-describedby"?: string }>)
    : null;

  const control =
    el && state
      ? React.cloneElement(el, {
          className: cn(el.props.className, STATUS_FIELD_STATE[state]),
          // `aria-invalid` only for an error: a valid field is not invalid, and marking it so would
          // have a screen reader announce every green field as a problem.
          ...(state === "error" ? { "aria-invalid": true } : {}),
          // **Joined by hand, not by `cn`.** This is an IDREF list, and `cn` runs through
          // tailwind-merge, whose whole job is to decide that two tokens conflict and drop one.
          // Handing a class-conflict resolver a list of element ids is a category error even where
          // it happens to be harmless today. `undefined` and not `""` when there is nothing to
          // point at: an empty `aria-describedby` is an attribute claiming a description exists.
          "aria-describedby":
            [el.props["aria-describedby"], message ? messageId : undefined]
              .filter(Boolean)
              .join(" ") || undefined,
        })
      : children;

  const field = (
    <div className={cn(STATUS_FIELD_WRAP, state && STATUS_FIELD_PAD, !messageBelow && className)}>
      {control}
      {state && message ? (
        <>
          <Tooltip content={message} className={cn(STATUS_FIELD_ICON, STATUS_FIELD_TONE[state])}>
            <Icon className={STATUS_FIELD_ICON_SIZE} aria-hidden="true" />
          </Tooltip>
          {/* Hidden only when nothing visible carries it: the words exist once either way. */}
          {!messageBelow ? (
            <span id={messageId} className="sr-only">
              {message}
            </span>
          ) : null}
        </>
      ) : null}
    </div>
  );

  if (!messageBelow) return field;

  return (
    <div data-slot="status-field" className={className}>
      {field}
      {state && message ? (
        <p id={messageId} className={cn(STATUS_FIELD_MESSAGE, STATUS_FIELD_TONE[state])}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
