#!/usr/bin/env python3
"""
sync_folders_to_opml.py — Sync valid new live-footage folders back into grappling.opml.

Reads folder-only paths from the audit report (or re-audits), classifies them,
and for valid new positions adds proper OPML nodes with full schema scaffolding.

Usage:
  python3 sync_folders_to_opml.py                  # dry-run: show what would change
  python3 sync_folders_to_opml.py --apply           # edit grappling.opml in place
  python3 sync_folders_to_opml.py --cleanup         # also remove artifact folders (dry-run)
  python3 sync_folders_to_opml.py --cleanup --apply # remove artifacts + sync OPML

Reports:
  - Classifies folder-only paths into: SYNC, ARTIFACT, SLUG_MISMATCH, UNKNOWN
  - SYNC = valid new positions to add to OPML (e.g. Octopus Guard)
  - ARTIFACT = structurally wrong folders (wrong perspectives, wrapper-level perspectives)
  - SLUG_MISMATCH = folder slug differs from OPML heading slug (usually benign)
"""

import json
import os
import re
import shutil
import sys
import xml.etree.ElementTree as ET
from copy import deepcopy
from datetime import datetime

OPML_PATH = os.path.expanduser('~/Chat-gpt/grappling.opml')
LIVE_ROOT = os.path.expanduser('~/GrapplingMap/live-footage')
AUDIT_REPORT = os.path.expanduser('~/GrapplingMap/reports/opml-folder-audit.json')
TRASH_DIR = os.path.join(LIVE_ROOT, '_TRASH')

# ── Schema templates per section ─────────────────────────────────────────
# Each section has specific perspectives and headings.

SECTION_SCHEMAS = {
    'Dominant Positions': {
        'perspectives': ['Attacker', 'Defender'],
        'headings': [
            'Setups / Entries', 'Control', 'Offence',
            'Defence / Escapes', 'Submissions', 'Offensive transitions'
        ],
    },
    'Guard': {
        'perspectives': ['Passer', 'Guard player'],
        'headings': [
            'Setups / Entries', 'Control', 'Offence',
            'Defence / Escapes', 'Submissions', 'Offensive transitions'
        ],
    },
    'Scrambles': {
        'perspectives': ['Initiative', 'Defensive'],
        'headings': [
            'Setups / Entries', 'Control', 'Offence',
            'Defence / Escapes', 'Submissions', 'Offensive transitions'
        ],
    },
    'Wrestling': {
        'perspectives': ['Attacker', 'Defender'],
        'headings': [
            'Setups / Entries', 'Control', 'Offence',
            'Defence', 'Submissions', 'Offensive transitions'
        ],
    },
    'Hand fighting': {
        'perspectives': ['You', 'Opponent'],
        'headings': [
            'Setups / Entries', 'Control', 'Offence',
            'Defence', 'Offensive transitions'
        ],
    },
}

# Section slug → display name mapping
SECTION_SLUG_MAP = {
    'dominant-positions': 'Dominant Positions',
    'guard': 'Guard',
    'scrambles': 'Scrambles',
    'wrestling': 'Wrestling',
}


def slugify(s):
    s = s.lower().strip()
    s = re.sub(r'[^\w\s-]', '', s)
    s = re.sub(r'[\s_]+', '-', s)
    s = re.sub(r'-+', '-', s)
    return s.strip('-')


def deslugify(slug):
    """Convert a folder slug back to a display name (Title Case)."""
    return slug.replace('-', ' ').title()


def read_opml(path):
    with open(path, 'rb') as f:
        raw = f.read()
    raw = raw.replace(b'encoding="ISO-8859-1"', b'encoding="UTF-8"')
    return ET.fromstring(raw)


