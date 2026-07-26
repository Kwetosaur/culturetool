# tools — l'outillage du dépôt

Cinq scripts. Aucun n'est un « utilitaire pratique » : chacun remplace une série de retouches
manuelles qui avaient déjà produit des bugs réels (virgule manquante cassant le JS de la
carte, menu latéral désynchronisé, statuts jamais cochés, icônes mal nommées).

| Script | Ce qu'il fait | Quand |
|---|---|---|
| **add_page.py** | Intégration transverse d'une page qu'on vient d'écrire : pin `PLACES_FUTURE` → `PLACES`, entrée dans `data/site-pages.json` (donc carte d'accueil + menu), coche des statuts dans les 5 docs de suivi, puis enchaîne `sync_sidebar.py` et `check_map.cjs`. | Après avoir écrit une page |
| **sync_sidebar.py** | Reconstruit les blocs du menu latéral, à l'identique, sur toutes les pages statiques de `public/`, depuis `data/site-pages.json`. Sait insérer un groupe absent et ignore une catégorie vide. | Après tout changement de `data/site-pages.json` (appelé automatiquement par `add_page.py`) |
| **make_icons.py** | Découpe une planche générée par IA et produit les icônes finales : détection de formes, recadrage, fond transparent, carré 300 px + variantes 128/64/32, nommage. | Après avoir déposé une planche dans `icon-sources/new/<cat>/` |
| **edit_map_pins.py** | Éditeur graphique (Tkinter) pour placer les pins à l'œil sur le fond de carte, avec filtres par catégorie et déplacement au clavier. | Avant de publier une page dont le pin n'existe pas encore |
| **check_map.cjs** | Vérifie que `PLACES` et `PLACES_FUTURE` de `map.html` restent du JS parsable, sans id en doublon ni pin sans icône. | Après toute modification de `map.html` |

## L'ordre normal des choses

```bash
# 1. l'icône : planche déposée dans icon-sources/new/<cat>/
python tools/make_icons.py icon-sources/new/objet/europe-1.png --cat objet --preview
python tools/make_icons.py icon-sources/new/objet/europe-1.png --cat objet --slugs excalibur,graal
```

```bash
# 2. le pin, à placer à l'œil (positions de référence : docs/listes/positions-carte.md)
python tools/edit_map_pins.py
```

```bash
# 3. la page écrite, on l'intègre partout d'un coup
python tools/add_page.py --id obj-excalibur --cat objet --href objet-excalibur.html --menu-title "Excalibur" --epigraph "Bretagne · XIIe s." --hook "L'épée la plus célèbre du monde n'a jamais existé."
```

```bash
# 4. contrôle
node tools/check_map.cjs public/map.html
npm run build
```

## Ce qu'ils ont en commun

- **Ils refusent d'agir sur une situation ambiguë** plutôt que de deviner. `add_page.py`
  n'écrit pas un statut s'il trouve 0 ou plusieurs correspondances (et affiche `SKIP` — **il
  faut lire ces lignes**). `make_icons.py` n'écrit rien si le nombre de formes détectées ne
  colle pas au nombre de slugs. Le coût d'un rattrapage est toujours supérieur au coût d'une
  relance.
- **`data/site-pages.json` est la seule source** de l'ordre et des titres des pages. Aucun
  script ne code de liste en dur, et aucun ne patche plus de HTML par expression régulière
  pour la page d'accueil.
- **`public/` est la seule copie.** Les 31 doublons de la racine ont été supprimés le
  26/07/2026 : identiques, et jamais lus par le déploiement, qui publie `dist/` produit par
  `astro build`.
- **`check_map.cjs` porte l'extension `.cjs` et non `.js`** parce que `package.json` déclare
  `"type": "module"` : un `.js` serait chargé comme module ES et son `require()` échouerait.

## Pré-requis

`add_page.py`, `sync_sidebar.py` : Python 3, rien d'autre.
`edit_map_pins.py` : Python 3 + Tkinter + Pillow.
`make_icons.py` : Python 3 + Pillow + numpy + scipy (`pip install pillow numpy scipy`).
`check_map.cjs` : Node 22+.
