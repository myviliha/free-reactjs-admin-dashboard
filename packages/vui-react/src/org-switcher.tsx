"use client";

import * as React from "react";
import {
  ORG_ADD_ROW,
  ORG_AVATAR_EMPTY,
  ORG_AVATAR_ICON,
  ORG_AVATAR_IMAGE,
  ORG_AVATAR_LABEL,
  ORG_FOOTER,
  ORG_ITEM,
  ORG_ITEM_BADGE,
  ORG_ITEM_HINT,
  ORG_ITEM_META,
  ORG_ITEM_META_ICON,
  ORG_ITEM_NAME,
  ORG_ITEM_ROW,
  ORG_ITEM_TEXT,
  ORG_LIST,
  ORG_MARK,
  ORG_PANEL,
  ORG_PANEL_LABEL,
  ORG_PLAN_STATUS_STATES,
  ORG_SEPARATOR,
  ORG_TRIGGER,
  ORG_TRIGGER_CHEVRON,
  ORG_TRIGGER_CHEVRON_OPEN,
  ORG_TRIGGER_COLLAPSED,
  ORG_TRIGGER_EXPANDED,
  ORG_TRIGGER_META,
  ORG_TRIGGER_NAME,
  ORG_TRIGGER_SKELETON,
  ORG_TRIGGER_STATES,
  ORG_TRIGGER_TEXT,
} from "./class-variants";
import { type OrgSwitcherConfig, type ThemeAwareOrgConfig, useResolved } from "./config";
import {
  CheckCircle as CheckCircledIcon,
  ChevronDown as ChevronDownIcon,
  Warning as ExclamationTriangleIcon,
  Home as HomeIcon,
  Plus as PlusIcon,
} from "./icons";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "./utils";

/**
 * One organization a person belongs to. `id` and `name` are all that's needed;
 * everything else fills in the row when you have it.
 */
/**
 * The contract and the two resolvers moved to `org-core.ts` on 2026-08-20, so one organization list and
 * one "which tenant is current" rule serve both editions. **The public API is unchanged.**
 */
export type { Organization, SwitchHandler } from "./org-core";
export { resolveAddTarget, resolveCurrentId } from "./org-core";

import type { Organization, SwitchHandler } from "./org-core";
import { resolveAddTarget, resolveCurrentId } from "./org-core";

type OrgCtx = {
  organizations: Organization[];
  current: Organization | undefined;
  currentId: string | undefined;
  switchTo: (id: string) => void;
  /** The id being switched to while a handler is in flight. */
  switching: string | undefined;
  error: unknown;
};

const OrgContext = React.createContext<OrgCtx | null>(null);

/**
 * Which organization should be current, given the list and the stored choice.
 * Falls back to the first available one, so access being revoked (or a tenant
 * being deleted) can't leave someone pinned to an organization they aren't in.
 * Returns `undefined` while the list is still empty, which reads as loading.
 *
 * Exported for testing.
 */

/**
 * The default switching logic, and the place to replace it.
 *
 * Out of the box: selecting an organization sets it as current and remembers it
 * per browser, so the choice survives a reload. That is enough for an app whose
 * data layer reads the current organization.
 *
 * When your switch means more than that (a server call to move the session, a
 * cookie your API reads, a hard navigation), pass `onSwitch`. It runs before the
 * current organization changes, and throwing from it cancels the switch, so a
 * failed server call leaves the user where they were instead of showing them a
 * tenant they aren't in.
 *
 * ```tsx
 * <OrgProvider
 *   organizations={orgs}
 *   defaultOrgId={session.orgId}
 *   onSwitch={async (org) => { await api.post("/session/org", { id: org.id }); }}
 * >
 * ```
 */
