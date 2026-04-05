# COWORK-WEBSITE-CLICKTHROUGH-AUDIT-01
**Date:** 2026-04-03
**Site:** https://aarontmaher.github.io/Chat-gpt/
**Auditor:** Cowork (Claude)
**Method:** Full manual click-through — acting as both first-time user and power user

---

## PLAIN ENGLISH SUMMARY

**What was checked:** Every major surface of the GrapplingMap site — landing state, 3D graph, search, reference panel, keyboard shortcuts, WHOOP integration, the suggestion submission flow, and the suggestion dashboard.

**What was fixed:** Nothing yet. This is a find-and-report audit only. No edits made.

**What Aaron needs to decide:** See the Fix column on each finding. Three bugs need code changes. One is critical (the Submit button crashes silently). One is a discoverability decision (how buried the suggestion system should be).

**What to check on the live site:** After fixes are applied, submit a test suggestion and confirm the modal closes with a success message.

---

## OVERALL VERDICT

The core app is demo-ready. The 3D graph loads, rotates, and responds to clicks. The reference panel populates correctly. Search works. Filters persist. WHOOP paste works. The keyboard shortcut system is solid.

**The suggestion system is the only broken surface.** It saves data but gives zero feedback and leaves the modal open. For a feature meant to collect user input, this is unusable as-is.

There are also two secondary UX issues (ESC stacking, search/filter mismatch) worth fixing before a demo.

---

## FINDINGS

---

### FINDING 01 — CRITICAL
**Title:** Submit button throws JS error — modal freezes open, no success or error shown

**Area:** Suggestion submission modal (NEW SUGGESTION)

**Severity:** Critical — the primary user action in this flow fails silently from the user's perspective

**Repro steps:**
1. Click the robot icon (AI Coach) in the top-right toolbar
2. Click the "Suggest" quick button in the coach panel
3. The "NEW SUGGESTION" modal opens
4. Type any text in the textarea
5. Click Submit

**Expected:** Modal closes. A success message appears (e.g. "Thanks! Your suggestion was saved.").

**Actual:** Modal stays open. Nothing visible happens. In the browser console: `ReferenceError: renderResponse is not defined` fires at line 8446. The suggestion IS written to Supabase (confirmed by checking the dashboard afterward) — but the post-write handler crashes before it can close the modal or show feedback.

**Why it matters:** From a user's perspective, nothing worked. They'll either submit multiple times (causing duplicates) or assume the feature is broken and give up. It's the worst kind of failure — silent, with no recovery path shown.

**Suggested fix:** In the Submit button click handler, after the Supabase insert succeeds:
- Close the modal (or clear and hide it)
- Show a short inline success message: "Suggestion saved — thanks!"
- Remove or replace the `renderResponse()` call if that function no longer exists in scope, or define it

---

### FINDING 02 — HIGH
**Title:** Suggestion submission is buried — not discoverable without prior knowledge

**Area:** Suggestion system — discoverability

**Severity:** High — first-time users will never find this

**Repro steps (as a new user):**
1. Load the site
2. Look around the toolbar, position rows, technique items, and footer
3. Try to find a "suggest", "feedback", or "report" button anywhere obvious

**Expected:** A clear entry point — e.g. a "Suggest" or "Feedback" button in the nav or a "+" button on technique rows.

**Actual:** There is no visible suggest button. The only path is:
1. Notice the robot icon in the top-right (no label, no tooltip on first load)
2. Click it to open the AI Coach panel
3. Notice the "Suggest" quick-button inside the coach panel
4. Click it to open the submission modal

That's two non-obvious clicks behind an unlabelled icon. A real user doing their first session will never do this.

**Why it matters:** If you want real feedback from users, the entry point needs to be findable. Right now this is effectively invisible.

**Suggested fix (options — Aaron to decide):**
- Add a small "Suggest +" link in the footer or toolbar with a label
- OR add a tooltip/label to the robot icon ("AI Coach & Feedback")
- OR add a "Suggest improvement" option to the right-click / long-press context menu on technique rows (so it appears naturally while browsing)

---

### FINDING 03 — HIGH
**Title:** ESC key dismisses reference panel instead of the foreground modal (shortcuts overlay)

**Area:** Keyboard navigation — ESC key stacking

**Severity:** High — breaks keyboard navigation for users who use ? to see shortcuts

**Repro steps:**
1. Click any canonical position in the 3D graph (e.g. Mount) — reference panel opens on the right
2. Press `?` to open the keyboard shortcuts help modal
3. Press `ESC`

**Expected:** ESC dismisses the shortcuts modal (the topmost layer). Reference panel stays open.

**Actual:** ESC fires at the graph level first. It dismisses the reference panel (deselects the node / zooms out). The shortcuts modal stays open. A second ESC press has no effect on the modal — it is now stuck open. The user must click elsewhere or find the close button manually.

**Why it matters:** Power users who discover shortcuts will hit this immediately. It breaks the expected layering of modals and feels like a bug.

**Suggested fix:** ESC key handler should check for any open modal overlay first and dismiss it before acting on the graph layer. The shortcuts modal (and any other overlay) should capture ESC and call `stopPropagation()` so the graph-level handler never fires.

---

### FINDING 04 — MEDIUM
**Title:** Search returns 0 results in DETAILED filter mode for valid user content

**Area:** Search — interaction with active filter

