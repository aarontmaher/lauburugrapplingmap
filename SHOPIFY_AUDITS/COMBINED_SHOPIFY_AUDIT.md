# Shopify Combined Audit — lauburugrappling.com
Compiled: 2026-03-26
Purpose: Pre-paid-ads store readiness audit

## SOURCE FILES STATUS

| Source | File | Status |
|--------|------|--------|
| Cowork | COWORK_AUDIT.md | ✅ Complete — 18 findings |
| Code | CODE_AUDIT.md | ⏳ Not yet written |
| Claude Chat | CLAUDE_CHAT_AUDIT.md | ⏳ Not yet written |
| ChatGPT | CHATGPT_AUDIT.md | ⏳ Not yet written |

> Note: Combined audit currently consolidates Cowork findings only. CODE_AUDIT, CLAUDE_CHAT_AUDIT, and CHATGPT_AUDIT files do not yet exist and were not invented. When those sources complete their audits, re-run consolidation and update this file.

---

## OVERALL VERDICT

**Not ad-ready in current state.** The store has a strong brand identity (Lauburu symbol, dark aesthetic, handmade positioning) and solid core product photography on rashguards. However, it has a live "[INSERT RETURN ADDRESS]" placeholder in the public refund policy — a legal risk and instant trust-killer — plus near-zero customer reviews, hidden manufacturing lead times, and opaque shipping costs. These four issues alone will produce elevated CPAs, low conversion rates, and post-purchase complaints from cold paid traffic.

The store needs roughly 1–2 weeks of focused fixes before increasing ad spend. The blocking issues are all fixable. The brand foundation is genuinely good.

---

## TOP CRITICAL ISSUES

### 1. Live placeholder in refund policy — "[INSERT RETURN ADDRESS]"
The refund policy is publicly visible and contains an unfilled Shopify template placeholder. Any shopper who checks the return policy (common for cold ad traffic) will see an unfinished document. The contact link in the same section is also broken. Fix immediately before any ad campaign.
- **Source:** Cowork (F-01)
- **Effort:** Easy — 5 minutes
- **Priority:** NOW

