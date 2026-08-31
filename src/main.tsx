import "./styles.css";

import { createRoot } from "react-dom/client";

import { App } from "./App";

/**
 * The free React demo's entry point.
 *
 * The stylesheet import is the first line: it is Tailwind plus the design system's own token file, so
 * this demo cannot drift from the tokens the other editions read. A hand-written copy would make it a
 * lookalike, which is the one thing a parity demo must not be.
 *
 * No `StrictMode`. The demo mounts an ApexCharts instance and a jsvectormap per card, and both are
 * imperative libraries that draw into a node on mount; a deliberate double-invoke leaves two charts
 * in one container. The screens are the product being shown, not the place to debug effects.
 */
const host = document.getElementById("root");
if (!host) throw new Error("index.html is missing #root");

createRoot(host).render(<App />);
