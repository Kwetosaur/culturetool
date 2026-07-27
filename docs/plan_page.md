# Plan global — à relire avant TOUTE nouvelle page ou modification du site

Point d'entrée unique. Écrit après avoir livré 3 pages (Rome antique, Bigfoot, Col Dyatlov)
sans les effets bespoke — l'oubli qui a motivé ce document. Objectif : ne plus jamais
zapper une étape parce qu'un plan vivait dans un fichier qu'on n'a pas pensé à ouvrir.
Depuis le 26/07/2026, un `CLAUDE.md` à la racine renvoie ici pour que ce fichier soit
chargé sans qu'on ait à y penser.

**Règle : avant d'écrire une nouvelle page, ou de toucher au site, lire ce fichier en
entier, puis ouvrir chaque doc listé qui concerne la tâche en cours — pas juste celui qui
semble le plus évident.**

---

## 0. Les cinq séries

| Série | Fichiers | Plan de série | Liste de sujets | Publiées |
|---|---|---|---|---|
| Mythologies | `mythologie-*.html` | `docs/plans/plan-serie-mythologies.md` | `docs/listes/suite_mythologies.md` | 11 |
| Cultures | `culture-*.html` | `docs/gabarits/gabarit-culture.html` | `docs/listes/suite_cultures.md` | 6 |
| Créatures | `creature-*.html` | `docs/plans/plan-serie-creatures.md` | `docs/listes/liste-creatures-mysteres-monde.md` | 6 |
| Mystères | `mystere-*.html` | `docs/plans/plan-serie-mysteres.md` | `docs/listes/liste-creatures-mysteres-monde.md` | 6 |
| **Objets légendaires** | `objet-*.astro` | `docs/plans/plan-serie-objets.md` | `docs/listes/suite_objets.md` | **1** |

Une même civilisation peut légitimement avoir plusieurs pages sous des angles différents
(l'Égypte a une page mythologie ET une page culture) — c'est le modèle, pas une exception.
Les recoupements volontaires et ceux à éviter sont documentés dans chaque plan de série.

---

## 1. Rédiger une nouvelle page de contenu

### Deux façons d'écrire une page, depuis le 26/07/2026

- **Page statique** (`public/<nom>.html`) — la façon historique, celle des 29 pages en
  ligne. Gabarits légers dans `docs/gabarits/`.
- **Page compilée** (`src/pages/<nom>.astro`) — la nouvelle façon, à utiliser **par défaut
  pour toute page neuve**. On n'écrit plus que le contenu : l'ossature (head, CSS, menu
  latéral, nav collante, scripts, balises de partage) vient de `src/layouts/PageLayout.astro`,
  et les blocs répétitifs de `src/components/`. Environ 20 ko de texte en moins par page.
  **À lire pour savoir quoi écrire : `src/pages/socle-demo.astro`** (~200 lignes, tous les
  composants instanciés) au lieu d'un gabarit de 580 lignes. Le raisonnement complet est
  dans `docs/plans/plan-industrialisation.md`.

Les deux mondes cohabitent sans effort : `build.format: 'file'` fait compiler
`src/pages/objet-excalibur.astro` vers `dist/objet-excalibur.html`, donc mêmes URL, mêmes
liens relatifs, mêmes `href` dans `map.html`.

### Lire dans l'ordre avant d'écrire

1. **Le plan de la série concernée** (tableau du § 0) — structure obligatoire, ordre des
   sections, ton, principes de fond.
2. **La liste de sujets** correspondante, pour choisir/valider le sujet et son score.
3. **`docs/plans/plan-effets.md`** — ⚠️ celui qu'on oublie. Chaque page doit avoir 1 à 3 pistes
   d'effet bespoke, câblées à la fois en easter egg (`data-egg` + entrée dans `EGGS`) et en
   happening au scroll (`data-scroll-fx` sur une section clé + entrée dans `SCROLL_FX`).
   **Les 159 pages à venir ont désormais toutes au moins une piste écrite** dans ce fichier :
   la consulter avant d'improviser. **Décider les 2 clefs et écrire les fonctions JS
   correspondantes dans `effects.js` avant ou en parallèle de la rédaction** — un agent de
   rédaction n'a besoin que de connaître les 2 clefs, il n'écrit jamais l'effet lui-même.
4. **`docs/plans/plan-carte-icones.md`** — **au 26/07/2026, les 189 sujets des listes ont déjà
   leur icône et leur pin placé.** Pour n'importe quelle page candidate, il n'y a donc rien à
   générer : l'icône est dans `public/icons/<catégorie>/` (4 tailles) et le pin attend dans
   `PLACES_FUTURE`. Vérifier quand même le statut de la ligne — `icône prête` = icône et pin
   OK, page à écrire.

   Pour un sujet **hors** des listes actuelles, le circuit complet est dans
   `icon-sources/README.md` : écrire le prompt dans `icon-sources/new/prompts-a-generer.md`,
   générer la planche, la déposer dans `icon-sources/new/<catégorie>/`, puis
   `python tools/make_icons.py <planche.png> --cat <catégorie> --slugs a,b,c` (découpe, fond
   transparent, 4 tailles, nommage), et enfin placer le pin.

### Sources — obligatoire depuis le 27/07/2026 (pages Astro)

Chaque page Astro doit se terminer par une bibliographie réelle, ajoutée via
`src/components/Sources.astro` :

```astro
import Sources from '../components/Sources.astro';
...
  <Section id="heritage" ...>...</Section>

  <Sources items={[
    { label: "Auteur, Titre, Éditeur/Revue, Année", url: "https://...", note: "Ce que cette source appuie précisément sur la page" },
    { label: "Autre référence sans lien disponible" },
  ]} />
</PageLayout>
```

Règles :
- **3 à 6 sources réelles et vérifiables** par page — ouvrages, articles
  académiques, sites institutionnels/muséaux/encyclopédiques de référence.
  Jamais une bibliographie générique de remplissage : chaque entrée doit
  appuyer une affirmation précise déjà présente sur la page.
- **Ne jamais inventer une URL.** Si aucun lien fiable n'est trouvé pour un
  ouvrage, laisser `url` absent — la citation textuelle suffit.
- Placé **après la dernière `<Section>`, avant `</PageLayout>`** — ce n'est
  volontairement **pas** une `<Section>` : pas de pilule de nav, pas
  d'entrée dans le compte "N sections" de chaque plan de série (voir
  `src/components/Sources.astro` pour le détail de ce choix).
