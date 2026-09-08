# Class 3 — Components and Connectors

> Every component has one thing it does and one thing it refuses to do. Learn the refusal and the
> datasheet becomes readable.

## Before you come

### What you must already be able to do

Use a multimeter in all four modes without thinking about which jack the red lead is in. Test a
cable with the five-step procedure from Class 2. Rearrange Ohm's law. Read `4k7`, `470R` and
`0.47 µF` and put them in order of size.

### Three things to do

1. **Take apart something dead.** A broken phone charger, a failed LED lamp, an old radio. Do not
   plug it in, and if it has a large capacitor in it, treat that capacitor as live. Photograph the
   board and bring the photograph.
2. **Find five different connectors** in your building and photograph each one. Not five of the
   same. You are looking for the range: audio, data, power, mains, and something odd.
3. **Read the [resistor colour code](/tools#tool-rescode)** and get ten right in a row on the tool.
   It takes about fifteen minutes and it saves you an hour every week for the rest of the course.

### What to bring

Your meter. A phone with a camera and a torch. Reading glasses if you use them, because half of
today is reading markings that are 1 mm tall.

<!--ready:3-->

---

## Run of the session

Four hours, accounted for. Blocks are an order of work rather than a timetable: a class that runs
long on the bench is a class that is going well. The minutes are here so that you know what you are
trading against when it does.

| Min | Block | What happens |
| --- | --- | --- |
| 10 | Open | Numbers quiz, and how to read any component in four questions |
| 55 | The idea | Resistors, capacitors, diodes and LEDs, inductors and the kick. What each one refuses to do |
| 15 | Break |  |
| 30 | The idea | Semiconductors in one page, and why the industry chose the connectors it did |
| 40 | Bench A | Identify fifty parts: name, value, measure, failure mode |
| 30 | Bench B | The LED that dies, with eye protection and one sacrificial LED |
| 30 | Bench C | Capacitor time constants, timed by hand, then a discharge measured |
| 20 | Bench D | Connector inspection: find the faults by eye and by meter |
| 10 | Close | The two rules of connectors, and what to bring to Class 4 |

---

## How to read any component

There are thousands of parts and about eight behaviours. You are not learning a catalogue, you are
learning a small number of behaviours and how to recognise which one you are holding.

For every component, ask four questions in this order:

1. **What does it do to current?** Resist it, store it, block it in one direction, amplify it,
   switch it.
2. **What is its limit?** Every part has a rating it will not survive: voltage, current, power,
   temperature. Almost every failure is a limit exceeded.
3. **How does it fail?** Open or short. This matters enormously for fault-finding, and different
   parts have strong tendencies.
4. **What does it do that you did not ask for?** Every real component is a mixture. A resistor has
   inductance. A capacitor has resistance. A wire has both. Class 7 and Class 9 are largely about
   these unwanted extras.

---

## Resistors

A resistor opposes current and turns the difference into heat. That is all it does, and it does it
extremely reliably.

<!--anim:resistor-code-->

**Reading them.** Four bands: two digits, a multiplier, a tolerance. Five bands: three digits, a
multiplier, a tolerance. The tolerance band is usually gold or silver and slightly separated,
which is how you know which end to start from. Surface mount parts are marked with numbers instead:
`472` is 47 followed by two zeros, so 4.7 kΩ.

**The rating that catches people is power, not resistance.** A quarter-watt resistor asked to
dissipate half a watt will work, get very hot, drift in value, discolour the board, and eventually
fail. Use `P = I² × R` before you choose the physical size, every time.

**How they fail:** almost always open circuit, often after a period of drifting high. A resistor
that has gone open is easy to find. A resistor that has drifted from 100 Ω to 140 Ω because it ran
hot for two years is the fault that takes an afternoon.

---

## Capacitors

A capacitor stores charge in an electric field. Its useful behaviour is that it **opposes a change
in voltage**: it resists being made to change quickly, and it takes time to charge and discharge.

<!--anim:cap-charge-->

That time is the RC time constant, `τ = R × C`, and it is one of the most useful numbers in this
course. In one time constant the capacitor gets 63 per cent of the way to its target. In five, it
is there for all practical purposes.

You will use capacitors for four things, and it is worth naming them because a capacitor chosen for
the wrong job is a common design fault:

| Job | What it is doing | Typical size |
| --- | --- | --- |
| Smoothing | Filling in the gaps in a rectified supply | 100 µF to 10,000 µF |
| Decoupling | Supplying the instantaneous current a chip demands, locally | 100 nF, right at the chip |
| Timing | Setting a delay or a frequency with a resistor | pF to µF |
| Coupling | Passing signal while blocking DC | 100 nF to 10 µF |

**The one that bites theatre people:** electrolytic capacitors are polarised and will vent, loudly,
if you reverse them. They also dry out with age and heat, which is why a piece of equipment that
worked when it was put in the store in 2014 does not work now. Failed electrolytics are the single
most common fault in old show equipment, and they are visible: a domed top or crusted residue.

**And the one that hurts:** a large capacitor in a mains power supply holds a dangerous charge
after the equipment is unplugged. Sometimes for minutes. Treat every large capacitor in mains
equipment as live until you have measured it, and discharge it properly rather than by shorting it
with a screwdriver.

---

## Diodes and LEDs

A diode passes current in one direction and blocks it in the other. It is the simplest useful
non-linear part and it appears everywhere.

<!--anim:diode-curve-->

The key number is the **forward voltage drop**: about 0.7 V for a standard silicon diode, about
0.3 V for a Schottky, and 1.8 to 3.4 V for an LED depending on colour. That drop is nearly
independent of current, which is what makes the next section true.

### LEDs, and why they need a resistor

<!--anim:led-current-->

An LED is a diode that emits light, and it has the diode's steep curve. Below its forward voltage
it passes almost nothing. Above it, current rises almost vertically. There is no comfortable middle
where it self-regulates.

So an LED connected straight across a supply does not settle at a sensible current. It draws as
much as the supply will give, heats up, and a hotter LED conducts *more* at the same voltage, which
heats it further. That is thermal runaway, and it takes seconds.

The fix is a series resistor that sets the current:

```
R = (V_supply − V_forward) ÷ I_desired
```

For a red LED at 20 mA on a 5 V rail: `(5 − 2.0) ÷ 0.02 = 150 Ω`. Then check the power:
`0.02² × 150 = 0.06 W`, so a quarter-watt part is comfortable.

The [LED resistor tool](/tools#tool-led) does this and shows the working, but do the arithmetic by
hand at least twenty times this term, because it comes up in Class 6, Class 11 and the capstone.

**Where this matters professionally:** every LED fixture in your rig contains a constant-current
driver doing exactly this job in a more sophisticated way. When somebody tells you an LED fixture
"dims badly on a dimmer", the reason is in this section: a phase-controlled dimmer varies the
voltage, and voltage is not what an LED responds to sensibly.

---

### Wire it before you wire it

<!--circuit:switch-bounce-->

A pushbutton, a pull-down, and a counter. Press it once and read three. Then take the pull-down out
and watch what an input does with nothing holding it, which is not zero and is not one.

## Inductors, and the kick

An inductor stores energy in a magnetic field, and it **opposes a change in current** — the exact
mirror of a capacitor.

<!--anim:inductor-kick-->

You will meet inductance mostly as a nuisance and once as a hazard. Any coil of wire is an
inductor: a relay coil, a solenoid, a motor winding, a transformer, a contactor.

The hazard is what happens when you interrupt the current. The magnetic field collapses and the
inductor generates whatever voltage it needs to try to keep the current flowing. Switching a 12 V
relay coil can produce a spike of hundreds of volts across the switching device. It will destroy a
transistor instantly and it will erode a mechanical contact over time.

The cure is a flyback diode across the coil, reverse biased, giving the collapsing current a loop
to circulate in. It costs a few cents and its absence is one of the most common faults in
home-built show electronics. Class 5 and Class 6 are built around this.

---

## Semiconductors, in one page

You will meet these properly in Class 5 and Class 11. For now, recognise them.

- **Transistor (BJT).** A small base current controls a much larger collector current. Three legs.
  Used as a switch or an amplifier. Cheap, forgiving, needs a base resistor.
- **MOSFET.** A voltage on the gate controls current between drain and source. Three legs, looks
  similar, behaves differently: it takes almost no steady current to hold it on, but it is static
  sensitive and it needs its gate driven properly. The workhorse for switching LED strips, solenoids
  and motors.
- **Voltage regulator.** Three legs, takes a messy input voltage and produces a clean fixed output.
  A linear one burns off the difference as heat, which is why a 12 V to 5 V linear regulator running
  a metre of LED strip needs a heatsink or a rethink.
- **Optocoupler.** An LED and a light sensor in one package, with no electrical connection between
  them. This is how a 5 V microcontroller safely tells a 230 V circuit what to do, and it is the
  most important part in this list for a technical director.
- **Integrated circuit.** Anything from a logic gate to a microcontroller. Read the number on top
  and search it; the datasheet's first page is written for exactly this moment.

---

## Connectors: why the industry chose what it chose

Connectors are where theatre electronics actually fails, so they get an hour.

<!--anim:connector-family-->

Every connector in a venue is a set of answers to the same five questions: how much current, is it
signal or power, does it need to lock, does it need to be sexless or gendered, and what must it be
impossible to plug into by mistake.

| Connector | Carries | Why it exists |
| --- | --- | --- |
| XLR 3-pin | Balanced analogue audio | Locking, robust, sexed so signal flow is unambiguous |
| XLR 5-pin | DMX512 | Deliberately different from audio so the two cannot be mixed |
| Speakon | Loudspeaker level | High current, locking, no exposed conductors when live |
| powerCON / TRUE1 | Mains to equipment | Locking mains, and TRUE1 can be connected under load |
| IEC C13 / C14 | Mains to equipment | Universal, cheap, and falls out, which is why it is taped |
| 16 A / 32 A CEE | Mains distribution | Colour coded by voltage, IP rated, keyed by phase count |
| Socapex 19-pin | Six dimmer circuits in one | One cable instead of six, for touring |
| RJ45 / etherCON | Network, and DMX over IP | Cheap and ubiquitous; etherCON adds a locking shell |
| Jack, 6.35 mm | Instrument and line audio | Legacy, unbalanced, disconnects noisily |
| Phoenix / terminal block | Field wiring to a board | Serviceable, no soldering, needs a torque check |

### The two rules

**One: a connector must make it impossible to do the wrong thing.** This is why DMX is on 5-pin
XLR and not 3-pin, even though only three pins are used. Somebody decided that plugging a DMX line
into a microphone input should be physically impossible, and they were right. When you see a rig
using 3-pin XLR for DMX, that safeguard has been thrown away to save money, and the failure it
causes will be intermittent and hard to find.

<!--anim:pin-count-->

**Two: the connector is not the weak point, the strain relief is.** A cable almost never fails in
the middle. It fails where it enters the connector, because that is where the flexing is
concentrated. Class 4 is about that sentence, at a bench, with an iron.

---

## Transformers

Two coils sharing a magnetic core. Alternating current in one induces a voltage in the other, in
the ratio of their turns, and nothing conducts between them.

<!--anim:transformer-->

```
V_secondary ÷ V_primary = N_secondary ÷ N_primary
```

A 230 V to 12 V transformer has about nineteen times as many turns on the primary. Power is
conserved less the losses, so the current ratio is inverted: twelve volts at five amps out is about
230 volts at 0.28 amps in.

Three reasons they matter to you, and only one of them is about changing voltage:

**Isolation.** There is no conductive path between primary and secondary. This is the strongest
form of isolation available and it is why an isolating transformer appears on the safety card.

**They only work on AC.** A transformer fed DC is a short circuit with a time constant, and it will
draw current until something gives. This is not a subtlety, it is the second most common way people
destroy transformers.

**Inrush.** Energising a transformer at the wrong point in the mains cycle saturates the core and
draws a very large momentary current, which is why a rack of transformer-based equipment trips a
breaker at switch-on and runs happily afterwards. That is Class 5.

Toroidal transformers are quieter and more efficient and have worse inrush. Switch-mode supplies
have replaced them nearly everywhere, which is why almost everything in a modern rig has the
switch-mode signature you will find on a scope in Class 8.

---

## Fuses, breakers and the things that pretend to be them

<!--anim:fuse-types-->

A protective device is characterised by two numbers and a curve: the current it will carry
indefinitely, the current at which it opens quickly, and how long it takes at everything in
between.

| Device | Opens | Resets | Where |
| --- | --- | --- | --- |
| Fast-blow fuse (F) | Quickly, at low overload | No | Electronics, meter current ranges |
| Slow-blow fuse (T) | Tolerates inrush, then opens | No | Anything with a transformer or motor |
| Type B breaker | 3 to 5 × rating, magnetically | Yes | General socket and lighting circuits |
| Type C breaker | 5 to 10 × rating | Yes | Circuits with real inrush: motors, LED racks |
| PTC "resettable fuse" | Heats and becomes high resistance | Yes, on cooling | Board-level protection |
| Electronic current limit | Instantly, in the supply | Yes | Bench supplies, good LED drivers |

**The trap is the slow-blow.** A device with an inrush needs a fuse that tolerates it, and fitting a
fast-blow "because it is the same rating" gives you equipment that blows a fuse every time it is
switched on. Fitting a fast-blow where a slow-blow belongs is the more common direction; fitting a
larger fuse to stop the nuisance is the dangerous one.

**And the PTC is not a fuse.** It goes high resistance while the fault persists and recovers when
it cools, which means a fault behind a PTC sits there cycling rather than announcing itself. It
protects the board and it hides the problem.

---

## At the bench

Two hours.

### Block A — Identify fifty parts (40 min)

Fifty components in trays. For each: name it, read its value from its markings, measure it, and say
how it fails. Log all four.

Some of them are marked in ways you have not seen. That is deliberate: the skill is reading an
unfamiliar marking system by working out what it must mean, not recalling one you were taught.

### Block B — The LED that dies (30 min)

Calculate the correct series resistor for a red LED on 5 V at 20 mA. Build it. Measure the actual
current and the voltage across each part, and confirm they sum to the supply.

Then, on the sacrificial rig, with eye protection, connect an LED with no resistor and watch the
current on the bench supply's display. Record how long it takes and what the final current was. You
get one LED for this and you will remember it.

### Block C — Capacitor time constants (30 min)

With a 100 kΩ resistor and a 100 µF capacitor, predict the time constant, then charge the capacitor
and time it with a stopwatch to 63 per cent of the supply voltage. Repeat with 10 kΩ.

Then discharge a 4700 µF capacitor through a 100 Ω resistor and measure how long it takes to become
safe to touch. Write that number down. It is the reason for the rule about capacitors in mains
equipment.

### Block D — Connector inspection (20 min)

A tray of connectors, half of them faulty. Find the faults by eye and by meter: bent pins, cold
joints, strands escaping the barrel, missing strain relief, a shield connected at both ends when it
should not be, a cracked shell. Photograph each fault and write one sentence on how it would
present during a show.

---

## Common misconceptions

- **"An LED just needs the right voltage."** An LED needs the right *current*, and voltage is a
  very poor way to set it because the curve is nearly vertical. Every LED fixture in your rig
  contains a constant-current driver for exactly this reason, and it is why LED fixtures and
  phase-control dimmers do not mix.
- **"A capacitor blocks DC, so a circuit with a capacitor in it is safe when unplugged."** A charged
  capacitor is a small battery. Large ones in mains equipment hold enough energy to hurt you
  minutes after the plug is out, which is why the discharge procedure exists and why you measure
  before you touch.
- **"A resistor's only rating is its resistance."** Its power rating decides whether it survives.
  `P = I² × R` before you choose the size, and remember a resistor at its rated power is running at
  a temperature you cannot hold your finger on.
- **"Components fail because they are old."** Components fail because a limit was exceeded, usually
  thermal, usually repeatedly. Age is how long it took, not why. This distinction is what makes a
  fault report useful, because a root cause you can name is a fault that does not come back.
- **"DMX on 3-pin XLR is fine because it only uses three pins."** Electrically it often works. The
  5-pin connector exists so that a DMX line cannot be plugged into an audio input or a microphone
  into a dimmer. Using 3-pin discards a safeguard, and the resulting fault is intermittent and
  expensive to find.
- **"A bigger capacitor is always a better decoupling capacitor."** Decoupling needs low impedance
  at high frequency, and a large electrolytic is poor at high frequency because of its own internal
  inductance. That is why boards have a 100 nF ceramic next to every chip *and* a big electrolytic
  at the supply entry, doing two different jobs.

---

## Numbers from this class

| Quantity | Value |
| --- | --- |
| Silicon diode forward drop | about 0.7 V |
| Schottky diode forward drop | about 0.3 V |
| Red LED forward voltage | 1.8–2.2 V |
| Green or blue LED forward voltage | 3.0–3.4 V |
| Typical indicator LED current | 10–20 mA |
| LED series resistor formula | `R = (V_supply − V_f) ÷ I` |
| RC time constant | `τ = R × C` |
| Charge reached in one time constant | 63 per cent |
| Time constants to be fully charged | 5 |
| Standard resistor tolerance, gold band | ±5 per cent |
| Standard resistor tolerance, brown band | ±1 per cent |
| SMD marking `472` | 4.7 kΩ |
| Common decoupling capacitor | 100 nF, at each chip |
| Relay coil flyback spike, unprotected | hundreds of volts |
| DMX connector | 5-pin XLR |
| Balanced audio connector | 3-pin XLR |
| Mains connector, locking | powerCON or TRUE1 |
| Socapex circuits per cable | 6 |
