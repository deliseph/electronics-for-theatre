# Electronics for Theatre and Live Performance

An interactive teaching platform for a module taught to **technical direction** students:
sixteen classes of four hours, sixty four hours in total, from what electricity does in a building
to a capstone build and a fault-finding exam.

It answers one question, repeatedly, from different angles:

> Why does a technical director, who will mostly be signing off other people's electrical work
> rather than doing it, need to be able to read a schematic, measure a claim, and know when
> somebody is telling them a comfortable lie about electricity?

---

## The spine

Everything hangs off one sentence, which students should be able to say by the end of Class 1 and
defend with instruments by the end of Class 16:

> **Every effect in a live show is a controlled release of energy, and everything you will learn
> here is about controlling it deliberately, proving that you did, and knowing what happens when
> it fails.**

Under it sits one habit that recurs in every class: **prove it, do not assume it.** Predict before
you measure. Record both probes. Establish the boundary before you touch anything. Change one thing
at a time. Prove the fix by reintroducing the fault. More marks are lost in the capstone to
disordered searching than to missing knowledge, every year, by a wide margin.

---

## The shape of the course

Sixteen classes of four hours, in **eight units of two**. The first class of a unit opens the idea
and gets it onto the bench; the second builds something that only works if the idea was understood.
That is the whole structure, and it repeats eight times.

The original brief alternated a theory day with a practical day. That is not how the skill is
actually acquired: a student who hears about impedance on Tuesday and touches a cable on Thursday
has forgotten the reason by the time the iron is hot. **Every class carries both**, and the share
of each session that is hands-on hardware is stated on its page, because it changes what you bring.

| Unit | # | Class | Bench |
|---|---|-------|------|
| 1 · Electricity, and proving it | 1 | What Electricity Does in a Theatre | 1.5 h |
| | 2 | Measure, Test, Prove | 3 h |
| 2 · Parts, and joining them | 3 | Components and Connectors | 2 h |
| | 4 | Soldering and Fabrication | 3 h |
| 3 · Loads and switching | 5 | Loads, Switching and Isolation | 2 h |
| | 6 | Build a Driver Board | 3.5 h |
| 4 · Analogue signal | 7 | Analogue Signal, Impedance and Grounding | 1.5 h |
| | 8 | Hum Hunting and Scope Work | 3 h |
| 5 · Data, protocols and rigs | 9 | Data, Protocols and Networks | 1.5 h |
| | 10 | Build and Break a Rig | 3.5 h |
| 6 · Microcontrollers | 11 | Microcontrollers | 2 h |
| | 12 | Program a Prop | 3.5 h |
| 7 · Sensors and actuators | 13 | Sensors and Actuators | 2 h |
| | 14 | Build a Triggered Effect | 3.5 h |
| 8 · Safety, faults and the capstone | 15 | Safety Systems and Fault-Finding | 2 h |
| | 16 | Capstone and Fault-Finding Exam | 3.5 h |

---

## What is in the platform

- **94 interactive explainers**, placed inline where each idea is taught. Every one shows a real
  mechanism with the numbers used in the prose beside it, and the controls exist to *break* it:
  remove the flyback diode and watch the transistor die, under-drive a MOSFET gate and watch the
  dissipation climb, defeat an optocoupler's isolation with one convenience wire, cut the cable to
  a normally-open guard switch and watch the machine decide it is safe.
- **17 calculators**, each printing its working, because the capstone awards method marks. Ohm's
  law, power and breaker loading, series and parallel, dividers, the resistor colour code both
  ways, LED series resistors, RC filters, MOSFET dissipation, cable voltage drop, wire derating,
  decibels, frequency and period, DMX timing, universe planning, PWM, ADC scaling and serial rates.
- **Teach mode**, a projector view with one idea per screen, a block clock, and a whiteboard you
  can draw on over whatever figure is up. Every figure is live in there with the same controls.
- **Practice**: a spaced deck of every examinable number, a component identification deck built
  from markings that are not obvious, "spot the myth" from every misconception in the prose, and a
  fault diagnosis simulator scored on **the order you investigate in** rather than on whether you
  eventually guessed.
- **A preparation path.** Every class states what you must already be able to do, three concrete
  tasks, and what to bring. A five question readiness check tests the *prerequisite* rather than
  the content, and names the exact thing to go and fix.
