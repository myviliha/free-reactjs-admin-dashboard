import * as React from "react";
import {
  BREADCRUMBS_BACK,
  BREADCRUMBS_BACK_ICON,
  BREADCRUMBS_CRUMB,
  BREADCRUMBS_CURRENT,
  BREADCRUMBS_LINK,
  BREADCRUMBS_NAV,
  BREADCRUMBS_ROOT,
  BREADCRUMBS_SEPARATOR_ICON,
} from "./class-variants";
import { ArrowLeft, ChevronRight } from "./icons";
import { cn } from "./utils";

export interface Crumb {
  label: React.ReactNode;
  /** Navigate via a link (rendered with `linkComponent` if given, else <a>). */
  href?: string;
  /** Navigate via a handler (rendered as a button). Ignored if href is set. */
  onClick?: () => void;
}

/** Minimal link contract so an app can pass its router link (e.g. next/link). */
type LinkComponent = React.ComponentType<{
  href: string;
  className?: string;
  children: React.ReactNode;
}>;

/**
 * Shared breadcrumb trail — one style used everywhere (route pages and forms).
 * The LAST crumb is the current page (bold, non-interactive); earlier crumbs
 * are links (href) or buttons (onClick).
 */
export function Breadcrumbs({
  crumbs,
  onBack,
  linkComponent: Link,
  className,
}: {
  crumbs: Crumb[];
  /** Optional back button shown before the trail. */
  onBack?: () => void;
  linkComponent?: LinkComponent;
  className?: string;
}) {
  return (
    <div className={cn(BREADCRUMBS_ROOT, className)}>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          title="Back"
          className={BREADCRUMBS_BACK}
        >
          <ArrowLeft className={BREADCRUMBS_BACK_ICON} />
        </button>
      )}
      <nav aria-label="Breadcrumb" className={BREADCRUMBS_NAV}>
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <span key={i} className={BREADCRUMBS_CRUMB}>
              {isLast ? (
                <span className={BREADCRUMBS_CURRENT}>{c.label}</span>
              ) : (
                <>
                  {c.href && Link ? (
                    <Link href={c.href} className={BREADCRUMBS_LINK}>
                      {c.label}
                    </Link>
                  ) : c.href ? (
                    <a href={c.href} className={BREADCRUMBS_LINK}>
                      {c.label}
                    </a>
                  ) : (
                    <button type="button" onClick={c.onClick} className={BREADCRUMBS_LINK}>
                      {c.label}
                    </button>
                  )}
                  <ChevronRight className={BREADCRUMBS_SEPARATOR_ICON} aria-hidden="true" />
                </>
              )}
            </span>
          );
        })}
      </nav>
    </div>
  );
}
