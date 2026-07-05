#!/usr/bin/env node
// Build-time bake of sheet-driven hero carousel slides into index.html.
//
// FAIL-SAFE CONTRACT: any fetch/network/parse/shape error, OR a Carousel/Both
// filtered list that comes back empty, leaves index.html completely
// untouched -- unlike the promo grid, the hero must never be blanked. The
// sheet is expected to always carry at least one always-on Brand row as a
// backstop against an accidental all-inactive carousel.
//
// Reads the same `${APPS_SCRIPT_URL}?action=items&type=content` endpoint as
// build/bake-content.mjs (the unified Content tab), filtered instead to
// placement "Carousel" or "Both", sorted by `sort`. Regenerates both the
// slide track and the dot row in one pass so their counts can never drift --
// see <!-- CAROUSEL_SLIDES:START/END --> and <!-- CAROUSEL_DOTS:START/END -->
// in index.html.
//
// Run this AFTER build/bake-reviews.mjs: a Trust slide with source="reviews"
// reads build/.reviews.json (written by bake-reviews.mjs) for live rating
// numbers, falling back to the sheet's own kicker/title if that file isn't
// there yet (reviews not yet resolved, or GOOGLE_PLACES_API_KEY unset).
//
// Slide/dot contract, confirmed against index.html and js/main.js: elements
// are selected via [data-hero-slide] / [data-hero-dot], "active" is a plain
// class toggle, and main.js derives the slide/dot count at runtime via
// querySelectorAll (no fixed count anywhere) -- so no JS changes are needed
// for this to support N slides.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX_HTML = join(__dirname, "..", "index.html");
const REVIEWS_SNAPSHOT_PATH = join(__dirname, ".reviews.json");

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;
const FETCH_TIMEOUT_MS = 15000;

const SLIDES_MARKER = { start: "<!-- CAROUSEL_SLIDES:START -->", end: "<!-- CAROUSEL_SLIDES:END -->", closeIndent: "\t\t\t\t" };
const DOTS_MARKER = { start: "<!-- CAROUSEL_DOTS:START -->", end: "<!-- CAROUSEL_DOTS:END -->", closeIndent: "\t\t\t\t\t" };
const CAROUSEL_PLACEMENTS = new Set(["Carousel", "Both"]);
const CALL_NOW_BUTTON = `<a class="btn btn-secondary" href="tel:15128884406">Call Now</a>`;

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

function readReviewsSnapshot() {
  if (!existsSync(REVIEWS_SNAPSHOT_PATH)) return null;
  try {
    const raw = JSON.parse(readFileSync(REVIEWS_SNAPSHOT_PATH, "utf8"));
    if (typeof raw?.rating !== "number" || typeof raw?.userRatingCount !== "number") return null;
    return raw;
  } catch {
    return null;
  }
}

function renderSlide(item, index, reviewsSnapshot) {
  const isActive = index === 0;
  const type = item.type;

  let kicker = item.kicker || "";
  let title = item.title || "";
  const body = item.description || item.subtitle || "";

  if (type === "Promo") {
    kicker = item.tagLabel || item.kicker || "";
  }

  // source=reviews Trust slide: override with live numbers when available,
  // otherwise fall back to whatever the sheet row itself says.
  if (type === "Trust" && item.source === "reviews" && reviewsSnapshot) {
    kicker = `Rated ${reviewsSnapshot.rating.toFixed(1)}`;
    title = `Loved by ${reviewsSnapshot.userRatingCount} local customers`;
  }

  const image = item.imageUrl
    ? `\n\t\t\t\t\t\t<div class="hero-slide-media">\n\t\t\t\t\t\t  <img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(title)}" />\n\t\t\t\t\t\t</div>`
    : "";

  // Trust slides never get a primary button; Promo/Brand get one only when
  // the sheet row actually supplies both a label and a link.
  const primaryButton =
    type !== "Trust" && item.ctaLabel && item.ctaUrl
      ? `<a class="btn btn-primary" href="${escapeHtml(item.ctaUrl)}">${escapeHtml(item.ctaLabel)}</a>\n\t\t\t\t\t\t\t`
      : "";

  const meta = item.meta
    ? `\n\t\t\t\t\t\t  <div class="promo-meta">${escapeHtml(item.meta)}</div>`
    : "";

  return `\t\t\t\t\t<article class="hero-slide${isActive ? " active" : ""}" data-hero-slide="${index}">
\t\t\t\t\t  <div class="hero-slide-card">${image}
\t\t\t\t\t\t<div class="hero-slide-body">
\t\t\t\t\t\t  <span class="hero-slide-kicker">${escapeHtml(kicker)}</span>
\t\t\t\t\t\t  <h3>${escapeHtml(title)}</h3>
\t\t\t\t\t\t  <p>${escapeHtml(body)}</p>
\t\t\t\t\t\t  <div class="hero-slide-actions">
\t\t\t\t\t\t\t${primaryButton}${CALL_NOW_BUTTON}
\t\t\t\t\t\t  </div>${meta}
\t\t\t\t\t\t</div>
\t\t\t\t\t  </div>
\t\t\t\t\t</article>`;
}

function renderDot(index) {
  const isActive = index === 0;
  return `\t\t\t\t\t<button class="hero-dot${isActive ? " active" : ""}" type="button" aria-label="Go to slide ${index + 1}" data-hero-dot="${index}"></button>`;
}

function replaceMarkerRegion(html, marker, innerHtml) {
  const startIdx = html.indexOf(marker.start);
  const endIdx = html.indexOf(marker.end);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    throw new Error(`Markers not found or out of order: ${marker.start} / ${marker.end}`);
  }
  const before = html.slice(0, startIdx + marker.start.length);
  const after = html.slice(endIdx);
  return `${before}\n${innerHtml}\n${marker.closeIndent}${after}`;
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

  const slideItems = contentItems
    .filter((item) => CAROUSEL_PLACEMENTS.has(item.placement))
    .sort((a, b) => (Number(a.sort) || 0) - (Number(b.sort) || 0));

  if (slideItems.length === 0) {
    console.error("[bake-carousel] No carousel-eligible content items; leaving committed index.html untouched (the hero is never blanked).");
    return;
  }

  const reviewsSnapshot = readReviewsSnapshot();
  if (!reviewsSnapshot) {
    console.warn("[bake-carousel] build/.reviews.json not found; any source=reviews slide will use its sheet-authored text as-is.");
  }

  const slidesHtml = slideItems.map((item, i) => renderSlide(item, i, reviewsSnapshot)).join("\n\n");
  const dotsHtml = slideItems.map((_, i) => renderDot(i)).join("\n");

  const html = readFileSync(INDEX_HTML, "utf8");

  let updated;
  try {
    updated = replaceMarkerRegion(html, SLIDES_MARKER, slidesHtml);
    updated = replaceMarkerRegion(updated, DOTS_MARKER, dotsHtml);
  } catch (err) {
    console.error("[bake-carousel] Failed to splice carousel into index.html; leaving committed index.html untouched:", err.message);
    return;
  }

  writeFileSync(INDEX_HTML, updated);
  console.log(`[bake-carousel] Baked ${slideItems.length} slide(s) and ${slideItems.length} dot(s) into index.html.`);
}

main().catch((err) => {
  console.error("[bake-carousel] Unexpected error; leaving committed index.html untouched:", err);
});
