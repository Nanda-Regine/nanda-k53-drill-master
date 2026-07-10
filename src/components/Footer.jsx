import { useState } from 'react';
import { T } from '../theme.js';

// ── Legal document content ────────────────────────────────────────────────────

const PRIVACY = `PRIVACY POLICY (POPIA COMPLIANT)
K53 Drill Master — Mirembe Muse (Pty) Ltd
Last updated: 10 July 2026

This policy applies to the K53 Drill Master application ("the App"), operated by Mirembe Muse (Pty) Ltd ("we", "us", "our"), in accordance with the Protection of Personal Information Act 4 of 2013 (POPIA).

───────────────────────────────────
1. RESPONSIBLE PARTY
───────────────────────────────────
Mirembe Muse (Pty) Ltd
East London, Eastern Cape, South Africa
Information Officer: Nandawula Regine
Email: hello@creativelynanda.co.za

───────────────────────────────────
2. PERSONAL INFORMATION WE COLLECT
───────────────────────────────────
a) Information you provide:
   · Email address (when you sign in or subscribe)
   · Payment details (processed by our payment providers — Paystack for monthly subscriptions, PayFast for once-off payments; we never store card data)

b) Information collected automatically:
   · Study progress, quiz scores, streaks, badges — stored locally on your device in browser localStorage. This data never leaves your device unless you choose to sync.
   · Aggregate usage analytics via Vercel Analytics, PostHog and Google Tag Manager (page views, device type, feature usage) — used only in aggregate to improve the App.

c) Information we do NOT collect:
   · We do not collect ID numbers, addresses, or sensitive personal information as defined by POPIA.

───────────────────────────────────
3. PURPOSE OF PROCESSING
───────────────────────────────────
We process your personal information only for:
   · Verifying your subscription status
   · Sending transactional emails (e.g., magic link authentication)
   · Fraud prevention and security
   · Legal compliance

We do not process personal information for any secondary purpose without your explicit consent.

───────────────────────────────────
4. LAWFUL BASIS FOR PROCESSING
───────────────────────────────────
We process personal information on the following grounds (POPIA section 11):
   · Contract: to provide the subscription service you have purchased
   · Legitimate interest: to maintain app security and prevent abuse
   · Legal obligation: to comply with applicable South African law

───────────────────────────────────
5. SHARING WITH THIRD PARTIES
───────────────────────────────────
We share personal information only with:
   · Supabase Inc. (database and authentication) — stores your email and subscription record
   · Paystack (Pty) Ltd and PayFast (Pty) Ltd (payment processing) — handle all payment data
   · Vercel Inc. (hosting and aggregate analytics) — serves the application
   · PostHog and Google (Tag Manager) — aggregate, non-advertising usage analytics

All third parties are contractually required to protect your data. We do not sell personal information.

───────────────────────────────────
6. DATA RETENTION
───────────────────────────────────
   · Subscription records: retained for 5 years for tax/legal compliance, then securely deleted
   · Authentication records: deleted within 30 days of account closure on request
   · Local device data: remains on your device until you clear it via Settings → Reset Progress

───────────────────────────────────
7. YOUR RIGHTS UNDER POPIA
───────────────────────────────────
You have the right to:
   · Access the personal information we hold about you
   · Request correction of inaccurate information
   · Request deletion of your personal information (subject to legal retention requirements)
   · Object to processing on grounds of legitimate interest
   · Lodge a complaint with the Information Regulator

To exercise any right, contact: hello@creativelynanda.co.za
We will respond within 30 days.

───────────────────────────────────
8. INFORMATION REGULATOR
───────────────────────────────────
If you are unsatisfied with our response, you may contact:
The Information Regulator (South Africa)
Website: www.justice.gov.za/inforeg
Email: inforeg@justice.gov.za
Tel: 010 023 5200

───────────────────────────────────
9. COOKIES & LOCAL STORAGE
───────────────────────────────────
We use browser localStorage to keep your study data on your device. Our analytics providers (Vercel Analytics, PostHog and Google Tag Manager) may set cookies or similar technologies to measure aggregate usage. We do not use third-party advertising networks and we do not sell tracking data.

───────────────────────────────────
10. SECURITY
───────────────────────────────────
We implement appropriate technical and organisational measures to protect personal information against accidental or unlawful access, including encrypted storage (Supabase/HTTPS) and minimal data collection.

───────────────────────────────────
11. CHANGES TO THIS POLICY
───────────────────────────────────
We will notify users of material changes by updating the "Last updated" date. Continued use of the App constitutes acceptance.`;

