"use client";

import {
  CAMPAIGNS,
  type Campaign,
  cn,
  DEALS,
  DEMO_TINTS,
  type Deal,
  DT_FRAME,
  DT_HEAD_ROW,
  DT_PAGER,
  DT_PAGER_GAP,
  DT_SELECT_HEAD,
  initialsOf,
  PRODUCTS,
  type Product,
  ROW_ACTION_TRIGGER,
  ROW_DELETE_BUTTON,
  TABLE_AIRY,
  TRADES,
  type Trade,
} from "@viliha/vui-core";
import { Avatar, AvatarFallback } from "@viliha/vui-react/avatar";
import { Badge } from "@viliha/vui-react/badge";
import { Button } from "@viliha/vui-react/button";
import { Checkbox } from "@viliha/vui-react/checkbox";
import { Dropdown, DropdownItem } from "@viliha/vui-react/dropdown-menu";
import {
  ArrowLeft,
  ArrowRight,
  MoreHorizontal,
  Search as SearchIcon,
  Sliders,
  Trash,
} from "@viliha/vui-react/icons";
import { Input } from "@viliha/vui-react/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@viliha/vui-react/table";
import * as React from "react";

/**
 * Basic Tables 2 to 5: the reference's four remaining free table layouts.
 *
 * **Three substitutions, all for the same reason, and none of them is a shortcut.** The reference
 * draws PayPal, Apple, Kickstarter, Facebook, Amazon, Slack, Instagram and Google Ads logos in its
 * rows, and country flags as image files. Those are other companies' trademarks and other people's
 * asset files, in a template a buyer redistributes: `SD-006` keeps their code out of this repository
 * and the same reasoning covers their images with more force, because a trademark travels with the
 * download. So a brand becomes a **monogram on a tinted circle**, a flag becomes an **emoji** (no
 * file, no licence, and it renders in every edition including the static HTML one), and the tints
 * come from the state tokens `PD-066` added rather than raw palette classes, so a retheme carries
 * them.
 *
 * **Everything that looks interactive is, and the two that cannot be say so.** Search filters, the
 * checkboxes select, the pager pages, the row menus open, Filter narrows by status and both Delete
 * controls really delete. `PD-070` is the rule: a control that does nothing teaches a reader that
 * our controls do nothing, and a demo is the worst place to spend that credit. **View More** and
 * **See all** are the exceptions, and they are `disabled` with a title rather than live-looking and
 * inert, because there is no record page in the free tier for them to open: that page is
 * `RecordView`, which is Pro. A control that admits it is unavailable costs a reader one hover; one
 * that silently swallows a click costs them their trust in every other control here.
 */

/* ── The inner card ───────────────────────────────────────────────────────────
 *
 * Tables 2 to 5 all share one shape: a clipped, bordered frame whose first row is a header holding
 * a title and some actions, with the table under it. `DT_FRAME` is that frame, the same one the Pro
 * table uses, so the free tables and the paid one sit in the same box. */
