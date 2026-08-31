import type { ComponentType } from "react";

import AlertsScreen from "./screens/AlertsScreen";
import AvatarsScreen from "./screens/AvatarsScreen";
import BadgeScreen from "./screens/BadgeScreen";
import BarChartScreen from "./screens/BarChartScreen";
import BasicTablesScreen from "./screens/BasicTablesScreen";
import BlankScreen from "./screens/BlankScreen";
import ButtonsScreen from "./screens/ButtonsScreen";
import CalendarScreen from "./screens/CalendarScreen";
import DashboardScreen from "./screens/DashboardScreen";
import FormElementsScreen from "./screens/FormElementsScreen";
import ImagesScreen from "./screens/ImagesScreen";
import LayoutsScreen from "./screens/LayoutsScreen";
import LineChartScreen from "./screens/LineChartScreen";
import ModalsScreen from "./screens/ModalsScreen";
import NotFoundScreen from "./screens/NotFoundScreen";
import ProfileScreen from "./screens/ProfileScreen";
import SignInScreen from "./screens/SignInScreen";
import SignUpScreen from "./screens/SignUpScreen";
import VideosScreen from "./screens/VideosScreen";

/**
 * Address to screen, for every route in `FREE_ROUTES`.
 *
 * **This is the table Next kept in the filesystem.** The App Router derived it from folder names and
 * `page.tsx` files, and the per-page `title` came from a `metadata` export beside each one; neither
 * exists outside Next, so both live here now, in one place a reader can count.
 *
 * `routes.test.ts` holds this against `FREE_ROUTES` in both directions, so an address with no screen
 * and a screen with no address are both failures rather than a blank page. `FREE_ROUTES` is derived
 * from the shared sidebar in `@viliha/vui-core`, so the three cannot disagree.
 */
export type Screen = {
  component: ComponentType;
  /** The document title, which was a `metadata` export per page under Next. */
  title: string;
  /**
   * Which furniture the screen renders inside. **Stated for every route, never defaulted.**
   *
   * These were Next's route groups: sixteen screens sat in `(shell)`, the two authentication screens
   * in `(auth)`, and the 404 in neither. A sign-in page offering navigation is offering a way around
   * itself, and a 404 wrapped in working navigation implies the navigation is trustworthy on a page
   * that just failed to resolve an address; both are why the three are not simply "the shell".
   *
   * A `?? "shell"` default would read the same and tell nobody which screens are the exceptions, so
   * `routes.test.ts` asserts the three by name.
   */
  chrome: "shell" | "auth" | "none";
};

export const SCREENS: Record<string, Screen> = {
  "/": { component: DashboardScreen, title: "Ecommerce Dashboard", chrome: "shell" },
  "/alerts": { component: AlertsScreen, title: "Alerts", chrome: "shell" },
  "/avatars": { component: AvatarsScreen, title: "Avatar", chrome: "shell" },
  "/badge": { component: BadgeScreen, title: "Badges", chrome: "shell" },
  "/bar-chart": { component: BarChartScreen, title: "Bar Chart", chrome: "shell" },
  "/basic-tables": { component: BasicTablesScreen, title: "Basic Tables", chrome: "shell" },
  "/blank": { component: BlankScreen, title: "Blank Page", chrome: "shell" },
  "/buttons": { component: ButtonsScreen, title: "Buttons", chrome: "shell" },
  "/calendar": { component: CalendarScreen, title: "Calendar", chrome: "shell" },
  "/error-404": { component: NotFoundScreen, title: "404 Error", chrome: "none" },
  "/form-elements": { component: FormElementsScreen, title: "Form Elements", chrome: "shell" },
  "/images": { component: ImagesScreen, title: "Images", chrome: "shell" },
  "/layouts": { component: LayoutsScreen, title: "Layouts", chrome: "shell" },
  "/line-chart": { component: LineChartScreen, title: "Line Chart", chrome: "shell" },
  "/modals": { component: ModalsScreen, title: "Modals", chrome: "shell" },
  "/profile": { component: ProfileScreen, title: "User Profile", chrome: "shell" },
  "/signin": { component: SignInScreen, title: "Sign In", chrome: "auth" },
  "/signup": { component: SignUpScreen, title: "Sign Up", chrome: "auth" },
  "/videos": { component: VideosScreen, title: "Videos", chrome: "shell" },
};

/** What Next's root layout set as `metadata.title.template`. */
export const titleOf = (title?: string) => (title ? `${title} · VuiAdmin free` : "VuiAdmin free");
