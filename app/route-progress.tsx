"use client";

import { ROUTE_PROGRESS_BAR, ROUTE_PROGRESS_TRACK } from "@viliha/vui-core";
import { usePathname } from "next/navigation";
import * as React from "react";

/**
 * The bar that says a navigation is happening (`PD-125`).
 *
 * **Neither edition had one**, which the dev noticed on 2026-08-26: a click on a sidebar row produced
 * nothing at all until the next screen appeared, and on a slow connection that is indistinguishable
 * from a dead control. The track, the bar and both keyframes live in `theme.css` and
 * `class-variants.ts`, so every edition draws the same thing; only the wiring differs, because only
 * the router does.
 *
 * **`usePathname`, not router events.** The App Router has no navigation events to subscribe to, and
 * `useLinkStatus` would have to be threaded through every link in the app to cover the sidebar, the
 * flyouts, the account menu and the breadcrumb. The pathname changing is the one signal every one of
 * those produces, and it is the same signal the Vue edition watches, so the two behave alike by
 * construction rather than by two authors agreeing.
 *
 * The first render is skipped: arriving on a page is not navigating to it, and a bar that runs on load
 * trains the reader to ignore it.
 */
export function RouteProgress() {
  const pathname = usePathname();
  const first = React.useRef(true);
  const frame = React.useRef(0);
  const [run, setRun] = React.useState(0);
  const [phase, setPhase] = React.useState<"idle" | "running" | "done">("idle");

  React.useEffect(() => {
    // Arriving on a page is not navigating to it, and a bar that runs on load trains the reader to
    // ignore it.
    if (first.current) {
      first.current = false;
      return;
    }
    setRun((n) => n + 1);
    setPhase("running");
    // Two frames, so the browser has painted the new screen before the bar claims it is finished.
    frame.current = requestAnimationFrame(() => {
      frame.current = requestAnimationFrame(() => setPhase("done"));
    });
    return () => cancelAnimationFrame(frame.current);
  }, [pathname]);

  if (phase === "idle") return null;
  return (
    // `aria-hidden` and no `role="progressbar"`. A progress role owes a value and this has none to
    // give: it is a hint that the page is changing, not a measurement, and the new screen announces
    // itself when it arrives.
    <div className={ROUTE_PROGRESS_TRACK} aria-hidden="true">
      <div
        // A CSS animation cannot be restarted by changing its properties, so the element is replaced.
        key={`${run}-${phase}`}
        className={ROUTE_PROGRESS_BAR}
        style={{
          animation:
            phase === "running"
              ? "vui-route-progress 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards"
              : "vui-route-progress-done 320ms ease-out forwards",
        }}
        onAnimationEnd={() => phase === "done" && setPhase("idle")}
      />
    </div>
  );
}
