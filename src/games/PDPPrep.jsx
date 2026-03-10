import { useState, useEffect, useCallback } from 'react';
import T from '../theme.js';

// ── Question Bank ─────────────────────────────────────────────────────────────
// 6 modules × ~17 questions = 100 questions total

const MODULES = [
  { id: 'legislation', label: 'Legislation & PDP Law', icon: '📋' },
  { id: 'dangerous',   label: 'Dangerous Goods',       icon: '☢️' },
  { id: 'accidents',   label: 'Accident Procedures',   icon: '🚨' },
  { id: 'vehicle',     label: 'Vehicle Inspections',   icon: '🔧' },
  { id: 'passengers',  label: 'Passenger Safety',      icon: '🚌' },
  { id: 'economy',     label: 'Economical Driving',    icon: '⛽' },
];

const QUESTIONS = [
  // ── LEGISLATION (17) ──────────────────────────────────────────────────────
  { id: 'leg01', module: 'legislation', q: 'What does PDP stand for?', options: ['Professional Driving Permit','Public Driver Pass','Premium Driver Permit','Provisional Driving Pass'], answer: 0 },
  { id: 'leg02', module: 'legislation', q: 'A PDP is required to drive which of the following?', options: ['A light motor vehicle','A minibus taxi with paying passengers','A private bakkie','A motorcycle'], answer: 1 },
  { id: 'leg03', module: 'legislation', q: 'How long is a PDP valid for?', options: ['1 year','2 years','3 years','5 years'], answer: 0 },
  { id: 'leg04', module: 'legislation', q: 'Which authority issues a PDP in South Africa?', options: ['SAPS','RTMC / Provincial Road Traffic Authority','PRASA','CBRTA'], answer: 1 },
  { id: 'leg05', module: 'legislation', q: 'A driver transporting goods exceeding what mass requires a PDP?', options: ['1 000 kg','3 500 kg','500 kg','750 kg'], answer: 1 },
  { id: 'leg06', module: 'legislation', q: 'PDP holders who transport learners must be at least how old?', options: ['18','21','25','30'], answer: 1 },
  { id: 'leg07', module: 'legislation', q: 'Which Act governs the PDP requirement?', options: ['National Road Traffic Act 93 of 1996','Road Transportation Act','Public Transport Act','Motor Vehicle Act'], answer: 0 },
  { id: 'leg08', module: 'legislation', q: 'A PDP must be renewed at least how many days before expiry to avoid a lapse?', options: ['7','30','60','90'], answer: 2 },
  { id: 'leg09', module: 'legislation', q: 'Which vehicles automatically require a PDP for any driver?', options: ['Vehicles over 10 000 kg GVM','Any vehicle carrying more than 8 persons for reward','Vehicles with a trailer','All of the above'], answer: 3 },
  { id: 'leg10', module: 'legislation', q: 'Driving without a valid PDP when required carries a maximum fine of:', options: ['R500','R2 000','R10 000','R24 000'], answer: 2 },
  { id: 'leg11', module: 'legislation', q: 'A driver\'s professional driving card must be carried:', options: ['Only when crossing provincial borders','At all times while driving professionally','Only when transporting dangerous goods','At home, available on request'], answer: 1 },
  { id: 'leg12', module: 'legislation', q: 'What medical certificate is required for a PDP application?', options: ['Certificate of fitness from any GP','SADC standardised medical certificate','Occupational health certificate','No medical certificate needed'], answer: 1 },
  { id: 'leg13', module: 'legislation', q: 'A PDP can be suspended if the holder accumulates how many demerit points?', options: ['6','9','12','15'], answer: 2 },
  { id: 'leg14', module: 'legislation', q: 'Which code of licence allows driving a bus over 16 seats?', options: ['Code B','Code C1','Code C','Code EB'], answer: 2 },
  { id: 'leg15', module: 'legislation', q: 'The operator of a public transport vehicle must ensure the driver:', options: ['Has a valid PDP and is fit for duty','Holds any valid driving licence','Has completed a basic first-aid course','Owns the vehicle'], answer: 0 },
  { id: 'leg16', module: 'legislation', q: 'Who is responsible for ensuring dangerous goods are correctly declared?', options: ['The driver only','The consignor (sender)','The SAPS','The municipality'], answer: 1 },
  { id: 'leg17', module: 'legislation', q: 'Regulations for hours of work for PDP drivers fall under which authority?', options: ['Department of Labour','Department of Transport','SAPS','Municipality'], answer: 0 },

  // ── DANGEROUS GOODS (17) ─────────────────────────────────────────────────
  { id: 'dg01', module: 'dangerous', q: 'Which UN class covers flammable liquids?', options: ['Class 2','Class 3','Class 4','Class 5'], answer: 1 },
  { id: 'dg02', module: 'dangerous', q: 'What colour is a flammable liquid placard?', options: ['Blue','White','Red','Yellow'], answer: 2 },
  { id: 'dg03', module: 'dangerous', q: 'Explosives fall under which UN Dangerous Goods class?', options: ['Class 1','Class 2','Class 3','Class 8'], answer: 0 },
  { id: 'dg04', module: 'dangerous', q: 'When loading dangerous goods, the driver must check:', options: ['Only the delivery address','Packing, labelling and documentation','The weight of the vehicle only','That no passengers are present'], answer: 1 },
  { id: 'dg05', module: 'dangerous', q: 'An emergency information panel (EIP) must be displayed:', options: ['Only at the rear of the vehicle','On all four sides of the vehicle','Front and rear of the vehicle','Only on the driver\'s door'], answer: 2 },
  { id: 'dg06', module: 'dangerous', q: 'What does a HAZCHEM code indicate?', options: ['The driver\'s hazard rating','Emergency action for first responders','The insurance group of the vehicle','The route to be followed'], answer: 1 },
  { id: 'dg07', module: 'dangerous', q: 'Class 6 dangerous goods are:', options: ['Explosives','Radioactive material','Toxic & infectious substances','Corrosives'], answer: 2 },
  { id: 'dg08', module: 'dangerous', q: 'A driver transporting dangerous goods must carry:', options: ['A fire extinguisher and emergency kit','Only a first-aid kit','A spare tyre and toolkit','A satellite tracker'], answer: 0 },
  { id: 'dg09', module: 'dangerous', q: 'When is a dangerous goods vehicle permit required in South Africa?', options: ['Only for Class 1 explosives','When carrying any listed dangerous goods','Only when crossing provincial borders','Never — just placards are needed'], answer: 1 },
  { id: 'dg10', module: 'dangerous', q: 'Which of the following is Class 2: Gases?', options: ['Petrol','Compressed oxygen','Sodium cyanide','Nitric acid'], answer: 1 },
  { id: 'dg11', module: 'dangerous', q: 'If dangerous goods are spilled on a public road, the driver must first:', options: ['Continue to destination and report later','Stop, warn oncoming traffic and contact emergency services','Move the goods to the roadside','Dilute the spill with water'], answer: 1 },
  { id: 'dg12', module: 'dangerous', q: 'Oxidising substances fall under UN Class:', options: ['4','5','6','7'], answer: 1 },
  { id: 'dg13', module: 'dangerous', q: 'A segregation table is used to determine:', options: ['The route to take','Which goods must not be loaded together','The maximum load mass','Required rest stops'], answer: 1 },
  { id: 'dg14', module: 'dangerous', q: 'Radioactive material is Class:', options: ['5','6','7','8'], answer: 2 },
  { id: 'dg15', module: 'dangerous', q: 'Which document must accompany every dangerous goods consignment?', options: ['Bill of lading only','Transport emergency card (TEC) and consignment note','Tax invoice','Route permit'], answer: 1 },
  { id: 'dg16', module: 'dangerous', q: 'Dangerous goods vehicles may not park within how many metres of an inhabited building overnight?', options: ['50 m','100 m','200 m','500 m'], answer: 1 },
  { id: 'dg17', module: 'dangerous', q: 'Class 9 is described as:', options: ['Explosives','Miscellaneous dangerous substances','Corrosives','Toxic substances'], answer: 1 },

  // ── ACCIDENT PROCEDURES (17) ─────────────────────────────────────────────
  { id: 'acc01', module: 'accidents', q: 'At the scene of an accident, a driver must FIRST:', options: ['Take photos for insurance','Switch off the ignition and secure the scene','Call the media','Move all vehicles off the road'], answer: 1 },
  { id: 'acc02', module: 'accidents', q: 'An accident resulting in injury must be reported to police within:', options: ['24 hours','48 hours','7 days','30 days'], answer: 0 },
  { id: 'acc03', module: 'accidents', q: 'Warning triangles should be placed at least how far from a stationary vehicle?', options: ['10 m','30 m','45 m','100 m'], answer: 2 },
  { id: 'acc04', module: 'accidents', q: 'Triage priority colour for life-threatening but treatable patients is:', options: ['Green','Yellow','Red','Black'], answer: 2 },
  { id: 'acc05', module: 'accidents', q: 'At an accident scene involving a dangerous goods vehicle, the first priority is:', options: ['Collecting all documentation','Keeping bystanders and yourself at least 300 m away and upwind','Calling the insurance company','Taking photos of the placard'], answer: 1 },
  { id: 'acc06', module: 'accidents', q: 'An unconscious casualty who is breathing should be placed in:', options: ['Supine (face up)','The recovery position (lateral)','A seated position','Standing, supported'], answer: 1 },
  { id: 'acc07', module: 'accidents', q: 'Failing to report an accident to the police is:', options: ['A minor traffic infringement','A criminal offence','Permitted if damage is under R1 000','Legal if all parties agree'], answer: 1 },
  { id: 'acc08', module: 'accidents', q: 'The correct ratio of chest compressions to rescue breaths in adult CPR is:', options: ['15:2','30:2','5:1','10:2'], answer: 1 },
  { id: 'acc09', module: 'accidents', q: 'A driver who causes an accident and leaves the scene commits:', options: ['A hit-and-run offence','A civil wrong only','A minor infringement','Nothing if there are no injuries'], answer: 0 },
  { id: 'acc10', module: 'accidents', q: 'When should you NOT move an accident victim?', options: ['When there is a fire risk','When the vehicle is in a dangerous position','When there is a suspected spinal injury unless danger exists','Always move the victim immediately'], answer: 2 },
  { id: 'acc11', module: 'accidents', q: 'The DR ABC mnemonic stands for:', options: ['Danger, Response, Airway, Breathing, Circulation','Drive, React, Assess, Brake, Call','Direction, Route, Ambulance, Bleeding, Crash','Detect, Report, Assist, Block, Call'], answer: 0 },
  { id: 'acc12', module: 'accidents', q: 'An accident report form (ARF) submitted to the RAF must be submitted within:', options: ['24 hours','7 days','3 years of the accident','1 year of the accident'], answer: 2 },
  { id: 'acc13', module: 'accidents', q: 'If you witness but are not involved in an accident, you:', options: ['Must stop and render assistance','Can drive on if others are already there','Must only stop if a passenger asks','Are not obliged to stop'], answer: 0 },
  { id: 'acc14', module: 'accidents', q: 'A defibrillator (AED) should be used when:', options: ['The patient is breathing','The patient has no pulse and is unresponsive','The patient is conscious but bleeding','Any time a patient is injured'], answer: 1 },
  { id: 'acc15', module: 'accidents', q: 'Which fire extinguisher type is suitable for an electrical vehicle fire?', options: ['Water','CO₂ or dry powder','Foam','Wet chemical'], answer: 1 },
  { id: 'acc16', module: 'accidents', q: 'When treating a severely bleeding wound you should:', options: ['Remove embedded objects','Apply direct pressure and elevate if possible','Apply a tourniquet as the first step','Rinse with water immediately'], answer: 1 },
  { id: 'acc17', module: 'accidents', q: 'Information to collect at an accident scene includes:', options: ['Vehicle registrations and driver details only','Registrations, driver details, insurer, witness names, photos and a sketch','The other driver\'s bank details','Only your own vehicle details'], answer: 1 },

  // ── VEHICLE INSPECTIONS (16) ─────────────────────────────────────────────
  { id: 'vi01', module: 'vehicle', q: 'A pre-trip inspection should be done:', options: ['Monthly','Before every trip','Only after a long trip','Whenever the vehicle feels different'], answer: 1 },
  { id: 'vi02', module: 'vehicle', q: 'Tyre tread depth for commercial vehicles must be at least:', options: ['1 mm','1.6 mm','2 mm','3 mm'], answer: 1 },
  { id: 'vi03', module: 'vehicle', q: 'What should you check in the engine bay before a long trip?', options: ['Engine oil, coolant, brake fluid, power-steering fluid','Only engine oil','Only water','Fuel level only'], answer: 0 },
  { id: 'vi04', module: 'vehicle', q: 'An air pressure gauge on air-brake trucks should read at least:', options: ['400 kPa','600 kPa','100 kPa','200 kPa'], answer: 1 },
  { id: 'vi05', module: 'vehicle', q: 'Wheel nut indicators (arrows) are used to detect:', options: ['Correct torque','Loose wheel nuts','Correct alignment','Tyre pressure'], answer: 1 },
  { id: 'vi06', module: 'vehicle', q: 'A roadworthy certificate is valid for:', options: ['6 months','1 year','Until the next service','It doesn\'t expire'], answer: 0 },
  { id: 'vi07', module: 'vehicle', q: 'Brake fade occurs when brakes:', options: ['Are applied too gently','Overheat from prolonged use','Are applied in wet conditions','Squeak during application'], answer: 1 },
  { id: 'vi08', module: 'vehicle', q: 'The GVMR of a vehicle refers to:', options: ['Gross Vehicle Mass Rating','General Vehicle Maintenance Requirement','Government Vehicle Management Record','Grand Volume Measurement Rating'], answer: 0 },
  { id: 'vi09', module: 'vehicle', q: 'King-pin and fifth-wheel coupling play should not exceed:', options: ['5 mm','10 mm','25 mm','50 mm'], answer: 2 },
  { id: 'vi10', module: 'vehicle', q: 'A cracked windscreen in the driver\'s field of vision is:', options: ['Legal if crack is under 5 cm','Illegal and grounds to fail a roadworthy','Acceptable if the crack is horizontal','Not checked in a roadworthy'], answer: 1 },
  { id: 'vi11', module: 'vehicle', q: 'Shock absorbers should be checked by:', options: ['The bounce test (push down each corner)','Only when the vehicle vibrates badly','During annual service only','Feeling steering wheel play'], answer: 0 },
  { id: 'vi12', module: 'vehicle', q: 'What lights are mandatory on a vehicle operating at night?', options: ['Headlights only','Headlights, tail lights, brake lights, and number plate lights','Only hazard lights','Parking lights only'], answer: 1 },
  { id: 'vi13', module: 'vehicle', q: 'A vehicle\'s exhaust emitting black smoke indicates:', options: ['Burning oil','Rich fuel mixture / dirty injectors','Normal diesel operation','Low coolant'], answer: 1 },
  { id: 'vi14', module: 'vehicle', q: 'How often should commercial vehicle air-brake systems be drained of moisture?', options: ['Annually','Monthly','Daily','When the warning light appears'], answer: 2 },
  { id: 'vi15', module: 'vehicle', q: 'The purpose of a retarder on heavy vehicles is to:', options: ['Increase fuel efficiency','Slow the vehicle without using service brakes','Prevent wheel spin on wet roads','Improve steering response'], answer: 1 },
  { id: 'vi16', module: 'vehicle', q: 'A split rim wheel is considered dangerous because:', options: ['It makes the tyre change slower','It can explosively separate if incorrectly assembled','It is heavier than single-piece rims','It causes uneven tyre wear'], answer: 1 },

  // ── PASSENGER SAFETY (17) ────────────────────────────────────────────────
  { id: 'ps01', module: 'passengers', q: 'The maximum number of standing passengers in a bus is determined by:', options: ['The driver\'s preference','The operator\'s licence conditions','The municipality','The size of the bus only'], answer: 1 },
  { id: 'ps02', module: 'passengers', q: 'A PDP holder transporting children to school must ensure all children are:', options: ['Seated if possible','Secured with functional seatbelts','In the rear of the vehicle only','Accompanied by a teacher'], answer: 1 },
  { id: 'ps03', module: 'passengers', q: 'Emergency exit doors on a bus must be:', options: ['Lockable from the outside only','Operable from inside and outside','Welded shut when not in use','Opened only by the driver'], answer: 1 },
  { id: 'ps04', module: 'passengers', q: 'A bus fire extinguisher must be:', options: ['In the boot','Accessible and clearly signed near the driver','Stored under passenger seats','Only required on long-distance buses'], answer: 1 },
  { id: 'ps05', module: 'passengers', q: 'The driver\'s duty when passengers alight includes:', options: ['Stopping only at designated stops and ensuring the door is clear','Letting passengers off anywhere they request','Staying in the vehicle at all times','Allowing passengers off before traffic clears'], answer: 0 },
  { id: 'ps06', module: 'passengers', q: 'Overloading a passenger vehicle is dangerous because:', options: ['It increases fuel costs','It affects braking distance, steering and tyre integrity','The passengers may be uncomfortable','It may upset the schedule'], answer: 1 },
  { id: 'ps07', module: 'passengers', q: 'Which behaviour is specifically prohibited for a professional passenger driver?', options: ['Listening to the radio','Using a hand-held mobile phone while driving','Allowing passengers to eat','Wearing sunglasses'], answer: 1 },
  { id: 'ps08', module: 'passengers', q: 'An operator\'s licence for a minibus taxi specifies the:', options: ['Driver\'s working hours','Route, vehicle and passenger capacity','Type of fuel to be used','Radio frequency used'], answer: 1 },
  { id: 'ps09', module: 'passengers', q: 'A first-aid kit must be carried on buses carrying more than:', options: ['8 passengers','12 passengers','16 passengers','Any number of passengers'], answer: 2 },
  { id: 'ps10', module: 'passengers', q: 'If a passenger falls ill during a trip, the driver should:', options: ['Complete the trip first then seek help','Stop safely, assess the patient and call for assistance if needed','Ask other passengers to assist and continue','Ignore the situation unless others complain'], answer: 1 },
  { id: 'ps11', module: 'passengers', q: 'Defensive driving with passengers means:', options: ['Driving aggressively to stay on time','Anticipating hazards and maintaining safe following distances','Speeding between stops to make up time','Only obeying traffic lights'], answer: 1 },
  { id: 'ps12', module: 'passengers', q: 'School learners may be transported at what maximum speed?', options: ['80 km/h','100 km/h','60 km/h','120 km/h'], answer: 2 },
  { id: 'ps13', module: 'passengers', q: 'Seatbelts in a minibus taxi:', options: ['Are optional for passengers','Must be provided and used by every occupant where fitted','Only needed for front passengers','Are not required by South African law'], answer: 1 },
  { id: 'ps14', module: 'passengers', q: 'A driver who intimidates passengers or drives recklessly can have their PDP:', options: ['Endorsed','Suspended or cancelled','Downgraded to a Code B','None of the above'], answer: 1 },
  { id: 'ps15', module: 'passengers', q: 'Which act protects passengers\' rights in public transport?', options: ['Consumer Protection Act','National Road Traffic Act and operator licence conditions','Municipal Systems Act','Labour Relations Act'], answer: 1 },
  { id: 'ps16', module: 'passengers', q: 'A professional driver should handle a disruptive passenger by:', options: ['Physically removing the passenger','Stopping the vehicle safely and calling for assistance','Ignoring the behaviour','Asking other passengers to intervene'], answer: 1 },
  { id: 'ps17', module: 'passengers', q: 'Passenger comfort and safety in adverse weather requires:', options: ['Increasing speed to reduce exposure time','Reducing speed, increasing following distance and ensuring wipers work','Opening all windows for visibility','Wearing sunglasses to reduce glare'], answer: 1 },

  // ── ECONOMICAL DRIVING (16) ──────────────────────────────────────────────
  { id: 'ec01', module: 'economy', q: 'Which driving technique most improves fuel economy?', options: ['Hard acceleration and early braking','Smooth, progressive acceleration and engine braking','Keeping the engine at high RPM','Using air conditioning constantly'], answer: 1 },
  { id: 'ec02', module: 'economy', q: 'Under-inflated tyres increase fuel consumption by approximately:', options: ['1–2%','5–10%','15–20%','25%'], answer: 1 },
  { id: 'ec03', module: 'economy', q: 'Engine idling for more than how many minutes wastes more fuel than a restart?', options: ['30 seconds','2 minutes','10 minutes','5 minutes'], answer: 1 },
  { id: 'ec04', module: 'economy', q: 'Which gear selection practice saves fuel on a downhill slope?', options: ['Neutral and coast','Engine braking in the highest appropriate gear','Highest gear and full braking','Downshift to first gear'], answer: 1 },
  { id: 'ec05', module: 'economy', q: 'Aerodynamic drag on a truck is most reduced by:', options: ['Opening cab windows','Using a well-fitted cab deflector and closing unnecessary gaps','Removing the side mirrors','Reducing tyre pressure'], answer: 1 },
  { id: 'ec06', module: 'economy', q: 'A correctly maintained air filter can improve fuel economy by up to:', options: ['1%','10%','25%','50%'], answer: 1 },
  { id: 'ec07', module: 'economy', q: 'Cruise control saves fuel mainly on:', options: ['Busy urban roads','Long, flat highways with consistent speed','Mountain passes','Stop-start traffic'], answer: 1 },
  { id: 'ec08', module: 'economy', q: 'Which action during loading improves fuel economy?', options: ['Distribute load evenly and do not overload','Load all weight to the rear axle','Overload to reduce number of trips','Use the heaviest trailer available'], answer: 0 },
  { id: 'ec09', module: 'economy', q: 'The "sweet spot" RPM range for fuel-efficient diesel truck driving is typically:', options: ['Below 1 000 RPM','1 200–1 800 RPM','2 500–3 500 RPM','Above 3 500 RPM'], answer: 1 },
  { id: 'ec10', module: 'economy', q: 'Route planning contributes to fuel economy by:', options: ['Choosing the fastest route regardless of distance','Avoiding traffic congestion, choosing flatter routes and combining trips','Always using national roads','Reducing payload weight'], answer: 1 },
  { id: 'ec11', module: 'economy', q: 'An engine coolant temperature that is too low indicates:', options: ['Normal engine warm-up','A stuck-open thermostat, causing poor fuel economy','Overloading','Efficient combustion'], answer: 1 },
  { id: 'ec12', module: 'economy', q: 'Tachograph data is used to:', options: ['Monitor driving behaviour and hours of service','Control the vehicle remotely','Set speed limiters only','Calculate insurance premiums'], answer: 0 },
  { id: 'ec13', module: 'economy', q: 'Engine oil viscosity that is too thick causes:', options: ['Better lubrication','Increased engine drag and higher fuel use','Cooler engine temperatures','No effect on fuel consumption'], answer: 1 },
  { id: 'ec14', module: 'economy', q: 'Which of the following is a benefit of eco-driving training for a fleet?', options: ['Increased driver wages','Reduced fuel costs, fewer accidents and lower maintenance','Higher vehicle depreciation','None — driver training has no effect on fuel'], answer: 1 },
  { id: 'ec15', module: 'economy', q: 'Air resistance increases with speed at a rate proportional to:', options: ['Speed (linear)','Speed squared','Speed cubed','The square root of speed'], answer: 1 },
  { id: 'ec16', module: 'economy', q: 'Preventive maintenance reduces fuel consumption by ensuring:', options: ['Only oil changes are kept up','All systems operate at peak efficiency','The vehicle looks good','Emissions stay below visible threshold only'], answer: 1 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const HOURS_KEY  = 'k53_pdp_hours';
const PROG_KEY   = 'k53_pdp_progress';
const CERT_KEY   = 'k53_pdp_cert';

function getHours() {
  try { return parseFloat(localStorage.getItem(HOURS_KEY) || '0'); } catch { return 0; }
}
function addHours(h) {
  try { localStorage.setItem(HOURS_KEY, (getHours() + h).toFixed(2)); } catch {}
}
function getProgress() {
  try { return JSON.parse(localStorage.getItem(PROG_KEY) || '{}'); } catch { return {}; }
}
function saveProgress(p) {
  try { localStorage.setItem(PROG_KEY, JSON.stringify(p)); } catch {}
}
function hasCert() {
  try { return localStorage.getItem(CERT_KEY) === 'true'; } catch { return false; }
}
function awardCert() {
  try { localStorage.setItem(CERT_KEY, 'true'); } catch {}
}
function moduleQuestions(moduleId) {
  return QUESTIONS.filter(q => q.module === moduleId);
}
function getModuleScore(progress, moduleId) {
  const qs = moduleQuestions(moduleId);
  const correct = qs.filter(q => progress[q.id] === true).length;
  return { correct, total: qs.length };
}
function allModulesComplete(progress) {
  return MODULES.every(m => {
    const { correct, total } = getModuleScore(progress, m.id);
    return correct / total >= 0.8;
  });
}

// ── PDF Certificate ───────────────────────────────────────────────────────────
function generateCertPDF(hours) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' });
  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>PDP Certificate</title>
<style>
  body { font-family: Georgia, serif; margin: 0; background: #f5f5f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
  .cert { background: white; width: 800px; padding: 60px; border: 8px double #007A4D; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,0.2); }
  .flag { font-size: 48px; margin-bottom: 8px; }
  h1 { color: #007A4D; font-size: 28px; margin: 0 0 4px; letter-spacing: 2px; text-transform: uppercase; }
  h2 { color: #DE3831; font-size: 20px; margin: 0 0 32px; }
  .title { font-size: 36px; font-weight: bold; color: #1a1a2e; margin: 24px 0 8px; }
  .sub { font-size: 18px; color: #555; margin-bottom: 32px; }
  .detail { font-size: 15px; color: #333; margin: 8px 0; }
  .seal { margin: 32px auto; width: 100px; height: 100px; border: 4px solid #FFB612; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 40px; background: #fffbe6; }
  .footer { margin-top: 40px; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 16px; }
</style></head>
<body><div class="cert">
  <div class="flag">🇿🇦</div>
  <h1>K53 Drill Master</h1>
  <h2>Professional Driving Permit Prep Programme</h2>
  <div class="title">Certificate of Completion</div>
  <div class="sub">This certifies that the holder has successfully completed all PDP preparation modules</div>
  <div class="detail">📅 Date: <strong>${dateStr}</strong></div>
  <div class="detail">⏱️ Study Hours Logged: <strong>${hours.toFixed(1)} hours</strong></div>
  <div class="detail">📊 All 6 Modules Completed at ≥80% Pass Rate</div>
  <div class="seal">🏆</div>
  <div class="footer">This certificate is issued by K53 Drill Master for study purposes. It does not replace the official PDP examination issued by the RTMC or provincial authorities.</div>
</div></body></html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `PDP_Certificate_${now.toISOString().slice(0,10)}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function PDPPrep({ onBack }) {
  const [screen, setScreen]         = useState('dashboard'); // dashboard | module | result
  const [activeModule, setActiveModule] = useState(null);
  const [questions, setQuestions]   = useState([]);
  const [qIndex, setQIndex]         = useState(0);
  const [selected, setSelected]     = useState(null);
  const [confirmed, setConfirmed]   = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [progress, setProgress]     = useState(getProgress);
  const [hours, setHours]           = useState(getHours);
  const [sessionStart, setSessionStart] = useState(null);
  const [certified, setCertified]   = useState(hasCert);

  // Track study time
  useEffect(() => {
    if (screen === 'module') setSessionStart(Date.now());
    else if (sessionStart && screen !== 'module') {
      const elapsed = (Date.now() - sessionStart) / 3600000;
      addHours(elapsed);
      setHours(getHours());
      setSessionStart(null);
    }
  }, [screen]);

  // Award cert when all modules pass
  useEffect(() => {
    if (!certified && allModulesComplete(progress)) {
      awardCert();
      setCertified(true);
    }
  }, [progress]);

  const startModule = useCallback((moduleId) => {
    const qs = moduleQuestions(moduleId);
    // shuffle
    const shuffled = [...qs].sort(() => Math.random() - 0.5);
    setActiveModule(moduleId);
    setQuestions(shuffled);
    setQIndex(0);
    setSelected(null);
    setConfirmed(false);
    setSessionCorrect(0);
    setScreen('module');
  }, []);

  const handleSelect = (idx) => {
    if (confirmed) return;
    setSelected(idx);
  };

  const handleConfirm = () => {
    if (selected === null) return;
    setConfirmed(true);
    const q = questions[qIndex];
    const isCorrect = selected === q.answer;
    if (isCorrect) {
      setSessionCorrect(c => c + 1);
      const newProg = { ...progress, [q.id]: true };
      setProgress(newProg);
      saveProgress(newProg);
    }
  };

  const handleNext = () => {
    if (qIndex + 1 < questions.length) {
      setQIndex(i => i + 1);
      setSelected(null);
      setConfirmed(false);
    } else {
      setScreen('result');
    }
  };

  const mod = MODULES.find(m => m.id === activeModule);
  const currentQ = questions[qIndex];

  // ── Dashboard ──────────────────────────────────────────────────────────────
  if (screen === 'dashboard') {
    const totalQ = QUESTIONS.length;
    const totalCorrect = QUESTIONS.filter(q => progress[q.id]).length;
    const pct = Math.round((totalCorrect / totalQ) * 100);

    return (
      <div style={{ minHeight: '100vh', background: T.surface, color: T.text, fontFamily: T.font, padding: '0 0 80px' }}>
        {/* Header */}
        <div style={{ background: '#007A4D', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer' }}>←</button>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>PDP Prep Programme</div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>Professional Driving Permit</div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ color: '#FFB612', fontWeight: 700, fontSize: 22 }}>{hours.toFixed(1)}h</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>studied</div>
          </div>
        </div>

        <div style={{ padding: '20px 20px 0' }}>
          {/* Overall progress */}
          <div style={{ background: T.surfaceAlt, borderRadius: 12, padding: 16, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontWeight: 600 }}>Overall Progress</span>
              <span style={{ color: T.gold, fontWeight: 700 }}>{totalCorrect}/{totalQ} ({pct}%)</span>
            </div>
            <div style={{ background: T.border, borderRadius: 99, height: 10 }}>
              <div style={{ background: '#007A4D', borderRadius: 99, height: 10, width: `${pct}%`, transition: 'width 0.5s' }} />
            </div>
          </div>

          {/* Certificate */}
          {certified && (
            <div style={{ background: 'linear-gradient(135deg,#007A4D,#005a38)', borderRadius: 12, padding: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 32 }}>🏆</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontWeight: 700 }}>All modules passed!</div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>Download your certificate</div>
              </div>
              <button onClick={() => generateCertPDF(hours)} style={{ background: '#FFB612', color: '#1a1a2e', border: 'none', borderRadius: 8, padding: '8px 14px', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                📄 Download
              </button>
            </div>
          )}

          {/* Module cards */}
          <div style={{ fontWeight: 600, fontSize: 14, color: T.dim, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Modules</div>
          {MODULES.map(m => {
            const { correct, total } = getModuleScore(progress, m.id);
            const mpct = Math.round((correct / total) * 100);
            const passed = mpct >= 80;
            return (
              <div key={m.id} onClick={() => startModule(m.id)}
                style={{ background: T.surfaceAlt, border: `1px solid ${passed ? '#007A4D' : T.border}`, borderRadius: 12, padding: '14px 16px', marginBottom: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, transition: 'opacity 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = 0.85}
                onMouseLeave={e => e.currentTarget.style.opacity = 1}
              >
                <span style={{ fontSize: 28 }}>{m.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 15 }}>{m.label}</div>
                  <div style={{ background: T.border, borderRadius: 99, height: 6 }}>
                    <div style={{ background: passed ? '#007A4D' : '#FFB612', borderRadius: 99, height: 6, width: `${mpct}%`, transition: 'width 0.5s' }} />
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, color: passed ? '#007A4D' : T.text }}>{correct}/{total}</div>
                  <div style={{ fontSize: 11, color: passed ? '#007A4D' : T.dim }}>{passed ? '✓ Passed' : `${mpct}%`}</div>
                </div>
              </div>
            );
          })}

          <div style={{ marginTop: 8, padding: '12px 16px', background: T.surfaceAlt, borderRadius: 10, fontSize: 13, color: T.dim, textAlign: 'center' }}>
            Pass all modules at ≥80% to earn your completion certificate
          </div>
        </div>
      </div>
    );
  }

  // ── Result screen ──────────────────────────────────────────────────────────
  if (screen === 'result') {
    const total = questions.length;
    const pct = Math.round((sessionCorrect / total) * 100);
    const passed = pct >= 80;
    return (
      <div style={{ minHeight: '100vh', background: T.surface, color: T.text, fontFamily: T.font, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ fontSize: 64, marginBottom: 12 }}>{passed ? '🎉' : '📚'}</div>
        <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{passed ? 'Module Passed!' : 'Keep Practising'}</div>
        <div style={{ fontSize: 18, color: passed ? '#007A4D' : '#DE3831', fontWeight: 600, marginBottom: 24 }}>
          {sessionCorrect}/{total} correct ({pct}%)
        </div>
        <div style={{ color: T.dim, fontSize: 14, marginBottom: 32, textAlign: 'center' }}>
          {passed ? 'Great work! This module is marked complete.' : 'You need 80% to pass. Review the questions and try again.'}
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={() => startModule(activeModule)} style={{ background: '#007A4D', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 24px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
            Retry Module
          </button>
          <button onClick={() => setScreen('dashboard')} style={{ background: T.surfaceAlt, color: T.text, border: `1px solid ${T.border}`, borderRadius: 10, padding: '12px 24px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
            Back to Modules
          </button>
        </div>
      </div>
    );
  }

  // ── Module quiz ────────────────────────────────────────────────────────────
  const isCorrect = confirmed && selected === currentQ?.answer;
  const isWrong   = confirmed && selected !== currentQ?.answer;

  return (
    <div style={{ minHeight: '100vh', background: T.surface, color: T.text, fontFamily: T.font }}>
      {/* Header */}
      <div style={{ background: '#1a1a2e', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => setScreen('dashboard')} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer' }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{mod?.icon} {mod?.label}</div>
          <div style={{ color: '#FFB612', fontSize: 12 }}>Question {qIndex + 1} of {questions.length}</div>
        </div>
        <div style={{ background: T.border, borderRadius: 99, height: 6, width: 80 }}>
          <div style={{ background: '#FFB612', borderRadius: 99, height: 6, width: `${((qIndex + 1) / questions.length) * 100}%` }} />
        </div>
      </div>

      <div style={{ padding: 20 }}>
        <div style={{ background: T.surfaceAlt, borderRadius: 14, padding: 20, marginBottom: 20, fontSize: 17, lineHeight: 1.55, fontWeight: 500 }}>
          {currentQ?.q}
        </div>

        {currentQ?.options.map((opt, idx) => {
          let bg = T.surfaceAlt;
          let border = T.border;
          let color = T.text;
          if (selected === idx && !confirmed) { bg = '#1a1a2e'; border = '#FFB612'; color = '#FFB612'; }
          if (confirmed && idx === currentQ.answer) { bg = '#003d22'; border = '#007A4D'; color = '#4ade80'; }
          if (confirmed && selected === idx && idx !== currentQ.answer) { bg = '#3d0000'; border = '#DE3831'; color = '#f87171'; }

          return (
            <button key={idx} onClick={() => handleSelect(idx)}
              style={{ display: 'block', width: '100%', textAlign: 'left', background: bg, border: `2px solid ${border}`, borderRadius: 12, padding: '14px 16px', marginBottom: 10, cursor: confirmed ? 'default' : 'pointer', color, fontSize: 15, lineHeight: 1.4, transition: 'all 0.15s' }}>
              <span style={{ fontWeight: 700, marginRight: 8 }}>{String.fromCharCode(65 + idx)}.</span>{opt}
            </button>
          );
        })}

        {!confirmed ? (
          <button onClick={handleConfirm} disabled={selected === null}
            style={{ width: '100%', background: selected === null ? T.border : '#FFB612', color: '#1a1a2e', border: 'none', borderRadius: 12, padding: '16px', fontWeight: 700, fontSize: 16, cursor: selected === null ? 'not-allowed' : 'pointer', marginTop: 8 }}>
            Confirm Answer
          </button>
        ) : (
          <div>
            <div style={{ background: isCorrect ? '#003d22' : '#3d0000', borderRadius: 12, padding: 14, marginBottom: 12, color: isCorrect ? '#4ade80' : '#f87171', fontWeight: 600, fontSize: 15 }}>
              {isCorrect ? '✅ Correct!' : `❌ Incorrect. The answer is: ${currentQ.options[currentQ.answer]}`}
            </div>
            <button onClick={handleNext}
              style={{ width: '100%', background: '#007A4D', color: '#fff', border: 'none', borderRadius: 12, padding: '16px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
              {qIndex + 1 < questions.length ? 'Next Question →' : 'See Results'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
