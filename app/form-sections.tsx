"use client";

import { EnvelopeClosedIcon, UploadIcon } from "@radix-ui/react-icons";
import {
  cn,
  FILE_INPUT,
  todayISO,
  UPLOAD_DROP,
  UPLOAD_DROP_BADGE,
  UPLOAD_DROP_HINT,
} from "@viliha/vui-core";
import { Checkbox } from "@viliha/vui-react/checkbox";
import { Input } from "@viliha/vui-react/input";
import { Label } from "@viliha/vui-react/label";
import { MultiCombobox } from "@viliha/vui-react/multi-combobox";
import { PasswordInput } from "@viliha/vui-react/password-input";
import { RadioGroup, RadioGroupItem } from "@viliha/vui-react/radio-group";
import { Select } from "@viliha/vui-react/select";
import { StatusField } from "@viliha/vui-react/status-field";
import { Switch } from "@viliha/vui-react/switch";
import { Textarea } from "@viliha/vui-react/textarea";
import * as React from "react";

import { DateField } from "./date-field";
import { TimeField } from "./time-field";

/**
 * The form elements page's ten sections.
 *
 * Their `ComponentCard`, measured: `rounded-2xl border`, a header at `px-6 py-5` with an `h3` at
 * `text-base font-medium`, then a body at `p-4 sm:p-6` behind a **lighter** top rule than the card's
 * own border, with `space-y-6` between children.
 *
 * Two places this beats the reference rather than matching it, both marked at the point they happen:
 * the dropzone needs no `react-dropzone`, and the field states say what is wrong rather than only
 * turning a border red.
 */

