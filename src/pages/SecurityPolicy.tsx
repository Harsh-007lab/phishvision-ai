import { LegalLayout } from "@/components/LegalLayout";
import { Link } from "react-router-dom";

const SecurityPolicy = () => (
  <LegalLayout
    title="Security Policy"
    subtitle="Responsible disclosure guidelines for PhishVision AI"
  >
    <p>
      We take the security of PhishVision AI seriously. If you believe you have found a vulnerability, we want to hear
      from you, and we will work with you to investigate and remediate it.
    </p>

    <h2>Reporting a vulnerability</h2>
    <p>
      Please email <a href="mailto:security@phishvision.ai">security@phishvision.ai</a> with:
    </p>
    <ul>
      <li>A clear description of the issue and the impact.</li>
      <li>Step-by-step reproduction instructions or a proof-of-concept.</li>
      <li>Any relevant logs, screenshots, or sample payloads.</li>
      <li>Your preferred name and contact info (for acknowledgement).</li>
    </ul>
    <p>
      You can also reach us via the contact details in our{" "}
      <a href="/.well-known/security.txt">security.txt</a> file.
    </p>

    <h2>Our commitment to you</h2>
    <ul>
      <li><strong>Acknowledge</strong> your report within <strong>48 hours</strong>.</li>
      <li><strong>Triage</strong> and validate the issue within <strong>5 business days</strong>.</li>
      <li><strong>Resolve critical issues</strong> within <strong>14 days</strong> of validation, and high-severity issues within 30 days.</li>
      <li>Keep you informed of progress throughout remediation.</li>
      <li>Publicly credit you (with your permission) on our{" "}
        <Link to="/hall-of-fame">Hall of Fame</Link> once the issue is fixed.
      </li>
      <li>Not pursue legal action against researchers who act in good faith and follow this policy.</li>
    </ul>

    <h2>What NOT to do</h2>
    <ul>
      <li>Do <strong>not</strong> run automated scans or load-tests against production systems.</li>
      <li>Do <strong>not</strong> access, modify, or destroy data that does not belong to you.</li>
      <li>Do <strong>not</strong> perform social engineering against our staff, customers, or vendors.</li>
      <li>Do <strong>not</strong> publish or disclose the vulnerability before we have had a reasonable opportunity to fix it.</li>
      <li>Do <strong>not</strong> use vulnerabilities to pivot into other systems or escalate access.</li>
    </ul>

    <h2>Scope</h2>
    <p>The following domains and assets are in scope:</p>
    <ul>
      <li><code>phishvision.ai</code> and all subdomains</li>
      <li>Our public REST API endpoints</li>
      <li>The PhishVision AI browser extension</li>
    </ul>
    <p>
      Third-party services we depend on (e.g. our cloud provider, payment processor) are out of scope — please report
      issues with those services directly to the relevant vendor.
    </p>

    <h2>Safe harbor</h2>
    <p>
      We consider security research conducted under this policy to be authorized, and will not initiate or recommend
      legal action related to your research. If a third party initiates legal action against you for activity that
      complied with this policy, we will make this authorization known.
    </p>
  </LegalLayout>
);

export default SecurityPolicy;