# VuiAdmin React — Free React Tailwind Admin Dashboard Template

[![demo](https://img.shields.io/badge/demo-react.viliha.com-2563eb)](https://react.viliha.com)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.viliha.com)
[![license](https://img.shields.io/github/license/myviliha/free-reactjs-admin-dashboard?color=2563eb)](./LICENSE)
[![deploy](https://github.com/myviliha/free-reactjs-admin-dashboard/actions/workflows/deploy.yml/badge.svg)](https://github.com/myviliha/free-reactjs-admin-dashboard/actions/workflows/deploy.yml)
[![Sponsor @myviliha](https://img.shields.io/badge/Sponsor-%40myviliha-db61a2?style=for-the-badge&logo=githubsponsors&logoColor=white)](https://github.com/sponsors/myviliha)

VuiAdmin is a free and open-source admin dashboard template built on **React and Tailwind CSS**, from
[VILIHA](https://viliha.com). Nineteen screens, MIT licensed, on the same design system as the paid
editions — so what you evaluate here is what you build with.

This is the **React** edition: a plain Vite single-page app. No meta-framework, no server, no build
step you have to learn. Every screen renders from fixtures in its own file, so you can open one, read
it top to bottom, and see exactly where your data goes.


## ❤️ Sponsoring is what keeps this free

VuiAdmin absorbs the work of owning an admin dashboard in production: nineteen screens kept in step
across six framework editions, a design system underneath them so a card is the same card everywhere,
dark mode that inverts properly rather than washing out, keyboard and screen-reader behaviour on every
control, and the parity checks that stop the editions quietly drifting apart.

It is given away under MIT, and keeping it current with React and Vite, Tailwind and the other five
editions is ongoing work.

**Even $1 a month helps.** It funds bug fixes, new screens, and the next release.

> Sponsors are listed on the [GitHub Sponsors page](https://github.com/sponsors/myviliha) and get our
> genuine thanks.

### 👉 [Sponsor on GitHub →](https://github.com/sponsors/myviliha) &nbsp;·&nbsp; thank you 🙏

## Screenshots

![The ecommerce dashboard: metrics, monthly sales, monthly target, statistics](./docs/screenshots/dashboard.png)

| Tables | Form elements |
| ------ | ------------- |
| [![Basic tables](./docs/screenshots/tables.png)](./docs/screenshots/tables.png) | [![Form elements](./docs/screenshots/forms.png)](./docs/screenshots/forms.png) |

| Calendar | Six shell layouts |
| -------- | ----------------- |
| [![Calendar](./docs/screenshots/calendar.png)](./docs/screenshots/calendar.png) | [![Layouts](./docs/screenshots/layouts.png)](./docs/screenshots/layouts.png) |

![Sign in, split screen with the mark on a brand-coloured panel](./docs/screenshots/signin.png)

Every edition renders these same screens from the same fixtures — that is the point of the design
system sitting underneath them — so one set of shots is the honest set for all of them. Dark mode is
the toggle in the header on every screen.

## Overview

* React 19
* Vite 8
* TypeScript
* Tailwind CSS v4
* react-router for the nineteen routes
* ApexCharts, FullCalendar and jsvectormap for the data screens

The components come from `@viliha/vui-react` and its framework-free half `@viliha/vui-core`, both
vendored under [`packages/`](./packages) so a clone installs with nothing private in the way.

### Quick links

* [🚀 Live demo](https://react.viliha.com)
* [✨ VILIHA](https://viliha.com)
* [🧩 VuiAdmin templates](https://viliha.com) — React, Vue, Angular, HTML and Laravel editions of this
  dashboard, plus the Pro tier
* [⚡ Pro](https://viliha.com) — the server-backed record workflow, more dashboards, more screens

## Getting started

### Prerequisites

* Node.js 20.x or later

### Install and run

```bash
git clone git@github.com:myviliha/free-reactjs-admin-dashboard.git
cd free-reactjs-admin-dashboard
npm install
npm run dev
```

The dev server listens on [http://localhost:3000](http://localhost:3000).

### Scripts

| Script                | What it does                                                    |
| --------------------- | --------------------------------------------------------------- |
| `npm run dev`         | Vite dev server on port 3000                                    |
| `npm run build`       | Production build into `dist/`                                    |
| `npm run preview`     | Serve the built `dist/` locally                                 |
| `npm run check-types` | `tsc --noEmit`                                                  |
| `npm test`            | Route table, sidebar and fixture checks (`vitest`)              |

### Configuration

There is nothing to configure to run the demo. Two optional keys change who the footer credits, so a
team shipping this template does not have to edit a component to put their own name on it:

```bash
cp .env.local.example .env.local
```

| Key               | Default              | What it sets                                  |
| ----------------- | -------------------- | --------------------------------------------- |
| `VITE_SITE_NAME`  | `VILIHA`             | The name in the footer, rendered verbatim     |
| `VITE_SITE_URL`   | `https://viliha.com` | Where that name links                         |

## Deploying

`npm run build` writes a static `dist/` — no Node process to run. Upload it anywhere.

This repository publishes itself: [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml)
type-checks, tests and builds on every push to `main`, then deploys to GitHub Pages at
[react.viliha.com](https://react.viliha.com). The custom domain comes from `public/CNAME`, which Vite
copies into the artifact — Pages reads it there on every deploy, so it has to ship with the build
rather than being set once in the repository settings.

Because it is a single-page app, a deep link like `/alerts` is an address the host has to answer with
`index.html`. The build writes a `404.html` beside it, which is what GitHub Pages, Netlify and
Cloudflare Pages serve for an unmatched path, so deep links work on all three with no configuration.
A host with rewrite rules (`try_files`, `_redirects`) can point everything at `index.html` instead and
ignore that file.

Serving from a `<user>.github.io/<repo>` URL instead of a domain of its own needs one line: set
`base: "/<repo>/"` in `vite.config.ts`, so the asset URLs carry the subdirectory.

## What's in it

Nineteen screens:

* **Dashboard** — metrics, monthly sales and target, statistics, a demographic world map, recent orders
* **Calendar** — FullCalendar with add, edit and delete
* **User Profile** — profile, security and danger-zone cards with edit dialogs
* **Forms** — the full input set: text, select, multi-select, date, time, radio, checkbox, switch,
  file upload, password
* **Tables** — recent deals, top products, latest transactions, featured campaigns, with search,
  filter and row actions
* **Charts** — line and bar
* **UI elements** — alerts, avatars, badges, buttons, images, modals, videos
* **Authentication** — sign in and sign up on a split-screen layout
* **Pages** — a blank starting point, six shell layouts, and a 404

Plus the things a dashboard is judged on rather than counted by: a collapsible sidebar that keeps its
state across navigation, a rail mode with flyout submenus, dark mode, a route progress bar, and
`aria-current` on the row you are actually on.

## Project layout

```
index.html            the single page
src/
  main.tsx            entry point
  App.tsx             the router, and which screens get the shell
  screens.ts          address → screen, title and layout, for all nineteen
  screens/            one file per screen
  shell.tsx           the sidebar, header and footer, wired to react-router
  dashboard/          the dashboard's cards, charts and map
  styles.css          Tailwind plus the design system's tokens
packages/
  vui-core/           framework-free half: tokens, class strings, fixtures, the route list
  vui-react/          the React components
routes.test.ts        the sidebar, the route list and the screen map, held against each other
fixtures.test.ts      the demo names no real person
```

`src/screens.ts` is the one place a route exists. `routes.test.ts` holds it against the shared route
list in both directions, so a screen with no address and an address with no screen are both failures
rather than a blank page you find in a screenshot.

## Free and Pro

The free edition is this repository: nineteen screens and 64 component families, MIT licensed, with no
account and no key. The Pro tier adds the server-backed record workflow — list, detail, create, edit
and delete against your own API — along with more dashboards and the rest of the component catalogue.

VILIHA offers comprehensive templates: the same dashboard in **React, Vue, Angular, HTML and
Laravel**, built on one design system, so a team can change stack without changing product. See
[viliha.com](https://viliha.com).

## License

MIT. Use it commercially, fork it, ship it; keep the licence notice.

## Support

If this is useful, a star on GitHub helps. Issues and pull requests are welcome.
