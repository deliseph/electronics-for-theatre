// Class 2: what each meter mode really asks the circuit, and the three
// situations where the honest answer is not the one you wanted.

import { register } from './anim-core.js';
import {
  figure, canvas, slider, toggle, choice, label, labelWrap, box, line, palette,
  alpha, fitter, compare, role, eng, sig,
  arrow, resistorSym, supplySym, groundSym, readoutChip,
} from './anim-kit.js';

// A meter face, drawn the same way in every figure in this module so that the
// reading is always in the same place on the screen.
function meter(g, x, y, w, p, { mode, reading, unit, verdict, tone }) {
  box(g, x, y, w, 78, { fill: p.raised, stroke: tone || p.line, r: 8, lw: tone ? 2 : 1 });
  label(g, mode, x + w / 2, y + 15, { color: p.muted, size: 9, align: 'center', max: w - 12 });
  label(g, reading, x + w / 2, y + 42, {
    color: tone || p.ink, size: 20, weight: 700, align: 'center', mono: true, max: w - 12,
  });
  label(g, unit, x + w / 2, y + 60, { color: p.muted, size: 10, align: 'center' });
  if (verdict) label(g, verdict, x + w / 2, y + 72, { color: tone || p.muted, size: 9.5, align: 'center', weight: 600, max: w - 12 });
}

// ---------------------------------------------------------------------------
// What each mode does
// ---------------------------------------------------------------------------

register('meter-modes', (host) => compare(host, {
  title: 'Four instruments sharing one display',
  sub: 'Each mode connects to the circuit in a completely different way. Confusing them is how meters die.',
  fields: [
    { label: 'What it becomes', key: 'becomes' },
    { label: 'How you connect it', key: 'connect' },
    { label: 'Circuit must be', key: 'live' },
    { label: 'What it really asks', key: 'asks' },
  ],
  items: [
    {
      name: 'Voltage', short: 'V', tone: 'energy',
      line: 'The mode you will use ninety per cent of the time, and the one that disturbs the circuit least.',
      becomes: 'A large resistance, typically 10 MΩ',
      connect: 'In parallel, across the two points you care about',
      live: 'Live. There is nothing to measure otherwise',
      asks: '“How much pressure difference is there between these two points?”',
      note: 'Ten megohms across almost any circuit draws so little current that nothing changes. <b>Almost any: the two exceptions are a high-impedance source and a floating conductor, and both are figures further down this class.</b>',
    },
    {
      name: 'Current', short: 'A', tone: 'fault',
      line: 'The mode that blows fuses, destroys meters and occasionally makes a bang.',
      becomes: 'A near short circuit, a fraction of an ohm',
      connect: 'In series. You must break the circuit and let the current pass through the meter',
      live: 'Live, and rewired to include the meter',
      asks: '“How much charge per second is passing through me?”',
      watch: 'A near-zero-resistance instrument placed ACROSS a supply is a deliberate short circuit. When you move the red lead to the current jack you have changed the instrument into something that must never touch two points at different potentials. Many professionals simply never leave a meter in current mode.',
      note: 'This is the only mode that requires you to take the circuit apart. <b>That inconvenience is not a design flaw, it is the physics: to measure what passes through something, you have to be in the path.</b>',
    },
    {
      name: 'Resistance', short: 'Ω', tone: 'signal',
      line: 'The only mode where the meter supplies the energy rather than observing it.',
      becomes: 'A small current source with a voltmeter across it',
      connect: 'Across the component, with at least one leg lifted',
      live: 'Dead. Any voltage present fights the test current and the reading is meaningless',
      asks: '“If I push a known current through, what voltage appears?”',
      watch: 'You are measuring every path between the probes, not the component. A resistor soldered onto a board is in parallel with everything else on that board, which is why in-circuit readings look wrong and are not.',
      note: 'The meter is injecting current, which is why the circuit must be dead. <b>An in-circuit reading lower than expected is not a faulty component, it is a correct measurement of a parallel path you had not counted.</b>',
    },
    {
      name: 'Continuity', short: '·))', tone: 'safe',
      line: 'Resistance mode with an opinion and a buzzer.',
      becomes: 'The same current source, with a threshold comparator',
      connect: 'Across the path, disconnected from everything',
      live: 'Dead, and disconnected at both ends',
      asks: '“Is the resistance below about thirty ohms?”',
      watch: 'The beep tells you a path exists at that instant, at essentially zero current, with the cable lying still. It does not tell you the path is good enough to carry current, or that it survives being flexed.',
      note: 'A cable that beeps is not a proven cable. <b>A cable that beeps while you flex it along its length and at both strain reliefs is much closer to proven, and that flex test is the most useful five seconds in cable maintenance.</b>',
    },
  ],
  footer: 'Learn the connection as a physical habit rather than a fact. Voltage goes across, current goes through, and resistance needs the circuit dead.',
}));

// ---------------------------------------------------------------------------
// Series against parallel, and the short circuit
// ---------------------------------------------------------------------------

