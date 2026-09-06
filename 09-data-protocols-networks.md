# Class 9 — Data, Protocols and Networks

> A protocol is an agreement about what the voltage means. Every fault in this class is two devices
> that never agreed.

## Before you come

### What you must already be able to do

Use a scope: timebase, trigger, coupling, single shot. Terminate a 5-pin XLR and an RJ45. Explain
what impedance matching means and why RF is the exception to bridging.

### Three things to do

1. **Count the data cables in one venue.** Walk a space and write down every kind of data cable you
   can find: DMX, network, MIDI, USB, HDMI, SDI, fibre. You are building a sense of how many
   parallel conversations a modern building is having.
2. **Find a DMX terminator** and photograph it. Then find a DMX line that does not have one, which
   will take about four minutes.
3. **Read your lighting console's patch page** and work out how many universes it outputs and what
   protocol it uses to get them to the rig. If you cannot find out, that question is a good one to
   arrive with.

### What to bring

Meter, scope skills, notebook, and the DMX cable you made in Class 4.

<!--ready:9-->

---

## From voltage to meaning

Everything so far has been about what a voltage *is*. This class is about what a voltage *means*,
which requires an agreement between two devices about timing, levels and structure.

Strip away the names and there are only a few ideas:

- **Serial**: send bits one after another down one path. Slower per wire, far fewer wires, and it
  wins for anything that has to travel.
- **Framing**: mark where a byte begins and ends, so a receiver that joins late can find its place.
- **Differential**: send the signal as the difference between two wires so interference cancels,
  exactly as in balanced audio.
- **Addressing**: give devices identities so one cable can carry instructions for many.
- **Packets**: bundle data with a header saying where it is going, so many conversations share one
  cable.

Every protocol in this class is a specific combination of those five.

---

## Serial, one bit at a time

<!--anim:serial-frame-->

The basic asynchronous serial frame is one start bit, then eight data bits, then one or two stop
bits. There is no clock line: the receiver knows the agreed bit rate and samples in the middle of
each bit, using the start bit's falling edge to synchronise.

That is why both ends must agree on the baud rate, and why a wrong baud rate gives you garbage
rather than nothing. The receiver is sampling at the wrong moments and producing bytes that are
technically valid and completely meaningless.

Being able to look at a serial line on a scope, measure the width of one bit, and calculate the baud
rate from it is a genuinely useful diagnostic skill. One bit of 4 µs is 250,000 baud, which is DMX.

### Differential signalling and RS-485

<!--anim:rs485-diff-->

Single-ended signalling measures the signal against ground, and over any distance the two ends'
grounds are not the same, exactly as in Class 7.

RS-485 sends the signal as the difference between two wires. The receiver looks only at the
difference, so induced interference and ground offset cancel. This is what makes 1200 m runs
possible in an electrically hostile building.

RS-485 is the electrical layer under DMX512, and the two are constantly confused. **RS-485 says what
the voltages are; DMX512 says what the bits mean.** A DMX problem is nearly always an RS-485
problem, and the RS-485 problems are: no termination, wrong cable impedance, too many devices, a
star topology, or a broken screen.

---

## DMX512, in detail

<!--anim:dmx-packet-->

DMX512 is a continuously repeated broadcast of 512 bytes, each 0 to 255, sent at 250 kbit/s over
RS-485. There is no addressing in the protocol at all: every device receives every byte and picks
out the ones starting at the address you set on it.

A packet is:

1. **Break** — the line held low for at least 92 µs. This is the "new packet starts now" marker, and
   it is deliberately longer than any valid byte so it cannot be mistaken for data.
2. **Mark after break** — high for at least 12 µs.
3. **Start code** — one byte, `0x00` for normal dimmer data.
4. **Up to 512 slots** — one byte each, each preceded by a start bit and followed by two stop bits.

Each slot takes 44 µs. A full 512-slot packet plus break is about 22.7 ms, which gives a refresh
rate of about 44 Hz. Send fewer channels and it refreshes faster, which is why some consoles let you
limit the channel count and why a moving light rig can feel more responsive when you do.

