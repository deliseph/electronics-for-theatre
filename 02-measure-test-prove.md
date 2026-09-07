# Class 2 — Measure, Test, Prove

> A meter does not tell you the truth. It answers a very specific question, and most bad
> measurements are the right answer to the wrong question.

## Before you come

### What you must already be able to do

Say what voltage, current, resistance and power each do, in your own words, without the formulae in
front of you. Rearrange `V = I × R` in both directions. Explain why a voltage reading needs two
probes and a resistance reading needs the circuit dead.

If Class 1's bench work did not happen for you, read its bench section and do Block A at home with
a battery and a torch bulb before you arrive. Two hours of today is measurement, and there is no
way to catch up during it.

### Three things to do

1. **Buy or borrow a multimeter and bring it.** The [kit list](/toolkit) says exactly what to look
   for and what to avoid. You need a meter with a fused current range and a CAT rating. A five
   dollar meter with no fuse is not cheaper, it is a different product that happens to look
   similar.
2. **Find the fuse in your meter.** Open it, look at it, close it. Know its rating before you need
   to know it, which will be about ninety minutes into today.
3. **Measure three batteries** in things you own, and write down the reading, the rated voltage,
   and whether the thing still works. A AA cell at 1.2 V is not the same story as one at 1.5 V.

### What to bring

Your meter, your notebook, and a set of probes you have looked at closely enough to know whether
the insulation is intact.

<!--ready:2-->

---

## Run of the session

Four hours, accounted for. Blocks are an order of work rather than a timetable: a class that runs
long on the bench is a class that is going well. The minutes are here so that you know what you are
trading against when it does.

| Min | Block | What happens |
| --- | --- | --- |
| 10 | Open | Numbers quiz, and the two sentences this class is about |
| 40 | The idea | What each meter mode really asks the circuit, the four rules of measuring, and the three ways a meter lies |
| 30 | Bench A | Calibrate yourself against your own meter on things you already know |
| 45 | Bench B | Prediction discipline: ten circuits, predicted before measured |
| 15 | Break |  |
| 45 | Bench C | Make the meter lie to you, deliberately: loading, ghost voltage, in-circuit resistance |
| 30 | Bench D | Fifteen cables, five-step procedure, logged and labelled |
| 15 | Watch | Proving dead on a live circuit, demonstrated |
| 10 | Close | The two tests everybody skips, and why they are the two that matter |

---

## Why this class is here

The single most valuable professional habit in this entire course is the difference between these
two sentences:

> "It should be fine."
>
> "I measured it and it reads 231 volts between live and earth at the socket."

Everybody can say the first. The second is what you are paid for. A technical director who measures
is worth several who assume, and the gap is entirely a matter of habit rather than talent.

This class is about building that habit and, just as importantly, about understanding what the
instrument is actually doing so you know when to disbelieve it.

---

## What each meter mode really does

A multimeter is not one instrument. It is four or five different instruments sharing a display, and
each connects to the circuit in a fundamentally different way. Confusing them is how meters die.

<!--anim:meter-modes-->

### Voltage: a very high resistance placed across two points

In voltage mode the meter is a large resistance, typically 10 MΩ, that you connect **in parallel**
across the thing you want to know about. It draws a tiny current and reports the pressure
difference. Because it is high resistance, it disturbs most circuits very little.

Most of the time. Not always, and the exception is Block C at the bench today.

### Current: a very low resistance placed in the path

In current mode the meter becomes a near short circuit, a fraction of an ohm, that you must insert
**in series** by breaking the circuit and letting the current flow through the meter.

This is the mode that kills meters, blows fuses and occasionally makes a bang, because a
near-zero-resistance instrument placed *across* a supply is a deliberate short circuit.

<!--anim:meter-in-circuit-->

**Learn this as a physical habit, not a fact:** when you move the red lead to the current jack, you
have changed the instrument into something that must never touch two points at different
potentials. Move it back the moment you are done. Many professionals simply never leave a meter in
current mode.

### Resistance: the meter supplies the current itself

