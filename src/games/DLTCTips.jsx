import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../theme.js';
import { sfx } from '../utils/sounds.js';

// ── SA Provinces ──────────────────────────────────────────────────────────────
const PROVINCES = ['Any', 'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'];

// ── Mock data (used when Supabase unavailable) ────────────────────────────────
const MOCK_TIPS = [
  { id: '1', province: 'Gauteng', city: 'Johannesburg', dltc_name: 'Johannesburg Central DLTC', tip_text: 'Arrive at 07:00 — queues start forming at 06:30. Bring all documents in a plastic sleeve to avoid "missing pages" issues.', upvotes: 47, verified: true, created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: '2', province: 'Western Cape', city: 'Cape Town', dltc_name: 'Cape Town Central DLTC', tip_text: 'Book online at least 3 weeks in advance. Walk-ins are rarely accommodated on weekdays.', upvotes: 31, verified: false, created_at: new Date(Date.now() - 86400000 * 7).toISOString() },
  { id: '3', province: 'Eastern Cape', city: 'East London', dltc_name: 'East London DLTC', tip_text: 'The K53 test starts at 08:30 sharp. The examiner checks your signal, mirrors and blind-spot checks strictly — do all three every time.', upvotes: 19, verified: true, created_at: new Date(Date.now() - 86400000 * 14).toISOString() },
  { id: '4', province: 'KwaZulu-Natal', city: 'Durban', dltc_name: 'Pinetown DLTC', tip_text: 'Tuesday and Thursday mornings are the least busy. Bring a certified copy of your ID — originals sometimes get lost.', upvotes: 22, verified: false, created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
];

// ── Tip card ──────────────────────────────────────────────────────────────────
function TipCard({ tip, onUpvote, upvoted }) {
  const timeAgo = (iso) => {
    const d = Math.floor((Date.now() - new Date(iso)) / 86400000);
    return d === 0 ? 'today' : d === 1 ? 'yesterday' : `${d}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: T.radius,
        padding: 14,
        marginBottom: 10,
      }}
    >
      {/* DLTC header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: T.fontSize, color: T.text }}>{tip.dltc_name}</div>
          <div style={{ color: T.dim, fontSize: T.fontSize - 2 }}>{tip.city}, {tip.province} · {timeAgo(tip.created_at)}</div>
        </div>
        {tip.verified && (
          <span style={{ background: `${T.green}22`, color: T.green, borderRadius: 99, padding: '2px 10px', fontSize: T.fontSize - 3, fontWeight: 700, whiteSpace: 'nowrap' }}>✓ Verified</span>
        )}
      </div>

      {/* Tip text */}
      <p style={{ margin: '0 0 10px', color: T.text, fontSize: T.fontSize, lineHeight: 1.5 }}>{tip.tip_text}</p>

      {/* Footer */}
      <button
        onClick={() => onUpvote(tip.id)}
        style={{
          background: upvoted ? `${T.gold}22` : 'transparent',
          border: `1px solid ${upvoted ? T.gold : T.border}`,
          borderRadius: 99,
          padding: '4px 14px',
          color: upvoted ? T.gold : T.dim,
          cursor: upvoted ? 'default' : 'pointer',
          fontSize: T.fontSize - 2,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        👍 {tip.upvotes + (upvoted ? 1 : 0)} helpful
      </button>
    </motion.div>
  );
}

// ── Submit form ───────────────────────────────────────────────────────────────
function SubmitForm({ onSubmit }) {
  const [province, setProvince] = useState('');
  const [city, setCity]         = useState('');
  const [dltcName, setDltcName] = useState('');
  const [tipText, setTipText]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr]           = useState('');

  const submit = async () => {
    if (!dltcName.trim()) { setErr('DLTC name required'); return; }
    if (tipText.trim().length < 10) { setErr('Tip must be at least 10 characters'); return; }
    setErr('');
    setSubmitting(true);
    try {
      await onSubmit({ province, city, dltc_name: dltcName.trim(), tip_text: tipText.trim() });
      setCity(''); setDltcName(''); setTipText(''); setProvince('');
    } catch (e) {
      setErr(e.message || 'Could not submit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: T.radiusLg, padding: 16, marginBottom: 20 }}>
      <div style={{ fontWeight: 700, marginBottom: 12, color: T.gold }}>📌 Share a DLTC Tip</div>

      <select value={province} onChange={e => setProvince(e.target.value)} style={{ width: '100%', background: T.surface, color: province ? T.text : T.dim, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: '10px 12px', fontSize: T.fontSize, marginBottom: 8, boxSizing: 'border-box' }}>
        <option value="">Province (optional)</option>
        {PROVINCES.slice(1).map(p => <option key={p} value={p}>{p}</option>)}
      </select>

      <input placeholder="City / Town (optional)" value={city} onChange={e => setCity(e.target.value)} style={{ width: '100%', background: T.surface, color: T.text, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: '10px 12px', fontSize: T.fontSize, marginBottom: 8, boxSizing: 'border-box', fontFamily: T.font }} />

      <input placeholder="DLTC name *" value={dltcName} onChange={e => setDltcName(e.target.value)} style={{ width: '100%', background: T.surface, color: T.text, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: '10px 12px', fontSize: T.fontSize, marginBottom: 8, boxSizing: 'border-box', fontFamily: T.font }} />

      <textarea placeholder="What should others know? (10–1000 chars) *" value={tipText} onChange={e => setTipText(e.target.value)} maxLength={1000} rows={3} style={{ width: '100%', background: T.surface, color: T.text, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: '10px 12px', fontSize: T.fontSize, resize: 'vertical', fontFamily: T.font, boxSizing: 'border-box', marginBottom: 8 }} />

      {err && <div style={{ color: T.red, fontSize: T.fontSize - 2, marginBottom: 8 }}>{err}</div>}

      <button onClick={submit} disabled={submitting} style={{ background: T.gold, color: '#000', border: 'none', borderRadius: 99, padding: '10px 24px', cursor: submitting ? 'default' : 'pointer', fontWeight: 700, fontSize: T.fontSize }}>
        {submitting ? 'Submitting…' : 'Submit Tip'}
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function DLTCTips({ onBack }) {
  const [tips, setTips]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [province, setProvince]   = useState('Any');
  const [showSubmit, setShowSubmit] = useState(false);
  const [upvoted, setUpvoted]     = useState(() => {
    try { return JSON.parse(localStorage.getItem('k53_upvoted_tips') || '{}'); } catch { return {}; }
  });
  const [supabase, setSupabase]   = useState(null);
  const [userId, setUserId]       = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    import('../supabase.js').then(({ supabase: sb }) => {
      if (!isMounted.current) return;
      setSupabase(sb);
      if (sb) sb.auth.getUser().then(({ data }) => { if (isMounted.current && data?.user) setUserId(data.user.id); });
    });
    return () => { isMounted.current = false; };
  }, []);

  const fetchTips = useCallback(async () => {
    setLoading(true);
    try {
      if (supabase) {
        let q = supabase.from('dltc_tips').select('id,province,city,dltc_name,tip_text,upvotes,verified,created_at').is('deleted_at', null).order('upvotes', { ascending: false }).limit(30);
        if (province !== 'Any') q = q.eq('province', province);
        const { data, error } = await q;
        if (error) throw error;
        if (isMounted.current) setTips(data || []);
      } else {
        const filtered = province === 'Any' ? MOCK_TIPS : MOCK_TIPS.filter(t => t.province === province);
        if (isMounted.current) setTips(filtered);
      }
    } catch {
      if (isMounted.current) setTips(MOCK_TIPS);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [supabase, province]);

  useEffect(() => { if (supabase !== null) fetchTips(); }, [supabase, province]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpvote = useCallback(async (tipId) => {
    if (upvoted[tipId]) return;
    sfx('click');
    const newUpvoted = { ...upvoted, [tipId]: true };
    setUpvoted(newUpvoted);
    try { localStorage.setItem('k53_upvoted_tips', JSON.stringify(newUpvoted)); } catch {}
    if (supabase) await supabase.rpc('increment_tip_upvotes', { tip_id: tipId }).catch(() => {});
  }, [upvoted, supabase]);

  const handleSubmit = useCallback(async (tipData) => {
    if (!supabase) {
      setTips(prev => [{ id: `local_${Date.now()}`, ...tipData, upvotes: 0, verified: false, created_at: new Date().toISOString() }, ...prev]);
      setShowSubmit(false);
      return;
    }
    const { data, error } = await supabase.from('dltc_tips').insert({ ...tipData, user_id: userId }).select('id,province,city,dltc_name,tip_text,upvotes,verified,created_at').single();
    if (error) throw new Error(error.message);
    sfx('pass');
    setTips(prev => [data, ...prev]);
    setShowSubmit(false);
  }, [supabase, userId]);

  return (
    <div style={{ minHeight: '100dvh', background: T.bg, color: T.text, fontFamily: T.font, paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: T.dim, cursor: 'pointer', fontSize: 22 }}>←</button>
        <div>
          <div style={{ fontWeight: 800, fontSize: T.fontSizeLg }}>📌 DLTC Tips</div>
          <div style={{ color: T.dim, fontSize: T.fontSize - 2 }}>Community insider knowledge</div>
        </div>
        <button onClick={() => setShowSubmit(s => !s)} style={{ marginLeft: 'auto', background: T.gold, color: '#000', border: 'none', borderRadius: 99, padding: '6px 16px', cursor: 'pointer', fontWeight: 700, fontSize: T.fontSize - 1 }}>
          + Add tip
        </button>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '16px 16px 0' }}>
        {/* Province filter */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 16 }}>
          {PROVINCES.map(p => (
            <button
              key={p}
              onClick={() => setProvince(p)}
              style={{
                whiteSpace: 'nowrap',
                padding: '6px 14px',
                borderRadius: 99,
                border: `1px solid ${province === p ? T.gold : T.border}`,
                background: province === p ? `${T.gold}22` : 'transparent',
                color: province === p ? T.gold : T.dim,
                cursor: 'pointer',
                fontSize: T.fontSize - 2,
                fontWeight: province === p ? 700 : 400,
              }}
            >{p}</button>
          ))}
        </div>

        <AnimatePresence>{showSubmit && <SubmitForm key="form" onSubmit={handleSubmit} />}</AnimatePresence>

        {loading ? (
          <div style={{ textAlign: 'center', color: T.dim, padding: 40 }}>…</div>
        ) : tips.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🌵</div>
            <div style={{ color: T.dim }}>No tips for this province yet — be the first!</div>
          </div>
        ) : (
          <AnimatePresence>
            {tips.map(tip => <TipCard key={tip.id} tip={tip} onUpvote={handleUpvote} upvoted={!!upvoted[tip.id]} />)}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
