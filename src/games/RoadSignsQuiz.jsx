import { useState, useEffect, useCallback } from "react";
import { T } from "../theme.js";
import { prepareAll, stableId } from '../utils/quizHelpers.js';
import { recordResult } from '../utils/progressHistory.js';
import { recordAnswer } from '../utils/spacedRepetition.js';

function SignImg({ src, alt, size = 130 }) {
  return (
    <img
      src={`./signs/${src}`}
      alt={alt || "road sign"}
      style={{ width: size, height: size, objectFit: "contain", imageRendering: "crisp-edges", filter: "brightness(1.1) contrast(1.05)" }}
    />
  );
}

const CATEGORIES = [
  { id: "control",     label: "Regulatory — Control",     color: T.red,     desc: "Signs you must obey — they control how and where you drive." },
  { id: "prohibition", label: "Regulatory — Prohibition", color: "#9B59B6", desc: "Red-circle signs that prohibit specific vehicles or manoeuvres." },
  { id: "warning",     label: "Warning Signs",            color: T.gold,    desc: "Triangular signs warning of hazards and changing conditions ahead." },
  { id: "guidance",    label: "Guidance & Direction",     color: T.blue,    desc: "Signs providing directions, destinations and service information." },
  { id: "markings",    label: "Road Markings",            color: T.green,   desc: "Lines and symbols painted on the road surface." },
  { id: "temporary",   label: "Temporary Signs",          color: "#E67E22", desc: "Yellow-background signs used during roadworks — take precedence over permanent signs." },
];

