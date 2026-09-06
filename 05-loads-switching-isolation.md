# Class 5 — Loads, Switching and Isolation

> A 5 volt thought has to become a 230 volt action. Everything in this class is about the boundary
> between those two worlds, and about making sure neither one can reach across it.

## Before you come

### What you must already be able to do

Calculate an LED series resistor without help. Explain the flyback problem in one sentence. Read a
resistor. Use `P = I² × R`. Terminate and test a cable, because from here on you will be building
things that plug into other things.

### Three things to do

1. **Find three relays in your building** and photograph the label. Coil voltage, contact rating,
   number of poles. They are in the dimmer rack, in the HVAC panel, and inside almost every piece of
   equipment with a hard on-off.
2. **Look up one MOSFET datasheet** — `IRLZ44N` is a good one — and find three numbers on it:
   V_GS(th), R_DS(on), and the continuous drain current. You will not understand all of it. Find
   those three.
3. **Write down what you think happens** if a microcontroller output is connected straight to a
   relay coil. One paragraph, your best guess, brought to class. We compare guesses to the
   oscilloscope trace.

### What to bring

Meter, notebook, and the cables you made in Class 4.

<!--ready:5-->

---

## The problem this class solves

A microcontroller pin can supply about 20 milliamps at 3.3 or 5 volts. That is a fortieth of a
watt. A stage practical, a solenoid, a smoke machine or a motor wants somewhere between ten watts
and three kilowatts.

Between those two numbers sits every piece of show automation ever built. The bridge has three
jobs, and confusing them is the source of most home-built show electronics failures:

1. **Amplification.** A small signal controls a large current.
2. **Protection.** The large side must not be able to destroy the small side, ever, including
   during a fault.
3. **Isolation.** In many cases the two sides must share no electrical connection at all, so that a
   mains fault cannot appear on a control desk that a person is touching.

---

## Relays: switching by moving metal

A relay is an electromagnet that physically pulls a contact closed. It is the oldest solution and
still the right one more often than people expect.

<!--anim:relay-inside-->

**What it gives you.** Genuine galvanic isolation between coil and contacts, typically rated for
several kilovolts. It switches AC or DC equally well. It has essentially zero on-resistance, so it
dissipates almost nothing while closed. And it is obvious: you can hear it, and you can see whether
it has operated.

**What it costs you.** It is slow, five to fifteen milliseconds, which rules it out for anything
that needs to be fast or silent. It wears out mechanically, typically after tens of millions of
operations, and electrically far sooner if it is switching an arc. It clicks, which matters
enormously in a quiet auditorium. And the coil is an inductor, so it kicks.

### The flyback diode, and why it is not optional

<!--anim:flyback-->

When you interrupt current through a coil, the collapsing magnetic field drives the voltage as high
as it needs to go to maintain that current. Hundreds of volts, from a 12 volt supply, in
microseconds.

A diode across the coil, reverse biased in normal operation, gives that current a loop to circulate
in until it decays. It costs two cents.

Without it: the transistor driving the coil dies, sometimes immediately and sometimes after two
hundred operations. Mechanical contacts driving the coil erode and weld. And the spike radiates,
resetting microcontrollers elsewhere in the same box.

**Every inductive load gets a flyback diode.** Relays, solenoids, valves, motors, contactors. In
Class 6 you will build a board with one and then remove it and watch the scope, which is the only
way this becomes permanent knowledge.

### Contact ratings, read properly

A relay marked "10 A 250 VAC" is not a 10 A relay. It is a relay rated 10 A for **resistive** loads
at 250 V AC. Three derating factors apply and all three matter in a theatre:

- **Inductive loads** — motors, transformers, solenoids — draw an inrush and produce an arc on
  break. Derate substantially, often to a third.
- **DC** is much harder than AC because there is no zero crossing to extinguish the arc. A relay
  rated 10 A at 250 V AC may be rated 0.5 A at 30 V DC. This surprises people constantly.
- **Lamp loads** have a cold filament inrush of ten to fifteen times the running current for a few
  milliseconds, which welds contacts over time.

---

## Transistors and MOSFETs: switching without moving

For DC loads, for anything that must be silent, and for anything that must be fast or dimmable, you
switch with a semiconductor.

<!--anim:mosfet-gate-->