**The consequences of "no addressing":**

- Two fixtures set to the same address both respond, identically, forever, and nothing reports an
  error. There is no collision detection because there is no addressing to collide.
- A fixture cannot tell the console anything. DMX is one direction only. Everything you know about
  the state of the rig, you know because you sent it.
- The 513th byte does not exist. A fixture at address 510 needing 8 channels does not fit, and it
  will silently use whatever it can and behave strangely.

### Topology, termination and reflections

<!--anim:dmx-topology-->

DMX is a **daisy chain**, not a star. One cable in, one cable out, device to device, and a
terminator at the far end.

<!--anim:termination-->

The terminator is a 120 Ω resistor across the data pair at the last device. Here is why it matters,
and it is the impedance idea from Class 7 arriving in its RF form.

A cable has a characteristic impedance, 110 Ω for DMX cable, set by its physical construction. A
signal travelling down it that meets an impedance discontinuity — an open end — reflects, and the
reflection travels back and adds to the original. At 250 kbit/s over tens of metres, that reflection
arrives during the following bits and corrupts them.

A resistor matching the cable impedance at the far end absorbs the energy instead of reflecting it.

**What an unterminated line looks like:** it usually works. On a short run, at low channel counts,
with a strong transmitter, the reflection is small enough to survive. Then somebody adds twenty
metres, or the temperature changes, or a fixture is added, and it becomes intermittent flicker on
one fixture in the middle of the run — which is the hardest fault to diagnose, because it appears
nowhere near the actual problem.

This is why "it worked without a terminator" is a statement about luck, and it is on the list of
sentences a technical director should never accept.

The other rules that follow from RS-485: no more than 32 devices per run without a splitter, no more
than about 300 m of cable, never a star split without an active splitter, and **microphone cable is
not DMX cable** — its impedance is nearer 50 Ω and its capacitance is higher, so it is another way
of being lucky rather than correct.

---

## The rest of the protocol landscape

<!--anim:protocol-map-->

| Protocol | Carries | Physical layer | Direction | Where you meet it |
| --- | --- | --- | --- | --- |
| DMX512 | 512 levels, repeated | RS-485, 5-pin XLR | One way | Every lighting rig |
| RDM | Device discovery and config | The same DMX pair | Two way | Setting addresses remotely |
| Art-Net | Many DMX universes | Ethernet, UDP | One way mostly | Console to node |
| sACN (E1.31) | Many DMX universes | Ethernet, UDP multicast | One way | The modern default |
| MIDI | Note and control events | Current loop, 5-pin DIN or USB | One way per cable | Show control, instruments |
| MIDI Show Control | Cue commands between departments | MIDI | One way | Go from sound to lighting |
| OSC | Arbitrary named messages | Ethernet, UDP or TCP | Two way | QLab, tablets, custom systems |
| SMPTE timecode | Position in time | Audio-level signal | One way | Synchronising to media |
| CAN bus | Robust device messaging | Differential pair | Two way | Automation, machinery |

### The two distinctions worth carrying

**State versus event.** DMX sends the complete current state, forty-four times a second, forever. If
a packet is lost, the next one corrects it. MIDI and OSC send events: "note on", "go". If an event
is lost, it is lost, and nothing corrects it.

That single difference decides how each fails. A DMX rig with a marginal cable flickers. A MIDI
show control link with a marginal cable misses a cue, and the show is now in the wrong state until
somebody intervenes. **Event protocols need more reliability than state protocols, not less**, and
people habitually assume the opposite.

**Unicast, broadcast, multicast.** Art-Net commonly broadcasts, which means every device on the
network processes every packet whether it needs it or not. sACN uses multicast, where devices
subscribe to the universes they want and the switch only sends those. On a large rig this is the
difference between a network that works and one that saturates, and it is why sACN has largely won.

<!--anim:packet-network-->

---

## At the bench

Two hours and twenty minutes.

