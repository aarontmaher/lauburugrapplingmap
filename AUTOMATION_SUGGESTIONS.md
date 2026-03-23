# AUTOMATION SUGGESTIONS
Sources: Claude Chat human experience review + live site UX audit (2026-03-23)
Code gates technically, Aaron approves.

## Already Done (no action needed)
| Suggestion | Notes |
|------------|-------|
| Fix "0 Total" bug | headerStats hidden for new users |
| Hide empty headings | display:none when realChildren=0 |
| Confirm before Reset | Uses confirm() dialog |
| Video indicators inline | 4px orange dot exists (could be larger) |
| Empty state for MY GAME filter | Already shows guidance text in both views |
| Auto-rotate stops on interaction | Already stops permanently on user touch/mouse |

## Accepted — Ready for Next Automation Batch

### Batch A: Search + Breadcrumb + Settings (easy, safe, high impact)
| # | Suggestion | Source | Effort | Assessment |
|---|-----------|--------|--------|------------|
| A1 | Search auto-expands sections with results | Audit #1 | easy | Sections uncollapse on search (line 1920) but inner tree-items stay collapsed. Fix: also uncollapse ancestor tree-items of matches. |
| A2 | Breadcrumb dedup — remove repeated section name | Audit #5 | easy | `segments` includes section twice (key starts with section). Skip first segment if it matches the second. |
| A3 | Settings panel dismiss on click outside | Audit #6 | easy | Standard popover pattern. Add document click listener. |
| A4 | ✎ note button tooltip ("Add notes") | Audit #9 | easy | Already has `title="Add note"` but may not show on mobile. Verify. |

### Batch B: Headings + Labels (easy-medium, safe, medium-high impact)
| # | Suggestion | Source | Effort | Assessment |
|---|-----------|--------|--------|------------|
| B1 | Schema headings: show technique count badge | Chat #2, Audit #7 | easy | Add "(N)" count after heading name. Dim if 0. |
| B2 | Larger video indicator (6px dot or ▶ text) | Chat | easy | Increase .has-video::before from 4px to 6px. |
| B3 | Keyboard shortcut hint in bottom bar ("Press ? for shortcuts") | Audit #12 | easy | Show once, dismiss on first ? press. |

### Batch C: Menu + Dev hiding (medium, safe)
| # | Suggestion | Source | Effort | Assessment |
|---|-----------|--------|--------|------------|
| C1 | Group hamburger menu into sections with dividers/labels | Chat #3 | medium | Add Training/Browse/Progress/System labels. |
| C2 | Hide Content Readiness + Diagnostics behind ?dev=1 | Chat #4 | easy | Check URL param, only show if present. |

## Pending Aaron Review (not auto-approved)
| # | Suggestion | Source | Effort | Notes |
|---|-----------|--------|--------|-------|
| P1 | Rename "Network" → "Position Map" | Chat #7 | easy | Changes visible tab name. Aaron's call. |
| P2 | Show recently viewed chips on home screen | Chat #5 | medium | UX direction decision. |
| P3 | "Start Training" button on home screen | Chat #13 | medium | Changes app personality. Needs Aaron. |
| P4 | Simplify graph Settings (hide advanced) | Chat #8 | easy | Aaron may want all visible. |
| P5 | Replace emoji video buttons with text/SVG | Chat #9 | easy | Visual change. Aaron's preference. |
| P6 | Position-level progress % in Reference tree | Chat #10 | easy | Partially exists in stats bar. |
| P7 | Interactive legend in Network view | Audit #13 | medium | Clicks legend to filter by section. |
| P8 | Track state: direct selection vs cycling | Chat #16 | medium | Changes core interaction. |

## Rejected by Code
| Suggestion | Reason |
|------------|--------|
| Default perspective expanded/merged | Changes locked schema structure |
| Video thumbnails | Requires YouTube API, large effort, performance risk |
| Training history timeline | New feature, needs design from Aaron |
| Fix "0 Total" | Not a real bug |
| "Transitions: 0" distinction | Data completeness issue, not UX fix |
