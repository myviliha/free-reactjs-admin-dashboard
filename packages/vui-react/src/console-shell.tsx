"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { ANCHOR_GAP } from "./anchor-core";
import {
  FREE_ACTIVE_MARK,
  FREE_FLYOUT_HEADING,
  FREE_FLYOUT_PANEL,
  FREE_NAV_BADGE,
  FREE_NAV_IDLE,
  FREE_NAV_LIST,
  FREE_NAV_ROW,
  FREE_NAV_ROW_CHILD,
  FREE_SUBMENU_BOX,
  FREE_SUBMENU_BOX_OPEN,
  FREE_SUBMENU_BOX_SHUT,
  FREE_SUBMENU_CLIP,
  FREE_SUBMENU_LIST,
  FREE_SUBMENU_RULE,
  PAGE_CONTENT,
  PAGE_ROOT,
  PAGE_SCROLL,
} from "./class-variants";
import {
  type ConsoleShellState,
  isCurrent as currentAt,
  holdsCurrent,
  initialOpen,
  isExpanded,
  isRailShowing,
  sidebarWidth,
  submenuId,
  toggleGroup,
} from "./console-shell-core";
import { Dropdown } from "./dropdown-menu";
import {
  Backpack,
  BarChart,
  Box,
  Calendar,
  ChatBubble,
  ChevronDown,
  Dashboard,
  File,
  Help,
  // Aliased: `Input` is also the form control this file imports from `./input`.
  Input as InputGlyph,
  Layout,
  Lock,
  Mail,
  Minus,
  Person,
  Pin,
  Plus,
  Rows,
  Search,
  Settings,
  Table,
  Wand,
} from "./icons";
import { Input } from "./input";
import type { FreeNavEntry, FreeNavGroup } from "./nav-core";
import { isRail, type ShellLayout } from "./shell-layout-core";
import { cn } from "./utils";

/**
 * The icon slot: a name in `FREE_NAV` maps to a component here.
 *
 * The list stays plain data so a test can read the whole navigation without rendering anything, and
 * the one place that knows about React is this table.
 *
 * **Keyed the way `DEMO_ICON_RADIX` keys icons, not by Radix export name** (`Z-14`). The Vue demo draws
 * the same sidebar from `DEMO_ICON_PATHS`, a generated table of the same glyphs as markup, and that
 * table is keyed `layout-grid` and `bar-chart3`. Two vocabularies for one set of icons would mean a
 * per-edition translation map, so the shared nav speaks the shared table's language and this maps it to
 * components once.
 */
/**
 * **Named for the table it is, because `NAV_ICONS` is already taken** (`PD-220`).
 *
 * `@repo/web-chrome` exports a `NAV_ICONS` of its own, imported in fourteen places and shipped in
 * the starter a buyer gets. The two have different keys and *inverted* behaviour on a missing one:
 * that table throws, this one returns `Box`. A buyer writing `import { NAV_ICONS }` would have
 * resolved to whichever specifier autocomplete offered, with no type error either way, and got a
 * silent grey square instead of the exception that would have told them. `packages/react`'s exports map
 * makes every module public, so the name was sold the moment it was exported.
 */
export const SHELL_NAV_ICONS: Record<string, typeof Dashboard> = {
  // The Pro sidebar's six groups (`PD-220`). Five reuse the vocabulary's own names rather than
  // adding synonyms for glyphs it already had; only `ai` is new. Every key here must also be in
  // `DEMO_ICON_RADIX`, which `shell-nav-icons.test.ts` now asserts rather than merely asking for.
  ai: Wand,
  "bar-chart3": BarChart,
  box: Box,
  briefcase: Backpack,
  "chat-bubble": ChatBubble,
  calendar: Calendar,
  file: File,
  input: InputGlyph,
  layout: Layout,
  "layout-grid": Dashboard,
  lock: Lock,
  // Added for the operator console's Support and Administration groups. Both keys were already in
  // `DEMO_ICON_RADIX` and both glyphs already in the slot; only this table was missing them, so the
  // groups drew the `Box` fallback. A key that is NOT in the shared vocabulary must not be added
  // here alone, or React gets an icon the other editions cannot draw.
  "help-circle": Help,
  mail: Mail,
  "map-pin": Pin,
  rows: Rows,
  settings: Settings,
  table: Table,
  users: Person,
};

/** The rail nav's own horizontal padding, in pixels: the `px-3` on its `<nav>`, as a number. */
const RAIL_INSET = 12;

