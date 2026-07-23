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

  var GLYPH_POOLS = {
    rune: RUNES, greek: GREEK, hiero: HIERO, cunei: CUNEI, ogham: OGHAM, roman: ROMAN,
    hindu: 'ॐ☸✴◈', japan: '❀✿花結', azteque: '☀✴◈❂', slave: '☀✺❉✵', chine: '福龍鳳春'
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
    serpentGlide: serpentGlide
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
    // page d'accueil : un mélange de glyphes de toutes les cultures
    accueil:       function () { glyphShower({ glyphs: RUNES + GREEK + OGHAM + 'ॐ福', mode: 'rise' }); }
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
  }
})();
