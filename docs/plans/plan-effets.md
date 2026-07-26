# Plan des effets JS/SVG (`effects.js`)

## Principe

`effects.js` est un fichier unique (`public/effects.js`), partagé par toutes les pages. Depuis le nettoyage du 26/07/2026 il n'y a **plus de double copie à synchroniser** : les doublons de la racine ont été supprimés. Cinq couches :

0. **Bascule "Effets" en haut à droite** (`#fx-toggle`) — présente sur *toutes* les pages, y compris l'accueil. Préférence persistée dans `localStorage` (`culturetool-fx`, valeur `'off'` ou absente/`'on'`), lue tout en haut du script : si désactivée, **rien d'autre ne s'exécute** (pas de barre de progression, pas de lueur, pas de déchiffrement, pas de happenings) — site totalement épuré. Le bouton, lui, reste toujours visible et cliquable pour réactiver ; le clic recharge la page pour repartir d'un état propre plutôt que de tenter un retrait à chaud (plus simple, plus fiable). C'est la première chose à vérifier si on ajoute un nouvel effet : il doit être *après* ce garde-fou dans le fichier, jamais avant.
1. **Universel, discret, jamais désactivable par sujet** (mais coupé par la bascule 0) : barre de progression de lecture, légère lueur suivant la souris dans le hero. Ne pas ajouter d'autres effets "globaux" — le principe est de rester sobre par défaut.
2. **Un easter egg par page**, déclenché en cliquant le titre du hero (`<h1>`) ou via le code Konami (↑↑↓↓←→←→BA). Chaque page se déclare via `<body data-egg="clef">`, et la clef pointe vers une fonction dans l'objet `EGGS` en fin de fichier.
3. **Inscriptions qui se déchiffrent au scroll** *(voir l'arbitrage de portée en fin de
   section : ce mécanisme est réservé aux mythologies et aux objets légendaires)* —
   `<span class="fx-decode" data-glyphs="rune">Texte réel et lisible</span>` : le HTML porte le **vrai texte en contenu visible** (dégradation propre si JS coupé ou effets désactivés — jamais un élément vide). Au chargement, le script capture ce texte dans `data-text` puis le remplace par des glyphes ; au scroll, chaque lettre se fige lettre par lettre en texte lisible (éclat lumineux, léger hasard dans le rythme). **Rejouable** : l'inscription redevient des glyphes en sortant du viewport, prête à se rejouer à la prochaine entrée (avant ou arrière). Généralisé aux 9-10 titres de section (`h2.section-title`) des 11 pages mythologie — voir `GLYPH_POOLS` dans `effects.js` pour la palette de glyphes par culture.

  **Arbitrage de portée (26/07/2026)** : comptage effectif des `fx-decode` par page — 9 à 10
  sur chacune des 11 mythologies, **0 sur les 18 autres pages**. Ce n'est pas un oubli à
  rattraper, c'est désormais une **décision assumée** : les pools de `GLYPH_POOLS` sont des
  écritures culturelles (runes, grec, hiéroglyphes, cunéiforme, ogham, sinogrammes…) qui
  n'ont aucun sens sur une page « Triangle des Bermudes » ou « Bigfoot ». Le déchiffrement
  est donc la **signature de la famille mythologie**, plus une **extension autorisée à la
  famille objets légendaires** — où beaucoup de sujets portent une inscription réelle (lames
  Ulfberht signées, sceaux impériaux chinois, Couronne de fer). Sur les objets, la règle est
  stricte : le pool doit correspondre à l'écriture réelle de l'objet, et le texte déchiffré
  doit être la vraie inscription (ou son sens), jamais un ornement inventé.
  Cultures, créatures et mystères n'ont que les mécanismes 1, 2 et 4 — et c'est voulu.
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

## Déjà fait (38 pages de contenu + l'accueil)

Les 11 pages mythologie combinent désormais leur pluie de glyphes générique **et** une scène sur-mesure (au clic du titre **et** en happening au scroll sur `#pantheon`) — plus du niveau "minimum" décrit ci-dessus.

