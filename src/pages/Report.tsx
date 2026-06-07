import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ScanResult, type ScanResultData } from "@/components/ScanResult";
import { Footer } from "@/components/Footer";

const Report = () => {
  const { scanId } = useParams<{ scanId: string }>();
  const [data, setData] = useState<ScanResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!scanId) {
        setError("No scan id provided.");
        setLoading(false);
        return;
      }
      const { data: row, error } = await supabase
        .from("scan_history_public" as any)
        .select("id, url, label, confidence, score, explanation, created_at")
        .eq("id", scanId)
        .maybeSingle();
      if (cancelled) return;
      if (error || !row) {
        setError("This report could not be found.");
      } else {
        const r = row as unknown as {
          id: string;
          url: string;
          label: string;
          confidence: number;
          score: number;
          explanation: string | null;
          created_at: string;
        };
        setData({
          id: r.id,
          url: r.url,
          label: r.label,
          confidence: r.confidence,
          score: r.score,
          explanation: r.explanation,
          timestamp: new Date(r.created_at),
        });
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [scanId]);

  return (
    <div className="min-h-screen relative">
      <div className="relative z-10 max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Button asChild variant="ghost" size="sm" className="gap-2">
            <Link to="/">
              <ArrowLeft className="w-4 h-4" />
              Back to scanner
            </Link>
          </Button>
          <span className="text-xs text-muted-foreground font-mono truncate">
            Report #{scanId?.slice(0, 8)}
          </span>
        </div>

        {loading && (
          <div className="glass rounded-2xl p-10 flex items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading report…
          </div>
        )}

        {error && !loading && (
          <div className="glass rounded-2xl p-10 text-center space-y-3">
            <ShieldAlert className="w-10 h-10 mx-auto text-destructive" />
            <h1 className="text-xl font-semibold">Report not found</h1>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button asChild>
              <Link to="/">Run a new scan</Link>
            </Button>
          </div>
        )}

        {data && !loading && <ScanResult result={data} />}
      </div>
      <Footer />
    </div>
  );
};

export default Report;