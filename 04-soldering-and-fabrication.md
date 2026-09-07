# Class 4 — Soldering and Fabrication

> Solder is not glue. It is an alloy that wets clean hot metal and refuses dirty cold metal, and
> every bad joint you make is one of those two words.

## Before you come

### What you must already be able to do

Identify the common components and read their markings. Test a cable with the five-step procedure.
Know which pin of an XLR is which without looking it up.

Nothing today requires calculation. It requires that you have watched somebody solder, so that the
first joint you make is not the first joint you have seen.

### Three things to do

1. **Watch two soldering videos and notice the disagreement.** They will contradict each other on
   tip temperature, on flux, and on whether to tin the wire first. Come with the contradiction
   written down and we will resolve it at the bench.
2. **Find out what your fingers do.** Hold a pencil like a soldering iron for two minutes without
   resting your hand on anything. If your hand shakes, that is normal and it is why the first thing
   we teach is where to put your elbows.
3. **Check the [kit list](/toolkit) and get your strippers.** Not a knife. A knife nicks strands and
   a nicked strand is a cable that fails in week six.

### What to bring

Safety glasses, which the department has but yours will fit better. Tie long hair back. Do not wear
anything you love, because solder spits and flux stains.

<!--ready:4-->

---

## Run of the session

Four hours, accounted for. Blocks are an order of work rather than a timetable: a class that runs
long on the bench is a class that is going well. The minutes are here so that you know what you are
trading against when it does.

| Min | Block | What happens |
| --- | --- | --- |
| 10 | Open | Numbers quiz, and the contradiction you brought from the two videos |
| 25 | The idea | Clean metal, enough heat in the right place, briefly. Then strain relief, which is the actual subject |
| 45 | Bench A | Fifty joints on scrap, inspected every tenth |
| 15 | Break |  |
| 30 | Bench B | Destructive testing: four bad joints, broken and examined |
| 75 | Bench C | Build three cables: XLR3, DMX on XLR5, RJ45 to T568B |
| 30 | Bench D | Inspect and condemn twenty cables from the store |
| 10 | Close | Where your verdicts differed from the technician’s, and why |

---

## Why this class is four hours long

Because soldering is a motor skill, and motor skills are acquired by repetition under correction,
not by explanation. You will make somewhere between forty and eighty joints today. The first ten
will be poor, and that is the schedule working correctly.

There is a second reason. **Termination quality is the single largest cause of intermittent faults
in live performance.** Not design errors, not component failures: joints and strain relief. A
technical director who can look at a terminated connector and say "that will fail in about two
months" is protecting a production in a way that no amount of theory does.

---

## What is actually happening

Solder joins metals by wetting them: the molten alloy forms a thin intermetallic layer with the
copper surface. It is closer to brazing than to gluing, and it needs three things at once.

<!--anim:solder-heat-->

1. **Clean metal.** Oxide is not wettable. Copper oxidises in air within hours, faster when warm.
   This is what flux is for: it chemically strips the oxide at soldering temperature and briefly
   protects the surface while the solder flows.
2. **Enough heat, in the right place.** Both parts must reach solder melting temperature. Not the
   iron: **the joint**. Heating the solder instead of the joint is the classic beginner error and
   it produces a joint that looks finished and is not connected.
3. **Time short enough not to damage anything.** Two to four seconds for most joints. Heat
   travelling into a connector melts its insulator and lets the pin move. Heat into a semiconductor
   damages it. Heat into PVC cable insulation shrinks it back from the joint.

Those three pull against each other, and every soldering technique is a way of getting all three at
once.

### The order of operations that works

1. Set the iron to temperature and let it stabilise. 340 to 370 °C for leaded solder, 370 to 400 °C
   for lead-free. A hotter iron for a shorter time damages less than a cool iron for a long time.
2. Clean and tin the tip. A bright wetted tip transfers heat; a dull oxidised one does not, and
   almost every "my iron is not hot enough" complaint is a dirty tip.
3. Mechanically secure the parts first. Solder is a poor mechanical fastener. Hook the wire,
   crimp the tags, or use a clamp.
4. Heat both parts together with the tip touching both.
5. Feed solder into the **joint**, not onto the iron. When it flows, it will run toward the heat and
   form a smooth fillet.
6. Remove the solder, then the iron. Do not move the joint until it has solidified.
7. Inspect. A good joint is shiny, concave and smooth, and you can see the shape of the wire
   through it.

<!--anim:joint-quality-->

### What the failures look like

| Fault | Appearance | Cause | How it presents in a show |
| --- | --- | --- | --- |
| Cold joint | Dull, grainy, lumpy | Not enough heat, or moved while cooling | Intermittent, worse when warm |
| Dry joint | Solder balled up, not wetted | Oxide, no flux, or dirty surface | Works on the bench, fails under vibration |
| Too much solder | Round blob hiding the wire | Feeding solder rather than heating | Hides a bad joint underneath it |
| Bridge | Two pads joined | Too much solder, tip too broad | Dead short, often immediate |
| Overheated | Brown flux, lifted pad, melted insulation | Too long on the joint | Pin moves in the connector, fails later |
| Cooked insulation | Insulation shrunk back, strands exposed | Heat travelled up the wire | Short to the shell, intermittent |

