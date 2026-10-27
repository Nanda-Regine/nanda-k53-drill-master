// Road-sign source-of-truth fix (Oct 27 2026). Reference: the official SADC road sign drawings (Wikimedia Commons,
// "SADC road sign <code>.svg", public domain) + the SARTSM code->name chart already transcribed in
// scripts/_audit_sign_codes.mjs. Rule: the CODE is the truth. Where the picture already matches the official sign for
// its code but the words do not, the words move to the code they describe. Where the picture is wrong, the official
// SVG replaces it. Where no official picture exists, the image is removed so the quizzes never show a wrong one.
//   node scripts/fix-sign-truth.mjs <dir-with-official-svgs>
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs'

const REF = process.argv[2]
if (!REF) { console.error('usage: node scripts/fix-sign-truth.mjs <dir-with-official-svgs>'); process.exit(1) }
const FILE = new URL('../src/data/roadSigns.js', import.meta.url)
const MANIFEST = new URL('../src/data/signImageManifest.js', import.meta.url)
let src = readFileSync(FILE, 'utf8')
const { ROAD_SIGNS } = await import(FILE.href + '?t=' + Date.now())
const byId = new Map(ROAD_SIGNS.map(s => [s.id, s]))

const TEXT = ['name', 'meaning', 'action', 'hint', 'options', 'mnemonic']

// target id <- text of source id (taken from the ORIGINAL data, so swaps are safe)
const MOVE = {
  'R4.1': 'R4.2', 'R4.2': 'R4.1',
  W202: 'W203', W203: 'W202', W204: 'W205', W205: 'W204', W206: 'W207', W207: 'W206',
  W208: 'W209', W209: 'W208', W210: 'W211', W211: 'W210',
  W106: 'W109', W108: 'W106', W109: 'W112', W115: 'W108',
  W214: 'W117', W215: 'W118', W118: 'W214', W116: 'W215', W117: 'W215',
}

// Text written fresh where no existing entry described the official sign.
const NEW = {
  W105: {
    name: 'T-junction ahead (skewed)',
    meaning: 'The road you are on ends at a junction with a road that crosses at an angle. You must turn left or right.',
    action: 'Slow down, check both directions along the crossing road, and be ready to stop and give way.',
    hint: 'Triangle with a T whose top bar is slanted',
    options: ['T-junction ahead (skewed)', 'Skew T-junction ahead', 'Y-junction ahead', 'Side road junction ahead'],
    mnemonic: 'The stem stops at the bar: your road ends. The slant shows the angle of the crossing road.',
  },
  W112: {
    name: 'Sharp junction ahead',
    meaning: 'A side road joins your road at a sharp angle ahead. Traffic from it may appear suddenly.',
    action: 'Slow down and watch for vehicles joining from the side road.',
    hint: 'Triangle with a straight road and a second road joining it at a sharp angle',
    options: ['Sharp junction ahead', 'Y-junction ahead', 'Side road junction ahead', 'Lane ends ahead'],
    mnemonic: 'A sharp angle hides the joining road until late. Expect cars to appear close.',
  },
}
// Directional detail and duplicates told apart.
const PATCH = {
  W116: { name: 'End of dual roadway (from the left)' },
  W117: { name: 'End of dual roadway (from the right)' },
}

// Wrong picture -> official SADC SVG (copied into public/signs as sadc-<code>.svg).
const OFFICIAL = ['R1.3', 'R1.4', 'R2.1', 'R239', 'R205', 'R222', 'R219', 'R218', 'R237', 'R238', 'R202', 'R203', 'W111', 'W113', 'W114', 'W311', 'W313']
// No official picture found: remove the wrong one so no quiz teaches it (image to be sourced).
const NO_IMAGE = ['R201-600', 'R214-600', 'R215-600', 'R600']

const q = v => Array.isArray(v) ? `[${v.map(q).join(', ')}]` : `'${String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`

function blockRange(id) {
  const i = src.indexOf(`id: '${id}'`)
  if (i < 0) throw new Error(`no entry ${id}`)
  const a = src.lastIndexOf('\n  {', i)
  const b = src.indexOf('\n  },', i)
  return [a, b]
}
function setField(id, field, value) {
  const [a, b] = blockRange(id)
  let blk = src.slice(a, b)
  const re = new RegExp(`(\\b${field}: )(\\[[^\\]]*\\]|'(?:\\\\.|[^'\\\\])*'|"(?:\\\\.|[^"\\\\])*"|null)`)
  if (!re.test(blk)) throw new Error(`${id}: no ${field}`)
  blk = blk.replace(re, `$1${value === null ? 'null' : q(value)}`)
  src = src.slice(0, a) + blk + src.slice(b)
}

const changes = []
for (const [to, from] of Object.entries(MOVE)) {
  const s = byId.get(from)
  for (const f of TEXT) if (s[f] !== undefined) setField(to, f, s[f])
  changes.push(`${to}: "${byId.get(to).name}" -> "${s.name}"`)
}
for (const [id, t] of Object.entries(NEW)) {
  for (const f of TEXT) setField(id, f, t[f])
  changes.push(`${id}: "${byId.get(id).name}" -> "${t.name}" (new text)`)
}
for (const [id, t] of Object.entries(PATCH)) for (const [f, v] of Object.entries(t)) { setField(id, f, v); changes.push(`${id}: name -> "${v}"`) }

let manifest = readFileSync(MANIFEST, 'utf8')
for (const code of OFFICIAL) {
  const s = ROAD_SIGNS.find(x => x.code === code)
  const file = `sadc-${code.replace(/[^A-Za-z0-9.-]/g, '_')}.svg`
  copyFileSync(`${REF}/${code.replace(/[^A-Za-z0-9.()-]/g, '_')}.svg`, new URL(`../public/signs/${file}`, import.meta.url))
  setField(s.id, 'img', file)
  if (!manifest.includes(`'${file}'`)) manifest = manifest.replace('new Set([', `new Set([\n  '${file}',`)
  changes.push(`${code}: image ${s.img} -> ${file} (official)`)
}
for (const code of NO_IMAGE) {
  const s = ROAD_SIGNS.find(x => x.code === code)
  setField(s.id, 'img', null)
  changes.push(`${code}: image ${s.img} removed (wrong picture, no official source yet)`)
}

writeFileSync(FILE, src)
writeFileSync(MANIFEST, manifest)
console.log(changes.join('\n'))
