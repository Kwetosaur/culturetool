import { build } from "./meta.js";

const ROWS = [
  // --- Guerres / Conflits ---
  [1428, "1428-1521", "guerre", "Expansion militaire de la Triple Alliance aztèque", "Tenochtitlan, Texcoco et Tlacopan mènent des campagnes militaires constantes pour soumettre et prélever tribut sur la quasi-totalité du centre du Mexique."],
  [1438, "1438-1533", "guerre", "Expansion militaire de l'empire inca", "En un peu moins d'un siècle, les Incas conquièrent par la force et l'alliance un territoire andin de plus de 4000 km de long."],
  [1519, "1519-1521", "guerre", "Conquête de l'empire aztèque par Cortés", "Hernán Cortés, aidé de milliers d'alliés indigènes hostiles aux Aztèques et favorisé par les épidémies européennes, renverse Tenochtitlan en deux ans."],
  [1532, "1532-1533", "guerre", "Conquête de l'empire inca par Pizarro", "Francisco Pizarro capture et exécute l'empereur Atahualpa après l'avoir rançonné d'une salle remplie d'or, précipitant l'effondrement rapide de l'empire inca."],
  [1680, "1680", "guerre", "Révolte des Pueblos contre les Espagnols", "Les peuples pueblos du Nouveau-Mexique chassent temporairement les colons espagnols dans l'un des soulèvements autochtones les plus réussis d'Amérique du Nord coloniale."],
  [900, "900-1200", "guerre", "Guerres et effondrement des cités mayas classiques", "Les cités mayas du sud connaissent un effondrement politique et démographique progressif, lié à des guerres endémiques entre cités rivales et à des crises environnementales."],
  [1487, "1487", "guerre", "Sacrifices massifs pour l'inauguration du Templo Mayor", "Les chroniques rapportent des sacrifices humains à grande échelle lors de la consécration du grand temple de Tenochtitlan, illustrant la centralité rituelle de la guerre aztèque."],
  [1531, "1531-1572", "guerre", "Résistance inca de Vilcabamba", "Un État inca replié en résistance dans la jungle andine survit quarante ans après la chute de Cuzco, jusqu'à l'exécution du dernier souverain, Tupac Amaru."],

  // --- Inventions / Sciences ---
  [-1500, "-1500", "science", "Calendrier olmèque, prémices du calendrier mésoaméricain", "La civilisation olmèque développe des systèmes calendaires et numériques qui influenceront directement les Mayas et l'ensemble de la Mésoamérique."],
  [250, "250-900", "science", "Apogée scientifique et astronomique des Mayas", "Les astronomes-prêtres mayas développent une écriture logo-syllabique complète et des calculs calendaires d'une précision remarquable, notamment sur les cycles vénusiens."],
  [1000, "1000 (env.)", "science", "Système de quipus inca", "Ce dispositif de cordelettes nouées de couleurs et de longueurs variées sert de comptabilité et de mémoire administrative dans un empire dépourvu d'écriture."],
  [1400, "1400s", "science", "Terrasses agricoles et réseau routier inca", "Le Qhapaq Ñan relie sur environ 40 000 km l'ensemble de l'empire à travers les Andes, tandis que des terrasses en gradins permettent l'agriculture en altitude."],
  [-2500, "-2500", "science", "Domestication du maïs en Mésoamérique", "La sélection progressive de la téosinte sauvage aboutit au maïs cultivé, qui deviendra la base alimentaire de toutes les civilisations mésoaméricaines."],
  [-500, "-500", "science", "Écriture zapotèque", "Développée dans la région de Monte Albán, cette écriture figure parmi les plus anciennes connues des Amériques, antérieure à celle des Mayas."],
  [1450, "1450 (env.)", "science", "Construction du Machu Picchu", "Cette cité royale inca de haute montagne, bâtie sous l'empereur Pachacutec, allie prouesse architecturale, terrasses agricoles et alignement astronomique précis."],

  // --- Politique / Culture ---
  [-1200, "-1200", "politique", "Civilisation olmèque, « culture mère » mésoaméricaine", "Connue pour ses gigantesques têtes de basalte sculptées, cette première grande civilisation du Mexique influence toutes les cultures mésoaméricaines ultérieures."],
  [-100, "-100 à 700", "politique", "Cité-État de Teotihuacan", "Cette métropole gigantesque du centre du Mexique, dont l'identité ethnique reste incertaine, compte jusqu'à 125 000 habitants et influence culturellement toute la région."],
  [250, "250-900", "politique", "Civilisation maya classique", "Un ensemble de cités-États rivales (Tikal, Copán, Palenque) développe une culture raffinée d'écriture, d'astronomie et d'architecture monumentale en pleine forêt tropicale."],
  [1325, "1325", "politique", "Fondation de Tenochtitlan", "Selon la légende, les Mexicas fondent leur capitale sur une île du lac Texcoco à l'endroit où un aigle dévore un serpent perché sur un cactus."],
  [1438, "1438", "politique", "Expansion de l'empire inca sous Pachacutec", "Ce souverain réformateur transforme un petit royaume régional en un empire structuré, le Tawantinsuyu, le plus vaste jamais bâti dans les Andes précolombiennes."],
  [1492, "1492", "politique", "Arrivée de Christophe Colomb", "Le premier contact durable entre les mondes américain et européen déclenche l'échange colombien et, à terme, la colonisation et l'effondrement démographique des sociétés autochtones."],
  [1533, "1533", "politique", "Chute définitive de l'empire inca", "Après l'exécution d'Atahualpa et la prise de Cuzco, l'autorité impériale inca s'effondre définitivement face à la conquête espagnole."],
  [-1000, "-1000", "politique", "Civilisation Chavín au Pérou", "Ce centre religieux andin, connu pour son iconographie féline complexe, exerce une influence culturelle et artistique majeure sur les Andes centrales."],
  [100, "100-800", "politique", "Civilisation Moche (côte péruvienne)", "Célèbre pour sa céramique portrait et ses pyramides de brique crue (huacas), cette culture développe une administration hydraulique sophistiquée sur la côte désertique péruvienne."],
  [600, "600-1000", "politique", "Civilisation Wari (Pérou)", "Premier grand empire expansionniste andin avant les Incas, il développe un réseau routier et administratif que les Incas reprendront et amplifieront plus tard."],
  [900, "900-1533", "politique", "Civilisation chimú (précédant les Incas)", "Centrée sur la vaste cité de terre crue de Chan Chan, cette civilisation côtière est conquise et absorbée par l'empire inca en expansion peu avant l'arrivée espagnole."],
  [1000, "1000-1521", "politique", "Civilisation post-classique maya (Chichén Itzá, Mayapán)", "Après l'effondrement des cités classiques du sud, le pouvoir maya se déplace vers le Yucatán, avec une influence toltèque marquée à Chichén Itzá."],
  [1428, "1428", "politique", "Formation de la Triple Alliance aztèque", "Tenochtitlan, Texcoco et Tlacopan s'unissent contre le pouvoir dominant d'Azcapotzalco, fondant l'alliance qui deviendra l'empire aztèque."],

  // --- Grandes figures historiques ---
  [1398, "1398-1472", "figure", "Nezahualcóyotl, roi-poète de Texcoco", "Souverain, ingénieur hydraulique et poète nahuatl reconnu, il incarne une figure intellectuelle rare parmi les dirigeants mésoaméricains précolombiens."],
  [1440, "1440-1469", "figure", "Moctezuma Ier, empereur aztèque conquérant", "Ce souverain consolide et étend considérablement les conquêtes de la Triple Alliance, posant les bases de la puissance impériale aztèque."],
  [1438, "1438-1471", "figure", "Pachacutec, fondateur de la puissance de l'empire inca", "Considéré comme le véritable architecte de l'empire inca, il réforme l'administration, l'armée et la religion, transformant un royaume régional en empire continental."],
  [1466, "1466-1520", "figure", "Moctezuma II, dernier empereur aztèque de plein exercice", "Il règne au moment de l'arrivée de Cortés et meurt dans des circonstances contestées pendant l'occupation espagnole de Tenochtitlan."],
  [1502, "1502-1533", "figure", "Atahualpa, dernier empereur inca souverain", "Vainqueur d'une guerre civile contre son frère Huascar, il est capturé et exécuté par Pizarro malgré le paiement d'une rançon colossale, marquant la fin de l'empire inca indépendant."],

  // --- Catastrophes naturelles ---
  [536, "536", "catastrophe", "Catastrophe climatique globale", "Une éruption volcanique majeure obscurcit le ciel pendant plus d'un an, provoquant un refroidissement mondial dont l'impact se fait sentir jusque sur les civilisations mésoaméricaines."],
  [800, "800-1000 (env.)", "catastrophe", "Sécheresses prolongées et déclin des cités mayas classiques", "Des études paléoclimatiques montrent une série de sécheresses sévères coïncidant avec l'effondrement politique et démographique des grandes cités mayas du sud."],
  [1600, "1600", "catastrophe", "Éruption du Huaynaputina (Pérou)", "La plus forte éruption volcanique historique des Andes provoque des retombées de cendres considérables et des perturbations climatiques régionales durables."],
];

export default build("am", ROWS);
