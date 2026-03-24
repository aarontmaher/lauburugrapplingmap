# AUTOMATION SUGGESTIONS INBOX
Unprocessed suggestions from Cowork and Claude Chat.
Code ingests these into AUTOMATION_SUGGESTIONS.md during its next review pass.

## Format
Each suggestion should include:
- Source: Cowork / Claude Chat / Aaron
- Description: what the suggestion is
- Category: UX / feature / content / workflow
- Status: pending (always — Code gates, Aaron approves)

## Pending Inbox

### COWORK-PASS-04 (fresh broad audit #3, 2026-03-24)
Source: Cowork fresh audit #3 (fresh-audit-3-2026-03-24.md)
Deduplicated against: AUTOMATION_SUGGESTIONS.md, AUTOMATION_NEXT.md (CW1-CW18, CC1-CC16), Already Shipped list.
Note: PASS-02 and PASS-03 items (CW19-CW32) were ingested and removed from pipeline. Re-submitting net-new items that aren't in current AUTOMATION_NEXT.md. Also flagging CW8 as shipped (Notes nodes are live).

| # | Suggestion | Source | Safety | Effort | Scope | Status |
|---|-----------|--------|--------|--------|-------|--------|
| CW19 | SHIPPED: Notes nodes distinctly styled (CW8) — italic, purple rgb(167,139,250), opacity 0.8. Confirmed live. Remove from Batch I. | Cowork | n/a | n/a | shipped | shipped |
| CW20 | BUG: Schema heading names don't match CLAUDE.md locked schema — "Transitions" should be "Offensive transitions" (all positions), "Retention" should be "Defence/Escapes" (attacker side, Turtle/Berimbolo), "Setups & Entries" should be "Setups/Entries". Affects 3 of 6 headings across every position. Needs OPML patch. | Cowork | safe — schema compliance | medium | bug | pending |
| CW21 | BUG: Duplicate "Mount" in Continue section — Mount appears twice in Continue buttons on Reference landing. Deduplicate so each position shows only once. | Cowork | safe — bug fix | easy | bug | pending |
| CW22 | BUG: Dominant Positions section header missing video count — Wrestling (32), Guard (57), Scrambles (9) all show video counts but DP shows only "6 positions · 236 techniques" with no count despite having positions with video indicators (★). | Cowork | safe — bug fix | easy | bug | pending |
| CW23 | Remove "Loading positions..." text after graph renders — div stays visible (display: block, opacity: 1) at bottom of graph canvas after nodes are present. Should hide once render completes. | Cowork | safe — cosmetic | easy | bug | pending |
| CW24 | "Create Account" value proposition — button is in header but no explanation of what an account enables vs. current localStorage. Add subtitle or tooltip: "Sync progress across devices" or similar. | Cowork | safe — additive | easy | UX | pending |
| CW25 | Learned/drilling counter visible in header bar — show "0 learned · 0 drilling" as small text near "994 TECHNIQUES". Currently only visible in tooltip or Dashboard. | Cowork | safe — additive display | easy | UX | pending |
| CW26 | FIND PATH inline instruction — when user clicks Find Path, show brief text: "Click a starting position, then click a destination." Clear after first use or 3 seconds. | Cowork | safe — tooltip only | easy | UX | pending |
| CW27 | Richer Build Your Game section — expand from one line ("You've been hitting mount") to show: current drill list (technique names), last success, one suggestion from graph data. Pull from existing localStorage. | Cowork | safe — read-only from existing data | medium | feature | pending |
| CW28 | Filter bar scroll indicator on mobile — buttons extend past 390px viewport with horizontal scroll (good!) but no visual hint that more buttons exist. Add subtle gradient fade on right edge. | Cowork | safe — CSS only | easy | UX | pending |
| CW29 | Update CLAUDE.md built-out count from 11 to 14 — live site now shows 14 starred positions (Side Control, Front Headlock, Reverse de la riva added). CLAUDE.md says 11. | Cowork | safe — docs update | easy | housekeeping | pending |
| CW30 | Progress bar label context on DP — bare "0%" next to Dominant Positions is confusing. Add tooltip or small label: "0% learned" or "0 of 236 learned". | Cowork | safe — cosmetic | easy | UX | pending |
