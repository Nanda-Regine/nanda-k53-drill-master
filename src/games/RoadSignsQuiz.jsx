import { useState, useEffect, useCallback } from "react";
import { T } from "../theme.js";

function SignImg({ src, alt, size = 130 }) {
  return (
    <img
      src={`./signs/${src}`}
      alt={alt || "road sign"}
      style={{
        width: size, height: size,
        objectFit: "contain",
        imageRendering: "crisp-edges",
        filter: "brightness(1.1) contrast(1.05)",
      }}
    />
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// QUESTION DATA
// ══════════════════════════════════════════════════════════════════════════════

const CATEGORIES = [
  { id: "control",     label: "Regulatory — Control",      color: T.red,     desc: "Signs you must obey — they control how and where you drive." },
  { id: "prohibition", label: "Regulatory — Prohibition",  color: "#9B59B6", desc: "Red-circle signs that prohibit specific vehicles or manoeuvres." },
  { id: "warning",     label: "Warning Signs",             color: T.gold,    desc: "Triangular signs that warn of hazards and changing road conditions ahead." },
];

const QUESTIONS = [

  // ── REGULATORY — CONTROL ───────────────────────────────────────────────────

  {
    id: "c01", category: "control",
    img: "stop-sign.jpg",
    question: "What does this sign require you to do?",
    options: [
      "Come to a complete stop and proceed only when safe",
      "Slow down and yield to oncoming traffic",
      "Stop only if another vehicle is approaching",
      "Reduce speed to 10 km/h",
    ],
    answer: 0,
    explanation: "A STOP sign requires a complete stop at the stop line, regardless of whether traffic is visible. You may only proceed when it is safe to do so.",
  },
  {
    id: "c02", category: "control",
    img: "yield-to-oncoming-traffic.jpg",
    question: "What must you do when you see this sign?",
    options: [
      "Stop completely before entering",
      "Give way to oncoming and intersecting traffic",
      "Sound your horn before proceeding",
      "Flash your headlights to warn others",
    ],
    answer: 1,
    explanation: "A YIELD sign means you must give way to traffic already on the major road or oncoming. You may slow or stop if needed, but a full stop is only required if traffic is present.",
  },
  {
    id: "c08", category: "control",
    img: "mandatory-direction-arrow-ahead.jpg",
    question: "What does this sign mean?",
    options: [
      "Recommended direction to follow",
      "You must travel in the direction shown — no other direction is permitted",
      "Lane for heavy vehicles only",
      "One-way road begins",
    ],
    answer: 1,
    explanation: "A mandatory direction sign (solid arrow on blue or red circle) means you are legally required to travel in the direction indicated. Deviating is prohibited.",
  },
  {
    id: "c10", category: "control",
    img: "mini-circle.jpg",
    question: "What does this blue circular sign with a circular arrow mean?",
    options: [
      "U-turns are permitted here",
      "You are approaching a mini-roundabout — give way to traffic in the circle",
      "Traffic circle — no entry from this side",
      "Drive around the next block",
    ],
    answer: 1,
    explanation: "The mini-circle sign indicates a mini-roundabout ahead. Traffic already in the circle has priority — you must give way before entering.",
  },
  {
    id: "c11", category: "control",
    img: "right-of-way-sign.jpg",
    question: "A yellow diamond sign means?",
    options: [
      "You must give way to all traffic",
      "You have right of way on this road",
      "Caution — dangerous road ahead",
      "Priority road ends ahead",
    ],
    answer: 1,
    explanation: "The yellow diamond (right-of-way sign) tells you that you are on a priority road and have right of way over traffic joining from side roads.",
  },
  {
    id: "c12", category: "control",
    img: "de-striction.jpg",
    question: "What does a white circle with diagonal grey lines mean?",
    options: [
      "Start of a speed restriction zone",
      "No passing zone begins",
      "End of a restriction — speed limit, no-overtaking, etc. no longer applies",
      "Road ends ahead",
    ],
    answer: 2,
    explanation: "The de-restriction sign cancels the previous restriction. For example, after a 60 km/h zone, normal national speed limits resume.",
  },
  {
    id: "c13", category: "control",
    img: "camera-speed-limit.jpg",
    question: "What does a speed limit sign with a camera symbol indicate?",
    options: [
      "Photography is prohibited on this road",
      "This speed limit is enforced by a speed camera",
      "CCTV surveillance area ahead",
      "Slow down — road crew filming ahead",
    ],
    answer: 1,
    explanation: "A camera speed limit sign warns that the stated speed limit is actively monitored by a speed camera. Exceeding it will result in a fine.",
  },
  {
    id: "c14", category: "control",
    img: "traffic-control-stop-ahead-sign.jpg",
    question: "A sign showing 'STOP' inside a warning shape means?",
    options: [
      "Stop immediately",
      "A STOP-controlled intersection is ahead — prepare to stop",
      "Road closed — no entry",
      "Emergency stopping zone",
    ],
    answer: 1,
    explanation: "This advance warning sign tells you that a STOP sign is ahead. Reduce speed and prepare to stop completely at the upcoming intersection.",
  },
  {
    id: "c15", category: "control",
    img: "traffic-control-yield-ahead-sign.jpg",
    question: "What does this sign warn you about?",
    options: [
      "A YIELD-controlled intersection is ahead — be prepared to give way",
      "Stop immediately",
      "Traffic merging from the left",
      "Yield to pedestrians only",
    ],
    answer: 0,
    explanation: "This advance warning sign tells you that a YIELD sign is ahead. Reduce speed and be ready to give way to traffic on the major road.",
  },

  // ── REGULATORY — PROHIBITION ───────────────────────────────────────────────

  {
    id: "p01", category: "prohibition",
    img: "overtaking-prohibited.jpg",
    question: "What does this sign prohibit?",
    options: [
      "Parking on this road",
      "Overtaking another vehicle",
      "U-turns at this point",
      "Hooting in this area",
    ],
    answer: 1,
    explanation: "The no-overtaking sign means you must not pass the vehicle ahead while this prohibition is in force. It typically ends at a de-restriction sign.",
  },
  {
    id: "p02", category: "prohibition",
    img: "overtaking-by-goods-vehicle-prohibited.jpg",
    question: "This sign shows a truck with a red prohibition symbol. What does it mean?",
    options: [
      "No goods vehicles allowed on this road",
      "Goods vehicles may not overtake other vehicles",
      "Trucks must use the left lane only",
      "No stopping for goods vehicles",
    ],
    answer: 1,
    explanation: "This sign specifically prohibits goods vehicles (trucks) from overtaking. Private vehicles may still overtake where safe and legal.",
  },
  {
    id: "p03", category: "prohibition",
    img: "left-turn-prohibited.jpg",
    question: "What does this sign mean at an intersection?",
    options: [
      "Left turns are encouraged here",
      "Left turns are prohibited at this point",
      "Left lane closed ahead",
      "U-turn to the left is prohibited",
    ],
    answer: 1,
    explanation: "A left-turn prohibition sign means no vehicle may turn left here. You may proceed straight or turn right if other signs permit.",
  },
  {
    id: "p04", category: "prohibition",
    img: "right-turn-prohibited.jpg",
    question: "What does this sign mean?",
    options: [
      "You must turn right",
      "Right turns are prohibited here",
      "Right lane closed",
      "Right turn is recommended",
    ],
    answer: 1,
    explanation: "A right-turn prohibition sign means no vehicle may turn right at this point. Proceed straight or turn left if permitted.",
  },
  {
    id: "p05", category: "prohibition",
    img: "right-turn-ahead-prohibited.jpg",
    question: "This sign shows a right-turn arrow with a red prohibition symbol. What does it mean?",
    options: [
      "Right turn is compulsory ahead",
      "Right turn will be prohibited at the next junction",
      "Merge right ahead",
      "Right of way for vehicles turning right",
    ],
    answer: 1,
    explanation: "This sign warns that a right turn will be prohibited at the upcoming intersection. Plan your route before reaching it.",
  },
  {
    id: "p08", category: "prohibition",
    img: "stopping-prohibited.jpg",
    question: "What does this sign prohibit?",
    options: [
      "Parking during certain hours only",
      "Absolutely no stopping of any vehicle at any time",
      "No U-turns here",
      "No dropping off of passengers",
    ],
    answer: 1,
    explanation: "The no-stopping sign means no vehicle may stop here at any time for any reason, including to pick up or drop off passengers.",
  },
  {
    id: "p09", category: "prohibition",
    img: "height-restriction-sign.jpg",
    question: "What does this sign mean for a vehicle that exceeds the stated height?",
    options: [
      "The vehicle may proceed with caution",
      "The vehicle must not enter — it exceeds the height limit",
      "Proceed only at night",
      "Sound your horn before entering",
    ],
    answer: 1,
    explanation: "A height restriction sign means no vehicle taller than the stated measurement may enter. Check your vehicle height before approaching tunnels and bridges.",
  },
  {
    id: "p10", category: "prohibition",
    img: "width-restriction-sign.jpg",
    question: "What does this sign indicate?",
    options: [
      "Road widens ahead",
      "Vehicles wider than the stated measurement must not enter",
      "Two-lane road begins",
      "Wide load escort required",
    ],
    answer: 1,
    explanation: "A width restriction sign prohibits vehicles wider than the stated dimension from passing. Common at narrow bridges and underpasses.",
  },
  {
    id: "p11", category: "prohibition",
    img: "length-restriction-sign-15m.jpg",
    question: "What does this sign mean?",
    options: [
      "Vehicles must be at least 15 m long",
      "Vehicles longer than 15 m are not permitted on this road",
      "15 m clearance required",
      "Maximum speed 15 km/h",
    ],
    answer: 1,
    explanation: "A length restriction sign prohibits vehicles (including towing combinations) that exceed the stated length from using that road.",
  },
  {
    id: "p12", category: "prohibition",
    img: "motorcycles-prohibited.jpg",
    question: "A red circle with a motorcycle silhouette means?",
    options: [
      "Motorcycles only in this lane",
      "No motorcycles — motorcycles are prohibited on this road",
      "Motorcycles must use the left lane",
      "Motorcycle parking ahead",
    ],
    answer: 1,
    explanation: "The no-motorcycles sign prohibits motorcycles and motor-cycles with sidecars from using that road or lane.",
  },
  {
    id: "p13", category: "prohibition",
    img: "motorcars-only.jpg",
    question: "What does this sign indicate about road users?",
    options: [
      "No motorcars allowed",
      "This road or lane is reserved for motor cars only",
      "Motor cars must yield to other vehicles",
      "Speed limit for motor cars only",
    ],
    answer: 1,
    explanation: "A motor-cars-only sign restricts that road or lane to passenger vehicles (motor cars) — trucks, motorcycles, and other vehicle types are not permitted.",
  },
  {
    id: "p14", category: "prohibition",
    img: "pedestrians-prohibited.jpg",
    question: "A red circle with a walking person means?",
    options: [
      "Pedestrian crossing ahead",
      "Pedestrians are prohibited from using this road",
      "Slow down — pedestrians present",
      "Pedestrian priority zone",
    ],
    answer: 1,
    explanation: "The no-pedestrians sign means pedestrians may not walk on that road. They must use an alternative route such as an underpass or adjacent path.",
  },
  {
    id: "p15", category: "prohibition",
    img: "pedal-cycles-prohibited.jpg",
    question: "This sign prohibits which road users?",
    options: [
      "Motor vehicles",
      "Pedal cycles (bicycles)",
      "Motorcycles",
      "Taxis",
    ],
    answer: 1,
    explanation: "A no-bicycles sign prohibits pedal cyclists from using that road. Often seen on freeways and roads where cycling would be hazardous.",
  },
  {
    id: "p16", category: "prohibition",
    img: "animal-drawn-vehicles-prohibited.jpg",
    question: "What does this sign prohibit?",
    options: [
      "Animal transport trucks",
      "Animal-drawn vehicles such as carts and wagons",
      "Horses and riders",
      "Livestock crossing",
    ],
    answer: 1,
    explanation: "This sign prohibits animal-drawn vehicles (horse carts, ox-wagons, donkey carts) from using the road. They must use an alternative route.",
  },
  {
    id: "p17", category: "prohibition",
    img: "hawkers-prohibited.jpg",
    question: "What does this sign prohibit?",
    options: [
      "Pedestrians from crossing",
      "Street hawkers or vendors from operating here",
      "Loading and unloading",
      "Taxis from stopping",
    ],
    answer: 1,
    explanation: "The no-hawkers sign prohibits street vendors and hawkers from selling goods in that area. Often seen near busy intersections for safety reasons.",
  },
  {
    id: "p18", category: "prohibition",
    img: "towed-vehicles-prohibited.jpg",
    question: "What type of vehicle combination does this sign prohibit?",
    options: [
      "Buses and coaches",
      "Vehicles towing a trailer or caravan",
      "Articulated trucks",
      "Vehicles with a roof rack",
    ],
    answer: 1,
    explanation: "This sign prohibits vehicles with trailers, caravans, or other towed combinations from using that road — often seen on steep mountain passes.",
  },

  // ── WARNING ────────────────────────────────────────────────────────────────

  {
    id: "w01", category: "warning",
    img: "crossroad-ahead-sign.jpg",
    question: "A cross symbol inside a warning triangle means?",
    options: [
      "Railway crossing ahead",
      "A crossroad (four-way intersection) is ahead",
      "No entry from any direction",
      "Roadworks ahead",
    ],
    answer: 1,
    explanation: "This warning sign alerts you to a crossroad ahead. Reduce speed and be prepared to yield or stop depending on the intersection control.",
  },
  {
    id: "w03", category: "warning",
    img: "t-junction-ahead.jpg",
    question: "What does this warning sign indicate?",
    options: [
      "The road continues ahead with a branch to one side",
      "The road ahead ends at a T-junction — you must turn left or right",
      "A roundabout is ahead",
      "End of dual carriageway",
    ],
    answer: 1,
    explanation: "A T-junction warning sign means the road you are on ends ahead. You will have to turn left or right. Reduce speed accordingly.",
  },
  {
    id: "w04", category: "warning",
    img: "y-junction-ahead.jpg",
    question: "A Y-shaped symbol inside a warning triangle means?",
    options: [
      "Road merges ahead",
      "A Y-junction ahead where the road forks into two directions",
      "Right-of-way road ahead",
      "Dual carriageway begins",
    ],
    answer: 1,
    explanation: "A Y-junction warning sign means the road splits into two routes ahead. Slow down and choose your direction carefully.",
  },
  {
    id: "w05", category: "warning",
    img: "left-side-road-junction-ahead.jpg",
    question: "What does a T-junction symbol with the branch on the left indicate?",
    options: [
      "A side road joins from the left ahead",
      "Left turn mandatory ahead",
      "Left lane closes ahead",
      "Road bends left",
    ],
    answer: 0,
    explanation: "This sign warns of a side road entering from the left. Watch for vehicles joining or crossing from that direction.",
  },
  {
    id: "w06", category: "warning",
    img: "roundabout-sign.jpg",
    question: "What does this circular-arrow warning sign mean?",
    options: [
      "U-turn is permitted ahead",
      "A traffic circle or roundabout is ahead",
      "One-way system begins",
      "Mini-roundabout — no entry",
    ],
    answer: 1,
    explanation: "A roundabout warning sign means a traffic circle is ahead. Reduce speed, yield to traffic already in the circle, and enter when safe.",
  },
  {
    id: "w07", category: "warning",
    img: "traffic-lights-ahead-sign.jpg",
    question: "Traffic lights depicted in a warning triangle mean?",
    options: [
      "The traffic lights at the next intersection are out of order",
      "Traffic lights ahead — reduce speed and be prepared to stop",
      "No traffic lights on this road",
      "Emergency vehicle signal ahead",
    ],
    answer: 1,
    explanation: "This warning sign alerts you to traffic lights ahead, especially where they may not be immediately visible. Prepare to stop at a red light.",
  },
  {
    id: "w08", category: "warning",
    img: "two-way-traffic-sign.jpg",
    question: "Two arrows pointing in opposite directions inside a triangle warn of what?",
    options: [
      "Overtaking zone ahead",
      "Two-way traffic begins — oncoming vehicles share the same road",
      "Road merges from both sides",
      "One-way system ends",
    ],
    answer: 1,
    explanation: "A two-way traffic sign warns that the road changes to two-way traffic ahead. Keep left and watch for vehicles travelling in the opposite direction.",
  },
  {
    id: "w09", category: "warning",
    img: "beginning-of-dual-roadway.jpg",
    question: "What does this sign indicate about the road ahead?",
    options: [
      "Two-way traffic begins",
      "The road divides into a dual carriageway — keep left on your side",
      "A median strip ends",
      "Overtaking is now permitted",
    ],
    answer: 1,
    explanation: "This sign warns that a divided roadway (dual carriageway) begins ahead. The road splits into two separate one-way carriageways divided by a median.",
  },
  {
    id: "w10", category: "warning",
    img: "end-of-dual-roadway.jpg",
    question: "What does this sign indicate?",
    options: [
      "A divided road begins",
      "The dual carriageway ends — the road merges to a single two-way road",
      "Overtaking is now prohibited",
      "End of motorway",
    ],
    answer: 1,
    explanation: "This sign warns that the divided dual carriageway ends ahead and merges into a single two-way road. Move into the correct lane and watch for oncoming traffic.",
  },
  {
    id: "w11", category: "warning",
    img: "lane-reduction-ahead.jpg",
    question: "What does this sign warn drivers about?",
    options: [
      "A new lane is being added",
      "The number of lanes reduces ahead — merge in good time",
      "Lane line is painted ahead",
      "Bus lane begins",
    ],
    answer: 1,
    explanation: "A lane-reduction sign warns that one or more lanes end ahead and traffic must merge. Begin merging early to avoid last-minute lane changes.",
  },
  {
    id: "w12", category: "warning",
    img: "left-hand-lane-ends-ahead.jpg",
    question: "What does this sign mean?",
    options: [
      "New left lane is added ahead",
      "The left-hand lane ends ahead — merge to the right",
      "Left turn only ahead",
      "Left lane reserved for buses",
    ],
    answer: 1,
    explanation: "The left lane ends ahead and drivers in that lane must merge right. Move to the right lane early and yield to traffic already there.",
  },
  {
    id: "w13", category: "warning",
    img: "pedestrian-crossing-sign.jpg",
    question: "What does this warning sign mean?",
    options: [
      "School zone ahead",
      "A marked pedestrian crossing is ahead — watch for people crossing",
      "No pedestrians",
      "Cycle lane begins",
    ],
    answer: 1,
    explanation: "This warning sign alerts drivers to a pedestrian crossing ahead. Reduce speed and be prepared to yield to pedestrians already in or approaching the crossing.",
  },
  {
    id: "w14", category: "warning",
    img: "pedestrians-ahead-sign.jpg",
    question: "A walking person silhouette inside a triangle warns of?",
    options: [
      "A marked pedestrian crossing ahead",
      "Pedestrians may be walking alongside or crossing the road",
      "Pedestrians prohibited",
      "School crossing guard ahead",
    ],
    answer: 1,
    explanation: "Pedestrians-ahead warns that people on foot may be on or near the road — not necessarily at a marked crossing. Reduce speed and watch carefully.",
  },
  {
    id: "w15", category: "warning",
    img: "children-ahead-sign.jpg",
    question: "A triangle with two child figures is displayed near a school. What should you do?",
    options: [
      "Stop and wait for a crossing guard's signal",
      "Reduce speed — children may be crossing the road",
      "Sound your horn to warn children",
      "Proceed normally; children are supervised",
    ],
    answer: 1,
    explanation: "The children-ahead sign warns of a school or playground nearby. Reduce speed significantly and be ready to stop if children step onto the road.",
  },
  {
    id: "w16", category: "warning",
    img: "cyclists-ahead-sign.jpg",
    question: "A cyclist symbol inside a warning triangle means?",
    options: [
      "Bicycle lane begins",
      "Cyclists may be on or crossing the road ahead",
      "No bicycles permitted",
      "Bicycle race in progress",
    ],
    answer: 1,
    explanation: "The cyclists-ahead sign warns that cyclists are likely to be on or crossing the road. Give them space and be prepared to reduce speed.",
  },
  {
    id: "w17", category: "warning",
    img: "railway-crossing-sign.jpg",
    question: "An X symbol inside a triangle warns of what?",
    options: [
      "Dangerous road junction",
      "Level crossing — a railway line crosses the road ahead",
      "Road closed ahead",
      "No crossing allowed",
    ],
    answer: 1,
    explanation: "The X in a warning triangle indicates a level (rail) crossing. Reduce speed, look both ways, and never cross if a train is visible or the boom is down.",
  },
  {
    id: "w18", category: "warning",
    img: "railway-crossing-ahead.jpg",
    question: "What does this sign tell you about the road ahead?",
    options: [
      "A level railway crossing is ahead — prepare to stop",
      "Railway line runs parallel to the road",
      "Train station ahead",
      "Railway workers on the road",
    ],
    answer: 0,
    explanation: "This advance warning sign tells you a railway level crossing is coming up. Slow down, watch and listen for trains, and follow all signals at the crossing.",
  },
  {
    id: "w19", category: "warning",
    img: "slippery-road-sign.jpg",
    question: "A car with skid marks inside a triangle warns of?",
    options: [
      "Steep descent ahead",
      "Slippery road surface — reduce speed and avoid sudden braking",
      "Road ends ahead",
      "Gravel road begins",
    ],
    answer: 1,
    explanation: "The slippery road sign warns of a surface that may be wet, icy, or contaminated with gravel or mud. Reduce speed and avoid sudden steering or braking inputs.",
  },
  {
    id: "w20", category: "warning",
    img: "gravel-road-begins-sign.jpg",
    question: "What does this sign tell you about the road surface ahead?",
    options: [
      "Tarred road begins",
      "Gravel road begins — adjust speed and increase following distance",
      "Road under construction",
      "Pothole warning",
    ],
    answer: 1,
    explanation: "A gravel-road-begins sign means the tar surface ends. Reduce speed — gravel roads offer less grip, and loose stones can damage vehicles behind you.",
  },
  {
    id: "w21", category: "warning",
    img: "gravel-road-ends-sign.jpg",
    question: "What does this sign mean?",
    options: [
      "Gravel road continues",
      "The gravel road ends and a tarred road begins",
      "Loose stones — slow down",
      "Road resurfacing ahead",
    ],
    answer: 1,
    explanation: "This sign indicates you are leaving the gravel surface and entering a tarred road. You may gradually increase speed once safely on the tarred surface.",
  },
  {
    id: "w22", category: "warning",
    img: "speedbumps-sign.jpg",
    question: "A series of humps depicted in a warning triangle mean?",
    options: [
      "Bridge ahead",
      "Speed bumps or road humps are ahead — reduce speed",
      "Rough and uneven road",
      "Dip in the road",
    ],
    answer: 1,
    explanation: "Speed-bump signs warn of artificial humps placed to slow traffic. Reduce speed before reaching them — crossing them at speed can damage your vehicle.",
  },
  {
    id: "w23", category: "warning",
    img: "uneven-roadway-sign.jpg",
    question: "What does this warning sign tell you about the road surface?",
    options: [
      "Speed humps ahead",
      "The road surface is uneven or rough — reduce speed",
      "Potholes have been repaired",
      "Tarred road begins",
    ],
    answer: 1,
    explanation: "An uneven roadway sign warns of an irregular road surface. Reduce speed to maintain vehicle control and avoid wheel damage.",
  },
  {
    id: "w24", category: "warning",
    img: "loose-stones.jpg",
    question: "This sign warns of what road hazard?",
    options: [
      "Gravel road begins",
      "Loose stones on the road surface — risk of stone damage to vehicles",
      "Rocky cliff face ahead",
      "Falling rocks possible",
    ],
    answer: 1,
    explanation: "A loose-stones sign warns that the road surface has loose chippings or gravel. Reduce speed and maintain distance from other vehicles to avoid windscreen and panel damage.",
  },
  {
    id: "w25", category: "warning",
    img: "general-warning-sign.jpg",
    question: "An exclamation mark inside a warning triangle means?",
    options: [
      "Emergency services nearby",
      "General hazard ahead that does not have its own specific sign",
      "Road ends ahead",
      "High-voltage cables overhead",
    ],
    answer: 1,
    explanation: "The general warning sign (exclamation mark) indicates a hazard without a specific dedicated sign. Slow down and watch for unusual conditions on the road ahead.",
  },
  {
    id: "w26", category: "warning",
    img: "falling-rocks-sign.jpg",
    question: "Rocks falling from a cliff symbol inside a triangle warns of?",
    options: [
      "Steep climb ahead",
      "Falling rocks or rockslides are possible in this area",
      "Gravel road surface",
      "Mining blasting zone",
    ],
    answer: 1,
    explanation: "This sign warns that rocks may fall from a hillside onto the road. Drive carefully and do not stop in the rock-fall zone unless an emergency forces you to.",
  },
  {
    id: "w27", category: "warning",
    img: "steep-descent-sign.jpg",
    question: "A downward slope line with a percentage figure in a warning triangle means?",
    options: [
      "Road bends downhill",
      "Steep descent — engage a lower gear before descending",
      "Road ahead climbs steeply",
      "Speed limit reduced ahead",
    ],
    answer: 1,
    explanation: "A steep-descent sign warns of a significant downhill gradient. Engage a lower gear before descending so engine braking assists the foot brake. This is critical for heavy vehicles.",
  },
  {
    id: "w28", category: "warning",
    img: "steep-ascent-sign.jpg",
    question: "An upward slope line in a warning triangle means?",
    options: [
      "Steep descent ahead",
      "Steep climb ahead — heavy vehicles may lose speed",
      "Road levels out ahead",
      "Overtaking permitted on the incline",
    ],
    answer: 1,
    explanation: "A steep-ascent sign warns of a significant uphill gradient. Heavy vehicles will slow down, so be prepared and do not follow too closely behind them.",
  },
  {
    id: "w29", category: "warning",
    img: "engage-lower-gear.jpg",
    question: "What does this sign instruct the driver to do?",
    options: [
      "Accelerate before the climb",
      "Engage a lower gear now — a steep descent is ahead",
      "Switch off engine braking",
      "Stop and check your brakes",
    ],
    answer: 1,
    explanation: "This sign means you must select a lower gear before the descent begins. Using a lower gear on steep descents prevents brake fade and keeps the vehicle under control.",
  },
  {
    id: "w30", category: "warning",
    img: "escape-road-ahead.jpg",
    question: "What is an escape road or arrestor bed?",
    options: [
      "A road for emergency vehicles only",
      "An emergency runaway lane filled with deep gravel to stop vehicles with brake failure",
      "A toll-free bypass route",
      "A sharp corner ahead",
    ],
    answer: 1,
    explanation: "Escape roads (arrestor beds) are provided on steep descents for vehicles that have lost braking ability. The deep gravel rapidly slows and stops a runaway vehicle safely.",
  },
  {
    id: "w31", category: "warning",
    img: "road-narrows-from-right-side-sign.jpg",
    question: "What does this sign warn you about?",
    options: [
      "The road becomes one-way ahead",
      "The road becomes narrower ahead — be prepared to give way",
      "A median strip begins",
      "Left lane added ahead",
    ],
    answer: 1,
    explanation: "A road-narrows sign means the road width reduces ahead. Reduce speed and be prepared to give way to oncoming vehicles at the narrow section.",
  },
  {
    id: "w32", category: "warning",
    img: "winding-road-ahead-starting-to-the-left.jpg",
    question: "A series of bends depicted in a warning triangle means?",
    options: [
      "Single sharp bend ahead",
      "A winding road with multiple bends ahead — reduce speed",
      "U-turn permitted ahead",
      "Zigzag road markings ahead",
    ],
    answer: 1,
    explanation: "A winding-road sign warns of a series of bends ahead. Reduce speed, do not overtake, and keep your vehicle under full control through the bends.",
  },
  {
    id: "w33", category: "warning",
    img: "sharp-bend-left.jpg",
    question: "A single sharp curved arrow to the left in a warning triangle means?",
    options: [
      "Road turns gently left",
      "A sharp left bend ahead — reduce speed significantly before the bend",
      "Left turn permitted ahead",
      "One-way road to the left",
    ],
    answer: 1,
    explanation: "A sharp-bend sign warns of a tight corner ahead. You must slow down before entering the bend — braking while turning can cause skidding.",
  },
  {
    id: "w34", category: "warning",
    img: "wild-animal-ahead-sign.jpg",
    question: "An animal silhouette inside a warning triangle means?",
    options: [
      "Wildlife reserve — no hooting",
      "Wild or domestic animals may cross the road ahead",
      "Farm vehicles using the road",
      "No livestock transport",
    ],
    answer: 1,
    explanation: "Animal-crossing signs warn that animals — wild or domestic — may be on or crossing the road. Reduce speed, especially at dawn, dusk, and night.",
  },
  {
    id: "w35", category: "warning",
    img: "elephant-ahead-sign.jpg",
    question: "An elephant silhouette inside a warning triangle means?",
    options: [
      "Zoo or safari park entrance",
      "Elephants may be crossing the road — slow down",
      "Heavy vehicle lane ahead",
      "Rough terrain ahead",
    ],
    answer: 1,
    explanation: "An elephant-crossing sign is found in game reserves and rural areas. An elephant on the road is extremely dangerous — slow down and wait at a safe distance.",
  },
  {
    id: "w36", category: "warning",
    img: "low-flying-aircraft-sign.jpg",
    question: "What does this warning sign indicate?",
    options: [
      "Airport is nearby — no radio transmission",
      "Low-flying aircraft operate in this area — do not be startled",
      "Road enters a military zone",
      "No drones permitted",
    ],
    answer: 1,
    explanation: "A low-flying aircraft sign warns that aircraft fly at low altitude in this area — often near airports, crop-dusting areas, or military zones. Sudden noise and movement may occur.",
  },
  {
    id: "w37", category: "warning",
    img: "drift-sign.jpg",
    question: "What does this warning sign mean?",
    options: [
      "The road drifts to the left",
      "A drift (low water crossing or sandy area) is ahead — drive with caution",
      "Sand dunes visible from the road",
      "Road is under repair",
    ],
    answer: 1,
    explanation: "A drift sign warns of a low-water crossing or an area where sand or soil drifts across the road. Reduce speed and check conditions before crossing.",
  },
  {
    id: "w38", category: "warning",
    img: "accident-ahead-sign.jpg",
    question: "What does this warning sign indicate?",
    options: [
      "First aid post is nearby",
      "An accident has occurred ahead — reduce speed and proceed with caution",
      "Emergency services depot ahead",
      "Road closed for construction",
    ],
    answer: 1,
    explanation: "An accident-ahead sign warns of a crash scene on the road. Slow down significantly, be ready to stop, and follow directions from traffic officers or emergency personnel.",
  },
  {
    id: "w39", category: "warning",
    img: "reduced-visibility-sign.jpg",
    question: "A sun or mist symbol inside a warning triangle means?",
    options: [
      "Scenic lookout point ahead",
      "Reduced visibility ahead — switch on headlights and reduce speed",
      "Bright sunshine — use sunscreen",
      "High beam prohibited",
    ],
    answer: 1,
    explanation: "A reduced-visibility sign warns of conditions such as mist, smoke, dust, or sun glare that may greatly reduce your ability to see the road. Switch on headlights and reduce speed.",
  },
  {
    id: "w40", category: "warning",
    img: "tunnel-ahead-sign.jpg",
    question: "What does this sign prepare you for?",
    options: [
      "A bridge over a river",
      "A tunnel ahead — switch on headlights and reduce speed if necessary",
      "Road goes underground permanently",
      "Underpass for pedestrians",
    ],
    answer: 1,
    explanation: "A tunnel-ahead sign warns that you will be entering a tunnel. Switch on your headlights, reduce speed if needed, and obey any tunnel-specific speed limits.",
  },
  {
    id: "w41", category: "warning",
    img: "concealed-driveway-ahead-from-the-left-sign.jpg",
    question: "What hazard does this sign warn about?",
    options: [
      "A T-junction ahead",
      "A hidden driveway on the left side — vehicles may unexpectedly enter the road",
      "Left side road closed",
      "Concealed pedestrian crossing",
    ],
    answer: 1,
    explanation: "A concealed-driveway sign warns that a driveway or side road is hidden by vegetation or other obstructions. A vehicle may pull out unexpectedly — reduce speed.",
  },
  {
    id: "w42", category: "warning",
    img: "congestion-sign.jpg",
    question: "What does this warning sign indicate about traffic conditions ahead?",
    options: [
      "A toll plaza is ahead",
      "Traffic congestion ahead — expect delays and slow-moving traffic",
      "Construction zone begins",
      "Road narrows to one lane",
    ],
    answer: 1,
    explanation: "A congestion sign warns that traffic is backed up or slow-moving ahead. Reduce speed and maintain a safe following distance.",
  },
  {
    id: "w43", category: "warning",
    img: "slow-moving-heavy-vehicle-sign.jpg",
    question: "What does this warning sign tell you about vehicles ahead?",
    options: [
      "Fast-moving vehicles in this lane",
      "Slow-moving heavy vehicles may be on the road — overtake with care",
      "Road closed to heavy vehicles",
      "Trucks must use the left lane",
    ],
    answer: 1,
    explanation: "This sign warns that slow-moving heavy vehicles such as trucks, buses, or construction equipment are likely on the road ahead. Allow extra following distance.",
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// UTILITY
// ══════════════════════════════════════════════════════════════════════════════

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ══════════════════════════════════════════════════════════════════════════════
// QUIZ ENGINE
// ══════════════════════════════════════════════════════════════════════════════

function QuizEngine({ questions, onFinish, timed }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timed ? 30 : null);

  const q = questions[idx];

  const handleAnswer = useCallback((optIdx) => {
    if (revealed) return;
    setSelected(optIdx);
    setRevealed(true);
    if (optIdx === q.answer) setScore(s => s + 1);
  }, [revealed, q]);

  useEffect(() => {
    if (!timed || revealed) return;
    if (timeLeft <= 0) { handleAnswer(-1); return; }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timed, timeLeft, revealed, handleAnswer]);

  useEffect(() => {
    setTimeLeft(timed ? 30 : null);
    setSelected(null);
    setRevealed(false);
  }, [idx, timed]);

  function next() {
    if (idx + 1 >= questions.length) {
      onFinish(score + (selected === q.answer ? 1 : 0));
    } else {
      setIdx(i => i + 1);
    }
  }

  const cat = CATEGORIES.find(c => c.id === q.category);
  const accentColor = cat?.color ?? T.gold;

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", padding: "0 16px 40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ color: T.dim, fontSize: 13, fontFamily: T.mono }}>
          Q {idx + 1} / {questions.length}
        </div>
        {timed && !revealed && (
          <div style={{ color: timeLeft <= 10 ? T.red : T.gold, fontSize: 20, fontFamily: T.mono, fontWeight: 700 }}>
            {timeLeft}s
          </div>
        )}
        <div style={{ color: T.dim, fontSize: 13, fontFamily: T.mono }}>Score: {score}</div>
      </div>

      <div style={{ background: T.border, height: 4, borderRadius: 2, marginBottom: 24 }}>
        <div style={{
          width: `${((idx + 1) / questions.length) * 100}%`,
          height: "100%", borderRadius: 2, background: accentColor, transition: "width 0.3s",
        }} />
      </div>

      <div style={{
        background: T.surface, border: `2px solid ${T.border}`, borderRadius: 8,
        padding: "28px 20px", marginBottom: 20, display: "flex",
        flexDirection: "column", alignItems: "center", gap: 16,
      }}>
        <div style={{ color: accentColor, fontSize: 11, letterSpacing: 3, fontFamily: T.mono, textTransform: "uppercase" }}>
          {cat?.label}
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <SignImg src={q.img} alt={q.question} size={140} />
        </div>
        <div style={{ color: T.text, fontSize: 17, fontWeight: 600, textAlign: "center", lineHeight: 1.5, fontFamily: T.font }}>
          {q.question}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {q.options.map((opt, i) => {
          let bg = T.surface, border = T.border, color = T.text;
          if (revealed) {
            if (i === q.answer) { bg = "#0A2E0F"; border = T.green; color = T.green; }
            else if (i === selected) { bg = "#2E0A0A"; border = T.red; color = T.red; }
            else { color = T.dim; }
          }
          return (
            <button key={i} onClick={() => handleAnswer(i)} disabled={revealed} style={{
              background: bg, border: `2px solid ${border}`, borderRadius: 6,
              padding: "13px 16px", textAlign: "left", cursor: revealed ? "default" : "pointer",
              color, fontSize: 15, fontFamily: T.font, lineHeight: 1.4,
              transition: "border-color 0.15s, background 0.15s",
            }}>
              <span style={{ color: T.dim, fontFamily: T.mono, marginRight: 10 }}>{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          );
        })}
      </div>

      {revealed && (
        <div>
          <div style={{
            background: T.surface, border: `1px solid ${T.border}`,
            borderLeft: `4px solid ${selected === q.answer ? T.green : T.red}`,
            borderRadius: 4, padding: "14px 16px", marginBottom: 16,
          }}>
            <div style={{ color: selected === q.answer ? T.green : T.red, fontSize: 12, letterSpacing: 1, fontFamily: T.mono, marginBottom: 6 }}>
              {selected === q.answer ? "CORRECT" : selected === -1 ? "TIME'S UP" : "INCORRECT"}
            </div>
            <div style={{ color: T.dim, fontSize: 14, lineHeight: 1.7, fontFamily: T.font }}>{q.explanation}</div>
          </div>
          <button onClick={next} style={{
            width: "100%", padding: "14px 0", background: accentColor, border: "none",
            borderRadius: 6, cursor: "pointer", color: "#000", fontSize: 15, fontWeight: 700, fontFamily: T.font,
          }}>
            {idx + 1 >= questions.length ? "See Results" : "Next Question →"}
          </button>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// RESULT SCREEN
// ══════════════════════════════════════════════════════════════════════════════

function ResultScreen({ score, total, onRetry, onHome }) {
  const pct = Math.round((score / total) * 100);
  const passed = pct >= 70;
  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: "40px 16px", textAlign: "center" }}>
      <div style={{ fontSize: 64, fontWeight: 700, color: passed ? T.green : T.red, fontFamily: T.mono, marginBottom: 8 }}>
        {pct}%
      </div>
      <div style={{ color: T.text, fontSize: 22, fontWeight: 700, marginBottom: 8, fontFamily: T.font }}>
        {score} / {total} correct
      </div>
      <div style={{ color: passed ? T.green : T.red, fontSize: 16, marginBottom: 32, fontFamily: T.font }}>
        {passed ? "Well done — you passed!" : "Keep practising — aim for 70%+"}
      </div>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <button onClick={onRetry} style={{
          padding: "12px 28px", background: T.gold, border: "none",
          borderRadius: 6, cursor: "pointer", color: "#000", fontSize: 15, fontWeight: 700, fontFamily: T.font,
        }}>Try Again</button>
        <button onClick={onHome} style={{
          padding: "12px 28px", background: T.surface, border: `2px solid ${T.border}`,
          borderRadius: 6, cursor: "pointer", color: T.text, fontSize: 15, fontFamily: T.font,
        }}>← Home</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STUDY MODE
// ══════════════════════════════════════════════════════════════════════════════

function StudyMode({ catId, onBack }) {
  const questions = catId === "all" ? QUESTIONS : QUESTIONS.filter(q => q.category === catId);
  const [idx, setIdx] = useState(0);
  const q = questions[idx];
  const cat = CATEGORIES.find(c => c.id === q.category);

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", padding: "0 16px 40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <button onClick={onBack} style={{
          background: "none", border: `1px solid ${T.border}`, color: T.dim,
          padding: "6px 14px", borderRadius: 4, cursor: "pointer", fontSize: 13, fontFamily: T.font,
        }}>← Back</button>
        <div style={{ color: T.dim, fontSize: 13, fontFamily: T.mono }}>{idx + 1} / {questions.length}</div>
      </div>

      <div style={{
        background: T.surface, border: `2px solid ${cat?.color ?? T.gold}`,
        borderRadius: 8, padding: "28px 20px", textAlign: "center", marginBottom: 16,
      }}>
        <div style={{ color: cat?.color ?? T.gold, fontSize: 11, letterSpacing: 3, fontFamily: T.mono, textTransform: "uppercase", marginBottom: 16 }}>
          {cat?.label}
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <SignImg src={q.img} alt={q.question} size={150} />
        </div>
        <div style={{ color: T.text, fontSize: 17, fontWeight: 600, fontFamily: T.font, marginBottom: 12 }}>
          {q.question}
        </div>
        <div style={{ background: "#0A1A0F", borderRadius: 6, padding: "12px 16px", color: T.gold, fontSize: 15, fontFamily: T.font, fontWeight: 700, marginBottom: 12 }}>
          {q.options[q.answer]}
        </div>
        <div style={{ color: T.dim, fontSize: 14, lineHeight: 1.7, fontFamily: T.font }}>
          {q.explanation}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0} style={{
          flex: 1, padding: "12px 0", background: T.surface, border: `2px solid ${T.border}`,
          borderRadius: 6, cursor: idx === 0 ? "default" : "pointer",
          color: idx === 0 ? T.border : T.text, fontSize: 15, fontFamily: T.font,
        }}>← Previous</button>
        <button onClick={() => setIdx(i => Math.min(questions.length - 1, i + 1))} disabled={idx === questions.length - 1} style={{
          flex: 1, padding: "12px 0", background: cat?.color ?? T.gold, border: "none",
          borderRadius: 6, cursor: idx === questions.length - 1 ? "default" : "pointer",
          color: "#000", fontSize: 15, fontWeight: 700, fontFamily: T.font,
          opacity: idx === questions.length - 1 ? 0.4 : 1,
        }}>Next →</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// HOME SCREEN
// ══════════════════════════════════════════════════════════════════════════════

function HomeScreen({ onStart }) {
  const counts = {};
  QUESTIONS.forEach(q => { counts[q.category] = (counts[q.category] ?? 0) + 1; });

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 20px 40px" }}>
      <div style={{ color: T.dim, fontSize: 11, letterSpacing: 3, marginBottom: 20, fontFamily: T.mono, textTransform: "uppercase" }}>
        Choose a mode
      </div>

      <div style={{ background: T.surface, border: `2px solid ${T.gold}`, borderRadius: 8, padding: "22px 20px", marginBottom: 14 }}>
        <div style={{ color: T.gold, fontSize: 11, letterSpacing: 3, fontFamily: T.mono, textTransform: "uppercase", marginBottom: 8 }}>
          EXAM MODE
        </div>
        <div style={{ color: T.text, fontSize: 18, fontWeight: 700, marginBottom: 6, fontFamily: T.font }}>
          All Signs — Mixed Quiz
        </div>
        <div style={{ color: T.dim, fontSize: 14, lineHeight: 1.6, marginBottom: 16, fontFamily: T.font }}>
          {QUESTIONS.length} questions covering all sign categories, shuffled at random. Pass mark: 70%.
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => onStart("exam", null, false)} style={{
            padding: "10px 22px", background: T.gold, border: "none",
            borderRadius: 5, cursor: "pointer", color: "#000", fontSize: 14, fontWeight: 700, fontFamily: T.font,
          }}>Start Quiz</button>
          <button onClick={() => onStart("exam", null, true)} style={{
            padding: "10px 22px", background: T.surface, border: `2px solid ${T.gold}`,
            borderRadius: 5, cursor: "pointer", color: T.gold, fontSize: 14, fontFamily: T.font,
          }}>⏱ Timed (30s)</button>
        </div>
      </div>

      <div style={{ color: T.dim, fontSize: 11, letterSpacing: 3, margin: "24px 0 14px", fontFamily: T.mono, textTransform: "uppercase" }}>
        Drill by category
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {CATEGORIES.map(cat => (
          <div key={cat.id} style={{
            background: T.surface, border: `1px solid ${T.border}`,
            borderLeft: `4px solid ${cat.color}`, borderRadius: 6, padding: "16px 18px",
          }}>
            <div style={{ marginBottom: 6 }}>
              <div style={{ color: cat.color, fontSize: 11, letterSpacing: 2, fontFamily: T.mono, marginBottom: 4 }}>
                {counts[cat.id] ?? 0} questions
              </div>
              <div style={{ color: T.text, fontSize: 17, fontWeight: 700, fontFamily: T.font }}>{cat.label}</div>
              <div style={{ color: T.dim, fontSize: 13, lineHeight: 1.5, marginTop: 4, fontFamily: T.font }}>{cat.desc}</div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <button onClick={() => onStart("category", cat.id, false)} style={{
                padding: "8px 18px", background: cat.color, border: "none",
                borderRadius: 4, cursor: "pointer", color: "#000", fontSize: 13, fontWeight: 700, fontFamily: T.font,
              }}>Quiz</button>
              <button onClick={() => onStart("category", cat.id, true)} style={{
                padding: "8px 18px", background: T.surface, border: `1px solid ${cat.color}`,
                borderRadius: 4, cursor: "pointer", color: cat.color, fontSize: 13, fontFamily: T.font,
              }}>⏱ Timed</button>
              <button onClick={() => onStart("study", cat.id, false)} style={{
                padding: "8px 18px", background: "transparent", border: `1px solid ${T.border}`,
                borderRadius: 4, cursor: "pointer", color: T.dim, fontSize: 13, fontFamily: T.font,
              }}>Study mode</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export default function RoadSignsQuiz({ onBack, onPass }) {
  const [screen, setScreen] = useState("home");
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [finalScore, setFinalScore] = useState(null);
  const [timed, setTimed] = useState(false);

  function handleStart(mode, catId, timedMode) {
    setTimed(timedMode);
    const pool = catId ? QUESTIONS.filter(q => q.category === catId) : QUESTIONS;
    if (mode === "study") {
      setActiveQuestions(pool);
      setScreen("study_" + (catId ?? "all"));
    } else {
      setActiveQuestions(shuffle(pool));
      setScreen("quiz");
    }
  }

  function handleFinish(score) {
    setFinalScore(score);
    const pct = Math.round((score / activeQuestions.length) * 100);
    if (pct >= 70 && onPass) onPass();
    setScreen("result");
  }

  const studyCatId = screen.startsWith("study_") ? screen.replace("study_", "") : null;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text }}>
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "0 16px" }}>
        <div style={{ display: "flex", height: 6 }}>
          {["#000000","#FFB612","#007A4D","#F5F5F0","#DE3831","#4472CA"].map((c, i) => (
            <div key={i} style={{ flex: 1, background: c }} />
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0" }}>
          <button onClick={screen === "home" ? onBack : () => setScreen("home")} style={{
            background: "none", border: "none", color: T.dim, cursor: "pointer", fontSize: 20, padding: "4px 8px",
          }}>←</button>
          <div style={{ color: T.gold, fontSize: 16, fontWeight: 700, fontFamily: T.font }}>Road Signs Quiz</div>
          <div style={{ width: 36 }} />
        </div>
      </div>

      <div style={{ paddingTop: 24 }}>
        {screen === "home" && <HomeScreen onStart={handleStart} />}
        {screen === "quiz" && <QuizEngine questions={activeQuestions} onFinish={handleFinish} timed={timed} />}
        {screen === "result" && (
          <ResultScreen
            score={finalScore}
            total={activeQuestions.length}
            onRetry={() => { setActiveQuestions(q => shuffle([...q])); setScreen("quiz"); }}
            onHome={() => setScreen("home")}
          />
        )}
        {studyCatId && <StudyMode catId={studyCatId} onBack={() => setScreen("home")} />}
      </div>
    </div>
  );
}
