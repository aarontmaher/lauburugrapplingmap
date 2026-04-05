# COWORK-CODE-REQUIREMENTS-UNBLOCK-01
## Non-Code Requirements — Unblocker Report
Generated: 2026-03-31

---

## PHASE 1: Supplier Size Charts (Shopify)

**Status:** BLOCKED — waiting on Aaron

**What Code needs:** HTML size guide files for 4 product categories so descriptions can be pushed via the existing `update-descriptions.sh` pipeline.

**What exists today:** `product-mapping.json` already documents every blocked product with the exact reason. The update script, mapping file, and README are all ready in `~/Shopify/`. Existing approved products (men's rashguards, joggers, fleece shorts, flip-flops, bags) already have HTML files at `~/Desktop/shopify-size-guides/product-descriptions/`.

**Products missing size data (from product-mapping.json "skipped" list):**

| Product Category | Shopify Handles | Reason |
|---|---|---|
| Women's Rashguard | `women-rashguard-red`, `womens-rashguard-black`, `womens-rashguard-blue`, `womens-rashguard-brown`, `womens-rashguard-purple`, `womens-rashguard-white` (6 products) | No women's rashguard size guide exists. Needs measurements from supplier. |
| Hoodie | `oversize-fleeced-hoodie-1`, `oversize-fleeced-hoodie` (2 products) | No hoodie size guide exists. Needs measurements from supplier. |
| T-Shirt | `sorona-quick-dry-cooling-t-shirt`, `sorona-quick-dry-cooling-t-shirt-1` (2 products) | No t-shirt size guide exists. Needs measurements from supplier. |
| Men's Shorts | `grappling-no-gi-shorts` (1 product) | Men's grappling shorts — no size guide exists. Needs measurements from supplier. |

**Also pending Aaron confirmation:**

| Product | Handle | Question |
|---|---|---|
| Coloured Fleece Joggers | `coloured-unisex-heavyweight-fleece-joggers` | Same sizing as plain joggers? If yes, can reuse `04-fleece-joggers.html`. |
| Coloured Fleece Shorts | `coloured-unisex-heavyweight-fleece-loose-fit-shorts` | Same sizing as plain shorts? If yes, can reuse `05-fleece-shorts.html`. |
| Uni Sex Grappling Shorts | `female-grappling-shorts-black-copy-copy` | Same sizing as "Grappling Shorts - Black" (women's 2-in-1)? |
| Men's White Rashguard | `mens-rashguard-white` | Needs `01-rashguard-white.html` created (presumably same as other men's rashguard guides). |

**What Aaron needs to do:**
1. Get size chart measurements from suppliers for: women's rashguard, hoodie, t-shirt, men's shorts.
2. Confirm whether coloured joggers/shorts use the same sizing as their plain versions.
3. Confirm unisex grappling shorts sizing.
4. Once measurements arrive: Code creates HTML files and adds them to `product-mapping.json`.

---

## PHASE 2: Supabase Email Confirmation

**Status:** DOCUMENTED — Aaron action needed for production

**What Code needs:** Aaron to toggle one setting in the Supabase production dashboard before Batch 3 (auth integration) goes live.

**Current state:**
- Local config (`supabase/config.toml` line 205): `enable_confirmations = false`
- This means users can sign up without verifying their email address.
- For production, this should be `true` so users must confirm their email before accessing member features.

**What exists today:**
- Full data model designed in `ACCOUNTS_PLAN.md` (5 tables: profiles, user_progress, user_notes, success_log, user_preferences).
- Auth flow fully specified (guest → member boundary, migration strategy from localStorage).
- Batches 1-2 (UserStore abstraction + guest/member gating UI) have zero blockers and can start now.
- Batch 3 (actual Supabase wiring) is blocked on Aaron.

**Batch 3 blockers (all Aaron):**

| What | Where | Notes |
|---|---|---|
| Create Supabase project | supabase.com dashboard | Free tier is fine for now |
| Provide project URL | To Code | Looks like `https://xxxxx.supabase.co` |
| Provide anon key (public) | To Code | Safe to commit — it's the public key |
| Run SQL migrations | Supabase SQL editor | Tables + RLS policies from ACCOUNTS_PLAN.md |
| Toggle email confirmation ON | Auth settings in dashboard | `Authentication → Settings → Email Auth → Confirm email = ON` |

**What Aaron needs to do:**
1. Create a Supabase project (free tier).
2. Share the project URL and anon key with Code.
3. Run the SQL from ACCOUNTS_PLAN.md section 2 in the SQL editor.
4. Turn on email confirmation in the auth settings.

---

## PHASE 3: GrapplingMap Decisions

**Status:** Aaron decisions needed

### A. Guard Offensive Transitions (OT) Content

**Context:** 16 out of 19 Guard positions have zero OT lines. Only Half Guard Passing and Reverse de la riva currently have edges. The 3D graph needs these to show connections between Guard positions and destinations.

**What Aaron needs to provide (for each position he wants connected):**
- Format: `"Context label → ExactCanonicalNodeName"`
- Example: `"Half guard passing to mount (knee slide) → Mount"`

**Positions needing OT content (16):**
Shin pin, Supine Guard, J point, Closed Guard, Headquarters, Quarter guard, Butterfly guard, Half butterfly, Knee shield half guard, K guard, De la riva, Butterfly ashi, Outside ashi, X guard, Single leg X, Seated Guard

**Aaron action:** Pick which positions to add transitions for first, then provide the context label + destination for each.

### B. Saddle Canonical Name

**Current status:** TBD / Hold. "Saddle" is not yet canonical (no perspective layer).

**Aaron action:** Decide the canonical name. Options: "Saddle", "Ashi garami", "Inside sankaku", or something else. Once decided, Code adds perspective layers and it enters the graph.

### C. Belt Syllabus Selections

**Context:** ACCOUNTS_PLAN.md mentions "White/Blue belt syllabus (full)" as a member feature.

**Aaron action:** Decide which techniques belong in each syllabus tier. This can be done later — it's not blocking any current Code work, but worth capturing.

---

## SUMMARY — WHO DOES WHAT

### Aaron's checklist (ordered by priority):

1. **Supabase project** — Create project, share URL + anon key, run SQL, enable email confirmation. (Unblocks Batch 3 of accounts system.)
2. **Size chart measurements** — Get from suppliers for women's rashguard, hoodie, t-shirt, men's shorts. (Unblocks 11 product descriptions.)
3. **Sizing confirmations** — Are coloured joggers/shorts same as plain? Is unisex shorts same as women's 2-in-1? Is men's white rashguard same as other colours? (Unblocks 4 more products.)
4. **Guard OT labels** — Provide context labels for Guard positions to connect in the 3D graph. (Unblocks graph density.)
5. **Saddle name** — Pick canonical name when ready. (Low priority, hold is fine.)
6. **Belt syllabus** — Select techniques per tier when ready. (Future, not blocking.)

### Code can start now (no blockers):

- Accounts Batch 1: UserStore abstraction (zero risk, zero dependencies)
- Accounts Batch 2: Guest/member gating UI (behind AUTH_STATE flag)
- Men's white rashguard HTML: copy existing men's rashguard template if Aaron confirms same sizing

### Nothing for Cowork to do (retired for structural work).

---

-- FROM: COWORK
