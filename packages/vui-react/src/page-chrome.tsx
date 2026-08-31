"use client";

/**
 * Page chrome: the app shell's title bar contract. A provider near the root, a
 * hook for the top bar to read it, and a hook for a page to register itself.
 *
 * **Free tier**, and it is the reason the split had to happen: a free app shell
 * imported this out of the paid `record-view.tsx`, so free depended on paid.
 *
 * Split out of `record-view.tsx` on 2026-08-17. See
 * `odin/design/04-packaging/01-packaging-pipeline/task.md`.
 */

import * as React from "react";
import type { IconType } from "./icon-type";

export type PageMeta = { title: string; icon?: IconType };

const PageChromeContext = React.createContext<{
  titleLeading?: React.ReactNode;
  /** Current page's title/icon, registered by the active view (e.g. RecordView). */
  page: PageMeta | null;
  setPage: (page: PageMeta | null) => void;
}>({ page: null, setPage: () => {} });

/**
 * Shares page chrome across the app shell: a leading node for the header
 * (e.g. a sidebar-expand toggle) plus the current page's title/icon so a global
 * top bar can display it. Wrap the top bar AND the page content with this.
 */
export function PageChromeProvider({
  titleLeading,
  children,
}: {
  titleLeading?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [page, setPage] = React.useState<PageMeta | null>(null);
  return (
    <PageChromeContext.Provider value={{ titleLeading, page, setPage }}>
      {children}
    </PageChromeContext.Provider>
  );
}

/** Read the current page chrome (title/icon, leading node). */
export function usePageChrome() {
  return React.useContext(PageChromeContext);
}

/** Register the current page's title/icon into the shell (clears on unmount). */
export function usePageTitle(title: string, icon?: IconType) {
  const { setPage } = React.useContext(PageChromeContext);
  React.useEffect(() => {
    setPage({ title, icon });
    return () => setPage(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);
}
