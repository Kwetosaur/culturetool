# Audit de l'existant — 26/07/2026

Relecture complète du dépôt (29 pages de contenu, `effects.js`, `map.html`, les 3 outils
Python, `index.astro` et les 9 docs de `docs/`) faite avant d'ouvrir le chantier
« objets légendaires » et de réviser le plan d'industrialisation.

Chaque point est classé par **ce que ça coûte si on ne le corrige pas**, pas par ordre de
découverte. Les constats sont vérifiés dans le code, pas déduits : la méthode de
vérification est indiquée quand elle n'est pas évidente, pour pouvoir la rejouer.

---

## A. Bugs confirmés

### A1. Un piège latent dans la couleur des pins de la carte

*(Diagnostic corrigé après vérification au navigateur — la première version de cette
section annonçait un bug visible qui n'existait pas. Le détail vaut d'être conservé, parce
que la raison pour laquelle ça ne cassait pas est aussi la raison pour laquelle ça allait
casser à la catégorie suivante.)*

`map.html` colore chaque pin en JS :

```js
a.style.setProperty('--pin-color', 'var(--' + p.cat + ')');   // ligne ~591
```

Pour `culture`, `creature` et `mystere`, la variable existe bien (`--culture`,
`--creature`, `--mystere`). Pour `cat:'mythologie'`, la variable déclarée s'appelait
**`--myth`** — donc `var(--mythologie)` ne résolvait rien.

Effet réel : aucun. `--pin-color` devient *guaranteed-invalid*, donc le `var()` qui
l'utilise applique son fallback — `border:3px solid var(--pin-color, var(--gold))` — et
`--gold` vaut `#c9982f`, c'est-à-dire **exactement la couleur des mythologies**. Vérifié
au navigateur : avec `var(--mythologie)`, avec `var(--myth)`, ou même avec
`var(--nawak-inexistant)`, la bordure sort à `rgb(201, 152, 47)`.

Le problème n'est donc pas ce qui était cassé, c'est ce qui allait l'être : **toute
catégorie dont la variable n'est pas nommée exactement `--<cat>` s'affiche silencieusement
en or**. Pour les mythologies, l'or était la bonne réponse par coïncidence. Pour la
catégorie objets ajoutée dans ce lot, une variable nommée `--obj` au lieu de `--objet`
aurait donné 37 pins dorés, indistinguables des mythologies, sans une ligne d'erreur en
console.

**Correctif appliqué** : `--myth` renommé en `--mythologie` (+ `--mythologie-bright`, et
mise à jour de son unique autre utilisation, `.sw-mythologie`), et un commentaire dans le
`:root` de `map.html` explique le couplage entre le nom de la variable et la valeur de
`cat`. `tools/edit_map_pins.py` porte le même avertissement sur son `CAT_COLOR`.

### A2. L'animation d'apparition est perdue sur 24 des 29 pages

Chaque page finit par un `IntersectionObserver` qui ajoute `.reveal-init` puis
`.reveal-in` sur une liste de classes codée en dur :

```js
var revealTargets = document.querySelectorAll('.realm-card, .god-card, ...');
```

Cette liste a été recopiée d'une famille à l'autre sans être réécrite. Vérification
(script jetable : extraire la liste, la comparer aux classes réellement présentes dans
le `<body>`) :

| Famille | Pages | Classes présentes sur la page mais absentes de la liste |
|---|---|---|
| Créatures | 5/6 (toutes sauf `mothman`) | `info-card`, `figure-card`, `science-block`, `theory-block`, `culture-card`, `heritage-block`, `caution-box` |
| Mystères | 5/6 (toutes sauf `anticythere`) | `fact-card`, `enigma-box`, `science-block`, `culture-card`, `heritage-block` |
| Cultures | 6/6 | `figure-card`, `region-card`, `people-card`, `life-card`, `invention-item`, `story-block`, `heritage-block`… — et **4 pages (`grece-antique`, `mali`, `rome-antique`, `vikings`) n'ont aucun script de reveal du tout** |
| Mythologies | 11/11 | `heritage-block` seulement (cas bénin) |

**Ce n'est pas une régression visible** : `.reveal-init` (qui met `opacity:0`) est posé par
le JS, donc un élément non listé reste simplement visible en permanence. On perd
l'animation, on ne casse pas la lecture — et c'est pour ça que personne ne l'a vu.

