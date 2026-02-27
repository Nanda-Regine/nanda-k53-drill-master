import { useState, useEffect, useRef } from "react";

// ─── QUESTION DATA ────────────────────────────────────────────────────────────
// vehicleType: "general" | "lmv" | "motorcycle" | "hmv"

const TESTS = [
  // ═══ GENERAL — applies to all vehicle codes ═══════════════════════════════
  {
    id: 1,
    vehicleType: "general",
    vehicleLabel: "ALL VEHICLES",
    color: "#FFB612",
    title: "RIGHT OF WAY & INTERSECTIONS",
    subtitle: "Traffic officers, 4-way stops, who yields to whom",
    questions: [
      {
        q: "At an uncontrolled intersection (no signs, no lines), which vehicle has right of way?",
        options: ["The vehicle on the left","The vehicle that arrived first","The vehicle on the right","The heavier vehicle"],
        answer: 2,
        explain: "At any uncontrolled intersection, you must yield to the vehicle approaching from your RIGHT. This is the fundamental right-of-way rule — it applies everywhere there are no signs or signals.",
      },
      {
        q: "A traffic officer is directing traffic at an intersection where the light shows green. What must you do?",
        options: ["Follow the green light — it is the official signal","Obey the traffic officer","Proceed slowly and observe both signals","Stop and wait for the light to change"],
        answer: 1,
        explain: "Traffic officers have ABSOLUTE authority over all other controls — lights, signs, and markings. An officer's hand signal ALWAYS overrides a green traffic light.",
      },
      {
        q: "At a 4-way stop, two vehicles arrive simultaneously from different directions. What rule applies?",
        options: ["The driver who arrived from the north has priority","The larger vehicle goes first","The vehicle to the RIGHT of the other has priority","Neither may proceed — call a traffic officer"],
        answer: 2,
        explain: "When vehicles arrive at a 4-way stop simultaneously, the vehicle to the RIGHT has priority. This mirrors the general uncontrolled intersection rule.",
      },
      {
        q: "You are turning right at a green light. Oncoming traffic is approaching. When may you complete your turn?",
        options: ["When the light turns amber","When the oncoming vehicle slows down","Only when the oncoming lane is completely clear","As soon as you have entered the intersection"],
        answer: 2,
        explain: "A right-turning vehicle must yield to ALL oncoming traffic. You may only complete the turn when it is absolutely safe — no oncoming vehicles, no pedestrians in your path.",
      },
      {
        q: "A yield sign is at an intersection. Traffic is approaching 200m away. Must you stop?",
        options: ["Yes — a yield sign always requires a complete stop","No — you may proceed if there is a safe gap","Yes — stop for 3 seconds then proceed","No — yield signs are advisory only"],
        answer: 1,
        explain: "A YIELD sign means give way to traffic — but you are NOT required to stop if there is a safe gap. A STOP sign, by contrast, always requires a full stop before proceeding.",
      },
      {
        q: "The correct order of authority from HIGHEST to LOWEST on South African roads is:",
        options: ["Traffic light → Road sign → Traffic officer → Road marking","Traffic officer → Traffic light → Road sign → Road marking","Road marking → Road sign → Traffic light → Traffic officer","Road sign → Traffic officer → Road marking → Traffic light"],
        answer: 1,
        explain: "Traffic officers hold supreme authority. Below them: traffic signals (lights), then road signs, then road markings. An officer's gesture overrides a green light every time.",
      },
      {
        q: "At a T-junction you are on the terminating road (the stem). A vehicle travels along the through-road. Who gives way?",
        options: ["The through-road vehicle yields to you","You yield to all traffic on the through-road","Whoever arrives first proceeds","The driver who flashes lights first"],
        answer: 1,
        explain: "At a T-junction, the vehicle on the terminating road (stem) must yield to ALL traffic on the through road. You are joining their road — wait until it is safe.",
      },
      {
        q: "At a 4-way stop, two vehicles face each other and arrive simultaneously. One goes straight, one turns right. Who proceeds first?",
        options: ["The right-turning vehicle — it takes longer","The straight-going vehicle — turning vehicles must yield","Both proceed at the same time","The vehicle arriving from the north"],
        answer: 1,
        explain: "A vehicle turning right must yield to the opposing vehicle going straight. This applies even at a 4-way stop when both arrive simultaneously.",
      },
      {
        q: "An ambulance with sirens sounding and blue lights flashing approaches from behind. What must you do?",
        options: ["Accelerate to create space for it","Stop immediately in your lane","Move to the left and stop to allow it to pass","Maintain your speed — it is the ambulance driver's responsibility"],
        answer: 2,
        explain: "Move LEFT and stop — not in the middle of the road. Emergency vehicles need a clear path on the right. After it passes, resume driving.",
      },
      {
        q: "You are waiting in an intersection to turn right when the traffic light turns red. What must you do?",
        options: ["Reverse out of the intersection","Wait for the next green light","Complete the turn when it is safe, even on red","Stay in the intersection until directed by police"],
        answer: 2,
        explain: "If you entered the intersection on green and are waiting for oncoming traffic, you MUST complete the turn when safe — even on red. Staying in the intersection is more dangerous than completing the turn.",
      },
    ],
  },
  {
    id: 2,
    vehicleType: "general",
    vehicleLabel: "ALL VEHICLES",
    color: "#FFB612",
    title: "OVERTAKING RULES",
    subtitle: "Which side, where you may not, signals, barrier lines",
    questions: [
      {
        q: "In South Africa, you must overtake a vehicle on which side?",
        options: ["The left","The right","Either side depending on conditions","Only on multi-lane highways"],
        answer: 1,
        explain: "In South Africa (left-hand traffic), you always overtake on the RIGHT — the outside of the vehicle. Passing on the left is only permitted in specific exceptions.",
      },
      {
        q: "In which situation is it LEGAL to pass a vehicle on the left?",
        options: ["On any road if the vehicle ahead is driving too slowly","When the vehicle ahead is turning right and your left lane is clear","On a gravel road in an emergency","When visibility exceeds 100m"],
        answer: 1,
        explain: "Overtaking on the left is only legal when: the vehicle ahead is turning RIGHT (and your lane is clear), on a multi-lane road with traffic moving in lanes, or a traffic officer directs you to do so.",
      },
      {
        q: "Which of the following is a PROHIBITED place to overtake?",
        options: ["A straight rural road with good visibility","A dual carriageway with a broken centre line","At or near a pedestrian crossing","Outside an urban area at 100 km/h"],
        answer: 2,
        explain: "Overtaking is PROHIBITED at pedestrian crossings, intersections, railway crossings, hill crests, sharp bends, and near school crossings — among others. Pedestrians on a crossing are at serious risk.",
      },
      {
        q: "A solid white barrier line is painted on YOUR side of the road. What does this mean?",
        options: ["You may cross it only to overtake a slow vehicle","You may not cross or straddle it","It applies to trucks only","You may cross it if visibility exceeds 150m"],
        answer: 1,
        explain: "A SOLID barrier line on YOUR side means you MUST NOT cross or straddle it — regardless of the line on the other side. Only the line on your side determines your right to cross.",
      },
      {
        q: "Before overtaking, which signal is required?",
        options: ["Sound your hooter at 90m","Flash your headlamps twice","Give a right-turn indicator signal","Give a left-turn indicator to warn the vehicle ahead"],
        answer: 2,
        explain: "You MUST give a RIGHT indicator signal before overtaking. Once you have overtaken and are returning left, signal LEFT before moving back. Failing to signal before overtaking is an offence.",
      },
      {
        q: "A slow vehicle is causing a queue of traffic behind it. What is the slow driver's legal duty?",
        options: ["Maintain their legal speed — faster drivers must be patient","Move as far to the left as safely possible to allow others to pass","Activate hazard lights and maintain speed","Pull onto the shoulder and stop for 5 minutes"],
        answer: 1,
        explain: "A driver of a slow vehicle that is impeding traffic MUST pull as far LEFT as safely possible — including onto the shoulder if safe — to allow following vehicles to overtake. This is a legal obligation.",
      },
      {
        q: "The broken line is on YOUR side of the road; a solid line is on the other side. May you overtake?",
        options: ["No — any solid line prevents overtaking","Yes — the broken line on YOUR side means you may cross if safe","Only if the road is straight for 200m","Only motorcycles may use the broken line rule"],
        answer: 1,
        explain: "Your right to cross depends on the line on YOUR SIDE. Broken on your side = may cross if safe. The solid line on the other side prevents THEM from crossing into your lane — not you.",
      },
      {
        q: "You are overtaking a vehicle and suddenly approach the crest of a hill. What must you do?",
        options: ["Speed up to complete the overtake before the crest","Maintain speed and complete the manoeuvre","Immediately abort the overtake and return to the left lane","Sound your hooter and proceed"],
        answer: 2,
        explain: "A hill crest eliminates forward visibility. You MUST abort the overtake immediately — signal left, brake, and return to your lane. NEVER overtake at or near a crest.",
      },
      {
        q: "After overtaking, when is it safe to return to the left lane?",
        options: ["Immediately after your front bumper clears the overtaken vehicle","After 3 seconds in the right lane","When you can see the overtaken vehicle's headlamps in your rear-view mirror","When the overtaken vehicle flashes their headlamps"],
        answer: 2,
        explain: "Only return left when you can see the overtaken vehicle's headlights in your rear-view mirror — confirming you have completely cleared it and can merge without cutting it off.",
      },
      {
        q: "During an overtake, an oncoming vehicle appears at an unexpectedly close distance. What do you do?",
        options: ["Accelerate hard to complete the overtake before a collision","Flash headlamps and maintain speed","Signal left immediately, brake, and return behind the vehicle you were passing","Steer onto the left shoulder"],
        answer: 2,
        explain: "If an overtake cannot be completed safely, ABORT IMMEDIATELY — brake, signal left, return to your lane. An aborted overtake is always better than a head-on collision.",
      },
    ],
  },
  {
    id: 3,
    vehicleType: "general",
    vehicleLabel: "ALL VEHICLES",
    color: "#FFB612",
    title: "PEDESTRIANS, ANIMALS & EMERGENCIES",
    subtitle: "Crossings, cyclists, animals on the road, accident procedure",
    questions: [
      {
        q: "A pedestrian is on a marked pedestrian crossing. You are approaching. What must you do?",
        options: ["Sound your hooter and proceed","Slow down — yield only if they are directly in your lane","Give way to the pedestrian","Proceed at a reduced speed"],
        answer: 2,
        explain: "At a MARKED pedestrian crossing, pedestrians have right of way. You MUST stop or yield to allow them to cross safely. Even if they have just stepped off the kerb, you must wait.",
      },
      {
        q: "A child runs into the road chasing a ball. There is no pedestrian crossing. What do you do?",
        options: ["Proceed — the child is not on a marked crossing","Sound your hooter and maintain speed","Slow down immediately and be prepared to stop","Swerve to avoid without braking"],
        answer: 2,
        explain: "Children in or near the road demand IMMEDIATE caution regardless of crossings. They are unpredictable and may be followed by others. Always slow down and be prepared to stop.",
      },
      {
        q: "You encounter a herd of cattle being moved across the road. What must you do?",
        options: ["Drive slowly through the herd, sounding your hooter","Stop and wait for the road to clear","Flash headlamps to scatter the animals","Pass quickly on the right side of the herd"],
        answer: 1,
        explain: "You MUST STOP and wait for animals to clear the road entirely. Driving through a herd causes panic, injury to animals, and can cause serious accidents.",
      },
      {
        q: "What must a cyclist display at night?",
        options: ["A reflective vest only","A white reflector at the front and rear","A white light or reflector at the front and a red light or reflector at the rear","Hazard lights fitted to the bicycle frame"],
        answer: 2,
        explain: "At night a cyclist must have a WHITE light or reflector (front) and a RED light or reflector (rear) — making them visible from both directions, exactly as with a vehicle.",
      },
      {
        q: "When overtaking a cyclist, how much clearance must you leave?",
        options: ["At least 0.5m is sufficient","At least 1 metre of clear space","At least 2 metres","There is no specific legal distance"],
        answer: 1,
        explain: "You must leave at least 1 METRE of clear space when overtaking a cyclist. They are buffeted by your vehicle's air turbulence and need room to react to road hazards.",
      },
      {
        q: "A blind pedestrian with a white cane is crossing the road. What must you do?",
        options: ["Slow down and proceed carefully","Hoot gently to alert them","Stop and wait for them to complete crossing","Flash your headlamps to guide them"],
        answer: 2,
        explain: "A white cane user is visually impaired — they CANNOT see your vehicle. Your hooter or lights will not help them navigate. You MUST STOP and wait until they have completely crossed.",
      },
      {
        q: "A school bus is stationary with hazard lights on, loading children. What must you do?",
        options: ["Pass slowly at 30 km/h","Stop and wait until children are clear and the bus moves","Proceed normally — school buses have no special status","Hoot to alert the children and pass"],
        answer: 1,
        explain: "When a school bus is loading or unloading children, you MUST STOP and wait. Children cross unpredictably between and around the bus. Their safety depends on your patience.",
      },
      {
        q: "At an intersection, your vehicle traffic light is green AND the pedestrian signal shows Walk (green). Who has priority?",
        options: ["Your vehicle — you have a green light","The pedestrian — the Walk signal gives them right of way","Whoever reaches the crossing first","Your vehicle, but you must slow to 30 km/h"],
        answer: 1,
        explain: "When the pedestrian signal shows WALK, those pedestrians have priority — even if your vehicle light is also green. Never turn across a pedestrian crossing when people are on it.",
      },
      {
        q: "You approach a road accident scene. What should you do?",
        options: ["Stop to assist — all passing drivers must render help","Slow down, proceed cautiously, stop only if first on scene and able to genuinely assist","Stop immediately in your lane","Maintain speed — stopping creates an additional hazard"],
        answer: 1,
        explain: "Approach accident scenes at reduced speed. Stop ONLY if you are the first on scene and can genuinely assist. Call emergency services: 10111 (police) or 10177 (ambulance). Unnecessary stopping by many vehicles creates additional hazards.",
      },
      {
        q: "An injured person at an accident scene is unconscious but breathing, with no spinal injury suspected. What position is recommended?",
        options: ["Flat on their back with legs raised","Seated upright to keep airway clear","On their side in the recovery position","Face down to prevent swallowing"],
        answer: 2,
        explain: "An unconscious breathing person should be placed in the RECOVERY POSITION (on their side) to keep their airway open and prevent choking if they vomit. Only move them if there is immediate danger.",
      },
    ],
  },
  {
    id: 4,
    vehicleType: "general",
    vehicleLabel: "ALL VEHICLES",
    color: "#FFB612",
    title: "ALCOHOL, PHONES & FITNESS TO DRIVE",
    subtitle: "BAC limits, cellphone laws, fatigue, accident reporting",
    questions: [
      {
        q: "What is the maximum legal blood alcohol concentration (BAC) for a general (non-professional) driver?",
        options: ["0.02g per 100ml of blood","0.05g per 100ml of blood","0.08g per 100ml of blood","0.10g per 100ml of blood"],
        answer: 1,
        explain: "The legal BAC limit for ordinary drivers is 0.05g/100ml (or 0.24mg/1,000ml breath). This is a MAXIMUM — not a safe target. The safest choice is zero alcohol before driving.",
      },
      {
        q: "What is the legal BAC limit for a professional driver (taxi, bus, truck)?",
        options: ["0.05g/100ml — same as other drivers","0.02g/100ml","0.00g/100ml — zero tolerance","0.03g/100ml"],
        answer: 1,
        explain: "Professional drivers who carry passengers or goods for reward must not exceed 0.02g/100ml — more than twice as strict as the general 0.05g limit. Their responsibility to others demands a higher standard.",
      },
      {
        q: "You refuse a breathalyser test at a police roadblock. What happens?",
        options: ["The officer must release you — no evidence, no charge","You receive a fine only","You may be arrested and required to submit to a blood test","Nothing — refusal is your legal right"],
        answer: 2,
        explain: "Refusing a breathalyser does NOT free you. Police may arrest you and require a blood sample drawn at a police station. Refusal is also an offence in itself.",
      },
      {
        q: "When may you legally use a hand-held cellphone while in the driver's seat?",
        options: ["While stopped at a red traffic light","While driving below 30 km/h","While driving with one hand on the wheel","Never — it is prohibited on any public road unless the vehicle is safely parked off the road"],
        answer: 3,
        explain: "A hand-held phone is illegal on a public road — including at red lights or stop signs. You must be safely parked OFF the public road. Hands-free Bluetooth is the only option while on a public road.",
      },
      {
        q: "Driving while excessively fatigued is:",
        options: ["Legal as long as you stay within the speed limit","An offence — a driver must be fit to drive at all times","Legal if you drink coffee or energy drinks","Legal if the journey is less than 50 km"],
        answer: 1,
        explain: "Driving while fatigued is a criminal offence. Fatigue impairs reaction time and judgment comparably to alcohol. At 120 km/h, a 5-second micro-sleep means 166 metres with no driver.",
      },
      {
        q: "The two-second following distance rule means:",
        options: ["Leave 2 metres behind the vehicle ahead","When the car ahead passes a fixed point, at least 2 seconds should pass before your car reaches it","Ensure you can stop within 2 seconds","Stay 2 car lengths behind at all times"],
        answer: 1,
        explain: "The TWO-SECOND RULE: pick a fixed point; when the car ahead passes it, count to two — your car should not reach that point before you finish counting. In rain or at high speed, double it to 4 seconds.",
      },
      {
        q: "Your prescription medication is labelled 'May cause drowsiness.' May you drive?",
        options: ["Yes, if you feel fine","No — if the medication impairs your ability to drive safely, you must not drive","Yes, for short journeys only","Yes — cars are not classified as machinery under such warnings"],
        answer: 1,
        explain: "ANY medication that impairs your driving ability means you MUST NOT DRIVE. Driving under impairing medication is a criminal offence equivalent to drunk driving. Consult your doctor.",
      },
      {
        q: "If no officer was present at an accident scene, within how long must you report it to the police?",
        options: ["Within 12 hours","Within 24 hours","Within 48 hours","Within 7 days"],
        answer: 1,
        explain: "If no officer was present at the scene, any accident involving injury, death, or property damage must be reported to the nearest police station within 24 HOURS. Failure to report is an offence.",
      },
      {
        q: "The minimum following distance for a heavy motor vehicle (GVM exceeding 9,000 kg) is:",
        options: ["2 seconds — same as a light motor vehicle","3 seconds","4 seconds","5 seconds"],
        answer: 1,
        explain: "HMVs require at least a 3-SECOND gap because of their far greater braking distances. A fully loaded truck at 80 km/h may take 100+ metres to stop. Cutting in front of a truck is extremely dangerous.",
      },
      {
        q: "You are driving and start feeling very sleepy. What is the correct action?",
        options: ["Open the window and turn up the music","Drink coffee or energy drinks and continue","Stop safely, rest, and do not continue until fit to drive","Ask a passenger to talk to you to keep you awake"],
        answer: 2,
        explain: "The ONLY safe solution for drowsy driving is to STOP and REST. No amount of coffee, music, or conversation reliably counteracts genuine fatigue. Pull over safely and sleep before continuing.",
      },
    ],
  },

  // ═══ LMV — Code 3 Light Motor Vehicle ════════════════════════════════════
  {
    id: 5,
    vehicleType: "lmv",
    vehicleLabel: "CODE 3 — LMV",
    color: "#4472CA",
    title: "SPEED LIMITS (LMV)",
    subtitle: "Urban, rural, freeway, towing, school zones",
    questions: [
      {
        q: "What is the general speed limit for a light motor vehicle in an urban area?",
        options: ["40 km/h","60 km/h","80 km/h","100 km/h"],
        answer: 1,
        explain: "In URBAN areas the general speed limit is 60 km/h for light motor vehicles. Posted signs may show different limits — always obey the lowest applicable sign.",
      },
      {
        q: "What is the general speed limit for a light motor vehicle outside urban areas (rural roads, not freeways)?",
        options: ["80 km/h","100 km/h","110 km/h","120 km/h"],
        answer: 1,
        explain: "On public roads OUTSIDE urban areas (excluding freeways), the general limit is 100 km/h for light motor vehicles.",
      },
      {
        q: "What is the maximum speed on a freeway for a light motor vehicle?",
        options: ["100 km/h","110 km/h","120 km/h","140 km/h"],
        answer: 2,
        explain: "The maximum freeway speed for a light motor vehicle is 120 km/h. But always drive at a speed safe for actual conditions — bad weather may require much lower speeds.",
      },
      {
        q: "You are towing a vehicle with a tow rope behind your light motor vehicle. What is the maximum legal speed?",
        options: ["60 km/h","50 km/h","40 km/h","30 km/h"],
        answer: 3,
        explain: "Towing with a TOW ROPE: maximum speed is 30 km/h. The rope is flexible — at higher speeds the towed vehicle sways dangerously. A rigid drawbar has no such speed restriction.",
      },
      {
        q: "The posted limit is 120 km/h but the road is wet, misty, and busy. At what speed must you drive?",
        options: ["120 km/h — it is the legal limit","110 km/h — 10% below the limit is always safe","A speed that is safe for the actual conditions, which may be well below 120 km/h","80 km/h — the heavy vehicle limit is always safe for cars too"],
        answer: 2,
        explain: "The posted speed limit is the MAXIMUM — never a target. You must always drive at a speed appropriate for actual conditions. In poor weather, that may be significantly less than the posted limit.",
      },
      {
        q: "What is the minimum speed permitted on a South African freeway?",
        options: ["40 km/h","60 km/h","80 km/h","There is no minimum speed on freeways"],
        answer: 1,
        explain: "The minimum freeway speed is 60 km/h. A vehicle unable to maintain this speed must exit the freeway. Extremely slow vehicles on a high-speed road are a serious hazard.",
      },
      {
        q: "A school speed zone sign shows 40 km/h. When does this limit apply?",
        options: ["24 hours a day, 7 days a week","Only during the hours indicated on the sign on school days","Only during the morning between 07:00 and 08:00","Whenever children are visible near the road"],
        answer: 1,
        explain: "School zone speed limits (40 km/h) apply ONLY during the hours and days indicated on the sign — typically school arrival and departure times on school days. The normal road limit applies at all other times.",
      },
      {
        q: "The speed limit is 80 km/h. Your speedometer reads 82 km/h. Are you speeding?",
        options: ["No — speedometers have an allowed 10% tolerance","Yes — your speedometer shows above the limit","No — a 5 km/h buffer applies before it is a legal issue","It depends on the calibration of your speedometer"],
        answer: 1,
        explain: "80 km/h means 80 km/h. If your speedometer reads 82, you are exceeding the limit. Note: speedometers may legally READ up to 10% HIGH — your actual speed may be at or below 82, but you cannot assume this.",
      },
      {
        q: "You are towing a properly registered caravan with a ball hitch (not a rope) on a freeway. What is the maximum speed?",
        options: ["30 km/h — towing always means 30 km/h","80 km/h","120 km/h — the normal freeway limit applies","100 km/h"],
        answer: 2,
        explain: "The 30 km/h limit applies ONLY to tow-rope towing. A properly attached caravan or trailer with a ball hitch is subject to normal road speed limits. Drive at a safe speed for the combined length and weight.",
      },
      {
        q: "A speed camera records you at 95 km/h in a 60 km/h zone. You claim your speedometer read 65 km/h. Who is correct?",
        options: ["You — your speedometer is the legal instrument","The speed camera — calibrated devices take legal precedence","Neither — an officer must be physically present for a speed offence","You — a 10% tolerance applies to camera evidence"],
        answer: 1,
        explain: "Calibrated speed cameras and radar/laser devices used by officers take legal precedence over vehicle speedometers. Speedometers are allowed to READ UP TO 10% HIGH — meaning your actual speed may be lower than your speedo shows, never higher.",
      },
    ],
  },
  {
    id: 6,
    vehicleType: "lmv",
    vehicleLabel: "CODE 3 — LMV",
    color: "#4472CA",
    title: "PARKING, STOPPING & LANE POSITION",
    subtitle: "Distances, yellow lines, kerb parking, left-lane rule",
    questions: [
      {
        q: "How close to an intersection may you park your light motor vehicle in an urban area?",
        options: ["Within 3m","Within 5m","No closer than 5m from the intersection","No closer than 10m"],
        answer: 2,
        explain: "You may NOT park within 5m of any intersection in an urban area. Parked vehicles obstruct sight lines, hiding approaching vehicles from drivers waiting to emerge.",
      },
      {
        q: "How close to a pedestrian crossing may you park?",
        options: ["Within 3m","No closer than 9m","Within 6m","No closer than 12m"],
        answer: 1,
        explain: "Do not park within 9m of a pedestrian crossing. Pedestrians must be able to see traffic — and traffic must be able to see pedestrians — before they step onto the crossing.",
      },
      {
        q: "How close to a bus or taxi stop may you park?",
        options: ["No closer than 9m","No closer than 12m","Within 5m if you are not blocking the stop","Within 6m"],
        answer: 1,
        explain: "No parking within 12m of a bus or taxi stop. Public transport passengers need space to board and alight safely, and the vehicle needs room to pull in and out.",
      },
      {
        q: "A solid yellow line is painted along the kerb. What does it mean?",
        options: ["No parking during business hours only","No parking is permitted, but brief stopping is allowed","No stopping or parking at any time","No parking for more than 30 minutes"],
        answer: 2,
        explain: "A SOLID YELLOW LINE means NO STOPPING OR PARKING at any time — not timed, not for quick drop-offs, not for loading. It is a complete prohibition.",
      },
      {
        q: "At night you park your vehicle on a poorly lit road. What must you do?",
        options: ["Leave hazard lights on","Keep parking (side) lights lit at the front and rear","No special action is required if your vehicle is not obstructing traffic","Turn the vehicle to face oncoming traffic so headlamps are visible"],
        answer: 1,
        explain: "When parking at night in an unlit or poorly lit area, you must keep your PARKING LIGHTS (side lights) on — front and rear. This makes your parked vehicle visible to approaching traffic.",
      },
      {
        q: "Which lane must you drive in on a two-lane road in South Africa when not overtaking?",
        options: ["The right (fast) lane","The left lane","Either lane at your discretion","The centre of the road"],
        answer: 1,
        explain: "KEEP LEFT is the fundamental rule. Drive in the LEFT lane at all times except when overtaking or turning right. Driving in the right lane without overtaking is an offence.",
      },
      {
        q: "When parking parallel to the road, how far from the kerb may your vehicle be?",
        options: ["Within 1 metre","Within 450mm","Within 300mm","Exactly touching the kerb"],
        answer: 1,
        explain: "When parking parallel to the road edge, your vehicle must be within 450mm of the kerb. Parking further out reduces usable road width and creates hazards for passing traffic.",
      },
      {
        q: "You park facing downhill on a road with a kerb. Which way must your front wheels face?",
        options: ["Straight ahead — there is no specific rule","To the right (away from the kerb)","To the left (toward the kerb)","Wheels must face uphill"],
        answer: 2,
        explain: "Facing DOWNHILL: turn wheels TOWARD the kerb (left). If the brakes fail, the vehicle rolls into the kerb instead of into traffic. Facing UPHILL: turn wheels AWAY from the kerb (right) — car rolls back into the kerb.",
      },
      {
        q: "On a two-way road at night, on which side of the road may you park?",
        options: ["Either side, provided parking lights are on","The right side only if no oncoming traffic is visible","Only on the left side","Either side, if there is sufficient road space"],
        answer: 2,
        explain: "On a TWO-WAY road, always park on the LEFT side only. Parking on the right means your headlights blind oncoming drivers and your tail-lights face the wrong way.",
      },
      {
        q: "A broken yellow line is present with a sign reading 'No Parking 08:00–17:00.' It is 07:45. May you stop?",
        options: ["No — yellow lines prohibit all stopping at all times","Yes — it is before the restricted hours","No — you must always park in a marked bay","Yes, but for no longer than 2 minutes"],
        answer: 1,
        explain: "A BROKEN yellow line with a timed sign restricts parking only during those hours. Before or after the indicated times, you may stop or park there. Always read both the line AND the sign together.",
      },
    ],
  },
  {
    id: 7,
    vehicleType: "lmv",
    vehicleLabel: "CODE 3 — LMV",
    color: "#4472CA",
    title: "FREEWAY RULES (LMV)",
    subtitle: "Prohibited vehicles, breakdowns, U-turns, on-ramps",
    questions: [
      {
        q: "Which vehicle is PROHIBITED from using a South African freeway?",
        options: ["A light motor vehicle (car)","A motorcycle","A bicycle","A heavy goods vehicle"],
        answer: 2,
        explain: "Bicycles, pedestrians, animals, and non-motorised vehicles are PROHIBITED on freeways. Motorcycles, cars, and trucks use freeways normally.",
      },
      {
        q: "Your light motor vehicle breaks down on a freeway. What is the correct procedure?",
        options: ["Stop in the left lane and switch on hazard lights","Move as far left onto the shoulder as possible, activate hazard lights, and place a warning triangle at least 45m behind your vehicle","Stay in your lane and call for help","Try to drive slowly to the next exit"],
        answer: 1,
        explain: "Move COMPLETELY off the road onto the shoulder. Activate hazard lights. Place the emergency warning triangle AT LEAST 45m behind the vehicle. Stay away from traffic lanes — behind a barrier if possible.",
      },
      {
        q: "May you make a U-turn on a freeway?",
        options: ["Yes, if no traffic is approaching","Yes, only at interchanges","No — U-turns on freeways are completely prohibited","Yes, but only in a genuine emergency"],
        answer: 2,
        explain: "U-turns on freeways are STRICTLY PROHIBITED. If you miss an exit, continue to the next interchange. A U-turn puts you directly in the path of high-speed traffic.",
      },
      {
        q: "You want to join a freeway from an on-ramp. Who has the right of way?",
        options: ["You — you are joining and have limited space to manoeuvre","Vehicles already travelling on the freeway","Whichever vehicle is travelling faster","There is no defined right-of-way at on-ramps"],
        answer: 1,
        explain: "Traffic ALREADY on the freeway has right of way. Use the acceleration lane to match the freeway speed, then merge when there is a safe gap. Never force your way onto the freeway.",
      },
      {
        q: "On a multi-lane freeway, which lane should you normally drive in?",
        options: ["The rightmost (fast) lane for unobstructed travel","The leftmost lane, moving right only to overtake","The centre lane for safety","Any lane — freeway lane rules do not apply above 100 km/h"],
        answer: 1,
        explain: "Even on a freeway, KEEP LEFT. Use the right lane ONLY to overtake, then return to the left. Camping in the right lane is an offence and forces others to overtake dangerously on the left.",
      },
      {
        q: "May you stop on the freeway carriageway to let a passenger out?",
        options: ["Yes, quickly with hazard lights on","Yes, in the left lane only","No — stopping on the carriageway is prohibited except in a genuine emergency","Yes, on the right shoulder"],
        answer: 2,
        explain: "You may NOT stop on the freeway carriageway for non-emergency reasons. Passengers must alight before entering or after exiting the freeway at a service area or off-ramp.",
      },
      {
        q: "May you reverse on a freeway?",
        options: ["Yes, if you missed your exit","Yes, within 100m of an off-ramp","No — reversing on a freeway is completely prohibited","Yes, if no vehicles are visible in your mirrors"],
        answer: 2,
        explain: "Reversing on a freeway is STRICTLY PROHIBITED. If you miss your exit, continue to the next interchange. Reversing on a high-speed road is one of the most dangerous actions possible.",
      },
      {
        q: "An emergency vehicle is parked on the freeway shoulder ahead with lights on. What must you do?",
        options: ["Maintain speed and lane position","Move one lane away from the shoulder and reduce speed","Stop behind the emergency vehicle","Move to the far left to watch and pass"],
        answer: 1,
        explain: "Move Over Law: when passing stationary emergency vehicles with lights on, move into the lane AWAY from the shoulder and reduce speed. Give emergency personnel a safe working margin.",
      },
      {
        q: "What is the minimum speed permitted on a South African freeway?",
        options: ["40 km/h","60 km/h","80 km/h","There is no minimum speed on a freeway"],
        answer: 1,
        explain: "The minimum freeway speed is 60 km/h. A vehicle that cannot maintain this (due to mechanical fault or otherwise) must exit the freeway immediately.",
      },
      {
        q: "At night on a freeway, when must you switch from main beam to dipped headlamps?",
        options: ["Only when another vehicle is within 100m ahead of you","When an oncoming vehicle is within 150m, or when following closely behind another vehicle","Only in urban freeway sections","Never — main beam is always allowed on freeways"],
        answer: 1,
        explain: "Dip your headlamps when: oncoming vehicles are within 150m (to avoid blinding them), or when following closely behind another vehicle. Main beam is only safe when no other road users will be blinded.",
      },
    ],
  },
  {
    id: 8,
    vehicleType: "lmv",
    vehicleLabel: "CODE 3 — LMV",
    color: "#4472CA",
    title: "ADVANCED LMV MIX",
    subtitle: "Stop lines, arrows, barrier lines, tyre law, headlamps",
    questions: [
      {
        q: "A white stop line is painted across the road at an intersection but there is no stop sign. What does it mean?",
        options: ["Yield — slow down and proceed if clear","Stop completely before the line","It is a pedestrian crossing warning line","It marks the end of a no-parking zone"],
        answer: 1,
        explain: "A stop line (RTM1) without a sign STILL requires a COMPLETE STOP. Many learners think only the stop sign triggers stopping — wrong. The line alone has full legal weight.",
      },
      {
        q: "A solid white line is between lanes; a broken white line is on YOUR side. What may you do?",
        options: ["You may not cross any white line","You may cross the broken line on your side with care","You may cross only if your vehicle is shorter than 4m","You may cross only to avoid a stationary object"],
        answer: 1,
        explain: "The rule is determined by the line on YOUR SIDE. Broken on your side = you may cross if safe. The solid line on the other side prevents THEM from crossing into your lane.",
      },
      {
        q: "A green arrow signal appears next to a red traffic light. What does it mean?",
        options: ["You may proceed in any direction carefully","You may only travel in the direction of the arrow, even while the main light is red","The arrow applies only to taxis and buses","You may proceed when the arrow begins flashing"],
        answer: 1,
        explain: "A green arrow alongside a red light means you may ONLY follow the arrow's direction (e.g., turn left) — the main light remains red for all other movements.",
      },
      {
        q: "A vehicle behind you is tailgating you in the right lane of a dual carriageway at the speed limit. What is the correct response?",
        options: ["Brake to create more space — they are following too close","Accelerate to create distance","Move to the left lane when it is safe to do so","Flash your hazard lights to warn them"],
        answer: 2,
        explain: "The correct response is to MOVE LEFT when safe. You have a legal duty to keep left unless overtaking. Blocking the right lane is an offence — even at the speed limit. Never brake-check a tailgater.",
      },
      {
        q: "Your tyres have reached the tread wear indicators (1.6mm tread remaining). What must you do?",
        options: ["Continue carefully and replace the tyres next month","Replace the tyres before driving the vehicle further","Reduce speed to 80 km/h until the tyres are replaced","Inflate to maximum pressure to compensate"],
        answer: 1,
        explain: "Tyre tread below 1.6mm is ILLEGAL. Worn tyres cannot channel water and dramatically increase stopping distances on wet roads. Replace them before driving again.",
      },
      {
        q: "Headlamps must be switched on from sunset to sunrise AND when:",
        options: ["You feel unsafe","Persons or vehicles ahead are not clearly visible at 150m","The road surface is wet","The temperature drops below 10°C"],
        answer: 1,
        explain: "Headlamps are required between sunset and sunrise AND any time persons or vehicles are not clearly visible at 150m — even in daylight (fog, rain, dust). Both conditions independently trigger the requirement.",
      },
      {
        q: "At a 4-way stop, your view to the right is blocked by a large truck. What should you do?",
        options: ["Proceed normally — trucks must yield to cars","Sound your hooter and proceed","Inch forward slowly until you can see, then apply normal right-of-way rules","Wait indefinitely for the truck to go first"],
        answer: 2,
        explain: "When vision is blocked, creep forward slowly to gain visibility. Then apply normal right-of-way rules. Safety and caution always take priority over assumed right of way.",
      },
      {
        q: "A learner driver causes a collision while driving. Who bears legal responsibility?",
        options: ["The supervising driver only","The learner driver only","Both the learner driver and the supervising driver share responsibility","The Department of Transport"],
        answer: 2,
        explain: "Both the LEARNER and the SUPERVISOR bear legal responsibility. The supervisor has a duty to intervene and prevent dangerous actions. Both can face liability for an accident.",
      },
      {
        q: "Rumble strips on the edge of a freeway serve to:",
        options: ["Mark the start of a no-overtaking zone","Slow traffic approaching a toll booth","Alert drivers who have drifted off the road surface","Mark the boundary between urban and rural speed zones"],
        answer: 2,
        explain: "Rumble strips create vibration and sound to ALERT a drowsy or inattentive driver who is drifting. If your vehicle crosses them, you are likely falling asleep or not concentrating.",
      },
      {
        q: "Your vehicle's tail lamp is not working. Under what conditions does this immediately constitute an offence?",
        options: ["Any time the vehicle is on a public road","Between sunset and sunrise, or whenever visibility conditions require lights to be on","Only when driving at speeds above 60 km/h","It is not an offence until your next roadworthiness test"],
        answer: 1,
        explain: "Tail lamps must work whenever lights are required — between sunset and sunrise and during poor visibility. A non-functioning tail light at night makes your vehicle invisible from behind.",
      },
    ],
  },

  // ═══ MOTORCYCLE — Code 1 / Code 2 ════════════════════════════════════════
  {
    id: 9,
    vehicleType: "motorcycle",
    vehicleLabel: "CODE 1 / 2 — MOTORCYCLE",
    color: "#007A4D",
    title: "CODES, LICENCES & EQUIPMENT",
    subtitle: "Age limits, engine sizes, headlamps, helmets, number plates",
    questions: [
      {
        q: "What is the minimum age to apply for a Code 1 (motorcycle up to 125cc) learner's licence?",
        options: ["14 years","16 years","17 years","18 years"],
        answer: 1,
        explain: "The minimum age for a Code 1 learner's licence is 16 years. Code 3 (LMV) and Code 10 (HMV) require 18 years for a full licence. Code 1 and Code 2 licences are motorcycle-specific.",
      },
      {
        q: "A Code 1 licence restricts the rider to motorcycles with an engine capacity of:",
        options: ["Up to 50cc","Up to 125cc","Up to 200cc","Up to 500cc"],
        answer: 1,
        explain: "Code 1 allows motorcycles up to 125cc. To ride on a freeway, carry a pillion passenger, or attach a sidecar, the engine must EXCEED 50cc.",
      },
      {
        q: "A motorcycle headlamp must be switched on:",
        options: ["Only between sunset and sunrise","Only when visibility is below 150m","At ALL times — day and night, no exceptions","Only in tunnels or during heavy rain"],
        answer: 2,
        explain: "Motorcycles ONLY: headlamps must be lit AT ALL TIMES — day, night, sunshine, tunnels — no exceptions. This rule is unique to motorcycles and does not apply to cars.",
      },
      {
        q: "What is the minimum engine size for a motorcycle to legally carry a pillion passenger?",
        options: ["50cc","More than 50cc","At least 125cc","At least 200cc"],
        answer: 1,
        explain: "To carry a pillion passenger (or ride on a freeway, or attach a sidecar), the engine must EXCEED 50cc. A motorcycle of exactly 50cc may NOT carry a pillion passenger.",
      },
      {
        q: "What is the minimum engine size required for a motorcycle to tow a sidecar?",
        options: ["50cc","More than 50cc","At least 125cc or more","At least 200cc or more"],
        answer: 1,
        explain: "A sidecar may only be attached to a motorcycle with an engine EXCEEDING 50cc — the same threshold as for carrying a pillion passenger.",
      },
      {
        q: "What colour is a motorcycle number plate in South Africa?",
        options: ["Black text on a white reflective background","Red text on a white background","Yellow text on a black background","White text on a black background"],
        answer: 0,
        explain: "Motorcycle number plates are the same as all South African vehicles — black text (and border) on a WHITE reflective background. Do not confuse this with older styles used in other countries.",
      },
      {
        q: "A motorcycle rider's crash helmet must:",
        options: ["Be a full-face helmet only","Be any hard hat that fits securely","Comply with approved standards (SABS or equivalent) and be properly fastened","Be brightly coloured for visibility"],
        answer: 2,
        explain: "Crash helmets must comply with SABS standards or a recognised equivalent, and must be PROPERLY FASTENED. An unfastened or non-compliant helmet provides no legal protection in a crash.",
      },
      {
        q: "A motorcycle's dipped headlamp must illuminate the road ahead to at least:",
        options: ["30m","45m","90m","150m"],
        answer: 1,
        explain: "Dipped (low) beam must illuminate at least 45m ahead. Main beam (high) must illuminate at least 100m ahead. These values are the same for motorcycles and cars.",
      },
      {
        q: "A pillion passenger (riding behind the rider) — must they wear a crash helmet?",
        options: ["Only if the motorcycle exceeds 125cc","Only at night","Yes — both the rider and any pillion must wear approved helmets","No — only the rider must wear a helmet by law"],
        answer: 2,
        explain: "BOTH the rider and any pillion passenger must wear an approved crash helmet, properly fastened. There are no exceptions based on engine size, speed, or time of day.",
      },
      {
        q: "A motorcycle's stop lamp (brake light) must be visible in normal daylight at:",
        options: ["20m","30m","45m","100m"],
        answer: 1,
        explain: "The stop lamp must be visible in normal daylight at 30m. Direction indicators must also be visible at 30m. The number plate lamp must make the plate readable at 20m.",
      },
    ],
  },
  {
    id: 10,
    vehicleType: "motorcycle",
    vehicleLabel: "CODE 1 / 2 — MOTORCYCLE",
    color: "#007A4D",
    title: "MOTORCYCLE RIDING RULES",
    subtitle: "Freeway access, pillion rules, towing, lane splitting, tyres",
    questions: [
      {
        q: "What is the minimum engine size for a motorcycle to ride on a freeway?",
        options: ["Any engine size — motorcycles can always use freeways","At least 50cc","More than 50cc","At least 125cc"],
        answer: 2,
        explain: "To ride on a freeway, the motorcycle engine must EXCEED 50cc. A 50cc scooter may NOT use the freeway — it is limited to roads with lower speed limits.",
      },
      {
        q: "May a motorcycle carry more than one pillion passenger?",
        options: ["Yes, if the motorcycle is large enough","Yes, on rural roads at reduced speed","No — a motorcycle may carry only ONE pillion passenger in addition to the rider","Yes, if all passengers wear helmets"],
        answer: 2,
        explain: "A motorcycle may carry only ONE pillion passenger in addition to the rider. Carrying two pillion passengers is illegal regardless of motorcycle size or power.",
      },
      {
        q: "A passenger travelling in a sidecar — must they wear a crash helmet?",
        options: ["Yes — all occupants of a motorcycle combination must wear helmets","No — sidecar passengers are exempt from the helmet requirement","Only if the speed exceeds 60 km/h","Yes, on freeways only"],
        answer: 1,
        explain: "SIDECAR passengers are EXEMPT from the crash helmet requirement. They are enclosed in the sidecar structure. The RIDER must always wear a helmet. Seatbelts should be worn in the sidecar if fitted.",
      },
      {
        q: "A 17-year-old has a Code 1 learner's licence. May they ride a 125cc motorcycle alone to school?",
        options: ["Yes — Code 1 allows up to 125cc from age 16","No — a learner's licence requires a licensed supervisor to accompany on a separate motorcycle","Yes, but only on roads with a 60 km/h or lower speed limit","No — only 18-year-olds may ride motorcycles"],
        answer: 1,
        explain: "A LEARNER's licence requires supervision. For a motorcycle, the supervisor must be a licensed rider on a separate motorcycle accompanying them. A learner may not ride alone.",
      },
      {
        q: "What is the correct width range for motorcycle handlebars (measured between outer edges of grips)?",
        options: ["500mm to 800mm","Between 600mm and 800mm","There is no maximum width for motorcycles","1,000mm maximum"],
        answer: 1,
        explain: "Motorcycle handlebars must be between 600mm and 800mm wide. Excessively wide or narrow bars affect rider control and safety, and may fail roadworthiness inspection.",
      },
      {
        q: "What is the minimum safe following distance for a motorcycle behind another vehicle?",
        options: ["1 second","2 seconds","3 seconds","5 metres"],
        answer: 1,
        explain: "Like light motor vehicles, the minimum following distance for a motorcycle is 2 seconds. However, given a motorcycle's vulnerability in a crash, a larger gap is always safer.",
      },
      {
        q: "May a motorcycle tow another vehicle or trailer?",
        options: ["Yes, using a tow rope","Yes, if the towed vehicle is lighter than the motorcycle","No — motorcycles may NOT tow any vehicle or trailer","Yes, using a rigid drawbar coupling only"],
        answer: 2,
        explain: "Motorcycles may NOT tow any vehicle or trailer. The pulling force and resulting instability make towing on two wheels extremely dangerous and it is an absolute legal prohibition.",
      },
      {
        q: "Is lane-splitting (riding between lanes of slow-moving traffic) legal in South Africa?",
        options: ["Yes — it is fully legal in South Africa","Yes, but only at speeds below 30 km/h","No — it is not permitted under South African road traffic law","Yes, on multi-lane roads only"],
        answer: 2,
        explain: "Lane splitting is NOT legally permitted under South African road traffic law. Despite being common practice, if an accident occurs while lane splitting the rider is likely to be held liable.",
      },
      {
        q: "On a public road, may a motorcycle rider perform a wheelie (lifting the front wheel)?",
        options: ["Yes, if done safely","Yes, only on rural roads","No — both wheels must remain in contact with the road at all times","Yes, if there is no traffic"],
        answer: 2,
        explain: "Wheelies (lifting the front wheel) and stoppies (lifting the rear wheel) are ILLEGAL on public roads. Both wheels must be in contact with the road at all times while riding.",
      },
      {
        q: "What is the minimum legal tread depth for motorcycle tyres?",
        options: ["1mm","1.6mm","2mm","3mm"],
        answer: 1,
        explain: "The minimum legal tread depth for motorcycle tyres is 1.6mm across the full width of the tread. Worn tyres on a motorcycle are more dangerous than on a car — there is no second tyre to compensate.",
      },
    ],
  },

  // ═══ HMV — Code 10 / Code 14 Heavy Motor Vehicle ════════════════════════
  {
    id: 11,
    vehicleType: "hmv",
    vehicleLabel: "CODE 10 / 14 — HMV",
    color: "#DE3831",
    title: "SPEEDS, LOADS & DIMENSIONS",
    subtitle: "HMV speed limits, vehicle dimensions, flags, PDPs",
    questions: [
      {
        q: "A heavy motor vehicle (GVM exceeding 9,000 kg) is driving outside an urban area. What is its maximum speed?",
        options: ["100 km/h","90 km/h","80 km/h","60 km/h"],
        answer: 2,
        explain: "Heavy motor vehicles with GVM exceeding 9,000 kg are limited to 80 km/h outside urban areas AND on freeways. Their mass means far longer braking distances and far more destructive crashes.",
      },
      {
        q: "What is the maximum legal width of a vehicle (excluding mirrors)?",
        options: ["2.0m","2.5m","2.6m","3.0m"],
        answer: 1,
        explain: "The maximum vehicle width (excluding mirrors) is 2.5m for most vehicles. Vehicles exceeding this require special permits and may need escort (pilot) vehicles.",
      },
      {
        q: "What is the maximum legal height of a standard vehicle (excluding the load)?",
        options: ["3.5m","4.0m","4.3m","4.65m"],
        answer: 2,
        explain: "Standard vehicles are limited to 4.3m height. Double-deck buses may reach 4.65m. All vehicles must check bridge and underpass clearances before routing.",
      },
      {
        q: "What is the maximum legal length of an articulated heavy vehicle (truck-tractor with semi-trailer)?",
        options: ["13.1m","18.5m","22m","25m"],
        answer: 1,
        explain: "An articulated heavy vehicle may be up to 18.5m long. A combination vehicle (several coupled units) may be up to 22m. Exceeding these lengths requires special permits.",
      },
      {
        q: "What is the critical GVM threshold above which HMV speed restrictions (80 km/h) apply?",
        options: ["GVM exceeding 3,500 kg","GVM exceeding 9,000 kg","GVM exceeding 12,000 kg","GVM exceeding 16,000 kg"],
        answer: 1,
        explain: "The key K53 threshold is GVM EXCEEDING 9,000 kg — this triggers the 80 km/h speed limit outside urban areas. Above 3,500 kg already triggers some HMV rules (Code 10 licence requirement).",
      },
      {
        q: "By how much may a load project beyond the FRONT of a vehicle?",
        options: ["300mm","900mm","1,800mm","Loads may not project beyond the front at all"],
        answer: 1,
        explain: "A load may project up to 900mm beyond the FRONT of a vehicle. Any projection must be clearly marked and must not create a hazard for other road users.",
      },
      {
        q: "What colour flag must mark a load projecting more than 300mm beyond the rear of a vehicle?",
        options: ["Yellow flag","Orange flag","Red flag","White flag"],
        answer: 2,
        explain: "A load projecting more than 300mm beyond the rear MUST have a RED FLAG (at least 300mm × 300mm) at its outermost point. At night, a RED LIGHT replaces the flag.",
      },
      {
        q: "Which of the following vehicles is REQUIRED to carry an emergency warning triangle?",
        options: ["A light motor vehicle (motor car)","A motorcycle","A heavy goods vehicle","All vehicles including light motor vehicles"],
        answer: 2,
        explain: "Heavy motor vehicles, goods vehicles, minibuses, and buses are REQUIRED by law to carry an emergency warning triangle. Light motor vehicles (cars) and motorcycles are NOT legally required to carry one.",
      },
      {
        q: "What is the maximum distance a load may project to the SIDE of a vehicle (beyond the vehicle's widest point)?",
        options: ["300mm","150mm","450mm","500mm"],
        answer: 1,
        explain: "A load may not project more than 150mm to either side of a vehicle beyond its widest point. Wider loads require special permits and are classified as abnormal loads.",
      },
      {
        q: "What document must a professional driver carry in addition to their driver's licence?",
        options: ["Their identity document only","A Professional Driving Permit (PDP)","Only the vehicle's registration certificate","No additional documents are required"],
        answer: 1,
        explain: "Professional drivers of public motor vehicles (taxis, buses, trucks carrying goods commercially) must hold a valid PDP (Professional Driving Permit) — carried at all times and produced on demand.",
      },
    ],
  },
  {
    id: 12,
    vehicleType: "hmv",
    vehicleLabel: "CODE 10 / 14 — HMV",
    color: "#DE3831",
    title: "TOWING, BRAKES & SPECIAL CONDITIONS",
    subtitle: "Tow rope limits, handbrake grades, loads, following distance",
    questions: [
      {
        q: "What is the maximum legal speed when towing a vehicle with a tow rope?",
        options: ["60 km/h","50 km/h","40 km/h","30 km/h"],
        answer: 3,
        explain: "Tow rope maximum speed is 30 km/h. The flexibility of the rope allows the towed vehicle to sway at higher speeds. A rigid drawbar coupling has no special speed restriction beyond normal road limits.",
      },
      {
        q: "What is the maximum legal length of a tow rope between two vehicles?",
        options: ["2m","3.5m","5m","10m"],
        answer: 1,
        explain: "The tow rope must NOT exceed 3.5m in length. If it is longer, the towed vehicle requires its own operative braking system.",
      },
      {
        q: "Must a towed vehicle have a driver in control?",
        options: ["Only if the tow rope exceeds 3.5m","Yes — a licensed driver must always be in control of the steering and brakes","Never — a towed vehicle can be unmanned if properly secured","Only when towing on a freeway"],
        answer: 1,
        explain: "A towed vehicle MUST have a licensed driver at the wheel, operating the steering and brakes. An unmanned towed vehicle is illegal and extremely dangerous.",
      },
      {
        q: "A vehicle's parking brake must be capable of holding the vehicle stationary on a gradient of:",
        options: ["8%","12%","16%","20%"],
        answer: 2,
        explain: "The parking (hand) brake must be capable of holding the vehicle stationary on a 16% gradient. Failure at this standard means the vehicle fails its roadworthiness test.",
      },
      {
        q: "A load projecting more than 1.8m beyond the rear of a vehicle requires:",
        options: ["An orange flag at the extremity","An escort (pilot) vehicle","A rear lamp only","No additional measures if the red flag is properly placed"],
        answer: 1,
        explain: "Loads projecting more than 1.8m beyond the rear require an ESCORT (PILOT) VEHICLE to follow and warn other traffic. Beyond certain lengths, a front escort may also be required.",
      },
      {
        q: "What is the minimum following distance for a heavy motor vehicle (HMV)?",
        options: ["2 seconds — same as a light motor vehicle","3 seconds","4 seconds","A fixed distance of 100m"],
        answer: 1,
        explain: "HMVs require at least a 3-SECOND following distance because of their far greater braking distances. A fully loaded truck at 80 km/h may take 100+ metres to stop.",
      },
      {
        q: "An emergency warning triangle must be placed at least how far behind a stationary vehicle on a public road?",
        options: ["15m","30m","45m","90m"],
        answer: 2,
        explain: "The emergency warning triangle must be placed NOT LESS than 45m behind the vehicle. On a high-speed road, more distance is safer. The triangle must make the hazard visible to approaching traffic.",
      },
      {
        q: "On a gravel road, a large vehicle creates a dust cloud ahead of you. What must you do?",
        options: ["Maintain speed and switch to main beam headlamps","Reduce speed significantly and increase your following distance","Move to the centre of the road to avoid the dust","Sound your hooter to signal the vehicle ahead to pull over"],
        answer: 1,
        explain: "Dust severely reduces visibility. REDUCE SPEED and increase following distance substantially. You cannot see what is ahead and cannot stop in your normal distance in a dust cloud.",
      },
      {
        q: "What is the maximum total length of a vehicle combination (multiple coupled units such as a B-train)?",
        options: ["18.5m","20m","22m","25m"],
        answer: 2,
        explain: "A combination vehicle (multiple coupled units) may be up to 22m in total length. An articulated truck-tractor with semi-trailer alone may be up to 18.5m.",
      },
      {
        q: "Which statement about heavy vehicle brakes is correct?",
        options: ["HMV brakes need only be tested every 2 years at roadworthiness","HMV braking systems must be maintained and operative at all times — they are subject to roadworthiness standards","Only the front brakes of an HMV are tested for roadworthiness","HMVs are exempt from braking standards if loaded below 50% capacity"],
        answer: 1,
        explain: "All braking systems on an HMV must be maintained and fully operative at all times. HMVs are subject to the same roadworthiness standards as other vehicles — brakes, tyres, lights, and steering must all be in proper working order.",
      },
    ],
  },
];

