# Expense Tracker

A mobile-first expense tracker that installs on your phone as a PWA. It tracks spending by
budget period (for example, payday to payday) instead of by calendar month.

## Features

- **Budget periods**: start, close and reopen periods; new expenses go into the current one
- **Daily and period views**: spending per day and per period, with bar and pie charts (no chart library)
- **Custom categories**: add, rename and colour your own categories
- **Settings**: currency (JPY, NPR, USD, EUR, GBP), the day your month starts, and a theme colour
- **Accounts**: email and password sign-in with Convex Auth (passwords are hashed)
- **Admin view**: an admin account can see total spending across users
- **Installable**: web app manifest, icons and a service worker, with layout fixes for iOS Safari

## Tech stack

- React 19, TypeScript, Vite, Tailwind CSS, React Router
- [Convex](https://convex.dev) for the database, server functions and auth

## Running it locally

```sh
npm install
npm run dev
```

`npm run dev` starts Vite and the Convex dev server together. On the first run, Convex asks you to log
in and creates your own deployment. Then run `npx @convex-dev/auth` once to set up the auth keys.

## Project structure

```
convex/           backend: schema, queries and mutations (expenses, periods, settings, admin), auth
src/components/   pages and UI: dashboard, daily and period views, period manager, settings, charts
src/utils/        formatting and date helpers
public/           manifest, service worker, icons
```

## How it was built

The first version came from a [Convex Chef](https://chef.convex.dev) scaffold made with Claude.
Budget periods, custom categories, theming, routing and the PWA/iOS fixes were added on top of it.