/** One field: label above control, at the measurements the profile and calendar dialogs use. */
function FormField({
  label,
  htmlFor,
  hint,
  error,
  success,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  success?: string;
  children: React.ReactNode;
}) {
  const message = error ?? success ?? hint;
  return (
    <div>
      <Label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
        {label}
      </Label>
      {children}
      {message ? (
        <p
          className={cn(
            "mt-1.5 text-xs",
            error && "text-destructive",
            success && "text-success",
            !error && !success && "text-muted-foreground",
          )}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}

export function SectionCard({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="px-6 py-5">
        <h3 className="text-base font-medium">{title}</h3>
        {desc ? <p className="mt-1 text-sm text-muted-foreground">{desc}</p> : null}
      </div>
      {/* Their body rule is lighter than the card's own border, which is what stops a card looking
          like two cards stacked. `border-border/60` is that step in our token. */}
      <div className="border-t border-border/60 p-4 sm:p-6">
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}

/** Exported so the static build route renders these lists from the same source (`PD-158`). */
/** The dialling codes the phone field offers, exported for the same reason. */
export const DIAL_CODES = [
  { value: "sg", label: "+65" },
  { value: "us", label: "+1" },
  { value: "uk", label: "+44" },
];

export const COUNTRIES = [
  { value: "sg", label: "Singapore" },
  { value: "us", label: "United States" },
  { value: "uk", label: "United Kingdom" },
  { value: "au", label: "Australia" },
];

export function DefaultInputs() {
  const [select, setSelect] = React.useState("");
  const [date, setDate] = React.useState("");
  /*
   * Today, set on mount rather than as initial state (`PD-159`).
   *
   * This app is exported statically, so a value computed while rendering is baked at build time and
   * a demo opened a day later would hydrate against a different date. `date-range.tsx` set this
   * pattern for the same reason.
   */
  React.useEffect(() => setDate(todayISO()), []);
  const [time, setTime] = React.useState("11:30");

  return (
    <SectionCard title="Default Inputs">
      <FormField label="Input" htmlFor="fe-input">
        <Input id="fe-input" />
      </FormField>
      <FormField label="Input with Placeholder" htmlFor="fe-input-placeholder">
        <Input id="fe-input-placeholder" placeholder="info@gmail.com" />
      </FormField>
      <FormField label="Select Input" htmlFor="fe-select">
        <Select
          id="fe-select"
          value={select}
          onValueChange={setSelect}
          options={COUNTRIES}
          placeholder="Select an option"
          staticId="menu-fe-select"
        />
      </FormField>
      <FormField label="Password Input" htmlFor="fe-password">
        <PasswordInput id="fe-password" placeholder="Enter your password" />
      </FormField>
      <FormField label="Date Picker Input" htmlFor="fe-date">
        {/* Our own picker, not a native date input: see `date-field.tsx` for why. */}
        <DateField id="fe-date" value={date} onChange={setDate} />
      </FormField>
      <FormField label="Time Picker Input" htmlFor="fe-time">
        {/* Ours, not the platform's. The reasoning for the native control is answered in
            `time-field.tsx`: its panel cannot be themed, and it sat beside a date field that is
            entirely ours (`PD-160`). */}
        <TimeField id="fe-time" value={time} onChange={setTime} />
      </FormField>
    </SectionCard>
  );
}

export function SelectInputs() {
  const [single, setSingle] = React.useState("");
  const [many, setMany] = React.useState<string[]>(["sg"]);

  return (
    <SectionCard title="Select Inputs">
      <FormField label="Select Input" htmlFor="fe-select-2">
        <Select
          id="fe-select-2"
          value={single}
          onValueChange={setSingle}
          options={COUNTRIES}
          placeholder="Select Option"
          staticId="menu-fe-select-2"
        />
      </FormField>
      <FormField label="Multiple Select Options" hint="Pick as many as apply.">
        <MultiCombobox
          value={many}
          onValueChange={setMany}
          options={COUNTRIES}
          placeholder="Select options"
          staticId="menu-fe-multi"
        />
      </FormField>
    </SectionCard>
  );
}

export function TextAreaInput() {
  return (
    <SectionCard title="Textarea input field">
      <FormField label="Description" htmlFor="fe-textarea">
        <Textarea id="fe-textarea" rows={6} placeholder="Tell us about it" />
      </FormField>
      <FormField label="Description" htmlFor="fe-textarea-disabled" hint="This field is disabled.">
        <Textarea id="fe-textarea-disabled" rows={6} disabled placeholder="Disabled" />
      </FormField>
      <FormField label="Description" htmlFor="fe-textarea-error">
        <StatusField state="error" message="Please describe the issue before submitting.">
          <Textarea id="fe-textarea-error" rows={6} defaultValue="Too short" />
        </StatusField>
      </FormField>
    </SectionCard>
  );
}

/**
 * The three field states.
 *
 * **Theirs turns a border red or green and adds a hint; the hint is generic.** A field that says
 * "This is an invalid email address" is doing the job the colour cannot: a reader who cannot
 * distinguish the two borders, or who is scanning rather than looking, still learns what to fix.
 * `aria-invalid` is what carries it to a screen reader, and the border styling keys off the same
 * attribute rather than a second class.
 */
export function InputStates() {
  return (
    <SectionCard
      title="Input States"
      desc="State lives in the control. Hover the icon for the reason."
    >
      {/*
        **One component, two placements, and the words exist once either way** (`PD-081`).

        The default is the icon alone: text under a field pushes the rest of the form down the moment
        it appears, so a form jumps under the reader's hands exactly when they are fixing something,
        and a toast puts the explanation of one field somewhere else and then removes it on a timer.
        The message rides on the icon, and `StatusField` also puts it in the accessibility tree
        without hover, which is the half a tooltip alone gets wrong.

        `messageBelow` is the other placement, for the field a reader must not have to go looking
        for. It is the same `message`, printed under the control as well as carried on the icon, and
        `aria-describedby` then points at the visible paragraph rather than a hidden copy so nothing
        is announced twice. Both are shown here because the choice is per field, not per product.
      */}
      <FormField label="Email" htmlFor="fe-state-error">
        <StatusField state="error" message="This is an invalid email address.">
          <Input id="fe-state-error" defaultValue="demoemail" />
        </StatusField>
      </FormField>
      <FormField label="Email" htmlFor="fe-state-success">
        <StatusField state="success" message="This email address is available.">
          <Input id="fe-state-success" defaultValue="demoemail@gmail.com" />
        </StatusField>
      </FormField>
      <FormField label="Email" htmlFor="fe-state-disabled">
        <Input id="fe-state-disabled" disabled placeholder="Disabled email" />
      </FormField>

      <FormField label="Email" htmlFor="fe-state-error-below">
        <StatusField state="error" message="This is an error message." messageBelow>
          <Input id="fe-state-error-below" defaultValue="demoemail" />
        </StatusField>
      </FormField>
      <FormField label="Email" htmlFor="fe-state-success-below">
        <StatusField state="success" message="This is an success message." messageBelow>
          <Input id="fe-state-success-below" defaultValue="demoemail@gmail.com" />
        </StatusField>
      </FormField>
    </SectionCard>
  );
}

/** Inputs with something attached: an icon inside, and a country prefix beside. */
export function InputGroup() {
  const [dial, setDial] = React.useState("sg");

  return (
    <SectionCard title="Input Group">
      <FormField label="Email" htmlFor="fe-group-email">
        <div className="relative">
          <EnvelopeClosedIcon
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground"
          />
          {/* `pl-12` clears the icon. The icon is `pointer-events-none` so it cannot swallow a
              click meant for the field behind it. */}
          <Input id="fe-group-email" className="pl-12" placeholder="info@gmail.com" />
        </div>
      </FormField>
      <FormField label="Phone" htmlFor="fe-group-phone">
        {/*
          **Two controls with a gap, not one joined pill.** Joining them meant `rounded-r-none
          border-r-0` on the select against `rounded-l-none` on the input, and a focus ring is drawn
          outside the border box: focusing either one painted its ring straight over its neighbour's
          edge, so the pair looked broken at exactly the moment it was being used. Sharing an edge
          also means the two halves cannot both show a state.

          A real `Select` rather than a painted prefix, either way: the country is a value the form
          needs, and decoration cannot be dialled.
        */}
        <div className="flex gap-3">
          <Select
            value={dial}
            onValueChange={setDial}
            staticId="menu-fe-dial"
            options={DIAL_CODES}
            className="w-[104px] shrink-0"
            aria-label="Dialling code"
          />
          <Input id="fe-group-phone" placeholder="8000 0000" />
        </div>
      </FormField>
    </SectionCard>
  );
}

export function FileInput() {
  return (
    <SectionCard title="File Input">
      <FormField label="Upload file" htmlFor="fe-file">
        {/* `FILE_INPUT` is the library's: the button the browser draws is the only part of a file
            input a stylesheet reaches, and how it is drawn is a design-system decision rather than
            this page's. It was a literal here, which is the copy this repo's shared-class gate
            exists to stop. */}
        <Input id="fe-file" type="file" className={FILE_INPUT} />
      </FormField>
    </SectionCard>
  );
}

const CHECKBOX_ROWS = [
  { id: "cb-default", label: "Default", defaultChecked: false, disabled: false },
  { id: "cb-checked", label: "Checked", defaultChecked: true, disabled: false },
  { id: "cb-disabled", label: "Disabled", defaultChecked: false, disabled: true },
];

export function CheckboxSection() {
  return (
    <SectionCard title="Checkbox">
      <div className="flex flex-wrap items-center gap-8">
        {CHECKBOX_ROWS.map((row) => (
          <label
            key={row.id}
            className={cn(
              "flex items-center gap-3 text-sm font-medium",
              row.disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
            )}
          >
            <Checkbox id={row.id} defaultChecked={row.defaultChecked} disabled={row.disabled} />
            {row.label}
          </label>
        ))}
      </div>
    </SectionCard>
  );
}

export function RadioSection() {
  const [choice, setChoice] = React.useState("two");

  const OPTION = "flex items-center gap-3 text-sm font-medium";

  return (
    <SectionCard title="Radio Buttons">
      {/* **Two groups, not one with a disabled member.** The row exists to show three *states*, and
          the third is disabled-and-selected: a radio group only ever has one selection, so a
          disabled item inside the live group can never be the one that is on. Its own group, fixed
          on its own value, is what makes the state visible instead of just greying out an empty
          ring. */}
      <div className="flex flex-wrap items-center gap-8">
        <RadioGroup value={choice} onValueChange={setChoice} className="flex flex-wrap gap-8">
          {[
            { value: "one", label: "Default" },
            { value: "two", label: "Selected" },
          ].map((option) => (
            <label key={option.value} className={cn(OPTION, "cursor-pointer")}>
              <RadioGroupItem value={option.value} />
              {option.label}
            </label>
          ))}
        </RadioGroup>

        <RadioGroup value="locked" disabled>
          <label className={cn(OPTION, "cursor-not-allowed opacity-60")}>
            <RadioGroupItem value="locked" disabled />
            Disabled Selected
          </label>
        </RadioGroup>
      </div>
    </SectionCard>
  );
}

export function ToggleSection() {
  const [on, setOn] = React.useState(true);
  const [off, setOff] = React.useState(false);

  return (
    <SectionCard title="Toggle switch input">
      <div className="flex flex-wrap items-center gap-8">
        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <Switch checked={on} onCheckedChange={setOn} />
          Default
        </label>
        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <Switch checked={off} onCheckedChange={setOff} />
          Checked
        </label>
        <label className="flex cursor-not-allowed items-center gap-3 text-sm opacity-60">
          <Switch checked={false} disabled />
          Disabled
        </label>
      </div>
    </SectionCard>
  );
}

/**
 * The dropzone.
 *
 * **No `react-dropzone`, which is what theirs uses.** Drag and drop is four DOM events, and the
 * library's value is normalising things this does not need: no folder traversal, no per-file
 * validation, no paste handling. `UPLOAD_DROP` already exists in the token layer for the theme
 * settings' logo upload, so the design is decided and this is a consumer of it rather than a second
 * opinion about what a drop target looks like.
 *
 * `dragCounter` rather than a boolean: `dragleave` fires when the pointer crosses onto a **child**
 * element, so a boolean flickers off as the cursor moves over the icon inside the zone. Counting
 * enter and leave is what makes the highlight hold.
 */
export function Dropzone() {
  const [files, setFiles] = React.useState<string[]>([]);
  const [over, setOver] = React.useState(false);
  const dragCounter = React.useRef(0);

  const accept = (list: FileList | null) => {
    if (!list?.length) return;
    setFiles(Array.from(list).map((file) => file.name));
  };

  return (
    <SectionCard title="Dropzone">
      <label
        className={cn(UPLOAD_DROP, over && "border-primary bg-primary/5")}
        onDragEnter={(event) => {
          event.preventDefault();
          dragCounter.current += 1;
          setOver(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => {
          dragCounter.current -= 1;
          if (dragCounter.current <= 0) setOver(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          dragCounter.current = 0;
          setOver(false);
          accept(event.dataTransfer.files);
        }}
      >
        <span className={UPLOAD_DROP_BADGE}>
          <UploadIcon className="size-5 text-muted-foreground" aria-hidden="true" />
        </span>
        <span className="text-sm font-medium">
          {over ? "Drop the files here" : "Drag and drop files here"}
        </span>
        <span className={UPLOAD_DROP_HINT}>PNG, JPG or PDF, up to 10 MB each</span>
        {/* The input is the control, so the label is its trigger: keyboard reachable and announced
            as a file picker without a click handler faking either. */}
        <input
          type="file"
          multiple
          className="sr-only"
          onChange={(event) => accept(event.target.files)}
        />
      </label>
      {files.length > 0 ? (
        <ul className="space-y-1 text-sm text-muted-foreground">
          {files.map((name) => (
            <li key={name} className="truncate">
              {name}
            </li>
          ))}
        </ul>
      ) : null}
    </SectionCard>
  );
}