### Block A — Read a serial line (35 min)

Put the scope on a serial line at a known baud rate. Measure one bit's width. Calculate the rate.
Confirm against the setting.

Then have your partner change the rate without telling you, and identify the new rate from the
scope. Then decode one byte by hand from the trace: find the start bit, read the eight data bits
least significant first, and convert to a character.

Slow, and worth doing exactly once, because after it you will never be confused about what serial
data physically is.

### Block B — Anatomy of a DMX packet (35 min)

Scope on a live DMX line. Find the break and measure it. Measure the mark after break. Measure one
slot. Measure the whole packet and calculate the refresh rate.

Then change the console's channel count from 512 to 64 and measure the refresh rate again. Write
down both numbers and the ratio.

### Block C — Termination, proved (35 min)

A 100 m DMX run with a fixture at the far end and one in the middle.

Scope at the far end, terminated: clean. Remove the terminator: photograph the reflection. Measure
the amplitude of the ringing and the time between the edge and the reflection, then calculate the
cable length from that time and the propagation velocity. It will be close to 100 m, and that
calculation is how a real cable fault locator works.

Then substitute microphone cable for the DMX cable and repeat. Note that it may still work, and
write one sentence about what that proves and what it does not.

### Block D — Address collisions and off-by-one (35 min)

Patch six fixtures. Introduce, one at a time: two fixtures on the same address, a fixture one
channel off, a fixture whose footprint runs past 512, and a fixture on the wrong universe.

For each, write down the symptom as a stage manager would describe it, then the actual cause. That
translation, from "the upstage left one is doing something weird" to "an address collision", is the
skill.

---

## Common misconceptions

- **"DMX is a network."** It is a one-way repeated broadcast with no addressing, no error checking
  and no return path. Nothing on a DMX line can tell you anything, including whether it is there.
  Everything you believe about the rig's state, you believe because you sent it.
- **"A terminator is optional if it works without one."** Without one the reflection is present and
  is merely small enough to survive today. Add cable, add a fixture, change the temperature, and it
  becomes intermittent flicker somewhere unrelated to the actual cause.
- **"Microphone cable works fine for DMX."** Its impedance is around 50 Ω against DMX's 110 Ω, and
  its capacitance is higher. Over short runs the errors do not accumulate enough to see. It is the
  same category of statement as an unterminated line, and it fails in the same way: later, and
  somewhere else.
- **"RS-485 and DMX512 are the same thing."** RS-485 defines the voltages and the wiring. DMX512
  defines what the bits mean. You can run many protocols over RS-485, and DMX's problems are
  usually RS-485 problems, which is why knowing the distinction speeds up diagnosis.
- **"More channels means a slower rig."** More channels means a lower refresh rate on that universe:
  512 channels at about 44 Hz, and proportionally faster with fewer. That is a real effect on fast
  moving-light chases, and it is why some consoles offer a channel limit.
- **"Art-Net and sACN are two names for the same thing."** They are different protocols. The
  difference that matters operationally is broadcast against multicast: on a large rig, one of them
  makes every device process every universe and the other does not.

---

## Numbers from this class

| Quantity | Value |
| --- | --- |
| DMX512 bit rate | 250 kbit/s |
| DMX bit duration | 4 µs |
| DMX slot duration, with framing | 44 µs |
| DMX break, minimum | 92 µs |
| Mark after break, minimum | 12 µs |
| DMX start code, normal data | `0x00` |
| Slots in one universe | 512 |
| Full universe packet time | about 22.7 ms |
| Full universe refresh rate | about 44 Hz |
| DMX cable impedance | 110 Ω |
| DMX terminator | 120 Ω across the data pair |
| Maximum devices per DMX run | 32 |
| Maximum DMX run length | about 300 m |
| DMX connector | 5-pin XLR |
| MIDI bit rate | 31.25 kbit/s |
| sACN transport | UDP multicast |
| Art-Net transport | UDP, commonly broadcast |
| Signal velocity in copper cable | about two thirds the speed of light |
