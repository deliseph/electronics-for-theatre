// The calculators.
//
// Every tool prints its working, not just its answer. That is deliberate: the
// capstone awards method marks, and a student who reads only the result has
// outsourced the one skill being assessed.

const $ = (sel, root = document) => root.querySelector(sel);
const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const num = (v, d = 0) => (Number.isFinite(+v) ? +v : d);

// --- Shared formatting ------------------------------------------------------

const sig = (v, n = 3) => {
  if (!Number.isFinite(v)) return '—';
  if (v === 0) return '0';
  const mag = Math.floor(Math.log10(Math.abs(v)));
  const dp = Math.max(0, n - 1 - mag);
  const s = v.toFixed(Math.min(dp, 6));
  // Only trim zeros that are after a decimal point. Trimming them from an
  // integer turns 100 into 1, which is the kind of bug that silently makes
  // every number on the site wrong.
  return s.includes('.') ? s.replace(/\.?0+$/, '') : s;
};

// Engineering notation, because that is how a value is spoken and written on a
// bench: 4.7 kΩ, not 4700 ohms.
function eng(v, unit = '') {
  if (!Number.isFinite(v)) return '—';
  const a = Math.abs(v);
  const steps = [[1e9, 'G'], [1e6, 'M'], [1e3, 'k'], [1, ''], [1e-3, 'm'], [1e-6, 'µ'], [1e-9, 'n'], [1e-12, 'p']];
  for (const [mul, pre] of steps) {
    if (a >= mul) return `${sig(v / mul)} ${pre}${unit}`.trim();
  }
  return `${sig(v)} ${unit}`.trim();
}

// --- Shared field builders --------------------------------------------------

// The label a sighted user reads and the label a screen reader announces have
// to be the same one, so the label is joined to its control by id.
const field = (label, inner, hint) => {
  const id = /\bid="([^"]+)"/.exec(inner)?.[1];
  return `<div class="field"><label${id ? ` for="${id}"` : ''}>${label}</label>${inner}${hint ? `<span class="field-hint">${hint}</span>` : ''}</div>`;
};
const inp = (id, val, attrs = '') => `<input id="${id}" value="${val}" ${attrs}>`;
const sel = (id, opts, cur) =>
  `<select id="${id}">${opts.map(([v, l]) => `<option value="${v}"${String(v) === String(cur) ? ' selected' : ''}>${l}</option>`).join('')}</select>`;

const readout = (big, sub, cls = '') =>
  `<div class="readout ${cls}"><div class="readout-big">${big}</div><div class="readout-sub">${sub}</div></div>`;

const table = (rows) => `<div class="table-wrap"><table><tbody>${rows
  .map(([a, b]) => `<tr><td>${a}</td><td>${b}</td></tr>`).join('')}</tbody></table></div>`;

// A note that is a warning rather than a result. Used wherever the arithmetic
// is correct and the answer is still unacceptable.
const warn = (t) => `<p class="tool-warn"><b>Check this.</b> ${t}</p>`;
const good = (t) => `<p class="tool-good">${t}</p>`;

// ============================================================================
// Tools
// ============================================================================

const TOOLS = {};

// --- Ohm's law --------------------------------------------------------------

TOOLS.ohm = (root) => {
  root.append(h(`<p class="tool-sub">Enter any two and the other two follow. The working is the part
    the capstone marks, so read it rather than the answer.</p>`));
  root.append(h(`<div class="fields">
    ${field('Known pair', sel('ohm-known', [
    ['vr', 'Voltage and resistance'], ['vi', 'Voltage and current'],
    ['ir', 'Current and resistance'], ['pr', 'Power and resistance'],
  ], 'vr'))}
    ${field('First value', inp('ohm-a', '12', 'type="number" step="any"'))}
    ${field('Second value', inp('ohm-b', '100', 'type="number" step="any"'))}
  </div>`));
  const out = h('<div></div>');
  root.append(out);

  const UNITS = { vr: ['V', 'Ω'], vi: ['V', 'A'], ir: ['A', 'Ω'], pr: ['W', 'Ω'] };

  const run = () => {
    const k = $('#ohm-known').value;
    const a = num($('#ohm-a').value);
    const b = num($('#ohm-b').value);
    const [ua, ub] = UNITS[k];
    $('#ohm-a').previousElementSibling.textContent = `First value (${ua})`;
    $('#ohm-b').previousElementSibling.textContent = `Second value (${ub})`;

    let V, I, R, P, work;
    if (k === 'vr') {
      V = a; R = b; I = V / R; P = V * I;
      work = `I = V ÷ R = ${sig(V)} ÷ ${sig(R)} = ${eng(I, 'A')}\nP = V × I = ${sig(V)} × ${sig(I)} = ${eng(P, 'W')}`;
    } else if (k === 'vi') {
      V = a; I = b; R = V / I; P = V * I;
      work = `R = V ÷ I = ${sig(V)} ÷ ${sig(I)} = ${eng(R, 'Ω')}\nP = V × I = ${eng(P, 'W')}`;
    } else if (k === 'ir') {
      I = a; R = b; V = I * R; P = V * I;
      work = `V = I × R = ${sig(I)} × ${sig(R)} = ${eng(V, 'V')}\nP = I² × R = ${sig(I)}² × ${sig(R)} = ${eng(P, 'W')}`;
    } else {
      P = a; R = b; I = Math.sqrt(P / R); V = I * R;
      work = `I = √(P ÷ R) = √(${sig(P)} ÷ ${sig(R)}) = ${eng(I, 'A')}\nV = I × R = ${eng(V, 'V')}`;
    }

    if (![V, I, R, P].every(Number.isFinite) || R <= 0) {
      out.innerHTML = readout('Not a valid pair', 'Resistance must be above zero.', 'fail');
      return;
    }

    out.innerHTML = readout(eng(I, 'A'), `through ${eng(R, 'Ω')} at ${eng(V, 'V')}, dissipating ${eng(P, 'W')}`)
      + table([
        ['Voltage', `<code>${eng(V, 'V')}</code>`],
        ['Current', `<code>${eng(I, 'A')}</code>`],
        ['Resistance', `<code>${eng(R, 'Ω')}</code>`],
        ['Power', `<code>${eng(P, 'W')}</code>`],
      ])
      + `<pre class="working">${work}</pre>`
      + (P > 0.25 && R > 1
        ? warn(`${eng(P, 'W')} in a resistor needs a part rated above that. A quarter-watt resistor here would
          run too hot to touch, drift in value and eventually fail. Choose a ${P > 2 ? '5 W wirewound' : P > 0.5 ? '1 W' : '0.5 W'} part or larger.`)
        : '');
  };
  root.addEventListener('input', run);
  root.addEventListener('change', run);
  run();
};

// --- Power, current and breaker ---------------------------------------------

