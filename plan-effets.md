# Plan des effets JS/SVG (`effects.js`)

## Principe

`effects.js` est un fichier unique, partagé par toutes les pages (racine + `public/`, toujours synchronisés). Deux couches :

1. **Universel, discret, jamais désactivable par sujet** : barre de progression de lecture, légère lueur suivant la souris dans le hero. Ne pas ajouter d'autres effets "globaux" — le principe est de rester sobre par défaut.
2. **Un easter egg par page**, déclenché en cliquant le titre du hero (`<h1>`) ou via le code Konami (↑↑↓↓←→←→BA). Chaque page se déclare via `<body data-egg="clef">`, et la clef pointe vers une fonction dans l'objet `EGGS` en fin de fichier.

Tout est protégé par `prefers-reduced-motion` (rien ne se déclenche si l'utilisateur le demande) et encapsulé en `try/catch` (`trigger()`) — un easter egg cassé ne doit jamais casser la page.

## Deux niveaux de qualité d'easter egg

- **Générique** : `glyphShower({glyphs, mode, color, count})` fait pleuvoir/monter des glyphes propres à la culture (runes, grec, hiéroglyphes, cunéiforme, ogham...). Rapide à brancher pour une nouvelle mythologie — c'est le niveau minimum acceptable, jamais un blocage pour livrer une page.
- **Sur-mesure** : une scène animée en SVG/CSS propre au sujet (Nessie qui émerge, avion aspiré dans le Triangle des Bermudes, lever de soleil à Stonehenge, yeux du Gévaudan dans le noir, lever de Rê sur les pyramides). Plus de travail, réservé aux pages qui s'y prêtent visuellement bien — pas la peine de forcer un sur-mesure sur un sujet qui n'a pas d'image iconique évidente.

**Règle de priorité** : livrer la page avec le générique d'abord si le temps manque, upgrader vers le sur-mesure ensuite. Ne jamais retarder la mise en ligne d'une page pour finir un easter egg.

## Déjà fait (16 pages)

| Page | Clef `data-egg` | Niveau | Effet |
|---|---|---|---|
| Nordique | `nordique` | générique | pluie de runes |
| Grecque | `grecque` | générique | montée de lettres grecques |
| Égyptienne (mythologie) | `egyptienne` | générique | montée de hiéroglyphes |
| Romaine | `romaine` | générique | pluie de chiffres romains |
| Celtique | `celtique` | générique | montée de glyphes ogham |
| Mésopotamienne | `mesopotamienne` | générique | pluie de cunéiformes |
| Hindoue | `hindoue` | générique | montée ॐ/☸/✴ |
| Japonaise | `japonaise` | générique | pluie de pétales de sakura |
| Aztèque & Maya | `azteque` | générique | montée de glyphes solaires |
| Slave | `slave` | générique | montée de symboles solaires slaves |
| Chine (culture) | `chine` | générique | pluie de sinogrammes (福龍鳳春) |
| Égypte Antique (culture) | `egypte` | **sur-mesure** | lever du disque solaire derrière les pyramides de Gizeh |
| Bête du Gévaudan | `gevaudan` | **sur-mesure** | deux yeux ambrés s'allument dans le noir |
| Monstre du Loch Ness | `lochness` | **sur-mesure** | silhouette qui émerge de l'eau puis replonge |
| Triangle des Bermudes | `bermudes` | **sur-mesure** | avion/bateau aspirés dans un vortex |
| Stonehenge | `stonehenge` | **sur-mesure** | lever de soleil au solstice à travers les pierres |
| Accueil | `accueil` | générique | mélange de glyphes de toutes les cultures |

## Idées pour les prochaines pages (à activer au fil des ajouts)

**Mythologies à venir** (`suite_mythologies.md`) :
- Chinoise (mythologie, distincte de la page culture) — nuages stylisés + caractère 龍 (dragon) qui serpente à l'écran
- Perse/zoroastrienne — flamme sacrée qui vacille au centre, halo doré/sombre en clair-obscur (dualisme Ahura Mazda / Angra Mainyu)
- Yoruba — motif de perles colorées qui s'assemblent (imagerie des orishas)
- Inca — spirale dorée façon disque solaire d'Inti qui tourne lentement
- Aborigène australienne — motif de points façon peinture aborigène qui se dessine progressivement (à traiter avec un soin particulier pour rester respectueux, cf. principes de fond de la série mythologies)

**Cultures à venir** :
- Rome antique — un aigle légionnaire qui traverse l'écran, ou des colonnes qui se dessinent en silhouette
- Grèce antique — une colonne dorique qui se construit tambour par tambour, ou un éclair façon Zeus (attention à ne pas dupliquer l'effet déjà utilisé côté mythologie grecque)
- Japon (culture) — un torii qui se dessine en trait, distinct des pétales déjà utilisés côté Chine

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
- Toujours tester que l'effet ne casse rien si déclenché plusieurs fois de suite rapidement (`busy` flag déjà géré globalement, pas besoin de le refaire par effet).
- Rester sur des couleurs/formes qui se lisent bien par-dessus le contenu existant, jamais bloquant pour la lecture.
- Un seul fichier `effects.js` — toujours resynchroniser `public/effects.js` après modification (les deux copies doivent être identiques).