def classify_folder_only(paths):
    """Classify each folder-only path into categories.

    Returns dict with keys: sync, artifact, slug_mismatch, unknown
    Each value is a list of (path, reason) tuples.
    """
    result = {
        'sync': [],        # Valid new positions to add to OPML
        'artifact': [],    # Wrong structure, should be cleaned up
        'slug_mismatch': [],  # Slug differs from OPML heading
        'unknown': [],     # Can't classify
    }

    # Group by root position to detect full scaffold sets
    position_groups = {}  # "section/position" -> [paths]
    for p in paths:
        parts = p.split('/')
        if len(parts) >= 2:
            key = '/'.join(parts[:2])
            position_groups.setdefault(key, []).append(p)

    for p in paths:
        parts = p.split('/')
        section_slug = parts[0] if parts else ''
        section_name = SECTION_SLUG_MAP.get(section_slug, '')

        # ── Hand-fighting attacker/defender (should be you/opponent) ──
        if 'hand-fighting' in p and any(x in parts for x in ['attacker', 'defender']):
            result['artifact'].append((
                p,
                'Hand fighting uses You/Opponent perspectives, not Attacker/Defender'
            ))
            continue

        # ── Hand-fighting overunder defender (should be opponent) ──
        if 'hand-fighting' in p and 'overunder' in p and 'defender' in parts:
            result['artifact'].append((
                p,
                'Over/Under sub-position uses You/Opponent, not Defender'
            ))
            continue

        # ── Shots at wrapper level with attacker/defender ──
        if (len(parts) >= 3 and parts[0] == 'wrestling' and parts[1] == 'shots'
                and parts[2] in ('attacker', 'defender')
                and len(parts) <= 3 + 6):  # perspective + up to 6 headings
            # Shots is a container, not a position. Perspective folders
            # belong under individual shot types, not the container.
            result['artifact'].append((
                p,
                'Shots is a container — perspectives belong under individual shot types'
            ))
            continue

        # ── Defence vs defence-escapes slug mismatch ──
        if parts[-1] == 'defence-escapes':
            # Check if this section uses "Defence" (not "Defence / Escapes")
            if section_slug == 'wrestling':
                result['slug_mismatch'].append((
                    p,
                    'Wrestling uses "Defence" heading, folder has "defence-escapes"'
                ))
            elif section_slug in ('dominant-positions', 'guard'):
                # These use "Defence / Escapes" which slugifies to "defence-escapes"
                # So this should match — might be a different audit issue
                result['slug_mismatch'].append((
                    p,
                    'Slug should match OPML "Defence / Escapes" — possible audit mismatch'
                ))
            else:
                result['slug_mismatch'].append((
                    p, 'Defence/escapes slug variant'
                ))
            continue

        if parts[-1] == 'defence' and section_slug == 'wrestling':
            # "defence" under wrestling shots — this is correct for wrestling
            result['slug_mismatch'].append((
                p,
                'Wrestling heading is "Defence" — folder slug matches but not in OPML path'
            ))
            continue

        # ── New position with full scaffold (like Octopus Guard) ──
        if len(parts) == 2:
            # This is a position-level folder (section/position)
            pos_key = '/'.join(parts[:2])
            group = position_groups.get(pos_key, [])
            # Check if it has perspective and heading folders
            has_perspectives = any(
                len(g.split('/')) == 3 for g in group
            )
            if has_perspectives and section_name:
                result['sync'].append((
                    p,
                    f'New position in {section_name}: {deslugify(parts[1])}'
                ))
            elif section_name:
                result['sync'].append((
                    p,
                    f'New position in {section_name} (no scaffold yet): {deslugify(parts[1])}'
                ))
            else:
                result['unknown'].append((p, 'Position under unknown section'))
            continue

        # ── Sub-paths of a syncable position ──
        if len(parts) >= 3:
            pos_key = '/'.join(parts[:2])
            # If the position itself is in our sync list, skip sub-paths
            # (they'll be created as part of the OPML scaffold)
            if pos_key in position_groups and f'{parts[0]}/{parts[1]}' in [
                sp.split('/')[0] + '/' + sp.split('/')[1]
                for sp, _ in result['sync']
            ]:
                continue
            # Check if this is a sub-path of a known new position
            pos_slug = parts[1]
            is_sub_of_new = any(
                sp == f'{parts[0]}/{pos_slug}' for sp, _ in result['sync']
            )
            if not is_sub_of_new:
                result['unknown'].append((p, 'Sub-path without matching position'))
            continue

        result['unknown'].append((p, 'Could not classify'))

    return result


