#!/usr/bin/env python3
"""
Restructure the Front Headlock subtree under Dominant Positions in grappling.opml.
"""

import xml.etree.ElementTree as ET
import copy

OPML_PATH = '/Users/aaronmaher/GrapplingMap/exports/grappling.opml'

# ── helpers ──────────────────────────────────────────────────────────────────

def node(parent, text):
    """Create an outline child with the given text attribute."""
    return ET.SubElement(parent, 'outline', text=text)

def vid(parent):
    """Add Instructional video + Live video children."""
    ET.SubElement(parent, 'outline', text='Instructional video')
    ET.SubElement(parent, 'outline', text='Live video')

def notes(parent, *lines):
    """Add a Notes node with one child per line."""
    n = node(parent, 'Notes')
    for line in lines:
        node(n, line)

ARROW = '\u2192'  # →

# ── parse ────────────────────────────────────────────────────────────────────

tree = ET.parse(OPML_PATH)
root = tree.getroot()

# Find Dominant Positions
dom_pos = None
for o in root.iter('outline'):
    if o.get('text') == 'Dominant Positions':
        dom_pos = o
        break

assert dom_pos is not None, 'Dominant Positions not found'

# Find Front Headlock under Dominant Positions
fh = None
for child in dom_pos:
    if child.get('text') == 'Front Headlock':
        fh = child
        break

assert fh is not None, 'Front Headlock not found under Dominant Positions'

# ── count old video nodes in Attacker ────────────────────────────────────────

attacker_old = None
for child in fh:
    if child.get('text') == 'Attacker':
        attacker_old = child
        break

old_vid_count = 0
if attacker_old is not None:
    for el in attacker_old.iter('outline'):
        if el.get('text') in ('Instructional video', 'Live video'):
            old_vid_count += 1

print(f'Old video nodes in Attacker: {old_vid_count}')

# ── clear Front Headlock children ────────────────────────────────────────────

for child in list(fh):
    fh.remove(child)

# ── build new structure ──────────────────────────────────────────────────────

# ═══ ATTACKER ═══
attacker = node(fh, 'Attacker')

# -- Setups / Entries --
se = node(attacker, 'Setups / Entries')

snap_collar = node(se, 'Snapdown from collar tie')
notes(snap_collar, 'Feint before snapping makes this more effective')

snap_under = node(se, 'Snapdown from underhook')
notes(snap_under, 'Feint before snapping makes this more effective',
      'Easier if opponent has low posture')

node(se, 'Snapdown from outside tie')
node(se, 'Snapdown from over tie')

# -- Control --
ctrl = node(attacker, 'Control')
node(ctrl, 'Chin strap tricep front headlock')
node(ctrl, 'Hands locked front headlock')
node(ctrl, 'Hip position / sprawl')
node(ctrl, 'Angle off to dominant side')

# -- Offence --
off = node(attacker, 'Offence')

# Head in the hole go-behind
hith = node(off, 'Head in the hole go-behind')
notes(hith, 'From chin strap tricep front headlock')

gb_rear = node(hith, f'Go-behind to rear bodylock')
vid(gb_rear)

sl_rear = node(hith, 'Single leg rear bodylock (opponent circles away)')
vid(sl_rear)

whip = node(hith, 'Whip by (opponent circles away fast)')
vid(whip)

# Bolt cutter from chin strap → D'Arce
bc_cs_darce = node(off, f'Bolt cutter from chin strap {ARROW} D\'Arce')
notes(bc_cs_darce, 'If they lay to back and extend arm to defend, transition to North South')
vid(bc_cs_darce)

# Bolt cutter from chin strap → Japanese necktie
bc_cs_jn = node(off, f'Bolt cutter from chin strap {ARROW} Japanese necktie')
vid(bc_cs_jn)

# Bolt cutter from hands locked → D'Arce
bc_hl_darce = node(off, f'Bolt cutter from hands locked {ARROW} D\'Arce')
notes(bc_hl_darce, 'If they lay to back and extend arm to defend, transition to North South')
vid(bc_hl_darce)

# Bolt cutter from hands locked → Japanese necktie
bc_hl_jn = node(off, f'Bolt cutter from hands locked {ARROW} Japanese necktie')
hook = node(bc_hl_jn, 'Hook leg')
vid(hook)

# Head pinch from hands locked → Anaconda
hp_ana = node(off, f'Head pinch from hands locked {ARROW} Anaconda')
vid(hp_ana)

# Headspin from hands locked → Anaconda
hs_ana = node(off, f'Headspin from hands locked {ARROW} Anaconda')
notes(hs_ana, f'Freestyle wrestling move {ARROW} scores 2 points for full roll-through')
vid(hs_ana)

# Pinch front headlock to Anaconda
pfh_ana = node(off, 'Pinch front headlock to Anaconda')
notes(pfh_ana, 'If they roll through to defend, follow to crucifix')
vid(pfh_ana)

# High elbow guillotine sit back
heg_sb = node(off, 'High elbow guillotine sit back')
vid(heg_sb)

