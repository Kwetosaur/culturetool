/*
 * genealogy-interactive.js — moteur partagé pour la vue interactive
 * (facultative) des sections #genealogie. Un seul fichier, utilisé aussi
 * bien par les pages statiques (public/*.html) que par les composants
 * Astro (src/components/InteractiveGenealogy.astro) — même logique
 * qu'effects.js : une copie, jamais dupliquée.
 *
 * Ne remplace jamais le diagramme figé documenté : chaque page conserve
 * son arbre SVG fait main comme référence éditoriale (les notes de
 * prudence sur les sources contradictoires y restent). Cette vue est un
 * bouton "Vue interactive" en plus, jamais un remplacement.
 *
 * Palette et glyphes de survol/particule sont fournis par la page
 * appelante (houses, glyphs) — le moteur ne connaît aucune couleur ni
 * écriture propre à une culture, pour rester réutilisable telle quelle
 * sur n'importe quelle mythologie.
 *
 * API :
 *   window.initInteractiveGenealogy(containerEl, {
 *     nodes: [{ id, label, house, head, dim, x, y, detail }],
 *     edges: [[fromId, toId, 'filiation'|'union'|'special']],
 *     houses: { key: { head:'#hex', normal:'#hex', dim:'#hex' } },
 *     glyphs: 'ᚠᚢᚦ...',           // pool de caractères pour les particules
 *     viewBox: { w, h },
 *     lineColor: '#hex',          // couleur par défaut des arêtes
 *     bg: '#hex', panel: '#hex', border: '#hex', text: '#hex', textDim: '#hex'
 *   });
 */
