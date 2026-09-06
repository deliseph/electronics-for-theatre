# Class 14 — Build a Triggered Effect

> Sensor, decision, actuator, on a cue, eighty times, with a defined behaviour when somebody pulls
> the plug halfway through.

## Before you come

### What you must already be able to do

Everything from Classes 11, 12 and 13. A state machine on paper. Debounced inputs. An ADC reading
with range checking. Driving a load through your Class 6 board. Normally closed safety wiring.

### Three things to do

1. **Choose your effect and write one sentence about what the audience sees.** Not what it does
   electrically. What the audience sees. If you cannot write that sentence, you are not ready to
   build it.
2. **Draw the state machine and the failure table** before you arrive. The failure table is four
   rows: power-up, control lost, sensor out of range, and reset.
3. **List your parts** and check the department has them. A build class where you discover at hour
   two that there are no 12 V solenoids is a build class you spent watching.

### What to bring

Everything you own from this course. This is a full build.

<!--ready:14-->

---

## The brief

In teams of two, build a triggered effect that:

- **Is triggered by a sensor and by a cue**, and behaves sensibly if both arrive at once
- **Drives a real actuator** through your Class 6 driver board
- **Has a defined and documented power-up state**
- **Detects loss of control** and does something you decided in advance
- **Detects an out-of-range sensor reading** and treats it as a fault
- **Can be reset by one documented physical action**
- **Shows its state on an indicator** readable from across the room
- **Comes with a one-page sheet** somebody else can operate it from

Choose from: a triggered practical lamp that flares on an actor's arrival, a door latch released on a
cue, a triggered smoke or fan burst, a flickering fire effect that responds to proximity, a
mechanical reveal on a limit-switched slide.

The effect is not the assessment. **The failure behaviour and the handover are the assessment.**

---

## Designing the chain

<!--anim:effect-chain-->

Four questions, in this order, before a wire is stripped.

**1. What does the audience see, and how tightly is it timed?**

A flare that must land on a word needs the whole chain under about 50 ms. A slow reveal has seconds
of slack. That number decides everything downstream, including whether you can afford a network hop
and how much debounce you can spend.

**2. What is the trigger, and what fools it?**

Write down three things that would falsely trigger your sensor. For a pressure mat: a dropped prop,
a stagehand crossing, a piece of scenery resting on it. For a beam: a cable swinging, a costume, a
haze effect.

Then decide, for each, whether you prevent it, detect it, or accept it. All three are legitimate.
Not deciding is not.

**3. What is the actuator, and what does it do while it is not being asked to do anything?**

A solenoid holding is heating. A servo holding is buzzing and drawing current. A motor stopped on a
slope is being held by friction alone. The idle state is where the run-length failures live, and it
is the question nobody asks in a workshop because the workshop is twenty minutes long.

**4. What happens between the cue and the movement, and what if the cue arrives twice?**

The double-tap is not an edge case. An operator who is unsure whether a cue fired will press again,
every time, on every production, forever. Decide now: ignore, restart, or queue.

---

## Cue and sensor together

<!--anim:trigger-logic-->

Two ways in, one effect. Four combinations, and all four need an answer:

| Sensor | Cue | Behaviour |
| --- | --- | --- |
| No | No | Idle |
| Yes | No | ? |
| No | Yes | ? |
| Yes | Yes | ? |

The middle two rows are the design. Three common patterns:

**Cue arms, sensor fires.** The desk arms the effect during the right scene; the sensor triggers the
exact moment. The best of both: the operator retains control of *whether*, the sensor controls
*when*. This is the pattern to reach for first.

**Either fires it.** Simple, and it means a false sensor trigger fires the effect in the wrong
scene. Only acceptable when a spurious fire is harmless.

**Both required within a window.** Sensor within two seconds of the cue. Robust against both false
triggers and mistimed cues, and it fails silently when they do not coincide, so it needs an
indicator that shows you missed rather than pretending nothing was asked for.

Choose one and write down why. In the handover exercise, another team will ask.

---

## The build discipline

Same as Class 6 and Class 12, because it is the same discipline everywhere:

1. **Skeleton first.** State machine, indicator, timing. No load. Prove every transition on the
   indicator alone.
2. **Then inputs.** Debounced, range-checked, with the fault path proved by shorting the input to
   both rails.
3. **Then the output, on a lamp**, not the real actuator. A logic error that fires a lamp is a
   lesson; the same error firing a solenoid at somebody's hand is an incident.
