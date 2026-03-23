# AUTOMATION SUGGESTIONS
Sources: Claude Chat UX audits + persona analysis + human-centered audit (2026-03-23/24)
Code gates technically, Aaron approves.

## Already Shipped This Session
Q1 OT rename, Q2 Want state, Q3 My Game tooltip, M4 Unexplored filter, video indicators, heading counts, empty headings dimmed, grouped menu, dev tools hidden, Position Map rename, graph labels all visible, success logging, search auto-expand, breadcrumb dedup, settings dismiss, filter count fix, untrack confirmation, share toast, notes warning, one-video-at-a-time, keyboard hint, hover feedback, connection card, section progress bars, label collision/nudging, mobile font/targets/indent, OT click-to-navigate, tap-to-deselect, note preview, two-tone progress bar, recently watched panel, graph render pause/resume, video landscape, scroll-to-top fix, video watched indicator.

## Pending Suggestions (not auto-approved)

### Product Direction — Needs Aaron

| # | Suggestion | Source | Safety | Effort | Status |
|---|-----------|--------|--------|--------|--------|
| P1 | Actionable home screen (show drills/last viewed/start training instead of blank collapsed sections) | Chat audit | safe | medium | pending — strongest product improvement identified across all audits |
| P2 | Surface Drill Timer/Circuit as "Start Training" on home screen | Chat audit | safe | medium | pending — needs placement decision |
| P3 | Beginner "Start Here" card on first visit | Chat audit | safe | medium | **APPROVED by Aaron** — content direction below |
| P4 | Difficulty tags (foundational/intermediate/advanced) | Chat audit | safe | medium | pending — needs Aaron classification |
| P5 | Simpler perspective labels ("When you have mount" / "When they have mount") | Chat audit | safe | medium | pending — Aaron's wording |
| P6 | Body font change (DM Mono → sans-serif) | Chat audit | safe | easy | pending — visual identity decision |
| P7 | One-line position descriptions ("Mount: on top of opponent's torso") | Chat audit | safe | medium | pending — needs Aaron content |
| P8 | Onboarding "What's your level?" flow | Chat audit | safe | medium | pending — changes app personality |
| P9 | Live footage browsing from app | Chat audit | safe | large | pending — infrastructure exists (574 folders) |

### Code Can Build (waiting for approval)

| # | Suggestion | Source | Safety | Effort | Status |
|---|-----------|--------|--------|--------|--------|
| C1 | Graph detail panel: show technique names under headings | Chat audit | safe | medium | pending |
| C2 | "Game map" — personalised graph overlay (tracked positions highlighted) | Chat audit | safe | medium | pending |
| C3 | Multi-hop path finder in graph | Chat audit | safe | large | pending |
| C4 | Edge direction indicators (arrows on graph) | Chat audit | safe | medium | pending |
| C5 | Interactive legend (click section name to filter graph) | Chat audit | safe | medium | pending |

## Aaron-Approved Feature Requests

### Success-Based Next-Move Recommendations
**Source:** Aaron | **Status:** prerequisite shipped (success logging). Next: game summary + recommendation engine.
1. ~~Success logging~~ — DONE (Session 07)
2. Successful-game summary — pending
3. Next-best-move engine — pending
4. Home-screen daily suggestion card — pending
5. Training vs competition split — later

### Game-Driven Daily Suggestions
**Source:** Aaron | **Status:** pending (depends on success logging — now shipped)
- Home-screen "Build your game" card
- Plain-English recommendations from success data + graph edges
- Recommendation types: next move, missing branch, neglected key move, likely finish

## Explicitly Avoid (from Claude Chat audit)

| Item | Reason |
|------|--------|
| Cross-device sync | Requires backend infrastructure — premature |
| AI-generated recommendations | Dilutes curation trust — use graph data instead |
| Curriculum / training plan builder | Hard to do well, easy to do badly |
| Social features / community metrics | Distraction from personal training tool |
| More keyboard shortcuts | 12 is already more than mobile users need |
| Push notifications | Will be immediately turned off |
| Light theme | Maintenance burden, dark is the identity |
| Instructor attribution | Not a multi-instructor platform |

## Rejected by Code

| Suggestion | Reason |
|------------|--------|
| Comparison view (side-by-side techniques) | Too complex for single-file app |
| Random Drill respects difficulty | Needs difficulty data (P4) first |
| Graph onboarding overlay | Graph already has hint text + "Position Map" |
| Granular skill states (reliable/A-game) | Changes core model, "Want" state already added |
