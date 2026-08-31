import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { ALERT_BASE, ALERT_DESCRIPTION, ALERT_TITLE, ALERT_VARIANTS } from "./class-variants";
import { cn } from "./utils";

// **Spread, not enumerated.** These were listed one per line, so adding a state to the shared table
// left React rendering four of five while Vue, which does `ALERT_VARIANTS[props.variant]`, rendered
// all of them. A component that has to be edited in step with its own data is a divergence waiting
// for the next state colour.
const alertVariants = cva(ALERT_BASE, {
  variants: {
    variant: { ...ALERT_VARIANTS },
  },
  defaultVariants: {
    variant: "default",
  },
});

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-title" className={cn(ALERT_TITLE, className)} {...props} />;
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="alert-description" className={cn(ALERT_DESCRIPTION, className)} {...props} />
  );
}

export { Alert, AlertDescription, AlertTitle };
