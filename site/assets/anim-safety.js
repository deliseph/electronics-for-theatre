// Class 15, Class 16 and the safety card: what electricity does to a person,
// what actually protects them, and a method for finding faults when tired.

import { register } from './anim-core.js';
import {
  figure, canvas, slider, toggle, choice, label, labelWrap, box, line, palette,
  alpha, fitter, compare, chain, ladder, role, eng, sig,
  arrow, resistorSym, groundSym, readoutChip,
} from './anim-kit.js';

// ---------------------------------------------------------------------------
// Current through a person
// ---------------------------------------------------------------------------

register('shock-path', (host) => {
  let voltage = 230;
  let skin = 'dry';

  const BODY = { dry: 50000, damp: 5000, wet: 1000 };
  const SKIN = { dry: 'Dry skin, hand to hand', damp: 'Sweating, or working warm', wet: 'Wet, or broken skin' };

  const { controls, stage, setNote, challenge } = figure(host, {
    title: 'The same circuit, survivable and lethal',
    sub: 'Nothing about the supply changes. The person does.',
    note: '',
  });

  const current = () => voltage / BODY[skin];

  const upd = () => {
    const I = current() * 1000;
    const band = I < 2 ? 'a tingle' : I < 5 ? 'painful' : I < 10 ? 'painful, close to the let-go threshold'
      : I < 30 ? 'you cannot let go' : I < 50 ? 'breathing difficulty' : I < 1000 ? 'likely ventricular fibrillation' : 'burns and cardiac arrest';
    setNote(`${voltage} V through ${eng(BODY[skin], 'Ω')} gives ${sig(I)} mA: ${band}. <b>${I >= 10 && I < 50 ? 'Above about 10 mA the muscles that close the hand overpower those that open it, so the grip tightens on the conductor and the victim cannot release. This is why bystanders must switch off rather than pull.' : I >= 50 ? 'Nothing about the supply changed between the safe case and this one. Only the person did, which is why the same circuit is survivable in a dry workshop and lethal on a wet stage.' : 'Body resistance is the only thing standing between you and the current, and it falls by a factor of fifty when you are wet.'}</b>`);
    cv.once();
  };

  controls.append(choice('Supply', [[12, '12 V'], [48, '48 V'], [230, '230 V'], [380, '380 V phase to phase']], {
    value: 230, on: (v) => { voltage = +v; upd(); },
  }).node);
  controls.append(choice('Skin', Object.entries(SKIN).map(([k, v]) => [k, v]), {
    value: 'dry', on: (v) => { skin = v; upd(); },
  }).node);

  challenge('Find a combination above the let-go threshold from a supply people call “low voltage”.',
    () => voltage <= 48 && current() * 1000 >= 10);

  const cv = canvas(stage, {
    height: 280, animated: false,
    draw(g, w) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const I = current() * 1000;
      const tone = I < 5 ? R.safe : I < 30 ? R.energy : R.fault;

      // The person and the path across the chest.
      const px = pad + 54;
      g.strokeStyle = tone;
      g.lineWidth = 2.5;
      g.beginPath();
      g.arc(px, 40, 10, 0, Math.PI * 2);
      g.moveTo(px, 50); g.lineTo(px, 98);
      g.moveTo(px, 62); g.lineTo(px - 24, 82);
      g.moveTo(px, 62); g.lineTo(px + 24, 82);
      g.moveTo(px, 98); g.lineTo(px - 16, 132);
      g.moveTo(px, 98); g.lineTo(px + 16, 132);
      g.stroke();
      // The path itself, hand to hand across the chest.
      g.strokeStyle = alpha(tone, 0.5);
      g.lineWidth = 8;
      g.beginPath();
      g.moveTo(px - 24, 82); g.lineTo(px, 66); g.lineTo(px + 24, 82);
      g.stroke();
      label(g, 'hand to hand: across the chest', px, 152, {
        color: tone, size: 10, align: 'center', max: 170,
      });

      const rx = Math.min(px + 90, w - 130);
      const cw = Math.min(120, w - rx - pad);
      readoutChip(g, rx, 24, 'BODY RESISTANCE', eng(BODY[skin], 'Ω'), { color: p.ink, p, w: cw });
      readoutChip(g, rx, 66, 'CURRENT', `${sig(I)} mA`, { color: tone, p, w: cw });
      readoutChip(g, rx, 108, 'RCD WOULD', I >= 30 ? 'trip' : 'not see this', {
        color: I >= 30 ? R.safe : p.muted, p, w: cw,
      });

      // The band scale.
      const bT = 178, bH = 22, bL = pad, bW = w - pad * 2;
      const X = (mA) => bL + ((Math.log10(Math.max(0.3, mA)) + 0.52) / (Math.log10(2000) + 0.52)) * bW;
      const BANDS = [
        [0.3, 2, 'tingle', R.safe],
        [2, 10, 'painful', R.energy],
        [10, 30, 'cannot let go', R.fault],
        [30, 50, 'breathing', R.fault],
        [50, 2000, 'fibrillation, burns', R.fault],
      ];
      BANDS.forEach(([a, z, n, col], k) => {
        g.fillStyle = alpha(col, 0.18 + k * 0.08);
        g.fillRect(X(a), bT, X(z) - X(a), bH);
        if (X(z) - X(a) > 56) {
          label(g, n, (X(a) + X(z)) / 2, bT + bH / 2, {
            color: col, size: 9, align: 'center', max: X(z) - X(a) - 4,
          });
        }
      });
      box(g, bL, bT, bW, bH, { fill: 'transparent', stroke: p.line, r: 4 });
      for (const mA of [1, 10, 30, 100, 1000]) {
        line(g, X(mA), bT + bH, X(mA), bT + bH + 4, { color: p.muted, lw: 1 });
        label(g, `${mA} mA`, X(mA), bT + bH + 13, { color: p.muted, size: 8.5, align: 'center' });
      }
      const cx = X(I);
      line(g, cx, bT - 8, cx, bT + bH, { color: p.ink, lw: 2 });
      g.fillStyle = p.ink;
      g.beginPath();
      g.moveTo(cx, bT); g.lineTo(cx - 5, bT - 9); g.lineTo(cx + 5, bT - 9);
      g.closePath();
      g.fill();

      label(g, `I = V ÷ R = ${voltage} ÷ ${BODY[skin]} = ${sig(I)} mA`, pad, bT + bH + 34, {
        color: p.ink2, size: 11.5, mono: true, max: bW,
      });
      label(g, 'The path matters as much as the total: hand to elbow on one arm does not cross the chest, which is why the one-hand rule exists.',
        pad, bT + bH + 54, { color: p.muted, size: 10.5, max: bW });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// What protects what
// ---------------------------------------------------------------------------

const PROTECTION_ITEMS = [
  {
    name: 'Fuse', short: 'Fuse', tone: 'energy',
    line: 'A wire designed to melt. The oldest protective device and still everywhere.',
    protects: 'The cable, from catching fire',
    trips: 'Excess current, slowly. A 13 A fuse permits 13 A indefinitely',
    fails: 'A person. 13 A is about four hundred times a lethal current',
    watch: 'No fuse or breaker anywhere protects a person. That is not their job, and believing otherwise is the most common and most dangerous misconception in this class.',
    note: 'It is doing a real job, and the job is not you. <b>Protecting the cable from fire and protecting a person from electrocution are two different problems with two different devices.</b>',
  },
  {
    name: 'Circuit breaker', short: 'MCB', tone: 'energy',
    line: 'A resettable overcurrent device, with a thermal element and a magnetic one.',
    protects: 'The cable, from fire',
    trips: 'Excess current: slowly on a small overload, in milliseconds on a short circuit',
    fails: 'A person, for exactly the same reason as a fuse',
    note: 'The magnetic trip at about eight times rated current is what makes protective earthing work. <b>The earth conductor exists to make a fault big enough to reach that threshold instantly.</b>',
  },
  {
    name: 'RCD at 30 mA', short: 'RCD', tone: 'safe',
    line: 'Compares the current going out with the current coming back.',
    protects: 'A person, from an earth fault',
    trips: 'A 30 mA difference between live and neutral, in under 30 ms',
    fails: 'Contact across live and neutral, because the currents still balance. And overload, which it does not measure at all',
    watch: 'It reduces the severity of an earth fault. It does nothing if you touch live and neutral together, and nothing about overload. It is one layer among several.',
    note: '30 mA and 30 ms are chosen deliberately: below the level and above the speed that would cause fibrillation in most people. <b>Not a guarantee of survival, a substantial reduction in the probability of death.</b>',
  },
  {
    name: 'Isolating transformer', short: 'Isolator', tone: 'safe',
    line: 'Removes the reference to earth entirely.',
    protects: 'A person, by making the output float',
    trips: 'Nothing. It is not a detecting device',
    fails: 'Contact across both output conductors at once',
    note: 'With no reference to earth, touching one output conductor while standing on the floor does nothing. <b>Touching both still does everything, so it protects against the common accident and not the deliberate one.</b>',
  },
  {
    name: 'Double insulation', short: 'Class II', tone: 'safe',
    line: 'Two independent layers, and no exposed conductive parts at all.',
    protects: 'A person, by having nothing to become live',
    trips: 'Nothing',
    fails: 'Damage to the insulation, which is invisible from outside',
    note: 'This is why a Class II tool has no earth pin and is not missing one. <b>The square-within-a-square symbol is the claim, and a cracked case invalidates it entirely.</b>',
  },
];

register('protection-devices', (host) => compare(host, {
  title: 'Five devices, and which of them is protecting you',
  sub: 'The error is always the same: assuming the device protecting the cable is also protecting the person.',
  fields: [
    { label: 'Protects', key: 'protects', tone: 'safe' },
    { label: 'Trips on', key: 'trips' },
    { label: 'Does not protect against', key: 'fails', tone: 'fault' },
  ],
  items: PROTECTION_ITEMS,
  footer: 'Only an RCD, isolation or double insulation protects a person, and each of them has a specific gap. Layers, not a single device.',
}));

register('protection-matrix', (host) => compare(host, {
  title: 'What protects what',
  sub: 'Print this half of the safety card and know which column each device is in.',
  fields: [
    { label: 'Protects', key: 'protects', tone: 'safe' },
    { label: 'Does not protect', key: 'fails', tone: 'fault' },
  ],
  items: PROTECTION_ITEMS,
  footer: 'A 13 A fuse permits about four hundred times a lethal current, indefinitely, and it is working correctly the whole time.',
}));

// ---------------------------------------------------------------------------
// How an RCD works
// ---------------------------------------------------------------------------

register('rcd', (host) => {
  let leak = 0;
  let overload = false;

  const { controls, stage, setNote, challenge } = figure(host, {
    title: 'An RCD compares, it does not measure',
    sub: 'Introduce a leakage path, then a straight overload, and watch which one it notices.',
    note: '',
  });

  const upd = () => {
    setNote(overload && leak < 30
      ? 'A 40 A overload with no imbalance: the current going out equals the current coming back, so the RCD sees nothing and does nothing. <b>It is not an overload device, and the breaker beside it is the one doing that job.</b>'
      : leak >= 30
        ? `${leak} mA is returning by another route, so the two conductors no longer balance. The RCD detects the difference and opens the circuit in under 30 ms. <b>Thirty milliamps and thirty milliseconds are chosen to be below the level and above the speed that would cause fibrillation in most people.</b>`
        : leak > 0
          ? `${leak} mA of leakage: real, and below the 30 mA threshold, so nothing trips. <b>Accumulated leakage from many switch-mode supplies on one RCD is a genuine nuisance-tripping problem on large rigs, and it is why they get split across several RCDs.</b>`
          : 'In a healthy circuit the current flowing out in the live conductor exactly equals the current returning in the neutral. The two cancel in the sensing coil and nothing happens. <b>That balance is the entire mechanism.</b>');
    cv.once();
  };

  controls.append(slider('Leakage to earth', {
    min: 0, max: 100, step: 5, value: 0, fmt: (v) => `${v} mA`,
    on: (v) => { leak = v; upd(); },
  }).node);
  controls.append(toggle('Add a 40 A overload', { value: false, on: (v) => { overload = v; upd(); } }).node);

  challenge('Create a dangerous overload the RCD does nothing about.', () => overload && leak < 30);

  const cv = canvas(stage, {
    height: 270,
    draw(g, w, h, t) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const tripped = leak >= 30;
      const load = overload ? 40 : 6;

      const x0 = pad + 20, x1 = w - pad - 70;
      const yL = 46, yN = 86;

      // The sensing coil, drawn around both conductors, which is the mechanism.
      const coilX = x0 + 62;
      g.strokeStyle = R.signal;
      g.lineWidth = 2;
      g.beginPath();
      g.ellipse(coilX, (yL + yN) / 2, 20, 34, 0, 0, Math.PI * 2);
      g.stroke();
      label(g, 'sensing coil', coilX, (yL + yN) / 2 + 48, {
        color: R.signal, size: 9.5, align: 'center', max: 120,
      });

      line(g, x0, yL, x1, yL, { color: tripped ? p.muted : R.fault, lw: 2.5, dash: tripped ? [4, 4] : null });
      line(g, x0, yN, x1, yN, { color: tripped ? p.muted : p.ink2, lw: 2.5, dash: tripped ? [4, 4] : null });
      label(g, 'LIVE', x0, yL - 14, { color: R.fault, size: 9.5, weight: 700 });
      label(g, 'NEUTRAL', x0, yN + 16, { color: p.ink2, size: 9.5, weight: 700 });

      if (!tripped) {
        const speed = 0.2 + load / 60;
        for (let k = 0; k < 6; k++) {
          const u = ((t * speed + k / 6) % 1);
          g.fillStyle = R.fault;
          g.beginPath(); g.arc(x0 + u * (x1 - x0), yL, 3, 0, Math.PI * 2); g.fill();
          g.fillStyle = p.ink2;
          g.beginPath(); g.arc(x1 - u * (x1 - x0), yN, 3, 0, Math.PI * 2); g.fill();
        }
      }

      // The load, and the leakage path.
      box(g, x1, yL - 14, 54, yN - yL + 28, { fill: p.raised, stroke: p.line, r: 5 });
      label(g, 'load', x1 + 27, (yL + yN) / 2 - 8, { color: p.ink2, size: 10, align: 'center' });
      label(g, `${load} A`, x1 + 27, (yL + yN) / 2 + 8, {
        color: overload ? R.fault : p.muted, size: 10.5, align: 'center', weight: 700,
      });

      if (leak > 0) {
        const lx = x1 + 27;
        line(g, lx, yN + 14, lx, yN + 44, { color: R.fault, lw: 2 });
        groundSym(g, lx, yN + 46, R.fault);
        label(g, `${leak} mA`, lx + 12, yN + 30, { color: R.fault, size: 10, weight: 700 });
        if (!tripped) {
          for (let k = 0; k < 3; k++) {
            const u = ((t * 0.9 + k / 3) % 1);
            g.fillStyle = R.fault;
            g.beginPath(); g.arc(lx, yN + 14 + u * 30, 2.6, 0, Math.PI * 2); g.fill();
          }
        }
      }

      // The balance readout.
      const by = 150;
      const outA = load;
      const backA = load - leak / 1000;
      label(g, `Out on live      ${sig(outA)} A`, pad, by, { color: p.ink2, size: 11, mono: true });
      label(g, `Back on neutral  ${sig(backA)} A`, pad, by + 17, { color: p.ink2, size: 11, mono: true });
      label(g, `Difference       ${leak} mA`, pad, by + 34, {
        color: tripped ? R.fault : leak ? R.energy : R.safe, size: 11, mono: true, weight: 700,
      });

      const vy = by + 52;
      box(g, pad, vy, w - pad * 2, 32, {
        fill: alpha(tripped ? R.safe : overload ? R.fault : p.muted, 0.12),
        stroke: alpha(tripped ? R.safe : overload ? R.fault : p.muted, 0.45), r: 7,
      });
      label(g, tripped
        ? 'RCD TRIPS — circuit open in under 30 ms'
        : overload
          ? 'RCD does nothing. It is not an overload device: the breaker is'
          : 'Balanced. The RCD sits there doing nothing, which is correct',
      pad + 12, vy + 16, {
        color: tripped ? R.safe : overload ? R.fault : p.muted, size: 11.5, weight: 700, max: w - pad * 2 - 24,
      });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// Dual channel emergency stop
// ---------------------------------------------------------------------------

register('estop-dual', (host) => {
  let pressed = false;
  let chAFault = 'none';   // none | welded | cut
  let dual = true;
  let tryReset = false;

  const { controls, stage, setNote, challenge } = figure(host, {
    title: 'Dual channel, and the failure nobody would ever notice',
    sub: 'Weld one contact closed. Then see what each arrangement does about it.',
    note: '',
  });

  const chA = () => (chAFault === 'welded' ? true : chAFault === 'cut' ? false : !pressed);
  const chB = () => !pressed;
  const machineRuns = () => (dual ? (chA() && chB() && !disagree()) : chA());
  const disagree = () => dual && chA() !== chB();

  const upd = () => {
    setNote(chAFault === 'welded'
      ? (dual
        ? 'Channel A is welded closed. Channel B opens when the button is pressed, and the safety relay sees the two channels disagree. It refuses to allow a reset. The machine will not start, and nothing appears to be broken. <b>That is what a monitored safety system is for: it turns an undetectable failure into a maintenance problem rather than an incident.</b>'
        : 'Channel A is welded closed and there is nothing to compare it against. Pressing the button does nothing at all. <b>A single contact can weld closed and nobody would know until the day it was needed, which is precisely the day it matters.</b>')
      : chAFault === 'cut'
        ? 'Channel A is open because the cable is cut. Normally closed wiring means the machine stops, exactly as if the button had been pressed. <b>A cut cable, a corroded contact and a pulled connector all cause a stop, which is the whole point of normally closed.</b>'
        : pressed
          ? 'Both channels open, the machine stops, and the button latches. Releasing it does not restart anything: a separate deliberate action is required. <b>A machine that restarts when the button is released will injure the person who released it, and that has happened often enough to be written into every standard.</b>'
          : 'Both channels closed, both agreeing, machine running. The five properties: normally closed, latching, no restart on release, acting on the power source rather than on software, and dual channel with monitoring. <b>A switch with none of those is a switch painted red.</b>');
    cv.once();
  };

  controls.append(toggle('Button pressed', { value: false, on: (v) => { pressed = v; upd(); } }).node);
  controls.append(choice('Channel A', [['none', 'Healthy'], ['welded', 'Welded closed'], ['cut', 'Cable cut']], {
    value: 'none', on: (v) => { chAFault = v; upd(); },
  }).node);
  controls.append(toggle('Dual channel and monitored', { value: true, on: (v) => { dual = v; upd(); } }).node);

  challenge('Create the state where the button does nothing and nobody would ever find out.',
    () => !dual && chAFault === 'welded' && pressed);

  const cv = canvas(stage, {
    height: 280,
    draw(g, w, h, t) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const runs = machineRuns();
      const dis = disagree();

      // The button.
      const bx = pad + 40, by = 62;
      g.fillStyle = alpha(R.fault, pressed ? 0.85 : 0.5);
      g.beginPath(); g.arc(bx, by, pressed ? 22 : 26, 0, Math.PI * 2); g.fill();
      g.strokeStyle = p.ink2;
      g.lineWidth = 2;
      g.stroke();
      label(g, pressed ? 'LATCHED' : 'STOP', bx, by, {
        color: '#fff', size: pressed ? 9.5 : 11, align: 'center', weight: 700,
      });
      label(g, pressed ? 'twist to release' : 'press to stop', bx, by + 38, {
        color: p.muted, size: 9, align: 'center', max: 110,
      });

      // The two channels.
      const cx0 = bx + 44, cx1 = w - pad - 130;
      [['A', 92, chA(), chAFault], ['B', 122, chB(), 'none']].forEach(([n, y, closed, fault], k) => {
        if (k === 1 && !dual) return;
        const yy = k === 0 ? 44 : 84;
        const col = closed ? R.safe : R.fault;
        line(g, cx0, yy, cx1, yy, {
          color: fault === 'cut' ? alpha(p.muted, 0.4) : col, lw: 2.5,
          dash: fault === 'cut' ? [4, 4] : null,
        });
        label(g, `channel ${n}`, cx0, yy - 12, { color: p.muted, size: 9.5 });
        // The contact itself.
        const mx = (cx0 + cx1) / 2;
        g.fillStyle = p.surface;
        g.fillRect(mx - 16, yy - 8, 32, 16);
        g.fillStyle = p.muted;
        g.beginPath(); g.arc(mx - 12, yy, 3, 0, Math.PI * 2); g.fill();
        g.beginPath(); g.arc(mx + 12, yy, 3, 0, Math.PI * 2); g.fill();
        line(g, mx - 12, yy, mx + 12, yy - (closed ? 0 : 11), { color: col, lw: 2.5 });
        if (fault === 'welded') {
          label(g, 'welded', mx, yy + 16, { color: R.fault, size: 9.5, align: 'center', weight: 700 });
        } else if (fault === 'cut') {
          label(g, '✂', mx + 34, yy, { color: R.fault, size: 12, weight: 700 });
        }
        if (closed && fault !== 'cut') {
          for (let j = 0; j < 4; j++) {
            const u = ((t * 0.6 + j / 4) % 1);
            g.fillStyle = R.safe;
            g.beginPath(); g.arc(cx0 + u * (cx1 - cx0), yy, 2.6, 0, Math.PI * 2); g.fill();
          }
        }
      });

      // The safety relay.
      const rx = cx1 + 8;
      box(g, rx, 30, 68, 74, {
        fill: alpha(dis ? R.fault : runs ? R.safe : p.muted, 0.12),
        stroke: dis ? R.fault : runs ? R.safe : p.muted, r: 6, lw: dual ? 2 : 1,
      });
      label(g, dual ? 'safety relay' : 'contactor', rx + 34, 44, {
        color: p.ink2, size: 9.5, align: 'center', max: 64,
      });
      label(g, dis ? 'DISAGREE' : runs ? 'closed' : 'open', rx + 34, 66, {
        color: dis ? R.fault : runs ? R.safe : p.muted, size: 10.5, align: 'center', weight: 700, max: 64,
      });
      if (dis) label(g, 'reset refused', rx + 34, 86, { color: R.fault, size: 9, align: 'center', max: 64 });

      // The machine.
      const my = 152;
      box(g, pad, my, w - pad * 2, 34, {
        fill: alpha(runs ? R.energy : R.safe, 0.12), stroke: alpha(runs ? R.energy : R.safe, 0.45), r: 7,
      });
      label(g, runs ? 'MACHINE RUNNING' : 'MACHINE STOPPED', pad + 12, my + 17, {
        color: runs ? R.energy : R.safe, size: 12, weight: 700,
      });
      const bad = runs && pressed;
      if (bad) {
        label(g, 'the button is pressed and the machine is running', w - pad - 12, my + 17, {
          color: R.fault, size: 10.5, align: 'right', weight: 700, max: w * 0.5,
        });
      }

      // The five properties.
      const py = my + 48;
      const PROPS = [
        ['Normally closed', true],
        ['Latching', true],
        ['No restart on release', true],
        ['Acts on the power source', true],
        ['Dual channel, monitored', dual],
      ];
      PROPS.forEach(([n, ok], k) => {
        const y = py + Math.floor(k / 2) * 17;
        const x = pad + (k % 2) * ((w - pad * 2) / 2);
        label(g, ok ? '✓' : '✕', x, y, { color: ok ? R.safe : R.fault, size: 11, weight: 700 });
        label(g, n, x + 14, y, { color: ok ? p.ink2 : R.fault, size: 10.5, max: (w - pad * 2) / 2 - 20 });
      });
    },
  });
  upd();
});

register('interlock', (host) => compare(host, {
  title: 'Interlocks, and the one you will actually meet',
  sub: 'Same principles as an emergency stop: normally closed, monitored, defeat-resistant.',
  fields: [
    { label: 'What it does', key: 'does' },
    { label: 'How it is defeated', key: 'defeat', tone: 'fault' },
    { label: 'What to do about it', key: 'fix', tone: 'safe' },
  ],
  items: [
    {
      name: 'Guard interlock', short: 'Guard', tone: 'safe',
      line: 'Stops the machine while a guard is open.',
      does: 'A normally closed switch made by the guard being in place',
      defeat: 'A cable tie holding the switch closed, or a magnet taped near a reed switch',
      fix: 'Coded or dual-channel switches, which cannot be operated by a stray magnet',
      note: 'The defeated version always looks tidy and deliberate, because it was done by somebody competent under time pressure. <b>That is what makes it easy to walk past.</b>',
    },
    {
      name: 'Zone interlock', short: 'Zone', tone: 'signal',
      line: 'Stops movement while somebody is in the hazard zone.',
      does: 'A beam, a mat or a scanner covering the approach',
      defeat: 'Moving the emitter to point somewhere convenient, or muting it "for the changeover"',
      fix: 'Muting must be a designed, time-limited function, not a switch somebody added',
    },
    {
      name: 'Key exchange', short: 'Key', tone: 'safe',
      line: 'You cannot have the key to the gate and the key to the drive at the same time.',
      does: 'Physical impossibility rather than an electrical decision',
      defeat: 'A second key, cut without authorisation',
      fix: 'Controlled key issue, and a count. This is the most robust arrangement on the list',
      note: 'The only interlock on this list that does not depend on a contact working. <b>Physical impossibility beats electrical logic every time it is available.</b>',
    },
    {
      name: 'Software interlock', short: 'Software', tone: 'fault',
      line: 'The control system declines to move because a condition is not met.',
      does: 'A check inside the program before commanding movement',
      defeat: 'A commissioning flag left set, or a hung program that never reaches the check',
      fix: 'Never the only layer. The hardware layer must be able to stop the machine independently',
      watch: 'A software interlock is a convenience feature, not a safety system. If the program hangs, the check never runs, and the machine has no idea anything is wrong.',
    },
  ],
  footer: 'Finding a defeated interlock is a stop-work event. Not a note, not a mention at the production meeting. It was designed in by somebody who identified a hazard.',
}));

register('lockout', (host) => chain(host, {
  title: 'Isolation, and the lock that is the whole point',
  sub: 'Six steps. The one that gets skipped is step three.',
  tag: 'Step', accent: 'safe',
  stages: [
    {
      name: 'Identify',
      body: 'Find the correct isolation point. The correct one, verified, not the one that is probably right.',
      why: 'If you cannot name the isolation point, you are not ready to start. Half the incidents in this category begin with somebody isolating the wrong way.',
    },
    {
      name: 'Isolate',
      body: 'Switch off and, where possible, physically disconnect.',
      why: 'A switch can be closed by somebody who does not know you are there. A disconnection cannot be undone by accident.',
    },
    {
      name: 'Lock',
      body: 'Lock the isolator with your own lock, and keep the key on you. Not in a drawer, not with a colleague.',
      why: '“I told him I was working on it” has killed people, because the person who was told went home and somebody else found a circuit switched off for no apparent reason.',
      note: 'One lock per person working, and the isolation cannot be restored until every lock is removed. <b>This is the step that gets skipped and the step that matters.</b>',
    },
    {
      name: 'Tag',
      body: 'Who, when, why, and how to reach you.',
      why: 'A lock with no tag is a mystery. A mystery under time pressure gets cut off.',
    },
    {
      name: 'Prove dead',
      body: 'Live, dead, live, at the point of work. Prove the meter on a known live source, test the circuit, prove the meter again.',
      why: 'A meter with a flat battery, a broken lead or the wrong function reads zero on everything, and zero is exactly the answer you were hoping for.',
      note: 'This is the Class 2 procedure, and it is why it was taught in Class 2. <b>It is not optional professional caution: it is the standard method, and skipping it is how people are killed by circuits they had tested.</b>',
    },
    {
      name: 'Discharge',
      body: 'Discharge any capacitors through a resistor, prove that too, and measure again a minute later.',
      why: 'Some capacitors recover a surprising amount of charge on their own. Shorting one with a screwdriver welds the screwdriver and can rupture the capacitor.',
    },
  ],
  footer: 'If you are not certain it is dead, it is live. Everything else on the safety card is an elaboration of that sentence.',
}));

// ---------------------------------------------------------------------------
// Fault-finding as a method
// ---------------------------------------------------------------------------

register('fault-tree', (host) => {
  let items = 16;
  let method = 'half';

  const { controls, stage, setNote, challenge } = figure(host, {
    title: 'Half-split against searching along the chain',
    sub: 'The most transferable idea in the whole course, in one picture.',
    note: '',
  });

  const tests = () => (method === 'half' ? Math.ceil(Math.log2(items)) : items);
  const avg = () => (method === 'half' ? Math.ceil(Math.log2(items)) : Math.ceil(items / 2));

  const upd = () => {
    setNote(method === 'half'
      ? `${items} possible failure points, ${tests()} tests in the worst case. <b>Under time pressure methodical is faster than clever, and this is where you find that out: the gap widens as the system gets bigger, which is exactly when you are most tempted to guess.</b>`
      : `${items} possible failure points, up to ${tests()} tests and ${avg()} on average. <b>It feels like guessing because it is, and on a twenty-device system it is four times the work of half-splitting.</b>`);
    cv.once();
  };

  controls.append(slider('Possible failure points', {
    min: 4, max: 64, step: 2, value: 16, fmt: (v) => String(v),
    on: (v) => { items = v; upd(); },
  }).node);
  controls.append(choice('Method', [['half', 'Half-split'], ['seq', 'Along the chain']], {
    value: 'half', on: (v) => { method = v; upd(); },
  }).node);

  challenge('Find the system size where half-splitting saves more than fifty tests.',
    () => method === 'half' && items - Math.ceil(Math.log2(items)) > 50);

  const cv = canvas(stage, {
    height: 270, animated: false,
    draw(g, w) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const gL = pad, gT = 24, gW = w - pad * 2, gH = 60;

      // The chain, with the search pattern drawn over it.
      const cw = gW / items;
      const faultAt = Math.floor(items * 0.68);
      for (let k = 0; k < items; k++) {
        const x = gL + k * cw;
        g.fillStyle = k === faultAt ? alpha(R.fault, 0.6) : alpha(p.muted, 0.18);
        g.fillRect(x + 0.5, gT, Math.max(cw - 1, 1), 22);
      }
      label(g, 'the fault is here', gL + faultAt * cw + cw / 2, gT - 8, {
        color: R.fault, size: 9.5, align: 'center', max: 130,
      });

      // The tests, in order.
      let lo = 0, hi = items - 1, n = 0;
      const marks = [];
      if (method === 'half') {
        while (lo <= hi && n < 40) {
          const mid = Math.floor((lo + hi) / 2);
          marks.push(mid);
          n++;
          if (mid === faultAt) break;
          if (mid < faultAt) lo = mid + 1; else hi = mid - 1;
        }
      } else {
        for (let k = 0; k <= faultAt && k < 64; k++) { marks.push(k); n++; }
      }
      marks.forEach((m, k) => {
        const x = gL + m * cw + cw / 2;
        const y = gT + 30 + (k % 6) * 5;
        line(g, x, gT + 22, x, y, { color: alpha(R.signal, 0.7), lw: 1 });
        g.fillStyle = R.signal;
        g.beginPath(); g.arc(x, y, 2.6, 0, Math.PI * 2); g.fill();
      });
      label(g, `${n} test${n === 1 ? '' : 's'} to find it`, gL, gT + gH + 4, {
        color: method === 'half' ? R.safe : R.fault, size: 12, weight: 700,
      });

      // The comparison curve.
      const cT = gT + gH + 26, cH = 88;
      line(g, gL + 26, cT + cH, gL + gW, cT + cH, { color: p.muted, lw: 1.5 });
      line(g, gL + 26, cT, gL + 26, cT + cH, { color: p.muted, lw: 1.5 });
      const X = (nn) => gL + 26 + (nn / 64) * (gW - 26);
      const Y = (v) => cT + cH - (v / 64) * cH;
      g.strokeStyle = alpha(R.fault, 0.8);
      g.lineWidth = 2;
      g.beginPath();
      for (let k = 4; k <= 64; k++) { const x = X(k); k === 4 ? g.moveTo(x, Y(k)) : g.lineTo(x, Y(k)); }
      g.stroke();
      label(g, 'along the chain', X(64) - 4, Y(58), { color: R.fault, size: 9.5, align: 'right' });
      g.strokeStyle = R.safe;
      g.lineWidth = 2.5;
      g.beginPath();
      for (let k = 4; k <= 64; k++) {
        const x = X(k);
        const v = Math.ceil(Math.log2(k));
        k === 4 ? g.moveTo(x, Y(v)) : g.lineTo(x, Y(v));
      }
      g.stroke();
      label(g, 'half-split', X(64) - 4, Y(9), { color: R.safe, size: 9.5, align: 'right' });
      const cx = X(items);
      line(g, cx, cT, cx, cT + cH, { color: alpha(p.ink, 0.4), lw: 1, dash: [3, 3] });
      label(g, `${items}`, cx, cT + cH + 12, { color: p.ink, size: 9.5, align: 'center' });
      label(g, 'tests', gL + 22, cT - 4, { color: p.muted, size: 9, align: 'right' });
      label(g, 'system size', gL + gW, cT + cH + 24, { color: p.muted, size: 9.5, align: 'right' });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// Class 16
// ---------------------------------------------------------------------------

register('capstone-map', (host) => compare(host, {
  title: 'Four parts, and only the first is about the object',
  sub: 'Fault-finding is the largest single component, on a device you have never seen. That is deliberate.',
  fields: [
    { label: 'Weight', key: 'weight' },
    { label: 'What is actually assessed', key: 'what' },
    { label: 'Where marks are lost', key: 'lost', tone: 'fault' },
  ],
  items: [
    {
      name: 'The build', short: 'Build 25%', tone: 'signal',
      line: 'A working piece of show electronics you designed, built, tested and documented.',
      weight: '25 per cent',
      what: 'Does it work, is it safe, is the workmanship sound',
      lost: 'Ambition beyond execution. A modest device done well scores far above a big one that half works',
      note: 'Scale is not the point. <b>A well-executed practical lamp with honest documentation scores above an ambitious machine with no sheet, and a production would choose the same way.</b>',
    },
    {
      name: 'The proof', short: 'Proof 25%', tone: 'safe',
      line: 'Demonstrating, with instruments, that your claims are true.',
      weight: '25 per cent',
      what: 'Measured current, V_DS and the dissipation from it, isolation, power-up state three times from cold, loss-of-control behaviour, fault detection, PWM frequency on a scope',
      lost: 'Saying “it works” instead of showing a number. That is not a proof',
      watch: 'Expect to be asked for any of those measurements, on the spot, with the instrument visible. This is the Class 2 discipline, assessed.',
    },
    {
      name: 'The documentation', short: 'Docs 20%', tone: 'energy',
      line: 'One side of A4 that a stranger can operate the device from.',
      weight: '20 per cent',
      what: 'Ten points: what it is, ratings, pinout, power-up, loss of control, fault codes, reset, limitations, test results, contact',
      lost: 'Known limitations left blank. Every device has them, and the sheets that list three specific ones score above the sheets that list none',
      note: 'A limitation you have named is engineering. <b>The same limitation undocumented is a defect.</b>',
    },
    {
      name: 'The fault exam', short: 'Faults 30%', tone: 'fault',
      line: 'Three faulted systems, thirty minutes each, alone, on work you have never seen.',
      weight: '30 per cent',
      what: 'Method: boundary established before touching, a written log, half-splitting, one change at a time, proving the fix',
      lost: 'Rushing past the boundary step and spending twenty-five minutes in the wrong half of the system',
      note: 'You can score well on a system you did not fix. <b>A clear log with a narrowed boundary and a defensible next test scores above a lucky find with no log, because only one of those transfers to a fault nobody has seen.</b>',
    },
  ],
  footer: 'If any system presents a safety issue, stop, isolate and report. That is a full-mark response, and continuing to work on it is a zero regardless of what else you find.',
}));

register('exam-method', (host) => chain(host, {
  title: 'Thirty minutes, structured',
  sub: 'Enough time for a methodical search and not enough for a random one.',
  tag: 'Phase', accent: 'safe',
  stages: [
    {
      name: '0–5 min · Look',
      body: 'Do not touch. What works, what does not, what is warm, what is lit, what smells. Read the documentation if there is any. Write down the boundary.',
      why: 'The state of a failed system is evidence, and somebody who starts unplugging destroys it in the first thirty seconds.',
      note: 'Five minutes of looking feels like wasting a sixth of your time. <b>It is what makes the remaining twenty-five productive rather than random.</b>',
    },
    {
      name: '5–10 min · Hypothesis',
      body: 'First hypothesis, and the test that would disprove it. Not confirm: disprove.',
      why: 'A test that can only confirm tells you nothing when it passes. A test that could have disproved your idea and did not is real evidence.',
    },
    {
      name: '10–25 min · Half-split',
      body: 'Work within the boundary. One change at a time, all of it logged, reversed if it did not help.',
      why: 'Sixteen possible points is four tests. The log is the assessed artefact, not the fix.',
    },
    {
      name: '25–30 min · Close',
      body: 'Prove the fix by reintroducing the fault. Or write down where you got to, what you excluded, and what your next test would be.',
      why: 'Never leave this blank. It is worth marks and it is what a real handover looks like at the end of a shift.',
      note: 'A partial diagnosis handed over clearly is a professional outcome. <b>An unexplained “I did not finish” is not, and the difference is five minutes of writing.</b>',
    },
  ],
  footer: 'Marked on method, not outcome. Speed on its own is not marked at all.',
}));

register('where-next', (host) => compare(host, {
  title: 'Where each direction leads',
  sub: 'Sixty four hours is an introduction. By now you should know which way you want to go deeper.',
  fields: [
    { label: 'What it is', key: 'what' },
    { label: 'What it costs', key: 'cost' },
    { label: 'Start with', key: 'start', tone: 'safe' },
  ],
  items: [
    {
      name: 'Do the electrical work yourself', short: 'Electrical', tone: 'energy',
      line: 'The regulated qualification for working on fixed installations and hire equipment.',
      what: 'Hong Kong: Electrical Worker Registration under the Electricity Ordinance. UK: City & Guilds 2365 then 2391. North America: a state apprenticeship, plus ETCP Entertainment Electrician',
      cost: 'One to five years part time, depending on the jurisdiction',
      start: 'Find out what your jurisdiction actually requires before paying for any course',
      note: 'This course does not qualify you for mains work and does not pretend to. <b>What it gives you is the ability to supervise it, check it, and refuse it.</b>',
    },
    {
      name: 'Entertainment technology', short: 'Entertainment', tone: 'signal',
      line: 'The certifications the industry actually recognises.',
      what: 'ETCP Entertainment Electrician and Rigger, PLASA and ABTT training, and manufacturer courses from ETC, MA and Robe',
      cost: 'ETCP needs documented experience plus an exam. Manufacturer training is often free',
      start: 'Manufacturer training. It is undervalued, cheap or free, and taught by people who work on the products',
    },
    {
      name: 'Automation and machinery', short: 'Automation', tone: 'fault',
      line: 'Motion control, servo drives, PLCs and functional safety.',
      what: 'High responsibility, well paid, and the part of the industry where ISO 13849 and IEC 60204-1 stop being background reading',
      cost: 'Real study. These are engineering standards, not guidance notes',
      start: 'ISO 13849 and a PLC trainer. Read what Stage Technologies, TAIT and Kinesys publish',
      watch: 'If you build automation or safety systems, read ISO 13849 and IEC 60204-1 properly. They define what “dual channel monitored” actually means, and they are what a supplier’s claims should be checked against.',
    },
    {
      name: 'Show control and networking', short: 'Networks', tone: 'signal',
      line: 'The sibling module to this one.',
      what: 'Networks, protocols, media over IP, show control architecture, and the diagnostic ladder',
      cost: 'Free, and it is on GitHub',
      start: 'Computer Systems and Networking for Theatre, by the same author',
    },
    {
      name: 'Audio electronics', short: 'Audio', tone: 'safe',
      line: 'Analogue design, amplifier topologies, transformers, loudspeaker measurement.',
      what: 'A deep and satisfying rabbit hole, and Class 7 is its doorway',
      cost: 'Years, happily spent',
      start: 'The Art of Electronics, chapters rather than the whole book. Then build a preamp',
    },
    {
      name: 'Embedded and firmware', short: 'Embedded', tone: 'signal',
      line: 'If Classes 11 to 14 were the ones you enjoyed, this is a career on its own.',
      what: 'C properly, one real-time operating system, and reading a datasheet completely rather than searching it',
      cost: 'Considerable, and highly portable outside this industry',
      start: 'Ben Eater’s series on building a computer from logic gates. Free, and the best explanation available anywhere',
    },
  ],
  footer: 'And the actual answer: build something nobody asked for. Skills decay without use, and a self-directed project is where you find out which parts you only thought you understood.',
}));

// ---------------------------------------------------------------------------
// The safety card
// ---------------------------------------------------------------------------

register('safe-start', (host) => chain(host, {
  title: 'Before you start work',
  sub: 'Five things, every time, and none of them takes more than a minute.',
  tag: 'Check', accent: 'safe',
  stages: [
    {
      name: 'Know what it is',
      body: 'What you are working on, and what feeds it.',
      why: 'If you cannot name the isolation point, you are not ready to start. This is not a formality, it is the first thing that goes wrong.',
    },
    {
      name: 'Know where the isolation is',
      body: 'Find it, confirm it is the right one, and confirm it works.',
      why: 'You will need it in a hurry, and “in a hurry” is exactly when nobody can find the right way.',
    },
    {
      name: 'Know who else is affected',
      body: 'Anything shared, anything a performer touches, anything above somebody’s head.',
      why: 'Most of what you isolate feeds something else, and somebody is relying on it right now without knowing you exist.',
    },
    {
      name: 'Work with somebody in the building',
      body: 'For anything above extra-low voltage. Not necessarily in the room, but aware and reachable.',
      why: 'The whole point of the let-go threshold is that the victim cannot help themselves. Somebody has to be able to switch off.',
      note: 'This is the rule people talk themselves out of most often, because the work is small and quick. <b>The incidents are also small and quick.</b>',
    },
    {
      name: 'Know where the first aid kit is',
      body: 'And the nearest defibrillator. Before you need to know.',
      why: 'Looking for it afterwards costs the minutes that decide the outcome.',
    },
  ],
  footer: 'One hand where you can. No jewellery, no watch, no loose lanyard. Eye protection. Ventilation. Tidy as you go.',
}));

register('voltage-bands', (host) => ladder(host, {
  title: 'The bands, and what each one means for you',
  sub: 'Drag through the range. The thresholds are where the rules change, not where the danger starts.',
  note: 'Below 50 V is not “safe”, it is lower shock risk. <b>A 12 V battery can deliver hundreds of amps into a short and start a fire in seconds, and energy and shock are two separate hazards.</b>',
  unit: 'V', min: 1, max: 20000, start: 230,
  sliderLabel: 'Voltage',
  bands: [
    { from: 1, to: 50, name: 'Extra low voltage', tone: 'safe', what: 'Below 50 V AC or 120 V DC. Shock risk low on dry skin. Energy risk is entirely unchanged: a 12 V pack will still start a fire' },
    { from: 50, to: 1000, name: 'Low voltage', tone: 'fault', what: 'This includes mains at 220–240 V. Lethal. Qualified work only, and this course does not qualify you' },
    { from: 1000, to: 20000, name: 'High voltage', tone: 'fault', what: 'Never. Distance and specialist procedures. It can arc to you without contact' },
  ],
  readout: (v, b) => `${sig(v)} V is ${b.name.toLowerCase()}. <b>${b.what}.</b>`,
  footer: 'Damp changes everything: body resistance falls from tens of kilohms to about a kilohm, and the current at a given voltage rises by the same factor. This is why the rules tighten outdoors, near water, and on a stage under lights.',
}));

register('shock-response', (host) => chain(host, {
  title: 'If somebody is being shocked',
  sub: 'The first step is the one every instinct fights.',
  tag: 'Step', accent: 'fault',
  stages: [
    {
      name: 'Do not touch them',
      body: 'However urgent it looks.',
      why: 'You will become the second casualty and there will be nobody left to help. This is the step every instinct fights and the step everything else depends on.',
      note: 'Above the let-go threshold their muscles are holding them onto the conductor. <b>Grabbing them puts you in the same circuit, and now there are two people who cannot let go.</b>',
    },
    {
      name: 'Switch off',
      body: 'The isolator, the breaker, the plug.',
      why: 'This is why you find the isolation point before you start work rather than while somebody is being electrocuted.',
    },
    {
      name: 'If you cannot switch off, push them clear',
      body: 'With something dry and non-conductive: a wooden broom handle, a dry rope, a plastic chair.',
      why: 'Not your hands, not anything damp, not anything metal. Damp wood conducts.',
    },
    {
      name: 'Call emergency services',
      body: 'Immediately, and before you assess anything. Hong Kong and most of the region 999, Europe 112, North America 911.',
      why: 'Assessment takes time you do not have, and the call takes seconds.',
    },
    {
      name: 'CPR if they are not breathing',
      body: 'And get the defibrillator.',
      why: 'Ventricular fibrillation is what kills in an electric shock, and a defibrillator is the specific treatment for it.',
    },
    {
      name: 'Hospital, even if they feel fine',
      body: 'Anybody who has taken a mains shock goes to hospital.',
      why: 'Cardiac arrhythmias can appear hours later. This is the rule people most often talk themselves out of, and it is the one with the delayed consequence.',
      note: 'They will feel fine. They will say they are fine. <b>The arrhythmia is hours away and they will be on their own by then.</b>',
    },
  ],
  footer: 'Electrical fire: isolate first if it is safe. CO₂ or dry powder, never water. A lithium fire supplies its own oxygen, reignites, and is for the fire service.',
}));