TOOLS.power = (root) => {
  root.append(h(`<p class="tool-sub">What a load draws, and whether the circuit will carry it. The
    80 per cent rule is not a safety margin invented here: it is what stops a breaker nuisance-tripping
    on a warm afternoon.</p>`));
  root.append(h(`<div class="fields">
    ${field('Load power (W)', inp('pw-p', '500', 'type="number" step="any"'))}
    ${field('Quantity', inp('pw-n', '6', 'type="number" step="1" min="1"'))}
    ${field('Supply', sel('pw-v', [[230, '230 V, 50 Hz'], [220, '220 V, 50 Hz'], [120, '120 V, 60 Hz']], 230))}
    ${field('Circuit breaker', sel('pw-b', [[6, '6 A'], [10, '10 A'], [13, '13 A'], [16, '16 A'], [20, '20 A'], [32, '32 A'], [63, '63 A']], 16))}
    ${field('Power factor', inp('pw-pf', '1.0', 'type="number" step="0.05" min="0.4" max="1"'),
    'LED fixtures and switch-mode supplies are often 0.9 or lower')}
  </div>`));
  const out = h('<div></div>');
  root.append(out);

  const run = () => {
    const p = num($('#pw-p').value);
    const n = Math.max(1, Math.round(num($('#pw-n').value, 1)));
    const v = num($('#pw-v').value, 230);
    const brk = num($('#pw-b').value, 16);
    const pf = Math.min(1, Math.max(0.4, num($('#pw-pf').value, 1)));

    const total = p * n;
    const I = total / (v * pf);
    const limit80 = brk * 0.8;
    const pct = (I / brk) * 100;
    const state = I > brk ? 'fail' : I > limit80 ? 'warn' : '';

    out.innerHTML = readout(eng(I, 'A'), `${n} × ${eng(p, 'W')} = ${eng(total, 'W')} at ${v} V, power factor ${sig(pf)}`, state)
      + table([
        ['Total power', `<code>${eng(total, 'W')}</code>`],
        ['Current drawn', `<code>${eng(I, 'A')}</code>`],
        ['Breaker rating', `<code>${brk} A</code>`],
        ['Continuous limit, 80%', `<code>${sig(limit80)} A</code>`],
        ['Loading', `<code>${sig(pct)}%</code> of the breaker`],
        ['Headroom', `<code>${sig(brk - I)} A</code>, or ${sig((brk - I) * v * pf)} W`],
        ['How many more fit', `<code>${Math.max(0, Math.floor((limit80 * v * pf - total) / p))}</code> at 80% loading`],
      ])
      + `<pre class="working">I = P ÷ (V × pf)
  = ${sig(total)} ÷ (${v} × ${sig(pf)})
  = <b>${eng(I, 'A')}</b>

Continuous limit = ${brk} × 0.8 = ${sig(limit80)} A
Loading          = ${sig(I)} ÷ ${brk} = ${sig(pct)}%</pre>`
      + (I > brk
        ? warn(`This will trip. You are ${sig(I - brk)} A over the breaker rating before inrush is even considered.`)
        : I > limit80
          ? warn(`Under the breaker rating but over the 80 per cent continuous limit. It will work, and it will
            nuisance-trip on a warm afternoon or when the inrush of a switch-on coincides.`)
          : good(`Comfortable: ${sig(pct)} per cent of the breaker, with ${sig(brk - I)} A spare.`))
      + (n > 4 ? `<p class="tool-note"><b>Inrush.</b> ${n} switch-mode supplies energised by the same switch
        can momentarily draw ${Math.round(n * 42)} A for a few milliseconds. Sequence them a second apart
        rather than fitting a bigger breaker.</p>` : '');
  };
  root.addEventListener('input', run);
  root.addEventListener('change', run);
  run();
};

// --- Series and parallel ----------------------------------------------------

TOOLS.series = (root) => {
  root.append(h(`<p class="tool-sub">Comma-separated resistances, in ohms. The sanity check at the
    bottom catches nearly every arithmetic error in this calculation.</p>`));
  root.append(h(`<div class="fields">
    ${field('Resistances', inp('sp-r', '100, 220, 470'))}
    ${field('Arrangement', sel('sp-a', [['s', 'Series'], ['p', 'Parallel']], 's'))}
    ${field('Applied voltage (V)', inp('sp-v', '12', 'type="number" step="any"'))}
  </div>`));
  const out = h('<div></div>');
  root.append(out);

  const run = () => {
    const vals = $('#sp-r').value.split(/[,\s]+/).map(Number).filter((x) => Number.isFinite(x) && x > 0);
    const mode = $('#sp-a').value;
    const V = num($('#sp-v').value, 12);
    if (!vals.length) {
      out.innerHTML = readout('No values', 'Enter one or more resistances, separated by commas.', 'fail');
      return;
    }
    const total = mode === 's' ? vals.reduce((a, b) => a + b, 0) : 1 / vals.reduce((a, b) => a + 1 / b, 0);
    const I = V / total;
    const smallest = Math.min(...vals);
    const largest = Math.max(...vals);
    const ok = mode === 's' ? total >= largest : total <= smallest;

    const rows = vals.map((r, k) => {
      const vk = mode === 's' ? V * (r / total) : V;
      const ik = mode === 's' ? I : V / r;
      return [`R${k + 1} = <code>${eng(r, 'Ω')}</code>`,
        `<code>${eng(vk, 'V')}</code> across it, <code>${eng(ik, 'A')}</code> through it, <code>${eng(vk * ik, 'W')}</code>`];
    });

    out.innerHTML = readout(eng(total, 'Ω'), `${vals.length} resistors in ${mode === 's' ? 'series' : 'parallel'}, drawing ${eng(I, 'A')} at ${eng(V, 'V')}`)
      + table(rows)
      + `<pre class="working">${mode === 's'
        ? `R = ${vals.map((v) => sig(v)).join(' + ')}\n  = <b>${eng(total, 'Ω')}</b>`
        : `1/R = ${vals.map((v) => `1/${sig(v)}`).join(' + ')}\n    = ${sig(1 / total)}\nR   = <b>${eng(total, 'Ω')}</b>`}

I = V ÷ R = ${sig(V)} ÷ ${sig(total)} = ${eng(I, 'A')}
P = V × I = ${eng(V * I, 'W')} total</pre>`
      + (ok
        ? good(mode === 's'
          ? `Sanity check: ${eng(total, 'Ω')} is larger than the largest single resistor, ${eng(largest, 'Ω')}. In series it always is.`
          : `Sanity check: ${eng(total, 'Ω')} is smaller than the smallest single resistor, ${eng(smallest, 'Ω')}. In parallel it always is.`)
        : warn('The total is on the wrong side of the individual values, which means an arithmetic error somewhere.'));
  };
  root.addEventListener('input', run);
  root.addEventListener('change', run);
  run();
};

// --- Voltage divider --------------------------------------------------------

TOOLS.divider = (root) => {
  root.append(h(`<p class="tool-sub">Two resistors producing a fraction of the input. The loading
    row is the one that matters: a divider is only a divider while nothing is drawing from it.</p>`));
  root.append(h(`<div class="fields">
    ${field('Input voltage (V)', inp('dv-v', '5', 'type="number" step="any"'))}
    ${field('R1, upper (Ω)', inp('dv-r1', '10000', 'type="number" step="any"'))}
    ${field('R2, lower (Ω)', inp('dv-r2', '10000', 'type="number" step="any"'))}
    ${field('Load impedance (Ω)', inp('dv-rl', '10000000', 'type="number" step="any"'),
    'A 10 MΩ meter, or your ADC. Leave high for none')}
  </div>`));
  const out = h('<div></div>');
  root.append(out);

  const run = () => {
    const V = num($('#dv-v').value, 5);
    const r1 = num($('#dv-r1').value, 1);
    const r2 = num($('#dv-r2').value, 1);
    const rl = Math.max(1, num($('#dv-rl').value, 1e7));
    if (r1 <= 0 || r2 <= 0) {
      out.innerHTML = readout('Both resistors must be above zero', '', 'fail');
      return;
    }
    const ideal = V * (r2 / (r1 + r2));
    const lower = (r2 * rl) / (r2 + rl);
    const loaded = V * (lower / (r1 + lower));
    const err = ideal === 0 ? 0 : ((ideal - loaded) / ideal) * 100;
    const zout = (r1 * r2) / (r1 + r2);
    const draw = V / (r1 + r2);

    out.innerHTML = readout(eng(loaded, 'V'), `unloaded it would be ${eng(ideal, 'V')}; the load costs you ${sig(err)}%`,
      err > 5 ? 'warn' : '')
      + table([
        ['Unloaded output', `<code>${eng(ideal, 'V')}</code>`],
        ['With the load', `<code>${eng(loaded, 'V')}</code>`],
        ['Error from loading', `<code>${sig(err)}%</code>`],
        ['Output impedance', `<code>${eng(zout, 'Ω')}</code> (R1 ∥ R2)`],
        ['Standing current', `<code>${eng(draw, 'A')}</code>, wasting ${eng(V * draw, 'W')}`],
        ['ADC reading, 10-bit', `<code>${Math.round((loaded / V) * 1023)}</code> of 1023`],
      ])
      + `<pre class="working">V_out = V_in × R2 ÷ (R1 + R2)
      = ${sig(V)} × ${sig(r2)} ÷ (${sig(r1)} + ${sig(r2)})
      = <b>${eng(ideal, 'V')}</b>

With the load in parallel with R2:
  R2 ∥ R_load = ${eng(lower, 'Ω')}
  V_out       = ${eng(loaded, 'V')}

Output impedance = R1 ∥ R2 = ${eng(zout, 'Ω')}</pre>`
      + (zout > 10000
        ? warn(`An output impedance of ${eng(zout, 'Ω')} is above the 10 kΩ an ADC wants. The sampling capacitor
          will not finish charging and the reading will be low. Lower both resistors, or buffer it.`)
        : err > 5
          ? warn(`${sig(err)} per cent error from loading. The divider really is at ${eng(ideal, 'V')}; the difference is
            the load drawing current.`)
          : good('Loading error is negligible and the output impedance is comfortable for an ADC.'));
  };
  root.addEventListener('input', run);
  root.addEventListener('change', run);
  run();
};

