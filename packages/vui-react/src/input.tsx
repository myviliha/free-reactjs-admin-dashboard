import * as React from "react";

import { INPUT } from "./class-variants";
import { cn } from "./utils";

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input type={type} ref={ref} className={cn(INPUT, className)} {...props} />
  ),
);
Input.displayName = "Input";
