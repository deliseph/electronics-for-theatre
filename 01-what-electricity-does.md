# Class 1 — What Electricity Does in a Theatre

> Four quantities, three formulae, and one habit: never describe a circuit without saying where you
> are measuring from.

## Before you come

### What you must already be able to do

Nothing electrical. This class assumes no prior electronics at all. It does assume arithmetic you
can do without a calculator: multiply and divide by ten, rearrange `a = b × c` into `b = a ÷ c`
without looking it up, and read a number written as 4.7 kΩ or 470 µF and know which is bigger.

If any of that is shaky, spend forty minutes on [Foundations](/foundations) first. It is the
cheapest forty minutes in the course. Everything after Class 3 assumes it silently.

### Three things to do

1. **Find the distribution board** for a space you already work in, and photograph the labelling.
   Do not open it. You are looking at what is written on the door: circuit numbers, ratings,
   what each way feeds.
2. **Write down three things you have plugged in this month** and guess what each one draws in
   watts. Guess. We will check them in class and the gap between your guess and the truth is the
   lesson.
3. **Read the [safety card](/safety)** once, end to end. You will not remember it. Read it anyway,
   so that when it comes up in Class 15 it is the second time.

### What to bring

A notebook you are willing to write measurements in and keep for sixteen weeks. Not a phone. The
act of writing a number down is half of what makes you check it.

<!--ready:1-->

---

## Why a technical director needs this

You will spend your career signing off other people's electrical work. Not doing it, most of the
time: signing it off. A designer wants a practical lamp inside a period fitting. A production
electrician tells you a dimmer will not run an LED fixture. A scenic automation supplier hands you
a schematic with an emergency stop loop drawn on it, and asks you to confirm the circuit is
acceptable.

In every one of those conversations you need to be able to do one thing: **tell the difference
between a claim that holds and a claim that sounds like it holds.** That is what this course is
for. Not to make you an electrician, and not to make you an electronic engineer. To make you
someone who cannot be told a comfortable lie about electricity.

The whole subject reduces to a single sentence you should be able to say by the end of today:

> Every effect in a live show is a controlled release of energy. Everything here is about
> controlling it deliberately, proving that you did, and knowing what happens when it fails.

### What actually kills shows

It is worth being honest about the failure modes, because they are not the dramatic ones.

| What people fear | What actually happens |
| --- | --- |
| Electrocution on stage | A connector works loose and a cue does not fire |
| A fire in the rig | A circuit trips because somebody added a fourth heater to a ring |
| A component exploding | A cold solder joint fails on the twelfth performance |
| Getting the physics wrong | Getting the *housekeeping* wrong: no labels, no drawings, no spare |

Almost everything that goes wrong is mechanical, thermal or organisational. The physics is
usually fine. That is why this course spends more hours at a bench than at a whiteboard.

---

## The four quantities

Everything in the first half of this course is four quantities and the relationships between them.
Learn what each one *does* before you learn its formula, because the formula is trivial and the
intuition is not.

### Voltage is a difference, never a place

Voltage is the difference in electrical pressure between two points. It is meaningless to say "this
wire is at 12 volts" without saying *relative to what*. A bird on an 11 kV line is at 11 kV and is
entirely comfortable, because both its feet are at the same potential.

This is not a pedantic point. It is the single most common source of confusion in fault-finding,
and it is why every measurement you write down this term must record **both probes**.

<!--anim:voltage-is-relative-->

### Current is what does the work, and what does the damage

Current is the rate of charge flow: how much is moving, per second. Voltage is what pushes;
current is what actually heats a cable, lights a lamp, moves a motor, and stops a heart.

When you hear somebody say "it is only 12 volts, it is safe", they are half right and they do not
know which half. Twelve volts across dry skin will not push meaningful current through you, so it
is safe *to touch*. Twelve volts through a car battery can deliver four hundred amps into a
spanner and weld it to the terminal. The voltage was never the dangerous part.

### Resistance is opposition, and it is where the heat appears

Resistance opposes current, and every ohm of it converts electrical energy into heat. That is not
a side effect; that is the entire operating principle of a filament lamp, a heater, and a
smouldering connector.

Anywhere current flows through unintended resistance, you get unintended heat. A loose terminal is
a resistor you did not design. This is why "it works, but that connector is warm" is not a
description of a working system.

### Power is the rate of energy, and it is what you pay for and plan for

Power is what the distribution board cares about, what the generator hire quote is priced on, and
what determines whether a cable is comfortable or a fire.

<!--anim:ohm-triangle-->

---

## The three formulae

There are three, and you will use them for the rest of your career.

```
V = I × R          Ohm's law
P = V × I          Power
P = I² × R         Power dissipated in a resistance
```

