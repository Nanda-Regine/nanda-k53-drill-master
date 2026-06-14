import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../theme.js';
import { sfx } from '../utils/sounds.js';
import { hapticCorrect, hapticWrong, hapticPass } from '../utils/haptics.js';
import { recordGameAnswer } from '../utils/masteryStore.js';

// ── All questions from the 56 K53 LMV modules (lmv-eng1 + lmv-eng2)
// Every question is verified against official DLTC documentation
const ALL_QUESTIONS = [

  // ── CATEGORY: signals ────────────────────────────────────────────────────
  {
    cat: 'signals',
    q: 'You want to change lanes to the right. What is the FIRST thing you must do?',
    correct: 'Check your interior mirror',
    options: ['Check your interior mirror', 'Signal to the right', 'Check the blind spot', 'Move to the right'],
    explanation: 'The lane-change sequence is: Mirror (interior) → Check blind spot → Signal → Check blind spot again → Steer if safe → Cancel signal. Mirror FIRST.',
  },
  {
    cat: 'signals',
    q: 'When changing lanes, after you have checked your mirror and checked the blind spot, what is the NEXT step?',
    correct: 'Signal',
    options: ['Signal', 'Steer into the new lane', 'Check the blind spot again', 'Accelerate'],
    explanation: 'Full lane-change sequence: Mirror → Blind spot → SIGNAL → Blind spot check again → Steer if safe → Cancel signal.',
  },
  {
    cat: 'signals',
    q: 'You want to turn right at an intersection. What must you do BEFORE signalling?',
    correct: 'Check the interior mirror',
    options: ['Check the interior mirror', 'Check the blind spot', 'Slow down', 'Move to the right lane'],
    explanation: 'The sequence for turning is always: Mirror (interior) first — to know what is behind you — THEN signal, THEN manoeuvre.',
  },
  {
    cat: 'signals',
    q: 'After signalling to turn left, what must you check before actually turning?',
    correct: 'The left blind spot',
    options: ['The left blind spot', 'The interior mirror again', 'Traffic lights ahead', 'Whether your signal is cancelled'],
    explanation: 'After mirror + signal, you check the blind spot to make sure no cyclist or vehicle is in your intended path before you commit to the turn.',
  },
  {
    cat: 'signals',
    q: 'When must you cancel your signal after turning?',
    correct: 'Immediately after completing the turn',
    options: ['Immediately after completing the turn', 'Before starting the turn', 'Only if it does not cancel automatically', 'When you reach the speed limit'],
    explanation: 'Cancel the signal as soon as you have completed the turn. A signal left on after a turn misleads other road users.',
  },
  {
    cat: 'signals',
    q: 'You are about to move off from a parked position. What is the sequence of actions?',
    correct: 'Signal → Check blind spot → Move off when safe',
    options: [
      'Signal → Check blind spot → Move off when safe',
      'Move off → Signal → Check blind spot',
      'Check blind spot → Move off → Signal',
      'Signal → Move off immediately',
    ],
    explanation: 'Before moving off from a stationary position: Signal your intention, then check the blind spot for approaching traffic, then move off only when safe.',
  },
  {
    cat: 'signals',
    q: 'How must you communicate to the driver behind you that you are going to slow down?',
    correct: 'Use the brake lights (press the brake pedal gently first)',
    options: [
      'Use the brake lights (press the brake pedal gently first)',
      'Use the hazard lights',
      'Use the hooter',
      'Signal left and slow down',
    ],
    explanation: 'Your brake lights warn following drivers. Pressing the brake lightly before stopping hard gives drivers behind more reaction time.',
  },
  {
    cat: 'signals',
    q: 'A traffic officer is standing at an intersection facing you with one arm extended sideways. What does this mean?',
    correct: 'Stop — you must not proceed',
    options: [
      'Stop — you must not proceed',
      'Slow down and proceed with caution',
      'You may proceed straight through',
      'Yield to oncoming traffic',
    ],
    explanation: 'An officer facing you with arm extended to the side is giving the STOP signal to traffic approaching from your direction. You must stop and wait.',
  },
  {
    cat: 'signals',
    q: 'A scholar patrol officer raises both hands and steps onto the road. What must you do?',
    correct: 'Stop immediately and allow children to cross',
    options: [
      'Stop immediately and allow children to cross',
      'Slow down and proceed carefully',
      'Hoot to warn the children',
      'Only stop if children are already on the road',
    ],
    explanation: 'Scholar patrol officers have the same authority as traffic officers. When they display a Stop signal, all traffic must stop until released.',
  },

  // ── CATEGORY: intersections ────────────────────────────────────────────
  {
    cat: 'intersections',
    q: 'You arrive at a stop sign. The road is completely clear. What must you do?',
    correct: 'Come to a complete stop, then proceed when safe',
    options: [
      'Come to a complete stop, then proceed when safe',
      'Slow down significantly and proceed if clear',
      'Stop only if there is other traffic',
      'Yield to traffic and stop only if necessary',
    ],
    explanation: 'A stop sign requires a COMPLETE stop every time — even if the road appears clear. This is a legal requirement, not optional.',
  },
  {
    cat: 'intersections',
    q: 'At an uncontrolled intersection (no signs or lights), two vehicles arrive simultaneously. Who has right of way?',
    correct: 'The vehicle on the RIGHT',
    options: [
      'The vehicle on the RIGHT',
      'The vehicle on the LEFT',
      'The larger vehicle',
      'The vehicle going straight',
    ],
    explanation: 'At an uncontrolled intersection with simultaneous arrival, you must yield to the vehicle on YOUR RIGHT. This is the standard SA right-of-way rule.',
  },
  {
    cat: 'intersections',
    q: 'You are at a yield sign. There is traffic on the road you are entering. What must you do?',
    correct: 'Stop and wait until traffic is clear, then proceed',
    options: [
      'Stop and wait until traffic is clear, then proceed',
      'Slow down but proceed if there is a gap',
      'Yield means slow down only — you never need to fully stop',
      'Stop only if an accident is likely',
    ],
    explanation: 'A yield sign means give way to traffic on the intersecting road. If traffic is present, you MUST stop before the yield line. You may proceed only when it is safe.',
  },
  {
    cat: 'intersections',
    q: 'You are turning LEFT at a stop sign. What is the correct order of checks after stopping?',
    correct: 'Look right, then left, then right again',
    options: [
      'Look right, then left, then right again',
      'Look left, then right',
      'Look ahead, then left, then right',
      'Look right only — you are turning that way',
    ],
    explanation: 'When turning left, the immediate threat is traffic from the RIGHT (coming towards you). You look right first, then left (for pedestrians), then right again before turning.',
  },
  {
    cat: 'intersections',
    q: 'You are turning RIGHT at a stop sign. You have stopped. Oncoming traffic is still coming. What must you do?',
    correct: 'Wait at the stop line until a safe gap appears in oncoming traffic',
    options: [
      'Wait at the stop line until a safe gap appears in oncoming traffic',
      'Move forward into the intersection to signal your intention',
      'Proceed slowly — oncoming traffic will give way',
      'Turn immediately if you have been waiting more than 10 seconds',
    ],
    explanation: 'When turning right, you must wait for a safe gap in BOTH oncoming traffic AND crossing traffic before turning. Never rush a right turn.',
  },
  {
    cat: 'intersections',
    q: 'At a yield sign, what does the broken white line across the road mean?',
    correct: 'Stop before this line if you need to yield to traffic',
    options: [
      'Stop before this line if you need to yield to traffic',
      'You may cross this line without stopping',
      'The road ahead is closed',
      'You must always stop at this line',
    ],
    explanation: 'The yield line (broken white line) is the point where you must stop if traffic prevents you from proceeding. Unlike a stop line, you only stop if necessary.',
  },
  {
    cat: 'intersections',
    q: 'What does a FLASHING RED traffic light mean?',
    correct: 'Treat it exactly like a stop sign — stop and proceed when safe',
    options: [
      'Treat it exactly like a stop sign — stop and proceed when safe',
      'Slow down and yield to cross traffic',
      'The traffic light is broken — treat as uncontrolled',
      'Proceed with caution — flashing means go carefully',
    ],
    explanation: 'Flashing red = Stop sign. You must come to a complete stop, then proceed only when it is safe. This is NOT the same as flashing amber.',
  },
  {
    cat: 'intersections',
    q: 'What does a FLASHING AMBER traffic light mean?',
    correct: 'Treat it as an uncontrolled intersection — yield to the right',
    options: [
      'Treat it as an uncontrolled intersection — yield to the right',
      'Stop and wait for the light to change',
      'Treat it as a stop sign',
      'Proceed immediately — amber means caution',
    ],
    explanation: 'Flashing amber means the traffic light is not fully operational. Treat the intersection as uncontrolled — yield to the vehicle on your RIGHT.',
  },
  {
    cat: 'intersections',
    q: 'A traffic light shows a STEADY AMBER light. What must you do?',
    correct: 'Stop, unless you are too close to the stop line to stop safely',
    options: [
      'Stop, unless you are too close to the stop line to stop safely',
      'Speed up to get through before it turns red',
      'Slow down and proceed with caution',
      'Always stop — steady amber means stop',
    ],
    explanation: 'Steady amber means STOP if you can do so safely. If you are already too close to the line to stop safely, you may proceed — but you must not speed up.',
  },
  {
    cat: 'intersections',
    q: 'A traffic light shows GREEN. May you proceed immediately?',
    correct: 'No — you must first check that the intersection is clear',
    options: [
      'No — you must first check that the intersection is clear',
      'Yes — green means go immediately',
      'Yes, but only if you are in the first vehicle',
      'No — you must wait for the green arrow',
    ],
    explanation: 'Green does NOT mean proceed without checking. You must still check that the intersection is clear before moving. Other drivers may still be in the intersection from the previous light cycle.',
  },
  {
    cat: 'intersections',
    q: 'A traffic light shows a FLASHING GREEN ARROW pointing right. What does this mean?',
    correct: 'You may proceed in the direction of the arrow only — turn right',
    options: [
      'You may proceed in the direction of the arrow only — turn right',
      'You may proceed in any direction',
      'You must slow down before turning right',
      'Green arrow means yield to oncoming traffic and turn right',
    ],
    explanation: 'A flashing green arrow is a filter arrow — you may ONLY proceed in the direction it points (right). Oncoming traffic still has a red light, so you may turn without waiting for a gap.',
  },
  {
    cat: 'intersections',
    q: 'At a TRAFFIC CIRCLE (roundabout), to whom must you yield?',
    correct: 'Traffic already travelling in the circle',
    options: [
      'Traffic already travelling in the circle',
      'Traffic coming from the right outside the circle',
      'Traffic coming from the left',
      'No one — you proceed when there is space',
    ],
    explanation: 'At a full traffic circle, you must yield to vehicles already circulating inside the circle. The R2.2 yield sign confirms this. Travel anti-clockwise.',
  },
  {
    cat: 'intersections',
    q: 'At a MINI-TRAFFIC CIRCLE, two vehicles arrive simultaneously. What is the rule?',
    correct: 'Yield to the vehicle on your RIGHT (the one crossing first)',
    options: [
      'Yield to the vehicle on your RIGHT (the one crossing first)',
      'Yield to the vehicle on your left',
      'Both vehicles stop and the larger one goes first',
      'The vehicle going straight has priority',
    ],
    explanation: 'At a mini-circle, the rule is different from a full roundabout. With simultaneous arrival, yield to the vehicle on your RIGHT — the same rule as an uncontrolled intersection.',
  },
  {
    cat: 'intersections',
    q: 'In which direction must you travel around a traffic circle or roundabout?',
    correct: 'Anti-clockwise (counter-clockwise)',
    options: [
      'Anti-clockwise (counter-clockwise)',
      'Clockwise',
      'The direction with the least traffic',
      'Either direction, as long as you are careful',
    ],
    explanation: 'In South Africa, vehicles travel on the LEFT side of the road. Traffic circles are therefore traversed anti-clockwise. This keeps traffic flowing in an orderly direction.',
  },

  // ── CATEGORY: overtaking ───────────────────────────────────────────────
  {
    cat: 'overtaking',
    q: 'You want to overtake a vehicle on its right. What is the FIRST thing you must do?',
    correct: 'Check the interior mirror',
    options: [
      'Check the interior mirror',
      'Check the right blind spot',
      'Signal right',
      'Increase speed to assess the gap',
    ],
    explanation: 'Overtaking sequence: Mirror (interior) → Check right blind spot → Signal right → Check right blind spot again → Move right when safe → Accelerate → Mirror (interior) → Signal left → Check left blind spot → Move left when safe → Cancel signal.',
  },
  {
    cat: 'overtaking',
    q: 'You are being overtaken on the RIGHT by another vehicle. What must you NOT do?',
    correct: 'Accelerate',
    options: [
      'Accelerate',
      'Keep left',
      'Maintain your speed',
      'Move slightly left if there is room',
    ],
    explanation: 'It is a violation of traffic law to accelerate when being overtaken on a two-way road. You must maintain or reduce your speed to allow the overtaking vehicle to complete the manoeuvre safely.',
  },
  {
    cat: 'overtaking',
    q: 'A vehicle is overtaking you on the LEFT. What must you do?',
    correct: 'Do not accelerate, and maintain a steady course',
    options: [
      'Do not accelerate, and maintain a steady course',
      'Immediately stop and let the vehicle pass',
      'Move right to give the overtaking vehicle more room',
      'Speed up to close the gap ahead',
    ],
    explanation: 'Being overtaken on the left is illegal for the other driver, but YOU must still not accelerate. Maintain your position and speed to avoid a collision.',
  },
  {
    cat: 'overtaking',
    q: 'When overtaking, after you have passed the vehicle and want to return to the left lane, what must you check FIRST?',
    correct: 'The interior mirror',
    options: [
      'The interior mirror',
      'The left blind spot',
      'The road ahead',
      'The right mirror only',
    ],
    explanation: 'When returning to the left lane after overtaking: Mirror (interior) → Signal left → Check left blind spot → Move left when safe (and when you can see the overtaken vehicle in your interior mirror) → Cancel signal.',
  },
  {
    cat: 'overtaking',
    q: 'You may NOT overtake when:',
    correct: 'There is a solid white barrier line on your side of the road',
    options: [
      'There is a solid white barrier line on your side of the road',
      'The vehicle ahead is travelling below the speed limit',
      'You are on a national road',
      'The road ahead is straight',
    ],
    explanation: 'A solid (no-overtaking) barrier line on YOUR side of the road means you may not cross it to overtake. A broken line on your side = you may overtake when safe.',
  },

  // ── CATEGORY: speed ────────────────────────────────────────────────────
  {
    cat: 'speed',
    q: 'What is the general speed limit inside an urban area?',
    correct: '60 km/h',
    options: ['60 km/h', '80 km/h', '100 km/h', '120 km/h'],
    explanation: 'The default speed limit in an urban area (town or city) is 60 km/h. This applies unless a lower speed limit sign is displayed.',
  },
  {
    cat: 'speed',
    q: 'What is the general speed limit on a freeway (highway)?',
    correct: '120 km/h',
    options: ['120 km/h', '100 km/h', '110 km/h', '140 km/h'],
    explanation: 'The default maximum speed on a freeway is 120 km/h. This is for light motor vehicles. Heavy vehicles and vehicles with trailers have lower limits.',
  },
  {
    cat: 'speed',
    q: 'What is the general speed limit on a public road OUTSIDE an urban area (not a freeway)?',
    correct: '100 km/h',
    options: ['100 km/h', '80 km/h', '120 km/h', '60 km/h'],
    explanation: 'Outside urban areas on ordinary roads (not freeways), the default speed limit is 100 km/h unless a lower limit is posted.',
  },
  {
    cat: 'speed',
    q: 'What is the MINIMUM following distance you must maintain behind another vehicle under NORMAL conditions?',
    correct: '2 seconds',
    options: ['2 seconds', '3 seconds', '1 second', '4 seconds'],
    explanation: 'The minimum following distance under normal conditions is 2 seconds. Use the 2-second rule: when the vehicle ahead passes a fixed point, you should not pass that point for at least 2 seconds.',
  },
  {
    cat: 'speed',
    q: 'What following distance should you maintain in adverse conditions (rain, fog, reduced visibility)?',
    correct: '3 seconds or more',
    options: ['3 seconds or more', '2 seconds', '4 seconds exactly', '10 metres per 10 km/h of speed'],
    explanation: 'In adverse conditions, increase your following distance to at least 3 seconds. Wet roads dramatically increase stopping distances — your tyres have less grip.',
  },
  {
    cat: 'speed',
    q: 'How far ahead must your DIPPED headlights illuminate the road?',
    correct: '45 metres',
    options: ['45 metres', '100 metres', '30 metres', '60 metres'],
    explanation: 'Dipped (low) beams must illuminate the road for at least 45 metres ahead. You must be able to stop within the lit distance.',
  },
  {
    cat: 'speed',
    q: 'How far ahead must your MAIN (full/bright) headlights illuminate the road?',
    correct: '100 metres',
    options: ['100 metres', '45 metres', '120 metres', '150 metres'],
    explanation: 'Main beam (full/high beam) headlights must illuminate at least 100 metres ahead. You must be able to stop within 100 m, hence the higher speed limit at night with main beam.',
  },
  {
    cat: 'speed',
    q: 'At what minimum distance must your hooter (horn) be audible?',
    correct: '90 metres',
    options: ['90 metres', '45 metres', '100 metres', '60 metres'],
    explanation: 'Your vehicle\'s hooter must be audible from at least 90 metres away. A hooter that cannot be heard at this range is defective and a vehicle defect.',
  },

  // ── CATEGORY: parking ──────────────────────────────────────────────────
  {
    cat: 'parking',
    q: 'How far from an INTERSECTION may you not park your vehicle?',
    correct: '5 metres',
    options: ['5 metres', '9 metres', '1.5 metres', '3 metres'],
    explanation: 'You may not park within 5 metres of an intersection. This clearance ensures vehicles can see around corners and turn safely.',
  },
  {
    cat: 'parking',
    q: 'How far from a PEDESTRIAN CROSSING may you not park?',
    correct: '9 metres',
    options: ['9 metres', '5 metres', '1.5 metres', '3 metres'],
    explanation: 'You may not park within 9 metres of a pedestrian crossing. This keeps the crossing visible to both pedestrians and drivers.',
  },
  {
    cat: 'parking',
    q: 'How far from a FIRE HYDRANT may you not park?',
    correct: '1.5 metres',
    options: ['1.5 metres', '3 metres', '5 metres', '9 metres'],
    explanation: 'You may not park within 1.5 metres of a fire hydrant. Emergency services must have immediate access to hydrants.',
  },
  {
    cat: 'parking',
    q: 'You are parking on a hill facing downhill in a manual vehicle. Which way must you turn your front wheels?',
    correct: 'Turn wheels to the LEFT (towards the kerb)',
    options: [
      'Turn wheels to the LEFT (towards the kerb)',
      'Turn wheels to the RIGHT',
      'Leave wheels straight',
      'It does not matter if the handbrake is on',
    ],
    explanation: 'When parked facing downhill, turn wheels LEFT so the tyre rests against the kerb. If the brakes fail, the vehicle rolls into the kerb (not into traffic). Facing uphill: wheels RIGHT (away from kerb).',
  },
  {
    cat: 'parking',
    q: 'How far behind your vehicle must you place an emergency triangle if you break down on the road?',
    correct: 'At least 45 metres',
    options: ['At least 45 metres', 'At least 30 metres', 'At least 100 metres', 'At least 20 metres'],
    explanation: 'An emergency warning triangle must be placed at least 45 metres behind your broken-down vehicle to give following traffic sufficient warning time.',
  },

  // ── CATEGORY: level crossings ──────────────────────────────────────────
  {
    cat: 'crossings',
    q: 'You arrive at an UNGUARDED level crossing (no boom gates). What must you do?',
    correct: 'Slow down, look both ways, stop if a train is approaching, and cross only when safe',
    options: [
      'Slow down, look both ways, stop if a train is approaching, and cross only when safe',
      'Stop completely every time, regardless of whether a train is visible',
      'Slow down and proceed if no train is visible',
      'Flash headlights and proceed quickly',
    ],
    explanation: 'At an unguarded level crossing you must slow down, look both ways for trains, and stop if a train is approaching. Never assume it is safe — trains move faster than they appear.',
  },
  {
    cat: 'crossings',
    q: 'At an unguarded level crossing, how far from the NEAREST RAIL must you stop?',
    correct: 'At least 5 metres',
    options: ['At least 5 metres', 'At least 2 metres', 'At least 10 metres', 'At least 1 metre'],
    explanation: 'You must stop at least 5 metres from the nearest rail at an unguarded level crossing. This distance ensures your vehicle is completely clear of the track.',
  },
  {
    cat: 'crossings',
    q: 'At a GUARDED level crossing, the boom is rising. What must you do?',
    correct: 'Wait until the boom is fully up, then check both ways before crossing',
    options: [
      'Wait until the boom is fully up, then check both ways before crossing',
      'Proceed immediately when the boom starts to rise',
      'Proceed as soon as the flashing lights stop',
      'Check both ways and proceed before the boom is fully up to save time',
    ],
    explanation: 'Even at a guarded crossing, always wait for the boom to be fully raised AND check both ways before crossing. A second train may be coming from the opposite direction.',
  },
  {
    cat: 'crossings',
    q: 'You are already on the level crossing and a train appears. What must you do?',
    correct: 'Drive off the crossing immediately — do not stop on the tracks',
    options: [
      'Drive off the crossing immediately — do not stop on the tracks',
      'Stop in the middle and wait for the train to pass',
      'Reverse off the crossing',
      'Hoot repeatedly and stay in your vehicle',
    ],
    explanation: 'If you are already on the crossing and a train appears, you must immediately drive clear of the tracks. If you cannot move forward, reverse off. NEVER stop on the tracks.',
  },
  {
    cat: 'crossings',
    q: 'What must you do at a PEDESTRIAN CROSSING that is not controlled by a traffic light?',
    correct: 'Slow down, look left and right, stop and give way if pedestrians are crossing or about to cross',
    options: [
      'Slow down, look left and right, stop and give way if pedestrians are crossing or about to cross',
      'Hoot and proceed if pedestrians are not yet on the road',
      'Proceed normally — pedestrians must wait for a gap',
      'Stop only if pedestrians are already on the crossing',
    ],
    explanation: 'At an uncontrolled pedestrian crossing, pedestrians have right of way. You must stop and yield to any pedestrian who is crossing OR is about to cross.',
  },

  // ── CATEGORY: freeways ─────────────────────────────────────────────────
  {
    cat: 'freeways',
    q: 'When ENTERING a freeway via an on-ramp, which blind spots must you check?',
    correct: 'Both the right AND the left blind spots',
    options: [
      'Both the right AND the left blind spots',
      'Only the right blind spot',
      'Only the interior mirror',
      'Only the right mirror',
    ],
    explanation: 'When entering a freeway you must check BOTH blind spots — right for traffic in the near lane, and left for any vehicle that may have already merged ahead of you. Freeway speeds make blind-spot checks critical.',
  },
  {
    cat: 'freeways',
    q: 'You are on a freeway and you see an on-ramp with a vehicle merging. What must you do?',
    correct: 'Check your blind spots and mirrors; move left or adjust speed to allow the merge if safe',
    options: [
      'Check your blind spots and mirrors; move left or adjust speed to allow the merge if safe',
      'Maintain speed and position — merging vehicles must yield',
      'Hoot to warn the merging vehicle',
      'Slow down and stop to allow the vehicle to merge',
    ],
    explanation: 'When passing an on-ramp, check blind spots for merging vehicles. While merging traffic must yield, the courteous and safe action is to allow space where possible by moving left or adjusting speed.',
  },
  {
    cat: 'freeways',
    q: 'When EXITING a freeway, what is the FIRST action?',
    correct: 'Check the interior mirror',
    options: [
      'Check the interior mirror',
      'Signal left',
      'Move to the left lane',
      'Reduce speed',
    ],
    explanation: 'Exiting sequence: Interior mirror → Signal left → Check left blind spot → Move to exit lane → Reduce speed on the off-ramp. Mirror is always the first step before any lane change.',
  },
  {
    cat: 'freeways',
    q: 'May you stop or park on a freeway?',
    correct: 'No — stopping and parking on a freeway is prohibited except in an emergency',
    options: [
      'No — stopping and parking on a freeway is prohibited except in an emergency',
      'Yes, in the left lane if necessary',
      'Yes, on the hard shoulder at any time',
      'Yes, but only if your hazard lights are on',
    ],
    explanation: 'You may not stop or park on a freeway unless it is an emergency. If you break down, move as far off the road as possible and place your emergency triangle at least 45 m behind the vehicle.',
  },
  {
    cat: 'freeways',
    q: 'What must you do on a freeway if pedestrians are prohibited and your vehicle breaks down?',
    correct: 'Pull off the road as far as possible, switch on hazard lights, place emergency triangle 45 m behind',
    options: [
      'Pull off the road as far as possible, switch on hazard lights, place emergency triangle 45 m behind',
      'Stop in the lane and hoot for help',
      'Walk to the nearest exit to get help',
      'Place the triangle 20 m behind on a freeway',
    ],
    explanation: 'On a freeway: pull well off the road, switch on hazard lights, and place your emergency triangle at least 45 m behind the vehicle to warn approaching traffic at high speed.',
  },

  // ── CATEGORY: pre-trip & starting ─────────────────────────────────────
  {
    cat: 'pretrip',
    q: 'What must you check on your tyres during a pre-trip inspection?',
    correct: 'Tyre pressure, tread depth, sidewall condition, and the spare tyre',
    options: [
      'Tyre pressure, tread depth, sidewall condition, and the spare tyre',
      'Tyre pressure only',
      'Tread depth and pressure only',
      'Only the spare tyre and whether the tyres are the same brand',
    ],
    explanation: 'A thorough pre-trip tyre inspection covers: pressure (correct inflation), tread depth (minimum 1mm legally, but more for safety), sidewall cracks or bulges, and the spare tyre condition and pressure.',
  },
  {
    cat: 'pretrip',
    q: 'Before starting a manual (manual transmission) vehicle, what must you do with the clutch?',
    correct: 'Press the clutch pedal fully to the floor',
    options: [
      'Press the clutch pedal fully to the floor',
      'Leave the clutch in the neutral position',
      'Hold the clutch halfway',
      'Press the brake and clutch together',
    ],
    explanation: 'In a manual vehicle, you must press the clutch fully before starting the engine. This disengages the gearbox so the starter motor only has to turn the engine, not the drivetrain.',
  },
  {
    cat: 'pretrip',
    q: 'After starting the engine of a manual vehicle, what do you check on the dashboard?',
    correct: 'Warning lights — especially oil pressure, temperature, and charging lights',
    options: [
      'Warning lights — especially oil pressure, temperature, and charging lights',
      'The speedometer only',
      'The fuel gauge only',
      'The odometer to record mileage',
    ],
    explanation: 'After starting the engine, check that warning lights extinguish as they should. Oil pressure light should go off immediately. If any warning light stays on, investigate before moving.',
  },
  {
    cat: 'pretrip',
    q: 'Why must you adjust your seat BEFORE starting a journey?',
    correct: 'To ensure you can reach all controls and see the road clearly — improper seat position reduces vehicle control',
    options: [
      'To ensure you can reach all controls and see the road clearly — improper seat position reduces vehicle control',
      'For comfort only',
      'To make room for passengers',
      'So the airbag deploys correctly',
    ],
    explanation: 'Seat position is a safety-critical adjustment. Your feet must reach the pedals fully, your arms should be slightly bent at the elbows, and your eyes should be above the centre of the steering wheel.',
  },
  {
    cat: 'pretrip',
    q: 'How must you adjust your mirrors before driving?',
    correct: 'Interior mirror: full rear window visible. Side mirrors: road behind and just the edge of your vehicle',
    options: [
      'Interior mirror: full rear window visible. Side mirrors: road behind and just the edge of your vehicle',
      'All mirrors: point straight down to see alongside the vehicle',
      'Interior mirror: sky only. Side mirrors: alongside vehicle',
      'Mirrors do not need adjustment if the previous driver set them',
    ],
    explanation: 'Correct mirror adjustment: Interior mirror shows full rear window. Each side mirror shows mostly the road behind and the lane beside you, with just a sliver of your own car\'s bodywork for reference.',
  },

  // ── CATEGORY: emergency & alcohol ─────────────────────────────────────
  {
    cat: 'emergency',
    q: 'At what SPEED RANGE is the Emergency Stop test performed in the K53 test?',
    correct: 'Between 20 and 40 km/h',
    options: ['Between 20 and 40 km/h', 'Between 40 and 60 km/h', 'At exactly 60 km/h', 'At any speed below 80 km/h'],
    explanation: 'The K53 emergency stop is conducted between 20 and 40 km/h. The examiner will instruct you to stop, and you must bring the vehicle to rest in the shortest distance possible while maintaining control.',
  },
  {
    cat: 'emergency',
    q: 'During an emergency stop, what must you keep on the steering wheel throughout?',
    correct: 'Both hands',
    options: ['Both hands', 'One hand only — the other uses the handbrake', 'One hand to change gear', 'Either hand'],
    explanation: 'During an emergency stop, BOTH hands must remain on the steering wheel at all times until the vehicle is completely stationary. This maintains steering control during heavy braking.',
  },
  {
    cat: 'emergency',
    q: 'In a manual vehicle doing an emergency stop, when do you press the clutch?',
    correct: 'Just before the vehicle comes to a complete stop (to prevent stalling)',
    options: [
      'Just before the vehicle comes to a complete stop (to prevent stalling)',
      'Immediately when the examiner says stop',
      'At the same time as the brakes',
      'Only after the vehicle has stopped',
    ],
    explanation: 'In an emergency stop on a manual vehicle: brake hard first, then press the clutch pedal just before the vehicle stalls (around 5–10 km/h). Braking before clutch gives maximum engine braking.',
  },
  {
    cat: 'emergency',
    q: 'What is the maximum blood alcohol concentration (BAC) for a NON-professional driver in South Africa?',
    correct: '0.05 grams per 100 ml of blood',
    options: ['0.05 grams per 100 ml of blood', '0.02 grams per 100 ml', '0.08 grams per 100 ml', '0.10 grams per 100 ml'],
    explanation: 'The legal BAC limit for non-professional drivers is 0.05 g/100ml. For professional drivers (PDP holders), it is 0.02 g/100ml. Both are offences if exceeded.',
  },
  {
    cat: 'emergency',
    q: 'What is the maximum blood alcohol concentration for a PROFESSIONAL driver (PDP holder)?',
    correct: '0.02 grams per 100 ml of blood',
    options: ['0.02 grams per 100 ml of blood', '0.05 grams per 100 ml', '0.00 (zero tolerance)', '0.08 grams per 100 ml'],
    explanation: 'Professional drivers — those holding a Professional Driving Permit (PDP) — have a stricter BAC limit of 0.02 g/100ml. This reflects the higher duty of care they owe to passengers and cargo.',
  },

  // ── CATEGORY: gear changing ────────────────────────────────────────────
  {
    cat: 'gears',
    q: 'When changing UP gears in a manual vehicle, what is the correct sequence?',
    correct: 'Ease off accelerator → Press clutch → Select gear → Release clutch → Press accelerator',
    options: [
      'Ease off accelerator → Press clutch → Select gear → Release clutch → Press accelerator',
      'Press clutch → Select gear → Release clutch → Accelerate',
      'Accelerate → Press clutch → Change gear',
      'Press clutch and accelerator together → Change gear',
    ],
    explanation: 'Gear change sequence: Ease off the accelerator (reduce engine load) → Depress clutch fully → Select the higher gear → Release clutch smoothly → Apply accelerator to match revs.',
  },
  {
    cat: 'gears',
    q: 'Before a steep descent, why must you select a lower gear?',
    correct: 'To use engine braking and avoid brake fade from overheating',
    options: [
      'To use engine braking and avoid brake fade from overheating',
      'To slow the vehicle down using the brakes only',
      'To improve fuel economy on the descent',
      'Lower gear is required by law on gradients above 5%',
    ],
    explanation: 'Engine braking (letting the engine resistance slow you down) prevents the brakes from overheating (brake fade). Always select the lower gear BEFORE the descent begins, not halfway down.',
  },
  {
    cat: 'gears',
    q: 'When is it correct to change DOWN to a lower gear?',
    correct: 'When you need to slow down, overtake, or before a steep gradient',
    options: [
      'When you need to slow down, overtake, or before a steep gradient',
      'Only when the engine is about to stall',
      'As soon as you release the accelerator',
      'Only in first gear for stopping',
    ],
    explanation: 'Downshifting provides engine braking and greater power when needed (for overtaking or climbing). Always match your gear to your speed and the road conditions ahead.',
  },

  // ── CATEGORY: moving off & incline ────────────────────────────────────
  {
    cat: 'moving',
    q: 'You are stopped on an uphill incline in a manual vehicle. What is the correct procedure to move off without rolling back?',
    correct: 'Apply handbrake → Find the clutch bite point → Release handbrake → Accelerate smoothly',
    options: [
      'Apply handbrake → Find the clutch bite point → Release handbrake → Accelerate smoothly',
      'Release brakes → Press clutch → Select gear → Move off',
      'Rev engine high → Release clutch quickly',
      'Move the gear to neutral, then re-engage first',
    ],
    explanation: 'Incline start: ensure handbrake is fully on, bring clutch to the bite point (engine note drops slightly), then smoothly release the handbrake while simultaneously applying more accelerator. This prevents rollback.',
  },
  {
    cat: 'moving',
    q: 'What is the purpose of the "clutch bite point" when moving off on an incline?',
    correct: 'The point where the engine starts to take load — the vehicle will not roll back from this point',
    options: [
      'The point where the engine starts to take load — the vehicle will not roll back from this point',
      'The point where the clutch is fully released',
      'The point where the gearbox changes from neutral to first',
      'The point where the engine produces maximum torque',
    ],
    explanation: 'The bite point is where the clutch plates begin to engage, transferring drive to the wheels. At this point, engine resistance prevents rollback. Release the handbrake here for a smooth incline start.',
  },

  // ── CATEGORY: parking manoeuvres ──────────────────────────────────────
  {
    cat: 'manoeuvres',
    q: 'During an alley docking manoeuvre (K53), how many reference points guide you into the bay?',
    correct: 'Two key reference points on the vehicle',
    options: [
      'Two key reference points on the vehicle',
      'One reference point — the centre of the bonnet',
      'Three reference points — front, rear, and side mirrors',
      'No fixed reference points — it is done by eye',
    ],
    explanation: 'Alley docking uses two reference points: one to start turning (usually when the rear of the vehicle aligns with the bay entrance) and one to straighten up (when the vehicle is parallel in the bay).',
  },
  {
    cat: 'manoeuvres',
    q: 'During a TURN IN THE ROAD (3-point turn), what is the maximum number of forward and reverse movements allowed?',
    correct: 'No fixed maximum — you use as many as needed to complete the turn safely',
    options: [
      'No fixed maximum — you use as many as needed to complete the turn safely',
      'Exactly 3 movements (forward, reverse, forward)',
      'Maximum 5 movements',
      'Only 1 forward and 1 reverse',
    ],
    explanation: 'While called a "3-point turn," the K53 test does not penalise you for using more movements if the road is narrow. What matters is safety: no wheelspin, no hitting kerbs, correct signal and observation.',
  },
  {
    cat: 'manoeuvres',
    q: 'During PARALLEL PARKING, what is the correct starting position relative to the parked vehicle ahead?',
    correct: 'Alongside the parked vehicle, with your rear axle aligned with their rear bumper',
    options: [
      'Alongside the parked vehicle, with your rear axle aligned with their rear bumper',
      'One vehicle length behind the parked vehicle',
      'Your front bumper aligned with their front bumper',
      'Half a metre behind the parked vehicle',
    ],
    explanation: 'The K53 reference point for starting parallel parking: pull alongside the parked vehicle so your vehicle\'s rear axle is level with their rear bumper. Then turn full lock left and reverse.',
  },

  // ── CATEGORY: gears (expanded) ────────────────────────────────────────────
  {
    cat: 'gears',
    q: 'You are driving uphill in 3rd gear and the engine starts to labour (struggle). What must you do?',
    correct: 'Change down to 2nd gear to give the engine more power',
    options: [
      'Change down to 2nd gear to give the engine more power',
      'Increase engine speed by pressing the accelerator harder in 3rd',
      'Clutch in and coast to the top',
      'Change up to 4th gear to reduce engine strain',
    ],
    explanation: 'A labouring engine lacks torque. Change DOWN to get more pulling power. Changing up when the engine is struggling causes excessive wear and may stall.',
  },
  {
    cat: 'gears',
    q: 'You are travelling at 20 km/h in 4th gear in slow traffic. What is wrong with this?',
    correct: 'The gear is too high for the speed — the engine will labour and could stall',
    options: [
      'The gear is too high for the speed — the engine will labour and could stall',
      'Nothing — any gear can be used at any speed',
      'Only wrong if the speedometer shows red',
      'Only a problem on diesel vehicles',
    ],
    explanation: 'Each gear has a speed range. At 20 km/h, 2nd gear is normally appropriate. Driving in too high a gear at low speed lugs the engine and causes premature wear.',
  },
  {
    cat: 'gears',
    q: 'When is it correct to skip a gear (e.g. change from 4th to 2nd without going through 3rd)?',
    correct: 'When overtaking or needing a significant power increase — block gear changes are acceptable',
    options: [
      'When overtaking or needing a significant power increase — block gear changes are acceptable',
      'Never — you must always change through every gear sequentially',
      'Only in reverse situations',
      'Only on automatic transmission vehicles',
    ],
    explanation: 'Block gear changes (skipping gears when downshifting) are acceptable in K53 and real driving when you need more power quickly — e.g. overtaking or emergency acceleration.',
  },
  {
    cat: 'gears',
    q: 'What does the term "bite point" refer to?',
    correct: 'The point where the clutch plates begin to engage and the engine load increases',
    options: [
      'The point where the clutch plates begin to engage and the engine load increases',
      'The maximum clutch pedal depression position',
      'The point where the handbrake is fully applied',
      'The first notch of the gear lever',
    ],
    explanation: 'The bite point is where the clutch begins to transmit drive. You feel it as a slight change in engine note and slight vehicle movement. Essential for hill starts.',
  },
  {
    cat: 'gears',
    q: 'You are approaching a bend. When must you change to a lower gear?',
    correct: 'Before entering the bend — never change gear while in the bend',
    options: [
      'Before entering the bend — never change gear while in the bend',
      'Halfway through the bend',
      'After the bend when you are straight again',
      'It does not matter when you change gear in a bend',
    ],
    explanation: 'Gear changes in a bend disturb weight balance and traction. Complete all braking and gear changes BEFORE the bend, then accelerate smoothly through and out.',
  },
  {
    cat: 'gears',
    q: 'On an automatic transmission vehicle, what does the "L" or "1" gear position do?',
    correct: 'Locks the transmission in low gear — used for engine braking on steep descents',
    options: [
      'Locks the transmission in low gear — used for engine braking on steep descents',
      'Allows the car to reverse in low speed',
      'Overrides the engine management system',
      'Provides maximum overdrive for fuel saving',
    ],
    explanation: 'On automatics, "L" or "1" prevents the gearbox from shifting up, giving continuous engine braking on steep hills. Prevents brake fade on long descents.',
  },
  {
    cat: 'gears',
    q: 'Why should you NOT leave a manual vehicle in first gear while stationary at a traffic light?',
    correct: 'Holding the clutch down wears the release bearing — select neutral and release the clutch',
    options: [
      'Holding the clutch down wears the release bearing — select neutral and release the clutch',
      'First gear damages the gearbox when stationary',
      'The vehicle will roll forward',
      'It is fine — this is the correct method for a quick departure',
    ],
    explanation: 'Holding the clutch pedal depressed for long periods wears the clutch release bearing. At a long stop, select neutral and release the clutch to protect the clutch.',
  },

  // ── CATEGORY: moving (expanded) ───────────────────────────────────────────
  {
    cat: 'moving',
    q: 'Before moving off from a parked position on the LEFT side of the road, your FIRST action is:',
    correct: 'Check the interior mirror',
    options: [
      'Check the interior mirror',
      'Signal to the right',
      'Check the right blind spot',
      'Start the engine',
    ],
    explanation: 'Full move-off sequence: Interior mirror → Signal right → Right blind spot → Move off when safe → Cancel signal. Mirror ALWAYS first.',
  },
  {
    cat: 'moving',
    q: 'When moving off facing downhill, what must you do before releasing the handbrake?',
    correct: 'Engage 1st gear (or select D for automatic) and be ready to control speed with the footbrake',
    options: [
      'Engage 1st gear (or select D for automatic) and be ready to control speed with the footbrake',
      'Rev the engine high to overcome gravity',
      'Leave in neutral and let the vehicle roll',
      'Apply the footbrake and simultaneously release the handbrake without engaging a gear',
    ],
    explanation: 'Facing downhill: engage 1st (or Drive). You will roll forward anyway, so 1st gear gives you engine control. Footbrake controls speed as you release the handbrake.',
  },
  {
    cat: 'moving',
    q: 'On a hill start (uphill), the vehicle starts rolling backward before you move off. What went wrong?',
    correct: 'You released the handbrake before reaching the bite point — always find bite point first',
    options: [
      'You released the handbrake before reaching the bite point — always find bite point first',
      'You used too much revs',
      'The tyres were wet',
      'Normal — all vehicles roll back slightly on a hill start',
    ],
    explanation: 'Roll-back means you released the handbrake too early. The sequence: Clutch in → 1st gear → Find bite point → Add enough revs → THEN release handbrake smoothly.',
  },
  {
    cat: 'moving',
    q: 'You are about to move off and a cyclist is approaching in the left lane. You must:',
    correct: 'Wait until the cyclist has passed before moving off',
    options: [
      'Wait until the cyclist has passed before moving off',
      'Move off slowly — the cyclist will go around you',
      'Hoot to warn the cyclist and move off',
      'Move off quickly to get out of the cyclist\'s path'],
    explanation: 'Cyclists have right of way over a stationary vehicle moving off. Always check the blind spot for cyclists before moving. Wait until it is safe.',
  },
  {
    cat: 'moving',
    q: 'When approaching a STOP sign to turn right, and there is traffic from both left and right, who do you yield to FIRST?',
    correct: 'Traffic from the RIGHT — they have priority at an uncontrolled crossing',
    options: [
      'Traffic from the RIGHT — they have priority at an uncontrolled crossing',
      'Traffic from the LEFT',
      'You may proceed when either side is clear',
      'Oncoming traffic always has priority over traffic from the right'],
    explanation: 'After stopping, yield to traffic on the road you are entering. At an uncontrolled crossing yield RIGHT first. Then check left and proceed when safe to cross both lanes.',
  },

  // ── CATEGORY: weather ─────────────────────────────────────────────────────
  {
    cat: 'weather',
    q: 'In heavy rain, you switch on your headlights. This is because:',
    correct: 'Headlights make your vehicle more visible to others in poor visibility — not just to see ahead',
    options: [
      'Headlights make your vehicle more visible to others in poor visibility — not just to see ahead',
      'It is required by law whenever it rains',
      'They improve your ability to see through rain',
      'They activate the rain sensor on wipers',
    ],
    explanation: 'In rain, low beams make you visible to others. This is more important than illuminating the road. SA law requires lights when visibility is poor.',
  },
  {
    cat: 'weather',
    q: 'Aquaplaning occurs when your tyres ride on a film of water. To regain control you must:',
    correct: 'Ease off the accelerator gently and hold the steering straight — do NOT brake hard',
    options: [
      'Ease off the accelerator gently and hold the steering straight — do NOT brake hard',
      'Brake hard and steer into a skid',
      'Accelerate to break through the water film',
      'Turn the steering wheel toward the slide'],
    explanation: 'Aquaplaning: lift off throttle, hold straight. Hard braking or sharp steering while floating causes a spin. Allow speed to reduce until tyres regain contact.',
  },
  {
    cat: 'weather',
    q: 'You are driving in thick fog. You should use:',
    correct: 'Dipped headlights and fog lights if fitted — high beam reflects off fog and makes it worse',
    options: [
      'Dipped headlights and fog lights if fitted — high beam reflects off fog and makes it worse',
      'High beam for maximum illumination',
      'Hazard lights only to warn others',
      'No lights — they reduce contrast'],
    explanation: 'High beam in fog creates a "white wall" effect by reflecting off water droplets. Use dipped headlights + fog lights. Increase following distance and reduce speed significantly.',
  },
  {
    cat: 'weather',
    q: 'Strong crosswinds are most dangerous when you are:',
    correct: 'Emerging from behind a windbreak (building, hedge) into an exposed gap — the gust hits suddenly',
    options: [
      'Emerging from behind a windbreak (building, hedge) into an exposed gap — the gust hits suddenly',
      'On a straight road with consistent wind',
      'At low speed',
      'Driving a low vehicle like a sports car'],
    explanation: 'Crosswind danger is worst at gaps in windbreaks (bridges, open fields) where you go from sheltered to fully exposed instantly. High-sided vehicles and empty trucks are most vulnerable.',
  },
  {
    cat: 'weather',
    q: 'Driving on a flooded road (drift/ford): when is it safe to cross?',
    correct: 'Only if the water is slow-moving and less than the bottom of the door — if in doubt, do NOT cross',
    options: [
      'Only if the water is slow-moving and less than the bottom of the door — if in doubt, do NOT cross',
      'Any depth is fine in a 4x4',
      'Safe if other cars have crossed recently',
      'Safe when the water is below the bumper'],
    explanation: 'Moving water 30 cm deep can move a car. Engine depth for most vehicles = 30–50 cm. Electrical systems fail in water. "Turn around, don\'t drown" — never drive into flooded roads.',
  },

  // ── CATEGORY: night ───────────────────────────────────────────────────────
  {
    cat: 'night',
    q: 'At night, you see an oncoming vehicle on high beam. You should:',
    correct: 'Flash once to signal them to dip, then look to the LEFT edge of your lane — not at the lights',
    options: [
      'Flash once to signal them to dip, then look to the LEFT edge of your lane — not at the lights',
      'Switch to high beam to make them dip faster',
      'Stop until they pass',
      'Close your eyes briefly'],
    explanation: 'Looking at oncoming headlights causes temporary blindness. Look to the LEFT verge as a reference line. Flash once to signal them — do NOT retaliate with your own high beam.',
  },
  {
    cat: 'night',
    q: 'At night your stopping distance increases because:',
    correct: 'You can only see as far as your headlights illuminate — your reaction + braking distance may exceed visibility',
    options: [
      'You can only see as far as your headlights illuminate — your reaction + braking distance may exceed visibility',
      'Roads are wetter at night',
      'Tyres lose traction in the dark',
      'You drive faster at night'],
    explanation: 'At 100 km/h, your dipped beams illuminate about 45 m. Your stopping distance is ~67 m. You are "overdriving your headlights" — if anything appears you cannot stop in time.',
  },
  {
    cat: 'night',
    q: 'When you want to park at night on a road with no streetlights, you must:',
    correct: 'Leave your parking lights (sidelights) on to make the vehicle visible to other road users',
    options: [
      'Leave your parking lights (sidelights) on to make the vehicle visible to other road users',
      'Leave your headlights on full beam',
      'No lights are needed if you are off the road',
      'Leave your hazard lights flashing'],
    explanation: 'Parking lights are designed exactly for this: marking a parked vehicle in low-visibility conditions. Full beam would dazzle; hazards imply a breakdown. Parking lights are correct.',
  },
  {
    cat: 'night',
    q: 'When must you switch from high beam to dipped beam?',
    correct: 'When within 150 m of an oncoming vehicle AND when following another vehicle within 150 m',
    options: [
      'When within 150 m of an oncoming vehicle AND when following another vehicle within 150 m',
      'Only when approaching oncoming vehicles',
      'When within 100 m of any vehicle',
      'Only in built-up areas with street lighting'],
    explanation: 'SA law requires dipped beams within 150 m of oncoming traffic AND within 150 m of vehicles ahead (following). High beam from behind is as dangerous as from the front.',
  },

  // ── CATEGORY: fatigue ─────────────────────────────────────────────────────
  {
    cat: 'fatigue',
    q: 'The ONLY safe response to driver fatigue on a long trip is:',
    correct: 'Stop in a safe place and sleep — coffee and loud music delay fatigue temporarily but do NOT cure it',
    options: [
      'Stop in a safe place and sleep — coffee and loud music delay fatigue temporarily but do NOT cure it',
      'Open the window for fresh air',
      'Drink coffee and continue',
      'Turn up the radio and splash water on your face'],
    explanation: 'Fatigue is as dangerous as drunk driving. Microsleeps (1–2 second unconscious lapses) cause fatal crashes. There is no substitute for stopping and sleeping.',
  },
  {
    cat: 'fatigue',
    q: 'Signs that you are too fatigued to drive safely include:',
    correct: 'Difficulty keeping your eyes open, missing exits, drifting across lanes, or "losing" sections of the road',
    options: [
      'Difficulty keeping your eyes open, missing exits, drifting across lanes, or "losing" sections of the road',
      'Only yawning more than three times per hour',
      'Only feeling tired at the wheel',
      'Headache only'],
    explanation: 'If you experience microsleeps, you are already too tired. The danger is that fatigued drivers often do not recognise how impaired they are — they feel "OK" but react as if asleep.',
  },
  {
    cat: 'fatigue',
    q: 'On a long trip, you should plan a rest stop at least every:',
    correct: 'Every 2 hours or 200 km — whichever comes first',
    options: [
      'Every 2 hours or 200 km — whichever comes first',
      'Every 4 hours',
      'Only when you feel tired',
      'Every 500 km'],
    explanation: 'The "2 hour rule" is standard road safety guidance. Mental fatigue accumulates invisibly — stopping every 2 hours for 15 minutes substantially reduces crash risk on long trips.',
  },

  // ── CATEGORY: intersections (expanded) ────────────────────────────────────
  {
    cat: 'intersections',
    q: 'You arrive at a four-way stop at exactly the same time as a vehicle from your right. Who has right of way?',
    correct: 'The vehicle on the right — you must yield to them',
    options: [
      'The vehicle on the right — you must yield to them',
      'You — because you intend to go straight',
      'Whoever is facing the steepest uphill',
      'The larger vehicle'],
    explanation: 'At a four-way stop with simultaneous arrivals, yield to the vehicle on YOUR RIGHT. This is the universal uncontrolled intersection rule in South Africa.',
  },
  {
    cat: 'intersections',
    q: 'At a green traffic light, before entering the intersection you must:',
    correct: 'Check that the intersection is clear — another driver may run a red light',
    options: [
      'Check that the intersection is clear — another driver may run a red light',
      'Accelerate quickly to clear the intersection',
      'Enter immediately — a green light gives unconditional right of way',
      'Hoot to warn pedestrians'],
    explanation: 'A green light gives you the right of way — it does NOT guarantee safety. Always scan the intersection before entering. Red-light runners cause severe T-bone collisions.',
  },
  {
    cat: 'intersections',
    q: 'You are at an intersection waiting to turn right. Oncoming traffic is heavy. When is it safe to turn?',
    correct: 'Only when there is a safe gap in oncoming traffic AND no pedestrians are crossing your path',
    options: [
      'Only when there is a safe gap in oncoming traffic AND no pedestrians are crossing your path',
      'When the oncoming vehicle flashes their lights at you',
      'As soon as the leading oncoming vehicle passes',
      'If you have been waiting for more than 30 seconds'],
    explanation: 'A right turn crosses oncoming traffic AND the crossing lane for pedestrians. Both must be clear. Never turn based on another driver\'s flash — they may not speak for all traffic.',
  },
  {
    cat: 'intersections',
    q: 'What is a "box junction" and what is the rule?',
    correct: 'A yellow cross-hatched box: you may only enter if your exit road is clear enough to drive through without stopping',
    options: [
      'A yellow cross-hatched box: you may only enter if your exit road is clear enough to drive through without stopping',
      'A priority intersection marked with yellow lines',
      'An intersection with no traffic lights where all traffic must stop',
      'A pedestrian crossing with yellow markings'],
    explanation: 'Box junctions prevent gridlock. Even with a green light, you must not enter the box if your exit is blocked. The only exception: turning right and blocked only by oncoming traffic.',
  },
  {
    cat: 'intersections',
    q: 'You approach a stop sign and the road you are entering is clear. You must:',
    correct: 'Stop completely behind the stop line, check both directions, then proceed when safe',
    options: [
      'Stop completely behind the stop line, check both directions, then proceed when safe',
      'Slow down to walking pace — a full stop is not required if the road is clear',
      'Stop if any traffic is approaching',
      'Stop, check right only (traffic comes from the right in SA)'],
    explanation: 'A stop sign requires a complete stop regardless of visibility. Not stopping is an offence even if the road appears clear. Check BOTH directions before proceeding.',
  },

  // ── CATEGORY: freeways (expanded) ────────────────────────────────────────
  {
    cat: 'freeways',
    q: 'You missed your freeway exit. You must:',
    correct: 'Continue to the next exit — never reverse or make a U-turn on a freeway',
    options: [
      'Continue to the next exit — never reverse or make a U-turn on a freeway',
      'Stop on the shoulder and wait for a gap to reverse',
      'Cut across the gore area to reach the exit ramp',
      'Flash your lights and slowly reverse to the exit'],
    explanation: 'Reversing or U-turning on a freeway is extremely dangerous and illegal. Continue to the next exit. The cost of a few extra kilometres is nothing compared to a fatal collision.',
  },
  {
    cat: 'freeways',
    q: 'On a freeway, the left lane is for:',
    correct: 'Normal travel — the right lane is for overtaking only and must be vacated after passing',
    options: [
      'Normal travel — the right lane is for overtaking only and must be vacated after passing',
      'Slow vehicles only',
      'Emergency vehicles only',
      'Trucks and buses only'],
    explanation: 'Keep left on a freeway. The right lane is an overtaking lane — not a "fast lane" for continuous travel. Staying in the right lane is an offence and causes danger.',
  },
  {
    cat: 'freeways',
    q: 'When merging onto a freeway from an on-ramp, you must:',
    correct: 'Accelerate on the ramp to match freeway speed, yield to freeway traffic, and merge when a safe gap appears',
    options: [
      'Accelerate on the ramp to match freeway speed, yield to freeway traffic, and merge when a safe gap appears',
      'Stop at the end of the on-ramp and wait for a gap',
      'Force your way in — freeway traffic must yield to merging vehicles',
      'Signal and immediately enter the freeway'],
    explanation: 'You do NOT have right of way merging onto a freeway. Match speed on the ramp (acceleration lane), find a safe gap, and blend in smoothly. Stopping at the end is extremely dangerous.',
  },
];

