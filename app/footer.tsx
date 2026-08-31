import { cn, SITE_FOOTER, SITE_FOOTER_LINK } from "@viliha/vui-core";

/**
 * The one-line footer, on the shared `SITE_FOOTER` strip.
 *
 * **Reused, not rebuilt.** The paid app and the auth screens already close with this exact strip, so
 * the classes come from `@viliha/vui-core` rather than being written again here: one edit changes
 * every surface, which is the whole point of the constant existing.
 *
 * One line and nothing else. It carried `Layouts` and `Start a page` links, which is navigation, and
 * navigation belongs in the sidebar where a reader already looks for it: a second, shorter menu at
 * the bottom of every page is one more place to keep in sync for no one's benefit.
 *
 * The licence is the load-bearing part. A free download is MIT and has to say so somewhere a reader
 * will actually look, and the bottom of every page is that place.
 */
/**
 * The company, from configuration.
 *
 * Both the name and the URL, because a buyer shipping this template is not Viliha and should not
 * have to edit a component to say so. The name is rendered **verbatim** rather than through an
 * `uppercase` class: casing is part of how a company writes its own name, and a CSS transform would
 * impose ours on theirs. Set it the way you write it.
 */
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "VILIHA";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://viliha.com";

export function Footer({ className }: { className?: string }) {
  return (
    <footer className={cn(SITE_FOOTER, "mt-auto", className)}>
      <span>
        © 2026{" "}
        {/*
          `noopener noreferrer` with `target="_blank"`: without `noopener` the page we open gets a
          handle on this one through `window.opener` and can navigate it, which is the reverse-
          tabnabbing hole. The env var is read at build time, so a buyer points the footer at their
          own site by setting one key rather than editing a component.
        */}
        <a href={SITE_URL} target="_blank" rel="noopener noreferrer" className={SITE_FOOTER_LINK}>
          {SITE_NAME}
        </a>{" "}
        · MIT licensed
      </span>
    </footer>
  );
}