// --- Resistor colour code ---------------------------------------------------

const BAND_NAMES = ['black', 'brown', 'red', 'orange', 'yellow', 'green', 'blue', 'violet', 'grey', 'white'];
const BAND_HEX = ['#111214', '#7a4a22', '#c8443c', '#d97b2a', '#d8c33c', '#3f9d5c', '#3a6fc4', '#8a5cc0', '#8b8f98', '#e8eaee'];
const TOL = [['5', 'gold ±5%', '#c9a227'], ['1', 'brown ±1%', '#7a4a22'], ['2', 'red ±2%', '#c8443c'], ['0.5', 'green ±0.5%', '#3f9d5c'], ['10', 'silver ±10%', '#9aa0a8']];

TOOLS.rescode = (root) => {
  root.append(h(`<p class="tool-sub">Both directions: read the bands, or find the bands for a value.
    The E12 row tells you whether the value you want actually exists to buy.</p>`));
  root.append(h(`<div class="fields">
    ${field('Band 1', sel('rc-1', BAND_NAMES.map((n, i) => [i, `${i} · ${n}`]), 4))}
    ${field('Band 2', sel('rc-2', BAND_NAMES.map((n, i) => [i, `${i} · ${n}`]), 7))}
    ${field('Multiplier', sel('rc-3', BAND_NAMES.map((n, i) => [i, `×10^${i} · ${n}`]), 2))}
    ${field('Tolerance', sel('rc-4', TOL.map((t, i) => [i, t[1]]), 0))}
  </div>`));
  const swatch = h('<div class="rescode-strip"></div>');
  root.append(swatch);
  const out = h('<div></div>');
  root.append(out);
  root.append(h(`<div class="fields" style="margin-top:18px">
    ${field('Or enter a value (Ω)', inp('rc-v', '4700', 'type="number" step="any"'))}
  </div>`));
  const rev = h('<div></div>');
  root.append(rev);

  // E12 is the series most through-hole resistors are actually made in.
  const E12 = [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82];
  const nearestE12 = (v) => {
    if (!(v > 0)) return null;
    const dec = Math.floor(Math.log10(v));
    let best = null;
    for (const d of [dec - 1, dec, dec + 1]) {
      for (const e of E12) {
        const cand = e * 10 ** (d - 1);
        if (!best || Math.abs(Math.log10(cand / v)) < Math.abs(Math.log10(best / v))) best = cand;
      }
    }
    return best;
  };

  const run = () => {
    const b = [0, 1, 2].map((k) => num($(`#rc-${k + 1}`).value));
    const ti = num($('#rc-4').value);
    const value = (b[0] * 10 + b[1]) * 10 ** b[2];
    const tol = Number(TOL[ti][0]);

    swatch.innerHTML = `<div class="rescode-body">
      ${b.map((v) => `<span class="rescode-band" style="background:${BAND_HEX[v]}"></span>`).join('')}
      <span class="rescode-gap"></span>
      <span class="rescode-band" style="background:${TOL[ti][2]}"></span>
    </div>`;

    const sm = b[2] <= 6 ? `${b[0]}${b[1]}${b[2]}` : '—';
    out.innerHTML = readout(eng(value, 'Ω'), `±${tol}% · ${eng(value * (1 - tol / 100), 'Ω')} to ${eng(value * (1 + tol / 100), 'Ω')}`)
      + table([
        ['Bands', `${BAND_NAMES[b[0]]}, ${BAND_NAMES[b[1]]}, ${BAND_NAMES[b[2]]}, ${TOL[ti][1]}`],
        ['Engineering shorthand', `<code>${engShort(value)}</code>`],
        ['Surface mount marking', `<code>${sm}</code>`],
        ['In the E12 series?', E12.some((e) => Math.abs(value / (e * 10 ** (Math.floor(Math.log10(value)) - 1)) - 1) < 0.01) ? 'yes, a stock value' : `no — nearest is ${eng(nearestE12(value), 'Ω')}`],
      ])
      + `<pre class="working">${b[0]}${b[1]} × 10^${b[2]} = ${b[0] * 10 + b[1]} × ${10 ** b[2]} = <b>${eng(value, 'Ω')}</b></pre>`;

    const want = num($('#rc-v').value);
    if (want > 0) {
      const near = nearestE12(want);
      const d = Math.floor(Math.log10(near));
      const digits = Math.round(near / 10 ** (d - 1));
      const mult = d - 1;
      rev.innerHTML = readout(`${BAND_NAMES[Math.floor(digits / 10)]} · ${BAND_NAMES[digits % 10]} · ${BAND_NAMES[Math.max(0, mult)]}`,
        `for ${eng(near, 'Ω')}${Math.abs(near - want) > want * 0.01 ? `, the nearest stock value to ${eng(want, 'Ω')}` : ''}`)
        + `<pre class="working">${eng(want, 'Ω')} → nearest E12 value ${eng(near, 'Ω')}
${digits} × 10^${mult} = ${eng(near, 'Ω')}</pre>`;
    } else {
      rev.innerHTML = '';
    }
  };

  const engShort = (v) => {
    if (v >= 1e6) return `${sig(v / 1e6)}M`.replace('.', 'M').replace('MM', 'M');
    if (v >= 1e3) return `${sig(v / 1e3)}k`.replace('.', 'k').replace('kk', 'k');
    return `${sig(v)}R`.replace('.', 'R').replace('RR', 'R');
  };

  root.addEventListener('input', run);
  root.addEventListener('change', run);
  run();
};

// --- LED series resistor ----------------------------------------------------

