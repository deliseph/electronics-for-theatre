# Class 10 — Build and Break a Rig

> Anybody can build a rig that works. Today you build one, then break it fourteen times, and learn
> what each failure looks like from the far end of an auditorium.

## Before you come

### What you must already be able to do

Everything from Class 9: the DMX packet, termination, topology, the difference between state and
event protocols. Terminate a 5-pin XLR and an RJ45. Use a scope with a trigger.

### Three things to do

1. **Draw a rig from memory.** Any rig you have worked on. Console, splitter, runs, fixtures,
   addresses. It will be wrong and incomplete, and finding out where is the point.
2. **Write down five DMX symptoms you have seen** and what somebody told you the cause was. We will
   check those attributions today, and several will turn out to be folklore.
3. **Learn to draw a rig properly.** Look at one real lighting plan and one real signal flow
   diagram, and notice what a signal diagram includes that a lighting plan does not.

### What to bring

Meter, notebook, your DMX cable, and patience. This class is deliberately frustrating for about
forty minutes in the middle.

<!--ready:10-->

---

## Run of the session

Four hours, accounted for. Blocks are an order of work rather than a timetable: a class that runs
long on the bench is a class that is going well. The minutes are here so that you know what you are
trading against when it does.

| Min | Block | What happens |
| --- | --- | --- |
| 10 | Open | What a library of symptoms is for, and how the next three hours run |
| 60 | Bench A | Build the rig, label everything, and produce the signal flow drawing |
| 25 | Bench B | Prove it, and photograph the clean trace at the end of each run |
| 15 | Break |  |
| 100 | Bench C | Fourteen faults, rotating, about seven minutes each, all logged |
| 15 | Bench D | Write the report: the three that took longest, and what would have found each faster |
| 15 | Close | The three faults that teach the most, and why |

---

## Why breaking things is the lesson

You will spend your career diagnosing systems you did not build, under time pressure, with somebody
standing next to you asking when it will be fixed.

The only way to be good at that is to have a **library of symptoms**. Not knowledge of how DMX
works — you have that from Class 9 — but a memory of what each specific failure actually looks
like from the auditorium.

Today builds that library deliberately, in four hours, instead of accidentally over five years.

<!--anim:fault-library-->

---

## The rig you are building

Per team of four:

- A console or a laptop with a DMX output
- An isolated DMX splitter, one in, four out
- Three runs of different lengths, one deliberately long
- Six fixtures with settable addresses, of at least two different types
- A network switch, a node, and one universe of sACN feeding two of the fixtures
- Terminators, spares, and a labelling machine

### Build it properly, because you will be marked on the drawing

The build is not the hard part. The documentation is, and it is where the marks are.

Before the rig is powered, produce a **signal flow drawing** that shows:

- Every device, with its address, its universe and its channel footprint
- Every cable, with its length and its label
- Where the terminators are
- Where the isolation barriers are
- Which device is at the end of each run

Then power it up and correct the drawing, because it will be wrong. **The drawing that matches
reality is the deliverable**, not the drawing you made first.

<!--anim:rig-topology-->

### Labelling, which is not administration

Every cable gets a label at both ends. Every fixture gets its address written where it can be read
from the ground. Every universe gets a colour.

The test: could somebody who has never seen this rig find the third fixture on run two, in the dark,
in ninety seconds? If not, the labelling has failed, and this is exactly the situation a production
electrician is in at 22:00 during a technical rehearsal.

---

## The fourteen faults

Once the rig works and the drawing matches, the technician introduces faults, one at a time, while
your team is out of the room. Your job is to find each one and, more importantly, to log the
symptom before you find the cause.

<!--anim:symptom-map-->

### The list

