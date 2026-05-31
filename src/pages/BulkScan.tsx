import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, Play, Download, ShieldAlert, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Result {
  url: string;
  label?: "phishing" | "safe";
  confidence?: number;
  error?: string;
  status: "pending" | "done" | "error";
}

const MAX_URLS = 50;

const parseUrls = (text: string): string[] => {
  return Array.from(
    new Set(
      text
        .split(/[\s,;\n]+/)
        .map((u) => u.trim())
        .filter(Boolean),
    ),
  ).slice(0, MAX_URLS);
};

const BulkScan = () => {
  const [text, setText] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const onFile = async (file: File) => {
    const content = await file.text();
    setText((prev) => (prev ? prev + "\n" + content : content));
  };

  const run = async () => {
    const urls = parseUrls(text);
    if (urls.length === 0) {
      toast({ title: "No URLs found", description: "Paste or upload URLs first." });
      return;
    }
    setRunning(true);
    setProgress(0);
    const initial: Result[] = urls.map((u) => ({ url: u, status: "pending" }));
    setResults(initial);

    for (let i = 0; i < urls.length; i++) {
      try {
        const { data, error } = await supabase.functions.invoke("phishing-detector", {
          body: { url: urls[i], includeExplanation: false },
        });
        if (error) throw error;
        setResults((prev) => {
          const next = [...prev];
          next[i] = {
            url: urls[i],
            label: data.label,
            confidence: data.confidence,
            status: "done",
          };
          return next;
        });
      } catch (e: any) {
        setResults((prev) => {
          const next = [...prev];
          next[i] = { url: urls[i], error: e?.message || "Error", status: "error" };
          return next;
        });
      }
      setProgress(Math.round(((i + 1) / urls.length) * 100));
    }
    setRunning(false);
    toast({ title: "Bulk scan complete", description: `Scanned ${urls.length} URL${urls.length === 1 ? "" : "s"}.` });
  };

  const exportCsv = () => {
    const rows = [
      ["url", "label", "confidence", "error"].join(","),
      ...results.map((r) =>
        [r.url, r.label ?? "", r.confidence ?? "", r.error ?? ""].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");
    const blob = new Blob([rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bulk-scan-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const phishing = results.filter((r) => r.label === "phishing").length;
  const safe = results.filter((r) => r.label === "safe").length;

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        <div className="flex items-center justify-between">
          <Button asChild variant="ghost" size="sm" className="gap-2">
            <Link to="/"><ArrowLeft className="w-4 h-4" />Back</Link>
          </Button>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Bulk URL Scanner
          </h1>
          <p className="text-sm text-muted-foreground">
            Paste up to {MAX_URLS} URLs or upload a .txt/.csv file. Results stream in real time.
          </p>
        </motion.div>

        <div className="glass rounded-2xl p-4 sm:p-6 space-y-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={"https://example.com\nhttps://another.com"}
            className="min-h-[160px] font-mono text-sm"
            disabled={running}
          />
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex">
              <input
                type="file"
                accept=".txt,.csv,text/plain,text/csv"
                hidden
                onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
              />
              <Button asChild variant="outline" size="sm" className="gap-2 cursor-pointer">
                <span><Upload className="w-4 h-4" />Upload .txt / .csv</span>
              </Button>
            </label>
            <Button onClick={run} disabled={running} className="gap-2">
              {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {running ? "Scanning…" : "Run scan"}
            </Button>
            {results.length > 0 && !running && (
              <Button variant="outline" size="sm" onClick={exportCsv} className="gap-2">
                <Download className="w-4 h-4" />Export CSV
              </Button>
            )}
            <p className="text-xs text-muted-foreground ml-auto">
              {parseUrls(text).length}/{MAX_URLS} URLs
            </p>
          </div>
          {running && <Progress value={progress} className="h-2" />}
        </div>

        {results.length > 0 && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="glass rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-xl font-bold">{results.length}</p>
              </div>
              <div className="glass rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground">Phishing</p>
                <p className="text-xl font-bold text-destructive">{phishing}</p>
              </div>
              <div className="glass rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground">Safe</p>
                <p className="text-xl font-bold text-success">{safe}</p>
              </div>
            </div>

            <div className="glass rounded-2xl p-4 sm:p-6 space-y-2 min-w-0">
              {results.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40 border border-border min-w-0"
                >
                  {r.status === "pending" ? (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground flex-shrink-0" />
                  ) : r.label === "phishing" ? (
                    <ShieldAlert className="w-4 h-4 text-destructive flex-shrink-0" />
                  ) : r.label === "safe" ? (
                    <ShieldCheck className="w-4 h-4 text-success flex-shrink-0" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <p className="text-xs sm:text-sm font-mono truncate flex-1 min-w-0" title={r.url}>{r.url}</p>
                  {r.status === "done" && r.label && (
                    <>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${r.label === "phishing" ? "bg-destructive/20 text-destructive" : "bg-success/20 text-success"}`}>
                        {r.label}
                      </span>
                      <span className="text-xs font-bold tabular-nums w-12 text-right">{r.confidence}%</span>
                    </>
                  )}
                  {r.status === "error" && (
                    <span className="text-xs text-destructive truncate max-w-[200px]">{r.error}</span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BulkScan;