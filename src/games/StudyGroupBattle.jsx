import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../theme.js';
import { sfx } from '../utils/sounds.js';
import { hapticCorrect, hapticWrong, hapticPass } from '../utils/haptics.js';
import { ROAD_SIGNS } from '../data/roadSigns.js';

// ── Battle config ─────────────────────────────────────────────────────────────
const QUESTION_COUNT = 10;
const ANSWER_SECONDS = 12;

// ── Build a local question set for battles ────────────────────────────────────
function buildBattleQuestions() {
  const signs = [...ROAD_SIGNS].sort(() => Math.random() - 0.5).slice(0, QUESTION_COUNT);
  return signs.map(s => ({
    id: s.id,
    q: `What does the ${s.code || s.id} sign mean?`,
    img: s.img,
    options: [...s.options].sort(() => Math.random() - 0.5),
    answer: s.options[0],
  }));
}

// ── Presence avatar ───────────────────────────────────────────────────────────
function Avatar({ name, score, isMe }) {
  const initials = (name || '?').slice(0, 2).toUpperCase();
  return (
    <div style={{ textAlign: 'center', minWidth: 60 }}>
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        background: isMe ? T.green : T.blue,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 800, fontSize: T.fontSizeLg,
        border: isMe ? `2px solid ${T.gold}` : 'none',
        margin: '0 auto 4px',
      }}>{initials}</div>
      <div style={{ color: T.dim, fontSize: T.fontSize - 3 }}>{score}</div>
    </div>
  );
}

// ── Lobby screen ──────────────────────────────────────────────────────────────
function LobbyScreen({ roomCode, players, isHost, onStart, onLeave, myName }) {
  const copyCode = () => {
    navigator.clipboard?.writeText(roomCode).catch(() => {});
    sfx.click();
  };
  return (
    <div style={{ textAlign: 'center', padding: '40px 24px' }}>
      <div style={{ fontSize: 48, marginBottom: 8 }}>⚔️</div>
      <h2 style={{ color: T.gold, margin: '0 0 4px', fontSize: T.fontSizeXl }}>Study Battle</h2>
      <p style={{ color: T.dim, margin: '0 0 24px', fontSize: T.fontSize - 1 }}>
        Compete live with your study group
      </p>

      <div style={{
        background: T.surfaceAlt,
        borderRadius: T.radiusLg,
        padding: '16px 20px',
        marginBottom: 24,
        display: 'inline-block',
      }}>
        <div style={{ color: T.dim, fontSize: T.fontSize - 2, marginBottom: 4 }}>ROOM CODE</div>
        <div style={{ fontWeight: 900, fontSize: T.fontSizeXxl, letterSpacing: 8, color: T.gold }}>{roomCode}</div>
        <button
          onClick={copyCode}
          style={{ marginTop: 8, background: 'none', border: `1px solid ${T.border}`, borderRadius: 99, padding: '4px 14px', color: T.dim, cursor: 'pointer', fontSize: T.fontSize - 2 }}
        >📋 Copy</button>
      </div>

      {/* Players list */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ color: T.dim, fontSize: T.fontSize - 1, marginBottom: 10 }}>
          Players ({players.length}/8)
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
          {players.map(p => (
            <div key={p.id} style={{
              background: p.name === myName ? `${T.green}22` : T.surface,
              border: `1px solid ${p.name === myName ? T.green : T.border}`,
              borderRadius: 99,
              padding: '6px 14px',
              color: p.name === myName ? T.green : T.text,
              fontSize: T.fontSize - 1,
              fontWeight: p.name === myName ? 700 : 400,
            }}>
              {p.name} {p.name === myName ? '(you)' : ''}
            </div>
          ))}
        </div>
      </div>

      {isHost ? (
        <button
          onClick={onStart}
          disabled={players.length < 1}
          style={{
            background: T.green,
            color: '#fff', border: 'none', borderRadius: 99,
            padding: '14px 40px', fontSize: T.fontSizeLg, fontWeight: 800, cursor: 'pointer',
            opacity: players.length < 1 ? 0.5 : 1,
          }}
        >Start Battle ⚔️</button>
      ) : (
        <div style={{ color: T.dim }}>Waiting for host to start…</div>
      )}

      <div style={{ marginTop: 16 }}>
        <button onClick={onLeave} style={{ background: 'none', border: 'none', color: T.dim, cursor: 'pointer', fontSize: T.fontSize }}>Leave room</button>
      </div>
    </div>
  );
}

