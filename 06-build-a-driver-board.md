# Class 6 — Build a Driver Board

> One board, built from a schematic you can read, tested against a document you wrote, and kept.
> You will use it in Class 12 and again in the capstone.

## Before you come

### What you must already be able to do

Solder a consistent joint. Calculate an LED series resistor. Explain why a flyback diode exists.
Say what V_GS(th) and R_DS(on) mean and why a logic-level MOSFET matters. Test a cable properly.

This class assumes Class 4 and Class 5 both landed. If either did not, say so before we start
rather than three hours in.

### Three things to do

1. **Read the schematic**, which is on this page and in the pack. Not skim: read it, and write down
   every component you cannot account for. Bring that list. It is the most useful thing you can
   bring.
2. **Work out the two resistor values yourself** before you arrive: the gate pull-down and the LED
   series resistor. Show the arithmetic. We compare answers at the start.
3. **Decide your own test plan.** Three tests that would prove the board works, and one test that
   would prove it is safe. Write them down before you build, because writing them afterwards is how
   you accidentally write tests that your board happens to pass.

### What to bring

Everything. Iron skills, meter, safety glasses, notebook, and the cables from Class 4.

<!--ready:6-->

---

## What you are building

A four-channel isolated low-side switch. In plain terms: four logic inputs, four outputs that can
each switch several amps of DC load, with the control side electrically separate from the load side.

It is a real thing. Boards exactly like this drive practical lamps in scenery, solenoid catches,
smoke machine triggers, small motors and LED tape all over this industry.

<!--anim:driver-board-->

### Reading the schematic, stage by stage

Each channel is five parts in a chain. Understand the chain once and you understand all four.

**1. Input and pull-down.** The signal arrives from a microcontroller or a control system. A 10 kΩ
resistor from the input to ground is the pull-down, and it exists to answer one question: *what does
this output do when nothing is connected to the input?*

Without it, the input floats, picks up interference and switches randomly. With it, a disconnected
input is a definite off. **A floating input is not off, it is undefined**, and undefined behaviour
in a show is the thing you are being trained to prevent.

**2. The optocoupler.** The input current lights an internal LED through its own series resistor.
On the far side, a phototransistor conducts. There is no electrical path across it: that gap is the
whole point of the board.

**3. Gate resistor and gate pull-down.** A small series resistor, 100 to 220 Ω, limits the current
spike into the MOSFET's gate capacitance. A 10 kΩ pull-down from gate to source guarantees the
MOSFET is off when nothing is driving it — the same argument as stage one, applied at the dangerous
end.

**4. The MOSFET.** Logic-level, low R_DS(on), switching the low side of the load: the load connects
to the positive rail, and the MOSFET connects the load's other end to ground.

Low-side switching is simpler because the gate reference is ground. Its cost is that the load sits
at supply potential even when off, which is a real safety consideration and one of the things your
documentation must state.

**5. Flyback diode and indicator.** A diode across the output terminals, cathode to the positive
rail, catching the inductive kick from any load. An LED and its resistor across the output so you
can see the channel's state without a meter.

### The bill of materials

| Qty | Part | Why this one |
| --- | --- | --- |
| 4 | PC817 optocoupler | Cheap, 5 kV isolation, forgiving |
| 4 | IRLZ44N MOSFET | Logic-level, 22 mΩ, plenty of headroom |
| 4 | 1N5819 Schottky diode | Fast recovery, low drop, catches the flyback |
| 4 | 220 Ω resistor | Optocoupler LED current |
| 4 | 150 Ω resistor | MOSFET gate series |
| 8 | 10 kΩ resistor | Input and gate pull-downs |
| 4 | 1 kΩ resistor | Indicator LED |
| 4 | LED, 3 mm | Channel state |
| 2 | Screw terminal, 4-way | Load and supply |
| 1 | Header, 5-way | Control input and control ground |
| 1 | 100 nF ceramic | Decoupling at the control side |
| 1 | 100 µF electrolytic | Bulk, at the load supply entry |

Two decisions in that table are worth arguing about, and we will: why a Schottky rather than a
1N4007, and why 220 Ω rather than 1 kΩ on the optocoupler. Come with an opinion.

---

## Build order, and why it is this order

Build order is not arbitrary. It is chosen so that each stage can be tested before the next one
hides it.

<!--anim:build-order-->

1. **Lowest components first.** Resistors and diodes lie flat and are held by the board when you
   turn it over. Tall parts last, or the short ones fall out.
2. **Passives before semiconductors.** Semiconductors are heat-sensitive and static-sensitive, and
   you do the most fumbling early.
3. **Test the supply before fitting anything active.** Fit the terminals and the decoupling, apply
   power, and confirm the rails are where you think. If a rail is wrong, you have destroyed nothing.
4. **One channel, complete, tested.** Then the other three. Building all four and testing at the end
   means a mistake is repeated four times before you find it.
5. **Indicators last.** They are the easiest to fit wrong and the least important.

### The habits that separate a good bench from a slow one

- **Check orientation before you solder, on every polarised part.** Diodes, LEDs, electrolytics,
  optocouplers, MOSFETs. Desoldering an eight-pin part without lifting a pad is a genuinely
  difficult operation and there is no reason to learn it today.
- **Clip leads after each joint**, not at the end. A clipping that falls onto a finished board and
  bridges two pads is a fault you will spend an hour on.
- **Inspect after every ten joints, under the loupe.** Finding a bridge at joint 12 costs a minute;
  finding it at joint 60 costs an hour.
- **Do not power a board you have not inspected.** Look at the underside with the loupe, at an
  angle, with a light behind it. Bridges are visible from one angle and invisible from another.

---

## Testing: the part that is actually assessed

