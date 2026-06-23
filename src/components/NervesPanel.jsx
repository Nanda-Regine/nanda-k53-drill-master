import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../theme.js';
import {
  getNerveMastery, getLevel, getSystemHealth, NERVES,
} from '../utils/masteryStore.js';

// ── Radar geometry ─────────────────────────────────────────────────────────────
const CX = 130, CY = 130, R = 82;

function pt(angleDeg, r) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function hexPoints(r) {
  return NERVES.map(n => { const p = pt(n.angle, r); return `${p.x},${p.y}`; }).join(' ');
}

// ── Nerve dot component with pulse animation ───────────────────────────────────
function NerveDot({ nerve, score }) {
  const pos  = pt(nerve.angle, (score / 100) * R);
  const lPos = pt(nerve.angle, R + 24);
  const dead = score === 0;
  const col  = dead ? 'rgba(255,255,255,0.15)' : nerve.color;

  return (
    <g>
      {/* Pulse ring for decaying nerves */}
      {nerve.decaying && !dead && (
        <motion.circle
          cx={pos.x} cy={pos.y} r={9}
          fill="none" stroke="#DE3831" strokeWidth={1.5}
          animate={{ r: [7, 13], opacity: [0.8, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
      {/* Fresh glow */}
      {nerve.fresh && !dead && (
        <circle cx={pos.x} cy={pos.y} r={8} fill={nerve.color} opacity={0.18} />
      )}
      {/* Main dot */}
      <circle cx={pos.x} cy={pos.y} r={5} fill={col} />
      {/* Spoke label — short name */}
      <text
        x={lPos.x} y={lPos.y - 4} textAnchor="middle"
        fill={dead ? 'rgba(255,255,255,0.25)' : nerve.color}
        fontSize="7.5" fontWeight="700" fontFamily="system-ui,sans-serif"
        letterSpacing="0.5"
      >
        {nerve.short}
      </text>
      <text
        x={lPos.x} y={lPos.y + 8} textAnchor="middle"
        fill={dead ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.6)'}
        fontSize="7" fontFamily="system-ui,sans-serif"
      >
        {dead ? '—' : `${score}%`}
      </text>
    </g>
  );
}

// ── SVG Radar ─────────────────────────────────────────────────────────────────
function Radar({ nerves, health }) {
  const filled = nerves.map(n => { const p = pt(n.angle, Math.max((n.score / 100) * R, 2)); return `${p.x},${p.y}`; }).join(' ');
  const healthColor = health >= 75 ? '#007A4D' : health >= 45 ? '#FFB612' : health >= 15 ? '#DE3831' : 'rgba(255,255,255,0.15)';
  const isDormant   = nerves.every(n => n.answered === 0);

  return (
    <svg viewBox="0 0 260 260" width="200" height="200" style={{ display: 'block', margin: '0 auto', overflow: 'visible' }}>
      {/* Grid rings */}
      {[0.25, 0.5, 0.75, 1].map(f => (
        <polygon key={f} points={hexPoints(R * f)}
          fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={f === 1 ? 1 : 0.5} />
      ))}
      {/* Spokes */}
      {NERVES.map(n => {
        const end = pt(n.angle, R);
        return <line key={n.id} x1={CX} y1={CY} x2={end.x} y2={end.y} stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" />;
      })}

      {/* Filled mastery polygon */}
      {!isDormant && (
        <motion.polygon
          points={filled}
          fill={`${healthColor}22`}
          stroke={healthColor}
          strokeWidth="1.5"
          strokeLinejoin="round"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: `${CX}px ${CY}px` }}
        />
      )}

      {/* Ghost outline when dormant */}
      {isDormant && (
        <motion.polygon
          points={hexPoints(R * 0.12)}
          fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1"
          strokeDasharray="3,3"
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
      )}

      {/* Center health orb */}
      <circle cx={CX} cy={CY} r={22} fill="rgba(0,0,0,0.5)" stroke={`${healthColor}44`} strokeWidth="1.5" />
      <text x={CX} y={CY - 3} textAnchor="middle" fill={isDormant ? 'rgba(255,255,255,0.2)' : healthColor}
        fontSize="13" fontWeight="800" fontFamily="system-ui,sans-serif">
        {isDormant ? '—' : `${health}%`}
      </text>
      <text x={CX} y={CY + 10} textAnchor="middle" fill="rgba(255,255,255,0.35)"
        fontSize="6.5" fontFamily="system-ui,sans-serif" letterSpacing="0.5">
        {isDormant ? 'DORMANT' : 'HEALTH'}
      </text>

      {/* Nerve dots + labels */}
      {nerves.map(n => <NerveDot key={n.id} nerve={n} score={n.score} />)}
    </svg>
  );
}

// ── Status colour helpers ──────────────────────────────────────────────────────
function healthColor(h) {
  if (h >= 75) return '#4ade80';
  if (h >= 45) return '#FFB612';
  if (h >= 15) return '#f87171';
  return 'rgba(255,255,255,0.25)';
}

function healthLabel(status) {
  return { strong: 'Strong', active: 'Active', weak: 'Weak', critical: 'Critical', dormant: 'Dormant' }[status] || 'Dormant';
}

// ── Nerve to game mapping (for deep-link buttons) ─────────────────────────────
const NERVE_GAME = {
  signs:     'roadsigns',
  rules:     'road_rules',
  controls:  'gauntlet',
  scenarios: 'scenario',
  markings:  'road_marks',
  practical: 'mockexam',
};

// ── Main panel ─────────────────────────────────────────────────────────────────
export default function NervesPanel({ onPlay, refreshKey }) {
  const [nerves,  setNerves]  = useState(() => getNerveMastery());
  const [levelD,  setLevelD]  = useState(() => getLevel());
  const [sysH,    setSysH]    = useState(() => getSystemHealth());
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setNerves(getNerveMastery());
    setLevelD(getLevel());
    setSysH(getSystemHealth());
  }, [refreshKey]);

  const isDormant = nerves.every(n => n.answered === 0);
  const hCol = healthColor(sysH.health);

  return (
    <div style={{
      margin: '0 0 16px',
      background: 'linear-gradient(160deg,#060d0a 0%,#080810 60%,#0d0605 100%)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 20,
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Top accent — health colour stripe */}
      <div style={{ height: 2, background: `linear-gradient(90deg, ${hCol}99, transparent)` }} />

      <div style={{ padding: '16px 16px 4px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: 2 }}>
              Nervous System
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: hCol, letterSpacing: 0.3 }}>
                {healthLabel(sysH.status)}
              </span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
                {isDormant ? '— start any game to activate' : `${sysH.trained}/6 nerves trained`}
              </span>
            </div>
          </div>

          {/* Level badge */}
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12,
            padding: '6px 10px',
            textAlign: 'center',
            minWidth: 56,
          }}>
            <div style={{ fontSize: 15 }}>{levelD.badge}</div>
            <div style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.5, marginTop: 1 }}>LVL {levelD.level}</div>
          </div>
        </div>

        {/* Radar */}
        <Radar nerves={nerves} health={sysH.health} />

        {/* XP bar */}
        <div style={{ margin: '10px 4px 4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>
              {levelD.name} · {levelD.xp.toLocaleString()} XP
            </span>
            {levelD.nextLevel && (
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
                {levelD.xpToNext} to {levelD.nextLevel.name}
              </span>
            )}
          </div>
          <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${levelD.progress * 100}%` }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              style={{ height: '100%', background: `linear-gradient(90deg, #007A4D, #FFB612)`, borderRadius: 99 }}
            />
          </div>
        </div>
      </div>

      {/* Dormant CTA */}
      {isDormant && (
        <div style={{ padding: '10px 16px 16px', borderTop: '1px solid rgba(255,255,255,0.04)', marginTop: 8 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', lineHeight: 1.5, marginBottom: 8 }}>
            Play any game to activate your nervous system. Each answer trains a nerve.
          </div>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => onPlay?.('road_rules')}
            style={{
              width: '100%', padding: '11px', border: 'none', borderRadius: 12,
              background: 'linear-gradient(135deg,#007A4D,#005a38)',
              color: '#fff', fontWeight: 700, fontSize: 13,
              fontFamily: 'system-ui,sans-serif', cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0,122,77,0.3)',
            }}
          >
            Activate — Start Road Rules →
          </motion.button>
        </div>
      )}

      {/* Nerve legend toggle */}
      {!isDormant && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setExpanded(e => !e)}
          style={{
            width: '100%', background: 'rgba(255,255,255,0.02)',
            border: 'none', borderTop: '1px solid rgba(255,255,255,0.04)',
            padding: '9px 16px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 6, cursor: 'pointer', fontFamily: 'system-ui,sans-serif',
          }}
        >
          <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1 }}>
            {expanded ? 'HIDE' : 'ALL NERVES'}
          </span>
          <motion.span animate={{ rotate: expanded ? 180 : 0 }} style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10 }}>
            ▾
          </motion.span>
        </motion.button>
      )}

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '12px 16px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {nerves.map(n => (
                <motion.button
                  key={n.id}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onPlay?.(NERVE_GAME[n.id])}
                  style={{
                    background: `${n.color}0a`,
                    border: `1px solid ${n.color}25`,
                    borderRadius: 10, padding: '10px 10px',
                    cursor: 'pointer', textAlign: 'left',
                    fontFamily: 'system-ui,sans-serif',
                  }}
                >
                  {/* Mini bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, color: n.color, letterSpacing: 0.5 }}>{n.short}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: n.answered === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.65)' }}>
                      {n.answered === 0 ? 'NEW' : `${n.score}%`}
                    </span>
                  </div>
                  <div style={{ height: 2.5, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${n.score}%`, background: n.color, borderRadius: 99, transition: 'width 0.8s ease' }} />
                  </div>
                  {n.decaying && (
                    <div style={{ fontSize: 7.5, color: '#f87171', marginTop: 4, fontWeight: 600 }}>⚠ Fading</div>
                  )}
                  {n.fresh && !n.decaying && (
                    <div style={{ fontSize: 7.5, color: '#4ade80', marginTop: 4, fontWeight: 600 }}>✓ Trained today</div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
