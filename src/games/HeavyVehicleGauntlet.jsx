import { useState, useEffect, useRef } from "react";
import { incrementQuestionCount } from "../freemium.js";
import FreemiumGate from "../components/FreemiumGate.jsx";
import AITutor from "../components/AITutor.jsx";
import { prepareAll, stableId } from '../utils/quizHelpers.js';
import { recordResult } from '../utils/progressHistory.js';
import { recordAnswer } from '../utils/spacedRepetition.js';

// ── Code 10/14 Heavy Vehicle Question Bank ────────────────────────────────────
const TESTS = [
  {
    id: 1,
    title: "ROUND 1: LICENCE CODES & RESTRICTIONS",
    subtitle: "Code 10, Code 14, age requirements, PDP",
    color: "#FFB612",
    questions: [
      {
        q: "What is the minimum age to obtain a Code 10 driver's licence?",
        options: ["17 years","18 years","19 years","21 years"],
        answer: 1,
        explain: "Code 10 (heavy motor vehicle) minimum age = 18. Code 14 (extra heavy) also minimum 18. Code 8 (light vehicle) minimum = 18 for full licence.",
      },
      {
        q: "Which licence code covers rigid trucks between 3 500 kg GVM and 16 000 kg GVM?",
        options: ["Code 8","Code 10","Code 14","Code 3"],
        answer: 1,
        explain: "Code 10 = heavy motor vehicle. Code 14 = extra heavy motor vehicle (including articulated trucks). Code 8 = light motor vehicle (up to 3 500 kg GVM).",
      },
      {
        q: "You hold a Code 14 licence. Are you authorised to drive a Code 10 vehicle?",
        options: ["No — each code only covers its specific vehicle class","Yes — higher codes authorise the driving of all lower code vehicles","Only if your Code 14 is endorsed for Code 10","Only with an additional permit"],
        answer: 1,
        explain: "Higher codes include lower codes. A Code 14 holder may drive Code 14, Code 10, and Code 8 vehicles. A Code 10 holder may drive Code 10 and Code 8 vehicles.",
      },
      {
        q: "What is a Professional Driving Permit (PDP) and when is it required?",
        options: ["Required for all drivers over 65 years of age","Required for drivers transporting passengers for reward, dangerous goods, or operating certain heavy vehicles commercially","Required whenever carrying more than 500 kg of goods","Required only on national routes and freeways"],
        answer: 1,
        explain: "A PDP is required for: transporting passengers for reward (taxis, buses), transporting dangerous goods, operating motor vehicles for reward above certain thresholds. It is in addition to your driver's licence.",
      },
      {
        q: "Your Code 10 learner's licence was issued today. How long is it valid?",
        options: ["12 months","18 months","24 months","36 months"],
        answer: 2,
        explain: "All learner's licences in South Africa are valid for 24 months from the date of issue — regardless of vehicle code.",
      },
      {
        q: "You drive a rigid truck with a GVM of 14 000 kg. Which licence do you require?",
        options: ["Code 8","Code 10","Code 14","Code 3"],
        answer: 1,
        explain: "A vehicle with GVM above 3 500 kg = heavy motor vehicle = Code 10 (for rigid trucks). Code 14 is for extra heavy (articulated/combination) vehicles.",
      },
      {
        q: "For a Code 10 learner's licence, who must accompany and supervise you?",
        options: ["Any person over 18 with any valid licence","A person holding a valid Code 10 or Code 14 driver's licence","A person holding any valid driver's licence for at least 2 years","No supervisor needed — Code 10 learners may drive alone on public roads"],
        answer: 1,
        explain: "A Code 10 learner must be accompanied by a qualified driver holding a valid Code 10 or Code 14 licence. A Code 8 holder cannot supervise a Code 10 learner.",
      },
      {
        q: "A Code 14 licence covers which type of vehicle?",
        options: ["Rigid trucks up to 16 000 kg only","Extra heavy motor vehicles including articulated combinations and road trains","All heavy motor vehicles including buses","Buses and minibus taxis only"],
        answer: 1,
        explain: "Code 14 = extra heavy motor vehicle (GVM above 16 000 kg), including articulated trucks (semi-trucks), road trains, and combinations. The highest standard road-going licence code.",
      },
      {
        q: "You are 20 years old and wish to apply for a Code 14 learner's licence. Are you eligible?",
        options: ["No — Code 14 requires a minimum age of 21","Yes — minimum age is 18 and you qualify","No — you must first hold a Code 10 for at least 1 year","No — Code 14 minimum age is 25"],
        answer: 1,
        explain: "Minimum age for Code 14 learner's licence = 18. At 20, you are eligible. There is no requirement to first hold a Code 10 licence.",
      },
      {
        q: "Does carrying a load on your Code 10 truck that exceeds the vehicle's registered GVM require a special permit?",
        options: ["No — drivers may exceed GVM by up to 10%","Yes — you must obtain an abnormal load permit to exceed your registered GVM","No — as long as the load is secured properly","Yes — but only on national routes"],
        answer: 1,
        explain: "Exceeding a vehicle's GVM (Gross Vehicle Mass) is illegal without an abnormal load permit. Operating overloaded is a serious offence and void of insurance.",
      },
    ],
  },
  {
    id: 2,
    title: "ROUND 2: VEHICLE FITNESS & EQUIPMENT",
    subtitle: "Brakes, tyres, lights, dimensions for heavy vehicles",
    color: "#DE3831",
    questions: [
      {
        q: "A Code 10 truck must carry which fire extinguisher on board?",
        options: ["No legal requirement — fire extinguishers are optional","At least one approved fire extinguisher in a readily accessible position","Two fire extinguishers, one in the cab and one on the chassis","A fire extinguisher only if carrying dangerous goods"],
        answer: 1,
        explain: "All heavy motor vehicles must carry at least one approved fire extinguisher in an easily accessible position. For dangerous goods vehicles the requirement is stricter.",
      },
      {
        q: "What is the maximum width of a heavy motor vehicle in South Africa?",
        options: ["2.0 metres","2.5 metres","3.0 metres","No maximum — permit required only above 3.5m"],
        answer: 1,
        explain: "Maximum width = 2.5 metres. A vehicle wider than 2.5m requires an abnormal load permit. This applies to the body of the vehicle including mirrors counted separately in some interpretations.",
      },
      {
        q: "A Code 10 truck must be equipped with how many warning triangles?",
        options: ["None — triangles are optional for heavy vehicles","At least two warning triangles or flares","At least three warning triangles","One triangle — placed 45 metres behind the vehicle"],
        answer: 1,
        explain: "Heavy motor vehicles must carry at least 2 warning triangles (or road flares). Place them at least 45 metres behind the vehicle when broken down on a road.",
      },
      {
        q: "At what maximum speed may a heavy motor vehicle travel on a freeway?",
        options: ["100 km/h","110 km/h","120 km/h","80 km/h"],
        answer: 0,
        explain: "Heavy motor vehicles (Code 10/14) are limited to 100 km/h on freeways. Light vehicles may travel at 120 km/h. This lower limit accounts for longer braking distances.",
      },
      {
        q: "Your truck's air brakes fail while descending a steep grade. What is the correct emergency procedure?",
        options: ["Switch off the engine immediately","Apply the parking/hand brake steadily, use engine braking (low gear), and look for a safe escape route or run-off","Pump the brake pedal repeatedly to rebuild pressure","Swerve off the road at the first available exit"],
        answer: 1,
        explain: "On brake failure downhill: apply parking brake gently (avoid locking wheels), use engine braking (downshift), look for an escape ramp or flat area to stop safely. Never switch off the engine as you lose power steering.",
      },
      {
        q: "What is the maximum height of a heavy motor vehicle (excluding special vehicles)?",
        options: ["3.8 metres","4.0 metres","4.3 metres","4.65 metres"],
        answer: 2,
        explain: "Maximum height = 4.3 metres (standard). Double-decker buses = 4.65 metres (with permit). This is a critical measurement for bridges and underpasses.",
      },
      {
        q: "A heavy vehicle is required to have a reflective tape/marker at the rear. What colour?",
        options: ["Red reflective tape on the rear","Yellow and red alternating tape at the rear","Orange reflective tape on all four sides","White reflective tape at the front, red at the rear"],
        answer: 0,
        explain: "Heavy vehicles must have red retro-reflective tape/markers at the rear (and yellow on the sides for some configurations) to make them visible at night. Red = rear, yellow = sides.",
      },
      {
        q: "A Code 14 articulated truck has a total combination length of 19 metres. Is this legal?",
        options: ["No — maximum combination length is 18.5 metres","Yes — 18.5 to 22 metres is permitted for standard articulated combinations","No — maximum is 16 metres","Yes — there is no maximum length for Code 14 vehicles"],
        answer: 1,
        explain: "Maximum length: articulated (semi-truck) = 18.5m. Full combinations (road trains) = up to 22m with permit. Standard urban-legal articulated combination is 18.5m.",
      },
      {
        q: "What minimum tread depth is required on tyres of heavy motor vehicles?",
        options: ["0.5mm across the full width","1.0mm across the central three-quarters of the tread","1.6mm across the full tread width","2.0mm in the central groove"],
        answer: 1,
        explain: "Minimum tyre tread depth = 1.0mm across the central 3/4 of the tread width. This applies to all motor vehicles in South Africa including heavy vehicles. Below this = illegal and extremely dangerous.",
      },
      {
        q: "Your heavy truck's dipped headlamps must allow visibility of objects at least how far ahead?",
        options: ["30 metres","45 metres","60 metres","100 metres"],
        answer: 1,
        explain: "Dipped beam = 45m visibility ahead. Main beam (bright) = 100m. These distances are the same for all vehicles — car, truck or motorcycle.",
      },
    ],
  },
  {
    id: 3,
    title: "ROUND 3: DRIVING RULES & ROAD BEHAVIOUR",
    subtitle: "Following distance, overtaking, stopping, reversing",
    color: "#4472CA",
    questions: [
      {
        q: "You are driving a fully loaded Code 10 truck at 80 km/h. What is the minimum safe following distance?",
        options: ["3 seconds (same as all vehicles)","4–6 seconds — heavy vehicles need more space to stop","10 car lengths","15 metres for every 10 km/h of speed"],
        answer: 1,
        explain: "Heavy vehicles take much longer to stop due to their mass. K53 recommends at least 4–6 seconds following distance for heavy vehicles. In wet or poor conditions, extend this even further.",
      },
      {
        q: "You are driving a Code 14 articulated truck and want to turn left. Where should you position your truck before the turn?",
        options: ["Far left, exactly like any other vehicle","You may need to swing right first to give your trailer clearance for the left turn — check mirrors carefully","Stay in the centre lane until you begin the turn","Move as far left as possible 500m before the intersection"],
        answer: 1,
        explain: "Large trucks must sometimes take a wider arc on turns. Before turning left, check mirrors for cyclists and motorcyclists in your blind spot. You may need to swing slightly right to clear the kerb — but ALWAYS check first.",
      },
      {
        q: "When reversing a large truck, what is the SAFEST approach?",
        options: ["Reverse quickly to minimise time in traffic","Use a banksman (spotter) outside the vehicle to guide you whenever possible","Only reverse on one-way roads","Reverse using the left mirror only — it gives the widest view"],
        answer: 1,
        explain: "Always use a banksman when reversing in complex or busy situations. Never reverse for longer than necessary. Check ALL mirrors. Never reverse on a freeway — use the next exit.",
      },
      {
        q: "You are driving a Code 10 truck and the vehicle behind you flashes its lights. What does this typically indicate?",
        options: ["They are greeting you","They want to overtake — you should move left and reduce speed to allow them to pass","They are warning you of a hazard ahead","They are angry at your speed"],
        answer: 1,
        explain: "Flashing lights = request to overtake. Move left when it is safe to do so, reduce speed slightly, and allow the vehicle to pass. On uphill sections, maintain momentum but give space.",
      },
      {
        q: "You park your Code 10 truck on the road at night (not near a street lamp). What lights must remain on?",
        options: ["Hazard lights only","Parking lights (position lamps) front and rear, OR hazard lights if the truck is a hazard to traffic","Only the rear red lights","No lights required if you are parked on the left",""],
        answer: 1,
        explain: "When parked on a road at night: position lamps front and rear must be on. If parked in a hazardous position, hazard warning lights must flash. Unlike cars, exemptions for street lamp proximity have conditions for HMVs.",
      },
      {
        q: "What speed limit applies to heavy motor vehicles on an open road (non-freeway) where no speed limit sign is posted?",
        options: ["80 km/h","100 km/h (same as all vehicles)","90 km/h","70 km/h"],
        answer: 0,
        explain: "Heavy motor vehicles (Code 10/14) are limited to 80 km/h on open roads where no specific sign is posted. Light vehicles are limited to 100 km/h. This lower limit is for safety given braking distances.",
      },
      {
        q: "You are driving a heavily laden truck downhill. Which technique helps control speed safely?",
        options: ["Apply the service brake continuously and firmly","Use engine braking by selecting a lower gear before the descent","Switch to neutral to reduce fuel consumption on the hill","Apply the parking brake partially to create drag"],
        answer: 1,
        explain: "Always select a lower gear BEFORE a descent — not halfway down. Engine braking controls speed without overheating the service brakes. Using only service brakes on a long descent causes brake fade and failure.",
      },
      {
        q: "You need to stop your truck for a break on the highway. Where may you legally park?",
        options: ["On the hard shoulder (emergency lane) as long as hazards are on","At an official truck stop, rest area, or off the road entirely","In the left lane with hazards on","On any wide verge that accommodates the truck"],
        answer: 1,
        explain: "Parking on the hard shoulder (emergency lane) is ONLY permitted for genuine breakdowns. For rest stops, use official truck stops or rest areas. Parking in the emergency lane is dangerous and illegal for routine stops.",
      },
      {
        q: "When driving through a poorly lit tunnel, what lights must a heavy vehicle use?",
        options: ["Hazard lights only","Dipped headlamps (low beam)","Full high beam for maximum visibility","No change required from normal day driving"],
        answer: 1,
        explain: "In tunnels: dipped headlamps (low beam) must be on. High beam in a tunnel blinds oncoming drivers in the confined space. Hazard lights should NOT be used while moving — they disorient other drivers.",
      },
      {
        q: "What is the maximum speed limit for heavy motor vehicles in an urban area where no other sign is posted?",
        options: ["40 km/h","60 km/h (same as all vehicles)","50 km/h","80 km/h"],
        answer: 1,
        explain: "The default urban speed limit is 60 km/h for ALL vehicles including heavy motor vehicles. The specific open-road and freeway limits are lower for HMVs (80/100 km/h) but the urban limit remains 60 km/h.",
      },
    ],
  },
  {
    id: 4,
    title: "ROUND 4: LOADING, MASS & DIMENSIONS",
    subtitle: "GVM, axle loads, securing cargo, overloads",
    color: "#007A4D",
    questions: [
      {
        q: "What is the maximum GVM threshold that separates a light motor vehicle from a heavy motor vehicle?",
        options: ["2 500 kg","3 000 kg","3 500 kg","4 500 kg"],
        answer: 2,
        explain: "The LMV/HMV dividing line = 3 500 kg GVM. At or below 3 500 kg = light motor vehicle (Code 8). Above 3 500 kg = heavy motor vehicle (Code 10/14).",
      },
      {
        q: "You discover your truck is overloaded at a weigh-bridge. Who is legally responsible?",
        options: ["Only the loading company","Only the driver","Both the driver AND the operator can be held liable","Only the vehicle owner"],
        answer: 2,
        explain: "The DRIVER is responsible for the vehicle they operate, including its laden mass. The OPERATOR/EMPLOYER is also responsible. Both can face prosecution. Never drive a vehicle you know to be overloaded.",
      },
      {
        q: "Cargo on an open truck must be secured to prevent it from shifting or falling. How far back from the rear of the load must warning flags or lights extend when the load overhangs?",
        options: ["At least 300mm past the end of the load","At least 150mm past the end of the load","No flag required if hazard lights are on","At least 500mm past the end of the load"],
        answer: 0,
        explain: "An overhanging load must have a red flag or light extending at least 300mm beyond the end of the projection so following traffic can see it clearly.",
      },
      {
        q: "What maximum projection is permitted at the FRONT of a vehicle for a load?",
        options: ["300mm","500mm","No front overhang is permitted","750mm"],
        answer: 0,
        explain: "Maximum forward load projection = 300mm from the front of the vehicle. Rear overhang allowances are different (typically 1/3 of the wheelbase or 1.8m with flag).",
      },
      {
        q: "A truck is carrying a load that projects more than 1.8 metres behind the rear axle. What is REQUIRED?",
        options: ["Hazard lights on only","An abnormal load permit, escort vehicle, and appropriate markings","A red flag only","A police escort at all times"],
        answer: 1,
        explain: "A load projecting more than 1.8m behind the rear = abnormal load. Requires permit, markings, and often an escort vehicle. A red flag alone is not sufficient.",
      },
      {
        q: "At what maximum rear axle load (per standard single axle) is most road infrastructure in SA designed?",
        options: ["6 000 kg","8 000 kg","10 000 kg","12 000 kg"],
        answer: 2,
        explain: "Standard single axle limit = 10 000 kg (10 tonnes). Tandem axles = typically 18 000 kg combined. Exceeding these limits damages road infrastructure and requires permits.",
      },
      {
        q: "You need to transport a load that requires your truck to travel at less than 40 km/h. What must you do?",
        options: ["It is illegal to operate below 40 km/h on a public road","Use hazard lights and place warning triangles ahead and behind your vehicle","Apply for a special speed permit","Operate only at night when traffic is lighter"],
        answer: 1,
        explain: "A vehicle moving slower than normal traffic is a hazard. Use hazard warning lights and consider placing triangles to warn approaching traffic. The police may need to be notified for very slow movement on major routes.",
      },
      {
        q: "You are loading a flatbed truck. The load must be:",
        options: ["Simply placed on the truck — load limits prevent shifting","Secured with straps, chains, or containment so it cannot shift, fall or cause a hazard","Covered with a tarpaulin if it is higher than the cab","Distributed evenly only if the total mass exceeds 5 000 kg"],
        answer: 1,
        explain: "ALL loads must be properly secured to prevent shifting or falling regardless of mass. An unsecured load that falls and causes an accident makes the driver/operator criminally and civilly liable.",
      },
      {
        q: "A liquid tanker truck is half full. This creates which specific driving hazard?",
        options: ["No specific hazard — a half load is safer","A surge/slosh effect where liquid shifts on braking/turning, making the vehicle harder to control","The empty space reduces the centre of gravity making rollover less likely","The truck brakes harder due to lower mass"],
        answer: 1,
        explain: "A partially-filled liquid tanker creates surge (sloshing). Liquid surges forward under braking and sideways on turns, causing instability and potentially violent handling. Requires careful, smooth driving.",
      },
      {
        q: "You are driving a Code 14 combination vehicle. The trailer brakes fail. What is the safest immediate action?",
        options: ["Apply the truck brakes hard to stop as fast as possible","Reduce speed gradually using engine braking, apply truck brakes gently, and pull over safely when speed is controlled","Disconnect the trailer immediately","Accelerate away from the trailer"],
        answer: 1,
        explain: "Trailer brake failure: gently reduce speed using engine braking and gradual truck brake application. Hard braking = jackknife risk. Pull over once speed is controlled. Never disconnect a moving trailer.",
      },
    ],
  },
  {
    id: 5,
    title: "ROUND 5: HAZARDS, ACCIDENTS & EMERGENCIES",
    subtitle: "Breakdown procedure, accidents, fatigue, dangerous conditions",
    color: "#6c47ff",
    questions: [
      {
        q: "Your Code 10 truck breaks down on a freeway at night. What is the CORRECT procedure?",
        options: ["Stay in the vehicle with hazard lights on","Switch on hazard lights, place warning triangles 45m+ behind the vehicle, exit the vehicle from the safe side, and call for help","Push the truck onto the shoulder then call for help","Flash hazard lights and wait in the fast lane until help arrives"],
        answer: 1,
        explain: "Breakdown on freeway: hazard lights ON immediately, exit safely (away from traffic), place triangles at 45m+ intervals behind the vehicle, stand on the embankment away from the road. NEVER stand between your truck and oncoming traffic.",
      },
      {
        q: "As a professional truck driver, what is your legal obligation regarding driving hours to prevent fatigue?",
        options: ["No specific limit — professional drivers decide for themselves","Maximum 10 consecutive driving hours then minimum 8 hours rest; never exceed 16 hours between sleep periods","Maximum 8 hours per day","Maximum 500km per driving stint"],
        answer: 1,
        explain: "South African regulations limit professional drivers: maximum 10 hours driving in a day, with mandatory rest breaks. The exact requirements are in the Hours of Driving regulations under the RTMC. Fatigue is a leading cause of truck accidents.",
      },
      {
        q: "You are involved in a serious accident causing injury. You are not injured. What is your FIRST obligation?",
        options: ["Take photos of the scene before moving anything","Move your truck off the road immediately","Stop, render assistance to injured persons, and notify the police/emergency services","Exchange insurance details with all parties first"],
        answer: 2,
        explain: "STOP. Render reasonable assistance to injured persons. Call emergency services (10111 / 112). Secure the scene. Details and investigations come after life-saving obligations.",
      },
      {
        q: "You see a red triangle warning sign on the road. What does it indicate?",
        options: ["Stop and yield to oncoming traffic","Warning of a hazard ahead — proceed with caution and reduce speed","A construction zone with workers present","A compulsory stop for checking permits"],
        answer: 1,
        explain: "Warning triangles (temporary signs placed on the road) indicate a hazard such as a breakdown or accident ahead. Reduce speed, proceed with caution, be prepared to stop.",
      },
      {
        q: "Your truck's brakes overheat on a long steep descent. You smell burning and the brakes feel 'soft'. What must you do?",
        options: ["Apply the brakes harder to build up heat-induced braking force","Stop immediately in a safe place, allow brakes to cool, do NOT drive on overheated brakes","Switch to neutral to give the brakes a rest","Increase speed to reduce descent time"],
        answer: 1,
        explain: "Overheated brakes suffer 'fade' — they lose effectiveness. STOP safely, allow brakes to cool for at least 20–30 minutes. Driving on faded brakes is extremely dangerous. Use engine braking to prevent overheating on the next descent.",
      },
      {
        q: "You are approaching a low bridge (3.8m clearance marked). Your truck is 4.0m high. What must you do?",
        options: ["Proceed carefully at a slow speed — the sign may be inaccurate","Do NOT pass under the bridge — find an alternative route","Deflate your tyres slightly to reduce vehicle height","Sound the hooter and proceed quickly"],
        answer: 1,
        explain: "If your vehicle exceeds the stated clearance, NEVER attempt to pass under the bridge. Vehicle heights are measured when fully loaded and tyres are at correct pressure. Striking a bridge can kill, cause structural damage, and result in criminal charges.",
      },
      {
        q: "During an inspection, you discover one of your trailer's rear lights is not working. May you continue your journey?",
        options: ["Yes — trailers have secondary lighting systems","Yes — during daylight hours only","No — you must have all lights in working order before continuing","Only if the journey ends before sunset"],
        answer: 2,
        explain: "All required lights must be in working order before driving. Driving with defective lights is illegal and dangerous — especially critical on a trailer where following vehicles depend on brake lights and indicators.",
      },
      {
        q: "You experience a sudden tyre blowout on your Code 10 truck at highway speed. What is the correct response?",
        options: ["Apply full brakes immediately to stop as fast as possible","Grip the steering wheel firmly, do NOT brake suddenly, gradually reduce speed, steer to the left, and stop safely","Accelerate briefly to stabilise the vehicle then brake","Immediately apply the parking brake"],
        answer: 1,
        explain: "Blowout at speed: grip the wheel firmly — the truck may pull strongly to the blowout side. Ease off the accelerator. Do NOT brake suddenly (this can cause jackknife). Allow speed to reduce, then steer left to stop safely.",
      },
      {
        q: "You are driving on a wet road and your truck starts to skid. What is the first thing to do?",
        options: ["Brake hard to reduce speed","Steer into the skid and release the brakes to regain traction","Accelerate to power through the skid","Switch off the engine to reduce wheel torque"],
        answer: 1,
        explain: "On a skid: ease off brakes and accelerator, steer in the direction the rear of the vehicle is sliding (steer into the skid). Braking on a skid makes it worse. Recover traction first, then steer back to your intended path.",
      },
      {
        q: "What is the maximum length of a rigid (non-articulated) heavy motor vehicle?",
        options: ["12 metres","13.5 metres","16 metres","18.5 metres"],
        answer: 0,
        explain: "A rigid (non-articulated) heavy vehicle maximum length = 12 metres. Articulated = 18.5m. A B-train combination = 22m with permit. Rigid vehicle including any drawbar = 13.5m maximum.",
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

function buildExamQuestions(count = 50) {
  const all = TESTS.flatMap(t => t.questions.map(q => ({ ...q, roundColor: t.color, roundTitle: t.title })));
  return shuffle(all).slice(0, count);
}

export default function HeavyVehicleGauntlet({ onBack, onPass }) {
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
  const passedFiredRef = useRef(false);
  const [preparedQs, setPreparedQs] = useState([]);

  const currentTest = isExamMode ? null : TESTS[testIndex];
  const currentQ = preparedQs[qIndex] ?? (isExamMode ? examQuestions[qIndex] : currentTest?.questions[qIndex]);
  const totalQ = isExamMode ? examQuestions.length : currentTest?.questions.length;

  useEffect(() => {
    if (timedMode && screen === "quiz" && !answered) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            handleTimeUp();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIndex, screen, answered, timedMode]);

  const handleTimeUp = () => {
    setAnswered(true);
    setShowExplain(true);
    setCurrentStreak(0);
    setWrongAnswers(p => [...p, { q: currentQ.q, yourAnswer: "⏱ TIME RAN OUT", correctAnswer: currentQ.options[currentQ.answer], explain: currentQ.explain }]);
  };

  const handleSelect = (i) => {
    if (answered) return;
    if (!incrementQuestionCount()) { setShowGate(true); return; }
    clearInterval(timerRef.current);
    setSelected(i);
    setAnswered(true);
    const correct = i === currentQ.answer;
    recordResult(correct, 'heavy');
    recordAnswer(stableId(currentQ, 'hv_'), correct);
    if (correct) {
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
    setPreparedQs(prepareAll(TESTS[index].questions));
    setTestIndex(index);
    setQIndex(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setShowExplain(false);
    setCurrentStreak(0);
    setWrongAnswers([]);
    setIsExamMode(false);
    if (timedMode) setTimeLeft(30);
    setScreen("quiz");
  };

  const startExam = (timed) => {
    const qs = buildExamQuestions(50);
    setPreparedQs(prepareAll(qs));
    setExamQuestions(qs);
    setQIndex(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setShowExplain(false);
    setCurrentStreak(0);
    setWrongAnswers([]);
    setIsExamMode(true);
    setTimedMode(timed);
    if (timed) setTimeLeft(30);
    setScreen("quiz");
  };

  const resetAll = () => { setAllScores([]); setBestStreak(0); setCurrentStreak(0); setScreen("home"); };

  const activeColor = isExamMode ? "#FFB612" : (currentTest?.color || "#FFB612");
  const progress = ((qIndex) / (totalQ || 1)) * 100;
  const isCorrect = answered && selected === currentQ?.answer;
  const totalScore = allScores.reduce((a, b) => a + b.score, 0);

  // ── HOME ────────────────────────────────────────────────────────────────────
  if (screen === "home") {
    return (
      <div style={{ minHeight: "100vh", background: "#060D07", fontFamily: "'Georgia', 'Times New Roman', serif", padding: "24px 16px" }}>
        <div style={{ display: "flex", height: 6, width: "100%", position: "fixed", top: 0, left: 0, zIndex: 10 }}>
          {["#000000","#FFB612","#007A4D","#F5F5F0","#DE3831","#4472CA"].map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}
        </div>
        <div style={{ maxWidth: 640, margin: "0 auto", paddingTop: 14 }}>
          <button onClick={onBack} style={{ background: "transparent", border: "1px solid #1A3020", color: "#6B7A62", fontSize: 13, padding: "7px 14px", cursor: "pointer", fontFamily: "'Georgia', 'Times New Roman', serif", borderRadius: 3, marginBottom: 20 }}>← All Drills</button>

          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 11, letterSpacing: 6, color: "#6B7A62", marginBottom: 8, textTransform: "uppercase" }}>South Africa · Code 10 / 14</div>
            <div style={{ display: "inline-block", background: "#FFB612", color: "#000", fontSize: 36, fontWeight: 900, padding: "8px 20px", letterSpacing: -1, marginBottom: 4 }}>
              🚛 HEAVY VEHICLE
            </div>
            <div style={{ fontSize: 13, color: "#FFB612", letterSpacing: 4, marginTop: 8 }}>GAUNTLET — 50 QUESTIONS</div>
            <p style={{ color: "#6B7A62", fontSize: 12, marginTop: 12, lineHeight: 1.6 }}>
              5 rounds • 10 questions each • Plus 50-question exam simulator<br />Pass mark: 7/10 per round
            </p>
          </div>

          {(allScores.length > 0 || bestStreak > 0) && (
            <div style={{ background: "#0D1F10", border: "1px solid #222", borderRadius: 4, padding: "14px 20px", marginBottom: 24, display: "flex", justifyContent: "space-around", textAlign: "center" }}>
              <div><div style={{ color: "#FFB612", fontSize: 22, fontWeight: 900 }}>{totalScore}/{allScores.reduce((a, b) => a + b.total, 0)}</div><div style={{ color: "#6B7A62", fontSize: 10, letterSpacing: 2 }}>TOTAL</div></div>
              <div><div style={{ color: "#007A4D", fontSize: 22, fontWeight: 900 }}>{bestStreak}</div><div style={{ color: "#6B7A62", fontSize: 10, letterSpacing: 2 }}>BEST STREAK</div></div>
              <div><div style={{ color: "#DE3831", fontSize: 22, fontWeight: 900 }}>{allScores.length}/5</div><div style={{ color: "#6B7A62", fontSize: 10, letterSpacing: 2 }}>ROUNDS DONE</div></div>
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <div style={{ color: "#FFB612", fontSize: 10, letterSpacing: 3, marginBottom: 10 }}>⚡ EXAM SIMULATOR</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => startExam(false)} style={{ flex: 1, background: "#FFB612", color: "#000", border: "none", borderRadius: 4, padding: "14px 10px", fontWeight: 900, fontSize: 12, letterSpacing: 2, cursor: "pointer", fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                50 RANDOM Q's
              </button>
              <button onClick={() => startExam(true)} style={{ flex: 1, background: "#DE3831", color: "#fff", border: "none", borderRadius: 4, padding: "14px 10px", fontWeight: 900, fontSize: 12, letterSpacing: 2, cursor: "pointer", fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                ⏱ TIMED MODE (30s/Q)
              </button>
            </div>
          </div>

          <div style={{ height: 1, background: "#0D1F10", marginBottom: 20 }} />
          <div style={{ color: "#6B7A62", fontSize: 10, letterSpacing: 3, marginBottom: 14 }}>INDIVIDUAL ROUNDS</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {TESTS.map((test, i) => {
              const done = allScores.find(s => s.testId === test.id);
              const passed = done && done.score >= PASS_SCORE;
              return (
                <button key={test.id} onClick={() => startTest(i)}
                  style={{ background: "#0D1F10", border: `2px solid ${done ? (passed ? "#007A4D" : "#DE3831") : "#1A3020"}`, borderRadius: 4, padding: "14px 16px", textAlign: "left", cursor: "pointer", fontFamily: "'Georgia', 'Times New Roman', serif", transition: "border-color 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = test.color}
                  onMouseLeave={e => e.currentTarget.style.borderColor = done ? (passed ? "#007A4D" : "#DE3831") : "#1A3020"}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ color: test.color, fontSize: 10, letterSpacing: 3, marginBottom: 3 }}>ROUND {test.id}</div>
                      <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{test.title.replace(`ROUND ${test.id}: `, "")}</div>
                      <div style={{ color: "#6B7A62", fontSize: 11, marginTop: 2 }}>{test.subtitle}</div>
                    </div>
                    <div style={{ textAlign: "right", minWidth: 50 }}>
                      {done ? (
                        <>
                          <div style={{ color: passed ? "#007A4D" : "#DE3831", fontSize: 22, fontWeight: 900 }}>{done.score}/10</div>
                          <div style={{ color: passed ? "#007A4D" : "#DE3831", fontSize: 9, letterSpacing: 2 }}>{passed ? "PASSED" : "RETRY"}</div>
                        </>
                      ) : (
                        <div style={{ color: "#2a2a2a", fontSize: 22, fontWeight: 900 }}>—</div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {allScores.length > 0 && (
            <button onClick={resetAll} style={{ width: "100%", marginTop: 18, padding: "12px", background: "transparent", border: "1px solid #222", color: "#6B7A62", fontSize: 11, letterSpacing: 2, cursor: "pointer", fontFamily: "'Georgia', 'Times New Roman', serif", borderRadius: 4 }}>
              RESET ALL SCORES
            </button>
          )}
          <p style={{ textAlign: "center", color: "#1A3020", fontSize: 10, marginTop: 28, letterSpacing: 1 }}>Based on SA Road Traffic Act No. 93 of 1996</p>
        </div>
      </div>
    );
  }

  // ── QUIZ ────────────────────────────────────────────────────────────────────
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
                  {isExamMode ? "⚡ EXAM MODE" : `ROUND ${currentTest.id}`}
                  {timedMode && " • TIMED"}
                </div>
                <div style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>
                  {isExamMode ? "50-Question Simulator" : currentTest.title.replace(`ROUND ${currentTest.id}: `, "")}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "#FFB612", fontSize: 22, fontWeight: 900 }}>{score}</div>
                <div style={{ color: "#333", fontSize: 10, letterSpacing: 2 }}>SCORE</div>
              </div>
            </div>

            <div style={{ height: 3, background: "#0D1F10", borderRadius: 2, marginBottom: timedMode ? 8 : 20, position: "relative" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${progress}%`, background: activeColor, borderRadius: 2, transition: "width 0.3s" }} />
            </div>

            {timedMode && (
              <div style={{ height: 4, background: "#0D1F10", borderRadius: 2, marginBottom: 20, position: "relative" }}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${timerPct}%`, background: timerColor, borderRadius: 2, transition: "width 1s linear" }} />
                <div style={{ position: "absolute", right: 0, top: -14, color: timerColor, fontSize: 12, fontWeight: 900 }}>{timeLeft}s</div>
              </div>
            )}

            <div style={{ color: "#6B7A62", fontSize: 11, letterSpacing: 3, marginBottom: 12 }}>
              Q {qIndex + 1} / {totalQ}
              {currentStreak >= 3 && <span style={{ color: "#FFB612", marginLeft: 16 }}>🔥 {currentStreak} STREAK</span>}
            </div>

            {/* Question — distinct gold-tinted background */}
            <div style={{ background: "rgba(255,182,18,0.07)", border: "1px solid rgba(255,182,18,0.22)", borderRadius: 4, padding: "20px", marginBottom: 14, color: "#F0E8C8", fontSize: 14, lineHeight: 1.7, fontWeight: 600 }}>
              {currentQ.q}
            </div>

            {/* Options — plain dark surface, clearly different from question */}
            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 14 }}>
              {currentQ.options.map((opt, i) => {
                let bc = "#1A3020", bg = "#0D1F10", tc = "#aaa";
                if (answered) {
                  if (i === currentQ.answer) { bc = "#007A4D"; bg = "#001a12"; tc = "#007A4D"; }
                  else if (i === selected) { bc = "#DE3831"; bg = "#1a0000"; tc = "#DE3831"; }
                  else { tc = "#2a2a2a"; }
                }
                return (
                  <button key={i} onClick={() => handleSelect(i)}
                    style={{ background: bg, border: `2px solid ${bc}`, borderRadius: 4, padding: "13px 14px", textAlign: "left", cursor: answered ? "default" : "pointer", display: "flex", gap: 10, alignItems: "flex-start", transition: "border-color 0.1s", fontFamily: "'Georgia', 'Times New Roman', serif" }}
                    onMouseEnter={e => { if (!answered) e.currentTarget.style.borderColor = activeColor; }}
                    onMouseLeave={e => { if (!answered) e.currentTarget.style.borderColor = "#1A3020"; }}
                  >
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
                  {selected === null ? "⏱ TIME'S UP — LEARN THIS" : isCorrect ? "✓ CORRECT" : "✗ WRONG — LEARN THIS"}
                </div>
                <div style={{ color: "#999", fontSize: 12, lineHeight: 1.6 }}>{currentQ.explain}</div>
                {!isCorrect && answered && selected !== null && (
                  <AITutor question={currentQ.q} correctAnswer={currentQ.options[currentQ.answer]} chosenAnswer={selected !== null ? currentQ.options[selected] : ""} />
                )}
              </div>
            )}

            {answered && (
              <button onClick={handleNext} style={{ width: "100%", padding: "13px", background: activeColor, color: "#000", border: "none", borderRadius: 4, fontSize: 12, fontWeight: 900, letterSpacing: 3, cursor: "pointer", fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                {qIndex < totalQ - 1 ? "NEXT →" : "SEE RESULTS →"}
              </button>
            )}
          </div>
        </div>
      </>
    );
  }

  // ── RESULT ──────────────────────────────────────────────────────────────────
  if (screen === "result") {
    const finalTotal = isExamMode ? examQuestions.length : (currentTest?.questions.length || 10);
    const pct = Math.round((score / finalTotal) * 100);
    const passed = isExamMode ? pct >= 70 : score >= PASS_SCORE;
    if (passed && !passedFiredRef.current) { passedFiredRef.current = true; onPass?.(); }

    return (
      <div style={{ minHeight: "100vh", background: "#060D07", fontFamily: "'Georgia', 'Times New Roman', serif", padding: "24px 16px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ background: passed ? "#001a12" : "#1a0000", border: `2px solid ${passed ? "#007A4D" : "#DE3831"}`, borderRadius: 4, padding: "28px 24px", textAlign: "center", marginBottom: 24 }}>
            <div style={{ color: passed ? "#007A4D" : "#DE3831", fontSize: 10, letterSpacing: 4, marginBottom: 10 }}>
              {isExamMode ? "EXAM RESULT" : `ROUND ${currentTest?.id} RESULT`}
            </div>
            <div style={{ color: "#fff", fontSize: 56, fontWeight: 900, lineHeight: 1 }}>
              {score}<span style={{ color: "#1A3020" }}>/{finalTotal}</span>
            </div>
            <div style={{ color: passed ? "#007A4D" : "#DE3831", fontSize: 20, fontWeight: 900, marginTop: 6 }}>{pct}%</div>
            <div style={{ color: "#6B7A62", fontSize: 12, marginTop: 6 }}>
              {passed ? (isExamMode ? "EXAM PASSED — Go get that Code 10/14." : "Round passed ✓") : (isExamMode ? `Need 70% to pass — you got ${pct}%` : `Need ${PASS_SCORE}/10 to pass`)}
            </div>
          </div>

          {wrongAnswers.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ color: "#DE3831", fontSize: 10, letterSpacing: 3, marginBottom: 14 }}>✗ REVIEW YOUR MISTAKES ({wrongAnswers.length})</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {wrongAnswers.map((w, i) => (
                  <div key={i} style={{ background: "#0D1F10", border: "1px solid #2a0000", borderRadius: 4, padding: "14px" }}>
                    <div style={{ color: "#777", fontSize: 12, marginBottom: 8, lineHeight: 1.5 }}>{w.q}</div>
                    <div style={{ color: "#DE3831", fontSize: 11, marginBottom: 4 }}>✗ {w.yourAnswer}</div>
                    <div style={{ color: "#007A4D", fontSize: 11, marginBottom: 8 }}>✓ {w.correctAnswer}</div>
                    <div style={{ color: "#6B7A62", fontSize: 11, lineHeight: 1.5, borderTop: "1px solid #1A3020", paddingTop: 8 }}>{w.explain}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {wrongAnswers.length === 0 && (
            <div style={{ background: "#001a12", border: "1px solid #007A4D", borderRadius: 4, padding: 20, textAlign: "center", marginBottom: 24 }}>
              <div style={{ color: "#007A4D", fontSize: 16 }}>🚛 PERFECT ROUND — Not a single mistake.</div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => isExamMode ? startExam(timedMode) : startTest(testIndex)}
              style={{ flex: 1, padding: "13px", background: "#DE3831", color: "#fff", border: "none", borderRadius: 4, fontSize: 11, fontWeight: 900, letterSpacing: 2, cursor: "pointer", fontFamily: "'Georgia', 'Times New Roman', serif" }}>
              RETRY
            </button>
            <button onClick={() => setScreen("home")}
              style={{ flex: 1, padding: "13px", background: "#FFB612", color: "#000", border: "none", borderRadius: 4, fontSize: 11, fontWeight: 900, letterSpacing: 2, cursor: "pointer", fontFamily: "'Georgia', 'Times New Roman', serif" }}>
              HOME →
            </button>
          </div>

          {!isExamMode && allScores.length === 5 && (
            <div style={{ marginTop: 22, background: "#0D1F10", border: "1px solid #222", borderRadius: 4, padding: "20px", textAlign: "center" }}>
              <div style={{ color: "#FFB612", fontSize: 10, letterSpacing: 3, marginBottom: 8 }}>ALL 5 ROUNDS COMPLETE</div>
              <div style={{ color: "#fff", fontSize: 44, fontWeight: 900 }}>
                {allScores.reduce((a, b) => a + b.score, 0)}/50
              </div>
              <div style={{ color: "#6B7A62", fontSize: 12, marginTop: 6 }}>
                {allScores.reduce((a, b) => a + b.score, 0) >= 35
                  ? "🚛 You know your vehicle. Go ace that Code 10/14 test."
                  : "Keep drilling. Pay attention to your wrong answers."}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