(function () {
  'use strict';

  var SVGNS = 'http://www.w3.org/2000/svg';

  function initInteractiveGenealogy(container, opts) {
    if (!container || !opts || !opts.nodes || !opts.edges) return;

    var nodes = opts.nodes.map(function (n) { return Object.assign({}, n); });
    var edges = opts.edges;
    var houses = opts.houses || {};
    var glyphs = Array.from(opts.glyphs || '✦');
    var vw = (opts.viewBox && opts.viewBox.w) || 1000;
    var vh = (opts.viewBox && opts.viewBox.h) || 600;
    var lineColor = opts.lineColor || '#8a7a58';
    var colors = {
      bg: opts.bg || '#0c0b09',
      panel: opts.panel || '#171412',
      border: opts.border || '#3a2f22',
      text: opts.text || '#e6ddc9',
      textDim: opts.textDim || '#a89a7e'
    };
    var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    var byId = {};
    nodes.forEach(function (n) { byId[n.id] = n; });
    var restPos = {};
    nodes.forEach(function (n) { restPos[n.id] = { x: n.x, y: n.y }; });

    // ---------- structure DOM ----------
    container.innerHTML = '';
    container.classList.add('gi-root');

    var toolbar = document.createElement('div');
    toolbar.className = 'gi-toolbar';
    toolbar.innerHTML =
      '<span class="gi-badge"><span class="gi-dot"></span>Glissez un nom pour le déplacer, cliquez pour en savoir plus</span>' +
      '<button type="button" class="gi-reset-btn">Réordonner l’arbre</button>';
    container.appendChild(toolbar);

    var stage = document.createElement('div');
    stage.className = 'gi-stage';
    container.appendChild(stage);

    var svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('class', 'gi-svg');
    svg.setAttribute('viewBox', '0 0 ' + vw + ' ' + vh);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    stage.appendChild(svg);

    var edgesG = document.createElementNS(SVGNS, 'g');
    var nodesG = document.createElementNS(SVGNS, 'g');
    var fxG = document.createElementNS(SVGNS, 'g');
    svg.appendChild(edgesG);
    svg.appendChild(nodesG);
    svg.appendChild(fxG); // dernier enfant = dessiné par-dessus le reste

    // ---------- styles injectés une fois (scoped par .gi-root) ----------
    if (!document.getElementById('gi-styles')) {
      var style = document.createElement('style');
      style.id = 'gi-styles';
      style.textContent =
        '.gi-root{ margin-top:18px; }' +
        '.gi-toolbar{ display:flex; align-items:center; gap:14px; flex-wrap:wrap; margin-bottom:12px; }' +
        '.gi-badge{ display:inline-flex; align-items:center; gap:7px; font-size:0.78rem; letter-spacing:0.03em; color:var(--gi-text-dim,#a89a7e); }' +
        '.gi-dot{ width:7px; height:7px; border-radius:50%; background:currentColor; box-shadow:0 0 6px currentColor; flex:none; }' +
        '.gi-reset-btn{ background:transparent; border:1px solid var(--gi-border,#3a2f22); color:var(--gi-text-dim,#a89a7e); font:inherit; font-size:0.78rem; padding:6px 13px; border-radius:3px; cursor:pointer; transition:border-color .15s, color .15s; }' +
        '.gi-reset-btn:hover{ border-color:var(--gi-accent,#c9a15a); color:var(--gi-accent,#c9a15a); }' +
        '.gi-reset-btn:focus-visible{ outline:2px solid var(--gi-accent,#c9a15a); outline-offset:2px; }' +
        '.gi-stage{ position:relative; border:1px solid var(--gi-border,#3a2f22); border-radius:6px; overflow:hidden; }' +
        '.gi-svg{ display:block; width:100%; height:auto; min-height:380px; user-select:none; -webkit-user-select:none; -webkit-touch-callout:none; }' +
        '.gi-edge{ fill:none; }' +
        '.gi-edge-filiation{ stroke-width:1.3px; opacity:0.85; }' +
        '.gi-edge-union{ stroke-width:1.1px; stroke-dasharray:4 3; opacity:0.65; }' +
        '.gi-edge-special{ stroke-width:1px; stroke-dasharray:1.5 5; opacity:0.6; }' +
        '.gi-node{ cursor:grab; }' +
        '.gi-node.dragging{ cursor:grabbing; }' +
        '.gi-node text{ paint-order:stroke; stroke-linejoin:round; pointer-events:none; }' +
        '.gi-node .gi-hit{ fill:transparent; }' +
        '.gi-node:hover text{ filter:drop-shadow(0 0 5px currentColor); }' +
        '.gi-node:focus-visible .gi-hit{ stroke:var(--gi-accent,#c9a15a); stroke-width:1.5px; }' +
        '.gi-modal-backdrop{ position:fixed; inset:0; background:rgba(0,0,0,0.82); z-index:9999; display:flex; align-items:center; justify-content:center; padding:24px; opacity:0; pointer-events:none; transition:opacity .18s ease; }' +
        '.gi-modal-backdrop.open{ opacity:1; pointer-events:auto; }' +
        '.gi-modal-card{ max-width:440px; width:100%; background:var(--gi-panel,#171412); border:1px solid var(--gi-border,#3a2f22); border-radius:8px; padding:26px 26px 22px; box-shadow:0 30px 70px rgba(0,0,0,0.6); transform:translateY(10px); transition:transform .18s ease; position:relative; }' +
        '.gi-modal-backdrop.open .gi-modal-card{ transform:translateY(0); }' +
        '.gi-modal-close{ position:absolute; top:12px; right:14px; background:none; border:none; color:var(--gi-text-dim,#a89a7e); font-size:1.2rem; cursor:pointer; padding:6px; line-height:1; }' +
        '.gi-modal-close:hover{ color:var(--gi-text,#e6ddc9); }' +
        '.gi-modal-house{ font-size:0.72rem; letter-spacing:2px; text-transform:uppercase; margin:0 0 8px; }' +
        '.gi-modal-title{ font-size:1.4rem; font-weight:700; margin:0 0 14px; color:var(--gi-text,#e6ddc9); }' +
        '.gi-modal-body{ font-size:0.96rem; line-height:1.65; color:var(--gi-text-dim,#a89a7e); margin:0; }';
      document.head.appendChild(style);
    }
    container.style.setProperty('--gi-border', colors.border);
    container.style.setProperty('--gi-text-dim', colors.textDim);
    container.style.setProperty('--gi-text', colors.text);
    container.style.setProperty('--gi-panel', colors.panel);
    container.style.setProperty('--gi-accent', opts.accent || colors.textDim);

    // ---------- arêtes ----------
    var edgeEls = edges.map(function (e) {
      var path = document.createElementNS(SVGNS, 'path');
      path.setAttribute('class', 'gi-edge gi-edge-' + e[2]);
      path.setAttribute('stroke', e[3] || lineColor);
      edgesG.appendChild(path);
      return { el: path, a: byId[e[0]], b: byId[e[1]] };
    });

    function edgePath(a, b) {
      var mx = (a.x + b.x) / 2;
      var my = (a.y + b.y) / 2 - Math.min(30, Math.abs(b.x - a.x) * 0.08);
      return 'M ' + a.x + ' ' + a.y + ' Q ' + mx + ' ' + my + ' ' + b.x + ' ' + b.y;
    }
    function renderEdges() {
      edgeEls.forEach(function (l) { l.el.setAttribute('d', edgePath(l.a, l.b)); });
    }

    // ---------- nœuds ----------
    var nodeEls = nodes.map(function (n) {
      var house = houses[n.house] || { head: colors.text, normal: colors.text, dim: colors.textDim };
      var g = document.createElementNS(SVGNS, 'g');
      g.setAttribute('class', 'gi-node');
      g.setAttribute('tabindex', '0');
      g.setAttribute('role', 'button');
      g.setAttribute('aria-label', n.label + (n.detail ? ' — voir le détail' : ''));

      var hitW = Math.max(90, n.label.length * 7.6);
      var hit = document.createElementNS(SVGNS, 'rect');
      hit.setAttribute('class', 'gi-hit');
      hit.setAttribute('x', -hitW / 2);
      hit.setAttribute('y', -14);
      hit.setAttribute('width', hitW);
      hit.setAttribute('height', 26);
      hit.setAttribute('rx', 4);
      g.appendChild(hit);

      var text = document.createElementNS(SVGNS, 'text');
      text.setAttribute('text-anchor', 'middle');
      var fill = n.head ? house.head : (n.dim ? house.dim : house.normal);
      text.setAttribute('fill', fill);
      text.style.color = fill; // pour currentColor (halo au survol)
      text.setAttribute('font-weight', n.head ? '700' : '400');
      text.setAttribute('font-size', n.dim ? '11' : (n.head ? '15' : '12.5'));
      text.textContent = n.label;
      g.appendChild(text);

      nodesG.appendChild(g);
      return g;
    });

    function renderNodes() {
      nodeEls.forEach(function (g, i) {
        g.setAttribute('transform', 'translate(' + nodes[i].x + ',' + nodes[i].y + ')');
      });
    }
    renderEdges();
    renderNodes();

    // ---------- particules de glyphe : rAF manuel, aucune dépendance à
    // Element.animate()/CSS transform sur SVG (source du bug "les runes
    // ne tombent pas" de la première version). ----------
    var particles = [];
    function spawnGlyph(x, y, color) {
      var el = document.createElementNS(SVGNS, 'text');
      el.setAttribute('x', x);
      el.setAttribute('y', y);
      el.setAttribute('fill', color);
      el.setAttribute('font-size', (10 + Math.random() * 8).toFixed(1));
      el.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
      el.style.filter = 'drop-shadow(0 0 4px ' + color + ')';
      fxG.appendChild(el);
      particles.push({
        el: el, x0: x, y0: y,
        dx: (Math.random() - 0.5) * 34,
        dy: reduceMotion ? 4 : (36 + Math.random() * 46),
        start: performance.now(),
        life: reduceMotion ? 550 : (850 + Math.random() * 450)
      });
    }
    function tickParticles(now) {
      for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];
        var t = (now - p.start) / p.life;
        if (t >= 1) {
          p.el.remove();
          particles.splice(i, 1);
          continue;
        }
        var ease = 1 - Math.pow(1 - t, 2);
        p.el.setAttribute('x', p.x0 + p.dx * ease);
        p.el.setAttribute('y', p.y0 + p.dy * ease);
        p.el.setAttribute('opacity', (1 - t).toFixed(2));
      }
      requestAnimationFrame(tickParticles);
    }
    requestAnimationFrame(tickParticles);

    function burst(n, count) {
      var house = houses[n.house] || {};
      var color = house.head || house.normal || colors.text;
      for (var i = 0; i < count; i++) {
        spawnGlyph(n.x + (Math.random() - 0.5) * 20, n.y, color);
      }
    }

    // ---------- popup modal : fond noirci, texte de détail ----------
    var backdrop = document.createElement('div');
    backdrop.className = 'gi-modal-backdrop';
    backdrop.setAttribute('role', 'presentation');
    backdrop.innerHTML =
      '<div class="gi-modal-card" role="dialog" aria-modal="true" tabindex="-1">' +
      '<button type="button" class="gi-modal-close" aria-label="Fermer">✕</button>' +
      '<p class="gi-modal-house"></p>' +
      '<h3 class="gi-modal-title"></h3>' +
      '<p class="gi-modal-body"></p>' +
      '</div>';
    document.body.appendChild(backdrop);
    var modalCard = backdrop.querySelector('.gi-modal-card');
    var modalHouse = backdrop.querySelector('.gi-modal-house');
    var modalTitle = backdrop.querySelector('.gi-modal-title');
    var modalBody = backdrop.querySelector('.gi-modal-body');
    var lastFocused = null;

    function openModal(n) {
      var house = houses[n.house] || {};
      lastFocused = document.activeElement;
      modalHouse.textContent = opts.houseLabels && opts.houseLabels[n.house] ? opts.houseLabels[n.house] : '';
      modalHouse.style.color = house.head || colors.text;
      modalTitle.textContent = n.label;
      modalBody.textContent = n.detail || 'Aucun détail renseigné pour cette figure.';
      backdrop.classList.add('open');
      modalCard.focus();
      document.addEventListener('keydown', onKeydown);
    }
    function closeModal() {
      backdrop.classList.remove('open');
      document.removeEventListener('keydown', onKeydown);
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }
    function onKeydown(ev) { if (ev.key === 'Escape') closeModal(); }
    backdrop.addEventListener('click', function (ev) { if (ev.target === backdrop) closeModal(); });
    backdrop.querySelector('.gi-modal-close').addEventListener('click', closeModal);

    // ---------- glisser / cliquer ----------
    function toSvgPoint(evt) {
      var pt = svg.createSVGPoint();
      pt.x = evt.clientX; pt.y = evt.clientY;
      return pt.matrixTransform(svg.getScreenCTM().inverse());
    }

    var dragging = null, downPos = null, moved = false, lastBurstAt = 0;
    var CLICK_THRESHOLD = 6;

    nodeEls.forEach(function (g, i) {
      var n = nodes[i];
      g.addEventListener('pointerdown', function (ev) {
        ev.preventDefault(); // empeche le geste natif de selection de texte au glisser
        dragging = n; moved = false;
        downPos = toSvgPoint(ev);
        g.classList.add('dragging');
        svg.setPointerCapture(ev.pointerId);
      });
      g.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); openModal(n); }
      });
    });

    svg.addEventListener('pointermove', function (ev) {
      if (!dragging) return;
      var p = toSvgPoint(ev);
      if (!moved && Math.hypot(p.x - downPos.x, p.y - downPos.y) > CLICK_THRESHOLD) {
        moved = true;
        burst(dragging, 4);
      }
      if (moved) {
        dragging.x = Math.max(20, Math.min(vw - 20, p.x));
        dragging.y = Math.max(20, Math.min(vh - 20, p.y));
        renderEdges(); renderNodes();
        var now = performance.now();
        if (now - lastBurstAt > 90) { burst(dragging, 1); lastBurstAt = now; }
      }
    });

    svg.addEventListener('pointerup', function () {
      if (!dragging) return;
      var n = dragging;
      nodeEls.forEach(function (g) { g.classList.remove('dragging'); });
      if (moved) {
        burst(n, 6);
      } else {
        openModal(n);
      }
      dragging = null;
    });

    // ---------- réinitialisation ----------
    toolbar.querySelector('.gi-reset-btn').addEventListener('click', function () {
      nodes.forEach(function (n) { n.x = restPos[n.id].x; n.y = restPos[n.id].y; });
      renderEdges(); renderNodes();
    });
  }

  window.initInteractiveGenealogy = initInteractiveGenealogy;
})();
