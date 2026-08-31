import { copyFileSync } from "node:fs";
import { join } from "node:path";

import tailwind from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

/**
 * `404.html`, so a deep link survives a static host.
 *
 * This app has nineteen real addresses and one `index.html`, so `/alerts` typed into the bar is a
 * file the host does not have. Next solved it by exporting one HTML file per route; a copy named
 * `404.html` is the same trick in four lines, and it is what GitHub Pages, Netlify and Cloudflare
 * Pages all serve for an unmatched path. The router reads the address and renders the screen, so the
 * reader sees `/alerts` rather than a redirect.
 *
 * A host with rewrite rules (`try_files`, `_redirects`) can point everything at `index.html` instead
 * and this file is simply unused.
 */
const spaFallback = (): Plugin => ({
  name: "free-react-spa-fallback",
  apply: "build",
  closeBundle() {
    const out = join(import.meta.dirname, "dist");
    copyFileSync(join(out, "index.html"), join(out, "404.html"));
    this.info("free-react: 404.html written beside index.html for deep links on static hosts");
  },
});

/**
 * The free edition's React demo: nineteen screens on the same design system as the paid editions.
 *
 * **A plain Vite SPA, which is what its Vue and Angular siblings already are.** It was a Next.js
 * static export, and the framework bought it nothing a demo needs: every screen renders from
 * fixtures in its own file, so there is no server, no data fetching and no route handler here. What
 * it cost was a page set only Next could build and a `basePath` only the storefront wanted.
 */
export default defineConfig({
  plugins: [react(), tailwind(), spaFallback()],
});
