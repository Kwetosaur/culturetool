# Plan des effets JS/SVG (`effects.js`)

## Principe

`effects.js` est un fichier unique, partagé par toutes les pages (racine + `public/`, toujours synchronisés). Cinq couches :

0. **Bascule "Effets" en haut à droite** (`#fx-toggle`) — présente sur *toutes* les pages, y compris l'accueil. Préférence persistée dans `localStorage` (`culturetool-fx`, valeur `'off'` ou absente/`'on'`), lue tout en haut du script : si désactivée, **rien d'autre ne s'exécute** (pas de barre de progression, pas de lueur, pas de déchiffrement, pas de happenings) — site totalement épuré. Le bouton, lui, reste toujours visible et cliquable pour réactiver ; le clic recharge la page pour repartir d'un état propre plutôt que de tenter un retrait à chaud (plus simple, plus fiable). C'est la première chose à vérifier si on ajoute un nouvel effet : il doit être *après* ce garde-fou dans le fichier, jamais avant.
1. **Universel, discret, jamais désactivable par sujet** (mais coupé par la bascule 0) : barre de progression de lecture, légère lueur suivant la souris dans le hero. Ne pas ajouter d'autres effets "globaux" — le principe est de rester sobre par défaut.
2. **Un easter egg par page**, déclenché en cliquant le titre du hero (`<h1>`) ou via le code Konami (↑↑↓↓←→←→BA). Chaque page se déclare via `<body data-egg="clef">`, et la clef pointe vers une fonction dans l'objet `EGGS` en fin de fichier.
3. **Inscriptions qui se déchiffrent au scroll** — `<span class="fx-decode" data-glyphs="rune">Texte réel et lisible</span>` : le HTML porte le **vrai texte en contenu visible** (dégradation propre si JS coupé ou effets désactivés — jamais un élément vide). Au chargement, le script capture ce texte dans `data-text` puis le remplace par des glyphes ; au scroll, chaque lettre se fige lettre par lettre en texte lisible (éclat lumineux, léger hasard dans le rythme). **Rejouable** : l'inscription redevient des glyphes en sortant du viewport, prête à se rejouer à la prochaine entrée (avant ou arrière). Généralisé aux 9 titres de section (`h2.section-title`) des 10 pages mythologie — voir `GLYPH_POOLS` dans `effects.js` pour la palette de glyphes par culture.
4. **"Happenings" au scroll** — `<section data-scroll-fx="nessie">` : rejoue un effet existant (souvent le même que l'easter egg de la page) quand la section entre dans le viewport, avec un repos de ~7s par clef pour ne jamais devenir agaçant en va-et-vient. Permet aux pages créatures/mystères/cultures/mythologies d'avoir un petit moment vivant en scrollant, pas seulement au clic.

Tout est encapsulé en `try/catch` — un effet cassé ne doit jamais casser la page. Pas de garde-fou `prefers-reduced-motion` (retiré sur demande explicite : les effets doivent s'afficher partout) — la bascule 0 est le seul mécanisme de contrôle utilisateur, et c'est voulu.

**Pièges déjà rencontrés** :
- Un élément `.fx-decode` vide fait 0px de hauteur avant son premier rendu, ce qui empêche `IntersectionObserver` de calculer un ratio d'intersection exploitable (il ne se déclenche jamais). D'où le `min-height` sur `.fx-decode` dans la feuille de style injectée — à garder si on retouche ce composant.
- Ne **jamais** générer un `.fx-decode` vide avec le texte planqué uniquement dans `data-text` : sans JS (ou bascule sur "off"), l'utilisateur ne verrait rien du tout. Le texte réel doit toujours être le contenu visible de l'élément dans le HTML.
- Le `try/catch` global autour du déclenchement d'un easter egg (`trigger()`) avale les erreurs silencieusement (comportement voulu, pour ne jamais casser la page) — mais ça veut dire qu'une régression dans un effet bespoke ne remonte **pas** en erreur console. Pour déboguer, rejouer la fonction isolément (voir méthode de test plus bas) plutôt que de se fier à l'absence d'erreur affichée.

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
2. Le remplacer par `<h2 class="section-title"><span class="fx-decode" data-glyphs="CLEF">Texte</span></h2>` — **le texte réel reste le contenu visible**, jamais dans un attribut seul (voir piège ci-dessus).
3. `CLEF` doit exister dans `GLYPH_POOLS` (`effects.js`) — sinon l'ajouter (glyphes décoratifs de la culture, 4-6 caractères suffisent, réutiliser ceux du `glyphShower` de l'easter egg existant si la mythologie en a déjà un).
4. Toujours répercuter dans `public/` en plus de la racine.

## Idées pour les prochaines pages (à activer au fil des ajouts)

Pour chaque page, 1 à 3 pistes — choisir celle qui se prête le mieux au moment de l'écriture, pas besoin de les implémenter toutes. Toutes se construisent avec les mêmes briques que l'existant (`layer()`, `flyAcross()`, `glyphShower()`, `animate()`).

**Mythologies à venir** (`suite_mythologies.md`, top 5 recommandé en priorité) :
- **Chinoise** (mythologie, distincte de la page culture) — (1) nuages stylisés + caractère 龍 (dragon) qui serpente à l'écran ; (2) un éventail de jade qui s'ouvre et révèle un caractère ; (3) une pluie de pétales de pêcher (symbole d'immortalité), distincte des sinogrammes déjà utilisés côté culture.
- **Perse/zoroastrienne** — (1) une flamme sacrée qui vacille au centre, halo doré/sombre en clair-obscur (dualisme Ahura Mazda / Angra Mainyu) ; (2) une balance de lumière et d'ombre qui s'incline doucement d'un côté puis de l'autre ; (3) les ailes du Faravahar qui se déploient en silhouette dorée.
- **Yoruba** — (1) des perles colorées qui s'assemblent en collier (imagerie des orishas) ; (2) un motif de tissu adire qui se teint progressivement à l'écran ; (3) un éclair d'orage (Shango) qui zèbre brièvement l'écran.
- **Inca** — (1) une spirale dorée façon disque solaire d'Inti qui tourne lentement ; (2) un fil de quipu dont les nœuds se nouent un à un le long d'un cordon ; (3) un condor qui plane en silhouette, ailes déployées, traversant lentement l'écran.
- **Aborigène australienne** — (1) un motif de points façon peinture aborigène qui se dessine progressivement ; (2) une ligne de chant (songline) tracée en pointillé lumineux à travers un paysage stylisé. **Traiter avec un soin particulier** (consulter des sources issues des communautés concernées avant de choisir le motif définitif) — cf. principes de fond de la série mythologies sur le respect des croyances vivantes.
- Autres candidats de la liste (Finnoise, Coréenne, Polynésienne, Inuit...) : partir du niveau générique (`glyphShower`) d'abord, ideation sur-mesure au moment de l'écriture plutôt qu'anticipée ici.

**Cultures à venir** (jouer sur un objet/geste matériel et reconnaissable de la culture, pas sur des glyphes) :
- **Rome antique** — (1) un aigle légionnaire (aquila) qui traverse l'écran ; (2) des colonnes qui se dessinent en silhouette, tambour par tambour ; (3) une toge qui se drape ou un laurier qui s'enroule en couronne.
- **Grèce antique** — (1) une amphore à figures noires qui pivote et dont la scène peinte s'anime brièvement ; (2) une colonne dorique qui se construit tambour par tambour ; (3) un masque de théâtre qui se retourne de la comédie à la tragédie (attention à ne pas dupliquer l'éclair de Zeus déjà utilisé côté mythologie grecque).
- **Japon (culture)** — (1) un torii qui se dessine en trait continu ; (2) un pli d'éventail ou d'origami qui se déplie ; (3) une vague façon estampe (Hokusai) qui déferle doucement — distinct des pétales déjà utilisés côté Chine.
- **Inde (culture)** — (1) un geste de danse classique (mudra) esquissé en une ligne continue ; (2) un motif de rangoli qui se compose point par point ; (3) un drapé de sari qui se déploie en tissu animé.
- **Afrique de l'Ouest** (Yoruba/Ashanti...) — (1) un tissu kente ou wax dont le motif se tisse progressivement ; (2) une silhouette de danse tambourinée ; (3) un masque cérémoniel qui s'illumine brièvement.
- **Mexique/Aztèque (culture)**, distincte de la page mythologie — (1) un motif de tissage ou de céramique qui se complète progressivement ; (2) une pyramide à degrés qui se dessine en silhouette ; (3) un éclat de jade qui scintille (symbole de richesse).

**Créatures à venir** (`liste-creatures-mysteres-monde.md`) :
- **Bigfoot** — (1) une haute silhouette qui traverse furtivement l'arrière-plan entre les arbres, sans jamais être vue de face ; (2) des empreintes de pas qui apparaissent dans la boue en séquence ; (3) un froissement de branches qui secoue légèrement le bord du cadre.
- **Le Yeti** — (1) un souffle de vent/neige qui balaie l'écran ; (2) des empreintes qui apparaissent brièvement dans la neige ; (3) une silhouette floue derrière un voile de blizzard qui se dissipe sans jamais se préciser.
- **Le Chupacabra** — (1) deux yeux rouges façon Gévaudan mais palette désertique (varier la mise en scène, pas juste recolorer `eyes()`) ; (2) une ombre qui bondit furtivement d'un cactus à l'autre ; (3) un nuage de poussière/sable soulevé au ras du sol.
- **Le Mothman** — (1) une grande ombre ailée qui passe rapidement devant un halo de lumière (référence au pont de Point Pleasant) ; (2) deux points rouges qui clignotent brièvement dans le noir ; (3) un vol erratique de silhouette autour d'une structure de pont stylisée.

**Mystères à venir** :
- **Le manuscrit de Voynich** — (1) des lignes de son écriture non déchiffrée qui défilent puis se brouillent ; (2) une page qui se tourne et révèle une illustration botanique énigmatique ; (3) une loupe qui balaie le texte sans jamais réussir à le "résoudre" (symbolique de l'énigme non résolue).
- **Les lignes de Nazca** — (1) un tracé de colibri ou de singe qui se dessine vu du ciel ; (2) une ombre de survol qui balaie lentement le motif ; (3) les lignes qui s'illuminent point par point comme un dessin au trait continu.
- **Le mécanisme d'Anticythère** (mystère résolu — bon contrepoint) — engrenages antiques qui s'assemblent et se mettent à tourner, révélant leur sophistication.
- **La disparition d'Amelia Earhart** — un avion qui s'estompe progressivement dans un brouillard du Pacifique, traité sobrement (pas de mise en scène de catastrophe).
- **L'île de Pâques** — un moai qui se dresse en silhouette, très sobre.
- **Le col Dyatlov** — **traiter avec une sobriété particulière** (victimes réelles) : se limiter à un simple effet neige/vent discret sans mise en scène narrative, ne pas chercher à en rajouter au-delà de ça.

## Contraintes à respecter pour tout nouvel effet

- Toujours passer par `layer()`/`glyphShower()` ou le même style d'API que les effets existants (durée de vie limitée, auto-nettoyage du DOM).
- Toujours tester que l'effet ne casse rien si déclenché plusieurs fois de suite rapidement (`busy` flag pour les easter eggs cliqués, `scrollFxLastPlayed` avec repos ~7s pour les happenings au scroll — ne pas descendre en dessous sans raison, c'est ce qui évite l'effet "gênant" en cas de va-et-vient).
- Un nouveau `data-scroll-fx` doit pointer vers une fonction déjà déclarée dans `SCROLL_FX` (`effects.js`) — en général la même fonction que l'easter egg de la page, réutilisée telle quelle.
- Rester sur des couleurs/formes qui se lisent bien par-dessus le contenu existant, jamais bloquant pour la lecture.
- Un seul fichier `effects.js` — toujours resynchroniser `public/effects.js` après modification (les deux copies doivent être identiques).
