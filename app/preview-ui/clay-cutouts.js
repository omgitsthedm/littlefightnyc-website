/* Transparent clay keeps its parts and its 12 fps workshop movement.
 * A finite move runs on arrival, hover, focus or touch; rest is the original PNG. */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const roots = [...document.querySelectorAll('#canvas [data-clay-cutout]')];
  const states = new Map(), queue = [], active = new Set();
  const FPS = 12, LAST = 15, DURATION = LAST / FPS * 1000;
  const articulated = {
    'symbol-browser': 'browser', 'object-router': 'router',
    'object-notebook': 'notebook', 'object-software': 'software',
    'object-storefront': 'storefront',
  };
  const profiles = {
    'symbol-tugboat': 'rock', 'object-yellow-taxi-v1': 'drive',
    'object-rubber-duck': 'hop', 'object-approval-stamp': 'stamp',
    'object-map-red-pin': 'hop', 'object-booking-calendar': 'paper',
    'object-priority-notes': 'paper', 'object-mail': 'paper',
    'object-homepage-sketchbook': 'paper', 'object-notebook-open': 'paper',
    'object-ownership-keys': 'swing', 'object-connected-cables': 'stretch',
    'object-network-switch': 'rock', 'object-backup-drive': 'rock',
    'object-security': 'stamp', 'object-password-safe': 'rock',
    'object-renewal-hourglass': 'swing', 'object-video-meeting': 'nod',
    'object-storage-drives': 'nod', 'object-phone-dock': 'nod',
    'object-payment-terminal': 'stamp', 'object-software-maintenance': 'rock',
    'object-consulting-toolbox': 'hop', 'object-repeat-work-machine': 'rock',
    'object-vera-brownstone': 'breathe', 'object-desk-workstation': 'breathe',
    'object-operating-system': 'breathe', 'object-printer': 'nod',
    'object-redesign-paint': 'rock', 'object-content-camera': 'nod',
    'object-phone-chromatic': 'nod', 'object-vendor-handoff': 'rock',
    'object-construction-plans': 'paper', 'object-scissors-red-tape': 'swing',
  };
  const hop = [0, 5, 8, -25, -64, -80, -42, 6, -4, 1, 0, 0, 0, 0, 0, 0];
  const wag = [0, -.12, -.25, .45, 1, .5, -.5, .26, -.12, .03, 0, 0, 0, 0, 0, 0];
  const roll = [0, -.025, -.07, .14, .5, .85, 1, .9, .55, .13, -.06, .025, 0, 0, 0, 0];
  const enabled = () => !reduce.matches && !document.hidden &&
    !document.body.matches('.no-motion,.reader-open,.explore-open');
  let serial = 0;
  const path = d => `<path d="${d}"/>`;
  const rect = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`;
  const ellipse = (x, y, rx, ry) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/>`;
  const transform = (x, y, sx = 1, sy = 1, dx = 0, dy = 0, angle = 0) =>
    `translate(${x + dx} ${y + dy}) rotate(${angle}) scale(${sx} ${sy}) translate(${-x} ${-y})`;

  function rig(st) {
    const uid = `cutout-${++serial}`, original = st.image.currentSrc || st.image.src;
    const photo = `<image href="${original}" width="1536" height="1024"/>`;
    const plate = `<image href="/assets/clay-png/motion-${st.kind}-clean.png" width="1536" height="1024"/>`;
    let defs = '', holes = '', parts = '';
    const patch = shape => { holes += shape; };
    const cut = (name, shape) => {
      const id = `${uid}-${name}`;
      defs += `<clipPath id="${id}">${shape}</clipPath>`;
      parts += `<g data-cutout-part="${name}"><g clip-path="url(#${id})">${photo}</g></g>`;
    };
    if (st.kind === 'browser') {
      patch(path('M450 206 L786 239 L782 350 L442 322 Z'));
      [[503, 260, 43, 46], [609, 274, 43, 44], [718, 285, 43, 44]].forEach(([x, y, rx, ry], k) => cut(`bead-${k}`, ellipse(x, y, rx, ry)));
    } else if (st.kind === 'router') {
      patch(rect(545, 64, 183, 567) + rect(1190, 66, 158, 563));
      cut('antenna-0', rect(545, 64, 183, 567));
      cut('antenna-1', rect(1190, 66, 158, 563));
      [[1007, 810], [1148, 810], [1287, 807]].forEach(([x, y], k) => {
        patch(ellipse(x + 4, y + 3, 57, 56));
        cut(`button-${k}`, ellipse(x, y, 49, 48));
      });
    } else if (st.kind === 'notebook') {
      patch(path('M645 490 L718 505 L983 700 L1032 797 L934 818 L657 567 Z'));
      cut('pencil', path('M657 503 Q660 496 670 501 L697 514 L733 530 L925 686 L964 705 Q991 720 999 743 Q1003 758 985 771 Q973 781 958 774 L928 754 L899 735 L722 589 L683 551 Z'));
    } else if (st.kind === 'software') {
      const shapes = [
        'M281 444 Q280 413 307 400 L372 375 Q410 365 444 374 L518 386 Q549 392 549 426 L547 532 Q535 573 501 601 Q486 626 462 626 L315 613 Q284 608 284 578 Z',
        'M596 152 Q594 122 625 107 L678 78 Q710 64 747 70 L887 86 Q927 92 927 125 L927 508 Q925 536 910 550 L862 576 Q847 589 809 585 L638 571 Q599 568 598 539 Z',
        'M977 534 Q976 509 1002 496 L1041 470 Q1058 456 1090 462 L1197 479 Q1236 483 1239 512 L1237 636 Q1238 667 1220 687 L1186 716 Q1170 732 1146 732 L1018 716 Q978 713 978 684 Z',
      ];
      shapes.forEach((d, k) => { patch(path(d)); cut(`cube-${k}`, path(d)); });
    } else if (st.kind === 'storefront') {
      const awning = 'M417 483 L810 525 L809 586 Q799 629 779 629 L735 624 L701 618 L666 617 L628 610 L593 606 L555 604 L519 599 L484 595 L448 588 L417 583 Q391 584 392 558 Z';
      const sign = 'M438 693 Q440 690 453 692 L552 704 Q560 706 562 721 L576 845 Q577 857 561 858 L554 848 L547 886 Q546 899 532 897 L521 893 L520 869 L432 858 L425 876 Q416 879 409 869 Z';
      const door = 'M850 640 L968 651 L965 889 L845 875 Z';
      patch(path(awning) + path(sign) + path(door));
      cut('awning', path(awning)); cut('sign', path(sign)); cut('door', path(door));
    }
    defs += `<mask id="${uid}-base" maskUnits="userSpaceOnUse" x="0" y="0" width="1536" height="1024"><rect width="1536" height="1024" fill="white"/><g fill="black">${holes}</g></mask><mask id="${uid}-patch" maskUnits="userSpaceOnUse" x="0" y="0" width="1536" height="1024"><g fill="white" stroke="white" stroke-width="6">${holes}</g></mask>`;
    const host = document.createElement('span');
    host.className = 'clay-cutout-rig';
    host.innerHTML = `<svg viewBox="0 0 1536 1024" aria-hidden="true" focusable="false"><defs>${defs}</defs><g mask="url(#${uid}-patch)">${plate}</g><g mask="url(#${uid}-base)">${photo}</g>${parts}</svg>`;
    st.root.append(host);
    st.parts = Object.fromEntries([...host.querySelectorAll('[data-cutout-part]')].map(p => [p.dataset.cutoutPart, p]));
  }

  function pose(st, n) {
    st.root.dataset.clayPose = String(n);
    const rest = n === 0 || n === LAST;
    st.root.classList.toggle('is-articulated', !!st.parts && !rest);
    const move = (part, value) => st.parts[part].setAttribute('transform', value);
    if (st.parts) {
      if (st.kind === 'browser') {
        [[503, 260], [609, 274], [718, 285]].forEach(([x, y], k) => {
          const d = hop[Math.max(0, n - k * 2)];
          move(`bead-${k}`, transform(x, y, d === 0 ? 1 : d > 0 ? 1.06 : .98, d === 0 ? 1 : d > 0 ? .94 : 1.02, 0, d));
        });
      } else if (st.kind === 'router') {
        move('antenna-0', transform(667, 626, 1, 1, 0, 0, wag[n] * 7));
        move('antenna-1', transform(1254, 623, 1, 1, 0, 0, -wag[Math.max(0, n - 2)] * 7));
        [[1007, 810], [1148, 810], [1287, 807]].forEach(([x, y], k) => {
          const press = Math.max(0, wag[Math.max(0, n - k * 2)]);
          move(`button-${k}`, transform(x, y, 1 - press * .09, 1 - press * .09, press * 3, press * 3));
        });
      } else if (st.kind === 'notebook') {
        move('pencil', transform(830, 638, 1, 1, -roll[n] * 34, roll[n] * 46, -roll[n] * 4));
      } else if (st.kind === 'software') {
        [[418, 615], [765, 575], [1106, 727]].forEach(([x, y], k) => {
          const d = hop[Math.max(0, n - k * 2)];
          move(`cube-${k}`, transform(x, y, d > 0 ? 1.06 : 1, d > 0 ? .94 : 1, 0, d, d < 0 ? (k - 1) * 2 : 0));
        });
      } else {
        move('awning', transform(602, 505, 1, 1 + wag[n] * .055, 0, wag[n] * 3));
        move('sign', transform(484, 880, 1, 1, 0, 0, wag[Math.max(0, n - 2)] * 5));
        move('door', transform(965, 768, 1 - Math.max(0, roll[n]) * .35, 1));
      }
      return;
    }
    const w = wag[n], r = roll[n], h = hop[n];
    let value = '';
    switch (profiles[st.id] || 'rock') {
      case 'drive': {
        const x = [0, -1, -2, 4, 17, 42, 90, 130, -130, -90, -42, -13, 3, -1, 0, 0][n];
        value = `translateX(${x}%) rotate(${n > 2 && n < 12 ? -2 : 0}deg)`; break;
      }
      case 'hop': value = `translateY(${h * .1}%) scale(${h > 0 ? 1.07 : .98},${h > 0 ? .93 : 1.02}) rotate(${w * 2}deg)`; break;
      case 'stamp': value = `translateY(${h * .09}%) scaleY(${h > 0 ? .94 : 1}) rotate(${-w * 3}deg)`; break;
      case 'paper': value = `translateY(${-r * 2}%) rotate(${-r * 5}deg) scaleY(${1 - r * .025})`; break;
      case 'swing': value = `rotate(${w * 9}deg)`; break;
      case 'stretch': value = `scaleX(${1 + r * .06}) rotate(${w}deg)`; break;
      case 'breathe': value = `scale(${1 - r * .015},${1 + r * .03})`; break;
      case 'nod': value = `translateY(${w}%) rotate(${w * 3}deg) scaleY(${1 - w * .025})`; break;
      default: value = `rotate(${w * 4}deg) translateY(${-Math.abs(w)}%)`;
    }
    st.root.style.transform = rest ? '' : value;
  }
  function stop(st) {
    cancelAnimationFrame(st.raf); st.epoch++; st.running = false; st.pending = false;
    active.delete(st); st.root.dataset.clayRunning = 'false'; pose(st, 0);
  }
  async function warm(st) {
    if (!st.kind || st.parts) return;
    if (!st.warming) st.warming = (async () => {
      const plate = new Image();
      plate.src = `/assets/clay-png/motion-${st.kind}-clean.png`;
      await Promise.all([st.image.decode(), plate.decode()]);
      if (st.root.isConnected) rig(st);
    })();
    await st.warming;
  }
  async function play(st) {
    const epoch = st.epoch;
    st.pending = true; active.add(st);
    try { await warm(st); } catch (error) { stop(st); console.warn('Clay motion plate could not load', st.id, error); pump(); return; }
    if (epoch !== st.epoch) { pump(); return; }
    if (!enabled() || !st.visible) { stop(st); pump(); return; }
    st.pending = false; st.running = true; st.plays++;
    st.root.dataset.clayRunning = 'true'; st.root.dataset.clayPlays = String(st.plays); pose(st, 0);
    const start = performance.now(); let previous = -1;
    const tick = now => {
      if (!enabled() || !st.visible) { stop(st); pump(); return; }
      const n = Math.min(LAST, Math.floor((now - start) * FPS / 1000));
      if (n !== previous) { pose(st, n); previous = n; }
      if (now - start >= DURATION) { st.running = false; st.root.dataset.clayRunning = 'false'; active.delete(st); pose(st, LAST); pump(); return; }
      st.raf = requestAnimationFrame(tick);
    };
    st.raf = requestAnimationFrame(tick);
  }
  function pump() {
    if (!enabled()) return;
    while (active.size < 3 && queue.length) {
      const st = queue.shift(); st.queued = false;
      if (st.visible && !st.running && !st.pending) void play(st);
    }
  }
  function request(st, priority = false) {
    if (!enabled() || st.running || st.pending || st.queued) return;
    st.queued = true; priority ? queue.unshift(st) : queue.push(st); pump();
  }
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const st = states.get(entry.target); st.visible = entry.isIntersecting;
      if (st.visible && !st.seen) { st.seen = true; request(st); }
      else if (!st.visible) stop(st);
    }
    pump();
  }, { threshold: .18 });
  roots.forEach(root => {
    const tile = root.closest('.tile'), id = root.dataset.clayCutout;
    const st = { root, tile, id, kind: articulated[id], image: root.querySelector('img'), parts: null, epoch: 0, plays: 0, running: false, pending: false, queued: false, seen: false, visible: false, raf: 0 };
    states.set(root, st); pose(st, 0); observer.observe(root);
    tile.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') request(st, true); }, { passive: true });
    tile.addEventListener('focusin', () => request(st, true));
    tile.addEventListener('pointerdown', event => { if (event.pointerType === 'touch') request(st, true); }, { passive: true });
  });
  function reconcile() {
    if (!enabled()) { queue.splice(0).forEach(st => { st.queued = false; }); states.forEach(stop); }
  }
  reduce.addEventListener('change', reconcile);
  document.addEventListener('visibilitychange', reconcile);
  new MutationObserver(reconcile).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener('pagehide', () => states.forEach(stop));
})();
