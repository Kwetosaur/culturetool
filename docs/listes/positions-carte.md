# Où placer chaque point sur la carte

Référence utilisée pour ajuster les positions à l'œil avec `tools/edit_map_pins.py`.
Localisation réelle (pays / ville ou zone la plus proche) pour chacun des **189 points** des
5 catégories, par ordre alphabétique dans chaque catégorie.

**Statut : les 189 positions ont été vérifiées et placées à la main avec l'éditeur —
toutes ✅.** Les 124 premières lors des vagues précédentes, les 65 ajoutées le 26/07/2026
dans la foulée de leur création.

Les coordonnées x/y sont indiquées en regard de chaque ligne pour les 65 dernières, telles
qu'elles sont dans `public/map.html`. Contrôle après la session de placement : aucune paire de
pins à moins de 0,35 l'un de l'autre, aucun pin hors carte, `PLACES_FUTURE` toujours du JS
valide.

## Si tu ajoutes de nouveaux pins

Ils arrivent avec une position **calculée** et le marqueur `pos:'todo'`. La méthode : les
positions déjà calées à la main servent de points de contrôle, et la latitude/longitude réelle
du nouveau sujet est convertie en x/y par pondération inverse de la distance sur les 4 ancres
les plus proches. **Ce n'est pas la formule géographique globale déjà testée et invalidée** (la
carte dessinée n'est pas une projection régulière) : c'est une interpolation locale, juste à la
région près et jamais davantage.

D'où le recalage à la main :

```bash
python tools/edit_map_pins.py
```

Cocher **« à placer uniquement »** dans les filtres pour n'afficher que les pins concernés,
déplacer (glisser, ou flèches — `Maj` pour un pas large), enregistrer. **Le marqueur disparaît
des pins déplacés**, donc le compte du filtre diminue au fur et à mesure. Puis
`node tools/check_map.cjs public/map.html` et `npm run build`.

Deux points de vigilance qui ont servi sur le lot du 26/07 :

- **Le seuil du Pacifique.** `cult-polynesie` est dessiné au bord **droit** de la carte (x=95)
  et `myst-ile-de-paques` au bord **gauche** (x=14,9). Les pins océaniens sont ceux que
  l'interpolation place le plus mal.
- **Deux collisions restent à trancher** : `obj-hamecon-maui` partage son icône et sa zone avec
  la mythologie polynésienne, et `myst-rongorongo` partage son point avec l'île de Pâques. Les
  pins sont posés, la décision porte sur l'existence des deux pages. Voir
  `docs/plans/plan-carte-icones.md`.

## 🟡 Mythologies

| Page | Où la placer | Statut |
|---|---|---|
| Aborigène australienne | Australie, centre | ✅ |
| Ainu | Hokkaidō (nord du Japon) | ✅ `myth-ainu` en 82.8 / 34.4 |
| Arabe préislamique | Péninsule Arabique | ✅ |
| Arménienne | Arménie (Caucase) | ✅ |
| Ashanti / Akan | Ghana | ✅ |
| Aztèque & Maya | Mexique (vallée de Mexico) | ✅ |
| Balte | Lituanie/Lettonie | ✅ |
| Basque | Frontière France/Espagne, golfe de Gascogne | ✅ |
| Berbère / amazighe | Haut Atlas (Maroc) | ✅ `myth-berbere` en 47.9 / 40.3 |
| Canaanéenne / ougaritique | Côte de Syrie/Liban | ✅ |
| Celtique | Irlande | ✅ |
| Chinoise | Chine centrale | ✅ |
| Coréenne | Péninsule coréenne | ✅ |
| Cosmologie bouddhiste | Himalaya (Népal/Tibet) | ✅ |
| Dogon | Mali | ✅ |
| Égyptienne | Égypte, delta/vallée du Nil | ✅ |
| Éthiopienne | Éthiopie | ✅ |
| Étrusque | Italie, région de Toscane | ✅ |
| Finnoise | Finlande | ✅ |
| Géorgienne / caucasienne | Géorgie (Caucase) | ✅ |
| Grecque | Grèce continentale (mer Égée) | ✅ |
| Guarani / tupi | Paraguay / sud du Brésil | ✅ `myth-guarani` en 31.6 / 69.0 |
| Haudenosaunee | Nord-est des États-Unis (région des Grands Lacs) | ✅ |
| Hindoue | Inde (péninsule, zone centrale) | ✅ |
| Hittite | Turquie centrale (Anatolie) | ✅ |
| Inca | Pérou (région du Cusco) | ✅ |
| Inuit | Grand Nord canadien/Groenland | ✅ |
| Japonaise | Japon (Honshū) | ✅ |
| Javanaise / indonésienne | Java (Indonésie) | ✅ `myth-javanaise` en 77.0 / 59.6 |
| Lakota / Sioux | Grandes Plaines (Dakota) | ✅ |
| Mapuche | Araucanie (Chili central) | ✅ `myth-mapuche` en 28.2 / 75.0 |
| Mélanésienne | Papouasie-Nouvelle-Guinée | ✅ |
| Mésopotamienne | Irak actuel (entre Tigre et Euphrate) | ✅ |
| Mongole | Mongolie | ✅ |
| Navajo / Diné | Sud-ouest des États-Unis (Arizona/Nouveau-Mexique) | ✅ |
| Nordique | Scandinavie (Norvège/Suède centrales) | ✅ |
| Pacifique Nord-Ouest | Côte Colombie-Britannique/Washington | ✅ |
| Perse / zoroastrienne | Iran | ✅ |
| Philippines | Archipel des Philippines (Luzon) | ✅ `myth-philippines` en 77.6 / 51.7 |
| Polynésienne | Océan Pacifique (large, entre Australie et Amérique) | ✅ |
| Romaine | Italie centrale (région de Rome) | ✅ |
| Sami | Nord de la Scandinavie (Laponie) | ✅ |
| Slave | Europe de l'Est / Russie occidentale | ✅ |
| Taïno | Caraïbes (Cuba/Hispaniola) | ✅ |
| Tibétaine / Bön | Tibet (plateau himalayen) | ✅ |
| Turque / Asie centrale | Asie centrale (Kazakhstan/Ouzbékistan) | ✅ |
| Vietnamienne | Vietnam | ✅ |
| Yoruba | Nigeria (golfe de Guinée) | ✅ |
| Zoulou | Afrique du Sud (est) | ✅ |