Les 3 seules pages correctes (`creature-mothman`, `mystere-anticythere`,
`mythologie-chinoise`) sont **les 3 dernières écrites, celles rédigées avec les gabarits** :
l'avertissement en tête de `docs/gabarits/gabarit-mystere.html` a fonctionné. Ce sont les pages
antérieures qui n'ont jamais été rattrapées.

**Correctif** : un script `tools/fix_reveal.py` qui, pour chaque page, régénère la liste à
partir des classes réellement présentes (`-card|-item|-block|-box` dans le `<body>`) et
ajoute le script manquant sur les 4 pages culture. ~40 lignes, aucun risque sur le
contenu, mais ça touche 24 fichiers publiés × 2 copies → **à faire dans un tour dédié,
avec vérification visuelle sur 2-3 pages avant de généraliser**. Pas fait dans ce lot.

### A3. `add_page.py` ne peut pas publier la première page d'une catégorie

`activate_pin()` cherche le commentaire `// <Label>` dans `PLACES`, puis remonte à la
dernière entrée du bloc pour lui ajouter une virgule :

```python
last_entry_idx = insert_idx - 1
if not lines[last_entry_idx].rstrip().endswith(','):
    lines[last_entry_idx] = lines[last_entry_idx].rstrip() + ','
```

Si le bloc est vide (cas d'une catégorie neuve), `last_entry_idx` pointe sur la ligne de
commentaire elle-même → le script écrit `// Objets légendaires,` et le JS de `map.html`
casse. Exactement le type de bug (virgule mal placée) déjà rencontré deux fois sur ce
script. **Corrigé dans ce lot.**

### A4. `add_page.py` perd des données si on ajoute une 5e catégorie

`_dump_compact()` réécrit `data/site-pages.json` à partir d'une liste d'ordre codée en dur :

```python
order = ['mythologies', 'cultures', 'creatures', 'mysteres']
```

Toute clé absente de cette liste est **silencieusement supprimée** du fichier à la
première réécriture. **Corrigé dans ce lot** (l'ordre est dérivé des clés du JSON).

### A5. `sync_sidebar.py` ne sait que remplacer, pas ajouter

Le script fait un `re.subn` sur un bloc `<div class="side-label">X</div>` existant. Si le
groupe n'existe pas encore dans les 29 pages (cas d'une catégorie neuve), aucun match →
aucune écriture, et le menu latéral ne mentionnera jamais la nouvelle famille. Il aurait
fallu repasser à la main sur 60 fichiers — précisément ce que ce script existe pour
éviter. **Corrigé dans ce lot** (insertion du groupe manquant, et groupes vides ignorés).

---

## B. Documentation et statuts périmés

Rien de cassé, mais ce sont les docs qui servent de source de vérité pour choisir le
sujet suivant : périmés, ils font perdre du temps ou refaire un travail déjà fait.

| Doc | Constat | Corrigé ici |
|---|---|---|
| `docs/listes/liste-creatures-mysteres-monde.md` | 4 pages publiées non cochées : Loch Ness, Bête du Gévaudan, Triangle des Bermudes, Stonehenge. Ce sont des `SKIP` de `add_page.py` (correspondance ambiguë) jamais rattrapés à la main. | ✅ |
| `docs/listes/suite_cultures.md` | « Déjà couvertes (5/5) » alors que 6 sont en ligne (Mali manque au décompte). Le « Top 5 recommandé » recommande encore Rome antique et Grèce antique, publiées. | ✅ |
| `docs/listes/suite_mythologies.md` | « Déjà couvertes (11/11) » — le `/11` n'a pas de sens (11 faites sur ~35 candidates listées). Le « Top 5 » garde la Chinoise ✅ en tête. | ✅ |
| `docs/plans/plan-serie-mythologies.md` | Tableau à 10 lignes et « Série terminée : 10/10 » alors que la Chinoise est en ligne. Tableau des palettes sans la Chinoise. | ✅ |
| `docs/plans/plan-effets.md` | « Déjà fait (29 pages) » pour un tableau de 30 lignes (accueil incluse) ; « les 10 pages mythologie » écrit 3 fois → 11. | ✅ |
| `docs/plans/plan-carte-icones.md` | « les 16 pages existantes affichent leur vraie icône » → 29. | ✅ |
| `docs/plan_page.md` | « Pas de gabarit mythologie séparé pour l'instant » alors que `docs/gabarits/gabarit-mythologie.html` existe (594 lignes). | ✅ |
| `docs/listes/positions-carte.md` | 123 lignes pour 124 pins : **Celtes (Gaule / Îles britanniques)** (culture) manque au tableau alors que le pin existe dans `PLACES_FUTURE` (x:46.3, y:28.6). | ✅ |
| `src/pages/index.astro` | Section `#a-venir` : annonce la Chinoise en « prochaine mythologie » alors qu'elle est publiée. Titre « Onze Mythologies » à remettre à jour à la main à chaque ajout. | ✅ (section pilotée par les données, plus de compte codé en dur) |

---

## C. Contenu et effets — ce qui manque vraiment

### C1. Le déchiffrement des inscriptions n'existe que sur les mythologies

`docs/plans/plan-effets.md` présente les « inscriptions qui se déchiffrent au scroll » (mécanisme 3)
comme une des cinq couches du système. Comptage des `fx-decode` par page : **9 à 10 par
page sur les 11 mythologies, 0 sur les 18 autres pages**. Les familles cultures,
créatures et mystères n'ont donc que 2 des 4 mécanismes actifs.

Ce n'est pas un oubli accidentel — c'est cohérent avec le fait que `GLYPH_POOLS` ne
contient que des jeux de glyphes culturels (runes, grec, hiéroglyphes, cunéiforme,
ogham…), qui n'ont pas de sens sur une page « Triangle des Bermudes ». Mais l'arbitrage
n'est écrit nulle part. **Décision à prendre et à consigner** :

- soit c'est une **signature volontaire de la famille mythologie** → l'écrire noir sur
  blanc dans `docs/plans/plan-effets.md` pour ne pas le re-découvrir comme un manque à chaque audit ;
- soit on l'étend avec des pools adaptés (chiffres et symboles nautiques pour les
  mystères maritimes, empreintes/griffures pour les créatures, matière de l'objet pour la
  série objets…) — travail non nul, à cadrer.

