import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../theme.js';
import { sfx } from '../utils/sounds.js';
import { hapticCorrect, hapticWrong, hapticPass } from '../utils/haptics.js';
import { recordGameAnswer } from '../utils/masteryStore.js';
import { CRISP_SIGNS as ROAD_SIGNS } from '../data/roadSigns.js';
import MentalHealthSupport from '../components/MentalHealthSupport.jsx';

// ── Exam structure (mirrors actual DLTC learner's test) ──────────────────────
// Code B: 28 Road Signs + 28 Rules of Road + 8 Vehicle Controls = 64 questions
// Pass: signs ≥ 23/28 | rules ≥ 22/28 | controls ≥ 6/8
const PASS_MARKS = { signs: 23, rules: 22, controls: 6 };
const SECTION_TOTALS = { signs: 28, rules: 28, controls: 8 };
const EXAM_TIME_SECONDS = 60 * 60; // 60 minutes (generous for practice)

const SA_STRIPE = (
  <div style={{ display: 'flex', height: 4 }}>
    {['#000', '#FFB612', '#007A4D', '#F5F5F0', '#DE3831', '#4472CA'].map((c, i) => (
      <div key={i} style={{ flex: 1, background: c }} />
    ))}
  </div>
);

// ── Rules of Road questions (28 verified K53 questions) ──────────────────────
const RULES_QUESTIONS = [
  { q: 'What is the general speed limit in a built-up area?', options: ['40 km/h','60 km/h','80 km/h','100 km/h'], answer: 1 },
  { q: 'What is the speed limit on a public road outside a built-up area (not a freeway)?', options: ['80 km/h','100 km/h','110 km/h','120 km/h'], answer: 1 },
  { q: 'What is the maximum speed on a freeway?', options: ['100 km/h','110 km/h','120 km/h','140 km/h'], answer: 2 },
  { q: 'What is the minimum following distance you must maintain behind the vehicle in front?', options: ['1 second','2 seconds','3 seconds','4 seconds'], answer: 1 },
  { q: 'What is the legal blood alcohol limit for a non-professional driver?', options: ['0.02 g/100 ml','0.05 g/100 ml','0.08 g/100 ml','0.10 g/100 ml'], answer: 1 },
  { q: 'What is the legal blood alcohol limit for a professional driver?', options: ['0.00 g/100 ml','0.02 g/100 ml','0.05 g/100 ml','0.08 g/100 ml'], answer: 1 },
  { q: 'Your emergency warning triangle must be placed at least how far behind your vehicle on a freeway?', options: ['15 m','30 m','45 m','90 m'], answer: 2 },
  { q: 'Your dipped headlamps must illuminate the road at least how far ahead?', options: ['30 m','45 m','60 m','100 m'], answer: 1 },
  { q: 'Your main beam (high beam) headlamps must illuminate at least how far ahead?', options: ['45 m','60 m','100 m','150 m'], answer: 2 },
  { q: 'You must switch on headlights from:', options: ['Sunset to sunrise only','Between sunset and sunrise AND when persons or vehicles are not visible at 150 m','Only when it is completely dark','From 1 hour after sunset to 1 hour before sunrise'], answer: 1 },
  { q: 'At an uncontrolled intersection, you must yield to traffic:', options: ['Coming from your left','Coming from your right','Approaching from ahead','All traffic regardless of direction'], answer: 1 },
  { q: 'At a four-way stop with simultaneous arrivals, the vehicle with right of way is:', options: ['The vehicle on the left','The vehicle on the right','The vehicle going straight','The largest vehicle'], answer: 1 },
  { q: 'You may NOT overtake when:', options: ['On a wide straight road','Approaching a pedestrian crossing','On a multi-lane road','The road is clear ahead'], answer: 1 },
  { q: 'A solid white line in the centre of the road means:', options: ['You may cross it to overtake if safe','You may NOT cross or straddle it to overtake','You may cross it only to turn right','It is a lane-guidance marking only'], answer: 1 },
  { q: 'You must NOT park within how many metres of an intersection?', options: ['3 m','5 m','9 m','15 m'], answer: 1 },
  { q: 'You must NOT park within how many metres of a fire hydrant?', options: ['1 m','1.5 m','3 m','5 m'], answer: 1 },
  { q: 'You must NOT park within how many metres of a pedestrian crossing?', options: ['3 m','5 m','9 m','15 m'], answer: 2 },
  { q: 'When must you yield to a pedestrian?', options: ['Only at traffic lights on green pedestrian signal','When they are in or about to enter a pedestrian crossing','Only at marked crossings with studs','Only in school zones'], answer: 1 },
  { q: 'When an emergency vehicle with sirens and lights approaches, you must:', options: ['Accelerate to clear the way','Move to the left and stop if necessary to allow it to pass','Stop anywhere immediately','Keep your speed — the emergency vehicle will go around you'], answer: 1 },
  { q: 'Pedestrians walking on a road with no pavement must walk:', options: ['On the left, with traffic','On the right, facing oncoming traffic','In the centre of the road','On either side — they choose'], answer: 1 },
  { q: 'When following a vehicle at night within 150 m, you must:', options: ['Keep high beam to see better','Dip your headlights','Flash to warn the driver ahead','Use hazard lights'], answer: 1 },
  { q: 'You may make a U-turn:', options: ['Only in a built-up area','Where it is safe and not specifically prohibited','On any road with a broken centre line','Only on a one-way road'], answer: 1 },
  { q: 'When joining a freeway from an on-ramp, right of way belongs to:', options: ['The merging vehicle','Traffic already on the freeway','The vehicle that arrives first','The vehicle in the left lane'], answer: 1 },
  { q: 'On a freeway, you must NOT stop except:', options: ['When you need a rest','At an emergency or in a genuine breakdown','When you miss your exit','To allow a passenger to board'], answer: 1 },
  { q: 'The minimum age for a Code B learner\'s licence is:', options: ['16 years','17 years','18 years','21 years'], answer: 1 },
  { q: 'Overtaking on the left is generally:', options: ['Permitted on multi-lane roads if traffic is moving slower in the right lane','Permitted at all times on multi-lane roads','Prohibited at all times','Only permitted on freeways'], answer: 0 },
  { q: 'Before changing lanes, the correct sequence is:', options: ['Signal → Mirror → Blind spot → Move','Mirror → Signal → Blind spot → Move','Blind spot → Signal → Mirror → Move','Move → Signal → Check mirrors'], answer: 1 },
  { q: 'When parking facing uphill with a kerb, you should turn your front wheels:', options: ['Straight ahead','Away from the kerb (to the right)','Into the kerb (to the left)','It does not matter'], answer: 1 },

  // ── Extended bank (questions 29–78) — randomly sampled each exam ─────────
  { q: 'An amber (yellow) traffic light means:', options: ['Speed up to clear the intersection','Stop if you can do so safely','Always stop regardless of position','Yield to pedestrians only'], answer: 1 },
  { q: 'A flashing amber traffic light requires you to:', options: ['Stop and wait for it to turn green','Proceed freely — no restriction applies','Proceed with caution and give way to all other traffic and pedestrians','Treat it as a four-way stop'], answer: 2 },
  { q: 'A green traffic light means:', options: ['Proceed at maximum speed','Proceed — but only if it is safe to do so','You have absolute priority over all pedestrians','Pedestrians must stop immediately'], answer: 1 },
  { q: 'At a traffic circle (roundabout), you must give way to:', options: ['Traffic on your left','Traffic already circulating inside the circle','Pedestrians only','No one — vehicles entering have right of way'], answer: 1 },
  { q: 'The "keep left" rule requires you to:', options: ['Always travel in the leftmost lane on multi-lane roads','Drive on the left of the road except to overtake or turn right','Stay left only on freeways','Use the left lane even when overtaking'], answer: 1 },
  { q: 'A broken white centre line means:', options: ['You may never cross it','You may cross it to overtake if it is safe to do so','It marks the left edge of the road','You must remain on the left of it at all times'], answer: 1 },
  { q: 'A solid yellow line painted along the left edge of the road indicates:', options: ['You must stop here','No parking or stopping is permitted along that section','Parking is permitted for up to 30 minutes','A loading zone'], answer: 1 },
  { q: 'You must give way to a pedestrian who is:', options: ['Standing on the pavement near a crossing','Already in a pedestrian crossing or about to step onto it','On the road outside a marked crossing','Waiting on a centre island'], answer: 1 },
  { q: 'How far before your turn must you signal your intention in an urban area?', options: ['Immediately before turning','At least 15 m','At least 30 m','At least 100 m'], answer: 2 },
  { q: 'When completing a right turn, you should end up in:', options: ['Any available lane on the new road','The leftmost lane of the new road','The rightmost lane (nearest the centre line) of the new road','The lane directly opposite your starting position'], answer: 2 },
  { q: 'After overtaking, you should return to the left lane:', options: ['Immediately after passing the vehicle','Once you can see the overtaken vehicle in your rear-view mirror','After driving at least 100 m in the right lane','Only when the road curves'], answer: 1 },
  { q: 'You must NOT park on:', options: ['The left side of a one-way street','A bridge or inside a tunnel','A gravel road shoulder','The right side of a one-way street'], answer: 1 },
  { q: 'When driving in fog, you should use:', options: ['High beams for maximum visibility','Low beams and front fog lights if fitted','Hazard lights only','No lights — they reflect back off the fog'], answer: 1 },
  { q: 'Which of the following is legal while driving?', options: ['Holding your phone to your ear','Reading a message at a red light','Using a hands-free phone kit (Bluetooth or earphone)','Dialling a number while moving'], answer: 2 },
  { q: 'Handheld mobile phone use while driving is:', options: ['Legal if you drive at reduced speed','Illegal — prohibited under the National Road Traffic Act','Legal at red traffic lights only','Legal if you keep one hand on the wheel'], answer: 1 },
  { q: 'Drowsy driving is comparable to:', options: ['Driving in heavy rain','Driving under the influence of alcohol — reaction time and judgment are both impaired','Normal driving with slightly slower reactions','Driving with a distracted passenger'], answer: 1 },
  { q: 'A learner driver may NOT drive without:', options: ['A GPS navigation device','A fully licensed supervisor in the front passenger seat','Hazard lights switched on','The vehicle being fitted with dual controls'], answer: 1 },
  { q: 'A driver involved in an accident causing injury must report to the police within:', options: ['1 hour','6 hours','24 hours','48 hours'], answer: 2 },
  { q: 'When driving behind a long vehicle (truck), you should:', options: ['Follow as closely as possible to reduce drag','Increase following distance — you cannot see hazards ahead past the truck','Stay in the left lane only','Flash headlights to request the truck to move over'], answer: 1 },
  { q: 'When changing lanes on a freeway, the correct sequence is:', options: ['Signal and change immediately','Check mirrors, signal, check blind spot, then change when safe','Flash headlights then signal and change','Move across then signal to confirm the change'], answer: 1 },
  { q: 'A vehicle that breaks down on a public road at night must:', options: ['Switch on hazard lights and leave the vehicle in that position','Switch on hazard lights, place emergency triangle, and keep occupants clear of traffic','Drive to the nearest petrol station on a flat tyre','Remain in the vehicle with engine running'], answer: 1 },
  { q: 'When parking near parked vehicles, you should allow extra clearance because:', options: ['You need space to open your doors','A suddenly opening car door could injure a cyclist or damage your vehicle','Other drivers may park too close','Large vehicles need room to pass'], answer: 1 },
  { q: 'At a T-junction, right of way belongs to:', options: ['The vehicle turning right','Vehicles on the through/continuing road','The vehicle that arrives first','The smaller vehicle'], answer: 1 },
  { q: 'On a road too narrow for two vehicles to pass, who has priority on a gradient?', options: ['The faster vehicle','The vehicle travelling downhill — it is easier to reverse downhill','The vehicle travelling uphill — reverse is easier for the downhill vehicle','The heavier vehicle'], answer: 2 },
  { q: 'You must switch from high beam to low beam when an oncoming vehicle is within:', options: ['50 m','100 m','150 m','200 m'], answer: 2 },
  { q: 'You may switch on your rear (red) fog lamp only when:', options: ['Visibility is seriously reduced by fog, mist or heavy rain','Driving at night on any road','It is raining lightly','A vehicle is following you too closely'], answer: 0 },
  { q: 'An orange/amber flashing beacon on a slow-moving vehicle indicates:', options: ['A police vehicle','A VIP convoy','A hazard, maintenance, or oversized vehicle — proceed with caution','A breakdown — you must stop and assist'], answer: 2 },
  { q: 'Driving while a prescribed medication impairs your ability to drive is:', options: ['Permitted — the prescription makes it legal','An offence if your ability to drive is impaired, regardless of the medication type','Only an offence if you cause an accident','Permitted for doctors and medical professionals'], answer: 1 },
  { q: 'When two vehicles approach an uncontrolled intersection simultaneously from opposite directions and one is turning right, who yields?', options: ['The vehicle turning right must yield to oncoming straight-through traffic','The oncoming vehicle must yield to the turning vehicle','The smaller vehicle yields','The slower vehicle yields'], answer: 0 },
  { q: 'If your accelerator pedal sticks while driving, you should:', options: ['Immediately switch off the ignition','Swerve off the road','Remain calm, apply the brakes firmly and shift to neutral — do not switch off the engine at high speed','Jump out of the vehicle'], answer: 2 },
  { q: 'A white broken line on the left edge of the road marks:', options: ['A no-stopping zone','The boundary of the road — you may cross it to stop safely on the shoulder','A bicycle lane','A bus lane'], answer: 1 },
  { q: 'Before a U-turn at a traffic-light-controlled intersection, you must ensure:', options: ['The traffic light is green','A "U-turn permitted" sign or marking is present and the turn can be made safely','No pedestrians are on the pavement','You are in the right lane'], answer: 1 },
  { q: 'The right lane on a multi-lane road is for:', options: ['Continuous high-speed travel','Emergency vehicles only','Overtaking only — return to the left lane when done','Heavy vehicles only'], answer: 2 },
  { q: 'In wet conditions, your following distance should be:', options: ['The same as in dry conditions','Increased to at least a 3-second gap (instead of the 2-second dry gap)','Reduced to keep up with traffic','Exactly 5 car lengths regardless of speed'], answer: 1 },
  { q: 'A "Yield" sign requires you to:', options: ['Stop completely before proceeding','Slow down and give way to any approaching traffic before entering the junction','Proceed without stopping if you judge the road to be clear','Flash headlights and proceed'], answer: 1 },
  { q: 'Pedestrians in a marked crossing with a green pedestrian signal:', options: ['Must wait for all vehicles to clear before crossing','Have right of way — vehicles must stop','Share right of way equally with turning vehicles','Must wait for all vehicles to complete their turns'], answer: 1 },
  { q: 'When driving on a gravel road, the most important adjustment is:', options: ['Increase tyre pressure','Reduce speed and increase following distance — stopping distances are longer','Drive on the shoulder','Shift to a lower gear at all times'], answer: 1 },
  { q: 'Cattle on the road at night require you to:', options: ['Hoot loudly and drive between them','Accelerate past them quickly','Reduce speed, switch on hazard lights and be prepared to stop','Move to the right lane only'], answer: 2 },
  { q: 'When passing animals on or near the road, you must NOT:', options: ['Reduce speed','Pass slowly','Use your horn suddenly — this may startle the animals','Keep both hands on the wheel'], answer: 2 },
  { q: 'A school bus stopped with flashing amber warning lights indicates:', options: ['The bus has broken down','Children are about to board or alight — reduce speed and be ready to stop','The bus is about to turn','You must stop 50 m behind it'], answer: 1 },
  { q: 'On a road with a posted speed limit of 60 km/h during heavy rain, you should:', options: ['Travel at exactly 60 km/h as posted','Reduce speed below 60 km/h — conditions require a safe speed regardless of the limit','Use the right lane and travel at 60 km/h','Switch on hazard lights and travel at 60 km/h'], answer: 1 },
  { q: 'A non-professional driver convicted of driving under the influence of alcohol faces:', options: ['A fine only','Possible imprisonment, licence suspension and a fine','A verbal warning only','A 3-month licence suspension only'], answer: 1 },
  { q: 'Road rage is best avoided by:', options: ['Asserting your right of way firmly','Matching the aggressor\'s speed','Allowing extra travel time, remaining calm and not retaliating','Using your hooter frequently to communicate'], answer: 2 },
  { q: 'When joining a freeway, you should match your speed to:', options: ['The minimum freeway speed','The speed of traffic already on the freeway before merging','30 km/h to merge safely','The vehicle immediately behind you on the ramp'], answer: 1 },
  { q: 'Your vehicle strikes and injures an animal on the road. You must:', options: ['Continue driving — stray animals are not your legal responsibility','Stop, try to find the owner, and if not found, report the incident to the police','Remove the animal from the road and continue','Report the incident by phone without stopping'], answer: 1 },
  { q: 'A red traffic light always means:', options: ['Slow down and proceed with caution','Stop — do not proceed until the light turns green or you have a green arrow','Stop only if other vehicles are crossing','Yield to pedestrians only'], answer: 1 },
  { q: 'Reversing on a freeway is:', options: ['Permitted only if you missed your exit','Permitted in a genuine emergency','Permitted at speeds below 10 km/h','Never permitted under any circumstances'], answer: 3 },
  { q: 'Your front wheels, when parking downhill against a kerb, should be turned:', options: ['Straight ahead','Away from the kerb (to the right)','Into the kerb (to the left)','It does not matter on a downhill'], answer: 2 },
  { q: 'The purpose of a safety (secondary) chain on a trailer coupling is:', options: ['To stop the trailer swaying','To prevent the trailer from detaching and causing danger if the main coupling fails','To limit trailer speed','To connect the trailer\'s electrical system'], answer: 1 },
  { q: 'You may NOT stop within how many metres of a tunnel, subway or narrow bridge?', options: ['3 m','6 m','9 m','15 m'], answer: 1 },
];

