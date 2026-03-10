import { useState, useEffect } from 'react';
import { T } from '../theme.js';

// ── Checklist definition ──────────────────────────────────────────────────────
// Mirrors the K53 test-day vehicle inspection that the examiner walks through.
const SECTIONS = [
  {
    id: 'outside_front',
    title: 'Outside — Front',
    icon: '🚗',
    items: [
      { id: 'of1',  text: 'Windscreen clean, unobstructed, no major cracks' },
      { id: 'of2',  text: 'Wiper blades present and in good condition' },
      { id: 'of3',  text: 'Headlights working (low and high beam)' },
      { id: 'of4',  text: 'Indicators working (front left and right)' },
      { id: 'of5',  text: 'Hooter / horn working' },
      { id: 'of6',  text: 'Front tyres — correct pressure, tread ≥1.6 mm, no visible damage' },
      { id: 'of7',  text: 'Number plate present, clean and legible' },
      { id: 'of8',  text: 'Bonnet closes and latches securely' },
    ],
  },
  {
    id: 'engine_bay',
    title: 'Engine Bay',
    icon: '🔧',
    items: [
      { id: 'eb1',  text: 'Engine oil level between MIN and MAX' },
      { id: 'eb2',  text: 'Coolant level within MIN–MAX range' },
      { id: 'eb3',  text: 'Brake fluid level correct' },
      { id: 'eb4',  text: 'Power steering fluid correct (if applicable)' },
      { id: 'eb5',  text: 'Windscreen washer fluid filled' },
      { id: 'eb6',  text: 'No visible leaks (oil, coolant, fuel)' },
      { id: 'eb7',  text: 'Fan belt / drive belts present and not frayed' },
    ],
  },
  {
    id: 'outside_sides',
    title: 'Outside — Sides & Underneath',
    icon: '🔍',
    items: [
      { id: 'os1',  text: 'Both side mirrors present, clean and adjustable' },
      { id: 'os2',  text: 'Door hinges and locks functioning' },
      { id: 'os3',  text: 'Side indicators / repeaters working' },
      { id: 'os4',  text: 'No fuel or fluid drips on the ground' },
      { id: 'os5',  text: 'Exhaust not excessively smoking' },
      { id: 'os6',  text: 'Wheel nuts / studs all present, no loose bolts' },
    ],
  },
  {
    id: 'outside_rear',
    title: 'Outside — Rear',
    icon: '🚘',
    items: [
      { id: 'or1',  text: 'Rear lights working (tail and brake lights)' },
      { id: 'or2',  text: 'Reverse light working' },
      { id: 'or3',  text: 'Rear indicators working (left and right)' },
      { id: 'or4',  text: 'Rear number plate present, clean and lit at night' },
      { id: 'or5',  text: 'Rear tyres — correct pressure, tread ≥1.6 mm, no damage' },
      { id: 'or6',  text: 'Boot closes and latches securely' },
      { id: 'or7',  text: 'Spare tyre present and inflated' },
    ],
  },
  {
    id: 'inside',
    title: 'Inside the Vehicle',
    icon: '🪑',
    items: [
      { id: 'in1',  text: 'Seat adjusts and locks in position' },
      { id: 'in2',  text: 'Driver\'s seatbelt present and functioning' },
      { id: 'in3',  text: 'All passenger seatbelts present and functional' },
      { id: 'in4',  text: 'Rear-view mirror clean and adjustable' },
      { id: 'in5',  text: 'Windscreen wipers and washer working' },
      { id: 'in6',  text: 'Horn reachable from driving position' },
      { id: 'in7',  text: 'Dashboard warning lights all clear when running' },
      { id: 'in8',  text: 'Handbrake holds vehicle on a slope' },
      { id: 'in9',  text: 'Foot brake — firm pedal, no excessive travel' },
      { id: 'in10', text: 'Clutch pedal smooth (manual vehicles)' },
      { id: 'in11', text: 'Accelerator returns freely when released' },
      { id: 'in12', text: 'Steering wheel — no excessive play' },
    ],
  },
  {
    id: 'documents',
    title: 'Documents & Essentials',
    icon: '📋',
    items: [
      { id: 'dc1',  text: 'Learner\'s licence / driving licence with you' },
      { id: 'dc2',  text: 'Vehicle licence disc displayed and valid' },
      { id: 'dc3',  text: 'Vehicle registration papers in the car' },
      { id: 'dc4',  text: 'Roadworthy certificate valid (if required)' },
      { id: 'dc5',  text: 'Warning triangle in the boot' },
      { id: 'dc6',  text: 'First-aid kit in the vehicle' },
      { id: 'dc7',  text: 'Fire extinguisher (if required for your vehicle class)' },
    ],
  },
];

