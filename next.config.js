import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Monorepo root, three levels up from apps/web/<app>. **Pin it.** Without this Next walks up looking
// for a workspace root, reaches `$HOME/Documents`, and the build dies with
// `Operation not permitted (os error 1)` naming a directory that has nothing to do with the app.
// `apps/web/reactjs` and `apps/docs/vui` both carry the same line, and its comment says the same
// thing: since the apps moved under `apps/web`, Next can no longer infer the root at all.
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

/**
 * The free edition's demo, and the tree that becomes `vuiadmin-react-free.zip`.
 *
 * `output: "export"` because the demo is served from the storefront's `public/`, the call the Vue and
 * Angular previews already made: the storefront copies `public/` verbatim, so the demo ships wherever
 * the site ships and needs no hosted stage of its own.
 */
/** @type {import("next").NextConfig} */
const nextConfig = {
  output: "export",
  turbopack: { root: repoRoot },
  outputFileTracingRoot: repoRoot,
  images: { unoptimized: true },
  // **Build only.** Next honours `basePath` on the dev server too, so setting it unconditionally
  // would serve `pnpm --filter free-react dev` at `/preview/free-react/` and answer `/` with a
  // redirect: the port configured and the app still not where anyone would look for it.
  ...(process.env.NODE_ENV === "production" ? { basePath: "/preview/free-react" } : {}),
};

export default nextConfig;
