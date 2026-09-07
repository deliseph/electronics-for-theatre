# Class 11 — Microcontrollers

> A microcontroller is a chip that does one thing forever, very fast. Everything difficult about
> them comes from that word "forever".

## Before you come

### What you must already be able to do

Calculate an LED series resistor. Explain a pull-down resistor and why a floating input is not off.
Drive a MOSFET. Use a scope with a trigger. Read a schematic.

### Three things to do

1. **Get a board and blink an LED on it before you arrive.** Any Arduino-compatible board. Install
   the toolchain, connect it, load the blink example, change the interval to 200 ms. That is all.
   If the toolchain fights you, it will fight you for the first hour of class instead, and the
   toolchain is not what we are here to learn.
2. **Write down what `delay(1000)` actually does** to the chip. One sentence, your guess. Bring it.
3. **Find a microcontroller in a piece of show equipment.** Open something dead and find the chip
   with a crystal next to it. Read its part number and look up what it is.

### What to bring

Your board, a USB cable that carries data (not a charging-only one, which wastes the first ten
minutes of every class of this kind), a laptop with the toolchain working, breadboard, meter.

<!--ready:11-->

---

## Run of the session

Four hours, accounted for. Blocks are an order of work rather than a timetable: a class that runs
long on the bench is a class that is going well. The minutes are here so that you know what you are
trading against when it does.

| Min | Block | What happens |
| --- | --- | --- |
| 10 | Open | Numbers quiz, and your written guess about what delay() does to the chip |
| 45 | The idea | What a microcontroller actually is, pins and the third state, and the loop |
| 15 | Break |  |
| 40 | The idea | The ADC and why resolution is not accuracy, PWM, and switch bounce |
| 20 | Bench A | Everybody blinks: a checkpoint, not a lesson |
| 30 | Bench B | Prove the pin limits, including the relay coil on a scope |
| 25 | Bench C | Floating inputs, and the button that presses itself |
| 20 | Bench D | Bounce, captured single-shot, and counted |
| 25 | Bench E | delay() against millis(), with the response time measured both ways |
| 10 | Close | The two numbers you measured, and what their ratio means |

---

## What a microcontroller actually is

Not a computer. A computer runs an operating system, schedules many tasks, and has an
indeterminate response time. A microcontroller runs one program, from power-on until power-off, with
nothing else competing for it.

That is why it is the right thing for show hardware. When you tell a microcontroller to check a
switch every millisecond, it checks the switch every millisecond, forever, and nothing decides that
a software update is more important.

Inside one chip:

- **CPU**, executing instructions at some millions per second
- **Flash memory** holding the program, kept when power is removed
- **RAM** holding variables, lost when power is removed
- **GPIO pins** that can be inputs or outputs
- **ADC**, converting an analogue voltage to a number
- **Timers**, counting independently of the program, which is what makes PWM possible
- **Serial peripherals** — UART, I²C, SPI — for talking to other chips

<!--anim:mcu-anatomy-->

For this course the chip matters less than the pattern. An ATmega328 at 16 MHz, an ESP32 at
240 MHz, an RP2040: same ideas, different speeds and peripheral counts.

