import { useState, useEffect, useRef } from "react";

// ─── ALL PATTERNS GROUPED BY FAMILY ─────────────────────────────────────────
const PATTERN_GROUPS = [
  {
    id: "distances",
    label: "DISTANCES",
    color: "#007A4D",
    icon: "📏",
    items: [
      { value: "20m", rule: "Number plate lamp visible", detail: "Every letter on the plate must be visible from 20m" },
      { value: "30m", rule: "Stop lamp visible", detail: "Stop lamp must be visible in normal sunlight at 30m" },
      { value: "30m", rule: "Direction indicator visible", detail: "Indicator lamp must be clearly visible at 30m in normal daylight" },
      { value: "45m", rule: "Emergency triangle placement", detail: "Warning sign placed NOT LESS than 45m from the vehicle" },
      { value: "45m", rule: "Dipped beam range", detail: "Dipped headlamp must illuminate ahead to at least 45m" },
      { value: "90m", rule: "Hooter audible", detail: "Hooter must be clearly audible to a person of normal hearing at 90m" },
      { value: "100m", rule: "Main beam (bright) range", detail: "Main beam must illuminate any person/vehicle/object at least 100m ahead" },
      { value: "150m", rule: "Headlamp activation threshold", detail: "Lights required when persons/vehicles not visible at 150m" },
      { value: "150m", rule: "Shoulder driving visibility", detail: "Persons and vehicles must be visible at 150m to drive on shoulder" },
    ],
  },
  {
    id: "parking",
    label: "PARKING CLEARANCES",
    color: "#FF8C00",
    icon: "🅿️",
    items: [
      { value: "5m", rule: "From an intersection", detail: "No parking within 5m of any intersection in an urban area" },
      { value: "6m", rule: "From a tunnel/bridge/constriction", detail: "No stopping within 6m of any tunnel, subway, bridge or road constriction" },
      { value: "9m", rule: "From a pedestrian crossing", detail: "No parking within 9m of the approaching side of a pedestrian crossing" },
      { value: "12m", rule: "Street lamp parking exemption", detail: "Lights not required if parked within 12m of a lit street lamp" },
      { value: "1.5m", rule: "From a fire hydrant", detail: "No parking on the same side as a fire hydrant within 1.5m on either side" },
      { value: "450mm", rule: "Max wheel distance from edge", detail: "No parking with outside of left-hand wheel more than 450mm from the kerb" },
    ],
  },
  {
    id: "speeds",
    label: "SPEED LIMITS",
    color: "#DE3831",
    icon: "⚡",
    items: [
      { value: "30 km/h", rule: "Tow rope/chain maximum speed", detail: "No towing with rope or chain at speeds over 30 km/h" },
      { value: "60 km/h", rule: "Urban area speed limit", detail: "Default speed limit on all public roads within an urban area" },
      { value: "80 km/h", rule: "Heavy goods vehicles (GVM >9000kg)", detail: "Goods vehicles with GVM exceeding 9000kg, articulated vehicles (GCM >9000kg), and breakdown towing" },
      { value: "100 km/h", rule: "General roads outside urban", detail: "Default speed on all public roads outside urban areas (not freeway)" },
      { value: "100 km/h", rule: "Buses & minibuses (max)", detail: "Buses and minibuses are limited to 100 km/h regardless of road type" },
      { value: "120 km/h", rule: "Freeway speed limit", detail: "Default speed limit on all designated freeways" },
    ],
  },
  {
    id: "times",
    label: "TIME LIMITS",
    color: "#FFB612",
    icon: "⏱",
    items: [
      { value: "24 hrs", rule: "Report accident to police", detail: "Must report to police within 24 hours if not reported to a traffic officer at the scene" },
      { value: "24 hrs", rule: "Abandoned vehicle (outside urban)", detail: "Vehicle left 24+ hours in the same place outside an urban area is deemed abandoned" },
      { value: "7 days", rule: "Abandoned vehicle (inside urban)", detail: "Vehicle left 7+ days in the same place inside an urban area is deemed abandoned" },
      { value: "14 days", rule: "Notify change of address", detail: "Must notify registering authority within 14 days of permanently changing residence" },
      { value: "21 days", rule: "Licence disc grace period", detail: "Vehicle may operate for 21 days after disc expiry with expired disc displayed" },
      { value: "12 months", rule: "Vehicle licence disc validity", detail: "Licence disc is valid for 12 months from the first day of the month of issue" },
      { value: "24 months", rule: "Learner's licence validity", detail: "Learner's licence is valid for 24 months from the date the test was passed" },
    ],
  },
  {
    id: "ages",
    label: "AGES & CODES",
    color: "#CC44FF",
    icon: "🪪",
    items: [
      { value: "3 years", rule: "Minimum seatbelt age", detail: "Seatbelt law covers persons 3 years and older" },
      { value: "14 years", rule: "Adult threshold (seatbelts)", detail: "Persons older than 14 are adults. Under 14 but over 1.5m tall are also adults" },
      { value: "1.5m", rule: "Height override for child/adult", detail: "A person under 14 who exceeds 1.5m in height is treated as an adult for seatbelt purposes" },
      { value: "16 years", rule: "Code 1 minimum age", detail: "Must be at least 16 to apply for Code 1 (motorcycle) learner's licence" },
      { value: "17 years", rule: "Code 2 minimum age", detail: "Must be at least 17 to apply for Code 2 (LMV) learner's licence" },
      { value: "18 years", rule: "Code 3 minimum age", detail: "Must be at least 18 to apply for Code 3 (LMV + HMV) learner's licence" },
      { value: "65 years", rule: "Medical certificate required", detail: "Applicants aged 65 or older must submit a medical certificate (form MC) with their application" },
    ],
  },
  {
    id: "engine",
    label: "ENGINE CC THRESHOLDS",
    color: "#00BFFF",
    icon: "🏍",
    items: [
      { value: "50cc", rule: "Pillion passenger minimum (exceed)", detail: "Rider may NOT carry a passenger unless engine capacity EXCEEDS 50cc" },
      { value: "50cc", rule: "Sidecar minimum (exceed)", detail: "No sidecar may be attached to an engine of LESS than 50cc" },
      { value: "50cc", rule: "Freeway minimum", detail: "Motorcycles with engine ≤50cc or electrically powered are prohibited on freeways" },
      { value: "125cc", rule: "Under-18 Code 1 maximum", detail: "If under 18 with Code 1, may only ride motorcycles with engine NOT EXCEEDING 125cc" },
      { value: "200cc", rule: "Handlebar width threshold", detail: "200cc or more = handlebars 600–800mm. Under 200cc = 500–800mm (outside edges)" },
    ],
  },
  {
    id: "alcohol",
    label: "BLOOD ALCOHOL",
    color: "#FF6B9D",
    icon: "🚫",
    items: [
      { value: "0.05g/100ml", rule: "General driver limit (offence AT or above)", detail: "An offence for any driver at 0.05g per 100ml OR MORE. Exactly 0.05g IS an offence." },
      { value: "0.02g/100ml", rule: "Professional driver limit", detail: "Professional drivers commit an offence at 0.02g per 100ml or more — stricter than general drivers" },
    ],
  },
  {
    id: "mass",
    label: "VEHICLE MASS (kg)",
    color: "#FFA500",
    icon: "⚖️",
    items: [
      { value: "230 kg", rule: "Disability vehicle exemption", detail: "Vehicles ≤230kg designed solely for persons with physical defects are not classified as motor vehicles" },
      { value: "750 kg", rule: "Trailer GVM HMV threshold", detail: "A combination where trailer GVM exceeds 750kg makes it an HMV combination" },
      { value: "3,500 kg", rule: "LMV / HMV dividing line", detail: "Vehicles with tare/GVM ≤3500kg = LMV. Exceeding 3500kg = HMV. This is the most important mass threshold." },
      { value: "9,000 kg", rule: "80 km/h speed limit trigger (GVM)", detail: "Goods vehicles with GVM EXCEEDING 9000kg are limited to 80 km/h" },
      { value: "10,000 kg", rule: "Yellow reflective material (GVM)", detail: "Goods vehicles with GVM EXCEEDING 10,000kg must have yellow reflective strips on sides and rear" },
      { value: "12,000 kg", rule: "Length/width restriction trigger", detail: "Trailers and goods vehicles with GVM ≥12,000kg face stricter length and width limits" },
      { value: "24,000 kg", rule: "Haulage tractor GCM limit", detail: "A haulage tractor has a GCM EXCEEDING 24,000kg (truck-tractor is below this)" },
    ],
  },
  {
    id: "dimensions",
    label: "VEHICLE DIMENSIONS",
    color: "#98FF98",
    icon: "📐",
    items: [
      { value: "2.5m", rule: "Max vehicle width (general)", detail: "Any standard vehicle must not exceed 2.5m overall width" },
      { value: "2.6m", rule: "Max width (large bus/goods ≥12000kg GVM)", detail: "Buses with front wheel track >1.9m, and goods vehicles GVM ≥12,000kg may be up to 2.6m wide" },
      { value: "4.3m", rule: "Max vehicle height (general)", detail: "All motor vehicles (including load) must not exceed 4.3m overall height" },
      { value: "4.65m", rule: "Max double-deck bus height", detail: "Exception for double-deck buses: maximum overall height is 4.65m" },
      { value: "8m", rule: "Trailer max length (GVM <12,000kg)", detail: "Non-semi trailer with GVM less than 12,000kg must not exceed 8m in length" },
      { value: "12.5m", rule: "Trailer max length (GVM ≥12,000kg) / other vehicles", detail: "Non-semi trailer (GVM ≥12,000kg) and most other vehicles must not exceed 12.5m" },
      { value: "13.1m", rule: "Max turning radius", detail: "No motor vehicle may be used on a public road with a turning radius exceeding 13.1m" },
      { value: "18.5m", rule: "Max articulated vehicle length", detail: "An articulated motor vehicle must not exceed 18.5m in overall length" },
      { value: "22m", rule: "Max combination / bus-train length", detail: "Any combination of motor vehicles and bus-trains must not exceed 22m in overall length" },
      { value: "3.5m", rule: "Max tow rope / chain length", detail: "The tow-rope or chain between two vehicles must not exceed 3.5m in length" },
    ],
  },
  {
    id: "enclosures",
    label: "ENCLOSURES & PROJECTIONS",
    color: "#FF7F50",
    icon: "📦",
    items: [
      { value: "350mm", rule: "Goods vehicle enclosure — seated persons", detail: "Enclosure must be at least 350mm above the surface on which persons are SEATED" },
      { value: "900mm", rule: "Goods vehicle enclosure — standing persons", detail: "Enclosure must be at least 900mm above the surface on which persons are STANDING" },
      { value: "300mm", rule: "Load projection (rear) — flag required", detail: "Any load projecting MORE than 300mm to the rear must be marked with a red flag" },
      { value: "150mm", rule: "Load projection (side) — flag required", detail: "Any load projecting MORE than 150mm to the side must be marked" },
      { value: "300x300mm", rule: "Warning flag size", detail: "Red warning flags must be 300mm by 300mm" },
      { value: "1.8m", rule: "Max rear projection (LMV/HMV)", detail: "Goods on a light or heavy motor vehicle may not project more than 1.8m beyond the rear of the vehicle" },
    ],
  },
  {
    id: "motorcycle_dims",
    label: "MOTORCYCLE MEASUREMENTS",
    color: "#E0E0E0",
    icon: "🔩",
    items: [
      { value: "500–800mm", rule: "Handlebar width (under 200cc)", detail: "Outside edges of handlebars must be between 500mm and 800mm for engines under 200cc" },
      { value: "600–800mm", rule: "Handlebar width (200cc or more)", detail: "Outside edges of handlebars must be between 600mm and 800mm for engines 200cc or more" },
      { value: "500mm", rule: "Max handgrip height above seat", detail: "The outer ends of handgrips must not be higher than 500mm above the seat height" },
      { value: "1mm", rule: "Minimum tyre tread depth", detail: "Tyres must display a visible tread pattern of at least 1mm across the breadth and circumference" },
      { value: "70%", rule: "Windscreen light transmittance", detail: "Windscreen must allow at least 70% visible light transmittance" },
    ],
  },
  {
    id: "following",
    label: "FOLLOWING DISTANCES",
    color: "#7FDBFF",
    icon: "🚗",
    items: [
      { value: "2 seconds", rule: "LMV and motorcycles (minimum)", detail: "Light motor vehicles and motorcycles must maintain a minimum 2-second following distance" },
      { value: "3 seconds", rule: "Heavy motor vehicles (minimum)", detail: "Heavy motor vehicles must maintain a minimum 3-second following distance" },
    ],
  },
];

