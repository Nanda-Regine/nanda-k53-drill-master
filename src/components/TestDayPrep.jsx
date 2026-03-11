import { useState } from 'react';
import { T } from '../theme.js';

const SECTIONS = [
  {
    id: 'docs',
    icon: '📋',
    title: 'Documents to Bring',
    color: '#FFB612',
    items: [
      { label: 'South African ID', detail: 'Original green ID book OR smart ID card — no copies accepted' },
      { label: "Learner's application form (LL1)", detail: 'Completed and signed — available at the DLTC or downloaded from the eNaTIS website' },
      { label: "Proof of payment", detail: "Receipt for the learner's test fee — keep the original" },
      { label: 'Eye test certificate', detail: 'From a registered optometrist — required if you wear glasses or contacts' },
      { label: 'Under 18: parental consent form (LL2)', detail: 'Signed by parent or guardian — mandatory if you are under 18' },
      { label: 'PDP application (if applicable)', detail: 'Required if you will be driving for reward (taxis, trucks, dangerous goods)' },
    ],
  },
  {
    id: 'tips',
    icon: '✅',
    title: 'Test Day Tips',
    color: '#4472CA',
    items: [
      { label: 'Arrive 30 minutes early', detail: 'DLTC queues can be long. Late arrival may mean rescheduling.' },
      { label: 'Bring a pen', detail: 'Some test centres do not provide writing instruments.' },
      { label: 'Bring extra cash', detail: 'Unexpected admin fees happen. Cash is still king at many DLTCs.' },
      { label: 'Bring water and a snack', detail: 'You may wait several hours before your test slot is called.' },
      { label: 'Read every question twice', detail: 'EXCEPT, NOT, UNLESS questions are the most common traps. Slow down on those.' },
      { label: 'Do not change your first answer', detail: 'Studies consistently show first instincts are more often correct.' },
      { label: 'Skip and return', detail: 'Unsure? Move on and come back — do not lose time staring at one question.' },
    ],
  },
  {
    id: 'health',
    icon: '💚',
    title: 'Take Care of Yourself',
    color: '#007A4D',
    items: [
      { label: 'Sleep 7–8 hours the night before', detail: 'A tired brain cannot retrieve information well. Sleep beats last-minute cramming every time.' },
      { label: 'Eat a proper breakfast', detail: 'Your brain runs on glucose. Skip breakfast and your concentration drops significantly.' },
      { label: 'Drink water — stay hydrated', detail: 'Even mild dehydration reduces focus and memory recall. Bring a bottle.' },
      { label: 'Stop cramming the night before', detail: 'Light review is fine. Heavy studying the night before increases anxiety and disrupts sleep.' },
      { label: 'Use deep breathing if anxious', detail: 'Breathe in for 4 counts, hold for 4, out for 6. It activates your calm response within seconds.' },
      { label: 'Talk kindly to yourself', detail: '"I have prepared, I am ready" — what you say to yourself before the test directly affects performance.' },
      { label: 'Remember: you can retake it', detail: 'The test is not the end of the world. Thousands of South Africans pass every week after retaking.' },
    ],
  },
  {
    id: 'encourage',
    icon: '🔥',
    title: "You've Got This",
    color: '#DE3831',
    message: true,
  },
];

const ENCOURAGEMENTS = [
  "Every expert driver on the road today was once exactly where you are — nervous, studying, doubting themselves. They passed. So will you.",
  "South Africa has a 50% learner's test fail rate — not because people aren't smart, but because they don't prepare like you are right now. You are already ahead.",
  "You've put in the work. The practice, the rounds, the wrong answers you learned from — that's real preparation. Trust it.",
  "Confidence doesn't come before preparation. It comes after. You've prepared. Walk into that test knowing you've earned it.",
  "Whether you're getting a Code 1, Code 8, Code 10 or Code 14 — that licence is going to open doors. Keep going.",
];

