import { build } from "./meta.js";

/* [annee, libelle, categorie, titre, resume, region?]
   Region par defaut du fichier : "wo" (Monde / Transversal). Le 6e champ
   surcharge en "eu" (Europe) ou "ame" (Amerique moderne, post-1492) quand
   l'evenement est centre sur un continent precis plutot que veritablement
   transversal — decoupage demande pour eviter un fourre-tout "Monde" trop
   large (voir aussi -8000/-4000 reclasses en "mo", deja centres Croissant
   fertile / Mesopotamie). */
const ROWS = [
  // --- Guerres / Conflits ---
  [1347, "1347-1351", "guerre", "Peste noire (Asie, Moyen-Orient, Europe)", "Propagée depuis l'Asie centrale par les routes commerciales, cette pandémie de peste tue entre 30 et 60% de la population eurasiatique en quelques années."],
  [1914, "1914-1918", "guerre", "Première Guerre mondiale", "Le conflit industriel de tranchées, déclenché par l'assassinat de François-Ferdinand, fait environ dix-huit millions de morts et redessine la carte politique mondiale.", "eu"],
  [1939, "1939-1945", "guerre", "Seconde Guerre mondiale", "Le conflit le plus meurtrier de l'histoire humaine, marqué par la Shoah et l'arme nucléaire, fait entre 60 et 85 millions de morts."],
  [1947, "1947-1991", "guerre", "Guerre froide", "L'affrontement idéologique, économique et militaire indirect entre les blocs américain et soviétique structure les relations internationales pendant plus de quatre décennies."],
  [1962, "1962", "guerre", "Crise des missiles de Cuba", "La découverte de missiles soviétiques à Cuba amène le monde au bord de la guerre nucléaire pendant treize jours, avant un compromis négocié.", "ame"],
  [541, "541-750", "guerre", "Peste de Justinien", "Cette première pandémie documentée à grande échelle décime l'Empire byzantin et le bassin méditerranéen, affaiblissant durablement les ambitions de reconquête de Justinien.", "eu"],
  [1755, "1755", "guerre", "Tremblement de terre de Lisbonne", "Ce séisme majeur, suivi d'un tsunami et d'incendies, provoque un choc philosophique européen qui nourrit le débat entre rationalisme des Lumières et providence divine.", "eu"],
  [1898, "1898", "guerre", "Guerre hispano-américaine", "La défaite espagnole marque l'émergence des États-Unis comme puissance impériale mondiale et la fin des derniers grands restes de l'empire colonial espagnol.", "ame"],
  [1991, "1991-présent", "guerre", "Multiplication des conflits post-Guerre froide", "La fin de l'ordre bipolaire libère des tensions ethniques et nationalistes longtemps contenues, des guerres de Yougoslavie au génocide rwandais."],

  // --- Inventions / Sciences ---
  [-10000, "-10000", "science", "Révolution néolithique", "Le passage progressif de sociétés de chasseurs-cueilleurs à des sociétés agricoles sédentaires transforme radicalement l'organisation sociale humaine dans plusieurs foyers indépendants du monde."],
  [-3500, "-3500", "science", "Invention de la roue", "Apparue quasi simultanément dans plusieurs régions d'Eurasie, cette invention transforme durablement le transport, l'artisanat et l'agriculture."],
  [-3000, "-3000", "science", "Débuts de la métallurgie du bronze", "L'alliage du cuivre et de l'étain donne naissance à des outils et armes plus résistants, marquant l'entrée de nombreuses sociétés dans l'âge du bronze."],
  [1445, "1445 (env.)", "science", "Imprimerie à caractères mobiles métalliques de Gutenberg", "Cette invention européenne démocratise la production de livres et accélère considérablement la diffusion des idées, de la Réforme à la révolution scientifique.", "eu"],
  [1957, "1957", "science", "Lancement de Spoutnik", "Ce premier satellite artificiel soviétique inaugure l'ère spatiale et déclenche une intense course technologique et symbolique avec les États-Unis."],
  [1969, "1969", "science", "Premier pas de l'Homme sur la Lune", "La mission Apollo 11 permet à Neil Armstrong et Buzz Aldrin de fouler le sol lunaire, un sommet symbolique de la rivalité spatiale de la guerre froide."],
  [1991, "1991", "science", "Mise en service publique du World Wide Web", "L'invention de Tim Berners-Lee, d'abord conçue pour les besoins du CERN, devient accessible au public et transforme radicalement la communication mondiale.", "eu"],
  [2020, "2020", "science", "Développement accéléré des vaccins ARNm", "Face à la pandémie de Covid-19, cette technologie vaccinale, en préparation depuis des décennies, est validée et déployée à une vitesse sans précédent dans l'histoire médicale."],
  [-8000, "-8000", "science", "Domestication généralisée des céréales dans le Croissant fertile", "Blé, orge et légumineuses sont progressivement domestiqués au Proche-Orient, posant les bases agricoles des premières civilisations urbaines.", "mo"],
  [-4000, "-4000", "science", "Débuts de l'écriture proto-cunéiforme", "Les premiers signes comptables tracés sur argile en Mésopotamie évoluent progressivement vers une écriture complète, capable de noter le langage parlé.", "mo"],
  [1543, "1543", "science", "Copernic publie le modèle héliocentrique", "Son ouvrage Des révolutions des orbes célestes propose un système où la Terre tourne autour du Soleil, bouleversant durablement la cosmologie occidentale.", "eu"],
  [1859, "1859", "science", "Publication de « L'Origine des espèces » de Darwin", "Sa théorie de l'évolution par sélection naturelle transforme radicalement la compréhension scientifique du vivant et suscite d'intenses controverses religieuses et sociales.", "eu"],
  [1928, "1928", "science", "Découverte de la pénicilline par Fleming", "Cette découverte accidentelle ouvre l'ère des antibiotiques modernes, sauvant depuis des dizaines de millions de vies humaines.", "eu"],
  [1945, "1945", "science", "Premier essai nucléaire (Trinity)", "Ce premier essai américain dans le désert du Nouveau-Mexique inaugure l'ère atomique, quelques semaines avant les bombardements d'Hiroshima et Nagasaki.", "ame"],
  [1953, "1953", "science", "Découverte de la structure de l'ADN", "Watson, Crick, Franklin et Wilkins révèlent la structure en double hélice de la molécule support de l'hérédité, fondant la biologie moléculaire moderne.", "eu"],
  [1996, "1996", "science", "Naissance de Dolly, premier mammifère cloné", "Cette brebis clonée à partir d'une cellule adulte prouve la possibilité du clonage reproductif chez les mammifères, ouvrant d'intenses débats éthiques.", "eu"],
  [2003, "2003", "science", "Achèvement du séquençage du génome humain", "Le Human Genome Project livre une carte quasi complète de l'ADN humain, ouvrant une nouvelle ère de médecine génomique et personnalisée."],
  [2022, "2022", "science", "Diffusion massive des IA génératives grand public", "Des outils capables de générer texte et images à la demande deviennent accessibles à des centaines de millions d'utilisateurs, bouleversant de nombreux secteurs économiques."],

  // --- Politique / Culture ---
  [-100, "Ier siècle av. J.-C.", "politique", "Diffusion du bouddhisme le long de la route de la soie", "Les échanges commerciaux transcontinentaux permettent la diffusion progressive du bouddhisme indien vers l'Asie centrale, la Chine, puis le Japon et la Corée."],
  [1492, "1492", "politique", "Arrivée de Christophe Colomb, début de l'échange colombien", "Ce contact initie un vaste transfert biologique et culturel entre les deux hémisphères, transformant durablement l'agriculture, les populations et les écosystèmes du monde entier.", "ame"],
  [1500, "1500-1800", "politique", "Essor du commerce triangulaire mondial", "Ce système commercial reliant Europe, Afrique et Amériques repose sur la traite négrière et l'exploitation coloniale des matières premières et du travail forcé."],
  [1789, "1789", "politique", "Révolution française", "Au-delà de la France, ses idéaux de liberté, d'égalité et de souveraineté populaire influencent durablement les mouvements politiques du monde entier.", "eu"],
  [1918, "1918-1919", "politique", "Pandémie de grippe espagnole", "Cette pandémie mondiale, survenue à la fin de la Première Guerre mondiale, fait environ cinquante millions de morts, davantage que le conflit lui-même."],
  [1929, "1929", "politique", "Krach de Wall Street", "L'effondrement boursier américain déclenche la Grande Dépression, une crise économique mondiale qui favorisera la montée des régimes autoritaires en Europe.", "ame"],
  [1945, "1945", "politique", "Fondation de l'ONU", "Créée au lendemain de la Seconde Guerre mondiale, l'Organisation des Nations unies vise à prévenir de futurs conflits mondiaux et à favoriser la coopération internationale."],
  [1948, "1948", "politique", "Déclaration universelle des droits de l'homme", "Adoptée par l'Assemblée générale de l'ONU, elle établit un socle de droits fondamentaux censés s'appliquer à tous les êtres humains, sans valeur juridique contraignante directe."],
  [1955, "1955", "politique", "Conférence de Bandung", "Vingt-neuf pays d'Asie et d'Afrique récemment ou bientôt indépendants posent les bases idéologiques du futur « Tiers-Monde » et du non-alignement."],
  [1961, "1961", "politique", "Fondation du Mouvement des non-alignés", "Porté par des figures comme Nehru, Nasser et Tito, ce mouvement rassemble des pays refusant de s'aligner sur l'un ou l'autre bloc de la guerre froide."],
  [1991, "1991", "politique", "Dissolution de l'URSS", "L'implosion de l'Union soviétique met fin à la guerre froide et redessine radicalement la carte politique de l'Eurasie.", "eu"],
  [1995, "1995", "politique", "Fondation de l'OMC", "L'Organisation mondiale du commerce succède au GATT et institutionnalise un cadre juridique multilatéral pour les échanges commerciaux mondiaux."],
  [2015, "2015", "politique", "Accord de Paris sur le climat", "Cet accord international engage la quasi-totalité des pays du monde à limiter le réchauffement climatique, sans mécanisme de sanction contraignant."],
  [2019, "2019-2023", "politique", "Pandémie de COVID-19", "Cette pandémie mondiale bouleverse l'économie, la santé publique et les modes de vie de milliards de personnes, faisant plusieurs millions de morts recensés."],
  [-300, "-300 à 1500", "politique", "Essor et déclin des grandes routes commerciales", "Route de la soie, routes transsahariennes et routes maritimes de l'océan Indien relient pendant près de deux millénaires les grandes civilisations d'Eurasie et d'Afrique."],
  [1494, "1494", "politique", "Traité de Tordesillas", "Sous l'arbitrage du pape, l'Espagne et le Portugal se partagent par avance les terres du Nouveau Monde le long d'une ligne de démarcation.", "eu"],
  [1600, "1600-1900", "politique", "Expansion des grandes compagnies à charte", "Des sociétés comme la Compagnie des Indes orientales, dotées de pouvoirs quasi étatiques, deviennent les instruments privilégiés de la colonisation et du commerce mondial européen."],
  [1815, "1815", "politique", "Congrès de Vienne", "Les grandes puissances européennes réorganisent l'ordre continental après les guerres napoléoniennes, posant les bases d'un siècle relatif de stabilité diplomatique.", "eu"],
  [1919, "1919", "politique", "Traité de Versailles", "Ce traité impose des conditions très dures à l'Allemagne vaincue et crée la Société des Nations, tout en semant les germes de futurs ressentiments nationalistes.", "eu"],
  [1944, "1944", "politique", "Accords de Bretton Woods", "Ces accords instaurent un nouveau système monétaire international et créent le FMI et la Banque mondiale, structurant l'économie mondiale de l'après-guerre."],
  [1949, "1949", "politique", "Fondation de l'OTAN", "Cette alliance militaire occidentale, née de la tension croissante avec l'URSS, structure la défense collective du bloc occidental pendant la guerre froide.", "eu"],
  [1955, "1955", "politique", "Fondation du Pacte de Varsovie", "Cette alliance militaire du bloc de l'Est, réponse directe à l'OTAN, structure la défense collective soviétique jusqu'à sa dissolution en 1991.", "eu"],
  [1989, "1989", "politique", "Chute du mur de Berlin", "La chute du symbole le plus visible de la division du monde en blocs marque la fin symbolique de la guerre froide et précède de deux ans la dissolution de l'URSS.", "eu"],
  [2001, "2001", "politique", "Attentats du 11 septembre", "Les attaques d'Al-Qaïda contre les tours jumelles de New York et le Pentagone déclenchent la « guerre contre le terrorisme » et deux décennies d'interventions militaires occidentales.", "ame"],
  [2008, "2008", "politique", "Crise financière mondiale", "L'effondrement du marché des subprimes américains déclenche une crise économique mondiale majeure, la plus grave depuis la Grande Dépression.", "ame"],
  [2016, "2016", "politique", "Multiplication des mouvements populistes et référendums majeurs", "Le référendum du Brexit et d'autres scrutins similaires traduisent une vague mondiale de contestation des élites politiques et économiques établies.", "eu"],

  // --- Grandes figures historiques ---
  [1451, "1451-1506", "figure", "Christophe Colomb, navigateur ayant relié l'Ancien et le Nouveau Monde", "Convaincu d'avoir atteint l'Asie par l'ouest, il ouvre sans le savoir la voie à la colonisation européenne des Amériques.", "ame"],
  [1473, "1473-1543", "figure", "Nicolas Copernic, fondateur de l'héliocentrisme moderne", "Chanoine et astronome polonais, il propose un modèle où la Terre tourne autour du Soleil, bouleversement scientifique publié à la fin de sa vie seulement.", "eu"],
  [1809, "1809-1882", "figure", "Charles Darwin, théoricien de l'évolution", "Son voyage à bord du Beagle et ses observations naturalistes le conduisent à formuler la théorie de la sélection naturelle, fondement de la biologie moderne.", "eu"],
  [1867, "1867-1934", "figure", "Marie Curie, pionnière de la recherche sur la radioactivité", "Seule personne à avoir reçu deux prix Nobel dans deux disciplines scientifiques différentes, elle meurt des suites de son exposition aux radiations qu'elle a contribué à découvrir.", "eu"],
  [1879, "1879-1955", "figure", "Albert Einstein, physicien de la relativité", "Ses théories de la relativité restreinte et générale transforment radicalement la physique moderne et la compréhension de l'espace, du temps et de la gravitation.", "eu"],
  [1929, "1929-1968", "figure", "Martin Luther King, figure mondiale des droits civiques", "Chef de file du mouvement pour les droits civiques afro-américains, prônant la non-violence, il est assassiné en 1968, devenant un symbole mondial de la lutte contre la ségrégation.", "ame"],

  // --- Catastrophes naturelles ---
  [-1600, "-1600 (env.)", "catastrophe", "Éruption du Santorin", "Cette explosion volcanique majeure dans les Cyclades affecte le climat régional et est associée par certains chercheurs au déclin de la civilisation minoenne.", "eu"],
  [79, "79", "catastrophe", "Éruption du Vésuve", "L'éruption ensevelit Pompéi et Herculanum sous les cendres, offrant paradoxalement une préservation archéologique exceptionnelle de la vie romaine quotidienne.", "eu"],
  [1347, "1347-1351", "catastrophe", "Peste noire", "Cette pandémie, la plus meurtrière connue en proportion de population, tue entre 30 et 60% des habitants de l'Eurasie en quelques années seulement."],
  [1815, "1815", "catastrophe", "Éruption du Tambora", "La plus puissante éruption volcanique de l'histoire moderne provoque famines et refroidissement climatique mondial, dont « l'année sans été » de 1816."],
  [1918, "1918-1919", "catastrophe", "Pandémie de grippe espagnole", "Cette pandémie mondiale, propagée notamment par les mouvements de troupes de la Première Guerre mondiale, fait jusqu'à cinquante millions de morts."],
  [2004, "2004", "catastrophe", "Tsunami de l'océan Indien", "Ce tsunami, déclenché par un séisme sous-marin au large de Sumatra, fait environ 230 000 morts dans une dizaine de pays riverains de l'océan Indien."],
  [2019, "2019-2023", "catastrophe", "Pandémie de COVID-19", "Cette pandémie mondiale de coronavirus fait plusieurs millions de morts recensés et provoque la crise sanitaire, sociale et économique la plus large depuis un siècle."],
];

export default build("wo", ROWS);
