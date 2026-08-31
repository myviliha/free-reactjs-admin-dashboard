"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { Toggle as TogglePrimitive } from "radix-ui";
import * as React from "react";

import { TOGGLE_BASE, TOGGLE_SIZES, TOGGLE_VARIANTS } from "./class-variants";
import { cn } from "./utils";

const toggleVariants = cva(TOGGLE_BASE, {
  variants: {
    variant: {
      default: TOGGLE_VARIANTS.default,
      outline: TOGGLE_VARIANTS.outline,
    },
    size: {
      default: TOGGLE_SIZES.default,
      sm: TOGGLE_SIZES.sm,
      lg: TOGGLE_SIZES.lg,
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };
