// Classes 7 and 8: levels, impedance, balanced lines, the ground loop, and the
// instrument that finally shows you time.

import { register } from './anim-core.js';
import {
  figure, canvas, slider, toggle, choice, label, labelWrap, box, line, palette,
  alpha, fitter, compare, chain, ladder, plot, role, eng, sig,
  arrow, resistorSym, supplySym, groundSym, readoutChip,
} from './anim-kit.js';

// ---------------------------------------------------------------------------
// The level ladder
// ---------------------------------------------------------------------------

register('level-ladder', (host) => ladder(host, {
  title: 'Four levels, three orders of magnitude apart',
  sub: 'Drag through the range and see what belongs where. Most connection problems are a level mismatch somebody solved with a volume knob.',
  note: 'The gap between a microphone and a line output is a factor of a thousand or more. <b>That is why a microphone into a line input is inaudible and a line output into a microphone input distorts horribly: the same mistake in opposite directions.</b>',
  unit: 'V', min: 3e-4, max: 100, start: 1.23,
  sliderLabel: 'Signal level',
  fmt: (v) => (v < 0.1 ? `${sig(v * 1000)} mV` : `${sig(v)} V`),
  bands: [
    { from: 3e-4, to: 0.06, name: 'Microphone level', tone: 'signal', what: '1 to 50 mV. Source 150–600 Ω into a 1.5–3 kΩ preamp. Needs 40 to 60 dB of gain before anything else happens to it' },
    { from: 0.06, to: 0.5, name: 'Instrument and consumer line', tone: 'signal', what: '−10 dBV is 0.316 V. Laptops, playback devices, guitars into a DI. High source impedance is what makes the DI necessary' },
    { from: 0.5, to: 8, name: 'Professional line level', tone: 'safe', what: '+4 dBu is 1.23 V. Console to amplifier, source under 100 Ω into 10 kΩ or more. The level everything in a rack expects' },
    { from: 8, to: 200, name: 'Loudspeaker level', tone: 'energy', what: '10 to 100 V into 4 to 16 Ω. The only place in audio where impedances are genuinely matched, because here you do want power transfer' },
  ],
  readout: (v, b) => `${v < 0.1 ? `${sig(v * 1000)} mV` : `${sig(v)} V`} is ${b.name.toLowerCase()}. <b>${b.what}.</b>`,
  footer: '6 dB is a factor of two in voltage and 20 dB is a factor of ten. With those two numbers you can do most level arithmetic in your head.',
}));

// ---------------------------------------------------------------------------
// Bridging against matching
// ---------------------------------------------------------------------------

