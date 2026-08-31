import { BADGE_VARIANTS } from "@viliha/vui-core";
import { Badge } from "@viliha/vui-react/badge";
import { Plus } from "@viliha/vui-react/icons";

import { Demo, PageHeader } from "../../page-shell";

export const metadata = { title: "Badges" };

/**
 * Every tone, in both families, with the icon in either position: six cards, as the reference has.
 *
 * **The tones are read from the component, never listed here.** This page named four when `Badge`
 * shipped seven, so the demo understated the library it advertises; reading `BADGE_VARIANTS` makes
 * that impossible in both directions. It is eight now, `info` having become expressible when
 * `PD-066` made it a token.
 *
 * **The solid family is new and is the reason this page changed shape.** The variant table used to
 * conflate colour and fill, so `default` was a solid and `success` was a tint and there was no way
 * to ask for the other half of either. The reference has both because both are needed: a tint
 * vanishes on a coloured row and a solid shouts in a dense table.
 */
const TONES = Object.keys(BADGE_VARIANTS) as (keyof typeof BADGE_VARIANTS)[];

/** Their label is the colour's name, which is the only honest caption for a swatch. */
const label = (tone: string) => `${tone[0]?.toUpperCase()}${tone.slice(1)}`;

function Row({
  solid,
  icon,
}: {
  solid?: boolean;
  /** Where the icon goes, or nowhere. `Badge` lays out either from its own flex row. */
  icon?: "start" | "end";
}) {
  return (
    <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
      {TONES.map((tone) => (
        <Badge key={tone} variant={tone} solid={solid} size="md">
          {icon === "start" ? <Plus className="size-3.5" aria-hidden="true" /> : null}
          {label(tone)}
          {icon === "end" ? <Plus className="size-3.5" aria-hidden="true" /> : null}
        </Badge>
      ))}
    </div>
  );
}

export default function BadgesPage() {
  return (
    <>
      <PageHeader title="Badges" />
      <Demo title="With Light Background">
        <Row />
      </Demo>
      <Demo title="With Solid Background">
        <Row solid />
      </Demo>
      <Demo title="Light Background with Left Icon">
        <Row icon="start" />
      </Demo>
      <Demo title="Solid Background with Left Icon">
        <Row solid icon="start" />
      </Demo>
      <Demo title="Light Background with Right Icon">
        <Row icon="end" />
      </Demo>
      <Demo title="Solid Background with Right Icon">
        <Row solid icon="end" />
      </Demo>
    </>
  );
}
