# Class 16 — Capstone and Fault-Finding Exam

> Build it, prove it, document it, hand it over. Then find three faults in somebody else's under
> time pressure, with the clock running and nobody helping.

## Before you come

### What you must already be able to do

All of it. This class assesses the whole course and adds nothing new.

If there is one thing to revise, revise the **method**: establish the boundary, half-split, one
change at a time, prove the fix. More marks are lost to disordered searching than to missing
knowledge, every year, by a wide margin.

### Three things to do

1. **Build your capstone piece in advance.** You do not build it today. You bring it finished,
   documented and working, and today you prove it and defend it.
2. **Write your documentation sheet and test it on somebody outside this course.** Give them the
   sheet and the device and say nothing. Every question they ask is a defect in the sheet.
3. **Re-read your own fault logs** from Classes 8, 10 and 15. Your own record of what took you
   longest is a better revision aid than any summary, because it is specific to how you actually
   search.

### What to bring

Your capstone piece, its documentation, your meter, your notebook with every log in it, and the
cables you made in Class 4.

<!--ready:16-->

---

## What the capstone is

A working piece of show electronics that you designed, built, tested and documented. It must:

- **Take an input** — a sensor, a cue, a DMX channel, or more than one
- **Drive a real load** through switching you built and can explain
- **Have a defined power-up state and a defined behaviour on loss of control**
- **Detect at least one fault condition** and respond to it in a way you decided in advance
- **Show its state** on an indicator readable across a room
- **Come with one side of A4** that a stranger can operate it from

Scale is not the point. A well-executed practical lamp with honest documentation scores far above an
ambitious machine that half works and has no sheet, and it does so for the same reason a production
would choose the first one.

<!--anim:capstone-map-->

---

## How it is assessed

Four parts. Note the weighting, and note that only the first is about the object.

| Part | Weight | What is actually assessed |
| --- | --- | --- |
| The build | 25 % | Does it work, is it safe, is the workmanship sound |
| The proof | 25 % | Can you demonstrate that it works, with measurements |
| The documentation | 20 % | Can a stranger operate and reset it from your sheet alone |
| The fault-finding exam | 30 % | Method, under time pressure, on somebody else's work |

**Fault-finding is the largest single component**, and it is on a device you have never seen. That
is deliberate. It is the closest thing in this course to the job.

### The proof, in detail

You will be asked to demonstrate, with instruments, that your claims are true. Expect to be asked
for any of:

- The current your load actually draws, measured, against what you designed for
- The voltage across your switching device while conducting, and the dissipation calculated from it
- That the isolation barrier is intact, measured
- That the power-up state is what you documented, demonstrated three times from cold
- That the loss-of-control behaviour is what you documented, demonstrated by disconnecting the
  control
- That the fault detection works, demonstrated by causing the fault
- The PWM frequency, or the loop time, or the debounce interval, on a scope

**"It works" is not a proof.** A measurement, with the meter or scope visible and the number stated,
is a proof. This is the Class 2 discipline, assessed.

### The documentation, in detail

One side of A4:

1. What it is and what it is for, in two sentences
2. Ratings: supply voltage, current, maximum load, isolation, duty cycle
3. Pinout, drawn, with connector orientation
4. Power-up behaviour
5. Behaviour on loss of control
6. Fault conditions detected, and the indicator code for each
7. Reset procedure
8. Known limitations
9. Test results, dated and initialled
10. Who to contact

Point 8 is where marks are won and where most people lose them. **A limitation you have named is
engineering. The same limitation undocumented is a defect.** Every device in this room has
limitations. The sheets that list three specific ones score above the sheets that list none.

---

## The fault-finding exam

<!--anim:exam-method-->

Ninety minutes. Three faulted systems, thirty minutes each. Each has been built and then broken by
somebody else. You work alone. You may use any instrument in the room and any page on this site.

Each system draws on a different part of the course:

- **One electrical.** A power, switching or load fault. Class 1, 2, 5, 6.
- **One signal or data.** An analogue, grounding, DMX or network fault. Class 7, 8, 9, 10.
- **One control.** A microcontroller, sensor or logic fault. Class 11, 12, 13, 14.

### What is marked

| Marked | Not marked |
| --- | --- |
| Establishing the boundary before touching anything | Speed on its own |
| A written log, in order, with results | Finding it by luck |
| Half-splitting rather than searching sequentially | Knowing this particular device |
| One change at a time, reversed if it did not help | Elegance of the repair |
| Proving the fix by reintroducing the fault | Whether you completed all three |
| Recognising a safety issue and stopping | Confidence |

**You can score well on a system you did not fix.** A clear log showing a correct method, a
narrowed boundary and a defensible next test scores above a lucky find with no log. That is not a
consolation, it is the actual professional standard: the method transfers to faults nobody has seen,
and luck does not.

