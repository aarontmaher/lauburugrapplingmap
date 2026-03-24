# AUTOMATION SUGGESTIONS TRIGGER
Tracks when a new suggestion pass is needed after repo updates.

## Current State
- last_repo_update: 2026-03-24
- suggestion_pass_needed: no
- suggestion_pass_completed: 2026-03-24 (COWORK-PASS-01)
- items_added: 34 (18 Cowork + 16 Claude Chat)

## How It Works
1. Code commits/pushes a meaningful update → writes `suggestion_pass_needed: yes` here
2. Aaron sees this (or Cowork/Chat checks at session start) → runs suggestion pass
3. Suggestions go into AUTOMATION_SUGGESTIONS_INBOX.md
4. Code ingests inbox into AUTOMATION_SUGGESTIONS.md / AUTOMATION_NEXT.md
5. This file is reset to `suggestion_pass_needed: no`