// ── Vehicle Controls questions (8 verified K53 controls questions) ────────────
const CONTROLS_QUESTIONS = [
  { q: 'When must you switch on your headlights?', options: ['Only when it is completely dark','Between sunset and sunrise AND when visibility is poor or persons not visible at 150 m','Only at night after 21:00','Only in a tunnel'], answer: 1 },
  { q: 'What does a red oil pressure warning light mean?', options: ['Oil change is due soon','Critical oil pressure loss — stop and switch off the engine immediately','Low oil level only','Normal at start-up — ignore it'], answer: 1 },
  { q: 'The handbrake must be applied when:', options: ['Stopping at a traffic light','Parking — especially on a slope, where it must be applied firmly','Only on steep inclines','Only on automatic vehicles'], answer: 1 },
  { q: 'A spongy brake pedal that goes close to the floor indicates:', options: ['Normal on older vehicles','Air in the brake lines or low brake fluid — have it checked immediately','Brakes are overheating','Wheel alignment needed'], answer: 1 },
  { q: 'Before driving, you must ensure your seat is adjusted so that:', options: ['You are comfortable','You can fully depress all pedals and see clearly over the steering wheel','Your back is straight only','You can reach the gear lever with ease'], answer: 1 },
  { q: 'The minimum legal tyre tread depth in South Africa is:', options: ['0.5 mm','1 mm','1.6 mm','3 mm'], answer: 1 },
  { q: 'Who is responsible for ensuring all passengers under 14 years are wearing seatbelts?', options: ['The passengers themselves','The driver','The vehicle owner','The parents only'], answer: 1 },
  { q: 'If your hooter (horn) is not working, you:', options: ['May drive normally — the hooter is optional','Must not drive the vehicle — a functioning hooter is a legal requirement','May drive only in daytime','Must display a "No hooter" warning sign'], answer: 1 },

  // ── Extended controls bank (questions 9–24) ──────────────────────────────
  { q: 'A red battery warning light while driving indicates:', options: ['The battery needs to be replaced soon','The charging system has failed — get to a workshop soon as the battery will drain','The battery is fully charged','Normal — this light briefly illuminates at start-up only'], answer: 1 },
  { q: 'The temperature gauge enters the red zone while driving. You should:', options: ['Continue to your destination at reduced speed','Immediately pull over safely, switch off the engine and allow it to cool before investigating','Open the bonnet immediately while the engine is running','Add cold water directly to the radiator straight away'], answer: 1 },
  { q: 'Engine oil level should be checked:', options: ['Only at annual service','When the engine is hot immediately after driving','When the engine is cold and on a level surface','Only when the oil warning light comes on'], answer: 2 },
  { q: 'An illuminated ABS warning light means:', options: ['The anti-lock braking system is active and working normally','The ABS may be faulty — normal braking still functions, but ABS assistance may be lost','The brakes have completely failed','You must pump the brakes manually in an emergency'], answer: 1 },
  { q: 'If the power steering warning light illuminates, you should expect:', options: ['The steering to lock completely','Heavier steering — the wheel still turns but requires more physical effort','The vehicle to pull sharply to one side','No change — the light is advisory only'], answer: 1 },
  { q: 'Before every journey, you should ensure:', options: ['The fuel gauge reads full','Mirrors are correctly adjusted, seatbelts are fastened, and controls are within reach','The air conditioning is functioning','The GPS is updated'], answer: 1 },
  { q: 'To park safely on a steep downhill slope (manual gearbox, kerb present), you should:', options: ['Apply handbrake, leave in neutral','Apply handbrake, engage a low forward gear, and turn wheels INTO the kerb (to the right)','Apply handbrake only and leave wheels straight','Leave in reverse gear only'], answer: 1 },
  { q: 'Coolant (antifreeze) level in the reservoir should be checked:', options: ['Only at service intervals','Regularly — ideally at every refuel, and when the engine is cold','Daily when the engine is warm','Only if the temperature gauge rises'], answer: 1 },
  { q: 'Brake fluid level dropping consistently indicates:', options: ['Normal consumption during heavy braking','A possible brake fluid leak — have the braking system inspected immediately','The brake pads are new and are bedding in','The fluid simply needs topping up regularly'], answer: 1 },
  { q: 'Both side mirrors and the interior rear-view mirror must be adjusted:', options: ['Only when a new driver uses the vehicle','Before driving — always check and adjust all mirrors before moving off','Once a month','Only after the seat position is changed'], answer: 1 },
  { q: 'A SRS (Supplemental Restraint System) warning light that stays on indicates:', options: ['Your seatbelts are too tight','A fault in the airbag system that must be inspected by a qualified technician','The airbags have been deployed previously','Normal operation — this light stays on in some vehicles'], answer: 1 },
  { q: 'Tyre pressure should ideally be checked:', options: ['After a long drive when the tyres are warm','When the tyres are cold — before driving or after less than 2 km','Once a month regardless of temperature','Only when a tyre appears visually flat'], answer: 1 },
  { q: 'Windscreen washers must be filled with:', options: ['Plain water only','A suitable washer fluid — the reservoir must be filled and the washers must function','Any liquid available','Nothing — modern vehicles do not require washer fluid'], answer: 1 },
  { q: 'Headlamps must be correctly aimed so that:', options: ['They illuminate as far ahead as possible on high beam','They do not dazzle oncoming drivers and illuminate the road effectively on dipped beam','They point slightly upward for better night visibility','They are aimed by feel and adjust automatically'], answer: 1 },
  { q: 'After a tyre blowout at high speed, you should first:', options: ['Brake hard immediately','Grip the steering wheel firmly, ease off the accelerator, and steer gently — brake only after regaining control','Swerve to the left immediately','Switch off the engine'], answer: 1 },
  { q: 'The vehicle\'s handbrake (parking brake) should hold the vehicle stationary:', options: ['Only on slopes up to 10%','Only when in "Park" (automatic vehicles)','On any gradient — if it cannot hold the vehicle it must be adjusted','Only when the footbrake is also applied'], answer: 2 },
];