---

## Strain relief, which is the actual subject

Here is the sentence to remember from this class:

> **A cable fails where the flexing is concentrated.**

Everything in cable-making is about spreading that flex out or moving it somewhere the conductor is
not.

<!--anim:strain-relief-->

The failure sequence is always the same. The cable is pulled or bent repeatedly at one point. The
copper strands work-harden there. One strand breaks. The remaining strands carry the same current
in a smaller area and run hotter. More break. Resistance rises, the joint gets warm, and the
connection becomes intermittent long before it becomes open.

That intermittent phase is where the money is lost, because it is a fault that appears during a
performance and disappears when you test it.

### The rules that follow

- **The clamp must grip the outer jacket, never the conductors.** If the strain reaches the solder
  joint, the joint is the strain relief, and solder is brittle.
- **Leave the conductors slightly longer than the shortest path.** A gentle service loop inside the
  shell means the strain lands on the clamp rather than the joints, and it lets you re-terminate
  once without shortening the cable.
- **Heatshrink over the joint, not over the strain relief.** Heatshrink is insulation and a little
  mechanical support. It is not a clamp, and a joint whose only support is heatshrink will fail.
- **Match the cable to the gland.** A cable too thin for its clamp is not gripped. A cable too thick
  is crushed, and crushed insulation is a short in eighteen months.
- **The bend radius rule: never tighter than eight times the cable diameter**, and never at the
  connector at all.

---

## Terminating what you will actually terminate

### XLR, 3-pin and 5-pin

<!--anim:xlr-terminate-->

Pin 1 screen, pin 2 hot (positive), pin 3 cold (negative). For DMX on 5-pin: pin 1 screen, pin 2
data minus, pin 3 data plus, pins 4 and 5 unused in almost every rig.

Order of operations matters and half of today's errors are here. **Put the shell and the boot on
the cable first.** Everybody forgets this once, and having to unsolder three joints teaches it
better than being told.

Strip the jacket about 25 mm. Do not nick the conductors. Separate and twist the screen, sleeve it,
and tin all three lightly. Solder into the cups with the cable held in a vice. Check no strand has
escaped, seat the insert, and tighten the clamp onto the jacket.

Then test it. All five steps from Class 2, including the flex test. A cable you made and did not
test is not finished.

### Speakon

No soldering for the common types: the conductors go into screw or spring terminals. The failure
mode is different and worth knowing — a strand escaping the terminal and touching the adjacent
pole, which on a loudspeaker output is a short across an amplifier that can deliver a hundred amps.
Twist, insert fully, tighten, and tug each conductor before you close the shell.

### RJ45 for network and DMX-over-IP

<!--anim:rj45-order-->

T568B is the ordering used almost everywhere in this industry: orange-white, orange, green-white,
blue, blue-white, green, brown-white, brown. Either standard works as long as both ends match, and
the reason B dominates is convention rather than physics.

Two things that are not obvious and that cause real faults:

**Untwist as little as possible.** The twist is what rejects interference, and untwisting 30 mm at
the connector undoes a surprising amount of it. Keep it under 13 mm.

**The pairs are not in numerical order for a reason.** Pins 3 and 6 are one pair, which is why a
cable that "looks right" but has 3 and 6 split across two pairs will pass a continuity test and
fail at 100 Mbit/s over any distance. A cheap cable tester that only checks continuity will call
that cable good. This is precisely the Class 2 lesson about proving the right thing.

---

## Crimping, which is most of what you will actually do

Soldering gets the attention. In the field, on a production, in a rack, **most terminations are
crimped**, and a good crimp is more reliable than a good solder joint under vibration.

<!--anim:crimp-quality-->

A correct crimp is a **gas-tight cold weld**. The die deforms the barrel and the conductor together
until the metal flows and there is no air path between them. It is not a squeeze that holds the
wire mechanically; it is a joining process, and that distinction is why the tool matters more than
the technique.

**The tool is the whole subject.** A ratcheting crimper with the correct die for the terminal will
not release until it has completed the cycle, so every crimp gets the same force. A general-purpose
plier-type crimper applies whatever force your hand had that afternoon. The industry uses ratcheting
tools because consistency is the property being bought, and a cheap crimper is the single worst
false economy on the kit list.

### The four kinds you will meet

<!--anim:crimp-types-->

| Type | Where | What goes wrong |
| --- | --- | --- |
| Bootlace ferrule | Stranded wire into a screw or spring terminal | Not used at all, so strands splay and one escapes |
| Ring and spade | Bolted studs, chassis earths | Crimped over the insulation instead of the conductor |
| Insulation-displacement (IDC) | RJ45, ribbon cable, Socapex inserts | Wrong conductor size for the slot |
| Machined pin | Multipin connectors, Socapex, CEE | Pin not seated, so it pushes back on mating |

