# -*- coding: utf-8 -*-
"""
Integration transverse automatisee d'une nouvelle page du site (culture,
creature, mystere ou mythologie) : ce que je faisais a la main sur ~15 Edit
par page (deplacement du pin, carte accueil, coches de statut, menu lateral)
devient un seul appel de script.

Pre-requis :
  - Le contenu de la page (root + public/) est deja ecrit et verifie.
  - L'id existe deja dans PLACES_FUTURE de map.html (positions pre-placees a
    la main par l'utilisateur via tools/edit_map_pins.py) - sinon le script
    s'arrete et demande de placer le pin manuellement d'abord.

Ce que ce script fait, dans l'ordre :
  1. map.html + public/map.html : deplace l'entree PLACES_FUTURE -> PLACES
     (ajoute href, conserve x/y/icon deja calibres).
  2. src/pages/index.astro : ajoute une carte dans la section correspondante.
  3. docs/suite_cultures.md | liste-creatures-mysteres-monde.md |
     plan-carte-icones.md : coche le statut (best-effort, recherche floue
     du nom - n'ecrit rien si 0 ou plusieurs matches, pour ne jamais
     corrompre un doc sur une correspondance ambigue).
  4. docs/site-pages.json : ajoute l'entree (menu lateral).
  5. Lance tools/sync_sidebar.py automatiquement.

Ce que ce script NE fait PAS (laisse a la charge de l'appelant, volontairement
non automatise car trop specifique/texte libre pour etre fiable) :
  - Retirer la mention de la section "#a-venir" de index.astro.
  - Choisir/ecrire le teaser "next-up" dans le footer de la page.

Usage :
  python tools/add_page.py --id cult-mali --cat culture --href culture-mali.html \
    --menu-title "Empire du Mali" --card-title "Empire du Mali" \
    --epigraph "Tombouctou" --hook "Mansa Moussa, l'or et le sel : l'age d'or du Sahel." \
    --status-name "Empire du Mali"
"""
import argparse
import json
import os
import re
import subprocess
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAP_FILES = [os.path.join(ROOT, 'map.html'), os.path.join(ROOT, 'public', 'map.html')]
INDEX_ASTRO = os.path.join(ROOT, 'src', 'pages', 'index.astro')
PAGES_JSON = os.path.join(ROOT, 'docs', 'site-pages.json')
STATUS_DOCS = [
    os.path.join(ROOT, 'docs', 'suite_cultures.md'),
    os.path.join(ROOT, 'docs', 'liste-creatures-mysteres-monde.md'),
    os.path.join(ROOT, 'docs', 'plan-carte-icones.md'),
]

CAT_META = {
    'mythologie': {'places_label': 'Mythologies', 'json_key': 'mythologies', 'astro_section': 'mythologies'},
    'culture':    {'places_label': 'Cultures',    'json_key': 'cultures',    'astro_section': 'cultures'},
    'creature':   {'places_label': 'Créatures',   'json_key': 'creatures',   'astro_section': 'creatures'},
    'mystere':    {'places_label': 'Mystères',    'json_key': 'mysteres',    'astro_section': 'mysteres'},
}


def activate_pin(map_path, page_id, href, cat):
    lines = open(map_path, encoding='utf-8').read().split('\n')

    future_idx = None
    for i, line in enumerate(lines):
        if f"id:'{page_id}'" in line and 'status:' in line:
            future_idx = i
            break
    if future_idx is None:
        print(f"ERREUR : id '{page_id}' introuvable dans PLACES_FUTURE de {map_path}")
        return None

    entry_line = lines[future_idx]
    # (?:[^'\\]|\\.)* gere les apostrophes echappees (\') dans les titres, ex.
    # "Mécanisme d\'Anticythère" - un [^']* naif tronquerait au premier \'.
    title = re.search(r"title:'((?:[^'\\]|\\.)*)'", entry_line).group(1).replace("\\'", "'")
    x = re.search(r"x:([\d.]+)", entry_line).group(1)
    y = re.search(r"y:([\d.]+)", entry_line).group(1)
    icon = re.search(r"icon:'([^']*)'", entry_line).group(1)

    del lines[future_idx]

    label = CAT_META[cat]['places_label']
    label_line_idx = None
    for i, line in enumerate(lines):
        if line.strip() == f"// {label}":
            label_line_idx = i
            break
    if label_line_idx is None:
        print(f"ERREUR : bloc '// {label}' introuvable dans PLACES de {map_path}")
        return None

    insert_idx = label_line_idx + 1
    while insert_idx < len(lines):
        stripped = lines[insert_idx].strip()
        if stripped.startswith('//') or stripped == '];':
            break
        insert_idx += 1
    last_entry_idx = insert_idx - 1
    if not lines[last_entry_idx].rstrip().endswith(','):
        lines[last_entry_idx] = lines[last_entry_idx].rstrip() + ','

    title_escaped = title.replace("'", "\\'")
    new_entry = (
        f"  {{ id:'{page_id}', title:'{title_escaped}', cat:'{cat}', href:'{href}', "
        f"x:{x}, y:{y}, icon:'{icon}' }}"
    )
    next_line = lines[insert_idx] if insert_idx < len(lines) else '];'
    if next_line.strip() != '];':
        new_entry += ','
    lines.insert(insert_idx, new_entry)

    open(map_path, 'w', encoding='utf-8').write('\n'.join(lines))
    return {'title': title, 'x': x, 'y': y, 'icon': icon}


