# Plan Carte Interactive & Icônes

## État d'avancement

- ✅ `map.html` en ligne (fond `map.png`, zoom/pan, filtres). Les 16 pages existantes affichent maintenant leur vraie icône (plus de placeholder générique star/diamond/etc.), positions recalibrées à la main par inspection directe de `map.png` (zoom région par région, pas de formule géographique — la carte dessinée n'est pas une projection régulière, testé et invalidé sur le repère Gibraltar/Suez).
- ✅ **Mythologies** : 43 icônes (33 "à venir" + 10 pages déjà en ligne récupérées depuis `icon-sources/oubli/`), recadrées et normalisées (300×300px transparent), dans `public/icons/mythologie/myth-<slug>.png`.
- ✅ **Cultures** : 28 icônes (26 "à venir" + 2 déjà en ligne) dans `public/icons/culture/cult-<slug>.png`.
- ✅ **Créatures** : 27 icônes (25 "à venir" + 2 déjà en ligne) dans `public/icons/creature/crea-<slug>.png`.
- ✅ **Mystères** : 26 icônes (24 "à venir" + 2 déjà en ligne) dans `public/icons/mystere/myst-<slug>.png`.
- Toutes les planches (25) ont été découpées via un détecteur de blobs (seuillage de luminance + composantes connexes, tri en lecture ligne par ligne) plutôt qu'un découpage par grille rigide : plusieurs planches avaient un placement légèrement irrégulier (icônes à cheval sur une frontière de cellule, cadre dessiné autour de l'icône) qui cassait le découpage par grille simple. Une planche (`mystere/Amérique du Sud & Russie (3).png`) a des cadres carrés dessinés autour de chaque icône ; découpée à part en détectant les 4 bords du cadre puis en recadrant strictement à l'intérieur.
- Sources brutes (planches + découpes intermédiaires) conservées dans `icon-sources/<categorie>/decoupe/`.
- Reste à faire : écrire les pages HTML correspondant à ces icônes (elles n'existent pas encore, seules les icônes sont prêtes) et ajouter leurs entrées dans `map.html` au fur et à mesure.

**Pour la suite** : une fois une planche générée et déposée dans `docs/icon-sources/<categorie>/`, réutiliser le script de découpage par détection de blobs (voir historique de session) plutôt que le découpage par grille — plus robuste face aux irrégularités de placement des planches générées par IA.

## Objectif

Une page `map` avec un fond de carte du monde stylisé (illustration type carte au trésor ancienne, zoomable/déplaçable), sur laquelle chaque page du site apparaît comme une icône positionnée géographiquement. Filtrage par catégorie (Mythologies/Cultures/Créatures/Mystères), et densité gérée par zoom (badge groupé en vue large, icônes individuelles en vue rapprochée).

## Notes techniques sur le fond de carte (à partir de la première image de référence fournie)

- **Résolution** : une image plate se dégrade visuellement si on zoome fort dessus. Soit la générer en très haute résolution dès le départ, soit la traiter comme un **décor d'ambiance en vue large** pendant que le placement précis des icônes se fait via des coordonnées en **pourcentage (x%, y%) indépendantes du pixel art** — c'est ce qui permet un zoom propre sans dépendre de la netteté de l'image de fond.
- **Doublon visuel** : si la carte générée a, comme la référence fournie, ses propres créatures dessinées dessus (kraken, sirènes, serpents de mer en pleine mer), ça fera doublon avec nos icônes créatures posées par-dessus aux mêmes zones. Deux options : demander une carte "vierge" (juste les continents, sans faune illustrée) pour la génération IA, ou accepter le décor et **ne pas poser d'icônes créatures dans les zones océaniques déjà illustrées**, seulement sur les zones terrestres/côtières concernées.
- **Repères** : garder une boussole/rose des vents et un cadre orné (cohérent avec l'esthétique Cinzel/parchemin déjà utilisée partout sur le site) mais éviter tout texte gravé dans l'image elle-même (noms de pays, légendes) — ça doit rester en HTML/SVG par-dessus, pas cuit dans le bitmap, pour rester modifiable et accessible.

## Système catégorie / sous-catégorie

- **Catégorie (niveau 1)** = la série : Mythologies / Cultures / Créatures / Mystères → détermine la **couleur** du badge (filtre principal).
- **Sous-catégorie (niveau 2)** = la région géographique → détermine la **position/zone de zoom**, pas une couleur séparée (déjà encodée par la position sur la carte).

## Couleurs par catégorie

| Catégorie | Couleur dominante | Ton |
|---|---|---|
| 🟡 Mythologies | Or antique / ambre `#c9982f → #e8c164` | couleur dominante déjà du site |
| 🟢 Cultures | Vert jade `#2f9e6e → #3f7a5c` | |
| 🔴 Créatures | Rouge sombre / rouille `#9a3535 → #a3552a` | ton "enquête", pas criard |
| 🔵 Mystères | Bleu nuit / indigo `#1e3a6e → #2a2f42` | |

**Traitement graphique uniforme** : badge circulaire, anneau de couleur catégorie + fond clair (crème/parchemin) + pictogramme en silhouette monochrome sombre à l'intérieur. Jamais d'icône multicolore détaillée — illisible à petite taille.

**Gestion de la densité** (jusqu'à 10 icônes sur une même zone) :
1. Vue large → un seul badge par zone avec un chiffre (compte total).
2. Zoom rapproché → le badge éclate en icônes individuelles réparties en petit cercle/grille autour du point.
3. Le filtre par catégorie réduit le nombre d'icônes visibles avant même de zoomer.

---

## 🟡 MYTHOLOGIES — icônes

### Europe
| Page | Statut | Icône |
|---|---|---|
| Nordique | ✅ fait | Corbeau (silhouette noire) |
| Grecque | ✅ fait | Éclair |
| Romaine | ✅ fait | Aigle légionnaire |
| Celtique | ✅ fait | Triskèle / nœud celtique |
| Slave | ✅ fait | Oiseau de feu stylisé |
| Finnoise | icône prête | Cygne ou kantele (harpe) |
| Sami | icône prête | Tambour chamanique |
| Balte | icône prête | Soleil rayonnant |
| Basque | icône prête | Lauburu (croix à 4 têtes) |
| Géorgienne/caucasienne | icône prête | Chaîne brisée |
| Arménienne | icône prête | Grappe de raisin stylisée |
| Étrusque | icône prête | Masque/foie divinatoire |

### Méditerranée & Moyen-Orient
| Page | Statut | Icône |
|---|---|---|
| Égyptienne | ✅ fait | Œil d'Horus |
| Mésopotamienne | ✅ fait | Ziggourat |
| Perse/zoroastrienne | icône prête | Flamme sacrée |
| Cananéenne/ougaritique | icône prête | Taureau stylisé |
| Hittite | icône prête | Dragon enroulé (Illuyanka) |
| Arabe préislamique | icône prête | Croissant + étoile |

### Asie
| Page | Statut | Icône |
|---|---|---|
| Hindoue | ✅ fait | Lotus ouvert |
| Japonaise | ✅ fait | Torii |
| Aztèque & Maya | ✅ fait | Serpent à plumes (S ondulant) |
| Chinoise | icône prête | Dragon serpentin |
| Coréenne | icône prête | Ourse (Dangun) |
| Tibétaine/Bön | icône prête | Montagne sacrée |
| Mongole | icône prête | Loup gris ou ciel étoilé |
| Vietnamienne | icône prête | Œuf fendu |
| Turque/Asie centrale | icône prête | Loup gris (Asena) |
| Cosmologie bouddhiste | icône prête | Mont Meru (montagne à degrés) |

### Afrique
| Page | Statut | Icône |
|---|---|---|
| Yoruba | icône prête | Hache double (Shango) |
| Dogon | icône prête | Étoile Sirius |
| Ashanti/Akan | icône prête | Araignée (Anansi) |
| Zoulou | icône prête | Bouclier + lance |
| Éthiopienne | icône prête | Arche/couronne |

### Amériques
| Page | Statut | Icône |
|---|---|---|
| Inca | icône prête | Disque solaire (Inti) |
| Navajo/Diné | icône prête | Spirale à 4 mondes |
| Haudenosaunee | icône prête | Tortue |
| Lakota/Sioux | icône prête | Cercle sacré + plume |
| Pacifique Nord-Ouest | icône prête | Corbeau totémique |
| Taïno | icône prête | Visage zemi stylisé |

### Océanie & Arctique
| Page | Statut | Icône |
|---|---|---|
| Aborigène australienne | icône prête | Points concentriques (Temps du Rêve) |
| Polynésienne | icône prête | Hameçon de Maui |
| Mélanésienne | icône prête | Masque cérémoniel |
| Inuit | icône prête | Silhouette de baleine |

---

## 🟢 CULTURES — icônes

*(voir `suite_cultures.md` pour le détail des scores et sources)*

### Europe
| Page | Statut | Icône |
|---|---|---|
| Rome antique | icône prête | Casque + glaive |
| Grèce antique | icône prête | Amphore |
| Vikings/Scandinavie médiévale | icône prête | Drakkar (bateau viking) |
| Celtes (Gaule/Îles britanniques) | icône prête | Bouclier celtique/torque |
| Empire byzantin | icône prête | Aigle bicéphale |
| Cités-États italiennes | icône prête | Lion ailé (Venise) |

### Moyen-Orient & Méditerranée
| Page | Statut | Icône |
|---|---|---|
| Mésopotamie (culture) | icône prête | Tablette cunéiforme |
| Empire perse achéménide | icône prête | Colonne de Persépolis |
| Phéniciens | icône prête | Voilier + lettre d'alphabet |
| Empire ottoman | icône prête | Croissant + dôme |

### Asie
| Page | Statut | Icône |
|---|---|---|
| Chine | ✅ fait | Dragon/nuage stylisé |
| Inde (culture) | icône prête | Mudra (main stylisée) |
| Empire mongol | icône prête | Arc + flèche ou yourte |
| Civilisation de l'Indus | icône prête | Sceau à motif de taureau |
| Japon (culture) | icône prête | Éventail plié |
| Corée | icône prête | Toit de palais coréen |
| Khmers (Angkor) | icône prête | Tour d'Angkor Vat |

### Afrique
| Page | Statut | Icône |
|---|---|---|
| Égypte Antique | ✅ fait | Pyramide + soleil levant |
| Empire du Mali | icône prête | Pièce d'or / manuscrit (Tombouctou) |
| Nubie/Koush | icône prête | Pyramide méroïtique (fine et pointue) |
| Grand Zimbabwe (culture) | icône prête | Mur de pierre courbe — *voir note redondance ci-dessous* |
| Éthiopie/Aksoum | icône prête | Stèle/obélisque |

### Amériques
| Page | Statut | Icône |
|---|---|---|
| Incas (culture) | icône prête | Terrasse andine / Machu Picchu |
| Maya (culture) | icône prête | Glyphe maya stylisé |
| Aztèques (culture) | icône prête | Aigle sur cactus |
| Peuples des Plaines | icône prête | Tipi + bison |

### Océanie
| Page | Statut | Icône |
|---|---|---|
| Polynésie (navigation) | icône prête | Pirogue double |
| Aborigènes d'Australie (culture) | icône prête | Boomerang |

**Note redondance volontaire** : Grand Zimbabwe apparaît à la fois en Culture (le peuple qui l'a bâti) et en Mystère (la controverse coloniale sur qui l'a bâti) — c'est intentionnel, sur le même modèle que l'Égypte (mythologie + culture) : deux pages, deux angles, pas un doublon à corriger.

---

## 🔴 CRÉATURES — icônes

### Europe
| Page | Statut | Icône |
|---|---|---|
| Bête du Gévaudan | ✅ fait | Yeux ambrés dans le noir |
| Monstre du Loch Ness | ✅ fait | Silhouette émergeant de l'eau |
| Le Kraken | icône prête | Tentacule enroulé |
| Les Sirènes | icône prête | Silhouette mi-femme mi-poisson |
| Le Loup-Garou | icône prête | Silhouette de loup debout |
| Black Shuck | icône prête | Chien noir, yeux rouges |

### Amérique du Nord
| Page | Statut | Icône |
|---|---|---|
| Bigfoot | icône prête | Empreinte de pas géante |
| Le Mothman | icône prête | Silhouette ailée, yeux rouges |
| Le Wendigo | icône prête | Silhouette décharnée (sobre, respect culturel) |
| Le Skinwalker | icône prête | Symbole abstrait, pas de représentation frontale (respect culturel) |
| Ogopogo | icône prête | Silhouette de vague/serpent de lac |
| Le Jersey Devil | icône prête | Silhouette ailée cornue |
| Le Rougarou | icône prête | Variante loup-garou cajun |
| Créature de Loveland | icône prête | Silhouette de grenouille humanoïde |
| Champ | icône prête | Silhouette émergeant de l'eau (variante Nessie) |
| Bête de Bray Road | icône prête | Silhouette de loup-garou debout (variante) |

### Amérique latine
| Page | Statut | Icône |
|---|---|---|
| Le Chupacabra | icône prête | Yeux rouges, teinte désertique |
| Nahuelito | icône prête | Silhouette de vague/serpent de lac (variante Ogopogo) |

### Asie
| Page | Statut | Icône |
|---|---|---|
| Le Yeti | icône prête | Empreinte dans la neige |
| Le Kappa | icône prête | Carapace + bec stylisés |
| L'Orang Pendek | icône prête | Silhouette de primate accroupi |
| Le Yeren | icône prête | Silhouette de primate poilu debout |

### Afrique
| Page | Statut | Icône |
|---|---|---|
| Le Popobawa | icône prête | Silhouette ailée sombre |
| Le Grootslang | icône prête | Trompe + queue de serpent |
| Le Mngwa | icône prête | Silhouette de félin, yeux luisants |

### Océanie
| Page | Statut | Icône |
|---|---|---|
| Le Yowie | icône prête | Silhouette façon Bigfoot, teinte différente |
| Le Bunyip | icône prête | Silhouette aquatique composite |

---

## 🔵 MYSTÈRES — icônes

### Atlantique/Amériques
| Page | Statut | Icône |
|---|---|---|
| Triangle des Bermudes | ✅ fait | Boussole/triangle |
| Amelia Earhart | icône prête | Avion stylisé qui s'efface |
| Le Mary Celeste | icône prête | Voilier fantôme |
| Colonie de Roanoke | icône prête | Inscription stylisée |
| Cité de Paititi / El Dorado | icône prête | Masque/pièce d'or stylisé |

### Europe
| Page | Statut | Icône |
|---|---|---|
| Stonehenge | ✅ fait | Cercle de pierres |
| Manuscrit de Voynich | icône prête | Page/plume stylisée |
| Suaire de Turin | icône prête | Tissu drapé |
| Crop circles | icône prête | Cercle géométrique dans un champ |
| Homme de Piltdown | icône prête | Crâne fissuré |
| Newgrange | icône prête | Tumulus/spirale néolithique |

### Méditerranée & Afrique
| Page | Statut | Icône |
|---|---|---|
| Mécanisme d'Anticythère | icône prête | Engrenage |
| Atlantide | icône prête | Colonne engloutie |
| Cité d'Héracléion | icône prête | Statue engloutie |
| Batterie de Bagdad | icône prête | Jarre stylisée |
| Malédiction de Toutânkhamon | icône prête | Masque funéraire stylisé |
| Grand Zimbabwe (mystère) | icône prête | Mur de pierre courbe |

### Asie
| Page | Statut | Icône |
|---|---|---|
| Sanxingdui | icône prête | Masque de bronze aux yeux globuleux |
| Triangle du Dragon (Devil's Sea) | icône prête | Tourbillon/vague stylisée |
| Pierres de Dropa | icône prête | Disque gravé stylisé |
| Dwarka engloutie | icône prête | Temple englouti (vagues sur toit) |

### Amérique du Sud & Russie
| Page | Statut | Icône |
|---|---|---|
| Lignes de Nazca | icône prête | Colibri au trait |
| Île de Pâques | icône prête | Moaï stylisé |
| Col Dyatlov | icône prête | Tente/montagne, très sobre |

### Amérique du Nord (affaires réelles)
| Page | Statut | Icône |
|---|---|---|
| Zodiac Killer | icône prête | Sujet sensible, traiter avec sobriété |
| Vol MH370 | icône prête | Silhouette d'avion sur océan, sobre |

---

## Prochaines étapes

1. Génération de la carte de fond (IA) — vérifier absence de faune illustrée dans les zones océaniques (cf. note technique en tête de document), haute résolution.
2. Construire `map.html`/`map.astro` : fond de carte + calque SVG de positionnement (coordonnées % par page) + badges filtrable par catégorie.
3. Générer les pictogrammes listés ci-dessus (SVG simples, un seul trait/silhouette, cohérents en taille et en épaisseur de trait).
4. Brancher le système de zoom/cluster décrit dans "Gestion de la densité" ci-dessus.
