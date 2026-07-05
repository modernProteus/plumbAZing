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
| `badge` | small tag | dropdown: Limited Time, New, Seasonal, Popular |
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
| `title` | service name, e.g. "Leak & Pipe Repair" | - |
| `subtitle` | one-line summary | - |
| `description` | short paragraph | - |
| `icon` | optional icon name your site maps | optional |
| `cta` | button text | - |
| `cta_url` | where the button goes | - |

### Seed rows
```csv
key,active,sort,title,subtitle,description,icon,cta,cta_url
water_heaters,TRUE,1,Water Heaters,Repair & replacement,"Fast, clean water heater work with upfront pricing.",droplet,Book Now,/book
drain_cleaning,TRUE,2,Drain Cleaning,Clogs cleared fast,"Professional drain clearing that fixes the cause, not just the symptom.",wrench,Book Now,/book
leak_pipe_repair,TRUE,3,Leak & Pipe Repair,Stop the damage early,"Leak detection and pipe repair before a small drip becomes a big bill.",pipe,Book Now,/book
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
