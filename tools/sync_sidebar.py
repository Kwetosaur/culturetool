# -*- coding: utf-8 -*-
"""
Reconstruit les 4 blocs .side-group (Mythologies/Cultures/Creatures/Mysteres) de
maniere identique sur TOUTES les pages du site (root + public/), et marque
class="active" sur le lien correspondant au fichier courant.

Source de verite : docs/site-pages.json (ordre + titres). Ne code plus rien en
dur ici - ajouter une page = ajouter une ligne dans le JSON (ce que fait
tools/add_page.py automatiquement), puis relancer ce script.

Usage : python tools/sync_sidebar.py
"""
import glob
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES_JSON = os.path.join(ROOT, 'docs', 'site-pages.json')

LABELS = [
    ("Mythologies", "mythologies"),
    ("Cultures", "cultures"),
    ("Créatures", "creatures"),
    ("Mystères", "mysteres"),
]


def load_groups():
    with open(PAGES_JSON, encoding='utf-8') as f:
        data = json.load(f)
    return [(label, [(p['href'], p['title']) for p in data[key]]) for label, key in LABELS]


def build_group_html(label, items, current_file):
    lines = [f'  <div class="side-label">{label}</div>', '  <div class="side-group">']
    for href, title in items:
        cls = ' class="active"' if href == current_file else ''
        lines.append(f'    <a href="{href}"{cls}>{title}</a>')
    lines.append('  </div>')
    return '\n'.join(lines)


def patch_file(path, groups):
    current_file = os.path.basename(path)
    txt = open(path, encoding='utf-8').read()
    if '<nav id="side-menu">' not in txt:
        return None  # page sans sidebar (ne devrait pas arriver pour nos cibles)

    changed = 0
    for label, items in groups:
        pat = re.compile(
            r'[ \t]*<div class="side-label">' + re.escape(label) + r'</div>\s*'
            r'<div class="side-group">.*?</div>',
            re.DOTALL,
        )
        new_block = build_group_html(label, items, current_file)
        new_txt, n = pat.subn(new_block, txt, count=1)
        if n:
            txt = new_txt
            changed += n
    open(path, 'w', encoding='utf-8').write(txt)
    return changed


def main():
    groups = load_groups()

    targets = []
    for pattern in ['mythologie-*.html', 'culture-*.html', 'creature-*.html',
                     'mystere-*.html', 'map.html']:
        targets += glob.glob(os.path.join(ROOT, pattern))
        targets += glob.glob(os.path.join(ROOT, 'public', pattern))
    targets = sorted(set(targets))

    total = 0
    for path in targets:
        n = patch_file(path, groups)
        if n is None:
            print(f"SKIP (pas de side-menu) : {path}")
            continue
        print(f"{path}: {n}/4 groupes mis a jour")
        total += 1
    print(f"\n{total} fichiers traites au total")


if __name__ == '__main__':
    main()