function Submenu({ id, open, children }: { id: string; open: boolean; children: React.ReactNode }) {
  /**
   * Animated by CSS, not measured by JavaScript.
   *
   * **This measured `scrollHeight` in an effect and animated `height`.** That is invisible to
   * anything not running React: the server rendered `height: 0px`, hydration corrected it, and the
   * static export that becomes the HTML edition never hydrates, so every submenu there was
   * permanently shut and the sidebar stood 312px short of this one (`PD-141`). It also meant this
   * app's own first paint showed open groups closed.
   *
   * `grid-template-rows` animates to content height with nothing to measure, so the open state is
   * right in the first byte of HTML. The inner element clips, because a grid item cannot be clipped
   * by its own track.
   */
  return (
    <div
      id={id}
      className={cn(FREE_SUBMENU_BOX, open ? FREE_SUBMENU_BOX_OPEN : FREE_SUBMENU_BOX_SHUT)}
      // Hidden from assistive tech when closed, or a screen reader reads links nobody can see.
      aria-hidden={!open}
      // `inert` with it, and the pair is the point: a closed panel is zero-height with its content
      // clipped, so its links are invisible and **still focusable**. Tabbing down the sidebar with
      // every section shut put focus on nineteen links that are not there, and `aria-hidden` wrapped
      // around focusable content is an outright ARIA violation, so a screen reader announced each as
      // blank. `inert` is the platform's own answer and takes the subtree out of the tab order.
      inert={!open}
    >
      <div className={FREE_SUBMENU_CLIP}>{children}</div>
    </div>
  );
}

export interface AppShellProps {
  children: React.ReactNode;
  /** The navigation tree. Data, so an app owns its own menu (`PD-210`). */
  nav: readonly FreeNavGroup[];
  /** Which of the six presets is in force. The dress chooses it; the shell renders it. */
  layout: ShellLayout;
  /** The current address, for the active mark. Passed in, never read from a router. */
  pathname: string;
  /**
   * How to render a link.
   *
   * **This is what keeps the package free of Next.** The shell used `next/link`, and
   * `packages/react` has no Next import anywhere else: adding one would make a design system sold to
   * Vue, Angular, HTML and Laravel buyers depend on a React meta-framework. A Next app passes
   * `next/link`, a plain React app passes an anchor, and neither is this file's business.
   */
  Link: React.ComponentType<{
    href: string;
    className?: string;
    title?: string;
    role?: string;
    children: React.ReactNode;
    "aria-current"?: "page" | undefined;
  }>;
  /** The mark above the navigation. A function, because a rail wants it compact. */
  brand: (state: { compact: boolean; version: boolean }) => React.ReactNode;
  /** The top bar. Receives the collapse state so its toggle can reflect it. */
  header: (state: { collapsed: boolean; onToggle: () => void }) => React.ReactNode;
  /** The one-line strip under the content. Rendered only when the layout asks for it. */
  footer?: () => React.ReactNode;
  /** The panel at the foot of the sidebar. Hidden in a rail, where there is no room. */
  aside?: React.ReactNode;
}

/**
 * The application shell: sidebar, header, content, footer (`PD-217`).
 *
 * **Hoisted out of `apps/web/free-react` rather than copied a third time.** It was app-local and
 * `pro-react` already held a near-identical copy; `apps/web/backoffice` would have been the third,
 * which is the drift `PD-048` and `PD-050` exist to prevent and which those two records show
 * happening twice already in this repository.
 *
 * **It is one shell, not the shell.** A shell owns its structure and its CSS, and there will be
 * others: a documentation shell, a split shell. So this carries `data-shell="app"` on its root,
 * which is the hook a shell-scoped stylesheet block targets. Naming it `AppShell` leaves the
 * siblings room without inventing them, which `E-03` asks for.
 *
 * **Everything the app used to reach for is now an input.** Six app-local imports became props:
 * the brand, header, footer and aside are slots, the navigation and the layout are data, and the
 * router is two props rather than a framework dependency. Nothing about the rendering changed.
 */
