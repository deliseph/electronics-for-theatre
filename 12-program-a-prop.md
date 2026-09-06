# Class 12 — Program a Prop

> The first performance is easy. Today is about the eightieth, and about the one where somebody
> unplugs it in the interval.

## Before you come

### What you must already be able to do

Blink without `delay()`. Debounce a switch. Read an ADC. Drive a load through the Class 6 board.
Explain a pull-down and what happens to your input when its cable is cut.

### Three things to do

1. **Write the `millis()` blink from memory**, without looking it up. If you cannot, write it out
   three times. It is the skeleton of everything today.
2. **Describe a prop you have seen fail** in one paragraph: what it did, what it should have done,
   and what you think the cause was.
3. **Draw a state machine for a kettle.** Off, heating, boiled, and what causes each transition.
   Five minutes. It will make the middle of today much easier.

### What to bring

Board, laptop, your Class 6 driver board, meter, breadboard, and a USB cable that carries data.

<!--ready:12-->

---

## What makes prop firmware different

Bench code has one job: demonstrate that the idea works. Show firmware has four:

1. **Do the effect.**
2. **Do it identically every time**, for the whole run.
3. **Fail safely and visibly** when something goes wrong.
4. **Be recoverable in thirty seconds** by somebody who did not write it, in the dark, during an
   interval.

Points 2 to 4 are almost all of the work, and they are what separates a prop that goes on stage from
one that stays in the workshop.

---

## State machines: the shape all of this wants to be

<!--anim:state-machine-->

A prop is nearly always a state machine: it is in exactly one state, it does something appropriate
to that state, and defined events move it to another state.

Take a lantern that flickers, is triggered to flare, then settles:

```
IDLE  --cue received-->  FLARE  --after 800 ms-->  SETTLE  --after 2 s-->  BURN
BURN  --cue received-->  FLARE
any   --fault detected-->  SAFE
SAFE  --reset held 2 s-->  IDLE
```

Writing this out before you write code changes what you build, because it forces three questions
that are otherwise never asked:

- **What happens if the cue arrives during FLARE?** Ignore it, restart it, or queue it. All three
  are defensible and you must choose deliberately, because the answer is what the operator will
  experience on the night they double-tap.
- **What state is it in at power-up?** Whatever you initialise it to, and if you did not think about
  it, that is whatever the compiler put there.
- **What state does it go to on a fault?** If you have no answer, it has no fault behaviour.

### In code

```c
enum State { IDLE, FLARE, SETTLE, BURN, SAFE };
State state = SAFE;              // WHY: power-up lands in SAFE, never in an
                                 // energised state. A prop that comes up
                                 // burning when the power blips mid-scene is
                                 // a prop that has surprised somebody on stage.
unsigned long stateEntered = 0;

void enter(State s) {
  state = s;
  stateEntered = millis();
}

void loop() {
  unsigned long now = millis();
  bool cue = readCue();          // debounced, every pass
  if (!healthy()) enter(SAFE);   // checked before anything else acts

  switch (state) {
    case IDLE:
      setLamp(0);
      if (cue) enter(FLARE);
      break;
    case FLARE:
      setLamp(255);
      if (now - stateEntered >= 800) enter(SETTLE);
      break;
    case SETTLE:
      setLamp(map(now - stateEntered, 0, 2000, 255, 90));
      if (now - stateEntered >= 2000) enter(BURN);
      break;
    case BURN:
      setLamp(90 + flicker());
      if (cue) enter(FLARE);
      break;
    case SAFE:
      setLamp(0);
      if (resetHeld(2000)) enter(IDLE);
      break;
  }
}
```

Every state sets its outputs explicitly on every pass. That is deliberate: an output that is only
set on a transition will be wrong if anything ever reaches that state by another route, and
"anything" includes the noise spike from Class 5.

---

## Failing safely

<!--anim:fail-safe-->

Four questions to answer, in writing, for every prop you build. In the capstone they are marked.

**1. What happens on power-up?** Everything off, and stay off until something positively says
otherwise. A prop that resumes its previous state on power-up is a prop that fires in the interval
when the power blips.

**2. What happens when control is lost?** DMX stops, the cue cable is unplugged, the network drops.
Options: hold the last state, fade to a safe state over some seconds, or go dark immediately.

All three are correct in different contexts. A practical lamp holding its last state is fine. A
moving element holding its last state may be fine or may be dangerous. **What is not acceptable is
not having decided**, and the decision must be on the documentation sheet where the production
manager can read it.

**3. What happens when something is out of range?** A sensor reading that is impossible — a distance
of −4 mm, a temperature of 300 °C — means the sensor or its wiring has failed, not that the world
has become strange. Detect it and go to SAFE. A prop that acts on an impossible reading is a prop
that does something violent because a wire came loose.

**4. How does somebody reset it?** One action, documented, ideally physical: hold a button for two
seconds. Not a power cycle, because a power cycle in a rack means finding which of forty plugs it
is. And not automatic, because a fault that clears itself will recur on stage.

### The watchdog

Most microcontrollers have a hardware timer that resets the chip unless the software regularly tells
it not to. If your code hangs, the watchdog resets it within a second or two.

Use it, and understand what it does and does not give you. It saves you from a software hang. It
does not save you from wrong logic, and a prop that resets into a bad state every two seconds
forever is worse than one that simply stopped. The watchdog and question 1 have to be answered
together.

---

## Receiving DMX

<!--anim:dmx-receive-->