| # | Fault | What it looks like |
| --- | --- | --- |
| 1 | Terminator removed from the long run | Intermittent flicker, often on a middle fixture |
| 2 | Two fixtures on the same address | Two fixtures moving together, no error anywhere |
| 3 | One fixture one channel off | Wrong attribute responds: colour on the dimmer fader |
| 4 | Fixture footprint runs past 512 | Fixture partly responds, last attributes dead |
| 5 | Data pair swapped in one cable | That fixture and everything after it dead |
| 6 | Screen open in one cable | Works, then fails when the dimmers come up |
| 7 | Star split without a splitter | Some branches fine, others corrupt, changes as you patch |
| 8 | Microphone cable substituted | Works at short length, fails when extended |
| 9 | Wrong universe on the node | A whole group dead, everything else fine |
| 10 | Network cable with split pairs | Link comes up, sACN drops out under load |
| 11 | Node and console on different subnets | Node visible on its display, no data |
| 12 | 33rd device added to one run | Whole run becomes unreliable, no single bad device |
| 13 | Fixture in a different personality mode | Right channels, wrong meanings, looks like a patch error |
| 14 | Splitter output dead | One branch out, others fine, points at the splitter |

### The method, which is the same one as Class 8

1. **Characterise before touching.** What is affected, what is not, and where is the boundary
   between them? The boundary is where the fault is.
2. **Half-split.** Test in the middle of the affected section. A rig with sixteen possible failure
   points is four tests, not sixteen.
3. **One change at a time, written down, reversed if it did not help.**
4. **Prove the fix** by putting the fault back and confirming the symptom returns.

For each of the fourteen, log: the symptom in a stage manager's words, the tests you ran in order,
the cause, and the fix. That log is the assessed artefact.

### The three that teach the most

**Fault 6, the open screen.** It works perfectly until the dimmers come up, because with no screen
the data pair has no shield and induced noise from the dimmer harmonics corrupts it. The lesson is
that a fault can be dormant and be triggered by something in an entirely different department. If
your notes say "it only happens during the ballroom scene", that is diagnostic information, not a
complaint.

**Fault 7, the passive star.** Some branches work and others do not, and which ones changes when you
touch things. It looks like a haunting. It is impedance: a passive split creates multiple reflection
paths, and the pattern of constructive and destructive interference depends on the exact lengths.
The only fix is an active splitter, and this is why splitters exist and why a "DMX Y-splitter"
bought online is a device for creating intermittent faults.

**Fault 13, the personality mode.** The channels arrive correctly and the fixture does the wrong
things with them, because the console thinks it is in 16-channel mode and the fixture is in
8-channel mode. Nothing electrical is wrong. No test on the cable will find it. It is found by
comparing the console's patch to the fixture's own display, which is a step people skip because it
is not electrical.

---

## The network half

Faults 10, 11 and 14 are network faults, and they behave differently from DMX faults in one
important way: **the network will tell you things, if you ask it.**

<!--anim:net-diag-->

A DMX line is silent. A network has link lights, switch statistics, IP configuration and packet
counters. Three checks, in order, before anything else:

1. **Link.** Is the light on at both ends, and at the right speed? A link light that is on at
   100 Mbit/s where you expect 1 Gbit/s often means a damaged cable using only two pairs.
2. **Address.** Are the console, the node and the switch on the same subnet? A node showing an
   address of `2.x.x.x` when the console is on `10.x.x.x` cannot receive anything, and the node's own
   display will look completely healthy.
3. **Traffic.** Is the node receiving packets at all? Most nodes have a data indicator. If it is
   dark, the problem is upstream of the node. If it is lit and the fixtures are dark, the problem is
   downstream, and you are back to a DMX fault.

