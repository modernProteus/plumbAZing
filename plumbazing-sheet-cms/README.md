# PlumbAZing Sheet-CMS (bootstrap)

Google Sheet as the backend, Apps Script as the API, the site reads it, Josh
manages content without touching code. Adapted from the sheet-cms seed for the
PlumbAZing stack (GitHub + Render + Housecall Pro).

> **Repo-specific note:** this folder is reference documentation for the
> backend (Apps Script + sheet schema). It is not executed as part of the
> site build. Since plumbAZing is confirmed to run on a Render **Static
> Site** (build command), the actual bake step lives at the repo root in
> `build/bake-content.mjs` (and `build/bake-reviews.mjs` for Google reviews),
> which splice content directly into `<!-- PROMOS:START/END -->` and
> `<!-- REVIEWS:START/END -->` markers in `index.html`. `build/fetch-content.mjs`
> below is kept as the source for the fail-safe validation contract
> (`ok === true`, `items` array, each item needs an `id`/`key` + `title`) that
> `build/bake-content.mjs` mirrors — it does not run in this repo's build.
> `code.gs` includes an added `image_url` -> `imageUrl` mapping (Task 2's
> promo image support) that must be pasted into the live Apps Script project.

## What's here
- `apps-script/code.gs` - the API. Serves **promos** and **services** from sheet
  tabs, and a Publish menu that fires a **Render deploy hook**.
- `apps-script/SETUP-render.md` - paste, configure, get the deploy hook, deploy.
- `sheet/SHEET_SCHEMA.md` - the two tabs, with the **PRV special seeded so
  removing it is one checkbox**.
- `build/fetch-content.mjs` - build-time fetch, fail-safe snapshots, plus the
  fix that lets an empty promo list actually publish (so removal works).
- `build/WIRING-render.md` - the one framework-specific piece + Render env var.

## What changed vs the generic seed
1. **Render, not GitHub/Netlify.** Publish POSTs a Render deploy hook. No PAT,
   no Action, no repo variable. Fewer moving parts, fewer gotchas.
2. **Multi-type endpoint.** One script serves promos today and services when you
   want them, via `?type=`. Add more tabs later without new plumbing.
3. **Empty-list fix.** The seed treated "zero items" as a failure and kept the
   old snapshot. That would quietly keep a retired promo alive. Here an empty
   list publishes, which is exactly what "remove the PRV special" needs.

## How this maps to Josh's three requests
- **1. Remove PRV special:** seeded as `active = FALSE` in the Promotions tab. If
  you want it gone *before* the CMS is wired, that is a quick edit to the current
  promo markup in the repo (I need that file, see below).
- **2. Sheet-managed promos + services:** this whole package. Promos first,
  services included and ready when you want them dynamic.
- **3. Reviews:** not in this package. Reviews want a different source (Google),
  not a sheet. Plan and recommendation are in the chat. Short version: the same
  build-time fetch + fail-safe pattern can pull Google reviews via the Places
  API and bake them in. I need the Google Business Profile / Place ID first.

## What I need to finish the repo-specific parts
The endpoint, sheet, and publish loop above are framework-agnostic and done. To
wire them in and to handle the PRV markup + reviews section, I need repo read
access. GitHub blocks automated fetching, so pick one:
- Connect a GitHub connector (best; unblocks all future repo work too), or
- Paste three files: `package.json`, the promo/PRV section, the reviews section, or
- Tell me the framework and I will hand you the exact import lines.
