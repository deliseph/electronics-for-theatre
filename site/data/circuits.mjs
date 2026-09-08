// The wiring bench: Tinkercad Circuits, embedded where the class teaches the
// thing being wired.
//
// Why this exists. A student who has read about a pull-down resistor and one who
// has removed one and watched an input float are not in the same position, and
// only one of them will diagnose it on a Tuesday. Tinkercad Circuits runs a real
// SPICE-derived simulation in a browser with nothing installed, which means the
// second position is reachable from a laptop on a bus.
//
// What it is not. It is not a substitute for the bench. It has no smell, no
// heat, no dry joint and no oscilloscope probe that has fallen off. Every entry
// here says what the simulator will and will not tell you, because a student who
// thinks a passing simulation is a proof has learned the wrong thing and will
// learn it again, expensively.
//
// -------------------------------------------------------------------------
// HOW TO PUT A CIRCUIT IN
//
// 1. Build it at tinkercad.com/circuits.
// 2. Share → Invite people → copy the link, or open the circuit and take the id
//    out of the URL: tinkercad.com/things/<ID>-<slug>. The id is the part
//    before the first dash, e.g. "1a2B3cD4e5F".
// 3. Paste it as `tinker` below. That is the whole change.
//
// An entry with no id still renders: it becomes a build brief with a button
// that opens Tinkercad, which is useful on its own and is what the page shows
// until somebody pastes an id. Nothing here invents an id, because a dead embed
// in a class is worse than no embed.
// -------------------------------------------------------------------------

export const circuits = [
  {
    id: 'ohms-law',
    cls: 1,
    tinker: '',
    title: 'Ohm’s law, with a meter on it',
    tag: 'The first one',
    mins: 10,
    build: `A 9 V supply, a 470 Ω resistor and an LED in series, with a multimeter across the
      resistor and a second one in series with the LED.`,
    do: [
      'Read the current. Check it against V ÷ R before you believe the meter.',
      'Change the resistor to 220 Ω and predict the new current before you run it.',
      'Change it to 100 Ω and predict what happens to the LED before you run it.',
      'Put the meter in parallel with the LED instead of in series and see what the reading means now.',
    ],
    shows: 'The arithmetic, the direction of the relationship, and what a meter reads in each position.',
    hides: 'That the 100 Ω version gets hot, that the LED has a real thermal limit, and that a meter in the wrong place blows a fuse.',
  },
  {
    id: 'divider',
    cls: 1,
    tinker: '',
    title: 'A voltage divider, and why it sags under load',
    tag: 'The one everybody gets wrong',
    mins: 12,
    build: 'Two 10 kΩ resistors across 9 V, with a meter on the midpoint.',
    do: [
      'Read the midpoint. It is half. Say why in one sentence.',
      'Now hang a 1 kΩ load on the midpoint and read it again.',
      'Say what the reading would be with a 100 kΩ load, then check.',
      'Work out the ratio of load to divider at which the sag stops mattering for your purpose.',
    ],
    shows: 'That a divider is not a power supply, and that the load is part of the circuit.',
    hides: 'How much heat the divider is dissipating, and why nobody powers anything from one in a rig.',
  },
  {
    id: 'switch-bounce',
    cls: 3,
    tinker: '',
    title: 'A switch bounces, and the input reads three presses',
    tag: 'Contacts',
    mins: 12,
    build: 'A pushbutton to an Arduino input with a 10 kΩ pull-down, and a counter printed to the serial monitor.',
    do: [
      'Press it once. Read the count.',
      'Remove the pull-down and watch what the input does with nothing holding it.',
      'Add a 100 nF capacitor across the switch and count again.',
      'Then debounce it in firmware instead, and compare the two fixes.',
    ],
    shows: 'That a contact is a mechanical thing making and breaking several times in a few milliseconds, and that a floating input is not zero.',
    hides: 'How a real switch degrades over a season, and how much worse this gets on a long cable in a rig.',
  },
  {
    id: 'transistor-switch',
    cls: 5,
    tinker: '',
    title: 'Switching a load that is not an LED',
    tag: 'Loads',
    mins: 15,
    build: 'An Arduino output into the gate of a logic-level MOSFET, driving a 12 V motor, with a flyback diode across the motor.',
    do: [
      'Run it. Note the gate resistor and say what it is for.',
      'Delete the flyback diode and watch what happens to the supply rail when the motor stops.',
      'Put it back. Say what that diode is doing, in one sentence, in terms of energy.',
      'Swap the logic-level MOSFET for a standard one and see why 5 V on the gate is not enough.',
    ],
    shows: 'The shape of the switching circuit, the inductive kick, and why the part number matters.',
    hides: 'Gate charge, switching losses, and the fact that the real one gets hot enough to need a heatsink.',
  },
  {
    id: 'pwm-dimming',
    cls: 5,
    tinker: '',
    title: 'Dimming by chopping, not by resisting',
    tag: 'PWM',
    mins: 12,
    build: 'An Arduino PWM output to a MOSFET driving an LED string, with an oscilloscope on the gate and on the load.',
    do: [
      'Sweep the duty cycle and watch the waveform rather than the LED.',
      'Change the PWM frequency and say what the scope shows and the eye does not.',
      'Work out the frequency at which a camera shutter would beat against it.',
      'Say why a resistor would have been the wrong answer here, in terms of watts.',
    ],
    shows: 'That brightness control is a duty cycle, and what the waveform actually looks like.',
    hides: 'Flicker as a camera sees it, and how a cheap driver behaves at the bottom of the fade.',
  },
  {
    id: 'sensor-scaling',
    cls: 13,
    tinker: '',
    title: 'A sensor is a voltage until you scale it',
    tag: 'Analogue in',
    mins: 15,
    build: 'A potentiometer and an LDR into two analogue inputs, printing raw counts and scaled values.',
    do: [
      'Read the raw counts. Say what the top and bottom numbers are and why.',
      'Map them to 0–100 and check the ends land exactly.',
      'Cover the LDR and see what the useful range actually is, which is not the full range.',
      'Add averaging over eight reads and watch the jitter go.',
    ],
    shows: 'Counts, range, mapping and the difference between the sensor range and the ADC range.',
    hides: 'Noise from a real cable run, and the fact that the LDR is slow and temperature-dependent.',
  },
  {
    id: 'interlock',
    cls: 15,
    tinker: '',
    title: 'The interlock that does not ask a processor',
    tag: 'Safety',
    mins: 15,
    build: `A normally-closed emergency stop in series with the coil of a relay that supplies the
      load, with an Arduino watching the chain on an input but not in it.`,
    do: [
      'Open the E-stop and watch the load drop with the microcontroller still running.',
      'Halt the microcontroller and confirm the chain still works.',
      'Put the microcontroller in the chain instead and say, precisely, what you have just given away.',
      'Add the input back so the code knows the chain is open, and say the difference between knowing and enforcing.',
    ],
    shows: 'The topology, and the fact that the safety works with the processor removed.',
    hides: `Everything that makes a real interlock a real interlock: contact ratings, forced-guided
      contacts, dual-channel monitoring, category ratings and a signed risk assessment. This is a
      picture of the idea, not a design.`,
  },
];