- Portée actuelle : les pages **Astro** (`src/pages/*.astro`) uniquement.
  Les pages statiques historiques (`public/*.html`) n'ont pas encore été
  converties — à traiter dans un tour séparé, probablement lors d'une
  migration vers le socle Astro.

### Puis, une fois la page écrite

Un seul fichier dans les deux cas : `public/<nom>.html` ou `src/pages/<nom>.astro`.

5. **`python tools/add_page.py ...`** — fait toute l'intégration transverse en un appel :
   déplace le pin `PLACES_FUTURE` → `PLACES` dans `public/map.html`, ajoute l'entrée
   (titre + épigraphe + accroche) dans `data/site-pages.json`, coche le statut dans les
   4 docs de suivi, relance `sync_sidebar.py`, et valide le JS de `map.html`.

   ```bash
   python tools/add_page.py --id obj-excalibur --cat objet --href objet-excalibur.html --menu-title "Excalibur" --epigraph "Bretagne · XIIe s." --hook "L'épée la plus célèbre du monde n'a jamais existé." --status-name "Excalibur"
   ```

   Pré-requis : le pin doit déjà exister dans `PLACES_FUTURE` (placé à la main avec
   `tools/edit_map_pins.py`), sinon le script s'arrête.

   **Lire les lignes `SKIP` affichées.** Le script ne coche un statut que sur une
   correspondance unique et sans ambiguïté ; 4 pages publiées sont restées non cochées
   pendant des semaines faute d'avoir relu ces lignes (voir `docs/audit-existant.md` § B).

6. À la main (volontairement non automatisé, texte libre) : ajuster la liste `A_VENIR` de
   `src/pages/index.astro` si le sujet y était annoncé, et corriger les `SKIP`.
7. Mettre à jour `docs/plans/plan-effets.md` (ligne « Déjà fait » + retirer la piste de la section
   « à venir ») si ce n'est pas déjà fait à l'étape 3.
8. `npm run build`, puis vérifier dans le navigateur : page seule + carte + accueil + menu
   latéral + easter egg + happening au scroll, sans erreur console. Commit, push, surveiller
   le déploiement GitHub Actions.

### Ce qui n'a plus besoin d'être fait à la main