register('meter-in-circuit', (host) => {
  let mode = 'v';       // v | a
  let placement = 'par'; // par | ser

  const { controls, stage, setNote, challenge } = figure(host, {
    title: 'The connection that destroys the meter',
    sub: 'Choose the mode and where you put the probes. Two of the four combinations are wrong, and one is dangerous.',
    note: '',
  });

  const verdict = () => {
    if (mode === 'v' && placement === 'par') return ['ok', '12.0', 'V', 'correct'];
    if (mode === 'v' && placement === 'ser') return ['odd', '11.9', 'V', 'the load is starved'];
    if (mode === 'a' && placement === 'ser') return ['ok', '0.120', 'A', 'correct'];
    return ['bang', '—', '', 'FUSE BLOWN'];
  };

  const upd = () => {
    const [k] = verdict();
    setNote({
      ok: mode === 'v'
        ? 'A high resistance placed across the load. It draws almost nothing and reports the difference. <b>This is the connection you will make thousands of times.</b>'
        : 'A near-zero resistance placed in the path, so all the current passes through it. <b>You had to break the circuit to do this, and that inconvenience is the physics rather than a design flaw.</b>',
      odd: 'A 10 MΩ meter in series with the load blocks nearly all the current. The meter reads almost the whole supply and the load does nothing. <b>Nothing is damaged, and everybody assumes the circuit is broken rather than the measurement.</b>',
      bang: 'A near short circuit placed straight across the supply. The current is limited only by the supply and the meter’s shunt. <b>The fuse in your meter is what stands between this mistake and an arc flash, which is why an unfused meter is not a cheaper meter but a different product.</b>',
    }[k]);
    cv.once();
  };

  controls.append(choice('Meter mode', [['v', 'Voltage'], ['a', 'Current']], {
    value: 'v', on: (v) => { mode = v; upd(); },
  }).node);
  controls.append(choice('Probes', [['par', 'Across the load'], ['ser', 'In the path']], {
    value: 'par', on: (v) => { placement = v; upd(); },
  }).node);

  challenge('Find the one combination that blows the fuse.', () => mode === 'a' && placement === 'par');

  const cv = canvas(stage, {
    height: 260,
    draw(g, w, h, t) {
      const p = palette();
      const R = role(p);
      const [k, reading, unit, note] = verdict();
      const pad = 16;
      const L = pad + 40, T = 40;
      const bw = Math.min(w - pad * 2 - 170, 260);
      const bh = 100;
      const bang = k === 'bang';

      supplySym(g, L, T + bh / 2, 26, R.energy, 2.5);
      label(g, '12 V', L, T + bh / 2 + 26, { color: R.energy, size: 10, align: 'center' });

      g.strokeStyle = bang ? R.fault : p.muted;
      g.lineWidth = bang ? 3 : 2;
      g.beginPath();
      g.moveTo(L, T + bh / 2 - 13); g.lineTo(L, T); g.lineTo(L + bw, T);
      g.moveTo(L, T + bh / 2 + 13); g.lineTo(L, T + bh); g.lineTo(L + bw, T + bh);
      g.stroke();
      // The load.
      const inSeries = placement === 'ser';
      g.save();
      g.translate(L + bw, T + bh / 2);
      g.rotate(Math.PI / 2);
      resistorSym(g, -22, 0, 44, 14, p.ink2, 2.5);
      g.restore();
      line(g, L + bw, T, L + bw, T + bh / 2 - 22, { color: p.muted, lw: 2 });
      line(g, L + bw, T + bh / 2 + 22, L + bw, T + bh, { color: p.muted, lw: 2 });
      label(g, '100 Ω', L + bw + 10, T + bh / 2, { color: p.ink2, size: 10.5 });

      // Where the meter sits.
      const mx = L + bw * 0.34;
      if (inSeries) {
        g.fillStyle = p.surface;
        g.fillRect(mx - 22, T - 4, 44, 8);
        box(g, mx - 20, T - 12, 40, 24, {
          fill: p.raised, stroke: mode === 'a' ? R.safe : R.energy, r: 5, lw: 2,
        });
        label(g, mode === 'a' ? 'A' : 'V', mx, T, {
          color: mode === 'a' ? R.safe : R.energy, size: 13, weight: 800, align: 'center',
        });
        label(g, 'in the path', mx, T - 24, { color: p.muted, size: 9.5, align: 'center' });
      } else {
        const my = T + bh / 2;
        line(g, L + bw, T, L + bw + 0, T, { color: p.muted, lw: 2 });
        line(g, mx, T, mx, my - 14, { color: bang ? R.fault : p.muted, lw: bang ? 3 : 2 });
        line(g, mx, my + 14, mx, T + bh, { color: bang ? R.fault : p.muted, lw: bang ? 3 : 2 });
        box(g, mx - 20, my - 14, 40, 28, {
          fill: p.raised, stroke: bang ? R.fault : R.energy, r: 5, lw: 2,
        });
        label(g, mode === 'a' ? 'A' : 'V', mx, my, {
          color: bang ? R.fault : R.energy, size: 13, weight: 800, align: 'center',
        });
        label(g, 'across the load', mx, my + 28, { color: p.muted, size: 9.5, align: 'center' });
      }

      // Current, and the bang.
      if (!bang) {
        const cur = (mode === 'v' && inSeries) ? 0.02 : 0.6;
        for (let j = 0; j < 6; j++) {
          const u = ((t * cur + j / 6) % 1);
          g.fillStyle = R.energy;
          g.beginPath();
          g.arc(L + u * bw, T + bh, 3, 0, Math.PI * 2);
          g.fill();
        }
      } else {
        const flash = 0.5 + 0.5 * Math.sin(t * 14);
        g.fillStyle = alpha(R.fault, 0.25 + flash * 0.45);
        g.beginPath();
        g.arc(mx, T + bh / 2, 30 + flash * 12, 0, Math.PI * 2);
        g.fill();
        label(g, '⚡', mx, T + bh / 2, { color: p.ink, size: 22, align: 'center' });
      }

      const tone = k === 'ok' ? R.safe : k === 'odd' ? R.energy : R.fault;
      meter(g, w - 120, T, 108, p, {
        mode: mode === 'v' ? 'V⎓  DC volts' : 'A⎓  DC amps',
        reading, unit, verdict: note, tone,
      });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// Continuity, and the flex test
// ---------------------------------------------------------------------------

register('continuity', (host) => {
  let flexing = false;
  let cracked = true;

  const { controls, stage, setNote } = figure(host, {
    title: 'A cable that beeps and still fails',
    sub: 'One conductor has a cracked strand near the connector. Test it still, then flex it.',
    note: '',
  });

  const upd = () => {
    setNote(!cracked
      ? 'A healthy cable: under an ohm, still or moving. <b>Record the number rather than the beep, because a cable at 3 Ω also beeps.</b>'
      : flexing
        ? 'Flexing opens the crack and the resistance jumps. This is the fault that ruins a technical rehearsal and vanishes when you test it afterwards. <b>The flex test is five seconds and it is the only test that finds this.</b>'
        : 'Lying still, the cracked strand is touching and the meter beeps happily. <b>A cable that passes a static continuity test has been proven to conduct while lying on a bench, which is not the job you are asking it to do.</b>');
    cv.once();
  };

  controls.append(toggle('Cracked strand', { value: true, on: (v) => { cracked = v; upd(); } }).node);
  controls.append(toggle('Flex the cable', { value: false, on: (v) => { flexing = v; upd(); } }).node);

  const cv = canvas(stage, {
    height: 240,
    draw(g, w, h, t) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const cy = 74;
      const x0 = pad + 40, x1 = w - 140;
      const open = cracked && flexing;
      const wobble = flexing ? Math.sin(t * 4) * 10 : 0;

      // The cable, bent at the connector when you flex it. The bend is where
      // the failure is, and drawing it anywhere else would teach the wrong thing.
      g.strokeStyle = open ? R.fault : R.safe;
      g.lineWidth = 5;
      g.beginPath();
      g.moveTo(x0, cy);
      g.quadraticCurveTo((x0 + x1) / 2, cy + wobble * 2, x1, cy);
      g.stroke();

      box(g, x0 - 34, cy - 14, 34, 28, { fill: p.raised, stroke: p.line, r: 4 });
      box(g, x1, cy - 14, 34, 28, { fill: p.raised, stroke: p.line, r: 4 });

      // The strain relief, and the crack that lives in it.
      const fx = x0 + 26;
      box(g, fx - 8, cy - 9, 16, 18, { fill: alpha(p.muted, 0.25), stroke: p.line, r: 3 });
      if (cracked) {
        g.strokeStyle = open ? R.fault : alpha(R.fault, 0.5);
        g.lineWidth = open ? 3 : 1.5;
        g.beginPath();
        g.moveTo(fx - 4, cy - 8);
        g.lineTo(fx + 3, cy + 8);
        g.stroke();
        label(g, open ? 'open' : 'cracked, touching', fx, cy - 22, {
          color: open ? R.fault : p.muted, size: 9.5, align: 'center', weight: open ? 700 : 500,
        });
      }
      label(g, 'strain relief', fx, cy + 26, { color: p.muted, size: 9, align: 'center' });

      if (!open) {
        for (let k = 0; k < 6; k++) {
          const u = ((t * 0.5 + k / 6) % 1);
          g.fillStyle = R.safe;
          g.beginPath();
          g.arc(x0 + u * (x1 - x0), cy + Math.sin(Math.PI * u) * wobble, 3, 0, Math.PI * 2);
          g.fill();
        }
      }

      const val = open ? '—' : cracked ? '0.9' : '0.3';
      meter(g, w - 116, 34, 104, p, {
        mode: 'Ω  ·)) continuity',
        reading: val,
        unit: open ? 'open circuit' : 'ohms',
        verdict: open ? 'no beep' : 'BEEP',
        tone: open ? R.fault : R.safe,
      });

      const ty = 150;
      const rows = [
        ['1. Continuity, pin to pin', 'under 1 Ω, and write the number down'],
        ['2. Isolation, pin to pin', 'open. This catches the stray strand bridging two pins'],
        ['3. Isolation to shell', 'open, unless the design bonds the shield, and then label it'],
        ['4. The flex test', 'repeat step 1 while flexing both ends and the length'],
        ['5. Label it', 'date and initial, or it is tested again next week'],
      ];
      rows.forEach(([a, b], k) => {
        const y = ty + k * 17;
        const hot = (k === 3 && flexing) || (k === 0 && !flexing);
        label(g, a, pad, y, { color: hot ? R.signal : p.ink2, size: 10.5, weight: hot ? 700 : 500, max: w * 0.42 });
        label(g, b, pad + Math.max(w * 0.44, 150), y, { color: p.muted, size: 10, max: w - pad - Math.max(w * 0.44, 150) });
      });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// Ghost voltage
// ---------------------------------------------------------------------------

register('ghost-voltage', (host) => {
  let loaded = false;

  const { controls, stage, setNote } = figure(host, {
    title: 'Ghost voltage: a real reading with nothing behind it',
    sub: 'A disconnected conductor running beside a live one. Load it and watch the reading collapse.',
    note: '',
  });

  const upd = () => {
    setNote(loaded
      ? 'With a 100 kΩ load the reading collapses to almost nothing, because there was almost no current available to hold it up. <b>A voltage that disappears when you load it was never going to do any work, and a low-impedance meter setting does the same job in one button press.</b>'
      : 'A 10 MΩ meter reads 62 V on a conductor that is connected to nothing. It is genuinely there, capacitively coupled through the insulation from the live cable running alongside. <b>The reading is real and the energy behind it is not, and the wrong response is to start ignoring readings you do not like.</b>');
    cv.once();
  };

  controls.append(toggle('Load it with 100 kΩ', { value: false, on: (v) => { loaded = v; upd(); } }).node);

  const cv = canvas(stage, {
    height: 250,
    draw(g, w, h, t) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const x0 = pad + 20, x1 = w - 132;
      const yLive = 50, yDead = 88;

      line(g, x0, yLive, x1, yLive, { color: R.fault, lw: 3 });
      label(g, 'LIVE, energised', x0, yLive - 14, { color: R.fault, size: 10, weight: 700 });
      for (let k = 0; k < 8; k++) {
        const u = ((t * 0.5 + k / 8) % 1);
        g.fillStyle = R.fault;
        g.beginPath();
        g.arc(x0 + u * (x1 - x0), yLive, 3, 0, Math.PI * 2);
        g.fill();
      }

      line(g, x0, yDead, x1, yDead, { color: p.muted, lw: 3 });
      label(g, 'DISCONNECTED at both ends', x0, yDead + 18, { color: p.muted, size: 10, weight: 600 });
      // The disconnection, drawn, so nobody can think it is a wiring diagram error.
      line(g, x0 - 14, yDead, x0 - 4, yDead, { color: p.muted, lw: 3 });
      label(g, '✕', x0 - 9, yDead - 12, { color: R.fault, size: 11, align: 'center' });

      // The coupling capacitance between them, which is the mechanism.
      const n = 5;
      for (let k = 0; k < n; k++) {
        const x = x0 + 40 + k * ((x1 - x0 - 80) / (n - 1));
        line(g, x, yLive + 4, x, yLive + 12, { color: alpha(R.signal, 0.7), lw: 1.5 });
        line(g, x - 6, yLive + 12, x + 6, yLive + 12, { color: alpha(R.signal, 0.9), lw: 2 });
        line(g, x - 6, yLive + 18, x + 6, yLive + 18, { color: alpha(R.signal, 0.9), lw: 2 });
        line(g, x, yLive + 18, x, yDead - 4, { color: alpha(R.signal, 0.7), lw: 1.5 });
      }
      label(g, 'coupling capacitance through the insulation', x0 + 44, yLive + 30, {
        color: R.signal, size: 9.5, max: x1 - x0 - 80,
      });

      // The load, when fitted.
      if (loaded) {
        const lx = x1 - 60;
        line(g, lx, yDead, lx, yDead + 30, { color: p.ink2, lw: 2 });
        g.save();
        g.translate(lx, yDead + 44);
        g.rotate(Math.PI / 2);
        resistorSym(g, -14, 0, 28, 12, R.safe, 2);
        g.restore();
        groundSym(g, lx, yDead + 62, p.muted);
        label(g, '100 kΩ', lx + 12, yDead + 44, { color: R.safe, size: 10 });
      }

      meter(g, w - 116, 34, 104, p, {
        mode: 'V~  AC volts',
        reading: loaded ? '0.4' : '62.1',
        unit: 'volts',
        verdict: loaded ? 'nothing behind it' : 'real, but no energy',
        tone: loaded ? R.safe : R.energy,
      });

      labelWrap(g, loaded
        ? 'The coupling can supply microamps. A hundred kilohms is enough to pull it flat, and so is a low-impedance meter mode or a proving unit.'
        : 'The wrong lesson to draw is that meters are unreliable. The right one is to know which readings are high impedance and to load them before believing them.',
      pad, 168, { color: p.ink2, size: 11.5, max: w - pad * 2, maxLines: 3 });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// The loading effect
// ---------------------------------------------------------------------------

register('loading-effect', (host) => {
  let Rarm = 1e6;
  const Vin = 10, Rm = 10e6;

  const { controls, stage, setNote, challenge } = figure(host, {
    title: 'The meter changes the thing it measures',
    sub: 'A divider of two equal resistors on 10 V. It should read 5 V. Raise the resistor values and watch it stop.',
    note: '',
  });

  const reading = () => {
    // The meter's 10 MΩ sits across the lower arm.
    const lower = (Rarm * Rm) / (Rarm + Rm);
    return Vin * (lower / (Rarm + lower));
  };

  const upd = () => {
    const v = reading();
    const err = ((5 - v) / 5) * 100;
    setNote(err < 1
      ? `At ${eng(Rarm, 'Ω')} per arm the meter reads ${sig(v)} V, essentially the true 5 V. <b>A 10 MΩ meter across a low-impedance divider changes nothing you can see.</b>`
      : `At ${eng(Rarm, 'Ω')} per arm the meter reads ${sig(v)} V instead of 5 V, an error of ${sig(err)} per cent. <b>The divider really is at 5 V; the difference is your instrument drawing current, and the rule of thumb is that a source above about a hundredth of the meter's impedance will read low.</b>`);
    cv.once();
  };

  controls.append(slider('Each arm', {
    min: 0, max: 40, step: 1, value: 20,
    fmt: (k) => eng(10 ** (2 + k / 10), 'Ω'),
    on: (k) => { Rarm = 10 ** (2 + k / 10); upd(); },
  }).node);
  Rarm = 10 ** (2 + 20 / 10);

  challenge('Make the meter read below 4.0 V on a divider that is genuinely at 5 V.', () => reading() < 4);

  const cv = canvas(stage, {
    height: 260, animated: false,
    draw(g, w) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const x = Math.min(110, w * 0.26);
      const T = 30, gap = 60;
      const v = reading();
      const err = ((5 - v) / 5) * 100;

      supplySym(g, x - 56, T + gap, 26, R.energy, 2.5);
      label(g, '10 V', x - 56, T + gap + 26, { color: R.energy, size: 10, align: 'center' });
      line(g, x - 56, T + gap - 13, x - 56, T, { color: p.muted, lw: 1.5 });
      line(g, x - 56, T, x, T, { color: p.muted, lw: 1.5 });
      line(g, x - 56, T + gap + 13, x - 56, T + gap * 2, { color: p.muted, lw: 1.5 });
      line(g, x - 56, T + gap * 2, x, T + gap * 2, { color: p.muted, lw: 1.5 });
      groundSym(g, x - 56, T + gap * 2 + 6, p.muted);

      line(g, x, T, x, T + gap * 2, { color: p.muted, lw: 2 });
      resistorSym(g, x - 22, T + gap / 2, 44, 14, p.ink2, 2.5);
      resistorSym(g, x - 22, T + gap * 1.5, 44, 14, p.ink2, 2.5);
      label(g, eng(Rarm, 'Ω'), x + 30, T + gap / 2, { color: p.ink2, size: 10.5, mono: true });
      label(g, eng(Rarm, 'Ω'), x + 30, T + gap * 1.5, { color: p.ink2, size: 10.5, mono: true });

      // The meter, drawn as the third resistor it actually is.
      const mx = Math.min(x + 130, w - 150);
      line(g, x, T + gap, mx, T + gap, { color: R.energy, lw: 2 });
      line(g, mx, T + gap, mx, T + gap + 26, { color: R.energy, lw: 2 });
      g.save();
      g.translate(mx, T + gap + 44);
      g.rotate(Math.PI / 2);
      resistorSym(g, -16, 0, 32, 12, err > 1 ? R.fault : alpha(p.muted, 0.6), 2);
      g.restore();
      line(g, mx, T + gap + 62, mx, T + gap * 2, { color: R.energy, lw: 2 });
      line(g, mx, T + gap * 2, x, T + gap * 2, { color: R.energy, lw: 2 });
      label(g, '10 MΩ', mx + 12, T + gap + 44, {
        color: err > 1 ? R.fault : p.muted, size: 10, weight: err > 1 ? 700 : 500,
      });
      label(g, 'the meter is a resistor', mx - 6, T + gap - 12, {
        color: R.energy, size: 9.5, align: 'right', max: mx - x - 10,
      });

      meter(g, w - 122, T, 110, p, {
        mode: 'V⎓  DC volts',
        reading: sig(v),
        unit: 'volts',
        verdict: err > 1 ? `${sig(err)}% low` : 'no visible error',
        tone: err > 5 ? R.fault : err > 1 ? R.energy : R.safe,
      });

      const wy = T + gap * 2 + 40;
      label(g, `True divider output    5.00 V`, pad, wy, { color: p.muted, size: 11, mono: true });
      label(g, `Meter in parallel      ${eng((Rarm * 10e6) / (Rarm + 10e6), 'Ω')} across the lower arm`, pad, wy + 17, {
        color: p.muted, size: 11, mono: true, max: w - pad * 2,
      });
      label(g, `Reading                ${sig(v)} V`, pad, wy + 34, {
        color: err > 1 ? R.fault : R.safe, size: 11, mono: true, weight: 700,
      });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// Averaging against true RMS
// ---------------------------------------------------------------------------

register('true-rms', (host) => {
  let shape = 'sine';

  const { controls, stage, setNote } = figure(host, {
    title: 'Averaging meters, and the 1.11 that is only true for a sine',
    sub: 'The same real RMS voltage in three shapes. One meter is right about all of them.',
    note: '',
  });

  // Each shape carries the same true RMS. What differs is the mean of the
  // rectified waveform, which is all a cheap meter actually measures.
  const SHAPES = {
    sine: { name: 'Sine wave', meanFactor: 1.0, what: 'The mains, undisturbed. This is the one the 1.11 factor was derived for.' },
    dimmer: { name: 'Phase-controlled dimmer', meanFactor: 0.74, what: 'Half the waveform chopped away. Almost every dimmer in an older rig.' },
    smps: { name: 'Switch-mode supply', meanFactor: 0.62, what: 'Current drawn in narrow spikes at the peaks. Every LED fixture, media server and laptop charger.' },
  };

  const upd = () => {
    const s = SHAPES[shape];
    const avgReading = 230 * s.meanFactor;
    const err = ((avgReading - 230) / 230) * 100;
    setNote(shape === 'sine'
      ? 'On a clean sine both meters agree, which is exactly why the cheap method survived. <b>It was calibrated on the only waveform that used to exist.</b>'
      : `The true RMS meter reads 230 V, correctly. The averaging meter reads ${Math.round(avgReading)} V, an error of ${sig(err)} per cent. <b>Almost nothing in a modern theatre draws a clean sine, so an averaging meter is wrong most of the time and wrong by an amount you cannot predict.</b>`);
    cv.once();
  };

  controls.append(choice('Waveform', Object.entries(SHAPES).map(([k, v]) => [k, v.name]), {
    value: 'sine', on: (v) => { shape = v; upd(); },
  }).node);

  const cv = canvas(stage, {
    height: 270,
    draw(g, w, h, t) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const gL = 30, gT = 22, gW = Math.max(120, w - gL - pad - 230), gH = 108;
      const mid = gT + gH / 2;
      const s = SHAPES[shape];

      const wave = (ph) => {
        const u = ((ph % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const base = Math.sin(u);
        if (shape === 'sine') return base;
        if (shape === 'dimmer') {
          // Conducting only after the firing angle in each half cycle.
          const inHalf = u % Math.PI;
          return inHalf < Math.PI * 0.45 ? 0 : base * 1.35;
        }
        // Narrow current spikes near each peak.
        const d = Math.min(Math.abs(u - Math.PI / 2), Math.abs(u - 3 * Math.PI / 2));
        return (d < 0.34 ? Math.sign(base) : 0) * 2.6 * Math.cos((d / 0.34) * (Math.PI / 2));
      };

      line(g, gL, mid, gL + gW, mid, { color: p.muted, lw: 1.5 });
      line(g, gL, gT, gL, gT + gH, { color: p.muted, lw: 1.5 });
      g.strokeStyle = R.energy;
      g.lineWidth = 2.2;
      g.beginPath();
      for (let k = 0; k <= 260; k++) {
        const x = gL + (k / 260) * gW;
        const v = wave((k / 260) * 4 * Math.PI - t * 2.4);
        k ? g.lineTo(x, mid - v * (gH / 2 - 8) / 2.8) : g.moveTo(x, mid - v * (gH / 2 - 8) / 2.8);
      }
      g.stroke();
      label(g, s.name, gL, gT - 8, { color: p.ink2, size: 10.5, weight: 600, max: gW });

      const mx = w - 220;
      meter(g, mx, gT, 100, p, {
        mode: 'Averaging meter',
        reading: String(Math.round(230 * s.meanFactor)),
        unit: 'volts',
        verdict: shape === 'sine' ? 'correct' : 'WRONG',
        tone: shape === 'sine' ? R.safe : R.fault,
      });
      meter(g, mx + 108, gT, 100, p, {
        mode: 'True RMS meter',
        reading: '230',
        unit: 'volts',
        verdict: 'correct',
        tone: R.safe,
      });

      labelWrap(g, s.what, pad, gT + gH + 26, { color: p.ink2, size: 11.5, max: w - pad * 2, maxLines: 2 });
      labelWrap(g,
        'An averaging meter measures the mean of the rectified waveform and multiplies by 1.11, which is the correct factor for a sine and the wrong factor for everything else. A true RMS meter computes the actual heating value whatever the shape.',
        pad, gT + gH + 62, { color: p.muted, size: 11, max: w - pad * 2, maxLines: 4 });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// The clamp meter
// ---------------------------------------------------------------------------

register('clamp-meter', (host) => {
  let around = 'live';   // live | both | ten
  let dc = false;

  const { controls, stage, setNote, challenge } = figure(host, {
    title: 'Measuring current without opening the circuit',
    sub: 'Clamp one conductor, then the whole flex, and see why the second reads nothing.',
    note: '',
  });

  const reading = () => {
    if (around === 'both') return 0;
    if (around === 'ten') return 8.4;   // ten turns of a 0.84 A load
    return dc ? 0 : 8.4;
  };

  const upd = () => {
    setNote(around === 'both'
      ? 'Around the whole flex the live and neutral currents are equal and opposite, so their magnetic fields cancel and the meter reads zero. <b>That is not a fault, it is exactly the physics an RCD uses to detect a leakage, and it catches everybody once.</b>'
      : around === 'ten'
        ? 'Ten turns of the conductor through the jaw multiplies the field by ten, so a small current becomes readable and you divide the answer by ten. <b>An old trick, and it genuinely works: below about an amp a general-purpose clamp is otherwise guessing.</b>'
        : dc
          ? 'A cheap clamp works by transformer action, and a steady field induces nothing, so it reads zero on DC however much is flowing. <b>Reading DC needs a Hall-effect clamp, and that is most of the price difference between two meters that look identical.</b>'
          : 'Around one conductor only, the field is proportional to the current in it. Nothing is disconnected and nothing is touched. <b>For a technical director this is often the more useful of the two instruments: it is the only practical way to ask what a circuit is actually drawing on a live installation.</b>');
    cv.once();
  };

  controls.append(choice('Clamp around', [
    ['live', 'The live only'], ['both', 'The whole flex'], ['ten', 'Ten turns of the live'],
  ], { value: 'live', on: (v) => { around = v; upd(); } }).node);
  controls.append(toggle('Load is DC', { value: false, on: (v) => { dc = v; upd(); } }).node);

  challenge('Make a real current read as zero, twice, for two different reasons.',
    () => around === 'both' || (dc && around === 'live'));

  const cv = canvas(stage, {
    height: 260,
    draw(g, w, h, t) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const cy = 74;
      const x0 = pad + 24, x1 = w - 130;
      const val = reading();

      // The conductors.
      const both = around === 'both';
      line(g, x0, cy - 9, x1, cy - 9, { color: R.fault, lw: 3 });
      line(g, x0, cy + 9, x1, cy + 9, { color: p.ink2, lw: 3 });
      label(g, 'LIVE', x0, cy - 22, { color: R.fault, size: 9.5, weight: 700 });
      label(g, 'NEUTRAL', x0, cy + 24, { color: p.ink2, size: 9.5, weight: 700 });

      // Current, out on live and back on neutral. Equal and opposite is the
      // whole point, so it is drawn as such.
      const speed = dc ? 0.5 : 0.5;
      for (let k = 0; k < 7; k++) {
        const u = ((t * speed + k / 7) % 1);
        g.fillStyle = R.fault;
        g.beginPath(); g.arc(x0 + u * (x1 - x0), cy - 9, 3, 0, Math.PI * 2); g.fill();
        g.fillStyle = p.ink2;
        g.beginPath(); g.arc(x1 - u * (x1 - x0), cy + 9, 3, 0, Math.PI * 2); g.fill();
      }

      // The jaw, around whatever was chosen.
      const jx = (x0 + x1) / 2;
      const jy = both ? cy : cy - 9;
      const jr = both ? 30 : 20;
      g.strokeStyle = R.signal;
      g.lineWidth = 4;
      g.beginPath();
      g.arc(jx, jy, jr, -Math.PI * 0.42, Math.PI * 1.42);
      g.stroke();
      label(g, both ? 'around both' : around === 'ten' ? 'ten turns' : 'around live only', jx, jy - jr - 10, {
        color: R.signal, size: 9.5, align: 'center', max: 150,
      });

      // Ten turns, drawn as extra loops through the jaw.
      if (around === 'ten') {
        for (let k = 1; k <= 4; k++) {
          g.strokeStyle = alpha(R.fault, 0.45);
          g.lineWidth = 2;
          g.beginPath();
          g.ellipse(jx, cy - 9, 14 + k * 3, 22 + k * 4, 0, 0, Math.PI * 2);
          g.stroke();
        }
      }

      // The fields, and their cancellation.
      if (!dc || around === 'ten') {
        const mag = both ? 0 : 1;
        for (let k = 1; k <= 2; k++) {
          g.strokeStyle = alpha(R.energy, (both ? 0.12 : 0.4) / k);
          g.lineWidth = 1.5;
          g.beginPath(); g.arc(jx, cy - 9, 8 + k * 7, 0, Math.PI * 2); g.stroke();
          if (both) {
            g.strokeStyle = alpha(R.signal, 0.12 / k);
            g.beginPath(); g.arc(jx, cy + 9, 8 + k * 7, 0, Math.PI * 2); g.stroke();
          }
        }
        if (both) {
          label(g, 'equal and opposite: they cancel', jx, cy + 46, {
            color: R.fault, size: 10, align: 'center', weight: 600, max: 200,
          });
        }
      } else {
        label(g, 'steady field: nothing to induce', jx, cy + 40, {
          color: R.fault, size: 10, align: 'center', weight: 600, max: 200,
        });
      }

      meter(g, w - 116, 36, 104, p, {
        mode: around === 'ten' ? 'A~ clamp (÷10)' : 'A~ clamp',
        reading: val === 0 ? '0.00' : sig(around === 'ten' ? val / 10 : val),
        unit: 'amps',
        verdict: val === 0 ? 'reads nothing' : 'correct',
        tone: val === 0 ? R.fault : R.safe,
      });

      const ty = 150;
      const rows = [
        ['Clamp one conductor only', 'around a whole flex the currents cancel and it reads zero'],
        ['AC clamps are common, DC are not', 'a Hall-effect jaw reads both, and costs more'],
        ['Below about an amp it is guessing', 'ten turns through the jaw, then divide by ten'],
        ['True RMS matters most here', 'what you clamp is usually a dimmer or a switching load'],
      ];
      rows.forEach(([a, b], k) => {
        const y = ty + k * 18;
        label(g, a, pad, y, { color: p.ink2, size: 10.5, weight: 600, max: w * 0.4 });
        label(g, b, pad + Math.max(w * 0.42, 160), y, {
          color: p.muted, size: 10.5, max: w - pad - Math.max(w * 0.42, 160),
        });
      });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// Insulation testing
// ---------------------------------------------------------------------------

register('insulation-test', (host) => {
  let testV = 500;
  let condition = 'good';

  const COND = {
    good: ['Healthy cable', 900],
    damp: ['Damp, or contaminated', 1.2],
    damaged: ['Insulation damaged', 0.2],
  };

  const { controls, stage, setNote, challenge } = figure(host, {
    title: 'Insulation that looks fine at two volts',
    sub: 'Your multimeter asks at a couple of volts. This asks at five hundred, and gets a different answer.',
    note: '',
  });

  // Weak insulation breaks down as the applied voltage rises; healthy
  // insulation does not care.
  const resistance = () => {
    const base = COND[condition][1];
    if (condition === 'good') return base;
    return base * Math.max(0.02, 1 - (testV / 1000) * 0.92);
  };

  const upd = () => {
    const r = resistance();
    setNote(condition === 'good'
      ? `${sig(r)} MΩ at ${testV} V, and it barely moves with the test voltage. <b>That is what healthy insulation looks like: the reading is the same question answered the same way however hard you ask.</b>`
      : `At 2 V a multimeter would report this as open circuit. At ${testV} V it reads ${sig(r)} MΩ. <b>The insulation breaks down under the voltage it will actually see in service, which is precisely the gap between the two instruments and the whole reason this one exists.</b>`);
    cv.once();
  };

  controls.append(choice('Test voltage', [[250, '250 V'], [500, '500 V'], [1000, '1000 V']], {
    value: 500, on: (v) => { testV = +v; upd(); },
  }).node);
  controls.append(choice('Cable', Object.entries(COND).map(([k, v]) => [k, v[0]]), {
    value: 'good', on: (v) => { condition = v; upd(); },
  }).node);

  challenge('Find a cable a multimeter would pass and an insulation tester fails.',
    () => condition !== 'good' && resistance() < 1);

  const cv = canvas(stage, {
    height: 270,
    draw(g, w, h, t) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const r = resistance();
      const cy = 62;
      const x0 = pad + 20, x1 = w - 132;

      // Conductor, insulation, and the earth outside it.
      line(g, x0, cy, x1, cy, { color: R.fault, lw: 4 });
      const bad = condition !== 'good';
      g.strokeStyle = bad ? alpha(R.fault, 0.5) : alpha(R.safe, 0.7);
      g.lineWidth = 12;
      g.globalAlpha = 0.28;
      g.beginPath();
      g.moveTo(x0, cy); g.lineTo(x1, cy);
      g.stroke();
      g.globalAlpha = 1;
      label(g, 'conductor, at the test voltage', x0, cy - 22, { color: R.fault, size: 10 });
      line(g, x0, cy + 34, x1, cy + 34, { color: R.safe, lw: 2 });
      groundSym(g, (x0 + x1) / 2, cy + 38, R.safe);
      label(g, 'earth, or the other conductor', x0, cy + 52, { color: R.safe, size: 10 });

      // Leakage, drawn where the insulation is failing.
      if (r < 100) {
        const n = r < 1 ? 5 : 2;
        for (let k = 0; k < n; k++) {
          const lx = x0 + 50 + k * ((x1 - x0 - 100) / Math.max(1, n - 1));
          const u = ((t * 1.4 + k / n) % 1);
          line(g, lx, cy + 6, lx, cy + 32, { color: alpha(R.fault, 0.45), lw: 1.5, dash: [3, 3] });
          g.fillStyle = R.fault;
          g.beginPath();
          g.arc(lx, cy + 6 + u * 26, 2.8, 0, Math.PI * 2);
          g.fill();
        }
        label(g, 'leakage', (x0 + x1) / 2, cy + 18, {
          color: R.fault, size: 9.5, align: 'center', weight: 700,
        });
      }

      const tone = r > 100 ? R.safe : r > 2 ? R.energy : R.fault;
      meter(g, w - 120, 30, 108, p, {
        mode: `${testV} V insulation`,
        reading: r > 999 ? '>999' : sig(r),
        unit: 'megohms',
        verdict: r > 100 ? 'healthy' : r > 2 ? 'investigate' : 'FAIL',
        tone,
      });
      meter(g, w - 120, 118, 108, p, {
        mode: 'Multimeter at 2 V',
        reading: 'OL',
        unit: 'open circuit',
        verdict: bad ? 'says nothing is wrong' : 'agrees',
        tone: bad ? R.fault : p.muted,
      });

      const ty = 152;
      const bands = [
        ['Above 100 MΩ', 'healthy', R.safe],
        ['2 to 100 MΩ', 'usually acceptable, note it and re-test', R.safe],
        ['Under 1 MΩ', 'investigate: damp, contamination, damage', R.energy],
        ['Under 0.5 MΩ', 'fail. Do not energise', R.fault],
      ];
      bands.forEach(([a, b, col], k) => {
        const y = ty + k * 18;
        label(g, a, pad, y, { color: col, size: 10.5, weight: 600, max: w * 0.3 });
        label(g, b, pad + Math.max(w * 0.32, 120), y, {
          color: p.muted, size: 10.5, max: w - pad - Math.max(w * 0.32, 120) - 130,
        });
      });
      label(g, 'It applies a real voltage: nothing sensitive may be connected, and the cable holds a charge afterwards.',
        pad, ty + 78, { color: p.muted, size: 10.5, max: w - pad * 2 });
    },
  });
  upd();
});
