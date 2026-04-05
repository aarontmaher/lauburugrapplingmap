# COWORK-NEW-FEATURES-AUDIT-01
**Date:** 2026-04-03
**Site audited:** https://aarontmaher.github.io/Chat-gpt/ (redirects to www.lauburugrapplingmap.com on hard refresh)
**Auditor:** Cowork (Claude)
**Method:** Full live click-through of every newly shipped feature
**MCP context read:** get_work_status, list_pending_suggestions, get_automation_state, get_handoff

---

## PLAIN ENGLISH SUMMARY

**What was checked:** Every feature listed in the latest handoff — C1 graph technique names, C2 game map overlay, C3 multi-hop path finder, C4 edge direction indicators, C5 interactive legend, Sparring Journal (CC14), Coach Mode (CC15), Custom Chains (CC16), Weekly Summary, Game Summary, Daily Suggestion card, and the full ⋮ menu structure.

**What was fixed:** Nothing — this is a find-and-report audit only.

**What Aaron needs to decide:** See each finding's "decision needed" flag. Two items need code fixes immediately (C3 path finder broken, domain data loss). One needs a product decision (whether the ⋮ menu should be scrollable or restructured).

**What to check on live site:** Open FIND PATH, type a position in search, click a node. The SELECT START... toolbar button should advance to SELECT END... — it currently doesn't.

---

## FEATURE CLICK-THROUGH CHECKLIST

| Feature | Entry point | Status | Notes |
|---------|-------------|--------|-------|
| C1 Graph detail panel (technique names) | Click any node | ✅ PASS | Names shown per heading, CONNECTIONS section works |
| C5 Interactive legend | Click section chip top-left | ✅ PASS | Toggle strikethrough + re-enables correctly |
| C2 MY MAP (game map overlay) | Bottom toolbar → MY MAP | ✅ PARTIAL | Works but no empty state message |
| C3 Multi-hop path finder | Bottom toolbar → FIND PATH | ❌ FAIL | Node click opens detail panel, never sets start |
| C4 Edge direction indicators | Visual inspection of edges | ⚠️ UNCLEAR | No arrowheads visible on edges from any angle |
| Weekly Summary | ⋮ menu → Weekly Summary | ✅ PASS | Modal with correct empty state |
| Game Summary | ⋮ menu → Game Summary | ✅ PASS | Bottom drawer with stats + position lists |
| Sparring Journal (CC14) | ⋮ menu → Sparring Journal | ✅ PASS | Form fields all present, minor date format question |
| Coach Mode (CC15) | ⋮ menu → Coach | ✅ PASS | TODAY'S FOCUS + GAME OBSERVATIONS showing |
| Custom Chains (CC16) | ⋮ menu → Chains | ✅ PASS | Bottom drawer, form works, empty state correct |
| Daily Suggestion card | REFERENCE tab (auto-shown) | ✅ PASS | TODAY'S FOCUS card shows in reference tab home |
| AI Ops Control Centre | Not found in standard UI | ⚠️ NOT VISIBLE | May be admin-only. Code is auditing separately. |
| SHARE button | Bottom toolbar | ✅ PRESENT | New button visible in position map toolbar |
| UNEXPLORED filter | REFERENCE tab bottom bar | ✅ PRESENT | New filter tab visible |
| NETWORK toggle | REFERENCE tab bottom bar | ✅ PRESENT | New button visible |

---

## FINDINGS — CRITICAL

---

### CRIT-01: Multi-hop path finder (C3) is non-functional on live

**Area:** Position map — FIND PATH toolbar button

**Repro steps:**
1. Go to Position Map tab
2. Click FIND PATH in the bottom toolbar
3. Toolbar button changes to SELECT START... and instructions appear: "Click a position to start the path"
4. Click any node in the 3D graph

**Expected:** Clicking a node sets it as the path start. Toolbar advances to SELECT END... and prompts for the destination node.

**Actual:** Clicking a node opens the normal graph detail panel (right side panel). SELECT START... does not advance. The path finder never captures the click — it is intercepted by the existing node selection handler first.

**Why it matters:** C3 is completely broken as shipped. The user cannot complete a single path query. The feature exists in the toolbar but cannot be used.

**Live vs repo:** Bug is live on both `aarontmaher.github.io` and `lauburugrapplingmap.com`.

**Fix needed by:** Code (not a content decision)

**Suggested fix:** In FIND PATH mode, the node click handler should be intercepted before the normal selection handler fires. The path finder click handler needs higher priority, or the normal click handler should check for path finder mode first and branch accordingly. Likely a one-line fix: check `if (pathFinderActive) { setPathStart(node); return; }` before the detail panel opens.

---

### CRIT-02: Domain mismatch causes silent data loss on custom domain

