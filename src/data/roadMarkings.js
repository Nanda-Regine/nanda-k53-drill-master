// Road Markings — SA Learner Driver Manual: Road Traffic Signs, §7 (SARTSM codes)
// Every entry follows the manual's Name / Purpose / Action text. Images are the
// official SARTSM drawings in /public/signs (their caption shows the code); an
// entry without a matching drawing has img: null and is only asked about in text.
import { shuffleCopy } from '../utils/quizHelpers.js';

export const ROAD_MARKINGS = [
  // ── REGULATORY MARKINGS (§7.1) ─────────────────────────────────────────────
  {
    id: 'RTM1', name: 'Stop line', code: 'RTM1', category: 'Regulatory', img: null, colour: 'White',
    meaning: 'Shows where you must bring your vehicle to a standstill. Without a stop sign, a stop line has the same meaning as a stop sign.',
    action: 'Stop with the front of your vehicle behind the line, then proceed only when it is safe.',
    ref: 'SGN §7.1 RTM1',
  },
  {
    id: 'RTM2', name: 'Yield line', code: 'RTM2', category: 'Regulatory', img: null, colour: 'White',
    meaning: 'You must give priority to anyone who crosses, or wants to cross, your path at this point — even if there is no yield sign.',
    action: 'Give way to crossing traffic; stop at the line if necessary.',
    ref: 'SGN §7.1 RTM2',
  },
  {
    id: 'RTM3', name: 'Pedestrian crossing lines', code: 'RTM3', category: 'Regulatory', img: 'pedestrian-crossing-lines.jpg', colour: 'White', family: 'pedestrian',
    meaning: 'A pedestrian crossing: priority must be given to pedestrians crossing or wanting to cross the road here.',
    action: 'Look out for pedestrians and give them priority by slowing down or stopping.',
    ref: 'SGN §7.1 RTM3',
  },
  {
    id: 'RTM4', name: 'Block pedestrian crossing', code: 'RTM4', category: 'Regulatory', img: 'pedestrian-crossing-lines.jpg', colour: 'White', family: 'pedestrian',
    meaning: 'A block ("zebra") pedestrian crossing: priority must be given to pedestrians crossing or wanting to cross.',
    action: 'Look out for pedestrians and give them priority by slowing down or stopping.',
    ref: 'SGN §7.1 RTM4',
  },
  {
    id: 'RM1', name: 'No-overtaking line', code: 'RM1', category: 'Regulatory', img: null, colour: null, family: 'line',
    meaning: 'On a two-way road, you may not drive with any part of your vehicle to the right of this line.',
    action: 'Do not cross it — except to reach an entrance on the other side, to leave such an entrance, or to pass a stationary obstruction, when safe.',
    ref: 'SGN §7.1 RM1',
  },
  {
    id: 'RM2', name: 'No-crossing line', code: 'RM2', category: 'Regulatory', img: null, colour: null, family: 'line',
    meaning: 'You may not cross this line or drive on its right-hand side.',
    action: 'Never cross it, except to drive around a stationary vehicle or stationary obstruction in the road.',
    ref: 'SGN §7.1 RM2',
  },
  {
    id: 'RM3', name: 'Channelizing line', code: 'RM3', category: 'Regulatory', img: null, colour: null,
    meaning: 'Separates traffic moving in the same direction at carriageways and intersections — it may not be crossed.',
    action: 'Drive so that no part of your vehicle crosses the line.',
    ref: 'SGN §7.1 RM3',
  },
  {
    id: 'RM4.1', name: 'Left-edge line', code: 'RM4.1', category: 'Regulatory', img: null, colour: null,
    meaning: 'Marks the left edge of the roadway.',
    action: 'Avoid driving to its left — only while being overtaken, in daytime, when safe, and with vehicles clearly visible at 150 m. If you break down, stop as far left of it as possible.',
    ref: 'SGN §7.1 RM4.1',
  },
  {
    id: 'RM5', name: 'Painted island', code: 'RM5', category: 'Regulatory', img: 'painted-islands.jpg', colour: 'Yellow',
    meaning: 'An area in which drivers are prohibited from driving.',
    action: 'Do not stop, park or drive over it — unless ordered by an officer, to avoid a collision, or in an emergency.',
    ref: 'SGN §7.1 RM5',
  },
  {
    id: 'RM10', name: 'Box junction', code: 'RM10', category: 'Regulatory', img: 'box-junction.jpg', colour: 'Yellow',
    meaning: 'You may not stop inside the demarcated box, because a vehicle stopped there blocks other traffic.',
    action: 'Enter only if you can drive right through without stopping in the box.',
    ref: 'SGN §7.1 RM10',
  },
  {
    id: 'RM11', name: 'Pedestrian crossing ahead lines', code: 'RM11', category: 'Regulatory', img: 'pedestrian-crossing-ahead-lines.jpg', colour: 'White', family: 'pedestrian',
    meaning: 'An area before a pedestrian crossing where you may not stop — except for pedestrians or behind a vehicle that has already stopped.',
    action: 'Slow down and stop for pedestrians. Do not overtake inside this area, nor pass a vehicle that has stopped at the crossing.',
    ref: 'SGN §7.1 RM11',
  },
  {
    id: 'RM12', name: 'No-stopping line', code: 'RM12', category: 'Regulatory', img: 'no-stopping-line.jpg', colour: 'Red', family: 'kerb',
    meaning: 'Stopping is prohibited here, because stationary vehicles would disrupt traffic or block the view.',
    action: 'Do not stop at this line except in an emergency. (If the line is broken, the ban applies during the times on a sign.)',
    ref: 'SGN §7.1 RM12',
  },
  {
    id: 'RM13', name: 'No-parking line', code: 'RM13', category: 'Regulatory', img: 'no-parking-line.jpg', colour: 'Yellow', family: 'kerb',
    meaning: 'Parking is prohibited here, but a short stop is allowed.',
    action: 'You may stop briefly (e.g. to load or off-load), but may not park.',
    ref: 'SGN §7.1 RM13',
  },
  {
    id: 'RM14', name: 'Bicycle lane lines', code: 'RM14', category: 'Regulatory', img: null, colour: null,
    meaning: 'Marks the limits within which only cyclists may travel.',
    action: 'Do not drive in the demarcated bicycle lane.',
    ref: 'SGN §7.1 RM14',
  },
  {
    id: 'RM15', name: 'Traffic circle mandatory direction arrows', code: 'RM15', category: 'Regulatory', img: 'mini-circle.jpg', colour: 'White',
    meaning: 'Shows the direction you must follow around a traffic circle or mini-circle.',
    action: 'Only drive around the circle in the direction of the arrows. At a mini-circle, yield to traffic that reaches its yield line before you reach yours.',
    ref: 'SGN §7.1 RM15',
  },
  // ── WARNING MARKINGS (§7.2)────────────────────────────────────────────────
  {
    id: 'WM1', name: 'Railway crossing ahead marking', code: 'WM1', category: 'Warning', img: null, colour: null,
    meaning: 'A railway crossing is ahead.',
    action: 'Slow down and, if necessary, stop before the crossing.',
    ref: 'SGN §7.2 WM1',
  },
  {
    id: 'WM2', name: 'Continuity lines', code: 'WM2', category: 'Warning', img: 'continuity-line.jpg', colour: 'White',
    meaning: 'A break (intersection or off-ramp) is coming: a lane with this line on one side will soon turn off from the road.',
    action: 'Yield to traffic that wants to change lanes, and make sure you are in the correct lane.',
    ref: 'SGN §7.2 WM2',
  },
  {
    id: 'WM5', name: 'Yield control ahead marking', code: 'WM5', category: 'Warning', img: null, colour: null,
    meaning: 'A yield sign is ahead.',
    action: 'Slow down if other traffic is approaching the intersection, and stop if necessary.',
    ref: 'SGN §7.2 WM5',
  },
  {
    id: 'WM8', name: 'No-overtaking or no-crossing line ahead', code: 'WM8', category: 'Warning', img: null, colour: null,
    meaning: 'A no-overtaking or no-crossing line is ahead.',
    action: 'Do not cross the prohibition line that follows; if you are on the right-hand side, move back to the left as soon as possible.',
    ref: 'SGN §7.2 WM8',
  },
  {
    id: 'WM10', name: 'Speed hump marking', code: 'WM10', category: 'Warning', img: null, colour: null,
    meaning: 'A speed hump is in the road.',
    action: 'Slow down and release your brake before driving over the hump.',
    ref: 'SGN §7.2 WM10',
  },
  // ── GUIDANCE MARKINGS (§7.3) ───────────────────────────────────────────────
  {
    id: 'GM1', name: 'Lane lines', code: 'GM1', category: 'Guidance', img: 'lane-line.jpg', colour: 'White',
    meaning: 'You are on a part of the road with traffic in the same direction, divided into lanes.',
    action: 'Drive in the centre of your demarcated lane.',
    ref: 'SGN §7.3 GM1',
  },
  {
    id: 'GM5', name: 'Bicycle crossing lines', code: 'GM5', category: 'Guidance', img: 'bicycle-crossing-guide-lines.jpg', colour: 'White',
    meaning: 'A section of the road used by cyclists to cross.',
    action: 'Look out for cyclists crossing or wanting to cross.',
    ref: 'SGN §7.3 GM5',
  },
  {
    id: 'GM6', name: 'Road marking symbols', code: 'GM6', category: 'Guidance', img: 'road-markings-symbols.jpg', colour: 'White',
    meaning: 'Shows that a road or area is reserved for a specific group (e.g. cyclists, disabled persons) or leads to a destination such as an airport.',
    action: 'Do not use the marked road or area if you are not part of the group shown.',
    ref: 'SGN §7.3 GM6',
  },
  {
    id: 'GM7', name: 'Word markings', code: 'GM7', category: 'Guidance', img: 'word-markings.jpg', colour: 'White',
    meaning: 'Words painted on the road (e.g. STOP, SCHOOL) that give additional information.',
    action: 'Read the message and concentrate on the possible danger it indicates.',
    ref: 'SGN §7.3 GM7',
  },
];

