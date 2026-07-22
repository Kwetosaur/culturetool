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
2. **`#royaumes`** — Cosmogonie en **9 royaumes**. Pas un moule figé : la structure en 9 s'adapte à la logique propre de chaque mythologie (strates verticales pour l'Égypte, vagues d'invasions pour l'Irlande, entités primordiales + royaumes des morts pour la Grèce/Mésopotamie). Un diagramme SVG maison (arbre, strates, colonne, axe du monde) suivi de 9 cartes courtes, puis 9 "portraits détaillés" plus longs (lieux précis, événements, sous-royaumes).
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