Anybody can assemble a board. What is being assessed today is whether you can **prove** it works,
in an order that finds faults safely.

<!--anim:test-order-->

### Test 1 — Dead tests, before any power

With the board unpowered and nothing connected:

- Resistance across the supply terminals. Expect high, at least tens of kilohms, settling upward as
  the electrolytic charges from the meter. **A low reading here means a short, and powering it would
  turn a five minute fix into a destroyed board.**
- Resistance between control ground and load ground. Expect open. This is the isolation test, and
  it is the single most important measurement on the board.
- Continuity from each MOSFET drain to its output terminal. Expect near zero.
- Resistance from each gate to source. Expect about 10 kΩ, which proves the pull-down is fitted.

### Test 2 — Powered, no load, no input

- Supply current with everything off: a few milliamps at most. Anything above that means a channel
  is partly on.
- Every output should read the full supply voltage relative to load ground, because the MOSFET is
  off and the load path is open.
- Every gate should read near zero.

### Test 3 — One channel at a time, with a load

Fit a resistive load. Apply the control input. Confirm:

- The LED lights.
- The output pulls down to near zero.
- V_DS while on is small. Calculate R_DS(on) from V_DS and the current and compare it to the
  datasheet. If it is far higher, the gate is under-driven and you have a problem to find now
  rather than in a performance.
- The MOSFET is cool after two minutes. Warm is a question. Hot is a fault.

### Test 4 — The flyback test

Swap the resistive load for a relay coil. Scope across the MOSFET's drain and source, and switch it.

Photograph the trace. Then lift the flyback diode, repeat, and photograph again. You did this on
breadboard in Class 5; on your own board it means something different, because now it is your
design decision being validated.

### Test 5 — Isolation, at voltage

The technician tests the isolation barrier with an insulation tester at 500 V. You watch. A board
that fails this test is not a board with a fault, it is a board that is dangerous, and the
difference in language matters.

---

## Document it

Every board leaves this room with a single sheet, and the sheet is marked. In the industry this
sheet is the difference between a piece of equipment that can be used on a production and a mystery
object in a flight case.

It carries:

1. **What it is and what it is for.** Two sentences.
2. **Ratings.** Supply voltage range, maximum current per channel, maximum total, isolation rating.
3. **The pinout**, drawn, with the connector orientation shown.
4. **The behaviour on loss of control signal.** Yours fails to *off*, because of the pull-downs.
   Say so explicitly: this is the sentence a production manager actually reads.
5. **Test results**, with the numbers you measured, dated and initialled.
6. **Known limitations.** Yours has at least two: the load sits at supply potential when off, and
   there is no over-current protection. Write them down. A limitation you have named is engineering;
   the same limitation undocumented is a defect.

---

## At the bench

Three hours and twenty minutes, essentially all of it building and testing.

### Block A — Read and check (25 min)

Compare your pre-class resistor calculations with the group. Walk the schematic stage by stage.
Identify, before anybody picks up an iron, which single component's omission would make the board
dangerous rather than merely broken.

### Block B — Build (100 min)

In the order above. Channel one tested before channels two to four are populated.

### Block C — Test and record (50 min)

All five tests, all results written down as numbers rather than ticks. "Pass" is not a measurement.

### Block D — Break somebody else's, then fix your own (25 min)

Swap boards. The technician has introduced one fault into each: a reversed diode, a missing
pull-down, a bridged pad, an under-driven gate. Find it using the test sequence, not by looking at
the board, and write down which test caught it.

Then get your own board back and re-run the test that would have caught the fault you were given.

---

## Common misconceptions

- **"It works, so the build is finished."** Working is the first test, not the last. A board with a
  missing gate pull-down works perfectly until the day the control cable is unplugged with the load
  powered, and then it does something unpredictable at the worst moment.
- **"Test at the end, it saves time."** Testing one channel before building the other three is how
  you find a systematic error once instead of four times. Every experienced builder does this and
  every beginner thinks it is slower.
- **"The isolation is provided by the optocoupler."** It is provided by the optocoupler *and* by the
  absence of any other path. One convenience wire between the two grounds, one mounting screw
  touching both planes, and the component is still working while the system is no longer isolated.
- **"A warm MOSFET is normal."** A logic-level MOSFET with tens of milliohms of on-resistance,
  properly driven, at a few amps, is barely above ambient. Warm means the gate drive is inadequate
  or the current is higher than you think, and both get worse rather than better.
- **"Documentation is paperwork."** The sheet answers the questions a production manager will ask
  at 19:00: what happens if it loses signal, what is it rated for, who tested it. Without it the
  answer is "we would have to take it apart", and the real answer becomes "use something else".
- **"A fault you cannot find by looking is a hard fault."** Almost every fault on a board like this
  is caught by one of the five tests, in order. Looking is the least reliable diagnostic method and
  it is the one everybody reaches for first.

---

## Numbers from this class

| Quantity | Value |
| --- | --- |
| Optocoupler LED series resistor, 5 V logic | 220 Ω |
| MOSFET gate series resistor | 100–220 Ω |
| Input and gate pull-down | 10 kΩ |
| Indicator LED resistor, 12 V | 1 kΩ |
| IRLZ44N R_DS(on) | about 22 mΩ |
| IRLZ44N gate threshold | 1–2 V |
| PC817 isolation voltage | 5 kV |
| Board quiescent current, all channels off | a few mA |
| Expected supply-terminal resistance, dead test | tens of kΩ, rising |
| Expected control-to-load ground resistance | open circuit |
| Expected gate-to-source resistance | about 10 kΩ |
| Insulation test voltage | 500 V |
| Dissipation at 5 A through 22 mΩ | about 0.55 W |
| Documented failure mode on signal loss | outputs off |
