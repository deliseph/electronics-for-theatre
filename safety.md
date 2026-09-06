# The safety card

Every rule here exists because somebody was hurt or a building burned. None of them is a matter of
judgement, and every one of them is a rule you can be sent home for breaking.

Print it. Put it on the bench.

---

## The four that are absolute

**1. Prove dead before you touch. Live, dead, live.**
Test your meter on a known live source, test the circuit, test your meter again. A meter with a flat
battery, a broken lead or the wrong function selected reads zero volts on everything, and zero is
exactly the answer you were hoping for.

**2. Lock it off with your own lock, and keep the key on you.**
Not in a drawer, not with a colleague, not "I told him". People go home. Shifts change. A circuit
that is off for no visible reason gets switched on. One lock per person working, and the isolation
cannot be restored until every lock is removed.

**3. Never defeat an interlock, and never work past one that has been defeated.**
A magnet taped to a reed switch, a cable tie on a limit switch, a jumper across a terminal. Finding
one is a stop-work event, not a note for the production meeting. It was designed in by somebody who
identified a hazard.

**4. Never lift a protective earth to cure a noise problem.**
It works, and it is how people are killed. The correct fix for a ground loop is a balanced
interconnect, a screen lifted at one end, or a transformer. Those are in Class 7, they take five
minutes, and they do not remove the thing keeping somebody alive.

---

## Before you work

<!--anim:safe-start-->

- **Know what you are working on** and what feeds it. If you cannot name the isolation point, you are
  not ready to start.
- **Know where the isolation is** and that it works.
- **Know who else is affected.** Anything shared, anything a performer touches, anything above
  somebody's head.
- **Work with somebody else in the building** for anything above extra-low voltage. Not in the room
  necessarily, but aware and reachable.
- **Know where the first aid kit and the nearest defibrillator are**, before you need to know.

---

## While you work

- **One hand where you can.** Keeping the other hand out of the circuit keeps the current path off
  your chest. It is a habit worth building on low voltage so that it is automatic on high.
- **No jewellery, no watch, no loose lanyard.** A metal bracelet across a battery terminal will
  deliver hundreds of amps and it cannot be removed while it is welding itself to your wrist.
- **Eye protection when soldering, cutting or drilling.** Solder spits, flux spits, cut ends fly, and
  an eye does not repair.
- **Ventilation when soldering.** Flux fumes are a respiratory sensitiser, and sensitisation is
  permanent.
- **Wash your hands after handling solder**, before eating. Especially leaded.
- **Tidy as you go.** A clipping across two pads is a short. A trailing lead is a trip. A hot iron
  off the stand is a burn or a fire.

---

## Voltages, and where the thresholds are

<!--anim:voltage-bands-->

| Band | Range | What it means for you |
| --- | --- | --- |
| Extra low voltage | Below 50 V AC, 120 V DC | Shock risk low on dry skin. Energy risk still real |
| Low voltage | 50–1000 V AC | This includes mains. Lethal. Qualified work only |
| High voltage | Above 1000 V AC | Never. Distance and specialist procedures |

**Below 50 V is not "safe", it is lower shock risk.** A 12 V battery can deliver hundreds of amps
into a short and start a fire in seconds. A 48 V DC supply can sustain an arc that mains AC would
self-extinguish. Energy and shock are two separate hazards.

**Damp changes everything.** Body resistance falls from tens of kilohms to about a kilohm with sweat,
water or broken skin, and the current at a given voltage rises by the same factor. This is why the
rules tighten outdoors, near water, and on a stage under lights where people sweat.

---

## What current does

| Current, 50 Hz AC | Effect |
| --- | --- |
| 0.5–2 mA | A tingle |
| 5 mA | Painful |
| 10–20 mA | You cannot let go |
| 30 mA | Breathing difficulty. This is the RCD threshold |
| 50–100 mA | Likely ventricular fibrillation |
| Above 1 A | Burns, cardiac arrest |

The **let-go threshold** at about 10 mA is the one to remember: above it, the muscles that close the
hand overpower those that open it, so the grip tightens. The victim cannot release. This is why a
bystander must switch off rather than pull.

---

## What protects what

<!--anim:protection-matrix-->

| Device | Protects | Does not protect |
| --- | --- | --- |
| Fuse | The cable, from fire | A person. 13 A is 400 times a lethal current |
| Circuit breaker | The cable, from fire | A person, for the same reason |
| RCD at 30 mA | A person, from an earth fault | Against contact across live and neutral; against overload |
| Isolating transformer | A person, by removing the earth reference | Against contact across both output conductors |
| Double insulation | A person, by removing exposed metal | Against damage to the insulation |

**No fuse or breaker anywhere protects a person.** That is not their job. Only an RCD, isolation or
double insulation does, and each of them has a specific gap.

---

## If somebody is being shocked

<!--anim:shock-response-->

1. **Do not touch them.** You will become the second casualty and there will be nobody left to help.
2. **Switch off.** The isolator, the breaker, the plug. This is why you know where it is before you
   start.
3. **If you cannot switch off**, push or pull them clear with something dry and non-conductive: a
   wooden broom handle, a dry rope, a plastic chair. Not your hands, not anything damp, not anything
   metal.
4. **Call emergency services.** Immediately, and before you assess anything.
5. **Start CPR if they are not breathing.** Get the defibrillator.
6. **Anybody who has taken a mains shock goes to hospital**, even if they feel fine. Cardiac
   arrhythmias can appear hours later, and this is the rule people most often talk themselves out
   of.

**Hong Kong and most of the region: 999. Europe: 112. North America: 911.**

---

## Fire

- **Electrical fire: isolate first if it is safe to do so.** Removing the energy source is more
  effective than anything you can spray at it.
- **CO₂ or dry powder on electrical fires. Never water.**
- **A lithium battery fire is not a normal fire.** It supplies its own oxygen, it reignites, and it
  emits toxic gas. Evacuate, isolate if you can do it safely, and let the fire service deal with it.
- **A burning smell with no visible fire is still a fire.** Isolate and investigate. Almost always a
  connection running hot, which is Class 1's loose-terminal lesson arriving in earnest.

---

## Soldering and the bench

- Iron in its stand, every time, without exception. There is no "just for a second".
- Assume every iron is hot. Assume every joint you just made is hot.
- Never catch a falling iron. Let it fall and move your feet.
- Solder is hot enough to burn through skin quickly, and a solder burn to the eye is permanent.
- Cut ends fly, so cut with the end pointing at the bench.
- Ventilate. Wash your hands.

---

## Capacitors

- **Any large capacitor in mains equipment is live until you have measured it**, and it can stay live
  for minutes after the plug is out.
- Discharge through a resistor, not with a screwdriver. Shorting one welds the screwdriver, sprays
  metal, and can rupture the capacitor.
- Measure after discharging, then measure again a minute later: some capacitors recover a surprising
  amount of charge on their own.

---

## When to stop

Three situations where stopping is the professional response and continuing is not:

- **Anything on mains you are not qualified for.** This course does not qualify you for mains work.
  It qualifies you to specify it, check it, and refuse it.
- **Any failed or defeated safety system.** These are not repaired under time pressure and never
  bypassed to get a performance through. There is no production worth it, and the phrase "just for
  tonight" is how every one of these incidents begins.
- **Any time you have been going more than thirty minutes with no boundary established.** Another
  pair of eyes is faster than another twenty minutes of yours, and asking is cheaper than the
  mistake tiredness is about to produce.

---

## The one sentence

> **If you are not certain it is dead, it is live.**

Everything else on this card is an elaboration of that.
