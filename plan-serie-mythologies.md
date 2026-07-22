# Plan de la série "Mythologies du Monde"

## Mythologies prévues

| # | Mythologie | Statut |
|---|---|---|
| 1 | Nordique | ✅ Fait |
| 2 | Grecque | ✅ Fait |
| 3 | Égyptienne | ✅ Fait |
| 4 | Romaine | ✅ Fait |
| 5 | Celtique | ✅ Fait |
| 6 | Mésopotamienne | ✅ Fait |
| 7 | Hindoue | ✅ Fait |
| 8 | Japonaise | ✅ Fait |
| 9 | Aztèque / Maya | ✅ Fait |
| 10 | Slave | ✅ Fait |

Chaque page est un fichier HTML autonome (`mythologie-XXX.html`), sans dépendance externe hors polices Google Fonts.

---

## Structure fixe (identique pour chaque mythologie)

Toutes les pages suivent le même squelette de 9 sections, dans le même ordre, avec les mêmes ancres de navigation (nav du hero + nav collante qui reste visible au défilement) :

1. **Hero** — titre, sous-titre, phrase d'accroche, rangée décorative (runes / hiéroglyphes / ogham / cunéiforme selon la culture), lien vers le chapitre précédent/suivant en pied de page.
2. **`#royaumes`** — Cosmogonie en royaumes/niveaux du monde, **nombre non figé et sourcé pour chaque culture** (voir correctif ci-dessous — ce point a changé après la rédaction initiale). La structure s'adapte à la logique propre de chaque mythologie (strates verticales pour l'Égypte, vagues d'invasions pour l'Irlande, entités primordiales + royaumes des morts pour la Grèce/Mésopotamie, lokas empilés pour l'Inde). Un diagramme SVG maison (arbre, strates, colonne, axe du monde) là où le sujet s'y prête, suivi d'autant de cartes courtes que de royaumes réellement attestés, puis autant de "portraits détaillés" plus longs (lieux précis, événements, sous-royaumes).
3. **`#pantheon`** — **~16 divinités/figures majeures**, en fiches (nom, épithète, tags, 1-2 paragraphes). On inclut les figures incontournables mais aussi 2-3 qui n'ont pas d'équivalent direct ailleurs (ex. Janus/Quirinus pour Rome, Hœnir/Mímir pour les Vikings) pour éviter le simple copier-coller d'un panthéon à l'autre.
4. **`#genealogie`** — Arbre généalogique en **SVG fait main**, organisé en **3 "maisons"** qui racontent une tension centrale de la mythologie (ex. Titans / Olympiens / enfants de Zeus ; Tuatha Dé Danann / lignée de Lugh / Fomoires). Légende systématique : trait plein = filiation, pointillé = union, tirets = naissance ou lien hors-norme. Une note de bas de section rappelle que les sources anciennes se contredisent déjà entre elles — sans chercher à trancher.
5. **`#creatures`** — **9 créatures/êtres** notables, format compact (nom + sous-titre + description).
6. **`#legendes`** — **12 légendes** rédigées en blocs longs (2-4 paragraphes), de la cosmogonie aux récits les plus tardifs, avec citations en exergue (`pull-quote`) sur les passages marquants.
7. **`#anecdotes`** — **8 cartes courtes** : étymologies, curiosités archéologiques, distinctions utiles (grec/romain, mythe/folklore tardif).
8. **`#monde`** — Expansion géographique réelle : diagramme SVG rayonnant depuis le foyer d'origine + 6 cartes sur les zones de diffusion (colonisation, conquête, routes commerciales, exil).
9. **`#frise`** — Timeline verticale (~13-16 jalons), qui mélange dates historiques réelles (fondations, conquêtes, mise par écrit des textes, redécouvertes archéologiques) et jalons de réception moderne (cinéma, jeux vidéo).
10. **`#heritage`** — Blocs thématiques (langue, symboles, science, culture pop, spiritualité contemporaine) + une **note de vigilance** finale, toujours différente et honnête : récupération idéologique (Norse, Rome), pillage colonial d'artefacts (Égypte), pillage archéologique en cours (Mésopotamie), réinvention romantique du XIXe siècle (Celtes).

---

## Principes de fond

