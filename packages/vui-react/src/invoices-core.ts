/**
 * The invoice fixture the basic datatable draws, in both editions.
 *
 * Generated rather than written out: 47 rows is enough to page and sort meaningfully, and a
 * generator says what the shape is more clearly than 47 literals would. **Deterministic on
 * purpose** (no `Math.random`, no `Date.now`), so the two editions and any screenshot of either
 * show the same table.
 *
 * It lives here rather than in the React page because that page was the only definition, so a Vue
 * port had to retype it and the two demos would have drifted the first time either changed.
 */
export interface Invoice {
  id: string;
  customer: string;
  status: "paid" | "pending" | "overdue";
  issued: Date;
  amount: number;
}

const CUSTOMERS = [
  "Northwind Traders",
  "Contoso",
  "Fabrikam",
  "Adventure Works",
  "Tailspin Toys",
  "Wide World Importers",
  "Proseware",
];

const STATUSES = ["paid", "pending", "overdue"] as const;

export const INVOICES: Invoice[] = Array.from({ length: 47 }, (_, i) => ({
  id: `INV-${String(1041 + i)}`,
  customer: CUSTOMERS[i % CUSTOMERS.length] as string,
  status: STATUSES[i % STATUSES.length] as Invoice["status"],
  issued: new Date(2026, i % 12, ((i * 7) % 27) + 1),
  amount: 250 + ((i * 137) % 8400),
}));

/** Which badge a status wears. Shared so a paid invoice is never green here and grey there. */
export const INVOICE_TONE: Record<Invoice["status"], "default" | "secondary" | "destructive"> = {
  paid: "default",
  pending: "secondary",
  overdue: "destructive",
};

/** The two formatters both editions use, so a date and an amount read identically. */
export const invoiceMoney = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
export const invoiceDay = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });
