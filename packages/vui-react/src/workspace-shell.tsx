"use client";

import * as React from "react";
import { COMBOBOX_CHEVRON } from "./class-variants";
import { ChevronRight, Home, Menu, Settings, Close as X } from "./icons";
import { Menu as MenuPanel } from "./menu";
import { cn } from "./utils";
import {
  type CollapsedGroupMode,
  clampWidth,
  DEFAULT_COLLAPSED_GROUP_MODE,
  initialOpen,
  isCurrent as isActiveIn,
  isExpanded,
  type ShellNavLink,
  type ShellNavSection,
  SIDEBAR_DEFAULT_WIDTH,
  SIDEBAR_MAX_WIDTH,
  SIDEBAR_MIN_WIDTH,
  sidebarWidth,
  storedWidth,
  toggleGroup as toggleGroupIn,
  usesFlyout as usesFlyoutIn,
} from "./workspace-shell-core";

const isActive = isActiveIn;

/**
 * What the renderer draws, on top of what the core decides on.
 *
 * The core's `ShellNavLink` carries a label and an href because that is all a *decision* needs. A
 * renderer also needs an icon and a colour, and putting those in the framework-free core would make
 * it describe markup it never emits. Same split as `console-shell`: the core decides, the renderer
 * draws (`PD-227`).
 */
export interface WorkspaceNavLink extends ShellNavLink {
  readonly href: string;
  readonly icon: IconType;
  readonly color?: string;
}

export interface WorkspaceNavGroup {
  readonly label: string;
  readonly icon: IconType;
  readonly color?: string;
  readonly children: readonly WorkspaceNavLink[];
}

export type WorkspaceNavEntry = WorkspaceNavLink | WorkspaceNavGroup;
export interface WorkspaceNavSection {
  readonly title?: string;
  readonly items: readonly WorkspaceNavEntry[];
}

/**
 * A slot the shell fills, given the rail state.
 *
 * **A function, not a node, and that distinction is load-bearing.** Both slots this serves render
 * differently in a 4rem rail: the tenant switcher drops to its mark and gains a `title`, the
 * quick-actions launcher drops to an icon button. The app builds them where the rail state does not
 * exist, so a plain `ReactNode` freezes both in expanded form and overflows the rail the moment
 * anyone collapses it - which is what the first cut of this hoist shipped, because the old code
 * passed `collapsed` as a prop to both children and the move dropped it. A plain node is still
 * accepted, for a slot that genuinely does not care.
 */
export type WorkspaceSlot = React.ReactNode | ((collapsed: boolean) => React.ReactNode);

/** The icon component an entry names. Radix and Lucide both satisfy it. */
export type IconType = React.ComponentType<{ className?: string }>;

/**
 * An entry with children, which is what the core's structural shape calls a group.
 *
 * **`children` present, not `children` non-empty**, matching `@repo/web-chrome`'s `isGroup` exactly.
 * The hoist briefly added a `.length > 0` clause, which reads as a tidy-up and is a behaviour change:
 * a group filtered down to zero children stopped being a group and fell through to the link branch,
 * where `item.href` is `undefined` on a `WorkspaceNavGroup`. That is a thrown render under
 * `next/link` and a dead item elsewhere, and the case that reaches it is the operator console
 * filtering a group's children by permission, which is the consumer the hoist exists for.
 */
const isGroup = (entry: WorkspaceNavEntry): entry is WorkspaceNavGroup => "children" in entry;

/** Hand a slot the rail state, or render it as-is when the app passed a plain node. */
const fill = (slot: WorkspaceSlot, collapsed: boolean): React.ReactNode =>
  typeof slot === "function" ? slot(collapsed) : slot;

/** Delay before a hover-flyout closes, so the cursor can travel diagonally
 *  from the trigger into the panel without it disappearing mid-move. */
const FLYOUT_HOVER_CLOSE_DELAY_MS = 150;

/** Nav glyph. All icons share one size for a consistent left-aligned column.
    Top-level icons are bordered chips (from the global icon rule): inactive keep
    their brand color, active inverts (dark fill, light glyph). Sub-menu icons are
    `plain` - no chip, muted - so nesting reads without any indentation. */