const CATEGORIES = [
  { id: 'signals',       label: 'Signals & Mirrors',      icon: '🪞', desc: 'Mirror-signal sequences, blind spots, traffic officers', count: ALL_QUESTIONS.filter(q => q.cat === 'signals').length },
  { id: 'intersections', label: 'Intersections',           icon: '🛑', desc: 'Stop signs, yield, traffic lights, roundabouts', count: ALL_QUESTIONS.filter(q => q.cat === 'intersections').length },
  { id: 'overtaking',    label: 'Overtaking & Lanes',      icon: '🏎️', desc: 'When and how to overtake; being overtaken', count: ALL_QUESTIONS.filter(q => q.cat === 'overtaking').length },
  { id: 'speed',         label: 'Speed & Space',           icon: '🔢', desc: 'Speed limits, following distance, lights', count: ALL_QUESTIONS.filter(q => q.cat === 'speed').length },
  { id: 'parking',       label: 'Parking Rules',           icon: '🅿️', desc: 'Clearances, emergency triangle, hill parking', count: ALL_QUESTIONS.filter(q => q.cat === 'parking').length },
  { id: 'crossings',     label: 'Crossings',               icon: '🚂', desc: 'Level crossings, pedestrian crossings', count: ALL_QUESTIONS.filter(q => q.cat === 'crossings').length },
  { id: 'freeways',      label: 'Freeways',                icon: '🛣️', desc: 'Entering, exiting, passing on-ramps', count: ALL_QUESTIONS.filter(q => q.cat === 'freeways').length },
  { id: 'pretrip',       label: 'Pre-trip Inspection',     icon: '🔍', desc: 'Starting procedure, seat, mirrors, tyres', count: ALL_QUESTIONS.filter(q => q.cat === 'pretrip').length },
  { id: 'gears',         label: 'Gear Changing',           icon: '⚙️', desc: 'Gear change sequence, engine braking', count: ALL_QUESTIONS.filter(q => q.cat === 'gears').length },
  { id: 'emergency',     label: 'Emergency & BAC',         icon: '🆘', desc: 'Emergency stop procedure, alcohol limits', count: ALL_QUESTIONS.filter(q => q.cat === 'emergency').length },
  { id: 'moving',        label: 'Moving Off & Incline',    icon: '⛰️', desc: 'Hill start, bite point, moving off from rest', count: ALL_QUESTIONS.filter(q => q.cat === 'moving').length },
  { id: 'manoeuvres',    label: 'Yard Manoeuvres',         icon: '🔄', desc: 'Alley dock, turn in road, parallel park', count: ALL_QUESTIONS.filter(q => q.cat === 'manoeuvres').length },
  { id: 'weather',       label: 'Weather & Conditions',    icon: '🌧️', desc: 'Rain, fog, aquaplaning, crosswinds, floods', count: ALL_QUESTIONS.filter(q => q.cat === 'weather').length },
  { id: 'night',         label: 'Night Driving',           icon: '🌙', desc: 'High beam, oncoming lights, parking at night', count: ALL_QUESTIONS.filter(q => q.cat === 'night').length },
  { id: 'fatigue',       label: 'Fatigue & Alertness',     icon: '😴', desc: 'Rest stops, microsleeps, warning signs of fatigue', count: ALL_QUESTIONS.filter(q => q.cat === 'fatigue').length },
];

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

