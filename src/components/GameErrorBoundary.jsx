import { Component, Suspense } from 'react';
import { T } from '../theme.js';

// SA flag stripe colours
const STRIPE = ['#007A4D', '#FFB612', '#DE3831', '#4472CA', '#FFFFFF'];

// Shown while a lazy-loaded game chunk is fetched over the network.
function GameLoading() {
  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.dim, fontFamily: T.font, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
      <div style={{ display: 'flex', width: 180, height: 5, borderRadius: 3, overflow: 'hidden' }}>
        {STRIPE.map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}
      </div>
      <div style={{ fontSize: 13, letterSpacing: 0.5 }}>Loading…</div>
    </div>
  );
}

export default class GameErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }

  static getDerivedStateFromError(err) {
    return { hasError: true, errorMsg: err?.message || 'Unknown error' };
  }

  componentDidCatch(error, info) {
    console.error('[GameErrorBoundary]', error, info.componentStack);
  }

  reset() {
    this.setState({ hasError: false, errorMsg: '' });
  }

  render() {
    if (!this.state.hasError) return <Suspense fallback={<GameLoading />}>{this.props.children}</Suspense>;

    return (
      <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.font, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        {/* SA flag stripe */}
        <div style={{ display: 'flex', width: '100%', maxWidth: 360, height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 32 }}>
          {STRIPE.map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}
        </div>

        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>

        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>
          Something went wrong
        </div>

        <div style={{ fontSize: 14, color: T.dim, marginBottom: 32, textAlign: 'center', maxWidth: 280, lineHeight: 1.6 }}>
          {this.props.gameName
            ? `The ${this.props.gameName} game hit an error. Your progress is safe.`
            : 'This game hit an error. Your progress is safe.'}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 280 }}>
          <button
            onClick={() => this.reset()}
            style={{ background: T.green, color: '#fff', border: 'none', borderRadius: 10, padding: '14px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: T.font }}
          >
            Try Again
          </button>

          <button
            onClick={() => { this.reset(); this.props.onBack?.(); }}
            style={{ background: 'transparent', color: T.dim, border: `1px solid ${T.border}`, borderRadius: 10, padding: '14px 24px', fontSize: 15, cursor: 'pointer', fontFamily: T.font }}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }
}
