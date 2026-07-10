import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../theme.js';
import { sfx } from '../utils/sounds.js';
import { hapticCorrect, hapticWrong, hapticPass } from '../utils/haptics.js';
import { CRISP_SIGNS as ROAD_SIGNS } from '../data/roadSigns.js';

// ── Fallback challenge (used when no Supabase challenge found) ────────────────
function buildLocalChallenge() {
  const signs = [...ROAD_SIGNS].sort(() => Math.random() - 0.5).slice(0, 10);
  const endsAt = new Date();
  endsAt.setDate(endsAt.getDate() + (7 - endsAt.getDay())); // next Sunday
  endsAt.setHours(23, 59, 59, 0);
  return {
    id: `local_${new Date().getFullYear()}_w${Math.ceil(new Date().getDate() / 7)}`,
    title: 'Weekly Signs Sprint',
    description: 'How fast can you identify 10 road signs? Earn the Weekly Champion badge!',
    badge_id: 'weekly_champ',
    starts_at: new Date().toISOString(),
    ends_at: endsAt.toISOString(),
    questions: signs.map(s => ({
      id: s.id, img: s.img,
      q: `What does this sign (${s.code || s.id}) mean?`,
      options: [...s.options].sort(() => Math.random() - 0.5),
      answer: s.options[0],
    })),
  };
}

