/* systems.js — one clock drives everything. Traffic, citizens, economy, weather,
   renovation, beam, train, audio, persistence. Every economy event has an actor.
   Contract: makeSystems(THREE, world, opts) → { update(dt), state, api } */

import { CITY, ART } from './city.js';

export function makeSystems(THREE, world, opts) {
  const { rng, rand, pick, reduceMotion, isMobile, onTicker, onEventUI } = opts;
  const G = world.rotGroup;

  /* ---------- time ---------- */
  const DAY_LEN = 180;
  const state = {
    dayT: 0.5, clockTime: 0, phase: 'GOLDEN',
    signal: { t: 0, state: 'EW' },
    weather: { v: 0, target: 0, next: reduceMotion ? 1e9 : rand(35, 70), dur: 0 },
    sim: { tick: 0, events: 0, evtWindow: [], history: [] },
    reno: { stage: 0, t: 0, boot: -1, open: false },
    persist: { day: 1, allTime: 0 },
    biz: CITY.businesses.map((b) => ({ id: b.id, orders: b.renovation ? 0 : Math.floor(rand(12, 70)), calls: Math.floor(rand(4, 26)), signalPct: rand(88, 99) })),
    citizens: [],
  };

  const _c1 = new THREE.Color(), _c2 = new THREE.Color();
  function sampleDay(t) {
    const A = ART.dayAnchors;
    let i = A.length - 1;
    for (let k = 0; k < A.length; k++) if (t >= A[k].t) i = k;
    const a = A[i], b = A[(i + 1) % A.length];
    let span = b.t - a.t; if (span <= 0) span += 1;
    let f = t - a.t; if (f < 0) f += 1;
    f = THREE.MathUtils.clamp(f / span, 0, 1);
    f = f * f * (3 - 2 * f);
    const mix = (x, y) => x + (y - x) * f;
    const col = (x, y) => _c1.set(x).lerp(_c2.set(y), f).clone();
    return {
      hemiS: col(a.hemiS, b.hemiS), hemiG: col(a.hemiG, b.hemiG), hemiI: mix(a.hemiI, b.hemiI),
      keyC: col(a.keyC, b.keyC), keyI: mix(a.keyI, b.keyI), rimI: mix(a.rimI, b.rimI),
      fog: col(a.fog, b.fog), bg: col(a.bg, b.bg),
      win: mix(a.win, b.win), sign: mix(a.sign, b.sign), grid: mix(a.grid, b.grid),
      edge: mix(a.edge, b.edge), orb: mix(a.orb, b.orb), head: mix(a.head, b.head),
    };
  }
  function dayClock(t) {
    const ts = [0.05, 0.29, 0.53, 0.80, 1.05], hs = [6, 12, 19.5, 25, 30];
    const tt = t < 0.05 ? t + 1 : t;
    let i = 0;
    for (let k = 0; k < 4; k++) if (tt >= ts[k]) i = k;
    const f = (tt - ts[i]) / (ts[i + 1] - ts[i]);
    const h = hs[i] + (hs[i + 1] - hs[i]) * f;
    return `${String(Math.floor(h) % 24).padStart(2, '0')}:${String(Math.floor((h % 1) * 60)).padStart(2, '0')}`;
  }
  const phaseName = (t) => (t < 0.13 || t >= 0.98) ? 'DAWN' : t < 0.45 ? 'DAY' : t < 0.62 ? 'GOLDEN' : 'NIGHT';

  /* ---------- persistence: the district remembers ---------- */
  const PKEY = 'neon-district-v2';
  try {
    const saved = JSON.parse(localStorage.getItem(PKEY) || 'null');
    if (saved) {
      state.persist.day = saved.day + (Date.now() - saved.at > 4 * 3600e3 ? 1 : 0);
      state.persist.allTime = saved.allTime || 0;
    }
  } catch { /* private mode */ }
  function persistSave() {
    try {
      localStorage.setItem(PKEY, JSON.stringify({ day: state.persist.day, allTime: state.persist.allTime + state.sim.events, at: Date.now() }));
    } catch { /* ignore */ }
  }
  setInterval(persistSave, 10000);

  /* ---------- signal ---------- */
  const PH = CITY.roads.phase;
  function signalStep(dt) {
    const S = state.signal;
    S.t += dt;
    const cyc = PH.EW + PH.RED + PH.NS + PH.RED;
    const tt = S.t % cyc;
    S.state = tt < PH.EW ? 'EW' : tt < PH.EW + PH.RED ? 'RED1' : tt < PH.EW + PH.RED + PH.NS ? 'NS' : 'RED2';
  }

  /* ---------- traffic ---------- */
  const lanes = CITY.roads.lanes.map((l) => {
    const from = new THREE.Vector3(l.from[0], 0, l.from[1]);
    const to = new THREE.Vector3(l.to[0], 0, l.to[1]);
    const len = from.distanceTo(to);
    const axis = Math.abs(to.x - from.x) > Math.abs(to.z - from.z) ? 'x' : 'z';
    const sign = axis === 'x' ? Math.sign(to.x - from.x) : Math.sign(to.z - from.z);
    const stopAlongs = l.stops.map((sv) => axis === 'x' ? (sign > 0 ? sv - from.x : from.x - sv) : (sign > 0 ? sv - from.z : from.z - sv)).sort((a, b) => a - b);
    return { ...l, fromV: from, toV: to, len, axis, sign, stopAlongs };
  });
  world.laneMap = Object.fromEntries(lanes.map((l) => [l.id, l]));
  const cars = [];
  const carColors = ['#33e6ff', '#ff3ec8', '#a06bff', '#9dff3e', '#ff6a4d'];
  CITY.fleet.forEach((f, i) => {
    const lane = world.laneMap[f.lane];
    const m = world.carMesh(f.cab ? '#ffb02e' : carColors[i % carColors.length], f.cab);
    m.rotation.y = lane.axis === 'x' ? (lane.sign > 0 ? 0 : Math.PI) : (lane.sign > 0 ? -Math.PI / 2 : Math.PI / 2);
    G.add(m);
    cars.push({ m, lane, t: (i * 0.29 + rng() * 0.15) % 1, speed: rand(2.5, 3.3), v: 0, cab: f.cab });
  });
  state.cars = cars;

  function carStep(a, dt) {
    const r = a.lane;
    const posAlong = a.t * r.len;
    const go = (r.dir === 'EW' && state.signal.state === 'EW') || (r.dir === 'NS' && state.signal.state === 'NS');
    let targetV = a.speed;
    if (!go) {
      for (const sa of r.stopAlongs) {
        const d = sa - posAlong;
        if (d > 0 && d < 2.2) { targetV = d < 0.35 ? 0 : a.speed * (d / 2.2); break; }
      }
    }
    for (const other of cars) {
      if (other === a || other.lane !== r) continue;
      const gap = (other.t - a.t) * r.len;
      if (gap > 0 && gap < 1.5) targetV = Math.min(targetV, Math.max(0, (gap - 0.9) * 2));
    }
    a.v += (targetV - a.v) * Math.min(1, dt * 4);
    a.t += (a.v * dt) / r.len;
    if (a.t > 1) a.t -= 1;
    a.m.position.copy(r.fromV).lerp(r.toV, a.t);
    a.m.position.y = 0.02;
    const endDist = Math.min(a.t, 1 - a.t) * r.len;
    const vis = THREE.MathUtils.clamp(endDist / 1.2, 0, 1);
    a.m.visible = vis > 0.05;
    a.m.scale.setScalar(Math.max(0.001, vis));
  }

  /* ---------- pedestrian graph ---------- */
  const NODES = CITY.walkGraph.nodes;
  const ADJ = {};
  for (const [a, b, kind] of CITY.walkGraph.edges) {
    (ADJ[a] = ADJ[a] || []).push({ to: b, kind });
    (ADJ[b] = ADJ[b] || []).push({ to: a, kind });
  }
  function bfsPath(from, to) {
    if (from === to) return [from];
    const prev = { [from]: null };
    const q = [from];
    while (q.length) {
      const n = q.shift();
      for (const e of ADJ[n] || []) {
        if (!(e.to in prev)) { prev[e.to] = n; if (e.to === to) { q.length = 0; break; } q.push(e.to); }
      }
    }
    if (!(to in prev)) return null;
    const path = [to];
    let cur = to;
    while (prev[cur]) { cur = prev[cur]; path.unshift(cur); }
    return path;
  }
  const nodeV = (id) => new THREE.Vector3(NODES[id][0], 0, NODES[id][1]);
  const edgeKind = (a, b) => (ADJ[a] || []).find((e) => e.to === b)?.kind;

  /* ---------- citizens ---------- */
  const doorNodeToBiz = {};
  CITY.businesses.forEach((b) => { doorNodeToBiz[b.door] = b.id; });

  function pedMesh(tint) {
    const g = new THREE.Group();
    const bodyM = new THREE.Mesh(new THREE.SphereGeometry(0.085, 8, 8), new THREE.MeshBasicMaterial({ color: tint }));
    bodyM.position.y = 0.16;
    const headM = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshBasicMaterial({ color: tint }));
    headM.position.y = 0.32;
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: world.softDot, transparent: true, opacity: 0.35, depthWrite: false }));
    glow.scale.setScalar(0.5);
    glow.position.y = 0.2;
    g.add(bodyM, headM, glow);
    return g;
  }

  const TINTS = ['#ffe9c8', '#ffd9f2', '#d9f2ff', '#e6ffd9'];
  CITY.citizens.forEach((c, i) => {
    const m = pedMesh(TINTS[i % 4]);
    m.position.copy(nodeV(c.home));
    G.add(m);
    const workBiz = CITY.businesses[c.works];
    const cz = {
      i, name: c.name, works: c.works, home: c.home, m,
      node: c.home, path: null, seg: 0, segT: 0, speed: rand(0.5, 0.85),
      state: 'idle', hideT: 0, log: [], activity: 'waking up',
      shift: { start: (workBiz.peak - 0.22 + 1) % 1, end: (workBiz.peak + 0.2) % 1 },
      errandT: rand(4, 30),
    };
    state.citizens.push(cz);
    m.userData.citizen = i;
  });

  const inWindow = (t, a, b) => (a < b ? t >= a && t < b : t >= a || t < b);

  function logAct(cz, txt) {
    cz.activity = txt;
    cz.log.push(`${dayClock(state.dayT)} · ${txt}`);
    if (cz.log.length > 4) cz.log.shift();
  }

  function sendTo(cz, targetNode, thenState) {
    const path = bfsPath(cz.node, targetNode);
    if (!path || path.length < 2) { cz.state = thenState === 'toWork' ? 'working' : 'idle'; return; }
    cz.path = path;
    cz.seg = 0; cz.segT = 0;
    cz.state = 'walking';
    cz.then = thenState;
  }

  function citizenStep(cz, dt) {
    const t = state.dayT;
    if (cz.state === 'walking') {
      const a = cz.path[cz.seg], b = cz.path[cz.seg + 1];
      const ek = edgeKind(a, b);
      if (ek === 'cross' && cz.segT === 0 && state.signal.state !== 'NS') return;
      if (ek === 'street' && cz.segT === 0 && state.signal.state !== 'EW') return;
      const av = nodeV(a), bv = nodeV(b);
      const len = av.distanceTo(bv) || 0.001;
      cz.segT += (cz.speed * dt) / len;
      cz.m.position.copy(av).lerp(bv, Math.min(1, cz.segT));
      cz.m.position.y = Math.abs(Math.sin(state.clockTime * 9 + cz.i)) * 0.02;
      if (cz.segT >= 1) {
        cz.node = b;
        cz.seg++; cz.segT = 0;
        if (cz.seg >= cz.path.length - 1) {
          cz.state = cz.then || 'idle';
          if (cz.state === 'toInside') {
            const biz = doorNodeToBiz[cz.node];
            cz.m.visible = false;
            cz.hideT = rand(4, 9);
            if (cz.visitBiz != null && biz != null) {
              economyEvent(biz, cz);
              cz.visitBiz = null;
            }
            cz.state = 'inside';
          } else if (cz.state === 'working') {
            cz.m.visible = false;
          }
        }
      }
    } else if (cz.state === 'inside') {
      cz.hideT -= dt;
      if (cz.hideT <= 0) {
        cz.m.visible = true;
        cz.m.position.copy(nodeV(cz.node));
        cz.state = 'idle';
        logAct(cz, 'back on the street');
      }
    } else if (cz.state === 'working') {
      if (!inWindow(t, cz.shift.start, cz.shift.end)) {
        cz.m.visible = true;
        cz.m.position.copy(nodeV(CITY.businesses[cz.works].door));
        cz.node = CITY.businesses[cz.works].door;
        logAct(cz, 'off shift, heading home');
        sendTo(cz, cz.home, 'idle');
      } else if (rng() < dt / 22) {
        economyEvent(cz.works, cz, true);
      }
    } else { // idle
      if (inWindow(t, cz.shift.start, cz.shift.end)) {
        logAct(cz, `heading to ${CITY.businesses[cz.works].name}`);
        sendTo(cz, CITY.businesses[cz.works].door, 'working');
        return;
      }
      cz.errandT -= dt;
      if (cz.errandT <= 0) {
        cz.errandT = rand(14, 40);
        const roll = rng();
        if (roll < 0.55) {
          const shops = CITY.businesses.filter((b) => b.kind === 'shop' && (!b.renovation || state.reno.open));
          const target = pick(shops);
          cz.visitBiz = target.id;
          logAct(cz, `stopping at ${target.name}`);
          sendTo(cz, target.door, 'toInside');
        } else if (roll < 0.8) {
          const wander = pick(['pA', 'pB', 'pC', 'pD', 'pE', 'pF', 'pG', 'wB', 'wC', 'wE']);
          logAct(cz, 'taking a walk');
          sendTo(cz, wander, 'idle');
        } else {
          logAct(cz, 'people-watching');
        }
      }
    }
  }

  /* ---------- economy: every event has an actor ---------- */
  const PULSES = [];
  for (let i = 0; i < 18; i++) {
    const mat = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 0.12), mat);
    m.visible = false;
    G.add(m);
    PULSES.push({ m, active: false, a: new THREE.Vector3(), b: new THREE.Vector3(), t: 0, dur: 1 });
  }
  const towerB = CITY.buildings.find((b) => b.arch === 'tower');
  const TOWER_BASE = new THREE.Vector3(towerB.x, 0.15, towerB.z + towerB.d / 2 + 0.6);
  function spawnPulse(from, color) {
    const p = PULSES.find((x) => !x.active);
    if (!p) return;
    p.active = true; p.m.visible = true;
    p.a.copy(from); p.b.copy(TOWER_BASE);
    p.a.y = 0.12; p.b.y = 0.12;
    p.t = 0;
    p.dur = Math.max(0.7, p.a.distanceTo(p.b) / 9);
    p.m.material.color.set(color);
    const d = p.b.clone().sub(p.a);
    p.m.rotation.y = Math.atan2(d.x, d.z) - Math.PI / 2;
  }
  function pulseStep(p, dt) {
    if (!p.active) return;
    p.t += dt / p.dur;
    if (p.t >= 1) { p.active = false; p.m.visible = false; return; }
    p.m.position.lerpVectors(p.a, p.b, p.t);
    p.m.material.opacity = Math.sin(p.t * Math.PI) * 0.95;
  }

  const courier = (() => {
    if (reduceMotion) return null;
    const g = new THREE.Group();
    const deck = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.06, 0.14), new THREE.MeshStandardMaterial({ color: '#1c1240', roughness: 0.5 }));
    deck.position.y = 0.09;
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.16, 0.16), new THREE.MeshBasicMaterial({ color: '#ff6a4d' }));
    box.position.set(-0.1, 0.24, 0);
    const rider = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), new THREE.MeshBasicMaterial({ color: '#ffe9c8' }));
    rider.position.set(0.05, 0.3, 0);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: world.orbTexture('#ff6a4d'), transparent: true, opacity: 0.5, depthWrite: false }));
    glow.scale.setScalar(0.55);
    glow.position.y = 0.15;
    g.add(deck, box, rider, glow);
    g.visible = false;
    G.add(g);
    return { m: g, state: 'idle', leg: 0, t: 0, path: [], deliveries: 0 };
  })();
  state.courier = courier;
  const COURIER_DESTS = CITY.buildings.filter((b) => b.arch !== 'tower' && b.arch !== 'warehouse').map((b) => new THREE.Vector3(b.x, 0, b.z + b.d / 2 + 0.5));
  function dispatchCourier() {
    if (!courier || courier.state !== 'idle') return;
    const dest = pick(COURIER_DESTS);
    const start = new THREE.Vector3(world.shopDoorWorld[0].x, 0.02, 3.0);
    const laneZ = CITY.grid.AVENUE_Z[0] - 0.05;
    courier.path = [start, new THREE.Vector3(start.x, 0.02, laneZ), new THREE.Vector3(dest.x, 0.02, laneZ), new THREE.Vector3(dest.x, 0.02, dest.z)];
    courier.leg = 0; courier.t = 0;
    courier.state = 'out';
    courier.m.visible = true;
    courier.m.position.copy(start);
  }
  function courierStep(c, dt) {
    if (c.state === 'idle') return;
    if (c.state === 'pause') {
      c.t -= dt;
      if (c.t <= 0) { c.state = 'back'; c.leg = c.path.length - 2; c.t = 0; }
      return;
    }
    const fwd = c.state === 'out';
    const a = c.path[c.leg], b = c.path[c.leg + 1];
    const len = a.distanceTo(b) || 0.001;
    c.t += (2.6 * dt) / len;
    const from = fwd ? a : b, to = fwd ? b : a;
    c.m.position.copy(from).lerp(to, Math.min(1, c.t));
    const dir = to.clone().sub(from);
    if (dir.lengthSq() > 0.001) c.m.rotation.y = Math.atan2(dir.x, dir.z) - Math.PI / 2;
    if (c.t >= 1) {
      c.t = 0;
      if (fwd) { c.leg++; if (c.leg >= c.path.length - 1) { c.state = 'pause'; c.t = 1.6; c.deliveries++; } }
      else { c.leg--; if (c.leg < 0) { c.state = 'idle'; c.m.visible = false; } }
    }
  }

  /* beam + train */
  const beam = { active: false, t: 0, sprites: [] };
  for (let i = 0; i < 9; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: world.softDot, transparent: true, opacity: 0, depthWrite: false, color: '#ff3ec8' }));
    s.scale.setScalar(0.001);
    opts.scene.add(s);
    beam.sprites.push(s);
  }
  const BEAM_P0 = new THREE.Vector3(), BEAM_P1 = new THREE.Vector3(), BEAM_P2 = new THREE.Vector3(-30, 13, -38);
  function fireBeam() {
    if (reduceMotion || beam.active) return;
    beam.active = true; beam.t = 0;
    G.updateMatrixWorld();
    BEAM_P0.set(towerB.x, 15.8, towerB.z).applyMatrix4(G.matrixWorld);
    BEAM_P1.copy(BEAM_P0).add(new THREE.Vector3(-8, 9, -10));
    onTicker('◆ MILESTONE — the district beams the old skyline');
  }
  function beamStep(dt) {
    if (!beam.active) return;
    beam.t += dt / 1.5;
    if (beam.t >= 1.15) {
      beam.active = false;
      beam.sprites.forEach((s) => { s.material.opacity = 0; s.scale.setScalar(0.001); });
      return;
    }
    for (let i = 0; i < beam.sprites.length; i++) {
      const k = THREE.MathUtils.clamp(beam.t - i * 0.035, 0, 1);
      const a = BEAM_P0.clone().lerp(BEAM_P1, k);
      const b = BEAM_P1.clone().lerp(BEAM_P2, k);
      const p = a.lerp(b, k);
      const s = beam.sprites[i];
      s.position.copy(p);
      const head = i === 0;
      s.material.opacity = Math.max(0, (head ? 0.95 : 0.5 - i * 0.045) * (beam.t < 1 ? 1 : 1 - (beam.t - 1) / 0.15));
      s.scale.setScalar(Math.max(0.001, head ? 1.5 - k * 0.6 : 0.9 - i * 0.06));
    }
  }

  const train = { group: new THREE.Group(), t: -1, next: 22 };
  for (let i = 0; i < 6; i++) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.28, 0.3), new THREE.MeshBasicMaterial({ color: '#ffd9a0', transparent: true, opacity: 0.85 }));
    m.position.x = i * 2.0;
    train.group.add(m);
  }
  train.group.visible = false;
  opts.scene.add(train.group);
  function trainStep(dt) {
    if (reduceMotion) return;
    if (train.t < 0) {
      train.next -= dt;
      if (train.next <= 0 && (state.dayT > 0.45 || state.dayT < 0.13)) { train.t = 0; train.group.visible = true; }
      return;
    }
    train.t += dt / 8;
    const th = 2.35 + train.t * 1.15;
    train.group.position.set(Math.sin(th) * 53, 7.2, Math.cos(th) * 53);
    train.group.rotation.y = th + Math.PI / 2;
    const fade = THREE.MathUtils.clamp(Math.min(train.t / 0.12, (1 - train.t) / 0.12), 0, 1);
    train.group.children.forEach((m) => { m.material.opacity = 0.85 * fade; });
    if (train.t >= 1) { train.t = -1; train.next = rand(34, 55); train.group.visible = false; }
  }

  function economyEvent(bizId, actor, quiet) {
    const s = state.biz[bizId];
    s.orders += 1;
    if (rng() < 0.3) s.calls += 1;
    state.sim.events += 1;
    state.sim.evtWindow.push(state.clockTime);
    const biz = CITY.businesses[bizId];
    const rec = world.signMats[bizId];
    if (rec && !rec.dead) rec.busy = 0.22;
    const doorId = biz.door;
    spawnPulse(new THREE.Vector3(NODES[doorId][0], 0.12, NODES[doorId][1]), biz.accent);
    if (actor && !quiet) onTicker(`${actor.name} → ${biz.name} · ${biz.kind === 'shop' ? 'order' : 'lead'} #${s.orders}`);
    else if (rng() < 0.2) onTicker(`${biz.name} · ${biz.kind === 'shop' ? 'order' : 'lead'} #${s.orders}`);
    if (bizId === 0 && s.orders % 3 === 0) {
      dispatchCourier();
      onTicker('PIZZA courier rolling out');
    }
    if (state.sim.events % 12 === 0) fireBeam();
    onEventUI(bizId);
    audio.ding();
  }
  state.economyEvent = economyEvent;

  let simAcc = 0;
  function simStep(dt) {
    simAcc += dt;
    if (simAcc < 0.5) return;
    simAcc -= 0.5;
    state.sim.tick += 1;
    for (const b of CITY.businesses) {
      if (b.renovation && !state.reno.open) continue;
      let d = Math.abs(state.dayT - b.peak); if (d > 0.5) d = 1 - d;
      const bell = Math.exp(-(d * d) / 0.045);
      const rate = (b.kind === 'shop' ? 2.2 : 1.8) * (0.2 + bell);
      if (rng() < rate / 120) economyEvent(b.id, null, false);
    }
    for (const s of state.biz) s.signalPct = THREE.MathUtils.clamp(s.signalPct + rand(-0.4, 0.45), 86, 99.4);
    while (state.sim.evtWindow.length && state.clockTime - state.sim.evtWindow[0] > 60) state.sim.evtWindow.shift();
    if (state.sim.tick % 4 === 0) {
      state.sim.history.push(state.sim.evtWindow.length);
      if (state.sim.history.length > 36) state.sim.history.shift();
    }
  }

  /* ---------- weather ---------- */
  function weatherStep(dt) {
    const W = state.weather;
    if (!reduceMotion) {
      if (W.dur > 0) {
        W.dur -= dt;
        if (W.dur <= 0) { W.target = 0; W.next = rand(50, 100); onTicker('Skies clearing over the district'); }
      } else {
        W.next -= dt;
        if (W.next <= 0) { W.target = 1; W.dur = rand(24, 40); onTicker('◆ RAIN moving in — streets going glossy'); }
      }
    }
    W.v += (W.target - W.v) * Math.min(1, dt / 2.5);
    if (world.floorMat) {
      world.floorMat.roughness = 0.65 - 0.42 * W.v;
      world.floorMat.metalness = 0.15 + 0.45 * W.v;
    }
    for (const r of world.reflectors) r.visible = W.v > 0.18;
    audio.rainLevel(W.v);
  }

  /* ---------- renovation ---------- */
  function renoStep(dt) {
    const R = world.renoRefs, st = state.reno;
    if (!R || st.stage >= 99) return;
    st.t += dt;
    if (st.stage === 0) {
      if (st.t > 24) { st.stage = 1; st.t = 0; onTicker('Scaffolding up at the FOR LEASE unit'); }
    } else if (st.stage === 1) {
      const k = Math.min(1, st.t / 6);
      R.scafMat.opacity = 0.5 * k;
      R.scaf.scale.y = Math.max(0.001, k);
      if (st.t > 18) { st.stage = 2; st.t = 0; }
    } else if (st.stage === 2) {
      const k = Math.min(1, st.t / 3.4);
      R.scafMat.opacity = 0.5 * (1 - k);
      R.scaf.scale.y = Math.max(0.001, 1 - k * 0.9);
      const lit = Math.min(5, Math.floor(k * 6));
      if (lit !== st.boot) {
        st.boot = lit;
        R.sign.map = world.signTexture('TACOS', R.accent, { perLetter: lit + 1 });
        R.sign.map.needsUpdate = true;
      }
      R.edge.opacity = 0.18 + 0.77 * k;
      R.front.opacity = 0.92 * k;
      R.doorMat.opacity = 0.06 + 0.5 * k;
      R.awnEdge.opacity = 0.1 + 0.9 * k;
      if (st.t > 4) {
        st.stage = 99;
        R.scaf.visible = false;
        R.sign.map = world.signTexture('TACOS', R.accent);
        R.sign.map.needsUpdate = true;
        R.signRec.dead = false;
        R.bodyMat.color.set('#2e1c56');
        st.open = true;
        onTicker('◆ TACOS IS OPEN — first orders rolling in');
        economyEvent(5, null, true);
      }
    }
  }
  if (reduceMotion && world.renoRefs) {
    const R = world.renoRefs;
    R.edge.opacity = 0.95; R.front.opacity = 0.92; R.doorMat.opacity = 0.55; R.awnEdge.opacity = 1;
    R.sign.map = world.signTexture('TACOS', R.accent);
    R.signRec.dead = false;
    R.scaf.visible = false;
    state.reno.stage = 99;
    state.reno.open = true;
  }

  /* ---------- dying Z ---------- */
  let pizzaFull = null, pizzaDying = null;
  const dz = { t: rand(8, 16), busy: 0 };
  function dyingZStep(dt) {
    if (reduceMotion || !world.signMats[0]) return;
    if (!pizzaFull || world.signMats[0].mat.map !== pizzaFull && dz.busy <= 0) {
      pizzaFull = world.signMats[0].mat.map;
      pizzaDying = world.signTexture('PIZ A', '#ff6a4d');
    }
    if (dz.busy > 0) {
      dz.busy -= dt;
      world.signMats[0].mat.map = Math.random() < 0.5 ? pizzaDying : pizzaFull;
      if (dz.busy <= 0) world.signMats[0].mat.map = pizzaFull;
    } else {
      dz.t -= dt;
      if (dz.t <= 0) { dz.t = rand(9, 20); dz.busy = rand(0.4, 0.8); }
    }
  }

  /* ---------- rain lines ---------- */
  let rainLines = null;
  {
    const N = 240;
    const pos = new Float32Array(N * 6);
    for (let i = 0; i < N; i++) {
      const x = rand(-13, 13), y = rand(0, 12), z = rand(-9, 9);
      pos[i * 6] = x; pos[i * 6 + 1] = y; pos[i * 6 + 2] = z;
      pos[i * 6 + 3] = x + 0.06; pos[i * 6 + 4] = y - 0.55; pos[i * 6 + 5] = z;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    rainLines = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: '#9ad4ff', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    rainLines.visible = false;
    G.add(rainLines);
  }
  function rainStep(dt) {
    const w = state.weather.v;
    rainLines.visible = w > 0.02 && !reduceMotion;
    rainLines.material.opacity = 0.3 * w;
    if (!rainLines.visible) return;
    const p = rainLines.geometry.attributes.position;
    for (let i = 0; i < p.count / 2; i++) {
      let y = p.getY(i * 2) - dt * 16;
      if (y < 0) y += 12;
      p.setY(i * 2, y);
      p.setY(i * 2 + 1, y - 0.55);
    }
    p.needsUpdate = true;
  }

  /* ---------- steam ---------- */
  function steamStep(dt) {
    for (const p of world.steamPuffs) {
      p.t += dt;
      if (p.t > p.dur) { p.t = 0; p.dur = rand(2.8, 4.2); }
      const k = p.t / p.dur;
      p.sp.position.set(p.ox + Math.sin(p.t * 2.2) * 0.08 + k * 0.22, p.oy + k * 1.3, p.oz);
      p.sp.scale.setScalar(0.26 + k * 0.9);
      p.sp.material.opacity = Math.sin(Math.PI * k) * 0.16;
    }
  }

  /* ---------- windows keyed to time + biz ---------- */
  const cWarmOn = new THREE.Color('#ffd9a0');
  const cCoolOn = new THREE.Color('#cfe2ff');
  const cOff = new THREE.Color('#141031');
  let winAcc = 0;
  function windowsStep(dt, force) {
    winAcc += dt;
    if (winAcc < 0.6 && !force) return;
    winAcc = 0;
    const ph = phaseName(state.dayT);
    const ratio = ph === 'DAY' ? ART.windowLitRatio.day : ph === 'NIGHT' ? ART.windowLitRatio.night : ph === 'DAWN' ? ART.windowLitRatio.dawn : ART.windowLitRatio.golden;
    const im = world.windowsIM;
    let changed = 0;
    for (let n = 0; n < 26; n++) {
      const w = world.windows[Math.floor(rng() * world.windows.length)];
      const target = rng() < ratio * (w.dark ? 0.25 : 1);
      if (target !== w.lit) {
        w.lit = target;
        im.setColorAt(w.i, w.lit ? (w.warm ? cWarmOn : cCoolOn) : cOff);
        changed++;
      }
    }
    if (force) {
      for (const w of world.windows) {
        w.lit = rng() < ratio * (w.dark ? 0.25 : 1);
        im.setColorAt(w.i, w.lit ? (w.warm ? cWarmOn : cCoolOn) : cOff);
      }
      changed = 1;
    }
    if (changed) im.instanceColor.needsUpdate = true;
  }
  windowsStep(0, true);

  /* ---------- audio (synthesized, opt-in) ---------- */
  const audio = (() => {
    let ctx = null, master = null, rainGain = null, padGain = null, lastDing = 0, on = false;
    function build() {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = 0.16; master.connect(ctx.destination);
      padGain = ctx.createGain(); padGain.gain.value = 0.5; padGain.connect(master);
      const filt = ctx.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 700; filt.Q.value = 0.7;
      filt.connect(padGain);
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.06;
      const lfoG = ctx.createGain(); lfoG.gain.value = 320;
      lfo.connect(lfoG); lfoG.connect(filt.frequency); lfo.start();
      const chords = [[110, 130.8, 164.8], [98, 123.5, 146.8], [87.3, 110, 130.8], [98, 116.5, 146.8]];
      let ci = 0;
      const oscs = chords[0].map((f) => {
        const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = rand(-6, 6);
        const g = ctx.createGain(); g.gain.value = 0.05;
        o.connect(g); g.connect(filt); o.start();
        return o;
      });
      setInterval(() => {
        ci = (ci + 1) % chords.length;
        oscs.forEach((o, i) => o.frequency.linearRampToValueAtTime(chords[ci][i], ctx.currentTime + 2.5));
      }, 8000);
      const len = ctx.sampleRate * 2;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
      const noise = ctx.createBufferSource(); noise.buffer = buf; noise.loop = true;
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2400; bp.Q.value = 0.4;
      rainGain = ctx.createGain(); rainGain.gain.value = 0;
      noise.connect(bp); bp.connect(rainGain); rainGain.connect(master);
      noise.start();
    }
    return {
      get on() { return on; },
      toggle() {
        if (!ctx) build();
        on = !on;
        if (ctx.state === 'suspended') ctx.resume();
        master.gain.linearRampToValueAtTime(on ? 0.16 : 0, ctx.currentTime + 0.4);
        return on;
      },
      rainLevel(v) { if (rainGain && on) rainGain.gain.setTargetAtTime(v * 0.5, ctx.currentTime, 0.5); },
      ding() {
        if (!ctx || !on) return;
        const now = ctx.currentTime;
        if (now - lastDing < 0.18) return;
        lastDing = now;
        const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = pick([880, 988, 1174]);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(0.08, now + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
        o.connect(g); g.connect(master);
        o.start(now); o.stop(now + 0.4);
      },
    };
  })();
  state.audio = audio;

  /* ---------- master update ---------- */
  function update(dt) {
    state.clockTime += dt;
    if (!reduceMotion && !state.timeHeld) state.dayT = (state.dayT + dt / DAY_LEN) % 1;
    state.phase = phaseName(state.dayT);
    signalStep(dt);
    simStep(dt);
    renoStep(dt);
    dyingZStep(dt);
    weatherStep(dt);
    rainStep(dt);
    steamStep(dt);
    trainStep(dt);
    beamStep(dt);
    windowsStep(dt, false);
    if (!reduceMotion) {
      for (const a of cars) carStep(a, dt);
      for (const cz of state.citizens) citizenStep(cz, dt);
      if (courier) courierStep(courier, dt);
    }
    for (const p of PULSES) pulseStep(p, dt);
  }

  return { state, update, sampleDay, dayClock, phaseName, economyEvent, audio, dispatchCourier };
}
