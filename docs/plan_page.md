# Plan global — à relire avant TOUTE nouvelle page ou modification du site

Point d'entrée unique. Écrit après avoir livré 3 pages (Rome antique, Bigfoot, Col Dyatlov)
sans les effets bespoke — l'oubli qui a motivé ce document. Objectif : ne plus jamais
zapper une étape parce qu'un plan vivait dans un fichier qu'on n'a pas pensé à ouvrir.

**Règle : avant d'écrire une nouvelle page, ou de toucher au site, lire ce fichier en
entier, puis ouvrir chaque doc listé qui concerne la tâche en cours — pas juste celui qui
semble le plus évident.**

---

## 1. Rédiger une nouvelle page de contenu (mythologie / culture / créature / mystère)

**Process industrialisé (depuis le 26/07/2026)** — objectif : ne jamais faire lire à un
agent une page complète de ~1000 lignes juste pour en retrouver le patron, et ne jamais
refaire à la main la même quinzaine d'edits transverses à chaque page. Deux outils portent
maintenant ce travail :

- **`docs/gabarit-culture.html` / `gabarit-creature.html` / `gabarit-mystere.html`** —
  squelettes structurels légers (CSS/classes/nav 100% fidèles, contenu réduit à 1 exemple
  par bloc répétitif avec un commentaire indiquant combien en reproduire). C'est CE fichier
  qu'un agent de rédaction doit lire comme gabarit, pas une page existante complète.
  (Pas de gabarit mythologie séparé pour l'instant — les 10 pages mythologie suivent déjà
  `plan-serie-mythologies.md` de façon stricte, se baser sur une page récente si besoin.)
- **`tools/add_page.py`** — script qui fait toute l'intégration transverse mécanique
  (étapes 5 à 8 ci-dessous) en un seul appel, à partir du moment où le pin existe déjà
  dans `PLACES_FUTURE` de `map.html` (voir section 2). Usage :
  `python tools/add_page.py --id <id> --cat <culture|creature|mystere|mythologie> --href <fichier.html> --menu-title "..." --epigraph "..." --hook "..." [--card-title "..."] [--status-name "..."]`

Lire dans l'ordre avant d'écrire :

1. **Le plan de la série concernée** — structure obligatoire (sections, ordre des ids, ton) :
   - `plan-serie-mythologies.md`
   - `docs/gabarit-culture.html` (culture)
   - `plan-serie-creatures.md` + `docs/gabarit-creature.html`
   - `plan-serie-mysteres.md` + `docs/gabarit-mystere.html`
2. **La liste de sujets** correspondante, pour choisir/valider le sujet et son score :
   - `suite_mythologies.md` (mythologies)
   - `suite_cultures.md` (cultures)
   - `liste-creatures-mysteres-monde.md` (créatures et mystères, les deux dans le même fichier)
3. **`plan-effets.md`** — ⚠️ celui qu'on oublie. Chaque page doit avoir 1 à 3 pistes d'effet
   bespoke (au moins la version générique `glyphShower` si le temps manque), câblées à la
   fois en easter egg (`data-egg` + entrée dans `EGGS`) et en happening au scroll
   (`data-scroll-fx` sur une section clé + entrée dans `SCROLL_FX`). Ce fichier liste déjà
   des idées prêtes à l'emploi pour beaucoup de sujets à venir — les consulter avant
   d'improviser. **Décider les 2 clefs (`data-egg`, `data-scroll-fx`) et écrire les fonctions
   JS correspondantes dans `effects.js` avant ou en parallèle de la rédaction** — un agent
   de rédaction n'a besoin que de connaître les 2 clefs à poser sur `<body>` et sur une
   section, il n'écrit jamais l'effet lui-même.
4. **`plan-carte-icones.md`** — vérifier que l'icône de la page existe déjà (planches
   générées dans `icon-sources/`) ou doit être demandée/découpée. Mettre son statut à jour
   une fois la page publiée (fait automatiquement en best-effort par `add_page.py`, vérifier
   les lignes `SKIP` affichées).

Puis, une fois la page écrite (root **et** `public/`, toujours les deux, contenu identique,
vérifié avec `diff`) :

5. **`python tools/add_page.py ...`** — déplace le pin `PLACES_FUTURE` → `PLACES` dans
   `map.html` **et** `public/map.html` (garde x/y déjà calés), ajoute la carte dans
   `src/pages/index.astro`, coche le statut dans les 3 docs de suivi (best-effort — vérifier
   les `SKIP` et corriger à la main si 0 ou plusieurs correspondances trouvées), ajoute
   l'entrée dans `docs/site-pages.json`, et relance `tools/sync_sidebar.py` automatiquement.
   **Après coup, valider que `map.html` reste un JS valide** (le script fait cette validation
   lui-même en best-effort, mais un `node -e` rapide sur `var PLACES = [...]` ne coûte rien
   et a déjà attrapé deux bugs réels du script — virgule manquante et apostrophe échappée
   dans un titre).
6. À la main (volontairement non automatisé, texte libre) : retirer/ajuster la mention
   devenue obsolète dans la section `#a-venir` de `index.astro`, et vérifier les `SKIP` de
   l'étape précédente.
7. Vérifier `diff` entre root et `public/` sur tous les fichiers touchés (map.html en
   particulier).
8. Mettre à jour `plan-effets.md` (ligne "Déjà fait" + retirer l'idée de la section
   "à venir" correspondante) si ce n'est pas déjà fait à l'étape 3.
9. `npm run build`, vérifier dans le navigateur (page seule + carte + accueil + menu latéral
   + easter egg/happening au scroll, sans erreur console), commit, push, surveiller le
   déploiement GitHub Actions.

**Note sur `tools/sync_sidebar.py`** : ce script (déplacé du scratchpad vers `tools/`, donc
permanent) lit désormais `docs/site-pages.json` au lieu de listes codées en dur — ne plus
jamais éditer ses listes internes, c'est le JSON qui est la source de vérité.

## 2. Toucher à la carte interactive (`map.html`)

Lire `carte-monde-interactive.md` (contexte/objectif d'origine), `plan-carte-icones.md`
(icônes et statut), `positions-carte.md` (référence géographique — les 124 positions ont
été vérifiées manuellement, ne pas les re-générer par formule sans relire pourquoi une
approche géographique globale avait été abandonnée). Outil d'édition : `tools/edit_map_pins.py`.

## 3. Toucher aux effets (`effects.js`)

Lire `plan-effets.md` en entier — c'est le seul document qui explique l'architecture
(couches 0 à 4, `EGGS`/`SCROLL_FX`/`GLYPH_POOLS`, pièges déjà rencontrés listés en tête de
fichier). Toujours resynchroniser `public/effects.js` après modification.

## 4. Icônes de la carte

`plan-carte-icones.md` (statut par page + méthode de découpage par détection de blobs) et
le dossier `icon-sources/` (planches brutes + `prompts-planches-icones.md` pour en
regénérer de nouvelles).

---

## Rappels transverses (valables pour toute modification, pas seulement les nouvelles pages)

- **Double copie systématique** : tout fichier HTML/JS à la racine a un miroir strictement
  identique dans `public/`. Éditer un seul côté puis oublier l'autre est l'erreur la plus
  fréquente de ce projet — vérifier avec `diff` après coup.
- **`npm run build` régénère `dist/`** à partir de `public/` — `dist/` n'est jamais édité
  à la main et un fichier ouvert directement dans le navigateur (`file:///.../dist/...`)
  ne reflète pas des changements tant qu'on n'a pas rebuild.
- Ne jamais committer/pusher sans que l'utilisateur l'ait explicitement demandé pour ce tour-ci.
