import { AVATAR_SIZES, AVATAR_STATUS_TONES, DEMO_USER } from "@viliha/vui-core";
import { Avatar, AvatarFallback, AvatarImage } from "@viliha/vui-react/avatar";

import { Demo, PageHeader } from "../../page-shell";

export const metadata = { title: "Avatar" };

/**
 * Six sizes, and presence in every state the component knows.
 *
 * **Five cards where the reference has four**, because it offers three presence states and this
 * offers four: `away` became expressible when `PD-066` made `--info` a token, and "away" is a real
 * thing a status dot has to say that neither online, offline nor busy covers.
 *
 * **A supplied illustration rather than a stock photograph**, with the initials still underneath.
 * Their rows are `/images/user/user-01.jpg` six times over: a real person's face, which dates, has to
 * be licensed by whoever redistributes the download, and sits on a buyer's product until they
 * remember to change it. The portrait here is an SVG, so it stays crisp at 64px and at 24px, which is
 * the one thing a page showing six sizes has to get right. `AvatarFallback` is left in place beneath
 * it, so a missing file shows initials rather than a broken-image glyph.
 *
 * Both lists are read from the component, so a size or a state added to the library appears here
 * with no edit and one removed cannot be left behind.
 */
const SIZES = Object.keys(AVATAR_SIZES) as (keyof typeof AVATAR_SIZES)[];
const STATES = Object.keys(AVATAR_STATUS_TONES) as (keyof typeof AVATAR_STATUS_TONES)[];

/** The initials shrink with the circle: two characters at 24px need to be smaller than at 64px. */
const TEXT: Record<(typeof SIZES)[number], string> = {
  xs: "text-[9px]",
  sm: "text-[10px]",
  md: "text-xs",
  lg: "text-sm",
  xl: "text-base",
  "2xl": "text-lg",
};

function Row({ status }: { status?: (typeof STATES)[number] }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 sm:flex-row">
      {SIZES.map((size) => (
        <Avatar key={size} size={size} status={status}>
          <AvatarImage src={DEMO_USER.photo} alt="" />
          <AvatarFallback className={TEXT[size]}>{DEMO_USER.initials}</AvatarFallback>
        </Avatar>
      ))}
    </div>
  );
}

const label = (state: string) => `${state[0]?.toUpperCase()}${state.slice(1)}`;

export default function AvatarsPage() {
  return (
    <>
      <PageHeader title="Avatar" />
      <Demo title="Default Avatar" description="The six steps, 24px through 64px.">
        <Row />
      </Demo>
      {STATES.map((state) => (
        <Demo key={state} title={`Avatar with ${label(state)} Indicator`}>
          <Row status={state} />
        </Demo>
      ))}
    </>
  );
}
