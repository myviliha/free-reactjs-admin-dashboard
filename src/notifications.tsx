import { BellIcon, Cross2Icon } from "@radix-ui/react-icons";
import { cn, DEMO_NOTIFICATIONS, initialsOf } from "@viliha/vui-core";
import { Avatar, AvatarFallback } from "@viliha/vui-react/avatar";
import { Dropdown } from "@viliha/vui-react/dropdown-menu";
import { Link } from "react-router";
import { HEADER_CONTROL, HEADER_PANEL_OFFSET } from "./header";

/**
 * The notification panel, on the reference's structure.
 *
 * A titled header with a rule under it, a scrolling list, and a full-width link at the foot. Each
 * row is an avatar with a presence dot, a sentence where the actor and the subject are emphasised
 * and the verb is not, then a muted `Project · 5 min ago` line.
 *
 * **The times are fixed strings, not computed.** "5 min ago" from a timestamp is relative to whenever
 * the page was opened, so a fixture would drift into "3 days ago" and then "last month" while
 * claiming to be a live feed. A label that never claimed to be live is the smaller lie.
 */
export function Notifications() {
  return (
    <Dropdown
      label=""
      ariaLabel={`Notifications, ${DEMO_NOTIFICATIONS.length} unread`}
      staticId="menu-notifications"
      align="end"
      offset={HEADER_PANEL_OFFSET}
      // Theirs to the class: a fixed 480px tall panel, 350px wide rising to 361 at `sm`, at the
      // card radius. The height is fixed on purpose so the list scrolls inside a stable panel rather
      // than the panel growing with the inbox.
      panelClassName="flex h-[480px] w-[350px] flex-col p-3 sm:w-[361px]"
      bare
      triggerClassName={HEADER_CONTROL}
      trigger={
        <>
          <BellIcon className="size-5" />
          {/* Their dot sits at `right-0 top-0.5`, on the circle's edge, not inset from it.
              Decorative: the count is in the trigger's accessible name above. Theirs pulses, and
              `theme.css` clamps every animation under `prefers-reduced-motion`, so this one is
              already covered rather than needing its own guard. */}
          <span
            aria-hidden="true"
            className="absolute right-0 top-0.5 z-10 flex size-2 rounded-full bg-warning"
          >
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-warning opacity-75" />
          </span>
        </>
      }
    >
      {(close) => (
        <>
          <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
            <h5 className="text-lg font-semibold">Notification</h5>
            {/* Their panel has a close control. `children` is a function so this can reach the
                dropdown's own dismissal: an X that does not close is worse than no X. */}
            <button
              type="button"
              onClick={close}
              aria-label="Close notifications"
              // The static edition has no state to close: `vui.js` reads this and hides the panel.
              data-vui-dismiss=""
              className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
            >
              <Cross2Icon className="size-5" />
            </button>
          </div>

          {/* `h-auto overflow-y-auto` inside a fixed-height panel, which is what makes the list the
              part that scrolls. `vui-scroll` is the theme's own thin scrollbar. */}
          <ul className="vui-scroll flex h-auto flex-col overflow-y-auto">
            {DEMO_NOTIFICATIONS.map((item) => (
              <li key={item.name}>
                <Link
                  to="/blank"
                  role="menuitem"
                  // Measured: `flex gap-3 rounded-lg border-b p-3 px-4.5 py-3 hover:bg-gray-100`. The
                  // row border is theirs; mine had none, so the list read as one block.
                  className="flex gap-3 rounded-lg border-b border-border px-[18px] py-3 transition-colors hover:bg-accent"
                >
                  <span className="relative block size-10 shrink-0">
                    <Avatar className="size-10">
                      <AvatarFallback className="text-xs">{initialsOf(item.name)}</AvatarFallback>
                    </Avatar>
                    {/* `h-2.5 w-2.5 border-[1.5px] border-white`, so a 1.5px ring rather than 2. */}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute right-0 bottom-0 z-10 size-2.5 rounded-full border-[1.5px] border-card",
                        item.online ? "bg-success" : "bg-destructive",
                      )}
                    />
                    <span className="sr-only">{item.online ? "Online" : "Offline"}</span>
                  </span>

                  <span className="block">
                    <span className="mb-1.5 block space-x-1 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{item.name}</span>
                      <span>requests permission to change</span>
                      <span className="font-medium text-foreground">Project - Nganter App</span>
                    </span>
                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Project</span>
                      <span
                        aria-hidden="true"
                        className="size-1 rounded-full bg-muted-foreground"
                      />
                      <span>{item.when}</span>
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Their footer is a bordered link, not a filled button. */}
          <Link
            to="/blank"
            className="mt-3 block rounded-lg border border-border bg-card px-4 py-2 text-center text-sm font-medium text-foreground/80 transition-colors hover:bg-accent"
          >
            View All Notifications
          </Link>
        </>
      )}
    </Dropdown>
  );
}
