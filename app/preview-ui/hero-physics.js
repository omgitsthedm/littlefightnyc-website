/* Anchored mass/spring motion. All artwork and links exist before enhancement. */
(() => {
  'use strict';
  const stage = document.querySelector('[data-hero-physics]');
  if (!stage) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const bodies = [...stage.querySelectorAll('[data-hero-body]')].map(element => ({
    element, surface: element.querySelector('.hero-body'), mass: Number(element.dataset.mass),
    x: 0, y: 0, angle: 0, vx: 0, vy: 0, va: 0, tx: 0, ty: 0, ta: 0,
    suppressUntil: 0,
  }));
  const byElement = new Map(bodies.map(body => [body.element, body]));
  let visible = true, frame = 0, last = 0, drag = null;
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const enabled = () => visible && !document.hidden && !reduce.matches &&
    !document.body.matches('.no-motion,.reader-open,.explore-open');
  const paint = body => {
    body.surface.style.setProperty('--hero-x', body.x.toFixed(3) + 'px');
    body.surface.style.setProperty('--hero-y', body.y.toFixed(3) + 'px');
    body.surface.style.setProperty('--hero-angle', body.angle.toFixed(3) + 'deg');
  };
  const stop = () => {
    cancelAnimationFrame(frame); frame = 0; last = 0;
    if (drag?.body.element.hasPointerCapture(drag.id)) drag.body.element.releasePointerCapture(drag.id);
    drag = null;
    bodies.forEach(body => {
      for (const key of ['x','y','angle','vx','vy','va','tx','ty','ta']) body[key] = 0;
      body.element.removeAttribute('data-grabbing');
      body.surface.style.removeProperty('will-change');
      paint(body);
    });
    stage.dataset.physicsState = enabled() ? 'settled' : 'paused';
  };
  const tick = time => {
    frame = 0;
    if (!enabled()) { stop(); return; }
    const dt = Math.min(last ? (time - last) / 1000 : 1 / 60, 1 / 30);
    last = time;
    let awake = false;
    bodies.forEach(body => {
      // Semi-implicit integration with small substeps remains stable on slow frames.
      const stiffness = 235, damping = 2 * Math.sqrt(stiffness * body.mass) * .88;
      for (let step = 0; step < 4; step++) {
        for (const [position, velocity, target] of [['x','vx','tx'],['y','vy','ty'],['angle','va','ta']]) {
          body[velocity] += ((stiffness * (body[target] - body[position]) - damping * body[velocity]) / body.mass) * dt / 4;
          body[position] += body[velocity] * dt / 4;
        }
      }
      const moving = Math.abs(body.x-body.tx)+Math.abs(body.y-body.ty)+Math.abs(body.angle-body.ta)+
        Math.abs(body.vx)+Math.abs(body.vy)+Math.abs(body.va) > .035;
      if (moving) {
        awake = true; body.surface.style.willChange = 'transform';
      } else {
        body.x = body.tx; body.y = body.ty; body.angle = body.ta;
        body.vx = body.vy = body.va = 0; body.surface.style.removeProperty('will-change');
      }
      paint(body);
    });
    stage.dataset.physicsState = awake ? 'active' : 'settled';
    if (awake) frame = requestAnimationFrame(tick); else last = 0;
  };
  const wake = () => {
    if (!frame && enabled()) { last = 0; frame = requestAnimationFrame(tick); }
  };
  const rest = body => { body.tx = body.ty = body.ta = 0; wake(); };
  bodies.forEach(body => {
    body.element.addEventListener('pointermove', event => {
      if (!enabled() || !fine.matches || drag) return;
      const rect = body.element.getBoundingClientRect();
      const lever = clamp((event.clientX - rect.left) / rect.width * 2 - 1, -1, 1);
      body.tx = lever * 4 / body.mass;
      body.ty = -5 / body.mass;
      body.ta = lever * 1.7 / body.mass;
      wake();
    });
    body.element.addEventListener('pointerleave', () => { if (!drag) rest(body); });
    body.element.addEventListener('focus', () => { if (enabled()) { body.ty = -3; wake(); } });
    body.element.addEventListener('blur', () => rest(body));
    body.element.addEventListener('dragstart', event => event.preventDefault());
    body.element.addEventListener('pointerdown', event => {
      if (!enabled() || !fine.matches || event.pointerType !== 'mouse' || event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
      drag = { body, id: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
    });
  });
  stage.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id || !enabled()) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 7) return;
    drag.moved = true;
    drag.body.element.setPointerCapture(event.pointerId);
    drag.body.element.setAttribute('data-grabbing', '');
    drag.body.tx = clamp(dx, -38, 38);
    drag.body.ty = clamp(dy, -26, 12);
    drag.body.ta = clamp(dx / 14, -2.5, 2.5);
    event.preventDefault(); wake();
  });
  const release = event => {
    if (!drag || event.pointerId !== drag.id) return;
    const { body, id, moved } = drag;
    drag = null;
    if (moved) body.suppressUntil = performance.now() + 350;
    if (body.element.hasPointerCapture(id)) body.element.releasePointerCapture(id);
    body.element.removeAttribute('data-grabbing'); rest(body);
  };
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);
  stage.addEventListener('click', event => {
    const body = byElement.get(event.target.closest('[data-hero-body]'));
    if (body && performance.now() < body.suppressUntil) {
      event.preventDefault(); event.stopImmediatePropagation();
    }
  }, true);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (!visible) stop();
  }, { threshold: .05 }).observe(stage);
  new MutationObserver(() => { if (!enabled()) stop(); }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', stop);
  reduce.addEventListener('change', stop);
  fine.addEventListener('change', stop);
  window.addEventListener('blur', stop);
  stop();
})();
