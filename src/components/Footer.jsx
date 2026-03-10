import { useState } from 'react';
import { T } from '../theme.js';

// ── Legal document content ─────────────────────────────────────────────────────
const PRIVACY = `PRIVACY POLICY — K53 Drill Master
Last updated: March 2026

1. DATA WE COLLECT
All study data (progress, streaks, badges, quiz history) is stored locally on your device using browser localStorage. We do not upload or transmit your answers to any server.

If you sign in with a magic link, we store your email address in our Supabase database solely to verify your subscription status. We do not sell or share your email with third parties.

Payment processing is handled by PayFast. We never see or store your card details.

2. ANALYTICS
We use Vercel Analytics to track aggregate page views and performance metrics. No personally identifiable information is collected.

3. COOKIES
No tracking cookies are used. A session token may be set if you sign in via magic link, for authentication purposes only.

4. YOUR RIGHTS
You may delete all local data at any time via Settings → Reset all progress. To delete your account and email from our database, contact us via WhatsApp.

5. CONTACT
Nandawula Kabali-Kagwa · WhatsApp: +27 84 291 6742 · creativelynanda.co.za`;

const TERMS = `TERMS OF SERVICE — K53 Drill Master
Last updated: March 2026

1. ACCEPTANCE
By using K53 Drill Master you agree to these terms.

2. SERVICE DESCRIPTION
K53 Drill Master is an educational practice tool for the South African DLTC learner's licence test. Questions are derived from official DLTC publications. We do not guarantee pass results — exam outcomes depend on your individual effort and the actual test administered by the DLTC.

3. FREE TIER
Free users may answer up to 10 questions per day. The first 30 days from first use are unlimited.

4. PAID PLANS
Subscriptions and lifetime plans are processed via PayFast. Monthly plans auto-renew unless cancelled. Lifetime plans are one-time purchases. No refunds are offered after access is activated.

5. INTELLECTUAL PROPERTY
Question content is sourced from publicly available government documents (K53 manuals). App code and design are proprietary. You may not copy, scrape or resell the question database.

6. LIMITATION OF LIABILITY
K53 Drill Master is provided "as is". We are not liable for any loss arising from use of this app or from failing the DLTC test.

7. CONTACT
WhatsApp: +27 84 291 6742`;

const DISCLAIMER = `EDUCATIONAL DISCLAIMER

K53 Drill Master is an independent study aid and is NOT affiliated with or endorsed by the South African Department of Transport, DLTC, or any government body.

All questions are based on the publicly available K53 manual (Rules of the Road and Manual on Road Traffic Signs) published by the Department of Transport. Practice questions are for educational purposes only and may differ from questions on your actual test.

Always study the official K53 manuals in addition to using this app.`;

const DOCS = {
  privacy: { title: 'Privacy Policy', content: PRIVACY },
  terms:   { title: 'Terms of Service', content: TERMS },
  disclaimer: { title: 'Disclaimer', content: DISCLAIMER },
};

function LegalModal({ doc, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9990, display: 'flex', alignItems: 'flex-end' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: T.surface, borderRadius: '16px 16px 0 0', width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px 12px', borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontWeight: 700, fontSize: 17, color: T.text, fontFamily: T.font }}>{doc.title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: T.dim, fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ overflowY: 'auto', padding: '16px 20px 40px', flex: 1 }}>
          <pre style={{ fontFamily: T.font, fontSize: 13, color: T.dim, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
            {doc.content}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default function Footer() {
  const [openDoc, setOpenDoc] = useState(null);

  return (
    <>
      <div style={{
        padding: '20px 20px 24px',
        borderTop: `1px solid ${T.border}`,
        textAlign: 'center',
        marginTop: 8,
      }}>
        <div style={{ fontSize: 11, color: T.dim, marginBottom: 10, fontFamily: T.font }}>
          © 2026 K53 Drill Master · South Africa
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '4px 16px' }}>
          {Object.entries(DOCS).map(([key, doc]) => (
            <button
              key={key}
              onClick={() => setOpenDoc(key)}
              style={{ background: 'none', border: 'none', color: T.dim, fontSize: 11, cursor: 'pointer', fontFamily: T.font, textDecoration: 'underline', padding: '2px 0' }}
            >
              {doc.title}
            </button>
          ))}
          <a
            href="https://wa.me/27842916742"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: T.dim, fontSize: 11, fontFamily: T.font, textDecoration: 'underline' }}
          >
            Contact Us
          </a>
        </div>
        <div style={{ fontSize: 10, color: T.border, marginTop: 10, fontFamily: T.mono }}>
          Not affiliated with the SA Department of Transport or DLTC
        </div>
      </div>

      {openDoc && <LegalModal doc={DOCS[openDoc]} onClose={() => setOpenDoc(null)} />}
    </>
  );
}