export function OrgProvider({
  organizations,
  defaultOrgId,
  onSwitch,
  storageKey = "vui.org",
  persist = true,
  children,
}: {
  organizations: Organization[];
  /** Which one is current on first load. Defaults to the first in the list. */
  defaultOrgId?: string;
  /** Your switching logic, run before the change. Throw to cancel it. */
  onSwitch?: SwitchHandler;
  /** localStorage key for the remembered choice. */
  storageKey?: string;
  /** Set `false` when the current organization comes from your session and the
   *  browser has no business remembering it. */
  persist?: boolean;
  children: React.ReactNode;
}) {
  const [currentId, setCurrentId] = React.useState<string | undefined>(
    defaultOrgId ?? organizations[0]?.id,
  );
  const [switching, setSwitching] = React.useState<string | undefined>();
  const [error, setError] = React.useState<unknown>(null);
  const onSwitchRef = React.useRef(onSwitch);
  onSwitchRef.current = onSwitch;

  // Read the remembered choice after mount, so the server-rendered HTML and the
  // first client render agree.
  React.useEffect(() => {
    if (!persist) return;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored && organizations.some((o) => o.id === stored)) setCurrentId(stored);
    } catch {
      // blocked storage — the default stands
    }
  }, [persist, storageKey, organizations]);

  // A tenant that disappears (access revoked, org deleted) must not stay
  // current, and the first one to arrive becomes it.
  React.useEffect(() => {
    setCurrentId((prev) => resolveCurrentId(organizations, prev));
  }, [organizations]);

  const switchTo = React.useCallback(
    (id: string) => {
      const org = organizations.find((o) => o.id === id);
      if (!org || id === currentId) return;
      const commit = () => {
        setCurrentId(id);
        if (persist) {
          try {
            localStorage.setItem(storageKey, id);
          } catch {
            // blocked storage — the switch still applies for this session
          }
        }
      };
      setError(null);
      const handler = onSwitchRef.current;
      if (!handler) return commit();
      let result: void | Promise<void>;
      try {
        result = handler(org);
      } catch (err) {
        setError(err); // the host refused the switch
        return;
      }
      if (!result || typeof result.then !== "function") return commit();
      setSwitching(id);
      void result.then(
        () => {
          setSwitching(undefined);
          commit();
        },
        (err: unknown) => {
          setSwitching(undefined);
          setError(err);
        },
      );
    },
    [organizations, currentId, persist, storageKey],
  );

  const value = React.useMemo<OrgCtx>(
    () => ({
      organizations,
      current: organizations.find((o) => o.id === currentId),
      currentId,
      switchTo,
      switching,
      error,
    }),
    [organizations, currentId, switchTo, switching, error],
  );

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
}

/** The current organization and the switcher, for anything that needs to scope
 *  itself. Returns `null` with no {@link OrgProvider} above. */
export function useOrg(): OrgCtx | null {
  return React.useContext(OrgContext);
}

const PLAN_ICON = {
  active: { Icon: CheckCircledIcon, className: ORG_PLAN_STATUS_STATES.active },
  trialing: { Icon: CheckCircledIcon, className: ORG_PLAN_STATUS_STATES.trialing },
  past_due: { Icon: ExclamationTriangleIcon, className: ORG_PLAN_STATUS_STATES.past_due },
  canceled: { Icon: ExclamationTriangleIcon, className: ORG_PLAN_STATUS_STATES.canceled },
} as const;

/**
 * Where the create row points: a handler wins, then this instance's route, then
 * the app's config. Nothing set means there is no way to create an organization
 * here, and the row is hidden rather than rendered dead.
 *
 * Exported for testing.
 */

const ADD_ROW = ORG_ADD_ROW;

function AddRowContent({ label }: { label: string }) {
  return (
    <>
      <span className={ORG_AVATAR_EMPTY}>
        <PlusIcon className={ORG_AVATAR_ICON} />
      </span>
      <span className={ORG_AVATAR_LABEL}>{label}</span>
    </>
  );
}

/** Square mark for a row: the organization's logo, or its initial. */
function OrgMark({ org, className }: { org: Organization; className?: string }) {
  return (
    <span className={cn(ORG_MARK, className)}>
      {org.logoUrl ? (
        <img src={org.logoUrl} alt="" className={ORG_AVATAR_IMAGE} />
      ) : (
        <HomeIcon className={ORG_AVATAR_ICON} />
      )}
    </span>
  );
}

/**
 * The organization switcher: the brand block at the top of the sidebar, and the
 * list it opens.
 *
 * The design is fixed so every install reads the same way. What you supply is
 * the logic: `OrgProvider` owns switching (see there for replacing it), `onAdd`
 * decides where "Add organization" goes, and `VuiProvider`'s `orgSwitcher`
 * section sets the labels and whether the plan line and Add row appear.
 *
 * ```tsx
 * <OrgSwitcher logo={<Logo />} productName="PULSE" onAdd={() => router.push("/register-business")} />
 * ```
 */
