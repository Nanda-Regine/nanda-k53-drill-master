import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../theme.js';
import { sfx } from '../utils/sounds.js';

// ── Helpers ───────────────────────────────────────────────────────────────────
function genJoinCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function timeAgo(iso) {
  const d = Math.floor((Date.now() - new Date(iso)) / 86400000);
  return d === 0 ? 'today' : d === 1 ? 'yesterday' : `${d}d ago`;
}

// ── Student row ───────────────────────────────────────────────────────────────
function StudentRow({ student, rank }) {
  const pct = student.total_questions > 0
    ? Math.round((student.correct_count / student.total_questions) * 100)
    : null;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px',
      background: T.surface,
      borderRadius: T.radius,
      marginBottom: 6,
      border: `1px solid ${T.border}`,
    }}>
      <span style={{ width: 24, color: rank <= 3 ? T.gold : T.dim, fontWeight: 700, textAlign: 'center', flexShrink: 0 }}>
        {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {student.display_name || student.email || 'Student'}
        </div>
        <div style={{ color: T.dim, fontSize: T.fontSize - 3 }}>
          Joined {timeAgo(student.joined_at)} · {student.total_questions || 0} Q answered
        </div>
      </div>
      {pct !== null && (
        <div style={{
          background: pct >= 75 ? `${T.green}22` : `${T.red}22`,
          color: pct >= 75 ? T.green : T.red,
          borderRadius: 99,
          padding: '3px 10px',
          fontSize: T.fontSize - 2,
          fontWeight: 700,
          flexShrink: 0,
        }}>{pct}%</div>
      )}
    </div>
  );
}

// ── Join school screen (for students) ─────────────────────────────────────────
function JoinSchoolScreen({ onJoined, supabase, userId }) {
  const [code, setCode]         = useState('');
  const [joining, setJoining]   = useState(false);
  const [err, setErr]           = useState('');
  const [success, setSuccess]   = useState(false);

  const join = async () => {
    const c = code.trim().toUpperCase();
    if (c.length < 4) { setErr('Enter a valid join code'); return; }
    setErr('');
    setJoining(true);
    try {
      if (!supabase) throw new Error('Not connected');
      const { data: school, error: findErr } = await supabase
        .from('schools')
        .select('id,name')
        .eq('join_code', c)
        .eq('is_active', true)
        .maybeSingle();
      if (findErr) throw findErr;
      if (!school) { setErr('School not found — check the code'); setJoining(false); return; }

      const { error: enrollErr } = await supabase
        .from('school_students')
        .upsert({ school_id: school.id, user_id: userId, joined_at: new Date().toISOString() }, { onConflict: 'school_id,user_id' });
      if (enrollErr) throw enrollErr;

      sfx.success();
      setSuccess(true);
      setTimeout(() => onJoined(school), 1200);
    } catch (e) {
      setErr(e.message || 'Could not join');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: 32 }}>
      <div style={{ fontSize: 52, marginBottom: 12 }}>🏫</div>
      <h2 style={{ color: T.gold, margin: '0 0 8px', fontSize: T.fontSizeXl }}>Join a Driving School</h2>
      <p style={{ color: T.dim, marginBottom: 28 }}>Enter the 6-character code your instructor gave you.</p>

      {success ? (
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} style={{ color: T.green, fontWeight: 700, fontSize: T.fontSizeLg }}>
          ✓ Joined! Loading…
        </motion.div>
      ) : (
        <>
          <input
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            maxLength={8}
            placeholder="e.g. ABC123"
            style={{
              display: 'block', width: '100%', maxWidth: 240, margin: '0 auto 12px',
              background: T.surface, color: T.text, border: `1px solid ${T.border}`,
              borderRadius: T.radius, padding: '14px 16px', fontSize: T.fontSizeXxl,
              letterSpacing: 8, textAlign: 'center', fontFamily: T.font, boxSizing: 'border-box',
            }}
          />
          {err && <div style={{ color: T.red, marginBottom: 12, fontSize: T.fontSize - 1 }}>{err}</div>}
          <button
            onClick={join}
            disabled={joining}
            style={{ background: T.green, color: '#fff', border: 'none', borderRadius: 99, padding: '14px 36px', cursor: joining ? 'default' : 'pointer', fontWeight: 800, fontSize: T.fontSizeLg, opacity: joining ? 0.7 : 1 }}
          >{joining ? 'Joining…' : 'Join School'}</button>
        </>
      )}
    </div>
  );
}

