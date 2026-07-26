# Prompts d'icônes — file d'attente

**File d'attente vide au 26/07/2026.** Les 189 sujets de la carte ont tous leur icône :
`public/icons/<catégorie>/` contient 189 masters 300 px et leurs variantes 32/64/128.

| Lot | Planches | Icônes | Archive du prompt |
|---|---|---|---|
| 1er lot | 25 | 124 | `icon-sources/old/prompts-planches-icones.md` |
| 2e lot (26/07/2026) | 11 | 65 | `icon-sources/old/prompts-2026-07-26.md` |

## Ajouter un lot

1. Ajouter les sujets dans la liste de leur catégorie (`docs/listes/`), avec leur score et leur
   id d'icône.
2. Décrire l'icône voulue dans `docs/plans/plan-carte-icones.md`.
3. Écrire le prompt **ici**, en repartant d'un bloc d'une archive pour garder le style : encre
   sépia, trait fin, monochrome strict, lisible en petit, aucun texte dans l'image. Les sujets
   sensibles (objet sacré en usage, mort réelle, culture autochtone vivante) portent une
   consigne de retenue explicite — ne pas l'oublier.
4. Générer, déposer la planche dans `icon-sources/new/<catégorie>/`, puis :

   ```bash
   python tools/make_icons.py icon-sources/new/<cat>/<planche>.png --cat <cat> --preview
   ```

   ```bash
   python tools/make_icons.py icon-sources/new/<cat>/<planche>.png --cat <cat> --slugs a,b,c
   ```

5. **Déplacer la planche dans `icon-sources/old/<catégorie>/`** et déplacer le prompt dans une
   archive datée. C'est ce qui garde ce fichier utile : il ne doit contenir que du travail
   restant.
6. Placer les pins (`tools/edit_map_pins.py`, filtre « à placer ») et renseigner
   `docs/listes/positions-carte.md`.

Le circuit détaillé, avec les pièges de découpe, est dans `icon-sources/README.md`.
