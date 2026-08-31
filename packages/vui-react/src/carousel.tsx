"use client";

import { type ReactNode, useId, useState } from "react";

import {
  CAROUSEL_CONTROL,
  CAROUSEL_DOT,
  CAROUSEL_DOT_ACTIVE,
  CAROUSEL_DOTS,
  CAROUSEL_ROOT,
  CAROUSEL_SLIDE,
  CAROUSEL_TRACK,
} from "./class-variants";
import { ChevronLeft, ChevronRight } from "./icons";
import { cn } from "./utils";

/**
 * A carousel that a keyboard can drive (`PD-199`).
 *
 * **Deliberately not auto-advancing.** A carousel that moves on a timer takes the reading speed
 * decision away from the reader, and it is the single most complained-about pattern on the web. If
 * a caller wants it, that is their timer and their decision, not a default this ships.
 *
 * **`aria-roledescription` rather than a role**, because there is no carousel role: the pattern is a
 * labelled region whose slides announce their position, which is what "3 of 5" is doing here. The
 * track moves by whole viewports so a slide is never half shown, and the transition is off under
 * `motion-reduce`.
 */
export function Carousel({
  slides,
  label,
  className,
}: {
  slides: readonly ReactNode[];
  /** Names the region. Two carousels on a page are otherwise indistinguishable. */
  label: string;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const id = useId();
  const count = slides.length;
  if (count === 0) return null;

  const go = (next: number) => setIndex(Math.min(Math.max(next, 0), count - 1));

  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      className={cn(CAROUSEL_ROOT, className)}
    >
      <div
        id={`${id}-track`}
        className={CAROUSEL_TRACK}
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((slide, i) => (
          // biome-ignore lint/a11y/useSemanticElements: there is no element for a carousel slide; the pattern is a labelled group announcing its position
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: caller-supplied nodes with no identity, and a carousel never reorders, so position IS the identity
            key={`${id}-slide-${i}`}
            className={CAROUSEL_SLIDE}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            aria-hidden={i !== index}
          >
            {slide}
          </div>
        ))}
      </div>

      <button
        type="button"
        className={cn(CAROUSEL_CONTROL, "left-3")}
        onClick={() => go(index - 1)}
        disabled={index === 0}
        aria-label="Previous slide"
        aria-controls={`${id}-track`}
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        className={cn(CAROUSEL_CONTROL, "right-3")}
        onClick={() => go(index + 1)}
        disabled={index === count - 1}
        aria-label="Next slide"
        aria-controls={`${id}-track`}
      >
        <ChevronRight className="size-4" aria-hidden="true" />
      </button>

      <div className={CAROUSEL_DOTS}>
        {slides.map((_, i) => (
          <button
            // biome-ignore lint/suspicious/noArrayIndexKey: the same fixed, ordered list as the track
            key={`${id}-dot-${i}`}
            type="button"
            className={cn(CAROUSEL_DOT, i === index && CAROUSEL_DOT_ACTIVE)}
            onClick={() => go(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index ? "true" : undefined}
          />
        ))}
      </div>
    </section>
  );
}
