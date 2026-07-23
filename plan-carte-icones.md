# Plan Carte Interactive & Icônes

## État d'avancement

- ✅ `map.html` en ligne (fond `map.png`, zoom/pan, filtres, 16 pages existantes positionnées avec icône placeholder générique).
- ✅ `icon full/prompts-planches-icones.md` : prompts de génération IA prêts pour toutes les icônes "à venir" (108 icônes, 25 planches), groupés par catégorie/région comme ce document.
- ✅ **Mythologies** : les 6 planches région ont été générées et découpées. 33 icônes individuelles, recadrées et normalisées (300×300px), disponibles dans `public/icons/mythologie/myth-<slug>.png` (ex. `myth-finnoise.png`, `myth-chinoise.png`...). Sources brutes (planches + découpes intermédiaires) conservées dans `icon full/mythologie/`.
- ⏳ Cultures, Créatures, Mystères : prompts prêts dans `prompts-planches-icones.md`, planches pas encore générées.

**Pour la suite** : une fois une planche générée et déposée dans `icon full/<categorie>/`, le découpage est mécanique (grille régulière, un slug par cellule dans l'ordre du prompt) — même méthode que pour les mythologies, à reproduire pour chaque nouvelle planche plutôt qu'à réinventer.

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
| Finnoise | à venir | Cygne ou kantele (harpe) |
| Sami | à venir | Tambour chamanique |
| Balte | à venir | Soleil rayonnant |
| Basque | à venir | Lauburu (croix à 4 têtes) |
| Géorgienne/caucasienne | à venir | Chaîne brisée |
| Arménienne | à venir | Grappe de raisin stylisée |
| Étrusque | à venir | Masque/foie divinatoire |

### Méditerranée & Moyen-Orient
| Page | Statut | Icône |
|---|---|---|
| Égyptienne | ✅ fait | Œil d'Horus |
| Mésopotamienne | ✅ fait | Ziggourat |
| Perse/zoroastrienne | à venir | Flamme sacrée |
| Cananéenne/ougaritique | à venir | Taureau stylisé |
| Hittite | à venir | Dragon enroulé (Illuyanka) |
| Arabe préislamique | à venir | Croissant + étoile |

### Asie
| Page | Statut | Icône |
|---|---|---|
| Hindoue | ✅ fait | Lotus ouvert |
| Japonaise | ✅ fait | Torii |
| Aztèque & Maya | ✅ fait | Serpent à plumes (S ondulant) |
| Chinoise | à venir | Dragon serpentin |
| Coréenne | à venir | Ourse (Dangun) |
| Tibétaine/Bön | à venir | Montagne sacrée |
| Mongole | à venir | Loup gris ou ciel étoilé |
| Vietnamienne | à venir | Œuf fendu |
| Turque/Asie centrale | à venir | Loup gris (Asena) |
| Cosmologie bouddhiste | à venir | Mont Meru (montagne à degrés) |

### Afrique
| Page | Statut | Icône |
|---|---|---|
| Yoruba | à venir | Hache double (Shango) |
| Dogon | à venir | Étoile Sirius |
| Ashanti/Akan | à venir | Araignée (Anansi) |
| Zoulou | à venir | Bouclier + lance |
| Éthiopienne | à venir | Arche/couronne |

### Amériques
| Page | Statut | Icône |
|---|---|---|
| Inca | à venir | Disque solaire (Inti) |
| Navajo/Diné | à venir | Spirale à 4 mondes |
| Haudenosaunee | à venir | Tortue |
| Lakota/Sioux | à venir | Cercle sacré + plume |
| Pacifique Nord-Ouest | à venir | Corbeau totémique |
| Taïno | à venir | Visage zemi stylisé |

### Océanie & Arctique
| Page | Statut | Icône |
|---|---|---|
| Aborigène australienne | à venir | Points concentriques (Temps du Rêve) |
| Polynésienne | à venir | Hameçon de Maui |
| Mélanésienne | à venir | Masque cérémoniel |
| Inuit | à venir | Silhouette de baleine |

---

## 🟢 CULTURES — icônes

*(voir `suite_cultures.md` pour le détail des scores et sources)*

### Europe
| Page | Statut | Icône |
|---|---|---|
| Rome antique | à venir | Casque + glaive |
| Grèce antique | à venir | Amphore |
| Vikings/Scandinavie médiévale | à venir | Drakkar (bateau viking) |
| Celtes (Gaule/Îles britanniques) | à venir | Bouclier celtique/torque |
| Empire byzantin | à venir | Aigle bicéphale |
| Cités-États italiennes | à venir | Lion ailé (Venise) |

### Moyen-Orient & Méditerranée
| Page | Statut | Icône |
|---|---|---|
| Mésopotamie (culture) | à venir | Tablette cunéiforme |
| Empire perse achéménide | à venir | Colonne de Persépolis |
| Phéniciens | à venir | Voilier + lettre d'alphabet |
| Empire ottoman | à venir | Croissant + dôme |

### Asie
| Page | Statut | Icône |
|---|---|---|
| Chine | ✅ fait | Dragon/nuage stylisé |
| Inde (culture) | à venir | Mudra (main stylisée) |
| Empire mongol | à venir | Arc + flèche ou yourte |
| Civilisation de l'Indus | à venir | Sceau à motif de taureau |
| Japon (culture) | à venir | Éventail plié |
| Corée | à venir | Toit de palais coréen |
| Khmers (Angkor) | à venir | Tour d'Angkor Vat |

### Afrique
| Page | Statut | Icône |
|---|---|---|
| Égypte Antique | ✅ fait | Pyramide + soleil levant |
| Empire du Mali | à venir | Pièce d'or / manuscrit (Tombouctou) |
| Nubie/Koush | à venir | Pyramide méroïtique (fine et pointue) |
| Grand Zimbabwe (culture) | à venir | Mur de pierre courbe — *voir note redondance ci-dessous* |
| Éthiopie/Aksoum | à venir | Stèle/obélisque |

### Amériques
| Page | Statut | Icône |
|---|---|---|
| Incas (culture) | à venir | Terrasse andine / Machu Picchu |
| Maya (culture) | à venir | Glyphe maya stylisé |
| Aztèques (culture) | à venir | Aigle sur cactus |
| Peuples des Plaines | à venir | Tipi + bison |

### Océanie
| Page | Statut | Icône |
|---|---|---|
| Polynésie (navigation) | à venir | Pirogue double |
| Aborigènes d'Australie (culture) | à venir | Boomerang |

**Note redondance volontaire** : Grand Zimbabwe apparaît à la fois en Culture (le peuple qui l'a bâti) et en Mystère (la controverse coloniale sur qui l'a bâti) — c'est intentionnel, sur le même modèle que l'Égypte (mythologie + culture) : deux pages, deux angles, pas un doublon à corriger.

---

## 🔴 CRÉATURES — icônes

### Europe
| Page | Statut | Icône |
|---|---|---|
| Bête du Gévaudan | ✅ fait | Yeux ambrés dans le noir |
| Monstre du Loch Ness | ✅ fait | Silhouette émergeant de l'eau |
| Le Kraken | à venir | Tentacule enroulé |
| Les Sirènes | à venir | Silhouette mi-femme mi-poisson |
| Le Loup-Garou | à venir | Silhouette de loup debout |
| Black Shuck | à venir | Chien noir, yeux rouges |

### Amérique du Nord
| Page | Statut | Icône |
|---|---|---|
| Bigfoot | à venir | Empreinte de pas géante |
| Le Mothman | à venir | Silhouette ailée, yeux rouges |
| Le Wendigo | à venir | Silhouette décharnée (sobre, respect culturel) |
| Le Skinwalker | à venir | Symbole abstrait, pas de représentation frontale (respect culturel) |
| Ogopogo | à venir | Silhouette de vague/serpent de lac |
| Le Jersey Devil | à venir | Silhouette ailée cornue |
| Le Rougarou | à venir | Variante loup-garou cajun |
| Créature de Loveland | à venir | Silhouette de grenouille humanoïde |
| Champ | à venir | Silhouette émergeant de l'eau (variante Nessie) |
| Bête de Bray Road | à venir | Silhouette de loup-garou debout (variante) |

### Amérique latine
| Page | Statut | Icône |
|---|---|---|
| Le Chupacabra | à venir | Yeux rouges, teinte désertique |
| Nahuelito | à venir | Silhouette de vague/serpent de lac (variante Ogopogo) |

### Asie
| Page | Statut | Icône |
|---|---|---|
| Le Yeti | à venir | Empreinte dans la neige |
| Le Kappa | à venir | Carapace + bec stylisés |
| L'Orang Pendek | à venir | Silhouette de primate accroupi |
| Le Yeren | à venir | Silhouette de primate poilu debout |

### Afrique
| Page | Statut | Icône |
|---|---|---|
| Le Popobawa | à venir | Silhouette ailée sombre |
| Le Grootslang | à venir | Trompe + queue de serpent |
| Le Mngwa | à venir | Silhouette de félin, yeux luisants |

### Océanie
| Page | Statut | Icône |
|---|---|---|
| Le Yowie | à venir | Silhouette façon Bigfoot, teinte différente |
| Le Bunyip | à venir | Silhouette aquatique composite |

---

## 🔵 MYSTÈRES — icônes

### Atlantique/Amériques
| Page | Statut | Icône |
|---|---|---|
| Triangle des Bermudes | ✅ fait | Boussole/triangle |
| Amelia Earhart | à venir | Avion stylisé qui s'efface |
| Le Mary Celeste | à venir | Voilier fantôme |
| Colonie de Roanoke | à venir | Inscription stylisée |
| Cité de Paititi / El Dorado | à venir | Masque/pièce d'or stylisé |

### Europe
| Page | Statut | Icône |
|---|---|---|
| Stonehenge | ✅ fait | Cercle de pierres |
| Manuscrit de Voynich | à venir | Page/plume stylisée |
| Suaire de Turin | à venir | Tissu drapé |
| Crop circles | à venir | Cercle géométrique dans un champ |
| Homme de Piltdown | à venir | Crâne fissuré |
| Newgrange | à venir | Tumulus/spirale néolithique |

### Méditerranée & Afrique
| Page | Statut | Icône |
|---|---|---|
| Mécanisme d'Anticythère | à venir | Engrenage |
| Atlantide | à venir | Colonne engloutie |
| Cité d'Héracléion | à venir | Statue engloutie |
| Batterie de Bagdad | à venir | Jarre stylisée |
| Malédiction de Toutânkhamon | à venir | Masque funéraire stylisé |
| Grand Zimbabwe (mystère) | à venir | Mur de pierre courbe |

### Asie
| Page | Statut | Icône |
|---|---|---|
| Sanxingdui | à venir | Masque de bronze aux yeux globuleux |
| Triangle du Dragon (Devil's Sea) | à venir | Tourbillon/vague stylisée |
| Pierres de Dropa | à venir | Disque gravé stylisé |
| Dwarka engloutie | à venir | Temple englouti (vagues sur toit) |

### Amérique du Sud & Russie
| Page | Statut | Icône |
|---|---|---|
| Lignes de Nazca | à venir | Colibri au trait |
| Île de Pâques | à venir | Moaï stylisé |
| Col Dyatlov | à venir | Tente/montagne, très sobre |

### Amérique du Nord (affaires réelles)
| Page | Statut | Icône |
|---|---|---|
| Zodiac Killer | à venir | Sujet sensible, traiter avec sobriété |
| Vol MH370 | à venir | Silhouette d'avion sur océan, sobre |

---

## Prochaines étapes

1. Génération de la carte de fond (IA) — vérifier absence de faune illustrée dans les zones océaniques (cf. note technique en tête de document), haute résolution.
2. Construire `map.html`/`map.astro` : fond de carte + calque SVG de positionnement (coordonnées % par page) + badges filtrable par catégorie.
3. Générer les pictogrammes listés ci-dessus (SVG simples, un seul trait/silhouette, cohérents en taille et en épaisseur de trait).
4. Brancher le système de zoom/cluster décrit dans "Gestion de la densité" ci-dessus.