// ── Categories ────────────────────────────────────────────────────────────────
export const MARKING_CATEGORIES = [
  { id: 'Regulatory', label: 'Regulatory Markings', color: '#DE3831', description: 'Must be obeyed — stop and yield lines, crossings, no-overtaking/no-crossing lines, no-stopping and no-parking lines. Disregarding them is an offence.' },
  { id: 'Warning', label: 'Warning Markings', color: '#FFB612', description: 'Warn of what is ahead — railway crossings, lane changes, yield control, prohibition lines, speed humps.' },
  { id: 'Guidance', label: 'Guidance Markings', color: '#6c47ff', description: 'Guide you — lane lines, bicycle crossings, symbols and word markings.' },
];

// Colour facts shown by the official SARTSM drawings.
export const KEY_MARKING_COLOURS = [
  { colour: 'White',  meaning: 'Most markings — lane lines, stop and yield lines, pedestrian crossings.' },
  { colour: 'Yellow', meaning: 'No-parking line (RM13), box junction (RM10) and painted islands (RM5).' },
  { colour: 'Red',    meaning: 'No-stopping line (RM12) — do not stop except in an emergency.' },
];

export function getMarkingsByCategory(category) {
  return ROAD_MARKINGS.filter(m => m.category === category);
}

export function getRandomMarkings(count = 5) {
  return shuffleCopy(ROAD_MARKINGS).slice(0, count);
}