TOOLS.led = (root) => {
  root.append(h(`<p class="tool-sub">The calculation you will do a hundred times. Do it by hand at
    least twenty of those, because it appears in Class 6, Class 11 and the capstone.</p>`));
  root.append(h(`<div class="fields">
    ${field('Supply voltage (V)', inp('ld-v', '5', 'type="number" step="any"'))}
    ${field('LED colour', sel('ld-c', [
    ['2.0', 'Red, 2.0 V'], ['2.1', 'Yellow, 2.1 V'], ['2.2', 'Green, 2.2 V'],
    ['3.2', 'Blue, 3.2 V'], ['3.2', 'White, 3.2 V'], ['1.4', 'Infrared, 1.4 V'],
  ], '2.0'))}
    ${field('Desired current (mA)', inp('ld-i', '20', 'type="number" step="any"'))}
    ${field('LEDs in series', inp('ld-n', '1', 'type="number" step="1" min="1"'))}
  </div>`));
  const out = h('<div></div>');
  root.append(out);

  const E12 = [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82];

  const run = () => {
    const V = num($('#ld-v').value, 5);
    const vf = num($('#ld-c').value, 2);
    const mA = num($('#ld-i').value, 20);
    const n = Math.max(1, Math.round(num($('#ld-n').value, 1)));
    const I = mA / 1000;
    const drop = V - vf * n;

    if (drop <= 0) {
      out.innerHTML = readout('The supply is too low', `${n} LED${n > 1 ? 's' : ''} at ${sig(vf)} V each needs at least ${sig(vf * n)} V, plus headroom for the resistor.`, 'fail');
      return;
    }
    const R = drop / I;
    const dec = Math.floor(Math.log10(R));
    let nearest = null;
    for (const d of [dec - 1, dec, dec + 1]) {
      for (const e of E12) {
        const c = e * 10 ** (d - 1);
        if (c >= R && (!nearest || c < nearest)) nearest = c;   // round UP: never over-drive the LED
      }
    }
    const actualI = drop / nearest;
    const P = actualI * actualI * nearest;

    out.innerHTML = readout(eng(nearest, 'Ω'), `nearest E12 value at or above the calculated ${eng(R, 'Ω')}, giving ${eng(actualI, 'A')}`)
      + table([
        ['Exact value', `<code>${eng(R, 'Ω')}</code>`],
        ['Use', `<code>${eng(nearest, 'Ω')}</code> (rounded up, so the LED is never over-driven)`],
        ['Actual current', `<code>${sig(actualI * 1000)} mA</code>`],
        ['Resistor dissipation', `<code>${eng(P, 'W')}</code>`],
        ['Resistor rating needed', `<code>${P > 1 ? '2 W or larger' : P > 0.5 ? '1 W' : P > 0.125 ? '0.25 W' : '0.125 W is enough'}</code>`],
        ['Voltage across the LED', `<code>${eng(vf * n, 'V')}</code>`],
        ['Voltage across the resistor', `<code>${eng(drop, 'V')}</code>`],
      ])
      + `<pre class="working">R = (V_supply − V_forward × n) ÷ I
  = (${sig(V)} − ${sig(vf)} × ${n}) ÷ ${sig(I)}
  = ${sig(drop)} ÷ ${sig(I)}
  = <b>${eng(R, 'Ω')}</b>   → use ${eng(nearest, 'Ω')}

P = I² × R = ${sig(actualI)}² × ${sig(nearest)} = <b>${eng(P, 'W')}</b>

Check: ${sig(vf * n)} V + ${sig(drop)} V = ${sig(vf * n + drop)} V = the supply ✓</pre>`
      + (drop < V * 0.15
        ? warn(`Only ${sig((drop / V) * 100)} per cent of the supply is across the resistor. With so little headroom,
          normal variation in forward voltage between LEDs will change the current a lot. Aim for at least 20 per cent.`)
        : good(`${sig((drop / V) * 100)} per cent of the supply across the resistor, which is enough headroom for
          the LED's forward voltage to vary without the current moving much.`));
  };
  root.addEventListener('input', run);
  root.addEventListener('change', run);
  run();
};

// --- RC filter --------------------------------------------------------------

TOOLS.rc = (root) => {
  root.append(h(`<p class="tool-sub">One resistor and one capacitor: a time constant, a corner
    frequency, and a debounce filter. The same arithmetic answers all three.</p>`));
  root.append(h(`<div class="fields">
    ${field('Resistance (Ω)', inp('rc-r', '10000', 'type="number" step="any"'))}
    ${field('Capacitance (µF)', inp('rc-c', '0.1', 'type="number" step="any"'))}
  </div>`));
  const out = h('<div></div>');
  root.append(out);

  const run = () => {
    const R = num($('#rc-r').value, 1);
    const C = num($('#rc-c').value, 0.1) * 1e-6;
    if (R <= 0 || C <= 0) {
      out.innerHTML = readout('Both values must be above zero', '', 'fail');
      return;
    }
    const tau = R * C;
    const fc = 1 / (2 * Math.PI * tau);

    out.innerHTML = readout(eng(tau, 's'), `time constant, and a corner frequency of ${eng(fc, 'Hz')}`)
      + table([
        ['Time constant τ', `<code>${eng(tau, 's')}</code>`],
        ['63% charged after', `<code>${eng(tau, 's')}</code>`],
        ['95% charged after', `<code>${eng(tau * 3, 's')}</code>`],
        ['Settled, 5τ', `<code>${eng(tau * 5, 's')}</code>`],
        ['Corner frequency', `<code>${eng(fc, 'Hz')}</code>`],
        ['At 50 Hz', `<code>${sig(-10 * Math.log10(1 + (50 / fc) ** 2))} dB</code> as a low pass`],
        ['At 1 kHz', `<code>${sig(-10 * Math.log10(1 + (1000 / fc) ** 2))} dB</code> as a low pass`],
        ['As a debounce filter', tau > 0.05 ? 'too slow, over 50 ms' : tau > 0.005 ? 'usable, 5 to 50 ms' : 'too fast to suppress bounce'],
      ])
      + `<pre class="working">τ  = R × C = ${sig(R)} × ${C.toExponential(2)} = <b>${eng(tau, 's')}</b>
f_c = 1 ÷ (2π × τ) = 1 ÷ (2π × ${sig(tau)}) = <b>${eng(fc, 'Hz')}</b>

63% in 1τ  ·  86% in 2τ  ·  95% in 3τ  ·  99% in 5τ</pre>`
      + (fc < 20000 && fc > 20
        ? warn(`A corner at ${eng(fc, 'Hz')} is inside the audio band. As a signal filter that is a deliberate choice;
          as an accident it is why a cable sounds dull.`)
        : '');
  };
  root.addEventListener('input', run);
  root.addEventListener('change', run);
  run();
};

// --- MOSFET and relay driver check ------------------------------------------

