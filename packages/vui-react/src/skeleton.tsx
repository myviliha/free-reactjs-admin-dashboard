import * as React from "react";

import { SKELETON } from "./class-variants";
import { cn } from "./utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="skeleton" className={cn(SKELETON, className)} {...props} />;
}

export { Skeleton };
