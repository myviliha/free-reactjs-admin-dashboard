import {
  CheckboxSection,
  DefaultInputs,
  Dropzone,
  FileInput,
  InputGroup,
  InputStates,
  RadioSection,
  SelectInputs,
  TextAreaInput,
  ToggleSection,
} from "../../form-sections";
import { PageHeader } from "../../page-shell";

export const metadata = { title: "Form Elements" };

/**
 * Form elements, on the reference's ten sections and its two-column grid.
 *
 * `grid-cols-1 gap-6 xl:grid-cols-2` with the sections split across two `space-y-6` columns, in
 * their order. Ours was a single 99-line column of five controls, which showed that the components
 * exist and nothing about how a form is put together.
 *
 * **The split is by height, not by kind**, which is why Select and Textarea sit above Input States
 * on the left while the right column carries six shorter cards. A two-column grid whose columns end
 * at wildly different heights looks broken, and theirs is balanced deliberately.
 *
 * Their breadcrumb reads "From Elements". Not copied.
 */
export default function FormElementsPage() {
  return (
    <>
      <PageHeader title="Form Elements" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <DefaultInputs />
          <SelectInputs />
          <TextAreaInput />
          <InputStates />
        </div>
        <div className="space-y-6">
          <InputGroup />
          <FileInput />
          <CheckboxSection />
          <RadioSection />
          <ToggleSection />
          <Dropzone />
        </div>
      </div>
    </>
  );
}
