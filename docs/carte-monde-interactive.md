# Projet — Carte du Monde Interactive (Hub Visuel Façon Vieilles Cartes Illustrées)

## L'idée

Une carte du monde unique, dans l'esprit visuel des cartes-récits illustrées américaines des années 1930-1950 (parchemin vieilli, cartouche décoratif, boussole, bordure de blasons, petites vignettes dessinées), qui sert de **hub central** à tous les chapitres déjà écrits (mythologies, cultures, et bientôt créatures/mystères). On clique sur une région, elle zoome, et on découvre les éléments clés de son histoire (pyramide pour l'Égypte, panda pour la Chine, etc.) avant d'accéder aux pages détaillées.

## Point de départ légal

Les images de référence fournies (Story Map of Spain, Africa Map, Asia Map...) ne peuvent pas être réutilisées ou tracées directement — certaines portent d'ailleurs un copyright visible (ex. "© Coloriet Publications, Inc. Chicago, 1938" sur la carte d'Espagne). En revanche, le **style** en lui-même (papier vieilli, cartouche, frise de blasons, boussole, vignettes) est un genre visuel, pas une œuvre protégée : le reproduire avec des illustrations originales est parfaitement légitime — c'est exactement ce qui a déjà été fait pour la carte-récit de la Chine.

## Les deux couches à distinguer

**Couche géographique (le fond de carte)** : les contours réels des pays/continents. Dessiner ça à la main en SVG (comme pour la Chine) donne un résultat "reconnaissable mais approximatif" — suffisant pour une seule page, mais fragile à l'échelle d'une carte du monde entière avec zoom précis par pays. La bonne pratique ici est d'utiliser des données géographiques ouvertes et libres de droit (type Natural Earth / TopoJSON, domaine public), combinées à une librairie comme D3.js — standard de facto pour ce genre d'interaction, bien documenté, avec des centaines d'exemples de cartes cliquables/zoomables.

**Couche décorative (le style vintage)** : icônes, vignettes, cartouches, boussole, bordure de blasons. C'est la partie où l'identité visuelle du projet se joue, et où deux niveaux de qualité sont possibles (voir ci-dessous).

## Ce qui est faisable en écrivant du SVG à la main (mon niveau actuel)

Un style **schématique et minimaliste** : formes géométriques simples assemblées pour suggérer une pyramide, un panda, un bateau, une montagne — exactement ce qui a été fait sur la carte de Chine (cercles, triangles, chemins simples). C'est cohérent, ça a du charme, et ça permet de coder des interactions réelles (clic, zoom, transition) sans dépendance externe. Les limites : le rendu reste plat et géométrique, loin du niveau de détail "gravure ancienne" des images de référence (monstres marins texturés, animaux ombrés, pyramides avec grain de pierre).

## Ce qui ne l'est pas sans outils dédiés

Le niveau d'illustration détaillé des images fournies est un vrai travail d'illustration vectorielle — fait par un·e illustrateur·rice humain·e ou par génération d'image IA (rendu raster, PNG/JPG), pas par des coordonnées SVG écrites à la main. Si l'objectif final est d'atteindre ce niveau de détail, il faudra à un moment produire ou commander des assets illustrés séparément (icônes en PNG/SVG détaillé) et les intégrer comme calques sur la carte, plutôt que de les coder ligne par ligne.

## Plan de réalisation proposé

**Phase 1 — Prototype (faisable dès maintenant)**
Hub monde en style schématique, 3-5 régions déjà écrites cliquables (Chine, puis les prochains chapitres culture/mythologie), zoom simple en CSS/JS, icônes minimalistes, liens directs vers les pages détaillées existantes (`culture-XXX.html`, `mythologie-XXX.html`). Objectif : valider l'interaction et le concept, pas la richesse graphique finale.

**Phase 2 — Migration technique (à faire avec Claude Code)**
Remplacement du fond de carte approximatif par de vraies frontières géographiques (D3.js + données TopoJSON libres), architecture en couches séparées (fond de carte / icônes / labels / liens), structure de données externalisée (un fichier JSON par région : coordonnées, résumé, lien vers la page, liste d'icônes à afficher) pour que le contenu et le rendu soient découplés et faciles à étendre.

**Phase 3 — Richesse visuelle et contenu complet**
Couverture de toutes les régions déjà écrites (mythologies + cultures + créatures/mystères à venir), et si le niveau de détail visuel des références reste l'objectif, intégration d'assets illustrés produits séparément (génération d'image IA ou illustration commandée) plutôt que du SVG géométrique. Possibilité d'ajouter une couche de filtres (afficher uniquement les mythologies, uniquement les cultures, uniquement les créatures/mystères d'une région).

## Architecture technique suggérée (pour la reprise)

- Un fichier de données par région (JSON) : `{ id, nom, coordonnées, résumé_court, icônes: [...], liens_pages: [...] }`
- Rendu séparé du contenu : la carte ne fait qu'afficher des données, elle ne contient aucun texte en dur
- Réutilisation de la palette et des polices déjà établies (Cinzel / Cinzel Decorative / EB Garamond) pour rester cohérent avec les pages existantes
- Le zoom peut être un simple `transform: scale()` + `transition` CSS pour un prototype, ou une vraie librairie de zoom géographique (D3 zoom behavior) pour la version finale

## Limites honnêtes

- Couvrir le monde entier avec une profondeur de contenu équivalente à la page Chine est un chantier de plusieurs dizaines de pages — un projet de plusieurs sessions, pas un livrable en un coup.
- Sans assets illustrés dédiés, le rendu visuel restera toujours en retrait par rapport aux références esthétiques fournies, aussi bien exécuté soit le SVG géométrique.
- Le fond de carte géographique précis (contours de pays exacts) dépasse ce qui est raisonnable à coder à la main région par région ; les données ouvertes sont la seule option scalable.

## Statut

Idée à l'état de plan, non démarrée. Recommandé comme chantier pour Claude Code plutôt que pour une génération en un seul passage ici.