const PASS_SCORE = 7;

const VEHICLE_GROUPS = [
  { type: "general",    label: "ALL VEHICLES",           color: "#FFB612", desc: "Right of way, overtaking, pedestrians, alcohol & fitness" },
  { type: "lmv",        label: "CODE 3 — LIGHT VEHICLE", color: "#4472CA", desc: "Speed limits, parking, freeway rules, advanced LMV" },
  { type: "motorcycle", label: "CODE 1/2 — MOTORCYCLE",  color: "#007A4D", desc: "Codes & equipment, riding rules, pillion, towing" },
  { type: "hmv",        label: "CODE 10/14 — HEAVY",     color: "#DE3831", desc: "Speeds & dimensions, towing, brakes, loads" },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildExamQuestions(count = 60) {
  const all = TESTS.flatMap(t => t.questions.map(q => ({ ...q, roundColor: t.color, roundTitle: t.title })));
  return shuffle(all).slice(0, count);
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function RoadRulesGauntlet({ onBack }) {
  const [screen, setScreen]             = useState("home");
  const [testIndex, setTestIndex]       = useState(0);
  const [qIndex, setQIndex]             = useState(0);
  const [selected, setSelected]         = useState(null);
  const [answered, setAnswered]         = useState(false);
  const [score, setScore]               = useState(0);
  const [allScores, setAllScores]       = useState([]);
  const [showExplain, setShowExplain]   = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak]     = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [isExamMode, setIsExamMode]     = useState(false);
  const [examQuestions, setExamQuestions] = useState([]);
  const [timeLeft, setTimeLeft]         = useState(0);
  const [timedMode, setTimedMode]       = useState(false);
  const timerRef = useRef(null);

  const currentTest = isExamMode ? null : TESTS[testIndex];
  const currentQ    = isExamMode ? examQuestions[qIndex] : currentTest?.questions[qIndex];
  const totalQ      = isExamMode ? examQuestions.length  : currentTest?.questions.length;

  useEffect(() => {
    if (timedMode && screen === "quiz" && !answered) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            if (!answered) handleTimeUp();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [screen, qIndex, timedMode, answered]);

  const handleTimeUp = () => {
    setAnswered(true);
    setShowExplain(true);
    setCurrentStreak(0);
    setWrongAnswers(prev => [...prev, {
      q: currentQ.q,
      yourAnswer: "TIME RAN OUT",
      correctAnswer: currentQ.options[currentQ.answer],
      explain: currentQ.explain,
    }]);
  };

  const handleSelect = (i) => {
    if (answered) return;
    clearInterval(timerRef.current);
    setSelected(i);
    setAnswered(true);
    const correct = i === currentQ.answer;
    if (correct) {
      setScore(s => s + 1);
      const ns = currentStreak + 1;
      setCurrentStreak(ns);
      if (ns > bestStreak) setBestStreak(ns);
    } else {
      setCurrentStreak(0);
      setWrongAnswers(prev => [...prev, {
        q: currentQ.q,
        yourAnswer: currentQ.options[i],
        correctAnswer: currentQ.options[currentQ.answer],
        explain: currentQ.explain,
      }]);
    }
    setShowExplain(true);
  };

  const handleNext = () => {
    clearInterval(timerRef.current);
    if (qIndex < totalQ - 1) {
      setQIndex(qIndex + 1);
      setSelected(null);
      setAnswered(false);
      setShowExplain(false);
      if (timedMode) setTimeLeft(30);
    } else {
      if (!isExamMode) {
        setAllScores(prev => [...prev, { testId: currentTest.id, title: currentTest.title, score, total: currentTest.questions.length }]);
      }
      setScreen("result");
    }
  };

  const startTest = (index) => {
    setTestIndex(index);
    setQIndex(0); setSelected(null); setAnswered(false); setScore(0);
    setShowExplain(false); setCurrentStreak(0); setWrongAnswers([]);
    setIsExamMode(false);
    if (timedMode) setTimeLeft(30);
    setScreen("quiz");
  };

  const startExam = (timed) => {
    const qs = buildExamQuestions(60);
    setExamQuestions(qs);
    setQIndex(0); setSelected(null); setAnswered(false); setScore(0);
    setShowExplain(false); setCurrentStreak(0); setWrongAnswers([]);
    setIsExamMode(true); setTimedMode(timed);
    if (timed) setTimeLeft(30);
    setScreen("quiz");
  };

  const resetAll = () => { setAllScores([]); setBestStreak(0); setCurrentStreak(0); setScreen("home"); };

  const activeColor = isExamMode ? "#FFB612" : (currentTest?.color || "#FFB612");
  const progress    = (qIndex / (totalQ || 1)) * 100;
  const isCorrect   = answered && selected === currentQ?.answer;
  const totalScore  = allScores.reduce((a, b) => a + b.score, 0);

  const BG   = "#060D07";
  const SURF = "#0D1F10";
  const BORD = "#1A3020";
  const DIM  = "#6B7A62";
  const TEXT = "#E8EDE0";
  const FONT = "'Georgia', 'Times New Roman', serif";

  // ─── HOME ──────────────────────────────────────────────────────────────────
  if (screen === "home") return (
    <div style={{ minHeight:"100vh", background:BG, fontFamily:FONT, padding:"24px 16px", color:TEXT }}>
      {/* SA flag stripe */}
      <div style={{ display:"flex", height:6, width:"100%", position:"fixed", top:0, left:0, zIndex:10 }}>
        {["#000000","#FFB612","#007A4D","#F5F5F0","#DE3831","#4472CA"].map((c,i) => <div key={i} style={{flex:1,background:c}} />)}
      </div>
      <div style={{ maxWidth:680, margin:"0 auto", paddingTop:14 }}>
        <button onClick={onBack} style={{ background:"transparent", border:`1px solid ${BORD}`, color:DIM, fontSize:13, padding:"7px 14px", cursor:"pointer", fontFamily:FONT, borderRadius:3, marginBottom:20 }}>
          ← All Drills
        </button>

        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontSize:10, letterSpacing:5, color:DIM, marginBottom:10, textTransform:"uppercase" }}>South Africa · K53 Road Rules</div>
          <div style={{ display:"inline-block", background:"#FFB612", color:"#000", fontSize:32, fontWeight:700, padding:"8px 22px", marginBottom:6, letterSpacing:-0.5 }}>
            ROAD RULES GAUNTLET
          </div>
          <div style={{ fontSize:12, color:"#FFB612", letterSpacing:3, marginTop:8 }}>12 ROUNDS · 120 QUESTIONS · BY VEHICLE TYPE</div>
          <p style={{ color:DIM, fontSize:13, marginTop:12, lineHeight:1.7 }}>
            General rules for all drivers, then Code 3 LMV, Code 1/2 Motorcycle, and Code 10/14 HMV.<br />Pass mark: 7/10 per round.
          </p>
        </div>

        {/* Stats */}
        {(allScores.length > 0 || bestStreak > 0) && (
          <div style={{ background:SURF, border:`1px solid ${BORD}`, borderRadius:4, padding:"14px 20px", marginBottom:24, display:"flex", justifyContent:"space-around", textAlign:"center" }}>
            <div><div style={{ color:"#FFB612", fontSize:22, fontWeight:700 }}>{totalScore}/{allScores.reduce((a,b)=>a+b.total,0)}</div><div style={{ color:DIM, fontSize:10, letterSpacing:2 }}>TOTAL</div></div>
            <div><div style={{ color:"#007A4D", fontSize:22, fontWeight:700 }}>{bestStreak}</div><div style={{ color:DIM, fontSize:10, letterSpacing:2 }}>BEST STREAK</div></div>
            <div><div style={{ color:"#DE3831", fontSize:22, fontWeight:700 }}>{allScores.length}/12</div><div style={{ color:DIM, fontSize:10, letterSpacing:2 }}>ROUNDS DONE</div></div>
          </div>
        )}

        {/* Exam mode */}
        <div style={{ marginBottom:24 }}>
          <div style={{ color:"#FFB612", fontSize:10, letterSpacing:3, marginBottom:10 }}>⚡ EXAM SIMULATOR</div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={() => startExam(false)} style={{ flex:1, background:"#FFB612", color:"#000", border:"none", borderRadius:4, padding:"14px 10px", fontWeight:700, fontSize:12, letterSpacing:2, cursor:"pointer", fontFamily:FONT }}>
              60 RANDOM Q&apos;s
            </button>
            <button onClick={() => startExam(true)} style={{ flex:1, background:"#DE3831", color:"#fff", border:"none", borderRadius:4, padding:"14px 10px", fontWeight:700, fontSize:12, letterSpacing:2, cursor:"pointer", fontFamily:FONT }}>
              ⏱ TIMED MODE (30s/Q)
            </button>
          </div>
        </div>

        <div style={{ height:1, background:BORD, marginBottom:20 }} />

        {/* Rounds grouped by vehicle type */}
        {VEHICLE_GROUPS.map(group => {
          const groupTests = TESTS.filter(t => t.vehicleType === group.type);
          return (
            <div key={group.type} style={{ marginBottom:24 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                <div style={{ width:4, height:22, background:group.color, borderRadius:2 }} />
                <div>
                  <div style={{ color:group.color, fontSize:11, fontWeight:700, letterSpacing:2 }}>{group.label}</div>
                  <div style={{ color:DIM, fontSize:11 }}>{group.desc}</div>
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {groupTests.map((test, globalIdx) => {
                  const realIdx = TESTS.findIndex(t => t.id === test.id);
                  const done = allScores.find(s => s.testId === test.id);
                  const passed = done && done.score >= PASS_SCORE;
                  return (
                    <button key={test.id} onClick={() => startTest(realIdx)}
                      style={{ background:SURF, border:`2px solid ${done ? (passed ? "#007A4D" : "#DE3831") : BORD}`, borderRadius:4, padding:"12px 16px", textAlign:"left", cursor:"pointer", fontFamily:FONT,
                        transition:"border-color 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = group.color}
                      onMouseLeave={e => e.currentTarget.style.borderColor = done ? (passed ? "#007A4D" : "#DE3831") : BORD}
                    >
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div>
                          <div style={{ color:group.color, fontSize:10, letterSpacing:3, marginBottom:2 }}>ROUND {test.id}</div>
                          <div style={{ color:TEXT, fontWeight:700, fontSize:13 }}>{test.title}</div>
                          <div style={{ color:DIM, fontSize:11, marginTop:2 }}>{test.subtitle}</div>
                        </div>
                        <div style={{ textAlign:"right", minWidth:50 }}>
                          {done ? (
                            <>
                              <div style={{ color: passed ? "#007A4D" : "#DE3831", fontSize:20, fontWeight:700 }}>{done.score}/10</div>
                              <div style={{ color: passed ? "#007A4D" : "#DE3831", fontSize:9, letterSpacing:2 }}>{passed ? "PASSED" : "RETRY"}</div>
                            </>
                          ) : (
                            <div style={{ color:BORD, fontSize:18, fontWeight:700 }}>—</div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {allScores.length > 0 && (
          <button onClick={resetAll} style={{ width:"100%", marginTop:8, padding:"12px", background:"transparent", border:`1px solid ${BORD}`, color:DIM, fontSize:11, letterSpacing:2, cursor:"pointer", fontFamily:FONT, borderRadius:4 }}>
            RESET ALL SCORES
          </button>
        )}
      </div>
    </div>
  );

  // ─── QUIZ ──────────────────────────────────────────────────────────────────
  if (screen === "quiz" && currentQ) {
    const timerPct  = timedMode ? (timeLeft / 30) * 100 : 100;
    const timerColor = timeLeft > 15 ? "#007A4D" : timeLeft > 8 ? "#FFB612" : "#DE3831";
    return (
      <div style={{ minHeight:"100vh", background:BG, fontFamily:FONT, padding:"20px 16px", color:TEXT }}>
        <div style={{ display:"flex", height:6, width:"100%", position:"fixed", top:0, left:0, zIndex:10 }}>
          {["#000000","#FFB612","#007A4D","#F5F5F0","#DE3831","#4472CA"].map((c,i) => <div key={i} style={{flex:1,background:c}} />)}
        </div>
        <div style={{ maxWidth:680, margin:"0 auto", paddingTop:14 }}>
          {/* Header */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
            <div>
              <div style={{ color:activeColor, fontSize:10, letterSpacing:3 }}>
                {isExamMode ? "EXAM SIMULATOR" : `ROUND ${currentTest.id} · ${currentTest.vehicleLabel}`}
              </div>
              <div style={{ color:TEXT, fontSize:14, fontWeight:700 }}>
                {isExamMode ? "ROAD RULES — ALL TOPICS" : currentTest.title}
              </div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ color:activeColor, fontSize:20, fontWeight:700 }}>{score}</div>
              <div style={{ color:DIM, fontSize:10, letterSpacing:2 }}>SCORE</div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ background:SURF, borderRadius:2, height:4, marginBottom:timedMode ? 8 : 16 }}>
            <div style={{ width:`${progress}%`, height:"100%", background:activeColor, borderRadius:2, transition:"width 0.3s" }} />
          </div>

          {/* Timer bar */}
          {timedMode && (
            <div style={{ background:SURF, borderRadius:2, height:5, marginBottom:16 }}>
              <div style={{ width:`${timerPct}%`, height:"100%", background:timerColor, borderRadius:2, transition:"width 1s linear" }} />
            </div>
          )}

          {/* Question counter + streak */}
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
            <div style={{ color:DIM, fontSize:12 }}>
              Question {qIndex + 1} of {totalQ}
              {timedMode && <span style={{ color:timerColor, marginLeft:10, fontWeight:700 }}>{timeLeft}s</span>}
            </div>
            {currentStreak >= 2 && (
              <div style={{ color:"#FFB612", fontSize:12, fontWeight:700 }}>🔥 {currentStreak} STREAK</div>
            )}
          </div>

          {/* Question */}
          <div style={{ background:SURF, border:`1px solid ${BORD}`, borderRadius:6, padding:"20px", marginBottom:16 }}>
            <p style={{ color:TEXT, fontSize:16, lineHeight:1.7, margin:0 }}>{currentQ.q}</p>
          </div>

          {/* Options */}
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:16 }}>
            {currentQ.options.map((opt, i) => {
              let bg = SURF, border = BORD, color = TEXT;
              if (answered) {
                if (i === currentQ.answer) { bg = "#062010"; border = "#007A4D"; color = "#007A4D"; }
                else if (i === selected && i !== currentQ.answer) { bg = "#200606"; border = "#DE3831"; color = "#DE3831"; }
                else { color = DIM; }
              }
              return (
                <button key={i} onClick={() => handleSelect(i)} disabled={answered}
                  style={{ background:bg, border:`2px solid ${border}`, borderRadius:4, padding:"14px 16px", textAlign:"left", cursor: answered ? "default" : "pointer", fontFamily:FONT, color, fontSize:14, lineHeight:1.5, transition:"all 0.15s" }}
                >
                  <span style={{ color: answered ? (i === currentQ.answer ? "#007A4D" : i === selected ? "#DE3831" : DIM) : activeColor, marginRight:10, fontFamily:"'Courier New', monospace", fontSize:12 }}>
                    {String.fromCharCode(65 + i)}.
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showExplain && (
            <div style={{ background: isCorrect ? "#062010" : "#200606", border:`1px solid ${isCorrect ? "#007A4D" : "#DE3831"}`, borderRadius:4, padding:"16px", marginBottom:16 }}>
              <div style={{ color: isCorrect ? "#007A4D" : "#DE3831", fontSize:11, letterSpacing:2, marginBottom:8 }}>
                {selected === null ? "⏱ TIME'S UP" : isCorrect ? "✓ CORRECT" : "✗ INCORRECT"}
              </div>
              <p style={{ color:TEXT, fontSize:14, lineHeight:1.7, margin:0 }}>{currentQ.explain}</p>
            </div>
          )}

          {answered && (
            <button onClick={handleNext} style={{ width:"100%", background:activeColor, color:"#000", border:"none", borderRadius:4, padding:"16px", fontWeight:700, fontSize:13, letterSpacing:3, cursor:"pointer", fontFamily:FONT }}>
              {qIndex < totalQ - 1 ? "NEXT QUESTION →" : "SEE RESULTS"}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ─── RESULT ────────────────────────────────────────────────────────────────
  if (screen === "result") {
    const pct    = Math.round((score / totalQ) * 100);
    const passed = isExamMode ? pct >= 70 : score >= PASS_SCORE;
    return (
      <div style={{ minHeight:"100vh", background:BG, fontFamily:FONT, padding:"24px 16px", color:TEXT }}>
        <div style={{ display:"flex", height:6, width:"100%", position:"fixed", top:0, left:0, zIndex:10 }}>
          {["#000000","#FFB612","#007A4D","#F5F5F0","#DE3831","#4472CA"].map((c,i) => <div key={i} style={{flex:1,background:c}} />)}
        </div>
        <div style={{ maxWidth:680, margin:"0 auto", paddingTop:14 }}>
          {/* Score card */}
          <div style={{ background:SURF, border:`2px solid ${passed ? "#007A4D" : "#DE3831"}`, borderRadius:6, padding:"24px", marginBottom:20, textAlign:"center" }}>
            <div style={{ color:passed ? "#007A4D" : "#DE3831", fontSize:10, letterSpacing:4, marginBottom:8 }}>
              {passed ? "PASSED" : "NOT YET"}
            </div>
            <div style={{ color:passed ? "#007A4D" : "#DE3831", fontSize:52, fontWeight:700, lineHeight:1 }}>{score}/{totalQ}</div>
            <div style={{ color:passed ? "#007A4D" : "#DE3831", fontSize:22, fontWeight:700, marginTop:6 }}>{pct}%</div>
            <div style={{ color:DIM, fontSize:13, marginTop:10, lineHeight:1.6 }}>
              {passed
                ? (isExamMode ? "Exam passed — you are ready." : "Round passed. Keep going!")
                : (isExamMode ? `Need 70% to pass. You got ${pct}%. Review your mistakes.` : `Need ${PASS_SCORE}/10. Review your mistakes below.`)}
            </div>
          </div>

          {/* Wrong answers */}
          {wrongAnswers.length > 0 && (
            <div style={{ marginBottom:24 }}>
              <div style={{ color:"#DE3831", fontSize:10, letterSpacing:3, marginBottom:14 }}>✗ REVIEW YOUR MISTAKES ({wrongAnswers.length})</div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {wrongAnswers.map((w, i) => (
                  <div key={i} style={{ background:SURF, border:`1px solid ${BORD}`, borderRadius:4, padding:"14px" }}>
                    <div style={{ color:DIM, fontSize:13, marginBottom:8, lineHeight:1.6 }}>{w.q}</div>
                    <div style={{ color:"#DE3831", fontSize:12, marginBottom:4 }}>✗ {w.yourAnswer}</div>
                    <div style={{ color:"#007A4D", fontSize:12, marginBottom:8 }}>✓ {w.correctAnswer}</div>
                    <div style={{ color:DIM, fontSize:12, lineHeight:1.6, borderTop:`1px solid ${BORD}`, paddingTop:8 }}>{w.explain}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {wrongAnswers.length === 0 && (
            <div style={{ background:"#062010", border:"1px solid #007A4D", borderRadius:4, padding:20, textAlign:"center", marginBottom:24 }}>
              <div style={{ color:"#007A4D", fontSize:18 }}>Perfect score. Outstanding.</div>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display:"flex", gap:10 }}>
            {!isExamMode && TESTS[testIndex + 1] && (
              <button onClick={() => startTest(testIndex + 1)} style={{ flex:1, padding:"14px", background:activeColor, color:"#000", border:"none", borderRadius:4, fontSize:12, fontWeight:700, letterSpacing:2, cursor:"pointer", fontFamily:FONT }}>
                NEXT ROUND →
              </button>
            )}
            <button onClick={() => { setQIndex(0); setSelected(null); setAnswered(false); setScore(0); setShowExplain(false); setCurrentStreak(0); setWrongAnswers([]); if(timedMode)setTimeLeft(30); setScreen("quiz"); }}
              style={{ flex:1, padding:"14px", background:"transparent", border:`1px solid ${BORD}`, color:DIM, fontSize:12, fontWeight:700, letterSpacing:2, cursor:"pointer", fontFamily:FONT, borderRadius:4 }}>
              TRY AGAIN
            </button>
            <button onClick={() => setScreen("home")} style={{ flex:1, padding:"14px", background:SURF, color:TEXT, border:`1px solid ${BORD}`, fontSize:12, fontWeight:700, letterSpacing:2, cursor:"pointer", fontFamily:FONT, borderRadius:4 }}>
              HOME
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
