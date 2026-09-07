// Classes 11 and 12: a chip that does one thing forever, and firmware for the
// eightieth performance rather than the first.

import { register } from './anim-core.js';
import {
  figure, canvas, slider, toggle, choice, label, labelWrap, box, line, palette,
  alpha, fitter, compare, chain, role, eng, sig,
  arrow, resistorSym, groundSym, readoutChip,
} from './anim-kit.js';

// ---------------------------------------------------------------------------
// What is inside
// ---------------------------------------------------------------------------

register('mcu-anatomy', (host) => compare(host, {
  title: 'Inside one chip',
  sub: 'Not a computer. A computer schedules many tasks and has an indeterminate response time; this does one thing, forever.',
  fields: [
    { label: 'What it is', key: 'what' },
    { label: 'Why it matters to you', key: 'why', tone: 'signal' },
    { label: 'Typical', key: 'typ' },
  ],
  items: [
    {
      name: 'CPU', short: 'CPU', tone: 'signal',
      line: 'Executes instructions, one after another, from power-on until power-off.',
      what: 'A few million to a few hundred million instructions per second',
      why: 'When you tell it to check a switch every millisecond, it checks the switch every millisecond, and nothing decides a software update is more important',
      typ: 'ATmega328 at 16 MHz, ESP32 at 240 MHz, RP2040 at 133 MHz',
      note: 'This determinism is the whole reason it is the right thing for show hardware. <b>A general-purpose computer cannot promise you a millisecond, and a show prop needs that promise.</b>',
    },
    {
      name: 'Flash and RAM', short: 'Memory', tone: 'safe',
      line: 'Flash holds the program and survives power loss. RAM holds variables and does not.',
      what: 'Flash: your firmware. RAM: everything the program is currently thinking about',
      why: 'Anything the prop must remember across a power cut has to be written to flash or EEPROM deliberately, and writing on every loop wears it out',
      typ: '32 kB flash and 2 kB RAM on an ATmega328; megabytes on an ESP32',
    },
    {
      name: 'GPIO pins', short: 'GPIO', tone: 'energy',
      line: 'Each pin can be an output, an input, or an input that is floating and therefore undefined.',
      what: 'A pin driven to the supply or to ground, or read against a threshold',
      why: 'About 20 mA per pin and less across the whole chip. This is why nothing inductive or heavy is ever connected directly',
      typ: '20 mA per pin, and a total chip limit lower than the sum of the pins',
      watch: 'A microcontroller never drives a relay, a motor or a metre of LED tape directly. That is what the board from Class 6 is for.',
    },
    {
      name: 'ADC', short: 'ADC', tone: 'signal',
      line: 'Compares an input voltage against a reference and reports a number.',
      what: '10 or 12 bits, so 0–1023 or 0–4095',
      why: 'Its accuracy is limited by the reference, not by the bit count. A reference that sags when the motor starts changes every reading while nothing physical has changed',
      typ: '10-bit, 4.9 mV per step on a 5 V reference',
    },
    {
      name: 'Timers', short: 'Timers', tone: 'safe',
      line: 'Counters that run independently of your program.',
      what: 'Hardware counters, which is what makes PWM possible without the CPU doing the work',
      why: 'PWM, precise intervals and input capture all come from here, and none of them stops when your code is busy',
      typ: 'Two or three per chip, 8 or 16 bit',
    },
    {
      name: 'Serial peripherals', short: 'Serial', tone: 'signal',
      line: 'UART, I²C and SPI, for talking to other chips and to the outside world.',
      what: 'Hardware that shifts bits in and out at an agreed rate',
      why: 'DMX arrives on a UART at 250 kbit/s through an RS-485 receiver. Sensors usually arrive on I²C',
      typ: 'One or two UARTs, one I²C, one SPI',
    },
  ],
  footer: 'The chip matters less than the pattern. Different speeds and peripheral counts, the same ideas.',
}));

// ---------------------------------------------------------------------------
// The floating input
// ---------------------------------------------------------------------------

