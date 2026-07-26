# icon-sources — matière première des icônes de la carte

Ce dossier ne contient **aucun** fichier servi par le site. Les icônes utilisables sont dans
`public/icons/<catégorie>/` ; ici on garde les planches brutes générées par IA et les prompts
qui les ont produites.

```
icon-sources/
├── README.md                        ← ce fichier
├── old/                             ARCHIVE — ne rien relancer en masse
│   ├── prompts-planches-icones.md   les 25 prompts du 1er lot (référence de style)
│   ├── prompts-2026-07-26.md        les 11 prompts du 2e lot
│   ├── mythologie/ culture/ creature/ mystere/ objet/
│   │   ├── <Région (n)>.png         planches brutes telles que générées
│   │   └── decoupe/                 découpes intermédiaires (lots anciens)
│   └── oubli/                       planches des pages déjà publiées, récupérées après coup
└── new/                             FILE D'ATTENTE — ce qui reste à produire
    ├── prompts-a-generer.md         état de la file (vide au 26/07/2026)
    ├── mythologie/                  ← déposer ici les planches générées
    ├── culture/
    ├── creature/
    ├── mystere/
    └── objet/
```

Tous les dossiers portent le **nom de catégorie au singulier** (`creature`, pas `creatures`) :
c'est la valeur de `cat` utilisée partout ailleurs — dans `map.html`, dans
`tools/add_page.py --cat`, dans `tools/make_icons.py --cat` et dans `public/icons/`.

## La règle qui garde ce dossier utile

**Une planche découpée passe dans `old/<catégorie>/`.** Sans ça, `new/` se remplit de planches
déjà traitées et plus personne ne sait ce qui reste à faire — la distinction old/new perd tout
son intérêt. Les 11 planches du lot du 26/07/2026 y sont déjà passées : `new/` est vide, et
c'est normal.

## Le circuit complet

1. **Générer** — copier un bloc de `new/prompts-a-generer.md` dans ChatGPT ou Gemini. Rester
   dans la même conversation d'une planche à l'autre, et réinjecter une des 189 icônes existantes
   comme référence de style.
2. **Déposer** la planche dans `new/<catégorie>/`, sous un nom simple.
3. **Contrôler la découpe** :
   ```bash
   python tools/make_icons.py icon-sources/new/objet/europe-1.png --cat objet --preview
   ```
   Un `*.preview.png` apparaît à côté de la planche, avec un cadre numéroté par forme
   détectée. Chaque cadre doit entourer une icône entière.
4. **Produire** les fichiers finaux :
   ```bash
   python tools/make_icons.py icon-sources/new/objet/europe-1.png --cat objet --slugs excalibur,graal,lance-sacree
   ```
   Sortie : `public/icons/objet/obj-excalibur.png` + `-128` + `-64` + `-32`, en RGBA carré à
   fond transparent.
5. **Placer le pin** sur la carte avec `tools/edit_map_pins.py` (positions de référence dans
   `docs/listes/positions-carte.md`), puis publier la page avec `tools/add_page.py`.

## Ce qu'il faut savoir avant de découper

- **Le placement des planches générées par IA est irrégulier** : icône à cheval sur une
  frontière de cellule, cadre dessiné autour du dessin, taches parasites. C'est pourquoi la
  découpe se fait par détection de formes et non par grille rigide, et pourquoi `--preview`
  existe. Une planche de `old/mystere/` avait même un cadre carré tracé autour de chaque
  icône et a dû être traitée à part.
- **`make_icons.py` refuse d'écrire** si le nombre de formes détectées ne correspond pas au
  nombre de slugs, ou si une icône du même nom existe déjà. Régler avec `--dilate`
  (recollement des traits d'une même icône), `--min-area` (taches) et `--seuil` (contraste).
- **Les variantes 32/64/128 ne sont pas optionnelles.** `iconUrl()` dans `map.html` choisit la
  taille selon le zoom : une icône livrée sans ses variantes donne un 404 silencieux en vue
  rapprochée.
- **Ne pas régénérer les 189 icônes en place.** Elles ont été recadrées et vérifiées une par
  une ; les prompts de `old/` sont là pour rattraper une icône isolée, pas pour un nouveau
  passage complet.

## Le gros fichier absent

`map_upscayl_2x_ultramix-balanced-4x.png` (117 Mo, agrandissement du fond de carte) est à la
racine du dépôt et **ignoré par git** : au-dessus de la limite de 100 Mo par fichier de
GitHub, il rendrait tout push impossible s'il était suivi. Le fond de carte réellement servi
est `public/map.jpg`.