> **The same chip from another angle.** [Computer Science for Theatre](https://computer-science-theatre.vercel.app/class/5) Class 5 asks
> a different question about this hardware: not what the chip can do, but whether the job belongs on
> a chip at all rather than on a computer, and how much work actually fits in one pass of the loop.
> It is a separate course and it does not require this one; if you want the architecture decision
> rather than the pins, that is where it is argued.

---

## Pins: input, output, and the third state nobody expects

<!--anim:gpio-->

A GPIO pin is one of three things:

**Output.** The pin is driven to the supply voltage or to ground. It can source or sink a limited
current, typically about 20 mA and often less in total across the whole chip. **This is why a
microcontroller never drives a relay, a motor or a metre of LED tape directly** — that is what the
board from Class 6 is for.

**Input.** The pin reads high or low, comparing against a threshold. It draws essentially no
current.

**Input, floating.** An input pin with nothing connected is not zero. It is undefined: a tiny
capacitance with no path to anywhere, picking up interference from the air, from adjacent pins, from
your hand near the board. It reads randomly, and it changes when you move.

A floating input is the single most common beginner fault and it produces a symptom that looks like
a software bug or a haunting: a button that presses itself.

### Pull-ups and pull-downs

The cure is a resistor, typically 10 kΩ, that defines the pin's state when nothing else is driving
it.

A **pull-up** ties the pin to the supply, so it reads high when idle, and a switch to ground pulls it
low when pressed. This is the standard arrangement, partly because most microcontrollers have
internal pull-ups you can enable in software, and partly because a switch that connects to ground is
easier to wire and less susceptible to noise on a long run.

The consequence is that the pressed state reads *low*, which inverts the logic in your code and
catches everybody once.

**In show hardware, prefer a scheme where the safe state is the de-energised one.** A button whose
pressed state is a closed circuit to ground will read as "not pressed" if the cable is cut, which is
usually what you want. That is the same reasoning as the pull-downs on the Class 6 board.

---

## The loop, and why `delay()` ruins a show

<!--anim:mcu-loop-->

The basic structure is `setup()` once, then `loop()` forever. The chip executes `loop()` millions of
times a second, and everything the device does is a consequence of what happens on each pass.

Now consider:

```c
void loop() {
  digitalWrite(LED, HIGH);
  delay(1000);
  digitalWrite(LED, LOW);
  delay(1000);
}
```

`delay(1000)` does not schedule anything. It sits in a tight loop counting for one second while the
processor does **nothing else at all**. No buttons are read. No DMX is received. No emergency stop
is noticed.

For a blinking LED on a bench, fine. In a prop that must respond to a cue, a one-second delay means
up to one second of complete deafness, and the operator's experience is "the button did not work
sometimes".

### The pattern that replaces it

Instead of stopping, check the clock and decide:

```c
unsigned long lastBlink = 0;
const unsigned long BLINK_INTERVAL = 1000;

void loop() {
  unsigned long now = millis();

  if (now - lastBlink >= BLINK_INTERVAL) {
    lastBlink = now;
    ledState = !ledState;
    digitalWrite(LED, ledState);
  }

  readButtons();      // every pass, a few microseconds
  updateOutputs();    // every pass
  checkSafety();      // every pass, and this is the one that matters
}
```

The loop now runs thousands of times a second and everything is checked on every pass. That is the
difference between a prototype and a device that can be put on a stage.

**Note the subtraction.** `now - lastBlink >= INTERVAL` rather than `now >= lastBlink + INTERVAL`.
The counter overflows after about 49 days, and unsigned subtraction handles the wrap correctly while
addition does not. A prop in a long-running installation will meet this, and the bug appears once,
seven weeks in, and is essentially undiagnosable if you do not know it exists.

---

## The ADC: turning a voltage into a number

<!--anim:adc-sample-->

An analogue-to-digital converter compares an input voltage against a reference and reports a number.
A 10-bit ADC gives 0 to 1023; a 12-bit one gives 0 to 4095.

The **resolution** is the reference divided by the number of steps. With a 5 V reference and 10 bits,
each step is 4.9 mV. Nothing finer than that exists to the chip, and asking for more precision than
the hardware has is a common source of imaginary problems.

Three practical points:

**The reference is the accuracy limit.** If your reference is the 5 V USB supply, and that supply
sags to 4.7 V when the motor runs, every reading changes by six per cent while nothing physical
changed. This is a real and common fault in home-built sensor systems.

**Source impedance matters**, exactly as with the meter in Class 2. The ADC charges a small internal
capacitor from your signal. From a high-impedance source it does not finish charging in the sampling
window and reads low. Keep the source under about 10 kΩ, or buffer it.

**Noise is real and averaging is cheap.** Reading a sensor once gives you the value plus whatever
noise arrived in that microsecond. Reading it sixteen times and averaging costs nothing and gives a
visibly steadier number.

---

## PWM: making an analogue-looking output from a switch

<!--anim:pwm-duty-->

A digital pin is on or off. To dim an LED or slow a motor you switch it rapidly and vary the
proportion of time it is on. That proportion is the **duty cycle**.

At a high enough frequency the load's own inertia — thermal, mechanical, or your eye's persistence —
averages it out.

The frequency matters, and choosing it badly produces specific, recognisable problems:

| Frequency | Problem |
| --- | --- |
| Under about 100 Hz | Visible flicker, especially in peripheral vision and on camera |
| A few hundred Hz to 20 kHz | Audible whine from motors and from inductors |
| Above 20 kHz | Inaudible, but switching losses rise and gate drive matters more |

For stage lighting the constraint that actually decides it is **camera**. A show being filmed needs
PWM well above the camera's shutter rate, or the footage shows rolling bands. This is why
professional LED fixtures advertise high PWM frequencies and why a cheap dimmer looks fine to the eye
and terrible on broadcast.

**And brightness is not linear.** Perceived brightness is roughly logarithmic, so 50 per cent duty
does not look half as bright. This is why fixtures apply a dimming curve, and why a naive
`analogWrite(pin, level)` fade looks wrong: it rushes the top and crawls at the bottom.

---

## Switch bounce, seen properly

<!--anim:debounce-->

A mechanical switch does not close once. Its contacts collide and separate several times over 1 to
20 milliseconds before settling.

A human sees one press. A microcontroller polling at 100 kHz sees five to fifty transitions, and a
counter counts them all.

You will put a scope on a switch today and see this, and it is one of the most useful things in the
class, because bounce is invisible to reasoning and obvious on a screen.

Debouncing, in order of how much you should like them:

1. **Ignore changes for a fixed time after the first one.** Twenty to fifty milliseconds. Simple,
   reliable, and what almost everything uses.
2. **Require the state to be stable for N consecutive reads.** Slightly more robust against a noisy
   line, marginally more code.
3. **An RC filter and a Schmitt trigger input** in hardware. The right answer for a long cable run
   from a switch out in the set, because it also suppresses the interference the cable picks up.

For anything that must not double-fire — a cue trigger, a pyro arm, a scene change — use hardware
debouncing *and* software debouncing. A double-fired cue is a show problem, and the cost of both is
two components.

---

## Interrupts: the thing that cannot wait

Everything so far polls: the loop comes round and asks. That is right for almost everything and
wrong for a few things, and knowing which is which is the point of this section.

<!--anim:interrupts-->

An interrupt is a hardware arrangement where a pin changing state stops whatever the processor was
doing, runs a short function, and returns. The main loop does not have to be looking.

Use one when the event is **short, rare and cannot be missed**: an encoder pulse at speed, a
zero-crossing detector, an emergency input. Do not use one for a button, because a poll every
millisecond will never miss a human finger and it is far easier to reason about.

The rules, and they are strict:

1. **Keep it short.** Set a flag, store a value, return. No delays, no printing, no long
   arithmetic. Everything else is blocked while it runs.
2. **Mark shared variables `volatile`.** The compiler otherwise assumes nothing changes them behind
   its back, caches them in a register, and your main loop reads a stale value forever. This bug is
   invisible, intermittent, and depends on optimisation level.
3. **A multi-byte variable shared with an interrupt needs care.** The main loop can read half of a
   32-bit value, be interrupted, and read the other half from a different moment. The result is a
   number that was never true.
4. **`millis()` usually stops working inside one**, because it is itself driven by an interrupt.

---

## Powering a microcontroller properly

<!--anim:mcu-power-->

Most prop faults that look like software are power. Four things worth doing every time:

**Decouple every chip.** A 100 nF ceramic between the supply pin and ground, physically next to the
chip, supplies the current spike each switching edge demands. Without it the local rail sags for
nanoseconds and the chip does something undefined. This is the single most common cause of a board
that works on the bench and resets in a rack.

**Bulk capacitance at the supply entry.** 100 µF or more, to hold the rail up through the slow
demands: a servo starting, a relay pulling in.

**Do not power a motor from the microcontroller's regulator.** The board's onboard regulator can
supply tens of milliamps beyond the chip. A servo peaks at over an amp. Give the actuator its own
supply and join only the grounds.

**Join the grounds, once, at one point.** Two supplies with separate grounds and a signal between
them is the Class 7 ground loop in miniature, and here it shows up as random resets rather than as
hum.

---

## Talking to other chips

<!--anim:i2c-spi-->

Three buses cover almost everything you will connect, and choosing between them is usually decided
by what the sensor you want happens to speak.

| | Wires | Speed | Devices | Where |
| --- | --- | --- | --- | --- |
| UART | 2, plus ground | Low to moderate | One, point to point | DMX, GPS, modules, debugging |
| I²C | 2, shared | 100 to 400 kHz | Many, each with an address | Sensors, displays, real-time clocks |
| SPI | 4, shared plus one select each | Fast, megahertz | Many, one select line each | SD cards, displays, LED drivers |

**I²C is the one that catches people**, in two ways. It needs pull-up resistors on both lines,
usually 4.7 kΩ, and exactly one set of them for the whole bus, not one set per device. And two
devices with the same fixed address cannot share a bus, which is why sensor breakout boards have an
address-select jumper that everybody discovers only after buying the second one.

---

## At the bench

Two hours.

### Block A — Everybody blinks (20 min)

Confirm every board and toolchain in the room works. This is a checkpoint, not a lesson, and it is
scheduled because a class where three people cannot flash a board loses forty minutes.

### Block B — Prove the pin limits (30 min)

Drive an LED from a pin through the correct resistor and measure the current. Then, on the
sacrificial board, remove the resistor and measure again. Watch the pin voltage sag as the chip runs
out of drive.

Then connect a relay coil directly to a pin, briefly, and watch what happens on the scope when it
releases. This is Class 5's flyback, appearing on something you now own.

### Block C — Floating inputs and the button that presses itself (25 min)

Read a bare input pin and print it a thousand times a second. Wave your hand near it. Watch it
change.

Now enable the internal pull-up and repeat. Then fit an external 10 kΩ pull-down and a switch to the
supply and repeat again.

Write down which arrangement reads as "not pressed" when the wire is cut, and why that is the one
you want in a set.

### Block D — Bounce, on a scope (20 min)

Scope on a switch, single-shot trigger. Capture the bounce. Measure how long it lasts and count the
transitions.

Then run a counter in software with no debouncing and press the button ten times. Record the count.
Then add a 30 ms debounce and repeat.

### Block E — `delay()` against `millis()` (25 min)

Write the naive blink with `delay(1000)` and add a button that should turn something on. Measure how
long the button can be pressed and ignored.

Rewrite it with the `millis()` pattern and measure again. Record both numbers. The first is
typically several hundred milliseconds, the second under a millisecond, and that ratio is the
lesson.

---

## Common misconceptions

- **"A microcontroller output can drive a small motor or a relay if it is small enough."** A pin
  supplies about 20 mA, and the chip has a total limit lower than the sum of its pins. Anything
  inductive also kicks. Everything with a coil or a motor goes through a driver, which is what you
  built in Class 6.
- **"An unconnected input reads zero."** It reads whatever the surrounding electric field puts on it,
  and it changes when you move your hand. Every input gets a defined idle state from a pull-up or a
  pull-down, and the choice between them decides what happens when a cable is cut.
- **"`delay()` is fine for short waits."** During `delay()` the chip does nothing else, including
  noticing a stop button. In a show device, "short" means the length of time you are prepared to
  ignore a safety input, which is zero.
- **"More bits on the ADC means a more accurate reading."** Resolution is not accuracy. A 12-bit
  reading against a reference that sags when the motor starts is a very precise measurement of the
  wrong thing. Reference stability and source impedance dominate long before bit depth does.
- **"Switch bounce is a theoretical concern."** It is 1 to 20 ms of multiple transitions on every
  mechanical switch, every time, and a chip that polls fast counts all of them. Everyone who has not
  seen it on a scope believes their code is broken instead.
- **"PWM frequency does not matter as long as you cannot see flicker."** Cameras see what your eye
  does not, motors and inductors whine in the audible band, and switching losses rise with
  frequency. Choosing it is an engineering decision with three constraints, not a default.

---

## Numbers from this class

| Quantity | Value |
| --- | --- |
| Microcontroller pin current, safe maximum | about 20 mA |
| Typical pull-up or pull-down resistor | 10 kΩ |
| 10-bit ADC range | 0–1023 |
| 12-bit ADC range | 0–4095 |
| 10-bit ADC step with a 5 V reference | 4.9 mV |
| Maximum recommended ADC source impedance | about 10 kΩ |
| Switch bounce duration | 1–20 ms |
| Typical software debounce time | 20–50 ms |
| `millis()` overflow period | about 49 days |
| PWM frequency, visible flicker below | about 100 Hz |
| PWM frequency, audible whine band | 200 Hz – 20 kHz |
| PWM frequency for broadcast-safe lighting | above about 20 kHz |
| ATmega328 clock speed | 16 MHz |
| Duty cycle for half power | 50 per cent, but not half perceived brightness |