register('gpio', (host) => {
  let arrangement = 'float';

  const ARR = {
    float: ['Floating input', 'Nothing is driving the pin. It is a tiny capacitance with no path anywhere, picking up interference from the air, from adjacent pins, from your hand near the board.'],
    pullup: ['Pull-up, switch to ground', 'A 10 kΩ resistor to the supply. Idle reads high; the switch pulls it low. The standard arrangement, and a cut cable reads as not pressed.'],
    pulldown: ['Pull-down, switch to supply', 'A 10 kΩ resistor to ground. Idle reads low; the switch pulls it high. A cut cable also reads as not pressed.'],
  };

  const { controls, stage, setNote, challenge } = figure(host, {
    title: 'The button that presses itself',
    sub: 'A bare input pin, read a thousand times a second. Then define its idle state.',
    note: '',
  });

  const upd = () => {
    setNote(arrangement === 'float'
      ? 'The reading changes as you move. It is not noise in the reading, it is the pin genuinely being at whatever voltage the surrounding field puts on it. <b>A floating input is not off, it is undefined, and it produces a symptom that looks like a software bug or a haunting.</b>'
      : arrangement === 'pullup'
        ? 'A 10 kΩ pull-up defines the idle state as high, and the switch pulls it low. Most microcontrollers have internal pull-ups you can enable in software, and a switch to ground is easier to wire and less susceptible to noise on a long run. <b>The consequence is that pressed reads low, which inverts the logic in your code and catches everybody once.</b>'
        : 'A pull-down defines the idle state as low, and the switch pulls it high. Both arrangements are correct; what matters is that one exists. <b>In show hardware, prefer the scheme where the safe state is the de-energised one, so a cut cable reads as not pressed.</b>');
    cv.once();
  };

  controls.append(choice('Arrangement', Object.entries(ARR).map(([k, v]) => [k, v[0]]), {
    value: 'float', on: (v) => { arrangement = v; upd(); },
  }).node);

  challenge('Give the pin a defined state when nothing is connected.', () => arrangement !== 'float');

  const cv = canvas(stage, {
    height: 260,
    draw(g, w, h, t) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const px = pad + 130, py = 62;

      box(g, pad + 150, py - 34, 70, 68, { fill: p.raised, stroke: p.line, r: 6 });
      label(g, 'MCU', pad + 185, py, { color: p.ink2, size: 11, align: 'center', weight: 600 });
      line(g, px, py, pad + 150, py, { color: R.signal, lw: 2 });
      g.fillStyle = R.signal;
      g.beginPath();
      g.arc(pad + 150, py, 4, 0, Math.PI * 2);
      g.fill();
      label(g, 'input pin', pad + 150, py - 16, { color: p.muted, size: 9.5, align: 'center' });

      // The defining resistor, when there is one.
      if (arrangement !== 'float') {
        const up = arrangement === 'pullup';
        const ry = up ? py - 44 : py + 44;
        line(g, px, py, px, ry, { color: p.muted, lw: 1.5 });
        g.save();
        g.translate(px, ry + (up ? -14 : 14));
        g.rotate(Math.PI / 2);
        resistorSym(g, -12, 0, 24, 11, R.safe, 2);
        g.restore();
        if (up) {
          line(g, px, ry - 28, px, ry - 36, { color: R.energy, lw: 2 });
          label(g, '+5 V', px, ry - 44, { color: R.energy, size: 9.5, align: 'center' });
        } else {
          groundSym(g, px, ry + 28, p.muted);
        }
        label(g, '10 kΩ', px + 14, ry + (up ? -14 : 14), { color: R.safe, size: 9.5 });
      }

      // The switch.
      const sx = px - 70;
      line(g, sx, py, px, py, { color: p.muted, lw: 1.5 });
      const pressed = Math.sin(t * 0.9) > 0.75;
      line(g, sx - 22, py, sx - 4, py - (pressed ? 0 : 10), { color: p.ink2, lw: 2.5 });
      g.fillStyle = p.muted;
      g.beginPath(); g.arc(sx - 22, py, 3, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.arc(sx - 2, py, 3, 0, Math.PI * 2); g.fill();
      label(g, pressed ? 'pressed' : 'released', sx - 12, py + 22, {
        color: pressed ? R.signal : p.muted, size: 9.5, align: 'center',
      });
      if (arrangement === 'pullup') {
        groundSym(g, sx - 30, py + 4, p.muted);
        line(g, sx - 22, py, sx - 30, py, { color: p.muted, lw: 1.5 });
      } else if (arrangement === 'pulldown') {
        line(g, sx - 22, py, sx - 34, py, { color: R.energy, lw: 1.5 });
        label(g, '+5 V', sx - 40, py, { color: R.energy, size: 9.5, align: 'right' });
      } else {
        label(g, 'nothing', sx - 30, py, { color: p.muted, size: 9.5, align: 'right' });
      }

      // What the program reads, over time.
      const oy = 132, oh = 62;
      box(g, pad, oy, w - pad * 2, oh, { fill: alpha(p.ground, 0.5), stroke: p.line, r: 6 });
      const hi = oy + 12, lo = oy + oh - 12;
      g.strokeStyle = arrangement === 'float' ? R.fault : R.safe;
      g.lineWidth = 2;
      g.beginPath();
      for (let k = 0; k <= 260; k++) {
        const u = k / 260;
        const tt = t - (1 - u) * 4;
        let v;
        if (arrangement === 'float') {
          // Genuinely undefined: it wanders and flips.
          v = (Math.sin(tt * 5.3) + Math.sin(tt * 11.7) * 0.7 + Math.sin(tt * 2.1) * 0.5) > 0.2 ? 1 : 0;
        } else {
          const pr = Math.sin(tt * 0.9) > 0.75;
          v = arrangement === 'pullup' ? (pr ? 0 : 1) : (pr ? 1 : 0);
        }
        const x = pad + 6 + u * (w - pad * 2 - 12);
        const y = v ? hi : lo;
        k ? (g.lineTo(x, y)) : g.moveTo(x, y);
      }
      g.stroke();
      label(g, arrangement === 'float' ? 'digitalRead(): random, and it changes when you move'
        : `digitalRead(): ${arrangement === 'pullup' ? 'HIGH idle, LOW when pressed' : 'LOW idle, HIGH when pressed'}`,
      pad + 10, oy + 12, {
        color: arrangement === 'float' ? R.fault : R.safe, size: 10.5, weight: 600, max: w - pad * 2 - 20,
      });

      const cy = oy + oh + 20;
      const cut = arrangement === 'float' ? 'undefined' : 'reads as not pressed';
      label(g, `If the cable to the switch is cut:  ${cut}`, pad, cy, {
        color: arrangement === 'float' ? R.fault : R.safe, size: 11.5, weight: 600, max: w - pad * 2,
      });
      label(g, 'In show hardware, prefer the scheme where the safe state is the de-energised one.', pad, cy + 20, {
        color: p.muted, size: 10.5, max: w - pad * 2,
      });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// delay() against millis()
// ---------------------------------------------------------------------------

register('mcu-loop', (host) => {
  let blocking = true;
  let delayMs = 1000;
  let pressT = -10;
  let respondedAt = null;

  const { controls, stage, setNote, challenge } = figure(host, {
    title: 'What delay() actually does to the chip',
    sub: 'Press the button at a random moment and measure how long it takes to be noticed.',
    note: '',
  });

  const upd = () => {
    setNote(blocking
      ? `delay(${delayMs}) does not schedule anything. It sits in a tight loop counting while the processor does nothing else at all: no buttons read, no DMX received, no emergency stop noticed. <b>The operator's experience is "the button did not work sometimes", and up to ${delayMs} ms of complete deafness is the reason.</b>`
      : 'Checking the clock and deciding takes microseconds, so the loop runs thousands of times a second and everything is checked on every pass. <b>That is the difference between a prototype and a device that can be put on a stage.</b>');
    respondedAt = null;
    cv.once();
  };

  controls.append(choice('Pattern', [['d', 'delay()'], ['m', 'millis()']], {
    value: 'd', on: (v) => { blocking = v === 'd'; upd(); },
  }).node);
  controls.append(slider('Blink interval', {
    min: 100, max: 2000, step: 100, value: 1000, fmt: (v) => `${v} ms`,
    on: (v) => { delayMs = v; upd(); },
  }).node);
  const b = document.createElement('button');
  b.className = 'ac ac-btn';
  b.textContent = 'Press the button';
  b.addEventListener('click', () => { pressT = cv.t; respondedAt = null; });
  controls.append(b);

  challenge('Get the response time under 10 ms.', () => !blocking);

  const cv = canvas(stage, {
    height: 270,
    draw(g, w, h, t) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const cycle = (delayMs / 1000);
      const since = t - pressT;

      // Where in its cycle the chip is, and whether it is listening.
      const phase = (t % (cycle * 2)) / (cycle * 2);
      const listening = blocking ? (phase % 0.5) < 0.02 : true;
      if (since >= 0 && respondedAt === null) {
        if (blocking) {
          // It responds at the next moment the loop comes round.
          const nextCheck = Math.ceil((pressT) / cycle) * cycle;
          if (t >= nextCheck) respondedAt = nextCheck - pressT;
        } else {
          respondedAt = 0.0008;
        }
      }

      // The loop, drawn as a ring the execution point travels round.
      const cxx = pad + 74, cyy = 72, rr = 44;
      g.strokeStyle = p.line;
      g.lineWidth = 10;
      g.beginPath();
      g.arc(cxx, cyy, rr, 0, Math.PI * 2);
      g.stroke();
      // The part of the ring spent blocked.
      if (blocking) {
        g.strokeStyle = alpha(R.fault, 0.6);
        g.lineWidth = 10;
        g.beginPath();
        g.arc(cxx, cyy, rr, -Math.PI / 2 + 0.14, -Math.PI / 2 + Math.PI * 2 - 0.14);
        g.stroke();
      } else {
        g.strokeStyle = alpha(R.safe, 0.5);
        g.lineWidth = 10;
        g.beginPath();
        g.arc(cxx, cyy, rr, 0, Math.PI * 2);
        g.stroke();
      }
      const a = -Math.PI / 2 + (blocking ? phase : (t * 6) % 1) * Math.PI * 2;
      g.fillStyle = p.ink;
      g.beginPath();
      g.arc(cxx + Math.cos(a) * rr, cyy + Math.sin(a) * rr, 6, 0, Math.PI * 2);
      g.fill();
      label(g, blocking ? 'blocked' : 'running', cxx, cyy - 6, {
        color: blocking ? R.fault : R.safe, size: 11, align: 'center', weight: 700,
      });
      label(g, blocking ? 'in delay()' : 'checking everything', cxx, cyy + 10, {
        color: p.muted, size: 9, align: 'center', max: rr * 2,
      });

      // The code.
      const codeX = pad + 150;
      const lines = blocking
        ? ['void loop() {', '  digitalWrite(LED, HIGH);', `  delay(${delayMs});      // deaf`, '  digitalWrite(LED, LOW);', `  delay(${delayMs});      // deaf`, '}']
        : ['void loop() {', '  unsigned long now = millis();', '  if (now - last >= INTERVAL) {', '    last = now; toggle();', '  }', '  readButtons();   // every pass', '  checkSafety();   // every pass', '}'];
      lines.forEach((ln, k) => label(g, ln, codeX, 26 + k * 15, {
        color: /deaf/.test(ln) ? R.fault : /every pass/.test(ln) ? R.safe : p.ink2,
        size: 10.5, mono: true, max: w - codeX - pad,
      }));

      // The measurement.
      const my = 160;
      box(g, pad, my, w - pad * 2, 46, {
        fill: alpha(respondedAt === null ? p.muted : respondedAt > 0.05 ? R.fault : R.safe, 0.1),
        stroke: alpha(respondedAt === null ? p.muted : respondedAt > 0.05 ? R.fault : R.safe, 0.4), r: 7,
      });
      label(g, 'Time from press to noticed', pad + 12, my + 16, { color: p.muted, size: 10 });
      label(g, respondedAt === null ? (since >= 0 ? 'waiting…' : 'press the button')
        : respondedAt < 0.002 ? 'under 1 ms' : `${Math.round(respondedAt * 1000)} ms`,
      pad + 12, my + 34, {
        color: respondedAt === null ? p.muted : respondedAt > 0.05 ? R.fault : R.safe,
        size: 15, weight: 700, mono: true, max: w - pad * 2 - 24,
      });

      label(g, 'Note the subtraction: now − last >= INTERVAL, never now >= last + INTERVAL. The counter wraps after about 49 days and only the subtraction survives it.',
        pad, my + 66, { color: p.muted, size: 10.5, max: w - pad * 2 });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// The ADC
// ---------------------------------------------------------------------------

register('adc-sample', (host) => {
  let bits = 10;
  let vref = 5;
  let vin = 2.5;
  let refSag = false;

  const { controls, stage, setNote, challenge } = figure(host, {
    title: 'Resolution is not accuracy',
    sub: 'A 12-bit reading against a reference that sags is a very precise measurement of the wrong thing.',
    note: '',
  });

  const effRef = () => (refSag ? vref * 0.94 : vref);
  const steps = () => 2 ** bits;
  const count = () => Math.min(steps() - 1, Math.round((vin / effRef()) * (steps() - 1)));
  const stepV = () => effRef() / steps();

  const upd = () => {
    setNote(refSag
      ? `The reference has sagged six per cent because the motor started. The input has not changed at all, and the reading has moved from ${Math.round((vin / vref) * (steps() - 1))} to ${count()}. <b>Reference stability dominates long before bit depth does, and this is a real and common fault in home-built sensor systems.</b>`
      : `${bits} bits gives ${steps()} steps, so each one is ${eng(stepV(), 'V')}. Nothing finer than that exists to the chip. <b>Asking for more precision than the hardware has is a common source of imaginary problems, and averaging sixteen readings costs nothing and gives a visibly steadier number.</b>`);
    cv.once();
  };

  controls.append(choice('Resolution', [[8, '8-bit'], [10, '10-bit'], [12, '12-bit']], {
    value: 10, on: (v) => { bits = +v; upd(); },
  }).node);
  controls.append(slider('Input voltage', {
    min: 0, max: 5, step: 0.01, value: 2.5, fmt: (v) => `${v.toFixed(2)} V`,
    on: (v) => { vin = v; upd(); },
  }).node);
  controls.append(toggle('Reference sags (motor starts)', { value: false, on: (v) => { refSag = v; upd(); } }).node);

  challenge('Change the reading without changing the input at all.', () => refSag);

  const cv = canvas(stage, {
    height: 260, animated: false,
    draw(g, w) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const gL = pad + 26, gT = 24, gW = w - gL - pad - 100, gH = 110;

      // The staircase: the actual quantisation, at a visible number of steps.
      const shown = Math.min(steps(), 40);
      line(g, gL, gT + gH, gL + gW, gT + gH, { color: p.muted, lw: 1.5 });
      line(g, gL, gT, gL, gT + gH, { color: p.muted, lw: 1.5 });
      g.strokeStyle = alpha(R.signal, 0.9);
      g.lineWidth = 2;
      g.beginPath();
      for (let k = 0; k < shown; k++) {
        const x0 = gL + (k / shown) * gW;
        const x1 = gL + ((k + 1) / shown) * gW;
        const y = gT + gH - (k / shown) * gH;
        g.moveTo(x0, y); g.lineTo(x1, y);
        if (k < shown - 1) { g.moveTo(x1, y); g.lineTo(x1, gT + gH - ((k + 1) / shown) * gH); }
      }
      g.stroke();
      g.strokeStyle = alpha(p.muted, 0.6);
      g.setLineDash([4, 4]);
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(gL, gT + gH); g.lineTo(gL + gW, gT);
      g.stroke();
      g.setLineDash([]);
      label(g, 'the real voltage', gL + gW - 6, gT + 8, { color: p.muted, size: 9.5, align: 'right' });
      label(g, 'what the chip can report', gL + 6, gT + gH - 8, { color: R.signal, size: 9.5 });

      const frac = Math.min(1, vin / effRef());
      const cx = gL + frac * gW;
      line(g, cx, gT, cx, gT + gH, { color: alpha(R.energy, 0.7), lw: 1.5, dash: [3, 3] });
      const cy2 = gT + gH - (Math.floor(frac * shown) / shown) * gH;
      g.fillStyle = R.energy;
      g.beginPath();
      g.arc(cx, cy2, 4.5, 0, Math.PI * 2);
      g.fill();
      label(g, `${vin.toFixed(2)} V`, gL, gT - 8, { color: p.muted, size: 9.5 });
      label(g, `ref ${effRef().toFixed(2)} V`, gL + gW, gT - 8, {
        color: refSag ? R.fault : p.muted, size: 9.5, align: 'right', weight: refSag ? 700 : 500,
      });

      const rx = w - pad - 92;
      readoutChip(g, rx, gT, 'READING', String(count()), { color: refSag ? R.fault : R.safe, p, w: 92 });
      readoutChip(g, rx, gT + 42, 'STEP SIZE', eng(stepV(), 'V'), { color: p.ink, p, w: 92 });
      readoutChip(g, rx, gT + 84, 'RANGE', `0–${steps() - 1}`, { color: p.ink, p, w: 92 });

      const wy = gT + gH + 30;
      label(g, `${bits} bits → ${steps()} steps → ${eng(stepV(), 'V')} per step`, pad, wy, {
        color: p.ink2, size: 11.5, mono: true, max: w - pad * 2,
      });
      label(g, `reading = round(${vin.toFixed(2)} ÷ ${effRef().toFixed(2)} × ${steps() - 1}) = ${count()}`, pad, wy + 18, {
        color: p.muted, size: 11, mono: true, max: w - pad * 2,
      });
      label(g, 'Keep the source under about 10 kΩ, or the ADC does not finish charging its sampling capacitor and reads low.',
        pad, wy + 40, { color: p.muted, size: 10.5, max: w - pad * 2 });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// PWM
// ---------------------------------------------------------------------------

register('pwm-duty', (host) => {
  let duty = 50;
  let freq = 500;
  let curve = false;

  const { controls, stage, setNote, challenge } = figure(host, {
    title: 'Duty cycle, frequency, and the brightness that is not linear',
    sub: 'Choosing the frequency badly produces three specific, recognisable problems.',
    note: '',
  });

  const perceived = () => (curve ? (duty / 100) ** (1 / 2.2) : duty / 100);

  const upd = () => {
    const problems = [];
    if (freq < 100) problems.push('visible flicker, especially in peripheral vision and on camera');
    else if (freq < 20000) problems.push('audible whine from motors and inductors');
    setNote(problems.length
      ? `At ${eng(freq, 'Hz')}: ${problems[0]}. <b>For a show being filmed the constraint that actually decides it is the camera, which sees what your eye does not, so professional fixtures advertise high PWM frequencies.</b>`
      : `At ${eng(freq, 'Hz')} it is above hearing and above any camera shutter. <b>Switching losses rise with frequency and gate drive matters more, so above 20 kHz is a choice with a cost rather than a free win.</b>`);
    cv.once();
  };

  controls.append(slider('Duty cycle', {
    min: 0, max: 100, step: 1, value: 50, fmt: (v) => `${v}%`,
    on: (v) => { duty = v; upd(); },
  }).node);
  controls.append(slider('Frequency', {
    min: 0, max: 30, step: 1, value: 14, fmt: (k) => eng(10 ** (1 + k / 10), 'Hz'),
    on: (k) => { freq = 10 ** (1 + k / 10); upd(); },
  }).node);
  freq = 10 ** (1 + 14 / 10);
  controls.append(toggle('Apply a dimming curve', { value: false, on: (v) => { curve = v; upd(); } }).node);

  challenge('Find a frequency that is neither visible nor audible.', () => freq >= 20000);

  const cv = canvas(stage, {
    height: 270,
    draw(g, w, h, t) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const gL = pad, gT = 22, gW = w - pad * 2 - 96, gH = 62;

      box(g, gL, gT, gW, gH, { fill: alpha(p.ground, 0.5), stroke: p.line, r: 6 });
      const hi = gT + 10, lo = gT + gH - 10;
      g.strokeStyle = R.energy;
      g.lineWidth = 2.2;
      g.beginPath();
      const cycles = 6;
      for (let k = 0; k <= 400; k++) {
        const u = (k / 400) * cycles;
        const ph = u % 1;
        const y = ph < duty / 100 ? hi : lo;
        const x = gL + (k / 400) * gW;
        k ? g.lineTo(x, y) : g.moveTo(x, y);
      }
      g.stroke();
      label(g, `${duty}% duty · ${eng(freq, 'Hz')} · period ${eng(1 / freq, 's')}`, gL + 6, gT + 12, {
        color: p.muted, size: 10, mono: true, max: gW - 12,
      });

      // The lamp, flickering when the frequency is low enough to see.
      const lx = w - pad - 76;
      const flicker = freq < 100 ? (((t * freq) % 1) < duty / 100 ? 1 : 0) : perceived();
      const b = freq < 100 ? flicker : perceived();
      g.fillStyle = alpha(R.energy, 0.1 + b * 0.7);
      g.beginPath();
      g.arc(lx + 34, gT + 34, 20 + b * 16, 0, Math.PI * 2);
      g.fill();
      box(g, lx, gT + 14, 68, 40, { fill: alpha(R.energy, 0.12 + b * 0.5), stroke: p.line, r: 6 });
      label(g, 'lamp', lx + 34, gT + 34, { color: p.ground, size: 10, align: 'center', weight: 700 });

      // The frequency bands.
      const bT = gT + gH + 34, bH = 22;
      const bL = pad, bW = w - pad * 2;
      const X = (hz) => bL + ((Math.log10(hz) - 1) / 4) * bW;
      const BANDS = [
        [10, 100, 'visible flicker', R.fault],
        [100, 20000, 'audible whine', R.energy],
        [20000, 1e5, 'inaudible, higher switching loss', R.safe],
      ];
      BANDS.forEach(([a, z, n, col]) => {
        g.fillStyle = alpha(col, 0.22);
        g.fillRect(X(a), bT, X(z) - X(a), bH);
        if (X(z) - X(a) > 60) {
          label(g, n, (X(a) + X(z)) / 2, bT + bH / 2, {
            color: col, size: 9.5, align: 'center', max: X(z) - X(a) - 6,
          });
        }
      });
      box(g, bL, bT, bW, bH, { fill: 'transparent', stroke: p.line, r: 4 });
      const fx = X(freq);
      line(g, fx, bT - 8, fx, bT + bH + 4, { color: p.ink, lw: 2 });
      label(g, eng(freq, 'Hz'), fx, bT - 14, { color: p.ink, size: 10, align: 'center', weight: 700 });

      // The curve.
      const cy = bT + bH + 28;
      label(g, `Duty ${duty}%  →  perceived brightness about ${Math.round(perceived() * 100)}%`, pad, cy, {
        color: p.ink2, size: 11.5, mono: true, max: bW,
      });
      label(g, curve
        ? 'A dimming curve maps the fader to perceived brightness, so a fade looks even.'
        : 'Without a curve, a linear fade rushes the top and crawls at the bottom, because perception is roughly logarithmic.',
      pad, cy + 20, { color: p.muted, size: 10.5, max: bW });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// Switch bounce
// ---------------------------------------------------------------------------

register('debounce', (host) => {
  let debounceMs = 0;
  let pressT = -10;
  let counted = 0;

  const { controls, stage, setNote, challenge } = figure(host, {
    title: 'Bounce, on a scope, and what the counter counts',
    sub: 'A mechanical switch does not close once. Press it and count the transitions.',
    note: '',
  });

  // A plausible bounce pattern: several closures over about 8 ms.
  const EDGES = [0, 0.9, 1.6, 2.9, 3.4, 5.1, 5.6, 7.8];

  const press = () => {
    pressT = cv.t;
    // Count the edges that survive the debounce window.
    let last = -1e9;
    let n = 0;
    for (const e of EDGES.filter((_, i) => i % 2 === 0)) {
      if (e - last >= debounceMs) { n++; last = e; }
    }
    counted += n;
    cv.once();
  };

  const upd = () => {
    setNote(debounceMs === 0
      ? 'No debounce. A human sees one press; a chip polling at 100 kHz sees several transitions over 1 to 20 milliseconds and counts them all. <b>Bounce is invisible to reasoning and obvious on a screen, which is why you put a scope on a switch in this class.</b>'
      : debounceMs < 8
        ? `A ${debounceMs} ms window is shorter than the bounce itself, so some of the later closures still get through. <b>Twenty to fifty milliseconds is the usual figure, and it is chosen to be comfortably longer than any mechanical switch's settling time.</b>`
        : `A ${debounceMs} ms window ignores everything after the first edge until the contacts have settled. One press, one count. <b>For anything that must not double-fire — a cue trigger, a pyro arm — use hardware debouncing as well, because the cost is two components and a double-fired cue is a show problem.</b>`);
    counted = 0;
    cv.once();
  };

  controls.append(slider('Debounce window', {
    min: 0, max: 50, step: 1, value: 0, fmt: (v) => (v ? `${v} ms` : 'none'),
    on: (v) => { debounceMs = v; upd(); },
  }).node);
  const b = document.createElement('button');
  b.className = 'ac ac-btn';
  b.textContent = 'Press';
  b.addEventListener('click', press);
  controls.append(b);
  const reset = document.createElement('button');
  reset.className = 'ac ac-btn';
  reset.textContent = 'Reset count';
  reset.addEventListener('click', () => { counted = 0; cv.once(); });
  controls.append(reset);

  challenge('Press it five times and have the counter read exactly five.', () => counted === 5);

  const cv = canvas(stage, {
    height: 250,
    draw(g, w, h, t) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const gL = pad, gT = 24, gW = w - pad * 2, gH = 78;
      box(g, gL, gT, gW, gH, { fill: p.ground, stroke: p.line, r: 6 });
      const hi = gT + 12, lo = gT + gH - 12;
      const span = 20;   // milliseconds across the screen

      g.strokeStyle = R.signal;
      g.lineWidth = 2.2;
      g.beginPath();
      let state = 1;
      let x = gL;
      g.moveTo(x, hi);
      let ei = 0;
      for (let ms = 0; ms <= span; ms += 0.05) {
        while (ei < EDGES.length && EDGES[ei] <= ms) { state = 1 - state; ei++; }
        const px = gL + (ms / span) * gW;
        g.lineTo(px, state ? hi : lo);
      }
      g.stroke();

      // The debounce window, drawn from the first edge.
      if (debounceMs > 0) {
        const wx = gL + (EDGES[0] / span) * gW;
        const ww = Math.min(gW - (wx - gL), (debounceMs / span) * gW);
        g.fillStyle = alpha(R.safe, 0.15);
        g.fillRect(wx, gT + 1, ww, gH - 2);
        label(g, `${debounceMs} ms ignored`, wx + 6, gT + gH - 12, {
          color: R.safe, size: 9.5, max: ww - 8,
        });
      }

      for (let ms = 0; ms <= span; ms += 5) {
        const px = gL + (ms / span) * gW;
        line(g, px, gT + gH, px, gT + gH + 4, { color: p.muted, lw: 1 });
        label(g, `${ms} ms`, px, gT + gH + 13, { color: p.muted, size: 9, align: 'center' });
      }
      label(g, 'contacts colliding and separating', gL + 6, gT + 12, { color: p.muted, size: 10 });

      const cy = gT + gH + 32;
      const edgesThrough = (() => {
        let last = -1e9, n = 0;
        for (const e of EDGES.filter((_, i) => i % 2 === 0)) {
          if (e - last >= debounceMs) { n++; last = e; }
        }
        return n;
      })();
      readoutChip(g, pad, cy, 'EDGES PER PRESS', String(edgesThrough), {
        color: edgesThrough > 1 ? R.fault : R.safe, p, w: Math.min(140, (w - pad * 2 - 12) / 2),
      });
      readoutChip(g, pad + Math.min(148, (w - pad * 2) / 2 + 4), cy, 'TOTAL COUNTED', String(counted), {
        color: p.ink, p, w: Math.min(140, (w - pad * 2 - 12) / 2),
      });
      label(g, 'Hardware: an RC filter and a Schmitt trigger input, for a switch out in the set, because it also suppresses what the cable picks up.',
        pad, cy + 52, { color: p.muted, size: 10.5, max: w - pad * 2 });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// Class 12: state machines and failing safely
// ---------------------------------------------------------------------------

register('state-machine', (host) => {
  const STATES = [
    ['SAFE', 'Outputs off. Where the prop lands on power-up, always.', 'safe'],
    ['IDLE', 'Armed and dark, waiting for a cue.', 'signal'],
    ['FLARE', 'Full output for 800 ms.', 'energy'],
    ['SETTLE', 'Fading from full to the burn level over 2 s.', 'energy'],
    ['BURN', 'Flickering at the burn level, waiting for the next cue.', 'energy'],
  ];
  let cur = 0;
  let doubleTap = 'ignore';

  const { controls, stage, setNote } = figure(host, {
    title: 'A prop is a state machine',
    sub: 'Writing it out forces three questions that are otherwise never asked.',
    note: '',
  });

  const upd = () => {
    setNote(STATES[cur][0] === 'SAFE'
      ? 'Power-up lands in SAFE, never in an energised state. <b>A prop that resumes its previous state on power-up is a prop that fires in the interval when the power blips, and power blips happen.</b>'
      : STATES[cur][0] === 'FLARE'
        ? `A cue arriving now is the question every design review asks and most teams have not answered. Your setting is "${doubleTap}". <b>The double-tap is not an edge case: an operator unsure whether the first press registered will press again, every time, on every production.</b>`
        : `${STATES[cur][0]}: ${STATES[cur][1]} <b>Every state sets its outputs explicitly on every pass, so an output that is only set on a transition can never be left wrong.</b>`);
    cv.once();
  };

  controls.append(choice('State', STATES.map((s, k) => [k, s[0]]), {
    value: 0, on: (v) => { cur = +v; upd(); },
  }).node);
  controls.append(choice('Cue during FLARE', [['ignore', 'Ignore it'], ['restart', 'Restart'], ['queue', 'Queue it']], {
    value: 'ignore', on: (v) => { doubleTap = v; upd(); },
  }).node);

  const cv = canvas(stage, {
    height: 270,
    draw(g, w, h, t) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const n = STATES.length;
      const cw = Math.min(96, (w - pad * 2 - (n - 1) * 8) / n);
      const y = 34;

      STATES.forEach(([name, , tone], k) => {
        const x = pad + k * (cw + 8);
        const on = k === cur;
        const col = R[tone];
        box(g, x, y, cw, 42, {
          fill: on ? alpha(col, 0.25) : p.raised, stroke: on ? col : p.line, r: 7, lw: on ? 2 : 1,
        });
        label(g, name, x + cw / 2, y + 21, {
          color: on ? col : p.ink2, size: 11, align: 'center', weight: 700, max: cw - 8,
        });
        if (k < n - 1) {
          arrow(g, x + cw + 1, y + 21, x + cw + 7, y + 21, { color: p.muted, lw: 1.5, head: 4 });
        }
      });

      // The transitions, written out.
      const ty = y + 62;
      const T = [
        'IDLE   --cue received-->  FLARE',
        'FLARE  --after 800 ms-->  SETTLE',
        'SETTLE --after 2 s-->     BURN',
        'BURN   --cue received-->  FLARE',
        'any    --fault detected-> SAFE',
        'SAFE   --reset held 2 s-> IDLE',
      ];
      T.forEach((ln, k) => label(g, ln, pad, ty + k * 16, {
        color: /fault|SAFE/.test(ln) ? R.fault : p.ink2, size: 10.5, mono: true, max: w - pad * 2,
      }));

      // The three questions.
      const qy = ty + T.length * 16 + 14;
      const Q = [
        ['What happens if the cue arrives during FLARE?', doubleTap === 'ignore' ? 'ignored' : doubleTap === 'restart' ? 'restarts the flare' : 'queued for after SETTLE'],
        ['What state is it in at power-up?', 'SAFE, explicitly initialised'],
        ['What state does it go to on a fault?', 'SAFE, checked before anything else acts'],
      ];
      Q.forEach(([q, a], k) => {
        label(g, q, pad, qy + k * 17, { color: p.muted, size: 10.5, max: w * 0.52 });
        label(g, a, pad + Math.max(w * 0.55, 190), qy + k * 17, {
          color: R.safe, size: 10.5, weight: 600, max: w - pad - Math.max(w * 0.55, 190),
        });
      });
    },
  });
  upd();
});

register('fail-safe', (host) => chain(host, {
  title: 'Four questions, answered in writing, for every prop',
  sub: 'In the capstone they are marked. On a production they are what the production manager actually reads.',
  tag: 'Question', accent: 'fault',
  stages: [
    {
      name: 'Power-up',
      body: 'Everything off, and stay off until something positively says otherwise.',
      why: 'A prop that resumes its previous state on power-up fires in the interval when the power blips. Initialise the state variable to SAFE explicitly rather than relying on whatever the compiler put there.',
      note: 'This is the behaviour every audience will eventually see, because power blips happen. <b>Initialise to SAFE, always, and say so on the sheet.</b>',
    },
    {
      name: 'Loss of control',
      body: 'DMX stops, the cue cable is unplugged, the network drops. Hold the last state, fade to a safe state over some seconds, or go dark immediately.',
      why: 'All three are correct in different contexts. A practical lamp holding its last state is fine; a moving element holding its last state may be dangerous.',
      note: 'What is not acceptable is not having decided. <b>The decision belongs on the documentation sheet where a production manager can read it, because they will ask.</b>',
    },
    {
      name: 'Out of range',
      body: 'A distance of −4 mm or a temperature of 300 °C means the sensor or its wiring has failed, not that the world has become strange. Detect it, name it, go to SAFE.',
      why: 'A prop that acts on an impossible reading is a prop that does something violent because a wire came loose.',
      note: 'Filtering an impossible reading hides a fault and lets the prop act on invented data. <b>An impossible value is information, and the information is that something is broken.</b>',
    },
    {
      name: 'Reset',
      body: 'One documented physical action: hold a button for two seconds. Not a power cycle, and not automatic.',
      why: 'A power cycle in a rack means finding which of forty plugs it is. A fault that clears itself will recur on stage, and nobody will know it happened.',
    },
  ],
  footer: 'The watchdog recovers from a software hang. It does nothing about wrong logic, and a prop resetting every two seconds into a bad state is worse than one that stopped.',
}));

register('dmx-receive', (host) => {
  let isolated = true;
  let signalPresent = true;
  let lossBehaviour = 'hold';
  let lostFor = 0;

  const { controls, stage, setNote } = figure(host, {
    title: 'Receiving DMX in a prop',
    sub: 'An RS-485 receiver, an isolation barrier, and a timeout that decides what happens when the cable is kicked out.',
    note: '',
  });

  const upd = () => {
    setNote(!signalPresent
      ? `No valid packet for over a second. Your prop does what you decided: ${lossBehaviour === 'hold' ? 'hold the last state' : lossBehaviour === 'fade' ? 'fade to dark over three seconds' : 'go dark immediately'}. <b>It is a few lines of code, and it is the difference between a prop that behaves predictably when a cable is kicked out and one that does something nobody can explain.</b>`
      : isolated
        ? 'An isolated receiver protects your prop from a DMX line that runs all over the building, and more importantly protects the rest of the rig from a fault in your prop. <b>A microcontroller pin cannot read RS-485 levels directly, and connecting one to a DMX line is how you damage a pin.</b>'
        : 'Without isolation, a fault anywhere on the DMX line reaches your prop, and a fault in your prop reaches the whole rig. <b>The line touches equipment on other power circuits all over the building, which is exactly the Class 5 argument in its most concrete form.</b>');
    cv.once();
  };

  controls.append(toggle('Isolated receiver', { value: true, on: (v) => { isolated = v; upd(); } }).node);
  controls.append(toggle('DMX present', { value: true, on: (v) => { signalPresent = v; lostFor = 0; upd(); } }).node);
  controls.append(choice('On signal loss', [['hold', 'Hold last state'], ['fade', 'Fade out over 3 s'], ['dark', 'Go dark now']], {
    value: 'hold', on: (v) => { lossBehaviour = v; upd(); },
  }).node);

  const cv = canvas(stage, {
    height: 260,
    draw(g, w, h, t, dt) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      if (!signalPresent) lostFor += dt || 0.016; else lostFor = 0;

      const y = 60;
      const stages = [
        ['DMX in', 'XLR5'],
        ['MAX485', 'RS-485 receiver'],
        [isolated ? 'isolated' : 'not isolated', isolated ? 'barrier' : ''],
        ['UART', '250 kbit/s'],
        ['prop', 'your firmware'],
      ];
      const bw = Math.min(88, (w - pad * 2 - 4 * 10) / 5);
      stages.forEach(([n, s], k) => {
        const x = pad + k * (bw + 10);
        const isBar = k === 2;
        box(g, x, y - 22, bw, 44, {
          fill: isBar ? alpha(isolated ? R.safe : R.fault, 0.15) : p.raised,
          stroke: isBar ? (isolated ? R.safe : R.fault) : p.line, r: 6, lw: isBar ? 2 : 1,
        });
        label(g, n, x + bw / 2, y - 6, {
          color: isBar ? (isolated ? R.safe : R.fault) : p.ink2, size: 10, align: 'center', weight: 600, max: bw - 6,
        });
        if (s) label(g, s, x + bw / 2, y + 9, { color: p.muted, size: 8.5, align: 'center', max: bw - 6 });
        if (k < 4) {
          const ax = x + bw, ax2 = x + bw + 10;
          line(g, ax, y, ax2, y, { color: signalPresent ? R.signal : alpha(p.muted, 0.4), lw: 2 });
          if (signalPresent) {
            const u = ((t * 1.6 + k / 5) % 1);
            g.fillStyle = R.signal;
            g.beginPath();
            g.arc(ax + u * 10, y, 2.4, 0, Math.PI * 2);
            g.fill();
          }
        }
      });

      // The timeout, and what the output does.
      const ty = y + 52;
      const timedOut = lostFor > 1;
      box(g, pad, ty, w - pad * 2, 30, {
        fill: alpha(timedOut ? R.fault : R.safe, 0.1),
        stroke: alpha(timedOut ? R.fault : R.safe, 0.4), r: 7,
      });
      label(g, signalPresent
        ? 'Valid packet received. lastPacket = millis().'
        : timedOut
          ? `No valid packet for ${lostFor.toFixed(1)} s — control lost, applying the documented behaviour`
          : `No packet for ${lostFor.toFixed(1)} s — inside the 1 second window`,
      pad + 12, ty + 16, {
        color: timedOut ? R.fault : R.safe, size: 11, weight: 600, mono: true, max: w - pad * 2 - 24,
      });

      // The output level.
      const oy = ty + 44;
      let level = 0.8;
      if (timedOut) {
        if (lossBehaviour === 'dark') level = 0;
        else if (lossBehaviour === 'fade') level = Math.max(0, 0.8 * (1 - (lostFor - 1) / 3));
      }
      label(g, 'output', pad, oy + 10, { color: p.muted, size: 10 });
      box(g, pad + 54, oy, w - pad * 2 - 54, 20, { fill: p.raised, stroke: p.line, r: 5 });
      g.fillStyle = alpha(R.energy, 0.3 + level * 0.6);
      g.fillRect(pad + 55, oy + 1, (w - pad * 2 - 56) * level, 18);
      label(g, `${Math.round(level * 100)}%`, w - pad - 8, oy + 10, {
        color: p.ink2, size: 10.5, align: 'right', mono: true,
      });

      label(g, 'Note the time each valid packet arrives. If more than a second passes with none, control has been lost.',
        pad, oy + 40, { color: p.muted, size: 10.5, max: w - pad * 2 });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// Interrupts
// ---------------------------------------------------------------------------

register('interrupts', (host) => compare(host, {
  title: 'Poll it, or interrupt for it',
  sub: 'Polling is right for almost everything. Knowing which few things it is wrong for is the point.',
  fields: [
    { label: 'How it works', key: 'how' },
    { label: 'Use it when', key: 'when', tone: 'safe' },
    { label: 'What goes wrong', key: 'wrong', tone: 'fault' },
  ],
  items: [
    {
      name: 'Polling', short: 'Poll', tone: 'safe',
      line: 'The loop comes round and asks. What you have been doing all class.',
      how: 'Read the pin every pass. At a loop time under a millisecond you will never miss a human',
      when: 'Buttons, sensors, anything a person or a slow machine does',
      wrong: 'Nothing, provided the loop stays fast. A blocking delay is what breaks it, not the polling',
      note: 'Easy to reason about, easy to debug, and impossible to get subtly wrong. <b>Reach for this first, every time, and only move to an interrupt when you can say exactly why polling fails.</b>',
    },
    {
      name: 'Interrupt', short: 'Interrupt', tone: 'energy',
      line: 'A pin change stops the processor mid-instruction, runs a short function, and returns.',
      how: 'Hardware vectors to your handler. The main loop does not have to be looking',
      when: 'Short, rare, and cannot be missed: an encoder pulse at speed, a zero-crossing, a stop input',
      wrong: 'Everything below, and all of it is invisible until it is not',
      watch: 'An interrupt handler blocks everything, including the timer that drives millis(). Set a flag, store a value, return. No delays, no printing, no long arithmetic.',
    },
    {
      name: 'The volatile trap', short: 'volatile', tone: 'fault',
      line: 'A variable shared between a handler and the main loop, without the keyword.',
      how: 'The compiler assumes nothing changes it behind its back and caches it in a register',
      when: 'Never. Mark every shared variable volatile',
      wrong: 'The main loop reads a stale value forever. The bug is invisible, intermittent, and depends on the optimisation level',
      note: 'It compiles, it runs, and it works at -O0 and fails at -O2. <b>This is the single hardest bug in embedded work to find by reading, and the fix is one keyword.</b>',
    },
    {
      name: 'The torn read', short: 'Torn read', tone: 'fault',
      line: 'A multi-byte variable shared with a handler, read while it is being written.',
      how: 'The loop reads two bytes, is interrupted between them, and reads the rest from a different moment',
      when: 'Any variable wider than the processor’s word that a handler writes',
      wrong: 'A number that was never true. On an 8-bit chip that is anything above 255',
      watch: 'Disable interrupts briefly around the read, copy the value, re-enable. Three lines, and without them a 32-bit counter occasionally reports a value from two different instants.',
    },
  ],
  footer: 'Do not use an interrupt for a button. A poll every millisecond will never miss a finger, and it is far easier to reason about at two in the morning.',
}));

// ---------------------------------------------------------------------------
// Powering a microcontroller
// ---------------------------------------------------------------------------

register('mcu-power', (host) => {
  let decoupled = true;
  let bulk = true;
  let sharedReg = false;
  let servoPulling = false;

  const { controls, stage, setNote, challenge } = figure(host, {
    title: 'Most prop faults that look like software are power',
    sub: 'Start a servo and watch the rail the chip is running from.',
    note: '',
  });

  // How far the local rail sags, in volts, when the servo pulls.
  const sag = () => {
    if (!servoPulling) return decoupled ? 0.01 : 0.05;
    let s = sharedReg ? 1.1 : 0.06;
    if (!bulk) s += 0.5;
    if (!decoupled) s += 0.35;
    return s;
  };

  const upd = () => {
    const v = 5 - sag();
    setNote(v < 4.3
      ? `The rail has fallen to ${sig(v)} V, below the chip’s brown-out threshold. It resets, mid-cue, every time the servo starts. <b>This presents as a software fault and it is a power fault, which is why it costs people days.</b>`
      : sag() > 0.15
        ? `The rail dips to ${sig(v)} V for a few milliseconds. The chip survives, and peripherals reading an analogue value during that window are reading against a reference that moved. <b>Every ADC reading taken while the servo starts is wrong, and nothing reports it.</b>`
        : 'The rail holds. Decoupling supplies the nanosecond demands, bulk capacitance covers the millisecond ones, and the actuator has its own supply. <b>Four things, none of them expensive, and together they are the difference between a board that works in a rack and one that only works on a bench.</b>');
    cv.once();
  };

  controls.append(toggle('100 nF at the chip', { value: true, on: (v) => { decoupled = v; upd(); } }).node);
  controls.append(toggle('Bulk capacitor at the entry', { value: true, on: (v) => { bulk = v; upd(); } }).node);
  controls.append(toggle('Servo on the board’s regulator', { value: false, on: (v) => { sharedReg = v; upd(); } }).node);
  controls.append(toggle('Servo starts', { value: false, on: (v) => { servoPulling = v; upd(); } }).node);

  challenge('Make the chip reset without touching a line of code.',
    () => 5 - sag() < 4.3);

  const cv = canvas(stage, {
    height: 270,
    draw(g, w, h, t) {
      const p = palette();
      const R = role(p);
      const pad = 16;
      const v = 5 - sag();
      const reset = v < 4.3;

      // The supply, the regulator, the chip and the servo.
      const y = 58;
      const regX = pad + 60, chipX = pad + 150, servoX = w - pad - 74;
      box(g, pad, y - 18, 44, 36, { fill: p.raised, stroke: p.line, r: 5 });
      label(g, '12 V', pad + 22, y, { color: R.energy, size: 10, align: 'center' });
      box(g, regX, y - 18, 52, 36, { fill: p.raised, stroke: p.line, r: 5 });
      label(g, 'reg', regX + 26, y, { color: p.ink2, size: 10, align: 'center' });
      line(g, pad + 44, y, regX, y, { color: R.energy, lw: 2 });
      box(g, chipX, y - 22, 60, 44, {
        fill: reset ? alpha(R.fault, 0.2) : p.raised, stroke: reset ? R.fault : p.line, r: 5, lw: reset ? 2 : 1,
      });
      label(g, reset ? 'RESET' : 'MCU', chipX + 30, y, {
        color: reset ? R.fault : p.ink2, size: 11, align: 'center', weight: 700,
      });
      line(g, regX + 52, y, chipX, y, { color: R.energy, lw: 2 });

      // The decoupling capacitor, at the chip or absent.
      if (decoupled) {
        line(g, chipX + 30, y + 22, chipX + 30, y + 34, { color: R.signal, lw: 1.5 });
        line(g, chipX + 20, y + 34, chipX + 40, y + 34, { color: R.signal, lw: 2.5 });
        line(g, chipX + 20, y + 40, chipX + 40, y + 40, { color: R.signal, lw: 2.5 });
        groundSym(g, chipX + 30, y + 44, p.muted, 1.5);
        label(g, '100 nF', chipX + 46, y + 37, { color: R.signal, size: 9 });
      } else {
        label(g, 'no decoupling', chipX + 30, y + 40, {
          color: R.fault, size: 9.5, align: 'center', weight: 700, max: 100,
        });
      }
      // Bulk, at the entry.
      if (bulk) {
        line(g, regX + 26, y + 18, regX + 26, y + 32, { color: R.signal, lw: 1.5 });
        line(g, regX + 16, y + 32, regX + 36, y + 32, { color: R.signal, lw: 2.5 });
        line(g, regX + 16, y + 38, regX + 36, y + 38, { color: R.signal, lw: 2.5 });
        groundSym(g, regX + 26, y + 42, p.muted, 1.5);
        label(g, '100 µF', regX - 4, y + 36, { color: R.signal, size: 9, align: 'right' });
      }

      // The servo, on its own supply or stealing from the regulator.
      box(g, servoX, y - 18, 60, 36, {
        fill: servoPulling ? alpha(R.energy, 0.3) : p.raised, stroke: p.line, r: 5,
      });
      label(g, 'servo', servoX + 30, y, { color: p.ink2, size: 10, align: 'center' });
      if (sharedReg) {
        line(g, chipX + 60, y, servoX, y, { color: R.fault, lw: 2.5 });
        label(g, 'sharing the regulator', (chipX + 60 + servoX) / 2, y - 14, {
          color: R.fault, size: 9.5, align: 'center', max: servoX - chipX - 60,
        });
      } else {
        line(g, servoX + 30, y - 18, servoX + 30, y - 36, { color: R.safe, lw: 2 });
        line(g, pad + 22, y - 18, pad + 22, y - 36, { color: R.safe, lw: 2 });
        line(g, pad + 22, y - 36, servoX + 30, y - 36, { color: R.safe, lw: 2 });
        label(g, 'its own supply, grounds joined once', (pad + servoX) / 2, y - 44, {
          color: R.safe, size: 9.5, align: 'center', max: servoX - pad,
        });
      }
      if (servoPulling) {
        for (let k = 0; k < 4; k++) {
          const u = ((t * 1.6 + k / 4) % 1);
          g.fillStyle = R.energy;
          g.beginPath();
          g.arc(servoX - u * (sharedReg ? servoX - chipX - 60 : 40) + (sharedReg ? 0 : 0), y, 3, 0, Math.PI * 2);
          g.fill();
        }
      }

      // The rail, on a scope.
      const gL = pad, gT = 140, gW = w - pad * 2, gH = 74;
      box(g, gL, gT, gW, gH, { fill: alpha(p.ground, 0.5), stroke: p.line, r: 6 });
      const Y = (volts) => gT + gH - 10 - ((volts - 3.5) / 2) * (gH - 20);
      line(g, gL, Y(4.3), gL + gW, Y(4.3), { color: alpha(R.fault, 0.7), lw: 1, dash: [4, 3] });
      label(g, 'brown-out, 4.3 V', gL + 4, Y(4.3) - 8, { color: R.fault, size: 9 });
      line(g, gL, Y(5), gL + gW, Y(5), { color: alpha(p.muted, 0.5), lw: 1, dash: [3, 3] });
      label(g, '5.0 V', gL + 4, Y(5) - 8, { color: p.muted, size: 9 });

      g.strokeStyle = reset ? R.fault : R.safe;
      g.lineWidth = 2.2;
      g.beginPath();
      for (let k = 0; k <= 220; k++) {
        const u = k / 220;
        // A dip whenever the servo pulls, with ripple scaled by what is missing.
        const pulse = servoPulling ? Math.max(0, Math.sin(u * 6 * Math.PI - t * 2)) ** 6 : 0;
        const ripple = decoupled ? 0.004 : 0.03;
        const vv = 5 - sag() * pulse - Math.sin(u * 90 - t * 20) * ripple;
        const x = gL + u * gW;
        k ? g.lineTo(x, Y(vv)) : g.moveTo(x, Y(vv));
      }
      g.stroke();
      label(g, `the rail at the chip: dips to ${sig(v)} V`, gL + 6, gT + 12, {
        color: reset ? R.fault : R.safe, size: 10.5, weight: 600, max: gW - 12,
      });

      label(g, 'Decouple at the chip · bulk at the entry · the actuator gets its own supply · join the grounds once',
        pad, gT + gH + 18, { color: p.muted, size: 10.5, max: gW });
    },
  });
  upd();
});

// ---------------------------------------------------------------------------
// The three buses
// ---------------------------------------------------------------------------

register('i2c-spi', (host) => compare(host, {
  title: 'Three buses, and what each costs in wires',
  sub: 'Usually decided by what the sensor you want happens to speak, but knowing why matters when you have a choice.',
  fields: [
    { label: 'Wires', key: 'wires' },
    { label: 'Speed', key: 'speed' },
    { label: 'How many devices', key: 'many' },
    { label: 'Where you meet it', key: 'where' },
  ],
  items: [
    {
      name: 'UART', short: 'UART', tone: 'signal',
      line: 'Two wires and a ground, point to point, with both ends agreeing a rate in advance.',
      wires: '2 plus ground: transmit and receive', speed: 'Low to moderate, 9600 to a few Mbit/s',
      many: 'One. It is a conversation between two devices',
      where: 'DMX through an RS-485 receiver, GPS, radio modules, and your serial debugging',
      note: 'No clock line, which is why both ends must agree the rate beforehand. <b>That is the whole of Class 9’s serial frame, arriving as something you now have to configure.</b>',
    },
    {
      name: 'I²C', short: 'I²C', tone: 'energy',
      line: 'Two wires shared by everything, each device answering to its own address.',
      wires: '2 shared: clock and data', speed: '100 or 400 kHz, sometimes faster',
      many: 'Many, each with an address',
      where: 'Sensors, small displays, real-time clocks, expanders',
      watch: 'It needs pull-up resistors on both lines, usually 4.7 kΩ, and exactly ONE set for the whole bus rather than one set per device. Fit four breakout boards that each have their own and the bus stops working.',
    },
    {
      name: 'I²C address clash', short: 'Clash', tone: 'fault',
      line: 'Two identical sensors on one bus.',
      wires: 'The same two', speed: 'Irrelevant, nothing works',
      many: 'One of each address, and that is the constraint',
      where: 'The moment you buy a second of anything',
      note: 'Two devices with the same fixed address cannot share a bus. <b>This is why breakout boards have an address-select jumper, and why everybody discovers that jumper only after buying the second sensor.</b>',
    },
    {
      name: 'SPI', short: 'SPI', tone: 'safe',
      line: 'Four wires shared, plus one select line per device.',
      wires: '4 shared, plus one chip-select each', speed: 'Fast: megahertz, tens of megahertz',
      many: 'Many, limited by how many pins you can spare for selects',
      where: 'SD cards, displays, addressable LED drivers, fast ADCs',
      note: 'No addressing and no acknowledgement: you pull a select line low and shift bits. <b>Fast and simple, and it costs a pin per device, which on a small chip is the real limit.</b>',
    },
  ],
  footer: 'The buses are not interchangeable and the choice is usually made for you by the part you want. What you control is the wiring, and the pull-ups are where it goes wrong.',
}));

// ---------------------------------------------------------------------------
// Class 12: debugging and non-volatile storage
// ---------------------------------------------------------------------------

register('serial-debug', (host) => compare(host, {
  title: 'Debugging with a serial port and an LED',
  sub: 'No breakpoints and no step button. Used properly these are enough.',
  fields: [
    { label: 'Do this', key: 'do', tone: 'safe' },
    { label: 'Rather than', key: 'rather', tone: 'fault' },
    { label: 'Because', key: 'because' },
  ],
  items: [
    {
      name: 'Print state changes', short: 'States', tone: 'safe',
      line: 'Twenty lines from a whole show is readable. Twenty thousand is not.',
      do: 'Print when the state machine moves: `IDLE -> FLARE at 41230 ms`',
      rather: 'Printing a sensor value on every loop pass',
      because: 'A loop printing thousands of times a second tells you nothing and slows the loop enough to change the behaviour you were investigating',
      note: 'The log you can actually read is the one that only speaks when something happened. <b>Everything else is noise you will scroll past on the night it matters.</b>',
    },
    {
      name: 'Timestamp everything', short: 'Times', tone: 'safe',
      line: 'millis() at the front of every line, without exception.',
      do: 'Prefix every line with the time',
      rather: 'A bare message with no time',
      because: 'Half of all prop faults are ordering and timing questions, and a log with no times cannot answer either',
    },
    {
      name: 'Know what printing costs', short: 'Cost', tone: 'energy',
      line: 'At 9600 baud a forty-character line takes about 42 milliseconds.',
      do: 'Use 115200, print sparingly, and count the cost into your loop time',
      rather: 'Adding prints until the fault goes away',
      because: 'If the print is inside your loop, your loop now takes 42 ms',
      watch: 'A fault that disappears when you add printing is usually a timing fault you have just changed. That is information, not a fix, and removing the print brings it straight back.',
    },
    {
      name: 'The indicator LED', short: 'LED', tone: 'signal',
      line: 'The field version of all of the above.',
      do: 'A pattern per state: one blink idle, two running, rapid for a fault',
      rather: 'Assuming somebody will connect a laptop',
      because: 'On a production nobody is connecting a laptop, and the serial port is buried in a set',
      note: 'Diagnosable from six metres with the documentation sheet. <b>It works when the USB socket is behind a flat, which is where it always is.</b>',
    },
    {
      name: 'Predict before you instrument', short: 'Predict', tone: 'safe',
      line: 'The Class 2 discipline, in software.',
      do: 'Ask what you expect to see if your theory is right, and what you would see if it is wrong',
      rather: 'Adding output everywhere and reading it afterwards',
      because: 'If those two answers are the same, the measurement cannot change your mind and is not worth taking',
    },
  ],
  footer: 'A print statement is a measurement, and every rule from Class 2 applies to it: predict first, record what you saw, and change one thing at a time.',
}));

register('nonvolatile', (host) => chain(host, {
  title: 'Remembering things across a power cut',
  sub: 'RAM is gone the moment power is. Anything that must survive has to be written deliberately.',
  tag: 'Rule', accent: 'energy',
  stages: [
    {
      name: 'Decide what is worth keeping',
      body: 'Configuration is worth keeping: a calibration, a homing offset, a fixture address, a cycle count. State is not.',
      why: 'A prop that remembers it was mid-flare and resumes has used non-volatile storage to defeat the power-up rule from earlier in this class.',
      note: 'Ask what a stranger would want the device to do on power-up. <b>The answer is almost never "carry on from where it was".</b>',
    },
    {
      name: 'Do not write on every loop',
      body: 'EEPROM endures roughly a hundred thousand writes per cell. A loop running a thousand times a second reaches that in under two minutes.',
      why: 'The cell does not announce that it has worn out. It simply starts returning what it feels like, and the prop starts homing to a garbage offset.',
      note: 'Write when something has actually changed, and never in a code path that can repeat. <b>This one rule has ended installations.</b>',
    },
    {
      name: 'Assume the first read is garbage',
      body: 'A new chip, or one whose data was written by an earlier version of your firmware, holds whatever it holds.',
      why: 'A prop that trusts an uninitialised value moves somewhere nobody expected, at full speed, on the first power-up in the venue.',
    },
    {
      name: 'Store a version and a checksum',
      body: 'A version byte and a simple checksum alongside the value. If either is wrong, fall back to a sane default rather than trusting it.',
      why: 'It costs three bytes and it turns "the prop did something inexplicable" into "the prop used its defaults and told you so on the indicator".',
      note: 'The version byte is what lets a firmware update change the stored format safely. <b>Without it, upgrading the firmware silently reinterprets whatever was there.</b>',
    },
  ],
  footer: 'Wear, initialisation and format changes. Three failure modes, all of them slow, all of them showing up weeks after the thing was installed.',
}));
