// Class 1 and Foundations: the four quantities, the three formulae, AC against
// DC, and where the current actually goes.

import { register } from './anim-core.js';
import {
  figure, canvas, slider, toggle, choice, label, labelWrap, box, line, palette,
  alpha, fitter, textWidth, ladder, plot, role, eng, sig,
  arrow, flowDots, resistorSym, supplySym, groundSym, readoutChip, node,
} from './anim-kit.js';

// ---------------------------------------------------------------------------
// Voltage is a difference, never a place
// ---------------------------------------------------------------------------

register('voltage-is-relative', (host) => {
  // Four points on a chain of resistors, each at a fixed potential above the
  // supply's negative rail. The student moves two probes. The reading is the
  // difference, and the point lands when both probes sit on high potentials
  // and the meter reads almost nothing.
  const NODES = [
    { name: 'A', v: 12, what: 'Supply positive' },
    { name: 'B', v: 9, what: 'Top of R2' },
    { name: 'C', v: 4, what: 'Top of R3' },
    { name: 'D', v: 0, what: 'Supply negative' },
  ];
  let red = 0, black = 3;

  const { controls, stage, setNote, challenge } = figure(host, {
    title: 'Voltage is a difference, never a place',
    sub: 'Move both probes. The meter never reports where you are, only how far apart you are.',
    note: 'Put both probes on A and D and you read the whole supply. Put both on A and the meter reads zero, with 12 V present at the probe tip. <b>A voltage reading with only one probe recorded is not a measurement, and half the fault reports in this industry are written that way.</b>',
  });

  controls.append(choice('Red probe', NODES.map((n, i) => [i, n.name]), {
    value: 0, on: (v) => { red = +v; cv.once(); },
  }).node);
  controls.append(choice('Black probe', NODES.map((n, i) => [i, n.name]), {
    value: 3, on: (v) => { black = +v; cv.once(); },
  }).node);

  challenge('Find two points that are both well above the negative rail but read under 6 V between them.',
    () => {
      const a = NODES[red].v, b = NODES[black].v;
      return Math.min(a, b) > 0 && Math.abs(a - b) < 6 && red !== black;
    });

  const cv = canvas(stage, {
    height: 300, animated: false,
    draw(g, w) {
      const p = palette();
      const R = role(p);
      const x = Math.min(120, w * 0.28);
      const top = 30;
      const gap = 52;

      // The chain itself.
      line(g, x, top, x, top + gap * 3, { color: p.muted, lw: 2 });
      for (let k = 0; k < 3; k++) {
        resistorSym(g, x - 22, top + gap * k + gap / 2, 44, 14, p.ink2, 2);
        label(g, `R${k + 1}`, x - 30, top + gap * k + gap / 2, {
          color: p.muted, size: 10, align: 'right',
        });
      }
      supplySym(g, x - 62, top + gap * 1.5, 26, R.energy, 2);
      label(g, '12 V', x - 62, top + gap * 1.5 + 24, { color: R.energy, size: 10.5, align: 'center' });
      line(g, x - 62, top + gap * 1.5 - 13, x - 62, top, { color: p.muted, lw: 1.5 });
      line(g, x - 62, top, x, top, { color: p.muted, lw: 1.5 });
      line(g, x - 62, top + gap * 1.5 + 13, x - 62, top + gap * 3, { color: p.muted, lw: 1.5 });
      line(g, x - 62, top + gap * 3, x, top + gap * 3, { color: p.muted, lw: 1.5 });
      groundSym(g, x - 62, top + gap * 3 + 6, p.muted);

      NODES.forEach((n, i) => {
        const y = top + gap * i;
        const isRed = i === red;
        const isBlack = i === black;
        g.fillStyle = isRed ? p.red : isBlack ? p.ink : p.muted;
        g.beginPath();
        g.arc(x, y, isRed || isBlack ? 6 : 4, 0, Math.PI * 2);
        g.fill();
        label(g, n.name, x + 14, y, { color: p.ink, size: 12, weight: 700 });
        label(g, `${n.v} V above D`, x + 30, y, { color: p.muted, size: 10.5, max: w - x - 130 });
        if (isRed) label(g, 'red', x - 44, y, { color: p.red, size: 10, weight: 700, align: 'right' });
        if (isBlack) label(g, 'black', x - 44, y, { color: p.ink, size: 10, weight: 700, align: 'right' });
      });

      // The meter.
      const mx = Math.max(x + 150, w - 150);
      const diff = NODES[red].v - NODES[black].v;
      box(g, mx, top + 20, 128, 74, { fill: p.raised, stroke: p.line, r: 8 });
      label(g, 'MULTIMETER · DC V', mx + 10, top + 34, { color: p.muted, size: 9 });
      label(g, `${diff > 0 ? '' : diff < 0 ? '−' : ''}${sig(Math.abs(diff))} V`, mx + 64, top + 60, {
        color: diff === 0 ? p.muted : R.energy, size: 22, weight: 700, align: 'center', mono: true,
      });
      label(g, `${NODES[red].name} relative to ${NODES[black].name}`, mx + 64, top + 82, {
        color: p.muted, size: 9.5, align: 'center', max: 118,
      });

      labelWrap(g,
        diff === 0
          ? 'Both probes on the same point. The meter reads zero and the point is still 12 V above the negative rail.'
          : `${NODES[red].name} is ${sig(Math.abs(diff))} V ${diff > 0 ? 'above' : 'below'} ${NODES[black].name}. Neither number on the left is what the meter shows.`,
        10, top + gap * 3 + 40, { color: p.ink2, size: 11.5, max: w - 20, maxLines: 3 });
    },
  });
});

// ---------------------------------------------------------------------------
// Ohm's law, on a circuit rather than a triangle
// ---------------------------------------------------------------------------

