import { existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DEMO_ICON_PATHS, FREE_ROUTES } from "@viliha/vui-core";
import { expect, it } from "vitest";

import { NAV, NAV_HREFS } from "./app/nav";

const HERE = dirname(fileURLToPath(import.meta.url));
const APP = join(HERE, "app");

/**
 * The sidebar and the route tree, held against each other in **both** directions.
 *
 * A nav item with no page is a link to a 404, and a page with no nav item is a page nobody can reach.
 * Both survive a screenshot, so neither is left to inspection.
 *
 * The structure is asserted too, not only the links: TailAdmin's free sidebar is two headings over
 * nine entries, six of which are parents with a submenu. The first version of `nav.ts` was flat,
 * which looked similar and navigated differently, and nothing here would have noticed.
 *
 * **`OURS` is the exception list, and it is deliberately a list and not a bumped number.** Entries
 * we add that the reference does not have are named here, so the parity assertions keep measuring
 * parity: raising `9` to `10` would have made the next accidental addition pass silently, which is
 * the whole failure this case exists to catch.
 */

/** Entries this product adds that the reference has no equivalent of. */
const OURS = ["Layouts"];

/** Every route the app declares, as a path, from the files on disk. */
function routes(dir: string, prefix = ""): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    // A parenthesised segment is a route group: it organises files and adds nothing to the URL.
    const segment = /^\(.*\)$/.test(entry.name) ? prefix : `${prefix}/${entry.name}`;
    const child = join(dir, entry.name);
    if (existsSync(join(child, "page.tsx"))) found.push(segment || "/");
    found.push(...routes(child, segment));
  }
  return found;
}

const declared = new Set([...(existsSync(join(APP, "page.tsx")) ? ["/"] : []), ...routes(APP)]);

it("the app declares routes at all, so the comparisons below mean something", () => {
  expect(declared.size).toBeGreaterThan(10);
});

it("every sidebar link goes to a page that exists", () => {
  expect(NAV_HREFS.filter((href) => !declared.has(href))).toEqual([]);
});

/**
 * `/overlay-source` is a build artefact, not a screen, and it is the only one.
 *
 * It renders the modal panels open so `scripts/page-templates.mjs` has markup to place in the HTML
 * edition, where a closed `Dialog` renders nothing (`PD-158`). Putting it in the sidebar would offer
 * a reader a page of stacked open dialogs.
 *
 * **A waiver that hides a dead page is the failure this repository has already had**, so this one is
 * not load-bearing: the emitter fails the build when a trigger names a panel this route does not
 * produce, which is a stronger guarantee than the assertion being waived here.
 */
const BUILD_ONLY = ["/overlay-source"];

it("every page is reachable from the sidebar, apart from the build-only one", () => {
  expect(
    [...declared].filter((route) => !NAV_HREFS.includes(route) && !BUILD_ONLY.includes(route)),
  ).toEqual([]);
});

it("the build-only exemption names a page that exists", () => {
  // An exemption for a file nobody ships is how a waiver outlives its reason.
  for (const route of BUILD_ONLY) expect(declared, route).toContain(route);
});

it("the sidebar is the reference's shape: two headings, nine entries, seven with a submenu", () => {
  // The reference labels its first group "MENU". Ours is deliberately unlabelled (`PD-068`): a sign
  // reading "Menu" above the menu says nothing. "Others" stays, because that one distinguishes a
  // second group from the first, so the assertion is "two groups, the second named", not a literal.
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
  // sidebar links straight to; everything else opens. Writing "six" here first was my own miscount,
  // and this case is what said so.
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
   * **This asserted `/Icon$/`, a name shape, and the shape was Radix's** (`Z-14`). The shared nav keys
   * its icons the way `DEMO_ICON_RADIX` does, `layout-grid` rather than `DashboardIcon`, so that one
   * vocabulary serves this app's component map and the Vue demo's generated markup table. A pattern on
   * the *name* could only ever check the naming convention of one edition.
   *
   * Resolving in `DEMO_ICON_PATHS` is the stronger claim and the one that matters: it proves the glyph
   * exists as markup, which is what the non-React editions draw from. Three of the ten were missing
   * from that table when the nav moved, and a name check would have passed on all three.
   */
  for (const entry of NAV.flatMap((g) => g.entries)) {
    expect(DEMO_ICON_PATHS[entry.icon], `${entry.label} (${entry.icon})`).toBeTruthy();
  }
});

it("the catch-all exists beside the 404 page, which are different things", () => {
  // `not-found.tsx` answers an address nobody meant to visit; `/error-404` is a demo of that screen
  // the sidebar links to on purpose.
  expect(existsSync(join(APP, "not-found.tsx"))).toBe(true);
  expect(declared.has("/error-404")).toBe(true);
});

/**
 * The shared route list and this app's tree, held against each other (`Z-16`).
 *
 * `FREE_ROUTES` in `@viliha/vui-core` is what the HTML generator, Laravel's emitter and the Vue and
 * Angular ports each read, so it is the free tier's address list and this app is the reference for it.
 * Four editions rendering four copies is four chances to disagree about what the free tier contains,
 * and the disagreement would show up as a missing page in a download rather than as a failure here.
 *
 * `nav.ts` keeps its own tree, because a sidebar is groups and icons and submenus and that is genuinely
 * this app's. What must not diverge is the set of addresses.
 */
it("the shared route list is exactly this app's routes", () => {
  // `/error-404` is in both; `not-found` is a Next convention rather than an address, and `nav.ts`
  // records why it is excluded.
  // `BUILD_ONLY` is subtracted here for the same reason it is above: `/overlay-source` is markup for
  // the emitter, not a route the shared list should carry into four other editions.
  const shipped = [...declared].filter((route) => !BUILD_ONLY.includes(route));
  expect([...FREE_ROUTES].sort()).toEqual(shipped.sort());
});

it("every route the sidebar offers is in the shared list", () => {
  for (const href of NAV_HREFS) expect(FREE_ROUTES, href).toContain(href);
});
