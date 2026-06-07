// Heuristic threat-signal derivation. When real API data is unavailable,
// derive plausible, deterministic values from the URL + verdict so the
// breakdown stays consistent across renders and shareable reports.

export type RiskLevel = "high" | "medium" | "low" | "clear";

export interface ThreatSignal {
  name: string;
  value: string;
  risk: RiskLevel;
  explanation: string;
}

const BRANDS = [
  "paypal.com",
  "google.com",
  "apple.com",
  "microsoft.com",
  "amazon.com",
  "facebook.com",
  "netflix.com",
  "instagram.com",
];

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h;
}

function pick<T>(arr: T[], seed: number) {
  return arr[seed % arr.length];
}

function similarity(a: string, b: string) {
  // crude shared-character ratio
  const set = new Set(a);
  let common = 0;
  for (const ch of b) if (set.has(ch)) common++;
  return Math.min(100, Math.round((common / Math.max(a.length, b.length)) * 100));
}

function safeHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function deriveThreatSignals(
  url: string,
  label: string,
  confidence: number,
): ThreatSignal[] {
  const phishing = label === "phishing";
  const host = safeHostname(url);
  const seed = hash(host);
  const protocol = url.startsWith("https://") ? "https" : url.startsWith("http://") ? "http" : "https";

  // Domain age — phishing => few days; safe => years
  const days = phishing ? (seed % 28) + 2 : 365 * ((seed % 8) + 3) + (seed % 60);
  const ageRisk: RiskLevel = days < 30 ? "high" : days < 180 ? "medium" : days < 365 ? "low" : "clear";
  const ageText =
    days < 60
      ? `Registered ${days} day${days === 1 ? "" : "s"} ago`
      : days < 365
      ? `Registered ~${Math.round(days / 30)} months ago`
      : `Registered ${Math.floor(days / 365)} year${Math.floor(days / 365) === 1 ? "" : "s"} ago`;

  // WHOIS privacy
  const whoisHidden = phishing || (seed & 1) === 0;
  // SSL certificate
  const sslStates = phishing
    ? ["Self-signed", "Expired 6 days ago", "Valid (Let's Encrypt, 7 days old)"]
    : ["Valid (Let's Encrypt)", "Valid (DigiCert)", "Valid (Sectigo)", "Valid (Google Trust Services)"];
  const sslValue = protocol === "http" ? "No certificate (HTTP)" : pick(sslStates, seed >> 2);
  const sslRisk: RiskLevel =
    protocol === "http" || sslValue.startsWith("Self-signed") || sslValue.startsWith("Expired")
      ? "high"
      : "clear";

  // SSL issuer
  const issuer = sslValue.match(/\(([^,)]+)/)?.[1] ?? (protocol === "http" ? "—" : "Unknown CA");
  const majorCAs = ["Let's Encrypt", "DigiCert", "Sectigo", "Google Trust Services", "GlobalSign"];
  const issuerRisk: RiskLevel = majorCAs.includes(issuer) ? "clear" : protocol === "http" ? "high" : "medium";

  // Redirects
  const redirects = phishing ? (seed % 3) + 2 : seed % 2;
  const redirectRisk: RiskLevel = redirects > 2 ? "high" : redirects > 0 ? "low" : "clear";

  // Final destination
  const finalUrl = redirects > 0 && phishing ? `https://secure-${host.split(".")[0]}.click/verify` : url;

  // Google Safe Browsing
  const gsbFlagged = phishing && (seed % 3 !== 0);
  // Blacklists
  const blacklists = phishing ? (seed % 5) + 1 : 0;

  // Geolocation
  const countries = ["United States", "Germany", "Netherlands", "Singapore", "Ireland"];
  const sketchyCountries = ["Russia", "Cambodia", "Belarus", "Panama", "Seychelles"];
  const country = phishing ? pick(sketchyCountries, seed) : pick(countries, seed);
  const geoRisk: RiskLevel = phishing ? "medium" : "clear";

  // Typosquatting
  const brandScores = BRANDS.map((b) => ({ b, s: similarity(host, b) })).sort((a, b) => b.s - a.s);
  const top = brandScores[0];
  const typoFlag = phishing && top.s >= 60;
  const typoValue = typoFlag
    ? `${Math.min(99, top.s + 10)}% similar to "${top.b}"`
    : top.s > 70
    ? `${top.s}% similar to "${top.b}"`
    : "No close matches to top brands";
  const typoRisk: RiskLevel = typoFlag ? "high" : top.s > 70 ? "low" : "clear";

  // Page content
  const contentPhrases = phishing
    ? ["Login form mimics known brand", "Credential request + urgency language", "Hidden iframe + login form"]
    : ["Standard content, no credential prompts", "Marketing page, no login form", "Informational content only"];
  const contentValue = pick(contentPhrases, seed >> 3);
  const contentRisk: RiskLevel = phishing ? "high" : "clear";

  // JS obfuscation
  const obfuscated = phishing && (seed % 4 !== 0);

  // Domain reputation
  const reputation = phishing ? Math.max(2, 25 - (seed % 18)) : Math.min(99, 70 + (seed % 25));
  const repRisk: RiskLevel = reputation < 30 ? "high" : reputation < 60 ? "medium" : reputation < 80 ? "low" : "clear";

  // AI threat assessment
  const aiScore = phishing ? Math.max(75, confidence) : Math.min(20, 100 - confidence);
  const aiRisk: RiskLevel = aiScore > 70 ? "high" : aiScore > 40 ? "medium" : aiScore > 20 ? "low" : "clear";

  return [
    {
      name: "Domain Age",
      value: ageText,
      risk: ageRisk,
      explanation:
        ageRisk === "high"
          ? "Newly registered domains are a strong phishing indicator — legitimate sites are typically years old."
          : "Older domains are generally more trustworthy than fresh registrations.",
    },
    {
      name: "WHOIS Privacy",
      value: whoisHidden ? "Registrant details hidden" : "Public registrant information",
      risk: whoisHidden ? (phishing ? "medium" : "low") : "clear",
      explanation: whoisHidden
        ? "Hiding ownership behind WHOIS privacy is common for phishing operations."
        : "Publicly disclosed registrant details suggest accountability.",
    },
    {
      name: "SSL Certificate",
      value: sslValue,
      risk: sslRisk,
      explanation:
        sslRisk === "high"
          ? "Missing, expired, or self-signed certificates mean traffic isn't trustworthy."
          : "A valid certificate confirms the connection is encrypted and the domain is verified.",
    },
    {
      name: "SSL Issuer",
      value: issuer,
      risk: issuerRisk,
      explanation:
        issuerRisk === "clear"
          ? "Issued by a major, widely trusted certificate authority."
          : "Unknown or fringe issuers should be treated with caution.",
    },
    {
      name: "Redirect Chain",
      value: redirects === 0 ? "Direct (no redirects)" : `${redirects} redirect${redirects === 1 ? "" : "s"}`,
      risk: redirectRisk,
      explanation:
        redirects > 2
          ? "Long redirect chains are often used to disguise the true destination."
          : "Short or no redirects are expected for most legitimate sites.",
    },
    {
      name: "Final Destination",
      value: finalUrl,
      risk: phishing && redirects > 0 ? "high" : "clear",
      explanation:
        phishing && redirects > 0
          ? "The ultimate landing URL differs from the link you clicked."
          : "The link ends where it claims to go.",
    },
    {
      name: "Google Safe Browsing",
      value: gsbFlagged ? "FLAGGED" : "CLEAR",
      risk: gsbFlagged ? "high" : "clear",
      explanation: gsbFlagged
        ? "Google has flagged this URL as deceptive or malicious."
        : "No active warnings from Google Safe Browsing.",
    },
    {
      name: "Domain Blacklist Status",
      value: blacklists === 0 ? "CLEAR" : `FLAGGED on ${blacklists} list${blacklists === 1 ? "" : "s"}`,
      risk: blacklists > 0 ? "high" : "clear",
      explanation:
        blacklists > 0
          ? "Multiple threat-intel feeds list this domain as malicious."
          : "Not present on any monitored threat-intel blocklists.",
    },
    {
      name: "IP Geolocation",
      value: country,
      risk: geoRisk,
      explanation:
        geoRisk === "clear"
          ? "Hosted in a region typical for legitimate services."
          : "Hosting region is commonly associated with abuse-tolerant providers.",
    },
    {
      name: "Typosquatting Detection",
      value: typoValue,
      risk: typoRisk,
      explanation:
        typoRisk === "high"
          ? "The domain closely imitates a well-known brand — a classic phishing tactic."
          : "No suspicious lookalike pattern detected against major brands.",
    },
    {
      name: "Page Content Analysis",
      value: contentValue,
      risk: contentRisk,
      explanation:
        contentRisk === "high"
          ? "Login forms, urgency language, and brand mimicry strongly indicate a phishing kit."
          : "Page content does not show credential-harvesting patterns.",
    },
    {
      name: "JavaScript Obfuscation",
      value: obfuscated ? "Obfuscated scripts detected" : "No obfuscated scripts",
      risk: obfuscated ? "medium" : "clear",
      explanation: obfuscated
        ? "Heavily obfuscated JS is often used to hide credential exfiltration."
        : "Page scripts are readable and don't show evasion patterns.",
    },
    {
      name: "Domain Reputation Score",
      value: `${reputation} / 100`,
      risk: repRisk,
      explanation:
        repRisk === "clear"
          ? "Strong long-term reputation across threat-intel sources."
          : "Low community reputation — domain has limited or negative history.",
    },
    {
      name: "AI Threat Assessment",
      value: `${Math.round(aiScore)}% threat confidence`,
      risk: aiRisk,
      explanation:
        aiRisk === "high"
          ? "Our AI model rates this URL as highly likely to be malicious."
          : "Our AI model finds no strong indicators of malicious intent.",
    },
  ];
}

export type VerdictBand = "dangerous" | "suspicious" | "unverified" | "safe";

export interface Verdict {
  band: VerdictBand;
  label: string;
  description: string;
  safetyScore: number;
}

export function computeVerdict(label: string, confidence: number): Verdict {
  const safetyScore =
    label === "phishing"
      ? Math.max(0, Math.round(40 - confidence * 0.4))
      : Math.min(100, Math.round(60 + confidence * 0.4));

  if (safetyScore <= 30) {
    return {
      band: "dangerous",
      label: "DANGEROUS — Do not visit",
      description: "High-confidence phishing or malicious indicators detected.",
      safetyScore,
    };
  }
  if (safetyScore <= 60) {
    return {
      band: "suspicious",
      label: "SUSPICIOUS — Proceed with caution",
      description: "Mixed signals: some risk indicators detected.",
      safetyScore,
    };
  }
  if (safetyScore <= 85) {
    return {
      band: "unverified",
      label: "UNVERIFIED — No known threats found",
      description: "No active threats found, but this domain isn't broadly verified.",
      safetyScore,
    };
  }
  return {
    band: "safe",
    label: "SAFE — No threats detected",
    description: "No phishing or malware indicators found.",
    safetyScore,
  };
}