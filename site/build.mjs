// Static site generator for Electronics for Theatre.
//
// Reads the authored markdown one directory up (single source of truth, no
// duplication), renders it, and emits a fully static site into ./public.
// Zero dependencies on purpose: Vercel runs `node build.mjs` with no install
// step, so there is nothing to go stale and nothing to break in CI.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { render, esc, slugify } from './lib/markdown.mjs';
import { selfTest, readiness, faultScenarios, benchChecks } from './data/interactive.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
// A deploy tree that carries its own copy under ./content wins, so the site can
// also be deployed standalone without the rest of the repo.
const LOCAL = path.join(HERE, 'content');
const SRC = fs.existsSync(LOCAL) ? LOCAL : path.resolve(HERE, '..');
const OUT = path.join(HERE, 'public');

const read = (f) => fs.readFileSync(path.join(SRC, f), 'utf8');

// ---------------------------------------------------------------------------
// Course shape
// ---------------------------------------------------------------------------
//
// Sixteen classes of four hours: 64 hours. The original brief alternated a
// theory day with a practical day. That is not how the skill is actually
// acquired: a student who hears about impedance on Tuesday and touches a cable
// on Thursday has forgotten the reason by the time the iron is hot. So every
// class carries both. `bench` is the share of the four hours that is hands on
// hardware, and it is stated on the page because it changes what you bring.
//
// The classes still pair up. Each unit is two classes: the first opens the
// idea and gets it onto the bench, the second builds something that only works
// if the idea was understood. That pairing is what the `unit` field carries.

const UNITS = [
  { n: 1, title: 'Electricity, and proving it', classes: [1, 2] },
  { n: 2, title: 'Parts, and joining them', classes: [3, 4] },
  { n: 3, title: 'Loads and switching', classes: [5, 6] },
  { n: 4, title: 'Analogue signal', classes: [7, 8] },
  { n: 5, title: 'Data, protocols and rigs', classes: [9, 10] },
  { n: 6, title: 'Microcontrollers', classes: [11, 12] },
  { n: 7, title: 'Sensors and actuators', classes: [13, 14] },
  { n: 8, title: 'Safety, faults and the capstone', classes: [15, 16] },
];

const CLASSES = [
  {
    n: 1, slug: 'what-electricity-does', file: '01-what-electricity-does.md',
    title: 'What Electricity Does in a Theatre',
    strap: 'Voltage, current, resistance and power, defined by what they do to a show rather than by their formulae.',
    bench: 0.4,
    tools: ['ohm', 'power', 'series'], practice: ['myths', 'drill', 'selftest'],
  },
  {
    n: 2, slug: 'measure-test-prove', file: '02-measure-test-prove.md',
    title: 'Measure, Test, Prove',
    strap: 'The multimeter as an instrument of argument: what each mode really asks the circuit, and how to be sure rather than confident.',
    bench: 0.7,
    tools: ['ohm', 'divider', 'voltdrop'], practice: ['myths', 'drill', 'faults', 'selftest'],
  },
  {
    n: 3, slug: 'components-and-connectors', file: '03-components-and-connectors.md',
    title: 'Components and Connectors',
    strap: 'What each part does when you ask it for something it cannot give, and why the industry settled on the connectors it did.',
    bench: 0.5,
    tools: ['rescode', 'led', 'divider', 'rc'], practice: ['myths', 'parts', 'drill', 'selftest'],
  },
  {
    n: 4, slug: 'soldering-and-fabrication', file: '04-soldering-and-fabrication.md',
    title: 'Soldering and Fabrication',
    strap: 'Heat, wetting and strain relief. A joint fails mechanically long before it fails electrically.',
    bench: 0.8,
    tools: ['rescode', 'voltdrop', 'wiregauge'], practice: ['myths', 'drill', 'selftest'],
  },
  {
    n: 5, slug: 'loads-switching-isolation', file: '05-loads-switching-isolation.md',
    title: 'Loads, Switching and Isolation',
    strap: 'Relays, transistors and opto-isolators: how a 5 V thought turns into a 230 V action without either killing the other.',
    bench: 0.45,
    tools: ['power', 'led', 'mosfet', 'wiregauge'], practice: ['myths', 'drill', 'selftest'],
  },
  {
    n: 6, slug: 'build-a-driver-board', file: '06-build-a-driver-board.md',
    title: 'Build a Driver Board',
    strap: 'One board, built and proved: logic in, protected switching out, and a flyback diode you can explain.',
    bench: 0.85,
    tools: ['mosfet', 'led', 'power', 'rescode'], practice: ['myths', 'faults', 'selftest'],
  },
  {
    n: 7, slug: 'analogue-impedance-grounding', file: '07-analogue-impedance-grounding.md',
    title: 'Analogue Signal, Impedance and Grounding',
    strap: 'Levels, balanced lines and the ground loop: why a working system hums the moment two boxes meet.',
    bench: 0.4,
    tools: ['db', 'divider', 'rc', 'voltdrop'], practice: ['myths', 'drill', 'selftest'],
  },
  {
    n: 8, slug: 'hum-hunting-and-scope', file: '08-hum-hunting-and-scope.md',
    title: 'Hum Hunting and Scope Work',
    strap: 'The oscilloscope as the first instrument that shows you time, and a method for finding hum that does not involve guessing.',
    bench: 0.75,
    tools: ['db', 'rc', 'freq'], practice: ['myths', 'faults', 'drill', 'selftest'],
  },
  {
    n: 9, slug: 'data-protocols-networks', file: '09-data-protocols-networks.md',
    title: 'Data, Protocols and Networks',
    strap: 'RS-485, DMX512, MIDI, OSC and sACN. Four wires, one differential pair, and the reason terminators exist.',
    bench: 0.4,
    tools: ['dmx', 'universe', 'freq', 'datarate'], practice: ['myths', 'drill', 'selftest'],
  },
  {
    n: 10, slug: 'build-and-break-a-rig', file: '10-build-and-break-a-rig.md',
    title: 'Build and Break a Rig',
    strap: 'Build a working DMX and network rig, then break it deliberately, one fault at a time, and learn what each failure looks like.',
    bench: 0.85,
    tools: ['dmx', 'universe', 'voltdrop'], practice: ['faults', 'myths', 'selftest'],
  },
  {
    n: 11, slug: 'microcontrollers', file: '11-microcontrollers.md',
    title: 'Microcontrollers',
    strap: 'A chip that does one thing forever, very fast. Pins, the ADC, PWM, timing, and why delay() ruins a show.',
    bench: 0.5,
    tools: ['pwm', 'adc', 'led', 'freq'], practice: ['myths', 'drill', 'selftest'],
  },
  {
    n: 12, slug: 'program-a-prop', file: '12-program-a-prop.md',
    title: 'Program a Prop',
    strap: 'Firmware for something that has to work on the eightieth performance, not the first: debounce, state, and a safe power-up.',
    bench: 0.85,
    tools: ['pwm', 'adc', 'dmx'], practice: ['faults', 'myths', 'selftest'],
  },
  {
    n: 13, slug: 'sensors-and-actuators', file: '13-sensors-and-actuators.md',
    title: 'Sensors and Actuators',
    strap: 'How the machine finds out where something is, and how it makes something move without being the thing that hurts somebody.',
    bench: 0.5,
    tools: ['adc', 'divider', 'mosfet', 'power'], practice: ['myths', 'parts', 'drill', 'selftest'],
  },
  {
    n: 14, slug: 'build-a-triggered-effect', file: '14-build-a-triggered-effect.md',
    title: 'Build a Triggered Effect',
    strap: 'Sensor to decision to actuator, on a cue, repeatably, with a defined behaviour when it loses power halfway.',
    bench: 0.85,
    tools: ['pwm', 'adc', 'mosfet', 'dmx'], practice: ['faults', 'myths', 'selftest'],
  },
  {
    n: 15, slug: 'safety-systems-and-faults', file: '15-safety-systems-and-faults.md',
    title: 'Safety Systems and Fault-Finding',
    strap: 'Emergency stop, interlocks, dual channel monitoring and isolation, then a method for finding faults that works when you are tired.',
    bench: 0.5,
    tools: ['power', 'wiregauge', 'voltdrop', 'ohm'], practice: ['myths', 'faults', 'drill', 'selftest'],
  },
  {
    n: 16, slug: 'capstone', file: '16-capstone.md',
    title: 'Capstone and Fault-Finding Exam',
    strap: 'Build it, prove it, document it, then find three faults in somebody else’s under time pressure.',
    bench: 0.9,
    tools: ['ohm', 'power', 'mosfet', 'dmx', 'voltdrop'], practice: ['faults', 'selftest'],
  },
];