Câblage vérifié le 26/07/2026 (voir `docs/audit-existant.md` § E) : les 30 clefs `data-egg` utilisées dans les pages existent toutes dans `EGGS`, les 29 `data-scroll-fx` dans `SCROLL_FX`, les 11 `data-glyphs` dans `GLYPH_POOLS`. Aucune clef morte, aucune clef manquante.

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
| Rome antique (culture) | `rome` | pluie de chiffres romains | **sur-mesure** : trois colonnes de temple qui se révèlent de bas en haut | `#style-de-vie` |
| Bigfoot | `bigfoot` | — | **sur-mesure** : empreintes qui apparaissent en diagonale dans la végétation | `#portrait` |
| Col Dyatlov | `dyatlov` | — | **sur-mesure sobre** : quelques flocons portés par le vent, sans mise en scène | `#enigme` |
| Grèce antique (culture) | `grece` | montée de lettres grecques | **sur-mesure** : masque de théâtre qui pivote de la comédie à la tragédie | `#style-de-vie` |
| Le Yeti | `yeti` | — | **sur-mesure** : rafale de neige + silhouette floue qui se dissout sans jamais se préciser | `#portrait` |
| Manuscrit de Voynich | `voynich` | — | **sur-mesure** : glyphes inventés qui défilent puis se brouillent sans jamais se lire | `#enigme` |
| Vikings / Scandinavie médiévale (culture) | `vikings` | — | **sur-mesure** : drakkar à voile rayée qui traverse l'écran | `#style-de-vie` |
| Le Chupacabra | `chupacabra` | — | **sur-mesure** : yeux rouges désertiques + ombre qui bondit entre les cactus | `#portrait` |
| Lignes de Nazca | `nazca` | — | **sur-mesure** : géoglyphe de colibri qui se dessine trait par trait | `#enigme` |
| Empire du Mali (culture) | `mali` | — | **sur-mesure** : caravane de chameaux qui traverse l'écran dans un nuage de poussière dorée | `#style-de-vie` |
| Le Mothman | `mothman` | — | **sur-mesure** : grande ombre ailée qui passe devant un halo de lumière | `#portrait` |
| Mécanisme d'Anticythère | `antikythera` | — | **sur-mesure** : engrenages antiques qui s'assemblent et se mettent à tourner | `#enigme` |
| Chinoise (mythologie) | `chinoise` | pluie de sinogrammes (福龍鳳春) | **sur-mesure** : dragon qui serpente à travers des nuages stylisés | `#pantheon` |
| Excalibur (objet) | `excalibur` | — | **sur-mesure** : l'épée se dégage de la pierre en un seul mouvement, éclat de lame au sommet | `#description` |
| L'Arche d'Alliance (objet) | `arche` | — | **sur-mesure** : deux ailes de chérubins d'or se déploient au-dessus du coffre, qui ne s'ouvre jamais | `#description` |
| Les Trois Trésors du Japon (objet) | `tresors` | — | **sur-mesure** : trois coffres scellés s'alignent et restent fermés — le refus de montrer est l'effet | `#description` |
| Le Tabouret d'or des Ashanti (objet) | `tabouret` | — | **sur-mesure sobre** : le tabouret descend se poser sur un coussin, sans jamais toucher le sol | `#description` |
| Mjöllnir (objet) | `mjollnir` | — | **sur-mesure** : un marteau se forge sous des coups d'enclume, étincelles à chaque frappe | `#facture` |
| Le Cheval de Troie (objet) | `chevaltroie` | — | **sur-mesure** : un cheval de bois s'assemble planche par planche puis roule hors de l'écran | `#description` |
| La Pierre du Soleil aztèque (objet) | `pierresoleil` | — | **sur-mesure** : un disque tourne d'un cran puis s'arrête net — jamais un défilement continu | `#description` |
| L'hameçon de Maui (objet) | `hamecon` | — | **sur-mesure** : un hameçon tire une île hors de l'eau, puis sa courbe se prolonge en constellation | `#description` |
| Le Koh-i-Noor (objet) | `kohinoor` | — | **sur-mesure** : un diamant dont les facettes s'allument une à une, chacune projetant un éclat bref | `#description` |
| Accueil | `accueil` | mélange de glyphes de toutes les cultures | — | — |

## Stratégie par famille de page

Chaque série a sa propre logique d'effet dominant (en plus du décor commun ci-dessus) — c'est le principe à suivre pour toute nouvelle page :

