// Classes 5 and 6: turning a 5 V thought into a 230 V action, and the board
// that does it without either side reaching the other.

import { register } from './anim-core.js';
import {
  figure, canvas, slider, toggle, choice, label, labelWrap, box, line, palette,
  alpha, fitter, compare, chain, plot, role, eng, sig,
  arrow, resistorSym, supplySym, groundSym, readoutChip, node,
} from './anim-kit.js';

// ---------------------------------------------------------------------------
// Inside a relay
// ---------------------------------------------------------------------------

register('relay-inside', (host) => {
  let energised = false;
  let loadKind = 'res';

  const { controls, stage, setNote } = figure(host, {
    title: 'Inside a relay, including the arc',
    sub: 'A coil pulls a contact closed. Switch it with three different loads and watch what happens on break.',
    note: '',
  });

  const KINDS = {
    res: ['Resistive, 10 A', 'A heater or a filament at steady state. The rating on the label assumes this.'],
    ind: ['Inductive, 10 A', 'A motor, transformer or solenoid. The collapsing field sustains an arc on break, so derate to about a third.'],
    dc: ['DC, 10 A at 30 V', 'No zero crossing to extinguish the arc, so it keeps burning. A relay rated 10 A at 250 V AC may be rated 0.5 A at 30 V DC.'],
  };

  const upd = () => {
    setNote(loadKind === 'res'
      ? 'A resistive load breaks cleanly at the AC zero crossing. <b>This is the only condition the number on the relay label actually describes.</b>'
      : loadKind === 'ind'
        ? 'An inductive load keeps pushing current after the contacts part, so an arc bridges the gap until the field has collapsed. <b>Every arc removes a little metal, which is why an inductive load derates a relay to roughly a third of its resistive rating.</b>'
        : 'Direct current has no zero crossing, so once an arc strikes there is nothing to put it out except the gap growing. <b>This is why a relay rated 10 A at 250 V AC can be rated half an amp at 30 V DC, and why people who have only read the big number destroy relays.</b>');
    cv.once();
  };

  controls.append(toggle('Energise the coil', { value: false, on: (v) => { energised = v; upd(); } }).node);
  controls.append(choice('Load', Object.entries(KINDS).map(([k, v]) => [k, v[0]]), {
    value: 'res', on: (v) => { loadKind = v; upd(); },
  }).node);

  const cv = canvas(stage, {
    height: 270,
    draw(g, w, h, t) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const cx = pad + 60, cy = 68;

      // The coil and its core.
      box(g, cx - 34, cy - 26, 30, 52, { fill: alpha(R.energy, energised ? 0.3 : 0.08), stroke: p.line, r: 4 });
      g.strokeStyle = energised ? R.energy : p.muted;
      g.lineWidth = 2;
      for (let k = 0; k < 5; k++) {
        g.beginPath();
        g.arc(cx - 19, cy - 20 + k * 10, 6, -Math.PI / 2, Math.PI / 2);
        g.stroke();
      }
      label(g, 'coil', cx - 19, cy + 40, { color: energised ? R.energy : p.muted, size: 10, align: 'center' });
      if (energised) {
        // Field lines, so the mechanism is visible rather than implied.
        for (let k = 1; k <= 3; k++) {
          g.strokeStyle = alpha(R.energy, 0.35 / k);
          g.lineWidth = 1.5;
          g.beginPath();
          g.ellipse(cx - 19, cy, 20 + k * 9, 32 + k * 7, 0, 0, Math.PI * 2);
          g.stroke();
        }
      }

      // The armature, pulled down when energised. Its free end IS the moving
      // contact, so the picture shows the mechanism rather than implying it.
      const pivotX = cx + 4, pivotY = cy - 30;
      const armLen = 66;
      const angle = energised ? 0.30 : 0.52;
      const ex = pivotX + Math.cos(angle) * armLen;
      const ey = pivotY + Math.sin(angle) * armLen;
      line(g, pivotX, pivotY, ex, ey, { color: p.ink, lw: 3.5 });
      g.fillStyle = p.ink2;
      g.beginPath();
      g.arc(pivotX, pivotY, 3.5, 0, Math.PI * 2);
      g.fill();
      label(g, 'armature', pivotX + 8, pivotY - 12, { color: p.muted, size: 9.5 });

      // The moving contact on the end of the armature, and the fixed one below
      // it. The gap between them is where the arc lives.
      const fixedX = pivotX + Math.cos(0.30) * armLen;
      const fixedY = pivotY + Math.sin(0.30) * armLen;
      g.fillStyle = energised ? R.safe : p.muted;
      g.beginPath();
      g.arc(ex, ey, 5, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = p.muted;
      g.beginPath();
      g.arc(fixedX, fixedY + 1, 5, 0, Math.PI * 2);
      g.fill();
      line(g, fixedX, fixedY + 6, fixedX, cy + 44, { color: p.muted, lw: 2 });
      line(g, fixedX, cy + 44, cx + 100, cy + 44, { color: p.muted, lw: 2 });

      // The arc appears on break for the loads that sustain one.
      const arcing = !energised && loadKind !== 'res';
      if (arcing) {
        const flick = 0.5 + 0.5 * Math.sin(t * 26);
        g.strokeStyle = alpha(R.fault, 0.5 + flick * 0.5);
        g.lineWidth = 2 + flick * 1.5;
        g.beginPath();
        g.moveTo(ex, ey + 3);
        const steps = 4;
        for (let k = 1; k <= steps; k++) {
          const u = k / steps;
          g.lineTo(ex + (fixedX - ex) * u + (Math.random() - 0.5) * 5,
            ey + (fixedY - ey) * u + (Math.random() - 0.5) * 3);
        }
        g.stroke();
        label(g, 'arc', ex + 16, (ey + fixedY) / 2 - 12, { color: R.fault, size: 10, weight: 700 });
      }
      label(g, energised ? 'closed' : 'open', fixedX + 4, cy + 58, {
        color: energised ? R.safe : p.muted, size: 10,
      });

      // The isolation barrier, which is the relay's real selling point.
      const bx = cx + 112;
      line(g, bx, 18, bx, 138, { color: alpha(R.safe, 0.6), lw: 2, dash: [6, 5] });
      label(g, 'galvanic isolation', bx + 6, 26, { color: R.safe, size: 9.5, weight: 600, max: w - bx - 20 });
      label(g, 'several kV', bx + 6, 40, { color: p.muted, size: 9 });

      const rx = Math.max(bx + 20, w - 130);
      if (w - rx > 100) {
        readoutChip(g, rx, 56, 'CONTACT WEAR', arcing ? 'eroding' : energised ? 'none' : 'none', {
          color: arcing ? R.fault : R.safe, p, w: Math.min(118, w - rx - 8),
        });
        readoutChip(g, rx, 98, 'DERATE TO', loadKind === 'res' ? '10 A' : loadKind === 'ind' ? '3 A' : '0.5 A', {
          color: loadKind === 'res' ? R.safe : R.fault, p, w: Math.min(118, w - rx - 8),
        });
      }

      labelWrap(g, KINDS[loadKind][1], pad, 156, { color: p.ink2, size: 11.5, max: w - pad * 2, maxLines: 3 });
      labelWrap(g, 'A relay gives you real isolation and near-zero resistance while closed. It costs you 5 to 15 ms of delay, an audible click, and a contact that wears.',
        pad, 200, { color: p.muted, size: 11, max: w - pad * 2, maxLines: 3 });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// Flyback, on the driver rather than the coil
// ---------------------------------------------------------------------------

register('flyback', (host) => {
  let fitted = false;
  let ops = 0;
  let dead = false;
  let lastFire = -10;

  const { controls, stage, setNote } = figure(host, {
    title: 'What the spike does to the transistor',
    sub: 'Switch the coil repeatedly. Without the diode, count how many operations it survives.',
    note: '',
  });

  const upd = () => {
    setNote(fitted
      ? 'With the diode fitted, the collapsing current circulates through it and the transistor sees about a volt above the supply. <b>It will do this for the life of the equipment.</b>'
      : 'Every operation puts hundreds of volts across a transistor rated for sixty. <b>Sometimes it dies on the first operation and sometimes on the two hundredth, and the delayed failures are worse, because they happen in performance rather than on the bench.</b>');
    ops = 0; dead = false;
    cv.once();
  };

  controls.append(toggle('Flyback diode fitted', { value: false, on: (v) => { fitted = v; upd(); } }).node);
  const b = document.createElement('button');
  b.className = 'ac ac-btn';
  b.textContent = 'Operate';
  b.addEventListener('click', () => {
    if (dead) return;
    ops++;
    lastFire = cv.t;
    // Without protection, each operation has a real chance of killing it. The
    // point is not the number, it is that the number is not one.
    if (!fitted && Math.random() < 0.14) dead = true;
    cv.once();
  });
  controls.append(b);

  const cv = canvas(stage, {
    height: 250,
    draw(g, w, h, t) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const since = t - lastFire;
      const peak = fitted ? 12.7 : 340;
      const spike = since >= 0 && since < 1.2 ? peak * Math.exp(-since * 10) * Math.abs(Math.cos(since * 40)) : 0;

      const x = pad + 46, T = 30, bh = 84;
      supplySym(g, x - 30, T + bh / 2, 22, R.energy, 2);
      label(g, '12 V', x - 30, T + bh / 2 + 22, { color: R.energy, size: 9.5, align: 'center' });
      line(g, x - 30, T + bh / 2 - 11, x - 30, T, { color: p.muted, lw: 1.5 });
      line(g, x - 30, T, x + 60, T, { color: p.muted, lw: 1.5 });
      line(g, x - 30, T + bh / 2 + 11, x - 30, T + bh, { color: p.muted, lw: 1.5 });
      line(g, x - 30, T + bh, x + 60, T + bh, { color: p.muted, lw: 1.5 });

      g.strokeStyle = p.ink2;
      g.lineWidth = 2;
      g.beginPath();
      for (let k = 0; k < 3; k++) g.arc(x + 12 + k * 14, T, 7, Math.PI, 0, false);
      g.stroke();
      label(g, 'coil', x + 26, T - 18, { color: p.muted, size: 9.5, align: 'center' });
      line(g, x + 47, T, x + 60, T, { color: p.muted, lw: 1.5 });

      // The transistor.
      const tx = x + 60, ty = T + bh * 0.62;
      line(g, tx, T, tx, ty - 14, { color: p.muted, lw: 1.5 });
      line(g, tx, ty + 14, tx, T + bh, { color: p.muted, lw: 1.5 });
      box(g, tx - 16, ty - 14, 32, 28, {
        fill: dead ? alpha(R.fault, 0.3) : p.raised, stroke: dead ? R.fault : p.line, r: 4, lw: dead ? 2 : 1,
      });
      label(g, dead ? '✕' : 'Q1', tx, ty, {
        color: dead ? R.fault : p.ink2, size: dead ? 15 : 11, align: 'center', weight: 700,
      });
      label(g, 'rated 60 V', tx, ty + 26, { color: p.muted, size: 9.5, align: 'center' });

      if (fitted) {
        line(g, x + 4, T, x + 4, T - 26, { color: R.safe, lw: 2 });
        line(g, x + 4, T - 26, tx, T - 26, { color: R.safe, lw: 2 });
        line(g, tx, T - 26, tx, T, { color: R.safe, lw: 2 });
        const dx = (x + 4 + tx) / 2;
        g.strokeStyle = R.safe;
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(dx - 7, T - 32); g.lineTo(dx - 7, T - 20); g.lineTo(dx + 6, T - 26);
        g.closePath();
        g.stroke();
        line(g, dx + 6, T - 32, dx + 6, T - 20, { color: R.safe, lw: 2 });
      }

      // Peak reading and the count that makes the point.
      const rx = Math.max(tx + 60, w - 130);
      if (w - rx > 100) {
        readoutChip(g, rx, T - 6, 'PEAK ACROSS Q1', fitted ? '12.7 V' : '340 V', {
          color: fitted ? R.safe : R.fault, p, w: Math.min(118, w - rx - 8),
        });
        readoutChip(g, rx, T + 38, 'OPERATIONS', dead ? `${ops} — dead` : String(ops), {
          color: dead ? R.fault : p.ink, p, w: Math.min(118, w - rx - 8),
        });
      }

      const gL = pad, gT = 140, gW = w - pad * 2, gH = 62;
      box(g, gL, gT, gW, gH, { fill: alpha(p.ground, 0.5), stroke: p.line, r: 6 });
      const scale = fitted ? 40 : 400;
      const Y = (v) => gT + gH - 8 - (Math.min(v, scale) / scale) * (gH - 16);
      line(g, gL, Y(60), gL + gW, Y(60), { color: alpha(R.fault, 0.6), lw: 1, dash: [4, 3] });
      label(g, "Q1's 60 V limit", gL + 4, Y(60) - 8, { color: R.fault, size: 9 });
      g.strokeStyle = fitted ? R.safe : R.fault;
      g.lineWidth = 2;
      g.beginPath();
      for (let k = 0; k <= 200; k++) {
        const dt2 = since - (1.5 - (k / 200) * 1.5);
        const sp = dt2 >= 0 && dt2 < 1.2 ? peak * Math.exp(-dt2 * 10) * Math.abs(Math.cos(dt2 * 40)) : 0;
        const v = dt2 < 0 ? 12 : 12 + sp;
        const px = gL + (k / 200) * gW;
        k ? g.lineTo(px, Y(v)) : g.moveTo(px, Y(v));
      }
      g.stroke();
      label(g, dead ? 'Q1 has failed short. The coil is now permanently energised.' : 'Press Operate and watch the trace.',
        gL + 6, gT + 12, { color: dead ? R.fault : p.muted, size: 10.5, max: gW - 12, weight: dead ? 700 : 500 });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// MOSFET gate drive
// ---------------------------------------------------------------------------

register('mosfet-gate', (host) => {
  let vgs = 5;
  let logic = true;
  const Iload = 5;

  const { controls, stage, setNote, challenge } = figure(host, {
    title: 'The gate voltage, and the difference between on and nearly on',
    sub: 'A logic-level part and a standard part, driven from the same pin.',
    note: '',
  });

  // On-resistance falls sharply once the gate is well past threshold, and is
  // enormous just above it. That shape is the entire lesson.
  const rds = () => {
    const vth = logic ? 1.6 : 3.6;
    const full = logic ? 4.5 : 10;
    if (vgs <= vth) return 1e6;
    const k = Math.min(1, (vgs - vth) / (full - vth));
    return 0.022 + 6 * Math.exp(-k * 6.5);
  };

  const upd = () => {
    const r = rds();
    const P = Iload * Iload * r;
    setNote(r > 1e5
      ? 'Below the threshold the MOSFET is off. Nothing flows and nothing heats.'
      : P < 1.5
        ? `Fully on: ${eng(r, 'Ω')} of on-resistance, so ${eng(P, 'W')} at 5 A. <b>Cool to the touch, which is the only acceptable outcome for a switching device.</b>`
        : `Partly on: ${eng(r, 'Ω')} of on-resistance means ${eng(P, 'W')} at 5 A. <b>Half on is the worst possible state, because the device has both voltage across it and current through it at the same time, and that product is heat.</b>`);
    cv.once();
  };

  controls.append(choice('Part', [['l', 'Logic-level, IRLZ44N'], ['s', 'Standard, IRF540N']], {
    value: 'l', on: (v) => { logic = v === 'l'; upd(); },
  }).node);
  controls.append(slider('Gate voltage', {
    min: 0, max: 12, step: 0.1, value: 5, fmt: (v) => `${v.toFixed(1)} V`,
    on: (v) => { vgs = v; upd(); },
  }).node);

  challenge('Drive the standard part from a 5 V pin and find out what it dissipates.',
    () => !logic && Math.abs(vgs - 5) < 0.3);

  const cv = canvas(stage, {
    height: 270,
    draw(g, w, h, t) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const r = rds();
      const P = r > 1e5 ? 0 : Iload * Iload * r;
      const on = r < 1e5;
      const hot = Math.min(1, P / 40);

      // The device, glowing with its own dissipation.
      const dx = pad + 70, dy = 62;
      if (hot > 0.02) {
        g.fillStyle = alpha(R.fault, 0.1 + hot * 0.6);
        g.beginPath();
        g.arc(dx, dy, 26 + hot * 26, 0, Math.PI * 2);
        g.fill();
      }
      box(g, dx - 22, dy - 26, 44, 52, {
        fill: p.raised, stroke: P > 5 ? R.fault : on ? R.safe : p.line, r: 5, lw: P > 5 ? 2 : 1,
      });
      label(g, 'D', dx, dy - 34, { color: p.muted, size: 9.5, align: 'center' });
      label(g, 'S', dx, dy + 36, { color: p.muted, size: 9.5, align: 'center' });
      label(g, 'G', dx - 34, dy, { color: p.muted, size: 9.5, align: 'center' });
      line(g, dx - 30, dy, dx - 22, dy, { color: R.signal, lw: 2 });
      line(g, dx, dy - 40, dx, dy - 26, { color: p.muted, lw: 2 });
      line(g, dx, dy + 26, dx, dy + 40, { color: p.muted, lw: 2 });
      label(g, logic ? 'IRLZ44N' : 'IRF540N', dx, dy + 52, { color: p.ink2, size: 10, align: 'center' });

      // Current flowing, or not.
      if (on && P < 60) {
        for (let k = 0; k < 5; k++) {
          const u = ((t * 0.9 + k / 5) % 1);
          g.fillStyle = R.energy;
          g.beginPath();
          g.arc(dx, dy - 40 + u * 80, 3, 0, Math.PI * 2);
          g.fill();
        }
      }

      const rx = Math.max(dx + 70, w - 132);
      if (w - rx > 100) {
        const cw = Math.min(120, w - rx - 8);
        readoutChip(g, rx, 22, 'R_DS(on)', on ? eng(r, 'Ω') : 'off', { color: r < 0.1 ? R.safe : R.fault, p, w: cw });
        readoutChip(g, rx, 64, 'DISSIPATION at 5 A', on ? eng(P, 'W') : '0 W', {
          color: P > 5 ? R.fault : P > 1.5 ? R.energy : R.safe, p, w: cw,
        });
        readoutChip(g, rx, 106, 'DEVICE', P > 20 ? 'destroyed in seconds' : P > 5 ? 'too hot' : on ? 'cool' : 'off', {
          color: P > 5 ? R.fault : R.safe, p, w: cw,
        });
      }

      // The threshold bar, showing where 3.3 V and 5 V pins actually land.
      const bT = 152, bL = pad, bW = w - pad * 2, bH = 20;
      box(g, bL, bT, bW, bH, { fill: p.raised, stroke: p.line, r: 5 });
      const X = (v) => bL + (v / 12) * bW;
      const vth = logic ? 1.6 : 3.6;
      const full = logic ? 4.5 : 10;
      g.fillStyle = alpha(R.fault, 0.3);
      g.fillRect(X(vth), bT + 1, X(full) - X(vth), bH - 2);
      g.fillStyle = alpha(R.safe, 0.3);
      g.fillRect(X(full), bT + 1, bW + bL - X(full) - 1, bH - 2);
      label(g, 'off', X(vth / 2), bT + bH / 2, { color: p.muted, size: 9.5, align: 'center' });
      label(g, 'partly on — this is the dangerous region', (X(vth) + X(full)) / 2, bT + bH / 2, {
        color: R.fault, size: 9.5, align: 'center', max: X(full) - X(vth) - 4,
      });
      label(g, 'fully on', (X(full) + bL + bW) / 2, bT + bH / 2, { color: R.safe, size: 9.5, align: 'center' });
      for (const [v, n] of [[3.3, '3.3 V pin'], [5, '5 V pin']]) {
        line(g, X(v), bT - 8, X(v), bT + bH + 4, { color: p.ink, lw: 1.5, dash: [3, 3] });
        label(g, n, X(v), bT - 14, { color: p.ink, size: 9, align: 'center' });
      }
      const gx = X(vgs);
      g.fillStyle = R.signal;
      g.beginPath();
      g.moveTo(gx, bT + bH + 4); g.lineTo(gx - 5, bT + bH + 14); g.lineTo(gx + 5, bT + bH + 14);
      g.closePath();
      g.fill();
      label(g, `V_GS ${vgs.toFixed(1)} V`, gx, bT + bH + 24, {
        color: R.signal, size: 10, align: 'center', weight: 700,
      });

      label(g, `P = I² × R_DS(on) = 5² × ${sig(r)} = ${on ? eng(P, 'W') : '0 W'}`, pad, bT + bH + 46, {
        color: p.ink2, size: 11.5, mono: true, max: bW,
      });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// Switching against varying
// ---------------------------------------------------------------------------

register('pwm-heat', (host) => {
  let duty = 50;
  let method = 'pwm';
  const Vs = 12, Rl = 4.8;   // a 30 W lamp on 12 V

  const { controls, stage, setNote, challenge } = figure(host, {
    title: 'Why nobody dims with a resistor',
    sub: 'Half brightness two ways. One of them heats a component with the power it removed.',
    note: '',
  });

  const numbers = () => {
    const full = (Vs * Vs) / Rl;
    if (method === 'pwm') {
      const loadP = full * (duty / 100);
      return { loadP, devP: 0.02 * (duty / 100), total: loadP + 0.02 };
    }
    // A series resistance that delivers the same average power to the load.
    const frac = duty / 100;
    const Vload = Vs * Math.sqrt(frac);
    const I = Vload / Rl;
    return { loadP: Vload * I, devP: (Vs - Vload) * I, total: Vs * I };
  };

  const upd = () => {
    const n = numbers();
    setNote(method === 'pwm'
      ? `Switched fully on and fully off. When on there is almost no voltage across the switch; when off there is almost no current through it. Power is voltage times current, so both states dissipate almost nothing: ${eng(n.devP, 'W')} in the device. <b>All the loss is in the brief transitions, which is why every modern dimmer and motor drive works this way.</b>`
      : `A series resistance delivers ${eng(n.loadP, 'W')} to the lamp and turns ${eng(n.devP, 'W')} into heat in itself. <b>The energy you removed from the lamp did not go away, it went into a component that now needs a heatsink and a fan, and that is the entire argument for switching.</b>`);
    cv.once();
  };

  controls.append(choice('Method', [['pwm', 'Switch it (PWM)'], ['res', 'Vary a resistance']], {
    value: 'pwm', on: (v) => { method = v; upd(); },
  }).node);
  controls.append(slider('Brightness', {
    min: 5, max: 100, step: 5, value: 50, fmt: (v) => `${v}%`,
    on: (v) => { duty = v; upd(); },
  }).node);

  challenge('Find the setting where the series resistor wastes the most power.',
    () => method === 'res' && duty >= 20 && duty <= 30);

  const cv = canvas(stage, {
    height: 260,
    draw(g, w, h, t) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const n = numbers();
      const gL = pad, gT = 24, gW = Math.max(140, w - pad * 2 - 140), gH = 84;

      // The waveform across the device, which is where the two methods differ.
      box(g, gL, gT, gW, gH, { fill: alpha(p.ground, 0.5), stroke: p.line, r: 6 });
      g.strokeStyle = R.energy;
      g.lineWidth = 2;
      g.beginPath();
      for (let k = 0; k <= 240; k++) {
        const u = k / 240;
        const x = gL + u * gW;
        let v;
        if (method === 'pwm') {
          const ph = (u * 5 - t * 0.6) % 1;
          v = ph < duty / 100 ? 1 : 0;
        } else {
          v = Math.sqrt(duty / 100);
        }
        const y = gT + gH - 8 - v * (gH - 16);
        k ? g.lineTo(x, y) : g.moveTo(x, y);
      }
      g.stroke();
      label(g, method === 'pwm' ? 'voltage at the lamp: fully on or fully off' : 'voltage at the lamp: held at a fraction',
        gL + 6, gT + 12, { color: p.muted, size: 10, max: gW - 12 });

      // Where the power goes, as two stacked bars.
      const bT = gT + gH + 24;
      const total = n.total;
      const bw = gW;
      box(g, gL, bT, bw, 26, { fill: p.raised, stroke: p.line, r: 5 });
      const loadW = (n.loadP / total) * (bw - 2);
      g.fillStyle = alpha(R.safe, 0.55);
      g.fillRect(gL + 1, bT + 1, loadW, 24);
      g.fillStyle = alpha(R.fault, 0.6);
      g.fillRect(gL + 1 + loadW, bT + 1, bw - 2 - loadW, 24);
      label(g, `lamp ${eng(n.loadP, 'W')}`, gL + 8, bT + 13, { color: p.ink, size: 10.5, weight: 700, max: loadW - 10 });
      if (bw - loadW > 70) {
        label(g, `wasted ${eng(n.devP, 'W')}`, gL + bw - 8, bT + 13, {
          color: p.ink, size: 10.5, weight: 700, align: 'right', max: bw - loadW - 10,
        });
      }
      label(g, 'where the supply power goes', gL, bT + 40, { color: p.muted, size: 10 });

      // The device, with a heatsink when it needs one.
      const rx = Math.max(gL + gW + 14, w - 128);
      if (w - rx > 100) {
        const cw = Math.min(116, w - rx - 8);
        readoutChip(g, rx, gT, 'IN THE DEVICE', eng(n.devP, 'W'), {
          color: n.devP > 2 ? R.fault : R.safe, p, w: cw,
        });
        readoutChip(g, rx, gT + 42, 'NEEDS', n.devP > 5 ? 'heatsink and fan' : n.devP > 1 ? 'a heatsink' : 'nothing', {
          color: n.devP > 1 ? R.fault : R.safe, p, w: cw,
        });
        readoutChip(g, rx, gT + 84, 'EFFICIENCY', `${Math.round((n.loadP / total) * 100)} %`, {
          color: n.loadP / total > 0.9 ? R.safe : R.fault, p, w: cw,
        });
      }

      labelWrap(g, method === 'pwm'
        ? 'A fully-on switch has almost no voltage across it and a fully-off switch has almost no current through it. Power is the product of the two, so both states are nearly free.'
        : 'The resistance drops the voltage the lamp does not get, and carries the same current. Voltage times current is heat, and it appears in the resistor.',
      pad, bT + 60, { color: p.ink2, size: 11.5, max: w - pad * 2, maxLines: 3 });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// The optocoupler, and how isolation is defeated
// ---------------------------------------------------------------------------

register('opto', (host) => {
  let signal = false;
  let sharedGround = false;

  const { controls, stage, setNote, challenge } = figure(host, {
    title: 'Isolation, and the single wire that removes it',
    sub: 'An optocoupler with no electrical path across it. Then connect the two grounds “for convenience”.',
    note: '',
  });

  const upd = () => {
    setNote(sharedGround
      ? 'The optocoupler is still working perfectly. The isolation is gone, because isolation is a property of the whole system rather than of one component. <b>Two isolated halves joined by a shared ground for convenience are not isolated, and this happens constantly in home-built systems.</b>'
      : 'Light crosses a millimetre of transparent plastic and nothing else does. A fault on the load side cannot put voltage onto the control side, which is what lets a 5 V microcontroller safely tell a 230 V circuit what to do. <b>Isolation voltages of 2.5 to 5 kV are routine.</b>');
    cv.once();
  };

  controls.append(toggle('Control signal on', { value: false, on: (v) => { signal = v; upd(); } }).node);
  controls.append(toggle('Join the two grounds', { value: false, on: (v) => { sharedGround = v; upd(); } }).node);

  challenge('Defeat the isolation without touching the optocoupler.', () => sharedGround);

  const cv = canvas(stage, {
    height: 270,
    draw(g, w, h, t) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const midX = w / 2;
      const T = 26;

      // The barrier.
      const isolated = !sharedGround;
      line(g, midX, T - 8, midX, 156, {
        color: isolated ? alpha(R.safe, 0.7) : alpha(R.fault, 0.7), lw: 2, dash: [6, 5],
      });
      label(g, isolated ? 'ISOLATION BARRIER' : 'BARRIER DEFEATED', midX, T - 16, {
        color: isolated ? R.safe : R.fault, size: 10, align: 'center', weight: 700, max: w - 20,
      });

      label(g, 'CONTROL SIDE  5 V', pad, T + 4, { color: R.signal, size: 10, weight: 700 });
      label(g, 'LOAD SIDE  230 V', midX + 12, T + 4, { color: R.fault, size: 10, weight: 700 });

      // The LED half.
      const ly = 72;
      const lx = midX - 54;
      line(g, pad + 10, ly, lx - 12, ly, { color: R.signal, lw: 2 });
      resistorSym(g, pad + 24, ly, 34, 12, R.signal, 2);
      label(g, '220 Ω', pad + 41, ly - 16, { color: p.muted, size: 9.5, align: 'center' });
      g.strokeStyle = signal ? R.signal : p.muted;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(lx - 12, ly - 8); g.lineTo(lx + 4, ly); g.lineTo(lx - 12, ly + 8);
      g.closePath();
      g.stroke();
      line(g, lx + 4, ly - 8, lx + 4, ly + 8, { color: signal ? R.signal : p.muted, lw: 2 });

      // The light crossing the gap: the only thing that does.
      if (signal) {
        for (let k = 0; k < 3; k++) {
          const u = ((t * 1.6 + k / 3) % 1);
          g.fillStyle = alpha(R.energy, 1 - u);
          g.beginPath();
          g.arc(lx + 12 + u * 76, ly, 3 + u * 3, 0, Math.PI * 2);
          g.fill();
        }
        label(g, 'light only', midX, ly - 20, { color: R.energy, size: 9.5, align: 'center' });
      }

      // The receiving transistor and the load.
      const rx = midX + 54;
      box(g, rx - 12, ly - 16, 26, 32, {
        fill: signal ? alpha(R.fault, 0.2) : p.raised, stroke: p.line, r: 4,
      });
      line(g, rx + 14, ly, w - pad - 46, ly, { color: R.fault, lw: 2 });
      box(g, w - pad - 44, ly - 16, 44, 32, {
        fill: signal ? alpha(R.energy, 0.3) : p.raised, stroke: p.line, r: 4,
      });
      label(g, 'load', w - pad - 22, ly, { color: signal ? R.energy : p.muted, size: 10, align: 'center' });
      box(g, midX - 78, ly - 30, 156, 60, { fill: 'transparent', stroke: alpha(p.muted, 0.5), r: 6 });
      label(g, 'PC817', midX, ly + 40, { color: p.muted, size: 9.5, align: 'center' });

      // The two grounds, and the wire that ruins everything.
      const gy = 130;
      line(g, pad + 10, ly + 8, pad + 10, gy, { color: R.signal, lw: 1.5 });
      line(g, pad + 10, gy, midX - 40, gy, { color: R.signal, lw: 1.5 });
      groundSym(g, midX - 40, gy + 4, R.signal);
      line(g, w - pad - 22, ly + 16, w - pad - 22, gy, { color: R.fault, lw: 1.5 });
      line(g, w - pad - 22, gy, midX + 40, gy, { color: R.fault, lw: 1.5 });
      groundSym(g, midX + 40, gy + 4, R.fault);
      if (sharedGround) {
        line(g, midX - 40, gy, midX + 40, gy, { color: R.fault, lw: 3 });
        label(g, 'one wire', midX, gy - 12, { color: R.fault, size: 10, align: 'center', weight: 700 });
      }

      // The verdict.
      const vy = 172;
      box(g, pad, vy, w - pad * 2, 32, {
        fill: alpha(isolated ? R.safe : R.fault, 0.1),
        stroke: alpha(isolated ? R.safe : R.fault, 0.45), r: 7,
      });
      label(g, isolated
        ? 'Resistance between any control pin and any load pin: open circuit. Tested and proved.'
        : 'Resistance between control ground and load ground: zero. The component is fine; the system is not.',
      pad + 12, vy + 16, {
        color: isolated ? R.safe : R.fault, size: 11.5, weight: 600, max: w - pad * 2 - 24,
      });

      labelWrap(g, 'Isolate anywhere a control system touches mains, anywhere a control cable leaves an enclosure, and anywhere a person touches the control side. In a theatre that is nearly everywhere.',
        pad, vy + 44, { color: p.muted, size: 11, max: w - pad * 2, maxLines: 3 });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// Inrush
// ---------------------------------------------------------------------------

register('inrush', (host) => {
  let count = 1;
  let sequenced = false;
  let fireT = -10;

  const { controls, stage, setNote, challenge } = figure(host, {
    title: 'Why the breaker trips at the top of the show',
    sub: 'Switch-mode supplies energised together, then a second apart. Same equipment, different peak.',
    note: '',
  });

  const peak = () => (sequenced ? 42 : 42 * count);

  const upd = () => {
    const pk = peak();
    setNote(sequenced
      ? `Sequenced a second apart, the peaks never coincide, so the breaker only ever sees one unit's inrush: about ${Math.round(pk)} A for a few milliseconds. <b>Sequencing is the engineering answer, and it is a design decision that belongs to you rather than to the electrician.</b>`
      : count === 1
        ? 'One supply draws about 42 A for a few milliseconds while its input capacitor charges. The running current is under an amp. <b>Every LED fixture, media server and network switch in your rig does this.</b>'
        : `${count} supplies energised by the same switch at the same instant: about ${Math.round(pk)} A. <b>The breaker is not being oversensitive, it is responding to a current that genuinely flows, and fitting a bigger breaker means a fault has to get bigger before anything notices.</b>`);
    cv.once();
  };

  controls.append(slider('Fixtures on one switch', {
    min: 1, max: 12, step: 1, value: 1, fmt: (v) => String(v),
    on: (v) => { count = v; upd(); },
  }).node);
  controls.append(toggle('Sequence them, 1 s apart', { value: false, on: (v) => { sequenced = v; upd(); } }).node);
  const b = document.createElement('button');
  b.className = 'ac ac-btn';
  b.textContent = 'Switch on';
  b.addEventListener('click', () => { fireT = cv.t; });
  controls.append(b);

  const cv = canvas(stage, {
    height: 260,
    draw(g, w, h, t) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const gL = 38, gT = 26, gW = w - gL - pad, gH = 122;
      const trip = 16 * 8;   // a 16 A type B breaker's magnetic trip threshold
      const scale = Math.max(trip * 1.2, peak() * 1.15);
      const Y = (a) => gT + gH - (a / scale) * gH;

      line(g, gL, gT + gH, gL + gW, gT + gH, { color: p.muted, lw: 1.5 });
      line(g, gL, gT, gL, gT + gH, { color: p.muted, lw: 1.5 });
      for (const a of [0, 50, 100, 200, 400]) {
        if (a > scale) continue;
        const y = Y(a);
        line(g, gL - 4, y, gL, y, { color: p.muted, lw: 1 });
        label(g, `${a}`, gL - 7, y, { color: p.muted, size: 9, align: 'right', mono: true });
      }
      label(g, 'amps', gL - 7, gT - 6, { color: p.muted, size: 9.5, align: 'right' });

      line(g, gL, Y(trip), gL + gW, Y(trip), { color: R.fault, lw: 1.5, dash: [5, 4] });
      label(g, '16 A type B breaker trips here', gL + 6, Y(trip) - 9, { color: R.fault, size: 9.5, weight: 600 });

      // The current, over 6 seconds of window.
      const since = t - fireT;
      const span = 6;
      g.strokeStyle = R.energy;
      g.lineWidth = 2.2;
      g.beginPath();
      let tripped = false;
      for (let k = 0; k <= 300; k++) {
        const tt = (k / 300) * span;
        let a = 0;
        for (let u = 0; u < count; u++) {
          const start = sequenced ? u * 1.0 : 0;
          const d = tt - start;
          if (d >= 0) a += d < 0.012 ? 42 * Math.exp(-d / 0.004) : 0.7;
        }
        if (tt <= since && a >= trip) tripped = true;
        const x = gL + (k / 300) * gW;
        k ? g.lineTo(x, Y(Math.min(a, scale))) : g.moveTo(x, Y(Math.min(a, scale)));
      }
      g.stroke();
      // The playhead, so pressing the button means something.
      if (since >= 0 && since < span) {
        const px = gL + (since / span) * gW;
        line(g, px, gT, px, gT + gH, { color: alpha(p.ink, 0.5), lw: 1 });
      }
      for (let k = 0; k < 6; k++) {
        const x = gL + (k / span) * gW;
        label(g, `${k} s`, x, gT + gH + 13, { color: p.muted, size: 9, align: 'center' });
      }

      const by = gT + gH + 30;
      box(g, pad, by, w - pad * 2, 30, {
        fill: alpha(tripped ? R.fault : R.safe, 0.1),
        stroke: alpha(tripped ? R.fault : R.safe, 0.45), r: 7,
      });
      label(g, tripped
        ? `Peak ${Math.round(peak())} A — the breaker trips, and everything goes dark at the top of the show`
        : `Peak ${Math.round(peak())} A — under the trip threshold`,
      pad + 12, by + 16, {
        color: tripped ? R.fault : R.safe, size: 11.5, weight: 700, max: w - pad * 2 - 24,
      });

      labelWrap(g, 'Each supply looks like a short circuit for the first few milliseconds while its input capacitor charges. One is nothing. Forty of them on one switch is a very large momentary current.',
        pad, by + 44, { color: p.muted, size: 11, max: w - pad * 2, maxLines: 3 });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// Class 6: the driver board
// ---------------------------------------------------------------------------

register('driver-board', (host) => chain(host, {
  title: 'One channel, stage by stage',
  sub: 'Five parts in a chain. Understand it once and you understand all four channels.',
  tag: 'Stage', accent: 'signal',
  stages: [
    {
      name: 'Input pull-down',
      body: 'The control signal arrives, and a 10 kΩ resistor ties the input to ground. It answers one question: what does this output do when nothing is connected to the input?',
      why: 'Without it the input floats, picks up interference and switches at random. A floating input is not off, it is undefined, and undefined behaviour in a show is what you are being trained to prevent.',
      note: 'A disconnected input becomes a definite off rather than a coin toss. <b>This is the resistor whose omission makes the board dangerous rather than merely broken.</b>',
    },
    {
      name: 'Optocoupler',
      body: 'The input current lights an internal LED through a 220 Ω series resistor. On the far side a phototransistor conducts. There is no electrical path across the package.',
      why: 'That gap is the whole point of the board. A fault on the load side cannot put voltage onto whatever a person is touching.',
      note: 'PC817, 5 kV isolation, about ten cents. <b>The most important component on the board, and the cheapest.</b>',
    },
    {
      name: 'Gate resistor and pull-down',
      body: 'A 150 Ω series resistor limits the current spike into the gate capacitance. A 10 kΩ pull-down from gate to source guarantees the MOSFET is off when nothing is driving it.',
      why: 'The same argument as stage one, applied at the dangerous end. A floating gate on a MOSFET switching several amps is not a state you want to discover experimentally.',
    },
    {
      name: 'MOSFET',
      body: 'Logic-level, 22 mΩ on-resistance, switching the low side: the load connects to the positive rail and the MOSFET connects its other end to ground.',
      why: 'Low-side switching is simpler because the gate reference is ground. Its cost is that the load sits at supply potential even when off, which is a real safety consideration and belongs in your documentation.',
      note: 'At 5 A through 22 mΩ this dissipates about 0.55 W. <b>Warm means the gate is under-driven or the current is higher than you think, and both get worse rather than better.</b>',
    },
    {
      name: 'Flyback diode and indicator',
      body: 'A Schottky diode across the output terminals, cathode to the positive rail, catching the inductive kick from any load. An LED and a 1 kΩ resistor show the channel state.',
      why: 'You do not know what will be plugged in. A relay, a solenoid and a small motor are all inductive, and the diode costs two cents.',
      note: 'The indicator is not decoration: it lets somebody diagnose the board from six metres away without a laptop. <b>That matters at 19:45 when you are not in the building.</b>',
    },
  ],
  footer: 'Two decisions in the bill of materials are worth arguing about: why a Schottky rather than a 1N4007, and why 220 Ω rather than 1 kΩ on the optocoupler. Come with an opinion.',
}));

register('build-order', (host) => chain(host, {
  title: 'Build order, and why it is this order',
  sub: 'Chosen so each stage can be tested before the next one hides it.',
  tag: 'Step', accent: 'energy',
  stages: [
    {
      name: 'Lowest first',
      body: 'Resistors and diodes lie flat and are held by the board when you turn it over. Tall parts last.',
      why: 'Fit a tall part early and every short part after it falls out when you flip the board.',
    },
    {
      name: 'Passives before semiconductors',
      body: 'Resistors, then diodes, then the optocouplers and MOSFETs.',
      why: 'Semiconductors are heat-sensitive and static-sensitive, and you do the most fumbling early.',
    },
    {
      name: 'Test the supply first',
      body: 'Fit the terminals and the decoupling only. Apply power. Confirm the rails are where you think they are.',
      why: 'If a rail is wrong, you have destroyed nothing. Fitting eight semiconductors first turns a five minute check into a scrapped board.',
      note: 'Nothing active is fitted yet. <b>This is the cheapest test on the whole board and the one most often skipped.</b>',
    },
    {
      name: 'One channel, complete',
      body: 'Build channel one entirely, and test it entirely, before populating the other three.',
      why: 'Building all four and testing at the end means a systematic mistake is repeated four times before you find it.',
      note: 'Every experienced builder does this and every beginner thinks it is slower. <b>It is slower exactly once, on the board where you made no mistakes.</b>',
    },
    {
      name: 'The other three',
      body: 'Now repeat, with the pattern proved.',
      why: 'By this point you are doing a known-good operation three times rather than inventing it four times.',
    },
    {
      name: 'Indicators last',
      body: 'LEDs and their resistors go on at the end.',
      why: 'They are the easiest to fit backwards and the least important to the board working.',
    },
  ],
  footer: 'Clip leads after each joint, not at the end: a clipping that falls onto a finished board and bridges two pads is a fault you will spend an hour on.',
}));

register('test-order', (host) => chain(host, {
  title: 'Five tests, in an order that finds faults safely',
  sub: 'Anybody can assemble a board. What is assessed is whether you can prove it works.',
  tag: 'Test', accent: 'safe',
  stages: [
    {
      name: 'Dead tests',
      body: 'Unpowered, nothing connected. Resistance across the supply terminals: tens of kilohms, rising as the electrolytic charges from the meter. Control ground to load ground: open. Each drain to its terminal: near zero. Each gate to source: about 10 kΩ.',
      why: 'A low reading across the supply means a short, and powering it would turn a five minute fix into a destroyed board.',
      note: 'The control-to-load ground reading is the single most important measurement on this board. <b>Open circuit, or the isolation you designed in does not exist.</b>',
    },
    {
      name: 'Powered, no load',
      body: 'Supply current with everything off: a few milliamps at most. Every output at full supply voltage relative to load ground. Every gate near zero.',
      why: 'Anything above a few milliamps means a channel is partly on, which is the state that destroys MOSFETs.',
    },
    {
      name: 'One channel, with a load',
      body: 'Resistive load, apply the control input. LED lights, output pulls to near zero, V_DS small. Calculate R_DS(on) from V_DS and the current and compare it to the datasheet.',
      why: 'A calculated on-resistance far above the datasheet means the gate is under-driven, and you want to find that now rather than in a performance.',
      note: 'Cool after two minutes is a pass. <b>Warm is a question that needs a number, and hot is a fault.</b>',
    },
    {
      name: 'Flyback test',
      body: 'Swap the resistive load for a relay coil. Scope across drain and source, switch it, photograph the trace. Then lift the diode, repeat, photograph again.',
      why: 'You did this on breadboard in Class 5. On your own board it validates your own design decision rather than somebody else’s demonstration.',
    },
    {
      name: 'Isolation at voltage',
      body: 'The technician tests the barrier with an insulation tester at 500 V. You watch.',
      why: 'A board that fails this is not a board with a fault, it is a board that is dangerous, and the difference in language matters.',
      note: 'A meter proves there is no path at a few volts. <b>An insulation tester proves there is none at five hundred, which is the case that matters when something goes wrong.</b>',
    },
  ],
  footer: '“Pass” is not a measurement. Every result is written down as a number, dated and initialled, on the sheet that goes in the case with the board.',
}));

// ---------------------------------------------------------------------------
// Dimming
// ---------------------------------------------------------------------------

register('dimmer-types', (host) => compare(host, {
  title: 'Three ways a lamp is actually dimmed',
  sub: '“You cannot dim that on a dimmer” has a specific technical meaning, and this is it.',
  fields: [
    { label: 'How it works', key: 'how' },
    { label: 'Dims', key: 'dims' },
    { label: 'Fed with', key: 'fed', tone: 'energy' },
    { label: 'What it costs you', key: 'costs', tone: 'fault' },
  ],
  items: [
    {
      name: 'Phase control', short: 'Phase', tone: 'energy',
      line: 'A triac waits part of each mains half-cycle, then conducts for the rest of it. What a dimmer rack does.',
      how: 'Chops the waveform, delivering less energy per cycle',
      dims: 'Tungsten and other resistive loads',
      fed: 'A dimmer way',
      costs: 'Harmonics far up the audio band, filament sing, and it assumes a resistive load',
      note: 'Cheap, handles kilowatts, and it is the source of the buzz in Class 7 and Class 8. <b>The choke that stops the filament singing is why a dimmer rack is heavy.</b>',
    },
    {
      name: 'Sine wave', short: 'Sine', tone: 'safe',
      line: 'An IGBT dimmer that reconstructs a genuine reduced-amplitude sine rather than chopping one.',
      how: 'Synthesises a smaller sine wave',
      dims: 'Almost anything, including transformers and many drivers',
      fed: 'A dimmer way',
      costs: 'Several times the price, and considerably more electronics to fail',
      note: 'It exists because opera houses and broadcast studios could not live with the harmonics. <b>Silent, clean, expensive: the three properties in the order people notice them.</b>',
    },
    {
      name: 'Constant current', short: 'LED', tone: 'signal',
      line: 'What is inside every LED fixture. The supply is never varied at all.',
      how: 'Holds the LED current and dims by PWM, at whatever frequency the manufacturer chose',
      dims: 'The LEDs inside that one fixture',
      fed: 'A constant live feed, never a dimmer',
      costs: 'PWM that a camera may see, and no control except over DMX',
      watch: 'An LED fixture on a dimmer way is one of the fourteen faults in Class 10. The dimmer varies voltage; the driver wanted a constant supply and a DMX instruction. The result is flicker, buzz, or a dead driver.',
    },
  ],
  footer: 'The question to ask about any fixture is not “can it be dimmed” but “what does it want to be fed”. Those are different questions and only the second has a useful answer.',
}));

register('phase-control', (host) => {
  let angle = 90;   // firing angle in degrees
  let load = 'tungsten';

  const { controls, stage, setNote, challenge } = figure(host, {
    title: 'Chopping the waveform',
    sub: 'Delay the firing point and the lamp gets less energy. Then put something other than a filament on it.',
    note: '',
  });

  // Fraction of the half-cycle energy that survives, integrated properly.
  const level = () => {
    const a = (angle * Math.PI) / 180;
    return (1 / Math.PI) * (Math.PI - a + Math.sin(2 * a) / 2);
  };

  const upd = () => {
    setNote(load !== 'tungsten'
      ? `A ${load === 'led' ? 'LED driver' : 'motor or transformer'} on a chopped waveform does not integrate the energy the way a filament does. ${load === 'led' ? 'The driver sees an input that appears and disappears, and it flickers, buzzes, or fails.' : 'The inductance fights the sudden edge, and the result is heat and audible noise.'} <b>This is the whole technical content of "you cannot dim that on a dimmer".</b>`
      : `Firing at ${angle}° passes about ${Math.round(level() * 100)} per cent of the energy. A tungsten filament integrates it thermally and simply glows less. <b>It is cheap and it handles kilowatts, and the price is the harmonics it throws off, which is the buzz you will chase in Class 8.</b>`);
    cv.once();
  };

  controls.append(slider('Firing angle', {
    min: 0, max: 170, step: 5, value: 90, fmt: (v) => `${v}°`,
    on: (v) => { angle = v; upd(); },
  }).node);
  controls.append(choice('Load', [
    ['tungsten', 'Tungsten lamp'], ['led', 'LED fixture'], ['motor', 'Motor or transformer'],
  ], { value: 'tungsten', on: (v) => { load = v; upd(); } }).node);

  challenge('Dim a tungsten lamp to roughly half, and read the firing angle that does it.',
    () => load === 'tungsten' && Math.abs(level() - 0.5) < 0.04);

  const cv = canvas(stage, {
    height: 270,
    draw(g, w, h, t) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const gL = pad, gT = 24, gW = w - pad * 2 - 100, gH = 92;
      const mid = gT + gH / 2;
      const fire = (angle * Math.PI) / 180;
      const ok = load === 'tungsten';

      box(g, gL, gT, gW, gH, { fill: alpha(p.ground, 0.5), stroke: p.line, r: 6 });
      line(g, gL, mid, gL + gW, mid, { color: alpha(p.muted, 0.7), lw: 1 });

      // The full sine, faint, so you can see what was removed.
      g.strokeStyle = alpha(p.muted, 0.45);
      g.lineWidth = 1.5;
      g.setLineDash([3, 3]);
      g.beginPath();
      for (let k = 0; k <= 240; k++) {
        const x = gL + (k / 240) * gW;
        const ph = (k / 240) * 4 * Math.PI - t * 2;
        k ? g.lineTo(x, mid - Math.sin(ph) * (gH / 2 - 8)) : g.moveTo(x, mid - Math.sin(ph) * (gH / 2 - 8));
      }
      g.stroke();
      g.setLineDash([]);

      // The conducting part.
      g.strokeStyle = ok ? R.energy : R.fault;
      g.lineWidth = 2.4;
      g.beginPath();
      let pen = false;
      for (let k = 0; k <= 320; k++) {
        const x = gL + (k / 320) * gW;
        const ph = (k / 320) * 4 * Math.PI - t * 2;
        const inHalf = ((ph % Math.PI) + Math.PI) % Math.PI;
        const on = inHalf >= fire;
        const y = mid - (on ? Math.sin(ph) : 0) * (gH / 2 - 8);
        if (!on) { pen = false; continue; }
        if (!pen) { g.moveTo(x, mid); g.lineTo(x, y); pen = true; } else g.lineTo(x, y);
      }
      g.stroke();
      label(g, `firing at ${angle}°`, gL + 6, gT + 12, { color: p.muted, size: 10, mono: true });
      label(g, `${Math.round(level() * 100)}% of the energy`, gL + gW - 6, gT + 12, {
        color: ok ? R.energy : R.fault, size: 10, mono: true, align: 'right',
      });

      // The lamp, or the thing that is unhappy.
      const lx = w - pad - 84;
      const b = ok ? level() ** 0.6 : 0;
      if (ok) {
        g.fillStyle = alpha(R.energy, 0.12 + b * 0.6);
        g.beginPath(); g.arc(lx + 40, gT + 44, 24 + b * 18, 0, Math.PI * 2); g.fill();
      }
      box(g, lx, gT + 22, 80, 44, {
        fill: ok ? alpha(R.energy, 0.15 + b * 0.45) : alpha(R.fault, 0.15),
        stroke: ok ? p.line : R.fault, r: 6, lw: ok ? 1 : 2,
      });
      label(g, ok ? 'lamp' : load === 'led' ? 'LED driver' : 'motor', lx + 40, gT + 38, {
        color: ok ? p.ground : R.fault, size: 10.5, align: 'center', weight: 700, max: 74,
      });
      label(g, ok ? `${Math.round(level() * 100)}%` : load === 'led' ? 'flicker, buzz' : 'heat, noise',
        lx + 40, gT + 54, {
          color: ok ? p.ground : R.fault, size: 9.5, align: 'center', max: 74,
        });

      // Harmonics, which are always there and are the real cost.
      const hy = gT + gH + 28;
      label(g, 'harmonic content thrown onto the supply', pad, hy, { color: p.muted, size: 10.5 });
      const bars = 8;
      const chop = 1 - level();
      for (let k = 0; k < bars; k++) {
        const bh = (k === 0 ? level() : chop * (0.75 / (k * 0.6 + 1))) * 44;
        const bw = (w - pad * 2) / bars - 6;
        g.fillStyle = k === 0 ? alpha(R.energy, 0.7) : alpha(R.fault, 0.35 + chop * 0.5);
        g.fillRect(pad + k * ((w - pad * 2) / bars), hy + 54 - bh, bw, bh);
        label(g, `${50 * (k + 1)}`, pad + k * ((w - pad * 2) / bars) + bw / 2, hy + 66, {
          color: p.muted, size: 8.5, align: 'center', mono: true,
        });
      }
      label(g, 'Hz', w - pad, hy + 78, { color: p.muted, size: 9, align: 'right' });
      label(g, 'This is what a signal cable routed beside a dimmer feed picks up.', pad, hy + 78, {
        color: p.muted, size: 10, max: w - pad * 2 - 30,
      });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// Class 6: layout and the sheet
// ---------------------------------------------------------------------------

register('board-layout', (host) => {
  let layout = 'tight';

  const { controls, stage, setNote, challenge } = figure(host, {
    title: 'The loop the schematic does not show',
    sub: 'Same circuit, two layouts. One of them is an antenna.',
    note: '',
  });

  const upd = () => {
    setNote(layout === 'tight'
      ? 'Supply positive, load terminal, MOSFET, back to supply negative: short and wide, so the loop encloses almost no area. <b>Five amps switching in microseconds through a small loop radiates very little; through a large one it is a transmitter, and what it transmits into is everything else on your board.</b>'
      : layout === 'loose'
        ? 'The same components, connected the same way, with the return routed the long way round. The schematic is identical and the loop now encloses a large area. <b>This is why layout is a separate skill from schematic design, and why "it is wired correctly" is not the same as "it works".</b>'
        : 'The control ground and the load ground are joined by a copper pour that runs under the optocoupler. Every component still works perfectly and the isolation no longer exists. <b>The dead test between the two grounds is the only thing that finds this, which is why it is the most important measurement on the board.</b>');
    cv.once();
  };

  controls.append(choice('Layout', [
    ['tight', 'Tight return path'], ['loose', 'Return routed the long way'], ['bridged', 'Grounds bridged under the opto'],
  ], { value: 'tight', on: (v) => { layout = v; upd(); } }).node);

  challenge('Break the isolation without changing a single component.', () => layout === 'bridged');

  const cv = canvas(stage, {
    height: 260,
    draw(g, w, h, t) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const bx = pad, by = 26, bw = Math.min(w - pad * 2, 380), bh = 150;
      box(g, bx, by, bw, bh, { fill: alpha(p.raised, 0.6), stroke: p.line, r: 6 });

      // The isolation split, drawn down the middle of the board.
      const splitX = bx + bw * 0.42;
      const bridged = layout === 'bridged';
      line(g, splitX, by + 4, splitX, by + bh - 4, {
        color: bridged ? alpha(R.fault, 0.6) : alpha(R.safe, 0.6), lw: 2, dash: [5, 4],
      });
      label(g, 'control side', bx + 8, by + 14, { color: R.signal, size: 9.5, weight: 700 });
      label(g, 'load side', splitX + 8, by + 14, { color: R.fault, size: 9.5, weight: 700 });

      // The high-current loop.
      const supX = bx + bw - 30, supY = by + 34;
      const loadX = splitX + 40, loadY = by + 34;
      const fetX = splitX + 40, fetY = by + bh - 44;
      const returnY = layout === 'loose' ? by + bh - 12 : fetY + 16;
      const returnLeft = layout === 'loose' ? splitX + 10 : fetX;

      box(g, supX - 22, supY - 12, 26, 24, { fill: p.raised, stroke: p.line, r: 4 });
      label(g, '+V', supX - 9, supY, { color: R.energy, size: 9.5, align: 'center' });
      box(g, loadX - 20, loadY - 12, 40, 24, { fill: p.raised, stroke: p.line, r: 4 });
      label(g, 'load', loadX, loadY, { color: p.ink2, size: 9.5, align: 'center' });
      box(g, fetX - 18, fetY - 14, 36, 28, { fill: p.raised, stroke: p.line, r: 4 });
      label(g, 'Q1', fetX, fetY, { color: p.ink2, size: 10, align: 'center', weight: 600 });

      const loopCol = layout === 'loose' ? R.fault : R.energy;
      g.strokeStyle = loopCol;
      g.lineWidth = layout === 'loose' ? 2.5 : 5;
      g.beginPath();
      g.moveTo(supX - 22, supY);
      g.lineTo(loadX + 20, supY);
      g.moveTo(loadX, loadY + 12);
      g.lineTo(loadX, fetY - 14);
      g.moveTo(fetX, fetY + 14);
      g.lineTo(fetX, returnY);
      g.lineTo(returnLeft, returnY);
      if (layout === 'loose') { g.lineTo(returnLeft, by + 20); g.lineTo(supX - 9, by + 20); }
      g.lineTo(supX - 9, supY - 12);
      g.stroke();

      // The enclosed area, shaded, because area is the whole point.
      g.fillStyle = alpha(loopCol, layout === 'loose' ? 0.16 : 0.1);
      if (layout === 'loose') g.fillRect(returnLeft, by + 20, supX - 9 - returnLeft, returnY - by - 20);
      else g.fillRect(fetX - 2, supY, loadX + 20 - fetX, returnY - supY);
      label(g, layout === 'loose' ? 'large loop area: this radiates' : 'small loop area',
        (splitX + supX) / 2, by + bh - 24, {
          color: loopCol, size: 10, align: 'center', weight: 600, max: bw * 0.5,
        });

      // The bridge, when it exists.
      if (bridged) {
        line(g, bx + 20, by + bh - 22, splitX + 20, by + bh - 22, { color: R.fault, lw: 4 });
        label(g, 'copper pour under the opto', bx + 22, by + bh - 32, {
          color: R.fault, size: 9.5, weight: 700, max: bw * 0.6,
        });
      }

      // Current, at speed, so the loop reads as carrying something.
      for (let k = 0; k < 5; k++) {
        const u = ((t * 0.7 + k / 5) % 1);
        g.fillStyle = loopCol;
        g.beginPath();
        g.arc(loadX, loadY + 12 + u * (fetY - 14 - loadY - 12), 3, 0, Math.PI * 2);
        g.fill();
      }

      const rx = bx + bw + 12;
      if (w - rx > 100) {
        readoutChip(g, rx, by + 6, 'RADIATED NOISE', layout === 'loose' ? 'high' : 'low', {
          color: layout === 'loose' ? R.fault : R.safe, p, w: Math.min(120, w - rx - pad),
        });
        readoutChip(g, rx, by + 48, 'ISOLATION', bridged ? 'GONE' : 'intact', {
          color: bridged ? R.fault : R.safe, p, w: Math.min(120, w - rx - pad),
        });
      }

      const ty = by + bh + 20;
      label(g, 'Keep the high-current loop small and fat · keep the two grounds apart · decouple at the chip · put the heat where it can leave',
        pad, ty, { color: p.muted, size: 10.5, max: w - pad * 2 });
    },
  });
  upd();
});

register('board-doc', (host) => compare(host, {
  title: 'The sheet, point by point',
  sub: 'One side of A4. It is what somebody reads at 19:45 when the board has stopped and you are not there.',
  fields: [
    { label: 'What goes on it', key: 'what' },
    { label: 'Without it', key: 'without', tone: 'fault' },
  ],
  items: [
    { name: '1 · What it is', short: '1', tone: 'signal', line: 'Two sentences: what it is and what it is for.',
      what: '“Four-channel isolated low-side switch for practical lamps and solenoids up to 5 A each.”',
      without: 'It is an unlabelled board in a flight case, and it will be thrown away' },
    { name: '2 · Ratings', short: '2', tone: 'signal', line: 'The numbers a production manager needs before saying yes.',
      what: 'Supply range, current per channel, maximum total, isolation rating',
      without: 'Somebody connects a 10 A load to a 5 A channel and is surprised' },
    { name: '3 · Pinout', short: '3', tone: 'signal', line: 'Drawn, with the connector orientation shown.',
      what: 'Which terminal is which, seen from the direction you actually look at it',
      without: 'A reversed supply, once, and then a new board' },
    { name: '4 · Power-up', short: '4', tone: 'energy', line: 'What it does the moment power arrives.',
      what: '“All outputs off until a control signal is present.”',
      without: 'Nobody knows whether it fires when the power blips in the interval' },
    { name: '5 · Loss of control', short: '5', tone: 'energy', line: 'The sentence production managers actually read.',
      what: '“Outputs off within one loop pass if the control connector is removed.”',
      without: 'The answer becomes “we would have to test it”, which means “use something else”' },
    { name: '6 · Fault codes', short: '6', tone: 'safe', line: 'What the indicator is telling you from six metres away.',
      what: 'One blink idle, two running, rapid for a fault',
      without: 'Diagnosis requires a laptop, and there is not one in the wing' },
    { name: '7 · Reset', short: '7', tone: 'safe', line: 'One deliberate physical action, documented.',
      what: '“Hold the reset button for two seconds.” Not a power cycle',
      without: 'Somebody hunts for the right plug among forty in a rack' },
    { name: '8 · Known limitations', short: '8', tone: 'fault', line: 'Where the marks are won, and where most people lose them.',
      what: '“The load sits at supply potential when off. There is no over-current protection.”',
      without: 'A limitation you did not name is a defect. One you named is engineering',
      note: 'Every device in the room has limitations. <b>The sheets that list three specific ones score above the sheets that list none, and a production can plan around a limitation it has been told about.</b>' },
    { name: '9 · Test results', short: '9', tone: 'safe', line: 'Numbers, dated and initialled. Not ticks.',
      what: 'Isolation resistance, R_DS(on) calculated from V_DS, quiescent current',
      without: '“Pass” is not a measurement and cannot be checked by anybody else' },
    { name: '10 · Who to contact', short: '10', tone: 'signal', line: 'A name and a way to reach it.',
      what: 'Yours, and the department’s',
      without: 'The board is orphaned the day you graduate' },
  ],
  footer: 'The stranger test is the specification: somebody who has never seen the device, given only this sheet, must power it up, trigger it, cause a fault, identify it and reset it.',
}));
