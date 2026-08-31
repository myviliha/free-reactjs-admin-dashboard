# free-react · the free edition's demo

TailAdmin's free demo, route for route, built on VUI. **:3006.**

```bash
pnpm --filter free-react dev     # http://localhost:3006
```

## Why it is its own app

The first attempt was to subtract: take the fifty-screen paid app and drop whatever reaches the
record workflow. It does not work. One **type-only** import of a Pro module took out the app shell
and cascaded to seventy-six files, leaving fourteen pages, none of them the ones we wanted.

TailAdmin's free template is a separate, smaller repository for the same reason. This is that: a
purpose-built app whose every page is free by construction, so nothing has to be removed and nothing
can leak.

## The nineteen routes

Sixteen behind the shell, two auth screens outside it, and a 404.

| Behind the shell                                                                    | Outside it |
| ----------------------------------------------------------------------------------- | ---------- |
| `/` dashboard, `/calendar`, `/profile`, `/form-elements`, `/basic-tables`, `/blank` | `/signin`  |
| `/alerts`, `/avatars`, `/badge`, `/buttons`, `/images`, `/videos`, `/modals`        | `/signup`  |
| `/line-chart`, `/bar-chart`, `/layouts`                                             | `404`      |

**Seventeen are the reference's route table and two are ours.** `/modals` and `/layouts` were added
deliberately: the first because a free template with no dialog is missing the control every admin
screen needs, and the second because the six shell arrangements are the thing this design system has
that the reference does not, so the free tier is where a reader should meet them.

`FREE_NAV` in `@viliha/vui-core` is the one list the sidebar and the route set both read, so they
cannot disagree, and `FREE_ROUTES` is derived from it. The Vue edition of this demo reads the same
list, which is why it lives in the package rather than in `app/nav.ts`.

## What is deliberately not here

The searchable and multi-select dropdowns, drag-and-drop upload, the advanced table and the other
seven dashboards. Those are the paid tier, and they are **absent** rather than shown disabled: a
control a reader cannot use is worse than one they can see is not included.

## Where it deploys

Into the storefront's `public/preview/free-react/`, the call the Vue and Angular previews already
made. `basePath` applies to the build only: Next honours it on the dev server too, and a demo served
at `/preview/free-react/` while the port says 3006 is a demo nobody finds.
