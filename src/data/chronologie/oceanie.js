import { build } from "./meta.js";

const ROWS = [
  // --- Guerres / Conflits ---
  [1843, "1843-1872", "guerre", "Guerres terrestres néo-zélandaises", "Ces conflits opposent des colons britanniques aux Maoris défendant leurs terres, notamment autour du mouvement politico-religieux Kingitanga."],
  [1915, "1915", "guerre", "Bataille de Gallipoli (ANZAC)", "Le débarquement australo-néo-zélandais dans les Dardanelles se solde par un échec militaire coûteux, mais forge un mythe fondateur de l'identité nationale des deux pays."],
  [1942, "1942", "guerre", "Bombardement de Darwin par le Japon", "La plus grande attaque étrangère jamais menée sur le sol australien fait plusieurs centaines de morts et révèle la vulnérabilité directe du continent à la guerre du Pacifique."],
  [1942, "1942-1943", "guerre", "Campagne de Guadalcanal", "Cette bataille prolongée entre forces alliées et japonaises pour le contrôle d'une île des Salomon marque un tournant majeur de la guerre du Pacifique."],
  [1962, "1962-1975", "guerre", "Engagement australien dans la guerre du Vietnam", "L'Australie envoie des troupes aux côtés des États-Unis, une participation qui devient de plus en plus controversée dans l'opinion publique australienne."],
  [1988, "1988-1998", "guerre", "Crise de Bougainville (Papouasie-Nouvelle-Guinée)", "Ce conflit séparatiste, lié à l'exploitation d'une mine de cuivre, fait des milliers de morts avant un accord de paix accordant une large autonomie à l'île."],
  [1868, "1868-1872", "guerre", "Guerre de Te Kooti en Nouvelle-Zélande", "Ce chef maori mène une campagne de guérilla contre les forces coloniales après son évasion d'un camp de déportation, devenant une figure de résistance controversée."],
  [1941, "1941-1945", "guerre", "Campagnes du Pacifique lors de la Seconde Guerre mondiale", "L'Australie et la Nouvelle-Zélande deviennent des bases arrière majeures des Alliés dans la lutte contre l'expansion japonaise dans le Pacifique."],
  [1942, "1942", "guerre", "Chute de Singapour, prisonniers australiens", "La reddition britannique de Singapour entraîne la capture de milliers de soldats australiens, dont beaucoup mourront en captivité japonaise, un traumatisme national durable."],
  [2003, "2003", "guerre", "Intervention régionale aux Îles Salomon (RAMSI)", "Une mission dirigée par l'Australie rétablit l'ordre après des années de tensions ethniques et l'effondrement des institutions de l'État salomonais."],

  // --- Inventions / Sciences ---
  [1770, "1770", "science", "Cartographie de la côte est australienne par James Cook", "Le capitaine Cook cartographie méthodiquement la côte orientale de l'Australie à bord de l'Endeavour, ouvrant la voie à la colonisation britannique."],
  [1606, "1606", "science", "Premier contact européen documenté avec l'Australie", "Le navigateur néerlandais Willem Janszoon aborde la côte du cap York, marquant la première rencontre européenne attestée avec le continent australien."],
  [1642, "1642", "science", "Abel Tasman découvre la Tasmanie et la Nouvelle-Zélande", "Cet explorateur néerlandais atteint des terres inconnues des Européens, qui prendront plus tard le nom de Tasmanie en son honneur."],
  [1974, "1974", "science", "Développement de techniques agricoles adaptées à l'aridité australienne", "Les recherches du CSIRO australien améliorent les rendements agricoles dans un continent marqué par une aridité et une variabilité climatique extrêmes."],

  // --- Politique / Culture ---
  [-65000, "-65000 (env.)", "politique", "Arrivée des premiers peuples aborigènes en Australie", "Ces populations développent la continuité culturelle la plus ancienne connue au monde, avec une relation spirituelle au territoire structurée par le Temps du Rêve."],
  [-1500, "-1500 à -500", "politique", "Expansion de la culture Lapita à travers le Pacifique", "Ces navigateurs, identifiables à leur poterie décorée caractéristique, sont les ancêtres directs des peuples polynésiens et colonisent un vaste espace océanique."],
  [300, "300-1200 (env.)", "politique", "Colonisation progressive des îles polynésiennes lointaines", "Sur près d'un millénaire, des navigateurs polynésiens atteignent et peuplent Hawaï, l'île de Pâques et enfin la Nouvelle-Zélande, sans instrument de navigation occidental."],
  [1000, "1000-1200", "politique", "Peuplement de la Nouvelle-Zélande par les Maoris", "Les derniers grands voyages de colonisation polynésienne atteignent les îles néo-zélandaises, alors inhabitées, où se développe une culture maorie distincte."],
  [1770, "1770", "politique", "Prise de possession britannique de l'Australie orientale par Cook", "Cook revendique formellement la côte est du continent au nom de la Couronne britannique, sans considération pour la souveraineté aborigène préexistante."],
  [1788, "1788", "politique", "Arrivée de la First Fleet, colonisation pénale de l'Australie", "Onze navires britanniques déposent environ mille bagnards à Sydney Cove, fondant la première colonie pénitentiaire européenne d'Australie."],
  [1840, "1840", "politique", "Traité de Waitangi", "Cet accord entre la Couronne britannique et des chefs maoris, aux traductions anglaise et maorie divergentes, reste le document fondateur contesté des relations coloniales néo-zélandaises."],
  [1901, "1901", "politique", "Fédération du Commonwealth d'Australie", "Six colonies britanniques distinctes s'unissent pour former un dominion fédéral autonome au sein de l'Empire britannique."],
  [1907, "1907", "politique", "Statut de dominion pour la Nouvelle-Zélande", "Ce statut confère à la Nouvelle-Zélande une autonomie accrue vis-à-vis de Londres, tout en conservant des liens étroits avec la Couronne."],
  [1975, "1975", "politique", "Indépendance de la Papouasie-Nouvelle-Guinée", "L'ancien territoire sous tutelle australienne accède à la pleine souveraineté, tout en conservant de nombreux liens économiques et politiques avec Canberra."],
  [1986, "1986", "politique", "Loi australienne rompant les derniers liens constitutionnels avec le Royaume-Uni", "L'Australia Act met fin aux derniers pouvoirs législatifs et judiciaires britanniques sur l'Australie, achevant un long processus d'autonomisation."],
  [2008, "2008", "politique", "Excuses officielles australiennes aux « générations volées » aborigènes", "Le Premier ministre Kevin Rudd présente des excuses officielles pour les politiques passées de retrait forcé d'enfants aborigènes de leurs familles."],
  [1946, "1946-1958", "politique", "Essais nucléaires américains dans les îles Marshall", "Les États-Unis procèdent à des dizaines d'essais nucléaires atmosphériques sur l'atoll de Bikini, provoquant contamination durable et déplacements forcés de populations."],
  [1962, "1962", "politique", "Indépendance du Samoa occidental", "Premier État insulaire du Pacifique à accéder à l'indépendance au XXe siècle, il ouvre la voie aux décolonisations océaniennes ultérieures."],
  [1970, "1970", "politique", "Indépendance des Fidji et des Tonga", "Ces deux archipels accèdent à la souveraineté la même année, Tonga restant l'une des rares monarchies indépendantes jamais colonisées du Pacifique."],
  [1978, "1978", "politique", "Indépendance des Îles Salomon", "L'ancien protectorat britannique du Pacifique Sud accède à l'indépendance, tout en conservant la monarchie britannique comme chef d'État symbolique."],
  [1980, "1980", "politique", "Indépendance du Vanuatu", "L'ancien condominium franco-britannique des Nouvelles-Hébrides devient un État souverain sous son nouveau nom."],
  [2017, "2017", "politique", "Référendum sur le mariage pour tous en Australie", "Une consultation postale non contraignante approuve largement le mariage homosexuel, ouvrant la voie à sa légalisation par le Parlement la même année."],

  // --- Grandes figures historiques ---
  [1728, "1728-1779", "figure", "James Cook, explorateur britannique du Pacifique", "Ses trois grands voyages cartographient une large part du Pacifique, de l'Australie à Hawaï, où il trouve la mort lors d'un affrontement avec des habitants."],
  [1770, "1770-1841", "figure", "Hongi Hika, chef maori influent lors des premiers contacts européens", "Ce chef guerrier acquiert des mousquets européens et mène des campagnes militaires qui bouleversent durablement les équilibres de pouvoir entre tribus maories."],
  [1917, "1917-1990", "figure", "Figures civiles et militaires australiennes de la Seconde Guerre mondiale", "Des personnalités comme l'infirmière Vivian Bullwinkel, survivante d'un massacre de prisonnières, incarnent l'expérience australienne du conflit dans le Pacifique."],
  [1927, "1927-2015", "figure", "Whina Cooper, militante des droits maoris en Nouvelle-Zélande", "Cette figure féminine du militantisme maori mène en 1975 une marche emblématique pour la reconnaissance des terres et des droits autochtones."],
  [1935, "1935-2021", "figure", "Eddie Mabo, militant aborigène", "Son combat judiciaire aboutit en 1992 à une décision historique de la Haute Cour australienne reconnaissant pour la première fois les droits fonciers autochtones (« native title »)."],

  // --- Catastrophes naturelles ---
  [1918, "1918-1919", "catastrophe", "Grippe espagnole dans les îles du Pacifique", "La pandémie mondiale frappe particulièrement durement certaines populations insulaires isolées, notamment aux Samoa occidentales, avec une mortalité proportionnellement très élevée."],
  [1974, "1974", "catastrophe", "Cyclone Tracy", "Ce cyclone détruit quasi totalement la ville de Darwin la nuit de Noël, forçant l'évacuation de la majorité de sa population et sa reconstruction complète."],
  [2009, "2009", "catastrophe", "« Samedi noir », feux de forêt dans l'État de Victoria", "Ces incendies exceptionnellement violents font 173 morts, le bilan le plus lourd jamais enregistré par des feux de brousse en Australie."],
  [2019, "2019-2020", "catastrophe", "Méga-feux de brousse en Australie (« Black Summer »)", "Une saison des feux d'une intensité inédite ravage des millions d'hectares et tue ou déplace des milliards d'animaux, ravivant le débat sur le changement climatique."],
  [2022, "2022", "catastrophe", "Éruption du volcan sous-marin Hunga Tonga-Hunga Haʻapai", "Cette explosion volcanique sous-marine, l'une des plus puissantes jamais enregistrées par instruments modernes, génère un tsunami régional et une onde de choc mesurée dans le monde entier."],
];

export default build("oc", ROWS);
