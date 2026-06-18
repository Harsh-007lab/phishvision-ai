import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, RefreshCw, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ThreatEntry {
  brand: string;
  attack: string;
  scans: number;
  hoursAgo: number;
}

const MOCK: ThreatEntry[] = [
  { brand: "PayPal", attack: "Credential harvesting", scans: 47, hoursAgo: 2 },
  { brand: "DHL", attack: "Fake delivery notification", scans: 23, hoursAgo: 5 },
  { brand: "Microsoft 365", attack: "Login impersonation", scans: 89, hoursAgo: 8 },
  { brand: "Netflix", attack: "Billing failure scam", scans: 31, hoursAgo: 11 },
  { brand: "Amazon", attack: "Order confirmation lookalike", scans: 56, hoursAgo: 14 },
  { brand: "Chase Bank", attack: "Account verification phish", scans: 18, hoursAgo: 17 },
  { brand: "Apple iCloud", attack: "Storage full credential theft", scans: 42, hoursAgo: 20 },
  { brand: "LinkedIn", attack: "Job offer credential capture", scans: 27, hoursAgo: 23 },
];

export const LiveThreatFeed = () => {
  const [updatedAt, setUpdatedAt] = useState<Date>(new Date());
  const [, force] = useState(0);

  // re-render minute counter every minute
  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const minutesAgo = Math.max(0, Math.floor((Date.now() - updatedAt.getTime()) / 60_000));

  return (
    <section className="w-full max-w-5xl mx-auto px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-destructive/30 bg-destructive/5 text-xs font-medium text-destructive mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
          Live feed
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
          Phishing campaigns detected in the last 24 hours
        </h2>
        <p className="text-muted-foreground">
          Aggregated, anonymised intelligence from our global scan network.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card/60 backdrop-blur overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border/60 bg-background/40">
          <div className="flex items-center gap-2 text-sm">
            <Activity className="w-4 h-4 text-primary" />
            <span className="font-medium">Latest detections</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>
              Updated {minutesAgo === 0 ? "just now" : `${minutesAgo} min${minutesAgo === 1 ? "" : "s"} ago`}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 gap-1"
              onClick={() => setUpdatedAt(new Date())}
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </Button>
          </div>
        </div>

        <ul className="divide-y divide-border/40">
          {MOCK.map((t, i) => (
            <motion.li
              key={`${t.brand}-${i}`}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-4 px-5 py-3 hover:bg-muted/20 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-4 h-4 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {t.brand} — <span className="text-muted-foreground">{t.attack}</span>
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  {t.scans} scans flagged this URL family
                </div>
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                {t.hoursAgo}h ago
              </div>
            </motion.li>
          ))}
        </ul>

        <div className="px-5 py-3 border-t border-border/40 text-[11px] text-muted-foreground text-center">
          All URLs are anonymised. We never display full phishing URLs publicly.
        </div>
      </div>
    </section>
  );
};
