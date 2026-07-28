# Plan Carte Interactive & Icônes

## État d'avancement

- ✅ `map.html` en ligne (fond `map.png`, zoom/pan, filtres). Les 29 pages existantes affichent maintenant leur vraie icône (plus de placeholder générique star/diamond/etc.), positions recalibrées à la main par inspection directe de `map.png` (zoom région par région, pas de formule géographique — la carte dessinée n'est pas une projection régulière, testé et invalidé sur le repère Gibraltar/Suez).
- ✅ **Les 189 sujets de la carte ont leur icône**, en 4 tailles chacune (master 300 px +
  128/64/32), soit 756 fichiers dans `public/icons/<catégorie>/` :
  49 mythologies · 34 cultures · 36 créatures · 33 mystères · 37 objets légendaires.
- Deux lots : les 124 premières icônes (25 planches), puis 65 le 26/07/2026 (11 planches) —
  les 37 objets de la nouvelle catégorie et les 28 sujets ajoutés aux 4 autres.
- ✅ **Les 189 positions sont placées à la main.** Les 65 dernières ont été posées le
  26/07/2026 : arrivées avec une position calculée par interpolation locale et le marqueur
  `pos:'todo'`, elles ont été recalées une par une dans `tools/edit_map_pins.py` (filtre
  « à placer uniquement », qui se vide au fil des enregistrements). Contrôle : aucune paire de
  pins à moins de 0,35, aucun hors carte, `PLACES_FUTURE` valide. **L'amont de la carte est
  terminé** — voir `docs/listes/positions-carte.md`.

- La découpe se fait par **détection de formes** (seuillage de luminance + composantes connexes + dilatation pour recoller les traits d'une même icône, tri en ordre de lecture) et non par grille rigide : le placement des planches générées par IA est irrégulier — icône à cheval sur une frontière de cellule, cadre tracé autour de la feuille, taches parasites. Les 25 premières planches ont été découpées par un script jetable ; c'est désormais `tools/make_icons.py`, qui fait détection, recadrage, fond transparent, nommage et les 4 tailles, et **refuse d'écrire si le compte de formes ne colle pas aux slugs fournis**.
- Sources brutes conservées dans `icon-sources/old/<categorie>/` (+ `decoupe/` pour les lots anciens). Une planche découpée passe de `new/` à `old/` — voir `icon-sources/README.md`.
- **Reste à faire : écrire les pages.** Les icônes et les pins n'attendent plus qu'elles.

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
| 🟣 Objets légendaires | Violet améthyste `#6b4a9c → #9a72d4` | choisi pour rester lisible à côté du bleu nuit des Mystères — c'est la paire la plus proche des cinq, à vérifier à l'œil sur la carte avant de figer |

## Les deux statuts de la colonne « Statut »

| Valeur | Sens |
|---|---|
| `✅ fait` | **La page est publiée** et son pin est actif sur la carte. |
| `icône prête` | L'icône existe dans `public/icons/`, le pin est placé dans `PLACES_FUTURE` — **il ne manque que la page**. |

Ce n'est pas cosmétique : `tools/add_page.py` cherche `icône prête` et le bascule en `✅ fait`
au moment de la publication. Écrire `✅ fait` sur une page non écrite casse ce mécanisme et
fait croire le travail terminé.

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
| Finnoise | ✅ fait | Cygne ou kantele (harpe) |
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
| Perse/zoroastrienne | ✅ fait | Flamme sacrée |
| Cananéenne/ougaritique | icône prête | Taureau stylisé |
| Hittite | icône prête | Dragon enroulé (Illuyanka) |
| Arabe préislamique | icône prête | Croissant + étoile |

### Asie
| Page | Statut | Icône |
|---|---|---|
| Hindoue | ✅ fait | Lotus ouvert |
| Japonaise | ✅ fait | Torii |
| Aztèque & Maya | ✅ fait | Serpent à plumes (S ondulant) |
| Chinoise | ✅ fait | Dragon serpentin |
| Coréenne | icône prête | Ourse (Dangun) |
| Tibétaine/Bön | icône prête | Montagne sacrée |
| Mongole | icône prête | Loup gris ou ciel étoilé |
| Vietnamienne | ✅ fait | Œuf fendu |
| Turque/Asie centrale | icône prête | Loup gris (Asena) |
| Cosmologie bouddhiste | icône prête | Mont Meru (montagne à degrés) |
| Ainu | icône prête | Ours de face, silhouette sobre (kamuy) |
| Javanaise / indonésienne | icône prête | Marionnette wayang de profil |
| Philippines | icône prête | Jarre funéraire à figure sculptée sur le couvercle |

### Afrique
| Page | Statut | Icône |
|---|---|---|
| Yoruba | ✅ fait | Hache double (Shango) |
| Dogon | ✅ fait | Étoile Sirius |
| Ashanti/Akan | icône prête | Araignée (Anansi) |
| Zoulou | icône prête | Bouclier + lance |
| Éthiopienne | icône prête | Arche/couronne |
| Berbère / amazighe | icône prête | Éclair au-dessus d'une jarre d'eau (Anzar, la pluie) |

### Amériques
| Page | Statut | Icône |
|---|---|---|
| Inca | ✅ fait | Disque solaire (Inti) |
| Navajo/Diné | icône prête | Spirale à 4 mondes |
| Haudenosaunee | icône prête | Tortue |
| Lakota/Sioux | icône prête | Cercle sacré + plume |
| Pacifique Nord-Ouest | icône prête | Corbeau totémique |
| Taïno | icône prête | Visage zemi stylisé |
| Mapuche | icône prête | Deux serpents ondulants face à face (Ten Ten et Kai Kai) |
| Guarani / tupi | icône prête | Paire de maracas rituels croisés (mbaraka) |

### Océanie & Arctique
| Page | Statut | Icône |
|---|---|---|
| Aborigène australienne | ✅ fait | Points concentriques (Temps du Rêve) |
| Polynésienne | ✅ fait | Hameçon de Maui |
| Mélanésienne | icône prête | Masque cérémoniel |
| Inuit | icône prête | Silhouette de baleine |

---

## 🟢 CULTURES — icônes

*(voir `docs/listes/suite_cultures.md` pour le détail des scores et sources)*

### Europe
| Page | Statut | Icône |
|---|---|---|
| Rome antique | ✅ fait | Casque + glaive |
| Grèce antique | ✅ fait | Amphore |
| Vikings/Scandinavie médiévale | ✅ fait | Drakkar (bateau viking) |
| Celtes (Gaule/Îles britanniques) | icône prête | Bouclier celtique/torque |
| Empire byzantin | ✅ fait | Aigle bicéphale |
| Cités-États italiennes | icône prête | Lion ailé (Venise) |
| Al-Andalus | icône prête | Arc outrepassé (fer à cheval) de Cordoue |
| Minoens (Crète) | icône prête | Taureau bondissant de profil |

### Moyen-Orient & Méditerranée
| Page | Statut | Icône |
|---|---|---|
| Mésopotamie (culture) | ✅ fait | Tablette cunéiforme |
| Empire perse achéménide | ✅ fait | Colonne de Persépolis |
| Phéniciens | icône prête | Voilier + lettre d'alphabet |
| Empire ottoman | icône prête | Croissant + dôme |
| Carthage | icône prête | Cheval cabré au-dessus d'une proue de navire (monnayage punique) |

### Asie
| Page | Statut | Icône |
|---|---|---|
| Chine | ✅ fait | Dragon/nuage stylisé |
| Inde (culture) | ✅ fait | Mudra (main stylisée) |
| Empire mongol | ✅ fait | Arc + flèche ou yourte |
| Civilisation de l'Indus | icône prête | Sceau à motif de taureau |
| Japon (culture) | icône prête | Éventail plié |
| Corée | icône prête | Toit de palais coréen |
| Khmers (Angkor) | ✅ fait | Tour d'Angkor Vat |
| Empire timouride | icône prête | Coupole nervurée à côté d'un sextant astronomique (Ulugh Beg) |

### Afrique
| Page | Statut | Icône |
|---|---|---|
| Égypte Antique | ✅ fait | Pyramide + soleil levant |
| Empire du Mali | ✅ fait | Pièce d'or / manuscrit (Tombouctou) |
| Nubie/Koush | icône prête | Pyramide méroïtique (fine et pointue) |
| Grand Zimbabwe (culture) | icône prête | Mur de pierre courbe — *voir note redondance ci-dessous* |
| Éthiopie/Aksoum | icône prête | Stèle/obélisque |
| Côte swahilie | icône prête | Boutre à voile latine triangulaire |
| Empire songhaï | icône prête | Mosquée de terre à poutres saillantes |

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
| Polynésie (navigation) | ✅ fait | Pirogue double |
| Aborigènes d'Australie (culture) | icône prête | Boomerang |

**Note redondance volontaire** : Grand Zimbabwe apparaît à la fois en Culture (le peuple qui l'a bâti) et en Mystère (la controverse coloniale sur qui l'a bâti) — c'est intentionnel, sur le même modèle que l'Égypte (mythologie + culture) : deux pages, deux angles, pas un doublon à corriger.

---

## 🔴 CRÉATURES — icônes

### Europe
| Page | Statut | Icône |
|---|---|---|
| Bête du Gévaudan | ✅ fait | Yeux ambrés dans le noir |
| Monstre du Loch Ness | ✅ fait | Silhouette émergeant de l'eau |
| Le Kraken | ✅ fait | Tentacule enroulé |
| Les Sirènes | icône prête | Silhouette mi-femme mi-poisson |
| Le Loup-Garou | icône prête | Silhouette de loup debout |
| Black Shuck | icône prête | Chien noir, yeux rouges |
| Le Golem de Prague | ✅ fait | Silhouette d'argile massive et sans visage, petit parchemin à la bouche |
| La Tarasque | ✅ fait | Dragon trapu à carapace, monté sur roues de procession |
| Le Basilic | icône prête | Coq à queue de serpent |
| Le Tatzelwurm | icône prête | Ver à tête de chat, deux pattes avant seulement |

### Amérique du Nord
| Page | Statut | Icône |
|---|---|---|
| Bigfoot | ✅ fait | Empreinte de pas géante |
| Le Mothman | ✅ fait | Silhouette ailée, yeux rouges |
| Le Wendigo | icône prête | Silhouette décharnée (sobre, respect culturel) |
| Le Skinwalker | icône prête | Symbole abstrait, pas de représentation frontale (respect culturel) |
| Ogopogo | icône prête | Silhouette de vague/serpent de lac |
| Le Jersey Devil | icône prête | Silhouette ailée cornue |
| Le Rougarou | icône prête | Variante loup-garou cajun |
| Créature de Loveland | icône prête | Silhouette de grenouille humanoïde |
| Champ | icône prête | Silhouette émergeant de l'eau (variante Nessie) |
| Bête de Bray Road | icône prête | Silhouette de loup-garou debout (variante) |
| Le Thunderbird | ✅ fait | Grand oiseau de face, ailes déployées, **éclairs sous les ailes** — l'éclair est ce qui le distingue du corbeau totémique du Pacifique Nord-Ouest |

### Amérique latine
| Page | Statut | Icône |
|---|---|---|
| Le Chupacabra | ✅ fait | Yeux rouges, teinte désertique |
| La Llorona | ✅ fait | Silhouette féminine en robe longue au bord de l'eau, **sans visage**, avec son reflet |
| L'Hombre Caimán | icône prête | Caïman de profil surmonté d'une tête d'homme stylisée, sobre |
| Nahuelito | icône prête | Silhouette de vague/serpent de lac (variante Ogopogo) |
| Le Mapinguari | icône prête | Silhouette voûtée à longues griffes, sobre |

### Asie
| Page | Statut | Icône |
|---|---|---|
| Le Yeti | ✅ fait | Empreinte dans la neige |
| Le Kappa | ✅ fait | Carapace + bec stylisés |
| L'Orang Pendek | icône prête | Silhouette de primate accroupi |
| Le Yeren | ✅ fait | Silhouette de primate poilu debout |

### Afrique
| Page | Statut | Icône |
|---|---|---|
| Le Popobawa | icône prête | Silhouette ailée sombre |
| Le Grootslang | icône prête | Trompe + queue de serpent |
| Le Mngwa | icône prête | Silhouette de félin, yeux luisants |
| Mokèlé-mbembé | ✅ fait | Long cou émergeant d'un marais entre des palmes (marais + palmes = ce qui le distingue des serpents de lac) |

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
| Amelia Earhart | ✅ fait | Avion stylisé qui s'efface |
| Le Mary Celeste | ✅ fait | Voilier fantôme |
| Colonie de Roanoke | ✅ fait | Inscription stylisée |
| Cité de Paititi / El Dorado | ✅ fait | Masque/pièce d'or stylisé |
| Oak Island | icône prête | Puits circulaire vu en coupe, couches successives |
| Sphères de pierre du Costa Rica | icône prête | Trois sphères de tailles différentes alignées |

### Europe
| Page | Statut | Icône |
|---|---|---|
| Stonehenge | ✅ fait | Cercle de pierres |
| Manuscrit de Voynich | ✅ fait | Page/plume stylisée |
| Suaire de Turin | ✅ fait | Tissu drapé |
| Crop circles | icône prête | Cercle géométrique dans un champ |
| Homme de Piltdown | icône prête | Crâne fissuré |
| Newgrange | icône prête | Tumulus/spirale néolithique |

### Méditerranée & Afrique
| Page | Statut | Icône |
|---|---|---|
| Mécanisme d'Anticythère | ✅ fait | Engrenage |
| Atlantide | icône prête | Colonne engloutie |
| Cité d'Héracléion | icône prête | Statue engloutie |
| Batterie de Bagdad | icône prête | Jarre stylisée |
| Malédiction de Toutânkhamon | icône prête | Masque funéraire stylisé |
| Grand Zimbabwe (mystère) | icône prête | Mur de pierre courbe |
| Göbekli Tepe | ✅ fait | Deux piliers en T dressés côte à côte |
| Disque de Phaistos | icône prête | Disque couvert de petits signes disposés en spirale — la spirale est ce qui le distingue du disque de Dropa et de la Pierre du Soleil |

### Asie
| Page | Statut | Icône |
|---|---|---|
| Sanxingdui | ✅ fait | Masque de bronze aux yeux globuleux |
| Triangle du Dragon (Devil's Sea) | icône prête | Tourbillon/vague stylisée |
| Pierres de Dropa | icône prête | Disque gravé stylisé |
| Dwarka engloutie | icône prête | Temple englouti (vagues sur toit) |

### Amérique du Sud & Russie
| Page | Statut | Icône |
|---|---|---|
| Lignes de Nazca | ✅ fait | Colibri au trait |
| Île de Pâques | ✅ fait | Moaï stylisé |
| Col Dyatlov | ✅ fait | Tente/montagne, très sobre |
| Explosion de la Toungouska | icône prête | Troncs d'arbres couchés en éventail |
| Rongorongo | icône prête | Tablette de bois gravée de lignes de petits glyphes |

### Amérique du Nord (affaires réelles)
| Page | Statut | Icône |
|---|---|---|
| Zodiac Killer | icône prête | Sujet sensible, traiter avec sobriété |
| Vol MH370 | icône prête | Silhouette d'avion sur océan, sobre |
| Le Somerton Man | icône prête | Bout de papier déchiré, strictement abstrait — mort réelle, aucune mise en scène |

---

## 🟣 OBJETS LÉGENDAIRES — icônes

*(voir `docs/listes/suite_objets.md` pour les scores et le détail, `docs/plans/plan-serie-objets.md` pour la
structure des pages. Fichiers attendus : `public/icons/objet/<id>.png`.)*

**Principe graphique propre à cette catégorie** : l'icône est **l'objet lui-même**, en
silhouette, sans main, sans personnage, sans décor. C'est la catégorie où le pictogramme est
le plus naturel du site — un objet *est* déjà un pictogramme. Deux pièges à éviter :
beaucoup d'entrées sont des épées (5 sur 37), et il faut donc varier fortement l'angle et la
pose ; et les objets sacrés vivants (Tabouret d'or, Zulfiqar) doivent rester strictement
neutres, sans ajout de contexte religieux ni de mise en scène.

### Europe (15)
| Page | Statut | Icône |
|---|---|---|
| Excalibur | ✅ fait | Épée plantée verticalement dans une pierre |
| Mjöllnir | ✅ fait | Marteau à manche court, tête massive, de profil |
| Le Saint Graal | ✅ fait | Calice à pied, simple |
| La Lance Sacrée | ✅ fait | Fer de lance long et fin, hampe coupée |
| La Chambre d'Ambre | ✅ fait | Fragment de panneau mural orné, angle brisé |
| Les épées Ulfberht | ✅ fait | Lame à plat portant une inscription stylisée (traits, pas de lettres lisibles) |
| La Pierre de Scone | icône prête | Bloc de pierre rectangulaire avec ses deux anneaux de transport |
| Durandal | icône prête | Épée fichée **horizontalement** dans une paroi rocheuse (angle volontairement différent d'Excalibur) |
| Le Trésor des Templiers | icône prête | Coffre fermé portant une croix pattée |
| Le Sampo | icône prête | Mécanisme-moulin à la forme volontairement indistincte |
| La Couronne de fer de Lombardie | icône prête | Couronne basse, anneau intérieur marqué d'un trait |
| Joyeuse | icône prête | Épée de cérémonie à pommeau orné, pointe en bas |
| L'Épée de Montesiepi | icône prête | Seule la garde en croix émerge d'un sol circulaire |
| L'Anneau des Nibelungen | icône prête | Anneau simple, léger halo |
| La Table Ronde | icône prête | Table ronde vue de dessus, segmentée en rayons |

### Méditerranée antique (3)
| Page | Statut | Icône |
|---|---|---|
| La Toison d'Or | ✅ fait | Peau de mouton suspendue à une branche |
| Le Cheval de Troie | ✅ fait | Cheval de bois monté sur roues |
| La Boîte de Pandore | ✅ fait | **Jarre** (pithos) au couvercle entrouvert — jamais un coffret, c'est tout le propos de la page |

### Moyen-Orient (4)
| Page | Statut | Icône |
|---|---|---|
| L'Arche d'Alliance | ✅ fait | Coffre à barres de transport, surmonté de deux ailes |
| La Ménorah du Second Temple | icône prête | Chandelier à sept branches |
| Zulfiqar | icône prête | Épée à lame bifide, strictement neutre |
| L'Anneau de Salomon | icône prête | Anneau portant une étoile à six branches |

### Asie (7)
| Page | Statut | Icône |
|---|---|---|
| Les Trois Trésors impériaux du Japon | ✅ fait | **Trois coffres fermés alignés** — ne jamais dessiner les objets, qui n'ont jamais été montrés : l'icône dit exactement le sujet de la page |
| L'Épée de Goujian | ✅ fait | Épée courte de bronze, lame large, vue de face |
| Le Koh-i-Noor | ✅ fait | Diamant taillé, facettes géométriques |
| Le Sceau de jade impérial | icône prête | Sceau carré à poignée sculptée |
| Le Honjo Masamune | icône prête | Katana dans son fourreau, courbe marquée |
| Le Vajra | ✅ fait | Vajra à branches symétriques |
| Le Ruyi Jingu Bang | icône prête | Bâton long à extrémités cerclées |

### Afrique (3)
| Page | Statut | Icône |
|---|---|---|
| Le Tabouret d'or des Ashanti | ✅ fait | Tabouret à assise incurvée, de profil, sans personnage |
| Les regalia du Dahomey | icône prête | Trône à haut dossier |
| Le trésor de Lobengula | icône prête | Petit coffre ouvert débordant de perles |

### Amériques (3)
| Page | Statut | Icône |
|---|---|---|
| Les crânes de cristal | icône prête | Crâne facetté, traits géométriques |
| La Pierre du Soleil aztèque | ✅ fait | Disque circulaire à motifs concentriques |
| Le trésor de Moctezuma | icône prête | Barre d'or (lingot) — sobre, c'est la seule pièce réellement retrouvée |

### Océanie (2)
| Page | Statut | Icône |
|---|---|---|
| L'hameçon de Maui | ✅ fait | Hameçon courbe **accompagné de 3-4 points d'étoiles** — *voir note de collision ci-dessous* |
| Le mere pounamu | icône prête | Massue plate en jade, vue de face |

**⚠️ Collision d'icône à trancher** : l'icône « Hameçon de Maui » est **déjà prévue et
générée** pour la page *Mythologie polynésienne* (section Océanie & Arctique ci-dessus).
Deux pages, deux catégories, la même icône et presque la même position sur la carte — ce
n'est pas la redondance volontaire du type Grand Zimbabwe (deux angles d'un même sujet), c'est
un vrai doublon visuel. Trois issues possibles :
1. **Renoncer à la page objet** et laisser l'hameçon à la mythologie polynésienne (le plus
   simple, et défendable : l'objet n'existe que dans le récit).
2. **Différencier l'icône** (hameçon + constellation pour la page objet, hameçon nu pour la
   mythologie) **et décaler la position** (pin en pleine mer pour l'objet, sur les îles pour
   la mythologie).
3. Remplacer l'entrée objet par un autre objet polynésien.

À trancher avant de générer la planche Océanie — pas après.

---

## Prochaines étapes

**L'amont de la carte est terminé** : fond généré, `map.html` avec son calque de pins, ses
filtres et son clustering au zoom, 189 icônes générées et découpées en 4 tailles, et
189 positions placées à la main.

Reste à faire :

1. **Trancher les deux collisions** signalées plus haut : l'hameçon de Maui (icône et zone
   partagées avec la mythologie polynésienne) et le rongorongo (même point que l'île de
   Pâques). Les icônes existent et les pins sont posés — la décision porte sur l'existence des
   deux pages.
2. **Vérifier à l'œil le violet des objets à côté du bleu nuit des mystères** sur une zone
   dense (Europe de l'Ouest, où les deux catégories se superposent le plus) avant de figer la
   couleur.
3. **Écrire les pages.** C'est désormais le seul goulot.

**Rappel de priorité** (voir `docs/audit-existant.md` § C3) : 160 pins et 189 icônes attendent
une page qui n'existe pas. Générer d'autres planches serait produire du stock avant d'avoir
consommé celui-ci — l'amont est très largement en avance sur la rédaction.
