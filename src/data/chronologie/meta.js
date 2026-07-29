/*
  Métadonnées partagées de la Chronologie Mondiale (src/pages/chronologie-mondiale.astro).
  Régions, catégories et ères sont définies ici une seule fois ; les fichiers
  src/data/chronologie/<region>.js ne contiennent que des lignes de données
  compactes [annee, libelle, categorie, titre, resume].
*/

export const REGIONS = {
  af:  { label: "Afrique", emoji: "🌍" },
  mo:  { label: "Moyen-Orient", emoji: "🕌" },
  ea:  { label: "Asie de l'Est", emoji: "🏯" },
  sa:  { label: "Asie du Sud", emoji: "🕉️" },
  sea: { label: "Asie du Sud-Est", emoji: "🌏" },
  oc:  { label: "Océanie", emoji: "🦘" },
  am:  { label: "Amériques précolombiennes", emoji: "🌎" },
  eu:  { label: "Europe", emoji: "🏛️" },
  ame: { label: "Amérique (moderne)", emoji: "🌆" },
  wo:  { label: "Monde / Transversal", emoji: "🌐" },
};

export const CATEGORIES = {
  guerre:       { label: "Guerres / Conflits", color: "#b13b3b", bright: "#e05a5a" },
  science:      { label: "Inventions / Sciences", color: "#2f8a8a", bright: "#4fc4c4" },
  politique:    { label: "Politique / Culture", color: "#c9982f", bright: "#e8c164" },
  figure:       { label: "Grandes figures historiques", color: "#7a4fc9", bright: "#a67ee8" },
  catastrophe:  { label: "Catastrophes naturelles", color: "#b3702f", bright: "#e0994f" },
};

/* 7 ères, palette sequentielle froid -> chaud le long de la frise. */
export const ERAS = [
  { key: "e1", label: "Aube des civilisations", sub: "avant -700", max: -700, color: "#33406b" },
  { key: "e2", label: "Antiquité classique", sub: "-700 à 500", max: 500, color: "#3f5a7a" },
  { key: "e3", label: "Moyen Âge", sub: "500 à 1500", max: 1500, color: "#3f6b5c" },
  { key: "e4", label: "Époque moderne", sub: "1500 à 1800", max: 1800, color: "#6b5a2f" },
  { key: "e5", label: "XIXe siècle", sub: "1800 à 1900", max: 1900, color: "#8a4a2f" },
  { key: "e6", label: "XXe siècle", sub: "1900 à 2000", max: 2000, color: "#9a3535" },
  { key: "e7", label: "XXIe siècle", sub: "depuis 2000", max: Infinity, color: "#6b3d8a" },
];

export function eraOf(y) {
  for (const e of ERAS) if (y < e.max) return e.key;
  return ERAS[ERAS.length - 1].key;
}

/* Transforme les lignes compactes [annee, libelle, categorie, titre, resume, region?]
   d'un fichier region.js en objets complets, en ajoutant region/ere/id. Le 6e
   element (region) est optionnel : seul monde.js s'en sert, pour eclater ses
   entrees entre Europe/Amerique moderne/Monde-transversal sans changer de fichier. */
export function build(regionKey, rows) {
  return rows.map(([y, label, cat, title, summary, region], i) => ({
    id: `${regionKey}-${i}`,
    y,
    label,
    region: region || regionKey,
    cat,
    era: eraOf(y),
    title,
    summary,
  }));
}