// ── Countdown display ─────────────────────────────────────────────────────────
function Countdown({ endsAt }) {
  const [display, setDisplay] = useState('');
  useEffect(() => {
    const tick = () => {
      const diff = new Date(endsAt) - Date.now();
      if (diff <= 0) { setDisplay('Ended'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setDisplay(`${d}d ${h}h ${m}m remaining`);
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [endsAt]);
  return <span>{display}</span>;
}

// ── Leaderboard row ───────────────────────────────────────────────────────────
function LeaderRow({ rank, name, score, total, isMe }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 0',
      borderBottom: `1px solid ${T.border}`,
      background: isMe ? `${T.green}11` : 'transparent',
    }}>
      <span style={{ width: 28, color: rank <= 3 ? T.gold : T.dim, fontWeight: 700, textAlign: 'center' }}>
        {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
      </span>
      <span style={{ flex: 1, color: isMe ? T.green : T.text, fontWeight: isMe ? 700 : 400 }}>
        {name}{isMe ? ' (you)' : ''}
      </span>
      <span style={{ color: T.gold, fontWeight: 800 }}>{score}/{total}</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function WeeklyChallenge({ onBack }) {
  const [screen, setScreen]       = useState('info');   // info | quiz | result
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [qIdx, setQIdx]           = useState(0);
  const [score, setScore]         = useState(0);
  const [chosen, setChosen]       = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [myEntry, setMyEntry]     = useState(null);
  const [supabase, setSupabase]   = useState(null);
  const [userId, setUserId]       = useState(null);
  const [myName, setMyName]       = useState('You');
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    import('../supabase.js').then(({ supabase: sb }) => {
      if (!isMounted.current) return;
      setSupabase(sb);
      if (sb) {
        sb.auth.getUser().then(({ data }) => {
          if (!isMounted.current || !data?.user) return;
          setUserId(data.user.id);
          setMyName(data.user.email?.split('@')[0] || 'You');
        });
      }
    });
    return () => { isMounted.current = false; };
  }, []);

  // Load challenge + leaderboard
  useEffect(() => {
    if (supabase === null) return;
    (async () => {
      setLoading(true);
      try {
        let ch = null;
        let entries = [];
        if (supabase) {
          const now = new Date().toISOString();
          const { data: chData } = await supabase
            .from('weekly_challenges')
            .select('id,title,description,question_ids,badge_id,starts_at,ends_at')
            .lte('starts_at', now)
            .gte('ends_at', now)
            .order('starts_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (chData) {
            // Load questions for the challenge
            let qs = [];
            if (chData.question_ids?.length) {
              const { data: qData } = await supabase
                .from('questions')
                .select('external_id,id,correct_answer,code,sign_code,img,options,question_text')
                .in('external_id', chData.question_ids)
                .eq('is_active', true);
              qs = (qData || []).map(r => ({
                id: r.external_id || r.id,
                img: r.img,
                q: r.question_text,
                options: Array.isArray(r.options) ? [...r.options].sort(() => Math.random() - 0.5) : [],
                answer: r.correct_answer,
              }));
            }
            ch = { ...chData, questions: qs.length ? qs : buildLocalChallenge().questions };

            // Load leaderboard
            const { data: lbData } = await supabase
              .from('challenge_entries')
              .select('user_id,score,total,completed_at')
              .eq('challenge_id', chData.id)
              .order('score', { ascending: false })
              .limit(20);
            entries = (lbData || []).map((e, i) => ({ rank: i + 1, name: `Player ${i + 1}`, score: e.score, total: e.total, isMe: e.user_id === userId }));

            // Check own entry
            if (userId) {
              const own = entries.find(e => e.isMe);
              if (own) setMyEntry(own);
            }
          }
        }
        if (!ch) ch = buildLocalChallenge();
        if (isMounted.current) {
          setChallenge(ch);
          setLeaderboard(entries);
        }
      } catch {
        if (isMounted.current) setChallenge(buildLocalChallenge());
      } finally {
        if (isMounted.current) setLoading(false);
      }
    })();
  }, [supabase, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAnswer = useCallback((opt) => {
    if (chosen) return;
    setChosen(opt);
    const correct = opt === challenge.questions[qIdx].answer;
    if (correct) { sfx('correct'); hapticCorrect(); }
    else { sfx('wrong'); hapticWrong(); }
    if (correct) setScore(s => s + 1);

    setTimeout(() => {
      if (!isMounted.current) return;
      const next = qIdx + 1;
      if (next >= challenge.questions.length) {
        setScreen('result');
        submitEntry(score + (correct ? 1 : 0), challenge.questions.length);
      } else {
        setQIdx(next);
        setChosen(null);
      }
    }, 1400);
  }, [chosen, challenge, qIdx, score, submitEntry]);

  const submitEntry = useCallback(async (finalScore, total) => {
    sfx('pass');
    hapticPass();
    setMyEntry({ rank: null, name: myName, score: finalScore, total, isMe: true });
    if (!supabase || !userId || !challenge?.id || challenge.id.startsWith('local_')) return;
    await supabase.from('challenge_entries').upsert({
      challenge_id: challenge.id,
      user_id: userId,
      score: finalScore,
      total,
    }, { onConflict: 'challenge_id,user_id' }).catch(() => {});
  }, [supabase, userId, challenge, myName]);

  const share = useCallback(() => {
    if (!myEntry) return;
    const pct = Math.round((myEntry.score / myEntry.total) * 100);
    const text = `I scored ${myEntry.score}/${myEntry.total} (${pct}%) on the K53 Weekly Challenge! 🏆 Try it: k53drillmaster.co.za`;
    if (navigator.share) navigator.share({ text }).catch(() => {});
    else window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }, [myEntry]);

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.dim, fontFamily: T.font }}>
        Loading challenge…
      </div>
    );
  }

  const q = challenge?.questions?.[qIdx];
  const total = challenge?.questions?.length || 0;

  return (
    <div style={{ minHeight: '100dvh', background: T.bg, color: T.text, fontFamily: T.font, paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: T.dim, cursor: 'pointer', fontSize: 22 }}>←</button>
        <div>
          <div style={{ fontWeight: 800, fontSize: T.fontSizeLg }}>🏅 Weekly Challenge</div>
          {challenge && <div style={{ color: T.dim, fontSize: T.fontSize - 2 }}><Countdown endsAt={challenge.ends_at} /></div>}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Info screen */}
        {screen === 'info' && (
          <motion.div key="info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ maxWidth: 500, margin: '0 auto', padding: 24 }}>
            {/* Badge */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 60, marginBottom: 8 }}>🏅</div>
              <h2 style={{ color: T.gold, margin: '0 0 4px', fontSize: T.fontSizeXl }}>{challenge?.title}</h2>
              <p style={{ color: T.dim, margin: 0 }}>{challenge?.description}</p>
            </div>

            {/* My previous score */}
            {myEntry && (
              <div style={{ background: `${T.green}22`, border: `1px solid ${T.green}`, borderRadius: T.radius, padding: '12px 16px', marginBottom: 16, textAlign: 'center' }}>
                <div style={{ color: T.green, fontWeight: 700 }}>Your score: {myEntry.score}/{myEntry.total}</div>
                {myEntry.rank && <div style={{ color: T.dim, fontSize: T.fontSize - 1 }}>Rank #{myEntry.rank}</div>}
              </div>
            )}

            <button
              onClick={() => { setQIdx(0); setScore(0); setChosen(null); setScreen('quiz'); }}
              style={{ width: '100%', background: T.gold, color: '#000', border: 'none', borderRadius: 99, padding: '14px', cursor: 'pointer', fontWeight: 800, fontSize: T.fontSizeLg, marginBottom: 20 }}
            >{myEntry ? '↺ Retry' : 'Start Challenge'}</button>

            {/* Leaderboard */}
            {leaderboard.length > 0 && (
              <div>
                <div style={{ fontWeight: 700, color: T.gold, marginBottom: 10 }}>🏆 Leaderboard</div>
                <div style={{ background: T.surfaceAlt, borderRadius: T.radiusLg, overflow: 'hidden', padding: '0 12px' }}>
                  {leaderboard.map(e => (
                    <LeaderRow key={e.rank} {...e} isMe={e.isMe} />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Quiz screen */}
        {screen === 'quiz' && q && (
          <motion.div key={`q${qIdx}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            style={{ maxWidth: 500, margin: '0 auto', padding: '16px 16px 0' }}>
            {/* Progress */}
            <div style={{ height: 4, background: T.border, borderRadius: 2, marginBottom: 16 }}>
              <div style={{ height: '100%', background: T.gold, borderRadius: 2, width: `${((qIdx + 1) / total) * 100}%`, transition: 'width 0.3s' }} />
            </div>
            <div style={{ color: T.dim, fontSize: T.fontSize - 1, marginBottom: 14, textAlign: 'center' }}>
              Q{qIdx + 1}/{total} · Score: {score}
            </div>

            {q.img && (
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <img src={`/signs/${q.img}`} alt="" style={{ maxHeight: 120, borderRadius: T.radius }} />
              </div>
            )}

            <p style={{ textAlign: 'center', fontWeight: 700, fontSize: T.fontSizeLg, marginBottom: 20 }}>{q.q}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {q.options.map((opt, i) => {
                const revealed = chosen !== null;
                const isCorrect = opt === q.answer;
                const isChosen  = opt === chosen;
                let bg = T.surfaceAlt;
                if (revealed && isCorrect) bg = `${T.green}33`;
                if (revealed && isChosen && !isCorrect) bg = `${T.red}33`;
                return (
                  <button key={i} onClick={() => handleAnswer(opt)} disabled={!!chosen} style={{ background: bg, border: `1px solid ${revealed && isCorrect ? T.green : revealed && isChosen ? T.red : T.border}`, borderRadius: T.radius, padding: '14px 10px', color: T.text, cursor: chosen ? 'default' : 'pointer', fontSize: T.fontSize, textAlign: 'left', lineHeight: 1.3, fontFamily: T.font }}>
                    {String.fromCharCode(65 + i)}. {opt}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Result screen */}
        {screen === 'result' && myEntry && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{ maxWidth: 500, margin: '0 auto', padding: 24, textAlign: 'center' }}>
            <div style={{ display: 'flex', height: 4, marginBottom: 24 }}>
              {['#DE3831','#FFB612','#007A4D','#4472CA'].map(c => <div key={c} style={{ flex: 1, background: c }} />)}
            </div>
            <div style={{ fontSize: 60, marginBottom: 8 }}>🏅</div>
            <div style={{ color: T.gold, fontWeight: 900, fontSize: T.fontSizeXxl, marginBottom: 4 }}>
              {myEntry.score}/{myEntry.total}
            </div>
            <div style={{ color: myEntry.score / myEntry.total >= 0.75 ? T.green : T.dim, fontWeight: 700, marginBottom: 24 }}>
              {Math.round((myEntry.score / myEntry.total) * 100)}% · {myEntry.score / myEntry.total >= 0.75 ? '🏆 Pass!' : 'Keep drilling — you\'ll get there!'}
            </div>
            {challenge?.badge_id && myEntry.score / myEntry.total >= 0.75 && (
              <div style={{ background: `${T.gold}22`, border: `1px solid ${T.gold}`, borderRadius: T.radiusLg, padding: '12px 20px', marginBottom: 24 }}>
                <div style={{ fontSize: 32, marginBottom: 4 }}>🏆</div>
                <div style={{ color: T.gold, fontWeight: 700 }}>Weekly Champion Badge Earned!</div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={share} style={{ background: T.green, color: '#fff', border: 'none', borderRadius: 99, padding: '12px 28px', cursor: 'pointer', fontWeight: 700, fontSize: T.fontSizeLg }}>📲 Share</button>
              <button onClick={() => setScreen('info')} style={{ background: T.surfaceAlt, color: T.text, border: `1px solid ${T.border}`, borderRadius: 99, padding: '12px 28px', cursor: 'pointer', fontSize: T.fontSizeLg }}>Leaderboard</button>
              <button onClick={onBack} style={{ background: 'none', border: 'none', color: T.dim, cursor: 'pointer', fontSize: T.fontSizeLg }}>Exit</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
