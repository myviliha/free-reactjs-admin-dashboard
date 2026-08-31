import { VIDEO_RATIOS } from "@viliha/vui-core";
import { VideoEmbed } from "@viliha/vui-react/video-embed";

import { Demo, PageHeader } from "../../page-shell";

export const metadata = { title: "Videos" };

/**
 * The four aspect ratios, in the reference's two-column arrangement.
 *
 * **`VideoEmbed` loads nothing until it is clicked, and that is the improvement over the reference.**
 * Theirs renders a YouTube `<iframe>` on mount, four of them on this page, which is four third-party
 * connections, roughly a megabyte of player and a set of cookies for a visitor who may never press
 * play. In a template that ships into other people's products, that is a privacy decision being made
 * on their behalf in jurisdictions we know nothing about. So the frame is ours until the click, the
 * URL is `youtube-nocookie`, and the visitor chooses.
 *
 * Their four embeds also all point at the same joke video id. These point at Blender's Big Buck
 * Bunny, which is Creative Commons and is a real thing to watch.
 *
 * The ratios are read from the component, so this page cannot claim one it does not ship.
 */
const RATIOS = Object.keys(VIDEO_RATIOS) as (keyof typeof VIDEO_RATIOS)[];

/** Creative Commons, and the canonical test clip for exactly this. */
const VIDEO = { id: "aqz-KE-bpKQ", title: "Big Buck Bunny" };

export default function VideosPage() {
  return (
    <>
      <PageHeader title="Videos" />
      {/* Their layout: two columns of two from `xl`, each column its own stack, so the tall 1:1 and
          the wide 21:9 do not have to share a row and leave a gap. */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {[RATIOS.slice(0, 2), RATIOS.slice(2)].map((column) => (
          <div key={column.join()} className="space-y-6">
            {column.map((ratio) => (
              <Demo key={ratio} title={`Video Ratio ${ratio}`}>
                <VideoEmbed videoId={VIDEO.id} title={`${VIDEO.title}, ${ratio}`} ratio={ratio} />
              </Demo>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
