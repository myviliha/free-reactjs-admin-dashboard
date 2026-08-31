"use client";

import { CameraIcon, ExitIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import {
  cn,
  DEMO_PROFILE_FIELDS,
  DEMO_SOCIALS,
  DEMO_USER,
  PROFILE_CARD,
  PROFILE_FIELD_LABEL,
  PROFILE_PILL,
  type ProfileField,
} from "@viliha/vui-core";
import { Avatar, AvatarFallback, AvatarImage } from "@viliha/vui-react/avatar";
import { Button } from "@viliha/vui-react/button";
import { Dialog } from "@viliha/vui-react/dialog";
import { Input } from "@viliha/vui-react/input";
import { Label } from "@viliha/vui-react/label";
import { Switch } from "@viliha/vui-react/switch";
import * as React from "react";

/**
 * The profile page's cards.
 *
 * **Built from the dev's screenshots, which are a newer page than `reference/nextjs` carries.** That
 * checkout has three cards (identity, personal information, address); the current design folds the
 * personal fields into the identity card and adds Security and Danger Zone. Where the two disagree
 * the screenshots win, because they are what the product looks like now.
 *
 * Their copy has two mistakes that are not being copied: the Logout row's button reads "Change
 * Password", and Delete account's description reads "Sign out from every active session." Matching a
 * design does not mean matching a paste error.
 */

/**
 * A read-only field's label: **14px at weight 500**, in the muted colour.
 *
 * A constant because it appears twice, over the value grid and over the social row, and it had
 * already drifted: both were `text-sm` with no weight at all, so they inherited 400 and read lighter
 * than the reference's 500. Two copies of one style is how the next difference gets in.
 */

/** Re-exported so the modules already importing it from here keep working. */
export type Field = ProfileField;

/** A card, at their measurements: `rounded-2xl border p-5 lg:p-6`. */
function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn(PROFILE_CARD, className)}>{children}</div>;
}

function EditButton({ onClick, label = "Edit" }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" onClick={onClick} className={PROFILE_PILL}>
      <Pencil1Icon className="size-4" />
      {label}
    </button>
  );
}

/**
 * One read-only field.
 *
 * Measured off the screenshots: a 14px label at weight 500 over a 15px semibold value. Mine had a
 * 12px label at weight 400 over a `font-medium` value, which read as a caption above a caption
 * rather than a label over an answer.
 */
function ReadOnlyField({ label, value, full }: Field) {
  return (
    <div className={full ? "lg:col-span-2" : undefined}>
      <p className={PROFILE_FIELD_LABEL}>{label}</p>
      <p className="text-[15px] font-semibold">{value || "Not set"}</p>
    </div>
  );
}

/** The four marks, drawn monochrome. One `path` each: enough to recognise, no colour logos. */
/**
 * The social marks, each with **its own viewBox**.
 *
 * **A shared `0 0 24 24` box at one size does not make them one size.** Measured: Facebook's glyph
 * occupies 7 by 14.5 of that box, X and LinkedIn 19 by 18, Instagram 19.6 square. So `size-6` on all
 * four rendered heights differing by a quarter, which is exactly what a row of logos cannot get away
 * with. Each box here is tightened to its own mark's bounds, and the svg is given a **height** with
 * width left to follow, so every glyph is the same height and the widths vary the way real logos do.
 *
 * `box` is `minX minY width height`, in the original 24-unit coordinates.
 */

