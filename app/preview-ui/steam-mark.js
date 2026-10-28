// Native adaptation of the approved Steam Assembly 1.1 painter.
// The original mark paths are read from the inline static SVG. No media fetch,
// library, network call, or generated replacement logo is needed.
(() => {
  'use strict';
  const points = [{"x":198,"y":146.0,"band":0},{"x":220,"y":146.0,"band":1},{"x":187,"y":165.05,"band":0},{"x":209,"y":165.05,"band":0},{"x":231,"y":165.05,"band":1},{"x":220,"y":184.1,"band":1},{"x":286,"y":184.1,"band":1},{"x":308,"y":184.1,"band":1},{"x":330,"y":184.1,"band":2},{"x":352,"y":184.1,"band":2},{"x":209,"y":203.15,"band":0},{"x":231,"y":203.15,"band":1},{"x":275,"y":203.15,"band":1},{"x":297,"y":203.15,"band":1},{"x":198,"y":222.2,"band":0},{"x":220,"y":222.2,"band":1},{"x":242,"y":222.2,"band":1},{"x":264,"y":222.2,"band":1},{"x":286,"y":222.2,"band":1},{"x":352,"y":222.2,"band":2},{"x":209,"y":241.25,"band":0},{"x":231,"y":241.25,"band":1},{"x":253,"y":241.25,"band":1},{"x":275,"y":241.25,"band":1},{"x":297,"y":241.25,"band":1},{"x":319,"y":241.25,"band":2},{"x":341,"y":241.25,"band":2},{"x":363,"y":241.25,"band":2},{"x":154,"y":260.3,"band":0},{"x":176,"y":260.3,"band":0},{"x":198,"y":260.3,"band":0},{"x":220,"y":260.3,"band":1},{"x":242,"y":260.3,"band":1},{"x":264,"y":260.3,"band":1},{"x":286,"y":260.3,"band":1},{"x":374,"y":260.3,"band":2},{"x":396,"y":260.3,"band":2},{"x":418,"y":260.3,"band":2},{"x":165,"y":279.35,"band":0},{"x":187,"y":279.35,"band":0},{"x":209,"y":279.35,"band":0},{"x":231,"y":279.35,"band":1},{"x":253,"y":279.35,"band":1},{"x":297,"y":279.35,"band":1},{"x":319,"y":279.35,"band":2},{"x":341,"y":279.35,"band":2},{"x":363,"y":279.35,"band":2},{"x":407,"y":279.35,"band":2},{"x":264,"y":298.4,"band":1},{"x":286,"y":298.4,"band":1},{"x":308,"y":298.4,"band":1},{"x":330,"y":298.4,"band":2},{"x":352,"y":298.4,"band":2},{"x":396,"y":298.4,"band":2},{"x":418,"y":298.4,"band":2},{"x":99,"y":317.45,"band":0},{"x":121,"y":317.45,"band":0},{"x":143,"y":317.45,"band":0},{"x":165,"y":317.45,"band":0},{"x":187,"y":317.45,"band":0},{"x":209,"y":317.45,"band":0},{"x":231,"y":317.45,"band":1},{"x":253,"y":317.45,"band":1},{"x":275,"y":317.45,"band":1},{"x":297,"y":317.45,"band":1},{"x":319,"y":317.45,"band":2},{"x":341,"y":317.45,"band":2},{"x":363,"y":317.45,"band":2},{"x":385,"y":317.45,"band":2},{"x":407,"y":317.45,"band":2},{"x":88,"y":336.5,"band":0},{"x":110,"y":336.5,"band":0},{"x":132,"y":336.5,"band":0},{"x":154,"y":336.5,"band":0},{"x":176,"y":336.5,"band":0},{"x":198,"y":336.5,"band":0},{"x":220,"y":336.5,"band":1},{"x":242,"y":336.5,"band":1},{"x":264,"y":336.5,"band":1},{"x":286,"y":336.5,"band":1},{"x":308,"y":336.5,"band":1},{"x":330,"y":336.5,"band":2},{"x":352,"y":336.5,"band":2},{"x":374,"y":336.5,"band":2},{"x":396,"y":336.5,"band":2},{"x":99,"y":355.55,"band":0},{"x":121,"y":355.55,"band":0},{"x":143,"y":355.55,"band":0},{"x":165,"y":355.55,"band":0},{"x":187,"y":355.55,"band":0},{"x":209,"y":355.55,"band":0},{"x":231,"y":355.55,"band":1},{"x":253,"y":355.55,"band":1},{"x":275,"y":355.55,"band":1},{"x":297,"y":355.55,"band":1},{"x":319,"y":355.55,"band":2},{"x":341,"y":355.55,"band":2},{"x":363,"y":355.55,"band":2}];
  let painter;
  function makePainter(svg) {
    if (!window.Path2D) return null;
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const mark = document.createElement('canvas'); mark.width = mark.height = 512;
    const m = mark.getContext('2d');
    const clipCanvas = document.createElement('canvas'); clipCanvas.width = clipCanvas.height = 512;
    const cc = clipCanvas.getContext('2d');
    if (!ctx || !m || !cc) return null;
    m.translate(84, 140.569); m.scale(344 / 838.016418, 344 / 838.016418);
    m.translate(-297.159815, 611.589160); m.scale(.1, -.1);
    m.fillStyle = '#f97316';
    svg.querySelectorAll('path').forEach(path => m.fill(new Path2D(path.getAttribute('d'))));
const nodes=[{x:202.3064,y:247},{x:256,y:196},{x:309.6936,y:247}];
const angles=[150,270,30];
const clamp=v=>Math.max(0,Math.min(1,v));
const smooth=v=>{const p=clamp(v);return p*p*(3-2*p)};
const inOut=v=>{const p=clamp(v);return p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2};
const out=v=>1-Math.pow(1-clamp(v),3);
function bezier(a,b,c,d,p){const q=1-p;return q*q*q*a+3*q*q*p*b+3*q*p*p*c+p*p*p*d}
function circle(context,x,y,r){if(r<=.001)return;context.moveTo(x+r,y);context.arc(x,y,r,0,Math.PI*2)}
function maskedLogo(radii){
  cc.clearRect(0,0,512,512);cc.globalCompositeOperation='source-over';cc.fillStyle='#ffffff';cc.beginPath();
  for(let i=0;i<points.length;i++)circle(cc,points[i].x,points[i].y,radii[i]);
  cc.fill();cc.globalCompositeOperation='source-in';cc.drawImage(mark,0,0,512,512);cc.globalCompositeOperation='source-over';ctx.drawImage(clipCanvas,0,0,512,512);
}
function paint(t){
 // Hold the complete brand mark longer before the approved motion begins.
 t = t < 1.4 ? 0 : t >= 4 ? 3.3 : .5 + (t - 1.4) * (2.8 / 2.6);
 ctx.clearRect(0,0,512,512);ctx.fillStyle='#f97316';
 if(t<.5 || t>=3.30){ctx.drawImage(mark,0,0,512,512);return}
 if(t<1.36){
  const states=points.map(p=>{
   const delay=.12*((p.x-84)/344)+.06*(1-(p.y-140)/232)+(p.x<112&&p.y>300?.04:0);
   return clamp((t-.5-delay)/.64);
  });
  maskedLogo(states.map(p=>26*(1-smooth(p/.44))));
  ctx.beginPath();
  points.forEach((p,i)=>{
   const u=states[i];if(u<=0)return;const e=inOut(u);const n=nodes[p.band];
   const x=bezier(p.x,p.x+(n.x-p.x)*.24,n.x+(p.x-n.x)*.14,n.x,e);
   const y=bezier(p.y,p.y-28,n.y+18,n.y,e);
   const r=(4.5+9.5*smooth((u-.74)/.26))*smooth(u/.12);
   circle(ctx,x,y,r);
  });ctx.fill();return;
 }
 if(t<2.42){
  const spin=inOut((t-1.48)/.82)*120;ctx.beginPath();
  angles.forEach(a=>{const rad=(a+spin)*Math.PI/180;circle(ctx,256+62*Math.cos(rad),230+34*Math.sin(rad),14)});
  ctx.fill();return;
 }
 const states=points.map(p=>clamp((t-2.42-.06*(1-(p.y-140)/232))/.76));
 maskedLogo(states.map(p=>26*smooth((p-.55)/.45)));
 ctx.beginPath();
 points.forEach((p,i)=>{
  const u=states[i],e=inOut(u),n=nodes[p.band];
  const x=bezier(n.x,n.x+(p.x-n.x)*.20,p.x-(p.x-n.x)*.12,p.x,e);
  const y=bezier(n.y,n.y+(p.y-n.y)*.12-22,p.y-18,p.y,e);
  const r=(14-9.5*smooth(u/.62))*(1-smooth((u-.70)/.30));
  circle(ctx,x,y,r);
 });ctx.fill();
}

    return { canvas, paint };
  }
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const records = new Map();
  const sessionKey = 'lf-steam-header-v1.1';
  let headerPlayed = false;
  let sessionAvailable = false;
  try { headerPlayed = sessionStorage.getItem(sessionKey) === 'played'; sessionAvailable = true; } catch { /* Static-first when session storage is blocked. */ }
  const allowed = () => !motion.matches && !document.hidden && !document.body.classList.contains('no-motion');

  function reset(record) {
    cancelAnimationFrame(record.frame);
    record.frame = 0;
    record.running = false;
    record.node.dataset.steamState = 'static';
  }
  function draw(record, seconds) {
    const box = record.node.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(box.width * ratio));
    const height = Math.max(1, Math.round(box.height * ratio));
    if (record.canvas.width !== width || record.canvas.height !== height) {
      record.canvas.width = width; record.canvas.height = height;
    }
    // Crop only the export's avatar padding; retain the existing header mark's
    // exact aspect ratio, geometry and centered clear space.
    const cropWidth = 344, cropHeight = 562.406218 * 344 / 838.016418;
    const scale = Math.min(width / cropWidth, height / cropHeight);
    painter.paint(seconds);
    record.ctx.clearRect(0, 0, width, height);
    record.ctx.drawImage(painter.canvas, 84, 140.569, cropWidth, cropHeight,
      (width - cropWidth * scale) / 2, (height - cropHeight * scale) / 2, cropWidth * scale, cropHeight * scale);
  }
  function start(record, deliberate = false) {
    // Focus can scroll an initially offscreen link into view before the
    // IntersectionObserver callback arrives. Measure only on deliberate replay.
    if (deliberate) {
      const rect = record.node.getBoundingClientRect();
      record.visible = rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
    }
    if (!allowed() || !record.visible || record.running || !record.node.isConnected) return;
    const mode = record.node.dataset.steamMark;
    if (mode === 'static') return;
    if (!deliberate && (record.played || (mode === 'header' && (headerPlayed || !sessionAvailable)))) return;
    try {
      painter ||= makePainter(record.node.querySelector('svg'));
      if (!painter) return;
      if (!record.canvas) {
        record.canvas = document.createElement('canvas');
        record.canvas.setAttribute('aria-hidden', 'true');
        record.ctx = record.canvas.getContext('2d');
        if (!record.ctx) return;
        record.node.append(record.canvas);
      }
      if (mode === 'header') {
        headerPlayed = true;
        try { sessionStorage.setItem(sessionKey, 'played'); } catch { /* Document-local replay guard remains. */ }
      }
      record.played = true;
      record.replayOnVisible = false;
      record.running = true;
      const began = performance.now();
      draw(record, 0);
      record.node.dataset.steamState = 'playing';
      function tick(now) {
        if (!allowed() || !record.visible || !record.node.isConnected || now - began >= 6000) { reset(record); return; }
        try { draw(record, (now - began) / 1000); } catch { reset(record); return; }
        record.frame = requestAnimationFrame(tick);
      }
      record.frame = requestAnimationFrame(tick);
    } catch { reset(record); }
  }
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    for (const entry of entries) {
      const record = records.get(entry.target);
      if (!record) continue;
      record.visible = entry.isIntersecting && entry.intersectionRatio > 0;
      if (!record.visible) reset(record);
      else start(record, record.replayOnVisible);
    }
  }, { threshold: 0.01 }) : null;

  function scan() {
    for (const [node, record] of records) {
      if (!node.isConnected) { reset(record); observer?.unobserve(node); record.abort.abort(); records.delete(node); }
    }
    document.querySelectorAll('[data-steam-mark]').forEach(node => {
      if (records.has(node)) return;
      const record = { node, visible: false, played: false, running: false, replayOnVisible: false, frame: 0, canvas: null, ctx: null, abort: new AbortController() };
      records.set(node, record);
      node.dataset.steamState = 'static';
      observer?.observe(node);
      if (node.dataset.steamMark === 'header') {
        const link = node.closest('a');
        link?.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') start(record, true); }, { signal: record.abort.signal });
        link?.addEventListener('focus', () => {
          record.replayOnVisible = true;
          requestAnimationFrame(() => start(record, true));
        }, { signal: record.abort.signal });
        link?.addEventListener('blur', () => { record.replayOnVisible = false; }, { signal: record.abort.signal });
      }
    });
  }
  function sync() {
    for (const record of records.values()) {
      if (!allowed()) reset(record);
      else start(record);
    }
  }
  // The inquiry island and in-page readers may mount after the first document.
  // Observe structure, never the painter's per-frame pixels.
  new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  motion.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  document.addEventListener('lf:motion-change', sync);
  window.addEventListener('pagehide', () => records.forEach(reset));
  window.addEventListener('pageshow', sync);
  scan();
})();