register('ohm-triangle', (host) => {
  let V = 12, Rr = 100;

  const { controls, stage, setNote, challenge } = figure(host, {
    title: 'Ohm’s law, on a real circuit',
    sub: 'Set the supply and the resistance. Current and power follow; you never choose them directly.',
    note: 'You set voltage and resistance. <b>Current and power are consequences, and this is why "the socket pushes 13 A into everything" is wrong: the supply offers a voltage and the load decides what it draws.</b>',
  });

  const upd = () => {
    const I = V / Rr;
    const P = V * I;
    setNote(`At ${sig(V)} V through ${eng(Rr, 'Ω')} the current is ${eng(I, 'A')} and the resistor turns ${eng(P, 'W')} into heat. ${
      P > 0.25 ? '<b>That is above a quarter watt, so a standard small resistor would be running too hot to touch and would drift in value.</b>'
        : '<b>You set voltage and resistance; current and power are consequences you do not choose.</b>'}`);
    cv.once();
  };

  controls.append(slider('Supply', {
    min: 1, max: 48, step: 1, value: 12, fmt: (v) => `${v} V`, on: (v) => { V = v; upd(); },
  }).node);
  controls.append(slider('Resistance', {
    min: 0, max: 40, step: 1, value: 20,
    fmt: (k) => eng(10 ** (0.5 + k / 10), 'Ω'),
    on: (k) => { Rr = 10 ** (0.5 + k / 10); upd(); },
  }).node);
  Rr = 10 ** (0.5 + 20 / 10);

  challenge('Get the power in the resistor above 1 W without going over 24 V.',
    () => V <= 24 && (V * V) / Rr > 1);

  const cv = canvas(stage, {
    height: 250,
    draw(g, w, h, t) {
      const p = palette();
      const R = role(p);
      const I = V / Rr;
      const P = V * I;
      const L = 20, T = 34;
      const bw = Math.min(w - 40, 300);
      const bh = 110;

      // The loop.
      g.strokeStyle = p.muted;
      g.lineWidth = 2;
      g.strokeRect(L, T, bw, bh);
      supplySym(g, L, T + bh / 2, 28, R.energy, 2.5);
      g.fillStyle = p.surface;
      g.fillRect(L - 3, T + bh / 2 - 16, 6, 32);
      supplySym(g, L, T + bh / 2, 28, R.energy, 2.5);
      label(g, `${sig(V)} V`, L - 10, T + bh / 2, { color: R.energy, size: 11.5, weight: 700, align: 'right' });

      g.fillStyle = p.surface;
      g.fillRect(L + bw - 3, T + bh / 2 - 14, 6, 28);
      g.save();
      g.translate(L + bw, T + bh / 2);
      g.rotate(Math.PI / 2);
      resistorSym(g, -24, 0, 48, 15, p.ink2, 2.5);
      g.restore();
      label(g, eng(Rr, 'Ω'), L + bw + 12, T + bh / 2, { color: p.ink, size: 11.5, weight: 700 });

      // Current, drawn as moving charge. Speed is the current, honestly scaled.
      const speed = Math.min(1.6, 0.06 + I * 1.4);
      const dots = 5;
      const per = (bw + bh) * 2;
      for (let k = 0; k < dots * 4; k++) {
        const u = ((t * speed + k / (dots * 4)) % 1) * per;
        let px, py;
        if (u < bw) { px = L + u; py = T; }
        else if (u < bw + bh) { px = L + bw; py = T + (u - bw); }
        else if (u < bw * 2 + bh) { px = L + bw - (u - bw - bh); py = T + bh; }
        else { px = L; py = T + bh - (u - bw * 2 - bh); }
        g.fillStyle = alpha(R.energy, 0.9);
        g.beginPath();
        g.arc(px, py, 3, 0, Math.PI * 2);
        g.fill();
      }
      label(g, 'current', L + bw / 2, T - 12, { color: p.muted, size: 10, align: 'center' });

      // Readouts, and the working, because the working is what is examined.
      const rx = L + bw + 60;
      const room = w - rx - 10;
      if (room > 110) {
        readoutChip(g, rx, T, 'CURRENT  I = V ÷ R', eng(I, 'A'), { color: R.energy, p, w: Math.min(room, 150) });
        readoutChip(g, rx, T + 42, 'POWER  P = V × I', eng(P, 'W'), { color: P > 0.25 ? R.fault : R.safe, p, w: Math.min(room, 150) });
      }

      const wy = T + bh + 34;
      label(g, `I = ${sig(V)} ÷ ${sig(Rr)} = ${eng(I, 'A')}`, L, wy, { color: p.ink2, size: 11.5, mono: true });
      label(g, `P = ${sig(V)} × ${sig(I)} = ${eng(P, 'W')}`, L, wy + 17, { color: p.ink2, size: 11.5, mono: true });
      label(g, `P = I² × R = ${sig(I)}² × ${sig(Rr)} = ${eng(I * I * Rr, 'W')}`, L, wy + 34, {
        color: p.muted, size: 11, mono: true, max: w - L - 10,
      });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// Power in a resistance goes as the square of the current
// ---------------------------------------------------------------------------

register('power-heat', (host) => {
  let I = 5;
  const Rc = 0.05;   // 0.05 Ω, a plausible resistance for a long cable run

  const { controls, stage, setNote, challenge } = figure(host, {
    title: 'Double the current, four times the heat',
    sub: 'A cable of 0.05 Ω. Drag the current and watch the heating, which is not proportional.',
    note: 'The bar is not a straight line against the slider. <b>Heating goes as the square of the current, which is why a cable that is comfortable at 10 A is not merely warmer at 20 A, and why undersized cable does not fail gently.</b>',
  });

  controls.append(slider('Current', {
    min: 1, max: 40, step: 0.5, value: 5, fmt: (v) => `${v} A`,
    on: (v) => {
      I = v;
      const P = v * v * Rc;
      setNote(`At ${sig(v)} A this cable dissipates ${eng(P, 'W')}. ${
        v >= 20 ? `<b>Four times the current of 5 A gives sixteen times the heat, not four.</b>`
          : `<b>Heating goes as the square of the current, so the bar climbs far faster than the slider.</b>`}`);
      cv.once();
    },
  }).node);

  challenge('Find the current at which this cable dissipates more than 20 W.', () => I * I * Rc > 20);

  const cv = canvas(stage, {
    height: 250,
    draw(g, w, h, t) {
      const p = palette();
      const R = role(p);
      const pad = 14;
      const P = I * I * Rc;
      const maxP = 40 * 40 * Rc;

      // The cable, glowing with the power in it. Colour is the reading here.
      const cy = 52;
      const heat = Math.min(1, P / maxP);
      const glow = alpha(R.fault, 0.15 + heat * 0.6);
      g.fillStyle = glow;
      g.fillRect(pad, cy - 16 - heat * 6, w - pad * 2, 32 + heat * 12);
      box(g, pad, cy - 12, w - pad * 2, 24, { fill: alpha(R.energy, 0.25), stroke: p.line, r: 5 });
      const dots = 14;
      for (let k = 0; k < dots; k++) {
        const u = ((t * (0.1 + I / 40) + k / dots) % 1);
        g.fillStyle = R.energy;
        g.beginPath();
        g.arc(pad + 6 + u * (w - pad * 2 - 12), cy, 3, 0, Math.PI * 2);
        g.fill();
      }
      label(g, `${sig(I)} A through 0.05 Ω`, pad + 8, cy - 26, { color: p.ink2, size: 11 });
      label(g, heat > 0.55 ? 'hot' : heat > 0.25 ? 'warm' : 'cool', w - pad - 8, cy - 26, {
        color: heat > 0.55 ? R.fault : heat > 0.25 ? R.energy : R.safe, size: 11, weight: 700, align: 'right',
      });

      // The curve, with the linear line beside it for contrast. That contrast
      // is the whole figure.
      const gT = 100, gH = h - gT - 34, gL = 40, gW = w - gL - pad;
      line(g, gL, gT + gH, gL + gW, gT + gH, { color: p.muted, lw: 1.5 });
      line(g, gL, gT, gL, gT + gH, { color: p.muted, lw: 1.5 });
      label(g, 'watts', gL - 6, gT + 2, { color: p.muted, size: 9.5, align: 'right' });
      label(g, 'amps', gL + gW, gT + gH + 16, { color: p.muted, size: 9.5, align: 'right' });

      g.strokeStyle = alpha(p.muted, 0.7);
      g.setLineDash([4, 4]);
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(gL, gT + gH);
      g.lineTo(gL + gW, gT + gH - (40 * Rc / maxP) * gH * 40 / 40);
      g.stroke();
      g.setLineDash([]);
      label(g, 'if it were proportional', gL + gW - 6, gT + gH - 18, {
        color: p.muted, size: 9.5, align: 'right',
      });

      g.strokeStyle = R.fault;
      g.lineWidth = 2.5;
      g.beginPath();
      for (let k = 0; k <= 80; k++) {
        const a = (k / 80) * 40;
        const px = gL + (a / 40) * gW;
        const py = gT + gH - ((a * a * Rc) / maxP) * gH;
        k ? g.lineTo(px, py) : g.moveTo(px, py);
      }
      g.stroke();

      const cx = gL + (I / 40) * gW;
      const cyy = gT + gH - (P / maxP) * gH;
      line(g, cx, gT + gH, cx, cyy, { color: alpha(R.energy, 0.6), lw: 1, dash: [3, 3] });
      g.fillStyle = R.energy;
      g.beginPath();
      g.arc(cx, cyy, 5, 0, Math.PI * 2);
      g.fill();
      label(g, `${eng(P, 'W')}`, cx + 8, cyy - 10, { color: p.ink, size: 12, weight: 700, mono: true });
      label(g, `P = I² × R = ${sig(I)}² × 0.05`, gL, gT + gH + 30, {
        color: p.muted, size: 11, mono: true, max: gW,
      });
    },
  });
});

// ---------------------------------------------------------------------------
// The water analogy, and its three lies
// ---------------------------------------------------------------------------

register('water-analogy', (host) => {
  const LIES = [
    {
      name: 'It holds',
      body: 'Pressure is voltage, flow rate is current, a narrow pipe is resistance. Raise the pump and the flow increases. Narrow the pipe and the flow drops. All of that transfers exactly, and it is why the analogy is worth having.',
      note: 'So far the analogy is doing real work. <b>Every relationship you can see here is true of the circuit too.</b>',
    },
    {
      name: 'Lie 1: the loop',
      body: 'Water sprayed from a broken pipe falls to the ground and is gone. Electricity does not: current only flows if there is a complete path back to the source.',
      note: 'This is why a bird on an 11 kV line is comfortable and a person standing on concrete is not. <b>The bird has no return path; the person is one.</b>',
    },
    {
      name: 'Lie 2: speed',
      body: 'Water moves at the speed of the water. In a wire, the electrons drift at millimetres per second, but the push travels at close to the speed of light.',
      note: 'The energy arrives almost instantly while the charge barely moves. <b>This is why a signal reflects off the far end of a DMX cable before the electrons have gone anywhere, which is Class 9.</b>',
    },
    {
      name: 'Lie 3: the return route',
      body: 'A plumber does not care which drain the water reaches, only that it does. A circuit cares intensely about the route the return current takes.',
      note: 'Where the current comes back is what creates loop area, and loop area is what picks up and radiates interference. <b>Class 7 is four hours on the consequences of this one difference.</b>',
    },
  ];
  let i = 0;

  const { controls, stage, setNote } = figure(host, {
    title: 'The water analogy, and exactly where it lies',
    sub: 'Use it. Then know the three places it will mislead you.',
    note: LIES[0].note,
  });

  controls.append(choice('Show', LIES.map((l, k) => [k, l.name]), {
    value: 0, on: (v) => { i = +v; setNote(LIES[i].note); cv.once(); },
  }).node);

  const cv = canvas(stage, {
    height: 280,
    draw(g, w, h, t) {
      const p = palette();
      const R = role(p);
      const pad = 14;
      const cy = 74;
      const pumpX = pad + 34;
      const valveX = Math.min(w - 90, pad + 220);

      // Pump, pipe, valve, return.
      g.strokeStyle = p.muted;
      g.lineWidth = 2;
      g.beginPath();
      g.arc(pumpX, cy, 22, 0, Math.PI * 2);
      g.stroke();
      label(g, 'pump', pumpX, cy, { color: R.energy, size: 10.5, align: 'center', weight: 600 });
      label(g, 'voltage', pumpX, cy + 34, { color: p.muted, size: 9.5, align: 'center' });

      const pipeTop = cy - 40;
      const pipeBot = cy + 40;
      line(g, pumpX, cy - 22, pumpX, pipeTop, { color: p.muted, lw: 2 });
      line(g, pumpX, pipeTop, valveX, pipeTop, { color: p.muted, lw: 2 });
      line(g, valveX, pipeTop, valveX, pipeBot, { color: p.muted, lw: 2 });
      const returnBroken = i === 1;
      if (!returnBroken) {
        line(g, valveX, pipeBot, pumpX, pipeBot, { color: i === 3 ? R.fault : p.muted, lw: i === 3 ? 3 : 2 });
        line(g, pumpX, pipeBot, pumpX, cy + 22, { color: p.muted, lw: 2 });
      } else {
        line(g, valveX, pipeBot, valveX - 40, pipeBot, { color: p.muted, lw: 2 });
        label(g, '✕ no return', valveX - 46, pipeBot, { color: R.fault, size: 11, weight: 700, align: 'right' });
      }
      // Valve as the resistance.
      box(g, valveX - 9, cy - 12, 18, 24, { fill: p.raised, stroke: p.ink2, r: 3 });
      label(g, 'valve', valveX + 16, cy - 4, { color: p.ink2, size: 10.5 });
      label(g, 'resistance', valveX + 16, cy + 10, { color: p.muted, size: 9.5 });

      // Flow. It stops entirely when the loop is broken, which is the lesson.
      const flowing = !returnBroken;
      if (flowing) {
        const speed = 0.35;
        const per = (valveX - pumpX) * 2 + 80;
        for (let k = 0; k < 12; k++) {
          const u = ((t * speed + k / 12) % 1) * per;
          let px, py;
          if (u < valveX - pumpX) { px = pumpX + u; py = pipeTop; }
          else if (u < valveX - pumpX + 80) { px = valveX; py = pipeTop + (u - (valveX - pumpX)); }
          else { px = valveX - (u - (valveX - pumpX) - 80); py = pipeBot; }
          if (px < pumpX) continue;
          g.fillStyle = i === 3 && py === pipeBot ? R.fault : R.signal;
          g.beginPath();
          g.arc(px, py, 3.2, 0, Math.PI * 2);
          g.fill();
        }
      } else {
        label(g, 'nothing flows', (pumpX + valveX) / 2, pipeTop - 14, {
          color: R.fault, size: 11.5, align: 'center', weight: 700,
        });
      }

      if (i === 2) {
        // Two speeds, drawn as two markers on the same pipe.
        const push = pumpX + ((t * 3) % 1) * (valveX - pumpX);
        line(g, push, pipeTop - 10, push, pipeTop - 2, { color: R.energy, lw: 3 });
        label(g, 'the push: near light speed', pumpX, pipeTop - 20, { color: R.energy, size: 10, max: w - 30 });
        const drift = pumpX + ((t * 0.08) % 1) * (valveX - pumpX);
        g.fillStyle = p.ink;
        g.beginPath();
        g.arc(drift, pipeTop, 4.5, 0, Math.PI * 2);
        g.fill();
        label(g, 'the charge: millimetres per second', pumpX, pipeBot + 22, {
          color: p.ink2, size: 10, max: w - 30,
        });
      }
      if (i === 3) {
        label(g, 'the return route is what matters', pumpX, pipeBot + 22, {
          color: R.fault, size: 10.5, max: w - 30, weight: 600,
        });
      }

      const ty = 152;
      labelWrap(g, LIES[i].body, pad, ty, { color: p.ink2, size: 12, max: w - pad * 2, maxLines: 5 });
    },
  });
});

// ---------------------------------------------------------------------------
// Series and parallel
// ---------------------------------------------------------------------------

register('series-parallel', (host) => {
  let series = true;
  let broken = false;
  const V = 12, Rl = 24;   // two 24 Ω lamps on a 12 V supply

  const { controls, stage, setNote } = figure(host, {
    title: 'Series and parallel, and what one failure does',
    sub: 'The same two lamps, wired two ways. Break one and see which arrangement survives.',
    note: '',
  });

  const upd = () => {
    const Rt = series ? Rl * 2 : Rl / 2;
    const I = broken && series ? 0 : V / (broken ? Rl : Rt);
    setNote(series
      ? (broken
        ? 'One lamp open, and both are dark. <b>In series the same current passes through everything, so one failure stops the lot: this is a safety chain, and it is also why old Christmas lights were infuriating.</b>'
        : `In series each lamp sees ${sig(V / 2)} V, half the supply, so both are dim. Total resistance is ${Rl * 2} Ω and the supply delivers ${eng(V / (Rl * 2), 'A')}. <b>Adding another lamp in series makes them all dimmer.</b>`)
      : (broken
        ? 'One lamp open and the other is unaffected, at full brightness. <b>In parallel each branch has its own path, which is why every socket in the building is wired this way.</b>'
        : `In parallel each lamp sees the full ${V} V and draws ${eng(V / Rl, 'A')}, so the supply delivers ${eng(V / (Rl / 2), 'A')}. <b>Adding another lamp in parallel does not dim the others, it increases the total current, which is how a 16 A way ends up carrying 19 A.</b>`));
    cv.once();
  };

  controls.append(choice('Wiring', [['s', 'Series'], ['p', 'Parallel']], {
    value: 's', on: (v) => { series = v === 's'; upd(); },
  }).node);
  controls.append(toggle('Break lamp 1', { value: false, on: (v) => { broken = v; upd(); } }).node);

  const cv = canvas(stage, {
    height: 260,
    draw(g, w, h, t) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const T = 34;
      const bw = Math.min(w - pad * 2 - 60, 300);
      const bh = 120;
      const L = pad + 46;

      supplySym(g, L - 30, T + bh / 2, 28, R.energy, 2.5);
      label(g, '12 V', L - 30, T + bh / 2 + 26, { color: R.energy, size: 10.5, align: 'center' });

      const Rt = series ? Rl * 2 : Rl / 2;
      const dead = broken && series;
      const I = dead ? 0 : V / (broken ? Rl : Rt);

      const lamp = (x, y, lit, isBroken) => {
        g.strokeStyle = isBroken ? R.fault : p.ink2;
        g.lineWidth = 2;
        g.beginPath();
        g.arc(x, y, 15, 0, Math.PI * 2);
        if (lit > 0.02) {
          g.fillStyle = alpha(R.energy, 0.18 + lit * 0.7);
          g.fill();
        }
        g.stroke();
        if (isBroken) {
          line(g, x - 8, y - 8, x + 8, y + 8, { color: R.fault, lw: 2.5 });
          line(g, x + 8, y - 8, x - 8, y + 8, { color: R.fault, lw: 2.5 });
        } else {
          line(g, x - 7, y + 5, x, y - 6, { color: p.ink2, lw: 1.5 });
          line(g, x, y - 6, x + 7, y + 5, { color: p.ink2, lw: 1.5 });
        }
      };

      const brightness = (vAcross) => Math.min(1, (vAcross / 12) ** 1.6);

      if (series) {
        // One loop, both lamps in it.
        g.strokeStyle = p.muted;
        g.lineWidth = 2;
        g.strokeRect(L, T, bw, bh);
        g.fillStyle = p.surface;
        g.fillRect(L + bw * 0.32 - 18, T - 3, 36, 6);
        g.fillRect(L + bw * 0.68 - 18, T - 3, 36, 6);
        const each = dead ? 0 : V / 2;
        lamp(L + bw * 0.32, T, brightness(each), broken);
        lamp(L + bw * 0.68, T, brightness(each), false);
        label(g, dead ? '0 V' : `${sig(each)} V`, L + bw * 0.32, T - 26, {
          color: p.ink2, size: 10.5, align: 'center',
        });
        label(g, dead ? '0 V' : `${sig(each)} V`, L + bw * 0.68, T - 26, {
          color: p.ink2, size: 10.5, align: 'center',
        });
      } else {
        // Two branches across the supply.
        g.strokeStyle = p.muted;
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(L, T); g.lineTo(L + bw, T);
        g.moveTo(L, T + bh); g.lineTo(L + bw, T + bh);
        g.moveTo(L, T); g.lineTo(L, T + bh);
        g.stroke();
        for (const [k, bx] of [[0, L + bw * 0.42], [1, L + bw * 0.82]]) {
          line(g, bx, T, bx, T + bh, { color: p.muted, lw: 2 });
          g.fillStyle = p.surface;
          g.fillRect(bx - 3, T + bh / 2 - 18, 6, 36);
          lamp(bx, T + bh / 2, brightness(broken && k === 0 ? 0 : V), broken && k === 0);
          label(g, broken && k === 0 ? 'open' : '12 V', bx + 22, T + bh / 2, {
            color: broken && k === 0 ? R.fault : p.ink2, size: 10.5,
          });
        }
      }

      // Current, at an honest relative speed.
      if (I > 0) {
        const speed = 0.25 + I * 1.6;
        for (let k = 0; k < 8; k++) {
          const u = ((t * speed + k / 8) % 1);
          g.fillStyle = R.energy;
          g.beginPath();
          g.arc(L + u * bw, T + bh, 3, 0, Math.PI * 2);
          g.fill();
        }
      }

      const ry = T + bh + 34;
      label(g, `Total resistance  ${dead ? '∞ (open)' : eng(broken ? Rl : Rt, 'Ω')}`, pad, ry, {
        color: p.ink2, size: 11.5, mono: true, max: w - pad * 2,
      });
      label(g, `Supply current    ${eng(I, 'A')}`, pad, ry + 18, {
        color: dead ? R.fault : R.energy, size: 11.5, mono: true, weight: 700, max: w - pad * 2,
      });
      label(g, series ? 'Same current everywhere, voltage divides' : 'Same voltage everywhere, current divides',
        pad, ry + 38, { color: p.muted, size: 11, max: w - pad * 2 });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// AC against DC
// ---------------------------------------------------------------------------

register('ac-dc', (host) => {
  let ac = true;
  let mode = 'ac';   // which meter range is selected

  const { controls, stage, setNote } = figure(host, {
    title: 'AC, DC, RMS and peak',
    sub: 'The same 230 V supply on two meter settings. One of them reads almost nothing.',
    note: '',
  });

  const upd = () => {
    const rms = 230;
    const peak = rms * Math.SQRT2;
    if (!ac) {
      setNote(mode === 'dc'
        ? 'A DC supply on the DC range: the meter reads what is there. <b>This is the only combination of the four that is straightforwardly correct.</b>'
        : 'A DC supply on the AC range reads near zero, because there is no variation for it to measure. <b>Both wrong-range readings are zero, which is why a wrong range looks exactly like a dead circuit.</b>');
    } else {
      setNote(mode === 'ac'
        ? `The meter reads ${rms} V, the RMS value: the DC voltage that would produce the same heating. The waveform actually peaks at ${Math.round(peak)} V. <b>The number on the wall is never the peak, and the peak is what your insulation has to survive.</b>`
        : 'An AC supply on the DC range reads near zero, because the positive and negative halves average out. <b>This is the single most common beginner measurement error, and it looks identical to a dead circuit.</b>');
    }
    cv.once();
  };

  controls.append(choice('Supply', [['ac', 'AC mains'], ['dc', 'DC supply']], {
    value: 'ac', on: (v) => { ac = v === 'ac'; upd(); },
  }).node);
  controls.append(choice('Meter range', [['ac', 'V~ (AC)'], ['dc', 'V⎓ (DC)']], {
    value: 'ac', on: (v) => { mode = v; upd(); },
  }).node);

  const cv = canvas(stage, {
    height: 270,
    draw(g, w, h, t) {
      const p = palette();
      const R = role(p);
      const pad = 14;
      const gL = 40, gT = 24, gW = w - gL - pad - 120, gH = 120;
      const mid = gT + gH / 2;
      const rms = 230;
      const peak = rms * Math.SQRT2;

      // Axes scaled to the peak, so the peak is visible rather than clipped.
      line(g, gL, mid, gL + gW, mid, { color: p.muted, lw: 1.5 });
      line(g, gL, gT, gL, gT + gH, { color: p.muted, lw: 1.5 });
      const Y = (v) => mid - (v / (peak * 1.15)) * (gH / 2);
      for (const v of [peak, rms, 0, -rms, -peak]) {
        const y = Y(v);
        line(g, gL - 4, y, gL, y, { color: p.muted, lw: 1 });
        label(g, `${v > 0 ? '' : v < 0 ? '−' : ''}${Math.round(Math.abs(v))}`, gL - 7, y, {
          color: Math.abs(v) === Math.round(peak) ? R.fault : p.muted, size: 9, align: 'right', mono: true,
        });
      }

      g.strokeStyle = R.energy;
      g.lineWidth = 2.5;
      g.beginPath();
      for (let k = 0; k <= 200; k++) {
        const x = gL + (k / 200) * gW;
        const ph = (k / 200) * 4 * Math.PI - t * 3;
        const v = ac ? peak * Math.sin(ph) : rms;
        k ? g.lineTo(x, Y(v)) : g.moveTo(x, Y(v));
      }
      g.stroke();

      if (ac) {
        line(g, gL, Y(rms), gL + gW, Y(rms), { color: alpha(R.safe, 0.8), lw: 1.5, dash: [5, 4] });
        label(g, 'RMS 230 V', gL + gW - 4, Y(rms) - 10, { color: R.safe, size: 10, align: 'right', weight: 600 });
        line(g, gL, Y(peak), gL + gW, Y(peak), { color: alpha(R.fault, 0.7), lw: 1, dash: [3, 3] });
        label(g, `peak ${Math.round(peak)} V`, gL + gW - 4, Y(peak) - 9, {
          color: R.fault, size: 10, align: 'right', weight: 600,
        });
        label(g, '50 Hz · 20 ms per cycle', gL, gT + gH + 16, { color: p.muted, size: 10 });
      } else {
        label(g, 'steady, one direction', gL, gT + gH + 16, { color: p.muted, size: 10 });
      }

      // The meter, which is the point of the figure.
      const mx = w - 112;
      const reading = ac ? (mode === 'ac' ? rms : 0.3) : (mode === 'dc' ? rms : 1.1);
      const wrong = (ac && mode === 'dc') || (!ac && mode === 'ac');
      box(g, mx, gT + 14, 100, 76, { fill: p.raised, stroke: wrong ? R.fault : p.line, r: 8, lw: wrong ? 2 : 1 });
      label(g, mode === 'ac' ? 'V~  AC volts' : 'V⎓  DC volts', mx + 50, gT + 28, {
        color: p.muted, size: 9, align: 'center',
      });
      label(g, `${sig(reading)}`, mx + 50, gT + 54, {
        color: wrong ? R.fault : R.energy, size: 22, weight: 700, align: 'center', mono: true,
      });
      label(g, wrong ? 'looks dead' : 'correct', mx + 50, gT + 78, {
        color: wrong ? R.fault : R.safe, size: 10, align: 'center', weight: 600,
      });

      labelWrap(g, ac
        ? 'RMS is defined as the DC voltage that would cause the same heating, which is exactly why it is the number written on everything.'
        : 'A DC supply has no cycle to average, so an AC range has nothing to report.',
      pad, gT + gH + 44, { color: p.ink2, size: 11.5, max: w - pad * 2, maxLines: 3 });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// Three phase
// ---------------------------------------------------------------------------

register('three-phase', (host) => {
  let load = [1, 1, 1];

  const { controls, stage, setNote } = figure(host, {
    title: 'Three phase, and the neutral that carries the difference',
    sub: 'Three supplies a third of a cycle apart. Unbalance them and watch the neutral.',
    note: 'With the three phases balanced the returns cancel and the neutral carries nothing. <b>Unbalance them and the neutral carries the difference, which is why a neutral is sized for the worst case and never treated as an optional conductor.</b>',
  });

  ['L1', 'L2', 'L3'].forEach((n, k) => {
    controls.append(slider(n, {
      min: 0, max: 100, step: 5, value: 100, fmt: (v) => `${v}%`,
      on: (v) => {
        load[k] = v / 100;
        const nI = neutral();
        setNote(nI < 0.06
          ? 'Balanced. The three return currents sum to almost exactly zero, so the neutral carries nothing at all. <b>This is why three phase moves three times the power down four conductors instead of six.</b>'
          : `The neutral is now carrying about ${sig(nI * 100)} per cent of one phase's current. <b>Unbalanced load is carried by the neutral, and a neutral that is undersized or broken on an unbalanced supply is one of the more dangerous faults in a building.</b>`);
        cv.once();
      },
    }).node);
  });

  const neutral = () => {
    // Vector sum of three currents at 120° apart, as a fraction of one phase.
    let x = 0, y = 0;
    for (let k = 0; k < 3; k++) {
      const a = (k * 2 * Math.PI) / 3;
      x += load[k] * Math.cos(a);
      y += load[k] * Math.sin(a);
    }
    return Math.hypot(x, y);
  };

  const cv = canvas(stage, {
    height: 280,
    draw(g, w, h, t) {
      const p = palette();
      const R = role(p);
      const pad = 14;
      const gL = 34, gT = 20, gW = Math.max(140, w - gL - pad - 130), gH = 116;
      const mid = gT + gH / 2;
      const COLS = [R.energy, R.signal, R.safe];

      line(g, gL, mid, gL + gW, mid, { color: p.muted, lw: 1.5 });
      for (let k = 0; k < 3; k++) {
        g.strokeStyle = COLS[k];
        g.lineWidth = 2;
        g.globalAlpha = 0.35 + load[k] * 0.65;
        g.beginPath();
        for (let j = 0; j <= 160; j++) {
          const x = gL + (j / 160) * gW;
          const ph = (j / 160) * 4 * Math.PI - t * 2.4 + (k * 2 * Math.PI) / 3;
          const v = load[k] * Math.sin(ph);
          j ? g.lineTo(x, mid - v * (gH / 2 - 6)) : g.moveTo(x, mid - v * (gH / 2 - 6));
        }
        g.stroke();
        g.globalAlpha = 1;
      }
      // The neutral: the instantaneous sum, drawn on the same axes.
      g.strokeStyle = neutral() < 0.06 ? alpha(p.muted, 0.8) : R.fault;
      g.lineWidth = 2.5;
      g.beginPath();
      for (let j = 0; j <= 160; j++) {
        const x = gL + (j / 160) * gW;
        let s = 0;
        for (let k = 0; k < 3; k++) {
          s += load[k] * Math.sin((j / 160) * 4 * Math.PI - t * 2.4 + (k * 2 * Math.PI) / 3);
        }
        j ? g.lineTo(x, mid - s * (gH / 2 - 6)) : g.moveTo(x, mid - s * (gH / 2 - 6));
      }
      g.stroke();

      ['L1', 'L2', 'L3'].forEach((n, k) => {
        label(g, n, gL - 6, mid - 34 + k * 17, { color: COLS[k], size: 10, align: 'right', weight: 700 });
      });
      label(g, 'N', gL - 6, mid + 34, { color: neutral() < 0.06 ? p.muted : R.fault, size: 10, align: 'right', weight: 700 });

      const nI = neutral();
      const rx = w - 122;
      readoutChip(g, rx, gT + 4, 'NEUTRAL CURRENT', `${Math.round(nI * 100)} %`, {
        color: nI < 0.06 ? R.safe : R.fault, p, w: 112,
      });
      readoutChip(g, rx, gT + 46, 'PHASE TO NEUTRAL', '220 V', { color: R.energy, p, w: 112 });
      readoutChip(g, rx, gT + 88, 'PHASE TO PHASE', '380 V', { color: R.fault, p, w: 112 });

      labelWrap(g,
        'Phase to phase is 1.73 times phase to neutral, because the two are 120° apart rather than opposed. Two separate phases arriving at one piece of scenery is a 380 V hazard in a place nobody expects one.',
        pad, gT + gH + 34, { color: p.ink2, size: 11.5, max: w - pad * 2, maxLines: 4 });
    },
  });
});

// ---------------------------------------------------------------------------
// Where the current goes: live, neutral, earth
// ---------------------------------------------------------------------------

register('mains-path', (host) => {
  let state = 'ok';   // ok | fault-earthed | fault-noearth

  const { controls, stage, setNote } = figure(host, {
    title: 'What the earth conductor is actually for',
    sub: 'A metal-cased appliance. Introduce a fault, then remove the earth, and watch where the current chooses to go.',
    note: '',
  });

  const upd = () => {
    setNote({
      ok: 'In normal operation the earth conductor carries nothing at all. Current goes out on live and back on neutral. <b>An earth conductor that is doing nothing is an earth conductor that is working.</b>',
      'fault-earthed': 'A live conductor has touched the casing. The earth path has almost no resistance, so a very large current flows and the breaker trips in milliseconds. <b>The earth is not draining the fault away, it is making the fault big enough for the protection to notice.</b>',
      'fault-noearth': 'The same fault with the earth missing. Nothing trips, because nothing is drawing extra current. The casing sits at full mains voltage and everything appears to work perfectly. <b>The first thing to complete the circuit will be a person, and this is why a missing earth is both the most dangerous and the most invisible fault in this course.</b>',
    }[state]);
    cv.once();
  };

  controls.append(choice('State', [
    ['ok', 'Normal'], ['fault-earthed', 'Fault, earth intact'], ['fault-noearth', 'Fault, earth missing'],
  ], { value: 'ok', on: (v) => { state = v; upd(); } }).node);

  const cv = canvas(stage, {
    height: 290,
    draw(g, w, h, t) {
      const p = palette();
      const R = role(p);
      const pad = 14;
      const srcX = pad + 30;
      const appX = Math.min(w - 130, pad + 190);
      const rows = [46, 84, 122];
      const COLS = [R.fault, p.ink2, R.safe];
      const NAMES = ['LIVE', 'NEUTRAL', 'EARTH'];
      const hasEarth = state !== 'fault-noearth';
      const faulted = state !== 'ok';

      box(g, pad, 30, 46, 108, { fill: p.raised, stroke: p.line, r: 6 });
      label(g, 'SUPPLY', pad + 23, 24, { color: p.muted, size: 9, align: 'center' });

      box(g, appX, 30, 100, 108, { fill: p.raised, stroke: faulted ? R.fault : p.line, r: 6, lw: faulted ? 2 : 1 });
      label(g, 'appliance', appX + 50, 24, { color: p.muted, size: 9, align: 'center' });
      label(g, 'metal case', appX + 50, 130, { color: faulted && !hasEarth ? R.fault : p.muted, size: 9.5, align: 'center' });

      rows.forEach((y, k) => {
        const present = k < 2 || hasEarth;
        line(g, srcX + 16, y, appX, y, {
          color: present ? COLS[k] : alpha(p.muted, 0.3),
          lw: 2, dash: present ? null : [4, 4],
        });
        label(g, NAMES[k], srcX + 20, y - 11, { color: present ? COLS[k] : p.muted, size: 9, weight: 700 });
        if (k === 2 && !present) {
          label(g, 'missing', appX - 6, y - 11, { color: R.fault, size: 9.5, weight: 700, align: 'right' });
        }
      });

      // The internal load, and the fault bridging live to the case.
      line(g, appX + 20, rows[0], appX + 20, rows[1], { color: p.muted, lw: 1.5 });
      resistorSym(g, appX + 8, (rows[0] + rows[1]) / 2, 24, 12, p.ink2, 1.5);
      if (faulted) {
        line(g, appX + 20, rows[0], appX + 90, rows[0], { color: R.fault, lw: 2 });
        line(g, appX + 90, rows[0], appX + 90, 132, { color: R.fault, lw: 2, dash: [3, 3] });
        label(g, 'fault', appX + 92, rows[0] - 11, { color: R.fault, size: 9.5, weight: 700 });
      }

      // Current, drawn where it actually flows in each state.
      const dot = (x1, y1, x2, y2, col, speed) => {
        for (let k = 0; k < 5; k++) {
          const u = ((t * speed + k / 5) % 1);
          g.fillStyle = col;
          g.beginPath();
          g.arc(x1 + (x2 - x1) * u, y1 + (y2 - y1) * u, 3, 0, Math.PI * 2);
          g.fill();
        }
      };
      dot(srcX + 16, rows[0], appX, rows[0], R.fault, 0.55);
      dot(appX, rows[1], srcX + 16, rows[1], p.ink2, 0.55);
      if (state === 'fault-earthed') dot(appX, rows[2], srcX + 16, rows[2], R.safe, 2.4);

      // The person, who is only ever a path when the earth is not one.
      const px = w - 62;
      const danger = state === 'fault-noearth';
      g.strokeStyle = danger ? R.fault : alpha(p.muted, 0.55);
      g.lineWidth = danger ? 2.5 : 1.5;
      g.beginPath();
      g.arc(px, 46, 8, 0, Math.PI * 2);
      g.moveTo(px, 54); g.lineTo(px, 92);
      g.moveTo(px, 64); g.lineTo(px - 16, 78);
      g.moveTo(px, 64); g.lineTo(px + 12, 76);
      g.moveTo(px, 92); g.lineTo(px - 12, 120);
      g.moveTo(px, 92); g.lineTo(px + 12, 120);
      g.stroke();
      groundSym(g, px, 124, danger ? R.fault : p.muted);
      if (danger) {
        line(g, appX + 100, 84, px - 16, 78, { color: R.fault, lw: 2 });
        dot(appX + 100, 84, px - 16, 78, R.fault, 1.2);
        label(g, 'the only path left', px, 138, { color: R.fault, size: 9.5, align: 'center', weight: 700, max: 110 });
      }

      // The breaker's verdict, which is the whole argument.
      const by = 162;
      const verdict = state === 'ok' ? ['Breaker: quiet', R.safe]
        : state === 'fault-earthed' ? ['Breaker: TRIPS in milliseconds', R.safe]
          : ['Breaker: nothing happens. Everything still works.', R.fault];
      box(g, pad, by, w - pad * 2, 30, {
        fill: alpha(verdict[1], 0.1), stroke: alpha(verdict[1], 0.45), r: 7,
      });
      label(g, verdict[0], pad + 12, by + 15, { color: verdict[1], size: 12, weight: 700, max: w - pad * 2 - 24 });

      labelWrap(g, 'An earth conductor exists to give fault current a path so low in resistance that the protective device trips instantly, instead of the fault finding a path through a person.',
        pad, by + 46, { color: p.ink2, size: 11.5, max: w - pad * 2, maxLines: 3 });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// Foundations
// ---------------------------------------------------------------------------

register('prefix-ladder', (host) => ladder(host, {
  title: 'The prefix ladder',
  sub: 'Every quantity in this course is written with one of these. Each step is a factor of a thousand.',
  note: 'Drag across ten decades and notice that the same physical quantity spans from picofarads to farads. <b>Every calculation you do must be in base units, because mixing milliamps into a formula expecting amps is wrong by exactly a thousand.</b>',
  unit: 'Ω',
  min: 1e-3, max: 1e7, start: 4700,
  sliderLabel: 'Resistance',
  bands: [
    { from: 1e-3, to: 1, name: 'milliohms', tone: 'energy', what: 'Contact resistance, cable resistance, a MOSFET turned on. Small numbers that matter because current is squared' },
    { from: 1, to: 1e3, name: 'ohms', tone: 'signal', what: 'LED series resistors, loudspeaker impedance, gate resistors' },
    { from: 1e3, to: 1e6, name: 'kilohms', tone: 'signal', what: 'Pull-ups, dividers, sensor arms. Most of the resistors on a board' },
    { from: 1e6, to: 1e8, name: 'megohms', tone: 'safe', what: 'Meter input impedance, insulation resistance, a DI box input' },
  ],
  readout: (v, b) => `${eng(v, 'Ω')} sits in the ${b.name}. <b>${b.what}.</b>`,
  footer: 'Engineering shorthand puts the prefix where the decimal point goes: 4k7 is 4.7 kΩ, 2R2 is 2.2 Ω. It exists because a printed decimal point disappears on a faded silkscreen.',
}));

register('formula-wheel', (host) => {
  let known = 'vr';
  let a = 12, b = 100;

  const { controls, stage, setNote } = figure(host, {
    title: 'The three formulae, from any two quantities',
    sub: 'Pick which two you know. The rest follow, and the working is printed.',
    note: '',
  });

  const solve = () => {
    let V, I, Rr, P;
    if (known === 'vr') { V = a; Rr = b; I = V / Rr; P = V * I; }
    else if (known === 'vi') { V = a; I = b; Rr = V / I; P = V * I; }
    else if (known === 'ir') { I = a; Rr = b; V = I * Rr; P = V * I; }
    else { P = a; Rr = b; I = Math.sqrt(P / Rr); V = I * Rr; }
    return { V, I, R: Rr, P };
  };

  const LABELS = {
    vr: ['Voltage', 'V', 1, 48, 12, 'Resistance', 'Ω', 1, 1000, 100],
    vi: ['Voltage', 'V', 1, 48, 12, 'Current', 'A', 0.01, 10, 0.12],
    ir: ['Current', 'A', 0.01, 10, 0.12, 'Resistance', 'Ω', 1, 1000, 100],
    pr: ['Power', 'W', 0.1, 100, 1.44, 'Resistance', 'Ω', 1, 1000, 100],
  };

  let sA, sB;
  const rebuild = () => {
    const [na, ua, mina, maxa, va, nb, ub, minb, maxb, vb] = LABELS[known];
    a = va; b = vb;
    if (sA) sA.node.remove();
    if (sB) sB.node.remove();
    sA = slider(na, {
      min: mina, max: maxa, step: (maxa - mina) / 200, value: va,
      fmt: (v) => eng(v, ua), on: (v) => { a = v; upd(); },
    });
    sB = slider(nb, {
      min: minb, max: maxb, step: (maxb - minb) / 200, value: vb,
      fmt: (v) => eng(v, ub), on: (v) => { b = v; upd(); },
    });
    controls.append(sA.node, sB.node);
    upd();
  };

  const upd = () => {
    const r = solve();
    setNote(`Two quantities fix all four. <b>${eng(r.V, 'V')} across ${eng(r.R, 'Ω')} means ${eng(r.I, 'A')} and ${eng(r.P, 'W')} of heat, and there is no arrangement of the circuit that makes those anything else.</b>`);
    cv.once();
  };

  controls.append(choice('I know', [
    ['vr', 'V and R'], ['vi', 'V and I'], ['ir', 'I and R'], ['pr', 'P and R'],
  ], { value: 'vr', on: (v) => { known = v; rebuild(); } }).node);

  const cv = canvas(stage, {
    height: 240, animated: false,
    draw(g, w) {
      const p = palette();
      const R = role(p);
      const r = solve();
      const pad = 14;
      const cols = w < 460 ? 2 : 4;
      const cw = (w - pad * 2 - (cols - 1) * 8) / cols;
      const QUAD = [
        ['VOLTAGE', eng(r.V, 'V'), R.energy, known.includes('v')],
        ['CURRENT', eng(r.I, 'A'), R.signal, known === 'vi' || known === 'ir'],
        ['RESISTANCE', eng(r.R, 'Ω'), p.ink2, known.includes('r')],
        ['POWER', eng(r.P, 'W'), R.fault, known === 'pr'],
      ];
      QUAD.forEach(([n, v, c, isKnown], k) => {
        const x = pad + (k % cols) * (cw + 8);
        const y = 14 + Math.floor(k / cols) * 62;
        box(g, x, y, cw, 54, {
          fill: isKnown ? alpha(c, 0.16) : p.raised,
          stroke: isKnown ? c : p.line, r: 8, lw: isKnown ? 2 : 1,
        });
        label(g, n, x + cw / 2, y + 15, { color: p.muted, size: 9, align: 'center', max: cw - 10 });
        label(g, v, x + cw / 2, y + 34, { color: c, size: 15, weight: 700, align: 'center', mono: true, max: cw - 10 });
        label(g, isKnown ? 'you set this' : 'follows', x + cw / 2, y + 47, {
          color: p.muted, size: 8.5, align: 'center',
        });
      });

      const wy = 14 + Math.ceil(4 / cols) * 62 + 12;
      const lines = {
        vr: [`I = V ÷ R = ${sig(r.V)} ÷ ${sig(r.R)} = ${eng(r.I, 'A')}`, `P = V × I = ${sig(r.V)} × ${sig(r.I)} = ${eng(r.P, 'W')}`],
        vi: [`R = V ÷ I = ${sig(r.V)} ÷ ${sig(r.I)} = ${eng(r.R, 'Ω')}`, `P = V × I = ${eng(r.P, 'W')}`],
        ir: [`V = I × R = ${sig(r.I)} × ${sig(r.R)} = ${eng(r.V, 'V')}`, `P = I² × R = ${eng(r.P, 'W')}`],
        pr: [`I = √(P ÷ R) = √(${sig(r.P)} ÷ ${sig(r.R)}) = ${eng(r.I, 'A')}`, `V = I × R = ${eng(r.V, 'V')}`],
      }[known];
      lines.forEach((ln, k) => label(g, ln, pad, wy + k * 19, {
        color: p.ink2, size: 11.5, mono: true, max: w - pad * 2,
      }));
    },
  });
  rebuild();
});

register('series-parallel-math', (host) => {
  let vals = [100, 220, 470];
  let series = true;

  const { controls, stage, setNote } = figure(host, {
    title: 'Adding resistances, and the check that catches your arithmetic',
    sub: 'Three resistors. Switch between arrangements and watch which direction the total moves.',
    note: '',
  });

  const total = () => (series
    ? vals.reduce((s, v) => s + v, 0)
    : 1 / vals.reduce((s, v) => s + 1 / v, 0));

  const upd = () => {
    const T = total();
    setNote(series
      ? `In series the resistances add: ${eng(T, 'Ω')}, which is larger than any single one. <b>The total is always bigger than the biggest, and if your answer is not, you have made an arithmetic error.</b>`
      : `In parallel the reciprocals add: ${eng(T, 'Ω')}. <b>A parallel combination is always smaller than the smallest resistor in it, which is the free sanity check that catches nearly every mistake in this calculation.</b>`);
    cv.once();
  };

  controls.append(choice('Arrangement', [['s', 'Series'], ['p', 'Parallel']], {
    value: 's', on: (v) => { series = v === 's'; upd(); },
  }).node);
  vals.forEach((v, k) => controls.append(slider(`R${k + 1}`, {
    min: 10, max: 1000, step: 10, value: v, fmt: (x) => eng(x, 'Ω'),
    on: (x) => { vals[k] = x; upd(); },
  }).node));

  const cv = canvas(stage, {
    height: 230, animated: false,
    draw(g, w) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const T = total();
      const smallest = Math.min(...vals);
      const largest = Math.max(...vals);

      if (series) {
        const y = 46;
        const each = (w - pad * 2) / 3;
        vals.forEach((v, k) => {
          const x = pad + k * each;
          line(g, x, y, x + each, y, { color: p.muted, lw: 2 });
          resistorSym(g, x + each * 0.2, y, each * 0.6, 16, R.signal, 2.5);
          label(g, eng(v, 'Ω'), x + each / 2, y + 22, { color: p.ink2, size: 11, align: 'center', mono: true });
        });
      } else {
        const x = pad + 40;
        const bw = w - pad * 2 - 80;
        vals.forEach((v, k) => {
          const y = 30 + k * 40;
          line(g, x, y, x + bw, y, { color: p.muted, lw: 2 });
          resistorSym(g, x + bw * 0.3, y, bw * 0.4, 16, R.signal, 2.5);
          label(g, eng(v, 'Ω'), x + bw + 8, y, { color: p.ink2, size: 11, mono: true });
        });
        line(g, x, 30, x, 110, { color: p.muted, lw: 2 });
        line(g, x + bw, 30, x + bw, 110, { color: p.muted, lw: 2 });
      }

      const wy = series ? 96 : 138;
      const work = series
        ? `R = ${vals.map((v) => sig(v)).join(' + ')} = ${eng(T, 'Ω')}`
        : `1/R = ${vals.map((v) => `1/${sig(v)}`).join(' + ')}\nR = ${eng(T, 'Ω')}`;
      work.split('\n').forEach((ln, k) => label(g, ln, pad, wy + k * 19, {
        color: p.ink, size: 12, mono: true, weight: 600, max: w - pad * 2,
      }));

      const cy = wy + (series ? 26 : 45);
      const ok = series ? T > largest : T < smallest;
      box(g, pad, cy, w - pad * 2, 30, {
        fill: alpha(ok ? R.safe : R.fault, 0.1), stroke: alpha(ok ? R.safe : R.fault, 0.45), r: 7,
      });
      label(g, series
        ? `Check: ${eng(T, 'Ω')} is larger than the largest, ${eng(largest, 'Ω')} ✓`
        : `Check: ${eng(T, 'Ω')} is smaller than the smallest, ${eng(smallest, 'Ω')} ✓`,
      pad + 12, cy + 15, { color: ok ? R.safe : R.fault, size: 11.5, weight: 600, max: w - pad * 2 - 24 });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// Energy, and what it costs
// ---------------------------------------------------------------------------

register('energy-cost', (host) => {
  let watts = 500, count = 100, hours = 3, days = 28;
  const TARIFF = 1.3;   // HK$ per kWh, indicative commercial rate

  const { controls, stage, setNote, challenge } = figure(host, {
    title: 'Power is what it draws. Energy is what it costs.',
    sub: 'One lamp for one show is nothing. A rig for a run is a number somebody has to find.',
    note: '',
  });

  const kwh = () => (watts * count * hours * days) / 1000;

  const upd = () => {
    const e = kwh();
    setNote(`${count} × ${watts} W for ${hours} hours over ${days} performances is ${sig(e)} kWh, about HK$${Math.round(e * TARIFF)}. <b>One lamp for one show is two dollars and irrelevant; a rig for a run is the number that moved this industry to LED far faster than any argument about colour quality.</b>`);
    cv.once();
  };

  controls.append(slider('Watts each', {
    min: 25, max: 2000, step: 25, value: 500, fmt: (v) => `${v} W`,
    on: (v) => { watts = v; upd(); },
  }).node);
  controls.append(slider('How many', {
    min: 1, max: 200, step: 1, value: 100, fmt: (v) => String(v),
    on: (v) => { count = v; upd(); },
  }).node);
  controls.append(slider('Hours per show', {
    min: 1, max: 8, step: 0.5, value: 3, fmt: (v) => `${v} h`,
    on: (v) => { hours = v; upd(); },
  }).node);
  controls.append(slider('Performances', {
    min: 1, max: 60, step: 1, value: 28, fmt: (v) => String(v),
    on: (v) => { days = v; upd(); },
  }).node);

  challenge('Find a rig and a run that costs more than five thousand dollars in electricity.',
    () => kwh() * TARIFF > 5000);

  const cv = canvas(stage, {
    height: 250, animated: false,
    draw(g, w) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const e = kwh();
      const totalW = watts * count;

      // The chain of multiplications, drawn, because that is the whole idea.
      const steps = [
        [`${watts} W`, 'each'],
        [`× ${count}`, 'fixtures'],
        [`× ${sig(hours)} h`, 'per show'],
        [`× ${days}`, 'shows'],
      ];
      const bw = Math.min(96, (w - pad * 2 - 3 * 8) / 4);
      steps.forEach(([big, small], k) => {
        const x = pad + k * (bw + 8);
        box(g, x, 22, bw, 46, { fill: p.raised, stroke: p.line, r: 7 });
        label(g, big, x + bw / 2, 40, { color: p.ink, size: 13, weight: 700, align: 'center', mono: true, max: bw - 8 });
        label(g, small, x + bw / 2, 56, { color: p.muted, size: 9.5, align: 'center', max: bw - 8 });
      });

      const ry = 84;
      readoutChip(g, pad, ry, 'CONNECTED LOAD', eng(totalW, 'W'), {
        color: R.energy, p, w: Math.min(150, (w - pad * 2 - 12) / 3),
      });
      const cw = Math.min(150, (w - pad * 2 - 12) / 3);
      readoutChip(g, pad + cw + 6, ry, 'ENERGY OVER THE RUN', `${sig(e)} kWh`, { color: R.signal, p, w: cw });
      readoutChip(g, pad + (cw + 6) * 2, ry, 'AT HK$1.30 A UNIT', `$${Math.round(e * TARIFF)}`, {
        color: e * TARIFF > 3000 ? R.fault : R.safe, p, w: cw,
      });

      // The three places this arithmetic decides something.
      const ty = ry + 54;
      const rows = [
        ['Generator', `${sig(totalW / 1000 / 0.9)} kVA before headroom, at a power factor of 0.9`],
        ['Heat in the room', `${eng(totalW, 'W')} of electrical power is ${eng(totalW, 'W')} of heat`],
        ['If it were LED', `about ${eng(totalW * 0.25, 'W')}, so $${Math.round(e * TARIFF * 0.25)} over the same run`],
      ];
      rows.forEach(([a, b], k) => {
        const y = ty + k * 20;
        label(g, a, pad, y, { color: p.muted, size: 11, weight: 600, max: w * 0.3 });
        label(g, b, pad + Math.max(w * 0.32, 120), y, {
          color: p.ink2, size: 11, max: w - pad - Math.max(w * 0.32, 120),
        });
      });
      label(g, 'Every watt of electrical power in a closed room becomes a watt of heat. A dimmer rack is a heater.',
        pad, ty + 68, { color: p.muted, size: 10.5, max: w - pad * 2 });
    },
  });
  upd();
});
