"use client";

import * as React from "react";

/**
 * Render every floating panel below this open and **in flow**, with no measuring and no portal.
 *
 * **This exists because a floating panel cannot be server-rendered at all.** `Dropdown` and `Select`
 * both gate their panel on `open`, on a position computed in a layout effect, and on
 * `typeof document !== "undefined"`, and then portal it. All four are false or absent during a static
 * export, so the HTML edition shipped 114 controls announcing a popup with nothing behind it
 * (`PD-158`).
 *
 * The static edition's build route turns this on and renders the panels once, so its emitter has real
 * markup to place. Every other consumer leaves it off and is completely unaffected.
 *
 * **In flow rather than fixed is the point, not a compromise.** Each component's wrapper is already
 * `relative`, so an absolutely positioned panel inside it is anchored to its trigger by CSS alone.
 * That is what lets the static edition drop the measurement entirely instead of reimplementing
 * `anchorPosition` in a script, and it is correct in every browser rather than only where CSS anchor
 * positioning has landed.
 *
 * **Its own module, rather than living beside one of the components that reads it.** It began in
 * `dropdown-menu.tsx`, which meant `select.tsx` had to import that file and drag `Checkbox` into the
 * graph of anyone importing only `@viliha/vui-react/select`. A shared context belongs to neither of its
 * consumers.
 */
export const StaticOverlays = React.createContext(false);
