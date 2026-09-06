# Teaching platform

The interactive site for the sixteen classes. Static, zero dependencies.

## Local

```bash
node build.mjs      # renders ../*.md into ./public
node serve.mjs      # http://localhost:4173
```

## How it is built

`build.mjs` reads the authored markdown one directory up, so the markdown stays the single source
of truth and nothing is duplicated. It emits 43 static routes into `public/`.

| Piece | File |
|-------|------|
| Markdown subset parser | `lib/markdown.mjs` |
| Site generator, routes, cross-reference checks, search index | `build.mjs` |
| Exercise data written by hand | `data/interactive.mjs` |
| Shell: theme, nav, tabs, search, progress | `assets/app.js` |
| Figure framework: canvas, controls, palette, mounting | `assets/anim-core.js` |
| Three reusable figure shapes: chain, compare, ladder | `assets/anim-kit.js` |
| 94 figures, grouped by subject | `assets/anim-dc.js`, `anim-measure.js`, `anim-parts.js`, `anim-load.js`, `anim-analogue.js`, `anim-data.js`, `anim-mcu.js`, `anim-sense.js`, `anim-safety.js` |
| 17 calculators | `assets/tools.js` |
| Spaced decks, fault simulator, readiness checks, glossary | `assets/practice.js` |
| Leitner box for the decks | `assets/review.js` |
| Projector mode, block clock | `assets/teach.js` |
| Whiteboard overlay for the projector | `assets/board.js` |
| The module map | `assets/map.js` |
| Design system | `assets/styles.css` |

The numbers card, the flashcard deck and the myth deck are all generated from the class files at
build time, so they cannot drift out of sync with what is taught.

`data/interactive.mjs` holds only what the prose cannot supply: model answers for the self tests,
the readiness questions with their distractors, the fault scenarios with a time cost on each step,
and the component identification deck.

## The checks the build runs

The build fails rather than shipping something broken:

- A `<!--anim:id-->`, `<!--ready:n-->` or `<!--video:…-->` marker not alone on its line.
- A figure named in the prose that no module ever `register()`s.
- A class file with no `## Before you come` or `## Numbers from this class` section.
- A misconception bullet that is not `- **"claim"** correction`.
- A readiness pointer that resolves to a route or an id that does not exist.
- A repeated element id anywhere on a page that other pages link into.
- A figure on a class page whose module does not give it a title, which would leave the module map
  labelling it by its section heading.

## Adding a class

1. Write the markdown alongside the others, with the three required sections.
2. Add an entry to `CLASSES` in `build.mjs`: file, title, strap, bench share, and which tools and
   practice widgets the class page should carry.
3. Add it to a unit in `UNITS`. The build fails if a class belongs to no unit, or if a unit names a
   class that does not exist.

## Adding a figure

1. `register('some-id', (host) => { … })` in the module for its subject, giving it a `title`.
2. Put `<!--anim:some-id-->` alone on its own line in the prose, exactly where the idea is
   introduced. It is carried into teach mode and onto the module map for free.

For a figure whose subject is a sequence, a set of options or a range of magnitudes, use `chain`,
`compare` or `ladder` from `anim-kit.js` rather than drawing it by hand: one interaction learned
once is worth more to a student than ninety slightly different ones.

## Deploying

Vercel builds from the **repository root**, using `vercel.json` at the repo root:

```
buildCommand      node site/build.mjs
outputDirectory   site/public
installCommand    echo 'no dependencies'
```

Root directory is left as the repository root on purpose. Pointing Vercel at this folder instead
would cut the build off from `../*.md` unless "include files outside the root directory" is
enabled, and the markdown must not be duplicated to work around that.

`site/vercel.json` carries the equivalent settings for the case where this folder is deployed
standalone. In that case put a copy of the markdown in `site/content/`, which `build.mjs` prefers
over `../` when it exists.
