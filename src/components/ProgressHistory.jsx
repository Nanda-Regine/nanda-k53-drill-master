import { useState, useEffect, useRef } from 'react';
import { T } from '../theme.js';
import { getHistory, getCategoryStats, getLifetimeStats } from '../utils/progressHistory.js';

const CATEGORY_LABELS = {
  road_rules:    '🚦 Road Rules',
  controls:      '🔩 Vehicle Controls',
  signs:         '🚧 Road Signs',
  pdp:           '🎓 PDP Prep',
  general:       '📚 General',
  legislation:   '📋 Legislation',
  dangerous:     '☢️ Dangerous Goods',
  accidents:     '🚨 Accidents',
  vehicle:       '🔧 Inspections',
  passengers:    '🚌 Passengers',
  economy:       '⛽ Eco Driving',
};

function label(cat) { return CATEGORY_LABELS[cat] || cat; }

// ── Mini sparkline chart (pure canvas) ───────────────────────────────────────
function SparkChart({ entries }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || entries.length < 2) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const pcts = entries.map(e => (e.total > 0 ? e.correct / e.total : null));
    const valid = pcts.filter(p => p !== null);
    if (valid.length < 2) return;

    const minP = Math.max(0, Math.min(...valid) - 0.05);
    const maxP = Math.min(1, Math.max(...valid) + 0.05);
    const range = maxP - minP || 0.1;

    const toX = (i) => (i / (pcts.length - 1)) * (W - 20) + 10;
    const toY = (p) => H - 10 - ((p - minP) / range) * (H - 20);

    // Fill gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, 'rgba(0,122,77,0.35)');
    grad.addColorStop(1, 'rgba(0,122,77,0)');

    ctx.beginPath();
    let started = false;
    pcts.forEach((p, i) => {
      if (p === null) return;
      if (!started) { ctx.moveTo(toX(i), toY(p)); started = true; }
      else ctx.lineTo(toX(i), toY(p));
    });
    ctx.lineTo(toX(pcts.length - 1), H);
    ctx.lineTo(toX(0), H);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    started = false;
    pcts.forEach((p, i) => {
      if (p === null) return;
      if (!started) { ctx.moveTo(toX(i), toY(p)); started = true; }
      else ctx.lineTo(toX(i), toY(p));
    });
    ctx.strokeStyle = '#007A4D';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Dots
    pcts.forEach((p, i) => {
      if (p === null) return;
      ctx.beginPath();
      ctx.arc(toX(i), toY(p), 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#FFB612';
      ctx.fill();
    });

    // 80% pass line
    const passY = toY(0.8);
    if (passY > 5 && passY < H - 5) {
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(10, passY);
      ctx.lineTo(W - 10, passY);
      ctx.strokeStyle = 'rgba(222,56,49,0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [entries]);

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={120}
      style={{ width: '100%', height: 120, display: 'block' }}
    />
  );
}