- **Mythologies** → déchiffrement des titres de section (mécanisme 3, obligatoire et "simple" — voir plus bas) **+**, quand le temps le permet, une scène sur-mesure rejouée au clic du titre et en happening sur `#pantheon` (mécanisme 4). Les 11 pages existantes ont les deux niveaux. Pour une nouvelle mythologie : le déchiffrement des titres reste le minimum non négociable ; la scène sur-mesure est un bonus, jamais un blocage pour livrer.
- **Créatures** → "happenings" au scroll (mécanisme 4) qui rejouent l'effet sur-mesure de la créature (pas seulement au clic du titre) sur une section clé — typiquement `#portrait` ou `#temoins-recits`. Déjà fait : Gévaudan (`eyes`, sur `#portrait`), Loch Ness (`nessie`, sur `#portrait`), Bigfoot (`bigfootTracks`, empreintes en diagonale, sur `#portrait`), Yeti (`yetiBlizzard`, blizzard + silhouette floue, sur `#portrait`), Chupacabra (`chupacabraEyes`, yeux rouges désertiques + ombre bondissante, sur `#portrait`), Mothman (`mothmanShadow`, ombre ailée + halo, sur `#portrait`).
- **Mystères** → décors ou effets simples au scroll, même mécanisme 4, sur une section clé — typiquement `#enigme` ou `#decouverte`. Déjà fait : Triangle des Bermudes (`bermudes`, sur `#enigme`), Stonehenge (`solstice`, sur `#enigme`), Col Dyatlov (`dyatlov`, flocons sobres, sur `#enigme`), Manuscrit de Voynich (`voynichScript`, glyphes inventés, sur `#enigme`), Lignes de Nazca (`nazcaLines`, géoglyphe qui se dessine, sur `#enigme`), Mécanisme d'Anticythère (`antikytheraGears`, engrenages qui s'assemblent, sur `#enigme`).
- **Cultures** → effets qui jouent sur un élément matériel/iconique de la culture (danse, soie, poterie...) plutôt que sur des glyphes abstraits. Déjà fait : Chine (`silk`, ruban de soie qui ondule, sur `#style-de-vie`), Égypte Antique (réutilise `sunrise`, sur `#style-de-vie`), Rome antique (`romanColumns`, colonnes qui se révèlent, sur `#style-de-vie`), Grèce antique (`greekMaskFlip`, masque comédie/tragédie, sur `#style-de-vie`), Vikings (`vikingLonghship`, drakkar qui traverse l'écran, sur `#style-de-vie`).
- **Objets légendaires** (5e famille, créée le 26/07/2026, aucune page écrite) → **l'objet lui-même s'assemble, se forge ou s'illumine**. Ni glyphes abstraits, ni créature qui traverse, ni décor d'ambiance : une chose fabriquée qui se construit sous les yeux du lecteur. Le précédent existe et fonctionne : `antikytheraGears` (engrenages qui s'assemblent puis tournent) est exactement le patron à suivre. Section porteuse du `data-scroll-fx` : **`#description`** (là où l'objet est décrit) ou **`#facture`** (la section forge/matière). Le déchiffrement d'inscription (mécanisme 3) est autorisé sur cette famille, voir l'arbitrage plus haut.

## Comment ajouter le déchiffrement de titres à une nouvelle page mythologie

Script de référence utilisé pour les 11 pages existantes (à adapter, pas committé dans le repo — logique à reproduire) :
1. Repérer chaque `<h2 class="section-title">Texte</h2>` sans balise imbriquée.
2. Le remplacer par `<h2 class="section-title"><span class="fx-decode" data-glyphs="CLEF">Texte</span></h2>` — **le texte réel reste le contenu visible**, jamais dans un attribut seul (voir piège ci-dessus).
3. `CLEF` doit exister dans `GLYPH_POOLS` (`effects.js`) — sinon l'ajouter (glyphes décoratifs de la culture, 4-6 caractères suffisent, réutiliser ceux du `glyphShower` de l'easter egg existant si la mythologie en a déjà un).
4. Une seule copie à éditer : `public/effects.js`.

## Idées pour les prochaines pages (à activer au fil des ajouts)

Pour chaque page, 1 à 3 pistes — choisir celle qui se prête le mieux au moment de l'écriture, pas besoin de les implémenter toutes. Toutes se construisent avec les mêmes briques que l'existant (`layer()`, `flyAcross()`, `glyphShower()`, `animate()`).

**Couverture (mise à jour du 26/07/2026)** : les 159 pages à venir des 5 familles ont
désormais **toutes** au moins une piste écrite — 38 mythologies, 28 cultures, 30 créatures,
27 mystères, 36 objets. Les 26 derniers sujets ont été ajoutés aux listes le même jour pour
combler des trous géographiques (voir les `suite_*.md`), et leurs pistes sont dans les
mêmes tableaux. Avant cette mise à jour, les créatures et les mystères à venir
n'avaient aucune piste et renvoyaient à un « niveau générique » qui n'existe pas pour ces
familles (voir `docs/audit-existant.md` § C2). Une piste n'est **jamais** un engagement : c'est
un point de départ pour ne pas repartir de zéro au moment de l'écriture, et elle peut être
remplacée par mieux.