export default function TestDayPrep({ onBack }) {
  const [openSection, setOpenSection] = useState('docs');
  const encourage = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.font, fontSize: T.fontSize, paddingBottom: 40 }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(160deg,#0d1f1a 0%,#0a0a0f 55%,#1a0d0d 100%)', padding: '20px 20px 24px' }}>
        <div style={{ display: 'flex', height: 4, marginBottom: 16 }}>
          {['#000','#FFB612','#007A4D','#F5F5F0','#DE3831','#4472CA'].map((c, i) => (
            <div key={i} style={{ flex: 1, background: c }} />
          ))}
        </div>
        <button onClick={onBack} style={{ background: 'transparent', border: `1px solid ${T.border}`, color: T.dim, fontSize: 13, padding: '7px 14px', cursor: 'pointer', fontFamily: T.font, borderRadius: 3, marginBottom: 16 }}>
          ← Home
        </button>
        <div style={{ fontSize: 11, letterSpacing: 4, color: T.dim, textTransform: 'uppercase', marginBottom: 6 }}>Test Day Guide</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>Be Ready. Be Calm. Pass.</div>
        <div style={{ color: T.dim, fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>
          Everything you need to walk into that DLTC prepared and confident.
        </div>
      </div>

      <div style={{ padding: '20px 20px 0' }}>

        {/* Encouragement card */}
        <div style={{ background: 'linear-gradient(135deg,rgba(0,122,77,0.15),rgba(255,182,18,0.08))', border: '1px solid rgba(255,182,18,0.2)', borderRadius: 14, padding: '18px 20px', marginBottom: 20 }}>
          <div style={{ fontSize: 18, marginBottom: 10 }}>🔥</div>
          <p style={{ color: '#E8EDE0', fontSize: T.fontSizeLg, lineHeight: 1.65, margin: 0, fontStyle: 'italic' }}>
            "{encourage}"
          </p>
        </div>

        {/* Section tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setOpenSection(s.id)}
              style={{
                background: openSection === s.id ? s.color : T.surfaceAlt,
                color: openSection === s.id ? (s.id === 'docs' ? '#000' : '#fff') : T.dim,
                border: `1px solid ${openSection === s.id ? s.color : T.border}`,
                borderRadius: 99, padding: '7px 14px', cursor: 'pointer',
                fontFamily: T.font, fontSize: T.fontSize - 2, fontWeight: openSection === s.id ? 700 : 400,
                transition: 'all 0.15s',
              }}>
              {s.icon} {s.title}
            </button>
          ))}
        </div>

        {/* Section content */}
        {SECTIONS.map(section => {
          if (openSection !== section.id) return null;

          if (section.message) {
            return (
              <div key={section.id}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {ENCOURAGEMENTS.map((msg, i) => (
                    <div key={i} style={{ background: T.surface, border: `1px solid ${T.border}`, borderLeft: `4px solid ${i % 3 === 0 ? '#007A4D' : i % 3 === 1 ? '#FFB612' : '#DE3831'}`, borderRadius: 10, padding: '16px 18px' }}>
                      <p style={{ color: '#E8EDE0', fontSize: T.fontSizeLg, lineHeight: 1.65, margin: 0 }}>"{msg}"</p>
                    </div>
                  ))}
                </div>

                {/* Mental health reminder */}
                <div style={{ background: 'rgba(0,122,77,0.1)', border: '1px solid rgba(0,122,77,0.25)', borderRadius: 14, padding: '18px 20px', marginTop: 20 }}>
                  <div style={{ color: '#4ade80', fontWeight: 700, fontSize: T.fontSizeLg, marginBottom: 12 }}>💚 Quick reminders</div>
                  {[
                    ['💧', 'Drink water right now'],
                    ['😴', 'Sleep before the test — not extra studying'],
                    ['🥗', 'Eat something proper in the morning'],
                    ['📱', 'Put the phone down an hour before bed'],
                    ['🧘', '4 counts in · 4 hold · 6 counts out — repeat 3 times if anxious'],
                  ].map(([icon, text]) => (
                    <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <span style={{ fontSize: 18 }}>{icon}</span>
                      <span style={{ color: '#E8EDE0', fontSize: T.fontSize }}>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <div key={section.id} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {section.items.map((item, i) => (
                <div key={i} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ minWidth: 28, height: 28, borderRadius: 99, background: `${section.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                    <span style={{ color: section.color, fontSize: 13, fontWeight: 900 }}>{i + 1}</span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#E8EDE0', fontSize: T.fontSizeLg, marginBottom: 3 }}>{item.label}</div>
                    <div style={{ color: T.dim, fontSize: T.fontSize - 1, lineHeight: 1.5 }}>{item.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}

        {/* Bottom note */}
        <div style={{ textAlign: 'center', marginTop: 28, padding: '0 16px' }}>
          <p style={{ color: T.dim, fontSize: 11, lineHeight: 1.6 }}>
            DLTC requirements can vary by centre. Always call ahead to confirm fees and any additional documents required in your area.
          </p>
        </div>
      </div>
    </div>
  );
}
