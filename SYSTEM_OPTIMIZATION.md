# SYSTEM OPTIMIZATION
Last updated: 2026-03-23

## Active Systems
- **OPML pipeline**: grappling.opml → opml_to_sections.py → index.html (stable)
- **Playwright**: 12 smoke + 3 snapshot tests, npm run ready = deploy gate
- **PWA**: manifest.json, sw.js, installable
- **Keyboard Maestro**: active automation system
- **Auto-merge**: claude/** PRs via GitHub Action
- **Live footage**: INBOX + ffmpeg + classification memory (25 entries) + placement rules
- **Shared memory**: 6 files + zip bundles + auto-open Finder on upload

## Website Improvement Loop
Active and running via prompt-driven iterations. 4 batches completed this session covering mobile UX, search, video modal, and interaction polish. Validated with Playwright after each batch.

## Next Improvements
1. **Website/app** (default priority): position-level quick actions, technique detail expansion, progress dashboard polish
2. **Automation**: Playwright mobile scenarios, fix pre-existing canvas test
3. **Video understanding**: first keyframe-based classification test
4. **Content** (input-limited): Guard OT lines, OPML patches — only when Aaron supplies content

## Two Automation Tracks

### Track A: Live Footage / Video Understanding
- **Scope**: ~/GrapplingMap/live-footage/ only
- **Tools**: INBOX, review-inbox.sh, ffmpeg, video-classification-memory.json
- **Does NOT touch**: grappling.opml, index.html

### Track B: Website / App Improvement
- **Scope**: index.html frontend only
- **Tools**: Playwright for validation
- **Does NOT touch**: grappling.opml, live-footage, taxonomy
- **Guardrails**: No broad refactors, no content changes