**Les 4 mythologies les plus attendues** (`docs/listes/suite_mythologies.md`, top 5 recommandé), avec
plusieurs pistes chacune :
- **Perse/zoroastrienne** — (1) une flamme sacrée qui vacille au centre, halo doré/sombre en clair-obscur (dualisme Ahura Mazda / Angra Mainyu) ; (2) une balance de lumière et d'ombre qui s'incline doucement d'un côté puis de l'autre ; (3) les ailes du Faravahar qui se déploient en silhouette dorée.
- **Yoruba** — (1) des perles colorées qui s'assemblent en collier (imagerie des orishas) ; (2) un motif de tissu adire qui se teint progressivement à l'écran ; (3) un éclair d'orage (Shango) qui zèbre brièvement l'écran.
- **Inca** — (1) une spirale dorée façon disque solaire d'Inti qui tourne lentement ; (2) un fil de quipu dont les nœuds se nouent un à un le long d'un cordon ; (3) un condor qui plane en silhouette, ailes déployées, traversant lentement l'écran.
- **Aborigène australienne** — (1) un motif de points façon peinture aborigène qui se dessine progressivement ; (2) une ligne de chant (songline) tracée en pointillé lumineux à travers un paysage stylisé. **Traiter avec un soin particulier** (consulter des sources issues des communautés concernées avant de choisir le motif définitif) — cf. principes de fond de la série mythologies sur le respect des croyances vivantes.

**Les 34 autres mythologies à venir** — une piste par page. Le déchiffrement des titres
(mécanisme 3) reste le minimum non négociable sur cette famille ; la scène ci-dessous est le
bonus.

| Page | Piste d'effet |
|---|---|
| Finnoise | Un œuf cosmique qui se fend, ses fragments montant former le ciel et descendant former la terre |
| Sami | Un tambour chamanique frappé : la membrane vibre et les symboles gravés dessus s'allument un par un |
| Balte | Un soleil géométrique qui se lève, rayons droits qui se déploient un à un (Saulė) |
| Basque | Un lauburu qui s'assemble branche par branche puis tourne lentement |
| Géorgienne / caucasienne | Une chaîne tendue qui se rompt maillon par maillon (Amirani libéré) |
| Arménienne | Une grappe de raisin qui se remplit grain par grain ; variante : un vishap de pierre qui s'éclaire |
| Étrusque | Un foie divinatoire qui se quadrille en secteurs lumineux, un secteur après l'autre (haruspicine) — sobre, schématique |
| Cananéenne / ougaritique | Les cornes d'un taureau qui s'illuminent sous un orage bref (Baal) |
| Hittite | Un serpent-dragon qui s'enroule puis se dénoue et s'efface (Illuyanka) |
| Arabe préislamique | Un croissant et son étoile qui se lèvent au-dessus d'une caravane en ombres |
| Coréenne | Une silhouette d'ourse qui devient femme par fondu très progressif (Dangun) — sobre, aucune métamorphose spectaculaire |
| Tibétaine / Bön | Des drapeaux de prière qui claquent en chaîne, révélant une montagne sortie de la brume (réutilise `mistDrift`) |
| Mongole | Le ciel nocturne qui s'ouvre en étoiles (Tengri), silhouette de loup au lointain |
| Vietnamienne | Un œuf qui se fend en cent points lumineux qui se dispersent (Lạc Long Quân et Âu Cơ) |
| Turque / Asie centrale | Les yeux d'une louve grise qui s'allument dans la steppe (variante de `eyes`, palette froide) |
| Cosmologie bouddhiste | Le mont Meru qui s'élève strate par strate en cercles concentriques |
| Dogon | Deux étoiles qui tournent l'une autour de l'autre, l'une minuscule (Sirius A et B) |
| Ashanti / Akan | Une toile d'araignée qui se tisse fil par fil (Anansi) |
| Zoulou | Un bouclier qui se dresse au rythme d'un martèlement de lances |
| Éthiopienne | Une arche qui s'illumine derrière un voile qui ne s'ouvre jamais — sobre, cf. respect des traditions vivantes |
| Navajo / Diné | Une spirale à quatre boucles qui se déroule, une boucle par monde traversé |
| Haudenosaunee | Une tortue qui émerge, la terre s'étendant sur sa carapace |
| Lakota / Sioux | Un cercle sacré traversé d'une plume qui tourne au vent |
| Pacifique Nord-Ouest | Un corbeau totémique qui traverse l'écran (réutilise `flyAcross` avec une palette rouge/noir de mât totémique) |
| Taïno | Un visage zemi qui se grave dans la pierre, trait par trait |
| Polynésienne | Un hameçon qui tire une île hors de l'eau (Maui) |
| Mélanésienne | Un masque cérémoniel qui s'illumine brièvement puis se rendort |
| Inuit | Une aurore boréale qui ondule lentement en haut de l'écran ; variante : une chevelure qui ondule sous la surface (Sedna) |
| Ainu | Un ours qui s'efface en fumée d'offrande, très sobre (la cérémonie de l'*iyomante* renvoie l'esprit au monde des dieux) — respect d'une culture vivante, aucune mise en scène de chasse |
| Berbère / amazighe | Une pluie qui tombe enfin sur une terre craquelée, les fissures se refermant (Anzar) |
| Javanaise / indonésienne | Une marionnette de wayang qui projette son ombre sur un écran de toile, l'ombre devenant plus nette que la figure |
| Philippines | Un essaim de lucioles qui se rassemble en silhouette puis se disperse (les esprits du folklore, jamais montrés de face) |
| Mapuche | Deux serpents qui montent l'un contre l'autre, l'eau montant avec eux, puis se retirent (Ten Ten et Kai Kai) |
| Guarani / tupi | Un chemin de lumière qui s'ouvre à travers la forêt et se referme (la quête de la Terre sans Mal) |

