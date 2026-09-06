# Class 8 — Hum Hunting and Scope Work

> A meter tells you a number. A scope tells you a shape, and the shape is where the diagnosis is.

## Before you come

### What you must already be able to do

Explain a ground loop as a circuit, not as a phrase. Say what balanced means and where the
cancellation happens. Convert between voltage ratios and decibels for 6 and 20 dB. Calculate an RC
time constant.

### Three things to do

1. **Find a hum somewhere real** — a rehearsal room, a studio, a friend's setup — and write down
   five things about it before you try to fix it: is it a hum or a buzz, does it change with the
   volume control, does it change when you touch the connector, is it present with nothing plugged
   in, and does it change when the lights are dimmed.
2. **Watch a fifteen minute oscilloscope tutorial** and write down the four controls you will need:
   volts per division, time per division, trigger level, trigger source. Everything else on the
   front panel can wait.
3. **Predict what mains looks like on a scope.** Draw it. Include the amplitude in volts. You did
   the arithmetic in Class 1 and most people still draw it wrong.

### What to bring

Meter, notebook, headphones, and your XLR cable.

<!--ready:8-->

---

## The oscilloscope: the first instrument that shows you time

A meter gives you one number, averaged over a period. A scope draws voltage against time, and
almost every problem in this course is a problem in time: a spike, a wrong frequency, a signal that
is present but the wrong shape, a bounce, a reflection.

<!--anim:scope-basics-->

### The four controls that matter

**Volts per division.** Vertical scale. Each grid square is worth this much voltage. Set it so the
waveform fills most of the screen: too small and you cannot see detail, too large and it clips off
the top and you may not realise.

**Time per division.** Horizontal scale. Each square is worth this much time. This is the control
that turns a scope from confusing to useful, because setting it right requires you to have an
expectation of the frequency, which is exactly the prediction discipline from Class 2.

**Trigger level and slope.** The scope starts drawing when the signal crosses a chosen voltage
going in a chosen direction. This is what makes a repeating waveform stand still on screen.

**Coupling: AC or DC.** DC coupling shows everything, including the constant offset. AC coupling
blocks the DC and shows only the variation. This is the control that finds 20 mV of ripple sitting
on a 12 V rail: on DC coupling at 5 V per division you would never see it, and on AC coupling at
10 mV per division it is unmistakable.

<!--anim:scope-coupling-->

### Triggering, which is where beginners give up

<!--anim:scope-trigger-->

An untriggered trace slides across the screen or looks like a blur. The instinct is to fiddle with
the timebase. The fix is almost always the trigger.

The scope needs to know when to start each sweep. Set the trigger source to the channel with the
signal, set the level to somewhere in the middle of that signal's amplitude, and it will lock.

The special case worth knowing now: **single shot**. For an event that happens once — a switch
bouncing, a flyback spike, a start-up transient — set the scope to trigger once and stop. That is
how you captured the flyback in Class 5, and it is how you will catch an intermittent fault.

### Probes, and the mistake everybody makes once

A ×10 probe divides the signal by ten and presents a much lighter load to the circuit. Most probes
have a switch. If the scope does not know which setting you are on, every voltage it reports is
wrong by a factor of ten.

Check the probe setting before you believe any number. Then compensate the probe on the scope's
calibration output: a square wave with rounded or overshooting corners means the probe's
compensation is wrong, and every measurement you take will have the same distortion baked in.

**And the safety one:** a standard scope probe's ground clip is connected to the scope's chassis,
which is connected to mains earth. Clipping it onto anything that is not at earth potential creates
a short circuit through the scope. Never put a standard probe's ground clip on a live mains
conductor. Mains measurements need a differential probe or an isolation transformer, and in this
class the technician does them.

---

## What things look like

Learning to recognise waveforms is most of the diagnostic skill. Here is the catalogue you need.

<!--anim:waveform-zoo-->

| What you see | What it means |
| --- | --- |
| Clean sine at 50 Hz | Mains, or hum coupled from it |
| Sine with flattened tops | Clipping: something is overloaded |
| Sine with a notch each half cycle | Phase-control dimmer on the same supply |
| Small fast ripple on a DC rail | Switch-mode supply switching frequency, tens to hundreds of kHz |
| 100 Hz ripple on a DC rail | Rectifier ripple: a tired smoothing capacitor |
| A single tall narrow spike | Inductive kickback, or a switching transient |
| Fuzzy thickening of the trace | High frequency noise, often RF or a switch-mode supply |
| Steps rather than a smooth curve | Quantisation: you are seeing the resolution limit |
| Trace that will not stand still | Trigger not set, or the signal is not periodic |

### Hum versus buzz, and why the difference matters

**Hum** is a fundamental at 50 or 60 Hz with few harmonics: a smooth, low tone. It points at
magnetic induction from a transformer or a mains cable, or at a ground loop with a clean supply.

**Buzz** is rich in harmonics: harsher, and it extends much higher in frequency. It points at
something chopping the waveform. In a theatre that is almost always a phase-control dimmer, or a
switch-mode supply, or a bad connection arcing.

**100 or 120 Hz** — double the mains frequency — is the signature of a rectifier. It means a power
supply, and usually a failing smoothing capacitor, which is one of the most common faults in old
equipment and one you can now diagnose by ear and confirm on a scope in thirty seconds.

Being able to say "that is 100 Hz, not 50, so it is a power supply and not a ground loop" in the
first minute of a problem is the difference between a ten minute fix and an evening.

---

## A method for hunting hum

The method matters more than the knowledge. Without one you swap cables until it goes away, learn
nothing, and it comes back next week.