const CHECKLIST_KEY = 'k53_checklist_v1';

function todayStr() { return new Date().toISOString().slice(0, 10); }

function loadChecklist() {
  try {
    const raw = JSON.parse(localStorage.getItem(CHECKLIST_KEY) || '{}');
    // Auto-reset if saved on a previous day
    if (raw.date !== todayStr()) return { date: todayStr(), checked: {} };
    return raw;
  } catch { return { date: todayStr(), checked: {} }; }
}

function saveChecklist(checked) {
  try { localStorage.setItem(CHECKLIST_KEY, JSON.stringify({ date: todayStr(), checked })); } catch {}
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function VehicleChecklist({ onBack }) {
  const [checked, setChecked] = useState({});
  const [expandedSection, setExpandedSection] = useState('outside_front');

  useEffect(() => {
    const saved = loadChecklist();
    setChecked(saved.checked || {});
  }, []);

  const toggle = (id) => {
    const updated = { ...checked, [id]: !checked[id] };
    setChecked(updated);
    saveChecklist(updated);
  };

  const resetAll = () => {
    setChecked({});
    saveChecklist({});
  };

  const allItems   = SECTIONS.flatMap(s => s.items);
  const totalCount = allItems.length;
  const doneCount  = allItems.filter(item => checked[item.id]).length;
  const pct        = Math.round((doneCount / totalCount) * 100);
  const allDone    = doneCount === totalCount;

  const sectionPct = (section) => {
    const done = section.items.filter(i => checked[i.id]).length;
    return Math.round((done / section.items.length) * 100);
  };

  return (
    <div style={{ minHeight: '100vh', background: T.surface, color: T.text, fontFamily: T.font, fontSize: T.fontSize, paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ background: '#1a1a2e', padding: '20px 20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: T.text, fontSize: 22, cursor: 'pointer' }}>←</button>
          <div>
            <div style={{ fontWeight: 700, fontSize: T.fontSizeXl }}>Vehicle Inspection Checklist</div>
            <div style={{ color: T.dim, fontSize: T.fontSize - 1, marginTop: 1 }}>K53 test-day pre-drive check</div>
          </div>
          <button onClick={resetAll} style={{ marginLeft: 'auto', background: 'none', border: `1px solid ${T.border}`, borderRadius: 8, padding: '6px 12px', color: T.dim, cursor: 'pointer', fontSize: T.fontSize - 1 }}>
            Reset
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ background: T.border, borderRadius: 99, height: 10, marginBottom: 8 }}>
          <div style={{ background: allDone ? '#007A4D' : '#FFB612', borderRadius: 99, height: 10, width: `${pct}%`, transition: 'width 0.4s' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: T.fontSize - 1 }}>
          <span style={{ color: T.dim }}>{doneCount} of {totalCount} items checked</span>
          <span style={{ fontWeight: 700, color: allDone ? '#007A4D' : '#FFB612' }}>{pct}%</span>
        </div>

        {allDone && (
          <div style={{ background: '#003d22', border: '1px solid #007A4D', borderRadius: 10, padding: '10px 14px', marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>✅</span>
            <div>
              <div style={{ fontWeight: 700, color: '#4ade80' }}>Vehicle inspection complete!</div>
              <div style={{ fontSize: T.fontSize - 2, color: 'rgba(74,222,128,0.7)' }}>Your vehicle is ready for the K53 test</div>
            </div>
          </div>
        )}
      </div>

      {/* Sections */}
      <div style={{ padding: '16px 16px 0' }}>
        {SECTIONS.map(section => {
          const spct = sectionPct(section);
          const isExpanded = expandedSection === section.id;
          const allSectionDone = spct === 100;

          return (
            <div key={section.id} style={{ marginBottom: 10 }}>
              {/* Section header */}
              <button
                onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                style={{
                  width: '100%', background: allSectionDone ? '#003d22' : T.surfaceAlt,
                  border: `1px solid ${allSectionDone ? '#007A4D' : T.border}`,
                  borderRadius: isExpanded ? '12px 12px 0 0' : 12,
                  padding: '14px 16px', cursor: 'pointer', color: T.text,
                  display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
                  fontFamily: T.font,
                }}
              >
                <span style={{ fontSize: 22 }}>{section.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: T.fontSizeLg }}>{section.title}</div>
                  <div style={{ fontSize: T.fontSize - 2, color: T.dim, marginTop: 2 }}>
                    {section.items.filter(i => checked[i.id]).length}/{section.items.length} checked
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {allSectionDone && <span style={{ color: '#4ade80', fontSize: 18 }}>✓</span>}
                  <span style={{ color: T.dim, fontSize: 18, transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>›</span>
                </div>
              </button>

              {/* Items */}
              {isExpanded && (
                <div style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderTop: 'none', borderRadius: '0 0 12px 12px', overflow: 'hidden' }}>
                  {section.items.map((item, idx) => {
                    const done = !!checked[item.id];
                    return (
                      <button key={item.id}
                        onClick={() => toggle(item.id)}
                        style={{
                          display: 'flex', alignItems: 'flex-start', gap: 14, width: '100%',
                          padding: '14px 16px', background: done ? 'rgba(0,122,77,0.08)' : 'transparent',
                          border: 'none', borderTop: idx > 0 ? `1px solid ${T.border}` : 'none',
                          cursor: 'pointer', textAlign: 'left', color: T.text, fontFamily: T.font,
                          transition: 'background 0.15s',
                        }}
                      >
                        {/* Checkbox */}
                        <div style={{
                          width: 24, height: 24, borderRadius: 6, border: `2px solid ${done ? '#007A4D' : T.dim}`,
                          background: done ? '#007A4D' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, marginTop: 1, transition: 'all 0.15s',
                        }}>
                          {done && <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>✓</span>}
                        </div>
                        <span style={{
                          fontSize: T.fontSizeLg, lineHeight: 1.45,
                          color: done ? '#4ade80' : T.text,
                          textDecoration: done ? 'line-through' : 'none',
                          opacity: done ? 0.75 : 1,
                          transition: 'all 0.15s',
                        }}>
                          {item.text}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Info footer */}
        <div style={{ background: T.surfaceAlt, borderRadius: 12, padding: '14px 16px', marginTop: 8, fontSize: T.fontSize - 1, color: T.dim, lineHeight: 1.55 }}>
          💡 <strong style={{ color: T.text }}>Tip:</strong> The examiner will ask you to demonstrate several of these checks during the K53 test. Know where each control is and be able to operate it confidently.
        </div>

        <div style={{ background: T.surfaceAlt, borderRadius: 12, padding: '14px 16px', marginTop: 10, fontSize: T.fontSize - 1, color: T.dim, lineHeight: 1.55 }}>
          🔄 This checklist resets daily. Your progress today: <strong style={{ color: T.gold }}>{doneCount}/{totalCount}</strong>
        </div>
      </div>
    </div>
  );
}