def add_position_to_opml(root, section_name, position_name):
    """Add a new position node with full schema scaffold to the OPML tree.

    Returns True if added, False if already exists.
    """
    body = root.find('body')
    root_outline = body.find('outline')

    # Find the section
    section_el = None
    for el in root_outline:
        if el.tag == 'outline' and el.get('text', '').strip() == section_name:
            section_el = el
            break

    if section_el is None:
        print(f'  ERROR: Section "{section_name}" not found in OPML')
        return False

    # Check if position already exists
    for el in section_el:
        if el.tag == 'outline' and el.get('text', '').strip() == position_name:
            print(f'  SKIP: "{position_name}" already exists in {section_name}')
            return False

    # Get schema for this section
    # Handle sub-sections (e.g. "Hand fighting" is under "Wrestling" in OPML)
    schema = SECTION_SCHEMAS.get(section_name)
    if not schema:
        # Try parent section lookup
        print(f'  ERROR: No schema for section "{section_name}"')
        return False

    # Build the position node with perspectives and headings
    pos_el = ET.SubElement(section_el, 'outline')
    pos_el.set('text', position_name)

    for perspective in schema['perspectives']:
        persp_el = ET.SubElement(pos_el, 'outline')
        persp_el.set('text', perspective)
        for heading in schema['headings']:
            heading_el = ET.SubElement(persp_el, 'outline')
            heading_el.set('text', heading)

    return True


def write_opml(root, path):
    """Write OPML tree back to file, preserving format."""
    # ET doesn't preserve the XML declaration and DOCTYPE well,
    # so we handle it manually
    tree_str = ET.tostring(root, encoding='unicode', xml_declaration=False)

    # Add XML declaration
    output = '<?xml version="1.0" encoding="UTF-8"?>\n' + tree_str + '\n'

    with open(path, 'w', encoding='utf-8') as f:
        f.write(output)


