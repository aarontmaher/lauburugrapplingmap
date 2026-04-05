# COWORK AUDIT — lauburugrappling.com
Source: Cowork (Claude in Chrome, direct visual inspection)
Date: 2026-03-26
Device verified: Mac desktop (1440×900). Mobile: inferred only — not directly verified.
Store purpose: Pre-paid-ads readiness audit

---

## SUMMARY

The store has good bones — clear brand identity, solid product photography on the core rashguards, and a distinct brand symbol (Lauburu). However, it has several critical blocking issues that will actively harm paid ad performance, plus a long list of medium and quick-win improvements. The most urgent issue is a live "[INSERT RETURN ADDRESS]" placeholder in the public refund policy, which is both a legal risk and an instant trust-killer for any ad-driven shopper who checks it.

---

## VERIFIED PAGES

- Homepage: https://lauburugrappling.com/
- Collections (all): /collections/all (pages 1–3)
- Collection (Men No-Gi): /collections/no-gi-jiu-jitsu-apparel
- Product page: /products/mens-rashguard-black
- Product page: /products/grappling-no-gi-shorts
- Refund Policy: /policies/refund-policy
- About: /pages/about
- Navigation dropdowns: NO-GI JIU JITSU APPAREL, ONLINE LEARNING

---

## FINDINGS

### F-01 | CRITICAL | BUG
**What:** Refund policy contains live placeholder text: "[INSERT RETURN ADDRESS]"
**Where:** /policies/refund-policy — 3rd paragraph
**Why it matters:** Any ad-driven shopper who checks return policy before buying will see an unfinished template. Destroys trust. Also legally problematic — no valid return address means the policy is not enforceable.
**Also:** "contact us ." appears with no working hyperlink — broken contact anchor in the refund policy.
**Who it affects:** All visitors, especially cold traffic from ads
**Type:** Bug
**Effort:** Easy (5 minutes to fix)
**Priority:** NOW
**Improves:** Trust, conversion rate, ad efficiency

---

