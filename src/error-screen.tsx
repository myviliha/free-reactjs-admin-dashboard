import { Button } from "@viliha/vui-react/button";
import { Link } from "react-router";

import { GridShape } from "./grid-shape";
import { NotFoundMark } from "./not-found-mark";

/**
 * The not-found screen, shared by the route and by the router's catch-all.
 *
 * **One component, two entry points.** `/error-404` is a real address in the sidebar, because a buyer
 * wants to look at the screen without breaking a link to see it, and `<Route path="*">` in `App.tsx`
 * answers anything unmatched. They are the same screen, so they are the same file: two copies of an
 * error page is how one of them ends up saying something the other does not.
 *
 * **Full width, outside the shell**, which is what the reference does and is the honest shape. A 404
 * inside the sidebar and header implies the navigation is trustworthy on a page that just failed to
 * resolve an address.
 */

export function ErrorScreen() {
  return (
    <main className="relative z-10 flex min-h-dvh flex-col items-center justify-center overflow-hidden p-6">
      <GridShape
        id="err-top"
        className="pointer-events-none absolute top-0 right-0 -z-10 w-full max-w-[250px] text-primary/40 xl:max-w-[450px]"
      />
      <GridShape
        id="err-bottom"
        className="pointer-events-none absolute bottom-0 left-0 -z-10 w-full max-w-[250px] rotate-180 text-primary/40 xl:max-w-[450px]"
      />

      <div className="mx-auto w-full max-w-[472px] text-center">
        <p className="mb-6 text-sm font-semibold tracking-[0.3em] text-muted-foreground uppercase">
          Error
        </p>
        {/* The supplied wordmark, inlined so it is one `currentColor` composition rather than the
            pair of fixed-blue files theirs needs for light and dark. */}
        <NotFoundMark className="mx-auto w-full max-w-[472px] text-primary" />
        <h1 className="mt-8 text-lg font-semibold sm:text-xl">
          We cannot seem to find the page you are looking for
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The address may be mistyped, or the page may have moved.
        </p>
        <Link to="/" className="mt-8 inline-block">
          <Button size="lg">Back to Home Page</Button>
        </Link>
      </div>
    </main>
  );
}
