/**
 * promos-render.js — runtime fallback for sheet-driven promos.
 *
 * NOT the primary path on this repo. plumbAZing runs on a Render Static Site
 * with a build command, so promos are baked into index.html at deploy time by
 * build/bake-content.mjs (see the PROMOS:START/END markers). This file is kept
 * inert (PROMOS_ENDPOINT is blank) as a fallback for a future scenario where
 * build-time baking isn't available (e.g. a switch to a Render Web Service),
 * per plumbazing-sheet-cms/build/WIRING-render.md.
 *
 * PROGRESSIVE ENHANCEMENT / FAIL-SAFE (if ever activated):
 *   - If the endpoint is unset or the fetch fails, the static promo cards
 *     already in the HTML stay exactly as they are. Nothing breaks.
 *   - If the endpoint returns a valid list (even empty), the grid is replaced
 *     with the sheet's promos. Empty list = no promos shown, which is how
 *     "turn a promo off in the sheet" actually removes it from the page.
 *
 * SETUP (only if you need this path instead of the build-time bake):
 *   1. Deploy the Apps Script (see plumbazing-sheet-cms/) and copy its /exec URL.
 *   2. Paste it into PROMOS_ENDPOINT below.
 *   3. Add <script src="js/promos-render.js" defer></script> near the other
 *      script tags in index.html.
 */

(function () {
  const PROMOS_ENDPOINT = ""; // <- paste the Apps Script /exec URL to activate

  if (!PROMOS_ENDPOINT) return; // not configured yet: leave static cards alone

  const ACCENTS = [
    "promo-card-static--gradient",
    "promo-card-static--light",
    "promo-card-static--warm"
  ];

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
    ));
  }

  function cardHTML(p, i) {
    const accent = ACCENTS[i % ACCENTS.length];
    const kicker = p.badge ? `<span class="promo-kicker-static">${esc(p.badge)}</span>` : "";
    const meta = p.endDate ? `<div class="promo-meta">Expires ${esc(p.endDate)}. Ask for details.</div>` : "";
    const image = p.imageUrl
      ? `<div class="promo-image promo-image--cover"><img src="${esc(p.imageUrl)}" alt="${esc(p.title)}" loading="lazy" /></div>`
      : "";
    return `
      <article class="promo-card-static ${accent}">
        ${image}
        <div class="promo-content">
          ${kicker}
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.description || p.subtitle || "")}</p>
          <div class="promo-meta-actions">
            <button class="btn btn-primary" type="button" data-request-service>Request Service</button>
            <a class="btn btn-secondary" href="tel:15128884406">Call Now</a>
          </div>
          ${meta}
        </div>
      </article>`;
  }

  function wireInjectedCtas(grid) {
    // Injected buttons aren't bound by main.js (which binds on load). Reuse the
    // site's real booking modal by clicking an already-bound trigger elsewhere.
    grid.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-request-service]");
      if (!btn || !grid.contains(btn)) return;
      const external = [...document.querySelectorAll("[data-request-service]")]
        .find((el) => !grid.contains(el));
      if (external) { e.preventDefault(); external.click(); }
    });
  }

  async function run() {
    const grid = document.querySelector("#promos .promo-grid");
    if (!grid) return;
    try {
      const res = await fetch(`${PROMOS_ENDPOINT}?action=items&type=promos`);
      if (!res.ok) return; // keep static fallback
      const data = await res.json();
      if (!data || data.ok !== true || !Array.isArray(data.items)) return; // keep fallback
      grid.innerHTML = data.items.map(cardHTML).join("");
      wireInjectedCtas(grid);
    } catch (_) {
      /* keep static fallback */
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
