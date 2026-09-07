# Class 13 — Sensors and Actuators

> A sensor answers a question you have to ask precisely. An actuator does something to the world,
> and the world includes people.

## Before you come

### What you must already be able to do

Read an ADC and know its resolution and its limits. Build a voltage divider and calculate its
output. Drive a load through the Class 6 board. Write a state machine. Explain why an impossible
reading is a fault.

### Three things to do

1. **List five things a show needs to know.** Is the trap open, has the actor reached the mark, is
   the flying piece at its low point, is the door closed, is the smoke machine hot. For each, write
   what would have to be measured. That translation is the class.
2. **Find a limit switch** somewhere in the building and look at how it is mounted. Notice whether
   it is arranged to be *made* when safe or *broken* when safe. There is a right answer and about
   half of installations get it wrong.
3. **Watch a servo and a stepper move** in any video and write down two differences you can see.

### What to bring

Board, laptop, driver board, meter, and the state machine you drew in Class 12.

<!--ready:13-->

---

## Run of the session

Four hours, accounted for. Blocks are an order of work rather than a timetable: a class that runs
long on the bench is a class that is going well. The minutes are here so that you know what you are
trading against when it does.

| Min | Block | What happens |
| --- | --- | --- |
| 10 | Open | Numbers quiz, and the limit switch you photographed |
| 45 | The idea | Asking the right question. Switches and contacts, analogue sensors, position and motion |
| 15 | Break |  |
| 40 | The idea | Actuators and the responsibility that comes with them, then the chain end to end |
| 30 | Bench A | Build three dividers, choosing each fixed resistor by the geometric mean rule |
| 25 | Bench B | Normally closed proved, by cutting the cable with the system running |
| 25 | Bench C | The encoder that does not know where it is, then a homing routine |
| 20 | Bench D | Peak and hold, with two temperature curves on one axis |
| 20 | Bench E | Measure your own chain, sensor to actuator, on a scope |
| 10 | Close | Which link in your chain was largest, and whether it mattered |

---

## Asking the right question

The hardest part of sensing is not the electronics. It is turning a production requirement into a
measurable quantity.

"Is the actor in position" is not measurable. What is measurable: is there something within 30 cm of
this point, has this pressure mat been stood on, has this beam been broken, has this magnet come
within 5 mm of this reed switch.

Each of those answers a slightly different question and each fails differently. The pressure mat
also triggers for a dropped prop. The beam also triggers for a cable swinging through it. The magnet
only works if the actor is wearing the right shoe.

**Choosing a sensor is choosing which failures you can live with.** State them, out loud, before you
buy anything.

<!--anim:sensor-map-->

---

## The sensor families

### Switches and contacts

The simplest and the most reliable: a mechanical contact that opens or closes.

- **Limit switch.** Mechanical, robust, definite. Used at the ends of travel of anything that moves.
- **Reed switch.** A magnet closes a sealed contact. No wear, works through non-magnetic material,
  ideal for a door or a lid.
- **Pressure mat.** Large area, cheap, and triggers for anything heavy.
- **Micro switch.** Small, precise operating point, used where repeatability matters.

**The wiring convention that matters:** wire safety-critical switches so that the safe condition is
a **closed** circuit, and the unsafe condition is open. This is normally-closed logic, and its
virtue is that a cut cable, a corroded contact or a pulled connector produces the *unsafe* reading,
so the system stops.

<!--anim:nc-no-->

Wired the other way, a broken cable reads as "safe" forever, and the guard that is supposed to stop
the machine has silently stopped existing. This is the single most important sentence in the class,
and Class 15 builds on it.

### Analogue sensors and dividers

<!--anim:divider-sensor-->

Many sensors are variable resistances: a thermistor, a light-dependent resistor, a potentiometer, a
force-sensing resistor. On its own a resistance is not readable by an ADC, so you put it in a
divider with a fixed resistor and read the voltage at the junction.

`V_out = V_in × R2 ÷ (R1 + R2)`

Two design decisions:

**Which arm the sensor goes in** determines whether the reading rises or falls with the quantity.
Both work; pick one and label it, because a sensor whose reading falls as light increases will
confuse everybody including you in three months.

**The fixed resistor should be about the geometric mean of the sensor's range.** If an LDR runs
1 kΩ bright to 100 kΩ dark, use about 10 kΩ, which puts the useful part of the curve in the middle
of the ADC's range instead of squashed at one end.

And from Class 11: keep the source impedance the ADC sees under about 10 kΩ, or the reading is low
and you will chase it for an hour.

### Position and motion

- **Potentiometer.** Absolute position, cheap, wears out, fine for a knob and poor for anything that
  moves constantly.
- **Rotary encoder.** Two out-of-phase signals; counting the edges gives direction and distance.
  Incremental, so it does not know where it is at power-up and must be homed.
- **Hall effect sensor.** Detects a magnetic field. No contact, no wear, works through a panel.
- **Time-of-flight / ultrasonic.** Distance without contact. Ultrasonic is cheap and fooled by soft
  surfaces and by angles. Time-of-flight laser is more precise and fooled by black and by glass.