In resistance mode the meter pushes a small known current through the component and measures the
resulting voltage. Two consequences follow immediately, and both are examinable:

1. **The circuit must be dead.** Any voltage present adds to or fights the meter's own test
   current, and the reading is meaningless. It can also damage the meter.
2. **You are measuring every path between the probes, not the component.** A resistor soldered onto
   a board is in parallel with everything else on that board. This is why you lift one leg, and why
   in-circuit resistance readings that look wrong usually are not the component's fault.

### Continuity: resistance, with a threshold and a buzzer

Continuity is resistance mode with an opinion. Below some threshold, often 30 to 50 Ω, it beeps.

The beep is a convenience and a trap. It tells you a path exists. It does not tell you the path is
good enough to carry current, and it does not tell you the path will still be there under
mechanical load or when warm.

<!--anim:continuity-->

A cable that beeps is not a proven cable. A cable that beeps *while you flex it along its whole
length and at both connectors* is much closer to proven. That flex test is the single most useful
five seconds in cable maintenance and almost nobody does it.

---

## The four rules of measuring

These are the rules the bench work today is built on, and they are the ones the capstone will
assess you on.

### 1. Say what you expect before you look

Write the prediction down. A measurement you have not predicted is a number; a measurement that
contradicts a prediction is information. This is not a study technique, it is how you catch a
mis-set meter: if you expected 12 V and see 0.012, you notice the range immediately.

### 2. Record both probes, every time

"230 V" is not a measurement. "230 V between live and neutral at socket 4, house lights off" is.
Six weeks later, in a fault report, only one of those is worth anything.

### 3. Prove the meter before you trust the result

Especially before you declare something dead. The procedure is **live, dead, live**: prove the
meter reads correctly on a known live source, take your reading on the circuit under test, then
prove the meter again on the known live source. A meter with a flat battery or a broken lead reads
zero volts on everything, and zero volts is exactly the answer you were hoping for.

This is not optional professional caution. It is the standard method, and skipping it is how people
are killed by circuits they had "tested".

### 4. A measurement without a written record did not happen

Your notebook is the deliverable. In the capstone, a correct diagnosis with no measurement log
scores below a partial diagnosis with a clear one, because only one of those two is repeatable by
somebody else.

---

## When the meter lies

Three effects that will each cost you an hour, once, if you have not met them.

### Ghost voltage

<!--anim:ghost-voltage-->

A 10 MΩ meter connected to a disconnected wire that runs alongside a live one will read a
substantial voltage — sometimes 40, 60, over 100 volts. It is real, and it is capacitively coupled
through the insulation between the two cables. There is essentially no current behind it.

This matters in two directions. It makes people think a dead circuit is live, which wastes time.
And it makes people learn to ignore meter readings, which is far worse. The correct response is to
use a low-impedance mode if your meter has one, or a proving unit, and never to develop the habit
of dismissing a reading you do not like.

### The loading effect

<!--anim:loading-effect-->

Ten megohms is a lot, but it is not infinite. Across a high-impedance source — a divider made of
1 MΩ resistors, a piezo sensor, an unbuffered analogue input — the meter itself changes the reading
by drawing current. You measure 4 V on a divider that is genuinely sitting at 5 V, and the
difference is your instrument.

The rule of thumb: if the source impedance is more than about a hundredth of the meter's input
impedance, expect to be reading low. This is exactly the situation in Class 13 with sensor
dividers, which is why it is worth meeting now.

### Averaging versus true RMS

<!--anim:true-rms-->

A cheap meter measures the average of a rectified AC waveform and multiplies by 1.11, which is the
correct factor for a pure sine wave and the wrong factor for everything else. Put it on the output
of a phase-controlled dimmer, a switch-mode supply or an LED driver, and it will be wrong, often
by twenty to forty per cent, always in a direction you cannot predict.

A true-RMS meter computes the actual heating value regardless of shape. In a theatre, where almost
nothing draws a clean sine any more, this is worth the price difference and it is on the kit list
for that reason.

---

## Testing a cable properly

