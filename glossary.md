# Glossary 詞彙表

Learn the English term as the operational one. Every datasheet, every menu, every error message and
every conversation on an international crew is in English. The Chinese is here to build the concept,
not to replace it.

---

## A. Quantities and units

| English | 繁體中文 | What it means |
| --- | --- | --- |
| Voltage | 電壓 | The difference in electrical pressure between two points. Never a property of one point alone |
| Current | 電流 | The rate at which charge flows. What heats a cable and what stops a heart |
| Resistance | 電阻 | Opposition to current. Every ohm turns electrical energy into heat |
| Impedance | 阻抗 | Opposition to alternating current, including capacitive and inductive effects. Frequency dependent |
| Power | 功率 | The rate of energy transfer, in watts. `P = V × I` |
| Energy | 能量 | Power over time. What the meter on the building charges for |
| Charge | 電荷 | The quantity of electricity. Current is charge per second |
| Capacitance | 電容 | The ability to store charge. Opposes a change in voltage |
| Inductance | 電感 | The ability to store energy in a magnetic field. Opposes a change in current |
| Frequency | 頻率 | Cycles per second, in hertz |
| Period | 週期 | The time for one cycle. The reciprocal of frequency |
| Duty cycle | 佔空比 | The proportion of a switching period spent on |
| RMS | 均方根值 | The equivalent DC value that would produce the same heating |
| Peak | 峰值 | The maximum instantaneous value. For a sine, 1.414 times the RMS |
| Ohm | 歐姆 | The unit of resistance |
| Ampere | 安培 | The unit of current |
| Volt | 伏特 | The unit of voltage |
| Watt | 瓦特 | The unit of power |
| Farad | 法拉 | The unit of capacitance |
| Hertz | 赫茲 | The unit of frequency |
| Decibel | 分貝 | A logarithmic ratio. 6 dB is a factor of two in voltage |

---

## B. Circuits and behaviour

| English | 繁體中文 | What it means |
| --- | --- | --- |
| Ohm's law | 歐姆定律 | `V = I × R`. The relationship everything else is built on |
| Series | 串聯 | Connected end to end. Same current, voltage divides. One failure stops everything |
| Parallel | 並聯 | Connected across each other. Same voltage, current divides |
| Direct current | 直流電 | Current in one direction, steady. From a battery or a power supply |
| Alternating current | 交流電 | Current that reverses direction periodically. The mains |
| Three phase | 三相電 | Three supplies a third of a cycle apart. How large buildings are fed |
| Short circuit | 短路 | An unintended low-resistance path. Current rises until something gives |
| Open circuit | 斷路 | A break in the path. No current flows |
| Load | 負載 | Whatever the circuit is powering |
| Voltage divider | 分壓器 | Two resistors producing a fraction of the input voltage |
| Voltage drop | 壓降 | Voltage lost across a resistance, including a cable |
| Time constant | 時間常數 | `τ = R × C`. The time to reach 63 per cent of the target |
| Inrush current | 突入電流 | The large brief current at switch-on |
| Flyback | 反電動勢 | The voltage spike when current in an inductor is interrupted |
| Thermal runaway | 熱失控 | A device getting hotter, conducting more, and heating further |
| Rectification | 整流 | Converting alternating current to direct |
| Ripple | 漣波 | The residual variation on a rectified supply |
| Ground, earth | 接地 | The common reference. In mains, the protective conductor |
| Ground loop | 接地迴路 | A loop formed by two earth paths. The usual cause of hum |
| Common mode | 共模 | A signal present equally on both conductors of a pair |
| Differential | 差動 | A signal carried as the difference between two conductors |

---

## C. Components

