# Plan des graphes interactifs (`genealogy-interactive.js`)

## Principe

Certaines pages ont déjà un diagramme relationnel fait main : l'arbre généalogique en SVG des
pages mythologie (`#genealogie`, trois « maisons »), par exemple. Ce plan documente une
**couche interactive** qui reprend ce même diagramme :

- On peut **glisser** un nom pour l'écarter du reste et démêler un nœud dense.
- On peut **cliquer** un nom pour ouvrir une fiche (fond noirci, texte court) sans quitter la
  page.
- Un léger effet de particules (glyphes de la page — runes, symboles abstraits...) accompagne
  le geste de glisser, pour que l'interaction ne soit pas silencieuse.

La vue interactive **remplace** le diagramme SVG figé — décision du 29/07/2026, une fois le
moteur vérifié fiable en navigateur réel : garder les deux (bouton replié sous le diagramme
statique) faisait deux fois la même chose sur une même page sans raison. Elle reprend en
revanche **les mêmes figures et les mêmes relations que le diagramme qu'elle remplace**, jamais
un enrichissement inventé pour l'occasion, et la note de prudence sur les sources contradictoires
(voir `docs/plans/plan-serie-mythologies.md` § le correctif sur les royaumes) reste affichée
sous le graphe.

Première mise en œuvre : 29/07/2026, sur demande explicite après deux prototypes refusés (un
graphe de connaissances séparé façon constellation, jugé hors-sujet et trop détaché de
l'identité visuelle du site — voir l'historique de session pour le raisonnement complet), puis
un premier essai en production avec bouton replié + diagramme statique conservé au-dessus,
jugé redondant à l'usage et remplacé par la version directe décrite ici.

---

## Architecture

Un seul fichier partagé, **`public/genealogy-interactive.js`**, exactement sur le modèle
d'`effects.js` : une copie, jamais dupliquée, utilisée aussi bien par les pages statiques que
par les pages Astro. Il expose une seule fonction globale :

```js
window.initInteractiveGenealogy(containerEl, {
  nodes: [{ id, label, house, head, dim, x, y, detail }],
  edges: [[fromId, toId, 'filiation' | 'union' | 'special']],
  houses: { cle: { head: '#hex', normal: '#hex', dim: '#hex' } },
  houseLabels: { cle: 'Maison de ...' },   // affiché en tête de la fiche au clic
  glyphs: 'ᚠᚢᚦ...',                        // pool de particules, propre à la page
  viewBox: { w, h },
  lineColor: '#hex',
  bg, panel, border, text, textDim, accent  // couleurs ou var(--...) CSS
});
```

Le moteur ne connaît **aucune couleur ni écriture propre à une culture** — tout vient de
l'appelant. C'est ce qui permet de le réutiliser tel quel sur n'importe quelle mythologie sans
jamais toucher au fichier partagé.

### Modèle de données

- **`nodes`** : chaque figure du diagramme existant, avec sa position `x,y` (copiée de la
  disposition du SVG figé, pas recalculée), sa maison (`house`), et un champ **`detail`**
  obligatoire pour la fiche au clic — 1 à 3 phrases factuelles, même registre que le reste du
  site (pas de remplissage générique).
- **`edges`** : un triplet `[origine, destination, type]`. Trois types seulement, alignés sur
  la légende déjà présente sur les pages mythologie : `filiation` (trait plein), `union`
  (pointillé), `special` (tirets fins — adoption, don, otage, lien hors norme).
- **`houses`** : palette par maison, 3 teintes (`head`, `normal`, `dim`) — reprend exactement
  les couleurs déjà utilisées dans le diagramme SVG figé de la page, jamais de nouvelles
  couleurs inventées pour l'occasion.

### Deux intégrations, un seul moteur

