import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../theme.js';
import { sfx } from '../utils/sounds.js';

const PAGE_SIZE = 12;

const MOCK_QA = [
  { id: 'm1', question: 'What is the minimum following distance on a wet road?', answer: '3 seconds (double the dry following distance of 2 seconds).', votes: 18, answered: true, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'm2', question: 'Do I need to signal when moving off from the kerb?', answer: 'Yes — signal right, check mirrors and blind spot, then move off.', votes: 12, answered: true, created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 'm3', question: 'What does a yellow broken line in the centre of the road mean?', answer: null, votes: 5, answered: false, created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: 'm4', question: 'How far must an emergency triangle be placed behind the vehicle?', answer: 'At least 45 metres behind the vehicle on the roadway.', votes: 24, answered: true, created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
];

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

// ── QA Card ───────────────────────────────────────────────────────────────────
function QACard({ item, onVote, voted, onAnswer, isExpanded, onToggle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: T.surface,
        border: `1px solid ${item.answered ? T.border : T.gold + '55'}`,
        borderRadius: T.radius,
        marginBottom: 10,
        overflow: 'hidden',
      }}
    >
      {/* Question header */}
      <button
        onClick={onToggle}
        style={{ width: '100%', background: 'none', border: 'none', padding: '14px 14px 10px', cursor: 'pointer', textAlign: 'left', color: T.text, fontFamily: T.font }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <span style={{ fontSize: 16, flexShrink: 0, marginTop: 2 }}>
            {item.answered ? '✅' : '❓'}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, lineHeight: 1.4, fontSize: T.fontSize }}>{item.question}</div>
            <div style={{ color: T.dim, fontSize: T.fontSize - 3, marginTop: 4 }}>{timeAgo(item.created_at)}</div>
          </div>
          <span style={{ color: T.dim, fontSize: 18, flexShrink: 0 }}>{isExpanded ? '▲' : '▼'}</span>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 14px 14px' }}>
              {item.answered && item.answer ? (
                <div style={{
                  background: `${T.green}11`,
                  border: `1px solid ${T.green}33`,
                  borderRadius: T.radius,
                  padding: '12px 14px',
                  color: T.text,
                  fontSize: T.fontSize,
                  lineHeight: 1.5,
                  marginBottom: 10,
                }}>
                  <span style={{ color: T.green, fontWeight: 700 }}>Answer: </span>{item.answer}
                </div>
              ) : (
                <div style={{ color: T.dim, fontSize: T.fontSize - 1, marginBottom: 10, fontStyle: 'italic' }}>
                  No answer yet — be the first to help!
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={() => onVote(item.id)}
                  disabled={voted}
                  style={{
                    background: voted ? `${T.blue}22` : 'transparent',
                    border: `1px solid ${voted ? T.blue : T.border}`,
                    borderRadius: 99,
                    padding: '4px 14px',
                    color: voted ? T.blue : T.dim,
                    cursor: voted ? 'default' : 'pointer',
                    fontSize: T.fontSize - 2,
                  }}
                >👍 {item.votes + (voted ? 1 : 0)}</button>

                {!item.answered && (
                  <button
                    onClick={() => onAnswer(item)}
                    style={{ background: T.gold, color: '#000', border: 'none', borderRadius: 99, padding: '4px 14px', cursor: 'pointer', fontSize: T.fontSize - 2, fontWeight: 700 }}
                  >Answer this</button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Answer modal ──────────────────────────────────────────────────────────────
function AnswerModal({ item, onSubmit, onClose }) {
  const [text, setText]     = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');

  const submit = async () => {
    if (text.trim().length < 5) { setErr('Answer too short'); return; }
    setSaving(true);
    try { await onSubmit(item.id, text.trim()); }
    catch (e) { setErr(e.message || 'Could not save'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000a', zIndex: 100,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        style={{ background: T.surface, borderRadius: '16px 16px 0 0', padding: 20, width: '100%', maxWidth: 560 }}
      >
        <div style={{ fontWeight: 700, marginBottom: 10, color: T.text }}>Your Answer</div>
        <div style={{ color: T.dim, fontSize: T.fontSize - 1, marginBottom: 12, fontStyle: 'italic' }}>"{item.question}"</div>
        <textarea
          autoFocus
          value={text}
          onChange={e => setText(e.target.value)}
          maxLength={800}
          rows={4}
          placeholder="Type a clear, factual answer based on K53..."
          style={{ width: '100%', background: T.surfaceAlt, color: T.text, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: '10px 12px', fontSize: T.fontSize, resize: 'vertical', fontFamily: T.font, boxSizing: 'border-box', marginBottom: 8 }}
        />
        {err && <div style={{ color: T.red, fontSize: T.fontSize - 2, marginBottom: 8 }}>{err}</div>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ background: 'none', border: `1px solid ${T.border}`, borderRadius: 99, padding: '10px 20px', color: T.dim, cursor: 'pointer' }}>Cancel</button>
          <button onClick={submit} disabled={saving} style={{ background: T.green, color: '#fff', border: 'none', borderRadius: 99, padding: '10px 24px', cursor: saving ? 'default' : 'pointer', fontWeight: 700 }}>
            {saving ? 'Saving…' : 'Submit Answer'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CommunityQA({ onBack }) {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [offset, setOffset]     = useState(0);
  const [hasMore, setHasMore]   = useState(true);
  const [filter, setFilter]     = useState('all');  // all | unanswered
  const [expanded, setExpanded] = useState(null);
  const [voted, setVoted]       = useState(() => { try { return JSON.parse(localStorage.getItem('k53_qa_votes') || '{}'); } catch { return {}; } });
  const [answerTarget, setAnswerTarget] = useState(null);
  const [showAsk, setShowAsk]   = useState(false);
  const [askText, setAskText]   = useState('');
  const [asking, setAsking]     = useState(false);
  const [supabase, setSupabase] = useState(null);
  const [userId, setUserId]     = useState(null);
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

  const fetchItems = useCallback(async (reset = false) => {
    const currentOffset = reset ? 0 : offset;
    setLoading(true);
    try {
      let rows;
      if (supabase) {
        let q = supabase
          .from('community_posts')
          .select('id,type,content,explanation,votes,answered,created_at')
          .eq('type', 'question')
          .is('deleted_at', null)
          .order('votes', { ascending: false })
          .range(currentOffset, currentOffset + PAGE_SIZE - 1);
        if (filter === 'unanswered') q = q.eq('answered', false);
        const { data, error } = await q;
        if (error) throw error;
        rows = (data || []).map(r => ({
          id: r.id, question: r.content, answer: r.explanation,
          votes: r.votes || 0, answered: !!r.answered, created_at: r.created_at,
        }));
      } else {
        const all = filter === 'unanswered' ? MOCK_QA.filter(q => !q.answered) : MOCK_QA;
        rows = all.slice(currentOffset, currentOffset + PAGE_SIZE);
      }
      if (!isMounted.current) return;
      if (reset) setItems(rows);
      else setItems(prev => [...prev, ...rows]);
      setOffset(currentOffset + rows.length);
      setHasMore(rows.length === PAGE_SIZE);
    } catch {
      if (isMounted.current && reset) setItems(MOCK_QA);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [supabase, offset, filter]);

  useEffect(() => {
    if (supabase !== null) { setOffset(0); fetchItems(true); }
  }, [supabase, filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleVote = useCallback(async (id) => {
    if (voted[id]) return;
    sfx.click();
    const newVoted = { ...voted, [id]: true };
    setVoted(newVoted);
    try { localStorage.setItem('k53_qa_votes', JSON.stringify(newVoted)); } catch {}
    if (supabase) await supabase.rpc('increment_post_votes', { post_id: id }).catch(() => {});
  }, [voted, supabase]);

  const handleAnswer = useCallback(async (postId, text) => {
    if (!supabase) {
      setItems(prev => prev.map(i => i.id === postId ? { ...i, answer: text, answered: true } : i));
      setAnswerTarget(null);
      sfx.success();
      return;
    }
    const { error } = await supabase
      .from('community_posts')
      .update({ explanation: text, answered: true })
      .eq('id', postId);
    if (error) throw new Error(error.message);
    sfx.success();
    setItems(prev => prev.map(i => i.id === postId ? { ...i, answer: text, answered: true } : i));
    setAnswerTarget(null);
  }, [supabase]);

  const handleAsk = useCallback(async () => {
    const q = askText.trim();
    if (q.length < 10) return;
    setAsking(true);
    try {
      if (supabase && userId) {
        const { data, error } = await supabase
          .from('community_posts')
          .insert({ user_id: userId, type: 'question', content: q, answered: false })
          .select('id,content,votes,answered,created_at')
          .single();
        if (error) throw error;
        sfx.success();
        setItems(prev => [{ id: data.id, question: data.content, answer: null, votes: 0, answered: false, created_at: data.created_at }, ...prev]);
      } else {
        sfx.success();
        setItems(prev => [{ id: `local_${Date.now()}`, question: q, answer: null, votes: 0, answered: false, created_at: new Date().toISOString() }, ...prev]);
      }
      setAskText('');
      setShowAsk(false);
    } catch (e) {
      if (import.meta.env.DEV) console.warn(e);
    } finally {
      setAsking(false);
    }
  }, [askText, supabase, userId]);

  return (
    <div style={{ minHeight: '100dvh', background: T.bg, color: T.text, fontFamily: T.font, paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: T.dim, cursor: 'pointer', fontSize: 22 }}>←</button>
        <div>
          <div style={{ fontWeight: 800, fontSize: T.fontSizeLg }}>❓ Community Q&A</div>
          <div style={{ color: T.dim, fontSize: T.fontSize - 2 }}>Ask. Answer. Learn together.</div>
        </div>
        <button onClick={() => setShowAsk(s => !s)} style={{ marginLeft: 'auto', background: T.blue, color: '#fff', border: 'none', borderRadius: 99, padding: '6px 16px', cursor: 'pointer', fontWeight: 700, fontSize: T.fontSize - 1 }}>
          + Ask
        </button>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '14px 16px 0' }}>
        {/* Ask form */}
        <AnimatePresence>
          {showAsk && (
            <motion.div key="ask" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: T.radiusLg, padding: 14 }}>
                <textarea
                  autoFocus
                  value={askText}
                  onChange={e => setAskText(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="What K53 question is confusing you? Be specific…"
                  style={{ width: '100%', background: T.surface, color: T.text, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: '10px 12px', fontSize: T.fontSize, resize: 'none', fontFamily: T.font, boxSizing: 'border-box', marginBottom: 10 }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button onClick={() => setShowAsk(false)} style={{ background: 'none', border: `1px solid ${T.border}`, borderRadius: 99, padding: '7px 18px', color: T.dim, cursor: 'pointer' }}>Cancel</button>
                  <button onClick={handleAsk} disabled={asking || askText.trim().length < 10} style={{ background: askText.trim().length < 10 ? T.border : T.blue, color: '#fff', border: 'none', borderRadius: 99, padding: '7px 20px', cursor: asking || askText.trim().length < 10 ? 'default' : 'pointer', fontWeight: 700 }}>
                    {asking ? 'Posting…' : 'Post Question'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {['all', 'unanswered'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '6px 16px', borderRadius: 99,
              border: `1px solid ${filter === f ? T.blue : T.border}`,
              background: filter === f ? `${T.blue}22` : 'transparent',
              color: filter === f ? T.blue : T.dim,
              cursor: 'pointer', fontSize: T.fontSize - 1, fontWeight: filter === f ? 700 : 400,
            }}>{f === 'all' ? 'All' : 'Unanswered'}</button>
          ))}
        </div>

        {/* Feed */}
        {loading && items.length === 0 ? (
          <div style={{ textAlign: 'center', color: T.dim, padding: 40 }}>…</div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🤔</div>
            <div style={{ color: T.dim }}>No questions yet — ask something!</div>
          </div>
        ) : (
          <>
            {items.map(item => (
              <QACard
                key={item.id}
                item={item}
                onVote={handleVote}
                voted={!!voted[item.id]}
                onAnswer={setAnswerTarget}
                isExpanded={expanded === item.id}
                onToggle={() => setExpanded(e => e === item.id ? null : item.id)}
              />
            ))}
            {hasMore && (
              <button onClick={() => fetchItems(false)} style={{ width: '100%', background: 'none', border: `1px solid ${T.border}`, borderRadius: T.radius, color: T.dim, padding: 12, cursor: 'pointer', marginTop: 4 }}>Load more</button>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {answerTarget && (
          <AnswerModal
            key="modal"
            item={answerTarget}
            onSubmit={handleAnswer}
            onClose={() => setAnswerTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