- **La carte de la page d'accueil** : `index.astro` génère ses 5 sections par boucle depuis
  `data/site-pages.json`. Ne plus jamais y ajouter de carte à la main, et ne plus jamais y
  écrire un nombre en dur (le titre « Onze Mythologies » est calculé).
- **Le menu latéral des pages Astro** : généré à la compilation depuis le même JSON.
- **La liste du reveal au scroll** des pages Astro : le layout cible `[data-reveal]`, que
  les composants portent eux-mêmes. Sur les pages **statiques**, cette liste reste écrite à
  la main et **24 des 29 pages en ligne l'ont fausse** (voir `docs/audit-existant.md` § A2) : si
  vous écrivez encore une page statique, vérifier que la liste correspond aux vraies classes
  de cette page.

**Note sur `tools/sync_sidebar.py`** : lit `data/site-pages.json`, ne code plus aucune liste
en dur, sait maintenant **insérer** un groupe de menu absent (donc une nouvelle catégorie
apparaît partout sans retouche manuelle) et **ignore** une catégorie encore vide.

---

## 2. Toucher à la carte interactive (`map.html`)

Lire `docs/plans/carte-monde-interactive.md` (contexte/objectif d'origine), `docs/plans/plan-carte-icones.md`
(icônes et statut), `docs/listes/positions-carte.md` (référence géographique — les 189 positions
ont été placées manuellement, ne pas les re-générer par formule sans relire pourquoi une
approche géographique globale a été testée puis abandonnée). Outil d'édition :
`tools/edit_map_pins.py`, avec un filtre « à placer » pour les pins pas encore calés.

**Piège de nommage** : le rendu d'un pin fait `var(--' + p.cat + ')`. La variable CSS doit
donc s'appeler **exactement** `--<cat>`, sinon le pin tombe silencieusement sur le fallback
`var(--gold)` — doré, sans aucune erreur en console (voir `docs/audit-existant.md` § A1).

**Après toute modification** :

```bash
node tools/check_map.cjs public/map.html
```

---

## 3. Toucher aux effets (`effects.js`)

Lire `docs/plans/plan-effets.md` en entier — c'est le seul document qui explique l'architecture
(couches 0 à 4, `EGGS`/`SCROLL_FX`/`GLYPH_POOLS`, pièges déjà rencontrés listés en tête).
Un seul fichier à éditer : `public/effects.js` (plus de copie miroir depuis le 26/07/2026).

Portée du déchiffrement d'inscriptions (`fx-decode`) : **mythologies et objets légendaires
seulement**, c'est un arbitrage assumé et expliqué dans `docs/plans/plan-effets.md`.

---

## 4. Icônes de la carte

`docs/plans/plan-carte-icones.md` (statut par page, couleurs, collisions à trancher) et
`icon-sources/README.md` (le circuit complet planche → icône).

Les prompts encore à passer : `icon-sources/new/prompts-a-generer.md` — **65 icônes en
11 planches**. `icon-sources/old/` est une archive de référence de style, à ne pas relancer
en masse (ça écraserait 124 icônes recadrées à la main).

La découpe est outillée :

```bash
python tools/make_icons.py icon-sources/new/objet/europe-1.png --cat objet --preview
```

puis la vraie passe avec `--slugs a,b,c`. Le script produit le master 300 px et les
variantes 32/64/128 à fond transparent, et refuse d'écrire si le nombre de formes détectées
ne colle pas au nombre de slugs.

---

## Rappels transverses

- **Une seule copie de chaque fichier.** Jusqu'au 26/07/2026, tout fichier HTML/JS existait
  en double (racine + `public/`), et éditer un seul côté était l'erreur la plus fréquente du
  projet. Les 31 doublons de la racine ont été supprimés : ils étaient strictement
  identiques et le déploiement ne les lisait jamais (il publie `dist/`, généré par
  `astro build`). **`public/` est la seule source** des pages statiques, de `map.html`, de
  `effects.js` et de `map.jpg`.
- **`npm run build` régénère `dist/`** à partir de `public/` et `src/` — `dist/` n'est jamais
  édité à la main, et un fichier ouvert directement dans le navigateur
  (`file:///.../dist/...`) ne reflète pas les changements tant qu'on n'a pas rebuild.
- **Ne jamais committer/pusher** sans que l'utilisateur l'ait explicitement demandé pour ce
  tour-ci.