// ── Create school form ─────────────────────────────────────────────────────────
function CreateSchoolForm({ onCreated, supabase, userId }) {
  const [name, setName]         = useState('');
  const [province, setProvince] = useState('');
  const [creating, setCreating] = useState(false);
  const [err, setErr]           = useState('');

  const PROVINCES = ['Eastern Cape','Free State','Gauteng','KwaZulu-Natal','Limpopo','Mpumalanga','Northern Cape','North West','Western Cape'];

  const create = async () => {
    if (!name.trim()) { setErr('School name required'); return; }
    setErr('');
    setCreating(true);
    try {
      if (!supabase) throw new Error('Not connected');
      const joinCode = genJoinCode();
      const { data, error } = await supabase
        .from('schools')
        .insert({ name: name.trim(), province, join_code: joinCode, admin_user_id: userId, is_active: true })
        .select('id,name,join_code,province')
        .single();
      if (error) throw error;
      sfx.success();
      onCreated(data);
    } catch (e) {
      setErr(e.message || 'Could not create school');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 24 }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 44 }}>🏫</div>
        <h2 style={{ color: T.gold, margin: '8px 0 4px', fontSize: T.fontSizeXl }}>Create Driving School</h2>
        <p style={{ color: T.dim, margin: 0 }}>Students join with a 6-character code.</p>
      </div>

      <input
        placeholder="School name *"
        value={name}
        onChange={e => setName(e.target.value)}
        maxLength={80}
        style={{ width: '100%', background: T.surface, color: T.text, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: '12px 14px', fontSize: T.fontSize, marginBottom: 10, boxSizing: 'border-box', fontFamily: T.font }}
      />

      <select
        value={province}
        onChange={e => setProvince(e.target.value)}
        style={{ width: '100%', background: T.surface, color: province ? T.text : T.dim, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: '12px 14px', fontSize: T.fontSize, marginBottom: 16, boxSizing: 'border-box' }}
      >
        <option value="">Province (optional)</option>
        {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
      </select>

      {err && <div style={{ color: T.red, fontSize: T.fontSize - 1, marginBottom: 10 }}>{err}</div>}

      <button
        onClick={create}
        disabled={creating}
        style={{ width: '100%', background: T.green, color: '#fff', border: 'none', borderRadius: 99, padding: '14px', cursor: creating ? 'default' : 'pointer', fontWeight: 800, fontSize: T.fontSizeLg, opacity: creating ? 0.7 : 1 }}
      >{creating ? 'Creating…' : 'Create School'}</button>
    </div>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────
export default function SchoolDashboard({ onBack }) {
  const [screen, setScreen]     = useState('loading'); // loading | setup | join | create | dashboard
  const [school, setSchool]     = useState(null);
  const [role, setRole]         = useState(null);   // 'admin' | 'student'
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [codeVisible, setCodeVisible] = useState(false);
  const [supabase, setSupabase] = useState(null);
  const [userId, setUserId]     = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    import('../supabase.js').then(({ supabase: sb }) => {
      if (!isMounted.current) return;
      setSupabase(sb);
      if (!sb) { setScreen('setup'); return; }
      sb.auth.getUser().then(({ data }) => {
        if (!isMounted.current) return;
        if (!data?.user) { setScreen('setup'); return; }
        setUserId(data.user.id);
        checkEnrollment(sb, data.user.id);
      });
    });
    return () => { isMounted.current = false; };
  }, []);

  const checkEnrollment = useCallback(async (sb, uid) => {
    // Check if admin of any school
    const { data: adminSchool } = await sb
      .from('schools')
      .select('id,name,join_code,province,is_active')
      .eq('admin_user_id', uid)
      .eq('is_active', true)
      .maybeSingle();
    if (adminSchool) {
      if (isMounted.current) { setSchool(adminSchool); setRole('admin'); setScreen('dashboard'); }
      return;
    }
    // Check if student
    const { data: enrollment } = await sb
      .from('school_students')
      .select('school_id, schools(id,name,join_code,province)')
      .eq('user_id', uid)
      .maybeSingle();
    if (enrollment?.schools) {
      if (isMounted.current) { setSchool(enrollment.schools); setRole('student'); setScreen('dashboard'); }
      return;
    }
    if (isMounted.current) setScreen('setup');
  }, []);

  const loadStudents = useCallback(async () => {
    if (!supabase || !school) return;
    setLoadingStudents(true);
    try {
      const { data, error } = await supabase
        .from('school_students')
        .select('user_id, joined_at')
        .eq('school_id', school.id)
        .order('joined_at', { ascending: true });
      if (error) throw error;
      if (isMounted.current) setStudents(data || []);
    } catch {
      if (isMounted.current) setStudents([]);
    } finally {
      if (isMounted.current) setLoadingStudents(false);
    }
  }, [supabase, school]);

  useEffect(() => {
    if (screen === 'dashboard' && role === 'admin') loadStudents();
  }, [screen, role]); // eslint-disable-line react-hooks/exhaustive-deps

  const copyCode = () => {
    sfx.click();
    navigator.clipboard?.writeText(school?.join_code || '').catch(() => {});
  };

  const shareCode = () => {
    const text = `Join ${school?.name} on K53 Drill Master! Code: ${school?.join_code}\nDownload at k53drillmaster.co.za`;
    if (navigator.share) navigator.share({ text }).catch(() => {});
    else window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div style={{ minHeight: '100dvh', background: T.bg, color: T.text, fontFamily: T.font, paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: T.dim, cursor: 'pointer', fontSize: 22 }}>←</button>
        <div>
          <div style={{ fontWeight: 800, fontSize: T.fontSizeLg }}>🏫 {screen === 'dashboard' ? (school?.name || 'School') : 'Driving School'}</div>
          {screen === 'dashboard' && <div style={{ color: T.dim, fontSize: T.fontSize - 2 }}>{role === 'admin' ? 'Admin view' : 'Student view'}</div>}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Loading */}
        {screen === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: 60, color: T.dim }}>
            …
          </motion.div>
        )}

        {/* Setup: choose join or create */}
        {screen === 'setup' && (
          <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ maxWidth: 440, margin: '40px auto', padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>🏫</div>
            <h2 style={{ color: T.text, margin: '0 0 8px', fontSize: T.fontSizeXl }}>Driving School Hub</h2>
            <p style={{ color: T.dim, marginBottom: 32 }}>Connect with your driving school to track progress together.</p>
            <button
              onClick={() => setScreen('join')}
              style={{ display: 'block', width: '100%', background: T.green, color: '#fff', border: 'none', borderRadius: 99, padding: '14px', cursor: 'pointer', fontWeight: 800, fontSize: T.fontSizeLg, marginBottom: 12 }}
            >Join a School</button>
            <button
              onClick={() => setScreen('create')}
              style={{ display: 'block', width: '100%', background: T.surfaceAlt, color: T.text, border: `1px solid ${T.border}`, borderRadius: 99, padding: '14px', cursor: 'pointer', fontWeight: 700, fontSize: T.fontSizeLg }}
            >I'm an Instructor — Create School</button>
          </motion.div>
        )}

        {/* Join screen */}
        {screen === 'join' && (
          <motion.div key="join" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <JoinSchoolScreen
              onJoined={(s) => { setSchool(s); setRole('student'); setScreen('dashboard'); }}
              supabase={supabase}
              userId={userId}
            />
          </motion.div>
        )}

        {/* Create school */}
        {screen === 'create' && (
          <motion.div key="create" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CreateSchoolForm
              onCreated={(s) => { setSchool(s); setRole('admin'); setScreen('dashboard'); }}
              supabase={supabase}
              userId={userId}
            />
          </motion.div>
        )}

        {/* Dashboard */}
        {screen === 'dashboard' && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 560, margin: '0 auto', padding: '16px 16px 0' }}>
            {/* Join code card */}
            <div style={{
              background: T.surfaceAlt,
              border: `1px solid ${T.border}`,
              borderRadius: T.radiusLg,
              padding: '16px 20px',
              marginBottom: 20,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div>
                  <div style={{ color: T.dim, fontSize: T.fontSize - 2 }}>JOIN CODE</div>
                  <div
                    style={{ fontWeight: 900, fontSize: T.fontSizeXxl, letterSpacing: 6, color: T.gold, filter: codeVisible ? 'none' : 'blur(8px)', userSelect: codeVisible ? 'text' : 'none', cursor: 'pointer' }}
                    onClick={() => setCodeVisible(v => !v)}
                  >{school?.join_code}</div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={copyCode} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 99, padding: '6px 14px', color: T.dim, cursor: 'pointer', fontSize: T.fontSize - 2 }}>📋</button>
                  <button onClick={shareCode} style={{ background: T.green, border: 'none', borderRadius: 99, padding: '6px 14px', color: '#fff', cursor: 'pointer', fontSize: T.fontSize - 2, fontWeight: 700 }}>📲 Share</button>
                </div>
              </div>
              <div style={{ color: T.dim, fontSize: T.fontSize - 2 }}>
                {codeVisible ? 'Tap code to hide' : 'Tap code to reveal'} · Share with students to let them join
              </div>
            </div>

            {/* Province */}
            {school?.province && (
              <div style={{ color: T.dim, fontSize: T.fontSize - 1, marginBottom: 16 }}>📍 {school.province}</div>
            )}

            {/* Student leaderboard (admin only) */}
            {role === 'admin' && (
              <>
                <div style={{ fontWeight: 700, color: T.gold, marginBottom: 10 }}>
                  🎓 Students ({students.length})
                  <button
                    onClick={loadStudents}
                    style={{ marginLeft: 10, background: 'none', border: 'none', color: T.dim, cursor: 'pointer', fontSize: T.fontSize - 1 }}
                  >↻ Refresh</button>
                </div>
                {loadingStudents ? (
                  <div style={{ textAlign: 'center', color: T.dim, padding: 24 }}>…</div>
                ) : students.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 32 }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>👩‍🎓</div>
                    <div style={{ color: T.dim }}>No students yet. Share your join code to get started!</div>
                  </div>
                ) : (
                  students.map((s, i) => <StudentRow key={s.user_id} student={s} rank={i + 1} />)
                )}
              </>
            )}

            {/* Student view */}
            {role === 'student' && (
              <div style={{ textAlign: 'center', padding: 24 }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>📊</div>
                <div style={{ color: T.text, fontWeight: 700, marginBottom: 8 }}>You're enrolled at {school?.name}</div>
                <div style={{ color: T.dim, fontSize: T.fontSize - 1 }}>Your instructor can see your practice progress. Keep drilling!</div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