// ─────────────────────────────────────────────────────────────────────────────

const TERMS = `TERMS OF SERVICE
K53 Drill Master — Mirembe Muse (Pty) Ltd
Last updated: 10 July 2026

───────────────────────────────────
1. PARTIES & ACCEPTANCE
───────────────────────────────────
These Terms govern your use of K53 Drill Master ("the App") operated by Mirembe Muse (Pty) Ltd, a company incorporated in South Africa ("we", "us"). By accessing or using the App, you accept these Terms in full.

───────────────────────────────────
2. DESCRIPTION OF SERVICE
───────────────────────────────────
K53 Drill Master is an educational preparation tool for the South African DLTC learner's licence test. We do not guarantee that use of the App will result in passing the official examination.

───────────────────────────────────
3. ELIGIBILITY
───────────────────────────────────
You must be at least 16 years old to use this App. By using the App, you confirm you meet this requirement.

───────────────────────────────────
4. FREE TIER
───────────────────────────────────
Free accounts receive up to 10 questions per day. First-time users receive 30 days of unlimited access. We reserve the right to modify the free tier limits.

───────────────────────────────────
5. PAID PLANS & PAYMENTS
───────────────────────────────────
a) All payments are processed in South African Rand (ZAR) by Paystack (monthly subscriptions) and PayFast (once-off Bundle and Lifetime payments).
b) Monthly plans renew automatically on the same date each month.
c) You may cancel a monthly subscription at any time; access continues until the end of the current billing period.
d) Lifetime plans are a single one-time payment and do not renew.
e) Refund policy: We do not offer refunds once a plan has been activated and access granted, except where required by the Consumer Protection Act 68 of 2008 (CPA). Where the CPA applies, you have a 5 business day cooling-off period for direct marketing purchases.

───────────────────────────────────
6. ACCEPTABLE USE
───────────────────────────────────
You agree not to:
   · Reproduce, resell, or distribute App content without written permission
   · Reverse engineer or attempt to extract the question database
   · Use automated scripts or bots to access the App
   · Share your account credentials with others

───────────────────────────────────
7. INTELLECTUAL PROPERTY
───────────────────────────────────
Examination questions are derived from publicly available DLTC/SARTSM manuals issued by the South African Department of Transport. App code, design, branding, and original content are proprietary to Mirembe Muse (Pty) Ltd and protected by copyright.

───────────────────────────────────
8. DISCLAIMER OF WARRANTIES
───────────────────────────────────
The App is provided "as is" and "as available". To the maximum extent permitted by South African law, we disclaim all warranties, express or implied, including fitness for a particular purpose.

───────────────────────────────────
9. LIMITATION OF LIABILITY
───────────────────────────────────
To the extent permitted by law, our total liability for any claim arising from use of the App shall not exceed the amount you paid to us in the 3 months preceding the claim. We are not liable for indirect or consequential damages.

───────────────────────────────────
10. GOVERNING LAW
───────────────────────────────────
These Terms are governed by the laws of the Republic of South Africa. Disputes shall be resolved in the courts of the Eastern Cape Division.

───────────────────────────────────
11. CHANGES TO TERMS
───────────────────────────────────
We may update these Terms. We will notify you by email or in-app notice. Continued use after changes constitutes acceptance.

───────────────────────────────────
12. CONTACT
───────────────────────────────────
Mirembe Muse (Pty) Ltd
hello@creativelynanda.co.za
East London, Eastern Cape, South Africa`;

// ─────────────────────────────────────────────────────────────────────────────

