/**
 * Build-time fetch for the PlumbAZing Sheet-CMS.
 *
 * Runs BEFORE the site build (wire as npm "prebuild"). Pulls promos + services
 * from the Apps Script endpoint and writes generated JSON the site reads.
 *
 * FAIL-SAFE: on any network/endpoint/parse error it keeps the last committed
 * snapshot, so a bad fetch or a bad sheet edit can never blank the site.
 *
 * IMPORTANT DIFFERENCE FROM THE SEED: an empty list is treated as VALID here.
 * The seed kept the old snapshot whenever the list was empty, which meant
 * "turn off the last promo" would silently keep showing it. For PlumbAZing you
 * WANT an empty promo list to publish (that is literally how you remove a
 * special). We only keep the snapshot on a real failure, not on "zero items."
 *
 * Env: APPS_SCRIPT_URL = the Apps Script /exec URL (set in Render as an env var)
 */

import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname } from "node:path";

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

// type -> where the site reads it. ADAPT these paths to your project layout.
const TARGETS = {
  promos:   "src/data/promos.generated.json",
  services: "src/data/services.generated.json"
};

async function ensureDir(path) {
  const dir = dirname(path);
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });
}

function keep(type, outPath, reason) {
  if (existsSync(outPath)) {
    console.warn(`[fetch-content] ${type}: ${reason}. Keeping existing snapshot.`);
  } else {
    console.warn(`[fetch-content] ${type}: ${reason}. No snapshot yet; writing empty list.`);
  }
}

async function fetchType(type, outPath) {
  await ensureDir(outPath);

  if (!APPS_SCRIPT_URL) {
    if (!existsSync(outPath)) await writeFile(outPath, "[]\n", "utf8");
    console.warn(`[fetch-content] APPS_SCRIPT_URL not set. Keeping snapshot for ${type}.`);
    return;
  }

  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=items&type=${type}`);
    if (!res.ok) { keep(type, outPath, `endpoint returned HTTP ${res.status}`); return; }

    const data = await res.json();
    const items = Array.isArray(data.items) ? data.items : null;

    // A real array (even empty) is valid. Only a missing/malformed array fails.
    // Every present item must have an id and a title.
    const valid = items !== null && items.every((i) => i && (i.id || i.key) && i.title);
    if (!valid) { keep(type, outPath, "payload failed validation (need id + title)"); return; }

    await writeFile(outPath, JSON.stringify(items, null, 2) + "\n", "utf8");
    console.log(`[fetch-content] ${type}: wrote ${items.length} item(s).`);
  } catch (err) {
    keep(type, outPath, `fetch error: ${err.message}`);
  }
}

async function run() {
  for (const [type, outPath] of Object.entries(TARGETS)) {
    await fetchType(type, outPath);
  }
}

run(); // always exits 0; fail-safe never breaks the build