**Les 28 cultures à venir** — jouer sur un objet ou un geste matériel reconnaissable de la
culture, jamais sur des glyphes abstraits.

| Page | Piste d'effet |
|---|---|
| Celtes (Gaule / Îles britanniques) | Un torque d'or qui se torsade brin par brin |
| Empire byzantin | Une mosaïque à la feuille d'or qui se pose tessère par tessère |
| Cités-États italiennes | Un compas d'architecte qui trace une coupole ; variante : une balance de changeur qui s'équilibre |
| Mésopotamie (culture) | Un calame qui imprime ses coins dans l'argile fraîche, signe après signe |
| Empire perse achéménide | Une colonne de Persépolis qui se dresse tambour par tambour (proche de `romanColumns`, à différencier par le chapiteau) |
| Phéniciens | Des lettres d'alphabet qui se propagent de port en port le long d'une côte |
| Empire ottoman | Un dôme qui se referme pierre par pierre ; variante : une tulipe iznik qui s'ouvre |
| Inde (culture) | Un geste de danse classique (mudra) esquissé en une ligne continue ; variantes : un rangoli qui se compose point par point, un drapé de sari qui se déploie |
| Empire mongol | Une yourte qui se monte en cercle ; variante : un arc qui se tend et se détend |
| Civilisation de l'Indus | Un sceau qui s'imprime dans l'argile et laisse son motif de taureau |
| Japon (culture) | Un torii qui se dessine en trait continu ; variantes : un éventail qui se déplie, une vague façon estampe qui déferle — à distinguer des pétales déjà employés côté Chine |
| Corée | Des caractères mobiles métalliques qui s'alignent dans un cadre d'imprimerie |
| Khmers (Angkor) | Un canal d'irrigation qui se remplit et encercle une tour |
| Nubie / Koush | Une pyramide méroïtique qui se dessine, visiblement plus effilée qu'une égyptienne |
| Grand Zimbabwe (culture) | Un mur de pierres sèches qui s'assemble bloc par bloc, sans mortier |
| Éthiopie / Aksoum | Une stèle monolithique qui se redresse lentement |
| Incas (culture) | Un cordon de quipu dont les nœuds se nouent un à un |
| Maya (culture) | Un glyphe qui se sculpte trait par trait ; variante : un nombre qui se compose en points et barres |
| Aztèques (culture) | Un motif de tissage ou de céramique qui se complète progressivement ; variantes : une pyramide à degrés qui se dessine, un éclat de jade qui scintille — distinct de la page mythologie aztèque |
| Peuples des Plaines | Un tipi qui se dresse, silhouettes de bisons passant au lointain |
| Polynésie (navigation) | Une pirogue double qui glisse, étoiles de navigation s'allumant au-dessus d'elle |
| Aborigènes d'Australie (culture) | Un motif de points qui se dessine progressivement ; variante : une songline tracée en pointillé lumineux — **traiter avec un soin particulier**, consulter des sources issues des communautés concernées avant de figer le motif |
| Al-Andalus | Une arcade d'arcs outrepassés qui se répète en profondeur, chaque arc s'allumant après le précédent (la forêt de colonnes de Cordoue) |
| Minoens (Crète) | Un taureau qui bondit et un acrobate qui le franchit, en frise continue |
| Carthage | Une flotte de points qui rayonne depuis un port, puis une ligne de sel qui efface le port |
| Côte swahilie | Une voile latine qui se gonfle et change de cap avec la mousson |
| Empire songhaï | Un manuscrit qui se referme et qu'une main emporte (l'exil des bibliothèques de Tombouctou) |
| Empire timouride | Une carte du ciel qui se constelle point par point (les tables d'Ulugh Beg) |

**Les 30 créatures à venir** — cette famille n'a pas de niveau générique utilisable (le
`glyphShower` repose sur des écritures culturelles, aucune des 6 pages créature existantes ne
l'emploie) : c'est sur-mesure, mais la plupart des pistes ci-dessous sont des **variantes
d'un effet déjà écrit**, donc peu coûteuses. La fonction réutilisable est indiquée entre
parenthèses.

| Page | Piste d'effet |
|---|---|
| Le Kraken | Un tentacule qui s'enroule depuis le bord de l'écran puis se retire dans l'eau |
| Les Sirènes | Une silhouette assise sur un rocher qui plonge, ne laissant que des ondes concentriques (variante `nessie`) |
| Le Loup-Garou | Une ombre humaine portée au sol qui s'allonge en silhouette de loup — la transformation par l'ombre seule, aucune violence |
| Black Shuck | Deux yeux rouges au ras du sol qui s'allument puis s'éloignent en tremblant (variante `eyes`) |
| Le Wendigo | Un souffle glacé et des branches qui craquent, **aucune silhouette montrée** — l'absence est l'effet (respect culturel, cf. principes de la série) |
| Le Skinwalker | Des traces au sol qui changent de forme d'un pas au suivant, rien d'autre — strictement abstrait, aucune figure (respect culturel) |
| Ogopogo | Une série d'arceaux qui percent la surface d'un lac puis disparaissent (variante `nessie`) |
| Le Jersey Devil | Une ombre ailée cornue qui traverse très vite (variante `mothmanShadow`) |
| Le Rougarou | Des yeux dans les roseaux d'un bayou + brume basse (`eyes` + `mistDrift`) |
| Créature de Loveland | Une silhouette accroupie sur un parapet, un plongeon, des ronds dans l'eau |
| Champ | Une vague en V qui traverse un lac calme, **sans créature visible** — l'ambiguïté de la photo Mansi comme effet |
| Bête de Bray Road | Deux phares de voiture qui éclairent une silhouette pendant une fraction de seconde |
| Nahuelito | Une silhouette sous la surface d'un lac andin, jamais nette (variante `nessie`, palette froide) |
| Le Kappa | L'écuelle d'eau posée sur une tête qui se renverse — ton léger, c'est un folklore vivant et joueur |
| L'Orang Pendek | La végétation qui s'écarte sur un passage, sans jamais montrer l'animal |
| Le Yeren | Des empreintes qui remontent un versant boisé (variante `bigfootTracks`, autre angle) |
| Le Popobawa | Une grande ombre ailée qui passe devant la lune (variante `mothmanShadow`) |
| Le Grootslang | Une trompe qui s'enroule et se prolonge en queue de serpent |
| Le Mngwa | Des yeux de félin qui s'allument dans les hautes herbes (variante `eyes`, palette ocre) |
| Le Yowie | Des empreintes dans la terre rouge (variante `bigfootTracks`, palette australienne) |
| Le Bunyip | Des bulles qui remontent d'un billabong puis s'arrêtent net |
| Mokèlé-mbembé | Des palmes de marais qui s'écartent sur un sillage, sans jamais rien montrer |
| Le Thunderbird | Un éclair qui, l'espace d'une image, dessine une envergure d'ailes |
| Le Golem de Prague | Un mot hébreu qui s'inscrit puis dont une lettre s'effrite (*emet* → *met*, « vérité » → « mort ») — le seul geste possible pour cette légende |
| La Tarasque | Un dragon de procession qui traverse l'écran en cahotant sur ses roues, ambiance de fête |
| Le Basilic | Un regard qui pétrifie : la végétation autour se fige en gris, puis reprend sa couleur |
| Le Mapinguari | Des griffures profondes qui apparaissent sur un tronc, une par une |
| Le Tatzelwurm | Une forme qui file entre deux pierres, trop vite pour être identifiée |
| La Llorona | Une silhouette blanche au bord de l'eau qui s'efface, et des ondes concentriques qui s'élargissent — **jamais de visage, jamais de cri**, la retenue est le sujet |
| L'Hombre Caimán | Un sillage qui descend un fleuve et se perd dans la mer (sa descente du Magdalena jusqu'à Bocas de Ceniza) |