// ── Question screen ───────────────────────────────────────────────────────────
function BattleQuestion({ q, qIdx, total, onAnswer, timeLeft, scores, myName }) {
  const [chosen, setChosen] = useState(null);

  const pick = useCallback((opt) => {
    if (chosen) return;
    setChosen(opt);
    const correct = opt === q.answer;
    if (correct) { sfx.correct(); hapticCorrect(); }
    else { sfx.wrong(); hapticWrong(); }
    onAnswer(opt, correct);
  }, [chosen, q.answer, onAnswer]);

  const pct = timeLeft / ANSWER_SECONDS;

  return (
    <div style={{ padding: '16px 16px 0' }}>
      {/* Progress bar (timer) */}
      <div style={{ height: 4, background: T.border, borderRadius: 2, marginBottom: 16, overflow: 'hidden' }}>
        <motion.div
          style={{ height: '100%', background: pct > 0.4 ? T.green : T.red, borderRadius: 2 }}
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 0.9, ease: 'linear' }}
        />
      </div>

      {/* Scoreboard strip */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, justifyContent: 'center' }}>
        {scores.map(s => <Avatar key={s.name} name={s.name} score={s.score} isMe={s.name === myName} />)}
      </div>

      <div style={{ color: T.dim, textAlign: 'center', fontSize: T.fontSize - 2, marginBottom: 12 }}>
        Q{qIdx + 1}/{total} · {timeLeft}s
      </div>

      {/* Image */}
      {q.img && (
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <img src={`/signs/${q.img}`} alt="" style={{ maxHeight: 120, borderRadius: T.radius }} />
        </div>
      )}

      <p style={{ textAlign: 'center', fontWeight: 700, fontSize: T.fontSizeLg, marginBottom: 20 }}>
        {q.q}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {q.options.map((opt, i) => {
          const revealed = chosen !== null;
          const isCorrect = opt === q.answer;
          const isChosen  = opt === chosen;
          let bg = T.surfaceAlt;
          if (revealed && isCorrect) bg = `${T.green}33`;
          if (revealed && isChosen && !isCorrect) bg = `${T.red}33`;
          return (
            <button
              key={i}
              onClick={() => pick(opt)}
              disabled={!!chosen}
              style={{
                background: bg,
                border: `1px solid ${revealed && isCorrect ? T.green : revealed && isChosen ? T.red : T.border}`,
                borderRadius: T.radius,
                padding: '14px 10px',
                color: T.text,
                cursor: chosen ? 'default' : 'pointer',
                fontSize: T.fontSize,
                textAlign: 'left',
                lineHeight: 1.3,
                fontFamily: T.font,
              }}
            >
              {String.fromCharCode(65 + i)}. {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Result screen ─────────────────────────────────────────────────────────────
function ResultScreen({ scores, myName, onRematch, onLeave }) {
  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const myRank = sorted.findIndex(s => s.name === myName) + 1;
  const myScore = scores.find(s => s.name === myName)?.score || 0;
  const winner = sorted[0];

  useEffect(() => {
    sfx.success();
    hapticPass();
  }, []);

  const share = () => {
    const text = `I scored ${myScore}/${QUESTION_COUNT} in a K53 Study Battle (rank #${myRank})! Can you beat me? 🚗⚔️`;
    if (navigator.share) navigator.share({ text }).catch(() => {});
    else window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div style={{ padding: 24, textAlign: 'center' }}>
      {/* SA stripe */}
      <div style={{ display: 'flex', height: 4, marginBottom: 24 }}>
        {['#DE3831','#FFB612','#007A4D','#4472CA'].map(c => <div key={c} style={{ flex: 1, background: c }} />)}
      </div>

      <div style={{ fontSize: 52, marginBottom: 8 }}>🏆</div>
      <div style={{ color: T.gold, fontWeight: 900, fontSize: T.fontSizeXxl, marginBottom: 4 }}>
        {winner.name === myName ? 'YOU WON!' : `${winner.name} wins!`}
      </div>
      <div style={{ color: T.dim, marginBottom: 24 }}>
        You scored {myScore}/{QUESTION_COUNT} · Rank #{myRank}
      </div>

      {/* Leaderboard */}
      <div style={{ background: T.surfaceAlt, borderRadius: T.radiusLg, padding: 16, marginBottom: 24 }}>
        {sorted.map((s, i) => (
          <div key={s.name} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0',
            borderBottom: i < sorted.length - 1 ? `1px solid ${T.border}` : 'none',
          }}>
            <span style={{ width: 24, color: i === 0 ? T.gold : T.dim, fontWeight: 700 }}>
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
            </span>
            <span style={{ flex: 1, color: s.name === myName ? T.green : T.text, fontWeight: s.name === myName ? 700 : 400 }}>
              {s.name}{s.name === myName ? ' (you)' : ''}
            </span>
            <span style={{ color: T.gold, fontWeight: 800 }}>{s.score}/{QUESTION_COUNT}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={onRematch} style={{ background: T.green, color: '#fff', border: 'none', borderRadius: 99, padding: '12px 28px', cursor: 'pointer', fontWeight: 700, fontSize: T.fontSizeLg }}>
          ⚔️ Rematch
        </button>
        <button onClick={share} style={{ background: T.surfaceAlt, color: T.text, border: `1px solid ${T.border}`, borderRadius: 99, padding: '12px 28px', cursor: 'pointer', fontSize: T.fontSizeLg }}>
          📲 Share
        </button>
        <button onClick={onLeave} style={{ background: 'none', border: 'none', color: T.dim, cursor: 'pointer', fontSize: T.fontSizeLg }}>
          Exit
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function StudyGroupBattle({ onBack }) {
  const [screen, setScreen]     = useState('join'); // join | lobby | battle | result
  const [myName, setMyName]     = useState(() => localStorage.getItem('k53_battle_name') || '');
  const [nameInput, setNameInput] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [roomInput, setRoomInput] = useState('');
  const [isHost, setIsHost]     = useState(false);
  const [players, setPlayers]   = useState([]);
  const [questions, setQuestions] = useState([]);
  const [qIdx, setQIdx]         = useState(0);
  const [scores, setScores]     = useState([]);
  const [timeLeft, setTimeLeft] = useState(ANSWER_SECONDS);
  const [supabase, setSupabase] = useState(null);
  const [channel, setChannel]   = useState(null);
  const timerRef  = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    import('../supabase.js').then(({ supabase: sb }) => {
      if (isMounted.current) setSupabase(sb);
    });
    return () => {
      isMounted.current = false;
      clearInterval(timerRef.current);
    };
  }, []);

  const genCode = () => Math.random().toString(36).slice(2, 7).toUpperCase();

  const saveName = useCallback((name) => {
    const n = name.trim().slice(0, 16);
    if (!n) return;
    setMyName(n);
    try { localStorage.setItem('k53_battle_name', n); } catch {}
  }, []);

  // ── Channel helpers ──────────────────────────────────────────────────────────
  const joinChannel = useCallback((code, name, host) => {
    if (!supabase) {
      // Offline solo mode
      const me = { id: 'local', name };
      setPlayers([me]);
      setScores([{ name, score: 0 }]);
      setIsHost(true);
      return;
    }
    const ch = supabase.channel(`battle:${code}`, { config: { presence: { key: name } } });

    ch.on('presence', { event: 'sync' }, () => {
      if (!isMounted.current) return;
      const state = ch.presenceState();
      const ps = Object.values(state).flat().map(p => ({ id: p.key, name: p.name }));
      setPlayers(ps);
      setScores(ps.map(p => ({ name: p.name, score: 0 })));
    });

    ch.on('broadcast', { event: 'start' }, ({ payload }) => {
      if (!isMounted.current) return;
      setQuestions(payload.questions);
      setQIdx(0);
      setTimeLeft(ANSWER_SECONDS);
      setScreen('battle');
      startTimer();
    });

    ch.on('broadcast', { event: 'answer' }, ({ payload }) => {
      if (!isMounted.current) return;
      if (payload.correct) {
        setScores(prev => prev.map(s => s.name === payload.name ? { ...s, score: s.score + 1 } : s));
      }
    });

    ch.on('broadcast', { event: 'next' }, () => {
      if (!isMounted.current) return;
      setQIdx(prev => {
        const next = prev + 1;
        if (next >= QUESTION_COUNT) {
          clearInterval(timerRef.current);
          setScreen('result');
        } else {
          setTimeLeft(ANSWER_SECONDS);
          startTimer();
        }
        return next;
      });
    });

    ch.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await ch.track({ name, host });
        if (host) { setIsHost(true); }
        setScreen('lobby');
      }
    });

    setChannel(ch);
  }, [supabase]);

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    let t = ANSWER_SECONDS;
    timerRef.current = setInterval(() => {
      t -= 1;
      if (!isMounted.current) { clearInterval(timerRef.current); return; }
      setTimeLeft(t);
      if (t <= 0) {
        clearInterval(timerRef.current);
        advanceQuestion();
      }
    }, 1000);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const advanceQuestion = useCallback(() => {
    if (channel && isHost) {
      channel.send({ type: 'broadcast', event: 'next', payload: {} });
    }
  }, [channel, isHost]);

  const handleCreate = useCallback(() => {
    const name = nameInput.trim().slice(0, 16) || myName;
    if (!name) return;
    saveName(name);
    const code = genCode();
    setRoomCode(code);
    joinChannel(code, name, true);
  }, [nameInput, myName, saveName, joinChannel]);

  const handleJoin = useCallback(() => {
    const name = nameInput.trim().slice(0, 16) || myName;
    const code = roomInput.trim().toUpperCase();
    if (!name || !code) return;
    saveName(name);
    setRoomCode(code);
    joinChannel(code, name, false);
  }, [nameInput, myName, roomInput, saveName, joinChannel]);

  const handleStart = useCallback(() => {
    const qs = buildBattleQuestions();
    setQuestions(qs);
    setQIdx(0);
    setTimeLeft(ANSWER_SECONDS);
    if (channel) {
      channel.send({ type: 'broadcast', event: 'start', payload: { questions: qs } });
    }
    setScreen('battle');
    startTimer();
  }, [channel, startTimer]);

  const handleAnswer = useCallback((opt, correct) => {
    if (channel) {
      channel.send({ type: 'broadcast', event: 'answer', payload: { name: myName, correct } });
    }
    if (correct) {
      setScores(prev => prev.map(s => s.name === myName ? { ...s, score: s.score + 1 } : s));
    }
    setTimeout(() => advanceQuestion(), 1600);
  }, [channel, myName, advanceQuestion]);

  const handleLeave = useCallback(() => {
    clearInterval(timerRef.current);
    channel?.unsubscribe();
    setChannel(null);
    setScreen('join');
    setPlayers([]);
    setScores([]);
    setQuestions([]);
  }, [channel]);

  const handleRematch = useCallback(() => {
    const qs = buildBattleQuestions();
    setQuestions(qs);
    setQIdx(0);
    setTimeLeft(ANSWER_SECONDS);
    setScores(players.map(p => ({ name: p.name, score: 0 })));
    if (channel && isHost) {
      channel.send({ type: 'broadcast', event: 'start', payload: { questions: qs } });
    }
    setScreen('battle');
    startTimer();
  }, [channel, isHost, players, startTimer]);

  return (
    <div style={{ minHeight: '100dvh', background: T.bg, color: T.text, fontFamily: T.font }}>
      {/* Header */}
      <div style={{
        background: T.surface, borderBottom: `1px solid ${T.border}`,
        padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <button onClick={screen === 'join' ? onBack : handleLeave} style={{ background: 'none', border: 'none', color: T.dim, cursor: 'pointer', fontSize: 22 }}>←</button>
        <span style={{ fontWeight: 800, fontSize: T.fontSizeLg }}>⚔️ Study Battle</span>
        {screen === 'lobby' && <span style={{ marginLeft: 'auto', color: T.gold, fontWeight: 700 }}>{roomCode}</span>}
      </div>

      <AnimatePresence mode="wait">
        {screen === 'join' && (
          <motion.div key="join" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ padding: 24, maxWidth: 400, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 48 }}>⚔️</div>
              <p style={{ color: T.dim }}>Battle your study group live — 10 K53 questions, fastest wins.</p>
            </div>

            <input
              placeholder="Your name (max 16 chars)"
              value={nameInput || myName}
              onChange={e => setNameInput(e.target.value)}
              maxLength={16}
              style={{ width: '100%', background: T.surface, color: T.text, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: '12px 14px', fontSize: T.fontSize, fontFamily: T.font, boxSizing: 'border-box', marginBottom: 16 }}
            />

            <button
              onClick={handleCreate}
              style={{ width: '100%', background: T.green, color: '#fff', border: 'none', borderRadius: 99, padding: '14px', cursor: 'pointer', fontWeight: 800, fontSize: T.fontSizeLg, marginBottom: 12 }}
            >Create Room</button>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: T.border }} />
              <span style={{ color: T.dim, fontSize: T.fontSize - 2 }}>or</span>
              <div style={{ flex: 1, height: 1, background: T.border }} />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <input
                placeholder="Room code"
                value={roomInput}
                onChange={e => setRoomInput(e.target.value.toUpperCase())}
                maxLength={6}
                style={{ flex: 1, background: T.surface, color: T.text, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: '12px 14px', fontSize: T.fontSizeLg, letterSpacing: 4, fontFamily: T.font }}
              />
              <button
                onClick={handleJoin}
                disabled={roomInput.length < 4}
                style={{ background: T.blue, color: '#fff', border: 'none', borderRadius: 99, padding: '12px 24px', cursor: roomInput.length < 4 ? 'default' : 'pointer', fontWeight: 700, opacity: roomInput.length < 4 ? 0.5 : 1 }}
              >Join</button>
            </div>
          </motion.div>
        )}

        {screen === 'lobby' && (
          <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LobbyScreen
              roomCode={roomCode}
              players={players}
              isHost={isHost}
              myName={myName || nameInput}
              onStart={handleStart}
              onLeave={handleLeave}
            />
          </motion.div>
        )}

        {screen === 'battle' && questions[qIdx] && (
          <motion.div key={`q${qIdx}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <BattleQuestion
              q={questions[qIdx]}
              qIdx={qIdx}
              total={QUESTION_COUNT}
              onAnswer={handleAnswer}
              timeLeft={timeLeft}
              scores={scores}
              myName={myName || nameInput}
            />
          </motion.div>
        )}

        {screen === 'result' && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <ResultScreen
              scores={scores}
              myName={myName || nameInput}
              onRematch={handleRematch}
              onLeave={handleLeave}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
