import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Node: this asserts on the route table and the fixtures, not on rendered output. The React plugin is
// here so `routes.test.ts` can import `src/screens.ts`, which pulls in every screen.
export default defineConfig({
  plugins: [react()],
  test: { environment: "happy-dom", include: ["*.test.ts", "*.test.tsx"] },
});
