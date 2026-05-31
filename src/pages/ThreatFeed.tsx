import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldAlert, ShieldCheck, ArrowLeft, RefreshCw, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface ScanRecord {
  id: string;
  url: string;
  label: string;
  confidence: number;
  score: number;
  created_at: string;
}

const ThreatFeed = () => {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "phishing" | "safe">("all");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("scan_history")
      .select("id, url, label, confidence, score, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    setScans(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("threat-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "scan_history" },
        (payload) => {
          setScans((prev) => [payload.new as ScanRecord, ...prev].slice(0, 100));
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered = scans.filter((s) =>
    filter === "all" ? true : s.label === filter,
  );

  const phishingCount = scans.filter((s) => s.label === "phishing").length;
  const safeCount = scans.filter((s) => s.label === "safe").length;

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-destructive/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -100, 0], y: [0, -50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Button asChild variant="ghost" size="sm" className="gap-2">
            <Link to="/"><ArrowLeft className="w-4 h-4" />Back</Link>
          </Button>
          <Button variant="outline" size="sm" onClick={load} className="gap-2">
            <RefreshCw className="w-4 h-4" />Refresh
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs">
            <Activity className="w-3 h-3 text-primary animate-pulse" />
            <span>Live Feed</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Public Threat Feed
          </h1>
          <p className="text-sm text-muted-foreground">
            Latest URL scans from the PhishVision community in real time.
          </p>
        </motion.div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="glass rounded-2xl p-4 text-center">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{scans.length}</p>
          </div>
          <div className="glass rounded-2xl p-4 text-center">
            <p className="text-xs text-muted-foreground">Phishing</p>
            <p className="text-2xl font-bold text-destructive">{phishingCount}</p>
          </div>
          <div className="glass rounded-2xl p-4 text-center">
            <p className="text-xs text-muted-foreground">Safe</p>
            <p className="text-2xl font-bold text-success">{safeCount}</p>
          </div>
        </div>

        <div className="flex gap-2 justify-center">
          {(["all", "phishing", "safe"] as const).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f}
            </Button>
          ))}
        </div>

        <div className="glass rounded-2xl p-4 sm:p-6 space-y-2 min-w-0 overflow-hidden">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-secondary rounded animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No scans found.</p>
          ) : (
            filtered.map((s, idx) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg bg-secondary/50 border border-border hover:bg-secondary/70 transition-colors gap-2 sm:gap-4 min-w-0"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {s.label === "phishing" ? (
                    <ShieldAlert className="w-5 h-5 text-destructive flex-shrink-0" />
                  ) : (
                    <ShieldCheck className="w-5 h-5 text-success flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-xs sm:text-sm font-mono truncate"
                      title={s.url}
                    >
                      {s.url}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(s.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <span
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                      s.label === "phishing"
                        ? "bg-destructive/20 text-destructive"
                        : "bg-success/20 text-success"
                    }`}
                  >
                    {s.label === "phishing" ? "Phishing" : "Safe"}
                  </span>
                  <span className="text-sm font-bold tabular-nums">
                    {s.confidence}%
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreatFeed;