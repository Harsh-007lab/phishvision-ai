import { motion } from "framer-motion";
import { Shield, TrendingUp, Activity, Calendar } from "lucide-react";

interface Scan {
  scanned_at: string;
  verdict: "safe" | "suspicious" | "dangerous" | "unverified";
}

export const ProtectionStats = ({ scans }: { scans: Scan[] }) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const scansThisMonth = scans.filter((s) => new Date(s.scanned_at) >= startOfMonth);
  const threatsBlocked = scansThisMonth.filter(
    (s) => s.verdict === "dangerous" || s.verdict === "suspicious"
  ).length;
  const total = scans.length;

  const dangerRatio = total > 0 ? threatsBlocked / scansThisMonth.length : 0;
  const risk =
    dangerRatio === 0 ? "Low" : dangerRatio < 0.15 ? "Low" : dangerRatio < 0.35 ? "Medium" : "High";
  const riskColor =
    risk === "Low" ? "text-success" : risk === "Medium" ? "text-amber-500" : "text-destructive";

  // active days = unique calendar days with a scan
  const uniqueDays = new Set(scans.map((s) => s.scanned_at.slice(0, 10)));
  const activeDays = uniqueDays.size;

  const items = [
    { icon: Shield, label: "Threats blocked this month", value: threatsBlocked, color: "text-destructive" },
    { icon: Activity, label: "Total URLs scanned", value: total, color: "text-primary" },
    { icon: TrendingUp, label: "Your risk profile", value: risk, color: riskColor },
    { icon: Calendar, label: "Days active", value: activeDays, color: "text-accent" },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-4 sm:p-6 space-y-5 border border-primary/20"
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-semibold">Your protection stats</h2>
          <p className="text-sm text-muted-foreground">Personal threat intelligence at a glance.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((it) => (
          <div key={it.label} className="rounded-xl border border-border bg-card/50 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <it.icon className="w-3.5 h-3.5" /> {it.label}
            </div>
            <div className={`font-mono text-2xl font-bold ${it.color}`}>{it.value}</div>
          </div>
        ))}
      </div>

      {threatsBlocked > 0 && (
        <div className="rounded-xl border border-success/30 bg-success/5 p-4 text-sm">
          <span className="font-semibold text-success">Nice work.</span>{" "}
          You've protected yourself from an estimated{" "}
          <span className="font-bold text-foreground">{threatsBlocked}</span>{" "}
          credential-theft attempt{threatsBlocked === 1 ? "" : "s"} this month.
        </div>
      )}
    </motion.section>
  );
};