// ── Sign question builder from ROAD_SIGNS data ────────────────────────────────
function buildSignQuestions(count = 28) {
  const eligible = ROAD_SIGNS.filter(s => s.options && s.options.length >= 4 && s.name && s.img);
  const shuffled = [...eligible].sort(() => Math.random() - 0.5).slice(0, count);
  return shuffled.map(sign => {
    const correct = sign.options[0];
    const opts = [...sign.options].sort(() => Math.random() - 0.5);
    return {
      signId: sign.id,
      img: sign.img,
      name: sign.name,
      hint: sign.hint,
      q: `What does this road sign mean?`,
      options: opts,
      answer: opts.indexOf(correct),
      explanation: sign.meaning + (sign.action ? ' ' + sign.action : ''),
    };
  });
}

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function shuffleOptions(q) {
  const correct = q.options[q.answer];
  const opts = shuffle(q.options);
  return { ...q, options: opts, answer: opts.indexOf(correct) };
}

// ── Main component ────────────────────────────────────────────────────────────
export default function K53LearnerExam({ onBack, onPass, onGoToGame }) {
  const [screen, setScreen] = useState('intro'); // intro | exam | review | result
  const [showSupport, setShowSupport] = useState(false);
  const [section, setSection] = useState(0); // 0=signs 1=rules 2=controls
  const [allQuestions, setAllQuestions] = useState(null);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // flat key → chosen index
  const [chosen, setChosen] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(EXAM_TIME_SECONDS);
  const [started, setStarted] = useState(false);
  const timerRef = useRef(null);

  const SECTIONS = [
    { key: 'signs',    label: 'Road Signs',       icon: '🚦', questions: allQuestions?.signs    || [], pass: PASS_MARKS.signs,    total: SECTION_TOTALS.signs },
    { key: 'rules',    label: 'Rules of Road',    icon: '📋', questions: allQuestions?.rules    || [], pass: PASS_MARKS.rules,    total: SECTION_TOTALS.rules },
    { key: 'controls', label: 'Vehicle Controls', icon: '🔩', questions: allQuestions?.controls || [], pass: PASS_MARKS.controls, total: SECTION_TOTALS.controls },
  ];

  const startExam = useCallback(() => {
    const signQs = buildSignQuestions(28);
    const rulesQs = shuffle([...RULES_QUESTIONS]).slice(0, 28).map(shuffleOptions);
    const controlsQs = shuffle([...CONTROLS_QUESTIONS]).slice(0, 8).map(shuffleOptions);
    setAllQuestions({ signs: signQs, rules: rulesQs, controls: controlsQs });
    setSection(0);
    setQIdx(0);
    setAnswers({});
    setChosen(null);
    setRevealed(false);
    setTimeLeft(EXAM_TIME_SECONDS);
    setStarted(true);
    setScreen('exam');
  }, []);

  // Timer
  useEffect(() => {
    if (!started || screen !== 'exam') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); setScreen('result'); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [started, screen]);

  const currentSection = SECTIONS[section];
  const currentQ = currentSection?.questions[qIdx];
  const globalKey = `${section}-${qIdx}`;

  const handleAnswer = useCallback((optIdx) => {
    if (revealed) return;
    setChosen(optIdx);
    setRevealed(true);
    const correct = optIdx === currentQ.answer;
    if (correct) { sfx('correct'); hapticCorrect(); }
    else { sfx('wrong'); hapticWrong(); }
    setAnswers(a => ({ ...a, [globalKey]: optIdx }));
    recordGameAnswer('mockexam', globalKey, correct);
  }, [revealed, currentQ, globalKey]);

  const handleNext = useCallback(() => {
    const nextIdx = qIdx + 1;
    if (nextIdx < currentSection.questions.length) {
      setQIdx(nextIdx);
      setChosen(answers[`${section}-${nextIdx}`] ?? null);
      setRevealed(answers[`${section}-${nextIdx}`] !== undefined);
    } else if (section < SECTIONS.length - 1) {
      const nextSection = section + 1;
      setSection(nextSection);
      setQIdx(0);
      setChosen(answers[`${nextSection}-0`] ?? null);
      setRevealed(answers[`${nextSection}-0`] !== undefined);
    } else {
      clearInterval(timerRef.current);
      setScreen('result');
    }
  }, [qIdx, section, currentSection, answers, SECTIONS.length]);

  const handlePrev = useCallback(() => {
    if (qIdx > 0) {
      const prevIdx = qIdx - 1;
      setQIdx(prevIdx);
      setChosen(answers[`${section}-${prevIdx}`] ?? null);
      setRevealed(answers[`${section}-${prevIdx}`] !== undefined);
    } else if (section > 0) {
      const prevSection = section - 1;
      const prevQs = SECTIONS[prevSection].questions;
      const prevIdx = prevQs.length - 1;
      setSection(prevSection);
      setQIdx(prevIdx);
      setChosen(answers[`${prevSection}-${prevIdx}`] ?? null);
      setRevealed(answers[`${prevSection}-${prevIdx}`] !== undefined);
    }
  }, [qIdx, section, answers, SECTIONS]);

  // ── Score calculation ──────────────────────────────────────────────────────
  const scores = SECTIONS.map((sec, si) => {
    const correct = sec.questions.filter((_, qi) => {
      const chosen = answers[`${si}-${qi}`];
      return chosen !== undefined && chosen === sec.questions[qi].answer;
    }).length;
    const answered = sec.questions.filter((_, qi) => answers[`${si}-${qi}`] !== undefined).length;
    return { correct, answered, pass: correct >= sec.pass };
  });
  const allPassed = scores.every(s => s.pass);

  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  // ── Intro ──────────────────────────────────────────────────────────────────
  if (screen === 'intro') return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.font }}>
      {SA_STRIPE}
      <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
          style={{ background: 'none', border: 'none', color: T.dim, fontSize: 22, cursor: 'pointer' }}>←</motion.button>
        <div>
          <div style={{ fontWeight: 800, fontSize: T.fontSizeLg }}>K53 Learner's Exam</div>
          <div style={{ color: T.dim, fontSize: T.fontSize - 2 }}>Official DLTC format — 64 questions</div>
        </div>
      </div>

      <div style={{ padding: '24px 20px' }}>
        <div style={{ background: 'rgba(0,122,77,0.08)', border: '1px solid rgba(0,122,77,0.25)', borderRadius: T.radiusLg, padding: '18px 20px', marginBottom: 20 }}>
          <div style={{ fontWeight: 700, color: T.green, marginBottom: 10, fontSize: T.fontSizeLg }}>Exam Structure</div>
          {[
            { icon: '🚦', label: 'Road Signs', q: 28, pass: 23 },
            { icon: '📋', label: 'Rules of Road', q: 28, pass: 22 },
            { icon: '🔩', label: 'Vehicle Controls', q: 8, pass: 6 },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${T.border}` }}>
              <span>{s.icon} {s.label}</span>
              <span style={{ color: T.dim }}>{s.q} questions — pass {s.pass}/{s.q}</span>
            </div>
          ))}
          <div style={{ marginTop: 12, color: T.dim, fontSize: T.fontSize - 1 }}>
            You must pass ALL THREE sections to pass the exam. You have 60 minutes.
          </div>
        </div>

        <div style={{ background: T.surface, borderRadius: T.radius, padding: '14px 16px', marginBottom: 20, borderLeft: `3px solid ${T.gold}` }}>
          <div style={{ fontWeight: 700, color: T.gold, marginBottom: 6 }}>Tips</div>
          <div style={{ color: T.dim, fontSize: T.fontSize - 1, lineHeight: 1.6 }}>
            • You can go back and change answers before submitting<br />
            • Road sign questions pull randomly from our 201-sign database<br />
            • Each section is scored independently
          </div>
        </div>

        <motion.button whileTap={{ scale: 0.97 }} onClick={startExam}
          style={{ width: '100%', background: T.green, border: 'none', borderRadius: T.radiusLg, padding: 18, color: '#fff', fontWeight: 800, fontSize: T.fontSizeLg, fontFamily: T.font, cursor: 'pointer' }}>
          Start Exam — 60 Minutes
        </motion.button>
      </div>
    </div>
  );

  // ── Mental health support (shown after a fail) ────────────────────────────
  if (screen === 'result' && showSupport) {
    const failedSections = SECTIONS.filter((_, si) => !scores[si].pass).map(sec => sec.key);
    const totalCorrect   = scores.reduce((sum, s) => sum + s.correct, 0);
    return (
      <MentalHealthSupport
        failedSections={failedSections}
        score={totalCorrect}
        total={64}
        onRetry={() => { setShowSupport(false); startExam(); }}
        onBack={onBack}
        onGoToGame={onGoToGame}
      />
    );
  }

  // ── Result screen ──────────────────────────────────────────────────────────
  if (screen === 'result') return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.font }}>
      {SA_STRIPE}
      <div style={{ padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>{allPassed ? '🏆' : '📘'}</div>
        <div style={{ fontWeight: 800, fontSize: 28, color: allPassed ? T.green : T.red }}>
          {allPassed ? 'PASS' : 'FAIL'}
        </div>
        <div style={{ color: T.dim, marginTop: 4, marginBottom: 24 }}>
          {allPassed ? 'You are ready for the real test!' : 'Keep practising — you need to pass all three sections.'}
        </div>

        {SECTIONS.map((sec, si) => {
          const s = scores[si];
          const pct = Math.round((s.correct / sec.total) * 100);
          return (
            <div key={sec.key} style={{ background: T.surface, borderRadius: T.radius, padding: '14px 16px', marginBottom: 12, borderLeft: `4px solid ${s.pass ? T.green : T.red}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700 }}>{sec.icon} {sec.label}</span>
                <span style={{ color: s.pass ? T.green : T.red, fontWeight: 800 }}>{s.correct}/{sec.total} ({pct}%)</span>
              </div>
              <div style={{ color: T.dim, fontSize: T.fontSize - 2, marginTop: 4 }}>
                {s.pass ? `✓ PASSED (need ${sec.pass})` : `✗ Need ${sec.pass}, got ${s.correct}`}
              </div>
              <div style={{ height: 4, background: T.border, borderRadius: 2, marginTop: 8 }}>
                <div style={{ height: '100%', borderRadius: 2, background: s.pass ? T.green : T.red, width: `${pct}%`, transition: 'width 0.6s' }} />
              </div>
            </div>
          );
        })}

        <div style={{ marginTop: 24, display: 'grid', gap: 12 }}>
          {!allPassed && (
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowSupport(true)}
              style={{ background: 'linear-gradient(135deg,rgba(0,122,77,0.2),rgba(68,114,202,0.15))', border: '1px solid rgba(0,122,77,0.35)', borderRadius: T.radius, padding: '16px', color: T.text, fontWeight: 800, fontFamily: T.font, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>💙</span>
              <span>Get Support &amp; Study Plan</span>
            </motion.button>
          )}
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => {
            const sigScore = scores[0]; const ruleScore = scores[1]; const ctrlScore = scores[2];
            const text = `🇿🇦 K53 Learner's Exam Simulator\n🚦 Signs: ${sigScore.correct}/28\n📋 Rules: ${ruleScore.correct}/28\n🔩 Controls: ${ctrlScore.correct}/8\n${allPassed ? '✅ PASS' : '❌ FAIL — keep practising!'}\nK53 Drill Master`;
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
          }} style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)', borderRadius: T.radius, padding: 14, color: '#25d366', fontWeight: 700, fontFamily: T.font, cursor: 'pointer' }}>
            💬 Share Results on WhatsApp
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={startExam}
            style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: 14, color: T.text, fontWeight: 700, fontFamily: T.font, cursor: 'pointer' }}>
            🔄 Try Again (New Questions)
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={onBack}
            style={{ background: 'none', border: 'none', color: T.dim, fontFamily: T.font, cursor: 'pointer', padding: 10 }}>
            ← Back to Home
          </motion.button>
        </div>
      </div>
    </div>
  );

  // ── Exam screen ────────────────────────────────────────────────────────────
  if (!currentQ) return null;

  const totalQ = SECTIONS.reduce((a, s) => a + s.questions.length, 0);
  const globalIdx = SECTIONS.slice(0, section).reduce((a, s) => a + s.questions.length, 0) + qIdx;
  const timerColor = timeLeft < 300 ? T.red : timeLeft < 600 ? T.gold : T.green;

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.font }}>
      {SA_STRIPE}

      {/* Header */}
      <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: T.surface, borderBottom: `1px solid ${T.border}` }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => { clearInterval(timerRef.current); onBack(); }}
          style={{ background: 'none', border: 'none', color: T.dim, fontSize: 20, cursor: 'pointer' }}>←</motion.button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: T.fontSize - 1, color: currentSection.key === 'signs' ? '#FFB612' : currentSection.key === 'rules' ? T.green : '#4472CA' }}>
            {currentSection.icon} {currentSection.label}
          </div>
          <div style={{ color: T.dim, fontSize: T.fontSize - 3 }}>Q{qIdx + 1}/{currentSection.questions.length} · {globalIdx + 1}/{totalQ} total</div>
        </div>
        <div style={{ fontWeight: 800, color: timerColor, fontSize: T.fontSizeLg }}>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Section tabs */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}` }}>
        {SECTIONS.map((sec, si) => {
          const sAnswered = sec.questions.filter((_, qi) => answers[`${si}-${qi}`] !== undefined).length;
          const active = si === section;
          return (
            <button key={sec.key} onClick={() => { setSection(si); setQIdx(0); setChosen(answers[`${si}-0`] ?? null); setRevealed(answers[`${si}-0`] !== undefined); }}
              style={{ flex: 1, padding: '8px 4px', background: active ? T.surface : 'transparent', border: 'none', borderBottom: active ? `2px solid ${T.green}` : '2px solid transparent', color: active ? T.text : T.dim, fontSize: T.fontSize - 3, fontFamily: T.font, cursor: 'pointer' }}>
              {sec.icon} {sAnswered}/{sec.total}
            </button>
          );
        })}
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: T.border }}>
        <div style={{ height: '100%', background: T.green, width: `${((globalIdx + 1) / totalQ) * 100}%`, transition: 'width 0.2s' }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={globalKey} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
          style={{ padding: '20px 16px' }}>

          {/* Sign image (signs section only) */}
          {currentSection.key === 'signs' && currentQ.img && (
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <img src={`/signs/${currentQ.img}`} alt="" style={{ width: 140, height: 140, objectFit: 'contain', background: T.surface, borderRadius: 12, padding: 8 }} />
              {revealed && currentQ.hint && (
                <div style={{ marginTop: 6, color: T.dim, fontSize: T.fontSize - 2 }}>{currentQ.hint}</div>
              )}
            </div>
          )}

          {/* Question */}
          <div style={{ fontWeight: 700, fontSize: T.fontSizeLg, lineHeight: 1.4, marginBottom: 16, color: T.text }}>
            {currentQ.q}
          </div>

          {/* Options */}
          <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
            {currentQ.options.map((opt, idx) => {
              const isCorrect = idx === currentQ.answer;
              const isChosen = idx === chosen;
              let bg = T.surface, border = T.border, col = T.text;
              if (!revealed && isChosen) { bg = 'rgba(255,182,18,0.1)'; border = T.gold; col = T.gold; }
              if (revealed && isCorrect) { bg = 'rgba(0,122,77,0.15)'; border = T.green; col = '#4ade80'; }
              if (revealed && isChosen && !isCorrect) { bg = 'rgba(222,56,49,0.15)'; border = T.red; col = '#f87171'; }
              return (
                <motion.button key={idx} whileTap={{ scale: revealed ? 1 : 0.97 }} onClick={() => handleAnswer(idx)}
                  style={{ background: bg, border: `2px solid ${border}`, borderRadius: T.radius, padding: '13px 14px', color: col, fontFamily: T.font, fontSize: T.fontSize - 1, fontWeight: 600, cursor: revealed ? 'default' : 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}>
                  <span><b style={{ marginRight: 8 }}>{String.fromCharCode(65 + idx)}.</b>{opt}</span>
                  {revealed && isCorrect && <span style={{ fontSize: 18 }}>✓</span>}
                  {revealed && isChosen && !isCorrect && <span style={{ fontSize: 18 }}>✗</span>}
                </motion.button>
              );
            })}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {revealed && currentQ.explanation && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                style={{ background: T.surfaceAlt || T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: '12px 14px', marginBottom: 16, fontSize: T.fontSize - 1, color: T.dim, lineHeight: 1.5 }}>
                {currentQ.explanation}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nav buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <motion.button whileTap={{ scale: 0.97 }} onClick={handlePrev}
              disabled={section === 0 && qIdx === 0}
              style={{ flex: 1, background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: 14, color: (section === 0 && qIdx === 0) ? T.dim : T.text, fontFamily: T.font, fontWeight: 700, cursor: (section === 0 && qIdx === 0) ? 'not-allowed' : 'pointer' }}>
              ← Prev
            </motion.button>
            {section < SECTIONS.length - 1 || qIdx < currentSection.questions.length - 1 ? (
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleNext}
                style={{ flex: 2, background: T.green, border: 'none', borderRadius: T.radius, padding: 14, color: '#fff', fontFamily: T.font, fontWeight: 800, cursor: 'pointer' }}>
                Next →
              </motion.button>
            ) : (
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => { clearInterval(timerRef.current); setScreen('result'); if (allPassed) { hapticPass(); onPass?.(); } }}
                style={{ flex: 2, background: '#FFB612', border: 'none', borderRadius: T.radius, padding: 14, color: '#000', fontFamily: T.font, fontWeight: 800, cursor: 'pointer' }}>
                Submit Exam
              </motion.button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
