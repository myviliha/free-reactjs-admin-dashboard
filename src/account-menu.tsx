import {
  ChevronDownIcon,
  ExitIcon,
  GearIcon,
  InfoCircledIcon,
  PersonIcon,
} from "@radix-ui/react-icons";
import { cn, DEMO_ACCOUNT_LINKS, DEMO_USER, MENU_ROW } from "@viliha/vui-core";
import { Avatar, AvatarFallback, AvatarImage } from "@viliha/vui-react/avatar";
import { Dropdown } from "@viliha/vui-react/dropdown-menu";
import { Link } from "react-router";

import { HEADER_PANEL_OFFSET } from "./header";

/**
 * The account menu, on the reference's structure.
 *
 * Their panel is 260px wide with the person's name and address at the top, three links, a rule, and
 * Sign out below it. All four of theirs point at `/profile`, which is honest about a demo having one
 * screen behind them; ours do the same rather than inventing routes that 404.
 *
 * It is our `Dropdown` with a slotted trigger, not a second dropdown. That component already
 * portals out of scrolling ancestors, closes on outside-click and Escape, and flips when it would
 * run off the viewport; rewriting that for an avatar row would mean maintaining two of them.
 */
/**
 * The rows, from the shared list, with this edition's icons bound to its names.
 *
 * **The hrefs and labels were written here as well as in `@viliha/vui-core`**, which is a fixture
 * written twice and therefore two fixtures (`PD-154`). The Vue edition already read the shared one,
 * so the two were one edit away from offering different menus. Only the icon binding is
 * edition-local, and it is keyed the way `DEMO_ICON_RADIX` keys icons, as `shell.tsx` does.
 */
const ICONS = { users: PersonIcon, settings: GearIcon, info: InfoCircledIcon } as const;

export function AccountMenu() {
  return (
    <Dropdown
      label=""
      ariaLabel="Account menu"
      staticId="menu-account"
      align="end"
      offset={HEADER_PANEL_OFFSET}
      bare
      // Theirs is `flex items-center text-gray-700` and nothing else: no border, no background, no
      // radius. The avatar is the control's whole visual weight.
      triggerClassName="text-foreground/80"
      panelClassName="w-[260px] p-3"
      trigger={(open) => (
        <>
          {/* An illustration, not a photograph, with the initials still beneath it. The reference
              uses a picture of a real person, which dates, has to be licensed by whoever
              redistributes the download, and sits on a buyer's product until they change it.
              `DEMO_USER` is the one identity, so this and the profile card cannot disagree. */}
          <Avatar className="mr-3 size-11">
            <AvatarImage src={DEMO_USER.photo} alt="" />
            <AvatarFallback className="text-sm font-medium">{DEMO_USER.initials}</AvatarFallback>
          </Avatar>
          <span className="mr-1 hidden text-sm font-medium sm:inline">{DEMO_USER.name}</span>
          {/* The chevron turns, as theirs does. `trigger` is a function so it receives the panel's
              own open state: a local flag here would never have matched it, and a chevron that does
              not turn is worse than no chevron. */}
          <ChevronDownIcon
            className={cn("size-4 transition-transform duration-200", open && "rotate-180")}
          />
        </>
      )}
    >
      <div>
        <div className="px-1">
          {/* `DEMO_USER`, not two literals. These were typed out here while the identity they were
              copied from sat one import away, and they had already drifted: this panel said
              `john.doe@example.com` and the Vue edition said `john@example.com`, so the two demos
              showed different people in the same menu (`PD-154`). */}
          <p className="text-sm font-medium">{DEMO_USER.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{DEMO_USER.email}</p>
        </div>
        <ul className="flex flex-col gap-1 border-b border-border pt-4 pb-3">
          {DEMO_ACCOUNT_LINKS.map(({ href, label, icon }) => {
            const Icon = ICONS[icon];
            return (
              <li key={label}>
                <Link to={href} className={MENU_ROW} role="menuitem">
                  <Icon className="size-5 text-muted-foreground" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
        <Link to="/signin" className={cn(MENU_ROW, "mt-3")} role="menuitem">
          <ExitIcon className="size-5 text-muted-foreground" />
          Sign out
        </Link>
      </div>
    </Dropdown>
  );
}
