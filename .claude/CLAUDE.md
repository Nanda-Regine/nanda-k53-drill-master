# K53 Drill Master — Project Context

## Stack
React 18 + Vite + Framer Motion | No router, no global state | CSS-in-JS inline styles
Supabase auth + subscribers | PayFast payments (ZAR, SA only) | Vercel deployment
PWA with service worker | Web Audio API synth (no files) | Vibration API haptics

## Architecture
- **Routing:** `activeGame` string state machine in App.jsx — no React Router
- **State:** Props + localStorage only. No Redux, no Context (except LangContext)
- **Freemium:** localStorage counter, 10Q/day free, PayFast → Supabase subscriber row
- **Images:** `/public/signs/` — both `sign_XXX.jpg` (numbered, legacy) and descriptive `.jpg` names
  - Render: `<img src={/signs/${filename}} />`
- **Sounds:** Web Audio API synth in `src/utils/sounds.js` — no audio files
- **i18n:** Hand-written translations in `src/i18n.js` — 3 languages (EN/AF/XH)

## Sign Image Paths
All road sign images live in `/public/signs/`. Use descriptive filenames for new signs.
Render: `<img src={/signs/filename.jpg} />`

## Sign Data Structure (roadSigns.js)
```js
{
  id: 'R1',                    // Official SARTSM code
  name: 'Stop',                // Official name
  code: 'R1',                  // Display code
  category: 'Control',         // Control|Command|Prohibition|Warning|Guidance|Temporary
  shape: 'octagon',            // for ShapeTrainer: octagon|inv-triangle|circle|triangle|diamond|rect
  signColor: 'red-white',      // for ShapeTrainer: primary color
  img: 'stop-sign.jpg',        // file in /public/signs/
  meaning: '...',
  action: '...',
  hint: '...',
  options: ['...', '...', '...', '...'],  // 4 MCQ choices, first is correct answer
  confusableWith: ['R2'],       // signs commonly confused with this one
  mnemonic: '...',             // memory trick
}
```

## Key K53 Facts (for questions)
- Code 8 exam: 68Q total (17 signs + 24 rules + 27 controls) | Pass: 75% per section
- Code 1 exam: 40Q total (13 signs + 13 rules + 14 controls) | Pass: 75% per section
- Urban speed limit: 60 km/h | Freeway: 120 km/h | Outside urban: 100 km/h
- Following distance: 2 seconds minimum (3 seconds wet)
- BAC limit: 0.05g/100ml (non-professional) | 0.02g/100ml (professional)
- Emergency triangle: minimum 45m behind vehicle
- Dipped beam: 45m ahead | Main beam: 100m ahead | Hooter: 90m audible
- Parking clearances: 5m from intersection, 9m from crossing, 1.5m from hydrant
- Must always keep LEFT except to overtake or turn right

## Game Files (all in /src/games/)
- Gauntlet.jsx — Code 8 vehicle controls, round-based
- HybridGauntlet.jsx — mixed all-topics
- PatternTrainer.jsx — numbers/distances pattern flash
- RoadRulesGauntlet.jsx — 15 rounds, road rules
- MockExam.jsx — 68Q timed exam (Code 8)
- VehicleControls.jsx — vehicle controls only
- PDPPrep.jsx — PDP professional driving prep
- MotorcycleGauntlet.jsx — Code 1/2 gauntlet
- HeavyVehicleGauntlet.jsx — Code 10/14 gauntlet
- MotorcycleMockExam.jsx — 40Q Code 1 exam
- RoadSignsQuiz.jsx — signs quiz (uses roadSigns.js)
- SignShapeTrainer.jsx — shape/pattern recognition (NEW)
- RoadMarkingsDrill.jsx — road markings quiz (NEW)
- ScenarioDrill.jsx — situational "what must you do?" (NEW)

## Code Style Rules
- No TypeScript (pure JSX + JS)
- Inline styles ONLY — no Tailwind, no CSS files
- Theme tokens from `../theme.js` (imported as T)
- SA colours: green #007A4D | gold #FFB612 | red #DE3831 | navy #4472CA
- All new games: sounds (sfx), haptics, WhatsApp share, SA flag stripe on result
- All new questions: must be verifiable against DLTC official documentation
- NEVER add a question you are not 100% certain about

## Current Phase
Phase 14 complete. Phase 15 launched. Now building content depth:
- Signs DB: 30 → 130+ signs
- New game modes: SignShapeTrainer, RoadMarkingsDrill, ScenarioDrill
