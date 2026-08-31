"use client";

import { Label as LabelPrimitive } from "radix-ui";
import * as React from "react";
import { LABEL_BASE } from "./class-variants";
import { cn } from "./utils";

function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return <LabelPrimitive.Root data-slot="label" className={cn(LABEL_BASE, className)} {...props} />;
}

export { Label };
