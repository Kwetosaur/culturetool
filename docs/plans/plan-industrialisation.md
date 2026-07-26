# Plan d'industrialisation — réduire le coût de rédaction d'une page

**Révision 2 (26/07/2026).** La première version de ce plan proposait de migrer les 29
pages existantes vers des composants Astro, puis d'écrire les pages suivantes avec les
composants ainsi extraits. Cette révision **inverse l'ordre** et **corrige une prémisse
fausse** de la version 1, après mesure dans le code. L'objectif reste le même : qu'écrire
une nouvelle page coûte le moins de jetons possible, en lecture comme en écriture.

Historique : vague 1 = gabarits légers (`docs/gabarit-*.html`) + `tools/add_page.py`,
qui ont réduit le coût de **lecture** (~20-25 %) sans toucher au coût d'**écriture**.

---

## 1. Ce qui coûte vraiment des jetons — mesuré, pas estimé

Mesure sur 4 pages représentatives (taille du `<head>` avec son `<style>`, du bloc
`<nav id="side-menu">` et des `<script>` inline, comparée à la taille totale du fichier) :

| Page | Taille | Ossature (head+CSS+menu+scripts) | Part d'ossature |
|---|---|---|---|
| `mystere-anticythere.html` | 43 ko | 20 ko | **48 %** |
| `creature-mothman.html` | 41 ko | 20 ko | **52 %** |
| `culture-mali.html` | 71 ko | 21 ko | **30 %** |
| `mythologie-chinoise.html` | 85 ko | 19 ko | **23 %** |

L'ossature est **constante à ~20 ko par page** quelle que soit la famille. C'est autant
de texte que l'agent de rédaction produit à chaque fois sans que ça apporte un mot de
contenu — entre un quart et la moitié du fichier. À ~3 caractères par jeton, c'est
**~6 à 7 k jetons de sortie gaspillés par page**, plus le coût d'entrée de la lecture du
gabarit (~30 ko, soit ~10 k jetons) pour retrouver ce patron.

Deuxième gisement, moins visible : dans les 50-77 % de « contenu », une bonne part est
l'emballage HTML répété autour du texte. Une carte de figure = ~10 lignes de balises pour
3 lignes de texte utile. Un tableau de données + `{items.map(...)}` supprime cet
emballage.

**Objectif chiffré du chantier** : passer de ~43 ko de texte produit pour une page courte
à ~18-20 ko, et de ~85 ko à ~45-50 ko pour une page mythologie. Soit **-50 % environ en
sortie, et -80 % en lecture de gabarit**.

## 2. La prémisse fausse de la version 1

La version 1 affirmait : *« ~250 lignes de CSS quasi identiques recopiées dans chacune des
29 pages »*, et en déduisait qu'il suffisait d'extraire ce CSS dans un `tokens.css`
partagé.

Vérification (diff ligne à ligne des `<style>` de `docs/gabarits/gabarit-mystere.html` et
`docs/gabarits/gabarit-creature.html`, 196 et 194 lignes) : **77 lignes seulement sont strictement
identiques, soit 39 %**. Entre `gabarit-mystere` et `gabarit-culture` : 49 lignes, 25 %.

Le CSS n'est pas dupliqué. Il est **structurellement parallèle et lexicalement divergent**.
Les mêmes concepts portent des noms différents d'une famille à l'autre :

| Concept | Mythologie / Mystère | Créature | Culture |
|---|---|---|---|
| Couleur d'accent principale | `--gold` / `--gold-bright` | `--brass` / `--brass-bright` | `--gold` |
| Couleur d'accent secondaire | `--ink-bright`, `--verdict` | `--blood` / `--blood-bright` | variable |
| Texte à fort contraste | `--ink`, `--cream` | `--parchment` | `--cream` |
| Carte courte générique | `.fact-card` | `.info-card` | `.life-card`, `.region-card` |
| Théorie / hypothèse | `.theory-card` (grille 150px+1fr) | `.theory-block` (barre latérale) | — |
| Bande décorative de section | `.wave-strip` | `.fog-strip` | `.crest-badge` |