**Les 27 mystères à venir** — même logique : décor ou geste simple sur `#enigme` ou
`#decouverte`.

| Page | Piste d'effet |
|---|---|
| La disparition d'Amelia Earhart | Un avion qui s'estompe dans un brouillard du Pacifique — sobre, aucune mise en scène de catastrophe |
| L'île de Pâques | Un moai qui se dresse en silhouette, très sobre |
| Le Mary Celeste | Un voilier immobile, voiles molles, aucune silhouette à bord |
| La Colonie de Roanoke | Le mot CROATOAN qui se grave lettre par lettre dans le bois (bon candidat `fx-decode`, avec un pool de lettres latines gravées) |
| Cité de Paititi / El Dorado | La canopée qui s'ouvre sur un reflet doré qui disparaît aussitôt |
| Le Suaire de Turin | Un tissu qui se déplie et dont l'empreinte apparaît en négatif — jamais un visage net, jamais de mise en scène dévotionnelle |
| Les Crop circles | Un cercle géométrique qui s'aplatit dans un champ en accéléré, une nuit résumée en trois secondes |
| L'Homme de Piltdown | Un crâne qui se fissure en deux moitiés qui s'écartent : le canular en un seul geste |
| Newgrange | Un rai de lumière qui progresse dans un couloir jusqu'à la chambre (variante directe de `solstice`) |
| L'Atlantide | Une colonne qui s'enfonce lentement dans l'eau — aucun cataclysme, aucune vague spectaculaire |
| Cité d'Héracléion | Une statue qui émerge de la vase sous le faisceau d'un plongeur |
| La Batterie de Bagdad | Une jarre en coupe, un fil de cuivre qui se pose, et **l'étincelle qui ne vient pas** |
| Malédiction de Toutânkhamon | Un titre de presse des années 1920 qui se compose puis se dissout |
| Le Grand Zimbabwe (mystère) | Un mur qui s'assemble bloc par bloc, puis une fausse étiquette explicative qui s'effrite (l'historiographie coloniale démentie) |
| Sanxingdui | Un masque de bronze aux yeux globuleux qui se lève lentement de sa fosse |
| Triangle du Dragon | Un tourbillon qui s'ouvre puis se referme (variante `bermudes`, palette Pacifique) |
| Les Pierres de Dropa | Un disque gravé qui tourne et dont les sillons ne veulent rien dire (variante `voynichScript`) |
| Dwarka engloutie | Un toit de temple qui apparaît sous le passage des vagues |
| Le Zodiac Killer | Une grille de cryptogramme dont quelques cases se remplissent puis s'arrêtent — strictement abstrait, aucune allusion aux victimes ni à l'auteur |
| Le Vol MH370 | Un point radar qui clignote, puis disparaît, puis rien — sobriété maximale, aucune reconstitution |
| Göbekli Tepe | Deux piliers en T qui se dressent, puis la terre qui remonte les ensevelir (le site a été enterré volontairement) |
| Le Disque de Phaistos | Des signes qui s'impriment en spirale du bord vers le centre, puis s'arrêtent sans rien livrer |
| Le Rongorongo | Des lignes de glyphes qui se gravent alternativement dans un sens puis dans l'autre (l'écriture en boustrophédon inversé, qui est un fait du corpus) |
| L'Explosion de la Toungouska | Une onde qui traverse l'écran et couche des troncs en éventail, sans flash ni explosion spectaculaire |
| Oak Island | Un puits qui se creuse couche après couche et se remplit d'eau à chaque fois |
| Le Somerton Man | Un bout de papier déchiré qui se pose, et rien d'autre — sobriété absolue, une mort réelle |
| Les Sphères du Costa Rica | Trois sphères qui roulent se ranger en ligne, puis une flèche qui les déplace hors du cadre (la perte du contexte archéologique) |