register('impedance-bridge', (host) => {
  let Zl = 10000;
  const Zs = 100, Vs = 1.23;

  const { controls, stage, setNote, challenge } = figure(host, {
    title: 'Bridging, not matching',
    sub: 'A 100 Ω source. Drag the load impedance down through the matched point and watch what you lose.',
    note: '',
  });

  const vout = () => Vs * (Zl / (Zs + Zl));
  const pout = () => (vout() ** 2) / Zl;

  const upd = () => {
    const v = vout();
    const ratio = Zl / Zs;
    setNote(Math.abs(ratio - 1) < 0.15
      ? `Matched: source and load both 100 Ω. Power transfer is at its maximum and you have lost exactly half the voltage, ${sig(v)} V of ${Vs} V. <b>This is what impedance matching costs, and it is why modern audio does not do it.</b>`
      : ratio >= 10
        ? `Bridged at ${sig(ratio)} to one. The load gets ${sig(v)} V of the ${Vs} V available, which is nearly all of it. <b>Information in audio is carried by voltage, so this is the arrangement you want everywhere except loudspeakers and radio frequency.</b>`
        : `A ratio of ${sig(ratio)} to one is too low. You are losing ${sig((1 - v / Vs) * 100)} per cent of the signal voltage in the source impedance. <b>The rule is a load at least ten times the source, and dropping below it is how splitting one output to forty inputs goes wrong.</b>`);
    cv.once();
  };

  controls.append(slider('Load impedance', {
    min: 0, max: 40, step: 1, value: 20, fmt: (k) => eng(10 ** (1 + k / 10), 'Ω'),
    on: (k) => { Zl = 10 ** (1 + k / 10); upd(); },
  }).node);
  Zl = 10 ** (1 + 20 / 10);

  challenge('Find the load impedance that loses exactly half the voltage.', () => Math.abs(Zl / Zs - 1) < 0.15);

  const cv = canvas(stage, {
    height: 280, animated: false,
    draw(g, w) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const v = vout();
      const P = pout();
      const Pmax = (Vs ** 2) / (4 * Zs);

      // The circuit.
      const T = 24, bh = 66;
      const L = pad + 34;
      supplySym(g, L, T + bh / 2, 22, R.signal, 2);
      label(g, '1.23 V', L, T + bh / 2 + 24, { color: R.signal, size: 9.5, align: 'center' });
      line(g, L, T + bh / 2 - 11, L, T, { color: p.muted, lw: 1.5 });
      line(g, L, T, L + 130, T, { color: p.muted, lw: 1.5 });
      line(g, L, T + bh / 2 + 11, L, T + bh, { color: p.muted, lw: 1.5 });
      line(g, L, T + bh, L + 130, T + bh, { color: p.muted, lw: 1.5 });
      line(g, L + 130, T, L + 130, T + bh, { color: p.muted, lw: 1.5 });
      g.fillStyle = p.surface;
      g.fillRect(L + 24, T - 4, 52, 8);
      resistorSym(g, L + 26, T, 48, 13, p.muted, 2);
      label(g, '100 Ω source', L + 50, T - 14, { color: p.muted, size: 9.5, align: 'center' });
      g.save();
      g.translate(L + 130, T + bh / 2);
      g.rotate(Math.PI / 2);
      resistorSym(g, -20, 0, 40, 13, R.safe, 2.2);
      g.restore();
      label(g, eng(Zl, 'Ω'), L + 144, T + bh / 2, { color: R.safe, size: 11, weight: 700 });
      label(g, 'load', L + 144, T + bh / 2 + 15, { color: p.muted, size: 9.5 });

      const rx = Math.max(L + 210, w - 128);
      if (w - rx > 100) {
        readoutChip(g, rx, T - 6, 'VOLTAGE AT THE LOAD', `${sig(v)} V`, {
          color: v > Vs * 0.8 ? R.safe : R.fault, p, w: Math.min(116, w - rx - 8),
        });
        readoutChip(g, rx, T + 38, 'RATIO, LOAD TO SOURCE', `${sig(Zl / Zs)} : 1`, {
          color: Zl / Zs >= 10 ? R.safe : R.fault, p, w: Math.min(116, w - rx - 8),
        });
      }

      // The two curves, on one axis, which is the whole argument.
      const gL = 42, gT = T + bh + 34, gW = w - gL - pad, gH = 96;
      line(g, gL, gT + gH, gL + gW, gT + gH, { color: p.muted, lw: 1.5 });
      line(g, gL, gT, gL, gT + gH, { color: p.muted, lw: 1.5 });
      const X = (z) => gL + ((Math.log10(z) - 1) / 4) * gW;

      g.strokeStyle = R.safe;
      g.lineWidth = 2.5;
      g.beginPath();
      for (let k = 0; k <= 160; k++) {
        const z = 10 ** (1 + (k / 160) * 4);
        const y = gT + gH - (Vs * (z / (Zs + z))) / Vs * gH;
        k ? g.lineTo(X(z), y) : g.moveTo(X(z), y);
      }
      g.stroke();
      label(g, 'voltage transferred', gL + gW - 6, gT + 10, {
        color: R.safe, size: 10, align: 'right', weight: 600,
      });

      g.strokeStyle = R.energy;
      g.lineWidth = 2;
      g.setLineDash([5, 4]);
      g.beginPath();
      for (let k = 0; k <= 160; k++) {
        const z = 10 ** (1 + (k / 160) * 4);
        const vv = Vs * (z / (Zs + z));
        const pp = (vv ** 2) / z;
        k ? g.lineTo(X(z), gT + gH - (pp / Pmax) * gH) : g.moveTo(X(z), gT + gH - (pp / Pmax) * gH);
      }
      g.stroke();
      g.setLineDash([]);
      label(g, 'power transferred', gL + gW - 6, gT + gH - 28, {
        color: R.energy, size: 10, align: 'right', weight: 600,
      });

      line(g, X(Zs), gT, X(Zs), gT + gH, { color: alpha(p.muted, 0.7), lw: 1, dash: [3, 3] });
      label(g, 'matched', X(Zs), gT - 6, { color: p.muted, size: 9, align: 'center' });
      line(g, X(Zs * 10), gT, X(Zs * 10), gT + gH, { color: alpha(R.safe, 0.5), lw: 1, dash: [3, 3] });
      label(g, '10:1 bridged', X(Zs * 10), gT - 6, { color: R.safe, size: 9, align: 'center' });

      const cx = X(Zl);
      g.fillStyle = p.ink;
      g.beginPath();
      g.arc(cx, gT + gH - (v / Vs) * gH, 4.5, 0, Math.PI * 2);
      g.fill();
      for (const [z, t2] of [[10, '10 Ω'], [1e3, '1 kΩ'], [1e5, '100 kΩ']]) {
        label(g, t2, X(z), gT + gH + 13, { color: p.muted, size: 9, align: 'center' });
      }
      label(g, 'Peak power transfer is where you lose half the voltage. Audio wants voltage, so it is not where you work.',
        gL, gT + gH + 30, { color: p.muted, size: 10.5, max: gW });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// Cable capacitance
// ---------------------------------------------------------------------------

register('cable-capacitance', (host) => {
  let metres = 20;
  let Zs = 50000;

  const { controls, stage, setNote, challenge } = figure(host, {
    title: 'Why a long unbalanced instrument cable sounds dull',
    sub: 'Cable capacitance and source impedance make a low-pass filter you did not design.',
    note: '',
  });

  const C = () => metres * 100e-12;
  const fc = () => 1 / (2 * Math.PI * Zs * C());

  const upd = () => {
    const f = fc();
    setNote(f > 30000
      ? `${metres} m from a ${eng(Zs, 'Ω')} source rolls off at ${eng(f, 'Hz')}, far above anything you can hear. <b>From a low-impedance source, cable length in a theatre is simply not an audio problem.</b>`
      : `${metres} m of cable is ${eng(C(), 'F')}, and with a ${eng(Zs, 'Ω')} source the corner is at ${eng(f, 'Hz')}. <b>That is inside the audio band, which is the entire technical explanation for why a long guitar cable sounds dull, and why a DI box at the instrument fixes it.</b>`);
    cv.once();
  };

  controls.append(slider('Cable length', {
    min: 1, max: 60, step: 1, value: 20, fmt: (v) => `${v} m`,
    on: (v) => { metres = v; upd(); },
  }).node);
  controls.append(choice('Source', [
    [50000, 'Guitar pickup, 50 kΩ'], [10000, 'Unbuffered, 10 kΩ'], [100, 'Console output, 100 Ω'],
  ], { value: 50000, on: (v) => { Zs = +v; upd(); } }).node);

  challenge('Find a combination that keeps the roll-off above 20 kHz.', () => fc() > 20000);

  const cv = canvas(stage, {
    height: 260, animated: false,
    draw(g, w) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const f = fc();

      // The cable, with the distributed capacitance drawn.
      const cy = 44;
      const x0 = pad + 20, x1 = w - pad - 20;
      line(g, x0, cy, x1, cy, { color: R.signal, lw: 2.5 });
      const n = Math.max(3, Math.min(9, Math.round(metres / 6)));
      for (let k = 0; k < n; k++) {
        const x = x0 + 26 + k * ((x1 - x0 - 52) / Math.max(1, n - 1));
        line(g, x, cy, x, cy + 10, { color: alpha(R.energy, 0.7), lw: 1.2 });
        line(g, x - 5, cy + 10, x + 5, cy + 10, { color: R.energy, lw: 2 });
        line(g, x - 5, cy + 15, x + 5, cy + 15, { color: R.energy, lw: 2 });
        line(g, x, cy + 15, x, cy + 24, { color: alpha(R.energy, 0.7), lw: 1.2 });
        groundSym(g, x, cy + 26, alpha(p.muted, 0.6), 1.2);
      }
      label(g, `${metres} m · about ${eng(C(), 'F')} of cable capacitance`, x0, cy - 16, {
        color: p.ink2, size: 10.5, max: x1 - x0,
      });
      resistorSym(g, x0 - 4, cy, 26, 11, p.muted, 2);
      label(g, eng(Zs, 'Ω'), x0 - 4, cy - 30, { color: p.muted, size: 9.5 });

      // The frequency response.
      const gL = 44, gT = 104, gW = w - gL - pad, gH = 96;
      line(g, gL, gT + gH, gL + gW, gT + gH, { color: p.muted, lw: 1.5 });
      line(g, gL, gT, gL, gT + gH, { color: p.muted, lw: 1.5 });
      const X = (hz) => gL + ((Math.log10(hz) - 1) / 4) * gW;   // 10 Hz to 100 kHz
      const Y = (db) => gT + (Math.max(-24, Math.min(3, -db)) / 27) * gH + gH * (3 / 27) * 0;

      for (const [hz, t2] of [[20, '20'], [100, '100'], [1000, '1k'], [10000, '10k'], [20000, '20k']]) {
        line(g, X(hz), gT, X(hz), gT + gH, { color: alpha(p.line, 0.7), lw: 1 });
        label(g, t2, X(hz), gT + gH + 13, { color: p.muted, size: 9, align: 'center' });
      }
      for (const db of [0, -3, -12, -24]) {
        const y = gT + ((0 - db) / 27) * gH;
        line(g, gL, y, gL + gW, y, { color: alpha(p.line, db === -3 ? 1 : 0.6), lw: 1, dash: db === -3 ? [4, 3] : null });
        label(g, `${db}`, gL - 6, y, { color: db === -3 ? R.energy : p.muted, size: 9, align: 'right', mono: true });
      }
      label(g, 'dB', gL - 6, gT - 6, { color: p.muted, size: 9, align: 'right' });
      label(g, 'Hz', gL + gW, gT + gH + 26, { color: p.muted, size: 9.5, align: 'right' });

      g.strokeStyle = f < 20000 ? R.fault : R.safe;
      g.lineWidth = 2.5;
      g.beginPath();
      for (let k = 0; k <= 200; k++) {
        const hz = 10 ** (1 + (k / 200) * 4);
        const db = -10 * Math.log10(1 + (hz / f) ** 2);
        const y = gT + ((0 - db) / 27) * gH;
        k ? g.lineTo(X(hz), Math.min(y, gT + gH)) : g.moveTo(X(hz), Math.min(y, gT + gH));
      }
      g.stroke();

      if (f < 1e5) {
        line(g, X(f), gT, X(f), gT + gH, { color: alpha(R.energy, 0.7), lw: 1.5, dash: [4, 3] });
        label(g, `−3 dB at ${eng(f, 'Hz')}`, X(f) + 5, gT + 12, {
          color: R.energy, size: 10.5, weight: 700, max: gL + gW - X(f) - 8,
        });
      }
      const at10k = -10 * Math.log10(1 + (10000 / f) ** 2);
      label(g, `At 10 kHz you are ${sig(Math.abs(at10k))} dB down`, gL, gT + gH + 30, {
        color: at10k < -1 ? R.fault : p.muted, size: 11, weight: at10k < -1 ? 700 : 500, max: gW,
      });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// Balanced lines
// ---------------------------------------------------------------------------

register('balanced', (host) => {
  let balanced = true;
  let noise = 40;

  const { controls, stage, setNote, challenge } = figure(host, {
    title: 'Where the cancellation actually happens',
    sub: 'Inject interference onto the cable. Then unbalance the receiver and inject the same interference.',
    note: '',
  });

  const upd = () => {
    setNote(balanced
      ? `Interference arrives on both conductors nearly equally, because they run together and are twisted. The receiver subtracts, so the signal doubles and the interference cancels: ${noise > 5 ? `${noise} units in, under one unit out.` : 'nothing to cancel yet, raise the interference.'} <b>The measure of this is common-mode rejection ratio, 60 to 90 dB on a good input, which is a factor of a thousand to thirty thousand.</b>`
      : 'Unbalanced: one signal conductor, and the screen doing double duty as the return path. Everything the cable picks up adds directly to the signal, and there is no second conductor to subtract it from. <b>Balanced is a property of the receiver, not of the cable, which is why a balanced cable into an unbalanced input gets you almost nothing.</b>');
    cv.once();
  };

  controls.append(toggle('Balanced receiver', { value: true, on: (v) => { balanced = v; upd(); } }).node);
  controls.append(slider('Interference', {
    min: 0, max: 100, step: 5, value: 40, fmt: (v) => String(v),
    on: (v) => { noise = v; upd(); },
  }).node);

  challenge('Get a lot of interference onto the line and almost none at the output.',
    () => balanced && noise >= 60);

  const cv = canvas(stage, {
    height: 280,
    draw(g, w, h, t) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const x0 = pad + 66, x1 = w - pad - 90;
      const yH = 54, yC = 84;
      const sig1 = (u) => Math.sin(u * 7 - t * 3) * 18;
      const nz = (u) => (noise / 100) * Math.sin(u * 3.4 - t * 5.5) * 20;

      label(g, 'SOURCE', pad, 30, { color: p.muted, size: 9.5, weight: 700 });
      label(g, 'RECEIVER', x1 + 8, 30, { color: p.muted, size: 9.5, weight: 700 });

      // Hot conductor.
      g.strokeStyle = R.signal;
      g.lineWidth = 2;
      g.beginPath();
      for (let k = 0; k <= 140; k++) {
        const u = k / 140;
        const x = x0 + u * (x1 - x0);
        const y = yH - sig1(u) * 0.5 - nz(u) * 0.5;
        k ? g.lineTo(x, y) : g.moveTo(x, y);
      }
      g.stroke();
      label(g, 'hot  (signal + noise)', x0, yH - 26, { color: R.signal, size: 9.5 });

      if (balanced) {
        // Cold conductor: the inverted signal, with the SAME noise.
        g.strokeStyle = alpha(R.signal, 0.75);
        g.lineWidth = 2;
        g.beginPath();
        for (let k = 0; k <= 140; k++) {
          const u = k / 140;
          const x = x0 + u * (x1 - x0);
          const y = yC + sig1(u) * 0.5 - nz(u) * 0.5;
          k ? g.lineTo(x, y) : g.moveTo(x, y);
        }
        g.stroke();
        label(g, 'cold  (inverted signal + the same noise)', x0, yC + 26, { color: R.signal, size: 9.5, max: x1 - x0 });
      } else {
        line(g, x0, yC, x1, yC, { color: p.muted, lw: 2 });
        label(g, 'screen, doing double duty as the return', x0, yC + 26, { color: p.muted, size: 9.5, max: x1 - x0 });
      }

      // The interference arriving, drawn as arrows onto both conductors.
      if (noise > 5) {
        for (let k = 0; k < 4; k++) {
          const x = x0 + 30 + k * ((x1 - x0 - 60) / 3);
          arrow(g, x, 16, x, yH - 14, { color: alpha(R.fault, 0.55), lw: 1.5, head: 5 });
          if (balanced) arrow(g, x + 5, 16, x + 5, yC - 14, { color: alpha(R.fault, 0.35), lw: 1.5, head: 5 });
        }
        label(g, 'interference', (x0 + x1) / 2, 10, { color: R.fault, size: 9.5, align: 'center' });
      }

      // The receiver, and its output.
      const rx = x1 + 10;
      g.strokeStyle = p.ink2;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(rx, yH - 16); g.lineTo(rx + 34, (yH + yC) / 2); g.lineTo(rx, yC + 16);
      g.closePath();
      g.stroke();
      label(g, balanced ? '−' : '', rx + 6, (yH + yC) / 2, { color: p.ink2, size: 13, weight: 700 });

      // Output trace.
      const oy = 148;
      const gL = pad, gW = w - pad * 2, gH = 64;
      box(g, gL, oy, gW, gH, { fill: alpha(p.ground, 0.5), stroke: p.line, r: 6 });
      const mid = oy + gH / 2;
      g.strokeStyle = balanced ? R.safe : R.fault;
      g.lineWidth = 2;
      g.beginPath();
      for (let k = 0; k <= 200; k++) {
        const u = k / 200;
        const x = gL + u * gW;
        const v = balanced ? sig1(u) : sig1(u) * 0.5 + nz(u);
        k ? g.lineTo(x, mid - v) : g.moveTo(x, mid - v);
      }
      g.stroke();
      label(g, balanced ? 'output: signal doubled, interference cancelled' : 'output: signal plus everything the cable picked up',
        gL + 6, oy + 12, { color: balanced ? R.safe : R.fault, size: 10.5, weight: 600, max: gW - 12 });

      labelWrap(g, 'The screen in a balanced line carries no signal, which is exactly what lets you disconnect it at one end to break a ground loop without losing the audio.',
        pad, oy + gH + 18, { color: p.muted, size: 11, max: gW, maxLines: 2 });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// The ground loop
// ---------------------------------------------------------------------------

register('ground-loop', (host) => {
  let fix = 'none';

  const FIXES = {
    none: ['No fix, unbalanced', 0, 'Two chassis at slightly different potentials, joined by a screen that is also the signal return. The loop current appears in series with the signal.'],
    same: ['Same power source', 12, 'Both boxes fed from one distribution, so the potential difference between their earths is small. Helps, and does not remove the loop.'],
    bal: ['Balanced interconnect', 46, 'The loop current still flows in the screen, but the screen is not the signal return, so it does not appear at the output. This is the real fix.'],
    lift: ['Screen lifted at one end', 62, 'The loop is broken while the shielding remains. Label the cable, or somebody will use it as a normal one and wonder why it is noisy.'],
    xfmr: ['Transformer isolation', 78, 'No electrical path at all. The most reliable fix for a stubborn problem, and it costs some bandwidth and some money.'],
  };

  const { controls, stage, setNote } = figure(host, {
    title: 'Where the hum comes from, as a circuit',
    sub: 'Two working boxes, two earth paths, one loop. Apply the fixes and measure each one.',
    note: '',
  });

  const upd = () => {
    const [name, db, why] = FIXES[fix];
    setNote(fix === 'none'
      ? 'Two correctly working boxes. Their chassis are a few millivolts apart at 50 Hz because real conductors have resistance and other equipment draws current through them. The signal screen joins the two chassis and completes a loop. <b>The hum is not a fault in either box, it is a fault in the space between them.</b>'
      : `${name}: ${sig(db)} dB better. ${why} <b>${fix === 'bal' ? 'Everything else on this list is a workaround for not having done this.' : fix === 'lift' ? 'This is what a ground lift switch does, and it is safe because a balanced screen carries no signal.' : 'Measure it rather than assuming it, and record the number.'}</b>`);
    cv.once();
  };

  controls.append(choice('Fix', Object.entries(FIXES).map(([k, v]) => [k, v[0]]), {
    value: 'none', on: (v) => { fix = v; upd(); },
  }).node);

  const cv = canvas(stage, {
    height: 290,
    draw(g, w, h, t) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const [, db] = FIXES[fix];
      const hum = Math.max(0, 1 - db / 80);
      const aX = pad + 42, bX = w - pad - 82;
      const T = 30, bh = 46;

      box(g, aX - 34, T, 76, bh, { fill: p.raised, stroke: p.line, r: 6 });
      label(g, 'Box A', aX + 4, T + bh / 2, { color: p.ink2, size: 11, align: 'center', weight: 600 });
      box(g, bX, T, 76, bh, { fill: p.raised, stroke: p.line, r: 6 });
      label(g, 'Box B', bX + 38, T + bh / 2, { color: p.ink2, size: 11, align: 'center', weight: 600 });

      // The signal cable.
      const sy = T + bh / 2;
      const lifted = fix === 'lift';
      const isolatedFix = fix === 'xfmr';
      line(g, aX + 42, sy - 6, bX, sy - 6, { color: R.signal, lw: 2 });
      line(g, aX + 42, sy + 6, lifted ? bX - 22 : bX, sy + 6, {
        color: lifted ? alpha(p.muted, 0.5) : p.muted, lw: 2, dash: lifted ? [4, 3] : null,
      });
      if (lifted) label(g, '✕', bX - 14, sy + 6, { color: R.safe, size: 13, weight: 700, align: 'center' });
      if (isolatedFix) {
        const mx = (aX + 42 + bX) / 2;
        line(g, mx - 3, sy - 16, mx - 3, sy + 16, { color: R.safe, lw: 2.5 });
        line(g, mx + 3, sy - 16, mx + 3, sy + 16, { color: R.safe, lw: 2.5 });
        label(g, 'transformer', mx, sy - 24, { color: R.safe, size: 9.5, align: 'center' });
      }
      label(g, fix === 'bal' || fix === 'lift' ? 'balanced' : fix === 'xfmr' ? 'isolated' : 'unbalanced screen carries the return',
        (aX + bX) / 2, sy - 18, { color: p.muted, size: 9.5, align: 'center', max: bX - aX - 20 });

      // The earth paths back to the board.
      const ey = T + bh + 54;
      const boardX = w / 2;
      line(g, aX + 4, T + bh, aX + 4, ey, { color: R.safe, lw: 2 });
      line(g, aX + 4, ey, boardX - 30, ey, { color: R.safe, lw: 2 });
      line(g, bX + 38, T + bh, bX + 38, ey, { color: R.safe, lw: 2 });
      line(g, bX + 38, ey, boardX + 30, ey, { color: R.safe, lw: 2 });
      box(g, boardX - 30, ey - 14, 60, 28, { fill: p.raised, stroke: p.line, r: 5 });
      label(g, fix === 'same' ? 'one board' : 'board', boardX, ey, {
        color: p.muted, size: 9.5, align: 'center', max: 56,
      });
      label(g, 'protective earth', aX + 10, ey - 12, { color: R.safe, size: 9, max: 100 });

      // The loop current, drawn going round.
      if (hum > 0.05 && !isolatedFix && !lifted) {
        const per = 4;
        for (let k = 0; k < 6; k++) {
          const u = ((t * 0.5 + k / 6) % 1) * per;
          let px, py;
          if (u < 1) { px = aX + 42 + u * (bX - aX - 42); py = sy + 6; }
          else if (u < 2) { px = bX + 38; py = sy + 6 + (u - 1) * (ey - sy - 6); }
          else if (u < 3) { px = bX + 38 - (u - 2) * (bX + 38 - aX - 4); py = ey; }
          else { px = aX + 4; py = ey - (u - 3) * (ey - sy - 6); }
          g.fillStyle = alpha(R.fault, 0.4 + hum * 0.6);
          g.beginPath();
          g.arc(px, py, 3, 0, Math.PI * 2);
          g.fill();
        }
        label(g, 'loop current at 50 Hz', boardX, ey + 22, {
          color: R.fault, size: 10, align: 'center', weight: 600, max: w - 40,
        });
      }

      // What comes out.
      const oy = ey + 40;
      const gL = pad, gW = w - pad * 2, gH = 54;
      box(g, gL, oy, gW, gH, { fill: alpha(p.ground, 0.5), stroke: p.line, r: 6 });
      const mid = oy + gH / 2;
      g.strokeStyle = hum > 0.4 ? R.fault : hum > 0.12 ? R.energy : R.safe;
      g.lineWidth = 2;
      g.beginPath();
      for (let k = 0; k <= 200; k++) {
        const u = k / 200;
        const music = Math.sin(u * 26 - t * 4) * 6;
        const h50 = hum * (Math.sin(u * 5 - t * 2) * 14 + Math.sin(u * 15 - t * 6) * 5);
        const x = gL + u * gW;
        k ? g.lineTo(x, mid - music - h50) : g.moveTo(x, mid - music - h50);
      }
      g.stroke();
      label(g, db === 0 ? 'output: hum, at reference' : `output: hum ${sig(db)} dB lower`, gL + 6, oy + 12, {
        color: hum > 0.4 ? R.fault : R.safe, size: 10.5, weight: 600, max: gW - 12,
      });
      label(g, 'Never lift the protective earth in a mains plug to cure this. It works, and it is how people die.',
        gL, oy + gH + 16, { color: R.fault, size: 10.5, weight: 600, max: gW });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// Hum against buzz
// ---------------------------------------------------------------------------

register('hum-spectrum', (host) => {
  let kind = 'hum';

  const KINDS = {
    hum: ['Hum, 50 Hz', [1, 0.05, 0.02, 0.01, 0.005, 0.003, 0.002, 0.001],
      'A fundamental with few harmonics: a smooth, low tone. Magnetic induction from a transformer or a mains cable, or a ground loop on a clean supply.'],
    rect: ['Rectifier ripple, 100 Hz', [0.05, 1, 0.3, 0.12, 0.06, 0.03, 0.02, 0.01],
      'Twice the mains frequency. A power supply, and usually a tired smoothing capacitor. One of the most common faults in old show equipment.'],
    buzz: ['Dimmer buzz', [0.6, 0.5, 0.75, 0.6, 0.65, 0.5, 0.55, 0.45],
      'Rich in harmonics, extending far up the band. Something is chopping the waveform: a phase-control dimmer, a switch-mode supply, or a connection arcing.'],
  };

  const { controls, stage, setNote } = figure(host, {
    title: 'Hum, buzz, and 100 Hz',
    sub: 'Three noises that sound similar and have three completely different causes.',
    note: '',
  });

  const upd = () => {
    setNote(`${KINDS[kind][0]}. ${KINDS[kind][2]} <b>${kind === 'rect' ? 'Saying “that is 100 Hz, not 50, so it is a power supply and not a ground loop” in the first minute is the difference between a ten minute fix and an evening.' : kind === 'buzz' ? 'Buzz points at chopping, which means you are now looking at a shared supply or a cable route rather than at the audio system.' : 'Hum points at induction or a loop, which means the fixes in the previous figure.'}</b>`);
    cv.once();
  };

  controls.append(choice('Noise', Object.entries(KINDS).map(([k, v]) => [k, v[0]]), {
    value: 'hum', on: (v) => { kind = v; upd(); },
  }).node);

  const cv = canvas(stage, {
    height: 270,
    draw(g, w, h, t) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const amps = KINDS[kind][1];

      // The waveform.
      const gL = pad, gT = 22, gW = w - pad * 2, gH = 76;
      box(g, gL, gT, gW, gH, { fill: alpha(p.ground, 0.5), stroke: p.line, r: 6 });
      const mid = gT + gH / 2;
      g.strokeStyle = R.energy;
      g.lineWidth = 2;
      g.beginPath();
      for (let k = 0; k <= 260; k++) {
        const u = k / 260;
        let v = 0;
        amps.forEach((a, n) => { v += a * Math.sin((u * 4 * Math.PI - t * 2) * (n + 1)); });
        const x = gL + u * gW;
        k ? g.lineTo(x, mid - v * 22) : g.moveTo(x, mid - v * 22);
      }
      g.stroke();
      label(g, 'what it looks like', gL + 6, gT + 12, { color: p.muted, size: 10 });

      // The spectrum, which is where the diagnosis is.
      const sT = gT + gH + 26, sH = 84;
      line(g, gL + 26, sT + sH, gL + gW, sT + sH, { color: p.muted, lw: 1.5 });
      const bw = (gW - 34) / amps.length;
      amps.forEach((a, n) => {
        const x = gL + 30 + n * bw;
        const hh = a * sH;
        g.fillStyle = n === 0 ? R.energy : n === 1 ? R.signal : alpha(R.fault, 0.55 + a * 0.4);
        g.fillRect(x, sT + sH - hh, bw - 6, hh);
        label(g, `${50 * (n + 1)}`, x + (bw - 6) / 2, sT + sH + 12, {
          color: p.muted, size: 9, align: 'center', mono: true,
        });
      });
      label(g, 'Hz', gL + gW, sT + sH + 26, { color: p.muted, size: 9.5, align: 'right' });
      label(g, 'harmonic content', gL, sT - 6, { color: p.muted, size: 10 });

      labelWrap(g, KINDS[kind][2], pad, sT + sH + 34, { color: p.ink2, size: 11.5, max: gW, maxLines: 3 });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// Class 8: the scope
// ---------------------------------------------------------------------------

register('scope-basics', (host) => {
  let vdiv = 1, tdiv = 0.5, freq = 1000, amp = 2;

  const { controls, stage, setNote, challenge } = figure(host, {
    title: 'Volts per division and time per division',
    sub: 'Set the two scales so the waveform fills the screen. Getting it right requires you to have an expectation.',
    note: '',
  });

  const upd = () => {
    const divsTall = (amp * 2) / vdiv;
    const cyclesShown = (10 * tdiv * 1e-3) * freq;
    setNote(divsTall > 8.5 || divsTall < 1.2 || cyclesShown > 12 || cyclesShown < 0.7
      ? `${divsTall > 8.5 ? 'Clipped off the top: the vertical scale is too sensitive. ' : divsTall < 1.2 ? 'A flat line across the middle: the vertical scale is too coarse to see anything. ' : ''}${cyclesShown > 12 ? 'Far too many cycles to read: the timebase is too slow.' : cyclesShown < 0.7 ? 'Less than one cycle on screen: the timebase is too fast.' : ''} <b>Setting the timebase correctly requires you to already have an expectation of the frequency, which is the Class 2 prediction discipline arriving on a different instrument.</b>`
      : `${sig(cyclesShown)} cycles across the screen at ${sig(divsTall)} divisions tall. <b>Fill most of the screen: too small and you cannot see detail, too large and it clips off the top and you may not realise.</b>`);
    cv.once();
  };

  controls.append(slider('Volts / div', {
    min: 0, max: 5, step: 1, value: 2, fmt: (k) => `${[0.1, 0.2, 0.5, 1, 2, 5][k]} V`,
    on: (k) => { vdiv = [0.1, 0.2, 0.5, 1, 2, 5][k]; upd(); },
  }).node);
  controls.append(slider('Time / div', {
    min: 0, max: 6, step: 1, value: 3, fmt: (k) => `${[0.01, 0.05, 0.1, 0.5, 1, 5, 20][k]} ms`,
    on: (k) => { tdiv = [0.01, 0.05, 0.1, 0.5, 1, 5, 20][k]; upd(); },
  }).node);
  controls.append(choice('Signal', [[1000, '1 kHz'], [50, '50 Hz'], [20000, '20 kHz']], {
    value: 1000, on: (v) => { freq = +v; upd(); },
  }).node);
  vdiv = 0.5; tdiv = 0.5;

  const cv = canvas(stage, {
    height: 260,
    draw(g, w, h, t) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const gL = pad, gT = 18, gW = w - pad * 2, gH = 160;
      box(g, gL, gT, gW, gH, { fill: p.ground, stroke: p.line, r: 6 });
      // The graticule: eight vertical divisions, ten horizontal.
      for (let k = 1; k < 10; k++) {
        line(g, gL + (k / 10) * gW, gT, gL + (k / 10) * gW, gT + gH, { color: alpha(p.line, 0.8), lw: 1 });
      }
      for (let k = 1; k < 8; k++) {
        line(g, gL, gT + (k / 8) * gH, gL + gW, gT + (k / 8) * gH, { color: alpha(p.line, 0.8), lw: 1 });
      }
      const mid = gT + gH / 2;
      line(g, gL, mid, gL + gW, mid, { color: alpha(p.muted, 0.8), lw: 1.5 });

      const span = 10 * tdiv * 1e-3;
      g.strokeStyle = R.safe;
      g.lineWidth = 2;
      g.beginPath();
      let clipped = false;
      for (let k = 0; k <= 400; k++) {
        const u = k / 400;
        const tt = u * span;
        const v = amp * Math.sin(2 * Math.PI * freq * (tt + t * 0.0005));
        let y = mid - (v / vdiv) * (gH / 8);
        if (y < gT + 1 || y > gT + gH - 1) { clipped = true; y = Math.max(gT + 1, Math.min(gT + gH - 1, y)); }
        k ? g.lineTo(gL + u * gW, y) : g.moveTo(gL + u * gW, y);
      }
      g.stroke();

      label(g, `${vdiv} V/div`, gL + 6, gT + 12, { color: p.muted, size: 10, mono: true });
      label(g, `${tdiv} ms/div`, gL + gW - 6, gT + 12, { color: p.muted, size: 10, mono: true, align: 'right' });
      if (clipped) {
        label(g, 'CLIPPED — reduce the vertical sensitivity', gL + gW / 2, gT + gH - 12, {
          color: R.fault, size: 11, align: 'center', weight: 700, max: gW - 12,
        });
      }
      label(g, `Signal: ${eng(freq, 'Hz')}, ${amp} V peak. Period ${eng(1 / freq, 's')}.`, gL, gT + gH + 18, {
        color: p.ink2, size: 11, max: gW,
      });
      label(g, `Screen shows ${eng(span, 's')} across 10 divisions, so ${sig(span * freq)} cycles.`, gL, gT + gH + 36, {
        color: p.muted, size: 11, max: gW,
      });
    },
  });

  challenge('Get between two and five clean cycles on screen without clipping.',
    () => {
      const divsTall = (amp * 2) / vdiv;
      const cycles = (10 * tdiv * 1e-3) * freq;
      return divsTall <= 8 && divsTall >= 3 && cycles >= 2 && cycles <= 5;
    });
  upd();
});

register('scope-coupling', (host) => {
  let dc = true;
  let vdiv = 5;

  const { controls, stage, setNote, challenge } = figure(host, {
    title: 'AC coupling, and the fault you cannot see on DC',
    sub: 'A 12 V rail with 40 mV of ripple. Find the ripple.',
    note: '',
  });

  const upd = () => {
    setNote(!dc && vdiv <= 0.05
      ? 'There it is: about 40 mV peak to peak at 100 Hz, which is twice the mains frequency and therefore a rectifier. <b>A tired smoothing capacitor, diagnosable in thirty seconds once you know to switch the coupling and wind the sensitivity up.</b>'
      : dc
        ? 'On DC coupling the 12 V offset dominates. At any sensitivity fine enough to see 40 mV, the trace is off the top of the screen. <b>The fault is on the screen and you cannot see it, which is the whole reason AC coupling exists.</b>'
        : 'AC coupling has removed the 12 V. Now wind the vertical sensitivity up until the ripple fills the screen. <b>Coupling and sensitivity are two halves of one action here.</b>');
    cv.once();
  };

  controls.append(choice('Coupling', [['dc', 'DC'], ['ac', 'AC']], {
    value: 'dc', on: (v) => { dc = v === 'dc'; upd(); },
  }).node);
  controls.append(slider('Volts / div', {
    min: 0, max: 4, step: 1, value: 4, fmt: (k) => `${[0.01, 0.02, 0.05, 1, 5][k]} V`,
    on: (k) => { vdiv = [0.01, 0.02, 0.05, 1, 5][k]; upd(); },
  }).node);

  challenge('Make the 40 mV ripple fill a useful part of the screen.', () => !dc && vdiv <= 0.02);

  const cv = canvas(stage, {
    height: 240,
    draw(g, w, h, t) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const gL = pad, gT = 18, gW = w - pad * 2, gH = 150;
      box(g, gL, gT, gW, gH, { fill: p.ground, stroke: p.line, r: 6 });
      for (let k = 1; k < 8; k++) {
        line(g, gL, gT + (k / 8) * gH, gL + gW, gT + (k / 8) * gH, { color: alpha(p.line, 0.8), lw: 1 });
      }
      for (let k = 1; k < 10; k++) {
        line(g, gL + (k / 10) * gW, gT, gL + (k / 10) * gW, gT + gH, { color: alpha(p.line, 0.8), lw: 1 });
      }
      const mid = gT + gH / 2;

      g.strokeStyle = R.safe;
      g.lineWidth = 2;
      g.beginPath();
      let off = false;
      for (let k = 0; k <= 300; k++) {
        const u = k / 300;
        const ripple = 0.02 * Math.sin(u * 12 * Math.PI - t * 4);
        const v = (dc ? 12 : 0) + ripple;
        let y = mid - (v / vdiv) * (gH / 8);
        if (y < gT) { off = true; y = gT + 1; }
        k ? g.lineTo(gL + u * gW, y) : g.moveTo(gL + u * gW, y);
      }
      g.stroke();

      label(g, dc ? 'DC coupling' : 'AC coupling', gL + 6, gT + 12, { color: p.muted, size: 10, mono: true });
      label(g, `${vdiv >= 1 ? `${vdiv} V` : `${vdiv * 1000} mV`}/div`, gL + gW - 6, gT + 12, {
        color: p.muted, size: 10, mono: true, align: 'right',
      });
      if (off) {
        label(g, 'off the top of the screen', gL + gW / 2, gT + 24, {
          color: R.fault, size: 11, align: 'center', weight: 700, max: gW - 12,
        });
      }
      const visible = !dc && vdiv <= 0.05;
      label(g, visible ? 'ripple: about 40 mV peak to peak at 100 Hz — a rectifier, and a tired capacitor'
        : dc ? 'the 12 V offset is using the whole screen' : 'wind the sensitivity up',
      gL, gT + gH + 18, { color: visible ? R.safe : p.muted, size: 11.5, weight: visible ? 600 : 500, max: gW });
      label(g, 'Acceptable ripple on a 12 V rail is under about 100 mV peak to peak.', gL, gT + gH + 36, {
        color: p.muted, size: 10.5, max: gW,
      });
    },
  });
  upd();
});

register('scope-trigger', (host) => {
  let level = 0;
  let armed = true;

  const { controls, stage, setNote, challenge } = figure(host, {
    title: 'Why the trace will not stand still',
    sub: 'The instinct is to fiddle with the timebase. The fix is almost always the trigger.',
    note: '',
  });

  const upd = () => {
    setNote(!armed
      ? 'With no trigger, each sweep starts at an arbitrary moment, so successive traces do not line up and the waveform slides or blurs. <b>The signal is perfectly stable; only the instrument is not.</b>'
      : Math.abs(level) > 1.9
        ? 'The trigger level is outside the waveform, so nothing ever crosses it and the scope never starts a sweep. <b>A level above the peak looks exactly like an untriggered trace, and it is the second most common reason a scope will not lock.</b>'
        : 'Triggered: every sweep starts at the same point on the waveform, so successive traces land on top of each other and the picture stands still. <b>Set the source to the channel carrying the signal and the level to the middle of its amplitude, and it locks.</b>');
    cv.once();
  };

  controls.append(toggle('Trigger armed', { value: true, on: (v) => { armed = v; upd(); } }).node);
  controls.append(slider('Trigger level', {
    min: -2.4, max: 2.4, step: 0.1, value: 0, fmt: (v) => `${v.toFixed(1)} V`,
    on: (v) => { level = v; upd(); },
  }).node);

  challenge('Make the trace stand still.', () => armed && Math.abs(level) <= 1.9);

  const cv = canvas(stage, {
    height: 240,
    draw(g, w, h, t) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const gL = pad, gT = 18, gW = w - pad * 2, gH = 148;
      box(g, gL, gT, gW, gH, { fill: p.ground, stroke: p.line, r: 6 });
      for (let k = 1; k < 8; k++) line(g, gL, gT + (k / 8) * gH, gL + gW, gT + (k / 8) * gH, { color: alpha(p.line, 0.8), lw: 1 });
      const mid = gT + gH / 2;
      const scale = gH / 6;
      const locked = armed && Math.abs(level) <= 1.9;

      // Persistence: several sweeps drawn faintly, so an unlocked trace looks
      // the way it actually does rather than being described.
      const sweeps = locked ? 1 : 5;
      for (let s = 0; s < sweeps; s++) {
        const phase = locked ? Math.asin(Math.max(-1, Math.min(1, level / 2)))
          : (t * 3.1 + s * 1.31) % (2 * Math.PI);
        g.strokeStyle = locked ? R.safe : alpha(R.energy, 0.35);
        g.lineWidth = locked ? 2.2 : 1.6;
        g.beginPath();
        for (let k = 0; k <= 240; k++) {
          const u = k / 240;
          const v = 2 * Math.sin(u * 6 * Math.PI + phase);
          k ? g.lineTo(gL + u * gW, mid - v * scale / 2) : g.moveTo(gL + u * gW, mid - v * scale / 2);
        }
        g.stroke();
      }

      const ly = mid - (level / 2) * scale / 2;
      line(g, gL, ly, gL + gW, ly, {
        color: armed ? (locked ? R.signal : R.fault) : alpha(p.muted, 0.4), lw: 1.5, dash: [5, 4],
      });
      label(g, armed ? `trigger ${level.toFixed(1)} V` : 'trigger off', gL + gW - 6, ly - 9, {
        color: armed ? (locked ? R.signal : R.fault) : p.muted, size: 10, align: 'right', weight: 600,
      });

      label(g, locked ? 'LOCKED' : 'not triggered', gL + 6, gT + 12, {
        color: locked ? R.safe : R.fault, size: 11, weight: 700,
      });
      labelWrap(g, locked
        ? 'One trace, standing still. Every sweep begins at the same point on the waveform.'
        : 'Several sweeps overlaid at different starting points. The signal has not changed at all.',
      gL, gT + gH + 18, { color: p.ink2, size: 11.5, max: gW, maxLines: 2 });
      label(g, 'For an event that happens once — a bounce, a flyback spike, a start-up transient — use single shot.',
        gL, gT + gH + 44, { color: p.muted, size: 10.5, max: gW });
    },
  });
  upd();
});

register('waveform-zoo', (host) => compare(host, {
  title: 'The catalogue: what each shape means',
  sub: 'Recognising these is most of the diagnostic skill. Nine shapes, nine different problems.',
  fields: [
    { label: 'What you see', key: 'look' },
    { label: 'What it means', key: 'means' },
    { label: 'Where to go next', key: 'next', tone: 'signal' },
  ],
  items: [
    { name: 'Clean sine at 50 Hz', short: '50 Hz', tone: 'energy', look: 'A smooth sine, 20 ms per cycle', means: 'Mains, or hum coupled from it', next: 'Induction or a ground loop. Go to the five questions' },
    { name: 'Flattened tops', short: 'Clipping', tone: 'fault', look: 'A sine with its peaks cut off square', means: 'Something is overloaded', next: 'Work back through the gain structure until the peaks return' },
    { name: 'Notch each half cycle', short: 'Dimmer', tone: 'fault', look: 'A sine with a step missing near each zero crossing', means: 'A phase-control dimmer on the same supply', next: 'Separate the supplies, or reroute the audio cable away from the dimmer run' },
    { name: 'Fast small ripple on DC', short: 'SMPS', tone: 'signal', look: 'Tens of millivolts at tens to hundreds of kHz', means: 'Switch-mode supply switching frequency', next: 'Normal in small amounts. Large amounts mean a failing output filter' },
    { name: '100 Hz ripple on DC', short: '100 Hz', tone: 'fault', look: 'A sawtooth at twice mains frequency', means: 'Rectifier ripple: a tired smoothing capacitor', next: 'Replace the electrolytic. This is the most common fault in old equipment' },
    { name: 'A single tall spike', short: 'Spike', tone: 'fault', look: 'One narrow excursion, often ringing after it', means: 'Inductive kickback, or a switching transient', next: 'Find the coil. Fit or check the flyback diode' },
    { name: 'Fuzzy thickened trace', short: 'RF', tone: 'signal', look: 'The line itself is thick and unstable', means: 'High-frequency noise, often RF or a switch-mode supply', next: 'Check screening and the probe’s own ground lead length' },
    { name: 'Steps, not a curve', short: 'Steps', tone: 'signal', look: 'A staircase where a smooth curve belongs', means: 'Quantisation: you are seeing the resolution limit', next: 'Not a fault. Check whether the resolution is adequate for the job' },
    { name: 'Will not stand still', short: 'Sliding', tone: 'fault', look: 'The trace slides or blurs', means: 'Trigger not set, or the signal is not periodic', next: 'Set the trigger source and level before touching anything else' },
  ],
  footer: 'Being able to say “that is 100 Hz, not 50, so it is a power supply and not a ground loop” in the first minute is the difference between a ten minute fix and an evening.',
}));

register('hum-method', (host) => chain(host, {
  title: 'The method, which matters more than the knowledge',
  sub: 'Without one you swap cables until it goes away, learn nothing, and it comes back next week.',
  tag: 'Step', accent: 'safe',
  stages: [
    {
      name: 'Characterise',
      body: 'Five questions, answered before a single cable is touched. Hum or buzz? Does it change with the channel fader? Is it there with the input unplugged? Does touching the connector shell change it? Does it change when the lighting state changes?',
      why: 'Each answer excludes a whole category. The fader question alone splits the system in half: if it changes with the fader it enters before that fader, and if it does not it enters after.',
      note: 'Five questions, ninety seconds, no tools. <b>They will exclude most of the possibilities before you move anything, which is why this step is never the one to skip when you are in a hurry.</b>',
    },
    {
      name: 'Half-split',
      body: 'You have a chain: source, cable, preamp, processor, amplifier, speaker. Test in the middle and you halve the problem with each test.',
      why: 'Six devices found by half-splitting is three tests. Found by working along the chain it averages three and can take six. On a twenty-device system it is five tests against twenty.',
      note: 'This is the most transferable idea in the whole course. <b>It applies to a DMX line, a network, a truss circuit and a piece of software, and it is what makes methodical faster than clever under pressure.</b>',
    },
    {
      name: 'One change at a time',
      body: 'Every change is written down, and reversed if it did not help.',
      why: 'A system where four things were changed and the problem went away is a system that will do it again, because nobody knows which change mattered.',
    },
    {
      name: 'Prove the fix',
      body: 'Reproduce the fault deliberately after fixing it. Undo your change and confirm the symptom returns.',
      why: 'If you cannot make it come back, you did not find the cause, you found a coincidence.',
      note: 'This step is skipped almost universally. <b>It is the one that separates a repair from a hope, and unproven fixes reappear during performances when the person who made the change is not in the building.</b>',
    },
  ],
  footer: 'The marking in Class 8 is on the log, not on the time. A pair who found three faults with a clear log has done better work than a pair who found four by swapping cables at random.',
}));
