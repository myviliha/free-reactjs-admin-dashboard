"use client";

import * as React from "react";

/**
 * Provider-agnostic auth contract.
 *
 * The library ships auth *screens* (sign in / up, forgot / reset, verify) but
 * deliberately NOT an auth engine — that would force a provider (NextAuth,
 * Clerk, Better Auth, Supabase, …) and its backend on every consumer. Instead,
 * screens depend on this small contract, and you supply an adapter that
 * implements it for whatever provider you use. Swapping providers is one adapter
 * file; the screens never change.
 *
 * Wrap your app once:
 *
 * ```tsx
 * <AuthProvider value={myAdapter}>{children}</AuthProvider>
 * ```
 *
 * and read it anywhere:
 *
 * ```tsx
 * const { user, status, signIn, signOut } = useAuth();
 * ```
 *
 * `apps/web/reactjs` ships a reference Better Auth adapter (with a mock fallback
 * for the static demo) — see the docs `/docs/auth`.
 */

/** Coarse session state. `loading` covers the initial "am I signed in?" check. */
/**
 * The contract moved to `auth-contract.ts` on 2026-08-20, so an adapter type-checks against either
 * edition. **This edition's API is unchanged**: every type is re-exported here.
 */
export type {
  AuthContract,
  AuthStatus,
  AuthUser,
  Credentials,
  SignUpInput,
} from "./auth-contract";

import type { AuthContract } from "./auth-contract";

const AuthContext = React.createContext<AuthContract | null>(null);

export function AuthProvider({
  value,
  children,
}: {
  value: AuthContract;
  children: React.ReactNode;
}) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Read the auth contract. Throws if no `<AuthProvider>` is above it, so a
 *  missing adapter fails loudly at dev time instead of silently no-op'ing. */
export function useAuth(): AuthContract {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error(
      "useAuth must be used within <AuthProvider>. Wrap your app and pass an " +
        "adapter that implements AuthContract (see docs /docs/auth).",
    );
  }
  return ctx;
}
