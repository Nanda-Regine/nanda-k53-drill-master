// ── Per-"nerve" drill bank for the adaptive modes (Daily Diagnostic, Weak Spot) ─
// Built on the verified learner-test bank so every adaptive drill uses the same,
// source-cited questions. Shape: { id, q, options, answer, explain, ref }.
import { RULES, SIGNALS_MARKINGS, CONTROLS_LMV } from './learnerTestBank.js';

const MARKING_IDS = new Set(['s009', 's010', 's011', 's012', 's013', 's014', 's015', 's016', 's017', 's018', 's019', 's020', 's021']);

// Sign-system facts (SGN = SA Learner Driver Manual — Road Traffic Signs)
const SIGN_FACTS = [
  { id: 'g001', q: 'Which shape is the STOP sign?', options: ['Octagonal (8 sides)', 'Round', 'Triangular', 'Diamond'], answer: 0, ref: 'SGN §1', explain: 'The stop sign is the octagonal exception to round regulatory signs.' },
  { id: 'g002', q: 'Which shape is the YIELD sign?', options: ['An inverted (downward-pointing) triangle', 'An octagon', 'A circle', 'A rectangle'], answer: 0, ref: 'SGN §1', explain: 'The yield sign is a triangular exception to the usual round regulatory signs.' },
  { id: 'g003', q: 'What is the usual shape of a WARNING sign in South Africa?', options: ['Triangular', 'Round', 'Diamond', 'Octagonal'], answer: 0, ref: 'SGN §1', explain: 'Regulatory signs are usually round, warning signs triangular, guidance signs rectangular.' },
  { id: 'g004', q: 'What is the usual shape of a REGULATORY sign?', options: ['Round', 'Triangular', 'Rectangular', 'Diamond'], answer: 0, ref: 'SGN §1', explain: 'Regulatory signs are usually round (exceptions: stop, yield, pedestrian priority).' },
  { id: 'g005', q: 'Guidance signs are usually which shape?', options: ['Rectangular', 'Round', 'Triangular', 'Octagonal'], answer: 0, ref: 'SGN §1', explain: 'Guidance signs are rectangular — small for short messages, large for complex directions.' },
  { id: 'g006', q: 'A diamond-shaped "pedestrian priority" sign (R5) is which type of sign?', options: ['Regulatory', 'Warning', 'Guidance', 'Information'], answer: 0, ref: 'SGN §1; R5', explain: 'It is one of the three regulatory-sign exceptions to the round shape.' },
  { id: 'g007', q: 'What does a YELLOW background on a road sign tell you?', options: ['It is a temporary sign — normal conditions do not apply', 'It is a school warning', 'It is a freeway sign', 'It is a tourist sign'], answer: 0, ref: 'SGN §1–2', explain: 'Yellow background = temporary sign; its number starts with T (e.g. TR201).' },
  { id: 'g008', q: 'Failure to obey a regulatory sign is:', options: ['An offence, punishable by a fine or imprisonment or both', 'Only a warning', 'Allowed at night', 'Only an offence if you cause an accident'], answer: 0, ref: 'SGN §1', explain: 'Regulatory signs must be obeyed — disobeying them is an offence.' },
  { id: 'g009', q: 'Sign R214 prohibits overtaking for how far?', options: ['The next 500 m', 'The next 100 m', 'The next 2 km', 'Until the next town'], answer: 0, ref: 'SGN R214', explain: 'R214/TR214: do not overtake any vehicle for the next 500 m.' },
  { id: 'g010', q: 'Inside a pedestrian-priority zone (R5), permitted vehicles may drive at a maximum of:', options: ['15 km/h', '30 km/h', '40 km/h', '60 km/h'], answer: 0, ref: 'SGN R5', explain: 'Only emergency, delivery and maintenance vehicles — max 15 km/h, giving priority to pedestrians.' },
  { id: 'g011', q: 'In a Woonerf (R403) the speed of vehicles is limited to:', options: ['30 km/h', '15 km/h', '40 km/h', '60 km/h'], answer: 0, ref: 'SGN R403', explain: 'Woonerf: max 30 km/h; no vehicles over 3 500 kg or with more than 10 seats except local access/delivery.' },
  { id: 'g012', q: 'After passing the "excessive noise prohibited" sign (R206), you may not use your hooter for:', options: ['100 m', '50 m', '500 m', '1 km'], answer: 0, ref: 'SGN R206', explain: 'R206: a noisy vehicle may not proceed past the sign, and the hooter may not be used for 100 m after it.' },
  { id: 'g013', q: 'Warning sign W307 (pedestrians) warns that pedestrians may be crossing for the next:', options: ['2 km', '500 m', '100 m', '5 km'], answer: 0, ref: 'SGN W307', explain: 'W307: slow down and look out for pedestrians for the next 2 km.' },
  { id: 'g014', q: 'The freeway sign GA2/3 (supplementary exit direction) is about 500 m before the off-ramp. By then you should be:', options: ['In the extreme left-hand lane if you want to exit', 'In the right lane', 'Slowing to 60 km/h', 'Stopped on the shoulder'], answer: 0, ref: 'SGN GA2/3', explain: 'At GA2/3 you should already be in the extreme left lane to exit.' },
  { id: 'g015', q: 'At a gore exit sign (GA4) you want to stay on the freeway. You pass it on the:', options: ['Right-hand side', 'Left-hand side', 'Either side', 'You must stop'], answer: 0, ref: 'SGN GA4', explain: 'Pass on the left to leave the freeway; on the right to stay on it.' },
  { id: 'g016', q: 'A de-restriction sign (the restriction symbol with a red cross, R600 series) means:', options: ['The restriction ends from this point', 'The restriction doubles', 'No entry', 'The restriction applies only to trucks'], answer: 0, ref: 'SGN R600', explain: 'From this sign you no longer have to comply with the matching restriction sign.' },
];

