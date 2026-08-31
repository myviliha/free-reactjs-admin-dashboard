import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it } from "vitest";

import { App } from "./src/App";
import { SCREENS } from "./src/screens";

/**
 * Every screen mounts, at its own address, through the real router.
 *
 * **The reason this exists rather than being skipped as "just a demo":** this app is what a buyer
 * looks at to decide whether the parity claim is true. A screen that throws on mount still builds,
 * still deploys, and is only noticed by the person it was meant to convince.
 *
 * It matters more since the framework changed. Next resolved a route from the filesystem and would
 * not build a page whose imports were wrong; `src/screens.ts` is a plain object, so a bad import or a
 * missing provider is a blank screen at runtime and nothing at build time. `routes.test.ts` proves
 * every address has a screen; this proves the screen renders.
 *
 * `App` and not each component on its own, deliberately: the shell, the layout provider and the
 * router are what a screen actually renders inside, and mounting the component bare would pass on a
 * screen that reads a context nobody gave it.
 */
const routes = Object.keys(SCREENS);

it("has routes to mount, so a wrong import here would not pass silently", () => {
  expect(routes.length).toBeGreaterThan(15);
});

for (const route of routes) {
  it(`${route} mounts and paints something`, async () => {
    window.history.pushState({}, "", route);
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);

    // `act` from React itself rather than a testing library: this needs a flush, not a query API, and
    // the flush is the only part a dependency would provide.
    await act(async () => {
      root.render(<App />);
    });

    // Not `toBeTruthy()` on the container: a screen that threw inside a boundary would still leave a
    // node. A real screen paints text, and every one of the nineteen has a heading or a form label.
    expect(host.textContent?.trim().length, `${route} rendered no text`).toBeGreaterThan(20);

    await act(async () => root.unmount());
    host.remove();
  });
}
