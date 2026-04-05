# MINDMAP-AUDIT-COWORK-01 — Full Product & Usability Audit

**Audited:** GrapplingMAP — https://aarontmaher.github.io/Chat-gpt/
**Date:** 2026-04-03
**Auditor:** Cowork (automated UX pass)

---

## What Feels Strong

- **The 3D Position Map is genuinely impressive.** The rotating graph with color-coded categories, weighted node sizes, and connecting edges creates a visceral "wow" moment. It communicates the scope and interconnectedness of grappling positions better than any flat list could.
- **The connection panel (right sidebar on node click) is excellent.** Clicking a node shows the full position breakdown — perspectives (Attacker/Defender), headings, techniques with TRACK buttons, transition counts. It bridges the visual graph to actionable detail cleanly.
- **Search works well.** Typing "kimura" instantly returns 21 results with yellow highlighting, breadcrumb paths (e.g., "Dominant Positions > North South"), and count badge. This is a strong feature.
- **The Reference tree structure is clear.** The hierarchy of Section → Position → Perspective → Heading → Technique is logically sound and maps well to how grapplers think about positions.
- **Star badges on built-out positions** give visual signal for content depth. The "Gap" red indicator is a useful honesty signal.
- **The training surface (drill queue, Start Training, Today's Focus) adds stickiness.** It gives users a reason to return and makes the tool feel like more than a static reference.

---

## What Feels Weak

- **No onboarding whatsoever.** A new user lands on the Position Map tab and sees a slowly rotating 3D graph with no explanation. There's no tooltip, no "Welcome" modal, no "Here's how to use this" cue. The learning curve is steep — you have to figure out that nodes are clickable, what the tabs mean, what TRACK does, etc.
- **No clear value proposition visible on load.** The page title says "No-Gi Reference & Training" but the first thing you see is a technical 3D graph. There's no hero message, no "What is this?" for new visitors.
- **The "White Belt" rank + email in the header is confusing for guests.** If this is a public demo, showing a specific email and rank feels like you're accidentally logged into someone's account. For a fresh visitor, it's disorienting.
- **"COMING SOON" labels throughout (e.g., Defender perspectives) signal incompleteness.** This is fine during development but would hurt credibility in a demo — it signals "half built."
- **The export banner ("You haven't exported your data yet") is persistent and distracting.** It sits at the bottom of every view and feels like a nag, especially for new users who have no data to export.

---

## What Feels Overloaded

- **The bottom toolbar has too many items.** In Reference view: Search, ALL, MY GAME, DRILLING, UNEXPLORED, HAS VIDEO, DETAILED, COLLAPSE, EXPAND, NETWORK, SHARE, ? KEYS — that's 12 buttons in one horizontal row. This is power-user density, not a learning product. A new user sees this bar and immediately feels overwhelmed.
- **The top area of Reference view stacks too much above the fold.** Before you even see the content tree, there's: drill queue chips (5 items), Start Training button, My Drills/Timer/Circuit buttons, CONTINUE section, TODAY'S FOCUS card. That's 4 separate blocks of training UI competing for attention before any reference content is visible.
- **Position rows have dense inline metadata.** Each position line shows: name, star, TRACK button, link icon, checkmark icon, technique count, Gap indicator, plus stats below (Techniques/Tracked/Transitions). For a learning tool, this is a lot of visual noise on every single row.
- **The Position Map bottom bar also has many options:** Search, ALL, MY GAME, DRILLING, DETAILED, RECENTER, MY MAP, FIND PATH, SETTINGS, SHARE — 10 items. FIND PATH and MY MAP are advanced features that could be hidden in a settings/menu.

---

## What Feels Hidden

- **Keyboard shortcuts exist but are invisible.** The "? KEYS" button is the last item in an already-crowded toolbar. Most users will never discover /, T, G, ?, Esc, or arrow keys.
- **The "NETWORK" button in the Reference toolbar** isn't obviously related to showing graph connections for the selected position. Its purpose is unclear without clicking it.
- **Filters like UNEXPLORED and HAS VIDEO** are useful but buried in the same row as destructive layout actions (COLLAPSE/EXPAND). There's no visual separation between "filter the content" and "change the view."
- **The three-dot menu (top right)** — its contents are unknown without clicking. If it contains important settings or features, they're invisible.

---

## What Feels Confusing

- **"Reference" vs "Position Map" naming.** "Reference" sounds like documentation; "Position Map" sounds like a geographic map. A new user wouldn't immediately understand that Reference = tree view of all techniques and Position Map = 3D network graph. Better names might be "Technique Library" and "Position Graph" or similar.
- **Position names will confuse non-advanced grapplers.** "J point," "Shin pin," "Supine Guard," "Butterfly ashi," "Grounded 50/50" — these are correct BJJ terminology but are niche. A beginner seeing "J point" has no idea what that is. No descriptions or context accompany these names.
- **"TRACK" vs the other small icons.** Each position row has TRACK, a link/chain icon, and a checkmark icon. Their purposes aren't labeled or explained. TRACK presumably adds to your drill list, but the link and check icons are ambiguous.
- **OFFENSIVE TRANSITIONS heading appears duplicated.** When expanded, there's "OFFENSIVE TRANSITIONS(6)" and then immediately below it "OFFENSIVE TRANSITIONS(6)" again as a child. This looks like a rendering bug or structural oddity from the OPML data.
- **"Half Guard Passing" as a Guard position.** To a new user, "passing" implies you're getting past the guard (attacker perspective), but it's listed alongside guard positions like "Butterfly guard." The naming creates a category confusion.
- **Technique counts vary enormously.** Seated Guard has 128 techniques while Back Control has 24. This imbalance isn't explained and may confuse users about depth vs. importance.

---

## Top 10 Product/Usability Issues

1. **No onboarding or first-visit experience.** New users are dropped into a complex app with zero guidance. Add a welcome modal, quick tour, or at minimum explanatory tooltips on first load.

2. **Bottom toolbar is overloaded (12 items in Reference, 10 in Position Map).** Split into primary actions (Search, core filters) and a "More" overflow menu for power-user tools (NETWORK, FIND PATH, MY MAP, SHARE, SETTINGS, ? KEYS).

3. **Training surfaces dominate the top of Reference view.** The drill queue, Start Training, Today's Focus, and CONTINUE block push actual reference content below the fold. Consider collapsing these into a single compact "Training" banner or making them togglable.

4. **"Reference" and "Position Map" tab names are unclear.** Rename to something more intuitive like "Techniques" and "Network Graph" (or "Position Network").

5. **No mobile responsiveness.** The bottom toolbar, position rows, and 3D graph don't adapt to small screens. The toolbar would overflow on any phone. This needs a mobile-first redesign with hamburger menu or swipeable tabs for filters.

6. **Per-row icon clutter (TRACK + link + check + star + Gap + stats).** Simplify the default row to: name, technique count, and a single action button. Move TRACK, sharing, and detailed stats to an expanded/selected state.

7. **Export nag banner is persistent and premature.** A new user with no data doesn't need to see "Back it up to keep it safe." Show this only after the user has actually tracked techniques. Or move it to Settings.

8. **"COMING SOON" labels on Defender perspectives** reduce demo credibility. Either hide unpopulated perspectives entirely or show them grayed out without the text label.

9. **No explanatory text for position names.** Adding a one-line description or tooltip for positions like "J point," "Shin pin," or "Supine Guard" would massively help newer practitioners understand the taxonomy.

10. **The 3D graph loads with "Loading positions..." for several seconds** on initial visit. There's no progress indicator or skeleton screen — just an empty dark canvas. This could look like a broken page.

---

## Top 5 Structural/Content-Organization Issues

1. **OFFENSIVE TRANSITIONS heading duplication.** Multiple positions show "OFFENSIVE TRANSITIONS(N)" with an identical child "OFFENSIVE TRANSITIONS(N)" nested below. This appears to be a structural artifact from the OPML conversion where the heading and its container are both rendering. Fix in the parser or template.

2. **Massive technique count imbalance across positions.** Seated Guard (128), Supine Guard (70), Butterfly guard (46) vs. Half guard (14), Back Control (24). Users may interpret high counts as "more important" when it really reflects how much content has been added. Consider showing a "completeness" indicator separate from raw count.

3. **"Half Guard Passing" naming creates category confusion.** It's listed under Guard but reads like a passing (attack) concept. The "Passing" suffix makes it feel like it belongs under a different organizational layer. Most users would look for it under Dominant Positions or a "Passing" section.

4. **Guard has 19 positions — that's a long scrolling list.** Consider grouping them into sub-categories (e.g., "Open Guards," "Half Guard Variants," "Ashi Garami" group) to reduce cognitive load. Currently it's a flat list that's hard to scan.

5. **The "Scrambles" section feels underdeveloped compared to Guard and Dominant Positions.** It has only 3 positions (Berimbolo, Crab ride, Grounded 50/50) with 55 techniques total. This is fine structurally, but the category may feel "empty" to users exploring the map. Consider adding a note that more scramble positions are planned.

---

## Best Next Batch to Improve First

**Priority: Make the app demo-ready for a new visitor in 5 minutes.**

1. **Add a simple onboarding overlay** — 3 steps: "This is your technique library" → "This is the position network" → "Track techniques to build your game." Dismissable, shows once.

2. **Collapse the training surface** into a single compact bar (e.g., "5 drills queued — Start Training") that expands on click. This recovers the entire top fold for reference content.

3. **Split the bottom toolbar** into two tiers: primary row (Search, ALL, MY GAME, DRILLING) and a "..." overflow for everything else. Or use a segmented control / dropdown for filters.

4. **Hide the export nag banner** for users with zero tracked techniques.

5. **Fix the OFFENSIVE TRANSITIONS double-heading** rendering issue.

6. **Rename tabs** to "Techniques" and "Network" (or similar).

7. **Add a 1-second skeleton/shimmer** to the 3D graph loading state instead of a blank dark canvas.

---

*— FROM: COWORK*
