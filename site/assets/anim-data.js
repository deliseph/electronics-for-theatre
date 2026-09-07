// Classes 9 and 10: what a voltage means once two devices have agreed, and
// what each way of breaking that agreement looks like from the auditorium.

import { register } from './anim-core.js';
import {
  figure, canvas, slider, toggle, choice, label, labelWrap, box, line, palette,
  alpha, fitter, compare, chain, role, eng, sig, textWidth,
  arrow, resistorSym, groundSym, readoutChip, node,
} from './anim-kit.js';

// ---------------------------------------------------------------------------
// One byte on the wire
// ---------------------------------------------------------------------------

register('serial-frame', (host) => {
  let byte = 0x4b;
  let baudRight = true;

  const { controls, stage, setNote, challenge } = figure(host, {
    title: 'One byte, start bit to stop bit',
    sub: 'There is no clock line. Both ends agree a rate, and the receiver samples in the middle of each bit.',
    note: '',
  });

  const upd = () => {
    setNote(baudRight
      ? `A start bit, eight data bits sent least significant first, then two stop bits. At 250 kbit/s each bit is 4 µs wide, and the whole frame is 44 µs. <b>Measure one bit on a scope and you can calculate the rate: that is a genuinely useful diagnostic skill and it takes ten seconds.</b>`
      : 'At the wrong rate the receiver samples at the wrong moments and assembles bytes that are technically valid and completely meaningless. <b>A wrong baud rate gives you garbage rather than nothing, which is why "there is data but it is nonsense" is a rate problem far more often than a wiring one.</b>');
    cv.once();
  };

  controls.append(slider('Byte value', {
    min: 0, max: 255, step: 1, value: 0x4b,
    fmt: (v) => `${v} · 0x${v.toString(16).toUpperCase().padStart(2, '0')}`,
    on: (v) => { byte = v; upd(); },
  }).node);
  controls.append(toggle('Receiver at the right baud rate', { value: true, on: (v) => { baudRight = v; upd(); } }).node);

  challenge('Send the DMX start code, 0x00.', () => byte === 0);

  const cv = canvas(stage, {
    height: 260, animated: false,
    draw(g, w) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const bits = [];
      bits.push({ v: 0, n: 'start' });
      for (let k = 0; k < 8; k++) bits.push({ v: (byte >> k) & 1, n: `d${k}` });
      bits.push({ v: 1, n: 'stop' });
      bits.push({ v: 1, n: 'stop' });

      const gL = pad, gT = 34, gW = w - pad * 2, gH = 56;
      const bw = gW / bits.length;
      const hi = gT, lo = gT + gH;

      // The waveform.
      g.strokeStyle = R.signal;
      g.lineWidth = 2.5;
      g.beginPath();
      g.moveTo(gL - 0, hi);
      let x = gL;
      let prev = 1;
      for (const b of bits) {
        const y = b.v ? hi : lo;
        if (b.v !== prev) g.lineTo(x, y);
        g.lineTo(x + bw, y);
        prev = b.v;
        x += bw;
      }
      g.lineTo(gL + gW, hi);
      g.stroke();

      // Bit cells and the sampling instants.
      bits.forEach((b, k) => {
        const bx = gL + k * bw;
        line(g, bx, gT - 8, bx, lo + 8, { color: alpha(p.line, 0.9), lw: 1 });
        const isFrame = k === 0 || k > 8;
        label(g, isFrame ? b.n : String(b.v), bx + bw / 2, lo + 18, {
          color: isFrame ? p.muted : p.ink, size: 10, align: 'center', weight: isFrame ? 500 : 700, mono: true,
        });
        if (!isFrame) label(g, b.n, bx + bw / 2, lo + 32, { color: p.muted, size: 8.5, align: 'center', mono: true });
        // Where the receiver looks. Off-centre when the rate is wrong.
        const off = baudRight ? 0.5 : 0.5 + (k - 4) * 0.11;
        const sx = bx + bw * off;
        if (sx > gL && sx < gL + gW) {
          const correct = off > 0.1 && off < 0.9;
          g.fillStyle = correct ? R.safe : R.fault;
          g.beginPath();
          g.arc(sx, b.v ? hi : lo, 3.5, 0, Math.PI * 2);
          g.fill();
        }
      });
      label(g, 'idle high', gL, gT - 14, { color: p.muted, size: 9.5 });
      label(g, baudRight ? 'sampled in the middle of each bit' : 'sampling drifts: the wrong rate',
        gL + gW, gT - 14, {
          color: baudRight ? R.safe : R.fault, size: 9.5, align: 'right', weight: 600, max: gW - 70,
        });

      const wy = lo + 52;
      label(g, `Value  ${byte}  ·  0x${byte.toString(16).toUpperCase().padStart(2, '0')}  ·  ${byte.toString(2).padStart(8, '0')}  ·  ${byte >= 32 && byte < 127 ? `'${String.fromCharCode(byte)}'` : 'not printable'}`,
        pad, wy, { color: p.ink, size: 11.5, mono: true, max: w - pad * 2 });
      label(g, 'At 250 kbit/s:  one bit 4 µs  ·  one frame 44 µs  ·  512 frames plus break, 22.7 ms', pad, wy + 20, {
        color: p.ink2, size: 11, mono: true, max: w - pad * 2,
      });
      label(g, baudRight
        ? 'Data bits go least significant first, which is why the picture reads backwards from the number.'
        : 'The bytes that come out will be valid values. They will just be the wrong ones.',
      pad, wy + 40, { color: baudRight ? p.muted : R.fault, size: 10.5, max: w - pad * 2 });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// Differential signalling
// ---------------------------------------------------------------------------

register('rs485-diff', (host) => {
  let noise = 50;
  let differential = true;

  const { controls, stage, setNote, challenge } = figure(host, {
    title: 'Why RS-485 survives a building',
    sub: 'The same trick as balanced audio, applied to data. Add interference and watch which one still decodes.',
    note: '',
  });

  const upd = () => {
    setNote(differential
      ? `Interference lands on both conductors equally and the receiver looks only at the difference, so it cancels. <b>This is what makes 1200 m runs possible in an electrically hostile building, and it is why DMX uses a twisted pair rather than a wire and a ground.</b>`
      : 'Single-ended, the interference adds straight onto the signal and the receiver has nothing to subtract it from. Above a certain level the decoded bits start to be wrong. <b>RS-485 says what the voltages are; DMX512 says what the bits mean, and a DMX problem is nearly always an RS-485 problem.</b>');
    cv.once();
  };

  controls.append(toggle('Differential pair', { value: true, on: (v) => { differential = v; upd(); } }).node);
  controls.append(slider('Interference', {
    min: 0, max: 100, step: 5, value: 50, fmt: (v) => String(v),
    on: (v) => { noise = v; upd(); },
  }).node);

  challenge('Push the interference to maximum and still decode the data correctly.',
    () => differential && noise >= 95);

  const cv = canvas(stage, {
    height: 280,
    draw(g, w, h, t) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const gL = pad + 26, gW = w - pad * 2 - 26;
      const pattern = (u) => (Math.floor(u * 9 + 0.3) % 2 ? 1 : -1);
      const nz = (u) => (noise / 100) * (Math.sin(u * 21 - t * 7) * 0.8 + Math.sin(u * 47 + t * 3) * 0.35);

      const trace = (y, f, col, lw = 2) => {
        g.strokeStyle = col;
        g.lineWidth = lw;
        g.beginPath();
        for (let k = 0; k <= 300; k++) {
          const u = k / 300;
          const x = gL + u * gW;
          const yy = y - f(u) * 15;
          k ? g.lineTo(x, yy) : g.moveTo(x, yy);
        }
        g.stroke();
      };

      trace(48, (u) => pattern(u) + nz(u), R.signal);
      label(g, differential ? 'A  (data +)' : 'signal', pad, 48, { color: R.signal, size: 9.5, align: 'left' });
      if (differential) {
        trace(96, (u) => -pattern(u) + nz(u), alpha(R.signal, 0.75));
        label(g, 'B  (data −)', pad, 96, { color: R.signal, size: 9.5 });
      } else {
        line(g, gL, 96, gL + gW, 96, { color: p.muted, lw: 2 });
        label(g, 'ground', pad, 96, { color: p.muted, size: 9.5 });
      }

      if (noise > 3) {
        for (let k = 0; k < 5; k++) {
          const x = gL + 30 + k * ((gW - 60) / 4);
          arrow(g, x, 16, x, 32, { color: alpha(R.fault, 0.6), lw: 1.5, head: 5 });
        }
        label(g, 'interference on both conductors equally', gL + gW / 2, 10, {
          color: R.fault, size: 9.5, align: 'center', max: gW,
        });
      }

      // The receiver's view.
      const oy = 132, oh = 66;
      box(g, pad, oy, w - pad * 2, oh, { fill: alpha(p.ground, 0.5), stroke: p.line, r: 6 });
      const mid = oy + oh / 2;
      const recovered = (u) => (differential ? pattern(u) * 2 : pattern(u) + nz(u));
      g.strokeStyle = R.safe;
      g.lineWidth = 2;
      g.beginPath();
      for (let k = 0; k <= 300; k++) {
        const u = k / 300;
        const x = pad + 6 + u * (w - pad * 2 - 12);
        const v = recovered(u);
        k ? g.lineTo(x, mid - v * 13) : g.moveTo(x, mid - v * 13);
      }
      g.stroke();
      line(g, pad + 6, mid, w - pad - 6, mid, { color: alpha(p.muted, 0.6), lw: 1, dash: [4, 3] });
      label(g, differential ? 'A − B: signal doubled, interference gone' : 'what the receiver sees', pad + 10, oy + 12, {
        color: differential ? R.safe : R.fault, size: 10.5, weight: 600, max: w - pad * 2 - 20,
      });

      // Decoded bits, which is the actual outcome.
      let errors = 0;
      const decoded = [];
      for (let k = 0; k < 9; k++) {
        const u = (k + 0.5) / 9;
        const want = pattern(u) > 0 ? 1 : 0;
        const got = recovered(u) > 0 ? 1 : 0;
        if (got !== want) errors++;
        decoded.push(got);
      }
      const by = oy + oh + 20;
      label(g, `decoded  ${decoded.join(' ')}`, pad, by, {
        color: errors ? R.fault : R.safe, size: 12, mono: true, weight: 700, max: w - pad * 2,
      });
      label(g, errors ? `${errors} bit${errors > 1 ? 's' : ''} wrong` : 'no errors', pad, by + 20, {
        color: errors ? R.fault : R.safe, size: 11, max: w - pad * 2,
      });
      label(g, 'No termination, wrong cable impedance, too many devices, a star, or a broken screen: those are the RS-485 problems, and they are the DMX problems too.',
        pad, by + 40, { color: p.muted, size: 10.5, max: w - pad * 2 });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// The DMX packet
// ---------------------------------------------------------------------------

register('dmx-packet', (host) => {
  let slots = 512;

  const { controls, stage, setNote, challenge } = figure(host, {
    title: 'One DMX packet, timed',
    sub: 'Break, mark after break, start code, then up to 512 slots. Reduce the channel count and watch the refresh rate.',
    note: '',
  });

  const packetTime = () => (92 + 12 + (slots + 1) * 44) / 1e6;
  const rate = () => 1 / packetTime();

  const upd = () => {
    setNote(`${slots} slots takes ${eng(packetTime(), 's')} per packet, so ${sig(rate())} Hz. <b>A full universe refreshes at about 44 Hz, and sending fewer channels genuinely refreshes faster, which is why some consoles offer a channel limit and why a moving-light rig can feel more responsive when you use it.</b>`);
    cv.once();
  };

  controls.append(slider('Slots sent', {
    min: 24, max: 512, step: 8, value: 512, fmt: (v) => String(v),
    on: (v) => { slots = v; upd(); },
  }).node);

  challenge('Get the refresh rate above 100 Hz and note what it costs you.', () => rate() > 100);

  const cv = canvas(stage, {
    height: 270, animated: false,
    draw(g, w) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const total = packetTime() * 1e6;
      const PARTS = [
        ['Break', 92, R.fault, 'line held low, at least 92 µs'],
        ['MAB', 12, R.energy, 'mark after break, at least 12 µs'],
        ['Start code', 44, R.signal, '0x00 for normal dimmer data'],
        [`${slots} slots`, slots * 44, R.safe, '44 µs each, with a start bit and two stop bits'],
      ];

      // The packet, to scale, which is the point: the break is tiny.
      const gL = pad, gT = 40, gW = w - pad * 2, gH = 34;
      let x = gL;
      PARTS.forEach(([name, us, col]) => {
        const bw = (us / total) * gW;
        box(g, x, gT, Math.max(bw, 1.5), gH, { fill: alpha(col, 0.35), stroke: col, r: 3 });
        if (bw > 46) label(g, name, x + bw / 2, gT + gH / 2, { color: p.ink, size: 10, align: 'center', max: bw - 6 });
        x += bw;
      });
      label(g, `one packet  ${eng(packetTime(), 's')}`, gL, gT - 12, { color: p.ink2, size: 10.5 });
      label(g, `${sig(rate())} Hz refresh`, gL + gW, gT - 12, {
        color: rate() > 40 ? R.safe : R.fault, size: 10.5, align: 'right', weight: 700,
      });

      // The zoomed break, because at scale it is invisible.
      const zT = gT + gH + 26, zH = 40;
      const zW = Math.min(gW, 300);
      box(g, gL, zT, zW, zH, { fill: alpha(p.ground, 0.5), stroke: p.line, r: 5 });
      const hi = zT + 8, lo = zT + zH - 8;
      g.strokeStyle = R.signal;
      g.lineWidth = 2.2;
      g.beginPath();
      g.moveTo(gL + 4, hi);
      g.lineTo(gL + 20, hi); g.lineTo(gL + 20, lo);
      g.lineTo(gL + zW * 0.44, lo); g.lineTo(gL + zW * 0.44, hi);
      g.lineTo(gL + zW * 0.56, hi); g.lineTo(gL + zW * 0.56, lo);
      g.lineTo(gL + zW * 0.60, lo); g.lineTo(gL + zW * 0.60, hi);
      g.lineTo(gL + zW - 4, hi);
      g.stroke();
      label(g, 'break', gL + zW * 0.3, lo + 12, { color: R.fault, size: 9, align: 'center' });
      label(g, 'MAB', gL + zW * 0.5, hi - 10, { color: R.energy, size: 9, align: 'center' });
      label(g, 'start code', gL + zW * 0.75, hi - 10, { color: R.signal, size: 9, align: 'center' });
      label(g, 'the break is longer than any valid byte, so it cannot be mistaken for data',
        gL, zT + zH + 14, { color: p.muted, size: 10, max: gW });

      const wy = zT + zH + 36;
      const rows = [
        ['Bit rate', '250 kbit/s, so 4 µs per bit'],
        ['Slot, with framing', '44 µs: start bit, 8 data bits, 2 stop bits'],
        ['Packet', `92 + 12 + ${slots + 1} × 44 = ${Math.round(total)} µs`],
        ['Refresh', `1 ÷ ${eng(packetTime(), 's')} = ${sig(rate())} Hz`],
      ];
      rows.forEach(([a, b], k) => {
        label(g, a, pad, wy + k * 17, { color: p.muted, size: 10.5, max: w * 0.32 });
        label(g, b, pad + Math.max(w * 0.34, 120), wy + k * 17, {
          color: p.ink2, size: 10.5, mono: true, max: w - pad - Math.max(w * 0.34, 120),
        });
      });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// Topology
// ---------------------------------------------------------------------------

register('dmx-topology', (host) => {
  let topo = 'chain';

  const TOPO = {
    chain: ['Daisy chain, terminated', 'Correct. One cable in, one out, device to device, and a 120 Ω terminator at the far end.'],
    unterm: ['Daisy chain, no terminator', 'Usually works. The reflection is present and merely small enough to survive today. Add cable, add a fixture, change the temperature, and it becomes intermittent flicker somewhere unrelated to the actual problem.'],
    star: ['Passive star', 'Multiple unmatched branches and multiple reflection paths. Some branches work, others do not, and which ones changes when you touch things. It looks like a haunting and it is impedance.'],
    split: ['Active splitter', 'Correct. Each output is buffered and independently terminated, and a good one is optically isolated so a fault on one branch cannot reach the others.'],
  };

  const { controls, stage, setNote } = figure(host, {
    title: 'Four ways to wire a DMX line, two of them correct',
    sub: 'The passive star is the one that produces the least diagnosable symptom in this course.',
    note: '',
  });

  const upd = () => {
    setNote(`${TOPO[topo][0]}. ${TOPO[topo][1]} <b>${topo === 'star' ? 'This is why splitters exist, and why a “DMX Y-splitter” bought online is a device for creating intermittent faults.' : topo === 'unterm' ? '“It worked without a terminator” is a statement about luck, not about the design.' : 'Maximum 32 devices per run, about 300 m of cable, and 110 Ω cable rather than microphone cable.'}</b>`);
    cv.once();
  };

  controls.append(choice('Topology', Object.entries(TOPO).map(([k, v]) => [k, v[0]]), {
    value: 'chain', on: (v) => { topo = v; upd(); },
  }).node);

  const cv = canvas(stage, {
    height: 260,
    draw(g, w, h, t) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const cy = 68;
      const cx = pad + 34;

      box(g, pad, cy - 18, 56, 36, { fill: p.raised, stroke: p.line, r: 5 });
      label(g, 'console', pad + 28, cy, { color: p.ink2, size: 10, align: 'center' });

      const fixture = (x, y, ok) => {
        box(g, x - 14, y - 14, 28, 28, {
          fill: ok ? alpha(R.safe, 0.2) : alpha(R.fault, 0.2),
          stroke: ok ? R.safe : R.fault, r: 5,
        });
        if (!ok) {
          const f = Math.sin(t * 9 + x) > 0;
          label(g, f ? '✕' : '·', x, y, { color: R.fault, size: 13, align: 'center', weight: 700 });
        }
      };

      if (topo === 'chain' || topo === 'unterm') {
        const n = 5;
        const spacing = (w - pad * 2 - 90) / n;
        for (let k = 0; k < n; k++) {
          const x = pad + 76 + k * spacing;
          line(g, x - spacing + (k === 0 ? spacing - 20 : 0), cy, x - 14, cy, { color: R.signal, lw: 2 });
          // The unterminated reflection corrupts the middle of the run, not
          // the end, which is what makes it so hard to find.
          fixture(x, cy, topo === 'chain' || k !== 2);
        }
        const endX = pad + 76 + (n - 1) * spacing + 14;
        line(g, endX, cy, endX + 26, cy, { color: R.signal, lw: 2 });
        if (topo === 'chain') {
          g.save();
          g.translate(endX + 38, cy);
          g.rotate(Math.PI / 2);
          resistorSym(g, -14, 0, 28, 11, R.safe, 2);
          g.restore();
          groundSym(g, endX + 38, cy + 16, R.safe, 1.5);
          label(g, '120 Ω', endX + 38, cy - 20, { color: R.safe, size: 9.5, align: 'center' });
        } else {
          label(g, 'open', endX + 30, cy - 16, { color: R.fault, size: 9.5, weight: 700 });
          // The reflection, travelling back.
          const u = (t * 0.5) % 1;
          g.fillStyle = alpha(R.fault, 1 - u);
          g.beginPath();
          g.arc(endX + 26 - u * (endX - pad - 60), cy, 4, 0, Math.PI * 2);
          g.fill();
          label(g, 'reflection travels back and corrupts the following bits', pad, cy + 42, {
            color: R.fault, size: 10, max: w - pad * 2,
          });
        }
      } else if (topo === 'star') {
        const branchY = [cy - 34, cy, cy + 34];
        line(g, pad + 56, cy, pad + 92, cy, { color: R.signal, lw: 2 });
        g.fillStyle = R.fault;
        g.beginPath();
        g.arc(pad + 92, cy, 5, 0, Math.PI * 2);
        g.fill();
        label(g, 'passive Y', pad + 92, cy + 20, { color: R.fault, size: 9.5, align: 'center' });
        branchY.forEach((by, k) => {
          line(g, pad + 92, cy, pad + 130, by, { color: R.signal, lw: 2 });
          for (let j = 0; j < 2; j++) {
            const x = pad + 160 + j * 60;
            line(g, x - 60 + (j ? 14 : 16), by, x - 14, by, { color: R.signal, lw: 2 });
            // Which branch works depends on the exact lengths, so it changes.
            fixture(x, by, (k + j + Math.floor(t / 2)) % 3 !== 0);
          }
        });
        label(g, 'which branches work changes as you touch things', pad, cy + 66, {
          color: R.fault, size: 10, max: w - pad * 2,
        });
      } else {
        line(g, pad + 56, cy, pad + 92, cy, { color: R.signal, lw: 2 });
        box(g, pad + 92, cy - 30, 44, 60, { fill: alpha(R.safe, 0.15), stroke: R.safe, r: 5 });
        label(g, 'active', pad + 114, cy - 8, { color: R.safe, size: 9.5, align: 'center' });
        label(g, 'splitter', pad + 114, cy + 6, { color: R.safe, size: 9.5, align: 'center' });
        [cy - 34, cy, cy + 34].forEach((by, k) => {
          line(g, pad + 136, cy - 20 + k * 20, pad + 160, by, { color: R.signal, lw: 2 });
          for (let j = 0; j < 2; j++) {
            const x = pad + 190 + j * 60;
            line(g, x - 60 + (j ? 14 : 16), by, x - 14, by, { color: R.signal, lw: 2 });
            fixture(x, by, true);
          }
        });
        label(g, 'each output buffered, terminated, and ideally isolated', pad, cy + 66, {
          color: R.safe, size: 10, max: w - pad * 2,
        });
      }

      const ry = 152;
      const ok = topo === 'chain' || topo === 'split';
      box(g, pad, ry, w - pad * 2, 30, {
        fill: alpha(ok ? R.safe : R.fault, 0.1), stroke: alpha(ok ? R.safe : R.fault, 0.45), r: 7,
      });
      label(g, TOPO[topo][0], pad + 12, ry + 16, {
        color: ok ? R.safe : R.fault, size: 12, weight: 700, max: w - pad * 2 - 24,
      });
      labelWrap(g, TOPO[topo][1], pad, ry + 42, { color: p.ink2, size: 11, max: w - pad * 2, maxLines: 3 });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// Termination and reflection
// ---------------------------------------------------------------------------

register('termination', (host) => {
  let term = 120;
  let metres = 100;

  const { controls, stage, setNote, challenge } = figure(host, {
    title: 'Reflection, and the resistor that absorbs it',
    sub: 'A cable has a characteristic impedance. An end that does not match it sends the signal back.',
    note: '',
  });

  // The reflection coefficient: zero when matched, ±1 at the extremes.
  const gamma = () => (term - 110) / (term + 110);

  const upd = () => {
    const gm = Math.abs(gamma());
    setNote(gm < 0.06
      ? `A 120 Ω terminator across 110 Ω cable reflects almost nothing: the energy is absorbed rather than sent back. <b>The delay before a reflection returns is twice the cable length divided by the propagation velocity, which is how a real cable fault locator works.</b>`
      : `A reflection coefficient of ${sig(gamma())} sends ${Math.round(gm * 100)} per cent of the signal back down the cable. Over ${metres} m it returns ${eng((2 * metres) / 2e8, 's')} later, which at 250 kbit/s is inside the following bits. <b>An unterminated line usually works, which is exactly what makes it dangerous: it fails later, and somewhere unrelated to the cause.</b>`);
    cv.once();
  };

  controls.append(choice('At the far end', [
    [120, '120 Ω terminator'], [1e6, 'Nothing (open)'], [47, '47 Ω, wrong value'], [0.1, 'Short circuit'],
  ], { value: 120, on: (v) => { term = +v; upd(); } }).node);
  controls.append(slider('Cable length', {
    min: 10, max: 300, step: 10, value: 100, fmt: (v) => `${v} m`,
    on: (v) => { metres = v; upd(); },
  }).node);

  challenge('Find the termination that reflects nothing.', () => Math.abs(gamma()) < 0.06);

  const cv = canvas(stage, {
    height: 270,
    draw(g, w, h, t) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const gm = gamma();
      const x0 = pad + 30, x1 = w - pad - 44;
      const cy = 52;

      line(g, x0, cy, x1, cy, { color: p.muted, lw: 3 });
      label(g, `${metres} m of 110 Ω cable`, (x0 + x1) / 2, cy - 16, {
        color: p.muted, size: 10, align: 'center', max: x1 - x0,
      });
      box(g, pad - 6, cy - 16, 34, 32, { fill: p.raised, stroke: p.line, r: 4 });
      label(g, 'TX', pad + 11, cy, { color: p.ink2, size: 10, align: 'center' });

      if (term > 1e5) {
        label(g, 'open', x1 + 6, cy - 14, { color: R.fault, size: 10, weight: 700 });
      } else if (term < 1) {
        line(g, x1, cy, x1, cy + 20, { color: R.fault, lw: 3 });
        groundSym(g, x1, cy + 22, R.fault);
      } else {
        g.save();
        g.translate(x1 + 16, cy);
        g.rotate(Math.PI / 2);
        resistorSym(g, -14, 0, 28, 11, Math.abs(gm) < 0.06 ? R.safe : R.energy, 2);
        g.restore();
        groundSym(g, x1 + 16, cy + 16, p.muted, 1.5);
        label(g, `${term} Ω`, x1 + 16, cy - 18, {
          color: Math.abs(gm) < 0.06 ? R.safe : R.energy, size: 9.5, align: 'center',
        });
      }

      // The pulse travelling out and, if it reflects, back.
      const period = 2.4;
      const u = (t % period) / period;
      const drawPulse = (pos, col, size) => {
        const px = x0 + pos * (x1 - x0);
        g.fillStyle = col;
        g.beginPath();
        g.arc(px, cy, size, 0, Math.PI * 2);
        g.fill();
      };
      if (u < 0.5) drawPulse(u * 2, R.signal, 5);
      else if (Math.abs(gm) > 0.06) drawPulse(1 - (u - 0.5) * 2, alpha(gm > 0 ? R.fault : R.energy, Math.abs(gm)), 3 + Math.abs(gm) * 3);
      else if (u < 0.62) {
        g.fillStyle = alpha(R.safe, 1 - (u - 0.5) / 0.12);
        g.beginPath();
        g.arc(x1, cy, 5 + (u - 0.5) * 40, 0, Math.PI * 2);
        g.fill();
        label(g, 'absorbed', x1, cy + 28, { color: R.safe, size: 9.5, align: 'center' });
      }

      // What the fixture in the middle of the run actually receives.
      const oy = 108, oh = 76;
      box(g, pad, oy, w - pad * 2, oh, { fill: alpha(p.ground, 0.5), stroke: p.line, r: 6 });
      const mid = oy + oh / 2;
      g.strokeStyle = Math.abs(gm) < 0.06 ? R.safe : R.fault;
      g.lineWidth = 2.2;
      g.beginPath();
      const delay = (2 * metres) / 2e8 * 250000;   // reflection delay, in bit times
      for (let k = 0; k <= 320; k++) {
        const uu = (k / 320) * 8;   // eight bit times across the screen
        let v = (Math.floor(uu) % 2) ? 1 : -1;
        if (uu > delay) v += gm * ((Math.floor(uu - delay) % 2) ? 1 : -1) * 0.9;
        const x = pad + 6 + (k / 320) * (w - pad * 2 - 12);
        k ? g.lineTo(x, mid - v * 20) : g.moveTo(x, mid - v * 20);
      }
      g.stroke();
      line(g, pad + 6, mid, w - pad - 6, mid, { color: alpha(p.muted, 0.5), lw: 1, dash: [4, 3] });
      label(g, Math.abs(gm) < 0.06 ? 'clean edges: the receiver decodes every bit' : 'ringing on every edge: bits decode wrongly, intermittently',
        pad + 10, oy + 12, {
          color: Math.abs(gm) < 0.06 ? R.safe : R.fault, size: 10.5, weight: 600, max: w - pad * 2 - 20,
        });

      const wy = oy + oh + 20;
      label(g, `Reflection coefficient  (${term > 1e5 ? '∞' : sig(term)} − 110) ÷ (${term > 1e5 ? '∞' : sig(term)} + 110) = ${sig(gamma())}`,
        pad, wy, { color: p.ink2, size: 11, mono: true, max: w - pad * 2 });
      label(g, `Round trip over ${metres} m at two thirds light speed = ${eng((2 * metres) / 2e8, 's')}`, pad, wy + 18, {
        color: p.muted, size: 11, mono: true, max: w - pad * 2,
      });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// The protocol landscape
// ---------------------------------------------------------------------------

register('protocol-map', (host) => compare(host, {
  title: 'What each protocol is actually for',
  sub: 'The distinction that decides everything: does it send state, or does it send events?',
  fields: [
    { label: 'Carries', key: 'carries' },
    { label: 'Physical layer', key: 'phys' },
    { label: 'State or event', key: 'kind', tone: 'signal' },
    { label: 'How it fails', key: 'fails', tone: 'fault' },
  ],
  items: [
    {
      name: 'DMX512', short: 'DMX', tone: 'energy',
      line: '512 levels, repeated 44 times a second, forever. No addressing, no error checking, no return path.',
      carries: '512 bytes per universe', phys: 'RS-485 on 5-pin XLR, 250 kbit/s',
      kind: 'State: the complete picture, resent constantly',
      fails: 'Flicker. A lost packet is corrected by the next one',
      note: 'Nothing on a DMX line can tell you anything, including whether it is there. <b>Everything you believe about the state of the rig, you believe because you sent it.</b>',
    },
    {
      name: 'RDM', short: 'RDM', tone: 'signal',
      line: 'Discovery and configuration over the same pair, in the gaps between DMX packets.',
      carries: 'Device identity, address, sensors, personality', phys: 'The same DMX pair',
      kind: 'Event, request and response',
      fails: 'Devices do not appear. Often because a splitter in the path is not RDM-capable',
      watch: 'A non-RDM splitter blocks the return path silently. The DMX still works perfectly, so the fault looks like the fixtures rather than the splitter.',
    },
    {
      name: 'sACN (E1.31)', short: 'sACN', tone: 'safe',
      line: 'Many universes over Ethernet, using multicast. The modern default.',
      carries: 'Many DMX universes, with priority', phys: 'Ethernet, UDP multicast',
      kind: 'State, like DMX',
      fails: 'A whole universe disappears, usually a subnet or a multicast issue rather than a cable',
      note: 'Multicast means devices subscribe to the universes they want and the switch only sends those. <b>On a large rig that is the difference between a network that works and one that saturates, and it is why sACN has largely won.</b>',
    },
    {
      name: 'Art-Net', short: 'Art-Net', tone: 'signal',
      line: 'The older DMX-over-Ethernet protocol, commonly broadcast.',
      carries: 'Many DMX universes', phys: 'Ethernet, UDP, commonly broadcast',
      kind: 'State',
      fails: 'Everything slows as the universe count rises, because every device processes every packet',
    },
    {
      name: 'MIDI', short: 'MIDI', tone: 'fault',
      line: 'Note and control events at 31.25 kbit/s over a current loop.',
      carries: 'Note on, note off, control change, program change', phys: 'Current loop on 5-pin DIN, or USB',
      kind: 'Event: a thing that happened, once',
      fails: 'A missed message stays missed. The system is now in the wrong state until somebody intervenes',
      watch: 'Event protocols need MORE reliability than state protocols, not less, and people habitually assume the opposite. A marginal DMX cable flickers; a marginal show control link misses a cue.',
    },
    {
      name: 'OSC', short: 'OSC', tone: 'signal',
      line: 'Arbitrary named messages over a network. Flexible, and two way.',
      carries: 'Anything you define: /cue/12/go', phys: 'Ethernet, UDP or TCP',
      kind: 'Event',
      fails: 'Silently, unless you built acknowledgement into your own design',
      note: 'OSC defines an envelope, not a vocabulary. <b>Two systems both speaking OSC do not necessarily understand each other, which is a genuinely different situation from two systems both speaking DMX.</b>',
    },
    {
      name: 'SMPTE timecode', short: 'Timecode', tone: 'safe',
      line: 'A continuous statement of position in time, carried as an audio-level signal.',
      carries: 'Hours, minutes, seconds, frames', phys: 'Audio level on a normal audio path',
      kind: 'State, continuously',
      fails: 'Drop-out, and everything free-runs until it returns',
    },
  ],
  footer: 'A state protocol resends everything constantly, so a lost packet self-corrects. An event protocol says a thing happened once, and nothing corrects a loss. That single difference decides how each one fails.',
}));

// ---------------------------------------------------------------------------
// DMX over a network
// ---------------------------------------------------------------------------

register('packet-network', (host) => {
  let mode = 'multicast';
  let universes = 8;

  const { controls, stage, setNote, challenge } = figure(host, {
    title: 'Broadcast against multicast, on a real rig',
    sub: 'Eight universes, four nodes, each wanting two. Watch what each node has to process.',
    note: '',
  });

  const perNode = () => (mode === 'broadcast' ? universes : 2);

  const upd = () => {
    setNote(mode === 'broadcast'
      ? `Broadcast: every node receives and processes all ${universes} universes and discards the ${universes - 2} it does not need. At ${sig(universes * 44 * 638 * 8 / 1e6)} Mbit/s that is fine on a small rig and it is what saturates a large one. <b>The processing is on the node, which is usually the weakest device on the network.</b>`
      : `Multicast: each node subscribes to the two universes it needs and the switch only forwards those. Each node processes ${perNode()} universes regardless of how many exist. <b>This is why sACN scales and Art-Net's broadcast mode does not, and it is the practical reason the industry moved.</b>`);
    cv.once();
  };

  controls.append(choice('Transport', [['multicast', 'sACN multicast'], ['broadcast', 'Broadcast']], {
    value: 'multicast', on: (v) => { mode = v; upd(); },
  }).node);
  controls.append(slider('Universes on the network', {
    min: 2, max: 32, step: 2, value: 8, fmt: (v) => String(v),
    on: (v) => { universes = v; upd(); },
  }).node);

  challenge('Put 32 universes on the network and keep each node processing only two.',
    () => universes === 32 && mode === 'multicast');

  const cv = canvas(stage, {
    height: 260,
    draw(g, w, h, t) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const cx = w / 2;
      const conY = 34, swY = 92, nodeY = 154;

      box(g, cx - 40, conY - 14, 80, 28, { fill: p.raised, stroke: p.line, r: 5 });
      label(g, 'console', cx, conY, { color: p.ink2, size: 10, align: 'center' });
      box(g, cx - 40, swY - 14, 80, 28, { fill: p.raised, stroke: p.line, r: 5 });
      label(g, 'switch', cx, swY, { color: p.ink2, size: 10, align: 'center' });
      line(g, cx, conY + 14, cx, swY - 14, { color: R.signal, lw: 2 });
      label(g, `${universes} universes`, cx + 46, (conY + swY) / 2, { color: p.muted, size: 9.5 });

      const nodes = 4;
      const spacing = Math.min(110, (w - pad * 2) / nodes);
      const startX = cx - ((nodes - 1) * spacing) / 2;
      for (let k = 0; k < nodes; k++) {
        const nx = startX + k * spacing;
        const load = perNode() / 32;
        line(g, cx, swY + 14, nx, nodeY - 16, { color: R.signal, lw: 2 });
        box(g, nx - 32, nodeY - 16, 64, 44, {
          fill: alpha(load > 0.4 ? R.fault : R.safe, 0.12),
          stroke: load > 0.4 ? R.fault : R.safe, r: 5,
        });
        label(g, `node ${k + 1}`, nx, nodeY - 2, { color: p.ink2, size: 9.5, align: 'center' });
        label(g, `${perNode()} univ`, nx, nodeY + 12, {
          color: load > 0.4 ? R.fault : R.safe, size: 10.5, align: 'center', weight: 700,
        });
        // Traffic, at a rate proportional to what the node must process.
        const rate = 0.35 + load * 2.4;
        for (let j = 0; j < 4; j++) {
          const u = ((t * rate + j / 4) % 1);
          g.fillStyle = alpha(load > 0.4 ? R.fault : R.signal, 0.85);
          g.beginPath();
          g.arc(cx + (nx - cx) * u, swY + 14 + (nodeY - 16 - swY - 14) * u, 2.6, 0, Math.PI * 2);
          g.fill();
        }
        label(g, 'needs 2', nx, nodeY + 38, { color: p.muted, size: 9, align: 'center' });
      }

      const wy = nodeY + 58;
      label(g, `Each node processes  ${perNode()} of ${universes} universes`, pad, wy, {
        color: perNode() > 2 ? R.fault : R.safe, size: 11.5, mono: true, weight: 700, max: w - pad * 2,
      });
      label(g, `Wasted processing    ${perNode() - 2} universes per node, ${(perNode() - 2) * 4} across the rig`, pad, wy + 18, {
        color: p.muted, size: 11, mono: true, max: w - pad * 2,
      });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// Class 10: the fault library
// ---------------------------------------------------------------------------

register('fault-library', (host) => compare(host, {
  title: 'A library of symptoms, built deliberately',
  sub: 'Fourteen faults, and what each one looks like from the auditorium rather than from the schematic.',
  fields: [
    { label: 'What it looks like', key: 'looks' },
    { label: 'What it actually is', key: 'is' },
    { label: 'The test that finds it', key: 'test', tone: 'safe' },
  ],
  items: [
    { name: 'Terminator removed', short: '1', tone: 'fault', looks: 'Intermittent flicker, often on a fixture in the middle of the run', is: 'Reflection from the unmatched far end corrupting following bits', test: 'Scope at the far end. Or simply: is there a terminator?' },
    { name: 'Two fixtures, one address', short: '2', tone: 'fault', looks: 'Two fixtures moving together, and nothing anywhere reports an error', is: 'DMX has no addressing, so it has no collision detection', test: 'Compare the console patch against each fixture’s own display' },
    { name: 'One channel off', short: '3', tone: 'fault', looks: 'The wrong attribute responds: colour changes on the dimmer fader', is: 'Fixture addressed one channel away from the patch', test: 'Move one channel at a time from the console and watch what answers' },
    { name: 'Footprint past 512', short: '4', tone: 'fault', looks: 'Fixture partly responds; the last few attributes are dead', is: 'A fixture at 510 needing 8 channels does not fit in the universe', test: 'Arithmetic: address plus footprint minus one must be under 513' },
    { name: 'Data pair swapped', short: '5', tone: 'fault', looks: 'That fixture and everything after it is dead', is: 'Data plus and minus reversed in one cable', test: 'The boundary: everything before works, everything after does not' },
    { name: 'Screen open', short: '6', tone: 'fault', looks: 'Works perfectly, then fails when the dimmers come up', is: 'No shield, so dimmer harmonics corrupt the data', test: 'Correlate with the lighting state. “Only in the ballroom scene” is data' },
    { name: 'Passive star', short: '7', tone: 'fault', looks: 'Some branches fine, others corrupt, and it changes as you patch', is: 'Multiple reflection paths whose interference depends on exact lengths', test: 'Look at the topology. No test on any single cable will find it' },
    { name: 'Microphone cable', short: '8', tone: 'fault', looks: 'Works at 10 m, fails when extended to 60 m', is: '50 Ω cable where 110 Ω belongs, and higher capacitance', test: 'Read the cable jacket. Then substitute and compare' },
    { name: 'Wrong universe', short: '9', tone: 'fault', looks: 'A whole group dead, everything else perfect', is: 'Node set to the wrong universe', test: 'Read the node’s display. Ninety seconds with a correct drawing' },
    { name: 'Split pairs', short: '10', tone: 'fault', looks: 'Link comes up; sACN drops out under load', is: 'Pins 3 and 6 not on one twisted pair', test: 'A proper cable tester, not a continuity tester. Or check the link speed' },
    { name: 'Different subnets', short: '11', tone: 'fault', looks: 'Node looks completely healthy on its own display; no data', is: 'Console and node cannot reach each other', test: 'Read both IP addresses. This is the first thing to check on a network fault' },
    { name: '33rd device', short: '12', tone: 'fault', looks: 'The whole run becomes unreliable, with no single bad device', is: 'RS-485 loading exceeded', test: 'Count the devices. The limit is 32 per run' },
    { name: 'Wrong personality', short: '13', tone: 'fault', looks: 'Right channels arriving, fixture doing the wrong things with them', is: 'Console in 16-channel mode, fixture in 8-channel mode', test: 'Compare the console’s patch to the fixture’s display. Nothing electrical is wrong' },
    { name: 'Splitter output dead', short: '14', tone: 'fault', looks: 'One branch out, the others fine', is: 'A failed output stage in the splitter', test: 'Move the branch to another output. If it works, the splitter is the fault' },
  ],
  footer: 'Faults 6, 7 and 13 teach the most. One is triggered by another department, one has no single faulty component, and one is not electrical at all.',
}));

register('rig-topology', (host) => chain(host, {
  title: 'The drawing is the deliverable',
  sub: 'The build is not the hard part. The documentation is, and it is where the marks are.',
  tag: 'Step', accent: 'safe',
  stages: [
    {
      name: 'Draw it first',
      body: 'Before the rig is powered: every device with its address, universe and channel footprint; every cable with its length and label; where the terminators are; where the isolation barriers are; which device is at the end of each run.',
      why: 'Drawing it first forces you to notice the decisions. Drawing it afterwards records whatever you happened to do.',
    },
    {
      name: 'Build it',
      body: 'Daisy chains, terminators at the far ends, active splitters at every branch, 110 Ω cable throughout.',
      why: 'Every one of those is a fault from the library if it is wrong, and each takes seconds to get right at build time.',
    },
    {
      name: 'Label everything',
      body: 'Every cable at both ends. Every fixture address readable from the ground. Every universe a colour.',
      why: 'The test: could somebody who has never seen this rig find the third fixture on run two, in the dark, in ninety seconds? That is exactly the situation at 22:00 during a technical rehearsal.',
      note: 'Labelling is not administration. <b>It is the difference between a two minute fault and a ten minute one, repeated every time something goes wrong for the whole run.</b>',
    },
    {
      name: 'Correct the drawing',
      body: 'Power up, walk the rig, and fix everything the drawing got wrong.',
      why: 'It will be wrong. The drawing that matches reality is the deliverable, not the drawing you made first.',
      note: 'Get it signed off by another team before you power up. <b>A drawing that only its author can read is not a drawing.</b>',
    },
    {
      name: 'Prove it',
      body: 'Every fixture responds, on the right channel, at the right address, in the right universe. Scope the far end of each run and photograph the clean trace.',
      why: 'You need the clean trace for comparison when the faults are introduced. A photograph of what right looks like is worth more than a memory of it.',
    },
  ],
  footer: 'A team with a correct drawing finds fault 9 in ninety seconds. A team without one starts unplugging things.',
}));

register('symptom-map', (host) => chain(host, {
  title: 'From what the stage manager said to what is wrong',
  sub: 'The translation is the skill. The electronics is the easy half.',
  tag: 'Step', accent: 'energy',
  stages: [
    {
      name: 'Characterise, do not touch',
      body: 'What is affected, what is not, and where is the line between them? The fault is on that line.',
      why: 'The state of a failed system is evidence. Somebody who starts unplugging destroys it in the first thirty seconds.',
      note: 'The boundary question eliminates most of the rig in one pass. <b>It costs nothing, requires no tools, and it is the step people skip when they are in a hurry.</b>',
    },
    {
      name: 'Translate the report',
      body: '“The upstage left one is doing something weird” becomes: which fixture, which attribute, since when, and does anything else share its cable, its universe or its address.',
      why: 'The words a stage manager uses are accurate about the symptom and say nothing about the cause. Both halves of that sentence matter.',
    },
    {
      name: 'Half-split',
      body: 'Test at the midpoint of the affected section. A rig with sixteen possible failure points is four tests, not sixteen.',
      why: 'Under time pressure, methodical is faster than clever. This is the finding of every one of these classes.',
    },
    {
      name: 'One change, written down',
      body: 'Change one thing. Record it. Reverse it if it did not help.',
      why: 'A rig where four things were changed and it started working is a rig that will fail again for reasons nobody knows.',
    },
    {
      name: 'Prove it',
      body: 'Put the fault back and confirm the symptom returns.',
      why: 'If you cannot make it come back, you found a coincidence rather than a cause.',
      note: 'Then write it up: symptom, tests, cause, fix, and what would prevent a recurrence. <b>Fifteen minutes, and it stops the same fault costing the same hours next year.</b>',
    },
  ],
  footer: 'Marked on the log, not on the time. A pair who narrowed the boundary correctly and ran out of time has done better work than a pair who found it by luck.',
}));

register('net-diag', (host) => chain(host, {
  title: 'Three questions, in order, before anything else',
  sub: 'A DMX line is silent. A network will tell you things, if you ask it.',
  tag: 'Check', accent: 'signal',
  stages: [
    {
      name: 'Link',
      body: 'Is the light on at both ends, and at the right speed? A link at 100 Mbit/s where you expect 1 Gbit/s usually means a damaged cable using only two pairs.',
      why: 'A link light means enough pairs are working to establish some link. It is not a statement that the cable is good.',
      note: 'The speed is the informative part, not the light. <b>A cable with a damaged pair links happily and drops packets under load, which looks like an intermittent software fault.</b>',
    },
    {
      name: 'Address',
      body: 'Are the console, the node and the switch on the same subnet? Read both addresses, do not assume.',
      why: 'A node showing 2.x.x.x when the console is on 10.x.x.x cannot receive anything, and the node’s own display will look completely healthy.',
      note: 'This is the fault that wastes the most time on a network rig, because every device reports itself as fine. <b>Nothing is broken; they simply cannot reach each other.</b>',
    },
    {
      name: 'Traffic',
      body: 'Is the node receiving packets at all? Most have a data indicator.',
      why: 'Dark means the problem is upstream of the node. Lit with dark fixtures means the problem is downstream, and you are back to a DMX fault.',
      note: 'Those three questions split the network half of a rig into thirds in under a minute. <b>Everything after that is the DMX method you already know.</b>',
    },
  ],
  footer: 'The sibling module on computer systems and networking goes considerably deeper on all three.',
}));

// ---------------------------------------------------------------------------
// Addresses and masks
// ---------------------------------------------------------------------------

register('ip-basics', (host) => {
  let consoleIp = '10.101.3.10', consoleMask = 24;
  let nodeIp = '10.101.3.42', nodeMask = 24;

  const { controls, stage, setNote, challenge } = figure(host, {
    title: 'One question decides whether two devices can talk',
    sub: 'The mask says which part of the address is the neighbourhood. Both have to match.',
    note: '',
  });

  const toInt = (ip) => ip.split('.').reduce((a, o) => a * 256 + Number(o), 0) >>> 0;
  const netOf = (ip, m) => (toInt(ip) & (m === 0 ? 0 : (0xFFFFFFFF << (32 - m)) >>> 0)) >>> 0;
  const toIp = (n) => [24, 16, 8, 0].map((s) => (n >>> s) & 255).join('.');
  const canTalk = () => netOf(consoleIp, consoleMask) === netOf(nodeIp, nodeMask) && consoleMask === nodeMask;

  const upd = () => {
    setNote(canTalk()
      ? `Both are on ${toIp(netOf(consoleIp, consoleMask))}/${consoleMask}, so the neighbourhood parts match and they can reach each other directly. <b>That is the whole test, and it takes ten seconds to apply if you read both addresses rather than assuming them.</b>`
      : `The console is on ${toIp(netOf(consoleIp, consoleMask))}/${consoleMask} and the node is on ${toIp(netOf(nodeIp, nodeMask))}/${nodeMask}. Different neighbourhoods, so nothing passes between them. <b>Both devices report themselves as perfectly healthy, which is exactly why this fault wastes more time than any other on a network rig.</b>`);
    cv.once();
  };

  controls.append(choice('Console', [
    ['10.101.3.10|24', '10.101.3.10 /24'], ['2.0.0.1|8', '2.0.0.1 /8'], ['192.168.1.10|24', '192.168.1.10 /24'],
  ], { value: '10.101.3.10|24', on: (v) => { const [a, m] = v.split('|'); consoleIp = a; consoleMask = +m; upd(); } }).node);
  controls.append(choice('Node', [
    ['10.101.3.42|24', '10.101.3.42 /24'], ['2.0.0.5|8', '2.0.0.5 /8 (Art-Net default)'], ['10.101.9.42|24', '10.101.9.42 /24'],
  ], { value: '10.101.3.42|24', on: (v) => { const [a, m] = v.split('|'); nodeIp = a; nodeMask = +m; upd(); } }).node);

  challenge('Find the pairing where both devices look healthy and no data passes.', () => !canTalk());

  const cv = canvas(stage, {
    height: 260,
    draw(g, w, h, t) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const ok = canTalk();
      const boxW = Math.min(180, (w - pad * 2 - 40) / 2);
      const cy = 62;

      const drawBox = (x, title, ip, mask, netCol) => {
        box(g, x, cy - 34, boxW, 78, { fill: p.raised, stroke: p.line, r: 7 });
        label(g, title, x + boxW / 2, cy - 20, { color: p.muted, size: 9.5, align: 'center' });
        // The address, split into the part the mask covers and the part it does not.
        const octets = ip.split('.');
        const covered = Math.floor(mask / 8);
        let tx = x + 12;
        octets.forEach((o, k) => {
          const inNet = k < covered;
          label(g, o + (k < 3 ? '.' : ''), tx, cy + 2, {
            color: inNet ? netCol : p.ink2, size: 14, weight: inNet ? 700 : 500, mono: true,
          });
          tx += textWidth(g, o + '.', { size: 14, weight: 700, mono: true });
        });
        label(g, `/${mask}`, x + boxW - 12, cy + 2, { color: p.muted, size: 12, align: 'right', mono: true });
        label(g, `neighbourhood ${toIp(netOf(ip, mask))}`, x + boxW / 2, cy + 26, {
          color: netCol, size: 9.5, align: 'center', max: boxW - 12,
        });
        label(g, 'link light on · looks healthy', x + boxW / 2, cy + 54, {
          color: R.safe, size: 9, align: 'center', max: boxW,
        });
      };

      const netA = toIp(netOf(consoleIp, consoleMask));
      const netB = toIp(netOf(nodeIp, nodeMask));
      drawBox(pad, 'console', consoleIp, consoleMask, ok ? R.safe : R.energy);
      drawBox(w - pad - boxW, 'node', nodeIp, nodeMask, ok ? R.safe : R.fault);

      // The path between them.
      const ax = pad + boxW, bx = w - pad - boxW;
      line(g, ax, cy, bx, cy, { color: ok ? R.signal : alpha(p.muted, 0.4), lw: 2, dash: ok ? null : [5, 4] });
      if (ok) {
        for (let k = 0; k < 4; k++) {
          const u = ((t * 0.8 + k / 4) % 1);
          g.fillStyle = R.signal;
          g.beginPath(); g.arc(ax + u * (bx - ax), cy, 3, 0, Math.PI * 2); g.fill();
        }
      } else {
        label(g, '✕', (ax + bx) / 2, cy, { color: R.fault, size: 18, align: 'center', weight: 700 });
      }

      const vy = 132;
      box(g, pad, vy, w - pad * 2, 34, {
        fill: alpha(ok ? R.safe : R.fault, 0.1), stroke: alpha(ok ? R.safe : R.fault, 0.45), r: 7,
      });
      label(g, ok
        ? `Same neighbourhood: ${netA}. Data passes.`
        : `${netA} against ${netB}. Nothing passes, and nothing reports an error.`,
      pad + 12, vy + 17, {
        color: ok ? R.safe : R.fault, size: 12, weight: 700, max: w - pad * 2 - 24,
      });

      const ty = vy + 52;
      label(g, 'Art-Net grew up on 2.x.x.x with a /8 mask and much equipment still defaults there. sACN uses whatever the venue uses.',
        pad, ty, { color: p.ink2, size: 11, max: w - pad * 2 });
      label(g, 'A rig with both on it needs a deliberate decision rather than two sets of defaults.',
        pad, ty + 20, { color: p.muted, size: 10.5, max: w - pad * 2 });
    },
  });
  upd();
});

register('rdm-discovery', (host) => chain(host, {
  title: 'The return path DMX never had',
  sub: 'The controller stops transmitting briefly, asks a question, and listens in the gap.',
  tag: 'Step', accent: 'signal',
  stages: [
    {
      name: 'Stop and ask',
      body: 'The controller pauses DMX transmission and sends a discovery request down the same pair, with a start code that says “this is not dimmer data”.',
      why: 'DMX was designed as a monologue. The only way to add a reply is to leave a gap in it, which is why RDM shares the line’s time budget rather than adding to it.',
      note: 'Discovery is chatty. <b>Run it during the rig check, not during the performance, or it steals slots from the DMX that is running the show.</b>',
    },
    {
      name: 'Everything answers at once',
      body: 'Every device hears the request. The controller narrows by asking about ranges of unique IDs, halving the search each time until each device is alone.',
      why: 'This is a binary search, which is the same half-splitting idea as the fault-finding method, implemented in silicon.',
    },
    {
      name: 'The reply has to get back',
      body: 'The responding device transmits, briefly, in the opposite direction on the same pair. Every splitter, buffer and isolator in the path has to be willing to turn around.',
      why: 'A non-RDM splitter passes DMX perfectly and blocks the return silently. The fixtures work, none of them are discoverable, and the symptom points at the fixtures.',
      note: 'This is the fault-finding misery of RDM. <b>The cause is a box in the middle and the symptom is at the ends, which is precisely the case the boundary question is for.</b>',
    },
    {
      name: 'Now you can ask it things',
      body: 'Set its address and personality from the desk. Read its lamp hours, temperature and fan status. Make one fixture identify itself so you can find it.',
      why: 'Setting an address from the desk rather than on a ladder is the feature that pays for the whole standard on a large rig.',
      note: 'Support is partial across manufacturers, because the standard is large. <b>A fixture that discovers but will not accept an address change is behaving badly rather than being broken, and knowing that saves an hour.</b>',
    },
  ],
  footer: 'RDM turns "everything you know about the rig, you know because you sent it" into a conversation. It is the single largest change to DMX since it was written.',
}));

// ---------------------------------------------------------------------------
// Class 10: the boundary, and the drawing
// ---------------------------------------------------------------------------

register('boundary', (host) => chain(host, {
  title: 'The five questions that eliminate most of the rig',
  sub: 'Before touching anything. They cost fifteen seconds and no tools.',
  tag: 'Question', accent: 'safe',
  stages: [
    {
      name: 'How much is affected?',
      body: 'One fixture, one run, one universe, or everything? Write the answer down.',
      why: 'This single question eliminates three quarters of the rig in one pass, and it is the one people skip when they are in a hurry.',
      note: 'The fault is on the line between what works and what does not. <b>Everything else in this method is about finding that line faster.</b>',
    },
    {
      name: 'Does the boundary follow the cable, or the patch?',
      body: 'If the affected fixtures are consecutive along a run, it is wiring. If they are consecutive in the patch, it is addressing.',
      why: 'Those two are different halves of the rig and different toolkits. Answering this before you move decides which one you spend the next ten minutes in.',
    },
    {
      name: 'Does anything downstream work?',
      body: 'If the fixtures after the suspect point respond, the signal is arriving there. If nothing after it responds, it is not.',
      why: 'It turns a rig into a line with a break in it, and a line with a break in it can be half-split.',
    },
    {
      name: 'Did it ever work, and what changed?',
      body: 'Since the last time it was right, what was touched? A cable added, a fixture swapped, a console update, a different patch.',
      why: 'Everything that has not been touched is unlikely, and "we added twenty metres at the far end" is usually the whole answer.',
    },
    {
      name: 'Does it correlate with another department?',
      body: 'Does it happen when the dimmers come up, when the smoke machine fires, when the moving lights home?',
      why: 'Screening, shared supplies and dimmer harmonics all produce faults that are dormant until somebody else does something.',
      note: '“It only happens during the ballroom scene” is not a complaint, it is a measurement. <b>Nobody asks this question, and it is how fault 6 gets found.</b>',
    },
  ],
  footer: 'Write the boundary down before you move. It stops the thing that actually wastes the evening: forgetting what you already excluded, and testing it again.',
}));

register('rig-doc', (host) => compare(host, {
  title: 'What a signal flow drawing has to carry',
  sub: 'A lighting plan says where fixtures hang. This says how data reaches them, and it is the one that matters at 22:00.',
  fields: [
    { label: 'What it records', key: 'what' },
    { label: 'The fault it finds in ninety seconds', key: 'finds', tone: 'safe' },
  ],
  items: [
    { name: 'Address and universe, per fixture', short: 'Address', tone: 'signal',
      line: 'Every device, its start address, its universe, and how many channels it occupies.',
      what: 'Fixture 3 on run 2, universe 1, address 33, 16 channels, so 33 to 48',
      finds: 'Address collisions, off-by-one patching, and a footprint running past 512' },
    { name: 'Cable lengths and labels', short: 'Cables', tone: 'signal',
      line: 'Each cable, with its length and the label physically on it at both ends.',
      what: 'DMX-07, 20 m, splitter output 2 to fixture 4',
      finds: 'The run that is now too long, and which cable to pull without tracing it' },
    { name: 'Where the terminators are', short: 'Terminators', tone: 'energy',
      line: 'Marked at the end of every run, as part of the run’s definition.',
      what: 'A symbol at the last device on each branch',
      finds: 'The terminator removed when somebody extended the run, which is fault 1' },
    { name: 'Where the isolation barriers are', short: 'Isolation', tone: 'safe',
      line: 'Which splitters are isolated, and therefore which faults can travel.',
      what: 'Splitter A: optically isolated, four outputs',
      finds: 'Why a fault on one branch took out three others' },
    { name: 'Which device is last on each run', short: 'Ends', tone: 'signal',
      line: 'Because that is where the terminator goes and where you scope.',
      what: 'Run 2 ends at fixture 6',
      finds: 'Everything about reflections, and where to put the probe' },
    { name: 'It matches reality', short: 'Correct', tone: 'fault',
      line: 'The drawing you made before the build is a plan. The one you corrected after walking the rig is a drawing.',
      what: 'Corrections made in pen, on the day, by whoever walked it',
      finds: 'Nothing, if it is wrong. A drawing that disagrees with the rig is worse than none',
      watch: 'A team with a correct drawing finds a wrong-universe fault in ninety seconds. A team without one starts unplugging things, and a team with an incorrect one confidently tests the wrong half of the rig.' },
  ],
  footer: 'The test of the drawing and the labelling together: could somebody who has never seen this rig find the third fixture on run two, in the dark, in ninety seconds?',
}));
