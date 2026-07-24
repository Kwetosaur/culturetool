# Plan global — à relire avant TOUTE nouvelle page ou modification du site

Point d'entrée unique. Écrit après avoir livré 3 pages (Rome antique, Bigfoot, Col Dyatlov)
sans les effets bespoke — l'oubli qui a motivé ce document. Objectif : ne plus jamais
zapper une étape parce qu'un plan vivait dans un fichier qu'on n'a pas pensé à ouvrir.

**Règle : avant d'écrire une nouvelle page, ou de toucher au site, lire ce fichier en
entier, puis ouvrir chaque doc listé qui concerne la tâche en cours — pas juste celui qui
semble le plus évident.**

---

## 1. Rédiger une nouvelle page de contenu (mythologie / culture / créature / mystère)

Lire dans l'ordre :

1. **Le plan de la série concernée** — structure obligatoire (sections, ordre des ids, ton) :
   - `plan-serie-mythologies.md`
   - (culture : pas de fichier `plan-serie-cultures.md` dédié — se baser sur `culture-egypte-antique.html`/`culture-chinoise.html` comme gabarit de structure)
   - `plan-serie-creatures.md`
   - `plan-serie-mysteres.md`
2. **La liste de sujets** correspondante, pour choisir/valider le sujet et son score :
   - `suite_mythologies.md` (mythologies)
   - `suite_cultures.md` (cultures)
   - `liste-creatures-mysteres-monde.md` (créatures et mystères, les deux dans le même fichier)
3. **`plan-effets.md`** — ⚠️ celui qu'on oublie. Chaque page doit avoir 1 à 3 pistes d'effet
   bespoke (au moins la version générique `glyphShower` si le temps manque), câblées à la
   fois en easter egg (`data-egg` + entrée dans `EGGS`) et en happening au scroll
   (`data-scroll-fx` sur une section clé + entrée dans `SCROLL_FX`). Ce fichier liste déjà
   des idées prêtes à l'emploi pour beaucoup de sujets à venir — les consulter avant d'improviser.
4. **`plan-carte-icones.md`** — vérifier que l'icône de la page existe déjà (planches
   générées dans `icon-sources/`) ou doit être demandée/découpée. Mettre son statut à jour
   une fois la page publiée.

Puis, une fois la page écrite (root **et** `public/`, toujours les deux, contenu identique) :

5. Enregistrer la page dans `map.html` **et** `public/map.html` : déplacer son entrée de
   `PLACES_FUTURE` vers `PLACES` (ajouter `href`, retirer `status:'future'` — garder x/y
   déjà calés) si elle y était, sinon l'ajouter directement dans `PLACES`.
6. Ajouter une carte dans `src/pages/index.astro` (section correspondante) et retirer/ajuster
   la mention devenue obsolète dans la section `#a-venir`.
7. Resynchroniser le menu latéral (`#side-menu`) sur **toutes** les pages du site (root +
   `public/`, y compris `map.html`) pour que le nouveau lien apparaisse partout, avec
   `class="active"` uniquement sur la page elle-même. Ne pas éditer les 40+ fichiers à la
   main — écrire/relancer un script (voir `tools/` ou en générer un à la volée) qui
   reconstruit les 4 blocs `.side-group` de façon identique partout.
8. Mettre à jour le statut ✅ dans la liste de sujets (étape 2) et dans `plan-carte-icones.md`.
9. `npm run build`, vérifier dans le navigateur (page seule + carte + accueil + menu latéral
   + easter egg/happening au scroll), commit, push, surveiller le déploiement GitHub Actions.

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