| English | 繁體中文 | What it means |
| --- | --- | --- |
| Resistor | 電阻器 | Opposes current, turns the difference into heat |
| Capacitor | 電容器 | Stores charge, opposes a change in voltage |
| Electrolytic capacitor | 電解電容 | High capacitance, polarised, dries out with age and heat |
| Inductor | 電感器 | Stores energy magnetically, opposes a change in current |
| Diode | 二極體 | Passes current one way, blocks the other |
| Schottky diode | 蕭特基二極體 | A diode with a low forward drop and fast recovery |
| Flyback diode | 續流二極體 | Placed across a coil to absorb the collapse spike |
| LED | 發光二極體 | A diode that emits light. Needs current control, not voltage control |
| Transistor | 電晶體 | A current-controlled switch or amplifier |
| MOSFET | 場效電晶體 | A voltage-controlled switch. The workhorse for switching loads |
| Gate threshold | 閘極臨界電壓 | The gate voltage at which a MOSFET begins to conduct |
| On-resistance | 導通電阻 | A MOSFET's resistance when fully on. Determines its heating |
| Relay | 繼電器 | An electromagnet that mechanically closes a contact. Truly isolated |
| Contactor | 接觸器 | A large relay for switching power circuits |
| Solid state relay | 固態繼電器 | An isolated semiconductor switch. Silent, and it needs a heatsink |
| Optocoupler | 光耦合器 | An LED and a sensor with no electrical path between them |
| Voltage regulator | 穩壓器 | Produces a fixed output from a varying input |
| Transformer | 變壓器 | Changes AC voltage, and provides isolation |
| Fuse | 保險絲 | Melts on excess current. Protects the cable, not the person |
| Circuit breaker | 斷路器 | A resettable overcurrent device |
| RCD, GFCI | 漏電斷路器 | Trips on current returning by the wrong path. Protects the person |
| Thermistor | 熱敏電阻 | A resistance that varies with temperature |
| LDR | 光敏電阻 | A resistance that varies with light |
| Potentiometer | 可變電阻 | A variable divider. Absolute position |
| Heatsink | 散熱片 | Metal that carries heat away from a device |

---

## D. Measurement

| English | 繁體中文 | What it means |
| --- | --- | --- |
| Multimeter | 萬用電錶 | Voltage, current, resistance and continuity in one instrument |
| Oscilloscope | 示波器 | Draws voltage against time. Shows shape, not just size |
| Probe | 探棒 | The lead connecting a scope to the circuit |
| Continuity | 通斷 | A test for a low-resistance path, usually with a beeper |
| True RMS | 真有效值 | A meter that computes the real heating value of any waveform |
| Input impedance | 輸入阻抗 | How much a meter or input loads the circuit. Typically 10 MΩ |
| Loading effect | 負載效應 | A measurement changed by the instrument taking it |
| Ghost voltage | 感應電壓 | A capacitively coupled reading on a disconnected conductor |
| Timebase | 時基 | A scope's horizontal scale, in time per division |
| Trigger | 觸發 | The condition that starts a scope sweep. What makes a trace stand still |
| AC coupling | 交流耦合 | Blocking the DC so small variation on a large rail becomes visible |
| Single shot | 單次觸發 | Capturing one event that happens once |
| Proving unit | 驗電器 | A known live source, used to prove a meter before and after a test |
| Live, dead, live | 驗電三步 | Prove the meter, test the circuit, prove the meter again |
| Insulation tester | 絕緣測試儀 | Applies a high voltage to test insulation resistance |
| Logic analyser | 邏輯分析儀 | Captures many digital channels and decodes protocols |

---

## E. Signal and audio

| English | 繁體中文 | What it means |
| --- | --- | --- |
| Balanced | 平衡式 | Signal on two conductors as a difference. Interference cancels at the receiver |
| Unbalanced | 非平衡式 | One signal conductor with the screen as the return. Picks up interference |
| Screen, shield | 屏蔽 | A conductive layer around a cable to keep interference out |
| Microphone level | 麥克風電平 | 1 to 50 mV |
| Line level | 線路電平 | 0.3 V consumer, 1.23 V professional |
| dBu | 分貝(0.775V) | Decibels referenced to 0.775 V |
| dBV | 分貝(1V) | Decibels referenced to 1 V |
| Impedance bridging | 阻抗橋接 | Load much higher than source, to transfer voltage. The modern default |
| Impedance matching | 阻抗匹配 | Source and load equal, to transfer power. For speakers and RF |
| CMRR | 共模抑制比 | How well a differential receiver rejects common-mode signal |
| Hum | 交流聲 | 50 or 60 Hz, few harmonics. Induction or a ground loop |
| Buzz | 雜音 | Harmonic-rich noise. Usually a dimmer or a switching supply |
| Ground lift | 接地隔離 | Disconnecting the screen at one end to break a loop |
| DI box | 直入盒 | Converts a high-impedance unbalanced source to a balanced line |
| Filter, low pass | 低通濾波器 | Passes low frequencies, attenuates high |
| Filter, high pass | 高通濾波器 | Passes high frequencies, attenuates low |
| Clipping | 削波 | The waveform flattened at the top. Something is overloaded |

