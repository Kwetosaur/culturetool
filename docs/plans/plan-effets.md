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

## Déjà fait (78 pages de contenu + l'accueil)

Les 11 premières pages mythologie combinent leur pluie de glyphes générique **et** une scène sur-mesure (au clic du titre **et** en happening au scroll sur `#pantheon`) — plus du niveau "minimum" décrit ci-dessus. Perse et Yoruba, les deux pages suivantes, n'ont que le déchiffrement des titres (minimum non négociable) et une scène sur-mesure, sans pluie de glyphes générique — un niveau tout aussi conforme, cf. règle de priorité plus bas.

Câblage vérifié le 26/07/2026 (voir `docs/audit-existant.md` § E) pour les 30 pages d'alors : les clefs `data-egg`, `data-scroll-fx` et `data-glyphs` correspondaient toutes à une entrée dans `EGGS`/`SCROLL_FX`/`GLYPH_POOLS`. Les pages ajoutées depuis suivent la même discipline, vérifiée à chaque intégration.

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
| Perse / zoroastrienne | `perse` | — | **sur-mesure** : une flamme vacille en clair-obscur, dualisme Ahura Mazda / Angra Mainyu | `#pantheon` |
| Yoruba | `yoruba` | — | **sur-mesure** : un collier de perles colorées s'assemble perle par perle | `#pantheon` |
| Incas (culture) | `incas` | — | **sur-mesure** : un cordon de quipu dont les nœuds se nouent un à un | `#style-de-vie` |
| Polynésie (navigation, culture) | `polynesie` | — | **sur-mesure** : une pirogue double glisse, des étoiles de navigation s'allument au-dessus | `#style-de-vie` |
| Le Kraken | `kraken` | — | **sur-mesure** : un tentacule s'enroule depuis le bord de l'écran puis se retire dans l'eau | `#portrait` |
| Le Kappa | `kappa` | — | **sur-mesure** : l'écuelle d'eau sur sa tête se renverse, ton léger | `#portrait` |
| Göbekli Tepe | `gobeklitepe` | — | **sur-mesure** : deux piliers en T se dressent, puis la terre remonte les ensevelir | `#enigme` |
| Le Saint Graal (objet) | `graal` | — | **sur-mesure** : un calice se remplit de lumière plutôt que de liquide, halo qui s'éteint doucement | `#description` |
| La disparition d'Amelia Earhart | `earhart` | — | **sur-mesure sobre** : un avion s'estompe dans un brouillard du Pacifique, aucune mise en scène de catastrophe | `#enigme` |
| La Lance Sacrée (objet) | `lance` | — | **sur-mesure** : un fer de lance se dédouble en quatre silhouettes superposées puis se recompose | `#description` |
| Inca (mythologie) | `viracocha` | — | **sur-mesure** : un disque solaire doré (Inti) tourne lentement | `#pantheon` |
| Aborigène australienne | `dreaming` | — | **sur-mesure sobre** : une songline tracée en pointillé lumineux à travers un paysage stylisé, glyphes abstraits non-représentatifs | `#pantheon` |
| Mésopotamie (culture) | `mesopotamie` | — | **sur-mesure** : un calame imprime des coins dans l'argile fraîche, signe après signe | `#style-de-vie` |
| Empire perse achéménide (culture) | `achemenide` | — | **sur-mesure** : une colonne de Persépolis se dresse tambour par tambour, chapiteau à taureaux distinct de `romanColumns` | `#style-de-vie` |
| Le Mary Celeste | `maryceleste` | — | **sur-mesure sobre** : un voilier immobile dérive, voiles molles, aucune silhouette à bord | `#enigme` |
| L'île de Pâques | `rapanui` | — | **sur-mesure sobre** : un moai se dresse en silhouette | `#enigme` |
| Mokèlé-mbembé | `mokele` | — | **sur-mesure** : des palmes de marais s'écartent sur un sillage, sans jamais rien montrer | `#portrait` |
| La Llorona | `llorona` | — | **sur-mesure sobre** : une silhouette blanche au bord de l'eau qui s'efface, ondes concentriques, jamais de visage | `#portrait` |
| La Chambre d'Ambre (objet) | `ambre` | — | **sur-mesure** : un panneau d'ambre se remplit tesson par tesson puis s'éteint pièce par pièce | `#description` |
| L'Épée de Goujian (objet) | `goujian` | — | **sur-mesure** : une lame de bronze se dépatine (clip-path + reveal), éclat de glint diagonal | `#description` |
| Dogon | `nommo` | — | **sur-mesure** : deux étoiles qui tournent l'une autour de l'autre, l'une minuscule (Sirius A et B) | `#pantheon` |
| Vietnamienne | `laclongquan` | — | **sur-mesure** : un œuf qui se fend en une centaine de points lumineux qui se dispersent | `#pantheon` |
| Empire byzantin (culture) | `byzance` | — | **sur-mesure** : une mosaïque à la feuille d'or qui se pose tessère par tessère | `#style-de-vie` |
| Khmers / Angkor (culture) | `khmers` | — | **sur-mesure** : un canal d'irrigation qui se remplit et encercle une tour | `#style-de-vie` |
| Le Golem de Prague | `golem` | — | **sur-mesure** : un mot hébreu s'inscrit puis une lettre s'effrite (emet → met) | `#portrait` |
| Le Yeren | `yeren` | — | **réutilise** `bigfootTracks` (empreintes en diagonale, autre angle) | `#portrait` |
| La Colonie perdue de Roanoke | `roanoke` | — | **sur-mesure** : le mot CROATOAN se grave lettre par lettre dans le bois | `#enigme` |
| Sanxingdui | `sanxingdui` | — | **sur-mesure** : un masque de bronze aux yeux globuleux qui se lève lentement de sa fosse | `#enigme` |
| Les épées Ulfberht (objet) | `ulfberht` | — | **sur-mesure** : une signature +VLFBERH+T qui s'inscrit puis se révèle contrefaçon | `#description` |
| Le Vajra (objet) | `vajra` | — | **sur-mesure** : un éclair qui se solidifie en sceptre à branches symétriques | `#description` |
| Finnoise (mythologie) | `vainamoinen` | — | **sur-mesure** : un œuf cosmique se fend en deux moitiés (ciel/terre) | `#pantheon` |
| Polynésienne (mythologie) | `mauihook` | — | **sur-mesure** : la nuit primordiale se déchire pour révéler la lumière (Te Ao Mārama) | `#pantheon` |
| Empire mongol (culture) | `mongol` | — | **sur-mesure** : une yourte qui se monte en cercle, treillis puis toit | `#style-de-vie` |
| Inde (culture) | `inde` | — | **sur-mesure** : un mudrā (geste rituel de la main) qui se forme | `#style-de-vie` |
| La Tarasque | `tarasque` | — | **sur-mesure** : un dragon de procession qui traverse l'écran en cahotant sur ses roues | `#culture-populaire` |
| Le Thunderbird | `thunderbird` | — | **sur-mesure sobre** : un éclair suivi d'une silhouette d'ailes déployées | `#portrait` |
| Le Suaire de Turin | `suaire` | — | **sur-mesure sobre** : un tissu qui se déplie, empreinte en négatif suggérée, jamais un visage net | `#enigme` |
| Le Paititi | `paititi` | — | **sur-mesure** : une canopée qui s'assombrit autour d'un point de lumière dorée | `#enigme` |
| La Toison d'Or (objet) | `toisonor` | — | **sur-mesure** : une toison qui scintille d'un éclat doré | `#description` |
| La Boîte de Pandore (objet) | `pandore` | — | **sur-mesure sobre** : une jarre dont le couvercle se soulève doucement | `#description` |
| Cananéenne / ougaritique | `cananeen` | — | **sur-mesure** : les cornes d'un taureau qui s'illuminent sous un orage bref (Baal) | `#pantheon` |
| Nubie / Koush (culture) | `nubie` | — | **sur-mesure** : une pyramide méroïtique qui se dessine, visiblement plus effilée qu'une égyptienne | `#style-de-vie` |
| Le Loup-Garou | `loupgarou` | — | **sur-mesure** : une ombre humaine portée au sol qui s'allonge en silhouette de loup, aucune violence montrée | `#portrait` |
| Le Disque de Phaistos | `phaistos` | — | **sur-mesure** : des signes qui s'impriment en spirale du bord vers le centre, puis s'arrêtent sans rien livrer | `#enigme` |
| Durandal (objet) | `durandal` | — | **sur-mesure** : une lame qui s'enfonce horizontalement dans une paroi, éclats de roche | `#description` |
| Ashanti / Akan | `ashanti` | — | **sur-mesure** : une toile d'araignée qui se tisse fil par fil (Anansi) | `#pantheon` |
| Al-Andalus (culture) | `andalus` | — | **sur-mesure** : une arcade d'arcs outrepassés qui s'allume arc après arc (forêt de colonnes de Cordoue) | `#style-de-vie` |
| Les Sirènes | `sirenes` | — | **sur-mesure** : une silhouette sur un rocher qui plonge, ondes concentriques | `#portrait` |
| L'Explosion de la Toungouska | `toungouska` | — | **sur-mesure** : une onde qui couche des troncs en éventail, sans flash spectaculaire | `#enigme` |
| Le Sceau de jade impérial (objet) | `sceaujade` | — | **sur-mesure** : un sceau qui s'imprime en rouge puis dont l'empreinte s'efface | `#description` |
| Coréenne | `coreenne` | — | **sur-mesure sobre** : une silhouette d'ourse qui devient femme par fondu très progressif (Dangun) | `#pantheon` |
| Maya (culture) | `maya` | — | **sur-mesure** : un nombre qui se compose en points et barres (numération maya) | `#style-de-vie` |
| Ogopogo | `ogopogo` | — | **sur-mesure** : des arceaux qui percent la surface d'un lac puis disparaissent | `#portrait` |
| Le Somerton Man | `somerton` | — | **sur-mesure sobre** : un bout de papier déchiré qui se pose, et rien d'autre | `#enigme` |
| La Ménorah du Second Temple (objet) | `menorah` | — | **sur-mesure** : sept flammes qui s'allument puis un relief de pierre les recouvre | `#description` |
| Cosmologie bouddhiste | `bouddhiste` | — | **sur-mesure** : le mont Meru qui s'élève strate par strate en cercles concentriques | `#pantheon` |
| Phéniciens (culture) | `pheniciens` | — | **sur-mesure** : des lettres d'alphabet qui se propagent de port en port | `#style-de-vie` |
| Black Shuck | `blackshuck` | — | **sur-mesure** : deux yeux rouges qui s'allument puis s'éloignent en tremblant | `#portrait` |
| Malédiction de Toutânkhamon | `toutankhamon` | — | **sur-mesure** : un titre de presse des années 1920 qui se compose puis se dissout | `#enigme` |
| Zulfiqar (objet) | `zulfiqar` | — | **sur-mesure sobre** : une lame bifide qui s'illumine brièvement, neutre | `#description` |
| Tibétaine / Bön | `tibetaine` | — | **sur-mesure** : des drapeaux de prière qui claquent en chaîne, montagne sortie de la brume | `#pantheon` |
| Hittite | `hittite` | — | **sur-mesure** : un serpent-dragon qui s'enroule puis se dénoue et s'efface (Illuyanka) | `#pantheon` |
| Empire ottoman | `ottoman` | — | **sur-mesure** : un dôme qui se referme pierre par pierre | `#style-de-vie` |
| Grand Zimbabwe (culture) | `zimbabwe` | — | **sur-mesure** : un mur de pierres sèches qui s'assemble bloc par bloc, sans mortier | `#style-de-vie` |
| Le Jersey Devil | `jerseydevil` | — | **sur-mesure** : une ombre ailée cornue qui traverse très vite | `#portrait` |
| Champ | `champ` | — | **sur-mesure** : une vague en V qui traverse un lac calme, sans créature visible | `#portrait` |
| Grand Zimbabwe (mystère) | `zimbabwemystere` | — | **sur-mesure** : un mur qui s'assemble bloc par bloc, puis une fausse étiquette explicative qui s'effrite | `#enigme` |
| Newgrange | `newgrange` | — | **sur-mesure** : un rai de lumière qui progresse dans un couloir jusqu'à la chambre | `#enigme` |
| La Pierre de Scone (objet) | `pierrescone` | — | **sur-mesure** : un bloc de pierre qui glisse d'un socle à un autre, aller-retour | `#description` |
| Le Honjo Masamune (objet) | `honjo` | — | **sur-mesure** : un katana qui rentre dans son fourreau et disparaît avec lui | `#description` |
| Accueil | `accueil` | mélange de glyphes de toutes les cultures | — | — |

