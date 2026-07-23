# Plan des effets JS/SVG (`effects.js`)

## Principe

`effects.js` est un fichier unique, partagé par toutes les pages (racine + `public/`, toujours synchronisés). Quatre couches :

1. **Universel, discret, jamais désactivable par sujet** : barre de progression de lecture, légère lueur suivant la souris dans le hero. Ne pas ajouter d'autres effets "globaux" — le principe est de rester sobre par défaut.
2. **Un easter egg par page**, déclenché en cliquant le titre du hero (`<h1>`) ou via le code Konami (↑↑↓↓←→←→BA). Chaque page se déclare via `<body data-egg="clef">`, et la clef pointe vers une fonction dans l'objet `EGGS` en fin de fichier.
3. **Inscriptions qui se déchiffrent au scroll** — `<span class="fx-decode" data-glyphs="rune" data-text="…">` : glyphes décoratifs qui se figent lettre par lettre en texte lisible (éclat lumineux, léger hasard dans le rythme). **Rejouable** : l'inscription redevient des glyphes en sortant du viewport, prête à se rejouer à la prochaine entrée (avant ou arrière). Généralisé aux 9 titres de section (`h2.section-title`) des 10 pages mythologie — voir `GLYPH_POOLS` dans `effects.js` pour la palette de glyphes par culture.
4. **"Happenings" au scroll** — `<section data-scroll-fx="nessie">` : rejoue un effet existant (souvent le même que l'easter egg de la page) quand la section entre dans le viewport, avec un repos de ~7s par clef pour ne jamais devenir agaçant en va-et-vient. Permet aux pages créatures/mystères/cultures d'avoir un petit moment vivant en scrollant, pas seulement au clic.

Pas de garde-fou `prefers-reduced-motion` (retiré sur demande explicite : les effets doivent s'afficher partout). Tout est encapsulé en `try/catch` — un effet cassé ne doit jamais casser la page.

**Piège déjà rencontré** : un élément `.fx-decode` vide fait 0px de hauteur avant son premier rendu, ce qui empêche `IntersectionObserver` de calculer un ratio d'intersection exploitable (il ne se déclenche jamais). D'où le `min-height` sur `.fx-decode` dans la feuille de style injectée — à garder si on retouche ce composant.

## Deux niveaux de qualité d'easter egg

- **Générique** : `glyphShower({glyphs, mode, color, count})` fait pleuvoir/monter des glyphes propres à la culture (runes, grec, hiéroglyphes, cunéiforme, ogham...). Rapide à brancher pour une nouvelle mythologie — c'est le niveau minimum acceptable, jamais un blocage pour livrer une page.
- **Sur-mesure** : une scène animée en SVG/CSS propre au sujet (Nessie qui émerge, avion aspiré dans le Triangle des Bermudes, lever de soleil à Stonehenge, yeux du Gévaudan dans le noir, lever de Rê sur les pyramides). Plus de travail, réservé aux pages qui s'y prêtent visuellement bien — pas la peine de forcer un sur-mesure sur un sujet qui n'a pas d'image iconique évidente.

**Règle de priorité** : livrer la page avec le générique d'abord si le temps manque, upgrader vers le sur-mesure ensuite. Ne jamais retarder la mise en ligne d'une page pour finir un easter egg.

## Déjà fait (16 pages)

Les 10 pages mythologie combinent désormais leur pluie de glyphes générique **et** une scène sur-mesure (au clic du titre **et** en happening au scroll sur `#pantheon`) — plus du niveau "minimum" décrit ci-dessus.

| Page | Clef `data-egg` | Effet générique | Effet sur-mesure | Déclenché aussi au scroll sur |
|---|---|---|---|---|
| Nordique | `nordique` | pluie de runes | corbeau (Huginn/Muninn) qui traverse l'écran | `#pantheon` |
| Grecque | `grecque` | montée de lettres grecques | éclair de Zeus + flash d'écran | `#pantheon` |
| Égyptienne (mythologie) | `egyptienne` | montée de hiéroglyphes | Œil d'Horus qui s'ouvre et veille | `#pantheon` |
| Romaine | `romaine` | pluie de chiffres romains | aigle (aquila légionnaire) qui traverse l'écran | `#pantheon` |
| Celtique | `celtique` | montée de glyphes ogham | brume qui dérive lentement | `#pantheon` |
| Mésopotamienne | `mesopotamienne` | pluie de cunéiformes | étoiles qui s'allument au-dessus d'une ziggourat | `#pantheon` |
| Hindoue | `hindoue` | montée ॐ/☸/✴ | lotus qui s'ouvre pétale par pétale | `#pantheon` |
| Japonaise | `japonaise` | pluie de pétales de sakura | torii qui se dessine dans une lueur douce | `#pantheon` |
| Aztèque & Maya | `azteque` | montée de glyphes solaires | Quetzalcoatl (serpent à plumes) qui ondule à travers l'écran | `#pantheon` |
| Slave | `slave` | montée de symboles solaires slaves | oiseau de feu avec traînée de braises | `#pantheon` |
| Chine (culture) | `chine` | pluie de sinogrammes (福龍鳳春) | ruban de soie qui ondule | `#style-de-vie` |
| Égypte Antique (culture) | `egypte` | — | **sur-mesure** : lever du disque solaire derrière les pyramides de Gizeh | `#style-de-vie` |
| Bête du Gévaudan | `gevaudan` | — | **sur-mesure** : deux yeux ambrés s'allument dans le noir | `#portrait` |
| Monstre du Loch Ness | `lochness` | — | **sur-mesure** : silhouette qui émerge de l'eau puis replonge | `#portrait` |
| Triangle des Bermudes | `bermudes` | — | **sur-mesure** : avion/bateau aspirés dans un vortex | `#enigme` |
| Stonehenge | `stonehenge` | — | **sur-mesure** : lever de soleil au solstice à travers les pierres | `#enigme` |
| Accueil | `accueil` | mélange de glyphes de toutes les cultures | — | — |

## Stratégie par famille de page

Chaque série a sa propre logique d'effet dominant (en plus du décor commun ci-dessus) — c'est le principe à suivre pour toute nouvelle page :

- **Mythologies** → déchiffrement des titres de section (mécanisme 3, obligatoire et "simple" — voir plus bas) **+**, quand le temps le permet, une scène sur-mesure rejouée au clic du titre et en happening sur `#pantheon` (mécanisme 4). Les 10 pages existantes ont les deux niveaux. Pour une nouvelle mythologie : le déchiffrement des titres reste le minimum non négociable ; la scène sur-mesure est un bonus, jamais un blocage pour livrer.
- **Créatures** → "happenings" au scroll (mécanisme 4) qui rejouent l'effet sur-mesure de la créature (pas seulement au clic du titre) sur une section clé — typiquement `#portrait` ou `#temoins-recits`. Déjà fait : Gévaudan (`eyes`, sur `#portrait`), Loch Ness (`nessie`, sur `#portrait`).
- **Mystères** → décors ou effets simples au scroll, même mécanisme 4, sur une section clé — typiquement `#enigme` ou `#decouverte`. Déjà fait : Triangle des Bermudes (`bermudes`, sur `#enigme`), Stonehenge (`solstice`, sur `#enigme`).
- **Cultures** → effets qui jouent sur un élément matériel/iconique de la culture (danse, soie, poterie...) plutôt que sur des glyphes abstraits. Déjà fait : Chine (`silk`, ruban de soie qui ondule, sur `#style-de-vie`), Égypte Antique (réutilise `sunrise`, sur `#style-de-vie`).

## Comment ajouter le déchiffrement de titres à une nouvelle page mythologie

Script de référence utilisé pour les 10 pages existantes (à adapter, pas committé dans le repo — logique à reproduire) :
1. Repérer chaque `<h2 class="section-title">Texte</h2>` sans balise imbriquée.
2. Le remplacer par `<h2 class="section-title"><span class="fx-decode" data-glyphs="CLEF" data-text="Texte (entités HTML décodées)"></span></h2>`.
3. `CLEF` doit exister dans `GLYPH_POOLS` (`effects.js`) — sinon l'ajouter (glyphes décoratifs de la culture, 4-6 caractères suffisent, réutiliser ceux du `glyphShower` de l'easter egg existant si la mythologie en a déjà un).
4. Toujours répercuter dans `public/` en plus de la racine.

## Idées pour les prochaines pages (à activer au fil des ajouts)

**Mythologies à venir** (`suite_mythologies.md`) :
- Chinoise (mythologie, distincte de la page culture) — nuages stylisés + caractère 龍 (dragon) qui serpente à l'écran
- Perse/zoroastrienne — flamme sacrée qui vacille au centre, halo doré/sombre en clair-obscur (dualisme Ahura Mazda / Angra Mainyu)
- Yoruba — motif de perles colorées qui s'assemblent (imagerie des orishas)
- Inca — spirale dorée façon disque solaire d'Inti qui tourne lentement
- Aborigène australienne — motif de points façon peinture aborigène qui se dessine progressivement (à traiter avec un soin particulier pour rester respectueux, cf. principes de fond de la série mythologies)

**Cultures à venir** (jouer sur un objet/geste matériel et reconnaissable de la culture, pas sur des glyphes) :
- Rome antique — un aigle légionnaire qui traverse l'écran, ou des colonnes qui se dessinent en silhouette
- Grèce antique — une amphore à figures noires qui pivote et dont la scène peinte s'anime brièvement, ou une colonne dorique qui se construit tambour par tambour (attention à ne pas dupliquer l'éclair de Zeus déjà utilisé côté mythologie grecque)
- Japon (culture) — un torii qui se dessine en trait, ou un pli d'éventail/origami qui se déplie, distinct des pétales déjà utilisés côté Chine
- Inde (culture) — un geste de danse classique (mudra) esquissé en une ligne continue, ou un motif de rangoli qui se compose point par point
- Afrique de l'Ouest (ex. Yoruba/Ashanti) — un tissu kente/wax dont le motif se tisse progressivement, ou une silhouette de danse tambourinée
- Mexique/Aztèque (culture, distincte de la page mythologie) — un motif de tissage ou de céramique qui se complète progressivement