const HOURS = 4;
const TOTAL_HOURS = CLASSES.length * HOURS;

for (const c of CLASSES) {
  const unit = UNITS.find((u) => u.classes.includes(c.n));
  if (!unit) throw new Error(`course: Class ${c.n} belongs to no unit`);
  c.unit = unit;
  c.benchHours = Math.round(c.bench * HOURS * 2) / 2;
}
for (const u of UNITS) {
  for (const n of u.classes) {
    if (!CLASSES.some((c) => c.n === n)) throw new Error(`course: unit ${u.n} names Class ${n}, which does not exist`);
  }
}

// ---------------------------------------------------------------------------
// Markdown section helpers
// ---------------------------------------------------------------------------

// Slice a markdown document at an h2 whose text starts with `key`.
function sliceSection(md, key) {
  const lines = md.split('\n');
  const start = lines.findIndex((l) => l.startsWith('## ') && l.slice(3).trim().startsWith(key));
  if (start === -1) return '';
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i].startsWith('## ')) { end = i; break; }
  }
  return lines.slice(start + 1, end).join('\n').replace(/\n---\s*$/, '').trim();
}

function removeSection(md, key) {
  const lines = md.split('\n');
  const start = lines.findIndex((l) => l.startsWith('## ') && l.slice(3).trim().startsWith(key));
  if (start === -1) return md;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i].startsWith('## ')) { end = i; break; }
  }
  return [...lines.slice(0, start), ...lines.slice(end)].join('\n');
}

// ---------------------------------------------------------------------------
// Flashcards generated from the per-class reference tables, so a card can never
// drift out of sync with what the class actually teaches.
// ---------------------------------------------------------------------------

// `code`, **bold** and *italic* inside a table cell have to be rendered or the
// card shows its own backticks and asterisks.
const inlineMd = (t) => esc(t)
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
  .replace(/(^|[^*])\*([^*]+)\*/g, '$1<i>$2</i>');

