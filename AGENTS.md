# Multi-Agent Collaboration Guide

## Ownership Model

| Area | Owner | Scope |
|------|-------|-------|
| **Structural logic** | Codex | Account gating, visibility rules, menu IA, routing, operator-vs-public separation |
| **Presentation polish** | Claude Code | CSS, icons, typography, spacing, empty-state copy, keyboard help, interaction polish, resilience |
| **Product direction** | ChatGPT + Aaron | Feature decisions, classification, approval, prioritization |
| **UI audit** | Cowork | Visual clickthrough, mobile testing, screenshot evidence |
| **UX reasoning** | Claude Chat | Product analysis, user journey evaluation, onboarding assessment |

## Section Ownership in index.html

Major sections are marked with `<!-- SECTION: name [OWNER: agent] -->` comments.

| Section | Owner | Notes |
|---------|-------|-------|
| Control Centre structural logic | Codex | openAIOpsDashboard internals, gating, data flow |
| Control Centre presentation CSS | Claude Code | .ops-* styles, responsive rules, visual polish |
| Suggestion intake/routing logic | Codex | captureSuggestion, routeChat detection, suggestion modal |
| Suggestion queue/dashboard UI | Codex | openSuggestionDashboard, approval actions |
| Suggestion copy/labels/empty states | Claude Code | Text content, microcopy, placeholder messages |
| Menu/navigation structure | Codex | Menu items, visibility, ordering |
| Keyboard shortcuts + help panel | Claude Code | Key bindings, help panel content |
| Mobile tab bar + mobile views | Claude Code (presentation), Codex (logic) | CSS/icons = Claude Code, view rendering logic = Codex |
| Tutorial system | Claude Code | Steps, content, overlay |
| AI Coach | Shared | Claude Code owns coaching modes/copy, Codex owns structural routing |
| WHOOP readiness | Codex | Data layer, sync, AI integration |
| 3D graph | Claude Code | Three.js rendering, interactions, overlays |

## Parallel Work Rules

1. **Never edit main directly** for overlapping work. Use feature branches.
2. **Declare touched files/sections** before editing (use the Touch List template below).
3. **If both agents need the same file**, they must claim different sections.
4. **One integration step** before merging to main when work overlaps heavily.
5. **Presentation-only changes** (CSS, copy, icons) are always safe for Claude Code.
6. **Logic changes** (JS functions, data flow, conditionals) go to Codex unless clearly isolated.

## Touch List Template

Before starting work, declare:

```
TOUCH LIST
Agent: [claude_code / codex]
Branch: [branch name]
Scope: [logic / presentation / both]
Files touched:
  - index.html: [section names]
  - [other files]
Blockers: [none / list]
Safe to merge independently: [yes / no / needs integration]
```

## Merge Safety Checklist

Before merging a branch:
- [ ] npm run check passes (23+ smoke tests)
- [ ] No console errors on load
- [ ] Desktop 3-column layout intact
- [ ] Mobile stacking works
- [ ] No stale references to removed elements
- [ ] MCP work status updated
