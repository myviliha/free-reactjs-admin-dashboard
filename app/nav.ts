import { FREE_NAV, FREE_NAV_HREFS, type FreeNavEntry, type FreeNavGroup } from "@viliha/vui-core";

/**
 * The free demo's navigation, from the shared source.
 *
 * **This file held the list until a second edition needed it** (`Z-14`). The two free demos are one
 * product in two frameworks, so their sidebars have to match exactly: eighty lines that must stay
 * identical, copied per edition, is the drift this repository guards against everywhere else, and it
 * would have been four copies by the time Angular and HTML arrive. `FREE_NAV` in
 * `@viliha/vui-core` is the list now, and `FREE_ROUTES` is derived from it, so a page added to the
 * sidebar is a page the route list already knows about.
 *
 * What is left here is what is genuinely this app's: the re-export the shell imports, and the reason
 * for the one route that is a page rather than an address.
 */
export const NAV = FREE_NAV;
export const NAV_HREFS = FREE_NAV_HREFS;

export type NavEntry = FreeNavEntry;
export type NavGroup = FreeNavGroup;
export type NavLeaf = FreeNavEntry["children"] extends readonly (infer T)[] | undefined ? T : never;

/**
 * The catch-all, which is a page and not a route.
 *
 * `/error-404` is a real address in their sidebar *and* Next renders `not-found.tsx` for anything
 * unmatched, so the same screen answers to both. Listing it here would double-count it.
 */
export const CATCH_ALL = "not-found" as const;
