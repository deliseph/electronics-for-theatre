# Class 7 — Analogue Signal, Impedance and Grounding

> Two boxes that each work perfectly will hum when you connect them. The hum is not a fault in
> either box. It is a fault in the space between them, and that space is what this class is about.

## Before you come

### What you must already be able to do

Ohm's law, fluently. RC time constants. Series and parallel. What a capacitor does to AC and to DC.
Why the return path matters, from Class 1.

### Three things to do

1. **Make something hum.** Connect a laptop's headphone output to a powered speaker, with the laptop
   on its charger. Then unplug the charger. If you hear a difference, you have just reproduced the
   most common fault in the industry, and you should come able to describe what you heard.
2. **Find the ground lift switch** on a DI box or an audio interface. Photograph it. Read what the
   manual says it does, which will be vague, and come with a question about it.
3. **Write down what "impedance" means to you now**, in one sentence, before the class. Keep it.
   At the end, write it again. The two sentences will differ and the difference is the class.

### What to bring

Meter, notebook, your XLR cable from Class 4, and headphones you trust.

<!--ready:7-->

---

## Run of the session

Four hours, accounted for. Blocks are an order of work rather than a timetable: a class that runs
long on the bench is a class that is going well. The minutes are here so that you know what you are
trading against when it does.

| Min | Block | What happens |
| --- | --- | --- |
| 10 | Open | Numbers quiz, and what you heard when you unplugged the charger |
| 45 | The idea | The level ladder, decibels without the mysticism, and impedance bridging rather than matching |
| 15 | Break |  |
| 30 | The idea | Balanced lines, where the cancellation happens, and the ground loop as a circuit |
| 30 | Bench A | Build the ladder: measure four real levels in millivolts and in dBu |
| 40 | Bench B | Make a ground loop, then kill it five ways and measure each |
| 35 | Bench C | Impedance, demonstrated, including the matched point |
| 25 | Bench D | Common-mode rejection, measured, balanced and then unbalanced |
| 10 | Close | Your ranked, measured list of what actually works |

---

## Levels: the ladder everything sits on

Audio in a theatre exists at four wildly different levels, and most connection problems are a level
mismatch that somebody solved with a volume knob instead of the right box.

<!--anim:level-ladder-->

| Level | Typical voltage | Where | Impedance |
| --- | --- | --- | --- |
| Microphone | 1–50 mV | Mic to preamp | Source 150–600 Ω, load 1.5–3 kΩ |
| Instrument | 100 mV–1 V | Guitar to DI | Source very high, needs 1 MΩ load |
| Line, consumer | about 316 mV (−10 dBV) | Laptop, playback devices | Source under 1 kΩ, load 10 kΩ+ |
| Line, professional | about 1.23 V (+4 dBu) | Console to amplifier | Source under 100 Ω, load 10 kΩ+ |
| Loudspeaker | 10–100 V | Amplifier to speaker | Source near 0 Ω, load 4–16 Ω |

The gap between a microphone and a line output is a factor of a thousand or more. That is why a
microphone plugged into a line input is inaudible, and why a line output into a microphone input
distorts horribly. Both are the same mistake in opposite directions, and both are extremely
common.

### Decibels, without the mysticism

A decibel is a ratio on a logarithmic scale, and that is all. It exists because hearing is
logarithmic and because multiplying gains becomes adding numbers.

- **dBu** is referenced to 0.775 V. Professional line level is +4 dBu, about 1.23 V.
- **dBV** is referenced to 1 V. Consumer line level is −10 dBV, about 0.316 V.
- **dB SPL** is referenced to the threshold of hearing, and is what a sound level meter reads.

