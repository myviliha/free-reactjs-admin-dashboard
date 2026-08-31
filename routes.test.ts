import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { DEMO_ICON_PATHS, FREE_ROUTES } from "@viliha/vui-core";
import { expect, it } from "vitest";

import { NAV, NAV_HREFS } from "./src/nav";
import { SCREENS, titleOf } from "./src/screens";

/**
 * The route list, the screen map and the sidebar, held against each other in **every** direction.
 *
 * `FREE_ROUTES` is derived from `FREE_NAV` in `@viliha/vui-core`, so the addresses and the sidebar
 * cannot disagree by construction. What this file adds is the third side of the triangle: that this
 * edition has something to render at each of them. A route with no screen is a blank page, and a
 * screen with no route is a file nobody can reach; both survive a screenshot.
 *
 * **It reads `SCREENS`, where it used to read the filesystem.** Under Next the route tree *was* the
 * folder layout, so the assertions walked `app/` looking for `page.tsx`. The table is explicit now,
 * which means these cases can check the two things the folder walk never could: that every route has
 * a title, and that no screen file is left unmapped.
 */
const HERE = dirname(fileURLToPath(import.meta.url));

/** Entries this product adds that the reference has no equivalent of. */
const OURS = ["Layouts"];

it("the shared route list is not empty, so the comparisons below mean something", () => {
  expect(FREE_ROUTES.length).toBeGreaterThan(15);
});

it("every route resolves to a screen, with nothing waived", () => {
  for (const route of FREE_ROUTES) {
    expect(Boolean(SCREENS[route]), `${route} resolves to nothing`).toBe(true);
  }
});

it("the map invents no route", () => {
  // The other direction, and the one a screen count cannot see: a screen mapped to an address the
  // free tier does not have is a file nobody reaches.
  for (const route of Object.keys(SCREENS)) expect(FREE_ROUTES, route).toContain(route);
});

it("every route carries a title, and the template is applied", () => {
  // This was a `metadata` export beside each page, so Next failed the build on a missing one. The
  // table cannot, and a screen with no title silently inherits whatever the last one set.
  for (const [route, screen] of Object.entries(SCREENS)) {
    expect(screen.title, `${route} has no title`).toBeTruthy();
    expect(titleOf(screen.title)).toBe(`${screen.title} · VuiAdmin free`);
  }
  expect(titleOf(undefined)).toBe("VuiAdmin free");
});

it("every screen file in the folder is mapped", () => {
  /**
   * Written to catch the failure mode this app is most likely to have next.
   *
   * Adding a screen is two edits, the file and the map, and forgetting the second leaves a component
   * that compiles, type-checks and is unreachable. Under Next the folder *was* the route, so this
   * could not happen; it can now.
   *
   * **Nothing is exempt.** `/overlay-source` was the one build-only page, and it went with the Next
   * export that needed it. An exemption list on a completeness test is where dead code goes to look
   * accounted for, so if this ever needs one again, the entry has to say why the file exists at all.
   */
  const files = readdirSync(join(HERE, "src", "screens")).filter((f) => /Screen\.tsx$/.test(f));
  expect(files.length).toBeGreaterThan(10);
  const mapped = new Set(Object.values(SCREENS).map((screen) => screen.component.name));
  for (const file of files) {
    expect(mapped, `${file} is not in SCREENS`).toContain(file.replace(/\.tsx$/, ""));
  }
});

it("the screens outside the shell are the two auth pages and the 404, named", () => {
  // A sign-in page offering navigation is offering a way around itself, and a 404 wrapped in working
  // navigation implies the navigation is trustworthy on a page that just failed to resolve an
  // address. These three sat outside Next's `(shell)` route group, and asserting them by name is
  // what stops a sixteenth screen quietly losing its sidebar.
  const by = (chrome: string) =>
    Object.entries(SCREENS)
      .filter(([, screen]) => screen.chrome === chrome)
      .map(([route]) => route)
      .sort();
  expect(by("auth")).toEqual(["/signin", "/signup"]);
  expect(by("none")).toEqual(["/error-404"]);
  expect(by("shell")).toHaveLength(FREE_ROUTES.length - 3);
});

