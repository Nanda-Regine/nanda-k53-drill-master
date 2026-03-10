import { useState } from 'react';
import { T } from '../theme.js';

const PRIVACY = `PRIVACY POLICY — K53 Drill Master
Last updated: March 2026

1. DATA WE COLLECT
All study data (progress, streaks, badges, quiz history) is stored locally on your device using browser localStorage. We do not upload your answers to any server.

If you sign in with a magic link, we store your email address in our Supabase database solely to verify your subscription. We do not sell or share your email.

Payment processing is handled by PayFast. We never see or store your card details.

2. ANALYTICS
We use Vercel Analytics to track aggregate page views. No personally identifiable information is collected.

3. YOUR RIGHTS
Delete all local data via Settings → Reset all progress. To delete your account, contact us via WhatsApp.

4. CONTACT
Nandawula Kabali-Kagwa · hello@creativelynanda.co.za`;

const TERMS = `TERMS OF SERVICE — K53 Drill Master
Last updated: March 2026

1. ACCEPTANCE
By using K53 Drill Master you agree to these terms.

2. SERVICE
K53 Drill Master is an educational tool for the SA DLTC learner's licence test. We do not guarantee pass results.

3. FREE TIER
Free users: up to 10 questions per day. First 30 days unlimited.

4. PAID PLANS
Processed via PayFast. Monthly plans auto-renew. Lifetime plans are one-time. No refunds after activation.

5. INTELLECTUAL PROPERTY
Questions sourced from public DLTC manuals. App code is proprietary — do not copy or resell.

6. LIABILITY
Provided "as is". Not liable for test outcomes.

7. CONTACT
WhatsApp: +27 84 291 6742`;

const DISCLAIMER = `EDUCATIONAL DISCLAIMER

K53 Drill Master is independent and NOT affiliated with the SA Department of Transport, DLTC, or any government body.

Questions are based on the publicly available K53 manuals (Rules of the Road and Manual on Road Traffic Signs). Always study the official manuals alongside this app.`;

const DOCS = {
  privacy:    { title: 'Privacy Policy',   content: PRIVACY },
  terms:      { title: 'Terms of Service', content: TERMS },
  disclaimer: { title: 'Disclaimer',       content: DISCLAIMER },
};

function LegalModal({ doc, onClose }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9990, display: 'flex', alignItems: 'flex-end' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: '20px 20px 0 0', width: '100%', maxHeight: '82vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px 14px', borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontWeight: 700, fontSize: 17, color: T.text, fontFamily: T.font }}>{doc.title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: T.dim, fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ overflowY: 'auto', padding: '16px 20px 40px', flex: 1 }}>
          <pre style={{ fontFamily: T.font, fontSize: 13, color: T.dim, whiteSpace: 'pre-wrap', lineHeight: 1.75 }}>{doc.content}</pre>
        </div>
      </div>
    </div>
  );
}

export default function Footer() {
  const [openDoc, setOpenDoc] = useState(null);

  return (
    <>
      <div style={{ padding: '28px 20px 32px', borderTop: `1px solid ${T.border}`, textAlign: 'center' }}>
        {/* Built by */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: T.dim, fontFamily: T.font, marginBottom: 4 }}>Built by</div>
          <a href="https://creativelynanda.co.za" target="_blank" rel="noopener noreferrer"
            style={{ color: T.gold, fontWeight: 700, fontSize: 14, fontFamily: T.font, textDecoration: 'none', display: 'block', marginBottom: 2 }}>
            Nandawula Kabali-Kagwa
          </a>
          <div style={{ fontSize: 11, color: T.dim, fontFamily: T.font, marginBottom: 8 }}>Creative Technologist & AI Engineer</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
            <a href="https://creativelynanda.co.za" target="_blank" rel="noopener noreferrer"
              style={{ color: T.dim, fontSize: 12, fontFamily: T.font, textDecoration: 'none' }}>
              🌐 creativelynanda.co.za
            </a>
            <a href="https://wa.me/27842916742" target="_blank" rel="noopener noreferrer"
              style={{ color: '#25d366', fontSize: 12, fontFamily: T.font, textDecoration: 'none' }}>
              💬 WhatsApp
            </a>
          </div>
        </div>

        {/* Legal links */}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '4px 14px', marginBottom: 10 }}>
          {Object.entries(DOCS).map(([key, doc]) => (
            <button key={key} onClick={() => setOpenDoc(key)}
              style={{ background: 'none', border: 'none', color: T.dim, fontSize: 11, cursor: 'pointer', fontFamily: T.font, textDecoration: 'underline', padding: '2px 0' }}>
              {doc.title}
            </button>
          ))}
        </div>

        <div style={{ fontSize: 10, color: T.border, fontFamily: T.font, marginTop: 4 }}>
          © 2026 K53 Drill Master · Not affiliated with the SA Dept. of Transport or DLTC
        </div>
      </div>

      {openDoc && <LegalModal doc={DOCS[openDoc]} onClose={() => setOpenDoc(null)} />}
    </>
  );
}
