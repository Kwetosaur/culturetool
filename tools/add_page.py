# -*- coding: utf-8 -*-
"""
Integration transverse automatisee d'une nouvelle page du site (mythologie,
culture, creature, mystere ou objet legendaire) : ce que je faisais a la main sur
~15 Edit par page (deplacement du pin, carte accueil, coches de statut, menu
lateral) devient un seul appel de script.

Pre-requis :
  - Le contenu de la page est deja ecrit et verifie : public/<nom>.html pour une
    page statique, src/pages/<nom>.astro pour une page compilee.
  - L'id existe deja dans PLACES_FUTURE de map.html (positions pre-placees a
    la main par l'utilisateur via tools/edit_map_pins.py) - sinon le script
    s'arrete et demande de placer le pin manuellement d'abord.

Ce que ce script fait, dans l'ordre :
  1. public/map.html : deplace l'entree PLACES_FUTURE -> PLACES
     (ajoute href, conserve x/y/icon deja calibres).
  2. data/site-pages.json : ajoute l'entree avec son epigraph et son hook.
     C'est desormais la SEULE source des cartes de la page d'accueil :
     src/pages/index.astro les genere par boucle depuis ce fichier, donc il n'y
     a plus rien a patcher dans index.astro (c'etait l'etape la plus fragile de
     l'ancienne version : une expression reguliere sur du HTML).
  3. docs/listes/*.md + docs/plans/plan-carte-icones.md : coche le statut (best-effort, recherche floue du nom - n'ecrit
     rien si 0 ou plusieurs matches, pour ne jamais corrompre un doc sur une
     correspondance ambigue). LIRE LES LIGNES 'SKIP' AFFICHEES : 4 pages
     publiees sont restees non cochees pendant des semaines faute de l'avoir
     fait (voir docs/audit-existant.md).
  4. Lance tools/sync_sidebar.py (menu lateral des pages statiques).
  5. Lance tools/check_map.cjs si node est disponible (validation JS de map.html).

Ce que ce script NE fait PAS (laisse a la charge de l'appelant, volontairement
non automatise car trop specifique/texte libre pour etre fiable) :
  - Ajuster la liste A_VENIR de index.astro (texte libre).
  - Choisir/ecrire le teaser "next-up" dans le footer de la page.

Usage :
  python tools/add_page.py --id obj-excalibur --cat objet --href objet-excalibur.html \
    --menu-title "Excalibur" --card-title "Excalibur" \
    --epigraph "Bretagne, 1136" --hook "L'epee la plus celebre du monde n'a jamais existe." \
    --status-name "Excalibur"
"""
import argparse
import json
import os
import re
import shutil
import subprocess
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# Une seule copie depuis le nettoyage du 26/07/2026 : les 31 fichiers dupliques a la
# racine ont ete supprimes (identiques a public/, jamais lus par le deploiement, qui
# publie dist/ genere par astro build). public/ est la seule source.
MAP_FILES = [os.path.join(ROOT, 'public', 'map.html')]
PAGES_JSON = os.path.join(ROOT, 'data', 'site-pages.json')
STATUS_DOCS = [
    os.path.join(ROOT, 'docs', 'listes', 'suite_mythologies.md'),
    os.path.join(ROOT, 'docs', 'listes', 'suite_cultures.md'),
    os.path.join(ROOT, 'docs', 'listes', 'suite_objets.md'),
    os.path.join(ROOT, 'docs', 'listes', 'liste-creatures-mysteres-monde.md'),
    os.path.join(ROOT, 'docs', 'plans', 'plan-carte-icones.md'),
]