# High elbow guillotine roll through
heg_rt = node(off, 'High elbow guillotine roll through (counter to roll defence)')
vid(heg_rt)

# Seatbelt roll-through
node(off, 'Seatbelt roll-through')

# -- Defence --
defence = node(attacker, 'Defence')
node(defence, 'Opponent posts to stop go-behind')
node(defence, 'Opponent squares back up')
node(defence, 'Opponent drives into you')
node(defence, 'Opponent reaches for single')
node(defence, 'Opponent builds tripod posture')
node(defence, 'Pressure to break posture')

# -- Submissions --
subs = node(attacker, 'Submissions')

heg_sub = node(subs, 'High elbow guillotine')
vid(heg_sub)

hwg_sub = node(subs, 'High wrist guillotine')
vid(hwg_sub)

darce_sub = node(subs, "D'Arce")
vid(darce_sub)

jn_sub = node(subs, 'Japanese necktie')
vid(jn_sub)

ana_sub = node(subs, 'Anaconda')
vid(ana_sub)

# -- Offensive transitions --
ot = node(attacker, 'Offensive transitions')
node(ot, f'Head in the hole go-behind {ARROW} Wrestling rear bodylock')
node(ot, f'Head in the hole go-behind {ARROW} Back control')
node(ot, f'Single leg rear bodylock {ARROW} Wrestling rear bodylock')
node(ot, f'Single leg rear bodylock {ARROW} Back control')
node(ot, f'Whip by {ARROW} Wrestling rear bodylock')
node(ot, f'Whip by {ARROW} Back control')
node(ot, f'Pinch front headlock {ARROW} Anaconda')
node(ot, f'Anaconda defence roll-through {ARROW} Crucifix')
node(ot, f'Seatbelt roll-through {ARROW} Seatbelt choking side up')
node(ot, f'Seatbelt roll-through {ARROW} Seatbelt choking side down')
node(ot, f'Seatbelt roll-through {ARROW} Seatbelt no hooks')
node(ot, f'D\'Arce defence lay to back {ARROW} North South')

# ═══ DEFENDER ═══
defender = node(fh, 'Defender')

# -- Setups / Entries --
d_se = node(defender, 'Setups / Entries')
node(d_se, 'Opponent secures chin strap tricep front headlock')
node(d_se, 'Opponent secures hands locked front headlock')
node(d_se, 'Opponent catches front headlock after snapdown')
node(d_se, 'Opponent catches front headlock during shot defence')

# -- Control --
d_ctrl = node(defender, 'Control')
node(d_ctrl, 'Post to stop the go-behind')
node(d_ctrl, 'Build base')
node(d_ctrl, 'Regain posture')
node(d_ctrl, 'Recover elbow position inside')

# -- Offence --
d_off = node(defender, 'Offence')

sucker = node(d_off, 'Sucker drag')
notes(sucker, 'Use the posting hand and arm push to create the drag opportunity')

node(d_off, 'Peek-out')
node(d_off, 'Sit-through')
node(d_off, 'Re-attack on single')

# -- Defence --
d_def = node(defender, 'Defence')

push_arm = node(d_def, 'Push arm off (bolt cutter defence)')
vid(push_arm)

lay_back = node(d_def, "Lay to back and extend arm (D'Arce defence)")
vid(lay_back)

free_leg = node(d_def, 'Free leg (Japanese necktie defence)')
vid(free_leg)

hide_foot = node(d_def, 'Hide foot (Japanese necktie defence)')
vid(hide_foot)

arm_leg_post = node(d_def, 'Arm and leg post (Anaconda defence)')
vid(arm_leg_post)

leg_up = node(d_def, 'Leg up (Head pinch defence)')
vid(leg_up)

arm_over = node(d_def, 'Arm over high elbow (Guillotine defence)')
vid(arm_over)

strip_leg = node(d_def, 'Stripping leg (Guillotine defence)')
vid(strip_leg)

strip_grip = node(d_def, 'Strip grip turn head (High wrist guillotine defence)')
vid(strip_grip)

# -- Submissions --
node(defender, 'Submissions')

# -- Offensive transitions --
d_ot = node(defender, 'Offensive transitions')
node(d_ot, f'Peek-out {ARROW} Back control')
node(d_ot, f'Re-attack on single {ARROW} Grounded head inside single leg')

# ── indent and write ─────────────────────────────────────────────────────────

ET.indent(tree, space='  ')
tree.write(OPML_PATH, encoding='UTF-8', xml_declaration=True)

# ── count new video nodes ────────────────────────────────────────────────────

new_vid_count = 0
for el in fh.iter('outline'):
    if el.get('text') in ('Instructional video', 'Live video'):
        new_vid_count += 1

print(f'New video nodes in rebuilt structure: {new_vid_count}')

# ── print structure ──────────────────────────────────────────────────────────

def print_tree(elem, indent=0):
    text = elem.get('text', '')
    print('  ' * indent + text)
    for child in elem:
        print_tree(child, indent + 1)

print('\n=== NEW FRONT HEADLOCK STRUCTURE ===')
print_tree(fh)