**And one absolute rule.** If any system presents a safety issue — an exposed conductor, a defeated
interlock, a burning smell, anything that should not be energised and is — stop, isolate, and report
it. That is a full-mark response, and continuing to work on it is a zero regardless of what else you
find.

### The half hour, structured

A shape that works, and that you should practise:

- **0–5 min.** Look, do not touch. What works, what does not, what is warm, what is lit, what smells.
  Read the documentation if there is any. Write down the boundary.
- **5–10 min.** First hypothesis and the test that would disprove it. Not confirm: disprove. A test
  that can only confirm tells you nothing when it passes.
- **10–25 min.** Half-split within the boundary. One change at a time, all of it logged.
- **25–30 min.** Prove the fix, or write down where you got to, what you excluded, and what your next
  test would be. **Never leave this blank.** It is worth marks and it is what a real handover looks
  like at the end of a shift.

---

## At the bench

Three hours and forty minutes.

### Block A — Set up and peer review (30 min)

Set your piece up and get it running. Then swap with a partner: operate theirs from the sheet alone,
in silence, and write down every moment you had to guess.

Exchange notes. You have fifteen minutes to fix your sheet before assessment, and everybody uses it.

### Block B — Demonstration and viva (40 min)

Ten minutes each with the assessor. Demonstrate, prove your claims with instruments, and answer
questions about the design decisions.

The questions asked every year: why that component, what happens if this wire is cut, what did you
choose not to do and why, and what would you change if you built it again. Have answers.

### Block C — The fault-finding exam (90 min)

Three systems, thirty minutes each, alone, logged.

### Block D — Debrief (40 min)

The faults are revealed and each is walked through: what it was, the fastest route to it, and what
misled people.

Then the last exercise of the course. Each person names one thing they now know they do badly under
pressure. Not a weakness in knowledge, a weakness in method: I start touching before I look, I do
not write things down, I stop half-splitting when I get impatient, I trust the report instead of
observing.

That sentence is the most useful thing you will take out of this room, and it is the only part of
the course with no marks attached to it at all.

---

## After this course

<!--anim:where-next-->

You are not an electrician and you are not an electronic engineer. You are something the industry is
short of: **a technical director who cannot be told a comfortable lie about electricity**, who can
read a schematic, measure a claim, spot a defeated interlock, and write a specification that a
supplier will take seriously.

Three things worth doing in the next year:

**Build something nobody asked for.** The skills decay without use, and a self-directed project is
where you find out which parts you actually understood.

**Get the qualification your jurisdiction requires** if you intend to do mains work yourself. This
course does not give you that and does not pretend to. What it gives you is the ability to supervise
and to check the work of people who have it.

**Keep the notebook.** Every measurement you took this term is in it. In three years the numbers will
be less useful than the record of how you searched, which is the thing that actually got better.

[Where to go next](/next) has the specifics: courses, standards, books and the kit worth owning.

---

## Common misconceptions

- **"The capstone is judged on ambition."** It is judged on whether it works, whether you can prove
  it, and whether somebody else can run it. A modest device with honest documentation scores far
  above an ambitious one that half works, and a production would choose the same way.
- **"If I fix all three faults I get full marks."** Method is marked, not outcome. A clear log with a
  narrowed boundary and a defensible next test scores above a lucky find with no log, because only
  one of those transfers to a fault nobody has seen.
- **"Documentation is the last ten minutes."** It is twenty per cent of the mark and it is the part
  the peer review will find holes in. Written after the build, it describes what you remember.
  Written during, it describes what is true.
- **"Speed is what is being tested."** Thirty minutes is enough for a methodical search and not
  enough for a random one. People who rush skip the boundary step and then spend twenty-five minutes
  in the wrong half of the system.
- **"A safety issue in the exam is part of the puzzle."** It is not. Stop, isolate, report. That is
  the full-mark answer, and it is the answer regardless of how much time is left or how close you
  were to something else.
- **"After sixteen classes I should be able to design anything."** After sixteen classes you should
  be able to read, measure, question and specify. Design competence comes from building things
  nobody asked for, repeatedly, for a few years. This course was the point at which that became
  possible.

---

## Numbers from this class

| Quantity | Value |
| --- | --- |
| Capstone weighting, the build | 25 per cent |
| Capstone weighting, the proof | 25 per cent |
| Capstone weighting, the documentation | 20 per cent |
| Capstone weighting, the fault exam | 30 per cent |
| Fault exam, systems | 3 |
| Fault exam, time per system | 30 minutes |
| Documentation length | one side of A4 |
| Documentation points required | 10 |
| Look-do-not-touch phase | first 5 minutes |
| Escalate after | 30 minutes with no boundary established |
| Response to a safety issue in the exam | stop, isolate, report |
| Marks for a logged partial diagnosis | above an unlogged lucky find |