TOOLS.mosfet = (root) => {
  root.append(h(`<p class="tool-sub">Whether the switching device you have chosen will be cool or
    destroyed. The gate voltage is the input people get wrong.</p>`));
  root.append(h(`<div class="fields">
    ${field('Load current (A)', inp('mf-i', '5', 'type="number" step="any"'))}
    ${field('Part', sel('mf-p', [
    ['0.022|1.6|4.5', 'IRLZ44N, logic level'],
    ['0.044|3.6|10', 'IRF540N, standard'],
    ['0.0035|2.5|10', 'IRF3205, standard, very low R'],
    ['0.15|1.0|4.5', 'Small logic-level SOT-23'],
  ], '0.022|1.6|4.5'))}
    ${field('Gate drive voltage (V)', inp('mf-g', '5', 'type="number" step="any"'))}
    ${field('Ambient (°C)', inp('mf-a', '30', 'type="number" step="any"'))}
  </div>`));
  const out = h('<div></div>');
  root.append(out);

  const run = () => {
    const I = num($('#mf-i').value, 1);
    const [rdsOn, vth, vfull] = $('#mf-p').value.split('|').map(Number);
    const vg = num($('#mf-g').value, 5);
    const amb = num($('#mf-a').value, 30);

    // On-resistance rises steeply as the gate approaches the threshold.
    let R;
    let state;
    if (vg <= vth) { R = Infinity; state = 'off'; }
    else if (vg >= vfull) { R = rdsOn; state = 'fully on'; }
    else {
      const k = (vg - vth) / (vfull - vth);
      R = rdsOn + 6 * Math.exp(-k * 6.5);
      state = 'partly on';
    }
    const P = Number.isFinite(R) ? I * I * R : 0;
    // A TO-220 with no heatsink is roughly 62 °C per watt.
    const rise = P * 62;
    const junction = amb + rise;

    out.innerHTML = readout(Number.isFinite(R) ? eng(P, 'W') : 'off',
      Number.isFinite(R) ? `${state}, R_DS(on) ${eng(R, 'Ω')}, junction about ${Math.round(junction)} °C with no heatsink`
        : `gate at ${sig(vg)} V is below the ${sig(vth)} V threshold`,
      P > 3 ? 'fail' : P > 1 ? 'warn' : '')
      + table([
        ['Gate voltage', `<code>${sig(vg)} V</code>`],
        ['Threshold V_GS(th)', `<code>${sig(vth)} V</code>`],
        ['Fully on at', `<code>${sig(vfull)} V</code>`],
        ['State', `<code>${state}</code>`],
        ['R_DS(on) in this state', Number.isFinite(R) ? `<code>${eng(R, 'Ω')}</code>` : '—'],
        ['Dissipation', `<code>${eng(P, 'W')}</code>`],
        ['Junction, no heatsink', `<code>${Math.round(junction)} °C</code>`],
        ['Verdict', P > 3 ? 'destroyed in seconds' : P > 1 ? 'needs a heatsink' : P > 0.2 ? 'warm, acceptable' : 'cool'],
      ])
      + `<pre class="working">P = I² × R_DS(on)
  = ${sig(I)}² × ${Number.isFinite(R) ? sig(R) : '∞'}
  = <b>${eng(P, 'W')}</b>

Temperature rise, TO-220 in free air ≈ 62 °C/W
  ${sig(P)} × 62 = ${Math.round(rise)} °C above ambient</pre>`
      + (vg < vfull && vg > vth
        ? warn(`The gate is above the threshold and below full enhancement, so the device is partly on. Half on
          is the worst possible state: it has both voltage across it and current through it at once, and that
          product is heat. Use a logic-level part, or drive the gate to ${sig(vfull)} V with a gate driver.`)
        : P > 1
          ? warn('This needs a heatsink, and the calculation above assumes free air with no airflow.')
          : Number.isFinite(R) ? good('Fully enhanced and comfortable. This is what a correctly chosen switch looks like.') : '')
      + `<p class="tool-note"><b>Every inductive load also needs a flyback diode.</b> A relay coil, a solenoid,
        a valve or a motor will produce hundreds of volts across this device when you switch it off.</p>`;
  };
  root.addEventListener('input', run);
  root.addEventListener('change', run);
  run();
};

// --- Cable voltage drop -----------------------------------------------------

const CABLE_MM2 = [
  [0.5, 36.0], [0.75, 24.0], [1.0, 18.1], [1.5, 12.1], [2.5, 7.41],
  [4.0, 4.61], [6.0, 3.08], [10, 1.83], [16, 1.15], [25, 0.727],
];   // mm², milliohms per metre per conductor

TOOLS.voltdrop = (root) => {
  root.append(h(`<p class="tool-sub">Both conductors count: the current goes out and comes back, so
    the length in the calculation is twice the run. This is the step people miss.</p>`));
  root.append(h(`<div class="fields">
    ${field('Current (A)', inp('vd-i', '10', 'type="number" step="any"'))}
    ${field('One-way run (m)', inp('vd-l', '50', 'type="number" step="any"'))}
    ${field('Conductor size', sel('vd-a', CABLE_MM2.map(([a]) => [a, `${a} mm²`]), 2.5))}
    ${field('Supply voltage (V)', inp('vd-v', '230', 'type="number" step="any"'))}
  </div>`));
  const out = h('<div></div>');
  root.append(out);

  const run = () => {
    const I = num($('#vd-i').value, 1);
    const L = num($('#vd-l').value, 1);
    const a = num($('#vd-a').value, 2.5);
    const V = num($('#vd-v').value, 230);
    const mOhmPerM = CABLE_MM2.find(([x]) => x === a)[1];
    const R = (mOhmPerM / 1000) * L * 2;   // out and back
    const drop = I * R;
    const pct = (drop / V) * 100;
    const loss = I * I * R;

    out.innerHTML = readout(eng(drop, 'V'), `${sig(pct)} per cent of ${V} V, over ${L} m of ${a} mm², wasting ${eng(loss, 'W')} as heat in the cable`,
      pct > 5 ? 'fail' : pct > 3 ? 'warn' : '')
      + table([
        ['Loop resistance', `<code>${eng(R, 'Ω')}</code> (${L} m × 2 conductors)`],
        ['Voltage drop', `<code>${eng(drop, 'V')}</code>`],
        ['As a percentage', `<code>${sig(pct)}%</code>`],
        ['Voltage at the load', `<code>${eng(V - drop, 'V')}</code>`],
        ['Power lost in the cable', `<code>${eng(loss, 'W')}</code>`],
        ['Common limit', '3% for lighting, 5% for other loads'],
        ['Next size up', a < 25 ? `${CABLE_MM2[CABLE_MM2.findIndex(([x]) => x === a) + 1][0]} mm² would give ${sig((I * (CABLE_MM2[CABLE_MM2.findIndex(([x]) => x === a) + 1][1] / 1000) * L * 2 / V) * 100)}%` : '—'],
      ])
      + `<pre class="working">R_loop = ${sig(mOhmPerM)} mΩ/m × ${sig(L)} m × 2 conductors
       = <b>${eng(R, 'Ω')}</b>

V_drop = I × R = ${sig(I)} × ${sig(R)} = <b>${eng(drop, 'V')}</b>
       = ${sig(pct)}% of ${sig(V)} V

P_lost = I² × R = ${sig(I)}² × ${sig(R)} = ${eng(loss, 'W')}</pre>`
      + (pct > 5
        ? warn(`Over 5 per cent. Increase the conductor size, shorten the run, or split the load. At ${eng(loss, 'W')}
          the cable itself is a heater, and heating goes as the square of the current.`)
        : pct > 3
          ? warn('Over 3 per cent, which is the usual limit for lighting circuits. Acceptable for many other loads.')
          : good('Comfortably inside the usual limits.'));
  };
  root.addEventListener('input', run);
  root.addEventListener('change', run);
  run();
};

// --- Wire size and current --------------------------------------------------