4. **Then the real actuator**, with the current measured and the temperature checked after four
   minutes of realistic duty.
5. **Then break it**, on purpose, in every way in your failure table.
6. **Then write the sheet**, and hand it over.

<!--anim:build-discipline-->

Nobody skips straight to step 4 twice. They skip it once, and then they have a story.

---

## Testing for a run, not for a demo

<!--anim:run-testing-->

A demo is one operation with everybody watching. A run is eighty operations over six weeks with
nobody watching. Four tests that find run failures and that a demo never will:

**The hundred cycle test.** Run the effect a hundred times, automatically, and watch what drifts.
Solenoid temperature, servo position, stepper count, contact resistance. Log the first, fiftieth
and hundredth, and if anything has moved, you have found a run failure in twenty minutes instead of
in week three.

**The thermal test.** Run it at the worst realistic duty for fifteen minutes and measure everything
that could get warm: the actuator, the MOSFET, the regulator, the connector. Anything you cannot
hold your finger on is a question that needs an answer, and the answer must be a number.

**The interruption test.** Cut power mid-operation. Cut it at three different points in the cycle.
Restore it. Does it come up where you said it would, every time? This is the test that catches the
prop that resumes mid-flare.

**The stranger test.** Somebody who has not seen it, given only your sheet, must be able to power it
up, trigger it, cause a fault, identify the fault from the indicator, and reset it. If they cannot,
the sheet is wrong and the sheet is what goes on the production.

---

## At the bench

Three hours and twenty minutes. Continuous build.

### Block A — Design review (25 min)

Present your state machine and failure table to another team in five minutes. They ask three
questions. You answer, or you change the design.

The question that will be asked and that most teams have not answered: **what happens if the cue
arrives twice?**

### Block B — Skeleton and inputs (55 min)

Steps 1 and 2 above. Checkpoint: another team must be able to drive your state machine through every
state using only the indicator to see where it is.

### Block C — Output on a lamp, then the real actuator (60 min)

Steps 3 and 4. Measure the actuator current. Measure the MOSFET temperature after four minutes. Note
both.

### Block D — Break it (40 min)

Your whole failure table, plus the four run tests. The hundred cycle test runs while you do the
others.

Log everything. Behaviours you did not predict are the most valuable output of today.

### Block E — Handover (20 min)

Write the sheet. Swap with another team. Operate theirs from the sheet alone, in silence, and write
down every moment you had to guess.

Give the notes back. That exchange is the assessed artefact, and the notes you receive are worth
more than the marks.

---

## Common misconceptions

- **"The effect working is the milestone."** The effect working is step four of six. Steps five and
  six are what decide whether it can go on a production, and they are what is assessed.
- **"A double cue press is an edge case."** It is what every operator does when they are not certain
  the first press registered, which is every time the effect is subtle or delayed. Decide between
  ignore, restart and queue, and write it down.
- **"Test it on the real actuator so the test is realistic."** Test the logic on a lamp first. A
  logic error that lights a lamp is a lesson. The same error firing a solenoid or a motor near a
  hand is an incident report.
- **"It ran twenty times, so it is reliable."** Twenty operations is a demo. Solenoid heating,
  stepper drift, contact wear and connector fatigue all appear between fifty and several hundred
  cycles, which is exactly the range a show run lands in.
- **"The documentation is for the archive."** It is for the person operating it at 19:45 when it has
  stopped and you are not in the building. If the stranger test fails, the sheet is a defect, not a
  formality.
- **"If it fails safe, the failure does not matter."** Failing safe means nobody is hurt. It still
  means the effect did not happen, and a production needs to know how likely that is and what the
  indicator will show when it does. Safe and reliable are separate requirements.

---

## Numbers from this class

| Quantity | Value |
| --- | --- |
| Chain latency for a tightly timed effect | under about 50 ms |
| Debounce contribution to latency | 20–50 ms |
| Network hop contribution | 5–50 ms |
| Relay actuation | 5–15 ms |
| Cycle test, minimum | 100 operations |
| Thermal test duration | 15 minutes at worst realistic duty |
| Interruption test | power cut at 3 different points in the cycle |
| Component temperature needing an explanation | anything you cannot hold a finger on |
| Documentation | one side of A4, in the case |
| Handover test | a stranger operates it from the sheet alone |
| Trigger patterns | cue arms and sensor fires; either fires; both within a window |
| Power-up state | safe, outputs off, every time |