Recommandation : **signature mythologie**, sauf pour la nouvelle série « objets
légendaires », où un déchiffrement d'inscription gravée sur l'objet est thématiquement
juste (voir `docs/plans/plan-serie-objets.md`).

### C2. Aucune piste d'effet pour 41 des 95 pages à venir

`docs/plans/plan-effets.md` liste des pistes bespoke pour les mythologies et les cultures à venir,
mais pour les créatures (21 pages à venir) et les mystères (20 pages) il renvoie au
« niveau générique ». Or le générique, c'est `glyphShower` avec des glyphes culturels —
explicitement inadapté à ces deux familles (aucune des 12 pages créature/mystère
existantes ne l'utilise, toutes ont un effet sur-mesure). Le « minimum acceptable »
annoncé n'existe donc pas pour ces familles : en pratique, c'est sur-mesure ou rien.
**Complété dans ce lot** (une piste par page à venir pour les 4 familles + la nouvelle).

### C3. Le stock d'icônes n'est plus le goulot d'étranglement

108 icônes générées, découpées, normalisées en 4 tailles, et 95 pins déjà positionnés à
la main sur la carte… pour 0 page écrite. Tout l'amont est prêt et dort. Le seul
goulot restant est le **coût de rédaction d'une page** — ce qui valide l'objectif
d'industrialisation, et invalide l'idée de générer d'autres planches d'icônes avant
d'avoir rattrapé le retard de rédaction (à part pour la nouvelle série, qui n'en a
aucune).

*Mise à jour en fin de journée du 26/07/2026 : le constat s'est **aggravé**, pas résolu.
L'amont est passé à **189 icônes et 189 pins placés** — 65 icônes produites et 65 pins calés
dans la journée — toujours pour 0 page nouvelle. C'était un choix assumé (la 5e catégorie
n'avait aucune icône, et il valait mieux outiller la découpe une fois pour toutes avec
`tools/make_icons.py` que la refaire à la main à chaque planche), mais l'écart entre l'amont
et la rédaction n'a jamais été aussi large. La prochaine session doit écrire une page, pas
produire du stock.*

