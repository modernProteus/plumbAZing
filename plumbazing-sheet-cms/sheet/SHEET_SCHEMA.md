# PlumbAZing Sheet-CMS schema

One Google Sheet, two tabs to start: **Promotions** and **Services**. Row 1 =
headers, exact names below. Josh edits rows, clicks Publish, site updates.

---

## Tab 1: `Promotions` (time-bound)

| Column | Meaning | Validation |
|---|---|---|
| `key` | short unique slug | lowercase, no spaces |
| `active` | show it or not | **checkbox** (TRUE/FALSE) |
| `sort` | order among promos | number |
| `title` | headline, e.g. "Free PRV Inspection" | - |
| `subtitle` | short supporting line | - |
| `description` | details / fine print | - |
| `badge` | small tag | dropdown: Featured Promotion, Value Promise, First-Time Offer, Limited Time, Seasonal, New, Popular |
| `cta` | button text, e.g. "Book Now" | - |
| `cta_url` | where the button goes | - |
| `start_date` | promo begins (blank = live now) | **date** |
| `end_date` | promo expires (blank = open-ended) | **date** |
| `image_url` | promo image, e.g. `/img/promo-drain.jpg` | optional; 4:3 ratio, 1200x900px, JPG/PNG/WebP, under 400KB |

### Seed rows (import as CSV or type in)
```csv
key,active,sort,title,subtitle,description,badge,cta,cta_url,start_date,end_date,image_url
prv_special,FALSE,1,PRV Special,Pressure reducing valve offer,"The current PRV promotion. Set active to FALSE (or an end_date in the past) to retire it.",Limited Time,Book Now,/book,,,
water_heater_flush,TRUE,2,Water Heater Flush,Keep it running longer,"Seasonal water heater flush and inspection. Book online in under a minute.",Seasonal,Book Now,/book,,,
```

> **Request 1 (remove the PRV special) lives here.** Once this tab is wired, the
> PRV row is seeded with `active = FALSE`, so it is already retired. Flip it back
> to TRUE any time it returns. This is also the perfect first smoke test: toggle
> it, Publish, watch it appear and disappear.

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
- `start_date` / `end_date` (Promotions only): Format -> Number -> Date.
- `badge` (Promotions): Data validation -> Dropdown.
- Freeze row 1: View -> Freeze -> 1 row.

## Why services are NOT time-bound
Promos come and go on dates. Services are just "on or off," so the endpoint skips
the date-window check for the Services tab (`timeBound: false` in code.gs). Same
machinery, one honest difference.