| | Pages statiques (`public/*.html`) | Pages Astro (`src/pages/*.astro`) |
|---|---|---|
| Chargement du moteur | `<script src="./genealogy-interactive.js" defer>` | `src/components/InteractiveGenealogy.astro`, qui charge `` `${import.meta.env.BASE_URL}genealogy-interactive.js` `` — **le chemin doit passer par `BASE_URL`**, le site étant servi sous `/culturetool/` : un chemin absolu codé en dur casse en production. |
| Couleurs de fond/texte | Hex litéral, copié du `:root` de la page (pas de variables CSS partagées entre pages statiques) | `var(--surface)`, `var(--border)`, `var(--ink)`... — les tokens déjà exposés par `PageLayout.astro`, jamais de hex dupliqué |
| Déclenchement | Initialisation directe dans un script inline enveloppé par `DOMContentLoaded` (requis : le script du moteur est `defer`, donc pas encore exécuté si on l'appelle plus tôt) | Le composant s'initialise lui-même au chargement ; script marqué **`is:inline`** — donc **jamais de syntaxe TypeScript dedans**, `is:inline` n'est pas dépouillé par Vite et partirait tel quel dans le navigateur |

### Piège déjà rencontré

Le tout premier prototype (testé hors du site, dans un artifact) utilisait
`Element.animate()` (Web Animations API) avec des keyframes `transform` sur des `<text>` SVG
pour faire tomber les particules — l'effet ne se déclenchait pas de façon fiable. La version
retenue anime les particules **à la main via `requestAnimationFrame`**, en modifiant
directement `x`/`y`/`opacity` à chaque frame plutôt que de dépendre d'une transition CSS sur un
élément SVG. Plus verbeux, mais sans zone d'ombre sur la compatibilité navigateur.

Note pour qui déboguerait un jour un effet qui semble ne "rien faire" : si `document.hidden`
vaut `true` (onglet non visible, page non affichée), `requestAnimationFrame` est mis en
pause par le navigateur — ce n'est pas un bug du moteur, c'est le comportement attendu.

**Bug plus sérieux, rencontré en production dès le premier essai réel** : la fiche modale
(`.gi-modal-backdrop`) est en `position:fixed; inset:0` — donc superposée à **toute la page**,
pas seulement au graphe. La première version ne coupait que son opacité (`opacity:0`) quand
elle était fermée, sans désactiver `pointer-events` : l'élément restait invisible mais captait
quand même tous les clics de la page entière, y compris ceux destinés au graphe lui-même. Tout
devenait cliquable-mais-inerte dès qu'`initInteractiveGenealogy` s'exécutait. Correction :
`pointer-events:none` sur l'état fermé, `pointer-events:auto` uniquement sur `.open`. Réflexe à
garder pour tout futur overlay `position:fixed` du site : l'opacité ne suffit jamais à elle
seule à désactiver un élément, il faut aussi couper `pointer-events` (ou `display`/`visibility`).

---

## Règles de conception

- **Remplace le diagramme statique, garde sa légende.** Le graphe interactif prend la place du
  SVG figé ; la phrase de légende (plein/pointillé/tirets) et la note de prudence sur les
  sources contradictoires restent affichées sous le graphe, inchangées.
- **Distinction clic / glisser-déposer.** Un déplacement de moins de 6px depuis le
  `pointerdown` est traité comme un clic (ouvre la fiche) ; au-delà, comme un glissé (anime
  les particules, ne rouvre pas la fiche au relâchement).
- **Fiche modale accessible.** Fond noirci (`rgba(0,0,0,0.82)`), fermeture au clic en dehors,
  au bouton ✕, ou à `Échap` ; le focus revient sur le nœud d'origine à la fermeture.
- **`prefers-reduced-motion`** : les particules perdent leur chute (un bref éclat statique
  suffit), mais ne disparaissent jamais complètement — contrairement à `effects.js` qui coupe
  net certains effets, ici l'information (« ce nom vient d'être déplacé ») doit rester
  perceptible.
- **Glyphes propres à la page.** Le pool de particules n'est jamais générique : la page
  nordique réutilise le vrai pool de runes déjà utilisé pour son easter egg (`RUNES` dans
  `effects.js`) ; une page utilisant un pool de glyphes abstrait (voir
  `docs/plans/plan-effets.md` § arbitrage runique) réutilise ce même pool, jamais une
  écriture réelle inventée pour l'occasion.

