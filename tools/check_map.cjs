// Extension .cjs et non .js : package.json declare "type": "module", donc un
// fichier .js serait charge comme module ES et le require() ci-dessous echouerait.
//
// Controle de non-regression de map.html : verifie que PLACES et PLACES_FUTURE
// restent du JS parsable et affiche le compte par categorie.
//
// A lancer systematiquement apres tools/add_page.py ou tools/edit_map_pins.py :
// deux bugs reels de add_page.py (virgule manquante, apostrophe echappee dans un
// titre) auraient ete attrapes ici en une seconde. Une erreur de syntaxe dans ces
// tableaux ne casse pas visiblement la page : le script s'arrete, la carte reste
// vide, et rien ne le dit.
//
// Usage : node tools/check_map.cjs map.html public/map.html
const fs = require('fs');

function grab(t, name) {
  const head = 'var ' + name + ' = [';
  const start = t.indexOf(head);
  if (start < 0) return null;
  const end = t.indexOf('\n];', start);
  if (end < 0) return null;
  return t.slice(start + head.length - 1, end + 2);
}

const files = process.argv.slice(2);
if (!files.length) {
  console.error('usage : node tools/check_map.cjs map.html [public/map.html ...]');
  process.exit(2);
}

let ok = true;
for (const file of files) {
  const t = fs.readFileSync(file, 'utf8');
  console.log('--- ' + file);
  for (const v of ['PLACES', 'PLACES_FUTURE']) {
    const src = grab(t, v);
    if (!src) { console.log('  ' + v + ' : INTROUVABLE'); ok = false; continue; }
    let arr;
    try {
      arr = eval(src);
    } catch (e) {
      console.log('  ' + v + ' : JS INVALIDE -> ' + e.message); ok = false; continue;
    }
    const cats = {};
    arr.forEach((p) => { cats[p.cat] = (cats[p.cat] || 0) + 1; });
    const ids = arr.map((p) => p.id);
    const doublons = ids.filter((id, i) => ids.indexOf(id) !== i);
    const sansIcone = arr.filter((p) => !p.icon).map((p) => p.id);
    console.log('  ' + v + ' : ' + arr.length + ' entrees ' + JSON.stringify(cats));
    if (doublons.length) { console.log('    DOUBLONS D\'ID : ' + doublons.join(', ')); ok = false; }
    if (sansIcone.length) { console.log('    SANS ICONE : ' + sansIcone.join(', ')); ok = false; }
  }
}
console.log(ok ? '\nOK' : '\nECHEC');
process.exit(ok ? 0 : 1);
