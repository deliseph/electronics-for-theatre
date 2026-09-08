# Class 15 — Safety Systems and Fault-Finding

> A safety system is not a feature you add. It is a set of things that must be true even when
> everything else has failed, including the part that was supposed to notice.

## Before you come

### What you must already be able to do

Normally closed wiring and why it exists. What earth is for. Series and parallel. Everything about
loads, switching and isolation from Class 5. The half-split method from Class 8.

### Three things to do

1. **Find every emergency stop in one venue** and photograph each one. Then work out, or ask, what
   each one actually stops. The answers will surprise you: some stop less than people believe, and
   that gap is the most important thing you will learn this week.
2. **Read the [safety card](/safety)** properly this time, all of it. Third reading.
3. **Write down one near miss** you have witnessed or heard about. What was the last point at which
   it could have been prevented? That question is the whole of safety engineering.

### What to bring

Meter, notebook. This class has a demonstration on real mains, which you will watch.

<!--ready:15-->

---

## Run of the session

Four hours, accounted for. Blocks are an order of work rather than a timetable: a class that runs
long on the bench is a class that is going well. The minutes are here so that you know what you are
trading against when it does.

| Min | Block | What happens |
| --- | --- | --- |
| 10 | Open | Numbers quiz, and what each emergency stop you photographed actually stops |
| 45 | The idea | What electricity does to a person, and which device is protecting whom |
| 15 | Break |  |
| 40 | The idea | Emergency stop done properly, interlocks, isolation and lock-off, then the method |
| 25 | Bench A | Watch: proving dead on mains, then write the procedure from memory |
| 20 | Bench B | Dissect an RCD: a 30 mA earth fault, then an overload it ignores |
| 40 | Bench C | Build a dual channel E-stop, then weld a channel closed and watch |
| 35 | Bench D | Fault-finding under time pressure: three systems, ten minutes each |
| 10 | Close | The one thing you now know you do badly under pressure |

---

## What electricity does to a person

<!--anim:shock-path-->

The damage is done by **current through the body**, and the path matters more than the total. Hand to
hand, or hand to foot, crosses the chest. Hand to elbow on the same arm does not, which is why the
one-hand rule exists.

| Current, 50 Hz AC | Effect |
| --- | --- |
| 0.5–2 mA | Perception threshold, a tingle |
| 5 mA | Painful |
| 10–20 mA | Muscular contraction; you cannot let go |
| 30 mA | Breathing difficulty; the RCD threshold |
| 50–100 mA | Likely ventricular fibrillation |
| Above 1 A | Burns, cardiac arrest, tissue damage |

The let-go threshold is the number to hold on to. Above roughly 10 mA, the muscles that close the
hand overpower those that open it, so the grip tightens on the conductor. **The victim cannot
release**, which is why bystanders must switch off rather than pull, and why an incident at 20 mA
can be worse than a brief one at 200.

### Why voltage matters at all

Ohm's law: your body's resistance decides how much current a given voltage pushes. Hand to hand, dry
skin: 10 kΩ to 100 kΩ. Damp, sweating, or with broken skin: 1 kΩ or lower.

At 230 V through 100 kΩ, that is 2.3 mA. Unpleasant. At 230 V through 1 kΩ, it is 230 mA, and that
is fatal.

**Nothing about the supply changed. The person did.** This is why the same circuit is survivable in
a dry workshop and lethal on a wet stage, why the rules tighten outdoors and near water, and why
"I have touched that before and it was fine" is worthless as evidence.

You measured your own body resistance in Class 2, dry and damp. Look at the two numbers again now.

---

## The protective devices, and what each one actually protects

<!--anim:protection-devices-->

This is the section people get wrong most often, and the error is always the same: assuming the
device protecting the cable is also protecting the person.

| Device | Protects | Trips on | Does not protect against |
| --- | --- | --- | --- |
| Fuse | The cable | Excess current, slowly | A person; 13 A is 400 times a lethal current |
| MCB (circuit breaker) | The cable | Excess current, faster | A person, for the same reason |
| RCD / GFCI | The person | Current going somewhere it should not | Overload; it does not care how much is flowing |
| Isolating transformer | The person | Nothing; it removes the reference to earth | Contact across both output conductors |
| Double insulation | The person | Nothing; it removes the exposed metal | Damage to the insulation |

