"use client";

import { type ReactNode, useRef, useState } from "react";
import { Button } from "./button";
import {
  BRAND_ASSET_ACTIONS,
  BRAND_ASSET_BOX,
  BRAND_ASSET_BOX_SIZES,
  BRAND_ASSET_DETAILS,
  BRAND_ASSET_EMPTY,
  BRAND_ASSET_ERROR,
  BRAND_ASSET_FITS,
  BRAND_ASSET_INPUT,
  BRAND_ASSET_ROOT,
  BRAND_ASSET_ROW,
} from "./class-variants";
import type { IconType, RecordField } from "./icon-type";
import { Cube as Building2, Globe, IdCard, Mail, Pin as MapPin, Person } from "./icons";
import {
  assetDetails,
  type BrandAssetMeta,
  type BrandAssetPick,
  FAVICON,
  LOGO,
  ORG_PROFILE_FIELD_SPECS,
  type OrgProfile,
  type OrgProfileIcon,
  pickAsset,
} from "./org-profile-core";
import { cn } from "./utils";

/**
 * Organization Profile preset: the field definitions for a company's profile, ready to drop into
 * `ProfileForm`. Ship your own `data` (of shape `OrgProfile`) and spread or override
 * `organizationProfileFields` to fit your schema.
 *
 * ```tsx
 * import { ProfileForm } from "@viliha/vui-react/profile-form";
 * import { organizationProfileFields, getOrgPrimary, type OrgProfile } from "@viliha/vui-react/organization-profile";
 *
 * <ProfileForm data={org} fields={organizationProfileFields}
 *   getPrimary={getOrgPrimary} onSave={save} title="Organization" />
 * ```
 *
 * **The profile itself is defined once, in `@viliha/vui-core`.** The type, the twenty-five field
 * definitions, the brand-asset rules and `getOrgPrimary` live there and are re-exported below, so this
 * stays the import path it has always been. What this file adds is the three things a framework owns:
 * the icons, the read renderer and the edit control. Twenty-five field definitions written twice is
 * exactly the list that drifts silently — one edition gains a `required`, or a label is fixed in one
 * place.
 */
export {
  assetDetails,
  type BrandAssetMeta,
  type BrandAssetPick,
  fileMeta,
  formatBytes,
  getOrgPrimary,
  ORGANIZATION_PROFILE_DESCRIPTION,
  type OrgProfile,
  readDataUrl,
} from "./org-profile-core";

export const ORGANIZATION_PROFILE_ICON: IconType = Building2;

/** The named icons the shared field list asks for, bound to this edition's components. */
const ICONS: Record<OrgProfileIcon, IconType> = {
  building: Building2,
  globe: Globe,
  idCard: IdCard,
  mail: Mail,
  mapPin: MapPin,
  person: Person,
};

export type BrandAssetProps = {
  /** The URL to display. Whatever you store (an id, a path) is your business —
   *  the control only renders this. */
  value: string;
  /** Called with the picked file. Upload it and return the URL to show. Async
   *  is fine: the control shows its own busy state until the promise settles,
   *  and shows the error if it rejects. */
  onPick?: (file: File) => BrandAssetPick | void | Promise<BrandAssetPick | void>;
  /** Called when Remove is clicked, before the value is cleared. Use it to
   *  delete the stored asset. */
  onRemove?: () => void;
  /** Receives the new URL after a pick, and `""` after Remove. `renderInput`
   *  wires this to the form value for you. */
  onChange?: (value: string) => void;
  /** Details for the current asset, shown under the preview. */
  meta?: BrandAssetMeta;
  /** File picker filter. Defaults to every image type. */
  accept?: string;
  /** Reject anything larger, before `onPick` is called. */
  maxBytes?: number;
  /** Force the busy state, e.g. while a save is in flight. */
  busy?: boolean;
  /** Demo escape hatch: with no backend, read the file as a base64 data URI and
   *  use that as the value. Never ship this against a real API — the whole
   *  image ends up in the field. */
  inline?: boolean;
  square?: boolean;
  /** What the empty box shows. Defaults to "None"; an avatar passes initials. */
  placeholder?: ReactNode;
  /** `contain` keeps a logo whole (default); `cover` fills the box, for a photo. */
  fit?: "contain" | "cover";
  readOnly?: boolean;
};

/** Logo / favicon control: a preview, an optional details line, and
 *  Replace / Remove. It never uploads anything itself — you hand it an
 *  `onPick` that stores the file and returns a URL. Used as `renderInput`
 *  (edit) alongside `render` (view), and exported so you can reuse it for
 *  other image fields.
 *
 * ```tsx
 * <BrandAsset
 *   value={org.logoUrl}
 *   onPick={async (file) => ({ url: (await uploadToS3(file)).url })}
 *   maxBytes={2 * 1024 * 1024}
 * />
 * ``` */