TOOLS.wiregauge = (root) => {
  root.append(h(`<p class="tool-sub">Rough current capacity by conductor size, with the derating
    factors that apply in a real installation. Ratings vary by insulation, grouping and method:
    treat this as a sanity check, never as a design.</p>`));
  root.append(h(`<div class="fields">
    ${field('Conductor size', sel('wg-a', CABLE_MM2.map(([a]) => [a, `${a} mm²`]), 2.5))}
    ${field('Installation', sel('wg-m', [
    ['1.0', 'Free air, single cable'], ['0.8', 'Clipped to a surface'],
    ['0.7', 'In conduit or trunking'], ['0.55', 'Coiled on a drum'],
  ], '1.0'))}
    ${field('Ambient (°C)', sel('wg-t', [['1.0', '30 °C'], ['0.94', '35 °C'], ['0.87', '40 °C'], ['0.79', '45 °C']], '1.0'))}
    ${field('Cables grouped together', inp('wg-n', '1', 'type="number" step="1" min="1" max="12"'))}
  </div>`));
  const out = h('<div></div>');
  root.append(out);

  // Free-air current ratings, indicative, for flexible PVC cable.
  const BASE = { 0.5: 6, 0.75: 10, 1.0: 13, 1.5: 16, 2.5: 25, 4.0: 32, 6.0: 40, 10: 63, 16: 80, 25: 100 };

  const run = () => {
    const a = num($('#wg-a').value, 2.5);
    const method = num($('#wg-m').value, 1);
    const temp = num($('#wg-t').value, 1);
    const n = Math.max(1, Math.min(12, Math.round(num($('#wg-n').value, 1))));
    const group = n === 1 ? 1 : n <= 2 ? 0.8 : n <= 4 ? 0.65 : n <= 6 ? 0.57 : 0.48;
    const base = BASE[a];
    const derated = base * method * temp * group;

    out.innerHTML = readout(`${sig(derated)} A`, `${a} mm², derated from a free-air ${base} A`,
      derated < base * 0.6 ? 'warn' : '')
      + table([
        ['Free air rating', `<code>${base} A</code>`],
        ['Installation factor', `<code>×${sig(method)}</code>`],
        ['Ambient factor', `<code>×${sig(temp)}</code>`],
        ['Grouping factor, ${n} cables'.replace('${n}', n), `<code>×${sig(group)}</code>`],
        ['Derated capacity', `<code>${sig(derated)} A</code>`],
        ['Suitable breaker', `<code>${[6, 10, 13, 16, 20, 32, 63].filter((b) => b <= derated).pop() || '—'} A</code>`],
      ])
      + `<pre class="working">I = ${base} × ${sig(method)} × ${sig(temp)} × ${sig(group)}
  = <b>${sig(derated)} A</b></pre>`
      + (method < 0.6
        ? warn('A cable coiled on a drum cannot lose heat, and the derating is severe. Run the drum out fully before loading it: this is the most common cause of a burnt extension reel.')
        : '')
      + `<p class="tool-note"><b>This is a sanity check, not a design.</b> Real ratings depend on the
        insulation type, the installation method, the ambient temperature and the protective device.
        The wiring regulations for your jurisdiction are the authority.</p>`;
  };
  root.addEventListener('input', run);
  root.addEventListener('change', run);
  run();
};

// --- Decibels ---------------------------------------------------------------

TOOLS.db = (root) => {
  root.append(h(`<p class="tool-sub">Two numbers worth having permanently: 6 dB is a factor of two
    in voltage, and 20 dB is a factor of ten.</p>`));
  root.append(h(`<div class="fields">
    ${field('Voltage (V)', inp('db-v', '1.23', 'type="number" step="any"'))}
    ${field('Or level (dBu)', inp('db-u', '4', 'type="number" step="any"'))}
    ${field('Gain to apply (dB)', inp('db-g', '0', 'type="number" step="any"'))}
  </div>`));
  const out = h('<div></div>');
  root.append(out);

  let editing = null;
  const run = (src) => {
    let V;
    if (src === 'dbu') {
      const dbu = num($('#db-u').value, 4);
      V = 0.775 * 10 ** (dbu / 20);
      $('#db-v').value = sig(V, 4);
    } else {
      V = num($('#db-v').value, 1.23);
      $('#db-u').value = sig(20 * Math.log10(V / 0.775), 4);
    }
    const gain = num($('#db-g').value, 0);
    const after = V * 10 ** (gain / 20);
    const dbu = 20 * Math.log10(V / 0.775);
    const dbv = 20 * Math.log10(V / 1.0);

    out.innerHTML = readout(eng(after, 'V'), gain === 0 ? 'no gain applied' : `after ${sig(gain)} dB of gain, from ${eng(V, 'V')}`)
      + table([
        ['Voltage', `<code>${eng(V, 'V')}</code>`],
        ['dBu, referenced to 0.775 V', `<code>${sig(dbu)} dBu</code>`],
        ['dBV, referenced to 1 V', `<code>${sig(dbv)} dBV</code>`],
        ['Where this sits', V < 0.06 ? 'microphone level' : V < 0.5 ? 'consumer line level' : V < 8 ? 'professional line level' : 'loudspeaker level'],
        ['After the gain', `<code>${eng(after, 'V')}</code>, ${sig(dbu + gain)} dBu`],
        ['Voltage ratio', `<code>×${sig(10 ** (gain / 20))}</code>`],
        ['Power ratio', `<code>×${sig(10 ** (gain / 10))}</code>`],
      ])
      + `<pre class="working">dBu = 20 × log10(V ÷ 0.775)
    = 20 × log10(${sig(V)} ÷ 0.775)
    = <b>${sig(dbu)} dBu</b>

Gain of ${sig(gain)} dB → voltage × 10^(${sig(gain)}/20) = ×${sig(10 ** (gain / 20))}

Reference points:  +4 dBu = 1.23 V (professional)
                  −10 dBV = 0.316 V (consumer)
                    6 dB = ×2 in voltage
                   20 dB = ×10 in voltage</pre>`;
  };
  $('#db-v').addEventListener('input', () => run('v'));
  $('#db-u').addEventListener('input', () => run('dbu'));
  $('#db-g').addEventListener('input', () => run('v'));
  run('v');
};

// --- Frequency, period, wavelength ------------------------------------------

TOOLS.freq = (root) => {
  root.append(h(`<p class="tool-sub">Measure one bit or one cycle on a scope and this gives you the
    rest. The cable length row is how a fault locator works.</p>`));
  root.append(h(`<div class="fields">
    ${field('Frequency (Hz)', inp('fq-f', '1000', 'type="number" step="any"'))}
    ${field('Or period (µs)', inp('fq-t', '1000', 'type="number" step="any"'))}
  </div>`));
  const out = h('<div></div>');
  root.append(out);

  const run = (src) => {
    let f;
    if (src === 't') {
      const us = num($('#fq-t').value, 1000);
      f = 1 / (us * 1e-6);
      $('#fq-f').value = sig(f, 5);
    } else {
      f = num($('#fq-f').value, 1000);
      $('#fq-t').value = sig((1 / f) * 1e6, 5);
    }
    if (!(f > 0)) {
      out.innerHTML = readout('Enter a frequency above zero', '', 'fail');
      return;
    }
    const T = 1 / f;
    const soundWave = 343 / f;
    const cableDist = (2e8 * T) / 2;   // one-way distance a reflection could come from

    out.innerHTML = readout(eng(f, 'Hz'), `period ${eng(T, 's')}`)
      + table([
        ['Frequency', `<code>${eng(f, 'Hz')}</code>`],
        ['Period', `<code>${eng(T, 's')}</code>`],
        ['Sound wavelength in air', `<code>${eng(soundWave, 'm')}</code>`],
        ['Cable length for a reflection at this delay', `<code>${eng(cableDist, 'm')}</code>`],
        ['If this is a serial bit', `<code>${eng(f, 'bit/s')}</code>`],
        ['Recognise it?', recognise(f)],
      ])
      + `<pre class="working">T = 1 ÷ f = 1 ÷ ${sig(f)} = <b>${eng(T, 's')}</b>

Sound wavelength = 343 ÷ ${sig(f)} = ${eng(soundWave, 'm')}
Cable round trip at two thirds light speed:
  distance = (2 × 10⁸ × ${sig(T)}) ÷ 2 = ${eng(cableDist, 'm')}</pre>`;
  };

  const recognise = (f) => {
    const near = (x, pct = 6) => Math.abs(f - x) / x < pct / 100;
    if (near(50)) return 'mains, 50 Hz. Hum, induction or a ground loop';
    if (near(60)) return 'mains, 60 Hz';
    if (near(100)) return 'rectifier ripple on a 50 Hz supply. A tired smoothing capacitor';
    if (near(120)) return 'rectifier ripple on a 60 Hz supply';
    if (near(250000)) return 'DMX512 bit rate';
    if (near(31250)) return 'MIDI bit rate';
    if (near(44)) return 'DMX universe refresh rate';
    if (f > 20000 && f < 500000) return 'switch-mode supply switching frequency';
    return '—';
  };

  $('#fq-f').addEventListener('input', () => run('f'));
  $('#fq-t').addEventListener('input', () => run('t'));
  run('f');
};

