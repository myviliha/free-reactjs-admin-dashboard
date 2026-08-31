"use client";

import { cn } from "@viliha/vui-core";
import { Button } from "@viliha/vui-react/button";
import { Checkbox } from "@viliha/vui-react/checkbox";
import { ChevronLeft } from "@viliha/vui-react/icons";
import { Input } from "@viliha/vui-react/input";
import { Label } from "@viliha/vui-react/label";
import { PasswordInput } from "@viliha/vui-react/password-input";
import { StatusField } from "@viliha/vui-react/status-field";
import Link from "next/link";
import * as React from "react";

/**
 * The parts both authentication screens are made of.
 *
 * **The reference's structure, with three things it does not have.** Its two forms are the same
 * markup twice over, roughly 200 lines each, with the social buttons, the divider and the field
 * layout written out both times. Here they are one module, so a change to the divider cannot land on
 * one screen and miss the other.
 *
 * The three additions are validation that runs, a password field that is the library's rather than a
 * hand-rolled eye toggle, and errors that reach a screen reader. Theirs validates nothing: both forms
 * submit whatever is typed, including nothing, and neither `Input` carries `aria-invalid` because
 * there is no state to carry.
 */

/** Good enough to catch a typo, and not pretending to be RFC 5322. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function BackLink() {
  return (
    <div className="mx-auto mb-5 w-full max-w-md sm:pt-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        Back to dashboard
      </Link>
    </div>
  );
}

/**
 * The two federated buttons.
 *
 * **They are `disabled`, and that is the honest state.** There is no OAuth behind this demo, so a
 * live-looking button in the most-pressed position on the page would swallow a click and teach a
 * reader that our controls do nothing. `PD-070` again: `disabled` with a title costs them one hover.
 *
 * **Monograms, not the providers' marks.** Theirs inlines Google's four-colour glyph and the X logo
 * as SVG paths. Those are other companies' trademarks in a template a buyer redistributes, and the
 * paths themselves are files from their repository, which `SD-006` keeps out of ours. A lettered tile
 * says which provider it is without shipping anyone's logo, and a buyer wiring up real OAuth drops
 * their own approved mark in at that point, under the terms that come with it.
 */
const PROVIDERS = [
  { id: "google", label: "Google", mark: "G" },
  { id: "x", label: "X", mark: "X" },
] as const;

export function SocialButtons({ verb }: { verb: string }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
      {PROVIDERS.map((provider) => (
        <button
          key={provider.id}
          type="button"
          disabled
          title={`No ${provider.label} app is configured in this demo`}
          className="inline-flex cursor-not-allowed items-center justify-center gap-3 rounded-lg bg-muted px-7 py-3 text-sm font-medium text-foreground opacity-60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <span
            aria-hidden="true"
            className="grid size-5 shrink-0 place-items-center rounded-full bg-foreground text-[11px] font-semibold text-background"
          >
            {provider.mark}
          </span>
          {verb} with {provider.label}
        </button>
      ))}
    </div>
  );
}

/** Their "Or" divider: a rule with the word sitting on it in the page's own background colour. */
export function OrDivider() {
  return (
    <div className="relative py-3 sm:py-5">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="bg-background p-2 text-muted-foreground sm:px-5 sm:py-2">Or</span>
      </div>
    </div>
  );
}

export function AuthHeading({ title, lead }: { title: string; lead: string }) {
  return (
    <div className="mb-5 sm:mb-8">
      {/* An `h1`: this is the page's only heading, and the shell that would otherwise supply one is
          deliberately absent here. */}
      <h1 className="mb-2 text-2xl font-semibold sm:text-3xl">{title}</h1>
      <p className="text-sm text-muted-foreground">{lead}</p>
    </div>
  );
}

/**
 * A labelled field with its own validation state.
 *
 * `StatusField` carries the state on the control and the message on its icon, which is the house
 * convention (`PD-081`). The asterisk is `aria-hidden` and the requirement is stated with `required`
 * on the input, so the same fact is not announced twice as "star".
 */
export function AuthField({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}{" "}
        <span aria-hidden="true" className="text-destructive">
          *
        </span>
      </Label>
      {/* **`messageBelow`, which is what `StatusField`'s own doc asks for here.** The house default
          is the icon alone, and its docblock names the exception as "the field a reader must not have
          to go looking for, a sign-up form's one blocking field being the usual one". Without it a
          touch or keyboard user gets a red border and no reason: the words exist in a tooltip they
          cannot open and an `sr-only` span they cannot see. */}
      <StatusField state={error ? "error" : undefined} message={error} messageBelow>
        {children}
      </StatusField>
    </div>
  );
}

export interface Field {
  value: string;
  error?: string;
}

/**
 * The smallest form state that still validates: values, errors, and a submit that fills them in.
 *
 * Errors appear **on submit**, not on every keystroke, because telling somebody their email is
 * invalid while they are still on the third character is noise. Once a field has an error, editing it
 * clears it, so the correction is acknowledged immediately.
 */
export function useAuth<K extends string>(
  rules: Record<K, (value: string, all: Record<K, string>) => string | undefined>,
) {
  const keys = Object.keys(rules) as K[];
  const [values, setValues] = React.useState(
    () => Object.fromEntries(keys.map((key) => [key, ""])) as Record<K, string>,
  );
  const [errors, setErrors] = React.useState<Partial<Record<K, string>>>({});
  const [done, setDone] = React.useState(false);

  const set = (key: K) => (value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current));
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const found: Partial<Record<K, string>> = {};
    for (const key of keys) {
      const message = rules[key](values[key], values);
      if (message) found[key] = message;
    }
    setErrors(found);
    if (Object.keys(found).length === 0) setDone(true);
  };

  return { values, errors, set, submit, done };
}

export const RULES = {
  email: (value: string) =>
    !EMAIL.test(value.trim()) ? "Enter a valid email address." : undefined,
  password: (value: string) => (value.length < 8 ? "Use at least eight characters." : undefined),
  required: (name: string) => (value: string) =>
    value.trim() === "" ? `${name} is required.` : undefined,
};

/** The panel that replaces the form once it validates. There is no server here, and it says so. */
export function Submitted({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-success/40 bg-success/10 p-6 text-center">
      <p className="font-semibold text-success">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

export function Remember({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: React.ReactNode;
}) {
  return (
    <label className={cn("flex cursor-pointer items-start gap-3 text-sm")}>
      <Checkbox
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5"
      />
      <span className="text-muted-foreground">{label}</span>
    </label>
  );
}

export { Button, Input, PasswordInput };
