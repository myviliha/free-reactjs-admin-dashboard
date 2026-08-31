"use client";

import { MagnifyingGlassIcon, PinLeftIcon } from "@radix-ui/react-icons";
import { cn, PAGE_HEADER } from "@viliha/vui-core";
import { Button } from "@viliha/vui-react/button";
import { Input } from "@viliha/vui-react/input";
import { Kbd } from "@viliha/vui-react/kbd";
import { useEffect, useState } from "react";
import { AccountMenu } from "./account-menu";
import { Notifications } from "./notifications";
import { ThemeToggle } from "./theme-toggle";

/**
 * The top bar: the sidebar toggle, a command search, and the three right-hand controls.
 *
 * **Every control here is a VUI component**, not markup wearing VUI's classes. That is the whole
 * point of the demo: a reader should be able to look at a control they like, find the component that
 * drew it, and use it. Hand-rolled markup that merely resembles `Button` teaches them nothing and
 * drifts the first time the button changes.
 *
 * The search carries a `⌘K` hint and the shortcut focuses it. A badge advertising a shortcut that
 * does nothing is worse than no badge; the command *palette* is a separate component and this is a
 * search field, so the hint promises exactly what it delivers.
 */
// Re-exported so the modules that already read these from here keep working: the strings moved
// to `theme-toggle.tsx` because the authentication screen needs the control too.
export { HEADER_CONTROL, HEADER_PANEL_OFFSET } from "./theme-toggle";

export function Header({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  // `PAGE_HEADER` is the shared bar, overridden rather than restated: the reference's chrome
  // header is taller than an in-page one and sits on the card surface. `cn` is `twMerge`, so the
  // heights here win over the `h-12` in the shared string instead of both landing in the class list.
  //
  // Measured: their desktop row is `py-4` around a 44px control, so the bar is 76px and not 64, and
  // it is `sticky top-0` so the chrome stays put while the page scrolls under it.
  return (
    <header
      className={cn(
        PAGE_HEADER,
        "sticky top-0 z-30 h-16 justify-start bg-card lg:h-[76px] lg:px-6",
      )}
    >
      {/*
        One icon that rotates, not two that swap: `PinLeftIcon` is an arrow into a bar on the left,
        Radix's nearest thing to a panel closing leftwards, and turned 180 degrees it is the same
        arrow pointing out.
      */}
      <Button
        variant="outline"
        size="icon"
        onClick={onToggle}
        // Inert in React, which has its own handler. The static edition has no state to toggle, so
        // `vui.js` reads this and flips a `data-vui-collapsed` attribute the stylesheet keys off
        // (`PD-158`).
        data-vui-collapse=""
        aria-expanded={!collapsed}
        aria-label={collapsed ? "Expand the sidebar" : "Collapse the sidebar"}
        // 44px, which is what every control on their header row measures and also the smallest
        // comfortable touch target.
        className="size-10 lg:size-11"
      >
        <PinLeftIcon
          className={cn("transition-transform duration-300 ease-in-out", collapsed && "rotate-180")}
        />
      </Button>

      <CommandSearch />

      {/* `gap-2 sm:gap-3`, which is their `gap-2 2xsm:gap-3`. */}
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <ThemeToggle />
        {/* Both of these were buttons that did nothing. A control that looks interactive and is not
            is the first thing a reader clicks and the first thing that disappoints them. */}
        <Notifications />
        <AccountMenu />
      </div>
    </header>
  );
}

function CommandSearch() {
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "k" || !(event.metaKey || event.ctrlKey)) return;
      event.preventDefault();
      document.getElementById("free-demo-search")?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Measured: `h-11 rounded-lg pl-12 pr-14 text-sm`, and `xl:w-[430px]` rather than stretching to
  // fill, so the header keeps its right cluster where the reference has it.
  return (
    <div className="relative hidden flex-1 md:block xl:max-w-[430px]">
      <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
      <Input
        id="free-demo-search"
        type="search"
        placeholder="Search or type command..."
        aria-label="Search"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="h-11 rounded-lg pl-12 pr-14"
      />
      <Kbd
        className={cn(
          "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 transition-opacity",
          focused && "opacity-0",
        )}
      >
        ⌘K
      </Kbd>
    </div>
  );
}
