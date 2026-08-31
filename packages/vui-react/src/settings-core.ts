/**
 * The settings screen's sections, its theme switch and its preference lists (`PD-040`).
 *
 * **`applyColorScheme` is the reason this module exists.** Light, dark and system is not a preference
 * stored in one place: it toggles a class on `<html>`, and "system" means *forget the choice* rather
 * than *store the word system*, so a reader who picks it follows the operating system afterwards.
 * Two editions implementing that separately is two different behaviours for the same three buttons,
 * and the bug is invisible until someone changes their OS theme.
 *
 * It is `applyColorScheme` and not `applyTheme` because `theme-config.ts` already owns that name for
 * a different job: applying a `ThemeConfig`'s token values as CSS custom properties. Light, dark and
 * system is the **colour scheme**, which is one class on `<html>`, and the barrel refused to compile
 * two `applyTheme`s, which is how the confusion got a name instead of a bug.
 *
 * The preference lists live here rather than in an app because they are the same product decision in
 * every edition: what clicking a record name does, whether a saved row flashes, and whether a delete
 * asks first. `apps/web/reactjs/lib/app-config.ts` re-exports them rather than declaring its own, so
 * there is one list and not a third copy.
 *
 * The first version of these lists was written from a partial reading of the React app's and was
 * **two rows short**, which made "confirm before deleting" unreachable in the Vue edition while
 * `coercePreference` still handled its value. That is the tell worth remembering: a coercion for a
 * key no list offers means the list is the thing that is wrong.
 */
export type ThemeChoice = "light" | "dark" | "system";

/** Three choices, each with a glyph key. A component cannot cross the boundary; a string can. */
export const THEME_OPTIONS: readonly { value: ThemeChoice; label: string; icon: string }[] = [
  { value: "light", label: "Light", icon: "sun" },
  { value: "dark", label: "Dark", icon: "moon" },
  { value: "system", label: "System", icon: "desktop" },
];

export const THEME_STORAGE_KEY = "theme";

/**
 * Put the choice into effect.
 *
 * `system` **removes** the stored value rather than storing the word, which is what makes the
 * operating system's own preference win from then on. Storage can throw in a private window, and a
 * theme switch is not worth an error dialog, so that failure is swallowed deliberately.
 */
export function applyColorScheme(theme: ThemeChoice, root: HTMLElement, storage?: Storage): void {
  const dark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark", dark);

  /**
   * **The storage is reached for inside the `try`, not passed in.**
   *
   * Callers used to hand `window.localStorage` as an argument, which is evaluated *before* this
   * function runs: in Safari with all cookies blocked, or a WebView with storage disabled, merely
   * reading that property throws `SecurityError`, so the throw happened at the call site and the
   * class toggle above never executed. The three scheme buttons then did nothing at all, which is
   * the opposite of what this comment used to promise. A caller may still pass a `Storage` (a test
   * with a fake one does), and when it does not, this reaches for the real one from in here.
   */
  try {
    const store = storage ?? (typeof window === "undefined" ? undefined : window.localStorage);
    if (theme === "system") store?.removeItem(THEME_STORAGE_KEY);
    else store?.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // A private window can refuse storage. The class is already applied, which is the visible half.
  }
}

/**
 * The three keys the behaviour section holds.
 *
 * A union rather than `string`, because the React app indexes its `BehaviourConfig` with it and a
 * widened key turns that into an implicit `any`. The list and the config agree by construction.
 */
export type BehaviourPreferenceKey = "rowClick" | "flashMs" | "confirmDelete";

export interface PreferenceField {
  key: BehaviourPreferenceKey;
  label: string;
  hint: string;
  options: readonly { value: string; label: string }[];
}

export const DATA_TABLE_PREFERENCES: readonly PreferenceField[] = [
  {
    key: "rowClick",
    label: "Clicking a record name",
    hint: "Open it for reading, open it for editing, or do nothing.",
    options: [
      { value: "view", label: "Open to view" },
      { value: "edit", label: "Open to edit" },
      { value: "none", label: "Do nothing" },
    ],
  },
  {
    key: "flashMs",
    label: "Highlight a row after saving",
    hint: "A brief highlight so you can see what changed.",
    options: [
      { value: "1600", label: "On" },
      { value: "0", label: "Off" },
    ],
  },
  {
    key: "confirmDelete",
    label: "Confirm before deleting",
    hint: "Ask first, or delete straight away and rely on the trash.",
    options: [
      { value: "true", label: "Ask first" },
      { value: "false", label: "Delete straight away" },
    ],
  },
];

/** The `VuiConfig` section these preferences live under. One name, so neither edition guesses. */
export const PREFERENCE_SECTION = "behaviour" as const;

/**
 * A `<Select>` hands back a string; the config wants the real type.
 *
 * Per key, and shared, because storing `"1600"` where a number is expected is a preference that
 * reads back as set and behaves as unset. React coerces `flashMs` to a number and `confirmDelete` to
 * a boolean inline; this is the same three branches with one owner.
 */
export function coercePreference(key: string, value: string): string | number | boolean {
  if (key === "flashMs") return Number(value);
  if (key === "confirmDelete") return value === "true";
  return value;
}

export const NOTIFICATION_PREFERENCES: readonly { key: string; label: string; hint: string }[] = [
  { key: "email", label: "Email", hint: "Digests, mentions and account notices." },
  { key: "desktop", label: "Desktop", hint: "Browser notifications while the app is open." },
  { key: "weekly", label: "Weekly summary email", hint: "One digest on Monday morning." },
];

export const SETTINGS_COPY = {
  title: "Settings",
  sections: {
    profile: { title: "Profile", description: "Your personal information." },
    appearance: { title: "Appearance", description: "Choose how the app looks." },
    notifications: {
      title: "Notifications",
      description: "Pick what you want to hear about.",
    },
    dataTable: {
      title: "Data tables",
      description:
        "How record lists behave for you. Saved to this browser, and only these are yours to change: the rest of the layout is the app's.",
    },
    theme: {
      title: "Theme",
      description: "The tokens every edition of this product reads.",
    },
  },
  reset: "Reset to defaults",
  fields: { name: "Name", email: "Email", role: "Role", logo: "Logo" },
} as const;

export const ROLE_OPTIONS = [
  { value: "administrator", label: "Administrator" },
  { value: "manager", label: "Manager" },
  { value: "viewer", label: "Viewer" },
] as const;

/** The profile this demo opens with, so a screenshot of one edition is a screenshot of the other. */
export const DEMO_PROFILE = {
  name: "Admin User",
  email: "admin@viliha.example",
  role: "administrator",
} as const;
