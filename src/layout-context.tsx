import { DEFAULT_LAYOUT, layoutById, type ShellLayout } from "@viliha/vui-core";
import * as React from "react";

/**
 * Which shell layout the demo is wearing.
 *
 * The choice is one string, persisted, so a reader who picks a layout still has it after a reload
 * and can send someone the demo in the layout they were looking at. `layoutById` never returns
 * undefined, so a stale or hand-edited value renders the default rather than no shell at all.
 *
 * **Read in the initialiser, not in an effect, and the framework is why.** Under Next this ran in a
 * `useEffect`: the server has no `localStorage`, so reading it during render made the two passes
 * disagree, and the stored layout arrived one frame after the default. There is no server pass to
 * match here, so the read happens before the first paint and a reader who chose the rail no longer
 * watches the full sidebar flash first.
 *
 * The initialiser is a function, so the read happens once rather than on every render, and it is
 * wrapped: `localStorage` throws rather than returning null in a browser with site data blocked, and
 * a demo that cannot remember a layout is a smaller problem than a demo that will not start.
 */
const KEY = "vui.shell-layout";

const LayoutContext = React.createContext<{
  layout: ShellLayout;
  setLayout: (id: string) => void;
} | null>(null);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [id, setId] = React.useState(() => {
    try {
      const stored = window.localStorage.getItem(KEY);
      return stored ? layoutById(stored).id : DEFAULT_LAYOUT;
    } catch {
      return DEFAULT_LAYOUT;
    }
  });

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
