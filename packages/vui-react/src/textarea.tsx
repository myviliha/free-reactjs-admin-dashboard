import * as React from "react";
import { TEXTAREA_BASE } from "./class-variants";
import { cn } from "./utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea data-slot="textarea" className={cn(TEXTAREA_BASE, className)} {...props} />;
}

export { Textarea };