<!--anim:hum-method-->

### Step 1 — Characterise before you change anything

Five questions, answered before a single cable is touched:

1. **Hum or buzz?** Which tells you induction and loops, or chopping and switching.
2. **Does it change with the channel fader?** If yes, it enters before that fader. If no, it enters
   after. This one question splits the system in half immediately.
3. **Is it there with the input unplugged?** If yes, the problem is inside the device or its power.
   If no, it comes in on the cable or from the source.
4. **Does touching the connector shell change it?** That is a screen or earth continuity problem.
5. **Does it change when the lighting state changes?** That is a dimmer, and now you are looking at
   a shared supply or a cable route rather than at the audio system.

Write the five answers down. They will exclude most of the possibilities before you move.

### Step 2 — Half-split

You have a chain: source, cable, preamp, processor, amplifier, speaker. Do not start at one end.
Test in the middle, and you halve the problem with each test.

Six devices found by half-splitting takes three tests. Found by working along the chain, it takes an
average of three and a worst case of six, and it feels like guessing because it is. On a
twenty-device system, half-splitting is five tests and sequential searching is up to twenty.

This is the most transferable idea in the whole course. It applies to a DMX line, a network, a
truss circuit and a piece of software.

### Step 3 — Change one thing at a time, and put it back

The rule that makes a technical rehearsal survivable. Every change is written down and reversed if
it did not help. A system where four things were changed and the problem went away is a system that
will do it again, because you do not know which change mattered.

### Step 4 — Prove the fix

Reproduce the fault deliberately after fixing it. If you cannot make it come back by undoing your
fix, you did not find the cause, you found a coincidence.

This step is skipped almost universally and it is the one that separates a repair from a hope.

---

## At the bench

Two hours and fifty minutes.

### Block A — Learn the four controls (35 min)

On a signal generator: get a stable 1 kHz sine on screen and measure its amplitude and period from
the graticule, by hand, before reading the scope's automatic measurements. Then confirm with the
automatic ones.

Change to 100 Hz and 10 kHz and set up each from scratch. Then square, then triangle. Then find the
compensation output and check your probe.

### Block B — The waveform zoo (35 min)

Nine stations, each with a signal. Identify each one, sketch it, and write what it would mean if
you found it in a real system. The list above is the answer key and you should not need it.

Station 7 is mains on a differential probe, and you will finally see the peak that Class 1 told you
about.

### Block C — Ripple hunting (30 min)

Three DC power supplies, one healthy, one with a tired smoothing capacitor, one switch-mode.

Measure each on DC coupling first: all three read about 12 V and all three look identical. Then AC
coupling at 20 mV per division and they become three completely different objects. Measure the
ripple amplitude and frequency of each, and identify which is which from the frequency alone.

### Block D — The hum hunt (60 min)

A deliberately built system with four faults in it: a ground loop, an unbalanced connection where a
balanced one belongs, a cable with an open screen, and a dimmer sharing a supply.

Work in pairs. Use the five questions, half-split, and change one thing at a time. Log every test
and its result. Find all four.

The marking is on the log, not on the time. A pair who found three faults with a clear log has done
better work than a pair who found four by swapping cables at random, because only one of those two
methods works on a fault nobody has seen before.

### Block E — Prove it (10 min)

Put each fault back, one at a time, and confirm the symptom returns. Anything you cannot reproduce
goes back on the list as unproven.

---

## Common misconceptions

- **"The scope is for advanced work."** It is the fastest instrument for the most common questions:
  is the signal there, is it the right size, is it the right shape, is it the right frequency. Four
  controls answer all of those and everything else on the panel can wait.
- **"A trace that will not stand still means the signal is unstable."** It almost always means the
  trigger is not set. Set the trigger source to the channel carrying the signal and the level to the
  middle of its amplitude, and it locks.
- **"AC coupling and DC coupling are a preference."** They answer different questions. A 20 mV
  ripple on a 12 V rail is invisible on DC coupling and obvious on AC coupling. Choosing wrongly
  means the fault is on the screen and you cannot see it.
- **"Hum is hum."** 50 Hz, 100 Hz and a harmonic-rich buzz have three different causes: induction or
  a loop, a rectifier and a tired capacitor, and something chopping the waveform. Identifying which
  one you have is most of the diagnosis and takes seconds.
- **"You can put a scope on the mains."** Not with a standard probe. Its ground clip is bonded to
  mains earth through the instrument, so clipping it to a live conductor creates a short through the
  scope. Differential probe or isolation transformer, or you watch somebody else do it.
- **"Once the noise is gone, the job is done."** If you cannot make the fault come back by undoing
  your change, you have not proved the cause. Unproven fixes reappear, usually in a performance,
  usually when the person who made the change is not in the building.

---

## Numbers from this class

| Quantity | Value |
| --- | --- |
| Mains hum fundamental | 50 Hz or 60 Hz |
| Rectifier ripple frequency | 100 Hz or 120 Hz |
| Switch-mode supply switching frequency | 20 kHz to several hundred kHz |
| Scope probe attenuation, ×10 setting | divide by 10 |
| Period of 50 Hz | 20 ms |
| Period of 1 kHz | 1 ms |
| Period of 100 Hz | 10 ms |
| Frequency from period | `f = 1 ÷ T` |
| Acceptable ripple on a 12 V rail | under about 100 mV peak to peak |
| Scope ground clip potential | mains earth, always |
| Half-split searches for 16 items | 4 tests |
| Sequential search for 16 items | up to 16 tests |
| Peak of 230 V RMS | about 325 V |
| Typical hum level worth chasing | anything above −60 dB relative to programme |
