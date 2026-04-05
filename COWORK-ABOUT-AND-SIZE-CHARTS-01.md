# COWORK-ABOUT-AND-SIZE-CHARTS-01 | DONE

Generated: 2026-04-01

---

## about-change: BLOCKED — requires Aaron manual edit

**Issue found:** The About page text reads:
> "From breathable rash guards to flexible shorts, spats, and gis, every piece is crafted..."

**Required change:** Remove ", spats, and gis" so it reads:
> "From breathable rash guards to flexible shorts, every piece is crafted..."

**Additional issues found on About page:**
- "Laburu" misspelling — should be "Lauburu" (appears twice: heading + body)

**Why blocked:** The About page content is stored in the theme template JSON (`templates/page.about-us.json`), section `custom_content_HcmCKY` → block `text_66KXt8`. The Shopify theme editor sidebar uses shadow DOM web components that browser automation cannot interact with. The code editor is also shadow DOM.

**"Spats" sweep results:** Only found on the About page. Home page, collections page, and contact page are clean. No product descriptions reference "spats".

**Aaron action:** In Shopify Admin → Online Store → Themes → lauburu-dev → Customize → navigate to About page → click "Custom content" section → click the text block → find and edit the paragraph. Also fix "Laburu" → "Lauburu".

---

## supplier-findings: CONFIRMED

| Product | Vendor (from Shopify) | Fulfillment Platform |
|---|---|---|
| Oversize Fleeced Hoodie (both variants) | ODMPOD | ODMPOD / Tapstitch |
| Sorona Quick-Dry Cooling T-Shirt (both variants) | ODMPOD | ODMPOD / Tapstitch |
| Women's Rashguard (all 6 colours) | Subliminator | Subliminator |
| Grappling No Gi Shorts | Merchize | Merchize |
| Men's Rashguard (all 5 colours) | Subliminator | Subliminator |
| Grappling Shorts - Black (women's 2-in-1) | Subliminator | Subliminator |
| Fleece Joggers (plain + coloured) | ODMPOD | ODMPOD |
| Fleece Shorts (plain + coloured) | ODMPOD | ODMPOD |
| Flip-Flops | Lauburu Grappling | — |
| Drawstring Bag / Fanny Pack | Lauburu Grappling | — |

---

## charts-collected: PARTIAL — 2 of 4 captured from web search

### 1. Sorona Quick-Dry Cooling T-Shirt (ODMPOD) — CAPTURED

Sizes: S, M, L, XL, 2XL | Fabric: 73.31% Cotton / 26.69% Sorona | Weight: 7.1 oz/yd² | Fit: Unisex loose

| Size | Chest (in/cm) | Length (in/cm) | Shoulder (in/cm) | Sleeve (in/cm) |
|---|---|---|---|---|
| S | 20.9" / 53 | 26.4" / 67 | 19.7" / 50 | 7.1" / 18 |
| M | 21.7" / 55 | 27.2" / 69 | 20.5" / 52 | 7.5" / 19 |
| L | 22.4" / 57 | 28.0" / 71 | 21.3" / 54 | 7.9" / 20 |
| XL | 23.2" / 59 | 28.7" / 73 | 22.0" / 56 | 8.3" / 21 |
| 2XL | 24.0" / 61 | 29.5" / 75 | 22.8" / 58 | 8.7" / 22 |

Source: ODMPOD product listings (multiple stores confirmed same measurements)

### 2. Oversize Fleeced Hoodie (ODMPOD) — CAPTURED

Sizes: S, M, L, XL, 2XL | Fit: Oversized

| Size | Chest (in/cm) | Length (in/cm) | Shoulder (in/cm) | Sleeve (in/cm) |
|---|---|---|---|---|
| S | 26.0" / 66 | 27.6" / 70 | 25.6" / 65 | 21.1" / 53.5 |
| M | 26.8" / 68 | 28.3" / 72 | 26.4" / 67 | 21.5" / 54.5 |
| L | 27.6" / 70 | 29.1" / 74 | 27.2" / 69 | 21.9" / 55.5 |
| XL | 28.3" / 72 | 29.9" / 76 | 28.0" / 71 | 22.2" / 56.5 |
| 2XL | 29.1" / 74 | 30.7" / 78 | 28.7" / 73 | 22.6" / 57.5 |

Source: ODMPOD product listings (Raud Gallery, Harven store confirmed same measurements)

### 3. Women's Rashguard (Subliminator) — NOT CAPTURED

Subliminator's help center confirms they provide size charts based on flat-lay garment measurements (XS–5XL range available). However, the specific women's rashguard measurements could not be retrieved — all Subliminator domains are blocked by egress proxy.

**Aaron action:** Log in to Subliminator dashboard → find the women's rashguard product → screenshot or copy the size chart. URL: https://help.subliminator.com/en/articles/7915434-understanding-the-subliminator-size-chart-ensuring-the-perfect-fit

### 4. Men's Grappling No-Gi Shorts (Merchize) — NOT CAPTURED

No Merchize-specific size chart found in web search results. Merchize domain is blocked by egress proxy.

**Aaron action:** Log in to Merchize dashboard → find the "Grappling No Gi Shorts" product → screenshot or copy the size chart. URL: https://merchize.com (check your account's product catalog)

---

## blocked: 3 items

1. **About page text edit** — Shopify theme editor shadow DOM prevents browser automation from editing template JSON content. Aaron must edit manually in Shopify Admin.
2. **Subliminator women's rashguard size chart** — Cannot access supplier site (egress blocked). Aaron must get from Subliminator dashboard.
3. **Merchize men's no-gi shorts size chart** — Cannot access supplier site (egress blocked). Aaron must get from Merchize dashboard.

---

## issues: 2

1. **About page "Laburu" misspelling** — Should be "Lauburu". Appears in both the heading ("About Laburu Grappling") and body text. Needs correction when Aaron edits the About page.
2. **Contact page copy** — Contains "If you've got great products your making" (should be "you're"). Minor typo, same shadow DOM limitation applies.

---

## PLAIN ENGLISH SUMMARY

**What was done:**
- Confirmed the About page is the only place "spats" appears on the live storefront
- Identified all four product suppliers from the Shopify product list
- Captured complete size charts for the hoodie and t-shirt (both ODMPOD products) from web search
- Attempted to get women's rashguard and no-gi shorts charts but supplier sites were inaccessible

**What Aaron needs to do:**
1. Edit the About page in Shopify theme editor — remove "spats, and gis" and fix "Laburu" → "Lauburu"
2. Get women's rashguard size chart from Subliminator dashboard
3. Get men's no-gi shorts size chart from Merchize dashboard
4. Once all 4 size charts are in hand, Code can create the HTML files and add them to `product-mapping.json`

---

-- FROM: COWORK