**A fuse does not protect you.** A 13 A fuse allows 13 amps to flow indefinitely. A lethal current is
about 50 milliamps. The fuse is protecting the cable from catching fire, which is a real and
different job.

### How an RCD works

<!--anim:rcd-->

An RCD compares the current flowing out in the live conductor with the current returning in the
neutral. In a healthy circuit they are identical.

If some current is returning by another route — through a person, through damp insulation, through
a damaged earth — the two no longer balance. The RCD detects the difference and opens the circuit,
typically in under 30 milliseconds, at a difference of 30 milliamps.

Thirty milliamps and thirty milliseconds are chosen deliberately: below the level and above the
speed that would cause fibrillation in most people. It is not a guarantee of survival. It is a
substantial reduction in the probability of death, and it is why an RCD is mandatory on temporary
supplies and outdoor events.

**Test it.** The test button proves the mechanism, and it should be pressed at intervals, and the
RCD on a touring rig should be tested with a proper tester rather than the button, because the button
only tests the trip mechanism and not the trip current or time.

---

## Emergency stop, done properly

<!--anim:estop-dual-->

An emergency stop is not a switch that turns something off. It is a system with specific properties,
and a technical director is expected to be able to look at one and say whether it has them.

**1. It is normally closed.** The circuit is complete when everything is safe, and pressing the
button breaks it. A cut cable, a corroded contact or a pulled connector therefore causes a stop.
This is the Class 13 principle, and it is non-negotiable here.

**2. It is latching.** Pressing it stays pressed until deliberately released by twisting or pulling.
An emergency stop that springs back is not an emergency stop.

**3. Releasing it does not restart anything.** After a reset, a separate deliberate action is
required to start. A machine that restarts when the button is released will injure the person who
released it, and this has happened often enough that it is written into every standard.

**4. It removes power at the source.** Not a request to the control software, which may have hung.
The stop should drop a contactor, so the machine is de-energised by the absence of a signal rather
than by the presence of one.

**5. It is dual channel and monitored, for anything serious.** Two independent contacts in two
independent circuits, both broken by the same button, and a safety relay that watches for
disagreement between them. If one channel fails closed, the relay sees the two channels disagree
and refuses to allow a reset.

<!--anim:interlock-->

That fifth property is what separates a safety system from a switch. A single contact can weld
closed and nobody would know until the day it was needed. Two channels with monitoring turn an
undetectable failure into a machine that will not start, and a machine that will not start is a
maintenance problem rather than an incident.

### Interlocks

An interlock stops something dangerous while a guard is open, a person is in a zone, or a condition
is not met. Same principles: normally closed, monitored, defeat-resistant.

The one to watch for in this industry is the **defeated interlock**. A magnet taped near a reed
switch, a cable tie holding a limit switch closed, a jumper across a terminal. It is always done
under time pressure with good intentions, and it always removes exactly the protection somebody
designed in.

Finding a defeated interlock is a stop-work event. Not a note, not a mention at the production
meeting. Stop.

---

### The topology, in a browser

<!--circuit:interlock-->

Halt the microcontroller and confirm the chain still works. Then put the microcontroller *in* the
chain and say, precisely and out loud, what you have just given away.

**Read what that card says the simulation hides before you take any of this as a design.** Contact
ratings, forced-guided contacts, dual-channel monitoring, category ratings and a signed risk
assessment are the difference between this picture and an interlock, and none of them are here.

## Isolation and lock-off

<!--anim:lockout-->

Before working on anything, prove it is dead and make it impossible for somebody else to make it
live. The sequence:

1. **Identify** the correct isolation point. The correct one, verified, not the one that is
   probably right.
2. **Isolate.** Switch off and, where possible, physically disconnect.
3. **Lock** the isolator with your own lock, and keep the key on you. Not in a drawer. On you.
4. **Tag** it: who, when, why, and how to reach you.
5. **Prove dead** at the point of work, with the live-dead-live procedure from Class 2.
6. **Discharge** any capacitors, and prove that too.

The lock is the part that gets skipped and the part that matters. "I told him I was working on it"
has killed people, because the person who was told went home and somebody else found a circuit
switched off for no apparent reason.

**One lock per person.** If three people are working, three locks, and the isolation cannot be
restored until all three have removed theirs.

---

## Fault-finding as a method

The rest of this class is the method, because a technical director's diagnostic value comes from
process rather than from memory.