export function OrgSwitcher({
  logo,
  productName,
  collapsed = false,
  onAdd,
  addHref,
  onNavigate,
  config,
  className,
}: {
  /** The product mark, rendered at the left of the trigger. */
  logo?: React.ReactNode;
  /** The product name, above the current organization. */
  productName: string;
  /** Rail mode: the mark only. */
  collapsed?: boolean;
  /** Custom behaviour for "Add organization" (open a dialog, start a flow).
   *  Wins over `addHref`. */
  onAdd?: () => void;
  /** Where the row goes, overriding `orgSwitcher.addHref` from config for this
   *  one instance. */
  addHref?: string;
  /** Client-side navigation for `addHref` (e.g. `router.push`). Without it the
   *  link navigates normally, which still works, just with a full page load. */
  onNavigate?: (href: string) => void;
  /** Per-instance overrides; falls back to `VuiProvider`'s `orgSwitcher`. */
  config?: OrgSwitcherConfig;
  className?: string;
}) {
  const org = useOrg();
  const resolved = useResolved("orgSwitcher", config) ?? {};
  const [open, setOpen] = React.useState(false);

  const showPlan = resolved.showPlan ?? true;
  const heading = resolved.heading ?? "Organizations";
  const addLabel = resolved.addLabel ?? "Add organization";
  const currentLabel = resolved.currentLabel ?? "Current";
  const addTarget = resolveAddTarget(onAdd, addHref, resolved.addHref);
  const showAdd = (resolved.showAdd ?? true) && Boolean(addTarget.onAdd || addTarget.href);

  if (!org) return null; // no OrgProvider above: nothing to switch
  const { organizations, current, currentId, switchTo, switching } = org;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Switch organization. Current: ${current?.name ?? "none"}`}
          title={collapsed ? current?.name : undefined}
          className={cn(
            ORG_TRIGGER,
            // Open reads as a held state, so it's obvious the panel belongs to
            // this control.
            open ? ORG_TRIGGER_STATES.open : ORG_TRIGGER_STATES.closed,
            collapsed ? ORG_TRIGGER_COLLAPSED : ORG_TRIGGER_EXPANDED,
            className,
          )}
        >
          {logo}
          {!collapsed && (
            <>
              <span className={ORG_TRIGGER_TEXT}>
                <span className={ORG_TRIGGER_NAME}>{productName}</span>
                {/* The line keeps its height while the list loads, so the brand
                    block doesn't jump when the name arrives. */}
                <span className={ORG_TRIGGER_META}>
                  {current?.name ?? <span className={ORG_TRIGGER_SKELETON} />}
                </span>
              </span>
              <ChevronDownIcon
                className={cn(ORG_TRIGGER_CHEVRON, open && ORG_TRIGGER_CHEVRON_OPEN)}
              />
            </>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" sideOffset={6} className={ORG_PANEL}>
        <p className={ORG_PANEL_LABEL}>{heading}</p>
        <ul role="list" className={ORG_LIST}>
          {organizations.map((item) => {
            const isCurrent = item.id === currentId;
            const status = item.planStatus ?? "active";
            const { Icon, className: statusClass } = PLAN_ICON[status];
            return (
              <li key={item.id}>
                <button
                  type="button"
                  disabled={switching !== undefined}
                  aria-current={isCurrent || undefined}
                  onClick={() => {
                    switchTo(item.id);
                    setOpen(false);
                  }}
                  className={ORG_ITEM}
                >
                  <OrgMark org={item} />
                  <span className={ORG_ITEM_TEXT}>
                    <span className={ORG_ITEM_ROW}>
                      <span className={ORG_ITEM_NAME}>{item.name}</span>
                      {isCurrent && <span className={ORG_ITEM_BADGE}>{currentLabel}</span>}
                    </span>
                    {showPlan && item.plan && (
                      <span className={ORG_ITEM_META}>
                        {item.plan}
                        <Icon className={cn(ORG_ITEM_META_ICON, statusClass)} />
                      </span>
                    )}
                  </span>
                  {switching === item.id && <span className={ORG_ITEM_HINT}>Switching…</span>}
                </button>
              </li>
            );
          })}
        </ul>
        {showAdd && (
          <>
            <div className={ORG_SEPARATOR} />
            <div className={ORG_FOOTER}>
              {/* A route renders as a real link, so middle-click and "open in
                  new tab" behave; `onNavigate` keeps a normal click on the
                  client router. A handler renders a button, because there is
                  nowhere to go. */}
              {addTarget.onAdd ? (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    addTarget.onAdd!();
                  }}
                  className={ADD_ROW}
                >
                  <AddRowContent label={addLabel} />
                </button>
              ) : (
                <a
                  href={addTarget.href}
                  onClick={(e) => {
                    setOpen(false);
                    if (!onNavigate || e.metaKey || e.ctrlKey || e.shiftKey) return;
                    e.preventDefault();
                    onNavigate(addTarget.href!);
                  }}
                  className={ADD_ROW}
                >
                  <AddRowContent label={addLabel} />
                </a>
              )}
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