function twoColumnCards(md, tag) {
  const cards = [];
  const rows = md.match(/^\|[^\n]*\|$/gm) || [];
  for (const row of rows) {
    const cells = row.replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
    if (cells.length !== 2) continue;
    if (/^:?-+:?$/.test(cells[0]) || /^:?-+:?$/.test(cells[1])) continue;
    if (/^(Thing|Quantity|English|Term|#)$/i.test(cells[0])) continue;
    if (!cells[0] || !cells[1]) continue;
    cards.push({ q: inlineMd(cells[0]), a: inlineMd(cells[1]), tag });
  }
  return cards;
}

function glossaryCards(md) {
  const cards = [];
  let section = '';
  for (const line of md.split('\n')) {
    const h = /^##\s+(.*)$/.exec(line);
    if (h) section = h[1].replace(/^[A-Z]\.\s*/, '').trim();
    if (!/^\|/.test(line)) continue;
    const cells = line.replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
    if (cells.length !== 3) continue;
    if (/^:?-+:?$/.test(cells[0])) continue;
    if (cells[0] === 'English') continue;
    if (!cells[0] || !cells[2]) continue;
    cards.push({ q: cells[0], zh: cells[1], a: cells[2], tag: section });
  }
  return cards;
}

// The "Common misconceptions" bullets are uniform: `- **"claim"** correction`.
// Parsing them is the whole content pipeline for Spot the myth, so a reworded
// bullet must fail the build loudly rather than silently vanish from the deck.
function parseMyths(md, n, file) {
  const sec = sliceSection(md, 'Common misconceptions');
  if (!sec) return [];
  const out = [];
  const items = sec.split(/\n(?=-\s)/);
  for (const item of items) {
    const text = item.replace(/^-\s+/, '').replace(/\n\s+/g, ' ').trim();
    if (!text) continue;
    const m = /^\*\*[“"](.+?)[”"]\*\*\s+(.+)$/s.exec(text);
    if (!m) throw new Error(`${file}: misconception bullet is not \`- **"claim"** correction\`:\n  ${text.slice(0, 90)}`);
    out.push({ cls: n, claim: m[1].trim(), fix: m[2].trim() });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Build stamp
// ---------------------------------------------------------------------------

function buildStamp() {
  const env = process.env;
  let sha = env.VERCEL_GIT_COMMIT_SHA || '';
  if (!sha) {
    try {
      sha = execSync('git rev-parse HEAD', { cwd: HERE, stdio: ['ignore', 'pipe', 'ignore'] })
        .toString().trim();
    } catch { sha = ''; }
  }
  return {
    commit: sha ? sha.slice(0, 7) : 'unknown',
    branch: env.VERCEL_GIT_COMMIT_REF || null,
    builtAt: new Date().toISOString(),
    source: env.VERCEL_GIT_COMMIT_SHA ? 'git' : env.VERCEL ? 'manual upload' : 'local',
  };
}
const STAMP = buildStamp();

// ---------------------------------------------------------------------------
// Page shell
// ---------------------------------------------------------------------------

const AUTHOR = {
  name: 'Migu Mianizt Leung',
  links: [
    ['mi2.dev', 'https://www.mi2.dev'],
    ['LinkedIn', 'https://www.linkedin.com/in/mi2dev/'],
    ['Medium', 'https://medium.com/@mi2dev'],
    ['Instagram', 'https://instagram.com/mi2.dev'],
  ],
  work: [
    ['showstack', 'https://showstack-inky.vercel.app/', 'the open index of live entertainment technology'],
    ['Computer Systems for Theatre', 'https://github.com/deliseph/theatre-computer-systems', 'the sibling module, on networks and show control'],
  ],
};

const NAV_GROUPS = [
  ['Before a class', [
    ['/prepare', 'Prepare', 'What to do before each class'],
    ['/foundations', 'Foundations', 'The arithmetic every class assumes'],
    ['/toolkit', 'Your kit', 'What to own, what to borrow'],
  ]],
  ['While you work', [
    ['/tools', 'Calculators', 'Every calculation, with the working shown'],
    ['/practice', 'Practice', 'Drills, claims, component ID, fault sim'],
    ['/map', 'The map', 'Every figure and card, and the ones you have opened'],
  ]],
  ['Look it up', [
    ['/safety', 'Safety card', 'The rules that are not negotiable'],
    ['/numbers', 'Numbers', 'The reference card, examinable'],
    ['/glossary', 'Glossary', 'Bilingual term list'],
  ]],
  ['Going further', [
    ['/next', 'Where to go next', 'Courses, standards, books and kit'],
  ]],
];

function shell({ title, desc, body, active = '', bodyClass = '', bodyAttrs = '', scripts = [] }) {
  const navClasses = UNITS.map((u) => `<p class="side-u">Unit ${u.n} · ${esc(u.title)}</p>` +
    u.classes.map((n) => {
      const c = CLASSES.find((x) => x.n === n);
      return `<a class="nv${active === `class-${c.n}` ? ' on' : ''}" href="/class/${c.n}">
        <span class="nv-n">${c.n}</span>
        <span class="nv-t">${esc(c.title)}</span>
        </a>`;
    }).join('')).join('');

  const navRes = NAV_GROUPS.map(
    ([group, items]) => `<p class="side-g">${esc(group)}</p>${items.map(
      ([href, label, d]) => `<a class="nv nv-res${active === href ? ' on' : ''}" href="${href}">
        <span class="nv-t">${esc(label)}</span>
        <span class="nv-d">${esc(d)}</span></a>`
    ).join('')}`
  ).join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} · Electronics for Theatre</title>
<meta name="description" content="${esc(desc || '')}">
<meta name="color-scheme" content="dark light">
<link rel="stylesheet" href="/assets/styles.css?v=${STAMP.commit}">
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#0d0f13"/>' +
    '<path d="M18.5 4 9 17.5h5.5L13 28l9.5-13.5H17z" fill="#f0a038"/></svg>'
  )}">
</head>
<body class="${bodyClass}"${bodyAttrs}>
<a class="skip" href="#main">Skip to content</a>

<header class="topbar">
  <button class="icon-btn menu-btn" aria-label="Menu" aria-expanded="false">☰</button>
  <a class="brand" href="/">
    <span class="brand-mark" aria-hidden="true"></span>
    <span class="brand-txt"><b>Electronics</b><i>for Theatre &amp; Live Performance</i></span>
  </a>
  <div class="topbar-sp"></div>
  <button class="search-open icon-btn" aria-label="Search">
    <span class="sr">Search</span>⌕<kbd>/</kbd>
  </button>
  <button class="theme-btn icon-btn" aria-label="Toggle theme">◐</button>
</header>

<div class="layout">
  <nav class="side" aria-label="Course navigation">
    <p class="side-h">Sixteen classes</p>
    ${navClasses}
    ${navRes}
    <div class="side-foot">
      <p>Sixteen classes of four hours. Every one of them has an idea and a bench, because a student
      who hears about impedance on Tuesday and touches a cable on Thursday has forgotten why by
      the time the iron is hot.</p>
      <p class="side-by">Built by <a href="${AUTHOR.links[0][1]}" rel="noopener" target="_blank">${AUTHOR.name}</a>
        · ${AUTHOR.links.slice(1).map(([n, u]) => `<a href="${u}" rel="noopener" target="_blank">${n}</a>`).join(' · ')}</p>
      <p class="side-build" title="Which commit is serving, and how it got here">
        build <code>${STAMP.commit}</code>${STAMP.branch ? ` · ${esc(STAMP.branch)}` : ''} · via ${STAMP.source}</p>
    </div>
  </nav>
  <main id="main">${body}</main>
</div>

<div class="search-modal" hidden>
  <div class="search-box" role="dialog" aria-modal="true" aria-label="Search the course">
    <input type="search" class="search-input" placeholder="Search every class, tool and term…" autocomplete="off">
    <div class="search-results"></div>
    <p class="search-hint"><kbd>↑</kbd><kbd>↓</kbd> move · <kbd>↵</kbd> open · <kbd>esc</kbd> close</p>
  </div>
</div>

<script src="/assets/app.js?v=${STAMP.commit}" type="module"></script>
${scripts.map((s) => `<script src="${s}?v=${STAMP.commit}" type="module"></script>`).join('\n')}
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const PAGES = new Map();

const write = (route, html) => {
  const dir = route === '/' ? OUT : path.join(OUT, route.replace(/^\//, ''));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  PAGES.set(route, html);
};

const searchIndex = [];
const addSearch = (route, title, section, text) => {
  const clean = String(text).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (clean.length < 20) return;
  searchIndex.push({ r: route, t: title, s: section, x: clean.slice(0, 260) });
};

// --- Tool and practice registries -------------------------------------------

const TOOL_TITLES = {
  ohm: 'Ohm’s law and power',
  power: 'Power load, current and breaker',
  series: 'Series and parallel resistance',
  divider: 'Voltage divider',
  rescode: 'Resistor colour code',
  led: 'LED series resistor',
  rc: 'RC filter and time constant',
  mosfet: 'MOSFET and relay driver check',
  voltdrop: 'Cable voltage drop',
  wiregauge: 'Wire size and current',
  db: 'Decibels and audio levels',
  freq: 'Frequency, period and wavelength',
  dmx: 'DMX512 timing and refresh',
  universe: 'Universe and address planner',
  pwm: 'PWM duty, frequency and resolution',
  adc: 'ADC resolution and sensor scaling',
  datarate: 'Serial data rate',
};

const PRACTICE_TITLES = {
  drill: 'Numbers drill',
  myths: 'Spot the myth',
  parts: 'Component identification',
  faults: 'Fault diagnosis simulator',
};

function toolsHtml(ids) {
  return ids.map((id) => {
    if (!TOOL_TITLES[id]) throw new Error(`tools: unknown tool "${id}"`);
    return `<div class="tool" data-tool="${id}"><h3 class="tool-h" id="tool-${id}">${TOOL_TITLES[id]}</h3></div>`;
  }).join('');
}

function practiceHtml(ids, n) {
  return ids.filter((id) => id !== 'selftest').map((id) => {
    if (!PRACTICE_TITLES[id]) throw new Error(`practice: unknown widget "${id}"`);
    return `<div class="practice" data-practice="${id}" data-class="${n}">
      <h3 class="tool-h" id="${id}">${PRACTICE_TITLES[id]}</h3></div>`;
  }).join('');
}

function selfTestHtml(n) {
  const items = selfTest[n];
  if (!items) return '';
  const qs = items.map((it, i) => `<li class="qa">
      <button class="qa-q" aria-expanded="false"><span class="qa-n">${i + 1}</span>${esc(it.q)}</button>
      <div class="qa-a" hidden><p>${esc(it.a)}</p></div>
    </li>`).join('');
  return `<h2 class="hd hd-2" id="model-answers">Self test with model answers</h2>
  <p>Answer it yourself first, out loud or on paper, then open the answer. Reading the answer
  without attempting the question teaches you almost nothing.</p>
  <ol class="qa-list">${qs}</ol>
  <p class="note"><b>Note.</b> These are model answers, not the only correct ones. If yours differs
  and you can defend it with the arithmetic and a measurement, that is worth more than matching
  the wording.</p>`;
}

// --- Class pages -------------------------------------------------------------

let animRendered = 0;
const myths = [];
const drillCards = [];
const classData = [];

for (const c of CLASSES) {
  const raw = read(c.file);

  // Every marker must sit alone on its line, or it lands inside a paragraph and
  // silently never mounts. Fail the build rather than ship a page with a hole.
  for (const [i, line] of raw.split('\n').entries()) {
    if (/<!--\s*(anim|ready|video):/.test(line) && !/^<!--\s*(anim|ready|video):[^>]*-->$/.test(line.trim())) {
      throw new Error(`${c.file}:${i + 1}: marker must be alone on its line`);
    }
  }

  const prepMd = sliceSection(raw, 'Before you come');
  if (!prepMd) throw new Error(`${c.file}: no "## Before you come" section`);
  const numbersMd = sliceSection(raw, 'Numbers from this class');
  if (!numbersMd) throw new Error(`${c.file}: no "## Numbers from this class" section`);

  myths.push(...parseMyths(raw, c.n, c.file));
  drillCards.push(...twoColumnCards(numbersMd, `Class ${c.n}`));

  // The body is everything except the blocks that are re-presented elsewhere:
  // preparation has its own tab and its own page, and misconceptions become the
  // Spot the myth deck rather than a list nobody rereads.
  let bodyMd = raw.replace(/^#\s+[^\n]*\n/, '');
  bodyMd = removeSection(bodyMd, 'Before you come');
  bodyMd = removeSection(bodyMd, 'Common misconceptions');

  const doc = render(bodyMd);
  const prep = render(prepMd);
  animRendered += (doc.html.match(/class="anim"/g) || []).length;

  classData.push({ ...c, doc, prep, numbersMd });
}

const animExpected = CLASSES.reduce((a, c) => a + (read(c.file).match(/^<!--\s*anim:/gm) || []).length, 0);

for (const c of classData) {
  const route = `/class/${c.n}`;
  const toc = c.doc.headings
    .filter((h) => h.level === 2)
    .map((h) => `<a href="#${h.id}"${h.ext ? ' class="toc-ext"' : ''}>${esc(h.text)}</a>`)
    .join('');

  const tabs = [
    ['read', 'The class'],
    ['prepare', 'Prepare'],
    ...(c.tools.length ? [['tools', 'Calculators']] : []),
    ...(c.practice.length ? [['practice', 'Practice']] : []),
  ];

  const prev = CLASSES.find((x) => x.n === c.n - 1);
  const next = CLASSES.find((x) => x.n === c.n + 1);

  const body = `<article class="doc class-page">
  <header class="page-head">
    <p class="eyebrow">
      <span class="pill">Class ${c.n} of ${CLASSES.length}</span>
      <span class="pill">Unit ${c.unit.n} · ${esc(c.unit.title)}</span>
      <span class="pill pill-q">${HOURS} hours · ${c.benchHours} at the bench</span>
    </p>
    <h1>${esc(c.title)}</h1>
    <p class="strap">${esc(c.strap)}</p>
    <div class="head-actions">
      <a class="btn btn-primary" href="/teach/${c.n}">Teach mode</a>
      <button class="btn js-done" data-class="${c.n}">Mark as studied</button>
      <a class="btn" href="/safety">Safety card</a>
    </div>
  </header>

  <nav class="tabs" aria-label="Sections of this class">
    ${tabs.map(([id, label], i) => `<button class="tab${i === 0 ? ' on' : ''}" data-tab="${id}">${label}</button>`).join('')}
  </nav>

  <section class="panel on" data-panel="read">
    <nav class="toc" aria-label="On this page"><p class="toc-h">On this page</p>${toc}</nav>
    ${c.doc.html}
    ${selfTestHtml(c.n)}
    <nav class="pager">
      ${prev ? `<a class="pager-prev" href="/class/${prev.n}"><span>Previous</span><b>${c.n - 1}. ${esc(prev.title)}</b></a>` : '<span></span>'}
      ${next ? `<a class="pager-next" href="/class/${next.n}"><span>Next</span><b>${c.n + 1}. ${esc(next.title)}</b></a>` : '<span></span>'}
    </nav>
  </section>

  <section class="panel" data-panel="prepare">
    <p class="lede">Four hours goes fast, and most of it is bench time. What you do before the class
    is what decides whether you spend those hours learning or catching up.</p>
    ${c.prep.html}
  </section>

  ${c.tools.length ? `<section class="panel" data-panel="tools">
    <p class="lede">The calculations this class asks for, with the working shown. Use them to check
    your arithmetic, never to replace it: the exam asks for the method.</p>
    ${toolsHtml(c.tools)}
  </section>` : ''}

  ${c.practice.length ? `<section class="panel" data-panel="practice">
    <p class="lede">Retrieval, not rereading. Everything here is self-graded, stored in this browser
    only, and reported to nobody.</p>
    ${practiceHtml(c.practice, c.n)}
  </section>` : ''}
</article>`;

  write(route, shell({
    title: `Class ${c.n}: ${c.title}`,
    desc: c.strap,
    body,
    active: `class-${c.n}`,
    bodyAttrs: ` data-cls="${c.n}"`,
    scripts: ['/assets/anim.js', '/assets/tools.js', '/assets/practice.js'],
  }));

  for (const b of c.doc.blocks) addSearch(route, `Class ${c.n}: ${c.title}`, b.title, b.html);
  addSearch(`${route}#tab=prepare`, `Class ${c.n}: ${c.title}`, 'Prepare', c.prep.html);

  // --- Teach mode ------------------------------------------------------------
  //
  // A projector view: one idea per screen, very large type, with two clocks and
  // a whiteboard. It is the lecturer's own notes made legible from the back of a
  // room, not an attempt to auto-generate slides that would be worse than the
  // notes. The course carries no fixed timetable, so the clocks report elapsed
  // time and leave the judgement to the person in the room.

  // A heading with nothing under it spends a whole projected screen announcing
  // a title the toolbar already shows. Fold those into the screen that follows.
  const merged = [];
  for (const b of c.doc.blocks) {
    const bare = b.html.replace(/<h[23][\s\S]*?<\/h[23]>/, '');
    const words = (bare.replace(/<[^>]+>/g, ' ').match(/\S+/g) || []).length;
    const prev = merged[merged.length - 1];
    if (prev && prev.level === 2 && prev.thin && b.level === 3) {
      b.html = prev.html + b.html;
      merged[merged.length - 1] = b;
      continue;
    }
    merged.push({ ...b, thin: b.level === 2 && words < 25 });
  }

  const slides = merged.map((b, i) => {
    const cont = b.pages > 1 && b.page > 1;
    const lbl = b.pages > 1 ? `${b.title} (${b.page}/${b.pages})` : b.title;
    // On a continuation screen the heading is repeated small, so the room still
    // knows which section it is in without spending a title line on it.
    const inner = cont ? b.html.replace(/<h([23]) ([^>]*)>/, '<h$1 $2 data-cont="1">') : b.html;
    const hasFig = /<div class="(anim|practice)"/.test(b.html);
    return `<section class="slide" data-i="${i}" data-title="${esc(lbl)}"
        data-block="${esc(b.parent)}" data-level="${b.level}"${cont ? ' data-cont="1"' : ''}${hasFig ? ' data-fig="1"' : ''}>
        <div class="slide-inner">${inner}</div></section>`;
  }).join('');

  write(`/teach/${c.n}`, shell({
    title: `Teach · Class ${c.n}`,
    desc: `Projector view for Class ${c.n}.`,
    bodyClass: 'teach-mode',
    bodyAttrs: ` data-cls="${c.n}"`,
    body: `
<div class="teach" data-class="${c.n}">
  <header class="teach-bar">
    <a class="teach-exit" href="/class/${c.n}" title="Exit teach mode">✕</a>
    <h1 class="teach-title">Class ${c.n} · ${esc(c.title)}</h1>
    <span class="teach-when">${HOURS} h · ${c.benchHours} at the bench</span>
    <span class="teach-block" id="tblock"></span>
    <span class="teach-sub" id="tsub"></span>
    <div class="teach-sp"></div>
    <button class="teach-btn" id="tstart" title="Runs for the whole class. The block figure beside it restarts at each block.">▶ Start stopwatch</button>
    <span class="teach-clock" id="tclock">00:00</span>
    <span class="teach-bclock" id="tbclock" hidden></span>
    <span class="teach-pos" id="tpos"></span>
    <button class="teach-btn" id="tfull" title="Full screen">⛶</button>
  </header>
  <div class="teach-track" id="ttrack">${slides}</div>
  <footer class="teach-foot">
    <button class="teach-nav" id="tprev">← Previous</button>
    <div class="teach-dots" id="tdots"></div>
    <span class="teach-next" id="tnextup" hidden></span>
    <span class="teach-loc" id="tloc" hidden title="The same page on a phone. Press l to show it big for the room."><span class="teach-loc-p" id="tlocp"></span><kbd>l</kbd></span>
    <button class="teach-btn" id="tboard" title="A surface to draw on, over this screen. What you draw stays until you clear it.">✎ Board <kbd>w</kbd></button>
    <button class="teach-btn" id="tgrid" title="Overview of every screen (o)">▦ Overview <kbd>o</kbd></button>
    <button class="teach-btn" id="tanswers" aria-pressed="true" title="Hold each figure&#39;s conclusion until you press n. Your choice is remembered on this laptop."><span>Answers: held</span> <kbd>a</kbd></button>
    <button class="teach-nav" id="tnext">Next →</button>
  </footer>
</div>`,
    scripts: ['/assets/teach.js', '/assets/anim.js'],
  }));
}

// ---------------------------------------------------------------------------
// Resource pages
// ---------------------------------------------------------------------------

const glossaryMd = read('glossary.md');
const glossCards = glossaryCards(glossaryMd);

const docPage = (file, { route, title, eyebrow, h1, strap, actions = '', scripts = [], cls = '' }) => {
  const doc = render(read(file).replace(/^#\s+[^\n]*\n/, ''));
  write(route, shell({
    title, desc: strap.replace(/<[^>]+>/g, ''),
    body: `<article class="doc ${cls}"><header class="page-head">
      <p class="eyebrow">${eyebrow}</p>
      <h1>${h1}</h1>
      <p class="strap">${strap}</p>
      ${actions ? `<div class="head-actions">${actions}</div>` : ''}
    </header>${doc.html}</article>`,
    active: route,
    scripts,
  }));
  for (const b of doc.blocks) addSearch(route, h1.replace(/<[^>]+>/g, ''), b.title, b.html);
  return doc;
};

docPage('foundations.md', {
  route: '/foundations',
  title: 'Foundations',
  eyebrow: '<span class="pill">Do this first</span>',
  h1: 'Foundations',
  strap: `Prefixes, powers of ten, scientific notation and the three formulae everything else is
    built from. Nothing here is difficult, and all of it is assumed in every class. A student who
    has not met it spends Class 5 fighting the arithmetic instead of learning the switching.`,
  actions: `<a class="btn btn-primary" href="/tools#tool-ohm">Open the Ohm’s law tool</a>
    <a class="btn" href="/practice#drill">Drill the numbers</a>`,
  scripts: ['/assets/anim.js', '/assets/tools.js', '/assets/practice.js'],
});

docPage('safety.md', {
  route: '/safety',
  title: 'The safety card',
  eyebrow: '<span class="pill">Not negotiable</span><span class="pill pill-q">Examinable</span>',
  h1: 'The safety card',
  strap: `Print it. Put it on the bench. Every rule here exists because somebody was hurt or a
    building burned, and every one of them is a rule you can be sent home for breaking.`,
  actions: `<button class="btn btn-primary" onclick="window.print()">Print this card</button>
    <a class="btn" href="/class/15">Where this is taught</a>`,
  scripts: ['/assets/anim.js'],
  cls: 'safety-page',
});

docPage('toolkit.md', {
  route: '/toolkit',
  title: 'Your kit',
  eyebrow: '<span class="pill">Before Class 2</span>',
  h1: 'Your kit',
  strap: `What you must own, what the department lends you, and what is worth buying later. The
    honest version, with prices, and with the things not to waste money on.`,
  actions: '<button class="btn btn-primary" onclick="window.print()">Print the list</button>',
});

docPage('next.md', {
  route: '/next',
  title: 'Where to go next',
  eyebrow: '<span class="pill">Reference</span>',
  h1: 'Where to go next',
  strap: `Sixty four hours is an introduction. By the end of it you should know which direction you
    want to go deeper in. Here is where each one leads, what it costs, and what is free.`,
});

// The numbers card is generated from the per-class tables, so the printable
// reference and the flashcard deck cannot say different things.
const numbersBody = classData.map((c) => `<h2 class="hd hd-2" id="numbers-class-${c.n}">Class ${c.n} · ${esc(c.title)}
  <a class="anchor" href="#numbers-class-${c.n}" aria-label="Link to this section">#</a></h2>
  ${render(c.numbersMd).html}`).join('');

write('/numbers', shell({
  title: 'Numbers to know',
  desc: 'The reference card. Every examinable number in the course, generated from the classes themselves.',
  body: `<article class="doc"><header class="page-head">
      <p class="eyebrow"><span class="pill">Reference</span><span class="pill pill-q">Examinable</span></p>
      <h1>Numbers to know</h1>
      <p class="strap">Every number the course expects you to have, in class order. It is generated
      from the classes themselves, so it cannot drift from what you were actually taught. There is a
      five minute verbal quiz at the top of every class.</p>
      <div class="head-actions"><button class="btn btn-primary" onclick="window.print()">Print this card</button>
      <a class="btn" href="/practice#drill">Drill these</a></div>
    </header>${numbersBody}</article>`,
  active: '/numbers',
}));
for (const c of classData) addSearch('/numbers', 'Numbers to know', `Class ${c.n}: ${c.title}`, c.numbersMd);

const glossDoc = render(glossaryMd.replace(/^#\s+[^\n]*\n/, ''));
write('/glossary', shell({
  title: 'Glossary',
  desc: 'Bilingual glossary, English and 繁體中文, of every term used in the course.',
  body: `<article class="doc glossary-page"><header class="page-head">
      <p class="eyebrow"><span class="pill">${glossCards.length} terms</span><span class="pill pill-q">EN · 繁中</span></p>
      <h1>Glossary 詞彙表</h1>
      <p class="strap">Learn the English term as the operational one: every datasheet, every menu and
      every conversation on an international crew is in English. The Chinese is there to build the
      concept, not to replace it.</p>
      <div class="gloss-controls">
        <input type="search" id="gloss-filter" placeholder="Filter ${glossCards.length} terms, English or 中文…" autocomplete="off">
        <button class="btn" id="gloss-cards">Flashcard mode</button>
        <span class="gloss-count" id="gloss-count"></span>
      </div>
    </header>
    <div id="gloss-flash" hidden></div>
    <div id="gloss-body">${glossDoc.html}</div></article>`,
  active: '/glossary',
  scripts: ['/assets/practice.js'],
}));
for (const b of glossDoc.blocks) addSearch('/glossary', 'Glossary', b.title, b.html);

write('/tools', shell({
  title: 'Calculators',
  desc: 'Every calculation in the course: Ohm’s law, power, dividers, LED resistors, RC filters, cable drop, PWM, ADC, DMX timing.',
  body: `<article class="doc"><header class="page-head">
      <p class="eyebrow"><span class="pill">Used at the bench and in the exam</span></p>
      <h1>Calculators</h1>
      <p class="strap">Every calculation the course asks for, with the working shown. They exist to
      check your arithmetic, never to replace it. In the capstone you are asked for the method, and
      a right answer with no method is worth less than a wrong one with a good one.</p>
    </header>${toolsHtml(Object.keys(TOOL_TITLES))}</article>`,
  active: '/tools',
  scripts: ['/assets/tools.js'],
}));
for (const [id, t] of Object.entries(TOOL_TITLES)) {
  addSearch(`/tools#tool-${id}`, 'Calculators', t, `${t}: a calculator that shows its working, used in class and in the capstone.`);
}

write('/practice', shell({
  title: 'Practice',
  desc: 'Numbers drill, component identification, spot the myth, and a fault diagnosis simulator.',
  body: `<article class="doc"><header class="page-head">
      <p class="eyebrow"><span class="pill">Repetition is the point</span></p>
      <h1>Practice</h1>
      <p class="strap">All of this rewards doing it badly at first. Twenty minutes a night for a week
      beats three hours the day before, and that is not a motivational line, it is how the spacing
      works.</p>
      <p class="note"><b>The cards come back on their own.</b> A card you get right returns in a few
      days, then a week, then three. A card you miss comes back tomorrow, and again before you
      leave. So a sitting is short and it <b>ends</b>: the due count goes to zero and the page says
      so. New cards are never pushed at you. Miss a week and nothing is lost or broken, there are
      simply more waiting. None of it leaves your browser.</p>
    </header>
    <div class="practice" data-practice="faults" data-class="0"><h3 class="tool-h" id="faults">Fault diagnosis simulator</h3></div>
    <div class="practice" data-practice="parts" data-class="0"><h3 class="tool-h" id="parts">Component identification</h3></div>
    <div class="practice" data-practice="myths" data-class="0"><h3 class="tool-h" id="myths">Spot the myth</h3></div>
    <div class="practice" data-practice="drill" data-class="0"><h3 class="tool-h" id="drill">Numbers drill</h3></div>
    </article>`,
  active: '/practice',
  scripts: ['/assets/practice.js'],
}));

write('/map', shell({
  title: 'The map',
  desc: 'Every figure and every card in the course, in the order they are taught.',
  body: `<article class="doc"><header class="page-head">
      <p class="eyebrow"><span class="pill">The whole course</span></p>
      <h1>The map</h1>
      <p class="strap">Every figure and every card, in the order they are taught. It is here so you
      can get back to the one you half remember. The ones you have driven are filled in, and the
      cards you have met are marked; nothing is counted and there is nothing to finish.</p>
      <p class="note">This is read from your own browser and never leaves it. On a different device,
      or after clearing your site data, the map starts empty again.</p>
    </header><div id="modulemap" class="mp"></div></article>`,
  active: '/map',
  scripts: ['/assets/map.js'],
}));
addSearch('/map', 'The map', 'The whole course',
  'Every figure and every card in the course in the order they are taught, with the ones you have opened filled in');

// The prepare page collects every pre-class block in one place. Sixteen of them
// rendered at once is a very long page, so each collapses and app.js opens the
// one the reader actually needs.
const prepCards = classData.map((c) => `<section class="prep-block" data-prep="${c.n}">
    <header class="prep-head">
      <span class="prep-n">${c.n}</span>
      <div>
        <h2 class="hd hd-2" id="prepare-class-${c.n}" style="margin:0;border:0;padding:0">${esc(c.title)}</h2>
        <p class="prep-meta">Class ${c.n} · Unit ${c.unit.n} · ${c.benchHours} of ${HOURS} hours at the bench</p>
      </div>
      <a class="btn" href="/class/${c.n}#tab=prepare">Open Class ${c.n} →</a>
      <button class="btn prep-toggle" aria-expanded="false" data-prep-toggle="${c.n}">Show</button>
    </header>
    <div class="prep-body" hidden>${c.prep.html}</div>
  </section>`).join('');

write('/prepare', shell({
  title: 'Prepare',
  desc: 'What to do before each class: what you must already be able to do, three tasks, what to bring, and a readiness check.',
  body: `<article class="doc"><header class="page-head">
      <p class="eyebrow"><span class="pill">Before you walk in</span></p>
      <h1>Prepare</h1>
      <p class="strap">Most of every class is bench time, and bench time is the expensive kind: the
      room, the kit and the technician are all there at once. Every block below says what you must
      already be able to do, three things to actually go and do, and what to bring.</p>
      <div class="head-actions">
        <a class="btn btn-primary" href="#" data-prep-open="next">Open the one I need</a>
        <a class="btn" href="/foundations">Foundations, if the arithmetic is new</a>
        <a class="btn" href="/toolkit">The kit list</a>
      </div>
    </header>
    <div class="note" style="margin-bottom:28px"><b>The two that matter.</b> Class 4 is soldering,
    and a student who has never held an iron spends the session learning to hold an iron instead of
    learning to terminate. Class 11 is the microcontroller, and it assumes you can already open a
    terminal and flash a board. If you only prepare properly for two, prepare for those.</div>
    ${prepCards}</article>`,
  active: '/prepare',
  scripts: ['/assets/practice.js', '/assets/anim.js'],
}));
for (const c of classData) addSearch(`/prepare#prepare-class-${c.n}`, 'Prepare', `Class ${c.n}: ${c.title}`, c.prep.html);

// --- Home -------------------------------------------------------------------

const spine = `Every effect in a live show is a controlled release of energy, and everything you will
learn here is about controlling it deliberately, proving that you did, and knowing what happens
when it fails.`;

const unitBlocks = UNITS.map((u) => `<section class="unit">
  <h3 class="unit-h"><span class="unit-n">Unit ${u.n}</span>${esc(u.title)}</h3>
  <div class="cards cards-sm">
    ${u.classes.map((n) => {
    const c = CLASSES.find((x) => x.n === n);
    return `<a class="card" href="/class/${c.n}">
      <span class="card-n">${c.n}</span>
      <h3>${esc(c.title)}</h3>
      <p>${esc(c.strap)}</p>
      <span class="card-foot"><span class="card-hrs">${c.benchHours}h bench</span>
      <span class="card-go">Open →</span></span></a>`;
  }).join('')}
  </div></section>`).join('');

write('/', shell({
  title: 'Electronics for Theatre',
  desc: 'An interactive course for technical direction students: sixteen four-hour classes on electricity, components, signal, data, microcontrollers, sensors and safety, with animated explainers, calculators and drills.',
  body: `
<article class="doc home">
  <header class="hero">
    <p class="eyebrow"><span class="pill">Technical Direction</span><span class="pill pill-q">16 classes · ${TOTAL_HOURS} hours</span></p>
    <h1>Electronics<br><span class="hero-sub">for Theatre and Live Performance</span></h1>
    <blockquote class="spine"><p>${spine}</p></blockquote>
    <p class="strap">Sixteen four-hour classes. Every one has an idea to understand and something to
    build, because in this trade knowing and doing are the same skill measured twice.</p>
    <div class="head-actions">
      <a class="btn btn-primary" href="/class/1">Start with Class 1</a>
      <a class="btn" href="/safety">Read the safety card first</a>
      <a class="btn" href="/toolkit">What kit you need</a>
    </div>
  </header>

  <section class="progress-strip" id="progress-strip"
    data-classes='${esc(JSON.stringify(CLASSES.map((c) => ({ n: c.n, title: c.title }))))}'></section>

  <section class="sched" id="shape">
    <h2 class="sched-h">The shape of the course</h2>
    <p class="sched-sub">Eight units of two classes. The first class of a unit opens the idea and
    gets it onto the bench; the second builds something that only works if the idea was understood.
    That is the whole structure, and it repeats eight times.</p>
    <ol class="unit-list">
      ${UNITS.map((u) => `<li class="unit-row">
        <span class="unit-row-n">Unit ${u.n}</span>
        <span class="unit-row-t">${esc(u.title)}</span>
        <span class="unit-row-c">${u.classes.map((n) => `<a href="/class/${n}">${n}</a>`).join('')}</span>
        <span class="unit-row-h">${u.classes.length * HOURS} h</span>
      </li>`).join('')}
    </ol>
  </section>

  <h2 class="hd hd-2" id="classes">The sixteen classes</h2>
  ${unitBlocks}

  <h2 class="hd hd-2" id="how">How every class runs</h2>
  <div class="cards cards-sm">
    <div class="card card-plain"><h3>An hour of why</h3><p>The idea, with figures you can break.
      Not a lecture: the animations exist so you can push the circuit into the failure the class is
      about, which is the only way the numbers stop being decoration.</p></div>
    <div class="card card-plain"><h3>Two to three hours of bench</h3><p>Measure it, build it, prove
      it. Every class produces something you keep, or a measurement you wrote down and can defend.</p></div>
    <div class="card card-plain"><h3>A quiz you have already seen</h3><p>Five minutes of numbers at
      the top of every class, drawn from the same deck that is on this site. Nothing is a surprise
      and nothing is a trick.</p></div>
  </div>

  <h2 class="hd hd-2" id="whats-here">What is on this platform</h2>
  <div class="cards cards-sm">
    <a class="card" href="/prepare"><h3>A preparation path</h3><p>What to do before each class, what
      you must already be able to do, and a readiness check that names the exact thing to go and
      fix rather than telling you a score.</p></a>
    <a class="card" href="/foundations"><h3>Foundations</h3><p>Prefixes, powers of ten and the three
      formulae. Forty minutes, done once, and the rest of the course stops fighting you.</p></a>
    <a class="card" href="/safety"><h3>The safety card</h3><p>The rules that are not negotiable,
      why each one exists, and what to do in the four situations where hesitating is the dangerous
      choice.</p></a>
    <a class="card" href="/tools"><h3>${Object.keys(TOOL_TITLES).length} calculators</h3><p>Ohm’s law, power and breakers,
      dividers, LED resistors, RC filters, cable drop, wire size, decibels, PWM, ADC scaling and DMX
      timing. Each shows its working.</p></a>
    <a class="card" href="/practice"><h3>Four drills</h3><p>Flashcards for every examinable number,
      component identification against real markings, spot the myth, and a fault diagnosis simulator
      scored on the order you investigate in.</p></a>
    <a class="card" href="/glossary"><h3>${glossCards.length} terms, bilingual</h3><p>English and 繁體中文,
      grouped by domain, with a live filter and a flashcard mode.</p></a>
  </div>

  <section class="byline" id="who">
    <h2 class="sched-h">Who made this</h2>
    <p class="byline-p">Built and maintained by
      <a href="${AUTHOR.links[0][1]}" rel="noopener" target="_blank">${AUTHOR.name}</a>, who teaches the
      course it belongs to. Questions are welcome, and so is a correction: if something here does not
      hold up on the bench, please do get in touch.</p>
    <p class="byline-links">${AUTHOR.links.map(([n, u]) => `<a href="${u}" rel="noopener" target="_blank">${n}</a>`).join('')}</p>
    <ul class="byline-work">
      ${AUTHOR.work.map(([n, u, d]) => `<li><a href="${u}" rel="noopener" target="_blank">${n}</a> <span>${d}</span></li>`).join('')}
    </ul>
  </section>
</article>`,
  active: '/',
  scripts: ['/assets/practice.js'],
}));

addSearch('/#shape', 'Home', 'The shape of the course',
  UNITS.map((u) => `Unit ${u.n} ${u.title}: ${u.classes.map((n) => CLASSES.find((c) => c.n === n).title).join(', ')}`).join(' · '));

// ---------------------------------------------------------------------------
// Cross-reference pass
//
// A link the site promises has to land. Every figure named in the map, every
// readiness pointer and every fault-sim reference is checked against the pages
// that were just generated, and the build fails rather than shipping a link to
// nothing.
// ---------------------------------------------------------------------------

const LINKABLE = [...CLASSES.map((c) => `/class/${c.n}`), '/foundations', '/safety', '/numbers', '/toolkit'];
const PAGE_NAME = {
  '/foundations': 'Foundations',
  '/safety': 'Safety card',
  '/numbers': 'Numbers to know',
  '/toolkit': 'Your kit',
  ...Object.fromEntries(CLASSES.map((c) => [`/class/${c.n}`, `Class ${c.n}`])),
};

// mountAll() removes a host whose figure was never registered, so a link to one
// would land on nothing. Read the register calls rather than trusting the name.
const REGISTERED = new Set();
const FIG_TITLE = new Map();
for (const f of fs.readdirSync(path.join(HERE, 'assets')).filter((n) => /^anim-.*\.js$/.test(n))) {
  const src = fs.readFileSync(path.join(HERE, 'assets', f), 'utf8');
  for (const m of src.matchAll(/register\('([a-z0-9-]+)'/g)) REGISTERED.add(m[1]);
  for (const m of src.matchAll(/register\('([a-z0-9-]+)'[\s\S]{0,9000}?title:\s*'((?:[^'\\]|\\.)*)'/g)) {
    if (!FIG_TITLE.has(m[1])) FIG_TITLE.set(m[1], m[2].replace(/\\'/g, "'"));
  }
}

// Every figure the prose asks for must exist, or the page shows a hole.
const missing = [];
for (const c of CLASSES) {
  for (const m of read(c.file).matchAll(/^<!--\s*anim:([a-z0-9-]+)\s*-->$/gm)) {
    if (!REGISTERED.has(m[1])) missing.push(`${c.file}: anim:${m[1]}`);
  }
}
if (missing.length) throw new Error(`figures named in the prose that nothing registers:\n  ${missing.join('\n  ')}`);

const HEADINGS = new Map();
for (const route of LINKABLE) {
  const html = PAGES.get(route);
  if (!html) throw new Error(`xref: no page built for ${route}`);
  const list = [];
  for (const m of html.matchAll(/<h([234]) id="([^"]+)"[^>]*>([\s\S]*?)<a class="anchor"/g)) {
    list.push({
      index: m.index,
      id: m[2],
      text: m[3].replace(/<span class="ext-badge">[\s\S]*?<\/span>/g, '')
        .replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(),
    });
  }
  HEADINGS.set(route, list);
  const ids = (html.match(/ id="[^"]+"/g) || []);
  const seen = new Set();
  for (const rawId of ids) {
    if (seen.has(rawId)) throw new Error(`xref: ${route} repeats${rawId}`);
    seen.add(rawId);
  }
}

function resolve(route, id) {
  if (!LINKABLE.includes(route)) throw new Error(`xref: ${route} is not linkable (id ${id})`);
  const html = PAGES.get(route);
  const at = html.indexOf(`id="${id}"`);
  if (at < 0) throw new Error(`xref: ${route} has no id "${id}"`);
  if (id.startsWith('fig-') && !REGISTERED.has(id.slice(4))) {
    throw new Error(`xref: ${route}#${id} names a figure that is never registered`);
  }
  const list = HEADINGS.get(route);
  const own = list.find((hh) => hh.id === id);
  let lbl = own ? own.text : '';
  if (!own) {
    let best = null;
    for (const hh of list) { if (hh.index < at) best = hh; else break; }
    if (!best) throw new Error(`xref: ${route}#${id} sits above every heading`);
    lbl = best.text;
  }
  if (lbl.length > 58) lbl = `${lbl.slice(0, lbl.lastIndexOf(' ', 58)).trim()}…`;
  return { to: `${route}#${id}`, label: `${PAGE_NAME[route]} · ${lbl}` };
}

const mapFigures = [];
for (const c of CLASSES) {
  const route = `/class/${c.n}`;
  const html = PAGES.get(route);
  for (const m of html.matchAll(/ id="fig-([a-z0-9-]+)"/g)) {
    const id = `fig-${m[1]}`;
    const { to, label } = resolve(route, id);
    const t = FIG_TITLE.get(m[1]);
    if (!t) {
      console.error(`  ! no title found for figure ${m[1]}; the map would label it by its section`);
      process.exitCode = 1;
    }
    mapFigures.push({ cls: c.n, name: m[1], to, label: t || label.replace(/^Class \d+ · /, '') });
  }
}

for (const n of Object.keys(readiness)) {
  for (const q of readiness[n]) {
    if (q.to) { q.src = resolve(q.to.route, q.to.id); delete q.to; }
  }
}

// Which class page carries which deck, so the map can send somebody to the
// right place rather than always to /practice.
const classLinks = Object.fromEntries(CLASSES.map((c) => [c.n, {
  drill: c.practice.includes('drill') ? `/class/${c.n}#drill` : '/practice#drill',
  myths: c.practice.includes('myths') ? `/class/${c.n}#myths` : '/practice#myths',
}]));

// --- Data and assets --------------------------------------------------------

fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });
for (const f of fs.readdirSync(path.join(HERE, 'assets'))) {
  fs.copyFileSync(path.join(HERE, 'assets', f), path.join(OUT, 'assets', f));
}

fs.writeFileSync(path.join(OUT, 'assets', 'data.json'), JSON.stringify({
  classes: CLASSES.map((c) => ({ n: c.n, title: c.title, slug: c.slug, unit: c.unit.n, bench: c.benchHours })),
  units: UNITS,
  drillCards, glossCards, myths, mapFigures, classLinks, readiness, faultScenarios, benchChecks,
  hours: HOURS, totalHours: TOTAL_HOURS,
}));
fs.writeFileSync(path.join(OUT, 'search-index.json'), JSON.stringify(searchIndex));
fs.writeFileSync(path.join(OUT, 'robots.txt'), 'User-agent: *\nAllow: /\n');
fs.writeFileSync(path.join(OUT, 'version.json'), JSON.stringify(STAMP, null, 2));

const routes = ['/', '/prepare', '/map', '/foundations', '/safety', '/toolkit', '/tools', '/practice',
  '/glossary', '/numbers', '/next',
  ...CLASSES.map((c) => `/class/${c.n}`), ...CLASSES.map((c) => `/teach/${c.n}`)];

console.log(`Built ${routes.length} routes`);
console.log(`  classes        : ${CLASSES.length} in ${UNITS.length} units, ${TOTAL_HOURS} hours`);
console.log(`  search entries : ${searchIndex.length}`);
console.log(`  drill cards    : ${drillCards.length}`);
console.log(`  myth cards     : ${myths.length}`);
console.log(`  map figures    : ${mapFigures.length}`);
console.log(`  glossary cards : ${glossCards.length}`);
console.log(`  fault cases    : ${faultScenarios.length}`);
console.log(`  registered     : ${REGISTERED.size} figures in the modules`);
console.log(`  build          : ${STAMP.commit} via ${STAMP.source}${STAMP.branch ? ` (${STAMP.branch})` : ''}`);
console.log(`  explainers     : ${animRendered}${animRendered === animExpected ? '' : ` of ${animExpected} EXPECTED`}`);
if (animRendered !== animExpected) process.exitCode = 1;
