// Classes 3 and 4: what each component refuses to do, and why a joint fails
// mechanically long before it fails electrically.

import { register } from './anim-core.js';
import {
  figure, canvas, slider, toggle, choice, label, labelWrap, box, line, palette,
  alpha, fitter, compare, chain, plot, role, eng, sig,
  arrow, resistorSym, supplySym, groundSym, readoutChip,
} from './anim-kit.js';

// ---------------------------------------------------------------------------
// Resistor colour code
// ---------------------------------------------------------------------------

register('resistor-code', (host) => {
  const BANDS = ['black', 'brown', 'red', 'orange', 'yellow', 'green', 'blue', 'violet', 'grey', 'white'];
  const HEX = ['#111214', '#7a4a22', '#c8443c', '#d97b2a', '#d8c33c', '#3f9d5c', '#3a6fc4', '#8a5cc0', '#8b8f98', '#e8eaee'];
  let b = [4, 7, 2, 1];   // 4, 7, ×100, ±5% → 4.7 kΩ

  const { controls, stage, setNote, challenge } = figure(host, {
    title: 'Reading the bands',
    sub: 'Two digits, a multiplier, a tolerance. Spin them and read the value the way you would on a bench.',
    note: '',
  });

  const value = () => (b[0] * 10 + b[1]) * 10 ** b[2];
  const tol = () => [5, 1, 2, 0.5][b[3]] ?? 5;

  const upd = () => {
    const v = value();
    const tv = tol();
    setNote(`${BANDS[b[0]]}, ${BANDS[b[1]]}, ${BANDS[b[2]]}, so ${b[0]}${b[1]} followed by ${b[2]} zero${b[2] === 1 ? '' : 's'}: ${eng(v, 'Ω')} at ±${tv} per cent, which is ${eng(v * (1 - tv / 100), 'Ω')} to ${eng(v * (1 + tv / 100), 'Ω')}. <b>The tolerance band is set slightly apart from the other three, and that gap is how you know which end to read from.</b>`);
    cv.once();
  };

  ['First digit', 'Second digit', 'Multiplier'].forEach((n, k) => {
    controls.append(slider(n, {
      min: 0, max: 9, step: 1, value: b[k], fmt: (v) => BANDS[v],
      on: (v) => { b[k] = v; upd(); },
    }).node);
  });
  controls.append(choice('Tolerance', [[0, 'gold ±5%'], [1, 'brown ±1%'], [2, 'red ±2%'], [3, 'green ±0.5%']], {
    value: 0, on: (v) => { b[3] = +v; upd(); },
  }).node);

  challenge('Set it to 4.7 kΩ, the most common value in this course.', () => Math.round(value()) === 4700);

  const cv = canvas(stage, {
    height: 230, animated: false,
    draw(g, w) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const bodyW = Math.min(w - pad * 2 - 60, 260);
      const bx = pad + 30;
      const by = 40;
      const bh = 54;

      line(g, pad, by + bh / 2, bx, by + bh / 2, { color: p.muted, lw: 2 });
      line(g, bx + bodyW, by + bh / 2, w - pad, by + bh / 2, { color: p.muted, lw: 2 });
      box(g, bx, by, bodyW, bh, { fill: '#c9b189', stroke: '#8b7550', r: 20 });

      const TOLHEX = ['#c9a227', '#7a4a22', '#c8443c', '#3f9d5c'];
      const positions = [0.18, 0.32, 0.46, 0.80];
      [0, 1, 2, 3].forEach((k) => {
        const cx = bx + bodyW * positions[k];
        g.fillStyle = k === 3 ? TOLHEX[b[3]] : HEX[b[k]];
        g.fillRect(cx - 7, by + 2, 14, bh - 4);
        label(g, k === 3 ? ['gold', 'brown', 'red', 'green'][b[3]] : BANDS[b[k]], cx, by + bh + 14, {
          color: p.muted, size: 9, align: 'center',
        });
      });
      label(g, 'the gap tells you which end', bx + bodyW * 0.63, by - 12, {
        color: p.muted, size: 9.5, align: 'center', max: bodyW * 0.6,
      });

      const wy = by + bh + 40;
      label(g, eng(value(), 'Ω'), pad, wy, { color: R.signal, size: 22, weight: 700, mono: true });
      label(g, `±${tol()}%  ·  ${eng(value() * (1 - tol() / 100), 'Ω')} to ${eng(value() * (1 + tol() / 100), 'Ω')}`,
        pad, wy + 24, { color: p.ink2, size: 11.5, mono: true, max: w - pad * 2 });
      label(g, `Surface mount, the same value would be marked ${b[2] <= 6 ? `${b[0]}${b[1]}${b[2]}` : '—'}`,
        pad, wy + 44, { color: p.muted, size: 10.5, max: w - pad * 2 });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// Capacitor charging
// ---------------------------------------------------------------------------

register('cap-charge', (host) => {
  let Rv = 10e3, Cv = 100e-6;
  let t0 = 0, charging = true;

  const { controls, stage, setNote, challenge } = figure(host, {
    title: 'The time constant, watched',
    sub: 'τ = R × C. In one time constant it reaches 63 per cent, and in five it is there.',
    note: '',
  });

  const tau = () => Rv * Cv;

  const upd = () => {
    setNote(`τ = ${eng(Rv, 'Ω')} × ${eng(Cv, 'F')} = ${eng(tau(), 's')}. It reaches 63 per cent in one time constant and is there for all practical purposes in five, so ${eng(tau() * 5, 's')}. <b>This is the same arithmetic that sets a debounce filter, a power-supply hold-up time and how long a capacitor in mains equipment stays dangerous.</b>`);
    cv.reset();
  };

  controls.append(slider('Resistance', {
    min: 0, max: 30, step: 1, value: 10, fmt: (k) => eng(10 ** (2 + k / 10), 'Ω'),
    on: (k) => { Rv = 10 ** (2 + k / 10); upd(); },
  }).node);
  controls.append(slider('Capacitance', {
    min: 0, max: 30, step: 1, value: 20, fmt: (k) => eng(10 ** (-7 + k / 10), 'F'),
    on: (k) => { Cv = 10 ** (-7 + k / 10); upd(); },
  }).node);
  Rv = 10 ** (2 + 10 / 10); Cv = 10 ** (-7 + 20 / 10);
  controls.append(toggle('Discharge instead', { value: false, on: (v) => { charging = !v; upd(); } }).node);

  challenge('Set a time constant longer than one second.', () => tau() > 1);

  const cv = canvas(stage, {
    height: 260,
    draw(g, w, h, t) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const T = tau();
      // The graph runs over five time constants, whatever they are, so the
      // shape is always the same and only the axis changes. That is the point.
      const span = T * 5;
      const now = (t % (span * 1.35)) / 1;
      const frac = Math.min(1, now / span) * 5;
      const level = charging ? 1 - Math.exp(-frac) : Math.exp(-frac);

      const cx = pad + 46, cyT = 30, cyB = 128;
      supplySym(g, cx - 30, (cyT + cyB) / 2, 24, R.energy, 2);
      line(g, cx - 30, (cyT + cyB) / 2 - 12, cx - 30, cyT, { color: p.muted, lw: 1.5 });
      line(g, cx - 30, cyT, cx, cyT, { color: p.muted, lw: 1.5 });
      line(g, cx - 30, (cyT + cyB) / 2 + 12, cx - 30, cyB, { color: p.muted, lw: 1.5 });
      line(g, cx - 30, cyB, cx, cyB, { color: p.muted, lw: 1.5 });
      resistorSym(g, cx - 22, cyT, 44, 12, p.ink2, 2);
      line(g, cx + 22, cyT, cx + 44, cyT, { color: p.muted, lw: 1.5 });
      line(g, cx + 44, cyT, cx + 44, cyB * 0.42, { color: p.muted, lw: 1.5 });
      // The capacitor plates, with the charge drawn on them.
      line(g, cx + 30, cyB * 0.5, cx + 58, cyB * 0.5, { color: p.ink2, lw: 2.5 });
      line(g, cx + 30, cyB * 0.5 + 8, cx + 58, cyB * 0.5 + 8, { color: p.ink2, lw: 2.5 });
      line(g, cx + 44, cyB * 0.5 + 8, cx + 44, cyB, { color: p.muted, lw: 1.5 });
      line(g, cx + 44, cyB, cx, cyB, { color: p.muted, lw: 1.5 });
      g.fillStyle = alpha(R.energy, 0.25 + level * 0.7);
      g.fillRect(cx + 30, cyB * 0.5 - 5, 28, 4);
      label(g, eng(Rv, 'Ω'), cx, cyT - 14, { color: p.muted, size: 9.5, align: 'center' });
      label(g, eng(Cv, 'F'), cx + 64, cyB * 0.5 + 4, { color: p.muted, size: 9.5 });

      // The curve.
      const gL = Math.min(cx + 130, w * 0.5), gT = 24, gW = w - gL - pad, gH = 110;
      line(g, gL, gT + gH, gL + gW, gT + gH, { color: p.muted, lw: 1.5 });
      line(g, gL, gT, gL, gT + gH, { color: p.muted, lw: 1.5 });
      for (const [lv, txt, col] of [[0.63, '63%', R.signal], [0.95, '95%', p.muted]]) {
        const y = gT + gH - (charging ? lv : 1 - lv) * gH;
        line(g, gL, y, gL + gW, y, { color: alpha(col, 0.5), lw: 1, dash: [3, 3] });
        label(g, txt, gL + 4, y - 8, { color: col, size: 9, weight: 600 });
      }
      for (let k = 1; k <= 5; k++) {
        const x = gL + (k / 5) * gW;
        line(g, x, gT + gH, x, gT + gH + 4, { color: p.muted, lw: 1 });
        label(g, `${k}τ`, x, gT + gH + 13, { color: p.muted, size: 9, align: 'center' });
      }
      g.strokeStyle = R.energy;
      g.lineWidth = 2.5;
      g.beginPath();
      for (let k = 0; k <= 120; k++) {
        const f = (k / 120) * 5;
        const v = charging ? 1 - Math.exp(-f) : Math.exp(-f);
        const x = gL + (f / 5) * gW;
        k ? g.lineTo(x, gT + gH - v * gH) : g.moveTo(x, gT + gH - v * gH);
      }
      g.stroke();
      const px = gL + (Math.min(frac, 5) / 5) * gW;
      const py = gT + gH - level * gH;
      g.fillStyle = p.ink;
      g.beginPath();
      g.arc(px, py, 4.5, 0, Math.PI * 2);
      g.fill();

      const wy = 158;
      label(g, `τ = R × C = ${eng(Rv, 'Ω')} × ${eng(Cv, 'F')} = ${eng(T, 's')}`, pad, wy, {
        color: p.ink, size: 12, mono: true, weight: 600, max: w - pad * 2,
      });
      label(g, `63% at ${eng(T, 's')}   ·   95% at ${eng(T * 3, 's')}   ·   settled at ${eng(T * 5, 's')}`, pad, wy + 20, {
        color: p.ink2, size: 11, mono: true, max: w - pad * 2,
      });
      label(g, `${sig(level * 100)}% now`, pad, wy + 40, { color: R.energy, size: 12, weight: 700, mono: true });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// Diode curve
// ---------------------------------------------------------------------------

register('diode-curve', (host) => plot(host, {
  title: 'The diode curve, and why it has no comfortable middle',
  sub: 'Current against forward voltage. Below the knee, nothing. Above it, everything.',
  note: 'The curve is nearly vertical past the forward voltage, which means a small change in voltage is an enormous change in current. <b>There is no region where a diode settles at a sensible current on its own, and that single fact is why every LED needs something else in the circuit to set its current.</b>',
  xLabel: 'Forward voltage (V)', yLabel: 'mA',
  xMin: 0, xMax: 3.6, yMin: 0, yMax: 60,
  controls: (st, redraw, setNote) => {
    st.type = 'red';
    st.v = 1.9;
    const TYPES = {
      si: ['Silicon, 1N4148', 0.7],
      sch: ['Schottky, 1N5819', 0.32],
      red: ['Red LED', 1.9],
      blue: ['Blue LED', 3.1],
    };
    st.vf = () => TYPES[st.type][1];
    const c1 = choice('Device', Object.entries(TYPES).map(([k, v]) => [k, v[0]]), {
      value: 'red',
      on: (v) => {
        st.type = v;
        setNote(`${TYPES[v][0]} drops about ${TYPES[v][1]} V when conducting, and that drop barely moves with current. <b>Which is exactly why you set the current with something else and let the device take whatever voltage it wants.</b>`);
        redraw();
      },
    });
    const c2 = slider('Applied voltage', {
      min: 0, max: 3.6, step: 0.02, value: 1.9, fmt: (v) => `${v.toFixed(2)} V`,
      on: (v) => { st.v = v; redraw(); },
    });
    return [c1.node, c2.node];
  },
  curves: (st) => [{
    tone: 'signal',
    f: (v) => (v <= 0 ? 0 : 60 * Math.exp((v - st.vf()) / 0.055)),
  }],
  cursor: (st) => {
    const i = st.v <= 0 ? 0 : 60 * Math.exp((st.v - st.vf()) / 0.055);
    return {
      x: st.v, y: i,
      text: i > 60 ? '> 60 mA, destroyed' : `${sig(i)} mA`,
    };
  },
  footer: 'A tenth of a volt either side of the knee is the difference between dark and destroyed. Nothing else in this course has a curve this steep.',
}));

// ---------------------------------------------------------------------------
// LED without a resistor
// ---------------------------------------------------------------------------

register('led-current', (host) => {
  let hasR = true;
  let Rv = 150;
  const Vs = 5, Vf = 2.0;
  let temp = 25, running = false, dead = false;

  const { controls, stage, setNote, challenge } = figure(host, {
    title: 'Thermal runaway, in about four seconds',
    sub: 'Remove the resistor and watch the current, the temperature and then the LED.',
    note: '',
  });

  const upd = () => {
    if (hasR) {
      const I = (Vs - Vf) / Rv;
      setNote(`${eng(Rv, 'Ω')} sets the current to ${eng(I, 'A')}: R = (5 − 2.0) ÷ ${sig(I)}. The resistor dissipates ${eng(I * I * Rv, 'W')}, so a quarter-watt part is comfortable. <b>The resistor is not protecting the LED, it is the only thing in the circuit deciding how much current flows.</b>`);
    } else {
      setNote('With no resistor, nothing in the circuit sets the current. The LED conducts as hard as the supply allows, heats, and a hotter LED conducts more at the same voltage, which heats it further. <b>That is thermal runaway, and it takes seconds rather than minutes.</b>');
    }
    temp = 25; dead = false; running = !hasR;
    cv.reset();
  };

  controls.append(toggle('Series resistor fitted', { value: true, on: (v) => { hasR = v; upd(); } }).node);
  controls.append(slider('Resistor', {
    min: 47, max: 1000, step: 1, value: 150, fmt: (v) => eng(v, 'Ω'),
    on: (v) => { Rv = v; upd(); },
  }).node);

  challenge('Set a resistor that gives close to 20 mA on a 5 V rail.',
    () => hasR && Math.abs((Vs - Vf) / Rv - 0.02) < 0.0015);

  const cv = canvas(stage, {
    height: 250,
    draw(g, w, h, t, dt) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      // Current, with a temperature coefficient that is real in direction and
      // exaggerated in speed, because a four second demonstration is the point.
      const I = hasR ? (Vs - Vf) / Rv
        : dead ? 0 : Math.min(0.9, 0.06 * Math.exp((temp - 25) / 34));
      if (!hasR && !dead) {
        temp += (I * 260 - (temp - 25) * 0.6) * (dt || 0.016);
        if (temp > 200) { dead = true; }
      }

      const x = pad + 44, T = 34, bh = 92;
      supplySym(g, x - 30, T + bh / 2, 24, R.energy, 2);
      label(g, '5 V', x - 30, T + bh / 2 + 24, { color: R.energy, size: 10, align: 'center' });
      line(g, x - 30, T + bh / 2 - 12, x - 30, T, { color: p.muted, lw: 1.5 });
      line(g, x - 30, T, x + 120, T, { color: p.muted, lw: 1.5 });
      line(g, x - 30, T + bh / 2 + 12, x - 30, T + bh, { color: p.muted, lw: 1.5 });
      line(g, x - 30, T + bh, x + 120, T + bh, { color: p.muted, lw: 1.5 });
      line(g, x + 120, T, x + 120, T + bh, { color: p.muted, lw: 1.5 });

      if (hasR) {
        g.fillStyle = p.surface;
        g.fillRect(x + 4, T - 4, 52, 8);
        resistorSym(g, x + 6, T, 48, 13, p.ink2, 2);
        label(g, eng(Rv, 'Ω'), x + 30, T - 14, { color: p.ink2, size: 10, align: 'center' });
      } else {
        label(g, 'no resistor', x + 30, T - 14, { color: R.fault, size: 10.5, align: 'center', weight: 700 });
      }

      // The LED, glowing then dying.
      const ly = T + bh / 2;
      g.fillStyle = p.surface;
      g.fillRect(x + 116, ly - 20, 8, 40);
      const bright = dead ? 0 : Math.min(1, I / 0.03);
      if (bright > 0) {
        g.fillStyle = alpha(dead ? p.muted : R.fault, 0.14 + bright * 0.5);
        g.beginPath();
        g.arc(x + 120, ly, 16 + bright * 14, 0, Math.PI * 2);
        g.fill();
      }
      g.strokeStyle = dead ? p.muted : R.fault;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(x + 110, ly - 10); g.lineTo(x + 130, ly); g.lineTo(x + 110, ly + 10);
      g.closePath();
      g.stroke();
      line(g, x + 130, ly - 10, x + 130, ly + 10, { color: dead ? p.muted : R.fault, lw: 2 });
      if (dead) label(g, '✕ destroyed', x + 120, ly + 32, { color: R.fault, size: 11, align: 'center', weight: 700 });

      const rx = Math.max(x + 190, w - 130);
      if (w - rx > 100) {
        readoutChip(g, rx, T - 6, 'CURRENT', dead ? '0 mA' : `${sig(I * 1000)} mA`, {
          color: I > 0.03 ? R.fault : R.safe, p, w: Math.min(118, w - rx - 6),
        });
        readoutChip(g, rx, T + 40, 'JUNCTION', dead ? 'failed' : `${Math.round(temp)} °C`, {
          color: temp > 90 ? R.fault : temp > 50 ? R.energy : R.safe, p, w: Math.min(118, w - rx - 6),
        });
      }

      const wy = T + bh + 40;
      if (hasR) {
        label(g, `R = (5 − 2.0) ÷ ${sig(I)} = ${eng(Rv, 'Ω')}`, pad, wy, {
          color: p.ink2, size: 11.5, mono: true, max: w - pad * 2,
        });
        label(g, `P in the resistor = I² × R = ${eng(I * I * Rv, 'W')}`, pad, wy + 18, {
          color: p.muted, size: 11, mono: true, max: w - pad * 2,
        });
      } else {
        labelWrap(g, 'Nothing in this circuit sets the current. The LED takes what the supply will give, heats, conducts more at the same voltage, and heats further.',
          pad, wy, { color: R.fault, size: 11.5, max: w - pad * 2, maxLines: 3 });
      }
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// Inductive kick
// ---------------------------------------------------------------------------

register('inductor-kick', (host) => {
  let protectedCoil = false;
  let fireT = -10;

  const { controls, stage, setNote } = figure(host, {
    title: 'Interrupting a coil',
    sub: 'Switch the coil off and watch the voltage across the switch. Then fit the diode.',
    note: '',
  });

  const upd = () => {
    setNote(protectedCoil
      ? 'With the diode fitted the collapsing current has a loop to circulate in, and the spike is limited to about a volt above the supply. <b>It costs two cents, and its absence is one of the most common faults in home-built show electronics.</b>'
      : 'The magnetic field collapses and the coil generates whatever voltage it needs to try to keep the current flowing. Hundreds of volts, from a 12 V supply, in microseconds. <b>That spike destroys a transistor, erodes a mechanical contact, and resets microcontrollers elsewhere in the same box.</b>');
    cv.once();
  };

  controls.append(toggle('Flyback diode fitted', { value: false, on: (v) => { protectedCoil = v; upd(); } }).node);
  const fire = document.createElement('button');
  fire.className = 'ac ac-btn';
  fire.textContent = 'Switch it off';
  fire.addEventListener('click', () => { fireT = cv.t; });
  controls.append(fire);

  const cv = canvas(stage, {
    height: 260,
    draw(g, w, h, t) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const since = t - fireT;
      const peak = protectedCoil ? 12.7 : 380;
      // A damped ring, which is what the spike actually looks like on a scope.
      const spike = since >= 0 && since < 1.6
        ? peak * Math.exp(-since * 9) * Math.cos(since * 44) : 0;
      const shown = since < 0 ? 12 : Math.max(0, 12 + Math.max(0, spike));

      const x = pad + 50, T = 30, bh = 96;
      supplySym(g, x - 34, T + bh / 2, 24, R.energy, 2);
      label(g, '12 V', x - 34, T + bh / 2 + 24, { color: R.energy, size: 10, align: 'center' });
      line(g, x - 34, T + bh / 2 - 12, x - 34, T, { color: p.muted, lw: 1.5 });
      line(g, x - 34, T, x + 90, T, { color: p.muted, lw: 1.5 });
      line(g, x - 34, T + bh / 2 + 12, x - 34, T + bh, { color: p.muted, lw: 1.5 });
      line(g, x - 34, T + bh, x + 90, T + bh, { color: p.muted, lw: 1.5 });

      // The coil.
      g.strokeStyle = p.ink2;
      g.lineWidth = 2;
      g.beginPath();
      for (let k = 0; k < 4; k++) g.arc(x + 12 + k * 16, T, 8, Math.PI, 0, false);
      g.stroke();
      g.fillStyle = p.surface;
      g.fillRect(x + 4, T + 1, 68, 6);
      g.strokeStyle = p.ink2;
      g.beginPath();
      for (let k = 0; k < 4; k++) g.arc(x + 12 + k * 16, T, 8, Math.PI, 0, false);
      g.stroke();
      label(g, 'relay coil', x + 40, T - 20, { color: p.ink2, size: 10, align: 'center' });
      line(g, x + 76, T, x + 90, T, { color: p.muted, lw: 1.5 });

      // The switch, and the arc across it.
      const swY = T + bh * 0.55;
      line(g, x + 90, T, x + 90, swY - 12, { color: p.muted, lw: 1.5 });
      line(g, x + 90, swY + 12, x + 90, T + bh, { color: p.muted, lw: 1.5 });
      const open = since >= 0;
      line(g, x + 90, swY - 12, x + (open ? 102 : 90), swY + 12, { color: p.ink2, lw: 2.5 });
      if (open && !protectedCoil && since < 0.4) {
        g.fillStyle = alpha(R.fault, 0.6 * (1 - since / 0.4));
        g.beginPath();
        g.arc(x + 96, swY, 10 + since * 20, 0, Math.PI * 2);
        g.fill();
      }
      label(g, 'switch', x + 108, swY, { color: p.muted, size: 10 });

      // The diode, when fitted, drawn across the coil where it belongs.
      if (protectedCoil) {
        line(g, x + 4, T, x + 4, T - 30, { color: R.safe, lw: 2 });
        line(g, x + 4, T - 30, x + 90, T - 30, { color: R.safe, lw: 2 });
        line(g, x + 90, T - 30, x + 90, T, { color: R.safe, lw: 2 });
        const dx = x + 47;
        g.strokeStyle = R.safe;
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(dx - 8, T - 36); g.lineTo(dx - 8, T - 24); g.lineTo(dx + 6, T - 30);
        g.closePath();
        g.stroke();
        line(g, dx + 6, T - 36, dx + 6, T - 24, { color: R.safe, lw: 2 });
        label(g, 'flyback diode', dx + 14, T - 30, { color: R.safe, size: 9.5 });
      }

      // The scope trace across the switch, which is the reading.
      const gL = pad, gT = 150, gW = w - pad * 2, gH = 66;
      box(g, gL, gT, gW, gH, { fill: alpha(p.ground, 0.5), stroke: p.line, r: 6 });
      const scale = protectedCoil ? 40 : 400;
      const Y = (v) => gT + gH - 8 - (Math.min(v, scale) / scale) * (gH - 16);
      line(g, gL, Y(12), gL + gW, Y(12), { color: alpha(p.muted, 0.6), lw: 1, dash: [3, 3] });
      label(g, '12 V', gL + 4, Y(12) - 8, { color: p.muted, size: 9 });
      g.strokeStyle = protectedCoil ? R.safe : R.fault;
      g.lineWidth = 2;
      g.beginPath();
      for (let k = 0; k <= 200; k++) {
        const u = (k / 200) * 2;
        const dt2 = since - (2 - u);
        const sp = dt2 >= 0 && dt2 < 1.6 ? peak * Math.exp(-dt2 * 9) * Math.cos(dt2 * 44) : 0;
        const v = dt2 < 0 ? 12 : Math.max(0, 12 + Math.max(0, sp));
        const px = gL + (k / 200) * gW;
        k ? g.lineTo(px, Y(v)) : g.moveTo(px, Y(v));
      }
      g.stroke();
      label(g, `peak across the switch: ${protectedCoil ? 'about 12.7 V' : 'about 380 V'}`, gL + 6, gT + 12, {
        color: protectedCoil ? R.safe : R.fault, size: 11, weight: 700, max: gW - 12,
      });
      label(g, `now ${Math.round(shown)} V`, gL + gW - 6, gT + 12, {
        color: p.ink2, size: 11, align: 'right', mono: true,
      });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// The connector family
// ---------------------------------------------------------------------------

register('connector-family', (host) => compare(host, {
  title: 'Why the industry chose what it chose',
  sub: 'Every connector is a set of answers to the same five questions.',
  fields: [
    { label: 'Carries', key: 'carries' },
    { label: 'Why it exists', key: 'why' },
    { label: 'How it fails', key: 'fails' },
  ],
  items: [
    {
      name: 'XLR, 3-pin', short: 'XLR3', tone: 'signal',
      line: 'Balanced analogue audio. Pin 1 screen, pin 2 hot, pin 3 cold.',
      carries: 'Microphone and line level, balanced',
      why: 'Locking, robust, and sexed so signal flow is unambiguous from the connector alone',
      fails: 'Strain relief, then pin 1 losing its screen connection, which produces hum that comes and goes',
      note: 'The gendering is not decoration: an output is always male and an input always female, so a cable can only be plugged in one direction. <b>The connector encodes the signal flow, which is why you can trace an audio system without a drawing.</b>',
    },
    {
      name: 'XLR, 5-pin', short: 'XLR5', tone: 'signal',
      line: 'DMX512. Pin 1 screen, pin 2 data minus, pin 3 data plus. Pins 4 and 5 unused in almost every rig.',
      carries: 'DMX512 at 250 kbit/s over RS-485',
      why: 'Deliberately different from audio so a DMX line cannot be plugged into a microphone input, or a microphone into a dimmer',
      fails: 'Being replaced with 3-pin to save money, which throws away the safeguard',
      watch: 'A rig using 3-pin XLR for DMX often works electrically. What it has discarded is the physical impossibility of a dangerous mistake, and the fault that results is intermittent and expensive to find.',
      note: 'Only three pins are used and there are five, which people cite as waste. <b>The two spare pins are the price of making a category error physically impossible, and that is a good trade.</b>',
    },
    {
      name: 'Speakon', short: 'Speakon', tone: 'energy',
      line: 'Loudspeaker level, tens of volts at tens of amps.',
      carries: 'Amplifier output to loudspeaker, 2 or 4 pole',
      why: 'High current, locking, and no exposed conductor when live, unlike the jack it replaced',
      fails: 'A strand escaping the terminal and touching the adjacent pole, which is a short across an amplifier',
      note: 'It replaced the 6.35 mm jack, which could short its own tip to sleeve while being inserted into a live amplifier. <b>Every design choice in a Speakon is a response to something that used to destroy amplifiers.</b>',
    },
    {
      name: 'powerCON / TRUE1', short: 'powerCON', tone: 'energy',
      line: 'Locking mains to equipment. Blue is input, grey is output, and they do not mate.',
      carries: 'Mains, 16 or 20 A',
      why: 'A mains connector that cannot fall out, and TRUE1 may be connected and disconnected under load',
      fails: 'Standard powerCON being connected under load, which arcs and pits the contacts',
      watch: 'Standard blue powerCON is NOT rated for connection under load. TRUE1 is. They look similar and the distinction matters, which is why TRUE1 exists as a separate product rather than a revision.',
    },
    {
      name: 'IEC C13 / C14', short: 'IEC', tone: 'energy',
      line: 'The universal kettle lead. Cheap, everywhere, and it falls out.',
      carries: 'Mains up to 10 A',
      why: 'Universal and inexpensive, so every piece of equipment has one',
      fails: 'Falling out, which is why every touring rack has them taped or fitted with a retaining clip',
      note: 'It is the most common mains connector in the world and it has no locking mechanism at all. <b>The industry response is gaffer tape, which tells you something honest about how standards actually get adopted.</b>',
    },
    {
      name: 'RJ45 / etherCON', short: 'RJ45', tone: 'signal',
      line: 'Network, and DMX over IP. T568B ordering is the convention.',
      carries: 'Ethernet, and with it sACN, Art-Net, OSC and everything else',
      why: 'Cheap and ubiquitous; etherCON adds a locking metal shell for touring',
      fails: 'The plastic latch snapping, split pairs from careless termination, and untwisting too much at the plug',
      watch: 'A cable with split pairs passes a continuity test and fails at speed over distance. A cheap tester that only checks continuity will call it good, which is the Class 2 lesson about proving the right thing.',
    },
    {
      name: 'Socapex 19-pin', short: 'Soca', tone: 'energy',
      line: 'Six dimmer circuits in one cable, for touring.',
      carries: '6 circuits, each up to 16 A',
      why: 'One cable instead of six, rigged in a fraction of the time',
      fails: 'Pins pushing back in the shell, and moisture in the connector, both of which produce heat',
      note: 'It exists because rigging six separate cables to a bar takes six times as long. <b>Nearly every touring connector is a trade of cost and complexity against get-in time, and get-in time is money.</b>',
    },
  ],
  footer: 'Two rules run through the whole table: a connector must make the wrong thing impossible, and the connector is never the weak point — the strain relief is.',
}));

// ---------------------------------------------------------------------------
// Why five pins
// ---------------------------------------------------------------------------

register('pin-count', (host) => {
  let cheap = false;

  const { controls, stage, setNote } = figure(host, {
    title: 'Why DMX is on five pins when it only needs three',
    sub: 'Switch the rig to 3-pin and see what becomes possible.',
    note: '',
  });

  const upd = () => {
    setNote(cheap
      ? 'With 3-pin XLR on both systems, every mistake in the right-hand column becomes physically possible, and a technician working in the dark will eventually make one. <b>The two unused pins were never waste: they were the price of making a category error impossible.</b>'
      : 'Five pins for a three-pin signal looks wasteful until you notice what it prevents. <b>A DMX line cannot be plugged into a microphone input and a microphone cannot be plugged into a dimmer, because the connectors do not mate.</b>');
    cv.once();
  };

  controls.append(toggle('Use 3-pin XLR for DMX', { value: false, on: (v) => { cheap = v; upd(); } }).node);

  const cv = canvas(stage, {
    height: 250, animated: false,
    draw(g, w) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const colW = (w - pad * 2 - 20) / 2;

      const connector = (x, y, pins, colour, name) => {
        g.strokeStyle = colour;
        g.lineWidth = 2;
        g.beginPath();
        g.arc(x, y, 26, 0, Math.PI * 2);
        g.stroke();
        const layout = pins === 3
          ? [[0, -11], [-10, 6], [10, 6]]
          : [[0, -13], [-12, -2], [12, -2], [-7, 12], [7, 12]];
        layout.forEach(([dx, dy], k) => {
          g.fillStyle = k < 3 ? colour : alpha(p.muted, 0.6);
          g.beginPath();
          g.arc(x + dx, y + dy, 4, 0, Math.PI * 2);
          g.fill();
        });
        label(g, name, x, y + 42, { color: p.ink2, size: 10.5, align: 'center', weight: 600, max: colW });
        label(g, `${pins} pin`, x, y + 56, { color: p.muted, size: 9.5, align: 'center' });
      };

      connector(pad + colW * 0.5, 52, 3, R.signal, 'Audio');
      connector(pad + colW * 1.5 + 20, 52, cheap ? 3 : 5, cheap ? R.fault : R.energy, 'DMX');

      // Whether the two mate, which is the entire argument.
      const my = 130;
      const mates = cheap;
      box(g, pad, my, w - pad * 2, 32, {
        fill: alpha(mates ? R.fault : R.safe, 0.1),
        stroke: alpha(mates ? R.fault : R.safe, 0.45), r: 7,
      });
      label(g, mates
        ? 'These connectors mate. Every mistake below is now physically possible.'
        : 'These connectors do not mate. Every mistake below is physically impossible.',
      pad + 12, my + 16, { color: mates ? R.fault : R.safe, size: 12, weight: 700, max: w - pad * 2 - 24 });

      const rows = [
        ['DMX into a microphone input', 'A 250 kbit/s square wave into a preamp at 60 dB of gain'],
        ['A microphone into a DMX input', 'The fixture sees noise and behaves unpredictably'],
        ['Audio cable used as a DMX line', '50 Ω cable where 110 Ω belongs; works short, fails long'],
        ['Phantom power onto a DMX line', '48 V into a driver chip expecting 5 V'],
      ];
      rows.forEach(([a, b], k) => {
        const y = my + 52 + k * 19;
        label(g, mates ? '✕' : '—', pad + 4, y, {
          color: mates ? R.fault : p.muted, size: 12, weight: 700, align: 'center',
        });
        label(g, a, pad + 18, y, { color: mates ? p.ink : p.muted, size: 10.5, weight: 600, max: w * 0.4 });
        label(g, b, pad + Math.max(w * 0.44, 160), y, {
          color: p.muted, size: 10, max: w - pad - Math.max(w * 0.44, 160),
        });
      });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// Class 4: soldering
// ---------------------------------------------------------------------------

register('solder-heat', (host) => {
  let tipTemp = 350;
  let dwell = 3;

  const { controls, stage, setNote, challenge } = figure(host, {
    title: 'Three things at once: clean, hot enough, briefly',
    sub: 'Set the tip and how long you hold it. The joint needs to reach temperature; the connector needs not to.',
    note: '',
  });

  // The joint's temperature rises toward the tip; the plastic behind it lags.
  const jointT = () => 22 + (tipTemp - 22) * (1 - Math.exp(-dwell / 1.4));
  const plasticT = () => 22 + (tipTemp - 22) * (1 - Math.exp(-dwell / 6.5)) * 0.85;

  const upd = () => {
    const j = jointT(), pl = plasticT();
    const melts = j > 183;
    const damage = pl > 105;
    setNote(!melts
      ? `The joint has only reached ${Math.round(j)} °C, below solder's 183 °C melting point. The solder will ball up rather than wet the surface. <b>This is a dry joint, and it looks finished from above.</b>`
      : damage
        ? `The joint is at ${Math.round(j)} °C, which is fine, but the connector's insulator has reached ${Math.round(pl)} °C and is softening. <b>The pin will move, and the joint will fail in a month rather than now, which is much worse.</b>`
        : `The joint reaches ${Math.round(j)} °C and the insulator stays at ${Math.round(pl)} °C. <b>A hotter iron for a shorter time damages less than a cool iron for a long time, which is the opposite of what beginners assume.</b>`);
    cv.once();
  };

  controls.append(slider('Tip temperature', {
    min: 200, max: 450, step: 5, value: 350, fmt: (v) => `${v} °C`,
    on: (v) => { tipTemp = v; upd(); },
  }).node);
  controls.append(slider('Time on the joint', {
    min: 0.5, max: 12, step: 0.5, value: 3, fmt: (v) => `${v} s`,
    on: (v) => { dwell = v; upd(); },
  }).node);

  challenge('Melt the solder without the insulator passing 105 °C.',
    () => jointT() > 183 && plasticT() < 105);

  const cv = canvas(stage, {
    height: 250, animated: false,
    draw(g, w) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const j = jointT(), pl = plasticT();
      const cy = 66;

      // The iron and the joint.
      const tx = pad + 30;
      g.fillStyle = alpha(R.fault, 0.25 + (tipTemp - 200) / 500);
      g.beginPath();
      g.moveTo(tx, cy - 8); g.lineTo(tx + 40, cy - 3);
      g.lineTo(tx + 40, cy + 3); g.lineTo(tx, cy + 8);
      g.closePath();
      g.fill();
      g.fillStyle = p.raised;
      g.fillRect(tx - 46, cy - 9, 48, 18);
      label(g, `${tipTemp} °C`, tx - 22, cy, { color: p.ink2, size: 10, align: 'center', weight: 600 });

      // The joint, coloured by its temperature.
      const jx = tx + 56;
      const jHot = Math.min(1, (j - 22) / 330);
      g.fillStyle = alpha(R.energy, 0.15 + jHot * 0.75);
      g.beginPath();
      g.arc(jx, cy, 12, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = j > 183 ? R.safe : R.fault;
      g.lineWidth = 2;
      g.stroke();
      label(g, `${Math.round(j)} °C`, jx, cy - 24, {
        color: j > 183 ? R.safe : R.fault, size: 11, align: 'center', weight: 700,
      });
      label(g, j > 183 ? 'solder wets' : 'balls up', jx, cy + 26, {
        color: j > 183 ? R.safe : R.fault, size: 10, align: 'center',
      });

      // The connector body behind it.
      const px = jx + 40;
      box(g, px, cy - 20, 70, 40, {
        fill: alpha(pl > 105 ? R.fault : p.muted, 0.15 + Math.min(0.5, (pl - 22) / 200)),
        stroke: pl > 105 ? R.fault : p.line, r: 5,
      });
      label(g, `${Math.round(pl)} °C`, px + 35, cy - 4, {
        color: pl > 105 ? R.fault : p.ink2, size: 11, align: 'center', weight: 700,
      });
      label(g, pl > 105 ? 'softening' : 'insulator', px + 35, cy + 10, {
        color: pl > 105 ? R.fault : p.muted, size: 9.5, align: 'center',
      });

      // The three thresholds, as a bar.
      const bT = 128, bH = 22, bL = pad, bW = w - pad * 2;
      const Tmax = 460;
      box(g, bL, bT, bW, bH, { fill: p.raised, stroke: p.line, r: 5 });
      for (const [temp, name, col] of [
        [105, 'insulator softens', R.fault],
        [183, 'leaded solder melts', R.safe],
        [220, 'lead-free melts', R.signal],
      ]) {
        const x = bL + (temp / Tmax) * bW;
        line(g, x, bT - 6, x, bT + bH + 4, { color: col, lw: 1.5, dash: [3, 3] });
        label(g, `${temp} °C ${name}`, x + 4, bT - 12, { color: col, size: 9, max: bW - (x - bL) });
      }
      const jx2 = bL + (Math.min(j, Tmax) / Tmax) * bW;
      g.fillStyle = R.energy;
      g.fillRect(bL + 1, bT + 1, jx2 - bL - 1, bH - 2);
      label(g, 'joint temperature', bL + 6, bT + bH / 2, { color: p.ground, size: 10, weight: 700 });

      labelWrap(g, 'Clean metal, enough heat in the right place, and a short time. Every soldering failure is one of those three, and naming which one is what turns a knack into a skill.',
        pad, bT + bH + 24, { color: p.ink2, size: 11.5, max: bW, maxLines: 3 });
    },
  });
  upd();
});

register('joint-quality', (host) => compare(host, {
  title: 'What each failure looks like, and when it bites',
  sub: 'Six joints. Five of them are wrong, and three of those work perfectly on the bench.',
  fields: [
    { label: 'Appearance', key: 'look' },
    { label: 'Cause', key: 'cause' },
    { label: 'On the bench', key: 'bench' },
    { label: 'In a show', key: 'show', tone: 'fault' },
  ],
  items: [
    {
      name: 'Good joint', short: 'Good', tone: 'safe',
      line: 'Shiny, concave, smooth, and you can see the outline of the wire through it.',
      look: 'A smooth fillet that runs up onto both parts', cause: 'Clean metal, correct heat, undisturbed cooling',
      bench: 'Under 0.05 Ω, stable on flex', show: 'Nothing. This is the point',
      note: 'Shape matters more than shine. <b>A good joint is concave and shows the wire through it; a blob that hides the wire may be shiny and still be unwetted underneath.</b>',
    },
    {
      name: 'Cold joint', short: 'Cold', tone: 'fault',
      line: 'The one that costs a technical rehearsal.',
      look: 'Dull, grainy, slightly lumpy', cause: 'Not enough heat, or the joint moved while cooling',
      bench: 'Often measures perfectly at rest', show: 'Intermittent, worse when warm, gone when you test it',
      watch: 'This is the fault that a static continuity test cannot find. It measures fine still and opens on flex, which is exactly why the flex test exists.',
    },
    {
      name: 'Dry joint', short: 'Dry', tone: 'fault',
      line: 'Solder present, bond absent.',
      look: 'Solder balled up on the surface, not flowed onto it', cause: 'Oxide, no flux, or a dirty surface',
      bench: 'May read open, may read fine', show: 'Fails under vibration, often on the get-out',
    },
    {
      name: 'Too much solder', short: 'Excess', tone: 'energy',
      line: 'The joint you cannot inspect.',
      look: 'A round blob hiding the wire entirely', cause: 'Feeding solder onto the iron rather than heating the joint',
      bench: 'Reads fine', show: 'Hides whatever is underneath, and cracks under vibration from its own mass',
      note: 'More solder is not more strength. <b>The mechanical strength should come from the mechanical fixing; the alloy is there to conduct.</b>',
    },
    {
      name: 'Bridge', short: 'Bridge', tone: 'fault',
      line: 'The only one that announces itself.',
      look: 'Two pads or pins joined by a fillet', cause: 'Too much solder, or a tip too broad for the pitch',
      bench: 'Dead short, immediately obvious', show: 'Rarely reaches a show, because it fails at first power-up',
      note: 'Visible from one angle and invisible from another, which is why you inspect the underside at a low angle with light behind it. <b>The one failure on this list that is honest with you.</b>',
    },
    {
      name: 'Overheated', short: 'Cooked', tone: 'fault',
      line: 'The joint is fine. Everything around it is not.',
      look: 'Brown flux, a lifted pad, insulation shrunk back from the joint',
      cause: 'Too long on the joint, or a cool iron used for too long',
      bench: 'Reads fine', show: 'The pin has moved in the connector, so it fails weeks later',
      watch: 'Insulation shrunk back leaves bare strands near the shell. That is a short waiting for the first knock, and it is invisible once the boot is on.',
    },
  ],
  footer: 'Three of these six measure perfectly on a bench. That is the argument for visual inspection and the flex test, both of which take seconds.',
}));

register('strain-relief', (host) => {
  let clamped = true;
  let cycles = 0;

  const { controls, stage, setNote } = figure(host, {
    title: 'Where a cable actually breaks',
    sub: 'Flex it repeatedly. The failure is always at the point where the bending is concentrated.',
    note: '',
  });

  const upd = () => {
    setNote(clamped
      ? 'With the clamp on the outer jacket, the flexing is spread over the boot and the conductors inside barely move. <b>The clamp must grip the jacket, never the conductors: if strain reaches the joint, the solder is the strain relief, and solder is brittle.</b>'
      : 'With no clamp, every flex lands on the solder joint. The copper work-hardens at that one point, a strand breaks, the rest carry the same current in less metal, and the resistance climbs. <b>The intermittent phase before it goes fully open is where the money is lost, because it fails in performance and passes on the bench.</b>');
    cycles = 0;
    cv.reset();
  };

  controls.append(toggle('Strain relief clamped on the jacket', { value: true, on: (v) => { clamped = v; upd(); } }).node);

  const cv = canvas(stage, {
    height: 250,
    draw(g, w, h, t) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const cy = 70;
      const cx = pad + 90;
      const bend = Math.sin(t * 2.2);
      cycles = Math.floor(t * 2.2 / Math.PI);
      // Damage accumulates only where the flex actually lands.
      const damage = clamped ? Math.min(0.12, cycles / 900) : Math.min(1, cycles / 26);

      box(g, pad, cy - 22, 74, 44, { fill: p.raised, stroke: p.line, r: 5 });
      label(g, 'connector', pad + 37, cy - 32, { color: p.muted, size: 9.5, align: 'center' });

      // The cable, bending at the boot or at the joint.
      const pivotX = clamped ? cx + 26 : cx - 6;
      g.strokeStyle = p.ink2;
      g.lineWidth = 6;
      g.beginPath();
      g.moveTo(cx - 16, cy);
      g.lineTo(pivotX, cy);
      g.quadraticCurveTo(pivotX + 50, cy + bend * 26, w - pad, cy + bend * 40);
      g.stroke();

      if (clamped) {
        box(g, cx + 12, cy - 13, 28, 26, { fill: alpha(R.safe, 0.25), stroke: R.safe, r: 4 });
        label(g, 'clamp on the jacket', cx + 26, cy + 30, { color: R.safe, size: 9.5, align: 'center', max: 150 });
      }

      // The joint, and its accumulated damage.
      const jx = cx - 10;
      g.fillStyle = alpha(damage > 0.5 ? R.fault : R.energy, 0.5 + damage * 0.5);
      g.beginPath();
      g.arc(jx, cy, 8, 0, Math.PI * 2);
      g.fill();
      if (damage > 0.35) {
        g.strokeStyle = R.fault;
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(jx - 5, cy - 6);
        g.lineTo(jx + 4, cy + 6);
        g.stroke();
      }
      label(g, 'solder joint', jx, cy - 22, {
        color: damage > 0.35 ? R.fault : p.muted, size: 9.5, align: 'center',
      });

      const by = 128;
      label(g, `Flex cycles  ${cycles}`, pad, by, { color: p.ink2, size: 11.5, mono: true });
      const st = damage < 0.2 ? ['sound', R.safe]
        : damage < 0.6 ? ['strands failing, resistance climbing', R.energy]
          : ['intermittent — passes on the bench, fails on stage', R.fault];
      label(g, `Condition    ${st[0]}`, pad, by + 18, { color: st[1], size: 11.5, mono: true, weight: 600, max: w - pad * 2 });
      box(g, pad, by + 32, w - pad * 2, 12, { fill: p.raised, stroke: p.line, r: 4 });
      g.fillStyle = st[1];
      g.fillRect(pad + 1, by + 33, (w - pad * 2 - 2) * damage, 10);

      labelWrap(g, 'A cable fails where the flexing is concentrated. Everything in cable-making is about spreading that flex out or moving it somewhere the conductor is not.',
        pad, by + 58, { color: p.muted, size: 11, max: w - pad * 2, maxLines: 3 });
    },
  });
  upd();
});

register('xlr-terminate', (host) => chain(host, {
  title: 'Terminating an XLR, in the order that works',
  sub: 'Half the errors in this class are in the first step.',
  tag: 'Step', accent: 'signal',
  stages: [
    {
      name: 'Shell on first',
      body: 'Put the shell and the boot onto the cable before you do anything else. Then check they are the right way round.',
      why: 'Everybody forgets this once, and unsoldering three joints to slide a boot on teaches it far better than being told.',
      note: 'It sounds trivial. <b>It is the single most common mistake in this class and it costs fifteen minutes each time.</b>',
    },
    {
      name: 'Strip 25 mm',
      body: 'Strip about 25 mm of the outer jacket with strippers, not a knife. Do not nick the conductors.',
      why: 'A nicked strand is a cable that fails in week six, at the connector, during a performance. This is the cheapest failure in the course to prevent.',
      note: 'Strippers, not a knife. <b>A nick you cannot see is a stress concentration that will break, and it will break at the worst point of the cable.</b>',
    },
    {
      name: 'Prepare the screen',
      body: 'Separate the screen, twist it into a single conductor, and sleeve it so it cannot escape and touch a pin.',
      why: 'A stray strand of screen touching pin 2 is the fault that makes an audio cable hum and a DMX line drop out, and it is invisible once the shell is on.',
      note: 'The stray screen strand is the second most common fault in a hand-made cable. <b>Sleeving it costs five seconds and removes the possibility entirely.</b>',
    },
    {
      name: 'Tin lightly',
      body: 'Tin all three conductors just enough to hold the strands together. Not so much that they become stiff rods.',
      why: 'Over-tinned wire will not fit the cup and does not compress, so it works loose under vibration.',
    },
    {
      name: 'Solder the cups',
      body: 'Pin 1 screen, pin 2 hot, pin 3 cold. Hold the connector in a vice. Heat the cup and the wire together, feed solder into the joint.',
      why: 'Holding the work by hand means the joint moves while it cools, which is exactly how a cold joint is made.',
      note: 'Pin 1 screen, pin 2 hot, pin 3 cold. <b>For DMX on 5-pin it is pin 1 screen, pin 2 data minus, pin 3 data plus, and pins 4 and 5 are left alone.</b>',
    },
    {
      name: 'Inspect and clamp',
      body: 'Check no strand has escaped. Seat the insert, then tighten the clamp onto the outer jacket, never onto the conductors.',
      why: 'If the strain reaches the solder joints, the joints are the strain relief, and solder is brittle.',
    },
    {
      name: 'Test all five steps',
      body: 'Continuity pin to pin, isolation pin to pin, isolation to shell, the flex test, and a label with the date and your initials.',
      why: 'A cable you made and did not test is not finished. A cable that has passed and is not labelled will be tested again next week by somebody else.',
      note: 'The flex test and the pin-to-pin isolation test are the two that get skipped. <b>They are also the two that find the faults that waste a technical rehearsal.</b>',
    },
  ],
  footer: 'The clamp grips the jacket. The joints carry no strain. Every other rule in cable-making follows from those two sentences.',
}));

register('rj45-order', (host) => {
  let split = false;
  let untwist = 10;

  const { controls, stage, setNote, challenge } = figure(host, {
    title: 'T568B, split pairs, and the twist you just undid',
    sub: 'A cable that passes a continuity test and fails at speed.',
    note: '',
  });

  const upd = () => {
    setNote(split
      ? 'Pins 3 and 6 are one pair. Split across two pairs, the cable still passes a continuity test on every pin, and it will still link. <b>It drops packets under load over any distance, which presents as an intermittent software fault and is one of the hardest things in this course to diagnose.</b>'
      : untwist > 13
        ? `Untwisting ${untwist} mm at the plug undoes a surprising amount of the interference rejection. <b>Keep it under 13 mm: the twist is not decoration, it is the entire mechanism by which the pair rejects noise.</b>`
        : `Correct: pairs kept together, untwist held to ${untwist} mm. <b>The pins are not in numerical pair order, and pins 3 and 6 being one pair is the detail that catches everybody.</b>`);
    cv.once();
  };

  controls.append(toggle('Split the 3/6 pair', { value: false, on: (v) => { split = v; upd(); } }).node);
  controls.append(slider('Untwist at the plug', {
    min: 3, max: 35, step: 1, value: 10, fmt: (v) => `${v} mm`,
    on: (v) => { untwist = v; upd(); },
  }).node);

  challenge('Get a cable that is correct at gigabit: pairs intact and untwist under 13 mm.',
    () => !split && untwist <= 13);

  const cv = canvas(stage, {
    height: 260, animated: false,
    draw(g, w) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const WIRES = [
        ['orange-white', '#e0a060', 1], ['orange', '#d4762a', 1],
        ['green-white', '#7fbf8a', 2], ['blue', '#3a6fc4', 3],
        ['blue-white', '#8ab0e0', 3], ['green', '#3f9d5c', 2],
        ['brown-white', '#b09070', 4], ['brown', '#7a5230', 4],
      ];
      const plugX = w - 84;
      const rowH = 22;
      const T = 22;

      box(g, plugX, T - 6, 62, rowH * 8 + 12, { fill: p.raised, stroke: p.line, r: 5 });
      label(g, 'RJ45 plug', plugX + 31, T - 14, { color: p.muted, size: 9.5, align: 'center' });

      WIRES.forEach(([name, hex, pair], k) => {
        const y = T + k * rowH + rowH / 2;
        // With the pair split, pins 3 and 6 take their signal from wires that
        // are not twisted together. Drawn as a crossing, which is what it is.
        const isSplit = split && (k === 2 || k === 5);
        g.strokeStyle = hex;
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(pad + 90, y);
        if (isSplit) {
          const other = k === 2 ? T + 3 * rowH + rowH / 2 : T + 4 * rowH + rowH / 2;
          g.quadraticCurveTo(plugX - 40, (y + other) / 2, plugX, other);
        } else {
          g.lineTo(plugX, y);
        }
        g.stroke();
        label(g, `${k + 1}`, plugX - 8, y, { color: p.muted, size: 9.5, align: 'right' });
        label(g, name, pad, y, { color: p.ink2, size: 10.5, max: 86 });
        // The pair bracket, on the left, so the pairing is visible.
        if (k % 2 === 0 || pair === 2 || pair === 3) {
          g.fillStyle = alpha([R.energy, R.safe, R.signal, p.muted][pair - 1], 0.5);
          g.fillRect(pad + 92, y - 8, 3, 16);
        }
      });

      // The twist region.
      const tw = Math.min(60, untwist * 1.8);
      g.fillStyle = alpha(untwist > 13 ? R.fault : R.safe, 0.12);
      g.fillRect(plugX - tw, T - 6, tw, rowH * 8 + 12);
      label(g, `${untwist} mm untwisted`, plugX - tw - 4, T + rowH * 8 + 18, {
        color: untwist > 13 ? R.fault : R.safe, size: 10, align: 'right', weight: 600,
      });

      const by = T + rowH * 8 + 30;
      const conOk = true;
      const speedOk = !split && untwist <= 13;
      [['Continuity test', conOk, conOk ? 'passes on every pin' : 'fails'],
        ['Link comes up', !split || true, split ? 'yes, and that is the problem' : 'yes'],
        ['Gigabit over 50 m', speedOk, speedOk ? 'reliable' : split ? 'drops packets under load' : 'marginal, degrades with length']]
        .forEach(([n, ok, txt], k) => {
          const y = by + k * 18;
          label(g, ok ? '✓' : '✕', pad, y, { color: ok ? R.safe : R.fault, size: 12, weight: 700 });
          label(g, n, pad + 16, y, { color: p.ink2, size: 10.5, max: w * 0.34 });
          label(g, txt, pad + Math.max(w * 0.38, 140), y, {
            color: ok ? p.muted : R.fault, size: 10.5, max: w - pad - Math.max(w * 0.38, 140),
          });
        });
    },
  });
  upd();
});