Two numbers worth having permanently: **6 dB is a factor of two in voltage**, and **20 dB is a
factor of ten**. With those you can do most level arithmetic in your head, and the
[decibel tool](/tools#tool-db) shows the working for the rest.

The trap: the difference between +4 dBu and −10 dBV is often called "12 dB", and it is actually
about 11.8 dB, and the reference points are different units. When somebody says a device is
"switchable between pro and consumer level", that is the switch they mean.

---

## Impedance, and the myth of matching

Impedance is opposition to alternating current. It is like resistance, but frequency dependent,
because capacitance and inductance are involved.

<!--anim:impedance-bridge-->

Here is the thing almost everybody gets wrong, and it is worth stating flatly:

> **In modern audio you do not match impedances. You bridge them.**

Impedance *matching* — making source and load equal — maximises power transfer, and it costs you
half the voltage and doubles the distortion. It was necessary in the era of long telephone lines
and transformers, and it survives as folklore.

Impedance *bridging* means making the load impedance much higher than the source, usually at least
ten times. This maximises voltage transfer, which is what you actually want, because information in
audio is carried by voltage.

So: a 100 Ω console output drives a 10 kΩ amplifier input. A 200 Ω microphone drives a 2 kΩ preamp
input. Ratios of roughly ten to one, everywhere.

**The exceptions matter.** Loudspeakers genuinely are matched to amplifiers, because there you
really do want power transfer. And radio frequency work, which includes the DMX and network cables
in Class 9, genuinely does require matched terminations, because at those frequencies an unmatched
end reflects the signal back down the cable.

### Where impedance bites you

- **A guitar into a line input.** Pickup source impedance is tens of kilohms and frequency
  dependent. A 10 kΩ line input loads it and the sound goes thin and dull. A DI box exists to
  present a 1 MΩ load and hand on a low-impedance balanced signal.
- **Splitting one output to many inputs.** Each input you add lowers the total load. Four 10 kΩ
  inputs in parallel is 2.5 kΩ, which is still fine from a 100 Ω source. Forty of them is 250 Ω,
  which is not.
- **Long cable runs.** Cable capacitance, roughly 100 pF per metre, forms a low-pass filter with the
  source impedance. From a 100 Ω source that filter is far above audio. From a 50 kΩ source over
  20 m, you have lost the top end, and that is the technical explanation for why long unbalanced
  instrument cables sound dull.

<!--anim:cable-capacitance-->

---

## Balanced lines: the best idea in audio

<!--anim:balanced-->

An unbalanced connection has one signal conductor and a screen that does double duty as the return
path *and* the shield. Any interference the cable picks up, and any voltage difference between the
two boxes' grounds, adds directly to the signal.

A balanced connection sends the signal on two conductors as a difference: hot carries the signal,
cold carries its inverse, and the screen carries no signal at all. At the far end, a differential
receiver subtracts the two.

Now consider interference. It arrives on both conductors nearly equally, because they run together
and are twisted. The receiver subtracts, the signal doubles, and the interference cancels.

**That is the whole trick, and it is why every professional audio interconnect is balanced.** The
measure of how well it works is common-mode rejection ratio, typically 60 to 90 dB, which is a
factor of a thousand to thirty thousand.

Two consequences worth internalising:

**Balanced is about the receiver, not the cable.** A balanced cable into an unbalanced input gets
you almost nothing. The cancellation happens in the differential receiver.

**The screen is not the return path.** In a balanced line the screen only shields. This is precisely
what allows you to disconnect it at one end to break a ground loop without losing the audio, which
is the next section and the reason it works.

---

## Ground loops, and where the hum comes from

<!--anim:ground-loop-->

Here is the mechanism, and once you have it you can diagnose hum by reasoning instead of by
swapping cables.

Two pieces of equipment are each connected to mains, and each has its chassis bonded to protective
earth. Those two earth connections meet somewhere back at the distribution board, possibly a long
way away. Because real conductors have resistance, and because other equipment is drawing current
through those same conductors, **the two chassis are not at exactly the same potential.** A few
millivolts, at 50 Hz and its harmonics.

Now you connect the two boxes with a signal cable whose screen joins the two chassis. You have made
a loop: chassis A, screen, chassis B, earth conductor, back to A. A small voltage around a low
resistance loop drives a current, and that current flowing through the screen's resistance appears
as a voltage in series with your signal.

Fifty hertz hum. Or sixty. Plus harmonics, which is why it is a buzz rather than a pure tone, and
why dimmers make it much worse: a phase-controlled dimmer chops the waveform and generates
harmonics far up the audio band.

<!--anim:hum-spectrum-->

### The five fixes, in order of correctness

1. **Balanced interconnects everywhere.** The loop current still flows in the screen but it is not
   in the signal path, so it does not appear at the output. This is the real fix and everything else
   is a workaround.
2. **Lift the screen at one end.** For a balanced cable, disconnecting the screen at the receiving
   end breaks the loop while keeping the shielding. This is what a ground lift switch does. Label
   any cable you make this way, or somebody will use it as a normal cable and wonder why it is
   noisy in a different application.
3. **A transformer, or a DI box with a lift.** Galvanic isolation with no electrical path at all.
   The most reliable fix for a stubborn problem, and it costs some bandwidth and some money.
4. **Power everything from one point.** If both boxes are fed from the same distribution, the
   potential difference between their earths is small. This is why an audio system is fed from one
   source and why "the sound rack and the lighting rack on the same phase" is a real conversation.
5. **Reroute the cable away from the mains run.** This addresses induced interference rather than
   the loop, but they usually arrive together.

And the one that is not on the list:

> **Never disconnect the protective earth from a mains plug to cure hum.**

It works. It is also how people die, and it is the single most dangerous thing done routinely in
this industry. If you see a lifted earth pin or a cheater plug on a production, that is a stop-work
conversation, not a note for later.

---

## Gain structure

Levels are not just a table to look up. Where you add the gain, along a chain of several devices,
decides how much noise and how much headroom the finished signal has.

<!--anim:gain-structure-->

Every stage adds its own noise and has a ceiling above which it clips. The rule that falls out of
those two facts:

> **Get the signal up to a healthy level as early as possible, then leave it alone.**

Amplify at the first stage, where the noise you are amplifying is only the source's own. Amplify at
the last stage and you amplify every hiss every earlier stage added, along with the signal.

The two failure modes, which sound completely different:

**Gain too low early, made up later.** The signal spends the chain close to the noise floor, and
the final amplifier lifts noise and signal together. It sounds hissy, and turning anything down
makes it worse.

**Gain too high early.** An early stage clips. Every later stage faithfully reproduces the
distortion, and no amount of turning down afterwards removes it, because the information is gone.

Headroom is the gap between where you are running and where the stage clips: aim for around 20 dB,
which feels wasteful and is what survives an actor shouting a line they have delivered quietly for
three weeks.

---

## Phantom power

A condenser microphone needs power, and running a second cable to every microphone is unacceptable,
so the power goes down the same balanced pair as the signal.

<!--anim:phantom-->

48 volts is applied through a matched pair of 6.8 kΩ resistors, to pin 2 and pin 3 equally, with
pin 1 as the return. The microphone takes its supply from the difference between those pins and
earth, and because both signal conductors sit at the same DC potential, a differential receiver
subtracts it away and sees nothing. **It is common mode, which is exactly why it is invisible to
the audio.**

What you actually need to know:

- **Dynamic microphones do not need it and are not harmed by it**, provided the cable is correctly
  wired. A balanced dynamic sees 48 V on both legs equally and does nothing about it.
- **A miswired cable turns it dangerous.** If pin 2 or pin 3 shorts to pin 1 while phantom is on,
  current flows through the microphone in a way it was not designed for. This is the practical
  reason for the pin-to-pin isolation test from Class 2.
- **Never plug or unplug with phantom on.** The pins make in an unpredictable order and the
  resulting transient goes straight into a preamp at high gain. It is loud enough to damage a
  loudspeaker and the people in front of it.
- **Ribbon microphones can be destroyed by it**, particularly older ones and particularly through a
  miswired cable. If you do not know what is on the end of a line, phantom stays off.
- **It is not the same as T-power or plug-in power.** Those are different voltages on different
  pins, and connecting one to the other is a repair bill.

---

## At the bench

Two hours and ten minutes.

### Block A — Build the ladder (30 min)

Measure the actual output voltage of: a dynamic microphone speaking normally, a phone headphone
output at full volume, a console line output at 0 dB, and a small amplifier driving a speaker.

Write all four in millivolts and in dBu. Then calculate the ratio between the largest and the
smallest. That number is why input stages have gain switches.

### Block B — Make a ground loop, then kill it (40 min)

Two mains-powered devices, deliberately fed from sockets on different circuits, connected
unbalanced. Get the hum. Measure the AC voltage between the two chassis with everything
disconnected. Record it in millivolts.

Then apply the fixes one at a time and measure the hum at the output after each: same power source,
balanced interconnect, screen lifted at one end, transformer isolation. Record the improvement in
dB for each.

You now have a ranked, measured list of what actually works, made by you, which is worth
considerably more than the list in this document.

### Block C — Impedance, demonstrated (35 min)

Drive a 10 kΩ load from a signal generator through a 100 Ω series resistor. Measure the voltage.
Now change the load to 1 kΩ, then 100 Ω, then 10 Ω. Plot voltage against load impedance.

Find the point where the load equals the source, and confirm you have lost exactly half the
voltage. That is impedance matching, and the plot is the argument against it.

Then repeat with 20 m of unbalanced cable and a high source impedance, and measure the frequency
response at 100 Hz, 1 kHz and 10 kHz. The top end will be down, and you can calculate by how much
from the cable capacitance.

### Block D — Common-mode rejection, measured (25 min)

Inject a common-mode signal onto a balanced line, deliberately, and measure what comes out of the
differential receiver. Calculate the CMRR in dB.

Then disconnect one leg of the balanced pair, so the line is effectively unbalanced, and repeat.
The difference between those two numbers is why the industry standardised on XLR.

---

## Common misconceptions

- **"Impedances should be matched."** They are bridged, at about ten to one, so that voltage is
  transferred rather than power. Matching costs half the signal voltage. The exceptions are
  loudspeakers, and transmission lines at radio frequencies, which includes DMX and network cabling.
- **"A balanced cable rejects noise."** The *receiver* rejects noise, by subtracting two conductors.
  A balanced cable into an unbalanced input gets you almost none of the benefit, which is why a
  correctly made cable can still hum on the wrong input.
- **"Hum means a bad cable."** Hum usually means a loop between two correctly working boxes. The
  cable is the visible part of a circuit that also runs through both chassis and the building's
  earthing. Swapping cables sometimes changes it, which is what makes people believe the cable was
  the cause.
- **"Lifting the earth pin fixes hum."** It does, and it removes the fault path that is supposed to
  keep a person alive when a live conductor touches a chassis. Lifting the *screen* at one end of a
  balanced signal cable achieves the same result and is safe. The two are not variations of one
  technique, they are opposites.
- **"The screen carries the signal return."** In an unbalanced cable it does, which is the whole
  problem. In a balanced cable it carries no signal, and that is what makes the screen safe to lift
  at one end.
- **"Longer cables sound worse."** Longer *unbalanced* cables from a high-impedance source sound
  worse, and you can calculate the roll-off from the cable capacitance and the source impedance. A
  balanced line from a 100 Ω source is unaffected over any distance you will meet in a theatre.

---

## Numbers from this class

| Quantity | Value |
| --- | --- |
| Microphone level | 1–50 mV |
| Consumer line level | −10 dBV, about 0.316 V |
| Professional line level | +4 dBu, about 1.23 V |
| dBu reference | 0.775 V |
| dBV reference | 1 V |
| Voltage ratio for 6 dB | 2 |
| Voltage ratio for 20 dB | 10 |
| Impedance bridging ratio | load at least 10 × source |
| Microphone source impedance | 150–600 Ω |
| Microphone preamp input impedance | 1.5–3 kΩ |
| Line input impedance | 10 kΩ or more |
| DI box instrument input impedance | about 1 MΩ |
| Typical audio cable capacitance | about 100 pF per metre |
| Good balanced input CMRR | 60–90 dB |
| Mains hum fundamental | 50 Hz, or 60 Hz |
| Chassis-to-chassis potential in a loop | a few mV to a few hundred mV |
| XLR screen lift | disconnect pin 1 at the receiving end |