A MOSFET is a voltage-controlled switch. Put enough voltage on the gate relative to the source and
the channel between drain and source becomes a low resistance. Take it away and it becomes an open
circuit.

Three numbers decide whether a given MOSFET will work for you:

**V_GS(th), the threshold voltage.** The gate voltage at which it *starts* to conduct — not where
it is fully on. This is the single most common mistake: a standard MOSFET has a threshold around
4 V and needs 10 V to turn on properly, so a 3.3 V microcontroller pin leaves it half on. Half on
means high resistance, which means heat, which means a dead part and a scorched board. You want a
**logic-level** MOSFET, which is what the L in IRLZ44N is telling you.

**R_DS(on), the on-resistance.** Typically 10 to 50 milliohms. The dissipation is `I² × R_DS(on)`,
so 5 A through 25 mΩ is 0.6 W: warm, fine, no heatsink. But if the gate is under-driven and
R_DS(on) is effectively 2 Ω, the same 5 A dissipates 50 W and the part is destroyed in seconds.

**Continuous drain current.** Read the small print: it is quoted at a case temperature you will
never achieve. Halve it and you are being realistic.

<!--anim:pwm-heat-->

### Why switching beats varying

You could control brightness by putting a variable resistance in series with a lamp. Nobody does,
because that resistance dissipates the power it removes. Dim a 100 W lamp to half by resistance and
you are heating a resistor with tens of watts.

Instead you switch fully on and fully off, fast, and vary the ratio. A fully-on switch has almost
no voltage across it and a fully-off switch has almost no current through it, and power is voltage
times current, so both states dissipate almost nothing. All the loss is in the brief transitions.

That is pulse width modulation, it is why every modern dimmer and motor drive works this way, and
Class 11 builds one.

---

## Isolation: the part that matters most to you

<!--anim:opto-->

Amplification is engineering. Isolation is safety, and it is the part of this class that a technical
director signs their name to.

An **optocoupler** is an LED and a photosensitive transistor in one package with no electrical
connection between them, only light across a millimetre of transparent plastic. The control side
lights the LED; the load side sees a transistor turn on. Isolation voltages of 2.5 to 5 kV are
routine.

The consequence: a fault on the mains side cannot put voltage onto the control side. A performer
touching a prop cannot be connected, through any single failure, to the switched circuit.

Where you must insist on isolation:

- Anywhere a control system touches mains.
- Anywhere a control cable leaves an enclosure and runs to another building or another power source.
- Anywhere the control side is touched by a person, which in a theatre is nearly everywhere.
- On DMX inputs and outputs, which is why good DMX splitters are described as "optically isolated"
  and why they cost more.

**Isolation is defeated by a single wire.** Two isolated halves connected by a shared ground for
convenience are not isolated any more. This is subtle, it happens constantly in home-built systems,
and you should be able to spot it on a schematic by Class 6.

### Solid state relays

An SSR combines an optocoupler and a triac or MOSFET output in one package. Isolated, silent, no
moving parts, no contact wear, and fast.

Two properties to know. A zero-crossing SSR waits for the AC waveform to pass through zero before
switching, which greatly reduces electrical noise and makes it unsuitable for phase-control
dimming. And an SSR dissipates real power while conducting, about 1 to 1.5 V times the current, so
a 10 A SSR dissipates 10 to 15 W and needs a heatsink, which people forget because it is small and
looks like a relay.

---

## Inrush, and why the breaker trips at the top of the show

<!--anim:inrush-->

Three loads in a theatre draw enormously more current at switch-on than in normal running:

| Load | Inrush | Duration | Why |
| --- | --- | --- | --- |
| Tungsten lamp | 10–15 × running | 50–200 ms | Cold filament resistance is a tenth of hot |
| Switch-mode supply | 20–100 A per unit | 1–10 ms | Charging the input capacitors |
| Motor | 5–8 × running | 0.5–3 s | No back-EMF until it is turning |

The switch-mode case is the one that bites modern rigs. Every LED fixture, every media server,
every network switch has an input capacitor that looks like a short circuit for the first few
milliseconds. One fixture is nothing. Forty fixtures on one circuit, all energised by the same
switch at the same instant, is a very large momentary current, and the breaker sees it.