const PAIA = `PAIA MANUAL — SECTION 51
Promotion of Access to Information Act 2 of 2000
K53 Drill Master — Mirembe Muse (Pty) Ltd
Last updated: 10 July 2026

───────────────────────────────────
A. CONTACT DETAILS OF INFORMATION OFFICER
───────────────────────────────────
Private Body: Mirembe Muse (Pty) Ltd
Trading as: K53 Drill Master
Registered address: East London, Eastern Cape, South Africa
Information Officer: Nandawula Regine
Email: hello@creativelynanda.co.za
Website: https://k53.creativelynanda.co.za

Note: Mirembe Muse (Pty) Ltd is a small private body. A deputy information officer has not been appointed. All PAIA requests must be directed to the Information Officer above.

───────────────────────────────────
B. GUIDE ON HOW TO EXERCISE RIGHTS
───────────────────────────────────
The South African Human Rights Commission (SAHRC) has compiled a guide describing how to use PAIA. This guide is available from:

South African Human Rights Commission
Website: www.sahrc.org.za
Email: PAIA@sahrc.org.za
Tel: 011 877 3600

───────────────────────────────────
C. RECORDS HELD BY MIREMBE MUSE (PTY) LTD
───────────────────────────────────
The following categories of records are held:

1. SUBSCRIBER & PAYMENT RECORDS
   · Email addresses of registered users
   · Subscription plan and expiry date
   · Payment reference numbers (not card details — these are held solely by our payment providers, Paystack and PayFast)
   · Stored in: Supabase database (servers located in the European Union)

2. AUTHENTICATION RECORDS
   · Email-based magic link authentication logs
   · Retained for 90 days for security purposes
   · Stored in: Supabase authentication service

3. ANALYTICS RECORDS
   · Aggregate (non-personal) usage and page-view data
   · Stored in / processed by: Vercel Analytics, PostHog and Google Tag Manager

4. BUSINESS RECORDS
   · Company registration documents
   · Correspondence and contracts
   · Financial records (retained for 5 years per the Companies Act)
   · Stored in: Secure digital storage (private)

5. RECORDS NOT HELD
   · We do not hold K53 test answers or study progress — this data is stored locally on users' devices only
   · We do not hold payment card details
   · We do not hold biometric information

───────────────────────────────────
D. HOW TO REQUEST ACCESS TO RECORDS
───────────────────────────────────
Step 1: Submit a written request to the Information Officer at hello@creativelynanda.co.za. Your request must include:
   · Your full name and contact details
   · A description of the record(s) you wish to access
   · The form in which you wish to receive the record
   · Proof of identity (South African ID or passport)

Step 2: We will acknowledge your request within 30 days and advise of any applicable fee.

Step 3: We will grant or refuse access within 30 days of receiving the request (extendable by a further 30 days with notice).

Prescribed Form: The SAHRC provides Form C for PAIA access requests. You may use this form or submit your request in writing. Form C is available at www.sahrc.org.za.

───────────────────────────────────
E. GROUNDS FOR REFUSAL OF ACCESS
───────────────────────────────────
We may refuse access to records on the following grounds (PAIA Chapters 4 and 5):
   · Protection of the privacy of a third party
   · Commercial confidentiality
   · Privilege (legal professional privilege)
   · Safety of individuals
   · Research information (prior to publication)
   · Records not held by us

───────────────────────────────────
F. AVAILABILITY OF THIS MANUAL
───────────────────────────────────
This manual is available:
   · On the K53 Drill Master application (this screen)
   · Via email request to hello@creativelynanda.co.za
   · A copy has been submitted to the South African Human Rights Commission

───────────────────────────────────
G. SERVICES & PRODUCTS
───────────────────────────────────
Mirembe Muse (Pty) Ltd provides:
   · K53 Drill Master: educational SaaS application for South African learner's licence preparation
   · Subscription tiers: Free, Monthly, 3-Month Bundle, Lifetime, and Lifetime + PDP (current prices are shown on the in-app pricing page)

───────────────────────────────────
H. INFORMATION REGULATOR
───────────────────────────────────
This manual has been prepared in terms of section 51 of PAIA. The Information Regulator of South Africa oversees compliance with both PAIA and POPIA:

The Information Regulator (South Africa)
JD House, 27 Stiemens Street, Braamfontein, Johannesburg, 2001
Website: www.justice.gov.za/inforeg
Email: inforeg@justice.gov.za`;

// ─────────────────────────────────────────────────────────────────────────────

const DISCLAIMER = `EDUCATIONAL DISCLAIMER
K53 Drill Master — Mirembe Muse (Pty) Ltd
Last updated: 10 July 2026

K53 Drill Master is an independent product and is NOT affiliated with, endorsed by, or officially associated with:
   · The South African Department of Transport
   · The Department of the Licensing, Testing and Registration (DLTC)
   · Any provincial or municipal driving licence testing centre
   · The South African National Roads Agency (SANRAL)
   · Any other government body

CONTENT SOURCES
Questions and content are based on publicly available official materials:
   · The K53 Learner's Manual (as published by the Department of Transport)
   · The South African Road Traffic Signs Manual (SARTSM)
   · The National Road Traffic Act 93 of 1996 and its regulations

Our questions are audited against the official Rules of the Road, the K53 vehicle-controls manual and the SARTSM road-sign standard. While we take care to ensure accuracy, we make no warranty that the content precisely mirrors current official examination content. Learners should always study the official DLTC manuals.

NO PASS GUARANTEE
Use of this application does not guarantee a pass in your official learner's licence examination.

CONTENT ACCURACY
If you believe any question or answer contains an error, please contact us at hello@creativelynanda.co.za and we will review it promptly.`;

