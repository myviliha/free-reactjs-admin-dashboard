"use client";

import { DEFAULT_LAYOUT, layoutById, type ShellLayout } from "@viliha/vui-core";
import * as React from "react";

/**
 * Which shell layout the demo is wearing.
 *
 * The choice is one string, persisted, so a reader who picks a layout still has it after a reload
 * and can send someone the demo in the layout they were looking at. `layoutById` never returns
 * undefined, so a stale or hand-edited value renders the default rather than no shell at all.
 *
 * **Read after mount, not during render.** The server has no `localStorage`, so reading it while
 * rendering makes the two passes disagree: the first client render must match the server's, and the
 * stored layout arrives one frame later. That is the same rule the calendar page learned about the
 * clock.
 */
const KEY = "vui.shell-layout";

const LayoutContext = React.createContext<{
  layout: ShellLayout;
  setLayout: (id: string) => void;
} | null>(null);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [id, setId] = React.useState(DEFAULT_LAYOUT);

  React.useEffect(() => {
    const stored = window.localStorage.getItem(KEY);
    if (stored) setId(layoutById(stored).id);
  }, []);

  const setLayout = React.useCallback((next: string) => {
    setId(layoutById(next).id);
    window.localStorage.setItem(KEY, next);
  }, []);

  const value = React.useMemo(() => ({ layout: layoutById(id), setLayout }), [id, setLayout]);
  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
}

export function useLayout() {
  const context = React.useContext(LayoutContext);
  if (!context) throw new Error("useLayout must be used inside <LayoutProvider>");
  return context;
}
