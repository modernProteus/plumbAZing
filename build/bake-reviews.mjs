#!/usr/bin/env node
// Build-time bake of live Google reviews into index.html via the Places API (New).
//
// FAIL-SAFE CONTRACT: any error (missing key, network failure, unexpected
// response shape, or zero usable reviews) leaves index.html completely
// untouched. Unlike promos, the reviews section is never intentionally
// blanked -- the committed markup is always a valid fallback.
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

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLUMBAZING_PLACE_ID = process.env.PLUMBAZING_PLACE_ID;
const FETCH_TIMEOUT_MS = 15000;

// Known identity for PlumbAZING's Google Business Profile (from the Maps listing URL).
const EXPECTED_FTID = "0x43d47c68947a6f3b:0x386ed06a1a008637";
const EXPECTED_CID = BigInt("0x386ed06a1a008637").toString(10);
const EXPECTED_MID = "/g/11y_pv690m";

const REVIEWS_MARKER = { start: "<!-- REVIEWS:START -->", end: "<!-- REVIEWS:END -->" };
const RATING_COUNT_THRESHOLD = 10;
const MAX_REVIEWS = 5;
const TRUST_LINE = "Josh + Alan &middot; Licensed &amp; Insured &middot; Upfront Pricing &middot; LGBTQ+ Owned &middot; Local &amp; Family-Run";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

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
      "X-Goog-FieldMask": "rating,userRatingCount,reviews",
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Place details HTTP ${res.status}`);
  return res.json();
}

function validateDetails(details) {
  if (typeof details?.rating !== "number" || typeof details?.userRatingCount !== "number") return null;
  if (!Array.isArray(details.reviews)) return null;
  return details;
}

function renderSummary(details) {
  const countLine =
    details.userRatingCount >= RATING_COUNT_THRESHOLD
      ? `\n\t\t<p class="lead">${details.rating.toFixed(1)} stars from ${details.userRatingCount} Google reviews</p>`
      : "";

  return `\t\t<div class="reviews-summary">
\t\t  <span class="stars">${starString(details.rating)}</span>
\t\t  <span>${TRUST_LINE}</span>
\t\t</div>${countLine}`;
}

function renderReviewCards(reviews) {
  const usable = reviews
    .filter((r) => r.text?.text || r.originalText?.text)
    .slice(0, MAX_REVIEWS);

  if (usable.length === 0) return null;

  const cards = usable
    .map((r) => {
      const text = escapeHtml(r.text?.text || r.originalText?.text);
      const author = escapeHtml(r.authorAttribution?.displayName || "Google User");
      return `\t\t  <article class="review-card">
\t\t\t<div class="stars">${starString(r.rating)}</div>
\t\t\t<p>“${text}”</p>
\t\t\t<div class="review-meta">— ${author}, Google Review</div>
\t\t  </article>`;
    })
    .join("\n");

  return { html: `\t\t<div class="reviews-grid">\n${cards}\n\t\t</div>`, count: usable.length };
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

  const reviewsGrid = renderReviewCards(details.reviews);
  if (!reviewsGrid) {
    console.error("[bake-reviews] No usable reviews with text in response; leaving committed index.html untouched.");
    return;
  }

  const html = readFileSync(INDEX_HTML, "utf8");
  const innerHtml = `${renderSummary(details)}\n${reviewsGrid.html}`;

  let updated;
  try {
    updated = replaceMarkerRegion(html, REVIEWS_MARKER, innerHtml);
  } catch (err) {
    console.error("[bake-reviews] Failed to splice reviews into index.html; leaving committed index.html untouched:", err.message);
    return;
  }

  writeFileSync(INDEX_HTML, updated);
  console.log(`[bake-reviews] Baked rating ${details.rating} (${details.userRatingCount} total reviews), ${reviewsGrid.count} review card(s) into index.html.`);
}

main().catch((err) => {
  console.error("[bake-reviews] Unexpected error; leaving committed index.html untouched:", err);
});