function TableCard({
  title,
  actions,
  footer,
  children,
}: {
  title: string;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className={cn(DT_FRAME, "overflow-hidden")}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <h4 className="text-lg font-semibold text-foreground">{title}</h4>
        {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
      </div>
      {/* The table scrolls sideways on its own, inside the frame, so the header above it stays put
          instead of sliding out of view with the columns. */}
      <div className="relative overflow-x-auto border-t border-border/60">{children}</div>
      {footer ? <div className="border-t border-border/60 px-5 py-4">{footer}</div> : null}
    </div>
  );
}

/** A search box with the icon inside it, which is how the reference draws all three of them. */
function SearchBox({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (next: string) => void;
  label: string;
}) {
  return (
    <div className="relative w-full sm:w-64">
      <SearchIcon
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="search"
        aria-label={label}
        placeholder="Search..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="pl-10"
      />
    </div>
  );
}

/**
 * The monogram tints.
 *
 * Five, from the state tokens plus the brand, chosen **by index** rather than by hashing the name.
 * A hash would look cleverer and read worse: the point of the colour is that two adjacent rows
 * differ, and a hash happily gives two neighbours the same one.
 */

/** A tinted monogram, standing in for a photograph or a brand mark. */
function Monogram({ name, index, size }: { name: string; index: number; size: string }) {
  return (
    <Avatar className={cn(size, "shrink-0")}>
      <AvatarFallback className={cn(DEMO_TINTS[index % DEMO_TINTS.length], "text-xs font-medium")}>
        {initialsOf(name, 2)}
      </AvatarFallback>
    </Avatar>
  );
}

const TONE = {
  Complete: "success",
  Success: "success",
  Pending: "warning",
  Failed: "destructive",
  Cancel: "destructive",
} as const;

function StatusBadge({ status }: { status: keyof typeof TONE }) {
  return <Badge variant={TONE[status]}>{status}</Badge>;
}

/* ── Basic Table 2: Recent Orders ─────────────────────────────────────────── */

const DEAL_FILTERS = ["All", "Complete", "Pending"] as const;

export function RecentDealsTable() {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<(typeof DEAL_FILTERS)[number]>("All");
  const [picked, setPicked] = React.useState<readonly string[]>([]);
  // Deleting is local, which is the only place it can be: the free tier has no server behind it.
  const [deals, setDeals] = React.useState<readonly Deal[]>(DEALS);

  const rows = deals.filter(
    (deal) =>
      (status === "All" || deal.status === status) &&
      `${deal.id} ${deal.customer} ${deal.email} ${deal.product}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );

  const toggle = (id: string) =>
    setPicked((current) =>
      current.includes(id) ? current.filter((one) => one !== id) : [...current, id],
    );

  const remove = (id: string) => {
    setDeals((current) => current.filter((deal) => deal.id !== id));
    setPicked((current) => current.filter((one) => one !== id));
  };

  /**
   * Select-all is a **union and difference against the visible rows**, never a replacement.
   *
   * Replacing was the first version and it was wrong in both directions: with a search active,
   * ticking the box dropped every selection the query had hidden, and unticking dropped them too,
   * with nothing on screen to say anything had been lost. Selecting rows a reader cannot see is the
   * failure people think of; quietly deselecting the ones they already chose is the same bug and it
   * loses their work instead of merely surprising them.
   */
  const setShown = (on: boolean) =>
    setPicked((current) => {
      const shownIds = rows.map((deal) => deal.id);
      return on
        ? [...new Set([...current, ...shownIds])]
        : current.filter((id) => !shownIds.includes(id));
    });

  const allShown = rows.length > 0 && rows.every((deal) => picked.includes(deal.id));

  return (
    <TableCard
      title="Recent Orders"
      actions={
        <>
          <SearchBox value={query} onChange={setQuery} label="Search orders" />
          <OrdersFilterMenu status={status} onSelect={setStatus} />
        </>
      }
    >
      <Table className={cn(TABLE_AIRY, "min-w-[56rem]")}>
        <TableHeader className={DT_HEAD_ROW}>
          <TableRow>
            <TableHead className={DT_SELECT_HEAD}>
              <Checkbox
                checked={allShown}
                onChange={(event) => setShown(event.target.checked)}
                aria-label="Select every order shown"
              />
            </TableHead>
            <TableHead>Deal ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Product/Service</TableHead>
            <TableHead>Deal Value</TableHead>
            <TableHead>Close Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((deal, index) => (
            <TableRow key={deal.id} data-state={picked.includes(deal.id) ? "selected" : undefined}>
              <TableCell>
                <Checkbox
                  checked={picked.includes(deal.id)}
                  onChange={() => toggle(deal.id)}
                  aria-label={`Select ${deal.id}`}
                />
              </TableCell>
              <TableCell className="font-medium text-foreground">{deal.id}</TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Monogram name={deal.customer} index={index} size="size-10" />
                  <div className="min-w-0">
                    <span className="block truncate font-medium text-foreground">
                      {deal.customer}
                    </span>
                    <span className="block truncate text-xs">{deal.email}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>{deal.product}</TableCell>
              <TableCell className="tabular-nums">{deal.value}</TableCell>
              <TableCell className="tabular-nums">{deal.closeDate}</TableCell>
              <TableCell>
                <StatusBadge status={deal.status} />
              </TableCell>
              <TableCell>
                <button
                  type="button"
                  onClick={() => remove(deal.id)}
                  aria-label={`Delete ${deal.id}`}
                  className={ROW_DELETE_BUTTON}
                >
                  <Trash className="size-4" aria-hidden="true" />
                </button>
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-10 text-center">
                {deals.length === 0
                  ? "Every order has been deleted. Reload the page to get them back."
                  : `No order matches this filter.`}
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </TableCard>
  );
}

/* ── Basic Table 3: Latest Transactions ───────────────────────────────────── */

/** The reference shows ten pages of five rows; the fixtures are one page, so the rest are empty. */
const PAGES: readonly (number | "gap")[] = [1, 2, 3, "gap", 8, 9, 10];

/** The numbered pages, in order, with the gap taken out. Prev and Next walk **this**, not `page±1`. */
const PAGE_NUMBERS: readonly number[] = PAGES.filter((entry): entry is number => entry !== "gap");

export function LatestTransactionsTable() {
  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [trades, setTrades] = React.useState<readonly Trade[]>(TRADES);

  const rows = trades.filter((trade) =>
    `${trade.name} ${trade.category}`.toLowerCase().includes(query.trim().toLowerCase()),
  );
  // Page one holds the fixtures; the rest are genuinely empty, and the table says so rather than
  // repeating the same five rows under ten different numbers.
  const shown = page === 1 ? rows : [];

  /**
   * **Prev and Next step through the numbers the pager draws**, so `3` then Next is `8`.
   *
   * Adding one was the first version, and it walked to page 4: a number this pager elides, so no
   * button carried `aria-current`, every one of them rendered unselected, and it took four more
   * clicks to get back to a page the reader could see they were on. A pager that can reach a state
   * it cannot display is not paginating, it is counting.
   */
  const step = (by: 1 | -1) => {
    const at = PAGE_NUMBERS.indexOf(page);
    const next = PAGE_NUMBERS[at + by];
    if (next !== undefined) setPage(next);
  };

  // Searching from page 7 and being told the page is empty, while the match sits on page 1, is the
  // filter and the pager disagreeing about what the reader asked for.
  const search = (next: string) => {
    setQuery(next);
    setPage(1);
  };

  return (
    <TableCard
      title="Latest Transactions"
      actions={<SearchBox value={query} onChange={search} label="Search transactions" />}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="outline" disabled={page === PAGE_NUMBERS[0]} onClick={() => step(-1)}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            Previous
          </Button>
          <nav className={DT_PAGER} aria-label="Transaction pages">
            {PAGES.map((entry, index) =>
              entry === "gap" ? (
                // eslint-disable-next-line react/no-array-index-key -- the gap has no identity
                <span key={`gap-${index}`} className={DT_PAGER_GAP} aria-hidden="true">
                  …
                </span>
              ) : (
                <button
                  key={entry}
                  type="button"
                  onClick={() => setPage(entry)}
                  aria-current={page === entry ? "page" : undefined}
                  className={cn(
                    "size-9 rounded-lg text-sm transition-colors",
                    page === entry
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {entry}
                </button>
              ),
            )}
          </nav>
          <Button
            variant="outline"
            disabled={page === PAGE_NUMBERS[PAGE_NUMBERS.length - 1]}
            onClick={() => step(1)}
          >
            Next
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      }
    >
      <Table className={cn(TABLE_AIRY, "min-w-[52rem]")}>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shown.map((trade, index) => (
            <TableRow key={trade.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  {/* "Bought VLHA" → the ticker. A one-word name has no second part, so fall back to
                      the whole thing rather than indexing off the end of the array. */}
                  <Monogram
                    name={trade.name.split(" ")[1] ?? trade.name}
                    index={index}
                    size="size-8"
                  />
                  <span className="font-medium text-foreground">{trade.name}</span>
                </div>
              </TableCell>
              <TableCell>{trade.date}</TableCell>
              <TableCell className="tabular-nums">{trade.price}</TableCell>
              <TableCell>{trade.category}</TableCell>
              <TableCell>
                <StatusBadge status={trade.status} />
              </TableCell>
              <TableCell>
                <RowActionsMenu
                  name={trade.name}
                  onDelete={() =>
                    setTrades((current) => current.filter((one) => one.id !== trade.id))
                  }
                />
              </TableCell>
            </TableRow>
          ))}
          {shown.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center">
                {page === 1
                  ? trades.length === 0
                    ? "Every transaction has been deleted. Reload the page to get them back."
                    : `No transaction matches “${query}”.`
                  : `Page ${page} is empty.`}
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </TableCard>
  );
}

/* ── Basic Table 4: Featured Campaigns ────────────────────────────────────── */

export function FeaturedCampaignsTable() {
  return (
    <TableCard title="Featured Campaigns" actions={<CampaignMenu />}>
      <Table className={cn(TABLE_AIRY, "min-w-[44rem]")}>
        <TableHeader>
          <TableRow>
            <TableHead>Creator</TableHead>
            <TableHead>Campaign</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {CAMPAIGNS.map((campaign, index) => (
            <TableRow key={campaign.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Monogram name={campaign.creator} index={index} size="size-10" />
                  <span className="font-medium text-foreground">{campaign.creator}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Monogram name={campaign.channel} index={index + 2} size="size-8" />
                  <div className="min-w-0">
                    <span className="block truncate font-medium text-foreground">
                      {campaign.headline}
                    </span>
                    <span className="block truncate text-xs">Ads campaign</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={campaign.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableCard>
  );
}

/* ── Basic Table 5: Top products ──────────────────────────────────────────── */

export function TopProductsTable() {
  // Their card is headed "Recent Orders", which is also Basic Table 2's heading, and these are
  // products rather than orders. Two cards under one name on one page, one of them listing the
  // wrong noun, is worth one word of divergence from the reference.
  const [topOnly, setTopOnly] = React.useState(false);
  const rows = topOnly
    ? PRODUCTS.filter((p) => Number(p.value.replace(/[^0-9]/g, "")) >= 7000)
    : PRODUCTS;

  return (
    <TableCard
      title="Top Products"
      actions={
        <>
          <Button variant="outline" onClick={() => setTopOnly((on) => !on)}>
            <Sliders className="size-4" aria-hidden="true" />
            {topOnly ? "All values" : "Filter"}
          </Button>
          <Button variant="outline" disabled title="The full list is a Pro record page">
            See all
          </Button>
        </>
      }
    >
      <Table className={cn(TABLE_AIRY, "min-w-[44rem]")}>
        <TableHeader>
          <TableRow>
            <TableHead>Products</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>CR</TableHead>
            <TableHead>Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium text-foreground">{product.name}</TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell>
                {/* An emoji flag rather than an image: no file to licence, nothing to load, and it
                    renders in the static HTML edition too. The country is spelled out for a screen
                    reader, which an emoji alone reads out inconsistently. */}
                <span className="text-lg leading-none" aria-hidden="true">
                  {product.flag}
                </span>
                <span className="sr-only">{product.country}</span>
              </TableCell>
              <TableCell>{product.cr}</TableCell>
              <TableCell className="font-medium tabular-nums text-success">
                {product.value}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableCard>
  );
}

/**
 * The three menus this file used to render inline, each now a component.
 *
 * **Extracted so the static edition can render the panel from one source.** A `Dropdown` panel cannot
 * be server-rendered, so the build route at `app/overlay-source/page.tsx` renders these once with
 * `StaticOverlays` on and the emitter places the markup beside every matching trigger (`PD-158`).
 * Written a second time in that route, they would be two menus that happen to agree today.
 *
 * The row menu is deliberately not per-row: every row's is the same two items, so it is rendered
 * once and the emitter numbers the copies it places.
 */
export function OrdersFilterMenu({
  // Both optional, because the build route renders this for its panel markup alone and has no state
  // to hand it. On the page they are always passed.
  status = "All",
  onSelect = () => undefined,
}: {
  status?: (typeof DEAL_FILTERS)[number];
  onSelect?: (value: (typeof DEAL_FILTERS)[number]) => void;
} = {}) {
  return (
    <Dropdown
      label={`Filter by status, currently ${status}`}
      align="end"
      staticId="menu-orders-filter"
      trigger={
        <>
          <Sliders className="size-4" aria-hidden="true" />
          {status === "All" ? "Filter" : status}
        </>
      }
    >
      {DEAL_FILTERS.map((option) => (
        <DropdownItem key={option} checked={status === option} onSelect={() => onSelect(option)}>
          {option}
        </DropdownItem>
      ))}
    </Dropdown>
  );
}

export function RowActionsMenu({ name, onDelete }: { name?: string; onDelete?: () => void }) {
  return (
    <Dropdown
      label={`Actions for ${name}`}
      align="end"
      // One shape, one panel: every row's menu is the same two items, and the emitter
      // numbers the copies it places (`PD-158`).
      staticId="menu-row-actions"
      bare
      triggerClassName={ROW_ACTION_TRIGGER}
      trigger={
        <>
          <MoreHorizontal className="size-4" aria-hidden="true" />
        </>
      }
    >
      <DropdownItem disabled title="The record page is RecordView, which is Pro">
        View More
      </DropdownItem>
      <DropdownItem onSelect={onDelete}>Delete</DropdownItem>
    </Dropdown>
  );
}

export function CampaignMenu() {
  return (
    <Dropdown
      label="Campaign options"
      align="end"
      staticId="menu-campaign-options"
      bare
      triggerClassName={ROW_ACTION_TRIGGER}
      trigger={
        <>
          {/* Their control is a vertical ellipsis and the slot ships the horizontal one.
                  `rotate-90` is one class against a second icon binding that every future icon set
                  would have to answer for, which `check:icons` would rightly ask about. */}
          <MoreHorizontal className="size-4 rotate-90" aria-hidden="true" />
        </>
      }
    >
      <DropdownItem disabled title="The record page is RecordView, which is Pro">
        View More
      </DropdownItem>
      <DropdownItem
        disabled
        title="Deleting a campaign needs a server, which the free tier has no part of"
      >
        Delete
      </DropdownItem>
    </Dropdown>
  );
}
