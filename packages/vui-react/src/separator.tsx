"use client";

import { Separator as SeparatorPrimitive } from "radix-ui";
import * as React from "react";
import { SEPARATOR_BASE } from "./class-variants";
import { cn } from "./utils";

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(SEPARATOR_BASE, className)}
      {...props}
    />
  );
}

export { Separator };
