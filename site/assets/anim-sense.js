// Classes 13 and 14: how the machine finds out where something is, how it makes
// something move, and how those two are joined on a cue.

import { register } from './anim-core.js';
import {
  figure, canvas, slider, toggle, choice, label, labelWrap, box, line, palette,
  alpha, fitter, compare, chain, role, eng, sig,
  arrow, resistorSym, groundSym, readoutChip,
} from './anim-kit.js';

// ---------------------------------------------------------------------------
// Choosing a sensor is choosing which failures you can live with
// ---------------------------------------------------------------------------

register('sensor-map', (host) => compare(host, {
  title: 'What each sensor actually measures',
  sub: '“Is the actor in position” is not measurable. Each of these answers a slightly different question and fails differently.',
  fields: [
    { label: 'Really measures', key: 'measures' },
    { label: 'Good for', key: 'good' },
    { label: 'What fools it', key: 'fools', tone: 'fault' },
  ],
  items: [
    {
      name: 'Limit switch', short: 'Limit', tone: 'safe',
      line: 'A mechanical contact at the end of travel. The most reliable thing on this list.',
      measures: 'Whether something has physically pushed a lever',
      good: 'Ends of travel on anything that moves, and homing an encoder',
      fools: 'Being knocked out of adjustment, and wearing out after millions of operations',
      note: 'Wire it normally closed, so a cut cable reads as unsafe and the machine stops. <b>Wired the other way, a broken wire reads as safe forever and the guard has silently stopped existing.</b>',
    },
    {
      name: 'Reed switch', short: 'Reed', tone: 'safe',
      line: 'A magnet closes a sealed contact. No wear, works through non-magnetic material.',
      measures: 'Whether a magnet is within a few millimetres',
      good: 'A door, a lid, a hatch, a trap: anything with a defined closed position',
      fools: 'Any other magnet, and a hidden one taped nearby, which is the classic defeated interlock',
      watch: 'Because a magnet defeats it invisibly, a reed switch used as a safety interlock needs to be a coded or dual-channel type, not a bare one.',
    },
    {
      name: 'Pressure mat', short: 'Mat', tone: 'energy',
      line: 'A large-area contact that closes under weight.',
      measures: 'That something heavy is on it',
      good: 'Broad “somebody is here” detection over a large area, cheaply',
      fools: 'A dropped prop, a stagehand crossing, a piece of scenery resting on it',
    },
    {
      name: 'Beam break', short: 'Beam', tone: 'signal',
      line: 'An emitter and a receiver; something crossing between them breaks the beam.',
      measures: 'That the line between two points is obstructed',
      good: 'Fast, precise triggering, and detecting a person entering a hazard zone',
      fools: 'A cable swinging through it, a costume, haze, and a misaligned emitter',
      note: 'Fast and definite, which is why it is the standard way to detect somebody entering a hazard zone. <b>Alignment is its whole weakness: it works perfectly until somebody knocks the bracket.</b>',
    },
    {
      name: 'Ultrasonic', short: 'Ultrasonic', tone: 'signal',
      line: 'Distance from the time an echo takes to return.',
      measures: 'Time of flight to the nearest reflective surface',
      good: 'Non-contact distance from about 2 cm to 4 m, cheaply',
      fools: 'Soft surfaces that absorb, angled surfaces that reflect away, and other ultrasonic sensors',
    },
    {
      name: 'Time of flight', short: 'ToF', tone: 'signal',
      line: 'The same idea with light instead of sound. More precise, more expensive.',
      measures: 'Time for a laser pulse to return',
      good: 'Precise non-contact distance, in millimetres',
      fools: 'Black surfaces, glass, and bright ambient light',
    },
    {
      name: 'Current transformer', short: 'CT', tone: 'energy',
      line: 'Clips around a live conductor and reports the current with no electrical connection.',
      measures: 'How much current a circuit is drawing',
      good: 'Knowing whether a lamp is actually drawing power, rather than trusting that you sent the cue',
      fools: 'Very low currents, and being clipped around both conductors, which reads zero',
      note: 'This is a far better test of “is the practical on” than the cue stack. <b>It measures the thing itself rather than your intention about it.</b>',
    },
  ],
  footer: 'Write down three things that would falsely trigger your sensor. Then decide, for each, whether you prevent it, detect it, or accept it. All three are legitimate; not deciding is not.',
}));

// ---------------------------------------------------------------------------
// Normally closed against normally open
// ---------------------------------------------------------------------------