### C4. Référencement et partage : rien de posé

Aucune page n'a de balise `og:`/`twitter:` (vérifié : 0 occurrence sur les 29 pages et
sur `index.astro`), pas de `sitemap.xml`, pas de `robots.txt`. Un lien partagé s'affiche
donc sans titre, sans image, sans description. Pour un site dont chaque page a un visuel
fort et un titre accrocheur, c'est le rapport effort/gain le plus favorable du dépôt :
4 balises par page, ajoutables une fois pour toutes dans le futur `PageLayout.astro`.

---

## D. Hygiène du dépôt

| Point | Détail | Action |
|---|---|---|
| `map_upscayl_2x_ultramix-balanced-4x.png` | **117 Mo**, non suivi, à la racine. Au-dessus de la limite dure de GitHub (100 Mo par fichier) : un `git add .` distrait rend le push impossible et l'historique difficile à nettoyer. | À ignorer explicitement (fait) ou à sortir du dossier de travail |
| `map.jpg` | 7,8 Mo servis à chaque ouverture de la carte, sans version dégradée. | À convertir en WebP/AVIF (gain typique 60-80 % à qualité égale) — chantier séparé |
| `map.html.bak` | Traîne à la racine **et** dans `public/`. Couvert par `.gitignore` (`*.bak`), donc invisible en `git status`, mais reste sur le disque et dans les recherches de fichiers. | À supprimer |
| `.claude/worktrees/peaceful-sinoussi-345d78/` | Worktree git abandonné (branche `claude/peaceful-sinoussi-345d78`, 2 commits de retard) contenant **74 Mo** et une copie complète du site — qui remonte dans toutes les recherches de fichiers et fausse les greps. | `git worktree remove` quand plus utile |
| Pas de `CLAUDE.md` | `docs/plan_page.md` existe précisément pour être lu avant toute modification, mais rien ne le fait charger automatiquement. Le doc lui-même documente l'incident qui l'a motivé (3 pages livrées sans effets). Le risque de se répéter est structurel, pas humain. | ✅ créé dans ce lot |

---

## E. Ce qui est solide et ne demande rien

À dire aussi, pour ne pas donner l'impression que tout est à refaire :

- **`effects.js`** — le câblage est intègre : les 30 clés `data-egg` utilisées dans les
  pages existent toutes dans `EGGS`, les 29 `data-scroll-fx` dans `SCROLL_FX`, les 11
  `data-glyphs` dans `GLYPH_POOLS`. Zéro clé morte, zéro clé manquante. Sur un système
  dont le `try/catch` global avale les erreurs silencieusement, c'est remarquable.
- **Le clustering de `map.html`** — la logique « la bulle grossit sur place plutôt
  qu'ouvrir un halo externe » avec son commentaire expliquant *pourquoi* (mouseenter ne se
  déclenche pas entre parent et enfant, donc plus de bulles qui se battent) est le genre de
  décision qu'on remercie six mois plus tard.
- **Les positions de la carte** — 124 points calés à la main après avoir testé et invalidé
  l'approche par formule géographique, avec la trace de l'invalidation dans le doc.
- **Les correctifs assumés** — la section « le chiffre 9 royaumes avait été forcé » de
  `docs/plans/plan-serie-mythologies.md` documente une erreur passée au lieu de la masquer, et en
  tire une règle. C'est ce qui rend ces docs réellement utilisables.

---

## Ordre de traitement recommandé

1. **A1** (nommage des variables de couleur des pins) — corrigé dans ce lot ; sans effet
   visible sur l'existant, mais bloquant proprement un piège pour toute catégorie future.
2. **A3/A4/A5** (outillage bloquant pour la 5e catégorie) — corrigés dans ce lot.
3. **B** (statuts périmés) — corrigés dans ce lot.
4. **A2** (listes de reveal) — tour dédié, script + vérification visuelle.
5. **C4** (balises `og:`) — à intégrer une fois dans `PageLayout.astro` plutôt que 29 fois
   à la main.
6. **D** (hygiène) — au fil de l'eau.
7. **C1** (arbitrage sur le déchiffrement) — décision d'auteur, pas de code.
