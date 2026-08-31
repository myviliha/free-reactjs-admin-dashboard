"use client";

import * as React from "react";

import {
  VIDEO_FRAME,
  VIDEO_HINT,
  VIDEO_IFRAME,
  VIDEO_PLAY,
  VIDEO_PLAY_ICON,
  VIDEO_POSTER,
  VIDEO_RATIOS,
  type VideoRatio,
} from "./class-variants";
import { Play } from "./icons";
import { cn } from "./utils";

export interface VideoEmbedProps {
  /** The provider's id, not a full URL: the URL is the provider's shape and belongs in here. */
  videoId: string;
  /** What the video is. Required, because a frame with no name is unusable without sight. */
  title: string;
  ratio?: VideoRatio;
  provider?: "youtube" | "vimeo";
  /**
   * Load the player on mount instead of on click.
   *
   * Off by default, and that default is the point of this component. Reach for `eager` only when the
   * video **is** the page and the visitor came for it.
   */
  eager?: boolean;
  className?: string;
}

const SRC: Record<NonNullable<VideoEmbedProps["provider"]>, (id: string) => string> = {
  // `autoplay=1` because reaching this URL at all means somebody clicked play.
  youtube: (id) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`,
  vimeo: (id) => `https://player.vimeo.com/video/${id}?autoplay=1`,
};

/**
 * A ratio-locked video frame that **loads nothing until it is asked to**.
 *
 * **Click to load, and that is a deliberate improvement on the reference.** Theirs renders a YouTube
 * `<iframe>` on mount, four of them on one page, which is four third-party connections, roughly a
 * megabyte of player, and a set of cookies for a visitor who may never press play. In a template
 * that ships to other people's products that is not a performance footnote: it is a privacy
 * decision being made on their behalf, in a jurisdiction we know nothing about. So the frame is ours
 * until the click, the URL is `youtube-nocookie`, and the visitor chooses.
 *
 * The ratio is a real `aspect-ratio`, not the padding-top trick, so the box reserves its own height
 * and the page does not jump when the player arrives.
 *
 * ```tsx
 * <VideoEmbed videoId="aqz-KE-bpKQ" title="Big Buck Bunny" ratio="16:9" />
 * ```
 */
export function VideoEmbed({
  videoId,
  title,
  ratio = "16:9",
  provider = "youtube",
  eager,
  className,
}: VideoEmbedProps) {
  const [playing, setPlaying] = React.useState(Boolean(eager));
  const frame = React.useRef<HTMLIFrameElement>(null);
  /**
   * Move focus to the player, because the button that asked for it no longer exists.
   *
   * The poster is a `<button>` and it unmounts in the same commit that mounts the iframe, so a
   * keyboard user who pressed Enter had focus reset to `<body>`: the next Tab started at the top of
   * the document, past every other video on the page, and the player they had just asked for was the
   * hardest thing to reach. The whole cost of click-to-load landing on the one person who cannot see
   * that it worked.
   *
   * Skipped when `eager`, where nothing was pressed and stealing focus on mount would be the defect.
   */
  React.useEffect(() => {
    if (playing && !eager) frame.current?.focus();
  }, [playing, eager]);

  return (
    <div data-slot="video-embed" className={cn(VIDEO_FRAME, VIDEO_RATIOS[ratio], className)}>
      {playing ? (
        <iframe
          ref={frame}
          // Reachable by script and not in the tab order twice: the iframe's own content handles Tab
          // once focus is inside it.
          tabIndex={-1}
          src={SRC[provider](videoId)}
          title={title}
          className={VIDEO_IFRAME}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className={VIDEO_POSTER}
          // The name says what will happen as well as what it is, because "play" alone does not
          // tell a reader that pressing it is what contacts the provider.
          aria-label={`Play ${title}. Loads the player from ${provider}.`}
        >
          <span className={VIDEO_PLAY}>
            <Play className={VIDEO_PLAY_ICON} aria-hidden="true" />
          </span>
          <span className={VIDEO_HINT}>{title}</span>
        </button>
      )}
    </div>
  );
}