**Severity:** Medium — confusing empty state with no explanation

**Repro steps:**
1. In the position map (reference view), activate the DETAILED filter (or MY GAME / DRILLING / LEARNED)
2. Type a technique name that exists in your own marked content (e.g. "level change")
3. Observe the search results panel

**Expected:** Search finds techniques matching the query, regardless of current filter, or clearly explains that the filter is limiting results.

**Actual:** "No results for 'level change'" — even if that technique is in the user's drills. Search appears to be scoped to the active filter view, so techniques outside the filtered set are invisible.

**Why it matters:** Users searching for something specific will assume it doesn't exist in the map. The empty state message gives no indication that switching the filter off would surface results. This is a silent data-loss perception problem.

**Suggested fix:** Either:
- Search across all content regardless of active filter, and indicate in the result which filter/section it lives under
- OR when search returns 0 results, add a secondary message: "Try clearing the filter — some results may be hidden"

---

### FINDING 05 — MEDIUM
**Title:** No empty state explanation when suggestion dashboard has no suggestions

**Area:** Suggestion dashboard

**Severity:** Medium — confusing for first-time dashboard visitors

**Repro steps:**
1. Open the suggestion dashboard (if accessible before any suggestions are submitted)
2. Or open a filtered tab (e.g. DEFERRED) that has no cards

**Expected:** A clear "No suggestions yet" or "Nothing deferred" message in the empty area.

**Actual:** The tab content area is blank. No message explains whether the filter is empty, whether data hasn't loaded, or whether there's an error.

**Why it matters:** A blank dashboard looks broken. Users (and Aaron triage-ing suggestions) can't tell if the filter is working or if something failed to load.

**Suggested fix:** Add a minimal empty state per tab: "No [status] suggestions" with a small icon or muted text. One line is enough.

---

### FINDING 06 — LOW
**Title:** AI Coach robot icon has no visible label or tooltip

**Area:** Toolbar — AI Coach button

**Severity:** Low — minor discoverability issue, especially on first load

**Repro steps:**
1. Load the site fresh
2. Look at the toolbar icons in the top-right

**Expected:** Hovering the robot icon shows a tooltip ("AI Coach", "Get training advice", or similar).

**Actual:** No tooltip. No label. The icon is recognisable as a robot, but its function is not stated anywhere until you click it.

**Why it matters:** For a demo to a new audience, unexplained icons create hesitation. Combined with Finding 02 (the suggestion system is hidden behind this icon), this makes the whole feedback loop invisible.

**Suggested fix:** Add a `title` attribute or CSS tooltip on the button: "AI Coach + Suggestions". Five words, zero implementation cost.

---

### FINDING 07 — LOW
**Title:** Suggestion photo attachment — no visible feedback on image count or file validation

**Area:** NEW SUGGESTION modal — photo attachment

**Severity:** Low — edge case, but could confuse users trying to attach screenshots

**Repro steps:**
1. Open the NEW SUGGESTION modal
2. Click "Attach photos"
3. Select more than 3 images

**Expected:** After selection, a count badge appears ("3/3 attached") and files beyond the limit are rejected with a message.

**Actual:** The button text says "Max 3 images, compressed to 800x600" but there's no visible count indicator after attaching, and behavior when exceeding the limit is unclear without a real test submission.

**Why it matters:** Users attaching bug screenshots won't know if their images registered. If the 3-image cap is enforced silently, they may lose attachments without knowing.

**Suggested fix:** After file selection, update the button label to show count: "3 photos attached ✓". If limit exceeded, show inline: "Maximum 3 images — first 3 kept."

---

## WINS (things that work well)

- **3D graph loads fast and is visually impressive.** Auto-rotation on load, stops on interaction — correct and satisfying.
- **Node click → reference panel** works reliably. Content populates correctly for built-out positions (Mount, Turtle, Back Control all tested).
- **Search is fast and accurate.** Typing "mount" selects Mount instantly and scrolls the panel.
- **Keyboard shortcuts (/  T  ?  G  Esc  arrows)** are all functional and the `?` help modal is well-formatted.
- **WHOOP JSON paste modal** works — clear instructions, correct entry point in the coach panel.
- **Filter persistence** — DRILLING / LEARNED / MY GAME state persists across page interactions via localStorage.
- **Suggestion dashboard** renders cards correctly, classification labels are visible, Defer action fires and moves the card.
- **Supabase write actually works** despite the JS error — suggestion data is saved correctly.
- **Progress dots / tracking system** works — clicking T opens the tracker panel correctly.

---

## PRIORITY ORDER FOR FIXES

| Priority | Finding | Action |
|----------|---------|--------|
| 1 | Finding 01 — Submit crash | Fix `renderResponse` error, close modal, show success message |
| 2 | Finding 03 — ESC stacking | Modal ESC should stop propagation before graph-level handler |
| 3 | Finding 02 — Discoverability | Add tooltip to robot icon + one visible "Suggest" entry point |
| 4 | Finding 04 — Search + filter | Add hint to empty state: "try clearing the filter" |
| 5 | Finding 05 — Dashboard empty state | Add per-tab "No [status] suggestions" message |
| 6 | Findings 06–07 | Minor tooltip + photo count polish |

---

## SIGN-OFF

Export triggered: no
Reason: audit only — no Mindomo edits made

-- FROM: COWORK
