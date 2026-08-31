import { LayoutProvider } from "../layout-context";
import { Shell } from "../shell";

/**
 * Everything but the two auth screens and the 404 renders inside the shell.
 *
 * `LayoutProvider` wraps it rather than sitting in the root layout, because the six shell layouts
 * (`PD-065`) describe this shell and nothing else: a sign-in page has no sidebar to arrange, and a
 * provider above it would offer a choice that changes nothing there.
 */
export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <LayoutProvider>
      <Shell>{children}</Shell>
    </LayoutProvider>
  );
}
