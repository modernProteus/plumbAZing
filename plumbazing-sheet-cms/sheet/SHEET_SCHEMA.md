# PlumbAZing Sheet-CMS schema

One Google Sheet, two tabs: **Content** and **Services**. Row 1 = headers,
exact names below. Josh edits rows, clicks Publish, site updates.

---

## Tab 1: `Content` (unified Promo / Trust / Brand, time-bound)

Replaces the old single-purpose `Promotions` tab. Every row has a `type`
(what it is) and a `placement` (where it shows). One row can appear in the
promo grid, the hero carousel, or both -- the site's `?action=items&type=content`
endpoint returns every column below plus the columns it *resolves*
(`kicker`, `tagLabel`, `ctaLabel`, `ctaUrl`) so the front end never has to
know about `tag`/`cta`/`link` directly. See `apps-script/code.gs` `getItems()`
for the resolution logic.

| Column | Meaning | Validation |
|---|---|---|
| `key` | short unique slug | lowercase, no spaces |
| `active` | show it or not | **checkbox** (TRUE/FALSE) |
| `type` | what kind of row this is | dropdown: `Promo`, `Trust`, `Brand` |
| `placement` | where it shows | dropdown: `Grid`, `Carousel`, `Both` |
| `sort` | order among rows sharing a placement | number |
| `tag` | small tag, **Promo only** -- resolves into `kicker`/`tagLabel` | dropdown: Featured Promotion, Value Promise, First-Time Offer, Limited Time, Seasonal, New, Popular |
| `kicker` | small tag/eyebrow text, **Trust/Brand only** (Promo derives this from `tag` instead) | free text |
| `title` | headline | - |
| `body` | supporting copy / fine print | - |
| `image_url` | card/slide image | optional; see "Image spec" below |
| `cta` | which button to show, if any | dropdown: (none), `book` (Book Now -> /book), `call` (Call Now -> tel:), `learn` (Learn More -> `link`) |
| `link` | button URL, **only used when `cta` = `learn`** | - |
| `meta` | small line under the body, **Promo only** (e.g. an expiry note) | - |
| `source` | where the content actually comes from, **Trust only** | dropdown: (none), `reviews` (live Google rating/review count overrides `kicker`/`title` at bake time -- see `build/bake-carousel.mjs`) |
| `start_date` | row begins showing, **Promo only** (blank = live now) | **date** |
| `end_date` | row stops showing, **Promo only** (blank = open-ended) | **date** |

### Image spec
4:3 ratio, 1200x900px, JPG/PNG/WebP, under 400KB -- for `placement = Grid` or
`Both` (the grid crops with `object-fit: cover`, so the crop matters). For
`placement = Carousel` only, the hero uses `object-fit: contain` on a
gradient background, so a hard 4:3 crop isn't required -- a resized image
(~1200px wide, transparent PNG allowed) works fine.

### Seed rows (import as CSV or type in)
```csv
key,active,type,placement,sort,tag,kicker,title,body,image_url,cta,link,meta,source,start_date,end_date
prv_special,FALSE,Promo,Both,1,Limited Time,,PRV Special,"The current PRV promotion. Set active to FALSE (or an end_date in the past) to retire it.",,book,,,,,
water_heater_flush,TRUE,Promo,Grid,2,Seasonal,,Water Heater Flush,"Seasonal water heater flush and inspection. Book online in under a minute.",,book,,,,,
meet_the_team,TRUE,Brand,Carousel,3,,Meet the Team,Josh + Alan + Jackson,"We're the folks who show up, explain the options, and leave your place cleaner than we found it.",/img/ad-team.png,learn,/#about,,,,
live_reviews,TRUE,Trust,Carousel,4,,Rated 5.0 on Google,Loved by 36 local customers,"Clear communication, dependable work, and help when it matters most.",,,,,"reviews",,
```

> **The `live_reviews` row's `kicker`/`title` are the fallback shown until
> `build/.reviews.json` exists** (i.e. until `bake-reviews.mjs` successfully
> resolves a Place ID and pulls real numbers -- see its header comment).
> Update them by hand whenever the real rating/count changes meaningfully,
> the same way you'd update any other row.

> **Request 1 (remove the PRV special) lives here.** Once this tab is wired,
> the PRV row is seeded with `active = FALSE`, so it is already retired. Flip
> it back to TRUE any time it returns. This is also the perfect first smoke
> test: toggle it, Publish, watch it appear and disappear.

---

## Tab 2: `Services` (not time-bound)

| Column | Meaning | Validation |
|---|---|---|
| `key` | short unique slug | lowercase, no spaces |
| `active` | show it or not | **checkbox** (TRUE/FALSE) |
| `sort` | display order | number |
| `tier` | which layout it renders as | `1` = full flip-card (icon, title, subtitle, back-side bullets, CTA); `2` = simple text pill in "More services we offer" |
| `title` | service name, e.g. "Leak & Pipe Repair" | - |
| `subtitle` | one-line summary (tier 1 only) | - |
| `description` | bullet points for the flip-card back (tier 1 only) | pipe-separated, e.g. `Bullet one\|Bullet two\|Bullet three` |
| `icon` | optional icon image path your site maps | optional |
| `cta` | button text (tier 1 only) | - |
| `cta_url` | where the button goes (tier 1 only) | - |

### Seed rows
```csv
key,active,sort,tier,title,subtitle,description,icon,cta,cta_url
water_heaters,TRUE,1,1,Water Heaters,Repair & replacement,"Fast, clean water heater work with upfront pricing.|Tank and tankless service support|Clear repair vs. replace guidance",droplet,Book Now,/book
drain_cleaning,TRUE,2,1,Drain Cleaning,Clogs cleared fast,"Professional drain clearing that fixes the cause, not just the symptom.|Kitchen, bath, and main drain issues|Clear next-step recommendations",wrench,Book Now,/book
leak_pipe_repair,TRUE,3,1,Leak & Pipe Repair,Stop the damage early,"Leak detection and pipe repair before a small drip becomes a big bill.|Visible leaks and hidden plumbing issues|Practical solutions to help protect your home",pipe,Book Now,/book
sewer_line_repair,TRUE,4,2,Sewer Line Repair,,,,,
```

> Leak & Pipe Repair is seeded here because it is the next likely build. When
> the page exists, point `cta_url` at it. Until then it can route to /book.

---

## Data validation to set up (both tabs)
- `active`: select the column, Insert -> Checkbox.
- `start_date` / `end_date` (Content only): Format -> Number -> Date.
- `type`, `placement`, `tag`, `cta`, `source` (Content): Data validation -> Dropdown, using the values listed above.
- `tier` (Services): Data validation -> Dropdown (1, 2).
- Freeze row 1: View -> Freeze -> 1 row.

## Why services are NOT time-bound
Content rows (Promo/Trust/Brand) can come and go on dates. Services are just
"on or off," so the endpoint skips the date-window check for the Services
tab (`timeBound: false` in code.gs). Same machinery, one honest difference.
