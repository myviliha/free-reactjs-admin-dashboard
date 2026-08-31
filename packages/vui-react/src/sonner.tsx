"use client";

import * as React from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CheckCircle as CircleCheckIcon,
  Info as InfoIcon,
  Spinner as Loader2Icon,
  CloseCircle as OctagonXIcon,
  Warning as TriangleAlertIcon,
} from "./icons";

// VUI note: shadcn reads the theme from `next-themes`. VUI toggles a `.dark`
// class on <html> instead, so we track that directly — no next-themes dependency.
function useDocumentTheme(): "light" | "dark" {
  const [theme, setTheme] = React.useState<"light" | "dark">("light");
  React.useEffect(() => {
    const el = document.documentElement;
    const update = () => setTheme(el.classList.contains("dark") ? "dark" : "light");
    update();
    const observer = new MutationObserver(update);
    observer.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return theme;
}

const Toaster = ({ ...props }: ToasterProps) => {
  const theme = useDocumentTheme();

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="vui-icon-plain size-4" />,
        info: <InfoIcon className="vui-icon-plain size-4" />,
        warning: <TriangleAlertIcon className="vui-icon-plain size-4" />,
        error: <OctagonXIcon className="vui-icon-plain size-4" />,
        loading: <Loader2Icon className="vui-icon-plain size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
