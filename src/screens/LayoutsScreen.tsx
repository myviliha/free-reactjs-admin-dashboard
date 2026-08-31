import { CheckIcon } from "@radix-ui/react-icons";
import { cn, SHELL_LAYOUTS } from "@viliha/vui-core";
import { Badge } from "@viliha/vui-react/badge";
import { Button } from "@viliha/vui-react/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@viliha/vui-react/card";

import { useLayout } from "../layout-context";
import { PageHeader } from "../page-shell";

/**
 * The six shell layouts, pickable (`PD-065`).
 *
 * **The page changes the shell it is inside**, which is the only honest way to demo a layout: a
 * gallery of six pictures shows you what they look like and a picker shows you what it is like to
 * use one. Pick "Icon rail" and the sidebar beside this card becomes a rail while you read it.
 *
 * The thumbnails are drawn from each preset's own fields rather than being six hand-drawn diagrams,
 * so a preset that gains a rail or loses its icons redraws itself and cannot end up illustrated as
 * something it is not.
 */
export default function LayoutsScreen() {
  const { layout, setLayout } = useLayout();

  return (
    <>
      <PageHeader title="Layouts" />
      <p className="-mt-4 mb-6 max-w-2xl text-sm text-muted-foreground">
        Six arrangements of the same shell. The choice is remembered, and every page in the demo
        uses it, so pick one and keep reading.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {SHELL_LAYOUTS.map((preset) => {
          const current = preset.id === layout.id;
          return (
            <Card
              key={preset.id}
              className={cn(
                "cursor-pointer transition-shadow hover:shadow-md",
                current && "ring-2 ring-primary",
              )}
            >
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-lg font-bold">{preset.label}</CardTitle>
                  <CardDescription className="mt-1 text-sm">{preset.hint}</CardDescription>
                </div>
                {current ? (
                  <Badge variant="success" className="shrink-0 rounded-full">
                    <CheckIcon />
                    In use
                  </Badge>
                ) : null}
              </CardHeader>
              <CardContent>
                <Thumbnail rail={preset.width < 200} search={preset.sidebarSearch} />
                {/*
                  A button, not a click handler on the card. A card that navigates on click and has
                  no keyboard route into it is unreachable for anyone not using a mouse, and the
                  fix is a real control rather than a `tabIndex` on a `div`.
                */}
                {/*
                  `Button`, not a hand-rolled one. This was a `<button>` with `h-10` and its own
                  colours, which is markup wearing VUI's classes: no `Button` size is 40px, so the
                  Vue edition could either reproduce a bespoke height or use the component and be
                  four pixels off. `PD-107` settles which of those is the defect, and it is not the
                  edition that used the component (`PD-126`).

                  A button, not a click handler on the card. A card that navigates on click and has
                  no keyboard route into it is unreachable for anyone not using a mouse, and the fix
                  is a real control rather than a `tabIndex` on a `div`.
                */}
                <Button
                  variant="primary"
                  size="lg"
                  className="mt-4 w-full"
                  onClick={() => setLayout(preset.id)}
                  disabled={current}
                >
                  {current ? "Current layout" : `Use ${preset.label}`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}

/** A drawing of the shell, from the preset's own fields. Decorative, so it is hidden from readers. */
function Thumbnail({ rail, search }: { rail: boolean; search: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="flex h-28 gap-1.5 overflow-hidden rounded-lg border border-border bg-muted/40 p-1.5"
    >
      <div
        className={cn(
          "flex shrink-0 flex-col gap-1 rounded bg-card p-1.5",
          rail ? "w-6 items-center" : "w-16",
        )}
      >
        <div className="h-2 w-full rounded-sm bg-primary/30" />
        {search && !rail ? <div className="h-2 w-full rounded-sm bg-muted" /> : null}
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className={cn("h-1.5 rounded-sm bg-muted", rail ? "w-full" : "w-4/5")} />
        ))}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="h-3 shrink-0 rounded bg-card" />
        <div className="grid flex-1 grid-cols-3 gap-1.5">
          {[0, 1, 2].map((cell) => (
            <div key={cell} className="rounded bg-card" />
          ))}
        </div>
      </div>
    </div>
  );
}
