import { Slot } from "radix-ui";
import * as React from "react";
import {
  BREADCRUMB_ELLIPSIS,
  BREADCRUMB_ELLIPSIS_ICON,
  BREADCRUMB_ITEM,
  BREADCRUMB_LINK,
  BREADCRUMB_LIST,
  BREADCRUMB_PAGE,
  BREADCRUMB_SEPARATOR,
  SR_ONLY,
} from "./class-variants";
import { ChevronRight, MoreHorizontal } from "./icons";
import { cn } from "./utils";

function Breadcrumb({ ...props }: React.ComponentProps<"nav">) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />;
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return <ol data-slot="breadcrumb-list" className={cn(BREADCRUMB_LIST, className)} {...props} />;
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li data-slot="breadcrumb-item" className={cn(BREADCRUMB_ITEM, className)} {...props} />;
}

function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot.Root : "a";

  return <Comp data-slot="breadcrumb-link" className={cn(BREADCRUMB_LINK, className)} {...props} />;
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn(BREADCRUMB_PAGE, className)}
      {...props}
    />
  );
}

function BreadcrumbSeparator({ children, className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn(BREADCRUMB_SEPARATOR, className)}
      {...props}
    >
      {children ?? <ChevronRight className="vui-icon-plain" />}
    </li>
  );
}

function BreadcrumbEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn(BREADCRUMB_ELLIPSIS, className)}
      {...props}
    >
      <MoreHorizontal className={cn("vui-icon-plain", BREADCRUMB_ELLIPSIS_ICON)} />
      <span className={SR_ONLY}>More</span>
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
};