// Scenario / situational questions (RoR / K53-B)
const SCENARIOS = [
  { id: 'x001', q: 'You are dazzled by oncoming headlights at night. What should you do?', options: ['Slow down and look towards the left edge of the road', 'Switch to main beam', 'Close your eyes briefly', 'Speed up to pass quickly'], answer: 0, ref: 'Defensive driving', explain: 'Do not retaliate with main beam — slow down and use the left edge as a guide until your vision recovers.' },
  { id: 'x002', q: 'You miss your off-ramp on a freeway. What must you do?', options: ['Continue to the next exit', 'Reverse on the shoulder', 'Make a U-turn', 'Stop and wait for a gap'], answer: 0, ref: 'RoR §6.49; §6.56', explain: 'Reversing is only allowed when it can be done safely, and stopping on a freeway is restricted — continue to the next exit.' },
  { id: 'x003', q: 'Cattle are crossing the road and the herder signals you to stop. You must:', options: ['Stop, and move only when all the animals have crossed and it is safe', 'Drive slowly between them', 'Hoot to hurry them', 'Pass on the shoulder'], answer: 0, ref: 'RoR §6.60', explain: 'Stop at the request of a person leading animals; move on only when all have crossed and it is safe.' },
  { id: 'x004', q: 'A vehicle ahead has stopped at a pedestrian crossing. You are in the next lane. You may:', options: ['Not pass the stopped vehicle', 'Pass it slowly', 'Pass it if you hoot', 'Pass it on the left'], answer: 0, ref: 'RoR §6.53', explain: 'When any vehicle has stopped at a pedestrian crossing, no other vehicle may pass it.' },
  { id: 'x005', q: 'It is raining heavily and you cannot clearly see vehicles 150 m ahead. Your headlamps must be:', options: ['On', 'Off, because it is daytime', 'Replaced by hazard lights', 'On main beam only'], answer: 0, ref: 'RoR §6.1.2', explain: 'Lamps are required whenever persons and vehicles are not clearly discernible at 150 m.' },
  { id: 'x006', q: 'An ambulance approaches behind you with its siren and red lights on. You must:', options: ['Give it an immediate and absolute right of way', 'Keep going — you have right of way', 'Speed up to stay ahead', 'Stop immediately in your lane'], answer: 0, ref: 'RoR §6.16', explain: 'Give immediate right of way to emergency vehicles sounding a siren and showing warning lights.' },
  { id: 'x007', q: 'You are being overtaken on a two-way road. You must NOT:', options: ['Accelerate', 'Keep left', 'Maintain a steady course', 'Check your mirrors'], answer: 0, ref: 'RoR §6.38; K53-B Module 52', explain: 'Do not accelerate until the other vehicle has passed — doing so in the K53 test is a disqualifying violation.' },
  { id: 'x008', q: 'You break down on the roadway in a minibus. Where must the warning triangle go?', options: ['At least 45 m behind the vehicle, facing approaching traffic', 'On the roof', '10 m behind the vehicle', 'In front of the vehicle'], answer: 0, ref: 'RoR §6.24', explain: 'Minibuses must carry and display a triangle not less than 45 m from the vehicle.' },
  { id: 'x009', q: 'After a minor accident you have not reported to a traffic officer at the scene. You must report it within:', options: ['24 hours', '48 hours', '7 days', 'You need not report it'], answer: 0, ref: 'RoR §6.62', explain: 'Report at a police station within 24 hours.' },
  { id: 'x010', q: 'You want to overtake near the top of a rise on a two-way road. You may do so only if:', options: ['You can do it without encroaching on the right-hand side of the road', 'You hoot first', 'You accelerate hard', 'No car has passed you recently'], answer: 0, ref: 'RoR §6.45', explain: 'Near a summit, curve or restricted view, do not pass unless you stay out of the right-hand side.' },
];