This is the one procedure everybody in this room will use every week for the rest of their working
life, so it is worth doing correctly rather than habitually.

For a two-conductor or three-conductor cable, with the cable disconnected from everything:

1. **Continuity, pin to pin.** Pin 1 to pin 1, pin 2 to pin 2, pin 3 to pin 3. Expect under 1 Ω for
   anything short, and record the actual number rather than the beep.
2. **Isolation, pin to pin.** Pin 1 to pin 2, pin 1 to pin 3, pin 2 to pin 3. Expect open circuit.
   This is the test that catches a whisker of stray strand bridging two pins, which is the fault
   that makes an audio cable hum and a DMX line drop out.
3. **Isolation to shell.** Every pin to the connector body. Expect open, unless the design bonds
   the shield to the shell, which for XLR you should know either way and label.
4. **The flex test.** Repeat step 1 while flexing the cable at both connector strain reliefs and
   along its length. This catches the cracked conductor that is intermittently making contact,
   which is the single most common cable fault and the one that never shows up on a static test.
5. **Label it.** A cable that has passed and is not labelled will be tested again next week by
   somebody else. Date and initial.

Steps 2 and 4 are the ones that get skipped, and they are the two that find the faults that waste a
technical rehearsal.

---

## Measuring current without breaking the circuit

Everything above assumes you can open the circuit and insert the meter. On a mains circuit, in a
rack, during a show, you cannot.

<!--anim:clamp-meter-->

A **clamp meter** measures the magnetic field around a conductor and reports the current in it,
with no electrical connection and nothing disconnected. It is the only practical way to answer "how
much is that circuit actually drawing" on a live installation, and for a technical director it is
often the more useful instrument of the two.

Four things to know before you trust one:

1. **Clamp one conductor only.** Around a whole flex, the live and neutral currents are equal and
   opposite and cancel: the meter reads zero. That is not a fault, it is the same physics an RCD
   uses, and it catches everybody once.
2. **AC clamps are common, DC clamps are not.** A cheap clamp meter reads AC only, because it works
   by transformer action and a steady field induces nothing. A Hall-effect clamp reads both and
   costs more.
3. **Low currents are where they are worst.** Below an amp or so, a general-purpose clamp is
   guessing. Wind ten turns of the conductor through the jaw and divide the reading by ten: an old
   trick, and it genuinely works.
4. **True RMS matters more here than anywhere**, because what you are usually clamping is a dimmer
   or a switch-mode load, which is exactly the waveform an averaging meter gets wrong.

---

## Proving insulation, which is a different question

Continuity asks "is there a path". Insulation testing asks the opposite: **"is there definitely no
path"**, at a voltage high enough to matter.

<!--anim:insulation-test-->

An insulation tester applies 250, 500 or 1000 V DC between conductors, or between a conductor and
earth, and measures the resistance. Your multimeter applies a couple of volts, and insulation that
looks like ten megohms at 2 V can break down completely at 500 V. That gap is the whole reason the
instrument exists.

What the numbers mean, roughly:

| Reading at 500 V | What it means |
| --- | --- |
| Above 100 MΩ | Healthy |
| 2 MΩ to 100 MΩ | Usually acceptable, worth a note and a re-test |
| Under 1 MΩ | Investigate. Damp, contamination, or damaged insulation |
| Under 0.5 MΩ | Fail. Do not energise |

**Two warnings.** It applies a real voltage, so nothing sensitive may be connected: semiconductors,
surge protection and any electronics will be damaged or will make the reading meaningless. And the
cable holds a charge afterwards, so a proper tester discharges it and you check that it has.

You will watch this in Class 6 on your own driver board, and again in Class 15 on a cable.

---

## At the bench

Nearly three hours. Low voltage throughout, except one demonstration you will watch rather than do.

### Block A — Calibrate yourself against your meter (30 min)

Before you measure anything unknown, find out what your instrument does on things you know.

