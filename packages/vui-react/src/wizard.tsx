"use client";

import * as React from "react";
import { Button } from "./button";
import {
  WIZARD_BODY,
  WIZARD_BODY_STACK,
  WIZARD_FOOTER,
  WIZARD_HEADER,
  WIZARD_NAV_ICON,
  WIZARD_REVIEW_BODY,
  WIZARD_REVIEW_GROUP,
  WIZARD_REVIEW_HEADER,
  WIZARD_REVIEW_HINT,
  WIZARD_REVIEW_ICON,
  WIZARD_REVIEW_TITLE,
  WIZARD_ROOT,
} from "./class-variants";
import { ArrowLeft as ArrowLeftIcon, ArrowRight as ArrowRightIcon } from "./icons";
import { type Step, Steps } from "./steps";
import { cn } from "./utils";

export type { Step as WizardStep } from "./steps";

// The icon shape is declared once, in `record-field.tsx`. This file had the neutral form first.
import type { IconType } from "./icon-type";

export interface WizardProps {
  /** Named steps ("workflows") — drives the stepper. One entry per step. */
  steps: Step[];
  /** Zero-based index of the active step (you own this state + all logic). */
  current: number;
  /** The active step's body — compose it from {@link WizardSection}s. */
  children: React.ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  /** Footer button contents — pass a node to fully customise (e.g. the final
   *  step's "Create account"). Defaults include Back/Next arrows. */
  backLabel?: React.ReactNode;
  nextLabel?: React.ReactNode;
  backDisabled?: boolean;
  nextDisabled?: boolean;
  /** Replace the whole Back/Next footer. */
  footer?: React.ReactNode;
  /** Hide the footer (e.g. on a success screen). */
  hideFooter?: boolean;
  className?: string;
}

/**
 * A multi-step **wizard scaffold** — the layout only. It renders the stepper
 * (from `steps` + `current`), a scrolling body for the active step, and a
 * Back/Next footer; you own the step index, the field state, and all logic, and
 * you drop your own components inside {@link WizardSection}s. Fields inside a
 * section should use `FieldGrid` / `Field` (`@viliha/vui-react/field-grid`) so they
 * follow the two-column design standard.
 *
 * ```tsx
 * <Wizard steps={STEPS} current={step}
 *   onBack={() => setStep((s) => s - 1)}
 *   onNext={() => (last ? submit() : setStep((s) => s + 1))}
 *   backDisabled={step === 0}
 *   nextLabel={last ? "Create account" : undefined}
 * >
 *   <WizardSection title="Basic Information" icon={Building}>
 *     <FieldGrid>
 *       <Field label="Name" htmlFor="name" required>
 *         <Input id="name" value={name} onChange={…} />
 *       </Field>
 *     </FieldGrid>
 *   </WizardSection>
 * </Wizard>
 * ```
 */
export function Wizard({
  steps,
  current,
  children,
  onBack,
  onNext,
  backLabel,
  nextLabel,
  backDisabled,
  nextDisabled,
  footer,
  hideFooter,
  className,
}: WizardProps) {
  return (
    <div className={cn(WIZARD_ROOT, className)}>
      {/* Stepper — fixed at the top. */}
      <div className={WIZARD_HEADER}>
        <Steps steps={steps} current={current} />
      </div>

      {/* Active step body — the only scrolling region. */}
      <div className={WIZARD_BODY}>
        <div className={WIZARD_BODY_STACK}>{children}</div>
      </div>

      {!hideFooter &&
        (footer ?? (
          <div className={WIZARD_FOOTER}>
            <Button onClick={onBack} disabled={backDisabled}>
              {backLabel ?? (
                <>
                  <ArrowLeftIcon className={WIZARD_NAV_ICON} />
                  Back
                </>
              )}
            </Button>
            <Button variant="primary" onClick={onNext} disabled={nextDisabled}>
              {nextLabel ?? (
                <>
                  Next
                  <ArrowRightIcon className={WIZARD_NAV_ICON} />
                </>
              )}
            </Button>
          </div>
        ))}
    </div>
  );
}

/**
 * A bordered section inside a wizard step — an optional muted header
 * (title + icon + description) over a padded body. Put one or many per step;
 * fill the body with `FieldGrid` / `Field` rows or any content.
 */
export function WizardSection({
  title,
  description,
  icon: Icon,
  className,
  children,
}: {
  title?: string;
  description?: string;
  icon?: IconType;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn(WIZARD_REVIEW_GROUP, className)}>
      {title && (
        <div className={WIZARD_REVIEW_HEADER}>
          <h3 className={WIZARD_REVIEW_TITLE}>
            {Icon && <Icon className={WIZARD_REVIEW_ICON} />}
            {title}
          </h3>
          {description && <p className={WIZARD_REVIEW_HINT}>{description}</p>}
        </div>
      )}
      <div className={WIZARD_REVIEW_BODY}>{children}</div>
    </section>
  );
}
