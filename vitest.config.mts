import { defineConfig } from "vitest/config";

// Node: this asserts on the route tree as files on disk, not on rendered output.
export default defineConfig({ test: { environment: "node", include: ["*.test.ts"] } });