**Bootlace ferrules are the one to internalise.** Any stranded conductor entering a screw terminal
should be ferruled. Without one, the screw crushes and cuts strands, the strand count carrying
current falls, resistance rises and the terminal heats. It costs a few cents and about four
seconds, and its absence is visible in half the racks you will ever open.

### Inspecting a crimp

- **The wire barrel grips conductor; the insulation barrel grips insulation.** Both, separately.
  A crimp that has caught the insulation in the wire barrel is a connection to nothing.
- **You should see a little conductor past the barrel**, one to two millimetres. None at all means
  the wire was short of the end; a lot means it was too long and is unsupported.
- **The tug test.** Pull it, properly. A correct crimp on stranded wire will break the wire before
  it releases the barrel. If it slides out, every crimp you made that day is suspect.
- **No solder on a crimp.** Solder wicks up the strands and creates a hard point exactly where the
  conductor needs to flex. Crimp or solder, never both.

---

## At the bench

Three hours and twenty minutes. This is the most hands-on class of the course.

### Block A — Fifty joints on scrap (45 min)

Not connectors. Wire to tag, wire to wire, wire to pad, on scrap board. The technician inspects
every tenth joint and you keep going until the inspection passes twice in a row.

The metric is consistency, not beauty. Ten identical acceptable joints is a pass; two beautiful ones
and eight poor is not, because a cable is only as good as its worst joint.

### Block B — Destructive testing (30 min)

Make four joints deliberately badly: one cold, one dry, one with too much solder, one with the wire
moved during cooling. Then break each one and look at the fracture surface under a loupe.

Then measure each one's resistance, and measure it again while flexing. The cold joint will read
fine and fail on flex. Write that down: **a bad joint often measures perfectly at rest**, and this
is why visual inspection and the flex test both exist.

### Block C — Build three cables (75 min)

- One 3-pin XLR audio cable, 2 m.
- One 5-pin DMX cable, 2 m, with 110 Ω cable, not microphone cable.
- One RJ45 patch lead, T568B both ends.

Each fully tested with the five-step procedure, logged, labelled and signed. These are yours and
you will use them in Class 8 and Class 10, so make them well.

### Block D — Inspect and condemn (30 min)

Twenty cables from the store. Inspect each and decide: pass, repair, or condemn. Write one sentence
of justification for each.

Then the technician gives their verdict and you compare. Disagreements are the lesson. Most people
condemn too little, because a cable that is currently working feels like a cable that is fine.

---

## Common misconceptions

- **"A shiny joint is a good joint."** A shiny joint has been heated properly and cooled
  undisturbed, which is necessary and not sufficient. It can still be a blob hiding an unwetted
  wire. Shape matters more than shine: a good joint is concave and you can see the wire's outline
  through it.
- **"More solder makes a stronger joint."** More solder hides the joint and makes it harder to
  inspect, and it adds mass that cracks under vibration. The mechanical strength should come from
  the mechanical fixing, not from the alloy.
- **"Lead-free is just the same but greener."** Lead-free melts about 30 °C higher, wets less
  readily, and dries to a duller finish, so the visual test you learned on leaded solder gives false
  alarms. It needs a hotter iron and more patience, and knowing which one is on your bench changes
  how you judge a joint.
- **"The heatshrink will hold it."** Heatshrink is insulation. Any joint whose mechanical support
  is heatshrink will move, and a joint that moves will crack. The clamp on the jacket is the
  strain relief, always.
- **"A cable that passes a continuity test is a good cable."** A network cable with split pairs
  passes continuity and fails at speed. A cable with a cracked strand passes at rest and fails on
  flex. Continuity is one of five tests, and it is the least informative of them.
- **"Soldering is a knack you either have or you do not."** It is a motor skill with three
  variables — heat, cleanliness and time — and every failure maps onto one of them. When a joint
  goes wrong, name which of the three it was. People who do that get good in one day; people who
  call it a knack stay poor at it for years.

---

## Numbers from this class

| Quantity | Value |
| --- | --- |
| Iron temperature, leaded solder | 340–370 °C |
| Iron temperature, lead-free | 370–400 °C |
| Leaded eutectic solder melting point | 183 °C |
| Lead-free (SAC305) melting point | 217–220 °C |
| Time on a typical joint | 2–4 seconds |
| Jacket strip length for XLR | about 25 mm |
| Maximum untwist at an RJ45 | 13 mm |
| Minimum cable bend radius | 8 × cable diameter |
| XLR pin 1 | Screen |
| XLR pin 2 | Hot, positive |
| XLR pin 3 | Cold, negative |
| DMX 5-pin, pin 2 | Data minus |
| DMX 5-pin, pin 3 | Data plus |
| DMX cable impedance | 110 Ω |
| T568B first pair | orange-white, orange |
| RJ45 pair on pins 3 and 6 | green-white, green |
| Acceptable joint resistance | under 0.05 Ω |
