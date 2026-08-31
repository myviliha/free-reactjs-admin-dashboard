"use client";

import { Progress as ProgressPrimitive } from "radix-ui";
import * as React from "react";
import { PROGRESS_INDICATOR, PROGRESS_ROOT } from "./class-variants";
import { cn } from "./utils";

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(PROGRESS_ROOT, className)}
      // `value` is destructured above for the indicator transform and has to be handed back, or Radix
      // never sees it: the root rendered `data-state="indeterminate"` with no `aria-valuenow` while the
      // bar visibly showed a percentage, so a screen reader announced "busy" on a determinate progress
      // bar. Found when the HTML edition started emitting this markup for people to copy.
      value={value}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={PROGRESS_INDICATOR}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
