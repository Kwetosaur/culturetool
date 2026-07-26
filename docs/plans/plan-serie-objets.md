# Plan de la série « Objets Légendaires du Monde »

## Point de départ

Cinquième série de la famille, aux côtés de « Mythologies du Monde », « Peuples & Cultures
du Monde », « Créatures Légendaires » et « Grands Mystères ». Sujet : les **objets** chargés
de légende — Excalibur, le Saint Graal, l'Arche d'Alliance, Mjöllnir, le Tabouret d'or des
Ashanti, les Trois Trésors impériaux du Japon.

La question centrale, propre à cette série : **où s'arrête le récit et où commence la
matière ?** Un objet légendaire a ceci de particulier qu'il peut être :

- purement littéraire (Excalibur : aucune épée n'a jamais existé, mais des dizaines
  d'épées réelles ont été présentées comme elle) ;
- réel mais dépourvu des pouvoirs qu'on lui prête (la Lance Sacrée de Vienne, datée du
  VIIIe siècle, exposée à Vienne) ;
- réel, ordinaire, et devenu politique par sa seule possession (la Pierre de Scone) ;
- réel et perdu, avec une chasse toujours ouverte (la Chambre d'Ambre) ;
- réel, jamais montré à personne, et d'autant plus puissant (Kusanagi).

Cette gradation est le cœur éditorial de la série : ce n'est pas « l'objet existe-t-il ? »
mais **« qu'est-ce qui existe, exactement, et qu'est-ce qu'on y a projeté ? »**

Chaque page reste un fichier autonome (`objet-XXX`), même famille visuelle que les autres
séries. C'est la **première série écrite avec le socle Astro** (voir
`docs/plans/plan-industrialisation.md`) : aucune page n'existe encore, donc aucun risque de
régression.

---

## Positionnement vis-à-vis des séries existantes

| Série | Objet du récit | Question posée |
|---|---|---|
| Mythologies | Un panthéon, une cosmologie | Que raconte cette culture sur le monde ? |
| Cultures | Un peuple, une civilisation | Comment ces gens vivaient-ils ? |
| Créatures | Un être | Existe-t-il ? |
| Mystères | Un lieu, un événement | Que s'est-il passé ? |
| **Objets** | **Une chose fabriquée** | **Qu'est-ce qui subsiste, et qui l'a voulu ?** |

**Chevauchements à ne pas créer** — trois objets appartiennent déjà à la série Mystères et
n'auront **pas** de page objet : le **Suaire de Turin**, le **Mécanisme d'Anticythère** (déjà
publié) et la **Batterie de Bagdad**. Leur intérêt est l'énigme, pas la légende attachée à
l'objet. Inversement, le **masque de Toutânkhamon** relève de la « malédiction » (Mystères).

Deux redondances sont en revanche **volontaires**, sur le modèle Égypte
mythologie + culture :

- **Mjöllnir** (objet) et `mythologie-nordique.html` (le marteau y est mentionné dans le
  panthéon) — la page objet traite les amulettes archéologiques réelles, la diffusion du
  motif, et la récupération identitaire contemporaine du symbole, ce que la page
  mythologie n'aborde pas.
- **La Toison d'Or** (objet) et `mythologie-grecque.html` — la page objet traite
  l'hypothèse de l'orpaillage à la peau de mouton en Colchide et l'ordre de chevalerie de
  1430, pas le récit des Argonautes.

---

## Structure (8 sections, ordre fixe)

1. **Hero** — nom de l'objet (et ses noms dans la langue d'origine), culture et époque,
   épigraphe, et un **badge de nature** visible dès le hero (voir plus bas). Le badge
   remplace le « badge de verdict » des séries Créatures/Mystères : la question n'est pas
   vrai/faux mais *quel genre de chose est-ce*.

