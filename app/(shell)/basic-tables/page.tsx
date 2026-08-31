import { DT_FRAME, TABLE_AIRY } from "@viliha/vui-core";
import { Avatar, AvatarFallback } from "@viliha/vui-react/avatar";
import { Badge } from "@viliha/vui-react/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@viliha/vui-react/table";

import { Demo, PageHeader } from "../../page-shell";
import {
  FeaturedCampaignsTable,
  LatestTransactionsTable,
  RecentDealsTable,
  TopProductsTable,
} from "./tables";

export const metadata = { title: "Basic Tables" };

interface Row {
  id: number;
  name: string;
  role: string;
  project: string;
  team: readonly string[];
  status: "Active" | "Pending" | "Cancel";
  budget: string;
}

const ROWS: readonly Row[] = [
  {
    id: 1,
    name: "Lindsey Curtis",
    role: "Web Designer",
    project: "Agency Website",
    team: ["Priya Raman", "Tomas Neal", "Ada Okafor"],
    status: "Active",
    budget: "3.9K",
  },
  {
    id: 2,
    name: "Kaiya George",
    role: "Project Manager",
    project: "Technology",
    team: ["Sofia Ruiz", "Ben Halvorsen"],
    status: "Pending",
    budget: "24.9K",
  },
  {
    id: 3,
    name: "Zain Geidt",
    role: "Content Writing",
    project: "Blog Writing",
    team: ["Marta Silva"],
    status: "Active",
    budget: "12.7K",
  },
  {
    id: 4,
    name: "Abram Schleifer",
    role: "Digital Marketer",
    project: "Social Media",
    team: ["Yuki Tanaka", "Omar Farouk", "Elise Braun"],
    status: "Cancel",
    budget: "2.8K",
  },
  {
    id: 5,
    name: "Carla George",
    role: "Front-end Developer",
    project: "Website",
    team: ["Nils Berg", "Ines Duarte", "Kwame Mensah"],
    status: "Active",
    budget: "4.5K",
  },
];

/**
 * Their status colours read off the badge: success, warning, error. Ours are the tokens `PD-066`
 * added, so a buyer who rethemes the product gets all three, which is the one thing a raw
 * `text-emerald-500` could never give them.
 */
const TONE = { Active: "success", Pending: "warning", Cancel: "destructive" } as const;

/**
 * First letters of the first `n` words, which is what an avatar without a photo has to work with.
 *
 * **The team column takes one letter, not two, and that is a measurement rather than a preference.**
 * The stack overlaps by 8px of a 24px circle, so the right third of each face is covered by the next
 * one. A photograph does not mind; two centred characters lose their second. One letter sits on the
 * circle's centre, which is the part nothing covers.
 */
const initials = (name: string, n = 2) =>
  name
    .split(" ")
    .slice(0, n)
    .map((part) => part[0])
    .join("");

/**
 * Basic Tables: the free tier's table, and the reference's free table.
 *
 * **This is the whole of it, deliberately.** Sorting, filtering, pagination, column visibility and
 * bulk actions are `RecordView`, which is Pro (`PD-055`), and the reference draws the same line: its
 * free template ships this table and its advanced one is paid. A free demo that quietly included the
 * paid table would be the more generous page and the dishonest one.
 *
 * **Five columns on the content table rather than the back-office grid.** `TABLE_AIRY` is that
 * decision, in the library: `TABLE_*` alone is `py-1.5` with a vertical rule on every cell, which is
 * right for fitting rows on an operator's screen and wrong for a page someone reads. The frame is
 * `DT_FRAME`, the same clipped, horizontally scrolling frame the paid table uses, so the free table
 * and the paid one sit in the same box.
 *
 * **Initials, not stock photographs.** Their rows carry `/images/user/user-17.jpg`; ours carry
 * `AvatarFallback`. That keeps their assets out of this repository (`SD-006` is about their code and
 * the same reasoning covers their images), it demonstrates a component of ours instead of an
 * `<img>`, and it survives a retheme, which a photograph does not.
 */
export default function BasicTablesPage() {
  return (
    <>
      <PageHeader title="Basic Tables" />
      <Demo title="Basic Table 1" className="p-4 sm:p-6">
        <div className={DT_FRAME}>
          {/* `min-w`: five columns need more room than a phone has, and the frame scrolls rather
              than letting the cells crush. Theirs is a 1102px inner div; this is the same idea on
              the element that actually has the columns. */}
          <Table className={`${TABLE_AIRY} min-w-[46rem]`}>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Project Name</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Budget</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ROWS.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10 shrink-0">
                        <AvatarFallback className="text-xs">{initials(row.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <span className="block truncate font-medium text-foreground">
                          {row.name}
                        </span>
                        <span className="block truncate text-xs">{row.role}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{row.project}</TableCell>
                  <TableCell>
                    {/* Overlapped, each ringed in the card's own colour so the stack reads as
                        separate faces rather than one blob. `ring` and not `border`: a border would
                        shrink the circle inside the same 24px and the row would jitter by a pixel
                        between one member and three. */}
                    <div className="flex -space-x-2">
                      {row.team.map((member) => (
                        <Avatar key={member} className="size-6 ring-2 ring-card" title={member}>
                          <AvatarFallback className="text-[11px]">
                            {initials(member, 1)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={TONE[row.status]}>{row.status}</Badge>
                  </TableCell>
                  <TableCell>{row.budget}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Demo>
      <Demo title="Basic Table 2" className="p-4 sm:p-6">
        <RecentDealsTable />
      </Demo>
      <Demo title="Basic Table 3" className="p-4 sm:p-6">
        <LatestTransactionsTable />
      </Demo>
      <Demo title="Basic Table 4" className="p-4 sm:p-6">
        <FeaturedCampaignsTable />
      </Demo>
      <Demo title="Basic Table 5" className="p-4 sm:p-6">
        <TopProductsTable />
      </Demo>
    </>
  );
}