**Créatures à venir** (`liste-creatures-mysteres-monde.md`) :
- Bigfoot — une haute silhouette qui traverse furtivement l'arrière-plan entre les arbres, sans jamais être vue de face
- Le Yeti — un souffle de vent/neige qui balaie l'écran, empreintes de pas qui apparaissent brièvement
- Le Chupacabra — deux yeux rouges façon Gévaudan mais palette désertique (à varier pour ne pas juste recolorer l'effet Gévaudan)
- Le Mothman — une grande ombre ailée qui passe rapidement devant un halo de lumière (référence au pont de Point Pleasant)

**Mystères à venir** :
- Le manuscrit de Voynich — des lignes de son écriture non déchiffrée qui défilent puis se brouillent
- Les lignes de Nazca — un tracé de colibri ou de singe qui se dessine vu du ciel
- Le col Dyatlov — **traiter avec une sobriété particulière** (victimes réelles) : pas d'effet spectaculaire, à la limite un simple effet neige/vent discret sans mise en scène narrative

## Contraintes à respecter pour tout nouvel effet

- Toujours passer par `layer()`/`glyphShower()` ou le même style d'API que les effets existants (durée de vie limitée, auto-nettoyage du DOM).
- Toujours tester que l'effet ne casse rien si déclenché plusieurs fois de suite rapidement (`busy` flag pour les easter eggs cliqués, `scrollFxLastPlayed` avec repos ~7s pour les happenings au scroll — ne pas descendre en dessous sans raison, c'est ce qui évite l'effet "gênant" en cas de va-et-vient).
- Un nouveau `data-scroll-fx` doit pointer vers une fonction déjà déclarée dans `SCROLL_FX` (`effects.js`) — en général la même fonction que l'easter egg de la page, réutilisée telle quelle.
- Rester sur des couleurs/formes qui se lisent bien par-dessus le contenu existant, jamais bloquant pour la lecture.
- Un seul fichier `effects.js` — toujours resynchroniser `public/effects.js` après modification (les deux copies doivent être identiques).
