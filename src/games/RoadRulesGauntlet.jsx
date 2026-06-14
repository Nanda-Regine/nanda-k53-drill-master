import { useState, useEffect, useRef, useCallback } from 'react';
import T from '../theme.js';
import { incrementQuestionCount, isGateHit } from '../freemium.js';
import { prepareAll, stableId } from '../utils/quizHelpers.js';
import { recordResult } from '../utils/progressHistory.js';
import { recordAnswer } from '../utils/spacedRepetition.js';
import { recordGameAnswer } from '../utils/masteryStore.js';
import { sfx } from '../utils/sounds.js';
import { hapticCorrect, hapticWrong, hapticPass } from '../utils/haptics.js';

// ── Question Bank – Rounds 1-12 (original) + 13-15 (new) ─────────────────────

const ROUNDS = [
  // ── ROUND 1: Speed & Distance ──────────────────────────────────────────────
  {
    id: 1, title: 'Speed & Distance', icon: '🏎️',
    questions: [
      { q: 'What is the general speed limit on a public road in a built-up area?', options: ['40 km/h','60 km/h','80 km/h','100 km/h'], answer: 1 },
      { q: 'What is the general speed limit on a freeway?', options: ['100 km/h','110 km/h','120 km/h','140 km/h'], answer: 2 },
      { q: 'What is the minimum following distance you should maintain behind the vehicle in front?', options: ['1 second','2 seconds','3 seconds','4 seconds'], answer: 2 },
      { q: 'At 60 km/h, what is the typical stopping distance on a dry road?', options: ['18 m','36 m','54 m','72 m'], answer: 2 },
      { q: 'Which factor most increases stopping distance?', options: ['Bright sunshine','Wet road surface','Engine braking','Good tyres'], answer: 1 },
    ],
  },
  // ── ROUND 2: Road Signs ────────────────────────────────────────────────────
  {
    id: 2, title: 'Road Signs', icon: '🚧',
    questions: [
      { q: 'A red octagonal sign means:', options: ['Yield','Stop completely','No entry','Danger ahead'], answer: 1 },
      { q: 'A yellow diamond sign indicates:', options: ['A regulation','A warning','A guide','An information sign'], answer: 1 },
      { q: 'A circular sign with a red border is a:', options: ['Warning sign','Information sign','Prohibition sign','Guide sign'], answer: 2 },
      { q: 'A blue rectangular sign is a:', options: ['Warning','Prohibition','Command','Information sign'], answer: 3 },
      { q: 'The "yield" sign is which shape?', options: ['Rectangle','Circle','Inverted triangle','Diamond'], answer: 2 },
    ],
  },
  // ── ROUND 3: Right of Way ──────────────────────────────────────────────────
  {
    id: 3, title: 'Right of Way', icon: '🛑',
    questions: [
      { q: 'At a four-way stop with simultaneous arrivals, who goes first?', options: ['The vehicle on the left','The vehicle on the right','The largest vehicle','The vehicle going straight'], answer: 1 },
      { q: 'When must you yield to a pedestrian?', options: ['Never on a busy road','Only at zebra crossings','When they are in or about to enter a pedestrian crossing','Only at traffic lights'], answer: 2 },
      { q: 'An emergency vehicle with sirens must be given right of way by:', options: ['Moving to the left and stopping if necessary','Speeding up to get out of the way','Hooting and continuing','Pulling to the right'], answer: 0 },
      { q: 'When joining a freeway, you must yield to:', options: ['Traffic on the on-ramp','Traffic already on the freeway','Emergency vehicles only','No one — you have right of way'], answer: 1 },
      { q: 'At an uncontrolled intersection, you must yield to:', options: ['Traffic approaching from your left','Traffic on the road to your right','Traffic from ahead','All traffic'], answer: 1 },
    ],
  },
  // ── ROUND 4: Signals & Lights ──────────────────────────────────────────────
  {
    id: 4, title: 'Signals & Lights', icon: '💡',
    questions: [
      { q: 'When should you use your hazard lights?', options: ['When double-parking','When your vehicle is a hazard to others (breakdown, emergency stop)','Any time it is raining','When you are lost'], answer: 1 },
      { q: 'You must use headlights from:', options: ['30 minutes after sunset to 30 minutes before sunrise','One hour after sunset','When it is dark only','Sunset to sunrise'], answer: 0 },
      { q: 'Flashing high-beam lights from an oncoming vehicle usually means:', options: ['You should speed up','There is a hazard or obstacle ahead','The driver is angry','Your lights are too bright'], answer: 1 },
      { q: 'Before changing lanes you should:', options: ['Hoot and change quickly','Check mirrors, signal, check blind spot, then change','Signal and immediately change','Change and then signal'], answer: 1 },
      { q: 'Amber traffic light means:', options: ['Speed up to clear the intersection','Stop if you can do so safely','Yield to pedestrians only','Always stop'], answer: 1 },
    ],
  },
  // ── ROUND 5: Alcohol & Drugs ───────────────────────────────────────────────
  {
    id: 5, title: 'Alcohol & Drugs', icon: '🍺',
    questions: [
      { q: 'The legal blood alcohol limit for a professional driver in South Africa is:', options: ['0.05 g/100 ml','0.02 g/100 ml','0 g/100 ml','0.08 g/100 ml'], answer: 1 },
      { q: 'The legal blood alcohol limit for a non-professional driver is:', options: ['0.05 g/100 ml','0.02 g/100 ml','0 g/100 ml','0.08 g/100 ml'], answer: 0 },
      { q: 'How does alcohol affect driving?', options: ['Improves reaction time','Impairs judgment and slows reaction time','Has no effect at low levels','Makes drivers more alert'], answer: 1 },
      { q: 'A breathalyser test can be required by a traffic officer:', options: ['Only after an accident','At any time','Only at roadblocks','Only if you are swerving'], answer: 1 },
      { q: 'Refusing a breathalyser test in South Africa is:', options: ['Your legal right','A criminal offence','Allowed if you feel fine','Only an offence at night'], answer: 1 },
    ],
  },
  // ── ROUND 6: Overtaking ────────────────────────────────────────────────────
  {
    id: 6, title: 'Overtaking', icon: '🚗',
    questions: [
      { q: 'You may NOT overtake when:', options: ['On a straight road','Approaching the crest of a hill','On a wide road','The vehicle ahead is slow'], answer: 1 },
      { q: 'When overtaking, you should:', options: ['Move to the right, accelerate, pass and return promptly','Move to the left to get a better view then overtake','Flash lights and hoot first','Overtake slowly'], answer: 0 },
      { q: 'You must NOT overtake on a solid white centre line because:', options: ['You may not cross it','It indicates a no-hoot zone','It marks a school zone','It means a bus stop ahead'], answer: 0 },
      { q: 'What should you do before overtaking a large truck?', options: ['Get very close to see past it','Ensure you can see the road is clear ahead and have enough speed','Hoot continuously','Flash headlights from behind'], answer: 1 },
      { q: 'After overtaking, you should return to the left lane when:', options: ['You can see the overtaken vehicle in your rear-view mirror','Immediately after passing','As soon as possible regardless of visibility','The road widens'], answer: 0 },
    ],
  },
  // ── ROUND 7: Pedestrians & Cyclists ───────────────────────────────────────
  {
    id: 7, title: 'Pedestrians & Cyclists', icon: '🚶',
    questions: [
      { q: 'Pedestrians should walk on which side of the road when there is no pavement?', options: ['Right side facing oncoming traffic','Left side with traffic','Either side','The centre'], answer: 0 },
      { q: 'When must you yield to a pedestrian at a marked crossing?', options: ['Only when the pedestrian has a green man signal','Whenever a pedestrian is in the crossing','Only at night','Only in school zones'], answer: 1 },
      { q: 'When passing a cyclist you should leave at least:', options: ['0.5 m','1 m','1.5 m','3 m'], answer: 2 },
      { q: 'A driver must NOT park within how many metres of a pedestrian crossing?', options: ['3 m','5 m','9 m','15 m'], answer: 2 },
      { q: 'Children playing near the road require you to:', options: ['Hoot and continue at the same speed','Reduce speed and be prepared to stop','Speed up to pass quickly','Use high beams'], answer: 1 },
    ],
  },
  // ── ROUND 8: Parking & Stopping ────────────────────────────────────────────
  {
    id: 8, title: 'Parking & Stopping', icon: '🅿️',
    questions: [
      { q: 'You may NOT park within how many metres of a fire hydrant?', options: ['1 m','3 m','5 m','10 m'], answer: 1 },
      { q: 'When parking on a hill facing downhill, your wheels should be:', options: ['Straight ahead','Turned to the right (into the kerb)','Turned to the left','It does not matter'], answer: 1 },
      { q: 'Double parking means:', options: ['Parking in two bays','Parking alongside a parked vehicle','Parking in a loading zone','Parking facing the wrong direction'], answer: 1 },
      { q: 'Before getting out of a parked vehicle you should always:', options: ['Sound the horn','Check mirrors and over your shoulder for cyclists and traffic','Open the door quickly','Leave the engine running'], answer: 1 },
      { q: 'You must NOT stop within how many metres of an intersection?', options: ['3 m','5 m','9 m','15 m'], answer: 2 },
    ],
  },
  // ── ROUND 9: Hazardous Conditions ─────────────────────────────────────────
  {
    id: 9, title: 'Hazardous Conditions', icon: '⚠️',
    questions: [
      { q: 'In heavy rain, your first action should be:', options: ['Increase speed to pass the rain quickly','Reduce speed and increase following distance','Switch on hazard lights and stop anywhere','Stay in the right lane'], answer: 1 },
      { q: 'Aquaplaning occurs when:', options: ['Your engine overheats','A thin water film lifts tyres off the road','You brake on gravel','High-beam lights reflect off the road'], answer: 1 },
      { q: 'When driving in fog, you should use:', options: ['High beams','Low beams and fog lights','Hazard lights only','No lights — they reflect back'], answer: 1 },
      { q: 'If your brakes fail, you should first:', options: ['Immediately steer into a wall','Apply the handbrake progressively while pumping brake pedal','Open the door and jump out','Continue at the same speed'], answer: 1 },
      { q: 'Black ice is most likely to occur:', options: ['On a sunny afternoon','In shaded areas and on bridges during near-freezing temperatures','During heavy rain','In tunnels only'], answer: 1 },
    ],
  },
  // ── ROUND 10: Vehicle Controls ─────────────────────────────────────────────
  {
    id: 10, title: 'Vehicle Controls', icon: '🔩',
    questions: [
      { q: 'ABS (Anti-lock Braking System) allows you to:', options: ['Brake harder on wet roads without skidding and maintain steering','Stop in half the distance','Brake automatically in an emergency','Accelerate faster'], answer: 0 },
      { q: 'What does EBD stand for?', options: ['Electronic Brake Distribution','Engine Braking Device','Emergency Braking Display','Extended Battery Duration'], answer: 0 },
      { q: 'A flashing oil pressure light means:', options: ['Oil change is due','Stop the engine immediately — serious oil pressure loss','Oil level is slightly low','Normal at start-up only'], answer: 1 },
      { q: 'The purpose of a differential is to:', options: ['Lock wheels during braking','Allow driven wheels to rotate at different speeds when cornering','Distribute weight evenly','Control engine speed'], answer: 1 },
      { q: 'Power steering fluid should be checked:', options: ['Only when the car pulls to one side','Monthly and during routine services','Annually only','Never — it is sealed'], answer: 1 },
    ],
  },
  // ── ROUND 11: First Aid ────────────────────────────────────────────────────
  {
    id: 11, title: 'First Aid at Accidents', icon: '🩺',
    questions: [
      { q: 'The first thing to do at an accident scene is:', options: ['Call your insurance','Assess danger to yourself and others','Take photos','Move the injured'], answer: 1 },
      { q: 'An unconscious breathing casualty should be placed in:', options: ['Face-up (supine)','The recovery position','A seated position','Standing'], answer: 1 },
      { q: 'Correct CPR compression depth for an adult is:', options: ['1–2 cm','3–4 cm','5–6 cm','7–8 cm'], answer: 2 },
      { q: 'To control severe bleeding, you should:', options: ['Apply direct pressure with a clean cloth','Remove any embedded objects first','Apply a loose bandage','Rinse with cold water'], answer: 0 },
      { q: 'A casualty in shock should be:', options: ['Given water to drink','Kept warm, laid down with legs elevated (if no spinal injury)','Left to rest in a sitting position','Given aspirin'], answer: 1 },
    ],
  },
  // ── ROUND 12: Motorways & Freeways ────────────────────────────────────────
  {
    id: 12, title: 'Motorways & Freeways', icon: '🛣️',
    questions: [
      { q: 'On a freeway, the right lane is for:', options: ['Slow vehicles','Overtaking only — not continuous travel','Heavy vehicles','Emergency vehicles'], answer: 1 },
      { q: 'The minimum speed limit on a South African freeway is:', options: ['40 km/h','60 km/h','80 km/h','There is no minimum'], answer: 1 },
      { q: 'You may reverse on a freeway:', options: ['Only in an emergency','Never','If you missed your exit','Only to help a broken-down vehicle'], answer: 1 },
      { q: 'On a freeway, you must NOT stop except:', options: ['To take a phone call','At designated rest areas or in a genuine emergency','When you are tired','To ask for directions'], answer: 1 },
      { q: 'When leaving a freeway, you should reduce speed:', options: ['On the freeway before the exit','After turning into the off-ramp','Only on the off-ramp','Well before the exit ramp'], answer: 2 },
    ],
  },

  // ── ROUND 13: Dangerous Goods (NEW) ───────────────────────────────────────
  {
    id: 13, title: 'Dangerous Goods', icon: '☢️',
    questions: [
      { q: 'Flammable liquids are classified under which UN dangerous goods class?', options: ['Class 2','Class 3','Class 4','Class 5'], answer: 1 },
      { q: 'An Emergency Information Panel (EIP) must be displayed:', options: ['Only at the rear','Front and rear of the vehicle','Only on the driver\'s door','On all four sides'], answer: 1 },
      { q: 'A HAZCHEM code provides:', options: ['The driver\'s hazard rating','Emergency action instructions for first responders','The insurance category','Route guidance'], answer: 1 },
      { q: 'When a dangerous goods vehicle is involved in a spillage, the driver must:', options: ['Continue to destination and report later','Stop, warn traffic and contact emergency services','Move goods to the roadside','Dilute the spill with water'], answer: 1 },
      { q: 'Dangerous goods vehicles may NOT park overnight within how many metres of inhabited buildings?', options: ['50 m','100 m','200 m','500 m'], answer: 1 },
    ],
  },

  // ── ROUND 14: Brake Systems (NEW) ─────────────────────────────────────────
  {
    id: 14, title: 'Brake Systems', icon: '🛞',
    questions: [
      { q: 'Brake fade is caused by:', options: ['Brakes being applied too gently','Brakes overheating from prolonged use','Wet road conditions','Brake squeaking'], answer: 1 },
      { q: 'Air-brake reservoirs on heavy vehicles should be drained of moisture:', options: ['Annually','Monthly','Daily','Only when the warning light appears'], answer: 2 },
      { q: 'ABS allows the driver to:', options: ['Stop in a shorter distance on all surfaces','Maintain steering control while braking hard','Brake harder than without ABS','Brake automatically in emergencies'], answer: 1 },
      { q: 'If air pressure in an air-brake system drops too low, the fail-safe system will:', options: ['Gradually soften the brakes','Automatically apply the brakes','Sound a horn only','Release all brakes'], answer: 1 },
      { q: 'On a long downhill, the BEST technique to prevent brake fade is:', options: ['Ride the brakes continuously','Use engine braking / retarder with short firm brake applications','Stay in top gear and coast','Apply the handbrake periodically'], answer: 1 },
    ],
  },

  // ── ROUND 15: Load Securing ────────────────────────────────────────────────
  {
    id: 15, title: 'Load Securing', icon: '📦',
    questions: [
      { q: 'The driver is responsible for ensuring the load is:', options: ['Simply covered with a tarpaulin','Properly secured so it cannot shift or fall','Placed as high as possible','Loaded by the consignor only'], answer: 1 },
      { q: 'The maximum overhang of a load at the rear of a vehicle in South Africa is:', options: ['1 m','1.5 m','3 m','4 m'], answer: 1 },
      { q: 'A red flag or light is required when a load overhangs by more than:', options: ['0.3 m','0.5 m','1 m','1.5 m'], answer: 2 },
      { q: 'The centre of gravity of a loaded vehicle affects:', options: ['Only fuel consumption','Stability, cornering and rollover risk','Engine temperature','Tyre wear only'], answer: 1 },
      { q: 'Lashing straps must be rated to at least what percentage of the load\'s weight?', options: ['25%','50%','75%','100%'], answer: 3 },
    ],
  },

  // ── ROUND 16: Licence & Documentation ─────────────────────────────────────
  {
    id: 16, title: 'Licence & Documentation', icon: '📋',
    questions: [
      { q: 'A South African learner\'s licence is valid for how long?', options: ['12 months','18 months','24 months','36 months'], answer: 3 },
      { q: 'You hold a learner\'s licence. A licensed supervisor must sit where?', options: ['In the back seat','In the front passenger seat','Anywhere in the vehicle','They may follow in another car'], answer: 1 },
      { q: 'Your driving licence must be renewed every:', options: ['2 years','3 years','5 years','10 years'], answer: 2 },
      { q: 'When must you carry your driving licence while driving?', options: ['Only on long trips','At all times while driving','Only when travelling between provinces','Only if under 25'], answer: 1 },
      { q: 'If your driving licence is suspended, you may:', options: ['Continue driving to work only','Not drive any motor vehicle on a public road','Drive only during daylight hours','Drive with a supervisor only'], answer: 1 },
      { q: 'A Code B licence allows you to drive vehicles with a gross vehicle mass of up to:', options: ['1 750 kg','2 500 kg','3 500 kg','5 000 kg'], answer: 2 },
      { q: 'You must be at least how old to apply for a Code B learner\'s licence?', options: ['16','17','18','21'], answer: 1 },
    ],
  },

  // ── ROUND 17: Towing & Trailers ────────────────────────────────────────────
  {
    id: 17, title: 'Towing & Trailers', icon: '🚛',
    questions: [
      { q: 'When towing a trailer, your following distance should be:', options: ['The same as normal','At least double the normal distance','At least 50 m always','3 seconds in good conditions'], answer: 1 },
      { q: 'A trailer with a gross vehicle mass over 750 kg must be fitted with:', options: ['Only coupling brakes','Its own brake system that can be applied from the towing vehicle','A handbrake only','No brakes are required'], answer: 1 },
      { q: 'The maximum speed when towing most trailers on a freeway is:', options: ['80 km/h','100 km/h','120 km/h','110 km/h'], answer: 1 },
      { q: 'Trailer sway (snake) is best corrected by:', options: ['Braking hard','Accelerating to straighten the trailer','Releasing the accelerator and steering gently straight — do not brake hard','Steering sharply against the sway'], answer: 2 },
      { q: 'A trailer must have how many rear red reflectors?', options: ['One','Two','Four','It depends on trailer width'], answer: 1 },
      { q: 'The coupling between a towing vehicle and trailer must be fitted with:', options: ['A safety chain or cable only','A coupling device AND a secondary safety chain or cable','Only a ball hitch','Any connection strong enough for the load'], answer: 1 },
    ],
  },

  // ── ROUND 18: Intersections & Turning ──────────────────────────────────────
  {
    id: 18, title: 'Intersections & Turning', icon: '↩️',
    questions: [
      { q: 'When turning right at an intersection, you should position your vehicle:', options: ['As far left as possible','As far right in your lane (near the centre line) as possible','In the centre of the road','It does not matter'], answer: 1 },
      { q: 'A U-turn is prohibited:', options: ['On any multi-lane road','Where it cannot be made safely, or where signs prohibit it','Always on a public road','Only at night'], answer: 1 },
      { q: 'At a traffic circle without road markings, you must:', options: ['Give way to traffic on your right already in the circle','Give way to traffic on your left','Go straight through as a priority road','Always stop and check before proceeding'], answer: 0 },
      { q: 'When may you turn left at a red traffic light in South Africa?', options: ['Always, after stopping','Only if a "left turn allowed" sign or marking is present','Never','Only between 10pm and 5am'], answer: 1 },
      { q: 'Before turning left, you should check your mirrors and:', options: ['Check the blind spot to the left for cyclists','Check the blind spot to the right','Signal right first then signal left','No additional check is needed if mirrors are clear'], answer: 0 },
      { q: 'How far before a turn must you signal your intention?', options: ['Immediately before turning','At least 30 m before turning in an urban area','Only in heavy traffic','At least 100 m before turning'], answer: 1 },
      { q: 'When completing a right turn, you should end up in:', options: ['The left lane of the new road','The right lane of the new road (lane nearest the centre line)','Any available lane','The lane directly across from your starting position'], answer: 1 },
    ],
  },

  // ── ROUND 19: Night Driving & Visibility ───────────────────────────────────
  {
    id: 19, title: 'Night Driving & Visibility', icon: '🌙',
    questions: [
      { q: 'Your dipped (low) beam headlamps must illuminate the road at least how far ahead?', options: ['30 m','45 m','60 m','100 m'], answer: 1 },
      { q: 'Your main beam (high beam) headlamps must illuminate at least how far ahead?', options: ['45 m','60 m','100 m','150 m'], answer: 2 },
      { q: 'You must switch from high beam to low beam when an oncoming vehicle is within:', options: ['50 m','100 m','150 m','200 m'], answer: 2 },
      { q: 'Rear fog lights should only be used when visibility is reduced to less than:', options: ['50 m','100 m','150 m','200 m'], answer: 1 },
      { q: 'If you are temporarily blinded by oncoming headlights, you should:', options: ['Close your eyes briefly','Slow down and look at the left edge of your lane','Speed up to pass the vehicle quickly','Switch to high beam to see better'], answer: 1 },
      { q: 'Parking lights (side lights) may be used when parked on a road at night to:', options: ['Illuminate the road ahead','Make your parked vehicle visible to others','Allow driving at slow speed','Replace headlights in fog'], answer: 1 },
      { q: 'At night, your stopping distance is effectively greater because:', options: ['Roads are more slippery','Your eyes take longer to adjust','You can only see as far as your headlights illuminate — reaction distance eats into that','Tyres are colder and less grippy'], answer: 2 },
    ],
  },

  // ── ROUND 20: Special Situations ──────────────────────────────────────────
  {
    id: 20, title: 'Special Situations', icon: '🚨',
    questions: [
      { q: 'Your vehicle breaks down on a freeway. Your emergency triangle must be placed at least:', options: ['15 m behind your vehicle','30 m behind your vehicle','45 m behind your vehicle','90 m behind your vehicle'], answer: 2 },
      { q: 'A school bus has stopped and is displaying a flashing amber light. You should:', options: ['Overtake quickly and carefully','Slow down and be prepared to stop — children may be crossing','Hoot to warn children','Stop 50 m away'], answer: 1 },
      { q: 'When passing a stationary emergency vehicle with flashing lights on the road, you must:', options: ['Accelerate to reduce the time you are near it','Slow down and, where possible, move into a lane away from the vehicle','Keep the same speed but give a wide berth','Hoot to warn the officers'], answer: 1 },
      { q: 'You are involved in a minor accident with no injuries. You must:', options: ['Leave immediately if you are not at fault','Exchange particulars (name, licence, registration) with the other driver','Call the police and wait regardless of severity','Move all vehicles immediately, no documentation needed'], answer: 1 },
      { q: 'If a traffic officer signals you to stop, you must:', options: ['Stop only if you believe you have done wrong','Stop immediately and safely where directed','Stop at the next traffic light','You may ignore it and go to the nearest police station'], answer: 1 },
      { q: 'A pedestrian in a marked crossing has right of way over:', options: ['Only cyclists','All turning vehicles','All vehicles including those with a green light','Emergency vehicles only'], answer: 1 },
      { q: 'You are driving and your hooter (horn) must be audible at what minimum distance?', options: ['30 m','45 m','60 m','90 m'], answer: 3 },
    ],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function RoadRulesGauntlet({ onBack, onPass }) {
  const [screen, setScreen]       = useState('rounds');   // rounds | quiz | result
  const [activeRound, setActiveRound] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [qIndex, setQIndex]       = useState(0);
  const [selected, setSelected]   = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [correct, setCorrect]     = useState(0);
  const [timeLeft, setTimeLeft]   = useState(15);
  const [progress, setProgress]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('k53_rrg_progress') || '{}'); } catch { return {}; }
  });
  const timerRef = useRef(null);
  const passedFiredRef = useRef(false);

  // ── Timer — cleared on unmount to prevent memory leaks ──
  useEffect(() => {
    if (screen !== 'quiz' || confirmed) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setConfirmed(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [screen, qIndex, confirmed]);

  const startRound = useCallback((roundId) => {
    const round = ROUNDS.find(r => r.id === roundId);
    const shuffled = [...round.questions].sort(() => Math.random() - 0.5);
    setActiveRound(roundId);
    setQuestions(prepareAll(shuffled));
    setQIndex(0);
    setSelected(null);
    setConfirmed(false);
    setCorrect(0);
    setTimeLeft(15);
    setScreen('quiz');
  }, []);

  const handleSelect = (idx) => {
    if (confirmed) return;
    setSelected(idx);
  };

  const handleConfirm = () => {
    if (selected === null) return;
    clearInterval(timerRef.current);
    setConfirmed(true);
    const q = questions[qIndex];
    const isCorrect = selected === q.answer;
    if (isCorrect) {
      sfx('correct'); hapticCorrect();
      setCorrect(c => c + 1);
    } else {
      sfx('wrong'); hapticWrong();
    }
    recordResult(isCorrect, 'road_rules');
    recordAnswer(stableId(q, 'rr_'), isCorrect);
    recordGameAnswer('road_rules', stableId(q, 'rr_'), isCorrect);
    incrementQuestionCount();
  };

  const handleNext = () => {
    if (qIndex + 1 < questions.length) {
      setQIndex(i => i + 1);
      setSelected(null);
      setConfirmed(false);
      setTimeLeft(15);
    } else {
      // Save progress
      const pct = Math.round(((correct + (selected === questions[qIndex]?.answer ? 1 : 0)) / questions.length) * 100);
      const newProg = { ...progress, [activeRound]: Math.max(progress[activeRound] || 0, pct) };
      setProgress(newProg);
      try { localStorage.setItem('k53_rrg_progress', JSON.stringify(newProg)); } catch {}
      setScreen('result');
    }
  };

  const round = ROUNDS.find(r => r.id === activeRound);
  const q = questions[qIndex];

  // ── Round Selection ────────────────────────────────────────────────────────
  if (screen === 'rounds') {
    const totalPassed = ROUNDS.filter(r => (progress[r.id] || 0) >= 80).length;
    return (
      <div style={{ minHeight: '100vh', background: T.surface, color: T.text, fontFamily: T.font, paddingBottom: 80 }}>
        <div style={{ background: '#1a1a2e', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer' }}>←</button>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>Road Rules Gauntlet</div>
            <div style={{ color: '#FFB612', fontSize: 13 }}>{totalPassed}/{ROUNDS.length} rounds mastered</div>
          </div>
        </div>
        <div style={{ padding: 20 }}>
          {ROUNDS.map(r => {
            const score = progress[r.id];
            const passed = score >= 80;
            return (
              <div key={r.id} onClick={() => startRound(r.id)}
                style={{ background: T.surfaceAlt, border: `1px solid ${passed ? '#007A4D' : T.border}`, borderRadius: 12, padding: '14px 16px', marginBottom: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
                onMouseEnter={e => e.currentTarget.style.opacity = 0.85}
                onMouseLeave={e => e.currentTarget.style.opacity = 1}
              >
                <span style={{ fontSize: 26 }}>{r.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>Round {r.id}: {r.title}</div>
                  <div style={{ fontSize: 12, color: T.dim, marginTop: 2 }}>{r.questions.length} questions · 15 sec each</div>
                </div>
                {score != null ? (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: passed ? '#007A4D' : '#FFB612' }}>{score}%</div>
                    <div style={{ fontSize: 11, color: passed ? '#007A4D' : T.dim }}>{passed ? '✓' : 'Retry'}</div>
                  </div>
                ) : (
                  <div style={{ color: T.dim, fontSize: 13 }}>Start →</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Result ─────────────────────────────────────────────────────────────────
  if (screen === 'result') {
    const totalQ = questions.length;
    const pct = Math.round((correct / totalQ) * 100);
    const passed = pct >= 80;
    if (passed && !passedFiredRef.current) { passedFiredRef.current = true; sfx('pass'); hapticPass(); onPass?.(); }
    const waText = `🚦 K53 Road Rules Round ${activeRound}: ${correct}/${totalQ} (${pct}%) ${passed ? '✅ PASSED' : '📚 Keep drilling'} — https://k53drillmaster.co.za`;
    const waLink = `https://wa.me/?text=${encodeURIComponent(waText)}`;
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', color: T.text, fontFamily: T.font, padding: 24, paddingTop: 40 }}>
        {/* SA flag stripe */}
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 4, zIndex: 100, display: 'flex' }}>
          {["#000000","#FFB612","#007A4D","#F5F5F0","#DE3831","#4472CA"].map((c,i) => <div key={i} style={{flex:1,background:c}} />)}
        </div>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{ background: passed ? "rgba(0,122,77,0.08)" : "rgba(222,56,49,0.08)", border: `2px solid ${passed ? '#007A4D' : '#DE3831'}`, borderRadius: 12, padding: '36px 24px', textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'inline-block', background: passed ? '#007A4D' : '#DE3831', color: '#fff', fontSize: 11, letterSpacing: 4, padding: '6px 20px', borderRadius: 99, marginBottom: 20, fontWeight: 900 }}>
            {passed ? '✓ PASSED' : '✗ NOT PASSED'}
          </div>
          <div style={{ fontSize: 72, fontWeight: 900, lineHeight: 1, color: '#fff', marginBottom: 8 }}>
            {correct}<span style={{ fontSize: 40, color: '#2a2a3a' }}>/{totalQ}</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: passed ? '#007A4D' : '#DE3831', marginBottom: 12 }}>{pct}%</div>
          <div style={{ fontSize: 13, color: '#6b6b82' }}>{passed ? 'Round passed. Keep this momentum.' : 'Keep drilling — 80% to pass.'}</div>
        </div>
        <a href={waLink} target="_blank" rel="noreferrer" style={{
          display: 'block', width: '100%', maxWidth: 320, padding: '13px', background: '#25D366', color: '#fff',
          border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer',
          fontFamily: T.font, textAlign: 'center', textDecoration: 'none', marginBottom: 12,
        }}>
          📲 Share on WhatsApp
        </a>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => startRound(activeRound)} style={{ background: '#DE3831', color: '#fff', border: 'none', borderRadius: 6, padding: '13px 20px', fontWeight: 900, fontSize: 13, letterSpacing: 2, cursor: 'pointer' }}>RETRY</button>
          <button onClick={() => setScreen('rounds')} style={{ background: '#FFB612', color: '#000', border: 'none', borderRadius: 6, padding: '13px 20px', fontWeight: 900, fontSize: 13, letterSpacing: 2, cursor: 'pointer' }}>ALL ROUNDS →</button>
        </div>
        </div>
      </div>
    );
  }

  // ── Quiz ───────────────────────────────────────────────────────────────────
  const timerPct = (timeLeft / 15) * 100;
  const timerColor = timeLeft > 7 ? '#007A4D' : timeLeft > 3 ? '#FFB612' : '#DE3831';

  return (
    <div style={{ minHeight: '100vh', background: T.surface, color: T.text, fontFamily: T.font }}>
      <div style={{ background: '#1a1a2e', padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div>
            <div style={{ color: '#fff', fontWeight: 600 }}>{round?.icon} {round?.title}</div>
            <div style={{ color: '#FFB612', fontSize: 12 }}>Q{qIndex + 1}/{questions.length}</div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: timerColor }}>{timeLeft}s</div>
        </div>
        <div style={{ background: T.border, borderRadius: 99, height: 6 }}>
          <div style={{ background: timerColor, borderRadius: 99, height: 6, width: `${timerPct}%`, transition: 'width 1s linear' }} />
        </div>
      </div>

      <div style={{ padding: 20 }}>
        <div style={{ background: "#111118", borderLeft: '4px solid #FFB612', borderRadius: 8, padding: 18, marginBottom: 18, fontSize: 17, lineHeight: 1.55, fontWeight: 600, color: "#eeeef5" }}>
          {q?.q}
        </div>

        {q?.options.map((opt, idx) => {
          let bg = T.surfaceAlt, border = T.border, color = T.text;
          if (selected === idx && !confirmed) { bg = '#1a1a2e'; border = '#FFB612'; color = '#FFB612'; }
          if (confirmed && idx === q.answer) { bg = '#007A4D'; border = '#007A4D'; color = '#ffffff'; }
          if (confirmed && selected === idx && idx !== q.answer) { bg = '#DE3831'; border = '#DE3831'; color = '#ffffff'; }
          if (confirmed && timeLeft === 0 && selected === null && idx === q.answer) { bg = '#007A4D'; border = '#007A4D'; color = '#ffffff'; }

          return (
            <button key={idx} onClick={() => handleSelect(idx)}
              style={{ display: 'block', width: '100%', textAlign: 'left', background: bg, border: `2px solid ${border}`, borderRadius: 12, padding: '13px 16px', marginBottom: 10, cursor: confirmed ? 'default' : 'pointer', color, fontSize: 15, lineHeight: 1.4, transition: 'all 0.15s' }}>
              <span style={{ fontWeight: 700, marginRight: 8 }}>{String.fromCharCode(65 + idx)}.</span>{opt}
            </button>
          );
        })}

        {!confirmed ? (
          <button onClick={handleConfirm} disabled={selected === null}
            style={{ width: '100%', background: selected === null ? T.border : '#FFB612', color: '#1a1a2e', border: 'none', borderRadius: 12, padding: 16, fontWeight: 700, fontSize: 16, cursor: selected === null ? 'not-allowed' : 'pointer', marginTop: 4 }}>
            Confirm
          </button>
        ) : (
          <button onClick={handleNext}
            style={{ width: '100%', background: '#007A4D', color: '#fff', border: 'none', borderRadius: 12, padding: 16, fontWeight: 700, fontSize: 16, cursor: 'pointer', marginTop: 4 }}>
            {qIndex + 1 < questions.length ? 'Next →' : 'See Results'}
          </button>
        )}
      </div>
    </div>
  );
}