Measure a fresh AA cell, a known 10 kΩ resistor, a piece of wire, and your own body resistance
between two fingers, dry, then with damp fingers. Write all of it down. That last measurement is
the one worth keeping: put the two numbers in your notebook and remember them for Class 15.

### Block B — Prediction discipline (45 min)

Ten small circuits on the bench sheet. For each: predict, then measure, then record the gap.

The mark is not for accuracy. It is for whether your prediction was written before your
measurement, which is why the sheet has the two columns in that order and the technician will
initial the prediction column before you start measuring.

### Block C — Make the meter lie to you, deliberately (45 min)

Three set pieces, and you should reproduce all three yourself:

1. **Loading.** A 1 MΩ / 1 MΩ divider on 10 V. Predict 5 V. Measure. Explain the gap using the
   meter's input impedance, with the arithmetic written out.
2. **Ghost voltage.** A disconnected conductor run alongside an energised one. Measure it on high
   impedance, then load it with a 100 kΩ resistor and measure again. Watch it collapse.
3. **In-circuit resistance.** A resistor on a populated board. Measure in circuit. Lift one leg.
   Measure again. Explain the difference in terms of parallel paths.

### Block D — Fifteen cables (30 min)

Fifteen cables on the bench. Some are good. Some have exactly one of the faults in the list above.
Test all fifteen with the five-step procedure, log them, and label them.

Then swap benches and test somebody else's fifteen. The pairs of results will not agree, and the
disagreements are the discussion that ends the class.

### Watch, do not do — proving dead on a live circuit (15 min)

The technician demonstrates live-dead-live on a real circuit with a proving unit. You watch. You
will do this yourself in Class 15, after the safety systems class, and not before.

---

## Common misconceptions

- **"The meter reads what is there."** The meter reads what its own presence in the circuit
  produces. High impedance in voltage mode, near zero in current mode, and its own injected current
  in resistance mode. All three change the circuit, and in three specific cases they change it
  enough to matter.
- **"It beeped, so the cable is good."** Continuity proves a path exists at that instant, at
  essentially zero current, with the cable lying still. It does not prove the path is low
  resistance, that it survives flexing, or that no two pins are also connected to each other.
- **"Zero volts means it is dead."** It means the meter reported zero. A meter with a flat battery,
  a broken lead, or set to the wrong function also reports zero. Live-dead-live is the only method
  that distinguishes those, and it is the reason the procedure exists.
- **"A more expensive meter is more accurate."** Above the very cheapest tier, you are paying for
  safety rating, input protection, a proper fuse, true-RMS and lead quality, not for extra digits.
  The digits on a cheap meter are usually honest; the CAT rating printed on it often is not.
- **"You can measure current by putting the probes across the load."** That is voltage mode's
  connection. Doing it in current mode places a near short circuit across the supply. This is how
  meters are destroyed and how the fuse in your meter earns its cost, and it is the reason step one
  of the kit list is a fused meter.
- **"In-circuit resistance readings are unreliable, so ignore them."** They are entirely reliable
  measurements of a different thing: every parallel path between your probes. Once you know that,
  they become useful, and a reading much lower than expected tells you something real about the
  board.

---

## Numbers from this class

| Quantity | Value |
| --- | --- |
| Typical multimeter input impedance, voltage mode | 10 MΩ |
| Typical multimeter resistance, current mode | under 1 Ω, plus the shunt |
| Continuity beep threshold, typical | under 30–50 Ω |
| Good cable conductor, end to end | under 1 Ω |
| Good connection, resistance | under 0.1 Ω |
| Suspect connection, resistance | above 0.5 Ω |
| Dry skin, hand to hand | 10 kΩ to 100 kΩ |
| Damp or broken skin, hand to hand | 1 kΩ or less |
| Average-responding meter error on non-sine | 20–40 per cent, direction unpredictable |
| Loading error becomes significant when source is | above about 100 kΩ |
| Proving procedure | live, dead, live |
| Fresh alkaline AA cell | 1.5–1.6 V |
| Alkaline AA considered flat | below 1.1 V under load |
| Meter fuse, typical current range | 200 mA fast blow, and 10 A |
