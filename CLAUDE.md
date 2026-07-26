# culturetool — à lire avant toute modification

Encyclopédie illustrée : mythologies, cultures, créatures légendaires, grands mystères et
objets légendaires du monde. Site statique, déployé sur GitHub Pages.

## La règle qui compte

**Avant d'écrire une page ou de toucher au site, lire `docs/plan_page.md` en entier**, puis
ouvrir chaque doc qu'il désigne pour la tâche en cours. Ce fichier existe parce que trois
pages ont été livrées sans leurs effets bespoke : un plan qui vit dans un fichier que
personne n'ouvre ne sert à rien. Ce `CLAUDE.md` existe pour garantir qu'il soit ouvert.

## Repères rapides

| Quoi | Où |
|---|---|
| Point d'entrée obligatoire | `docs/plan_page.md` |
| Index de toute la documentation | `docs/README.md` |
| État de santé du dépôt, bugs connus | `docs/audit-existant.md` |
| Stratégie de réduction du coût de rédaction | `docs/plans/plan-industrialisation.md` |
| Source de vérité des pages (menu, accueil) | `data/site-pages.json` |
| Effets JS (easter eggs, happenings) | `docs/plans/plan-effets.md` + `public/effects.js` |
| Icônes : statut et circuit de génération | `docs/plans/plan-carte-icones.md`, `icon-sources/README.md` |
| Composants réutilisables (pages neuves) | `src/pages/socle-demo.astro` — à lire à la place d'un gabarit |
| Gabarits des pages statiques (familles anciennes) | `docs/gabarits/` |
| Ce que fait chaque script | `tools/README.md` |
| Arborescence complète du dépôt | `README.md` |

## Où vivent les choses

```
data/site-pages.json   source de vérité des pages publiées
docs/                  documentation (plans/ listes/ gabarits/) — index dans docs/README.md
public/                tout ce qui est servi : les 29 pages, map.html, effects.js, icons/
src/                   ce qu'Astro compile : pages, layouts, components, styles
tools/                 5 scripts d'outillage
icon-sources/          planches et prompts d'icônes : old/ = archive, new/ = travail en cours
```

## Trois pièges propres à ce dépôt

1. **`public/` est la seule source des pages statiques.** Il y avait autrefois un doublon
   de chaque fichier à la racine ; ils ont été supprimés le 26/07/2026 (identiques, et
   jamais lus par le déploiement, qui publie `dist/` généré par `astro build`). Si tu vois
   encore une consigne de « double copie » quelque part, elle est périmée.
2. **`npm run build` régénère `dist/`** depuis `public/` et `src/`. Un fichier ouvert
   directement en `file:///.../dist/...` ne reflète rien tant qu'on n'a pas rebuild.
3. **Ne jamais committer ni pusher** sans que l'utilisateur l'ait demandé pour ce tour-ci.

## Contrôles utiles

```bash
node tools/check_map.cjs public/map.html
```

```bash
python tools/sync_sidebar.py
```

```bash
npm run build
```