2. **`#origine`** — première attestation **textuelle ou archéologique** datée, avec sa
   source nommée. Section la plus importante de la série pour l'honnêteté du reste : c'est
   ici qu'on établit qu'Excalibur apparaît chez Geoffroy de Monmouth (v. 1136) et non dans
   un texte celtique ancien, ou que le Graal naît chez Chrétien de Troyes (v. 1180) et
   n'est jamais mentionné dans les Évangiles. Distinguer systématiquement **l'ancienneté de
   l'objet** de **l'ancienneté du récit sur l'objet** — les deux sont très souvent séparés
   de plusieurs siècles, et c'est la confusion la plus fréquente sur ces sujets.

3. **`#description`** — forme, matière, dimensions, inscriptions telles que la tradition
   les rapporte, puis **pouvoirs attribués**. Rédigé en discours rapporté (« les textes lui
   prêtent… ») et non à l'affirmative. Quand plusieurs descriptions incompatibles existent
   (le Graal : coupe, pierre, plat, ciboire selon les auteurs), les donner toutes plutôt
   que d'en choisir une.

4. **`#recits`** — les grands récits où l'objet agit, en blocs longs (2-4 paragraphes),
   avec citations en exergue. C'est la section « plaisir de lecture » de la page, l'équivalent
   de `#legendes` côté mythologies. Le nombre de récits dépend du sujet, jamais d'un quota.

5. **`#facture`** — **section propre à cette série, et sa meilleure idée** : que dit la
   technique de ce *type* d'objet ? Métallurgie (fer météoritique, acier au creuset des
   lames Ulfberht, bronze inaltéré de l'épée de Goujian), orfèvrerie, taille de pierre,
   ébénisterie. On y répond à « une telle chose était-elle fabricable à cette époque, et
   comment ? » — même quand l'objet précis est introuvable. Pédagogiquement, c'est ce qui
   distingue cette série d'un simple catalogue de reliques : on apprend un savoir-faire
   réel à travers un objet imaginaire.

6. **`#traces`** — les **candidats matériels** et la chaîne de possession. Reliques
   concurrentes (quatre Lances Sacrées, une bonne dizaine de Graals), musées qui les
   exposent aujourd'hui, vols et disparitions documentés, datations quand elles existent.
   Une frise chronologique n'apparaît ici **que si l'objet a une vraie histoire de
   possession datée** (Pierre de Scone, Koh-i-Noor, Chambre d'Ambre) — jamais par défaut.

7. **`#culture-populaire`** — de la légende locale au phénomène mondial : littérature,
   cinéma, jeux vidéo, marques, tourisme. Toujours signaler quand la version grand public
   s'est éloignée de la source (le Graal « coupe de la Cène » est une fusion tardive, pas le
   texte de Chrétien de Troyes).

8. **`#verite`** — section pivot, l'équivalent du `#science` des autres séries. Ce qu'on
   peut affirmer aujourd'hui : datations, analyses, canulars démontrés avec leurs auteurs,
   consensus académique quand il existe. Si l'objet est une pure invention littéraire, le
   dire nettement — sans en faire un jugement sur ceux qui l'ont cherché.

