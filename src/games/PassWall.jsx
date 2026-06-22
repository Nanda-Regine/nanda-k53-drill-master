import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../theme.js';
import { sfx } from '../utils/sounds.js';
import { hapticPass } from '../utils/haptics.js';

// ── Constants ─────────────────────────────────────────────────────────────────
const EXAM_LABELS = { code8: 'Code 8', code10: 'Code 10', code14: 'Code 14', code1: 'Code 1' };
const PAGE_SIZE = 15;

// ── Local mock data (used when Supabase unavailable) ─────────────────────────
const MOCK_POSTS = [
  { id: 'm1', type: 'pass', content: 'Just passed my Code 8! 🎉', score: 55, total: 68, exam_type: 'code8', likes: 12, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 'm2', type: 'tip', content: 'Remember: 45m emergency triangle, 2s following distance. Drill it daily!', score: null, total: null, exam_type: null, likes: 34, created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 'm3', type: 'pass', content: 'Finally! Third attempt but I did it. Code 14 done!', score: 78, total: 90, exam_type: 'code14', likes: 28, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'm4', type: 'achievement', content: 'Hit 100 question streak on VehicleControls 🔥', score: null, total: null, exam_type: null, likes: 9, created_at: new Date(Date.now() - 172800000).toISOString() },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(iso) {
  const seconds = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function pct(score, total) {
  if (!score || !total) return null;
  return Math.round((score / total) * 100);
}

// ── Post card ─────────────────────────────────────────────────────────────────
function PostCard({ post, onLike, liked }) {
  const isPass = post.type === 'pass';
  const isTip  = post.type === 'tip';
  const isAch  = post.type === 'achievement';
  const score  = pct(post.score, post.total);

  const accent = isPass ? T.green : isTip ? T.gold : T.blue;
  const icon   = isPass ? '🏆' : isTip ? '💡' : isAch ? '🔥' : '💬';
  const label  = isPass ? (EXAM_LABELS[post.exam_type] || 'Exam') + ' Pass!'
    : isTip ? 'Study Tip'
    : isAch ? 'Achievement'
    : 'Post';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderLeft: `3px solid ${accent}`,
        borderRadius: T.radius,
        padding: '14px 16px',
        marginBottom: 10,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ color: accent, fontWeight: 700, fontSize: T.fontSize }}>{label}</span>
        {score !== null && (
          <span style={{
            marginLeft: 'auto',
            background: score >= 75 ? T.green : T.red,
            color: '#fff',
            borderRadius: 99,
            padding: '2px 10px',
            fontSize: T.fontSize - 2,
            fontWeight: 700,
          }}>
            {score}% ({post.score}/{post.total})
          </span>
        )}
      </div>

      {/* Content */}
      <p style={{ margin: 0, color: T.text, fontSize: T.fontSize, lineHeight: 1.5 }}>
        {post.content}
      </p>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
        <span style={{ color: T.dim, fontSize: T.fontSize - 2 }}>{timeAgo(post.created_at)}</span>
        <button
          onClick={() => onLike(post.id)}
          style={{
            marginLeft: 'auto',
            background: liked ? `${T.red}22` : 'transparent',
            border: `1px solid ${liked ? T.red : T.border}`,
            borderRadius: 99,
            padding: '3px 12px',
            color: liked ? T.red : T.dim,
            cursor: 'pointer',
            fontSize: T.fontSize - 2,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          ❤️ {post.likes + (liked ? 1 : 0)}
        </button>
      </div>
    </motion.div>
  );
}

// ── Compose post form ─────────────────────────────────────────────────────────
function ComposeForm({ onPost, userId }) {
  const [type, setType]       = useState('pass');
  const [content, setContent] = useState('');
  const [score, setScore]     = useState('');
  const [total, setTotal]     = useState('68');
  const [examType, setExamType] = useState('code8');
  const [posting, setPosting] = useState(false);
  const [err, setErr]         = useState('');

  const submit = useCallback(async () => {
    const text = content.trim();
    if (!text) { setErr('Write something first'); return; }
    if (text.length > 500) { setErr('Max 500 characters'); return; }
    setErr('');
    setPosting(true);
    try {
      await onPost({ type, content: text, score: score !== '' ? parseInt(score, 10) : null, total: total !== '' ? parseInt(total, 10) : null, exam_type: type === 'pass' ? examType : null });
      setContent('');
      setScore('');
    } catch (e) {
      setErr(e.message || 'Could not post');
    } finally {
      setPosting(false);
    }
  }, [type, content, score, total, examType, onPost]);

  const TYPE_OPTS = [
    { value: 'pass', label: '🏆 Pass' },
    { value: 'tip', label: '💡 Tip' },
    { value: 'achievement', label: '🔥 Achievement' },
  ];

  return (
    <div style={{
      background: T.surfaceAlt,
      border: `1px solid ${T.border}`,
      borderRadius: T.radiusLg,
      padding: 16,
      marginBottom: 20,
    }}>
      {/* Type selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {TYPE_OPTS.map(o => (
          <button
            key={o.value}
            onClick={() => setType(o.value)}
            style={{
              padding: '6px 14px',
              borderRadius: 99,
              border: `1px solid ${type === o.value ? T.green : T.border}`,
              background: type === o.value ? `${T.green}22` : 'transparent',
              color: type === o.value ? T.green : T.dim,
              cursor: 'pointer',
              fontSize: T.fontSize - 1,
              fontWeight: type === o.value ? 700 : 400,
            }}
          >{o.label}</button>
        ))}
      </div>

      {/* Pass-specific fields */}
      {type === 'pass' && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          <select
            value={examType}
            onChange={e => setExamType(e.target.value)}
            style={{ flex: 1, minWidth: 100, background: T.surface, color: T.text, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: '6px 10px', fontSize: T.fontSize - 1 }}
          >
            {Object.entries(EXAM_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <input
            type="number" min="0" max="200" placeholder="Score"
            value={score} onChange={e => setScore(e.target.value)}
            style={{ width: 70, background: T.surface, color: T.text, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: '6px 10px', fontSize: T.fontSize - 1 }}
          />
          <span style={{ alignSelf: 'center', color: T.dim }}>/</span>
          <input
            type="number" min="1" max="200" placeholder="Total"
            value={total} onChange={e => setTotal(e.target.value)}
            style={{ width: 70, background: T.surface, color: T.text, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: '6px 10px', fontSize: T.fontSize - 1 }}
          />
        </div>
      )}

      {/* Content textarea */}
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder={
          type === 'pass' ? "Tell the community about your pass! 🎉" :
          type === 'tip'  ? "Share a study tip that helped you..." :
          "What achievement did you unlock?"
        }
        maxLength={500}
        rows={3}
        style={{
          width: '100%',
          background: T.surface,
          color: T.text,
          border: `1px solid ${T.border}`,
          borderRadius: T.radius,
          padding: '10px 12px',
          fontSize: T.fontSize,
          resize: 'vertical',
          fontFamily: T.font,
          boxSizing: 'border-box',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <span style={{ color: T.dim, fontSize: T.fontSize - 2 }}>{content.length}/500</span>
        {err && <span style={{ color: T.red, fontSize: T.fontSize - 2 }}>{err}</span>}
        <button
          onClick={submit}
          disabled={posting || !content.trim()}
          style={{
            background: posting || !content.trim() ? T.border : T.green,
            color: '#fff',
            border: 'none',
            borderRadius: 99,
            padding: '8px 20px',
            cursor: posting || !content.trim() ? 'default' : 'pointer',
            fontWeight: 700,
            fontSize: T.fontSize,
          }}
        >{posting ? 'Posting…' : 'Post'}</button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function PassWall({ onBack }) {
  const [posts, setPosts]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [offset, setOffset]     = useState(0);
  const [hasMore, setHasMore]   = useState(true);
  const [liked, setLiked]       = useState(() => {
    try { return JSON.parse(localStorage.getItem('k53_liked_posts') || '{}'); } catch { return {}; }
  });
  const [supabase, setSupabase] = useState(null);
  const [userId, setUserId]     = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // Init Supabase
  useEffect(() => {
    import('../supabase.js').then(({ supabase: sb }) => {
      if (!isMounted.current) return;
      setSupabase(sb);
      if (sb) {
        sb.auth.getUser().then(({ data }) => {
          if (isMounted.current && data?.user) setUserId(data.user.id);
        });
      }
    });
  }, []);

  const fetchPosts = useCallback(async (reset = false) => {
    const currentOffset = reset ? 0 : offset;
    setLoading(true);
    try {
      let rows;
      if (supabase) {
        const { data, error } = await supabase
          .from('community_posts')
          .select('id,type,content,score,total,exam_type,likes,created_at')
          .in('type', ['pass', 'tip', 'achievement'])
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .range(currentOffset, currentOffset + PAGE_SIZE - 1);
        if (error) throw error;
        rows = data || [];
      } else {
        rows = MOCK_POSTS.slice(currentOffset, currentOffset + PAGE_SIZE);
      }
      if (!isMounted.current) return;
      if (reset) {
        setPosts(rows);
      } else {
        setPosts(prev => [...prev, ...rows]);
      }
      setOffset(currentOffset + rows.length);
      setHasMore(rows.length === PAGE_SIZE);
    } catch {
      if (isMounted.current && reset) setPosts(MOCK_POSTS);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [supabase, offset]);

  useEffect(() => {
    if (supabase !== null) fetchPosts(true);
  }, [supabase]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLike = useCallback(async (postId) => {
    const alreadyLiked = liked[postId];
    if (alreadyLiked) return; // no unlike
    sfx.click();
    hapticPass();
    const newLiked = { ...liked, [postId]: true };
    setLiked(newLiked);
    try { localStorage.setItem('k53_liked_posts', JSON.stringify(newLiked)); } catch {}
    if (supabase) {
      await supabase.rpc('increment_post_likes', { post_id: postId }).catch(() => {});
    }
  }, [liked, supabase]);

  const handlePost = useCallback(async ({ type, content, score, total, exam_type }) => {
    if (!supabase || !userId) {
      // Guest: prepend to local list only
      const newPost = { id: `local_${Date.now()}`, type, content, score, total, exam_type, likes: 0, created_at: new Date().toISOString() };
      setPosts(prev => [newPost, ...prev]);
      sfx.success();
      hapticPass();
      return;
    }
    const { data, error } = await supabase
      .from('community_posts')
      .insert({ user_id: userId, type, content, score, total, exam_type })
      .select('id,type,content,score,total,exam_type,likes,created_at')
      .single();
    if (error) throw new Error(error.message);
    sfx.success();
    hapticPass();
    setPosts(prev => [data, ...prev]);
    setShowCompose(false);
  }, [supabase, userId]);

  const share = useCallback(() => {
    const text = `Join me on K53 Drill Master! Train for your SA driving test 🚗\nhttps://k53drillmaster.co.za`;
    if (navigator.share) navigator.share({ text }).catch(() => {});
    else window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }, []);

  return (
    <div style={{
      minHeight: '100dvh',
      background: T.bg,
      color: T.text,
      fontFamily: T.font,
      paddingBottom: 40,
    }}>
      {/* Header */}
      <div style={{
        background: T.surface,
        borderBottom: `1px solid ${T.border}`,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: T.dim, cursor: 'pointer', fontSize: 22, lineHeight: 1 }}>←</button>
        <span style={{ fontSize: 20 }}>🏆</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: T.fontSizeLg }}>Pass Wall</div>
          <div style={{ color: T.dim, fontSize: T.fontSize - 2 }}>Celebrate with the K53 community</div>
        </div>
        <button
          onClick={share}
          style={{ marginLeft: 'auto', background: 'none', border: `1px solid ${T.border}`, color: T.text, borderRadius: 99, padding: '6px 14px', cursor: 'pointer', fontSize: T.fontSize - 1 }}
        >📲 Share</button>
      </div>

      {/* SA stripe */}
      <div style={{ display: 'flex', height: 4 }}>
        {['#DE3831','#FFB612','#007A4D','#4472CA'].map(c => (
          <div key={c} style={{ flex: 1, background: c }} />
        ))}
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '16px 16px 0' }}>

        {/* Compose toggle */}
        <div style={{ marginBottom: 16 }}>
          {!showCompose ? (
            <button
              onClick={() => setShowCompose(true)}
              style={{
                width: '100%',
                background: T.surfaceAlt,
                border: `1px dashed ${T.border}`,
                borderRadius: T.radiusLg,
                color: T.dim,
                padding: '14px 16px',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: T.fontSize,
                fontFamily: T.font,
              }}
            >
              🏆 Share your pass or study tip…
            </button>
          ) : (
            <ComposeForm onPost={handlePost} userId={userId} />
          )}
        </div>

        {/* Feed */}
        <AnimatePresence>
          {posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              liked={!!liked[post.id]}
            />
          ))}
        </AnimatePresence>

        {loading && (
          <div style={{ textAlign: 'center', color: T.dim, padding: 24, fontSize: T.fontSizeLg }}>…</div>
        )}

        {!loading && hasMore && (
          <button
            onClick={() => fetchPosts(false)}
            style={{
              width: '100%',
              background: 'none',
              border: `1px solid ${T.border}`,
              borderRadius: T.radius,
              color: T.dim,
              padding: '12px',
              cursor: 'pointer',
              fontSize: T.fontSize,
              marginTop: 8,
            }}
          >Load more</button>
        )}

        {!loading && posts.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🌱</div>
            <div style={{ color: T.dim }}>No posts yet — be the first to celebrate!</div>
          </div>
        )}
      </div>
    </div>
  );
}