const SA_STRIPE = (
  <div style={{ display: 'flex', height: 3 }}>
    {['#000', '#FFB612', '#007A4D', '#F5F5F0', '#DE3831', '#4472CA'].map((c, i) => (
      <div key={i} style={{ flex: 1, background: c }} />
    ))}
  </div>
);

export default function ScenarioDrill({ onBack, onPass }) {
  const [screen, setScreen]   = useState('menu');   // menu | quiz | result
  const [cat, setCat]         = useState(null);
  const [questions, setQs]    = useState([]);
  const [qIdx, setQIdx]       = useState(0);
  const [score, setScore]     = useState(0);
  const [chosen, setChosen]   = useState(null);
  const [wrong, setWrong]     = useState([]);

  const startCat = useCallback((catId) => {
    const qs = shuffle(ALL_QUESTIONS.filter(q => q.cat === catId));
    setCat(catId);
    setQs(qs);
    setQIdx(0);
    setScore(0);
    setChosen(null);
    setWrong([]);
    setScreen('quiz');
  }, []);

  const current = questions[qIdx];

  const handleAnswer = useCallback((opt) => {
    if (chosen) return;
    setChosen(opt);
    const correct = opt === current.correct;
    recordGameAnswer('scenario', qIdx, correct);
    if (correct) { hapticCorrect(); sfx('correct'); setScore(s => s + 1); }
    else { hapticWrong(); sfx('wrong'); setWrong(w => [...w, current]); }
    setTimeout(() => {
      if (qIdx + 1 >= questions.length) {
        hapticPass();
        setScreen('result');
        const final = score + (correct ? 1 : 0);
        if (final >= Math.ceil(questions.length * 0.75)) onPass?.();
      } else {
        setQIdx(i => i + 1);
        setChosen(null);
      }
    }, 1800);
  }, [chosen, current, qIdx, questions.length, score, onPass]);

  const shareResult = useCallback(() => {
    const cat = CATEGORIES.find(c => c.id === questions[0]?.cat);
    const pct = Math.round((score / questions.length) * 100);
    const text = `🎯 Scenario Drill — ${cat?.label || 'K53'}\n✅ ${score}/${questions.length} (${pct}%)\n🇿🇦 K53 Drill Master — k53drillmaster.co.za`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }, [score, questions]);

  // ── Menu ────────────────────────────────────────────────────────────────────
  if (screen === 'menu') return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.font }}>
      {SA_STRIPE}
      <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
          style={{ background: 'none', border: 'none', color: T.dim, fontSize: 22, cursor: 'pointer', padding: 0 }}>←</motion.button>
        <div>
          <div style={{ fontWeight: 800, fontSize: T.fontSizeLg }}>Scenario Drill</div>
          <div style={{ color: T.dim, fontSize: T.fontSize - 2 }}>All 56 K53 modules — situational questions</div>
        </div>
      </div>

      <div style={{ padding: '16px 20px', display: 'grid', gap: 10 }}>
        {CATEGORIES.map(c => (
          <motion.button key={c.id} whileTap={{ scale: 0.97 }} onClick={() => startCat(c.id)}
            style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radiusLg, padding: '15px 18px', textAlign: 'left', cursor: 'pointer', color: T.text, fontFamily: T.font, display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 26, flexShrink: 0 }}>{c.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: T.fontSizeLg }}>{c.label}</div>
              <div style={{ color: T.dim, fontSize: T.fontSize - 2, marginTop: 2 }}>{c.desc}</div>
            </div>
            <span style={{ color: T.dim, fontSize: T.fontSize - 2, flexShrink: 0 }}>{c.count}Q</span>
          </motion.button>
        ))}
      </div>
    </div>
  );

  // ── Quiz ────────────────────────────────────────────────────────────────────
  if (screen === 'quiz' && current) {
    const catInfo = CATEGORIES.find(c => c.id === current.cat);
    const opts = shuffle(current.options);
    return (
      <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.font }}>
        {SA_STRIPE}
        <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen('menu')}
            style={{ background: 'none', border: 'none', color: T.dim, fontSize: 20, cursor: 'pointer' }}>←</motion.button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: T.fontSize, color: T.gold }}>{catInfo?.icon} {catInfo?.label}</div>
            <div style={{ color: T.dim, fontSize: T.fontSize - 2 }}>{qIdx + 1} / {questions.length}</div>
          </div>
          <div style={{ fontWeight: 700, color: T.green }}>{score} ✓</div>
        </div>

        <div style={{ height: 3, background: T.border, margin: '0 20px' }}>
          <div style={{ height: '100%', background: T.gold, width: `${(qIdx / questions.length) * 100}%`, transition: 'width 0.3s' }} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={qIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            style={{ padding: '24px 20px' }}>

            <div style={{ background: T.surfaceAlt, borderRadius: T.radiusLg, padding: '18px 20px', marginBottom: 20, borderLeft: `3px solid ${T.gold}` }}>
              <div style={{ fontWeight: 700, fontSize: T.fontSizeLg, lineHeight: 1.4 }}>
                {current.q}
              </div>
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
              {opts.map(opt => {
                const isCorrect = opt === current.correct;
                const isChosen  = opt === chosen;
                let bg = T.surface; let border = T.border; let textCol = T.text;
                if (chosen) {
                  if (isCorrect) { bg = 'rgba(0,122,77,0.18)'; border = T.green; textCol = '#4ade80'; }
                  else if (isChosen) { bg = 'rgba(222,56,49,0.18)'; border = T.red; textCol = '#f87171'; }
                }
                return (
                  <motion.button key={opt} whileTap={{ scale: chosen ? 1 : 0.97 }} onClick={() => handleAnswer(opt)}
                    style={{ background: bg, border: `2px solid ${border}`, borderRadius: T.radius, padding: '14px 16px', color: textCol, fontFamily: T.font, fontSize: T.fontSize, fontWeight: 600, cursor: chosen ? 'default' : 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, transition: 'all 0.2s', lineHeight: 1.4 }}>
                    <span>{opt}</span>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>
                      {chosen && isCorrect && '✓'}
                      {chosen && isChosen && !isCorrect && '✗'}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence>
              {chosen && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  style={{ marginTop: 16, background: T.surfaceAlt, borderRadius: T.radius, padding: '14px 16px', fontSize: T.fontSize - 1, color: T.dim, lineHeight: 1.5, borderLeft: `3px solid ${chosen === current.correct ? T.green : T.red}` }}>
                  <span style={{ fontWeight: 700, color: T.text }}>Why: </span>
                  {current.explanation}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // ── Result ──────────────────────────────────────────────────────────────────
  const pct    = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const passed = pct >= 75;
  const catInfo = CATEGORIES.find(c => c.id === cat);

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.font }}>
      {SA_STRIPE}
      <div style={{ padding: '36px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>{passed ? '🏆' : '📚'}</div>
        <div style={{ fontWeight: 800, fontSize: T.fontSizeHeading }}>{pct}%</div>
        <div style={{ color: passed ? T.green : T.gold, fontWeight: 700, fontSize: T.fontSizeLg, marginTop: 4 }}>
          {passed ? 'Nailed it! You know your K53 rules.' : 'Keep drilling — you\'ll lock this in.'}
        </div>
        <div style={{ color: T.dim, marginTop: 6 }}>{score}/{questions.length} correct · {catInfo?.label}</div>

        {wrong.length > 0 && (
          <div style={{ marginTop: 20, background: 'rgba(222,56,49,0.06)', border: '1px solid rgba(222,56,49,0.2)', borderRadius: T.radiusLg, padding: '16px 18px', textAlign: 'left' }}>
            <div style={{ fontWeight: 700, color: T.red, marginBottom: 10 }}>Review these {wrong.length}:</div>
            {wrong.map((w, i) => (
              <div key={i} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: i < wrong.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                <div style={{ fontSize: T.fontSize - 1, color: T.text, fontWeight: 600, marginBottom: 3 }}>{w.q}</div>
                <div style={{ fontSize: T.fontSize - 2, color: T.green }}>✓ {w.correct}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 24, display: 'grid', gap: 12 }}>
          <motion.button whileTap={{ scale: 0.97 }} onClick={shareResult}
            style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)', borderRadius: T.radius, padding: '14px', color: '#25d366', fontWeight: 700, fontFamily: T.font, cursor: 'pointer', fontSize: T.fontSize }}>
            💬 Share on WhatsApp
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => startCat(cat)}
            style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: '14px', color: T.text, fontWeight: 700, fontFamily: T.font, cursor: 'pointer', fontSize: T.fontSize }}>
            🔄 Try Again
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setScreen('menu')}
            style={{ background: 'none', border: 'none', color: T.dim, fontFamily: T.font, cursor: 'pointer', fontSize: T.fontSize, padding: '10px' }}>
            ← Choose another topic
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={onBack}
            style={{ background: 'none', border: 'none', color: T.dim, fontFamily: T.font, cursor: 'pointer', fontSize: T.fontSize, padding: '10px' }}>
            ← Back to home
          </motion.button>
        </div>
      </div>
    </div>
  );
}
