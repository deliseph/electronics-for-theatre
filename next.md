# Where to go next

Sixty four hours is an introduction. By the end of it you should know which direction you want to go
deeper in, and this page is what each direction leads to, what it costs, and what is free.

---

## First, be honest about what this course gave you

**It did not qualify you to do mains work.** No academic course does that anywhere. Electrical work
on fixed installations and on equipment for hire is regulated, and the qualification is a separate,
assessed, jurisdiction-specific thing.

**What it gave you** is the ability to read a schematic, measure a claim, specify a system, spot a
defeated interlock, run a fault-finding process that works on equipment you have never seen, and
build low-voltage show electronics to a standard that can go on a production.

That is a genuinely valuable position. Most technical directors cannot do it, and the ones who can
are noticeably harder to mislead.

---

## If you want to do the electrical work yourself

### Hong Kong

The **Electrical Worker Registration** scheme under the Electricity Ordinance is the route. Grade A
is the entry level and covers fixed installations up to a defined capacity. It requires a recognised
course plus supervised experience, and the Electrical and Mechanical Services Department publishes
the current requirements.

The **Vocational Training Council** runs the recognised courses. Expect one to two years part time.

### United Kingdom

**City & Guilds 2365** (Level 2 and 3 Diploma) plus the **2382** wiring regulations qualification is
the standard route, followed by **2391** for inspection and testing. Around two years part time.

For entertainment specifically, the **PLASA/ABTT** training routes and **NRCE** registration are what
the industry actually recognises.

### North America

Electrician licensing is state or provincial, generally through an apprenticeship of four to five
years. **ETCP Entertainment Electrician** certification is the one that matters in this industry,
and it requires documented experience plus an exam. It is well respected and worth aiming at.

---

## If you want to go deeper in entertainment technology

### The certifications the industry recognises

| Certification | What it covers | Who it is for |
| --- | --- | --- |
| **ETCP Entertainment Electrician** | Power distribution, rigging of electrics, safety | Anyone doing electrics on large productions |
| **ETCP Rigger** | Theatre and arena rigging | The mechanical side of the same job |
| **PLASA/ABTT courses** | UK-focused, modular, practical | Working professionals topping up |
| **Manufacturer training** (ETC, MA, Robe) | Specific consoles and fixtures | Free or cheap, and genuinely useful |

Manufacturer training is undervalued. ETC and MA Lighting both run free or near-free sessions, and
they are taught by people who work on the products.

### The standards to know exist

You do not memorise these. You need to know they exist and be able to find the relevant clause.

| Standard | What it defines |
| --- | --- |
| **ANSI E1.11 (DMX512-A)** | DMX512, in full: timing, connectors, topology |
| **ANSI E1.31 (sACN)** | Streaming ACN, DMX over IP |
| **ANSI E1.20 (RDM)** | Remote device management over the DMX pair |
| **ANSI E1.27** | Portable control cables |
| **IEC 60204-1** | Electrical equipment of machines, including stop categories |
| **ISO 13849** | Safety-related parts of control systems, performance levels |
| **BS 7671 / IET Wiring Regulations** | UK wiring regulations |
| **Code of Practice for the Electricity (Wiring) Regulations** | Hong Kong wiring regulations |
| **IEC 61508** | Functional safety, where SIL levels come from |

**If you build automation or safety systems, read ISO 13849 and IEC 60204-1 properly.** They are
the documents that define what "dual channel monitored" actually means, and they are what a
supplier's claims should be checked against.

---

## Free, and actually good

### Reading

- **The Art of Electronics**, Horowitz and Hill. The standard reference. Not free, and worth owning.
  Read chapters, not the book.
- **Practical Electronics for Inventors**, Scherz and Monk. More accessible, more project focused.
- **All About Circuits** (allaboutcircuits.com). A complete free textbook, well written, and the
  reference chapters are genuinely good.
- **Falstad's circuit simulator** (falstad.com/circuit). Free, in a browser, and the fastest way to
  build an intuition for a circuit you are reading about. Draw the Class 6 driver board in it.
- **Manufacturer application notes.** Texas Instruments, Analog Devices and Linear Technology
  publish exceptional free material on grounding, layout and signal integrity. The TI notes on
  grounding are better than most textbooks.

### Watching

- **EEVblog** for test equipment, teardowns and a very good multimeter series.
- **Big Clive** for taking apart cheap mains equipment and explaining exactly why it is dangerous.
  Unexpectedly excellent training for spotting bad equipment on a production.
- **Applied Science** and **Ben Eater** for depth. Ben Eater's series on building a computer from
  logic gates is the best explanation of digital electronics available anywhere, free.

### Doing

- **Build something nobody asked for.** This is the actual answer. Skills decay without use, and a
  self-directed project is where you discover which parts you only thought you understood.
- **Volunteer to fix things.** Every venue has a box of broken equipment. Ask for it. You will learn
  more from twenty repairs than from any course, including this one.

---

## The adjacent directions

### Show control and networking

The natural next step, and the sibling module to this one:
[Computer Systems and Networking for Theatre](https://github.com/deliseph/theatre-computer-systems).

If the part you enjoyed was Classes 11 to 14, the firmware rather than the soldering, then
[Computer Science for Theatre](https://computer-science-theatre.vercel.app) is the one to take next: reading code you did not write,
version control, working with AI without being caught out by it, and the architecture decision
about what belongs on a chip and what belongs on a computer.
Networks, protocols, media over IP, show control architecture, and the diagnostic ladder.

### Automation and machinery

Motion control, servo drives, PLCs, functional safety. High responsibility, well paid, and the part
of the industry where the safety standards in the table above stop being background reading.

Start with ISO 13849 and a PLC trainer. Stage Technologies, TAIT and Kinesys all publish material
worth reading.

### Audio electronics

Analogue design, amplifier topologies, transformer design, loudspeaker measurement. A deep and
satisfying rabbit hole and Class 7 is its doorway.

### Embedded and firmware

If Classes 11 to 14 were the ones you enjoyed, this is a career on its own. Learn C properly, learn
one real-time operating system, learn to read a datasheet completely rather than searching it.

### Product design for the industry

There is a genuine shortage of people who understand both live performance and electronics well
enough to design equipment for it. If you can do both, that is a business.

---

## The one piece of advice

Keep the notebook.

Every measurement you took this term is in it, and in three years the numbers will matter far less
than the record of how you searched: which faults took you longest, where you gave up on the method
and started guessing, what you assumed instead of checking.

That record is the thing that actually improves. The knowledge is available to everybody, on this
site and in the books above. The method is what makes you the person somebody calls at 19:00.