**Area:** `www.lauburugrapplingmap.com` vs `aarontmaher.github.io/Chat-gpt/`

**Repro steps:**
1. Use the site on `aarontmaher.github.io/Chat-gpt/` — build up drills, learned techniques, tracking
2. Do a hard refresh (Cmd+Shift+R)
3. Page redirects to `www.lauburugrapplingmap.com`
4. All progress data disappears — header shows "Start mapping your grappling game", no drill chips, no TODAY'S FOCUS, no technique counts

**Expected:** Data persists across both URLs, or the site uses one canonical domain only.

**Actual:** localStorage is domain-scoped. `github.io` and `lauburugrapplingmap.com` are separate origins and do not share localStorage. All progress is stored on the origin where it was created. A hard refresh triggers a redirect to the custom domain, where no data exists.

**Why it matters:** This is unacceptable for production. Any user who:
- Gets sent the custom domain link directly (lauburugrapplingmap.com)
- Hard refreshes on the github.io URL (which redirects to the custom domain)
- Switches between the two domains in any way

...will see a blank/fresh state. Their progress appears lost (it's still there on the other origin, but they have no way to know that).

**Live vs repo:** Live issue — both domains are deployed but not data-synced.

**Fix needed by:** Code (infrastructure decision)

**Suggested fix (options — Code to pick):**
1. Pick one canonical domain and disable the redirect. All links point to that domain only.
2. Implement a one-time data migration: on load, if localStorage is empty but the other origin's data exists (via postMessage/iframe trick), offer to migrate.
3. Move state from localStorage to Supabase (already set up) so it's domain-independent — longer term.

---

## FINDINGS — HIGH

---

### HIGH-01: FIND PATH exit is confusing — toggle model is non-obvious

**Area:** Position map — FIND PATH / SELECT START... button

**Repro steps:**
1. Click FIND PATH → button becomes SELECT START... (yellow)
2. To exit path finder mode, click SELECT START... again
3. The mode exits with no indication of cancellation

**Expected:** A clear Cancel or × button to exit path finder mode, or pressing ESC exits the mode.

**Actual:** Clicking SELECT START... again is the only documented exit. No Cancel label, no ESC support observed. Users who enter path finder mode by accident will not know how to exit.

**Why it matters:** Even if the path finder is fixed, the enter/exit UX is confusing. Users may feel "stuck" in path finder mode.

**Fix:** Add ESC support to exit path finder mode. Optionally rename SELECT START... to read "SELECT START... (or Esc to cancel)" or add a separate Cancel button next to it.

---

### HIGH-02: MY MAP has no empty state explanation

**Area:** Position map — MY MAP toolbar button

**Repro steps:**
1. Click MY MAP in the bottom toolbar
2. Graph nodes all dim to very low opacity

**Expected:** An overlay or message explaining what MY MAP shows and how to populate it (e.g. "Track techniques to build your game map"). Compare MY GAME which shows "No My Game techniques yet — Track techniques you're working on to build your game map."

**Actual:** All nodes dim silently. No explanation. No call to action. No distinction between "no data" and "this is working correctly."

**Why it matters:** From the user's perspective, the graph broke. There's no way to know this is an intentional empty state.

**Fix:** Add the same style of empty state that MY GAME has — a short message overlaid on the dimmed graph explaining what MY MAP shows and how to add to it.

---

### HIGH-03: MY GAME and MY MAP both highlight simultaneously (not mutually exclusive)

**Area:** Position map bottom toolbar

**Repro steps:**
1. Click MY GAME → it highlights yellow
2. Click MY MAP → MY MAP highlights yellow, MY GAME also stays highlighted yellow
3. Both buttons appear "active" at the same time

**Expected:** These are filter modes — selecting one should deactivate the other (radio button behaviour).

**Actual:** Both appear active simultaneously. The graph state under this dual-selection is unclear — it's showing something, but what combination of both filters is applied is ambiguous.

**Why it matters:** Confusing toolbar state. Users don't know what they're looking at when both are "active."

**Fix:** MY GAME and MY MAP should behave as a radio group — selecting one deactivates the other.

---

### HIGH-04: ⋮ menu is too long — critical features hidden below scroll

**Area:** ⋮ menu (top right) — full structure

**Repro steps:**
1. Click the ⋮ menu
2. Without scrolling, see: BROWSE (4 items) + TRAINING top items (My Drills, Random Drill, Drill Timer, Drill Circuit) + partial "Chains"
3. Sparring Journal, Coach, Game Summary, Dashboard, Export, Import are ALL hidden below the visible area

**Expected:** Key features like Coach, Sparring Journal, and Game Summary are accessible without scrolling a dropdown.

**Actual:** A user will not scroll a dropdown menu. Sparring Journal (CC14), Coach Mode (CC15), and Game Summary are de-facto invisible to first-time users.

**Why it matters:** All three of the main CC features are buried. A new user opening the menu sees "Random Drill, Drill Timer, Drill Circuit" — not the headline features.

**Code can build:** Yes — the menu needs restructuring or the TRAINING section needs to be split into a sub-section.

**Suggested fix:** Reorganise the menu. Options:
1. Group into two sections: Training Tools + Coaching & Progress (visible without scroll)
2. Add a dedicated "Coach" icon in the main toolbar alongside the robot icon
3. Surface Coach, Sparring Journal, and Game Summary as quick-action cards on the REFERENCE tab home state (alongside the existing TODAY'S FOCUS card)

---

## FINDINGS — MEDIUM

---

### MED-01: Sparring Journal date pre-fills in wrong format

**Area:** Sparring Journal — DATE field

**Repro steps:**
1. Open ⋮ menu → Sparring Journal
2. Observe the DATE field

**Expected:** For 2026-04-03 (today, April 3 2026), US format would show 04/03/2026.

**Actual:** DATE field shows 03/04/2026. This is either DD/MM/YYYY (European format — correct for April 3) or MM/DD/YYYY (US format — incorrect, showing March 4).

**Why it matters:** If this is a US-format date field showing March 4 instead of April 3, every logged session will be off by ~1 month. If European format is intentional, no bug — but the field should be labelled to clarify.

**Fix:** Verify date locale settings. If the app is intended for US users, ensure the date input uses MM/DD/YYYY and pre-fills with today's correct date (04/03/2026).

---

### MED-02: Sparring Journal shows no history of past sessions

**Area:** Sparring Journal modal

**Repro steps:**
1. Open Sparring Journal
2. Observe: modal immediately shows "No sessions logged yet" + the log form

**Expected:** After logging sessions, the modal should show a list of past sessions with the log form below (or accessible via a tab/button).

**Actual:** The modal only shows the empty state + log form. Once sessions are logged, it's not clear if/how past sessions are accessible or visible. There's no "history" tab or "view past sessions" button.

**Why it matters:** A journal where you can't read your past entries is not a journal.

**Fix:** Add a sessions list view above the log form (or in a tab) showing past session cards: date, mood emoji, rounds, partner, truncated notes.

---

### MED-03: Coach Mode and Today's Focus card give different recommendations simultaneously

**Area:** Coach Mode → TODAY'S FOCUS / REFERENCE tab → TODAY'S FOCUS card

**Repro steps:**
1. View REFERENCE tab — TODAY'S FOCUS card recommends "level change — Least recently drilled — time for a refresh"
2. Open ⋮ → Coach — TODAY'S FOCUS section recommends "Mount — A foundational dominant position — great starting point"

**Expected:** Both surfaces agree on the focus, or they label the difference clearly (e.g. "Technique focus" vs "Position focus").

**Actual:** Two different recommendations are shown simultaneously. A user seeing both will not know which to follow or why they differ.

**Why it matters:** Confusing when both are labelled "TODAY'S FOCUS" but show different things.

**Fix:** Either unify the recommendation logic, or label each distinctly: REFERENCE tab card = "Technique focus", Coach modal card = "Position focus."

---

### MED-04: "Suggest" button removed from AI Coach quick buttons — no visible replacement

**Area:** AI Coach panel — quick buttons

**Previous state:** AI Coach had a "Suggest" quick button visible in the panel that opened the NEW SUGGESTION modal.

**Current state:** Quick buttons are: What to drill?, Next move, Weak areas, Build session, My game, Connections, This week. No "Suggest" button.

**Why it matters:** The suggestion submission entry point is now even harder to find than before. Combined with the audit finding from COWORK-WEBSITE-CLICKTHROUGH-AUDIT-01 (suggestion modal crashes with renderResponse error), the suggestion system is now essentially inaccessible.

**Fix needed:** Either restore the Suggest quick button, or surface suggestion submission in the ⋮ menu.

---

### MED-05: C4 edge direction indicators not visually detectable

**Area:** Position map — 3D graph edges

**Repro steps:**
1. Load Position Map
2. Inspect edges (lines connecting nodes) from multiple camera angles and at multiple zoom levels
3. Look for arrowheads or directional indicators

**Expected (per handoff C4 "done"):** Edges show directional indicators (arrows) to communicate which position transitions flow to which destination.

**Actual:** All edges appear as plain undirected lines. No arrowheads or gradient indicators visible from default camera position or after rotating the graph.

**Why it matters:** If direction indicators exist but are invisible in practice, they provide no value. Users can't infer which direction a transition flows from the graph alone.

**Fix / verify:** Code to confirm whether C4 rendered arrowheads or a different indicator style (e.g. opacity gradient). If arrowheads: increase size so they're visible at default zoom. If gradient: check it's actually rendering correctly.

---

## FINDINGS — LOW

---

### LOW-01: Weekly Summary and Game Summary are two different features with similar purposes — distinction unclear

**Area:** ⋮ menu — TRAINING section (Weekly Summary) vs PROGRESS section (Game Summary)

**Observation:** Both features summarise training state. Weekly Summary says "No drill activity in the last 7 days." Game Summary shows tracked technique stats and strongest/building positions. Their names are similar and a new user would not know which to open for what purpose.

**Fix:** Add a one-line description under each menu item, or rename to make the scope clearer: "Weekly Summary" → "This Week's Activity" and "Game Summary" → "All-Time Progress."

---

### LOW-02: Close button inconsistency across new modals

**Area:** Modal patterns across new features

**Observation:**
- Weekly Summary: **Done** button only (no × in header)
- Coach Mode: × in header + no Done button
- Sparring Journal: × in header + no Save/Done
- Chains: × in header
- Game Summary: × in header

**Fix:** Standardise: all modals should have a × in the top-right header AND (where appropriate) a Done/Close button at the bottom. Currently inconsistent.

---

### LOW-03: Game Summary "6 want (0%)" label is ambiguous

**Area:** Game Summary drawer — TECHNIQUE STATS line

**Observation:** The stat reads "5 drilling (63%) · 3 learned (38%) · 6 want (0%)". The "0%" next to "want" is confusing — it's not clear if this means 0% of want-items have been started, or 0% of total techniques are in the want state.

**Fix:** Clarify: either remove the percentage from "want" entirely, or label it "6 want (not yet started)".

---

### LOW-04: SHARE button newly visible in position map toolbar — no audit of its behaviour

**Area:** Position map bottom toolbar — SHARE button (rightmost)

**Observation:** A SHARE button is now present in the toolbar. Clicking it was not tested in this audit.

**Action:** Code to verify SHARE copies the current URL with position hash to clipboard, and that a success toast fires.

---

## WHAT IS LIVE VS REPO-ONLY

| Feature | Live on github.io | Live on lauburugrapplingmap.com | Notes |
|---------|------------------|--------------------------------|-------|
| C1 graph technique names | ✅ | ✅ | Working on both |
| C5 interactive legend | ✅ | ✅ | Working on both |
| C2 MY MAP | ✅ | ✅ | Working on both |
| C3 path finder | ✅ (BROKEN) | ✅ (BROKEN) | Shipped but non-functional |
| C4 edge indicators | ✅ (invisible) | ✅ (invisible) | Shipped but not visually verifiable |
| Sparring Journal | ✅ | ✅ | |
| Coach Mode | ✅ | ✅ | |
| Custom Chains | ✅ | ✅ | |
| Weekly Summary | ✅ | ✅ | |
| Game Summary | ✅ | ✅ | |
| Daily Suggestion card | ✅ | ✅ | Shown in REFERENCE tab home |
| AI Ops Control Centre | ❓ | ❓ | Not accessible from standard user UI — may be admin-only |

---

## NAVIGATION GAPS — FEATURES NOT EXPOSED CORRECTLY

1. **Sparring Journal, Coach, Game Summary** — all hidden below scroll fold in the ⋮ menu. Need surfacing.
2. **AI Ops Control Centre** — no entry point in user-facing UI. If it's meant to be Aaron-only, it needs a clear admin path (URL parameter or separate login).
3. **Suggestion system** — "Suggest" button removed from AI Coach. No replacement. The suggestion system is now invisible to users.
4. **MY MAP explanation** — no on-surface guidance for what MY MAP shows or how to populate it.

---

## PRIORITY ORDER FOR FIXES

| Priority | Finding | Code or Product decision |
|----------|---------|--------------------------|
| 1 | CRIT-02: Domain data loss (github.io ↔ lauburugrapplingmap.com) | Code — pick canonical domain |
| 2 | CRIT-01: Path finder node click broken | Code — one-line handler fix |
| 3 | HIGH-04: ⋮ menu too long — key features buried | Code + product restructure |
| 4 | HIGH-03: MY GAME + MY MAP highlight simultaneously | Code — make radio group |
| 5 | HIGH-02: MY MAP no empty state | Code |
| 6 | HIGH-01: FIND PATH exit is unclear | Code |
| 7 | MED-04: Suggest button missing | Code — restore to AI Coach |
| 8 | MED-03: Dual TODAY'S FOCUS disagreement | Product decision then code |
| 9 | MED-02: Sparring Journal no history view | Code |
| 10 | MED-05: C4 indicators invisible | Code to verify + fix |
| 11 | MED-01: Date format | Code |
| 12 | LOW-01 to LOW-04 | Small polish fixes |

---

Export triggered: no
Reason: audit only — no Mindomo edits made

-- FROM: COWORK
