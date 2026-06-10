import { LegalLayout } from "@/components/LegalLayout";

const Privacy = () => (
  <LegalLayout title="Privacy Policy" subtitle="Effective date: January 1, 2026">
    <p>
      PhishVision AI ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains what
      information we collect, how we use it, and the choices you have. By using PhishVision AI you agree to the
      practices described below.
    </p>

    <h2>1. Information we collect</h2>
    <ul>
      <li><strong>URLs you submit</strong> for scanning, along with derived metadata (domain, registration date, hosting signals).</li>
      <li><strong>Account information</strong> — your email address and an encrypted password hash if you create an account.</li>
      <li><strong>Scan history</strong> tied to your account, including verdicts, threat scores, and signal explanations.</li>
      <li><strong>Basic analytics</strong> — aggregated, non-identifying usage metrics such as page views, browser type, and approximate region.</li>
    </ul>

    <h2>2. How we use information</h2>
    <ul>
      <li>To deliver scan results and display your scan history.</li>
      <li>To improve our phishing detection models and reduce false positives.</li>
      <li>To send essential account emails (password resets, security notices, and plan changes).</li>
      <li>To monitor abuse and enforce rate limits.</li>
    </ul>

    <h2>3. What we do NOT do</h2>
    <ul>
      <li>We do <strong>not</strong> sell your data to anyone, ever.</li>
      <li>We do <strong>not</strong> share submitted URLs with third-party advertisers.</li>
      <li>We do <strong>not</strong> use the URLs you scan to build advertising or marketing profiles.</li>
      <li>We do <strong>not</strong> use third-party tracking pixels or cross-site advertising cookies.</li>
    </ul>

    <h2>4. Data retention</h2>
    <ul>
      <li><strong>Free accounts:</strong> scan history is retained for 30 days, then automatically purged.</li>
      <li><strong>Pro / Team accounts:</strong> scan history is retained for the lifetime of your account.</li>
      <li><strong>Account data:</strong> retained until you request deletion. After deletion, residual backups expire within 30 days.</li>
    </ul>

    <h2>5. Your rights</h2>
    <p>You may at any time:</p>
    <ul>
      <li>Access a copy of the personal data we hold about you.</li>
      <li>Export your scan history as JSON or CSV from your dashboard.</li>
      <li>Request permanent deletion of your account and associated data.</li>
      <li>Correct any inaccurate personal information.</li>
    </ul>
    <p>To exercise any of these rights, email <a href="mailto:privacy@phishvision.ai">privacy@phishvision.ai</a>.</p>

    <h2>6. Cookies</h2>
    <p>
      We use only <strong>functional cookies</strong> required to keep you signed in and remember your theme and
      language preferences. We do not use advertising, tracking, or cross-site cookies.
    </p>

    <h2>7. Security</h2>
    <p>
      All traffic is served over HTTPS. Passwords are hashed with industry-standard algorithms. Your scan history is
      protected by row-level security so only you can read it.
    </p>

    <h2>8. Changes to this policy</h2>
    <p>
      We may update this policy from time to time. Material changes will be announced via email or an in-app banner at
      least 14 days before they take effect.
    </p>

    <h2>9. Contact</h2>
    <p>Questions? Email <a href="mailto:privacy@phishvision.ai">privacy@phishvision.ai</a>.</p>
  </LegalLayout>
);

export default Privacy;