<!--anim:encoder-->

**Incremental against absolute is the distinction that catches people.** An encoder that has counted
4,000 pulses knows it has moved 4,000 pulses, not where it is. Lose power and the count is gone.
Every incremental system needs a homing routine and a limit switch, and a machine that has not been
homed since power-up must not be allowed to move at speed.

### Current and presence

- **Current transformer.** Clips around a live conductor and reports the current without any
  electrical connection. This is how you know whether a lamp is actually drawing power, which is a
  far better test of "is the practical on" than trusting that you sent the cue.
- **Optical beam break.** Emitter and receiver; something crossing between them breaks the beam.
  Fast, reliable, and the standard way to detect a person entering a hazard zone.

---

## Actuators, and the responsibility that comes with them

<!--anim:motor-types-->

| Actuator | Gives you | Costs you | Where it belongs |
| --- | --- | --- | --- |
| Solenoid | Fast linear snap, one stroke | Heats fast, on or off only, loud | Latches, catches, valves |
| DC motor | Cheap continuous rotation | No position feedback, coasts | Fans, simple continuous motion |
| Geared DC motor | Torque at low speed | Backlash, still no feedback | Slow reveals, turntables |
| Servo | Commanded position, cheap, self-holding | Limited travel, limited torque, jitters | Small precise movements, puppetry |
| Stepper | Precise position without feedback | Loses steps silently under load | Repeatable indexing, small automation |
| Linear actuator | Push or pull along a line | Slow, expensive | Lids, ramps, small lifts |

### The three that need warnings

**Solenoids overheat.** A solenoid is a coil designed for a short pull, and many are rated for a
duty cycle rather than continuous use — twenty-five per cent, say. Hold one on continuously and it
will get hot enough to burn, and then it will fail. If a solenoid must hold, either pick one rated
for continuous duty, or drive it hard to pull in and then drop to a lower PWM duty to hold. That
technique is standard and it is worth knowing by name: **peak and hold**.

<!--anim:solenoid-->

**Steppers lose steps silently.** A stepper commanded to move 200 steps believes it moved 200 steps.
If the load jammed at step 40, it still believes it. Nothing in the stepper reports the error. Every
stepper system in a show needs a home switch, and something that verifies position at least once per
cycle, or it will drift over a run and be discovered on the night it matters.

**Anything that moves can trap someone.** This is where the class stops being about electronics.
A motor with enough torque to move scenery has enough torque to break a finger and it does not know
the difference. That is Class 15, and it is why nothing in this class is allowed to be built with
mains-powered motion.

---

## The chain, end to end

<!--anim:trigger-chain-->

Sensor to decision to actuator. Every link adds delay, and the total is what the audience
experiences as responsiveness.

| Link | Typical delay |
| --- | --- |
| Sensor response | 0.1–20 ms |
| Debounce | 20–50 ms |
| Loop poll interval | under 1 ms if written well, hundreds of ms with `delay()` |
| Decision and communication | under 1 ms local, 5–50 ms over a network |
| Actuator start | 5–15 ms relay, 20–200 ms motor |
| Actual movement | 100 ms to seconds |

Two things fall out of that table.

**Debounce is often the largest electronic delay**, and it is the one people optimise last because
it is invisible.

**The mechanical time dominates everything.** Fifty milliseconds of electronics on a movement that
takes two seconds is irrelevant. Fifty milliseconds on a snap that should look instantaneous is
visible. Know which one you are building before you spend a day shaving milliseconds.

---

## Driving a motor in both directions

A MOSFET switches a motor on and off in one direction. Reversing it needs four switches arranged in
an H, which is why the part is called an H-bridge and why you buy it as a module rather than
building it.

<!--anim:h-bridge-->

Close the top-left and bottom-right and current flows one way; close the other diagonal and it flows
the other. That is the whole idea, and everything else is about the two ways it goes wrong.

**Shoot-through** is closing both switches on the same side at once, which is a short circuit
across the supply through two transistors. A real driver chip includes a dead time — a few hundred
nanoseconds where both are off during the changeover — and that is a large part of what you are
paying for. It is also why you do not build one from four MOSFETs on breadboard.

**Braking against coasting.** Open all four switches and the motor coasts, still turning, driven by
its own momentum. Close both bottom switches and the motor is shorted to itself: its own generated
voltage drives a current that opposes the rotation, and it stops sharply. A scenic piece coasting to
a stop and one braking to a stop are visibly different, and which you want is a design decision, not
a default.

**And the motor is a generator.** Decelerating scenery pushes current back into the driver. On a
small load the driver absorbs it; on a large one it raises the supply rail until something fails.
That is why serious motion control has a braking resistor, and it is the reason a scenic automation
supplier's schematic has a component on it you did not expect.

---

## Measuring force and position properly

<!--anim:loadcell-->

Two sensors worth knowing because they answer questions a switch cannot.

**A load cell** is a metal element with strain gauges bonded to it, wired as a bridge. Deforming the
metal changes the resistances by a fraction of a per cent, and the bridge turns that into a
differential voltage of a few millivolts. It needs a dedicated amplifier — an HX711 or similar —
because a few millivolts on top of a couple of volts of common mode is not something an ordinary
ADC can read.

