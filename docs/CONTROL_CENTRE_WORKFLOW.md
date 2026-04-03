# Control Centre Workflow

This workflow applies to all future GrapplingMap Control Centre changes.

## Ownership

- Codex owns structural logic, account gating, visibility rules, menu IA, and suggestion entry logic.
- Claude Code owns presentation-only polish: CSS, icons, help text, empty-state copy, typography, and spacing.

## Branch plan

- Codex logic branch: `codex/control-centre-logic`
- Claude polish branch: `claude/control-centre-polish`
- Short-lived integration branch: `codex/control-centre-integration`

## Editing rules

1. Codex works only on the logic branch.
2. Claude Code works only on the polish branch.
3. Before editing, each agent must declare:
   - touched files
   - touched sections
   - ownership lane (`logic` or `polish`)
4. If both agents touch `index.html`, ownership must be split by section:
   - `.cc-*` CSS polish block: Claude Code
   - Control Centre structural markup and JS logic blocks: Codex
5. Codex integrates both branches into `codex/control-centre-integration` before any move toward `main`.

## Required MCP status format

Shared MCP summaries for Control Centre work must include:

- owned scope
- touched files
- touched sections

Example:

`owned scope: logic; touched: index.html (Control Centre structural markup, switchToTab gating, suggestion composer entry points)`

## Integration checklist

1. Confirm Codex and Claude branches are both green on checks.
2. Cut `codex/control-centre-integration` from `main`.
3. Merge Codex logic branch first.
4. Merge Claude polish branch second.
5. Resolve only section-boundary conflicts.
6. Run site checks on the integration branch.
7. Only then open or update the PR toward `main`.