// ─── QUIZ QUESTIONS (same-family distractors) ────────────────────────────────
const QUIZ_QUESTIONS = [
  { q: "Stop lamp must be visible at what distance?", correct: "30m", options: ["20m","30m","45m","90m"], explain: "Stop lamp = 30m. Number plate lamp = 20m. Dipped beam = 45m. Hooter = 90m." },
  { q: "Dipped beam headlamp must illuminate at least how far ahead?", correct: "45m", options: ["30m","45m","90m","100m"], explain: "Dipped = 45m. Main beam (bright) = 100m. Stop lamp = 30m. Hooter = 90m." },
  { q: "Main beam (bright) must illuminate how far ahead?", correct: "100m", options: ["45m","90m","100m","150m"], explain: "Main beam = 100m. Dipped = 45m. Hooter = 90m. Light activation threshold = 150m." },
  { q: "Hooter must be audible at what distance?", correct: "90m", options: ["30m","45m","90m","150m"], explain: "Hooter = 90m. Stop lamp/indicators = 30m. Triangle/dipped = 45m. Headlamp threshold = 150m." },
  { q: "Number plate lamp — letters must be visible at what distance?", correct: "20m", options: ["20m","30m","45m","100m"], explain: "Number plate lamp = 20m. Stop lamp = 30m. Triangle = 45m. Main beam = 100m." },
  { q: "Emergency warning triangle must be placed at least how far from the vehicle?", correct: "45m", options: ["20m","30m","45m","90m"], explain: "Triangle = at least 45m. Number plate = 20m. Stop lamp = 30m. Hooter = 90m." },
  { q: "Headlamps required when persons/vehicles aren't clearly visible at what distance?", correct: "150m", options: ["90m","100m","150m","200m"], explain: "150m is the visibility threshold. Hooter = 90m. Main beam = 100m. No 200m rule exists." },
  { q: "No parking within how many metres of a pedestrian crossing (approaching side)?", correct: "9m", options: ["5m","6m","9m","12m"], explain: "Pedestrian crossing = 9m. Intersection = 5m. Tunnel/bridge = 6m. Street lamp exemption = 12m." },
  { q: "No parking within how many metres of an intersection (urban area)?", correct: "5m", options: ["5m","6m","9m","12m"], explain: "Intersection = 5m. Tunnel/bridge stopping = 6m. Pedestrian crossing = 9m. Street lamp = 12m." },
  { q: "No stopping within how many metres of a bridge or tunnel?", correct: "6m", options: ["5m","6m","9m","12m"], explain: "Tunnel/bridge = 6m on either side. Intersection parking = 5m. Pedestrian crossing = 9m." },
  { q: "Lights not required if parked within how many metres of a lit street lamp?", correct: "12m", options: ["6m","9m","12m","15m"], explain: "Street lamp exemption = 12m. Bridge stopping = 6m. Pedestrian crossing = 9m. No 15m rule." },
  { q: "Urban area speed limit (unless otherwise indicated)?", correct: "60 km/h", options: ["30 km/h","60 km/h","80 km/h","100 km/h"], explain: "Urban = 60. Tow rope max = 30. Heavy goods = 80. General road outside urban = 100." },
  { q: "Maximum speed for goods vehicles with GVM exceeding 9,000kg?", correct: "80 km/h", options: ["60 km/h","80 km/h","100 km/h","120 km/h"], explain: "Heavy goods = 80. Urban = 60. General road/buses = 100. Freeway = 120." },
  { q: "Maximum speed for a bus or minibus regardless of road type?", correct: "100 km/h", options: ["60 km/h","80 km/h","100 km/h","120 km/h"], explain: "Bus/minibus = 100 km/h max. Heavy goods = 80. Urban = 60. Freeway general = 120." },
  { q: "Maximum tow rope/chain speed when towing?", correct: "30 km/h", options: ["30 km/h","60 km/h","80 km/h","100 km/h"], explain: "Tow rope = max 30 km/h. Urban limit = 60. Heavy goods = 80. General road = 100." },
  { q: "Vehicle abandoned inside an urban area after how many continuous days?", correct: "7 days", options: ["24 hrs","7 days","14 days","21 days"], explain: "Urban = 7 days. Outside urban = 24 hours. Address change = 14 days. Disc grace period = 21 days." },
  { q: "Vehicle abandoned outside an urban area after how long?", correct: "24 hrs", options: ["24 hrs","7 days","14 days","21 days"], explain: "Outside urban = 24 hours! Inside urban = 7 days. These are very different thresholds." },
  { q: "You must notify the registering authority of your address change within how many days?", correct: "14 days", options: ["7 days","14 days","21 days","30 days"], explain: "Address change = 14 days. Urban abandoned = 7 days. Disc grace period = 21 days. No 30-day rule." },
  { q: "Vehicle licence disc grace period after expiry?", correct: "21 days", options: ["7 days","14 days","21 days","30 days"], explain: "Disc grace = 21 days. Urban abandoned = 7 days. Address change = 14 days. No 30-day grace period." },
  { q: "How long is a learner's licence valid?", correct: "24 months", options: ["12 months","18 months","24 months","36 months"], explain: "Learner's licence = 24 months. Vehicle licence disc = 12 months. No 18 or 36-month rules." },
  { q: "Minimum age to apply for a Code 1 (motorcycle) learner's licence?", correct: "16 years", options: ["14 years","16 years","17 years","18 years"], explain: "Code 1 = 16. Code 2 (LMV) = 17. Code 3 (LMV+HMV) = 18. 14 is the seatbelt adult threshold." },
  { q: "Minimum age to apply for a Code 2 (LMV) learner's licence?", correct: "17 years", options: ["16 years","17 years","18 years","21 years"], explain: "Code 2 = 17. Code 1 = 16. Code 3 = 18. There is no 21-year minimum for any licence." },
  { q: "Minimum age to apply for a Code 3 (LMV + HMV) learner's licence?", correct: "18 years", options: ["16 years","17 years","18 years","21 years"], explain: "Code 3 = 18. Code 2 = 17. Code 1 = 16. Remember: 16, 17, 18 goes Code 1, Code 2, Code 3." },
  { q: "Blood alcohol limit for a GENERAL driver (offence at or above)?", correct: "0.05g/100ml", options: ["0.00g/100ml","0.02g/100ml","0.05g/100ml","0.08g/100ml"], explain: "General = 0.05g/100ml OR MORE. Professional = 0.02g/100ml. No 0.00 or 0.08 limits in SA law." },
  { q: "Blood alcohol limit for a PROFESSIONAL driver?", correct: "0.02g/100ml", options: ["0.00g/100ml","0.02g/100ml","0.05g/100ml","0.08g/100ml"], explain: "Professional driver = 0.02g/100ml. General driver = 0.05g/100ml. Stricter by more than half." },
  { q: "Minimum engine size to carry a pillion passenger on a motorcycle?", correct: "Exceeds 50cc", options: ["At least 50cc","Exceeds 50cc","At least 125cc","At least 200cc"], explain: "Must EXCEED 50cc (not just equal it). Under-18 Code 1 = max 125cc. Handlebar threshold = 200cc." },
  { q: "Under-18 with a Code 1 licence: maximum engine size allowed?", correct: "125cc", options: ["50cc","125cc","200cc","Any size"], explain: "Under-18 on Code 1 = max 125cc. 50cc is the pillion/sidecar threshold. 200cc is the handlebar threshold." },
  { q: "Goods vehicle enclosure height for SEATED passengers?", correct: "350mm", options: ["150mm","300mm","350mm","900mm"], explain: "Seated = 350mm above seating surface. STANDING = 900mm above standing surface. Never mix these two up." },
  { q: "Goods vehicle enclosure height for STANDING passengers?", correct: "900mm", options: ["350mm","500mm","750mm","900mm"], explain: "Standing = 900mm above standing surface. Seated = 350mm. Handgrip height = 500mm above seat." },
  { q: "Maximum overall height for any standard motor vehicle (not a double-deck bus)?", correct: "4.3m", options: ["3.8m","4.0m","4.3m","4.65m"], explain: "Standard vehicle max = 4.3m. Double-deck bus exception = 4.65m." },
  { q: "Maximum overall height for a double-deck bus?", correct: "4.65m", options: ["4.0m","4.3m","4.65m","5.0m"], explain: "Double-deck bus = 4.65m. Standard vehicles = 4.3m. No other height exceptions." },
  { q: "Maximum overall length of an articulated motor vehicle?", correct: "18.5m", options: ["12.5m","16m","18.5m","22m"], explain: "Articulated = 18.5m. Bus-train/combinations = 22m. Other vehicles = 12.5m. No 16m limit." },
  { q: "Maximum overall length of any combination of motor vehicles?", correct: "22m", options: ["18.5m","20m","22m","25m"], explain: "Combinations/bus-trains = 22m max. Articulated = 18.5m. No 20m or 25m limit." },
  { q: "Maximum turning radius allowed for any motor vehicle?", correct: "13.1m", options: ["10m","11.5m","13.1m","15m"], explain: "Turning radius must not exceed 13.1m. This is a fixed number — memorise it exactly." },
  { q: "Maximum length of a tow rope or chain between two vehicles?", correct: "3.5m", options: ["2m","3m","3.5m","5m"], explain: "Tow rope/chain = max 3.5m between vehicles. No other lengths are correct." },
  { q: "Minimum tyre tread depth for a light motor vehicle?", correct: "1mm", options: ["0.5mm","1mm","1.6mm","2mm"], explain: "SA law requires 1mm tread depth across the full breadth and circumference. Not 1.6mm (that's other countries)." },
  { q: "Minimum windscreen visible light transmittance?", correct: "70%", options: ["50%","60%","70%","80%"], explain: "Windscreen must allow at least 70% visible light transmittance. Burn this number in." },
  { q: "LMV minimum following distance?", correct: "2 seconds", options: ["1 second","2 seconds","3 seconds","4 seconds"], explain: "LMV and motorcycles = 2 seconds. Heavy motor vehicles = 3 seconds. Increase in bad conditions." },
  { q: "Heavy motor vehicle minimum following distance?", correct: "3 seconds", options: ["2 seconds","3 seconds","4 seconds","5 seconds"], explain: "HMV = 3 seconds. LMV = 2 seconds. Both must increase in adverse conditions." },
  { q: "Maximum load projection beyond the REAR of a light or heavy motor vehicle?", correct: "1.8m", options: ["0.9m","1.5m","1.8m","2m"], explain: "Rear projection max = 1.8m. Motorcycle rear projection = 900mm (0.9m). No 1.5m or 2m rule here." },
  { q: "The LMV / HMV dividing line by mass is?", correct: "3,500 kg", options: ["2,500 kg","3,000 kg","3,500 kg","4,000 kg"], explain: "3,500kg is the single most important mass threshold. LMV = tare/GVM ≤3,500kg. Above = HMV." },
  { q: "At what GVM must goods vehicles display yellow reflective material?", correct: "Exceeding 10,000 kg", options: ["Exceeding 3,500 kg","Exceeding 9,000 kg","Exceeding 10,000 kg","Exceeding 12,000 kg"], explain: "Yellow reflective strips compulsory for goods vehicles with GVM EXCEEDING 10,000kg. Below = optional." },
];

