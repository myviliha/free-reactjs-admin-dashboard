import * as React from "react";
import {
  STEPS_CHECK_ICON,
  STEPS_CONNECTOR_BASE,
  STEPS_CONNECTOR_STATES,
  STEPS_DESCRIPTION,
  STEPS_ITEM,
  STEPS_LABEL_BASE,
  STEPS_LABEL_GROUP,
  STEPS_LABEL_STATES,
  STEPS_MARKER_BASE,
  STEPS_MARKER_STATES,
  STEPS_ROOT,
} from "./class-variants";
import { Check as CheckIcon } from "./icons";
import { cn } from "./utils";

export type Step = {
  /** Short title shown under the marker. */
  label: string;
  /** Optional secondary line under the label. */
  description?: string;
};

/**
 * A horizontal, numbered step indicator for multi-step forms / wizards.
 * Presentational and controlled: pass the steps and the current index. Completed
 * steps fill with the brand primary and a check; the current step is ringed;
 * upcoming steps are muted. All color comes from theme tokens.
 *
 * ```tsx
 * <Steps
 *   current={step}
 *   steps={[
 *     { label: "Organization", description: "Business details" },
 *     { label: "Account", description: "Your credentials" },
 *     { label: "Review", description: "Confirm details" },
 *   ]}
 * />
 * ```
 */
export function Steps({
  steps,
  current,
  className,
}: {
  steps: Step[];
  /** Zero-based index of the active step. */
  current: number;
  className?: string;
}) {
  return (
    <ol className={cn(STEPS_ROOT, className)} aria-label={`Step ${current + 1} of ${steps.length}`}>
      {steps.map((step, i) => {
        const state = i < current ? "complete" : i === current ? "current" : "upcoming";
        const isLast = i === steps.length - 1;
        return (
          <React.Fragment key={step.label}>
            <li className={STEPS_ITEM} aria-current={state === "current" ? "step" : undefined}>
              <span
                className={cn(
                  STEPS_MARKER_BASE,
                  state === "complete" && STEPS_MARKER_STATES.complete,
                  state === "current" && STEPS_MARKER_STATES.current,
                  state === "upcoming" && STEPS_MARKER_STATES.upcoming,
                )}
              >
                {state === "complete" ? <CheckIcon className={STEPS_CHECK_ICON} /> : i + 1}
              </span>
              <span className={STEPS_LABEL_GROUP}>
                <span className={cn(STEPS_LABEL_BASE, STEPS_LABEL_STATES[state])}>
                  {step.label}
                </span>
                {step.description && <span className={STEPS_DESCRIPTION}>{step.description}</span>}
              </span>
            </li>
            {!isLast && (
              <span
                aria-hidden="true"
                className={cn(
                  STEPS_CONNECTOR_BASE,
                  i < current ? STEPS_CONNECTOR_STATES.done : STEPS_CONNECTOR_STATES.todo,
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </ol>
  );
}