Those three questions split the network half of the rig into thirds in under a minute, and the
sibling module on [computer systems and networking](https://theatre-computer-systems.vercel.app/class/3)
goes considerably deeper on all three.

---

## Establishing the boundary

Every method in this course begins with the same move, and it is the one people skip when they are
in a hurry. Before touching anything: **what works, what does not, and where is the line between
them?** The fault is on that line.

<!--anim:boundary-->

On a rig, the boundary questions are concrete:

| Question | What the answer eliminates |
| --- | --- |
| Is it one fixture, one run, one universe, or everything? | Three quarters of the rig, in one question |
| Does the boundary follow the cable order, or the patch order? | A wiring fault against an addressing fault |
| Does anything downstream of it work? | Whether the signal is arriving at all |
| Did it ever work, and what changed since? | Everything that has not been touched |
| Does it correlate with anything in another department? | Screening, shared supplies, dimmer harmonics |

The last one is the one nobody asks, and it is how fault 6 gets found. "It only happens during the
ballroom scene" is not a complaint, it is a measurement.

**Write the boundary down before you move.** It takes fifteen seconds, and it stops the thing that
actually wastes the evening: forgetting what you have already excluded, and testing it again.

---

## The drawing, and what makes one good

<!--anim:rig-doc-->

A lighting plan says where fixtures hang. A **signal flow drawing** says how data reaches them, and
they are different documents answering different questions. The second is the one that matters at
22:00.

A signal flow drawing that works carries: every device with its address, universe and channel
footprint; every cable with its length and its label; where the terminators are; where the isolation
barriers are; and which device is at the end of each run.

Three properties separate a drawing that gets used from one that gets ignored:

**It matches reality.** The drawing you made before the build is a plan. The one you corrected after
walking the rig is a drawing. Only the second is a deliverable.

**Somebody else can read it.** Get it signed off by another team before you power up. A drawing only
its author understands is a private note.

**It answers the question you will actually have.** Not "what does this rig look like" but "which
fixture is third on run two, and what is its address". If the drawing cannot answer that in ten
seconds, it is decorative.

---

## At the bench

Three hours and twenty minutes, all of it hands-on.

### Block A — Build and document (60 min)

Build the rig. Label everything. Produce the drawing. Get the drawing signed off by another team
before you power up, because a drawing that only its author can read is not a drawing.

### Block B — Prove it (25 min)

Every fixture responds, on the right channel, at the right address, in the right universe. Scope
the far end of each run and confirm the signal is clean. Photograph the clean trace: you need it for
comparison in Block C.

### Block C — Fourteen faults (100 min)

The technician introduces faults one at a time. Teams rotate so you meet all fourteen.

Log everything. Approximately seven minutes per fault, which is tight, and that is intentional:
methodical is faster than clever under time pressure, and this is where you find that out.

### Block D — Write the report (15 min)

One page per team: the three faults that took longest, why, and what test would have found each one
faster. That last column is the whole point of the class.

---

## Common misconceptions

- **"If it works in the rig check it will work in the show."** Fault 6 works in the rig check and
  fails when the dimmers come up. Fault 8 works at 10 m and fails at 60 m. Fault 12 works until the
  building warms up. A rig check proves the rig worked during the rig check.
- **"A DMX Y-splitter splits DMX."** A passive Y-piece creates two unmatched branches and multiple
  reflection paths. It sometimes works, and when it fails it produces the least diagnosable symptom
  in this course. Splitting DMX requires an active, ideally isolated, splitter.
- **"An address collision will show an error somewhere."** There is no addressing in DMX and
  therefore no collision detection. Two fixtures on one address behave identically forever and
  nothing anywhere reports a problem. The only detection is a human noticing two things moving
  together.
- **"If the link light is on, the network cable is fine."** A link light means enough pairs are
  working to establish some link. A cable with split pairs or one damaged pair will link, often at a
  lower speed, and will drop packets under load, which looks like an intermittent software fault.
- **"The fixture is faulty."** Before a fixture is faulty, check: address, universe, personality
  mode, its own DMX termination setting, and whether it is the first device after the fault rather
  than the cause of it. Fixtures get returned to hire companies in working order every week.
- **"Documentation slows the build down."** The drawing is what makes the fault-finding fast, and
  the fault-finding is where the hours actually go. A team with a correct drawing finds fault 9 in
  ninety seconds; a team without one starts unplugging things.

---

## Numbers from this class

| Quantity | Value |
| --- | --- |
| Maximum devices on one DMX run | 32 |
| Maximum DMX run length | about 300 m |
| DMX terminator | 120 Ω |
| Universes carried by one Cat5e cable | many, limited by bandwidth not connectors |
| Channels in a universe | 512 |
| sACN default transport | UDP multicast |
| Art-Net default transport | UDP broadcast |
| Common Art-Net address range | 2.x.x.x or 10.x.x.x |
| Link speed indicating a damaged pair | 100 Mbit/s where 1 Gbit/s is expected |
| Half-split tests for 16 devices | 4 |
| Time to find a fault with a correct drawing | typically under 2 minutes |
| Time to find the same fault without one | typically 10 minutes or more |
| Devices per active splitter output | up to 32, per output |
