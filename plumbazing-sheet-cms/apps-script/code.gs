/*******************************************************
 * PlumbAZing Sheet-CMS - Apps Script API
 *
 * Serves sheet-managed content (Content + Services) as JSON, and exposes a
 * "Publish" menu that triggers a Render rebuild via a Deploy Hook.
 *
 * Adapted from the sheet-cms seed. Notable changes:
 *   1. Publishing targets a RENDER DEPLOY HOOK (this site deploys on Render),
 *      not GitHub repository_dispatch. Simpler: no PAT, no Action, no repo var.
 *   2. One endpoint serves MULTIPLE content types via ?type= (content, services,
 *      more tabs later).
 *   3. The `Content` tab unifies what used to be a promos-only tab: every row
 *      has a `type` (Promo/Trust/Brand) and a `placement` (Grid/Carousel/Both).
 *      This script resolves each row's raw `tag`/`cta`/`link` columns into the
 *      `kicker`/`tagLabel`/`ctaLabel`/`ctaUrl` fields the site's build/bake-
 *      content.mjs and build/bake-carousel.mjs actually consume, so the front
 *      end never has to know about the sheet's raw enum columns.
 *
 * GET:
 *   /exec                                        -> liveness + available types
 *   /exec?action=items                           -> active content rows (default)
 *   /exec?action=items&type=content              -> active, in-window Content rows
 *   /exec?action=items&type=services              -> active services
 *   /exec?action=items&type=content&callback=cb  -> JSONP
 *******************************************************/

/* ================= CONFIG (edit these) ================= */
const SPREADSHEET_ID = "PASTE_YOUR_SPREADSHEET_ID_HERE";

// One entry per sheet-managed content type. Add tabs here later (FAQs, cities...).
const ITEM_TYPES = {
  content:  { sheetName: "Content",    timeBound: true  },
  services: { sheetName: "Services",   timeBound: false }
};
const DEFAULT_TYPE = "content";

// Content tab `cta` column -> resolved button label/url. `learn` pulls its
// url from that row's own `link` column instead of a fixed one.
const CTA_MAP = {
  book:  { label: "Book Now",    url: "/book" },
  call:  { label: "Call Now",    url: "tel:15128884406" },
  learn: { label: "Learn More",  url: null }
};
/* ======================================================= */


/* ---------- GET handler ---------- */
function doGet(e) {
  const params = (e && e.parameter) ? e.parameter : {};
  const action = params.action || "";
  const callback = params.callback || "";
  let payload;

  try {
    if (action === "items") {
      const typeKey = (params.type || DEFAULT_TYPE).toLowerCase();
      payload = getItems(typeKey);
    } else {
      payload = {
        ok: true,
        message: "PlumbAZing Sheet-CMS endpoint is live.",
        availableTypes: Object.keys(ITEM_TYPES),
        usage: "?action=items&type=content | services"
      };
    }
  } catch (error) {
    payload = { ok: false, error: error.message };
  }

  return callback ? javascriptResponse(callback, payload) : jsonResponse(payload);
}


/* ---------- Items API (handles every type) ---------- */
function getItems(typeKey) {
  const config = ITEM_TYPES[typeKey];
  const now = new Date();

  if (!config) {
    return { ok: false, type: typeKey,
      error: "Unknown type. Use one of: " + Object.keys(ITEM_TYPES).join(", ") };
  }

  const sheet = getSpreadsheet().getSheetByName(config.sheetName);
  if (!sheet) return { ok: true, type: typeKey, updatedAt: now.toISOString(), items: [] };

  const values = sheet.getDataRange().getDisplayValues();
  if (values.length <= 1) return { ok: true, type: typeKey, updatedAt: now.toISOString(), items: [] };

  const headers = values[0].map(normalizeHeader);
  const rows = values.slice(1);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const mapRow = typeKey === "content" ? mapContentRow : mapServiceRow;

  const items = rows
    .map((row, index) => mapRow(rowToObject(headers, row), index))
    .filter((item) => {
      const isActive = ["true", "yes", "1"].includes(String(item.active).trim().toLowerCase());
      if (!isActive || !item.title) return false;
      if (config.timeBound) return withinWindow(item.startDate, item.endDate, today);
      return true;
    })
    .sort((a, b) => {
      const aSort = Number(a.sort || 9999);
      const bSort = Number(b.sort || 9999);
      if (aSort !== bSort) return aSort - bSort;
      return String(a.title).localeCompare(String(b.title));
    });

  return { ok: true, type: typeKey, updatedAt: now.toISOString(), items };
}

