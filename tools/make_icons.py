# -*- coding: utf-8 -*-
"""
Decoupe une planche d'icones generee par IA et produit les fichiers finaux,
au format exact des 124 icones deja en place : RGBA carre 300x300 a fond
transparent, plus les variantes 128 / 64 / 32 px que map.html reclame selon le
niveau de zoom.

Remplace le script jetable de decoupage refait a la main a chaque planche
(mentionne dans docs/plans/plan-carte-icones.md comme "voir historique de session").

  Entree  : icon-sources/new/<categorie>/<planche>.png
  Sortie  : public/icons/<categorie>/<prefixe>-<slug>.png  (+ -128, -64, -32)

Methode : seuillage de luminance -> dilatation pour recoller les traits d'une
meme icone (le dessin au trait est fait de traits disjoints : sans dilatation,
deux yeux et un corps donneraient trois "icones") -> composantes connexes ->
tri en ordre de lecture (lignes puis colonnes) -> recadrage sur le dessin
d'origine -> alpha derive de la luminance -> mise au carre -> redimensionnement.

Le garde-fou central : **le script refuse d'ecrire si le nombre de formes
detectees ne correspond pas au nombre de slugs fournis.** Une icone mal nommee
est bien plus penible a rattraper qu'une decoupe a relancer, et le placement en
grille des planches generees par IA est irregulier (icones a cheval sur une
frontiere de cellule, cadres dessines autour du dessin). En cas d'ecart, lancer
avec --preview pour obtenir une image de controle numerotee et ajuster
--dilate / --min-area.

Usage :
  # cas courant : les slugs dans l'ordre du prompt
  python tools/make_icons.py icon-sources/new/objet/europe-1.png --cat objet \\
    --slugs excalibur,graal,lance-sacree,chambre-ambre,ulfberht,pierre-scone,durandal,mjollnir

  # ou un fichier a cote de la planche : europe-1.slugs.txt, un slug par ligne
  python tools/make_icons.py icon-sources/new/objet/europe-1.png --cat objet

  # controle visuel avant d'ecrire quoi que ce soit
  python tools/make_icons.py <planche> --cat objet --preview

Le prefixe (myth-/cult-/crea-/myst-/obj-) est ajoute automatiquement s'il manque.
"""
import argparse
import os
import sys

try:
    import numpy as np
    from PIL import Image
    from scipy import ndimage
except ImportError as e:
    print(f"Dependance manquante : {e.name}. Installer avec :")
    print("  pip install pillow numpy scipy")
    sys.exit(2)

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Le prefixe doit rester aligne sur les id utilises dans map.html et dans les
# docs de suivi (obj-excalibur, crea-bigfoot...).
PREFIXES = {
    'mythologie': 'myth',
    'culture': 'cult',
    'creature': 'crea',
    'mystere': 'myst',
    'objet': 'obj',
}

MASTER = 300           # taille du master, comme les 124 icones existantes
VARIANTES = (128, 64, 32)
MARGE = 0.06           # marge autour du dessin, en fraction du cote final


def luminance(rgb):
    return (0.299 * rgb[..., 0] + 0.587 * rgb[..., 1] + 0.114 * rgb[..., 2])


