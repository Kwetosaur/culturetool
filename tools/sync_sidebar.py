# -*- coding: utf-8 -*-
"""
Reconstruit les blocs .side-group du menu lateral (Mythologies / Cultures /
Creatures / Mysteres / Objets legendaires) de maniere identique sur TOUTES les
pages statiques du site (public/), et marque class="active" sur le lien
correspondant au fichier courant.

Source de verite : data/site-pages.json (ordre + titres). Ne code plus rien en
dur ici - ajouter une page = ajouter une ligne dans le JSON (ce que fait
tools/add_page.py automatiquement), puis relancer ce script.

Deux comportements ajoutes le 26/07/2026 (voir docs/audit-existant.md, A5) :
  - Un groupe ABSENT d'une page est desormais INSERE (avant la fin du <nav>)
    au lieu d'etre ignore. L'ancienne version ne savait que remplacer un bloc
    existant : ajouter une 5e categorie n'aurait jamais touche les 29 pages
    deja en ligne, et il aurait fallu repasser a la main sur 30 fichiers -
    exactement ce que ce script existe pour eviter.
  - Une categorie au tableau vide est IGNOREE (pas de groupe vide affiche).
    Une categorie apparait donc dans le menu le jour de sa premiere page.

Les pages compilees par Astro (src/pages/) n'ont pas besoin de ce script :
leur menu est genere a la compilation depuis le meme JSON.

Usage : python tools/sync_sidebar.py
"""
import glob
import json
import os
import re
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES_JSON = os.path.join(ROOT, 'data', 'site-pages.json')

# (libelle affiche, cle dans data/site-pages.json) - l'ordre est celui du menu.
LABELS = [
    ("Mythologies", "mythologies"),
    ("Cultures", "cultures"),
    ("Créatures", "creatures"),
    ("Mystères", "mysteres"),
    ("Objets légendaires", "objets"),
]


def load_groups():
    with open(PAGES_JSON, encoding='utf-8') as f:
        data = json.load(f)
    groups = []
    for label, key in LABELS:
        items = [(p['href'], p['title']) for p in data.get(key, [])]
        if not items:
            continue  # categorie sans page publiee : pas de groupe vide dans le menu
        groups.append((label, items))
    return groups


def build_group_html(label, items, current_file, indent='  '):
    lines = [f'{indent}<div class="side-label">{label}</div>', f'{indent}<div class="side-group">']
    for href, title in items:
        cls = ' class="active"' if href == current_file else ''
        lines.append(f'{indent}  <a href="{href}"{cls}>{title}</a>')
    lines.append(f'{indent}</div>')
    return '\n'.join(lines)


def patch_file(path, groups):
    current_file = os.path.basename(path)
    txt = open(path, encoding='utf-8').read()
    if '<nav id="side-menu">' not in txt:
        return None  # page sans sidebar (ne devrait pas arriver pour nos cibles)

    replaced = 0
    inserted = 0
    for label, items in groups:
        pat = re.compile(
            r'[ \t]*<div class="side-label">' + re.escape(label) + r'</div>\s*'
            r'<div class="side-group">.*?</div>',
            re.DOTALL,
        )
        new_block = build_group_html(label, items, current_file)
        new_txt, n = pat.subn(lambda m: new_block, txt, count=1)
        if n:
            txt = new_txt
            replaced += 1
            continue

        # Groupe absent : l'inserer juste avant la fin du <nav id="side-menu">,
        # donc apres le dernier groupe deja present.
        nav_end = txt.find('</nav>', txt.find('<nav id="side-menu">'))
        if nav_end < 0:
            print(f"  ATTENTION {current_file} : <nav id=\"side-menu\"> sans </nav>, groupe "
                  f"'{label}' non insere")
            continue
        txt = txt[:nav_end] + new_block + '\n' + txt[nav_end:]
        inserted += 1

    open(path, 'w', encoding='utf-8').write(txt)
    return replaced, inserted


def main():
    groups = load_groups()
    print("Groupes lus depuis data/site-pages.json : "
          + ", ".join(f"{label} ({len(items)})" for label, items in groups))

    targets = []
    for pattern in ['mythologie-*.html', 'culture-*.html', 'creature-*.html',
                    'mystere-*.html', 'objet-*.html', 'map.html']:
        # public/ uniquement : les doublons de la racine ont ete supprimes le 26/07/2026.
        targets += glob.glob(os.path.join(ROOT, 'public', pattern))
    targets = sorted(set(t for t in targets if not t.endswith('.bak')))

    total = 0
    total_inserted = 0
    for path in targets:
        res = patch_file(path, groups)
        if res is None:
            print(f"SKIP (pas de side-menu) : {path}")
            continue
        replaced, inserted = res
        suffix = f", {inserted} insere(s)" if inserted else ""
        print(f"{os.path.relpath(path, ROOT)}: {replaced}/{len(groups)} groupes mis a jour{suffix}")
        total += 1
        total_inserted += inserted

    print(f"\n{total} fichiers traites au total"
          + (f", {total_inserted} groupe(s) insere(s)" if total_inserted else ""))


if __name__ == '__main__':
    main()
