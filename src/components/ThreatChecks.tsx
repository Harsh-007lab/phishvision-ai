import {
  CalendarClock,
  EyeOff,
  Lock,
  GitBranch,
  ShieldCheck,
  ListX,
  Globe2,
  SpellCheck,
  Image as ImageIcon,
  FileSearch,
  Code2,
  BadgeCheck,
  Gauge,
  BrainCircuit,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";

interface Signal {
  icon: LucideIcon;
  name: string;
  description: string;
}

const signals: Signal[] = [
  { icon: CalendarClock, name: "Domain Age", description: "Newly registered domains (< 30 days) account for over 72% of phishing sites. We flag them immediately." },
  { icon: EyeOff, name: "WHOIS Privacy", description: "Legitimate businesses rarely hide their registrant details. Concealed WHOIS is a red flag." },
  { icon: Lock, name: "SSL Certificate", description: "We verify not just that HTTPS exists, but that the certificate is valid, trusted, and not expired or self-signed." },
  { icon: GitBranch, name: "Redirect Chain", description: "Phishing sites use redirect chains to hide their true destination. We follow every hop and expose the final URL." },
  { icon: ShieldCheck, name: "Google Safe Browsing", description: "We cross-reference against Google's threat database, updated hourly." },
  { icon: ListX, name: "Domain Blacklist", description: "We query 15+ malware and phishing blacklists simultaneously." },
  { icon: Globe2, name: "IP Geolocation", description: "We identify the hosting country and flag known high-risk hosting providers." },
  { icon: SpellCheck, name: "Typosquatting Detection", description: "We detect URLs designed to look like trusted brands — paypa1.com, g00gle.com, and thousands of variations." },
  { icon: ImageIcon, name: "Visual Similarity (AI)", description: "Our AI compares the site's visual design against 1,000+ brand reference screenshots to catch visual impersonation." },
  { icon: FileSearch, name: "Page Content Analysis", description: "We detect credential-harvesting forms, urgency language, and fake login pages." },
  { icon: Code2, name: "JavaScript Obfuscation", description: "We flag heavily obfuscated JavaScript — a hallmark of malicious payload delivery." },
  { icon: BadgeCheck, name: "SSL Issuer Reputation", description: "We check not just that an SSL cert exists, but whether the issuer is trusted." },
  { icon: Gauge, name: "Domain Reputation Score", description: "A composite score based on historical threat data, user reports, and age." },
  { icon: BrainCircuit, name: "AI Threat Model", description: "Our trained model gives a final confidence score, catching zero-day threats that blacklists haven't seen yet." },
];

export const ThreatChecks = () => (
  <section id="features" className="w-full max-w-6xl mx-auto px-4 py-12">
    <div className="text-center mb-10">
      <p className="text-sm font-medium text-primary uppercase tracking-wider mb-2">What we check</p>
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
        14 signals analyzed on every scan
      </h2>
      <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
        Every URL is run through a layered set of heuristic, reputation, and AI checks. Here's exactly what we look at.
      </p>
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      {signals.map((s, i) => {
        const Icon = s.icon;
        return (
          <motion.div
            key={s.name}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: (i % 6) * 0.05, duration: 0.35 }}
            className="flex gap-4 p-5 rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm hover:border-primary/40 transition-colors"
          >
            <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base mb-1">{s.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  </section>
);