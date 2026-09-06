# Foundations

Nothing on this page is difficult. All of it is assumed, silently, in every class after the first,
and a student who has not met it spends Class 5 fighting the arithmetic instead of learning the
switching. Forty minutes, done once.

---

## Prefixes, and reading a value out loud

Every quantity in this course is written with a prefix. Knowing them is not memorisation, it is
being able to read.

| Prefix | Symbol | Multiply by | Written as |
| --- | --- | --- | --- |
| mega | M | 1,000,000 | 10 MΩ |
| kilo | k | 1,000 | 4.7 kΩ |
| (none) | | 1 | 470 Ω |
| milli | m | 0.001 | 20 mA |
| micro | µ | 0.000001 | 100 µF |
| nano | n | 0.000000001 | 100 nF |
| pico | p | 0.000000000001 | 22 pF |

Each step is a factor of a thousand. That is the whole system.

<!--anim:prefix-ladder-->

### The engineering shorthand

You will see `4k7` and `2R2` and `1M0`. The prefix letter replaces the decimal point, so `4k7` is
4.7 kΩ and `2R2` is 2.2 Ω. It exists because a printed decimal point disappears on a photocopy or a
faded silkscreen, and a resistor value read as 47 kΩ instead of 4.7 kΩ is a factor of ten.

### The conversions you will do constantly

| From | To | Do this |
| --- | --- | --- |
| Milliamps to amps | | Divide by 1,000. 20 mA = 0.02 A |
| Amps to milliamps | | Multiply by 1,000. 0.15 A = 150 mA |
| Kilohms to ohms | | Multiply by 1,000. 4.7 kΩ = 4,700 Ω |
| Microfarads to farads | | Divide by 1,000,000. 100 µF = 0.0001 F |
| Nanofarads to microfarads | | Divide by 1,000. 100 nF = 0.1 µF |

**Use base units in every calculation.** Volts, amps, ohms, farads, seconds. Mixing milliamps into a
formula expecting amps is the single most common arithmetic error in this course, and it produces
answers wrong by exactly a factor of a thousand, which is at least easy to spot once you are looking
for it.

---

## Powers of ten, without a calculator

Multiplying and dividing by powers of ten is moving the decimal point. That is worth practising
until it is automatic, because it is most of the arithmetic you will do at a bench.

```
0.02 × 150   →   2 × 150 = 300, then move two places   →   3
                 (0.02 is 2 × 10⁻², so the answer is 300 × 10⁻²)

12 ÷ 0.02    →   12 ÷ 2 = 6, then move two places the other way   →   600
```

The habit that makes this reliable: **do the digits first, then count the zeros separately.**

### Sanity checking

Before you accept any answer, ask whether it is roughly the right size. This catches nearly every
mistake, and it takes a second.

| If you calculate | And you get | Something is wrong |
| --- | --- | --- |
| An LED series resistor | 150 kΩ | The LED will be invisible; you used µA |
| Current in a 12 V circuit with 100 Ω | 1,200 A | You multiplied instead of divided |
| The power in a small resistor | 400 W | Check your current units |
| Cable voltage drop over 20 m | 90 V | You are off by a factor of ten somewhere |

Build the habit of stating the expected order of magnitude out loud before you calculate. It is the
same discipline as predicting a measurement before you take it, and it works for the same reason.

---

## The three formulae

Everything electrical in this course sits on these.

```
V = I × R          Ohm's law
P = V × I          Power
P = I² × R         Power in a resistance
```

<!--anim:formula-wheel-->

### Rearranging without looking it up

Ohm's law rearranges three ways. If you find yourself looking it up, cover the quantity you want
with a finger on the triangle and read what is left.

```
I = V ÷ R          R = V ÷ I          V = I × R
```

The same for power. And the third formula follows from substituting the first into the second:
since `V = I × R`, then `P = V × I = (I × R) × I = I² × R`.

**The squared term is the one that matters most in practice.** Double the current and the heating
goes up four times. That single fact explains why undersized cable does not fail gently, why a loose
connection runs away once it starts, and why a half-turned-on MOSFET destroys itself.

### Worked examples, the ones you will actually do

**A 500 W lamp on 230 V. What current?**
`I = P ÷ V = 500 ÷ 230 = 2.17 A`

**Six of those on one 16 A circuit. Is it acceptable?**
`6 × 2.17 = 13.0 A`. Under 16 A, so yes on paper, and with about 19 per cent headroom, which is
tight but workable. Seven would be 15.2 A and only 5 per cent under, which is not.

**An LED needing 20 mA at 2 V, from a 5 V supply.**
The resistor drops `5 − 2 = 3 V` at `0.02 A`, so `R = 3 ÷ 0.02 = 150 Ω`.
Its power is `P = I² × R = 0.02² × 150 = 0.0004 × 150 = 0.06 W`. A quarter-watt part is comfortable.

**A MOSFET with 25 mΩ on-resistance carrying 8 A.**
`P = I² × R = 64 × 0.025 = 1.6 W`. Warm, and it wants some copper around it.

**The same MOSFET half turned on, behaving like 2 Ω.**
`P = 64 × 2 = 128 W`. Destroyed in about a second. This is why gate drive matters.

---

## Series and parallel arithmetic

**In series**, resistances add: `R = R₁ + R₂ + R₃`

**In parallel**, the reciprocals add: `1/R = 1/R₁ + 1/R₂`

For exactly two in parallel, the short form is easier: `R = (R₁ × R₂) ÷ (R₁ + R₂)`

<!--anim:series-parallel-math-->

Three shortcuts worth having:

- **Two equal resistors in parallel** give half the value. Ten equal ones give a tenth.
- **A parallel combination is always smaller than the smallest resistor in it.** If your answer is
  not, you have made an arithmetic error, and this check costs nothing.
- **A very large resistor in parallel with a small one** barely changes it. 1 MΩ across 100 Ω is
  99.99 Ω, which is why a 10 MΩ meter can measure most circuits without disturbing them, and why
  the exceptions in Class 2 are exceptions.

---

## Reading a schematic

A schematic is a map of connections, not a picture of the object. Two wires crossing without a dot
are not connected; with a dot, they are.

| Symbol | What |
| --- | --- |
| Zigzag, or a plain rectangle | Resistor |
| Two parallel lines | Capacitor, non-polarised |
| One straight and one curved line | Capacitor, polarised: the curve is negative |
| Triangle against a bar | Diode: current flows toward the bar |
| Triangle with arrows | LED |
| Circle with three legs | Transistor |
| Three horizontal lines, decreasing | Ground, the common reference |
| A line with an arrow, labelled +12 V | A supply rail |

**Read a schematic in the direction of the signal**, left to right, and in the direction of the
current, top to bottom. That convention is nearly universal, and once you know it a board's function
is visible at a glance.

The two habits that make schematics readable: find the power rails first, and find the ground
symbol. Everything else hangs off those two.

---

## Practice

The [calculators](/tools) all print their working, so you can check both the answer and the method.
Do twenty LED resistor calculations by hand, then check them. Then do twenty power calculations for
loads you can see around you.

The [numbers drill](/practice#drill) has every examinable number in the course, and it schedules
itself. Eight cards a night for a fortnight covers most of it.
