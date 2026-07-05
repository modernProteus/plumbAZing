# Wiring the Sheet-CMS into the PlumbAZing site (Render)

Most of this is stack-agnostic. The ONE part that changes per framework is how
the site reads the generated JSON. Confirm the framework (see the last section)
and this is a 15-minute job.

## 1. The one stack-specific piece: how the site reads the data
`fetch-content.mjs` writes:
- `src/data/promos.generated.json`
- `src/data/services.generated.json`

Your site imports those and renders them. Exact import depends on the framework:
- **Astro / Next (static export) / Vite (React/Vue/Svelte):**
  `import promos from "@/data/promos.generated.json"` and map over it. This is
  the SEO-baked path (Google sees the promos and services). Recommended.
- **Plain static HTML (no build step):** there is nothing to bake into, so use
  RUNTIME: on page load, `fetch(APPS_SCRIPT_URL + "?action=items&type=promos")`
  and render client-side. Instant updates, but loses SEO baking. Fine for promos
  if ranking on them is not a goal yet; not ideal for services.

Commit a real snapshot of each JSON file so local dev and the first build work
with no network.

## 2. Prebuild hook (build-time path)
In `package.json`:
```json
"scripts": {
  "prebuild": "node build/fetch-content.mjs",
  "build": "<your existing build command>"
}
```
npm runs `prebuild` automatically before `build`. Node 20+ has global `fetch`,
so no dependency needed.

## 3. Render env var (the piece that silently breaks it if skipped)
Render dashboard -> the service -> **Environment** -> add:
- Key: `APPS_SCRIPT_URL`
- Value: the Apps Script `/exec` URL

If the build can't see this, the prebuild quietly falls back to the committed
snapshot and Publish appears to do nothing. This is the #1 gotcha.

## 4. Render service type: which are we on?
Two cases, and it changes the plan:
- **Render Static Site:** it runs your `build` command on each deploy, so the
  `prebuild` fetch runs in CI automatically. Deploy hook triggers a rebuild.
  This is the clean build-time story. Best case.
- **Render Web Service (Node server):** if the app renders pages at request time,
  you may not need a rebuild to change content at all; the server can read the
  JSON (or hit the endpoint) live. Publishing then becomes optional. Tell me
  which one and I will tailor the last mile.

## Smoke test (prove the whole loop)
1. Trigger a manual deploy on Render -> build log shows
   `[fetch-content] promos: wrote N item(s)`.
2. Add the `RENDER_DEPLOY_HOOK_URL` Script Property, click Publish in the sheet
   -> a new Render deploy should start within seconds.
3. Toggle the PRV promo `active` FALSE, Publish, confirm it disappears. Set it
   TRUE, Publish, confirm it returns. That proves the data flow AND removal.
