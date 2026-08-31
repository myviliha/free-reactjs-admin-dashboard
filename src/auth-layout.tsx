import { Link } from "react-router";

import { Brand } from "./brand";
import { GridShape } from "./grid-shape";
import { ThemeToggle } from "./theme-toggle";

/**
 * The authentication shell: form on the left, a branded panel on the right.
 *
 * **A split screen, as the reference has, and for the reason it has one.** Ours was a centred card on
 * an empty page, which is the default every starter ships and says nothing about the product a
 * visitor is signing in to. Their right-hand panel carries the mark and one line of positioning, is
 * `hidden` below `lg` so a phone gets the form and nothing else, and that is the whole trick.
 *
 * **The panel is `bg-primary` rather than a fixed navy.** Theirs is `bg-brand-950`, a colour that
 * exists only in their palette; ours is the token, so a buyer who rethemes the product gets an
 * authentication screen in their own brand instead of somebody else's dark blue.
 *
 * No sidebar and no header on either side. An authentication screen with navigation on it is offering
 * a way around itself to someone who has not signed in.
 */
export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col lg:flex-row">
      {/* The form column. `flex-1` rather than a second `w-1/2`, so a narrow window gives the form
          the room instead of splitting it evenly with a panel that is not shown. */}
      <div className="flex flex-1 flex-col p-6 lg:w-1/2">{children}</div>

      <aside className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:grid lg:w-1/2 lg:place-items-center">
        <GridShape
          id="auth-top"
          className="pointer-events-none absolute top-0 right-0 w-full max-w-[450px] text-primary-foreground/20"
        />
        <GridShape
          id="auth-bottom"
          className="pointer-events-none absolute bottom-0 left-0 w-full max-w-[450px] rotate-180 text-primary-foreground/20"
        />
        <div className="relative flex max-w-xs flex-col items-center gap-4 text-center">
          <Link to="/" className="block">
            {/* The product's own mark, from the same component the sidebar uses, so the two cannot
                drift. Theirs is a second logo file that exists only for this screen. */}
            <Brand onBrand />
          </Link>
          <p className="text-sm text-primary-foreground/70">
            The free and open-source admin dashboard built on one design system, MIT licensed.
          </p>
        </div>
      </aside>

      {/* Theirs pins a theme switch to the bottom-right of this screen, and it is right to: the
          sidebar's toggle is not on the page, so without this the only way to see the dark
          treatment of an auth screen is to sign in first. */}
      <div className="fixed right-6 bottom-6 z-50 hidden sm:block">
        <ThemeToggle />
      </div>
    </div>
  );
}
