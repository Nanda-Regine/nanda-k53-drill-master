import { useState, useEffect, useRef, useCallback } from 'react';
import T from '../theme.js';
import { incrementQuestionCount, isGateHit } from '../freemium.js';
import { prepareAll, stableId, shuffleCopy } from '../utils/quizHelpers.js';
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
      { q: 'What is the minimum following distance you should maintain behind the vehicle in front in a light motor vehicle?', options: ['1 second','2 seconds','3 seconds','4 seconds'], answer: 1 },
      { q: 'What is the general speed limit on a public road outside an urban area (not a freeway)?', options: ['80 km/h','100 km/h','120 km/h','60 km/h'], answer: 1 },
      { q: 'Which factor most increases stopping distance?', options: ['Bright sunshine','Wet road surface','Engine braking','Good tyres'], answer: 1 },
      { q: 'What is the minimum following distance for a heavy motor vehicle?', options: ['1 second','2 seconds','3 seconds','4 seconds'], answer: 2 },
      { q: 'You may NEVER exceed the speed limit, including when:', options: ['Driving to hospital in an emergency','Following a traffic officer\'s signal','Overtaking another vehicle','On an open freeway with no traffic'], answer: 2 },
      { q: 'In adverse weather or poor visibility your following distance must be:', options: ['Kept at 2 seconds — it is always enough','Reduced to stay closer to visible tail-lights','Increased beyond the standard minimum','Reduced to avoid spray from the vehicle ahead'], answer: 2 },
    ],
  },
  // ── ROUND 2: Road Signs ────────────────────────────────────────────────────
  {
    id: 2, title: 'Road Signs', icon: '🚧',
    questions: [
      { q: 'A red octagonal sign means:', options: ['Yield','Stop completely','No entry','Danger ahead'], answer: 1 },
      { q: "A diamond-shaped sign such as \"pedestrian priority\" (R5) belongs to which group?", options: ["Regulatory signs","Warning signs","Guidance signs","Temporary signs"], answer: 0 },
      { q: 'A circular sign with a red border is a:', options: ['Warning sign','Information sign','Prohibition sign','Guide sign'], answer: 2 },
      { q: "According to the signs manual, guidance signs are usually which shape?", options: ["Round","Triangular","Rectangular","Octagonal"], answer: 2 },
      { q: 'The "yield" sign is which shape?', options: ['Rectangle','Circle','Inverted triangle','Diamond'], answer: 2 },
      { q: "A de-restriction sign (R600 series — the restriction symbol with a red cross) means:", options: ["No entry to this road","The restriction shown on the sign ends here","No overtaking for 500 m","Private road — enter at own risk"], answer: 1 },
      { q: 'Which is the ONLY octagonal (8-sided) sign on South African roads?', options: ['Yield','Speed limit sign','Stop (R1)','No entry'], answer: 2 },
      { q: "Regulatory signs are usually round. Which are the exceptions?", options: ["Stop, no entry and speed limit","Stop (octagon), yield (triangle) and pedestrian priority (diamond)","Yield, one-way and keep left","Only the 4-way stop sign"], answer: 1 },
    ],
  },
  // ── ROUND 3: Right of Way ──────────────────────────────────────────────────
  {
    id: 3, title: 'Right of Way', icon: '🛑',
    questions: [
      { q: "At a four-way stop, several vehicles have stopped. Which one may move off first?", options: ["The vehicle on the right","The largest vehicle","The vehicle that stopped first","The vehicle going straight"], answer: 2 },
      { q: 'When must you yield to a pedestrian?', options: ['Never on a busy road','Only at zebra crossings','When they are in or about to enter a pedestrian crossing','Only at traffic lights'], answer: 2 },
      { q: 'An emergency vehicle with sirens must be given right of way by:', options: ['Moving to the left and stopping if necessary','Speeding up to get out of the way','Hooting and continuing','Pulling to the right'], answer: 0 },
      { q: "You are on a freeway and a vehicle on the on-ramp wants to merge ahead of you. You must:", options: ["Allow it to merge in front of you","Keep your speed — it must wait","Move closer to the car ahead","Flash your lights so it stops"], answer: 0 },
      { q: "At a traffic circle (no other signs), you must yield to:", options: ["Traffic from your left","No one — you entered first","Traffic approaching from your right within the circle","Only heavy vehicles"], answer: 2 },
      { q: 'When entering a traffic circle, you must yield to traffic approaching from:', options: ['Your left within the circle','Your right within the circle','Any direction — first in first out','Only vehicles past the halfway mark'], answer: 1 },
      { q: 'You must give immediate and absolute right of way to a vehicle that is:', options: ['Larger than your vehicle','Sounding a siren or bell (emergency vehicle)','Travelling in the same direction as you','Flashing its headlights at you'], answer: 1 },
      { q: 'On a road divided into two separate carriageways, you must drive on:', options: ['The right-hand carriageway unless a sign says otherwise','The left-hand carriageway','Either carriageway, depending on traffic density','The carriageway with fewer vehicles'], answer: 1 },
    ],
  },
  // ── ROUND 4: Signals & Lights ──────────────────────────────────────────────
  {
    id: 4, title: 'Signals & Lights', icon: '💡',
    questions: [
      { q: 'When should you use your hazard lights?', options: ['When double-parking','When your vehicle is a hazard to others (breakdown, emergency stop)','Any time it is raining','When you are lost'], answer: 1 },
      { q: 'You must switch your headlights on:', options: ['30 minutes after sunset only','One hour after sunset','When it is fully dark only','Between sunset and sunrise (and whenever persons/vehicles are not visible at 150 m)'], answer: 3 },
      { q: "You are not in the left lane and the driver behind you flashes the headlights. This means the driver:", options: ["Intends to overtake you","Warns of a speed trap","Is angry with you","Wants you to stop"], answer: 0 },
      { q: "The K53 lane-changing procedure is:", options: ["Signal, then change immediately","Check mirrors and blind spot → signal → check blind spot again → steer into the lane if safe","Change lanes, then signal","Hoot, then change quickly"], answer: 1 },
      { q: 'Amber traffic light means:', options: ['Speed up to clear the intersection','Stop if you can do so safely','Yield to pedestrians only','Always stop'], answer: 1 },
      { q: 'Direction indicators must be clearly visible in normal daylight at a minimum distance of:', options: ['10 m','20 m','30 m','50 m'], answer: 2 },
      { q: 'Using your direction indicator when turning left, turning right, or changing lanes is:', options: ['Recommended but not compulsory in light traffic','Compulsory — required by law every time','Required only in heavy traffic','Required only at speeds above 60 km/h'], answer: 1 },
      { q: 'You may change lanes only when:', options: ['You feel you need to change your position','You can do so without obstructing or endangering other traffic','Travelling above 60 km/h after signalling','The vehicle beside you has already created a gap'], answer: 1 },
    ],
  },
  // ── ROUND 5: Alcohol & Drugs ───────────────────────────────────────────────
  {
    id: 5, title: 'Alcohol & Drugs', icon: '🍺',
    questions: [
      { q: 'The legal blood alcohol limit for a professional driver in South Africa is:', options: ['0.05 g/100 ml','0.02 g/100 ml','0 g/100 ml','0.08 g/100 ml'], answer: 1 },
      { q: 'The legal blood alcohol limit for a non-professional driver is:', options: ['0.05 g/100 ml','0.02 g/100 ml','0 g/100 ml','0.08 g/100 ml'], answer: 0 },
      { q: 'How does alcohol affect driving?', options: ['Improves reaction time','Impairs judgment and slows reaction time','Has no effect at low levels','Makes drivers more alert'], answer: 1 },
      { q: "You sit in the driver's seat with the engine running, under the influence of alcohol, but the car is not moving. This is:", options: ["An offence","Legal, because you are not driving","Legal on private property","An offence only at night"], answer: 0 },
      { q: "For a non-professional driver, driving with a blood-alcohol level of EXACTLY 0.05 g per 100 ml is:", options: ["Legal — the limit is 0.05","An offence — the limit is 0.05 g OR MORE","Legal outside urban areas","Only an offence if you cause an accident"], answer: 1 },
      { q: 'After being involved in a road accident, you may NOT drink alcohol until:', options: ['You feel calm again','You have exchanged details with the other driver','You have reported the accident — unless medical instructions require it beforehand','You have reached a safe location'], answer: 2 },
      { q: 'If prescribed medication causes drowsiness or impaired concentration, you should:', options: ['Drive at reduced speed with hazard lights on','Not drive until the effects have fully worn off','Take a strong coffee and continue your trip','Drive only on quiet back roads'], answer: 1 },
      { q: 'The safest way to eliminate alcohol from your body before driving is:', options: ['Drink strong coffee','Eat a large meal','Exercise vigorously','Wait — only time reduces blood alcohol concentration'], answer: 3 },
    ],
  },
  // ── ROUND 6: Overtaking ────────────────────────────────────────────────────
  {
    id: 6, title: 'Overtaking', icon: '🚗',
    questions: [
      { q: 'You may NOT overtake when:', options: ['On a straight road','Approaching the crest of a hill','On a wide road','The vehicle ahead is slow'], answer: 1 },
      { q: "When overtaking another vehicle, you must:", options: ["Pass to its left if it is slow","Pass to the right at a safe distance and return left only when safely clear","Stay close behind it first to see past","Hoot continuously while passing"], answer: 1 },
      { q: 'You must NOT overtake on a solid white centre line because:', options: ['You may not cross it','It indicates a no-hoot zone','It marks a school zone','It means a bus stop ahead'], answer: 0 },
      { q: 'What should you do before overtaking a large truck?', options: ['Get very close to see past it','Ensure you can see the road is clear ahead and have enough speed','Hoot continuously','Flash headlights from behind'], answer: 1 },
      { q: "After overtaking, you may return to the left side of the road when:", options: ["You are safely clear of the vehicle you passed","Immediately after passing its front bumper","After exactly 100 m","When the other driver flashes you"], answer: 0 },
      { q: 'When overtaking, you may NEVER pass by driving on the:', options: ['Right side of the road','Shoulder or verge of the road','Left in a one-way urban multi-lane road','Acceleration lane of a freeway on-ramp'], answer: 1 },
      { q: 'When the vehicle behind you wants to overtake, you must:', options: ['Hold your speed — a predictable pace is safer','Speed up briefly so they spend less time in danger','Move to the left and do NOT accelerate until they have fully passed you','Flash your hazard lights to acknowledge them'], answer: 2 },
      { q: 'On any public road you must keep LEFT and overtake to the:', options: ['Left','Right','Either side if the road is wide enough','Designated fast lane only'], answer: 1 },
    ],
  },
  // ── ROUND 7: Pedestrians & Cyclists ───────────────────────────────────────
  {
    id: 7, title: 'Pedestrians & Cyclists', icon: '🚶',
    questions: [
      { q: "The red pedestrian figure starts FLASHING. A pedestrian who has not yet stepped into the road must:", options: ["Cross quickly","Wait until the green figure is shown","Cross if no car is near","Wait on the centre island"], answer: 1 },
      { q: 'When must you yield to a pedestrian at a marked crossing?', options: ['Only when the pedestrian has a green man signal','Whenever a pedestrian is in the crossing','Only at night','Only in school zones'], answer: 1 },
      { q: 'When overtaking a pedal cyclist, you should:', options: ['Pass as close as possible to save time','Slow down and allow a wide, safe gap before passing','Hoot continuously to warn them','Maintain full speed past them'], answer: 1 },
      { q: 'A driver must NOT park within how many metres of a pedestrian crossing?', options: ['3 m','5 m','9 m','15 m'], answer: 2 },
      { q: 'Children playing near the road require you to:', options: ['Hoot and continue at the same speed','Reduce speed and be prepared to stop','Speed up to pass quickly','Use high beams'], answer: 1 },
      { q: 'A flashing red pedestrian signal means a pedestrian already in the road must:', options: ['Return immediately to the pavement and wait','Stop on the centre island','Cross as quickly as possible to complete the crossing','Wait for the next green man signal before moving'], answer: 2 },
      { q: 'You must NOT pass a vehicle that has stopped at a pedestrian crossing because:', options: ['It may be creating a traffic jam','A pedestrian may be crossing that you cannot see','It is parked there illegally','You must slow to 10 km/h at all crossings'], answer: 1 },
      { q: 'A driver must yield to a pedestrian at a marked crossing by:', options: ['Only when the pedestrian is fully on the road surface','Slowing down or stopping if necessary to give way','Only when directed by a traffic officer','Only when the pedestrian raises their hand'], answer: 1 },
    ],
  },
  // ── ROUND 8: Parking & Stopping ────────────────────────────────────────────
  {
    id: 8, title: 'Parking & Stopping', icon: '🅿️',
    questions: [
      { q: 'You may NOT park within how many metres of a fire hydrant?', options: ['1.5 m','3 m','5 m','9 m'], answer: 0 },
      { q: "When parking against a kerb on a gradient, K53 says turn the front wheels:", options: ["Straight ahead","Away from the kerb","In the direction of the kerb","It does not matter"], answer: 2 },
      { q: 'Double parking means:', options: ['Parking in two bays','Parking alongside a parked vehicle','Parking in a loading zone','Parking facing the wrong direction'], answer: 1 },
      { q: 'Before getting out of a parked vehicle you should always:', options: ['Sound the horn','Check mirrors and over your shoulder for cyclists and traffic','Open the door quickly','Leave the engine running'], answer: 1 },
      { q: 'You may NOT park within how many metres of an intersection?', options: ['3 m','5 m','9 m','15 m'], answer: 1 },
      { q: 'On a public road OUTSIDE an urban area, your vehicle must be parked at least how far from the edge of the roadway?', options: ['0.5 m','1 m','1.5 m','2 m'], answer: 1 },
      { q: 'No stopping is permitted within how many metres of a tunnel entrance, subway, or bridge?', options: ['3 m','6 m','9 m','12 m'], answer: 1 },
      { q: 'You may NOT stop alongside or opposite another vehicle on a road that is less than how wide?', options: ['6 m','9 m','12 m','15 m'], answer: 1 },
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
      { q: 'If you start to aquaplane (tyres lose contact with a wet road surface), you should:', options: ['Brake hard to stop as quickly as possible','Ease off the accelerator — do NOT brake hard or steer sharply until grip returns','Steer sharply to the hard shoulder','Accelerate to break through the water film'], answer: 1 },
      { q: 'Night-time stopping distances are effectively greater because:', options: ['Roads are colder and tyres grip less at night','You can only see as far as your headlights illuminate — reaction distance eats into that limited zone','Speed limits are lower so you have more time to stop','Other drivers react less predictably at night'], answer: 1 },
      { q: 'Wet leaves or sand on the road surface are most similar in danger to:', options: ['A minor bump — slow down slightly','Ice or very wet asphalt — reduce speed significantly and increase following distance','A normal dry road surface if you have good tyres','A hazard only for cyclists and motorcyclists'], answer: 1 },
    ],
  },
  // ── ROUND 10: Vehicle Controls ─────────────────────────────────────────────
  {
    id: 10, title: 'Vehicle Controls', icon: '🔩',
    questions: [
      { q: 'ABS (Anti-lock Braking System) allows you to:', options: ['Brake harder on wet roads without skidding and maintain steering','Stop in half the distance','Brake automatically in an emergency','Accelerate faster'], answer: 0 },
      { q: "Which brakes must every light motor vehicle be equipped with?", options: ["A service brake only","A service brake, a parking brake and an emergency brake (the last two may be the same brake)","ABS and a handbrake","Front brakes and a handbrake"], answer: 1 },
      { q: 'A flashing oil pressure light means:', options: ['Oil change is due','Stop the engine immediately — serious oil pressure loss','Oil level is slightly low','Normal at start-up only'], answer: 1 },
      { q: "A motor vehicle may not be used on a public road if its turning radius exceeds:", options: ["10 m","11.5 m","13.1 m","15 m"], answer: 2 },
      { q: "The windscreen of a light motor vehicle must allow at least how much visible light through?", options: ["50%","60%","70%","80%"], answer: 2 },
      { q: "Which vehicles must be fitted with a speedometer in good working order?", options: ["Only heavy vehicles","Vehicles designed for or capable of 60 km/h or more","Only vehicles used on freeways","All vehicles, including pedal cycles"], answer: 1 },
      { q: "You may NOT leave a vehicle unattended on a public road without:", options: ["Leaving the engine running","Setting its brake, or using another method that prevents it from moving","Leaving the hazard lights on","Leaving a note on the dashboard"], answer: 1 },
      { q: 'While a vehicle is in motion on a public road, a portion of the body may protrude beyond the vehicle only for the purpose of:', options: ['Waving at a pedestrian or cyclist','Giving a hand signal','Receiving a parking ticket from an attendant','Checking a blind spot manually'], answer: 1 },
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
      { q: 'An accident involving injury or damage must be reported to a police station within:', options: ['6 hours','12 hours','24 hours if no traffic officer attended the scene','48 hours'], answer: 2 },
      { q: 'A vehicle is on fire with occupants trapped inside. The normal rule against moving injured persons:', options: ['Still applies absolutely — wait for paramedics','Does not apply — imminent fire risk means you must attempt to free them','Applies only to spinal injuries','Applies only if the fire is not yet touching the vehicle'], answer: 1 },
      { q: 'The correct compression-to-breath ratio in adult CPR is:', options: ['15 compressions : 2 breaths','20 compressions : 2 breaths','30 compressions : 2 breaths','30 compressions : 1 breath'], answer: 2 },
    ],
  },
  // ── ROUND 12: Motorways & Freeways ────────────────────────────────────────
  {
    id: 12, title: 'Motorways & Freeways', icon: '🛣️',
    questions: [
      { q: "On a freeway you must:", options: ["Keep left and overtake to the right","Use the right lane for continuous travel","Overtake on either side","Keep to the centre lane"], answer: 0 },
      { q: 'Regarding a minimum speed limit on a South African freeway:', options: ['It is 40 km/h','It is 60 km/h','It is 80 km/h','There is no posted minimum speed limit, but you may not obstruct traffic by driving too slowly'], answer: 3 },
      { q: "On a freeway, you may give a hand signal:", options: ["Whenever you change lanes","Only for a reason beyond your control","At any time","Only when your indicators fail at night"], answer: 1 },
      { q: "You may stop on a freeway only:", options: ["To take a phone call","When a sign or traffic officer directs you, in an area reserved for stopping, or for a reason beyond your control","When you feel tired","To pick up a passenger"], answer: 1 },
      { q: 'When leaving a freeway, you should reduce speed:', options: ['On the freeway before the exit','After turning into the off-ramp','Only on the off-ramp','Well before the exit ramp'], answer: 2 },
      { q: 'Which of the following vehicles is PROHIBITED from using a South African freeway?', options: ['A motorcycle with an engine exceeding 50cc','A pedal cycle','A minibus taxi','A vehicle towing a single trailer'], answer: 1 },
      { q: 'Pedestrians walking along a freeway are:', options: ['Permitted on the hard shoulder only','Prohibited under normal circumstances','Permitted between 06:00 and 18:00','Permitted if wearing high-visibility clothing'], answer: 1 },
      { q: 'When a vehicle merges from an on-ramp, a driver already on the freeway should:', options: ['Maintain speed — the merging vehicle must yield','Speed up to create a gap ahead','Allow the merging vehicle to merge when safely possible','Flash headlights to tell them to wait'], answer: 2 },
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
      { q: "Dangerous-goods placards may be excluded from a vehicle's overall width by up to how much on each side?", options: ["30 mm","150 mm","300 mm","0 mm — they always count"], answer: 0 },
      { q: 'UN Dangerous Goods Class 1 covers:', options: ['Flammable liquids','Explosives','Toxic and infectious substances','Radioactive material'], answer: 1 },
      { q: 'UN Dangerous Goods Class 6 covers:', options: ['Corrosive substances','Explosive substances','Toxic and infectious substances','Flammable solids'], answer: 2 },
      { q: 'Documentation carried in a dangerous goods vehicle must:', options: ['Only be available at the depot','Be in the vehicle and describe what is being transported, so emergency services can respond correctly','Only be required for loads over 500 kg','Be kept by the consignor only'], answer: 1 },
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
      { q: 'Brake fluid must be replaced periodically because it:', options: ['Is slowly consumed during braking','Absorbs moisture over time, lowering its boiling point and causing brake fade in hard use','Evaporates through the disc at high temperatures','Needs refreshing every 2 years regardless of condition'], answer: 1 },
      { q: 'A grinding metal-on-metal noise when braking usually indicates:', options: ['Normal ABS activation sound','Worn brake pads — the backing plate is contacting the disc. Replace immediately.','A loose wheel bolt','Tyre tread contacting a wheel arch'], answer: 1 },
      { q: 'Electronic Brakeforce Distribution (EBD) automatically:', options: ['Controls the ABS activation threshold','Distributes braking force between front and rear axles based on vehicle load','Disables ABS when driving on dirt roads','Applies the electric handbrake during emergency braking'], answer: 1 },
    ],
  },

  // ── ROUND 15: Load Securing ────────────────────────────────────────────────
  {
    id: 15, title: 'Load Securing', icon: '📦',
    questions: [
      { q: 'The driver is responsible for ensuring the load is:', options: ['Simply covered with a tarpaulin','Properly secured so it cannot shift or fall','Placed as high as possible','Loaded by the consignor only'], answer: 1 },
      { q: 'The maximum a load may project beyond the rear end of a light or heavy motor vehicle is:', options: ['1.5 m','1.8 m','3 m','4 m'], answer: 1 },
      { q: "A load must be marked (red flag by day, retro-reflectors at night) if it projects to the rear by more than:", options: ["0.3 m","0.5 m","1 m","1.5 m"], answer: 0 },
      { q: 'The centre of gravity of a loaded vehicle affects:', options: ['Only fuel consumption','Stability, cornering and rollover risk','Engine temperature','Tyre wear only'], answer: 1 },
      { q: 'A load projecting more than 300 mm behind your vehicle must be marked in daytime with:', options: ['A red flag of at least 300 mm × 300 mm','A white cloth of any size','A yellow warning triangle','Nothing — only night marking is required'], answer: 0 },
      { q: 'The maximum distance a load may project beyond the FRONT of a light motor vehicle is:', options: ['150 mm','300 mm','600 mm','1.8 m'], answer: 1 },
      { q: "A load projecting more than 150 mm to the SIDE of a vehicle must be marked with:", options: ["Orange cones","A red flag by day, and retro-reflectors at night (white to the front, red to the rear)","A yellow flashing light","Nothing below 80 km/h"], answer: 1 },
      { q: "For most vehicles (not a bus or a goods vehicle of 12 000 kg or more), goods may not project more than how far either side of the centre-line?", options: ["1 m","1.25 m (so the load is at most 2.5 m wide)","1.5 m","2 m"], answer: 1 },
    ],
  },

  // ── ROUND 16: Licence & Documentation ─────────────────────────────────────
  {
    id: 16, title: 'Licence & Documentation', icon: '📋',
    questions: [
      { q: 'A South African learner\'s licence is valid for how long?', options: ['12 months','18 months','24 months','36 months'], answer: 2 },
      { q: "A Code 2 learner's licence holder may drive only:", options: ["With an \"L\" plate, alone","Under the direct supervision of a person who holds a driving licence for that class of vehicle","With any adult passenger","During daylight only"], answer: 1 },
      { q: "An applicant for a learner's licence who is 65 or older must also provide:", options: ["A police clearance","A medical certificate (form MC)","A letter from a family member","Nothing extra"], answer: 1 },
      { q: 'When must you carry your driving licence while driving?', options: ['Only on long trips','At all times while driving','Only when travelling between provinces','Only if under 25'], answer: 1 },
      { q: 'If your driving licence is suspended, you may:', options: ['Continue driving to work only','Not drive any motor vehicle on a public road','Drive only during daylight hours','Drive with a supervisor only'], answer: 1 },
      { q: 'A Code B licence allows you to drive vehicles with a gross vehicle mass of up to:', options: ['1 750 kg','2 500 kg','3 500 kg','5 000 kg'], answer: 2 },
      { q: 'You must be at least how old to apply for a Code 2 (light motor vehicle) learner\'s licence?', options: ['16','17','18','21'], answer: 1 },
    ],
  },

  // ── ROUND 17: Towing & Trailers ────────────────────────────────────────────
  {
    id: 17, title: 'Towing & Trailers', icon: '🚛',
    questions: [
      { q: "The maximum length of a tow-rope, chain or tow-bar between two vehicles is:", options: ["2.5 m","3.5 m","5 m","1.8 m"], answer: 1 },
      { q: "A combination of motor vehicles may consist of a drawing vehicle and at most:", options: ["One trailer","Two trailers","Three trailers","Any number of trailers"], answer: 1 },
      { q: "A breakdown vehicle that is towing another vehicle may travel at a maximum of:", options: ["60 km/h","80 km/h","100 km/h","120 km/h"], answer: 1 },
      { q: 'Trailer sway (snake) is best corrected by:', options: ['Braking hard','Accelerating to straighten the trailer','Releasing the accelerator and steering gently straight — do not brake hard','Steering sharply against the sway'], answer: 2 },
      { q: "Which vehicles must display a number plate at the BACK only?", options: ["Motorcycles, motor tricycles and trailers","Motor cars","Minibuses","All vehicles"], answer: 0 },
      { q: "A towed vehicle is carrying passengers. The maximum speed is:", options: ["30 km/h (unless it is a semi-trailer)","60 km/h","80 km/h","Passengers are never allowed"], answer: 0 },
    ],
  },

  // ── ROUND 18: Intersections & Turning ──────────────────────────────────────
  {
    id: 18, title: 'Intersections & Turning', icon: '↩️',
    questions: [
      { q: 'When turning right at an intersection, you should position your vehicle:', options: ['As far left as possible','As far right in your lane (near the centre line) as possible','In the centre of the road','It does not matter'], answer: 1 },
      { q: 'A U-turn is prohibited:', options: ['On any multi-lane road','Where it cannot be made safely, or where signs prohibit it','Always on a public road','Only at night'], answer: 1 },
      { q: 'At a traffic circle without road markings, you must:', options: ['Give way to traffic on your right already in the circle','Give way to traffic on your left','Go straight through as a priority road','Always stop and check before proceeding'], answer: 0 },
      { q: "A FLASHING RED arrow to the left means:", options: ["Turn left without stopping","After stopping, you may turn left if safe, yielding to pedestrians and other traffic","No left turn","Only buses may turn left"], answer: 1 },
      { q: 'Before turning left, you should check your mirrors and:', options: ['Check the blind spot to the left for cyclists','Check the blind spot to the right','Signal right first then signal left','No additional check is needed if mirrors are clear'], answer: 0 },
      { q: 'When must you signal your intention to turn?', options: ['Immediately before turning','In good time, so other road users can clearly see your intention','Only in heavy traffic','Only when other vehicles are nearby'], answer: 1 },
      { q: "When waiting to turn right at an intersection, K53 says you should position your vehicle:", options: ["As far left as possible","As close as possible towards the centre of the intersection, with due care for approaching vehicles","Behind the stop line until it is completely clear","On the shoulder"], answer: 1 },
    ],
  },

  // ── ROUND 19: Night Driving & Visibility ───────────────────────────────────
  {
    id: 19, title: 'Night Driving & Visibility', icon: '🌙',
    questions: [
      { q: 'Your dipped (low) beam headlamps must illuminate the road at least how far ahead?', options: ['30 m','45 m','60 m','100 m'], answer: 1 },
      { q: 'Your main beam (high beam) headlamps must illuminate at least how far ahead?', options: ['45 m','60 m','100 m','150 m'], answer: 2 },
      { q: "You must dip your main beam:", options: ["Only when an oncoming driver flashes you","For oncoming traffic and when following another vehicle","Only in urban areas","Only when it is raining"], answer: 1 },
      { q: "Fog lamps may be used only when visibility is poor because of:", options: ["Heavy rain","Darkness on unlit roads","Snow, fog, mist, dust or smoke","Any reduced visibility"], answer: 2 },
      { q: 'If you are temporarily blinded by oncoming headlights, you should:', options: ['Close your eyes briefly','Slow down and look at the left edge of your lane','Speed up to pass the vehicle quickly','Switch to high beam to see better'], answer: 1 },
      { q: "May a vehicle be driven with only its parking lamps lit?", options: ["Yes, in urban areas","No — never while the vehicle is moving","Yes, in fog","Yes, below 40 km/h"], answer: 1 },
      { q: 'At night, your stopping distance is effectively greater because:', options: ['Roads are more slippery','Your eyes take longer to adjust','You can only see as far as your headlights illuminate — reaction distance eats into that','Tyres are colder and less grippy'], answer: 2 },
    ],
  },

  // ── ROUND 20: Special Situations ──────────────────────────────────────────
  {
    id: 20, title: 'Special Situations', icon: '🚨',
    questions: [
      { q: 'Your vehicle breaks down on a freeway. Your emergency triangle must be placed at least:', options: ['15 m behind your vehicle','30 m behind your vehicle','45 m behind your vehicle','90 m behind your vehicle'], answer: 2 },
      { q: "You want to pass a bus that has stopped to let passengers on and off. You must:", options: ["Hoot and pass quickly","Pass with due care for people approaching or leaving the bus","Pass on its left","Always stop until it pulls away"], answer: 1 },
      { q: "Which colour warning light is displayed by a traffic officer's vehicle on duty?", options: ["Red","Green","Blue","Amber"], answer: 2 },
      { q: 'You are involved in a minor accident with no injuries. You must:', options: ['Leave immediately if you are not at fault','Exchange particulars (name, licence, registration) with the other driver','Call the police and wait regardless of severity','Move all vehicles immediately, no documentation needed'], answer: 1 },
      { q: 'If a traffic officer signals you to stop, you must:', options: ['Stop only if you believe you have done wrong','Stop immediately and safely where directed','Stop at the next traffic light','You may ignore it and go to the nearest police station'], answer: 1 },
      { q: "A pedestrian is crossing within a pedestrian crossing. You must:", options: ["Hoot to warn the pedestrian","Yield right of way — slow down or stop if necessary","Continue if you have a green light","Pass behind the pedestrian"], answer: 1 },
      { q: 'You are driving and your hooter (horn) must be audible at what minimum distance?', options: ['30 m','45 m','60 m','90 m'], answer: 3 },
    ],
  },

  // ── ROUND 21: Seat Belts & Child Safety ───────────────────────────────────
  {
    id: 21, title: 'Seat Belts & Child Safety', icon: '🪑',
    questions: [
      { q: 'Is wearing a seatbelt compulsory for all occupants in South Africa?', options: ['Only for the driver and front passenger','Yes — the driver and all passengers must wear seatbelts','Only for children','Only on freeways'], answer: 1 },
      { q: 'Who is legally responsible for ensuring passengers under 14 years wear seatbelts?', options: ['The nearest adult passenger','The child\'s parent or guardian','The driver','The front passenger'], answer: 2 },
      { q: "If a child restraint is available in the vehicle, a child passenger must:", options: ["Wear an adult seatbelt","Use the child restraint","Sit on an adult's lap","Sit in the front seat"], answer: 1 },
      { q: 'Are rear-seat passengers required to wear seatbelts in South Africa?', options: ['No — seatbelts are optional in the back seat','Yes — all passengers including rear-seat occupants must wear seatbelts','Only if the journey exceeds 50 km','Only on freeways'], answer: 1 },
      { q: 'Where should a young child NEVER be placed in a vehicle with an active airbag?', options: ['In the rear seat','In the front seat facing forward against an active airbag','In an approved child restraint','Behind the driver\'s seat'], answer: 1 },
      { q: 'If a driver\'s seatbelt is worn incorrectly (e.g., behind the back), the driver:', options: ['Is still legally compliant','Is in breach of the NRTA and at serious risk of injury in a collision','Is compliant only at speeds below 60 km/h','Only faces a fine if involved in an accident'], answer: 1 },
    ],
  },

  // ── ROUND 22: Mobile Phones & Distractions ────────────────────────────────
  {
    id: 22, title: 'Mobile Phones & Distractions', icon: '📱',
    questions: [
      { q: 'Using a handheld mobile phone while driving is:', options: ['Legal if you drive slowly','Illegal — prohibited under the National Road Traffic Act','Legal if you keep one hand on the wheel','Legal only on empty roads'], answer: 1 },
      { q: 'Which of the following phone activities is LEGAL while driving?', options: ['Holding your phone to make a call','Reading text messages at a red light','Using a certified hands-free kit (Bluetooth or earphone)','Dialling a number while driving'], answer: 2 },
      { q: 'Drowsy driving is dangerous because:', options: ['It increases fuel consumption','Reaction time and judgment are impaired — similar to driving under the influence of alcohol','Only the passenger is affected','It only becomes dangerous after 2 am'], answer: 1 },
      { q: 'If you feel drowsy while driving, the safest action is:', options: ['Open the window and turn up the music','Drink energy drinks and continue','Pull over safely and rest before continuing','Drive in the left lane only'], answer: 2 },
      { q: "Holding your cellphone between your shoulder and ear while driving is:", options: ["Legal — your hands are free","Illegal — you may not hold it with any part of your body","Legal below 60 km/h","Legal at a red light"], answer: 1 },
      { q: 'You may NOT allow the engine to run while petrol or other flammable fuel is being put into the tank because:', options: ['It causes the fuel gauge to read incorrectly','It creates a fire and explosion risk — fuel vapour near a running engine can ignite','It prevents an accurate fill level','Only relevant for diesel vehicles'], answer: 1 },
      { q: 'Research consistently shows that talking on a hands-free phone while driving:', options: ['Is completely safe — your hands remain on the wheel','Still causes significant cognitive distraction and increases crash risk','Is only dangerous at speeds above 100 km/h','Is safer than talking to a passenger'], answer: 1 },
      { q: 'The only safe time to look at or reply to a message on your phone while driving is:', options: ['At a red traffic light','When the road is straight and clear','Never — you must pull completely off the road first','When travelling below 40 km/h'], answer: 2 },
    ],
  },

  // ── ROUND 23: Railway Crossings ───────────────────────────────────────────
  {
    id: 23, title: 'Railway Crossings', icon: '🚂',
    questions: [
      { q: "The \"railway crossing ahead\" road marking (WM1) tells you to:", options: ["Speed up and cross","Slow down and, if necessary, stop before the crossing","Park before the crossing","Hoot continuously"], answer: 1 },
      { q: 'When a level crossing boom (barrier) is lowered, you must:', options: ['Stop and wait until the boom is fully raised and the track is completely clear','Drive around the boom if no train is visible','Stop for 5 seconds then proceed','Sound your horn and cross quickly'], answer: 0 },
      { q: 'At a level crossing with flashing red lights and no boom, you must:', options: ['Slow down and cross if no train is visible','Stop — do not cross while the red lights are flashing','Accelerate across to avoid the train','Stop for 3 seconds then cross'], answer: 1 },
      { q: 'Your vehicle stalls on a railway track. You should first:', options: ['Try to restart the engine','Push the vehicle off the track alone','Get all occupants out of the vehicle immediately and move well clear of the tracks','Stay in the vehicle and call for help'], answer: 2 },
      { q: "Where may you NOT stop your vehicle?", options: ["Within the railway reserve at a level crossing","In a demarcated parking bay","In an area reserved for stopping","On the left edge of a wide road"], answer: 0 },
      { q: "At an unguarded level crossing, K53 says that if you must stop, stop at a safe distance or at least how far from the nearest rail?", options: ["1 m","5 m","15 m","45 m"], answer: 1 },
    ],
  },

  // ── ROUND 24: Animals & Livestock ─────────────────────────────────────────
  {
    id: 24, title: 'Animals & Livestock', icon: '🐄',
    questions: [
      { q: "A person leading cattle across the road signals you to stop. You must:", options: ["Drive slowly between the animals","Stop, and move on only when all the animals have crossed and it is safe","Hoot to hurry them","Ignore it — only officers may stop you"], answer: 1 },
      { q: 'When passing animals on or near the road, you should:', options: ['Hoot to clear them off the road','Pass slowly and avoid sudden horn use, which may startle them','Flash your lights repeatedly','Accelerate past them quickly'], answer: 1 },
      { q: "Animals are crossing the road ahead (no one is leading them). You must:", options: ["Stop, and drive on only when all the animals have crossed and the road is safe","Drive around them on the shoulder","Hoot and keep going","Flash your lights"], answer: 0 },
      { q: 'A herd of cattle is slowly crossing the road ahead. You should:', options: ['Drive slowly through the herd','Hoot to speed them up','Stop and wait patiently for the herd to clear the road','Drive onto the shoulder and bypass them'], answer: 2 },
      { q: 'Wild animals crossing the road at night are especially dangerous because:', options: ['They travel in unpredictably large herds','They may freeze or change direction suddenly in your headlights','They only cross during rain','They appear only in nature reserves'], answer: 1 },
      { q: 'A driver MUST stop and wait when requested by a person leading or driving which animals across the road?', options: ['Any farm animal, regardless of size','A bovine animal, horse, donkey, mule, sheep, goat, pig or ostrich','Only cattle when crossing in a large herd','Only horses on a designated bridleway'], answer: 1 },
      { q: 'After animals begin crossing the road ahead, you may only proceed when:', options: ['You can see a clear path through the animals','You have waited at least 30 seconds','All the animals have crossed and the road is completely safe','The person leading them waves you through'], answer: 2 },
      { q: "You must stop when requested by a person leading which animals?", options: ["Only cattle","A bovine animal, horse, donkey, mule, sheep, goat, pig or ostrich","Only horses","Only animals crossing a freeway"], answer: 1 },
    ],
  },

  // ── ROUND 25: Defensive Driving ───────────────────────────────────────────
  {
    id: 25, title: 'Defensive Driving', icon: '🛡️',
    questions: [
      { q: 'Defensive driving means:', options: ['Driving aggressively to establish road space','Anticipating hazards and being prepared to react safely regardless of what other road users do','Staying in the left lane at all times','Never exceeding 80 km/h'], answer: 1 },
      { q: "In rain or on a slippery surface, your following distance must be:", options: ["The same 2 seconds","Increased beyond the 2-second minimum","Reduced to see the car ahead","Exactly 5 car lengths"], answer: 1 },
      { q: 'The "2-second rule" measures:', options: ['The time to signal before turning','The minimum time gap between your vehicle and the one ahead','The time to complete a lane change','The time between mirror checks'], answer: 1 },
      { q: 'When you notice a vehicle weaving erratically ahead, you should:', options: ['Flash your lights to warn them','Overtake as quickly as possible','Increase your following distance and be prepared for sudden changes','Match their behaviour to warn other drivers'], answer: 2 },
      { q: "K53: how often should you check your rear-view mirrors while driving?", options: ["Every 5 to 8 seconds","Every 30 seconds","Only when changing lanes","Once a minute"], answer: 0 },
      { q: 'If you are being tailgated, the safest response is:', options: ['Brake suddenly to signal your displeasure','Maintain your speed and ignore the tailgater','Ease off the accelerator to create more space ahead, allowing the tailgater to overtake','Speed up to increase the distance between you'], answer: 2 },
    ],
  },

  // ── ROUND 26: Reversing ────────────────────────────────────────────────────
  {
    id: 26, title: 'Reversing', icon: '🔄',
    questions: [
      { q: 'Before reversing, you must:', options: ['Sound your horn twice','Check all mirrors and look over your shoulder to ensure the path is completely clear','Signal right and then reverse','Only check the interior rear-view mirror'], answer: 1 },
      { q: "You may cause your vehicle to travel backwards only:", options: ["On a freeway if you missed your exit","If it can be done in safety","At night","In a one-way street"], answer: 1 },
      { q: 'When reversing in a straight line, you should primarily look:', options: ['Only in the rear-view mirror','Straight ahead to monitor the road','Over your shoulder through the rear window, while also checking mirrors','To the left only'], answer: 2 },
      { q: "Before reversing, you should:", options: ["Sound the hooter twice","Check all mirrors and look over your shoulder to make sure the path is clear","Rely on the interior mirror only","Signal right"], answer: 1 },
      { q: 'When reversing from a driveway onto a road, you should:', options: ['Reverse as quickly as possible to spend less time in traffic','Hoot continuously while reversing','Reverse slowly, pause to check for traffic, and proceed only when completely safe','Reverse only during quiet traffic times'], answer: 2 },
      { q: "A person is standing directly behind your reversing car. You must:", options: ["Continue slowly","Stop and wait until the person is completely clear","Hoot and continue","Reverse faster to get past"], answer: 1 },
      { q: 'A pedestrian approaches directly behind your reversing vehicle. You must:', options: ['Continue reversing — it is their responsibility to watch for reversing vehicles','Stop immediately and wait until they have completely cleared the area','Sound the horn once and continue slowly','Ask a passenger to guide you past them'], answer: 1 },
      { q: 'Before reversing in a parking area, you must specifically check for:', options: ['Other drivers waiting for your space','Pedestrians, cyclists, children and all obstacles behind and to the sides of your vehicle','Only vehicles approaching from directly behind','Only if your reversing camera or sensors have not activated'], answer: 1 },
    ],
  },

  // ── ROUND 27: Road Rage & Aggressive Driving ───────────────────────────────
  {
    id: 27, title: 'Road Rage & Aggression', icon: '😤',
    questions: [
      { q: 'Road rage refers to:', options: ['Frustration caused by traffic congestion','Aggressive or violent behaviour by a driver triggered by conflict with other road users','Driving faster than the speed limit','Excessive use of the hooter'], answer: 1 },
      { q: 'If another driver behaves aggressively toward you, you should:', options: ['Exit your vehicle and confront them','Speed away and make rude gestures','Avoid eye contact, do not retaliate, and drive to a safe public place or police station','Slow down suddenly to brake-check them'], answer: 2 },
      { q: 'Tailgating is dangerous primarily because:', options: ['It causes excessive fuel consumption','It reduces your available reaction and stopping distance, greatly increasing rear-end collision risk','It causes tyre overheating','It only becomes dangerous above 120 km/h'], answer: 1 },
      { q: 'Aggressive driving can lead to criminal charges including:', options: ['Only a traffic fine','Only demerit points','Reckless or negligent driving, assault, or even homicide charges depending on the outcome','A formal warning only'], answer: 2 },
      { q: 'The best way to prevent road rage situations is to:', options: ['Always assert your right of way aggressively','Drive very slowly to avoid provoking others','Allow extra travel time, remain calm and not take other drivers\' mistakes personally','Avoid peak-hour roads entirely'], answer: 2 },
      { q: 'Reckless driving in South Africa can result in:', options: ['A verbal warning from a traffic officer only','Criminal prosecution and may result in a fine, imprisonment, or both','Only demerit points on your licence','A maximum fine of R500'], answer: 1 },
      { q: 'Making aggressive gestures or directing verbal abuse at another driver while driving:', options: ['Is legal — freedom of expression protects verbal communication','Can constitute inconsiderate or offensive driving under the NRTA','Is always legally permissible if there is no physical contact','Is only illegal if done while hooting'], answer: 1 },
      { q: 'If you witness a serious road rage incident between other drivers, the safest response is to:', options: ['Stop and intervene to de-escalate the situation','Drive away from the incident and, once safe, call the police if necessary','Follow them and report them personally to the traffic authorities','Flash your lights to distract the drivers involved'], answer: 1 },
    ],
  },

  // ── ROUND 28: Tyres & Wheels ──────────────────────────────────────────────
  {
    id: 28, title: 'Tyres & Wheels', icon: '🛞',
    questions: [
      { q: 'The legal minimum tread depth for tyres in South Africa is:', options: ['0.5 mm','1 mm across the full tyre width','2 mm','3 mm'], answer: 1 },
      { q: 'A tyre blowout at high speed is best managed by:', options: ['Braking hard immediately','Gripping the wheel firmly, easing off the accelerator and steering gently to the left — do NOT brake hard','Swerving sharply to the right','Pressing the clutch and coasting freely'], answer: 1 },
      { q: 'Incorrect tyre pressure causes:', options: ['No significant effect if within 20% of the correct value','Uneven tyre wear, higher fuel consumption, and reduced braking and handling performance','Only cosmetic sidewall damage','Faster heating but no safety effect'], answer: 1 },
      { q: 'When should tyre pressure be checked for the most accurate reading?', options: ['Immediately after a long drive while tyres are warm','When tyres are cold — before driving or after less than 2 km','Only when the tyre warning light illuminates','Once a year at scheduled service'], answer: 1 },
      { q: 'Regularly rotating tyres helps to:', options: ['Balance wheel weights','Ensure even wear across all four tyres, extending their lifespan','Improve fuel injection timing','Prevent rim corrosion'], answer: 1 },
      { q: 'A vehicle fitted with a temporary spare tyre ("space saver") should:', options: ['Travel at normal speed','Not exceed the speed shown on the spare tyre (typically 80 km/h) and be replaced as soon as possible','Be driven no further than 50 km at any speed','Only be used on gravel roads'], answer: 1 },
    ],
  },

  // ── ROUND 29: School Zones & Vulnerable Road Users ────────────────────────
  {
    id: 29, title: 'School Zones & Vulnerable Users', icon: '🏫',
    questions: [
      { q: "Sign W307 (pedestrians) warns that pedestrians may be crossing for the next:", options: ["500 m","1 km","2 km","5 km"], answer: 2 },
      { q: 'A "Beware — school children" warning sign requires you to:', options: ['Stop completely and wait 5 seconds','Reduce speed and be prepared to stop for children','Flash your headlights to warn children','Continue at normal speed — warning signs are advisory only'], answer: 1 },
      { q: 'Which road users are classified as "vulnerable" and require extra caution?', options: ['Only elderly pedestrians','Pedestrians, cyclists, motorcyclists, and children','Heavy vehicle drivers only','Only cyclists and pedestrians at night'], answer: 1 },
      { q: 'Near a school or playground, you must NOT:', options: ['Reduce your speed','Check your mirrors more frequently','Hoot unnecessarily or drive in a way that distracts or endangers children','Be prepared to stop at any time'], answer: 2 },
      { q: 'A cyclist extends their right arm horizontally. This signals their intention to:', options: ['Stop','Turn right','Slow down','Turn left'], answer: 1 },
      { q: 'A cyclist extends their left arm horizontally. This signals their intention to:', options: ['Stop','Turn right','Slow down','Turn left'], answer: 3 },
    ],
  },

  // ── ROUND 30: Vehicle Roadworthiness ──────────────────────────────────────
  {
    id: 30, title: 'Vehicle Roadworthiness', icon: '🔧',
    questions: [
      { q: "The owner of a vehicle is also responsible for offences committed with it when:", options: ["Never — only the driver is responsible","The owner permitted the use of the vehicle","Only for parking fines","Only if the owner is a passenger"], answer: 1 },
      { q: 'Your windscreen wipers fail completely in heavy rain. You should:', options: ['Continue carefully at much reduced speed','Lean out of the window to see','Pull off the road safely and wait for conditions to improve or the wipers to be repaired','Drive with hazard lights on to warn others'], answer: 2 },
      { q: 'Which of the following makes a vehicle un-roadworthy?', options: ['A small dent on the rear bumper','A crack in the windscreen within the driver\'s field of vision','Slightly faded paintwork','A non-functional reversing camera'], answer: 1 },
      { q: 'If a vehicle fails a roadworthy test, the owner must:', options: ['Dispose of the vehicle immediately','May drive it for up to 30 days while awaiting repairs','Have the defects repaired and the vehicle retested before it may be used on a public road','Notify the insurer and continue driving'], answer: 2 },
      { q: "All lamps fitted to a light motor vehicle must be:", options: ["Only the headlamps need to work","Undamaged, unobscured, properly secured and capable of being lit at all times","Working only at night","Replaced every year"], answer: 1 },
      { q: 'A vehicle with excessively worn brake pads that are metal-on-metal:', options: ['May still be driven carefully at reduced speed','Is not roadworthy and may not be used on a public road until repaired','May be driven only in daylight hours','Is only a roadworthy concern at the annual vehicle inspection'], answer: 1 },
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
    const shuffled = shuffleCopy(round.questions);
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
    const totalPassed = ROUNDS.filter(r => (progress[r.id] || 0) >= 75).length;
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
            const passed = score >= 75;
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
    const passed = pct >= 75;
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
          <div style={{ fontSize: 13, color: '#6b6b82' }}>{passed ? 'Round passed. Keep this momentum.' : 'Keep drilling — 75% to pass.'}</div>
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
