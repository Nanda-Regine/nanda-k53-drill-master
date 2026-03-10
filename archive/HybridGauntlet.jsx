import { useState, useEffect, useRef } from "react";
import { incrementQuestionCount } from "../freemium.js";
import FreemiumGate from "../components/FreemiumGate.jsx";
import AITutor from "../components/AITutor.jsx";

const TESTS = [
  {
    id: 1,
    title: "ROUND 1: THE 'EXCEPT' TRAP",
    subtitle: "Every question has a 'not', 'except' or 'unless' — read TWICE",
    color: "#DE3831",
    questions: [
      {
        q: "Which of the following does NOT require the driver to stop completely?",
        options: ["A stop line (RTM1) with no stop sign present","A yield line (RTM2) where no traffic is approaching","A 4-way stop sign (R1.4)","A solid red traffic light"],
        answer: 1,
        explain: "A YIELD line (RTM2) requires you to give way, but not necessarily stop if no traffic is approaching. All others — stop line, 4-way stop, red light — require a complete stop.",
      },
      {
        q: "All of the following vehicles MUST carry an emergency warning triangle EXCEPT:",
        options: ["A minibus","A goods vehicle","A motor car","A heavy bus"],
        answer: 2,
        explain: "Motor cars are specifically excluded from the emergency triangle requirement. Also excluded: ambulances and motorcycles. Heavy vehicles, goods vehicles, minibuses and buses must carry one.",
      },
      {
        q: "A motorcycle headlamp must be lit at all times. Which statement is NOT true about this rule?",
        options: ["It applies during daylight hours","It applies at night","It applies in tunnels","It applies only when visibility is below 150m"],
        answer: 3,
        explain: "Motorcycle headlamps must be lit AT ALL TIMES — day, night, tunnels, sunshine. There is NO visibility threshold exception. The 150m rule applies to when CARS must switch on their lights.",
      },
      {
        q: "Which of the following is NOT a legal exception for driving to the left of the left-edge line (RM4.1)?",
        options: ["While being overtaken by another vehicle","During daylight only","When visibility exceeds 150m in front","When it is raining and you want extra space"],
        answer: 3,
        explain: "Rain giving you a desire for extra space is NOT a legal exception. The three conditions for crossing the left-edge line are: while being overtaken, during daylight, and if safe for all users with 150m visibility.",
      },
      {
        q: "You may NOT park in all of the following places EXCEPT one. Which location IS permitted for parking?",
        options: ["Within 9m of the approaching side of a pedestrian crossing","Within 5m of an intersection","In a demarcated parking bay under a lit street lamp","Within 1.5m of a fire hydrant"],
        answer: 2,
        explain: "Parking IN a demarcated bay is always legal. Lights are not even required if within 12m of a lit street lamp AND in a bay. The other three are all prohibited parking locations.",
      },
      {
        q: "Which of the following does NOT require a medical certificate when applying for a learner's licence?",
        options: ["A 66-year-old applicant","A 64-year-old applicant","A 70-year-old applicant","A 75-year-old applicant"],
        answer: 1,
        explain: "The medical certificate (form MC) is required for applicants aged 65 OR OLDER. At 64 years old, no medical certificate is required — the rule kicks in at exactly 65.",
      },
      {
        q: "Fog lamps may be used in all of the following conditions EXCEPT:",
        options: ["Fog","Snow","Heavy rain","Dust or smoke"],
        answer: 2,
        explain: "Heavy rain is specifically NOT on the list of permitted fog lamp conditions. The law lists: snow, fog, mist, dust, smoke. Rain is excluded — this is one of the most common exam traps.",
      },
      {
        q: "Which of the following is NOT a valid reason to cross a no-crossing line (RM2)?",
        options: ["To drive around a broken-down vehicle stopped in your lane","To overtake a slow-moving heavy vehicle when the road ahead is clear","To access an entrance on the other side of the road","None — RM2 may never be crossed"],
        answer: 1,
        explain: "RM2 (no-crossing line) has ONLY ONE exception: to go around a STATIONARY obstruction. Overtaking a slow-moving (i.e. moving) vehicle is never permitted across RM2. Note: accessing an entrance IS allowed for RM1 (no-overtaking) — NOT RM2.",
      },
      {
        q: "All of the following are prohibited on a freeway EXCEPT:",
        options: ["Motor quadrucycles","Motorcycles with engines ≤50cc","A motorcycle with a 150cc engine","Pedal cycles"],
        answer: 2,
        explain: "Motorcycles with engines EXCEEDING 50cc ARE permitted on freeways. Prohibited on freeways: motor quadrucycles, motorcycles ≤50cc, electric motorcycles, tractors (except maintenance), pedal cycles, and animal-drawn vehicles.",
      },
      {
        q: "A driver may pass on the LEFT of a vehicle ahead in all situations EXCEPT:",
        options: ["The vehicle ahead is turning right","On a one-way road in an urban area with enough width","When directed by a traffic officer to do so","When the vehicle ahead is travelling faster than you"],
        answer: 3,
        explain: "Passing on the left is permitted when: the vehicle ahead is turning right, on a one-way urban road with sufficient width, or when directed by a traffic officer. The speed of the vehicle ahead is irrelevant — it is NOT a legal basis for passing on the left.",
      },
    ],
  },
  {
    id: 2,
    title: "ROUND 2: EXACT NUMBERS DEATHMATCH",
    subtitle: "Every wrong answer is a real number. One digit off = fail.",
    color: "#FFB612",
    questions: [
      {
        q: "Dipped beam headlamp visibility ahead vs Main beam visibility ahead. Which pair is correct?",
        options: ["Dipped 30m / Main 100m","Dipped 45m / Main 100m","Dipped 45m / Main 150m","Dipped 100m / Main 150m"],
        answer: 1,
        explain: "Dipped (dim) = 45m. Main beam (bright) = 100m. Stop lamp = 30m. Number plate lamp = 20m. Hooter = 90m. These five distances all live in the same family and get confused constantly.",
      },
      {
        q: "The pedestrian crossing parking clearance vs the intersection parking clearance vs the tunnel/bridge stopping clearance. Correct set?",
        options: ["9m / 5m / 6m","5m / 9m / 6m","9m / 6m / 5m","6m / 5m / 9m"],
        answer: 0,
        explain: "Pedestrian crossing = 9m. Intersection = 5m. Tunnel/bridge stopping = 6m. In order: 9 / 5 / 6. Memorise this trio — they are the three most swapped parking distances in the test.",
      },
      {
        q: "A learner's licence is valid for 24 months. A vehicle licence disc is valid for 12 months. The disc grace period is 21 days. Address change notification is 14 days. Which of these is WRONG?",
        options: ["Learner's licence = 24 months","Licence disc grace period = 21 days","Address change notification = 14 days","Disc valid for 24 months"],
        answer: 3,
        explain: "The disc is valid for 12 months — NOT 24. The learner's LICENCE is valid for 24 months. These two get swapped by nervous candidates all the time. Grace period = 21 days. Address change = 14 days.",
      },
      {
        q: "How many metres from a fire hydrant may you NOT park (on the same side of the road, on either side of the hydrant)?",
        options: ["3m","1.5m","5m","9m"],
        answer: 1,
        explain: "No parking within 1.5m of a fire hydrant on EITHER SIDE of the hydrant (so 3m total clearance around it). 5m = intersection. 9m = pedestrian crossing. 3m = railway crossing stop distance.",
      },
      {
        q: "Maximum tow rope length is 3.5m. Tow rope maximum speed is 30 km/h. Emergency triangle is placed 45m away. What is the HOOTER audibility distance?",
        options: ["45m","100m","90m","150m"],
        answer: 2,
        explain: "Hooter = 90m audible. Triangle = 45m from vehicle. Main beam = 100m. Headlamp threshold = 150m. Hooter = 90m is the one that slips through — it sits between the 45m and 100m values.",
      },
      {
        q: "Goods project 280mm to the side of your vehicle. Do they need to be marked?",
        options: ["Yes — anything over 150mm to the side must be marked","No — they need to project over 300mm to the side before marking is required","No — only rear projections need marking","Yes — any projection requires marking"],
        answer: 0,
        explain: "MORE than 150mm to the SIDE = must be marked. MORE than 300mm to the REAR = must be marked. At 280mm to the side, you exceed the 150mm side threshold, so marking is required.",
      },
      {
        q: "Following distance for a light motor vehicle is 2 seconds. For a heavy motor vehicle it is 3 seconds. What is the minimum following distance required when towing with a tow rope?",
        options: ["2 seconds — same as an LMV","3 seconds — treat as heavy vehicle when towing","The manual does not specify a separate towing following distance","4 seconds"],
        answer: 2,
        explain: "The manual specifies 2 seconds for LMV and 3 seconds for HMV. There is no separate prescribed following distance for towing — this is a trap question. The answer is that no separate rule is specified.",
      },
      {
        q: "A goods vehicle has a GVM of exactly 9,000 kg. What speed limit applies outside an urban area?",
        options: ["80 km/h — heavy goods limit applies","100 km/h — standard rural road limit applies","120 km/h — freeway limit applies when on a freeway","60 km/h — urban limit still applies"],
        answer: 1,
        explain: "The 80 km/h limit applies to GVM MORE THAN 9,000 kg. At EXACTLY 9,000 kg, the standard limits apply: 100 km/h on rural roads. This 'exceeds' vs 'equals' distinction is a classic exam trap.",
      },
      {
        q: "The minimum tyre tread depth for a motorcycle is the same as for a light motor vehicle. What is that depth?",
        options: ["0.5mm","1.6mm","1mm","2mm"],
        answer: 2,
        explain: "1mm minimum tread depth, visible across the full breadth and circumference, for both motorcycles and light motor vehicles. 1.6mm is the European standard and commonly confused with SA law.",
      },
      {
        q: "Goods projecting more than 300mm to the rear must be marked with a red flag by day. What are the dimensions of that flag?",
        options: ["200mm x 200mm","300mm x 300mm","450mm x 450mm","600mm x 300mm"],
        answer: 1,
        explain: "The warning flag must be exactly 300mm by 300mm. Square. Red. By night, retro-reflectors replace the flag. The specific size is testable and only one correct answer.",
      },
    ],
  },
  {
    id: 3,
    title: "ROUND 3: SPEED LIMIT SCENARIOS",
    subtitle: "Vehicle type, road type, load — all change the limit",
    color: "#007A4D",
    questions: [
      {
        q: "You're driving a minibus at 110 km/h on a freeway. A speed camera flashes you. Are you speeding?",
        options: ["No — the freeway limit is 120 km/h","Yes — buses and minibuses are limited to 100 km/h regardless of road type","No — 110 km/h is under 120 km/h","Only if the road is wet"],
        answer: 1,
        explain: "Buses and minibuses are capped at 100 km/h on ANY road — freeway or otherwise. The freeway's 120 km/h limit does not apply to them. At 110 km/h in a minibus you ARE speeding.",
      },
      {
        q: "A breakdown vehicle is towing a car on a freeway. What is the maximum permitted speed?",
        options: ["120 km/h — freeway limit applies","100 km/h — towing vehicle max","80 km/h — breakdown vehicle towing limit","30 km/h — rope/chain towing limit"],
        answer: 2,
        explain: "A breakdown vehicle TOWING another vehicle is limited to 80 km/h. The freeway's 120 km/h does not apply. Note: 30 km/h applies only to rope/chain towing by any vehicle — a breakdown vehicle uses a proper tow-bar.",
      },
      {
        q: "You're in a Woonerf zone. The speed limit sign inside shows 30 km/h. A delivery vehicle pulls up ahead and stops. What is your speed limit?",
        options: ["No specific limit — just drive safely","30 km/h","15 km/h","60 km/h — the delivery is causing a temporary urban condition"],
        answer: 1,
        explain: "Woonerf = 30 km/h max regardless of other circumstances. The pedestrian priority zone (R5) is 15 km/h. Don't confuse these two zone types.",
      },
      {
        q: "You are towing a caravan with a rigid draw-bar (not a rope or chain). What speed limit applies?",
        options: ["30 km/h — towing speed limit","Standard road limits apply — no special restriction for draw-bar towing","80 km/h maximum when towing","60 km/h on all roads"],
        answer: 1,
        explain: "The 30 km/h limit ONLY applies when towing with a ROPE or CHAIN. A draw-bar or tow-bar is a rigid coupling — standard road speed limits apply. This distinction is specifically tested.",
      },
      {
        q: "A goods vehicle's GCM (combination mass) is 9,001 kg. It is on a rural road. What is the maximum speed?",
        options: ["100 km/h","80 km/h","60 km/h","120 km/h on a freeway"],
        answer: 1,
        explain: "The 80 km/h limit applies to goods vehicles with GVM EXCEEDING 9,000 kg, AND to articulated vehicles with GCM EXCEEDING 9,000 kg. At GCM 9,001 kg the vehicle exceeds the threshold — 80 km/h applies.",
      },
      {
        q: "R201 speed limit sign shows 60 km/h. Below it is sign R512 (night time). It is 2pm. What speed limit applies?",
        options: ["60 km/h — the sign always applies","The standard road limit — no speed limit applies until night","60 km/h only after dark — R512 means it's night-time only","40 km/h — daytime reduction applies"],
        answer: 1,
        explain: "R512 = night-time selective restriction. The 60 km/h limit only applies at NIGHT. At 2pm it does not apply. The standard limit for that road type (60 urban / 100 rural / 120 freeway) applies during the day.",
      },
      {
        q: "You are travelling inside a pedestrian priority zone (R5) in a maintenance vehicle. What is the maximum speed?",
        options: ["30 km/h","20 km/h","15 km/h","10 km/h"],
        answer: 2,
        explain: "R5 pedestrian priority zone = 15 km/h maximum for ALL permitted vehicles (emergency, delivery, maintenance). No exceptions to the 15 km/h cap, regardless of vehicle type.",
      },
      {
        q: "The general urban speed limit is 60 km/h. A new road sign shows R201 with 80 km/h inside an urban area. Must you follow it?",
        options: ["No — the urban limit of 60 km/h always overrides","Yes — a speed limit sign overrides the default limit from the sign onwards","Only if it is a dual carriageway","Only during peak hours"],
        answer: 1,
        explain: "A speed limit sign (R201) applies FROM THE SIGN and overrides the default limit. The 60 km/h urban default only applies where no sign is posted. If a sign shows 80, that is the applicable limit from that point.",
      },
      {
        q: "You are doing 95 km/h on a rural road. You pass a 'buses and minibuses only' sign (R121). You are in a private car. Does the speed limit change for you?",
        options: ["Yes — once on a bus-designated road, 100 km/h max applies to all vehicles","No — R121 reserves the road for buses only; private cars should not be on that road, but the speed restriction is 100 km/h for that road type","No change — 95 km/h is fine anywhere rural","Yes — bus-reserved roads have a 80 km/h limit"],
        answer: 1,
        explain: "R121 means the road or lane is for buses only. If you're a private car and somehow on it, the standard rural 100 km/h limit applies to that road — but you shouldn't be there. Speed limits are by road type, not reservation status.",
      },
      {
        q: "You are towing another vehicle with a rope. Your passenger asks to sit in the towed car. You are travelling at 28 km/h. Is any of this illegal?",
        options: ["Yes — passengers in a towed vehicle are always illegal","Yes — 28 km/h exceeds the 20 km/h rope towing limit","Nothing is illegal — rope towing at ≤30 km/h with a passenger is permitted","Yes — the rope must be less than 2.5m"],
        answer: 2,
        explain: "Tow rope/chain = max 30 km/h. At 28 km/h you are within the limit. Passengers in a towed vehicle ARE permitted when speed does not exceed 30 km/h. Max rope length = 3.5m. All conditions are met — nothing is illegal.",
      },
    ],
  },
  {
    id: 4,
    title: "ROUND 4: SIGN SHAPES & CODES — TRAPS",
    subtitle: "Regulatory exceptions, temporary signs, code families",
    color: "#FF8C00",
    questions: [
      {
        q: "A triangular sign with a red border is ahead. Is it definitely a warning sign?",
        options: ["Yes — all triangular signs are warning signs","No — the Yield sign (R2) is also triangular but is a regulatory sign","Yes — only warning signs use triangles","No — some triangular signs are guidance signs"],
        answer: 1,
        explain: "The Yield sign (R2) is an inverted triangle — same shape category as warning signs — but it IS a regulatory sign. Failure to yield is an offence. You cannot assume all triangles are warning signs.",
      },
      {
        q: "Which two regulatory signs share their shape with non-regulatory sign categories?",
        options: ["Stop (octagonal) and Yield (triangular)","Yield (triangular) and Pedestrian Priority (diamond)","Stop (octagonal) and Pedestrian Priority (diamond)","No entry (round) and Speed limit (round)"],
        answer: 1,
        explain: "Yield (R2) is triangular — same as warning signs. Pedestrian priority (R5) is diamond-shaped — unique. Stop (R1.1) is octagonal — also unique but doesn't share with another category. The confusable pair is Yield + Pedestrian priority.",
      },
      {
        q: "Sign TR201 is displayed. What does the 'T' prefix tell you — and what colour is its background?",
        options: ["T = temporary. Yellow background.","T = traffic. White background.","T = trunk road. Green background.","T = toll road. Blue background."],
        answer: 0,
        explain: "The 'T' prefix identifies a temporary sign. Temporary signs always have a yellow background. TR201 = temporary speed limit. TW336 = temporary road works warning. Yellow = extra caution, normal rules may not apply.",
      },
      {
        q: "Sign R600 appears after a series of speed limit signs. What does it do?",
        options: ["Doubles the previous speed limit","Cancels the previous restriction from this point onward","Applies the restriction to a new vehicle class","Confirms the restriction continues"],
        answer: 1,
        explain: "R600 = de-restriction sign. It CANCELS the previous restriction from that point forward. You will often see it combined with the original symbol and a red cross (e.g., R201-600 = end of speed limit).",
      },
      {
        q: "You see a regulatory sign and directly below it a smaller sign showing specific times. What is the sub-sign and what does the combination mean?",
        options: ["A warning sign — combined they mean danger at those times only","A selective restriction sign (R500 series) — the main regulatory sign only applies during those time periods","A de-restriction sign — the restriction ends at those times","A guidance sign — additional information only"],
        answer: 1,
        explain: "R500 series = selective restriction signs. They are mounted below regulatory signs and restrict WHEN or to WHOM the sign applies. R502 = two time periods. R511 = daytime only. R512 = night time only.",
      },
      {
        q: "You see sign R214. What exactly does it prohibit, and for how far?",
        options: ["No parking, for 200m","No overtaking any vehicle, for 500m","No overtaking heavy motor vehicles only, for 500m","No U-turns, for 500m"],
        answer: 1,
        explain: "R214 = no overtaking ANY vehicle for the next 500m. R215 = no overtaking of heavy vehicles BY other heavy vehicles. R213 = no U-turn. These three are commonly confused when candidates skim the question.",
      },
      {
        q: "You see sign R305-P at a parking area. It has a car symbol and no time indicator. What does it mean?",
        options: ["Free parking, no time limit, for all vehicles","Paid parking, no time limit, for vehicles with GVM under 3,500 kg only","Paid parking, maximum 2 hours, for all vehicles","Reserved parking for motorcars only, free"],
        answer: 1,
        explain: "R305-P = parking for vehicles with GVM LESS THAN 3,500 kg, no time limit, but a fee must be paid. R306-P = same but WITH a time limit. GVM restriction (3,500 kg) matches the LMV boundary.",
      },
      {
        q: "Sign R403 (Woonerf) prohibits vehicles over 3,500 kg. It also prohibits vehicles with more than how many seats?",
        options: ["8 seats","10 seats","12 seats","16 seats"],
        answer: 1,
        explain: "Woonerf (R403) prohibits: vehicles with GVM exceeding 3,500 kg, OR vehicles with MORE THAN 10 seats. Both restrictions have the same exception: local access or delivery. A vehicle with exactly 10 seats is permitted.",
      },
      {
        q: "The Excessive Noise sign (R206) is near a hospital. Your truck exhaust is very loud. Which TWO restrictions apply?",
        options: ["Must reduce speed to 30 km/h, and no hooter for 100m","May not proceed past the sign if noise is high, and no hooter for 100m after the sign","No hooter for 500m, and must use alternative route","Must stop and switch off engine, and no hooter for 200m"],
        answer: 1,
        explain: "R206 = (1) if your vehicle's noise level is HIGH, you may NOT PROCEED past the sign at all, AND (2) regardless, the hooter may not be used for 100m after the sign. Two separate rules, both must be obeyed.",
      },
      {
        q: "You want to make a U-turn at an intersection. Sign R213 is on the far side of the intersection. On which side of the intersection does the prohibition apply?",
        options: ["Before the intersection only","After the intersection — the sign is on the far side","At both the near and far sides","The sign applies 500m in each direction from where it's posted"],
        answer: 1,
        explain: "R213 (No U-turn) applies from where it is positioned — which may be on the approach to OR on the far side of the intersection. If it's on the far side, it prohibits the U-turn you would make AFTER passing through the intersection.",
      },
    ],
  },
  {
    id: 5,
    title: "ROUND 5: TRAFFIC SIGNALS & MARKINGS HYBRID",
    subtitle: "Lights, lines, boxes — all interact in this round",
    color: "#CC44FF",
    questions: [
      {
        q: "You stop at a red light. The light turns green. A traffic officer in the intersection holds up a hand facing you. What do you do?",
        options: ["Proceed — the green light overrides","Wait — but only for 5 seconds","Stay stopped — the traffic officer overrides ALL signals including green lights","Hoot to indicate you have right of way"],
        answer: 2,
        explain: "Traffic officer signals take PRECEDENCE over every other traffic signal — green lights, stop signs, road markings, everything. The officer's stop signal means you stay stopped until they signal you to go.",
      },
      {
        q: "At traffic signals, a red figure is showing for pedestrians. The signal is flashing. A pedestrian is halfway across the road. What must they do?",
        options: ["Stop and wait in the middle of the road","Return to the kerb immediately","Cross the intersection as quickly as possible","Wait for the next green figure signal"],
        answer: 2,
        explain: "Flashing red pedestrian figure: those NOT yet in the road must wait. Those ALREADY in the intersection must cross as QUICKLY AS POSSIBLE. Stopping in the middle is dangerous and incorrect.",
      },
      {
        q: "There is a box junction (RM10) marked at the intersection ahead. Traffic is moving slowly but your exit is currently clear. May you enter the box?",
        options: ["No — you may never enter a box junction unless traffic is completely stopped","Yes — your exit is clear so you may enter the box","Only if you can complete the crossing before the light changes","Yes but you must be prepared to stop inside if traffic backs up"],
        answer: 1,
        explain: "You MAY enter the box junction if your exit is clear. The rule is: you must be able to drive THROUGH and EXIT before stopping. If your exit is clear when you enter, you are complying — even if traffic backs up after you enter.",
      },
      {
        q: "A solid white no-crossing line (RM2) runs alongside a dashed line in the centre of the road. You are on the DASHED line side. May you cross to overtake?",
        options: ["No — RM2 always prohibits crossing regardless of which side you're on","Yes — on the dashed line side you may cross to overtake if safe","Yes but only motorcycles may cross","No — only emergency vehicles may cross RM2"],
        answer: 1,
        explain: "When a solid line and dashed line run together, the rule applies to the side with the SOLID line nearest to you. On the DASHED side you may cross to overtake if safe. On the SOLID side you may not — this is a paired line system.",
      },
      {
        q: "The traffic signals at an intersection are completely dark (power failure). No traffic officer is present. A driver in front of you stops. How must you treat this intersection?",
        options: ["Treat as an open road — no signals means no restriction","Treat as a yield in your direction only","Slow down, yield to all traffic, and be ready to stop — treat with extreme caution","Proceed through slowly — stopped vehicles ahead will clear"],
        answer: 2,
        explain: "Dark signals = TW412 situation. Slow down, yield to other traffic and be ready to stop. Some drivers may treat it as a 4-way stop, others as open road — extreme caution is required. A traffic officer or temporary stop sign may be controlling it.",
      },
      {
        q: "An overhead lane sign above your lane shows a yellow arrow pointing to the LEFT. The lane ahead appears clear. Must you change lanes?",
        options: ["No — yellow is advisory only; change if you want to","Yes — overhead yellow arrow means your lane IS closing ahead. Change in the direction of the arrow.","Only if you see a red X in the adjacent lane","Yes, but only if a speed limit change is also shown"],
        answer: 1,
        explain: "Overhead yellow arrow = your lane is closing ahead. This is MANDATORY — not advisory. Change lanes in the direction of the arrow. The fact that the lane appears clear ahead is irrelevant; the closure is ahead of what you can see.",
      },
      {
        q: "A no-overtaking line (RM1) is on your side of the road. There is a stationary truck broken down in your lane. May you cross RM1 to pass it?",
        options: ["No — RM1 may never be crossed","Yes — passing a stationary obstruction is one of the two legal exceptions to RM1","Yes — emergencies always override road markings","No — wait for a traffic officer to direct you"],
        answer: 1,
        explain: "RM1 (no-overtaking line) has TWO legal exceptions: (1) to gain direct access to an entrance on the other side, and (2) to PASS A STATIONARY OBSTRUCTION. A broken-down truck is a stationary obstruction — you may cross RM1, but only if safe.",
      },
      {
        q: "You're stopped at a red flashing signal at an intersection (not a railway crossing). After stopping, the road is clear in all directions. What is your next action?",
        options: ["Wait for the light to change to green","Proceed when safe — a flashing red is treated exactly like a stop sign","Wait for another vehicle to go first","Sound your hooter then proceed"],
        answer: 1,
        explain: "Flashing red signal (non-railway) = stop sign. Stop completely, then proceed when it is safe to do so. You do not wait for a light change. The only exception is a railway crossing where flashing red means a train is actively approaching.",
      },
      {
        q: "Sign IN15 (Multi-phase traffic signals) is posted at an intersection. Traffic in the OPPOSITE direction gets a green light. Your signal is still red. A driver behind you hoots. What do you do?",
        options: ["Proceed — when opposite traffic gets green, yours is about to change","Move forward slowly — the signal is about to change","Stay stopped — at multi-phase intersections your red may remain while opposite traffic moves","Switch on hazard lights to indicate the light is stuck"],
        answer: 2,
        explain: "IN15 explicitly warns that this intersection does not follow the normal sequence. Your signal can remain red while opposite-direction traffic moves. Only YOUR green signal authorises you to proceed. Do not move on the opposite direction's green.",
      },
      {
        q: "A mandatory direction arrow (RM8) in your lane points LEFT. You want to go straight. What must you do?",
        options: ["Proceed straight — road markings are advisory","Change to a straight-ahead lane before the intersection","You may proceed straight if the intersection is clear","Signal right to counteract the mandatory arrow"],
        answer: 1,
        explain: "RM8 (mandatory direction arrow) means you MUST travel in the direction indicated in that lane. To go straight you must move to a lane with a straight-ahead arrow before reaching the intersection. Choosing to go straight from a left-arrow lane is an offence.",
      },
    ],
  },
  {
    id: 6,
    title: "ROUND 6: MOTORCYCLE MADNESS",
    subtitle: "Helmets, engines, sidecars, passengers — exact rules",
    color: "#00BFFF",
    questions: [
      {
        q: "A motorcycle engine is exactly 50cc. May you carry a pillion passenger?",
        options: ["Yes — 50cc meets the minimum requirement","No — the engine must EXCEED 50cc to carry a passenger","Yes if both wear helmets","Yes if riding at under 60 km/h"],
        answer: 1,
        explain: "The engine must EXCEED 50cc (not just equal it) to carry a passenger. At exactly 50cc you may NOT carry a pillion. Same rule applies to sidecars. This word 'exceed' is a deliberate trap.",
      },
      {
        q: "A motorcycle rider is 16 years old and has a Code 1 learner's licence. What is the maximum engine size they may ride?",
        options: ["Any size — Code 1 has no engine restriction","50cc","125cc","200cc"],
        answer: 2,
        explain: "Under 18 with a Code 1 licence = maximum 125cc. Once you turn 18 with Code 1, any engine size is permitted. The 50cc threshold is for pillion passengers and freeway access, not rider age restrictions.",
      },
      {
        q: "On which side of the motorcycle MUST a sidecar be attached?",
        options: ["Right side — keeps it away from oncoming traffic","Left side — always","Either side — rider's preference","Only detachable sidecars may be used"],
        answer: 1,
        explain: "A sidecar must ALWAYS be attached to the LEFT side of the motorcycle. No exceptions. This is a fixed rule — no choice is permitted.",
      },
      {
        q: "A motorcycle rider can carry objects. Which of the following makes it illegal to carry an object in front of the rider?",
        options: ["The object weighs more than 5kg","The object is bulky or obstructs the rider's view or control of the motorcycle","The object is not strapped to the motorcycle","The rider is under 18"],
        answer: 1,
        explain: "An object may be carried in front of the rider IF it is: securely attached or in a carrier, AND does not obstruct view, AND does not prevent complete control. If it is bulky, obstructs view, or affects control — it is illegal.",
      },
      {
        q: "A motorcycle rider wants to ride with a passenger who is 13 years old. Who is responsible for ensuring the passenger wears a helmet?",
        options: ["The passenger — they are responsible for their own safety","The motorcycle rider — must ensure all passengers under 14 wear a helmet","The parent or guardian","Nobody — helmets are optional for passengers under 14"],
        answer: 1,
        explain: "The RIDER must ensure any passenger younger than 14 years wears a protective helmet. For passengers 14 and older, they are responsible for their own helmet. At 13, it's the rider's legal responsibility.",
      },
      {
        q: "Two motorcycles want to overtake the same car at the same time, riding side by side. Is this legal?",
        options: ["Yes — if there is enough road width","Yes — two motorcycles may overtake together if both signal","No — two or more motorcycles may not overtake another vehicle at the same time","Yes — on a freeway where there are multiple lanes"],
        answer: 2,
        explain: "The law is explicit: two or more persons driving motorcycles shall NOT overtake another vehicle at the same time. One motorcycle at a time must complete the overtake.",
      },
      {
        q: "A motorcycle with a seatbelt fitted that meets SABS standards and prevents the engine from starting unless the seatbelt is worn. Must the rider still wear a helmet?",
        options: ["Yes — helmets are always compulsory on motorcycles","No — this specific configuration exempts the rider from wearing a helmet","Only at speeds above 60 km/h","Only on freeways"],
        answer: 1,
        explain: "This is a real legal exception: if the motorcycle has a SABS-compliant seatbelt AND the engine cannot start unless the seatbelt is worn, the helmet requirement does NOT apply. Very unusual situation but it's in the law.",
      },
      {
        q: "A motorcyclist performs a wheelie (front wheel off the ground) on a public road. What law does this break?",
        options: ["Nothing — wheelies are only illegal on freeways","The rule that all wheels must maintain contact with the road surface at all times while riding","The speed limit — wheelies require excessive speed","The excessive noise prohibition"],
        answer: 1,
        explain: "The law requires a rider to ride in such a manner that ALL wheels of the motorcycle are in contact with the road surface at all times. A wheelie lifts the front wheel — this is a direct offence regardless of speed.",
      },
      {
        q: "A motorcycle has a 45cc engine and a sidecar attached to the left side. What is WRONG with this setup?",
        options: ["Nothing — 45cc is above the 40cc threshold","The sidecar engine must exceed 50cc — at 45cc no sidecar is permitted","The sidecar is on the wrong side","Nothing — sidecar rules only apply to engines over 125cc"],
        answer: 1,
        explain: "No sidecar may be attached to a motorcycle with engine capacity LESS THAN 50cc. At 45cc the engine is under 50cc — this sidecar is illegal. The sidecar side (left) is correct.",
      },
      {
        q: "Maximum number of adult persons permitted in a motorcycle sidecar?",
        options: ["One only","Two","Three","No restriction if space permits"],
        answer: 1,
        explain: "A rider may not carry more than TWO adult persons in a sidecar. One adult or two adults — but never more than two.",
      },
    ],
  },
  {
    id: 7,
    title: "ROUND 7: SEATBELTS, HELMETS & CHILDREN",
    subtitle: "Age thresholds, height overrides, driver responsibilities",
    color: "#FF6B9D",
    questions: [
      {
        q: "A child is 13 years old and exactly 1.5m tall. For seatbelt law purposes, is this child treated as a child or an adult?",
        options: ["Adult — they are exactly at the 1.5m threshold","Child — they must be TALLER THAN 1.5m to be treated as an adult","Adult — 13 is the threshold age","Child — only age matters, not height"],
        answer: 1,
        explain: "A person under 14 is treated as an adult for seatbelt purposes ONLY IF they are TALLER THAN 1.5m (i.e. over 1.5m, not equal to). At exactly 1.5m, they do not meet the 'taller than' condition — they are still a child.",
      },
      {
        q: "A 15-year-old who is 1.4m tall is in your vehicle. For seatbelt purposes, are they a child or an adult?",
        options: ["Child — they are under 16","Adult — they are older than 14","Adult — only height below 1.5m makes you a child","Child — they are both under 14 in height terms... wait, they are 15"],
        answer: 1,
        explain: "OLDER THAN 14 = automatically adult for seatbelt purposes. At 15 years old, regardless of height, this person is an adult. The height exception (>1.5m) only applies to those UNDER 14 to make them adults earlier.",
      },
      {
        q: "You are reversing into a parking bay. A passenger is in the back seat. Must both of you wear seatbelts during the reversing manoeuvre?",
        options: ["Yes — seatbelts must be worn whenever the vehicle is in motion","No — seatbelts are not compulsory while reversing or moving in/out of a parking bay or area","Only the driver must wear a seatbelt while reversing","Only at speeds above 10 km/h"],
        answer: 1,
        explain: "The law specifically exempts seatbelt use while REVERSING or moving in or out of a parking bay or area. Both driver and passenger are exempt during this manoeuvre.",
      },
      {
        q: "You have three children in the back seat. Two seats have seatbelts. One does not. Who sits where and what are the rules?",
        options: ["All three must wear seatbelts — no exceptions","The child in the non-seatbelt seat commits an offence","The driver must ensure both seatbelt seats are used by children first; the child without a seatbelt sits in the non-belt seat","The vehicle may not move with three children and only two seatbelts"],
        answer: 2,
        explain: "An adult (or child) may occupy a non-seatbelt seat ONLY if all seatbelt-equipped seats in that row are already occupied. The driver must ensure seatbelt seats are occupied first. The third child may then sit in the non-belt seat.",
      },
      {
        q: "Who is legally responsible for ensuring ALL passengers in a motor vehicle wear seatbelts?",
        options: ["Each passenger is responsible for themselves","The vehicle owner","The driver of the motor vehicle","The oldest passenger in the vehicle"],
        answer: 2,
        explain: "The DRIVER of a motor vehicle is legally responsible for ensuring that all persons travelling in the vehicle wear a seatbelt. Not the owner, not the passengers — the driver.",
      },
      {
        q: "A child restraint is not available in your vehicle. A 5-year-old child needs to travel with you. The vehicle has rear seats. What must you do?",
        options: ["The child may not travel without a child restraint","Place the child on the rear seat and ensure they wear the available seatbelt","Place the child in the front passenger seat with the airbag active","Place the child in any available seat"],
        answer: 1,
        explain: "If no child restraint is available: (1) the child must wear a seatbelt if one is available, AND (2) the child must be placed on the REAR seat if the vehicle has one. Both conditions apply.",
      },
      {
        q: "A sidecar passenger is 12 years old. Who must ensure they wear a helmet?",
        options: ["The passenger — they are old enough to be responsible","The motorcycle rider — must ensure passengers under 14 wear a helmet","The parent or guardian who permitted the ride","Nobody — sidecar passengers are not required to wear helmets"],
        answer: 1,
        explain: "Sidecar passengers MUST also wear helmets. The rider is responsible for ensuring passengers younger than 14 wear a helmet. At 12, it is the rider's responsibility.",
      },
      {
        q: "At what age does the seatbelt law begin applying to a person?",
        options: ["At any age — even infants","From age 3","From age 6","From age 1"],
        answer: 1,
        explain: "Seatbelt law applies to persons aged 3 and older. Under 3 years old, the seatbelt regulations technically do not cover the child — though they should still be safely restrained in an appropriate child seat.",
      },
      {
        q: "Your helmet's chin strap is broken and cannot be fastened. May you ride your motorcycle?",
        options: ["Yes — as long as the helmet is on your head","Yes — chin straps are recommended but not legally required","No — the helmet must fit properly AND the chin strap must be properly fastened under the chin","Yes if riding under 60 km/h"],
        answer: 2,
        explain: "The law requires a helmet that (1) fits properly AND (2) of which the chin strap is properly fastened under the chin. Both conditions must be met. A helmet with a broken chin strap does not meet the legal standard.",
      },
      {
        q: "A passenger in your car refuses to wear a seatbelt. They are 25 years old and sign a form saying they accept responsibility. Does this release you from legal obligation?",
        options: ["Yes — an adult accepting responsibility in writing removes your liability","No — the driver remains legally responsible regardless of the passenger's age or consent","Only if they are in the rear seat","Yes if witnessed by a third party"],
        answer: 1,
        explain: "The driver's legal responsibility for passenger seatbelt use is absolute. No waiver, form, or adult consent removes the driver's obligation. The driver MUST ensure all passengers are belted.",
      },
    ],
  },
  {
    id: 8,
    title: "ROUND 8: ACCIDENTS, ALCOHOL & ADMIN",
    subtitle: "Reporting, blood alcohol, documents, timing",
    color: "#FFA500",
    questions: [
      {
        q: "You are involved in an accident. No traffic officer is at the scene. You exchange details with the other driver. By when must you report it?",
        options: ["Immediately","Within 6 hours","Within 24 hours","Within 48 hours"],
        answer: 2,
        explain: "If details were not furnished to a traffic officer at the scene, you must report the accident to a police station within 24 HOURS. This applies regardless of whether the other party was cooperative.",
      },
      {
        q: "After a minor accident, your passenger suggests you have a quick drink to calm your nerves before going to the police station. Is this legal?",
        options: ["Yes — as long as you're no longer driving","Yes — minor accidents allow this","No — you may not consume alcohol or drugs before reporting unless a medical practitioner instructs you to","Yes — at the police station they only test if you smell of alcohol"],
        answer: 2,
        explain: "After ANY accident, you may NOT take alcohol or narcotic drugs before reporting — EXCEPT on the instructions of a medical practitioner. This applies whether or not you are still driving. Consuming alcohol would compromise any blood test.",
      },
      {
        q: "Your blood alcohol is exactly 0.05g per 100ml. You are a private (non-professional) driver. Are you committing an offence?",
        options: ["No — the limit IS 0.05g so you are exactly within it","Yes — the offence is committed at 0.05g OR MORE, so exactly 0.05g is an offence","Only if you cause an accident","Only on a freeway"],
        answer: 1,
        explain: "The law states the offence is at 0.05g per 100ml OR MORE. Exactly 0.05g IS an offence. The word 'or more' means the limit IS the offence threshold, not the point below which you're safe.",
      },
      {
        q: "You are sitting in the driver's seat of your car. The engine is running but the car is not moving. You are over the legal alcohol limit. Is this an offence?",
        options: ["No — you must be driving for it to be an offence","Yes — it is an offence to occupy the driver's seat of a vehicle with the engine running while over the limit","Only if the vehicle is in gear","Only on a public road"],
        answer: 1,
        explain: "The law covers both DRIVING a vehicle AND occupying the driver's seat of a vehicle of which the engine is running — while under the influence. You don't need to be moving.",
      },
      {
        q: "You are a professional driver. At what blood alcohol level do you commit an offence?",
        options: ["0.05g per 100ml — same as all drivers","0.02g per 100ml","Zero — professional drivers must have 0.00g","0.08g per 100ml"],
        answer: 1,
        explain: "Professional drivers = 0.02g per 100ml or MORE. General drivers = 0.05g per 100ml or more. Professional drivers face a stricter limit — less than half that of regular drivers.",
      },
      {
        q: "There is a fatality in an accident and a vehicle is completely blocking the road. No traffic officer has arrived. May you move the vehicle?",
        options: ["Yes — clearing the road for emergency vehicles is always priority","No — vehicles involved in a fatality accident may never be moved","Yes, BUT only after clearly marking the vehicle's position on the road surface first","Yes, but only if the vehicle is unoccupied"],
        answer: 2,
        explain: "Where there is a complete obstruction AND a person has been killed or injured, no vehicle may be moved UNLESS its position is first clearly marked on the road surface, OR a traffic officer authorises the removal.",
      },
      {
        q: "Your vehicle has been left in the same parking spot in an urban area for 5 days without moving. Is it deemed abandoned?",
        options: ["Yes — urban threshold is 3 days","No — urban threshold is 7 days","Yes — urban threshold is 5 days","No — there is no urban abandoned vehicle rule"],
        answer: 1,
        explain: "Inside an urban area = 7 CONTINUOUS DAYS before deemed abandoned. Outside urban area = only 24 HOURS. At 5 days in an urban area, the vehicle is not yet deemed abandoned.",
      },
      {
        q: "You've just been in a minor accident. You took a photo of the other car's number plate and exchanged details. You then drive home and have a glass of wine. Thirty minutes later you drive to the police station to report it. Is there a legal problem?",
        options: ["No — you were at home and not driving when you drank","Yes — you consumed alcohol before reporting the accident, which is illegal regardless of whether you were driving","Only if your blood alcohol is over 0.05g at the station","No — you were no longer at the accident scene"],
        answer: 1,
        explain: "The law prohibits consuming alcohol BEFORE REPORTING the accident — not just before driving away from the scene. Drinking at home before going to report is an offence. Exception: only if a medical practitioner instructs you to.",
      },
      {
        q: "You moved to a new house 15 days ago. You have not notified the registering authority yet. Are you in breach of the law?",
        options: ["No — you have 21 days to notify","No — there is no legal obligation to notify","Yes — you had 14 days to notify and you are now overdue","Yes — you had 7 days to notify"],
        answer: 2,
        explain: "You must notify the registering authority within 14 DAYS of permanently changing your place of residence. At 15 days, you are overdue and in breach. Not 21 days (disc grace period), not 7 days (urban abandoned threshold).",
      },
      {
        q: "Your vehicle licence disc expired 22 days ago. You drive it to a licensing office to renew. Is the vehicle legal to drive?",
        options: ["Yes — the grace period is 30 days","No — the grace period is only 21 days and you are now outside it","Yes — driving to the licensing office is always exempt","No — the vehicle is illegal from the day the disc expires"],
        answer: 1,
        explain: "The grace period is 21 DAYS. At 22 days you are ONE DAY outside the grace period. The vehicle may no longer be operated on a public road with the expired disc. The disc expired licence = cannot legally drive it.",
      },
    ],
  },
  {
    id: 9,
    title: "ROUND 9: PARKING, TOWING & FREEWAY RULES",
    subtitle: "Distances, prohibitions, freeway sign sequences",
    color: "#98FF98",
    questions: [
      {
        q: "You want to park at night. Your car is 8m from a lit street lamp, parked completely off the roadway. Must your lights be on?",
        options: ["Yes — lights must always be on when parked at night on any road","No — lights not required if off the roadway (one of the three exemptions)","No — within 12m of a street lamp is the exemption","Yes — only demarcated bays are exempt from the light rule"],
        answer: 1,
        explain: "Lights are NOT required if parked: (1) completely off the roadway, (2) in a demarcated parking bay, OR (3) within 12m of a lit street lamp. Being off the roadway alone is sufficient — distance to lamp is irrelevant here.",
      },
      {
        q: "You are towing a vehicle with a rigid tow-bar (not a rope). How many passengers may travel in the towed vehicle?",
        options: ["None — passengers in towed vehicles are always prohibited","The same restriction as rope towing — only permitted at ≤30 km/h","The tow-bar removes the passenger restriction — standard rules apply","Only one passenger, in the front seat"],
        answer: 2,
        explain: "The 30 km/h passenger restriction applies to rope or chain towing only. With a rigid draw-bar or tow-bar, that specific speed-based restriction on passengers does not apply — standard road rules govern.",
      },
      {
        q: "Your car breaks down on the roadway. You have no emergency warning triangle. No flares. What are you legally required to do?",
        options: ["You are in breach — all vehicles must carry a triangle","Nothing — motor cars are not required to carry emergency warning triangles","You must call a breakdown company within 30 minutes","You must push the car off the road immediately"],
        answer: 1,
        explain: "MOTOR CARS are not required to carry or display emergency warning triangles. Triangles are required for: heavy vehicles (GVM >3,500 kg), goods vehicles, minibuses, and buses. Not motor cars.",
      },
      {
        q: "You see freeway sign GA2/3. What should you have done ALREADY by the time you see this sign?",
        options: ["Started signalling to change lanes","Reduced your speed to 100 km/h","Already moved into the extreme LEFT lane","Confirmed your exit number"],
        answer: 2,
        explain: "GA2/3 (supplementary exit direction) appears approximately 500m before the off-ramp. The manual states you should ALREADY be in the extreme left lane by this point. If you haven't changed yet, you're dangerously late.",
      },
      {
        q: "You want to park on the LEFT side of the road. The nearest intersection is 4m away. Is this legal?",
        options: ["Yes — 4m is just within the 5m restriction","No — you must be AT LEAST 5m from an intersection, so 4m is too close","Yes — the 5m rule only applies to urban areas at peak times","No — you need to be at least 9m from any junction"],
        answer: 1,
        explain: "No parking within 5m of any intersection. At 4m you are inside the prohibited zone. You need to be 5m or MORE away. The '5m from intersection' rule is frequently confused with the '9m from pedestrian crossing' rule.",
      },
      {
        q: "A vehicle on the freeway has broken down. The driver walks along the freeway shoulder to find help. Is this legal?",
        options: ["Yes — the shoulder is a legal walking path in emergencies","Yes — pedestrians may use the shoulder in both urban and rural areas","No — no person shall be on a freeway on foot under normal circumstances","Yes — as long as they face oncoming traffic"],
        answer: 2,
        explain: "No person shall be on a freeway on foot under normal circumstances. The law does not create a broken-down vehicle exemption for walking on the freeway itself. This is a freeway-specific rule.",
      },
      {
        q: "You see GA4 (Gore exit sign) between the off-ramp and the freeway. You want to stay on the freeway. Which side of the sign do you pass on?",
        options: ["Left — always keep left on freeways","Right — stay right of the Gore sign to remain on the freeway","Either side — the Gore sign is just informational","Slow down and pass on whichever side is clearest"],
        answer: 1,
        explain: "GA4 (Gore sign): pass on the LEFT to EXIT the freeway. Pass on the RIGHT to STAY on the freeway. This is the exact split point between the off-ramp and the continuing freeway.",
      },
      {
        q: "You want to tow a broken-down vehicle with a rope at 35 km/h on a quiet road. What is wrong with this plan?",
        options: ["The rope must be over 3.5m for towing","35 km/h exceeds the 30 km/h maximum speed for rope or chain towing","Rope towing is entirely illegal — only rigid draw-bars may be used","Nothing is wrong — 35 km/h is within standard road limits"],
        answer: 1,
        explain: "Rope or chain towing = maximum 30 km/h. At 35 km/h you exceed the limit. The rope length maximum is 3.5m (not a minimum). Rope towing IS legal but only up to 30 km/h.",
      },
      {
        q: "Angle parking is marked on the roadside. When parking, how far from the kerb may the FRONT of your vehicle be?",
        options: ["No specific rule — just park within the lines","Not more than 150mm from the kerb, with no part of the vehicle on the sidewalk","Not more than 300mm from the kerb","Not more than 450mm from the left-hand edge"],
        answer: 1,
        explain: "For angle parking: the front of your vehicle must not be further than 150mm from the kerb. No part of the vehicle may be on or over the sidewalk. The 450mm rule applies to the rear wheel distance from the edge for parallel parking.",
      },
      {
        q: "A motorcycle is broken down. The rider wants to tow it using another motorcycle. Is this permitted?",
        options: ["Yes — motorcycle-to-motorcycle towing is fine under 30 km/h","Yes if the tow rope is under 3.5m","No — no person shall use any motorcycle to tow another vehicle","Yes, but only by a breakdown service"],
        answer: 2,
        explain: "The law is absolute: NO PERSON shall use any motorcycle to tow another vehicle. No exceptions based on what is being towed, speed, rope length, or who is doing the towing.",
      },
    ],
  },
  {
    id: 10,
    title: "ROUND 10: THE ULTIMATE GAUNTLET",
    subtitle: "100% hardest. Everything you know will be tested here.",
    color: "#DE3831",
    questions: [
      {
        q: "Sign R2.1 (Yield to Pedestrians) is displayed. A pedestrian is approaching the crossing but has not yet stepped off the kerb. Must you stop?",
        options: ["No — they are not yet in the roadway","Yes — you must yield to pedestrians crossing OR WANTING TO CROSS the road","Only if the pedestrian is waving at you","Only if there is no other traffic"],
        answer: 1,
        explain: "R2.1 compels you to give priority to pedestrians crossing OR WANTING TO CROSS. A pedestrian approaching the kerb clearly wants to cross. You must be ready to stop.",
      },
      {
        q: "You're driving a goods vehicle with GVM of exactly 3,500 kg. Is it a Light Motor Vehicle or Heavy Motor Vehicle?",
        options: ["HMV — it meets the 3,500 kg HMV threshold","LMV — the HMV boundary is GVM EXCEEDING 3,500 kg, so exactly 3,500 kg is still LMV","It depends on what goods are loaded","LMV for speed limits, HMV for other purposes"],
        answer: 1,
        explain: "LMV = tare or GVM of 3,500 kg OR LESS. HMV = EXCEEDING 3,500 kg. At exactly 3,500 kg, the vehicle is an LMV. This 'exceeding' vs 'or less' distinction appears in multiple rules and is tested constantly.",
      },
      {
        q: "Sign W307 (Pedestrians) is posted on a rural road. A child darts across the road 2.3 km past the sign. Did the sign warn you about this?",
        options: ["No — the warning only covers the next 2 km from the sign","Yes — W307 covers the next 2 km and 2.3 km is close enough","Yes — warning signs cover unlimited distance","No — rural warning signs only apply during school hours"],
        answer: 0,
        explain: "W307 (and W309, W310–313, W333) warn that the hazard exists for the NEXT 2 km from the sign. At 2.3 km you are beyond the warned zone. This does not mean you drive carelessly — but the sign specifically covers 2 km.",
      },
      {
        q: "You complete a right turn at an intersection. You were in the right lane. The car beside you was also supposed to turn right (mandatory arrow). But they went straight. Who committed an offence?",
        options: ["You — you should have yielded to them going straight","The other driver — mandatory direction arrows are legally binding and they violated their lane's rule","Nobody — lane marking arrows are only advisory","Both of you — turning situations are always shared liability"],
        answer: 1,
        explain: "Mandatory direction arrows (RM8) are legally binding. If a lane has a right-turn arrow, that driver MUST turn right. Going straight from a right-turn-only lane is an offence. You should also check your blind spot on right turns for vehicles violating their arrow.",
      },
      {
        q: "You are driving and you see the approaching vehicle has their main beam on, blinding you. You flash your lights to warn them. They don't dip. What does the law require you to do?",
        options: ["Match their main beam — they must dip first","Slow down or stop if necessary until you can see clearly — do not retaliate with main beam","Speed through the blinded area quickly","Use your hooter to signal them to dip"],
        answer: 1,
        explain: "When blinded by oncoming headlights, you must slow down or stop if necessary until your vision is restored. Retaliating with your own main beam is dangerous and illegal — it blinds both drivers simultaneously.",
      },
      {
        q: "A freeway confirmation sign (GA7) shows distances of 120 km and 45 km to two towns. Which town should you fill up fuel for?",
        options: ["The one 45 km away — it's closer","The one 120 km away — use the distance info to plan your fuel stop","Both are equally relevant for fuel planning","GA7 shows travel time, not distance"],
        answer: 1,
        explain: "GA7 (freeway confirmation) shows your route and distances to confirm you're on track AND to plan your trip — specifically to plan when to fill up with fuel and when to rest. The longer destination (120 km) is relevant for fuel planning.",
      },
      {
        q: "You've had 3 drinks. You feel fine. Your blood alcohol is 0.04g per 100ml. You are a private driver. May you drive?",
        options: ["No — 0.04g feels fine but is still over the safe threshold","Yes — the legal limit is 0.05g and you are under it","No — any alcohol means you should not drive","Yes, but only on back roads"],
        answer: 1,
        explain: "At 0.04g per 100ml you are BELOW the 0.05g offence threshold for a general (non-professional) driver. You are within the legal limit. Note: a professional driver at 0.04g IS over their 0.02g limit.",
      },
      {
        q: "Sign R5 (Pedestrian Priority) is at the entrance to a zone. You are in a private car and need to urgently reach a medical clinic inside the zone. May you enter?",
        options: ["Yes — medical emergency is always exempt","Yes — if it qualifies as an emergency vehicle situation","No — private motor cars may NOT enter a pedestrian priority zone for any reason","Yes — the clinic makes it a medical emergency"],
        answer: 2,
        explain: "Private motor cars are NOT among the three permitted vehicle types (emergency vehicles, loading/delivery, maintenance). Urgency and destination do not change this. A private car — even in a genuine personal emergency — may not enter the pedestrian priority zone.",
      },
      {
        q: "A no-entry sign (R3) is displayed at the end of an off-ramp. You accidentally drove up the off-ramp. May you reverse back down?",
        options: ["Yes — reversing down the ramp is safer than proceeding through the no-entry","No — proceed past the R3 sign and find a safe turnaround point","No — stop immediately and call a traffic officer","Yes — no-entry signs do not apply when reversing"],
        answer: 1,
        explain: "R3 (No Entry) means NO traffic may PROCEED past the sign on that road. Reversing back down an off-ramp against traffic flow is extremely dangerous and illegal. The correct action is to proceed past the sign and find a legal, safe place to turn around.",
      },
      {
        q: "Your test is TOMORROW. Blood alcohol at the police station is 0.05g (you are a general driver). A sign error caused you to park 8m from a pedestrian crossing (legal minimum: 9m). Your tyre tread is exactly 1mm. Your vehicle disc expired 20 days ago. How many offences have you committed?",
        options: ["One — the blood alcohol","Two — blood alcohol and parking","Three — blood alcohol, parking and disc","None — all values are at or within their limits"],
        answer: 1,
        explain: "Blood alcohol: 0.05g = offence (0.05 OR MORE). Parking: 8m from crossing = offence (need 9m+). Disc: 20 days expired = within 21-day grace period, NOT an offence. Tread: exactly 1mm = meets minimum, NOT an offence. Total: TWO offences.",
      },
    ],
  },
];

