import { useState, useEffect, useRef } from "react";
import { incrementQuestionCount, isGateHit } from "../freemium.js";
import FreemiumGate from "../components/FreemiumGate.jsx";
import AITutor from "../components/AITutor.jsx";
import { prepareAll, stableId } from '../utils/quizHelpers.js';
import { recordResult } from '../utils/progressHistory.js';
import { recordAnswer } from '../utils/spacedRepetition.js';

// ── Code 1 Motorcycle Question Bank ──────────────────────────────────────────
const TESTS = [
  {
    id: 1,
    title: "ROUND 1: LICENCE & CODES",
    subtitle: "Codes, ages, restrictions, learner rules",
    color: "#FFB612",
    questions: [
      {
        q: "What is the minimum age to apply for a Code 1 learner's licence?",
        options: ["14 years","16 years","17 years","18 years"],
        answer: 1,
        explain: "Code 1 (motorcycle) learner's minimum age = 16. Code 2/3 learner's minimum = 17. Full Code 1 licence = 18. Don't confuse these.",
      },
      {
        q: "You hold a Code 1 learner's licence and are under 18. What is the maximum engine size you may ride?",
        options: ["Any size as long as you have a supervisor","Up to 50cc","Up to 125cc","Up to 200cc"],
        answer: 2,
        explain: "Under 18 with Code 1 = maximum 125cc engine. Once you turn 18 and hold a full Code 1 licence, any engine size is permitted.",
      },
      {
        q: "You have a Code 1 learner's licence. Your friend wants to ride pillion with you. Is this allowed?",
        options: ["Yes, if both wear helmets","Yes, if riding within 5km of home","No — learner's licence holders may not carry passengers","Yes, if your supervisor approves"],
        answer: 2,
        explain: "Code 1 learner's licences PROHIBIT carrying passengers. No exceptions — not even with helmets or short distances.",
      },
      {
        q: "You passed your Code 1 learner's test today. For how long is it valid?",
        options: ["12 months","18 months","24 months","36 months"],
        answer: 2,
        explain: "All learner's licences are valid for 24 months from the test date — regardless of code.",
      },
      {
        q: "Which licence code covers motorcycles without a sidecar?",
        options: ["Code 1","Code 2","Code 8","Code 3"],
        answer: 0,
        explain: "Code 1 = motorcycles. Code 2 = light motor vehicle + light trailer. Code 8 = light motor vehicle only. Code 10/14 = heavy vehicles.",
      },
      {
        q: "You have a full Code 1 licence (over 18). You want to ride a motorcycle with a sidecar. Do you need a different licence?",
        options: ["No — Code 1 covers all motorcycles including sidecar combinations","Yes — a motorcycle with sidecar requires a Code 2 licence","Yes — a motorcycle with sidecar is classified as a Code 3 vehicle","No — any full car licence also covers sidecar motorcycles"],
        answer: 0,
        explain: "A full Code 1 licence covers all motorcycles, including those fitted with a sidecar. No additional code needed.",
      },
      {
        q: "Your Code 1 learner's licence requires a supervisor. What licence must the supervisor hold?",
        options: ["Any valid learner's licence","A Code 1 licence valid for at least 2 years","A valid Code 1 driver's licence","Any valid driver's licence of any code"],
        answer: 2,
        explain: "For a Code 1 learner, the supervisor must hold a valid Code 1 driver's licence. They cannot supervise from a car alongside you.",
      },
      {
        q: "You are 17 with a Code 1 learner's licence. You want to ride to school 3km away alone. Can you?",
        options: ["Yes — short distances are exempt from supervision","No — a learner's licence holder must always be supervised","Yes — daylight hours are exempt","Yes — if the route is within your residential area"],
        answer: 1,
        explain: "Learner licence holders are ALWAYS supervised. No exceptions for distance, daylight, or familiar routes.",
      },
      {
        q: "You hold a Code 8 (car) driver's licence. Does this authorise you to ride a motorcycle?",
        options: ["Yes — higher codes automatically include lower codes","No — Code 8 does not authorise riding motorcycles","Yes — but only motorcycles under 125cc","Yes — if the motorcycle has a sidecar"],
        answer: 1,
        explain: "Licences are code-specific. Code 8 covers light motor vehicles. To ride a motorcycle you need a separate Code 1 licence.",
      },
      {
        q: "At what blood alcohol concentration does a motorcycle rider commit an offence?",
        options: ["Zero tolerance — 0.00g/100ml","0.02g per 100ml (same as professional drivers)","0.05g per 100ml (same as all drivers)","0.08g per 100ml"],
        answer: 2,
        explain: "Motorcycle riders are subject to the standard limit: an offence at 0.05g per 100ml or above. The 0.02g limit applies to professional drivers only.",
      },
    ],
  },
  {
    id: 2,
    title: "ROUND 2: PROTECTIVE EQUIPMENT",
    subtitle: "Helmets, protective gear, visibility equipment",
    color: "#DE3831",
    questions: [
      {
        q: "When must a motorcycle rider wear an approved safety helmet?",
        options: ["Only on freeways and national roads","Only when riding above 60 km/h","At all times when riding on a public road","Only in hazardous weather conditions"],
        answer: 2,
        explain: "Helmets are compulsory AT ALL TIMES on a public road — no exceptions for short trips, slow speeds, or quiet roads.",
      },
      {
        q: "Your passenger is sitting pillion on your motorcycle. Must they also wear a helmet?",
        options: ["Yes — all persons on a motorcycle must wear an approved helmet","No — only the rider needs a helmet","Yes — but only if the journey exceeds 10km","No — passengers are responsible for their own safety"],
        answer: 0,
        explain: "EVERY person on a motorcycle — rider AND all passengers — must wear an approved safety helmet at all times.",
      },
      {
        q: "A motorcycle headlamp must be switched on at what time?",
        options: ["Only between sunset and sunrise","Only in poor visibility conditions","At ALL times — day and night, no exceptions","Only when travelling above 80 km/h"],
        answer: 2,
        explain: "Motorcycles ONLY: headlamps must be lit at ALL times on a public road — day AND night. This is unique to motorcycles. Cars don't have this rule.",
      },
      {
        q: "How many red rear retro-reflectors must a motorcycle have?",
        options: ["None required","One, centrally mounted","Two, one on each side","One on the left and one on the right mudguard"],
        answer: 1,
        explain: "Motorcycle = 1 red rear retro-reflector. Light motor vehicles = 2 rear red retro-reflectors. Heavy vehicles = 2 red rear + yellow side reflectors.",
      },
      {
        q: "Your motorcycle's dipped headlamp must allow you to clearly see objects at least how far ahead?",
        options: ["20 metres","30 metres","45 metres","100 metres"],
        answer: 2,
        explain: "Dipped beam = 45m visibility ahead. Main beam (bright) = 100m visibility ahead. This applies to all motor vehicles including motorcycles.",
      },
      {
        q: "Must a motorcycle have both front and rear brakes that operate independently?",
        options: ["No — one combined brake system is sufficient","Yes — a motorcycle must have at least two independent braking systems","No — only rear brakes are required","Only if the motorcycle exceeds 250cc"],
        answer: 1,
        explain: "Every motorcycle must have at least two independent braking systems — front and rear. Each must be able to stop the vehicle on its own if the other fails.",
      },
      {
        q: "A motorcycle rider wishes to carry goods in a top box. The top box increases the motorcycle's width beyond normal handlebars. Is this legal?",
        options: ["Yes — top boxes are universally permitted","No — total width must not exceed 1.5 metres for two-wheeled motorcycles","Yes — as long as weight does not exceed 100kg","No — goods may only be carried in panniers"],
        answer: 1,
        explain: "A motorcycle's maximum permissible width is 1.5 metres. This includes any luggage, panniers or top boxes attached.",
      },
      {
        q: "Your motorcycle's stop lamp must be visible at what minimum distance in normal daylight?",
        options: ["20 metres","30 metres","45 metres","90 metres"],
        answer: 1,
        explain: "Stop lamp = visible from 30m. Number plate lamp = visible from 20m. Dipped beam = 45m ahead. Hooter = audible from 90m.",
      },
      {
        q: "An approved motorcycle helmet must carry which marking to confirm it meets South African standards?",
        options: ["A CE marking from the European Union","The SABS mark or equivalent SANS approval","Any international safety marking","No marking is required — helmet choice is personal"],
        answer: 1,
        explain: "Helmets for use on SA public roads must bear the SABS mark or SANS approval. CE-marked helmets may be acceptable if the SANS standard references them, but SABS/SANS approval is the SA requirement.",
      },
      {
        q: "You ride a motorcycle at night without your headlamp lit. You are within 12 metres of a lit street lamp. Are you exempt from the headlamp requirement?",
        options: ["Yes — the street lamp provides sufficient illumination","No — motorcycle headlamps must be on at all times, regardless of other lighting","Yes — same exemption as parked vehicles near street lamps","Yes — only if your speed is below 30 km/h"],
        answer: 1,
        explain: "The street lamp parking exemption applies to PARKED vehicles only. Motorcycles must have headlamps on while riding AT ALL TIMES — day or night, near street lamps or not.",
      },
    ],
  },
  {
    id: 3,
    title: "ROUND 3: RIDING RULES",
    subtitle: "Lane positioning, overtaking, filtering, passengers",
    color: "#4472CA",
    questions: [
      {
        q: "You are riding your motorcycle on a road with two lanes in your direction. Where should you normally position yourself?",
        options: ["In the centre of the lane, like any other vehicle","As far left as safely possible","In the right lane for better visibility","Any position — motorcycles have flexible lane rules"],
        answer: 0,
        explain: "Motorcycles follow the same lane positioning rules as cars. Ride in the normal driving position for your lane. 'Keep left' applies, but you occupy the lane like any other vehicle.",
      },
      {
        q: "Is it legal to ride a motorcycle between two lanes of slow-moving or stationary traffic (lane splitting)?",
        options: ["Yes — motorcycles are specifically permitted to lane split","No — lane splitting is illegal in South Africa","Yes — but only if traffic is completely stopped","Yes — but only at speeds below 30 km/h"],
        answer: 1,
        explain: "Lane splitting (riding between lanes of traffic) is NOT legally authorised in South Africa. Every vehicle, including motorcycles, must stay within a lane.",
      },
      {
        q: "You want to overtake a vehicle on its right side. Before you pull out, what is the LAST check you must make?",
        options: ["Check your left mirror","Check the road ahead is clear for the full overtaking distance","Signal right","Accelerate to create a gap"],
        answer: 1,
        explain: "Before overtaking: signal, check mirrors, check ahead is clear for the ENTIRE distance of the manoeuvre, check for oncoming traffic. The road ahead must be clear — this is always the final, critical check.",
      },
      {
        q: "You are riding behind a vehicle at night. How far should you ride so that your headlamp doesn't dazzle the driver ahead via their mirrors?",
        options: ["Stay within 10 metres so they can see you","Stay at least 45 metres back — dipped beam distance","Stay at least 100 metres back","There is no specific requirement for rear dazzle distance"],
        answer: 1,
        explain: "At night, follow at a distance where your headlamp doesn't shine directly into the leading driver's mirrors. As a guide, your dipped beam (45m range) should just reach the rear of the vehicle ahead.",
      },
      {
        q: "You are approaching a pedestrian crossing where a pedestrian has stepped onto the road. What must you do?",
        options: ["Sound the hooter to warn them","Flash your lights and proceed slowly","Stop and allow the pedestrian to cross safely","Swerve around them if possible"],
        answer: 2,
        explain: "At a pedestrian crossing, pedestrians on the crossing have absolute right of way. You MUST stop and wait until the crossing is clear. Hooting or swerving around them is illegal.",
      },
      {
        q: "When following another vehicle, what is the minimum safe following distance rule taught in K53?",
        options: ["At least 3 seconds behind the vehicle in front","At least 30 metres regardless of speed","At least 2 seconds — enough to stop if they brake","A 1-second gap for every 15 km/h of speed"],
        answer: 0,
        explain: "The K53 following distance rule: at least 3 seconds behind the vehicle in front under normal conditions. In bad weather or poor visibility, extend this gap significantly.",
      },
      {
        q: "You want to carry a passenger pillion. What is the legal requirement regarding foot pegs?",
        options: ["No specific requirement — passenger can hold on","The motorcycle must be fitted with passenger foot pegs","Passengers may only ride in a sidecar","Foot pegs are only required for passengers under 16"],
        answer: 1,
        explain: "To legally carry a pillion passenger, the motorcycle must have proper passenger foot pegs (footrests) fitted. Without them, carrying a passenger is illegal.",
      },
      {
        q: "You are overtaking on a solid white centre line. Is this permitted?",
        options: ["Yes — motorcycles are exempt from centre line rules","No — a solid white line means no overtaking","Yes — only if you complete the manoeuvre quickly","No — unless a traffic officer directs you to"],
        answer: 1,
        explain: "A solid white centre line means NO overtaking and NO crossing the line. This applies to ALL vehicles including motorcycles. Only a broken white line permits overtaking when safe.",
      },
      {
        q: "You are riding at night. An oncoming vehicle's lights are blinding you. What should you do?",
        options: ["Flash your high beam repeatedly to signal them","Slow down, keep left, look toward the left edge of the road","Brake hard and stop","Accelerate to get past the vehicle faster"],
        answer: 1,
        explain: "When blinded by oncoming lights: slow down, move as far left as safely possible, look toward the left road edge (not at the lights). Do not flash your high beam — this blinds oncoming traffic.",
      },
      {
        q: "You are riding on a freeway. What is the maximum speed limit for motorcycles where no other sign is posted?",
        options: ["100 km/h","110 km/h","120 km/h","130 km/h"],
        answer: 2,
        explain: "The general open-road speed limit in South Africa is 120 km/h on freeways/highways. Motorcycles are subject to the same speed limits as cars — no special motorcycle limit.",
      },
    ],
  },
  {
    id: 4,
    title: "ROUND 4: NUMBERS & DISTANCES",
    subtitle: "Motorcycle-specific measurements and limits",
    color: "#007A4D",
    questions: [
      {
        q: "At what speed does the compulsory 30 km/h limit apply near school entrances during specified hours?",
        options: ["When children are visible","At all times, 24 hours a day","Only during school hours 07:00–17:00","The sign specifies the exact period"],
        answer: 3,
        explain: "A 30 km/h school zone speed limit sign applies ONLY during the periods shown on the sign. Outside those times, the general speed limit applies.",
      },
      {
        q: "What is the maximum speed on a public road in an urban area where no speed limit sign is posted?",
        options: ["60 km/h","80 km/h","100 km/h","50 km/h"],
        answer: 0,
        explain: "Default urban speed limit = 60 km/h. Default open road = 100 km/h. Freeways = 120 km/h. These apply when no specific sign is posted.",
      },
      {
        q: "Under K53, before making a lane change, how far before the manoeuvre should you signal?",
        options: ["Signal as you start moving","At least 3 seconds before the manoeuvre","As soon as possible — there's no fixed minimum","Signal when the gap appears"],
        answer: 1,
        explain: "Signal at least 3 seconds before executing any lane change, turn, or overtake. This gives other road users time to react.",
      },
      {
        q: "Your motorcycle tyre has a tread depth below the legal minimum. What is the minimum tread depth required by law?",
        options: ["0.5 mm across the full tread width","1.0 mm across the central ¾ of the tread","1.6 mm across the full tread width","2.0 mm in the centre groove only"],
        answer: 1,
        explain: "Minimum tread depth = 1.0mm across the central three-quarters of the tread width. Riding with tyres below this limit is illegal and extremely dangerous.",
      },
      {
        q: "How far before a stop sign must a rider stop? (i.e. the minimum stopping distance from the line or edge of the intersection)",
        options: ["Stop at the stop line or the edge of the road","Stop within 1 metre of the sign","Stop at least 3 metres before the sign","Stop when oncoming traffic is visible"],
        answer: 0,
        explain: "You must stop at the STOP LINE. If there's no line, stop at the edge of the intersection. Then you may proceed when safe — there's no fixed distance requirement beyond reaching the line.",
      },
      {
        q: "A motorcycle engine is classified as 'small' for learner licence purposes below what capacity?",
        options: ["50cc","100cc","125cc","200cc"],
        answer: 2,
        explain: "Under 18 with Code 1 = maximum 125cc. This is the 'small capacity' threshold for learner riders. Above 125cc requires the rider to be 18+.",
      },
      {
        q: "What minimum distance must you keep from the edge of the road when parking a motorcycle?",
        options: ["0.5 metres","1.0 metre","1.5 metres","There is no minimum for motorcycles"],
        answer: 0,
        explain: "When parking on the left, the motorcycle should be within 0.5m of the left edge of the road or kerb. Park close to the edge to leave room for traffic.",
      },
      {
        q: "You are riding at 100 km/h. At minimum, how far behind the vehicle in front must you ride using the 3-second rule?",
        options: ["About 28 metres","About 50 metres","About 83 metres","About 100 metres"],
        answer: 2,
        explain: "At 100 km/h = ~27.8 m/s. Over 3 seconds = approximately 83 metres. This is why the time-based rule is preferred over a fixed distance — it adjusts automatically for speed.",
      },
      {
        q: "The default speed limit on an open road (not a freeway) where no sign is posted is:",
        options: ["80 km/h","100 km/h","110 km/h","120 km/h"],
        answer: 1,
        explain: "Default open road = 100 km/h. Default urban = 60 km/h. Freeway = 120 km/h. National roads outside urban areas without speed signs = 100 km/h.",
      },
      {
        q: "Under K53, how long after a hazard first becomes visible must a driver start checking mirrors and planning an escape?",
        options: ["As soon as possible — within 1 second","The K53 system requires action at 4 seconds' distance from the hazard","K53 uses a 3-second advance warning rule","There is no prescribed time — use judgement"],
        answer: 1,
        explain: "The K53 commentary driving system requires you to identify a hazard at approximately 4 seconds ahead, then start planning and executing your response immediately.",
      },
    ],
  },
  {
    id: 5,
    title: "ROUND 5: ROAD SIGNS & HAZARDS",
    subtitle: "Signs, signals, road markings, emergency procedures",
    color: "#6c47ff",
    questions: [
      {
        q: "A YIELD/GIVE WAY sign means:",
        options: ["Stop completely, then proceed","Give way to traffic on the road you are joining — stop only if necessary","Slow down to 30 km/h regardless of traffic","Give way only to vehicles from the right"],
        answer: 1,
        explain: "YIELD = give way. You MUST slow down and give way to all traffic on the road you are entering. You only need to stop if it's necessary to avoid a collision. It is not a stop sign.",
      },
      {
        q: "A flashing red traffic light must be treated as:",
        options: ["A yield sign","A stop sign — stop, check, proceed when safe","A warning to slow down only","An indication the intersection is uncontrolled — proceed normally"],
        answer: 1,
        explain: "Flashing red = STOP sign. Stop completely, check all directions, then proceed when safe. A flashing amber = yield and proceed with caution.",
      },
      {
        q: "You see a broken white centre line on a two-lane road. What does it mean?",
        options: ["Overtaking is prohibited","You may cross the line to overtake when it is safe to do so","The right lane is for faster vehicles only","Keep left — no passing"],
        answer: 1,
        explain: "Broken white centre line = overtaking PERMITTED when safe. Solid white line = no crossing, no overtaking. This is the key white line distinction.",
      },
      {
        q: "Your front tyre blows out at speed. What is the correct immediate response?",
        options: ["Apply the rear brake hard and steer left","Grip the handlebars firmly, gradually ease off the throttle, apply brakes gently and progressively","Immediately apply both brakes fully to stop as quickly as possible","Lean into the blow-out side to counteract the pull"],
        answer: 1,
        explain: "On a blow-out: grip handlebars firmly, ease off throttle gradually, apply brakes GENTLY and progressively — no sudden braking. Allow speed to reduce naturally before steering to safety.",
      },
      {
        q: "You approach a four-way stop at the same time as a vehicle on your right. Who goes first?",
        options: ["The vehicle on the right goes first","You go first as you arrived simultaneously","The vehicle on the left goes first","The larger vehicle goes first"],
        answer: 0,
        explain: "At a four-way stop with simultaneous arrivals: the vehicle on the RIGHT has priority. Always give way to traffic on your right.",
      },
      {
        q: "A no-overtaking sign (solid white bar in a circle with red border) means:",
        options: ["No overtaking for the next 100 metres only","No overtaking for all vehicles in your direction until a 'derestriction' sign","No overtaking during wet weather","No overtaking by motorcycles specifically"],
        answer: 1,
        explain: "A no-overtaking sign prohibits passing other vehicles for ALL traffic in your direction from that point until a derestriction sign or the applicable distance shown on a supplementary plate.",
      },
      {
        q: "You are approaching a blind rise (hill crest) on a two-lane road. You want to overtake the vehicle ahead. Is this permitted?",
        options: ["Yes — if your motorcycle accelerates quickly enough","Yes — motorcycles can overtake anywhere due to their speed","No — overtaking within sight of a hill crest or curve is prohibited","Only if no oncoming traffic is visible"],
        answer: 2,
        explain: "Overtaking near a hill crest, curve, intersection, railway crossing or pedestrian crossing is PROHIBITED. You cannot see oncoming traffic — the risk is extreme.",
      },
      {
        q: "What must you do when a traffic officer uses a specific hand signal directing you to stop?",
        options: ["Slow down and wait for a verbal instruction","Stop immediately and obey their instruction — their direction overrides all signs and signals","Proceed if you have a green light — the traffic light has legal precedence","Acknowledge with a flash of lights and then stop"],
        answer: 1,
        explain: "A traffic officer's instructions OVERRIDE all road signs, traffic lights, and markings. You must stop and comply immediately when directed.",
      },
      {
        q: "You are involved in an accident with injuries. What is your FIRST obligation?",
        options: ["Take photographs of the scene","Move your motorcycle off the road immediately","Stop, render assistance to injured persons, and call emergency services","Exchange insurance details with the other party before anything else"],
        answer: 2,
        explain: "First obligation at an injury accident: STOP. Render reasonable assistance to injured persons. Call emergency services (10111/112). Then secure the scene and exchange details.",
      },
      {
        q: "A solid yellow centre line on a two-lane road means:",
        options: ["Caution — slippery surface ahead","No overtaking and no crossing for vehicles in that direction","Slow lane — keep to the left","No parking within 3 metres of the line"],
        answer: 1,
        explain: "Solid yellow (or white) centre line = NO overtaking, NO crossing for the lane on that side. Same rule as a solid white line. No crossing regardless of what is visible ahead.",
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

export default function MotorcycleGauntlet({ onBack, onPass }) {
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
    recordResult(correct, 'motorcycle');
    recordAnswer(stableId(currentQ, 'mg_'), correct);
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
            <div style={{ fontSize: 11, letterSpacing: 6, color: "#6B7A62", marginBottom: 8, textTransform: "uppercase" }}>South Africa · Code 1</div>
            <div style={{ display: "inline-block", background: "#FFB612", color: "#000", fontSize: 36, fontWeight: 900, padding: "8px 20px", letterSpacing: -1, marginBottom: 4 }}>
              🏍️ MOTORCYCLE
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
        {/* SA flag stripe */}
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 4, zIndex: 100, display: 'flex' }}>
          {["#000000","#FFB612","#007A4D","#F5F5F0","#DE3831","#4472CA"].map((c,i) => <div key={i} style={{flex:1,background:c}} />)}
        </div>
        <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "'Georgia', 'Times New Roman', serif", padding: "20px 16px 40px", paddingTop: 28 }}>
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div>
                <div style={{ color: activeColor, fontSize: 10, letterSpacing: 3 }}>
                  {isExamMode ? "⚡ EXAM MODE" : `ROUND ${currentTest.id}`}
                  {timedMode && " • TIMED"}
                </div>
                <div style={{ color: "#eeeef5", fontSize: 13, fontWeight: 700, marginTop: 2 }}>
                  {isExamMode ? "50-Question Simulator" : currentTest.title.replace(`ROUND ${currentTest.id}: `, "")}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: activeColor, fontSize: 32, fontWeight: 900, lineHeight: 1 }}>{score}</div>
                <div style={{ color: "#444", fontSize: 10, letterSpacing: 2 }}>SCORE</div>
              </div>
            </div>

            {/* Segmented progress */}
            <div style={{ display: 'flex', gap: 3, marginBottom: timedMode ? 8 : 20 }}>
              {Array.from({length: totalQ}, (_, i) => (
                <div key={i} style={{ flex: 1, height: 5, borderRadius: 3, background: i < qIndex ? '#007A4D' : i === qIndex ? activeColor : '#1a1a2a', transition: 'background 0.2s' }} />
              ))}
            </div>

            {timedMode && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ flex: 1, height: 6, background: "#111118", borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${timerPct}%`, height: '100%', background: timerColor, borderRadius: 3, transition: "width 1s linear" }} />
                </div>
                <div style={{ color: timerColor, fontSize: 16, fontWeight: 900, minWidth: 36, textAlign: 'right' }}>{timeLeft}s</div>
              </div>
            )}

            <div style={{ color: "#6b6b82", fontSize: 11, letterSpacing: 3, marginBottom: 14 }}>
              Q {qIndex + 1} / {totalQ}
              {currentStreak >= 3 && <span style={{ color: "#FFB612", marginLeft: 16 }}>🔥 {currentStreak} STREAK</span>}
            </div>

            {/* Question */}
            <div style={{ background: "#111118", borderLeft: `4px solid ${activeColor}`, borderRadius: 4, padding: "22px 20px", marginBottom: 16, color: "#eeeef5", fontSize: 16, lineHeight: 1.7, fontWeight: 700 }}>
              {currentQ.q}
            </div>

            {/* Options */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {currentQ.options.map((opt, i) => {
                let bc, bg, tc;
                if (!answered) {
                  bc = "#2a2a3a"; bg = "#111118"; tc = "#ccccdd";
                } else if (i === currentQ.answer) {
                  bc = "#007A4D"; bg = "#007A4D"; tc = "#ffffff";
                } else if (i === selected) {
                  bc = "#DE3831"; bg = "#DE3831"; tc = "#ffffff";
                } else {
                  bc = "#1a1a2a"; bg = "#0a0a12"; tc = "#333344";
                }
                return (
                  <button key={i} onClick={() => handleSelect(i)}
                    style={{ background: bg, border: `2px solid ${bc}`, borderRadius: 6, padding: "14px 16px", textAlign: "left", cursor: answered ? "default" : "pointer", display: "flex", gap: 12, alignItems: "flex-start", transition: "all 0.15s", fontFamily: "'Georgia', 'Times New Roman', serif" }}
                    onMouseEnter={(e) => { if (!answered) { e.currentTarget.style.borderColor = activeColor; e.currentTarget.style.background = '#15151f'; } }}
                    onMouseLeave={(e) => { if (!answered) { e.currentTarget.style.borderColor = "#2a2a3a"; e.currentTarget.style.background = '#111118'; } }}
                  >
                    <span style={{ background: !answered ? 'rgba(0,122,77,0.15)' : 'transparent', color: !answered ? '#007A4D' : tc, fontSize: 11, fontWeight: 900, letterSpacing: 1, minWidth: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, flexShrink: 0, marginTop: 1 }}>{String.fromCharCode(65 + i)}</span>
                    <span style={{ color: tc, fontSize: 14, lineHeight: 1.5 }}>{opt}</span>
                    {answered && i === currentQ.answer && <span style={{ marginLeft: "auto", color: "#fff", fontSize: 16 }}>✓</span>}
                    {answered && i === selected && i !== currentQ.answer && <span style={{ marginLeft: "auto", color: "#fff", fontSize: 16 }}>✗</span>}
                  </button>
                );
              })}
            </div>

            {showExplain && (
              <div style={{ background: isCorrect ? "rgba(0,122,77,0.1)" : "rgba(222,56,49,0.1)", border: `1px solid ${isCorrect ? "#007A4D" : "#DE3831"}`, borderLeft: `4px solid ${isCorrect ? "#007A4D" : "#DE3831"}`, borderRadius: 4, padding: "16px 18px", marginBottom: 16 }}>
                <div style={{ color: isCorrect ? "#007A4D" : "#DE3831", fontSize: 10, letterSpacing: 3, marginBottom: 8, fontWeight: 900 }}>
                  {selected === null ? "⏱ TIME'S UP — LEARN THIS" : isCorrect ? "✓ CORRECT" : "✗ WRONG — LEARN THIS"}
                </div>
                <div style={{ color: "#bbb", fontSize: 13, lineHeight: 1.7 }}>{currentQ.explain}</div>
                {!isCorrect && answered && selected !== null && (
                  <AITutor question={currentQ.q} correctAnswer={currentQ.options[currentQ.answer]} chosenAnswer={selected !== null ? currentQ.options[selected] : ""} />
                )}
              </div>
            )}

            {answered && (
              <button onClick={handleNext} style={{ width: "100%", padding: "14px", background: activeColor, color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 900, letterSpacing: 3, cursor: "pointer", fontFamily: "'Georgia', 'Times New Roman', serif" }}>
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
      <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "'Georgia', 'Times New Roman', serif", padding: "24px 16px 40px", paddingTop: 28 }}>
        {/* SA flag stripe */}
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 4, zIndex: 100, display: 'flex' }}>
          {["#000000","#FFB612","#007A4D","#F5F5F0","#DE3831","#4472CA"].map((c,i) => <div key={i} style={{flex:1,background:c}} />)}
        </div>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ background: passed ? "rgba(0,122,77,0.08)" : "rgba(222,56,49,0.08)", border: `2px solid ${passed ? "#007A4D" : "#DE3831"}`, borderRadius: 12, padding: "36px 24px", textAlign: "center", marginBottom: 24 }}>
            <div style={{ display: 'inline-block', background: passed ? "#007A4D" : "#DE3831", color: '#fff', fontSize: 11, letterSpacing: 4, padding: '6px 20px', borderRadius: 99, marginBottom: 20, fontWeight: 900 }}>
              {passed ? "✓ PASSED" : "✗ NOT PASSED"}
            </div>
            <div style={{ color: "#fff", fontSize: 72, fontWeight: 900, lineHeight: 1, marginBottom: 8 }}>
              {score}<span style={{ color: "#2a2a3a", fontSize: 40 }}>/{finalTotal}</span>
            </div>
            <div style={{ color: passed ? "#007A4D" : "#DE3831", fontSize: 28, fontWeight: 900, marginBottom: 12 }}>{pct}%</div>
            <div style={{ color: "#6b6b82", fontSize: 13 }}>
              {passed ? (isExamMode ? "EXAM PASSED — Ride out and ace that test." : "Round passed. Keep this momentum.") : (isExamMode ? `Need 70% to pass — you got ${pct}%.` : `Need ${PASS_SCORE}/10 to pass. Keep drilling.`)}
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
              <div style={{ color: "#007A4D", fontSize: 16 }}>🏍️ PERFECT ROUND — Not a single mistake.</div>
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
                  ? "🏍️ You know the rules. Go get that Code 1 licence."
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
