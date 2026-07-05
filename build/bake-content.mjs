#!/usr/bin/env node
// Build-time bake of sheet-driven promos into index.html.
//
// FAIL-SAFE CONTRACT: any fetch/network/parse/shape error leaves index.html
// completely untouched (the committed markup is the last-known-good). A
// successful fetch that returns an empty list DOES clear the section, since
// that's a deliberate "turn this promo off" edit in the sheet (see
// plumbazing-sheet-cms/README.md "empty-list fix").
//
// Response shape from `${APPS_SCRIPT_URL}?action=items&type=promos`, per
// plumbazing-sheet-cms/apps-script/code.gs:
//   { ok: true, type: "promos", updatedAt: "...", items: [
//       { id, active, title, subtitle, description, badge, icon, cta,
//         ctaUrl, startDate, endDate, sort, imageUrl? }, ... ] }
// Validation mirrors plumbazing-sheet-cms/build/fetch-content.mjs: payload.ok
// must be true, items must be an array, and every item needs an id (or key)
// and a title. `imageUrl` is this site's addition (image_url sheet column ->
// code.gs mapping) and is optional.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX_HTML = join(__dirname, "..", "index.html");

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;
const FETCH_TIMEOUT_MS = 15000;

const PROMOS_MARKER = { start: "<!-- PROMOS:START -->", end: "<!-- PROMOS:END -->" };
const PROMO_VARIANTS = ["promo-card-static--gradient", "promo-card-static--light", "promo-card-static--warm"];

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function validateItems(payload) {
  if (payload?.ok !== true) return null;
  const items = payload.items;
  if (!Array.isArray(items)) return null;
  const allValid = items.every((item) => item && (item.id || item.key) && item.title);
  if (!allValid) return null;
  return items;
}

async function fetchItems(type) {
  const url = `${APPS_SCRIPT_URL}?action=items&type=${type}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${type}`);
  const json = await res.json();
  const items = validateItems(json);
  if (items === null) throw new Error(`Unexpected payload shape for ${type}`);
  return items;
}

function renderPromoCard(item, index) {
  const variant = PROMO_VARIANTS[index % PROMO_VARIANTS.length];
  const kicker = item.badge
    ? `\n\t\t\t  <span class="promo-kicker-static">${escapeHtml(item.badge)}</span>`
    : "";
  const body = item.description || item.subtitle || "";
  const meta = item.endDate
    ? `\n\t\t\t  <div class="promo-meta">Expires ${escapeHtml(item.endDate)}. Ask for details.</div>`
    : "";
  const image = item.imageUrl
    ? `\n\t\t\t<div class="promo-image promo-image--cover">\n\t\t\t  <img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.title)}" loading="lazy" />\n\t\t\t</div>`
    : "";

  return `\t\t  <article class="promo-card-static ${variant}">${image}
\t\t\t<div class="promo-content">${kicker}
\t\t\t  <h3>${escapeHtml(item.title)}</h3>
\t\t\t  <p>${escapeHtml(body)}</p>${meta}
\t\t\t</div>
\t\t  </article>`;
}

function replaceMarkerRegion(html, marker, innerHtml) {
  const startIdx = html.indexOf(marker.start);
  const endIdx = html.indexOf(marker.end);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    throw new Error(`Markers not found or out of order: ${marker.start} / ${marker.end}`);
  }
  const before = html.slice(0, startIdx + marker.start.length);
  const after = html.slice(endIdx);
  const body = innerHtml ? `\n${innerHtml}\n\t\t  ` : "\n\t\t  ";
  return `${before}${body}${after}`;
}

async function main() {
  if (!APPS_SCRIPT_URL) {
    console.warn("[bake-content] APPS_SCRIPT_URL not set; leaving committed index.html untouched.");
    return;
  }

  let promoItems;
  try {
    promoItems = await fetchItems("promos");
  } catch (err) {
    console.error("[bake-content] Failed to fetch/validate promos; leaving committed index.html untouched:", err.message);
    return;
  }

  const html = readFileSync(INDEX_HTML, "utf8");
  const promoHtml = promoItems.map(renderPromoCard).join("\n\n");

  let updated;
  try {
    updated = replaceMarkerRegion(html, PROMOS_MARKER, promoHtml);
  } catch (err) {
    console.error("[bake-content] Failed to splice promos into index.html; leaving committed index.html untouched:", err.message);
    return;
  }

  writeFileSync(INDEX_HTML, updated);
  console.log(`[bake-content] Baked ${promoItems.length} promo(s) into index.html.`);
}

main().catch((err) => {
  console.error("[bake-content] Unexpected error; leaving committed index.html untouched:", err);
});