**Les 28 objets légendaires restants** (Excalibur, l'Arche d'Alliance, les Trois Trésors du
Japon, le Tabouret d'or des Ashanti, Mjöllnir, le Cheval de Troie, la Pierre du Soleil
aztèque, l'hameçon de Maui et le Koh-i-Noor sont publiés) — l'objet s'assemble, se forge ou
s'illumine. Section porteuse du `data-scroll-fx` : `#description` ou `#facture`.

| Page | Piste d'effet |
|---|---|
| Le Saint Graal | Un calice qui se remplit de lumière plutôt que de liquide, halo qui s'éteint doucement |
| L'Épée de Goujian | Une lame de bronze qui se dépatine, la corrosion reculant pour révéler l'inscription (bon candidat `fx-decode` en écriture-oiseau) |
| La Lance Sacrée | Un fer de lance qui se dédouble en quatre silhouettes superposées puis se recompose — les quatre reliques concurrentes en une image |
| La Chambre d'Ambre | Un panneau d'ambre qui se remplit tesson par tesson, puis dont les pièces s'éteignent une à une |
| Les épées Ulfberht | Une signature `+VLFBERH+T` qui s'inscrit dans la lame, la croix se déplaçant pour révéler une contrefaçon (`fx-decode` + décalage final) |
| La Toison d'Or | Une peau de mouton plongée dans un courant, dont les paillettes d'or s'accrochent une à une |
| La Boîte de Pandore | Une **jarre** qui s'entrouvre, laisse échapper des points sombres, et retient le dernier |
| La Pierre de Scone | Un bloc de pierre qui glisse d'un socle à un autre, aller-retour (1296 → 1996) |
| Durandal | Une lame qui s'enfonce **horizontalement** dans une paroi, éclats de roche |
| Zulfiqar | Une lame bifide qui s'illumine brièvement, strictement neutre, aucune mise en scène religieuse |
| La Ménorah | Sept flammes qui s'allument de gauche à droite, puis un relief de pierre qui les recouvre (l'arc de Titus) |
| Le Sceau de jade impérial | Un sceau qui s'imprime en rouge sur un document, puis dont l'empreinte s'efface |
| Le Honjo Masamune | Un katana qui rentre dans son fourreau et disparaît avec lui |
| Le Vajra | Un éclair qui se solidifie en sceptre à branches symétriques |
| La Couronne de fer | Un anneau intérieur qui s'illumine, puis dont la lueur retombe (l'analyse de 1993) |
| Joyeuse | Une épée qui se compose de pièces d'époques différentes, chacune arrivant séparément |
| L'Épée de Montesiepi | Une garde en croix qui émerge du sol circulaire, très lentement |
| Le Sampo | Un mécanisme qui s'assemble sans qu'on comprenne jamais ce qu'il fait — l'ambiguïté est l'effet |
| L'Anneau des Nibelungen | Un anneau qui roule sur la tranche puis tombe à plat dans un halo |
| La Table Ronde | Une table ronde vue de dessus dont les segments se peignent un à un |
| Le Trésor des Templiers | Un coffre qui s'ouvre sur du vide, refermé aussitôt |
| L'Anneau de Salomon | Une étoile à six branches qui se trace, puis des ombres qui se rangent en cercle autour |
| Le Ruyi Jingu Bang | Un bâton qui s'allonge démesurément hors de l'écran, puis revient à la taille d'une aiguille |
| Les regalia du Dahomey | Un trône qui traverse l'écran en caisse de transport, dans un sens puis dans l'autre (1892 → 2021) |
| Le trésor de Lobengula | Des perles qui roulent et se dispersent hors du cadre |
| Les crânes de cristal | Un crâne facetté dont les traces d'outil apparaissent en surbrillance sous un microscope |
| Le trésor de Moctezuma | Une barre d'or qui s'enfonce dans une eau trouble et disparaît |
| Le mere pounamu | Une massue de jade qui passe de main en main (silhouettes suggérées), s'assombrissant de patine à chaque passage |

## Contraintes à respecter pour tout nouvel effet

- Toujours passer par `layer()`/`glyphShower()` ou le même style d'API que les effets existants (durée de vie limitée, auto-nettoyage du DOM).
- Toujours tester que l'effet ne casse rien si déclenché plusieurs fois de suite rapidement (`busy` flag pour les easter eggs cliqués, `scrollFxLastPlayed` avec repos ~7s pour les happenings au scroll — ne pas descendre en dessous sans raison, c'est ce qui évite l'effet "gênant" en cas de va-et-vient).
- Un nouveau `data-scroll-fx` doit pointer vers une fonction déjà déclarée dans `SCROLL_FX` (`effects.js`) — en général la même fonction que l'easter egg de la page, réutilisée telle quelle.
- Rester sur des couleurs/formes qui se lisent bien par-dessus le contenu existant, jamais bloquant pour la lecture.
- Un seul fichier, `public/effects.js` — plus de copie miroir à resynchroniser depuis le 26/07/2026.
