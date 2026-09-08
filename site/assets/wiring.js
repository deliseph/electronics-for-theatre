// The wiring bench: Tinkercad Circuits cards.
//
// Autodesk is not asked for anything until somebody clicks, which is the same
// rule the video cards follow: a class page open on a projector should make no
// third-party request just by being open.
//
// A circuit with no id is not an error and does not disappear. It renders as a
// build brief with a button that opens Tinkercad, which is useful on its own
// and is what the page shows until somebody pastes an id in
// site/data/circuits.mjs. Nothing here invents an id, because a dead embed in
// front of a class is worse than no embed.

const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

let DATA = null;
const loadData = async () => (DATA ||= await (await fetch('/assets/data.json')).json());

const EMBED = (id) => `https://www.tinkercad.com/embed/${id}?editbtn=1`;
const OPEN = (id) => `https://www.tinkercad.com/things/${id}`;
const NEW = 'https://www.tinkercad.com/circuits';

function card(host, c) {
  const has = !!c.tinker;

  host.innerHTML = `<div class="ck-card">
    <header class="ck-head">
      <p class="ck-eyebrow">
        <span class="pill">Class ${c.cls}</span>
        <span class="pill">${esc(c.tag)}</span>
        <span class="pill pill-q">${c.mins} min</span>
      </p>
      <h4 class="ck-title">${esc(c.title)}</h4>
      <p class="ck-build"><b>Build.</b> ${esc(c.build)}</p>
    </header>

    <div class="ck-stage">
      ${has
    ? `<button class="ck-open" aria-label="Load the simulation for ${esc(c.title)}">
           <span class="ck-tri">▶</span>
           <span class="ck-meta"><b>Open the wiring bench</b><i>Tinkercad Circuits · loads when you click</i></span>
         </button>`
    : `<div class="ck-brief">
           <p><b>Build this one yourself.</b> It takes about ten minutes and it is the fastest way to
           find out whether you actually understand the circuit or only recognise the picture.</p>
           <p><a class="btn btn-primary" href="${NEW}" target="_blank" rel="noopener noreferrer">Open Tinkercad Circuits ↗</a></p>
         </div>`}
    </div>

    <div class="ck-work">
      <p class="ck-h">Do these, in this order</p>
      <ol class="ck-do">${c.do.map((d) => `<li>${esc(d)}</li>`).join('')}</ol>
      <div class="ck-truth">
        <p class="ck-shows"><b>What the simulation tells you.</b> ${esc(c.shows)}</p>
        <p class="ck-hides"><b>What it does not.</b> ${esc(c.hides)}</p>
      </div>
      <p class="ck-warn"><b>A passing simulation is not a proof.</b> It has no heat, no smell, no dry
      joint and no cable that has been walked on for six weeks. It is where you find out whether the
      idea is right, and the bench is where you find out whether the thing is.</p>
    </div>
  </div>`;

  if (!has) return;

  host.querySelector('.ck-open').addEventListener('click', (e) => {
    const stage = e.currentTarget.parentElement;
    const frame = document.createElement('iframe');
    frame.className = 'ck-frame';
    frame.src = EMBED(c.tinker);
    frame.title = c.title;
    frame.loading = 'lazy';
    frame.allowFullscreen = true;
    stage.replaceChild(frame, e.currentTarget);
    stage.insertAdjacentHTML('beforeend',
      `<p class="ck-link"><a href="${OPEN(c.tinker)}" target="_blank" rel="noopener noreferrer">Open it in Tinkercad to edit ↗</a>
       — you need a free Autodesk account to change anything, and a copy of your own is better than editing mine.</p>`);
  });
}

async function mountAll() {
  const hosts = [...document.querySelectorAll('.circuit[data-circuit]')];
  const index = document.querySelector('[data-circuit-index]');
  if (!hosts.length && !index) return;

  const d = await loadData();
  const byId = new Map((d.circuits || []).map((c) => [c.id, c]));

  for (const host of hosts) {
    if (host.dataset.mounted) continue;
    const c = byId.get(host.dataset.circuit);
    if (!c) { host.remove(); continue; }
    host.dataset.mounted = '1';
    card(host, c);
  }

  if (index && !index.dataset.mounted) {
    index.dataset.mounted = '1';
    for (const c of d.circuits || []) {
      const host = h(`<div class="circuit" id="ck-${c.id}"></div>`);
      index.append(host);
      card(host, c);
    }
  }
}

mountAll().catch((err) => console.error('wiring failed:', err));
