#!/usr/bin/env python3
"""
tools/opml_to_sections.py
Converts grappling.opml -> updates const SECTIONS in index.html

Usage:
    python3 tools/opml_to_sections.py [--dry-run]
"""

import xml.etree.ElementTree as ET
import json
import os
import re
import sys

COLORS = ['#e8ff47', '#ff6b35', '#a78bfa', '#47c8ff', '#34d399']

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OPML_PATH = os.path.join(REPO_ROOT, 'grappling.opml')
INDEX_PATH = os.path.join(REPO_ROOT, 'index.html')

# ---------------------------------------------------------------------------
# Encoding helpers
# ---------------------------------------------------------------------------

# Mindomo exports OPML with <?xml ... encoding="ISO-8859-1"?> in the
# XML declaration, but the file bytes are actually UTF-8.  Python's
# ElementTree respects the declared encoding, so it tries to decode UTF-8
# multi-byte sequences (e.g. the 3 bytes E2 86 92 that encode →) as
# ISO-8859-1.  That either raises a ParseError (byte 0x86 is a forbidden
# C1 control in XML 1.0) or silently produces three Latin-1 replacement
# characters instead of the single arrow →.
#
# Fix: read the file as raw bytes, patch the encoding declaration to UTF-8
# *before* handing bytes to the parser, then decode as UTF-8.

_CORRUPT_ARROW = '\u00e2\u0086\u0092'   # → misread as ISO-8859-1 (E2 86 92)
_REAL_ARROW    = '\u2192'                 # → (U+2192 RIGHTWARDS ARROW)


def _normalize_text(text: str) -> str:
    """Fix any residual encoding corruption and double-arrow typos in a label.

    Replaces:
      - corrupted 3-char sequence (UTF-8 bytes for → decoded as Latin-1) -> →
      - → → (doubled transition arrow) -> →  (single)
    """
    text = text.replace(_CORRUPT_ARROW, _REAL_ARROW)
    text = text.replace(_REAL_ARROW + ' ' + _REAL_ARROW, _REAL_ARROW)
    return text


def _read_opml_bytes(opml_path: str) -> bytes:
    """Read OPML file and patch encoding declaration to UTF-8.

    Mindomo declares ISO-8859-1 but writes UTF-8.  We fix the declaration so
    ElementTree parses the bytes with the correct encoding.
    """
    with open(opml_path, 'rb') as f:
        raw = f.read()

    # Patch both quote styles (double and single) just in case
    raw = raw.replace(b'encoding="ISO-8859-1"', b'encoding="UTF-8"')
    raw = raw.replace(b"encoding='ISO-8859-1'", b"encoding='UTF-8'")
    return raw


# ---------------------------------------------------------------------------
# Node conversion
# ---------------------------------------------------------------------------

def convert_node(outline):
    """Recursively convert an OPML <outline> element to a SECTIONS node dict."""
    text = _normalize_text(outline.get('text', '').strip())
    node = {'t': text}

    # Note field (Mindomo exports as 'note' attribute)
    note = outline.get('note', '') or outline.get('_note', '')
    if note:
        node['n'] = _normalize_text(note)

    children = list(outline)

    # Detect video children: empty text + url, or type="video"
    video_children = [
        c for c in children
        if c.get('type') == 'video'
        or (c.get('text', '').strip() == '' and c.get('url', ''))
    ]
    other_children = [
        c for c in children
        if c not in video_children and c.get('text', '').strip()
    ]

    # Attach first video URL to this node
    if video_children and video_children[0].get('url'):
        node['v'] = video_children[0].get('url')

    # Recurse into real children
    if other_children:
        node['c'] = [convert_node(c) for c in other_children]

    return node


# ---------------------------------------------------------------------------
# Main conversion
# ---------------------------------------------------------------------------

def opml_to_sections(opml_path):
    """Parse OPML file and return the SECTIONS list."""
    # Read and patch encoding declaration so ElementTree uses UTF-8
    raw = _read_opml_bytes(opml_path)

    try:
        root = ET.fromstring(raw)
    except ET.ParseError as e:
        raise ValueError(f'Failed to parse OPML (after encoding patch): {e}')

    body = root.find('body')
    if body is None:
        raise ValueError('No <body> element found in OPML')

    root_outline = body.find('outline')
    if root_outline is None:
        raise ValueError('No root <outline> found in OPML body')

    sections = []
    for idx, section_el in enumerate(root_outline):
        if section_el.tag != 'outline':
            continue
        title = _normalize_text(section_el.get('text', '').strip())
        if not title:
            continue
        if title in ('TEMPLATES', 'Main topic'):
            continue
        color = COLORS[len(sections) % len(COLORS)]
        nodes = []
        for child in section_el:
            if (child.tag == 'outline'
                    and child.get('text', '').strip()
                    and child.get('type') != 'video'):
                nodes.append(convert_node(child))
        sections.append({'title': title, 'color': color, 'nodes': nodes})

    return sections


