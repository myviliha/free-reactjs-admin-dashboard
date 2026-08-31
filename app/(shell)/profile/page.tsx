import { DEMO_ADDRESS_FIELDS } from "@viliha/vui-core";

import { PageHeader } from "../../page-shell";
import { DangerZoneCard, FieldCard, ProfileCard, SecurityCard } from "../../profile-cards";

export const metadata = { title: "User Profile" };

/**
 * The profile, on the design in the dev's screenshots.
 *
 * That is a **newer page than `reference/nextjs` carries**: the checkout has three cards (identity,
 * personal information, address) and the current design folds the personal fields into the identity
 * card and adds Security and Danger Zone. Where the two disagree the screenshots win, because they
 * are what the product looks like now.
 *
 * Folding the fields in is the better call anyway. A name and the fields that spell that name out
 * are one subject, and splitting them put an Edit button on each half of the same thing.
 *
 * The outer card titled "My Profile" is theirs, and cards inside a card sounds like one too many
 * until you see it: the frame is what makes four sections read as one profile rather than four
 * unrelated panels stacked on a page.
 */
export default function ProfilePage() {
  return (
    <>
      <PageHeader title="User Profile" />
      <div className="rounded-2xl border border-border bg-card p-5 lg:p-6">
        <h3 className="mb-5 text-lg font-semibold lg:mb-7">My Profile</h3>
        <div className="space-y-6">
          <ProfileCard />
          <FieldCard title="Address" fields={[...DEMO_ADDRESS_FIELDS]} />
          <SecurityCard />
          <DangerZoneCard />
        </div>
      </div>
    </>
  );
}