// ── Calendar heatmap (last 35 days) ──────────────────────────────────────────
function Heatmap({ entries }) {
  const today = new Date();
  const days = Array.from({ length: 35 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (34 - i));
    return d.toISOString().slice(0, 10);
  });

  const byDate = {};
  for (const e of entries) byDate[e.date] = e;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
      {days.map(date => {
        const entry = byDate[date];
        const pct = entry ? Math.round((entry.correct / entry.total) * 100) : null;
        let bg = T.border;
        if (pct !== null) {
          if (pct >= 80) bg = '#007A4D';
          else if (pct >= 60) bg = '#FFB612';
          else bg = '#DE3831';
        }
        const isToday = date === today.toISOString().slice(0, 10);
        return (
          <div
            key={date}
            title={entry ? `${date}: ${entry.correct}/${entry.total} (${pct}%)` : date}
            style={{
              aspectRatio: '1',
              borderRadius: 4,
              background: bg,
              border: isToday ? '2px solid #FFB612' : '2px solid transparent',
              opacity: pct === null ? 0.35 : 1,
              transition: 'opacity 0.2s',
            }}
          />
        );
      })}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ProgressHistory({ onBack }) {
  const [tab, setTab]       = useState('chart'); // chart | heatmap | categories
  const [history, setHistory]   = useState([]);
  const [catStats, setCatStats] = useState([]);
  const [lifetime, setLifetime] = useState({ total: 0, correct: 0, pct: 0, days: 0 });

  useEffect(() => {
    setHistory(getHistory());
    setCatStats(getCategoryStats());
    setLifetime(getLifetimeStats());
  }, []);

  const last7  = history.slice(-7);
  const last30 = history.slice(-30);

  // Trend: compare last 7 days vs previous 7
  const avg7    = last7.length  ? Math.round(last7.reduce((s, e)  => s + (e.correct / e.total) * 100, 0) / last7.length)  : 0;
  const prev7   = history.slice(-14, -7);
  const avgPrev = prev7.length  ? Math.round(prev7.reduce((s, e) => s + (e.correct / e.total) * 100, 0) / prev7.length) : null;
  const trend   = avgPrev !== null ? avg7 - avgPrev : null;

  const TAB_STYLE = (active) => ({
    flex: 1, padding: '10px 0', background: 'none', border: 'none',
    borderBottom: `2px solid ${active ? T.gold : 'transparent'}`,
    color: active ? T.gold : T.dim,
    fontWeight: active ? 700 : 400,
    cursor: 'pointer', fontSize: T.fontSize,
    fontFamily: T.font,
  });

  return (
    <div style={{ minHeight: '100vh', background: T.surface, color: T.text, fontFamily: T.font, fontSize: T.fontSize, paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ background: '#1a1a2e', padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: T.text, fontSize: 22, cursor: 'pointer' }}>←</button>
          <div style={{ fontWeight: 700, fontSize: T.fontSizeXl }}>Progress History</div>
        </div>

        {/* Lifetime stats row */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Answers', value: lifetime.total.toLocaleString() },
            { label: 'Accuracy',      value: `${lifetime.pct}%` },
            { label: 'Days Active',   value: lifetime.days },
            { label: '7-day Avg',     value: `${avg7}%${trend !== null ? (trend >= 0 ? ` ▲${trend}` : ` ▼${Math.abs(trend)}`) : ''}` },
          ].map(stat => (
            <div key={stat.label} style={{ background: T.surfaceAlt, borderRadius: 10, padding: '10px 14px', flex: 1, minWidth: 70, textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: T.fontSizeXl, color: T.gold }}>{stat.value}</div>
              <div style={{ fontSize: T.fontSize - 2, color: T.dim, marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}` }}>
          <button style={TAB_STYLE(tab === 'chart')}      onClick={() => setTab('chart')}>📈 Chart</button>
          <button style={TAB_STYLE(tab === 'heatmap')}    onClick={() => setTab('heatmap')}>📅 Calendar</button>
          <button style={TAB_STYLE(tab === 'categories')} onClick={() => setTab('categories')}>📊 By Category</button>
        </div>
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        {/* ── Chart tab ── */}
        {tab === 'chart' && (
          <div>
            <div style={{ fontWeight: 600, marginBottom: 10, fontSize: T.fontSizeLg }}>
              Accuracy over time
              <span style={{ fontSize: T.fontSize, color: T.dim, fontWeight: 400, marginLeft: 8 }}>last {Math.min(30, history.length)} days</span>
            </div>

            {last30.length < 2 ? (
              <div style={{ color: T.dim, textAlign: 'center', padding: '40px 0', fontSize: T.fontSizeLg }}>
                📚 Answer at least 2 days of questions to see your chart
              </div>
            ) : (
              <>
                <div style={{ background: T.surfaceAlt, borderRadius: T.radius, padding: 16, marginBottom: 16 }}>
                  <SparkChart entries={last30} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                    <span style={{ fontSize: T.fontSize - 2, color: T.dim }}>{last30[0]?.date}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 24, height: 2, background: '#DE3831', opacity: 0.5 }} />
                      <span style={{ fontSize: T.fontSize - 2, color: T.dim }}>80% pass line</span>
                    </div>
                    <span style={{ fontSize: T.fontSize - 2, color: T.dim }}>{last30[last30.length - 1]?.date}</span>
                  </div>
                </div>

                {/* Daily breakdown list */}
                <div style={{ fontWeight: 600, marginBottom: 10, fontSize: T.fontSizeLg }}>Daily Breakdown</div>
                {[...last7].reverse().map(entry => {
                  const pct = Math.round((entry.correct / entry.total) * 100);
                  const barColor = pct >= 80 ? '#007A4D' : pct >= 60 ? '#FFB612' : '#DE3831';
                  return (
                    <div key={entry.date} style={{ background: T.surfaceAlt, borderRadius: 10, padding: '12px 14px', marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: T.fontSize, color: T.dim }}>
                          {new Date(entry.date + 'T12:00:00').toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </span>
                        <span style={{ fontWeight: 700, color: barColor }}>{pct}% ({entry.correct}/{entry.total})</span>
                      </div>
                      <div style={{ background: T.border, borderRadius: 99, height: 6 }}>
                        <div style={{ background: barColor, borderRadius: 99, height: 6, width: `${pct}%`, transition: 'width 0.5s' }} />
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* ── Heatmap tab ── */}
        {tab === 'heatmap' && (
          <div>
            <div style={{ fontWeight: 600, marginBottom: 14, fontSize: T.fontSizeLg }}>Last 35 Days</div>
            <div style={{ background: T.surfaceAlt, borderRadius: T.radius, padding: 16, marginBottom: 16 }}>
              <Heatmap entries={history} />
            </div>
            {/* Legend */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: T.fontSize - 1, color: T.dim }}>
              {[
                { color: '#007A4D', label: '≥80% (Pass)' },
                { color: '#FFB612', label: '60–79%' },
                { color: '#DE3831', label: '<60%' },
                { color: T.border,  label: 'No activity', opacity: 0.35 },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 14, height: 14, borderRadius: 3, background: l.color, opacity: l.opacity || 1 }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Categories tab ── */}
        {tab === 'categories' && (
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4, fontSize: T.fontSizeLg }}>Accuracy by Category</div>
            <div style={{ color: T.dim, fontSize: T.fontSize - 1, marginBottom: 16 }}>Sorted weakest → strongest</div>

            {catStats.length === 0 ? (
              <div style={{ color: T.dim, textAlign: 'center', padding: '40px 0', fontSize: T.fontSizeLg }}>
                📚 No data yet — start practising!
              </div>
            ) : catStats.map(stat => {
              const barColor = stat.pct >= 80 ? '#007A4D' : stat.pct >= 60 ? '#FFB612' : '#DE3831';
              return (
                <div key={stat.category} style={{ background: T.surfaceAlt, borderRadius: 10, padding: '14px 16px', marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: T.fontSizeLg }}>{label(stat.category)}</span>
                    <span style={{ fontWeight: 700, color: barColor, fontSize: T.fontSizeLg }}>{stat.pct}%</span>
                  </div>
                  <div style={{ background: T.border, borderRadius: 99, height: 8 }}>
                    <div style={{ background: barColor, borderRadius: 99, height: 8, width: `${stat.pct}%`, transition: 'width 0.6s' }} />
                  </div>
                  <div style={{ fontSize: T.fontSize - 2, color: T.dim, marginTop: 6 }}>
                    {stat.correct} correct out of {stat.total} questions
                    {stat.pct < 70 && <span style={{ color: '#DE3831', marginLeft: 8 }}>⚠️ Needs work</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
