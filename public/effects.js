/* =========================================================================
   effects.js — couche d'effets partagée pour "Mythologies & Cultures du Monde"
   -------------------------------------------------------------------------
   Quatre rôles :
     1. Améliorations universelles, sobres, sur toutes les pages
        (barre de progression, lueur du hero suivant la souris).
     2. Un « easter egg » thématique par page, déclenché en cliquant le
        titre du hero — ou via le code Konami. Chaque page se déclare via
        <body data-egg="clef">.
     3. Des inscriptions qui se "déchiffrent" au scroll (glyphes -> texte
        lisible), rejouables à chaque entrée/sortie du viewport.
        <span class="fx-decode" data-glyphs="rune" data-text="…"></span>
     4. Des "happenings" au scroll qui rejouent un effet existant quand une
        section entre dans le viewport, avec un temps de repos pour ne
        jamais devenir agaçant en va-et-vient.
        <section data-scroll-fx="nessie">…</section>

   Tout est encapsulé en try/catch : un effet cassé ne doit jamais casser
   la page. Pas de garde-fou prefers-reduced-motion (demande explicite du
   site : les effets doivent s'afficher partout).
   ========================================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  function cssVar(name, fallback) {
    var v = getComputedStyle(root).getPropertyValue(name).trim();
    return v || fallback;
  }
  // Couleur d'accent propre à chaque page (chaque thème définit --gold-bright).
  var ACCENT = cssVar('--gold-bright', '#e8c164');
  var GOLD = cssVar('--gold', ACCENT);

  /* ---------------------------------------------------------------------
     0. Bascule "Effets" — en haut à droite, sur toutes les pages.
        Préférence persistée (localStorage), lue avant tout le reste :
        si désactivée, RIEN d'autre ne s'exécute (site épuré). Le bouton,
        lui, reste toujours visible pour pouvoir réactiver.
     --------------------------------------------------------------------- */
  var FX_KEY = 'culturetool-fx';
  var fxEnabled = localStorage.getItem(FX_KEY) !== 'off';

  var toggleStyle = document.createElement('style');
  toggleStyle.textContent =
    '#fx-toggle{position:fixed;top:18px;right:18px;z-index:9999;width:44px;height:44px;' +
      'border-radius:8px;border:1px solid rgba(255,255,255,.18);background:rgba(10,10,15,.72);' +
      'backdrop-filter:blur(6px);color:' + ACCENT + ';font-size:19px;line-height:1;cursor:pointer;' +
      'display:flex;align-items:center;justify-content:center;transition:opacity .2s,border-color .2s;}' +
    '#fx-toggle:hover{border-color:' + ACCENT + ';}' +
    '#fx-toggle.fx-off{opacity:.4;color:#9a9bb0;}';
  document.head.appendChild(toggleStyle);

  var fxToggle = document.createElement('button');
  fxToggle.id = 'fx-toggle';
  fxToggle.type = 'button';
  fxToggle.textContent = '✨';
  fxToggle.setAttribute('aria-label', 'Activer ou désactiver les effets visuels');
  fxToggle.title = fxEnabled
    ? 'Effets activés — cliquer pour désactiver (site épuré)'
    : 'Effets désactivés — cliquer pour réactiver';
  if (!fxEnabled) fxToggle.className = 'fx-off';
  fxToggle.addEventListener('click', function () {
    localStorage.setItem(FX_KEY, fxEnabled ? 'off' : 'on');
    location.reload();
  });
  document.body.appendChild(fxToggle); // script chargé en `defer` : le <body> existe déjà

  if (!fxEnabled) return; // site épuré : aucun autre effet ne s'exécute

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
    '@keyframes fx-fade{0%,100%{opacity:0}12%,80%{opacity:1}}',
    '.fx-decode{font-family:"Cinzel",serif;letter-spacing:.06em;opacity:.92;min-height:1.3em;display:block;}'
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

  // Égypte antique — le disque solaire de Rê se lève derrière les pyramides de Gizeh.
  function sunrise() {
    var l = layer(5400);
    var sky = document.createElement('div');
    sky.style.cssText = 'position:absolute;inset:0;background:linear-gradient(180deg,rgba(20,10,30,0) 0%,rgba(212,124,44,.18) 100%);' +
      'opacity:0;animation:fx-fade 5s ease forwards;';
    l.appendChild(sky);

    var sun = document.createElement('div');
    sun.style.cssText = 'position:absolute;left:50%;bottom:14vh;width:120px;height:120px;margin:0 0 -60px -60px;' +
      'border-radius:50%;background:radial-gradient(circle,#ffe4a0,#e8a33d 60%,rgba(232,163,61,0));' +
      'filter:blur(1px);will-change:transform,opacity;z-index:1;';
    l.appendChild(sun);
    sun.animate([
      { transform: 'translateY(60px) scale(.6)', opacity: 0 },
      { opacity: 1, offset: 0.25 },
      { transform: 'translateY(-18vh) scale(1)', opacity: 1, offset: 0.7 },
      { transform: 'translateY(-24vh) scale(1.05)', opacity: 0 }
    ], { duration: 5200, easing: 'ease-out', fill: 'forwards' });

    var pyramids = document.createElement('div');
    pyramids.style.cssText = 'position:absolute;left:0;right:0;bottom:13vh;z-index:2;opacity:0;' +
      'animation:fx-fade 5.2s ease forwards;';
    pyramids.innerHTML =
      '<svg viewBox="0 0 600 120" preserveAspectRatio="xMidYMax slice" ' +
        'xmlns="http://www.w3.org/2000/svg" style="width:100%;height:16vh;display:block">' +
        '<g fill="#1a1410">' +
          '<path d="M60 120 L150 30 L240 120 Z"/>' +
          '<path d="M210 120 L330 5 L450 120 Z"/>' +
          '<path d="M400 120 L470 45 L540 120 Z"/>' +
        '</g>' +
      '</svg>';
    l.appendChild(pyramids);
  }

  // Chine — un ruban de soie flotte et ondule en travers de l'écran.
  function silk() {
    var l = layer(5000);
    var colors = ['#c9313b', '#d8443a', '#e0b34a'];
    var s = document.createElement('div');
    s.style.cssText = 'position:absolute;left:-20vw;top:' + rand(20, 60) + 'vh;width:140vw;height:60px;opacity:0;';
    s.innerHTML =
      '<svg viewBox="0 0 1400 120" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;overflow:visible">' +
        '<path d="M0 60 C 200 10, 400 110, 600 60 S 1000 10, 1400 60" fill="none" ' +
          'stroke="' + pick(colors) + '" stroke-width="14" stroke-linecap="round" opacity=".85"/>' +
      '</svg>';
    l.appendChild(s);
    s.animate([
      { transform: 'translateX(0)', opacity: 0 },
      { opacity: 1, offset: 0.15 },
      { transform: 'translateX(35vw)', opacity: 1, offset: 0.8 },
      { transform: 'translateX(45vw)', opacity: 0 }
    ], { duration: 4600, easing: 'ease-in-out', fill: 'forwards' });
  }

  // Silhouette générique qui traverse l'écran en volant (corbeau, aigle, oiseau de feu...).
  function flyAcross(color, opts) {
    opts = opts || {};
    var l = layer(opts.life || 4400);
    var el = document.createElement('div');
    var top = rand(opts.top || 8, opts.top2 || 38);
    el.style.cssText = 'position:absolute;top:' + top + 'vh;left:-16vw;width:110px;opacity:0;will-change:transform,opacity;';
    el.innerHTML =
      '<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;overflow:visible">' +
        '<path d="M0 20 Q25 2 50 20 Q75 2 100 20 Q75 12 50 20 Q25 12 0 20 Z" fill="' + color + '"' +
          (opts.glow ? ' style="filter:drop-shadow(0 0 6px ' + color + ')"' : '') + '/>' +
      '</svg>';
    l.appendChild(el);
    if (opts.trail) {
      for (var i = 0; i < 5; i++) {
        (function (i) {
          var ember = document.createElement('div');
          ember.style.cssText = 'position:absolute;top:' + (top + rand(1, 3)) + 'vh;left:-16vw;' +
            'width:' + rand(3, 7) + 'px;height:' + rand(3, 7) + 'px;border-radius:50%;' +
            'background:' + color + ';opacity:0;box-shadow:0 0 6px ' + color + ';will-change:transform,opacity;';
          l.appendChild(ember);
          ember.animate([
            { transform: 'translateX(0) translateY(0)', opacity: 0 },
            { opacity: .9, offset: .15 },
            { transform: 'translate(' + (opts.dx || 132) + 'vw,' + (opts.dy || -8) + 'vh) translateY(6px)', opacity: 0 }
          ], { duration: (opts.duration || 4000) + i * 90, delay: 60 + i * 55, easing: 'ease-in', fill: 'forwards' });
        })(i);
      }
    }
    el.animate([
      { transform: 'translateX(0) translateY(0)', opacity: 0 },
      { opacity: 1, offset: .12 },
      { transform: 'translate(' + (opts.dx || 132) + 'vw,' + (opts.dy || -8) + 'vh)', opacity: 1, offset: .85 },
      { opacity: 0 }
    ], { duration: opts.duration || 4000, easing: 'ease-in-out', fill: 'forwards' });
  }

  // Grecque — un éclair de Zeus déchire brièvement le ciel.
  function lightning() {
    var l = layer(1400);
    var flash = document.createElement('div');
    flash.style.cssText = 'position:absolute;inset:0;background:#fff;opacity:0;';
    l.appendChild(flash);
    flash.animate([{ opacity: 0 }, { opacity: .5, offset: .08 }, { opacity: 0, offset: .16 },
      { opacity: .3, offset: .22 }, { opacity: 0 }], { duration: 700, easing: 'linear' });
    var bolt = document.createElement('div');
    bolt.style.cssText = 'position:absolute;left:' + rand(30, 65) + 'vw;top:-4vh;width:120px;opacity:0;';
    bolt.innerHTML =
      '<svg viewBox="0 0 60 220" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:60vh;overflow:visible">' +
        '<path d="M30 0 L10 90 L30 90 L0 220 L50 100 L28 100 Z" fill="#fff5c2" ' +
          'style="filter:drop-shadow(0 0 14px #ffe98a) drop-shadow(0 0 26px #fff)"/>' +
      '</svg>';
    l.appendChild(bolt);
    bolt.animate([{ opacity: 0 }, { opacity: 1, offset: .1 }, { opacity: 1, offset: .3 }, { opacity: 0 }],
      { duration: 900, easing: 'ease-out' });
  }

  // Égyptienne (mythologie) — l'Œil d'Horus s'ouvre et veille un instant.
  function eyeOfHorus() {
    var l = layer(3800);
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:50%;top:38%;transform:translate(-50%,-50%) scale(.6);' +
      'opacity:0;font-size:min(18vw,140px);color:#1e3a6e;filter:drop-shadow(0 0 18px #d4a017);';
    wrap.textContent = '𓂀';
    l.appendChild(wrap);
    wrap.animate([
      { transform: 'translate(-50%,-50%) scale(.5)', opacity: 0 },
      { transform: 'translate(-50%,-50%) scale(1)', opacity: 1, offset: .3 },
      { opacity: 1, offset: .75 },
      { transform: 'translate(-50%,-50%) scale(1.05)', opacity: 0 }
    ], { duration: 3600, easing: 'ease-out', fill: 'forwards' });
  }

  // Celtique — une brume légère traverse lentement l'écran.
  function mistDrift() {
    var l = layer(6200);
    for (var i = 0; i < 3; i++) {
      (function (i) {
        var band = document.createElement('div');
        band.style.cssText = 'position:absolute;left:-30vw;top:' + rand(5, 70) + 'vh;width:60vw;height:' + rand(60, 140) + 'px;' +
          'background:radial-gradient(ellipse at center,rgba(220,235,225,.30),transparent 70%);' +
          'filter:blur(6px);opacity:0;will-change:transform,opacity;';
        l.appendChild(band);
        band.animate([
          { transform: 'translateX(0)', opacity: 0 },
          { opacity: .8, offset: .2 },
          { opacity: .8, offset: .75 },
          { transform: 'translateX(140vw)', opacity: 0 }
        ], { duration: rand(5200, 6000), delay: i * 350, easing: 'linear', fill: 'forwards' });
      })(i);
    }
  }

  // Mésopotamienne — des étoiles s'allument une à une au-dessus d'une ziggourat.
  function starsZiggurat() {
    var l = layer(4600);
    var zig = document.createElement('div');
    zig.style.cssText = 'position:absolute;left:50%;bottom:8vh;transform:translateX(-50%);opacity:0;' +
      'animation:fx-fade 4.4s ease forwards;';
    zig.innerHTML =
      '<svg viewBox="0 0 300 140" xmlns="http://www.w3.org/2000/svg" style="width:min(60vw,420px);height:auto">' +
        '<g fill="#2a1c10">' +
          '<rect x="20" y="110" width="260" height="24"/>' +
          '<rect x="50" y="80" width="200" height="24"/>' +
          '<rect x="80" y="50" width="140" height="24"/>' +
          '<rect x="110" y="20" width="80" height="24"/>' +
        '</g>' +
      '</svg>';
    l.appendChild(zig);
    for (var i = 0; i < 9; i++) {
      (function (i) {
        var star = document.createElement('div');
        star.style.cssText = 'position:absolute;left:' + rand(15, 85) + 'vw;top:' + rand(4, 40) + 'vh;' +
          'width:3px;height:3px;border-radius:50%;background:#f2e6c8;opacity:0;' +
          'box-shadow:0 0 6px #f2e6c8,0 0 12px #b8860b;';
        l.appendChild(star);
        star.animate([{ opacity: 0 }, { opacity: 1, offset: .5 }, { opacity: .5, offset: .7 }, { opacity: 1 }],
          { duration: rand(1600, 2600), delay: 200 + i * 220, easing: 'ease-in-out', fill: 'forwards' });
      })(i);
    }
  }

  // Hindoue — un lotus s'ouvre pétale par pétale.
  function lotusBloom() {
    var l = layer(4200);
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:50%;top:42%;transform:translate(-50%,-50%);opacity:0;';
    var petals = '';
    for (var i = 0; i < 8; i++) {
      var angle = i * 45;
      petals += '<ellipse cx="60" cy="60" rx="12" ry="34" fill="#e8934a" opacity=".85" ' +
        'transform="rotate(' + angle + ' 60 60) translate(0 -26)"/>';
    }
    wrap.innerHTML =
      '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" style="width:min(40vw,220px);height:auto;overflow:visible">' +
        '<g style="filter:drop-shadow(0 0 12px #e8934a)">' + petals + '<circle cx="60" cy="60" r="14" fill="#f4c05a"/></g>' +
      '</svg>';
    l.appendChild(wrap);
    wrap.animate([
      { transform: 'translate(-50%,-50%) scale(.15) rotate(-20deg)', opacity: 0 },
      { transform: 'translate(-50%,-50%) scale(1) rotate(0)', opacity: 1, offset: .45 },
      { opacity: 1, offset: .8 },
      { opacity: 0 }
    ], { duration: 4000, easing: 'ease-out', fill: 'forwards' });
  }

  // Japonaise — un torii se dessine dans une lueur douce.
  function toriiGlow() {
    var l = layer(4200);
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:50%;top:46%;transform:translate(-50%,-50%) scale(.85);opacity:0;';
    wrap.innerHTML =
      '<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg" style="width:min(38vw,220px);height:auto;overflow:visible">' +
        '<g fill="#c8362c" style="filter:drop-shadow(0 0 16px rgba(200,54,44,.6))">' +
          '<rect x="10" y="30" width="180" height="16" rx="3"/>' +
          '<rect x="0" y="52" width="200" height="10"/>' +
          '<rect x="30" y="46" width="14" height="110"/>' +
          '<rect x="156" y="46" width="14" height="110"/>' +
        '</g>' +
      '</svg>';
    l.appendChild(wrap);
    wrap.animate([
      { transform: 'translate(-50%,-50%) scale(.85)', opacity: 0 },
      { opacity: 1, offset: .3 },
      { opacity: 1, offset: .78 },
      { opacity: 0 }
    ], { duration: 4000, easing: 'ease-out', fill: 'forwards' });
  }

  // Aztèque/Maya — Quetzalcoatl, le serpent à plumes, ondule à travers l'écran.
  function serpentGlide() {
    var l = layer(4600);
    var s = document.createElement('div');
    s.style.cssText = 'position:absolute;left:-20vw;top:' + rand(15, 55) + 'vh;width:140vw;height:100px;opacity:0;';
    s.innerHTML =
      '<svg viewBox="0 0 1400 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;overflow:visible">' +
        '<path d="M0 100 Q100 20 200 100 T400 100 T600 100 T800 100 T1000 100 T1200 100 T1400 100" ' +
          'fill="none" stroke="#2f9e6e" stroke-width="18" stroke-linecap="round" opacity=".9" ' +
          'style="filter:drop-shadow(0 0 10px #2fbf8a)"/>' +
        '<path d="M0 100 Q100 20 200 100 T400 100 T600 100 T800 100 T1000 100 T1200 100 T1400 100" ' +
          'fill="none" stroke="#e0b34a" stroke-width="4" stroke-dasharray="2 14" opacity=".8"/>' +
      '</svg>';
    l.appendChild(s);
    s.animate([
      { transform: 'translateX(0)', opacity: 0 },
      { opacity: 1, offset: .15 },
      { transform: 'translateX(35vw)', opacity: 1, offset: .82 },
      { transform: 'translateX(45vw)', opacity: 0 }
    ], { duration: 4600, easing: 'ease-in-out', fill: 'forwards' });
  }

  // Rome antique — trois colonnes de temple se révèlent de bas en haut.
  function romanColumns() {
    var l = layer(3600);
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:50%;bottom:6vh;transform:translateX(-50%);display:flex;gap:26px;opacity:0;';
    var cols = [];
    for (var i = 0; i < 3; i++) {
      var col = document.createElement('div');
      col.style.cssText = 'width:34px;height:min(38vh,260px);clip-path:inset(100% 0 0 0);transition:clip-path .9s ease-out;';
      col.innerHTML =
        '<svg viewBox="0 0 34 220" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block">' +
          '<rect x="0" y="0" width="34" height="14" fill="#c9a13f"/>' +
          '<rect x="4" y="14" width="26" height="190" fill="#f0e6cf"/>' +
          '<rect x="-2" y="204" width="38" height="16" fill="#c9a13f"/>' +
        '</svg>';
      wrap.appendChild(col);
      cols.push(col);
    }
    l.appendChild(wrap);
    cols.forEach(function (col, i) {
      setTimeout(function () { col.style.clipPath = 'inset(0% 0 0 0)'; }, 120 + i * 260);
    });
    wrap.animate([{ opacity: 0 }, { opacity: 1, offset: .12 }, { opacity: 1, offset: .82 }, { opacity: 0 }],
      { duration: 3600, easing: 'ease-out', fill: 'forwards' });
  }

  // Bigfoot — une série d'empreintes apparaît en diagonale, jamais la silhouette entière.
  function bigfootTracks() {
    var l = layer(4200);
    for (var i = 0; i < 5; i++) {
      (function (i) {
        var left = 20 + i * 12 + rand(-3, 3);
        var top = 70 - i * 10 + rand(-3, 3);
        var rotate = (i % 2 === 0 ? -18 : 18) + rand(-6, 6);
        var track = document.createElement('div');
        track.style.cssText = 'position:absolute;left:' + left + 'vw;top:' + top + 'vh;width:34px;' +
          'transform:rotate(' + rotate + 'deg) scale(.5);opacity:0;';
        track.innerHTML =
          '<svg viewBox="0 0 40 70" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;overflow:visible">' +
            '<ellipse cx="20" cy="46" rx="15" ry="22" fill="#3a2a1a" opacity=".8"/>' +
            '<circle cx="8" cy="12" r="6" fill="#3a2a1a" opacity=".8"/>' +
            '<circle cx="20" cy="6" r="6.5" fill="#3a2a1a" opacity=".8"/>' +
            '<circle cx="32" cy="12" r="6" fill="#3a2a1a" opacity=".8"/>' +
          '</svg>';
        l.appendChild(track);
        track.animate([
          { transform: 'rotate(' + rotate + 'deg) scale(.5)', opacity: 0 },
          { transform: 'rotate(' + rotate + 'deg) scale(1)', opacity: .75, offset: .25 },
          { opacity: .75, offset: .7 },
          { opacity: 0 }
        ], { duration: 2400, delay: i * 420, easing: 'ease-out', fill: 'forwards' });
      })(i);
    }
  }

  // Col Dyatlov — quelques flocons portés par le vent ; effet volontairement sobre, aucune mise en scène narrative.
  function dyatlovSnow() {
    var l = layer(5200);
    for (var i = 0; i < 14; i++) {
      (function (i) {
        var size = rand(2, 4);
        var flake = document.createElement('div');
        flake.style.cssText = 'position:absolute;left:' + rand(-5, 20) + 'vw;top:' + rand(0, 60) + 'vh;' +
          'width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:#eef3f6;opacity:0;' +
          'box-shadow:0 0 4px rgba(238,243,246,.6);will-change:transform,opacity;';
        l.appendChild(flake);
        flake.animate([
          { transform: 'translate(0,0)', opacity: 0 },
          { opacity: .7, offset: .15 },
          { opacity: .7, offset: .8 },
          { transform: 'translate(' + rand(55, 85) + 'vw,' + rand(30, 55) + 'vh)', opacity: 0 }
        ], { duration: rand(4200, 5200), delay: i * 90, easing: 'linear', fill: 'forwards' });
      })(i);
    }
  }

  // Grèce antique (culture) — un masque de théâtre pivote de la comédie à la tragédie.
  function greekMaskFlip() {
    var l = layer(3400);
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);' +
      'width:min(30vw,180px);perspective:600px;opacity:0;';
    var inner = document.createElement('div');
    inner.style.cssText = 'position:relative;width:100%;padding-top:100%;transform-style:preserve-3d;transition:transform 1.1s ease-in-out;';
    var comedy = document.createElement('div');
    comedy.style.cssText = 'position:absolute;inset:0;backface-visibility:hidden;';
    comedy.innerHTML =
      '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">' +
        '<circle cx="50" cy="50" r="46" fill="#f0e6cf" stroke="#8a6a2a" stroke-width="3"/>' +
        '<circle cx="34" cy="42" r="5" fill="#2a2a2a"/><circle cx="66" cy="42" r="5" fill="#2a2a2a"/>' +
        '<path d="M28 62 Q50 84 72 62" fill="none" stroke="#2a2a2a" stroke-width="4" stroke-linecap="round"/>' +
      '</svg>';
    var tragedy = document.createElement('div');
    tragedy.style.cssText = 'position:absolute;inset:0;backface-visibility:hidden;transform:rotateY(180deg);';
    tragedy.innerHTML =
      '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">' +
        '<circle cx="50" cy="50" r="46" fill="#e2d3ae" stroke="#5a4118" stroke-width="3"/>' +
        '<circle cx="34" cy="42" r="5" fill="#2a2a2a"/><circle cx="66" cy="42" r="5" fill="#2a2a2a"/>' +
        '<path d="M28 72 Q50 50 72 72" fill="none" stroke="#2a2a2a" stroke-width="4" stroke-linecap="round"/>' +
      '</svg>';
    inner.appendChild(comedy);
    inner.appendChild(tragedy);
    wrap.appendChild(inner);
    l.appendChild(wrap);
    wrap.animate([{ opacity: 0 }, { opacity: 1, offset: .1 }, { opacity: 1, offset: .85 }, { opacity: 0 }],
      { duration: 3400, easing: 'ease-out', fill: 'forwards' });
    setTimeout(function () { inner.style.transform = 'rotateY(180deg)'; }, 900);
  }

  // Le Yeti — rafale de neige dense et une silhouette floue qui apparaît puis se dissout sans jamais se préciser.
  function yetiBlizzard() {
    var l = layer(4800);
    for (var i = 0; i < 22; i++) {
      (function (i) {
        var size = rand(2, 5);
        var flake = document.createElement('div');
        flake.style.cssText = 'position:absolute;left:' + rand(-10, 30) + 'vw;top:' + rand(-5, 70) + 'vh;' +
          'width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:#eef4fa;opacity:0;' +
          'box-shadow:0 0 5px rgba(238,244,250,.7);will-change:transform,opacity;';
        l.appendChild(flake);
        flake.animate([
          { transform: 'translate(0,0)', opacity: 0 },
          { opacity: .85, offset: .1 },
          { opacity: .85, offset: .75 },
          { transform: 'translate(' + rand(70, 100) + 'vw,' + rand(35, 60) + 'vh)', opacity: 0 }
        ], { duration: rand(3200, 4200), delay: i * 70, easing: 'linear', fill: 'forwards' });
      })(i);
    }
    var sil = document.createElement('div');
    sil.style.cssText = 'position:absolute;left:58%;top:40%;width:min(16vw,110px);height:min(28vh,220px);' +
      'transform:translate(-50%,-50%);opacity:0;filter:blur(7px);' +
      'background:radial-gradient(ellipse at 50% 30%,rgba(200,210,220,.55),transparent 70%);border-radius:50% 50% 40% 40%;';
    l.appendChild(sil);
    sil.animate([
      { opacity: 0, filter: 'blur(10px)' },
      { opacity: .5, offset: .35, filter: 'blur(6px)' },
      { opacity: .5, offset: .55, filter: 'blur(8px)' },
      { opacity: 0, filter: 'blur(12px)' }
    ], { duration: 3600, delay: 500, easing: 'ease-in-out', fill: 'forwards' });
  }

  // Manuscrit de Voynich — des glyphes inventés (jamais un vrai alphabet) défilent puis se brouillent sans jamais se lire.
  function voynichScript() {
    var l = layer(4200);
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:50%;top:40%;transform:translate(-50%,-50%);width:min(50vw,380px);opacity:0;';
    var rows = '';
    for (var r = 0; r < 5; r++) {
      for (var c = 0; c < 9; c++) {
        var x = c * 22, y = r * 30;
        var h1 = rand(4, 14), h2 = rand(-10, 10);
        rows += '<path d="M' + x + ' ' + (y + 14) + ' q4 ' + (-h1) + ' 8 0 q4 ' + h2 + ' 8 0" ' +
          'fill="none" stroke="#3a4a1e" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>';
      }
    }
    wrap.innerHTML = '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;overflow:visible">' + rows + '</svg>';
    l.appendChild(wrap);
    wrap.animate([
      { opacity: 0, filter: 'blur(3px)' },
      { opacity: .9, offset: .25, filter: 'blur(0px)' },
      { opacity: .9, offset: .65, filter: 'blur(0px)' },
      { opacity: 0, filter: 'blur(5px)' }
    ], { duration: 4200, easing: 'ease-in-out', fill: 'forwards' });
  }

  // Vikings — un drakkar à voile rayée traverse l'écran.
  function vikingLonghship() {
    var l = layer(4400);
    var top = rand(30, 55);
    var ship = document.createElement('div');
    ship.style.cssText = 'position:absolute;top:' + top + 'vh;left:-22vw;width:180px;opacity:0;will-change:transform,opacity;';
    ship.innerHTML =
      '<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;overflow:visible">' +
        '<path d="M10 110 Q100 130 190 110 L175 100 Q100 112 25 100 Z" fill="#4a3320"/>' +
        '<rect x="96" y="20" width="4" height="80" fill="#6b4a2a"/>' +
        '<path d="M60 28 L140 28 L128 78 L72 78 Z" fill="#e2d3ae" stroke="#8a1f1f" stroke-width="6" stroke-dasharray="14 14"/>' +
        '<path d="M96 15 Q104 5 96 -2 Q88 5 96 15" fill="#c9a13f"/>' +
      '</svg>';
    l.appendChild(ship);
    ship.animate([
      { transform: 'translateX(0) translateY(0)', opacity: 0 },
      { opacity: 1, offset: .12 },
      { transform: 'translate(132vw,' + rand(-3, 3) + 'vh)', opacity: 1, offset: .85 },
      { opacity: 0 }
    ], { duration: 4400, easing: 'ease-in-out', fill: 'forwards' });
  }

  // Chupacabra — deux yeux rouges dans une palette désertique et une ombre qui bondit entre les cactus.
  function chupacabraEyes() {
    var l = layer(3600);
    for (var c = 0; c < 3; c++) {
      var cactus = document.createElement('div');
      cactus.style.cssText = 'position:absolute;bottom:0;left:' + (15 + c * 30 + rand(-4, 4)) + 'vw;width:18px;height:' + rand(60, 100) + 'px;background:#2e4a2a;border-radius:8px;opacity:.5;';
      l.appendChild(cactus);
    }
    var eyes = document.createElement('div');
    eyes.style.cssText = 'position:absolute;left:' + rand(30, 60) + 'vw;top:' + rand(35, 55) + 'vh;opacity:0;display:flex;gap:14px;';
    eyes.innerHTML =
      '<div style="width:10px;height:10px;border-radius:50%;background:#ff2b2b;box-shadow:0 0 12px #ff2b2b,0 0 24px #b30000;"></div>' +
      '<div style="width:10px;height:10px;border-radius:50%;background:#ff2b2b;box-shadow:0 0 12px #ff2b2b,0 0 24px #b30000;"></div>';
    l.appendChild(eyes);
    eyes.animate([
      { opacity: 0, transform: 'scale(.6)' },
      { opacity: 1, offset: .2, transform: 'scale(1)' },
      { opacity: 1, offset: .5 },
      { opacity: 0, transform: 'translateX(40vw) scale(.7)' }
    ], { duration: 3200, delay: 300, easing: 'ease-in-out', fill: 'forwards' });
    var shadow = document.createElement('div');
    shadow.style.cssText = 'position:absolute;bottom:6vh;left:20vw;width:50px;height:26px;border-radius:50%;background:rgba(20,10,5,.6);filter:blur(2px);opacity:0;';
    l.appendChild(shadow);
    shadow.animate([
      { transform: 'translate(0,0)', opacity: 0 },
      { opacity: .8, offset: .15 },
      { transform: 'translate(20vw,-10vh)', opacity: .8, offset: .4 },
      { transform: 'translate(40vw,0)', opacity: .8, offset: .65 },
      { transform: 'translate(60vw,-8vh)', opacity: 0 }
    ], { duration: 3400, delay: 200, easing: 'ease-in-out', fill: 'forwards' });
  }

  // Lignes de Nazca — un géoglyphe de colibri se dessine trait par trait.
  function nazcaLines() {
    var l = layer(4200);
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:50%;top:42%;transform:translate(-50%,-50%);width:min(40vw,280px);opacity:0;';
    wrap.innerHTML =
      '<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;overflow:visible">' +
        '<path id="nazca-bird" d="M20 90 Q40 40 80 50 Q100 30 130 45 Q160 35 180 60 Q150 65 140 90 Q160 110 150 130 Q120 110 100 120 Q70 130 50 115 Q30 110 20 90 Z" ' +
          'fill="none" stroke="#8a5a2a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>';
    l.appendChild(wrap);
    wrap.animate([{ opacity: 0 }, { opacity: 1, offset: .06 }, { opacity: 1, offset: .88 }, { opacity: 0 }],
      { duration: 4200, easing: 'linear', fill: 'forwards' });
    requestAnimationFrame(function () {
      var path = wrap.querySelector('#nazca-bird');
      if (!path || !path.getTotalLength) return;
      var len = path.getTotalLength();
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;
      path.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
        { duration: 3000, delay: 200, easing: 'ease-in-out', fill: 'forwards' });
    });
  }

  // Empire du Mali — une caravane de chameaux silhouette traverse l'écran dans un nuage de poussière dorée.
  function maliCaravan() {
    var l = layer(4600);
    var y = rand(45, 62);
    for (var i = 0; i < 4; i++) {
      (function (i) {
        var cam = document.createElement('div');
        cam.style.cssText = 'position:absolute;top:' + (y + i * 2.2) + 'vh;left:-14vw;width:70px;opacity:0;will-change:transform,opacity;';
        cam.innerHTML =
          '<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;overflow:visible">' +
            '<path d="M8 50 Q10 30 20 28 Q24 14 32 22 Q36 10 42 22 Q50 16 52 28 Q62 26 64 42 Q70 40 74 50 Z" fill="#2a1c0e" opacity="0.88"/>' +
            '<rect x="14" y="48" width="4" height="10" fill="#2a1c0e"/><rect x="60" y="48" width="4" height="10" fill="#2a1c0e"/>' +
          '</svg>';
        l.appendChild(cam);
        cam.animate([
          { transform: 'translateX(0)', opacity: 0 },
          { opacity: .85, offset: .12 },
          { transform: 'translate(128vw,0)', opacity: .85, offset: .85 },
          { opacity: 0 }
        ], { duration: 4800 + i * 200, delay: i * 260, easing: 'linear', fill: 'forwards' });
      })(i);
    }
    for (var d = 0; d < 16; d++) {
      var dust = document.createElement('div');
      var size = rand(2, 4);
      dust.style.cssText = 'position:absolute;top:' + rand(y + 4, y + 14) + 'vh;left:' + rand(-10, 20) + 'vw;' +
        'width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:#e0b25a;opacity:0;box-shadow:0 0 6px #f2c96a;';
      l.appendChild(dust);
      dust.animate([
        { transform: 'translate(0,0)', opacity: 0 },
        { opacity: .7, offset: .2 },
        { transform: 'translate(' + rand(90, 130) + 'vw,' + rand(-3, 3) + 'vh)', opacity: 0 }
      ], { duration: rand(4200, 5200), delay: rand(0, 800), easing: 'linear', fill: 'forwards' });
    }
  }

  // Le Mothman — une grande ombre ailée passe rapidement devant un halo de lumière (pont de Point Pleasant).
  function mothmanShadow() {
    var l = layer(3200);
    var halo = document.createElement('div');
    halo.style.cssText = 'position:absolute;left:50%;top:38%;width:180px;height:180px;transform:translate(-50%,-50%);' +
      'border-radius:50%;background:radial-gradient(circle,rgba(255,240,200,.35),transparent 70%);opacity:0;';
    l.appendChild(halo);
    halo.animate([{ opacity: 0 }, { opacity: 1, offset: .25 }, { opacity: 1, offset: .7 }, { opacity: 0 }],
      { duration: 3200, easing: 'ease-in-out', fill: 'forwards' });

    var shadow = document.createElement('div');
    shadow.style.cssText = 'position:absolute;top:' + rand(28, 42) + 'vh;left:-20vw;width:220px;opacity:0;will-change:transform,opacity;';
    shadow.innerHTML =
      '<svg viewBox="0 0 220 100" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;overflow:visible">' +
        '<path d="M110 40 L60 4 L70 44 L4 30 L54 56 L4 82 L70 66 L60 96 L110 60 L160 96 L150 66 L216 82 L166 56 L216 30 L150 44 L160 4 Z" fill="#0c0c10" opacity="0.92"/>' +
        '<circle cx="104" cy="42" r="3" fill="#c1272d"/><circle cx="116" cy="42" r="3" fill="#c1272d"/>' +
      '</svg>';
    l.appendChild(shadow);
    shadow.animate([
      { transform: 'translateX(0)', opacity: 0 },
      { opacity: .95, offset: .18 },
      { transform: 'translate(140vw,' + rand(-4, 4) + 'vh)', opacity: .95, offset: .6 },
      { opacity: 0 }
    ], { duration: 2600, delay: 300, easing: 'ease-in-out', fill: 'forwards' });
  }

  // Mécanisme d'Anticythère — des engrenages antiques s'assemblent et se mettent à tourner.
  function antikytheraGears() {
    var l = layer(4000);
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:50%;top:42%;transform:translate(-50%,-50%);width:min(26vw,170px);opacity:0;';
    function gearSvg(r, teeth, color) {
      var path = '';
      for (var i = 0; i < teeth; i++) {
        var a = (i / teeth) * 360;
        path += '<rect x="' + (50 - 4) + '" y="' + (50 - r - 6) + '" width="8" height="7" fill="' + color + '" transform="rotate(' + a + ' 50 50)"/>';
      }
      return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;overflow:visible">' +
        '<circle cx="50" cy="50" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="6"/>' + path +
        '<circle cx="50" cy="50" r="5" fill="' + color + '"/></svg>';
    }
    var g1 = document.createElement('div');
    g1.style.cssText = 'position:absolute;left:0;top:10%;width:60%;';
    g1.innerHTML = gearSvg(30, 10, '#b9862f');
    var g2 = document.createElement('div');
    g2.style.cssText = 'position:absolute;right:-6%;top:38%;width:42%;';
    g2.innerHTML = gearSvg(30, 8, '#8f6a24');
    wrap.appendChild(g1);
    wrap.appendChild(g2);
    l.appendChild(wrap);
    wrap.animate([{ opacity: 0, transform: 'translate(-50%,-50%) scale(.85)' }, { opacity: 1, offset: .15, transform: 'translate(-50%,-50%) scale(1)' },
      { opacity: 1, offset: .82 }, { opacity: 0 }], { duration: 4000, easing: 'ease-out', fill: 'forwards' });
    g1.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(120deg)' }], { duration: 3600, delay: 400, easing: 'linear', fill: 'forwards' });
    g2.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-150deg)' }], { duration: 3600, delay: 400, easing: 'linear', fill: 'forwards' });
  }

  // Mythologie chinoise — un dragon serpente à travers des nuages stylisés.
  function dragonCloudGlide() {
    var l = layer(4600);
    for (var c = 0; c < 3; c++) {
      (function (c) {
        var cloud = document.createElement('div');
        cloud.style.cssText = 'position:absolute;top:' + rand(10, 60) + 'vh;left:' + rand(-10, 90) + 'vw;' +
          'width:' + rand(90, 160) + 'px;height:' + rand(30, 50) + 'px;border-radius:50%;' +
          'background:radial-gradient(ellipse,rgba(240,240,245,.35),transparent 70%);opacity:0;filter:blur(2px);';
        l.appendChild(cloud);
        cloud.animate([{ opacity: 0 }, { opacity: .8, offset: .2 }, { opacity: .8, offset: .75 }, { opacity: 0 }],
          { duration: rand(4000, 4600), delay: c * 300, easing: 'ease-in-out', fill: 'forwards' });
      })(c);
    }
    var dragon = document.createElement('div');
    dragon.style.cssText = 'position:absolute;top:' + rand(20, 45) + 'vh;left:-24vw;width:150vw;height:120px;opacity:0;';
    dragon.innerHTML =
      '<svg viewBox="0 0 1400 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;overflow:visible">' +
        '<path d="M40 100 Q160 20 280 100 T520 100 T760 100 T1000 100 T1240 100" ' +
          'fill="none" stroke="#2f9e4a" stroke-width="20" stroke-linecap="round" opacity=".92" ' +
          'style="filter:drop-shadow(0 0 12px #4fd06a)"/>' +
        '<path d="M40 100 Q160 20 280 100 T520 100 T760 100 T1000 100 T1240 100" ' +
          'fill="none" stroke="#e8b23a" stroke-width="4" stroke-dasharray="3 16" opacity=".85"/>' +
        '<circle cx="30" cy="100" r="16" fill="#2f9e4a" style="filter:drop-shadow(0 0 10px #4fd06a)"/>' +
        '<circle cx="24" cy="94" r="3" fill="#fff5c2"/>' +
      '</svg>';
    l.appendChild(dragon);
    dragon.animate([
      { transform: 'translateX(0)', opacity: 0 },
      { opacity: 1, offset: .15 },
      { transform: 'translateX(38vw)', opacity: 1, offset: .82 },
      { transform: 'translateX(48vw)', opacity: 0 }
    ], { duration: 4600, easing: 'ease-in-out', fill: 'forwards' });
  }

  // Excalibur — l'épée se dégage de la pierre en un seul mouvement, éclat de
  // lame au sommet. Première scène de la famille « objets légendaires » : le
  // principe de la série est que l'objet lui-même se construit, se forge ou se
  // dégage, jamais une créature qui traverse ni des glyphes qui pleuvent.
  function excaliburDraw() {
    var l = layer(4200);
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:50%;bottom:8vh;transform:translateX(-50%);' +
      'width:min(30vh,220px);height:min(56vh,420px);';
    // La lame monte derrière la pierre (z-index), donc elle a l'air d'en sortir.
    var blade = document.createElement('div');
    blade.style.cssText = 'position:absolute;left:50%;bottom:26%;transform:translate(-50%,40%);' +
      'width:38%;height:78%;z-index:1;';
    blade.innerHTML =
      '<svg viewBox="0 0 60 300" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block">' +
        '<defs><linearGradient id="fx-exc-b" x1="0" y1="0" x2="1" y2="0">' +
          '<stop offset="0" stop-color="#7d8798"/><stop offset=".45" stop-color="#eef3fa"/>' +
          '<stop offset="1" stop-color="#8b95a6"/></linearGradient></defs>' +
        '<path d="M30 4 L40 40 L40 214 L30 232 L20 214 L20 40 Z" fill="url(#fx-exc-b)"/>' +
        '<rect x="6" y="232" width="48" height="9" rx="3" fill="#c9982f"/>' +
        '<rect x="26" y="241" width="8" height="34" fill="#8a6a2f"/>' +
        '<circle cx="30" cy="281" r="8" fill="#c9982f"/>' +
      '</svg>';
    var stone = document.createElement('div');
    stone.style.cssText = 'position:absolute;left:50%;bottom:0;transform:translateX(-50%);' +
      'width:100%;height:30%;z-index:2;';
    stone.innerHTML =
      '<svg viewBox="0 0 200 90" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block">' +
        '<path d="M18 88 L6 40 L34 14 L104 6 L172 20 L192 56 L182 88 Z" fill="#4a4a52"/>' +
        '<path d="M34 14 L104 6 L172 20 L150 34 L60 30 Z" fill="#5e5e67"/>' +
        '<path d="M96 22 L112 22 L110 34 L98 34 Z" fill="#23232a"/>' +
      '</svg>';
    var flash = document.createElement('div');
    flash.style.cssText = 'position:absolute;left:50%;top:2%;transform:translate(-50%,-50%);' +
      'width:34%;aspect-ratio:1;border-radius:50%;opacity:0;z-index:3;' +
      'background:radial-gradient(circle,rgba(255,252,235,.95),rgba(255,240,190,0) 68%);';
    wrap.appendChild(blade);
    wrap.appendChild(stone);
    wrap.appendChild(flash);
    l.appendChild(wrap);

    wrap.animate([{ opacity: 0 }, { opacity: 1, offset: .08 },
                  { opacity: 1, offset: .84 }, { opacity: 0 }],
      { duration: 4200, easing: 'ease-out', fill: 'forwards' });
    blade.animate([
      { transform: 'translate(-50%,40%)' },
      { transform: 'translate(-50%,34%)', offset: .18 },   // la résistance, puis ça cède
      { transform: 'translate(-50%,-14%)', offset: .62 },
      { transform: 'translate(-50%,-14%)' }
    ], { duration: 4200, easing: 'cubic-bezier(.2,.9,.2,1)', fill: 'forwards' });
    flash.animate([{ opacity: 0 }, { opacity: 0, offset: .58 },
                   { opacity: 1, offset: .68 }, { opacity: 0, offset: .86 }],
      { duration: 4200, easing: 'ease-out', fill: 'forwards' });
  }

  // Arche d'Alliance — deux ailes de chérubins en or se déploient au-dessus du
  // coffre, qui reste fermé : l'effet est la protection, jamais l'ouverture.
  function archeCherubins() {
    var l = layer(4400);
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:50%;bottom:10vh;transform:translateX(-50%);' +
      'width:min(38vh,280px);height:min(26vh,190px);';

    var box = document.createElement('div');
    box.style.cssText = 'position:absolute;left:50%;bottom:0;transform:translateX(-50%);width:74%;height:56%;z-index:2;';
    box.innerHTML =
      '<svg viewBox="0 0 200 110" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block">' +
        '<defs><linearGradient id="fx-ark-g" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#f0d27a"/><stop offset="1" stop-color="#b9862f"/></linearGradient></defs>' +
        '<rect x="10" y="26" width="180" height="74" rx="4" fill="url(#fx-ark-g)" stroke="#6b4a1f" stroke-width="3"/>' +
        '<rect x="10" y="14" width="180" height="16" rx="3" fill="#d8b45a" stroke="#6b4a1f" stroke-width="2"/>' +
      '</svg>';

    var wingL = document.createElement('div');
    wingL.style.cssText = 'position:absolute;left:50%;bottom:52%;width:46%;height:60%;z-index:1;' +
      'transform:translate(-98%,0) rotate(24deg) scale(.7);transform-origin:100% 100%;opacity:0;';
    wingL.innerHTML =
      '<svg viewBox="0 0 120 130" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;overflow:visible">' +
        '<path d="M118 128 Q60 100 30 40 Q10 4 60 10 Q40 40 60 70 Q80 40 118 128 Z" fill="#d8b45a" stroke="#6b4a1f" stroke-width="2"/>' +
      '</svg>';

    var wingR = document.createElement('div');
    wingR.style.cssText = 'position:absolute;right:50%;bottom:52%;width:46%;height:60%;z-index:1;' +
      'transform:translate(98%,0) rotate(-24deg) scale(.7);transform-origin:0% 100%;opacity:0;';
    wingR.innerHTML =
      '<svg viewBox="0 0 120 130" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;overflow:visible">' +
        '<path d="M2 128 Q60 100 90 40 Q110 4 60 10 Q80 40 60 70 Q40 40 2 128 Z" fill="#d8b45a" stroke="#6b4a1f" stroke-width="2"/>' +
      '</svg>';

    wrap.appendChild(box);
    wrap.appendChild(wingL);
    wrap.appendChild(wingR);
    l.appendChild(wrap);

    wrap.animate([{ opacity: 0 }, { opacity: 1, offset: .08 }, { opacity: 1, offset: .84 }, { opacity: 0 }],
      { duration: 4400, easing: 'ease-out', fill: 'forwards' });
    wingL.animate([
      { opacity: 0, transform: 'translate(-98%,0) rotate(24deg) scale(.7)' },
      { opacity: 1, offset: .4, transform: 'translate(-98%,0) rotate(0deg) scale(1)' },
      { opacity: 1, offset: .82 },
      { opacity: 0 }
    ], { duration: 4400, delay: 250, easing: 'cubic-bezier(.2,.9,.2,1)', fill: 'forwards' });
    wingR.animate([
      { opacity: 0, transform: 'translate(98%,0) rotate(-24deg) scale(.7)' },
      { opacity: 1, offset: .4, transform: 'translate(98%,0) rotate(0deg) scale(1)' },
      { opacity: 1, offset: .82 },
      { opacity: 0 }
    ], { duration: 4400, delay: 250, easing: 'cubic-bezier(.2,.9,.2,1)', fill: 'forwards' });
  }

  // Trois Trésors du Japon — trois coffres scellés s'alignent et restent
  // fermés : le refus de montrer est l'effet, jamais l'ouverture.
  function tresorsCoffres() {
    var l = layer(4200);
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:50%;bottom:16vh;transform:translateX(-50%);' +
      'display:flex;gap:min(4vw,32px);opacity:0;';
    [-1, 0, 1].forEach(function (p, i) {
      var box = document.createElement('div');
      var startY = 30 * Math.abs(p);
      box.style.cssText = 'width:min(11vh,86px);height:min(9vh,70px);opacity:0;transform:translateY(' + startY + 'px);';
      box.innerHTML =
        '<svg viewBox="0 0 90 74" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block">' +
          '<rect x="4" y="26" width="82" height="44" rx="3" fill="#26211c" stroke="#8a6a2f" stroke-width="2"/>' +
          '<rect x="4" y="14" width="82" height="16" rx="3" fill="#332b23" stroke="#8a6a2f" stroke-width="2"/>' +
          '<rect x="40" y="26" width="10" height="14" fill="#c9982f"/>' +
        '</svg>';
      wrap.appendChild(box);
      box.animate([
        { opacity: 0, transform: 'translateY(' + startY + 'px)' },
        { opacity: 1, offset: .3, transform: 'translateY(0)' },
        { opacity: 1, offset: .8 },
        { opacity: .55 }
      ], { duration: 4200, delay: i * 260, easing: 'ease-out', fill: 'forwards' });
    });
    l.appendChild(wrap);
    wrap.animate([{ opacity: 0 }, { opacity: 1, offset: .06 }, { opacity: 1, offset: .88 }, { opacity: 0 }],
      { duration: 4200, easing: 'ease-out', fill: 'forwards' });

    var sheen = document.createElement('div');
    sheen.style.cssText = 'position:absolute;left:50%;bottom:16vh;transform:translateX(-50%) translateX(-30%);' +
      'width:min(40vh,320px);height:min(11vh,90px);pointer-events:none;opacity:0;' +
      'background:linear-gradient(100deg,transparent 30%,rgba(232,193,100,.35) 50%,transparent 70%);';
    l.appendChild(sheen);
    sheen.animate([
      { opacity: 0, transform: 'translateX(-50%) translateX(-30%)' },
      { opacity: .9, offset: .5, transform: 'translateX(-50%) translateX(30%)' },
      { opacity: 0, transform: 'translateX(-50%) translateX(60%)' }
    ], { duration: 2400, delay: 1600, easing: 'ease-in-out', fill: 'forwards' });
  }

  // Tabouret d'or des Ashanti — le tabouret descend se poser sur un coussin
  // sans jamais toucher le sol : sobre, respectueux, aucune mise en scène de trône.
  function tabouretSuspendu() {
    var l = layer(4000);
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:50%;bottom:12vh;transform:translateX(-50%);width:min(20vh,150px);opacity:0;';

    var cushion = document.createElement('div');
    cushion.style.cssText = 'position:absolute;left:50%;bottom:0;transform:translateX(-50%);width:120%;';
    cushion.innerHTML =
      '<svg viewBox="0 0 180 40" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block">' +
        '<ellipse cx="90" cy="24" rx="82" ry="14" fill="#7a1f2b"/>' +
        '<ellipse cx="90" cy="18" rx="82" ry="14" fill="#a6293a"/>' +
      '</svg>';

    var stool = document.createElement('div');
    stool.style.cssText = 'position:absolute;left:50%;bottom:22%;transform:translate(-50%,-70px);width:64%;';
    stool.innerHTML =
      '<svg viewBox="0 0 120 130" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block;filter:drop-shadow(0 0 10px rgba(216,180,90,.5))">' +
        '<defs><linearGradient id="fx-stool-g" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#f0d27a"/><stop offset="1" stop-color="#b9862f"/></linearGradient></defs>' +
        '<path d="M14 30 Q60 -6 106 30 L96 46 Q60 20 24 46 Z" fill="url(#fx-stool-g)"/>' +
        '<path d="M30 46 Q60 66 90 46 L84 120 L74 120 L70 60 Q60 66 50 60 L46 120 L36 120 Z" fill="url(#fx-stool-g)"/>' +
      '</svg>';

    wrap.appendChild(cushion);
    wrap.appendChild(stool);
    l.appendChild(wrap);

    wrap.animate([{ opacity: 0 }, { opacity: 1, offset: .1 }, { opacity: 1, offset: .84 }, { opacity: 0 }],
      { duration: 4000, easing: 'ease-out', fill: 'forwards' });
    stool.animate([
      { transform: 'translate(-50%,-70px)' },
      { transform: 'translate(-50%,-6px)', offset: .5 },
      { transform: 'translate(-50%,-6px)' }
    ], { duration: 4000, easing: 'cubic-bezier(.2,.9,.2,1)', fill: 'forwards' });
  }

  // Mjöllnir — un marteau se forge sous des coups d'enclume répétés,
  // étincelles à chaque frappe. Aucune mise en scène d'usage moderne du
  // symbole : seulement la forge, conformément à la note de vigilance.
  function mjollnirForge() {
    var l = layer(4200);
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:50%;bottom:10vh;transform:translateX(-50%);width:min(26vh,190px);';

    var anvil = document.createElement('div');
    anvil.style.cssText = 'position:absolute;left:50%;bottom:0;transform:translateX(-50%);width:90%;';
    anvil.innerHTML =
      '<svg viewBox="0 0 160 60" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block">' +
        '<path d="M10 58 L20 30 L60 24 L140 24 L150 40 L150 58 Z" fill="#33383f" stroke="#14171b" stroke-width="2"/>' +
        '<rect x="70" y="10" width="18" height="16" fill="#33383f" stroke="#14171b" stroke-width="2"/>' +
      '</svg>';

    var hammer = document.createElement('div');
    hammer.style.cssText = 'position:absolute;left:50%;bottom:44%;width:52%;transform:translate(-50%,-60px) rotate(-18deg);opacity:0;';
    hammer.innerHTML =
      '<svg viewBox="0 0 100 90" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;overflow:visible">' +
        '<rect x="44" y="30" width="12" height="58" rx="3" fill="#8a6a2f"/>' +
        '<rect x="10" y="4" width="80" height="34" rx="6" fill="#7fb8e0" style="filter:drop-shadow(0 0 8px #7fb8e0)"/>' +
      '</svg>';

    wrap.appendChild(anvil);
    wrap.appendChild(hammer);
    l.appendChild(wrap);

    wrap.animate([{ opacity: 0 }, { opacity: 1, offset: .06 }, { opacity: 1, offset: .9 }, { opacity: 0 }],
      { duration: 4200, easing: 'ease-out', fill: 'forwards' });
    hammer.animate([
      { opacity: 1, transform: 'translate(-50%,-60px) rotate(-18deg)' },
      { transform: 'translate(-50%,6px) rotate(6deg)', offset: .18 },
      { transform: 'translate(-50%,-50px) rotate(-16deg)', offset: .32 },
      { transform: 'translate(-50%,6px) rotate(6deg)', offset: .48 },
      { transform: 'translate(-50%,-50px) rotate(-16deg)', offset: .62 },
      { transform: 'translate(-50%,6px) rotate(6deg)', offset: .78 },
      { transform: 'translate(-50%,-20px) rotate(-10deg)', offset: .9 },
      { opacity: 1 }
    ], { duration: 4200, easing: 'ease-in-out', fill: 'forwards' });

    [0.18, 0.48, 0.78].forEach(function (t) {
      setTimeout(function () {
        for (var i = 0; i < 8; i++) {
          var spark = document.createElement('div');
          var ang = rand(-70, -110), dist = rand(20, 50);
          spark.style.cssText = 'position:absolute;left:50%;bottom:44%;width:3px;height:3px;border-radius:50%;' +
            'background:#f4a34a;box-shadow:0 0 6px #f4a34a;opacity:0;';
          wrap.appendChild(spark);
          var dx = Math.cos(ang * Math.PI / 180) * dist, dy = Math.sin(ang * Math.PI / 180) * dist;
          spark.animate([
            { transform: 'translate(0,0)', opacity: 1 },
            { transform: 'translate(' + dx + 'px,' + (-Math.abs(dy)) + 'px)', opacity: 0 }
          ], { duration: 500, easing: 'ease-out', fill: 'forwards' });
        }
      }, t * 4200);
    });
  }

  // Le Cheval de Troie — un cheval de bois s'assemble planche par planche,
  // puis roule hors de l'écran.
  function chevalTroieAssemble() {
    var l = layer(4600);
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:38%;bottom:10vh;width:min(30vh,220px);';

    var pieces = [
      { d: 'M20 130 L26 60 L34 60 L34 130 Z', y: -40 },
      { d: 'M150 130 L156 60 L164 60 L164 130 Z', y: -40 },
      { d: 'M10 40 Q90 6 170 40 L166 74 Q90 46 14 74 Z', y: -60 },
      { d: 'M158 10 Q186 6 190 34 Q182 50 160 46 Z', y: -70 },
      { d: 'M10 44 L-4 70 L10 66 Z', y: -50 }
    ];
    var els = pieces.map(function (p) {
      var el = document.createElement('div');
      el.style.cssText = 'position:absolute;inset:0;opacity:0;transform:translateY(' + p.y + 'px);';
      el.innerHTML = '<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;overflow:visible">' +
        '<path d="' + p.d + '" fill="#7a5c34" stroke="#4a3820" stroke-width="2"/></svg>';
      wrap.appendChild(el);
      return el;
    });
    l.appendChild(wrap);

    wrap.animate([{ opacity: 0 }, { opacity: 1, offset: .04 }, { opacity: 1, offset: .86 }, { opacity: 0 }],
      { duration: 4600, easing: 'ease-out', fill: 'forwards' });

    els.forEach(function (el, i) {
      el.animate([
        { opacity: 0, transform: 'translateY(' + pieces[i].y + 'px)' },
        { opacity: 1, offset: .5, transform: 'translateY(0)' },
        { opacity: 1 }
      ], { duration: 600, delay: 200 + i * 260, easing: 'cubic-bezier(.2,.9,.2,1)', fill: 'forwards' });
    });

    var rollStart = (200 + pieces.length * 260 + 500) / 4600;
    wrap.animate([
      { transform: 'translateX(0) rotate(0deg)' },
      { transform: 'translateX(0) rotate(0deg)', offset: Math.min(rollStart, .9) },
      { transform: 'translateX(60vw) rotate(14deg)' }
    ], { duration: 4600, easing: 'ease-in', fill: 'forwards' });
  }

  // La Pierre du Soleil aztèque — un disque tourne d'un cran puis s'arrête
  // net : jamais un défilement continu façon calendrier, c'est justement
  // l'erreur que la page corrige.
  function pierreSoleilTourne() {
    var l = layer(4000);
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);width:min(28vh,200px);opacity:0;';
    wrap.innerHTML =
      '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;overflow:visible">' +
        '<circle cx="100" cy="100" r="92" fill="#2a3324" stroke="#5ad0c8" stroke-width="3"/>' +
        '<circle cx="100" cy="100" r="70" fill="none" stroke="#e8c164" stroke-width="2" stroke-dasharray="4 7"/>' +
        '<circle cx="100" cy="100" r="48" fill="none" stroke="#5ad0c8" stroke-width="2"/>' +
        '<circle cx="100" cy="100" r="26" fill="#3a2a1c" stroke="#e8c164" stroke-width="3"/>' +
        '<circle cx="100" cy="100" r="6" fill="#e8c164"/>' +
      '</svg>';
    l.appendChild(wrap);

    wrap.animate([{ opacity: 0 }, { opacity: 1, offset: .1 }, { opacity: 1, offset: .86 }, { opacity: 0 }],
      { duration: 4000, easing: 'ease-out', fill: 'forwards' });
    wrap.animate([
      { transform: 'translate(-50%,-50%) rotate(0deg)' },
      { transform: 'translate(-50%,-50%) rotate(0deg)', offset: .3 },
      { transform: 'translate(-50%,-50%) rotate(51deg)', offset: .55 },
      { transform: 'translate(-50%,-50%) rotate(51deg)' }
    ], { duration: 4000, easing: 'cubic-bezier(.3,1.4,.3,1)', fill: 'forwards' });
  }

  // L'hameçon de Maui — un hameçon tire une île hors de l'eau, puis sa
  // courbe se prolonge en constellation.
  function hameconMaui() {
    var l = layer(4600);
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:50%;bottom:8vh;transform:translateX(-50%);width:min(34vh,260px);height:min(30vh,220px);';

    var water = document.createElement('div');
    water.style.cssText = 'position:absolute;left:0;right:0;bottom:0;height:30%;' +
      'background:linear-gradient(180deg,rgba(63,160,201,.15),rgba(63,160,201,.4));opacity:0;';
    wrap.appendChild(water);

    var hook = document.createElement('div');
    hook.style.cssText = 'position:absolute;left:50%;bottom:22%;width:46%;transform:translate(-50%,60px);opacity:0;';
    hook.innerHTML =
      '<svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;overflow:visible">' +
        '<path d="M50 4 L50 80 Q50 116 82 112 Q106 108 96 80" fill="none" stroke="#e8dcc0" stroke-width="10" ' +
          'stroke-linecap="round" style="filter:drop-shadow(0 0 6px #e8dcc0)"/>' +
      '</svg>';
    wrap.appendChild(hook);

    var island = document.createElement('div');
    island.style.cssText = 'position:absolute;left:50%;bottom:26%;width:58%;transform:translate(-50%,40px);opacity:0;';
    island.innerHTML =
      '<svg viewBox="0 0 160 50" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block">' +
        '<path d="M4 46 Q30 4 70 20 Q100 2 140 24 Q156 30 156 46 Z" fill="#2ea6a0"/>' +
      '</svg>';
    wrap.appendChild(island);

    var starPts = [[50, 4], [54, 26], [64, 46], [80, 58], [96, 54]];
    var starsWrap = document.createElement('div');
    starsWrap.style.cssText = 'position:absolute;left:50%;bottom:52%;width:46%;transform:translateX(-50%);opacity:0;';
    starsWrap.innerHTML = '<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;overflow:visible">' +
      starPts.map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="2.6" fill="#f7ecd0" style="filter:drop-shadow(0 0 5px #f7ecd0)"/>'; }).join('') +
      '<path d="M' + starPts.map(function (p) { return p[0] + ' ' + p[1]; }).join(' L ') + '" fill="none" stroke="#f7ecd0" stroke-width="1" opacity=".5"/>' +
    '</svg>';
    wrap.appendChild(starsWrap);

    l.appendChild(wrap);

    water.animate([{ opacity: 0 }, { opacity: 1, offset: .1 }, { opacity: 1, offset: .85 }, { opacity: 0 }],
      { duration: 4600, easing: 'ease-out', fill: 'forwards' });
    hook.animate([
      { opacity: 0, transform: 'translate(-50%,60px)' },
      { opacity: 1, offset: .15, transform: 'translate(-50%,20px)' },
      { opacity: 1, offset: .5, transform: 'translate(-50%,-30px)' },
      { opacity: 0, offset: .72 },
      { opacity: 0 }
    ], { duration: 4600, easing: 'cubic-bezier(.2,.9,.2,1)', fill: 'forwards' });
    island.animate([
      { opacity: 0, transform: 'translate(-50%,40px)' },
      { opacity: 0, offset: .28 },
      { opacity: 1, offset: .45, transform: 'translate(-50%,-20px)' },
      { opacity: 1, offset: .86, transform: 'translate(-50%,-34px)' },
      { opacity: 0 }
    ], { duration: 4600, easing: 'ease-out', fill: 'forwards' });
    starsWrap.animate([{ opacity: 0 }, { opacity: 0, offset: .62 }, { opacity: 1, offset: .8 },
      { opacity: 1, offset: .94 }, { opacity: 0 }],
      { duration: 4600, easing: 'ease-in', fill: 'forwards' });
  }

  // Le Koh-i-Noor — un diamant dont les facettes s'allument une à une,
  // chacune projetant un éclat bref.
  function kohINoorFacettes() {
    var l = layer(4200);
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);width:min(22vh,160px);opacity:0;';
    var facets = [
      'M100 20 L140 70 L100 100 Z', 'M100 20 L60 70 L100 100 Z',
      'M60 70 L20 100 L100 100 Z', 'M140 70 L180 100 L100 100 Z',
      'M20 100 L60 150 L100 100 Z', 'M180 100 L140 150 L100 100 Z',
      'M60 150 L100 180 L100 100 Z', 'M140 150 L100 180 L100 100 Z'
    ];
    wrap.innerHTML =
      '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;overflow:visible">' +
        facets.map(function (d, i) {
          return '<path class="fx-koh-f" data-i="' + i + '" d="' + d + '" fill="rgba(207,216,240,.12)" stroke="#cfd8f0" stroke-width="1.4"/>';
        }).join('') +
      '</svg>';
    l.appendChild(wrap);
    wrap.animate([{ opacity: 0 }, { opacity: 1, offset: .08 }, { opacity: 1, offset: .88 }, { opacity: 0 }],
      { duration: 4200, easing: 'ease-out', fill: 'forwards' });

    var els = wrap.querySelectorAll('.fx-koh-f');
    els.forEach(function (el, i) {
      var delay = 260 + i * 360;
      el.animate([
        { fill: 'rgba(207,216,240,.12)' },
        { fill: 'rgba(255,255,255,.95)', offset: .5 },
        { fill: 'rgba(207,216,240,.28)' }
      ], { duration: 500, delay: delay, easing: 'ease-out', fill: 'forwards' });
      var flash = document.createElement('div');
      flash.style.cssText = 'position:absolute;left:50%;top:50%;width:10%;height:10%;border-radius:50%;' +
        'transform:translate(-50%,-50%);opacity:0;pointer-events:none;' +
        'background:radial-gradient(circle,rgba(255,255,255,.9),transparent 70%);';
      wrap.appendChild(flash);
      flash.animate([{ opacity: 0 }, { opacity: 1, offset: .5 }, { opacity: 0 }],
        { duration: 420, delay: delay, easing: 'ease-out', fill: 'forwards' });
    });
  }

  // Mythologie perse — une flamme vacille au centre, un voile de clair-obscur
  // balaie l'écran en écho au dualisme Ahura Mazda / Angra Mainyu.
  function perseFlame() {
    var l = layer(4200);
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:50%;bottom:14vh;transform:translateX(-50%);width:min(18vh,130px);opacity:0;';
    wrap.innerHTML =
      '<svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;overflow:visible">' +
        '<ellipse cx="50" cy="130" rx="30" ry="8" fill="#2e2214"/>' +
        '<path d="M50 30 C 30 60 30 90 50 120 C 70 90 70 60 50 30 Z" fill="#e8a23c" style="filter:drop-shadow(0 0 14px #f7c667)"/>' +
        '<path d="M50 55 C 40 75 40 95 50 115 C 60 95 60 75 50 55 Z" fill="#fbead0" opacity="0.85"/>' +
      '</svg>';
    l.appendChild(wrap);
    wrap.animate([{ opacity: 0 }, { opacity: 1, offset: .08 }, { opacity: 1, offset: .86 }, { opacity: 0 }],
      { duration: 4200, easing: 'ease-out', fill: 'forwards' });
    var tip = wrap.querySelector('svg');
    tip.animate([
      { transform: 'scaleY(1) scaleX(1)' },
      { transform: 'scaleY(1.08) scaleX(.94)', offset: .2 },
      { transform: 'scaleY(.92) scaleX(1.05)', offset: .4 },
      { transform: 'scaleY(1.1) scaleX(.96)', offset: .6 },
      { transform: 'scaleY(.95) scaleX(1.03)', offset: .8 },
      { transform: 'scaleY(1) scaleX(1)' }
    ], { duration: 1800, iterations: 2.3, easing: 'ease-in-out' });
    var shade = document.createElement('div');
    shade.style.cssText = 'position:absolute;inset:0;background:linear-gradient(90deg, rgba(58,61,92,.35), transparent 55%);opacity:0;';
    l.appendChild(shade);
    shade.animate([{ opacity: 0 }, { opacity: 1, offset: .3 }, { opacity: .2, offset: .6 }, { opacity: 1, offset: .8 }, { opacity: 0 }],
      { duration: 4200, easing: 'ease-in-out', fill: 'forwards' });
  }

  // Mythologie yoruba — un collier de perles colorées s'assemble perle par
  // perle en travers de l'écran.
  function yorubaBeads() {
    var l = layer(4200);
    var colors = ['#d8443a', '#f0c94e', '#2e9e8a', '#a35fc9'];
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:50%;top:40%;transform:translateX(-50%);width:min(50vh,360px);opacity:0;';
    l.appendChild(wrap);
    wrap.animate([{ opacity: 0 }, { opacity: 1, offset: .06 }, { opacity: 1, offset: .88 }, { opacity: 0 }],
      { duration: 4200, easing: 'ease-out', fill: 'forwards' });
    var count = 14;
    for (var i = 0; i < count; i++) {
      (function (i) {
        var t = i / (count - 1);
        var x = t * 100;
        var y = Math.sin(t * Math.PI) * 36;
        var bead = document.createElement('div');
        var size = rand(14, 22);
        bead.style.cssText = 'position:absolute;left:' + x + '%;top:' + (50 - y) + 'px;width:' + size + 'px;height:' + size + 'px;' +
          'border-radius:50%;background:' + pick(colors) + ';opacity:0;box-shadow:0 0 8px rgba(0,0,0,.4);transform:scale(.3);';
        wrap.appendChild(bead);
        bead.animate([
          { opacity: 0, transform: 'scale(.3)' },
          { opacity: 1, transform: 'scale(1)' },
          { opacity: 1 }
        ], { duration: 500, delay: 150 + i * 180, easing: 'cubic-bezier(.2,1.4,.4,1)', fill: 'forwards' });
      })(i);
    }
  }

  // Incas — un cordon de quipu dont les nœuds se nouent un à un.
  function incaQuipu() {
    var l = layer(4200);
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:50%;top:20%;transform:translateX(-50%);width:min(10vh,70px);height:min(60vh,420px);opacity:0;';
    wrap.innerHTML =
      '<svg viewBox="0 0 60 400" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;overflow:visible">' +
        '<line x1="30" y1="0" x2="30" y2="400" stroke="#c9982f" stroke-width="3"/>' +
      '</svg>';
    l.appendChild(wrap);
    wrap.animate([{ opacity: 0 }, { opacity: 1, offset: .06 }, { opacity: 1, offset: .9 }, { opacity: 0 }],
      { duration: 4200, easing: 'ease-out', fill: 'forwards' });
    var strandColors = ['#c9982f', '#2e8a7a', '#a6293a', '#5ad0b8'];
    for (var i = 0; i < 7; i++) {
      (function (i) {
        var y = 40 + i * 46;
        var side = i % 2 === 0 ? -1 : 1;
        var strand = document.createElement('div');
        strand.style.cssText = 'position:absolute;left:50%;top:' + y + 'px;width:2px;height:34px;background:' + pick(strandColors) + ';' +
          'transform-origin:top center;transform:translateX(' + (side * 20) + 'px) rotate(' + (side * 18) + 'deg) scaleY(0);opacity:0;';
        wrap.appendChild(strand);
        var knot = document.createElement('div');
        knot.style.cssText = 'position:absolute;left:50%;top:' + (y + 30) + 'px;width:8px;height:8px;border-radius:50%;background:#f0c94e;' +
          'transform:translate(' + (side * 20 - 3) + 'px,0) scale(0);opacity:0;box-shadow:0 0 6px #f0c94e;';
        wrap.appendChild(knot);
        var delay = 250 + i * 420;
        strand.animate([
          { opacity: 0, transform: 'translateX(' + (side * 20) + 'px) rotate(' + (side * 18) + 'deg) scaleY(0)' },
          { opacity: 1, transform: 'translateX(' + (side * 20) + 'px) rotate(' + (side * 18) + 'deg) scaleY(1)' }
        ], { duration: 300, delay: delay, easing: 'ease-out', fill: 'forwards' });
        knot.animate([
          { opacity: 0, transform: 'translate(' + (side * 20 - 3) + 'px,0) scale(0)' },
          { opacity: 1, transform: 'translate(' + (side * 20 - 3) + 'px,0) scale(1.3)', offset: .7 },
          { opacity: 1, transform: 'translate(' + (side * 20 - 3) + 'px,0) scale(1)' }
        ], { duration: 400, delay: delay + 280, easing: 'ease-out', fill: 'forwards' });
      })(i);
    }
  }

  // Polynésie — une pirogue double glisse sur l'écran, des étoiles de
  // navigation s'allumant au-dessus d'elle.
  function pirogueDouble() {
    var l = layer(4600);
    var canoe = document.createElement('div');
    canoe.style.cssText = 'position:absolute;top:58vh;left:-24vw;width:150vw;height:60px;opacity:0;';
    canoe.innerHTML =
      '<svg viewBox="0 0 1400 120" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;overflow:visible">' +
        '<path d="M40 90 Q120 60 240 90 L 230 100 Q120 76 50 100 Z" fill="#8a5a2a"/>' +
        '<path d="M160 90 Q240 60 360 90 L 350 100 Q240 76 170 100 Z" fill="#8a5a2a"/>' +
        '<rect x="90" y="55" width="220" height="10" fill="#c9982f"/>' +
        '<path d="M170 20 L 210 55 L 130 55 Z" fill="#e8dcc0" opacity="0.9"/>' +
      '</svg>';
    l.appendChild(canoe);
    canoe.animate([
      { transform: 'translateX(0)', opacity: 0 },
      { opacity: 1, offset: .12 },
      { transform: 'translateX(36vw)', opacity: 1, offset: .82 },
      { transform: 'translateX(46vw)', opacity: 0 }
    ], { duration: 4600, easing: 'ease-in-out', fill: 'forwards' });

    [[20, 20], [35, 12], [50, 22], [65, 10], [80, 18]].forEach(function (p, i) {
      var star = document.createElement('div');
      star.style.cssText = 'position:absolute;left:' + p[0] + 'vw;top:' + p[1] + 'vh;width:4px;height:4px;border-radius:50%;' +
        'background:#f7ecd0;box-shadow:0 0 8px #f7ecd0;opacity:0;';
      l.appendChild(star);
      star.animate([{ opacity: 0 }, { opacity: 1 }, { opacity: .4 }, { opacity: 1 }, { opacity: 0 }],
        { duration: 2400, delay: 400 + i * 300, easing: 'ease-in-out', fill: 'forwards' });
    });
  }

  // Le Kraken — un tentacule s'enroule depuis le bord de l'écran puis se
  // retire dans l'eau, un remous s'élargissant derrière lui.
  function krakenTentacle() {
    var l = layer(4200);
    var t = document.createElement('div');
    t.style.cssText = 'position:absolute;bottom:-6vh;left:' + rand(10, 70) + 'vw;width:min(22vh,160px);opacity:0;';
    t.innerHTML =
      '<svg viewBox="0 0 100 240" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;overflow:visible">' +
        '<path d="M50 240 C 20 200 70 160 40 120 C 15 90 60 60 45 20" fill="none" stroke="#2ea69a" stroke-width="22" ' +
          'stroke-linecap="round" style="filter:drop-shadow(0 0 10px #2ea69a)"/>' +
        '<circle cx="45" cy="20" r="7" fill="#5ad0c0"/>' +
        '<circle cx="52" cy="55" r="6" fill="#5ad0c0"/>' +
        '<circle cx="42" cy="95" r="6" fill="#5ad0c0"/>' +
      '</svg>';
    l.appendChild(t);
    t.animate([
      { opacity: 0, transform: 'translateY(40px) scale(.85)' },
      { opacity: 1, offset: .22, transform: 'translateY(0) scale(1)' },
      { opacity: 1, offset: .66 },
      { opacity: 0, transform: 'translateY(60px) scale(.8)' }
    ], { duration: 4200, easing: 'cubic-bezier(.3,.9,.3,1)', fill: 'forwards' });

    var ripple = document.createElement('div');
    ripple.style.cssText = 'position:absolute;bottom:2vh;left:' + rand(10, 70) + 'vw;width:120px;height:30px;border-radius:50%;' +
      'border:2px solid rgba(90,208,192,.5);opacity:0;';
    l.appendChild(ripple);
    ripple.animate([{ opacity: 0, transform: 'scale(.4)' }, { opacity: .8, offset: .15 }, { opacity: 0, transform: 'scale(2.2)' }],
      { duration: 2000, delay: 2600, easing: 'ease-out', fill: 'forwards' });
  }

  // Le Kappa — l'écuelle d'eau posée sur sa tête se renverse, quelques
  // gouttes s'échappent — ton léger, folklore vivant et joueur.
  function kappaDish() {
    var l = layer(3600);
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:50%;top:38%;transform:translateX(-50%);width:min(16vh,120px);opacity:0;';
    wrap.innerHTML =
      '<svg viewBox="0 0 100 90" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;overflow:visible">' +
        '<ellipse cx="50" cy="60" rx="34" ry="26" fill="#4a9e4a"/>' +
        '<circle cx="38" cy="48" r="4" fill="#0f1a12"/>' +
        '<circle cx="62" cy="48" r="4" fill="#0f1a12"/>' +
        '<ellipse id="fx-kappa-dish" cx="50" cy="26" rx="20" ry="9" fill="#7ecb6a" stroke="#2f7a3a" stroke-width="2" ' +
          'style="transform-origin:50px 60px"/>' +
      '</svg>';
    l.appendChild(wrap);
    wrap.animate([{ opacity: 0 }, { opacity: 1, offset: .1 }, { opacity: 1, offset: .8 }, { opacity: 0 }],
      { duration: 3600, easing: 'ease-out', fill: 'forwards' });
    var dish = wrap.querySelector('#fx-kappa-dish');
    dish.animate([
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(0deg)', offset: .5 },
      { transform: 'rotate(35deg)', offset: .62 },
      { transform: 'rotate(0deg)', offset: .78 },
      { transform: 'rotate(0deg)' }
    ], { duration: 3600, easing: 'ease-in-out', fill: 'forwards' });
    for (var i = 0; i < 4; i++) {
      (function (i) {
        var drop = document.createElement('div');
        drop.style.cssText = 'position:absolute;left:' + (46 + i * 4) + '%;top:24%;width:4px;height:6px;border-radius:50% 50% 50% 0;' +
          'background:#7ecb6a;opacity:0;';
        wrap.appendChild(drop);
        drop.animate([{ opacity: 0, transform: 'translateY(0)' }, { opacity: 1, offset: .2 }, { opacity: 0, transform: 'translateY(30px)' }],
          { duration: 700, delay: 2230 + i * 60, easing: 'ease-in', fill: 'forwards' });
      })(i);
    }
  }

  // Göbekli Tepe — deux piliers en T se dressent, puis la terre remonte les
  // ensevelir (le site a été enterré volontairement).
  function gobekliPiliers() {
    var l = layer(4400);
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:50%;bottom:8vh;transform:translateX(-50%);width:min(40vh,300px);height:min(24vh,180px);overflow:hidden;';
    function pillarEl(x, delay) {
      var p = document.createElement('div');
      p.style.cssText = 'position:absolute;left:' + x + '%;bottom:0;width:16%;height:100%;transform:translateY(60px);opacity:0;';
      p.innerHTML = '<svg viewBox="0 0 40 160" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;overflow:visible">' +
        '<rect x="14" y="0" width="12" height="130" fill="#c9982f"/>' +
        '<rect x="0" y="0" width="40" height="16" rx="3" fill="#e8c164"/>' +
        '<circle cx="20" cy="70" r="5" fill="#8a5a2a"/>' +
      '</svg>';
      p.animate([
        { opacity: 0, transform: 'translateY(60px)' },
        { opacity: 1, offset: .28, transform: 'translateY(0)' },
        { opacity: 1, offset: .62 },
        { opacity: 0, transform: 'translateY(64px)' }
      ], { duration: 4400, delay: delay, easing: 'cubic-bezier(.2,.9,.2,1)', fill: 'forwards' });
      return p;
    }
    wrap.appendChild(pillarEl(28, 0));
    wrap.appendChild(pillarEl(56, 200));
    var earth = document.createElement('div');
    earth.style.cssText = 'position:absolute;left:0;right:0;bottom:0;height:0;background:linear-gradient(180deg,#2e2618,#171208);opacity:0;';
    wrap.appendChild(earth);
    l.appendChild(wrap);
    earth.animate([
      { height: '0%', opacity: 0 },
      { height: '0%', opacity: 0, offset: .6 },
      { height: '100%', opacity: 1, offset: .9 },
      { height: '100%', opacity: 1 }
    ], { duration: 4400, easing: 'ease-in', fill: 'forwards' });
  }

  // Le Saint Graal — un calice se remplit de lumière plutôt que de liquide,
  // halo qui s'éteint doucement.
  function graalLumiere() {
    var l = layer(4200);
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:50%;bottom:10vh;transform:translateX(-50%);width:min(20vh,150px);';
    wrap.innerHTML =
      '<svg viewBox="0 0 100 160" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;overflow:visible">' +
        '<path d="M30 20 L70 20 L62 70 Q50 84 38 70 Z" fill="none" stroke="#c9982f" stroke-width="4"/>' +
        '<rect x="46" y="84" width="8" height="46" fill="#c9982f"/>' +
        '<ellipse cx="50" cy="134" rx="26" ry="7" fill="#c9982f"/>' +
        '<defs><clipPath id="fx-graal-clip"><path d="M32 24 L68 24 L61 68 Q50 80 39 68 Z"/></clipPath></defs>' +
        '<rect id="fx-graal-fill" x="30" y="24" width="40" height="56" fill="#f0d27a" clip-path="url(#fx-graal-clip)" ' +
          'style="transform-origin:50px 80px;transform:scaleY(0)"/>' +
      '</svg>';
    var glow = document.createElement('div');
    glow.style.cssText = 'position:absolute;left:50%;top:10%;transform:translate(-50%,-50%);width:70%;aspect-ratio:1;' +
      'border-radius:50%;opacity:0;pointer-events:none;' +
      'background:radial-gradient(circle,rgba(240,210,122,.9),rgba(240,210,122,0) 70%);';
    wrap.appendChild(glow);
    l.appendChild(wrap);

    wrap.animate([{ opacity: 0 }, { opacity: 1, offset: .08 }, { opacity: 1, offset: .88 }, { opacity: 0 }],
      { duration: 4200, easing: 'ease-out', fill: 'forwards' });
    var fillRect = wrap.querySelector('#fx-graal-fill');
    fillRect.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)', offset: .55 }, { transform: 'scaleY(1)' }],
      { duration: 4200, easing: 'ease-out', fill: 'forwards' });
    glow.animate([{ opacity: 0 }, { opacity: 0, offset: .5 }, { opacity: 1, offset: .68 }, { opacity: 0 }],
      { duration: 4200, easing: 'ease-in-out', fill: 'forwards' });
  }

  // La disparition d'Amelia Earhart — un avion s'estompe dans un brouillard
  // du Pacifique, sobre, aucune mise en scène de catastrophe.
  function earhartFade() {
    var l = layer(4600);
    var fog = document.createElement('div');
    fog.style.cssText = 'position:absolute;inset:0;background:radial-gradient(ellipse at 50% 55%,rgba(207,218,229,.25),transparent 65%);opacity:0;';
    l.appendChild(fog);
    fog.animate([{ opacity: 0 }, { opacity: 1, offset: .25 }, { opacity: 1, offset: .75 }, { opacity: 0 }],
      { duration: 4600, easing: 'ease-in-out', fill: 'forwards' });

    var plane = document.createElement('div');
    plane.style.cssText = 'position:absolute;top:42vh;left:-14vw;width:120px;opacity:0;';
    plane.innerHTML =
      '<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;overflow:visible">' +
        '<path d="M0 20 L60 16 L120 20 L60 24 Z" fill="#c9d4de"/>' +
        '<path d="M50 20 L70 4 L76 6 L64 20 Z" fill="#c9d4de"/>' +
        '<path d="M50 20 L70 36 L76 34 L64 20 Z" fill="#c9d4de"/>' +
      '</svg>';
    l.appendChild(plane);
    plane.animate([
      { transform: 'translateX(0)', opacity: 0 },
      { opacity: .9, offset: .14 },
      { transform: 'translateX(46vw)', opacity: .9, offset: .55 },
      { transform: 'translateX(60vw)', opacity: 0 }
    ], { duration: 4600, easing: 'ease-in', fill: 'forwards' });
  }

  // La Lance Sacrée — un fer de lance se dédouble en quatre silhouettes
  // superposées puis se recompose : les quatre reliques concurrentes en une image.
  function lanceQuadruple() {
    var l = layer(4200);
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);width:min(10vh,70px);height:min(34vh,240px);';
    function head(dx, dy, rot, delay) {
      var h = document.createElement('div');
      h.style.cssText = 'position:absolute;left:50%;top:50%;width:100%;height:100%;' +
        'transform:translate(-50%,-50%) translate(' + dx + 'px,' + dy + 'px) rotate(' + rot + 'deg);opacity:0;';
      h.innerHTML = '<svg viewBox="0 0 40 160" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;overflow:visible">' +
        '<path d="M20 0 L34 60 L26 60 L26 150 L14 150 L14 60 L6 60 Z" fill="#9a98a5" stroke="#c0384a" stroke-width="1.5"/>' +
      '</svg>';
      wrap.appendChild(h);
      h.animate([
        { opacity: 0, transform: 'translate(-50%,-50%) translate(' + dx + 'px,' + dy + 'px) rotate(' + rot + 'deg) scale(.8)' },
        { opacity: .85, offset: .4, transform: 'translate(-50%,-50%) translate(' + dx + 'px,' + dy + 'px) rotate(' + rot + 'deg) scale(1)' },
        { opacity: .85, offset: .62 },
        { opacity: 1, transform: 'translate(-50%,-50%) translate(0,0) rotate(0deg) scale(1)', offset: .85 },
        { opacity: 0 }
      ], { duration: 4200, delay: delay, easing: 'cubic-bezier(.2,.9,.2,1)', fill: 'forwards' });
      return h;
    }
    head(-14, -10, -8, 0);
    head(14, -6, 6, 120);
    head(-8, 12, 4, 240);
    head(10, 10, -5, 360);
    l.appendChild(wrap);
    wrap.animate([{ opacity: 0 }, { opacity: 1, offset: .08 }, { opacity: 1, offset: .9 }, { opacity: 0 }],
      { duration: 4200, easing: 'ease-out', fill: 'forwards' });
  }

  // Mythologie inca — une spirale dorée façon disque solaire d'Inti tourne
  // lentement au centre de l'écran.
  function intiSpiral() {
    var l = layer(4200);
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);width:min(24vh,170px);opacity:0;';
    var rays = '';
    for (var i = 0; i < 12; i++) {
      var a = i * 30;
      rays += '<rect x="96" y="10" width="8" height="34" rx="3" fill="#f7dc8a" transform="rotate(' + a + ' 100 100)"/>';
    }
    wrap.innerHTML =
      '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;overflow:visible">' +
        '<g id="fx-inti-disc" style="transform-origin:100px 100px">' +
          rays +
          '<circle cx="100" cy="100" r="46" fill="#e8c164" stroke="#f7dc8a" stroke-width="3"/>' +
          '<path d="M100 66 A34 34 0 0 1 134 100 A22 22 0 0 0 100 100 Z" fill="#161020" opacity="0.35"/>' +
        '</g>' +
      '</svg>';
    l.appendChild(wrap);
    wrap.animate([{ opacity: 0 }, { opacity: 1, offset: .1 }, { opacity: 1, offset: .86 }, { opacity: 0 }],
      { duration: 4200, easing: 'ease-out', fill: 'forwards' });
    var disc = wrap.querySelector('#fx-inti-disc');
    disc.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(160deg)' }],
      { duration: 4200, easing: 'linear', fill: 'forwards' });
  }

  // Mythologie aborigène australienne — une ligne de chant tracée en
  // pointillé lumineux à travers un paysage stylisé, sobre et abstrait.
  function songlinePath() {
    var l = layer(4600);
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:50%;bottom:20vh;transform:translateX(-50%);width:min(70vh,500px);opacity:0;';
    var pts = [[20, 60], [90, 30], [160, 55], [230, 20], [300, 50], [370, 25], [440, 55]];
    var dots = pts.map(function (p, i) {
      return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="5" fill="#e8925a" class="fx-song-dot" ' +
        'style="opacity:0;filter:drop-shadow(0 0 6px #e8925a)"/>';
    }).join('');
    var pathD = 'M' + pts.map(function (p) { return p[0] + ' ' + p[1]; }).join(' L');
    wrap.innerHTML =
      '<svg viewBox="0 0 460 90" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;overflow:visible">' +
        '<path d="M0 75 Q 230 60 460 75" fill="none" stroke="#5a6a9e" stroke-width="1" opacity="0.4"/>' +
        '<path id="fx-song-line" d="' + pathD + '" fill="none" stroke="#e8925a" stroke-width="2" ' +
          'stroke-dasharray="900" stroke-dashoffset="900" opacity="0.8"/>' +
        dots +
      '</svg>';
    l.appendChild(wrap);
    wrap.animate([{ opacity: 0 }, { opacity: 1, offset: .08 }, { opacity: 1, offset: .88 }, { opacity: 0 }],
      { duration: 4600, easing: 'ease-out', fill: 'forwards' });
    var line = wrap.querySelector('#fx-song-line');
    line.animate([{ strokeDashoffset: 900 }, { strokeDashoffset: 0 }],
      { duration: 3200, delay: 200, easing: 'ease-in-out', fill: 'forwards' });
    var dotEls = wrap.querySelectorAll('.fx-song-dot');
    dotEls.forEach(function (d, i) {
      d.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 300 + i * 440, easing: 'ease-out', fill: 'forwards' });
    });
  }

  // Mésopotamie (culture) — un calame imprime ses coins dans l'argile
  // fraîche, signe après signe.
  function calameArgile() {
    var l = layer(4200);
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);width:min(30vh,220px);opacity:0;';
    wrap.innerHTML =
      '<svg viewBox="0 0 220 140" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;overflow:visible">' +
        '<rect x="10" y="10" width="200" height="120" rx="6" fill="#c9a15a"/>' +
        '<rect x="10" y="10" width="200" height="120" rx="6" fill="none" stroke="#5a4a2c" stroke-width="2"/>' +
      '</svg>';
    l.appendChild(wrap);
    wrap.animate([{ opacity: 0 }, { opacity: 1, offset: .08 }, { opacity: 1, offset: .9 }, { opacity: 0 }],
      { duration: 4200, easing: 'ease-out', fill: 'forwards' });

    var rows = 3, cols = 8, i = 0;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        (function (r, c, idx) {
          var wedge = document.createElement('div');
          var x = 12 + c * 11, y = 20 + r * 30;
          wedge.style.cssText = 'position:absolute;left:' + x + '%;top:' + y + '%;width:5px;height:12px;background:#5a4a2c;' +
            'opacity:0;transform:rotate(' + rand(-15, 15) + 'deg);clip-path:polygon(0 0,100% 20%,60% 100%);';
          wrap.appendChild(wedge);
          wedge.animate([{ opacity: 0 }, { opacity: .85 }], { duration: 120, delay: 200 + idx * 45, easing: 'ease-out', fill: 'forwards' });
        })(r, c, i);
        i++;
      }
    }
  }

  // Empire perse achéménide — une colonne de Persépolis se dresse tambour
  // par tambour, chapiteau à protomés distinct des colonnes romaines.
  function persepolisColumn() {
    var l = layer(4200);
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:50%;bottom:8vh;transform:translateX(-50%);width:min(14vh,100px);height:min(50vh,360px);opacity:0;';
    var drums = 6;
    for (var i = 0; i < drums; i++) {
      (function (i) {
        var d = document.createElement('div');
        d.style.cssText = 'position:absolute;left:50%;bottom:' + (i * 15) + '%;transform:translateX(-50%) translateY(30px);' +
          'width:70%;height:16%;background:linear-gradient(180deg,#e8c164,#8a6ac0);border:1px solid #4a3f5c;opacity:0;';
        wrap.appendChild(d);
        d.animate([
          { opacity: 0, transform: 'translateX(-50%) translateY(30px)' },
          { opacity: 1, transform: 'translateX(-50%) translateY(0)' }
        ], { duration: 400, delay: 200 + i * 260, easing: 'cubic-bezier(.2,.9,.2,1)', fill: 'forwards' });
      })(i);
    }
    var capital = document.createElement('div');
    capital.style.cssText = 'position:absolute;left:50%;bottom:' + (drums * 15) + '%;transform:translateX(-50%) translateY(-20px);' +
      'width:110%;height:10%;opacity:0;';
    capital.innerHTML = '<svg viewBox="0 0 120 30" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;overflow:visible">' +
      '<path d="M10 28 Q10 6 35 8 Q45 2 60 8 Q75 2 85 8 Q110 6 110 28 Z" fill="#e8c164" stroke="#8a6ac0" stroke-width="1.5"/>' +
    '</svg>';
    wrap.appendChild(capital);
    capital.animate([
      { opacity: 0, transform: 'translateX(-50%) translateY(-20px)' },
      { opacity: 1, transform: 'translateX(-50%) translateY(0)' }
    ], { duration: 400, delay: 200 + drums * 260, easing: 'cubic-bezier(.2,.9,.2,1)', fill: 'forwards' });

    l.appendChild(wrap);
    wrap.animate([{ opacity: 0 }, { opacity: 1, offset: .05 }, { opacity: 1, offset: .88 }, { opacity: 0 }],
      { duration: 4200, easing: 'ease-out', fill: 'forwards' });
  }

  // Mokèlé-mbembé — des palmes de marais s'écartent sur un sillage, sans
  // jamais rien montrer.
  function swampParting() {
    var l = layer(4200);
    var water = document.createElement('div');
    water.style.cssText = 'position:absolute;bottom:0;left:0;right:0;height:26vh;' +
      'background:linear-gradient(180deg,rgba(58,106,74,.1),rgba(58,106,74,.35));opacity:0;';
    l.appendChild(water);
    water.animate([{ opacity: 0 }, { opacity: 1, offset: .15 }, { opacity: 1, offset: .8 }, { opacity: 0 }],
      { duration: 4200, easing: 'ease-in-out', fill: 'forwards' });

    for (var i = 0; i < 7; i++) {
      (function (i) {
        var frond = document.createElement('div');
        var x = 10 + i * 12;
        frond.style.cssText = 'position:absolute;bottom:2vh;left:' + x + '%;width:14px;height:18vh;' +
          'background:linear-gradient(180deg,#3a6a4a,transparent);border-radius:40% 40% 0 0;' +
          'transform-origin:bottom center;opacity:0;';
        l.appendChild(frond);
        frond.animate([
          { opacity: 0, transform: 'rotate(' + rand(-6, 6) + 'deg) translateX(0)' },
          { opacity: .8, offset: .25 },
          { transform: 'rotate(' + rand(14, 22) + 'deg) translateX(14px)', offset: .5 },
          { transform: 'rotate(' + rand(-6, 6) + 'deg) translateX(0)', offset: .85 },
          { opacity: 0 }
        ], { duration: 4200, delay: i * 70, easing: 'ease-in-out', fill: 'forwards' });
      })(i);
    }
    var wake = document.createElement('div');
    wake.style.cssText = 'position:absolute;bottom:4vh;left:50%;width:20px;height:8px;border-radius:50%;' +
      'background:rgba(207,227,192,.4);opacity:0;';
    l.appendChild(wake);
    wake.animate([
      { opacity: 0, transform: 'translateX(-160px)' },
      { opacity: .7, offset: .3 },
      { opacity: .7, transform: 'translateX(160px)', offset: .75 },
      { opacity: 0 }
    ], { duration: 4200, easing: 'ease-in-out', fill: 'forwards' });
  }

  // La Llorona — une silhouette blanche au bord de l'eau qui s'efface, et
  // des ondes concentriques qui s'élargissent. Jamais de visage, jamais de
  // cri : la retenue est le sujet.
  function lloronaSilhouette() {
    var l = layer(4200);
    var moon = document.createElement('div');
    moon.style.cssText = 'position:absolute;top:8vh;left:50%;transform:translateX(-50%);width:60px;height:60px;border-radius:50%;' +
      'background:radial-gradient(circle,#eef3f7,#c9d4de);opacity:0;box-shadow:0 0 30px rgba(238,243,247,.4);';
    l.appendChild(moon);
    moon.animate([{ opacity: 0 }, { opacity: .8, offset: .2 }, { opacity: .8, offset: .8 }, { opacity: 0 }],
      { duration: 4200, easing: 'ease-in-out', fill: 'forwards' });

    var figure = document.createElement('div');
    figure.style.cssText = 'position:absolute;bottom:10vh;left:50%;transform:translateX(-50%);width:min(14vh,90px);opacity:0;';
    figure.innerHTML = '<svg viewBox="0 0 60 140" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;overflow:visible">' +
      '<path d="M30 10 Q10 40 14 90 Q16 120 30 135 Q44 120 46 90 Q50 40 30 10 Z" fill="#eef3f7" opacity="0.85"/>' +
    '</svg>';
    l.appendChild(figure);
    figure.animate([
      { opacity: 0 },
      { opacity: .85, offset: .3 },
      { opacity: .85, offset: .55 },
      { opacity: 0, offset: .85 },
      { opacity: 0 }
    ], { duration: 4200, easing: 'ease-in-out', fill: 'forwards' });

    [0, 1, 2].forEach(function (i) {
      var ripple = document.createElement('div');
      ripple.style.cssText = 'position:absolute;bottom:9vh;left:50%;width:20px;height:8px;border-radius:50%;' +
        'border:1px solid rgba(201,212,222,.5);transform:translateX(-50%) scale(.3);opacity:0;';
      l.appendChild(ripple);
      ripple.animate([
        { opacity: 0, transform: 'translateX(-50%) scale(.3)' },
        { opacity: .7, offset: .15 },
        { opacity: 0, transform: 'translateX(-50%) scale(' + (2.4 + i * 0.6) + ')' }
      ], { duration: 2200, delay: 2000 + i * 300, easing: 'ease-out', fill: 'forwards' });
    });
  }

  // Le Mary Celeste — un voilier immobile, voiles molles, aucune silhouette
  // à bord.
  function maryCelesteDrift() {
    var l = layer(4400);
    var fog = document.createElement('div');
    fog.style.cssText = 'position:absolute;inset:0;background:radial-gradient(ellipse at 50% 60%,rgba(122,149,160,.2),transparent 70%);opacity:0;';
    l.appendChild(fog);
    fog.animate([{ opacity: 0 }, { opacity: 1, offset: .2 }, { opacity: 1, offset: .8 }, { opacity: 0 }],
      { duration: 4400, easing: 'ease-in-out', fill: 'forwards' });

    var ship = document.createElement('div');
    ship.style.cssText = 'position:absolute;bottom:24vh;left:50%;transform:translateX(-50%);width:min(28vh,200px);opacity:0;';
    ship.innerHTML = '<svg viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;overflow:visible">' +
      '<path d="M30 160 L130 160 L115 175 L45 175 Z" fill="#38505f"/>' +
      '<line x1="80" y1="160" x2="80" y2="20" stroke="#8a7050" stroke-width="4"/>' +
      '<path d="M80 30 Q40 50 40 90 Q60 84 80 90 Z" fill="#cdd9e0" opacity="0.75"/>' +
      '<path d="M80 40 Q115 58 115 95 Q98 88 80 95 Z" fill="#a8c0c8" opacity="0.7"/>' +
    '</svg>';
    l.appendChild(ship);
    ship.animate([{ opacity: 0 }, { opacity: 1, offset: .12 }, { opacity: 1, offset: .88 }, { opacity: 0 }],
      { duration: 4400, easing: 'ease-out', fill: 'forwards' });
    ship.animate([
      { transform: 'translateX(-50%) rotate(0deg)' },
      { transform: 'translateX(-50%) rotate(1.5deg)', offset: .5 },
      { transform: 'translateX(-50%) rotate(0deg)' }
    ], { duration: 4400, easing: 'ease-in-out', fill: 'forwards' });
  }

  // L'Île de Pâques — un moai qui se dresse en silhouette, très sobre.
  function moaiSilhouette() {
    var l = layer(4200);
    var moai = document.createElement('div');
    moai.style.cssText = 'position:absolute;bottom:6vh;left:50%;transform:translateX(-50%) translateY(40px);width:min(16vh,110px);opacity:0;';
    moai.innerHTML = '<svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;overflow:visible">' +
      '<path d="M50 4 C 26 4 20 40 22 70 L18 210 L82 210 L78 70 C 80 40 74 4 50 4 Z" fill="#1c2226"/>' +
      '<rect x="26" y="70" width="48" height="10" fill="#12161a"/>' +
      '<rect x="30" y="94" width="10" height="14" fill="#12161a"/>' +
      '<rect x="60" y="94" width="10" height="14" fill="#12161a"/>' +
    '</svg>';
    l.appendChild(moai);
    moai.animate([
      { opacity: 0, transform: 'translateX(-50%) translateY(40px)' },
      { opacity: 1, offset: .3, transform: 'translateX(-50%) translateY(0)' },
      { opacity: 1, offset: .82 },
      { opacity: 0 }
    ], { duration: 4200, easing: 'cubic-bezier(.2,.9,.2,1)', fill: 'forwards' });
  }

  // La Chambre d'Ambre — un panneau d'ambre se remplit tesson par tesson,
  // puis dont les pièces s'éteignent une à une.
  function ambreMosaique() {
    var l = layer(4400);
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);width:min(30vh,220px);height:min(24vh,170px);opacity:0;';
    l.appendChild(wrap);
    wrap.animate([{ opacity: 0 }, { opacity: 1, offset: .06 }, { opacity: 1, offset: .92 }, { opacity: 0 }],
      { duration: 4400, easing: 'ease-out', fill: 'forwards' });

    var cols = 5, rows = 4, i = 0;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        (function (r, c, idx) {
          var shard = document.createElement('div');
          shard.style.cssText = 'position:absolute;left:' + (c * 20) + '%;top:' + (r * 25) + '%;width:19%;height:24%;' +
            'background:linear-gradient(135deg,#f7b85a,#e8922f);border:1px solid #8a6a2f;opacity:0;transform:scale(.5);';
          wrap.appendChild(shard);
          shard.animate([{ opacity: 0, transform: 'scale(.5)' }, { opacity: 1, transform: 'scale(1)' }],
            { duration: 260, delay: 150 + idx * 70, easing: 'ease-out', fill: 'forwards' });
          shard.animate([{ opacity: 1 }, { opacity: .08 }],
            { duration: 260, delay: 2800 + idx * 55, easing: 'ease-in', fill: 'forwards' });
        })(r, c, i);
        i++;
      }
    }
  }

  // L'Épée de Goujian — une lame de bronze se dépatine, la corrosion
  // reculant pour révéler l'inscription.
  function goujianDepatine() {
    var l = layer(4200);
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:50%;top:46%;transform:translate(-50%,-50%) rotate(8deg);width:min(10vh,70px);height:min(40vh,280px);opacity:0;';
    wrap.innerHTML =
      '<svg viewBox="0 0 40 220" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;overflow:visible">' +
        '<defs><clipPath id="fx-goujian-clip"><rect x="6" y="4" width="28" height="180"/></clipPath></defs>' +
        '<path d="M20 4 L34 40 L26 180 L14 180 L6 40 Z" fill="#4a5c3a"/>' +
        '<rect id="fx-goujian-patina" x="0" y="4" width="40" height="180" fill="#2a3320" clip-path="url(#fx-goujian-clip)" ' +
          'style="transform-origin:20px 4px"/>' +
        '<rect x="12" y="184" width="16" height="10" fill="#c9982f"/>' +
        '<rect x="16" y="194" width="8" height="20" fill="#8a6a2f"/>' +
      '</svg>';
    l.appendChild(wrap);
    wrap.animate([{ opacity: 0 }, { opacity: 1, offset: .08 }, { opacity: 1, offset: .9 }, { opacity: 0 }],
      { duration: 4200, easing: 'ease-out', fill: 'forwards' });
    var patina = wrap.querySelector('#fx-goujian-patina');
    patina.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(0)' }],
      { duration: 2600, delay: 400, easing: 'ease-in', fill: 'forwards' });
    var glint = document.createElement('div');
    glint.style.cssText = 'position:absolute;left:50%;top:0;width:120%;height:12%;' +
      'background:linear-gradient(90deg,transparent,rgba(232,193,100,.9),transparent);' +
      'transform:translate(-50%,0) rotate(8deg);opacity:0;';
    wrap.appendChild(glint);
    glint.animate([{ opacity: 0, top: '0%' }, { opacity: .9, top: '50%', offset: .5 }, { opacity: 0, top: '100%' }],
      { duration: 1400, delay: 2600, easing: 'ease-in-out', fill: 'forwards' });
  }

  // Dogon — deux étoiles qui tournent l'une autour de l'autre, l'une
  // minuscule (Sirius A et B).
  function siriusOrbit() {
    var l = layer(4200);
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:50%;top:44%;width:min(20vh,140px);height:min(20vh,140px);opacity:0;';
    l.appendChild(wrap);
    var a = document.createElement('div');
    a.style.cssText = 'position:absolute;left:50%;top:50%;width:22px;height:22px;margin:-11px;border-radius:50%;background:radial-gradient(circle,#fff,#e8d8a0);box-shadow:0 0 18px #e8d8a0;';
    wrap.appendChild(a);
    var orbit = document.createElement('div');
    orbit.style.cssText = 'position:absolute;inset:0;transform-origin:50% 50%;';
    wrap.appendChild(orbit);
    var b = document.createElement('div');
    b.style.cssText = 'position:absolute;left:50%;top:4%;width:6px;height:6px;margin-left:-3px;border-radius:50%;background:#fff;box-shadow:0 0 8px #fff;';
    orbit.appendChild(b);
    wrap.animate([{ opacity: 0 }, { opacity: 1, offset: .1 }, { opacity: 1, offset: .9 }, { opacity: 0 }],
      { duration: 4200, easing: 'ease-out', fill: 'forwards' });
    orbit.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }],
      { duration: 3600, easing: 'linear', fill: 'forwards' });
  }

  // Mythologie vietnamienne — un œuf qui se fend en une centaine de points
  // lumineux qui se dispersent (Lạc Long Quân et Âu Cơ).
  function eggHatch() {
    var l = layer(4000);
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);width:min(12vh,90px);height:min(16vh,120px);opacity:0;';
    wrap.innerHTML = '<svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;overflow:visible">' +
      '<ellipse cx="50" cy="70" rx="42" ry="60" fill="#f2e6c8" stroke="#c9982f" stroke-width="2"/>' +
    '</svg>';
    l.appendChild(wrap);
    wrap.animate([{ opacity: 0 }, { opacity: 1, offset: .12 }, { opacity: 1, offset: .5 }, { opacity: 0, offset: .55 }, { opacity: 0 }],
      { duration: 4000, easing: 'ease-out', fill: 'forwards' });
    for (var i = 0; i < 36; i++) {
      (function () {
        var angle = rand(0, 360), dist = rand(40, 140);
        var dot = document.createElement('div');
        dot.style.cssText = 'position:absolute;left:50%;top:46%;width:4px;height:4px;border-radius:50%;background:#f7dc8a;box-shadow:0 0 6px #f7dc8a;opacity:0;';
        l.appendChild(dot);
        dot.animate([
          { opacity: 0, transform: 'translate(-50%,-50%)' },
          { opacity: 1, offset: .1, transform: 'translate(-50%,-50%)' },
          { opacity: .9, transform: 'translate(calc(-50% + ' + (Math.cos(angle * Math.PI / 180) * dist) + 'px), calc(-50% + ' + (Math.sin(angle * Math.PI / 180) * dist) + 'px))' },
          { opacity: 0 }
        ], { duration: 2600, delay: 1900 + rand(0, 300), easing: 'ease-out', fill: 'forwards' });
      })();
    }
  }

  // Empire byzantin — une mosaïque à la feuille d'or qui se pose tessère
  // par tessère.
  function mosaiqueOr() {
    var l = layer(4200);
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);width:min(26vh,190px);height:min(20vh,150px);opacity:0;';
    l.appendChild(wrap);
    wrap.animate([{ opacity: 0 }, { opacity: 1, offset: .06 }, { opacity: 1, offset: .92 }, { opacity: 0 }],
      { duration: 4200, easing: 'ease-out', fill: 'forwards' });
    var cols = 6, rows = 4, i = 0;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        (function (r, c, idx) {
          var t = document.createElement('div');
          t.style.cssText = 'position:absolute;left:' + (c * (100 / cols)) + '%;top:' + (r * (100 / rows)) + '%;width:' + (100 / cols - 1.5) + '%;height:' + (100 / rows - 1.5) + '%;background:linear-gradient(135deg,#e8c164,#c9982f);opacity:0;transform:scale(.4) rotate(' + rand(-8, 8) + 'deg);';
          wrap.appendChild(t);
          t.animate([{ opacity: 0, transform: 'scale(.4)' }, { opacity: 1, transform: 'scale(1)' }],
            { duration: 220, delay: 120 + idx * 55, easing: 'ease-out', fill: 'forwards' });
        })(r, c, i);
        i++;
      }
    }
  }

  // Khmers (Angkor) — un canal d'irrigation qui se remplit et encercle une
  // tour.
  function canalAngkor() {
    var l = layer(4200);
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:50%;top:48%;transform:translate(-50%,-50%);width:min(28vh,200px);height:min(20vh,150px);opacity:0;';
    wrap.innerHTML = '<svg viewBox="0 0 220 160" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;overflow:visible">' +
      '<path d="M110 20 L130 60 L120 130 L100 130 L90 60 Z" fill="#8a6a2f"/>' +
      '<rect x="95" y="10" width="30" height="14" fill="#c9982f"/>' +
      '<circle id="fx-canal-ring" cx="110" cy="95" r="70" fill="none" stroke="#3a6a8a" stroke-width="6" stroke-dasharray="440" stroke-dashoffset="440"/>' +
    '</svg>';
    l.appendChild(wrap);
    wrap.animate([{ opacity: 0 }, { opacity: 1, offset: .08 }, { opacity: 1, offset: .9 }, { opacity: 0 }],
      { duration: 4200, easing: 'ease-out', fill: 'forwards' });
    var ring = wrap.querySelector('#fx-canal-ring');
    ring.animate([{ strokeDashoffset: 440 }, { strokeDashoffset: 0 }],
      { duration: 2600, delay: 300, easing: 'ease-in-out', fill: 'forwards' });
  }

  // Le Golem de Prague — un mot hébreu s'inscrit puis une lettre s'effrite
  // (emet -> met, « vérité » -> « mort »).
  function golemEmetMet() {
    var l = layer(3800);
    var word = document.createElement('div');
    word.style.cssText = 'position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);font-family:serif;font-size:min(9vh,64px);letter-spacing:4px;color:#c9982f;text-shadow:0 0 16px rgba(201,152,47,.6);opacity:0;direction:rtl;';
    word.textContent = 'אמת';
    l.appendChild(word);
    word.animate([{ opacity: 0 }, { opacity: 1, offset: .15 }, { opacity: 1, offset: .6 }, { opacity: 1 }],
      { duration: 3800, easing: 'ease-out', fill: 'forwards' });
    setTimeout(function () {
      word.textContent = 'מת';
      word.animate([{ filter: 'brightness(1.8)' }, { filter: 'brightness(1)' }],
        { duration: 500, easing: 'ease-out', fill: 'forwards' });
    }, 2300);
  }

  // La Colonie perdue de Roanoke — le mot CROATOAN se grave lettre par
  // lettre dans le bois.
  function croatoanCarve() {
    var l = layer(4000);
    var word = document.createElement('div');
    word.style.cssText = 'position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);font-family:Cinzel, serif;font-size:min(5.5vh,38px);letter-spacing:6px;color:#a8926a;opacity:0;';
    l.appendChild(word);
    word.animate([{ opacity: 0 }, { opacity: 1, offset: .06 }, { opacity: 1, offset: .94 }, { opacity: 0 }],
      { duration: 4000, easing: 'ease-out', fill: 'forwards' });
    'CROATOAN'.split('').forEach(function (ch, i) {
      var span = document.createElement('span');
      span.textContent = ch;
      span.style.cssText = 'opacity:0;';
      word.appendChild(span);
      span.animate([{ opacity: 0, textShadow: '0 0 0 transparent' }, { opacity: 1, textShadow: '0 0 10px #e8c164' }, { textShadow: 'none' }],
        { duration: 260, delay: 300 + i * 220, easing: 'ease-out', fill: 'forwards' });
    });
  }

  // Sanxingdui — un masque de bronze aux yeux globuleux qui se lève
  // lentement de sa fosse.
  function masqueBronzeLeve() {
    var l = layer(4200);
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:50%;bottom:-2vh;transform:translateX(-50%);width:min(18vh,130px);opacity:0;';
    wrap.innerHTML = '<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;overflow:visible">' +
      '<path d="M60 6 C 20 6 10 50 14 90 L106 90 C 110 50 100 6 60 6 Z" fill="#5a6a3a"/>' +
      '<circle cx="38" cy="55" r="14" fill="#3a4a24"/>' +
      '<circle cx="82" cy="55" r="14" fill="#3a4a24"/>' +
      '<rect x="46" y="82" width="28" height="8" fill="#2a3418"/>' +
    '</svg>';
    l.appendChild(wrap);
    wrap.animate([
      { opacity: 0, transform: 'translateX(-50%) translateY(60px)' },
      { opacity: 1, offset: .25, transform: 'translateX(-50%) translateY(0)' },
      { opacity: 1, offset: .85 },
      { opacity: 0 }
    ], { duration: 4200, easing: 'cubic-bezier(.2,.9,.2,1)', fill: 'forwards' });
  }

  // Les épées Ulfberht — une signature +VLFBERH+T s'inscrit dans la lame,
  // puis se révèle contrefaçon.
  function ulfberhtSignature() {
    var l = layer(4000);
    var word = document.createElement('div');
    word.style.cssText = 'position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);font-family:Cinzel, serif;font-size:min(5vh,34px);letter-spacing:3px;color:#c9c9c9;opacity:0;white-space:nowrap;';
    word.textContent = '+VLFBERH+T';
    l.appendChild(word);
    word.animate([{ opacity: 0 }, { opacity: 1, offset: .1 }, { opacity: 1, offset: .7 }, { opacity: 1 }],
      { duration: 4000, easing: 'ease-out', fill: 'forwards' });
    setTimeout(function () {
      word.style.color = '#e86a4a';
      word.textContent = '+VLFBERHT+ (contrefaçon)';
    }, 2600);
  }

  // Le Vajra — un éclair qui se solidifie en sceptre à branches symétriques.
  function vajraSolidify() {
    var l = layer(3800);
    var bolt = document.createElement('div');
    bolt.style.cssText = 'position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);width:min(6vh,40px);height:min(30vh,200px);opacity:0;';
    bolt.innerHTML = '<svg id="fx-vajra-bolt" viewBox="0 0 40 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;overflow:visible">' +
      '<path d="M20 0 L30 70 L14 80 L26 200 L4 100 L20 90 Z" fill="#e8d8a0"/>' +
    '</svg>';
    l.appendChild(bolt);
    bolt.animate([{ opacity: 0 }, { opacity: 1, offset: .15 }, { opacity: 1, offset: .85 }, { opacity: 0 }],
      { duration: 3800, easing: 'ease-out', fill: 'forwards' });
    setTimeout(function () {
      var svg = bolt.querySelector('#fx-vajra-bolt');
      svg.innerHTML = '<rect x="16" y="0" width="8" height="200" fill="#c9982f"/>' +
        '<path d="M4 20 Q20 0 36 20 Q20 36 4 20 Z" fill="#e8d8a0"/>' +
        '<path d="M4 180 Q20 200 36 180 Q20 164 4 180 Z" fill="#e8d8a0"/>';
    }, 2200);
  }

  // Mythologie finnoise — un œuf cosmique qui se fend, une moitié montant
  // former le ciel, l'autre descendant former la terre.
  function cosmicEggSplit() {
    var l = layer(4000);
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);width:min(14vh,100px);height:min(18vh,130px);opacity:0;';
    wrap.innerHTML = '<svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;overflow:visible">' +
      '<path id="fx-egg-top" d="M50 4 C 22 4 12 46 12 66 L88 66 C 88 46 78 4 50 4 Z" fill="#e8c164"/>' +
      '<path id="fx-egg-bottom" d="M12 66 C 12 100 28 136 50 136 C 72 136 88 100 88 66 Z" fill="#c9982f"/>' +
    '</svg>';
    l.appendChild(wrap);
    wrap.animate([{ opacity: 0 }, { opacity: 1, offset: .1 }, { opacity: 1, offset: .55 }, { opacity: 0, offset: .6 }, { opacity: 0 }],
      { duration: 4000, easing: 'ease-out', fill: 'forwards' });
    var top = wrap.querySelector('#fx-egg-top'), bottom = wrap.querySelector('#fx-egg-bottom');
    setTimeout(function () {
      top.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-70px)' }],
        { duration: 1400, easing: 'ease-in', fill: 'forwards' });
      bottom.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(70px)' }],
        { duration: 1400, easing: 'ease-in', fill: 'forwards' });
    }, 1500);
  }

  // Mythologie polynésienne — Te Kore (le vide) puis Te Pō (la nuit) qui
  // se déchirent lentement pour révéler Te Ao Mārama (le monde de lumière).
  function teAoMarama() {
    var l = layer(4200);
    var dark = document.createElement('div');
    dark.style.cssText = 'position:absolute;inset:0;background:#050a08;opacity:0;';
    l.appendChild(dark);
    dark.animate([{ opacity: 0 }, { opacity: .88, offset: .18 }, { opacity: .88, offset: .55 }, { opacity: 0 }],
      { duration: 4200, easing: 'ease-in-out', fill: 'forwards' });
    var glow = document.createElement('div');
    glow.style.cssText = 'position:absolute;left:50%;top:50%;width:10px;height:10px;border-radius:50%;transform:translate(-50%,-50%);background:radial-gradient(circle,#fff,#e8c164);opacity:0;';
    l.appendChild(glow);
    glow.animate([
      { opacity: 0, width: '10px', height: '10px' },
      { opacity: 1, offset: .35, width: '10px', height: '10px' },
      { opacity: 1, width: 'min(50vh,360px)', height: 'min(50vh,360px)', offset: .75 },
      { opacity: 0 }
    ], { duration: 4200, easing: 'ease-out', fill: 'forwards' });
  }

  // Empire mongol — une yourte qui se monte en cercle, treillis puis toit.
  function yourteMontage() {
    var l = layer(4000);
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:50%;bottom:8vh;transform:translateX(-50%);width:min(24vh,170px);opacity:0;';
    wrap.innerHTML = '<svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;overflow:visible">' +
      '<ellipse id="fx-yurt-base" cx="100" cy="110" rx="90" ry="14" fill="#8a6a3f" opacity="0"/>' +
      '<path id="fx-yurt-wall" d="M20 110 L20 70 L180 70 L180 110 Z" fill="#c9b090" opacity="0"/>' +
      '<path id="fx-yurt-roof" d="M20 70 L100 20 L180 70 Z" fill="#a8825a" opacity="0"/>' +
      '<circle id="fx-yurt-crown" cx="100" cy="30" r="6" fill="#e8c164" opacity="0"/>' +
    '</svg>';
    l.appendChild(wrap);
    wrap.animate([{ opacity: 0 }, { opacity: 1, offset: .08 }, { opacity: 1, offset: .9 }, { opacity: 0 }],
      { duration: 4000, easing: 'ease-out', fill: 'forwards' });
    var parts = ['fx-yurt-base', 'fx-yurt-wall', 'fx-yurt-roof', 'fx-yurt-crown'];
    parts.forEach(function (id, i) {
      var el = wrap.querySelector('#' + id);
      el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: 300 + i * 350, easing: 'ease-out', fill: 'forwards' });
    });
  }

  // Culture indienne — un mudra (geste de danse classique) esquissé en une
  // ligne continue.
  function mudraGeste() {
    var l = layer(3800);
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);width:min(16vh,110px);height:min(16vh,110px);opacity:0;';
    wrap.innerHTML = '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;overflow:visible">' +
      '<path id="fx-mudra-path" d="M20 90 C 20 40 40 20 60 20 C 80 20 95 35 95 55 C 95 75 80 85 65 78 C 55 73 58 60 68 60" ' +
        'fill="none" stroke="#e8925a" stroke-width="4" stroke-linecap="round" stroke-dasharray="260" stroke-dashoffset="260"/>' +
    '</svg>';
    l.appendChild(wrap);
    wrap.animate([{ opacity: 0 }, { opacity: 1, offset: .08 }, { opacity: 1, offset: .85 }, { opacity: 0 }],
      { duration: 3800, easing: 'ease-out', fill: 'forwards' });
    wrap.querySelector('#fx-mudra-path').animate([{ strokeDashoffset: 260 }, { strokeDashoffset: 0 }],
      { duration: 2200, delay: 300, easing: 'ease-in-out', fill: 'forwards' });
  }

  // La Tarasque — un dragon de procession qui traverse l'écran en cahotant
  // sur ses roues, ambiance de fête.
  function tarasqueProcession() {
    var l = layer(4000);
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:-20%;top:48%;transform:translateY(-50%);width:min(20vh,140px);opacity:0;';
    wrap.innerHTML = '<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;overflow:visible">' +
      '<path d="M10 60 Q 40 20 90 40 Q 130 55 180 45 L175 65 Q 120 75 80 62 Q 45 52 15 75 Z" fill="#6a8a3a"/>' +
      '<circle cx="30" cy="80" r="10" fill="#3a2a18"/><circle cx="150" cy="80" r="10" fill="#3a2a18"/>' +
      '<circle cx="182" cy="42" r="5" fill="#c9982f"/>' +
    '</svg>';
    l.appendChild(wrap);
    wrap.animate([{ opacity: 0 }, { opacity: 1, offset: .1 }, { opacity: 1, offset: .85 }, { opacity: 0 }],
      { duration: 4000, easing: 'ease-out', fill: 'forwards' });
    wrap.animate([
      { left: '-20%', transform: 'translateY(-50%) rotate(0deg)' },
      { left: '40%', transform: 'translateY(-54%) rotate(-2deg)', offset: .5 },
      { left: '110%', transform: 'translateY(-50%) rotate(0deg)' }
    ], { duration: 4000, easing: 'ease-in-out', fill: 'forwards' });
  }

  // Le Thunderbird — un éclair qui, l'espace d'une image, dessine une
  // envergure d'ailes.
  function thunderbirdEclair() {
    var l = layer(2600);
    var flash = document.createElement('div');
    flash.style.cssText = 'position:absolute;inset:0;background:rgba(230,240,255,0.9);opacity:0;';
    l.appendChild(flash);
    flash.animate([{ opacity: 0 }, { opacity: .8, offset: .06 }, { opacity: 0, offset: .12 }, { opacity: 0 }],
      { duration: 700, easing: 'ease-out', fill: 'forwards' });
    var wings = document.createElement('div');
    wings.style.cssText = 'position:absolute;left:50%;top:40%;transform:translate(-50%,-50%);width:min(50vh,360px);opacity:0;';
    wings.innerHTML = '<svg viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;overflow:visible">' +
      '<path d="M150 50 L110 20 L70 30 L30 15 L60 45 L20 55 L65 60 L30 85 L80 65 L110 80 L120 55 Z" fill="#12151a"/>' +
      '<path d="M150 50 L190 20 L230 30 L270 15 L240 45 L280 55 L235 60 L270 85 L220 65 L190 80 L180 55 Z" fill="#12151a"/>' +
    '</svg>';
    l.appendChild(wings);
    wings.animate([{ opacity: 0 }, { opacity: 1, offset: .1 }, { opacity: 1, offset: .3 }, { opacity: 0 }],
      { duration: 2600, easing: 'ease-out', fill: 'forwards' });
  }

  // Le Suaire de Turin — un tissu qui se déplie et dont l'empreinte
  // apparaît en négatif, jamais un visage net.
  function suaireDeplie() {
    var l = layer(4200);
    var cloth = document.createElement('div');
    cloth.style.cssText = 'position:absolute;left:50%;top:46%;transform:translate(-50%,-50%) scaleY(.08);width:min(16vh,110px);height:min(34vh,240px);background:linear-gradient(180deg,#ece0c4,#d8c8a0);opacity:0;';
    l.appendChild(cloth);
    cloth.animate([{ opacity: 0 }, { opacity: 1, offset: .1 }, { opacity: 1, offset: .88 }, { opacity: 0 }],
      { duration: 4200, easing: 'ease-out', fill: 'forwards' });
    cloth.animate([{ transform: 'translate(-50%,-50%) scaleY(.08)' }, { transform: 'translate(-50%,-50%) scaleY(1)' }],
      { duration: 1600, delay: 300, easing: 'ease-out', fill: 'forwards' });
    var imprint = document.createElement('div');
    imprint.style.cssText = 'position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);width:min(8vh,55px);height:min(20vh,140px);opacity:0;background:radial-gradient(ellipse,rgba(122,90,58,.35),transparent 70%);';
    l.appendChild(imprint);
    imprint.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1200, delay: 2000, easing: 'ease-in', fill: 'forwards' });
  }

  // Cité de Paititi / El Dorado — la canopée s'ouvre sur un reflet doré
  // qui disparaît aussitôt.
  function canopeeDoree() {
    var l = layer(3600);
    var canopy = document.createElement('div');
    canopy.style.cssText = 'position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,transparent 0%,#0e1a10 65%);opacity:0;';
    l.appendChild(canopy);
    canopy.animate([{ opacity: 0 }, { opacity: 1, offset: .1 }, { opacity: 1, offset: .85 }, { opacity: 0 }],
      { duration: 3600, easing: 'ease-out', fill: 'forwards' });
    var glint = document.createElement('div');
    glint.style.cssText = 'position:absolute;left:50%;top:50%;width:6px;height:6px;border-radius:50%;transform:translate(-50%,-50%);background:radial-gradient(circle,#fff,#e8c164);opacity:0;';
    l.appendChild(glint);
    glint.animate([
      { opacity: 0, width: '6px', height: '6px' },
      { opacity: 1, offset: .45, width: 'min(14vh,100px)', height: 'min(14vh,100px)' },
      { opacity: 0, offset: .55 },
      { opacity: 0 }
    ], { duration: 3600, easing: 'ease-out', fill: 'forwards' });
  }

  // La Toison d'Or — une peau de mouton plongée dans un courant, dont les
  // paillettes d'or s'accrochent une à une.
  function toisonOrEclat() {
    var l = layer(4000);
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);width:min(18vh,130px);height:min(16vh,110px);opacity:0;';
    wrap.innerHTML = '<svg viewBox="0 0 160 110" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;overflow:visible">' +
      '<path d="M20 50 Q 40 20 80 25 Q 120 20 140 50 Q 130 80 80 85 Q 30 80 20 50 Z" fill="#e8d8b0"/>' +
    '</svg>';
    l.appendChild(wrap);
    wrap.animate([{ opacity: 0 }, { opacity: 1, offset: .1 }, { opacity: 1, offset: .9 }, { opacity: 0 }],
      { duration: 4000, easing: 'ease-out', fill: 'forwards' });
    for (var i = 0; i < 14; i++) {
      (function () {
        var x = rand(25, 135), y = rand(25, 85);
        var speck = document.createElement('div');
        speck.style.cssText = 'position:absolute;left:' + x + 'px;top:' + y + 'px;width:5px;height:5px;border-radius:50%;background:#e8c164;box-shadow:0 0 6px #e8c164;opacity:0;';
        wrap.appendChild(speck);
        speck.animate([{ opacity: 0 }, { opacity: 1 }, { opacity: .3 }],
          { duration: 700, delay: 500 + i * 180, easing: 'ease-out', fill: 'forwards' });
      })();
    }
  }

  // La Boîte de Pandore — une jarre qui s'entrouvre, laisse échapper des
  // points sombres, et retient le dernier.
  function jarrePandore() {
    var l = layer(4200);
    var jar = document.createElement('div');
    jar.style.cssText = 'position:absolute;left:50%;bottom:10vh;transform:translateX(-50%);width:min(12vh,85px);opacity:0;';
    jar.innerHTML = '<svg viewBox="0 0 80 120" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;overflow:visible">' +
      '<path d="M20 20 L60 20 L55 30 L66 100 Q 40 115 14 100 L25 30 Z" fill="#8a6a3f"/>' +
      '<rect id="fx-jar-lid" x="18" y="10" width="44" height="10" fill="#6a4a2a" style="transform-origin:20px 15px"/>' +
    '</svg>';
    l.appendChild(jar);
    jar.animate([{ opacity: 0 }, { opacity: 1, offset: .1 }, { opacity: 1, offset: .9 }, { opacity: 0 }],
      { duration: 4200, easing: 'ease-out', fill: 'forwards' });
    var lid = jar.querySelector('#fx-jar-lid');
    setTimeout(function () {
      lid.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-25deg)' }],
        { duration: 500, easing: 'ease-out', fill: 'forwards' });
      for (var i = 0; i < 8; i++) {
        (function (i) {
          var dot = document.createElement('div');
          dot.style.cssText = 'position:absolute;left:22px;top:8px;width:5px;height:5px;border-radius:50%;background:#2a1a10;opacity:0;';
          jar.appendChild(dot);
          dot.animate([
            { opacity: 0, transform: 'translate(0,0)' },
            { opacity: 1, offset: .15, transform: 'translate(0,-6px)' },
            { opacity: 0, transform: 'translate(' + rand(-60, 60) + 'px,' + rand(-90, -30) + 'px)' }
          ], { duration: 1400, delay: 500 + i * 90, easing: 'ease-out', fill: 'forwards' });
        })(i);
      }
    }, 800);
  }

  /* ---------------------------------------------------------------------
     3. Inscriptions qui se "déchiffrent" au scroll — glyphes -> texte lisible,
        lettre par lettre, avec un bref éclat lumineux quand chacune se fixe.
        Rejouable : en sortant du viewport, l'inscription redevient des
        glyphes, prête à se redéchiffrer à la prochaine entrée (avant/arrière).
        Balisage : <span class="fx-decode" data-glyphs="rune" data-text="…"></span>
     --------------------------------------------------------------------- */
  var RUNES = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛋᛏᛒᛖᛗᛚᛜᛞᛟ';
  var GREEK = 'ΑΒΓΔΘΛΞΠΣΦΨΩ';
  var HIERO = '𓂀𓆣𓁢𓋹𓊹'; // œil d'Horus, scarabée, personnage, ankh, « dieu »
  var CUNEI = '𒀭𒂗𒆠𒉏𒌷'; // DINGIR, EN, KI, …
  var OGHAM = 'ᚁᚂᚃᚄᚅᚆᚇᚈᚉᚊ';
  var ROMAN = 'ⅠⅤⅩⅬⅭⅮⅯ';

  // Capitales lapidaires : pour les inscriptions reellement portees par un objet
  // (serie « objets legendaires »). Pas de J, U ni W, absents de l'alphabet latin
  // classique — c'est ce qui donne l'aspect grave plutot que dactylographie.
  var LAPID = 'ABCDEFGHIKLMNOPQRSTVXYZ';

  var GLYPH_POOLS = {
    rune: RUNES, greek: GREEK, hiero: HIERO, cunei: CUNEI, ogham: OGHAM, roman: ROMAN,
    hindu: 'ॐ☸✴◈', japan: '❀✿花結', azteque: '☀✴◈❂', slave: '☀✺❉✵', chine: '福龍鳳春',
    lapidaire: LAPID, yoruba: '☀◈✦❖', inca: '☀◈▲✦', dreaming: '●○◐◑✦',
    dogon: '▲▽◇✦', kalevala: '✦❆◆✶', polynesienne: '▲◆✦❖'
  };

  function glyphify(el, pool) {
    var chars = Array.from(el.getAttribute('data-text') || '');
    el.textContent = '';
    chars.forEach(function (ch) {
      var s = document.createElement('span');
      s.textContent = ch === ' ' ? ' ' : pick(pool);
      s.style.transition = 'text-shadow .4s ease, color .4s ease';
      el.appendChild(s);
    });
  }

  function decodeReveal(el) {
    var pool = Array.from(GLYPH_POOLS[el.getAttribute('data-glyphs')] || RUNES);
    var chars = Array.from(el.getAttribute('data-text') || '');
    glyphify(el, pool);
    var spans = Array.prototype.slice.call(el.children);
    spans.forEach(function (s, i) {
      if (chars[i] === ' ') return;
      var delay = i * (48 + rand(0, 18)), flickers = 4 + Math.floor(rand(0, 3));
      for (var f = 0; f < flickers; f++) {
        setTimeout((function (sp) { return function () { sp.textContent = pick(pool); }; })(s), delay + f * 42);
      }
      setTimeout((function (sp, ch) {
        return function () {
          sp.textContent = ch;
          sp.style.color = ACCENT;
          sp.style.textShadow = '0 0 14px ' + ACCENT + ', 0 0 3px #fff';
          setTimeout(function () { sp.style.textShadow = 'none'; sp.style.color = ''; }, 900);
        };
      })(s, chars[i]), delay + flickers * 42);
    });
    el.dataset.decoded = '1';
  }

  // Le HTML porte le vrai texte en contenu visible (dégradation propre sans JS,
  // ou site épuré) : on le capture dans data-text avant de le remplacer par des glyphes.
  var decodeNodes = document.querySelectorAll('.fx-decode');
  if (decodeNodes.length) {
    decodeNodes.forEach(function (el) {
      if (!el.hasAttribute('data-text')) el.setAttribute('data-text', el.textContent.trim());
      glyphify(el, Array.from(GLYPH_POOLS[el.getAttribute('data-glyphs')] || RUNES));
    });
    var ioDecode = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var el = entry.target;
        if (entry.isIntersecting) {
          if (el.dataset.decoded !== '1') decodeReveal(el);
        } else if (el.dataset.decoded === '1') {
          el.dataset.decoded = '0';
          glyphify(el, Array.from(GLYPH_POOLS[el.getAttribute('data-glyphs')] || RUNES));
        }
      });
    }, { threshold: 0.3 });
    decodeNodes.forEach(function (el) { ioDecode.observe(el); });
  }

  /* ---------------------------------------------------------------------
     4. Petits "happenings" au scroll — rejoue un effet existant quand une
        section entre dans le viewport, avec un temps de repos (~7s) pour
        ne jamais devenir agaçant en cas de va-et-vient.
        Balisage : <section data-scroll-fx="nessie">…</section>
     --------------------------------------------------------------------- */
  var SCROLL_FX = {
    nessie: nessie, bermudes: bermudes, solstice: solstice, eyes: eyes,
    sunrise: sunrise, silk: silk,
    raven: function () { flyAcross('#1c1c22', { top: 6, top2: 22, dy: -10 }); },
    eagle: function () { flyAcross('#8a5a2a', { top: 6, top2: 24, dy: -12, duration: 3600 }); },
    firebird: function () { flyAcross('#e8622a', { top: 10, top2: 30, dy: -6, trail: true, glow: true, duration: 4200 }); },
    lightning: lightning,
    eyeOfHorus: eyeOfHorus,
    mistDrift: mistDrift,
    starsZiggurat: starsZiggurat,
    lotusBloom: lotusBloom,
    toriiGlow: toriiGlow,
    serpentGlide: serpentGlide,
    romanColumns: romanColumns,
    bigfootTracks: bigfootTracks,
    dyatlov: dyatlovSnow,
    greekMaskFlip: greekMaskFlip,
    yetiBlizzard: yetiBlizzard,
    voynichScript: voynichScript,
    vikingLonghship: vikingLonghship,
    chupacabraEyes: chupacabraEyes,
    nazcaLines: nazcaLines,
    maliCaravan: maliCaravan,
    mothmanShadow: mothmanShadow,
    antikytheraGears: antikytheraGears,
    excaliburDraw: excaliburDraw,
    dragonCloudGlide: dragonCloudGlide,
    archeCherubins: archeCherubins,
    tresorsCoffres: tresorsCoffres,
    tabouretSuspendu: tabouretSuspendu,
    mjollnirForge: mjollnirForge,
    chevalTroieAssemble: chevalTroieAssemble,
    pierreSoleilTourne: pierreSoleilTourne,
    hameconMaui: hameconMaui,
    kohINoorFacettes: kohINoorFacettes,
    perseFlame: perseFlame,
    yorubaBeads: yorubaBeads,
    incaQuipu: incaQuipu,
    pirogueDouble: pirogueDouble,
    krakenTentacle: krakenTentacle,
    kappaDish: kappaDish,
    gobekliPiliers: gobekliPiliers,
    graalLumiere: graalLumiere,
    earhartFade: earhartFade,
    lanceQuadruple: lanceQuadruple,
    intiSpiral: intiSpiral,
    songlinePath: songlinePath,
    calameArgile: calameArgile,
    persepolisColumn: persepolisColumn,
    swampParting: swampParting,
    lloronaSilhouette: lloronaSilhouette,
    maryCelesteDrift: maryCelesteDrift,
    moaiSilhouette: moaiSilhouette,
    ambreMosaique: ambreMosaique,
    goujianDepatine: goujianDepatine,
    siriusOrbit: siriusOrbit,
    eggHatch: eggHatch,
    mosaiqueOr: mosaiqueOr,
    canalAngkor: canalAngkor,
    golemEmetMet: golemEmetMet,
    croatoanCarve: croatoanCarve,
    masqueBronzeLeve: masqueBronzeLeve,
    ulfberhtSignature: ulfberhtSignature,
    vajraSolidify: vajraSolidify,
    cosmicEggSplit: cosmicEggSplit,
    teAoMarama: teAoMarama,
    yourteMontage: yourteMontage,
    mudraGeste: mudraGeste,
    tarasqueProcession: tarasqueProcession,
    thunderbirdEclair: thunderbirdEclair,
    suaireDeplie: suaireDeplie,
    canopeeDoree: canopeeDoree,
    toisonOrEclat: toisonOrEclat,
    jarrePandore: jarrePandore
  };
  var scrollFxLastPlayed = {};
  function initScrollHappenings() {
    var nodes = document.querySelectorAll('[data-scroll-fx]');
    if (!nodes.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var key = entry.target.getAttribute('data-scroll-fx');
        var fn = SCROLL_FX[key];
        if (!fn) return;
        var now = Date.now();
        if (scrollFxLastPlayed[key] && now - scrollFxLastPlayed[key] < 7000) return;
        scrollFxLastPlayed[key] = now;
        try { fn(); } catch (e) { /* un happening casse, la page continue */ }
      });
    }, { threshold: 0.4 });
    nodes.forEach(function (el) { io.observe(el); });
  }
  initScrollHappenings();

  /* ---------------------------------------------------------------------
     Registre : clef data-egg -> déclencheur (clic sur le titre / Konami)
     --------------------------------------------------------------------- */
  var EGGS = {
    nordique:      function () { glyphShower({ glyphs: RUNES, mode: 'fall' }); flyAcross('#1c1c22', { top: 6, top2: 22, dy: -10 }); },
    grecque:       function () { glyphShower({ glyphs: GREEK, mode: 'rise' }); lightning(); },
    egyptienne:    function () { glyphShower({ glyphs: HIERO, mode: 'rise' }); eyeOfHorus(); },
    egypte:        sunrise,
    romaine:       function () { glyphShower({ glyphs: ROMAN, mode: 'fall' }); flyAcross('#8a5a2a', { top: 6, top2: 24, dy: -12, duration: 3600 }); },
    celtique:      function () { glyphShower({ glyphs: OGHAM, mode: 'rise' }); mistDrift(); },
    mesopotamienne:function () { glyphShower({ glyphs: CUNEI, mode: 'fall' }); starsZiggurat(); },
    hindoue:       function () { glyphShower({ glyphs: 'ॐ☸✴', mode: 'rise', color: '#e6a23c' }); lotusBloom(); },
    azteque:       function () { glyphShower({ glyphs: '☀✴◈❂', mode: 'rise' }); serpentGlide(); },
    slave:         function () { glyphShower({ glyphs: '☀✺❉✵', mode: 'rise', color: '#e0723a' }); flyAcross('#e8622a', { top: 10, top2: 30, dy: -6, trail: true, glow: true, duration: 4200 }); },
    chine:         function () { glyphShower({ glyphs: '福龍鳳春', mode: 'fall', color: '#d8443a' }); silk(); },
    japonaise:     function () { glyphShower({ glyphs: '❀✿花', mode: 'fall', color: '#f4c0d0', count: 30 }); toriiGlow(); },
    lochness:      nessie,
    bermudes:      bermudes,
    stonehenge:    solstice,
    gevaudan:      eyes,
    rome:          function () { glyphShower({ glyphs: ROMAN, mode: 'fall' }); romanColumns(); },
    bigfoot:       bigfootTracks,
    dyatlov:       dyatlovSnow,
    grece:         function () { glyphShower({ glyphs: GREEK, mode: 'rise' }); greekMaskFlip(); },
    yeti:          yetiBlizzard,
    voynich:       voynichScript,
    vikings:       vikingLonghship,
    chupacabra:    chupacabraEyes,
    nazca:         nazcaLines,
    mali:          maliCaravan,
    mothman:       mothmanShadow,
    antikythera:   antikytheraGears,
    excalibur:     excaliburDraw,
    chinoise:      function () { glyphShower({ glyphs: '福龍鳳春', mode: 'fall', color: '#d8443a' }); dragonCloudGlide(); },
    arche:         archeCherubins,
    tresors:       tresorsCoffres,
    tabouret:      tabouretSuspendu,
    mjollnir:      mjollnirForge,
    chevaltroie:   chevalTroieAssemble,
    pierresoleil:  pierreSoleilTourne,
    hamecon:       hameconMaui,
    kohinoor:      kohINoorFacettes,
    perse:         perseFlame,
    yoruba:        yorubaBeads,
    incas:         incaQuipu,
    polynesie:     pirogueDouble,
    kraken:        krakenTentacle,
    kappa:         kappaDish,
    gobeklitepe:   gobekliPiliers,
    graal:         graalLumiere,
    earhart:       earhartFade,
    lance:         lanceQuadruple,
    viracocha:     intiSpiral,
    dreaming:      songlinePath,
    mesopotamie:   calameArgile,
    achemenide:    persepolisColumn,
    mokele:        swampParting,
    llorona:       lloronaSilhouette,
    maryceleste:   maryCelesteDrift,
    rapanui:       moaiSilhouette,
    ambre:         ambreMosaique,
    goujian:       goujianDepatine,
    nommo:         siriusOrbit,
    laclongquan:   eggHatch,
    byzance:       mosaiqueOr,
    khmers:        canalAngkor,
    golem:         golemEmetMet,
    yeren:         bigfootTracks,
    roanoke:       croatoanCarve,
    sanxingdui:    masqueBronzeLeve,
    ulfberht:      ulfberhtSignature,
    vajra:         vajraSolidify,
    vainamoinen:   cosmicEggSplit,
    mauihook:      teAoMarama,
    mongol:        yourteMontage,
    inde:          mudraGeste,
    tarasque:      tarasqueProcession,
    thunderbird:   thunderbirdEclair,
    suaire:        suaireDeplie,
    paititi:       canopeeDoree,
    toisonor:      toisonOrEclat,
    pandore:       jarrePandore,
    // page d'accueil : un mélange de glyphes de toutes les cultures
    accueil:       function () { glyphShower({ glyphs: RUNES + GREEK + OGHAM + 'ॐ福', mode: 'rise' }); },
    carte:         function () { glyphShower({ glyphs: RUNES + HIERO + CUNEI + '❀✴', mode: 'fall', count: 34 }); }
  };

  var key = document.body.getAttribute('data-egg');
  var egg = key && EGGS[key];
  if (egg) {
    (function () {
      function trigger() {
        if (busy) return;
        busy = true;
        try { egg(); } catch (e) { /* on ne casse jamais la page pour un easter egg */ }
        setTimeout(function () { busy = false; }, 1500);
      }

      // Déclencheur discret : le titre du hero (ou le bandeau sur la carte) devient cliquable.
      var title = document.querySelector('.hero h1, header.hero h1, #topbar .brand');
      if (title) {
        title.style.cursor = 'pointer';
        title.addEventListener('click', trigger);
      }

      // Sur la carte : cliquer directement le fond (pas un pin) déclenche aussi l'egg,
      // exposé ici pour que map.html puisse l'appeler depuis son propre gestionnaire de clic.
      if (key === 'carte') window.triggerCarteEgg = trigger;

      // Déclencheur caché : le code Konami.
      var seq = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65], idx = 0;
      window.addEventListener('keydown', function (e) {
        idx = (e.keyCode === seq[idx]) ? idx + 1 : (e.keyCode === seq[0] ? 1 : 0);
        if (idx === seq.length) { idx = 0; trigger(); }
      });
    })();
  }
})();