// Content tab: unified Promo/Trust/Brand rows. Resolves the raw sheet
// columns (tag, cta, link, source) into the fields the site's bake scripts
// actually consume (kicker, tagLabel, ctaLabel, ctaUrl) so the front end
// never has to know about the sheet's raw enum columns.
function mapContentRow(r, index) {
  const isPromo = String(r.type || "").toLowerCase() === "promo";
  const cta = resolveCta(r);
  return {
    id: r.key || ("content-" + (index + 1)),
    active: r.active,
    type: r.type || "",
    placement: r.placement || "",
    sort: r.sort || "",
    title: r.title || "",
    description: r.body || "",
    kicker: isPromo ? (r.tag || "") : (r.kicker || ""),
    tagLabel: isPromo ? (r.tag || "") : "",
    ctaLabel: cta.ctaLabel,
    ctaUrl: cta.ctaUrl,
    meta: r.meta || "",
    source: r.source || "",
    startDate: r.start_date || "",
    endDate: r.end_date || "",
    imageUrl: r.image_url || ""
  };
}

function resolveCta(r) {
  const ctaInfo = CTA_MAP[String(r.cta || "").toLowerCase()];
  if (!ctaInfo) return { ctaLabel: "", ctaUrl: "" };
  return {
    ctaLabel: ctaInfo.label,
    ctaUrl: ctaInfo.url === null ? (r.link || "") : ctaInfo.url
  };
}

// Services tab: unchanged plain passthrough (tier 1 flip-card / tier 2 pill).
function mapServiceRow(r, index) {
  return {
    id: r.key || ("services-" + (index + 1)),
    active: r.active,
    sort: r.sort || "",
    tier: r.tier || "1",
    title: r.title || "",
    subtitle: r.subtitle || "",
    description: r.description || "",
    icon: r.icon || "",
    cta: r.cta || "",
    ctaUrl: r.cta_url || ""
  };
}

function withinWindow(startStr, endStr, today) {
  if (startStr) {
    const start = new Date(startStr);
    if (!Number.isNaN(start.getTime())) {
      start.setHours(0, 0, 0, 0);
      if (today < start) return false;
    }
  }
  if (endStr) {
    const end = new Date(endStr);
    if (!Number.isNaN(end.getTime())) {
      end.setHours(23, 59, 59, 999);
      if (today > end) return false;
    }
  }
  return true;
}

/* ---------- helpers ---------- */
function getSpreadsheet() {
  if (!SPREADSHEET_ID || SPREADSHEET_ID === "PASTE_YOUR_SPREADSHEET_ID_HERE") {
    throw new Error("SPREADSHEET_ID is not configured.");
  }
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}
function normalizeHeader(v) {
  return String(v || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}
function rowToObject(headers, row) {
  const obj = {};
  headers.forEach((h, i) => { obj[h] = row[i] || ""; });
  return obj;
}
function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
function javascriptResponse(callback, payload) {
  const safe = sanitizeCallbackName(callback);
  return ContentService.createTextOutput(safe + "(" + JSON.stringify(payload) + ");")
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
function sanitizeCallbackName(callback) {
  const v = String(callback || "");
  return /^[A-Za-z_$][0-9A-Za-z_$]*(\.[A-Za-z_$][0-9A-Za-z_$]*)*$/.test(v) ? v : "callback";
}

/* ---------- Publish menu (Render Deploy Hook) ---------- *
 * Script Property required (Project Settings > Script Properties):
 *   RENDER_DEPLOY_HOOK_URL - from Render dashboard > your service > Settings >
 *                            Deploy Hook. Looks like:
 *                            https://api.render.com/deploy/srv-XXXX?key=YYYY
 *   Treat it as semi-secret: anyone with the URL can trigger a deploy.
 *******************************************************/
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Publish")
    .addItem("Publish to site", "publishToSite")
    .addToUi();
}
function publishToSite() {
  const url = PropertiesService.getScriptProperties().getProperty("RENDER_DEPLOY_HOOK_URL");
  if (!url) {
    SpreadsheetApp.getActive().toast("RENDER_DEPLOY_HOOK_URL not set in Script Properties.", "Publish", 8);
    return;
  }
  const res = UrlFetchApp.fetch(url, { method: "post", muteHttpExceptions: true });
  const code = res.getResponseCode();
  if (code >= 200 && code < 300) {
    SpreadsheetApp.getActive().toast("Publishing. Site updates in a few minutes.", "Publish", 8);
  } else {
    SpreadsheetApp.getActive().toast("Publish failed (HTTP " + code + "). Check the Render deploy hook URL.", "Publish", 10);
  }
}