function NavIcon({
  icon: Icon,
  active,
  color,
  plain,
}: {
  icon: IconType;
  active: boolean;
  color?: string;
  plain?: boolean;
}) {
  if (plain)
    return (
      <Icon
        className={cn(
          // keep the 2px chip padding (transparent border) so plain glyphs sit
          // on the same baseline/box as bordered ones - only the border is gone.
          "size-[18px] shrink-0 border-transparent bg-transparent transition-colors",
          active ? "text-sidebar-foreground" : "text-muted-foreground",
        )}
        aria-hidden="true"
      />
    );
  return (
    <Icon
      className={cn(
        "size-[18px] shrink-0 transition-colors",
        active
          ? "border-sidebar-foreground bg-sidebar-foreground text-background"
          : cn("bg-background", color ?? "text-muted-foreground"),
      )}
      aria-hidden="true"
    />
  );
}

/** Shared sidebar contents used by both the desktop aside and the mobile drawer. */
/**
 * The router and everything the app owns, injected (`PD-232`).
 *
 * Same contract `console-shell` established (`PD-217`): `packages/react` has no Next import anywhere,
 * and a design system sold to Vue, Angular, HTML and Laravel buyers must not gain one. The brand is
 * a slot for a second reason: it lived in `@repo/web-chrome`, which **depends on this package**, so
 * importing it here would be a cycle.
 */
export interface WorkspaceShellSlots {
  /** The navigation tree. The app owns its nav; the shell only draws it. */
  nav: readonly WorkspaceNavSection[];
  /** The current route, because `usePathname` is Next's. */
  pathname: string;
  /** The router's link component, for the same reason. */
  Link: React.ComponentType<{
    href: string;
    className?: string;
    title?: string;
    onClick?: (event: React.MouseEvent) => void;
    children: React.ReactNode;
  }>;
  /**
   * The sidebar's header: a wordmark, or a tenant switcher, or nothing.
   *
   * `reactjs` passes an `OrgSwitcher`; the operator console has no organizations to switch between
   * and passes a wordmark.
   */
  brand?: WorkspaceSlot;
  /**
   * The quick-actions launcher, if the app has one. Still app-local until it is hoisted too.
   *
   * A `WorkspaceSlot` for the same reason `brand` is: its collapsed variant is `w-9 justify-center
   * px-0` where its expanded one is `w-full px-2.5` with a visible label.
   */
  quickActions?: WorkspaceSlot;
  /** How a collapsed group opens. The app reads its own configuration and passes the answer. */
  groupMode?: CollapsedGroupMode;
  /**
   * Open a route in a background tab, on a command-click.
   *
   * Optional, and **its absence is the tab strip's absence**: with no handler the gesture falls
   * through to the browser's own behaviour, which is what a console without tabs should do.
   */
  onBackgroundOpen?: (href: string) => void;
}

interface SidebarBodyProps extends WorkspaceShellSlots {
  onNavigate?: () => void;
  collapsed?: boolean;
  /** Rendered at the right of the header row, usually the collapse toggle. */
  headerAction?: React.ReactNode;
}

