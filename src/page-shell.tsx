import { ChevronRightIcon } from "@radix-ui/react-icons";
import {
  cn,
  FREE_CRUMB_CURRENT,
  FREE_CRUMB_LINK,
  FREE_CRUMB_LIST,
  FREE_PAGE_TITLE,
} from "@viliha/vui-core";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@viliha/vui-react/card";
import { Link } from "react-router";

/**
 * A demo section: a titled card around one example.
 *
 * The reference wraps every UI-element example in the same card, and doing the same here is what
 * makes the two galleries comparable at a glance rather than only in a feature list.
 *
 * It composes `Card` rather than wearing `CARD` (`PD-060`). A demo of a component library that
 * hand-rolls the component it is demonstrating argues against itself. `Card` renders a `div` and
 * takes no `asChild`, so this is no longer a `section`; a card with a heading in it is navigable by
 * heading either way, and adding a slot to the library to keep one element name is the wrong trade.
 */
export function Demo({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  /** On the body, for the demo that wants the padding gone (a table draws its own frame). */
  className?: string;
}) {
  return (
    <Card className="gap-0 p-0">
      {/* Their `ComponentCard`, measured: a `px-6 py-5` header with the title at `text-base
          font-medium`, then a body at `p-4 sm:p-6` behind a rule **lighter** than the card's own
          border, which is what stops one card reading as two stacked. `CardHeader` and
          `CardContent` are `px-5 pb-3 pt-5` and `px-5 pb-5`, so the difference is passed as a
          className rather than changed in the library: those metrics are every other card in the
          product, and this is one page family's. */}
      <CardHeader className="px-6 py-5 pb-5">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        {description ? (
          <CardDescription className="mt-1 text-sm">{description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className={cn("border-t border-border/60 p-4 sm:p-6", className)}>
        <div className="space-y-6">{children}</div>
      </CardContent>
    </Card>
  );
}

/**
 * Every page's header: the title on the left, a breadcrumb trail on the right.
 *
 * Their `PageBreadcrumb`, structurally: `flex flex-wrap items-center justify-between gap-3 mb-6`
 * with an `h2` at `text-xl font-semibold` and an ordered list beside it. Ours was a bare `h1` at
 * `text-2xl` and no trail at all, which is why every page read a size too large and gave no sense of
 * where it sat.
 *
 * **It stays an `h1`.** Theirs is an `h2` with no `h1` above it on the page, which leaves a document
 * whose outline starts at level two; the visual size is set by a class either way, so there is no
 * reason to copy the wrong element.
 *
 * The trail is a real `nav > ol`, and the current page is a plain `li` rather than a link to itself.
 * `aria-current="page"` marks it, which is the part a screen reader uses to say "you are here".
 */
export function PageHeader({ title }: { title: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className={FREE_PAGE_TITLE}>{title}</h1>
      <nav aria-label="Breadcrumb">
        <ol className={FREE_CRUMB_LIST}>
          <li>
            <Link to="/" className={FREE_CRUMB_LINK}>
              Home
              <ChevronRightIcon className="size-4" />
            </Link>
          </li>
          <li aria-current="page" className={FREE_CRUMB_CURRENT}>
            {title}
          </li>
        </ol>
      </nav>
    </div>
  );
}
