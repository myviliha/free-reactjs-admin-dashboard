import { Link } from "react-router";
import * as React from "react";

import {
  AuthField,
  AuthHeading,
  BackLink,
  Button,
  Input,
  OrDivider,
  PasswordInput,
  Remember,
  RULES,
  SocialButtons,
  Submitted,
  useAuth,
} from "./auth-form";

/**
 * Sign up, on the reference's structure.
 *
 * **A minimum length is stated here and not on sign-in**, and the asymmetry is the point: telling
 * somebody a *new* password is too short reveals nothing about any account, while the same message on
 * a sign-in form tells an attacker the password they guessed could not have been this one's.
 *
 * The terms checkbox is a real gate. Theirs renders the same checkbox and the button submits whether
 * it is ticked or not, which makes the consent decorative.
 */
export function SignUpForm() {
  const form = useAuth({
    first: RULES.required("First name"),
    last: RULES.required("Last name"),
    email: RULES.email,
    password: RULES.password,
  });
  const [agreed, setAgreed] = React.useState(false);
  const [nagged, setNagged] = React.useState(false);

  return (
    <>
      <BackLink />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-6">
        <AuthHeading title="Sign Up" lead="Enter your details below to create an account." />

        {form.done ? (
          <Submitted
            title="Account created"
            body="There is no server behind this demo, so this is where the welcome email would go out."
          />
        ) : (
          <>
            <SocialButtons verb="Sign up" />
            <OrDivider />
            <form
              noValidate
              onSubmit={(event) => {
                // The consent gate runs first and independently: an unticked box is not a field
                // error, so it does not belong in the rules table.
                if (!agreed) {
                  event.preventDefault();
                  setNagged(true);
                  return;
                }
                form.submit(event);
              }}
              className="space-y-5"
            >
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <AuthField id="signup-first" label="First Name" error={form.errors.first}>
                  <Input
                    id="signup-first"
                    autoComplete="given-name"
                    placeholder="Ada"
                    value={form.values.first}
                    onChange={(event) => form.set("first")(event.target.value)}
                    required
                  />
                </AuthField>
                <AuthField id="signup-last" label="Last Name" error={form.errors.last}>
                  <Input
                    id="signup-last"
                    autoComplete="family-name"
                    placeholder="Okafor"
                    value={form.values.last}
                    onChange={(event) => form.set("last")(event.target.value)}
                    required
                  />
                </AuthField>
              </div>
              <AuthField id="signup-email" label="Email" error={form.errors.email}>
                <Input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  placeholder="info@gmail.com"
                  value={form.values.email}
                  onChange={(event) => form.set("email")(event.target.value)}
                  required
                />
              </AuthField>
              <AuthField id="signup-password" label="Password" error={form.errors.password}>
                <PasswordInput
                  id="signup-password"
                  autoComplete="new-password"
                  placeholder="At least eight characters"
                  value={form.values.password}
                  onChange={(event) => form.set("password")(event.target.value)}
                  required
                />
              </AuthField>

              <Remember
                checked={agreed}
                onChange={(next) => {
                  setAgreed(next);
                  if (next) setNagged(false);
                }}
                label={
                  <>
                    By creating an account you agree to the{" "}
                    <span className="text-foreground">Terms and Conditions</span> and our{" "}
                    <span className="text-foreground">Privacy Policy</span>.
                  </>
                }
              />
              {nagged ? (
                <p role="alert" className="text-sm text-destructive">
                  Please accept the terms before creating an account.
                </p>
              ) : null}

              <Button type="submit" variant="primary" size="lg" className="w-full">
                Sign Up
              </Button>
            </form>
            <p className="mt-5 text-center text-sm text-muted-foreground sm:text-start">
              Already have an account?{" "}
              <Link to="/signin" className="text-primary underline-offset-2 hover:underline">
                Sign In
              </Link>
            </p>
          </>
        )}
      </div>
    </>
  );
}