// ─── SPEED ROUND DATA ─────────────────────────────────────────────────────────
const SPEED_CARDS = [
  { value: "20m", correct: "Number plate lamp visibility", options: ["Number plate lamp visibility","Stop lamp visibility","Dipped beam range","Hooter range"] },
  { value: "30m", correct: "Stop lamp / indicator visibility", options: ["Stop lamp / indicator visibility","Dipped beam range","Triangle distance","Hooter range"] },
  { value: "45m", correct: "Triangle distance / dipped beam", options: ["Triangle distance / dipped beam","Number plate lamp","Stop lamp visibility","Main beam range"] },
  { value: "90m", correct: "Hooter audibility", options: ["Hooter audibility","Main beam range","Dipped beam range","Visibility threshold for lights"] },
  { value: "100m", correct: "Main beam (bright) range", options: ["Main beam (bright) range","Dipped beam range","Hooter range","Visibility threshold"] },
  { value: "150m", correct: "Lights activation threshold", options: ["Lights activation threshold","Main beam range","Hooter range","Triangle distance"] },
  { value: "9m", correct: "Pedestrian crossing parking clearance", options: ["Pedestrian crossing parking clearance","Intersection parking clearance","Bridge/tunnel stopping","Street lamp exemption"] },
  { value: "5m", correct: "Intersection parking clearance", options: ["Intersection parking clearance","Bridge stopping","Pedestrian crossing","Street lamp exemption"] },
  { value: "12m", correct: "Street lamp parking exemption", options: ["Street lamp parking exemption","Bridge stopping","Pedestrian crossing","Intersection parking"] },
  { value: "60 km/h", correct: "Urban area speed limit", options: ["Urban area speed limit","Tow rope speed limit","Heavy goods limit","Freeway limit"] },
  { value: "80 km/h", correct: "Heavy goods / breakdown towing", options: ["Heavy goods / breakdown towing","Urban limit","Bus/minibus max","Freeway limit"] },
  { value: "100 km/h", correct: "General road / bus max", options: ["General road / bus max","Urban limit","Heavy goods limit","Freeway limit"] },
  { value: "120 km/h", correct: "Freeway speed limit", options: ["Freeway speed limit","General road limit","Bus max","Heavy goods limit"] },
  { value: "30 km/h", correct: "Tow rope / chain max speed", options: ["Tow rope / chain max speed","Urban limit","Heavy goods limit","Freeway limit"] },
  { value: "7 days", correct: "Abandoned vehicle (urban)", options: ["Abandoned vehicle (urban)","Abandoned vehicle (outside urban)","Address change notification","Disc grace period"] },
  { value: "24 hrs", correct: "Abandoned vehicle (outside urban) / accident report", options: ["Abandoned vehicle (outside urban) / accident report","Urban abandoned","Address change","Disc grace period"] },
  { value: "14 days", correct: "Address change notification", options: ["Address change notification","Urban abandoned","Disc grace period","Learner's licence validity"] },
  { value: "21 days", correct: "Licence disc grace period", options: ["Licence disc grace period","Urban abandoned","Address change","Accident reporting"] },
  { value: "24 months", correct: "Learner's licence validity", options: ["Learner's licence validity","Disc validity","Disc grace period","Professional permit validity"] },
  { value: "12 months", correct: "Vehicle licence disc validity", options: ["Vehicle licence disc validity","Learner's licence","Disc grace period","Address notification"] },
  { value: "Code 1 — 16 yrs", correct: "Motorcycle licence minimum age", options: ["Motorcycle licence minimum age","LMV licence minimum age","LMV+HMV licence minimum age","Professional driver age"] },
  { value: "Code 2 — 17 yrs", correct: "LMV licence minimum age", options: ["LMV licence minimum age","Motorcycle licence minimum age","LMV+HMV licence minimum age","Seatbelt adult threshold"] },
  { value: "Code 3 — 18 yrs", correct: "LMV + HMV licence minimum age", options: ["LMV + HMV licence minimum age","Motorcycle minimum","LMV minimum","Blood alcohol threshold"] },
  { value: "0.05g/100ml", correct: "General driver alcohol limit", options: ["General driver alcohol limit","Professional driver limit","Zero tolerance limit","No SA law uses this value"] },
  { value: "0.02g/100ml", correct: "Professional driver alcohol limit", options: ["Professional driver alcohol limit","General driver limit","Zero tolerance","Freeway only limit"] },
  { value: "350mm", correct: "Goods vehicle — seated passenger enclosure", options: ["Goods vehicle — seated passenger enclosure","Standing passenger enclosure","Handgrip height above seat","Handlebar minimum width"] },
  { value: "900mm", correct: "Goods vehicle — standing passenger enclosure", options: ["Goods vehicle — standing passenger enclosure","Seated passenger enclosure","Handlebar max width","Sidecar height"] },
  { value: "4.3m", correct: "Standard vehicle max height", options: ["Standard vehicle max height","Double-deck bus max height","Articulated vehicle height","Max load height"] },
  { value: "4.65m", correct: "Double-deck bus max height", options: ["Double-deck bus max height","Standard vehicle height","Any bus height","Freeway overpass height"] },
  { value: "18.5m", correct: "Articulated vehicle max length", options: ["Articulated vehicle max length","Max combination length","Other vehicle max length","Trailer max length"] },
  { value: "22m", correct: "Max combination / bus-train length", options: ["Max combination / bus-train length","Articulated vehicle max","Other vehicle max","Trailer max"] },
  { value: "13.1m", correct: "Maximum turning radius", options: ["Maximum turning radius","Max trailer length","Max combination length","Max articulated length"] },
  { value: "3,500 kg", correct: "LMV / HMV dividing line", options: ["LMV / HMV dividing line","Heavy goods speed trigger","Reflective strip trigger","Width restriction trigger"] },
  { value: "10,000 kg GVM", correct: "Yellow reflective strips compulsory", options: ["Yellow reflective strips compulsory","LMV/HMV boundary","80 km/h speed trigger","Width restriction trigger"] },
  { value: "1mm", correct: "Minimum tyre tread depth", options: ["Minimum tyre tread depth","Windscreen transmittance","Disc grace period","Tow rope maximum"] },
  { value: "70%", correct: "Windscreen light transmittance", options: ["Windscreen light transmittance","Maximum tyre wear","Min tread percentage","Indicator visibility"] },
  { value: "2 seconds", correct: "LMV following distance", options: ["LMV following distance","HMV following distance","Adverse conditions following","Towing following distance"] },
  { value: "3 seconds", correct: "HMV following distance", options: ["HMV following distance","LMV following distance","Motorcycle minimum","Towing minimum"] },
  { value: "50cc", correct: "Pillion / sidecar / freeway minimum (must exceed)", options: ["Pillion / sidecar / freeway minimum (must exceed)","Under-18 Code 1 max engine","Handlebar change threshold","Sidecar minimum"] },
  { value: "125cc", correct: "Under-18 Code 1 max engine size", options: ["Under-18 Code 1 max engine size","Pillion threshold","Handlebar change threshold","Freeway restriction"] },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PatternTrainer({ onBack }) {
  const [mode, setMode] = useState("home");
  const [quizQ, setQuizQ] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongList, setWrongList] = useState([]);
  const [speedCards, setSpeedCards] = useState([]);
  const [sIdx, setSIdx] = useState(0);
  const [speedScore, setSpeedScore] = useState(0);
  const [speedWrong, setSpeedWrong] = useState(0);
  const [speedAnswered, setSpeedAnswered] = useState(false);
  const [speedSelected, setSpeedSelected] = useState(null);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [timedOut, setTimedOut] = useState(false);
  const timerRef = useRef(null);

  const startQuiz = () => {
    setQuizQ(shuffle(QUIZ_QUESTIONS));
    setQIdx(0); setSelected(null); setAnswered(false); setScore(0); setWrongList([]);
    setMode("quiz");
  };

  const startSpeed = () => {
    setSpeedCards(shuffle(SPEED_CARDS));
    setSIdx(0); setSpeedScore(0); setSpeedWrong(0);
    setSpeedAnswered(false); setSpeedSelected(null);
    setTimeLeft(15); setTimedOut(false);
    setMode("speed");
  };

  // Timer for speed mode
  useEffect(() => {
    if (mode === "speed" && !speedAnswered) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            setTimedOut(true);
            setSpeedAnswered(true);
            setSpeedWrong(w => w + 1);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [mode, sIdx, speedAnswered]);

  const handleQuizSelect = (opt) => {
    if (answered) return;
    setSelected(opt);
    setAnswered(true);
    const q = quizQ[qIdx];
    if (opt === q.correct) {
      setScore(s => s + 1);
    } else {
      setWrongList(w => [...w, { q: q.q, yours: opt, correct: q.correct, explain: q.explain }]);
    }
  };

  const nextQuiz = () => {
    if (qIdx < quizQ.length - 1) {
      setQIdx(i => i + 1); setSelected(null); setAnswered(false);
    } else {
      setMode("quizresult");
    }
  };

  const handleSpeedSelect = (opt) => {
    if (speedAnswered) return;
    clearInterval(timerRef.current);
    setSpeedSelected(opt);
    setSpeedAnswered(true);
    const card = speedCards[sIdx];
    if (opt === card.correct) setSpeedScore(s => s + 1);
    else setSpeedWrong(w => w + 1);
  };

  const nextSpeed = () => {
    if (sIdx < speedCards.length - 1) {
      setSIdx(i => i + 1); setSpeedAnswered(false); setSpeedSelected(null);
      setTimeLeft(15); setTimedOut(false);
    } else {
      setMode("speedresult");
    }
  };

  const BG = "#060D07";
  const CARD = "#0D1F10";
  const BORDER = "#1A3020";
  const TEXT = "#E8EDE0";
  const DIM = "#6B7A62";

  // ─── HOME ────────────────────────────────────────────────────────────────────
  if (mode === "home") return (
    <div style={{ minHeight:"100vh", background: BG, fontFamily:"'Georgia', 'Times New Roman', serif", padding:"24px 16px", color: TEXT }}>
      {/* SA flag stripe */}
      <div style={{ display:"flex", height:6, width:"100%", position:"fixed", top:0, left:0, zIndex:10 }}>
        {["#000000","#FFB612","#007A4D","#F5F5F0","#DE3831","#4472CA"].map((c,i) => <div key={i} style={{flex:1,background:c}} />)}
      </div>
      <div style={{ maxWidth:640, margin:"0 auto", paddingTop:14 }}>
        <button onClick={onBack} style={{ background:"transparent", border:`1px solid ${BORDER}`, color:DIM, fontSize:13, padding:"7px 14px", cursor:"pointer", fontFamily:"'Georgia', 'Times New Roman', serif", borderRadius:3, marginBottom:20 }}>← All Drills</button>
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{ fontSize:10, letterSpacing:6, color:DIM, marginBottom:10 }}>K53 PATTERN RECOGNITION</div>
          <div style={{ fontSize:32, fontWeight:900, color:"#fff", lineHeight:1.1, marginBottom:8 }}>
            KNOW YOUR<br/><span style={{ color:"#FFB612" }}>NUMBERS</span>
          </div>
          <p style={{ color:DIM, fontSize:12, lineHeight:1.7, marginTop:12 }}>
            The K53 test is 60% about knowing specific values.<br/>
            Distances. Speeds. Times. Ages. Masses.<br/>
            This trainer burns the patterns into memory.
          </p>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {/* Pattern Map */}
          <button onClick={() => setMode("map")}
            style={{ background: CARD, border:`2px solid #FFB612`, borderRadius:4, padding:"20px 20px", textAlign:"left", cursor:"pointer", fontFamily:"'Georgia', 'Times New Roman', serif" }}>
            <div style={{ color:"#FFB612", fontSize:10, letterSpacing:3, marginBottom:6 }}>MODE 1</div>
            <div style={{ color:"#fff", fontSize:16, fontWeight:900, marginBottom:4 }}>📋 PATTERN MAP</div>
            <div style={{ color:DIM, fontSize:12, lineHeight:1.5 }}>
              Study all values grouped by category. See the relationships. Understand why certain numbers get confused.
            </div>
          </button>

          {/* Number Drill */}
          <button onClick={startQuiz}
            style={{ background: CARD, border:`2px solid #007A4D`, borderRadius:4, padding:"20px 20px", textAlign:"left", cursor:"pointer", fontFamily:"'Georgia', 'Times New Roman', serif" }}>
            <div style={{ color:"#007A4D", fontSize:10, letterSpacing:3, marginBottom:6 }}>MODE 2 — 41 QUESTIONS</div>
            <div style={{ color:"#fff", fontSize:16, fontWeight:900, marginBottom:4 }}>🎯 NUMBER DRILL</div>
            <div style={{ color:DIM, fontSize:12, lineHeight:1.5 }}>
              Every wrong answer option is a real number from the SAME FAMILY. If you confuse 30m and 45m, this will catch you.
            </div>
          </button>

          {/* Speed Round */}
          <button onClick={startSpeed}
            style={{ background: CARD, border:`2px solid #DE3831`, borderRadius:4, padding:"20px 20px", textAlign:"left", cursor:"pointer", fontFamily:"'Georgia', 'Times New Roman', serif" }}>
            <div style={{ color:"#DE3831", fontSize:10, letterSpacing:3, marginBottom:6 }}>MODE 3 — 40 CARDS • 15s PER CARD</div>
            <div style={{ color:"#fff", fontSize:16, fontWeight:900, marginBottom:4 }}>⚡ SPEED MATCH</div>
            <div style={{ color:DIM, fontSize:12, lineHeight:1.5 }}>
              A number/value flashes. 15 seconds to match it to its rule. Runs out = marked wrong. Pure reflex training.
            </div>
          </button>
        </div>

        {/* Confusable pairs cheat */}
        <div style={{ marginTop:32, background: CARD, border:`1px solid ${BORDER}`, borderRadius:4, padding:"18px 16px" }}>
          <div style={{ color:"#DE3831", fontSize:10, letterSpacing:3, marginBottom:14 }}>⚠️ MOST CONFUSABLE PAIRS — STUDY THESE FIRST</div>
          {[
            ["20m", "30m", "45m", "90m", "100m", "150m", "→ all distances, all different rules"],
            ["5m intersection", "9m pedestrian crossing", "12m street lamp", "6m tunnel/bridge", "→ parking/stopping clearances"],
            ["60 urban", "80 heavy goods", "100 general/bus", "120 freeway", "30 tow rope", "→ speed limits km/h"],
            ["24hrs outside urban", "7 days urban", "14 days address", "21 days disc", "→ time limits"],
            ["Code 1=16", "Code 2=17", "Code 3=18", "→ one year apart each"],
            ["350mm seated", "900mm standing", "→ goods vehicle enclosure"],
            ["0.05 general", "0.02 professional", "→ blood alcohol"],
            ["4.3m standard", "4.65m double-deck", "→ vehicle height"],
            ["18.5m articulated", "22m combination", "→ vehicle length"],
          ].map((row, i) => (
            <div key={i} style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:8, paddingBottom:8, borderBottom:`1px solid ${BORDER}` }}>
              {row.map((item, j) => (
                <span key={j} style={{
                  background: item.startsWith("→") ? "transparent" : "#1a1a1a",
                  color: item.startsWith("→") ? DIM : "#FFB612",
                  fontSize: item.startsWith("→") ? 10 : 12,
                  padding: item.startsWith("→") ? "0" : "3px 8px",
                  borderRadius:2,
                  fontWeight: item.startsWith("→") ? 400 : 700,
                  letterSpacing: item.startsWith("→") ? 0 : 1,
                  fontStyle: item.startsWith("→") ? "italic" : "normal",
                }}>{item}</span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ─── PATTERN MAP ─────────────────────────────────────────────────────────────
  if (mode === "map") return (
    <div style={{ minHeight:"100vh", background: BG, fontFamily:"'Georgia', 'Times New Roman', serif", padding:"20px 16px", color: TEXT }}>
      <div style={{ maxWidth:640, margin:"0 auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div>
            <div style={{ color:DIM, fontSize:10, letterSpacing:3 }}>STUDY MODE</div>
            <div style={{ color:"#fff", fontSize:16, fontWeight:900 }}>PATTERN MAP</div>
          </div>
          <button onClick={() => setMode("home")} style={{ background:"transparent", border:`1px solid ${BORDER}`, color:DIM, fontSize:11, padding:"8px 14px", cursor:"pointer", fontFamily:"'Georgia', 'Times New Roman', serif", borderRadius:3 }}>← HOME</button>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {PATTERN_GROUPS.map(group => (
            <div key={group.id} style={{ background: CARD, border:`1px solid ${BORDER}`, borderRadius:4, overflow:"hidden" }}>
              <button
                onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
                style={{ width:"100%", background:"transparent", border:"none", padding:"14px 16px", textAlign:"left", cursor:"pointer", fontFamily:"'Georgia', 'Times New Roman', serif", display:"flex", alignItems:"center", gap:10 }}
              >
                <span style={{ fontSize:16 }}>{group.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ color:group.color, fontSize:10, letterSpacing:3 }}>{group.label}</div>
                  <div style={{ color:"#888", fontSize:11, marginTop:2 }}>{group.items.length} values</div>
                </div>
                <span style={{ color:DIM, fontSize:14 }}>{expandedGroup === group.id ? "▲" : "▼"}</span>
              </button>

              {expandedGroup === group.id && (
                <div style={{ borderTop:`1px solid ${BORDER}` }}>
                  {group.items.map((item, i) => (
                    <div key={i} style={{ padding:"12px 16px", borderBottom: i < group.items.length-1 ? `1px solid #0e0e0e` : "none", display:"flex", gap:14, alignItems:"flex-start" }}>
                      <div style={{ background:"#1a1a1a", color:group.color, fontSize:13, fontWeight:900, padding:"6px 10px", borderRadius:3, minWidth:80, textAlign:"center", letterSpacing:1, flexShrink:0 }}>
                        {item.value}
                      </div>
                      <div>
                        <div style={{ color:"#fff", fontSize:12, fontWeight:700, marginBottom:3 }}>{item.rule}</div>
                        <div style={{ color:DIM, fontSize:11, lineHeight:1.5 }}>{item.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <button onClick={() => setMode("home")} style={{ width:"100%", marginTop:20, padding:"13px", background:"#FFB612", color:"#000", border:"none", borderRadius:4, fontSize:12, fontWeight:900, letterSpacing:3, cursor:"pointer", fontFamily:"'Georgia', 'Times New Roman', serif" }}>
          ← BACK TO HOME
        </button>
      </div>
    </div>
  );

  // ─── NUMBER DRILL QUIZ ────────────────────────────────────────────────────────
  if (mode === "quiz") {
    const q = quizQ[qIdx];
    const progress = (qIdx / quizQ.length) * 100;
    return (
      <div style={{ minHeight:"100vh", background: BG, fontFamily:"'Georgia', 'Times New Roman', serif", padding:"20px 16px", color: TEXT }}>
        <div style={{ maxWidth:640, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div>
              <div style={{ color:"#007A4D", fontSize:10, letterSpacing:3 }}>NUMBER DRILL</div>
              <div style={{ color:"#fff", fontSize:13, fontWeight:700 }}>All wrong options are real values</div>
            </div>
            <div style={{ color:"#FFB612", fontSize:22, fontWeight:900 }}>{score}<span style={{ color:DIM, fontSize:14 }}>/{quizQ.length}</span></div>
          </div>

          <div style={{ height:3, background:"#1a1a1a", borderRadius:2, marginBottom:20 }}>
            <div style={{ height:"100%", width:`${progress}%`, background:"#007A4D", borderRadius:2, transition:"width 0.3s" }} />
          </div>

          <div style={{ color:DIM, fontSize:10, letterSpacing:3, marginBottom:12 }}>Q {qIdx+1} / {quizQ.length}</div>

          <div style={{ background:"#111", border:`1px solid ${BORDER}`, borderRadius:4, padding:"20px", marginBottom:14, fontSize:15, lineHeight:1.7, fontWeight:600, color:"#fff" }}>
            {q.q}
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:9, marginBottom:14 }}>
            {q.options.map((opt, i) => {
              let bc = BORDER, bg = CARD, tc = "#aaa";
              if (answered) {
                if (opt === q.correct) { bc="#007A4D"; bg="#001a12"; tc="#007A4D"; }
                else if (opt === selected) { bc="#DE3831"; bg="#1a0000"; tc="#DE3831"; }
                else { tc="#2a2a2a"; }
              }
              return (
                <button key={i} onClick={() => handleQuizSelect(opt)}
                  style={{ background:bg, border:`2px solid ${bc}`, borderRadius:4, padding:"14px 16px", textAlign:"left", cursor:answered?"default":"pointer", fontFamily:"'Georgia', 'Times New Roman', serif", display:"flex", justifyContent:"space-between", alignItems:"center", transition:"border-color 0.1s" }}
                  onMouseEnter={e => { if(!answered) e.currentTarget.style.borderColor="#007A4D"; }}
                  onMouseLeave={e => { if(!answered) e.currentTarget.style.borderColor=BORDER; }}
                >
                  <span style={{ color:tc, fontSize:16, fontWeight:900, letterSpacing:2 }}>{opt}</span>
                  {answered && opt === q.correct && <span style={{ color:"#007A4D" }}>✓</span>}
                  {answered && opt === selected && opt !== q.correct && <span style={{ color:"#DE3831" }}>✗</span>}
                </button>
              );
            })}
          </div>

          {answered && (
            <div style={{ background: selected===q.correct?"#001a12":"#1a0000", border:`1px solid ${selected===q.correct?"#007A4D":"#DE3831"}`, borderRadius:4, padding:"14px 16px", marginBottom:14 }}>
              <div style={{ color:selected===q.correct?"#007A4D":"#DE3831", fontSize:10, letterSpacing:3, marginBottom:6, fontWeight:900 }}>
                {selected===q.correct?"✓ CORRECT":"✗ LEARN THIS PATTERN"}
              </div>
              <div style={{ color:"#888", fontSize:12, lineHeight:1.6 }}>{q.explain}</div>
            </div>
          )}

          {answered && (
            <button onClick={nextQuiz} style={{ width:"100%", padding:"13px", background:"#007A4D", color:"#000", border:"none", borderRadius:4, fontSize:12, fontWeight:900, letterSpacing:3, cursor:"pointer", fontFamily:"'Georgia', 'Times New Roman', serif" }}>
              {qIdx < quizQ.length-1 ? "NEXT →" : "RESULTS →"}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ─── QUIZ RESULT ─────────────────────────────────────────────────────────────
  if (mode === "quizresult") {
    const pct = Math.round((score/quizQ.length)*100);
    return (
      <div style={{ minHeight:"100vh", background: BG, fontFamily:"'Georgia', 'Times New Roman', serif", padding:"24px 16px", color: TEXT }}>
        <div style={{ maxWidth:640, margin:"0 auto" }}>
          <div style={{ background: pct>=75?"#001a12":"#1a0000", border:`2px solid ${pct>=75?"#007A4D":"#DE3831"}`, borderRadius:4, padding:"28px", textAlign:"center", marginBottom:24 }}>
            <div style={{ color:pct>=75?"#007A4D":"#DE3831", fontSize:10, letterSpacing:4, marginBottom:10 }}>NUMBER DRILL RESULT</div>
            <div style={{ color:"#fff", fontSize:52, fontWeight:900, lineHeight:1 }}>{score}<span style={{ color:"#333" }}>/{quizQ.length}</span></div>
            <div style={{ color:pct>=75?"#007A4D":"#DE3831", fontSize:22, fontWeight:900, marginTop:4 }}>{pct}%</div>
            <div style={{ color:DIM, fontSize:12, marginTop:6 }}>
              {pct>=85?"Number patterns locked in. 🔥":pct>=75?"Solid. Keep drilling the wrong ones.":"Focus on the confusable pairs in the Pattern Map."}
            </div>
          </div>

          {wrongList.length > 0 && (
            <div style={{ marginBottom:24 }}>
              <div style={{ color:"#DE3831", fontSize:10, letterSpacing:3, marginBottom:14 }}>✗ PATTERNS YOU'RE STILL CONFUSING</div>
              {wrongList.map((w,i) => (
                <div key={i} style={{ background:"#111", border:`1px solid #2a0000`, borderRadius:4, padding:"14px", marginBottom:10 }}>
                  <div style={{ color:"#777", fontSize:12, marginBottom:8 }}>{w.q}</div>
                  <div style={{ color:"#DE3831", fontSize:13, fontWeight:900, marginBottom:4 }}>✗ You chose: {w.yours}</div>
                  <div style={{ color:"#007A4D", fontSize:13, fontWeight:900, marginBottom:8 }}>✓ Correct: {w.correct}</div>
                  <div style={{ color:DIM, fontSize:11, lineHeight:1.5, borderTop:`1px solid #1a1a1a`, paddingTop:8 }}>{w.explain}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display:"flex", gap:10 }}>
            <button onClick={startQuiz} style={{ flex:1, padding:"13px", background:"#DE3831", color:"#fff", border:"none", borderRadius:4, fontSize:11, fontWeight:900, letterSpacing:2, cursor:"pointer", fontFamily:"'Georgia', 'Times New Roman', serif" }}>RETRY</button>
            <button onClick={() => setMode("home")} style={{ flex:1, padding:"13px", background:"#FFB612", color:"#000", border:"none", borderRadius:4, fontSize:11, fontWeight:900, letterSpacing:2, cursor:"pointer", fontFamily:"'Georgia', 'Times New Roman', serif" }}>HOME</button>
          </div>
        </div>
      </div>
    );
  }

  // ─── SPEED MATCH ─────────────────────────────────────────────────────────────
  if (mode === "speed") {
    const card = speedCards[sIdx];
    const pct = (timeLeft/15)*100;
    const tColor = timeLeft>8?"#007A4D":timeLeft>4?"#FFB612":"#DE3831";

    return (
      <div style={{ minHeight:"100vh", background: BG, fontFamily:"'Georgia', 'Times New Roman', serif", padding:"20px 16px", color: TEXT }}>
        <div style={{ maxWidth:640, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
            <div>
              <div style={{ color:"#DE3831", fontSize:10, letterSpacing:3 }}>⚡ SPEED MATCH</div>
              <div style={{ color:"#fff", fontSize:12, fontWeight:700 }}>Match the value to its rule</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <span style={{ color:"#007A4D", fontSize:18, fontWeight:900 }}>{speedScore}</span>
              <span style={{ color:DIM, fontSize:12 }}> / </span>
              <span style={{ color:"#DE3831", fontSize:18, fontWeight:900 }}>{speedWrong}</span>
              <div style={{ color:DIM, fontSize:9, letterSpacing:2 }}>RIGHT / WRONG</div>
            </div>
          </div>

          {/* Timer */}
          <div style={{ height:6, background:"#1a1a1a", borderRadius:3, marginBottom:4 }}>
            <div style={{ height:"100%", width:`${pct}%`, background:tColor, borderRadius:3, transition:"width 1s linear" }} />
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
            <span style={{ color:DIM, fontSize:10 }}>Card {sIdx+1} / {speedCards.length}</span>
            <span style={{ color:tColor, fontSize:14, fontWeight:900 }}>{timeLeft}s</span>
          </div>

          {/* Value display */}
          <div style={{ background:"#111", border:`2px solid #FFB612`, borderRadius:4, padding:"28px 20px", textAlign:"center", marginBottom:16 }}>
            <div style={{ color:DIM, fontSize:10, letterSpacing:3, marginBottom:8 }}>THIS VALUE / RULE IS...</div>
            <div style={{ color:"#FFB612", fontSize:36, fontWeight:900, letterSpacing:2, lineHeight:1.2 }}>
              {card.value}
            </div>
          </div>

          {/* Options */}
          <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
            {card.options.map((opt, i) => {
              let bc = BORDER, bg = CARD, tc = "#aaa";
              if (speedAnswered) {
                if (opt === card.correct) { bc="#007A4D"; bg="#001a12"; tc="#007A4D"; }
                else if (opt === speedSelected && opt !== card.correct) { bc="#DE3831"; bg="#1a0000"; tc="#DE3831"; }
                else { tc="#2a2a2a"; }
              }
              return (
                <button key={i} onClick={() => handleSpeedSelect(opt)}
                  style={{ background:bg, border:`2px solid ${bc}`, borderRadius:4, padding:"13px 14px", textAlign:"left", cursor:speedAnswered?"default":"pointer", fontFamily:"'Georgia', 'Times New Roman', serif", transition:"border-color 0.1s", display:"flex", justifyContent:"space-between" }}
                  onMouseEnter={e => { if(!speedAnswered) e.currentTarget.style.borderColor="#FFB612"; }}
                  onMouseLeave={e => { if(!speedAnswered) e.currentTarget.style.borderColor=BORDER; }}
                >
                  <span style={{ color:tc, fontSize:12, lineHeight:1.4 }}>{opt}</span>
                  {speedAnswered && opt===card.correct && <span style={{ color:"#007A4D", flexShrink:0 }}>✓</span>}
                  {speedAnswered && opt===speedSelected && opt!==card.correct && <span style={{ color:"#DE3831", flexShrink:0 }}>✗</span>}
                </button>
              );
            })}
          </div>

          {timedOut && (
            <div style={{ marginTop:12, background:"#1a0000", border:"1px solid #DE3831", borderRadius:4, padding:"12px 14px" }}>
              <div style={{ color:"#DE3831", fontSize:10, letterSpacing:3 }}>⏱ TIME'S UP — CORRECT ANSWER:</div>
              <div style={{ color:"#007A4D", fontSize:14, fontWeight:900, marginTop:6 }}>{card.correct}</div>
            </div>
          )}

          {speedAnswered && (
            <button onClick={nextSpeed} style={{ width:"100%", marginTop:12, padding:"13px", background:"#DE3831", color:"#fff", border:"none", borderRadius:4, fontSize:12, fontWeight:900, letterSpacing:3, cursor:"pointer", fontFamily:"'Georgia', 'Times New Roman', serif" }}>
              {sIdx < speedCards.length-1 ? "NEXT →" : "RESULTS →"}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ─── SPEED RESULT ─────────────────────────────────────────────────────────────
  if (mode === "speedresult") {
    const total = speedCards.length;
    const pct = Math.round((speedScore/total)*100);
    return (
      <div style={{ minHeight:"100vh", background: BG, fontFamily:"'Georgia', 'Times New Roman', serif", padding:"24px 16px", color: TEXT }}>
        <div style={{ maxWidth:640, margin:"0 auto" }}>
          <div style={{ background: pct>=75?"#001a12":"#1a0000", border:`2px solid ${pct>=75?"#007A4D":"#DE3831"}`, borderRadius:4, padding:"28px", textAlign:"center", marginBottom:24 }}>
            <div style={{ color:pct>=75?"#007A4D":"#DE3831", fontSize:10, letterSpacing:4, marginBottom:10 }}>SPEED MATCH RESULT</div>
            <div style={{ color:"#fff", fontSize:48, fontWeight:900, lineHeight:1 }}>
              {speedScore}<span style={{ color:"#333" }}>/{total}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"center", gap:24, marginTop:14 }}>
              <div><div style={{ color:"#007A4D", fontSize:24, fontWeight:900 }}>{speedScore}</div><div style={{ color:DIM, fontSize:10, letterSpacing:2 }}>CORRECT</div></div>
              <div><div style={{ color:"#DE3831", fontSize:24, fontWeight:900 }}>{speedWrong}</div><div style={{ color:DIM, fontSize:10, letterSpacing:2 }}>WRONG/TIMED</div></div>
            </div>
            <div style={{ color:DIM, fontSize:12, marginTop:14 }}>
              {pct>=85?"Instant recall. You're wired. 🔥":pct>=70?"Good reflexes. Drill the slow ones.":"Go back to the Pattern Map and study the groups more."}
            </div>
          </div>

          <div style={{ display:"flex", gap:10 }}>
            <button onClick={startSpeed} style={{ flex:1, padding:"13px", background:"#DE3831", color:"#fff", border:"none", borderRadius:4, fontSize:11, fontWeight:900, letterSpacing:2, cursor:"pointer", fontFamily:"'Georgia', 'Times New Roman', serif" }}>RETRY</button>
            <button onClick={() => setMode("home")} style={{ flex:1, padding:"13px", background:"#FFB612", color:"#000", border:"none", borderRadius:4, fontSize:11, fontWeight:900, letterSpacing:2, cursor:"pointer", fontFamily:"'Georgia', 'Times New Roman', serif" }}>HOME</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}