## Stratégie par famille de page

Chaque série a sa propre logique d'effet dominant (en plus du décor commun ci-dessus) — c'est le principe à suivre pour toute nouvelle page :

- **Mythologies** → déchiffrement des titres de section (mécanisme 3, obligatoire et "simple" — voir plus bas) **+**, quand le temps le permet, une scène sur-mesure rejouée au clic du titre et en happening sur `#pantheon` (mécanisme 4). Les 25 pages existantes ont les deux niveaux. Pour une nouvelle mythologie : le déchiffrement des titres reste le minimum non négociable ; la scène sur-mesure est un bonus, jamais un blocage pour livrer. Perse et Yoruba (`perse`/`cunei`, `yoruba`/`yoruba`) sont les deux premières mythologies écrites avec le socle Astro — voir `docs/plans/plan-industrialisation.md`. Inca (`viracocha`, disque solaire d'Inti) et Aborigène australienne (`dreaming`, songline en pointillé, glyphes abstraits non-représentatifs par prudence culturelle) suivent le même socle. Dogon (`nommo`, orbite de Sirius A/B, glyphs abstraits `dogon`) et Vietnamienne (`laclongquan`, œuf qui se fend, réutilise le pool `chine`) aussi. Finnoise (`vainamoinen`, œuf cosmique qui se fend, pool `kalevala` explicitement non-runique — les chants du Kalevala n'ont rien à voir avec l'alphabet runique germanique) et Polynésienne (`mauihook`, nuit primordiale déchirée par la lumière, pool `polynesienne` abstrait par prudence, le rongorongo de l'île de Pâques restant réservé à sa propre page mystère) complètent la série au 29/07/2026. Cananéenne / ougaritique (`cananeen`, cornes de taureau qui s'illuminent sous un orage bref, pool `ougaritique` — l'alphabet cunéiforme réel de Ras Shamra, distinct du pool `cunei` mésopotamien déjà utilisé), Ashanti / Akan (`ashanti`, toile d'araignée tissée fil par fil, pool décoratif `akan`), Coréenne (`coreenne`, silhouette d'ourse qui devient femme par fondu très progressif, sobre, pool décoratif `coreen`), Cosmologie bouddhiste (`bouddhiste`, mont Meru qui s'élève strate par strate, pool `bouddhiste` — roue du dharma, hiérarchie en 3 sphères plutôt qu'une filiation de sang, écart assumé), Tibétaine / Bön (`tibetaine`, drapeaux de prière qui claquent en chaîne révélant une montagne, pool décoratif `tibetain`) et Hittite (`hittite`, serpent-dragon Illuyanka qui s'enroule puis se dénoue, pool `hittite` réutilisant le cunéiforme mésopotamien — écriture réellement empruntée par les Hittites) prolongent la série au 07/08/2026.
- **Créatures** → "happenings" au scroll (mécanisme 4) qui rejouent l'effet sur-mesure de la créature (pas seulement au clic du titre) sur une section clé — typiquement `#portrait` ou `#temoins-recits`. Déjà fait : Gévaudan (`eyes`, sur `#portrait`), Loch Ness (`nessie`, sur `#portrait`), Bigfoot (`bigfootTracks`, empreintes en diagonale, sur `#portrait`), Yeti (`yetiBlizzard`, blizzard + silhouette floue, sur `#portrait`), Chupacabra (`chupacabraEyes`, yeux rouges désertiques + ombre bondissante, sur `#portrait`), Mothman (`mothmanShadow`, ombre ailée + halo, sur `#portrait`), Kraken (`krakenTentacle`, tentacule qui se retire dans l'eau, sur `#portrait`), Kappa (`kappaDish`, écuelle qui se renverse, ton léger, sur `#portrait`), Mokèlé-mbembé (`swampParting`, palmes qui s'écartent sans jamais rien montrer, sur `#portrait`), La Llorona (`lloronaSilhouette`, silhouette blanche qui s'efface, ton retenu, sur `#portrait`), le Golem de Prague (`golemEmetMet`, mot hébreu qui perd une lettre, sur `#portrait`), le Yeren (réutilise `bigfootTracks`, sur `#portrait`), la Tarasque (`tarasqueProcession`, dragon de procession sur roues, sur `#culture-populaire` — exception à la section porteuse habituelle, le sujet précis étant la fête elle-même), le Thunderbird (`thunderbirdEclair`, éclair puis silhouette d'ailes, sur `#portrait`, sans représentation figurative appropriant un style visuel autochtone précis), le Loup-Garou (`ombreLoupGarou`, ombre humaine qui s'allonge en silhouette de loup, aucune violence montrée, sur `#portrait`), Les Sirènes (`sireneRocher`, silhouette sur un rocher qui plonge en laissant des ondes concentriques, sur `#portrait`), Ogopogo (`ogopogoArceaux`, arceaux qui percent la surface d'un lac puis disparaissent, sur `#portrait`), Black Shuck (`blackShuckYeux`, yeux rouges qui s'allument puis s'éloignent en tremblant, sur `#portrait`), le Jersey Devil (`jerseyDevilOmbre`, ombre ailée cornue qui traverse très vite, sur `#portrait`), Champ (`champVague`, vague en V qui traverse un lac calme sans créature visible, sur `#portrait`).
- **Mystères** → décors ou effets simples au scroll, même mécanisme 4, sur une section clé — typiquement `#enigme` ou `#decouverte`. Déjà fait : Triangle des Bermudes (`bermudes`, sur `#enigme`), Stonehenge (`solstice`, sur `#enigme`), Col Dyatlov (`dyatlov`, flocons sobres, sur `#enigme`), Manuscrit de Voynich (`voynichScript`, glyphes inventés, sur `#enigme`), Lignes de Nazca (`nazcaLines`, géoglyphe qui se dessine, sur `#enigme`), Mécanisme d'Anticythère (`antikytheraGears`, engrenages qui s'assemblent, sur `#enigme`), Göbekli Tepe (`gobekliPiliers`, piliers ensevelis, sur `#enigme`), Amelia Earhart (`earhartFade`, avion qui s'estompe dans le brouillard, sur `#enigme`), Le Mary Celeste (`maryCelesteDrift`, voilier immobile aux voiles molles, sur `#enigme`), L'île de Pâques (`moaiSilhouette`, moai sobre en silhouette, sur `#enigme`), la Colonie de Roanoke (`croatoanCarve`, mot gravé lettre par lettre, sur `#enigme`), Sanxingdui (`masqueBronzeLeve`, masque qui se lève de sa fosse, sur `#enigme`), le Suaire de Turin (`suaireDeplie`, tissu qui se déplie sans jamais révéler de visage net, sur `#enigme`), le Paititi (`canopeeDoree`, canopée assombrie autour d'une lumière dorée, sur `#enigme`), le Disque de Phaistos (`phaistosSpirale`, signes qui s'impriment en spirale du bord vers le centre puis s'arrêtent sans rien livrer, sur `#enigme`), l'Explosion de la Toungouska (`toungouskaOnde`, onde qui couche des troncs en éventail sans flash spectaculaire, sur `#enigme`), le Somerton Man (`somertonPapier`, bout de papier déchiré qui se pose et rien d'autre, sobriété absolue, sur `#enigme`), la Malédiction de Toutânkhamon (`toutankhamonTitre`, titre de presse des années 1920 qui se compose puis se dissout, sur `#enigme`), le Grand Zimbabwe mystère (`zimbabweEtiquette`, mur qui s'assemble puis fausse étiquette qui s'effrite, sur `#enigme`), Newgrange (`newgrangeRai`, rai de lumière qui progresse dans un couloir jusqu'à la chambre, sur `#enigme`).
- **Cultures** → effets qui jouent sur un élément matériel/iconique de la culture (danse, soie, poterie...) plutôt que sur des glyphes abstraits. Déjà fait : Chine (`silk`, ruban de soie qui ondule, sur `#style-de-vie`), Égypte Antique (réutilise `sunrise`, sur `#style-de-vie`), Rome antique (`romanColumns`, colonnes qui se révèlent, sur `#style-de-vie`), Grèce antique (`greekMaskFlip`, masque comédie/tragédie, sur `#style-de-vie`), Vikings (`vikingLonghship`, drakkar qui traverse l'écran, sur `#style-de-vie`), Incas (`incaQuipu`, nœuds de quipu, sur `#style-de-vie`), Polynésie (`pirogueDouble`, pirogue et étoiles, sur `#style-de-vie`), Mésopotamie (`calameArgile`, calame qui imprime l'argile, sur `#style-de-vie`), Empire perse achéménide (`persepolisColumn`, colonne tambour par tambour, sur `#style-de-vie`), Empire byzantin (`mosaiqueOr`, mosaïque tessère par tessère, sur `#style-de-vie`), Khmers (`canalAngkor`, canal qui encercle une tour, sur `#style-de-vie`), Empire mongol (`yourteMontage`, yourte qui se monte en cercle, sur `#style-de-vie`), Inde (`mudraGeste`, mudrā qui se forme, sur `#style-de-vie`), Nubie / Koush (`pyramideMeroe`, pyramide méroïtique qui se dessine, visiblement plus effilée qu'une égyptienne, sur `#style-de-vie`), Al-Andalus (`arcadeCordoue`, arcade d'arcs outrepassés qui s'allument un à un, sur `#style-de-vie`), Maya (culture) (`mayaNombre`, nombre qui se compose en points et barres, sur `#style-de-vie`), Phéniciens (`alphabetPropagation`, lettres d'alphabet qui se propagent de port en port, sur `#style-de-vie`), Empire ottoman (`domeIznik`, dôme qui se referme pierre par pierre, sur `#style-de-vie`), Grand Zimbabwe culture (`murZimbabwe`, mur de pierres sèches qui s'assemble bloc par bloc, sur `#style-de-vie`).
- **Objets légendaires** (5e famille, créée le 26/07/2026) → **l'objet lui-même s'assemble, se forge ou s'illumine**. Ni glyphes abstraits, ni créature qui traverse, ni décor d'ambiance : une chose fabriquée qui se construit sous les yeux du lecteur. Le précédent existe et fonctionne : `antikytheraGears` (engrenages qui s'assemblent puis tournent) est exactement le patron à suivre. Section porteuse du `data-scroll-fx` : **`#description`** (là où l'objet est décrit) ou **`#facture`** (la section forge/matière). Le déchiffrement d'inscription (mécanisme 3) est autorisé sur cette famille, voir l'arbitrage plus haut. La Chambre d'Ambre (`ambreMosaique`, panneau qui se remplit tesson par tesson, sur `#description`) et l'Épée de Goujian (`goujianDepatine`, dépatine par `clip-path` + glint, sur `#description`, réutilise le pool `chine` pour l'inscription) suivent le même patron. Les épées Ulfberht (`ulfberhtSignature`, signature qui se révèle contrefaçon, sur `#description`, réutilise le pool `lapidaire`) et le Vajra (`vajraSolidify`, éclair qui se solidifie en sceptre, sur `#description`, sans inscription) aussi. La Toison d'Or (`toisonOrEclat`, toison qui scintille d'un éclat doré, sur `#description`) et la Boîte de Pandore (`jarrePandore`, jarre dont le couvercle se soulève doucement, sur `#description`) complètent le tableau au 29/07/2026. Durandal (`durandalParoi`, lame qui s'enfonce horizontalement dans une paroi rocheuse, éclats de roche, sur `#description`, angle volontairement différent d'Excalibur), le Sceau de jade impérial (`sceauJadeEmpreinte`, sceau qui s'imprime en rouge puis dont l'empreinte s'efface, sur `#description`), la Ménorah du Second Temple (`menorahFlammes`, sept flammes qui s'allument puis un relief de pierre les recouvre, sur `#description`), Zulfiqar (`zulfiqarLame`, lame bifide qui s'illumine brièvement, strictement neutre, sur `#description`), la Pierre de Scone (`pierreSconeGlisse`, bloc de pierre qui glisse d'un socle à un autre, sur `#description`) et le Honjo Masamune (`honjoFourreau`, katana qui rentre dans son fourreau et disparaît avec lui, sur `#description`) prolongent la série au 07/08/2026.

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

Perse, Yoruba, Inca et Aborigène australienne — les priorités précédentes — sont désormais
toutes publiées. Voir `docs/listes/suite_mythologies.md` pour le nouveau top 5 recommandé.

**Les 26 mythologies à venir** — une piste par page. Le déchiffrement des titres
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
| Arabe préislamique | Un croissant et son étoile qui se lèvent au-dessus d'une caravane en ombres |
| Mongole | Le ciel nocturne qui s'ouvre en étoiles (Tengri), silhouette de loup au lointain |
| Turque / Asie centrale | Les yeux d'une louve grise qui s'allument dans la steppe (variante de `eyes`, palette froide) |
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

**Les 16 cultures à venir** (Incas, Polynésie, Mésopotamie, l'Empire perse achéménide,
l'Empire byzantin et les Khmers sont publiées) — jouer sur un objet ou un geste matériel
reconnaissable de la culture, jamais sur des glyphes abstraits.

| Page | Piste d'effet |
|---|---|
| Celtes (Gaule / Îles britanniques) | Un torque d'or qui se torsade brin par brin |
| Cités-États italiennes | Un compas d'architecte qui trace une coupole ; variante : une balance de changeur qui s'équilibre |
| Inde (culture) | Un geste de danse classique (mudra) esquissé en une ligne continue ; variantes : un rangoli qui se compose point par point, un drapé de sari qui se déploie |
| Empire mongol | Une yourte qui se monte en cercle ; variante : un arc qui se tend et se détend |
| Civilisation de l'Indus | Un sceau qui s'imprime dans l'argile et laisse son motif de taureau |
| Japon (culture) | Un torii qui se dessine en trait continu ; variantes : un éventail qui se déplie, une vague façon estampe qui déferle — à distinguer des pétales déjà employés côté Chine |
| Corée | Des caractères mobiles métalliques qui s'alignent dans un cadre d'imprimerie |
| Éthiopie / Aksoum | Une stèle monolithique qui se redresse lentement |
| Aztèques (culture) | Un motif de tissage ou de céramique qui se complète progressivement ; variantes : une pyramide à degrés qui se dessine, un éclat de jade qui scintille — distinct de la page mythologie aztèque |
| Peuples des Plaines | Un tipi qui se dresse, silhouettes de bisons passant au lointain |
| Aborigènes d'Australie (culture) | Un motif de points qui se dessine progressivement ; variante : une songline tracée en pointillé lumineux — **traiter avec un soin particulier**, consulter des sources issues des communautés concernées avant de figer le motif |
| Minoens (Crète) | Un taureau qui bondit et un acrobate qui le franchit, en frise continue |
| Carthage | Une flotte de points qui rayonne depuis un port, puis une ligne de sel qui efface le port |
| Côte swahilie | Une voile latine qui se gonfle et change de cap avec la mousson |
| Empire songhaï | Un manuscrit qui se referme et qu'une main emporte (l'exil des bibliothèques de Tombouctou) |
| Empire timouride | Une carte du ciel qui se constelle point par point (les tables d'Ulugh Beg) |

**Les 18 créatures à venir** (Le Kraken, Le Kappa, Mokèlé-mbembé, La Llorona, le Golem de
Prague et le Yeren sont publiés) — cette famille n'a pas de
niveau générique utilisable (le `glyphShower` repose sur des écritures culturelles, aucune
page créature ne l'emploie) : c'est sur-mesure, mais la plupart des pistes ci-dessous sont
des **variantes d'un effet déjà écrit**, donc peu coûteuses. La fonction réutilisable est
indiquée entre parenthèses.

| Page | Piste d'effet |
|---|---|
| Le Wendigo | Un souffle glacé et des branches qui craquent, **aucune silhouette montrée** — l'absence est l'effet (respect culturel, cf. principes de la série) |
| Le Skinwalker | Des traces au sol qui changent de forme d'un pas au suivant, rien d'autre — strictement abstrait, aucune figure (respect culturel) |
| Le Rougarou | Des yeux dans les roseaux d'un bayou + brume basse (`eyes` + `mistDrift`) |
| Créature de Loveland | Une silhouette accroupie sur un parapet, un plongeon, des ronds dans l'eau |
| Bête de Bray Road | Deux phares de voiture qui éclairent une silhouette pendant une fraction de seconde |
| Nahuelito | Une silhouette sous la surface d'un lac andin, jamais nette (variante `nessie`, palette froide) |
| L'Orang Pendek | La végétation qui s'écarte sur un passage, sans jamais montrer l'animal |
| Le Popobawa | Une grande ombre ailée qui passe devant la lune (variante `mothmanShadow`) |
| Le Grootslang | Une trompe qui s'enroule et se prolonge en queue de serpent |
| Le Mngwa | Des yeux de félin qui s'allument dans les hautes herbes (variante `eyes`, palette ocre) |
| Le Yowie | Des empreintes dans la terre rouge (variante `bigfootTracks`, palette australienne) |
| Le Bunyip | Des bulles qui remontent d'un billabong puis s'arrêtent net |
| Le Thunderbird | Un éclair qui, l'espace d'une image, dessine une envergure d'ailes |
| La Tarasque | Un dragon de procession qui traverse l'écran en cahotant sur ses roues, ambiance de fête |
| Le Basilic | Un regard qui pétrifie : la végétation autour se fige en gris, puis reprend sa couleur |
| Le Mapinguari | Des griffures profondes qui apparaissent sur un tronc, une par une |
| Le Tatzelwurm | Une forme qui file entre deux pierres, trop vite pour être identifiée |
| L'Hombre Caimán | Un sillage qui descend un fleuve et se perd dans la mer (sa descente du Magdalena jusqu'à Bocas de Ceniza) |

**Les 15 mystères à venir** (Göbekli Tepe, la disparition d'Amelia Earhart, Le Mary Celeste,
l'île de Pâques, la Colonie de Roanoke et Sanxingdui sont publiés) — même logique : décor ou
geste simple sur `#enigme` ou `#decouverte`.

| Page | Piste d'effet |
|---|---|
| Cité de Paititi / El Dorado | La canopée qui s'ouvre sur un reflet doré qui disparaît aussitôt |
| Le Suaire de Turin | Un tissu qui se déplie et dont l'empreinte apparaît en négatif — jamais un visage net, jamais de mise en scène dévotionnelle |
| Les Crop circles | Un cercle géométrique qui s'aplatit dans un champ en accéléré, une nuit résumée en trois secondes |
| L'Homme de Piltdown | Un crâne qui se fissure en deux moitiés qui s'écartent : le canular en un seul geste |
| L'Atlantide | Une colonne qui s'enfonce lentement dans l'eau — aucun cataclysme, aucune vague spectaculaire |
| Cité d'Héracléion | Une statue qui émerge de la vase sous le faisceau d'un plongeur |
| La Batterie de Bagdad | Une jarre en coupe, un fil de cuivre qui se pose, et **l'étincelle qui ne vient pas** |
| Triangle du Dragon | Un tourbillon qui s'ouvre puis se referme (variante `bermudes`, palette Pacifique) |
| Les Pierres de Dropa | Un disque gravé qui tourne et dont les sillons ne veulent rien dire (variante `voynichScript`) |
| Dwarka engloutie | Un toit de temple qui apparaît sous le passage des vagues |
| Le Zodiac Killer | Une grille de cryptogramme dont quelques cases se remplissent puis s'arrêtent — strictement abstrait, aucune allusion aux victimes ni à l'auteur |
| Le Vol MH370 | Un point radar qui clignote, puis disparaît, puis rien — sobriété maximale, aucune reconstitution |
| Le Rongorongo | Des lignes de glyphes qui se gravent alternativement dans un sens puis dans l'autre (l'écriture en boustrophédon inversé, qui est un fait du corpus) |
| Oak Island | Un puits qui se creuse couche après couche et se remplit d'eau à chaque fois |
| Les Sphères du Costa Rica | Trois sphères qui roulent se ranger en ligne, puis une flèche qui les déplace hors du cadre (la perte du contexte archéologique) |

**Les 16 objets légendaires restants** (Excalibur, l'Arche d'Alliance, les Trois Trésors du
Japon, le Tabouret d'or des Ashanti, Mjöllnir, le Cheval de Troie, la Pierre du Soleil
aztèque, l'hameçon de Maui, le Koh-i-Noor, le Saint Graal, la Lance Sacrée, la Chambre
d'Ambre, l'Épée de Goujian, les épées Ulfberht et le Vajra sont publiés) — l'objet
s'assemble, se forge ou s'illumine. Section porteuse du `data-scroll-fx` : `#description` ou
`#facture`.

| Page | Piste d'effet |
|---|---|
| La Toison d'Or | Une peau de mouton plongée dans un courant, dont les paillettes d'or s'accrochent une à une |
| La Boîte de Pandore | Une **jarre** qui s'entrouvre, laisse échapper des points sombres, et retient le dernier |
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