const QUESTIONS = [

  // ── REGULATORY — CONTROL ──────────────────────────────────────────────────

  { id:"c01", category:"control", img:"stop-sign.jpg",
    question:"What does this sign require you to do?",
    options:["Come to a complete stop and proceed only when safe","Slow down and yield to traffic","Stop only if another vehicle is approaching","Reduce speed to 10 km/h"],
    answer:0, explanation:"A STOP sign requires a complete stop at the stop line regardless of whether traffic is present. Proceed only when it is safe." },

  { id:"c02", category:"control", img:"yield-to-oncoming-traffic.jpg",
    question:"What does this sign require?",
    options:["Stop completely before entering","Give way to oncoming and intersecting traffic","Sound your horn before proceeding","Flash your headlights"],
    answer:1, explanation:"A YIELD sign means give way to traffic on the major road. You may stop if needed, but a full stop is only compulsory if traffic is present." },

  { id:"c03", category:"control", img:"mandatory-direction-arrow-ahead.jpg",
    question:"What does this sign mean?",
    options:["Recommended direction","You must travel in the direction shown — no other direction permitted","Lane for heavy vehicles","One-way road begins"],
    answer:1, explanation:"A mandatory direction sign legally requires you to travel in the direction indicated. Deviating from the arrow is prohibited." },

  { id:"c04", category:"control", img:"mandatory-direction-arrows-ahead.jpg",
    question:"This sign shows multiple arrows. What must you do?",
    options:["Choose any direction you wish","Proceed straight only","You must travel in one of the indicated directions — no other is allowed","Slow down ahead of junction"],
    answer:2, explanation:"Multiple mandatory arrows mean you must choose one of the shown directions. Any other direction at that point is prohibited." },

  { id:"c05", category:"control", img:"mini-circle.jpg",
    question:"What does this blue circular sign with a circular arrow mean?",
    options:["U-turns permitted here","Mini-roundabout ahead — give way to traffic in the circle","Traffic circle, no entry","Drive around the block"],
    answer:1, explanation:"The mini-circle sign indicates a mini-roundabout. Traffic already circling has priority — give way before entering." },

  { id:"c06", category:"control", img:"right-of-way-sign.jpg",
    question:"What does a yellow diamond-shaped sign mean?",
    options:["You must give way to all traffic","You have right of way on this road","Caution — hazardous road","Priority road ends"],
    answer:1, explanation:"The yellow diamond right-of-way sign means you are on a priority road. Traffic joining from side roads must yield to you." },

  { id:"c07", category:"control", img:"priority-crossroad-sign.jpg",
    question:"This sign shows a thick road with thin crossing roads. What does it mean?",
    options:["Give way at the crossroad ahead","You are on the priority road — you have right of way at the crossroad ahead","All four directions have equal priority","Traffic lights are ahead"],
    answer:1, explanation:"The priority crossroad sign shows which road has right of way (the thicker line). You are on the major road and have priority over crossing traffic." },

  { id:"c08", category:"control", img:"de-striction.jpg",
    question:"What does a white circle with diagonal grey lines mean?",
    options:["Start of speed restriction","No passing zone begins","End of a restriction — speed limit or no-overtaking no longer applies","Road ends ahead"],
    answer:2, explanation:"The de-restriction sign cancels the previous restriction. After a 60 km/h zone, national speed limits resume." },

  { id:"c09", category:"control", img:"camera-speed-limit.jpg",
    question:"What does a speed limit sign with a camera symbol indicate?",
    options:["Photography prohibited on this road","This speed limit is enforced by a speed camera","CCTV surveillance area","Road crew filming ahead"],
    answer:1, explanation:"A camera speed limit sign means the stated limit is actively monitored by a speed camera. Exceeding it will result in a fine." },

  { id:"c10", category:"control", img:"traffic-control-stop-ahead-sign.jpg",
    question:"A sign showing STOP inside a warning shape means?",
    options:["Stop immediately","A STOP-controlled intersection is ahead — prepare to stop","Road closed","Emergency stopping zone"],
    answer:1, explanation:"This advance warning sign alerts you to a STOP sign ahead. Reduce speed and prepare to stop completely at the upcoming intersection." },

  { id:"c11", category:"control", img:"traffic-control-yield-ahead-sign.jpg",
    question:"What does this sign warn you about?",
    options:["A YIELD-controlled intersection is ahead — be prepared to give way","Stop immediately","Traffic merging from the left","Yield to pedestrians only"],
    answer:0, explanation:"This advance warning sign tells you a YIELD sign is ahead. Reduce speed and be ready to give way to traffic on the major road." },

  { id:"c12", category:"control", img:"minimum-speed.jpg",
    question:"What does a blue circle with a speed number inside it mean?",
    options:["Maximum speed on this road","Recommended speed","Minimum speed — you must not travel slower","Advisory speed for curves"],
    answer:2, explanation:"A blue circle speed sign is a minimum speed. You must not drive slower than stated. Common on freeways to maintain safe traffic flow." },

  { id:"c13", category:"control", img:"minimum-speed-limit.jpg",
    question:"This blue sign with a speed number and the word MINIMUM means?",
    options:["Maximum speed","Advisory speed for this section","The slowest you are permitted to travel on this road","Speed limit for motorcycles only"],
    answer:2, explanation:"A minimum speed limit sign means you must travel at least that fast on that section of road, for safety reasons." },

  { id:"c14", category:"control", img:"motorcycles-only.jpg",
    question:"What does this sign indicate about the road or lane?",
    options:["No motorcycles allowed","This road or lane is for motorcycles only","Motorcycles must yield","Motorcycle speed limit"],
    answer:1, explanation:"A motorcycles-only sign means only motorcycles may use that road or lane. All other vehicles are excluded." },

  { id:"c15", category:"control", img:"motorcars-only.jpg",
    question:"What does this sign mean?",
    options:["No motor cars allowed","This road or lane is reserved for motor cars only","Motor cars must yield to buses","Speed limit for motor cars"],
    answer:1, explanation:"A motor-cars-only sign restricts that road or lane to passenger cars. Trucks, motorcycles and other vehicles are not permitted." },

  { id:"c16", category:"control", img:"pedal-cycles-and-pedestrians-only.jpg",
    question:"A sign showing a bicycle and a pedestrian figure means?",
    options:["Cyclists and pedestrians are prohibited","This path is for pedal cycles and pedestrians only — no motor vehicles","Motor vehicles must slow down for cyclists","Shared lane warning"],
    answer:1, explanation:"This sign designates a shared path for cyclists and pedestrians only. Motor vehicles are not permitted to use it." },

  { id:"c17", category:"control", img:"vehicles-conveying-dangerous-goods-only.jpg",
    question:"What does this sign tell drivers of ordinary vehicles?",
    options:["All vehicles may use this road","Only vehicles carrying dangerous goods may use this road","Dangerous goods vehicles are prohibited","Speed limit for dangerous goods vehicles"],
    answer:1, explanation:"This reservation sign means only vehicles transporting dangerous goods (hazardous materials) are permitted to use that road or lane." },

  { id:"c18", category:"control", img:"vehicle-exceeding-mass-only.jpg",
    question:"What does this sign indicate about which vehicles may use this road?",
    options:["Only light vehicles","Only vehicles whose gross mass exceeds the stated limit","No heavy vehicles","Vehicles must not exceed stated mass"],
    answer:1, explanation:"This sign reserves the road for vehicles that exceed the stated gross mass — typically used to direct heavy vehicles to routes designed for their weight." },

  { id:"c19", category:"control", img:"switch-headlights-on.jpg",
    question:"What does this sign instruct you to do?",
    options:["Switch off headlights","Switch your headlights ON — dim or full beam as appropriate","Use hazard lights","Flash headlights at oncoming traffic"],
    answer:1, explanation:"A switch-headlights-on sign means you must activate your headlights. Common at the entrance to tunnels and in areas of reduced visibility." },

  { id:"c20", category:"control", img:"stopry-go-sign.jpg",
    question:"A person holding a STOP/GO sign at a construction site means?",
    options:["Slow down but do not stop","You must obey the sign shown — stop when STOP faces you, proceed when GO faces you","Ignore and proceed with caution","Construction vehicles have priority"],
    answer:1, explanation:"A STOP/GO sign held by a traffic controller has the same authority as a STOP or YIELD sign. When STOP faces you, you must stop completely until GO is shown." },

  { id:"c21", category:"control", img:"motorgate-sign.jpg",
    question:"What is a motorgate?",
    options:["A road reserved for motorcycles","A controlled-access point on a toll road where you stop and pay","An emergency gate for vehicles","A highway on-ramp"],
    answer:1, explanation:"A motorgate is a gated toll entry point. You must stop, pay the toll, and wait for the boom to lift before proceeding." },

  { id:"c22", category:"control", img:"maximum-stay-during-time-limits.jpg",
    question:"What does this supplementary plate (time limit) below a parking sign mean?",
    options:["You may park here at any time","You may only park for the duration stated during the hours shown","No parking at any time","Parking for permit holders only"],
    answer:1, explanation:"A maximum-stay time plate restricts how long you may park. Overstaying the limit is a parking contravention." },

  { id:"c23", category:"control", img:"speed-limit-time-period.jpg",
    question:"A speed limit sign with a time period plate below it means?",
    options:["The speed limit applies at all times","The speed limit only applies during the hours shown on the plate","The road is closed during those hours","Advisory speed for those times"],
    answer:1, explanation:"A time-period supplementary plate restricts the speed limit to specific hours — for example, school zone limits during school arrival and departure times." },

  { id:"c24", category:"control", img:"speed-limit-night-time.jpg",
    question:"A speed limit sign with a night condition plate means?",
    options:["The speed limit applies only during daytime","The speed limit applies only at night — different from the daytime limit","Maximum speed at all times","Floodlit road ahead"],
    answer:1, explanation:"A night-condition speed limit applies only between sunset and sunrise or as indicated. Night visibility is reduced, hence the lower limit." },

  { id:"c25", category:"control", img:"no-motorcars-during-indicated-period.jpg",
    question:"What does this sign mean for private car drivers during the indicated time period?",
    options:["Cars may use this road at all times","Motor cars are prohibited from using this road during the stated hours","Motorcars must travel faster","Parking for motorcars during those hours"],
    answer:1, explanation:"This sign bans motor cars from that road during specific hours — typically peak hours to give priority to public transport." },

  { id:"c26", category:"control", img:"pay-toll-sign.jpg",
    question:"What does this sign warn you about?",
    options:["Free road — no charge","A toll plaza ahead — have payment ready","Heavy vehicle lane","Road under construction"],
    answer:1, explanation:"A toll sign warns of an upcoming toll barrier. Have your e-tag, coins, or card ready before you reach the plaza to avoid delaying traffic." },

  { id:"c27", category:"control", img:"maximum-number-of-vehicle.jpg",
    question:"What does a sign showing a number with vehicles mean in a lane context?",
    options:["Minimum number of passengers required","Maximum number of vehicles permitted in that lane or area at one time","Speed limit for heavy vehicles","Vehicle classification code"],
    answer:1, explanation:"A maximum-number-of-vehicles sign limits how many vehicles may be in that lane, bay, or area simultaneously — used in parking areas and controlled zones." },

  // ── REGULATORY — PROHIBITION ──────────────────────────────────────────────

  { id:"p01", category:"prohibition", img:"overtaking-prohibited.jpg",
    question:"What does this sign prohibit?",
    options:["Parking on this road","Overtaking another vehicle","U-turns","Hooting"],
    answer:1, explanation:"The no-overtaking sign means you must not pass the vehicle ahead while this restriction is in force. It ends at a de-restriction sign." },

  { id:"p02", category:"prohibition", img:"overtaking-by-goods-vehicle-prohibited.jpg",
    question:"A truck with a red prohibition symbol means?",
    options:["No goods vehicles on this road","Goods vehicles may not overtake other vehicles","Trucks must use left lane","No stopping for trucks"],
    answer:1, explanation:"This sign specifically prohibits goods vehicles (trucks) from overtaking. Private vehicles may still overtake where safe and legal." },

  { id:"p03", category:"prohibition", img:"left-turn-prohibited.jpg",
    question:"What does this sign mean at an intersection?",
    options:["Left turns encouraged","Left turns are prohibited at this point","Left lane closed","U-turn to the left prohibited"],
    answer:1, explanation:"A left-turn prohibition means no vehicle may turn left here. Proceed straight or turn right if permitted." },

  { id:"p04", category:"prohibition", img:"right-turn-prohibited.jpg",
    question:"What does this sign mean?",
    options:["You must turn right","Right turns are prohibited","Right lane closed","Right turn recommended"],
    answer:1, explanation:"A right-turn prohibition sign means no vehicle may turn right at this point." },

  { id:"p05", category:"prohibition", img:"right-turn-ahead-prohibited.jpg",
    question:"A right-turn arrow with a prohibition symbol means?",
    options:["Right turn compulsory ahead","Right turn will be prohibited at the next junction","Merge right ahead","Right of way for right-turners"],
    answer:1, explanation:"This advance prohibition sign warns that turning right will not be allowed at the upcoming intersection. Plan your route before reaching it." },

  { id:"p06", category:"prohibition", img:"stopping-prohibited.jpg",
    question:"What does this sign prohibit?",
    options:["Parking during certain hours","Absolutely no stopping of any vehicle at any time","No U-turns","No dropping off passengers"],
    answer:1, explanation:"The no-stopping sign means no vehicle may stop here at any time for any reason — including to pick up or drop off passengers." },

  { id:"p07", category:"prohibition", img:"height-restriction-sign.jpg",
    question:"What must a vehicle that exceeds the stated height do?",
    options:["Proceed with caution","Not enter — it exceeds the height limit","Proceed only at night","Sound horn before entering"],
    answer:1, explanation:"A height restriction sign means no vehicle taller than the stated measurement may enter. Check your vehicle height before approaching tunnels and bridges." },

  { id:"p08", category:"prohibition", img:"width-restriction-sign.jpg",
    question:"What does this sign indicate?",
    options:["Road widens ahead","Vehicles wider than the stated measurement must not enter","Two lanes begin","Wide load escort required"],
    answer:1, explanation:"A width restriction prohibits vehicles wider than the stated dimension. Common at narrow bridges and underpasses." },

  { id:"p09", category:"prohibition", img:"length-restriction-sign-15m.jpg",
    question:"What does this sign mean?",
    options:["Vehicles must be at least 15 m long","Vehicles longer than 15 m are not permitted","15 m clearance required","Maximum speed 15 km/h"],
    answer:1, explanation:"A length restriction sign prohibits vehicles (including towing combinations) that exceed the stated length from using that road." },

  { id:"p10", category:"prohibition", img:"motorcycles-prohibited.jpg",
    question:"A red circle with a motorcycle silhouette means?",
    options:["Motorcycles only in this lane","No motorcycles — motorcycles are prohibited","Motorcycles must use left lane","Motorcycle parking ahead"],
    answer:1, explanation:"The no-motorcycles sign prohibits motorcycles from using that road or lane." },

  { id:"p11", category:"prohibition", img:"pedestrians-prohibited.jpg",
    question:"A red circle with a walking person means?",
    options:["Pedestrian crossing ahead","Pedestrians are prohibited from this road","Slow down — pedestrians present","Pedestrian priority zone"],
    answer:1, explanation:"The no-pedestrians sign means pedestrians may not walk on that road. They must use an underpass or adjacent path." },

  { id:"p12", category:"prohibition", img:"pedal-cycles-prohibited.jpg",
    question:"This sign prohibits which road users?",
    options:["Motor vehicles","Pedal cycles (bicycles)","Motorcycles","Taxis"],
    answer:1, explanation:"A no-bicycles sign prohibits pedal cyclists from using that road. Often seen on freeways where cycling would be hazardous." },

  { id:"p13", category:"prohibition", img:"animal-drawn-vehicles-prohibited.jpg",
    question:"What does this sign prohibit?",
    options:["Animal transport trucks","Animal-drawn vehicles such as carts and wagons","Horses and riders","Livestock crossing"],
    answer:1, explanation:"This sign prohibits horse carts, ox-wagons, and donkey carts from using the road. They must use an alternative route." },

  { id:"p14", category:"prohibition", img:"hawkers-prohibited.jpg",
    question:"What does this sign prohibit?",
    options:["Pedestrians from crossing","Street hawkers or vendors from operating here","Loading and unloading","Taxis from stopping"],
    answer:1, explanation:"The no-hawkers sign prohibits street vendors from selling goods in that area — often seen near busy intersections for safety reasons." },

  { id:"p15", category:"prohibition", img:"towed-vehicles-prohibited.jpg",
    question:"What type of vehicle combination does this sign prohibit?",
    options:["Buses and coaches","Vehicles towing a trailer or caravan","Articulated trucks","Vehicles with a roof rack"],
    answer:1, explanation:"This sign prohibits vehicles with trailers, caravans, or other towed combinations — often seen on steep mountain passes." },

  { id:"p16", category:"prohibition", img:"horse-riders-prohibited.jpg",
    question:"A red circle with a horse and rider means?",
    options:["Horses are crossing ahead","Horse riding on this road is prohibited","Horse-drawn vehicles prohibited","Equestrian area"],
    answer:1, explanation:"This sign prohibits horse riders from using that road. They must use an adjacent path or alternative route." },

  { id:"p17", category:"prohibition", img:"no-motorcars-during-indicated-period.jpg",
    question:"This prohibition sign has a time plate. What does it mean?",
    options:["Cars may use this road at all times","Motor cars are prohibited during the hours shown","Motorcars only during those hours","Speed limit applies only during those hours"],
    answer:1, explanation:"This time-restricted prohibition bans private cars during specific peak hours — typically to give priority to public transport." },

  // ── WARNING ───────────────────────────────────────────────────────────────

  { id:"w01", category:"warning", img:"crossroad-ahead-sign.jpg",
    question:"A cross symbol inside a warning triangle means?",
    options:["Railway crossing","A crossroad (four-way intersection) ahead","No entry","Roadworks ahead"],
    answer:1, explanation:"This warning sign alerts you to a crossroad ahead. Reduce speed and be prepared to yield depending on intersection control." },

  { id:"w02", category:"warning", img:"secondary-crossroad-sign.jpg",
    question:"A crossroad warning with thinner crossing lines means?",
    options:["Priority crossroad — you have right of way","A secondary crossroad — the crossing roads are minor roads","Railway crossing","Dangerous intersection"],
    answer:1, explanation:"The secondary crossroad sign shows a crossroad where the crossing roads are minor/secondary roads. You are still on the major road." },

  { id:"w03", category:"warning", img:"t-junction-ahead.jpg",
    question:"What does this warning sign indicate?",
    options:["Road continues with a side branch","Road ahead ends at a T-junction — you must turn left or right","Roundabout ahead","End of dual carriageway"],
    answer:1, explanation:"A T-junction warning means the road you are on ends ahead. You will have to turn left or right." },

  { id:"w04", category:"warning", img:"skew-t-junction-ahead.jpg",
    question:"A T-junction symbol at an angle warns of what?",
    options:["Normal T-junction","A skew T-junction where roads meet at an angle — approach with extra caution","Y-junction ahead","Road narrows"],
    answer:1, explanation:"A skew T-junction is one where the intersecting road meets at an angle other than 90°. This can reduce visibility — reduce speed." },

  { id:"w05", category:"warning", img:"staggered-junction-ahead.jpg",
    question:"What does a staggered junction symbol mean?",
    options:["Road forks into two","Two T-junctions close together offset from each other — not a straight crossing","Road narrows","Lane merges"],
    answer:1, explanation:"A staggered junction has two side roads that do not align across the main road. Be alert for vehicles crossing in stages." },

  { id:"w06", category:"warning", img:"y-junction-ahead.jpg",
    question:"A Y-shaped symbol inside a triangle means?",
    options:["Road merges","A Y-junction ahead — road forks into two directions","Right of way road","Dual carriageway begins"],
    answer:1, explanation:"A Y-junction warning means the road splits ahead. Slow down and choose your direction carefully." },

  { id:"w07", category:"warning", img:"left-side-road-junction-ahead.jpg",
    question:"A T-junction with the branch on the left warns of?",
    options:["Left turn mandatory","A side road joining from the left ahead","Left lane closes","Road bends left"],
    answer:0, explanation:"This sign warns of a side road entering from the left. Watch for vehicles joining or crossing from that direction." },

  { id:"w08", category:"warning", img:"right-side-road-junction-ahead.jpg",
    question:"A T-junction with the branch on the right warns of?",
    options:["Right turn mandatory","A side road joining from the right ahead","Right lane closes","Road bends right"],
    answer:1, explanation:"This sign warns of a side road entering from the right. Watch for vehicles joining or crossing from that direction." },

  { id:"w09", category:"warning", img:"sharp-junction-ahead-bottom-left.jpg",
    question:"What does a sharp-junction symbol tell you about the junction ahead?",
    options:["The junction is a simple crossroad","The junction has an acute angle — roads meet at a sharp angle, reducing visibility","The road bends sharply left","T-junction with stop control"],
    answer:1, explanation:"A sharp-junction sign shows that roads meet at an acute angle. The sharp angle reduces sight lines — reduce speed significantly." },

  { id:"w10", category:"warning", img:"sharp-junction-ahead-top-right.jpg",
    question:"This junction symbol shows the side road entering at an acute angle from the top right. What does it mean?",
    options:["Normal T-junction ahead","A side road enters from the upper right at a sharp angle — merging traffic has limited sight lines","Road narrows from the right","Roundabout ahead"],
    answer:1, explanation:"Sharp-junction signs depict the exact geometry of the upcoming junction. The acute angle means reduced visibility — reduce speed and watch for joining traffic." },

  { id:"w11", category:"warning", img:"roundabout-sign.jpg",
    question:"A circular arrow inside a triangle means?",
    options:["U-turns permitted","A traffic circle or roundabout ahead — yield to traffic in the circle","One-way system begins","No-entry roundabout"],
    answer:1, explanation:"A roundabout warning sign means a traffic circle is ahead. Yield to traffic already in the circle before entering." },

  { id:"w12", category:"warning", img:"traffic-circle-ahead-mini-circle-or-roundabout-sign.jpg",
    question:"What does this roundabout/mini-circle warning sign indicate?",
    options:["U-turns allowed","A traffic circle, mini-circle, or roundabout is ahead — slow down and yield to circulating traffic","End of one-way system","Sharp curve ahead"],
    answer:1, explanation:"This sign warns of a traffic circle ahead of any size. Give way to vehicles already in the circle." },

  { id:"w13", category:"warning", img:"traffic-lights-ahead-sign.jpg",
    question:"Traffic lights inside a triangle warn of?",
    options:["Lights are out of order","Traffic lights ahead — prepare to stop","No lights on this road","Emergency signal"],
    answer:1, explanation:"This warning sign alerts you to traffic lights ahead, especially where they may not be immediately visible. Prepare to stop at red." },

  { id:"w14", category:"warning", img:"co-ordinated-traffic-signals.jpg",
    question:"What does a co-ordinated traffic signals sign tell you?",
    options:["Traffic lights ahead are faulty","A series of traffic lights are timed (green wave) — keep to the indicated speed to catch green lights","Traffic lights are temporary","Emergency vehicle signal system"],
    answer:1, explanation:"Co-ordinated signals are timed so that drivers travelling at the prescribed speed pass through successive intersections on green. Maintain the indicated speed." },

  { id:"w15", category:"warning", img:"multi-phase-traffic-signals.jpg",
    question:"What does a multi-phase traffic signal sign warn you about?",
    options:["Traffic lights cycle only red and green","Traffic lights ahead operate in multiple phases — pedestrian, turning and straight-through movements are controlled separately","Traffic lights are faulty","Emergency signal ahead"],
    answer:1, explanation:"Multi-phase signals have separate phases for different movements (e.g., left turn, pedestrian, straight-through). Be aware of which phase applies to your movement." },

  { id:"w16", category:"warning", img:"two-way-traffic-sign.jpg",
    question:"Two opposite arrows in a triangle warn of?",
    options:["Overtaking zone","Two-way traffic begins — oncoming vehicles on the same road","Road merges from both sides","One-way system ends"],
    answer:1, explanation:"A two-way traffic sign warns that the road changes to or continues as a two-way road. Keep left and watch for oncoming vehicles." },

  { id:"w17", category:"warning", img:"beginning-of-dual-roadway.jpg",
    question:"What does this sign indicate about the road ahead?",
    options:["Two-way traffic begins","Road divides into a dual carriageway — keep to your side","Median strip ends","Overtaking permitted"],
    answer:1, explanation:"This sign warns that a divided dual carriageway begins. The road splits into two separate one-way carriageways divided by a median." },

  { id:"w18", category:"warning", img:"end-of-dual-roadway.jpg",
    question:"What does this sign indicate?",
    options:["Divided road begins","Dual carriageway ends — merges into a single two-way road","Overtaking now prohibited","End of motorway"],
    answer:1, explanation:"This sign warns that the dual carriageway ends and merges into a single two-way road. Move into the correct lane and watch for oncoming traffic." },

  { id:"w19", category:"warning", img:"lane-reduction-ahead.jpg",
    question:"What does this sign warn?",
    options:["New lane added","Number of lanes reduces ahead — merge in good time","Bus lane begins","Road narrows on both sides"],
    answer:1, explanation:"A lane reduction sign warns that one or more lanes end ahead. Begin merging early to avoid last-minute lane changes." },

  { id:"w20", category:"warning", img:"left-hand-lane-ends-ahead.jpg",
    question:"What does this sign mean?",
    options:["New left lane added","Left lane ends — merge right","Left turn only ahead","Bus lane begins left"],
    answer:1, explanation:"The left lane ends ahead. Drivers in that lane must merge right. Move over early and yield to traffic already in the right lane." },

  { id:"w21", category:"warning", img:"right-hand-lane-ends-ahead.jpg",
    question:"What does this sign mean?",
    options:["New right lane added","Right lane ends — merge left","Right turn only ahead","Overtaking lane ends"],
    answer:1, explanation:"The right lane ends ahead. Drivers in that lane must merge left. Move over early and yield to traffic in the left lane." },

  { id:"w22", category:"warning", img:"additional-lane.jpg",
    question:"What does this sign tell you about the road ahead?",
    options:["A lane is closing","An additional lane is being added — the road widens","Road narrows","Climbing lane ends"],
    answer:1, explanation:"An additional lane sign means the road widens ahead with a new lane. Often seen before steep climbs where a climbing lane is added." },

  { id:"w23", category:"warning", img:"road-narrows-from-right-side-sign.jpg",
    question:"What does this sign warn you about?",
    options:["Road becomes one-way","Road narrows from the right side — be prepared to give way","Median strip begins","Left lane added"],
    answer:1, explanation:"A road-narrows sign means the road width reduces from the right. Reduce speed and be prepared to give way to oncoming vehicles." },

  { id:"w24", category:"warning", img:"traffic-movement-affected-by-obstruction.jpg",
    question:"What does this sign warn you about?",
    options:["Road closed ahead","An obstruction on the road ahead will affect normal traffic movement — proceed with caution","One-way system begins","Narrow bridge ahead"],
    answer:1, explanation:"This sign warns that an obstruction (median, island, or road feature) will affect traffic movement. Follow the indicated direction around the obstruction." },

  { id:"w25", category:"warning", img:"pedestrian-crossing-sign.jpg",
    question:"A pedestrian on striped lines in a triangle means?",
    options:["School zone","A marked pedestrian crossing ahead — yield to crossing pedestrians","No pedestrians","Cycle lane begins"],
    answer:1, explanation:"This sign warns of a pedestrian crossing ahead. Reduce speed and yield to pedestrians already in or approaching the crossing." },

  { id:"w26", category:"warning", img:"pedestrians-ahead-sign.jpg",
    question:"A walking person silhouette in a triangle warns of?",
    options:["A marked crossing ahead","Pedestrians may be walking alongside or across the road","Pedestrians prohibited","School guard ahead"],
    answer:1, explanation:"Pedestrians-ahead warns that people on foot may be on or near the road — not necessarily at a crossing. Reduce speed and watch carefully." },

  { id:"w27", category:"warning", img:"children-ahead-sign.jpg",
    question:"Two child figures in a triangle near a school means?",
    options:["Stop and wait for guard","Reduce speed — children may be crossing","Sound horn to warn children","Proceed normally"],
    answer:1, explanation:"The children-ahead sign warns of a school or playground nearby. Reduce speed and be ready to stop if children step onto the road." },

  { id:"w28", category:"warning", img:"cyclists-ahead-sign.jpg",
    question:"A cyclist symbol in a triangle warns of?",
    options:["Bicycle lane begins","Cyclists may be on or crossing the road ahead","No cycles permitted","Bicycle race"],
    answer:1, explanation:"The cyclists-ahead sign warns that cyclists are likely to be on or crossing the road. Give them space and reduce speed." },

  { id:"w29", category:"warning", img:"railway-crossing-sign.jpg",
    question:"An X symbol in a triangle warns of?",
    options:["Dangerous junction","Level crossing — railway line crosses the road ahead","Road closed","No crossing"],
    answer:1, explanation:"The X in a warning triangle indicates a level rail crossing. Reduce speed, look both ways, and never cross if a train is visible or the boom is down." },

  { id:"w30", category:"warning", img:"railway-crossing-ahead.jpg",
    question:"What does this advance railway crossing sign prepare you for?",
    options:["A level railway crossing is ahead — prepare to stop","Railway runs parallel to road","Train station ahead","Railway workers on road"],
    answer:0, explanation:"This advance warning sign tells you a railway level crossing is coming up. Slow down, watch and listen for trains, and follow all signals at the crossing." },

  { id:"w31", category:"warning", img:"wild-animal-ahead-sign.jpg",
    question:"An animal silhouette in a triangle warns of?",
    options:["Wildlife reserve — no hooting","Wild or domestic animals may cross the road ahead","Farm vehicles on road","No livestock transport"],
    answer:1, explanation:"Animal-crossing signs warn that animals may be on or crossing the road. Reduce speed, especially at dawn, dusk, and night." },

  { id:"w32", category:"warning", img:"elephant-ahead-sign.jpg",
    question:"An elephant silhouette in a triangle means?",
    options:["Zoo entrance","Elephants may be crossing — slow down","Heavy vehicle lane","Rough terrain ahead"],
    answer:1, explanation:"Found in game reserves and rural areas. An elephant on the road is extremely dangerous — slow down and wait at a safe distance." },

  { id:"w33", category:"warning", img:"hippo-ahead-sign.jpg",
    question:"A hippo silhouette in a warning triangle means?",
    options:["Water hazard — no swimming","Hippopotamuses may cross the road — extreme caution required","Heavy load zone","Tourist attraction nearby"],
    answer:1, explanation:"A hippo-crossing sign is found near rivers and wetlands in game areas. Hippos are highly dangerous and unpredictable — slow down and wait for them to clear the road." },

  { id:"w34", category:"warning", img:"warthog-ahead-sign.jpg",
    question:"A warthog silhouette in a triangle warns of?",
    options:["Game reserve entrance","Warthogs or other small game may be crossing or on the road","Rough off-road terrain","Pig farming area"],
    answer:1, explanation:"This sign is found in game parks and rural areas. Warthogs can appear suddenly on roads — reduce speed and watch carefully." },

  { id:"w35", category:"warning", img:"horses-ahead-sign.jpg",
    question:"A horse silhouette in a warning triangle means?",
    options:["Horse trail parallel to road","Horses may be on or crossing the road ahead","Horse racing nearby","No horse riders"],
    answer:1, explanation:"A horses-ahead sign warns that horses may be present on the road. Slow down, pass wide, and avoid sudden noise — horses can spook and bolt into traffic." },

  { id:"w36", category:"warning", img:"horses-and-riders-ahead-sign.jpg",
    question:"A horse with rider in a triangle warns of?",
    options:["Horse racing zone","Horses with riders may be on the road — pass slowly and quietly","Equestrian centre ahead","Horse riders prohibited"],
    answer:1, explanation:"This sign warns of horse riders on the road. Slow right down, do not hoot, and pass with plenty of space to avoid startling the horse." },

  { id:"w37", category:"warning", img:"sheep-ahead-sign.jpg",
    question:"A sheep silhouette in a triangle warns of?",
    options:["Wool processing plant","Sheep may be on or crossing the road ahead","No livestock transport","Farm area begins"],
    answer:1, explanation:"A sheep-crossing sign is common on rural roads during droving seasons. Flocks can completely block a road — slow down and wait patiently." },

  { id:"w38", category:"warning", img:"agricultural-vehicle-sign.jpg",
    question:"A tractor symbol in a triangle warns of?",
    options:["Farm equipment sales ahead","Agricultural vehicles such as tractors may be travelling on or crossing the road","Road is being ploughed","Gravel road begins"],
    answer:1, explanation:"Agricultural vehicles move slowly and may take up the full width of a road. Reduce speed and wait for a safe opportunity to pass." },

  { id:"w39", category:"warning", img:"slippery-road-sign.jpg",
    question:"A car with skid marks in a triangle warns of?",
    options:["Steep descent","Slippery road surface — reduce speed and avoid sudden inputs","Road ends","Gravel begins"],
    answer:1, explanation:"The slippery road sign warns of a surface that may be wet, icy, or contaminated. Reduce speed and avoid sudden steering or braking." },

  { id:"w40", category:"warning", img:"gravel-road-begins-sign.jpg",
    question:"What does this sign tell you about the road surface ahead?",
    options:["Tarred road begins","Gravel road begins — adjust speed and increase following distance","Road under construction","Pothole warning"],
    answer:1, explanation:"A gravel-road-begins sign means the tar surface ends. Reduce speed — gravel offers less grip and loose stones can damage vehicles behind you." },

  { id:"w41", category:"warning", img:"gravel-road-ends-sign.jpg",
    question:"What does this sign mean?",
    options:["Gravel road continues","Gravel road ends and tarred surface begins","Loose stones ahead","Road resurfacing ahead"],
    answer:1, explanation:"This sign indicates you are leaving the gravel surface and entering a tarred road. You may gradually increase speed on the tar." },

  { id:"w42", category:"warning", img:"speedbumps-sign.jpg",
    question:"A series of humps in a triangle warns of?",
    options:["Bridge ahead","Speed bumps or road humps ahead — reduce speed","Rough road","Dip in road"],
    answer:1, explanation:"Speed-bump signs warn of artificial humps placed to slow traffic. Reduce speed before reaching them to avoid vehicle damage." },

  { id:"w43", category:"warning", img:"speed-bump.jpg",
    question:"This sign depicts a road with a hump. What does it indicate?",
    options:["Bridge structure","A single speed bump ahead","Rough road surface","Dip in road"],
    answer:1, explanation:"A speed bump sign warns of an artificial hump in the road. Slow down to the recommended speed shown (if any) before crossing it." },

  { id:"w44", category:"warning", img:"uneven-roadway-sign.jpg",
    question:"What does this sign warn about the road surface?",
    options:["Speed humps ahead","Uneven or rough road surface — reduce speed","Potholes repaired","Tarred road begins"],
    answer:1, explanation:"An uneven roadway sign warns of an irregular surface. Reduce speed to maintain vehicle control and avoid wheel damage." },

  { id:"w45", category:"warning", img:"loose-stones.jpg",
    question:"This sign warns of what road hazard?",
    options:["Gravel road begins","Loose stones on the road — risk of stone damage","Rocky cliff","Falling rocks"],
    answer:1, explanation:"Loose stones on the road can damage windscreens and paint. Reduce speed and maintain distance from other vehicles." },

  { id:"w46", category:"warning", img:"warning-of-potholes-ahead.jpg",
    question:"A triangle with a pockmarked road surface warns of?",
    options:["Gravel road","Potholes ahead — reduce speed and steer carefully","Speed humps","Road is being resurfaced"],
    answer:1, explanation:"A pothole warning sign alerts you to holes in the road surface. Reduce speed to avoid tyre, wheel, and suspension damage." },

  { id:"w47", category:"warning", img:"drift-sign.jpg",
    question:"What does a drift sign indicate?",
    options:["Road drifts to the left","A drift (low-water crossing or sandy area) ahead — drive with caution","Sand dunes visible","Road under repair"],
    answer:1, explanation:"A drift sign warns of a low-water crossing or an area where sand or soil drifts across the road. Reduce speed and check conditions before crossing." },

  { id:"w48", category:"warning", img:"general-warning-sign.jpg",
    question:"An exclamation mark in a triangle means?",
    options:["Emergency services nearby","General hazard ahead with no specific sign","Road ends","High-voltage cables overhead"],
    answer:1, explanation:"The general warning sign indicates a hazard that doesn't have its own specific sign. Slow down and watch for unexpected conditions." },

  { id:"w49", category:"warning", img:"falling-rocks-sign.jpg",
    question:"Rocks falling from a cliff in a triangle warns of?",
    options:["Steep climb ahead","Falling rocks or rockslides possible in this area","Gravel road surface","Mining blasting zone"],
    answer:1, explanation:"This sign warns that rocks may fall from the hillside onto the road. Drive carefully and do not stop in the rockfall zone." },

  { id:"w50", category:"warning", img:"steep-descent-sign.jpg",
    question:"A downward slope line with a percentage in a triangle means?",
    options:["Road bends downhill","Steep descent — engage lower gear before descending","Steep climb ahead","Speed limit reduced"],
    answer:1, explanation:"A steep-descent sign warns of a significant downhill gradient. Engage a lower gear before descending so engine braking assists the foot brake." },

  { id:"w51", category:"warning", img:"steep-ascent-sign.jpg",
    question:"An upward slope line in a triangle means?",
    options:["Steep descent ahead","Steep climb ahead — heavy vehicles may lose speed","Road levels out","Overtaking permitted on incline"],
    answer:1, explanation:"A steep-ascent sign warns of a significant uphill gradient. Heavy vehicles will slow down — do not follow too closely." },

  { id:"w52", category:"warning", img:"engage-lower-gear.jpg",
    question:"What does this sign instruct you to do?",
    options:["Accelerate before climb","Engage a lower gear now — steep descent ahead","Switch off engine braking","Stop and check brakes"],
    answer:1, explanation:"This sign means you must select a lower gear before the descent begins. Using a lower gear prevents brake fade on steep descents." },

  { id:"w53", category:"warning", img:"escape-road-ahead.jpg",
    question:"What is an escape road for?",
    options:["Emergency vehicles only","Vehicles with brake failure — filled with deep gravel to stop runaway vehicles safely","Toll-free bypass","Sharp corner ahead"],
    answer:1, explanation:"Escape roads (arrestor beds) are provided on steep descents for vehicles that have lost braking ability. Deep gravel rapidly slows the vehicle to a safe stop." },

  { id:"w54", category:"warning", img:"arrestor-bed.jpg",
    question:"An arrestor bed sign indicates?",
    options:["Sleeping area for truck drivers","A gravel-filled runaway ramp off the main road for vehicles with brake failure","Speed bump ahead","Rough road surface"],
    answer:1, explanation:"An arrestor bed is the actual gravel-filled escape ramp. Runaway vehicles enter it to be brought safely to a stop." },

  { id:"w55", category:"warning", img:"arrestor-bed-ahead.jpg",
    question:"This sign warns that ahead there is?",
    options:["A toll plaza","An arrestor bed (runaway lane) — if your brakes fail, use it","A rest stop","A fuel station"],
    answer:1, explanation:"This advance warning sign tells drivers that an arrestor bed is coming up on the descent. If your brakes fail, steer into it immediately." },

  { id:"w56", category:"warning", img:"winding-road-ahead-starting-to-the-left.jpg",
    question:"A series of bends in a triangle means?",
    options:["Single sharp bend","Winding road with multiple bends ahead — reduce speed","U-turn permitted","Zigzag road markings ahead"],
    answer:1, explanation:"A winding road sign warns of a series of bends. Reduce speed, do not overtake, and keep full control through the bends." },

  { id:"w57", category:"warning", img:"winding-road-ahead-starting-to-the-right.jpg",
    question:"A winding road symbol starting to the right warns of?",
    options:["Single right bend","A winding road with multiple curves starting to the right — reduce speed","End of straight road","Merge from the right"],
    answer:1, explanation:"This winding road sign shows the road starts curving to the right. Reduce speed and stay alert for the series of bends ahead." },

  { id:"w58", category:"warning", img:"sharp-bend-left.jpg",
    question:"A single sharp curved arrow to the left warns of?",
    options:["Gentle curve left","A sharp left bend — reduce speed significantly before the bend","Left turn permitted","One-way road left"],
    answer:1, explanation:"A sharp-bend sign warns of a tight corner. Slow down before entering — braking while turning can cause skidding." },

  { id:"w59", category:"warning", img:"sharp-bend-right.jpg",
    question:"A single sharp curved arrow to the right warns of?",
    options:["Gentle curve right","A sharp right bend — reduce speed significantly before the bend","Right turn permitted","One-way road right"],
    answer:1, explanation:"Slow down well before a sharp right bend. The tighter the curve, the more speed needs to be reduced." },

  { id:"w60", category:"warning", img:"combined-curve-sign-left.jpg",
    question:"A chevron arrow curving left on a yellow board placed on the road edge means?",
    options:["Left turn compulsory","The road curves sharply to the left — the chevron shows the direction of the bend","End of dual carriageway","Lane merges left"],
    answer:1, explanation:"Combined curve chevron signs are placed on the outside of curves to show the direction the road turns. They help drivers navigate bends at night and in poor visibility." },

  { id:"w61", category:"warning", img:"combined-curve-sign-right.jpg",
    question:"A chevron arrow curving right on a yellow board placed on the road edge means?",
    options:["Right turn compulsory","The road curves sharply to the right — follow the direction of the chevron","End of dual carriageway","Lane merges right"],
    answer:1, explanation:"Curve chevron signs on the road edge show the direction of the bend. Slow down and follow the road in the direction the arrows point." },

  { id:"w62", category:"warning", img:"hairpin-bend-ahead-to-the-left.jpg",
    question:"A hairpin or horseshoe bend symbol to the left warns of?",
    options:["Gentle bend left","An extremely sharp U-shaped bend to the left — reduce speed drastically","Winding road ahead","Road doubles back"],
    answer:1, explanation:"A hairpin bend is almost a full U-turn in the road. They are found on steep mountain passes and require drastic speed reduction before the bend." },

  { id:"w63", category:"warning", img:"hairpin-bend-ahead-to-the-right.jpg",
    question:"A hairpin bend symbol to the right warns of?",
    options:["Gentle bend right","An extremely sharp U-shaped bend to the right — reduce speed drastically","Road widens","Detour to the right"],
    answer:1, explanation:"Hairpin bends on mountain passes require very low speed. Larger vehicles may need to use the full road width — give way and wait if necessary." },

  { id:"w64", category:"warning", img:"gentle-curve-ahead-left.jpg",
    question:"A gentle curved arrow to the left in a triangle warns of?",
    options:["Sharp bend left","A gentle (gradual) left curve ahead — slight speed reduction may be needed","Left turn compulsory","Road narrows left"],
    answer:1, explanation:"A gentle curve sign warns of a gradual bend. While less severe than a sharp bend, a slight speed reduction may be needed at higher speeds." },

  { id:"w65", category:"warning", img:"gentle-curve-ahead-right.jpg",
    question:"A gentle curved arrow to the right warns of?",
    options:["Sharp bend right","A gentle right curve ahead — gradual change of direction","Right turn compulsory","Road narrows right"],
    answer:1, explanation:"A gentle curve requires less speed reduction than a sharp bend, but you should still adjust speed for the road conditions and visibility." },

  { id:"w66", category:"warning", img:"low-flying-aircraft-sign.jpg",
    question:"What does a low-flying aircraft sign indicate?",
    options:["Airport nearby — no radio transmission","Low-flying aircraft operate in this area — do not be startled","Military zone","No drones permitted"],
    answer:1, explanation:"A low-flying aircraft sign warns that aircraft operate at low altitude in this area — near airports, crop-dusting areas, or military zones. Sudden noise may occur." },

  { id:"w67", category:"warning", img:"reduced-visibility-sign.jpg",
    question:"A mist or sun glare symbol in a triangle warns of?",
    options:["Scenic lookout","Reduced visibility ahead — switch on headlights and reduce speed","Bright sunshine — use sunscreen","High beam prohibited"],
    answer:1, explanation:"A reduced-visibility sign warns of mist, smoke, dust, or sun glare that may greatly reduce your ability to see. Switch on headlights and reduce speed." },

  { id:"w68", category:"warning", img:"tunnel-ahead-sign.jpg",
    question:"What does a tunnel warning sign prepare you for?",
    options:["Bridge over a river","A tunnel ahead — switch on headlights and obey any tunnel speed limits","Road goes underground permanently","Underpass for pedestrians"],
    answer:1, explanation:"Switch on your headlights when entering a tunnel. Obey the tunnel speed limit and do not stop unless an emergency forces you to." },

  { id:"w69", category:"warning", img:"electric-shock-sign.jpg",
    question:"A lightning bolt or electric shock symbol in a warning triangle means?",
    options:["Lightning storm area","Overhead electric cables — risk of electric shock if your load is too high","Electric vehicle charging zone","High-voltage substation nearby"],
    answer:1, explanation:"An electric shock warning sign is placed where overhead electrical cables cross the road at reduced height. High loads (vehicles with tall loads, raised tipper bodies) risk contact and electrocution." },

  { id:"w70", category:"warning", img:"gate-sign.jpg",
    question:"What does a gate sign warn you about?",
    options:["Road is closed permanently","A gate across the road ahead — be prepared to stop and open or wait for it","Toll plaza ahead","Level crossing gate"],
    answer:1, explanation:"A gate sign warns of a farm gate, game reserve gate, or similar barrier across the road. Reduce speed and be prepared to stop and open or wait for the gate." },

  { id:"w71", category:"warning", img:"concealed-driveway-ahead-from-the-left-sign.jpg",
    question:"What hazard does this sign warn about?",
    options:["T-junction ahead","A hidden driveway on the left — vehicles may pull out unexpectedly","Left lane closed","Concealed pedestrian crossing"],
    answer:1, explanation:"A concealed-driveway sign warns that a driveway or side entrance is hidden by vegetation. A vehicle may appear suddenly — reduce speed." },

  { id:"w72", category:"warning", img:"concealed-driveway-ahead-from-the-right.jpg",
    question:"This sign warns of a concealed driveway on which side?",
    options:["Left","Right","Both sides","Straight ahead"],
    answer:1, explanation:"A hidden driveway on the right means vehicles may pull out unexpectedly from the right side. Reduce speed and be ready to brake." },

  { id:"w73", category:"warning", img:"concealed-driveway-ahead-from-both-sides.jpg",
    question:"A concealed driveway symbol on both sides of the road warns of?",
    options:["Two T-junctions","Hidden driveways on both the left and right — vehicles may emerge from either side","Road narrows from both sides","Two separate one-way roads"],
    answer:1, explanation:"With hidden driveways on both sides, vehicles can emerge unexpectedly from either direction. Reduce speed and stay alert for vehicles entering the road." },

  { id:"w74", category:"warning", img:"congestion-sign.jpg",
    question:"What does this sign indicate about traffic ahead?",
    options:["Toll plaza ahead","Traffic congestion — expect delays and slow-moving traffic","Construction zone","Road narrows to one lane"],
    answer:1, explanation:"A congestion sign warns that traffic is backed up ahead. Reduce speed and maintain a safe following distance." },

  { id:"w75", category:"warning", img:"slow-moving-heavy-vehicle-sign.jpg",
    question:"What does this warning sign tell you about vehicles ahead?",
    options:["Fast-moving vehicles in this lane","Slow-moving heavy vehicles may be on the road — allow extra following distance","Road closed to heavy vehicles","Trucks must use left lane"],
    answer:1, explanation:"This sign warns that slow-moving heavy vehicles such as trucks or construction equipment are likely on the road ahead." },

  { id:"w76", category:"warning", img:"accident-ahead-sign.jpg",
    question:"What does this warning sign indicate?",
    options:["First aid post nearby","An accident ahead — reduce speed and follow emergency personnel instructions","Emergency services depot","Road closed for construction"],
    answer:1, explanation:"An accident-ahead sign warns of a crash scene. Slow down significantly, be ready to stop, and follow directions from traffic officers." },

  { id:"w77", category:"warning", img:"danger-plate-sign-left.jpg",
    question:"A red and white diagonal striped board on the left side of the road indicates?",
    options:["No overtaking zone","An obstruction or hazard — the diagonal stripes direct traffic to pass on the right","Road closed","No entry from the left"],
    answer:1, explanation:"Danger plates (red and white stripes) are placed at obstructions to direct traffic around the hazard. The direction of the stripes shows which side to pass." },

  { id:"w78", category:"warning", img:"danger-plate-sign-right.jpg",
    question:"A red and white striped board on the right side of the road indicates?",
    options:["No overtaking zone","An obstruction — the stripes direct traffic to pass on the left","Road closed","No entry from the right"],
    answer:1, explanation:"A right-side danger plate directs traffic to pass on the left side of the obstruction. Always follow the direction indicated by the stripe pattern." },

  { id:"w79", category:"warning", img:"hazard-marker-sign.jpg",
    question:"A small reflective marker on the road edge serves what purpose?",
    options:["Speed limit marker","Retroreflective road edge delineator — marks the edge of the road in poor visibility","Lane centre marker","No stopping zone marker"],
    answer:1, explanation:"Hazard markers are retroreflective delineators placed at the road edge to help drivers stay on the road in darkness, mist, or rain." },

  { id:"w80", category:"warning", img:"sharp-curve-left-chevron-sign.jpg",
    question:"A yellow board with large arrows curving left placed on the road edge means?",
    options:["Left turn compulsory","Sharp left curve ahead — the chevron arrows show the direction of the bend","Road narrows left","One-way road left"],
    answer:1, explanation:"Chevron signs are placed on the outside of sharp curves to clearly show the road direction. They are especially useful at night and in poor visibility." },

  { id:"w81", category:"warning", img:"sharp-curve-right-chevron-sign.jpg",
    question:"A yellow board with large arrows curving right placed on the road edge means?",
    options:["Right turn compulsory","Sharp right curve — the chevron arrows indicate the road direction","Road narrows right","One-way road right"],
    answer:1, explanation:"Right-curve chevron boards on the road edge show that the road bends sharply to the right. Slow down and follow the road direction indicated." },

  { id:"w82", category:"warning", img:"t-junction-chevron-sign.jpg",
    question:"A chevron board placed at the end of a road where it meets a T-junction means?",
    options:["Stop sign ahead","The road ends here — the chevrons direct you to turn left or right","Roundabout ahead","One-way road begins"],
    answer:1, explanation:"A T-junction chevron is placed where the road ends to warn drivers that they cannot continue straight ahead. Turn in the direction indicated by the chevrons." },

  { id:"w83", category:"warning", img:"deadend-or-road-closed-chevron-sign.jpg",
    question:"A chevron board at a dead end or road closure means?",
    options:["Proceed with caution","The road is closed or ends here — you cannot continue forward","Speed bump ahead","Detour follows"],
    answer:1, explanation:"A dead-end chevron board means the road ends completely ahead. You must turn around. At a road closure it means you may not continue in that direction." },

  // ── GUIDANCE & DIRECTION ──────────────────────────────────────────────────

  { id:"g01", category:"guidance", img:"fingerboard.jpg",
    question:"What is a fingerboard sign used for?",
    options:["Warning of a junction","Pointing to specific destinations along a route — a direction sign","Indicating road classification","Showing speed limits ahead"],
    answer:1, explanation:"Fingerboard signs are directional guidance signs that point to named destinations. They help drivers navigate to towns, facilities, and points of interest." },

  { id:"g02", category:"guidance", img:"information-center.jpg",
    question:"A blue sign with a white 'i' means?",
    options:["Hospital ahead","Tourist or traveller information centre nearby","Internet access available","Road inspection point"],
    answer:1, explanation:"The 'i' on a blue background indicates a tourist or traveller information centre. Staff can provide maps, directions, and local information." },

  { id:"g03", category:"guidance", img:"advance-exit-direction.jpg",
    question:"What does an advance exit direction sign on a freeway tell you?",
    options:["Exit is now — turn off here","Your exit is coming up ahead — prepare to move into the exit lane in good time","Speed limit on the off-ramp","Toll plaza at exit"],
    answer:1, explanation:"An advance exit direction sign gives early warning of an upcoming exit. Move to the exit lane in good time without cutting across traffic." },

  { id:"g04", category:"guidance", img:"crossroad-advance-direction.jpg",
    question:"An advance direction sign at a crossroad shows?",
    options:["Warning of an uncontrolled crossing","The destinations in each direction of an upcoming crossroad, so you can choose your lane in advance","Right of way at the crossroad","Speed limits for each direction"],
    answer:1, explanation:"Crossroad advance direction signs show which destinations are reached by turning left, going straight, or turning right. Use them to position yourself in the correct lane early." },

  { id:"g05", category:"guidance", img:"overhead-direction.jpg",
    question:"What is the purpose of an overhead (gantry) direction sign?",
    options:["Speed limit restriction","Lane-specific destination information mounted above the road on a gantry — each panel applies to the lane below it","Roadworks ahead","Motorway begins"],
    answer:1, explanation:"Overhead gantry signs display lane-specific destinations. The panel above each lane shows where that lane leads. Position yourself under the correct panel for your destination." },

  { id:"g06", category:"guidance", img:"countdown-sign.jpg",
    question:"What does a countdown sign near a freeway exit tell you?",
    options:["Speed limit countdown","Distance remaining to the exit — e.g. 3 bars = 300 m, 2 bars = 200 m, 1 bar = 100 m","Number of lanes ahead","Time to the next town"],
    answer:1, explanation:"Countdown markers (3, 2, 1 bar signs) show the distance to an upcoming exit or side road. They help you judge when to move to the exit lane." },

  { id:"g07", category:"guidance", img:"exit-direction.jpg",
    question:"An exit direction sign is positioned?",
    options:["1 km before the exit","At the actual exit point — confirming you must turn off here","On the freeway median","At the toll plaza"],
    answer:1, explanation:"The exit direction sign is placed at the exit itself to confirm you have reached the correct off-ramp. By this point you should already be in the exit lane." },

  { id:"g08", category:"guidance", img:"pre-advance-exit-direction.jpg",
    question:"A pre-advance exit direction sign appears?",
    options:["At the exit","Well in advance of the exit — giving you maximum time to plan and change lanes","Immediately before the exit","At the next town"],
    answer:1, explanation:"Pre-advance exit signs appear early (often 1–2 km before the exit) to give drivers maximum time to navigate across lanes to the correct exit lane." },

  { id:"g09", category:"guidance", img:"confirmation-alternative-route.jpg",
    question:"What does a confirmation or alternative route sign tell you?",
    options:["Your current route is closed","You are on an alternative route as confirmed — follow these signs to reach your destination","Detour ends ahead","Toll road alternative"],
    answer:1, explanation:"Confirmation signs reassure drivers that they are correctly following the alternative route during roadworks or event diversions." },

  { id:"g10", category:"guidance", img:"advance-trailblazer.jpg",
    question:"What is a trailblazer sign used for?",
    options:["Warning of bends on the trail","Marking a route so drivers can follow signs from origin to destination without needing maps","Speed limit on scenic routes","Mountain pass sign"],
    answer:1, explanation:"Trailblazer signs form a series along a route from origin to destination. They confirm you are on the correct road and guide you through every turn." },

  { id:"g11", category:"guidance", img:"map-type-advance-trail-blazer.jpg",
    question:"A map-type trailblazer shows?",
    options:["A road warning","A small map showing the route ahead with turns indicated — helps you navigate a complex section","Hiking trail map","Tourist attraction map"],
    answer:1, explanation:"Map-type trailblazers include a small diagram of the route ahead, showing upcoming turns and intersections. Useful at complex junctions where a simple fingerboard may be confusing." },

  { id:"g12", category:"guidance", img:"park-n-ride-train.jpg",
    question:"A Park and Ride sign means?",
    options:["No parking — take a taxi","A facility where you can park your car and transfer to a bus or train to continue your journey","Pay-and-display parking","Car-sharing area"],
    answer:1, explanation:"Park and Ride facilities allow commuters to park on the city's outskirts and continue their journey by public transport, reducing congestion in the city centre." },

  { id:"g13", category:"guidance", img:"modal-transfer.jpg",
    question:"What does a modal transfer sign indicate?",
    options:["Road modal test centre","A point where you can transfer between different modes of transport (e.g. bus to train)","Vehicle licensing centre","Drivers license testing station"],
    answer:1, explanation:"A modal transfer point is where you switch between transport modes — for example, from bus to rail. Signs direct commuters to the connection point." },

  { id:"g14", category:"guidance", img:"bus-stop-reservation-sign.jpg",
    question:"A sign with a bus symbol in a coloured rectangle means?",
    options:["Bus prohibited","This is a designated bus stop — private vehicles must not stop or park here","Bus passengers must alight here","Taxi rank area"],
    answer:1, explanation:"A bus stop reservation sign reserves that area exclusively for buses to pick up and drop off passengers. Private vehicles parking here obstruct public transport." },

  { id:"g15", category:"guidance", img:"disabled-person-vehicle-parking-reservation-sign.jpg",
    question:"A sign showing the international wheelchair symbol means?",
    options:["Pedestrian crossing ahead","Parking reserved for vehicles displaying a valid disabled person's permit","No parking for any vehicle","Hospital parking only"],
    answer:1, explanation:"Disabled parking bays are reserved exclusively for vehicles displaying a valid disabled person's parking disc. Parking here without a valid disc is a serious offence." },

  { id:"g16", category:"guidance", img:"bus-and-minibus-lane-reservation-sign.jpg",
    question:"A lane marked with a bus/minibus reservation sign means?",
    options:["All vehicles may use this lane","This lane is reserved for buses and minibuses only — private vehicles must not enter during restriction hours","Buses must stay out of this lane","Taxis and buses share this lane"],
    answer:1, explanation:"Reserved bus/minibus lanes keep public transport moving during peak hours. Private vehicles entering the lane during restriction hours commit a traffic offence." },

  { id:"g17", category:"guidance", img:"high-occupancy-vehicle-reservation-sign.jpg",
    question:"What is a High Occupancy Vehicle (HOV) lane?",
    options:["A lane for heavy trucks only","A lane reserved for vehicles carrying a specified minimum number of occupants — to encourage carpooling","A passing lane for fast-moving vehicles","An emergency lane"],
    answer:1, explanation:"HOV lanes are reserved for vehicles carrying 2 or more occupants (as specified). They incentivise carpooling, reduce congestion, and improve journey times for those who share rides." },

  { id:"g18", category:"guidance", img:"taxi-reservation-sign.jpg",
    question:"A sign with a taxi symbol in a coloured rectangle means?",
    options:["No taxis permitted","This is a designated taxi rank or taxi lane — reserved for registered taxis","Taxi services prohibited","Random taxi inspection point"],
    answer:1, explanation:"Taxi reservation signs designate an area or lane specifically for registered taxis. This ensures taxis can load and unload passengers safely without blocking traffic." },

  // ── ROAD MARKINGS ─────────────────────────────────────────────────────────

  { id:"m01", category:"markings", img:"no-parking-line.jpg",
    question:"A yellow broken line along the edge of the road means?",
    options:["Edge of the road — parking permitted","No parking — vehicles must not park alongside this line","No stopping at any time","Edge of a bus lane"],
    answer:1, explanation:"A yellow broken edge line means no parking alongside it. You may stop briefly to load or unload passengers, but you may not park." },

  { id:"m02", category:"markings", img:"no-stopping-line.jpg",
    question:"A yellow continuous line along the edge of the road means?",
    options:["Parking permitted on the edge","No stopping — not even briefly — alongside this line","No parking during peak hours","Edge of a bicycle lane"],
    answer:1, explanation:"A continuous yellow edge line means no vehicle may stop here at any time — not even to pick up or drop off a passenger." },

  { id:"m03", category:"markings", img:"pedestrian-crossing-lines.jpg",
    question:"White parallel stripes across the road mark?",
    options:["A stop line","A pedestrian crossing (zebra crossing) — you must yield to pedestrians on or approaching the crossing","A cycle lane","A give-way position"],
    answer:1, explanation:"A zebra crossing is marked by broad white stripes. You must yield to pedestrians who are on or clearly intending to cross. Do not park on or block a crossing." },

  { id:"m04", category:"markings", img:"pedestrian-crossing-ahead-lines.jpg",
    question:"Zigzag lines painted on the road approaching a pedestrian crossing mean?",
    options:["Slippery road surface","No parking or stopping — you are in the approach zone to a pedestrian crossing","Speed bump area","Bicycle lane begins"],
    answer:1, explanation:"Zigzag lines mark the approach to a pedestrian crossing. No vehicle may park or stop on these lines — the crossing approach must remain clear for visibility." },

  { id:"m05", category:"markings", img:"bicycle-crossing-guide-lines.jpg",
    question:"Dashed lines shaped like a bicycle path across an intersection mark?",
    options:["A pedestrian crossing","A bicycle crossing — cyclists may cross here and drivers must yield to them","A give-way line for cyclists","A no-entry zone for cyclists"],
    answer:1, explanation:"Bicycle crossing guide lines show the designated path for cyclists across an intersection. Drivers must yield to cyclists using the marked crossing." },

  { id:"m06", category:"markings", img:"box-junction.jpg",
    question:"Yellow criss-cross lines painted inside an intersection mean?",
    options:["You must stop here","Box junction — you must not enter unless your exit is clear","Speed limit zone","Taxi-only zone"],
    answer:1, explanation:"A box junction has yellow diagonal lines forming a box. You must not enter the box unless your exit is clear — blocking it obstructs cross traffic and is illegal." },

  { id:"m07", category:"markings", img:"painted-islands.jpg",
    question:"White painted chevrons or a painted island on the road surface mean?",
    options:["Park here safely","This area is off-limits to all traffic — do not drive on the painted island","Overtaking zone","Slow vehicle zone"],
    answer:1, explanation:"Painted islands separate traffic flows or protect turning traffic. You must not drive on them. Treat the painted island as if it were a physical island." },

  { id:"m08", category:"markings", img:"lane-line.jpg",
    question:"White dashed lines between lanes of traffic mean?",
    options:["No lane changing permitted","Lane divisions — you may change lanes when safe to do so","Bicycle lane boundary","Edge of the road"],
    answer:1, explanation:"Dashed white lane lines divide lanes of traffic. You may cross them to change lanes when it is safe. Do not change lanes where the dashes are replaced by a continuous line." },

  { id:"m09", category:"markings", img:"continuity-line.jpg",
    question:"A broken white line across the road at an intersection (wider gaps) indicates?",
    options:["A stop line","A give-way (yield) line — slow and give way if necessary, but stop only if required","A pedestrian crossing","An advanced stop line"],
    answer:1, explanation:"Continuity lines at intersections mark the give-way position. You do not have to stop unless traffic on the major road makes it necessary." },

  { id:"m10", category:"markings", img:"furication-arrows-bifurication-arrows.jpg",
    question:"Directional arrows painted on the road at a fork indicate?",
    options:["Speed limit direction","Which lane continues in which direction — position yourself in the correct lane before the fork","Overtaking is permitted","No lane changing beyond this point"],
    answer:1, explanation:"Bifurcation (fork) arrows on the road surface show which lane leads to which route at a fork. Get into the correct lane before the fork to avoid last-minute weaving." },

  // ── TEMPORARY SIGNS (YELLOW) ──────────────────────────────────────────────

  { id:"t01", category:"temporary", img:"yellow-speed-limit-sign.jpg",
    question:"What does a yellow-background speed limit sign mean?",
    options:["Advisory speed only","Temporary speed limit — currently in force due to roadworks or a special event, takes precedence over permanent signs","Speed limit for motorcycles","Night-time speed limit"],
    answer:1, explanation:"Yellow-background signs are temporary. This speed limit is in force due to roadworks or an event and you MUST obey it — it takes precedence over the permanent speed limit sign." },

  { id:"t02", category:"temporary", img:"yellow-100-speed-limit-sign.jpg",
    question:"A yellow sign showing 100 km/h means?",
    options:["Permanent 100 km/h zone","Temporary 100 km/h limit — currently in force, obey it","Minimum speed of 100 km/h","Advisory speed on a curve"],
    answer:1, explanation:"This temporary yellow sign sets a 100 km/h maximum during roadworks or an event. Obey it even if the permanent limit is higher." },

  { id:"t03", category:"temporary", img:"yellow-height-limit-sign.jpg",
    question:"A yellow height restriction sign means?",
    options:["Permanent height limit","Temporary height restriction — in force due to a structure, roadworks or low obstruction","Advisory height for large vehicles","Height limit for trucks only"],
    answer:1, explanation:"A yellow height restriction is temporary — perhaps due to temporary works, scaffolding, or a damaged bridge. It takes precedence over any permanent height limit." },

  { id:"t04", category:"temporary", img:"yellow-axle-mass-load-limits-sign.jpg",
    question:"A yellow sign showing axle mass limits means?",
    options:["Permanent mass restriction","Temporary axle load restriction — the road cannot currently support heavier loads due to works or damage","Advisory mass for bridges","Mass limit for construction vehicles only"],
    answer:1, explanation:"A yellow axle-mass limit is temporary and takes precedence over permanent mass signs. Overloaded vehicles risk damaging a compromised road surface and face prosecution." },

  { id:"t05", category:"temporary", img:"yellow-children-ahead-sign.jpg",
    question:"A yellow children-ahead sign differs from the standard version because?",
    options:["It applies only at night","It is a temporary sign — placed due to a specific event such as a school fête or sports day","It only applies to school buses","It warns of an unusual hazard"],
    answer:1, explanation:"Yellow temporary children-ahead signs are placed for specific events where children are present beyond normal school hours — such as a weekend sports event. Take them as seriously as permanent signs." },

  { id:"t06", category:"temporary", img:"yellow-pedestrians-ahead-sign.jpg",
    question:"What does a yellow pedestrians-ahead sign indicate?",
    options:["Permanent pedestrian hazard","Temporary pedestrians warning — placed for an event or temporary works causing pedestrians to use the road","Advisory warning only","Pedestrian crossing being constructed"],
    answer:1, explanation:"A yellow temporary pedestrians sign warns of a specific, short-term situation where pedestrians are on or near the road, such as a road race, festival, or roadworks." },

  { id:"t07", category:"temporary", img:"yellow-pedestrian-crossing-sign.jpg",
    question:"A yellow pedestrian crossing sign means?",
    options:["Permanent crossing ahead","Temporary pedestrian crossing in place — obey it as you would a permanent crossing","Advisory warning only","Crossing under construction"],
    answer:1, explanation:"Temporary pedestrian crossings are established during roadworks or events. You must yield to pedestrians at a temporary crossing just as you would at a permanent one." },

  { id:"t08", category:"temporary", img:"yellow-cyclists-ahead-sign.jpg",
    question:"A yellow cyclists sign is placed because?",
    options:["Permanent cycle hazard","A temporary condition (roadworks, event) has caused cyclists to share the road in that area","Advisory warning only","Cycle lane being built"],
    answer:1, explanation:"A yellow cyclists-ahead sign is placed temporarily for events such as cycle races or where roadworks have removed the cycle lane. Reduce speed and give cyclists extra space." },

  { id:"t09", category:"temporary", img:"yellow-traffic-lights-ahead-sign.jpg",
    question:"A yellow traffic lights ahead sign means?",
    options:["Permanent traffic lights","Temporary traffic lights have been installed — obey them as you would permanent lights","Traffic lights are faulty","Advisory warning — lights not enforced"],
    answer:1, explanation:"Temporary traffic lights are often installed at roadworks sites where the road is reduced to one lane. They must be obeyed exactly like permanent signals." },

  { id:"t10", category:"temporary", img:"yellow-traffic-control-stop-ahead-sign.jpg",
    question:"A yellow stop-ahead sign means?",
    options:["Permanent stop control ahead","Temporary STOP control ahead — a portable stop sign or traffic controller is managing traffic","Advisory slowing","Road closed ahead"],
    answer:1, explanation:"A yellow stop-ahead sign warns of a temporary STOP point — often a STOP/GO operator at roadworks. You must stop when required." },

  { id:"t11", category:"temporary", img:"yellow-traffic-control-yield-ahead-sign.jpg",
    question:"A yellow yield-ahead sign means?",
    options:["Permanent yield control ahead","Temporary YIELD control ahead — give way as directed by the sign or traffic controller","Advisory caution only","Road merges ahead"],
    answer:1, explanation:"A temporary yield-ahead sign warns of temporary traffic management where you will need to give way. Treat it with the same respect as a permanent yield sign." },

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
    const isCorrectSign = optIdx === q.answer;
    if (isCorrectSign) setScore(s => s + 1);
    recordResult(isCorrectSign, 'signs');
    recordAnswer(stableId(q, 'sign_'), isCorrectSign);
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
  const accent = cat?.color ?? T.gold;

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", padding: "0 16px 40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ color: T.dim, fontSize: 13, fontFamily: T.mono }}>Q {idx + 1} / {questions.length}</div>
        {timed && !revealed && <div style={{ color: timeLeft <= 10 ? T.red : T.gold, fontSize: 20, fontFamily: T.mono, fontWeight: 700 }}>{timeLeft}s</div>}
        <div style={{ color: T.dim, fontSize: 13, fontFamily: T.mono }}>Score: {score}</div>
      </div>
      <div style={{ background: T.border, height: 4, borderRadius: 2, marginBottom: 24 }}>
        <div style={{ width: `${((idx + 1) / questions.length) * 100}%`, height: "100%", borderRadius: 2, background: accent, transition: "width 0.3s" }} />
      </div>
      <div style={{ background: T.surface, border: `2px solid ${T.border}`, borderRadius: 8, padding: "28px 20px", marginBottom: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div style={{ color: accent, fontSize: 11, letterSpacing: 3, fontFamily: T.mono, textTransform: "uppercase" }}>{cat?.label}</div>
        <SignImg src={q.img} alt={q.question} size={140} />
        <div style={{ color: T.text, fontSize: 17, fontWeight: 600, textAlign: "center", lineHeight: 1.5, fontFamily: T.font }}>{q.question}</div>
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
            <button key={i} onClick={() => handleAnswer(i)} disabled={revealed} style={{ background: bg, border: `2px solid ${border}`, borderRadius: 6, padding: "13px 16px", textAlign: "left", cursor: revealed ? "default" : "pointer", color, fontSize: 15, fontFamily: T.font, lineHeight: 1.4, transition: "border-color 0.15s, background 0.15s" }}>
              <span style={{ color: T.dim, fontFamily: T.mono, marginRight: 10 }}>{String.fromCharCode(65 + i)}.</span>{opt}
            </button>
          );
        })}
      </div>
      {revealed && (
        <div>
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderLeft: `4px solid ${selected === q.answer ? T.green : T.red}`, borderRadius: 4, padding: "14px 16px", marginBottom: 16 }}>
            <div style={{ color: selected === q.answer ? T.green : T.red, fontSize: 12, letterSpacing: 1, fontFamily: T.mono, marginBottom: 6 }}>
              {selected === q.answer ? "CORRECT" : selected === -1 ? "TIME'S UP" : "INCORRECT"}
            </div>
            <div style={{ color: T.dim, fontSize: 14, lineHeight: 1.7, fontFamily: T.font }}>{q.explanation}</div>
          </div>
          <button onClick={next} style={{ width: "100%", padding: "14px 0", background: accent, border: "none", borderRadius: 6, cursor: "pointer", color: "#000", fontSize: 15, fontWeight: 700, fontFamily: T.font }}>
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
      <div style={{ fontSize: 64, fontWeight: 700, color: passed ? T.green : T.red, fontFamily: T.mono, marginBottom: 8 }}>{pct}%</div>
      <div style={{ color: T.text, fontSize: 22, fontWeight: 700, marginBottom: 8, fontFamily: T.font }}>{score} / {total} correct</div>
      <div style={{ color: passed ? T.green : T.red, fontSize: 16, marginBottom: 32, fontFamily: T.font }}>{passed ? "Well done — you passed!" : "Keep practising — aim for 70%+"}</div>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <button onClick={onRetry} style={{ padding: "12px 28px", background: T.gold, border: "none", borderRadius: 6, cursor: "pointer", color: "#000", fontSize: 15, fontWeight: 700, fontFamily: T.font }}>Try Again</button>
        <button onClick={onHome} style={{ padding: "12px 28px", background: T.surface, border: `2px solid ${T.border}`, borderRadius: 6, cursor: "pointer", color: T.text, fontSize: 15, fontFamily: T.font }}>← Home</button>
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
  const accent = cat?.color ?? T.gold;

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", padding: "0 16px 40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <button onClick={onBack} style={{ background: "none", border: `1px solid ${T.border}`, color: T.dim, padding: "6px 14px", borderRadius: 4, cursor: "pointer", fontSize: 13, fontFamily: T.font }}>← Back</button>
        <div style={{ color: T.dim, fontSize: 13, fontFamily: T.mono }}>{idx + 1} / {questions.length}</div>
      </div>
      <div style={{ background: T.surface, border: `2px solid ${accent}`, borderRadius: 8, padding: "28px 20px", textAlign: "center", marginBottom: 16 }}>
        <div style={{ color: accent, fontSize: 11, letterSpacing: 3, fontFamily: T.mono, textTransform: "uppercase", marginBottom: 16 }}>{cat?.label}</div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <SignImg src={q.img} alt={q.question} size={150} />
        </div>
        <div style={{ color: T.text, fontSize: 17, fontWeight: 600, fontFamily: T.font, marginBottom: 12 }}>{q.question}</div>
        <div style={{ background: "#0A1A0F", borderRadius: 6, padding: "12px 16px", color: T.gold, fontSize: 15, fontFamily: T.font, fontWeight: 700, marginBottom: 12 }}>
          {q.options[q.answer]}
        </div>
        <div style={{ color: T.dim, fontSize: 14, lineHeight: 1.7, fontFamily: T.font }}>{q.explanation}</div>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0} style={{ flex: 1, padding: "12px 0", background: T.surface, border: `2px solid ${T.border}`, borderRadius: 6, cursor: idx === 0 ? "default" : "pointer", color: idx === 0 ? T.border : T.text, fontSize: 15, fontFamily: T.font }}>← Previous</button>
        <button onClick={() => setIdx(i => Math.min(questions.length - 1, i + 1))} disabled={idx === questions.length - 1} style={{ flex: 1, padding: "12px 0", background: accent, border: "none", borderRadius: 6, cursor: idx === questions.length - 1 ? "default" : "pointer", color: "#000", fontSize: 15, fontWeight: 700, fontFamily: T.font, opacity: idx === questions.length - 1 ? 0.4 : 1 }}>Next →</button>
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
      <div style={{ color: T.dim, fontSize: 11, letterSpacing: 3, marginBottom: 20, fontFamily: T.mono, textTransform: "uppercase" }}>Choose a mode</div>
      <div style={{ background: T.surface, border: `2px solid ${T.gold}`, borderRadius: 8, padding: "22px 20px", marginBottom: 14 }}>
        <div style={{ color: T.gold, fontSize: 11, letterSpacing: 3, fontFamily: T.mono, textTransform: "uppercase", marginBottom: 8 }}>EXAM MODE</div>
        <div style={{ color: T.text, fontSize: 18, fontWeight: 700, marginBottom: 6, fontFamily: T.font }}>All Signs — Mixed Quiz</div>
        <div style={{ color: T.dim, fontSize: 14, lineHeight: 1.6, marginBottom: 16, fontFamily: T.font }}>{QUESTIONS.length} questions covering all sign categories, shuffled at random. Pass mark: 70%.</div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => onStart("exam", null, false)} style={{ padding: "10px 22px", background: T.gold, border: "none", borderRadius: 5, cursor: "pointer", color: "#000", fontSize: 14, fontWeight: 700, fontFamily: T.font }}>Start Quiz</button>
          <button onClick={() => onStart("exam", null, true)} style={{ padding: "10px 22px", background: T.surface, border: `2px solid ${T.gold}`, borderRadius: 5, cursor: "pointer", color: T.gold, fontSize: 14, fontFamily: T.font }}>⏱ Timed (30s)</button>
        </div>
      </div>
      <div style={{ color: T.dim, fontSize: 11, letterSpacing: 3, margin: "24px 0 14px", fontFamily: T.mono, textTransform: "uppercase" }}>Drill by category</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {CATEGORIES.map(cat => (
          <div key={cat.id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderLeft: `4px solid ${cat.color}`, borderRadius: 6, padding: "16px 18px" }}>
            <div style={{ color: cat.color, fontSize: 11, letterSpacing: 2, fontFamily: T.mono, marginBottom: 4 }}>{counts[cat.id] ?? 0} questions</div>
            <div style={{ color: T.text, fontSize: 17, fontWeight: 700, fontFamily: T.font }}>{cat.label}</div>
            <div style={{ color: T.dim, fontSize: 13, lineHeight: 1.5, marginTop: 4, marginBottom: 12, fontFamily: T.font }}>{cat.desc}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={() => onStart("category", cat.id, false)} style={{ padding: "8px 18px", background: cat.color, border: "none", borderRadius: 4, cursor: "pointer", color: "#000", fontSize: 13, fontWeight: 700, fontFamily: T.font }}>Quiz</button>
              <button onClick={() => onStart("category", cat.id, true)} style={{ padding: "8px 18px", background: T.surface, border: `1px solid ${cat.color}`, borderRadius: 4, cursor: "pointer", color: cat.color, fontSize: 13, fontFamily: T.font }}>⏱ Timed</button>
              <button onClick={() => onStart("study", cat.id, false)} style={{ padding: "8px 18px", background: "transparent", border: `1px solid ${T.border}`, borderRadius: 4, cursor: "pointer", color: T.dim, fontSize: 13, fontFamily: T.font }}>Study mode</button>
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
      setActiveQuestions(prepareAll(shuffle(pool)));
      setScreen("quiz");
    }
  }

  function handleFinish(score) {
    setFinalScore(score);
    if (Math.round((score / activeQuestions.length) * 100) >= 70 && onPass) onPass();
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
          <button onClick={screen === "home" ? onBack : () => setScreen("home")} style={{ background: "none", border: "none", color: T.dim, cursor: "pointer", fontSize: 20, padding: "4px 8px" }}>←</button>
          <div style={{ color: T.gold, fontSize: 16, fontWeight: 700, fontFamily: T.font }}>Road Signs Quiz</div>
          <div style={{ width: 36 }} />
        </div>
      </div>
      <div style={{ paddingTop: 24 }}>
        {screen === "home" && <HomeScreen onStart={handleStart} />}
        {screen === "quiz" && <QuizEngine questions={activeQuestions} onFinish={handleFinish} timed={timed} />}
        {screen === "result" && <ResultScreen score={finalScore} total={activeQuestions.length} onRetry={() => { setActiveQuestions(q => prepareAll(shuffle([...q]))); setScreen("quiz"); }} onHome={() => setScreen("home")} />}
        {studyCatId && <StudyMode catId={studyCatId} onBack={() => setScreen("home")} />}
      </div>
    </div>
  );
}