// --- DMX timing -------------------------------------------------------------

TOOLS.dmx = (root) => {
  root.append(h(`<p class="tool-sub">Packet time and refresh rate for a given channel count. Sending
    fewer channels genuinely refreshes faster, which is why some consoles offer a limit.</p>`));
  root.append(h(`<div class="fields">
    ${field('Slots sent', inp('dx-n', '512', 'type="number" step="1" min="1" max="512"'))}
    ${field('Break length (µs)', inp('dx-b', '92', 'type="number" step="any"'))}
    ${field('Mark after break (µs)', inp('dx-m', '12', 'type="number" step="any"'))}
  </div>`));
  const out = h('<div></div>');
  root.append(out);

  const run = () => {
    const n = Math.max(1, Math.min(512, Math.round(num($('#dx-n').value, 512))));
    const brk = Math.max(88, num($('#dx-b').value, 92));
    const mab = Math.max(8, num($('#dx-m').value, 12));
    const slotUs = 44;
    const totalUs = brk + mab + (n + 1) * slotUs;
    const rate = 1e6 / totalUs;

    out.innerHTML = readout(`${sig(rate)} Hz`, `${n} slots in ${eng(totalUs / 1e6, 's')} per packet`,
      rate < 30 ? 'warn' : '')
      + table([
        ['Bit rate', '<code>250 kbit/s</code>, so 4 µs per bit'],
        ['One slot with framing', '<code>44 µs</code> (1 start + 8 data + 2 stop bits)'],
        ['Break', `<code>${sig(brk)} µs</code> (minimum 92)`],
        ['Mark after break', `<code>${sig(mab)} µs</code> (minimum 12)`],
        ['Packet time', `<code>${sig(totalUs)} µs</code>`],
        ['Refresh rate', `<code>${sig(rate)} Hz</code>`],
        ['Compared to a full universe', `<code>${sig(rate / 44.1)}×</code> faster`],
      ])
      + `<pre class="working">Packet = break + MAB + (slots + start code) × 44 µs
       = ${sig(brk)} + ${sig(mab)} + (${n} + 1) × 44
       = <b>${sig(totalUs)} µs</b>

Refresh = 1 ÷ ${sig(totalUs / 1e6)} = <b>${sig(rate)} Hz</b></pre>`
      + (n < 512 ? good(`At ${n} slots you are refreshing ${sig(rate / 44.1)} times faster than a full universe, which is
        real and visible on fast moving-light chases.`) : '');
  };
  root.addEventListener('input', run);
  root.addEventListener('change', run);
  run();
};

// --- Universe and address planner -------------------------------------------

TOOLS.universe = (root) => {
  root.append(h(`<p class="tool-sub">How many fixtures fit, where each one starts, and which one is
    the fixture that does not fit. The off-by-one at 512 is a real fault from Class 10.</p>`));
  root.append(h(`<div class="fields">
    ${field('Channels per fixture', inp('un-f', '16', 'type="number" step="1" min="1" max="512"'))}
    ${field('Number of fixtures', inp('un-n', '24', 'type="number" step="1" min="1"'))}
    ${field('First address', inp('un-s', '1', 'type="number" step="1" min="1" max="512"'))}
  </div>`));
  const out = h('<div></div>');
  root.append(out);

  const run = () => {
    const fp = Math.max(1, Math.round(num($('#un-f').value, 16)));
    const n = Math.max(1, Math.round(num($('#un-n').value, 24)));
    const start = Math.max(1, Math.round(num($('#un-s').value, 1)));
    const perUniverse = Math.floor((513 - start) / fp);
    const universes = Math.ceil(n / Math.max(1, Math.floor(512 / fp)));
    const lastInFirst = start + Math.min(n, perUniverse) * fp - 1;
    const wasted = 512 - (start - 1) - Math.min(n, perUniverse) * fp;

    const rows = [];
    for (let k = 0; k < Math.min(n, 12); k++) {
      const idxInUni = k % Math.max(1, Math.floor(512 / fp));
      const uni = Math.floor(k / Math.max(1, Math.floor(512 / fp))) + 1;
      const addr = (uni === 1 ? start : 1) + idxInUni * fp;
      const end = addr + fp - 1;
      rows.push([`Fixture ${k + 1}`, `universe ${uni}, address <code>${addr}</code>–<code>${end}</code>${end > 512 ? ' <b>does not fit</b>' : ''}`]);
    }
    if (n > 12) rows.push(['…', `${n - 12} more`]);

    out.innerHTML = readout(`${universes} universe${universes > 1 ? 's' : ''}`,
      `${n} fixtures at ${fp} channels each, starting at ${start}`)
      + table([
        ['Fixtures per universe', `<code>${Math.floor(512 / fp)}</code>`],
        ['Fit in this universe from address ' + start, `<code>${perUniverse}</code>`],
        ['Last address used in universe 1', `<code>${Math.min(lastInFirst, 512)}</code>`],
        ['Channels wasted at the end', `<code>${Math.max(0, wasted)}</code>`],
        ['Universes needed', `<code>${universes}</code>`],
      ])
      + table(rows)
      + `<pre class="working">Fixtures per universe = floor(512 ÷ ${fp}) = <b>${Math.floor(512 / fp)}</b>
Universes needed      = ceil(${n} ÷ ${Math.floor(512 / fp)}) = <b>${universes}</b>

Address of fixture k  = start + (k − 1) × ${fp}
Last channel used     = address + ${fp} − 1

The check that catches the off-by-one:
  address + footprint − 1 must be 512 or less</pre>`
      + (start + fp - 1 > 512
        ? warn(`A fixture at address ${start} needing ${fp} channels runs past 512. It will partly respond and its
          last attributes will be dead, which looks like a broken fixture rather than an addressing error.`)
        : wasted > 0 && wasted < fp
          ? good(`${wasted} channels left at the end of the universe, which is fewer than one fixture needs. That is normal.`)
          : '');
  };
  root.addEventListener('input', run);
  root.addEventListener('change', run);
  run();
};

// --- PWM --------------------------------------------------------------------