### F-02 | CRITICAL | TRUST
**What:** Near-zero customer reviews across the entire store
**Where:** Product pages — "Customer Reviews" section shows "Be the first to write a review"
**Detail:** Only 1 cross-product review found (for Men's Rashguard – Blue, Feb 2026, 5 stars, "Crazy high quality for such a good price"). All other product pages show zero reviews.
**Why it matters:** Cold ad traffic converts at dramatically lower rates without social proof. A paid ad that sends someone to a product page with zero reviews will underperform vs. one with even 5–10 reviews.
**Who it affects:** All mobile and desktop shoppers arriving from ads
**Type:** Bigger conversion issue
**Effort:** Medium (requires customer outreach/review request campaign)
**Priority:** NOW
**Improves:** Trust, conversion rate, ad efficiency

---

### F-03 | CRITICAL | INFORMATION
**What:** Manufacturing lead time (4–8 business days) is buried inside the product description body text, not visible near the price or CTA
**Where:** /products/mens-rashguard-black — inside "Product description" tab, after the fabric specs
**Why it matters:** A shopper who adds to cart and only discovers at checkout (or after buying) that the item takes 4–8 days to ship before dispatch will leave a bad review or request a chargeback. For ad traffic, this is a conversion and refund risk. It needs to be clearly stated above the fold near the price.
**Who it affects:** All product page visitors, especially mobile (who may not scroll to read description)
**Type:** Conversion issue
**Effort:** Easy
**Priority:** NOW
**Improves:** Trust, conversion rate, post-purchase satisfaction

---

### F-04 | HIGH | BUG
**What:** Broken/missing product images on related products section and several product thumbnails
**Where:** Bottom of /products/mens-rashguard-black (related products: Uni Sex Grappling Shorts – Black, Women's Rashguard – Black both show blank grey boxes). Also: several thumbnail images in the product image sidebar appear dark/unreadable.
**Why it matters:** Missing images undermine professionalism and product confidence, especially for mobile shoppers.
**Who it affects:** All visitors viewing product pages
**Type:** Bug
**Effort:** Easy–Medium (image upload/resize fix)
**Priority:** NOW
**Improves:** Brand perception, conversion rate

---

### F-05 | HIGH | CONTENT
**What:** Size chart uses garment/product measurements, not body measurements. Centimeters only, no inches.
**Where:** /products/mens-rashguard-black — Product description tab, size chart table
**Detail:** Columns are "Back Middle Length", "Chest", "Sleeve Length", "Neck Width" — these are garment specs. A customer who is 180cm and 85kg has no idea what garment size to pick. No body measurement guide ("If your chest is X cm, choose size Y").
**Also:** An image that should show a visual size guide is broken (empty box in the description).
**Also:** Centimeters only — US and UK customers have to convert.
**Who it affects:** All shoppers, especially international ad traffic
**Type:** Medium improvement
**Effort:** Medium
**Priority:** NOW (sizing confusion = high return rate)
**Improves:** Conversion rate, product-page quality

---

### F-06 | HIGH | CONTENT
**What:** About page copy mentions "gis" and "spats" — products not sold and contradicting No-Gi positioning
**Where:** /pages/about — "From breathable rash guards to flexible shorts, spats, and gis..."
**Why it matters:** The store's brand is No-Gi grappling. Gi is a different discipline. Mentioning Gi products on the About page confuses brand positioning and signals generic copy-paste content.
**Also:** About page title says "About Laburu Grappling" — potential misspelling of "Lauburu" (the domain and logo use Lauburu; the About page uses "Laburu").
**Who it affects:** Brand-aware shoppers, ad landing page quality
**Type:** Content issue
**Effort:** Easy
**Priority:** SOON
**Improves:** Brand perception, ad-to-landing-page fit

---

### F-07 | HIGH | CTA
**What:** Hero CTA is generic — "Shop Now" with no specificity
**Where:** Homepage hero section
**Detail:** Headline is "EVERYTHING YOU NEED TO ELEVATE YOUR GRAPPLING JOURNEY" + subheadline "RAISE YOUR CONFIDENCE" + CTA "Shop Now". For cold paid traffic from a specific ad (e.g. "Rashguard ad"), landing on a generic "Shop Now" CTA doesn't maintain ad-to-page message match.
**Who it affects:** Paid ad traffic primarily
**Type:** Quick win / medium improvement
**Effort:** Easy
**Priority:** SOON
**Improves:** Ad efficiency, conversion rate

---

### F-08 | HIGH | TRUST
**What:** No announcement bar — missing opportunity for free shipping threshold, trust line, or promotional messaging
**Where:** Top of every page (absent)
**Why it matters:** An announcement bar ("Free shipping on orders over $X" or "Handmade in Australia" or "4-8 day dispatch") is one of the cheapest trust and conversion tools on Shopify. Its absence is a missed opportunity, especially for ad-driven traffic.
**Who it affects:** All visitors
**Type:** Quick win
**Effort:** Easy
**Priority:** SOON
**Improves:** Conversion rate, trust, ad efficiency

---

### F-09 | MEDIUM | UX
**What:** Shipping costs unknown until cart — no upfront shipping indicator on product pages
**Where:** /products/mens-rashguard-black — Shipping & Return tab says "Just add products to your cart and use the Shipping Calculator to see the shipping price"
**Why it matters:** Unexpected shipping costs at checkout are the #1 cart abandonment cause. For paid ad traffic, a shopper who clicks an ad, likes the product, but can't see shipping cost will frequently abandon rather than adding to cart just to find out.
**Who it affects:** All shoppers, especially mobile
**Type:** Conversion issue
**Effort:** Medium
**Priority:** SOON
**Improves:** Conversion rate, ad efficiency

---

### F-10 | MEDIUM | UX
**What:** Breadcrumb on product pages shows redundant "Home page" step
**Where:** All product pages — breadcrumb reads "Home › Home page › [Product Name]"
**Why it matters:** "Home page" is a redundant intermediate step. Standard breadcrumb should be "Home › [Collection] › [Product]". This looks unprofessional and suggests the product is not properly categorised.
**Who it affects:** Desktop shoppers
**Type:** Bug / quick win
**Effort:** Easy
**Priority:** SOON
**Improves:** Brand perception, navigation clarity

---

### F-11 | MEDIUM | PRODUCT
**What:** Digital products (Mindmap Library Access $5, Video Review Coaching $20, Weekly Coaching $15) appear mixed with physical products in /collections/all
**Where:** Collections/all — pages 2 and 3
**Why it matters:** A shopper browsing for rashguards or shorts encounters coaching services with service-infographic images. This breaks the shopping flow and dilutes the product catalog browsing experience. Digital and physical products should be separated.
**Also:** "Mindmap Library Access" at $5.00 looks like a placeholder/test price — unclear if this is intentional. If it is a real offering, it deserves its own landing page, not a product card.
**Who it affects:** All shoppers, especially ad-driven visitors landing on collections
**Type:** Medium improvement
**Effort:** Medium
**Priority:** SOON
**Improves:** Conversion rate, brand perception

---

### F-12 | MEDIUM | TRUST
**What:** No trust badges near Add to Cart button
**Where:** Product pages — between size selector and add-to-cart
**Detail:** No secure checkout badge, no satisfaction guarantee badge, no handmade/quality badge near the CTA. The "100% satisfied" return policy mentioned in the Shipping & Return tab is not surfaced anywhere near the buy button.
**Who it affects:** All shoppers, especially cold ad traffic
**Type:** Quick win
**Effort:** Easy
**Priority:** SOON
**Improves:** Trust, conversion rate

---

### F-13 | MEDIUM | PRODUCT
**What:** Product descriptions are purely technical specs with no emotional or benefit-oriented copy
**Where:** All physical product pages
**Detail:** The rashguard description is: fabric composition, stretch, sleeve length, slim fit, UV protection, print method, handmade note. No copy about how it feels in a roll, what problems it solves, why it's better than alternatives. For ad-driven traffic who arrive without brand awareness, technical specs alone don't close the sale.
**Who it affects:** Cold ad traffic
**Type:** Medium improvement
**Effort:** Medium
**Priority:** SOON
**Improves:** Conversion rate, product-page quality

---

### F-14 | MEDIUM | NAVIGATION
**What:** Navigation dropdowns are very minimal — only "MEN / WOMEN" under No-Gi Jiu Jitsu Apparel, no product type sub-navigation
**Where:** Main nav dropdown
**Detail:** A shopper looking specifically for rashguards or shorts has to browse the full collection. Adding sub-categories (Rashguards, Shorts, Hoodies, Accessories) under each gender would speed up product discovery.
**Who it affects:** Desktop shoppers
**Type:** Medium improvement
**Effort:** Medium
**Priority:** LATER
**Improves:** Conversion rate, mobile usability

---

### F-15 | MEDIUM | BRAND
**What:** No announcement bar or sticky bar showing the "handmade by our in-house team" differentiator
**Where:** Homepage, product pages
**Detail:** "Printed, cut, and hand-sewn by our in-house team" is a strong differentiator that is buried at the bottom of the product description. This should be a visible brand claim near the top of product pages or in an announcement bar.
**Who it affects:** All visitors
**Type:** Quick win
**Effort:** Easy
**Priority:** SOON
**Improves:** Brand perception, trust, conversion rate

---

### F-16 | LOWER | VISUAL
**What:** Homepage hero section has very limited content below the fold before the services section
**Where:** Homepage — between hero and "Our Services" section
**Detail:** After the hero, there's a product carousel section that requires scrolling with specific interaction to unlock (snap scroll behavior). The product section is not immediately visible on scroll. First-time visitors may leave before seeing any products.
**Who it affects:** All desktop and mobile visitors
**Type:** Conversion issue
**Effort:** Medium
**Priority:** LATER
**Improves:** Conversion rate

---

### F-17 | LOWER | CURRENCY
**What:** Store is set to AUD (AU) by default — international ad targeting would see AUD prices without clear currency labeling on product pages
**Where:** All product pages — prices shown as "$69.99" without "AUD" label
**Why it matters:** US, UK, European shoppers seeing "$69.99" may assume USD. When they reach checkout and see the actual converted price, they may abandon. Either label prices clearly as AUD or set up multi-currency.
**Who it affects:** International ad traffic
**Type:** Conversion issue
**Effort:** Easy–Medium
**Priority:** SOON (if running international ads)
**Improves:** Ad efficiency, conversion rate, trust

---

### F-18 | LOWER | VISUAL
**What:** Collection page (all products) is titled just "Products" — not descriptive or SEO-friendly
**Where:** /collections/all — page title
**Type:** Quick win
**Effort:** Easy
**Priority:** LATER
**Improves:** Brand perception, SEO

---

## DEVICE COVERAGE NOTES

| Device | Status |
|--------|--------|
| Mac desktop (1440px) | Directly verified |
| Windows desktop | Not verified — likely similar to Mac (inferred) |
| iPhone / iOS Safari | Not directly verified — likely risk areas: nav dropdowns, product image gallery, size selector touch targets, CTA button size |
| Android / Chrome | Not directly verified — similar risks to iOS inferred |

---

## OVERALL VERDICT

The store is functional but not ad-ready. The "[INSERT RETURN ADDRESS]" placeholder alone is a show-stopper that must be fixed before ad spend increases. Beyond that, the three biggest conversion risks for paid traffic are: (1) zero reviews, (2) manufacturing time hidden in description, and (3) shipping cost opacity. These three together will produce high CPAs and high return/complaint rates from ad traffic.

The brand identity is strong — the Lauburu symbol, the dark aesthetic, and the handmade positioning are genuine differentiators. The work is to surface those differentiators more effectively and remove the friction and trust gaps.

---

## PRIORITY SUMMARY

| Priority | Findings |
|----------|----------|
| NOW (blockers) | F-01, F-02, F-03, F-04, F-05 |
| SOON (high impact) | F-06, F-07, F-08, F-09, F-10, F-11, F-12, F-13, F-15, F-17 |
| LATER | F-14, F-16, F-18 |
