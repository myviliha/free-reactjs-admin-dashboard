"use client";

import Link from "next/link";
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
} from "../auth-form";

/**
 * Sign in, on the reference's structure and with validation it does not have.
 *
 * **The password rule here is deliberately not a length check**, unlike the sign-up screen's. Telling
 * somebody their password is too short on a *sign-in* form tells an attacker that the password they
 * guessed cannot have been this account's, which narrows the search for free. "Enter your password" is
 * all this screen may say, and the strength rule belongs where the password is chosen.
 */
export function SignInForm() {
  const form = useAuth({
    email: RULES.email,
    password: RULES.required("Password"),
  });
  const [remember, setRemember] = React.useState(false);

  return (
    <>
      <BackLink />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <AuthHeading title="Sign In" lead="Enter your email and password to sign in." />

        {form.done ? (
          <Submitted
            title="Signed in"
            body="There is no server behind this demo, so this is where a real session would start."
          />
        ) : (
          <>
            <SocialButtons verb="Sign in" />
            <OrDivider />
            {/* `noValidate`: the browser's own bubble competes with the field's inline state, and two
                error affordances for one field is worse than either alone. */}
            <form noValidate onSubmit={form.submit} className="space-y-6">
              <AuthField id="signin-email" label="Email" error={form.errors.email}>
                <Input
                  id="signin-email"
                  type="email"
                  autoComplete="email"
                  placeholder="info@gmail.com"
                  value={form.values.email}
                  onChange={(event) => form.set("email")(event.target.value)}
                  required
                />
              </AuthField>
              <AuthField id="signin-password" label="Password" error={form.errors.password}>
                <PasswordInput
                  id="signin-password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={form.values.password}
                  onChange={(event) => form.set("password")(event.target.value)}
                  required
                />
              </AuthField>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Remember checked={remember} onChange={setRemember} label="Keep me logged in" />
                {/* **Not a link, because there is nowhere for it to go.** The reference points at
                    `/reset-password`, which this demo does not ship, and it pointed at `/signup`
                    here: a visitor who has forgotten their password landing on a blank Sign Up form
                    is worse than a label that admits the screen is not built. */}
                <span
                  title="Password reset is not part of the free demo"
                  className="cursor-not-allowed text-sm text-muted-foreground"
                >
                  Forgot password?
                </span>
              </div>
              <Button type="submit" variant="primary" size="lg" className="w-full">
                Sign In
              </Button>
            </form>
            <p className="mt-5 text-center text-sm text-muted-foreground sm:text-start">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-primary underline-offset-2 hover:underline">
                Sign Up
              </Link>
            </p>
          </>
        )}
      </div>
    </>
  );
}
