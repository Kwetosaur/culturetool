# culturetool

Encyclopédie illustrée des **mythologies, cultures, créatures légendaires, grands mystères et
objets légendaires du monde**. Site statique construit avec Astro, déployé sur GitHub Pages,
avec une carte du monde interactive où chaque page apparaît à sa position géographique.

**30 pages publiées** · 5 séries · **189 pins placés sur la carte, tous avec leur icône** ·
159 pages en réserve, toutes documentées (sujet, icône, pin, piste d'effet).

## Démarrer

```bash
npm install
```

```bash
npm run dev
```

Puis `http://localhost:4321/culturetool/`. `npm run build` produit `dist/`, et c'est `dist/`
que GitHub Actions publie — jamais les sources directement.

## Arborescence

```
CLAUDE.md              amorce pour un agent : renvoie vers docs/plan_page.md
README.md              ce fichier

data/
  site-pages.json      SOURCE DE VÉRITÉ des pages publiées : ordre, titres, épigraphes,
                       accroches. Lu par l'accueil, le menu latéral et les outils.
                       Publier une page = ajouter une entrée ici.

docs/                  documentation — voir docs/README.md pour l'index
  plan_page.md         point d'entrée obligatoire avant toute modification
  audit-existant.md    état de santé du dépôt, bugs connus
  plans/               comment on fait (industrialisation, effets, carte, séries)
  listes/              quoi écrire ensuite (sujets candidats scorés, positions de carte)
  gabarits/            squelettes des pages statiques historiques

public/                TOUT ce qui est servi tel quel
  *.html               les 29 pages statiques + map.html
  effects.js           easter eggs et animations, partagé par toutes les pages
  icons/<cat>/         189 icônes de carte, en 4 tailles chacune (756 fichiers)
  map.jpg              fond de la carte du monde

src/                   ce qui est compilé par Astro
  pages/index.astro    accueil, généré depuis data/site-pages.json
  pages/socle-demo.astro   RÉFÉRENCE : tous les composants instanciés, à lire avant
                           d'écrire une page neuve
  layouts/             PageLayout.astro : ossature commune des pages de contenu
  components/          cartes, blocs, frise, badges réutilisables
  styles/tokens.css    structure partagée + vocabulaire de variables normalisé

tools/                 outillage — voir tools/README.md
icon-sources/          planches brutes et prompts d'icônes — voir icon-sources/README.md
```

## Les deux façons d'écrire une page

- **Page compilée** (`src/pages/<nom>.astro`) — **à privilégier pour toute page neuve.** On
  écrit le contenu, pas l'ossature : `PageLayout.astro` fournit le `<head>`, le menu latéral
  généré, la nav collante, les scripts et les balises de partage. ~20 ko de texte en moins par
  page. À lire d'abord : `src/pages/socle-demo.astro`.
- **Page statique** (`public/<nom>.html`) — la façon historique des 29 pages en ligne.
  Gabarits dans `docs/gabarits/`.

Les deux cohabitent : `build.format: 'file'` fait compiler `src/pages/x.astro` vers
`dist/x.html`, donc mêmes URL et mêmes liens relatifs que les pages statiques.

## Trois choses à savoir

1. **`public/` est la seule copie.** Chaque page existait autrefois en double (racine +
   `public/`) ; les 31 doublons ont été supprimés le 26/07/2026. Aucune « double copie » à
   synchroniser.
2. **`npm run build` régénère `dist/`** depuis `public/` et `src/`. Ouvrir un fichier de
   `dist/` en `file://` ne montre rien de neuf tant qu'on n'a pas rebuild.
3. **Avant d'écrire quoi que ce soit, lire `docs/plan_page.md`.** Ce document existe parce
   que trois pages ont été livrées sans leurs effets : les étapes transverses ne sont pas
   devinables.

## Commandes

| Commande | Effet |
|---|---|
| `npm run dev` | serveur de développement |
| `npm run build` | produit `dist/` |
| `npm run preview` | sert `dist/` localement |
| `node tools/check_map.cjs public/map.html` | valide le JS des pins de la carte |
| `python tools/sync_sidebar.py` | resynchronise le menu latéral des pages statiques |