it("every sidebar link goes to a screen that exists", () => {
  expect(NAV_HREFS.filter((href) => !SCREENS[href])).toEqual([]);
});

it("every screen is reachable from the sidebar", () => {
  expect(Object.keys(SCREENS).filter((route) => !NAV_HREFS.includes(route))).toEqual([]);
});

it("the sidebar is the reference's shape: two headings, nine entries, seven with a submenu", () => {
  // The reference labels its first group "MENU". Ours is deliberately unlabelled (`PD-068`): a sign
  // reading "Menu" above the menu says nothing. "Others" stays, because that one distinguishes a
  // second group from the first, so the assertion is "two groups, the second named", not a literal.
  //
  // **`OURS` is the exception list, and it is deliberately a list and not a bumped number.** Entries
  // we add that the reference does not have are named here, so the parity assertions keep measuring
  // parity: raising `9` to `10` would have made the next accidental addition pass silently.
  expect(NAV).toHaveLength(2);
  expect(NAV[0]?.heading).toBe("");
  expect(NAV[1]?.heading).toBe("Others");
  const all = NAV.flatMap((g) => g.entries);
  const entries = all.filter((e) => !OURS.includes(e.label));
  // Every name in `OURS` is really in the sidebar, or the exception list is hiding a typo instead of
  // an addition and the counts below drift down without anyone noticing.
  expect(all.length - entries.length).toBe(OURS.length);
  expect(entries).toHaveLength(9);
  // Seven parents and two direct links. Calendar and User Profile are the only entries their
  // sidebar links straight to; everything else opens.
  expect(entries.filter((e) => e.children).length).toBe(7);
  expect(entries.filter((e) => e.href).map((e) => e.label)).toEqual(["Calendar", "User Profile"]);
  // Every entry is one or the other, never both and never neither. Ours included.
  expect(all.every((e) => Boolean(e.href) !== Boolean(e.children))).toBe(true);
});

it("the groups hold the entries the reference puts in them", () => {
  expect(NAV[0]?.entries.map((e) => e.label).filter((l) => !OURS.includes(l))).toEqual([
    "Dashboard",
    "Calendar",
    "User Profile",
    "Forms",
    "Tables",
    "Pages",
  ]);
  expect(NAV[1]?.entries.map((e) => e.label).filter((l) => !OURS.includes(l))).toEqual([
    "Charts",
    "UI Elements",
    "Authentication",
  ]);
});

it("no href appears twice", () => {
  expect(new Set(NAV_HREFS).size).toBe(NAV_HREFS.length);
});

it("every entry names an icon that both editions can actually draw", () => {
  /**
   * At 5.5rem there is no label to fall back on, so an entry with no icon is an unlabelled button.
   *
   * Resolving in `DEMO_ICON_PATHS` is the strong claim: it proves the glyph exists as markup, which
   * is what the non-React editions draw from. Three of the ten were missing from that table when the
   * nav moved, and a check on the icon's *name* would have passed on all three.
   */
  for (const entry of NAV.flatMap((g) => g.entries)) {
    expect(DEMO_ICON_PATHS[entry.icon], `${entry.label} (${entry.icon})`).toBeTruthy();
  }
});

it("the shared route list is exactly this app's routes", () => {
  /**
   * `FREE_ROUTES` in `@viliha/vui-core` is what the HTML generator, Laravel's emitter and the Vue and
   * Angular ports each read, so it is the free tier's address list and this app is the reference for
   * it. Four editions rendering four copies is four chances to disagree about what the free tier
   * contains, and the disagreement would show up as a missing page in a download rather than here.
   *
   * `nav.ts` keeps its own tree, because a sidebar is groups and icons and submenus and that is
   * genuinely this app's. What must not diverge is the set of addresses.
   */
  expect([...FREE_ROUTES].sort()).toEqual(Object.keys(SCREENS).sort());
});