Making a prop respond to the lighting desk is often the right architecture, because it puts the prop
into a cue stack that already exists and is already operated by somebody trained.

Three practical points:

**You need an RS-485 receiver chip**, a MAX485 or similar. The DMX line is differential at RS-485
levels; a microcontroller pin cannot read it directly, and connecting one to it is how you damage
a pin.

**Isolate it.** A DMX line runs all over the building and touches equipment on other power circuits.
An isolated receiver protects your prop, and more importantly protects the rest of the rig from a
fault in your prop. This is the Class 5 argument in its most concrete form.

**Watch for signal loss.** Note the time each valid packet arrives. If more than a second passes with
none, control has been lost — apply the answer to question 2 above. This is a few lines of code and
it is the difference between a prop that behaves predictably when a cable is kicked out and one
that does something nobody can explain.

---

## Making it maintainable

You will not be in the building on the night it fails. The person who is has never seen your code.

**A status indicator that says something.** Not "powered". An LED that blinks a pattern per state:
one blink idle, two blinks running, rapid blinking for a fault. Somebody with the documentation
sheet can then diagnose from six metres away without a laptop.

**Constants at the top, named.** Every timing, every threshold, every pin, named and in one place. On
the night somebody needs the flare 200 ms longer, the change should be one obvious line.

**Comment the why, not the what.** `// set pin 9 high` is noise. `// Lamp off before the relay
switches: the inrush from a cold filament welds the contacts over a run.` is worth its space and
will still be true in three years.

**The documentation sheet.** The same discipline as the Class 6 board: what it is, its ratings, its
pinout, its behaviour on power-up and on loss of control, its reset procedure, its indicator codes,
and who to call. One side of A4, laminated, in the flight case.

---

## At the bench

Three hours and twenty minutes. You are building a real prop and it must work at the end.

### Block A — Draw the state machine (25 min)

On paper, before any code. States, transitions, events, and the answers to the four failure
questions. Get it signed off by another pair.

Most of the bugs found later today will be in state machines that were not drawn.

### Block B — Build the skeleton (45 min)

States, transitions, timing with `millis()`, debounced input, and the status LED. No effect yet, no
outputs beyond the indicator. Prove every transition happens when it should by watching the
indicator.

Getting this working before adding the effect is the whole method: the skeleton is the part that has
to be correct, and it is much easier to debug with nothing else moving.

### Block C — Add the effect (50 min)

Drive the real load through your Class 6 board. PWM for the lamp, with a dimming curve. Flicker that
looks like fire rather than like a random number, which takes a low-frequency wander plus a small
fast component and is worth the twenty minutes it takes to tune.

Measure the PWM frequency on the scope and confirm it is where you intended.

### Block D — Break it deliberately (40 min)

Test every failure mode you wrote down:

- Cut power mid-effect and restore it. Where does it come up? Is that where you said?
- Disconnect the trigger cable. What happens?
- Short the sensor input to ground, then to the supply. Both should be detected as out of range.
- Hold the trigger permanently. Does it fire once or forever? Which did you intend?
- Send a cue during FLARE. What happens? Is it what you documented?

Log each one. The behaviours you did not predict are the interesting ones.

### Block E — Documentation and handover (30 min)

Write the sheet. Then swap props with another pair and operate theirs from their sheet alone,
without talking to them.

Anything you cannot work out from the sheet is a defect in the sheet. That exchange is the assessed
part, and it is the closest thing in this course to what actually happens on a production.

---

## Common misconceptions

- **"It works, so the firmware is finished."** It works on the bench, on the first try, with
  everything connected. The show is the eightieth try, in the dark, after somebody unplugged
  something in the interval. Points 2 to 4 in this class are the work.
- **"Power-up state is a detail."** It is the behaviour every audience will eventually see, because
  power blips happen. A prop that comes up in its last state can fire during a scene it is not in.
  Initialise to SAFE, always, and say so on the sheet.
- **"If control is lost, holding the last state is the safe default."** For a lamp, usually. For
  anything that moves, holds pressure, or is hot, holding may be exactly wrong. There is no
  universal answer, which is why the requirement is to decide and document rather than to follow a
  rule.
- **"An impossible sensor reading is just noise, so filter it."** An impossible reading means the
  sensor or its wiring has failed. Filtering it hides a fault and lets the prop act on invented
  data. Detect it, name it, go to SAFE.
- **"The watchdog makes it reliable."** It recovers from a hang. It does nothing about wrong logic,
  and a prop resetting every two seconds into a bad state is worse than one that stopped, because it
  keeps acting. Combine it with a defined power-up state or it makes things worse.
- **"Comments should explain the code."** The code already says what it does. Comments are for why
  this value, why this order, why this apparently redundant line is load-bearing. In three years that
  is the only information that will not be recoverable by reading.

---

## Numbers from this class

| Quantity | Value |
| --- | --- |
| Power-up state, always | the safe one, outputs off |
| DMX loss detection window | about 1 second with no valid packet |
| Typical debounce time | 20–50 ms |
| Watchdog timeout, typical | 1–2 seconds |
| Reset action | one deliberate physical action, 2 second hold |
| Status indicator, idle | one blink |
| Status indicator, fault | rapid blinking |
| RS-485 receiver for DMX | MAX485 or equivalent, isolated |
| PWM frequency for a stage lamp | above 20 kHz if cameras are present |
| Sensor reading outside its physical range | treat as a fault, go to SAFE |
| Loop pass time, target | under 1 ms |
| Documentation sheet | one side of A4, in the case |