---

## Déjà fait

| Page | Fichier | Nœuds / arêtes | Glyphes de particule |
|---|---|---|---|
| Mythologie Nordique (legacy) | `public/mythologie-nordique.html` | 41 nœuds, 40 arêtes — reprend l'intégralité du diagramme des 3 maisons (Loki, Odin, Njörd) | Pool `RUNES` (`ᚠᚢᚦᚨᚱᚲ...`), déjà établi pour l'easter egg de la page |
| Mythologie Polynésienne (Astro) | `src/pages/mythologie-polynesienne.astro` via `InteractiveGenealogy.astro` | 8 nœuds, 10 arêtes — les 3 maisons (Tāne, Tangaroa, Tāwhirimātea) + leurs domaines confiés | Pool abstrait `▲◆✦❖` (déjà établi pour le déchiffrement de titres de la page) |

Les deux ont été vérifiées en navigateur réel (serveur de prévisualisation du projet, pas
l'aperçu d'artifact) : build propre, script chargé avec le bon préfixe `/culturetool/`,
glisser-déposer fonctionnel, clic ouvrant la fiche avec le bon titre/maison/texte, fermeture au
clavier (`Échap`) fonctionnelle, aucune erreur console — **et, après coup, la page entière
redevenue cliquable** une fois le bug `pointer-events` du paragraphe précédent corrigé.

---

## Comment ajouter la vue interactive à une nouvelle page

**Page statique (`public/*.html`)**

1. Repérer le diagramme `#genealogie` existant et en extraire la liste des figures (nom,
   coordonnées approximatives, maison) et des traits (plein/pointillé/tirets) — puis
   **supprimer le SVG figé**, en gardant sa phrase de légende et sa note de prudence sur les
   sources.
2. Ajouter à la place un conteneur `<div id="genealogy-interactive"></div>`.
3. En bas de page, après `<script src="./effects.js" defer>` : charger
   `./genealogy-interactive.js` (aussi `defer`), puis un script inline enveloppé dans
   `DOMContentLoaded` qui construit `nodes`/`edges`/`houses` et appelle
   `initInteractiveGenealogy(mount, {...})` directement, sans geste préalable de l'utilisateur.
4. Écrire un champ `detail` réel pour chaque figure — pas de placeholder.

**Page Astro (`src/pages/*.astro`)**

1. `import InteractiveGenealogy from '../components/InteractiveGenealogy.astro';`
2. Définir `NODES`/`EDGES`/`HOUSES`/`HOUSE_LABELS` dans le frontmatter, à côté des autres
   constantes de la page.
3. Remplacer le `<svg>` figé par `<InteractiveGenealogy nodes={...} edges={...} houses={...}
   glyphs="..." viewBox={{w,h}} />`, en gardant la légende/note de prudence existante.

---

## Pistes futures (à valider avant d'être lancées)

Ce document ne couvre pour l'instant que le cas généalogie. D'autres familles ont des
diagrammes relationnels qui pourraient s'y prêter — **ou pas**, l'intérêt réel prime sur la
couverture systématique :

- **Mythologies** : le cas déjà traité ici — candidat naturel sur toute page ayant un
  `#genealogie` à 3 maisons.
- **Mystères** : une frise-réseau reliant expéditions/témoignages à une même énigme
  (Amelia Earhart, Dyatlov) pourrait avoir un intérêt similaire — à évaluer page par page,
  seulement si la page a réellement plusieurs événements distincts à relier entre eux.
- **Cultures/Objets/Créatures** : pas de candidat évident à ce stade — plusieurs pages
  n'ont tout simplement rien qui gagnerait à devenir un graphe (un bestiaire de créatures
  compactes, par exemple, n'a pas de relations à montrer). Mieux vaut ne rien faire que
  forcer un graphe sans rapport de force réel entre les éléments.

Liste détaillée page par page à faire dans un second temps, une fois l'usage réel de ces deux
premières intégrations confirmé.