def detecter_formes(lum, seuil, dilate_px, min_area):
    """Retourne les bboxes (y0, y1, x0, x1) triees en ordre de lecture."""
    h, w = lum.shape
    encre = lum < seuil
    if dilate_px > 0:
        fusion = ndimage.binary_dilation(encre, iterations=dilate_px)
    else:
        fusion = encre
    etiquettes, n = ndimage.label(fusion)
    boites = []
    cadres = 0
    for i, sl in enumerate(ndimage.find_objects(etiquettes), start=1):
        ys, xs = sl
        aire = int((etiquettes[sl] == i).sum())
        if aire < min_area:
            continue
        # Plusieurs planches generees ont un cadre trace autour de la feuille
        # entiere : une forme qui couvre presque toute l'image ne peut pas etre
        # une icone de la grille, on l'ignore.
        if (ys.stop - ys.start) > 0.9 * h and (xs.stop - xs.start) > 0.9 * w:
            cadres += 1
            continue
        boites.append((ys.start, ys.stop, xs.start, xs.stop, aire))
    if cadres:
        print(f"  ({cadres} cadre(s) de planche ignore(s))")
    if not boites:
        return []

    # tri en ordre de lecture : on regroupe par ligne (tolerance = moitie de la
    # hauteur mediane des formes), puis on trie chaque ligne par x.
    hauteurs = sorted(b[1] - b[0] for b in boites)
    tol = max(8, hauteurs[len(hauteurs) // 2] // 2)
    boites.sort(key=lambda b: b[0])
    lignes, courante = [], [boites[0]]
    for b in boites[1:]:
        if b[0] - courante[0][0] <= tol:
            courante.append(b)
        else:
            lignes.append(courante); courante = [b]
    lignes.append(courante)
    ordonnees = []
    for ligne in lignes:
        ligne.sort(key=lambda b: b[2])
        ordonnees.extend(ligne)
    return ordonnees


def fabriquer_icone(rgb, lum, boite, seuil_fond):
    """Recadre, rend le fond transparent, met au carre, ramene a MASTER px."""
    y0, y1, x0, x1 = boite[:4]
    dessin = rgb[y0:y1, x0:x1]
    l = lum[y0:y1, x0:x1]

    # alpha : blanc -> transparent, encre -> opaque. Le degrade conserve
    # l'antialiasing du trait, donc des bords propres a petite taille.
    alpha = np.clip((seuil_fond - l) / seuil_fond * 255.0, 0, 255)
    rgba = np.dstack([dessin, alpha]).astype(np.uint8)
    im = Image.fromarray(rgba, 'RGBA')

    # mise au carre avec marge, sans deformer
    cote_utile = int(MASTER * (1 - 2 * MARGE))
    im.thumbnail((cote_utile, cote_utile), Image.LANCZOS)
    carre = Image.new('RGBA', (MASTER, MASTER), (0, 0, 0, 0))
    carre.paste(im, ((MASTER - im.width) // 2, (MASTER - im.height) // 2))
    return carre


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('planche', help="chemin de la planche PNG a decouper")
    ap.add_argument('--cat', required=True, choices=list(PREFIXES))
    ap.add_argument('--slugs', help="slugs dans l'ordre de lecture, separes par des virgules "
                                    "(defaut : fichier <planche>.slugs.txt, un par ligne)")
    ap.add_argument('--preview', action='store_true',
                    help="n'ecrit aucune icone : produit une image de controle numerotee")
    ap.add_argument('--dry-run', action='store_true', help="affiche ce qui serait ecrit, sans ecrire")
    ap.add_argument('--force', action='store_true', help="autorise l'ecrasement d'icones existantes")
    ap.add_argument('--seuil', type=int, default=205,
                    help="seuil de luminance encre/fond (defaut 205)")
    ap.add_argument('--dilate', type=int, default=0,
                    help="rayon de fusion des traits en px (defaut : 1.2%% de la largeur)")
    ap.add_argument('--min-area', type=int, default=0,
                    help="aire minimale d'une forme en px (defaut : 0.02%% de l'image)")
    args = ap.parse_args()

    if not os.path.exists(args.planche):
        print(f"ERREUR : planche introuvable : {args.planche}"); sys.exit(1)

    # Les planches arrivent souvent en RGBA. convert('RGB') se contenterait de jeter
    # le canal alpha, ce qui transforme une zone transparente en zone NOIRE : tout le
    # fond serait alors pris pour de l'encre. On aplatit donc explicitement sur blanc.
    brut = Image.open(args.planche)
    if brut.mode in ('RGBA', 'LA', 'P'):
        brut = brut.convert('RGBA')
        fond = Image.new('RGBA', brut.size, (255, 255, 255, 255))
        im = Image.alpha_composite(fond, brut).convert('RGB')
    else:
        im = brut.convert('RGB')
    rgb = np.array(im)
    lum = luminance(rgb.astype(np.float32))
    h, w = lum.shape

    dilate = args.dilate or max(2, int(w * 0.012))
    min_area = args.min_area or max(80, int(h * w * 0.0002))
    boites = detecter_formes(lum, args.seuil, dilate, min_area)

    print(f"Planche  : {args.planche}  ({w}x{h})")
    print(f"Reglages : seuil={args.seuil} dilate={dilate}px min_area={min_area}px")
    print(f"Detecte  : {len(boites)} forme(s)")
    for i, b in enumerate(boites, 1):
        print(f"  {i:2d}. y {b[0]:4d}-{b[1]:4d}  x {b[2]:4d}-{b[3]:4d}  aire {b[4]}")

    if args.preview:
        from PIL import ImageDraw
        ctrl = im.copy()
        d = ImageDraw.Draw(ctrl)
        for i, b in enumerate(boites, 1):
            d.rectangle([b[2], b[0], b[3], b[1]], outline=(220, 40, 40), width=3)
            d.text((b[2] + 6, b[0] + 6), str(i), fill=(220, 40, 40))
        out = os.path.splitext(args.planche)[0] + '.preview.png'
        ctrl.save(out)
        print(f"\nImage de controle ecrite : {out}")
        print("Verifier que chaque cadre entoure UNE icone entiere, puis relancer sans --preview.")
        return

    # --- slugs ---
    if args.slugs:
        slugs = [s.strip() for s in args.slugs.split(',') if s.strip()]
    else:
        sidecar = os.path.splitext(args.planche)[0] + '.slugs.txt'
        if not os.path.exists(sidecar):
            print(f"\nERREUR : ni --slugs ni fichier {os.path.basename(sidecar)}.")
            print("Relancer avec --preview pour verifier la decoupe, puis fournir les slugs.")
            sys.exit(1)
        slugs = [l.strip() for l in open(sidecar, encoding='utf-8')
                 if l.strip() and not l.startswith('#')]
        print(f"Slugs lus depuis {os.path.basename(sidecar)}")

    prefixe = PREFIXES[args.cat]
    slugs = [s if s.startswith(prefixe + '-') else f'{prefixe}-{s}' for s in slugs]

    if len(slugs) != len(boites):
        print(f"\nECHEC : {len(boites)} forme(s) detectee(s) pour {len(slugs)} slug(s) fourni(s).")
        print("Rien n'a ete ecrit — une icone mal nommee coute plus cher qu'une decoupe a refaire.")
        print("Pistes : --preview pour voir la decoupe ; --dilate plus grand si une icone est")
        print("coupee en morceaux ; --dilate plus petit si deux icones voisines ont fusionne ;")
        print("--min-area plus grand s'il reste des taches parasites.")
        sys.exit(1)

    dest = os.path.join(ROOT, 'public', 'icons', args.cat)
    os.makedirs(dest, exist_ok=True)

    existants = [s for s in slugs if os.path.exists(os.path.join(dest, s + '.png'))]
    if existants and not args.force:
        print(f"\nECHEC : ces icones existent deja : {', '.join(existants)}")
        print("Relancer avec --force pour les remplacer.")
        sys.exit(1)

    print()
    for slug, boite in zip(slugs, boites):
        master = fabriquer_icone(rgb, lum, boite, args.seuil)
        cibles = [(os.path.join(dest, slug + '.png'), master)]
        for taille in VARIANTES:
            cibles.append((os.path.join(dest, f'{slug}-{taille}.png'),
                           master.resize((taille, taille), Image.LANCZOS)))
        if args.dry_run:
            print(f"  [dry-run] {slug} -> {len(cibles)} fichiers dans public/icons/{args.cat}/")
            continue
        for chemin, image in cibles:
            image.save(chemin)
        print(f"  OK {slug} ({MASTER}px + {', '.join(str(t) for t in VARIANTES)})")

    if args.dry_run:
        print("\n(dry-run : rien ecrit)")
        return

    print(f"\n{len(slugs)} icone(s) x 4 tailles ecrites dans public/icons/{args.cat}/")
    print("Suite : placer les pins avec tools/edit_map_pins.py (positions de reference dans")
    print("docs/listes/positions-carte.md), puis publier la page avec tools/add_page.py.")


if __name__ == '__main__':
    main()
