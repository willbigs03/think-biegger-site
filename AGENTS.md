# Think Biegger Site Agent

This workspace is only for the Think Biegger website.

## Scope

- Edit the static site in this folder.
- Keep source changes in `index.html` and supporting files.
- Run `npm run build` after edits so `dist/` and `think-biegger-site.zip` stay synced.
- Run `npm run verify` before committing or deploying.

## Deploy Workflow

Small copy, layout, and static asset changes may be committed and pushed after verification passes. Netlify deploys automatically from the connected GitHub repo.

Ask Will or Matt before:

- Changing deployment settings
- Changing domains or DNS
- Adding third-party scripts or analytics
- Reworking the whole visual direction
- Removing major sections

## Commands

- `npm run build` syncs the deploy folder.
- `npm run check:site` checks the built site with Playwright.
- `npm run verify` builds and checks the site.
