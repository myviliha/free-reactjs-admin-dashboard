#!/usr/bin/env node
/**
 * The **free demo's** page set, into `packages/css/dist/pages-free` (`Z-12`).
 *
 * A second directory rather than a second manifest in the first one, because these are two products:
 * `pages/` is the paid template's 50 screens and this is the free tier's 19. A download built from one
 * of them must not be able to pick up a file from the other, and one directory per tier is how that
 * stops being possible rather than being remembered.
 *
 * **`basePath` is the one thing this export does that the paid one does not.** `next.config.js` sets
 * `/preview/free-react` for production, because the demo is served from the marketing site's `public/`,
 * so every internal href in the markup carries that prefix. The emitter strips it before rewriting
 * routes; without that step every link in every template would point at a path that exists only on the
 * storefront.
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { FREE_ROUTES, STATIC_DIALOG_SHELL } from "@viliha/vui-core";

import { emitPageTemplates } from "../../../../scripts/page-templates.mjs";

const here = dirname(fileURLToPath(import.meta.url));

emitPageTemplates({
  routes: FREE_ROUTES,
  exportDir: join(here, "..", "out"),
  outDir: join(here, "..", "..", "..", "..", "packages", "css", "dist", "pages-free"),
  provenance: "extracted from apps/web/free-react's static export by scripts/page-templates.mjs.",
  basePath: "/preview/free-react",
  rootTitle: "VuiAdmin free, for HTML",
  // The free demo's own look, which no paid page wants (`PD-140`).
  extraStylesheets: ["../free-demo.css"],
  // The logo, the avatar and the product photographs the markup points at (`PD-142`).
  assetDir: join(here, "..", "public"),
  // The panels from `/_overlays`, wrapped in a native `<dialog>` the browser opens with no framework
  // (`PD-158`). Same shell the calendar's dialog already uses.
  dialogShell: STATIC_DIALOG_SHELL,
});
