"use client";

import { DEMOGRAPHIC_MAP_HOST } from "@viliha/vui-core";

import "jsvectormap/dist/jsvectormap.css";

import { useEffect, useRef } from "react";

/**
 * The customers-by-country map.
 *
 * **`jsvectormap` directly, not `@react-jvectormap`.** The React wrapper the reference uses peers on
 * React 16 to 18 and on **jQuery**, and was last published in 2022; this app is React 19, so
 * installing it would mean a peer conflict and jQuery in a free download. `jsvectormap` itself has
 * **zero dependencies**, was published this year, and the wrapper it needs is the few lines below.
 *
 * **The library is imported inside the effect, not at the top of the file, and the build is what
 * taught me that.** `"use client"` does not stop a module being *evaluated* during server rendering,
 * and `jsvectormap/dist/maps/world-merc.js` touches `window` the moment it loads: a static export
 * died with `ReferenceError: window is not defined` at module evaluation. A dynamic import inside the
 * effect runs only in the browser, and it keeps this component importable from a server component,
 * which `next/dynamic` with `ssr: false` would not.
 *
 * The map is **destroyed in the cleanup**, which is not optional: React 19 runs effects twice in
 * development, so without the teardown the first map stays in the DOM under the second and every
 * hover fires two handlers.
 */
/**
 * Four markers, and **no labels**.
 *
 * The reference draws dots only: a label on a 200px-tall map either collides with its neighbour or
 * gets clipped by the panel, and every figure the map carries is spelled out in the list beneath it
 * anyway. `name` is kept because jsvectormap uses it for the marker's own tooltip, which is the one
 * place the text has room.
 */
const MARKERS: { name: string; coords: [number, number] }[] = [
  // Their four, verbatim from `CountryMap.tsx`. Worth knowing: the fourth is **named** Sweden in
  // their source and its coordinates are in Western Australia, so the name is a bug of theirs and
  // the position is what the screenshot shows. The position is copied and the name corrected.
  { name: "United States", coords: [37.2580397, -104.657039] },
  { name: "India", coords: [20.7504374, 73.7276105] },
  { name: "United Kingdom", coords: [53.613, -11.6368] },
  { name: "Australia", coords: [-25.0304388, 115.2092761] },
];

export function WorldMap() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    // An effect cannot be async, so the work is an inner function and `cancelled` covers the case
    // where the component unmounts while the two imports are still in flight: without it, the map is
    // created onto a detached node and never destroyed.
    let cancelled = false;
    let map: { destroy: () => void } | undefined;

    void (async () => {
      const [{ default: JsVectorMap }] = await Promise.all([
        import("jsvectormap"),
        // `world`, not `world-merc`. They render `worldMill`, the Miller projection, and this is
        // jsvectormap's equivalent of it: Mercator stretches the high latitudes, which is why our
        // Greenland and Antarctica did not sit where theirs do.
        import("jsvectormap/dist/maps/world.js"),
      ]);
      if (cancelled) return;

      map = new JsVectorMap({
        selector: el,
        map: "world",
        // Off, both of them. A map inside a dashboard card that swallows the page's scroll wheel is
        // the single most complained-about behaviour these libraries have.
        zoomButtons: false,
        zoomOnScroll: false,
        backgroundColor: "transparent",
        regionStyle: {
          // The theme's own tokens, resolved at paint time by the browser rather than read into JS,
          // so the map follows a theme switch without this component knowing one happened.
          //
          // **The landmass is a mid grey and the borders are the card's own colour.** It was
          // `--muted` on `--border`: a near-white continent outlined in a slightly less near-white
          // grey, which is why ours read as a faint smudge where the reference reads as a map. Their
          // countries are separated by white gaps, and the themeable spelling of "white here" is
          // `--card`, which inverts correctly in dark mode where a literal white would not. The fill
          // is a mix rather than a palette pick so it stays a neutral of *this* theme, and it is
          // resolved into a token in `globals.css` so the map only ever sees a plain `var()`.
          // **No stroke.** Their `regionStyle.initial` is `stroke: "none", strokeWidth: 0`, so the
          // white lines between countries are gaps in the map's own geometry rather than borders
          // they draw. Adding a stroke here drew a second set on top of them.
          initial: {
            fill: "var(--vui-map-land)",
            fillOpacity: 1,
            stroke: "none",
            "stroke-width": 0,
          },
          // Their hover is the **brand at 70%**, not a darker grey: a country under the cursor
          // reads as selectable rather than as slightly dirtier.
          hover: { fill: "var(--primary)", fillOpacity: 0.7, cursor: "pointer" },
        },
        markers: MARKERS,
        // The brand blue, as the reference draws them. `--color-primary` is near-black here, which
        // put black dots on a grey map.
        markerStyle: {
          // `r: 4` with a one-pixel white ring, which is theirs exactly. The `7` here before was
          // measured off a screenshot and counted the ring as part of the dot.
          initial: {
            fill: "var(--primary)",
            r: 4,
            stroke: "var(--card)",
            "stroke-width": 1,
          },
        },
        // No `labels` block: dots only, as the reference has it. The offset version put the text
        // beside each dot and it still collided at this height.
      });
    })();

    return () => {
      cancelled = true;
      map?.destroy();
    };
  }, []);

  return (
    <div
      ref={host}
      className={DEMOGRAPHIC_MAP_HOST}
      // Decorative: every figure it encodes is in the list beneath it, which is reachable.
      // Announcing an unlabelled SVG of a hundred paths would be worse than silence.
      aria-hidden="true"
    />
  );
}