## 🟢 Cultures

| Page | Où la placer | Statut |
|---|---|---|
| Aborigènes d'Australie (culture) | Australie, centre | ✅ |
| Al-Andalus | Cordoue (sud de l'Espagne) | ✅ `cult-al-andalus` en 46.2 / 38.9 |
| Aztèques (culture) | Mexique central | ✅ |
| Carthage | Tunis (Tunisie) | ✅ `cult-carthage` en 49.5 / 40.8 |
| Celtes (Gaule / Îles britanniques) | Gaule du Nord / Manche | ✅ |
| Chinoise | Chine centrale | ✅ |
| Cités-États italiennes | Italie du Nord (Venise/Florence) | ✅ |
| Civilisation de l'Indus | Pakistan (vallée de l'Indus) | ✅ |
| Corée | Péninsule coréenne | ✅ |
| Côte swahilie | Mombasa (côte kényane) — décalé vers le nord pour ne pas se coller à Zanzibar (Popobawa) et à la côte tanzanienne (Mngwa) | ✅ `cult-swahilie` en 57.0 / 62.4 |
| Égypte Antique | Égypte, vallée du Nil | ✅ |
| Empire byzantin | Turquie (Istanbul/Constantinople) | ✅ |
| Empire du Mali | Mali (Afrique de l'Ouest) | ✅ |
| Empire mongol | Mongolie | ✅ |
| Empire ottoman | Turquie (Anatolie centrale) | ✅ |
| Empire perse achéménide | Iran (sud) | ✅ |
| Empire songhaï | Gao (est du Mali) — décalé à l'est du pin Empire du Mali | ✅ `cult-songhai` en 47.3 / 49.6 |
| Empire timouride | Samarcande (Ouzbékistan) | ✅ `cult-timourides` en 63.5 / 34.6 |
| Éthiopie / Aksoum | Éthiopie (nord) | ✅ |
| Grand Zimbabwe (culture) | Zimbabwe | ✅ |
| Grèce antique | Grèce (Athènes) | ✅ |
| Incas (culture) | Pérou | ✅ |
| Inde (culture) | Inde du Nord | ✅ |
| Japon (culture) | Japon | ✅ |
| Khmers (Angkor) | Cambodge | ✅ |
| Maya (culture) | Péninsule du Yucatán (Mexique/Guatemala) | ✅ |
| Mésopotamie (culture) | Irak | ✅ |
| Minoens (Crète) | Crète (Cnossos, nord de l'île) | ✅ `cult-minoens` en 53.6 / 40.5 |
| Nubie / Koush | Soudan | ✅ |
| Peuples des Plaines | Grandes Plaines nord-américaines | ✅ |
| Phéniciens | Liban (côte) | ✅ |
| Polynésie (navigation) | Pacifique (large, région Polynésie) | ✅ |
| Rome antique | Italie (Rome) | ✅ |
| Vikings / Scandinavie médiévale | Norvège/Danemark | ✅ |

## 🔴 Créatures

| Page | Où la placer | Statut |
|---|---|---|
| Bête de Bray Road | Wisconsin (USA) | ✅ |
| Bête du Gévaudan | France (Cévennes, Lozère) | ✅ |
| Bigfoot | Nord-ouest des États-Unis (Pacifique) | ✅ |
| Black Shuck | Angleterre (côte est) | ✅ |
| Champ | Lac Champlain (frontière USA/Canada) | ✅ |
| Créature de Loveland | Ohio (USA) | ✅ |
| L'Orang Pendek | Sumatra (Indonésie) | ✅ |
| La Tarasque | Tarascon (Provence, France) | ✅ `crea-tarasque` en 48.2 / 33.5 |
| Le Basilic | Varsovie (Pologne) — le cas documenté de 1587 | ✅ `crea-basilic` en 52.8 / 30.3 |
| Le Bunyip | Australie, sud-est | ✅ |
| Le Chupacabra | Porto Rico / Caraïbes | ✅ |
| La Llorona | Mexico (lac Texcoco) — la légende est panhispanique, le pin marque sa version la plus ancienne | ✅ `crea-llorona` en 21.4 / 48.9 |
| L'Hombre Caimán | Plato, Magdalena (nord de la Colombie) | ✅ `crea-hombre-caiman` en 27.2 / 54.2 |
| Le Golem de Prague | Prague (Tchéquie) | ✅ `crea-golem` en 50.8 / 31.8 |
| Le Grootslang | Afrique du Sud | ✅ |
| Le Jersey Devil | New Jersey (USA) | ✅ |
| Le Kappa | Japon | ✅ |
| Le Kraken | Mer de Norvège / Atlantique nord | ✅ |
| Le Mapinguari | Amazonie occidentale (Acre, Brésil) | ✅ `crea-mapinguari` en 28.0 / 65.8 |
| Le Mngwa | Tanzanie (côte) | ✅ |
| Le Mothman | Virginie-Occidentale (USA) | ✅ |
| Le Popobawa | Zanzibar (Tanzanie) | ✅ |
| Le Rougarou | Louisiane (USA) | ✅ |
| Le Skinwalker | Sud-ouest des États-Unis (Utah/Arizona) | ✅ |
| Le Tatzelwurm | Alpes suisses/autrichiennes | ✅ `crea-tatzelwurm` en 49.9 / 33.9 |
| Le Thunderbird | Illinois (rives du Mississippi) — zone vide de la carte, et évite les pins Lakota et Bigfoot | ✅ `crea-thunderbird` en 23.3 / 36.6 |
| Le Wendigo | Nord des Grands Lacs (USA/Canada) | ✅ |
| Le Yeren | Chine centrale (Hubei) | ✅ |
| Le Yeti | Himalaya (Népal) | ✅ |
| Le Yowie | Australie, est | ✅ |
| Les Sirènes | Méditerranée (mer Égée/Ionienne) | ✅ |
| Loup-Garou | France | ✅ |
| Mokèlé-mbembé | Nord du Congo (marais de la Likouala) | ✅ `crea-mokele-mbembe` en 51.1 / 58.0 |
| Monstre du Loch Ness | Écosse (Highlands) | ✅ |
| Nahuelito | Argentine (Patagonie, lac Nahuel Huapi) | ✅ |
| Ogopogo | Colombie-Britannique (lac Okanagan) | ✅ |

## 🔵 Mystères

| Page | Où la placer | Statut |
|---|---|---|
| Amelia Earhart | Pacifique central (zone de disparition) | ✅ |
| Atlantide | Atlantique, au large de Gibraltar | ✅ |
| Batterie de Bagdad | Irak | ✅ |
| Cité d'Héracléion | Égypte (delta du Nil, Alexandrie) | ✅ |
| Cité de Paititi / El Dorado | Pérou/Bolivie (Amazonie) | ✅ |
| Col Dyatlov | Russie (Oural) | ✅ |
| Colonie de Roanoke | Caroline du Nord (USA) | ✅ |
| Crop circles | Angleterre (sud) | ✅ |
| Disque de Phaistos | Sud de la Crète — le pin Anticythère est au nord-ouest de l'île, les deux tiennent | ✅ `myst-phaistos` en 53.3 / 41.2 |
| Dwarka engloutie | Inde (Gujarat, golfe de Cambay) | ✅ |
| Explosion de la Toungouska | Sibérie centrale (Krasnoïarsk) | ✅ `myst-toungouska` en 70.8 / 17.5 |
| Göbekli Tepe | Sud-est de la Turquie (Şanlıurfa) | ✅ `myst-gobekli-tepe` en 57.1 / 39.0 |
| Grand Zimbabwe (mystère) | Zimbabwe | ✅ |
| Homme de Piltdown | Angleterre (sud) | ✅ |
| Île de Pâques | Pacifique sud (large, au large du Chili) | ✅ |
| Le Mary Celeste | Atlantique, au large du Portugal/Açores | ✅ |
| Lignes de Nazca | Pérou (côte sud) | ✅ |
| Malédiction de Toutânkhamon | Égypte (vallée des Rois) | ✅ |
| Manuscrit de Voynich | Italie du Nord | ✅ |
| Mécanisme d'Anticythère | Grèce (mer Égée, Crète) | ✅ |
| Newgrange | Irlande | ✅ |
| Oak Island | Nouvelle-Écosse (Canada) | ✅ `myst-oak-island` en 30.9 / 34.2 |
| Pierres de Dropa | Chine centrale | ✅ |
| Rongorongo | Île de Pâques — **collision** avec le pin Île de Pâques, à trancher (voir `docs/listes/liste-creatures-mysteres-monde.md`) | ✅ `myst-rongorongo` en 15.0 / 71.7 |
| Sanxingdui | Chine (Sichuan) | ✅ |
| Somerton Man | Adélaïde (Australie du Sud) | ✅ `myst-somerton-man` en 81.5 / 77.9 |
| Sphères de pierre du Costa Rica | Costa Rica (delta du Diquís) | ✅ `myst-spheres-costa-rica` en 24.6 / 53.2 |
| Stonehenge | Angleterre (plaine de Salisbury) | ✅ |
| Suaire de Turin | Italie (Turin) | ✅ |
| Triangle des Bermudes | Atlantique, au large de la Floride | ✅ |
| Triangle du Dragon (Devil's Sea) | Japon (au sud) | ✅ |
| Vol MH370 | Océan Indien sud | ✅ |
| Zodiac Killer | Californie (USA) | ✅ |

## 🟣 Objets légendaires

Règle propre à cette catégorie : quand l'objet a une origine narrative et un lieu de
conservation différents, **le pin va sur le lieu où on peut le voir aujourd'hui** (ou sur son
dernier emplacement connu s'il est perdu) — c'est ce que la carte promet à qui clique. Les cas
concernés sont signalés.

| Page | Où la placer | Statut |
|---|---|---|
| Anneau de Salomon | Israël / Jérusalem | ✅ `obj-anneau-salomon` en 56.0 / 43.0 |
| Anneau des Nibelungen | Rhin moyen (Allemagne, région de Worms) | ✅ `obj-anneau-nibelungen` en 49.6 / 32.2 |
| Arche d'Alliance | Aksoum (Éthiopie) — **lieu de conservation revendiqué**, pas Jérusalem : c'est là que la page mène | ✅ `obj-arche-alliance` en 57.6 / 56.0 |
| Boîte de Pandore | Grèce centrale (Béotie, pays d'Hésiode) | ✅ `obj-boite-pandore` en 52.8 / 38.1 |
| Chambre d'Ambre | Kaliningrad / Königsberg (Russie) — dernier emplacement connu | ✅ `obj-chambre-ambre` en 53.0 / 28.5 |
| Cheval de Troie | Troie (Hisarlık, côte ouest de la Turquie) | ✅ `obj-cheval-troie` en 59.5 / 37.9 |
| Couronne de fer de Lombardie | Monza (Italie du Nord) | ✅ `obj-couronne-fer` en 49.8 / 34.8 |
| Crânes de cristal | Placé côté Amériques : les pièces sont à Londres et Washington, mais la légende est mésoaméricaine et la carte perdrait le sujet en Europe | ✅ `obj-cranes-cristal` en 20.4 / 47.5 |
| Durandal | Rocamadour (Lot, France) — pas Roncevaux : c'est là qu'était l'épée réelle | ✅ `obj-durandal` en 46.9 / 34.5 |
| Épée de Goujian | Hubei (Chine centrale) | ✅ `obj-goujian` en 73.8 / 35.9 |
| Épée de Montesiepi | Toscane (Sienne, Italie) | ✅ `obj-montesiepi` en 50.2 / 35.8 |
| Excalibur | Cornouailles / Somerset (sud-ouest de l'Angleterre) | ✅ `obj-excalibur` en 45.9 / 30.0 |
| Épées Ulfberht | Sud de la Scandinavie / Rhénanie (zone des lames retrouvées) | ✅ `obj-ulfberht` en 51.0 / 26.7 |
| Hameçon de Maui | Pacifique central — **collision à trancher** avec la mythologie polynésienne (voir `docs/plans/plan-carte-icones.md`) | ✅ `obj-hamecon-maui` en 94.5 / 69.1 |
| Honjo Masamune | Tokyo (Japon) — dernier emplacement connu | ✅ `obj-honjo-masamune` en 82.7 / 35.8 |
| Joyeuse | Paris (Louvre) | ✅ `obj-joyeuse` en 47.8 / 32.9 |
| Koh-i-Noor | Londres (Tour de Londres) — **et non l'Inde** : le contentieux de restitution est justement là | ✅ `obj-koh-i-noor` en 47.3 / 30.9 |
| Lance Sacrée | Vienne (Autriche) — l'exemplaire le mieux documenté des quatre | ✅ `obj-lance-sacree` en 49.5 / 33.4 |
| Ménorah du Second Temple | Rome (Italie) — arc de Titus, dernière trace | ✅ `obj-menorah` en 50.7 / 35.8 |
| Mere pounamu | Nouvelle-Zélande | ✅ `obj-mere-pounamu` en 89.3 / 82.8 |
| Mjöllnir | Danemark / sud de la Scandinavie (zone des amulettes retrouvées) | ✅ `obj-mjollnir` en 49.8 / 27.7 |
| Pierre de Scone | Édimbourg (Écosse) — depuis le retour de 1996 | ✅ `obj-pierre-scone` en 46.3 / 26.1 |
| Pierre du Soleil aztèque | Mexico (Musée national d'anthropologie) | ✅ `obj-pierre-soleil` en 20.4 / 48.6 |
| Regalia du Dahomey | Abomey (Bénin) — depuis la restitution de 2021 | ✅ `obj-regalia-dahomey` en 47.7 / 54.6 |
| Ruyi Jingu Bang | Chine centrale | ✅ `obj-ruyi-jingu-bang` en 75.8 / 36.6 |
| Saint Graal | Valence (Espagne) — relique la plus revendiquée ; alternative : Glastonbury | ✅ `obj-graal` en 46.9 / 37.6 |
| Sampo | Carélie (Finlande de l'Est) | ✅ `obj-sampo` en 54.6 / 21.3 |
| Sceau de jade impérial | Chine (Xi'an / plaine centrale) | ✅ `obj-sceau-jade` en 75.1 / 35.3 |
| Table Ronde | Winchester (sud de l'Angleterre) | ✅ `obj-table-ronde` en 46.4 / 31.0 |
| Tabouret d'or des Ashanti | Kumasi (Ghana) | ✅ `obj-tabouret-or` en 46.6 / 54.3 |
| Toison d'Or | Colchide (côte ouest de la Géorgie, mer Noire) | ✅ `obj-toison-or` en 57.3 / 34.8 |
| Trésor de Lobengula | Zimbabwe (ouest, Matabeleland) | ✅ `obj-tresor-lobengula` en 54.5 / 70.9 |
| Trésor de Moctezuma | Mexico (canaux de Tenochtitlan) | ✅ `obj-tresor-moctezuma` en 20.8 / 46.3 |
| Trésor des Templiers | France (Paris ou Rennes-le-Château selon la version — placer sur Paris) | ✅ `obj-tresor-templiers` en 47.6 / 33.7 |
| Trois Trésors impériaux du Japon | Japon (Ise / Nagoya / Tokyo — placer sur Ise) | ✅ `obj-tresors-japon` en 81.0 / 39.4 |
| Vajra | Tibet / Népal (Himalaya) | ✅ `obj-vajra` en 67.0 / 43.0 |
| Zulfiqar | Istanbul (Topkapı, Turquie) | ✅ `obj-zulfiqar` en 55.1 / 38.1 |

**Zones déjà denses à surveiller au placement** : l'Angleterre du Sud accumule Stonehenge,
Crop circles, Piltdown, Voynich (Italie), Table Ronde et Excalibur ; l'Italie du Nord
accumule Voynich, Suaire de Turin, Cités-États, Montesiepi et la Couronne de fer. Le
clustering de `map.html` gère la densité, mais deux pins à moins de ~0,4 % l'un de l'autre
deviennent indissociables même zoomés à fond — décaler légèrement plutôt que de superposer.