const PASS_SCORE = 7;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildExamQuestions() {
  const all = TESTS.flatMap(t => t.questions.map(q => ({ ...q, roundColor: t.color })));
  return shuffle(all).slice(0, 70);
}

export default function UltimateGauntlet({ onBack }) {
  const [screen, setScreen] = useState("home");
  const [testIndex, setTestIndex] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [allScores, setAllScores] = useState([]);
  const [showExplain, setShowExplain] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [showGate, setShowGate] = useState(false);
  const [isExamMode, setIsExamMode] = useState(false);
  const [examQuestions, setExamQuestions] = useState([]);
  const [timedMode, setTimedMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef(null);

  const currentTest = isExamMode ? null : TESTS[testIndex];
  const currentQ = isExamMode ? examQuestions[qIndex] : currentTest?.questions[qIndex];
  const totalQ = isExamMode ? examQuestions.length : currentTest?.questions.length;

  useEffect(() => {
    if (timedMode && screen === "quiz" && !answered) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current); handleTimeUp(); return 0; }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [screen, qIndex, timedMode, answered]);

  const handleTimeUp = () => {
    setAnswered(true); setShowExplain(true); setCurrentStreak(0);
    setWrongAnswers(p => [...p, { q: currentQ.q, yourAnswer: "⏱ TIME RAN OUT", correctAnswer: currentQ.options[currentQ.answer], explain: currentQ.explain }]);
  };

  const handleSelect = (i) => {
    if (answered) return;
    if (!incrementQuestionCount()) { setShowGate(true); return; }
    clearInterval(timerRef.current);
    setSelected(i); setAnswered(true);
    if (i === currentQ.answer) {
      setScore(s => s + 1);
      const ns = currentStreak + 1;
      setCurrentStreak(ns);
      if (ns > bestStreak) setBestStreak(ns);
    } else {
      setCurrentStreak(0);
      setWrongAnswers(p => [...p, { q: currentQ.q, yourAnswer: currentQ.options[i], correctAnswer: currentQ.options[currentQ.answer], explain: currentQ.explain }]);
    }
    setShowExplain(true);
  };

  const handleNext = () => {
    clearInterval(timerRef.current);
    if (qIndex < totalQ - 1) {
      setQIndex(qIndex + 1); setSelected(null); setAnswered(false); setShowExplain(false);
      if (timedMode) setTimeLeft(30);
    } else {
      if (!isExamMode) setAllScores(p => [...p, { testId: currentTest.id, title: currentTest.title, score, total: currentTest.questions.length }]);
      setScreen("result");
    }
  };

  const startTest = (i) => {
    setTestIndex(i); setQIndex(0); setSelected(null); setAnswered(false);
    setScore(0); setShowExplain(false); setCurrentStreak(0); setWrongAnswers([]);
    setIsExamMode(false); if (timedMode) setTimeLeft(30); setScreen("quiz");
  };

  const startExam = (timed) => {
    setExamQuestions(buildExamQuestions()); setQIndex(0); setSelected(null); setAnswered(false);
    setScore(0); setShowExplain(false); setCurrentStreak(0); setWrongAnswers([]);
    setIsExamMode(true); setTimedMode(timed); if (timed) setTimeLeft(30); setScreen("quiz");
  };

  const resetAll = () => { setAllScores([]); setBestStreak(0); setCurrentStreak(0); setScreen("home"); };

  const activeColor = isExamMode ? "#DE3831" : (currentTest?.color || "#DE3831");
  const progress = (qIndex / (totalQ || 1)) * 100;
  const isCorrect = answered && selected === currentQ?.answer;
  const totalScore = allScores.reduce((a, b) => a + b.score, 0);

  // ── HOME ──────────────────────────────────────────────────────────────────────
  if (screen === "home") return (
    <div style={{ minHeight: "100vh", background: "#060D07", fontFamily: "'Georgia', 'Times New Roman', serif", padding: "24px 16px" }}>
      {/* SA flag stripe */}
      <div style={{ display:"flex", height:6, width:"100%", position:"fixed", top:0, left:0, zIndex:10 }}>
        {["#000000","#FFB612","#007A4D","#F5F5F0","#DE3831","#4472CA"].map((c,i) => <div key={i} style={{flex:1,background:c}} />)}
      </div>
      <div style={{ maxWidth: 640, margin: "0 auto", paddingTop: 14 }}>
        <button onClick={onBack} style={{ background:"transparent", border:"1px solid #1A3020", color:"#6B7A62", fontSize:13, padding:"7px 14px", cursor:"pointer", fontFamily:"'Georgia', 'Times New Roman', serif", borderRadius:3, marginBottom:20 }}>← All Drills</button>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 10, letterSpacing: 6, color: "#6B7A62", marginBottom: 10 }}>TEST DAY EVE — FINAL BOSS</div>
          <div style={{ display: "inline-block", background: "#DE3831", color: "#fff", fontSize: 28, fontWeight: 900, padding: "10px 24px", letterSpacing: -1, marginBottom: 4 }}>HYBRID GAUNTLET</div>
          <div style={{ fontSize: 11, color: "#DE3831", letterSpacing: 4, marginTop: 8 }}>100 QUESTIONS — SIGNS + RULES — MAXIMUM DIFFICULTY</div>
          <p style={{ color: "#6B7A62", fontSize: 12, marginTop: 14, lineHeight: 1.8 }}>
            Every trap. Every exception. Every "EXCEPT" question.<br />
            Signs law + Rules of the Road fused together.<br />
            <span style={{ color: "#DE3831", fontWeight: 900 }}>If you can crack this, you WILL pass tomorrow.</span>
          </p>
        </div>

        {(allScores.length > 0 || bestStreak > 0) && (
          <div style={{ background: "#0D1F10", border: "1px solid #1A3020", borderRadius: 4, padding: "14px 20px", marginBottom: 24, display: "flex", justifyContent: "space-around", textAlign: "center" }}>
            <div><div style={{ color: "#DE3831", fontSize: 22, fontWeight: 900 }}>{totalScore}/{allScores.reduce((a,b)=>a+b.total,0)}</div><div style={{ color: "#6B7A62", fontSize: 10, letterSpacing: 2 }}>TOTAL</div></div>
            <div><div style={{ color: "#007A4D", fontSize: 22, fontWeight: 900 }}>{bestStreak}</div><div style={{ color: "#6B7A62", fontSize: 10, letterSpacing: 2 }}>BEST STREAK</div></div>
            <div><div style={{ color: "#FFB612", fontSize: 22, fontWeight: 900 }}>{allScores.length}/10</div><div style={{ color: "#6B7A62", fontSize: 10, letterSpacing: 2 }}>ROUNDS DONE</div></div>
          </div>
        )}

        {/* Exam simulator */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: "#DE3831", fontSize: 10, letterSpacing: 3, marginBottom: 10 }}>⚡ FULL EXAM SIMULATOR — 70 RANDOM QUESTIONS</div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => startExam(false)} style={{ flex: 1, background: "#DE3831", color: "#fff", border: "none", borderRadius: 4, padding: "16px", fontWeight: 900, fontSize: 12, letterSpacing: 2, cursor: "pointer", fontFamily: "'Georgia', 'Times New Roman', serif" }}>
              70 RANDOM Q's
            </button>
            <button onClick={() => startExam(true)} style={{ flex: 1, background: "#0D1F10", color: "#DE3831", border: "2px solid #DE3831", borderRadius: 4, padding: "16px", fontWeight: 900, fontSize: 12, letterSpacing: 2, cursor: "pointer", fontFamily: "'Georgia', 'Times New Roman', serif" }}>
              ⏱ TIMED (30s/Q)
            </button>
          </div>
        </div>

        <div style={{ height: 1, background: "#0D1F10", marginBottom: 20 }} />
        <div style={{ color: "#6B7A62", fontSize: 10, letterSpacing: 3, marginBottom: 14 }}>10 ROUNDS — DRILL BY TOPIC</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {TESTS.map((test, i) => {
            const done = allScores.find(s => s.testId === test.id);
            const passed = done && done.score >= PASS_SCORE;
            return (
              <button key={test.id} onClick={() => startTest(i)}
                style={{ background: "#0D1F10", border: `2px solid ${done ? (passed ? "#007A4D" : "#DE3831") : "#122116"}`, borderRadius: 4, padding: "14px 16px", textAlign: "left", cursor: "pointer", fontFamily: "'Georgia', 'Times New Roman', serif" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = test.color}
                onMouseLeave={e => e.currentTarget.style.borderColor = done ? (passed ? "#007A4D" : "#DE3831") : "#122116"}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ color: test.color, fontSize: 10, letterSpacing: 3, marginBottom: 3 }}>ROUND {test.id}</div>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{test.title.replace(`ROUND ${test.id}: `, "")}</div>
                    <div style={{ color: "#6B7A62", fontSize: 11, marginTop: 2 }}>{test.subtitle}</div>
                  </div>
                  <div style={{ textAlign: "right", minWidth: 50 }}>
                    {done ? (
                      <><div style={{ color: passed ? "#007A4D" : "#DE3831", fontSize: 22, fontWeight: 900 }}>{done.score}/10</div><div style={{ color: passed ? "#007A4D" : "#DE3831", fontSize: 9, letterSpacing: 2 }}>{passed ? "PASSED" : "RETRY"}</div></>
                    ) : <div style={{ color: "#122116", fontSize: 22, fontWeight: 900 }}>—</div>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {allScores.length > 0 && (
          <button onClick={resetAll} style={{ width: "100%", marginTop: 18, padding: "12px", background: "transparent", border: "1px solid #1A3020", color: "#6B7A62", fontSize: 11, letterSpacing: 2, cursor: "pointer", fontFamily: "'Georgia', 'Times New Roman', serif", borderRadius: 4 }}>
            RESET ALL SCORES
          </button>
        )}

        <div style={{ marginTop: 28, background: "#0D1F10", border: "1px solid #1A3020", borderRadius: 4, padding: "16px" }}>
          <div style={{ color: "#DE3831", fontSize: 10, letterSpacing: 3, marginBottom: 12 }}>🔥 TEST DAY REMINDERS</div>
          {["Read EVERY question TWICE — especially anything with 'NOT', 'EXCEPT', 'UNLESS'","'Exceeds' ≠ 'equals' — exactly 9,000 kg GVM is NOT subject to 80 km/h","'Or more' means the number itself is an offence — 0.05g IS an offence","Yield sign = triangular BUT regulatory. Traffic officer BEATS all signals.","Dipped = 45m. Main beam = 100m. Stop lamp = 30m. Hooter = 90m.","Pedestrian crossing = 9m. Intersection = 5m. Tunnel = 6m.","Tow rope: 30 km/h max, 3.5m max. Draw-bar: no speed restriction.","Motor cars do NOT need a warning triangle. Motorcycles may NOT tow.","Disc grace = 21 days. Address change = 14 days. Accident report = 24 hrs."].map((tip, i) => (
            <div key={i} style={{ color: "#6B7A62", fontSize: 11, lineHeight: 1.6, paddingBottom: 6, marginBottom: 6, borderBottom: i < 8 ? "1px solid #111" : "none" }}>
              <span style={{ color: "#DE3831", marginRight: 8 }}>▸</span>{tip}
            </div>
          ))}
        </div>
        <p style={{ textAlign: "center", color: "#122116", fontSize: 10, marginTop: 24 }}>You've got this. 8/9 means you're ready. Go get that licence. 🏆</p>
      </div>
    </div>
  );

  // ── QUIZ ──────────────────────────────────────────────────────────────────────
  if (screen === "quiz" && currentQ) {
    const timerPct = timedMode ? (timeLeft / 30) * 100 : 100;
    const timerColor = timeLeft > 15 ? "#007A4D" : timeLeft > 7 ? "#FFB612" : "#DE3831";
    return (
      <>
        {showGate && <FreemiumGate onClose={() => { setShowGate(false); setScreen("home"); }} />}
      <div style={{ minHeight: "100vh", background: "#060D07", fontFamily: "'Georgia', 'Times New Roman', serif", padding: "20px 16px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <div style={{ color: activeColor, fontSize: 10, letterSpacing: 3 }}>
                {isExamMode ? "⚡ HYBRID EXAM" : `ROUND ${currentTest.id}`}{timedMode ? " • TIMED" : ""}
              </div>
              <div style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>
                {isExamMode ? "70-Question Final Boss" : currentTest.title.replace(`ROUND ${currentTest.id}: `, "")}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#FFB612", fontSize: 22, fontWeight: 900 }}>{score}</div>
              <div style={{ color: "#1A3020", fontSize: 10, letterSpacing: 2 }}>SCORE</div>
            </div>
          </div>

          <div style={{ height: 3, background: "#0D1F10", borderRadius: 2, marginBottom: timedMode ? 6 : 18 }}>
            <div style={{ height: "100%", width: `${progress}%`, background: activeColor, borderRadius: 2, transition: "width 0.3s" }} />
          </div>

          {timedMode && (
            <div style={{ height: 4, background: "#0D1F10", borderRadius: 2, marginBottom: 16, position: "relative" }}>
              <div style={{ height: "100%", width: `${timerPct}%`, background: timerColor, borderRadius: 2, transition: "width 1s linear" }} />
              <div style={{ position: "absolute", right: 0, top: -15, color: timerColor, fontSize: 13, fontWeight: 900 }}>{timeLeft}s</div>
            </div>
          )}

          <div style={{ color: "#6B7A62", fontSize: 11, letterSpacing: 3, marginBottom: 12 }}>
            Q {qIndex + 1} / {totalQ}
            {currentStreak >= 3 && <span style={{ color: "#FFB612", marginLeft: 16 }}>🔥 {currentStreak} STREAK</span>}
          </div>

          <div style={{ background: "#0D1F10", border: `1px solid ${activeColor}33`, borderRadius: 4, padding: "20px", marginBottom: 14, color: "#fff", fontSize: 14, lineHeight: 1.8, fontWeight: 600 }}>
            {currentQ.q}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 14 }}>
            {currentQ.options.map((opt, i) => {
              let bc = "#122116", bg = "#0D1F10", tc = "#888";
              if (answered) {
                if (i === currentQ.answer) { bc = "#007A4D"; bg = "#001a12"; tc = "#007A4D"; }
                else if (i === selected) { bc = "#DE3831"; bg = "#1a0000"; tc = "#DE3831"; }
                else { tc = "#1A3020"; }
              }
              return (
                <button key={i} onClick={() => handleSelect(i)}
                  style={{ background: bg, border: `2px solid ${bc}`, borderRadius: 4, padding: "13px 14px", textAlign: "left", cursor: answered ? "default" : "pointer", display: "flex", gap: 10, alignItems: "flex-start", fontFamily: "'Georgia', 'Times New Roman', serif", transition: "border-color 0.1s" }}
                  onMouseEnter={e => { if (!answered) e.currentTarget.style.borderColor = activeColor; }}
                  onMouseLeave={e => { if (!answered) e.currentTarget.style.borderColor = "#122116"; }}>
                  <span style={{ color: tc, fontSize: 10, fontWeight: 900, letterSpacing: 1, minWidth: 18, marginTop: 2 }}>{String.fromCharCode(65 + i)}</span>
                  <span style={{ color: tc, fontSize: 13, lineHeight: 1.5 }}>{opt}</span>
                  {answered && i === currentQ.answer && <span style={{ marginLeft: "auto", color: "#007A4D" }}>✓</span>}
                  {answered && i === selected && i !== currentQ.answer && <span style={{ marginLeft: "auto", color: "#DE3831" }}>✗</span>}
                </button>
              );
            })}
          </div>

          {showExplain && (
            <div style={{ background: isCorrect ? "#001a12" : "#1a0000", border: `1px solid ${isCorrect ? "#007A4D" : "#DE3831"}`, borderRadius: 4, padding: "14px 16px", marginBottom: 14 }}>
              <div style={{ color: isCorrect ? "#007A4D" : "#DE3831", fontSize: 10, letterSpacing: 3, marginBottom: 8, fontWeight: 900 }}>
                {selected === null ? "⏱ TIME'S UP — MEMORISE THIS" : isCorrect ? "✓ CORRECT" : "✗ WRONG — BURN THIS IN"}
              </div>
              <div style={{ color: "#888", fontSize: 12, lineHeight: 1.7 }}>{currentQ.explain}</div>
              {!isCorrect && answered && selected !== null && (
                <AITutor question={currentQ.q} correctAnswer={currentQ.options[currentQ.answer]} chosenAnswer={currentQ.options[selected]} />
              )}
            </div>
          )}

          {answered && (
            <button onClick={handleNext} style={{ width: "100%", padding: "14px", background: activeColor, color: "#fff", border: "none", borderRadius: 4, fontSize: 12, fontWeight: 900, letterSpacing: 3, cursor: "pointer", fontFamily: "'Georgia', 'Times New Roman', serif" }}>
              {qIndex < totalQ - 1 ? "NEXT →" : "SEE RESULTS →"}
            </button>
          )}
        </div>
      </div>
      </>
    );
  }

  // ── RESULT ────────────────────────────────────────────────────────────────────
  if (screen === "result") {
    const finalTotal = isExamMode ? examQuestions.length : (currentTest?.questions.length || 10);
    const pct = Math.round((score / finalTotal) * 100);
    const passed = isExamMode ? pct >= 77 : score >= PASS_SCORE;
    return (
      <div style={{ minHeight: "100vh", background: "#060D07", fontFamily: "'Georgia', 'Times New Roman', serif", padding: "24px 16px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ background: passed ? "#001a12" : "#1a0000", border: `2px solid ${passed ? "#007A4D" : "#DE3831"}`, borderRadius: 4, padding: "28px 24px", textAlign: "center", marginBottom: 24 }}>
            <div style={{ color: passed ? "#007A4D" : "#DE3831", fontSize: 10, letterSpacing: 4, marginBottom: 10 }}>
              {isExamMode ? "HYBRID EXAM RESULT" : `ROUND ${currentTest?.id} RESULT`}
            </div>
            <div style={{ color: "#fff", fontSize: 56, fontWeight: 900, lineHeight: 1 }}>
              {score}<span style={{ color: "#122116" }}>/{finalTotal}</span>
            </div>
            <div style={{ color: passed ? "#007A4D" : "#DE3831", fontSize: 22, fontWeight: 900, marginTop: 6 }}>{pct}%</div>
            <div style={{ color: "#6B7A62", fontSize: 12, marginTop: 8 }}>
              {passed
                ? isExamMode ? "🏆 Above 77%. You are READY. Go ace that test tomorrow." : "Round passed. Solid."
                : isExamMode ? `Need 77% on the day. You got ${pct}%. Drill your wrong answers then sleep.` : `Need ${PASS_SCORE}/10. Review your mistakes below.`}
            </div>
          </div>

          {wrongAnswers.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ color: "#DE3831", fontSize: 10, letterSpacing: 3, marginBottom: 14 }}>✗ MISTAKES TO MEMORISE TONIGHT ({wrongAnswers.length})</div>
              {wrongAnswers.map((w, i) => (
                <div key={i} style={{ background: "#0D1F10", border: "1px solid #2a0000", borderRadius: 4, padding: "14px", marginBottom: 10 }}>
                  <div style={{ color: "#6B7A62", fontSize: 12, marginBottom: 8, lineHeight: 1.5 }}>{w.q}</div>
                  <div style={{ color: "#DE3831", fontSize: 11, marginBottom: 4 }}>✗ {w.yourAnswer}</div>
                  <div style={{ color: "#007A4D", fontSize: 11, marginBottom: 8 }}>✓ {w.correctAnswer}</div>
                  <div style={{ color: "#6B7A62", fontSize: 11, lineHeight: 1.6, borderTop: "1px solid #111", paddingTop: 8 }}>{w.explain}</div>
                </div>
              ))}
            </div>
          )}

          {wrongAnswers.length === 0 && (
            <div style={{ background: "#001a12", border: "1px solid #007A4D", borderRadius: 4, padding: 20, textAlign: "center", marginBottom: 24 }}>
              <div style={{ color: "#007A4D", fontSize: 18 }}>🔥 PERFECT. You are not human. Go sleep.</div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => isExamMode ? startExam(timedMode) : startTest(testIndex)} style={{ flex: 1, padding: "13px", background: "#DE3831", color: "#fff", border: "none", borderRadius: 4, fontSize: 11, fontWeight: 900, letterSpacing: 2, cursor: "pointer", fontFamily: "'Georgia', 'Times New Roman', serif" }}>RETRY</button>
            <button onClick={() => setScreen("home")} style={{ flex: 1, padding: "13px", background: "#FFB612", color: "#000", border: "none", borderRadius: 4, fontSize: 11, fontWeight: 900, letterSpacing: 2, cursor: "pointer", fontFamily: "'Georgia', 'Times New Roman', serif" }}>HOME →</button>
          </div>

          {!isExamMode && allScores.length === 10 && (
            <div style={{ marginTop: 22, background: "#0D1F10", border: "1px solid #1A3020", borderRadius: 4, padding: "20px", textAlign: "center" }}>
              <div style={{ color: "#DE3831", fontSize: 10, letterSpacing: 3, marginBottom: 8 }}>ALL 10 ROUNDS COMPLETE</div>
              <div style={{ color: "#fff", fontSize: 44, fontWeight: 900 }}>{allScores.reduce((a, b) => a + b.score, 0)}/100</div>
              <div style={{ color: "#6B7A62", fontSize: 12, marginTop: 8 }}>
                {allScores.reduce((a, b) => a + b.score, 0) >= 77
                  ? "🏆 Test-ready. Sleep now. Tomorrow you win."
                  : "Drill your wrong answers one more time, then sleep. You're close."}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}