// ─────────────────────────────────────────────────────────────────────────────

const DOCS = {
  privacy:    { title: 'Privacy Policy (POPIA)',  content: PRIVACY    },
  terms:      { title: 'Terms of Service',        content: TERMS      },
  paia:       { title: 'PAIA Manual (Section 51)', content: PAIA      },
  disclaimer: { title: 'Disclaimer',              content: DISCLAIMER },
};

// ─────────────────────────────────────────────────────────────────────────────

function LegalModal({ doc, onClose }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 9990, display: 'flex', alignItems: 'flex-end' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: '20px 20px 0 0', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px 14px', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: T.text, fontFamily: T.font }}>{doc.title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: T.dim, fontSize: 26, cursor: 'pointer', lineHeight: 1, padding: '0 2px' }}>×</button>
        </div>
        {/* Body */}
        <div style={{ overflowY: 'auto', padding: '18px 20px 48px', flex: 1, WebkitOverflowScrolling: 'touch' }}>
          <pre style={{ fontFamily: T.font, fontSize: 12.5, color: T.dim, whiteSpace: 'pre-wrap', lineHeight: 1.8, margin: 0 }}>{doc.content}</pre>
        </div>
        {/* Close strip */}
        <div style={{ flexShrink: 0, padding: '12px 20px 20px', borderTop: `1px solid ${T.border}` }}>
          <button onClick={onClose}
            style={{ width: '100%', padding: '12px', background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 12, color: T.text, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: T.font }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Footer() {
  const [openDoc, setOpenDoc] = useState(null);

  return (
    <>
      <div style={{ padding: '28px 20px 36px', borderTop: `1px solid ${T.border}`, textAlign: 'center' }}>
        {/* Built by */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, color: T.dim, fontFamily: T.font, marginBottom: 4, letterSpacing: 0.5, textTransform: 'uppercase' }}>Built by</div>
          <a href="https://creativelynanda.co.za" target="_blank" rel="noopener noreferrer"
            style={{ color: T.gold, fontWeight: 700, fontSize: 14, fontFamily: T.font, textDecoration: 'none', display: 'block', marginBottom: 1 }}>
            Nandawula Kabali-Kagwa
          </a>
          <div style={{ fontSize: 11, color: T.dim, fontFamily: T.font, marginBottom: 10 }}>Mirembe Muse (Pty) Ltd · East London, SA</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
            <a href="https://creativelynanda.co.za" target="_blank" rel="noopener noreferrer"
              style={{ color: T.dim, fontSize: 11, fontFamily: T.font, textDecoration: 'none' }}>
              🌐 creativelynanda.co.za
            </a>
            <a href="mailto:hello@creativelynanda.co.za"
              style={{ color: T.dim, fontSize: 11, fontFamily: T.font, textDecoration: 'none' }}>
              ✉ hello@creativelynanda.co.za
            </a>
          </div>
        </div>

        {/* Legal links */}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '6px 14px', marginBottom: 14 }}>
          {Object.entries(DOCS).map(([key, doc]) => (
            <button key={key} onClick={() => setOpenDoc(key)}
              style={{ background: 'none', border: 'none', color: T.dim, fontSize: 11, cursor: 'pointer', fontFamily: T.font, textDecoration: 'underline', padding: '2px 0' }}>
              {doc.title}
            </button>
          ))}
        </div>

        {/* POPIA / PAIA badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
          <button onClick={() => setOpenDoc('paia')}
            style={{ background: 'rgba(0,122,77,0.08)', border: '1px solid rgba(0,122,77,0.2)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontFamily: T.font }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#4ade80', letterSpacing: 0.5 }}>🔒 PAIA COMPLIANT</span>
          </button>
          <button onClick={() => setOpenDoc('privacy')}
            style={{ background: 'rgba(68,114,202,0.08)', border: '1px solid rgba(68,114,202,0.2)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontFamily: T.font }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#7ca5e8', letterSpacing: 0.5 }}>🛡 POPIA COMPLIANT</span>
          </button>
        </div>

        <div style={{ fontSize: 10, color: T.border, fontFamily: T.font, lineHeight: 1.6 }}>
          © 2026 Mirembe Muse (Pty) Ltd · K53 Drill Master{'\n'}Not affiliated with the SA Dept. of Transport or DLTC
        </div>
      </div>

      {openDoc && <LegalModal doc={DOCS[openDoc]} onClose={() => setOpenDoc(null)} />}
    </>
  );
}