9. **`#heritage`** — ce que l'objet **fait encore** : regalia et couronnements,
   revendications nationales, contentieux de restitution (Koh-i-Noor, trésors d'Aksoum),
   récupération idéologique de symboles (le marteau de Thor), économie touristique. Se
   termine par une **note de vigilance**, différente à chaque page, comme les pages
   mythologie.

*(8 sections + hero, comme les séries Créatures et Mystères.)*

---

## Badge de nature — les 5 valeurs autorisées

Un seul badge par page, choisi dans cette liste, et **justifiable dans `#verite`** :

| Badge | Sens | Exemples |
|---|---|---|
| **Objet de fiction** | Aucun original n'a jamais existé ; l'objet naît dans un texte | Excalibur, l'Anneau des Nibelungen, la Boîte de Pandore |
| **Objet mythologique** | Appartient à un corpus religieux/mythologique vivant ou ancien, sans prétention d'existence matérielle | Mjöllnir, le Vajra, l'hameçon de Maui |
| **Objet réel, pouvoirs légendaires** | La chose existe et se visite ; les vertus qu'on lui prête, non | Lance Sacrée de Vienne, Pierre de Scone, Couronne de fer |
| **Objet réel disparu** | Attesté par des sources fiables, puis perdu ; recherche ouverte | Chambre d'Ambre, Sceau de jade impérial, Honjo Masamune |
| **Relique contestée** | Plusieurs exemplaires concurrents ou authenticité débattue | Le Saint Graal, l'Arche d'Alliance, Zulfiqar |

Interdit : un badge qui tranche ce que les sources ne tranchent pas. En cas de doute réel,
« relique contestée » est la valeur honnête.

---

## Principes de fond

- **Séparer l'objet, le récit et la relique.** Trois choses différentes, souvent
  distantes de plusieurs siècles. Une page qui les confond n'a rien compris à son sujet.
  C'est la règle numéro un de cette série.
- **Ne jamais authentifier ni disqualifier une relique religieuse à la place des
  institutions concernées.** On rapporte les datations publiées et les positions
  officielles (y compris quand l'Église elle-même ne se prononce pas), on ne conclut pas
  au nom de la science sur un objet de dévotion vivante.
- **Respect des objets sacrés encore en usage.** Le Tabouret d'or des Ashanti n'est pas
  une curiosité : c'est un objet politique vivant dont une tentative de saisie a déclenché
  une guerre réelle en 1900. Zulfiqar est un symbole de dévotion pour des centaines de
  millions de personnes. Ces pages se traitent avec le même surcroît de prudence que les
  pages Wendigo/Skinwalker côté créatures. **Sujets volontairement écartés** de la liste
  pour cette raison : la Pierre Noire de la Kaaba, et toute relique dont la simple
  description photographique serait déjà un manque de respect.
- **Assumer les contentieux de restitution** plutôt que les contourner. Plusieurs objets de
  la série sont dans des musées occidentaux à la suite d'un pillage colonial documenté
  (trésors d'Aksoum, Koh-i-Noor). L'écrire factuellement, avec l'état actuel des demandes
  de retour, fait partie du sujet — ce n'est pas un hors-sujet militant.
- **Aucun chiffre imposé d'une page à l'autre** : le nombre de récits, de reliques
  concurrentes ou d'étapes de possession dépend du dossier réel.
- **La section `#facture` doit apprendre quelque chose de vrai.** C'est la garantie qu'une
  page sur un objet imaginaire n'est pas une page vide : même si Excalibur n'existe pas, la
  forge d'une épée de l'âge du fer, elle, s'explique.
- **Design adapté à la matière de l'objet**, pas à sa géographie : métal poli et étincelle
  de forge pour une épée, or et vitrail pour un calice, ambre et bois pour la Chambre
  d'Ambre, jade et laque pour les trésors chinois. C'est le principe visuel qui distingue la
  série des quatre autres (dont les palettes suivent la région).

---

## Effets (`docs/plans/plan-effets.md`)

**Stratégie de famille** : l'objet lui-même **se construit, se forge ou s'illumine** à
l'écran. Ni glyphes abstraits (mythologies), ni créature qui traverse (créatures), ni
décor d'ambiance (mystères) : un objet qui s'assemble. Le précédent existe déjà et
fonctionne — `antikytheraGears`, les engrenages qui s'assemblent et se mettent à tourner.

- `data-egg` sur `<body>`, `data-scroll-fx` sur **`#description`** (la section où l'objet
  est décrit) ou **`#facture`** (la section forge).
- Une piste par objet est proposée dans `docs/plans/plan-effets.md`, section « Objets à venir ».

**Le déchiffrement d'inscription (`fx-decode`) est autorisé et encouragé sur cette série**,
contrairement aux familles cultures/créatures/mystères — beaucoup de ces objets **portent
réellement une inscription** (les lames Ulfberht signées, la Couronne de fer, les sceaux
chinois). Le pool de glyphes doit correspondre à l'écriture réelle de l'objet, et
l'inscription déchiffrée doit être la vraie (ou son sens), pas un ornement inventé.

---

## Statut de la série

*(À alimenter à partir de `docs/listes/suite_objets.md`. Aucune page écrite au 26/07/2026.)*

| # | Objet | Statut |
|---|---|---|
| — | — | à démarrer |