- **Verbeux et créatif, assumé** : chaque section va au-delà du minimum, quitte à rallonger sérieusement la page.
- **Pas de bataille sur les sources exactes** dans le corps mythologique (quelle Edda, quel manuscrit) — sauf quand la contradiction elle-même est intéressante (ex. deux origines d'Aphrodite, plusieurs pères possibles pour Tyr).
- **Dates réelles seulement dans la frise et le monde géographique** — c'est là que la précision compte, pas dans le récit mythologique lui-même.
- **Design entièrement réadapté à chaque culture** : palette, décor, motif de bordure et symbole d'épigraphe changent à chaque fois (voir tableau ci-dessous). Seule l'architecture CSS (noms de classes, grille, timeline) reste commune.

## Correctif — le chiffre "9 royaumes" avait été forcé

Constat après coup : la structure en 9 royaumes, légitime pour la mythologie nordique (les Neuf Mondes d'Yggdrasil sont authentiquement attestés dans l'Edda), a été **reconduite par mimétisme visuel sur les 9 autres pages** plutôt que dérivée de la cosmologie propre à chacune. Selon les cas, cela allait du léger arrondi (Grèce, Rome, monde celtique) à la confusion caractérisée (Égypte : les "9 royaumes" du site confondaient le concept avec l'Ennéade héliopolitaine, qui est un groupe de 9 *dieux*, pas de royaumes) en passant par le padding pur (monde slave : ajout d'habitats d'esprits locaux et d'une ville pour compléter le compte à 9).

**Principe corrigé, à appliquer à toute mythologie future de la série** : le nombre de royaumes/niveaux cosmologiques doit être dérivé des sources primaires ou de références académiques sérieuses pour cette culture spécifique — jamais aligné sur un autre chapitre de la série pour la cohérence visuelle. Si les sources se contredisent ou si un concept est tardif/reconstruit (ex. Prav dans le monde slave, popularisé par le *Livre de Veles*, un faux du XXe siècle), le dire explicitement dans le texte plutôt que de lisser l'incertitude.

Nombre de royaumes retenu après vérification (juillet 2026) :

| Mythologie | Royaumes | Nature du chiffre |
|---|---|---|
| Nordique | 9 | Authentique (Edda) — seul cas où 9 est un vrai nombre culturel |
| Grecque | 7 | Ouranos, Gaïa, Pontos & Océan, Tartare, Érèbe & Nyx, Olympe, Hadès |
| Romaine | 7 | En 2 groupes : héritage grec (Caelum, Neptune, Orcus, Dii Consentes) + spécificités romaines (Janus, foyer/Lares-Pénates, apothéose impériale) |
| Celtique | 6 | Les 6 vagues d'invasion du *Lebor Gabála Érenn* |
| Égyptienne | 6 | Noun, Nout, Geb/Ta, Akhet, Douat (12 heures internes), Aarou |
| Mésopotamienne | 5-6 | An, Ki, Apsû, Kur/Irkalla (+ stratification céleste tardive en note, incertaine) |
| Hindoue | 14 | Les 14 lokas puraniques (7 Ūrdhva + 7 Pātāla), Meru comme axe hors-liste |
| Japonaise | 4 | Takamagahara, Ashihara no Nakatsukuni, Yomi no Kuni, Tokoyo no Kuni |
| Aztèque/Maya | 3+3 | Pas de compte unique : 3 royaumes aztèques (dont Mictlan, 9 niveaux authentiques) + 3 royaumes mayas, étiquetés séparément |
| Slave | 2-3 | Yav/Nav fermement attestés ; Prav mentionné avec avertissement de source tardive/contestée |

Le détail des sources et du raisonnement par culture est conservé dans l'historique de la session de correction (juillet 2026).

## Palettes utilisées jusqu'ici

| Mythologie | Ambiance | Épigraphe décorative |
|---|---|---|
| Nordique | Sombre, runique, or/rouge sang | Runes |
| Grecque | Marbre clair, bleu Égée, terracotta | Méandre grec |
| Égyptienne | Papyrus, lapis-lazuli, turquoise, carnelian | Hiéroglyphes |
| Romaine | Pourpre impérial, rouge pompéien, bronze | Latin lapidaire (SPQR) |
| Celtique | Vert forêt, argent, brume mauve | Ogham |
| Mésopotamienne | Argile, indigo nocturne, or | Cunéiforme |

| Hindoue | Safran, vermillon, paon, or | Devanagari (ॐ) |
| Japonaise | Vermillon torii, indigo, or, papier washi | Kanji (八百万の神) |
| Aztèque / Maya | Jade, turquoise, obsidienne, sang, or | Nahuatl (glyphe "fleur et chant") |
| Slave | Bois sombre, rouge brodé, or, vert forêt | Cyrillique (БОГИ • ДУХИ • СКАЗКИ) |

---

**Série terminée : 10/10 mythologies rédigées.**