The third one is the one that surprises people, so it is worth dwelling on: **the heat in a cable
goes up with the square of the current.** Double the current in a cable and you get four times the
heating. This is the reason a cable that is fine at 10 A is not merely "a bit warmer" at 20 A, and
it is the reason undersized cable does not fail gently.

<!--anim:power-heat-->

### The water analogy, and exactly where it lies to you

Voltage as pressure, current as flow rate, resistance as pipe narrowness. It is a good analogy and
you should use it. It fails in three specific places, and knowing where it fails is more useful
than the analogy itself.

<!--anim:water-analogy-->

1. **Water leaks to the ground; electricity needs a complete loop.** Current only flows if there
   is a path back. This is why a bird is fine on a wire and why a person standing on a concrete
   floor is not.
2. **Water in a pipe moves at the speed of the water; electrical energy moves at nearly the speed
   of light.** The electrons drift slowly, millimetres per second. The *push* propagates almost
   instantly. This matters enormously in Class 9 when a signal reflects off the end of a cable.
3. **A water pipe does not care about the return path's route; a circuit cares intensely.** Where
   the current goes back is what causes ground loops, hum, and interference. Class 7 is largely
   about that one sentence.

---

## Series and parallel: the two ways things connect

Two components, two ways to wire them, completely different behaviour. Nearly every wiring mistake
in a theatre is a series/parallel confusion wearing a costume.

<!--anim:series-parallel-->

**In series**, the same current passes through everything, and the voltage divides between them. If
one opens, everything stops. Old Christmas lights. A safety chain of emergency stops. A DMX daisy
chain is a series topology for its shield and a bus for its data, which is why Class 9 spends an
hour on it.

**In parallel**, the same voltage is across everything, and the current divides. If one opens, the
others carry on. Every socket circuit in the building. Every fixture on a bar.

The practical consequences:

| | Series | Parallel |
| --- | --- | --- |
| Same across all | Current | Voltage |
| Divides | Voltage | Current |
| One fails open | Everything stops | The rest carry on |
| Add another item | Total resistance rises | Total resistance falls, total current rises |
| Where you meet it | Safety chains, DMX runs, a fuse in a live leg | Every socket, every dimmer way, every fixture on a bar |

The last row of that table is the one that bites. **Adding another fixture to a parallel circuit
increases the current drawn.** People know this. What they do not do is act on it, which is how a
16 A way ends up with 19 A of LED fixtures on it because each one is "only small".

---

## AC, DC, and why the wall is different

Everything so far has been direct current: a steady push in one direction, which is what a battery
and a power supply give you. The mains is not that.

<!--anim:ac-dc-->

Alternating current reverses direction fifty times a second in Hong Kong, the UK, most of Europe
and Asia, and sixty times a second in North America and parts of Japan. It is used because it can
be transformed to a different voltage cheaply and efficiently, which is what makes national
distribution possible at all.

Three consequences you need today:

1. **The number on the wall is an RMS number, not the peak.** 220 V RMS peaks at about 311 V.
   The RMS value is defined as the DC voltage that would produce the same heating, which is exactly
   why it is the number we use. When you put a scope on the mains in Class 8, you will see the
   peak, and it will look wrong until you remember this.
2. **A meter set to DC will read roughly zero on AC**, because the positive and negative halves
   average out. Getting this wrong is the single most common beginner measurement error, and you
   will make it at least once in Class 2.
3. **AC is what makes hum.** Fifty hertz and its harmonics are in the air, in the ground, and in
   every cable in the building. Class 7 and Class 8 are, in a real sense, four hours of dealing
   with the consequences of this paragraph.

### Extension: three phase, and why the dimmer room has it

<!--anim:three-phase-->

Large buildings are fed with three separate alternating supplies, each a third of a cycle apart.
It lets three times the power travel down four conductors instead of six, and it makes large
motors start smoothly.

For you, in a theatre, three things matter. The voltage between any two phases is about 1.73 times
the voltage from one phase to neutral, so a building with 220 V sockets has 380 V between phases,
and that will kill you considerably faster. Loads should be balanced across the three phases or
the neutral carries the difference. And if you ever see two separate phases arriving at the same
piece of scenery, stop, and get the production electrician, because that is a 380 V hazard sitting
in a place nobody expects one.

---

## Where the current goes: live, neutral, earth

This is the model that makes electrical safety make sense, rather than being a list of rules.

<!--anim:mains-path-->

- **Live** carries current from the supply to the load.
- **Neutral** carries it back. It sits at close to earth potential, but it is *not* a safety
  conductor and it is *not* safe to touch. Under load it will be a volt or two above earth, and
  if it is broken it can sit at full mains voltage.