TOOLS.pwm = (root) => {
  root.append(h(`<p class="tool-sub">Duty, frequency, resolution, and whether any camera in the room
    will see it. On a microcontroller, frequency and resolution trade against each other.</p>`));
  root.append(h(`<div class="fields">
    ${field('Duty cycle (%)', inp('pw2-d', '50', 'type="number" step="any" min="0" max="100"'))}
    ${field('Frequency (Hz)', inp('pw2-f', '490', 'type="number" step="any"'))}
    ${field('Supply (V)', inp('pw2-v', '12', 'type="number" step="any"'))}
    ${field('Timer clock (MHz)', inp('pw2-c', '16', 'type="number" step="any"'))}
  </div>`));
  const out = h('<div></div>');
  root.append(out);

  const run = () => {
    const d = Math.min(100, Math.max(0, num($('#pw2-d').value, 50)));
    const f = Math.max(1, num($('#pw2-f').value, 490));
    const V = num($('#pw2-v').value, 12);
    const clk = Math.max(0.001, num($('#pw2-c').value, 16)) * 1e6;
    const T = 1 / f;
    const onTime = T * (d / 100);
    const steps = Math.floor(clk / f);
    const bits = Math.log2(steps);
    const perceived = (d / 100) ** (1 / 2.2) * 100;

    out.innerHTML = readout(`${sig(d)}%`, `${eng(onTime, 's')} on, ${eng(T - onTime, 's')} off, average ${eng(V * d / 100, 'V')}`)
      + table([
        ['Period', `<code>${eng(T, 's')}</code>`],
        ['On time', `<code>${eng(onTime, 's')}</code>`],
        ['Average voltage', `<code>${eng(V * d / 100, 'V')}</code>`],
        ['Timer steps available', `<code>${steps}</code>, about ${sig(bits)} bits`],
        ['Smallest duty step', `<code>${sig(100 / steps)}%</code>`],
        ['Perceived brightness', `<code>about ${sig(perceived)}%</code> (roughly a 2.2 gamma)`],
        ['Visible flicker?', f < 100 ? 'yes, especially in peripheral vision' : 'no'],
        ['Audible whine?', f >= 100 && f < 20000 ? 'likely, from motors and inductors' : 'no'],
        ['Safe for camera?', f > 20000 ? 'yes' : f > 2000 ? 'usually, but check on the actual camera' : 'no, expect rolling bands'],
      ])
      + `<pre class="working">Period   = 1 ÷ ${sig(f)} = ${eng(T, 's')}
On time  = ${eng(T, 's')} × ${sig(d)}% = ${eng(onTime, 's')}
Average  = ${sig(V)} × ${sig(d)}% = ${eng(V * d / 100, 'V')}

Resolution from a ${sig(clk / 1e6)} MHz timer:
  steps = ${sig(clk / 1e6)}e6 ÷ ${sig(f)} = <b>${steps}</b> (${sig(bits)} bits)</pre>`
      + (bits < 8
        ? warn(`Only ${sig(bits)} bits of resolution at this frequency. Raising the PWM frequency costs resolution
          on a fixed timer clock, and below 8 bits a slow fade will visibly step.`)
        : f < 100
          ? warn('Below about 100 Hz this flickers visibly, and it will be far worse on camera than to the eye.')
          : f < 20000
            ? warn('In the audible band. Motors and inductors will whine at this frequency.')
            : good('Above hearing and above any camera shutter, with useful resolution.'));
  };
  root.addEventListener('input', run);
  root.addEventListener('change', run);
  run();
};

// --- ADC scaling ------------------------------------------------------------

TOOLS.adc = (root) => {
  root.append(h(`<p class="tool-sub">What a reading means, and what the smallest change you can
    detect actually is. Resolution is not accuracy.</p>`));
  root.append(h(`<div class="fields">
    ${field('Resolution', sel('ad-b', [[8, '8-bit, 0–255'], [10, '10-bit, 0–1023'], [12, '12-bit, 0–4095'], [16, '16-bit, 0–65535']], 10))}
    ${field('Reference voltage (V)', inp('ad-r', '5', 'type="number" step="any"'))}
    ${field('Reading', inp('ad-n', '512', 'type="number" step="1" min="0"'))}
    ${field('Sensor span, low', inp('ad-lo', '0', 'type="number" step="any"'), 'The real-world value at 0 V')}
    ${field('Sensor span, high', inp('ad-hi', '100', 'type="number" step="any"'), 'The real-world value at full scale')}
  </div>`));
  const out = h('<div></div>');
  root.append(out);

  const run = () => {
    const bits = num($('#ad-b').value, 10);
    const vref = num($('#ad-r').value, 5);
    const maxN = 2 ** bits - 1;
    const n = Math.min(maxN, Math.max(0, Math.round(num($('#ad-n').value, 0))));
    const lo = num($('#ad-lo').value, 0);
    const hi = num($('#ad-hi').value, 100);
    const V = (n / maxN) * vref;
    const step = vref / (maxN + 1);
    const value = lo + (n / maxN) * (hi - lo);
    const valueStep = Math.abs((hi - lo) / maxN);

    out.innerHTML = readout(`${sig(value)}`, `from a reading of ${n} at ${eng(V, 'V')}, on a ${bits}-bit converter`)
      + table([
        ['Reading', `<code>${n}</code> of ${maxN}`],
        ['Voltage', `<code>${eng(V, 'V')}</code>`],
        ['One step', `<code>${eng(step, 'V')}</code>`],
        ['Scaled value', `<code>${sig(value)}</code>`],
        ['Smallest detectable change', `<code>${sig(valueStep)}</code>`],
        ['Max source impedance', '<code>about 10 kΩ</code>, or the reading will be low'],
        ['Averaging 16 readings', `noise reduced by about <code>4×</code>, at no cost`],
      ])
      + `<pre class="working">V     = (reading ÷ ${maxN}) × V_ref
      = (${n} ÷ ${maxN}) × ${sig(vref)}
      = <b>${eng(V, 'V')}</b>

step  = ${sig(vref)} ÷ ${maxN + 1} = <b>${eng(step, 'V')}</b>

value = ${sig(lo)} + (${n} ÷ ${maxN}) × (${sig(hi)} − ${sig(lo)})
      = <b>${sig(value)}</b></pre>`
      + `<p class="tool-note"><b>Resolution is not accuracy.</b> If the reference is the 5 V USB supply and it
        sags to 4.7 V when a motor starts, every reading changes by six per cent while nothing physical
        has changed. Reference stability dominates long before bit depth does.</p>`;
  };
  root.addEventListener('input', run);
  root.addEventListener('change', run);
  run();
};

// --- Serial data rate -------------------------------------------------------

TOOLS.datarate = (root) => {
  root.append(h(`<p class="tool-sub">How long a message takes on the wire, which is what decides
    whether a protocol can meet a deadline.</p>`));
  root.append(h(`<div class="fields">
    ${field('Bit rate', sel('dr-b', [
    [250000, 'DMX512, 250 kbit/s'], [31250, 'MIDI, 31.25 kbit/s'],
    [9600, '9600 baud'], [115200, '115200 baud'], [1000000, '1 Mbit/s'],
  ], 250000))}
    ${field('Bytes to send', inp('dr-n', '513', 'type="number" step="1" min="1"'))}
    ${field('Framing bits per byte', sel('dr-f', [[10, '10 (1 start, 8 data, 1 stop)'], [11, '11 (1 start, 8 data, 2 stop)']], 11))}
  </div>`));
  const out = h('<div></div>');
  root.append(out);

  const run = () => {
    const rate = num($('#dr-b').value, 250000);
    const n = Math.max(1, Math.round(num($('#dr-n').value, 1)));
    const frame = num($('#dr-f').value, 10);
    const bitTime = 1 / rate;
    const total = (n * frame) / rate;

    out.innerHTML = readout(eng(total, 's'), `${n} bytes at ${eng(rate, 'bit/s')}, ${frame} bits each`)
      + table([
        ['One bit', `<code>${eng(bitTime, 's')}</code>`],
        ['One byte with framing', `<code>${eng(bitTime * frame, 's')}</code>`],
        ['Whole message', `<code>${eng(total, 's')}</code>`],
        ['Messages per second', `<code>${sig(1 / total)}</code>`],
        ['Effective data rate', `<code>${eng((n * 8) / total, 'bit/s')}</code> of payload`],
        ['Framing overhead', `<code>${sig(((frame - 8) / frame) * 100)}%</code>`],
      ])
      + `<pre class="working">bit time = 1 ÷ ${sig(rate)} = ${eng(bitTime, 's')}
message  = ${n} bytes × ${frame} bits × ${eng(bitTime, 's')}
         = <b>${eng(total, 's')}</b></pre>`;
  };
  root.addEventListener('input', run);
  root.addEventListener('change', run);
  run();
};

// ============================================================================
// Mount
// ============================================================================

for (const node of document.querySelectorAll('.tool[data-tool]')) {
  if (node.dataset.mounted) continue;
  const fn = TOOLS[node.dataset.tool];
  if (!fn) { node.remove(); continue; }
  node.dataset.mounted = '1';
  try {
    fn(node);
  } catch (err) {
    console.error('tool failed:', node.dataset.tool, err);
    node.remove();
  }
}
