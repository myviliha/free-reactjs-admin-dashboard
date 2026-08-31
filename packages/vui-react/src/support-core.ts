/**
 * The support desk: its tickets, its vocabulary and its two filters (`PD-037`).
 *
 * A ticket queue is fixtures plus a handful of rules, and both are what diverge when two editions
 * are typed out separately: whether "urgent" is red or orange, whether the search looks at the
 * reference as well as the subject, what "pending" means after a reply. None of that is layout.
 *
 * **The badge and dot classes are raw palette classes, deliberately and not happily.** `theme.css`
 * has one state colour, `destructive`, so success, warning and informational states have no token to
 * read: that gap is written up in `odin/AGENTS.md` § Known thin spots. Sharing the strings at least
 * means both editions are wrong in the same way, which is the difference between one bug and two.
 */
export type TicketStatus = "open" | "pending" | "resolved";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

export interface TicketComment {
  id: number;
  author: string;
  role: "agent" | "customer";
  text: string;
  time: string;
}

export interface Ticket {
  id: number;
  ref: string;
  subject: string;
  requester: string;
  assignee: string;
  status: TicketStatus;
  priority: TicketPriority;
  updated: string;
  description: string;
  comments: TicketComment[];
}

export const TICKET_STATUS_BADGE: Record<TicketStatus, string> = {
  open: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  resolved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
};

export const TICKET_PRIORITY_DOT: Record<TicketPriority, string> = {
  low: "bg-slate-400",
  medium: "bg-sky-500",
  high: "bg-orange-500",
  urgent: "bg-red-500",
};

export const TICKET_STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "pending", label: "Pending" },
  { value: "resolved", label: "Resolved" },
] as const;

export const TICKET_PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
] as const;

/** The ticket both editions open on, so a screenshot of one is a screenshot of the other. */
export const FIRST_TICKET: Ticket = {
  id: 1,
  ref: "TCK-1042",
  subject: "Invoice not received for June",
  requester: "Ava Chen",
  assignee: "You",
  status: "open",
  priority: "high",
  updated: "10 min ago",
  description:
    "Hi, I haven't received my June invoice yet. My billing email is ava@acme.co. Can you resend it and confirm the amount?",
  comments: [
    {
      id: 1,
      author: "You",
      role: "agent",
      text: "Hi Ava — checking now, I'll resend within the hour.",
      time: "9:20 AM",
    },
  ],
};

export const TICKETS: readonly Ticket[] = [
  FIRST_TICKET,
  {
    id: 2,
    ref: "TCK-1041",
    subject: "Cannot reset my password",
    requester: "Marcus Reed",
    assignee: "Unassigned",
    status: "pending",
    priority: "urgent",
    updated: "1 hr ago",
    description:
      "The reset link says expired every time I click it, even immediately after requesting a new one.",
    comments: [],
  },
  {
    id: 3,
    ref: "TCK-1038",
    subject: "Feature request: CSV export",
    requester: "Priya Nair",
    assignee: "You",
    status: "resolved",
    priority: "low",
    updated: "Yesterday",
    description: "Would love a CSV export on the reports page for offline analysis.",
    comments: [
      { id: 1, author: "You", role: "agent", text: "Shipped in 1.1.7 🎉", time: "Yesterday" },
    ],
  },
];

/**
 * Subject, reference or requester, and a status that is `all` or one of the three.
 *
 * Shared because it is the rule a reader tests by typing: an edition that searched the subject only
 * would look identical and behave differently.
 */
export function filterTickets(
  rows: readonly Ticket[],
  query: string,
  status: string,
): readonly Ticket[] {
  const q = query.trim().toLowerCase();
  return rows.filter(
    (t) =>
      (status === "all" || t.status === status) &&
      (t.subject.toLowerCase().includes(q) ||
        t.ref.toLowerCase().includes(q) ||
        t.requester.toLowerCase().includes(q)),
  );
}

/** A reply must say something. Five characters is React's rule, verbatim. */
export const replyRule = (value: string) =>
  value.trim().length < 5 ? "A reply must be at least 5 characters." : undefined;

/** What a reply does to the ticket: it becomes pending, and it was updated just now. */
export const REPLY_EFFECT = { status: "pending", updated: "just now" } as const;

export const SUPPORT_COPY = {
  title: "Support",
  searchPlaceholder: "Search tickets…",
  allStatuses: "All statuses",
  empty: "No tickets found.",
  opened: "Opened this ticket",
  replyLabel: "Your reply",
  replyPlaceholder: "Write a reply…",
  send: "Send reply",
  props: {
    status: "Status",
    priority: "Priority",
    requester: "Requester",
    assignee: "Assignee",
    updated: "Last updated",
  },
} as const;