- **Earth** carries current only when something has gone wrong. In normal operation it does
  nothing at all. Its entire job is to give fault current a path so low in resistance that the
  protective device trips instantly, instead of the fault current finding a path through a person.

That last sentence is the whole of protective earthing. An earth conductor is not there to
"drain electricity away". It is there to **make the fault big enough to be noticed by the fuse**.

This is also why a missing earth is so dangerous and so invisible: everything works perfectly until
the day there is a fault, and then the metalwork is live and nothing trips.

---

## At the bench

Two hours. You will work in pairs, at low voltage only. Nothing today goes anywhere near mains.

### Block A — Prove the three formulae (45 min)

On a bench supply at 12 V, with a set of known resistors and a lamp:

1. Measure the resistance of three resistors with the meter, cold. Write down the value and the
   tolerance band.
2. Predict the current each will draw at 12 V. Write the prediction down *before* you connect it.
3. Measure the actual current. Record both numbers, and the percentage difference.
4. Do the same for the lamp. It will not match your prediction, and it will be out by a factor of
   several. **Do not fix your working.** That mismatch is the whole point of Block B.

### Block B — The lamp that changes its mind (30 min)

The lamp's cold resistance is not its hot resistance. A tungsten filament might measure 3 Ω cold
and behave like 40 Ω hot. Measure the cold resistance, then measure the voltage and current in
operation and calculate the hot resistance from those.

Write down the ratio. Then answer, in your notebook, in one sentence: **what does that ratio tell
you about the current at the instant you switch a lamp on?**

That is inrush, and it is why lamp circuits trip on switch-on and not during the show, and it is
what Class 5 opens with.

### Block C — Series and parallel, by measurement (45 min)

Build the four circuits on the sheet: two lamps in series, two in parallel, three in a mixed
arrangement, and one with an unintended resistance (a deliberately loose terminal) in the loop.

For each: predict, measure, record, and explain any gap. The loose terminal is the interesting one.
Measure the voltage *across the terminal itself* and calculate the power being dissipated in a
connection that is supposed to have none.

---

## Common misconceptions

- **"Low voltage means safe."** Low voltage means low *shock* risk to a healthy person with dry
  skin. It says nothing about the energy available. A 12 V lithium pack can deliver hundreds of
  amps into a short and start a fire in seconds, and a 48 V DC supply can sustain an arc that mains
  AC would self-extinguish.
- **"The earth wire carries electricity away into the ground."** It carries fault current back to
  the supply, not into the soil. Its job is to make a fault draw enough current to trip the
  protective device fast. If it were merely draining to earth, a fault would sit there quietly
  forever with the casing live.
- **"Amps are what you get from the wall and volts are what the device needs."** Both are set by
  the pair. The supply offers a voltage; the load decides how much current it draws at that
  voltage. A socket does not push 13 A into everything plugged into it.
- **"If it works, it is wired correctly."** A reversed live and neutral works perfectly. A missing
  earth works perfectly. A cable at twice its rated current works perfectly, for a while. Working
  is the weakest possible evidence of correctness, and Class 2 exists because of this.
- **"AC and DC are basically the same, one just wiggles."** They behave differently in every part
  of this course: capacitors and inductors respond to AC and ignore DC, transformers only work on
  AC, a DC arc does not self-extinguish, and only AC has an RMS value distinct from its peak.
- **"A thicker cable is always the safer choice."** Thicker is safer thermally, and it is heavier,
  stiffer, more expensive, harder to terminate well, and more likely to be badly strain-relieved.
  A cable that is too stiff for its connector fails at the connector. Class 4 has the numbers.

---

## Numbers from this class

| Quantity | Value |
| --- | --- |
| Ohm's law | `V = I × R` |
| Power | `P = V × I` |
| Power in a resistance | `P = I² × R` |
| Mains voltage, Hong Kong and UK | 220–240 V RMS, 50 Hz |
| Mains voltage, North America | 120 V RMS, 60 Hz |
| Peak of a 230 V RMS sine | about 325 V |
| RMS to peak, sine wave | multiply by 1.414 |
| Three phase to single phase ratio | 1.73 (√3) |
| Phase to phase on a 220 V system | about 380 V |
| Current a 1 kW load draws at 230 V | about 4.3 A |
| Current a 1 kW load draws at 120 V | about 8.3 A |
| Typical domestic socket circuit | 13 A plug fuse, 20–32 A circuit breaker |
| Resistance of a good connection | under 0.1 Ω |
| Voltage dangerous to a person, AC | above 50 V RMS |
| Voltage dangerous to a person, DC | above 120 V |