def main():
    apply_mode = '--apply' in sys.argv
    cleanup_mode = '--cleanup' in sys.argv

    # ── Load audit report ─────────────────────────────────────────────
    if not os.path.exists(AUDIT_REPORT):
        print(f'ERROR: Audit report not found: {AUDIT_REPORT}')
        print('Run the audit first to generate opml-folder-audit.json')
        sys.exit(1)

    with open(AUDIT_REPORT) as f:
        audit = json.load(f)

    folder_only = audit.get('folder_only_list', [])
    print(f'Folder-only paths to classify: {len(folder_only)}')
    print(f'Mode: {"--apply" if apply_mode else "--dry-run"}'
          f'{" --cleanup" if cleanup_mode else ""}')
    print()

    # ── Classify ──────────────────────────────────────────────────────
    classified = classify_folder_only(folder_only)

    # Re-scan sync items to attach sub-paths
    sync_positions = set()
    for p, reason in classified['sync']:
        sync_positions.add(p)

    # Move sub-paths of sync positions out of unknown
    remaining_unknown = []
    for p, reason in classified['unknown']:
        parts = p.split('/')
        if len(parts) >= 2:
            pos_key = f'{parts[0]}/{parts[1]}'
            if pos_key in sync_positions:
                continue  # sub-path of syncable position, skip
        remaining_unknown.append((p, reason))
    classified['unknown'] = remaining_unknown

    # ── Report ────────────────────────────────────────────────────────
    print('=== CLASSIFICATION ===')
    print()

    if classified['sync']:
        print(f'SYNC ({len(classified["sync"])} positions to add to OPML):')
        for p, reason in classified['sync']:
            print(f'  + {p}  ({reason})')
        print()

    if classified['artifact']:
        print(f'ARTIFACT ({len(classified["artifact"])} folders to clean up):')
        for p, reason in classified['artifact']:
            print(f'  ! {p}')
            print(f'    {reason}')
        print()

    if classified['slug_mismatch']:
        print(f'SLUG MISMATCH ({len(classified["slug_mismatch"])} folders):')
        for p, reason in classified['slug_mismatch']:
            print(f'  ~ {p}')
            print(f'    {reason}')
        print()

    if classified['unknown']:
        print(f'UNKNOWN ({len(classified["unknown"])} - need manual review):')
        for p, reason in classified['unknown']:
            print(f'  ? {p}  ({reason})')
        print()

    # ── Sync: add new positions to OPML ───────────────────────────────
    if classified['sync']:
        print('=== OPML SYNC ===')
        root = read_opml(OPML_PATH)

        added = []
        for p, reason in classified['sync']:
            parts = p.split('/')
            section_slug = parts[0]
            position_slug = parts[1]
            section_name = SECTION_SLUG_MAP.get(section_slug, '')
            position_name = deslugify(position_slug)

            if not section_name:
                print(f'  SKIP: Unknown section slug "{section_slug}"')
                continue

            print(f'  Adding: {position_name} -> {section_name}')

            if apply_mode:
                ok = add_position_to_opml(root, section_name, position_name)
                if ok:
                    added.append(position_name)
            else:
                # Dry-run: show what would be added
                schema = SECTION_SCHEMAS.get(section_name, {})
                perspectives = schema.get('perspectives', [])
                headings = schema.get('headings', [])
                print(f'    Perspectives: {perspectives}')
                print(f'    Headings: {headings}')
                added.append(position_name)

        if apply_mode and added:
            # Backup before writing
            backup_path = OPML_PATH + f'.backup-{datetime.now().strftime("%Y%m%d-%H%M%S")}'
            shutil.copy2(OPML_PATH, backup_path)
            print(f'  Backup: {backup_path}')

            write_opml(root, OPML_PATH)
            print(f'  OPML updated: {OPML_PATH}')
            print(f'  Added {len(added)} positions: {", ".join(added)}')
        elif not apply_mode and added:
            print(f'  Would add {len(added)} positions: {", ".join(added)}')
        print()

    # ── Cleanup: move artifact folders to _TRASH ──────────────────────
    if cleanup_mode and classified['artifact']:
        print('=== ARTIFACT CLEANUP ===')
        for p, reason in classified['artifact']:
            full_path = os.path.join(LIVE_ROOT, p)
            if not os.path.isdir(full_path):
                print(f'  SKIP (gone): {p}')
                continue

            # Check for video files
            has_video = False
            for root_dir, dirs, files in os.walk(full_path):
                for f in files:
                    if os.path.splitext(f.lower())[1] in {'.mp4', '.mov', '.mkv', '.webm', '.m4v'}:
                        has_video = True
                        break
                if has_video:
                    break

            if has_video:
                print(f'  KEEP (has video): {p}')
                continue

            if apply_mode:
                trash_dest = os.path.join(TRASH_DIR, p)
                os.makedirs(os.path.dirname(trash_dest), exist_ok=True)
                if os.path.exists(trash_dest):
                    shutil.rmtree(trash_dest)
                shutil.move(full_path, trash_dest)
                print(f'  TRASHED: {p}')
            else:
                print(f'  Would trash: {p}')
        print()

    # ── Summary ───────────────────────────────────────────────────────
    print('=== SUMMARY ===')
    print(f'Sync (new positions):   {len(classified["sync"])}')
    print(f'Artifacts (cleanup):    {len(classified["artifact"])}')
    print(f'Slug mismatches:        {len(classified["slug_mismatch"])}')
    print(f'Unknown (manual):       {len(classified["unknown"])}')

    if not apply_mode:
        print('\nDry run complete. Use --apply to execute.')


if __name__ == '__main__':
    main()
