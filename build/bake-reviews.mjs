#!/usr/bin/env node
// Build-time bake of the live Google rating + review count into index.html
// via the Places API (New).
//
// DESIGN DECISION: quotes are curated, not auto-pulled. The Places API only
// returns up to 5 uncontrollable reviews, and the curated picks committed
// between the review cards tell the "honest, no-upsell" story better than
// whatever Google happens to surface. So this script updates ONLY the
// <!-- REVIEWS:START/END --> region, which now wraps just the rating/count
// line (`.reviews-summary`) -- the review-card quotes, the "See all reviews
// on Google" link, and the trust-badge pill row live outside the markers as
// permanent committed content this script never touches.
//
// It also fills two small spans inside the pinned Jax hero slide (the
// bespoke "What customers appreciate most" trust slide in index.html, never
// touched by build/bake-carousel.mjs): <span data-review-rating> and
// <span data-review-count>. Same fail-safe contract -- on any error, those
// spans keep whatever's committed (currently 5.0 / 36).
//
// FAIL-SAFE CONTRACT: any error (missing key, network failure, unexpected
// response shape) leaves index.html completely untouched -- the committed
// rating line is always a valid fallback.
//
// Place ID resolution:
//   - If PLUMBAZING_PLACE_ID is set, it's used directly (fast path, no search).
//   - Otherwise, this runs a one-time Text Search for "Plumbazing" biased to
//     Austin, TX, and verifies the top candidate against the business's known
//     Google Maps CID (derived from the FTID below) before trusting it. This
//     lets the bake self-bootstrap before Josh's place ID is configured, while
//     refusing to bake reviews for a same-named/wrong business.
//   - The MID (/g/11y_pv690m) is not exposed by the Places API and can't be
//     verified programmatically here; it's recorded for a human to cross-check
//     against https://google.com/search?kgmid=/g/11y_pv690m if ever in doubt.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX_HTML = join(__dirname, "..", "index.html");
const REVIEWS_SNAPSHOT_PATH = join(__dirname, ".reviews.json");

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLUMBAZING_PLACE_ID = process.env.PLUMBAZING_PLACE_ID;
const FETCH_TIMEOUT_MS = 15000;

// Known identity for PlumbAZING's Google Business Profile (from the Maps listing URL).
const EXPECTED_FTID = "0x43d47c68947a6f3b:0x386ed06a1a008637";
const EXPECTED_CID = BigInt("0x386ed06a1a008637").toString(10);
const EXPECTED_MID = "/g/11y_pv690m";

const REVIEWS_MARKER = { start: "<!-- REVIEWS:START -->", end: "<!-- REVIEWS:END -->" };

function starString(rating) {
  const full = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  return "★".repeat(full) + "☆".repeat(5 - full);
}