export function BrandAsset({
  value,
  onPick,
  onRemove,
  onChange,
  meta,
  accept = "image/*",
  maxBytes,
  busy,
  inline,
  square,
  placeholder,
  fit = "contain",
  readOnly,
}: BrandAssetProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  // Details from the last pick, kept only while they describe the current
  // value — so Cancel (which reverts `value`) drops them too.
  const [picked, setPicked] = useState<{ url: string; meta: BrandAssetMeta }>();
  const [dims, setDims] = useState<{ width: number; height: number }>();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const working = busy || uploading;
  const info = picked?.url === value ? picked.meta : meta;
  const details = assetDetails(info, dims);

  async function handleFile(file: File) {
    setError("");
    setUploading(true);
    // The size check, the missing-uploader case and what a return value means are `pickAsset`'s, so
    // both editions accept and reject the same files with the same words.
    const result = await pickAsset(file, { onPick, inline, maxBytes });
    setUploading(false);
    if (!result) return; // the caller updated `value` itself
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setPicked(result);
    setDims(undefined);
    onChange?.(result.url);
  }

  return (
    <div className={BRAND_ASSET_ROOT}>
      <div className={BRAND_ASSET_ROW}>
        <div className={cn(BRAND_ASSET_BOX, BRAND_ASSET_BOX_SIZES[square ? "square" : "wide"])}>
          {value ? (
            <img
              src={value}
              alt=""
              className={BRAND_ASSET_FITS[fit]}
              onLoad={(e) =>
                setDims({
                  width: e.currentTarget.naturalWidth,
                  height: e.currentTarget.naturalHeight,
                })
              }
            />
          ) : (
            <span className={BRAND_ASSET_EMPTY}>{placeholder ?? "None"}</span>
          )}
        </div>
        {!readOnly && (
          <div className={BRAND_ASSET_ACTIONS}>
            <Button
              size="sm"
              type="button"
              disabled={working}
              onClick={() => inputRef.current?.click()}
            >
              {working ? "Uploading…" : value ? "Replace" : "Upload"}
            </Button>
            {value && (
              <Button
                size="sm"
                variant="ghost"
                type="button"
                disabled={working}
                onClick={() => {
                  setError("");
                  setPicked(undefined);
                  setDims(undefined);
                  onRemove?.();
                  onChange?.("");
                }}
              >
                Remove
              </Button>
            )}
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              className={BRAND_ASSET_INPUT}
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = ""; // allow re-picking the same file
                if (file) void handleFile(file);
              }}
            />
          </div>
        )}
      </div>
      {details.length > 0 && <p className={BRAND_ASSET_DETAILS}>{details.join(" · ")}</p>}
      {error && <p className={BRAND_ASSET_ERROR}>{error}</p>}
    </div>
  );
}

/** How a brand-asset field stores its file. Everything `BrandAsset` takes
 *  except the props the field itself supplies. */
export type BrandAssetHost = Omit<BrandAssetProps, "value" | "onChange" | "square" | "readOnly">;

export type OrgProfileFieldOptions = {
  logo?: BrandAssetHost;
  favicon?: BrandAssetHost;
};

/**
 * Bind one shared spec to this edition: its icon, and — for the two brand assets — the preview and the
 * picker. `render` is the read view and `renderInput` the edit control, which is the pair that cannot
 * be shared because both return markup.
 */
const bind = (
  spec: (typeof ORG_PROFILE_FIELD_SPECS)[number],
  hosts: OrgProfileFieldOptions,
): RecordField<OrgProfile> => {
  const { iconName, brandAsset, ...field } = spec;
  const base = {
    ...field,
    icon: iconName ? ICONS[iconName] : undefined,
  } as RecordField<OrgProfile>;
  if (!brandAsset) return base;
  const square = brandAsset === "favicon";
  const host: BrandAssetHost = {
    inline: true,
    maxBytes: (brandAsset === "logo" ? LOGO : FAVICON).maxBytes,
    ...hosts[brandAsset],
  };
  return {
    ...base,
    render: (row) => <BrandAsset {...host} value={row[brandAsset]} square={square} readOnly />,
    renderInput: ({ value, onChange }) => (
      <BrandAsset {...host} value={value} onChange={onChange} square={square} />
    ),
  };
};

/**
 * The organization profile fields, with your uploader wired into the Logo and
 * Favicon controls:
 *
 * ```tsx
 * const fields = orgProfileFields({
 *   logo: { onPick: async (file) => ({ url: await upload(file) }) },
 *   favicon: { onPick: async (file) => ({ url: await upload(file) }) },
 * });
 * ```
 *
 * Pass no options and the brand assets fall back to `inline` (base64 data URI)
 * mode, which is fine for a demo with no backend and wrong for anything else.
 * `organizationProfileFields` is that demo default, pre-built.
 */
export function orgProfileFields(hosts: OrgProfileFieldOptions = {}): RecordField<OrgProfile>[] {
  return ORG_PROFILE_FIELD_SPECS.map((spec) => bind(spec, hosts));
}

export const organizationProfileFields: RecordField<OrgProfile>[] = orgProfileFields();
