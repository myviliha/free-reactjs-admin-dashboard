/**
 * The organization profile, framework-free: what a company's profile holds, the twenty-five fields it
 * is made of, and the rules the brand-asset control needs.
 *
 * **The field list is data, so it is shared rather than written twice.** Only three things about a field
 * belong to a framework (its icon, its read renderer and its edit control), so the list here names an
 * icon by string and marks the two brand-asset fields by name, and each edition maps those to its own
 * components. Twenty-five field definitions is exactly the kind of list that drifts silently: one
 * edition gains a `required`, or a label is fixed in one place.
 *
 * Lifted out of `organization-profile.tsx` on 2026-08-20 for wave 6 of the Vue parity epic.
 */

import type { FieldRules } from "./record-field-core";

export type OrgProfile = {
  id: number;
  // Organization information
  legalName: string;
  displayName: string;
  orgId: string; // read-only, generated at creation
  domain: string;
  registrationNo: string;
  industry: string;
  country: string;
  region: string;
  description: string;
  // Brand assets — data URLs (or a CDN URL once wired). Empty = use initials.
  logo: string;
  favicon: string;
  // Contact & address
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  billingEmail: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  // Localization & units
  timezone: string;
  currency: string;
  dateFormat: string;
  measurement: string;
  language: string;
};

export const ORGANIZATION_PROFILE_DESCRIPTION =
  "This is your organization's profile: the company details, branding, contact information and locale that appear across the app, its portal, documents and emails. Switch to Edit to change anything, then Save. Fields marked with * are required.";

/** value === label options (the demo stores display strings). */
const opts = (vals: readonly string[]) => vals.map((v) => ({ value: v, label: v }));

/**
 * Details for the line under a brand asset. Every part is optional; only the ones you supply are shown.
 */
export type BrandAssetMeta = {
  name?: string;
  /** File type shown as-is, e.g. `"PNG"`, `"SVG"`. */
  format?: string;
  width?: number;
  height?: number;
  sizeBytes?: number;
  uploadedAt?: string | Date;
};

/**
 * What `onPick` may return: the URL to display, optionally with details for the preview line. Return
 * nothing if you drive `value` yourself.
 */
export type BrandAssetPick = string | { url: string; meta?: BrandAssetMeta };

export const formatBytes = (n: number) =>
  n >= 1024 * 1024
    ? `${(n / 1024 / 1024).toFixed(n < 10 * 1024 * 1024 ? 1 : 0)} MB`
    : `${Math.max(1, Math.round(n / 1024))} KB`;

export const fileMeta = (file: File): BrandAssetMeta => ({
  name: file.name,
  format: file.type.split("/")[1]?.toUpperCase(),
  sizeBytes: file.size,
  uploadedAt: new Date(),
});

export const readDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });

/**
 * The line under the preview: name, format, dimensions, size, upload date, in that order, with the
 * absent parts dropped rather than rendered empty. Shared because it is the part a reader actually
 * reads, and two implementations would order or format it differently.
 */
export function assetDetails(
  info: BrandAssetMeta | undefined,
  dims?: { width: number; height: number },
): string[] {
  const width = info?.width ?? dims?.width;
  const height = info?.height ?? dims?.height;
  return [
    info?.name,
    info?.format,
    width && height ? `${width} × ${height}` : undefined,
    info?.sizeBytes ? formatBytes(info.sizeBytes) : undefined,
    info?.uploadedAt ? new Date(info.uploadedAt).toISOString().slice(0, 10) : undefined,
  ].filter((part): part is string => Boolean(part));
}

/**
 * One step of a pick, with no framework in it: the size check, the "no uploader" case, and what the
 * caller's return value means. Returns the new url and meta, `null` when the caller drives `value`
 * itself, or an error message to show.
 */
export async function pickAsset(
  file: File,
  args: {
    onPick?: (file: File) => BrandAssetPick | void | Promise<BrandAssetPick | void>;
    inline?: boolean;
    maxBytes?: number;
  },
): Promise<{ url: string; meta: BrandAssetMeta } | null | { error: string }> {
  if (args.maxBytes && file.size > args.maxBytes)
    return {
      error: `That file is ${formatBytes(file.size)}. The limit is ${formatBytes(args.maxBytes)}.`,
    };
  if (!args.onPick && !args.inline) return { error: "This field has no uploader configured." };
  try {
    const result = args.onPick
      ? await args.onPick(file)
      : { url: await readDataUrl(file), meta: fileMeta(file) };
    // Nothing returned means the caller updated `value` itself.
    if (!result) return null;
    const url = typeof result === "string" ? result : result.url;
    const meta = typeof result === "string" ? fileMeta(file) : (result.meta ?? fileMeta(file));
    return { url, meta };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Upload failed." };
  }
}

/** The icons this profile uses, named rather than imported: each edition maps these to its own. */
export type OrgProfileIcon = "idCard" | "globe" | "mapPin" | "person" | "mail" | "building";

/**
 * One field of the profile, with the three framework-owned parts replaced by names. `brandAsset` marks
 * the two that render an image control rather than a value.
 */
export type OrgProfileFieldSpec = FieldRules<OrgProfile> & {
  iconName?: OrgProfileIcon;
  brandAsset?: "logo" | "favicon";
};

export const LOGO = {
  label: "Logo",
  description:
    "Recommended 480 × 160, transparent background. SVG or PNG, max 2 MB. If unset, the organization's initials are used.",
  maxBytes: 2 * 1024 * 1024,
};