def add_index_card(cat, href, epigraph, card_title, hook):
    section_id = CAT_META[cat]['astro_section']
    txt = open(INDEX_ASTRO, encoding='utf-8').read()
    pat = re.compile(
        r'(<section id="' + re.escape(section_id) + r'">.*?<div class="grid">\n)(.*?)(\n {4}</div>\n {2}</section>)',
        re.DOTALL
    )
    m = pat.search(txt)
    if not m:
        print(f"ERREUR : section '{section_id}' introuvable dans index.astro")
        return False
    new_card = (
        f'      <a class="card" href={{`${{base}}{href}`}}>\n'
        f'        <div class="epigraph">{epigraph}</div>\n'
        f'        <h3>{card_title}</h3>\n'
        f'        <p>{hook}</p>\n'
        f'      </a>'
    )
    new_middle = m.group(2) + '\n' + new_card
    txt = txt[:m.start()] + m.group(1) + new_middle + m.group(3) + txt[m.end():]
    open(INDEX_ASTRO, 'w', encoding='utf-8').write(txt)
    return True


def flag_status_doc(path, status_name):
    txt = open(path, encoding='utf-8').read()
    lines = txt.split('\n')
    matches = []
    for i, line in enumerate(lines):
        if not line.startswith('|'):
            continue
        cell = line.split('|')[1].strip()
        cell_clean = cell.replace('✅', '').strip()
        if status_name.lower() in cell_clean.lower() or cell_clean.lower() in status_name.lower():
            if '✅' not in cell:
                matches.append(i)
    if len(matches) != 1:
        print(f"  SKIP {os.path.basename(path)} : {len(matches)} correspondance(s) pour "
              f"'{status_name}' (0 ou >1 -> pas touche, a faire a la main)")
        return False
    i = matches[0]
    parts = lines[i].split('|')
    parts[1] = parts[1].rstrip() + ' ✅ '
    # heuristique plan-carte-icones.md : 2e colonne "icône prête" -> "✅ fait"
    if len(parts) > 2 and 'icône prête' in parts[2]:
        parts[2] = parts[2].replace('icône prête', '✅ fait')
        parts[1] = parts[1].replace(' ✅ ', ' ')  # pas de doublon d'un ✅ sur ce doc
    lines[i] = '|'.join(parts)
    open(path, 'w', encoding='utf-8').write('\n'.join(lines))
    print(f"  OK {os.path.basename(path)} : ligne {i+1} marquee")
    return True


def _dump_compact(data):
    """Serialise avec un objet par ligne (plus lisible/diffable que json.dump indent=2)."""
    order = ['mythologies', 'cultures', 'creatures', 'mysteres']
    lines = ['{', f'  "_comment": {json.dumps(data["_comment"], ensure_ascii=False)},']
    for i, key in enumerate(order):
        lines.append(f'  "{key}": [')
        items = data[key]
        for j, item in enumerate(items):
            comma = ',' if j < len(items) - 1 else ''
            entry = json.dumps(item, ensure_ascii=False)
            lines.append(f'    {entry}{comma}')
        comma = ',' if i < len(order) - 1 else ''
        lines.append(f'  ]{comma}')
    lines.append('}')
    return '\n'.join(lines) + '\n'


def update_pages_json(cat, href, menu_title):
    with open(PAGES_JSON, encoding='utf-8') as f:
        data = json.load(f)
    key = CAT_META[cat]['json_key']
    if any(p['href'] == href for p in data[key]):
        print(f"  SKIP site-pages.json : '{href}' deja present")
        return
    data[key].append({'href': href, 'title': menu_title})
    with open(PAGES_JSON, 'w', encoding='utf-8') as f:
        f.write(_dump_compact(data))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--id', required=True, help="id du pin dans PLACES_FUTURE, ex: cult-mali")
    ap.add_argument('--cat', required=True, choices=list(CAT_META))
    ap.add_argument('--href', required=True, help="nom de fichier, ex: culture-mali.html")
    ap.add_argument('--menu-title', required=True, help="titre affiche dans le menu lateral")
    ap.add_argument('--card-title', help="titre affiche sur la carte accueil (defaut: menu-title)")
    ap.add_argument('--epigraph', required=True)
    ap.add_argument('--hook', required=True, help="phrase d'accroche de la carte accueil")
    ap.add_argument('--status-name', help="texte a rechercher dans les docs de suivi (defaut: menu-title)")
    args = ap.parse_args()

    card_title = args.card_title or args.menu_title
    status_name = args.status_name or args.menu_title

    print(f"== 1. Activation du pin '{args.id}' sur la carte ==")
    for map_path in MAP_FILES:
        result = activate_pin(map_path, args.id, args.href, args.cat)
        if result is None:
            sys.exit(1)
        print(f"  OK {os.path.relpath(map_path, ROOT)} : x={result['x']} y={result['y']} icon={result['icon']}")

    print(f"== 2. Carte accueil (index.astro) ==")
    if not add_index_card(args.cat, args.href, args.epigraph, card_title, args.hook):
        sys.exit(1)
    print("  OK carte ajoutee")

    print(f"== 3. Statuts docs (best-effort) ==")
    for doc in STATUS_DOCS:
        flag_status_doc(doc, status_name)

    print(f"== 4. docs/site-pages.json ==")
    update_pages_json(args.cat, args.href, args.menu_title)
    print("  OK")

    print(f"== 5. Resynchronisation du menu lateral ==")
    subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'sync_sidebar.py')], check=True)

    print("\nTermine. Reste a faire a la main : ajuster la section #a-venir de "
          "index.astro et verifier les SKIP ci-dessus si besoin.")


if __name__ == '__main__':
    main()
