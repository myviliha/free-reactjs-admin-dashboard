import * as React from "react";
import { BrowserRouter, Outlet, Route, Routes, useLocation } from "react-router";

import { AuthLayout } from "./auth-layout";
import { LayoutProvider } from "./layout-context";
import { RouteProgress } from "./route-progress";
import { SCREENS, type Screen, titleOf } from "./screens";
import NotFoundScreen from "./screens/NotFoundScreen";
import { Shell } from "./shell";

/**
 * The root: pick a screen, and decide what furniture it renders inside.
 *
 * **The three layouts are layout routes, not wrappers per screen, and that is load-bearing.**
 * `AppShell` holds the collapse state and which submenu is open; rendering `<Shell>` inside each
 * element would remount it on every navigation, so a reader who opened "UI Elements" and clicked
 * Alerts would watch the group they were reading from close itself. Next kept these in
 * `app/(shell)/layout.tsx` and `app/(auth)/layout.tsx`, and `<Outlet />` is the equivalent.
 *
 * `LayoutProvider` sits above the routes rather than inside the shell, so the layout a reader picks
 * on `/layouts` survives a navigation. The `(shell)` route group gave it the same lifetime.
 */
function ShellLayout() {
  return (
    <Shell>
      <Outlet />
    </Shell>
  );
}

function AuthRoutes() {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  );
}

/**
 * The document title, which was a `metadata` export beside each page under Next.
 *
 * One effect keyed on the address rather than a `useEffect` in nineteen screens: the title is a
 * property of the route, and `SCREENS` is where the routes are.
 */
function Title() {
  const { pathname } = useLocation();

  React.useEffect(() => {
    document.title = titleOf(SCREENS[pathname]?.title);
  }, [pathname]);

  return null;
}

const routesFor = (chrome: Screen["chrome"]) =>
  Object.entries(SCREENS)
    .filter(([, screen]) => screen.chrome === chrome)
    .map(([path, { component: Screen }]) => <Route key={path} path={path} element={<Screen />} />);

export function App() {
  return (
    <BrowserRouter>
      <Title />
      <RouteProgress />
      <LayoutProvider>
        <Routes>
          <Route element={<ShellLayout />}>{routesFor("shell")}</Route>
          <Route element={<AuthRoutes />}>{routesFor("auth")}</Route>
          {routesFor("none")}
          {/* Whatever the app cannot match. The same screen `/error-404` links to on purpose, from
              the same file: `not-found.tsx` was Next's name for exactly this. */}
          <Route path="*" element={<NotFoundScreen />} />
        </Routes>
      </LayoutProvider>
    </BrowserRouter>
  );
}
