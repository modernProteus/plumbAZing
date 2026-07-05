# Apps Script setup (Render version)

## 1. Paste + configure
- Google Sheet -> Extensions -> Apps Script.
- Paste `code.gs`.
- Edit the CONFIG block:
  - `SPREADSHEET_ID` = the long ID from the sheet URL.
  - `ITEM_TYPES` already has `promos` and `services`. Leave as-is unless you
    rename tabs.

## 2. Script Properties
Project Settings (gear) -> Script Properties -> add:

| Property | Value | Notes |
|---|---|---|
| `RENDER_DEPLOY_HOOK_URL` | the Render deploy hook | semi-secret; anyone with it can trigger a deploy |

### Where the deploy hook comes from
Render dashboard -> the PlumbAZing service -> **Settings** -> **Deploy Hook** ->
copy the URL. It looks like:
```
https://api.render.com/deploy/srv-XXXXXXXX?key=YYYYYYYY
```
That is the whole reason we do NOT need a GitHub token or a GitHub Action here.
The seed used GitHub `repository_dispatch`; Render gives us a one-line hook that
does the same job with less wiring.

## 3. Deploy (required for the endpoint to update)
- Deploy -> Manage deployments -> Edit (pencil) -> Version: **New version** -> Deploy.
- Set "Who has access" to **Anyone** so the site build can read the JSON.
- Saving alone adds the Publish menu, but the `/exec` endpoint keeps serving the
  OLD code until you cut a new version.

## 4. Confirm
- Reopen the sheet: a **Publish** menu appears (give it a second).
- Visit `<your /exec URL>?action=items&type=promos` -> you should get JSON.
- Visit `...&type=services` -> the services list.

## Anti-gotcha
Pasting into the Apps Script editor can smuggle in curly quotes that break
parsing ("Invalid or unexpected token"). If that happens, retype the quotes or
use `clasp` to push from the command line.
