# AUTOMATION SUGGESTIONS
Sources: Claude Chat UX audits + persona analysis (2026-03-23)
Code gates technically, Aaron approves.

## Quick Wins — Code Recommends (safe, easy, in-scope)

| # | Suggestion | Source | Effort | Assessment |
|---|-----------|--------|--------|------------|
| Q1 | Rename "Offensive transitions" display to "Transitions" or "Where this leads" | B5 | easy | Just a label change in SCHEMA_NAMES display. Doesn't change data. |
| Q2 | Add "Want to learn" bookmark state (None → Want → Drilling → Learned) | X6 | easy | Add one more state to the cycle. Stored in localStorage. |
| Q3 | "My Game" filter: add explanation tooltip | I3 | easy | Add title="Techniques marked Drilling or Learned" to the filter button. |
| Q4 | "Explore More" rename to "Find Gaps" or just show items directly | I1/H9 | easy | Already listed in menu. Rename label. |
| Q5 | Graph detail panel: show actual technique names under headings, not just counts | I9 | medium | Expand the heading rows in the detail panel to list techniques. |

## Medium Effort — Worth Doing If Aaron Approves

| # | Suggestion | Source | Effort | Assessment |
|---|-----------|--------|--------|------------|
| M1 | Beginner "Start Here" card on first visit | B1 | medium | Welcome card with 5 fundamental positions. Needs Aaron to pick which 5. |
| M2 | Difficulty tags (beginner/intermediate/advanced) on positions | B2/B6 | medium | Needs Aaron to classify positions. Code can build the filter once classified. |
| M3 | Simpler perspective labels ("When you have mount" / "When they have mount") | B3 | medium | Visual change to how perspectives render. Aaron's call on wording. |
| M4 | "Unexplored" filter (show untracked techniques) | I1 | easy | Inverse of My Game filter. Show techniques with no progress status. |
| M5 | Technique chain builder / flowchart from OT data | I4 | large | Needs design. OT data exists but no chain UI. |
| M6 | "Game map" — personalised subgraph overlay | A8 | medium | Filter graph to show only tracked positions/edges. Data exists. |
| M7 | Daily suggestion on home screen | X5 | medium | Pick a random undrilled technique, show as card. |

## Needs Aaron's Direction (feature/product decisions)

| # | Suggestion | Source | Notes |
|---|-----------|--------|-------|
| F1 | Onboarding "What's your level?" flow | X1 | Changes app personality. Aaron decides. |
| F2 | Learning curriculum / "White belt fundamentals" | B7 | Needs content curation from Aaron. |
| F3 | Opponent preparation feature | A2 | New feature category. |
| F4 | Sparring log / match tracking | I6 | New feature, changes scope. |
| F5 | Statistical tracking (technique success rates) | A3 | New data model. |
| F6 | Live footage browsing from app | A9 | Infrastructure exists (574 folders). Needs YouTube integration. |
| F7 | Alternative views (by situation, by system) | X3 | Fundamental UX change. |
| F8 | Multi-hop path finder in graph | A1 | Algorithmic feature. Medium-large effort. |
| F9 | Body font change (DM Mono → sans-serif) | X7 | Visual identity decision. Aaron's call. |
| F10 | Granular skill states (drilling/unreliable/reliable/A-game) | I7 | Changes core tracking model. |
| F11 | Edge annotations (notes on transitions) | A5 | New data model. |
| F12 | Instructor attribution on videos | X4 | Needs data from Aaron. |

## Aaron-Approved Feature Request

### Success-Based Next-Move Recommendations
**Source:** Aaron
**Safety:** safe | **Effort:** medium/large | **Scope:** in-scope | **Status:** pending

**Intent:** Move beyond static reference/tracking. Use real success data to recommend highest-connected next moves.

**Feature shape:**
1. One-tap "Log success" / "Hit this" on technique detail
2. Optional context: training / comp
3. Success counts stored in localStorage
4. Dashboard section: "Your successful game" (top positions, top techniques, themes)
5. Recommendation: "Next best move to add" based on graph edges + success frequency
6. Example: "You often hit Toreando from J point. Next best addition: North South pass"

**Implementation order:**
1. Add success logging
2. Add success counts in local data
3. Add "common successful themes" section
4. Add "next highest connected move" suggestions
5. Later: training vs competition split

## Rejected by Code

| Suggestion | Reason |
|------------|--------|
| Social proof / community stats | Out of scope — no backend |
| Cross-device sync | Requires server infrastructure |
| Push notifications | PWA notifications need HTTPS + service worker upgrade |
| Comparison view (side-by-side techniques) | Too complex for single-file app, marginal value |
| Random Drill respects difficulty | Needs difficulty data (F2) first |
| Graph onboarding overlay | Graph already has hint text + "Position Map" rename helps |