What it buys you in a theatre: knowing what a flown piece actually weighs, whether a counterweight
set is balanced, and whether the thing that should be resting on the deck is resting on the deck.
That last one is a genuinely good interlock, because it measures the condition itself rather than a
proxy for it.

**An inductive proximity sensor** detects metal without contact and without a magnet, at a few
millimetres, and is unbothered by dust, paint and stage haze. Where a reed switch can be defeated
with a magnet and an optical sensor can be defeated with haze, a proximity sensor mostly cannot,
which is why they appear on machinery rather than on props.

Both give you the same thing: **a measurement of the physical condition rather than a proxy for
it**, which is the difference between "the cue was sent" and "the thing actually moved".

---

## At the bench

Two hours.

### Block A — Build three dividers (30 min)

An LDR, a thermistor and a potentiometer, each in a divider, each read by the ADC and printed.

For each: calculate the expected voltage at both extremes before building, choose the fixed
resistor by the geometric mean rule, and compare your calculation to the measurement. Then swap the
sensor to the other arm and confirm the reading inverts.

### Block B — Normally closed, proved (25 min)

Wire a limit switch normally open and a second normally closed, both read by the microcontroller,
both printed.

Then cut each cable in turn, with the system running, and record what each reads. Write one sentence
about which arrangement you would use on a guard and why.

This is a two minute experiment with a permanent result, and it is the single most examinable idea
in the class.

### Block C — The encoder that does not know where it is (25 min)

Read a rotary encoder and count. Turn it fifty clicks. Note the count.

Now power-cycle the board without moving the encoder. The count is zero and the encoder is still in
the same place, and the system now believes something false.

Write a homing routine using a limit switch. Prove it works from three different starting positions.

### Block D — Peak and hold (20 min)

Drive a solenoid at full power continuously. Measure the current, and measure its temperature every
thirty seconds with the IR thermometer for four minutes. Plot it.

Now drive it at full power for 100 ms and then at forty per cent PWM to hold. Measure the current
and repeat the temperature log. Confirm it still holds.

Two curves on one axis: that is your evidence, and it is the argument you will make to a designer
who wants a latch held closed for a whole act.

### Block E — Measure your own chain (20 min)

Sensor to actuator, with the scope on both ends. Trigger on the sensor, measure to the actuator's
first movement. Record the total.

Then insert `delay(250)` somewhere plausible in the loop and measure again. Then remove it and
reduce the debounce from 50 ms to 5 ms and measure again, and count the false triggers over twenty
presses.

That last measurement is the trade-off in this whole class, in numbers you produced.

---

## Common misconceptions

- **"A sensor tells you what is happening."** A sensor reports one physical quantity. A pressure mat
  reports weight, not an actor. Every sensor has a set of things that fool it, and choosing one is
  choosing which failures you can live with, so name them before you buy.
- **"Normally open or normally closed is a wiring preference."** For a safety-related contact it
  decides what a cut cable means. Normally closed makes a broken wire read as unsafe and the machine
  stops. Normally open makes a broken wire read as safe forever, and the guard has silently stopped
  existing.
- **"A stepper is precise, so it knows where it is."** It knows how many steps it was told to take. A
  jam, a missed step or a power cycle destroys that belief and nothing reports it. Steppers need a
  home switch and periodic verification, or they drift over a run.
- **"A servo holds its position."** It holds against modest force by continuously correcting, which
  means it draws current, buzzes, gets hot, and will be pushed out of position by anything strong. It
  is not a lock and it must never be the only thing preventing a movement.
- **"A solenoid can stay energised."** Many are rated for a duty cycle, not continuous use. Held on,
  they reach burn temperature and then fail. Peak and hold, or a continuous-duty part.
- **"Faster sensing gives a more responsive effect."** The mechanical time usually dominates by an
  order of magnitude. Shaving milliseconds off a sensor feeding a two-second movement changes
  nothing an audience can perceive, and the effort belongs on the parts that are actually visible.

---

## Numbers from this class

| Quantity | Value |
| --- | --- |
| Voltage divider | `V_out = V_in × R2 ÷ (R1 + R2)` |
| Divider fixed resistor, rule of thumb | geometric mean of the sensor's range |
| Maximum ADC source impedance | about 10 kΩ |
| LDR range, bright to dark | about 1 kΩ to 100 kΩ |
| Typical solenoid duty cycle rating | 25 per cent unless stated otherwise |
| Peak and hold, holding duty | typically 30–50 per cent |
| Hobby servo control pulse | 1.0–2.0 ms, repeated every 20 ms |
| Common stepper step angle | 1.8 degrees, so 200 steps per revolution |
| Quadrature encoder counts per detent | 4 edges |
| Debounce time, typical | 20–50 ms |
| Relay actuation delay | 5–15 ms |
| Ultrasonic sensor useful range | about 2 cm to 4 m |
| Safety contact wiring | normally closed, so a break reads as unsafe |
| Incremental encoder at power-up | position unknown, must be homed |