register('nc-no', (host) => {
  let wiring = 'nc';
  let cableCut = false;
  let guardOpen = false;

  const { controls, stage, setNote, challenge } = figure(host, {
    title: 'The most examinable idea in this class',
    sub: 'A guard switch, wired two ways. Cut the cable and see what the machine believes.',
    note: '',
  });

  const reads = () => {
    if (cableCut) return wiring === 'nc' ? 'unsafe' : 'safe';
    return guardOpen ? 'unsafe' : 'safe';
  };
  const truth = () => (guardOpen ? 'unsafe' : 'safe');

  const upd = () => {
    const wrong = reads() !== truth();
    setNote(cableCut
      ? (wiring === 'nc'
        ? 'The cable is cut and the circuit is open, which in normally closed wiring means unsafe. The machine stops. <b>The fault has caused exactly the behaviour a hazard would, which is what fail-safe means, and it is why every safety-related contact in this industry is normally closed.</b>'
        : 'The cable is cut and the circuit is open, which in normally open wiring means not-pressed, which means safe. The machine runs. <b>The guard that was designed to stop it has silently stopped existing, and nothing anywhere reports a fault.</b>')
      : 'With the cable intact both arrangements report correctly. That is exactly the problem: they look identical until something breaks, and the difference only appears on the day it matters. <b>Cut the cable and watch.</b>');
    cv.once();
  };

  controls.append(choice('Wiring', [['nc', 'Normally closed'], ['no', 'Normally open']], {
    value: 'nc', on: (v) => { wiring = v; upd(); },
  }).node);
  controls.append(toggle('Guard open', { value: false, on: (v) => { guardOpen = v; upd(); } }).node);
  controls.append(toggle('Cable cut', { value: false, on: (v) => { cableCut = v; upd(); } }).node);

  challenge('Create the state where a real hazard exists and the machine believes it is safe.',
    () => reads() === 'safe' && truth() === 'unsafe');

  const cv = canvas(stage, {
    height: 260,
    draw(g, w, h, t) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const y = 58;
      const nc = wiring === 'nc';
      const contactClosed = nc ? !guardOpen : guardOpen;
      const circuitClosed = contactClosed && !cableCut;
      const believes = reads();
      const actual = truth();
      const wrong = believes !== actual;

      // The guard.
      box(g, pad, y - 26, 54, 52, {
        fill: alpha(guardOpen ? R.fault : R.safe, 0.15), stroke: guardOpen ? R.fault : R.safe, r: 5,
      });
      label(g, guardOpen ? 'OPEN' : 'closed', pad + 27, y, {
        color: guardOpen ? R.fault : R.safe, size: 10, align: 'center', weight: 700,
      });
      label(g, 'guard', pad + 27, y + 36, { color: p.muted, size: 9.5, align: 'center' });

      // The switch contact.
      const sx = pad + 96;
      g.fillStyle = p.muted;
      g.beginPath(); g.arc(sx, y, 3.5, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.arc(sx + 26, y, 3.5, 0, Math.PI * 2); g.fill();
      line(g, sx, y, sx + 26, y - (contactClosed ? 0 : 12), { color: p.ink2, lw: 2.5 });
      label(g, nc ? 'NC contact' : 'NO contact', sx + 13, y - 24, {
        color: p.muted, size: 9.5, align: 'center',
      });
      label(g, contactClosed ? 'closed' : 'open', sx + 13, y + 20, {
        color: contactClosed ? R.safe : p.muted, size: 9.5, align: 'center',
      });

      // The cable, and the cut.
      const cx0 = sx + 26, cx1 = w - pad - 100;
      if (cableCut) {
        const mid = (cx0 + cx1) / 2;
        line(g, cx0, y, mid - 8, y, { color: p.muted, lw: 2 });
        line(g, mid + 8, y, cx1, y, { color: p.muted, lw: 2 });
        label(g, '✂ cut', mid, y - 14, { color: R.fault, size: 10, align: 'center', weight: 700 });
      } else {
        line(g, cx0, y, cx1, y, { color: circuitClosed ? R.safe : p.muted, lw: 2 });
        if (circuitClosed) {
          for (let k = 0; k < 5; k++) {
            const u = ((t * 0.6 + k / 5) % 1);
            g.fillStyle = R.safe;
            g.beginPath();
            g.arc(cx0 + u * (cx1 - cx0), y, 2.6, 0, Math.PI * 2);
            g.fill();
          }
        }
      }

      // The controller and what it believes.
      box(g, cx1, y - 26, 90, 52, {
        fill: alpha(believes === 'safe' ? R.safe : R.fault, 0.12),
        stroke: believes === 'safe' ? R.safe : R.fault, r: 6,
      });
      label(g, believes === 'safe' ? 'RUNNING' : 'STOPPED', cx1 + 45, y - 6, {
        color: believes === 'safe' ? R.safe : R.fault, size: 11, align: 'center', weight: 700, max: 84,
      });
      label(g, circuitClosed ? 'circuit closed' : 'circuit open', cx1 + 45, y + 10, {
        color: p.muted, size: 9, align: 'center', max: 84,
      });

      // The verdict: does belief match reality?
      const vy = 132;
      box(g, pad, vy, w - pad * 2, 38, {
        fill: alpha(wrong ? R.fault : R.safe, 0.12), stroke: alpha(wrong ? R.fault : R.safe, 0.45), r: 7,
      });
      label(g, wrong ? 'THE MACHINE IS WRONG ABOUT THE WORLD' : 'The machine agrees with reality', pad + 12, vy + 13, {
        color: wrong ? R.fault : R.safe, size: 12, weight: 700, max: w - pad * 2 - 24,
      });
      label(g, `reality: ${actual}    ·    machine believes: ${believes}`, pad + 12, vy + 29, {
        color: p.ink2, size: 10.5, mono: true, max: w - pad * 2 - 24,
      });

      const ty = vy + 52;
      [['Normally closed', 'A cut cable, a corroded contact or a pulled connector all read as UNSAFE. The machine stops.', nc],
        ['Normally open', 'A cut cable reads as SAFE, forever, and nothing reports it.', !nc]]
        .forEach(([n, d, on], k) => {
          const yy = ty + k * 30;
          label(g, n, pad, yy, { color: on ? (k === 0 ? R.safe : R.fault) : p.muted, size: 11, weight: on ? 700 : 500 });
          labelWrap(g, d, pad + 12, yy + 15, { color: on ? p.ink2 : p.muted, size: 10.5, max: w - pad * 2 - 12, maxLines: 1 });
        });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// Sensor in a divider
// ---------------------------------------------------------------------------

register('divider-sensor', (host) => {
  let Rfixed = 10000;
  let light = 50;
  let inTop = false;

  const { controls, stage, setNote, challenge } = figure(host, {
    title: 'A resistance is not readable. A divider is.',
    sub: 'An LDR from 1 kΩ bright to 100 kΩ dark. Choose the fixed resistor and which arm it goes in.',
    note: '',
  });

  // Log interpolation across the LDR's range.
  const Rldr = () => 10 ** (3 + (1 - light / 100) * 2);
  const vout = () => {
    const rs = Rldr();
    return inTop ? 5 * (Rfixed / (rs + Rfixed)) : 5 * (rs / (Rfixed + rs));
  };

  const upd = () => {
    // The useful fixed resistor is near the geometric mean of the range.
    const ideal = Math.sqrt(1000 * 100000);
    const good = Math.abs(Math.log10(Rfixed / ideal)) < 0.35;
    setNote(good
      ? `${eng(Rfixed, 'Ω')} is close to the geometric mean of the LDR's 1 kΩ to 100 kΩ range, so the useful part of the curve sits in the middle of the ADC's span rather than squashed at one end. <b>That is the whole rule for choosing this resistor.</b>`
      : `${eng(Rfixed, 'Ω')} is far from the geometric mean of the sensor's range, so most of the ADC's span is wasted and the interesting region is compressed. <b>Aim for √(R_min × R_max), which here is about 10 kΩ.</b>`);
    cv.once();
  };

  controls.append(slider('Fixed resistor', {
    min: 0, max: 30, step: 1, value: 10, fmt: (k) => eng(10 ** (2.5 + k / 10), 'Ω'),
    on: (k) => { Rfixed = 10 ** (2.5 + k / 10); upd(); },
  }).node);
  Rfixed = 10 ** (2.5 + 10 / 10);
  controls.append(slider('Light level', {
    min: 0, max: 100, step: 1, value: 50, fmt: (v) => (v > 66 ? 'bright' : v > 33 ? 'dim' : 'dark'),
    on: (v) => { light = v; cv.once(); },
  }).node);
  controls.append(toggle('Sensor in the top arm', { value: false, on: (v) => { inTop = v; upd(); } }).node);

  challenge('Choose the fixed resistor by the geometric mean rule.',
    () => Math.abs(Math.log10(Rfixed / Math.sqrt(1000 * 100000))) < 0.2);

  const cv = canvas(stage, {
    height: 270, animated: false,
    draw(g, w) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const x = pad + 60, T = 24, gap = 56;
      const v = vout();

      line(g, x, T, x, T + gap * 2, { color: p.muted, lw: 2 });
      label(g, '+5 V', x, T - 12, { color: R.energy, size: 10, align: 'center' });
      groundSym(g, x, T + gap * 2 + 4, p.muted);

      const drawArm = (yc, isSensor) => {
        if (isSensor) {
          box(g, x - 16, yc - 14, 32, 28, {
            fill: alpha(R.signal, 0.15 + (light / 100) * 0.4), stroke: R.signal, r: 4,
          });
          label(g, 'LDR', x, yc, { color: R.signal, size: 9.5, align: 'center', weight: 600 });
          label(g, eng(Rldr(), 'Ω'), x + 24, yc, { color: R.signal, size: 10, mono: true });
        } else {
          resistorSym(g, x - 20, yc, 40, 13, p.ink2, 2.2);
          label(g, eng(Rfixed, 'Ω'), x + 24, yc, { color: p.ink2, size: 10, mono: true });
        }
      };
      drawArm(T + gap / 2, inTop);
      drawArm(T + gap * 1.5, !inTop);

      // The tap.
      const ty = T + gap;
      const ax = Math.min(x + 130, w - 150);
      line(g, x, ty, ax, ty, { color: R.energy, lw: 2 });
      g.fillStyle = R.energy;
      g.beginPath(); g.arc(x, ty, 4, 0, Math.PI * 2); g.fill();
      box(g, ax, ty - 20, 62, 40, { fill: p.raised, stroke: p.line, r: 5 });
      label(g, 'ADC', ax + 31, ty - 6, { color: p.ink2, size: 10, align: 'center' });
      label(g, `${Math.round((v / 5) * 1023)}`, ax + 31, ty + 9, {
        color: R.energy, size: 12, align: 'center', weight: 700, mono: true,
      });

      const rx = w - pad - 96;
      if (rx > ax + 70) {
        readoutChip(g, rx, T, 'V_OUT', `${v.toFixed(2)} V`, { color: R.energy, p, w: 92 });
      }

      // The transfer curve across the sensor's whole range.
      const gL = pad, gT = T + gap * 2 + 40, gW = w - pad * 2, gH = 76;
      line(g, gL + 30, gT + gH, gL + gW, gT + gH, { color: p.muted, lw: 1.5 });
      line(g, gL + 30, gT, gL + 30, gT + gH, { color: p.muted, lw: 1.5 });
      g.strokeStyle = R.signal;
      g.lineWidth = 2.2;
      g.beginPath();
      for (let k = 0; k <= 120; k++) {
        const l = (k / 120) * 100;
        const rs = 10 ** (3 + (1 - l / 100) * 2);
        const vv = inTop ? 5 * (Rfixed / (rs + Rfixed)) : 5 * (rs / (Rfixed + rs));
        const px = gL + 30 + (k / 120) * (gW - 30);
        const py = gT + gH - (vv / 5) * gH;
        k ? g.lineTo(px, py) : g.moveTo(px, py);
      }
      g.stroke();
      const cx = gL + 30 + (light / 100) * (gW - 30);
      g.fillStyle = R.energy;
      g.beginPath(); g.arc(cx, gT + gH - (v / 5) * gH, 4.5, 0, Math.PI * 2); g.fill();
      label(g, 'dark', gL + 34, gT + gH + 13, { color: p.muted, size: 9 });
      label(g, 'bright', gL + gW, gT + gH + 13, { color: p.muted, size: 9, align: 'right' });
      label(g, '5 V', gL + 26, gT + 4, { color: p.muted, size: 9, align: 'right' });
      label(g, '0 V', gL + 26, gT + gH, { color: p.muted, size: 9, align: 'right' });
      label(g, inTop ? 'reading rises with light' : 'reading falls with light', gL + 36, gT + 10, {
        color: p.ink2, size: 10.5, max: gW - 40,
      });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// The encoder that does not know where it is
// ---------------------------------------------------------------------------

register('encoder', (host) => {
  let counts = 0;
  let homed = false;
  let pos = 0;

  const { controls, stage, setNote } = figure(host, {
    title: 'Incremental against absolute',
    sub: 'Turn it, then power-cycle it without moving anything.',
    note: '',
  });

  const turn = (n) => {
    pos = Math.max(-40, Math.min(40, pos + n));
    counts += n;
    setNote(`Counted ${counts}. <b>The encoder knows it has moved ${Math.abs(counts)} counts. It does not know where it is, and nothing in it ever will.</b>`);
    cv.once();
  };

  const bl = document.createElement('button');
  bl.className = 'ac ac-btn';
  bl.textContent = '← Turn';
  bl.addEventListener('click', () => turn(-4));
  const br = document.createElement('button');
  br.className = 'ac ac-btn';
  br.textContent = 'Turn →';
  br.addEventListener('click', () => turn(4));
  const bp = document.createElement('button');
  bp.className = 'ac ac-btn';
  bp.textContent = 'Power cycle';
  bp.addEventListener('click', () => {
    counts = 0;
    homed = false;
    setNote('The count is zero and the encoder has not moved. The system now believes something false, and it has no way to discover that. <b>Every incremental system needs a homing routine and a limit switch, and a machine that has not been homed since power-up must not be allowed to move at speed.</b>');
    cv.once();
  });
  const bh = document.createElement('button');
  bh.className = 'ac ac-btn';
  bh.textContent = 'Home it';
  bh.addEventListener('click', () => {
    pos = -40;
    counts = 0;
    homed = true;
    setNote('Homed: driven slowly until the limit switch made, then the count set to a known value. <b>Now the count means something, and it will keep meaning something until the next power cycle or the next missed step.</b>');
    cv.once();
  });
  controls.append(bl, br, bh, bp);

  const cv = canvas(stage, {
    height: 250,
    draw(g, w, h, t) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const trackY = 56;
      const x0 = pad + 40, x1 = w - pad - 20;

      // The physical axis, with a limit switch at one end.
      line(g, x0, trackY, x1, trackY, { color: p.muted, lw: 3 });
      box(g, x0 - 20, trackY - 12, 16, 24, {
        fill: pos <= -39 ? alpha(R.safe, 0.3) : p.raised, stroke: pos <= -39 ? R.safe : p.line, r: 3,
      });
      label(g, 'home', x0 - 12, trackY + 24, { color: p.muted, size: 9, align: 'center' });

      const px = x0 + ((pos + 40) / 80) * (x1 - x0);
      box(g, px - 14, trackY - 14, 28, 28, { fill: alpha(R.signal, 0.3), stroke: R.signal, r: 4 });
      label(g, 'carriage', px, trackY - 24, { color: p.muted, size: 9, align: 'center' });

      // Where the system thinks it is.
      const bx = x0 + (((homed ? pos : counts) + 40) / 80) * (x1 - x0);
      const believesRight = homed;
      g.strokeStyle = believesRight ? R.safe : R.fault;
      g.lineWidth = 2;
      g.setLineDash([4, 3]);
      g.strokeRect(bx - 16, trackY - 16, 32, 32);
      g.setLineDash([]);
      label(g, 'where it thinks it is', bx, trackY + 30, {
        color: believesRight ? R.safe : R.fault, size: 9.5, align: 'center', max: 130,
      });

      // The quadrature signals.
      const qy = 116, qh = 44;
      box(g, pad, qy, w - pad * 2, qh, { fill: alpha(p.ground, 0.5), stroke: p.line, r: 6 });
      const hi = qy + 10, lo = qy + qh - 10;
      [0, 0.25].forEach((phase, ch) => {
        g.strokeStyle = ch ? alpha(R.signal, 0.7) : R.signal;
        g.lineWidth = 2;
        g.beginPath();
        for (let k = 0; k <= 200; k++) {
          const u = (k / 200) * 6 + phase;
          const v = (Math.floor(u) % 2) ? 1 : 0;
          const x = pad + 6 + (k / 200) * (w - pad * 2 - 12);
          const y = (v ? hi : lo) + ch * 0;
          k ? g.lineTo(x, y) : g.moveTo(x, y);
        }
        g.stroke();
      });
      label(g, 'A and B, a quarter cycle apart: counting the edges gives direction and distance',
        pad + 8, qy + 12, { color: p.muted, size: 9.5, max: w - pad * 2 - 16 });

      const ry = qy + qh + 20;
      readoutChip(g, pad, ry, 'COUNT', String(counts), { color: p.ink, p, w: Math.min(130, (w - pad * 2 - 10) / 2) });
      readoutChip(g, pad + Math.min(138, (w - pad * 2) / 2 + 4), ry, 'POSITION KNOWN', homed ? 'yes' : 'NO', {
        color: homed ? R.safe : R.fault, p, w: Math.min(130, (w - pad * 2 - 10) / 2),
      });
    },
  });
  setNote('An encoder that has counted four thousand pulses knows it has moved four thousand pulses, not where it is. <b>Lose power and the count is gone while the machine has not moved at all.</b>');
});

// ---------------------------------------------------------------------------
// Actuators compared
// ---------------------------------------------------------------------------

register('motor-types', (host) => compare(host, {
  title: 'Six actuators, and what each one costs you',
  sub: 'This is where the class stops being about electronics: a motor with enough torque to move scenery has enough to break a finger.',
  fields: [
    { label: 'Gives you', key: 'gives' },
    { label: 'Costs you', key: 'costs', tone: 'fault' },
    { label: 'Where it belongs', key: 'where' },
  ],
  items: [
    {
      name: 'Solenoid', short: 'Solenoid', tone: 'energy',
      line: 'A coil producing a short, fast linear pull. On or off, nothing between.',
      gives: 'A fast snap, cheaply, with no mechanism',
      costs: 'Heats fast, is loud, and many are rated for a duty cycle rather than continuous use',
      where: 'Latches, catches, valves, anything that releases',
      watch: 'Held on continuously, a duty-cycle-rated solenoid reaches burn temperature and then fails. Use peak and hold, or a part rated for continuous duty.',
    },
    {
      name: 'DC motor', short: 'DC', tone: 'signal',
      line: 'Cheap continuous rotation with no idea where it is.',
      gives: 'Continuous rotation for very little money',
      costs: 'No position feedback at all, and it coasts when you switch it off',
      where: 'Fans, and simple continuous motion where position does not matter',
    },
    {
      name: 'Geared DC motor', short: 'Geared', tone: 'signal',
      line: 'The same, with torque traded for speed.',
      gives: 'High torque at low speed',
      costs: 'Backlash, so it does not return to exactly where it was, and still no feedback',
      where: 'Slow reveals, turntables, anything where approximate is acceptable',
    },
    {
      name: 'Servo', short: 'Servo', tone: 'safe',
      line: 'Commanded position with internal feedback, in a package the size of a matchbox.',
      gives: 'A commanded angle, cheaply, and it holds it',
      costs: 'Limited travel, limited torque, and it buzzes and draws current while holding',
      where: 'Small precise movements, puppetry, anything under about a kilogram',
      watch: 'A servo holds against modest force by continuously correcting. It is not a lock, and it must never be the only thing preventing a movement.',
    },
    {
      name: 'Stepper', short: 'Stepper', tone: 'energy',
      line: 'Moves in fixed steps, usually 1.8 degrees, so 200 per revolution.',
      gives: 'Precise, repeatable position without a feedback sensor',
      costs: 'Loses steps silently under load, and nothing in it reports the error',
      where: 'Repeatable indexing and small automation, with a home switch',
      note: 'A stepper commanded to move 200 steps believes it moved 200 steps, even if the load jammed at step 40. <b>Every stepper in a show needs a home switch and something that verifies position at least once per cycle, or it drifts over a run.</b>',
    },
    {
      name: 'Linear actuator', short: 'Linear', tone: 'safe',
      line: 'A motor and a screw, pushing or pulling along a line.',
      gives: 'High force in a straight line, and it holds position with power off',
      costs: 'Slow, and expensive',
      where: 'Lids, ramps, small lifts, anything that must stay put when the power goes',
    },
  ],
  footer: 'Nothing in Class 13 is built with mains-powered motion, because trapping hazards are Class 15 and they are not an afterthought.',
}));

// ---------------------------------------------------------------------------
// Peak and hold
// ---------------------------------------------------------------------------

register('solenoid', (host) => {
  let holdDuty = 100;
  let running = false;
  let temp = 24;
  let elapsed = 0;

  const { controls, stage, setNote, challenge } = figure(host, {
    title: 'Peak and hold, and the solenoid that burns',
    sub: 'Full power to pull in, reduced power to hold. Run both and watch the temperature.',
    note: '',
  });

  const upd = () => {
    setNote(holdDuty >= 95
      ? 'Held at full power. The coil dissipates the same power holding as it did pulling in, which is far more than it needs, and a duty-cycle-rated part will reach burn temperature and then fail. <b>Run it for four minutes and watch.</b>'
      : `Full power for 100 ms to pull in, then ${holdDuty} per cent to hold. The magnetic circuit is already closed, so much less force is needed to keep it there. <b>The technique is standard and it is worth knowing by name: this is what lets a designer have a latch held closed for a whole act.</b>`);
    temp = 24; elapsed = 0;
    cv.reset();
  };

  controls.append(slider('Holding duty', {
    min: 20, max: 100, step: 5, value: 100, fmt: (v) => `${v}%`,
    on: (v) => { holdDuty = v; upd(); },
  }).node);
  controls.append(toggle('Energised', { value: false, on: (v) => { running = v; temp = 24; elapsed = 0; cv.reset(); } }).node);

  challenge('Hold it energised for four minutes without passing 80 °C.',
    () => running && elapsed > 240 && temp < 80);

  const cv = canvas(stage, {
    height: 260,
    draw(g, w, h, t, dt) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      // Time runs at 40× so four minutes takes six seconds of watching.
      const step = (dt || 0.016) * 40;
      if (running) {
        elapsed += step;
        const duty = elapsed < 0.1 ? 1 : holdDuty / 100;
        // Heat in, cooling out. Duty squared because it is I²R.
        temp += (duty * duty * 0.62 - (temp - 24) * 0.0075) * step;
      } else if (temp > 24) {
        temp -= (temp - 24) * 0.02 * step;
      }
      const held = running && (elapsed < 0.1 || holdDuty >= 35);

      // The solenoid, drawn hot.
      const sx = pad + 66, sy = 62;
      const hot = Math.min(1, (temp - 24) / 130);
      g.fillStyle = alpha(R.fault, hot * 0.5);
      g.beginPath(); g.arc(sx, sy, 32 + hot * 20, 0, Math.PI * 2); g.fill();
      box(g, sx - 30, sy - 22, 44, 44, {
        fill: alpha(R.energy, 0.1 + hot * 0.5), stroke: temp > 90 ? R.fault : p.line, r: 5, lw: temp > 90 ? 2 : 1,
      });
      g.strokeStyle = p.ink2;
      g.lineWidth = 2;
      for (let k = 0; k < 4; k++) {
        g.beginPath();
        g.arc(sx - 30 + 8 + k * 9, sy, 8, -Math.PI / 2, Math.PI / 2);
        g.stroke();
      }
      // The plunger, in or out.
      const plunge = held ? 12 : 0;
      box(g, sx + 14 - plunge, sy - 7, 34, 14, { fill: p.raised, stroke: p.ink2, r: 3 });
      label(g, held ? 'pulled in' : 'released', sx + 32, sy + 26, {
        color: held ? R.safe : p.muted, size: 9.5, align: 'center',
      });

      const rx = Math.max(sx + 100, w - 128);
      if (w - rx > 100) {
        const cw = Math.min(116, w - rx - 8);
        readoutChip(g, rx, 22, 'COIL TEMPERATURE', `${Math.round(temp)} °C`, {
          color: temp > 90 ? R.fault : temp > 60 ? R.energy : R.safe, p, w: cw,
        });
        readoutChip(g, rx, 64, 'ELAPSED', `${Math.floor(elapsed / 60)}:${String(Math.floor(elapsed % 60)).padStart(2, '0')}`, {
          color: p.ink, p, w: cw,
        });
        readoutChip(g, rx, 106, 'STATE', temp > 120 ? 'failing' : temp > 90 ? 'too hot to touch' : held ? 'holding' : 'off', {
          color: temp > 90 ? R.fault : R.safe, p, w: cw,
        });
      }

      // The temperature trace.
      const gL = pad, gT = 150, gW = w - pad * 2, gH = 68;
      box(g, gL, gT, gW, gH, { fill: alpha(p.ground, 0.5), stroke: p.line, r: 6 });
      const burn = gT + gH - (110 / 160) * gH;
      line(g, gL, burn, gL + gW, burn, { color: alpha(R.fault, 0.7), lw: 1, dash: [4, 3] });
      label(g, '110 °C — burns on contact', gL + 6, burn - 8, { color: R.fault, size: 9 });
      const ty = gT + gH - (Math.min(temp, 160) / 160) * gH;
      const tx = gL + Math.min(1, elapsed / 300) * gW;
      g.strokeStyle = temp > 90 ? R.fault : R.safe;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(gL, gT + gH - (24 / 160) * gH);
      g.lineTo(tx, ty);
      g.stroke();
      g.fillStyle = temp > 90 ? R.fault : R.safe;
      g.beginPath(); g.arc(tx, ty, 4, 0, Math.PI * 2); g.fill();
      label(g, '5 minutes', gL + gW - 4, gT + gH - 8, { color: p.muted, size: 9, align: 'right' });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// The chain, end to end
// ---------------------------------------------------------------------------

register('trigger-chain', (host) => {
  let debounceMs = 30;
  let blocking = false;
  let network = false;
  let actuator = 'relay';

  const { controls, stage, setNote, challenge } = figure(host, {
    title: 'Where the latency actually is',
    sub: 'Add up the chain. Two things fall out of the total, and neither is what people expect.',
    note: '',
  });

  const parts = () => [
    ['Sensor response', 2, 'signal'],
    ['Debounce', debounceMs, 'energy'],
    ['Loop poll', blocking ? 250 : 0.8, blocking ? 'fault' : 'safe'],
    ['Decision and comms', network ? 24 : 0.4, network ? 'energy' : 'safe'],
    ['Actuator start', actuator === 'relay' ? 10 : actuator === 'servo' ? 40 : 120, 'signal'],
    ['Movement', actuator === 'relay' ? 40 : actuator === 'servo' ? 300 : 1600, 'safe'],
  ];
  const electronic = () => parts().slice(0, 5).reduce((s, x) => s + x[1], 0);
  const total = () => parts().reduce((s, x) => s + x[1], 0);

  const upd = () => {
    const e = electronic();
    const tt = total();
    setNote(blocking
      ? `A blocking delay puts ${sig(parts()[2][1])} ms into the chain on its own, more than everything else combined. <b>The operator's experience of that is "the button did not work sometimes".</b>`
      : e > 50
        ? `The electronics account for ${Math.round(e)} ms of a ${Math.round(tt)} ms chain. <b>Debounce is often the largest electronic delay, and it is the one people optimise last because it is invisible.</b>`
        : `${Math.round(e)} ms of electronics on a ${Math.round(tt)} ms chain: the mechanical time dominates by an order of magnitude. <b>Shaving milliseconds off a sensor feeding a two-second movement changes nothing an audience can perceive, and the effort belongs somewhere else.</b>`);
    cv.once();
  };

  controls.append(slider('Debounce', {
    min: 0, max: 60, step: 5, value: 30, fmt: (v) => `${v} ms`,
    on: (v) => { debounceMs = v; upd(); },
  }).node);
  controls.append(toggle('A blocking delay() in the loop', { value: false, on: (v) => { blocking = v; upd(); } }).node);
  controls.append(toggle('Decision goes over the network', { value: false, on: (v) => { network = v; upd(); } }).node);
  controls.append(choice('Actuator', [['relay', 'Relay snap'], ['servo', 'Servo move'], ['motor', 'Geared motor']], {
    value: 'relay', on: (v) => { actuator = v; upd(); },
  }).node);

  challenge('Get the whole chain under 60 ms, which is what a tightly timed effect needs.', () => total() < 60);

  const cv = canvas(stage, {
    height: 270, animated: false,
    draw(g, w) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const P = parts();
      const tt = total();
      const gL = pad, gT = 30, gW = w - pad * 2;

      // The stacked bar, to scale.
      let x = gL;
      const barH = 30;
      P.forEach(([n, ms, tone]) => {
        const bw = (ms / tt) * gW;
        g.fillStyle = alpha(R[tone], 0.5);
        g.fillRect(x, gT, Math.max(bw, 1), barH);
        line(g, x, gT, x, gT + barH, { color: p.ground, lw: 1 });
        x += bw;
      });
      box(g, gL, gT, gW, barH, { fill: 'transparent', stroke: p.line, r: 4 });
      label(g, `total ${Math.round(tt)} ms`, gL, gT - 10, { color: p.ink, size: 11, weight: 700 });
      label(g, tt < 60 ? 'tight enough for a snap' : tt < 300 ? 'fine for a movement' : 'a slow effect', gL + gW, gT - 10, {
        color: tt < 60 ? R.safe : p.muted, size: 10.5, align: 'right',
      });

      // The rows.
      let y = gT + barH + 22;
      P.forEach(([n, ms, tone]) => {
        g.fillStyle = R[tone];
        g.fillRect(gL, y - 5, 4, 12);
        label(g, n, gL + 12, y, { color: p.ink2, size: 11, max: w * 0.4 });
        label(g, `${ms < 1 ? '< 1' : Math.round(ms)} ms`, gL + Math.max(w * 0.44, 150), y, {
          color: R[tone], size: 11, mono: true, weight: 600,
        });
        const pct = Math.round((ms / tt) * 100);
        label(g, `${pct}%`, gL + gW, y, { color: p.muted, size: 10.5, align: 'right', mono: true });
        y += 19;
      });

      y += 8;
      label(g, `Electronics  ${Math.round(electronic())} ms      Mechanical  ${Math.round(tt - electronic())} ms`, gL, y, {
        color: p.ink, size: 11.5, mono: true, weight: 600, max: gW,
      });
      label(g, 'Know which one you are building before you spend a day shaving milliseconds.', gL, y + 20, {
        color: p.muted, size: 10.5, max: gW,
      });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// Class 14
// ---------------------------------------------------------------------------

register('effect-chain', (host) => chain(host, {
  title: 'Four questions before a wire is stripped',
  sub: 'In this order, because each one constrains the next.',
  tag: 'Question', accent: 'signal',
  stages: [
    {
      name: 'What does the audience see?',
      body: 'Not what it does electrically. What the audience sees, and how tightly it is timed.',
      why: 'A flare that must land on a word needs the whole chain under about 50 ms. A slow reveal has seconds of slack. That number decides everything downstream, including whether you can afford a network hop.',
      note: 'If you cannot write that sentence, you are not ready to build it. <b>Every technical decision after this one is a consequence of it.</b>',
    },
    {
      name: 'What is the trigger, and what fools it?',
      body: 'Write down three things that would falsely trigger your sensor. For a pressure mat: a dropped prop, a stagehand crossing, scenery resting on it.',
      why: 'Then decide, for each, whether you prevent it, detect it, or accept it. All three are legitimate. Not deciding is not.',
    },
    {
      name: 'What does the actuator do while idle?',
      body: 'A solenoid holding is heating. A servo holding is buzzing and drawing current. A motor stopped on a slope is held by friction alone.',
      why: 'The idle state is where the run-length failures live, and it is the question nobody asks in a workshop because a workshop is twenty minutes long.',
      note: 'This is the question that separates a demonstration from a device. <b>Ask it about every actuator, every time.</b>',
    },
    {
      name: 'What if the cue arrives twice?',
      body: 'Ignore it, restart it, or queue it. Choose deliberately and write it down.',
      why: 'An operator unsure whether a cue fired will press again, every time, on every production, forever. This is not an edge case, it is normal operation.',
      note: 'This is the question asked in every design review and the one most teams have not answered. <b>Have an answer before you are asked.</b>',
    },
  ],
  footer: 'The effect is not the assessment. The failure behaviour and the handover are.',
}));

register('trigger-logic', (host) => {
  let pattern = 'arm';
  let sensor = false;
  let cue = false;

  const PATTERNS = {
    arm: ['Cue arms, sensor fires', 'The desk arms the effect during the right scene; the sensor triggers the exact moment. The operator keeps control of whether, the sensor controls when.'],
    either: ['Either one fires it', 'Simple, and a false sensor trigger fires the effect in the wrong scene. Only acceptable when a spurious fire is harmless.'],
    both: ['Both within a window', 'Sensor within two seconds of the cue. Robust against both false triggers and mistimed cues, and it fails silently when they do not coincide.'],
  };

  const { controls, stage, setNote } = figure(host, {
    title: 'Two ways in, one effect, four combinations',
    sub: 'The middle two rows of the truth table are the design.',
    note: '',
  });

  const fires = () => {
    if (pattern === 'arm') return cue && sensor;
    if (pattern === 'either') return cue || sensor;
    return cue && sensor;
  };

  const upd = () => {
    setNote(`${PATTERNS[pattern][0]}: ${PATTERNS[pattern][1]} <b>${pattern === 'arm' ? 'This is the pattern to reach for first, because it gives each side the decision it is actually good at.' : pattern === 'both' ? 'It needs an indicator that shows you missed, rather than pretending nothing was asked for.' : 'Choose it only when you can name what happens if it fires in the wrong scene.'}</b>`);
    cv.once();
  };

  controls.append(choice('Pattern', Object.entries(PATTERNS).map(([k, v]) => [k, v[0]]), {
    value: 'arm', on: (v) => { pattern = v; upd(); },
  }).node);
  controls.append(toggle('Sensor triggered', { value: false, on: (v) => { sensor = v; cv.once(); } }).node);
  controls.append(toggle('Cue sent', { value: false, on: (v) => { cue = v; cv.once(); } }).node);

  const cv = canvas(stage, {
    height: 250, animated: false,
    draw(g, w) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const y = 34;

      // The truth table.
      const rows = [[false, false], [true, false], [false, true], [true, true]];
      const colW = (w - pad * 2) / 4;
      ['Sensor', 'Cue', 'Fires?', ''].forEach((n, k) => {
        if (!n) return;
        label(g, n, pad + k * colW + 6, y, { color: p.muted, size: 10, weight: 700 });
      });
      rows.forEach(([s, c], k) => {
        const ry = y + 22 + k * 26;
        const would = pattern === 'either' ? (s || c) : (s && c);
        const isNow = s === sensor && c === cue;
        if (isNow) {
          box(g, pad, ry - 13, w - pad * 2, 26, {
            fill: alpha(would ? R.energy : p.muted, 0.14),
            stroke: alpha(would ? R.energy : p.muted, 0.5), r: 5,
          });
        }
        label(g, s ? 'yes' : 'no', pad + 6, ry, { color: s ? R.signal : p.muted, size: 11, mono: true });
        label(g, c ? 'yes' : 'no', pad + colW + 6, ry, { color: c ? R.signal : p.muted, size: 11, mono: true });
        label(g, would ? 'FIRES' : '—', pad + colW * 2 + 6, ry, {
          color: would ? R.energy : p.muted, size: 11, weight: would ? 700 : 500, mono: true,
        });
        if (k === 1 || k === 2) {
          label(g, 'this row is the design', pad + colW * 3 + 6, ry, {
            color: p.muted, size: 9.5, max: colW - 12,
          });
        }
      });

      // The current state.
      const sy = y + 22 + 4 * 26 + 16;
      const on = fires();
      box(g, pad, sy, w - pad * 2, 34, {
        fill: alpha(on ? R.energy : p.muted, 0.12), stroke: alpha(on ? R.energy : p.muted, 0.4), r: 7,
      });
      label(g, on ? 'The effect fires' : 'Nothing happens', pad + 12, sy + 17, {
        color: on ? R.energy : p.muted, size: 12, weight: 700, max: w - pad * 2 - 24,
      });

      labelWrap(g, PATTERNS[pattern][1], pad, sy + 50, { color: p.ink2, size: 11, max: w - pad * 2, maxLines: 3 });
    },
  });
  upd();
});

register('build-discipline', (host) => chain(host, {
  title: 'Six steps, and nobody skips step three twice',
  sub: 'The same discipline as Class 6 and Class 12, because it is the same discipline everywhere.',
  tag: 'Step', accent: 'safe',
  stages: [
    {
      name: 'Skeleton first',
      body: 'State machine, indicator, timing. No load at all. Prove every transition on the indicator alone.',
      why: 'The skeleton is the part that has to be correct, and it is much easier to debug with nothing else moving.',
      note: 'Checkpoint: another team must be able to drive your state machine through every state using only the indicator to see where it is. <b>If they cannot, the indicator is not doing its job.</b>',
    },
    {
      name: 'Then inputs',
      body: 'Debounced, range-checked, with the fault path proved by shorting the input to both rails.',
      why: 'A sensor input that has not been tested at both rails has not been tested. Those are the two states a broken wire produces.',
    },
    {
      name: 'Then the output, on a lamp',
      body: 'Drive a lamp, not the real actuator, until the logic is right.',
      why: 'A logic error that fires a lamp is a lesson. The same error firing a solenoid at somebody’s hand is an incident report.',
      note: 'Nobody skips this step twice. <b>They skip it once, and then they have a story.</b>',
    },
    {
      name: 'Then the real actuator',
      body: 'Measure the current. Measure the MOSFET and the actuator temperature after four minutes of realistic duty.',
      why: 'Anything you cannot hold a finger on is a question that needs an answer, and the answer must be a number.',
    },
    {
      name: 'Then break it',
      body: 'Every failure mode in your table, plus the four run tests: a hundred cycles, fifteen minutes thermal, power cut at three points, and the stranger test.',
      why: 'A demo is one operation with everybody watching. A run is eighty operations over six weeks with nobody watching.',
      note: 'Behaviours you did not predict are the most valuable output of the day. <b>Write them down even when they are harmless, because the next build inherits them.</b>',
    },
    {
      name: 'Then hand it over',
      body: 'Write the sheet. Swap with another team. Operate theirs from the sheet alone, in silence, and note every moment you had to guess.',
      why: 'Anything they had to guess is a defect in the sheet, and the sheet is what goes on the production.',
    },
  ],
  footer: 'The effect working is step four of six. Steps five and six decide whether it can go on a production.',
}));

register('run-testing', (host) => compare(host, {
  title: 'Four tests that find run failures',
  sub: 'A demo never finds any of these, because a demo is one operation with everybody watching.',
  fields: [
    { label: 'What you do', key: 'do' },
    { label: 'What it catches', key: 'catches', tone: 'fault' },
    { label: 'How long it takes', key: 'time' },
  ],
  items: [
    {
      name: 'The hundred cycle test', short: '100 cycles', tone: 'safe',
      line: 'Run the effect a hundred times, automatically, and watch what drifts.',
      do: 'Log the first, fiftieth and hundredth: solenoid temperature, servo position, stepper count, contact resistance',
      catches: 'Solenoid heating, stepper drift, contact wear and connector fatigue, all of which appear between fifty and several hundred cycles',
      time: 'Twenty minutes, and it runs while you do the other tests',
      note: 'A show run lands squarely in the range where these appear. <b>Twenty minutes here saves a fault in week three that nobody can reproduce.</b>',
    },
    {
      name: 'The thermal test', short: 'Thermal', tone: 'energy',
      line: 'Run it at the worst realistic duty for fifteen minutes and measure everything that could get warm.',
      do: 'The actuator, the MOSFET, the regulator, the connector, with an IR thermometer, logged every three minutes',
      catches: 'Anything undersized, anything with no thermal path, and any duty cycle assumption that was optimistic',
      time: 'Fifteen minutes',
      watch: 'Anything you cannot hold your finger on is a question that needs a number, not a shrug. Warm is not a diagnosis.',
    },
    {
      name: 'The interruption test', short: 'Power cut', tone: 'fault',
      line: 'Cut power mid-operation, at three different points in the cycle, and restore it.',
      do: 'Note where it comes up each time, and whether that matches what your documentation says',
      catches: 'The prop that resumes mid-flare, the stepper that has lost its position, the state variable that was never initialised',
      time: 'Five minutes',
      note: 'Power blips happen, and this is the behaviour an audience will eventually see. <b>Three cuts at three different points, because the interesting failures are timing dependent.</b>',
    },
    {
      name: 'The stranger test', short: 'Stranger', tone: 'signal',
      line: 'Somebody who has not seen it, given only your sheet, in silence.',
      do: 'They power it up, trigger it, cause a fault, identify the fault from the indicator, and reset it',
      catches: 'Every defect in the documentation, which is the twenty per cent of the capstone mark most people lose',
      time: 'Ten minutes, and it is the most valuable ten minutes of the day',
      note: 'If they cannot do it, the sheet is wrong, and the sheet is what goes on the production. <b>The notes you get back are worth more than the marks.</b>',
    },
  ],
  footer: 'Safe and reliable are separate requirements. Failing safe means nobody is hurt; it still means the effect did not happen, and a production needs to know how likely that is.',
}));