function SocialRow() {
  return (
    <div>
      <p className={PROFILE_FIELD_LABEL}>Social Links</p>
      {/* **A bordered circle each, which is what the reference does too.** `h-11 w-11 rounded-full
          border` is the same chrome its profile card uses and the same our header controls wear, so
          the row reads as a set of controls rather than four loose glyphs at four sizes. */}
      <div className="flex items-center gap-2">
        {DEMO_SOCIALS.map((social) => (
          // Not links: a demo pointing at a real account sends a reader somewhere it did not mean
          // to. The marks are drawn monochrome rather than pasted as colour logos.
          <span
            key={social.name}
            title={social.name}
            className="grid size-11 place-items-center rounded-full border border-border bg-card text-foreground/75"
          >
            {/* A height and no width: the box is per mark, so equal heights is what makes them
                match, and forcing equal widths would squash the narrow ones. */}
            <svg
              viewBox={social.box}
              height="17"
              fill="currentColor"
              aria-hidden="true"
              className="w-auto"
            >
              <path d={social.path} />
            </svg>
            <span className="sr-only">{social.name}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** A Security or Danger Zone row: a title, a line of explanation, and one action. */
function ActionRow({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}

/**
 * The identity card: avatar, name, role and location, then the personal fields and the socials.
 *
 * The newer design folds what used to be a separate "Personal Information" card into this one, which
 * is the better call: a name and the fields that spell that name out are one subject, and splitting
 * them put an Edit button on each half of the same thing.
 */
export function ProfileCard() {
  const [open, setOpen] = React.useState(false);
  // Starts at the supplied portrait: an avatar demo whose avatar is two letters is showing the
  // fallback, not the component.
  const [photo, setPhoto] = React.useState<string | null>(DEMO_USER.photo);

  const [fields, setFields] = React.useState<Field[]>([...DEMO_PROFILE_FIELDS]);

  const shown = fields.filter((field) => field.section === "Personal Information");

  return (
    <Card>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
          <Avatar className="size-[112px] shrink-0 border border-border">
            {photo ? <AvatarImage src={photo} alt="" /> : null}
            <AvatarFallback className="text-2xl font-medium">{DEMO_USER.initials}</AvatarFallback>
          </Avatar>

          <div className="text-center sm:text-left">
            <h4 className="text-xl font-semibold">John Doe</h4>
            <div className="mt-1 flex flex-col items-center gap-1 sm:flex-row sm:gap-3">
              <p className="text-[15px] text-muted-foreground">Team Manager</p>
              {/* Only once the row is horizontal: stacked, it would be a stray dash between lines. */}
              <div aria-hidden="true" className="hidden h-4 w-px bg-border sm:block" />
              <p className="text-[15px] text-muted-foreground">Singapore</p>
            </div>
          </div>
        </div>

        <EditButton onClick={() => setOpen(true)} />
      </div>

      {/* Their grid: two columns for the names, four for the rest, so a phone number and a bio do not
          each get half a page. */}
      <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {shown.slice(0, 2).map((field) => (
          <ReadOnlyField key={field.label} {...field} />
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {shown.slice(2).map((field) => (
          <ReadOnlyField key={field.label} {...field} />
        ))}
        <SocialRow />
      </div>

      <EditDialog
        title="Personal Information"
        open={open}
        onClose={() => setOpen(false)}
        fields={fields}
        onSave={setFields}
        photo={photo}
        onPhotoChange={setPhoto}
      />
    </Card>
  );
}

/** A card of fields with an Edit that opens the same fields in a dialog. */
export function FieldCard({
  title,
  fields,
  columns = 2,
}: {
  title: string;
  fields: Field[];
  columns?: 1 | 2;
}) {
  const [values, setValues] = React.useState(fields);
  const [open, setOpen] = React.useState(false);

  return (
    <Card>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <h4 className="text-lg font-semibold">{title}</h4>
        <EditButton onClick={() => setOpen(true)} />
      </div>
      <div
        className={cn("mt-6 grid grid-cols-1 gap-6", columns === 2 && "sm:grid-cols-2 sm:gap-x-8")}
      >
        {values.map((field) => (
          <ReadOnlyField key={field.label} {...field} />
        ))}
      </div>

      <EditDialog
        title={title}
        open={open}
        onClose={() => setOpen(false)}
        fields={values}
        onSave={setValues}
      />
    </Card>
  );
}

/** Security: the password and the second factor. */
export function SecurityCard() {
  const [twoFactor, setTwoFactor] = React.useState(false);

  return (
    <Card>
      <h4 className="mb-2 text-lg font-semibold">Security</h4>
      <div className="divide-y divide-border">
        <ActionRow
          title="Change Password"
          // Their copy here describes notifications, which is a paste from another row.
          description="Use a password you do not use anywhere else."
          action={
            <button type="button" className={PROFILE_PILL}>
              <Pencil1Icon className="size-4" />
              Change Password
            </button>
          }
        />
        <ActionRow
          title="Two-factor authentication (2FA)"
          description="Keep your account secure by enabling 2FA."
          action={
            <Switch
              checked={twoFactor}
              onCheckedChange={setTwoFactor}
              aria-label="Two-factor authentication"
            />
          }
        />
      </div>
    </Card>
  );
}

/**
 * Danger Zone: the two actions that cannot be undone.
 *
 * Only Delete is destructive-coloured. Signing out of every session is inconvenient and reversible,
 * and painting both red would leave a reader with no way to tell which one they cannot take back.
 */
export function DangerZoneCard() {
  return (
    <Card>
      <h4 className="mb-2 text-lg font-semibold">Danger Zone</h4>
      <div className="divide-y divide-border">
        <ActionRow
          title="Logout all devices"
          description="Sign out from every active session."
          action={
            <button type="button" className={PROFILE_PILL}>
              <ExitIcon className="size-4" />
              Log out everywhere
            </button>
          }
        />
        <ActionRow
          title="Delete account"
          // Theirs repeats the sign-out sentence here. This says what deleting actually does.
          description="Permanently remove your account and its data. This cannot be undone."
          action={
            <button
              type="button"
              className={cn(
                PROFILE_PILL,
                "border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive",
              )}
            >
              <TrashIcon className="size-4" />
              Delete account
            </button>
          }
        />
      </div>
    </Card>
  );
}

/**
 * The edit dialog every card shares.
 *
 * Their old checkout duplicates this in all three components and the copies have already drifted,
 * one carrying a `pr-14` to clear its close button while the others do not. One dialog, one set of
 * measurements. The draft is copied on open and committed only on save, so Close discards rather
 * than being a no-op that looks like a cancel: a thing a reader finds out by losing work.
 */
function EditDialog({
  title,
  open,
  onClose,
  fields,
  onSave,
  photo,
  onPhotoChange,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  fields: Field[];
  onSave: (fields: Field[]) => void;
  /** Passing these turns on the Change Profile Picture section. The address card has no picture. */
  photo?: string | null;
  onPhotoChange?: (photo: string | null) => void;
}) {
  const [draft, setDraft] = React.useState(fields);
  const fileInput = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (open) setDraft(fields);
  }, [open, fields]);

  /**
   * The picture, read locally.
   *
   * **The dialog owns this, not the card**, which is where the reference puts it: changing a photo
   * is editing your profile, so it belongs with the other edits and behind the same Save. A camera
   * badge on the card would change it instantly with no way to cancel, which is a different promise
   * from every other field on the page.
   *
   * There is no server here, so `FileReader` shows the chosen file and a buyer swaps one handler for
   * their upload. A data URL rather than an object URL: the latter needs revoking on unmount to
   * avoid leaking, and holding a demo's bytes costs nothing.
   */
  const pickPhoto = (file: File | undefined) => {
    if (!file || !onPhotoChange) return;
    const reader = new FileReader();
    reader.onload = () => onPhotoChange(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  };

  const sections = Array.from(new Set(draft.map((field) => field.section ?? title)));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      label={`Edit ${title}`}
      className="max-w-[700px] rounded-3xl p-4 lg:p-11"
    >
      {/* `pr-14` keeps the heading clear of the close control, which is `Dialog`'s own. */}
      <div className="px-2 pr-14">
        <h4 className="mb-2 text-2xl font-semibold">Edit {title}</h4>
        <p className="mb-6 text-sm text-muted-foreground lg:mb-7">
          Update your details to keep your profile up to date.
        </p>
      </div>

      {/* A real `<form>`: Enter submits from any field, which a stack of divs silently refuses.
          `noValidate` because the browser's bubble competes with inline messages. */}
      <form
        className="flex flex-col"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          onSave(draft);
          onClose();
        }}
      >
        <div className="vui-scroll max-h-[450px] overflow-y-auto px-2 pb-3">
          {onPhotoChange ? (
            <div className="mb-7">
              <h5 className="mb-6 text-xl font-semibold">Change Profile Picture</h5>
              {/* Measured off the reference: a 112px circle, the guidance at 16px vertically
                  centred beside it, and about forty pixels between the two. Mine was a 100px circle
                  with 14px text at `gap-6`, which read as a thumbnail with a caption. */}
              <div className="flex items-center gap-8 sm:gap-10">
                <div className="relative shrink-0">
                  <Avatar className="size-[112px] border border-border">
                    {photo ? <AvatarImage src={photo} alt="" /> : null}
                    <AvatarFallback className="text-2xl font-medium">
                      {DEMO_USER.initials}
                    </AvatarFallback>
                  </Avatar>
                  {/* A `label` wrapping a hidden file input, not a button calling `.click()`. The
                      label is already the input's control, so it is keyboard reachable and announced
                      as a file picker for free, where a button faking it announces nothing. */}
                  <label
                    // `z-20`, above the avatar's image. `AVATAR_IMAGE` is `absolute inset-0 z-10`, so an
                    // uploaded picture painted straight over this badge: the control disappeared at
                    // exactly the moment it had something to undo. The wrapper is the positioning
                    // context, so the stacking order between the two is ours to state.
                    className="absolute right-1.5 bottom-1.5 z-20 grid size-9 cursor-pointer place-items-center rounded-full border-2 border-card bg-card text-foreground/70 shadow-sm transition-colors hover:text-foreground focus-within:ring-2 focus-within:ring-ring"
                    title="Change profile picture"
                  >
                    <CameraIcon className="size-4" aria-hidden="true" />
                    <span className="sr-only">Change profile picture</span>
                    <input
                      ref={fileInput}
                      type="file"
                      accept="image/jpeg,image/png"
                      className="sr-only"
                      onChange={(event) => pickPhoto(event.target.files?.[0])}
                    />
                  </label>
                </div>
                <div className="text-base leading-relaxed text-muted-foreground">
                  {/* Their guidance, verbatim in substance: a reader who knows the expected size and
                      format before choosing a file does not have to be told off after. */}
                  <p>Upload a square image (200x200 px)</p>
                  <p>in JPEG or PNG format.</p>
                  {photo ? (
                    <button
                      type="button"
                      onClick={() => {
                        onPhotoChange(null);
                        // Clear the input too, or choosing the same file again fires no `change`.
                        if (fileInput.current) fileInput.current.value = "";
                      }}
                      className="mt-2 cursor-pointer text-sm font-medium text-destructive hover:underline"
                    >
                      Remove picture
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
          {sections.map((section, sectionIndex) => (
            <div key={section} className={sectionIndex > 0 || onPhotoChange ? "mt-7" : undefined}>
              <h5 className="mb-5 text-lg font-semibold lg:mb-6">{section}</h5>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                {draft.map((field, index) =>
                  (field.section ?? title) !== section ? null : (
                    <div key={field.label} className={field.full ? "lg:col-span-2" : undefined}>
                      <Label
                        htmlFor={`edit-${field.label}`}
                        className="mb-1.5 block text-sm font-medium"
                      >
                        {field.label}
                      </Label>
                      <Input
                        id={`edit-${field.label}`}
                        value={field.value}
                        onChange={(event) =>
                          setDraft((current) =>
                            current.map((item, i) =>
                              i === index ? { ...item, value: event.target.value } : item,
                            ),
                          )
                        }
                      />
                    </div>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 px-2 lg:flex-row lg:justify-end">
          <Button type="button" variant="outline" size="lg" onClick={onClose}>
            Close
          </Button>
          <Button type="submit" variant="primary" size="lg">
            Save Changes
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
