import { PageHeader } from "../../page-shell";
import {
  AlertModals,
  CenteredModal,
  DefaultModal,
  FormModal,
  FullScreenModal,
} from "./modal-examples";

export const metadata = { title: "Modals" };

/**
 * Modals: the page the reference ships and never links to.
 *
 * `/modals` exists in their tree and appears nowhere in their sidebar, so five of their overlay
 * examples are unreachable unless a visitor types the address. Adding the nav entry is the whole
 * difference, and it costs one line in `nav.ts`.
 */
export default function ModalsPage() {
  return (
    <>
      <PageHeader title="Modals" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <DefaultModal />
        <CenteredModal />
        <FormModal />
        <FullScreenModal />
        <AlertModals />
      </div>
    </>
  );
}
