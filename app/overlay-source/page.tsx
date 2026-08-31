"use client";

// The panels come from a client module, so calling its id helper from a server component fails the
// export with "Attempted to call alertModalId() from the server". This page renders nothing
// interactive; the directive is only what puts it on the same side of the boundary as its imports.
import { StaticOverlays } from "@viliha/vui-react/dropdown-menu";
import { MultiCombobox } from "@viliha/vui-react/multi-combobox";
import { Select } from "@viliha/vui-react/select";
import { CampaignMenu, OrdersFilterMenu, RowActionsMenu } from "../(shell)/basic-tables/tables";
import {
  AlertModals,
  alertModalId,
  CenteredModal,
  DefaultModal,
  FormModal,
  FullScreenModal,
  MODAL_IDS,
} from "../(shell)/modals/modal-examples";
import { AccountMenu } from "../account-menu";
import { CardMenu, cardMenuId } from "../dashboard/charts";
import { DateRangePicker } from "../dashboard/date-range";
import { DateField } from "../date-field";
import { COUNTRIES, DIAL_CODES } from "../form-sections";
import { Notifications } from "../notifications";
import { TimeField } from "../time-field";

/**
 * The panel source for the HTML edition. **A build artefact, not a screen.**
 *
 * ## Why this page exists
 *
 * A closed `Dialog` renders `null`, so the static export of `/modals` contained four trigger buttons
 * and no panels at all. Across the whole demo that was 114 controls announcing a popup with nothing
 * behind it (`PD-158`). The emitter post-processes Next's export, so it can only move markup that is
 * already in it: the panels have to be rendered somewhere before they can be placed.
 *
 * This renders the same components once more with the modal already open. `scripts/page-templates.mjs`
 * lifts each `[role="dialog"]` out of the wrapper it finds here and writes it into the page whose
 * trigger names it.
 *
 * ## Why not the two mechanisms that came before
 *
 * `<template>` was built twice and reverted twice, the last time because **React cannot hydrate a page
 * containing a populated `<template>`**: the browser moves its children into a fragment, so the client
 * finds an empty element where the server wrote a full one (`PD-151`, `PD-153`). Nothing here is a
 * template, and the reference app's own pages are untouched.
 *
 * Rendering the panels with a second `react-dom/server` pass, as the component gallery does, also
 * works and costs a bundler step and a second renderer. Next already renders this app; asking it for
 * one more page is the smaller of the two.
 *
 * ## What keeps it honest
 *
 * Nothing links here and it is deliberately absent from the sidebar, which is why `routes.test.ts`
 * exempts it by name. It is **not** `_overlays`: an underscore makes a folder private in the App
 * Router, so Next never built it and the emitter failed with "no panel was rendered", which is the
 * guard below doing its job on the first run. That exemption is safe in the one way that matters: the emitter **fails the
 * build** when a trigger names a panel this page does not produce, so it cannot quietly stop working
 * the way a dead branch behind a waiver would.
 */
export default function OverlaySource() {
  return (
    <div hidden>
      <div data-vui-overlay={MODAL_IDS.default}>
        <DefaultModal initialOpen />
      </div>
      <div data-vui-overlay={MODAL_IDS.centered}>
        <CenteredModal initialOpen />
      </div>
      <div data-vui-overlay={MODAL_IDS.form}>
        <FormModal initialOpen />
      </div>
      <div data-vui-overlay={MODAL_IDS.fullscreen}>
        <FullScreenModal initialOpen />
      </div>
      {/* One panel per tone: a page with no JavaScript cannot swap a single panel's contents. */}
      {["success", "info", "warning", "error"].map((key) => (
        <div key={key} data-vui-overlay={alertModalId(key)}>
          <AlertModals initialKey={key} />
        </div>
      ))}

      {/*
        The menus, which need more than an `open` prop.

        A `Dropdown` panel is gated on `open`, on a `pos` from a layout effect, and on
        `typeof document !== "undefined"`, and then it is a `createPortal`. Every one of those is
        false during a static export, so no amount of forcing `open` produces markup. `StaticOverlays`
        switches the component to an in-flow panel that needs no measurement, which is also what makes
        the emitted menu anchor to its trigger with CSS alone (`PD-158`).
      */}
      <StaticOverlays value={true}>
        <div data-vui-overlay="menu-notifications">
          <Notifications />
        </div>
        <div data-vui-overlay="menu-account">
          <AccountMenu />
        </div>
        {/* The date picker's id is derived from the field's, so a page with two pickers gets two
            panels. These are the two the free demo actually renders. */}
        <div data-vui-overlay="menu-fe-date">
          <DateField id="fe-date" value="" onChange={() => undefined} />
        </div>
        <div data-vui-overlay="menu-event-start">
          <DateField id="event-start" value="" onChange={() => undefined} />
        </div>
        <div data-vui-overlay="menu-event-end">
          <DateField id="event-end" value="" onChange={() => undefined} />
        </div>

        {/* The dashboard's five. The three card menus differ only by the title in their label, and
            the panel inside each is the same two items from one source. */}
        {["Monthly Sales", "Monthly Target", "Statistics", "Demographic"].map((title) => (
          <div key={title} data-vui-overlay={cardMenuId(title)}>
            <CardMenu title={title} />
          </div>
        ))}
        <div data-vui-overlay="menu-date-range">
          <DateRangePicker />
        </div>

        {/* The tables' three. The row menu is rendered once and copied per row by the emitter. */}
        <div data-vui-overlay="menu-orders-filter">
          <OrdersFilterMenu />
        </div>
        <div data-vui-overlay="menu-row-actions">
          <RowActionsMenu />
        </div>
        <div data-vui-overlay="menu-campaign-options">
          <CampaignMenu />
        </div>

        {/* The form's three selects. Their options come from the page's own source, so a list added
            there appears here without anyone remembering to. */}
        <div data-vui-overlay="menu-fe-select">
          <Select value="" onValueChange={() => undefined} options={COUNTRIES} />
        </div>
        <div data-vui-overlay="menu-fe-select-2">
          <Select value="" onValueChange={() => undefined} options={COUNTRIES} />
        </div>
        <div data-vui-overlay="menu-fe-dial">
          <Select value="" onValueChange={() => undefined} options={DIAL_CODES} />
        </div>
        <div data-vui-overlay="menu-fe-time">
          <TimeField id="fe-time" value="" onChange={() => undefined} />
        </div>
        <div data-vui-overlay="menu-fe-multi">
          <MultiCombobox value={[]} onValueChange={() => undefined} options={COUNTRIES} />
        </div>
      </StaticOverlays>
    </div>
  );
}