async function resolvePlaceId() {
  if (PLUMBAZING_PLACE_ID) return PLUMBAZING_PLACE_ID;

  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
      "X-Goog-FieldMask": "places.id,places.displayName,places.googleMapsUri",
    },
    body: JSON.stringify({ textQuery: "Plumbazing plumbing Austin TX" }),
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Text search HTTP ${res.status}`);
  const json = await res.json();
  const candidate = json?.places?.[0];
  if (!candidate?.id) throw new Error("Text search returned no candidate place");

  const cidMatch = /[?&]cid=(\d+)/.exec(candidate.googleMapsUri ?? "");
  if (!cidMatch || cidMatch[1] !== EXPECTED_CID) {
    throw new Error(
      `Resolved place failed identity check against FTID ${EXPECTED_FTID} ` +
        `(name: ${candidate.displayName?.text ?? "unknown"}, got cid: ${cidMatch?.[1] ?? "none"}, expected: ${EXPECTED_CID}). ` +
        `MID ${EXPECTED_MID} was not checked (unavailable via Places API) -- verify manually if this recurs.`
    );
  }

  console.log(
    `[bake-reviews] Verified place via text search: ${candidate.id}. ` +
      `Set PLUMBAZING_PLACE_ID=${candidate.id} in Render env vars to skip this search on future builds.`
  );
  return candidate.id;
}

async function fetchPlaceDetails(placeId) {
  const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}?languageCode=en`, {
    headers: {
      "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
      "X-Goog-FieldMask": "rating,userRatingCount",
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Place details HTTP ${res.status}`);
  return res.json();
}

function validateDetails(details) {
  if (typeof details?.rating !== "number" || typeof details?.userRatingCount !== "number") return null;
  return details;
}

// Lets bake-carousel.mjs show live rating numbers on a source=reviews slide
// without re-hitting the Places API. Non-fatal: a write failure here should
// never block the rating line itself from baking.
function writeReviewsSnapshot(details) {
  try {
    writeFileSync(
      REVIEWS_SNAPSHOT_PATH,
      JSON.stringify({ rating: details.rating, userRatingCount: details.userRatingCount }, null, 2) + "\n"
    );
    console.log(`[bake-reviews] Wrote ${REVIEWS_SNAPSHOT_PATH}.`);
  } catch (err) {
    console.warn(`[bake-reviews] Could not write ${REVIEWS_SNAPSHOT_PATH} (non-fatal):`, err.message);
  }
}

function renderSummary(details) {
  return `\t\t<div class="reviews-summary">
\t\t  <span class="stars">${starString(details.rating)}</span>
\t\t  <span>${details.rating.toFixed(1)} stars from ${details.userRatingCount} Google reviews</span>
\t\t</div>`;
}

function replaceMarkerRegion(html, marker, innerHtml) {
  const startIdx = html.indexOf(marker.start);
  const endIdx = html.indexOf(marker.end);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    throw new Error(`Markers not found or out of order: ${marker.start} / ${marker.end}`);
  }
  const before = html.slice(0, startIdx + marker.start.length);
  const after = html.slice(endIdx);
  return `${before}\n${innerHtml}\n\t\t${after}`;
}

function replaceSpanContent(html, dataAttr, newValue) {
  const pattern = new RegExp(`(<span data-${dataAttr}>)[^<]*(</span>)`);
  if (!pattern.test(html)) {
    throw new Error(`Could not find <span data-${dataAttr}> in index.html`);
  }
  return html.replace(pattern, `$1${newValue}$2`);
}

async function main() {
  if (!GOOGLE_PLACES_API_KEY) {
    console.warn("[bake-reviews] GOOGLE_PLACES_API_KEY not set; leaving committed index.html untouched.");
    return;
  }

  let placeId;
  try {
    placeId = await resolvePlaceId();
  } catch (err) {
    console.error("[bake-reviews] Failed to resolve place id; leaving committed index.html untouched:", err.message);
    return;
  }

  let details;
  try {
    const raw = await fetchPlaceDetails(placeId);
    details = validateDetails(raw);
    if (!details) throw new Error("Unexpected place details response shape");
  } catch (err) {
    console.error("[bake-reviews] Failed to fetch/validate place details; leaving committed index.html untouched:", err.message);
    return;
  }

  writeReviewsSnapshot(details);

  const html = readFileSync(INDEX_HTML, "utf8");

  let updated;
  try {
    updated = replaceMarkerRegion(html, REVIEWS_MARKER, renderSummary(details));
    updated = replaceSpanContent(updated, "review-rating", details.rating.toFixed(1));
    updated = replaceSpanContent(updated, "review-count", String(details.userRatingCount));
  } catch (err) {
    console.error("[bake-reviews] Failed to splice rating into index.html; leaving committed index.html untouched:", err.message);
    return;
  }

  writeFileSync(INDEX_HTML, updated);
  console.log(`[bake-reviews] Baked rating ${details.rating} (${details.userRatingCount} Google reviews) into the summary and the pinned Jax slide. Curated quotes were left untouched.`);
}

main().catch((err) => {
  console.error("[bake-reviews] Unexpected error; leaving committed index.html untouched:", err);
});