This is why the answer is often **sequencing** rather than a bigger breaker: bring circuits up in
groups a second apart, and the peaks never coincide. It is why powered devices in a rack are
switched by a sequencer, and it is a design decision that belongs to you, not to the electrician.

---

## At the bench

Two hours and ten minutes. Low voltage. The mains work is demonstration only.

### Block A — Drive a relay properly (40 min)

Build a transistor relay driver on breadboard: signal in, base resistor, transistor, relay coil,
flyback diode. Prove it switches.

Then remove the flyback diode and put the scope across the transistor. Photograph the trace.
Measure the peak. Put the diode back and photograph again.

That pair of photographs goes in your notebook and it is the answer to any future argument about
whether the diode matters.

### Block B — MOSFET, driven well and driven badly (40 min)

Same load, switched by a logic-level MOSFET at 5 V on the gate. Measure V_DS while on, calculate
R_DS(on) from the current, and calculate the dissipation. Touch the tab: cool.

Now drive the same MOSFET's gate through a 100 kΩ resistor so it switches slowly, and repeat.
Measure the temperature rise with the IR thermometer. Explain, in writing, using `P = I² × R`,
why a slower gate makes a hotter part.

### Block C — Isolation, proved (30 min)

Build an optocoupler stage. Then prove the isolation with a meter: measure resistance between every
input pin and every output pin. It should be open in every combination.

Then introduce the classic error — connect the two grounds together "for convenience" — and repeat
the measurement. Write one sentence on what you have just destroyed.

### Block D — Inrush, watched (20 min)

With a current probe on the scope, capture switch-on of a tungsten lamp, a small switch-mode supply,
and four switch-mode supplies together. Measure the peak and the duration of each. Then capture the
four supplies switched a second apart and compare the peaks.

---

## Common misconceptions

- **"A relay rated 10 A can switch 10 A of anything."** It can switch 10 A of resistive load at the
  stated AC voltage. Inductive loads, DC, and lamp inrush all derate it, DC most severely, because
  a DC arc has no zero crossing to extinguish it.
- **"The flyback diode is a nice-to-have."** It is the difference between a driver that works and a
  driver that destroys itself, sometimes on the first operation and sometimes on the two hundredth.
  The delayed failures are worse, because they happen in performance.
- **"Any MOSFET will switch from a microcontroller pin."** A standard MOSFET needs about 10 V on the
  gate to turn fully on. At 3.3 or 5 V it is partly on, its resistance is high, it dissipates
  heavily and it dies. You need a logic-level part or a gate driver, and the datasheet's V_GS(th)
  is where you check.
- **"Optically isolated means it is safe."** It means there is no conductive path *through that
  component*. Run a shared ground wire around the outside and the isolation is gone while the
  component is still doing its job perfectly. Isolation is a property of the whole system.
- **"An SSR runs cool because it has no moving parts."** An SSR drops about a volt while conducting,
  so a 10 A SSR turns roughly 10 to 15 W into heat continuously. It needs a heatsink, and the
  most common SSR failure is a thermal one caused by mounting it on nothing.
- **"If the breaker trips at switch-on, fit a bigger breaker."** The breaker is doing its job on a
  current that genuinely flows. The engineering answer is usually to sequence the switch-on so the
  inrush peaks do not coincide, or to use a breaker with a curve suited to the load. A bigger
  breaker means a fault has to get bigger before anything notices.

---

## Numbers from this class

| Quantity | Value |
| --- | --- |
| Microcontroller pin current, safe maximum | about 20 mA |
| Relay operate time | 5–15 ms |
| Relay coil flyback spike, unprotected | hundreds of volts |
| Relay life, mechanical | tens of millions of operations |
| Relay DC derating from its AC rating | often 20:1 or worse |
| Logic-level MOSFET gate threshold | 1–2 V, fully on by 4.5 V |
| Standard MOSFET gate threshold | 2–4 V, needs 10 V to be fully on |
| Typical power MOSFET R_DS(on) | 10–50 mΩ |
| MOSFET dissipation | `P = I² × R_DS(on)` |
| Optocoupler isolation voltage | 2.5–5 kV |
| SSR forward drop while conducting | 1–1.5 V |
| Tungsten lamp inrush | 10–15 × running current |
| Switch-mode supply inrush | 20–100 A, 1–10 ms |
| Motor starting current | 5–8 × running current |
| Recommended sequencing interval | about 1 second between groups |
