/**
 * `jsvectormap` ships no types, so this declares the narrow surface we use and nothing else.
 *
 * Narrow on purpose. A hand-written declaration that guesses at the whole API is a second, worse copy
 * of the library's documentation which nothing keeps in step; four options and a `destroy` is what
 * `world-map.tsx` calls, so four options and a `destroy` is what this says.
 */
declare module "jsvectormap" {
  interface RegionStyle {
    initial?: Record<string, string | number>;
    hover?: Record<string, string | number>;
  }

  interface MarkerStyle {
    initial?: Record<string, string | number>;
    hover?: Record<string, string | number>;
  }

  interface Marker {
    name: string;
    coords: [number, number];
  }

  interface MapOptions {
    selector: HTMLElement | string;
    map: string;
    zoomButtons?: boolean;
    zoomOnScroll?: boolean;
    backgroundColor?: string;
    regionStyle?: RegionStyle;
    markers?: Marker[];
    markerStyle?: MarkerStyle;
    /** jsvectormap's own label config. `render` returns the text shown beside a marker. */
    labels?: {
      markers?: {
        render: (marker: Marker) => string;
        /** `[x, y]` in pixels from the marker's centre, so the dot does not sit on the text. */
        offsets?: (index: number) => [number, number];
      };
    };
  }

  export default class JsVectorMap {
    constructor(options: MapOptions);
    destroy(): void;
  }
}

/** The map data files register themselves with the library and export nothing. */
// The Miller projection, which is what the reference renders (`worldMill`). The Mercator file is
// declared too: it ships in the same package and a reader switching back should not have to add a
// line to do it.
declare module "jsvectormap/dist/maps/world.js";
declare module "jsvectormap/dist/maps/world-merc.js";
