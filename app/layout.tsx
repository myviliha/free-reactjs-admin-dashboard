import type { Metadata } from "next";
import { Outfit } from "next/font/google";

import "./globals.css";
import { RouteProgress } from "./route-progress";

/**
 * Outfit, which is the reference's typeface.
 *
 * Measured from the MIT HTML edition rather than guessed: it loads Outfit at the full 100..900 axis
 * and sets it as the only sans. Type is the first thing that reads as "a different product", so a
 * dashboard laid out to the pixel in the wrong face still does not match.
 *
 * `next/font` self-hosts it at build time. The reference reaches Google Fonts on every page load,
 * which in a download means a third-party request a buyer did not ask for and a demo that renders in
 * a fallback face when it is opened offline.
 */
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "VuiAdmin free", template: "%s · VuiAdmin free" },
  description:
    "The free VuiAdmin dashboard: fourteen pages, MIT licensed, built on the same design system as the paid editions.",
  // A demo, not something a search engine should offer instead of the product page.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // `suppressHydrationWarning` on these two and nowhere else. Extensions (password managers,
    // grammar checkers, dark-mode forcers) write attributes onto `html` and `body` before React
    // hydrates, and React cannot tell that from a real mismatch: it reports one against this file,
    // pointing at markup that is entirely static. It suppresses the attribute check on **these two
    // elements only**, never their children, so a genuine mismatch anywhere in the app still fails
    // loudly. Every Next.js starter carries it for the same reason.
    <html lang="en" className={`h-full ${outfit.variable}`} suppressHydrationWarning>
      <body className="h-full bg-background font-sans text-foreground" suppressHydrationWarning>
        <RouteProgress />
        {children}
      </body>
    </html>
  );
}
