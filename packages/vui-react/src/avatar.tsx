"use client";

import * as React from "react";

import {
  AVATAR_FALLBACK,
  AVATAR_IMAGE,
  AVATAR_PRESENCE_WRAP,
  AVATAR_ROOT,
  AVATAR_SIZES,
  AVATAR_STATUS,
  AVATAR_STATUS_SIZES,
  AVATAR_STATUS_TONES,
  type AvatarSize,
  type AvatarStatus,
} from "./class-variants";
import { cn } from "./utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** One of six steps. Omit to keep the 32px default, or keep passing a `size-*` class. */
  size?: AvatarSize;
  /**
   * Presence, drawn as a dot on the lower-right corner and scaled to `size`.
   *
   * With a status set the avatar gains a wrapper, because `AVATAR_ROOT` clips its own contents into
   * a circle and would clip the dot with them. Without one the DOM is unchanged, so no existing
   * call site pays for a feature it does not use.
   */
  status?: AvatarStatus;
  /**
   * What the dot means, for anyone who cannot see it.
   *
   * A coloured dot is pure decoration to a screen reader, and "online" is not decoration. Defaults
   * to the status word itself, which is worth saying even when nobody customises it.
   */
  statusLabel?: string;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size, status, statusLabel, ...props }, ref) => {
    const circle = (
      <div
        ref={ref}
        data-slot="avatar"
        className={cn(AVATAR_ROOT, size && AVATAR_SIZES[size], className)}
        {...props}
      />
    );
    if (!status) return circle;
    return (
      <span className={AVATAR_PRESENCE_WRAP}>
        {circle}
        <span
          className={cn(
            AVATAR_STATUS,
            AVATAR_STATUS_SIZES[size ?? "sm"],
            AVATAR_STATUS_TONES[status],
          )}
        />
        <span className="sr-only">{statusLabel ?? status}</span>
      </span>
    );
  },
);
Avatar.displayName = "Avatar";

/**
 * The picture, when there is one. It sits over the fallback, so a slow or broken
 * image shows the initials rather than an empty box: on error the image removes
 * itself and whatever is underneath is what you see.
 */
export const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, onError, src, alt = "", ...props }, ref) => {
  const [failed, setFailed] = React.useState(false);
  const node = React.useRef<HTMLImageElement | null>(null);
  // A new src deserves a fresh attempt, even if the previous one failed.
  React.useEffect(() => setFailed(false), [src]);

  /**
   * Catch a load that failed **before** React was listening.
   *
   * `onError` is attached at hydration. On a server-rendered or statically exported page the browser
   * has already requested the image, already got the 404 and already painted the broken-glyph icon
   * by then, so the handler never fires and the fallback underneath never gets its turn: the page
   * shows a torn-paper icon on top of the initials, permanently. `complete` with a zero
   * `naturalWidth` is how the platform reports exactly that, and it is only knowable after mount.
   */
  React.useEffect(() => {
    const img = node.current;
    if (img?.complete && img.naturalWidth === 0) setFailed(true);
  }, [src]);

  if (!src || failed) return null;
  return (
    // A plain <img>: the package is framework-agnostic, so a host that wants
    // next/image composes its own on top of Avatar.
    <img
      data-slot="avatar-image"
      ref={(element) => {
        node.current = element;
        if (typeof ref === "function") ref(element);
        else if (ref) ref.current = element;
      }}
      src={src}
      alt={alt}
      className={cn(AVATAR_IMAGE, className)}
      {...props}
      onError={(event) => {
        setFailed(true);
        onError?.(event);
      }}
    />
  );
});
AvatarImage.displayName = "AvatarImage";

export const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="avatar-fallback"
    className={cn(AVATAR_FALLBACK, className)}
    {...props}
  />
));
AvatarFallback.displayName = "AvatarFallback";
