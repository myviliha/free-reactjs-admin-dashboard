"use client";

import * as React from "react";

/**
 * The theme's configuration spine.
 *
 * The preconfigured theme is itself a config: {@link vuiPreset} is a plain value
 * built from the same API you would use, and it is what the components fall back
 * to when nothing else is set. So there is no "configurable" variant of a
 * component sitting beside an opinionated one — every component reads resolved
 * config, and the shipped look is one particular resolution.
 *
 * Values resolve in this order, and a later layer only overrides the keys it
 * mentions:
 *
 * ```
 * package default ← vuiPreset ← <VuiProvider config> ← user preference ← prop
 * ```
 *
 * A per-instance prop always wins, so a screen that genuinely needs something
 * different never has to fight the app config.
 *
 * ```tsx
 * // Out of the box: nothing to write. The preset is the default.
 * <RecordView … />
 *
 * // Change part of it for the whole app.
 * <VuiProvider config={{ form: { actions: (d) => [...d, saveAndNew] } }}>
 *   {children}
 * </VuiProvider>
 * ```
 */
/**
 * The contract moved to `config-core.ts` on 2026-08-20, so both editions share one config type and a
 * host's config object type-checks against either. **Nothing about this edition's API changed**: every
 * type is re-exported here, and the three that carry a framework value are bound to React's.
 */
export type {
  BehaviourConfig,
  FormActionContext,
  FormActionOutcome,
  FormRow,
  FormSection,
  IoContext,
  OrgSwitcherConfig,
  SectionColumns,
  ServerQueryLike,
  ThemeAwareOrgConfig,
  UserConfigurable,
} from "./config-core";
export { defineConfig, filterUserPreferences, mergeConfig, vuiPreset } from "./config-core";

import type {
  FormAction as CoreFormAction,
  FormActionsConfig as CoreFormActionsConfig,
  FormConfig as CoreFormConfig,
  FormSlot as CoreFormSlot,
  IoAction as CoreIoAction,
  IoActionsConfig as CoreIoActionsConfig,
  TableConfig as CoreTableConfig,
  VuiConfig as CoreVuiConfig,
  VuiPreferences as CoreVuiPreferences,
  UserConfigurable,
} from "./config-core";
import { filterUserPreferences, mergeConfig, vuiPreset } from "./config-core";

/** An icon in this edition is a component that takes a className. */
type ReactIcon = React.ComponentType<{ className?: string }>;

/**
 * **The containers are bound too, not just the leaves.** Binding only `FormAction` and `IoAction` left
 * `VuiConfig`'s own action lists at the `unknown` default, so a host could pass anything as an icon and
 * React threw when it rendered it. A review caught it; the generic threads all the way down now.
 */
export type VuiConfig = CoreVuiConfig<ReactIcon>;
export type VuiPreferences = CoreVuiPreferences<ReactIcon>;
export type FormConfig = CoreFormConfig<ReactIcon>;
export type TableConfig = CoreTableConfig<ReactIcon>;
export type FormSlot<T> = CoreFormSlot<T, React.ReactNode>;
export type IoAction<T> = CoreIoAction<T, ReactIcon>;
export type IoActionsConfig<T> = CoreIoActionsConfig<T, ReactIcon>;
export type FormAction<T> = CoreFormAction<T, ReactIcon>;
export type FormActionsConfig<T> = CoreFormActionsConfig<T, ReactIcon>;

const VuiConfigContext = React.createContext<VuiConfig>(vuiPreset);

type PreferencesCtx = {
  /** The stored choices, as saved. */
  preferences: VuiPreferences;
  /** Which keys this app opened up. Drive a settings UI from it. */
  userConfigurable: UserConfigurable;
  /** Set one key. Ignored (with no write) when the app didn't allow it. */
  setPreference: <K extends keyof VuiConfig>(
    section: K,
    key: keyof NonNullable<VuiConfig[K]>,
    value: unknown,
  ) => void;
  /** Forget every stored choice and fall back to the app's config. */
  reset: () => void;
};

const VuiPreferencesContext = React.createContext<PreferencesCtx | null>(null);

/** Drop any stored key the app hasn't opened up. Exported for testing. */

/**
 * Apply a config to everything below. Optional: without it the components use
 * {@link vuiPreset}, which is the theme as shipped.
 *
 * Pass `userConfigurable` to let the person using the app override some of it
 * from inside the app. Their choices are saved per browser and merged over your
 * config, so the preconfigured theme stays changeable at runtime without the
 * host giving up control of what may change.
 */
export function VuiProvider({
  config,
  userConfigurable,
  storageKey = "vui.prefs",
  children,
}: {
  config?: VuiConfig;
  userConfigurable?: UserConfigurable;
  /** localStorage key for the user's choices. Default `"vui.prefs"`. */
  storageKey?: string;
  children: React.ReactNode;
}) {
  const editable = React.useMemo(() => userConfigurable ?? {}, [userConfigurable]);
  const [preferences, setPreferences] = React.useState<VuiPreferences>({});

  // Read after mount, so the prerendered HTML and the first client render agree.
  // A preference that changes something visible settles one frame late, which is
  // the same trade the top-bar chrome flags make.
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed: unknown = JSON.parse(raw);
      if (parsed && typeof parsed === "object") setPreferences(parsed as VuiPreferences);
    } catch {
      // malformed or blocked storage — the app's config stands
    }
  }, [storageKey]);

  const setPreference = React.useCallback<PreferencesCtx["setPreference"]>(
    (section, key, value) => {
      const keys = editable[section] as readonly string[] | undefined;
      if (!keys?.includes(key as string)) return; // not open to the user
      setPreferences((prev) => {
        const next = {
          ...prev,
          [section]: { ...(prev[section] ?? {}), [key]: value },
        } as VuiPreferences;
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          // storage unavailable — the change stays in memory for this session
        }
        return next;
      });
    },
    [editable, storageKey],
  );

  const reset = React.useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore storage failures
    }
    setPreferences({});
  }, [storageKey]);

  const value = React.useMemo(
    () => mergeConfig(vuiPreset, config, filterUserPreferences(preferences, editable)),
    [config, preferences, editable],
  );
  const prefsValue = React.useMemo(
    () => ({ preferences, userConfigurable: editable, setPreference, reset }),
    [preferences, editable, setPreference, reset],
  );

  return (
    <VuiConfigContext.Provider value={value}>
      <VuiPreferencesContext.Provider value={prefsValue}>{children}</VuiPreferencesContext.Provider>
    </VuiConfigContext.Provider>
  );
}

/**
 * Read and write the user's own choices — for a Settings screen. Returns `null`
 * when there is no {@link VuiProvider} above, so a settings section can hide
 * itself rather than crash.
 */
export function useVuiPreferences(): PreferencesCtx | null {
  return React.useContext(VuiPreferencesContext);
}

/** The resolved config (preset merged with any provider above). */
export function useVuiConfig(): VuiConfig {
  return React.useContext(VuiConfigContext);
}

/**
 * Resolve one config section: a per-instance prop wins outright, otherwise the
 * provider's value, otherwise the preset's. This is the whole resolution rule —
 * every component that takes config should use it rather than reinventing one.
 */
export function useResolved<K extends keyof VuiConfig>(
  section: K,
  prop: VuiConfig[K] | undefined,
): VuiConfig[K] {
  const config = useVuiConfig();
  return React.useMemo(
    () => ({ ...(config[section] ?? {}), ...(prop ?? {}) }) as VuiConfig[K],
    [config, section, prop],
  );
}