function SidebarBody({
  onNavigate,
  collapsed = false,
  headerAction,
  nav,
  pathname,
  Link,
  brand,
  quickActions,
  groupMode = DEFAULT_COLLAPSED_GROUP_MODE,
  onBackgroundOpen,
}: SidebarBodyProps) {
  const [openGroups, setOpenGroups] = React.useState<Set<string>>(() => initialOpen(nav, pathname));
  const usesFlyout = usesFlyoutIn(collapsed, groupMode);

  const toggleGroup = (label: string) =>
    setOpenGroups((prev) => toggleGroupIn(prev, label, usesFlyout));

  // flyout-hover: open on enter, close on leave after a short delay so the
  // cursor can travel from the trigger into the panel. A pending close is
  // cancelled if the pointer re-enters the trigger or the panel first.
  const hoverCloseTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelHoverClose = () => {
    if (hoverCloseTimer.current) {
      clearTimeout(hoverCloseTimer.current);
      hoverCloseTimer.current = null;
    }
  };
  const scheduleHoverClose = () => {
    cancelHoverClose();
    hoverCloseTimer.current = setTimeout(() => {
      setOpenGroups(new Set());
    }, FLYOUT_HOVER_CLOSE_DELAY_MS);
  };
  const openGroupOnHover = (label: string) => {
    cancelHoverClose();
    setOpenGroups(new Set([label]));
  };
  React.useEffect(() => () => cancelHoverClose(), []);

  // Flyout modes: the open group's panel renders `position: fixed` at a rect
  // computed from its trigger button, so it escapes the nav's
  // `overflow-y-auto` clipping instead of being cut off at the rail edge.
  const navRef = React.useRef<HTMLElement | null>(null);
  const flyoutRef = React.useRef<HTMLDivElement | null>(null);
  const groupButtonRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map());
  const [flyoutPos, setFlyoutPos] = React.useState<{ top: number; left: number } | null>(null);
  const openGroupLabel = usesFlyout ? Array.from(openGroups)[0] : undefined;

  React.useLayoutEffect(() => {
    if (!openGroupLabel) {
      setFlyoutPos(null);
      return;
    }
    const btn = groupButtonRefs.current.get(openGroupLabel);
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    setFlyoutPos({ top: rect.top, left: rect.right + 4 });
  }, [openGroupLabel]);

  // Clamp the panel to the viewport once its real height is known - a group
  // near the bottom of the rail would otherwise render partly (or fully)
  // below the fold and be invisible.
  React.useLayoutEffect(() => {
    if (!flyoutPos || !flyoutRef.current) return;
    const margin = 8;
    const rect = flyoutRef.current.getBoundingClientRect();
    const maxTop = Math.max(margin, window.innerHeight - rect.height - margin);
    if (rect.top > maxTop) {
      setFlyoutPos((prev) => (prev ? { ...prev, top: maxTop } : prev));
    }
  }, [flyoutPos]);

  React.useEffect(() => {
    if (!openGroupLabel) return;
    const close = () => setOpenGroups(new Set());
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (navRef.current?.contains(target)) return;
      if (flyoutRef.current?.contains(target)) return;
      close();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", close);
    };
  }, [openGroupLabel]);

  const openGroupEntry = React.useMemo(() => {
    if (!openGroupLabel) return undefined;
    for (const section of nav) {
      for (const entry of section.items) {
        if (isGroup(entry) && entry.label === openGroupLabel) return entry;
      }
    }
    return undefined;
    // `nav` belongs here now. It was a module constant in the app, which is what made
    // `[openGroupLabel]` correct there; as a prop it can change, and a permission-filtered or
    // tenant-scoped nav would leave the flyout drawing the previous nav's children.
  }, [nav, openGroupLabel]);

  const renderLink = (item: WorkspaceNavLink, sub = false, inFlyout = false) => {
    const active = isActive(pathname, item.href);
    const onClick = (e: React.MouseEvent) => {
      // ⌘/Ctrl+click → open in a background tab (stay on the current page),
      // the same gesture as a browser. Plain click navigates as usual.
      // **Only when the app has tabs.** With no handler the gesture falls through to the browser's
      // own "open in a new tab", which is the better default for a console with no tab strip to
      // open into (`PD-232`).
      if ((e.metaKey || e.ctrlKey) && onBackgroundOpen) {
        e.preventDefault();
        onBackgroundOpen(item.href);
        return;
      }
      setOpenGroups((prev) => (collapsed && prev.size ? new Set() : prev));
      onNavigate?.();
    };
    const showLabel = inFlyout || !collapsed;
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onClick}
        aria-current={active ? "page" : undefined}
        title={
          collapsed && !inFlyout
            ? onBackgroundOpen
              ? `${item.label} — ⌘-click for a new tab`
              : item.label
            : undefined
        }
        className={cn(
          "group/nav flex h-9 items-center rounded-md transition-colors",
          collapsed && !inFlyout ? "w-9 justify-center px-0" : "gap-2.5 px-2",
          active
            ? "bg-sidebar-accent text-sidebar-foreground"
            : cn(
                "hover:bg-sidebar-accent hover:text-sidebar-foreground",
                sub && !inFlyout ? "text-muted-foreground" : "text-sidebar-foreground",
              ),
        )}
      >
        <NavIcon icon={item.icon} active={active} color={item.color} plain={sub && !inFlyout} />
        {showLabel && <span className="truncate">{item.label}</span>}
      </Link>
    );
  };

  const renderEntry = (entry: WorkspaceNavEntry) => {
    if (!isGroup(entry)) return renderLink(entry);

    const open = isExpanded(openGroups, entry.label);
    const anyActive = entry.children.some((c) => isActive(pathname, c.href));
    const GroupIcon = entry.icon;

    // Collapsed rail - inline mode: the icon plus a small corner chevron
    // badge (not inline beside it, so it never overflows the icon's own box);
    // children reveal indented underneath when toggled open.
    if (collapsed && groupMode === "inline")
      return (
        <div key={entry.label} className="space-y-1">
          <button
            type="button"
            onClick={() => toggleGroup(entry.label)}
            aria-expanded={open}
            title={entry.label}
            className={cn(
              "group/nav relative flex size-9 items-center justify-center rounded-md transition-colors",
              anyActive ? "text-sidebar-foreground" : "hover:bg-sidebar-accent",
            )}
          >
            <NavIcon icon={GroupIcon} active={anyActive} color={entry.color} />
            <ChevronRight
              className={cn(
                "absolute end-0.5 top-1/2 size-2.5 shrink-0 -translate-y-1/2 text-muted-foreground transition-transform",
                open && "rotate-90",
              )}
              aria-hidden="true"
            />
          </button>
          {open && (
            <div className="space-y-1">
              {entry.children.map((child) => renderLink(child, true))}
            </div>
          )}
        </div>
      );

    // Collapsed rail - flyout modes: the icon alone represents the group
    // (matching the leaf icons around it, no overlapping chevron); opening
    // its children panel (rendered separately, fixed-positioned) is either
    // click- or hover-triggered depending on groupMode.
    if (collapsed)
      return (
        <button
          key={entry.label}
          ref={(el) => {
            if (el) groupButtonRefs.current.set(entry.label, el);
            else groupButtonRefs.current.delete(entry.label);
          }}
          type="button"
          onClick={() => toggleGroup(entry.label)}
          onMouseEnter={
            groupMode === "flyout-hover" ? () => openGroupOnHover(entry.label) : undefined
          }
          onMouseLeave={groupMode === "flyout-hover" ? scheduleHoverClose : undefined}
          aria-expanded={open}
          aria-haspopup="menu"
          title={entry.label}
          className={cn(
            "group/nav flex size-9 items-center justify-center rounded-md transition-colors",
            open && "bg-sidebar-accent",
            anyActive ? "text-sidebar-foreground" : "hover:bg-sidebar-accent",
          )}
        >
          <NavIcon icon={GroupIcon} active={anyActive} color={entry.color} />
        </button>
      );

    return (
      <div key={entry.label} className="space-y-1">
        <button
          type="button"
          onClick={() => toggleGroup(entry.label)}
          aria-expanded={open}
          className={cn(
            "group/nav flex h-9 w-full items-center gap-2.5 rounded-md px-2 transition-colors",
            anyActive
              ? "text-sidebar-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent",
          )}
        >
          <NavIcon icon={GroupIcon} active={anyActive} color={entry.color} />
          <span className="flex-1 truncate text-left">{entry.label}</span>
          <ChevronRight className={cn(COMBOBOX_CHEVRON, open && "rotate-90")} aria-hidden="true" />
        </button>
        {open && (
          <div className="space-y-1">{entry.children.map((child) => renderLink(child, true))}</div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Workspace switcher + collapse toggle (same row) - header */}
      <div className="flex h-12 items-center gap-1 border-b border-sidebar-border bg-background px-3">
        {/*
          **A slot, not an `OrgSwitcher`.** The reactjs app puts a tenant switcher here; the operator
          console has no organizations to switch between, and `Logo` and `useBrand` live in
          `@repo/web-chrome`, which **depends on this package**, so importing them would be a cycle
          (`PD-232`).
        */}
        {fill(brand, collapsed ?? false)}
        {!collapsed && headerAction}
      </div>

      {/* Quick actions - fixed above the scrolling nav, with a full-width
          divider and comfortable top/bottom padding. */}
      <div className="border-b border-sidebar-border px-3 py-3">
        {fill(quickActions, collapsed ?? false)}
      </div>

      {/* Navigation */}
      <nav ref={navRef} className="flex-1 space-y-4 overflow-y-auto px-3 py-3">
        {nav.map((section, index) => (
          <React.Fragment key={section.title ?? `section-${index}`}>
            {/* Collapsed group separator - a nav-level sibling so the nav's
                space-y rhythm spaces it equally above and below. */}
            {section.title && collapsed && index > 0 && (
              <div className="mx-2 border-t border-sidebar-border" aria-hidden="true" />
            )}
            <div className="space-y-1">
              {section.title && !collapsed && (
                <p className="px-2 pb-1 text-sm font-medium text-muted-foreground">
                  {section.title}
                </p>
              )}
              {section.items.map(renderEntry)}
            </div>
          </React.Fragment>
        ))}
      </nav>

      {/* Collapsed-group flyout: fixed-positioned beside its trigger so it
          escapes the nav's overflow-y-auto clipping instead of the old
          inline-expand, which overflowed the rail and clipped the chevron. */}
      {openGroupEntry && flyoutPos && (
        <div
          ref={flyoutRef}
          style={{ top: flyoutPos.top, left: flyoutPos.left }}
          onMouseEnter={groupMode === "flyout-hover" ? cancelHoverClose : undefined}
          onMouseLeave={groupMode === "flyout-hover" ? scheduleHoverClose : undefined}
          className="fixed z-[200] min-w-44"
        >
          <MenuPanel
            tabIndex={-1}
            className="space-y-0.5 border-sidebar-border bg-sidebar p-1 shadow-lg"
          >
            <p className="truncate px-2 pb-1 pt-1 text-xs font-medium text-muted-foreground">
              {openGroupEntry.label}
            </p>
            {openGroupEntry.children.map((child) => renderLink(child, false, true))}
          </MenuPanel>
        </div>
      )}
    </>
  );
}

const SIDEBAR_WIDTH_KEY = "sidebar:width";
const SIDEBAR_COLLAPSED_KEY = "sidebar:collapsed";

type SidebarContextValue = {
  collapsed: boolean;
  width: number;
  resizing: boolean;
  toggleCollapsed: () => void;
  setWidth: React.Dispatch<React.SetStateAction<number>>;
  setResizing: React.Dispatch<React.SetStateAction<boolean>>;
  persist: (w: number, c: boolean) => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

function useSidebar(): SidebarContextValue {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within <SidebarProvider>");
  return ctx;
}

/**
 * Shares the sidebar's collapsed/width state so both the sidebar and the page
 * header can read + toggle it (ui-system puts the expand toggle in the page
 * header once the rail is collapsed). Persists to localStorage.
 */
export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [width, setWidth] = React.useState(SIDEBAR_DEFAULT_WIDTH);
  const [collapsed, setCollapsed] = React.useState(false);
  const [resizing, setResizing] = React.useState(false);

  React.useEffect(() => {
    // `storedWidth` folds three cases into one: missing, unparseable, and out of range all give
    // null. `Number(null)` and `Number("")` are both 0, which fails the bounds, so a missing key
    // needs no separate branch.
    const saved = storedWidth(localStorage.getItem(SIDEBAR_WIDTH_KEY));
    if (saved !== null) setWidth(saved);
    setCollapsed(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true");
  }, []);

  const persist = React.useCallback((w: number, c: boolean) => {
    try {
      localStorage.setItem(SIDEBAR_WIDTH_KEY, String(w));
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(c));
    } catch {
      // storage unavailable - non-fatal
    }
  }, []);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    persist(width, next);
  };

  return (
    <SidebarContext.Provider
      value={{
        collapsed,
        width,
        resizing,
        toggleCollapsed,
        setWidth,
        setResizing,
        persist,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

/**
 * Desktop-only (≥ md) left sidebar, matching ui-system: the collapse toggle sits
 * inline with the workspace title; drag the right edge to resize its width.
 */
export function AppSidebar(slots: WorkspaceShellSlots) {
  const { collapsed, width, resizing, setWidth, setResizing, persist } = useSidebar();

  function startResize(e: React.MouseEvent) {
    if (collapsed) return;
    e.preventDefault();
    setResizing(true);
    const startX = e.clientX;
    const startW = width;
    const clamp = (dx: number) => clampWidth(startW + dx);
    const onMove = (ev: MouseEvent) => setWidth(clamp(ev.clientX - startX));
    const onUp = (ev: MouseEvent) => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      setResizing(false);
      persist(clamp(ev.clientX - startX), collapsed);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
  }

  return (
    <aside
      style={{ width: sidebarWidth(width, collapsed) }}
      className={cn(
        // `border-e`, not `border-r`: the logical edge follows the reading
        // direction, so RTL puts the border on the correct side by itself.
        "relative hidden shrink-0 flex-col border-e border-sidebar-border bg-sidebar md:flex",
        // Appearance: the floating variant lifts the sidebar off the background
        // and rounds it; inset and plain leave these variables at zero.
        "rounded-[var(--vui-sidebar-radius,0px)] shadow-[var(--vui-sidebar-shadow,none)]",
        "m-[var(--vui-shell-gap,0px)] me-0",
        !resizing && "transition-[width] duration-200 ease-out",
      )}
    >
      <SidebarBody collapsed={collapsed} {...slots} />

      {/* Resize handle (right edge) */}
      {!collapsed && (
        <button
          type="button"
          aria-label="Resize sidebar"
          title="Drag to resize"
          onMouseDown={startResize}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") {
              e.preventDefault();
              setWidth((w) => {
                const n = Math.max(SIDEBAR_MIN_WIDTH, w - 16);
                persist(n, collapsed);
                return n;
              });
            }
            if (e.key === "ArrowRight") {
              e.preventDefault();
              setWidth((w) => {
                const n = Math.min(SIDEBAR_MAX_WIDTH, w + 16);
                persist(n, collapsed);
                return n;
              });
            }
          }}
          className={cn(
            "absolute inset-y-0 -end-1 z-10 w-2 cursor-col-resize touch-none bg-transparent transition-colors hover:bg-primary/40 focus-visible:bg-primary/60 focus-visible:outline-none",
            resizing && "bg-primary/50",
          )}
        />
      )}
    </aside>
  );
}

/**
 * Global sidebar collapse/expand toggle. Lives in the top bar so it's always
 * available regardless of page or collapsed state (desktop only).
 */
export function SidebarToggle() {
  const { collapsed, toggleCollapsed } = useSidebar();
  return (
    <button
      type="button"
      onClick={toggleCollapsed}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      aria-expanded={!collapsed}
      title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      className="hidden size-9 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:grid"
    >
      <Menu className="size-5" aria-hidden="true" />
    </button>
  );
}

/** @deprecated Use the SidebarToggle in the top bar. Kept as a no-op shim. */
export function SidebarExpandButton() {
  return null;
}

const BOTTOM_BAR_ITEMS: WorkspaceNavLink[] = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Settings", href: "/settings", icon: Settings },
];