# places_label = le commentaire qui sert d'ancre dans PLACES de map.html.
# json_key = la cle dans data/site-pages.json (et donc l'ordre des sections
# de l'accueil et du menu lateral).
CAT_META = {
    'mythologie': {'places_label': 'Mythologies',        'json_key': 'mythologies'},
    'culture':    {'places_label': 'Cultures',           'json_key': 'cultures'},
    'creature':   {'places_label': 'Créatures',          'json_key': 'creatures'},
    'mystere':    {'places_label': 'Mystères',           'json_key': 'mysteres'},
    'objet':      {'places_label': 'Objets légendaires', 'json_key': 'objets'},
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

    # La nouvelle entree s'insere en insert_idx : l'element juste AVANT elle doit
    # donc finir par une virgule. Deux pieges, tous deux rencontres pour de vrai :
    #  - si le bloc de la categorie est vide (premiere page d'une categorie neuve),
    #    la ligne precedente est le commentaire d'ancrage : lui ajouter une virgule
    #    produit "// Objets légendaires," et casse tout le JS de la carte ;
    #  - dans ce meme cas, c'est la derniere entree du bloc PRECEDENT qui a besoin
    #    de la virgule, puisque c'est elle que la nouvelle entree suit.
    # D'ou la remontee en sautant les lignes de commentaire et les lignes vides.
    prev_idx = insert_idx - 1
    while prev_idx > 0 and (lines[prev_idx].strip().startswith('//') or not lines[prev_idx].strip()):
        prev_idx -= 1
    if lines[prev_idx].strip().endswith('}') and not lines[prev_idx].rstrip().endswith(','):
        lines[prev_idx] = lines[prev_idx].rstrip() + ','

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


def flag_status_doc(path, status_name):
    if not os.path.exists(path):
        print(f"  SKIP {os.path.basename(path)} : fichier absent")
        return False
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
    # heuristique docs/plans/plan-carte-icones.md : 2e colonne "icône prête"/"à générer" -> "✅ fait"
    if len(parts) > 2 and ('icône prête' in parts[2] or 'à générer' in parts[2]):
        parts[2] = parts[2].replace('icône prête', '✅ fait').replace('à générer', '✅ fait')
        parts[1] = parts[1].replace(' ✅ ', ' ')  # pas de doublon d'un ✅ sur ce doc
    lines[i] = '|'.join(parts)
    open(path, 'w', encoding='utf-8').write('\n'.join(lines))
    print(f"  OK {os.path.basename(path)} : ligne {i+1} marquee")
    return True


# Ordre d'affichage des series (accueil + menu lateral). Une cle presente dans
# le JSON mais absente d'ici est conservee et ecrite a la fin : ne JAMAIS
# reintroduire une liste codee en dur qui filtre les cles, l'ancienne version
# supprimait silencieusement toute categorie inconnue a la premiere reecriture.
ORDER_HINT = ['mythologies', 'cultures', 'creatures', 'mysteres', 'objets']


def _dump_compact(data):
    """Serialise avec un objet par ligne (plus lisible/diffable que json.dump indent=2)."""
    keys = ([k for k in ORDER_HINT if k in data]
            + [k for k in data if k not in ORDER_HINT and not k.startswith('_')])
    lines = ['{', '  "_comment": %s,' % json.dumps(data['_comment'], ensure_ascii=False)]
    for i, key in enumerate(keys):
        tail = ',' if i < len(keys) - 1 else ''
        items = data[key]
        if not items:
            lines.append(f'  "{key}": []{tail}')
            continue
        lines.append(f'  "{key}": [')
        for j, item in enumerate(items):
            comma = ',' if j < len(items) - 1 else ''
            lines.append('    %s%s' % (json.dumps(item, ensure_ascii=False), comma))
        lines.append(f'  ]{tail}')
    lines.append('}')
    return '\n'.join(lines) + '\n'


def update_pages_json(cat, href, menu_title, card_title, epigraph, hook):
    with open(PAGES_JSON, encoding='utf-8') as f:
        data = json.load(f)
    key = CAT_META[cat]['json_key']
    data.setdefault(key, [])
    if any(p['href'] == href for p in data[key]):
        print(f"  SKIP data/site-pages.json : '{href}' deja present")
        return
    entry = {'href': href, 'title': menu_title}
    if card_title != menu_title:
        entry['cardTitle'] = card_title
    entry['epigraph'] = epigraph
    entry['hook'] = hook
    data[key].append(entry)
    with open(PAGES_JSON, 'w', encoding='utf-8') as f:
        f.write(_dump_compact(data))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--id', required=True, help="id du pin dans PLACES_FUTURE, ex: obj-excalibur")
    ap.add_argument('--cat', required=True, choices=list(CAT_META))
    ap.add_argument('--href', required=True, help="nom de fichier, ex: objet-excalibur.html")
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

    print("== 2. data/site-pages.json (carte accueil + menu) ==")
    update_pages_json(args.cat, args.href, args.menu_title, card_title, args.epigraph, args.hook)
    print("  OK")

    print("== 3. Statuts docs (best-effort) ==")
    for doc in STATUS_DOCS:
        flag_status_doc(doc, status_name)

    print("== 4. Resynchronisation du menu lateral ==")
    subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'sync_sidebar.py')], check=True)

    print("== 5. Validation JS de map.html ==")
    node = shutil.which('node')
    if node:
        subprocess.run([node, os.path.join(ROOT, 'tools', 'check_map.cjs')] + MAP_FILES, check=False)
    else:
        print("  node introuvable - lancer a la main : node tools/check_map.cjs public/map.html")

    print("\nTermine. Reste a faire a la main : ajuster la liste A_VENIR de "
          "index.astro si besoin, et verifier les SKIP ci-dessus.")


if __name__ == '__main__':
    main()
