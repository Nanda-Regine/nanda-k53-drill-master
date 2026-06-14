// Road Markings — SA Road Traffic Sign Manual (SARTSM)
// Markings are painted on the road surface, not on posts
// Verified against official DLTC documentation

export const ROAD_MARKINGS = [

  // ── REGULATORY TRANSVERSE MARKINGS ────────────────────────────────────────
  {
    id: 'RTM1', name: 'Stop line', code: 'RTM1', category: 'Transverse',
    img: 'no-stopping-line.jpg',
    colour: 'White',
    surface: 'Road surface — transverse (across road)',
    meaning: 'You must stop your vehicle with the front of the vehicle behind this line.',
    action: 'Stop fully. Your front bumper must NOT cross this line.',
    hint: 'Solid white line painted across the road at a Stop sign or traffic light',
    options: ['Stop line', 'Yield line', 'Pedestrian crossing', 'No-stopping line'],
    mnemonic: 'The line is your boundary. Front bumper stays behind it.',
  },
  {
    id: 'RTM2', name: 'Yield line', code: 'RTM2', category: 'Transverse',
    img: 'pedestrian-crossing-ahead-lines.jpg',
    colour: 'White',
    surface: 'Road surface — transverse',
    meaning: 'You must yield to traffic on the intersecting road. Stop before this line if necessary.',
    action: 'Slow down. If traffic is on the crossing road, stop before this line.',
    hint: 'Broken white line across the road at a Yield sign',
    options: ['Yield line', 'Stop line', 'Cycle lane line', 'Warning line'],
    mnemonic: 'Broken line = not a full stop required, but you must yield (stop if needed).',
  },
  {
    id: 'RTM3', name: 'Pedestrian crossing lines', code: 'RTM3', category: 'Transverse',
    img: 'pedestrian-crossing-lines.jpg',
    colour: 'White',
    surface: 'Road surface — transverse',
    meaning: 'An uncontrolled pedestrian crossing. Pedestrians have right of way when using it.',
    action: 'Stop and give way to pedestrians crossing or about to cross. Do not park on or within 9 m of these lines.',
    hint: 'Parallel white stripes (zebra crossing) across the road',
    options: ['Pedestrian crossing lines', 'Cycle crossing', 'Stop line', 'Box junction'],
    mnemonic: 'Zebra stripes = pedestrian crossing. Park within 9m = illegal. Pedestrian = priority.',
  },
  {
    id: 'RTM4', name: 'Bicycle crossing guide lines', code: 'RTM4', category: 'Transverse',
    img: 'bicycle-crossing-guide-lines.jpg',
    colour: 'White',
    surface: 'Road surface — transverse',
    meaning: 'A designated crossing for cyclists. Cyclists have right of way here.',
    action: 'Give way to cyclists crossing. Do not obstruct the crossing.',
    hint: 'Dashed lines with bicycle symbol painted on road',
    options: ['Bicycle crossing', 'Pedestrian crossing', 'Stop line', 'Cycle lane'],
    mnemonic: 'Dashed lines + bicycle symbol = cycle crossing. Give way to cyclists.',
  },

  // ── LONGITUDINAL MARKINGS ──────────────────────────────────────────────────
  {
    id: 'RM1', name: 'Centre line (broken)', code: 'RM1', category: 'Longitudinal',
    img: 'lane-line.jpg',
    colour: 'White',
    surface: 'Road surface — along the road',
    meaning: 'Separates traffic flowing in opposite directions on a two-lane road.',
    action: 'Keep to the left of this line. You MAY cross it to overtake when safe.',
    hint: 'Broken white line running down the middle of a two-lane road',
    options: ['Centre line (broken)', 'Lane line', 'No-overtaking line', 'Edge line'],
    mnemonic: 'Broken = breakable = you CAN cross to overtake (when safe).',
  },
  {
    id: 'RM2', name: 'No-overtaking barrier line', code: 'RM2', category: 'Longitudinal',
    img: 'no-stopping-line.jpg',
    colour: 'White (or Yellow)',
    surface: 'Road surface — along the road',
    meaning: 'A continuous line you may NOT cross to overtake. Indicates reduced visibility or hazard.',
    action: 'Do not cross this line to overtake. You may cross briefly to enter a property.',
    hint: 'Solid continuous white or yellow line — no gaps. Often paired with a broken line on the other side.',
    options: ['No-overtaking barrier', 'Centre line', 'Edge line', 'Lane line'],
    mnemonic: 'Solid = sealed = you cannot break through to overtake. SOLID = SEALED.',
  },
  {
    id: 'RM3', name: 'Lane line', code: 'RM3', category: 'Longitudinal',
    img: 'lane-line.jpg',
    colour: 'White',
    surface: 'Road surface — along the road',
    meaning: 'Separates lanes of traffic flowing in the SAME direction.',
    action: 'Stay within your lane. Change lanes when safe using correct procedure.',
    hint: 'Broken white line between lanes of same-direction traffic (shorter dashes than centre line)',
    options: ['Lane line', 'Centre line', 'Edge line', 'No-overtaking barrier'],
    mnemonic: 'Same direction lanes: broken line (may change lane). Opposite direction: this is the centre line.',
  },
  {
    id: 'RM4', name: 'Edge line', code: 'RM4', category: 'Longitudinal',
    img: 'continuity-line.jpg',
    colour: 'White (or Yellow on left edge)',
    surface: 'Road surface — at road edge',
    meaning: 'Defines the edge of the road. Yellow left edge = do not park here.',
    action: 'Do not drive on the far side of this line (off the road). Yellow = also no parking.',
    hint: 'Solid line at the very edge of the road — white on right, yellow on left',
    options: ['Edge line', 'Lane line', 'No-parking line', 'Fog line'],
    mnemonic: 'Edge = boundary of the road. Yellow edge = no parking either.',
  },
  {
    id: 'RM5', name: 'No-stopping line (red kerb)', code: 'RM5', category: 'Longitudinal',
    img: 'no-stopping-line.jpg',
    colour: 'Red',
    surface: 'Kerb or road edge',
    meaning: 'No stopping whatsoever — not even to load or unload. Matches the R217 sign.',
    action: 'Do not stop your vehicle alongside a red line or kerb under any normal circumstances.',
    hint: 'Red line or painted red kerb edge',
    options: ['No-stopping line', 'No-parking line', 'Edge line', 'Fire hydrant marking'],
    mnemonic: 'RED = most restrictive. Red line / red kerb = NO STOPPING. Same as R217 (Stopping Prohibited).',
  },
  {
    id: 'RM6', name: 'No-parking line (yellow kerb)', code: 'RM6', category: 'Longitudinal',
    img: 'no-parking-line.jpg',
    colour: 'Yellow',
    surface: 'Kerb or road edge',
    meaning: 'No parking, but brief stops for loading/unloading are permitted.',
    action: 'Do not park (leave your vehicle). Brief stops for loading are allowed.',
    hint: 'Yellow line or painted yellow kerb edge',
    options: ['No-parking line', 'No-stopping line', 'Edge line', 'Lane line'],
    mnemonic: 'YELLOW = like amber traffic light = can stop briefly but not park. Matches R216 (Parking Prohibited).',
  },
  {
    id: 'RM7', name: 'Bus stop line', code: 'RM7', category: 'Longitudinal',
    img: 'bus-stop-reservation-sign.jpg',
    colour: 'Yellow',
    surface: 'Road edge / kerb',
    meaning: 'Area reserved for buses to stop. Other vehicles may not park here.',
    action: 'Do not park in a designated bus stop bay.',
    hint: 'Yellow marking with BUS painted on road or kerb',
    options: ['Bus stop', 'No-parking area', 'Taxi bay', 'Loading zone'],
    mnemonic: 'Yellow + BUS lettering = reserved for buses only.',
  },

  // ── WARNING MARKINGS ───────────────────────────────────────────────────────
  {
    id: 'WM1', name: 'Continuity line', code: 'WM1', category: 'Warning',
    img: 'continuity-line.jpg',
    colour: 'White',
    surface: 'Road surface',
    meaning: 'Warns you that a barrier line is ahead. The line gets progressively shorter gaps.',
    action: 'Begin preparations to stay in your lane. Do not start an overtake near this marking.',
    hint: 'Broken line with decreasing gap distances — a warning before a solid barrier line',
    options: ['Continuity line', 'Centre line', 'Lane change zone', 'Warning line'],
    mnemonic: 'Gaps getting shorter = you\'re approaching a solid (no-overtaking) line. Stop overtaking now.',
  },
  {
    id: 'WM2', name: 'Box junction', code: 'WM2', category: 'Warning',
    img: 'box-junction.jpg',
    colour: 'Yellow',
    surface: 'Road surface — intersection',
    meaning: 'You must not enter this box unless your exit is clear. Prevents gridlock.',
    action: 'Only enter the yellow box if your exit road is completely clear and you can drive straight through.',
    hint: 'Yellow criss-cross lines forming a box in the middle of an intersection',
    options: ['Box junction', 'Pedestrian crossing', 'No stopping zone', 'Road markings'],
    mnemonic: 'Yellow box = DO NOT BLOCK the box. Enter only if you can exit immediately.',
  },

  // ── LONGITUDINAL — ADDITIONAL ────────────────────────────────────────────────
  {
    id: 'RM8', name: 'Cycle lane line', code: 'RM8', category: 'Longitudinal',
    img: 'bicycle-crossing-guide-lines.jpg',
    colour: 'White',
    surface: 'Road surface — along the road',
    meaning: 'A marked cycle lane separated from the general traffic lane.',
    action: 'Motor vehicles must NOT drive in the cycle lane. Cyclists must use it where provided.',
    hint: 'Broken or solid white line with bicycle symbol painted in the lane area',
    options: ['Cycle lane line', 'Lane line', 'Edge line', 'Bus lane line'],
    mnemonic: 'Bicycle symbol in a lane = cycle lane. Motor vehicles out. Cyclists in.',
  },
  {
    id: 'RM9', name: 'Yellow zig-zag lines', code: 'RM9', category: 'Longitudinal',
    img: 'no-parking-line.jpg',
    colour: 'Yellow',
    surface: 'Road edge / kerb',
    meaning: 'No stopping or parking in this zone — typically at school or hospital entrances.',
    action: 'Do not stop, park, or wait in this zone at any time. Even brief drop-offs are prohibited.',
    hint: 'Erratic zig-zag yellow lines along the road edge — the pattern signals "keep this area clear"',
    options: ['Yellow zig-zag lines', 'No-parking line', 'No-stopping line', 'Bus stop marking'],
    mnemonic: 'Zig-zag = attention! Yellow zig-zag = strict clearance zone, often near schools or hospitals.',
  },
  {
    id: 'RM10', name: 'Advance stop line (cycle box)', code: 'RM10', category: 'Transverse',
    img: 'bicycle-crossing-guide-lines.jpg',
    colour: 'White',
    surface: 'Road surface — transverse',
    meaning: 'A cycle box — cyclists wait in front of other traffic at a red light.',
    action: 'If driving a motor vehicle, stop at the REAR white line. Do not enter the cycle box between the two lines.',
    hint: 'Two parallel white lines with a bicycle symbol between them — cycle box is the area between the lines',
    options: ['Advance stop line (cycle box)', 'Stop line', 'Yield line', 'Pedestrian crossing'],
    mnemonic: 'Cycle box in front = cyclists get a head start. Motor vehicles stop at the REAR line, not the front.',
  },

  // ── GUIDANCE MARKINGS ──────────────────────────────────────────────────────
  {
    id: 'GM1', name: 'Traffic lane arrows', code: 'GM1', category: 'Guidance',
    img: 'road-markings-symbols.jpg',
    colour: 'White',
    surface: 'Road surface — lane',
    meaning: 'Arrows show which direction you MUST travel in that lane.',
    action: 'Be in the correct lane for your intended direction before reaching the intersection.',
    hint: 'White arrows painted inside lanes (straight, left, right, or combinations)',
    options: ['Lane direction arrows', 'Road markings', 'One-way arrows', 'Guidance lines'],
    mnemonic: 'Arrow in your lane = your required direction. Get in the correct lane EARLY.',
  },
  {
    id: 'GM2', name: 'Painted islands', code: 'GM2', category: 'Guidance',
    img: 'painted-islands.jpg',
    colour: 'White / Yellow diagonal hatching',
    surface: 'Road surface',
    meaning: 'Hatched or painted area that separates traffic flows. Do not drive over it.',
    action: 'Treat like a kerb — do not drive over the hatched area unless it is unavoidable.',
    hint: 'Diagonal white or yellow lines in a triangular or rectangular area on the road',
    options: ['Painted island', 'No-overtaking zone', 'Road diversion', 'Junction marking'],
    mnemonic: 'Hatched diagonal lines = island on the road. Drive around it, not through it.',
  },
  {
    id: 'GM3-school', name: 'School zone word marking', code: 'GM3-S', category: 'Guidance',
    img: 'word-markings.jpg',
    colour: 'White',
    surface: 'Road surface — in front of school entrance',
    meaning: 'The word "SCHOOL" or "SLOW" painted on the road surface marks an active school zone.',
    action: 'Reduce speed significantly. Watch for children at all times — even outside school hours near the sign.',
    hint: '"SCHOOL" or "SLOW" in large white text painted on the road surface, often with a 40 km/h zone',
    options: ['School zone marking', 'Word marking', 'Speed zone', 'Children area'],
    mnemonic: '"SCHOOL" on the road = slow way down. Children are unpredictable. Slower than you think you need to be.',
  },
  {
    id: 'GM3', name: 'Word markings', code: 'GM3', category: 'Guidance',
    img: 'word-markings.jpg',
    colour: 'White',
    surface: 'Road surface',
    meaning: 'Text painted on the road to reinforce a sign or give guidance (STOP, SLOW, BUS, etc.).',
    action: 'Obey the text marking as you would the corresponding sign.',
    hint: 'Large white text painted directly on road surface',
    options: ['Word markings', 'Sign supplement', 'Road instructions', 'Pavement markings'],
    mnemonic: 'Words ON the road reinforce signs BESIDE the road. STOP on road = same as STOP sign.',
  },
];

