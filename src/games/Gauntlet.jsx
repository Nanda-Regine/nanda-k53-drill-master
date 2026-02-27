import { useState, useEffect, useRef } from "react";

const TESTS = [
  {
    id: 1,
    title: "ROUND 1: LIGHTS & VEHICLE FITNESS",
    subtitle: "Headlamps, visibility, equipment specs",
    color: "#FFB612",
    questions: [
      {
        q: "You're riding your motorcycle at 2pm on a clear sunny day. What must be true about your headlamp?",
        options: ["Off — it's daytime and visibility is perfect","On — motorcycle headlamps must be lit at ALL times, day and night","On only if visibility is below 150m","On only when riding in tunnels or underpasses"],
        answer: 1,
        explain: "Motorcycles ONLY: headlamps must be lighted AT ALL TIMES — day and night, no exceptions. Cars don't have this rule.",
      },
      {
        q: "Your dipped beam headlamp must allow you to clearly see objects at least how far ahead?",
        options: ["100 metres","150 metres","45 metres","30 metres"],
        answer: 2,
        explain: "Dipped beam = 45m. Main beam (bright) = 100m. These get swapped in tests constantly — burn them into your brain.",
      },
      {
        q: "When MUST headlamps, rear lamps and number plate lamps be lit on a light motor vehicle?",
        options: ["Only between sunset and sunrise","Between sunset and sunrise, AND when visibility is less than 100m","Between sunset and sunrise, AND when persons/vehicles aren't visible at 150m","Anytime the driver feels unsafe"],
        answer: 2,
        explain: "BOTH conditions: after dark, AND any time persons/vehicles aren't clearly visible at 150m distance.",
      },
      {
        q: "You park your car 10 metres from a lit street lamp at night on the roadway. Must your lights be on?",
        options: ["Yes — lights must always be on when parked at night","No — parked within 12m of a lit street lamp is exempt","No — parked vehicles never need lights","Yes — exemption only applies in demarcated bays"],
        answer: 1,
        explain: "Lights not required if parked: off the roadway, in a demarcated parking bay, OR within 12m of a lit street lamp. 10m qualifies.",
      },
      {
        q: "During heavy rain with low visibility, you want to switch on your fog lamps. Is this legal?",
        options: ["Yes — rain causes poor visibility which justifies fog lamps","No — fog lamps are only permitted in snow, fog, mist, dust or smoke","Yes — anytime visibility is reduced you may use fog lamps","No — fog lamps are never legal on public roads"],
        answer: 1,
        explain: "The law lists exactly: snow, fog, mist, dust, smoke. RAIN is NOT on the list. Classic trap.",
      },
      {
        q: "Your stop lamp must be visible at what distance in normal sunlight to a person of normal eyesight?",
        options: ["45 metres","20 metres","100 metres","30 metres"],
        answer: 3,
        explain: "Stop lamps = 30m visible. Number plate lamp = 20m visible. Dipped beam = 45m visibility ahead. Don't mix these up.",
      },
      {
        q: "How many red retro-reflectors must a light motor vehicle have at the rear?",
        options: ["One, on the driver's side only","One, in the centre","Two, one on each side","None — only heavy vehicles need retro-reflectors"],
        answer: 2,
        explain: "LMV = 2 red retro-reflectors at rear, one each side. Motorcycle = 1 red rear. HMV = 2 red rear + yellow side reflectors.",
      },
      {
        q: "What is the minimum visible light transmittance required through a windscreen?",
        options: ["50%","60%","70%","80%"],
        answer: 2,
        explain: "At least 70% visible light transmittance through the windscreen is required.",
      },
      {
        q: "A spot lamp may legally be fitted and used on which of the following?",
        options: ["Any vehicle, as long as the lamp is fixed","A veterinarian's vehicle, for professional duties only","Any vehicle belonging to a registered nurse","No private vehicle may ever have a spot lamp"],
        answer: 1,
        explain: "Adjustable spot lamps allowed on emergency vehicles, medical practitioners' and veterinarians' vehicles (professional use), and breakdown/utility vehicles.",
      },
      {
        q: "Your LMV's hooter must be clearly audible from what distance?",
        options: ["45 metres","30 metres","150 metres","90 metres"],
        answer: 3,
        explain: "Hooter must be audible from 90m. Direction indicators visible at 30m. Stop lamp = 30m. Number plate = 20m.",
      },
    ],
  },
  {
    id: 2,
    title: "ROUND 2: LICENCES, CODES & ADMIN",
    subtitle: "Codes, ages, validity, documentation",
    color: "#DE3831",
    questions: [
      {
        q: "You're 17 and want to learn to drive a car. Which code and are you old enough?",
        options: ["Code 2, yes — minimum age is 17","Code 3, yes — minimum age is 17","Code 2, no — minimum age is 18","Code 1, yes — minimum age is 16"],
        answer: 0,
        explain: "Code 2 = LMV (≤3500kg), minimum age 17. Code 3 = LMV AND HMV, minimum age 18. Code 1 = motorcycles only, minimum age 16.",
      },
      {
        q: "You're 16 with a Code 1 learner's licence. What is the maximum motorcycle engine size you can legally ride?",
        options: ["Any size — Code 1 has no engine restriction","Up to 200cc","Up to 125cc","Up to 50cc"],
        answer: 2,
        explain: "Under 18 with Code 1 = maximum 125cc. Once you're 18+ on Code 1, any engine size is permitted.",
      },
      {
        q: "You passed your learner's test this morning. How long is it valid?",
        options: ["12 months","18 months","24 months","36 months"],
        answer: 2,
        explain: "Learner's licence = valid 24 months from test date. Vehicle licence disc = 12 months. Don't mix these up.",
      },
      {
        q: "You moved to a new house last week. By when must you notify the registering authority?",
        options: ["Within 7 days","Within 14 days","Within 30 days","No legal obligation"],
        answer: 1,
        explain: "Within 14 days of permanently changing your place of residence, notify the registering authority in your new area.",
      },
      {
        q: "Your vehicle licence disc expired 15 days ago. You're driving to a shop. Legal?",
        options: ["No — illegal from the day it expires","Yes — there is a 21-day grace period","Yes — there is a 30-day grace period","Only if driving directly to a licensing office"],
        answer: 1,
        explain: "A 21-day grace period applies after expiry. Within 21 days you may still operate the vehicle with the expired disc displayed.",
      },
      {
        q: "You hold a Code 1 learner's licence. Your friend wants to ride pillion. Can you carry them?",
        options: ["Yes, if both wear helmets","Yes, if your engine is over 125cc","No — Code 1 learner's licence does not authorise passengers","Yes, but only during daylight"],
        answer: 2,
        explain: "A Code 1 learner's licence explicitly prohibits carrying passengers. Full stop.",
      },
      {
        q: "A professional driver is breathalysed. At what blood alcohol level is it an offence?",
        options: ["0.05g per 100ml — same as all drivers","0.02g per 100ml","Zero tolerance — 0.00g","0.08g per 100ml"],
        answer: 1,
        explain: "General drivers = 0.05g/100ml. Professional drivers = stricter limit of 0.02g/100ml.",
      },
      {
        q: "Which is NOT valid acceptable identification for a learner's licence application?",
        options: ["A South African passport","A valid driver's licence card","A certified copy of your birth certificate","A temporary identity certificate"],
        answer: 2,
        explain: "Valid ID: SA ID, SA passport, foreign ID, traffic register number certificate, or a driving licence card. Birth certificates are NOT listed.",
      },
      {
        q: "You are 65 years old and applying for a learner's licence. What EXTRA document is required?",
        options: ["No extra documents","A letter from a family member","A medical certificate (form MC) signed by a medical practitioner","A police clearance certificate"],
        answer: 2,
        explain: "Applicants aged 65 or older must include a medical certificate on form MC signed by a medical practitioner or occupational health practitioner.",
      },
      {
        q: "Where exactly must your vehicle's licence disc be placed?",
        options: ["Anywhere clearly visible on the windscreen","Lower left-hand corner on the inside of the windscreen","Upper right-hand corner on the inside of the windscreen","On the dashboard in front of the driver"],
        answer: 1,
        explain: "Per Regulation 36: disc must be affixed to the lower left-hand corner on the inside of the windscreen (or in a disc holder as prescribed).",
      },
    ],
  },
  {
    id: 3,
    title: "ROUND 3: SPEED, SIZE & LOAD",
    subtitle: "Speed limits, vehicle dimensions, load rules",
    color: "#007A4D",
    questions: [
      {
        q: "You're driving a minibus on a freeway (general limit 120km/h). What is YOUR maximum speed?",
        options: ["120 km/h — freeway limit applies","80 km/h","100 km/h","60 km/h"],
        answer: 2,
        explain: "Buses and minibuses = 100 km/h regardless of road type. The freeway's 120 km/h does NOT apply to them.",
      },
      {
        q: "A breakdown vehicle is towing another vehicle. Maximum speed?",
        options: ["100 km/h","60 km/h","30 km/h","80 km/h"],
        answer: 3,
        explain: "Any breakdown vehicle towing another vehicle is limited to 80 km/h.",
      },
      {
        q: "A goods vehicle has a GVM of EXACTLY 9,000kg. What speed limit applies?",
        options: ["80 km/h","100 km/h outside urban areas","120 km/h on freeways","60 km/h"],
        answer: 1,
        explain: "The 80 km/h limit applies to GVM MORE THAN 9,000kg. At exactly 9,000kg, standard road limits apply.",
      },
      {
        q: "Maximum overall height for a standard motor vehicle (not a double-deck bus)?",
        options: ["4.65 metres","4.0 metres","4.3 metres","5.0 metres"],
        answer: 2,
        explain: "Double-deck bus = 4.65m. ALL other vehicles = 4.3m maximum height including any load.",
      },
      {
        q: "Goods project 400mm beyond the rear of your vehicle. What must you display?",
        options: ["Nothing — only over 1.8m requires marking","A red flag (300x300mm) by day, retro-reflectors at night","A white flag by day and white retro-reflectors at night","An emergency warning triangle 45m behind"],
        answer: 1,
        explain: "Projection more than 300mm to the rear: red flag (300x300mm) by day, retro-reflectors at night. White retro-reflectors face front, red face rear.",
      },
      {
        q: "Passengers are STANDING in your goods vehicle. Enclosure walls must be at least how high above the surface they're standing on?",
        options: ["At least 350mm","At least 900mm","At least 1.2 metres","Standing passengers are always prohibited"],
        answer: 1,
        explain: "Seated = 350mm above seating surface. Standing = 900mm above standing surface. Classic exam swap.",
      },
      {
        q: "What is the maximum turning radius allowed for any motor vehicle on a public road?",
        options: ["10 metres","11.5 metres","13.1 metres","15 metres"],
        answer: 2,
        explain: "Maximum turning radius = 13.1 metres. Exceeding this means the vehicle may not be used on a public road.",
      },
      {
        q: "Which vehicle does NOT need to carry an emergency warning triangle?",
        options: ["A minibus","A goods vehicle","A motor car","A heavy bus"],
        answer: 2,
        explain: "Motor cars, ambulances and motorcycles are specifically excluded. Heavy vehicles, goods vehicles, minibuses and buses must carry one.",
      },
      {
        q: "You break down and place your emergency warning triangle. Minimum distance from your vehicle?",
        options: ["At least 10 metres","At least 20 metres","At least 45 metres","At least 100 metres"],
        answer: 2,
        explain: "Warning sign must be placed NOT LESS THAN 45 metres from the vehicle, in the direction from which traffic will approach.",
      },
      {
        q: "Maximum overall length of a standard articulated motor vehicle?",
        options: ["12.5 metres","22 metres","18.5 metres","24 metres"],
        answer: 2,
        explain: "Articulated motor vehicle = 18.5m max. Bus-trains and combinations = 22m max.",
      },
    ],
  },
  {
    id: 4,
    title: "ROUND 4: ROAD BEHAVIOUR",
    subtitle: "Overtaking, parking, stopping, intersections",
    color: "#FF8C00",
    questions: [
      {
        q: "A vehicle behind you wants to overtake. What should you do?",
        options: ["Speed up so they complete the manoeuvre faster","Move as far left as safely possible and don't accelerate until they've passed","Brake to create space","Flash your hazards to warn oncoming traffic"],
        answer: 1,
        explain: "Move as near to the LEFT edge as safely possible. Do NOT accelerate until the other vehicle has completely passed.",
      },
      {
        q: "You're approaching the crest of a hill and want to overtake. What is the rule?",
        options: ["May overtake if you can see at least 100 metres ahead","May not overtake unless you can do so without crossing into the right-hand lane","You may never overtake within 200 metres of a hill crest","No law prevents overtaking on a hill crest"],
        answer: 1,
        explain: "No passing at crests, curves or restricted-view places UNLESS you can do so without encroaching on the right-hand side of the roadway.",
      },
      {
        q: "How close to a pedestrian crossing may you park (approaching side, urban area)?",
        options: ["3 metres","5 metres","9 metres","12 metres"],
        answer: 2,
        explain: "No parking within 9 metres of the approaching side of a pedestrian crossing. Intersection = 5m. Don't swap these.",
      },
      {
        q: "How close to an intersection may you park in an urban area?",
        options: ["3 metres","5 metres","9 metres","12 metres"],
        answer: 1,
        explain: "No parking within 5 metres of any intersection. Pedestrian crossing = 9m.",
      },
      {
        q: "Towing with a rope at 35 km/h. A passenger is in the towed car. What's the problem?",
        options: ["Tow rope too long — maximum is 2.5 metres","Speed too high — with a rope or chain the limit is 30 km/h","Passengers in towed vehicles are always illegal","Nothing is wrong"],
        answer: 1,
        explain: "Tow-rope or chain = maximum 30 km/h. A draw bar or tow-bar allows higher speeds. Passengers at ≤30 km/h are legal.",
      },
      {
        q: "Your car breaks down with a flat tyre on the roadway. You have no triangle. Is this an offence?",
        options: ["Yes — all vehicles must carry and display a triangle","No — motor cars are not required to carry emergency warning triangles","Yes — all stationary vehicles must display a triangle","No — a flat tyre is beyond your control so no triangle needed"],
        answer: 1,
        explain: "MOTOR CARS are specifically excluded from the triangle requirement. Heavy vehicles, goods vehicles, minibuses and buses must carry one.",
      },
      {
        q: "Minimum following distance for a light motor vehicle?",
        options: ["1 second","2 seconds","3 seconds","4 seconds"],
        answer: 1,
        explain: "2-second minimum for LMV and motorcycles. 3 seconds for heavy motor vehicles. Increase in adverse conditions.",
      },
      {
        q: "The car ahead is indicating to turn RIGHT. May you pass it on the LEFT?",
        options: ["No — you may only pass on the right in South Africa","Yes — this is a permitted exception","Yes, but only if you sound your hooter first","No — you must wait behind the turning vehicle"],
        answer: 1,
        explain: "Passing on the left IS permitted when the vehicle being passed is turning right. Also permitted on one-way roads and when directed by a traffic officer.",
      },
      {
        q: "An ambulance approaches with red warning lights and siren. What does the law require?",
        options: ["Pull over if it's safe — it's a courtesy","Give immediate and absolute right of way","Speed up to clear the lane fast","Slow down only if directly behind you"],
        answer: 1,
        explain: "IMMEDIATE right of way to all emergency vehicles sounding a siren and displaying emergency warning lights. Absolute — no conditions.",
      },
      {
        q: "Minor accident, no injuries, details exchanged. Can you have a quick drink before going to the police station?",
        options: ["Yes — as long as you're no longer driving","Yes — minor accidents with no injuries it's acceptable","No — you may not take intoxicating liquor or drugs before reporting the accident","Yes — as long as blood alcohol stays below 0.05g/100ml"],
        answer: 2,
        explain: "After ANY accident, you may NOT take intoxicating liquor or narcotic drugs before reporting it, except on instructions of a medical practitioner.",
      },
    ],
  },
  {
    id: 5,
    title: "ROUND 5: THE GAUNTLET",
    subtitle: "Mixed ruthless questions — all topics",
    color: "#CC44FF",
    questions: [
      {
        q: "At what age does a person automatically become an adult for seatbelt purposes, regardless of height?",
        options: ["12 years","14 years","16 years","18 years"],
        answer: 1,
        explain: "Older than 14 = automatically adult. Under 14 but taller than 1.5m is ALSO regarded as an adult.",
      },
      {
        q: "You're 13 years old and exactly 1.6m tall. For seatbelt law, are you a child or an adult?",
        options: ["A child — must use child restraint if available","An adult — only needs a standard seatbelt","A child — under 14 regardless of height","Height is irrelevant, only age matters"],
        answer: 1,
        explain: "Under 14 but TALLER than 1.5m = regarded as an adult. At 1.6m you exceed the threshold.",
      },
      {
        q: "Which vehicle is prohibited from using a freeway?",
        options: ["A long-distance bus","A motor quadrucycle","A motorcycle with a 100cc engine","An articulated truck"],
        answer: 1,
        explain: "Motor quadrucycles are prohibited on freeways. Motorcycles above 50cc ARE allowed. Tractors are also prohibited (except for freeway construction/maintenance).",
      },
      {
        q: "Your car is parked in the same urban spot continuously. After how many days is it deemed abandoned?",
        options: ["24 hours","3 days","7 days","14 days"],
        answer: 2,
        explain: "Inside urban area = 7 days continuous = deemed abandoned. Outside urban area = only 24 hours.",
      },
      {
        q: "You want to attach a sidecar to your motorcycle. The engine is 45cc. Legal?",
        options: ["Yes, as long as it's on the left side","No — no sidecar may be attached to an engine under 50cc","Yes, but no passengers allowed","No — sidecars only legal on engines above 125cc"],
        answer: 1,
        explain: "No sidecar may be attached to a motorcycle with engine capacity of LESS than 50cc. 45cc is under the threshold.",
      },
      {
        q: "You're on a one-way urban road wide enough for two lanes. May you pass on the LEFT?",
        options: ["No — you must always pass on the right","Yes — on a one-way urban road with enough width, left passing is allowed","Yes, but only if you sound your hooter","No — wait for a safe right-side gap"],
        answer: 1,
        explain: "On a one-way road in an urban area with enough width for two or more lanes of moving vehicles, passing on the left is explicitly permitted.",
      },
      {
        q: "Where are number plates required on a standard motor car?",
        options: ["One at the back only","One at the front and one at the back","Only at the front","Depends on provincial regulations"],
        answer: 1,
        explain: "Motor cars = one front plate, one rear plate. Motorcycles, motor tricycles and trailers = rear plate only.",
      },
      {
        q: "A motorcycle rider wants to carry a pillion passenger. Minimum engine size?",
        options: ["Engine must EXCEED 50cc","Engine must be at least 125cc","Engine must be at least 200cc","Any engine size"],
        answer: 0,
        explain: "Rider may not carry a passenger unless the motorcycle engine capacity EXCEEDS 50cc. Must exceed, not just equal.",
      },
      {
        q: "Driving on the shoulder while being overtaken — which is NOT a legal requirement?",
        options: ["It must be between sunrise and sunset","You must not endanger yourself or others","Persons and vehicles must be visible at 150m","You must activate your hazard lights"],
        answer: 3,
        explain: "Hazard lights are NOT mentioned as a requirement. The three conditions are: daylight, no endangerment, and 150m visibility.",
      },
      {
        q: "You leave your car unattended on the side of the road. What does the law require?",
        options: ["Switch on hazard lights","Set the brake or use another method to prevent the vehicle from moving","Leave a note with contact details on the dashboard","Leave it in 'Park' or in gear"],
        answer: 1,
        explain: "The law requires setting the brake OR any other method that effectively prevents movement. The specific mechanism is not prescribed.",
      },
    ],
  },
  {
    id: 6,
    title: "ROUND 6: HELMETS, SEATBELTS & BODY PROTECTION",
    subtitle: "Safety gear rules, children, passengers",
    color: "#FF6B9D",
    questions: [
      {
        q: "You're a passenger in the sidecar of a motorcycle. Must you wear a helmet?",
        options: ["No — helmets are only for people on the motorcycle itself","Yes — sidecar passengers must also wear a helmet","Only if the sidecar has no door","Only if you're under 14"],
        answer: 1,
        explain: "Any person riding a motorcycle, motor tricycle, motor quadrucycle OR as a passenger IN A SIDECAR must wear a protective helmet.",
      },
      {
        q: "A motorcycle is fitted with a seatbelt that meets SABS standards and the engine won't start unless the seatbelt is worn. Must the rider wear a helmet?",
        options: ["Yes — helmets are always compulsory on motorcycles","No — in this specific case, a helmet is not required","Only if riding at night","Only if riding on a freeway"],
        answer: 1,
        explain: "Exception: if the motorcycle is equipped with a seatbelt complying with SABS requirements AND the engine cannot move unless the seatbelt is worn, the helmet is NOT required.",
      },
      {
        q: "A motorcycle rider must ensure that any passenger YOUNGER than what age wears a helmet?",
        options: ["Under 12","Under 14","Under 16","Under 18"],
        answer: 1,
        explain: "The rider must ensure any passenger younger than 14 years wears a protective helmet. For older passengers, it is their own responsibility.",
      },
      {
        q: "A child is on a seat with no child restraint available, but a seatbelt is fitted. What must the driver ensure?",
        options: ["The child must be removed from the vehicle","The child wears the seatbelt","The child is placed in the front seat for better supervision","The driver is not legally responsible"],
        answer: 1,
        explain: "If no child restraint is available, the driver must ensure the child wears a seatbelt when one is available.",
      },
      {
        q: "A seatbelt-equipped seat is not available for a child in your vehicle. What must you do?",
        options: ["The child may sit anywhere in the vehicle","Place the child on the rear seat if the vehicle has one","The child cannot travel in the vehicle","Place the child in the front passenger seat"],
        answer: 1,
        explain: "If no seatbelt seat is available, the driver must ensure the child is seated on the rear seat if the vehicle has one.",
      },
      {
        q: "You're doing a 3-point turn and reversing into a driveway. Must you wear your seatbelt?",
        options: ["Yes — seatbelts must always be worn when the vehicle is in motion","No — not compulsory when reversing or moving in or out of a parking bay or area","Only if there are other road users nearby","Only if the speed exceeds 20 km/h"],
        answer: 1,
        explain: "It is NOT compulsory to wear a seatbelt while reversing or moving in or out of a parking bay or area.",
      },
      {
        q: "An adult occupies a seat in a row where some seats have seatbelts and some don't. When is it legal to sit without a seatbelt?",
        options: ["Never — all adults must always wear a seatbelt","Only if all the seatbelt-equipped seats in that row are already occupied","Only if the vehicle is travelling under 60 km/h","Only on back roads"],
        answer: 1,
        explain: "An adult may occupy a non-seatbelt seat in a row only if all other seats in that row which ARE fitted with seatbelts are already occupied.",
      },
      {
        q: "Your helmet's chin strap is loose and unfastened. May you ride?",
        options: ["Yes — it just needs to be worn on your head","Yes — chin straps are a recommendation not a law","No — the helmet must fit properly and the chin strap must be properly fastened under the chin","Only on low-speed roads"],
        answer: 2,
        explain: "The law requires a helmet that fits properly AND of which the chin strap is properly fastened under the chin. Both conditions must be met.",
      },
      {
        q: "Who is ultimately responsible for ensuring all passengers in a motor vehicle wear seatbelts?",
        options: ["Each individual passenger","The vehicle owner","The driver of the motor vehicle","Traffic law enforcement"],
        answer: 2,
        explain: "The driver of a motor vehicle shall ensure that all persons travelling in such motor vehicle wear a seatbelt.",
      },
      {
        q: "At what age does the seatbelt requirement begin (i.e. what is the youngest age covered by the seatbelt law)?",
        options: ["Any age — even infants must be restrained","3 years old","6 years old","The law doesn't specify a minimum age"],
        answer: 1,
        explain: "Seatbelt rules cover persons 3 years of age and older. Children under 3 are not covered by the seatbelt regulation (though they should still be safely restrained).",
      },
    ],
  },
  {
    id: 7,
    title: "ROUND 7: MOTORCYCLES IN DETAIL",
    subtitle: "Riding rules, dimensions, sidecar, duties",
    color: "#00BFFF",
    questions: [
      {
        q: "While riding a motorcycle, how many hands must be on the handlebars at all times?",
        options: ["Both hands at all times","At least one hand at all times","No law specifies — use judgment","Two hands unless signalling"],
        answer: 1,
        explain: "At least one hand on the handlebars at all times while riding. You may remove one hand to give signals.",
      },
      {
        q: "Where must a motorcycle sidecar be attached?",
        options: ["Either side, at the rider's discretion","On the right side of the motorcycle","On the left side of the motorcycle","Sidecars may only be attached at a registered workshop"],
        answer: 2,
        explain: "The sidecar must always be attached to the LEFT side of the motorcycle. No exceptions.",
      },
      {
        q: "You want to overtake another motorcycle while both of you are in the same lane. Is this legal?",
        options: ["Never — motorcycles must always ride single file","Only during the act of overtaking that motorcycle in the same lane","Only on multi-lane roads","Only at speeds below 60 km/h"],
        answer: 1,
        explain: "Motorcycles must ride single file in the same lane EXCEPT in the course of overtaking another motorcycle in that lane.",
      },
      {
        q: "What is the maximum number of motorcycles that may overtake another vehicle at the same time?",
        options: ["Unlimited — they may overtake in a group","Two motorcycles at a time","One at a time — two or more motorcycles shall not overtake another vehicle at the same time","Three at a time if they stay in line"],
        answer: 2,
        explain: "Two or more persons driving motorcycles shall NOT overtake another vehicle at the same time. One motorcycle at a time must overtake.",
      },
      {
        q: "Maximum distance between the outside edges of handlebars on a motorcycle with an engine of 200cc or MORE?",
        options: ["500mm to 800mm","600mm to 800mm","400mm to 900mm","No legal restriction"],
        answer: 1,
        explain: "200cc or more = handlebars between 600mm and 800mm (outside edges). Less than 200cc = 500mm to 800mm. The minimum is different for each class.",
      },
      {
        q: "Motorcycle handgrips must NOT be higher than what measurement above the seat height?",
        options: ["300mm","400mm","500mm","No restriction on height"],
        answer: 2,
        explain: "The outer ends of handgrips must not be higher than 500mm above the seat height, and must not be lower than the seat height either.",
      },
      {
        q: "A motorcycle rider wants to carry an object in front of them. Is this ever legal?",
        options: ["Never — no objects may be carried in front of the rider","Only if the object is securely attached, non-bulky, doesn't obstruct view or control","Only if the object weighs under 5kg","Only if no passenger is being carried"],
        answer: 1,
        explain: "A non-bulky object may be carried in front of the rider IF securely attached or placed in a carrier, and carried so as not to obstruct the rider's view or prevent complete control.",
      },
      {
        q: "Maximum number of adults permitted in a motorcycle sidecar?",
        options: ["One adult only","Two adults","Three adults","No restriction if space permits"],
        answer: 1,
        explain: "A rider may not carry more than two adult persons in a sidecar attached to a motorcycle.",
      },
      {
        q: "May a motorcycle be used to tow another vehicle?",
        options: ["Yes, as long as the tow rope is under 3.5 metres","Yes, at speeds under 30 km/h only","No — no person shall use any motorcycle to tow another vehicle","Only if the motorcycle's GVM exceeds the towed vehicle's mass"],
        answer: 2,
        explain: "The law is absolute: no person shall use any motorcycle to tow another vehicle. No exceptions.",
      },
      {
        q: "All wheels of a motorcycle must maintain contact with the road surface at all times while riding. What does this rule prohibit?",
        options: ["Riding in wet conditions","Wheelies — lifting either wheel off the road surface","Riding on gravel roads","Riding at speeds over 120 km/h"],
        answer: 1,
        explain: "A rider shall ride in such a manner that ALL wheels of the motorcycle are in contact with the road surface at all times. Wheelies are illegal.",
      },
    ],
  },
  {
    id: 8,
    title: "ROUND 8: ACCIDENTS, PEDESTRIANS & SPECIAL SITUATIONS",
    subtitle: "Accident procedure, pedestrians, freeways, animals",
    color: "#FF4500",
    questions: [
      {
        q: "You're involved in an accident where someone is injured. A vehicle is causing a complete obstruction. May you move any vehicle?",
        options: ["Yes — you must clear the road for emergency vehicles immediately","Only if a traffic officer has authorised the removal, OR if you clearly mark the vehicle's position on the road surface first","No vehicle may ever be moved until police arrive","Yes, but only the unoccupied vehicles"],
        answer: 1,
        explain: "If a person is killed or injured and there's a complete obstruction, no vehicle may be moved UNLESS its position is clearly marked on the road surface, OR removal is authorised by a traffic officer.",
      },
      {
        q: "After an accident, how long do you have to report it to a police station if you didn't report to a traffic officer at the scene?",
        options: ["Immediately","Within 6 hours","Within 24 hours","Within 48 hours"],
        answer: 2,
        explain: "If you haven't furnished details to a traffic officer at the scene, you must report the accident to a police station within 24 hours.",
      },
      {
        q: "A pedestrian crossing signal shows a FLASHING red man. The pedestrian has NOT yet entered the roadway. What must they do?",
        options: ["They may cross quickly before the signal fully changes","They must wait until the green man signal is displayed","They may cross if no vehicles are nearby","They may cross — flashing red man means caution only"],
        answer: 1,
        explain: "Pedestrians who have NOT entered the roadway when the red man flashes must wait until the green man is displayed. Only those already in the intersection must cross quickly.",
      },
      {
        q: "A pedestrian is crossing within a demarcated pedestrian crossing. As a driver, what must you do?",
        options: ["Maintain speed — pedestrians must wait for a gap","Sound your hooter to warn the pedestrian","Yield right of way, slow down or stop if necessary","Only yield if the pedestrian has already stepped off the kerb"],
        answer: 2,
        explain: "The driver must yield right of way, slow down or stop if necessary to yield to a pedestrian crossing within a pedestrian crossing.",
      },
      {
        q: "A vehicle has stopped at a pedestrian crossing. You're approaching in the same lane. May you pass the stopped vehicle?",
        options: ["Yes, if the crossing is clear of pedestrians","Yes, but only at a slow speed","No — you may not pass any vehicle stopped at a pedestrian crossing","Only if you can see the crossing is clear"],
        answer: 2,
        explain: "When any vehicle has stopped at a pedestrian crossing, the driver of any OTHER vehicle may NOT pass the stopped vehicle. Period.",
      },
      {
        q: "You're walking on a freeway after your car broke down. Is this legal?",
        options: ["Yes — pedestrians are allowed on the shoulder of freeways","Yes, but only on the left shoulder facing traffic","No — no person shall be on a freeway on foot under normal circumstances","Only if you're walking to the nearest exit"],
        answer: 2,
        explain: "No person shall be on a freeway on foot under normal circumstances. The law is clear on this.",
      },
      {
        q: "You're driving and you see cattle crossing the road. The last cow just stepped off the road. May you proceed?",
        options: ["Yes — once animals are off the road you may proceed","No — you must wait for a signal from the person herding the animals","You must stop at the request or signal of the person herding the animals, and may only move when all animals have crossed and the road is safe","Only proceed if no more animals are visible"],
        answer: 2,
        explain: "You must stop at the request/signal of a person herding bovine animals, horses, donkeys, mules, sheep, goats, pigs or ostriches. You may only move when ALL animals have crossed and the road is safe.",
      },
      {
        q: "Another driver's car has been damaged in an accident. Their car is in the way. Can you remove it?",
        options: ["Yes — clearing the road takes priority","No — the driver or owner of a damaged vehicle must give permission before it can be removed","Only a traffic officer can authorise removal","Yes, if the owner is injured and cannot consent"],
        answer: 1,
        explain: "The driver or owner of a vehicle damaged in a collision must give permission before such vehicle can be removed from the scene.",
      },
      {
        q: "You want to cross a public road. When may you do so?",
        options: ["When you signal your intention to other traffic","When the road is clear of moving traffic for a sufficient distance to cross without obstructing or endangering any traffic","Only at designated crossing points","Only if a traffic officer is present to control traffic"],
        answer: 1,
        explain: "A driver shall not cross a public road unless the road is clear of moving traffic for a sufficient distance to allow crossing without obstructing or endangering any traffic.",
      },
      {
        q: "A person is on a freeway with their animal. They accidentally let it loose and it strays onto the freeway. Is this an offence?",
        options: ["Only if the animal causes an accident","No — animals on freeways are the responsibility of traffic authorities","Yes — no person shall leave an animal in a place from where it may stray onto a freeway","Only if the owner is driving a vehicle at the time"],
        answer: 2,
        explain: "No person shall leave or allow an animal to be on a freeway, or leave an animal in a place from where it may stray onto a freeway.",
      },
    ],
  },
  {
    id: 9,
    title: "ROUND 9: TYRE RULES, ALCOHOL, PHONE & MISC",
    subtitle: "Tyres, drink driving, cellphones, damage, driving duties",
    color: "#9B59B6",
    questions: [
      {
        q: "What is the minimum tyre tread depth required for a light motor vehicle?",
        options: ["0.5mm","1 millimetre","2 millimetres","1.6 millimetres"],
        answer: 1,
        explain: "Light motor vehicles must have pneumatic tyres with at least 1mm of tread depth, visible across the full breadth and around the entire circumference.",
      },
      {
        q: "A motorcycle with an engine of 45cc has a retreaded tyre. Is this legal?",
        options: ["Yes — retreaded tyres are only banned on larger motorcycles","No — motorcycles may not be equipped with retreaded tyres regardless of engine size","Only if the retreaded tyre has the full 1mm tread depth","Yes, for engines under 50cc retreaded tyres are permitted"],
        answer: 1,
        explain: "A rider may not ride a motorcycle on a public road which is equipped with a retreaded tyre. This applies to ALL motorcycles, regardless of engine size.",
      },
      {
        q: "You're driving and holding your phone to your ear with your shoulder. Legal or not?",
        options: ["Legal — the law only prohibits holding it with your hands","Illegal — no person shall hold a communication device with ONE OR BOTH HANDS or with any other part of the body","Legal if stationary at a red light","Legal if using speakerphone"],
        answer: 1,
        explain: "No person shall drive while holding a cellular or mobile telephone or any other communication device in one or both hands OR WITH ANY OTHER PART OF THE BODY. Shoulder = illegal.",
      },
      {
        q: "Your blood alcohol is exactly 0.05g per 100ml. Are you legally allowed to drive?",
        options: ["Yes — the limit is 0.05g so you are exactly at the limit","No — the offence is 0.05g OR MORE, so exactly 0.05g is an offence","Only if you are not a professional driver","Yes — 0.05g is within the legal range"],
        answer: 1,
        explain: "The law states the offence applies at 0.05g per 100ml OR MORE. Exactly 0.05g IS an offence. The word 'or more' is critical here.",
      },
      {
        q: "Your vehicle engine is running while you sit in the driver's seat, but the vehicle isn't moving. You've had a few drinks. Is this an offence?",
        options: ["No — it's only an offence if you're actually driving","Yes — it's an offence to occupy the driver's seat of a running vehicle while under the influence","Only if you're on a public road at the time","No — the offence only applies when the vehicle is in motion"],
        answer: 1,
        explain: "The law covers both DRIVING a vehicle AND occupying the driver's/rider's seat of a motor vehicle of which the engine is running — while under the influence.",
      },
      {
        q: "You spin your wheels doing a burnout on a public road. Is this an offence?",
        options: ["No — burnouts are only illegal on private property","Yes — causing any wheel to drag or spin on the roadway is an offence, except in an emergency","Only if it causes damage to the road surface","Only if other road users are nearby"],
        answer: 1,
        explain: "You may not cause any wheel to drag or spin upon the roadway surface, except in the case of an emergency.",
      },
      {
        q: "May you run your car engine while refuelling (putting petrol in the tank)?",
        options: ["Yes — modern fuel systems make this safe","No — you may not cause or allow the engine to run while fuel is being delivered into the fuel tank","Only if refuelling from a jerry can, not a pump","Yes, for diesel vehicles only"],
        answer: 1,
        explain: "The law explicitly prohibits causing or allowing the engine to run while petrol or other flammable fuel is being delivered into the fuel tank.",
      },
      {
        q: "You leave your car running and unattended (engine on, no one inside). Is this legal?",
        options: ["Yes, as long as it's parked safely","Yes, as long as you can see it from where you are","No — you may not cause or allow the engine to run while the vehicle is stationary and unattended","Only if the handbrake is applied"],
        answer: 2,
        explain: "A driver shall not cause or allow the engine to run while the motor vehicle is stationary and unattended.",
      },
      {
        q: "A driver allows their dog to sit in their lap while driving. Is there a traffic law issue?",
        options: ["No — the law doesn't regulate what's in a driver's lap","Yes — a driver shall not permit any person, animal or object to occupy any position that may prevent exercising complete control over the vehicle","Only if the dog obstructs the windscreen view","Only on freeways"],
        answer: 1,
        explain: "No person driving a vehicle shall permit any person, animal or object to occupy any position in or on such vehicle which may prevent the driver from exercising complete control over the vehicle.",
      },
      {
        q: "A vehicle with a speedometer capable of 60 km/h or more — must it have a working speedometer?",
        options: ["No — speedometers are not legally required","Yes — any vehicle designed for or capable of 60 km/h or more must have a speedometer in good working order","Only heavy motor vehicles require speedometers","Only if the vehicle is used on a freeway"],
        answer: 1,
        explain: "A motor vehicle designed for or capable of reaching 60 km/h or more must be equipped with a speedometer in good working order.",
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

function buildExamQuestions(count = 60) {
  const all = TESTS.flatMap((t) => t.questions.map((q) => ({ ...q, roundColor: t.color, roundTitle: t.title })));
  return shuffle(all).slice(0, count);
}

export default function Code8Gauntlet({ onBack }) {
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
  const [isExamMode, setIsExamMode] = useState(false);
  const [examQuestions, setExamQuestions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timedMode, setTimedMode] = useState(false);
  const timerRef = useRef(null);

  const currentTest = isExamMode ? null : TESTS[testIndex];
  const currentQ = isExamMode ? examQuestions[qIndex] : currentTest?.questions[qIndex];
  const totalQ = isExamMode ? examQuestions.length : currentTest?.questions.length;

  useEffect(() => {
    if (timedMode && screen === "quiz" && !answered) {
      timeLeft <= 0 && answered === false && qIndex >= 0 ? null : null;
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
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
    setWrongAnswers((prev) => [...prev, {
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
      setScore((s) => s + 1);
      const ns = currentStreak + 1;
      setCurrentStreak(ns);
      if (ns > bestStreak) setBestStreak(ns);
    } else {
      setCurrentStreak(0);
      setWrongAnswers((prev) => [...prev, {
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
        setAllScores((prev) => [...prev, {
          testId: currentTest.id,
          title: currentTest.title,
          score,
          total: currentTest.questions.length,
        }]);
      }
      setScreen("result");
    }
  };

  const startTest = (index) => {
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
    const qs = buildExamQuestions(60);
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

  const resetAll = () => {
    setAllScores([]);
    setBestStreak(0);
    setCurrentStreak(0);
    setScreen("home");
  };

  const activeColor = isExamMode ? "#FFB612" : (currentTest?.color || "#FFB612");
  const progress = ((qIndex) / (totalQ || 1)) * 100;
  const isCorrect = answered && selected === currentQ?.answer;
  const totalScore = allScores.reduce((a, b) => a + b.score, 0);

  // ─── HOME ────────────────────────────────────────────────────────────────────
  if (screen === "home") {
    return (
      <div style={{ minHeight: "100vh", background: "#060D07", fontFamily: "'Georgia', 'Times New Roman', serif", padding: "24px 16px" }}>
        {/* SA flag stripe */}
        <div style={{ display:"flex", height:6, width:"100%", position:"fixed", top:0, left:0, zIndex:10 }}>
          {["#000000","#FFB612","#007A4D","#F5F5F0","#DE3831","#4472CA"].map((c,i) => <div key={i} style={{flex:1,background:c}} />)}
        </div>
        <div style={{ maxWidth: 640, margin: "0 auto", paddingTop: 14 }}>
          {/* back button */}
          <button onClick={onBack} style={{ background:"transparent", border:"1px solid #1A3020", color:"#6B7A62", fontSize:13, padding:"7px 14px", cursor:"pointer", fontFamily:"'Georgia', 'Times New Roman', serif", borderRadius:3, marginBottom:20 }}>← All Drills</button>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 11, letterSpacing: 6, color: "#6B7A62", marginBottom: 8, textTransform: "uppercase" }}>South Africa</div>
            <div style={{ display: "inline-block", background: "#FFB612", color: "#000", fontSize: 36, fontWeight: 900, padding: "8px 20px", letterSpacing: -1, marginBottom: 4 }}>
              CODE 8
            </div>
            <div style={{ fontSize: 13, color: "#FFB612", letterSpacing: 4, marginTop: 8 }}>LEARNER'S GAUNTLET — 90 QUESTIONS</div>
            <p style={{ color: "#6B7A62", fontSize: 12, marginTop: 12, lineHeight: 1.6 }}>
              9 rounds • 10 questions each • Plus 60-question exam simulator<br />Pass mark: 7/10 per round
            </p>
          </div>

          {/* Stats bar */}
          {(allScores.length > 0 || bestStreak > 0) && (
            <div style={{ background: "#0D1F10", border: "1px solid #222", borderRadius: 4, padding: "14px 20px", marginBottom: 24, display: "flex", justifyContent: "space-around", textAlign: "center" }}>
              <div><div style={{ color: "#FFB612", fontSize: 22, fontWeight: 900 }}>{totalScore}/{allScores.reduce((a,b)=>a+b.total,0)}</div><div style={{ color: "#6B7A62", fontSize: 10, letterSpacing: 2 }}>TOTAL</div></div>
              <div><div style={{ color: "#007A4D", fontSize: 22, fontWeight: 900 }}>{bestStreak}</div><div style={{ color: "#6B7A62", fontSize: 10, letterSpacing: 2 }}>BEST STREAK</div></div>
              <div><div style={{ color: "#DE3831", fontSize: 22, fontWeight: 900 }}>{allScores.length}/9</div><div style={{ color: "#6B7A62", fontSize: 10, letterSpacing: 2 }}>ROUNDS DONE</div></div>
            </div>
          )}

          {/* EXAM MODE */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ color: "#FFB612", fontSize: 10, letterSpacing: 3, marginBottom: 10 }}>⚡ EXAM SIMULATOR</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => startExam(false)} style={{ flex: 1, background: "#FFB612", color: "#000", border: "none", borderRadius: 4, padding: "14px 10px", fontWeight: 900, fontSize: 12, letterSpacing: 2, cursor: "pointer", fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                60 RANDOM Q's
              </button>
              <button onClick={() => startExam(true)} style={{ flex: 1, background: "#DE3831", color: "#fff", border: "none", borderRadius: 4, padding: "14px 10px", fontWeight: 900, fontSize: 12, letterSpacing: 2, cursor: "pointer", fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                ⏱ TIMED MODE (30s/Q)
              </button>
            </div>
          </div>

          <div style={{ height: 1, background: "#0D1F10", marginBottom: 20 }} />
          <div style={{ color: "#6B7A62", fontSize: 10, letterSpacing: 3, marginBottom: 14 }}>INDIVIDUAL ROUNDS</div>

          {/* Round list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {TESTS.map((test, i) => {
              const done = allScores.find((s) => s.testId === test.id);
              const passed = done && done.score >= PASS_SCORE;
              return (
                <button key={test.id} onClick={() => startTest(i)}
                  style={{ background: "#0D1F10", border: `2px solid ${done ? (passed ? "#007A4D" : "#DE3831") : "#1A3020"}`, borderRadius: 4, padding: "14px 16px", textAlign: "left", cursor: "pointer", fontFamily: "'Georgia', 'Times New Roman', serif", transition: "border-color 0.15s" }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = test.color}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = done ? (passed ? "#007A4D" : "#DE3831") : "#1A3020"}
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

  // ─── QUIZ ────────────────────────────────────────────────────────────────────
  if (screen === "quiz" && currentQ) {
    const timerPct = timedMode ? (timeLeft / 30) * 100 : 100;
    const timerColor = timeLeft > 15 ? "#007A4D" : timeLeft > 7 ? "#FFB612" : "#DE3831";

    return (
      <div style={{ minHeight: "100vh", background: "#060D07", fontFamily: "'Georgia', 'Times New Roman', serif", padding: "20px 16px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <div style={{ color: activeColor, fontSize: 10, letterSpacing: 3 }}>
                {isExamMode ? "⚡ EXAM MODE" : `ROUND ${currentTest.id}`}
                {timedMode && " • TIMED"}
              </div>
              <div style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>
                {isExamMode ? "60-Question Simulator" : currentTest.title.replace(`ROUND ${currentTest.id}: `, "")}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#FFB612", fontSize: 22, fontWeight: 900 }}>{score}</div>
              <div style={{ color: "#333", fontSize: 10, letterSpacing: 2 }}>SCORE</div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height: 3, background: "#0D1F10", borderRadius: 2, marginBottom: timedMode ? 8 : 20, position: "relative" }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${progress}%`, background: activeColor, borderRadius: 2, transition: "width 0.3s" }} />
          </div>

          {/* Timer bar */}
          {timedMode && (
            <div style={{ height: 4, background: "#0D1F10", borderRadius: 2, marginBottom: 20, position: "relative" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${timerPct}%`, background: timerColor, borderRadius: 2, transition: "width 1s linear" }} />
              <div style={{ position: "absolute", right: 0, top: -14, color: timerColor, fontSize: 12, fontWeight: 900 }}>{timeLeft}s</div>
            </div>
          )}

          {/* Q counter + streak */}
          <div style={{ color: "#6B7A62", fontSize: 11, letterSpacing: 3, marginBottom: 12 }}>
            Q {qIndex + 1} / {totalQ}
            {currentStreak >= 3 && <span style={{ color: "#FFB612", marginLeft: 16 }}>🔥 {currentStreak} STREAK</span>}
          </div>

          {/* Question */}
          <div style={{ background: "#0D1F10", border: "1px solid #1e1e1e", borderRadius: 4, padding: "20px", marginBottom: 14, color: "#fff", fontSize: 14, lineHeight: 1.7, fontWeight: 600 }}>
            {currentQ.q}
          </div>

          {/* Options */}
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
                  onMouseEnter={(e) => { if (!answered) e.currentTarget.style.borderColor = activeColor; }}
                  onMouseLeave={(e) => { if (!answered) e.currentTarget.style.borderColor = "#1A3020"; }}
                >
                  <span style={{ color: tc, fontSize: 10, fontWeight: 900, letterSpacing: 1, minWidth: 18, marginTop: 2 }}>{String.fromCharCode(65 + i)}</span>
                  <span style={{ color: tc, fontSize: 13, lineHeight: 1.5 }}>{opt}</span>
                  {answered && i === currentQ.answer && <span style={{ marginLeft: "auto", color: "#007A4D" }}>✓</span>}
                  {answered && i === selected && i !== currentQ.answer && <span style={{ marginLeft: "auto", color: "#DE3831" }}>✗</span>}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showExplain && (
            <div style={{ background: isCorrect ? "#001a12" : "#1a0000", border: `1px solid ${isCorrect ? "#007A4D" : "#DE3831"}`, borderRadius: 4, padding: "14px 16px", marginBottom: 14 }}>
              <div style={{ color: isCorrect ? "#007A4D" : "#DE3831", fontSize: 10, letterSpacing: 3, marginBottom: 8, fontWeight: 900 }}>
                {selected === null ? "⏱ TIME'S UP — LEARN THIS" : isCorrect ? "✓ CORRECT" : "✗ WRONG — LEARN THIS"}
              </div>
              <div style={{ color: "#999", fontSize: 12, lineHeight: 1.6 }}>{currentQ.explain}</div>
            </div>
          )}

          {answered && (
            <button onClick={handleNext} style={{ width: "100%", padding: "13px", background: activeColor, color: "#000", border: "none", borderRadius: 4, fontSize: 12, fontWeight: 900, letterSpacing: 3, cursor: "pointer", fontFamily: "'Georgia', 'Times New Roman', serif" }}>
              {qIndex < totalQ - 1 ? "NEXT →" : "SEE RESULTS →"}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ─── RESULT ──────────────────────────────────────────────────────────────────
  if (screen === "result") {
    const finalTotal = isExamMode ? examQuestions.length : (currentTest?.questions.length || 10);
    const pct = Math.round((score / finalTotal) * 100);
    const passed = isExamMode ? pct >= 70 : score >= PASS_SCORE;

    return (
      <div style={{ minHeight: "100vh", background: "#060D07", fontFamily: "'Georgia', 'Times New Roman', serif", padding: "24px 16px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          {/* Score card */}
          <div style={{ background: passed ? "#001a12" : "#1a0000", border: `2px solid ${passed ? "#007A4D" : "#DE3831"}`, borderRadius: 4, padding: "28px 24px", textAlign: "center", marginBottom: 24 }}>
            <div style={{ color: passed ? "#007A4D" : "#DE3831", fontSize: 10, letterSpacing: 4, marginBottom: 10 }}>
              {isExamMode ? "EXAM RESULT" : `ROUND ${currentTest?.id} RESULT`}
            </div>
            <div style={{ color: "#fff", fontSize: 56, fontWeight: 900, lineHeight: 1 }}>
              {score}<span style={{ color: "#1A3020" }}>/{finalTotal}</span>
            </div>
            <div style={{ color: passed ? "#007A4D" : "#DE3831", fontSize: 20, fontWeight: 900, marginTop: 6 }}>
              {pct}%
            </div>
            <div style={{ color: "#6B7A62", fontSize: 12, marginTop: 6 }}>
              {passed ? (isExamMode ? "EXAM PASSED — You're ready." : "Round passed ✓") : (isExamMode ? `Need 70% to pass — you got ${pct}%` : `Need ${PASS_SCORE}/10 to pass`)}
            </div>
          </div>

          {/* Wrong answers */}
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
              <div style={{ color: "#007A4D", fontSize: 16 }}>🔥 PERFECT ROUND — Not a single mistake.</div>
            </div>
          )}

          {/* Buttons */}
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

          {/* Overall progress (only for round mode) */}
          {!isExamMode && allScores.length === 9 && (
            <div style={{ marginTop: 22, background: "#0D1F10", border: "1px solid #222", borderRadius: 4, padding: "20px", textAlign: "center" }}>
              <div style={{ color: "#FFB612", fontSize: 10, letterSpacing: 3, marginBottom: 8 }}>ALL 9 ROUNDS COMPLETE</div>
              <div style={{ color: "#fff", fontSize: 44, fontWeight: 900 }}>
                {allScores.reduce((a, b) => a + b.score, 0)}/90
              </div>
              <div style={{ color: "#6B7A62", fontSize: 12, marginTop: 6 }}>
                {allScores.reduce((a, b) => a + b.score, 0) >= 63
                  ? "🏆 You know the rules. Go get that licence."
                  : "Keep drilling. Pay special attention to your wrong answers."}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}