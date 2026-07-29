import afrique from "./afrique.js";
import moyenOrient from "./moyen-orient.js";
import asieEst from "./asie-est.js";
import asieSud from "./asie-sud.js";
import asieSudEst from "./asie-sudest.js";
import oceanie from "./oceanie.js";
import ameriquesPrecolombiennes from "./ameriques-precolombiennes.js";
import monde from "./monde.js";

export * from "./meta.js";

/* Frise unique, triee chronologiquement — jamais regroupee par region ou
   categorie a l'affichage : ces deux dimensions restent des FILTRES, pas des
   sections (demande explicite : "pas par pays ou par categorie"). */
export const EVENTS = [
  ...afrique,
  ...moyenOrient,
  ...asieEst,
  ...asieSud,
  ...asieSudEst,
  ...oceanie,
  ...ameriquesPrecolombiennes,
  ...monde,
].sort((a, b) => a.y - b.y);