---

## F. Data and protocols

| English | 繁體中文 | What it means |
| --- | --- | --- |
| DMX512 | DMX512 燈光控制協定 | 512 levels repeated at about 44 Hz over RS-485. One direction, no addressing |
| RS-485 | RS-485 | The differential electrical layer under DMX. Says what the voltages are |
| Universe | 宇宙, 一個 DMX 迴路 | One set of 512 DMX channels |
| Channel, slot | 通道 | One of the 512 bytes in a universe |
| Address | 位址 | The first channel a fixture responds to |
| Footprint | 通道數 | How many consecutive channels a fixture uses |
| Personality, mode | 模式 | Which channel layout a fixture is set to use |
| Break | 中斷信號 | The long low period marking the start of a DMX packet |
| Start code | 起始碼 | The first byte of a DMX packet. `0x00` for dimmer data |
| Terminator | 終端電阻 | 120 Ω at the end of a line, to absorb reflections |
| Reflection | 反射 | Signal bouncing back from an unmatched cable end |
| Daisy chain | 菊鏈 | Device to device in a line. The correct DMX topology |
| Splitter | 分配器 | An active device that buffers one DMX input to several outputs |
| RDM | 遠端設備管理 | Two-way device discovery and configuration over the DMX pair |
| Art-Net | Art-Net | DMX over Ethernet, commonly broadcast |
| sACN, E1.31 | 串流 ACN | DMX over Ethernet using multicast. The modern default |
| MIDI | MIDI | Note and control events over a current loop at 31.25 kbit/s |
| MSC | MIDI 演出控制 | MIDI Show Control. Cue commands between departments |
| OSC | 開放聲控協定 | Named messages over a network. Flexible, two way |
| Timecode | 時間碼 | A continuous position-in-time signal for synchronisation |
| Baud rate | 鮑率 | Bits per second on a serial line |
| Multicast | 多播 | Sent to devices that subscribed. Efficient on a large rig |
| Broadcast | 廣播 | Sent to everything on the network, processed by everything |
| Packet | 封包 | A bundle of data with a header saying where it goes |
| Latency | 延遲 | The time between a cause and its effect |

---

## G. Microcontrollers and control

| English | 繁體中文 | What it means |
| --- | --- | --- |
| Microcontroller | 微控制器 | A chip running one program forever. Not a computer |
| GPIO | 通用輸入輸出 | A pin configurable as an input or an output |
| Floating input | 浮接輸入 | An input with nothing driving it. Undefined, not off |
| Pull-up, pull-down | 上拉, 下拉電阻 | A resistor defining a pin's idle state |
| ADC | 類比數位轉換器 | Converts a voltage into a number |
| Resolution | 解析度 | The smallest step an ADC can distinguish |
| Reference voltage | 參考電壓 | What an ADC compares against. Its accuracy limit |
| PWM | 脈寬調變 | Switching rapidly and varying the on-time to control average power |
| Debounce | 消抖 | Ignoring a switch's multiple contact transitions |
| State machine | 狀態機 | A system that is in one defined state and moves between them on events |
| Watchdog | 看門狗計時器 | A timer that resets the chip if the software stops responding |
| Blocking | 阻塞 | Code that stops everything else while it waits. `delay()` |
| Non-blocking | 非阻塞 | Code that checks the clock and returns, so other work continues |
| Firmware | 韌體 | The program running on a microcontroller |
| Fail-safe | 故障安全 | Failing to a state that causes no harm |
| Power-up state | 開機狀態 | What the device does when power is first applied |

---

## H. Sensors and actuators

