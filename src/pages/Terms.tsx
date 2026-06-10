import { LegalLayout } from "@/components/LegalLayout";

const Terms = () => (
  <LegalLayout title="Terms of Service" subtitle="Effective date: January 1, 2026">
    <p>
      These Terms of Service ("Terms") govern your use of PhishVision AI. By accessing or using the service, you agree
      to be bound by these Terms. If you do not agree, do not use the service.
    </p>

    <h2>1. Acceptable use</h2>
    <p>
      You may use PhishVision AI to analyze URLs you have a legitimate reason to investigate — for example, links you
      received via email, messages, or social platforms, or links found on websites you operate. You must not scan
      URLs that you have been explicitly instructed not to access.
    </p>

    <h2>2. Prohibited use</h2>
    <ul>
      <li>Do not use PhishVision AI to scan internal, private, or otherwise non-public networks (RFC1918 addresses, intranet hostnames, etc.).</li>
      <li>Do not use the service to evade, bypass, or test the effectiveness of security tools deployed by other organizations without authorization.</li>
      <li>Do not use the service to host, distribute, or facilitate phishing, malware, or other illegal content.</li>
      <li>Do not attempt to reverse engineer, scrape at scale, or otherwise abuse our APIs beyond the documented rate limits.</li>
      <li>Do not use the service in violation of any applicable law or regulation.</li>
    </ul>

    <h2>3. Disclaimer of accuracy</h2>
    <p>
      Scan results are <strong>informational only</strong>. PhishVision AI uses heuristic and AI-based detection that
      can produce false positives and false negatives. A "safe" verdict is not a guarantee that a URL is safe, and a
      "dangerous" verdict is not a definitive determination of criminal activity. Always exercise your own judgment
      before clicking, entering credentials, or transferring funds.
    </p>

    <h2>4. Accounts</h2>
    <p>
      You are responsible for safeguarding your account credentials and for all activity that occurs under your
      account. Notify us immediately at <a href="mailto:security@phishvision.ai">security@phishvision.ai</a> if you
      suspect unauthorized access.
    </p>

    <h2>5. Limitation of liability</h2>
    <p>
      To the maximum extent permitted by law, PhishVision AI and its operators shall not be liable for any indirect,
      incidental, special, consequential, or punitive damages, or any loss of profits or revenues, arising out of your
      use of (or inability to use) the service. Our total aggregate liability for any claim shall not exceed the
      amount you paid us in the 12 months preceding the claim, or USD $100, whichever is greater.
    </p>

    <h2>6. Account termination</h2>
    <p>
      We may suspend or terminate your account at any time if we reasonably believe you have violated these Terms,
      including but not limited to abuse of the service, fraudulent payment activity, or use that endangers the
      integrity of the platform. You may terminate your account at any time from your dashboard.
    </p>

    <h2>7. Changes to the service</h2>
    <p>
      We may modify, suspend, or discontinue features of the service at any time. We will provide reasonable notice of
      material changes that affect paying customers.
    </p>

    <h2>8. Governing law</h2>
    <p>
      These Terms are governed by the laws of the State of Delaware, United States, without regard to its conflict of
      law provisions. Any disputes shall be resolved in the state or federal courts located in Delaware.
    </p>

    <h2>9. Contact</h2>
    <p>Questions about these Terms? Email <a href="mailto:hello@phishvision.ai">hello@phishvision.ai</a>.</p>
  </LegalLayout>
);

export default Terms;