# ---------------------------------------------------------------------------
# NET_NODES / NET_EDGES generation
# ---------------------------------------------------------------------------

def _make_key(section_title, text):
    """Python equivalent of makeKey() in index.html."""
    return re.sub(r'\s+', '_', (section_title + '|' + text).lower())


def sections_to_network(sections):
    """Flatten SECTIONS into NET_NODES and NET_EDGES arrays."""
    nodes = []
    edges = []
    node_id = 0

    def walk(node, section_title, section_idx, depth, parent_id):
        nonlocal node_id
        my_id = node_id
        node_id += 1
        children = node.get('c', [])
        in_net = depth <= 2
        entry = {
            'id': my_id,
            'label': node['t'],
            'section': section_title,
            'section_idx': section_idx,
            'depth': depth,
            'parent_id': parent_id,
            'children_ids': [],
            'has_video': 'v' in node,
            'video_url': node.get('v', ''),
            'key': _make_key(section_title, node['t']),
            'in_network': in_net,
        }
        nodes.append(entry)
        # Edge from parent to this node (both must be in_network)
        if parent_id is not None and in_net:
            edges.append({
                'source': parent_id,
                'target': my_id,
                'type': 'leads_to',
                'weight': 2,
            })
        # Recurse into children — collect actual IDs
        for c in children:
            child_id = node_id  # next ID that walk() will assign
            entry['children_ids'].append(child_id)
            walk(c, section_title, section_idx, depth + 1, my_id)

    for si, s in enumerate(sections):
        for top_node in s['nodes']:
            walk(top_node, s['title'], si, 1, None)

    return nodes, edges


def update_index_html(sections, net_nodes, net_edges, dry_run=False):
    """Replace const SECTIONS, NET_NODES, NET_EDGES in index.html."""
    with open(INDEX_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    # --- Replace SECTIONS ---
    marker_start = 'const SECTIONS = '
    marker_end   = '\nconst COLORS'
    start = content.find(marker_start)
    if start == -1:
        raise ValueError('"const SECTIONS = " not found in index.html')
    end = content.find(marker_end, start)
    if end == -1:
        raise ValueError('"const COLORS" not found after SECTIONS block')
    sections_json = json.dumps(sections, ensure_ascii=False)
    content = content[:start] + marker_start + sections_json + content[end:]

    # --- Replace NET_NODES ---
    nn_start_marker = '  const NET_NODES = '
    nn_start = content.find(nn_start_marker)
    if nn_start == -1:
        raise ValueError('"const NET_NODES = " not found in index.html')
    nn_end = content.find(';\n', nn_start)
    if nn_end == -1:
        raise ValueError('Could not find end of NET_NODES line')
    nn_json = json.dumps(net_nodes, ensure_ascii=False)
    content = content[:nn_start] + nn_start_marker + nn_json + content[nn_end:]

    # --- Replace NET_EDGES ---
    ne_start_marker = '  const NET_EDGES = '
    ne_start = content.find(ne_start_marker)
    if ne_start == -1:
        raise ValueError('"const NET_EDGES = " not found in index.html')
    ne_end = content.find(';\n', ne_start)
    if ne_end == -1:
        raise ValueError('Could not find end of NET_EDGES line')
    ne_json = json.dumps(net_edges, ensure_ascii=False)
    content = content[:ne_start] + ne_start_marker + ne_json + content[ne_end:]

    if dry_run:
        print(f'[DRY RUN] SECTIONS: {len(sections_json)} chars, '
              f'NET_NODES: {len(nn_json)} chars ({len(net_nodes)} nodes), '
              f'NET_EDGES: {len(ne_json)} chars ({len(net_edges)} edges)')
        return len(sections_json)

    with open(INDEX_PATH, 'w', encoding='utf-8', newline='\n') as f:
        f.write(content)

    return len(sections_json)


if __name__ == '__main__':
    dry_run = '--dry-run' in sys.argv
    try:
        print(f'Reading: {OPML_PATH}')
        if not os.path.exists(OPML_PATH):
            raise FileNotFoundError(f'OPML file not found: {OPML_PATH}')

        sections = opml_to_sections(OPML_PATH)
        section_names = [s['title'] for s in sections]
        print(f'Parsed {len(sections)} sections: {section_names}')

        net_nodes, net_edges = sections_to_network(sections)
        in_net = sum(1 for n in net_nodes if n['in_network'])
        print(f'Network: {len(net_nodes)} total nodes, {in_net} in_network, {len(net_edges)} edges')

        chars = update_index_html(sections, net_nodes, net_edges, dry_run=dry_run)
        if not dry_run:
            print(f'Updated index.html ({chars} chars of SECTIONS data)')
    except Exception as e:
        print(f'ERROR: {e}', file=sys.stderr)
        sys.exit(1)