export function AppShell({
  children,
  nav,
  layout,
  pathname,
  Link,
  brand,
  header,
  footer,
  aside,
}: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  // Layout six *is* a rail, so it cannot also be un-collapsed by the header's toggle: the toggle
  // would promise a width the layout does not have. Everywhere else the toggle owns it.
  const rail = isRailShowing(layout, collapsed);
  const width = sidebarWidth(layout, collapsed);

  /**
   * Which parents are open.
   *
   * Seeded from the current route so landing on `/bar-chart` shows Charts already open, rather than
   * the reader having to find their own page in a collapsed list.
   */
  const [open, setOpen] = useState<readonly string[]>(() => initialOpen(nav, pathname));

  /**
   * Keep the parent of the current route open across navigations.
   *
   * The seed above runs once. Reaching a page from somewhere other than its own submenu, a link in
   * the content or the browser's back button, left the parent shut with the child highlighted inside
   * it, so the sidebar showed no selection at all. Additive on purpose: it opens the holder and
   * never closes anything, or it would fight the reader every time they opened a second section.
   */
  useEffect(() => {
    // Same decision as the seed, so the two cannot answer differently. They were separate copies of
    // one `find`/`filter` pair, and the extraction only mattered once both call sites used it.
    const holders = initialOpen(nav, pathname);
    if (holders.length > 0)
      setOpen((current) => [...current, ...holders.filter((label) => !current.includes(label))]);
  }, [pathname]);

  const toggle = (label: string) => setOpen((current) => toggleGroup(current, label));

  const isCurrent = (href: string) => currentAt(pathname, href);

  return (
    // **`h-dvh`, not `h-full`.** `h-full` is `height: 100%`, which is 100% of the parent, so it only
    // works while every ancestor up to `html` also has a height: one link resolving to `auto`
    // silently makes the shell content-height, the document starts scrolling behind it, and the page
    // ends in a band of empty background under the footer. `h-dvh` is the viewport, measured
    // directly, so the shell no longer depends on a chain it cannot see. `dvh` rather than `vh`
    // because mobile browsers shrink the visual viewport when their toolbars appear.
    <div
      className="flex h-dvh"
      // **The hook a shell-scoped stylesheet targets.** A shell owns its structure and its CSS, and
      // there will be more than one of them, so a rule meant for this shell is written
      // `[data-shell="app"] ...` rather than against a class that another shell might also use.
      data-shell="app"
    >
      <aside
        // The width is a preset value, so it is a style rather than a class: Tailwind cannot
        // generate `w-[290px]` and `w-[104px]` from a variable, and listing every preset's width as
        // a safelisted class would be the same number written in two places.
        style={{ width }}
        // `overflow-x-hidden` is belt and braces. `overflow-y-auto` alone computes `overflow-x` to
        // `auto`, so anything a pixel too wide gets a horizontal scrollbar and paints past the
        // border instead of being contained. A sidebar has no reason to scroll sideways, and
        // stating that removes a whole class of "the row runs off the edge" from being possible.
        // `relative` for the same reason `PAGE_SCROLL` carries it: `overflow-y-auto` clips what a
        // descendant paints but does not make this a containing block, so an `sr-only` control in
        // the nav would resolve against the viewport and stretch the document instead.
        className="relative hidden shrink-0 overflow-y-auto overflow-x-hidden border-r border-border bg-card transition-[width] duration-300 ease-in-out lg:block"
      >
        <div
          className={cn(
            "flex items-center border-b border-border lg:h-[76px]",
            rail ? "h-16 justify-center px-3" : "h-16 px-5",
          )}
        >
          {brand({ compact: rail, version: layout.brand === "wordmark-version" })}
        </div>

        {/* Layouts three and four put a search inside the sidebar, above the navigation. A rail has
            nowhere to put one, so it is skipped rather than squeezed. */}
        {layout.sidebarSearch && !rail ? (
          <div className="relative px-5 pt-5">
            <Search className="pointer-events-none absolute left-8 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search the docs"
              aria-label="Search the documentation"
              className="h-11 rounded-lg pl-10"
            />
          </div>
        ) : null}

        {/* `pt-5`: the first group heading sat flush against the brand rule and was clipped. */}
        <nav className={cn("pt-5 pb-6", rail ? "px-3" : "px-5")}>
          {nav.map((group) => (
            <div key={group.heading || "first"} className="mb-4">
              {/* An empty heading renders nothing at all, rather than an empty paragraph holding
                  its own margin open. */}
              {group.heading && layout.heading !== "none" ? (
                <p
                  className={cn(
                    // Measured: `mb-4 text-xs uppercase leading-[20px]`, in the lighter of the two
                    // greys. It was `font-semibold tracking-wide`, which made the group label
                    // compete with the items under it instead of labelling them.
                    "mb-4 px-3 leading-5 text-muted-foreground/70",
                    layout.heading === "uppercase" ? "text-xs uppercase" : "text-sm",
                    rail && "text-center",
                  )}
                >
                  {rail ? "···" : group.heading}
                </p>
              ) : null}
              {/* **16px between rows.** This was `space-y-0.5`, two pixels, which is the single biggest
                  reason the sidebar read as a different product: the reference's menu breathes and
                  ours was a dense list. Measured from `flex flex-col gap-4`. */}
              <ul className={FREE_NAV_LIST}>
                {group.entries.map((entry) => {
                  const Icon = SHELL_NAV_ICONS[entry.icon] ?? Box;
                  const active = holdsCurrent(entry, pathname);
                  const row = cn(
                    // Measured: `text-theme-sm gap-3 rounded-lg px-3 py-2 font-medium`. Ours was
                    // `rounded-md` and only weighted the active row, so every other item sat a
                    // grade lighter than the reference's.
                    FREE_NAV_ROW,
                    rail && "justify-center px-0",
                    // The reference's active state colours the pill, the label *and* the icon.
                    // Tinting only the background reads as a hover that stuck.
                    //
                    // `primary` is the brand since `PD-072`. This exact pair rendered a grey pill
                    // with grey text while it was not, which made the selected item the least
                    // visible thing in the sidebar, and the alpha could not be expressed at all
                    // while the brand was only reachable as an arbitrary `var()`.
                    // Which of the three marks is the layout's call (`PD-065`).
                    active
                      ? FREE_ACTIVE_MARK[layout.active]
                      : // Their inactive row is `text-gray-700`, a near-body grey, not the muted one:
                        // ours was light enough that the whole menu looked disabled.
                        FREE_NAV_IDLE,
                  );

                  if (entry.href) {
                    return (
                      <li key={entry.label}>
                        <Link
                          href={entry.href}
                          className={row}
                          // `aria-current`, not only a colour: which page you are on is information.
                          aria-current={isCurrent(entry.href) ? "page" : undefined}
                          title={rail ? entry.label : undefined}
                        >
                          {/* **`rail ||`, not `layout.navIcons` alone.** A rail is icon-only by
                              definition, so the three documentation layouts, which drop icons from
                              the expanded list on purpose, collapsed to a column of empty rows: a
                              sidebar with nothing in it and no way back except the toggle you had
                              just pressed. `navIcons` is a statement about the *expanded* list. */}
                          {rail || layout.navIcons ? <Icon className="size-6 shrink-0" /> : null}
                          {!rail && entry.label}
                        </Link>
                      </li>
                    );
                  }

                  const expanded = isExpanded(open, entry.label);

                  /**
                   * The children, drawn once and used by both the inline submenu and the rail flyout.
                   *
                   * Two copies of this list is how the rail and the expanded sidebar start disagreeing
                   * about what a group contains, which is the whole class of defect this demo exists
                   * to disprove.
                   */
                  const childLinks = (entry.children ?? []).map((child) => (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        aria-current={isCurrent(child.href) ? "page" : undefined}
                        role={rail ? "menuitem" : undefined}
                        // The active child gets the **same pill as an active parent**, not a bolder
                        // weight. It was `font-medium text-foreground`, which on a submenu of one is
                        // very nearly invisible: clicking Ecommerce moved the page and looked like
                        // nothing had happened. Selection is the state a sidebar exists to show, so
                        // it gets the strongest treatment in the component, at both levels.
                        className={cn(
                          FREE_NAV_ROW_CHILD,
                          isCurrent(child.href) ? FREE_ACTIVE_MARK[layout.active] : FREE_NAV_IDLE,
                        )}
                      >
                        {child.label}
                        {/* The reference marks its newest pages. Only Pro's tree sets one. */}
                        {child.badge ? <span className={FREE_NAV_BADGE}>{child.badge}</span> : null}
                      </Link>
                    </li>
                  ));

                  /**
                   * **Collapsed, a group opens a flyout beside the rail.**
                   *
                   * It used to render nothing at all, on the reasoning that a 90px column has no room
                   * for a submenu. True of a panel *inside* the column, irrelevant to one beside it,
                   * and the cost was that seven of the ten rail rows were buttons that toggled state
                   * nothing rendered from: the sidebar's whole middle section was dead to a click, and
                   * six of the nineteen pages were unreachable without expanding first (`PD-116`).
                   *
                   * `Dropdown` rather than a hand-rolled panel, because the hard parts are already
                   * solved in it: it portals out of the aside, which is `overflow-y-auto` and would
                   * otherwise clip a flyout (`PD-082`), and it closes on outside-click, on Escape and
                   * on choosing an item. A rail flyout that does not close when you pick a page is
                   * worse than no flyout.
                   */
                  if (rail) {
                    return (
                      <li key={entry.label}>
                        <Dropdown
                          bare
                          label=""
                          ariaLabel={entry.label}
                          // The hover hint the leaf rows beside it keep. In a rail the icon is the
                          // only label there is, so seven of ten rows losing it is a real asymmetry.
                          title={entry.label}
                          placement="right"
                          // The panel clears the **rail**, not the button. `Dropdown` measures its
                          // own trigger, and the row is inset by the nav's `px-3`, so anchoring to
                          // the button put the flyout's left edge 12px inside the sidebar and tucked
                          // it under the border. That distance is a fact about this chrome rather
                          // than about the component, which is what `offset` is for.
                          offset={RAIL_INSET + ANCHOR_GAP}
                          triggerClassName={cn(row, "justify-center px-0")}
                          panelClassName={FREE_FLYOUT_PANEL}
                          trigger={<Icon className="size-6 shrink-0" />}
                        >
                          <p className={FREE_FLYOUT_HEADING}>{entry.label}</p>
                          <ul className="flex flex-col gap-1">{childLinks}</ul>
                        </Dropdown>
                      </li>
                    );
                  }

                  return (
                    <li key={entry.label}>
                      <button
                        type="button"
                        className={row}
                        aria-expanded={expanded}
                        // A disclosure button should say what it discloses, and this one did not.
                        // It is also what lets an edition with no framework wire the pair up:
                        // `vui.js` toggles any `aria-expanded`/`aria-controls` couple, so the static
                        // HTML demo's menus open without a line of app code (`PD-143`).
                        aria-controls={submenuId(entry.label)}
                        onClick={() => toggle(entry.label)}
                      >
                        {layout.navIcons ? <Icon className="size-6 shrink-0" /> : null}
                        <span className="flex-1 text-left">{entry.label}</span>
                        {/*
                          Three disclosure styles, because the reference uses three. Plus-minus states
                          the action and chevron states the direction; `none` is for the documentation
                          layouts whose sections are always open, where an indicator that never changes
                          is furniture.
                        */}
                        {layout.expander === "chevron" ? (
                          <ChevronDown
                            className={cn(
                              "size-4 shrink-0 transition-transform duration-200",
                              expanded && "rotate-180",
                            )}
                          />
                        ) : layout.expander === "plus-minus" ? (
                          expanded ? (
                            <Minus className="size-4 shrink-0" />
                          ) : (
                            <Plus className="size-4 shrink-0" />
                          )
                        ) : null}
                      </button>
                      <Submenu id={submenuId(entry.label)} open={expanded}>
                        {/*
                          **This is the reference's structure, read from its source.** `ml-9` on the
                          `<ul>` and a `flex` row with no margin of its own, inside the height-animated
                          wrapper. Four attempts guessed at the geometry from screenshots and all of
                          them were arguing about the wrong thing: the fill was an alpha of the brand,
                          and an opaque tint is what the reference uses. `submenu.test.ts` holds the
                          shape so it cannot drift back.
                        */}
                        <div className="relative">
                          {layout.submenuRule ? (
                            <span aria-hidden="true" className={FREE_SUBMENU_RULE} />
                          ) : null}
                          <ul className={FREE_SUBMENU_LIST}>{childLinks}</ul>
                        </div>
                      </Submenu>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          {!rail && aside}
        </nav>
      </aside>

      <div className={cn(PAGE_ROOT, "min-w-0 flex-1")}>
        {header({ collapsed, onToggle: () => setCollapsed((c) => !c) })}
        {/* The footer scrolls with the page rather than being pinned: a fixed strip over a data
            table steals a row's worth of height on every screen to say the same sentence. `mt-auto`
            on it holds it at the bottom on a page too short to scroll. */}
        <div className={cn(PAGE_SCROLL, "flex flex-col")}>
          {/*
            **A `main` landmark, not a `div`.** Every in-shell page in three apps was a sidebar, a
            header and an unnamed box: a screen-reader user could reach the navigation by landmark
            and then had no way to jump past it to the thing they came for, on every screen. The dev
            raised exactly this against the `reactjs` shell; it lives here now, so the free demo, the
            Pro app and the operator console are all fixed by one word rather than by three people
            remembering.
          */}
          <main id="content" className={PAGE_CONTENT}>
            {children}
          </main>
          {layout.footer === "compact" && footer ? footer() : null}
        </div>
      </div>
    </div>
  );
}
