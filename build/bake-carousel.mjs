#!/usr/bin/env node
// Build-time bake of sheet-driven PROMO slides into the hero carousel's promo
// zone in index.html.
//
// SCOPE: this only ever touches the <!-- CAROUSEL_PROMOS:START/END --> zone.
// The Jax "What customers appreciate most" trust slide and the "Meet the
// Team" brand slide are pinned, hand-authored slides living outside that
// zone -- this script never reads, writes, or reasons about them. (Their
// live numbers are updated separately, by build/bake-reviews.mjs filling
// the <span data-review-rating>/<span data-review-count> spans inside the
// pinned trust slide.)
//
// FAIL-SAFE CONTRACT: any fetch/network/parse/shape error leaves index.html
// completely untouched. An empty (post-filter) promo list is NOT a failure --
// it correctly clears the promo zone, same as the grid -- because the
// pinned slides guarantee the carousel is never actually empty.
//
// Reads the same `${APPS_SCRIPT_URL}?action=items&type=content` endpoint as
// build/bake-content.mjs (the unified Content tab), filtered to
// type === "Promo" AND placement "Carousel" or "Both", sorted by `sort`.
//
// Dots are no longer baked at all: js/main.js builds the dot row at runtime
// from the live count of [data-hero-slide] elements, so pinned + injected
// promo slides always get the right number of dots and the counts can never
// drift apart.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX_HTML = join(__dirname, "..", "index.html");

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;
const FETCH_TIMEOUT_MS = 15000;

const PROMOS_MARKER = { start: "<!-- CAROUSEL_PROMOS:START -->", end: "<!-- CAROUSEL_PROMOS:END -->", closeIndent: "\t\t\t\t" };
const CAROUSEL_PLACEMENTS = new Set(["Carousel", "Both"]);

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

function renderPromoSlide(item, index) {
  const kicker = item.tagLabel || item.kicker || "";
  const body = item.description || item.subtitle || "";
  const image = item.imageUrl
    ? `\n\t\t\t\t\t\t<div class="hero-slide-media">\n\t\t\t\t\t\t  <img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.title)}" />\n\t\t\t\t\t\t</div>`
    : "";
  const meta = item.meta
    ? `\n\t\t\t\t\t\t  <div class="promo-meta">${escapeHtml(item.meta)}</div>`
    : "";

  return `\t\t\t\t\t<article class="hero-slide${index === 0 ? " active" : ""}" data-hero-slide="${index}">
\t\t\t\t\t  <div class="hero-slide-card">${image}
\t\t\t\t\t\t<div class="hero-slide-body">
\t\t\t\t\t\t  <span class="hero-slide-kicker">${escapeHtml(kicker)}</span>
\t\t\t\t\t\t  <h3>${escapeHtml(item.title)}</h3>
\t\t\t\t\t\t  <p>${escapeHtml(body)}</p>${meta}
\t\t\t\t\t\t</div>
\t\t\t\t\t  </div>
\t\t\t\t\t</article>`;
}

function replaceMarkerRegion(html, marker, innerHtml) {
  const startIdx = html.indexOf(marker.start);
  const endIdx = html.indexOf(marker.end);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    throw new Error(`Markers not found or out of order: ${marker.start} / ${marker.end}`);
  }
  const before = html.slice(0, startIdx + marker.start.length);
  const after = html.slice(endIdx);
  const body = innerHtml ? `\n${innerHtml}\n${marker.closeIndent}` : `\n${marker.closeIndent}`;
  return `${before}${body}${after}`;
}

async function main() {
  if (!APPS_SCRIPT_URL) {
    console.warn("[bake-carousel] APPS_SCRIPT_URL not set; leaving committed index.html untouched.");
    return;
  }

  let contentItems;
  try {
    contentItems = await fetchItems("content");
  } catch (err) {
    console.error("[bake-carousel] Failed to fetch/validate content; leaving committed index.html untouched:", err.message);
    return;
  }

  const promoSlides = contentItems
    .filter((item) => item.type === "Promo" && CAROUSEL_PLACEMENTS.has(item.placement))
    .sort((a, b) => (Number(a.sort) || 0) - (Number(b.sort) || 0));

  const html = readFileSync(INDEX_HTML, "utf8");
  const slidesHtml = promoSlides.map(renderPromoSlide).join("\n\n");

  let updated;
  try {
    updated = replaceMarkerRegion(html, PROMOS_MARKER, slidesHtml);
  } catch (err) {
    console.error("[bake-carousel] Failed to splice promo slides into index.html; leaving committed index.html untouched:", err.message);
    return;
  }

  writeFileSync(INDEX_HTML, updated);
  console.log(`[bake-carousel] Baked ${promoSlides.length} promo slide(s) into the carousel promo zone (pinned slides untouched).`);
}

main().catch((err) => {
  console.error("[bake-carousel] Unexpected error; leaving committed index.html untouched:", err);
});