| English | 繁體中文 | What it means |
| --- | --- | --- |
| Sensor | 感測器 | A device reporting one physical quantity as a signal |
| Actuator | 致動器 | A device that acts on the physical world |
| Limit switch | 限位開關 | A mechanical switch at the end of travel |
| Reed switch | 磁簧開關 | A magnetically operated sealed contact |
| Normally closed | 常閉 | The contact is closed when at rest. A cut cable reads as a fault |
| Normally open | 常開 | The contact is open when at rest. A cut cable reads as safe |
| Encoder | 編碼器 | Reports rotation as pulses. Incremental unless stated otherwise |
| Homing | 歸零 | Moving to a known reference position after power-up |
| Hall effect | 霍爾效應 | Detecting a magnetic field without contact |
| Solenoid | 電磁鐵 | A coil producing a short linear pull. Often duty-cycle rated |
| Peak and hold | 峰值保持 | Full power to pull in, reduced power to hold. Keeps a solenoid cool |
| Servo | 伺服機 | Commanded position with internal feedback. Limited travel |
| Stepper | 步進馬達 | Moves in fixed steps. Precise, and loses steps silently under load |
| Backlash | 齒隙 | Lost motion in a gear train when reversing |
| Duty cycle rating | 工作週期額定 | The proportion of time a device may be energised |

---

## I. Safety and practice

| English | 繁體中文 | What it means |
| --- | --- | --- |
| Emergency stop | 緊急停止 | Latching, normally closed, acting on the power source. Not a switch painted red |
| Dual channel | 雙通道 | Two independent contacts, monitored for disagreement |
| Safety relay | 安全繼電器 | Monitors two channels and refuses to reset if they disagree |
| Interlock | 連鎖裝置 | Prevents a hazard while a guard is open or a condition is unmet |
| Defeated interlock | 失效連鎖 | An interlock bypassed. A stop-work event, always |
| Lock-out tag-out | 上鎖掛牌 | Locking an isolator with your own lock and labelling it |
| Isolation | 隔離 | Removing an electrical connection between two parts of a system |
| Galvanic isolation | 電氣隔離 | No conductive path at all, as through a transformer or optocoupler |
| Let-go threshold | 擺脫閾值 | About 10 mA, above which the hand cannot release |
| Protective earth | 保護接地 | The conductor that makes a fault big enough to trip the protection |
| Double insulation | 雙重絕緣 | Protection by having no exposed conductive parts |
| CAT rating | 量測類別 | A meter's rating for the transient energy it can survive |
| Half-split | 二分法 | Testing at the midpoint to halve the search each time |
| Boundary | 故障邊界 | The line between what works and what does not. Where the fault is |
| Root cause | 根本原因 | The reason a fault occurred, not just what failed |
| Strain relief | 應力消除 | A clamp on the cable jacket so flexing never reaches the joints |
| Cold joint | 冷焊 | A joint that did not reach temperature. Dull, and intermittent |
| Wetting | 潤濕 | Solder flowing onto and bonding with clean hot metal |
| Flux | 助焊劑 | Removes oxide so solder can wet the surface |

---

## J. Connectors

| English | 繁體中文 | What it means |
| --- | --- | --- |
| XLR, 3-pin | 三芯卡農頭 | Balanced analogue audio. Pin 1 screen, 2 hot, 3 cold |
| XLR, 5-pin | 五芯卡農頭 | DMX512. Deliberately different from audio so the two cannot be mixed |
| Speakon | 喇叭插頭 | Loudspeaker level. Locking, high current, no exposed conductors |
| powerCON | 電源鎖定接頭 | Locking mains connector for equipment |
| TRUE1 | TRUE1 電源接頭 | A powerCON variant that may be connected and disconnected under load |
| IEC C13, C14 | IEC 電源接頭 | The universal kettle-lead mains connector. Not locking |
| CEE form | 工業插頭 | IP-rated mains distribution connectors, colour coded by voltage |
| Socapex | Socapex 多芯接頭 | 19 pins carrying six dimmer circuits in one cable |
| RJ45 | 網路接頭 | Network. T568B ordering is the industry convention |
| etherCON | etherCON 網路接頭 | RJ45 in a locking metal shell |
| Phoenix, terminal block | 端子台 | Screw or spring field wiring. Serviceable, needs checking |
| Strain relief clamp | 固定夾 | Grips the cable jacket, never the conductors |
