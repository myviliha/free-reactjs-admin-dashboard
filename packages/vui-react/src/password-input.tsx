"use client";

import * as React from "react";
import {
  PASSWORD_INPUT_ASTERISK,
  PASSWORD_INPUT_ERROR_ICON,
  PASSWORD_INPUT_HIDDEN,
  PASSWORD_INPUT_ICON,
  PASSWORD_INPUT_OVERLAY,
  PASSWORD_INPUT_PAD,
  PASSWORD_INPUT_PAD_INVALID,
  PASSWORD_INPUT_ROOT,
  PASSWORD_INPUT_TOGGLE,
  SR_ONLY,
} from "./class-variants";
import {
  Warning as ExclamationTriangleIcon,
  EyeOff as EyeNoneIcon,
  Eye as EyeOpenIcon,
} from "./icons";
import { Input } from "./input";
import { Tooltip } from "./tooltip";
import { cn } from "./utils";

// `process.env.NEXT_PUBLIC_*` is statically inlined by the consumer's bundler
// (Next / Vite) at build; declare its shape so this source type-checks on its
// own (the package ships without @types/node).
declare const process: { env: Record<string, string | undefined> };

// App-wide default mask, from env (inlined at build). `"native"` uses the
// browser's bullet-dot `type="password"` (better autofill) everywhere; anything
// else keeps the asterisk overlay. Override per field with the `mask` prop.
const DEFAULT_MASK: "asterisk" | "native" =
  process.env.NEXT_PUBLIC_PASSWORD_MASK === "native" ? "native" : "asterisk";

export interface PasswordInputProps extends Omit<React.ComponentProps<"input">, "type"> {
  /** Inline validation message: red border + alert-triangle tooltip. Falsy = valid. */
  error?: string;
  /** Character shown for each hidden character in `"asterisk"` mode. Default `"*"`. */
  maskChar?: string;
  /**
   * How the value is hidden. Defaults to `NEXT_PUBLIC_PASSWORD_MASK`
   * (`"native"` app-wide, else `"asterisk"`); this prop overrides it per field.
   *
   * - `"asterisk"` draws `maskChar` over a text input, so it masks with `*`
   *   instead of the browser's bullet dots. Trade-off: it isn't
   *   `type="password"`, so browser / password-manager autofill won't recognise
   *   it and screen readers can read the value.
   * - `"native"` uses a real `type="password"` (bullet dots) that the eye toggle
   *   flips to `type="text"`. Autofill and password managers work normally.
   *   Prefer this when native behaviour matters more than the asterisk look.
   */
  mask?: "asterisk" | "native";
}

/**
 * A password field with a **show/hide eye toggle**. It masks with `*` by
 * default (`mask="asterisk"`, or set `NEXT_PUBLIC_PASSWORD_MASK=native` to make
 * every field use the browser's native bullet-dot field app-wide); the `mask`
 * prop overrides it per field. It's a drop-in for {@link Input}
 * inside a `Field`: spread `useFormFields` `bind(...)` onto it and pass `error`.
 *
 * ```tsx
 * <Field label="Password" htmlFor="password" required>
 *   <PasswordInput id="password" {...f.bind("password")} error={f.errors.password} />
 * </Field>
 *
 * <PasswordInput mask="native" {...f.bind("password")} />   // native bullets + autofill
 * ```
 */
export function PasswordInput({
  className,
  value,
  error,
  maskChar = "*",
  mask = DEFAULT_MASK,
  autoComplete = "current-password",
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = React.useState(false);
  const errorId = React.useId();
  const text = typeof value === "string" ? value : String(value ?? "");
  const invalid = Boolean(error);
  /**
   * **The asterisk mask needs a controlled value, so an uncontrolled field falls back to native.**
   * It works by painting `maskChar` per character over a `text-transparent` input, and the only
   * source for that count is the `value` prop. Without one the overlay draws nothing while the input
   * still goes transparent, so the field looks empty as you type into it: a caret moving across
   * white space. That shipped, and it is the worst possible failure for a password field, because
   * there is nothing on screen to tell you what you typed.
   *
   * Falling back rather than warning: `type="password"` masks correctly with no value prop at all,
   * which is the behaviour the caller plainly wanted. A field that hides its own input is not a
   * defect worth preserving for the sake of one look.
   */
  const asterisk = mask === "asterisk" && value !== undefined;
  // Asterisk mode masks with the overlay while hidden; native mode toggles type.
  const showOverlay = asterisk && !visible;

  return (
    <div className={PASSWORD_INPUT_ROOT}>
      <Input
        {...props}
        type={asterisk ? "text" : visible ? "text" : "password"}
        value={value}
        autoComplete={autoComplete}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? errorId : undefined}
        className={cn(
          invalid ? PASSWORD_INPUT_PAD_INVALID : PASSWORD_INPUT_PAD,
          asterisk && PASSWORD_INPUT_ASTERISK,
          // Hide the real characters behind the asterisk overlay; keep the caret.
          showOverlay && PASSWORD_INPUT_HIDDEN,
          className,
        )}
      />

      {/* Asterisk mask, drawn over the transparent input text. */}
      {showOverlay && (
        <span aria-hidden="true" className={PASSWORD_INPUT_OVERLAY}>
          {maskChar.repeat(text.length)}
        </span>
      )}

      {/* Error icon + tooltip, to the left of the reveal button. */}
      {invalid && (
        <>
          <Tooltip content={error} className={PASSWORD_INPUT_ERROR_ICON}>
            <ExclamationTriangleIcon className={PASSWORD_INPUT_ICON} aria-hidden="true" />
          </Tooltip>
          <span id={errorId} className={SR_ONLY}>
            {error}
          </span>
        </>
      )}

      {/* Reveal toggle. */}
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className={PASSWORD_INPUT_TOGGLE}
      >
        {visible ? (
          <EyeNoneIcon className={PASSWORD_INPUT_ICON} />
        ) : (
          <EyeOpenIcon className={PASSWORD_INPUT_ICON} />
        )}
      </button>
    </div>
  );
}