// K53 practical-test procedure (K53 Vol 1 — Light Motor Vehicle)
const PRACTICAL = [
  { id: 'p001', q: 'In the K53 turn in the road, how many movements are allowed?', options: ['Three — two forward, one reverse', 'As many as needed', 'Five', 'Two'], answer: 0, ref: 'K53-B Module 19', explain: 'Completed in three movements without touching the boundary line.' },
  { id: 'p002', q: 'In K53 parallel parking, how many movements may you use to get into the bay?', options: ['Three (the reverse in plus two more)', 'One', 'Unlimited', 'Five'], answer: 0, ref: 'K53-B Module 20', explain: 'A reverse movement into the bay and two additional movements once partly in the bay.' },
  { id: 'p003', q: 'During K53 alley docking, is any forward movement allowed while entering the bay?', options: ['No', 'Yes, one', 'Yes, two', 'Yes, unlimited'], answer: 0, ref: 'K53-B Module 15 (Note J)', explain: 'No forward movement is permissible while entering the demarcated area.' },
  { id: 'p004', q: 'The K53 emergency stop is given at a speed of:', options: ['More than 20 km/h but not more than 40 km/h', 'Exactly 60 km/h', '10 km/h', 'Any speed above 60 km/h'], answer: 0, ref: 'K53-B Module 56 (Note B)', explain: 'The instruction is only given on a straight road at 20–40 km/h, with no following or approaching traffic.' },
  { id: 'p005', q: 'During the K53 test, what happens if the vehicle rolls back on an incline start?', options: ['The test is discontinued', 'You lose 5 points', 'You may try again', 'Nothing'], answer: 0, ref: 'K53-B Module 17 (Note D)', explain: 'Should the vehicle roll, a circle is drawn around "Roll" and the test is discontinued.' },
  { id: 'p006', q: 'Accelerating while being overtaken on the right on a two-way road during the K53 test results in:', options: ['The test being discontinued (violation of traffic law)', 'A small penalty', 'A warning', 'Nothing'], answer: 0, ref: 'K53-B Module 52 (Note A)', explain: 'It is marked as a violation of traffic law and the test is discontinued.' },
  { id: 'p007', q: 'How many attempts are allowed at the K53 incline start?', options: ['One', 'Two', 'Three', 'Unlimited'], answer: 0, ref: 'K53-B Module 17 (Note C)', explain: 'Only one attempt is permitted.' },
  { id: 'p008', q: 'Before entering an intersection to move off, K53 requires you to ensure:', options: ['There is clear space beyond the intersection and the intersection is clear', 'Your hazard lights are on', 'The car behind has stopped', 'You have hooted'], answer: 0, ref: 'K53-B Module 12', explain: 'Ensure clear space beyond the intersection and that the intersection is clear before entering.' },
  { id: 'p009', q: 'In the K53 exterior pre-trip inspection, in which direction do you walk around the vehicle?', options: ['Anti-clockwise', 'Clockwise', 'Front to back only', 'It is not specified'], answer: 0, ref: 'K53-B Module 1', explain: 'Inspect from top to bottom, left to right, in an anti-clockwise direction (not penalised if you do not).' },
  { id: 'p010', q: 'At an unguarded level crossing, if you must stop, K53 says stop at a safe distance or at least:', options: ['5 m from the nearest rail', '1 m from the nearest rail', '20 m from the nearest rail', 'On the tracks'], answer: 0, ref: 'K53-B Module 48', explain: 'Look right and left for rail traffic; stop if necessary at least 5 m from the nearest rail.' },
];

const markings = SIGNALS_MARKINGS.filter(q => MARKING_IDS.has(q.id));
const signals = SIGNALS_MARKINGS.filter(q => !MARKING_IDS.has(q.id));

export const NERVE_BANK = {
  signs: [...SIGN_FACTS, ...signals],
  rules: RULES.filter(q => q.codes !== 'mc'),
  controls: CONTROLS_LMV,
  scenarios: SCENARIOS,
  markings,
  practical: PRACTICAL,
};
