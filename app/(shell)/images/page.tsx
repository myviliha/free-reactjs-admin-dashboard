import { AspectRatio } from "@viliha/vui-react/aspect-ratio";
import Image from "next/image";

import { Demo, PageHeader } from "../../page-shell";

export const metadata = { title: "Images" };

/**
 * Responsive images at one, two and three columns, as the reference has them.
 *
 * **The photographs are supplied, not taken from the reference.** Theirs is six PNGs under
 * `/images/grid-image/`, and this is a template a buyer redistributes: `SD-006` keeps their code out
 * of the repository and the same reasoning covers their asset files.
 *
 * **Every frame is `AspectRatio` with `object-cover`, which the varied sources make necessary rather
 * than tidy.** The five images are 1.70, 1.10, 1.00, 1.04 and 1.59 wide, so laying them out at their
 * own ratios would give a grid of mismatched heights. A fixed ratio per grid with the image cropped
 * to fill is what makes three cells the same shape, and it is also what a real gallery does with
 * photographs it did not commission.
 *
 * **`next/image` and not a bare `<img>`**, because a demo of images that skips sizing, lazy loading
 * and the layout-shift reservation is demonstrating the easy half. `sizes` is stated per grid so the
 * browser fetches the width it will actually paint rather than the largest one.
 */
/**
 * The five supplied photographs, with their true intrinsic sizes.
 *
 * **They are 148px tall.** That is stated here rather than left to be discovered, because it is the
 * one thing that limits this page: the single-column card paints around 1050px wide, so `image-1` is
 * being scaled up more than four times and will look soft. `next/image` cannot invent detail. The fix
 * is larger source files, not a layout change, and until then the grids below are the honest reading
 * of what these can do.
 */
const PHOTOS = [
  { src: "/images/grid/image-1.jpeg", width: 252, height: 148, alt: "Photograph one" },
  { src: "/images/grid/image-2.jpeg", width: 163, height: 148, alt: "Photograph two" },
  { src: "/images/grid/image-3.jpeg", width: 148, height: 148, alt: "Photograph three" },
  { src: "/images/grid/image-4.jpeg", width: 154, height: 148, alt: "Photograph four" },
  { src: "/images/grid/image-5.jpeg", width: 236, height: 148, alt: "Photograph five" },
] as const;

const FRAME_CLASS = "size-full object-cover";

/**
 * A ratio-locked frame around one photograph.
 *
 * `AspectRatio` reserves the box before the file lands, so the grid does not jump, and `object-cover`
 * crops rather than distorts: five sources at five different ratios cannot share a row otherwise.
 */
function Framed({
  photo,
  ratio,
  sizes,
  priority,
}: {
  photo: (typeof PHOTOS)[number];
  ratio: number;
  sizes: string;
  priority?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <AspectRatio ratio={ratio}>
        <Image
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          sizes={sizes}
          className={FRAME_CLASS}
          priority={priority}
        />
      </AspectRatio>
    </div>
  );
}

export default function ImagesPage() {
  return (
    <>
      <PageHeader title="Images" />
      <Demo
        title="Responsive Image"
        description="One column, filling the card. The box is reserved at 16:9 before the file arrives, so nothing shifts."
      >
        <Framed
          photo={PHOTOS[0]}
          ratio={16 / 9}
          sizes="(min-width: 1280px) 1054px, 100vw"
          priority
        />
      </Demo>
      <Demo title="Image in 2 Grid" description="Two up from the `sm` breakpoint, one below it.">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {[PHOTOS[1], PHOTOS[4]].map((photo) => (
            <Framed
              key={photo.src}
              photo={photo}
              ratio={16 / 9}
              sizes="(min-width: 640px) 50vw, 100vw"
            />
          ))}
        </div>
      </Demo>
      <Demo
        title="Image in 3 Grid"
        description="Three up from `xl`, two from `sm`, one below. The card's own padding is the gutter."
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {/* Five sources over six cells across the page, so `image-1` appears once more here at a
              third of the width. Reusing one is less noticeable than a sixth image in another style. */}
          {[PHOTOS[2], PHOTOS[3], PHOTOS[0]].map((photo, index) => (
            <Framed
              key={`${photo.src}-${index}`}
              photo={photo}
              ratio={16 / 9}
              sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
          ))}
        </div>
      </Demo>
    </>
  );
}
