"use client";

import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { HEADER_CONTROL } from "@viliha/vui-core";
import { useEffect, useState } from "react";

/**
 * The two constants moved to `@viliha/vui-core` (`Z-14`), because the Vue demo draws the same control.
 *
 * Re-exported here so the modules that already read them from this file keep working, and so the reason
 * they are shared is stated where a reader of this app will find it.
 */
export { HEADER_CONTROL, HEADER_PANEL_OFFSET } from "@viliha/vui-core";

/**
 * Light and dark.
 *
 * The class goes on `<html>`, where the theme's own `.dark` selector looks, and the initial value is
 * **read from the document** rather than assumed: a toggle that starts at "light" on a page already
 * rendered dark shows the wrong icon until someone clicks it.
 *
 * It lives in its own file because two screens need it. It was private to `header.tsx`, and the
 * authentication layout needs one too: the reference pins a switch to the corner of that screen, and
 * it is right to, because the sidebar is not on the page and without this the dark treatment of an
 * auth screen can only be seen by signing in first.
 */
export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);

  return (
    <button
      type="button"
      aria-pressed={dark}
      aria-label={dark ? "Switch to the light theme" : "Switch to the dark theme"}
      className={HEADER_CONTROL}
      /*
       * The hook an edition with no framework toggles on.
       *
       * `vui.js` flips `.dark` on the document from this attribute, so the static HTML demo's theme
       * switch works with no app code at all. Inert here: React's own handler below does the same
       * job, and the script is not loaded in this app (`PD-143`).
       */
      data-vui-theme=""
      onClick={() => {
        const next = !dark;
        setDark(next);
        document.documentElement.classList.toggle("dark", next);
      }}
    >
      {/*
        20px, as theirs are. Radix defaults to 15 and the icon looked lost in a 44px circle.

        **Both icons render, and CSS picks.** Choosing in JavaScript meant the static export froze on
        whichever one was right at build time, so the HTML demo showed a moon while sitting in dark
        mode. `dark:` is a class the theme already switches on, so this is correct in every edition
        with nothing running (`PD-143`).
      */}
      <MoonIcon className="size-5 dark:hidden" />
      <SunIcon className="hidden size-5 dark:block" />
    </button>
  );
}
