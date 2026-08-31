"use client";

import { Command as CommandPrimitive } from "cmdk";
import * as React from "react";
import {
  COMMAND_EMPTY,
  COMMAND_GROUP,
  COMMAND_INPUT,
  COMMAND_INPUT_ICON,
  COMMAND_INPUT_ROW,
  COMMAND_ITEM,
  COMMAND_LIST,
  COMMAND_ROOT,
  COMMAND_SEPARATOR,
  COMMAND_SHORTCUT,
} from "./class-variants";
import { Search as SearchIcon } from "./icons";
import { cn } from "./utils";

// NOTE: shadcn's `CommandDialog` (a Command inside a Dialog) is intentionally
// omitted — VUI ships its own `command-palette` (⌘K) for that. Wrap `Command`
// in your own dialog if you need a modal command menu.

function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive data-slot="command" className={cn(COMMAND_ROOT, className)} {...props} />
  );
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div data-slot="command-input-wrapper" className={COMMAND_INPUT_ROW}>
      <SearchIcon className={cn("vui-icon-plain", COMMAND_INPUT_ICON)} />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(COMMAND_INPUT, className)}
        {...props}
      />
    </div>
  );
}

function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(COMMAND_LIST, className)}
      {...props}
    />
  );
}

function CommandEmpty({ ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return <CommandPrimitive.Empty data-slot="command-empty" className={COMMAND_EMPTY} {...props} />;
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(COMMAND_GROUP, className)}
      {...props}
    />
  );
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn(COMMAND_SEPARATOR, className)}
      {...props}
    />
  );
}

function CommandItem({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(COMMAND_ITEM, className)}
      {...props}
    />
  );
}

function CommandShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span data-slot="command-shortcut" className={cn(COMMAND_SHORTCUT, className)} {...props} />
  );
}

export {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
};