<!--anim:fault-tree-->

### The six steps

**1. Do not touch anything yet.** The state of a failed system is evidence. What is lit, what is
warm, what smells, what was the last thing that changed. Somebody who starts unplugging destroys
the evidence in the first thirty seconds.

**2. Establish the boundary.** What works and what does not, and where the line is. The fault is on
that line. This single question eliminates most of the system in one pass.

**3. Half-split.** Test at the midpoint of the affected section. Sixteen possible points is four
tests, not sixteen. Under pressure, methodical beats clever, every time.

**4. One change at a time, written down.** Reverse anything that did not help. A system where four
things changed and the fault cleared is a system that will fail again for reasons nobody knows.

**5. Prove the fix.** Reintroduce the fault and confirm the symptom returns. If you cannot make it
come back, you have not found the cause.

**6. Write it up.** Symptom, tests, cause, fix, and what would prevent a recurrence. Fifteen
minutes, and it is what stops the same fault costing the same hours next year.

### The things that make people slow

- **Believing the first plausible story.** The first idea is a hypothesis, not a conclusion, and it
  should generate a test rather than a repair.
- **Changing several things at once.** Fast when it works, and it never teaches you anything, and it
  works less often than people remember.
- **Trusting a report instead of observing.** "It just stopped" almost never means that. Ask what
  changed, then look for yourself.
- **Skipping the boundary question** and going straight to the component somebody suspects.
- **Not writing anything down**, so that after twenty minutes you cannot remember whether you already
  tested the second run.

### When to stop and escalate

Three conditions, and recognising them is a professional skill rather than an admission:

- Anything involving mains, if you are not qualified for the work.
- Anything where the fault is a safety system. A safety system that has failed is not repaired under
  time pressure, and it is never bypassed to get through a performance.
- Anything where you have been going more than about thirty minutes with no boundary established.
  At that point another pair of eyes is faster than another twenty minutes of yours.

---

## Risk assessment, which is a document and a habit

Every rule on the safety card came from somebody doing this badly once. The formal version is a
document; the useful version is a habit you run in your head before you touch anything.

<!--anim:risk-matrix-->

Five steps, and they are the same five whether the output is a form or a decision made in ten
seconds:

1. **Identify the hazard.** The thing with the potential to harm: stored energy, a moving mass, a
   live conductor, a person working alone.
2. **Decide who might be harmed, and how.** Not just you. Performers, audience, the cleaner at
   06:00 who does not know the trap is unlocked.
3. **Evaluate: how likely, and how bad.** Likelihood times severity is the usual grid, and its
   purpose is not the number, it is forcing the two questions to be asked separately.
4. **Control, in order of effectiveness.** This order is not a preference, it is the hierarchy every
   standard uses.
5. **Record it, and review it when anything changes.** A risk assessment written for the get-in and
   never looked at again is paperwork; one that is revisited when the design changes is engineering.

### The hierarchy of control

| | Control | Example on a production |
| --- | --- | --- |
| 1 | **Eliminate** the hazard | Do it with a projection instead of a moving truck |
| 2 | **Substitute** something safer | Extra-low voltage practical instead of mains |
| 3 | **Engineering controls** | Guards, interlocks, an isolating transformer, an RCD |
| 4 | **Administrative controls** | Procedures, training, signage, a permit to work |
| 5 | **PPE** | Gloves, glasses, arc-rated clothing |

**PPE is last for a reason.** It protects one person, only if worn, only if correct, and only if it
has not been damaged. Everything above it protects everybody in the room whether or not they were
paying attention. A production that reaches for PPE before it has considered the four above it has
skipped the effective options.

---

## PPE, arc flash, and working near live equipment

<!--anim:ppe-arc-->

The shock hazard is the one everybody thinks about. The other one is **arc flash**: a short circuit
in a distribution board releases its energy as an explosion of plasma, molten metal and pressure,
in a few milliseconds. The temperature at the arc is several times the surface of the sun, and the
injury is thermal rather than electrical.

It is a hazard of **energy available at the fault**, not of voltage. A 400 A distribution panel is
far more dangerous in this respect than a 230 V socket, which is why the rules tighten as you move
upstream toward the incoming supply.

What this means for you, on the productions you will actually run:

- **The controls are the same four you already know.** De-energise, lock off, prove dead, and do not
  work live. Nearly all arc flash incidents happen during live work that did not need to be live.