**Conséquence directe sur la conception** : on ne peut pas extraire un composant partagé
au-dessus de ce vocabulaire sans que chaque composant hérite d'un paramètre par famille —
exactement la sur-abstraction que la version 1 identifiait comme le principal risque. La
divergence doit être réglée *avant*, ou contournée.

C'est aussi ce qui rend la migration des pages existantes beaucoup plus chère qu'annoncé :
migrer, ce n'est pas déplacer du CSS identique, c'est **renommer le vocabulaire de chaque
page** en vérifiant qu'aucun rendu ne bouge.

## 3. Le renversement : les pages neuves d'abord

La version 1 elle-même notait que *« le gain se matérialise sur les pages futures, pas sur
celles déjà en ligne »* — et proposait quand même de commencer par migrer les pages en
ligne. C'est l'ordre qui est faux, pas le constat.

**Nouvel ordre :**

1. Construire le socle (layout + composants + vocabulaire normalisé) **sans toucher à
   aucune page existante**.
2. L'éprouver sur une **famille neuve** : « objets légendaires », créée dans le même lot,
   qui n'a aucune page en ligne — donc **aucun risque de régression, aucune parité visuelle
   à tenir**.
3. Écrire les pages suivantes de toutes les familles avec le socle.
4. Migrer les 29 pages existantes **seulement si** le socle a fait la preuve de son
   confort sur 3-4 pages neuves — et famille par famille, jamais en masse.

Avantages par rapport à l'ordre initial :

- Le gain de jetons arrive **dès la première page neuve**, pas après 29 migrations.
- La granularité des composants se décide sur une famille dont on écrit le contenu en même
  temps — on voit tout de suite quel composant est trop rigide, sans devoir *aussi*
  reproduire un rendu existant au pixel.
- La migration devient une **option** au lieu d'un préalable. Si le socle ne convainc pas,
  on a perdu un socle, pas 29 pages.
- Le vocabulaire normalisé est défini sur du neuf, où il ne se heurte à aucun héritage.

## 4. Ce qui NE change PAS

- **`effects.js`** — JS vanilla bien factorisé, partagé, sans dépendance de framework, et
  dont l'audit a confirmé l'intégrité du câblage (aucune clé morte ni manquante). Aucune
  raison de le toucher. Les pages Astro l'incluent exactement comme les pages statiques.
- **`map.html`** — artefact interactif spécifique (canvas, zoom/pan, clustering), reste en
  HTML/JS vanilla dans `public/`. Mauvais candidat à la componentisation.
- **Le contenu narratif long** (`legend-block`, `story-block`, `#science`, `#theories`) —
  reste rédigé comme du contenu dans un slot libre, jamais forcé dans une structure de
  données. Le piège à éviter reste le même : un composant qui accumule 15 props d'exception
  pour caser une page bavarde.
- **Les 29 pages statiques existantes** — elles continuent de vivre dans `public/` et
  d'être servies telles quelles. Le socle ne les concerne pas.

## 5. Architecture cible

```
src/
  layouts/
    PageLayout.astro       # <head> (+ balises og:), fonts, tokens.css, palette injectee,
                           # #side-menu genere depuis data/site-pages.json, sticky-nav,
                           # scroll-spy/reveal genere depuis les classes reellement
                           # presentes (fin du bug A2 de l'audit), footer, effects.js
  components/
    HeroHeader.astro       # epigraphe + titre + sous-titre + tagline + badge de verdict
    Section.astro          # <section id> + label + titre + intro + data-scroll-fx + slot
    InfoCard.astro         # carte courte generique (ex-fact-card / info-card / life-card)
    FigureCard.astro       # fiche nommee avec role + tags + corps (ex-god-card/figure-card)
    StoryBlock.astro       # bloc narratif long + pull-quote (ex-legend-block/story-block)
    Timeline.astro         # frise + items
    TheoryCard.astro       # hypothese + niveau de fiabilite (consensus/plausible/folklore)
    ScienceBlock.astro     # bloc de section pivot numerote
    HeritageBlock.astro    # bloc d'heritage + note de vigilance
    PullQuote.astro  CautionBox.astro  Decode.astro
  styles/
    tokens.css             # vocabulaire normalise : structure, grilles, cartes, frise
  pages/
    objet/<slug>.astro     # premiere famille ecrite avec le socle
    socle-demo.astro       # demo de tous les composants — sert de reference de lecture
    index.astro
public/
    (les 29 pages statiques, icons/, map.jpg, effects.js, map.html — inchanges)
```

