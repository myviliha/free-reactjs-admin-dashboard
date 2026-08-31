import { Card, CardContent } from "@viliha/vui-react/card";

import { PageHeader } from "../../page-shell";

export const metadata = { title: "Blank Page" };

/**
 * The blank page: the file a buyer copies to start their own screen.
 *
 * **It is deliberately not empty, and it is deliberately not a layout.** The reference fills a tall
 * card with a centred heading and one paragraph, which is exactly right for the job: it shows the
 * shell, the breadcrumb, the card and the type scale all working, and every line of it is meant to be
 * deleted. Ours said "Nothing here yet" inside a short card, which demonstrated less and still had to
 * be deleted.
 *
 * `min-h-[70vh]` rather than their `min-h-screen`: a card taller than the viewport inside a scrolling
 * shell means the page starts by scrolling to show a card with nothing in it.
 */
export default function BlankPage() {
  return (
    <>
      <PageHeader title="Blank Page" />
      {/* **A plain `Card`, not a `Demo`.** `Demo` is the titled component-card the UI pages use, and
          on this page it printed "Card Title Here" twice: once in its header band and once as the
          heading in the body. The reference's blank page has no header band at all, which is right,
          because the card *is* the content here rather than a labelled example of something.

          Content at the top rather than centred: this is the file a buyer copies, and a heading
          floating in the middle of a tall box is a layout they have to undo before they can start. */}
      <Card className="min-h-[70vh] p-0">
        <CardContent className="px-5 py-7 xl:px-10 xl:py-12">
          <div className="mx-auto w-full max-w-[630px] text-center">
            <h3 className="mb-4 text-xl font-semibold sm:text-2xl">Card Title Here</h3>
            <p className="text-sm text-muted-foreground sm:text-base">
              Start putting content on grids or panels. Copy this file, keep the header and the
              card, and build the screen inside it. The dashboard and the table pages are worth
              reading first for the combinations that already work.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
