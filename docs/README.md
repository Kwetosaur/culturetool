# docs — qu'est-ce qui existe, et où

Index de la documentation. Si tu ne sais pas où chercher, tu es au bon endroit.

## À lire en premier

| Fichier | Quand l'ouvrir |
|---|---|
| **[plan_page.md](plan_page.md)** | **Toujours.** Point d'entrée obligatoire avant d'écrire une page ou de toucher au site : il dit quoi lire, dans quel ordre, et quoi lancer après. |
| [audit-existant.md](audit-existant.md) | Pour savoir ce qui est cassé, périmé ou fragile dans le dépôt. Écrit le 26/07/2026, avec la méthode de vérification de chaque constat pour pouvoir la rejouer. |

## plans/ — comment on fait les choses

| Fichier | Contenu |
|---|---|
| [plans/plan-industrialisation.md](plans/plan-industrialisation.md) | Stratégie de réduction du coût de rédaction d'une page : mesures, socle Astro, phasage, décisions tranchées. |
| [plans/plan-effets.md](plans/plan-effets.md) | Architecture de `effects.js` (5 couches), pièges connus, effets déjà en place, **et une piste d'effet pour chacune des 160 pages à venir**. |
| [plans/plan-graphes.md](plans/plan-graphes.md) | Vue interactive facultative des diagrammes `#genealogie` (`genealogy-interactive.js`) : architecture, règles, intégrations déjà faites (legacy + Astro). |
| [plans/plan-carte-icones.md](plans/plan-carte-icones.md) | Icônes de la carte : statut par page, couleurs par catégorie, gestion de la densité, collisions à trancher. |
| [plans/carte-monde-interactive.md](plans/carte-monde-interactive.md) | Contexte et objectif d'origine de la carte interactive. |
| [plans/plan-serie-mythologies.md](plans/plan-serie-mythologies.md) | Structure des pages mythologie (10 sections) + le correctif sur le nombre de royaumes. |
| [plans/plan-serie-creatures.md](plans/plan-serie-creatures.md) | Structure des pages créature (8 sections), badge de verdict, respect des croyances vivantes. |
| [plans/plan-serie-mysteres.md](plans/plan-serie-mysteres.md) | Structure des pages mystère (8 sections), respect des victimes. |
| [plans/plan-serie-objets.md](plans/plan-serie-objets.md) | Structure des pages objet (8 sections), badge de nature, section `#facture`. |

## listes/ — quoi écrire ensuite

| Fichier | Contenu |
|---|---|
| [listes/suite_mythologies.md](listes/suite_mythologies.md) | 38 mythologies candidates, scorées /10, par région. |
| [listes/suite_cultures.md](listes/suite_cultures.md) | 28 cultures candidates. |
| [listes/liste-creatures-mysteres-monde.md](listes/liste-creatures-mysteres-monde.md) | 30 créatures + 27 mystères candidats, avec verdict probable. |
| [listes/suite_objets.md](listes/suite_objets.md) | 37 objets légendaires candidats, avec nature probable et id d'icône. |
| [listes/positions-carte.md](listes/positions-carte.md) | Où placer chaque pin sur la carte, avec ses coordonnées x/y. **Les 189 positions sont placées à la main.** Contient aussi le mode opératoire pour caler de futurs pins. |

## gabarits/ — squelettes des pages statiques

`gabarits/gabarit-culture.html`, `-creature.html`, `-mystere.html`, `-mythologie.html` :
squelettes structurels légers (~580 lignes) des 4 familles historiques.

⚠️ **Pour une page neuve, ne pas partir de là.** Lire `src/pages/socle-demo.astro` (~200
lignes) et écrire une page Astro : l'ossature vient du layout, pas du gabarit. Les gabarits ne
servent plus qu'à comprendre ou retoucher les 29 pages statiques existantes.

## Ce qui n'est pas dans docs/

| Où | Quoi |
|---|---|
| `data/site-pages.json` | Source de vérité des pages publiées : ordre, titres, épigraphes, accroches. Lu par l'accueil, le menu latéral et les outils. **Ce n'est pas de la doc, c'est de la donnée.** |
| `icon-sources/README.md` | Le circuit planche → icône, et ce que contiennent `old/` et `new/`. |
| `tools/README.md` | Ce que fait chaque script, et dans quel ordre les lancer. |
| `src/pages/socle-demo.astro` | La référence de lecture pour écrire une page avec les composants. |
| `README.md` (racine) | Arborescence du dépôt et commandes usuelles. |
| `CLAUDE.md` (racine) | Amorce pour un agent : renvoie ici et rappelle les pièges du dépôt. |