**Vocabulaire normalisé** (une seule série de noms, quelle que soit la famille) :

| Rôle | Nom | Remplace |
|---|---|---|
| Fond de page / fond profond | `--bg`, `--bg-deep` | idem (déjà commun) |
| Surface de carte / variante | `--surface`, `--surface-alt` | `--panel`, `--panel-alt` |
| Bordure | `--border` | `--panel-border` |
| Accent principal | `--accent`, `--accent-bright` | `--gold`, `--brass` |
| Accent secondaire | `--accent2`, `--accent2-bright` | `--blood`, `--ink-bright`, `--moss` |
| Texte fort / courant / atténué | `--ink`, `--text`, `--text-dim` | `--parchment`, `--cream`, `--ink` |
| Verdict (familles d'enquête) | `--verdict`, `--verdict-bright` | idem |
| Halo | `--glow` | idem |

Une page ne fournit que ces ~14 valeurs. Tout le reste (grilles, espacements, frise,
cartes, sticky-nav, responsive) vit une seule fois dans `tokens.css`.

Une page cible ressemble à :

```astro
---
import PageLayout from '../../layouts/PageLayout.astro';
import Section from '../../components/Section.astro';
import FigureCard from '../../components/FigureCard.astro';

const SECTIONS = [
  { id: 'origine', label: 'Première attestation', title: "L'origine" },
  // ...
];
const temoins = [
  { name: 'Chrétien de Troyes', role: 'Poète, v. 1180', tags: ['Source'], body: '...' },
];
---
<PageLayout title="Le Saint Graal" family="objet" egg="graal" sections={SECTIONS}
            palette={{ accent: '#c9982f', accent2: '#6b1f14', /* ... */ }}>
  <Section {...SECTIONS[0]} scrollFx="graalGlow">
    <div class="card-grid">{temoins.map(t => <FigureCard {...t} />)}</div>
  </Section>
  <!-- sections a prose longue : ecrites directement dans le slot -->
</PageLayout>
```

## 6. Phasage

### Phase 0 — Socle (fait dans le lot du 26/07/2026)
- `tokens.css` avec le vocabulaire normalisé.
- `PageLayout.astro` + les composants listés ci-dessus.
- `socle-demo.astro` : une page qui instancie **tous** les composants avec des données
  d'exemple. Double usage : vérification visuelle immédiate, et **document de référence à
  lire par un agent de rédaction à la place d'un gabarit de 580 lignes**.
- Aucune page existante touchée. Entièrement réversible (supprimer `src/layouts`,
  `src/components`, `src/styles`).

### Phase 1 — Première page réelle : un objet légendaire
- Choisir un objet du haut de `docs/listes/suite_objets.md` (recommandé : **Excalibur** ou
  **le Saint Graal** — dossiers riches, verdict net, iconographie évidente).
- L'écrire entièrement avec le socle, sans jamais recopier de CSS.
- **Mesurer** : taille du fichier `.astro` produit vs les 43 ko d'une page statique
  équivalente. C'est le chiffre qui valide ou invalide tout le chantier.
- Vérifier au navigateur : rendu, menu latéral, easter egg, happening au scroll, reveal,
  console propre.
- Décision go/no-go pour la phase 2, sur la base de la mesure et du confort ressenti.

### Phase 2 — Toutes les pages neuves passent par le socle
Quelle que soit la famille. Chaque page neuve qui apparaît dans une famille encore
statique cohabite avec les anciennes sans problème : Astro compile vers `dist/`, les pages
statiques y sont copiées depuis `public/`, les deux sont servies côte à côte. Le menu
latéral et la carte sont déjà pilotés par `data/site-pages.json`, donc communs aux deux
mondes.

Ajustement attendu en cours de route : 2 ou 3 composants vont se révéler trop rigides ou
trop génériques. Les corriger au fil des pages, tant qu'aucune page existante n'en dépend,
coûte presque rien.

### Phase 3 — Migration (optionnelle, et seulement après)
Ordre du plus petit au plus gros ensemble, une famille par tour, jamais de suppression
groupée :
1. Mystères (6) — 2 sont déjà propres côté reveal, structure la plus régulière.
2. Créatures (6).
3. Cultures (6) — attention : 4 n'ont aucun script de reveal (voir audit A2), la migration
   les corrige au passage.
4. Mythologies (11) — les plus longues et les plus structurées, donc les plus rentables,
   mais les plus risquées : à garder pour la fin.

Par page : renommer le vocabulaire, extraire le tabulaire en données, garder la prose
telle quelle, **comparer côte à côte dans le navigateur, et ne supprimer l'ancien fichier
qu'après validation**.

Corollaire : `tools/sync_sidebar.py` ne peut être supprimé qu'à la toute fin (quand plus
aucune page statique n'existe). D'ici là il reste indispensable — et il vient d'être
étendu pour savoir insérer un groupe de menu absent, ce qui le rend utilisable pour la
nouvelle catégorie.

## 7. Risques et points de vigilance

- **Sur-abstraction** : si un composant accumule des props d'exception, le scinder ou
  laisser la section en HTML direct dans le slot. Le socle doit rendre le cas courant
  gratuit, pas le cas rare possible.
- **Deux mondes en parallèle** : pendant les phases 2-3, certaines pages sont statiques et
  d'autres compilées. Le seul vrai piège est d'oublier que le menu latéral des pages
  statiques a besoin de `sync_sidebar.py` alors que celui des pages Astro est généré. Les
  deux lisent le même JSON, donc ils ne peuvent pas diverger profondément, mais il faut
  relancer le script après chaque ajout.
- **Fidélité visuelle des pages migrées** : chaque page a des touches bespoke (SVG fait
  main, motif décoratif). Le layout doit laisser passer du contenu 100 % libre (slot), pas
  seulement des props typées. Un `<slot name="hero-extra">` et un `<style is:global>` par
  page suffisent en général.
- **Ne pas transformer le contenu en base de données** : le but est d'écrire moins de
  balises, pas de remplir des formulaires. Si décrire une page devient plus pénible qu'en
  HTML, le socle a échoué et il faut le simplifier.

## 8. Décisions tranchées (ex-« décisions ouvertes »)

- **`GodCard` vs `FigureCard`** → **un seul composant `FigureCard`** (nom + rôle/épithète +
  tags + corps). Les deux étaient structurellement identiques ; deux noms pour la même
  chose est précisément la divergence qui rend la migration coûteuse.
- **Palette : `<style>` inline par page ou props ?** → **props**, injectées par
  `PageLayout` en variables CSS sur `:root`. C'est ce qui permet à `tokens.css` d'exister
  une seule fois. Le CSS vraiment spécifique à une page (SVG décoratif, motif) reste dans
  un `<style>` local à la page.
- **`index.astro` doit-il lire ses cartes depuis un fichier de données ?** → **oui, fait
  dans ce lot.** `data/site-pages.json` porte désormais `epigraph` et `hook` en plus de
  `href`/`title`, et `index.astro` génère ses 5 sections par boucle. Conséquence :
  `add_page.py` n'a plus besoin de patcher `index.astro` par expression régulière, et le
  compte dans le titre (« Onze Mythologies ») ne peut plus être périmé.

## 9. Prochaine étape immédiate

Écrire la **première page « objet légendaire » avec le socle**, dans une session dédiée,
et mesurer la taille du fichier produit. Tant que ce chiffre n'est pas connu, tout le
reste du plan est une hypothèse.