- **A printable safety card**, a generated numbers card, a kit list with honest prices, and a
  **bilingual glossary** of 187 terms, English and 繁體中文.

Nothing is scored, reported or compared. Everything a student does is stored in their own browser
and never leaves the device.

---

## Repo layout

| Path | What |
|------|------|
| `01` to `16` | The sixteen classes, one markdown file each |
| `foundations.md` | Prefixes, powers of ten, the three formulae. The primer everything assumes |
| `safety.md` | The safety card: the rules that are not negotiable, and why each exists |
| `toolkit.md` | What to own, what the department lends you, and what not to waste money on |
| `glossary.md` | 187 terms, EN and 繁中 |
| `next.md` | Certifications, standards, free courses and where each direction leads |
| `site/` | The static site generator and the platform itself |

Each class file carries its own `## Before you come`, `## Common misconceptions` and
`## Numbers from this class` sections. The build turns those into the prepare page, the myth deck
and the numbers card respectively, so **none of them can drift from what is actually taught**.

---

## Running it

Zero dependencies. Node 18 or newer.

```bash
node site/build.mjs     # renders the markdown into site/public
node site/serve.mjs     # http://localhost:4173
```

## Deploying

`vercel.json` at the repo root configures the build:

```
buildCommand      node site/build.mjs
outputDirectory   site/public
installCommand    echo 'no dependencies'
```

`site/vercel.json` carries the equivalent settings for deploying the `site/` folder standalone. In
that case put a copy of the markdown in `site/content/`, which `build.mjs` prefers over `../` when
it exists.

---

## Design notes

**The markdown is the single source of truth.** The generator reads it and emits static HTML. The
numbers card, the flashcard deck and the myth deck are all generated from the class files at build
time, so a reworded table changes every place that number appears. A misconception bullet that does
not match the expected shape fails the build loudly rather than vanishing silently from the deck.

**The build refuses to ship a broken link.** Every figure named in the prose is checked against the
`register()` calls in the modules; every readiness pointer is resolved against the pages actually
generated; a repeated element id anywhere on a linkable page is an error. A figure the prose asks
for that nothing registers stops the build rather than leaving a hole on the page.

**Figures show mechanisms, not decoration.** Four rules they all follow: the numbers in a figure
are the numbers in the prose beside it; the controls exist to push the system into the failure the
class is about; colour means one thing everywhere (amber is energy and anything live, cyan is
signal and data, green is safe or verified, red is a fault or a hazard); and everything pauses off
screen and honours `prefers-reduced-motion`, because a page of running canvases on a projector
laptop is a real cost.

**No dependencies, deliberately.** A hand-rolled markdown subset parser and vanilla JavaScript, so
the site builds anywhere Node runs with nothing to install and nothing to go stale.

**Nothing phones home.** No analytics, no third-party requests, no accounts. Progress, the spaced
repetition state and the theme are stored per browser and never leave the device.

---

## Where this sits, and the other three courses

**This is the first technical course a Technical Direction student takes**, in year one, and it
assumes nothing. Everything in it is taught from the beginning with a meter in your hand.

It is followed in year two by
[Computer Science for Theatre](https://computer-science-theatre.vercel.app/), which is the only
real progression among these four: the same students, the year after, and it assumes this course
outright. It does not re-teach a pin, an ADC or a debounce, because you spent four hours on each of
them here. Between them, this course owns the hardware and that one owns the software.

The other two are for other rooms:

| Course | Who is in it |
|---|---|
| [Computer Systems and Networking](https://github.com/deliseph/theatre-computer-systems) | Media Design and Technology, year 1. A different cohort, who never take this course |
| [Show Networking and Control Systems](https://github.com/deliseph/show-netoworking-control-system) | An elective, open to anyone, assuming none of the others |
| [showstack](https://showstack-inky.vercel.app/) | Not a course: the open index all four check their numbers and bilingual terms against |

Where two of these reach the same object they reach it from different positions and ask different
questions of it. DMX here is a differential pair on a scope; in Computer Systems it is a quantity of
data; in Computer Science it is bytes arriving at a UART inside a loop with a deadline; in the
elective it is a standard with a specified behaviour on loss. The full map is
[how the four relate](https://computer-science-theatre.vercel.app/alignment).

---

## Licence

Not yet chosen. Until one is added here, treat this as **all rights reserved**: readable, not
licensed for reuse.
