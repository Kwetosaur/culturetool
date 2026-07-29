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

## Catalogue des candidats (vérifié page par page, pas deviné)

Chaque entrée ci-dessous a été confirmée en relisant le contenu réel de la page (grep sur des
formulations précises : "reliques concurrentes", "au moins X lances/otages", "variantes
régionales", "route commerciale/royale"...), pas supposée depuis un titre. Une page absente
d'une famille n'a simplement rien remonté à la vérification — c'est un "rien" assumé, pas un
oubli. Quatre familles de structure différentes ressortent, pas une seule :

### A. Arbre généalogique (moteur existant, `genealogy-interactive.js`)

Toutes les 19 pages mythologie ont un `#genealogie` à 3 maisons — c'est le candidat le plus
uniforme de tout le site, puisque la structure est déjà strictement identique partout.

| Statut | Page |
|---|---|
| ✅ Fait | Nordique, Polynésienne |
| À faire | Grecque, Égyptienne, Romaine, Celtique, Mésopotamienne, Hindoue, Japonaise, Aztèque & Maya, Slave, Chinoise, Perse/Zoroastrienne, Yoruba, Inca, Aborigène australienne, Dogon, Vietnamienne, Finnoise |

Ordre suggéré : reprendre l'ordre de publication (le plus ancien contenu d'abord, cohérent avec
`plan-serie-mythologies.md`), pas un ordre alphabétique arbitraire.

### B. Chaîne de possession / reliques concurrentes (nouveau type, à concevoir)

Pas un arbre familial : ici les nœuds sont des **objets et des propriétaires successifs**,
parfois plusieurs branches concurrentes (plusieurs "vraies" reliques revendiquées). Même
mécanique d'interaction (glisser, cliquer → fiche) mais un modèle de données différent — pas de
notion de "maison", juste une chronologie ramifiée. Confirmé par page, pas supposé :

| Page | Ce qui rend le graphe pertinent (relu dans la page) |
|---|---|
| Le Saint Graal | Reliques concurrentes à Valence et à Gênes + chaîne d'auteurs (Chrétien de Troyes → Robert de Boron) qui ont façonné le récit |
| La Lance Sacrée | Au moins quatre lances concurrentes, chacune avec sa propre chaîne de propriétaires (Otton Ier, jusqu'à la récupération nazie) — le candidat le plus riche de cette catégorie |
| Le Koh-i-Noor | Chaîne de propriétaires historiques (maharajah de dix ans → couronne britannique) + contentieux actif à quatre pays (Inde, Pakistan, Iran, Afghanistan) |

*Écartés après vérification* : la Chambre d'Ambre a bien une chronologie de disparition, mais
elle est linéaire (pas de branches concurrentes) — déjà bien servie par le composant
`Timeline` existant, un graphe n'ajouterait rien.

### C. Réseau de routes (nouveau type, nécessite un fond de carte — pas le moteur généalogie)

Ici les nœuds sont des **lieux réels**, les arêtes des **routes attestées** — la bonne
mécanique serait plus proche de `map.html` (positions sur un fond, pas un arbre) que de
`genealogy-interactive.js`. Confirmé par page :

| Page | Réseau réel documenté sur la page |
|---|---|
| Empire mongol | Réseau de relais postaux (yam) reliant tout l'empire, routes commerciales unifiées sous la Pax Mongolica |
| Incas | Le Qhapaq Ñan, réseau routier andin réel — le candidat le plus direct, la route EST le sujet de la page |
| Empire perse achéménide | La Route royale, infrastructure impériale documentée |
| Rome antique | Réseau routier ("tous les chemins mènent à Rome"), infrastructure de conquête |
| Vikings | Routes de raid et de commerce vers Constantinople, Terre-Neuve, etc. |
| Khmers (Angkor) | Réseau hydraulique de barays et canaux — un réseau de gestion de l'eau plutôt que commercial, mais même logique de nœuds/arêtes |
| Chine (culture) | Route de la soie |
| Inde (culture) | Routes des épices, commerce indo-romain |

C'est la piste la plus prometteuse après les généalogies, mais elle **ne réutilise pas le
moteur existant tel quel** — prévoir une conception dédiée avant de se lancer, pas une
adaptation à la va-vite du modèle nœuds/maisons.

### D. Réseau de théories concurrentes (nouveau type, prolonge `TheoryCard`)

Candidat seulement quand une page a un vrai foisonnement de théories/acteurs à relier entre
eux — pas quand `#theories` compare simplement 2-3 lectures figées (ce que le composant
`TheoryCard` fait déjà très bien seul, sans graphe) :

| Page | Ce qui rend le graphe pertinent |
|---|---|
| Manuscrit de Voynich | Nombreux candidats-auteurs et tentatives de déchiffrement étalées sur des siècles — un vrai réseau, pas juste 2 écoles de pensée |
| Col Dyatlov | Multiplicité réelle de théories (avalanche, infrasons, militaire, paranormal) avec des éléments de preuve qui se recoupent différemment selon la théorie |

*Écarté après vérification* : l'Île de Pâques n'oppose que deux lectures scientifiques
(Diamond contre Hunt & Lipo) — un `TheoryCard` suffit, un graphe serait disproportionné pour
deux nœuds.

### Créatures : rien pour l'instant

Une seule page a remonté un signal ("variantes régionales") — La Llorona, 7 versions
régionales du même récit. Écartée volontairement : la page traite un infanticide avec une
sobriété délibérée (voir son commentaire d'en-tête), et un graphe interactif, aussi sobre
soit-il, introduit un geste ludique (glisser, particules) qui irait à l'encontre de cette
retenue. Le reste du bestiaire est fait de portraits individuels sans relations à montrer entre
eux — correct de laisser cette famille sans graphe plutôt que d'en forcer un.

Liste détaillée page par page à faire dans un second temps, une fois l'usage réel de ces deux
premières intégrations confirmé.
