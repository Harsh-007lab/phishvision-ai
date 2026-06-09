import { useRef, useState } from "react";
import Papa from "papaparse";
import { Link } from "react-router-dom";
import { Upload, Play, Download, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { computeVerdict } from "@/lib/threatSignals";
import { toast } from "@/hooks/use-toast";

interface Props {
  isPro: boolean;
  maxUrls?: number;
}

type Status = "queued" | "scanning" | "done" | "error";

interface Row {
  url: string;
  status: Status;
  score?: number;
  verdict?: string;
}

function normalizeUrl(u: string): string {
  const t = u.trim();
  if (!t) return "";
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

export const BulkScanTab = ({ isPro, maxUrls = 100 }: Props) => {
  const [text, setText] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const fileRef = useRef<HTMLInputElement>(null);

  if (!isPro) {
    return (
      <div className="relative rounded-xl overflow-hidden">
        <div className="pointer-events-none absolute inset-0 backdrop-blur-md bg-background/40 z-10 flex items-center justify-center">
          <div className="text-center space-y-3 p-6 pointer-events-auto">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/15 border border-primary/40">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Bulk scanning is a Pro feature</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Upgrade to Pro to scan up to 100 URLs at once via paste or CSV upload.
            </p>
            <Button asChild className="gap-2">
              <Link to="/pricing"><Sparkles className="w-4 h-4" />Upgrade Now</Link>
            </Button>
          </div>
        </div>
        {/* placeholder content behind blur */}
        <div className="space-y-4 p-6 opacity-60">
          <Textarea rows={6} placeholder={`Paste up to ${maxUrls} URLs, one per line`} disabled />
          <div className="flex gap-2">
            <Button disabled variant="outline" className="gap-2"><Upload className="w-4 h-4" />Upload CSV</Button>
            <Button disabled className="gap-2"><Play className="w-4 h-4" />Scan All</Button>
          </div>
        </div>
      </div>
    );
  }

  const urlList = text
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const charCount = text.length;
  const overLimit = urlList.length > maxUrls;

  const handleCsv = (file: File) => {
    Papa.parse<string[]>(file, {
      complete: (res) => {
        const urls = (res.data as any[])
          .map((row) => Array.isArray(row) ? row[0] : row)
          .filter((v) => typeof v === "string" && v.trim())
          .slice(0, maxUrls);
        setText(urls.join("\n"));
        toast({ title: "CSV loaded", description: `${urls.length} URLs ready to scan.` });
      },
      error: () => toast({ title: "CSV error", description: "Could not parse the CSV.", variant: "destructive" }),
    });
  };

  const runScans = async () => {
    if (urlList.length === 0) {
      toast({ title: "No URLs", description: "Add URLs first.", variant: "destructive" });
      return;
    }
    if (overLimit) {
      toast({ title: "Too many URLs", description: `Max ${maxUrls} per batch.`, variant: "destructive" });
      return;
    }
    const initial: Row[] = urlList.map((url) => ({ url: normalizeUrl(url), status: "queued" }));
    setRows(initial);
    setRunning(true);
    setProgress({ done: 0, total: initial.length });

    for (let i = 0; i < initial.length; i++) {
      setRows((prev) => prev.map((r, idx) => idx === i ? { ...r, status: "scanning" } : r));
      try {
        const { data, error } = await supabase.functions.invoke("phishing-detector", {
          body: { url: initial[i].url, includeExplanation: false },
        });
        if (error) throw error;
        const v = computeVerdict(data.label, data.confidence);
        setRows((prev) => prev.map((r, idx) => idx === i ? {
          ...r, status: "done", score: v.safetyScore, verdict: v.band,
        } : r));
      } catch {
        setRows((prev) => prev.map((r, idx) => idx === i ? { ...r, status: "error" } : r));
      }
      setProgress((p) => ({ ...p, done: i + 1 }));
    }
    setRunning(false);
    toast({ title: "Bulk scan complete", description: `Scanned ${initial.length} URLs.` });
  };

  const exportCsv = () => {
    const csv = Papa.unparse(
      rows.map((r) => ({ url: r.url, threat_score: r.score ?? "", verdict: r.verdict ?? "", status: r.status })),
    );
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `phishvision-bulk-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const verdictVariant = (v?: string) =>
    v === "DANGEROUS" ? "destructive" : v === "SAFE" ? "default" : "secondary";

  return (
    <div className="space-y-4">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder={`Paste up to ${maxUrls} URLs, one per line`}
        className="font-mono text-sm"
        disabled={running}
      />
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{urlList.length} URL{urlList.length === 1 ? "" : "s"} · {charCount} chars</span>
        {overLimit && <span className="text-destructive">Over limit ({maxUrls} max)</span>}
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleCsv(e.target.files[0])}
        />
        <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={running} className="gap-2">
          <Upload className="w-4 h-4" /> Upload CSV
        </Button>
        <Button onClick={runScans} disabled={running || urlList.length === 0 || overLimit} className="gap-2">
          <Play className="w-4 h-4" /> {running ? "Scanning..." : "Scan All"}
        </Button>
        {rows.length > 0 && !running && (
          <Button variant="outline" onClick={exportCsv} className="gap-2 ml-auto">
            <Download className="w-4 h-4" /> Export results as CSV
          </Button>
        )}
      </div>

      {progress.total > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Scanning {progress.done} of {progress.total} URLs...</span>
            <span>{Math.round((progress.done / progress.total) * 100)}%</span>
          </div>
          <Progress value={(progress.done / progress.total) * 100} />
        </div>
      )}

      {rows.length > 0 && (
        <div className="glass rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead className="text-right">Threat Score</TableHead>
                <TableHead>Verdict</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r, i) => (
                <TableRow key={i}>
                  <TableCell className="font-mono text-xs max-w-xs truncate">{r.url}</TableCell>
                  <TableCell className="text-right">{r.score ?? "—"}</TableCell>
                  <TableCell>
                    {r.verdict ? <Badge variant={verdictVariant(r.verdict) as any}>{r.verdict}</Badge> : "—"}
                  </TableCell>
                  <TableCell className="capitalize text-xs text-muted-foreground">{r.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};