/**
 * Mobile navigation (< md), matching ui-system: a fixed bottom bar whose
 * "Menu" button toggles a full-width (100vw) slide-in drawer. Drawer closes on
 * navigation, the Menu toggle, Escape, or the in-drawer close button.
 */
export function MobileNav(slots: WorkspaceShellSlots) {
  const { pathname, Link } = slots;
  const [open, setOpen] = React.useState(false);
  const close = React.useCallback(() => setOpen(false), []);

  // Close the drawer whenever the route changes.
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll + Escape-to-close while the drawer is open.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      {/* Full-width slide-in drawer */}
      <div
        id="mobile-nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        aria-hidden={!open}
        className={cn(
          "fixed inset-0 z-20 flex w-full flex-col bg-sidebar pb-14 transition-transform duration-200 ease-out md:hidden",
          open ? "translate-x-0" : "pointer-events-none -translate-x-full",
        )}
      >
        <SidebarBody
          {...slots}
          onNavigate={close}
          headerAction={
            <button
              type="button"
              onClick={close}
              aria-label="Close navigation"
              className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-sidebar-accent"
            >
              <X className="size-4" />
            </button>
          }
        />
      </div>

      {/*
        Fixed bottom navigation bar, one layer above the drawer.

        **Three relationships have to survive, and putting both on one layer broke two of them.**
        As an app file this was `drawer 40 < bar 50 < sheet 60`: the bar sits above the drawer,
        which reserves `pb-14` precisely so the bar stays visible, and a sheet covers both. Moving
        into `packages/` put this file under `check:z-layers` for the first time, and the first pass
        answered that guard by collapsing the pair onto the slide-over layer. That tied the bar with
        the drawer, leaving DOM order to decide which won, and tied both with sheets, so a sheet
        stopped covering them. `20` and `30` are on the documented scale and keep all three
        orderings as they were.
      */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t border-sidebar-border bg-sidebar md:hidden"
      >
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-nav-drawer"
          aria-label="Menu"
          className={cn(
            "flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors",
            open
              ? "text-sidebar-accent-foreground"
              : "text-muted-foreground hover:text-sidebar-accent-foreground",
          )}
        >
          <Menu className="size-5" aria-hidden="true" />
          Menu
        </button>
        {BOTTOM_BAR_ITEMS.map((item) => {
          const active = !open && isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors",
                active
                  ? "text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="size-5 shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
