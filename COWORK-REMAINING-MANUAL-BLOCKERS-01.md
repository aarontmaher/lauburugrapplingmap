# COWORK-REMAINING-MANUAL-BLOCKERS-01 | DONE

Generated: 2026-04-01

---

## about-fix: BLOCKED — Shopify Admin shadow DOM + CSRF prevent automation

All approaches to edit the About page text were exhausted:

1. **Theme editor sidebar** — Shadow DOM web components. Clicking "Custom content" section names failed silently. Preview iframe clicks did not open section settings.
2. **Code editor** — Monaco editor inside shadow DOM. Find/Replace shortcuts (Cmd+F, Cmd+H, Ctrl+H, Cmd+Alt+F) all intercepted. Page went blank after navigation and never recovered.
3. **REST API PUT** — `GET` works (full JSON retrieved), but `PUT` returns `{"error":"CSRF"}` (403). No CSRF token available via meta tags, `window.Shopify`, `__SHOPIFY__`, or `__NEXT_DATA__`.

**Required edits (Aaron must do manually):**
- Remove ", spats, and gis" from: "From breathable rash guards to flexible shorts, spats, and gis, every piece is crafted..."
- Fix "Laburu" → "Lauburu" (appears twice: heading "About Laburu Grappling" + body "Laburu Grappling is built for athletes...")
- Path: Shopify Admin → Online Store → Themes → lauburu-dev → Customize → About page → Custom content section → text block

---

## charts-collected: 4 of 4 CAPTURED

### 1. Sorona Quick-Dry Cooling T-Shirt (ODMPOD) — CAPTURED (prior session)

Sizes: S–2XL | Fabric: 73.31% Cotton / 26.69% Sorona | Weight: 7.1 oz/yd² | Fit: Unisex loose

| Size | Chest (in/cm) | Length (in/cm) | Shoulder (in/cm) | Sleeve (in/cm) |
|---|---|---|---|---|
| S | 20.9" / 53 | 26.4" / 67 | 19.7" / 50 | 7.1" / 18 |
| M | 21.7" / 55 | 27.2" / 69 | 20.5" / 52 | 7.5" / 19 |
| L | 22.4" / 57 | 28.0" / 71 | 21.3" / 54 | 7.9" / 20 |
| XL | 23.2" / 59 | 28.7" / 73 | 22.0" / 56 | 8.3" / 21 |
| 2XL | 24.0" / 61 | 29.5" / 75 | 22.8" / 58 | 8.7" / 22 |

Source: ODMPOD product listings (multiple stores confirmed same measurements)

### 2. Oversize Fleeced Hoodie (ODMPOD) — CAPTURED (prior session)

Sizes: S–2XL | Fit: Oversized

| Size | Chest (in/cm) | Length (in/cm) | Shoulder (in/cm) | Sleeve (in/cm) |
|---|---|---|---|---|
| S | 26.0" / 66 | 27.6" / 70 | 25.6" / 65 | 21.1" / 53.5 |
| M | 26.8" / 68 | 28.3" / 72 | 26.4" / 67 | 21.5" / 54.5 |
| L | 27.6" / 70 | 29.1" / 74 | 27.2" / 69 | 21.9" / 55.5 |
| XL | 28.3" / 72 | 29.9" / 76 | 28.0" / 71 | 22.2" / 56.5 |
| 2XL | 29.1" / 74 | 30.7" / 78 | 28.7" / 73 | 22.6" / 57.5 |

Source: ODMPOD product listings (Raud Gallery, Harven store confirmed same measurements)

### 3. Women's Short Sleeve Rashguard (Subliminator) — CAPTURED

Sizes: 2XS–3XL | Source: BattleFitGear.com (Subliminator reseller)

| Size | Chest (in) | Sleeve (in) | Waist (in) | Length (in) |
|---|---|---|---|---|
| 2XS | 12.4" | 10.0" | 12.2" | 21.7" |
| XS | 13.2" | 10.8" | 12.9" | 22.6" |
| S | 14.7" | 11.6" | 13.7" | 23.6" |
| M | 15.5" | 12.6" | 14.5" | 24.6" |
| L | 16.3" | 13.6" | 15.3" | 25.5" |
| XL | 17.1" | 14.6" | 16.1" | 26.5" |
| 2XL | 17.9" | 15.6" | 16.9" | 27.5" |
| 3XL | 18.7" | 16.5" | 17.7" | 28.5" |

Note: Measurements are flat-lay (half-body). CM table was visible on the page but not captured before context reset.

### 4. Men's Grappling No-Gi Shorts (Merchize) — CAPTURED

Sizes: XS–4XL | Material: 100% Polyester | Closure: Velcro + elastic waistband | Sublimation printing | No pocket | Made in Vietnam

| Size | Waist 1/2 (in/cm) | Hip 1/2 (in/cm) | Length (in/cm) | Front Rise (in/cm) | Opening (in/cm) |
|---|---|---|---|---|---|
| XS | 13.0" / 33 | 18.5" / 47 | 17.3" / 44 | 11.0" / 28 | 11.8" / 30 |
| S | 14.0" / 35.5 | 19.5" / 49.5 | 17.7" / 45 | 11.4" / 29 | 12.2" / 31 |
| M | 15.0" / 38 | 20.5" / 52 | 18.1" / 46 | 11.8" / 30 | 12.6" / 32 |
| L | 16.0" / 40.5 | 21.5" / 54.5 | 18.5" / 47 | 12.2" / 31 | 13.0" / 33 |
| XL | 17.0" / 43 | 22.4" / 57 | 18.9" / 48 | 12.6" / 32 | 13.4" / 34 |
| 2XL | 18.0" / 45.5 | 23.4" / 59.5 | 19.3" / 49 | 13.0" / 33 | 13.8" / 35 |
| 3XL | 19.0" / 48 | 24.4" / 62 | 19.7" / 50 | 13.4" / 34 | 14.2" / 36 |
| 4XL | 20.0" / 50.5 | 25.4" / 64.5 | 20.1" / 51 | 13.8" / 35 | 14.6" / 37 |

Source: merchize.com product page — "All-over Print Fight Shorts (Elastic Waistband)"

---

## blocked: 1 item

1. **About page text edit** — Shopify Admin shadow DOM + CSRF protection prevent all automation approaches (theme editor, code editor, REST API). Aaron must edit manually.

---

## issues: 2

1. **"Laburu" misspelling on About page** — Should be "Lauburu". Appears in heading ("About Laburu Grappling") and body text ("Laburu Grappling is built for athletes"). Fix when editing the About page.
2. **Contact page typo** — "If you've got great products your making" should be "you're making". Same shadow DOM limitation applies.

---

## PLAIN ENGLISH SUMMARY

**What was done:**
- Tried every available method to edit the About page (theme editor clicks, code editor, REST API) — all blocked by Shopify's shadow DOM and CSRF protection
- Captured the two missing size charts: Women's rashguard from BattleFitGear (Subliminator reseller) and Men's no-gi shorts from Merchize product page
- All 4 product size charts are now collected and ready

**What Aaron needs to do:**
1. Edit the About page in Shopify Admin theme editor — remove ", spats, and gis" and fix "Laburu" → "Lauburu" (2 places)
2. All 4 size charts are captured — Code can create the HTML size chart files whenever ready

---

-- FROM: COWORK
