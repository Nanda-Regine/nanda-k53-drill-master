#!/usr/bin/env node
// One-off audit: cross-check ROAD_SIGNS entries against the official
// SARTSM code->name list (RTSigns_charts.pdf, sheet 5 of 5).
// Flags: (a) id !== code, (b) code outside any known official series,
// (c) code in a known series but name doesn't match official name.
import { ROAD_SIGNS } from '../src/data/roadSigns.js';

// Official code -> name, transcribed from RTSigns_charts.pdf sheet 5/5.
const OFFICIAL = {
  R1: 'Stop sign', 'R1.1': 'Stop sign', 'R1.2': 'Stop/Yield sign', 'R1.3': '3-way stop sign',
  'R1.4': '4-way stop sign', 'R1.5': 'Stop/Go sign',
  R2: 'Yield sign', 'R2.1': 'Yield to pedestrians sign', 'R2.2': 'Yield at mini-circle sign',
  R3: 'No entry sign', 'R4.1': 'One-way roadway sign', 'R4.2': 'One-way roadway sign', 'R4.3': 'One-way roadway sign',
  R5: 'Pedestrian priority sign', R6: 'Yield to oncoming traffic sign',
  R101: 'Minimum speed sign', R102: 'Vehicles exceeding mass sign', R103: 'Keep left sign', R104: 'Keep right sign',
  R105: 'Proceed left only sign', R106: 'Proceed right only sign', R107: 'Proceed straight only sign',
  R108: 'Turn left sign', R109: 'Turn right sign', R110: 'Pedestrians only sign', R111: 'Pedal cycles only sign',
  R112: 'Pedal cycles & pedestrians only sign', R113: 'Pedal cycles & pedestrians only sign', R114: 'Pedal cycles & pedestrians only sign', R115: 'Pedal cycles & pedestrians only sign',
  R116: 'Motor cycles only sign', R117: 'Motor cars only sign', R118: 'Taxis only sign', R119: 'Minibuses only sign',
  R120: 'Midibus only sign', R121: 'Buses only sign', R122: 'Delivery vehicles only sign', R123: 'Goods vehicles only sign',
  R124: 'Goods vehicles over indicated GVM only sign', R125: 'Construction vehicles only sign',
  R126: 'Vehicles conveying dangerous goods only sign', R127: 'Abnormal vehicles only sign', R128: 'Rickshaws only sign',
  R129: 'Tour buses only sign', R130: 'Agricultural vehicles only sign', R131: 'Animal-drawn vehicles only sign',
  R132: 'Pay toll sign', R133: 'Switch head lamps on sign', R134: 'Buses & minibuses only sign',
  R135: 'Buses & midibuses only sign', R136: 'Buses, midibuses & minibuses only sign', R137: 'Roundabout sign',
  R138: 'Trams only sign', R139: 'Buses & trams only sign', R140: 'Buses, trams & minibuses only sign',
  R201: 'Speed limit sign', R202: 'Mass limit sign', R203: 'Axle massload limit sign', R204: 'Height limit sign',
  R205: 'Length limit sign', R206: 'Excessive noise prohibited sign', R207: 'Hitch-hiking prohibited sign',
  R208: 'Unauthorized vehicles prohibited sign', R209: 'Left turn ahead prohibited sign', R210: 'Right turn ahead prohibited sign',
  R211: 'Left turn prohibited sign', R212: 'Right turn prohibited sign', R213: 'U-turn prohibited sign',
  R214: 'Overtaking prohibited sign', R215: 'Overtaking by goods vehicle prohibited sign', R216: 'Parking prohibited sign',
  R217: 'Stopping prohibited sign', R218: 'Pedestrian prohibited sign', R219: 'Pedal cycle prohibited sign',
  R220: 'Pedal cycle & pedestrian prohibited sign', R221: null, R222: 'Motor cycle prohibited sign', R223: 'Motor car prohibited sign',
  R224: 'Taxi prohibited sign', R225: 'Minibus prohibited sign', R226: 'Midibus prohibited sign', R227: 'Bus prohibited sign',
  R228: 'Delivery vehicle prohibited sign', R229: 'Goods vehicle prohibited sign', R230: 'Goods vehicle over indicated GVM prohibited sign',
  R231: 'Construction vehicle prohibited sign', R232: 'Vehicle conveying dangerous goods prohibited sign', R233: 'Abnormal vehicle prohibited sign',
  R234: 'Rickshaw prohibited sign', R235: 'Tour bus prohibited sign', R236: 'Agricultural vehicle prohibited sign',
  R237: 'Animal-drawn vehicle prohibited sign', R238: 'Horses & riders prohibited sign', R239: 'Width limit sign',
  R240: 'Towed vehicles prohibited sign', R241: 'Hawkers prohibited sign',
  R301: 'Bus reservation sign', 'R301-P': 'Bus parking reservation sign', R302: 'Bus lane reservation sign',
  R303: 'Bus lane reservation begins sign', R304: 'Pedal cycle lane reservation sign',
  'R305-P': 'Parking reservation sign', 'R306-P': 'Limited parking reservation sign',
  R307: 'Motor cycle reservation sign', 'R307-P': 'Motor cycle parking reservation sign',
  R308: 'Motor car reservation sign', 'R308-P': 'Motor car parking reservation sign',
  R309: 'Taxi reservation sign', 'R309-P': 'Taxi parking reservation sign',
  R310: 'Minibus reservation sign', 'R310-P': 'Minibus parking reservation sign',
  R311: 'Midibus reservation sign', 'R311-P': 'Midibus parking reservation sign',
  R312: 'Delivery vehicle reservation sign', 'R312-P': 'Delivery vehicle parking reservation sign',
  R313: 'Goods vehicle reservation sign', 'R313-P': 'Goods vehicle parking reservation sign',
  R314: 'Goods vehicle over indicated GVM reservation sign', 'R314-P': 'Goods vehicle over indicated GVM parking reservation sign',
  R315: 'Construction vehicle reservation sign', 'R315-P': 'Construction vehicle parking reservation sign',
  R316: 'Vehicle conveying dangerous goods reservation sign', 'R316-P': 'Vehicle conveying dangerous goods parking reservation sign',
  R317: 'Abnormal vehicle reservation sign', 'R317-P': 'Abnormal vehicle parking reservation sign',
  R318: 'Rickshaw reservation sign', 'R318-P': 'Rickshaw parking reservation sign',
  R319: 'Tour bus reservation sign', 'R319-P': 'Tour bus parking reservation sign',
  R320: 'High occupancy vehicle reservation sign', 'R320-P': 'High occupancy vehicle parking reservation sign',
  R321: 'Emergency vehicle reservation sign', 'R321-P': 'Emergency vehicle parking reservation sign',
  R322: 'Police vehicle reservation sign', 'R322-P': 'Police vehicle parking reservation sign',
  R323: 'Disabled persons vehicle reservation sign', 'R323-P': 'Disabled persons vehicle parking reservation sign',
  R324: 'Authorized vehicle reservation sign', 'R324-P': 'Authorized vehicle parking reservation sign',
  R325: 'Bus stop reservation sign', R326: 'Minibus stop reservation sign',
  R327: 'Bus & minibus reservation sign', 'R327-P': 'Bus & minibus parking reservation sign',
  R328: 'Bus & minibus lane reservation sign', R329: 'Bus & minibus lane reservation begins sign',
  R330: 'Bus & midibus reservation sign', 'R330-P': 'Bus & midibus parking reservation sign',
  R331: 'Bus & midibus lane reservation sign', R332: 'Bus & midibus lane reservation begins sign',
  R333: 'Bus, midibus & minibus reservation sign', 'R333-P': 'Bus, midibus & minibus parking reservation sign',
  R334: 'Bus, midibus & minibus lane reservation sign', R335: 'Bus, midibus & minibus lane reservation begins sign',
  R336: 'High occupancy vehicle lane reservation sign', R337: 'High occupancy vehicle lane reservation begins sign',
  R338: 'Tram reservation sign', R339: 'Tram lane reservation sign', R340: 'Tram lane reservation begins sign',
  R341: 'Tram stop reservation sign', R342: 'Bus & tram reservation sign', R343: 'Bus & tram lane reservation sign',
  R344: 'Bus & tram lane reservation begins sign', R345: 'Bus, minibus & tram reservation sign',
  R346: 'Bus, minibus & tram lane reservation sign', R347: 'Bus, minibus & tram lane reservation begins sign',
  R348: 'Bus lane right reservation sign', R349: 'Bus & minibus lane right reservation sign',
  R350: 'Bus & tram lane right reservation sign', R351: 'Bus, minibus & tram lane right reservation sign',
  R352: 'High occupancy vehicle lane right reservation sign', R353: 'Authorized passenger transport vehicle lane reservation sign',
  R354: 'Authorized passenger transport vehicle lane right reservation sign',
  R401: 'Dual-carriageway freeway begins sign', R402: 'Single-carriageway freeway begins sign', R403: 'Woonerf sign',
  W101: 'Crossroads sign', W102: 'Priority crossroad sign', W103: 'Secondary crossroad sign',
  W104: 'T-junction sign', W105: 'T-junction sign', W106: 'Skew T-junction sign',
  W107: 'Side road junction sign', W108: 'Side road junction sign', W109: 'Staggered junction sign', W110: 'Staggered junction sign',
  W111: 'Sharp junction sign', W112: 'Sharp junction sign', W113: 'Sharp junction sign', W114: 'Sharp junction sign',
  W115: 'Y-junction sign', W116: 'End of dual roadway sign', W117: 'End of dual roadway sign',
  W118: 'Beginning of dual roadway sign', W119: 'Beginning of dual roadway sign',
  W201: 'Traffic circle sign', W202: 'Gentle curve sign', W203: 'Gentle curve sign', W204: 'Sharp curve sign', W205: 'Sharp curve sign',
  W206: 'Hairpin bend sign', W207: 'Hairpin bend sign', W208: 'Winding road sign', W209: 'Winding road sign',
  W210: 'Combined curves sign', W211: 'Combined curves sign', W212: 'Two-way traffic sign', W213: 'Two-way traffic crossroad sign',
  W214: 'Lane ends sign', W215: 'Lane ends sign', W216: 'Concealed driveway sign', W217: 'Concealed driveway sign', W218: 'Concealed driveway sign',
  W301: 'Traffic signal ahead sign', W302: 'Traffic control "STOP" ahead sign', W303: 'Traffic control "YIELD" ahead sign',
  W306: 'Pedestrian crossing sign', W307: 'Pedestrians sign', W308: 'Children sign', W309: 'Cyclists sign',
  W310: 'Farm animals sign', W311: 'Farm animals sign', W312: 'Farm animals sign', W313: 'Wild animals ahead sign',
  W314: 'Gate sign', W315: 'Motor gate sign', W316: 'Motor gate sign', W317: 'Motor gate sign',
  W318: 'Railway crossing sign', W319: 'Tunnel sign', W320: 'Height restriction sign', W321: 'Length restricted sign',
  W322: 'Steep descent sign', W323: 'Steep ascent sign', W324: 'Slow moving heavy vehicles sign', W325: 'Gravel road begins sign',
  W326: 'Narrow bridge sign', W327: 'One vehicle width structure sign', W328: 'Road narrows from both sides sign',
  W329: 'Road narrows from one side only sign', W330: 'Road narrows from one side only sign', W331: 'Uneven roadway sign',
  W332: 'Speed humps sign', W333: 'Slippery road sign', W334: 'Falling rocks sign', W335: 'Falling rocks sign',
  W339: 'General warning sign', W346: 'Emergency flashing light sign', W348: 'Jetty edge or river-bank sign',
  W349: 'Crosswinds sign', W350: 'Drift sign', W351: 'Low flying aircraft sign', W352: 'Agricultural vehicle sign',
  W354: 'Reduced visibility sign', W355: 'Congestion sign', W356: 'Horses & riders sign', W357: 'Elephant sign',
  W358: 'Warthog sign', W359: 'Hippo sign', W360: 'Width restricted sign', W361: 'Electrical shock sign',
  W362: 'Tram sign', W363: 'Gravel road ends sign',
  W401: 'Danger plate sign', W402: 'Danger plate sign', W403: 'Railway crossing sign', W404: 'Railway crossing sign',
  W409: 'T-junction chevron sign', W410: 'Dead end or road closed chevron sign', W411: 'Boom barricade sign',
  W413: 'Gore plate sign', W414: 'Gore chevron sign', W415: 'Overhead danger plate sign',
};

const problems = [];
for (const s of ROAD_SIGNS) {
  if (s.id !== s.code) {
    problems.push(`ID/CODE MISMATCH  id='${s.id}'  code='${s.code}'  name='${s.name}'`);
  }
  const official = OFFICIAL[s.code];
  if (official === undefined) {
    problems.push(`UNKNOWN CODE      code='${s.code}'  name='${s.name}'  (not in official SARTSM chart — verify manually)`);
  } else if (official !== null) {
    const officialBase = official.replace(/ sign$/, '').toLowerCase();
    const nameLower = (s.name || '').toLowerCase();
    if (!officialBase.includes(nameLower) && !nameLower.includes(officialBase.split(' ')[0])) {
      problems.push(`NAME MISMATCH     code='${s.code}'  data.name='${s.name}'  official='${official}'`);
    }
  }
}
console.log(`Checked ${ROAD_SIGNS.length} signs. ${problems.length} issues found:\n`);
for (const p of problems) console.log(p);