- **If work must be live**, that is a specialist with a permit, arc-rated clothing, a face shield
  and insulated tools. It is not you, and "the show is in an hour" does not change that.
- **Ordinary PPE still earns its place.** Safety glasses when cutting, drilling or soldering.
  Gloves when handling sharp-edged chassis. Hearing protection near a genny. Nothing exotic, and
  people still skip all three.
- **No jewellery, watch or lanyard near a panel.** A metal bracelet across two busbars is both a
  short circuit and a bracelet that cannot be removed.

---

## At the bench

Two hours.

### Block A — Watch: proving dead on mains (25 min)

The technician performs the full sequence on a real circuit: identify, isolate, lock, tag, prove
dead with live-dead-live, discharge.

You watch, take notes, and then write the procedure out from memory. Two people are then asked to
read theirs aloud, and the class corrects them.

### Block B — Dissect an RCD (20 min)

A sectioned RCD and a demonstration rig. Watch the trip on an earth fault of 30 mA. Measure the trip
time with the tester. Then create an overload with no imbalance and watch the RCD do nothing at all,
because it is not an overload device.

Write down the two currents and the two outcomes. That contrast is the most examinable idea in the
class.

### Block C — Build a dual channel E-stop (40 min)

On the safety relay trainer: two channels, a safety relay, a contactor, a lamp as the machine.

Prove all five properties. Then introduce faults: weld one channel closed, cut one channel, cut
both, and try to reset with the button still latched. Record what the relay does in each case.

The interesting result is the welded channel: the machine will not start, and nothing appears to be
broken. Sit with that for a moment, because that is exactly what a monitored safety system is for.

### Block D — Fault-finding under time pressure (35 min)

Three faulted systems, ten minutes each, working in pairs. One electrical, one data, one control
logic.

You are marked on the log, not the time. A pair who established the boundary, half-split correctly
and ran out of time has done better work than a pair who found it by luck, because only one of those
methods works on a fault nobody has seen before.

---

## Common misconceptions

- **"The fuse will protect me."** A 13 A fuse permits about four hundred times a lethal current
  indefinitely. Fuses and breakers protect cables from fire. Only an RCD, isolation or double
  insulation protects a person, and they do it by completely different mechanisms.
- **"An RCD makes the circuit safe."** It reduces the severity of an earth fault. It does nothing if
  you contact live and neutral together, because the currents still balance, and it does nothing
  about overload. It is one layer among several.
- **"An emergency stop is a big red off switch."** It must be normally closed, latching,
  non-restarting on release, act on the power source rather than on software, and for anything
  serious be dual channel and monitored. A switch with none of those is a switch painted red.
- **"Telling somebody you are working on it is enough."** People go home, shifts change, and a
  circuit switched off for no visible reason gets switched back on. One lock per person, key on the
  person, and the system cannot be restored until every lock is removed.
- **"The interlock was slowing us down and we put it back afterwards."** A defeated interlock is a
  stop-work event, every time, without exception. It was designed in by somebody who identified a
  hazard, and defeating it is a decision to accept that hazard on behalf of everybody in the room.
- **"Experienced people find faults by intuition."** Experienced people establish the boundary and
  half-split, quickly, and their pattern library makes the first hypothesis better. The method is
  the same; only the speed differs. What looks like intuition is a well-chosen first test.

---

## Numbers from this class

| Quantity | Value |
| --- | --- |
| Perception threshold, 50 Hz AC | 0.5–2 mA |
| Let-go threshold | about 10 mA |
| RCD trip threshold, personal protection | 30 mA |
| RCD trip time | under 30 ms |
| Current likely to cause fibrillation | 50–100 mA |
| Body resistance, dry skin, hand to hand | 10 kΩ – 100 kΩ |
| Body resistance, damp or broken skin | 1 kΩ or less |
| Current at 230 V through 1 kΩ | 230 mA |
| Safe touch voltage, AC | below 50 V RMS |
| Safe touch voltage, DC | below 120 V |
| Typical plug fuse | 13 A, protecting the cable |
| Emergency stop wiring | normally closed, latching, dual channel, monitored |
| Locks required for isolation | one per person working |
| Proving procedure | live, dead, live |
| Half-split tests for 16 points | 4 |
| Escalate after | 30 minutes with no boundary established |
