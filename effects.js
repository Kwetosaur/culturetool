/* =========================================================================
   effects.js — couche d'effets partagée pour "Mythologies & Cultures du Monde"
   -------------------------------------------------------------------------
   Deux rôles :
     1. Améliorations universelles, sobres, sur toutes les pages
        (barre de progression, lueur du hero suivant la souris).
     2. Un « easter egg » thématique par page, déclenché en cliquant le
        titre du hero — ou via le code Konami. Chaque page se déclare via
        <body data-egg="clef">.

   Tout est coupé si l'utilisateur a demandé à réduire les animations
   (prefers-reduced-motion), pour rester respectueux et accessible.
   ========================================================================= */
(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return; // on ne fait rien de plus que le JS déjà présent dans chaque page

  var root = document.documentElement;
  function cssVar(name, fallback) {
    var v = getComputedStyle(root).getPropertyValue(name).trim();
    return v || fallback;
  }
  // Couleur d'accent propre à chaque page (chaque thème définit --gold-bright).
  var ACCENT = cssVar('--gold-bright', '#e8c164');
  var GOLD = cssVar('--gold', ACCENT);

  /* ---------------------------------------------------------------------
     Feuille de style injectée (keyframes + calques d'effets)
     --------------------------------------------------------------------- */
  var style = document.createElement('style');
  style.textContent = [
    '.fx-progress{position:fixed;top:0;left:0;height:2px;width:0;z-index:99999;',
      'background:linear-gradient(90deg,transparent,' + ACCENT + ');',
      'box-shadow:0 0 8px ' + ACCENT + ';pointer-events:none;transition:width .08s linear;}',
    '.fx-hero-glow{position:absolute;inset:0;pointer-events:none;z-index:0;opacity:0;',
      'transition:opacity .5s ease;mix-blend-mode:screen;',
      'background:radial-gradient(280px circle at var(--mx,50%) var(--my,40%),' +
        'rgba(255,255,255,.10),transparent 60%);}',
    '.fx-layer{position:fixed;inset:0;z-index:99990;pointer-events:none;overflow:hidden;}',
    '.fx-col{position:absolute;top:0;will-change:transform;}',
    '.fx-glyph{display:block;will-change:transform;font-family:"Cinzel","EB Garamond",serif;',
      'text-shadow:0 0 12px currentColor;}',
    '@keyframes fx-fall{0%{transform:translateY(-14vh);opacity:0}' +
      '8%{opacity:.95}90%{opacity:.95}100%{transform:translateY(116vh);opacity:0}}',
    '@keyframes fx-rise{0%{transform:translateY(14vh);opacity:0}' +
      '8%{opacity:.95}90%{opacity:.95}100%{transform:translateY(-116vh);opacity:0}}',
    '@keyframes fx-sway{0%{transform:translateX(-14px) rotate(-8deg)}' +
      '100%{transform:translateX(14px) rotate(8deg)}}',
    '@keyframes fx-fade{0%,100%{opacity:0}12%,80%{opacity:1}}'
  ].join('');
  document.head.appendChild(style);

  /* ---------------------------------------------------------------------
     1. Barre de progression de lecture
     --------------------------------------------------------------------- */
  var bar = document.createElement('div');
  bar.className = 'fx-progress';
  document.body.appendChild(bar);
  function onScroll() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var p = h > 0 ? (window.scrollY / h) : 0;
    bar.style.width = (p * 100).toFixed(2) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------------------------------------------------------------------
     2. Lueur du hero suivant la souris
     --------------------------------------------------------------------- */
  var hero = document.querySelector('header.hero, .hero');
  if (hero) {
    if (getComputedStyle(hero).position === 'static') hero.style.position = 'relative';
    var glow = document.createElement('div');
    glow.className = 'fx-hero-glow';
    hero.appendChild(glow);
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      glow.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      glow.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
      glow.style.opacity = '1';
    });
    hero.addEventListener('mouseleave', function () { glow.style.opacity = '0'; });
  }

  /* ---------------------------------------------------------------------
     Helpers easter eggs
     --------------------------------------------------------------------- */
  var busy = false;
  function layer(life) {
    var l = document.createElement('div');
    l.className = 'fx-layer';
    document.body.appendChild(l);
    setTimeout(function () { l.remove(); }, life);
    return l;
  }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(s) { return s[Math.floor(Math.random() * s.length)]; }

  // Pluie / ascension de glyphes dans la couleur d'accent (ou une couleur donnée).
  function glyphShower(opts) {
    // Array.from découpe par point de code (les hiéroglyphes/cunéiformes
    // sont « astraux » et occupent 2 unités UTF-16 : pick() les casserait sinon).
    var glyphs = Array.from(opts.glyphs), mode = opts.mode || 'fall',
        color = opts.color || ACCENT, count = opts.count || 26, life = 5200;
    var l = layer(life + 800);
    for (var i = 0; i < count; i++) {
      var col = document.createElement('div');
      col.className = 'fx-col';
      col.style.left = rand(0, 100) + 'vw';
      var dur = rand(3.2, 5.4);
      col.style.animation = 'fx-' + mode + ' ' + dur + 's linear ' + rand(0, 1.6) + 's forwards';

      var g = document.createElement('span');
      g.className = 'fx-glyph';
      g.textContent = pick(glyphs);
      g.style.color = color;
      g.style.fontSize = rand(16, 40) + 'px';
      g.style.animation = 'fx-sway ' + rand(1.6, 3.2) + 's ease-in-out infinite alternate';
      g.style.opacity = rand(0.55, 1);

      col.appendChild(g);
      l.appendChild(col);
    }
  }

  /* ---------------------------------------------------------------------
     Easter eggs sur mesure (SVG / CSS)
     --------------------------------------------------------------------- */

  // Loch Ness — une silhouette sombre émerge de l'eau puis replonge.
  function nessie() {
    var l = layer(6600);
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:50%;bottom:-40px;transform:translateX(-50%) translateY(120px);' +
      'transition:transform 1.4s cubic-bezier(.22,.9,.3,1);width:min(520px,88vw);';
    wrap.innerHTML =
      '<svg viewBox="0 0 520 220" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;overflow:visible">' +
        '<g fill="#0c211f">' +
          '<path d="M60 200 Q120 150 150 200 Z"/>' +
          '<path d="M180 200 Q250 120 320 200 Z"/>' +
          '<path d="M360 205 Q380 120 405 70 Q420 40 452 46 Q470 50 466 74 Q450 78 448 96 ' +
                  'Q470 104 470 130 Q470 170 430 205 Z"/>' +
          '<circle cx="455" cy="66" r="3.4" fill="#0a1615"/>' +
        '</g>' +
        '<g fill="none" stroke="rgba(160,190,200,.35)" stroke-width="2">' +
          '<path d="M40 210 Q260 190 480 210"/>' +
          '<path d="M90 202 Q120 196 150 202"/>' +
          '<path d="M330 205 Q360 199 390 205"/>' +
        '</g>' +
      '</svg>';
    l.appendChild(wrap);
    requestAnimationFrame(function () {
      wrap.style.transform = 'translateX(-50%) translateY(0)';
    });
    setTimeout(function () {
      wrap.style.transform = 'translateX(-50%) translateY(130px)';
      wrap.style.opacity = '0';
      wrap.style.transitionDuration = '1.6s';
    }, 3600);
  }

  // Triangle des Bermudes — un avion et un navire dérivent vers le centre et disparaissent.
  function bermudes() {
    var l = layer(5200);
    var vortex = document.createElement('div');
    vortex.style.cssText = 'position:absolute;left:50%;top:44%;width:140px;height:140px;margin:-70px 0 0 -70px;' +
      'border-radius:50%;border:1px dashed rgba(120,160,190,.5);opacity:0;' +
      'animation:fx-fade 3.4s ease forwards;';
    vortex.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(320deg)' }],
      { duration: 3400, easing: 'ease-in' });
    l.appendChild(vortex);

    ['✈', '⛵', '⚓'].forEach(function (sym, i) {
      var s = document.createElement('span');
      var edgeX = i === 0 ? -20 : (i === 1 ? 118 : 50);
      var edgeY = i === 2 ? -12 : rand(20, 80);
      s.textContent = sym;
      s.style.cssText = 'position:absolute;left:' + edgeX + 'vw;top:' + edgeY + 'vh;' +
        'font-size:34px;color:rgba(40,60,75,.85);will-change:transform,opacity;';
      l.appendChild(s);
      s.animate([
        { transform: 'translate(0,0) scale(1) rotate(0)', opacity: 0 },
        { opacity: 1, offset: 0.15 },
        { transform: 'translate(' + (50 - edgeX) + 'vw,' + (44 - edgeY) + 'vh) scale(.1) rotate(300deg)', opacity: 0 }
      ], { duration: rand(2800, 3600), delay: i * 250, easing: 'cubic-bezier(.5,0,.9,.4)', fill: 'forwards' });
    });
  }

  // Stonehenge — un lever de soleil au solstice traverse le cercle de pierres.
  function solstice() {
    var l = layer(5600);
    var sun = document.createElement('div');
    sun.style.cssText = 'position:absolute;left:50%;bottom:-160px;width:200px;height:200px;margin-left:-100px;' +
      'border-radius:50%;background:radial-gradient(circle,#ffe9a8,#f4b942 55%,rgba(244,185,66,0));' +
      'filter:blur(2px);will-change:transform,opacity;';
    l.appendChild(sun);
    sun.animate([
      { transform: 'translateY(0) scale(.7)', opacity: 0 },
      { opacity: 1, offset: 0.3 },
      { transform: 'translateY(-46vh) scale(1.1)', opacity: 1, offset: 0.75 },
      { transform: 'translateY(-52vh) scale(1.15)', opacity: 0 }
    ], { duration: 5200, easing: 'ease-out', fill: 'forwards' });

    var beam = document.createElement('div');
    beam.style.cssText = 'position:absolute;left:50%;bottom:0;width:60vw;height:80vh;margin-left:-30vw;' +
      'transform-origin:bottom center;opacity:0;' +
      'background:conic-gradient(from 180deg at 50% 100%,transparent 46%,rgba(255,224,150,.28) 50%,transparent 54%);';
    l.appendChild(beam);
    beam.animate([{ opacity: 0 }, { opacity: 1, offset: 0.4 }, { opacity: 1, offset: 0.75 }, { opacity: 0 }],
      { duration: 5200, easing: 'ease-in-out', fill: 'forwards' });
  }

  // Gévaudan — deux yeux ambrés s'allument dans l'ombre, clignent, s'éteignent.
  function eyes() {
    var l = layer(4600);
    var veil = document.createElement('div');
    veil.style.cssText = 'position:absolute;inset:0;background:radial-gradient(circle at 50% 55%,transparent 30%,rgba(20,4,4,.55));' +
      'opacity:0;animation:fx-fade 4s ease forwards;';
    l.appendChild(veil);

    var x = rand(24, 70), y = rand(28, 62);
    var e = document.createElement('div');
    e.style.cssText = 'position:absolute;left:' + x + 'vw;top:' + y + 'vh;opacity:0;';
    e.innerHTML =
      '<svg width="120" height="52" viewBox="0 0 120 52" xmlns="http://www.w3.org/2000/svg" style="overflow:visible">' +
        '<g fill="#f2b134" style="filter:drop-shadow(0 0 8px #e0731f)">' +
          '<ellipse cx="30" cy="26" rx="15" ry="8"/>' +
          '<ellipse cx="90" cy="26" rx="15" ry="8"/>' +
        '</g>' +
        '<g fill="#160a04"><ellipse cx="30" cy="26" rx="3.4" ry="7"/><ellipse cx="90" cy="26" rx="3.4" ry="7"/></g>' +
      '</svg>';
    l.appendChild(e);
    var pupilA = e.animate([{ opacity: 0 }, { opacity: 1, offset: 0.15 },
      { opacity: 1, offset: 0.55 }, { opacity: 1, offset: 0.6 }, { opacity: 1, offset: 0.85 }, { opacity: 0 }],
      { duration: 4400, fill: 'forwards' });
    // clignement : on écrase brièvement les yeux
    var svgG = e.querySelector('svg');
    setTimeout(function () {
      svgG.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(.1)' }, { transform: 'scaleY(1)' }],
        { duration: 220, easing: 'ease-in-out' });
    }, 2400);
  }

  /* ---------------------------------------------------------------------
     Registre : clef data-egg -> déclencheur
     --------------------------------------------------------------------- */
  var RUNES = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛋᛏᛒᛖᛗᛚᛜᛞᛟ';
  var GREEK = 'ΑΒΓΔΘΛΞΠΣΦΨΩ';
  var HIERO = '𓂀𓆣𓁢𓋹𓊹'; // œil d'Horus, scarabée, personnage, ankh, « dieu »
  var CUNEI = '𒀭𒂗𒆠𒉏𒌷'; // DINGIR, EN, KI, …
  var OGHAM = 'ᚁᚂᚃᚄᚅᚆᚇᚈᚉᚊ';
  var ROMAN = 'ⅠⅤⅩⅬⅭⅮⅯ';

  var EGGS = {
    nordique:      function () { glyphShower({ glyphs: RUNES, mode: 'fall' }); },
    grecque:       function () { glyphShower({ glyphs: GREEK, mode: 'rise' }); },
    egyptienne:    function () { glyphShower({ glyphs: HIERO, mode: 'rise' }); },
    egypte:        function () { glyphShower({ glyphs: HIERO, mode: 'rise' }); },
    romaine:       function () { glyphShower({ glyphs: ROMAN, mode: 'fall' }); },
    celtique:      function () { glyphShower({ glyphs: OGHAM, mode: 'rise' }); },
    mesopotamienne:function () { glyphShower({ glyphs: CUNEI, mode: 'fall' }); },
    hindoue:       function () { glyphShower({ glyphs: 'ॐ☸✴', mode: 'rise', color: '#e6a23c' }); },
    azteque:       function () { glyphShower({ glyphs: '☀✴◈❂', mode: 'rise' }); },
    slave:         function () { glyphShower({ glyphs: '☀✺❉✵', mode: 'rise', color: '#e0723a' }); },
    chine:         function () { glyphShower({ glyphs: '福龍鳳春', mode: 'fall', color: '#d8443a' }); },
    japonaise:     function () { glyphShower({ glyphs: '❀✿花', mode: 'fall', color: '#f4c0d0', count: 30 }); },
    lochness:      nessie,
    bermudes:      bermudes,
    stonehenge:    solstice,
    gevaudan:      eyes,
    // page d'accueil : un mélange de glyphes de toutes les cultures
    accueil:       function () { glyphShower({ glyphs: RUNES + GREEK + OGHAM + 'ॐ福', mode: 'rise' }); }
  };

  var key = document.body.getAttribute('data-egg');
  var egg = key && EGGS[key];
  if (!egg) return;

  function trigger() {
    if (busy) return;
    busy = true;
    try { egg(); } catch (e) { /* on ne casse jamais la page pour un easter egg */ }
    setTimeout(function () { busy = false; }, 1500);
  }

  // Déclencheur discret : le titre du hero devient cliquable.
  var title = document.querySelector('.hero h1, header.hero h1');
  if (title) {
    title.style.cursor = 'pointer';
    title.addEventListener('click', trigger);
  }

  // Déclencheur caché : le code Konami.
  var seq = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65], idx = 0;
  window.addEventListener('keydown', function (e) {
    idx = (e.keyCode === seq[idx]) ? idx + 1 : (e.keyCode === seq[0] ? 1 : 0);
    if (idx === seq.length) { idx = 0; trigger(); }
  });
})();
