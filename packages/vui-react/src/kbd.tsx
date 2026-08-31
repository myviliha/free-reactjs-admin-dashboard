import * as React from "react";
import { KBD_BASE, KBD_GROUP } from "./class-variants";
import { cn } from "./utils";

/** A single keyboard key cap. */
export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return <kbd className={cn(KBD_BASE, className)}>{children}</kbd>;
}

/**
 * A keyboard shortcut rendered as separate key caps joined by "+" — e.g.
 * `<Shortcut keys={["⌘", "K"]} />` → ⌘ + K. Pass each key as its own string.
 */
export function Shortcut({ keys, className }: { keys: string[]; className?: string }) {
  return (
    <span className={cn(KBD_GROUP, className)}>
      {keys.map((k, i) => (
        <React.Fragment key={`${k}-${i}`}>
          {i > 0 && (
            <span aria-hidden="true" className="text-muted-foreground/60">
              +
            </span>
          )}
          <Kbd>{k}</Kbd>
        </React.Fragment>
      ))}
    </span>
  );
}