// ── Categories ────────────────────────────────────────────────────────────────
export const MARKING_CATEGORIES = [
  { id: 'Transverse', label: 'Transverse Markings', color: '#4472CA', description: 'Lines across the road — stop, yield, pedestrian crossings.' },
  { id: 'Longitudinal', label: 'Longitudinal Markings', color: '#007A4D', description: 'Lines along the road — lanes, edges, no-overtaking.' },
  { id: 'Warning', label: 'Warning Markings', color: '#FFB612', description: 'Markings that warn of a change or hazard ahead.' },
  { id: 'Guidance', label: 'Guidance Markings', color: '#6c47ff', description: 'Lane arrows, painted islands, word markings.' },
];

export const KEY_MARKING_COLOURS = [
  { colour: 'White',  meaning: 'Standard markings — lanes, crossings, stop lines, centre lines.' },
  { colour: 'Yellow', meaning: 'Regulatory — no parking (kerb), box junction, bus stops.' },
  { colour: 'Red',    meaning: 'No stopping whatsoever — fire hydrant zones, clearways.' },
];

export function getMarkingsByCategory(category) {
  return ROAD_MARKINGS.filter(m => m.category === category);
}

export function getRandomMarkings(count = 5) {
  return [...ROAD_MARKINGS].sort(() => Math.random() - 0.5).slice(0, count);
}