export const FAVICON = {
  label: "Favicon",
  description: "Square, 512 × 512. Used for the browser tab and mobile shortcut. Max 512 KB.",
  maxBytes: 512 * 1024,
};

const INDUSTRIES = [
  "Retail operations",
  "Property services",
  "Facilities management",
  "Hospitality",
  "Logistics",
];
const COUNTRIES = ["United States", "Canada", "Mexico", "United Kingdom", "Japan", "Australia"];
const REGIONS = ["Americas", "EMEA", "APAC"];
const TIMEZONES = [
  "America/Los_Angeles (UTC−7)",
  "America/New_York (UTC−4)",
  "Europe/London (UTC+1)",
  "Asia/Tokyo (UTC+9)",
];
const CURRENCIES = ["USD ($)", "CAD ($)", "GBP (£)", "EUR (€)", "JPY (¥)"];
const DATE_FORMATS = ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"];
const MEASUREMENTS = ["Imperial (ft, lb, °F)", "Metric (m, kg, °C)"];
const LANGUAGES = ["English (US)", "English (UK)", "Français", "日本語"];

/** The organization profile's fields, in the order they appear, sections and all. */
export const ORG_PROFILE_FIELD_SPECS: readonly OrgProfileFieldSpec[] = [
  // ── Organization information ──
  {
    key: "legalName",
    label: "Legal name",
    description: "As registered. Appears on contracts and invoices.",
    group: "Organization information",
    editable: true,
    required: true,
  },
  {
    key: "displayName",
    label: "Display name",
    description: "Shown in the sidebar and across the app.",
    group: "Organization information",
    editable: true,
    required: true,
  },
  {
    key: "orgId",
    label: "Organization ID",
    description: "Generated at creation. Cannot be changed.",
    iconName: "idCard",
    group: "Organization information",
    // Not editable → renders as a read-only value in both modes.
  },
  {
    key: "domain",
    label: "Primary domain",
    description: "Used to match new users to this organization.",
    iconName: "globe",
    group: "Organization information",
    editable: true,
    required: true,
  },
  {
    key: "registrationNo",
    label: "Registration no.",
    description: "Business registration or tax number.",
    group: "Organization information",
    editable: true,
  },
  {
    key: "industry",
    label: "Industry",
    group: "Organization information",
    editable: true,
    options: opts(INDUSTRIES),
  },
  {
    key: "country",
    label: "Country",
    description: "Headquarters country. Drives default tax and locale.",
    iconName: "mapPin",
    group: "Organization information",
    editable: true,
    required: true,
    options: opts(COUNTRIES),
  },
  {
    key: "region",
    label: "Region",
    description: "Drives reporting rollups and data residency.",
    group: "Organization information",
    editable: true,
    required: true,
    options: opts(REGIONS),
  },
  {
    key: "description",
    label: "Description",
    description: "A short summary of what this organization does.",
    group: "Organization information",
    editable: true,
  },

  // ── Brand assets ──
  {
    key: "logo",
    label: LOGO.label,
    description: LOGO.description,
    group: "Brand assets",
    editable: true,
    brandAsset: "logo",
  },
  {
    key: "favicon",
    label: FAVICON.label,
    description: FAVICON.description,
    group: "Brand assets",
    editable: true,
    brandAsset: "favicon",
  },

  // ── Contact & address ──
  {
    key: "contactName",
    label: "Primary contact",
    iconName: "person",
    group: "Contact & address",
    editable: true,
  },
  {
    key: "contactEmail",
    label: "Contact email",
    iconName: "mail",
    group: "Contact & address",
    editable: true,
    copyable: true,
  },
  { key: "contactPhone", label: "Contact phone", group: "Contact & address", editable: true },
  {
    key: "billingEmail",
    label: "Billing email",
    description: "Where invoices and billing notices are sent.",
    iconName: "mail",
    group: "Contact & address",
    editable: true,
    copyable: true,
  },
  { key: "address1", label: "Registered address", group: "Contact & address", editable: true },
  { key: "address2", label: "Address line 2", group: "Contact & address", editable: true },
  { key: "city", label: "City", group: "Contact & address", editable: true },
  { key: "state", label: "State / province", group: "Contact & address", editable: true },
  { key: "postalCode", label: "Postal code", group: "Contact & address", editable: true },

  // ── Localization & units ──
  {
    key: "timezone",
    label: "Timezone",
    group: "Localization & units",
    editable: true,
    options: opts(TIMEZONES),
  },
  {
    key: "currency",
    label: "Currency",
    description: "Changing this does not convert historical invoices.",
    group: "Localization & units",
    editable: true,
    options: opts(CURRENCIES),
  },
  {
    key: "dateFormat",
    label: "Date format",
    group: "Localization & units",
    editable: true,
    options: opts(DATE_FORMATS),
  },
  {
    key: "measurement",
    label: "Measurement system",
    group: "Localization & units",
    editable: true,
    options: opts(MEASUREMENTS),
  },
  {
    key: "language",
    label: "Default language",
    group: "Localization & units",
    editable: true,
    options: opts(LANGUAGES),
  },
];

export function getOrgPrimary(row: OrgProfile) {
  return {
    title: row.displayName || row.legalName,
    subtitle: row.domain,
    initials: (row.displayName || row.legalName || "OP").slice(0, 2).toUpperCase(),
  };
}
