import { BUTTON_SIZES, BUTTON_VARIANTS } from "@viliha/vui-core";
import { Button } from "@viliha/vui-react/button";
import { Cube, Plus } from "@viliha/vui-react/icons";

import { Demo, PageHeader } from "../../page-shell";

export const metadata = { title: "Buttons" };

/**
 * Every variant and every size, read off the component.
 *
 * **Six cards where the reference has eight, covering more.** Theirs enumerates two variants times
 * three icon positions as one card each, which is six cards saying the same thing twice about a
 * two-variant button. Ours has **seven** variants and **four** sizes, so a card per combination
 * would be twenty-eight; grouping by question instead of by pair gets all of it into six, and each
 * card answers one thing: which tones exist, which sizes, what an icon does on either side, and what
 * disabled looks like.
 *
 * Both lists come from `BUTTON_VARIANTS` and `BUTTON_SIZES` rather than being typed out, so a
 * variant added to the library shows up here and one removed cannot linger. That is the same rule
 * the badge and alert pages follow, and it is why this page has never understated the component.
 */
const VARIANTS = Object.keys(BUTTON_VARIANTS) as (keyof typeof BUTTON_VARIANTS)[];
/** `icon` is a shape rather than a scale, so it belongs in its own card and not the size row. */
const SIZES = (Object.keys(BUTTON_SIZES) as (keyof typeof BUTTON_SIZES)[]).filter(
  (size) => size !== "icon",
);

const label = (key: string) => `${key[0]?.toUpperCase()}${key.slice(1)}`;

function VariantRow({ icon }: { icon?: "start" | "end" }) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {VARIANTS.map((variant) => (
        <Button key={variant} variant={variant} size="lg">
          {icon === "start" ? <Cube aria-hidden="true" /> : null}
          {label(variant)}
          {icon === "end" ? <Cube aria-hidden="true" /> : null}
        </Button>
      ))}
    </div>
  );
}

export default function ButtonsPage() {
  return (
    <>
      <PageHeader title="Buttons" />
      <Demo title="Variants" description="Seven tones, read from the component's own table.">
        <VariantRow />
      </Demo>
      <Demo
        title="Sizes"
        description="Three scales. `lg` matches an input's height exactly, so a submit button never sits a few pixels short of the field above it."
      >
        <div className="flex flex-wrap items-center gap-4">
          {SIZES.map((size) => (
            <Button key={size} variant="primary" size={size}>
              {label(size)}
            </Button>
          ))}
        </div>
      </Demo>
      <Demo title="With a Left Icon">
        <VariantRow icon="start" />
      </Demo>
      <Demo title="With a Right Icon">
        <VariantRow icon="end" />
      </Demo>
      <Demo
        title="Icon Only"
        description="A square button for a toolbar. It still needs a name, so the label is `aria-label` rather than nothing."
      >
        <div className="flex flex-wrap items-center gap-4">
          {(["primary", "default", "outline", "ghost", "destructive"] as const).map((variant) => (
            <Button key={variant} variant={variant} size="icon" aria-label={`Add, ${variant}`}>
              <Plus aria-hidden="true" />
            </Button>
          ))}
        </div>
      </Demo>
      <Demo
        title="Disabled"
        description="Half opacity and no pointer events, so a disabled button cannot be hovered into looking live."
      >
        <div className="flex flex-wrap items-center gap-4">
          {VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} size="lg" disabled>
              {label(variant)}
            </Button>
          ))}
        </div>
      </Demo>
    </>
  );
}