### 2. Near-zero customer reviews (1 total across all products)
Only 1 verified review exists across the entire store (Men's Rashguard – Blue, Feb 2026). All other product pages show "Be the first to write a review." Cold paid traffic converts far better with social proof. A review request campaign to existing customers is the highest-leverage trust improvement available.
- **Source:** Cowork (F-02)
- **Effort:** Medium (customer outreach)
- **Priority:** NOW

### 3. Manufacturing lead time (4–8 days) buried in product description
The handmade manufacturing time is hidden inside the "Product description" tab text, after fabric specs. Shoppers who don't read the full description will be surprised post-purchase. This should be surfaced prominently near the price or as a badge near the CTA.
- **Source:** Cowork (F-03)
- **Effort:** Easy
- **Priority:** NOW

### 4. Broken product images on related products and thumbnails
Related products at the bottom of product pages show blank grey boxes (no images). Several thumbnail images in the product gallery sidebar appear missing or too dark to be useful.
- **Source:** Cowork (F-04)
- **Effort:** Easy–Medium
- **Priority:** NOW

### 5. Size chart uses garment specs, not body measurements + cm only + broken chart image
Shoppers cannot match themselves to a size without a body-to-garment conversion guide. The visual size guide image inside the description is broken. No inches provided for US/UK market.
- **Source:** Cowork (F-05)
- **Effort:** Medium
- **Priority:** NOW (sizing confusion drives returns and abandoned carts)

---

## QUICK WINS

| # | Fix | Source | Effort | Impact |
|---|-----|--------|--------|--------|
| QW-01 | Fix "[INSERT RETURN ADDRESS]" in refund policy + fix broken contact link | Cowork | Easy | Trust, legal |
| QW-02 | Add manufacturing time as a visible badge/note near the price on all handmade product pages | Cowork | Easy | Trust, expectations |
| QW-03 | Add announcement bar: free shipping threshold OR "Handmade in-house" OR promo code | Cowork | Easy | Conversion, ad efficiency |
| QW-04 | Add trust badges near Add to Cart (secure checkout, 30-day returns, handmade quality) | Cowork | Easy | Trust |
| QW-05 | Fix breadcrumb "Home › Home page › Product" → "Home › Collection › Product" | Cowork | Easy | Brand perception, UX |
| QW-06 | Fix "Laburu" spelling on About page → "Lauburu" (matches domain and logo) | Cowork | Easy | Brand consistency |
| QW-07 | Remove/fix Gi mentions from About page copy ("gis", "spats") — contradicts No-Gi brand | Cowork | Easy | Brand clarity, ad-to-page fit |
| QW-08 | Surface "100% satisfaction / 30-day returns" language near the Add to Cart button | Cowork | Easy | Trust, conversion |
| QW-09 | Add AUD currency label to prices or enable multi-currency for international ad traffic | Cowork | Easy | Clarity, international conversion |

---

## MEDIUM IMPROVEMENTS

| # | Fix | Source | Effort | Impact |
|---|-----|--------|--------|--------|
| MI-01 | Replace product size chart with body measurement guide + add inches column | Cowork | Medium | Return rate, conversion |
| MI-02 | Fix broken size guide image in product description | Cowork | Easy | Clarity |
| MI-03 | Add shipping cost indicator on product pages (or add free shipping threshold to remove ambiguity) | Cowork | Medium | Conversion, cart abandonment |
| MI-04 | Separate digital products from physical in collections — create "Services" collection | Cowork | Medium | UX, brand clarity |
| MI-05 | Rewrite product descriptions with benefit/emotional copy above technical specs | Cowork | Medium | Conversion, cold traffic |
| MI-06 | Sharpen hero CTA from generic "Shop Now" → specific ("Shop Rashguards", "Shop No-Gi Gear") | Cowork | Easy | Ad efficiency, message match |
| MI-07 | Surface homepage products section without requiring specific scroll interaction | Cowork | Medium | Conversion |
| MI-08 | Add sub-navigation under collection dropdowns (Rashguards / Shorts / Hoodies / Accessories) | Cowork | Medium | Navigation, mobile usability |
| MI-09 | Review and clarify "$5 Mindmap Library Access" — appears to be placeholder/test price | Cowork | Easy | Brand perception |

---

## BIGGER BETS

| # | Fix | Source | Effort | Impact |
|---|-----|--------|--------|--------|
| BB-01 | Review campaign to get 20+ verified reviews on core products before scaling ads | Cowork | Large | Trust — single highest-leverage action |
| BB-02 | Build dedicated landing pages for ad campaigns (not collections, not homepage) | Cowork | Large | Ad efficiency, conversion rate |
| BB-03 | Add proper mobile-first layout testing on real devices (iPhone, Android) | Cowork | Medium | Mobile usability — inferred risk, not verified |

---

## REJECT / AVOID

- Do not split into too many separate collections until core product issues (images, descriptions, reviews) are fixed first
- Do not launch broad retargeting before fixing the return policy placeholder — anyone who sees the policy will not convert
- Do not use the Homepage "Shop Now" button as the primary ad destination — use product or collection pages

---

## FULL FINDINGS TABLE

| ID | Suggestion | Source | Type | Effort | Priority | Status |
|----|-----------|--------|------|--------|----------|--------|
| F-01 | Fix "[INSERT RETURN ADDRESS]" + broken contact link in refund policy | Cowork | Bug | Easy | NOW | pending |
| F-02 | Launch review request campaign — 0 reviews on most products | Cowork | Trust | Medium | NOW | pending |
| F-03 | Surface manufacturing lead time (4–8 days) prominently near price/CTA | Cowork | Conversion | Easy | NOW | pending |
| F-04 | Fix broken product images — related products + thumbnails | Cowork | Bug | Easy–Medium | NOW | pending |
| F-05 | Replace garment size chart with body measurement guide + add inches + fix broken image | Cowork | Clarity | Medium | NOW | pending |
| F-06 | Fix About page: remove "gis/spats", fix "Laburu" → "Lauburu" | Cowork | Content | Easy | SOON | pending |
| F-07 | Sharpen hero CTA from "Shop Now" to something specific | Cowork | CTA | Easy | SOON | pending |
| F-08 | Add announcement bar (shipping threshold / handmade claim / promo) | Cowork | Quick win | Easy | SOON | pending |
| F-09 | Show shipping cost on product page, or add free shipping tier to remove uncertainty | Cowork | Conversion | Medium | SOON | pending |
| F-10 | Fix breadcrumb: "Home › Home page" → "Home › Collection" | Cowork | Bug/UX | Easy | SOON | pending |
| F-11 | Separate digital products from physical products in collections | Cowork | UX | Medium | SOON | pending |
| F-12 | Add trust badges near Add to Cart | Cowork | Trust | Easy | SOON | pending |
| F-13 | Rewrite product descriptions with benefit copy (not just specs) | Cowork | Content | Medium | SOON | pending |
| F-14 | Add sub-categories to nav dropdowns (by product type, not just gender) | Cowork | Navigation | Medium | LATER | pending |
| F-15 | Surface "handmade in-house" differentiator near price, not buried in description | Cowork | Brand | Easy | SOON | pending |
| F-16 | Fix homepage product discovery — products should be visible without special scroll interaction | Cowork | UX | Medium | LATER | pending |
| F-17 | Add AUD currency label or enable multi-currency for international traffic | Cowork | Conversion | Easy–Medium | SOON | pending |
| F-18 | Rename /collections/all page title from "Products" to something descriptive | Cowork | UX/SEO | Easy | LATER | pending |

---

## NOTES FOR CODE

When CODE_AUDIT.md, CLAUDE_CHAT_AUDIT.md, and CHATGPT_AUDIT.md are written, re-merge into this file. Deduplicate by ID, preserve source attribution, keep all status fields at "pending" until actioned.

**Suggested action order for Code:**
1. F-01 (refund policy placeholder) — fix now, trivially easy
2. F-03 (manufacturing time) — add a visible notice block on product pages
3. F-10 (breadcrumb) — theme fix
4. F-04 (broken images) — image upload fix
5. F-12 (trust badges) — add icon row near CTA
6. F-08 (announcement bar) — add with shipping threshold or brand claim
7. F-09 (shipping cost visibility) — consider adding a flat rate or free shipping threshold
8. F-17 (AUD currency label) — add currency indicator to price display
