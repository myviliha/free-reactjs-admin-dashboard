"use client";

import { AppShell } from "@viliha/vui-react/console-shell";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Brand } from "./brand";
import { Footer } from "./footer";
import { Header } from "./header";
import { useLayout } from "./layout-context";
import { NAV } from "./nav";
import { UpgradeCard } from "./upgrade-card";

/**
 * This app's shell: `AppShell` with this app's own furniture in its slots (`PD-217`).
 *
 * **432 lines of sidebar, submenu, rail and flyout used to live here**, and a near-identical copy
 * lived in the other app. `apps/web/backoffice` would have made three, which is the drift
 * `PD-048` and `PD-050` record happening twice already. The rendering moved to
 * `packages/react/src/console-shell.tsx` unchanged; what stayed is what is genuinely this app's.
 *
 * **The router is injected rather than imported by the package.** `packages/react` has no Next
 * import anywhere, and a design system sold to Vue, Angular, HTML and Laravel buyers must not gain
 * one. So `Link` and `pathname` are passed in from here, where Next actually is.
 */
export function Shell({ children }: { children: React.ReactNode }) {
  const { layout } = useLayout();
  const pathname = usePathname();

  return (
    <AppShell
      nav={NAV}
      layout={layout}
      pathname={pathname}
      Link={Link}
      brand={({ compact, version }) => <Brand compact={compact} version={version} />}
      header={({ collapsed, onToggle }) => <Header collapsed={collapsed} onToggle={onToggle} />}
      footer={() => <Footer />}
      aside={<UpgradeCard />}
    >
      {children}
    </AppShell>
  );
}
